const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),vm=require("node:vm"),path=require("node:path");
const root=path.resolve(__dirname,".."),script=fs.readFileSync(path.join(root,"intro-landing.js"),"utf8"),page=fs.readFileSync(path.join(root,"index.html"),"utf8");
function boot(raw,deny=false){
 const dom={introEntryStatus:{textContent:"9 trang truyện tương tác"},introHeroButton:{textContent:"Tui chưa biết chữ Hán · Nhập môn"}};
 const store={"hai-que-huong-progress-v3":"untouched", "hai-que-huong-intro-v1":raw};
 const document={getElementById(id){return dom[id]||null}};
 const localStorage={getItem(id){if(deny)throw Error("Private session");return store[id]||null},setItem(){throw Error("Progress display must be read-only")}};
 vm.runInNewContext(script,{document,localStorage});
 return {dom,store};
}
test("Landing still offers HSK1 and Chapter00 independently",()=>{
 assert.ok(page.includes('id="startBtn"'));assert.ok(page.includes('id="introHeroButton"'));assert.ok(page.includes('id="introEntryStatus"'));assert.ok(page.includes('src="/intro-landing.js"'));
});
test("Partially completed intro shows continue text, no changes to HSK1 saved progress",()=>{
 const x=boot(JSON.stringify({step:3,maxReached:4,finished:false}));
 assert.ok(x.dom.introHeroButton.textContent.includes("Tiếp tục"));
 assert.ok(x.dom.introEntryStatus.textContent.includes("4/9"));
 assert.equal(x.store["hai-que-huong-progress-v3"],"untouched");
});
test("Intro completion shows replay option and no false HSK certificate",()=>{
 const x=boot(JSON.stringify({step:8,maxReached:8,finished:true}));
 assert.ok(x.dom.introHeroButton.textContent.includes("Xem lại"));
 assert.ok(!x.dom.introEntryStatus.textContent.includes("đạt HSK"));
});
test("Broken or unavailable localStorage cannot break homepage",()=>{
 assert.ok(boot("{corrupted").dom.introHeroButton.textContent.includes("Nhập môn"));
 assert.ok(boot(null,true).dom.introHeroButton.textContent.includes("Nhập môn"));
});
