# Hai quê hương — Kiểm toán và kế hoạch tách lõi / nhánh phụ (26/10/2026)

**Trạng thái:** KẾ HOẠCH TRÊN NHÁNH RIÊNG; KHÔNG PHẢI CODE ĐÃ ĐƯỢC TÁI CẤU TRÚC.
**Production:** https://hsk.motngum.cafe
**Baseline:** main @ cba551bd7810d7bd86f70611f1bb8f46a289f23a
**Safety snapshot:** safety/hsk-story-pre-streamline-20261026
**Planning branch:** plan/hsk-core-sidepaths-20261026
**Scope:** chỉ hsk-story/**, ngoại trừ thay đổi workflow phải duyệt riêng.

## I. MỤC TIÊU SẢN PHẨM CẦN GIỮ
Một trò chơi học tiếng Trung theo câu chuyện cuộc đời Minh An (11 tuổi, từ Việt Nam chuyển tới Thành Đô cùng mẹ), tình bạn với Xiao Yu, cô Wang và bà Liu, quyển sổ mẹ tặng và cảm giác thuộc về hai quê hương. Bắt đầu từ người chưa biết mặt chữ, dần học và sử dụng chữ/câu nói trong ngữ cảnh, phát triển HSK1→5. Không biến thành app flashcard và không lấy một quiz nhỏ làm chứng chỉ HSK.

Mọi module được chấm bằng năm câu hỏi:
1) Nó có giúp cốt truyện, quan hệ hoặc quyết định nhân vật không?
2) Nó có giúp hiểu, nhớ, dùng lại tiếng Trung trong ngữ cảnh khác không?
3) Tương tác có hậu quả, không chỉ chạm để hiện thêm chữ không?
4) Nó có gìn giữ canon, timeline, HSK checkpoint và progress không?
5) Nó có dễ truy vết, kiểm chứng, được người học hiểu là bài chính/phụ không?
Nếu không thiết yếu, hạ cấp thành nhánh tuỳ chọn/editor/sandbox, KHÔNG XOÁ.

## II. PHÁT HIỆN CÓ BẰNG CHỨNG TRONG REPO
- 57 mục dưới hsk-story, main page hiện tải 12 file JavaScript bằng defer. Ứng dụng ở app.js gồm SVG nền, DOM, lưu state, điều hướng, voice và scoring glue; quá tập trung.
- story-graph.js khai báo stable ID và events nhưng nextScene() vẫn chạy state.step++. Graph chưa có quyền quyết định luồng; thay index 0..9 lúc này sẽ làm hỏng legacy save.
- save() giữ key hai-que-huong-progress-v3 với numeric step + nhiều trường v8/v9. Intro dùng key hai-que-huong-intro-v1 riêng. Không được chồng mới lên key cũ mà không có migration/rollback.
- skill-sampler.js là hai câu luyện đọc/nghe, được render bắt buộc ngay trước scene index 7; tuy tên optional, learner vẫn phải nhấn chọn/bỏ qua mới được chơi tiếp.
- playSkillSample() gọi speak() rồi đánh dấu audioPlayed=true khi mới gửi lệnh TTS. Vì speak() có đường return khi không hỗ trợ âm thanh, đây là lỗi bằng chứng nghe tiềm ẩn; không được tự xem là đã nghe thật.
- scene-world.js chỉ mô tả sáu nút chữ ở hai cảnh, chưa phải hotspot hợp nhất với artwork. Giữ schema quan sát, không nhồi thêm pop-up không có tác dụng cốt truyện.
- future-acts.js và learning-blueprint.js hiện không được import vào main HTML: chúng là DỰ THẢO test/editor, không phải runtime performance burden.
- Các tài liệu Master Plan, V4–V9 QA, roadmap nhiều đời hiện nằm cùng folder, dễ khiến Codex đọc nhầm kế hoạch cũ là chuẩn mới. Chỉ làm sạch tài liệu bằng canonical index và di chuyển giữ lịch sử, không tuyên bố "tăng FPS".
- Chương 00 diễn ra đêm trước ngày học, trong khi HSK1 scene 0 kể mới đến Thành Đô. Cần thêm lời dẫn flashback hoặc chỉnh timeline content có migration; KHÔNG đổi ID cảnh số 0.
- HSK2–5 được render thành card nút có thể nhấn, nhưng chỉ thông báo "Sắp ra mắt"; cần phản ánh roadmap, không ngụ ý các chương đã playable.
- GitHub: backup-before-reset là nhánh cũ của parent repo. feature/meo-gioi-s0 và feature/meo-gioi-s1-loop là một game KHÁC dưới games/meo-gioi. Không reset, merge hoặc xoá hai nhánh đó.
- CI hiện Node syntax + simulated UI, baseline 114/114; chưa có real browser desktop/360px/voice end-to-end.

## III. PHÂN TẦNG SẢN PHẨM
### A. CORE — luồng truyện mặc định, GIỮ
- Story canon, hành trình Minh An, mẹ, Xiao Yu, Wang, Liu, quyển sổ, bối cảnh Thành Đô.
- content-manifest, story-beats, story-director, active-encounter, story-graph (sẽ nâng cấp), scoring game-core.
- Mục tiêu học khi đã giới thiệu → luyện có hỗ trợ → vận dụng lại → phản hồi. Giữ typed fallback, Pinyin/translation và công cụ gợi ý khi cần.
- Bản lưu/khôi phục, 10 scenes cùng 3 internal checkpoints demo đang chạy. Không nhận đã đủ HSK1.
- SVG hiện hành tiếp tục làm fallback đến khi artwork Codex được duyệt.

### B. SIDE PATHS — người chơi tự chọn, có đường quay về
1) Nhập môn: 9 trang trước HSK1, giữ độc lập và không khóa đường vào HSK1.
2) Chữ Hán kỳ lạ: bộ ghép chữ cổ, câu đùa 奻/姦, giải thích lịch sử; NÊN CHUYỂN phần nâng cao khỏi luồng nhập môn bắt buộc. Giữ lời dẫn và đường vào từ sổ tay.
3) Sổ tay An: các chữ/người/sự kiện đã gặp; trợ năng từ ghép câu vẫn giữ, chỉ hiện sau yêu cầu trợ giúp.
4) Góc ôn tập: skill-sampler và bài luyện sau này, không chắn trước kỳ kiểm tra trong cốt truyện; không tự gán thành thạo kỹ năng nếu chỉ yêu cầu TTS.
5) Quan sát thế giới: scene-world thành hotspot có ích cho vật chứng, kí ức hoặc biểu hiện cảm xúc; nhánh chỉ được bật sau khi người chơi tới đúng cảnh.
Mỗi side path bắt buộc định nghĩa entry, returnTo, dữ liệu được phép ghi, giới hạn điểm học, hành vi khi reload và không có âm thanh.

### C. EDITOR / DRAFT — không buộc client tải
- learning-blueprint và nguồn HSK3: yêu cầu nguồn phiên bản chính thức, trang/row, signoff chuyên gia Mandarin, trạng thái content.
- future-acts 16 tập HSK2→5: chỉ biên kịch, chưa playable.
- CODEX_HANDOFF cho art/AI, và các Master Plan, report lịch sử.
Các file draft không được "nâng cấp" thành đồ chơi một cách vô tình. Dùng docs/current/ và docs/history/ với các pointer, không xóa Git history.

### D. SANDBOX / PREVIEW
- V11 AI/backend ASR/TTS và bộ tranh sprite V12 do Codex. Bắt buộc nhánh và preview riêng, feature flag tắt ở production cho đến khi test an toàn, kinh phí, latency, canons và asset consistency.
- Các mẹo hình thanh/huyền thoại chữ chưa kiểm chứng nằm ở góc đọc thêm, chưa đưa vào chương trình HSK chính thức.

## IV. HAI LOẠI NHÁNH KHÔNG ĐƯỢC NHẦM
**Nhánh trải nghiệm (in-game):** mở từ truyện khi phù hợp, không chen ngang nhiệm vụ bắt buộc, quay lại sceneRef cũ. Có thể là modal/panel/route, nhưng phải có một nút "Quay lại câu chuyện".
**Nhánh mã (Git):** giữ bản thử nghiệm hoàn toàn khỏi main; chỉ merge bằng PR sau QA. Việc Git có một branch không tự động tạo một đường đi trong game, và việc chỉ di chuyển file JS sang branch Git không thể làm browser tự tải nó.

## V. THỨ TỰ THỰC HIỆN, KHÔNG ĐẢO
### Gate 0: Snapshot / baseline (đã tạo nhánh, chưa sửa main)
- safety/hsk-story-pre-streamline-20261026 tại commit cba551b, nhánh plan độc lập.
- Chụp lại dữ liệu tests, 98 HTML IDs, 12 JS runtime, 57 HSK tree entries, đường domain và rollback SHA.
- Golden fixtures cho intro-v1 và HSK-v1/v2/v3; dữ liệu giả, không thu thập dữ liệu nhạy cảm của học viên.
- Kết thúc: main không đổi, snapshot tồn tại.

### Gate 1: khóa hành vi và kiểm tra thật [P0]
- Thêm Playwright desktop và viewport 360px: new user, older saved profile, toàn bộ 10 scene, 3 checkpoint, nhánh tìm sổ, choice, replay, resume, intro skip/review, âm thanh không hỗ trợ.
- Bổ sung kiểm thử kết quả hỗ trợ: independent vs hinted vs sample. Không cho lời thoại tương lai lộ khi mở sổ.
- Sửa bug nghe TTS: nếu không xác nhận được đã phát, ghi unassessed; đừng dùng speak-called thay audio-heard.
- Mốc nghiệm thu: 114 Node tests cũ + tests mới; real browser path đạt và không lỗi trạng thái.

### Gate 2: nâng Story Graph thành runtime [P0]
- Tạo pure transition reducer: next(sceneRef,event,progress) thay cho tăng chỉ số mù. Mỗi node có ID, prerequisites, type, actors, objective, allowedTransitions, returnTo, memoryWrites, evidenceWrites.
- Giữ mapping chính xác 0..9 và trạng thái storyBeats/branch/diary. Phát hiện graph cycles, orphan, skip checkpoint, duplicate IDs.
- Save v4 vào KEY RIÊNG; v3 giữ đọc được và làm fallback; migration có kiểm tra tài liệu/scene map. Không đưa index HSK2 vào v3.
- Bật shadow read trước; sau khi so sánh kết quả và rollback được mới cho write v4.
- Mốc nghiệm thu: truyện/điểm cũ y nguyên, graph điều khiển đường đi mới, không mất progress khi reload.

### Gate 3: tách UI phụ thành side paths [P1]
- Skill sampler: bỏ bắt buộc scene7 SAU KHI có nút tự chọn từ sổ tay/cột mốc và returnTo; dữ liệu cũ vẫn hiện được. Giữ checkpoint truyện trọn vẹn.
- Rare Hanzi/joke: xem như "Khám phá thêm" tùy chọn; không bớt sự hấp dẫn của intro chính.
- World hotspots: chỉ hiện đúng cảnh, gắn với ký ức/đồ vật/từ vừa học, không chỉ nút để click.
- Learning kit: trợ giúp theo nhu cầu, không thêm một bảng bài tập luôn mở.
- Mốc nghiệm thu: người chơi không bị ép qua thử thách phụ; có thể rẽ và quay về đúng chỗ kể cả sau reload.

### Gate 4: đơn giản hóa module và tài liệu [P2]
- Dần tách app.js thành app-shell, state adapter, scene renderer, narration, svg fallback với API tương thích. KHÔNG rewrite toàn bộ trong một PR.
- Nếu có số đo thực, trì hoãn tải các JS gameplay trên homepage cho đến khi user chọn chơi; xử lý race conditions và fallback.
- Chuẩn hóa STORY_BIBLE, PRODUCT_SPEC và docs/INDEX thành hiện hành; V4–V8 docs/QA lưu lịch sử, không xóa.
- HSK2–5 chỉ hiện nhãn "Lộ trình đang phát triển", đừng để card giả như playable.
- Mốc nghiệm thu: behavior parity, smaller coupling, desktop/mobile JS errors = 0.

### Gate 5: gia tăng chiều sâu sản phẩm [P2]
- Chữ đã nhìn trong Nhập môn được nhận ra trong bối cảnh trường học/cửa hàng HSK1: không ôn y hệt, mà ứng dụng tự nhiên.
- Cốt truyện phải có tension, conflict, consequence, emotional payoff; mỗi side path phải đóng góp việc người chơi hiểu An hoặc nhớ một từ trong bối cảnh.
- HSK1 đủ học liệu theo đại cương đã đối chiếu và người có chuyên môn duyệt trước khi ghi "hoàn thành HSK1".
- V11/V12 Codex ghép art/voice bằng contract, preview và manual acceptance, không tác động core grading.
- Mốc nghiệm thu: thật sự học qua truyện; không có claim AI/giọng đọc/học lực thiếu bằng chứng.

## VI. NHÁNH GIT ĐỀ XUẤT, CHỈ TẠO KHI GATE TƯƠNG ỨNG BẮT ĐẦU
- refactor/hsk-runtime-graph-v4: reducer + save/migration
- feature/hsk-practice-sidepath: luyện đọc/nghe tự chọn
- feature/hsk-intro-curiosity: kiến thức chữ Hán mở rộng
- feature/hsk-world-hotspots: đồ vật có ý nghĩa trong cảnh
- docs/hsk-curriculum-authoring: draft, giáo trình, document index
- feature/hsk-voice-v11 và design/hsk-art-v12: Codex thử nghiệm trên preview

**Quy tắc PR:** chỉ hsk-story/**, trừ thay đổi CI riêng. Khi push feature branch, CI hiện tại không chạy theo push (workflow chỉ main) mà cần mở draft PR để kích hoạt pull_request. Không merge trước khi test và review preview. Cấm force-push main, xoá file quá sớm hoặc chỉnh DNS.

## VII. PHƯƠNG ÁN ROLLBACK
- Safety SHA và branch phải giữ nguyên.
- Lỗi trong production: revert commit theo PR hoặc rollback Vercel deployment; không reset, ghi đè hoặc tự động xóa localStorage.
- Chuyển file/code theo bước: thêm adapter alias/compat → chỉnh consumer/tests → kiểm tra browser/CI → sau nhiều release mới cân nhắc xóa alias; bản gốc vẫn tồn tại ở snapshot/history.
- Đối với bản lưu: v4 thử chạy shadow mode trước, v3 vẫn có thể khôi phục. Các trường điểm học và nhớ cốt truyện không ghi chồng nhau.
- Tương tác phụ phải có entry, returnTo, cơ chế save, close/reopen và test no-leak HSK checkpoint.

## VIII. CÁC VIỆC TUYỆT ĐỐI KHÔNG NÊN LÀM
- Xóa 20+ tài liệu Markdown để "tăng hiệu năng" (không được browser tải).
- Đảo numeric scene 0..9 làm lối tắt thêm HSK2 (mất tiến độ).
- Xoá SVG fallback trước khi hình Codex khớp và chạy được.
- Xoá nút gõ chữ/hint/ghép câu chỉ để giao diện gọn.
- Đưa future-acts vào runtime như chương playable, mặc dù chưa viết nội dung học.
- Cấp điểm nghe dựa vào click nút phát âm.
- Gộp nhánh games/meo-gioi hoặc thay root motngum.cafe trong đợt dọn HSK.
- Đánh đồng unit+mock test với kiểm thử trình duyệt thật hoặc bộ đại cương HSK chính thức.

## IX. CHECKLIST CHO MỖI PR
[ ] Chỉ sửa đúng file cho gate đó; main không đổi trước khi merge.
[ ] 10 scenes, 3 checkpoint, hai choice và lost notebook continuity giữ nguyên trên old saves.
[ ] Nhập môn độc lập và HSK1 handoff được bảo toàn.
[ ] Ngữ cảnh có đường về sau khi thoát side path.
[ ] Không ghi đúng độc lập khi có hint, sample, audio chưa xác nhận.
[ ] Tối thiểu 114 baseline Node checks vẫn chạy, thêm tests mới; không skip.
[ ] Playwright desktop và 360px, fallback không audio, restart/resume và audio leak.
[ ] Vercel preview đúng SHA và không thay parent project; production chỉ sau phê duyệt.
[ ] Có rollback/revert và giữ bản lưu người chơi.

**Phân công:** assistant bảo vệ kiến trúc, dữ liệu, tests và nội dung; Codex thực hiện API AI và art theo contract; giáo viên tiếng Trung ký duyệt tính tự nhiên/chương trình; người sở hữu duyệt cốt truyện, mỹ thuật và nhịp chơi.
