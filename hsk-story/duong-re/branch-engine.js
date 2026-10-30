/* Deterministic branching engine. No eval, API, AI score, or access to canonical HSK saves. */
(function(root,factory){"use strict";var api=factory(typeof module!=="undefined"&&module.exports?require("./branch-data.js"):root.AnBranchStory);if(typeof module!=="undefined"&&module.exports)module.exports=api;root.AnBranchEngine=api;})(typeof globalThis!=="undefined"?globalThis:this,function(data){"use strict";
var TRAITS=["courage","empathy","curiosity"],RELATIONS=["mother","xiaoyu","wang","liu"];
var TRAIT_NAMES={courage:"Dũng cảm",empathy:"Thấu cảm",curiosity:"Hiếu kỳ"};
var REL_NAMES={mother:"Mẹ",xiaoyu:"Tiểu Vũ",wang:"Cô Vương",liu:"Bà Lưu"};
function fresh(){return {version:1,node:data.start,path:[],traits:{courage:1,empathy:1,curiosity:1},relationships:{mother:1,xiaoyu:1,wang:1,liu:1},flags:{},journal:[],done:false};}
function clamp(n){return Math.max(0,Math.min(100,n));}
function normalize(text){return String(text||"").normalize("NFKC").replace(/[\s\u200b-\u200d\uFEFF。！？!?，,、：:；;.""“”‘’'（）()]/g,"").trim();}
function meets(req,state){if(!req)return true;var flags=state.flags||{};if(req.flag&&!flags[req.flag])return false;if(req.notFlag&&flags[req.notFlag])return false;if(req.anyFlags&&!req.anyFlags.some(function(k){return flags[k];}))return false;if(req.minTrait&&Object.keys(req.minTrait).some(function(k){return (state.traits[k]||0)<req.minTrait[k];}))return false;if(req.minRelation&&Object.keys(req.minRelation).some(function(k){return (state.relationships[k]||0)<req.minRelation[k];}))return false;return true;}
function availableOptions(scene,state){return scene&&scene.kind==="choice"?scene.options.filter(function(o){return meets(o.requires,state);}):[];}
function resolveTyped(scene,raw,state){if(!scene||scene.kind!=="choice")return null;var text=normalize(raw);if(!text||text.length>90||/[<>]/.test(text))return null;var choices=availableOptions(scene,state||fresh()).filter(function(o){return [o.zh].concat(o.aliases||[]).some(function(a){return normalize(a)===text;});});return choices.length===1?choices[0]:null;}
function addDelta(target,deltas,allowed){allowed.forEach(function(k){var d=deltas&&deltas[k];if(Number.isInteger(d)&&d>=-3&&d<=3)target[k]=clamp(target[k]+d);});}
function step(state,choiceId){var scene=data.byId[state.node];if(!scene||scene.kind==="ending")return {ok:false,error:"Câu chuyện đã kết thúc."};if(state.path.length>=50)return {ok:false,error:"Hành trình vượt giới hạn an toàn."};var chosen,link;
if(scene.kind==="passage"||scene.kind==="milestone"||scene.kind==="route"){
 if(choiceId!=="next")return {ok:false,error:"Hãy chọn tiếp tục."};
 link=scene.kind==="route"?(scene.routes.find(function(x){return meets(x.requires,state);})||{}).to:scene.to;
}else {chosen=availableOptions(scene,state).find(function(x){return x.id===choiceId;});if(!chosen)return {ok:false,error:"Lựa chọn chưa mở hoặc không tồn tại trong cảnh này."};link=chosen.to;}
if(!data.byId[link])return {ok:false,error:"Mạch truyện bị thiếu liên kết."};
var next={version:1,node:link,path:state.path.concat([{at:scene.id,choice:choiceId}]),traits:Object.assign({},state.traits),relationships:Object.assign({},state.relationships),flags:Object.assign({},state.flags),journal:state.journal.slice(),done:data.byId[link].kind==="ending"};
if(chosen){addDelta(next.traits,chosen.traits,TRAITS);addDelta(next.relationships,chosen.relationships,RELATIONS);next.flags[chosen.id]=true;next.journal.push({scene:scene.id,choice:chosen.id,zh:chosen.zh,vi:chosen.vi,memory:chosen.memory,consequence:{kind:chosen.consequence.kind,text:chosen.consequence.text},reply:chosen.reply});}
return {ok:true,state:next,reply:chosen?chosen.reply:null};}
function load(value){var obj;try{obj=typeof value==="string"?JSON.parse(value):value;}catch(e){return fresh();}if(!obj||obj.version!==1||!Array.isArray(obj.path))return fresh();var state=fresh();for(var i=0;i<obj.path.length&&i<50;i++){var item=obj.path[i];if(!item||item.at!==state.node||typeof item.choice!=="string")break;var moved=step(state,item.choice);if(!moved.ok)break;state=moved.state;}return state;}
function exportSave(state){return JSON.stringify({version:1,path:state.path});}
function conditionText(scene,state){return (scene.echoes||[]).filter(function(e){return Boolean(state.flags[e.if]);}).map(function(e){return e.text;});}
function dominant(state){return TRAITS.slice().sort(function(a,b){return state.traits[b]-state.traits[a]||TRAITS.indexOf(a)-TRAITS.indexOf(b);})[0];}
var endings={
courage:{name:"An học cách cất tiếng",subtitle:"Lòng dũng cảm không phải là hết sợ",story:"Tối ấy, An hiểu rằng mạnh mẽ không có nghĩa là chẳng bao giờ run rẩy. Mỗi lần cất tiếng hỏi một người lạ, An đã tự mở cho mình một cánh cửa. Ngày mai, có thể An vẫn sợ. Nhưng An biết mình có thể thử lại."},
empathy:{name:"An học cách ở bên người khác",subtitle:"Một lời nói cũng có thể là chiếc ghế dành cho ai đó",story:"Tối ấy, An nhớ không chỉ những từ mình nói được, mà còn những bàn tay đã đưa ra và những bàn tay mình kịp nắm lại. Ở một thành phố xa lạ, An bắt đầu tạo ra một nơi thuộc về mình bằng những quan tâm rất nhỏ."},
curiosity:{name:"An học cách đặt câu hỏi",subtitle:"Thành phố vẫn còn rất nhiều điều chưa biết",story:"Tối ấy, An không đếm được bao nhiêu chữ mình chưa hiểu. Nhưng từng biển hiệu, từng món ăn, từng giọng nói bỗng có vẻ như đang chờ một câu hỏi. An chưa biết hết Thành Đô; An chỉ không muốn ngừng khám phá."}
};
function ending(state){var main=dominant(state),best=RELATIONS.slice().sort(function(a,b){return state.relationships[b]-state.relationships[a]||RELATIONS.indexOf(a)-RELATIONS.indexOf(b);})[0],extra=[];
if(state.flags["tell-mother"])extra.push("Mẹ đã biết về buổi chiều An sợ hãi và chọn ngồi lại nghe con kể.");
if(state.flags["keep-secret"]&&!state.flags["confess-yesterday"])extra.push("Có một nỗi sợ An vẫn giữ riêng. Quyển sổ còn chỗ để một ngày khác viết tiếp.");
if(state.flags["invite-friend"]){
 var guestVisited=state.node==="day2-guest-arrives"||state.path.some(function(p){return p.at==="day2-guest-arrives"||p.at==="day2-guest-prep";});
 extra.push(guestVisited?(state.flags["prepare-for-guest"]?"Sáng thứ hai, An đã dọn chỗ đón Tiểu Vũ, biến lời mời hôm trước thành một buổi sáng cùng bạn.":"Sáng thứ hai, Tiểu Vũ đã ghé nhà trước giờ học, như lời An mời hôm trước."):"An đã mời Tiểu Vũ ghé nhà vào sáng hôm sau; cuộc hẹn ấy vẫn đang chờ ở trang sổ tiếp theo.");
}
if(state.flags["help-liu"])extra.push("Bà Lưu nhớ An không phải vì gọi món hay, mà vì đã giúp xếp bát.");
if(state.flags["read-menu"])extra.push("Một hàng chữ trên thực đơn trở thành câu hỏi An muốn mang về nhà.");
if(state.flags["solo-search"])extra.push("An nhớ mình đã tự tìm thấy manh mối, dù việc xin giúp đỡ vẫn thật khó.");
if(state.flags["confess-yesterday"])extra.push("Sáng thứ hai An đã quay lại câu chuyện chưa kể với mẹ, thay vì để nó nằm mãi trong sổ.");
if(state.flags["bird-quiet"])extra.push("An bảo cả lớp giữ yên lặng để chú chim sẻ tìm đường ra.");
if(state.flags["bird-teacher"])extra.push("An nhờ cô Vương giúp chú chim sẻ, dù đã có lúc ngại lên tiếng với người lớn.");
if(state.flags["bird-with-friend"])extra.push("An và Tiểu Vũ phối hợp mở cửa cho chim sẻ, cùng làm được điều không ai cần làm một mình.");
if(state.flags["liu-help"])extra.push("Ở quán mì, bà Lưu cảm ơn An vì đã tự nguyện giúp đỡ trong ngày thứ hai.");
if(state.flags["liu-stock"])extra.push("Bà Lưu tin An đến mức giao sắp xếp kệ mì — hệ quả từ lần giúp bà hôm trước.");
if(state.flags["liu-menu"])extra.push("Một câu hỏi về thực đơn hôm qua mở ra một cuộc trò chuyện mới với bà Lưu.");

return {key:main,name:endings[main].name,subtitle:endings[main].subtitle,story:endings[main].story,closest:REL_NAMES[best],extra:extra,traits:state.traits,relationships:state.relationships};
}
function validate(){
 var errors=[],ids=new Set(),choiceIds=new Set(),replyOwners=new Map(),memoryOwners=new Map(),visited=new Set(),visiting=new Set(),branchNodes=0;
 data.scenes.forEach(function(s){
  if(ids.has(s.id))errors.push("Duplicate node "+s.id);ids.add(s.id);
  if(!s.story||!s.title||!s.place||!s.speaker)errors.push("Missing narrative "+s.id);
  if(!["choice","passage","milestone","route","ending"].includes(s.kind))errors.push("Invalid node kind "+s.id);
  if(s.kind==="choice"){
   branchNodes++;if(s.options.length<2)errors.push("No branching "+s.id);
   var local=new Set(),spoken=new Map(),unconditional=0;
   s.options.forEach(function(o){
    if(local.has(o.id))errors.push("Duplicate choice "+s.id);local.add(o.id);
    if(choiceIds.has(o.id))errors.push("Duplicate global choice id "+o.id);choiceIds.add(o.id);
    if(!o.vi||!o.zh||!o.py||!o.memory||!o.reply)errors.push("Incomplete choice "+o.id);
    if(!o.consequence||o.consequence.kind!=="journal"||o.consequence.text!==o.memory||normalize(o.consequence.text).length<12)errors.push("Missing authored journal consequence "+o.id);
    var replyKey=normalize(o.reply).toLocaleLowerCase("vi"),memoryKey=normalize(o.memory).toLocaleLowerCase("vi");
    if(!replyKey)errors.push("Empty immediate reply "+o.id);
    else if(replyOwners.has(replyKey))errors.push("Duplicate immediate reply "+replyOwners.get(replyKey)+" / "+o.id);
    else replyOwners.set(replyKey,o.id);
    if(!memoryKey)errors.push("Empty persisted memory "+o.id);
    else if(memoryOwners.has(memoryKey))errors.push("Duplicate authored memory "+memoryOwners.get(memoryKey)+" / "+o.id);
    else memoryOwners.set(memoryKey,o.id);
    if(["languageScore","mastery","morality","goodness"].some(function(k){return Object.prototype.hasOwnProperty.call(o,k);}))errors.push("Choice must not score language mastery or morality "+o.id);
    [o.zh].concat(o.aliases||[]).forEach(function(t){var n=normalize(t);if(spoken.has(n)&&spoken.get(n)!==o.id)errors.push("Ambiguous input "+s.id);spoken.set(n,o.id);});
    if(!o.requires)unconditional++;
    if(!o.traits&&!o.relationships)errors.push("Choice without effects "+o.id);
   });
   if(!unconditional)errors.push("All choices locked "+s.id);
  }
  if(s.kind==="route"&&(!Array.isArray(s.routes)||!s.routes.length||s.routes[s.routes.length-1].requires))errors.push("Route requires unconditional fallback "+s.id);
 });
 function edges(s){if(s.kind==="ending")return [];if(s.kind==="route")return s.routes.map(function(r){return r.to;});if(s.kind==="choice")return s.options.map(function(o){return o.to;});return [s.to];}
 function dfs(id){
  if(visiting.has(id)){errors.push("Cycle "+id);return;}
  if(visited.has(id))return;
  var s=data.byId[id];if(!s){errors.push("Missing destination "+id);return;}
  visited.add(id);visiting.add(id);edges(s).forEach(dfs);visiting.delete(id);
 }
 dfs(data.start);
 data.scenes.forEach(function(s){if(!visited.has(s.id))errors.push("Unreachable "+s.id);});
 var required=["school-gate","lost-diary","staff-office","canteen","noodle-order","walk-home","night","epilogue","day2-arrival","day2-breakfast","day2-bird","day2-liu","day2-night"];
 function endingReachableWithout(start,excluded){
  var seen=new Set(),stack=[start];while(stack.length){var id=stack.pop();if(id===excluded||seen.has(id))continue;seen.add(id);
   var node=data.byId[id];if(!node)continue;if(node.kind==="ending")return true;edges(node).forEach(function(n){stack.push(n);});
  }return false;
 }
 function reachesEndingWithout(excluded){
  return endingReachableWithout(data.start,excluded);
 }
 required.forEach(function(x){if(reachesEndingWithout(x))errors.push("Canonical stage can be skipped "+x);});
 var sceneOrder=new Map(data.scenes.map(function(s,i){return [s.id,i];}));
 data.scenes.filter(function(s){return s.kind==="choice";}).forEach(function(s){
  var nextAnchor=required.find(function(id){return sceneOrder.get(id)>sceneOrder.get(s.id);});
  if(!nextAnchor)return;
  s.options.forEach(function(o){if(endingReachableWithout(o.to,nextAnchor))errors.push("Choice route can skip next mandatory stage "+s.id+" / "+o.id+" → "+nextAnchor);});
 });
 var countCache=new Map();
 function countPaths(id){if(countCache.has(id))return countCache.get(id);var s=data.byId[id];if(!s)return 0;var n=s.kind==="ending"?1:edges(s).reduce(function(sum,to){return sum+countPaths(to);},0);countCache.set(id,n);return n;}
 var structuralPaths=errors.length?0:countPaths(data.start);
 return {errors:Array.from(new Set(errors)),branchNodes:branchNodes,structuralPaths:structuralPaths,nodeCount:ids.size};
}

return {data:data,TRAITS:TRAITS,RELATIONS:RELATIONS,TRAIT_NAMES:TRAIT_NAMES,REL_NAMES:REL_NAMES,fresh:fresh,step:step,load:load,exportSave:exportSave,normalize:normalize,meets:meets,availableOptions:availableOptions,resolveTyped:resolveTyped,conditionText:conditionText,dominant:dominant,ending:ending,validate:validate};
});
