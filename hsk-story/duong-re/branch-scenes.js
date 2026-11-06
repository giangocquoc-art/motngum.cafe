/* The branching story uses the same approved cast, plates and four-layer renderer. */
(function(){"use strict";
var manifest=HSKSceneManifest,base={street:"hsk1.e01.arrival-greeting",station:"hsk1.e01.arrival-greeting",school:"hsk1.e01.school-introduction",class:"hsk1.e01.xiaoyu-friendship",hallway:"lost-notebook",office:"lost-notebook-office",canteen:"hsk1.e01.liu-noodle-order",home:"intro.bedroom"};
var positions=manifest.scenes["hsk1.e01.arrival-greeting"].actors;
function copy(value){return JSON.parse(JSON.stringify(value))}
function actor(name,index){var a=copy(positions[Math.min(index,1)]);a.character=name;a.expression=name==="an"?"thinking":name==="mother"?"gentle":name==="xiaoyu"?"friendly":name==="wang"?"smile":"neutral";return a}
function group(names){return names.map(function(name,index){var a=actor(name,index),pos={left:index*34,bottom:0,width:32};a.desktop=copy(pos);a.mobile=copy(pos);return a})}
function kitchenGroup(names){return names.map(function(name,index){var a=actor(name,index);a.desktop=copy(index===0?{left:0,bottom:28,width:33}:{left:50,bottom:28,width:42});a.mobile=copy(index===0?{left:5,bottom:35,width:35}:{left:45,bottom:35,width:38});a.tablet=copy(index===0?{left:22,bottom:0,width:22}:{left:54,bottom:0,width:23});a.wide=copy({left:names.length===3?[6,24,42][index]:index===0?4:68,bottom:0,width:names.length===3?14:16});a.compact=copy({left:names.length===3?[8,25,42][index]:index===0?26:47,bottom:0,width:names.length===3?14:15});return a})}
AnBranchStory.scenes.forEach(function(node){
 var scene=copy(manifest.scenes[base[node.place]||base.street]);
 if(node.id==="school-gate"){scene=copy(manifest.scenes["hsk1.e01.xiaoyu-friendship"]);scene.actors=group(["an","wang","xiaoyu"])}
 if(node.id==="search-friend")scene.actors=[actor("an",0),actor("xiaoyu",1)];
 if(node.id==="search-teacher")scene.actors=[actor("an",0),actor("wang",1)];
 if(node.id==="day2-ready")scene.actors=[actor("an",0)];
 if(node.place==="home"){
  var names=["an"];if(/Mẹ/.test(node.speaker)||/home-|breakfast|arrival/.test(node.id))names.push("mother");
  if(/guest-prep/.test(node.id))names=["an","xiaoyu"];
  scene.actors=names.map(actor);
  if(["day2-arrival","day2-guest-arrives","day2-home-quiet","day2-breakfast","day2-confession","day2-mother-explains","day2-guest-prep"].includes(node.id)){
   scene.background="day2-kitchen";
   scene.actorRegion={desktop:{left:45,right:3},mobile:{left:3,right:3},tablet:{left:3,right:3},wide:{left:28,right:3},compact:{left:0,right:0}};
   scene.actors=kitchenGroup(names);
   scene.sparrow.desktop={left:70,top:12};
   scene.sparrow.mobile={left:82,top:10};
   scene.sparrow.wide={left:70,top:12};
   scene.sparrow.compact={left:94,top:54};
   scene.sparrow.compactFlight=true;
   scene.sparrow.flight=false;
  }
 }
 if(node.place==="class"&&/Vương/.test(node.speaker))scene.actors=[actor("an",0),actor("wang",1)];
 if(node.id==="day2-bird-teacher")scene.actors=group(["an","wang","xiaoyu"]);
 if(node.id==="arrival"||node.id==="arrival-mother")scene.actors=[actor("an",0),actor("mother",1)];
 if(node.id==="walk-home"){scene=copy(manifest.scenes["hsk1.e01.walk-home"]);scene.actors=group(["an","mother","xiaoyu"]);}
 if(/lost-diary|search-alone/.test(node.id))scene.actors[0].expression="awkward";
 else if(node.id==="day2-home-quiet")scene.actors[0].expression="awkward";
 else if(/epilogue|confession|bird-team/.test(node.id))scene.actors[0].expression="smile";
 else if(/school|watch/.test(node.id))scene.actors[0].expression="shy";
 else if(/search-friend|search-teacher/.test(node.id))scene.actors[0].expression="determined";
 if(/home-confide|day2-confession/.test(node.id)){var mother=scene.actors.find(function(a){return a.character==="mother"});if(mother)mother.expression="concerned";}
 scene.sparrow.expression=/bird/.test(node.id)?"worried":"curious";
 if(/^day2-bird-(quiet|teacher|team)$/.test(node.id)){scene.sparrow.expression="happy";scene.sparrow.flight=true;scene.sparrow.desktop={left:91,top:4};scene.sparrow.mobile={left:87,top:4};}
 manifest.scenes["branch."+node.id]=scene;
 if(node.id==="day2-ready"){var invited=copy(scene);invited.actors=[actor("an",0),actor("xiaoyu",1)];manifest.scenes["branch.day2-ready.invited"]=invited;}
});
window.ChimSeBranchScenes={id:function(node,state){return node.id==="day2-ready"&&state&&state.flags["invite-friend"]?"branch.day2-ready.invited":"branch."+node.id},lessonId:function(index){return index===1?"branch.school-gate":manifest.sceneIds.filter(function(id){return id!=="lost-notebook"})[index]}};
})();
