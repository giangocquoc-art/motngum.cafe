/** Browser CSRF guard: compare Origin to the actual inbound Host header.
 * NextRequest.nextUrl may be rewritten to localhost by reverse proxies.
 * Browsers cannot forge Host for a cross-origin request; production requires HTTPS.
 */
export function sameOriginRequest(request: Request): boolean {
  const origin = request.headers.get('origin');
  const host = request.headers.get('host');
  if (!origin || !host) return false;
  try {
    const parsed = new URL(origin);
    if (parsed.username || parsed.password || parsed.pathname !== '/' ||
        parsed.search || parsed.hash || parsed.host.toLowerCase() !== host.toLowerCase()) return false;
    const local = parsed.hostname === '127.0.0.1' || parsed.hostname === 'localhost';
    return parsed.protocol === 'https:' || (local && parsed.protocol === 'http:');
  } catch { return false; }
}
