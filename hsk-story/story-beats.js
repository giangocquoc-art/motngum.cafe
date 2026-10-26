/* Authored, unscored story interludes for HSK Story V6. */
var HSKStoryBeats=(function(){"use strict";
var beats=[
{id:"arrival",before:0,title:"Quyển sổ của Minh An",zh:"妈妈说：“别着急。”",py:"Māma shuō: Bié zháojí.",vi:"Mẹ nói: Đừng vội.",story:"Chiếc xe dừng giữa con phố xa lạ ở Thành Đô. Mọi âm thanh và biển hiệu đều mới. Mẹ trao An một quyển sổ nhỏ: “Con không cần hiểu cả thế giới ngay hôm nay. Mỗi ngày, chỉ cần hiểu thêm một người.”"},
{id:"gate",before:1,title:"Cánh cổng trường",zh:"安站在学校门口。",py:"Ān zhàn zài xuéxiào ménkǒu.",vi:"An đứng trước cổng trường.",story:"An siết quai cặp trước cánh cổng đầy chữ Hán. Không biết mình có tìm đúng lớp hay không, An định quay sang hỏi mẹ. Nhưng một cô giáo đã bước tới và mỉm cười."},
{id:"lunch",before:4,title:"Mùi hương trong ngõ",zh:"下课了。安有点饿。",py:"Xiàkè le. Ān yǒudiǎn è.",vi:"Tan học rồi. An hơi đói.",story:"Tiểu Vũ dẫn An đi ngang dãy hành lang đông vui. Từ quán nhỏ bốc lên mùi mì nóng và vị ớt đặc trưng Thành Đô. Bà Lưu đẩy tờ thực đơn lại gần hai đứa trẻ."},
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
