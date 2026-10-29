const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const sandbox={};sandbox.globalThis=sandbox;
for(const file of ["branch-data.js","branch-engine.js"])vm.runInNewContext(fs.readFileSync(path.join(__dirname,"../duong-re",file),"utf8"),sandbox,{filename:file});
const D=sandbox.AnBranchStory,E=sandbox.AnBranchEngine;
function journey(choices,stop){let state=E.fresh();for(let i=0;i<50&&!state.done&&state.node!==stop;i++){const scene=D.byId[state.node],choice=scene.kind==="choice"?(choices[scene.id]||E.availableOptions(scene,state)[0].id):"next",out=E.step(state,choice);assert.equal(out.ok,true,out.error);state=out.state;}return state;}
function memories(state){return E.ending(state).extra.join("\n");}

test("a later confession resolves the private fear without erasing the original decision",()=>{
 const choices={"walk-home":"keep-secret","day2-breakfast":"confess-yesterday"};
 const firstNight=journey(choices,"epilogue");
 assert.match(memories(firstNight),/nỗi sợ An vẫn giữ riêng/);
 const finished=journey(choices),replayed=E.load(E.exportSave(finished));
 assert.equal(replayed.flags["keep-secret"],true);
 assert.equal(replayed.flags["confess-yesterday"],true);
 assert.doesNotMatch(memories(replayed),/nỗi sợ An vẫn giữ riêng/);
 assert.match(memories(replayed),/Sáng thứ hai An đã quay lại câu chuyện chưa kể với mẹ/);
 assert.deepEqual(replayed,finished);
});

test("an unspoken fear stays private when the next morning takes another path",()=>{
 const state=journey({"walk-home":"keep-secret","day2-breakfast":"morning-ready"});
 assert.match(memories(state),/nỗi sợ An vẫn giữ riêng/);
 assert.doesNotMatch(memories(state),/Sáng thứ hai An đã quay lại câu chuyện chưa kể với mẹ/);
});

test("the first-night invitation remains a future morning plan until the visit happens",()=>{
 const state=journey({"walk-home":"invite-friend"},"epilogue");
 assert.match(memories(state),/mời Tiểu Vũ ghé nhà vào sáng hôm sau/);
 assert.doesNotMatch(memories(state),/Tiểu Vũ đã ghé nhà|buổi tối khác|An đã dọn chỗ đón/);
});

test("the two-day reflection remembers the actual morning visit for both available morning choices",()=>{
 for(const breakfast of ["morning-ready","prepare-for-guest"]){
  const state=journey({"walk-home":"invite-friend","day2-breakfast":breakfast}),restored=E.load(E.exportSave(state)),text=memories(restored);
  assert.match(text,/Sáng thứ hai/);
  assert.match(text,breakfast==="prepare-for-guest"?/An đã dọn chỗ đón Tiểu Vũ/:/Tiểu Vũ đã ghé nhà trước giờ học/);
  assert.doesNotMatch(text,/cuộc hẹn ấy vẫn đang chờ|buổi tối khác/);
  assert.equal(E.ending(restored).extra.filter(line=>/mời|đón Tiểu Vũ|Tiểu Vũ đã ghé nhà/.test(line)).length,1);
 }
});

test("invitation memories do not invent a visit on an uninvited route",()=>{
 const state=journey({"walk-home":"tell-mother"});
 assert.doesNotMatch(memories(state),/Tiểu Vũ.*ghé nhà|đón Tiểu Vũ|mời Tiểu Vũ/);
 assert.equal(E.step(journey({"walk-home":"tell-mother"},"day2-breakfast"),"prepare-for-guest").ok,false);
});
