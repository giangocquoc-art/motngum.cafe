# Chim Sẻ — NPC expression atlases

These active atlases replace the one-face runtime mappings from `supporting-cast-v2.webp`. The older sheet stays in the repo as an identity reference. PNGs are source masters; lossless WebP atlases are served by the game.

## Shared generation contract

- Built with the built-in image generation tool. Every master is a transparent 1536×1024 PNG: three columns, two rows, six equal 512×512 cells in row-major order.
- Identity/clothes come from the matching legacy cast crop and `supporting-cast-v2.png`. The line/color reference is the first reviewed Chim Sẻ character atlas. Do not transfer a face, clothing, hair or age from a different cast member.
- Keep the same pose and framing through all six cells; vary the eyes, brows, mouth, gaze and a slight head angle. Use imperfect dark ink, quiet muted watercolor, very light paper grain, simple readable faces and restrained shading. Keep all marks inside their cell.
- Each atlas has alpha. Use the `face` rectangle in `art/manifest.json` for bird collision avoidance. The manifest contains the prompt summary, source PNG path, served WebP path, byte count and alpha metadata.
- Never add a second Sẻ to a character atlas. Sẻ remains its own single sprite layer.

## Active atlas map

| Character | Master / served asset | Cells, row-major |
| --- | --- | --- |
| Mother | `mother-expressions-v1.png` / `mother-expressions-v1.webp` | neutral, gentle, speaking, laughing, concerned, thinking |
| Tiểu Vũ | `xiaoyu-expressions-v1.png` / `xiaoyu-expressions-v1.webp` | neutral, friendly, speaking, laughing, surprised, thoughtful |
| Cô Vương | `wang-expressions-v1.png` / `wang-expressions-v1.webp` | neutral, smile, speaking, thinking, worried, surprised |
| Bà Lưu | `liu-expressions-v1.png` / `liu-expressions-v1.webp` | neutral (eyes open, mouth closed), smile, speaking, laughing, curious, determined |
| Cô trực | `receptionist-expressions-v1.png` / `receptionist-expressions-v1.webp` | neutral, welcoming, speaking, listening, puzzled, reassuring |
| Tiểu Vũ, pose ngồi quán mì | `xiaoyu-noodle-expressions-v1.png` / `xiaoyu-noodle-expressions-v1.webp` | neutral, friendly, speaking, laughing, surprised, thoughtful |

## Prompt set

Prompts used a shared request: **one transparent six-frame atlas, three columns by two rows, same character and pose in all six cells, exact identity from the named source, handmade children's picture-book ink with gently uneven outlines, simple readable expressions, muted flat watercolor and light paper grain; no text, labels, borders, background, extra figures, birds, glossy anime polish, vector lines, dramatic shading or outfit/age changes.** The complete concise prompt summary is in each atlas entry in `manifest.json`.

- **Mother:** exact adult Chinese mother from `mother-v2.png`: dark low bun, rust-brown jacket, cream shirt, olive trousers and canvas tote. Six moods: gentle neutral, reassuring smile, speaking softly, quietly amused, mildly concerned and thoughtful.
- **Tiểu Vũ:** exact 11-year-old boy from `xiaoyu-v2.png`: short tousled black hair, bright blue jacket, white shirt and dark-blue backpack straps; visually distinct from An's mustard hoodie. Six moods: shy neutral, friendly, speaking, natural laugh, surprised and thoughtful.
- **Cô Vương:** exact adult teacher from `wang-v2.png`: short dark bob, round glasses, sage jacket, cream blouse, dark skirt and brown book. Six moods: calm attentive, encouraging smile, speaking, thoughtful, mildly worried and pleasantly surprised.
- **Bà Lưu:** exact elderly owner from `liu-v2.png`: round lined face, silver hair under a blue kerchief, cream blouse and navy apron. Six moods: open-eyed closed-mouth neutral, gentle smile, warm speech, soft laugh, curious and quietly determined. The current neutral cell must not reuse her old broad laugh.
- **Cô trực:** exact adult receptionist from `receptionist-v2.png`: low dark ponytail, no glasses, teal-gray jacket and cream blouse. Keep her visually distinct from cô Vương. Six moods: attentive neutral, warm welcome, speaking gently, listening, mildly puzzled and reassuring.
- **Tiểu Vũ seated:** exact seated pose from `xiaoyu-noodle-seated-v1.png`, matched to `xiaoyu-v2.png`: blue jacket, white shirt, backpack straps and hands just above the unseen table. Six moods: attentive neutral, friendly, speaking, natural laugh, surprised and thoughtfully concerned. No table or bowl is included in these sprites.

Scene choices stay in `art/manifest.json`; do not put dialogue text in the artwork. Run `node scripts/build-scene-manifest.cjs` after manifest edits, then `node --test --test-reporter=dot tests/*.cjs` and the browser gate. Inspect the assembled scene at phone size before accepting a frame mapping.
