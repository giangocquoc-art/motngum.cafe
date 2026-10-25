# 两个故乡 — Hai quê hương
A narrative Chinese-learning RPG prototype, created for hsk.motngum.cafe.

## Scope of this prototype
- Original vector storybook scenes, with warm muted colors, ink outlines, and simplified Chinese everyday environments; inspired by general visual characteristics, not a copy of the provided reference artwork.
- Five HSK chapters in the roadmap.
- Seven narrative scenes plus three interactive end-of-episode checkpoint scenes.
- Chinese text, optional Pinyin and Vietnamese translations, text-to-speech (browser voice), optional browser SpeechRecognition, typed answers, context hints, progress saved in localStorage.
- Accessible responsive design for desktop and mobile.

## Important limitations
- Character name is intentionally locked to Minh An to preserve narrative continuity.
- V2 resets v1 episode progression because previous scoring was not reliable; original local saved data remains in a separate key.
- Hints, self-corrected answers and revealed answers are counted separately in the recap.
- This is an interactive prototype, NOT an AI conversation engine. It compares typed utterances with curated responses.
- The voice input uses browser Web Speech API support and may not work in some browsers. Chinese speech synthesis voice availability depends on device.
- Not an official HSK exam or validated Chinese curriculum; the five levels are a narrative roadmap, not a guarantee of proficiency or formal HSK pass.
- HSK 2–5 are illustrated but not playable yet. AI, speech scoring, account sync and production-grade analytics are not configured.

## Deployment
This standalone site lives under the /hsk-story directory of the existing motngum.cafe repository to avoid altering the existing site. Create a separate Vercel project with Root Directory = hsk-story, Framework Preset = Other, and connect hsk.motngum.cafe to that project. Cloudflare DNS needs a CNAME hsk -> cname.vercel-dns.com (DNS only) unless Vercel recommends a project-specific DNS target.

## Local development
Open index.html in a browser or use npx serve .
No credentials or npm dependencies are required.

## Art direction
Use original 2D storybook illustration style: fine slightly irregular dark ink outlines, muted pastel colors, flat fills, occasional ink accents, detailed but non-photorealistic Chinese streetscapes. The artwork is embedded as handcrafted SVG, not an AI-generated copy of the reference.

## Next production milestones
- Scene scripting and HSK 3.0 curriculum validation.
- Chinese conversation AI backend, secure rate limiting, cost controls and moderation.
- Reliable Mandarin ASR/TTS, pronunciation/tone evaluation with validated language data.
- Auth + database learning profiles; parent/guardian privacy considerations for minor users.

## V3 improvements
- Versioned five-act roadmap and educational scene metadata in curriculum-data.js (NOT a full HSK syllabus).
- Three exam checkpoints now recall previously taught content: self-introduction, price of noodles, ordering noodles. No surprise weekday/drink test.
- Checkpoints hide Pinyin and Vietnamese until explicitly requested; using them counts as help.
- Draft, previous attempts, resolved state and results persist across refresh. V2 story steps migrate, obsolete V2 exam results do not.
- Retake only 3 checkpoint scenes without resetting completed story.
- See MASTER_PLAN_2026.md, STORY_BIBLE.md, CONTENT_CONTRACT.md.

- Checkpoint independent success specifically means correct on first attempt without hints. Micro uses a browser-vendor speech service when enabled and app does not store raw recorded audio.

## V4 — learner-driven immersion
- In-world "Sổ tay của An" collects only vocabulary actually encountered and highlights scenes that required assistance or extra attempts. During an unresolved school checkpoint it is locked to avoid leaking answers.
- A tap-to-compose sentence builder supports new learners who cannot yet type Hanzi. It is clearly counted as scaffolding, never independent performance. Native typing and optional browser Mandarin speech recognition are preserved.
- Corrected checkpoint NPC responses: the noodle-price question receives a price confirmation, while the food-order question receives a response about ordering noodles.
- Production remains a deterministic, authored demo: not AI voice conversation or full official HSK preparation.

## Regression QA
From the repository root, run `node --test hsk-story/tests/*.test.cjs`. The `tests/story-ui.test.cjs` suite exercises the browser app with mocked DOM and storage (not a real Chromium E2E run). See `RELEASE_QA_V4.md`.
