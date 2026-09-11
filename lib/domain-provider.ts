export type DomainResult = {
  name: string;
  available: boolean;
  price?: number;
  currency: "VND";
};

export interface DomainProvider {
  search(baseName: string, tlds: string[]): Promise<DomainResult[]>;
}

const MOCK_PRICES: Record<string, number> = {
  ".vn": 490000,
  ".com": 320000,
  ".com.vn": 280000,
  ".co": 750000,
  ".shop": 650000,
};

export const mockDomainProvider: DomainProvider = {
  async search(baseName, tlds) {
    return tlds.map((tld, index) => ({
      name: `${baseName}${tld}`,
      available: index !== 3,
      price: index === 3 ? undefined : MOCK_PRICES[tld] ?? 400000,
      currency: "VND" as const,
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
      try { return readAvailability(candidate); } catch { /* try the next known shape */ }
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
      const response = await fetch(`${baseUrl}/api/rms/v1/domain/checkavailable`, {
        method: "POST",
        headers: { "Content-Type": "application/json", token },
        body: JSON.stringify({ name }),
        cache: "no-store",
        signal: AbortSignal.timeout(8000),
      });
      if (!response.ok) throw new Error(`iNET HTTP ${response.status}.`);
      const available = readAvailability(await response.json());
      return {
        name,
        available,
        price: available ? MOCK_PRICES[tld] ?? 400000 : undefined,
        currency: "VND" as const,
      };
    }));
  },
};

export function getDomainProvider(): DomainProvider {
  return process.env.INET_MODE === "live" ? inetResellerProvider : mockDomainProvider;
}
