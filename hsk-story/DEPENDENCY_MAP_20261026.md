# HSK — Dependency inventory / file owner map (baseline 2026-10-26)
Source: git cba551bd7810d7bd86f70611f1bb8f46a289f23a.

## Runtime dependency chains (the order is verified from the HTML)
### index.html
1. content-manifest.js → 5 roadmap chapter descriptors, 10 HSK1 scene prompts and NPC replies.
2. story-graph.js → 10 stable ref IDs and events metadata; app.js still increments numeric state.step.
3. scene-world.js → 6 optional objects at 2 scenes.
4. skill-sampler.js → read/listen mini sampler, UI gate at scene7.
5. game-core.js → scoring evaluator and summary.
6. curriculum-data.js → scene learning metadata and HSK1–5 roadmap.
7. learning-kit.js → sentence building/hint and notebook review.
8. story-director.js → two branch-choice authored callbacks.
9. story-beats.js → five narrative interludes.
10. active-encounter.js → lost-notebook quest reducer/branches.
11. app.js → DOM state, SVG sceneArt, navigation, score glue, persistence, TTS/mic.
12. intro-landing.js → read-only Chapter 00 progress status.

### nhap-mon.html
intro-data.js → intro-core.js → intro.js, plus intro.css. Separate localStorage key.

### Not imported by the live browser app
learning-blueprint.js and future-acts.js: test/editor only.
Markdown plans, historical QA and story notes: editorial assets, no browser bundle load.

## Source-to-branch target (change nothing until gate starts)
| File(s) | Keep/core or side | Why |
| --- | --- | --- |
| content-manifest.js, curriculum-data.js | core authored content | 10 original stable scene indices |
| story-graph.js | core/engine P0 | transition authoritativeness currently absent |
| story-director.js, story-beats.js | core/story | narrative memory and beats |
| active-encounter.js | core/quest | supports transferring language to real story problem |
| game-core.js | core/scoring | tested explicit meaning patterns, scores |
| app.js | core view + future split | currently ~46.8k characters, monolithic with SVG |
| learning-kit.js | side/help, still available everywhere needed | helpful to zero-literacy players; preserve assistance flag |
| scene-world.js | side/contextual hotspots | currently text-button observations, not art hotspots |
| skill-sampler.js | side/practice lab | currently blocks main step7; no verified playback evidence |
| nhap-mon.html + intro-*.js/css | optional Chapter 00 | different save key; doesn't gate HSK1 |
| future-acts.js | editor/story drafts | 16 HSK2–5 drafts, non-playable |
| learning-blueprint.js | editor/curriculum mapping | eight draft objectives, none officially signed-off |
| SVG inside app.js | fallback art; later replace via Codex | keep until approved assets load and fit mobile |
| docs V4–V9 | historical/docs | preserve Git history and fix navigation, not performance |
| CODEX_HANDOFF_V11_V12.md | sandbox handoff | AI and original art not production-ready |

## Hard invariants
- Key hai-que-huong-progress-v3 and numeric indices 0..9 must be readable on migration.
- Key hai-que-huong-intro-v1 stays separate.
- Intro completed is not official HSK status.
- HSK2–5 roadmap cards must not unlock without teacher review/content.
- Neither portrait-generating nor AI providers may directly edit memory event log or score.
- 114 baseline tests + new regression cases; real browser tests are missing.
- Parent website motngum.cafe and branches for unrelated games/meo-gioi remain untouched.

## Safer branch strategy
- safety/hsk-story-pre-streamline-20261026: exact production snapshot at cba551b.
- plan/hsk-core-sidepaths-20261026: this read-only planning proposal.
- one feature branch/PR per gate; do not move file paths in bulk or remove aliases before test.
- CI workflow currently tests HSK on main pushes and pull_requests touching hsk-story, not on standalone feature branch pushes. Open a draft PR before expecting CI to run.

## Priority risks
P0: blind state.step++ graph traversal + save v3 numeric ID migration.
P0: TTS request recorded as audioPlayed even without proof of audible result.
P1: skill sampler interrupting school story as mandatory panel.
P1: intro chronology vs first HSK1 scene arrival.
P1: 12 JS eager scripts and broad app.js concerns, but optimize AFTER behavioral tests.
P2: duplicated docs; future-acts and learning-blueprint are not loaded on website, so move for clarity only.
