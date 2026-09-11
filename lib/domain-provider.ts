export type DomainStatus = "registered" | "unregistered" | "unknown";
export type DomainResult = { name: string; status: DomainStatus; source: "rdap" | "inet" | "vnnic"; lookupUrl?: string };
export interface DomainProvider { search(baseName: string, tlds: string[]): Promise<DomainResult[]> }

const VNNIC_LOOKUP = "https://www.vnnic.vn/whois-information/";

type Bootstrap = { services?: Array<[string[], string[]]> };
let bootstrapPromise: Promise<Bootstrap> | undefined;

function getBootstrap() {
  bootstrapPromise ??= fetch("https://data.iana.org/rdap/dns.json", {
    next: { revalidate: 86400 },
    signal: AbortSignal.timeout(8000),
  }).then((response) => {
    if (!response.ok) throw new Error(`IANA bootstrap HTTP ${response.status}.`);
    return response.json() as Promise<Bootstrap>;
  });
  return bootstrapPromise;
}

async function checkRdap(name: string): Promise<DomainResult> {
  try {
    const tld = name.split(".").at(-1);
    const bootstrap = await getBootstrap();
    const service = bootstrap.services?.find(([tlds]) => Boolean(tld && tlds.includes(tld)));
    const baseUrl = service?.[1]?.[0];
    if (!baseUrl) return { name, status: "unknown", source: "rdap" };
    const response = await fetch(`${baseUrl.replace(/\/$/, "")}/domain/${encodeURIComponent(name)}`, {
      redirect: "follow",
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
      headers: { Accept: "application/rdap+json, application/json" },
    });
    if (response.ok) return { name, status: "registered", source: "rdap" };
    if (response.status === 404) return { name, status: "unregistered", source: "rdap" };
  } catch { /* An outage is not evidence that a domain is available. */ }
  return { name, status: "unknown", source: "rdap" };
}

const publicLookupProvider: DomainProvider = {
  async search(baseName, tlds) {
    return Promise.all(tlds.map((tld) => {
      const name = `${baseName}${tld}`;
      if (tld.endsWith(".vn")) {
        return Promise.resolve({ name, status: "unknown", source: "vnnic", lookupUrl: VNNIC_LOOKUP } as DomainResult);
      }
      return checkRdap(name);
    }));
  },
};

function readAvailability(payload: unknown): boolean {
  if (typeof payload === "boolean") return payload;
  if (!payload || typeof payload !== "object") throw new Error("Invalid iNET response.");
  const value = payload as Record<string, unknown>;
  for (const key of ["available", "isAvailable", "result", "data"]) {
    const candidate = value[key];
    if (typeof candidate === "boolean") return candidate;
    if (candidate && typeof candidate === "object") {
      try { return readAvailability(candidate); } catch { /* try next shape */ }
    }
  }
  const status = String(value.status ?? value.domainStatus ?? "").toLowerCase();
  if (["available", "free", "not_found", "notfound"].includes(status)) return true;
  if (["registered", "unavailable", "active", "found"].includes(status)) return false;
  throw new Error("Unknown iNET availability response.");
}

const inetResellerProvider: DomainProvider = {
  async search(baseName, tlds) {
    const token = process.env.INET_API_TOKEN ?? process.env.INET_API_KEY;
    if (!token) throw new Error("Missing INET_API_TOKEN.");
    const baseUrl = (process.env.INET_API_BASE_URL || "https://dms.inet.vn").replace(/\/$/, "");
    return Promise.all(tlds.map(async (tld) => {
      const name = `${baseName}${tld}`;
      try {
        const response = await fetch(`${baseUrl}/api/rms/v1/domain/checkavailable`, {
          method: "POST",
          headers: { "Content-Type": "application/json", token },
          body: JSON.stringify({ name }),
          cache: "no-store",
          signal: AbortSignal.timeout(8000),
        });
        if (!response.ok) throw new Error(`iNET HTTP ${response.status}.`);
        return { name, status: readAvailability(await response.json()) ? "unregistered" : "registered", source: "inet" } as DomainResult;
      } catch {
        return { name, status: "unknown", source: "inet" } as DomainResult;
      }
    }));
  },
};

export function getDomainProvider(): DomainProvider {
  return process.env.INET_MODE === "live" ? inetResellerProvider : publicLookupProvider;
}
