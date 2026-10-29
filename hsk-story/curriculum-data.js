/* Story learning metadata. Roadmap levels are planned; only the HSK1 demo is playable. */
var HSKCurriculum=(function(){
"use strict";
var levels=[
{level:1,title:"Ngày đầu xa nhà",zh:"新的开始",premise:"Đến Thành Đô, nhập học và kết bạn",skills:["chào hỏi","giới thiệu tên","đếm","gọi món","cảm ơn"],exam:"Kiểm tra nhập học",status:"demo"},
{level:2,title:"Người bạn đầu tiên",zh:"第一个朋友",premise:"Đường phố, chợ, công viên và tình bạn với Tiểu Vũ",skills:["thời gian","hỏi đường","mua sắm","sở thích"],exam:"Kiểm tra học kỳ",status:"planned"},
{level:3,title:"Hội chợ mùa xuân",zh:"春天的约定",premise:"Cả lớp tổ chức gian hàng giao lưu Việt–Trung",skills:["kể lại","lập kế hoạch","giải thích","hợp tác"],exam:"Thuyết trình tại hội chợ",status:"planned"},
{level:4,title:"Khi mọi chuyện thay đổi",zh:"改变的季节",premise:"Tìm cách giúp quán bà Lưu trước nguy cơ đóng cửa",skills:["nguyên nhân","tranh luận","đọc thông báo","viết đề xuất"],exam:"Bảo vệ dự án cộng đồng",status:"planned"},
{level:5,title:"Hai quê hương",zh:"两个故乡",premise:"Minh An trưởng thành và đối diện lựa chọn trở về Việt Nam",skills:["thảo luận quan điểm","đọc văn bản dài","viết bài văn","dịch Trung–Việt"],exam:"Viết 我的两个故乡 hoặc dịch thuật",status:"planned"}
];
var scenes=[
{id:0,kind:"practice",objective:"Đáp lời mẹ hỏi thăm",topic:"Gia đình · Hỏi thăm",words:[["你还好吗","nǐ hái hǎo ma","con ổn không?"],["我很好","wǒ hěn hǎo","con ổn ạ"]],reviewOf:[]},
{id:1,kind:"practice",objective:"Giới thiệu tên Minh An",topic:"Trường học · Làm quen",words:[["你好","nǐ hǎo","xin chào"],["我叫安","wǒ jiào Ān","mình tên An"],["名字","míngzi","tên"]],reviewOf:[0]},
{id:2,kind:"practice",objective:"Xác nhận mình là học sinh",topic:"Trường học · Bạn mới",words:[["学生","xuésheng","học sinh"],["我是","wǒ shì","mình là"]],reviewOf:[1]},
{id:3,kind:"practice",objective:"Đếm học sinh khi chia nhóm",topic:"Lớp học · Số đếm",words:[["一二三","yī èr sān","một hai ba"],["三个","sān ge","ba người/vật"]],reviewOf:[2]},
{id:4,kind:"practice",objective:"Gọi món muốn ăn",topic:"Quán mì bà Lưu · Gọi món",words:[["我想吃","wǒ xiǎng chī","mình muốn ăn"],["面条","miàntiáo","mì"]],reviewOf:[0]},
{id:5,kind:"practice",objective:"Hiểu giá tiền và cảm ơn",topic:"Quán mì bà Lưu · Tính tiền",words:[["十块钱","shí kuài qián","mười tệ"],["谢谢","xièxie","cảm ơn"]],reviewOf:[4]},
{id:6,kind:"practice",objective:"Đồng ý lời mời và hẹn gặp",topic:"Đường về · Bạn bè",words:[["明天","míngtiān","ngày mai"],["好","hǎo","được"]],reviewOf:[0,2]},
{id:7,kind:"checkpoint",objective:"Tự giới thiệu bằng tiếng Trung",topic:"Kiểm tra · Giới thiệu",words:[],reviewOf:[1,2]},
{id:8,kind:"checkpoint",objective:"Nhớ giá bát mì ở quán bà Lưu",topic:"Kiểm tra · Đọc và nhớ ngữ cảnh",words:[],reviewOf:[5]},
{id:9,kind:"checkpoint",objective:"Tự gọi món đã học",topic:"Kiểm tra · Diễn đạt",words:[],reviewOf:[4]}
];
function validate(){
 var problems=[];
 if(levels.length!==5||levels.some(function(l,i){return l.level!==i+1}))problems.push("Level sequence must be 1..5");
 scenes.forEach(function(s,i){
  if(s.id!==i||!s.kind||!s.objective||!Array.isArray(s.words))problems.push("Malformed scene "+i);
  if(s.kind==="checkpoint"&&s.words.length)problems.push("Assessment must not introduce words "+i);
  (s.reviewOf||[]).forEach(function(k){if(!Number.isInteger(k)||k<0||k>=i)problems.push("Invalid prerequisite "+i)});
 });
 if(scenes.slice(7).some(function(s){return s.kind!=="checkpoint"||!s.reviewOf.length}))problems.push("Must include exactly three recall checkpoints");
 return problems;
}
return {version:"2026-10-26-v3",levels:levels,scenes:scenes,validate:validate};
})();
if(typeof module!=="undefined"&&module.exports)module.exports=HSKCurriculum;
