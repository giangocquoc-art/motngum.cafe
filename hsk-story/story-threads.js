/* Gate 5: authored language transfer + character consequences. No automatic grading.
 * This module reads legacy V3 story evidence but writes no storage fields.
 * Every text returned is human-authored and bounded to already encountered scenes.
 */
var HSKStoryThreads=(function(){"use strict";
 var lines=[
  {id:"introduce",title:"Giới thiệu bản thân",model:"我叫安 · 我是学生",first:1,practice:[1,2],checkpoint:7,note:"Cô Vương hỏi tên, rồi Tiểu Vũ hỏi An có phải học sinh không.",recall:"Trong bài kiểm tra của cô Vương, An thử nối hai câu đã nói riêng lẻ."},
  {id:"order",title:"Gọi món mì",model:"我想吃面条",first:4,practice:[4],checkpoint:9,note:"An thử gọi món trong quán bà Lưu.",recall:"Cô Vương hỏi lại ở một tình huống khác, không phải món mới."},
  {id:"price",title:"Hiểu giá tiền",model:"十块钱",first:5,practice:[5],checkpoint:8,contextOnly:true,note:"Bà Lưu báo giá khi An mua mì.",recall:"An nhớ lại giá đã được đọc trên màn hình; đây không phải bài kiểm tra nghe độc lập."},
  {id:"thanks",title:"Lời cảm ơn",model:"谢谢",first:5,practice:[5],checkpoint:null,note:"An nói lời cảm ơn sau bữa ăn.",recall:"Khi đi ngang quán, lời cảm ơn có thể gợi An nhớ bà Lưu."},
  {id:"tomorrow",title:"Hẹn gặp ngày mai",model:"明天见",first:6,practice:[6],checkpoint:null,contextOnly:true,note:"Tiểu Vũ hẹn An ngày mai tới trường.",recall:"Ngày mai là một lời hẹn trong tình bạn, không chỉ là từ mới."}
 ];
 function independent(record){return !!record&&record.status==="correct"&&!record.hint&&(!Number.isFinite(Number(record.attempts))||Number(record.attempts)===0)}
 function result(record){
  if(!record)return "not-attempted";
  if(record.status==="assisted")return "sample";
  return independent(record)?"independent":"supported";
 }
 function trace(history,worldSeen){
  var h=Array.isArray(history)?history:[],world=worldSeen&&typeof worldSeen==="object"?worldSeen:{};
  return lines.map(function(l){
   var first=result(h[l.first]);
   if(first==="not-attempted")return null;
   if(l.contextOnly)first="seen-in-context";
   var checkpoint=l.checkpoint===null?"not-applicable":result(h[l.checkpoint]);
   var revisited=l.id==="thanks"&&Array.isArray(world["hsk1.e01.walk-home"])&&world["hsk1.e01.walk-home"].includes("store");
   return {id:l.id,title:l.title,model:l.model,first:first,checkpoint:checkpoint,revisited:!!revisited,
    note:l.note,recall:l.recall,checkpointScene:l.checkpoint};
  }).filter(Boolean);
 }
 function echo(sceneIndex,history,choices,encounter){
  var h=Array.isArray(history)?history:[],mem=choices&&typeof choices==="object"?choices:{};
  if(sceneIndex===1&&h[0]){
   return {zh:"你好！",py:"Nǐ hǎo!",vi:"Ở nhà An đã nghe mẹ hỏi 你好吗. Hôm nay cô Vương dùng 你好 để chào An. Cùng những âm quen thuộc, nhưng một người mới đang nói với An.",kind:"language-reappearance"};
  }
  if(sceneIndex===3&&h[1]&&h[2]){
   var sit=mem.friendship==="sit-with-friend";
   var ask=mem.friendship==="ask-teacher";
   if(!sit&&!ask)return null;
   return {zh:"我们是同学。",py:"Wǒmen shì tóngxué.",vi:sit?"An nhận ra: lúc mình chủ động xin ngồi cùng, Tiểu Vũ đã đẩy sách sang. Câu 我是学生 vừa học trở nên gần gũi hơn vì giờ An đã có bạn cùng lớp.":"An nhớ lúc mạnh dạn nhờ cô Vương. Nhờ cô chỉ chỗ, An đã có thể ngồi học cùng Tiểu Vũ. Câu 我是学生 giờ gắn với một chỗ ngồi thật.",kind:"choice-callback"};
  }
  if(sceneIndex===5&&h[4]){
   var mild=mem["noodle-taste"]==="mild",hot=mem["noodle-taste"]==="try-spicy";
   if(!mild&&!hot)return null;
   return {zh:"一碗面条。",py:"Yì wǎn miàntiáo.",vi:mild?"Bà Lưu nhớ An mới tới Thành Đô nên để ớt riêng. An muốn nói lời cảm ơn, không chỉ trả tiền.":"Bà Lưu đã đưa thêm cốc nước khi An thử vị cay. An muốn nói lời cảm ơn, không chỉ trả tiền.",kind:"choice-callback"};
  }
  if(sceneIndex===6&&h[5]){
   var friend=mem.friendship==="sit-with-friend"?"Tiểu Vũ đi cạnh An như một người bạn mới.":mem.friendship==="ask-teacher"?"Tiểu Vũ nhớ hôm An được cô Vương đưa tới chỗ ngồi.":"An nhận ra có những người đã nhớ tên mình.";
   var flavor=mem["noodle-taste"]==="mild"?"An còn nhớ bà Lưu để ớt riêng.":mem["noodle-taste"]==="try-spicy"?"An vẫn nhớ cốc nước bà Lưu đưa khi thử mì cay.":"An nhớ hơi ấm từ quán mì.";
   var notebook=encounter&&encounter.stage==="done"?" Quyển sổ mẹ tặng đã được tìm lại; hôm nay nó có thêm một kỷ niệm.":"";
   return {zh:"谢谢。明天见！",py:"Xièxie. Míngtiān jiàn!",vi:friend+" "+flavor+notebook+" Tiếng Trung giờ nối những người An gặp, chứ không chỉ là câu mẫu.",kind:"continuity"};
  }
  return null;
 }
 function ending(choices,encounter){
  var mem=choices&&typeof choices==="object"?choices:{},parts=[];
  if(mem.friendship==="sit-with-friend")parts.push("An nhớ khoảnh khắc tự xin ngồi cạnh Tiểu Vũ, bắt đầu một tình bạn bằng lời hỏi rất nhỏ.");
  else if(mem.friendship==="ask-teacher")parts.push("An nhớ lúc nhờ cô Vương giúp tìm chỗ ngồi, rồi gặp Tiểu Vũ.");
  if(mem["noodle-taste"]==="mild")parts.push("Bát mì ít cay của bà Lưu trở thành một vị quen trên phố lạ.");
  else if(mem["noodle-taste"]==="try-spicy")parts.push("Vị cay đầu tiên và cốc nước bà Lưu đưa làm Thành Đô bớt xa lạ.");
  if(encounter&&encounter.stage==="done")parts.push("Quyển sổ của mẹ lại ở trong cặp An, đầy thêm những lời chào và câu chuyện.");
  return parts.join(" ");
 }
 function validate(curriculum,content){
  var problems=[],ids=new Set(),scenes=curriculum&&curriculum.scenes||[];
  lines.forEach(function(l){
   if(ids.has(l.id))problems.push("duplicate thread "+l.id);ids.add(l.id);
   if(!scenes[l.first]||scenes[l.first].kind!=="practice")problems.push("invalid first "+l.id);
   if(!l.practice.includes(l.first)||l.practice.some(i=>!scenes[i]||scenes[i].kind!=="practice"))problems.push("invalid practice "+l.id);
   if(l.checkpoint!==null&&(!scenes[l.checkpoint]||scenes[l.checkpoint].kind!=="checkpoint"||l.checkpoint<=l.first))problems.push("invalid checkpoint "+l.id);
  });
  if(!content||!content.scenes||content.scenes.length!==scenes.length)problems.push("scene count mismatch");
  return problems;
 }
 var api={lines:lines,trace:trace,echo:echo,ending:ending,result:result,validate:validate};
 if(typeof module!=="undefined"&&module.exports)module.exports=api;return api;
})();
