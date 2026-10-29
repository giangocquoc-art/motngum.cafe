/* Deterministic branching engine. No eval, API, AI score, or access to canonical HSK saves. */
(function(root,factory){"use strict";var api=factory(typeof module!=="undefined"&&module.exports?require("./branch-data.js"):root.AnBranchStory);if(typeof module!=="undefined"&&module.exports)module.exports=api;root.AnBranchEngine=api;})(typeof globalThis!=="undefined"?globalThis:this,function(data){"use strict";
var TRAITS=["courage","empathy","curiosity"],RELATIONS=["mother","xiaoyu","wang","liu"];
var TRAIT_NAMES={courage:"Dũng cảm",empathy:"Thấu cảm",curiosity:"Hiếu kỳ"};
var REL_NAMES={mother:"Mẹ",xiaoyu:"Tiểu Vũ",wang:"Cô Vương",liu:"Bà Lưu"};
function fresh(){return {version:1,node:data.start,path:[],traits:{courage:1,empathy:1,curiosity:1},relationships:{mother:1,xiaoyu:1,wang:1,liu:1},flags:{},journal:[],done:false};}
function clamp(n){return Math.max(0,Math.min(100,n));}
function normalize(text){return String(text||"").normalize("NFKC").replace(/[\s\u200b-\u200d\uFEFF。！？!?，,、：:；;.""“”‘’'（）()]/g,"").trim();}
function resolveTyped(scene,raw){if(!scene||scene.kind!=="choice")return null;var text=normalize(raw);if(!text||text.length>90||/[<>]/.test(text))return null;var choices=scene.options.filter(function(o){return [o.zh].concat(o.aliases||[]).some(function(a){return normalize(a)===text;});});return choices.length===1?choices[0]:null;}
function addDelta(target,deltas,allowed){allowed.forEach(function(k){var d=deltas&&deltas[k];if(Number.isInteger(d)&&d>=-3&&d<=3)target[k]=clamp(target[k]+d);});}
function step(state,choiceId){var scene=data.byId[state.node];if(!scene||scene.kind==="ending")return {ok:false,error:"Câu chuyện đã kết thúc."};if(state.path.length>=50)return {ok:false,error:"Hành trình vượt giới hạn an toàn."};var chosen,link;
if(scene.kind==="passage"){if(choiceId!=="next")return {ok:false,error:"Hãy chọn tiếp tục."};link=scene.to;}
else {chosen=scene.options.find(function(x){return x.id===choiceId;});if(!chosen)return {ok:false,error:"Lựa chọn không tồn tại trong cảnh này."};link=chosen.to;}
if(!data.byId[link])return {ok:false,error:"Mạch truyện bị thiếu liên kết."};
var next={version:1,node:link,path:state.path.concat([{at:scene.id,choice:choiceId}]),traits:Object.assign({},state.traits),relationships:Object.assign({},state.relationships),flags:Object.assign({},state.flags),journal:state.journal.slice(),done:link==="epilogue"};
if(chosen){addDelta(next.traits,chosen.traits,TRAITS);addDelta(next.relationships,chosen.relationships,RELATIONS);next.flags[chosen.id]=true;next.journal.push({scene:scene.id,choice:chosen.id,zh:chosen.zh,vi:chosen.vi,memory:chosen.memory,reply:chosen.reply});}
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
if(state.flags["keep-secret"])extra.push("Có một nỗi sợ An vẫn giữ riêng. Quyển sổ còn chỗ để một ngày khác viết tiếp.");
if(state.flags["invite-friend"])extra.push("Lời mời Tiểu Vũ ghé nhà mở ra một buổi tối khác cho cả hai.");
if(state.flags["help-liu"])extra.push("Bà Lưu nhớ An không phải vì gọi món hay, mà vì đã giúp xếp bát.");
if(state.flags["read-menu"])extra.push("Một hàng chữ trên thực đơn trở thành câu hỏi An muốn mang về nhà.");
if(state.flags["solo-search"])extra.push("An nhớ mình đã tự tìm thấy manh mối, dù việc xin giúp đỡ vẫn thật khó.");
return {key:main,name:endings[main].name,subtitle:endings[main].subtitle,story:endings[main].story,closest:REL_NAMES[best],extra:extra,traits:state.traits,relationships:state.relationships};
}
function validate(){var errors=[],ids=new Set(),visited=new Set(),visiting=new Set(),mandatory=["school-gate","lost-diary","staff-office","canteen","noodle-order","walk-home","night","epilogue"],branchNodes=0,paths=0;
data.scenes.forEach(function(s){if(ids.has(s.id))errors.push("Duplicate node "+s.id);ids.add(s.id);if(!s.story||!s.title||!s.place||!s.speaker)errors.push("Missing narrative "+s.id);var opts=s.kind==="choice"?s.options:s.kind==="passage"?[{id:"next",to:s.to}]:[];
if(s.kind==="choice"){if(opts.length<2)errors.push("No branching "+s.id);branchNodes++;var local=new Set(),spoken=new Set();opts.forEach(function(o){if(local.has(o.id))errors.push("Duplicate choice "+s.id);local.add(o.id);if(!o.vi||!o.zh||!o.py||!o.memory||!o.reply)errors.push("Incomplete bilingual choice "+o.id);[o.zh].concat(o.aliases||[]).forEach(function(t){var n=normalize(t);if(spoken.has(n))errors.push("Ambiguous typed choice "+s.id);spoken.add(n);});if(!Object.values(o.traits).some(function(v){return v!==0;})&&!Object.values(o.relationships).some(function(v){return v!==0;}))errors.push("No lasting effect "+o.id);});}
opts.forEach(function(o){if(!data.byId[o.to])errors.push("Missing destination "+o.to);});
});
function walk(id,ancestors){if(visiting.has(id)){errors.push("Cycle at "+id);return;}if(!data.byId[id])return;visited.add(id);visiting.add(id);var node=data.byId[id],nextAncestors=ancestors.concat(id);
if(node.kind==="ending"){paths++;mandatory.forEach(function(x){if(nextAncestors.indexOf(x)===-1)errors.push("Story skips canonical spine "+x);});}else{(node.kind==="passage"?[node.to]:node.options.map(function(o){return o.to;})).forEach(function(next){walk(next,nextAncestors);});}
visiting.delete(id);}
walk(data.start,[]);
data.scenes.forEach(function(s){if(!visited.has(s.id))errors.push("Unreachable "+s.id);});
if(branchNodes<7)errors.push("Not enough branching decision scenes");if(paths<100)errors.push("Not enough distinct authored decision sequences");
return {errors:Array.from(new Set(errors)),branchNodes:branchNodes,decisionSequences:paths,nodeCount:ids.size};}
return {data:data,TRAITS:TRAITS,RELATIONS:RELATIONS,TRAIT_NAMES:TRAIT_NAMES,REL_NAMES:REL_NAMES,fresh:fresh,step:step,load:load,exportSave:exportSave,normalize:normalize,resolveTyped:resolveTyped,conditionText:conditionText,dominant:dominant,ending:ending,validate:validate};
});