const {test}=require('node:test'),assert=require('node:assert/strict');
const {boot,until}=require('./helpers/branch-ui-fixture.cjs');
const DRAFT='chimse-branch-lesson-draft-v1',FEEDBACK='chimse-branch-pending-feedback-v1';

test('An hears Tiểu Vũ ask the price, bà Lưu answer, then Tiểu Vũ model thanks without changing progress',()=>{
 const ui=boot('walk-home',5),C=ui.box.HSKContent,before=Array.from(ui.values),beat=ui.box.HSKStoryBeats.dialogueFor(5);
 assert.equal(ui.phase(),'context');assert.equal(ui.get('speaker').textContent,'小雨 · Tiểu Vũ');
 assert.equal(ui.get('sceneTitle').textContent,beat.title);assert.equal(ui.get('nextBtn').textContent,beat.continueLabel);
 assert.deepEqual(ui.get('content').children.map(child=>child.textContent),['一碗面多少钱？',beat.py,beat.vi]);
 assert.equal(ui.actors.get('xiaoyu').dataset.expression,'speaking');assert.notEqual(ui.actors.get('liu').dataset.expression,'speaking');
 ui.get('previousBtn').click();assert.deepEqual(ui.spoken,['一碗面多少钱？']);assert.equal(ui.phase(),'context');
 ui.get('nextBtn').click();assert.equal(ui.phase(),'listen');assert.equal(ui.get('speaker').textContent,C.scenes[5].speaker);
 assert.equal(ui.get('content').children[0].textContent,'这碗面十块钱。');assert.equal(ui.actors.get('liu').dataset.expression,'speaking');assert.notEqual(ui.actors.get('xiaoyu').dataset.expression,'speaking');
 ui.get('nextBtn').click();assert.equal(ui.phase(),'meaning');ui.get('nextBtn').click();assert.equal(ui.phase(),'model');
 assert.equal(ui.get('speaker').textContent,C.scenes[5].guidedModel.speaker+' · nhắc An');assert.equal(ui.get('content').children[0].textContent,'谢谢！');
 assert.equal(ui.actors.get('xiaoyu').dataset.expression,'speaking');assert.notEqual(ui.actors.get('liu').dataset.expression,'speaking');
 assert.deepEqual(Array.from(ui.values),before,'observing context, response and model preserves saved plot and learning evidence');assert.deepEqual(ui.writes,[]);
});

test('a pre-existing in-progress thanks draft survives replaying the price lead-in with attempts and support',()=>{
 const seed=({state})=>({[DRAFT]:JSON.stringify({index:5,at:state.node,path:state.path,attempts:2,helped:true,draft:'谢谢奶'})});
 const first=boot('walk-home',5,{seed}),before=Array.from(first.values),draft=first.values.get(DRAFT);
 assert.equal(first.phase(),'context');first.get('nextBtn').click();assert.equal(first.values.get(DRAFT),draft);assert.deepEqual(first.writes,[]);
 const reloaded=boot('walk-home',5,{seed:Object.fromEntries(before)});
 assert.equal(reloaded.phase(),'context','an old draft may replay unscored context on reload');until(reloaded,'lesson');
 assert.equal(reloaded.get('answerInput').value,'谢谢奶');assert.equal(reloaded.values.get(DRAFT),draft);assert.deepEqual(reloaded.writes,[]);
 const routeKey=reloaded.box.AnBranchStory.storageKey,route=reloaded.values.get(routeKey),form=reloaded.get('content').children.find(child=>child.tagName==='FORM');
 reloaded.get('answerInput').value='谢谢奶奶';form.fire('submit');
 const record=JSON.parse(reloaded.values.get(reloaded.box.ChimSeBranchLearning.storageKey))[5];
 const {evidence,...legacy}=record;assert.deepEqual(legacy,{status:'correct',attempts:2,hint:true});assert.equal(evidence.events.length,1,'legacy mistakes have no fabricated timestamps');assert.equal(evidence.events[0].result,'correct');assert.equal(evidence.events[0].attempt,2);assert.equal(reloaded.values.get(routeKey),route);assert.equal(reloaded.values.has(DRAFT),false);
});

test('a completed thanks task and an existing feedback save never reopen the price lead-in',()=>{
 const completed=boot('walk-home',6),before=Array.from(completed.values);
 assert.equal(completed.phase(),'listen');assert.equal(completed.get('branchShell').dataset.lesson,'6');
 assert.equal(completed.get('content').children[0].textContent,completed.box.HSKContent.scenes[6].zh);until(completed,'model');
 assert.deepEqual(Array.from(completed.values),before);assert.deepEqual(completed.writes,[]);
 const feedback=boot('walk-home',6,{seed:({state})=>({[FEEDBACK]:JSON.stringify({index:5,path:state.path,before:true})})});
 assert.equal(feedback.phase(),'feedback');assert.equal(feedback.get('branchShell').dataset.lesson,'5');feedback.get('nextBtn').click();
 assert.equal(feedback.phase(),'listen');assert.equal(feedback.get('branchShell').dataset.lesson,'6');
 const finished=boot('walk-home',10);assert.equal(finished.phase(),'read');until(finished,'choose');assert.equal(finished.get('branchShell').dataset.lesson,'');assert.deepEqual(finished.writes,[]);
});

test('week-later recalls show a contextual reply after the learner answers',()=>{
 for(const [anchor,completed,index,answer,reply] of [
  ['week-later-shop',10,10,'我想吃面条','好，还是老样子。'],
  ['week-later-home',[0,1,2,3,4,5,6,7,8,9,10,15],11,'十块钱','你记得真清楚。']
 ]){
  const ui=boot(anchor,completed);until(ui,'lesson');assert.equal(ui.get('branchShell').dataset.lesson,String(index));
  ui.get('answerInput').value=answer;ui.get('content').children.find(child=>child.tagName==='FORM').fire('submit');
  assert.equal(ui.phase(),'feedback');assert.equal(ui.get('content').children[0].textContent,reply);
 }
});
