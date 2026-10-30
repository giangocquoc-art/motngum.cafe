# NGOẠI TRUYỆN THỬ NGHIỆM — Ngày đầu của An

**Trạng thái:** Git feature branch ONLY. Không merge vào main, không gắn domain chính; deploy Vercel Preview để kiểm thử. Mục tiêu: thử nghiệm mô hình kể chuyện phân nhánh thật trước khi cân nhắc chuyển sang runtime gốc.

## Canon được đối chiếu trên main cba551b

Đã đọc STORY_BIBLE.md, EPISODE_01_STORYBOARD_V8.md, content-manifest.js, story-director.js, README.md, game-core.js. Trục sự kiện gốc giữ nguyên: Minh An 11 tuổi tới Thành Đô với mẹ; quyển sổ của mẹ và câu “Mỗi ngày, chỉ cần hiểu thêm một người”; gặp cô Vương và Tiểu Vũ; quyển sổ thất lạc được nhận lại tại phòng trực; ăn mì ở quán bà Lưu; trở về nhà. Đoạn kết đề cao sự trưởng thành gắn với học ngôn ngữ. Không thay tên/tuổi/quan hệ gốc, không phá continuity.

**Khác biệt:** Main V5 story-director chỉ có hai quyết định (ghế ngồi, độ cay), hội tụ lại ngay sau một cảnh. Ngoại truyện có 23 nút biên tập, 8 cảnh quyết định, 4.374 chuỗi lựa chọn khả thi (không đồng nghĩa có 4.374 cảnh hay kết thúc biên tập riêng), ba kết cục về định hướng trưởng thành và callback theo quá khứ. Sáu chặng chính luôn hiện diện; không thể bỏ mất quyển sổ hay các nhân vật quan trọng.

## Luật chơi và hệ quả

- Mỗi phương án trả lời có chữ Hán, Pinyin, diễn giải Việt, phản hồi NPC, ảnh hưởng lên Dũng cảm/Thấu cảm/Hiếu kỳ và quan hệ Mẹ/Tiểu Vũ/Cô Vương/Bà Lưu, lưu ký ức cụ thể.
- Một số quyết định dẫn tới NÚT CẢNH KHÁC (lúc đến Thành Đô, vào lớp, tìm sổ, bữa trưa, về nhà); số khác dẫn tới cách nói, ký ức và hồi tưởng khác.
- Không có chỉ số thiện/ác, không phạt khi nhờ người khác giúp. Mọi lối đi đều có thể hoàn thành, nhưng An hình thành thái độ khác nhau.
- Callback ở cảnh mất sổ, phòng trực, đường về. Kết cục tính từ 3 khuynh hướng, thêm người gần gũi và ký ức nổi bật.
- Ô nhập chữ Hán nhận các biến thể do tác giả biên tập; KHÔNG phải hội thoại AI tự do hoặc chấm thi HSK.
- Giọng Web Speech API đọc câu mẫu đầu tiên khi browser hỗ trợ.

## Isolation, versioning

Các tệp mới chỉ ở hsk-story/duong-re/: index.html, style.css, branch-data.js, branch-engine.js, branch-ui.js; không đụng runtime gốc. Engine thuần dữ liệu, không gọi API; UI dựng nội dung người chơi bằng textContent.

LocalStorage duy nhất: hai-que-huong-branching-novel-v1. Save chỉ gồm version và danh sách bước {at,choice}, sau đó replay để tái dựng trạng thái thật; điểm/flags giả bị phớt lờ. Dữ liệu sai, dữ liệu phiên bản sau, bước giả đều được xử lý an toàn, không đụng khóa HSK V3/V4, Nhập môn hay ôn tập. Chưa có đồng bộ tài khoản/backend; không migration giữa những thử nghiệm khác nhau.

## Nội dung và mỹ thuật

23 nút là thử nghiệm kể chuyện dài một ngày, chưa phải game thế giới mở. Tự do là đa tuyến có kịch bản; không ngụ ý mọi lời nói đều được hiểu. Các câu tiếng Trung / Pinyin là bản thảo sáng tác cần kiểm tra lại với giáo viên. Tính cách không phải điểm kiểm tra khả năng tiếng Trung.

Mỹ thuật hiện tại là placeholder gốc (HTML/CSS/SVG), chưa tích hợp concept nhân vật nhiều biểu cảm từ phiên bản minh họa. Khi dùng Codex, chuyển sang sprite đồng nhất có đủ cảm xúc và xuất xứ asset rõ ràng; để văn bản là HTML, không vẽ chữ vào hình.

## Kiểm thử & phát triển sâu

Lệnh từ repo root: node --test hsk-story/tests/branch-story.test.cjs hoặc node --test hsk-story/tests/*.test.cjs. Test số đường, điều kiện bắt buộc, ký ức/hồi tưởng, ba kết thúc, bản lưu giả/hỏng, nhánh ngôn ngữ, không chạm kho dữ liệu gốc. Cần thực nghiệm trình duyệt thật trên desktop/mobile và rà tự nhiên của tiếng Trung.

Nếu nâng thành câu chuyện nhiều năm: thêm nghịch cảnh có hệ quả thực từ tập trước sang tập sau; xung đột đạo đức không có lựa chọn hoàn hảo; điểm cảm xúc/quan hệ không thay thế hành vi và nội dung được viết riêng. Phải giữ main độc lập cho đến khi đủ kiểm chứng.


---

# Hai quê hương — Ngoại truyện phân nhánh V2 (29/10/2026)

**Branch ONLY:** `experiment/hsk-an-branching-novel-20261029`, based on production main `cba551bd`; never merge/push to main, never change production domain. Draft PR #10 is not intended to merge. Story playable at `/duong-re/` on a preview of this branch; preview availability depends on Vercel deployment quota.

## What changed since V1
- Kept the canon and all 23 original story nodes of the first day. The V1 final node `epilogue` becomes a **day-one milestone** (with original first-day An personality reflection) leading into day two. Old v1 story saves at this milestone can continue without losing choices.
- Added 19 authored nodes across dawn at home, ongoing feelings/mother conversation, the Xiao Yu sparrow incident in school, a second visit to Liu Nainai's noodle shop, and An's second-night diary. Overall **42 authored scene nodes, 12 decision scenes**, one final day-two outcome; many divergent passages are not mere text variants.
- **Conditional real consequences**:
  * Invite Xiao Yu on day 1 ⇒ Xiao Yu's home arrival route day 2, extra preparation choice; otherwise home remains quiet.
  * Keep a fear secret from mother ⇒ distinct chance to confess next morning; write a curious question ⇒ chance to ask mother to investigate it.
  * Befriend/ask Xiao Yu for help ⇒ optional paired sparrow rescue; otherwise the learner can still calmly help or ask the teacher.
  * Help Liu Nainai yesterday ⇒ trusted stock-sorting task today; read yesterday's menu ⇒ chance to ask how it is read, otherwise new ways to help.
  * Memories of other choices are carried in contextual interludes and two-day ending reflection.
- The *same* three personality tendencies, four relationships, authored Chinese variations, non-graded decisions, and separate storage key persist. No game scores/HSK certification inferred from character outcomes.
- Players may open diary and **rewind to any prior decision**, overwriting only future choices in this independent alternate story save. Legacy HSK/Intro scores unchanged.
- Added original **five consistent, deliberately imperfect ink SVG portraits** (An, Mother, Xiao Yu, Wang teacher, Liu grandma), each with **nine emotional expressions**. Facial expression changes with scene, as an interim original line-art asset, not the reference-concept full sprite sheets. Old visual stage still uses placeholder illustration; cannot claim art-complete.
- Branch scripts/CSS/HTML remain in `hsk-story/duong-re`, never modify existing main app.js/content or main progress. Save namespace continues `hai-que-huong-branching-novel-v1` because serialized format `{version:1,path:[...]}` stays identical; reconstruct state by replaying choices, never trusting stored scores or flags. The data graph alone has version 2.
- `engine.availableOptions()` and `engine.resolveTyped()` check conditions. No locked option can be selected by manually typing its phrase or replaying a forged save. New route nodes use deterministic priority and unconditional fallback.
- Structural graph test checks 42 reachable nodes, 12 choices, no cycles, no ability to bypass canonical stations. All **4,374 day-one routes** remain reachable. The `structuralPaths` estimate includes conditional alternatives which are not simultaneously available, so do NOT advertise as playable path count.

## Real browser QA (new)
- Node: `node --test hsk-story/tests/branch-story.test.cjs`, full `node --test hsk-story/tests/*.test.cjs`.
- Chromium: `hsk-story/e2e/branch-browser.cjs`, 1280px and 360px. Verify day-one milestone, replay after reload, real invitation branch, locked option hidden, typed unknown Mandarin not accepted, finishing day two, unchanged legacy save strings, no JS errors, mobile overflow, rewind to earlier decision.
- CI workflow `.github/workflows/hsk-branch-novel-e2e.yml` scoped to this experimental PR, with screenshots and JSON report (7 days retention). Preview deployment only after CI.
- Manual Chinese proficiency, emotional narrative, accessibility and artwork review are still required; no source-verified syllabus claim.

## End goal and open gaps
A branching story grows through actual authored stakes and persistent consequences, not gamified “good/bad personality” points. Next steps: publish a playable Preview when Vercel quota permits; manually test narrative pacing with actual learners; add more long-term consequences into episode 3 and choice-sensitive NPC expressions/sprites, robust text input feedback; add optional HSK learning objectives **independent** of this personality system.

**No remote AI**: typed phrases accepted only from editorial curated answers. New Mandarin lines and Pinyin require native speaker/teacher verification before release as authoritative Chinese-learning material.
