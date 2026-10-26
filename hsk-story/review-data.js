/* Editorial pilot, NOT audited complete HSK syllabus. Each item requires completed prior story scene. */
var HSKReviewData=(function(){"use strict";
var source={origin:"Original in-story authored examples",officialReference:"https://www.chinesetest.cn/hsk",syllabusStatus:"official_framework_reviewed; individual items pending Mandarin/syllabus signoff",skillsClaim:"guided Hanzi recognition, on-screen reading, typed recall ONLY"};
var items=[
 {
  "id": "mother-question",
  "after": 0,
  "kind": "reading",
  "topic": "Chào hỏi",
  "zh": "安，你好吗？",
  "py": "Ān, nǐ hǎo ma?",
  "question": "Mẹ đang muốn biết điều gì?",
  "options": [
   [
    "health",
    "An có khỏe không"
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
  "hint": "Đây là câu mẹ nói ngay khi đưa An tới trường.",
  "explain": "你好吗？ là cách hỏi thăm người đối diện."
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
  "hint": "Nghĩ tới chiếc xe vừa dừng ở cổng trường.",
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
  "after": 3,
  "kind": "hanzi",
  "topic": "Số đếm",
  "zh": "一，二，三。",
  "py": "Yī, èr, sān.",
  "question": "Chọn chữ Hán chỉ số ba.",
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
  "after": 3,
  "kind": "reading",
  "topic": "Lớp học",
  "zh": "这里有三个学生。",
  "py": "Zhèlǐ yǒu sān ge xuésheng.",
  "question": "Trong lớp có bao nhiêu học sinh?",
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
  "hint": "Bạn có thể nhớ 日 và 月 đứng cùng nhau.",
  "explain": "明 là chữ đứng trước 天 trong 明天. Đây là một mẹo nhận dạng, không phải khẳng định lịch sử từ nguyên."
 }
];
function validate(){var e=[],ids=new Set();items.forEach(function(it){if(ids.has(it.id))e.push("Duplicate item "+it.id);ids.add(it.id);if(!Number.isInteger(it.after)||it.after<0||it.after>6)e.push("Future or unknown story gate "+it.id);if(!["reading","hanzi","typed"].includes(it.kind))e.push("Unknown learning mode "+it.id);if(it.kind==="typed"?(!Array.isArray(it.answers)||it.answers.length===0||!Number.isInteger(it.scene)):(!Array.isArray(it.options)||it.options.length!==3||!it.options.some(o=>o[0]===it.correct)||new Set(it.options.map(o=>o[0])).size!==3))e.push("Invalid answer schema "+it.id);if(!it.question||!it.zh||!it.py||!it.explain||!it.hint)e.push("Missing educational text "+it.id);});return e;}
var api={source:source,items:items,validate:validate};if(typeof module!=="undefined"&&module.exports)module.exports=api;return api;})();
