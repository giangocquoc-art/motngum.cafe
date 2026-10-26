# Gate 3B-2 — Meaningful world objects and Hanzi callbacks
Date: 2026-10-26. Stacked branch `feature/hsk-world-context-bridge` based on Gate 3B-1 PR #5 (which depends on #4 and #3).

## Intent
Keep visual exploration voluntary and grounded in Minh An's actual journey. No new quest gate, score, fake vocabulary mastery, or future-story leak. Preserve all six V9 object IDs and their original descriptions; add structured bridge/callback metadata for the same two observed scenes.

## Changes
- Arrival street: the window recalls 日 from the beginner diary, suitcase connects to An's roots, and mother's notebook brings back 妈. Learners without Chapter00 progress get a neutral introduction instead of falsely being told they remembered the word.
- Walk home: the tree recalls 木/林/森 from Chapter00 and, if the arrival window was observed, An's view of the trees earlier that morning. Liu's noodle place revisits 谢谢 from the actual canteen dialogue. The notebook recalls 明 / 明天; if the player observed it on arrival, An notices how it now holds memories of Xiao Yu.
- Persistence: new optional `worldFocus` records the selected inspectable object per stable sceneRef in legacy V3 and V4 shadow. The existing `worldSeen` shape and all six IDs stay unchanged. On load, `cleanFocus()` accepts a focused object only if it has actually been inspected; forged and future locations are discarded.
- Scene navigation clears outdated description UI, but returning to a previously inspected scene can restore that scene's last object. No old description leaks into a different scene.
- The six existing controls remain textual while Codex produces layered art. Do NOT claim actual on-image hotspots or art-complete V12 in this PR.
- World observations remain outside `history`, HSKCore grading, school checkpoints, and official curricula; bridges are contextual recognition invitations, not claims of mastery.

## Acceptance
- Tests cover lesson glyph bridge with/without Chapter00 progress, prior-scene callbacks, saved selected objects, and input sanitization; explicitly verify no grade changes.
- Real Chromium desktop 1280px and 360px mobile explore the arrival window/diary, later the school tree, complete full 10-scene HSK1 story and three checkpoints, and verify both V3 and V4 shadow worldFocus persistence.
- Node 114+ baseline and prior stacked tests must remain green; Vercel preview exact SHA READY. Production/main untouched.
- No HSK content reordering or localStorage deletion; human Chinese proofing, accessible animated graphical hotspots and mobile art review remain future separate tasks.
