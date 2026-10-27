# Chim Sẻ illustration record

This file records the approved visual language and the assets connected to the story renderer. Full prompts, served paths, dimensions, alpha flags, and PNG master paths are also recorded in `manifest.json`.

## Reference language

- Owner-provided Chengdu noodle-shop drawing and Minh An concept sheet.
- Slightly wavering dark ink contours; visible searching strokes; muted, flat watercolor; warm paper grain.
- Everyday compositions with a little asymmetry. Expressions should show a specific feeling clearly, without polishing the children into idealized models.
- An is an 11-year-old boy with short tousled black hair, a mustard hoodie, and a faded blue-green backpack. Sẻ is one pale-blue sparrow with a cream belly and an orange beak.
- A scene background must not include Sẻ. Each rendered frame adds exactly one independent Sẻ sprite. Learning text stays in HTML.

## Connected assets

| Asset | Master | Purpose |
| --- | --- | --- |
| `characters/an-expressions-v3.webp` | `characters/an-expressions-v3.png` | An's six expression cells; shared by home and story scenes |
| `characters/sparrow-expressions-v2.webp` | `characters/sparrow-expressions-v2.png` | One independent Sẻ sprite with six moods |
| `characters/sparrow-icon-v2.webp` | cropped from the curious Sẻ cell | Brand seal, favicon, and compact identity marks |
| `characters/supporting-cast-v2.webp` | `characters/supporting-cast-v2.png` | Mother, Tiểu Vũ, cô Vương, bà Lưu, and the school receptionist |
| `backgrounds/noodle-shop-order-v5.webp` | `backgrounds/noodle-shop-order-v5.png` | Style pilot: hand-inked desktop noodle shop with the same An sprite line/color language |
| `backgrounds/mobile/mobile-noodle-shop-order-v4.webp` | `backgrounds/mobile/mobile-noodle-shop-order-v4.png` | Portrait style pilot, independently recomposed with a menu-safe wall area |
| `backgrounds/evening-street-v3.webp` | `backgrounds/evening-street-v3.png` | Dusk walk-home environment restyled to match hand-ink watercolor line language |
| `backgrounds/mobile/mobile-evening-street-v3.webp` | `backgrounds/mobile/mobile-evening-street-v3.png` | Independently recomposed portrait dusk lane with the noodle shop landmark |
| `backgrounds/school-office-v2.webp` | `backgrounds/school-office-v2.png` | Lost-property office restyled with matte floor, soft light and a visible evidence tray |
| `backgrounds/mobile/mobile-school-office-v2.webp` | `backgrounds/mobile/mobile-school-office-v2.png` | Portrait office keeps the found-notebook tray below the dialogue zone |
| `backgrounds/bedroom-v3.webp` | `backgrounds/bedroom-v3.png` | Opening bedroom plate with softened lamp light and hand-ink lines |
| `backgrounds/mobile/mobile-bedroom-v3.webp` | `backgrounds/mobile/mobile-bedroom-v3.png` | Portrait opening plate, independently composed and color-balanced to desktop |
| `backgrounds/classroom-v2.webp` | `backgrounds/classroom-v2.png` | Shared classroom plate; old WebP retained only as the source reference because its PNG master was missing |
| `backgrounds/mobile/mobile-classroom-v2.webp` | `backgrounds/mobile/mobile-classroom-v2.png` | Native portrait classroom layout with central sprite space |
| `backgrounds/school-gate-v3.webp` | `backgrounds/school-gate-v3.png` | Muted hand-ink school entrance, retaining gate, bicycle and tree |
| `backgrounds/mobile/mobile-school-gate-v3.webp` | `backgrounds/mobile/mobile-school-gate-v3.png` | Portrait entrance composition with gate below dialogue and open sprite pavement |
| `backgrounds/arrival-street-v2.webp` | `backgrounds/arrival-street-v2.png` | Wide street approach with the school set back in the distance, leading into the closer gate scene |
| `backgrounds/mobile/mobile-arrival-street-v2.webp` | `backgrounds/mobile/mobile-arrival-street-v2.png` | Independent portrait street approach with the school visible beyond trees and path |
| `layers/menu-panels-v1.webp` | `layers/menu-panels-v1.png` | One transparent menu strip, wall-mounted in the phone and desktop compositions |
| `layers/noodle-bowl-v3.webp` | `layers/noodle-bowl-v3.png` | Single transparent bowl; hidden until the order choice and visible during payment |
| `backgrounds/bedroom-v2.webp` and mobile companion | matching PNG masters | Nhập môn bedroom scene; same art in responsive desktop and portrait compositions |
| School-gate and evening-street v2 WebP files | matching PNG masters | Distinct school arrival and dusk walk-home scenes, each with a portrait phone composition |

PNG masters are retained for every active generated illustration; WebP versions are used by the application to reduce transfer size. Older character and background assets remain in the repo as legacy material and are not active in the current renderer.

## Prompting and production notes

- Bowl v2 clean: generated as one isolated transparent foreground bowl; edge cleanup removed residual red/yellow fringe before the WebP was made.
- Bedroom v2: generated as a desk-and-window background plate, then recomposed as a true portrait phone plate. Both exclude people and birds.
- School-gate and evening-street v2: generated distinct morning and dusk environment plates, each with an independently composed portrait phone plate. Background prompts exclude people and birds.

When adding or revising a scene, first decide the scene composition and character positions in `COMPOSITION.md`, then generate/edit each layer independently. Check the alpha edge on the cream paper color and check that exactly one Sẻ is visible after all layers are composed.

- School-gate style pass: keep the open teal gate, bicycle, foliage and facade, but soften harsh leaf shadows and contrast; the portrait plate independently places the gate below the dialogue zone.
- Arrival continuity pass: replace the old near-identical school-gate view with a neighborhood sidewalk leading toward the school; desktop and phone use separate compositions. The story now says Mother brings An to school on foot, without inventing a car that is absent from the scene.
- Classroom style pass: preserve windows, blank chalkboard, teacher desk and student desks while softening hard sunlight and replacing the missing-source old plate with newly cataloged PNG masters. All classroom-linked scenes share this background family.
- Bedroom style pass: retain the night city, open notebook, desk lamp and backpack. The portrait composition needed a separate color pass after its first draft came out too dark, so its final exposure now follows the landscape plate.
- School-office style pass: the notebook tray, counter, corridor, hooks and clothing remain in place; reflective floor and hard sunlight were softened. The independent phone composition keeps the tray below the dialogue-safe area.
- Walk-home style pass: desktop and portrait dusk plates preserve the Chengdu lane and noodle shop landmark while reducing cinematic glow and matching the noodle-shop ink/watercolor reference.
- Noodle-order sequence audit: desktop and mobile backgrounds are empty of served food. The menu is a separate measured wall layer, visible outside the dialogue card; the bowl enters only after the taste choice and stays visible for the price dialogue. The mobile menu and bowl anchors are checked against the live viewport, not only their source files.
- Noodle bowl v3 removes the side dish and chopsticks so the served bowl remains recognizable at phone size and can sit between the characters without covering a face.
- Supporting-cast expression pass: generated separate six-cell transparent atlases for Mother, Tiểu Vũ, cô Vương, bà Lưu, the school receptionist, and seated Tiểu Vũ. Each atlas uses the same hand-drawn line/color recipe, keeps its character identity and clothing stable, and now maps actual moods used in scenes instead of treating a single smile as `neutral`. The older cast sheet remains a reference; PNG masters, lossless WebP, prompts, face guides and scene mappings are cataloged in `manifest.json` and `CHARACTER_ATLASES.md`.

- Noodle-shop style pilot: rebuilt desktop and phone backgrounds from the same imperfect-ink/flat-watercolor recipe as An, with separate portrait composition. Full prompt and derivation are in `manifest.json`; this is the style baseline to test against remaining environments, not proof that all backgrounds have been harmonized.
