# Tài liệu Chim Sẻ

**Đọc trước:** [hướng hiện hành từ chat](CHIM_SE_DIRECTION.md) → [đối chiếu và thứ tự sửa](DIRECTION_AUDIT_20261027.md) → [story bible](../STORY_BIBLE.md) → [hợp đồng học liệu](../CONTENT_CONTRACT.md).

Tranh: [ART_DIRECTION](../art/ART_DIRECTION.md), [COMPOSITION](../art/COMPOSITION.md), [CHARACTER_ATLASES](../art/CHARACTER_ATLASES.md), [manifest](../art/manifest.json), [GENERATION_LOG](../art/GENERATION_LOG.md). AI và email: [AI_SETUP](../AI_SETUP.md). Bố cục đã duyệt; tranh và hành vi còn phải được rà. Các mục Gate/PR dưới đây là hồ sơ tại thời điểm viết, không chứng minh deployment hiện tại.

Lộ trình syllabus hiện hành: [HSK 3.0 source audit](../HSK3_SOURCE_AUDIT.md) và [machine-readable learning blueprint](../learning-blueprint.js). Sáu bậc đã có khung nguồn; chỉ bậc 1 có pilot, chưa bậc nào có item-level educator sign-off trong blueprint.

## Hiện hành
- [CHIM_SE_DIRECTION](CHIM_SE_DIRECTION.md): các quyết định gần nhất từ chủ dự án.
- [DIRECTION_AUDIT](DIRECTION_AUDIT_20261027.md): từng lệch so với hướng đã chốt, sửa gì, kiểm tra gì và việc nào còn mở.
- [STORY_BIBLE](../STORY_BIBLE.md): nhân vật, tình tiết và thế giới.
- [CONTENT_CONTRACT](../CONTENT_CONTRACT.md): học liệu và định dạng bài tập.
- [ART_DIRECTION](../art/ART_DIRECTION.md) và [COMPOSITION](../art/COMPOSITION.md): quy chuẩn tranh, manifest và cách ghép lớp.

## Tài liệu cổng cũ (snapshot lịch sử 26/10/2026)
- [PRODUCT_SPEC](../PRODUCT_SPEC.md): ảnh chụp mục tiêu và trạng thái tại thời điểm Gate 4–6; đọc cùng DIRECTION_AUDIT để biết thay đổi mới hơn.
- [Gate5 audit](../GATE5_AUDIT.md): snapshot cũ về tiếng Trung trong truyện và bằng chứng học tập.
- [Gate4 audit](../GATE4_AUDIT.md): snapshot cũ về module, SVG, bản lưu, kiểm thử và hiệu năng.

## Hồ sơ nhánh PR (snapshot lịch sử; trạng thái thay đổi trên GitHub)
- [Runtime V4 – Gate1/2](../RUNTIME_V4_GATE1_GATE2.md)
- [Optional practice – Gate3A](../PRACTICE_SIDEPATH_GATE3A.md)
- [Nhập môn mở rộng – Gate3B](../INTRO_CURIOSITY_GATE3B.md)
- [World callbacks – Gate3B](../WORLD_CONTEXT_GATE3B.md)

## Lịch sử được giữ, không xóa
Các file kế hoạch `MASTER_*`, `PRODUCT_ROADMAP_V4.md`, `MASTER_ROADMAP_V5.md`, `RELEASE_QA_V4.md` đến `RELEASE_QA_V9.md`, `EPISODE_01_STORYBOARD_V8.md`, `LOGIC_AUDIT_V2.md`, `INTRO_LOGIC_AUDIT_V02.md` tiếp tục tồn tại ở vị trí gốc để tránh phá liên kết cũ. Chúng là **historical reference**, không phải spec hiện hành.

`learning-blueprint.js`, `future-acts.js` là tác vụ biên tập và test; chúng không nằm trong chuỗi script browser. Đừng xóa file nhằm tối ưu hiệu năng — chúng không làm tăng bundle runtime.

## AI và mỹ thuật
[CODEX_HANDOFF_V11_V12.md](../CODEX_HANDOFF_V11_V12.md): tài liệu bàn giao kỹ thuật, chưa phải chức năng đã triển khai. Quy tắc: AI không tự chỉnh canonical story state/grade; tác phẩm gốc phải có quyền sử dụng.

## Tiếp tục Gate 6
- [HSK1_COVERAGE_MATRIX](../HSK1_COVERAGE_MATRIX.md): trục đại cương, phần đã/chưa dạy, nguồn chưa xác minh tới từng mục.
- [HSK1_REVIEW_GATE](../HSK1_REVIEW_GATE.md): bảo toàn dữ liệu, 18 bài ôn và kiểm thử.
