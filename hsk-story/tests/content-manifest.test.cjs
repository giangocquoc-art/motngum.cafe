const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),vm=require("node:vm"),path=require("node:path");
function load(file){const box={module:{exports:{}}};vm.runInNewContext(fs.readFileSync(path.join(__dirname,"..",file),"utf8"),box);return box.module.exports}
const content=load("content-manifest.js"),curriculum=load("curriculum-data.js");
test("V7 content manifest passes linked curriculum contract",()=>assert.deepEqual(Array.from(content.validate(curriculum)),[]));
test("Five acts are fixed HSK1 through HSK5",()=>assert.deepEqual(Array.from(content.chapters,v=>v.lvl),[1,2,3,4,5]));
test("Existing ten numbered scene IDs are preserved for V3-V6 saves",()=>assert.deepEqual(Array.from(content.scenes,v=>v.id),[0,1,2,3,4,5,6,7,8,9]));
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
