const {test}=require('node:test'),assert=require('node:assert/strict');
const {boot,until}=require('./helpers/branch-ui-fixture.cjs');

test('the noodle thanks model belongs to Tiểu Vũ and restores his expression before bà Lưu resumes',()=>{
 const ui=boot('walk-home',5),C=ui.box.HSKContent,L=ui.box.ChimSeBranchLearning;
 until(ui,'listen');
 assert.equal(ui.get('speaker').textContent,C.scenes[5].speaker);
 const initialLiu=ui.actors.get('liu').dataset.expression,initialXiaoyu=ui.actors.get('xiaoyu').dataset.expression;
 assert.equal(initialLiu,'speaking','the real payment scene begins with bà Lưu stating the price');
 ui.box.HSKSceneLayers.setExpression(ui.host,'an','awkward');
 until(ui,'model');
 assert.equal(ui.get('speaker').textContent,C.scenes[5].guidedModel.speaker+' · nhắc An');
 assert.equal(ui.get('content').children[0].textContent,C.scenes[5].guidedModel.zh);
 assert.equal(ui.actors.get('xiaoyu').dataset.expression,'speaking');
 assert.match(ui.actors.get('xiaoyu').innerHTML,/<svg\b/,'the actual renderer updates the model actor artwork');
 assert.equal(ui.actors.get('liu').dataset.expression,'smile','bà Lưu pauses her speaking frame while Tiểu Vũ models thanks');
 assert.equal(ui.actors.get('an').dataset.expression,'awkward','model does not reset An’s current reaction');
 ui.get('nextBtn').click();assert.equal(ui.phase(),'request');
 assert.equal(ui.get('speaker').textContent,C.scenes[5].speaker);
 assert.equal(ui.actors.get('xiaoyu').dataset.expression,initialXiaoyu,'only the temporary speaking change is restored');
 assert.equal(ui.actors.get('liu').dataset.expression,initialLiu);assert.equal(ui.actors.get('an').dataset.expression,'awkward');
 ui.get('nextBtn').click();assert.equal(ui.phase(),'lesson');
 const narrative=ui.values.get(ui.box.AnBranchStory.storageKey),form=ui.get('content').children.find(child=>child.tagName==='FORM');
 ui.get('answerInput').value=C.scenes[5].answers[0];form.fire('submit');
 assert.equal(ui.phase(),'feedback');assert.equal(ui.get('speaker').textContent,C.scenes[5].speaker);
 assert.equal(ui.get('content').children[0].textContent,C.replies[5].zh);
 assert.equal(ui.actors.get('xiaoyu').dataset.expression,initialXiaoyu);assert.equal(ui.actors.get('an').dataset.expression,'awkward');
 assert.equal(ui.values.get(ui.box.AnBranchStory.storageKey),narrative,'answering the practice does not alter the story route');
 const record=JSON.parse(ui.values.get(L.storageKey))[5];assert.equal(record.status,'correct');assert.equal(record.hint,true,'the authored model remains recorded as support');
});

test('a model without a speaker override uses its scene speaker and leaves other actors unchanged',()=>{
 const ui=boot('arrival',0),scene=ui.box.HSKContent.scenes[0];
 until(ui,'listen');const original=ui.actors.get(scene.speakerCharacter).dataset.expression,other=ui.actors.get('an').dataset.expression;
 until(ui,'model');
 assert.equal(ui.get('speaker').textContent,scene.speaker+' · nhắc An');assert.equal(ui.actors.get(scene.speakerCharacter).dataset.expression,'speaking');
 assert.equal(ui.actors.get('an').dataset.expression,other);
 ui.get('nextBtn').click();assert.equal(ui.get('speaker').textContent,scene.speaker);assert.equal(ui.actors.get(scene.speakerCharacter).dataset.expression,original);
 assert.equal(ui.actors.get('an').dataset.expression,other);
});

test('ending a model does not undo an actor expression changed independently after the model began',()=>{
 const ui=boot('walk-home',5);until(ui,'model');
 ui.box.HSKSceneLayers.setExpression(ui.host,'xiaoyu','laughing');ui.box.HSKSceneLayers.setExpression(ui.host,'liu','curious');ui.get('nextBtn').click();
 assert.equal(ui.actors.get('xiaoyu').dataset.expression,'laughing');
 assert.equal(ui.actors.get('liu').dataset.expression,'curious','an independent listening-actor update is not replaced by the old speaking state');
 assert.equal(ui.get('speaker').textContent,ui.box.HSKContent.scenes[5].speaker);
});

test('model turns preserve other actors whose authored reaction is already emotional rather than speaking',()=>{
 const ui=boot('walk-home',5);ui.box.HSKSceneLayers.setExpression(ui.host,'liu','curious');ui.box.HSKSceneLayers.setExpression(ui.host,'an','thinking');until(ui,'model');
 assert.equal(ui.actors.get('xiaoyu').dataset.expression,'speaking');assert.equal(ui.actors.get('liu').dataset.expression,'curious');assert.equal(ui.actors.get('an').dataset.expression,'thinking');
 ui.get('nextBtn').click();assert.equal(ui.actors.get('liu').dataset.expression,'curious');assert.equal(ui.actors.get('an').dataset.expression,'thinking');
});
