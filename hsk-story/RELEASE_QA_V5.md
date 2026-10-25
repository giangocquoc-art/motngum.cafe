# HSK STORY V5 - RELEASE & REGRESSION AUDIT (2026-10-26)

## What this release actually does
- Two authored emotional choice points within HSK1 demo, one after first meeting Xiao Yu and one after ordering noodles. Each branch adds distinct bilingual exposition to the following scene.
- Canonical story facts, mandatory lesson sequence, progress and exam coverage do not branch. Each optional story choice is saved separately from assessed Mandarin results.
- Choice memory appears in Minh An's notebook and survives reload and retake. Full replay clears it.
- Production remains a static scripted learning prototype, NOT free AI conversation, official HSK1 curriculum, tone scoring, or the user-reference final artwork.

## Automated evidence
- Pure story-director tests for graph reconvergence, payload sanitation and valid choice keys.
- Existing UI simulation extended to require a choice before advancing, validate branch retention in localStorage and follow-on narrative.
- Legacy scoring regression fixtures for scenes 8 (ten yuan) and 9 (ordering noodles) updated; previous weekday/drink fixtures incorrectly belonged to V2.
- Sentence bank regression aligned to actual practice scene 2; test for empty bank remains at exam scene 7.
- GitHub Actions path-scoped CI (Node 22, JS syntax, all tests). CI success must be verified in GitHub; adding a workflow alone is not proof it ran.

## Release gates
1. JS syntax + all DOM IDs exist, Story Director graph validation successful.
2. Simulated 40-step full story flow: scene completion, two choices, reload, notebook memory, checkpoint retake and replay.
3. Vercel deployment of latest commit READY, custom domain homepage/assets return HTTP 200, runtime error log inspected.
4. **Not yet verified**: real Chromium E2E, mobile viewport screenshot, performance metrics, human Mandarin editorial signoff, visual reference match and official HSK3.0 coverage.

## Reproduce
node --test hsk-story/tests/*.test.cjs
The CI workflow triggers only when hsk-story files or itself change.
