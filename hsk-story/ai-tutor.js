(function(){
 "use strict";
 var allowed=new Set([
  "hsk1.e01.arrival-greeting","hsk1.e01.school-introduction","hsk1.e01.xiaoyu-friendship",
  "hsk1.e01.class-counting","hsk1.e01.liu-noodle-order","hsk1.e01.liu-payment","hsk1.e01.walk-home"
 ]),history=[];
 var generation=0,lastSyncedScene="",activePending=null;
 function $(id){return document.getElementById(id)}
 function sync(){
  var panel=$("aiTutorPanel"),button=$("aiTutorBtn"),overlay=$("gameOverlay");if(!panel||!button)return;
  var step=panel.dataset.sceneId||"";
  if(lastSyncedScene&&step!==lastSyncedScene){generation++;if(activePending){activePending.remove();activePending=null}$("aiTutorSend").disabled=false;$("aiTutorInput").disabled=false}lastSyncedScene=step;
  var available=allowed.has(step)&&overlay&&!overlay.hidden&&$("gameShell").dataset.mode==="answer";
  button.hidden=!available;
  if(!available)close();
  panel.dataset.sceneId=step||"";
 }
 function add(role,text,extra){var p=document.createElement("p");p.className="ai-tutor-message ai-tutor-"+role;if(extra)p.classList.add(extra);if(role==="user"){$("aiTutorMessages").querySelectorAll(".ai-tutor-current").forEach(function(item){item.classList.remove("ai-tutor-current")})}if(role==="user"||role==="assistant")p.classList.add("ai-tutor-current");p.textContent=text;$("aiTutorMessages").appendChild(p);$("aiTutorMessages").scrollTop=$("aiTutorMessages").scrollHeight;return p}
 function open(){generation++;if(activePending){activePending.remove();activePending=null}$("aiTutorSend").disabled=false;$("aiTutorInput").disabled=false;history=[];$("aiTutorMessages").replaceChildren();add("welcome","Cậu đang băn khoăn chỗ nào? Tớ thử nghĩ cùng nhé.");$("aiTutorPanel").hidden=false;$("gameShell").classList.add("ai-tutor-active");document.querySelector(".player-panel").classList.add("ai-tutor-active");$("aiTutorBtn").setAttribute("aria-expanded","true");$("aiTutorInput").focus()}
 function close(){generation++;if(activePending){activePending.remove();activePending=null}$("aiTutorSend").disabled=false;$("aiTutorInput").disabled=false;$("aiTutorPanel").hidden=true;$("gameShell").classList.remove("ai-tutor-active");document.querySelector(".player-panel")?.classList.remove("ai-tutor-active");$("aiTutorBtn").setAttribute("aria-expanded","false")}
 function isCurrent(token,sceneId){return token===generation&&!$("aiTutorPanel").hidden&&$("aiTutorPanel").dataset.sceneId===sceneId&&$("gameOverlay")&&!$("gameOverlay").hidden&&$("gameShell").dataset.mode==="answer"}
 async function submit(event){event.preventDefault();var input=$("aiTutorInput"),send=$("aiTutorSend"),text=input.value.trim().slice(0,400),sceneId=$("aiTutorPanel").dataset.sceneId;if(!text||!allowed.has(sceneId)||send.disabled)return;
  var token=++generation;
  input.value="";history.push({role:"user",content:text});history=history.slice(-6);add("user",text);var pending=activePending=add("assistant","Sẻ đang nghĩ một chút…","pending");send.disabled=true;input.disabled=true;
  try{var compact=window.visualViewport&&window.visualViewport.height<=320;var response=await fetch("/api/ai/tutor",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({sceneId:sceneId,messages:history,compact:!!compact})});var data=await response.json();if(!isCurrent(token,sceneId))return;pending.remove();activePending=null;if(!response.ok)throw new Error(data.message||"");var answer=String(data.reply||"").trim().slice(0,1400);if(!answer)throw new Error("Sẻ chưa nghĩ ra câu trả lời. Mình thử hỏi cách khác nhé.");history.push({role:"assistant",content:answer});history=history.slice(-6);add("assistant",answer);window.dispatchEvent(new CustomEvent("chimse-ai-helped",{detail:{sceneId:sceneId}}))}
  catch(error){if(isCurrent(token,sceneId)){pending.remove();activePending=null;add("assistant",error.message||"Tớ chưa gọi được ai cả. Mình thử lại sau nhé.","error")}}
  finally{if(token===generation){send.disabled=false;input.disabled=false;if(!$("aiTutorPanel").hidden)input.focus()}}
 }
 $("aiTutorBtn").addEventListener("click",open);$("aiTutorClose").addEventListener("click",close);$("aiTutorForm").addEventListener("submit",submit);
 window.ChimSeTutor={sync:sync,close:close};
 document.addEventListener("keydown",function(event){if(event.key==="Escape"&&!$("aiTutorPanel").hidden&&!document.querySelector("dialog[open]")){event.preventDefault();event.stopPropagation();close();$("aiTutorBtn").focus()}});
 sync();
})();
