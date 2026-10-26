# Hai que huong — V8 Release Audit (final verification)
Date: 2026-10-26. Application: https://hsk.motngum.cafe

## Product scope
V8 makes the first HSK1 pilot less like a sequence of quizzes: a deterministic, multi-step lost-notebook event after classroom scene 3, before cafeteria scene 4. Player observes two distinct items, chooses to ask Xiao Yu or Wang teacher for support, reuses a previously taught self-introduction at the office in a new real-life context, recovers mother's notebook, and hears a route-specific later callback on the way home. The final recap remembers the same notebook from the opening. Transfer evidence is tracked separately from three in-world classroom checkpoints. Existing scene IDs 0-9 remain stable.

## Verification evidence collected
- GitHub production commit (first V8): c904fc833a0f33ecbee367d09c9ff8005d359ba1.
- GitHub Actions HSK Story Regression run 40258368581: completed SUCCESS; 69 total tests, 69 passed, 0 failed, 0 skipped.
- Vercel project hsk-hai-que-huong latest production for V8 commit reported READY.
- Exact production domain returned HTTP 200 for homepage, active-encounter.js, app.js, style.css and content-manifest.js, with V8 version/feature markers present.
- Vercel runtime errors query returned no errors in the checked 1-hour window.
- Independent pre-commit mocked UI story run passed 18/18 high-level checks including route memory, mid-event browser reload, wrong answer, hint/score separation, diary callback, ending, exam score isolation and retake.
- Node regression suite adds 9 encounter state/reducer unit tests and 3 UI flows (new encounter, persist/resume+help, historic save migration), plus existing V7 regression.
- Changes scoped to the hsk-story directory only; no root website source or domain/DNS changes.

## Remaining QA before saying fully production-qualified
1. No real Chromium/Playwright end-to-end screenshot or responsive mobile visual review was possible in this environment. Mocked DOM and production HTTP success are NOT substitutes for that.
2. Mandarin native-editor review of prompt naturalness, pronunciation and translation is required.
3. Full HSK3.0 official edition-pinned syllabus coverage and education outcomes are not validated: V8 remains a small HSK1 demo, NOT a certified HSK1 course/exam.
4. Browser speech tools remain device dependent and do not grade Mandarin tones. No AI free dialogue server is live.
5. Original reference-quality hand-inked 2D assets and animated sprites are not shipped; existing SVG visuals are placeholders.
6. Shared repository still may trigger unrelated Vercel project builds; separate migration needs approval and rollback plan.
7. Numeric scene indexes remain a migration debt before expanding to several chapters. Do not reorder legacy scenes directly.

## Regression commands
node --test hsk-story/tests/*.test.cjs
node --check hsk-story/app.js
node --check hsk-story/active-encounter.js

## Verdict
READY as a deployed V8 story-learning pilot with passing automated regression tests and live asset verification. NOT complete HSK1, not educator-reviewed and not visually/device-tested at production release level.
