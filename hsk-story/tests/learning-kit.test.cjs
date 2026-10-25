const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),vm=require("node:vm"),path=require("node:path");
const ctx={module:{exports:{}}};vm.runInNewContext(fs.readFileSync(path.join(__dirname,"../learning-kit.js"),"utf8"),ctx);const k=ctx.module.exports;
const scenes=[
{id:0,kind:"practice",objective:"greeting",topic:"hello",words:[["你好","nǐ hǎo","xin chào"]]},
{id:1,kind:"practice",objective:"self-intro",topic:"name",words:[["我叫安","wǒ jiào Ān","tôi là An"],["你好","nǐ hǎo","xin chào"]]},
{id:2,kind:"checkpoint",objective:"assessment",topic:"school",words:[]}
];
test("sentence tiles are scene-specific",()=>{assert.ok(k.tiles(0).includes("我"));assert.ok(k.tiles(1).includes("我叫"));assert.ok(k.tiles(2).includes("学生"))});
test("composition builds Hanzi, deletes unicode safely",()=>{let s=k.compose("","我");s=k.compose(s,"很");s=k.compose(s,"好");assert.equal(s,"我很好");assert.equal(k.compose(s,"__undo"),"我很");assert.equal(k.compose(s,"__clear"),"")});
test("notebook only includes reached content and deduplicates",()=>{assert.deepEqual(Array.from(k.notebook(scenes,[],0,false),v=>v.hanzi),["你好"]);assert.deepEqual(Array.from(k.notebook(scenes,[],1,false),v=>v.hanzi),["你好","我叫安"])});
test("review queue prioritizes assisted, then hinted, then retries",()=>{const r=k.needsReview([{status:"correct",hint:true},{status:"assisted"}],scenes);assert.deepEqual(Array.from(r,v=>v.sceneId),[1,0]);assert.equal(k.counts([{status:"correct",hint:false,attempts:0},{status:"assisted"}],scenes).independent,1)});
test("exam only receives empty phrase bank",()=>assert.equal(k.tiles(7).length,0));
