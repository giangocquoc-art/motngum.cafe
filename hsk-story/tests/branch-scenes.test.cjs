const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..'),box={};box.window=box;box.globalThis=box;
for(const file of ['scene-manifest.js','duong-re/branch-data.js','duong-re/branch-scenes.js'])vm.runInNewContext(fs.readFileSync(path.join(root,file),'utf8'),box,{filename:file});
test('all authored nodes use approved layered assets and valid unique cast expressions',()=>{const manifest=box.HSKSceneManifest;for(const node of box.AnBranchStory.scenes){const s=manifest.scenes[box.ChimSeBranchScenes.id(node)];assert.ok(manifest.backgrounds[s.background],node.id);assert.equal(new Set(s.actors.map(a=>a.character)).size,s.actors.length,node.id);for(const actor of s.actors)assert.ok(actor.expression in manifest.sprites[actor.sprite||actor.character].frames,node.id+'/'+actor.character);assert.ok(s.sparrow.expression in manifest.sprites.sparrow.frames);assert.ok(!s.actors.some(a=>a.character==='sparrow'));}});
test('every learning task retains its existing artwork mapping',()=>{for(let i=0;i<10;i++)assert.ok(box.HSKSceneManifest.scenes[box.ChimSeBranchScenes.lessonId(i)]);});

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
    assert.equal(JSON.stringify({desktop:scene.sparrow.desktop,mobile:scene.sparrow.mobile,compact:scene.sparrow.compact}),JSON.stringify({desktop:{left:92,top:30},mobile:{left:82,top:10},compact:{left:94,top:54}}),id+' keeps one Sẻ by a visible landscape perch');
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
  assert.equal(box.HSKSceneManifest.backgrounds['day2-kitchen'].desktop,'backgrounds/day2-kitchen-v1.webp');
  assert.equal(box.HSKSceneManifest.backgrounds['day2-kitchen'].mobile,'backgrounds/mobile/mobile-day2-kitchen-v2.webp');
  assert.equal(box.HSKSceneManifest.backgrounds['day2-kitchen'].wide,'backgrounds/panorama/day2-kitchen-panorama-v1.webp');
  assert.equal(box.HSKSceneManifest.backgrounds['day2-kitchen'].compact,'backgrounds/panorama/day2-kitchen-panorama-v1.webp');
});
