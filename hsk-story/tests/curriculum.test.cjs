const {test}=require("node:test");const assert=require("node:assert/strict");const {readFileSync}=require("node:fs");const {runInNewContext}=require("node:vm");const path=require("node:path");
function get(file){const x={module:{exports:{}}};runInNewContext(readFileSync(path.join(__dirname,"..",file),"utf8"),x);return x.module.exports}
const syllabus=get("curriculum-data.js"),blueprint=get("learning-blueprint.js");
test("HSK 3.0 roadmap includes levels 1 to 6 with pinned source and pending review state",()=>{
 assert.deepEqual(Array.from(syllabus.levels,x=>x.level),[1,2,3,4,5,6]);
 assert.equal(syllabus.source.framework,"HSK 3.0");assert.equal(syllabus.source.edition,"2025-11");assert.equal(syllabus.source.effective,"2026-07");
 assert.equal(syllabus.levels[0].status,"pilot-playable");assert.ok(syllabus.levels.slice(1).every(x=>x.status==="outline-only"&&x.mappingStatus==="pending-item-review"));
});
test("content validation succeeds",()=>assert.equal(syllabus.validate().join(","),""));
test("checkpoints introduce zero mandatory new expressions",()=>assert.ok(syllabus.scenes.slice(7).every(x=>x.kind==="checkpoint"&&x.words.length===0&&x.reviewOf.length>0)));
test("checkpoint references real practice",()=>assert.deepEqual(Array.from(syllabus.scenes.slice(7),x=>x.reviewOf[0]),[1,5,4]));
test("price checkpoint names the noodle shop from An's story",()=>assert.equal(syllabus.scenes[8].objective,"Nhớ giá bát mì ở quán bà Lưu"));
test("all ten stable lesson records point to the blueprint objective IDs",()=>{
 const expected=syllabus.scenes.map((_,index)=>blueprint.objectives.filter(o=>o.curriculumSceneIds.includes(index)).map(o=>o.id).sort());
 const actual=syllabus.scenes.map(s=>Array.from(s.objectiveIds).sort());
 assert.equal(JSON.stringify(actual),JSON.stringify(expected));
 assert.equal(new Set(blueprint.objectives.map(o=>o.id)).size,blueprint.objectives.length);
});
