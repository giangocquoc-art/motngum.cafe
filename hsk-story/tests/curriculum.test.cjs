const {test}=require("node:test");const assert=require("node:assert/strict");const {readFileSync}=require("node:fs");const {runInNewContext}=require("node:vm");const path=require("node:path");
function get(file){const x={module:{exports:{}}};runInNewContext(readFileSync(path.join(__dirname,"..",file),"utf8"),x);return x.module.exports}
const syllabus=get("curriculum-data.js"),blueprint=get("learning-blueprint.js"),content=get("content-manifest.js"),branchLearning=require("../duong-re/branch-learning.js"),branchStory=require("../duong-re/branch-data.js");
const beats=get("story-beats.js");
test("HSK 3.0 roadmap includes levels 1 to 6 with pinned source and pending review state",()=>{
 assert.deepEqual(Array.from(syllabus.levels,x=>x.level),[1,2,3,4,5,6]);
 assert.equal(syllabus.source.framework,"HSK 3.0");assert.equal(syllabus.source.edition,"2025-11");assert.equal(syllabus.source.effective,"2026-07");
 assert.equal(syllabus.levels[0].status,"pilot-playable");assert.ok(syllabus.levels.slice(1).every(x=>x.status==="outline-only"&&x.mappingStatus==="pending-item-review"));
});
test("content validation succeeds",()=>assert.equal(syllabus.validate().join(","),""));
test("checkpoints introduce zero mandatory new expressions",()=>assert.ok(syllabus.scenes.slice(7).every(x=>x.kind==="checkpoint"&&x.words.length===0&&x.reviewOf.length>0)));
test("checkpoint references real practice",()=>assert.deepEqual(Array.from(syllabus.scenes.slice(7),x=>x.reviewOf[0]),[1,5,4]));
test("price checkpoint names the noodle shop from An's story",()=>assert.equal(syllabus.scenes[8].objective,"Nhớ giá bát mì ở quán bà Lưu"));
test("first objective and hint describe the check-in An actually hears",()=>{
 const objective=blueprint.objectives.find(item=>item.id==="greeting"),first=content.scenes[0];
 assert.equal(objective.label,"Hỏi thăm và đáp lời");
 assert.match(first.vi,/con ổn không/);
 assert.match(first.request,/đáp lời mẹ/);
 assert.match(first.hint,/Mẹ đang hỏi thăm An/);
 assert.doesNotMatch(first.hint,/你 là|很 là|吗 đặt cuối/);
 assert.ok(!objective.candidateContent.vocabulary.includes("你好"));
 assert.ok(blueprint.objectives.find(item=>item.id==="introduce-self").candidateContent.vocabulary.includes("你好"));
});
test("first check-in lesson, notebook inventory, and candidate objective cover the authored forms",()=>{
 const expected=[
  ["我还好","wǒ hái hǎo","con vẫn ổn ạ"],
  ["很好","hěn hǎo","ổn ạ (đáp ngắn, lược 我)"],
  ["还好","hái hǎo","vẫn ổn ạ (đáp ngắn, lược 我)"],
  ["谢谢","xièxie","cảm ơn mẹ"]
 ];
 const words=syllabus.scenes[0].words,objective=blueprint.objectives.find(item=>item.id==="greeting");
 expected.forEach(row=>assert.ok(words.some(actual=>JSON.stringify(actual)===JSON.stringify(row)),row[0]+" notebook entry"));
 expected.forEach(([phrase])=>assert.ok(objective.candidateContent.vocabulary.includes(phrase),phrase+" objective vocabulary"));
 assert.equal(syllabus.validate().join(","),"");
});
test("first self-introduction gives An's name forms and prepares the teacher's question",()=>{
 const task=content.scenes[1],gate=beats.beats.find(beat=>beat.id==="gate");
 assert.match(task.request,/thường dùng tên 安/);assert.match(task.request,/đầy đủ là 明安/);
 assert.match(gate.story,/Cô Vương.*hỏi tên em/);
});
test("objective and lesson vocabulary maps include the variants shown in guided models",()=>{
 const expected={"introduce-self":[[1,["我叫明安","我是安"]]],"student-identity":[[2,["是","对"]]],numbers:[[3,["有","人"]]],"order-noodles":[[4,["我想要","我要","一碗","碗"]]],gratitude:[[5,["您","奶奶"]]],farewell:[[6,["好的","好啊","可以","明天见"]]]};
 for(const [objectiveId,scenes] of Object.entries(expected)){const objective=blueprint.objectives.find(x=>x.id===objectiveId);for(const [sceneId,forms] of scenes){const lesson=syllabus.scenes[sceneId],lessonForms=lesson.words.map(row=>row[0]);for(const form of forms){assert.ok(objective.candidateContent.vocabulary.includes(form),objectiveId+" candidate vocabulary includes "+form);assert.ok(lessonForms.includes(form),"lesson "+sceneId+" records modeled "+form)}}}
 const price=blueprint.objectives.find(x=>x.id==="price");assert.ok(content.scenes[8].answers.includes("十元"));assert.ok(!price.candidateContent.vocabulary.includes("十元"),"accepted equivalent is not mislabeled as a taught model");
 const invitation=blueprint.objectives.find(x=>x.id==="farewell");assert.equal(invitation.label,"Nhận lời hẹn và hẹn gặp lại");assert.match(invitation.candidateTask,/Nhận lời mời/);assert.match(syllabus.scenes[6].objective,/Nhận lời hẹn/);
});
test("all ten stable lesson records point to the blueprint objective IDs",()=>{
 const expected=syllabus.scenes.map((_,index)=>blueprint.objectives.filter(o=>o.curriculumSceneIds.includes(index)).map(o=>o.id).sort());
 const actual=syllabus.scenes.map(s=>Array.from(s.objectiveIds).sort());
 assert.equal(JSON.stringify(actual),JSON.stringify(expected));
 assert.equal(new Set(blueprint.objectives.map(o=>o.id)).size,blueprint.objectives.length);
});
test("HSK1 stage report separates mandatory story learning, delayed branch recall, and optional review",()=>{
 const report=blueprint.report(syllabus,require("../future-acts.js"),branchLearning,branchStory);
 assert.equal(report.pilotStageCoverage.length,8);
 assert.deepEqual(Array.from(report.pilotStageCoverage,x=>x.objectiveId),Array.from(blueprint.objectives,x=>x.id));
 const recallScenes={"introduce-self":[7],"student-identity":[7],price:[8],"order-noodles":[9]};
 const branchTasks={numbers:[12],price:[11],"order-noodles":[10],gratitude:[13],farewell:[14]};
 const reuseNodes={greeting:["week-later-home-checkin","week-later-home-answer"],numbers:["day2-counting-group"],"order-noodles":["day2-liu"],price:["day2-liu"],gratitude:["day2-liu"]};
 for(const row of report.pilotStageCoverage){
  assert.equal(row.introduction.complete,true,row.objectiveId+" has an authored introduction");
  assert.equal(row.commonStoryReuse.complete,["greeting","numbers","order-noodles","price","gratitude"].includes(row.objectiveId),row.objectiveId+" reports only authored shared-story reuse");
  assert.deepEqual(Array.from(row.commonStoryReuse.branchNodeIds),reuseNodes[row.objectiveId]||[],row.objectiveId+" uses only a common story node that contains its target form");
  assert.deepEqual(Array.from(row.independentRecall.curriculumSceneIds),recallScenes[row.objectiveId]||[],row.objectiveId+" reports only its separate authored recall task");
  assert.deepEqual(Array.from(row.independentRecall.branchTaskIds),branchTasks[row.objectiveId]||[],row.objectiveId+" reports its stable branch checkpoint IDs separately");
  const individuallyMeasured=["numbers","price","order-noodles","gratitude","farewell"].includes(row.objectiveId);
  assert.equal(row.independentRecall.complete,individuallyMeasured,row.objectiveId+" only counts an objective-specific response as recall evidence");
  assert.deepEqual(Array.from(row.independentRecall.sharedAssessmentSceneIds),["introduce-self","student-identity"].includes(row.objectiveId)?[7]:[]);
  if(["numbers","order-noodles","price","gratitude"].includes(row.objectiveId))assert.match(row.sequenceStatus,/main-story reuse and individually measured recall authored/);
  else assert.match(row.sequenceStatus,/individually measured recall incomplete/);
  assert.equal(row.releaseReady,false,row.objectiveId+" remains locked until content and educator review are complete");
 }
 assert.deepEqual(Array.from(report.incompletePilotSequences),["greeting","introduce-self","student-identity","farewell"]);
 assert.ok(report.optionalReviewSequences.length>0,"optional cards stay visible as optional support, not mandatory coverage");
 assert.equal(report.officiallyVerifiedObjectives,0);assert.equal(report.educatorReviewedObjectives,0);assert.equal(report.objectiveCrosswalkComplete,false);
});
test("lesson assessment evidence credits only what its answer evaluates",()=>{
 const expected=["greeting","introduce-self","student-identity","numbers","order-noodles","gratitude","farewell"];
 assert.deepEqual(Array.from(syllabus.scenes.slice(0,7),s=>s.assessmentObjectiveIds[0]),expected);
 assert.deepEqual(Array.from(syllabus.scenes.slice(7),s=>Array.from(s.assessmentObjectiveIds)),[["introduce-self","student-identity"],["price"],["order-noodles"]]);
 assert.ok(syllabus.scenes.every(s=>s.assessmentObjectiveIds.every(id=>s.objectiveIds.includes(id))));
});
