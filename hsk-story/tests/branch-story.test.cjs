const test=require("node:test");const assert=require("node:assert/strict");const fs=require("node:fs");const path=require("node:path");
const vm=require("node:vm");const sandbox={};sandbox.globalThis=sandbox;vm.runInNewContext(fs.readFileSync(path.join(__dirname,"../duong-re/branch-data.js"),"utf8"),sandbox,{filename:"branch-data.js"});vm.runInNewContext(fs.readFileSync(path.join(__dirname,"../duong-re/branch-engine.js"),"utf8"),sandbox,{filename:"branch-engine.js"});const data=sandbox.AnBranchStory;const E=sandbox.AnBranchEngine;
function act(s,id){const r=E.step(s,id);assert.equal(r.ok,true,id+": "+r.error);return r.state;}
function passage(s){return act(s,"next");}
function play(choices){let s=E.fresh();while(!s.done){let n=data.byId[s.node];if(n.kind==="passage"){s=passage(s);continue;}const id=choices[n.id]||n.options[0].id;s=act(s,id);}return s;}
test("full graph connected, no loops, every route retains canonical story landmarks",()=>{const r=E.validate();assert.deepEqual(Array.from(r.errors),[]);assert.equal(r.branchNodes,8);assert.equal(r.decisionSequences,4374);assert.equal(r.nodeCount,23);});
test("all three personality outcomes are available through independent decision paths",()=>{
const brave=play({"arrival":"look-around","school-gate":"ask-friend","lost-diary":"teacher-search","staff-office":"say-clearly","canteen":"sit-friend","noodle-order":"mild","walk-home":"tell-mother","night":"write-promise"});
const care=play({"arrival":"hold-mother","school-gate":"ask-friend","lost-diary":"friend-search","staff-office":"say-simple","canteen":"help-liu","noodle-order":"share-bowl","walk-home":"invite-friend","night":"write-people"});
const wonder=play({"arrival":"look-around","school-gate":"watch-first","lost-diary":"solo-search","staff-office":"ask-again","canteen":"read-menu","noodle-order":"try-hot","walk-home":"keep-secret","night":"write-question"});
assert.equal(E.ending(brave).key,"courage");assert.equal(E.ending(care).key,"empathy");assert.equal(E.ending(wonder).key,"curiosity");
assert.notDeepEqual(brave.relationships,care.relationships);assert.notDeepEqual(care.flags,wonder.flags);
});
test("divergent dialogue alters future memory, not merely text at current choice",()=>{
let a=act(E.fresh(),"look-around");a=passage(a);a=act(a,"ask-friend");a=passage(a);
let b=act(E.fresh(),"hold-mother");b=passage(b);b=act(b,"ask-teacher");b=passage(b);
assert.equal(a.node,"lost-diary");assert.equal(b.node,"lost-diary");
assert.notDeepEqual(E.conditionText(data.byId["lost-diary"],a),E.conditionText(data.byId["lost-diary"],b));
assert.equal(a.flags["ask-friend"],true);assert.equal(b.flags["ask-teacher"],true);
assert.notDeepEqual(a.traits,b.traits);assert.notDeepEqual(a.relationships,b.relationships);
});
test("typed Hanzi recognizes curated variations, rejects unrecognized input, no forced answer",()=>{
const s=data.byId["school-gate"];assert.equal(E.resolveTyped(s,"老师，可以帮帮我吗？").id,"ask-teacher");assert.equal(E.resolveTyped(s,"老师帮帮我").id,"ask-teacher");
assert.equal(E.resolveTyped(s,"我今天想去公园"),null);assert.equal(E.resolveTyped(s,"hello"),null);assert.equal(E.resolveTyped(s,""),null);
assert.equal(E.resolveTyped(data.byId["epilogue"],"我叫安"),null);
});
test("branch choice not replayable from another node; invalid selections never mutate input",()=>{
const s=E.fresh(),snapshot=JSON.stringify(s);assert.equal(E.step(s,"noodle-order").ok,false);assert.equal(JSON.stringify(s),snapshot);const t=act(s,"look-around");assert.equal(E.step(t,"hold-mother").ok,false);
});
test("save stores only ordered decisions; forged personality and relationship scores ignored",()=>{
const s=play({"arrival":"hold-mother","school-gate":"ask-teacher","lost-diary":"teacher-search"});const saved=JSON.parse(E.exportSave(s));
assert.deepEqual(Object.keys(saved).sort(),["path","version"]);saved.traits={courage:100};saved.relationships={mother:100};saved.flags={madeUp:true};
const loaded=E.load(JSON.stringify(saved));assert.deepEqual(loaded,s);assert.equal(loaded.flags.madeUp,undefined);
});
test("corrupt or future-version saves fail safe; invalid steps preserve valid prefix",()=>{
assert.deepEqual(E.load("{broken"),E.fresh());assert.deepEqual(E.load('{"version":2,"path":[]}'),E.fresh());
let partial=E.load({version:1,path:[{at:"arrival",choice:"hold-mother"},{at:"another",choice:"anything"}]});assert.equal(partial.node,"arrival-mother");assert.equal(partial.path.length,1);
});
test("all six story relationships/canonical stages in every ending, no dead ends",()=>{
const prefixes=["school-gate","lost-diary","staff-office","canteen","noodle-order","walk-home","night"];
let count=0;function explore(s){if(s.done){const visited=s.path.map(x=>x.at);prefixes.forEach(x=>assert.ok(visited.includes(x),x));count++;return;}const scene=data.byId[s.node];if(scene.kind==="passage")explore(act(s,"next"));else scene.options.forEach(o=>explore(act(s,o.id)));}
explore(E.fresh());assert.equal(count,4374);
});
test("branch storage namespace and UI source never touch existing progress keys",()=>{
assert.equal(data.storageKey,"hai-que-huong-branching-novel-v1");
const content=fs.readFileSync(path.join(__dirname,"../duong-re/branch-ui.js"),"utf8");
assert.ok(content.includes("data.storageKey"));assert.ok(!content.includes("hai-que-huong-progress-v3"));assert.ok(!content.includes("hai-que-huong-intro-v1"));assert.ok(!content.includes("localStorage.clear"));
});
