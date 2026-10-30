/* V10/V17 source-pinned curriculum traceability; never official mastery or full syllabus coverage. */
var HSKLearningBlueprint=(function(){"use strict";
var source={
 id:"hsk30-syllabus-2025-11",
 name:"HSK 考试大纲 / Syllabus for the Chinese Proficiency Test",
 publisher:"中外语言交流合作中心",
 edition:"2025-11",
 published:"2025-11",
 effective:"2026-07",
 framework:"HSK 3.0",
 publisherPage:"https://www.chinesetest.cn/syllabus",
 url:"https://hsk.cn-bj.ufileos.com/3.0/%E6%96%B0%E7%89%88HSK%E8%80%83%E8%AF%95%E5%A4%A7%E7%BA%B21219.pdf",
 pageConvention:"Printed page numbers in the official PDF, not zero-based PDF viewer page indices.",
 components:["tasks","topics","vocabulary","grammar","characters"],
 status:"Official source identified; exact-content mapping and qualified Mandarin educator sign-off PENDING.",
 notice:"Publication/effective dates identify the syllabus edition only. They do not imply a test rollout date or establish that Chim Sẻ content covers the syllabus."
};
var levels=[
 {level:1,storyTheme:"Ngày đầu xa nhà",storyStatus:"pilot-playable",sourcePages:{tasks:2,topics:56,vocabulary:77,characters:353,grammar:383},mappingStatus:"pilot-objectives-only; item-level alignment unverified",verifiedOfficialItems:0,teacherSignoff:"PENDING"},
 {level:2,storyTheme:"Người bạn đầu tiên",storyStatus:"planned",sourcePages:{tasks:6,topics:58,vocabulary:84,characters:355,grammar:386},mappingStatus:"unmapped; all content and sign-off pending",verifiedOfficialItems:0,teacherSignoff:"PENDING"},
 {level:3,storyTheme:"Hội chợ mùa xuân",storyStatus:"planned",sourcePages:{tasks:11,topics:60,vocabulary:89,characters:356,grammar:389},mappingStatus:"unmapped; all content and sign-off pending",verifiedOfficialItems:0,teacherSignoff:"PENDING"},
 {level:4,storyTheme:"Khi mọi chuyện thay đổi",storyStatus:"planned",sourcePages:{tasks:18,topics:63,vocabulary:102,characters:358,grammar:392},mappingStatus:"unmapped; all content and sign-off pending",verifiedOfficialItems:0,teacherSignoff:"PENDING"},
 {level:5,storyTheme:"Hai quê hương",storyStatus:"planned",sourcePages:{tasks:29,topics:66,vocabulary:127,characters:361,grammar:395},mappingStatus:"unmapped; all content and sign-off pending",verifiedOfficialItems:0,teacherSignoff:"PENDING"},
 {level:6,storyTheme:"Những điều An muốn gửi lại",storyStatus:"planned",sourcePages:{tasks:37,topics:69,vocabulary:167,characters:364,grammar:398},mappingStatus:"unmapped; all content and sign-off pending",verifiedOfficialItems:0,teacherSignoff:"PENDING"}
];
/* Authored pedagogical labels are kept separate from official-source page anchors. */
var objectives=[
 {id:"greeting",label:"Đáp lời mẹ hỏi thăm",curriculumSceneIds:[0,1],sourceLevel:1,sourceAnchors:["tasks","topics","vocabulary","characters","grammar"],alignmentStatus:"candidate; exact official items unverified",officialItemIds:[],intro:[0],revisit:[1],formative:[],checkpoint:[],skillEvidence:["text-entry"],needsReview:true,teacherSignoff:"PENDING"},
 {id:"introduce-self",label:"Giới thiệu tên Minh An",curriculumSceneIds:[1,2,7],sourceLevel:1,sourceAnchors:["tasks","topics","vocabulary","characters","grammar"],alignmentStatus:"candidate; exact official items unverified",officialItemIds:[],intro:[1],revisit:[2],formative:["lost-notebook"],checkpoint:[7],skillEvidence:["typed-transfer","typed-checkpoint"],needsReview:true,teacherSignoff:"PENDING"},
 {id:"student-identity",label:"Xác nhận mình là học sinh",curriculumSceneIds:[2,3,7],sourceLevel:1,sourceAnchors:["tasks","topics","vocabulary","characters","grammar"],alignmentStatus:"candidate; exact official items unverified",officialItemIds:[],intro:[2],revisit:[3],formative:["reading-friend"],checkpoint:[7],skillEvidence:["formative-reading"],needsReview:true,teacherSignoff:"PENDING"},
 {id:"numbers",label:"Đếm số người",curriculumSceneIds:[3],sourceLevel:1,sourceAnchors:["tasks","topics","vocabulary","characters","grammar"],alignmentStatus:"candidate; exact official items unverified",officialItemIds:[],intro:[3],revisit:[],formative:[],checkpoint:[],skillEvidence:["text-entry"],needsReview:true,teacherSignoff:"PENDING"},
 {id:"order-noodles",label:"Gọi một món ăn",curriculumSceneIds:[4,5,9],sourceLevel:1,sourceAnchors:["tasks","topics","vocabulary","characters","grammar"],alignmentStatus:"candidate; exact official items unverified",officialItemIds:[],intro:[4],revisit:[5],formative:[],checkpoint:[9],skillEvidence:["text-entry","typed-checkpoint"],needsReview:true,teacherSignoff:"PENDING"},
 {id:"price",label:"Hiểu giá mười tệ",curriculumSceneIds:[5,8],sourceLevel:1,sourceAnchors:["tasks","topics","vocabulary","characters","grammar"],alignmentStatus:"candidate; exact official items unverified",officialItemIds:[],intro:[5],revisit:[],formative:[],checkpoint:[8],skillEvidence:["typed-checkpoint"],needsReview:true,teacherSignoff:"PENDING"},
 {id:"gratitude",label:"Nói lời cảm ơn",curriculumSceneIds:[5],sourceLevel:1,sourceAnchors:["tasks","topics","vocabulary","characters","grammar"],alignmentStatus:"candidate; exact official items unverified",officialItemIds:[],intro:[5],revisit:[],formative:[],checkpoint:[],skillEvidence:["text-entry"],needsReview:true,teacherSignoff:"PENDING"},
 {id:"farewell",label:"Hẹn gặp ngày mai",curriculumSceneIds:[6],sourceLevel:1,sourceAnchors:["tasks","topics","vocabulary","characters","grammar"],alignmentStatus:"candidate; exact official items unverified",officialItemIds:[],intro:[6],revisit:[],formative:["listening-farewell"],checkpoint:[],skillEvidence:["formative-tts-listening"],needsReview:true,teacherSignoff:"PENDING"}
];
function validate(curriculum,content,skill,encounter){
 var problems=[],ids=new Set(),componentKeys=source.components;
 if(source.url.indexOf("https://hsk.cn-bj.ufileos.com/3.0/")!==0)problems.push("Missing official syllabus PDF URL");
 if(source.published!=="2025-11"||source.effective!=="2026-07")problems.push("Unexpected syllabus edition dates");
 if(levels.length!==6||levels.some(function(level,index){return level.level!==index+1}))problems.push("Expected HSK 3.0 levels 1..6");
 levels.forEach(function(level){
  if(!level.storyTheme||!level.storyStatus||level.verifiedOfficialItems!==0||level.teacherSignoff!=="PENDING")problems.push("Unverified level must remain explicitly pending: "+level.level);
  componentKeys.forEach(function(key){if(!Number.isInteger(level.sourcePages[key])||level.sourcePages[key]<1)problems.push("Missing source page "+level.level+"/"+key)});
 });
 objectives.forEach(function(o){
  if(ids.has(o.id))problems.push("Duplicate objective");ids.add(o.id);
  if(o.sourceLevel!==1||o.alignmentStatus.indexOf("unverified")<0||o.officialItemIds.length!==0||o.teacherSignoff!=="PENDING")problems.push("Objective must remain unverified: "+o.id);
  if(!Array.isArray(o.curriculumSceneIds)||o.curriculumSceneIds.length===0)problems.push("Missing curriculum scene references: "+o.id);
  for(const i of o.curriculumSceneIds){if(!Number.isInteger(i)||!curriculum||!curriculum.scenes[i])problems.push("Unknown curriculum scene "+o.id+"/"+i)}
  for(const i of o.intro.concat(o.revisit,o.checkpoint)){
   if(!Number.isInteger(i)||i<0||i>=10)problems.push("Invalid scene index "+o.id+"/"+i);
   if(!curriculum||!curriculum.scenes[i])problems.push("Unknown scene "+o.id);
  }
  for(const x of o.checkpoint)if(curriculum.scenes[x].kind!=="checkpoint")problems.push("Not a checkpoint");
  for(const x of o.formative)if(!(skill&&skill.items.some(function(s){return s.id===x}))&&!(encounter&&encounter.content.id===x))problems.push("Unknown formative task "+x);
  if(o.needsReview!==true||o.teacherSignoff!=="PENDING")problems.push("No syllabus/native review clearance");
 });
 if(!content||content.scenes.length!==curriculum.scenes.length)problems.push("Content scenes mismatch");
 return problems;
}
function report(){
 return {pilotObjectivesMapped:objectives.length,withInWorldCheckpoint:objectives.filter(function(x){return x.checkpoint.length>0}).length,awaitingMandarinReview:objectives.filter(function(x){return x.teacherSignoff==="PENDING"}).length,officiallyVerifiedObjectives:0,officiallyVerifiedItems:0,levelsInScope:levels.length,plannedLevels:levels.filter(function(x){return x.storyStatus==="planned"}).length,certifiedHSK1Coverage:false,certifiedHSK3Coverage:false,missingEvidenceModalities:["speaking","handwriting","validated-native-audio"],notice:"Source-pinned pilot only; no claim of complete HSK 3.0 target-set coverage or certification."};
}
var api={version:"2025-11-syllabus-map-v1",source:source,levels:levels,objectives:objectives,report:report,validate:validate};
if(typeof module!=="undefined"&&module.exports)module.exports=api;return api;
})();
