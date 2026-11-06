# HSK delivery gates

`node hsk-story/scripts/audit-release.cjs` prints a JSON report. Add `--check` in CI to fail on a package-input or content-manifest defect. The audit resolves local page and stylesheet references, checks that deployed files exist and are Git tracked, and ensures `.vercelignore` excludes environment files, source inventories, and unapproved future content.

The report intentionally records external evidence as `pending`: exact-SHA CI history, Vercel Preview readiness, Preview HTTP responses and runtime errors, legacy-save browser coverage, mobile/audio review, and qualified Mandarin plus official syllabus review. This Preview setup does not require or assert a Production deployment. A local package pass does not assert any external outcome.

## Reported product state

The report derives one playable HSK level, eight candidate objectives from unique curriculum objective IDs, zero educator-reviewed objectives, and levels 2–6 locked from the learning blueprint. The eight objectives are pilot/demo scope; they are not an official HSK completion claim. The report does not promote a pending review to a pass.

## CI coverage

`hsk-story-regression.yml` watches HSK files and the shared app, component, library, public asset, integration, root script, package, and renderer configuration paths. It checks JavaScript syntax recursively, runs the content-manifest/package audit, and executes the existing Node regression suite. `hsk-branch-novel-e2e.yml` also watches shared branch renderer dependencies and runs the existing branch browser checks, including newer-save recovery.

The existing browser and human review gates still require their own successful evidence on the release SHA; a local audit is not a substitute.

### Exact-SHA evidence — 2026-11-06

Commit `01c2a99fbc33a1d4d67991524ea45b5f2b17b6c5` has successful GitHub Actions results for both configured checks: [HSK Story Regression run 42180445500](https://github.com/giangocquoc-art/motngum.cafe/actions/runs/42180445500) passed the Node regression suite and real Chromium desktop/mobile story smoke; [standalone Chromium run 42180445517](https://github.com/giangocquoc-art/motngum.cafe/actions/runs/42180445517) passed its browser smoke. The local branch-rewind Edge check also passed. These checks cover code and browser flows, not qualified language review, physical-device review, hosted OAuth/AI/email, or learner outcomes. The generated release audit continues to report its generic external evidence fields as pending because it does not ingest these run receipts.

## Connected platform snapshot (2026-11-04)

The initial platform snapshot was read-only; no rows or secret values were inspected. The following authorized Preview isolation work is recorded separately below.

- Vercel project `hsk-hai-que-huong` (`prj_tewfOEAAuRCu31AVp2fagZZdDdXX`, team `team_MuDrmh9ArRMdoO3RYb8U017m`) reports latest deployment `dpl_CEMs4uhPrKsKBNW2vGJHt5Ci2F39` READY from branch `codex/chimse-story-integration-20261029`, commit `31fa2f18e84f402b150907aa740f7a5b5a72dcf1`. API metadata returned `target: null`, so this observation establishes READY but does not independently classify its environment.
- Vercel environment metadata contains one `CHIMSE_DATABASE_URL` record scoped to Preview and Production, with no Git branch override. Its value was not decrypted or inspected. The project also has Preview/Production `CHIMSE_AUTH_ENABLED`, `CHIMSE_AUTH_SECRET`, `GOOGLE_CLIENT_ID`, and `GOOGLE_CLIENT_SECRET` entries (the Google entries include duplicate target records); names and target scopes only were read.
- The matching Neon project is `neon-blue-desert` (`odd-water-50000054`, AWS `aws-us-east-1`). Its primary/default branch is `main` (`br-solitary-field-awxmqhn1`). The HSK `chim-se` branch (`br-odd-truth-awxj7hk8`) is a ready child of `main`; it contains a separate `chimse` database owned by `chimse_app`. The `main` branch has no `chimse` database. Neon metadata and the Vercel env comment identify this as the dedicated Chim Sẻ branch, but the secret connection value was not inspected, so the actual endpoint mapping remains unverified.
- On `chim-se` / database `chimse`, `public.learner_progress` has `user_id`, `schema_version`, `revision`, `snapshot`, and `updated_at`. It does **not** have `branch_revision`, `branch_snapshot`, or `branch_updated_at`. The repository migration `hsk-story/migrations/003-branch-progress.sql` exists, but the inspected branch schema shows it has not been applied there. Do not enable the branch-progress handler against this schema yet.
- The same `chimse` database has Better Auth tables `chimse_user`, `chimse_session`, `chimse_account`, and `chimse_verification`. The account schema has provider/token fields. The Neon project also has managed-auth tables under `neon_auth` in the separate `neondb` database; its auth metadata lists Google. The HSK server code uses self-managed Better Auth against `chimse` and Vercel Google env entries.

### Safe migration path

The shared database URL record applies to both Preview and Production, so migration 003 was not applied to `chim-se`. The authorized Preview test uses a child of `chim-se` with a Git-branch-specific Preview env entry. Production mapping remains unverified and unchanged; do not apply the migration there until its intended database branch is positively identified.

### Authorized Preview isolation completed (2026-11-04)

- Created Neon child branch `chimse-story-preview-20261104` (`br-withered-violet-aw6do8ga`) from `chim-se` (`br-odd-truth-awxj7hk8`) in project `odd-water-50000054`; its `chimse` database was inherited from the parent.
- Applied only `hsk-story/migrations/003-branch-progress.sql` to `chimse` on the new child, using the `chimse_app` role. Schema metadata confirms `branch_revision integer NOT NULL DEFAULT 0`, nullable `branch_snapshot jsonb`, nullable `branch_updated_at timestamptz`, and CHECK constraint `learner_branch_progress_valid`.
- Added Vercel env record `Wr5b4Jw9fkZGVl6W`: `CHIMSE_DATABASE_URL`, type `sensitive`, Preview only, Git branch `codex/chimse-story-integration-20261029`. It points to the new Neon child; the connection string was passed directly from Neon to Vercel and was not printed, decrypted for inspection, or written locally.
- The pre-existing shared `CHIMSE_DATABASE_URL` record (`xLEGlX8ISusAY9RZ`) remains scoped to Preview and Production with no Git-branch override. No production env or database was changed. The branch-scoped Preview record is expected to override it only for the named Git branch.
- Preview auth is not isolated by this work: `CHIMSE_AUTH_ENABLED`, `CHIMSE_AUTH_SECRET`, `GOOGLE_CLIENT_ID`, and `GOOGLE_CLIENT_SECRET` still have shared Preview/Production targets, and `hsk-story/server/auth.mjs` hardcodes the production site origin. Do not treat Preview Google sign-in as ready; a Preview origin/callback design needs explicit review and Google Console callback configuration. No auth env, provider, or callback settings were changed.
- No deployment was triggered, so this env change has not been loaded into a new Vercel deployment. A protected deployment smoke GET was not run: the Vercel CLI is unavailable locally, and no temporary bypass/share link was created.
