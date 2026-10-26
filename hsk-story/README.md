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

## V5 choices and memory
- After scene 2, choose how Minh An finds a classroom seat (friend vs teacher). After scene 4, choose noodle taste (mild vs some chili). Each option has a short Chinese/translated flavor beat in the next scene, with all mandated learning scenes preserved.
- Story choices are not graded Mandarin tasks. Options persist in the existing compatible v3 storage payload, survive reload and quiz retake, appear in An's journal, and reset only upon full replay.
- Author in `story-director.js` and do not bypass its `validate`/`pending`/`select` checks. No LLM integration yet.

## V6 — Learning integrity and narrative pacing
- Five authored, **unscored** bilingual story pages at important scene entrances. They provide context before action, do not unlock any learning objectives, and are persisted in existing v3 local storage with V5 migration.
- Answer-bearing vocabulary is opt-in during practice; opening it marks the attempt as helped. It is available after resolving the scene for consolidation.
- Minh An's notebook does not show expressions from the current scene before the player has attempted it or explicitly requested assistance.
- Reading narrative captions before the in-world checkpoint does not affect the checkpoint score. Pinyin/translation used to solve an actual checkpoint still counts as assistance.
- HSK1 content remains a **pilot episode only**; see MASTER_EXECUTION_PLAN_V6.md and RELEASE_QA_V6.md.

## V7: authored content contract and honest phrase scaffolding

The original five chapter cards, ten scored scene dialogues, and ten NPC responses are now in `content-manifest.js`. The renderer references `HSKContent` and validates correspondence with the curriculum before starting. Scene IDs 0–9 are retained for backwards compatibility with local `hai-que-huong-progress-v3` saves. Changing their order or meaning now requires an explicit migration and QA review.

The phrase-tile construction board is not shown automatically. The player must explicitly press **Mở bộ ghép câu** to see it; this action immediately sets the assisted-learning flag, even if they later type the whole answer manually. Checkpoint scenes cannot use phrase tiles.

Content authors should update the manifest and its localized reply together, run `node --test hsk-story/tests/*.test.cjs`, and review `MASTER_EXECUTION_PLAN_V7.md`. V7 is a correctness-focused foundation, still an HSK1 pilot rather than a completed HSK curriculum, AI voice tutor or finalized artwork.

## V8 — diary recovery and transfer
The first interactive story event occurs after counting in class and before cafeteria: explore two clues, choose friend or teacher, introduce An to a school staff member in a new setting and recover the notebook mother gave them. Dialogue choices change later callback and the ending. HSK school test scores are still independent from this formative retrieval result.
Source: active-encounter.js; authored storyboard: EPISODE_01_STORYBOARD_V8.md; release plan and quality notes: MASTER_EXECUTION_PLAN_V8.md and RELEASE_QA_V8.md. Scene IDs 0-9 and pre-existing saved games remain compatible. Full HSK1, unrestricted AI conversation and final artwork are still not complete.
