const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),vm=require("node:vm"),path=require("node:path");
const folder=path.resolve(__dirname,"..");
function load(file){const box={module:{exports:{}},require:request=>require(path.resolve(folder,request))};vm.runInNewContext(fs.readFileSync(path.join(folder,file),"utf8"),box);return box.module.exports}
const G=load("story-graph.js"),W=load("scene-world.js"),S=load("skill-sampler.js"),B=load("learning-blueprint.js"),F=load("future-acts.js"),R=load("review-data.js");
const C=load("content-manifest.js"),K=load("curriculum-data.js"),D=load("story-director.js"),E=load("active-encounter.js"),Beats=load("story-beats.js");
test("V9 stable string IDs and graph/curriculum contract",()=>{
 assert.deepEqual(Array.from(G.validate(C,K,Beats,D,E)),[]);
 assert.equal(G.sceneIds.length,10);
 assert.equal(new Set(Array.from(G.sceneIds)).size,10);
 assert.equal(G.indexOf("hsk1.e01.school-introduction"),1);
});
test("V9 graph resolves old numeric save and stable reference safely",()=>{
 assert.equal(G.resolve(null,7),7);
 assert.equal(G.resolve("hsk1.e01.xiaoyu-friendship",7),2);
 assert.equal(G.resolve("forged",7),7);
 assert.equal(G.resolve("forged",-100),0);
 assert.equal(G.next(G.idAt(9)),null);
});
test("V9 optional scene objects do not change curriculum or scores",()=>{
 assert.deepEqual(Array.from(W.validate(G)),[]);
 let state={};
 state=W.inspect(state,G.idAt(0),"diary").state;
 state=W.inspect(state,G.idAt(0),"diary").state;
 assert.equal(state[G.idAt(0)].length,1);
 assert.equal(W.inspect(state,G.idAt(0),"window").object.zh,"这里是学校。");
 assert.throws(()=>W.inspect(state,G.idAt(7),"future-leak"));
 assert.equal(K.scenes.length,10);
});
test("V9 scene-world sanitizes forged localStorage object IDs",()=>{
 const input={"hsk1.e01.arrival-greeting":["fake","case","case"],hacked:["evil"]};
 const result=W.clean(input);
 assert.deepEqual(Array.from(result[G.idAt(0)]),["case"]);
 assert.equal(result.hacked,undefined);
});
test("V10 skill sample is located before school checkpoint, not official exam",()=>{
 assert.deepEqual(Array.from(S.validate(G,K)),[]);
 assert.equal(S.trigger,7);
 assert.equal(S.items.length,2);
 assert.deepEqual(Array.from(S.items,x=>x.mode),["reading","listening"]);
});
test("V10 reading comprehension correctness tracked once",()=>{
 let s=S.initial();s=S.answer(s,"xiaoyu");
 assert.equal(s.results[0].result,"correct");
 assert.equal(s.index,1);
 assert.throws(()=>S.answer(s,"invalid"));
});
test("V10 listening does not count without TTS playback",()=>{
 let s=S.answer(S.initial(),"teacher");
 s=S.answer(s,"tomorrow");
 assert.equal(s.results[1].result,"unassessed");
 assert.equal(S.summary(s).listening,"unassessed");
 assert.equal(S.summary(s).speaking,"unassessed");
});
test("V10 audio request is tracked distinctly and works only on listening item",()=>{
 let s=S.answer(S.initial(),"xiaoyu");
 assert.throws(()=>S.audio(s,false));
 s=S.audio(s,true);
 s=S.answer(s,"tomorrow");
 assert.equal(s.results[1].result,"correct");
 assert.equal(s.status,"done");
});
test("V10 skip, historic save and tampered result do not fabricate mastery",()=>{
 const old=S.migrate(null,9,[{},{},{},{},{},{},{},{},{}],false);
 assert.equal(old.status,"legacy");
 let skipped=S.skip(S.initial());skipped=S.skip(skipped);
 assert.equal(skipped.status,"done");
 assert.equal(S.summary(skipped).reading,"unassessed");
 const forged=S.clean({status:"done",results:[{result:"perfect"}]});
 assert.equal(forged.status,"pending");
 assert.equal(forged.results[0].result,"unassessed");
});
test("V17 versioned blueprint maps six levels and exposes unverified coverage",()=>{
 assert.deepEqual(Array.from(B.validate(K,C,S,E,F,R)),[]);
 const report=B.report(K,F);
 assert.equal(report.certifiedHSK1Coverage,false);
 assert.equal(report.officiallyVerifiedObjectives,0);
 assert.equal(report.officiallyVerifiedItems,0);
 assert.equal(report.levelsInScope,6);
 assert.equal(report.outlineOnlyLevels,5);
 assert.ok(report.awaitingMandarinReview>0);
 assert.equal(B.source.publisherPage,"https://www.chinesetest.cn/syllabus");
 assert.equal(B.source.published,"2025-11");
 assert.equal(B.source.effective,"2026-07");
 assert.match(B.source.url,/hsk\.cn-bj\.ufileos\.com\/3\.0\//);
 assert.deepEqual(Array.from(B.levels,x=>x.level),[1,2,3,4,5,6]);
 assert.deepEqual(Array.from(B.levels,x=>x.verifiedOfficialItems),[0,0,0,0,0,0]);
 assert.deepEqual(Array.from(B.levels,x=>[x.sourcePages.tasks,x.sourcePages.topics,x.sourcePages.vocabulary,x.sourcePages.characters,x.sourcePages.grammar]),[[2,56,77,353,383],[6,58,84,355,386],[11,60,89,356,389],[18,63,102,358,392],[29,66,127,361,395],[37,69,167,364,398]]);
 assert.ok(B.levels.slice(1).every(x=>x.storyStatus==="outline-only"&&x.teacherSignoff==="PENDING"));
 assert.deepEqual(Array.from(report.incompletePilotSequences),[]);
 assert.deepEqual(Array.from(report.optionalReviewSequences).sort(),["farewell","gratitude","greeting","introduce-self","numbers","order-noodles","price","student-identity"]);
});
test("V17 stable objective IDs point to the unchanged ten lesson/checkpoint scenes",()=>{
 const expected={"greeting":[0,1],"introduce-self":[1,2,7],"student-identity":[2,3,7],"numbers":[3],"order-noodles":[4,5,9],"price":[5,8],"gratitude":[5],"farewell":[6]};
 assert.equal(K.scenes.length,10);
 for(const objective of B.objectives){
  assert.deepEqual(Array.from(objective.curriculumSceneIds),expected[objective.id]);
  assert.equal(objective.sourceLevel,1);
  assert.ok(objective.topic&&objective.candidateTask);
  assert.equal(objective.teacherSignoff,"PENDING");
  assert.deepEqual(Array.from(objective.officialItemIds),[]);
  assert.equal(objective.sourceComponents.length,5);
  assert.deepEqual(Array.from(objective.sourceComponents,x=>x.matchStatus),["pending-item-review","pending-item-review","pending-item-review","pending-item-review","pending-item-review"]);
 }
 const mapped=new Set(B.objectives.flatMap(x=>Array.from(x.curriculumSceneIds)));
 assert.deepEqual(Array.from(mapped).sort((a,b)=>a-b),[0,1,2,3,4,5,6,7,8,9]);
});
test("V18 HSK1 stage references point to objective-tagged reuse and independent checkpoint activities",()=>{
 const reviews=Object.fromEntries(R.items.map(x=>[x.id,x]));
 for(const objective of B.objectives){
  const stages=objective.storyStages;
  assert.ok(stages.introSceneIds.length,objective.id+" has an introduction");
  assert.ok(stages.reuseSceneIds.length||stages.reviewReuseItemIds.length,objective.id+" has a reuse opportunity");
  assert.ok(stages.checkpointSceneIds.length||stages.reviewCheckpointItemIds.length,objective.id+" has a checkpoint");
  for(const id of stages.reviewReuseItemIds){assert.equal(reviews[id].objectiveId,objective.id);assert.equal(reviews[id].stage,"reuse")}
  for(const id of stages.reviewCheckpointItemIds){assert.equal(reviews[id].objectiveId,objective.id);assert.equal(reviews[id].stage,"checkpoint")}
  assert.equal(stages.reviewChannel,"optional-spaced-review");
 }
 assert.ok(R.items.find(x=>x.id==="greeting-checkpoint").after===9);
 assert.ok(R.items.find(x=>x.id==="farewell-checkpoint").after===9);
});
test("V18 blueprint rejects an activity whose objective stage metadata no longer matches its reference",()=>{
 const item=R.items.find(x=>x.id==="greeting-reuse"),original=item.stage;
 try{item.stage="checkpoint";assert.ok(B.validate(K,C,S,E,F,R).some(x=>x.includes("greeting/greeting-reuse")))}
 finally{item.stage=original}
 assert.deepEqual(Array.from(B.validate(K,C,S,E,F,R)),[]);
});
test("V17 all six levels have stable objectives, ordered story stages, and no false syllabus match",()=>{
 const all=B.allObjectives(K,F);
 assert.equal(all.length,38);
 assert.deepEqual(Array.from(B.report(K,F).objectivesByLevel,x=>x.count),[8,6,6,6,6,6]);
 assert.ok(all.every(x=>x.officialItemIds.length===0&&x.teacherSignoff==="PENDING"&&!x.readyForRelease));
 for(const objective of all.filter(x=>x.level>1)){
  const act=F.acts.find(x=>x.level===objective.level),order=Object.fromEntries(act.episodes.map((episode,index)=>[episode.id,index]));
  assert.ok(order[objective.episodeRefs.intro.episodeId]<order[objective.episodeRefs.reuse.episodeId],objective.id+" introduces before reuse");
  assert.ok(order[objective.episodeRefs.reuse.episodeId]<=order[objective.episodeRefs.checkpoint.episodeId],objective.id+" practices before recall");
  assert.equal(objective.episodeRefs.checkpoint.beat,"separate-independent-recall-after-story-use");
  assert.equal(objective.candidateContent.status.startsWith("draft-candidate"),true);
  assert.ok(objective.candidateContent.vocabulary.length>=4,objective.id+" has sourced vocabulary candidates");
  assert.ok(objective.candidateContent.grammar.length>=2,objective.id+" has grammar candidates");
  assert.ok(objective.candidateContent.characters.length>0,objective.id+" has character candidates");
  assert.deepEqual(Array.from(Object.keys(objective.candidateSourceRefs).sort()),["characters","edition","grammar","sourceUrl","tasks","topics","vocabulary"]);
  assert.ok(objective.candidateSkillProfile.candidatePracticeSkills.length>0);
  assert.ok(objective.candidateSkillProfile.officialExamSections.includes("listening")&&objective.candidateSkillProfile.officialExamSections.includes("reading"));
  assert.equal(objective.sourceComponents.every(x=>x.matchStatus==="pending-item-review"&&x.officialItemIds.length===0),true);
 }
});
test("future candidate vocabulary, grammar, and characters resolve to independent PDF item locators",()=>{
 const index=B.candidateSourceIndex,all=B.makeFutureObjectives(F);
 assert.equal(index.sourceUrl,B.source.url);
 assert.equal(Object.keys(index.vocabularyRows).length,78);
 assert.equal(Object.values(index.characterRefsByTargetLevel).reduce((sum,chars)=>sum+Object.keys(chars).length,0),151);
 assert.equal(index.vocabularyRows["6:4758"].hanzi,"涉及");
 assert.equal(index.vocabularyRows["6:4939"].hanzi,"推测");
 assert.equal(index.vocabularyRows["6:5216"].hanzi,"原材料");
 for(const objective of all.filter(x=>x.level>1)){
  for(const word of objective.candidateContent.vocabulary){
   const ref=index.vocabularyRows[objective.level+":"+word.candidateRowNumber];
   assert.deepEqual([word.hanzi,word.pinyin,word.printedPage],[ref.hanzi,ref.pinyin,ref.printedPage]);
  }
  for(const grammar of objective.candidateContent.grammar){
   assert.ok(index.grammarEntries.some(ref=>ref.level===objective.level&&ref.pattern===grammar.pattern&&ref.printedPage===grammar.printedPage),objective.id+" cites a target-level grammar item");
  }
  for(const ref of objective.candidateSourceRefs.characters.candidateItems){
   const expected=index.characterRefsByTargetLevel[objective.level][ref.character];
   assert.deepEqual([ref.characterLevel,ref.ordinal,ref.printedPage,ref.relation],[expected.characterLevel,expected.ordinal,expected.printedPage,expected.relation]);
  }
 }
});
test("future candidate crosswalk validation fails closed on missing rows or skills",()=>{
 const spec=B.futurePlans.find(plan=>plan.level===4).objectives[0],row=spec.vocabulary[0],skills=spec.practiceSkills;
 try{row[3]=0;assert.ok(B.validate(K,C,S,E,F,R).some(x=>x.includes("Malformed candidate vocabulary row")))}finally{row[3]=1811}
 try{row[3]=1812;assert.ok(B.validate(K,C,S,E,F,R).some(x=>x.includes("pinned PDF row/page index")))}finally{row[3]=1811}
 const grammar=spec.grammar[0],page=grammar[2];
 try{grammar[2]=386;assert.ok(B.validate(K,C,S,E,F,R).some(x=>x.includes("incorrectly level-mapped candidate grammar")))}finally{grammar[2]=page}
 try{spec.practiceSkills=["speaking"];assert.ok(B.validate(K,C,S,E,F,R).some(x=>x.includes("skill profile")))}finally{spec.practiceSkills=skills}
 assert.deepEqual(Array.from(B.validate(K,C,S,E,F,R)),[]);
});
test("V17 validator rejects broken crosswalks, bad prerequisites, and playable future acts",()=>{
 const badPages=JSON.parse(JSON.stringify(K)),badAct=JSON.parse(JSON.stringify(F));
 badPages.levels[0].sourcePages.tasks++;
 assert.ok(B.validate(badPages,C,S,E,F,R).some(x=>x.includes("section locator")));
 badPages.levels[0].sourcePages.tasks--;
 badPages.scenes[0].objectiveIds=[];
 assert.ok(B.validate(badPages,C,S,E,F,R).some(x=>x.includes("crosswalk")));
 badAct.acts[0].playable=true;
 assert.ok(B.validate(K,C,S,E,badAct,R).some(x=>x.includes("six candidate strands per locked HSK2–6")));
 const first=B.futurePlans[0].objectives[0],oldPrerequisites=first.prerequisiteIds;
 try{first.prerequisiteIds=["unknown-objective"];assert.ok(B.validate(K,C,S,E,F,R).some(x=>x.includes("prerequisite")));}
 finally{if(oldPrerequisites===undefined)delete first.prerequisiteIds;else first.prerequisiteIds=oldPrerequisites;}
 assert.deepEqual(Array.from(B.validate(K,C,S,E,F,R)),[]);
 assert.ok(B.validate(null,C,S,E,F,R).some(x=>x.includes("registries are required")));
});
test("V17 reviewed mappings can be recorded without making incomplete HSK1 releasable",()=>{
 const objective=B.definitions[0],original=objective.reviewState,oldCount=B.levels[0].verifiedOfficialItems;
 const statusByComponent=Object.fromEntries(B.source.components.map(x=>[x,"reviewed-match"]));
 const itemsByComponent=Object.fromEntries(B.source.components.map(x=>[x,["official-row-"+x]]));
 try{
  objective.reviewState={statusByComponent:statusByComponent,itemsByComponent:itemsByComponent,teacherSignoff:"APPROVED",readyForRelease:false};
  B.levels[0].verifiedOfficialItems=5;
  assert.deepEqual(Array.from(B.validate(K,C,S,E,F,R)),[]);
  assert.equal(B.report(K,F).officiallyVerifiedItems,5);
  assert.equal(B.report(K,F).readyLevels.length,0);
 }finally{if(original===undefined)delete objective.reviewState;else objective.reviewState=original;B.levels[0].verifiedOfficialItems=oldCount;}
});
test("V13–V17 five drafted acts remain non-playable through HSK 3.0 level 6",()=>{
 assert.deepEqual(Array.from(F.validate()),[]);
 assert.deepEqual(Array.from(F.acts,x=>x.level),[2,3,4,5,6]);
 assert.ok(F.acts.every(x=>x.playable===false&&x.planningStatus.includes("no HSK 3.0 target items mapped")));
 assert.equal(F.acts.reduce((n,x)=>n+x.episodes.length,0),20);
 assert.ok(F.byLevel(5).episodes.some(e=>e.id==="graduation"));
 assert.equal(F.byLevel(6).id,"hsk6.letters-we-leave");
 assert.equal(F.byLevel(6).episodes.length,4);
 assert.ok(F.status.includes("NOT PLAYABLE"));
});

test("Gate3B world clues connect beginner Hanzi to already-visited real scenes without HSK points",()=>{
 let intro={maxReached:5,discovered:["木","日"],momRevealed:true,lightParts:["日","月"]};
 let a=W.describe(G.idAt(0),"window",{},intro);
 assert.ok(a.bridgeText.includes("Bạn từng nhìn thấy")&&a.bridgeText.includes("日"));
 assert.ok(a.bridgeText.includes("Không tính điểm"));
 let b=W.describe(G.idAt(6),"tree",{},intro);
 assert.ok(b.bridgeText.includes("木")&&b.bridgeText.includes("林")&&b.bridgeText.includes("森"));
 let c=W.describe(G.idAt(6),"store",{},null);
 assert.ok(c.bridgeText.includes("谢谢")&&c.bridgeText.includes("Trong truyện"));
 let d=W.describe(G.idAt(0),"window",{},null);
 assert.ok(d.bridgeText.includes("Một chữ/cụm chữ")&&!d.bridgeText.includes("Bạn từng"));
});
test("Gate3B past observations unlock small emotional callbacks, not story grades or future plot",()=>{
 const past={[G.idAt(0)]:["window","diary"]};
 const tree=W.describe(G.idAt(6),"tree",past,null);
 const diary=W.describe(G.idAt(6),"diary",past,null);
 assert.ok(tree.callbackText.includes("nép bên mẹ"));
 assert.ok(diary.callbackText.includes("trang đầu"));
 assert.equal(W.describe(G.idAt(6),"tree",{},null).callbackText,"");
 assert.equal(W.describe(G.idAt(0),"window",past,null).callbackText,"");
});
test("Gate3B focus cleans unknown or unobserved selection, preserving V9 observation IDs",()=>{
 const one=G.idAt(0),two=G.idAt(6);
 const all={[one]:["window","window","case"],[two]:["tree"]};
 const cleaned=W.cleanFocus({[one]:"diary",[two]:"tree",fake:"hijack"},all);
 assert.equal(cleaned[one],undefined);
 assert.equal(cleaned[two],"tree");
 assert.deepEqual(Array.from(W.clean(all)[one]),["window","case"]);
 assert.throws(()=>W.describe(two,"forged",all,null));
 assert.deepEqual(Array.from(W.validate(G)),[]);
});
