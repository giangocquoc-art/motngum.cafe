const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const box={module:{exports:{}}};vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../story-beats.js'),'utf8'),box);
const B=box.module.exports;
const contentBox={module:{exports:{}}};vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../content-manifest.js'),'utf8'),contentBox);const Content=contentBox.module.exports;
test('narrative pages and the contextual price pair are localized and stay before checkpoints',()=>{assert.equal(B.validate(10,7).join(''),'');assert.equal(B.beats.length,7);for(const beat of B.beats){const resolved=B.resolve(beat,Content);assert.ok(resolved.zh&&resolved.py&&resolved.vi&&resolved.story)}});
test('noodle-shop interlude describes the place already shown by its scene',()=>{const b=B.beats.find(x=>x.id==='lunch');assert.equal(b.zh,'安和小雨在面馆里。');assert.match(b.vi,/đang ở trong quán mì/);assert.match(b.story,/quán mì nhỏ cuối ngõ/)});
test('walk-home interlude sets up the invitation without pre-empting its dialogue or farewell',()=>{const b=B.beats.find(x=>x.id==='way-home');const scene=Content.scenes[6];const reply=Content.replies[6];assert.equal(b.zh,'安和小雨一起回家。');assert.equal(b.vi,'An và Tiểu Vũ cùng đi về.');assert.doesNotMatch(b.zh,/明天见/);assert.match(scene.zh,/明天一起上学/);assert.match(reply.zh,/明天见/)});
test('first arrival is unscored story moment',()=>assert.equal(B.pending(0,[]).id,'arrival'));
test('arrival establishes place, notebook, and mother check-in without pretending the answer was already taught',()=>{const b=B.beats.find(x=>x.id==='arrival');assert.equal(b.zh,'我们到了。');assert.equal(b.py,'Wǒmen dào le.');assert.match(b.vi,/tới nơi rồi/i);assert.match(b.story,/Thành Đô/);assert.match(b.story,/quai cặp/);assert.match(b.story,/Quyển sổ.*trong cặp/);assert.match(b.story,/Mẹ.*hỏi thăm/);assert.doesNotMatch(b.story,/nhớ câu trả lời|câu trả lời.*đã ghi/)});
test('acknowledged page stays acknowledged',()=>{const x=B.mark([],'arrival');assert.equal(B.pending(0,x),null);assert.equal(B.mark(x,'arrival').length,1)});
test('invalid browser event cannot unlock page',()=>assert.throws(()=>B.mark([],'forged')));
test('V5 progress migration does not skip unseen current story page',()=>{const x=B.migrate(undefined,4,[{status:'correct'},{status:'correct'},{status:'correct'},{status:'correct'}],false);assert.ok(x.includes('arrival'));assert.ok(x.includes('gate'));assert.ok(!x.includes('lunch'))});
test('V6 save retains explicit story pages',()=>{const x=B.migrate(['arrival'],2,[{status:'correct'}],false);assert.equal(B.pending(0,x),null);assert.equal(B.pending(1,x).id,'gate')});

test('price question is met before its recall and the response comes from the actual payment scene',()=>{
 const lead=B.dialogueFor(5),question=B.pending(5,[]);assert.equal(lead,question);assert.equal(lead.speakerCharacter,'xiaoyu');
 assert.equal(lead.zh,Content.scenes[8].zh);assert.equal(lead.py,Content.scenes[8].py);assert.ok(lead.before<Content.scenes[8].id);
 assert.ok(Content.scenes[8].answers.every(answer=>!lead.zh.includes(answer)),'the question itself does not supply the price');
 const heard=B.mark([],lead.id),raw=B.pending(5,heard),before=JSON.stringify(raw),response=B.resolve(raw,Content);
 assert.equal(raw.kind,'scene-dialogue');assert.equal(raw.sourceSceneId,5);assert.equal(Object.hasOwn(raw,'zh'),false,'the payment wording has one authored source');
 for(const key of ['zh','py','vi','speaker','speakerCharacter'])assert.equal(response[key],Content.scenes[5][key]);
 assert.equal(response.speakerCharacter,'liu');assert.equal(JSON.stringify(raw),before);
 assert.equal(B.pending(5,B.mark(heard,response.id)),null);assert.equal(B.dialogueFor(8),null,'recall does not reopen this price dialogue');
 assert.throws(()=>B.resolve(raw,{scenes:[]}),/complete source scene/);
});

test('new price dialogue migration preserves current drafts and does not replay completed lessons',()=>{
 const legacy=['arrival','gate','lunch'],history=Array.from({length:5},()=>({status:'correct',hint:false,attempts:0})),snapshot=JSON.stringify({legacy,history});
 const active=B.migrate(legacy,5,history,false);assert.equal(B.pending(5,active).id,'noodle-price-question');
 const questionRead=B.mark(active,'noodle-price-question');assert.equal(B.pending(5,B.migrate(questionRead,5,history,false)).id,'noodle-price-response');
 const completed=history.concat([{status:'correct',hint:true,attempts:1}]);
 assert.equal(B.pending(5,B.migrate(legacy,5,completed,false)),null);
 for(const args of [[legacy,6,completed,false],[legacy,9,completed,true]]){const seen=B.migrate(...args);assert.ok(seen.includes('noodle-price-question')&&seen.includes('noodle-price-response'));}
 assert.equal(JSON.stringify({legacy,history}),snapshot);
});
