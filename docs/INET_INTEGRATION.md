# iNET integration boundary

No iNET credential is currently configured. The application therefore runs in mock
mode and does not perform real domain actions. Before enabling a live provider:

1. Confirm the current iNET reseller API documentation and account permissions.
2. Add credentials as encrypted Vercel environment variables for Preview/Production.
3. Implement availability, suggestions, pricing, registration, renewal, and DNS as
   separate provider methods; do not put provider-specific calls in React components.
4. Keep registration, payment, nameserver, and DNS mutations disabled until a staging
   test and explicit production approval exist.

The public API should return normalized application data, not raw iNET payloads.
