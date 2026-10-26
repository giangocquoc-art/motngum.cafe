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
| `backgrounds/noodle-shop-v2.webp` | `backgrounds/noodle-shop-v2.png` | Shared desktop noodle-shop environment plate |
| `backgrounds/mobile/mobile-noodle-shop-v3.webp` | `backgrounds/mobile/mobile-noodle-shop-v3.png` | Portrait phone environment plate; not a desktop crop |
| `layers/noodle-bowl-v2-clean.webp` | `layers/noodle-bowl-v2-clean.png` | Transparent bowl cutout, layered in ordering and payment scenes |
| `backgrounds/bedroom-v2.webp` and mobile companion | matching PNG masters | Nhập môn bedroom scene; same art in responsive desktop and portrait compositions |
| School-gate and evening-street v2 WebP files | matching PNG masters | Distinct school arrival and dusk walk-home scenes, each with a portrait phone composition |

PNG masters are retained for every active generated illustration; WebP versions are used by the application to reduce transfer size. Older character and background assets remain in the repo as legacy material and are not active in the current renderer.

## Prompting and production notes

- Bowl v2 clean: generated as one isolated transparent foreground bowl; edge cleanup removed residual red/yellow fringe before the WebP was made.
- Bedroom v2: generated as a desk-and-window background plate, then recomposed as a true portrait phone plate. Both exclude people and birds.
- School-gate and evening-street v2: generated distinct morning and dusk environment plates, each with an independently composed portrait phone plate. Background prompts exclude people and birds.

When adding or revising a scene, first decide the scene composition and character positions in `COMPOSITION.md`, then generate/edit each layer independently. Check the alpha edge on the cream paper color and check that exactly one Sẻ is visible after all layers are composed.
