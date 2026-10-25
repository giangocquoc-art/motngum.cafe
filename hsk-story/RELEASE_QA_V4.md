# Release QA: HSK Story V4 — 2026-10-26
## Scope
Only the isolated hsk-story application. Main motngum.cafe project untouched.

## Shipped
- In-story journal presents *encountered*, not future, Chinese expressions; clickable words invoke browser Mandarin speech synthesis (quality depends on voice device).
- Beginner tile composer in 7 practice scenes; usage marked helped. Manual entry and optional browser speech-to-text remain available.
- Journal unavailable while an exam question is unresolved so it does not silently leak the answer.
- Recap flags practice scenes with failures, hints or answer reveal. Completion is never presented as a real HSK qualification.
- NPC feedback at school checkpoint 2 now confirms noodle price, checkpoint 3 confirms remembered noodle ordering (previously replied about weekdays and class admission).
- Deprecated an unused vocabulary term from the scene's learning strip.
- Durable browser-independent Node regression script story-ui.test.cjs added; existing tests remain.

## Verification claims
- JavaScript syntax and DOM ID references checked before pushing.
- UI simulation: 39 checks through building a sentence, journal controls, saved-scene path, all ten scenes, exam restrictions, and retake.
- Live domain assets 200 for HTML/CSS/JS; Vercel production reports READY and no runtime-error clusters when queried.
- IMPORTANT: Not a substitute for E2E with a real browser and real devices; Chromium in this environment could not resolve production DNS.
- Audio quality, native-speaker review, official HSK3 lexicon coverage and visual-match QA remain unverified.
## Reproduce in local repo
node --test hsk-story/tests/*.test.cjs
Preview static files using any simple HTTP server whose root is hsk-story/.
