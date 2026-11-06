# HSK delivery gates

`node hsk-story/scripts/audit-release.cjs` prints a JSON report. Add `--check` in CI to fail on a package-input or content-manifest defect. The audit resolves local page and stylesheet references, checks that deployed files exist and are Git tracked, and ensures `.vercelignore` excludes environment files, source inventories, and unapproved future content.

The report intentionally records external evidence as `pending`: exact-SHA CI history, Vercel Preview readiness, Preview HTTP responses and runtime errors, legacy-save browser coverage, mobile/audio review, and qualified Mandarin plus official syllabus review. This Preview setup does not require or assert a Production deployment. A local package pass does not assert any external outcome.

## Reported product state

The report derives one playable HSK level, eight candidate objectives from unique curriculum objective IDs, zero educator-reviewed objectives, and levels 2–6 locked from the learning blueprint. The eight objectives are pilot/demo scope; they are not an official HSK completion claim. The report does not promote a pending review to a pass.

## CI coverage

`hsk-story-regression.yml` watches HSK files and the shared app, component, library, public asset, integration, root script, package, and renderer configuration paths. It checks JavaScript syntax recursively, runs the content-manifest/package audit, and executes the existing Node regression suite. `hsk-branch-novel-e2e.yml` also watches shared branch renderer dependencies and runs the existing branch browser checks, including newer-save recovery.

The existing browser and human review gates still require their own successful evidence on the release SHA; a local audit is not a substitute.

### Exact-SHA evidence — 2026-11-06

Code commit `f4ed9bc560b11f8fbbcd679be0c5a68346b69818` has successful GitHub Actions results for both configured checks: [HSK Story Regression run 42181727660](https://github.com/giangocquoc-art/motngum.cafe/actions/runs/42181727660) passed the Node regression suite and real Chromium desktop/mobile story smoke; [standalone Chromium run 42181727729](https://github.com/giangocquoc-art/motngum.cafe/actions/runs/42181727729) passed its browser smoke. The local branch-rewind Edge check and branch roadmap smoke (including the new tutor focus indicator assertion) also passed. These checks cover code and browser flows, not qualified language review, physical-device review, hosted OAuth/AI/email, or learner outcomes. The generated release audit continues to report its generic external evidence fields as pending because it does not ingest these run receipts.

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

### Exact-SHA evidence — 2026-11-06 — `6b5b968e7b9fac7c2b0530359f618ce092a78ec3`

- [HSK Story Regression run 42194529376](https://github.com/giangocquoc-art/motngum.cafe/actions/runs/42194529376) passed both the unit/simulated story flow and real Chromium desktop/mobile jobs.
- [HSK Branching Novel Browser Smoke run 42194529385](https://github.com/giangocquoc-art/motngum.cafe/actions/runs/42194529385) passed its standalone Chromium flow after the controls scenario learned to complete the required session-recall gate.
- Local verification on the same tree: all 403 Node tests passed; the static browser suite passed 766 layout states across desktop, phone portrait/landscape, tablet, and keyboard-open states; the branching integration suite passed 357 simulated route states across desktop and phone layouts. The story graph audit found no later-consequence or convergence gaps.
- The generated release audit reports package inputs `pass` and external evidence pending. At the time of run `6b5b968`, all five connected Vercel project checks showed `build-rate-limit`; no production deployment was attempted and no domain was changed. A subsequent documentation-only commit `d9e073a` produced the Preview recorded below.
- HSK specialist review found no blocking issue in the revised first lesson. Qualified teacher/native-speaker sign-off, official syllabus row matching, real-user outcomes, hosted account/AI/email checks, and physical-device review remain open gates.

### Preview follow-up — 2026-11-06 — `d9e073acc782d338b8937142e0b31b8fcc17adb4`

- GitHub deployment metadata records a successful `Preview – motngum-cafe-er65` for this exact SHA: [open Preview](https://motngum-cafe-er65-nbasozm21-peter-pans-projects-898306ed.vercel.app/duong-re/).
- An unauthenticated HTTP request reaches Vercel SSO (`200`, page title `Login – Vercel`), so it does not establish that the game UI loaded or passed runtime checks. The Preview remains access-protected; review it in a signed-in Edge session before treating visual verification as complete.
- Four other connected Vercel project checks still report `build-rate-limit`, including `hsk-hai-que-huong`. No production deployment or domain change was made. The successful Preview is on the separate project named above; it must not be described as the production site or as the `hsk-hai-que-huong` deployment.

### Saved first-segment boundary — 2026-11-06 — `2dd6062c83d276e838769fa73970bd0c71c3ab97`

- Local checks: all 405 Node tests passed; graph audit passed (42 nodes, 37 options, no consequence or convergence gaps); Edge session-boundary smoke passed at 320×568, 667×375, and 1024×768; route browser check passed 360 states across desktop, portrait phone, and landscape phone.
- Exact-SHA GitHub checks passed: [HSK Story Regression run 42197570898](https://github.com/giangocquoc-art/motngum.cafe/actions/runs/42197570898) and [HSK Branching Novel Browser Smoke run 42197570722](https://github.com/giangocquoc-art/motngum.cafe/actions/runs/42197570722).
- Vercel checks for this SHA remain blocked by the connected account's build rate limit (`retry in 24 hours`). No new deployment was produced. Preview UI, authenticated progress sync, and physical-device behavior therefore remain unverified; production and the custom domain were not changed.

### HSK1 guided-response pages — 2026-11-07

- Preserved HSK1 scene IDs and answer keys; manifest 1.0.5 now teaches all accepted first check-in forms with localized Hanzi, Pinyin, and Vietnamese meaning. Long alternatives appear as individual pages with previous/next navigation; the test opens only after the final page.
- All 406 Node tests passed. The story-plan audit passed for 42 nodes, 12 choice nodes, 37 options, 10 common tasks, and 1,259,712 structurally checked paths, with zero consequence or convergence gaps. The release package audit reports local package inputs `pass`; external evidence remains pending.
- Edge browser smoke passed 791 measured layout states for desktop, phone portrait/landscape, tablet, tablet landscape, and keyboard-open phone/tablet states. The branch integration browser passed 384 states across three routes (123, 136, and 125); each retained ten learning tasks and legacy progress markers.
- Exact-SHA GitHub checks passed on code commit `356775cb2109d0e5709cce0e234473993d18bbfe`: [HSK Story Regression run 42258286257](https://github.com/giangocquoc-art/motngum.cafe/actions/runs/42258286257) and [HSK Branching Novel Browser Smoke run 42258286268](https://github.com/giangocquoc-art/motngum.cafe/actions/runs/42258286268).
- Vercel produced a `READY` deployment for that commit on the feature branch at `hsk-hai-que-huong-f1hrh16la-peter-pans-projects-898306ed.vercel.app`. The Vercel API returned `target: null`; it has a Git-branch alias and no custom-domain alias, so its Preview classification is not independently confirmed. The story page, stylesheet, branch script, and favicon returned HTTP 200 through the authenticated Vercel fetch. This does not establish browser runtime, signed-in sync, or AI/email behavior on the hosted deployment.
- No Production deployment or custom-domain change was made. Qualified language review, external account synchronization, and physical-device review remain pending.

### Spaced-review answer-position correction — 2026-11-07

- ECC audit found that all 14 current multiple-choice review cards authored the correct option first. Rendering now rotates the option array deterministically from the item order plus its saved stage and completed review events. The grader still validates the stable answer ID; a reload presents the same order, and a later completed review rotates positions. No save schema or schedule intervals changed.
- Verification on the working tree: all 407 Node tests passed; the dedicated review browser flow passed at phone and landscape sizes; the full Edge browser smoke passed 791 layout states. The release package and graph audits pass; package audit still labels hosted/expert gates pending.
- This correction is not yet accompanied by a user memory study; reviewer/native-speaker and educator sign-off remain open.

### Noodle-shop continuity correction — 2026-11-07

- The day-two noodle-shop scene now opens with bà Lưu greeting An and Tiểu Vũ, matching the available choices to ask after her, offer help, or ask where the noodles go. A regression test checks the setup and eligible choices.
- All 408 Node tests passed for that correction. The serial Edge branch-integration run passed three route states (`care`, `curious-phone`, and `brave-landscape`; 384 states total). Exact-SHA regression passed for `d8d22c01099cb2cbff3b5bea8b0afc86a915f549` in [run 42261967686](https://github.com/giangocquoc-art/motngum.cafe/actions/runs/42261967686). Vercel has not listed a deployment for that SHA.
- This wording correction does not change scene IDs, accepted language answers, learning evidence, or saved route structure. Educator and native-speaker review remain open.

### HSK1 accepted-answer teaching coverage — 2026-11-07

- The self-introduction, student identity, counting, noodle-order, thanks, and farewell practice pages now explain every answer form they accept, with Hanzi, Pinyin, Vietnamese meaning, and a short context note. Stable scene IDs, answer keys, and save data are unchanged. Content manifest is version 1.0.8.
- All 409 local Node tests pass; graph audit passes with no consequence or convergence gaps; package-input audit passes. Regression CI passed on `8964c5f`; its browser job exposed a test that assumed the thanks model had one page. The browser test now iterates through every authored model page, and exact-SHA browser rerun is pending. Vercel has not listed a deployment for the current SHA. Editorial and qualified Mandarin review remain open, especially whether each concise restaurant response sounds natural across regions.
