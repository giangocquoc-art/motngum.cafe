# Chim Sẻ — visual guide

## Main reference

Use the character and world concept sheet shared by the project owner as the visual authority. It sets the character shapes, clothes, color swatches, paper, line, and the small everyday scene vignettes. Keep generated images in the same family: recognizable people drawn with a few expressive marks, imperfect ink that stays consistent from scene to scene, and quiet warm color. Do not substitute generic anime polish, vector shapes, photorealism, glossy lighting, or unrelated stock illustration.

## Character continuity

- **Minh An:** an 11-year-old boy; short, slightly tousled black hair; mustard yellow hoodie; faded blue-green backpack. The owner's explicit redesign plan controls identity; the supplied concept sheet controls line/color rather than changing An's gender or clothes. Keep childlike proportions and small asymmetries. Feelings should read through head angle, hands, shoulders and stance as well as the face. Never make An look like a polished adult model.
- **Sẻ:** a small, pale sky-blue sparrow with a cream belly, charcoal ink edge, dark round eye, and a small orange beak. It is curious and fallible, and only An understands its words.
- **Mother, Tiểu Vũ, cô Vương, bà Lưu, and the school receptionist:** keep their silhouettes, age, clothing and palette tied to their panels in the integrated `characters/supporting-cast-v2.webp`. Preserve their differences as well as the common drawing style. That sheet has one pose per person; it is not a complete expression set.

## Drawing and color

- Let black-brown pen contours wobble slightly and vary in pressure. Repeat the same face, hair silhouette, body proportions, clothing shapes and recurring object details. Imperfection should describe the person; it should not make the art style drift.
- Use warm cream paper, quiet flat watercolor fills, and muted orange, faded teal, dusty sage, tan, dark brown and occasional brick red. Keep the texture fine and low contrast so it does not compete with Chinese text.
- Scenes should feel observed and ordinary: a dish, chair, notebook, school gate, classroom window or neighborhood plant can carry the moment. Keep props readable and leave deliberate sprite and dialogue space.
- Never put Chinese lesson text, answer hints, captions, labels or generated pseudo-writing in an image. Dialogue and study text stay in HTML.
- Sprites and foreground cutouts need real alpha transparency. Give each expression or pose a clear silhouette and preserve the shared model sheet.

## Layers and responsive scenes

Scene art is assembled by `scene-layers.js`: background plate, midground, independent character sprites, foreground, and Sẻ. Dialogue, Hanzi, Pinyin, translation, choices and controls are accessible HTML above the art. Use separate portrait environment plates in `backgrounds/mobile/`; do not simply crop a landscape scene to make a phone composition. Characters should stay in frame and retain their face and meaningful hand gesture at both aspect ratios.

## Prompt recipe for future art

Always attach the owner-provided character concept sheet as a reference, together with the current An/Sẻ sprites and reviewed environment samples. Layout approval does not imply owner approval of every integrated image. Original conversation reference images are not yet stored in this repo; recover and save them before a new generation batch. Identify which reference controls identity and which controls line/color, then adapt this prompt to the requested single asset:

> Make one new Chim Sẻ story asset consistent with the owner's character concept sheet. Preserve the same slightly uneven black-ink contour, flat muted watercolor, warm textured cream paper, simple expressive faces, and small lived-in details. Match character shape, child proportions, clothing, face and palette to the approved sprite. Imperfect marks should feel deliberate and repeatable. Keep all learning text out of the image. Avoid glossy polish, generic anime, photorealism, crisp vector art, cinematic lighting and style drift. [Describe the single asset, pose/emotion, composition, and required transparent or landscape/portrait layout here.]

Record each finished file, dimensions, transparency, prompt and its role in `manifest.json`. Save the final optimized asset inside this repository and update the manifest before using it.
