const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..'),box={};box.window=box;box.globalThis=box;
for(const file of ['scene-manifest.js','duong-re/branch-data.js','duong-re/branch-scenes.js'])vm.runInNewContext(fs.readFileSync(path.join(root,file),'utf8'),box,{filename:file});
test('all authored nodes use approved layered assets and valid unique cast expressions',()=>{const manifest=box.HSKSceneManifest;for(const node of box.AnBranchStory.scenes){const s=manifest.scenes[box.ChimSeBranchScenes.id(node)];assert.ok(manifest.backgrounds[s.background],node.id);assert.equal(new Set(s.actors.map(a=>a.character)).size,s.actors.length,node.id);for(const actor of s.actors)assert.ok(actor.expression in manifest.sprites[actor.sprite||actor.character].frames,node.id+'/'+actor.character);assert.ok(s.sparrow.expression in manifest.sprites.sparrow.frames);assert.ok(!s.actors.some(a=>a.character==='sparrow'));}});
test('every named branch speaker is present as an actor in the rendered scene',()=>{
 const speakers=[[/^Mẹ$/,'mother'],[/^An$/,'an'],[/^Minh An$/,'an'],[/王老师|Cô Vương/,'wang'],[/小雨|Tiểu Vũ/,'xiaoyu'],[/Cô nhân viên trực/,'receptionist'],[/刘奶奶|Bà Lưu/,'liu']];
 for(const node of box.AnBranchStory.scenes){const match=speakers.find(([pattern])=>pattern.test(node.speaker));assert.ok(match,'speaker mapping exists for '+node.id+': '+node.speaker);const scene=box.HSKSceneManifest.scenes[box.ChimSeBranchScenes.id(node)];assert.ok(scene.actors.some(actor=>actor.character===match[1]),node.id+' puts speaking '+match[1]+' in the scene');}
});
test('every learning task retains its existing artwork mapping',()=>{for(let i=0;i<10;i++)assert.ok(box.HSKSceneManifest.scenes[box.ChimSeBranchScenes.lessonId(i)]);});
test('story narration sits under its heading without stretching across a blank vertical gap',()=>{const css=fs.readFileSync(path.join(root,'duong-re/style.css'),'utf8');assert.match(css,/body:not\(\.keyboard-open\) \.branch-shell:not\(\[data-phase="session-close"\]\) \.reader-content\{justify-content:flex-start\}/);assert.match(css,/body\.keyboard-open \.reader-content\{justify-content:flex-end\}/);assert.match(css,/\.branch-shell\[data-phase="session-close"\] \.reader-content\{justify-content:center/);});

test("the after-school reunion takes place outside, with all three characters",()=>{const scene=box.HSKSceneManifest.scenes["branch.walk-home"];assert.equal(scene.background,"evening-street");assert.deepEqual(Array.from(scene.actors,a=>a.character),["an","mother","xiaoyu"]);assert.match(box.AnBranchStory.byId["walk-home"].story,/đầu ngõ/);});
test('notebook search starts in the classroom before moving to the office',()=>{
  for(const id of ['search-friend','search-teacher','search-alone']){
    const node=box.AnBranchStory.byId[id], scene=box.HSKSceneManifest.scenes['branch.'+id];
    assert.equal(node.place,'class',id);assert.equal(scene.background,'classroom',id);assert.equal(node.to,'staff-office',id);
  }
});
test('day two morning uses the dedicated kitchen plates and keeps one Sẻ',()=>{
  const kitchen=['day2-arrival','day2-guest-arrives','day2-home-quiet','day2-breakfast','day2-confession','day2-mother-explains','day2-guest-prep'];
  for(const id of kitchen){
    const scene=box.HSKSceneManifest.scenes['branch.'+id];
    assert.equal(scene.background,'day2-kitchen',id);
    assert.equal(scene.sparrow.asset,box.HSKSceneManifest.sprites.sparrow.asset,id);
    assert.equal(JSON.stringify({desktop:scene.sparrow.desktop,mobile:scene.sparrow.mobile,wide:scene.sparrow.wide,compact:scene.sparrow.compact}),JSON.stringify({desktop:{left:70,top:12},mobile:{left:82,top:10},wide:{left:70,top:12},compact:{left:94,top:54}}),id+' keeps one Sẻ by a visible window perch in each composition');
    assert.equal(scene.sparrow.flight,false,id+' keeps Sẻ perched on the ordinary stage');
    assert.equal(scene.sparrow.compactFlight,true,id+' gives Sẻ a deliberate flight beat in the shallow landscape crop');
    assert.equal(scene.actors.filter(a=>a.character==='sparrow').length,0,id);
  }
  assert.equal(JSON.stringify(box.HSKSceneManifest.scenes['branch.day2-arrival'].actors.map(a=>a.desktop.width)),JSON.stringify([33,42]));
  assert.equal(JSON.stringify(box.HSKSceneManifest.scenes['branch.day2-arrival'].actors.map(a=>a.mobile.bottom)),JSON.stringify([35,35]));
  assert.equal(JSON.stringify(box.HSKSceneManifest.scenes['branch.day2-arrival'].actors.map(a=>a.tablet)),JSON.stringify([{left:22,bottom:0,width:22},{left:54,bottom:0,width:23}]));
  assert.equal(JSON.stringify(box.HSKSceneManifest.scenes['branch.day2-arrival'].actors.map(a=>a.wide)),JSON.stringify([{left:4,bottom:0,width:16},{left:68,bottom:0,width:16}]));
  assert.equal(JSON.stringify(box.HSKSceneManifest.scenes['branch.day2-arrival'].actors.map(a=>a.compact)),JSON.stringify([{left:26,bottom:0,width:15},{left:47,bottom:0,width:15}]));
  assert.equal(JSON.stringify(box.HSKSceneManifest.scenes['branch.day2-arrival'].actorRegion),JSON.stringify({desktop:{left:45,right:3},mobile:{left:3,right:3},tablet:{left:3,right:3},wide:{left:28,right:3},compact:{left:0,right:0}}));
  assert.equal(JSON.stringify(box.HSKSceneManifest.scenes['branch.day2-guest-prep'].actors.map(a=>a.character)),JSON.stringify(['an','xiaoyu']));
  assert.equal(box.HSKSceneManifest.scenes['branch.day2-night'].background,'bedroom');
  assert.equal(box.HSKSceneManifest.backgrounds['day2-kitchen'].desktop,'flat/backgrounds/day2-kitchen.svg');
  assert.equal(box.HSKSceneManifest.backgrounds['day2-kitchen'].mobile,'flat/backgrounds/day2-kitchen-portrait.svg');
  assert.equal(box.HSKSceneManifest.backgrounds['day2-kitchen'].tablet,'flat/backgrounds/day2-kitchen-tablet.svg');
  assert.equal(box.HSKSceneManifest.backgrounds['day2-kitchen'].wide,'flat/backgrounds/day2-kitchen-wide.svg');
  assert.equal(box.HSKSceneManifest.backgrounds['day2-kitchen'].compact,'flat/backgrounds/day2-kitchen-compact.svg');
});

test('week-later learning cues keep the speaker, scene and single Sẻ aligned',()=>{
  const count=box.HSKSceneManifest.scenes['branch.week-later-count'];
  assert.equal(count.background,'classroom');
  assert.equal(JSON.stringify(count.actors.map(actor=>actor.character)),JSON.stringify(['an','wang']));
  const countingArt=box.HSKSceneManifest.scenes['hsk1.e01.class-counting'];
  assert.equal(countingArt.sparrow.asset,box.HSKSceneManifest.sprites.sparrow.asset);
  for(const id of ['branch.week-later-thanks','branch.week-later-goodbye']){
    const scene=box.HSKSceneManifest.scenes[id];
    assert.equal(JSON.stringify(scene.actors.map(actor=>actor.character)),JSON.stringify(['an','xiaoyu']),id);
    assert.equal(scene.sparrow.asset,box.HSKSceneManifest.sprites.sparrow.asset,id);
    assert.equal(scene.actors.some(actor=>actor.character==='sparrow'),false,id+' must not add a second bird sprite');
  }
});
