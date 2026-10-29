/* Authored, unscored story interludes for HSK Story V6. */
var HSKStoryBeats=(function(){"use strict";
var beats=[
{id:"arrival",before:0,title:"Trước cổng trường mới",zh:"我们到了。",py:"Wǒmen dào le.",vi:"Tới nơi rồi.",story:"Sáng hôm sau, An theo mẹ tới trường mới ở Thành Đô, tay siết quai cặp. Quyển sổ mẹ mở tối qua vẫn nằm trong cặp. Mẹ thấy con ngập ngừng, bèn hỏi thăm."},
{id:"gate",before:1,title:"Cánh cổng trường",zh:"安站在学校门口。",py:"Ān zhàn zài xuéxiào ménkǒu.",vi:"An đứng trước cổng trường.",story:"An vẫn bối rối trước cổng trường, lo mình tìm nhầm lớp. Một cô giáo bước tới mỉm cười; An quay sang chào cô, lòng nhẹ đi đôi chút."},
{id:"lunch",before:4,title:"Mùi hương trong ngõ",zh:"安和小雨在面馆里。",py:"Ān hé Xiǎoyǔ zài miànguǎn lǐ.",vi:"An và Tiểu Vũ đang ở trong quán mì.",story:"Quyển sổ mẹ tặng đã được tìm lại. Tan học, An và Tiểu Vũ ghé quán mì nhỏ cuối ngõ; An phân vân trước bảng món, nên Tiểu Vũ khích lệ bạn thử gọi món."},
{id:"way-home",before:6,title:"Con đường quen hơn một chút",zh:"安和小雨一起回家。",py:"Ān hé Xiǎoyǔ yìqǐ huí jiā.",vi:"An và Tiểu Vũ cùng đi về.",story:"Ăn xong, An và Tiểu Vũ cùng đi về. Phố vẫn đông, nhưng cây trước cổng và quán mì đã quen hơn; có bạn bên cạnh, con đường lạ bỗng gần gũi."},
{id:"school-test",before:7,title:"Một bài kiểm tra nhỏ",zh:"王老师说：“你可以的。”",py:"Wáng lǎoshī shuō: Nǐ kěyǐ de.",vi:"Cô Vương nói: Em làm được mà.",story:"Sáng hôm sau, cô Vương mời An nhớ lại những câu đã gặp hôm trước. Đây là bài ôn nhỏ của lớp, không phải kỳ thi chứng chỉ HSK."}
];
function validate(total,exam){var errs=[],ids=new Set(),scenes=new Set();beats.forEach(b=>{if(ids.has(b.id)||scenes.has(b.before))errs.push("Duplicate");ids.add(b.id);scenes.add(b.before);if(b.before<0||b.before>=total||(b.before>=exam&&b.before!==exam))errs.push("Invalid location");if(!b.title||!b.zh||!b.py||!b.vi||!b.story)errs.push("Incomplete text")});return errs}
function clean(raw){return Array.isArray(raw)?Array.from(new Set(raw.filter(x=>beats.some(b=>b.id===x)))):[]}
function migrate(raw,step,history,done){return Array.isArray(raw)?clean(raw):beats.filter(b=>done||b.before<step||(history&&history[b.before])).map(b=>b.id)}
function pending(scene,seen){return beats.find(b=>b.before===scene&&!clean(seen).includes(b.id))||null}
function mark(seen,id){if(!beats.some(b=>b.id===id))throw Error("Unknown beat");return clean(clean(seen).concat(id))}
if(typeof module!=="undefined"&&module.exports)module.exports={beats,validate,clean,migrate,pending,mark};
return {beats,validate,clean,migrate,pending,mark};
})();
