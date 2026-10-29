const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const dir=path.join(__dirname,"../duong-re");
const sandbox={};sandbox.globalThis=sandbox;
for(const file of ["branch-data.js","branch-engine.js"])vm.runInNewContext(fs.readFileSync(path.join(dir,file),"utf8"),sandbox,{filename:file});
const D=sandbox.AnBranchStory,E=sandbox.AnBranchEngine,A=sandbox.AnBranchPortraits;
function next(s,choice){const r=E.step(s,choice);assert.equal(r.ok,true,s.node+" → "+choice+": "+r.error);return r.state}
function go(choices,stop){let s=E.fresh(),guard=0;while(!s.done&&s.node!==stop){if(++guard>60)throw Error("Loop at "+s.node);const n=D.byId[s.node],list=E.availableOptions(n,s),choice=n.kind==="choice"?(choices[n.id]||list[0]?.id):"next";if(!choice)throw Error("No unlocked option at "+s.node);s=next(s,choice);}return s}
const BRAVE={"arrival":"look-around","school-gate":"ask-friend","lost-diary":"teacher-search","staff-office":"say-clearly","canteen":"sit-friend","noodle-order":"mild","walk-home":"tell-mother","night":"write-promise","day2-breakfast":"morning-ready","day2-bird":"bird-teacher","day2-liu":"liu-help","day2-night":"day2-letter-brave"};
const CARE={"arrival":"hold-mother","school-gate":"ask-friend","lost-diary":"friend-search","staff-office":"say-simple","canteen":"help-liu","noodle-order":"share-bowl","walk-home":"invite-friend","night":"write-people","day2-breakfast":"prepare-for-guest","day2-bird":"bird-with-friend","day2-liu":"liu-stock","day2-night":"day2-letter-kind"};
const WONDER={"arrival":"look-around","school-gate":"watch-first","lost-diary":"solo-search","staff-office":"ask-again","canteen":"read-menu","noodle-order":"try-hot","walk-home":"keep-secret","night":"write-question","day2-breakfast":"ask-diary-question","day2-bird":"bird-quiet","day2-liu":"liu-menu","day2-night":"day2-letter-curious"};

test("Two-day graph has no cycles, dead nodes, missing links or shortcuts around canon",()=>{
 const v=E.validate();assert.deepEqual(Array.from(v.errors),[]);assert.equal(v.branchNodes,12);assert.equal(v.nodeCount,42);
 assert.ok(v.structuralPaths>4000);assert.equal(D.scenes.filter(x=>x.kind==="ending").length,1);
 assert.equal(D.byId.epilogue.kind,"milestone");
});
test("Three distinct An personalities arise from different coherent two-day playthroughs",()=>{
 const b=go(BRAVE),c=go(CARE),w=go(WONDER);
 assert.equal(b.node,"day2-epilogue");assert.equal(b.done,true);
 assert.equal(E.ending(b).key,"courage");assert.equal(E.ending(c).key,"empathy");assert.equal(E.ending(w).key,"curiosity");
 assert.notDeepEqual(b.relationships,c.relationships);assert.notDeepEqual(c.flags,w.flags);
 assert.ok(E.ending(c).extra.some(x=>x.includes("Tiểu Vũ")));
 assert.ok(E.ending(w).extra.some(x=>x.includes("thực đơn")));
});
test("All 4,374 day-one decisions reach its milestone without skipping school, diary or noodle lesson",()=>{
 const required=["school-gate","lost-diary","staff-office","canteen","noodle-order","walk-home","night"];
 let routes=0;
 function walk(s){if(s.node==="epilogue"){routes++;const seen=s.path.map(x=>x.at);required.forEach(x=>assert.ok(seen.includes(x),x));return;}
  const n=D.byId[s.node];if(n.kind==="choice")E.availableOptions(n,s).forEach(o=>walk(next(s,o.id)));else walk(next(s,"next"));
 }
 walk(E.fresh());assert.equal(routes,4374);
});
test("Existing day-one v1 save resumes at end of day one then continues forward without resetting choices",()=>{
 const old=go(CARE,"epilogue"),oldJson=E.exportSave(old),restored=E.load(oldJson);
 assert.equal(old.path.length,13);assert.deepEqual(restored,old);assert.equal(restored.done,false);
 const day2=next(restored,"next");assert.equal(day2.node,"day2-arrival");
 const routed=next(day2,"next");assert.equal(routed.node,"day2-guest-arrives");
 assert.equal(routed.flags["invite-friend"],true);assert.equal(routed.journal.length,8);
});
test("Day-two invitation opens an actual unique visit; without invitation scene never appears",()=>{
 const invited=go(CARE,"day2-arrival"),other=go(BRAVE,"day2-arrival");
 assert.equal(next(invited,"next").node,"day2-guest-arrives");
 assert.equal(next(other,"next").node,"day2-home-quiet");
 assert.equal(E.availableOptions(D.byId["day2-breakfast"],go(CARE,"day2-breakfast")).some(x=>x.id==="prepare-for-guest"),true);
 assert.equal(E.availableOptions(D.byId["day2-breakfast"],go(BRAVE,"day2-breakfast")).some(x=>x.id==="prepare-for-guest"),false);
});
test("An can reveal yesterday's secret only when it was kept; writer's question persists to day two",()=>{
 const shy=go(WONDER,"day2-breakfast"),strong=go(BRAVE,"day2-breakfast");
 assert.equal(E.availableOptions(D.byId["day2-breakfast"],shy).some(x=>x.id==="confess-yesterday"),true);
 assert.equal(E.availableOptions(D.byId["day2-breakfast"],shy).some(x=>x.id==="ask-diary-question"),true);
 assert.equal(E.availableOptions(D.byId["day2-breakfast"],strong).some(x=>x.id==="confess-yesterday"),false);
 assert.equal(E.step(strong,"confess-yesterday").ok,false);
 assert.equal(E.resolveTyped(D.byId["day2-breakfast"],"妈妈，昨天我有点害怕。",strong),null);
 assert.equal(E.resolveTyped(D.byId["day2-breakfast"],"妈妈，昨天我有点害怕。",shy).id,"confess-yesterday");
});
test("Helping Liu yesterday grants a distinct trust task today, not otherwise available",()=>{
 const helper=go(CARE,"day2-liu"),observer=go(WONDER,"day2-liu"),stranger=go(BRAVE,"day2-liu");
 const opts=x=>E.availableOptions(D.byId["day2-liu"],x).map(o=>o.id);
 assert.ok(opts(helper).includes("liu-stock"));assert.ok(!opts(observer).includes("liu-stock"));
 assert.ok(opts(observer).includes("liu-menu"));assert.ok(!opts(stranger).includes("liu-menu"));
 const chosen=next(helper,"liu-stock");assert.equal(chosen.node,"day2-liu-stock");
 assert.ok(E.ending(chosen).extra.some(x=>x.includes("kệ mì")));
 assert.equal(E.step(stranger,"liu-stock").ok,false);
});
test("Helping the classroom sparrow with Xiao Yu depends on prior friendship history",()=>{
 const friend=go(CARE,"day2-bird"),solo=go(WONDER,"day2-bird");
 assert.ok(E.availableOptions(D.byId["day2-bird"],friend).some(o=>o.id==="bird-with-friend"));
 assert.ok(!E.availableOptions(D.byId["day2-bird"],solo).some(o=>o.id==="bird-with-friend"));
 assert.ok(E.conditionText(D.byId["day2-bird"],friend).join(" ").toLowerCase().includes("tranh chim sẻ"));
 assert.equal(E.step(solo,"bird-with-friend").ok,false);
});
test("Every authorized choice updates memory/relationships without treating Chinese fluency as character morality",()=>{
 const b=next(E.fresh(),"hold-mother");assert.equal(b.traits.empathy,2);assert.equal(b.relationships.mother,3);assert.equal(b.journal.length,1);
 assert.ok(b.journal[0].memory.includes("mẹ"));assert.equal("languageScore" in b,false);
 const wrong=E.step(b,"ask-teacher");assert.equal(wrong.ok,false);assert.equal(b.path.length,1);
});
test("Typed variants use authored deterministic choices only, and locked utterances cannot bypass condition",()=>{
 const scene=D.byId["school-gate"];assert.equal(E.resolveTyped(scene,"老师，可以帮帮我吗？").id,"ask-teacher");assert.equal(E.resolveTyped(scene,"老师帮帮我").id,"ask-teacher");
 assert.equal(E.resolveTyped(scene,"我今天想去公园"),null);assert.equal(E.resolveTyped(scene,"hello"),null);
 assert.equal(E.resolveTyped(D.byId["epilogue"],"我叫安"),null);
 const s=go(CARE,"day2-breakfast");assert.equal(E.resolveTyped(D.byId["day2-breakfast"],"小雨快来了",s).id,"prepare-for-guest");
});
test("Save is decision-only and ignores forged feelings, hidden outcomes and future moves",()=>{
 const s=go(WONDER),raw=JSON.parse(E.exportSave(s));assert.deepEqual(Object.keys(raw).sort(),["path","version"]);
 raw.traits={empathy:100};raw.relationships={mother:100};raw.flags={"liu-stock":true};
 const again=E.load(JSON.stringify(raw));assert.deepEqual(again,s);assert.equal(again.flags["liu-stock"],undefined);
 assert.deepEqual(E.load("{broken"),E.fresh());assert.deepEqual(E.load('{"version":2,"path":[]}'),E.fresh());
 const invalid=E.load({version:1,path:[{at:"arrival",choice:"hold-mother"},{at:"fake",choice:"liu-stock"}]});assert.equal(invalid.node,"arrival-mother");assert.equal(invalid.path.length,1);
});
test("Rewind from a journal entry restores exact prefix, enabling a different genuine route",()=>{
 const s=go(CARE,"day2-bird"),i=s.path.findIndex(p=>p.at==="walk-home");assert.ok(i>0);
 const rewound=E.load({version:1,path:s.path.slice(0,i)});assert.equal(rewound.node,"walk-home");
 const alternative=next(rewound,"keep-secret");assert.equal(alternative.flags["invite-friend"],undefined);
 assert.equal(alternative.flags["keep-secret"],true);assert.equal(alternative.path.length,i+1);
 assert.equal(s.flags["invite-friend"],true); // original untouched
});

test("Day two arrives at class before the recap and the quiet bird route opens a window",()=>{
 for(const id of ["day2-ready","day2-confession","day2-mother-explains","day2-guest-prep"]){
  assert.equal(D.byId[id].to,"day2-bird");
 }
 assert.match(fs.readFileSync(path.join(dir,"branch-ui.js"),"utf8"),/Đến lớp, cô Vương mời An ôn lại/);
 assert.match(D.byId["day2-bird-quiet"].story,/mở cửa sổ/);
 const hot=D.byId["noodle-order"].options.find(o=>o.id==="try-hot");
 assert.match(hot.memory,/cốc nước bà chuẩn bị/);
 assert.match(hot.reply,/để sẵn nước/);
});
