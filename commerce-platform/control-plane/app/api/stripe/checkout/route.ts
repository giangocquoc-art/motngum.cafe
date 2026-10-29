import { getUser } from '@/lib/db/queries';
import { getStripeClient, billingEnabled } from '@/lib/payments/stripe';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  if (!billingEnabled()) return NextResponse.json({ error: 'billing_disabled' }, { status: 404 });
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'authentication_required' }, { status: 401 });
  const sessionId = request.nextUrl.searchParams.get('session_id');
  if (!sessionId) return NextResponse.json({ error: 'session_id_required' }, { status: 400 });
  try {
    const session = await getStripeClient().checkout.sessions.retrieve(sessionId);
    // A Stripe checkout redirect is never proof of payment or account ownership.
    if (session.client_reference_id !== String(user.id)) {
      return NextResponse.json({ error: 'checkout_identity_mismatch' }, { status: 403 });
    }
    // Subscription changes may ONLY occur in a verified webhook/reconciliation path.
    // Do not create or renew user sessions here.
    return NextResponse.redirect(new URL('/dashboard', request.url));
  } catch {
    return NextResponse.json({ error: 'checkout_validation_failed' }, { status: 400 });
  }
}
