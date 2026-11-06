const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),vm=require("node:vm"),path=require("node:path");
function load(file){const box={module:{exports:{}}};vm.runInNewContext(fs.readFileSync(path.join(__dirname,"..",file),"utf8"),box);return box.module.exports}
const content=load("content-manifest.js"),curriculum=load("curriculum-data.js"),review=load("review-data.js"),core=load("game-core.js");
test("V7 content manifest passes linked curriculum contract",()=>assert.deepEqual(Array.from(content.validate(curriculum)),[]));
test("Five acts are fixed HSK1 through HSK5",()=>assert.deepEqual(Array.from(content.chapters,v=>v.lvl),[1,2,3,4,5]));
test("Existing ten numbered scene IDs are preserved for V3-V6 saves",()=>assert.deepEqual(Array.from(content.scenes,v=>v.id),[0,1,2,3,4,5,6,7,8,9]));
test("Legacy scene IDs and accepted answers remain compatible with existing saves",()=>{
 const legacy=[
  [0,["我很好","很好","我很好，谢谢","我很好谢谢"]],
  [1,["我叫安","我叫明安","我是安"]],
  [2,["是，我是学生","我是学生","对我是学生","对，我是学生"]],
  [3,["三个学生","有三个学生","三个人","有三个人"]],
  [4,["我想吃面条","我要面条","一碗面条","我想要一碗面条"]],
  [5,["谢谢","谢谢您","谢谢奶奶"]],
  [6,["好","好的","好啊","可以","好的明天见"]],
  [7,["我叫安我是学生","我是安我是学生","我叫明安我是学生","我叫安，我是学生"]],
  [8,["十块钱","十块","十元"]],
  [9,["我想吃面条","我要面条","我想要一碗面条","我想吃一碗面条"]]
 ];
 assert.deepEqual(Array.from(content.scenes,scene=>[scene.id,Array.from(scene.answers)]),legacy);
});
test("First-scene check-in, curriculum target, and review item stay aligned; 你好 starts with the teacher",()=>{
 const first=content.scenes[0],mother=review.items.find(item=>item.id==="mother-question");
 assert.equal(first.zh,mother.zh);assert.equal(first.py,mother.py);
 assert.ok(curriculum.scenes[0].words.some(([phrase])=>phrase==="你还好吗"));
 assert.ok(curriculum.scenes[0].words.some(([phrase])=>phrase==="我很好"));
 assert.ok(curriculum.scenes[0].words.every(([phrase])=>phrase!=="你好"));
 assert.ok(!first.zh.includes("你好"));
 assert.equal(mother.correct,"health");
 assert.ok(content.scenes[1].zh.includes("你好"));
 assert.ok(curriculum.scenes[1].words.some(([phrase])=>phrase==="你好"));
});
test("every accepted first check-in form has a localized guided page",()=>{
 const first=content.scenes[0];assert.equal(content.version,"1.0.8");
 assert.deepEqual(Array.from(first.answers),["我很好","很好","我很好，谢谢","我很好谢谢"]);
 assert.deepEqual(Array.from(first.naturalAnswers),["我还好","还好","我还好，谢谢","我还好谢谢"]);
 const alternative=first.guidedModel.alternatives[0],short=first.guidedModel.alternatives[1],courtesy=first.guidedModel.alternatives[2],courtesyNatural=first.guidedModel.alternatives[3];
 assert.equal(alternative.zh,"我还好。");assert.equal(alternative.py,"Wǒ hái hǎo.");assert.equal(alternative.vi,"Con vẫn ổn ạ.");
 assert.equal(short.zh,"很好。 / 还好。");assert.equal(short.py,"Hěn hǎo. / Hái hǎo.");assert.equal(short.vi,"Ổn ạ. / Vẫn ổn ạ.");assert.match(short.label,/bỏ 我/);
 assert.equal(courtesy.zh,"我很好，谢谢。");assert.equal(courtesy.py,"Wǒ hěn hǎo, xièxie.");assert.equal(courtesy.vi,"Con ổn ạ, cảm ơn mẹ.");
 assert.equal(courtesyNatural.zh,"我还好，谢谢。");assert.equal(courtesyNatural.py,"Wǒ hái hǎo, xièxie.");assert.equal(courtesyNatural.vi,"Con vẫn ổn ạ, cảm ơn mẹ.");
 const taught=[first.guidedModel.zh].concat(first.guidedModel.alternatives.flatMap(row=>row.zh.split("/").map(value=>value.trim())));
 const accepted=first.answers.concat(first.naturalAnswers);
 assert.ok(accepted.every(answer=>taught.some(example=>core.normalize(example)===core.normalize(answer))),"every accepted first-task form is shown before practice");
 assert.ok(first.naturalAnswers.includes("我还好"));assert.equal(content.validate(curriculum).length,0);
});
test("accepted HSK1 answers in the name, counting, and noodle scenes are taught before practice",()=>{
 const cases=[
  {id:1,answers:["我叫安","我叫明安","我是安"],expect:["我叫安","我叫明安","我是安"]},
  {id:2,answers:["是，我是学生","我是学生","对我是学生","对，我是学生"],expect:["我是学生","是，我是学生","对，我是学生"]},
  {id:3,answers:["三个学生","有三个学生","三个人","有三个人","三个"],expect:["三个学生","有三个学生","三个人","有三个人","三个"]},
  {id:4,answers:["我想吃面条","我要面条","一碗面条","我想要一碗面条"],expect:["我想吃面条","我要面条","一碗面条","我想要一碗面条"]},
  {id:5,answers:["谢谢","谢谢您","谢谢奶奶"],expect:["谢谢","谢谢您","谢谢奶奶"]},
  {id:6,answers:["好","好的","好啊","可以","好的明天见"],expect:["好","好的","好啊","可以","好的，明天见"]}
 ];
 for(const row of cases){
  const scene=content.scenes[row.id],model=scene.guidedModel;
  const taught=[model.zh].concat(model.alternatives.flatMap(page=>page.zh.split("/").map(value=>value.trim())));
  assert.deepEqual(taught.map(core.normalize),row.expect.map(core.normalize),`scene ${row.id} teaches each accepted response in order`);
  assert.ok(row.answers.every(answer=>taught.some(example=>core.normalize(example)===core.normalize(answer))),`scene ${row.id} does not assess an untaught answer`);
  assert.ok(model.alternatives.every(page=>page.title&&page.story&&page.py&&page.vi),`scene ${row.id} alternatives explain their context`);
 }
 assert.match(content.scenes[4].guidedModel.alternatives[1].story,/quán ăn/);
 assert.match(content.scenes[3].guidedModel.alternatives[0].story,/有/);
 assert.match(content.scenes[5].guidedModel.alternatives[0].story,/您/);
 assert.match(content.scenes[6].guidedModel.alternatives[1].story,/thân mật/);
});
test("Every scene has a nonempty localized Mandarin response and accepted answers",()=>{
 content.scenes.forEach((scene,i)=>{assert.ok(scene.zh&&scene.py&&scene.vi&&scene.speaker&&scene.request);
 assert.ok(scene.answers.length>0);
 assert.ok(content.replies[i].zh&&content.replies[i].py&&content.replies[i].vi)})
});
test("Manifest detects text/reply mismatch instead of silently rendering undefined",()=>{
 const broken={...content,scenes:content.scenes.slice(0,-1)};
 const curriculumCopy={scenes:curriculum.scenes};
 const errors=content.validate({scenes:curriculumCopy.scenes.slice(1)});
 assert.ok(errors.some(e=>e.includes("Curriculum mismatch")));
});
test("Content data is separate from UI logic",()=>{
 const app=fs.readFileSync(path.join(__dirname,"../app.js"),"utf8");
 const page=fs.readFileSync(path.join(__dirname,"../index.html"),"utf8");
 assert.ok(!app.includes('var SCENES=[')&&!app.includes('var REPLIES=['));
 assert.ok(app.includes("HSKContent.validate(HSKCurriculum)"));
 assert.ok(page.indexOf('src="/content-manifest.js"')<page.indexOf('src="/app.js"'));
});
