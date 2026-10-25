# HSK Story v2 — Logic audit and remediation

Deployment: hsk.motngum.cafe. All changes scoped to \`hsk-story/\`. Parent motngum.cafe site untouched.

## Findings and fixes

| Severity | Previous behavior | v2 correction |
| --- | --- | --- |
| P0 | Any input merely containing an accepted phrase could pass, including negated sentences. | Exact punctuation-insensitive templates; bounded variation for name, date and drinks; no arbitrary substring approval. Evaluation unit-test cases. |
| P0 | Step advanced before visual transition and could be submitted repeatedly. | State transition is user-controlled via **Tiếp tục**; no auto-advance; input disabled after resolution. |
| P1 | Pinyin/translation toggles called renderStep and discarded the answer. | Independent display update preserves input, feedback and current scene. |
| P1 | Reload/re-entry after completion forced last exam question. | Dedicated result screen + explicit replay from first scene; v2 persistence and legacy migration. |
| P1 | NPC states price then user redundantly asks price. | NPC announces 10 yuan; learner practices thanking the shopkeeper. |
| P1 | One sentence claimed to complete HSK 1. | Three-part end-of-episode checkpoint; wording clarifies episode completion, not language proficiency or official certification. |
| P1 | Learner could be stuck forever with no way to continue. | Hint / model answer assist path clearly counted as assisted, not independently correct. |
| P2 | Input feedback only says “correct,” no NPC response. | Speaker replies to each resolved exchange, with Chinese, Pinyin and Vietnamese translation. |
| P2 | Voice features risk being mistaken for tone scoring. | Disclose browser-dependent speech recognition and explicitly state no tone/pronunciation scoring. |
| P2 | Keyboard focus can escape modal. | Focus trap + focus restored on close; escape closes; chapter cards respond to Enter/Space. |

## New learner rules

- 7 story dialogues followed by 3 assessment tasks: self-introduction, weekday listening comprehension, ordering a drink.
- Progress stored locally on this device using \`hai-que-huong-progress-v2\`. No account/cloud sync.
- Answers need simplified Chinese characters; normalized punctuation and spaces do not affect strict phrase matching.
- For flexible sentence forms, use explicit vetted templates only. This is **not** semantic natural-language understanding.
- Guided practice counts the number answered independently and the number completed with help.
- HSK 2–5 are visible roadmap placeholders, not playable lessons.
- The 10-scene demo is **not** sufficient to prepare for an official HSK 1 examination.
- Browser speech APIs are optional and device-dependent; microphone speech may involve the browser vendor's online recognition service. Do not claim voice privacy or grading without validating the platform.

## Remaining product priorities

1. Professional curriculum mapping to verified HSK 3.0 skill/lexicon objectives and level-specific assessment rubrics.
2. Branching deterministic story graph + scene design editor. Before using generative NPCs, ensure continuity and teaching constraints.
3. Carefully evaluated AI dialog back end, bounded language difficulty, sensitive student data/privacy, anti-hallucination checks, rate limits, token budgets and monitoring.
4. Mandarin ASR/TTS and tone scoring with human-calibrated benchmarks, on-supported-browser fallbacks.
5. Licensed/commissioned illustrated visual assets and consistent character sprites, rather than placeholder procedural SVG.
6. Real end-to-end browser/device testing (not performed by this audit).

## Additional consistency hardening

- Locked protagonist name to Minh An: accepting arbitrary names while NPCs keep addressing the protagonist as An broke continuity.
- Added hinted-correct classification (not independently solved) and exam scoring without hints.
- Abort active speech recognition upon completing a scene; prevent late microphone results writing into another scene.
- Reset v1 progress on v2 migration because old scoring could be fooled by negated phrases; keep original v1 key intact.
