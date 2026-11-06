# Day 2 kitchen — approved composition and asset record

**Status: approved by the owner.** Desktop and mobile plates were generated as separate compositions and connected to the listed morning scenes. Background artwork contains no people or bird; the renderer adds one live Sẻ sprite.

## Narrative coverage

One kitchen set supports `day2-arrival`, `day2-home-quiet`, `day2-guest-arrives`, `day2-breakfast`, `day2-confession`, `day2-mother-explains`, and `day2-guest-prep`. It replaces the misleading bedroom plate for morning dialogue; `day2-night` stays in the bedroom.

The scene needs to read as An's home in Chengdu at breakfast time. Keep the lived-in ordinary details and restrained expression of the currently approved Chim Sẻ production art: slightly uneven ink contours, flat muted colors, warm paper, simple readable silhouettes. No lettering, lesson text, captions, labels, or generated pseudo-writing in either plate.

## Shared staging rules

- Background plate contains the kitchen, table, chair, window/counter, breakfast setting, and school bag; it contains no people or live bird. Keep the table and doorway/window geometry consistent between device plates.
- Runtime character sprites provide An and Mother; `day2-guest-prep` adds Tiểu Vũ. Do not paint these characters into a background.
- The renderer adds exactly one live Sẻ sprite. Place its perch on the window frame or curtain rail, away from all faces and from the dialogue card. Do not paint another bird, bird-shaped decoration, or second mascot into the plate.
- On the guest-prep scene, the paper drawing may be a separate prop only after its own approval. To avoid reading as a second Sẻ, show just a few unfinished pencil marks at the paper edge, not a complete bird silhouette. Otherwise omit it from the art; the story text can carry the detail.
- Keep the school bag and diary visually distinct: bag on or beside the chair, diary peeking out or lying beside it as described. No legible marks on the diary.
- Do not draw steam/food effects into the plate; any later animation is a separate approved layer.

## Standard 16:9 plate — tablet and medium-width composition

**Canvas direction:** 16:9 landscape, used when the art stage is close to that ratio (including tablet portrait). Ultra-wide desktop stages use the separately composed 3:1 panorama below.

```text
┌──────────────────────────────────────────────────────────────────┐
│ quiet window / soft morning light      shelf + small kitchen     │
│      one clear perch for Sẻ             counter, no writing      │
│                                                                  │
│ left: uncluttered wall / table edge     An + Mother sprite zone  │
│ dialogue card must stay readable       (faces in upper half)    │
│                                                                  │
│       breakfast table + two cups, bread; chair + faded-blue bag  │
└──────────────────────────────────────────────────────────────────┘
```

Keep the left third low-detail and low-contrast because the current wide story dialogue card occupies that side. Keep the character zone on the right visually quiet behind faces. The table should anchor the lower part of the picture without covering sprite faces or the Sẻ perch. `day2-guest-prep` has two sprites, An and Tiểu Vũ; Mother stays off-stage for that beat.

## Mobile story-stage plate — independent near-square composition

**Canvas direction:** near-square, composed for the actual top-of-screen game stage (about 390×362 on a 390×844 phone), not a full-height phone wallpaper. The first 9:19 draft is retained in the asset catalog as superseded source material; it cropped the window and table when placed in the real game stage.

```text
┌───────────────────────────┐
│ upper window, one Sẻ perch │
│ quiet wall / window light │
│                           │
│ An face       Mom face    │  ← below the measured dialogue card
│ (Xiao Yu joins to side or │
│  next to An on guest beat)│
│                           │
│ visible table and bag     │
└───────────────────────────┘
```

Place the perch near a top corner, outside the faces and the scene controls. Keep all faces visible in the stage; do not rely on a fixed-height guess in the artwork. Put the breakfast table across the lower third as context, not as a foreground occluder over character faces. Preserve enough horizontal separation for three faces during `day2-guest-prep`; if that cannot be done at the existing sprite sizes, use a closer two-person framing for kitchen scenes and transition to a distinct doorway composition for the friend arrival, pending its own review.

## Panorama plate — ultra-wide desktop and short landscape

**Canvas:** 2172×724 (3:1), used on ultra-wide desktop stages and centered into the short game stage at phone landscape sizes such as 844×390. The CSS story reader reserves most of the phone viewport, leaving a stage near 156 px tall; the background therefore uses a safe lower-center crop instead of shrinking the reader or clipping sprites. The panorama retains the kitchen window/counter, a narrow breakfast table, and the school bag. Dialogue overlay stays in the quiet left area. Desktop sprites are kept clear of breakfast and the bag. On short landscape, An and Mother shift left while Sẻ makes a small flight beat beside the bag, away from the top-right control.

```text
┌──────────────────────────────────────────────────────────────────────┐
│ blank left wall / overlay     window + counter       Sẻ perch        │
│                                                                        │
│                          An          Mother         clear control     │
│                 table + breakfast / diary / faded-blue bag             │
└──────────────────────────────────────────────────────────────────────┘
```

This variant is a composition for very wide stages, not a crop from the standard desktop plate or portrait. The 390×844 phone and 768×1024 tablet stages select their own compositions/plates.

## Beat-to-prop consistency

| Beat | People in frame | Visible story details |
|---|---|---|
| `day2-arrival` | An, Mother | warm breakfast; school bag and diary; morning window |
| `day2-home-quiet` | An, Mother | two cups; chair leg near An, matching his awkward moment |
| `day2-guest-arrives` | An, Mother | same kitchen; clear table corner for preparing; no Tiểu Vũ yet |
| `day2-breakfast` / choice results | An, Mother | bag open enough for lunchbox/diary context; no written labels |
| `day2-confession` | An, Mother | hands resting on table, calm listening posture |
| `day2-mother-explains` | An, Mother | closed/neutral book or dictionary with no legible pseudo-text |
| `day2-guest-prep` | An, Tiểu Vũ; Mother may stay off-stage | chairs pulled out; optional partial unfinished drawing prop only if approved |

Mood is carried by each existing character pose and small posture changes, not a new polished or idealized model. The composition must preserve the important faces at phone width and leave the learning interaction in HTML outside the artwork.

## Approved and implemented

- [x] Owner approved the current composition.
- [x] Omit the paper drawing from the background; there is no second bird silhouette.
- [x] Keep Tiểu Vũ on-stage only for `day2-guest-prep`; Mother is off-stage for that beat.
- [x] Generate a standard 16:9 plate, a near-square phone-stage composition, and a 3:1 panorama for ultra-wide desktop/short landscape; keep PNG masters and optimized WebP runtime assets in `art/manifest.json`.
- [x] Inspect the rendered desktop and 390×844 phone plates with the actual An/Mother/Sẻ sprites; the backpack, diary, table, faces and single perch remain visible.
- [x] Inspect the rendered 768×1024 tablet plate; its 1.61:1 stage selects the desktop plate with only a shallow crop, preserving the kitchen anchors.
- [x] Add and inspect a separate 3:1 short-landscape panorama, with sprite positions that keep faces in frame and keep Sẻ clear of the “Sẻ nói nhỏ” control.

