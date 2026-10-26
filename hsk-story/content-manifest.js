/* Versioned author-authored content manifest for Hai que huong, starting at content version 1. */
var HSKContent=(function(){
"use strict";
var CHAPTERS=[
{lvl:1,cn:"新的开始",title:"Ngày đầu xa nhà",sub:"Một lời chào mới",desc:"Từ Việt Nam tới Thành Đô. Một lớp học lạ, một lời chào đầu tiên.",place:"school",accent:"#ddb493"},
{lvl:2,cn:"第一个朋友",title:"Người bạn đầu tiên",sub:"Những con phố quen",desc:"Cùng Tiểu Vũ khám phá chợ, quán ăn và những góc phố thân thuộc.",place:"street",accent:"#bad2bb"},
{lvl:3,cn:"春天的约定",title:"Hội chợ mùa xuân",sub:"Điều ta làm cùng nhau",desc:"Hội chợ giao lưu Việt–Trung, tình bạn và trách nhiệm.",place:"festival",accent:"#f1d2aa"},
{lvl:4,cn:"改变的季节",title:"Khi mọi chuyện thay đổi",sub:"Học cách lắng nghe",desc:"Quán ăn của bà Lưu đứng trước thử thách. An phải lên tiếng.",place:"cafe",accent:"#d1c9c5"},
{lvl:5,cn:"两个故乡",title:"Hai quê hương",sub:"Câu chuyện của chính mình",desc:"Trưởng thành, lựa chọn, và lá thư tốt nghiệp viết bằng tiếng Trung.",place:"graduation",accent:"#d2d9c7"}
];
var SCENES=[
{id:0,place:"street",speaker:"Mẹ của An",tag:"SÁNG ĐẦU TIÊN TỚI TRƯỜNG",zh:"安，我们到了。你好吗？",py:"Ān, wǒmen dào le. Nǐ hǎo ma?",vi:"An, tới trường rồi. Con có khỏe không?",request:"Mẹ đang hỏi thăm bạn. Hãy trả lời rằng bạn rất khỏe.",answers:["我很好","很好","我很好，谢谢","我很好谢谢"],hint:"我很好。 (Wǒ hěn hǎo.) — Con rất khỏe."},
{id:1,place:"school",speaker:"王老师 · Cô Vương",tag:"GẶP CÔ GIÁO",zh:"你好！你叫什么名字？",py:"Nǐ hǎo! Nǐ jiào shénme míngzi?",vi:"Xin chào! Em tên là gì?",request:"Bạn nhập vai Minh An. Hãy giới thiệu tên nhân vật với cô giáo (安 hoặc 明安).",answers:["我叫安","我叫明安","我是安"],hint:"我叫安。 (Wǒ jiào Ān.) — Em tên là An."},
{id:2,place:"class",speaker:"小雨 · Tiểu Vũ",tag:"NGƯỜI BẠN MỚI",zh:"你好！我是小雨。你是学生吗？",py:"Nǐ hǎo! Wǒ shì Xiǎoyǔ. Nǐ shì xuésheng ma?",vi:"Xin chào! Mình là Tiểu Vũ. Bạn là học sinh phải không?",request:"Trả lời Tiểu Vũ: 'Đúng, mình là học sinh.'",answers:["是，我是学生","我是学生","对我是学生","对，我是学生"],hint:"我是学生。 (Wǒ shì xuésheng.) — Mình là học sinh."},
{id:3,place:"class",speaker:"王老师 · Cô Vương",tag:"TRONG LỚP HỌC",zh:"一，二，三。这里有几个学生？",py:"Yī, èr, sān. Zhèlǐ yǒu jǐ ge xuésheng?",vi:"Một, hai, ba. Ở đây có mấy học sinh?",request:"Hãy trả lời rằng có ba học sinh.",answers:["三个学生","有三个学生","三个人","有三个人"],hint:"有三个学生。 (Yǒu sān ge xuésheng.)"},
{id:4,place:"canteen",speaker:"刘奶奶 · Bà Lưu",tag:"LẦN ĐẦU Ở CĂNG TIN",zh:"你好！你想吃什么？",py:"Nǐ hǎo! Nǐ xiǎng chī shénme?",vi:"Cháu muốn ăn gì?",request:"Gọi một bát mì với bà Lưu.",answers:["我想吃面条","我要面条","一碗面条","我想要一碗面条"],hint:"我想吃面条。 (Wǒ xiǎng chī miàntiáo.)"},
{id:5,place:"canteen",speaker:"刘奶奶 · Bà Lưu",tag:"TRẢ TIỀN",zh:"这碗面十块钱。",py:"Zhè wǎn miàn shí kuài qián.",vi:"Bát mì này mười tệ.",request:"Bà đã nói giá là mười tệ. Hãy cảm ơn bà bằng tiếng Trung.",answers:["谢谢","谢谢您","谢谢奶奶"],hint:"谢谢！(Xièxie!) — Cảm ơn bà!"},
{id:6,place:"street",speaker:"小雨 · Tiểu Vũ",tag:"TRÊN ĐƯỜNG VỀ",zh:"明天我们去学校，好吗？",py:"Míngtiān wǒmen qù xuéxiào, hǎo ma?",vi:"Ngày mai chúng mình đến trường nhé?",request:"Hãy trả lời đồng ý với Tiểu Vũ.",answers:["好","好的","好啊","可以","好的明天见"],hint:"好！(Hǎo!) — Được đó!"},
{id:7,place:"exam",speaker:"王老师 · Cô Vương",tag:"BÀI KIỂM TRA · 1/3",zh:"考试开始。请用中文介绍一下自己。",py:"Kǎoshì kāishǐ. Qǐng yòng Zhōngwén jièshào yíxià zìjǐ.",vi:"Bắt đầu kiểm tra. Hãy tự giới thiệu ngắn gọn bằng tiếng Trung.",request:"Thử thách 1/3: giới thiệu tên và nói rằng mình là học sinh (có thể viết 2 câu).",answers:["我叫安我是学生","我是安我是学生","我叫明安我是学生","我叫安，我是学生"],hint:"我叫安。我是学生。 (Wǒ jiào Ān. Wǒ shì xuésheng.)"}
,
{id:8,place:"exam",speaker:"王老师 · Cô Vương",tag:"BÀI KIỂM TRA · 2/3",zh:"一碗面多少钱？",py:"Yì wǎn miàn duōshao qián?",vi:"Một bát mì bao nhiêu tiền?",request:"Thử thách 2/3: nhớ giá bát mì ở quán bà Lưu. Trả lời bằng tiếng Trung.",answers:["十块钱","十块","十元"],hint:"Bà Lưu đã nói: 这碗面十块钱。"},
{id:9,place:"exam",speaker:"王老师 · Cô Vương",tag:"BÀI KIỂM TRA · 3/3",zh:"你想吃什么？",py:"Nǐ xiǎng chī shénme?",vi:"Em muốn ăn gì?",request:"Thử thách 3/3: gọi một bát mì như khi An đến quán bà Lưu.",answers:["我想吃面条","我要面条","我想要一碗面条","我想吃一碗面条"],hint:"Câu đã luyện ở quán bà Lưu: 我想吃面条。"}
];

var REPLIES=[
{zh:"好，我们一起去看看新学校吧！",py:"Hǎo, wǒmen yìqǐ qù kànkan xīn xuéxiào ba!",vi:"Tốt quá, chúng ta cùng đi xem trường mới nhé!"},
{zh:"欢迎你，安！",py:"Huānyíng nǐ, Ān!",vi:"Chào mừng em, An!"},
{zh:"太好了！我们是同学！",py:"Tài hǎo le! Wǒmen shì tóngxué!",vi:"Tuyệt quá! Chúng mình là bạn cùng lớp!"},
{zh:"对！有三个学生。",py:"Duì! Yǒu sān ge xuésheng.",vi:"Đúng rồi! Có ba học sinh."},
{zh:"好！我给你一碗面条。",py:"Hǎo! Wǒ gěi nǐ yì wǎn miàntiáo.",vi:"Được rồi! Bà lấy cho cháu một bát mì nhé."},
{zh:"不客气！下次再来！",py:"Bú kèqi! Xià cì zài lái!",vi:"Không có gì! Lần sau lại ghé nhé!"},
{zh:"太好了！明天见！",py:"Tài hǎo le! Míngtiān jiàn!",vi:"Tuyệt! Hẹn gặp ngày mai!"},
{zh:"很好！你已经能介绍自己了。",py:"Hěn hǎo! Nǐ yǐjīng néng jièshào zìjǐ le.",vi:"Tốt lắm! Em đã biết tự giới thiệu bản thân."},
{zh:"对！一碗面十块钱。",py:"Duì! Yì wǎn miàn shí kuài qián.",vi:"Đúng rồi! Một bát mì giá mười tệ."},
{zh:"很好！你还记得怎么点面条。",py:"Hěn hǎo! Nǐ hái jìde zěnme diǎn miàntiáo.",vi:"Giỏi lắm! Em vẫn nhớ cách gọi món mì."}
];

function validate(curriculum){
 var errors=[],seenIds=new Set();
 if(CHAPTERS.length!==5)errors.push("Expected HSK acts 1–5");
 CHAPTERS.forEach(function(c,i){if(c.lvl!==i+1||!c.cn||!c.title||!c.place)errors.push("Bad chapter "+i)});
 if(!curriculum||!Array.isArray(curriculum.scenes))errors.push("Missing curriculum manifest");
 if(SCENES.length!==REPLIES.length||SCENES.length!==10)errors.push("Scene/reply size disagreement (requires migration)");
 var firstExam=curriculum&&curriculum.scenes.findIndex(function(m){return m.kind==="checkpoint"});
 SCENES.forEach(function(s,i){
  var target=curriculum&&curriculum.scenes[i],reply=REPLIES[i];
  if(!Number.isInteger(s.id)||s.id!==i||seenIds.has(s.id))errors.push("Unstable scene identifier "+i);
  seenIds.add(s.id);
  ["place","speaker","tag","zh","py","vi","request","hint"].forEach(function(key){if(typeof s[key]!=="string"||!s[key].trim())errors.push("Scene "+i+" missing "+key)});
  if(!Array.isArray(s.answers)||!s.answers.length||s.answers.some(function(a){return typeof a!=="string"||!a.trim()}))errors.push("Scene "+i+" has no accepted answers");
  if(!target||target.id!==s.id)errors.push("Curriculum mismatch "+i);
  if(target&&i>=firstExam&&target.kind!=="checkpoint")errors.push("Non-exam scene after checkpoint "+i);
  if(!reply||["zh","py","vi"].some(function(key){return typeof reply[key]!=="string"||!reply[key].trim()}))errors.push("Missing translated NPC response "+i);
 });
 return errors;
}
return {version:"1.0.0",chapters:CHAPTERS,scenes:SCENES,replies:REPLIES,validate:validate};
})();
if(typeof module!=="undefined"&&module.exports)module.exports=HSKContent;
