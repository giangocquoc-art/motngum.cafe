/* Branch story account data has its own revision; the older account snapshot stays untouched. */
(function(root,factory){"use strict";
 var node=typeof module!=="undefined"&&module.exports;
 var api=factory(node?require("./duong-re/branch-engine.js"):root.AnBranchEngine,node?require("./duong-re/branch-learning.js"):root.ChimSeBranchLearning);
 if(node)module.exports=api;else{root.ChimseBranchAccountCore=api;root.ChimseBranchAccount=api.create({storage:root.localStorage,fetch:root.fetch.bind(root),onApplied:function(){root.dispatchEvent(new Event("chimse-branch-restored"))}});}
})(typeof globalThis!=="undefined"?globalThis:this,function(E,L){"use strict";
if(!E||!L)throw Error("Branch account requires story and learning data");
var PATH="hai-que-huong-branching-novel-v1",LEARNING=L.storageKey,DRAFT="chimse-branch-lesson-draft-v1",META="chimse-branch-account-v1",GUEST="chimse-branch-guest-v1",CACHE="chimse-branch-owner-backups-v1",RESTORE="chimse-branch-restore-v1";
function empty(){return {version:1,path:[],learning:L.clean(null),draft:null}}
function normalize(raw){
 if(!raw||raw.version!==1||!Array.isArray(raw.path)||raw.path.length>50||!Array.isArray(raw.learning)||raw.learning.length!==10)throw Error("Mốc truyện chưa hợp lệ.");
 var path=raw.path.map(function(p){if(!p||typeof p.at!=="string"||typeof p.choice!=="string"||p.at.length>100||p.choice.length>100)throw Error("Mốc truyện chưa hợp lệ.");return {at:p.at,choice:p.choice}}),state=E.load({version:1,path:path});
 if(JSON.stringify(state.path)!==JSON.stringify(path))throw Error("Đường đi trong sổ chưa hợp lệ.");
 var learning=L.clean(raw.learning),draft=null;
 for(var i=0;i<10;i++)if(raw.learning[i]!==null&&(!learning[i]||!Number.isInteger(raw.learning[i].attempts)||raw.learning[i].attempts<0||raw.learning[i].attempts>100||typeof raw.learning[i].hint!=="boolean"||(raw.learning[i].status==="assisted"&&!raw.learning[i].hint)))throw Error("Mốc luyện tập chưa hợp lệ.");
 if(raw.draft!=null){var d=raw.draft,pending=L.pending(state,learning);if(!d||typeof d!=="object"||!pending||d.index!==pending.index||d.at!==state.node||!Array.isArray(d.path)||JSON.stringify(d.path)!==JSON.stringify(path)||!Number.isInteger(d.attempts)||d.attempts<0||d.attempts>100||typeof d.helped!=="boolean"||typeof d.draft!=="string"||d.draft.length>100)throw Error("Trang An đang viết chưa hợp lệ.");draft={index:d.index,at:d.at,path:path,attempts:d.attempts,helped:d.helped,draft:d.draft};}
 return {version:1,path:path,learning:learning,draft:draft};
}
function equal(a,b){return JSON.stringify(normalize(a||empty()))===JSON.stringify(normalize(b||empty()))}
function hasProgress(s){s=normalize(s);return !!(s.path.length||s.learning.some(Boolean)||s.draft&&(s.draft.attempts||s.draft.helped||s.draft.draft));}
function readJSON(storage,key){try{var raw=storage.getItem(key);return raw===null?null:JSON.parse(raw)}catch(e){throw Error("Mốc trên máy chưa đọc được; mình giữ nguyên dữ liệu ở đây.")}}
function capture(storage){var p=readJSON(storage,PATH),learning=readJSON(storage,LEARNING),draft=readJSON(storage,DRAFT);if(p!==null&&(!p||p.version!==1||!Array.isArray(p.path)))throw Error("Mốc truyện trên máy chưa đọc được.");return normalize({version:1,path:p?p.path:[],learning:learning===null?L.clean(null):learning,draft:draft});}
function apply(storage,raw){
 var value=normalize(raw),keys=[PATH,LEARNING,DRAFT],before=keys.map(function(k){return storage.getItem(k)});
 try{storage.setItem(PATH,JSON.stringify({version:1,path:value.path}));storage.setItem(LEARNING,JSON.stringify(value.learning));if(value.draft)storage.setItem(DRAFT,JSON.stringify(value.draft));else storage.removeItem(DRAFT)}catch(e){keys.forEach(function(k,i){try{if(before[i]===null)storage.removeItem(k);else storage.setItem(k,before[i])}catch(_) {}});throw e}
 return value;
}
function create(options){
 var storage=options.storage,fetcher=options.fetch,notify=options.onStatus||function(){},onApplied=options.onApplied||function(){},meta=readJSON(storage,META)||{version:1,owner:null,revision:0,base:empty()},pending=null,verified=false,busy=Promise.resolve(),timer=null,status={state:"local",message:"Mốc truyện đang được giữ trên máy."};
 function emit(state,message){status={state:state,message:message};notify(status);return status}
 function queue(fn){var next=busy.then(fn,fn);busy=next.catch(function(){});return next}
 function saveMeta(){storage.setItem(META,JSON.stringify(meta))}
 function readMap(key){var m=readJSON(storage,key);return m&&typeof m==="object"&&!Array.isArray(m)?m:{}}
 function cacheOwner(){if(!meta.owner)return;var map=readMap(CACHE);map[meta.owner]={snapshot:capture(storage),revision:meta.revision,base:meta.base,at:Date.now()};var keep=Object.keys(map).sort(function(a,b){return (map[b].at||0)-(map[a].at||0)}).slice(0,6),next={};keep.forEach(function(k){next[k]=map[k]});storage.setItem(CACHE,JSON.stringify(next))}
 function restorepoint(snapshot){var rows=readJSON(storage,RESTORE);if(!Array.isArray(rows))rows=[];rows.unshift({owner:meta.owner,snapshot:normalize(snapshot),at:Date.now()});storage.setItem(RESTORE,JSON.stringify(rows.slice(0,6)))}
 function replaceLocal(snapshot){var changed=!equal(capture(storage),snapshot);if(changed){restorepoint(capture(storage));apply(storage,snapshot)}return changed}
 async function request(method,revision,snapshot){var opts={method:method,credentials:"same-origin",cache:"no-store",headers:{"X-Chimse-Client":"account-v1","X-Chimse-Owner":meta.owner}};if(typeof AbortSignal!=="undefined"&&AbortSignal.timeout)opts.signal=AbortSignal.timeout(12000);if(method==="PUT"){opts.headers["Content-Type"]="application/json";opts.body=JSON.stringify({revision:revision,snapshot:normalize(snapshot)})}var response=await fetcher("/api/branch-progress",opts),data;try{data=await response.json()}catch(e){throw Error("Chưa đọc được mốc truyện trên tài khoản.")}if(!response.ok&&response.status!==409)throw Error("Chưa nối được với sổ tài khoản. Mốc trên máy vẫn còn.");if(!data||!Number.isSafeInteger(data.revision)||data.revision<0)throw Error("Mốc tài khoản chưa hợp lệ.");return {conflict:response.status===409,revision:data.revision,snapshot:data.snapshot==null?null:normalize(data.snapshot)}}
 function record(remote){verified=true;meta.revision=remote.revision;meta.base=remote.snapshot||empty();meta.firstSync=false;saveMeta();cacheOwner();pending=null;emit("saved","Mốc truyện đã giữ trên tài khoản.")}
 function conflict(remote){verified=true;pending={remote:remote};meta.firstSync=true;saveMeta();emit("conflict","Hai nơi đang có những trang truyện khác nhau. Hãy chọn mốc muốn dùng.");return {ok:false,conflict:true}}
 async function sync(remote){
  var local=capture(storage),base=meta.base||empty(),cloud=remote.snapshot||empty();
  if(equal(local,cloud)){record(remote);return {ok:true,changed:false}}
  if(meta.firstSync&&hasProgress(local)&&hasProgress(cloud))return conflict(remote);
  if(equal(local,base)){var changed=replaceLocal(cloud);record(remote);return {ok:true,changed:changed}}
  if(equal(cloud,base)||!hasProgress(cloud)){var result=await request("PUT",remote.revision,local);if(result.conflict)return sync(result);record(result);if(!equal(capture(storage),local))return sync(result);return {ok:true,changed:false}}
  return conflict(remote);
 }
 async function reconcile(userId){
  if(typeof userId!=="string"||!userId||userId.length>128||/[^\x21-\x7e]/.test(userId)||["__proto__","constructor","prototype"].includes(userId))throw Error("Không xác định được tài khoản.");
  return queue(async function(){var switched=false;try{
   if(meta.owner!==userId){verified=false;if(meta.owner)cacheOwner();else storage.setItem(GUEST,JSON.stringify(capture(storage)));var map=readMap(CACHE),owned=map[userId],source=owned&&owned.snapshot?normalize(owned.snapshot):meta.owner?empty():capture(storage);if(meta.owner||owned){switched=!equal(capture(storage),source);if(switched)replaceLocal(source)}meta={version:1,owner:userId,revision:owned&&Number.isSafeInteger(owned.revision)?owned.revision:0,base:owned&&owned.base?normalize(owned.base):empty(),firstSync:!owned};saveMeta();}
   emit("saving","Đang nối trang truyện với tài khoản…");var remote=await request("GET"),result=await sync(remote);result.changed=!!result.changed||switched;return result;
  }catch(e){emit("error","Chưa lưu được truyện lên tài khoản. Mốc trên máy vẫn còn.");return {ok:false,error:e,changed:switched}}});
 }
 async function flush(){clearTimeout(timer);timer=null;var outcome=await queue(async function(){try{if(!meta.owner)return {ok:true,local:true};if(pending)return {ok:false,conflict:true};emit("saving","Đang giữ lại trang truyện…");if(!verified)return await sync(await request("GET"));var local=capture(storage);if(equal(local,meta.base||empty())){emit("saved","Mốc truyện đã giữ trên tài khoản.");return {ok:true}}var result=await request("PUT",meta.revision,local);if(result.conflict)return sync(result);record(result);if(!equal(capture(storage),local))return sync(result);return {ok:true}}catch(e){emit("error","Chưa lưu được truyện lên tài khoản. Mốc trên máy vẫn còn.");return {ok:false,error:e}}});if(outcome.changed)onApplied();return outcome;}
 async function resolve(source){return queue(async function(){try{if(!pending||!["local","cloud"].includes(source))return {ok:false};var remote=pending.remote,local=capture(storage);restorepoint(local);if(remote.snapshot)restorepoint(remote.snapshot);if(source==="cloud"){var cloud=remote.snapshot||empty(),changed=replaceLocal(cloud);record(remote);return {ok:true,changed:changed}}var result=await request("PUT",remote.revision,local);if(result.conflict)return conflict(result);record(result);if(!equal(capture(storage),local))return sync(result);return {ok:true,changed:false}}catch(e){emit("error","Chưa đổi được mốc truyện. Mốc trên máy vẫn còn.");return {ok:false,error:e}}});}
 async function beforeSignOut(){var result=await flush();return !!result.ok&&!pending}
 async function prepareLocalSignOut(){return queue(async function(){try{if(meta.owner)cacheOwner();return true}catch(e){emit("error","Chưa giữ được bản dự phòng trên máy. Bạn thử lại nhé.");return false}})}
 async function afterSignOut(){return queue(async function(){if(meta.owner)cacheOwner();var guest=readJSON(storage,GUEST),changed=replaceLocal(guest?normalize(guest):empty());meta={version:1,owner:null,revision:0,base:empty()};pending=null;verified=false;saveMeta();emit("local","Mốc truyện đang được giữ trên máy.");return {ok:true,changed:changed}})}
 function schedule(){clearTimeout(timer);if(!meta.owner){emit("local","Mốc truyện đang được giữ trên máy.");return}if(pending){emit("conflict","Hai nơi đang có những trang truyện khác nhau. Hãy chọn mốc muốn dùng.");return}emit("saving","Đang giữ lại trang truyện…");timer=setTimeout(function(){flush()},900)}
 function onStatus(callback){notify=typeof callback==="function"?callback:function(){};notify(status)}
 return {reconcile:reconcile,flush:flush,schedule:schedule,resolve:resolve,beforeSignOut:beforeSignOut,prepareLocalSignOut:prepareLocalSignOut,afterSignOut:afterSignOut,onStatus:onStatus,getStatus:function(){return status},getConflict:function(){return pending?{local:capture(storage),remote:pending.remote.snapshot||empty()}:null}};
}
return {create:create,empty:empty,normalize:normalize,capture:capture,apply:apply,hasProgress:hasProgress,keys:{path:PATH,learning:LEARNING,draft:DRAFT,meta:META,guest:GUEST,cache:CACHE,restore:RESTORE}};
});
