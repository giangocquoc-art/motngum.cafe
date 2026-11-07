/* Authored FUTURE story act graph; plans are not playable until curriculum, assessment, art, teacher QA pass. */
var HSKFutureActs=(function(){"use strict";
var acts=[
  {
    "level": 2,
    "playable": false,
    "planningStatus": "story-outline-only; candidate objectives have source locators, but exact official item matches and educator review are pending",
    "id": "hsk2.first-friend",
    "title": "Người bạn đầu tiên",
    "theme": "Tin tưởng nhau bằng những lời thường ngày",
    "episodes": [
      {
        "id": "misunderstanding",
        "title": "Câu hẹn bị hiểu lầm",
        "setting": "Cổng trường và trạm xe",
        "conflict": "An hiểu nhầm thời gian hẹn của Tiểu Vũ",
        "functions": [
          "giờ giấc",
          "hỏi lại cho rõ",
          "xin lỗi"
        ],
        "choice": "An chủ động hỏi lại hoặc viết tin nhắn giải thích",
        "callback": "Lời hứa hẹn đi cùng nhau",
        "resolution": "Hai người đặt lại một buổi hẹn rõ ràng"
      },
      {
        "id": "street-map",
        "title": "Phố nào là nhà?",
        "setting": "Góc đường và tuyến xe",
        "conflict": "An và Tiểu Vũ lạc nhịp giữa hai ngả phố",
        "functions": [
          "hỏi đường",
          "vị trí",
          "phương tiện"
        ],
        "choice": "Hỏi nhân viên hoặc xem biển chỉ dẫn",
        "callback": "Con đường về ở HSK1",
        "resolution": "An tự dẫn được bạn trở lại quán bà Lưu"
      },
      {
        "id": "market-money",
        "title": "Bữa quà của tình bạn",
        "setting": "Chợ Thành Đô",
        "conflict": "Chọn quà trong ngân sách nhỏ cho bạn",
        "functions": [
          "số lượng",
          "giá cả",
          "so sánh sở thích"
        ],
        "choice": "Chọn quà phù hợp người nhận thay vì giá tiền",
        "callback": "Mười tệ ở quán mì",
        "resolution": "Một món quà nhỏ mang ý nghĩa riêng"
      },
      {
        "id": "term-conversation",
        "title": "Những người ta có thể nhờ",
        "setting": "Lớp học cuối kỳ",
        "conflict": "An phải kể một ngày đi học và giải quyết hiểu lầm",
        "functions": [
          "kể hoạt động thường ngày",
          "hỏi đáp lịch hẹn"
        ],
        "choice": "Cách diễn đạt lựa chọn của An",
        "callback": "Sổ tay mẹ và lần gặp Tiểu Vũ",
        "resolution": "Kiểm tra nội bộ trên hội thoại thực tế"
      }
    ]
  },
  {
    "level": 3,
    "playable": false,
    "planningStatus": "story-outline-only; candidate objectives have source locators, but exact official item matches and educator review are pending",
    "id": "hsk3.spring-promise",
    "title": "Hội chợ mùa xuân",
    "theme": "Hai nền văn hóa gặp nhau qua việc làm chung",
    "episodes": [
      {
        "id": "fair-invitation",
        "title": "Lời mời hội chợ",
        "setting": "Sân trường",
        "conflict": "Gian hàng Việt Nam chưa có người trình bày",
        "functions": [
          "nói ý định",
          "giải thích đề xuất",
          "phân công"
        ],
        "choice": "An chọn kể chuyện ẩm thực hay trò chơi dân gian",
        "callback": "Món mì bà Lưu",
        "resolution": "Nhóm có một chủ đề rõ ràng"
      },
      {
        "id": "planning",
        "title": "Ba ngày trước lễ hội",
        "setting": "Thư viện và cửa hàng",
        "conflict": "Kinh phí, vật liệu và tiến độ không đủ",
        "functions": [
          "lập kế hoạch",
          "trình tự thời gian",
          "so sánh giải pháp"
        ],
        "choice": "Thay vật liệu hay đổi thiết kế",
        "callback": "Kinh nghiệm mua đồ HSK2",
        "resolution": "Kế hoạch điều chỉnh vừa sức"
      },
      {
        "id": "bridge",
        "title": "Một câu chuyện hai ngôn ngữ",
        "setting": "Bếp bà Lưu và nhà An",
        "conflict": "Khách chưa hiểu vì sao món ăn và câu chuyện lại khác nhau",
        "functions": [
          "kể lại quá khứ",
          "giải thích văn hóa",
          "hỏi ý kiến"
        ],
        "choice": "Mở đầu bài giới thiệu bằng kỷ niệm nào",
        "callback": "Lời mẹ trong sổ tay",
        "resolution": "Bài giới thiệu nói từ trải nghiệm thật"
      },
      {
        "id": "festival-presentation",
        "title": "Một ngày mùa xuân",
        "setting": "Hội chợ",
        "conflict": "Lời dẫn và phần hỏi đáp phát sinh câu hỏi ngoài dự kiến",
        "functions": [
          "trình bày",
          "hỏi đáp",
          "kết luận"
        ],
        "choice": "An chọn cách xử lý sự cố của nhóm",
        "callback": "Bài học tin tưởng ở HSK2",
        "resolution": "Đánh giá thuyết trình của giáo viên nội bộ"
      }
    ]
  },
  {
    "level": 4,
    "playable": false,
    "planningStatus": "story-outline-only; candidate objectives have source locators, but exact official item matches and educator review are pending",
    "id": "hsk4.change-season",
    "title": "Khi mọi chuyện thay đổi",
    "theme": "Lắng nghe những lý do mà mình không đồng ý",
    "episodes": [
      {
        "id": "notice",
        "title": "Tờ thông báo trước cửa",
        "setting": "Quán mì bà Lưu",
        "conflict": "Quán đối diện nguy cơ mất chỗ kinh doanh vì phương án sử dụng mặt bằng",
        "functions": [
          "đọc thông báo",
          "đặt câu hỏi",
          "phân biệt sự thật và suy đoán"
        ],
        "choice": "Hỏi bà Lưu trước hay gặp ban quản lý",
        "callback": "Bát mì đầu tiên",
        "resolution": "Xác định được vấn đề thực tế"
      },
      {
        "id": "sides",
        "title": "Không ai là người xấu",
        "setting": "Phòng họp khu phố",
        "conflict": "Cư dân muốn an toàn, chủ mặt bằng cần cải tạo, bà Lưu lo sinh kế",
        "functions": [
          "tường thuật quan điểm",
          "nhượng bộ",
          "đối chiếu bằng chứng"
        ],
        "choice": "Lắng nghe từng bên trước khi đề xuất",
        "callback": "Bài học sửa hiểu lầm HSK2",
        "resolution": "Các bên được ghi nhận chính xác"
      },
      {
        "id": "proposal",
        "title": "Một phương án khác",
        "setting": "Thư viện và ủy ban khu phố",
        "conflict": "Phương án ban đầu cần bổ sung điều kiện vệ sinh và hợp đồng",
        "functions": [
          "điều kiện",
          "nguyên nhân–kết quả",
          "viết kiến nghị"
        ],
        "choice": "Phân tích mặt được và mất của hai phương án",
        "callback": "Lập kế hoạch hội chợ HSK3",
        "resolution": "Nhóm có đề xuất bằng chứng cụ thể"
      },
      {
        "id": "public-debate",
        "title": "Ngày lên tiếng",
        "setting": "Cuộc họp dân cư",
        "conflict": "Nhận phản biện mà không làm mất tôn trọng",
        "functions": [
          "bảo vệ luận điểm",
          "phản biện",
          "tổng hợp"
        ],
        "choice": "Trình bày nguyện vọng có giới hạn thực tế",
        "callback": "Sổ tay của An",
        "resolution": "Đánh giá tranh luận nội bộ, kết cục không thần kỳ"
      }
    ]
  },
  {
    "level": 5,
    "playable": false,
    "planningStatus": "story-outline-only; candidate objectives have source locators, but exact official item matches and educator review are pending",
    "id": "hsk5.two-homes",
    "title": "Hai quê hương",
    "theme": "Định nghĩa thuộc về khi ta có hai nơi để nhớ",
    "episodes": [
      {
        "id": "letter-home",
        "title": "Lá thư từ Việt Nam",
        "setting": "Nhà An",
        "conflict": "Gia đình cân nhắc một cơ hội trở lại Việt Nam",
        "functions": [
          "diễn đạt cảm xúc phức tạp",
          "so sánh quan điểm",
          "giải thích lựa chọn"
        ],
        "choice": "An hỏi mẹ về quá khứ thay vì vội trả lời",
        "callback": "Ngày đầu đến Thành Đô",
        "resolution": "Có thời gian cân nhắc"
      },
      {
        "id": "farewells",
        "title": "Những điều chưa nói",
        "setting": "Trường và quán bà Lưu",
        "conflict": "Mỗi người nhìn tương lai của An khác nhau",
        "functions": [
          "giải thích tâm trạng",
          "hồi tưởng",
          "tranh luận tinh tế"
        ],
        "choice": "An chọn thành thật với Xiao Yu",
        "callback": "Cả ba nhân vật xuyên suốt",
        "resolution": "Tình bạn không chỉ phụ thuộc khoảng cách"
      },
      {
        "id": "draft",
        "title": "Quyển sổ không còn trống",
        "setting": "Thư viện",
        "conflict": "Tìm giọng nói riêng thay vì sao chép câu mẫu",
        "functions": [
          "lập luận",
          "cấu trúc bài văn",
          "phân tích văn bản",
          "dịch theo nghĩa"
        ],
        "choice": "Chọn viết tiểu luận hay dịch văn bản đã biên soạn",
        "callback": "Ghi chép qua năm chương",
        "resolution": "Chuẩn bị bản thảo có phản hồi rõ"
      },
      {
        "id": "graduation",
        "title": "我的两个故乡",
        "setting": "Buổi tốt nghiệp",
        "conflict": "An phải bày tỏ mình là ai mà không phủ nhận quê nào",
        "functions": [
          "bài luận tiếng Trung hoặc dịch Trung–Việt",
          "phản hồi và tự đánh giá"
        ],
        "choice": "Lựa chọn kết thúc phù hợp quan điểm nhân vật",
        "callback": "Lời mẹ: hiểu thêm một người",
        "resolution": "Đánh giá nội bộ theo hai rubric khác nhau, khép lại câu chuyện"
      }
    ]
  },
  {
    "level": 6,
    "id": "hsk6.letters-we-leave",
    "title": "Những điều An muốn gửi lại",
    "theme": "Nhìn lại những nơi và con người đã cùng làm nên câu chuyện của An",
    "planningStatus": "story-outline-only; candidate objectives have source locators, but exact official item matches and educator review are pending",
    "playable": false,
    "episodes": [
      {
        "id": "old-streets",
        "title": "Con phố trong quyển sổ",
        "setting": "Phố cũ ở Thành Đô",
        "conflict": "An muốn ghi lại một nơi đã đổi khác nhưng ký ức của mọi người không hoàn toàn giống nhau",
        "functions": ["tổng hợp nhiều góc nhìn", "đối chiếu lời kể với ghi chép"],
        "choice": "An chọn hỏi thêm một người hay giữ lại điều mình chưa chắc",
        "callback": "Những dòng ghi chép từ ngày đầu tiên",
        "resolution": "An đánh dấu rõ đâu là điều mình biết và đâu là điều còn cần hỏi"
      },
      {
        "id": "three-voices",
        "title": "Ba cách nhớ một ngày",
        "setting": "Nhà An, lớp học và quán bà Lưu",
        "conflict": "Mẹ, Tiểu Vũ và bà Lưu nhớ ba chi tiết khác nhau về một buổi chiều",
        "functions": ["kể lại có chọn lọc", "làm rõ nguồn thông tin"],
        "choice": "An chọn cách sắp xếp những lời kể để không làm mất tiếng nói riêng",
        "callback": "Những người An từng học cách lắng nghe",
        "resolution": "Bản ghi giữ lại khác biệt thay vì ép mọi người thành một câu chuyện duy nhất"
      },
      {
        "id": "open-letter",
        "title": "Một lá thư chưa gửi",
        "setting": "Phòng An vào buổi tối",
        "conflict": "An viết về điều mình còn phân vân mà chưa biết ai sẽ đọc",
        "functions": ["xây dựng lập luận dài", "tự sửa bản thảo theo phản hồi"],
        "choice": "An quyết định điều gì nên nói thẳng và điều gì cần thêm dẫn chứng",
        "callback": "Quyển sổ đã theo An qua nhiều lần bắt đầu lại",
        "resolution": "An giữ lại một bản nháp còn mở để tiếp tục sửa"
      },
      {
        "id": "sparrow-window",
        "title": "Cửa sổ còn mở",
        "setting": "Cửa sổ nhìn xuống khu phố",
        "conflict": "An phải chọn cách kể câu chuyện của mình mà không nói thay người khác",
        "functions": ["tổng hợp", "trình bày quan điểm có giới hạn", "tự đánh giá điều còn thiếu"],
        "choice": "An chọn kết thúc bằng một câu trả lời hay một câu hỏi còn để ngỏ",
        "callback": "Sẻ đã lắng nghe từ trang đầu tiên",
        "resolution": "Khép lại một chặng truyện, không tuyên bố đạt chuẩn hay chứng nhận HSK"
      }
    ]
  }
];
var branchDrafts=typeof require==="function"?require("./future-branch-decisions.json"):null;
var blueprintPlans=typeof require==="function"?require("./learning-blueprint.js").futurePlans:null;
function attachBranchDrafts(){
 if(!branchDrafts||!blueprintPlans)return;
 acts.forEach(function(act){
  var draft=branchDrafts.acts[act.id],plan=blueprintPlans.find(function(item){return item.level===act.level;});
  if(!draft||!plan)return;
  act.commonLearningAnchorIds=draft.commonLearningAnchorIds.slice();
  act.episodes.forEach(function(episode){
   var decision=draft.decisions[episode.id];
   if(!decision)return;
   episode.learningAnchorIds=plan.objectives.filter(function(objective){return objective.episode===episode.id;}).map(function(objective){return objective.id;});
   episode.decision=JSON.parse(JSON.stringify(decision));
   episode.decision.sharedLearningAnchorIds=act.commonLearningAnchorIds.slice();
  });
 });
}
attachBranchDrafts();
function validate(){
 var errors=[],ids=new Set(),branchSceneIds=new Set();
 if(acts.length!==5)errors.push("Expected HSK2–6 drafts");
 if(!branchDrafts||branchDrafts.schemaVersion!==1||!blueprintPlans)errors.push("Authored future branch draft or common learning map is unavailable");
 acts.forEach(function(a,i){
  var plan=blueprintPlans&&blueprintPlans.find(function(item){return item.level===a.level;}),draft=branchDrafts&&branchDrafts.acts[a.id];
  if(a.level!==i+2||a.episodes.length!==4)errors.push("Incomplete level "+(i+2));
  if(a.playable!==false)errors.push("Future act must remain non-playable "+a.level);
  if(!plan||!draft||JSON.stringify(a.commonLearningAnchorIds)!==JSON.stringify(plan.objectives.map(function(item){return item.id;})))errors.push("Future act anchors do not match the common objective plan: "+a.level);
  var episodeOrder=new Map(a.episodes.map(function(episode,index){return [episode.id,index];}));
  a.episodes.forEach(function(e){
   var id=a.id+"."+e.id,decision=e.decision;
   if(ids.has(id))errors.push("Duplicate episode");ids.add(id);
   if(!e.conflict||!e.choice||!e.callback||!e.resolution||!e.functions.length)errors.push("Missing story learning contract "+id);
   var expectedIntroductions=plan?plan.objectives.filter(function(objective){return objective.episode===e.id;}).map(function(objective){return objective.id;}):[];
   if(JSON.stringify(e.learningAnchorIds||[])!==JSON.stringify(expectedIntroductions))errors.push("Episode intro anchors do not match the objective map: "+id);
   if(!decision||!decision.id||!decision.convergenceSceneId||!Array.isArray(decision.choices)||decision.choices.length<2)errors.push("Missing structured story decision "+id);
   if(!decision)return;
   if(JSON.stringify(decision.sharedLearningAnchorIds)!==JSON.stringify(a.commonLearningAnchorIds))errors.push("Decision does not rejoin before every common learning anchor: "+id);
   var optionIds=new Set(),memoryKeys=new Set(),memoryValues=new Set(),reactions=new Set(),consequences=new Set();
   decision.choices.forEach(function(option){
    if(!option.id||optionIds.has(option.id)||!option.label||!option.branchSceneId||!option.reaction||!option.memory||!option.memory.key||!option.memory.value||!option.laterConsequence||!option.laterConsequence.sceneId||!option.laterConsequence.text)errors.push("Malformed story branch option: "+id);
    optionIds.add(option.id);
    if(branchSceneIds.has(option.branchSceneId)||option.branchSceneId===decision.convergenceSceneId)errors.push("Duplicate or converged branch scene: "+option.branchSceneId);branchSceneIds.add(option.branchSceneId);
    if(option.joinsAtSceneId!==decision.convergenceSceneId)errors.push("Branch does not converge at the shared scene: "+id+"/"+option.id);
    memoryKeys.add(option.memory.key);memoryValues.add(option.memory.value);reactions.add(option.reaction);consequences.add(option.laterConsequence.text);
    var laterIndex=episodeOrder.get(option.laterConsequence.episodeId),currentIndex=episodeOrder.get(e.id);
    if(laterIndex===undefined||laterIndex<currentIndex||option.laterConsequence.sceneId===option.branchSceneId)errors.push("Story consequence points to a missing or earlier beat: "+id+"/"+option.id);
   });
   if(memoryKeys.size!==1||memoryValues.size!==decision.choices.length||reactions.size!==decision.choices.length||consequences.size!==decision.choices.length)errors.push("Story options need distinct memory values, reactions, and later consequences: "+id);
  });
  if(draft&&Object.keys(draft.decisions).length!==a.episodes.length)errors.push("Every future episode needs one authored decision: "+a.level);
 });
 return errors;
}
function byLevel(level){return acts.find(a=>a.level===level)||null}
var api={version:"draft-v3",status:"NOT PLAYABLE / BRANCHES AUTHORED / PENDING HSK 3.0 ITEM MAPPING AND MANDARIN REVIEW",acts:acts,branchDrafts:branchDrafts,validate:validate,byLevel:byLevel};if(typeof module!=="undefined"&&module.exports)module.exports=api;return api;
})();
