/* Editorial pilot, NOT audited complete HSK syllabus. Each item requires completed prior story scene. */
var HSKReviewData=(function(){"use strict";
var source={origin:"Original in-story authored examples",officialReference:"https://www.chinesetest.cn/hsk",syllabusStatus:"official_framework_reviewed; individual items pending Mandarin/syllabus signoff",skillsClaim:"guided Hanzi recognition, on-screen reading, typed recall ONLY"};
var items=[
 {
  "id": "mother-question",
  "after": 0,
  "kind": "reading",
  "topic": "Lời hỏi thăm",
  "zh": "安，你还好吗？",
  "py": "Ān, nǐ hái hǎo ma?",
  "question": "Mẹ đang muốn biết điều gì?",
  "options": [
   [
    "health",
    "An có ổn không"
   ],
   [
    "food",
    "An muốn ăn gì"
   ],
   [
    "time",
    "Mấy giờ rồi"
   ]
  ],
  "correct": "health",
  "hint": "An còn ngập ngừng, siết quai cặp trước cổng trường mới nên mẹ hỏi thăm.",
  "explain": "你还好吗？ hỏi xem người kia có ổn không trong tình huống này; 你好 mới là lời chào."
 },
 {
  "id": "arrived-city",
  "after": 0,
  "kind": "reading",
  "topic": "Gia đình",
  "zh": "我们到了。",
  "py": "Wǒmen dào le.",
  "question": "Mẹ thông báo điều gì?",
  "options": [
   [
    "arrived",
    "Hai mẹ con đã tới nơi"
   ],
   [
    "leave",
    "Hai mẹ con sắp đi"
   ],
   [
    "sleep",
    "Đến giờ ngủ"
   ]
  ],
  "correct": "arrived",
  "hint": "Nhớ câu mẹ nói khi hai mẹ con dừng trước cổng trường.",
  "explain": "到了 nghĩa là đã tới nơi."
 },
 {
  "id": "name-character",
  "after": 1,
  "kind": "hanzi",
  "topic": "Giới thiệu",
  "zh": "你叫什么名字？",
  "py": "Nǐ jiào shénme míngzi?",
  "question": "Chọn cụm chữ nói về 'tên' trong lời cô Vương.",
  "options": [
   [
    "name",
    "名字"
   ],
   [
    "school",
    "学校"
   ],
   [
    "noodle",
    "面条"
   ]
  ],
  "correct": "name",
  "hint": "Câu hỏi của cô muốn biết An được gọi là gì.",
  "explain": "名字 (míngzi) là tên."
 },
 {
  "id": "self-introduction",
  "objectiveId": "introduce-self",
  "stage": "reuse",
  "after": 1,
  "kind": "typed",
  "scene": 1,
  "topic": "Giới thiệu",
  "zh": "王老师：你叫什么名字？",
  "py": "Nǐ jiào shénme míngzi?",
  "question": "Tự nhập câu: Em tên An (安).",
  "answers": [
   "我叫安",
   "我叫明安",
   "我是安"
  ],
  "hint": "Bắt đầu bằng 我叫…",
  "explain": "我叫安。 Tôi tên là An. Đây chỉ là luyện nhập chữ Hán, không đánh giá nói."
 },
 {
  "id": "xiaoyu-student",
  "objectiveId": "student-identity",
  "stage": "reuse",
  "after": 2,
  "kind": "hanzi",
  "topic": "Trường học",
  "zh": "你是学生吗？",
  "py": "Nǐ shì xuésheng ma?",
  "question": "Chọn từ có nghĩa 'học sinh'.",
  "options": [
   [
    "student",
    "学生"
   ],
   [
    "name",
    "名字"
   ],
   [
    "teacher",
    "老师"
   ]
  ],
  "correct": "student",
  "hint": "Từ này gồm hai chữ, xuất hiện trong câu Tiểu Vũ hỏi.",
  "explain": "学生 (xuésheng) nghĩa là học sinh."
 },
 {
  "id": "school-speaker",
  "after": 2,
  "kind": "reading",
  "topic": "Bạn bè",
  "zh": "我是小雨。你是学生吗？",
  "py": "Wǒ shì Xiǎoyǔ. Nǐ shì xuésheng ma?",
  "question": "Ai đang tự giới thiệu mình?",
  "options": [
   [
    "xiaoyu",
    "Tiểu Vũ"
   ],
   [
    "wang",
    "Cô Vương"
   ],
   [
    "liu",
    "Bà Lưu"
   ]
  ],
  "correct": "xiaoyu",
  "hint": "Bạn mới gặp An trong lớp học.",
  "explain": "我是小雨 có nghĩa 'Mình là Tiểu Vũ'."
 },
 {
  "id": "three-count",
  "objectiveId": "numbers",
  "stage": "reuse",
  "after": 3,
  "kind": "hanzi",
  "topic": "Số đếm",
  "zh": "三个学生",
  "py": "Sān ge xuésheng",
  "question": "Chữ nào trong cụm này chỉ số ba?",
  "options": [
   [
    "three",
    "三"
   ],
   [
    "two",
    "二"
   ],
   [
    "one",
    "一"
   ]
  ],
  "correct": "three",
  "hint": "Đếm từ một nét, hai nét tới ba nét ngang.",
  "explain": "三 = 3. Đây là nhận diện chữ số, không phải nghe hiểu."
 },
 {
  "id": "three-students",
  "objectiveId": "numbers",
  "stage": "checkpoint",
  "after": 3,
  "kind": "reading",
  "topic": "Lớp học",
  "zh": "这里有三个学生。",
  "py": "Zhèlǐ yǒu sān ge xuésheng.",
  "question": "Nhóm của An có bao nhiêu học sinh?",
  "options": [
   [
    "three",
    "Ba"
   ],
   [
    "two",
    "Hai"
   ],
   [
    "ten",
    "Mười"
   ]
  ],
  "correct": "three",
  "hint": "Hãy nhìn cụm 三个.",
  "explain": "三个学生 nghĩa là ba học sinh."
 },
 {
  "id": "noodle-sign",
  "after": 4,
  "kind": "hanzi",
  "topic": "Quán mì",
  "zh": "面条",
  "py": "Miàntiáo",
  "question": "Chọn chữ ghi tên món mì An vừa gọi.",
  "options": [
   [
    "noodle",
    "面条"
   ],
   [
    "student",
    "学生"
   ],
   [
    "day",
    "明天"
   ]
  ],
  "correct": "noodle",
  "hint": "Tên món mà bà Lưu mang tới cho An.",
  "explain": "面条 là mì sợi."
 },
 {
  "id": "choose-food",
  "after": 4,
  "kind": "reading",
  "topic": "Gọi món",
  "zh": "我想吃面条。",
  "py": "Wǒ xiǎng chī miàntiáo.",
  "question": "An muốn làm gì?",
  "options": [
   [
    "eat",
    "Ăn mì"
   ],
   [
    "go",
    "Đến trường"
   ],
   [
    "meet",
    "Gặp bạn ngày mai"
   ]
  ],
  "correct": "eat",
  "hint": "Bà Lưu vừa hỏi An muốn ăn gì.",
  "explain": "想吃 nghĩa là muốn ăn."
 },
 {
  "id": "order-again",
  "objectiveId": "order-noodles",
  "stage": "reuse",
  "after": 4,
  "kind": "typed",
  "scene": 4,
  "topic": "Gọi món",
  "zh": "刘奶奶：你想吃什么？",
  "py": "Nǐ xiǎng chī shénme?",
  "question": "Hãy tự gõ một câu gọi mì, như An ở quán.",
  "answers": [
   "我想吃面条",
   "我要面条",
   "一碗面条",
   "我想要一碗面条"
  ],
  "hint": "Bạn có thể bắt đầu bằng 我想吃…",
  "explain": "Tình huống nhập câu đã học, chưa kiểm tra kỹ năng nói."
 },
 {
  "id": "price-ten",
  "objectiveId": "price",
  "stage": "reuse",
  "after": 5,
  "kind": "reading",
  "topic": "Mua đồ",
  "zh": "这碗面十块钱。",
  "py": "Zhè wǎn miàn shí kuài qián.",
  "question": "Bát mì có giá bao nhiêu?",
  "options": [
   [
    "ten",
    "Mười tệ"
   ],
   [
    "three",
    "Ba tệ"
   ],
   [
    "one",
    "Một tệ"
   ]
  ],
  "correct": "ten",
  "hint": "Tìm chữ 十 trước 块钱.",
  "explain": "十块钱: mười tệ. Câu giá được HIỂN THỊ, không chứng minh năng lực nghe."
 },
 {
  "id": "thanks-sign",
  "objectiveId": "gratitude",
  "stage": "reuse",
  "after": 5,
  "kind": "hanzi",
  "topic": "Lịch sự",
  "zh": "谢谢！",
  "py": "Xièxie!",
  "question": "Chọn cụm chữ biểu thị lời cảm ơn.",
  "options": [
   [
    "thanks",
    "谢谢"
   ],
   [
    "goodbye",
    "再见"
   ],
   [
    "school",
    "学校"
   ]
  ],
  "correct": "thanks",
  "hint": "Đây là lời An nói sau khi bà mang mì tới.",
  "explain": "谢谢 = cảm ơn."
 },
 {
  "id": "thank-again",
  "objectiveId": "gratitude",
  "stage": "checkpoint",
  "after": 5,
  "kind": "typed",
  "scene": 5,
  "topic": "Lịch sự",
  "zh": "刘奶奶端来热面条。",
  "py": "Liú nǎinai duān lái rè miàntiáo.",
  "question": "Nhập câu cảm ơn bà Lưu bằng chữ Hán.",
  "answers": [
   "谢谢",
   "谢谢您",
   "谢谢奶奶"
  ],
  "hint": "Một lời lịch sự gồm hai chữ giống nhau.",
  "explain": "谢谢！ là cảm ơn, không đánh giá phát âm."
 },
 {
  "id": "tomorrow",
  "after": 6,
  "kind": "hanzi",
  "topic": "Ngày mai",
  "zh": "明天我们去学校。",
  "py": "Míngtiān wǒmen qù xuéxiào.",
  "question": "Chọn cụm chữ mang nghĩa 'ngày mai'.",
  "options": [
   [
    "tomorrow",
    "明天"
   ],
   [
    "today",
    "今天"
   ],
   [
    "name",
    "名字"
   ]
  ],
  "correct": "tomorrow",
  "hint": "Đây là thời điểm Tiểu Vũ hẹn gặp An.",
  "explain": "明天 (míngtiān) nghĩa là ngày mai."
 },
 {
  "id": "school-next-day",
  "objectiveId": "farewell",
  "stage": "reuse",
  "after": 6,
  "kind": "reading",
  "topic": "Hẹn gặp",
  "zh": "明天我们去学校，好吗？",
  "py": "Míngtiān wǒmen qù xuéxiào, hǎo ma?",
  "question": "Tiểu Vũ rủ An làm gì ngày mai?",
  "options": [
   [
    "school",
    "Cùng đến trường"
   ],
   [
    "eat",
    "Ăn mì ngay"
   ],
   [
    "shop",
    "Mua sách hôm nay"
   ]
  ],
  "correct": "school",
  "hint": "学校 là trường học.",
  "explain": "明天我们去学校 = ngày mai chúng ta đến trường."
 },
 {
  "id": "agree-in-writing",
  "objectiveId": "farewell",
  "stage": "checkpoint",
  "after": 6,
  "kind": "typed",
  "scene": 6,
  "topic": "Đáp lời",
  "zh": "小雨：明天我们去学校，好吗？",
  "py": "Míngtiān wǒmen qù xuéxiào, hǎo ma?",
  "question": "Gõ một lời đồng ý bằng tiếng Trung.",
  "answers": [
   "好",
   "好的",
   "好啊",
   "可以",
   "好的明天见"
  ],
  "hint": "Một chữ cũng đủ để đồng ý.",
  "explain": "好 / 好的 là cách đồng ý ngắn."
 },
 {
  "id": "character-bright",
  "after": 6,
  "kind": "hanzi",
  "topic": "Nhìn mặt chữ",
  "zh": "明天",
  "py": "Míngtiān",
  "question": "Chữ nào đứng đầu cụm 'ngày mai'?",
  "options": [
   [
    "ming",
    "明"
   ],
   [
    "mu",
    "木"
   ],
   [
    "ma",
    "妈"
   ]
  ],
  "correct": "ming",
  "hint": "明 là chữ đứng đầu cụm 明天 (ngày mai). Hãy nhìn chữ trong cụm rồi chọn cách đọc tương ứng.",
  "explain": "明 là chữ đứng trước 天 trong 明天. Đây là một mẹo nhận dạng, không phải khẳng định lịch sử từ nguyên."
 },
 {
  "id": "greeting-reuse",
  "objectiveId": "greeting",
  "stage": "reuse",
  "after": 2,
  "artScene": 2,
  "kind": "typed",
  "scene": 0,
  "topic": "Lời chào ở lớp",
  "zh": "小雨走进教室。",
  "py": "Xiǎoyǔ zǒu jìn jiàoshì.",
  "question": "Tiểu Vũ vừa bước vào lớp. An muốn chào bạn bằng tiếng Trung; hãy gõ lời chào.",
  "answers": ["你好"],
  "hint": "Lời chào ngắn bắt đầu bằng 你.",
  "explain": "你好 (nǐ hǎo) là lời chào. Đây là lượt luyện gõ, không chấm phát âm."
 },
 {
  "id": "greeting-checkpoint",
  "objectiveId": "greeting",
  "stage": "checkpoint",
  "after": 9,
  "artScene": 2,
  "kind": "typed",
  "scene": 0,
  "topic": "Tự chào một người bạn",
  "zh": "安又遇见小雨了。小雨问安还好吗？",
  "py": "Ān yòu yùjiàn Xiǎoyǔ le. Xiǎoyǔ wèn Ān hái hǎo ma?",
  "question": "Không mở gợi ý: An muốn chào Tiểu Vũ rồi đáp rằng mình vẫn ổn. Gõ cả hai câu bằng tiếng Trung.",
  "answers": ["你好我很好"],
  "hint": "Gồm một lời chào ngắn và một câu đáp lời hỏi thăm.",
  "explain": "你好，我很好。 An chào bạn rồi nói mình vẫn ổn. Câu này chỉ ghi nhận nhớ chữ, không chấm nói."
 },
 {
  "id": "checkin-reuse",
  "objectiveId": "greeting",
  "stage": "reuse",
  "after": 3,
  "artScene": 2,
  "kind": "typed",
  "scene": 0,
  "topic": "Trả lời khi bạn hỏi thăm",
  "zh": "小雨：安，你还好吗？",
  "py": "Xiǎoyǔ: Ān, nǐ hái hǎo ma?",
  "question": "Tiểu Vũ hỏi thăm An sau buổi học đầu tiên. An muốn nói rằng mình vẫn ổn; hãy gõ câu trả lời.",
  "answers": ["我很好", "我还好", "很好", "还好"],
  "hint": "Có thể bắt đầu bằng 我…",
  "explain": "我很好 / 我还好 là những cách ngắn để nói mình vẫn ổn. Đây là luyện gõ, không chấm phát âm."
 },
 {
  "id": "order-noodles-reuse",
  "objectiveId": "order-noodles",
  "stage": "reuse",
  "after": 6,
  "artScene": 4,
  "kind": "typed",
  "scene": 4,
  "topic": "Gọi mì lần nữa",
  "zh": "安和小雨又来到刘奶奶的店。",
  "py": "Ān hé Xiǎoyǔ yòu lái dào Liú nǎinai de diàn.",
  "question": "An và Tiểu Vũ ghé quán bà Lưu lần nữa. Bà hỏi An muốn ăn gì; hãy tự gõ câu gọi mì.",
  "answers": ["我想吃面条", "我要面条", "一碗面条", "我想要一碗面条"],
  "hint": "Có thể bắt đầu bằng 我想吃…",
  "explain": "An dùng lại câu gọi mì trong một lần ghé quán khác. Đây là luyện nhập chữ, không chấm phát âm."
 },
 {
  "id": "farewell-checkpoint",
  "objectiveId": "farewell",
  "stage": "checkpoint",
  "after": 9,
  "artScene": 6,
  "kind": "typed",
  "scene": 6,
  "topic": "Nhận lời hẹn",
  "zh": "安和小雨在校门口见面。",
  "py": "Ān hé Xiǎoyǔ zài xiàoménkǒu jiànmiàn.",
  "question": "Không dùng gợi ý: Tiểu Vũ rủ An cùng đi học vào ngày mai. An đồng ý bằng một câu ngắn nào?",
  "answers": ["好", "好的", "好啊", "可以", "好的明天见"],
  "hint": "Một chữ cũng đủ để nhận lời.",
  "explain": "好 / 好的 là cách đồng ý ngắn. Đây là luyện gõ, không đánh giá phát âm."
 }
];
function validate(){var e=[],ids=new Set();items.forEach(function(it){if(ids.has(it.id))e.push("Duplicate item "+it.id);ids.add(it.id);if(!Number.isInteger(it.after)||it.after<0||it.after>9)e.push("Future or unknown story gate "+it.id);if(it.artScene!==undefined&&(!Number.isInteger(it.artScene)||it.artScene<0||it.artScene>9))e.push("Unknown review artwork scene "+it.id);if(!["reading","hanzi","typed"].includes(it.kind))e.push("Unknown learning mode "+it.id);if(it.kind==="typed"?(!Array.isArray(it.answers)||it.answers.length===0||!Number.isInteger(it.scene)):(!Array.isArray(it.options)||it.options.length!==3||!it.options.some(o=>o[0]===it.correct)||new Set(it.options.map(o=>o[0])).size!==3))e.push("Invalid answer schema "+it.id);if(it.objectiveId&&(!["greeting","introduce-self","student-identity","numbers","order-noodles","price","gratitude","farewell"].includes(it.objectiveId)||!["reuse","checkpoint"].includes(it.stage)))e.push("Invalid objective stage metadata "+it.id);if(!it.question||!it.zh||!it.py||!it.explain||!it.hint)e.push("Missing educational text "+it.id);});return e;}
var api={source:source,items:items,validate:validate};if(typeof module!=="undefined"&&module.exports)module.exports=api;return api;})();
