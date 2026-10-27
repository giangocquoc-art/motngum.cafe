/* Authored, unscored story interludes for HSK Story V6. */
var HSKStoryBeats=(function(){"use strict";
var beats=[
{id:"arrival",before:0,title:"Quyển sổ của Minh An",zh:"妈妈说：“别着急。”",py:"Māma shuō: Bié zháojí.",vi:"Mẹ nói: Đừng vội.",story:"Sáng hôm sau, mẹ đưa An tới ngôi trường mới ở Thành Đô. Quyển sổ mẹ đã cùng An mở tối qua nằm gọn trong chiếc cặp xanh bạc màu. Biển hiệu nào trước mắt An cũng còn lạ. Mẹ nhắc An nhớ câu hai mẹ con đã ghi tối qua: “Con không cần hiểu cả thế giới ngay hôm nay. Mỗi ngày, chỉ cần hiểu thêm một người.”"},
{id:"gate",before:1,title:"Cánh cổng trường",zh:"安站在学校门口。",py:"Ān zhàn zài xuéxiào ménkǒu.",vi:"An đứng trước cổng trường.",story:"An siết quai cặp trước cánh cổng đầy chữ Hán. Không biết mình có tìm đúng lớp hay không, An định quay sang hỏi mẹ. Nhưng một cô giáo đã bước tới và mỉm cười."},
{id:"lunch",before:4,title:"Mùi hương trong ngõ",zh:"安和小雨在面馆里。",py:"Ān hé Xiǎoyǔ zài miànguǎn lǐ.",vi:"An và Tiểu Vũ đang ở trong quán mì.",story:"Quyển sổ đã yên vị trong cặp. Tan học, An và Tiểu Vũ rẽ vào quán mì nhỏ cuối ngõ. Ba bức tranh món ăn treo trên quầy khiến An ngập ngừng nhìn mãi. Bà Lưu chờ hai đứa chọn món; Tiểu Vũ ghé lại gần, khẽ nhắc An cứ thử nói điều mình muốn."},
{id:"way-home",before:6,title:"Con đường quen hơn một chút",zh:"小雨说：“明天见！”",py:"Xiǎoyǔ shuō: Míngtiān jiàn!",vi:"Tiểu Vũ nói: Hẹn gặp ngày mai!",story:"Phố xá vẫn đông, nhưng An đã nhận ra cây trước cổng trường và quán mì nhỏ. Những lời chào không còn là âm thanh vô nghĩa: chúng gắn với những khuôn mặt An đã gặp."},
{id:"school-test",before:7,title:"Một bài kiểm tra nhỏ",zh:"王老师说：“你可以的。”",py:"Wáng lǎoshī shuō: Nǐ kěyǐ de.",vi:"Cô Vương nói: Em làm được mà.",story:"Sáng hôm sau, cô Vương đưa ra một bài kiểm tra nhỏ của lớp. An cất sổ tay sang bên. Đây không phải kỳ thi chứng chỉ HSK, mà là dịp thử xem những câu nói hôm qua đã trở thành điều mình nhớ được chưa."}
];
function validate(total,exam){var errs=[],ids=new Set(),scenes=new Set();beats.forEach(b=>{if(ids.has(b.id)||scenes.has(b.before))errs.push("Duplicate");ids.add(b.id);scenes.add(b.before);if(b.before<0||b.before>=total||(b.before>=exam&&b.before!==exam))errs.push("Invalid location");if(!b.title||!b.zh||!b.py||!b.vi||!b.story)errs.push("Incomplete text")});return errs}
function clean(raw){return Array.isArray(raw)?Array.from(new Set(raw.filter(x=>beats.some(b=>b.id===x)))):[]}
function migrate(raw,step,history,done){return Array.isArray(raw)?clean(raw):beats.filter(b=>done||b.before<step||(history&&history[b.before])).map(b=>b.id)}
function pending(scene,seen){return beats.find(b=>b.before===scene&&!clean(seen).includes(b.id))||null}
function mark(seen,id){if(!beats.some(b=>b.id===id))throw Error("Unknown beat");return clean(clean(seen).concat(id))}
if(typeof module!=="undefined"&&module.exports)module.exports={beats,validate,clean,migrate,pending,mark};
return {beats,validate,clean,migrate,pending,mark};
})();
