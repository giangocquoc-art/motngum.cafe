const test=require('node:test'),assert=require('node:assert/strict');
const C=require('../learning-evidence.js'),L=require('../duong-re/branch-learning.js'),Account=require('../branch-account.js');
const {boot,until}=require('./helpers/branch-ui-fixture.cjs');
const event=(result,attempt,help=[])=>({result,attempt,at:1730000000000+attempt,modality:'typed',help});
test('legacy evidence is described without invented timestamps or assessment modalities',()=>{
 assert.equal(C.status(null),'unassessed');assert.equal(C.status({status:'skipped'}),'skipped');assert.equal(C.status({status:'correct',attempts:1,hint:false}),'self-corrected');assert.equal(C.status({status:'correct',attempts:0,hint:true}),'assisted');
 const old={status:'correct',attempts:0,hint:false};assert.deepEqual(L.clean([old])[0],old);assert.equal(Object.hasOwn(L.clean([old])[0],'evidence'),false);
});
test('attempt history retains mistakes and assistance without answer text or story effects',()=>{
 const first=C.append(null,event('incorrect',1),'1.0.2'),second=C.append(first,event('correct',1,['ai']),'1.0.2');assert.equal(first.events.length,1);assert.equal(second.events.length,2);assert.equal(C.status({status:'correct',hint:false,evidence:second}),'assisted');
 assert.equal(C.append(second,event('correct',1,['ai']),'1.0.2').events.length,2);assert.throws(()=>C.append(second,event('correct',2),'next-version'));
 const cleaned=C.clean({...second,events:[{...event('correct',0),answer:'private',recording:'private'}]});assert.equal(JSON.stringify(cleaned).includes('private'),false);
 assert.throws(()=>C.clean({...second,events:[event('correct',-1)]}));assert.throws(()=>C.clean({...second,events:[event('correct',1,['unknown'])]}));
});
test('objective adapters and account restore preserve actual attempt history',()=>{
 const snapshot=Account.empty();snapshot.learning[0]={status:'correct',attempts:1,hint:true,evidence:C.append(null,event('correct',1,['tiles']),'1.0.2')};const restored=Account.normalize(snapshot);assert.deepEqual(restored,snapshot);
 const objective=L.objectiveEvidence(snapshot.learning);assert.deepEqual(L.fromObjectiveEvidence(objective),snapshot.learning);
 const map=new Map(),storage={getItem:k=>map.get(k)||null,setItem:(k,v)=>map.set(k,v),removeItem:k=>map.delete(k)};Account.apply(storage,snapshot);assert.deepEqual(Account.capture(storage),snapshot);assert.deepEqual(JSON.parse(storage.getItem(L.objectiveStorageKey)),objective);
});
test('wrong and correct submissions are retained through refresh while story route is unchanged',()=>{
 const ui=boot('arrival',0);until(ui,'lesson');const before=ui.values.get(ui.box.AnBranchStory.storageKey);let form=ui.get('content').children.find(c=>c.tagName==='FORM');ui.get('answerInput').value='不对';form.fire('submit');
 const draft=JSON.parse(ui.values.get('chimse-branch-lesson-draft-v1'));assert.equal(draft.evidence.events[0].result,'incorrect');assert.equal(draft.evidence.events[0].at>0,true);
 const refreshed=boot('arrival',0,{seed:{'chimse-branch-lesson-draft-v1':JSON.stringify(draft)}});until(refreshed,'lesson');form=refreshed.get('content').children.find(c=>c.tagName==='FORM');refreshed.get('answerInput').value='我还好';form.fire('submit');
 const record=JSON.parse(refreshed.values.get(L.storageKey))[0];assert.deepEqual(record.evidence.events.map(e=>e.result),['incorrect','correct']);assert.equal(record.hint,true);assert.equal(refreshed.values.get(refreshed.box.AnBranchStory.storageKey),before);assert.equal(record.evidence.events.some(e=>Object.hasOwn(e,'answer')),false);
});
test('newer and malformed evidence cannot be normalized away into independent success',()=>{
 const s=Account.empty();s.learning[0]={status:'correct',attempts:0,hint:false,evidence:{version:2,events:[]}};assert.throws(()=>Account.normalize(s));s.learning[0].evidence={version:1,contentVersion:'1.0.2',events:[event('correct',0,['ai'])]};assert.equal(Account.normalize(s).learning[0].hint,true);
});

test('a partial storage failure restores the old records and draft, with an explicit retry',()=>{
 const ui=boot('arrival',0);until(ui,'lesson');ui.get('answerInput').value='我还好';ui.get('answerInput').fire('input');const keys=[ui.box.AnBranchStory.storageKey,L.storageKey,L.objectiveStorageKey,'chimse-branch-lesson-draft-v1'],before=keys.map(k=>ui.values.get(k));
 const put=ui.box.localStorage.setItem;let fail=true;ui.box.localStorage.setItem=(key,value)=>{if(key===L.objectiveStorageKey&&fail){fail=false;throw Error('quota')}return put(key,value)};
 ui.get('content').children.find(c=>c.tagName==='FORM').fire('submit');assert.equal(ui.phase(),'feedback');assert.deepEqual(keys.map(k=>ui.values.get(k)),before);assert.equal(ui.get('retrySaveBtn').hidden,false);
 ui.get('retrySaveBtn').click();assert.equal(ui.get('retrySaveBtn').hidden,true);assert.equal(JSON.parse(ui.values.get(L.storageKey))[0].evidence.events[0].result,'correct');assert.equal(ui.values.has('chimse-branch-lesson-draft-v1'),false);
});

test('a failed in-progress answer draft stays marked unsaved until retry persists it',()=>{
 const ui=boot('arrival',0);until(ui,'lesson');const key='chimse-branch-lesson-draft-v1',put=ui.box.localStorage.setItem;let fail=true;ui.box.localStorage.setItem=(name,value)=>{if(name===key&&fail){fail=false;throw Error('quota')}return put(name,value)};
 ui.get('answerInput').value='我还好';ui.get('answerInput').fire('input');assert.equal(ui.get('retrySaveBtn').hidden,false);assert.equal(ui.values.has(key),false);
 let prevented=false;ui.box.dispatchEvent({type:'beforeunload',returnValue:null,preventDefault(){prevented=true}});assert.equal(prevented,true,'unsaved answer prevents accidental navigation');
 ui.get('retrySaveBtn').click();assert.equal(ui.get('retrySaveBtn').hidden,true);assert.equal(JSON.parse(ui.values.get(key)).draft,'我还好','retry writes the exact current draft');
});

test('a failed choice-reply marker is atomic with its route and warns before leaving',()=>{
 const ui=boot('arrival',0);until(ui,'lesson');ui.get('answerInput').value=ui.box.HSKContent.scenes[0].answers[0];ui.get('content').children.find(c=>c.tagName==='FORM').fire('submit');ui.get('nextBtn').click();assert.equal(ui.phase(),'choose');const storyKey=ui.box.AnBranchStory.storageKey,replyKey='chimse-branch-pending-reply-v1',before=ui.values.get(storyKey),put=ui.box.localStorage.setItem;let fail=true;
 ui.box.localStorage.setItem=(key,value)=>{if(key===replyKey&&fail){fail=false;throw Error('quota')}return put(key,value)};
 ui.get('nextBtn').click();assert.equal(ui.phase(),'reply');assert.equal(ui.get('retrySaveBtn').hidden,false);assert.equal(ui.values.get(storyKey),before,'route write rolls back when the reply marker cannot be saved');assert.equal(ui.values.has(replyKey),false);
 let prevented=false;const warning={type:'beforeunload',returnValue:null,preventDefault(){prevented=true}};ui.box.dispatchEvent(warning);assert.equal(prevented,true);assert.equal(warning.returnValue,'');
 ui.get('retrySaveBtn').click();assert.equal(ui.get('retrySaveBtn').hidden,true);const saved=ui.values.get(storyKey),marker=JSON.parse(ui.values.get(replyKey));assert.deepEqual(marker,JSON.parse(saved).path,'retry persists the exact selected route and its reaction marker together');
 const refreshed=boot('arrival',0,{seed:{[storyKey]:saved,[replyKey]:ui.values.get(replyKey)}});assert.equal(refreshed.phase(),'reply','reload restores the authored reaction once');
 refreshed.get('nextBtn').click();assert.notEqual(refreshed.phase(),'reply');assert.equal(refreshed.values.has(replyKey),false,'continuing the reaction durably consumes its marker');
 const resumed=boot('arrival',0,{seed:{[storyKey]:refreshed.values.get(storyKey)}});assert.notEqual(resumed.phase(),'reply','a consumed reply does not replay after reload');
});

test('checkpoint journal keeps learned question/answer cues out of the self-recall turn',()=>{
 const ui=boot('day2-bird',7);until(ui,'lesson');ui.get('journalToggle').click();assert.equal(ui.get('journalWords').disabled,true);assert.equal(ui.get('journalReview').disabled,true);const text=ui.get('journalContent').children.map(c=>c.textContent).join(' ');assert.equal(text.includes('十块钱'),false);assert.equal(text.includes('我叫安'),false);for(let i=0;i<50&&!ui.get('journalNext').disabled;i++)ui.get('journalNext').click();const actions=ui.get('journalContent').children.find(c=>c.className==='journal-actions');assert.ok(actions.children.some(c=>c.textContent==='Đọc lại từ đầu'));assert.equal(actions.children.some(c=>c.textContent==='Mở góc ôn'),false);
});

test('damaged local JSON is preserved and offers a recovery copy instead of overwriting the route',()=>{
 const key='hai-que-huong-branching-novel-v1',raw='{ interrupted-save';const ui=boot('arrival',0,{seed:{[key]:raw}});assert.equal(ui.phase(),'save-damaged');assert.equal(ui.get('previousBtn').textContent,'Tải bản sao');ui.get('journalToggle').click();ui.get('retrySaveBtn').click();assert.equal(ui.values.get(key),raw);assert.deepEqual(ui.writes,[]);
});

test('classroom art alias still uses the canonical practice scene for the tutor server',()=>{
 const ui=boot('school-gate',1);let synced;ui.box.ChimSeBranchTutor={sync(value){synced=value}};assert.equal(ui.phase(),'session-recall');ui.get('sessionRecallInput').value='我很好';ui.get('nextBtn').click();until(ui,'lesson');assert.equal(synced.sceneId,'hsk1.e01.school-introduction');assert.equal(synced.available,true);
});

test('Sẻ reacts to difficulty and progress without changing the chosen story',()=>{
 const ui=boot('arrival',0);until(ui,'lesson');const before=ui.values.get(ui.box.AnBranchStory.storageKey),form=ui.get('content').children.find(c=>c.tagName==='FORM');ui.get('answerInput').value='不对';form.fire('submit');assert.equal(ui.actors.get('sparrow').dataset.expression,'worried');ui.get('nextBtn').click();assert.equal(ui.actors.get('sparrow').dataset.expression,'thinking');ui.get('closeHelp').click();ui.get('answerInput').value='我还好';form.fire('submit');assert.equal(ui.actors.get('sparrow').dataset.expression,'happy');assert.equal(ui.values.get(ui.box.AnBranchStory.storageKey),before);
});
