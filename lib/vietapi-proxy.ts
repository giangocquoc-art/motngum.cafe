const DEFAULT_VIETAPI_BASE_URL = "https://api.vietapi.tech/v1";

const HOP_BY_HOP_HEADERS = [
  "connection",
  "content-length",
  "host",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
];

const CORS_HEADERS = {
  "Access-Control-Allow-Headers": "Authorization, Content-Type, X-Requested-With",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Expose-Headers": "content-type, x-request-id",
};

function isBodylessMethod(method: string) {
  return method === "GET" || method === "HEAD" || method === "OPTIONS";
}

export async function proxyVietApiRequest(request: Request, path: string[]) {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  const baseUrl = (
    process.env.VIETAPI_BASE_URL || DEFAULT_VIETAPI_BASE_URL
  ).replace(/\/+$/, "");
  const requestUrl = new URL(request.url);
  const endpoint = path.map((segment) => encodeURIComponent(segment)).join("/");
  const upstreamUrl = `${baseUrl}${endpoint ? `/${endpoint}` : ""}${requestUrl.search}`;

  const headers = new Headers(request.headers);
  for (const header of HOP_BY_HOP_HEADERS) {
    headers.delete(header);
  }

  const upstreamResponse = await fetch(upstreamUrl, {
    method: request.method,
    headers,
    body: isBodylessMethod(request.method) ? undefined : await request.arrayBuffer(),
    redirect: "manual",
  });

  const responseHeaders = new Headers(upstreamResponse.headers);
  for (const header of HOP_BY_HOP_HEADERS) {
    responseHeaders.delete(header);
  }
  for (const [name, value] of Object.entries(CORS_HEADERS)) {
    responseHeaders.set(name, value);
  }
  responseHeaders.set("Cache-Control", "no-store");

  return new Response(upstreamResponse.body, {
    status: upstreamResponse.status,
    statusText: upstreamResponse.statusText,
    headers: responseHeaders,
  });
}
