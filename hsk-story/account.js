/* Optional Google account and revisioned progress sync. Local study remains the immediate save. */
(function(){
"use strict";
var P=window.ChimseProgress;if(!P)return;
var META="chimse-account-v1",GUEST="chimse-guest-progress-v1",CACHE="chimse-account-backups-v1",RESTORE="chimse-account-restorepoints-v1";
var memory={},user=null,auth=null,config=null,loading=null,initializing=null,busy=false,pending=null,timer=null,message="Mốc học đang được giữ trên thiết bị này.",error=false;
var branch=null,branchState={state:"local",message:""};
var callback=new URLSearchParams(location.search).has("account"),meta=read(META)||{owner:null,revision:0,base:{v:1}},buttons=[];
var dialog=document.createElement("dialog");dialog.id="accountDialog";dialog.className="account-dialog";dialog.setAttribute("aria-labelledby","accountTitle");
dialog.innerHTML='<div class="account-dialog-head"><h2 id="accountTitle">Giữ mốc câu chuyện</h2><button class="account-close" type="button" aria-label="Đóng bảng tài khoản">×</button></div><p class="account-message" id="accountMessage" role="status" aria-live="polite"></p><section class="account-section" id="accountGuest"><p>Đăng nhập để lần sau mở web trên máy khác, An vẫn đứng đúng chỗ bạn đã dừng.</p><button class="account-google" id="accountGoogle" type="button"><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M21.6 12.2c0-.7-.1-1.5-.2-2.2H12v4.2h5.4a4.6 4.6 0 0 1-2 3v2.7h3.3c1.9-1.8 2.9-4.4 2.9-7.7Z"/><path fill="#34A853" d="M12 22c2.7 0 5-.9 6.7-2.4l-3.3-2.6c-.9.6-2 1-3.4 1a6 6 0 0 1-5.7-4.2H2.9v2.7A10 10 0 0 0 12 22Z"/><path fill="#FBBC05" d="M6.3 13.8a6 6 0 0 1 0-3.6V7.5H2.9a10 10 0 0 0 0 9l3.4-2.7Z"/><path fill="#EA4335" d="M12 6c1.5 0 2.8.5 3.8 1.5l2.9-2.9A9.6 9.6 0 0 0 12 2a10 10 0 0 0-9.1 5.5l3.4 2.7A6 6 0 0 1 12 6Z"/></svg><span>Tiếp tục với Google</span></button><p class="account-caption">Bạn cũng có thể đóng bảng này và học tiếp trên máy đang dùng.</p></section><section class="account-section" id="accountSigned" hidden><p class="account-person" id="accountName"></p><p class="account-caption" id="accountSummary"></p><div class="account-signed-actions"><button class="account-action" id="accountRetry" type="button">Lưu lại mốc học</button><button class="account-action account-secondary" id="accountSignout" type="button">Đăng xuất</button></div><button class="account-action account-secondary" id="accountSignoutLocal" type="button" hidden>Đăng xuất, giữ mốc trên máy</button></section><section class="account-section" id="accountConflict" hidden><p>Hai nơi đang giữ mốc khác nhau. Bạn muốn tiếp tục từ đâu?</p><div class="account-choice-grid"><button class="account-choice" id="accountUseLocal" type="button"><strong>Mốc trên máy này</strong><span></span></button><button class="account-choice" id="accountUseCloud" type="button"><strong>Mốc trên tài khoản</strong><span></span></button></div><p class="account-caption">Mốc hiện tại được giữ một bản dự phòng trước khi thay.</p></section>';
document.body.appendChild(dialog);
function $(id){return document.getElementById(id)}
function storage(){return window.localStorage}
function read(key){try{return JSON.parse(storage().getItem(key)||"null")}catch(e){return null}}
function write(key,value){storage().setItem(key,JSON.stringify(value))}
function capture(){var value;try{value=P.capture(storage())}catch(e){value={v:1,story:null,intro:null,review:null}}Object.keys(memory).forEach(area=>value[area]=memory[area]);return P.clean(value)}
function apply(value){P.apply(storage(),value);memory={}}
function cache(owner,value){if(!owner)return;var all=read(CACHE)||{};all[owner]={snapshot:P.clean(value),base:meta.base||{v:1},revision:meta.revision||0,at:Date.now()};var ids=Object.keys(all).sort((a,b)=>all[b].at-all[a].at);ids.slice(3).forEach(id=>delete all[id]);write(CACHE,all)}
function restorepoint(owner,value){var list=read(RESTORE)||[];list.unshift({owner:owner,snapshot:P.clean(value||{v:1}),at:Date.now()});write(RESTORE,list.slice(0,6))}
function saveMeta(){try{write(META,meta)}catch(e){}}
function setMessage(text,isError){message=text;error=!!isError;render()}
function failure(value,fallback){return !value||value instanceof TypeError||/^(Abort|Timeout|QuotaExceeded|Security)Error$/.test(value.name)?fallback:value.message||fallback}
function currentArea(){return location.pathname.includes("nhap-mon")?"intro":location.pathname.includes("ren-luyen")?"review":"story"}
function reload(){var url=new URL(location.href);url.searchParams.delete("neon_auth_session_verifier");url.searchParams.set("account","1");location.replace(url.href)}
function render(){
 var bc=branch&&branch.getConflict();
 $("accountMessage").textContent=bc||branchState.state==="error"?branchState.message:message;$("accountMessage").dataset.error=String(error);
 $("accountGuest").hidden=!!user||!!pending||!!bc;$("accountSigned").hidden=!user||!!pending||!!bc;$("accountConflict").hidden=!pending&&!bc;
 if(user){$("accountName").textContent=user.name||user.email||"Bạn đồng hành của An";$("accountSummary").textContent=P.describe(capture())}
 if(bc&&!pending){$("accountUseLocal").querySelector("span").textContent="Trang truyện trên máy";$("accountUseCloud").querySelector("span").textContent="Trang truyện trên tài khoản"}
 if(pending){$("accountUseLocal").querySelector("span").textContent=P.describe(pending.local);$("accountUseCloud").querySelector("span").textContent=P.describe(pending.remote.snapshot)}
 dialog.querySelectorAll("button:not(.account-close)").forEach(b=>b.disabled=busy);
 if(config&&!config.enabled)$("accountGoogle").disabled=true;
 var dirty=user&&!P.equal(capture(),meta.base||{v:1});buttons.forEach(b=>{b.dataset.state=pending||bc?"choice":error||branchState.state==="error"?"error":user?busy||dirty||branchState.state==="saving"?"saving":"saved":"guest";b.title=pending?"Chọn mốc học để tiếp tục":user?message:"Đăng nhập để giữ mốc học";b.querySelector("span").textContent=pending||bc?"Chọn mốc":user?error||branchState.state==="error"?"Lưu lại":busy||dirty||branchState.state==="saving"?"Đang lưu":"Mốc đã lưu":"Lưu mốc"});
}
function addButton(parent,extraClass){if(!parent)return;var b=document.createElement("button");b.type="button";b.className="account-open "+(extraClass||"");b.setAttribute("aria-label","Tài khoản và lưu mốc học");b.setAttribute("aria-haspopup","dialog");b.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M6 3h12v18l-6-4-6 4z"/><path d="M9 8h6M9 11h6"/></svg><span>Lưu mốc</span>';b.addEventListener("click",open);parent.appendChild(b);buttons.push(b);return b}
var home=document.querySelector(".site-header");if(home){var actions=document.createElement("div");actions.className="account-home-actions";var resume=$("resumeBtn");if(resume)actions.appendChild(resume);home.appendChild(actions);addButton(actions)}
var notebookAccount=addButton(document.querySelector("#notebookPanel .notebook-head"),"account-notebook-entry");if(notebookAccount)notebookAccount.parentNode.insertBefore(notebookAccount,$("notebookClose"));
addButton(document.querySelector(".branch-header"));addButton(document.querySelector(".intro-screen .topbar"));addButton(document.querySelector(".review-screen .head"));
dialog.querySelector(".account-close").addEventListener("click",()=>dialog.close());
dialog.addEventListener("click",e=>{if(e.target===dialog){var r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close()}});
function open(){if(!dialog.open)dialog.showModal();render();init().catch(()=>{})}
async function fetchJSON(url,options){var controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),12000);try{var response=await fetch(url,Object.assign({},options,{signal:controller.signal}));return {response:response,data:await response.json()}}finally{clearTimeout(timeout)}}
async function getAuth(){
 if(auth)return auth;
 if(loading)return loading;
 loading=(async()=>{
  var fetched=await fetchJSON("/api/account",{cache:"no-store",credentials:"same-origin"});if(!fetched.response.ok)throw Error("Chưa nối được với tài khoản. Mốc học vẫn còn trên máy.");
  config=fetched.data;if(!config.enabled)throw Error("Đăng nhập đang được chuẩn bị. Bạn vẫn có thể học tiếp trên máy.");
  if(!window.ChimseAuth)await new Promise((resolve,reject)=>{var script=document.createElement("script");script.src="/auth-sdk.js";script.onload=resolve;script.onerror=()=>{script.remove();reject(Error("Chưa tải được phần đăng nhập. Bạn thử lại nhé."))};document.head.appendChild(script)});
  auth=window.ChimseAuth.create();return auth;
 })();try{return await loading}finally{loading=null}
}
async function request(method,snapshot,revision,keepalive){
 var fetched=await fetchJSON("/api/progress",{method:method,credentials:"same-origin",cache:"no-store",keepalive:!!keepalive,headers:{"Content-Type":"application/json","X-Chimse-Client":"account-v1"},...(method==="PUT"?{body:JSON.stringify({snapshot:snapshot,revision:revision})}:{})});
 var response=fetched.response,data=fetched.data;if(!response.ok&&response.status!==409)throw Error(data.error||"Chưa lưu được mốc học. Bản trên máy vẫn còn nguyên.");
 if(data.snapshot)data.snapshot=P.clean(data.snapshot);return {status:response.status,data:data};
}
function remember(data){meta={owner:user.id,revision:data.revision,base:data.snapshot||{v:1},needsChoice:false};saveMeta();try{cache(user.id,capture())}catch(e){}error=false;message="Đã giữ mốc câu chuyện trên tài khoản.";render()}
function chooseLater(remote,local){pending={remote:remote,local:local};meta.owner=user.id;meta.needsChoice=true;saveMeta();setMessage("Bạn đang có hai mốc học khác nhau.");if(callback||dialog.open)open()}
async function reconcile(remote){
 var local=capture();
 if(meta.owner&&meta.owner!==user.id){
  cache(meta.owner,local);var own=(read(CACHE)||{})[user.id];apply(own?own.snapshot:{v:1});meta={owner:user.id,revision:own?own.revision:0,base:own?own.base:{v:1}};saveMeta();reload();return;
 }
 if(!meta.owner){
  write(GUEST,{snapshot:local,at:Date.now()});
  meta={owner:user.id,revision:0,base:{v:1}};saveMeta();
  if(remote.snapshot&&P.hasProgress(remote.snapshot)&&P.hasProgress(local)&&!P.equal(local,remote.snapshot)){chooseLater(remote,local);return}
  if(remote.snapshot&&P.hasProgress(remote.snapshot)&&!P.equal(local,remote.snapshot)){apply(remote.snapshot);remember(remote);reload();return}
 }
 if(meta.needsChoice&&remote.snapshot&&!P.equal(local,remote.snapshot)){chooseLater(remote,local);return}
 if(!remote.snapshot){meta.revision=0;meta.base={v:1};meta.needsChoice=false;saveMeta();await flush();return}
 if(P.equal(local,remote.snapshot)){remember(remote);return}
 var merged=P.merge(meta.base,local,remote.snapshot);
 if(merged.conflicts.length||!P.equal(local[currentArea()],merged.snapshot[currentArea()])){chooseLater(remote,local);return}
 if(!P.equal(local,merged.snapshot))apply(merged.snapshot);
 meta.revision=remote.revision;meta.base=remote.snapshot;meta.needsChoice=false;saveMeta();await flush();
}
async function branchClient(){
 if(branch)return branch;
 var files=[["HSKContent","/content-manifest.js"],["HSKCore","/game-core.js"],["HSKCurriculum","/curriculum-data.js"],["AnBranchStory","/duong-re/branch-data.js"],["AnBranchEngine","/duong-re/branch-engine.js"],["ChimSeBranchLearning","/duong-re/branch-learning.js"],["ChimseBranchAccount","/branch-account.js"]];
 for(var item of files)if(!window[item[0]])await new Promise((resolve,reject)=>{var script=document.createElement("script");script.src=item[1];script.onload=resolve;script.onerror=()=>reject(Error("Chưa tải được sổ truyện."));document.head.appendChild(script)});
 branch=window.ChimseBranchAccount;branch.onStatus(function(value){branchState=value;render()});return branch;
}
async function init(){
 if(initializing)return initializing;
 initializing=(async()=>{
  try{
   var client=await getAuth();var result=await client.getSession();if(result.error)throw Error("Chưa đọc được phiên đăng nhập. Bạn thử lại nhé.");
   user=result.data?.user||result.data?.session?.user||null;
   if(!user){setMessage("Đăng nhập Google để giữ mốc học khi đổi thiết bị.");if(callback)open();return}
   var remote=await request("GET");await reconcile(remote.data);
   var bs=await branchClient(),out=await bs.reconcile(user.id);if(out.changed&&!out.conflict){reload();return}if(!out.ok&&!out.conflict)throw out.error||Error("Chưa nối được sổ truyện. Mốc trên máy vẫn còn.");
   if(callback){open();var url=new URL(location.href);url.searchParams.delete("account");history.replaceState(history.state,"",url.href);callback=false}
  }catch(e){setMessage(failure(e,"Chưa nối được với tài khoản. Mốc trên máy vẫn còn."),true)}
 })();try{return await initializing}finally{initializing=null}
}
async function flush(){
 clearTimeout(timer);if(!user||busy||pending||meta.needsChoice||meta.owner!==user.id)return;
 var local=capture();if(P.equal(local,meta.base)){setMessage("Đã giữ mốc câu chuyện trên tài khoản.");return}
 busy=true;setMessage("Đang giữ lại trang bạn vừa đi qua…");
 try{
  var result=await request("PUT",local,meta.revision||0);
  if(result.status===409){
   var current=capture(),merged=P.merge(meta.base,current,result.data.snapshot);
   if(merged.conflicts.length||!P.equal(current[currentArea()],merged.snapshot[currentArea()])){chooseLater(result.data,current);return}
   if(!P.equal(current,merged.snapshot))apply(merged.snapshot);
   meta.revision=result.data.revision;meta.base=result.data.snapshot||{v:1};saveMeta();timer=setTimeout(flush,0);return;
  }
  remember(result.data);if(!P.equal(capture(),local))timer=setTimeout(flush,100);
 }catch(e){setMessage(failure(e,"Chưa lưu được lên tài khoản. Mốc trên máy vẫn còn."),true)}
 finally{busy=false;render()}
}
async function selectSource(source){
 if(!pending&&branch&&branch.getConflict()){var result=await branch.resolve(source);if(result.ok&&result.changed)reload();else render();return}
 if(!pending||busy)return;var choice=pending;busy=true;render();
 try{
  restorepoint(user.id,capture());restorepoint(user.id,choice.remote.snapshot);cache(user.id,capture());var selected=source==="local"?capture():choice.remote.snapshot;
  var result=await request("PUT",selected,choice.remote.revision);
  if(result.status===409){chooseLater(result.data,capture());return}
  apply(result.data.snapshot);pending=null;remember(result.data);reload();
 }catch(e){setMessage(failure(e,"Chưa đổi được mốc học. Bạn thử lại nhé."),true)}
 finally{busy=false;render()}
}
$("accountUseLocal").addEventListener("click",()=>selectSource("local"));$("accountUseCloud").addEventListener("click",()=>selectSource("cloud"));
$("accountGoogle").addEventListener("click",async()=>{
 busy=true;setMessage("Đang mở Google…");
 try{var client=await getAuth();var url=new URL(location.href);url.searchParams.delete("neon_auth_session_verifier");url.searchParams.set("account","1");if($("gameOverlay")&&!$("gameOverlay").hidden)url.searchParams.set("play","hsk1");var result=await client.signIn.social({provider:"google",callbackURL:url.href,errorCallbackURL:url.href});if(result.error)throw Error("Google chưa đăng nhập được. Bạn thử lại nhé.")}
 catch(e){setMessage(failure(e,"Chưa mở được Google. Bạn thử lại nhé."),true)}finally{busy=false;render()}
});
$("accountRetry").addEventListener("click",async()=>{if(error||branchState.state==="error")await init();else {await flush();if(branch)await branch.flush()}});
async function signOut(localOnly){
 if(busy)return;await flush();if(pending)return;if(branch&&!localOnly&&!await branch.beforeSignOut()){$("accountSignoutLocal").hidden=false;branchState.message="Chưa lưu được truyện lên tài khoản. Bạn có thể thử lại hoặc đăng xuất và giữ mốc trên máy này.";setMessage(branchState.message,true);return}if(branch&&localOnly&&!await branch.prepareLocalSignOut()){setMessage("Chưa giữ được mốc trên máy. Bạn thử lại nhé.",true);return}
 busy=true;setMessage("Đang cất lại mốc học…");
 try{cache(user.id,capture());var result=await auth.signOut();if(result.error)throw Error("Chưa đăng xuất được. Bạn thử lại nhé.");if(branch)await branch.afterSignOut();var guest=read(GUEST);apply(guest?.snapshot||{v:1});meta={owner:null,revision:0,base:{v:1}};saveMeta();user=null;location.reload()}
 catch(e){setMessage(failure(e,"Chưa đăng xuất được. Mốc học vẫn còn."),true)}finally{busy=false;render()}
}
$("accountSignout").addEventListener("click",()=>signOut(false));
$("accountSignoutLocal").addEventListener("click",()=>signOut(true));
window.addEventListener("chimse-progress-changed",function(event){try{var detail=event.detail;if(!P.keys[detail.area])return;var value={v:1};value[detail.area]=detail.value;memory[detail.area]=P.clean(value)[detail.area];if(user&&!pending){setMessage("Mốc mới đã giữ trên máy, đang nối với tài khoản…");clearTimeout(timer);timer=setTimeout(flush,900)}}catch(e){}});
window.addEventListener("chimse-branch-changed",()=>{if(branch)branch.schedule()});
window.addEventListener("chimse-branch-restored",()=>reload());
window.addEventListener("online",()=>{if(user){flush();if(branch)branch.flush()}else if(meta.owner)init()});
window.addEventListener("storage",event=>{if(Object.values(P.keys).includes(event.key)&&user){meta.needsChoice=true;saveMeta();setMessage("Mốc học vừa đổi ở tab khác. Mở tài khoản để chọn mốc dùng tiếp.",true)}});
window.addEventListener("pagehide",()=>{if(user&&!busy&&!pending&&!meta.needsChoice&&meta.owner===user.id){try{var local=capture();if(!P.equal(local,meta.base)&&JSON.stringify(local).length<55000)request("PUT",local,meta.revision||0,true).catch(()=>{})}catch(e){}}});
render();window.ChimseAccount={open:open,flush:flush,refresh:init};
window.chimseAccountReady=callback||meta.owner?init():Promise.resolve();
})();
