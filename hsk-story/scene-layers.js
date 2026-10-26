/* Responsive visual layout registry. Scene IDs remain stable for saved progress. */
var HSKSceneLayers=(function(){"use strict";
var sceneIds=["hsk1.e01.arrival-greeting","hsk1.e01.school-introduction","hsk1.e01.xiaoyu-friendship","hsk1.e01.class-counting","hsk1.e01.liu-noodle-order","hsk1.e01.liu-payment","hsk1.e01.walk-home","lost-notebook","hsk1.e01.exam-introduction","hsk1.e01.exam-price","hsk1.e01.exam-order"];
var characters={an:"characters/an-expressions-v3.webp",sparrow:"characters/sparrow-expressions-v2.webp",supportingCast:"characters/supporting-cast-v2.webp"};
var backgrounds={
 "arrival-street":{desktop:"backgrounds/arrival-street.webp",mobile:"backgrounds/mobile/mobile-arrival-street.webp"},
 "school-gate":{desktop:"backgrounds/school-gate-v2.webp",mobile:"backgrounds/mobile/mobile-school-gate-v2.webp"},
 classroom:{desktop:"backgrounds/classroom.webp",mobile:"backgrounds/mobile/mobile-classroom.webp"},
 "noodle-shop":{desktop:"backgrounds/noodle-shop-v2.webp",mobile:"backgrounds/mobile/mobile-noodle-shop-v3.webp"},
 "evening-street":{desktop:"backgrounds/evening-street-v2.webp",mobile:"backgrounds/mobile/mobile-evening-street-v2.webp"}
};
var rows={
 "hsk1.e01.arrival-greeting":{background:"arrival-street",actors:[["an","shy","left"],["mother","gentle","mid"]],sparrow:[69,20]},
 "hsk1.e01.school-introduction":{background:"school-gate",actors:[["an","nervous","left"],["wang","welcoming","right"]],sparrow:[81,27]},
 "hsk1.e01.xiaoyu-friendship":{background:"classroom",actors:[["an","awkward","left"],["xiaoyu","smiling","right"]],sparrow:[72,16]},
 "hsk1.e01.class-counting":{background:"classroom",actors:[["an","thinking","left"],["wang","teaching","right"]],sparrow:[69,20]},
 "hsk1.e01.liu-noodle-order":{background:"noodle-shop",actors:[["an","curious","left"],["xiaoyu","chatting","center"],["liu","kind","right"]],sparrow:[60,30]},
 "hsk1.e01.liu-payment":{background:"noodle-shop",actors:[["an","careful","left"],["liu","laughing","right"]],sparrow:[24,57]},
 "hsk1.e01.walk-home":{background:"evening-street",actors:[["an","relieved","left"],["xiaoyu","wave","right"]],sparrow:[56,21]},
 "lost-notebook":{background:"classroom",actors:[["an","nervous","left"],["receptionist","welcoming","right"]],sparrow:[69,20],hotspots:["lost-and-found-desk","notebook"]},
 "hsk1.e01.exam-introduction":{background:"classroom",actors:[["an","unsure","left"],["wang","encouraging","right"]],sparrow:[92,10]},
 "hsk1.e01.exam-price":{background:"classroom",actors:[["an","remembering","left"],["wang","listening","right"]],sparrow:[92,10]},
 "hsk1.e01.exam-order":{background:"classroom",actors:[["an","steadier","left"],["wang","proud","right"]],sparrow:[92,10]}
};
var hotspots={"hsk1.e01.arrival-greeting":["school-gate","old-bicycle"],"hsk1.e01.school-introduction":["school-sign","open-gate"],"hsk1.e01.xiaoyu-friendship":["empty-seat","notebook"],"hsk1.e01.class-counting":["blackboard","desks"],"hsk1.e01.liu-noodle-order":["noodle-bowl","menu-pictures"],"hsk1.e01.liu-payment":["coins","noodle-bowl"],"hsk1.e01.walk-home":["street-lantern","open-shop"]};
var expressions={shy:"shy",nervous:"confused",awkward:"shy",thinking:"thinking",curious:"curious",careful:"thinking",relieved:"smile",unsure:"confused",remembering:"thinking",steadier:"smile",gentle:"smile",welcoming:"smile",smiling:"smile",chatting:"smile",kind:"smile",teaching:"smile",laughing:"smile",wave:"smile",encouraging:"smile",listening:"smile",proud:"smile"};
function layout(row,index,count){
 var name=row[0],slot=row[2],trio=count===3,left=slot==="left"?(trio?8:11):slot==="mid"?32:slot==="center"?42:null,right=slot==="right"?(trio?7:10):null,height=name==="an"?(trio?70:79):name==="mother"?84:name==="xiaoyu"?(trio?66:79):88;
 var mobileLeft=slot==="left"?0:slot==="mid"?25:slot==="center"?38:null,mobileRight=slot==="right"?1:null;
 return {desktop:{left:left,right:right,bottom:-4,height:height},mobile:{left:mobileLeft,right:mobileRight,bottom:slot==="center"?6:-3,height:name==="an"?65:name==="mother"?68:name==="xiaoyu"?64:72}};
}
var sparrowMood={"hsk1.e01.arrival-greeting":"curious","hsk1.e01.school-introduction":"happy","hsk1.e01.xiaoyu-friendship":"listening","hsk1.e01.class-counting":"thinking","hsk1.e01.liu-noodle-order":"curious","hsk1.e01.liu-payment":"thinking","hsk1.e01.walk-home":"happy","lost-notebook":"curious","hsk1.e01.exam-introduction":"listening","hsk1.e01.exam-price":"thinking","hsk1.e01.exam-order":"happy"};
var scenes={};sceneIds.forEach(function(id){var def=rows[id],actors=def.actors.map(function(row,index){var p=layout(row,index,def.actors.length);return {character:row[0],expression:row[1],slot:row[2],desktop:p.desktop,mobile:p.mobile}}),mobileSparrow={left:id==="hsk1.e01.liu-noodle-order"?56:id==="hsk1.e01.liu-payment"?20:id==="hsk1.e01.walk-home"?65:72,top:id==="hsk1.e01.liu-noodle-order"?28:19};scenes[id]={id:id,background:def.background,actors:actors,sparrow:{asset:characters.sparrow,expression:sparrowMood[id],desktop:{left:def.sparrow[0],top:def.sparrow[1]},mobile:mobileSparrow},desktop:{sparrow:{left:def.sparrow[0],top:def.sparrow[1]}},mobile:{sparrow:mobileSparrow},layers:{background:backgrounds[def.background],midground:"layers/"+id+"/midground.webp",actors:[characters.an,characters.supportingCast],foreground:{kind:"placeholder",path:"layers/"+id+"/foreground.webp"},sparrow:characters.sparrow},hotspots:hotspots[id]||def.hotspots||[]}});
var noodleForeground={kind:"image",asset:"layers/noodle-bowl-v2-clean.webp"};scenes["hsk1.e01.liu-noodle-order"].layers.foreground=noodleForeground;scenes["hsk1.e01.liu-payment"].layers.foreground=noodleForeground;
function cssFor(id,scene){
 function actorRules(device){return scene.actors.map(function(a,index){var p=a[device];return '.scene-stack[data-scene="'+id+'"] .actor-'+a.slot+'-'+index+'{left:'+(p.left===null?'auto':p.left+'%')+';right:'+(p.right===null?'auto':p.right+'%')+';bottom:'+p.bottom+'%;height:'+p.height+'%;}'}).join("")}
 var d=scene.sparrow.desktop,m=scene.sparrow.mobile;
 return '<style>.scene-stack[data-scene="'+id+'"] .scene-sparrow{left:'+d.left+'%;right:auto;top:'+d.top+'%;bottom:auto}'+actorRules("desktop")+'@media(max-width:690px){.scene-stack[data-scene="'+id+'"] .scene-sparrow{left:'+m.left+'%;right:auto;top:'+m.top+'%;bottom:auto}'+actorRules("mobile")+'}</style>';
}
function render(place,id){
 var scene=scenes[id]||sceneIds.map(function(key){return scenes[key]}).find(function(item){return item.background===(place==="canteen"?"noodle-shop":place)})||scenes[sceneIds[0]],bg=backgrounds[scene.background],actors=scene.actors.map(function(actor,index){var name=actor.character,face=expressions[actor.expression]||"smile",slot=actor.slot,cls="actor-"+slot+"-"+index;if(name==="an")return '<div class="story-actor actor-an pose-'+face+' actor-'+slot+' '+cls+'" data-asset="'+characters.an+'" aria-hidden="true" role="presentation"></div>';return '<div class="story-actor cast-sprite cast-'+name+' actor-'+slot+' '+cls+' mood-'+face+'" data-asset="'+characters.supportingCast+'" aria-hidden="true" role="presentation"></div>'}).join(""),foreground=scene.layers.foreground,foregroundMarkup=foreground.kind==="image"?'<div class="scene-foreground" aria-hidden="true"><img src="/art/'+foreground.asset+'" data-asset="'+foreground.asset+'" alt=""></div>':'<div class="scene-foreground" aria-hidden="true" data-asset-placeholder="'+foreground.path+'"></div>';
 return '<div class="scene-stack scene-'+scene.background+'" data-scene="'+scene.id+'" data-hotspots="'+scene.hotspots.join(",")+'" data-background-asset="'+bg.desktop+'" data-mobile-background-asset="'+bg.mobile+'" data-background-placeholder="'+(bg.placeholder?bg.placeholder.desktop:"")+'"><div class="scene-background" role="img" aria-label="Cảnh truyện ở '+(scene.background==="noodle-shop"?"quán mì":scene.background==="classroom"?"lớp học":"Thành Đô")+'"><picture><source media="(max-width: 690px)" srcset="/art/'+bg.mobile+'"><img src="/art/'+bg.desktop+'" alt="" decoding="async"></picture></div><div class="scene-midground" aria-hidden="true" data-asset-placeholder="'+scene.layers.midground+'"></div><div class="scene-actors" aria-hidden="true" data-assets="'+scene.layers.actors.join(",")+'">'+actors+'</div>'+foregroundMarkup+'<div class="scene-sparrow sparrow-expression-'+scene.sparrow.expression+'" data-asset="'+scene.sparrow.asset+'" aria-label="Sẻ, chú chim xanh nhỏ" role="img"></div>'+cssFor(scene.id,scene)+'</div>';
}
function validate(expectedIds){
 var errors=[],expected=Array.isArray(expectedIds)?expectedIds.slice():sceneIds.slice();
 if(new Set(expected).size!==expected.length)errors.push("Story graph contains duplicate scene IDs");
 expected.forEach(function(id){var s=scenes[id];if(!s){errors.push("Missing scene layout: "+id);return}if(!backgrounds[s.background])errors.push("Missing background mapping: "+id);if(!s.sparrow||s.sparrow.asset!==characters.sparrow)errors.push("Invalid Sparrow asset: "+id);if(!Array.isArray(s.actors)||!s.actors.some(function(a){return a.character==="an"}))errors.push("Missing An actor: "+id);if(!s.layers||!s.layers.midground||!s.layers.foreground||(!s.layers.foreground.asset&&!s.layers.foreground.path))errors.push("Missing foreground asset or placeholder: "+id);if(!s.desktop||!s.mobile)errors.push("Missing responsive scene layout: "+id);if(!s.actors.every(function(a){return a.desktop&&a.mobile}))errors.push("Missing responsive actor layout: "+id)});
 Object.keys(scenes).forEach(function(id){if(expected.indexOf(id)<0)errors.push("Scene art ID absent from story graph: "+id)});
 return errors;
}
return {version:"1.2.0",sceneIds:sceneIds,scenes:scenes,characters:characters,backgrounds:backgrounds,render:render,validate:validate};
})();
