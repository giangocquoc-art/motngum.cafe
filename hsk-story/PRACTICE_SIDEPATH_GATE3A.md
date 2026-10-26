# Gate 3A — Optional practice sidepath (stacked on Gate 1/2)
Date: 2026-10-26. Branch: feature/hsk-practice-sidepath. Parent: refactor/hsk-runtime-graph-v4 (PR #3).

## Product change
Before: at classroom checkpoint entry, every learner was forced to complete or skip two unrelated practice questions. It broke story pacing.
Now: on/after the first checkpoint the learner may voluntarily open a small practice panel. Story continues by default, with exactly the same mandatory scene IDs and assessments. The practice panel can be closed at any point and learner's draft, current HSK scene, score and branch decisions stay intact.

## Safety
- No component deleted. skill-sampler.js remains, save payload keeps skillSampler, practiceOpen flag is optional and false on older saves.
- Pending sample does NOT prevent advancement when the panel is closed; while open, it is not possible to submit a different story answer accidentally.
- Previous learners who already completed sampler keep their results. Full replay resets sampler; retake exams preserves completed prior sampler and closes the panel.
- TTS callback after exiting practice is ignored and speech synthesis is cancelled if supported.
- V3 remains load authority. V4 shadow includes practiceOpen in pending section (not live V4 reading).
- No official HSK language proficiency claim. Browser speech completion is NOT ear/sound verification.

## Test contract
- Node tests preserve all old story flows and add open/close branch, saved mid-practice reload, direct checkpoint access without opening practice, opt-in practice results and no audio evidence if TTS never completes.
- Real Chromium desktop opts in and closes practice with partial draft preserved; mobile completes all 10 scenes without opening optional practice. Both still pass original 3/3 assessment, notebook quest and progress save.
- PR must be reviewed and parent Gate1/2 must be merged before this stacked PR can target main; never independently merge feature into production while parent is still draft.

## Later Gate 3B
Move optional rare Hanzi historical joke into curiosity branch, keep nine-page intro timeline and save unchanged; make real object hotspots only when scene art is approved. No HTML/JS file removal during first split.