# Chim Sẻ — visual guide

## Approved style authority

The currently released art on `hsk.motngum.cafe` is the visual authority. The capture at `reference/production-style-20261029.png` records its recognizable look: simple flat muted fills, sparse dark brown-gray contours, slightly imperfect hand-drawn lines, warm cream surroundings, readable silhouettes, and small everyday details. Keep the imperfection consistent across scenes and characters. The style is intentionally simple and emotionally clear; do not add watercolor grain, glossy polish, generic anime rendering, photorealism, or perfect vector geometry.

The owner's character concept sheet remains useful for identity, expression range and the lived-in Chengdu world. It does not override the live site's approved line weight, flat colors, or current character identity. Minh An is the 11-year-old boy established in the accepted game story, with slightly tousled dark hair, mustard hoodie and faded blue-green backpack. Sẻ is the small pale-blue sparrow with a cream belly, dark outline, round eye and small orange beak. Sẻ can be curious or mistaken; only An understands its words.

## Character and scene continuity

- Keep exactly one visible Sẻ in each ordinary story frame. If a background needs a perch, leave it empty; the renderer owns the single bird layer. Do not add bird drawings, silhouettes or pictures to the background.
- Keep every character's face, silhouette, clothes, proportions and small asymmetries stable. Show emotion through face, head angle, hands and shoulders instead of making An look polished or unusually composed.
- Give each scene a composition pass first. Record who is present and speaking, expression, prop continuity, foreground overlap, sparrow position and independently composed mobile/tablet view.
- Background plates contain no characters, Sẻ, lesson text, answer hints, captions, labels or UI. HTML owns all readable dialogue and learning content.
- Use actual generated raster art for approved new scene plates and sprites; do not substitute temporary inline SVG geometry for a requested generated illustration. Retain raster masters, optimized WebP runtime assets, prompt provenance and manifest entries.

## Responsive layered scenes

The shared renderer composes background, optional midground, character sprites, foreground/occlusion, one Sẻ sprite, and accessible HTML dialogue. The authored source is `art/manifest.json`, compiled by `node scripts/build-scene-manifest.cjs`. Portrait phone, portrait tablet, wide desktop and short landscape scenes use compositions designed for their visible stage area; they are not blindly cropped desktop pictures. Art must keep faces, props and interaction targets inside the scene region while the full game remains in one viewport.

## Prompt recipe

Use `reference/production-style-20261029.png` as the style reference for new art. Treat the current approved An/Sẻ sprite and the relevant NPC sheet as identity references when available. State that identity and line/color are separate references. Generate one layer at a time and name the viewport composition. Specify the exact scene props and what must remain empty for HTML or sprites. Explicitly exclude people and birds from backgrounds, and require true alpha for isolated sprite cutouts. Record the exact prompt, model path, source references, dimensions, alpha status and runtime filename in `art/manifest.json` and the prompt log.
