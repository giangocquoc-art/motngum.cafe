# Pricing logic

Package prices are currently content-level starting prices in `components/PackageCards.tsx`.
Domain prices from the sandbox provider are annual VND reference prices. The next step
is to move package and domain markup rules into editable admin data, then calculate a
quote from selected domain, package, add-ons, and coupon on the server.

Never trust a client-submitted total. The checkout endpoint must recalculate from the
server-side catalog and return a quote ID before payment or order creation.
