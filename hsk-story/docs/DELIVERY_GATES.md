# HSK delivery gates

`node hsk-story/scripts/audit-release.cjs` prints a JSON report. Add `--check` in CI to fail on a package-input or content-manifest defect. The audit resolves local page and stylesheet references, checks that deployed files exist and are Git tracked, and ensures `.vercelignore` excludes environment files, source inventories, and unapproved future content.

The report intentionally records external evidence as `pending`: exact-SHA CI history, Vercel Preview readiness, Preview HTTP responses and runtime errors, legacy-save browser coverage, mobile/audio review, and qualified Mandarin plus official syllabus review. This Preview setup does not require or assert a Production deployment. A local package pass does not assert any external outcome.

## Reported product state

The report derives one playable HSK level, eight candidate objectives from unique curriculum objective IDs, zero educator-reviewed objectives, and levels 2–6 locked from the learning blueprint. The eight objectives are pilot/demo scope; they are not an official HSK completion claim. The report does not promote a pending review to a pass.

## CI coverage

`hsk-story-regression.yml` watches HSK files and the shared app, component, library, public asset, integration, root script, package, and renderer configuration paths. It checks JavaScript syntax recursively, runs the content-manifest/package audit, and executes the existing Node regression suite. `hsk-branch-novel-e2e.yml` also watches shared branch renderer dependencies and runs the existing branch browser checks, including newer-save recovery.

The existing browser and human review gates still require their own successful evidence on the release SHA; a local audit is not a substitute.

### Kitchen follow-up — local verification, 2026-11-07

- Applied the approved layout review: the first bà Lưu encounter now uses the served-meal scene art, so the bowl on the table matches the narration. In the one-week-later home sequence, the folded receipt stays on the table beside An's notebook; Sẻ is omitted from those three beats because there is no story reason for him to appear.
- Added the classmate as a separate transparent sprite in the classroom count scene, keeping An, Tiểu Vũ, the classmate, cô Vương, and one perched Sẻ visually distinct. The character master, optimized WebP, generation prompt, and in-repo visual reference are included with the scene manifest.
- Local Node regression suite: 432 tests passed. Microsoft Edge completed all 15 learning milestones on four routes (care desktop, curious phone portrait, brave phone landscape, tablet portrait), for 652 route states. This is local evidence only; hosted Preview and teacher/native-speaker review still need their own confirmation.

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

- The self-introduction, student identity, counting, noodle-order, thanks, and farewell practice pages now group their accepted answer forms into one compact localized page after the primary example. This reduces the first seven guided lessons from 28 mandatory example pages to 14 while preserving Hanzi, Pinyin, Vietnamese meaning, answer keys, scene IDs, and saves. Content manifest is version 1.0.9.
- All 409 local Node tests pass; graph audit passes with no consequence or convergence gaps; package-input audit passes. Commit `9faffd634a6b9eb186feae5b506363e6d0e3f36a` passed [HSK Story Regression run 42266799027](https://github.com/giangocquoc-art/motngum.cafe/actions/runs/42266799027) and [HSK Branching Novel Browser Smoke run 42266798508](https://github.com/giangocquoc-art/motngum.cafe/actions/runs/42266798508). The grouped-page working tree also passes local Edge smoke at 801 measured layout states across desktop, phone portrait/landscape, tablet, and keyboard-open states; the branch controls flow passed locally on phone and landscape sizes. ECC confirms answer coverage and matching Hanzi/Pinyin/translation group counts; qualified Mandarin review remains open for pragmatic phrasing.
- Vercel has no deployment for this SHA. Creating its Preview was rejected by the account limit `api-deployments-free-per-day` (over 100 deployments; retry after 24 hours); Vercel CLI is not installed here. No Production deployment or custom-domain change was made. The latest known Vercel deployment remains the older `6dae0c8` SHA.

### Week-later noodle recall — 2026-11-07 — local working tree

- Added a short story continuation after the existing `day2-epilogue` node. One week later, An tries ordering noodles at bà Lưu's shop, then recalls the price at home before opening the receipt. These are two appended learning task IDs; tasks 0–9 and their anchors remain unchanged.
- Branch account snapshots are schema v3. Client and server accept old v1/v2 ten-entry saves, preserve their existing history, and pad only the new task slots. The generated API bundle was rebuilt. A regression check confirms a formerly completed save at `day2-epilogue` continues without replaying its choices.
- Local verification: all 421 Node tests passed; graph audit passed for 45 nodes, 37 options, 12 branch learning tasks, eight candidate objectives, and 1,259,712 structural paths with no consequence or convergence gaps. Package inputs pass; expert curriculum review and hosted deployment evidence remain pending.
- Connected Edge browser smoke opened both new recall prompts and their character replies. At 320×568 and 844×390, the document fit the viewport without horizontal or vertical overflow; the answer field and both navigation controls remained within the viewport. This was the local development server, not Vercel Preview.
- Story and delayed-recall changes are committed through `9603028` on the feature branch. Vercel reports the `hsk-hai-que-huong` check failed with `build-rate-limit`; no deployment exists for that SHA. The latest known READY deployment is the older `6dae0c82` commit, with target classification unavailable. Production and the custom domain were not changed.

### Responsive scene collision corrections — 2026-11-07

- The noodle-shop renderer now selects its authored portrait art and placement for portrait tablets. The tablet E2E gate requires the tablet variant and its native 600px portrait plate; the prior run exposed that a wide background let the menu sit behind the dialogue.
- A full local Chromium browser smoke then found the opening An face under the landing dialogue on portrait tablets. The shared scene renderer now reserves the dialogue area for tablet portrait layouts when positioning the opening character. Connected Edge confirmed An's face remains above the copy at 768×1024.
- After the correction, the full browser smoke passed 833 measured layout states, including desktop, phone portrait/landscape, tablet portrait/landscape, and keyboard-open phone/tablet states. The Node suite passed all 421 tests; story graph and release package audits passed locally.
- These changes are local/feature-branch only. Vercel returned `build-rate-limit` for `hsk-hai-que-huong` at commit `9603028`; therefore hosted Preview/runtime checks remain pending. No Production or custom-domain change was made.

### Common delayed-recall continuation and kitchen layout — 2026-11-07

- Appended shared learning tasks 10–14 for delayed noodle-order, price, numbers, gratitude and farewell recall. Expanded the story from 45 to 49 nodes and the learning history from 12 to 15 rows; tasks 0–9 remain stable. The former `week-later-ending` node now continues into the classroom, so an existing save resumes at the same ID and can proceed without replaying old route choices.
- Account snapshot schema v4 accepts v1/v2 ten-row and v3 twelve-row saves, preserves their old learning evidence, and pads only the new rows. The generated API function bundle was rebuilt from server source.
- Full local verification: all 422 Node tests pass; graph audit passes (49 nodes, 37 options, 15 branch tasks, ten segments, 1,259,712 structural paths, no consequence or convergence gaps); package-input audit passes.
- Edge browser smoke passes 833 measured layout states. Branch integration passes all three complete story routes at 501 states with 15 learning results. Former-ending save migration passes on desktop and phone. The approved kitchen composition passes 35 Edge states across seven branches and five viewport compositions; each keeps one visible Sẻ, a matching speaker, and no document/content overflow.
- No content or image change was made to the released art direction. HSK1 educator/native-speaker review and learning outcomes remain open. Changes are pushed to feature branch commit `82df672`. Vercel has no deployment for this SHA yet; the connected project check previously returned `build-rate-limit`, so hosted Preview/runtime verification remains pending. No Production or custom-domain change was made.

### Objective-stage reporting and delayed-farewell prompt — 2026-11-07

- The HSK1 blueprint now maps branch checkpoint tasks 10–14 to their stable objective IDs and validates the mapping against the runtime task registry. It separately records shared `day2-liu` reuse for ordering and price. The greeting goal now has common story reuse, but still lacks an individually measured recall; the other five goals also remain sequence-incomplete. All educator approvals and official item matches remain pending.
- Task 14's default cue is now `我先回家了。` and does not show any accepted farewell answer. A browser regression checks visible pre-answer content; requested help still provides the authored answer.
- `node --test tests/*.test.cjs`: 425 passed. Story graph audit: 50 nodes, 37 options, 15 learning tasks, zero consequence/convergence gaps. Release package inputs pass; CI, hosted Preview, educator review, audio and physical-device gates remain pending.
- Edge branch integration completed three routes in 505 states across desktop, 320px phone and landscape; all 15 learning results were recorded with one visible Sẻ and no overflow. The first phone run found the longer task request overflowed; the shortened copy now passes.
- Pushed to feature branch commit `5a1a402`. The intended `hsk-hai-que-huong` check failed with Vercel `build-rate-limit` and has no deployment for this SHA, so a valid Chim Sẻ Preview is still unavailable. A separate project deployment completed but serves a different Next.js site and returns 404 for `/duong-re/`; it is not accepted as the game Preview. The Edge tab also reached Vercel SSO instead of the protected deployment. No Production or custom-domain change was made.

### Week-later meal continuity bridge — 2026-11-07 — local branch

- Added the shared `week-later-meal` passage between the delayed noodle-order task and the home price-recall task. It shows bà Lưu confirming the dish, serving the meal and handing An a folded receipt; the amount stays hidden until An attempts recall at home.
- Updated the session segment, required graph anchors and node-count expectations. A regression confirms the price prompt follows the meal bridge and that the bridge itself does not reveal accepted price forms.
- Local verification at that point: all 425 Node tests pass; graph audit passes for 50 nodes, 37 options, 15 tasks and 1,259,712 structural paths, with no consequence or convergence gaps. Connected Microsoft Edge completed three full routes in 505 states (desktop, 320px phone portrait, landscape); each records all 15 tasks with one visible Sẻ and no overflow.
- These source changes are local and not deployed. Vercel Preview creation remains blocked by the daily deployment limit; the Vercel Edge connection does not remove that project limit. No Production or custom-domain change was made.

### Greeting reuse before the delayed price checkpoint — 2026-11-07 — local branch

- Added two common home passages before `week-later-home`: Mẹ checks on An using `安，你还好吗？`; after the player advances, An answers with the previously practiced `我还好。` The answer appears in the subsequent passage, not with the question or during the price checkpoint.
- These story lines do not create learning evidence, new tasks, route consequences or relationship changes. Task 11 and its accepted price answers remain unchanged. The story graph and authoring blueprint now map the paired question/answer forms to their respective passages; fixed the report helper so it checks each form against its corresponding node.
- The stage report recognizes greeting reuse but keeps its independent-recall stage incomplete. The common `day2-counting-group` passage models `你们组有三个学生` before the one-week gap and task 12; it is story exposure, not evidence. Numbers now has introduction, story reuse and independent recall; five pilot sequences remain incomplete. No objective is release-ready, and qualified language/source review remains pending.
- Local verification: all 428 Node tests pass; graph audit passes at 53 nodes, 37 options, 15 branch tasks and 1,259,712 structural paths, with no consequence/convergence gaps. Microsoft Edge completed the three full desktop/phone portrait/phone landscape routes in 515 states; all 15 tasks were recorded, one Sẻ remained visible and no viewport/content overflow occurred. The classroom reuse now appears in the correct school segment, with the named cast and a perched Sẻ; the two home turns show speaker-appropriate expressions and keep the price question for its checkpoint. A regression fixture confirms old saves at bà Lưu retain their choice journal and relationship state.
- These edits are not deployed and have no Vercel deployment. No Production or custom-domain change was made.

### Shared gratitude reuse at bà Lưu’s shop — 2026-11-07 — local branch

- Added one contextual line to the shared `day2-liu` story: An accepts the bowl with both hands and says `谢谢` (*Xièxie*). Mapped the exact authored form to the candidate `gratitude` objective. It is an unscored reuse; task 13, its accepted answers, evidence rules, route choices and save schema are unchanged.
- The objective report now shows gratitude introduction, shared story reuse and independent recall. Four sequences remain incomplete: greeting, self-introduction, student identity and farewell. HSK source matching, qualified language review, and release approval remain pending.
- Follow-up art and copy pass: the count scene now shows An, Tiểu Vũ, a distinct third student, cô Vương and exactly one Sẻ perched on the classroom sill. The transparent classmate sprite, PNG master and prompt are catalogued. The later home check-in copy matches its standing character poses. The same four Edge routes passed again at 652 states; all 429 Node tests and the story graph audit pass. These changes remain local until the feature Preview is built.
- Local verification: 429 Node tests pass; Edge completed four full routes (652 states) on desktop, phone portrait/landscape and tablet portrait. The expanded browser run checks the gratitude task’s prompt for answer leakage and verifies the unscored story exposure does not write learning evidence. Graph and release-input audits pass, while external educator and Preview gates remain pending. The current READY Preview is still commit `dd222b2`; this gratitude line has not been pushed or deployed yet. No Production or custom-domain change was made.

### Delayed recall and generated kitchen plates — 2026-11-07 — local working tree

- Added common week-later recall tasks for greeting, self-introduction and student identity, keeping learning evidence separate from route choices and preserving old v1–v4 saves. Task IDs 0–14 and existing accepted-answer rubrics remain unchanged; the schema appends unanswered rows 15–17.
- Generated and integrated five background-only kitchen plates from the current production style reference, with PNG masters, optimized WebP runtime files and prompt records. Replaced the conflicting art guide with the live site's flat colors and slightly imperfect ink. Characters and one Sẻ remain separate layers.
- Local verification: 434 Node tests passed; the story graph audit covers 53 nodes, 37 options, 18 learning tasks and 1,259,712 structural paths with zero consequence/convergence gaps; package and compiled scene-manifest audits pass. Edge kitchen review passed 35 states; full branch replay passed four routes in 702 states. No page/content overflow or duplicate Sẻ appeared.
- These changes are in the local feature checkout and have not been deployed. Vercel's latest READY Preview is commit `ba7d131`; the local update needs a new Preview build. Educator/native-speaker review, official HSK source crosswalk, learner outcomes and physical-device review remain pending. Production and the custom domain were not changed.

### Save-outage, release-package, and classroom composition follow-up — 2026-11-07 — feature branch

- The one-week-later farewell task no longer accepts bare `再见` as a correct answer to “hẹn ngày mai”; regression coverage confirms `明天见` succeeds and `再见` does not.
- The classroom narration now matches the visible action: An, Tiểu Vũ, and the new classmate count together instead of claiming they move desks that remain stationary in the art. Their sprites form a non-overlapping group across responsive compositions. Sẻ's kitchen anchor now touches the window sill on desktop, tablet, and phone.
- The one-week-later home narration now keeps the receipt in Mẹ's hand, as shown in the home scene, until she gives it to An for recall. The receipt and dialogue do not expose its price before the independent checkpoint.
- A write failure now returns a failure result, rolls back the persisted records, leaves guest play usable in memory with an explicit unsaved warning, and allows the visible retry button to persist the current state. A new Edge browser test simulates one quota failure, verifies old saved bytes remain unchanged until retry, and checks the learning result is saved afterward.
- The release audit now rejects HTML/CSS dependencies excluded by `.vercelignore` and explicitly requires dynamic dependencies `api/branch-progress.js` and `art/flat/characters/classmate-sage-v1.webp`. Tests simulate exclusions for the branching tutor, a self-hosted Han font, the progress API, and the classmate sprite.
- Local verification: all 435 Node tests pass; the release and compiled scene-manifest audits pass. Edge completed 35 kitchen states across five responsive compositions; the save-failure scenario passed; all four branch routes completed 702 browser states and each retained 18 learning-history entries. The classroom overlap and one-Sẻ assertions pass.
- Code is pushed as commit `b0513cd` on `codex/chimse-story-integration-20261029`. The latest Vercel deployment-history query for its previous source commit returned zero deployments; current Preview remains unverified for `b0513cd`. The last inspected READY Preview is still commit `a75d68a`, where the new kitchen WebP returned 404. Vercel's create-deployment API returned its daily `api-deployments-free-per-day` limit (more than 100 deployments; retry after 24 hours), so hosted Preview verification remains pending. HSK source mapping, educator/native-speaker review, learner outcomes, and physical-device keyboard/audio review also remain pending. No Production or custom-domain change was made.

### Package gate and greeting-rubric follow-up — 2026-11-07 — local working tree

- The package audit now checks all four learner pages (`index`, branching story, introduction, and review), their linked CSS/assets, all scene-manifest runtime files, and the API handlers used by account, progress, auth, tutor, and branching progress. Historical `archivedRaster` metadata is not mistaken for a deployed runtime image.
- The delayed mother check-in prompt asks An to answer and thank her; its rubric now accepts concise answers with both parts and no longer accepts answers that omit thanks. Regression coverage checks both.
- Verification at commit `7d90a52`: all 435 Node tests pass; `node scripts/audit-release.cjs --check`, compiled scene-manifest check, and `git diff --check` pass. The Vercel API confirms the Preview project and current deployments, but no deployment exists for that SHA. No Production or custom-domain change was made.

### Delayed number-recall cue correction — 2026-11-07 — local working tree

- The home scene leading into the next-day classroom no longer says the group has three members. The classroom narration no longer says An has already finished counting before the player reaches the number checkpoint. The composition still shows the people An needs to count.
- Regression coverage confirms the pre-checkpoint story and task cues do not reveal a numeric answer, `三个学生` remains accepted, and `四个学生` is rejected. The authored scene IDs and accepted-answer set are unchanged.
- Verification: all 436 Node tests pass; story graph audit confirms 53 nodes, 37 choices, 18 learning tasks, and zero consequence/convergence gaps; package and scene-manifest audits pass. Connected Microsoft Edge completed all four route replays (care 148, curious-phone 212, brave-landscape 194, tablet-portrait 148 states), each retaining 18 learning results; the simulated save-quota failure and retry passed. Initial runs against stale local ports failed, so the rerun used a fresh local static server. Hosted Preview remains pending for the current source.
