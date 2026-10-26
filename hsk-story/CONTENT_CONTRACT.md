# Authored content contract
- Every scene must have an immutable numeric or namespaced ID, chapter ID, place, time, character speaker, natural-language objective, HSK level, teaching/practice or checkpoint kind, prerequisite links, target words and grammar, Chinese dialogue, Pinyin and optional Vietnamese, accepted response intent, curated variants, hint policy and next scene.
- First introduce an objective, then repeat it through normal in-world dialogue, and only later assess independent recall. Checkpoints contain no brand-new mandatory content.
- Canonical story memory is separate from learner knowledge state. NPC responses must preserve character facts, location and stakes.
- Answers must be evaluated for meaning/intent in a validated AI grading phase; prototype uses conservative explicit templates, with known false negatives possible.
- Help is visible and consentful: showing a hint, pinyin/translation during a checkpoint or revealing a sample must reduce or change independent credit.
- Episode completion is NOT HSK certificate readiness. Repeated attempts can be used for formative practice; future exam rubrics need distinct skill-level evidence.
- Professional review required: native Mandarin editor, HSK3 syllabus mapping, listening and writing/reading requirements and source/version tagging.
- Content schema implementation: curriculum-data.js is roadmap and demo scene metadata. HSK1 full syllabus is NOT implemented. Its validate() function provides basic structural sanity only.

- Gate6 là bài ôn tự chọn sau khi hoàn thành cảnh, tách ba dạng reading, Hanzi recognition và typed Hanzi; không tuyên bố nghe, nói hay viết tay. Không sửa schema V3/V4.
- Lịch ôn 1/3/7/14 là heuristic, dữ liệu dưới key hai-que-huong-review-v1 độc lập; không đại diện toàn bộ nội dung chính thức HSK1.
