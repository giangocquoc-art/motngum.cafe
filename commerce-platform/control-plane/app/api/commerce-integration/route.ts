import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const EDGE_ORIGIN = 'https://commerce-preview.motngum.cafe'
export async function GET() {
  const results: Record<string, unknown> = {
    service: 'motngum-commerce-saas-staging',
    environment: 'preview',
    commerceready: false,
    connections: {}
  }
  try {
    const response = await fetch(EDGE_ORIGIN + '/api/status', {
      cache: 'no-store',
      signal: AbortSignal.timeout(8000),
      headers: { Accept: 'application/json' }
    })
    if (!response.ok) throw new Error('edge_http_' + response.status)
    const edge = await response.json()
    results.connections = {
      edge: 'connected',
      d1_merchants: edge.merchantCount,
      connected_medusa_backends: edge.connectedCommerceEngines,
      active_domains: edge.verifiedActiveDomains,
      medusa_checkout: 'unavailable_until_backend_is_hosted'
    }
    return NextResponse.json(results, { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    results.connections = { edge: 'unavailable', medusa_checkout: 'unavailable' }
    return NextResponse.json(results, { status: 503, headers: { 'Cache-Control': 'no-store' } })
  }
}
