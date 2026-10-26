/* V9 inspectable scene landmarks: optional atmosphere, not language grades. */
var HSKSceneWorld=(function(){"use strict";
var sites=[
{scene:"hsk1.e01.arrival-greeting",place:"street",title:"Thành Đô qua đôi mắt của An",objects:[
{id:"window",icon:"▤",label:"Nhìn qua cửa kính",zh:"这里是成都。",vi:"Ngoài cửa xe, hàng cây và những biển hiệu lạ lướt qua. An chưa đọc được chúng nhưng bắt đầu nhận ra tên Thành Đô."},
{id:"case",icon:"▣",label:"Chiếc vali",zh:"这是我的行李。",vi:"Vali vẫn còn chiếc khăn mẹ xếp từ Việt Nam. An nhớ rằng ở nơi xa lạ, mình vẫn có những thứ thân quen."},
{id:"diary",icon:"✎",label:"Quyển sổ của mẹ",zh:"这是我的小本子。",vi:"Ở trang đầu sổ, mẹ viết: “Mỗi ngày, chỉ cần hiểu thêm một người.” An quyết định mang nó tới trường."}
]},
{scene:"hsk1.e01.walk-home",place:"street",title:"Con đường bắt đầu quen",objects:[
{id:"tree",icon:"♧",label:"Cây trước cổng trường",zh:"这是我们的学校。",vi:"Dưới bóng cây, An đã chào một người bạn bằng tiếng Trung lần đầu tiên."},
{id:"store",icon:"▤",label:"Quán mì bà Lưu",zh:"谢谢奶奶！",vi:"Hơi ấm từ quán mì khiến An nhớ tiếng cười và lời cảm ơn dành cho bà Lưu."},
{id:"diary",icon:"✎",label:"Mở lại quyển sổ",zh:"我有一个好朋友。",vi:"An lật trang tiếp theo: một ngày dài đã trôi qua. Những tên người quen thuộc bắt đầu xuất hiện trong trang giấy."}
]}
];
function site(sceneId){return sites.find(s=>s.scene===sceneId)||null}
function clean(raw){var out={};if(raw&&typeof raw==="object"&&!Array.isArray(raw))sites.forEach(s=>{var a=raw[s.scene];out[s.scene]=Array.isArray(a)?s.objects.filter(o=>a.includes(o.id)).map(o=>o.id):[]});return out}
function inspect(raw,sceneId,objectId){var s=site(sceneId),obj=s&&s.objects.find(o=>o.id===objectId);if(!obj)throw Error("Invalid inspectable object");
 var next=clean(raw),old=next[sceneId]||[];if(!old.includes(objectId))next[sceneId]=old.concat(objectId);return {state:next,object:obj}}
function validate(graph){var problems=[],seen=new Set();sites.forEach(s=>{
 if(!graph||graph.indexOf(s.scene)<0)problems.push("Unknown scene: "+s.scene);
 if(seen.has(s.scene))problems.push("Duplicate scene world");seen.add(s.scene);
 var ids=new Set();s.objects.forEach(o=>{if(ids.has(o.id))problems.push("Duplicate object");ids.add(o.id);if(!o.zh||!o.vi||!o.label)problems.push("Missing localized clue")});
});return problems}
var api={sites:sites,site:site,clean:clean,inspect:inspect,validate:validate};if(typeof module!=="undefined"&&module.exports)module.exports=api;return api;
})();
