(function(){
 "use strict";
 var allowed=new Set([
  "hsk1.e01.arrival-greeting","hsk1.e01.school-introduction","hsk1.e01.xiaoyu-friendship",
  "hsk1.e01.class-counting","hsk1.e01.liu-noodle-order","hsk1.e01.liu-payment","hsk1.e01.walk-home"
 ]),history=[];
 function $(id){return document.getElementById(id)}
 function sync(){
  var panel=$("aiTutorPanel"),button=$("aiTutorBtn"),overlay=$("gameOverlay");if(!panel||!button)return;
  var step=panel.dataset.sceneId||"";
  var available=allowed.has(step)&&overlay&&!overlay.hidden&&$("gameShell").dataset.mode==="answer";
  button.hidden=!available;
  if(!available)close();
  panel.dataset.sceneId=step||"";
 }
 function add(role,text,extra){var p=document.createElement("p");p.className="ai-tutor-message ai-tutor-"+role;if(extra)p.classList.add(extra);p.textContent=text;$("aiTutorMessages").appendChild(p);$("aiTutorMessages").scrollTop=$("aiTutorMessages").scrollHeight;return p}
 function open(){history=[];$("aiTutorMessages").replaceChildren();add("welcome","Cậu đang băn khoăn chỗ nào? Tớ thử nghĩ cùng nhé.");$("aiTutorPanel").hidden=false;$("gameShell").classList.add("ai-tutor-active");document.querySelector(".player-panel").classList.add("ai-tutor-active");$("aiTutorBtn").setAttribute("aria-expanded","true");$("aiTutorInput").focus()}
 function close(){$("aiTutorPanel").hidden=true;$("gameShell").classList.remove("ai-tutor-active");document.querySelector(".player-panel")?.classList.remove("ai-tutor-active");$("aiTutorBtn").setAttribute("aria-expanded","false")}
 async function submit(event){event.preventDefault();var input=$("aiTutorInput"),send=$("aiTutorSend"),text=input.value.trim().slice(0,400),sceneId=$("aiTutorPanel").dataset.sceneId;if(!text||!allowed.has(sceneId)||send.disabled)return;
  input.value="";history.push({role:"user",content:text});history=history.slice(-6);add("user",text);var pending=add("assistant","Sẻ đang nghĩ một chút…","pending");send.disabled=true;input.disabled=true;
  try{var response=await fetch("/api/ai/tutor",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({sceneId:sceneId,messages:history})});var data=await response.json();pending.remove();if(!response.ok)throw new Error(data.message||"");var answer=String(data.reply||"").slice(0,1400);history.push({role:"assistant",content:answer});history=history.slice(-6);add("assistant",answer)}
  catch(error){pending.remove();add("assistant",error.message||"Tớ chưa gọi được ai cả. Mình thử lại sau nhé.","error")}
  finally{send.disabled=false;input.disabled=false;input.focus()}
 }
 $("aiTutorBtn").addEventListener("click",open);$("aiTutorClose").addEventListener("click",close);$("aiTutorForm").addEventListener("submit",submit);
 window.ChimSeTutor={sync:sync,close:close};
 document.addEventListener("keydown",function(event){if(event.key==="Escape"&&!$("aiTutorPanel").hidden)close()});
 sync();
})();
