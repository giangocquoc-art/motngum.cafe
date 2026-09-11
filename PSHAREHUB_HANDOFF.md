# PShareHub handoff

The public flow should hand off a confirmed order ID, customer contact, selected
domain, package, quote, and notes to PShareHub. Handoff must be idempotent, signed,
retryable, and observable. Until an endpoint and credential are configured, `/api/orders`
returns a sandbox confirmation only and performs no external mutation.
