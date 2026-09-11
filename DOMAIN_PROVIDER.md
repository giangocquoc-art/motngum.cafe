# Domain provider

Domain lookup is intentionally behind `DomainProvider` in `lib/domain-provider.ts`.
The current implementation is a deterministic sandbox provider: it never registers,
renews, changes nameservers, or mutates DNS. This keeps local and preview flows safe.

`GET /api/domains?name=brand` validates and normalizes the input, then returns the
provider result. The UI treats `live: false` as sample availability and tells the user
that a registrar connection is required.

To add iNET, implement the same `search(baseName, tlds)` contract in a server-only
module, map the iNET response to `{ name, available, price, currency }`, and select it
from `getDomainProvider()` only when an explicit server-side credential and sandbox
flag are present. Never expose the credential to `NEXT_PUBLIC_*` variables.
