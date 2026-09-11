# Order intake

`POST /api/orders` is the safe first step of checkout. It validates contact details
and an allow-listed package, creates a temporary confirmation ID, and returns status
`received`. It intentionally does not charge payment, register domains, or persist
production customer data until a storage, email, and PShareHub handoff are configured.
