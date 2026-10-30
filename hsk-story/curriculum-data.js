/* HSK 3.0 roadmap metadata. Only the HSK1 story pilot is playable; syllabus mapping is pending review. */
var HSKCurriculum=(function(){
"use strict";
var source={edition:"2025-11",effective:"2026-07",framework:"HSK 3.0",url:"https://hsk.cn-bj.ufileos.com/3.0/%E6%96%B0%E7%89%88HSK%E8%80%83%E8%AF%95%E5%A4%A7%E7%BA%B21219.pdf",status:"source-pinned; authored objective mappings pending qualified Mandarin educator review"};
var levels=[
{level:1,title:"Ngày đầu xa nhà",zh:"新的开始",premise:"Đến Thành Đô, nhập học và kết bạn",storyThemes:["chào hỏi","giới thiệu bản thân","đếm","gọi món","cảm ơn"],status:"pilot-playable",mappingStatus:"pending-item-review",sourcePages:{tasks:2,topics:56,vocabulary:77,characters:353,grammar:383}},
{level:2,title:"Người bạn đầu tiên",zh:"第一个朋友",premise:"An và Tiểu Vũ học cách hỏi lại, hẹn nhau và tìm đường",storyThemes:["thời gian","hỏi đường","mua sắm","sở thích"],status:"outline-only",mappingStatus:"pending-item-review",sourcePages:{tasks:6,topics:58,vocabulary:84,characters:355,grammar:386}},
{level:3,title:"Hội chợ mùa xuân",zh:"春天的约定",premise:"Cả lớp tổ chức gian hàng giao lưu Việt–Trung",storyThemes:["kể lại","lập kế hoạch","giải thích","hợp tác"],status:"outline-only",mappingStatus:"pending-item-review",sourcePages:{tasks:11,topics:60,vocabulary:89,characters:356,grammar:389}},
{level:4,title:"Khi mọi chuyện thay đổi",zh:"改变的季节",premise:"An cùng khu phố tìm cách giúp quán bà Lưu",storyThemes:["nguyên nhân","đọc thông báo","trình bày ý kiến","đề xuất"],status:"outline-only",mappingStatus:"pending-item-review",sourcePages:{tasks:18,topics:63,vocabulary:102,characters:358,grammar:392}},
{level:5,title:"Hai quê hương",zh:"两个故乡",premise:"An cân nhắc điều mình muốn giữ lại khi gia đình đứng trước thay đổi",storyThemes:["quan điểm","đọc dài","viết và dịch theo rubric riêng"],status:"outline-only",mappingStatus:"pending-item-review",sourcePages:{tasks:29,topics:66,vocabulary:127,characters:361,grammar:395}},
{level:6,title:"Những điều An muốn gửi lại",zh:"",premise:"An nhìn lại những mối quan hệ đã gây dựng và tự chọn bước tiếp theo",storyThemes:["tổng hợp trải nghiệm","đọc và viết theo yêu cầu bậc học"],status:"outline-only",mappingStatus:"pending-item-review",sourcePages:{tasks:37,topics:69,vocabulary:167,characters:364,grammar:398}}
];
var scenes=[
{id:0,objectiveIds:["greeting"],assessmentObjectiveIds:["greeting"],kind:"practice",objective:"Đáp lời mẹ hỏi thăm",topic:"Gia đình · Hỏi thăm",words:[["你还好吗","nǐ hái hǎo ma","con ổn không?"],["我很好","wǒ hěn hǎo","con ổn ạ"]],reviewOf:[]},
{id:1,objectiveIds:["greeting","introduce-self"],assessmentObjectiveIds:["introduce-self"],kind:"practice",objective:"Giới thiệu tên Minh An",topic:"Trường học · Làm quen",words:[["你好","nǐ hǎo","xin chào"],["我叫安","wǒ jiào Ān","mình tên An"],["名字","míngzi","tên"]],reviewOf:[0]},
{id:2,objectiveIds:["introduce-self","student-identity"],assessmentObjectiveIds:["student-identity"],kind:"practice",objective:"Xác nhận mình là học sinh",topic:"Trường học · Bạn mới",words:[["学生","xuésheng","học sinh"],["我是","wǒ shì","mình là"]],reviewOf:[1]},
{id:3,objectiveIds:["student-identity","numbers"],assessmentObjectiveIds:["numbers"],kind:"practice",objective:"Đếm học sinh khi chia nhóm",topic:"Lớp học · Số đếm",words:[["一二三","yī èr sān","một hai ba"],["三个","sān ge","ba người/vật"]],reviewOf:[2]},
{id:4,objectiveIds:["order-noodles"],assessmentObjectiveIds:["order-noodles"],kind:"practice",objective:"Gọi món muốn ăn",topic:"Quán mì bà Lưu · Gọi món",words:[["我想吃","wǒ xiǎng chī","mình muốn ăn"],["面条","miàntiáo","mì"]],reviewOf:[0]},
{id:5,objectiveIds:["order-noodles","price","gratitude"],assessmentObjectiveIds:["gratitude"],kind:"practice",objective:"Hiểu giá tiền và cảm ơn",topic:"Quán mì bà Lưu · Tính tiền",words:[["十块钱","shí kuài qián","mười tệ"],["谢谢","xièxie","cảm ơn"]],reviewOf:[4]},
{id:6,objectiveIds:["farewell"],assessmentObjectiveIds:["farewell"],kind:"practice",objective:"Đồng ý lời mời và hẹn gặp",topic:"Đường về · Bạn bè",words:[["明天","míngtiān","ngày mai"],["好","hǎo","được"]],reviewOf:[0,2]},
{id:7,objectiveIds:["introduce-self","student-identity"],assessmentObjectiveIds:["introduce-self","student-identity"],kind:"checkpoint",objective:"Tự giới thiệu bằng tiếng Trung",topic:"Kiểm tra · Giới thiệu",words:[],reviewOf:[1,2]},
{id:8,objectiveIds:["price"],assessmentObjectiveIds:["price"],kind:"checkpoint",objective:"Nhớ giá bát mì ở quán bà Lưu",topic:"Kiểm tra · Đọc và nhớ ngữ cảnh",words:[],reviewOf:[5]},
{id:9,objectiveIds:["order-noodles"],assessmentObjectiveIds:["order-noodles"],kind:"checkpoint",objective:"Tự gọi món đã học",topic:"Kiểm tra · Diễn đạt",words:[],reviewOf:[4]}
];
function validate(){
 var problems=[];
 if(levels.length!==6||levels.some(function(l,i){return l.level!==i+1}))problems.push("Level sequence must be HSK3.0 1..6");
 if(!source||source.edition!=="2025-11"||source.effective!=="2026-07"||!source.url.startsWith("https://www.chinesetest.cn/")&& !source.url.startsWith("https://hsk.cn-bj.ufileos.com/3.0/"))problems.push("Missing versioned official HSK3.0 syllabus source");
 levels.forEach(function(l){if(l.mappingStatus!=="pending-item-review"||!l.sourcePages||!["pilot-playable","outline-only"].includes(l.status))problems.push("Unclear review state for level "+l.level);});
 scenes.forEach(function(s,i){
  if(s.id!==i||!s.kind||!s.objective||!Array.isArray(s.words)||!Array.isArray(s.objectiveIds)||!s.objectiveIds.length||!Array.isArray(s.assessmentObjectiveIds))problems.push("Malformed scene "+i);
  if((s.assessmentObjectiveIds||[]).some(function(id){return !s.objectiveIds.includes(id)}))problems.push("Assessment objective must be present in scene crosswalk "+i);
  if(s.kind==="checkpoint"&&s.words.length)problems.push("Assessment must not introduce words "+i);
  (s.reviewOf||[]).forEach(function(k){if(!Number.isInteger(k)||k<0||k>=i)problems.push("Invalid prerequisite "+i)});
 });
 if(scenes.slice(7).some(function(s){return s.kind!=="checkpoint"||!s.reviewOf.length}))problems.push("Must include exactly three recall checkpoints");
 return problems;
}
return {version:"2026-10-30-hsk3.0-v4",source:source,levels:levels,scenes:scenes,validate:validate};
})();
if(typeof module!=="undefined"&&module.exports)module.exports=HSKCurriculum;
