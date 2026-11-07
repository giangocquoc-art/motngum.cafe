const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'../..');

function boot(target,completed,options={}){
 const values=new Map(),elements=new Map(),events={},writes=[],spoken=[];
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
 const box={document,innerHeight:800,localStorage:{getItem(key){return values.has(key)?values.get(key):null},setItem(key,value){writes.push(['set',key]);values.set(key,String(value))},removeItem(key){writes.push(['remove',key]);values.delete(key)}},location:{href:'',reload(){}},setTimeout(){return 1},clearTimeout(){},Event:class{constructor(type){this.type=type}},confirm(){return true},speechSynthesis:{cancel(){},speak(utterance){spoken.push(utterance.text)}},SpeechSynthesisUtterance:function(text){this.text=text;}};
 box.window=box;box.globalThis=box;box.addEventListener=(type,fn)=>(events[type]??=[]).push(fn);box.dispatchEvent=event=>(events[event.type]||[]).forEach(fn=>fn(event));
 function load(file){vm.runInNewContext(fs.readFileSync(path.join(root,file),'utf8'),box,{filename:file});}
 for(const file of ['curriculum-data.js','content-manifest.js','game-core.js','learning-kit.js','story-beats.js','learning-evidence.js','story-session-plan.js','scene-flat-art.js','scene-manifest.js','scene-renderer.js','duong-re/branch-data.js','duong-re/branch-engine.js','duong-re/branch-learning.js','duong-re/branch-scenes.js','duong-re/session-recall.js'])load(file);
 const E=box.AnBranchEngine,L=box.ChimSeBranchLearning;let state=E.fresh();
 for(let guard=0;state.node!==target&&guard<50;guard++){
  const scene=E.data.byId[state.node],available=E.availableOptions(scene,state),preferred=options.choices&&options.choices[state.node],choice=scene.kind==='choice'?(available.some(item=>item.id===preferred)?preferred:available[0].id):'next',result=E.step(state,choice);assert.equal(result.ok,true,result.error);state=result.state;
 }
 assert.equal(state.node,target,'test route reaches its authored lesson anchor');
 values.set(E.data.storageKey,E.exportSave(state));values.set(L.storageKey,JSON.stringify(Array.from({length:L.total},(_,index)=>(Array.isArray(completed)?completed.includes(index):index<completed)?{status:'correct',attempts:0,hint:false}:null)));
 const seed=typeof options.seed==='function'?options.seed({state,box}):options.seed||{};for(const [key,value] of Object.entries(seed))values.set(key,value);
 load('duong-re/branch-ui.js');
 return {box,values,writes,spoken,actors,host,get:id=>document.getElementById(id),phase:()=>document.getElementById('branchShell').dataset.phase};
}
function until(ui,phase){for(let guard=0;ui.phase()!==phase&&guard<30;guard++)ui.get('nextBtn').click();assert.equal(ui.phase(),phase);}
module.exports={boot,until};
