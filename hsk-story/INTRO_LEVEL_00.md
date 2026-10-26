# Chương 00 — Nhập môn: Bí mật của chữ Hán
Revision: 2026-10-26. A short OPTIONAL prologue added in front of HSK 1. Route: /nhap-mon.html on hsk.motngum.cafe.

## Story/product intention
The user specifically likes little narratives about why Chinese characters look the way they do and playful composition jokes (not a conventional flashcard/memorization course). Make a low-pressure entry to Hai quê hương: mother shows Minh An how to look at Chinese characters like tiny stories before the first day of school. Listening is optional; all explanatory text is Vietnamese; Chinese glyphs in large, readable type and Pinyin only as support. It is a **level 00 / Pre-HSK activity** in product terminology, NOT an official HSK 0 exam/course/qualification.

## Narrative progression (9 scene pages)
1. Mother opens the notebook; touch 人, 木, 日, 月 to discover what the shapes mean.
2. One horizontal stroke, two, three: build 一 二 三 in top-to-bottom writing order.
3. Trees 木 → 林 → 森. Tap 1/2/3 trees and watch graphic/meaning change.
4. People 人 → 从 → 众. Tap 1/2/3 people, explain "follow"/"a crowd" with simplified/traditional caveat.
5. 日 + 月 → 明 (bright). Offer a contemporary easy mnemonic; avoid claiming every explanation is the unique original paleographic account.
6. 女 semantic + 马 phonetic → 妈 (mā, mother). Explicitly explain that not every constituent contributes meaning; 马 mǎ suggests a similar syllable, with different tone.
7. User's remembered online joke: "two/three women make a market". Show the verified fact: 女 = woman; 奻 (nuán) is a rare obsolete character glossed as quarreling; 姦 (jiān) historically had pejorative senses and reflects prejudiced beliefs of its formation period. Neither means "market". Never use archaic disparaging definitions to stereotype women today or present them as productive contemporary vocabulary.
8. Low-stakes optional 4-question visual-recognition quiz for 林 众 妈 明. A wrong choice receives explanation; no scored HSK certificate or attempt data is transmitted.
9. Minh An puts the notebook into the schoolbag and opens HSK1. Direct entry to HSK1 is always available regardless of Chapter 00 completion.

## Pedagogical contract
Aim = reduce initial fear of glyphs, build visual familiarity, recognize a few shape-to-meaning associations, discover phonosemantic compounds. NOT = teach full stroke order for all characters, accurate phonetic/tonal evaluation, guarantee character etymology from component mnemonics, or certify ability.
Five categories to keep distinct in every subsequent story: pictographic memory cue; present-day character construction; phonetic clues; verified historical etymology; folk joke. Every joke must be fact checked. Teacher verification of Mandarin pronunciation, historical glosses and Vietnamese explanation still valuable prior to a formal educational release.

## Architecture / isolation
New independent static assets: intro-data.js (typed educational content and sources), intro-core.js (pure bounded progress reducer), intro.js (accessible HTML DOM interaction and optional browser TTS), intro.css, nhap-mon.html. Parent index.html gains a prominent pre-HSK entry; original HSK1 app.js, content-manifest.js, story graph, school grade, scene indices, old save remain unchanged.
Progress in localStorage key **hai-que-huong-intro-v1**, separate from existing **hai-que-huong-progress-v3**. No accounts or raw audio required; optional browser speechSynthesis depends on device/provider. Resumable; replay wipes only Chapter 00. New intro does not hold a completion gate before HSK1.
No external image assets are generated here because the user prefers to do final illustration in Codex. Typography, flat parchment/ink UI and responsive layout are an interim product design, not an AI-rendered reference-fidelity illustration.

## Fact-checking and sources
- Ministry of Education, Taiwan, basic stroke order (top to bottom for 三): https://stroke-order.learningweb.moe.edu.tw/page.jsp?ID=46&la=0
- Online Confucius Institute at Open University, easy associative groups 木 林 森 and 人 从 众: https://stadium.open.ac.uk/berrill/documents/20220717_2022_06_01_Yan_Tong_edited_transcript_5_.pdf
- Modern historical description of Mandarin phonosemantic characters and 妈 / 女 + 马: https://library.oapen.org/bitstream/handle/20.500.12657/93394/external_content.pdf?isAllowed=y&sequence=1
- Academia Sinica paleography 姦: https://chardb.iis.sinica.edu.tw/evolution.jsp?cid=9711
- Chinese dictionary record 奻 (rare and historical): https://www.moshuyuan.com/zh-tw/dict/zidian/%E5%A5%BB
- 日+月 present-day glyph 明, alternative historical form 朙: https://www.kanjipedia.jp/kanji/0006677500

## Future enhancements (Codex art handoff)
Two-page mother/An indoor scene original ink-and-gouache, SVG-free approved layered artwork, animated stroke direction for 一二三, tree/people composition cards with accurate labels, visual light overlay of 日/月, mother/horse phonetic guide, respectful folk-etymology note, a notebook-style summary. Handwriting canvas should be delayed until true stroke-data/order validation exists. Do not recreate a copyrighted historical chart without rights.

## Acceptance
- Nine pages open and navigation back/forth/resume works in old browsers that support modern JS; speech read is optional and has clear unavailable fallback.
- Stroke count never exceeds 3; inspected glyph never duplicates; group quantities constrained; quiz answers can't set HSK mastery.
- Chapter 00 storage cannot overwrite HSK1 storage.
- Main HSK1 start and resume retain their original DOM IDs and listeners.
- Node unit/mock UI tests passed in CI, Vercel HSK production SHA READY, /nhap-mon.html and CSS/JS return HTTP 200.
- Actual browser/phone screenshot UX and Chinese native-educator review remain separate release gates; passing CI is not proof of them.
