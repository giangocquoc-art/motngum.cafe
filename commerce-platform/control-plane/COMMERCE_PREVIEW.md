# SaaS staging Git deployment trigger

This file intentionally exists only in the isolated commerce integration branch. Do not deploy the old `main` branch for the new SaaS app.

- Root directory: `commerce-platform/control-plane`
- Vercel project: `motngum-commerce-saas-staging`
- Neon isolated database: `motngum_commerce_preview`
- Readiness: preview only; never collect payment until provider/webhook verified.

Gate A 2026-10-29: correct Vercel Preview secrets now configured; redeploy this branch to validate full staging build without modifying main.
