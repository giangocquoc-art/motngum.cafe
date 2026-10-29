// Motngum Commerce — Cloudflare staging edge / control-plane registry.
// Merchant checkout and order handling are intentionally NOT simulated here.
// PostgreSQL-backed Medusa remains the system of record for commerce.
const VERSION = "edge-stage-0.1.0";
const REPO = "https://github.com/giangocquoc-art/motngum.cafe/tree/commerce-rebuild-2026-10/commerce-platform";
const MODULES = [
  { id: "commerce", source: "medusajs/dtc-starter", imported: true, connected: false },
  { id: "control_plane", source: "nextjs/saas-starter", imported: true, connected: false },
  { id: "cms_builder", source: "payloadcms/payload + puckeditor/puck", imported: false, connected: false },
  { id: "pos", source: "medusapos/app", imported: false, connected: false, blocker: "Medusa plugin requires compatibility assessment" },
  { id: "support", source: "chatwoot/chatwoot", imported: false, connected: false },
  { id: "automation_internal", source: "n8n-io/n8n", imported: false, connected: false, blocker: "license limits merchant-facing use" },
  { id: "marketplaces", source: "official merchant APIs", imported: false, connected: false, blocker: "partner credentials and approval" },
  { id: "payments", source: "official Vietnamese payment providers", imported: false, connected: false, blocker: "merchant settlement and signed webhook verification" }
];
const RESPONSE_HEADERS = {
  "content-security-policy": "default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY",
  "referrer-policy": "no-referrer",
  "cache-control": "no-store",
  "access-control-allow-origin": "null"
};
function json(value, status = 200) {
  return new Response(JSON.stringify(value), { status, headers: { ...RESPONSE_HEADERS, "content-type": "application/json; charset=utf-8" } });
}
function html(value, status = 200) {
  return new Response(value, { status, headers: { ...RESPONSE_HEADERS, "content-type": "text/html; charset=utf-8" } });
}
function cleanHostname(raw) {
  const host = String(raw || "").trim().toLowerCase().replace(/\.$/, "");
  if (host.length > 253 || !/^[a-z0-9.-]+$/.test(host) || host.includes("..")) return null;
  return host;
}
async function resolveTenant(env, hostname) {
  if (!hostname) return null;
  const domain = await env.DB.prepare(
    "SELECT m.id, m.slug, m.display_name, m.state FROM merchant_domains d JOIN merchants m ON m.id = d.merchant_id WHERE d.hostname = ? AND d.ownership_state = 'verified' AND d.tls_state = 'issued' AND d.routing_state = 'active' AND m.state = 'active' LIMIT 1"
  ).bind(hostname).first();
  return domain ? { merchantId: domain.id, slug: domain.slug, displayName: domain.display_name } : null;
}
async function summary(env) {
  const count = await env.DB.prepare("SELECT COUNT(*) AS n FROM merchants").first();
  const ready = await env.DB.prepare("SELECT COUNT(*) AS n FROM service_connections WHERE service_kind = 'medusa' AND state = 'ready'").first();
  const domains = await env.DB.prepare("SELECT COUNT(*) AS n FROM merchant_domains WHERE routing_state = 'active' AND ownership_state = 'verified' AND tls_state = 'issued'").first();
  return {
    version: VERSION, environment: "staging", engine: "cloudflare-workers-d1-registry",
    sourceCodeImported: true, merchantCount: count?.n ?? 0,
    connectedCommerceEngines: ready?.n ?? 0,
    verifiedActiveDomains: domains?.n ?? 0,
    productionReady: false,
    modules: MODULES, repository: REPO
  };
}
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const pathname = url.pathname.replace(/\/+$/, "") || "/";
    const host = cleanHostname(url.hostname);
    if (!host) return json({ error: "invalid_hostname" }, 400);
    if (request.method !== "GET" && request.method !== "HEAD") {
      return json({ error: "read_only_staging", message: "Write actions require authenticated Control Plane and are not enabled." }, 405);
    }
    try {
      if (pathname === "/health") {
        const ok = await env.DB.prepare("SELECT 1 AS ok").first();
        return json({ ok: ok?.ok === 1, layer: "edge_registry", version: VERSION, commerceReady: false }, ok?.ok === 1 ? 200 : 503);
      }
      if (pathname === "/api/modules") return json({ modules: MODULES });
      if (pathname === "/api/status") return json(await summary(env));
      if (pathname === "/api/ready") {
        const s = await summary(env);
        return json({ ready: false, reason: "commerce_backend_and_verified_payments_not_deployed", services: s.connectedCommerceEngines, merchantCount: s.merchantCount }, 503);
      }
      if (pathname === "/api/tenant/resolve") {
        // Never take merchant IDs, backend URLs, or domains from query or user-provided headers.
        const t = await resolveTenant(env, host);
        if (!t) return json({ error: "unresolved_or_inactive_domain" }, 404);
        return json({ merchant: t });
      }
      if (pathname === "/") {
        if (host !== "commerce-preview.motngum.cafe" && !host.endsWith(".workers.dev")) {
          const t = await resolveTenant(env, host);
          if (!t) return json({ error: "unrecognized_tenant_domain" }, 404);
          return json({ status: "not_serving_checkout", merchant: t, message: "Checkout requires a verified connected Medusa backend." }, 503);
        }
        const s = await summary(env);
        return html(`<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Motngum Commerce — Integration Staging</title><style>body{font:16px system-ui,sans-serif;line-height:1.6;color:#17233b;max-width:860px;margin:65px auto;padding:0 22px}h1{font-size:2rem}section{border:1px solid #d8deec;border-radius:12px;padding:20px;margin:22px 0}code{background:#f2f4f8;padding:3px 6px;border-radius:4px}a{color:#1848bd}li{padding:4px 0}small{color:#667085}</style></head><body><h1>Motngum Commerce Platform</h1><p><b>Integration staging.</b> Đây là lớp Cloudflare Edge có kết nối D1 thật, chưa phải nền tảng bán hàng hoàn chỉnh.</p><section><h2>Trạng thái kỹ thuật</h2><ul><li>GitHub: đã nhập Medusa DTC + SaaS Starter</li><li>Cloudflare Worker: đang phục vụ</li><li>D1 merchant registry: hoạt động (số merchant: ${s.merchantCount})</li><li>Medusa backend: chưa kết nối (${s.connectedCommerceEngines})</li><li>Đặt hàng / Thanh toán thật: <b>chưa triển khai</b></li><li>Domain cũ: <b>chưa thay thế</b></li></ul></section><section><h2>API kiểm tra</h2><ul><li><a href="/health">/health</a></li><li><a href="/api/status">/api/status</a></li><li><a href="/api/modules">/api/modules</a></li><li><a href="/api/ready">/api/ready</a> (trả 503 đúng thực tế)</li></ul></section><p><a href="${REPO}">Xem mã nguồn tích hợp trên GitHub</a></p><small>Không có giỏ hàng giả, người mua giả hoặc trạng thái thanh toán giả.</small></body></html>`);
      }
      return json({ error: "not_found" }, 404);
    } catch (error) {
      console.error(JSON.stringify({ level: "error", where: "commerce_edge", message: error instanceof Error ? error.message : "unknown" }));
      return json({ error: "unavailable", detail: "The staging registry is temporarily unavailable." }, 503);
    }
  }
};
