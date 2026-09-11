# Security

Do not expose registrar, payment, email, or PShareHub secrets to client code. Validate
and bound all user input, recalculate prices server-side, verify payment/webhook
signatures, and use a real persistence layer before accepting production orders. Never
register domains, charge cards, change nameservers, or delete DNS from preview flows.
