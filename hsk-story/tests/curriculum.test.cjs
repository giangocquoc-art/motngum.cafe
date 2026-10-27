const {test}=require("node:test");const assert=require("node:assert/strict");const {readFileSync}=require("node:fs");const {runInNewContext}=require("node:vm");const path=require("node:path");
function get(file){const x={module:{exports:{}}};runInNewContext(readFileSync(path.join(__dirname,"..",file),"utf8"),x);return x.module.exports}
const syllabus=get("curriculum-data.js");
test("levels 1 to 5 are present",()=>assert.deepEqual(Array.from(syllabus.levels,x=>x.level),[1,2,3,4,5]));
test("content validation succeeds",()=>assert.equal(syllabus.validate().join(","),""));
test("checkpoints introduce zero mandatory new expressions",()=>assert.ok(syllabus.scenes.slice(7).every(x=>x.kind==="checkpoint"&&x.words.length===0&&x.reviewOf.length>0)));
test("checkpoint references real practice",()=>assert.deepEqual(Array.from(syllabus.scenes.slice(7),x=>x.reviewOf[0]),[1,5,4]));
test("price checkpoint names the noodle shop from An's story",()=>assert.equal(syllabus.scenes[8].objective,"Nhớ giá bát mì ở quán bà Lưu"));
