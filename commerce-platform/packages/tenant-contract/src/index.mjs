// Shared contracts for Cloudflare edge and tenant-aware Medusa storefronts.
// This is orchestration glue, NOT a second commerce engine.
const SLUG_RE = /^[a-z][a-z0-9-]{2,47}$/;
const BLOCKED_HOSTS = new Set(["motngum.cafe","www.motngum.cafe","app.motngum.cafe","hsk.motngum.cafe","mail.motngum.cafe","ktsthaiduc.motngum.cafe","web.motngum.cafe","ngocphat.motngum.cafe","thuyduong.motngum.cafe"]);
export function normalizeHostname(value) {
  const h = String(value || "").trim().toLowerCase().replace(/\.$/, "");
  if (!h || h.length > 253 || h.includes("..") || !/^[a-z0-9.-]+$/.test(h) || h.startsWith(".") || h.endsWith(".")) throw new Error("invalid_hostname");
  return h;
}
export function assertNewMerchantSlug(value) {
  if (!SLUG_RE.test(value) || ["www","app","api","mail","hsk","admin","status","support","web","commerce-preview","ktsthaiduc","ngocphat","thuyduong"].includes(value)) throw new Error("invalid_or_reserved_slug");
  return value;
}
export function assertTenantDomainActivation(record) {
  if (!record || record.merchant_state !== "active" || record.ownership_state !== "verified" || record.tls_state !== "issued" || record.routing_state !== "active") throw new Error("tenant_not_active");
  const h = normalizeHostname(record.hostname);
  if (BLOCKED_HOSTS.has(h)) throw new Error("reserved_platform_hostname");
  return h;
}
export function makeRequestScopedCommerceClient({ hostname, resolvedConnection, sdkFactory, allowedBackendHosts }) {
  if (!resolvedConnection || !resolvedConnection.merchantId || !resolvedConnection.publishableKey) throw new Error("merchant_connection_missing");
  if (normalizeHostname(resolvedConnection.hostname) !== normalizeHostname(hostname)) throw new Error("tenant_hostname_mismatch");
  const u = new URL(resolvedConnection.backendUrl);
  if (u.protocol !== "https:" || u.username || u.password || u.port || u.pathname !== "/" || !allowedBackendHosts.includes(u.hostname)) throw new Error("untrusted_backend");
  if (typeof sdkFactory !== "function") throw new Error("sdk_factory_missing");
  // A fresh SDK must be created per trusted merchant context. NEVER mutate a module-global Medusa SDK.
  return sdkFactory({ baseUrl: u.origin, publishableKey: resolvedConnection.publishableKey, debug: false });
}
export function tenantScopedEventKey({ merchantId, provider, eventId }) {
  const normalized = [merchantId, provider, eventId].map(x => String(x || "").trim());
  if (normalized.some(x => x.length === 0 || x.length > 128)) throw new Error("invalid_event_identity");
  return normalized.map(x => x.length + ":" + x).join("|");
}
