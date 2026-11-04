# Content review handoff

Run `node hsk-story/scripts/audit-content-review.cjs` for a concise handoff report or add `--json` for the machine-readable report and SHA-256 fingerprints. The tool reads the existing content manifest, curriculum, learning blueprint, and future act plans. It does not author or certify curriculum.

## Scope

The report covers the ten current lesson scenes, eight HSK 1 pilot objectives, and thirty future objective proposals. The future proposals and levels 2–6 remain locked. The source inventory is useful for locating the official syllabus, but a complete source inventory is not a completed objective crosswalk or teacher review.

Each lesson fingerprint includes its Mandarin, Pinyin, Vietnamese, request, accepted answers, model, hint, curriculum words, linked objectives, source references, and practice/review IDs. Each objective fingerprint includes its candidate task/content, source locators and item IDs, skills, stages, and any linked future story episodes. A change to any included field changes that unit's fingerprint and makes its old receipt stale.

## Receipt policy

`content-review.json` starts with an empty receipt list. Human reviewers may add receipts only after performing the review. Every receipt must include:

- `unitId`: `lesson:<sceneId>` or `objective:<objectiveId>` from the current report.
- `scope`: `language` or `source-match`.
- `reviewerId` and `qualification`: explicit identity and relevant qualification.
- `date`: the actual review date in `YYYY-MM-DD` format.
- `fingerprint`: the unit's current SHA-256 value from `--json`.
- `sourceItemRefs`: one or more official source item references reviewed for the receipt.

The tool rejects unknown unit IDs, unknown scopes, duplicate scope receipts, incomplete reviewer details, malformed dates, missing or unknown source-item IDs, and stale fingerprints. Source-item IDs must exist in the versioned official source inventory. A source-match receipt does not itself complete the blueprint crosswalk: the objective data must also contain reviewed item IDs and reviewed match statuses. Never add a receipt to represent planned or unperformed review.

Receipts document human evidence; they do not change runtime, assessment, release unlocks, or gameplay. The ledger is explicitly excluded from the Vercel package by `.vercelignore`.

## Remaining handoff

For each objective, report source-crosswalk gaps by component and candidate skill profile. Current skill gaps remain unvalidated, including speaking, handwriting, and validated native audio. The report does not infer official HSK readiness from playability, the syllabus inventory, or candidate skills. Preview delivery can use this report as an optional review gate after reviewers begin supplying real receipts; no mandatory CI gate is configured here.
