/* Story-world observations are in-world context, NOT HSK grading. V9 persisted object IDs stay stable.
 * Gate3B adds evidence-free Hanzi recognition bridges and previous-scene emotional callbacks. */
var HSKSceneWorld=(function(){"use strict";
var sites=[
{scene:"hsk1.e01.arrival-greeting",place:"street",title:"Thành Đô qua đôi mắt của An",objects:[
{id:"window",icon:"▤",label:"Nhìn qua cửa kính",zh:"这里是成都。",vi:"Ngoài cửa xe, hàng cây và những biển hiệu lạ lướt qua. An chưa đọc được chúng nhưng bắt đầu nhận ra tên Thành Đô.",
 bridge:{zi:"日",py:"rì",meaning:"mặt trời / ngày",from:"intro",page:4,note:"Ánh nắng trên cửa kính khiến An nhớ hình chữ 日 trong quyển sổ."}},
{id:"case",icon:"▣",label:"Chiếc vali",zh:"这是我的行李。",vi:"Vali vẫn còn chiếc khăn mẹ xếp từ Việt Nam. An nhớ rằng ở nơi xa lạ, mình vẫn có những thứ thân quen.",
 memory:"Dù chuyển sang một thành phố khác, An vẫn mang theo một phần ngôi nhà cũ."},
{id:"diary",icon:"✎",label:"Quyển sổ của mẹ",zh:"这是我的小本子。",vi:"Ở trang đầu sổ, mẹ viết: “Mỗi ngày, chỉ cần hiểu thêm một người.” An quyết định mang nó tới trường.",
 bridge:{zi:"妈",py:"mā",meaning:"mẹ",from:"intro",page:5,note:"Mẹ đã chỉ An chữ 妈, một chữ có mảnh gợi nghĩa và mảnh gợi âm."}}
]},
{scene:"hsk1.e01.walk-home",place:"street",title:"Con đường bắt đầu quen",objects:[
{id:"tree",icon:"♧",label:"Cây trước cổng trường",zh:"这是我们的学校。",vi:"Dưới bóng cây, An đã chào một người bạn bằng tiếng Trung lần đầu tiên.",
 bridge:{zi:"木",py:"mù",meaning:"cây / gỗ",from:"intro",page:2,note:"Trên trang sổ, 木 ghép thành 林 rồi 森. Giờ An nhìn thấy cây thật bên đường."},
 callback:{scene:"hsk1.e01.arrival-greeting",object:"window",note:"Sáng nay An chỉ thấy hàng cây thoáng qua ô cửa xe; giờ chúng thành dấu mốc trên đường về."}},
{id:"store",icon:"▤",label:"Quán mì bà Lưu",zh:"谢谢奶奶！",vi:"Hơi ấm từ quán mì khiến An nhớ tiếng cười và lời cảm ơn dành cho bà Lưu.",
 bridge:{zi:"谢谢",py:"xièxie",meaning:"cảm ơn",from:"story",page:5,note:"Câu cảm ơn đã xuất hiện trong cuộc trò chuyện ở quán mì. An có thể nhận ra nó ngoài bối cảnh bài tập."}},
{id:"diary",icon:"✎",label:"Mở lại quyển sổ",zh:"我有一个好朋友。",vi:"An lật trang tiếp theo: một ngày dài đã trôi qua. Những tên người quen thuộc bắt đầu xuất hiện trong trang giấy.",
 bridge:{zi:"明",py:"míng",meaning:"sáng / rõ",from:"intro",page:4,note:"明 gợi An nhớ chữ ghép 日 và 月; trong 明天 (míngtiān) có nghĩa là ngày mai."},
 callback:{scene:"hsk1.e01.arrival-greeting",object:"diary",note:"Sáng nay An mới nhìn thấy lời mẹ ở trang đầu; tối nay quyển sổ đã có thêm kỷ niệm với Tiểu Vũ."}}
]}
];
function site(sceneId){return sites.find(s=>s.scene===sceneId)||null}
function clean(raw){var out={};if(raw&&typeof raw==="object"&&!Array.isArray(raw))sites.forEach(s=>{var a=raw[s.scene];out[s.scene]=Array.isArray(a)?s.objects.filter(o=>a.includes(o.id)).map(o=>o.id):[]});return out}
function cleanFocus(raw,seen){
 var out={},valid=clean(seen);
 if(raw&&typeof raw==="object"&&!Array.isArray(raw))sites.forEach(s=>{
  var id=raw[s.scene];if(typeof id==="string"&&valid[s.scene]&&valid[s.scene].includes(id)&&s.objects.some(o=>o.id===id))out[s.scene]=id
 });return out
}
function inspect(raw,sceneId,objectId){
 var s=site(sceneId),obj=s&&s.objects.find(o=>o.id===objectId);
 if(!obj)throw Error("Invalid inspectable object");
 var next=clean(raw),old=next[sceneId]||[];
 if(!old.includes(objectId))next[sceneId]=old.concat(objectId);
 return {state:next,object:obj};
}
function introSawGlyph(bridge,intro){
 if(!bridge||bridge.from!=="intro"||!intro||typeof intro!=="object")return false;
 var seen=Array.isArray(intro.discovered)?intro.discovered:[];
 if(seen.includes(bridge.zi))return true;
 if((bridge.zi==="日"||bridge.zi==="月")&&Array.isArray(intro.lightParts)&&intro.lightParts.includes(bridge.zi))return true;
 if(bridge.zi==="妈")return intro.momRevealed===true;
 if(bridge.zi==="明")return Array.isArray(intro.lightParts)&&intro.lightParts.includes("日")&&intro.lightParts.includes("月");
 /* Merely visiting an intro page is NOT evidence of inspecting or recognizing a glyph. */
 return false;
}
function describe(sceneId,objectId,visited,intro){
 var s=site(sceneId),obj=s&&s.objects.find(o=>o.id===objectId);
 if(!obj)throw Error("Invalid world observation");
 var story=clean(visited),b=obj.bridge,bridgeText="",callbackText="";
 if(b){
  var seen=b.from==="intro"&&introSawGlyph(b,intro);
  var pre=b.from==="story"?"Trong truyện bạn vừa gặp":seen?"Bạn từng nhìn thấy trong Nhập môn":"Một chữ/cụm chữ bạn có thể khám phá";
  bridgeText=pre+" "+b.zi+" ("+b.py+") — "+b.meaning+". "+b.note+" Không tính điểm nhớ chữ.";
 }
 if(obj.callback&&(story[obj.callback.scene]||[]).includes(obj.callback.object))callbackText=obj.callback.note;
 return {object:obj,vi:obj.vi,zh:obj.zh,bridgeText:bridgeText,callbackText:callbackText,memory:obj.memory||""};
}
function validate(graph){
 var problems=[],seen=new Set();
 sites.forEach(s=>{
  if(!graph||graph.indexOf(s.scene)<0)problems.push("Unknown scene: "+s.scene);
  if(seen.has(s.scene))problems.push("Duplicate scene world");seen.add(s.scene);
  var ids=new Set();
  s.objects.forEach(o=>{
   if(ids.has(o.id))problems.push("Duplicate object");ids.add(o.id);
   if(!o.zh||!o.vi||!o.label)problems.push("Missing localized clue");
   if(o.bridge&&(!o.bridge.zi||!o.bridge.py||!o.bridge.meaning||!["intro","story"].includes(o.bridge.from)))problems.push("Invalid learning bridge "+o.id);
   if(o.callback&&(!graph||graph.indexOf(o.callback.scene)<0||!o.callback.note))problems.push("Invalid callback "+o.id);
  });
 });
 return problems
}
var api={sites:sites,site:site,clean:clean,cleanFocus:cleanFocus,inspect:inspect,describe:describe,introSawGlyph:introSawGlyph,validate:validate};
if(typeof module!=="undefined"&&module.exports)module.exports=api;return api;
})();
