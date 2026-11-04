const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const E=require('../duong-re/branch-engine.js'),L=require('../duong-re/branch-learning.js');
const routeKey=E.data.storageKey,objectiveKey=L.objectiveStorageKey;

function boot(seed={},options={}){
 const values=new Map(Object.entries(seed)),writes=[],elements=new Map(),events={};let reloads=0;
 function element(id){
  const listeners={},node={id,tagName:'DIV',dataset:{},disabled:false,children:[],textContent:'',clientHeight:160,scrollHeight:20,open:false,classList:{toggle(){}},style:{setProperty(){}},setAttribute(){},focus(){},addEventListener(name,fn){(listeners[name]??=[]).push(fn)},append(...children){this.children.push(...children)},replaceChildren(...children){this.children=children;this.textContent=''},showModal(){this.open=true},close(){this.open=false;(listeners.close||[]).forEach(fn=>fn({}))},click(){if(!this.disabled)(listeners.click||[]).forEach(fn=>fn({}))}};
  Object.defineProperty(node,'childElementCount',{get(){return this.children.length}});return node;
 }
 const document={documentElement:{style:{setProperty(){}}},body:{classList:{toggle(){}}},activeElement:{tagName:'BODY'},getElementById(id){if(!elements.has(id))elements.set(id,element(id));return elements.get(id)},createElement(tag){const item=element('generated');item.tagName=tag.toUpperCase();return item},querySelector(){return null},addEventListener(){}};
 const context={AnBranchEngine:E,AnBranchStory:E.data,ChimSeBranchLearning:L,ChimSeBranchScenes:{id(){return 'hsk1.e01.mother-check-in'},lessonId(){return 'hsk1.e01.mother-check-in'}},HSKContent:require('../content-manifest.js'),HSKCurriculum:require('../curriculum-data.js'),HSKSceneLayers:{mount(){},react(){}},document,innerHeight:800,localStorage:{getItem(key){return values.has(key)?values.get(key):null},setItem(key,value){writes.push(['set',key]);if(options.blockWrites)throw Error('storage unavailable');values.set(key,String(value))},removeItem(key){writes.push(['remove',key]);if(options.blockWrites)throw Error('storage unavailable');values.delete(key)}},location:{href:'',reload(){reloads++}},setTimeout(){return 1},clearTimeout(){},Event:class{constructor(type){this.type=type}},confirm(){return true}};
 context.window=context;context.addEventListener=(name,fn)=>(events[name]??=[]).push(fn);context.dispatchEvent=event=>(events[event.type]||[]).forEach(fn=>fn(event));
 vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../duong-re/branch-ui.js'),'utf8'),context,{filename:'branch-ui.js'});
 return {context,values,writes,element:id=>document.getElementById(id),emit:(type,event={})=>(events[type]||[]).forEach(fn=>fn(event)),reloads:()=>reloads};
}

test('newer story and evidence envelopes are recognized without interpreting or changing their bytes',()=>{
 for(const source of [' { "version": 2, "path": [{"at":"future","choice":"unknown"}], "newField": true } ',{schemaVersion:3,records:[{future:true}]},[{status:'correct',attempts:0,hint:false,version:2}],{version:1,path:[{at:'arrival',choice:'hold-mother',schemaVersion:2}]},{version:1,learning:[{version:2}]}]){
  const before=typeof source==='string'?source:JSON.stringify(source);
  assert.equal(E.isNewerSave(source),true);E.load(source);
  assert.equal(typeof source==='string'?source:JSON.stringify(source),before);
 }
 for(const source of [null,'{broken',E.exportSave(E.fresh()),[],{version:'2'},{version:0}])assert.equal(E.isNewerSave(source),false);
 let deep={version:2};for(let i=0;i<12000;i++)deep=[deep];assert.equal(E.isNewerSave(deep),true);
 const cyclic=[];cyclic.push(cyclic);assert.equal(E.isNewerSave(cyclic),false);
});

test('a newer local route or learning record opens recovery controls and preserves every saved byte',()=>{
 for(const key of [routeKey,L.storageKey,objectiveKey,'chimse-branch-lesson-draft-v1','chimse-branch-pending-reply-v1','chimse-branch-pending-feedback-v1']){
  const future=' { "version": 2, "newField": "keep exactly" }\n',canonical='legacy HSK save remains untouched',seed={[routeKey]:E.exportSave(E.fresh()),[L.storageKey]:JSON.stringify(L.clean(null)),[objectiveKey]:JSON.stringify(L.objectiveEvidence(null)),[key]:future,'hai-que-huong-progress-v3':canonical},ui=boot(seed),before=Array.from(ui.values);
  assert.equal(ui.element('branchShell').dataset.phase,'save-newer',key);
  assert.match(ui.element('content').children[0].textContent,/giữ nguyên/);
  assert.equal(ui.element('journalToggle').disabled,true);
  ui.element('nextBtn').click();assert.equal(ui.reloads(),1);
  ui.element('previousBtn').click();assert.equal(ui.context.location.href,'/');
  assert.deepEqual(Array.from(ui.values),before,key+' must remain byte-for-byte intact');assert.deepEqual(ui.writes,[]);
 }
});

test('a newer save arriving from another tab or account restore freezes an already running view',()=>{
 for(const type of ['storage','chimse-branch-restored']){
  const ui=boot(),future='{"version":3,"path":[{"at":"a-new-story","choice":"later"}]}';
  assert.equal(ui.element('branchShell').dataset.phase,'read');
  ui.values.set(routeKey,future);ui.emit(type,{key:routeKey});
  assert.equal(ui.element('branchShell').dataset.phase,'save-newer');
  ui.element('nextBtn').click();ui.element('journalToggle').click();
  assert.equal(ui.values.get(routeKey),future);assert.deepEqual(ui.writes,[]);
 }
});

test('the next interaction also detects newer data when no storage event was delivered',()=>{
 const cases=[[objectiveKey,'{"schemaVersion":2,"objectives":{"new-goal":[]}}'],[L.storageKey,'[{"status":"correct","attempts":0,"hint":false,"version":2}]'],[routeKey,'{"version":1,"path":[{"at":"arrival","choice":"hold-mother","version":2}]}']];
 for(const [key,future] of cases){const ui=boot();ui.values.set(key,future);ui.element('nextBtn').click();
  assert.equal(ui.element('branchShell').dataset.phase,'save-newer');assert.equal(ui.values.get(key),future);assert.deepEqual(ui.writes,[]);
 }
});

test('current saves still reach and persist a story choice through the normal UI',()=>{
 const seed=JSON.stringify(L.clean([{status:'correct',attempts:0,hint:false}])),ui=boot({[L.storageKey]:seed});
 for(let n=0;n<12&&ui.element('branchShell').dataset.phase!=='choose';n++)ui.element('nextBtn').click();
 assert.equal(ui.element('branchShell').dataset.phase,'choose');ui.element('nextBtn').click();
 const restored=E.load(ui.values.get(routeKey));assert.equal(restored.path.length,1);assert.equal(ui.element('branchShell').dataset.phase,'reply');
 assert.equal(restored.journal.length,1);assert.equal(ui.values.get(L.storageKey),seed);
});

test('unavailable storage still permits in-memory story play when the saved format is supported',()=>{
 const ui=boot({[L.storageKey]:JSON.stringify(L.clean([{status:'correct',attempts:0,hint:false}]))},{blockWrites:true});
 for(let n=0;n<12&&ui.element('branchShell').dataset.phase!=='choose';n++)ui.element('nextBtn').click();
 ui.element('nextBtn').click();assert.equal(ui.element('branchShell').dataset.phase,'reply');assert.equal(ui.values.has(routeKey),false);
});
