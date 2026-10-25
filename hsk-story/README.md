# 两个故乡 — Hai quê hương
A narrative Chinese-learning RPG prototype, created for hsk.motngum.cafe.

## Scope of this prototype
- Original vector storybook scenes, with warm muted colors, ink outlines, and simplified Chinese everyday environments; inspired by general visual characteristics, not a copy of the provided reference artwork.
- Five HSK chapters in the roadmap.
- Eight playable HSK 1 conversational story scenes and a small end-of-chapter test.
- Chinese text, optional Pinyin and Vietnamese translations, text-to-speech (browser voice), optional browser SpeechRecognition, typed answers, context hints, progress saved in localStorage.
- Accessible responsive design for desktop and mobile.

## Important limitations
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
