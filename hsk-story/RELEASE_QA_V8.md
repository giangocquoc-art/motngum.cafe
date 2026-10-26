# Hai que huong V8 — Release QA audit
Date: 2026-10-26. Target: hsk.motngum.cafe.

## Scope
V8 adds a deterministic interactive lost-notebook narrative event between original HSK1 demo scenes 3 and 4. It does not change scene IDs 0-9, teaching metadata, HSK checkpoint tasks or unrelated root repository assets. Script is in active-encounter.js, with UI integration app.js/index.html/style.css, storyboard and logic tests.

## Verified during preparation
- Authored encounter: three clue targets, minimum two unique inspections, two friend/teacher routes, staff name prompt, first-try/retried/helped/sample evidence, notebook return, callback on walk home.
- Mocked full UI play-through with original scenes, class exam, reload at encounter mid-response, help and different route: 18/18 high-level checks passed BEFORE GitHub commit.
- Existing answer patterns reused from tested HSKCore evaluate and prior taught scene1; independent transfer evidence is separate from three classroom checkpoint scores.
- Source and DOM referenced IDs checked before publish. Test suite extended for state graph, all routes, invalid transitions, old save migration, completion and retake.

## Required post-push release gates
1. GitHub Actions Node syntax and full test suite completed SUCCESS on reviewed V8 SHA. Report actual number of tests from logs.
2. Vercel hsk-hai-que-huong production latest commit same SHA READY; all domain assets HTML / app.js / active-encounter.js / CSS return HTTP 200.
3. Query runtime errors, inspect failures and roll back if V8 regressions appear.
4. Mobile and desktop real browser E2E still required; mocked DOM is not proof of responsive render across devices.

## Known limitations
No full HSK1 curriculum syllabus compliance audit, no authentic Mandarin-language educator sign-off, no AI free dialogue, no official pronunciation/tonal grading, no final illustrated sprites/backgrounds. V8 introduces ONE depth-focused transfer microquest rather than advertising a complete HSK1 campaign.
Existing V3-V7 save migrations preserve completed progress; reordering old numeric scene IDs still requires a separate migration. Browser localStorage is not a secure remote account or authentication system.
