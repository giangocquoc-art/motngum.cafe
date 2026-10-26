# Chim Sẻ scene composition

This is the approved frame plan. Keep this hierarchy and the per-scene device positions in `manifest.json` aligned with `scene-layers.js`. The layout reserves one Sparrow sprite per scene; do not put another Sparrow in a dialogue balloon or a background plate.

## Layer contract

| Order | Layer | Asset source |
| --- | --- | --- |
| 0 | Background | Scene-specific desktop and portrait paths in `backgrounds` |
| 1 | Midground | `layers/{sceneId}/midground.webp` placeholder |
| 2 | An and supporting characters | Transparent sprite sheets in `characters` |
| 3 | Foreground | Noodle bowl cutout in the two noodle scenes; other scenes keep `layers/{sceneId}/foreground.webp` placeholders |
| 4 | Sẻ | One transparent `characters/sparrow-expressions-v2.webp` sprite |
| 5 | Dialogue and controls | HTML rendered above the art |

The four layers remain in the scene DOM. Midground and unneeded foreground layers are intentionally empty; they do not render fake art or make network requests. The school gate, evening street, bedroom and noodle shop each have separately composed desktop and portrait phone backgrounds.

## Current v3 An and v2 companion sprite sheets

The active character sheets use a 3-column by 2-row, row-major grid. An v3 is an 11-year-old boy with tousled hair, a mustard hoodie, and a faded blue-green backpack; each cell holds one expression. Sẻ v2 uses one cell per expression. The supporting cast grid has Mother, Tiểu Vũ, cô Vương, bà Lưu and the school receptionist in cells 1–5; cell 6 is empty. CSS selects these cells by character class. The v1 WebP files remain packaged and are recorded as legacy assets in `manifest.json`.

Both noodle-shop story scenes serve `backgrounds/noodle-shop-v2.webp`; phones use the separately composed portrait `backgrounds/mobile/mobile-noodle-shop-v3.webp`. Each also has exactly one transparent foreground bowl image at `layers/noodle-bowl-v2-clean.webp`. PNG files remain the source masters and their paths are recorded beside each served WebP. The mobile plate is portrait 2:3. Each asset's role, dimensions, alpha, served byte size and generation prompt live in `manifest.json` under `assetCatalog`.

## Desktop scene frame

```text
┌──────────────────────────────────────────────────────────┐
│ Back      Episode name                        Notebook   │  quiet controls
│                                                          │
│     location detail            one Sparrow               │
│                                  An   other person         │
│                                                          │
│ ┌──────────── dialogue and expression ────────────┐       │
│ │ speaker · Hanzi · Pinyin/translation on request │       │
│ └─────────────────────────────────────────────────┘       │
├──────────────────────────────────────────────────────────┤
│ only the current answer · one contextual action           │
└──────────────────────────────────────────────────────────┘
```

At 1440×900, reserve the full viewport for the game shell. The scene occupies about 60% of the height, the answer area about 35%, and the slim top controls sit over the background. Leave the left lower quarter for the dialogue card. Keep speaking characters on the right half, with the one Sparrow near the active speaker. Feet may be behind the dialogue card when it is intentionally in front; no sprite may be cut by the scene frame. Each scene's desktop sprite positions are recorded under its `desktop` and actor `desktop` fields in the manifest.

## Phone scene frame

```text
┌─────────────────────┐
│ back          notes │
│                     │
│ portrait location   │
│     one Sparrow     │
│   An  ↔  partner    │
│ dialogue over lower │
├─────────────────────┤
│ short scene prompt  │
│ answer / keyboard   │
└─────────────────────┘
```

Use a location-specific portrait background, not a centered crop of desktop art. Keep faces and the relevant gesture above the dialogue card. The answer remains below the picture and uses safe-area padding. On short viewports, recompose and reduce simultaneous content; do not require scrolling or hide controls with overflow. Check both viewport bounds and clipping by ancestor elements. Each scene has separate mobile Sparrow and character positions under `mobile`; the renderer currently switches those rules at 690px.

## Composition checks before connecting new art

1. Count exactly one Sparrow illustration in the stage. A dialogue balloon is text and shape only; it must not draw a second mascot. `tests/scene-art.test.cjs` enforces one rendered Sparrow node per scene.
2. Confirm the speaker name and their face/gesture stay visible together.
3. Confirm sprites sit inside the frame on wide and tall screens, with no cut head, hand, or foot.
4. Confirm the dialogue card does not cover the speaking face or the object involved in the action.
5. Keep notes, language display choices and world inspection closed until asked for.
6. Confirm the next scene, art layer, and words align before enabling the scene transition.
