const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),{execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),manifest=require('../art/manifest.json');
const box={};vm.runInNewContext(fs.readFileSync(path.join(root,'scene-manifest.js'),'utf8'),box);const runtime=JSON.parse(JSON.stringify(box.HSKSceneManifest));vm.runInNewContext(fs.readFileSync(path.join(root,'scene-renderer.js'),'utf8'),box);const layers=box.HSKSceneLayers;
const graphBox={};vm.runInNewContext(fs.readFileSync(path.join(root,'story-graph.js'),'utf8'),graphBox);
const expected=[...graphBox.HSKStoryGraph.sceneIds.slice(0,7),'lost-notebook',...graphBox.HSKStoryGraph.sceneIds.slice(7)];
test('compiled scene data is current and retains every canonical story/encounter ID',()=>{
 execFileSync(process.execPath,[path.join(root,'scripts/build-scene-manifest.cjs'),'--check']);
 assert.deepEqual(runtime.sceneIds,Array.from(expected));
 assert.deepEqual(runtime.scenes,{...manifest.scenes,...manifest.auxiliaryScenes});
 assert.deepEqual(Array.from(layers.validate(Object.keys(runtime.scenes))),[]);
});
test('every declared art layer exists; intentionally empty layers never invent asset paths',()=>{
 for(const [id,scene] of Object.entries(runtime.scenes)){
  const markup=layers.render(null,id),background=runtime.backgrounds[scene.background];
  for(const asset of [background.desktop,background.mobile,...scene.actors.map(a=>runtime.sprites[a.character].asset),scene.sparrow.asset,scene.layers.midground?.asset,scene.layers.foreground?.asset].filter(Boolean))assert.ok(fs.existsSync(path.join(root,'art',asset)),id+'/'+asset);
  if(['hsk1.e01.liu-noodle-order','hsk1.e01.liu-payment'].includes(id)){assert.ok(scene.layers.midground);assert.equal(scene.layers.midground.asset,'layers/menu-panels-v1.webp');assert.ok(scene.layers.midground.mobile.width>0);assert.ok(scene.layers.midground.desktop.width>0)}else assert.equal(scene.layers.midground,null);
  if(scene.layers.foreground){
   const layer=scene.layers.foreground;
   for(const device of ['desktop','mobile',...(layer.tablet?['tablet']:[])])assert.ok(['x','y','width'].every(key=>Number.isFinite(layer[device]?.[key])&&layer[device][key]>0),id+'/foreground '+device+' background anchor');
   if(layer.compact)assert.ok(['x','y','width'].every(key=>Number.isFinite(layer.compact[key])&&layer.compact[key]>0),id+'/foreground compact background anchor');
   assert.ok(markup.indexOf('data-layer="foreground"')>markup.indexOf('data-layer="characters"'),id+' foreground overlays character sprites');
  }
  assert.equal((markup.match(/data-character="sparrow"/g)||[]).length,1,id+' one sparrow');
  assert.equal((markup.match(/class="cs-actor"/g)||[]).length,scene.actors.length,id+' actors');
  for(const layer of ['background','midground','characters','foreground'])assert.ok(markup.includes('data-layer="'+layer+'"'),id+'/'+layer);
  assert.doesNotMatch(markup,/placeholder|<svg/);
  const foregroundVisibleByDefault=scene.layers.foreground&&!scene.layers.foreground.visibleWhen;
  assert.equal((markup.match(/<img /g)||[]).length,1+(scene.layers.midground?1:0)+(foregroundVisibleByDefault?1:0));
  for(const actor of scene.actors){const s=runtime.sprites[actor.character];assert.ok(s.frames[actor.expression]!==undefined);assert.ok(s.face.every(x=>x>=0&&x<=1));}
 }
});
test('expression selection uses actual sprite cells and rejects nonexistent poses',()=>{
 assert.match(layers.render(null,'intro.bedroom',{anExpression:'awkward'}),/background-position:0% 100%/);
 assert.match(layers.render(null,'intro.bedroom',{anExpression:'thinking'}),/background-position:100% 0%/);
 assert.throws(()=>layers.render(null,'intro.bedroom',{anExpression:'unknown'}),/Missing expression/);
 assert.throws(()=>layers.render(null,'unknown'),/Unknown art scene/);
});
test('scene art follows story actions: menu before order, meal at payment, office only after leaving class',()=>{
 const menu=layers.render(null,'hsk1.e01.liu-noodle-order');
 const served=layers.render(null,'hsk1.e01.liu-noodle-order',{showForeground:true});
 const inspect=layers.render(null,'lost-notebook');
 const office=layers.render(null,'lost-notebook-office');
 assert.equal((menu.match(/noodle-bowl-v3\.webp/g)||[]).length,0,'Food must not appear before An orders');
 assert.equal((menu.match(/data-asset="layers\/menu-panels-v1\.webp"/g)||[]).length,1,'Each noodle scene has one menu row layer');
 assert.match(layers.render(null,'hsk1.e01.liu-payment'),/data-asset="layers\/menu-panels-v1\.webp"/,'Wall menu remains present during the payment scene');
 assert.doesNotMatch(served,/noodle-bowl-v3\.webp/,'Do not display the bowl until the meal is served');
 assert.match(layers.render(null,'hsk1.e01.liu-payment'),/noodle-bowl-v3\.webp/,'The bowl appears for the price dialogue');
 assert.deepEqual(runtime.scenes['hsk1.e01.liu-payment'].actors[0].tablet,{left:14,bottom:0,width:35},'Tablet portrait shifts and scales An to reveal the foreground table and menu');
 assert.deepEqual(runtime.scenes['hsk1.e01.liu-payment'].layers.foreground.tablet,{x:160,y:1140,width:150},'Tablet portrait places the served bowl on the foreground table below An’s face');
 assert.equal((inspect.match(/data-character="receptionist"/g)||[]).length,0,'Receptionist is not in the classroom search scene');
 assert.equal((office.match(/data-character="receptionist"/g)||[]).length,1,'Receptionist appears at the school office');
 assert.equal(office.includes('school-office-v2.webp'),true);
 const count=runtime.scenes['hsk1.e01.class-counting'];
 assert.equal(count.actors.filter(x=>x.character==='classmates').length,1,'Counting scene must show exactly two classmates in addition to An');
 assert.equal(Object.values(runtime.scenes).filter(s=>s.actors.some(a=>a.character==='classmates')).length,1,'Classmates do not leak into unrelated story scenes');
});
test('all learning pages load the same compiled manifest, renderer and sprite geometry',()=>{
 for(const page of ['index.html','nhap-mon.html','ren-luyen.html']){
  const html=fs.readFileSync(path.join(root,page),'utf8'),scripts=Array.from(html.matchAll(/<script[^>]+src="([^"]+)"/g),m=>m[1]);
  assert.ok(scripts.indexOf('/scene-manifest.js')>=0);assert.ok(scripts.indexOf('/scene-renderer.js')>scripts.indexOf('/scene-manifest.js'));
  assert.match(html,/href="\/scene-layers.css"/);assert.ok(!scripts.includes('/scene-layers.js'));assert.ok(!scripts.includes('/scene-art.js'));
  assert.doesNotMatch(html,/class="(?:book-scene-figures|review-characters|intro-backdrop|review-backdrop)"/);
 }
});
