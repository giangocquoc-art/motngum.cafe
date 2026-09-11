# Quote API

`POST /api/quotes` recalculates a package quote on the server. It accepts a stable
`packageId` (`start`, `launch`, or `grow`) and an optional bounded domain price.
The response includes the server-selected package price, domain price, subtotal,
currency, and a short quote lifetime. Client totals must not be trusted for checkout.

This is a quote-only sandbox endpoint. It does not create an order, charge payment,
register a domain, or change DNS. Payment and order persistence should be added behind
the same server-side catalog after WooCommerce/PShareHub integration is configured.
