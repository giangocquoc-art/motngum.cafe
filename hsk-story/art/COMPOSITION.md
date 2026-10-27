# Chim Sẻ scene composition

This implements the approved hierarchy: story picture above, one current learning interaction below, within one viewport. Approval of that hierarchy does not imply approval of every existing illustration or exact character placement.

## One authored source

`manifest.json` supplies canonical story IDs, auxiliary opening/intro/review scenes, background plates, sprite frames, actor positions, face guide rectangles and optional foreground art. Run `node scripts/build-scene-manifest.cjs` from `hsk-story` after changing it. The generated `scene-manifest.js` is committed for synchronous static-page loading; `--check` prevents drift. Do not maintain a second hand-written scene registry.

`scene-renderer.js` and `scene-layers.css` compose all four entry points: opening, HSK1, Nhập môn, and review. Review selects the environment and cast of the already-unlocked source scene. The old SVG renderer and hidden HSK2–5 card illustrations are not loaded or built in the browser.

## Layers

| Order | Layer | Source |
| --- | --- | --- |
| 0 | Background | Independent landscape and portrait plates |
| 1 | Optional midground | `null` when unnecessary; the noodle wall menu uses a separate transparent layer |
| 2 | Characters | Actual cells in transparent sprite sheets |
| 3 | Optional foreground | One bowl in the two noodle scenes; otherwise `null` |
| 4 | Sẻ | Exactly one independent sprite, without a second bird in the dialogue |
| 5 | Dialogue and interaction | Readable HTML, outside the raster images |

The empty layer containers make stacking explicit without invented paths or requests for missing images. Sprite sheets are 3 columns × 2 rows, row-major. `spriteCharacters.frames` maps supported expressions to actual cells. NPCs currently have only `neutral`; their narrative emotion is recorded separately and must not be mistaken for a new pose. Add real generated variants before claiming a complete NPC expression set.

## Actor and dialogue regions

Actor `desktop` and `mobile` coordinates are percentages of the reserved actor region, not the full viewport. Bust illustrations intentionally end at the scene edge; faces, hair and meaningful gestures must stay visible. The noodle menu is an independent transparent wall prop on both device compositions: it stays below the dialogue on phones and in the open right-hand wall on desktop. The noodle-order background has no served food. The separate bowl appears only after An chooses a dish and remains in the payment scene. Both menu and bowl use per-device **source-image coordinates** (`x`, `y`, `width`) and the renderer maps them through the visible `object-fit: cover` crop. It therefore stays on the table in portrait, wide and short-landscape scenes instead of following a character sprite. Short phone landscape has a separate compact anchor because that crop compresses the available space between faces.

- Wide scenes: dialogue occupies the left half; characters occupy the right. The renderer measures the real header height, including safe-area padding.
- Portrait scenes: dialogue spans the top; the actor region begins below its measured bottom. The opening page reserves space above its bottom story copy instead.
- Story interludes: the lower reading panel sizes to its actual heading, paragraph and continue button. Extra viewport height belongs to the illustration; it is not reserved as blank panel height.
- Short landscape Nhập môn: narrative, Hanzi card and An use three separate columns. The Hanzi card remains HTML with a reachable listen button.
- Keyboard: the header collapses and the actor region is recomputed from the visible scene height. A tile tap does not focus the native keyboard. The picture and current answer remain visible.

The arrival approach, noodle-shop, walk-home, school-office, bedroom, school-gate and classroom style passes provide separate desktop and portrait plates with a matched line/color family. Arrival looks down the neighborhood street toward the school; the following gate scene moves closer to the entrance. The device-specific plate uses `(max-width:900px) and (orientation:portrait)`; the renderer selects prop coordinates from that same source plate, with a separate tablet anchor where its crop differs. Actor composition follows available scene dimensions, so a narrow picture after keyboard/learning-sheet changes can use the wide arrangement. Tablet portrait can author its own actor positions for a clear foreground object. ResizeObserver watches the scene, dialogue, glyph card and header; no scene advances automatically.

## Expressions, movement and loading

An uses real cells when thinking, hesitating after an incorrect response, and smiling after a resolved response. Nhập môn and review reuse that same selection code. Existing NPC images still need additional expressions. The current light entrance and Sẻ idle motion respect reduced motion; blink/wing/steam art is still pending, not simulated by a mood class.

Only the next scene background for the current device is preloaded. Shared sprite sheets reuse browser caching. Sources and prompts remain beside cataloged assets; some older background masters/provenance and original owner reference attachments are still missing.

## Verification

The browser gate walks the full story, notebook quest, both choices, intro and review. It checks viewport and ancestor clipping, one active scene, one Sẻ node, minimum face guide size, and face guide intersections with dialogue, glyph, mascot and foreground rectangles. It also checks real sprite-frame changes, preloading, keyboard contractions and a taller safe-area header. Foreground anchors are authored against the corresponding background plate, then face-checked in the rendered viewport.

These rectangles are manually authored guides; they do not prove exact alpha silhouettes or fidelity to the owner's drawing. Review settled screenshots as well. Before adding art, confirm identity, transparent edges, perspective, occlusion, the important object, and the single Sẻ in the actual background contents.
