const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),vm=require("node:vm"),path=require("node:path");
function load(file){const box={module:{exports:{}}};vm.runInNewContext(fs.readFileSync(path.join(__dirname,"..",file),"utf8"),box);return box.module.exports}
const E=load("active-encounter.js"),Core=load("game-core.js");
function advance(route="friend"){let s=E.initial();s=E.move(s,{type:"inspect",id:"desk"});s=E.move(s,{type:"inspect",id:"door"});return E.move(s,{type:"route",id:route})}
test("V8 encounter schema, canonical trigger and complete localization",()=>{assert.equal(E.validate().join(","),"");assert.equal(E.content.triggerScene,4);assert.equal(E.content.objects.length,3);assert.equal(E.content.routes.length,2)});
test("V8 notebook outcome has a localized reaction after the notebook is returned",()=>{
 assert.match(E.content.outcomeZh,/找到了/);
 assert.match(E.content.outcomePy,/zhǎodào/i);
 assert.match(E.content.outcomeVi,/tìm thấy/i);
 assert.notEqual(E.content.outcomeZh,E.content.startZh);
});
test("V8 requires examining two unique objects before a route",()=>{let s=E.initial();s=E.move(s,{type:"inspect",id:"desk"});s=E.move(s,{type:"inspect",id:"desk"});assert.equal(s.stage,"inspect");s=E.move(s,{type:"inspect",id:"bag"});assert.equal(s.stage,"decide");assert.throws(()=>E.move(s,{type:"inspect",id:"door"}));});
test("V8 supports two choices and a persistent callback later in the chapter",()=>{for(const route of ["friend","teacher"]){let s=advance(route);s=E.move(s,{type:"submit",value:"我叫安"},Core);s=E.move(s,{type:"continue"});assert.equal(s.stage,"done");assert.ok(E.callback(6,s).vi)}})
test("V8 correct first transfer response is independent without altering school scores",()=>{let s=advance();s=E.move(s,{type:"submit",value:"我叫明安"},Core);assert.equal(s.answer,"independent");assert.equal(s.attempts,0)});
test("V8 incorrect, negated or non-Chinese responses do not earn independent evidence",()=>{for(const value of ["不是我叫安","wo jiao an","我不是安"]){let s=advance();s=E.move(s,{type:"submit",value},Core);assert.equal(s.stage,"respond");assert.equal(s.attempts,1)}});
test("V8 retry, hint and sample get different evidence",()=>{
 let retry=E.move(advance(),{type:"submit",value:"我不是安"},Core);retry=E.move(retry,{type:"submit",value:"我叫安"},Core);assert.equal(retry.answer,"retried");
 let hinted=E.move(advance(),{type:"hint"});hinted=E.move(hinted,{type:"submit",value:"我叫安"},Core);assert.equal(hinted.answer,"helped");
 let sample=advance();sample=E.move(sample,{type:"submit",value:"?错误"},Core);sample=E.move(sample,{type:"submit",value:"?错误"},Core);sample=E.move(sample,{type:"sample"});assert.equal(sample.answer,"sample");
});
test("V8 cannot jump to grading, reveal sample prematurely or forge invalid route",()=>{assert.throws(()=>E.move(E.initial(),{type:"submit",value:"我叫安"},Core));assert.throws(()=>E.move(advance(),{type:"sample"}));assert.throws(()=>E.move(E.move(E.move(E.initial(),{type:"inspect",id:"bag"}),{type:"inspect",id:"desk"}),{type:"route",id:"evil"}))});
test("V7 progress at scene 4+ migrates without replaying already completed content",()=>{assert.equal(E.migrate(null,6,[],false).stage,"legacy");assert.equal(E.migrate(null,4,[{},{},{},{},{}],false).stage,"legacy");assert.equal(E.migrate(null,4,[{},{},{},{}],false).stage,"inspect")});
test("V8 stage resume preserves route and does not bypass restrictions on forged storage",()=>{
 const partial=advance("teacher");assert.equal(E.clean(JSON.parse(JSON.stringify(partial))).stage,"respond");
 const forged=E.clean({stage:"done",route:"hacked",answer:"independent"});assert.equal(forged.stage,"inspect");
});
