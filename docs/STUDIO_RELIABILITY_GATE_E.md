# Gate E — Reliability, security and public forms (draft-only)

## Implemented
- Puck browser crash recovery: every validated unsaved edit is synchronously stored in `localStorage` using user+team+site key and a 7-day expiry. On reload a recovery banner offers explicit restore only for the same server draft version. On mismatch, export JSON only; no server overwrite. Successful revisioned CAS save clears the local copy. This is a convenience fallback for a **trusted device**, not encrypted device storage.
- Unpublish is an atomic optimistic concurrency operation requiring the currently published version; stale editors receive 409. Native editor reads, tracks and submits this version.
- Cloud site create/save rate limiting uses PostgreSQL activity log and a per-team `FOR UPDATE` lock across multiple instances: 8 creates/min/user, 18 creates/min/team, 55 saves/min/user, 180 saves/min/team. Throttled calls return 429. The 50-site tenant quota remains in force.
- Next.js upgraded from canary to **stable patched 15.5.28** with pinned pnpm lockfile; experimental PPR and client segment caching disabled for compatibility.
- Public contact/newsletter forms submit to PostgreSQL `site_submissions`, migration 0004, with explicit consent, honeypot, duplicate request id, same-origin checking, form validation, 25 submissions/min per site, and tenant-isolated dashboard inbox. The feature stores email/name/message; it **does not** send email or subscribe visitors to a third-party marketing list. Do not claim email delivery.
- Revision lifecycle is protected by an operator-only tool: `node scripts/studio-retention.mjs` defaults to dry-run reporting. `--apply --backup-dir=/secure/offline/path` backs up candidate revisions to NDJSON, synchronizes the backup file, verifies the candidate set under site row locks, then deletes old SAVE snapshots only. Keeps 100 latest versions/site, versions divisible by 25, all CREATE/RESTORE snapshots and all snapshots younger than 30 days. No automatic deletion in routine editor/API requests.

## Operational safety
- For new migration on any non-disposable database: take an independent PostgreSQL backup and run `pnpm db:migrate` with the app offline or otherwise following a controlled maintenance window. Never apply a migration against the production database without approval.
- Rate counter logs and inbound personal data need an explicit per-tenant privacy/retention policy. The manual revision retention tool is **not** a customer-data deletion tool.
- `studio-retention.mjs --apply` should only be run by a trained operator against a database with independently tested restore procedures. Archive files contain potentially sensitive user site content; encrypt/store away from public GitHub and dispose according to policy.
- Public form integration requires a published site; forms on private previews/Puck canvas are inert. On-page consent is checked on server, no user information is written to generic application logs.
- Open-site public metadata remains noindex. Custom domains, email delivery, spam/CAPTCHA provider, user-facing GDPR deletion/export and full device/screen-reader certification are **not completed**.
- PR #11 stays Draft and no Vercel, Cloudflare DNS, main merge, billing or production cutover occurs.

## Acceptance
- GitHub Actions is required to pass after every code/config change: Next stable production build, PostgreSQL migration, tenant auth/CSRF, Puck adapter, multi-tab published-version 409, real public submissions & inbox isolation, browser crash/reload recovery and screenshot/a11y regression.
- Passing CI validates local disposable database, not an existing production install or a physical mobile device.
