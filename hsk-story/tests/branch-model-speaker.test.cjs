const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');

function boot(target,completed){
 const values=new Map(),elements=new Map(),events={};
 function element(tag,id){
  const listeners={},node={tagName:tag.toUpperCase(),dataset:{},children:[],textContent:'',value:'',disabled:false,clientHeight:160,scrollHeight:20,style:{setProperty(){}},classList:{add(){},toggle(){}},setAttribute(){},focus(){},addEventListener(type,fn){(listeners[type]??=[]).push(fn)},append(...children){this.children.push(...children)},replaceChildren(...children){this.children=children;this.textContent=''},showModal(){this.open=true},close(){this.open=false;this.fire('close')},fire(type){for(const fn of listeners[type]||[])fn({preventDefault(){}})},click(){if(!this.disabled)this.fire('click')}};
  let key=id;Object.defineProperty(node,'id',{get(){return key},set(value){key=value;elements.set(value,node)}});if(id)elements.set(id,node);
  return node;
 }
 const document={documentElement:{style:{setProperty(){}}},body:{classList:{toggle(){}}},activeElement:{tagName:'BODY'},getElementById(id){return elements.get(id)||element('div',id)},createElement(tag){return element(tag)},querySelector(){return null},addEventListener(){}};
 const actors=new Map(),host=document.getElementById('branchArt');let markup='';
 Object.defineProperty(host,'innerHTML',{get(){return markup},set(value){markup=value;actors.clear();for(const match of value.matchAll(/<div class="(?:cs-actor|cs-sparrow[^"]*)" data-character="([^"]+)" data-sprite="([^"]+)" data-expression="([^"]+)"/g))actors.set(match[1],{dataset:{character:match[1],sprite:match[2],expression:match[3]},innerHTML:'',style:{}})}});
 host.querySelector=selector=>selector==='.cs-sparrow'?actors.get('sparrow')||null:actors.get(/data-character="([^"]+)"/.exec(selector)?.[1])||null;
 host.querySelectorAll=selector=>selector==='.cs-actor'?Array.from(actors.values()).filter(actor=>actor.dataset.character!=='sparrow'):[];
 const box={document,innerHeight:800,localStorage:{getItem(key){return values.has(key)?values.get(key):null},setItem(key,value){values.set(key,String(value))},removeItem(key){values.delete(key)}},location:{href:'',reload(){}},setTimeout(){return 1},clearTimeout(){},Event:class{constructor(type){this.type=type}},confirm(){return true}};
 box.window=box;box.globalThis=box;box.addEventListener=(type,fn)=>(events[type]??=[]).push(fn);box.dispatchEvent=event=>(events[event.type]||[]).forEach(fn=>fn(event));
 function load(file){vm.runInNewContext(fs.readFileSync(path.join(root,file),'utf8'),box,{filename:file});}
 for(const file of ['curriculum-data.js','content-manifest.js','game-core.js','learning-kit.js','scene-flat-art.js','scene-manifest.js','scene-renderer.js','duong-re/branch-data.js','duong-re/branch-engine.js','duong-re/branch-learning.js','duong-re/branch-scenes.js'])load(file);
 const E=box.AnBranchEngine,L=box.ChimSeBranchLearning;let state=E.fresh();
 for(let guard=0;state.node!==target&&guard<50;guard++){
  const scene=E.data.byId[state.node],choice=scene.kind==='choice'?E.availableOptions(scene,state)[0].id:'next',result=E.step(state,choice);assert.equal(result.ok,true,result.error);state=result.state;
 }
 assert.equal(state.node,target,'test route reaches its authored lesson anchor');
 values.set(E.data.storageKey,E.exportSave(state));values.set(L.storageKey,JSON.stringify(Array.from({length:L.total},(_,index)=>index<completed?{status:'correct',attempts:0,hint:false}:null)));
 load('duong-re/branch-ui.js');
 return {box,values,actors,host,get:id=>document.getElementById(id),phase:()=>document.getElementById('branchShell').dataset.phase};
}
function until(ui,phase){for(let guard=0;ui.phase()!==phase&&guard<30;guard++)ui.get('nextBtn').click();assert.equal(ui.phase(),phase);}

test('the noodle thanks model belongs to Tiểu Vũ and restores his expression before bà Lưu resumes',()=>{
 const ui=boot('walk-home',5),C=ui.box.HSKContent,L=ui.box.ChimSeBranchLearning;
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
