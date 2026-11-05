# Motngum 2FA — Internal TOTP Viewer

Private admin controls mapping of account identifiers to TOTP secrets and distinct access codes. The public page accepts exactly the account identifier set in the admin form, and returns a six-digit TOTP for a matching active account. No second PIN field or M2 token is used. Only deploy for accounts you administer with the owner's authorization.

## Stack
Plain HTML/CSS/JS (white UI), Vercel Node.js functions, Neon PostgreSQL, AES-256-GCM encrypted TOTP secrets, legacy scrypt access-code hashes (unused by customer flow). Domain: 2fa.motngum.cafe.

## Required Vercel environment variables (server-only)
- `DATABASE_URL` — Neon PostgreSQL connection string.
- `TOTP_ENC_KEY` — random 32-byte key hex (64 characters).
- `ADMIN_PASS_HASH` — `salt_hex:scrypt_hex` for admin's password.
- `ADMIN_SESSION_KEY` — random HMAC signing key (at least 40 characters).

**Never commit .env files or TOTP secrets to Git. Do not rotate TOTP_ENC_KEY without re-encrypting saved secrets; old records would become unreadable.**

## Database schema
Run the non-destructive SQL in `schema.sql` in an isolated PostgreSQL database.

## URLs
`/` public retrieval form; `/admin` admin sign-in/dashboard.

## Security limitations
- Do not use public email as the PIN. Anyone who knows the account and a predictable PIN can reconstruct the bearer code. Generate a random PIN.\n- Existing account/PIN pairs remain valid. To give an existing customer a one-field code, edit the account and set a new PIN, then copy the displayed code. The code is only displayed at issuance.
- TOTP is a sensitive authentication factor; sharing it reduces the benefit of per-user 2FA. Consider using distinct identities with individually enrolled MFA for normal production accounts.
- Admin authentication is a password with rate limits, an HttpOnly SameSite=Strict signed cookie, and same-origin request checks. No admin password-reset flow is included.
- Rate limits are persisted in PostgreSQL; account requests are throttled to 12 total lookups/15min, IP requests 60 total lookups/15min, and admin login 5 failures/15min.
- Access-code hashes use scrypt. TOTP secrets use AES-256-GCM. Backups must include the encryption key separately.

## Tests
`npm install && npm test`
