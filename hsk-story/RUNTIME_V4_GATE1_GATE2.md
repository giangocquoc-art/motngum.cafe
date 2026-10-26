# V4 Story Runtime — Gate 1 & Gate 2 safety audit
Date: 2026-10-26. Branch: refactor/hsk-runtime-graph-v4. BASE: cba551bd7810d7bd86f70611f1bb8f46a289f23a.

## Actual implementation
- Explicit stable-ID directed graph edges for ten published HSK1 scenes. Validate unreachable, duplicate, missing and cyclic paths. Historic numeric indices 0–9 preserved.
- Pure story-runtime.js transition controller rejects unresolved objectives, pending diary quest, story interludes, authored branches or skill sampler. app.js derives next scene from graph ID instead of incrementing numeric index.
- Legacy progress key hai-que-huong-progress-v3 REMAINS AUTHORITATIVE on reads and is saved first. New shadow key hai-que-huong-progress-v4 stores derived stable scene ID, memory, skill evidence and pending inputs, plus exact serialized V3 signature. V4 is NOT the authoritative reader yet; no destructive migration.
- Browser speech synthesis: mark playback complete only on SpeechSynthesisUtterance.onend, NOT merely calling speak(). Failure, absent browser synthesis and queued-only/no onend remain unassessed; still not verified audiological/HSK listening ability.
- GitHub CI gains real Chromium Playwright browser smoke desktop 1280px and mobile 360px: Chapter00, interactive HSK1 story incl notebook quest, choices, school checkpoints, reload, independent V3/V4 saves and screenshot artifacts.

## Not changed in this PR
- Do not move optional skill sampler or Intro rare-glyph folklore: that is Gate 3 after browser and graph tests green.
- No HSK2–5 unlock, no official curriculum claims, no deletion or renaming of legacy save, no new account/AI API and no art replacement.
- No change to motngum.cafe parent Next.js app, Cloudflare DNS, Vercel project settings or unrelated branches.

## Acceptance
- Existing 114 Node regression checks plus added unit/browser tests must pass; no skipped tests.
- Graph contains every mandatory scene including all three classroom assessments; no scene ID reindex and no bypass of unfinished event.
- V3 old, partial, completed and replay/retake states remain readable; forged/stale V4 snapshot is rejected; shadow storage failure is tolerated.
- Chromium tests run on PR in GitHub Actions, capture desktop and 360px mobile screenshots. Browser smoke ≠ real user/teacher/physical-device acceptance.
- Exact Vercel preview SHA READY; main unchanged until PR review and permission for deployment.

## Rollback
- Snapshot safety/hsk-story-pre-streamline-20261026 points at baseline production SHA cba551b.
- Revert PR merge or rollback Vercel deployment if future rollout fails; V3 remains intact so existing production can read older saves.
- After proving parity and backfill, a later dedicated feature flag may enable V4 reads. Avoid claiming migration done before that separate acceptance.

## Next gate
Gate 3: move sampler to optional in-story branch and preserve returnTo/draft, keep Hanzi joke as opt-in, contextualize only useful environmental hotspots. Never delete source modules as part of the first split.