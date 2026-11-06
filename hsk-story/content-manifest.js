/* Versioned authored lesson content for Chim Sẻ; stable scene and answer contracts. */
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
{id:0,place:"street",speaker:"Mẹ của An",speakerCharacter:"mother",tag:"TRƯỚC CỔNG TRƯỜNG MỚI",zh:"安，你还好吗？",py:"Ān, nǐ hái hǎo ma?",vi:"An à, con ổn không?",request:"Thử đáp lời mẹ: con vẫn ổn ạ.",error:"Mẹ đang hỏi thăm An. Thử một câu ngắn để nói con vẫn ổn nhé.",answers:["我很好","很好","我很好，谢谢","我很好谢谢"],naturalAnswers:["我还好","还好","我还好，谢谢","我还好谢谢"],guidedModel:{title:"Mẹ làm mẫu một câu",zh:"我很好。",py:"Wǒ hěn hǎo.",vi:"Con ổn ạ.",story:"Mẹ mỉm cười, làm mẫu câu trả lời ngắn rồi chờ An thử đáp lại.",alternatives:[{label:"Một vài cách đáp khác:",title:"An có thể nói theo cách của mình",story:"我还好 diễn tả ‘vẫn ổn’. Khi mẹ đã biết An đang nói về mình, cậu có thể lược 我. An cũng có thể thêm 谢谢 để cảm ơn mẹ.",zh:"我还好。 / 很好。 / 还好。 / 我很好，谢谢。 / 我还好，谢谢。",py:"Wǒ hái hǎo. / Hěn hǎo. / Hái hǎo. / Wǒ hěn hǎo, xièxie. / Wǒ hái hǎo, xièxie.",vi:"Con vẫn ổn ạ. / Ổn ạ. / Vẫn ổn ạ. / Con ổn ạ, cảm ơn mẹ. / Con vẫn ổn ạ, cảm ơn mẹ."}]},hint:"我很好。 (Wǒ hěn hǎo.) — Con ổn ạ. Mẹ đang hỏi thăm An; An có thể đáp ngắn gọn."},
{id:1,place:"school",speaker:"王老师 · Cô Vương",speakerCharacter:"wang",tag:"GẶP CÔ GIÁO",zh:"你好！你叫什么名字？",py:"Nǐ hǎo! Nǐ jiào shénme míngzi?",vi:"Xin chào! Em tên là gì?",request:"Cô chưa biết tên An. An thường dùng tên 安; tên đầy đủ là 明安. Giới thiệu bằng 我叫…",error:"Cô đang chờ nghe tên An. Thử giới thiệu ngắn gọn nhé.",answers:["我叫安","我叫明安","我是安"],guidedModel:{title:"Cô Vương làm mẫu",zh:"我叫安。",py:"Wǒ jiào Ān.",vi:"Em tên là An.",story:"Cô Vương viết câu mẫu để An tự giới thiệu, rồi mời em thử nói.",alternatives:[{label:"Tên đầy đủ hoặc cách nói ‘mình là An’:",title:"Hai cách giới thiệu tên",story:"我叫明安 giới thiệu tên đầy đủ. 我是安 có nghĩa ‘mình là An’.",zh:"我叫明安。 / 我是安。",py:"Wǒ jiào Míng’ān. / Wǒ shì Ān.",vi:"Em tên là Minh An. / Em là An."}]},hint:"我叫安。 (Wǒ jiào Ān.) — Em tên là An."},
{id:2,place:"class",speaker:"小雨 · Tiểu Vũ",speakerCharacter:"xiaoyu",tag:"NGƯỜI BẠN MỚI",zh:"你好，我是小雨。你是新来的学生吗？",py:"Nǐ hǎo, wǒ shì Xiǎoyǔ. Nǐ shì xīn lái de xuésheng ma?",vi:"Chào bạn, mình là Tiểu Vũ. Bạn là học sinh mới à?",request:"Tiểu Vũ muốn làm quen. Cho bạn biết An cũng là học sinh.",error:"Tiểu Vũ muốn biết An có học ở đây không. Thử xác nhận mình là học sinh nhé.",answers:["是，我是学生","我是学生","对我是学生","对，我是学生"],guidedModel:{title:"Tiểu Vũ làm mẫu",zh:"我是学生。",py:"Wǒ shì xuésheng.",vi:"Mình là học sinh.",story:"Tiểu Vũ chia sẻ câu giới thiệu về mình để An có thể kể tương tự.",alternatives:[{label:"Trả lời ‘vâng’ hoặc xác nhận ‘đúng vậy’:",title:"Hai cách xác nhận",story:"是 là lời đáp ‘vâng’; 对 xác nhận ‘đúng vậy’.",zh:"是，我是学生。 / 对，我是学生。",py:"Shì, wǒ shì xuésheng. / Duì, wǒ shì xuésheng.",vi:"Ừ, mình là học sinh. / Đúng vậy, mình là học sinh."}]},hint:"我是学生。 (Wǒ shì xuésheng.) — Mình là học sinh."},
{id:3,place:"class",speaker:"王老师 · Cô Vương",speakerCharacter:"wang",tag:"TRONG LỚP HỌC",zh:"这里有几个学生？",py:"Zhèlǐ yǒu jǐ ge xuésheng?",vi:"Ở đây có mấy học sinh?",request:"Cô đang chia nhóm. Đếm An và hai bạn trong tranh, rồi trả lời cô.",error:"Cô đang hỏi số học sinh trong nhóm. Em có thể trả lời bằng số lượng kèm 个, hoặc nói đủ 三个学生.",answers:["三个学生","有三个学生","三个人","有三个人"],naturalAnswers:["三个"],guidedModel:{title:"Cô Vương làm mẫu",zh:"三个学生。",py:"Sān ge xuésheng.",vi:"Ba học sinh.",story:"Cô Vương chỉ vào ba bạn trong nhóm, làm mẫu câu trả lời rồi mời An thử.",alternatives:[{label:"Thêm 有 để nói ‘có’; dùng 人 để đếm người:",title:"Nói đủ hoặc đáp gọn",story:"有 nghĩa là ‘có’. Khi đếm người, có thể dùng 人; vì cô đã hỏi mấy học sinh nên 三个 cũng là câu trả lời gọn.",zh:"有三个学生。 / 三个人。 / 有三个人。 / 三个。",py:"Yǒu sān ge xuésheng. / Sān ge rén. / Yǒu sān ge rén. / Sān ge.",vi:"Có ba học sinh. / Ba người. / Có ba người. / Ba ạ."}]},hint:"三个。 (Sān ge.) — Ba người/học sinh. Có thể nói đầy đủ: 三个学生。"},
{id:4,place:"noodle-shop",speaker:"刘奶奶 · Bà Lưu",speakerCharacter:"liu",tag:"GỌI MÓN Ở QUÁN BÀ LƯU",zh:"你好！你想吃什么？",py:"Nǐ hǎo! Nǐ xiǎng chī shénme?",vi:"Cháu muốn ăn gì?",request:"Nói với bà Lưu rằng An muốn ăn mì.",error:"Bà đang chờ biết An muốn ăn món gì. Thử nói điều mình muốn ăn nhé.",answers:["我想吃面条","我要面条","一碗面条","我想要一碗面条"],guidedModel:{title:"Bà Lưu làm mẫu",zh:"我想吃面条。",py:"Wǒ xiǎng chī miàntiáo.",vi:"Cháu muốn ăn mì.",story:"Bà Lưu chỉ lên bảng món, làm mẫu cách gọi món rồi chờ An thử.",alternatives:[{label:"Gọi trực tiếp, gọi một bát mì, hoặc nói điều An muốn ăn:",title:"Một vài cách gọi mì",story:"我要面条 gọi món trực tiếp. 一碗面条 là cách gọi ngắn ‘một bát mì’. 我想要一碗面条 nói rõ An muốn một bát.",zh:"我要面条。 / 一碗面条。 / 我想要一碗面条。",py:"Wǒ yào miàntiáo. / Yì wǎn miàntiáo. / Wǒ xiǎng yào yì wǎn miàntiáo.",vi:"Cháu lấy mì ạ. / Một bát mì ạ. / Cháu muốn một bát mì."}]},hint:"我想吃面条。 (Wǒ xiǎng chī miàntiáo.)"},
{id:5,place:"noodle-shop",speaker:"刘奶奶 · Bà Lưu",speakerCharacter:"liu",tag:"BÀ LƯU TÍNH TIỀN",zh:"这碗面十块钱。",py:"Zhè wǎn miàn shí kuài qián.",vi:"Bát mì này mười tệ.",request:"An trả tiền rồi nhận bát mì. Nói lời cảm ơn bà Lưu.",error:"An vừa nhận mì và trả tiền. Đây là lúc nói lời cảm ơn bà.",answers:["谢谢","谢谢您","谢谢奶奶"],guidedModel:{title:"An nghe một câu cảm ơn",zh:"谢谢！",py:"Xièxie!",vi:"Cảm ơn bà!",speaker:"小雨 · Tiểu Vũ",speakerCharacter:"xiaoyu",story:"Tiểu Vũ gợi An câu cảm ơn để dùng khi nhận mì.",alternatives:[{label:"Cảm ơn lễ phép hơn hoặc gọi bà là 奶奶:",title:"Hai cách cảm ơn bà Lưu",story:"Muốn nói lễ phép, An có thể dùng 您 khi cảm ơn bà. Cậu cũng có thể gọi bà là 奶奶.",zh:"谢谢您。 / 谢谢奶奶。",py:"Xièxie nín. / Xièxie nǎinai.",vi:"Cháu cảm ơn bà ạ. / Cháu cảm ơn bà."}]},hint:"谢谢！(Xièxie!) — Cảm ơn bà!"},
{id:6,place:"street",speaker:"小雨 · Tiểu Vũ",speakerCharacter:"xiaoyu",tag:"TRÊN ĐƯỜNG VỀ",zh:"明天一起上学，好吗？",py:"Míngtiān yìqǐ shàngxué, hǎo ma?",vi:"Ngày mai mình cùng đi học nhé?",request:"An muốn đi cùng bạn. Nhận lời hẹn của Tiểu Vũ.",error:"Tiểu Vũ rủ An cùng đi học ngày mai. Thử đáp lời bạn nhé.",answers:["好","好的","好啊","可以","好的明天见"],guidedModel:{title:"Tiểu Vũ làm mẫu",zh:"好！",py:"Hǎo!",vi:"Được đó!",story:"Tiểu Vũ gợi cho An một câu ngắn để nhận lời hẹn.",alternatives:[{label:"Một số cách nhận lời và hẹn gặp lại:",title:"An nhận lời hẹn",story:"好的 có thể dùng để nhận lời. 好啊 cũng là cách nhận lời thân mật với bạn. 可以 nghĩa là “được” hoặc “có thể”. An cũng có thể thêm 明天见 để hẹn gặp ngày mai.",zh:"好的！ / 好啊！ / 可以！ / 好的，明天见。",py:"Hǎo de! / Hǎo a! / Kěyǐ! / Hǎo de, míngtiān jiàn.",vi:"Được nhé! / Được chứ! / Được đó! / Được, mai gặp nhé."}]},hint:"好！(Hǎo!) — Được đó!"},
{id:7,place:"exam",speaker:"王老师 · Cô Vương",speakerCharacter:"wang",tag:"CÙNG CÔ NHỚ LẠI · 1/3",zh:"你叫什么名字？你是学生吗？",py:"Nǐ jiào shénme míngzi? Nǐ shì xuésheng ma?",vi:"Em tên là gì? Em là học sinh phải không?",request:"Cô mời An tự giới thiệu tên và nói rằng mình là học sinh. Có thể viết hai câu.",error:"Cô muốn nghe cả tên An và việc An là học sinh. Em thử nói đủ hai ý nhé.",answers:["我叫安我是学生","我是安我是学生","我叫明安我是学生","我叫安，我是学生"],hint:"我叫安。我是学生。 (Wǒ jiào Ān. Wǒ shì xuésheng.)"}
,
{id:8,place:"exam",speaker:"王老师 · Cô Vương",speakerCharacter:"wang",tag:"CÙNG CÔ NHỚ LẠI · 2/3",zh:"一碗面多少钱？",py:"Yì wǎn miàn duōshao qián?",vi:"Một bát mì bao nhiêu tiền?",request:"Cô hỏi về bữa mì hôm qua. Nhớ lại giá ở quán bà Lưu và trả lời bằng tiếng Trung.",error:"Cô đang hỏi giá bát mì An đã ăn. Em thử nhớ lại lời bà Lưu nhé.",answers:["十块钱","十块","十元"],hint:"Bà Lưu đã nói: 这碗面十块钱。"},
{id:9,place:"exam",speaker:"王老师 · Cô Vương",speakerCharacter:"wang",tag:"CÙNG CÔ NHỚ LẠI · 3/3",zh:"你想吃什么？",py:"Nǐ xiǎng chī shénme?",vi:"Em muốn ăn gì?",request:"Cô Vương đóng vai chủ quán. Tự nói món An muốn ăn, như hôm qua.",error:"Cô đang đóng vai chủ quán. An thử nói món mình muốn ăn bằng câu đã luyện nhé.",answers:["我想吃面条","我要面条","我想要一碗面条","我想吃一碗面条"],hint:"Câu đã luyện ở quán bà Lưu: 我想吃面条。"}
];

var REPLIES=[
{zh:"慢慢来，妈妈陪你。",py:"Mànman lái, māma péi nǐ.",vi:"Cứ từ từ nhé, mẹ đi cùng con."},
{zh:"欢迎你，安！",py:"Huānyíng nǐ, Ān!",vi:"Chào mừng em, An!"},
{zh:"太好了！我们是同学！",py:"Tài hǎo le! Wǒmen shì tóngxué!",vi:"Tuyệt quá! Chúng mình là bạn cùng lớp!"},
{zh:"对，你们三个一组。",py:"Duì, nǐmen sān ge yì zǔ.",vi:"Đúng rồi, ba em thành một nhóm nhé."},
{zh:"好，想吃辣的吗？",py:"Hǎo, xiǎng chī là de ma?",vi:"Được rồi, cháu có muốn ăn cay không?"},
{zh:"不客气，慢慢吃。",py:"Bú kèqi, mànman chī.",vi:"Không có gì, cứ thong thả ăn nhé."},
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
  if(s.naturalAnswers&&(!Array.isArray(s.naturalAnswers)||s.naturalAnswers.some(function(a){return typeof a!=="string"||!a.trim()})))errors.push("Scene "+i+" has invalid natural answer variants");
  if(i<7){var model=s.guidedModel;if(!model||["title","zh","py","vi","story"].some(function(key){return typeof model[key]!=="string"||!model[key].trim()}))errors.push("Scene "+i+" missing guided model");else if(!s.answers.some(function(answer){return answer.replace(/[。！!？?]/g,"")===model.zh.replace(/[。！!？?]/g,"")}))errors.push("Scene "+i+" guided model must use an existing answer");if(model&&model.alternatives&&(!Array.isArray(model.alternatives)||model.alternatives.some(function(alt){return !alt||["zh","py","vi"].some(function(key){return typeof alt[key]!=="string"||!alt[key].trim()})})))errors.push("Scene "+i+" has incomplete guided alternatives");}
  if(!target||target.id!==s.id)errors.push("Curriculum mismatch "+i);
  if(target&&i>=firstExam&&target.kind!=="checkpoint")errors.push("Non-exam scene after checkpoint "+i);
  if(!reply||["zh","py","vi"].some(function(key){return typeof reply[key]!=="string"||!reply[key].trim()}))errors.push("Missing translated NPC response "+i);
 });
 return errors;
}
return {version:"1.0.9",chapters:CHAPTERS,scenes:SCENES,replies:REPLIES,validate:validate};
})();
if(typeof module!=="undefined"&&module.exports)module.exports=HSKContent;
