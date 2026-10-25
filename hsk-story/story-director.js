/* V5 canonical authored story branches; all paths reconverge to mandated learning. */
var HSKStoryDirector=(function(){
"use strict";
var points=[
{id:"friendship",after:2,next:3,prompt:"Tiểu Vũ vừa mỉm cười với An. An muốn làm gì?",
options:[
{id:"sit-with-friend",zh:"我可以坐这里吗？",vi:"Chủ động xin ngồi cạnh Tiểu Vũ",note:"An chủ động làm quen với Tiểu Vũ.",zhBeat:"小雨把课本挪过来，和安一起看黑板。",viBeat:"Tiểu Vũ đẩy sách sang để cả hai cùng xem bảng."},
{id:"ask-teacher",zh:"老师，可以帮帮我吗？",vi:"Nhờ cô Vương chỉ chỗ ngồi",note:"An mạnh dạn nhờ cô Vương giúp đỡ.",zhBeat:"王老师带安找到座位，轻轻指着黑板。",viBeat:"Cô Vương đưa An tới chỗ ngồi rồi chỉ lên bảng."}
]},
{id:"noodle-taste",after:4,next:5,prompt:"Bà Lưu chuẩn bị nấu mì. An muốn dùng vị nào?",
options:[
{id:"mild",zh:"少放辣椒。",vi:"Ít ớt thôi, cháu chưa quen ăn cay",note:"An chọn bát mì ít ớt.",zhBeat:"刘奶奶把辣椒放在旁边，笑着端来一碗面。",viBeat:"Bà Lưu đặt ớt sang bên rồi mỉm cười mang mì tới."},
{id:"try-spicy",zh:"我想试一点辣的。",vi:"Thử một chút vị cay của Thành Đô",note:"An tò mò thử vị cay ở Thành Đô.",zhBeat:"刘奶奶放了一点辣椒，还递来一杯水。",viBeat:"Bà Lưu thêm chút ớt và đưa An một cốc nước."}
]}
];
function point(scene){return points.find(p=>p.after===scene)||null}
function option(p,m){return p&&p.options.find(o=>m&&m[p.id]===o.id)||null}
function clean(raw){var res={};points.forEach(p=>{var o=option(p,raw);if(o)res[p.id]=o.id});return res}
function pending(scene,mem){var p=point(scene);return p&&!option(p,mem)?p:null}
function select(mem,id,answer){var p=points.find(p=>p.id===id);if(!p)throw Error("Unknown story choice");var o=p.options.find(o=>o.id===answer);if(!o)throw Error("Unknown story option");var next=clean(mem);if(next[id]&&next[id]!==answer)throw Error("Choice already saved");next[id]=answer;return next}
function beat(scene,mem){var p=points.find(p=>p.next===scene),o=option(p,mem);return o?{zh:o.zhBeat,vi:o.viBeat}:null}
function memory(mem){return points.map(p=>{var o=option(p,mem);return o?{id:p.id,note:o.note,label:o.vi}:null}).filter(Boolean)}
function validate(total,exam){var errors=[];points.forEach(p=>{if(p.next!==p.after+1||p.after<0||p.next>=exam||p.next>=total)errors.push("Branch skips teaching or exam");if(!p.prompt||p.options.length<2)errors.push("Missing authoring fields");if(new Set(p.options.map(o=>o.id)).size!==p.options.length)errors.push("Duplicate option");p.options.forEach(o=>{if(!o.zh||!o.vi||!o.note||!o.zhBeat||!o.viBeat)errors.push("Missing language pair")})});return errors}
if(typeof module!=="undefined"&&module.exports)module.exports={points,point,clean,pending,select,beat,memory,validate};
return {points,point,clean,pending,select,beat,memory,validate};
})();
