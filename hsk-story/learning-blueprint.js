/* V10 educator-review traceability, NOT official HSK mastery/complete syllabus. */
var HSKLearningBlueprint=(function(){"use strict";
var source={
name:"HSK 考试大纲 / Syllabus for the Chinese Proficiency Test",
publisher:"中外语言交流合作中心",
edition:"2025-11",
publisherPage:"https://www.chinesetest.cn/syllabus",
framework:"HSK 3.0",
status:"source-linked, target-item validation PENDING qualified Mandarin editorial review",
notice:"Official ChineseTest says worldwide HSK 3.0 rollout date 2026-12-13. Published syllabus edition and current test scheduling must be rechecked before official claims."
};
var objectives=[
{id:"greeting",label:"Chào hỏi và đáp lời",intro:[0],revisit:[1],formative:[],checkpoint:[],skillEvidence:["text-entry"],needsReview:true},
{id:"introduce-self",label:"Tự giới thiệu tên Minh An",intro:[1],revisit:[2],formative:["lost-notebook"],checkpoint:[7],skillEvidence:["typed-transfer","typed-checkpoint"],needsReview:true},
{id:"student-identity",label:"Xác nhận là học sinh",intro:[2],revisit:[3],formative:["reading-friend"],checkpoint:[7],skillEvidence:["formative-reading"],needsReview:true},
{id:"numbers",label:"Đếm số người",intro:[3],revisit:[],formative:[],checkpoint:[],skillEvidence:["text-entry"],needsReview:true},
{id:"order-noodles",label:"Gọi một món ăn",intro:[4],revisit:[5],formative:[],checkpoint:[9],skillEvidence:["text-entry","typed-checkpoint"],needsReview:true},
{id:"price",label:"Hiểu giá mười tệ",intro:[5],revisit:[],formative:[],checkpoint:[8],skillEvidence:["typed-checkpoint"],needsReview:true},
{id:"gratitude",label:"Nói lời cảm ơn",intro:[5],revisit:[],formative:[],checkpoint:[],skillEvidence:["text-entry"],needsReview:true},
{id:"farewell",label:"Hẹn gặp ngày mai",intro:[6],revisit:[],formative:["listening-farewell"],checkpoint:[],skillEvidence:["formative-tts-listening"],needsReview:true}
];
function validate(curriculum,content,skill,encounter){
 var problems=[],ids=new Set();
 if(!source.publisherPage.startsWith("https://www.chinesetest.cn/"))problems.push("Unverified canonical source location");
 objectives.forEach(function(o){
  if(ids.has(o.id))problems.push("Duplicate objective");ids.add(o.id);
  for(const i of o.intro.concat(o.revisit,o.checkpoint)){
   if(!Number.isInteger(i)||i<0||i>=7&&o.intro.includes(i))problems.push("Invalid intro index "+o.id);
   if(!curriculum||!curriculum.scenes[i])problems.push("Unknown scene "+o.id);
  }
  for(const x of o.checkpoint)if(curriculum.scenes[x].kind!=="checkpoint")problems.push("Not a checkpoint");
  for(const x of o.formative)if(!(skill&&skill.items.some(s=>s.id===x))&&!(encounter&&encounter.content.id===x))problems.push("Unknown formative task "+x);
  if(o.needsReview!==true)problems.push("No syllabus/native review clearance");
 });
 if(!content||content.scenes.length!==curriculum.scenes.length)problems.push("Content scenes mismatch");
 return problems;
}
function report(){
 var mapped=objectives.length,withCheck=objectives.filter(x=>x.checkpoint.length>0).length;
 var unreviewed=objectives.filter(x=>x.needsReview).length;
 return {pilotObjectivesMapped:mapped,withInWorldCheckpoint:withCheck,awaitingMandarinReview:unreviewed,
 officiallyVerifiedObjectives:0,certifiedHSK1Coverage:false,missingEvidenceModalities:["speaking","handwriting","validated-native-audio"],notice:"Pilot audit only; no claim of complete HSK 3.0 target set."};
}
var api={source:source,objectives:objectives,report:report,validate:validate};
if(typeof module!=="undefined"&&module.exports)module.exports=api;return api;
})();
