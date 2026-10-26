# Gate 3B-1 — Optional curiosity in Chapter 00 (2026-10-26)

This is a **stacked draft** on Gate 3A (PR #4). Production and main remain unchanged. Before this change, page 7 of the nine-page pre-HSK story presented rare 奻/姦 historical and gender-coded characters by default; zero-literacy learners could perceive them as mandatory vocabulary before HSK1.

Changes:
- Keep page indices 0–8, core chapters and the legacy localStorage key `hai-que-huong-intro-v1` unchanged. Do NOT delete the folk joke or historical material.
- Page 7 now says simply that a Hanzi joke might not match a dictionary meaning. The detailed note is **user-opened**, not required to continue. Reading requires explicit click and can be closed; the next-page route remains always available.
- Optional detail panel explains 女 / 奻 / 姦 respectfully: rare characters are historical, not equivalent to “market”, and are not words the child must learn or claims about women today.
- `curiosityOpen` is a validated, backward-compatible optional field; old `legendRead` remains for readers who explored it earlier. Leaving page 7 auto-closes the detail, without losing recorded progress.
- Large glyph and Pinyin change only while the optional note is open. Optional spoken glyph stays 女, not an unintroduced archaic phrase.
- New core, mock-UI and Chromium checks test bypass, open/close, reload, and no corruption of the HSK1 save. No scores or HSK certification.
- Human language review and original layered illustrations remain pending. No image generation in this branch.

**Do not merge into main independently**: expected base PR #4 (itself stacked on PR #3). Acceptance: unchanged nine-page journey, desktop/mobile browser pass, 100% Node regression, preview READY.