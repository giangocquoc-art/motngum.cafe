const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),vm=require("node:vm"),path=require("node:path");
const dir=path.resolve(__dirname,"..");
function load(f){const scope={module:{exports:{}}};vm.runInNewContext(fs.readFileSync(path.join(dir,f),"utf8"),scope,{filename:f});return scope.module.exports}
const Graph=load("story-graph.js"),Runtime=load("story-runtime.js");
const base={v:3,step:2,sceneRef:Graph.idAt(2),history:[{status:"correct",attempts:0,hint:false},{status:"correct",attempts:0,hint:false}],storyChoices:{friendship:"sit"},storyBeats:["arrival","gate"],encounter:{stage:"inspect"},worldSeen:{},skillSampler:{status:"pending"},draft:"我是学生"};
const bytes=x=>JSON.stringify(x);
function storage(){const map=new Map;return {getItem:k=>map.get(k)||null,setItem:(k,v)=>map.set(k,v),map}}
test("Graph now drives HSK1 progression by stable IDs, never by incrementing integer index",()=>{
 for(let i=0;i<9;i++){
  const p=Runtime.advance(Graph.idAt(i),{solved:true},Graph);
  assert.equal(p.ok,true);assert.equal(p.done,false);assert.equal(p.sceneRef,Graph.idAt(i+1));
 }
 assert.equal(Runtime.advance(Graph.idAt(9),{solved:true},Graph).done,true);
});
test("Every required story gate rejects transitions independently",()=>{
 const scene=Graph.idAt(4);
 for(const key of ["encounter","interlude","choice","sampler"]){
  const p=Runtime.advance(scene,{solved:true,[key]:true},Graph);
  assert.equal(p.ok,false);assert.equal(p.reason,key);assert.equal(p.sceneRef,scene);
 }
 assert.equal(Runtime.advance(scene,{solved:false},Graph).reason,"unsolved");
 assert.throws(()=>Runtime.advance("hsk5.graduation",{solved:true},Graph));
});
test("V4 snapshot is a derived shadow of *exact* V3 bytes and carries stable IDs",()=>{
 const input=bytes(base),v4=Runtime.shadow(base,input,Graph);
 assert.equal(v4.v,4);assert.equal(v4.storyId,"hsk1.e01");assert.equal(v4.sceneRef,Graph.idAt(2));
 assert.equal(v4.sceneIndex,2);assert.equal(v4.pending.draft,"我是学生");
 assert.equal(Runtime.validateShadow(v4,input,Graph),true);
 assert.equal(Runtime.validateShadow(v4,input+" ",Graph),false);
 assert.equal(Runtime.validateShadow({...v4,sceneRef:"forged"},input,Graph),false);
});
test("Tampering with sceneRef or legacy step cannot silently migrate",()=>{
 const s={...base,sceneRef:Graph.idAt(5)};assert.throws(()=>Runtime.shadow(s,bytes(s),Graph));
 const s2={...base,step:22,sceneRef:"invalid"};assert.throws(()=>Runtime.shadow(s2,bytes(s2),Graph));
});
test("V3 is always readable if V4 shadow is absent, stale, malformed, or storage disallows writes",()=>{
 const x=storage(),input=bytes(base);x.setItem("hai-que-huong-progress-v3",input);
 assert.equal(Runtime.readShadow(x,"hai-que-huong-progress-v3",Graph),null);
 assert.equal(Runtime.writeShadow(x,base,input,Graph),true);
 assert.equal(Runtime.readShadow(x,"hai-que-huong-progress-v3",Graph).sceneRef,Graph.idAt(2));
 const changed={...base,step:3,sceneRef:Graph.idAt(3)};
 x.setItem("hai-que-huong-progress-v3",bytes(changed));
 assert.equal(Runtime.readShadow(x,"hai-que-huong-progress-v3",Graph),null);
 assert.equal(x.getItem("hai-que-huong-progress-v3"),bytes(changed));
 const deny={getItem:x.getItem,setItem(){throw Error("quota exceeded")}};
 assert.equal(Runtime.writeShadow(deny,changed,bytes(changed),Graph),false);
});
test("History, memory, draft and assisted state are preserved in shadow, independently of skill evidence",()=>{
 const payload={...base,encounter:{stage:"outcome",answer:"helped"},skillSampler:{status:"legacy"},worldSeen:{"hsk1.e01.walk-home":["tree"]}};
 const sh=Runtime.shadow(payload,bytes(payload),Graph);
 assert.equal(sh.memory.encounter.answer,"helped");
 assert.equal(sh.evidence.skillSampler.status,"legacy");
 assert.equal(sh.memory.worldSeen["hsk1.e01.walk-home"][0],"tree");
 assert.equal(sh.progress.history.length,2);
});
