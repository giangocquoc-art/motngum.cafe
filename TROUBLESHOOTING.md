# Troubleshooting

If Vercel fails, run `npm run build` and inspect the first error in deployment logs.
For domain lookup, confirm `INET_MODE=sandbox` is expected and check `/api/domains`.
For quote/order issues, test invalid input first and confirm the response is a 4xx;
never debug by adding credentials to client-side code.
