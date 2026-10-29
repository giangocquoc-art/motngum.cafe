# SaaS staging Git deployment trigger

This file intentionally exists only in the isolated commerce integration branch. Do not deploy the old `main` branch for the new SaaS app.

- Root directory: `commerce-platform/control-plane`
- Vercel project: `motngum-commerce-saas-staging`
- Neon isolated database: `motngum_commerce_preview`
- Readiness: preview only; never collect payment until provider/webhook verified.
