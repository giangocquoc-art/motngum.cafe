# HSK Story V6 — Release QA
Date: 2026-10-26. Target: hsk.motngum.cafe.

## Scope
V5 was an interactive HSK1 pilot: seven practice scenes, three checkpoints, two authored choices, learner notebook and phrase tiles. V6 adds five unscored scene interludes, honest optional teaching vocabulary, journal spoiler protection, and preserved v3 localStorage for existing learners. Parent motngum.cafe content and DNS untouched.

## Learning and story integrity
- An authored story page must be acknowledged explicitly before its required scene; it changes no score or unlock condition.
- Vocabulary no longer shows a ready-made correct response at first exposure. Voluntary reveal is recorded as help; hints/phrase tiles continue to be tracked.
- Notebook excludes current, unexposed answers.
- Pre-exam story reading captions do not count toward checkpoint help; actual exam Pinyin/translation still count as help.
- Choices from V5 remain in story memory, with branches reconverging to mandatory teaching scenes.

## Acceptance tests
1. Story beat IDs, localized text and migration validated.
2. All ten scenes still accessible with story pages, two choices, saved progress, retake and replay.
3. Node unit and simulated integration tests; document any unverified CI results.
4. GitHub commit and Vercel production READY with the same SHA, HTTP 200 for page, core scripts and CSS; runtime errors checked.
5. Browser mobile/desktop E2E, native Mandarin audit and HSK3.0 curriculum mapping are future QA gates, not completed by a successful static deploy.

## Reproduction
Run: node --test hsk-story/tests/*.test.cjs
Run: node --check hsk-story/app.js

## Honest product limits
This is a deeper HSK1 pilot episode, NOT full HSK1, HSK2–5, real AI conversation, pronunciation scoring or licensed final artwork.
