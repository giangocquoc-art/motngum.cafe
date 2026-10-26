const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),vm=require("node:vm"),path=require("node:path");
const base=path.resolve(__dirname,"..");
function load(file){const box={module:{exports:{}}};vm.runInNewContext(fs.readFileSync(path.join(base,file),"utf8"),box,{filename:file});return box.module.exports}
const Art=load("scene-art.js"),IO=load("save-io.js"),Graph=load("story-graph.js"),Runtime=load("story-runtime.js"),Content=load("content-manifest.js"),World=load("scene-world.js");
function hash(str){let h=2166136261>>>0;for(let i=0;i<str.length;i++)h=Math.imul((h^str.charCodeAt(i))>>>0,16777619)>>>0;return h.toString(16).padStart(8,"0")}
const golden={street:"69e404ab",school:"a39270b2",class:"dce545ad",canteen:"0483d51c",exam:"782e06a0",festival:"734b1f7e",graduation:"69c74982"};
test("Gate 4 extracted scene SVGs exactly match unchanged old fallback visuals",()=>{
 for(const [place,digest] of Object.entries(golden)){
  const svg=Art.render(place,false);
  assert.equal(hash(svg),digest,"unexpected art change: "+place);
  assert.equal(svg,Art.render(place,true),"thumb mode must preserve source");
  assert.match(svg,/^<svg viewBox="0 0 1200 620"/);
 }
 assert.ok(Art.render("canteen",false).includes("svg"));
});
test("Gate 4 save adapter uses explicit graph dependency, keeps exact legacy key and V4 shadow",()=>{
 const state={step:1,history:[{status:"correct",attempts:0,hint:false}],done:false,pinyin:true,vi:true,draft:"你好",attempts:0,hintUsed:false,examHelp:false,storyChoices:{friendship:"help"},storyBeats:["arrival"],vocabSeen:[0],encounter:{stage:"inspect"},encounterDraft:"",worldSeen:{},worldFocus:{},skillSampler:{status:"pending"},practiceOpen:false};
 let entries={};const storage={getItem:k=>entries[k]??null,setItem:(k,v)=>entries[k]=v};
 const saved=IO.persist(storage,"hai-que-huong-progress-v3",state,Graph,Runtime);
 assert.equal(saved.legacySaved,true);assert.equal(saved.shadowSaved,true);
 const v3=IO.readSafe(storage,"hai-que-huong-progress-v3");
 const v4=IO.readSafe(storage,"hai-que-huong-progress-v4");
 assert.equal(v3.v,3);assert.equal(v3.sceneRef,Graph.idAt(1));
 assert.equal(v3.draft,"你好");
 assert.equal(v4.v,4);assert.equal(Runtime.validateShadow(v4,entries["hai-que-huong-progress-v3"],Graph),true);
 assert.deepEqual(JSON.parse(JSON.stringify(IO.snapshot(state,Graph))),JSON.parse(entries["hai-que-huong-progress-v3"]));
});
test("Gate 4 invalid V4 / storage quota cannot corrupt an already saved V3",()=>{
 const state={step:0,history:[],worldSeen:{},worldFocus:{}};
 const saved={};
 const storage={getItem:k=>saved[k]??null,setItem(k,v){if(k==="hai-que-huong-progress-v4")throw Error("Quota exceeded");saved[k]=v}};
 const outcome=IO.persist(storage,"hai-que-huong-progress-v3",state,Graph,Runtime);
 assert.equal(outcome.legacySaved,true);
 assert.equal(outcome.shadowSaved,false);
 assert.equal(JSON.parse(saved["hai-que-huong-progress-v3"]).sceneRef,Graph.idAt(0));
 const broken={getItem(){throw Error("SecurityError")}};
 assert.equal(IO.readSafe(broken,"hai-que-huong-progress-v3"),null);
});
test("Gate 4 loading order: scene art and save I/O before app.js, no unused editor drafts in browser",()=>{
 const html=fs.readFileSync(path.join(base,"index.html"),"utf8");
 const scripts=[...html.matchAll(/<script[^>]*src="([^"]+)"[^>]*>/g)].map(m=>m[1]);
 for(const name of ["/scene-art.js","/save-io.js"]){assert.ok(scripts.includes(name));assert.ok(scripts.indexOf(name)<scripts.indexOf("/app.js"))}
 assert.equal(scripts.filter(p=>p==="/app.js").length,1);
 assert.ok(!scripts.includes("/future-acts.js")&&!scripts.includes("/learning-blueprint.js"));
});
test("Gate 4 no fake HSK2–5 content should be keyboard button; only the demo HSK1 is actionable",()=>{
 const source=fs.readFileSync(path.join(base,"app.js"),"utf8");
 assert.ok(source.includes('if(c.lvl===1){item.tabIndex=0;item.role="button"'));
 assert.ok(source.includes('else{item.setAttribute("aria-disabled","true")'));
 assert.ok(source.includes('CHƠI BẢN DEMO'));
});
test("Gate 4 never treats merely reaching an intro page as confirmed glyph interaction",()=>{
 const unobserved={maxReached:8,discovered:[],momRevealed:false,lightParts:[]};
 assert.equal(World.introSawGlyph({zi:"木",from:"intro",page:2},unobserved),false);
 assert.equal(World.introSawGlyph({zi:"日",from:"intro",page:4},unobserved),false);
 assert.equal(World.introSawGlyph({zi:"妈",from:"intro",page:5},unobserved),false);
 assert.equal(World.introSawGlyph({zi:"明",from:"intro",page:4},unobserved),false);
 assert.equal(World.introSawGlyph({zi:"木",from:"intro",page:2},{...unobserved,discovered:["木"]}),true);
 assert.equal(World.introSawGlyph({zi:"日",from:"intro",page:4},{...unobserved,lightParts:["日"]}),true);
 assert.equal(World.introSawGlyph({zi:"月",from:"intro",page:4},{...unobserved,lightParts:["月"]}),true);
 assert.equal(World.introSawGlyph({zi:"妈",from:"intro",page:5},{...unobserved,momRevealed:true}),true);
 assert.equal(World.introSawGlyph({zi:"明",from:"intro",page:4},{...unobserved,lightParts:["日","月"]}),true);
 const note=World.describe(Graph.idAt(6),"tree",{},unobserved);
 assert.ok(!note.bridgeText.includes("Bạn từng nhìn thấy"));
 assert.ok(note.bridgeText.includes("Một chữ/cụm chữ"));
});
