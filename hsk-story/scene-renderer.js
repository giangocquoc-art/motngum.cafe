/* Shared layered scene renderer. Production flat geometry and scene data have one authored source. */
var HSKSceneLayers=(function(){"use strict";
var data=HSKSceneManifest,scenes=data.scenes,observers=new WeakMap(),preloaded=new Set(),reactions=new WeakMap();
function escape(value){return String(value).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
function sprite(name,expression,extra,position,spriteName){
 var key=spriteName||name,s=data.sprites[key],frame=s.frames[expression];
 if(frame===undefined)throw Error("Missing expression: "+name+"/"+expression);
 var native=s.format==='svg',x=native||s.columns===1?0:(frame%s.columns)/(s.columns-1)*100,y=native||s.rows===1?0:Math.floor(frame/s.columns)/(s.rows-1)*100;
 var style=native?'':'background-image:url(/art/'+s.asset+');background-size:'+s.columns*100+'% '+s.rows*100+'%;background-position:'+x+'% '+y+'%;';
 if(position){style+='--actor-left:'+position.desktop.left+'%;--actor-width:'+position.desktop.width+'%;--actor-bottom:'+position.desktop.bottom+'%;--actor-mobile-left:'+position.mobile.left+'%;--actor-mobile-width:'+position.mobile.width+'%;--actor-mobile-bottom:'+position.mobile.bottom+'%;';if(position.tablet)style+='--actor-tablet-left:'+position.tablet.left+'%;--actor-tablet-width:'+position.tablet.width+'%;--actor-tablet-bottom:'+position.tablet.bottom+'%;';if(position.compact)style+='--actor-compact-left:'+position.compact.left+'%;--actor-compact-width:'+position.compact.width+'%;--actor-compact-bottom:'+position.compact.bottom+'%;'}
 return '<div class="'+extra+'" data-character="'+name+'" data-sprite="'+key+'" data-expression="'+expression+'" data-face="'+s.face.join(',')+'" data-asset="'+(native?s.frameAssets[expression]:s.asset)+'"'+(position&&position.sourcePosition?' data-source-position="'+escape(JSON.stringify(position.sourcePosition))+'"':'')+' style="'+style+'" aria-hidden="true">'+(native?HSKFlatArt.character(name,expression,/Noodle$/.test(key)):'')+'</div>';
}
function setExpression(host,name,expression){
 var base=data.sprites[name];if(!base)throw Error("Unknown sprite: "+name);
 if(!host||typeof host.querySelector!=="function")return false;
 var target=name==='sparrow'?host.querySelector('.cs-sparrow'):host.querySelector('.cs-actor[data-character="'+name+'"]');
 if(!target)return false;
 var spec=data.sprites[target.dataset.sprite||name]||base,frame=spec.frames[expression];if(frame===undefined)throw Error("Missing expression: "+name+"/"+expression);
 if(spec.format==='svg'){target.innerHTML=HSKFlatArt.character(name,expression,/Noodle$/.test(target.dataset.sprite||name));target.dataset.expression=expression;target.dataset.asset=spec.frameAssets[expression];return true}
 var x=spec.columns===1?0:(frame%spec.columns)/(spec.columns-1)*100,y=spec.rows===1?0:Math.floor(frame/spec.columns)/(spec.rows-1)*100;
 target.style.backgroundPosition=x+'% '+y+'%';target.dataset.expression=expression;return true;
}
function layerEntries(value){return value?(Array.isArray(value)?value:[value]):[]}
function layerVisible(layer,options){return !layer.visibleWhen||!!(options&&options.showForeground===true)}
function layerImages(value,options){return layerEntries(value).map(function(layer,index){return {layer:layer,index:index}}).filter(function(item){return layerVisible(item.layer,options)}).map(function(item){return '<img alt="" class="cs-layer-image'+(item.layer.motion==='steam'?' cs-steam-layer':'')+'" data-layer-index="'+item.index+'" data-asset="'+escape(item.layer.asset)+'">'}).join('')}
function render(place,id,options){
 var scene=scenes[id];if(!scene)throw Error("Unknown art scene: "+id);var layers=scene.layers||{};
 var actorList=scene.actors.slice(),companion=options&&scene.companions&&scene.companions[options.companion];if(companion)actorList.splice(Math.min(1,actorList.length),0,companion);
 var bg=data.backgrounds[scene.background],midground=layers.midground,foreground=layers.foreground,backActors=actorList.filter(function(a){return a.slot==='behind-counter'}).map(function(a){return sprite(a.character,options&&options.anExpression&&a.character==='an'?options.anExpression:a.expression,'cs-actor',a,a.sprite)}).join(''),actors=actorList.filter(function(a){return a.slot!=='behind-counter'}).map(function(a){return sprite(a.character,options&&options.anExpression&&a.character==='an'?options.anExpression:a.expression,'cs-actor',a,a.sprite)}).join('');
 var counterMask=layers.counter?'<div class="cs-counter-occluder" data-layer="counter-occluder" aria-hidden="true">'+layerImages(layers.counter,options)+'</div>':scene.counterOccluder?'<picture class="cs-counter-occluder" data-layer="counter-occluder" aria-hidden="true"><source media="(max-width:900px) and (orientation:portrait)" srcset="/art/'+escape(bg.mobile)+'"><img src="/art/'+escape(bg.desktop)+'" alt="" decoding="async"></picture>':'';
 var p=scene.sparrow,sparrow=sprite('sparrow',p.expression,'cs-sparrow'+(p.flight?' is-flying':'')).replace('style="','style="--sparrow-left:'+p.desktop.left+'%;--sparrow-top:'+p.desktop.top+'%;--sparrow-mobile-left:'+p.mobile.left+'%;--sparrow-mobile-top:'+p.mobile.top+'%;'+(p.compact?'--sparrow-compact-left:'+p.compact.left+'%;--sparrow-compact-top:'+p.compact.top+'%;':''));
 var label=scene.background==='bedroom'?'Căn phòng của An trước ngày đến trường':scene.background==='noodle-shop'?'An và những người bạn trong quán mì':scene.background==='school-office'?'An gặp cô trực ở phòng tìm đồ thất lạc':scene.background==='classroom'?'An ở lớp học':'An trên đường phố Thành Đô';
 return '<div class="cs-scene" data-scene="'+escape(id)+'" data-background="'+scene.background+'" role="img" aria-label="'+escape(label)+'"><picture class="cs-background" data-layer="background"><source media="(max-width:900px) and (orientation:portrait)" srcset="/art/'+bg.mobile+'"><img src="/art/'+bg.desktop+'" alt="" decoding="async"></picture><div class="cs-midground" data-layer="midground" aria-hidden="true">'+layerImages(midground,options)+'</div><div class="cs-back-actors" data-layer="background-characters">'+backActors+'</div>'+counterMask+(layers.tabletop?'<div class="cs-tabletop" data-layer="tabletop" aria-hidden="true">'+layerImages(layers.tabletop,options)+'</div>':'')+'<div class="cs-actors" data-layer="characters">'+actors+sparrow+'</div><div class="cs-foreground" data-layer="foreground" aria-hidden="true">'+layerImages(foreground,options)+'</div></div>';
}
function mount(host,id,options){
 options=options||{};host.classList.add('chimse-art');host.dataset.artMode=data.sprites.an.format==='svg'?'flat':'raster';host.dataset.sourcePositions=scenes[id].actors.some(function(a){return !!a.sourcePosition})?'true':'false';
 var sceneForeground=(scenes[id].layers||{}).foreground,foregroundMode=layerEntries(sceneForeground).some(function(layer){return layerVisible(layer,options)})?'shown':'hidden';
 var companionMode=options.companion||'';
 if(host.dataset.artScene!==id||host.dataset.artExpression!==(options.anExpression||'')||host.dataset.artForeground!==foregroundMode||host.dataset.artCompanion!==companionMode){
  host.innerHTML=render(null,id,options);host.dataset.artScene=id;host.dataset.artExpression=options.anExpression||'';host.dataset.artForeground=foregroundMode;host.dataset.artCompanion=companionMode;
 }
 if(!host.parentElement||typeof window==='undefined'||!window.ResizeObserver)return;
 var current=observers.get(host);if(current){var currentBackground=host.querySelector('.cs-background img');if(currentBackground){currentBackground.addEventListener('load',current.fit);if(currentBackground.complete&&currentBackground.naturalWidth)current.fit()}else current.fit();return}
 var stage=host.parentElement,dialogue=options.dialogue,glyph=options.glyph,bottomAvoid=options.bottomAvoid;
 var headerElement=options.header&&(stage.closest('.game-shell')?.querySelector('.game-top')||document.querySelector('.site-header'));
 function fit(){
  var r=stage.getBoundingClientRect(),keyboard=!!stage.closest('.keyboard-open'),header=options.header&&!keyboard?headerElement?Math.max(0,headerElement.getBoundingClientRect().bottom-r.top):56:0;
  var assetPortrait=!!(window.matchMedia&&window.matchMedia('(max-width:900px) and (orientation:portrait)').matches),portrait=assetPortrait&&r.height>r.width*.72,tabletPortrait=assetPortrait&&r.width>690,compact=!!glyph&&r.width>=690&&r.height<240,shortLandscape=!portrait&&r.height<300&&(r.width>r.height||r.width<600&&activeNoodleScene());
  var noodleCompact=!portrait&&r.width>=600&&r.width<=700&&r.height<=420&&activeNoodleScene();
  function activeNoodleScene(){return !!(data.scenes[host.dataset.artScene]&&data.scenes[host.dataset.artScene].background==='noodle-shop')}
  host.dataset.composition=noodleCompact?'compact':compact?'compact':portrait?'portrait':shortLandscape?'short-landscape':'wide';host.dataset.tabletPortrait=tabletPortrait&&portrait?'true':'false';stage.style.setProperty('--scene-header',header+'px');
  var activeScene=data.scenes[host.dataset.artScene],card=dialogue&&dialogue.getBoundingClientRect(),top=portrait&&card?card.bottom-r.top+10:header+8;
  // The office branch has three simultaneous characters on small phones. Give
  // their shared portrait art plate a little more height while keeping the
  // complete face silhouettes below the HTML dialogue card.
  if(portrait&&r.width<=360&&activeScene&&activeScene.background==='school-office'&&card)top=Math.max(header+8,card.bottom-r.top+2);
  if(glyph){top=compact?8:card?card.bottom-r.top+10:10;stage.style.setProperty('--glyph-top',top+'px');stage.style.setProperty('--glyph-left',compact?'46%':'12px');stage.style.setProperty('--glyph-width',compact?'25%':'calc(48% - 24px)')}
  var introCompact=!!(glyph&&r.width<=690&&!assetPortrait);if(introCompact)top=header+8;
  var fullStage=!!(activeScene&&activeScene.fullStageActors);host.style.setProperty('--actors-top',Math.max(0,top)+'px');host.style.setProperty('--actors-left',fullStage||introCompact?'0%':compact?(glyph?'32%':'74%'):glyph?'52%':portrait?'3%':'52%');host.style.setProperty('--actors-right',fullStage||introCompact?'0%':'3%');
  if(introCompact){host.style.setProperty('--actors-top','0px');var introAn=host.querySelector('.cs-actor[data-character="an"]');if(introAn){var introSize=Math.min(112,r.width*.18),faceTop=Math.min(32,Math.max(8,r.height*.2));introAn.style.width=introSize+'px';introAn.style.height=introSize+'px';introAn.style.left=(r.width*.55-introSize/2)+'px';introAn.style.top=(faceTop-introSize*.02)+'px';introAn.style.bottom='auto';introAn.style.transform='none'}}
  if(bottomAvoid){host.style.setProperty('--actors-top',(header+8)+'px');host.style.setProperty('--actors-bottom',portrait?Math.max(0,r.bottom-bottomAvoid.getBoundingClientRect().top)+'px':'0px')}
  var background=host.querySelector('.cs-background img'),backgroundSource=host.querySelector('.cs-background source');
  var nativeArt=data.sprites.an.format==='svg',sourceVariant=portrait?'mobile':shortLandscape||noodleCompact?'compact':'desktop';
  if(backgroundSource&&nativeArt){var media=portrait?'all':'not all';if(backgroundSource.media!==media)backgroundSource.media=media;var bgSpec=data.backgrounds[activeScene.background],backgroundPath='/art/'+((shortLandscape||noodleCompact)&&bgSpec.compact?bgSpec.compact:bgSpec.desktop);if(background.getAttribute('src')!==backgroundPath)background.src=backgroundPath}
  function sourceGeometry(){var scale=Math.max(r.width/background.naturalWidth,r.height/background.naturalHeight);return {scale:scale,x:(r.width-background.naturalWidth*scale)/2,y:(r.height-background.naturalHeight*scale)*(nativeArt?1:.52)}}
  function fitLayerSet(selector,value,visible){var parent=host.querySelector(selector),imgs=parent?Array.from(parent.querySelectorAll('img')):[],configs=layerEntries(value);imgs.forEach(function(img){img.style.height='';img.style.objectFit='';img.style.transform='translate(-50%,-50%)';var cfg=configs[Number(img.dataset.layerIndex)]||{},native=!!cfg.mobileAsset,anchor=visible?(native?(cfg[sourceVariant]||cfg.desktop):(shortLandscape||noodleCompact?cfg.compact:tabletPortrait&&cfg.tablet?cfg.tablet:assetPortrait?cfg.mobile:cfg.desktop)):null;if(background&&background.naturalWidth&&anchor){var asset=native?(portrait?cfg.mobileAsset:(shortLandscape||noodleCompact)&&cfg.compactAsset?cfg.compactAsset:cfg.asset):cfg.asset,src='/art/'+asset;img.dataset.asset=asset;if(img.getAttribute('src')!==src)img.src=src;var g=sourceGeometry();img.style.left=(g.x+anchor.x*g.scale)+'px';img.style.top=(g.y+anchor.y*g.scale)+'px';img.style.width=(anchor.width*g.scale)+'px'}else{img.removeAttribute('src');img.style.width='0px'}})}
  fitLayerSet('.cs-midground',(activeScene&&activeScene.layers.midground)||null,true);
  fitLayerSet('.cs-counter-occluder',(activeScene&&activeScene.layers.counter)||null,true);
  fitLayerSet('.cs-tabletop',(activeScene&&activeScene.layers.tabletop)||null,true);
  fitLayerSet('.cs-foreground',(activeScene&&activeScene.layers.foreground)||null,host.dataset.artForeground!=='hidden');
  if(nativeArt&&background&&background.naturalWidth){var source=sourceGeometry();host.querySelectorAll('[data-source-position]').forEach(function(actor){var positions=JSON.parse(actor.dataset.sourcePosition),anchor=positions[sourceVariant]||positions.desktop;actor.style.left=(source.x+anchor.x*source.scale)+'px';actor.style.top=(source.y+anchor.y*source.scale)+'px';actor.style.bottom='auto';actor.style.width=(anchor.width*source.scale)+'px';actor.style.transform='translate(-50%,-50%)'})}
  if(nativeArt&&shortLandscape&&r.width<600&&activeScene.background==='noodle-shop'){
   var compactGeo=sourceGeometry(),paintedCounterTop=compactGeo.y+380*.613*compactGeo.scale,liuActor=host.querySelector('.cs-back-actors .cs-actor[data-character="liu"]');
   if(liuActor){var faceTop=card?card.bottom-r.top+12:header+10,liuSize=Math.min(r.width*.24,r.height*.48,Math.max(1,(paintedCounterTop-faceTop-2)/.34));liuActor.style.width=liuSize+'px';liuActor.style.left=(r.width*.86-liuSize/2)+'px';liuActor.style.top=(faceTop-liuSize*.02)+'px';liuActor.style.bottom='auto';liuActor.style.transform='none'}
  }
  // Portrait noodle composition reserves the actual dialogue height before placing any art.
  // Keep sprite proportions; only room/furniture plates adapt to the available picture area.
  var noodlePortrait=nativeArt&&portrait&&activeScene.background==='noodle-shop',noodleLandscape=nativeArt&&noodleCompact,noodleTop=card?card.bottom-r.top+10:header+8,noodleHeight=Math.max(1,r.height-noodleTop),w=r.width,h=noodleHeight;
  // Preserve a readable face guide on narrow phone art plates; grow the actor
  // around its source-position center, then keep the guide itself in the stage.
  if(nativeArt&&r.width<=360&&activeScene.background!=='noodle-shop'){host.querySelectorAll('.cs-actor[data-source-position]').forEach(function(actor){var f=actor.dataset.face.split(',').map(Number),fx=Math.max(.01,f[2]-f[0]),fy=Math.max(.01,f[3]-f[1]),minimum=Math.max(28/fx,28/fy),size=Math.max(actor.getBoundingClientRect().width,minimum),cx=parseFloat(actor.style.left),cy=parseFloat(actor.style.top),minX=-((f[0]+f[2])/2-.5)*size,maxX=r.width-((f[0]+f[2])/2-.5)*size,minY=(card?card.bottom-r.top+6:header+6)-size*(f[1]-.5),maxY=r.height-size*(f[3]-.5);actor.style.width=size+'px';actor.style.left=Math.max(minX,Math.min(maxX,cx))+'px';actor.style.top=Math.max(minY,Math.min(maxY,cy))+'px'})}
  if(background)background.style.objectFit=noodlePortrait?'fill':'';
  function placePlate(img,bounds,target){if(!img||!img.getAttribute('src'))return;var sx=target[2]/bounds[2],sy=target[3]/bounds[3];img.style.left=(target[0]-bounds[0]*sx)+'px';img.style.top=(target[1]-bounds[1]*sy)+'px';img.style.width=(600*sx)+'px';img.style.height=(900*sy)+'px';img.style.transform='none';img.style.objectFit='fill'}
  if(noodlePortrait){
   var t=noodleTop;
   placePlate(host.querySelector('.cs-midground img'),[260,365,340,90],[w*.46,t,w*.49,h*.14]);
   placePlate(host.querySelector('.cs-counter-occluder img'),[230,525,390,175],[w*.40,t+h*.40,w*.60,h*.26]);
   placePlate(host.querySelector('.cs-tabletop img'),[5,650,590,140],[0,t+h*.57,w,h*.31]);
   placePlate(host.querySelector('.cs-foreground img[data-asset*="table-apron"]'),[5,790,590,110],[0,t+h*.88,w,h*.12]);
   host.querySelectorAll('.cs-actor').forEach(function(actor){var liu=actor.dataset.character==='liu',f=actor.dataset.face.split(',').map(Number),size=Math.max(28/(f[2]-f[0]),28/(f[3]-f[1]),Math.min(w*(liu?.24:.31),h*(liu?.55:.72))),faceBottom=t+h*(liu?.40:.57)-2,x=w*(liu?.86:actor.dataset.character==='an'?.25:.67);actor.style.width=size+'px';actor.style.left=x+'px';actor.style.top=(faceBottom+size*(.5-f[3]))+'px'});
   var bowlScale=Math.min(w*.25,h*.32)/96;
   host.querySelectorAll('.cs-foreground img[data-asset*="/bowl"],.cs-foreground img[data-asset*="/steam"]').forEach(function(img){placePlate(img,[0,0,600,900],[w*.46-300*bowlScale,t+h*.78-740*bowlScale,600*bowlScale,900*bowlScale])});
  }
  // At short landscape widths, reserve the real dialogue footprint first. Keep
  // the menu in the remaining right-hand area and actors on the authored table.
  if(noodleLandscape){
   var menu=host.querySelector('.cs-midground img'),menuScale=Math.min((w*.34)/605,(r.height*.30)/149),menuLeft=w*.47,menuTop=Math.max(8,header+8);
   if(menu){var menuPath='/art/flat/layers/menu.svg';if(menu.getAttribute('src')!==menuPath)menu.src=menuPath;menu.style.left=(menuLeft-515*menuScale)+'px';menu.style.top=(menuTop-71*menuScale)+'px';menu.style.width=(1200*menuScale)+'px';menu.style.height=(620*menuScale)+'px';menu.style.transform='none';menu.style.objectFit='fill'}
   var compactGeometry=sourceGeometry(),counterTop=compactGeometry.y+380*.613*compactGeometry.scale;
   host.querySelectorAll('.cs-actor').forEach(function(actor){var name=actor.dataset.character,size=Math.min(w*.25,r.height*.72),x=name==='liu'?w*.94:name==='an'?w*.48:w*.70,y=name==='liu'?noodleTop+h*.46:noodleTop+h*.72,actorTop=name==='liu'?counterTop-size*.39:Math.min(y-size*.64,r.height-size*.55);actor.style.width=size+'px';actor.style.height=size+'px';actor.style.left=(x-size/2)+'px';actor.style.top=actorTop+'px';actor.style.bottom='auto';actor.style.transform='none'});
  }
  var bird=host.querySelector('.cs-sparrow'),actorsLayer=host.querySelector('.cs-actors');if(bird&&actorsLayer){
   bird.classList.toggle('is-flying',!!activeScene.sparrow.flight||shortLandscape);
   bird.style.removeProperty('left');bird.style.removeProperty('top');
   if(nativeArt&&activeScene.sparrow.sourcePosition&&background&&background.naturalWidth){var birdSource=sourceGeometry(),birdAnchor=activeScene.sparrow.sourcePosition[sourceVariant]||activeScene.sparrow.sourcePosition.desktop;bird.style.width=(birdAnchor.width*birdSource.scale)+'px';bird.style.left=(birdSource.x+birdAnchor.x*birdSource.scale-birdAnchor.width*birdSource.scale/2)+'px';bird.style.top=(birdSource.y+birdAnchor.y*birdSource.scale-birdAnchor.width*birdSource.scale/2)+'px'}
   if(introCompact){var introBirdSize=28;bird.style.width=introBirdSize+'px';bird.style.left=(r.width*.62-introBirdSize/2)+'px';bird.style.top='8px';bird.style.bottom='auto';bird.style.transform='none'}
   if(noodlePortrait){var birdSize=Math.min(32,noodleHeight*.22);bird.style.width=birdSize+'px';bird.style.left=(r.width*.15-birdSize/2)+'px';bird.style.top=Math.max(noodleTop+8,noodleTop+noodleHeight*.06-birdSize*.5)+'px'}
   var preferred=bird.getBoundingClientRect(),ar=actorsLayer.getBoundingClientRect(),size=preferred.width;
   var faces=Array.from(host.querySelectorAll('.cs-actors .cs-actor,.cs-back-actors .cs-actor')).map(function(actor){var a=actor.getBoundingClientRect(),f=actor.dataset.face.split(',').map(Number);return {left:a.left+a.width*f[0],top:a.top+a.height*f[1],right:a.left+a.width*f[2],bottom:a.top+a.height*f[3]}});
  var blockers=Array.from(stage.querySelectorAll('.story-ui,.intro-dialogue,.glyph-frame,.opening,.hero-copy,.cs-midground img[data-asset*="menu-panels"]')).filter(function(el){return el!==bird&&el.getBoundingClientRect().width>0}).map(function(el){return el.getBoundingClientRect()});
   function collision(a,b){return Math.max(0,Math.min(a.right,b.right)-Math.max(a.left,b.left))*Math.max(0,Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top))>1}
   function safe(a){return a.left>=r.left-1&&a.top>=r.top-1&&a.right<=r.right+1&&a.bottom<=r.bottom+1&&!faces.some(function(f){return collision(a,f)})&&!blockers.some(function(b){return collision(a,b)})}
   if(!safe(preferred)){
    var points=[];for(var gx=0;gx<=20;gx++){var x=gx/20;[.02,.12,.22,.32,.42,.52,.62,.72,.82,.92].forEach(function(y){var candidate={x:x,y:y,score:Math.pow(x-(preferred.left-ar.left)/Math.max(1,ar.width-size),2)+Math.pow(y-(preferred.top-ar.top)/Math.max(1,ar.height-size),2)};points.push(candidate)})}
    points.sort(function(a,b){return a.score-b.score});
    for(var i=0;i<points.length;i++){var x=points[i].x*(ar.width-size),y=points[i].y*(ar.height-size);bird.style.left=x+'px';bird.style.top=y+'px';if(safe(bird.getBoundingClientRect()))break}
   }
   var b=bird.getBoundingClientRect(),hitSize=Math.min(b.width+6,r.width,r.height);stage.style.setProperty('--sparrow-hit-left',Math.max(0,Math.min(r.width-hitSize,b.left-r.left-3))+'px');stage.style.setProperty('--sparrow-hit-top',Math.max(0,Math.min(r.height-hitSize,b.top-r.top-3))+'px');stage.style.setProperty('--sparrow-hit-size',hitSize+'px')
  }
 }
 var observer=new window.ResizeObserver(fit);observer.observe(stage);if(dialogue)observer.observe(dialogue);if(glyph)observer.observe(glyph);if(bottomAvoid)observer.observe(bottomAvoid);if(headerElement)observer.observe(headerElement,{box:'border-box'});
 var backgroundImage=host.querySelector('.cs-background img');if(backgroundImage)backgroundImage.addEventListener('load',fit);
 observers.set(host,{fit:fit,observer:observer});fit();
}
function preload(id){
 if(typeof window==='undefined'||!window.Image||!scenes[id])return;
 var bg=data.backgrounds[scenes[id].background],portrait=window.matchMedia('(max-width:900px) and (orientation:portrait)').matches,stage=typeof document!=='undefined'&&document.querySelector('#gameOverlay:not([hidden]) #storyStage'),rect=stage&&stage.getBoundingClientRect(),compact=rect&&rect.height<300&&rect.width>rect.height;
 if(rect)portrait=portrait&&rect.height>rect.width*.72;
 var asset=compact&&bg.compact?bg.compact:portrait?bg.mobile:bg.desktop;
 if(preloaded.has(asset))return;preloaded.add(asset);var image=new window.Image();image.decoding='async';image.src='/art/'+asset;
}
function react(host,name){
 if(!host||typeof window==='undefined'||window.matchMedia('(prefers-reduced-motion:reduce)').matches)return false;
 var target=name==='sparrow'?host.querySelector('.cs-sparrow'):host.querySelector('.cs-actor[data-character="'+name+'"]');if(!target||!target.animate)return false;
 var previous=reactions.get(target);if(previous)previous.forEach(function(a){a.cancel()});
 var animations=[target.animate([{translate:'0 0'},{translate:'0 -5px',offset:.42},{translate:'0 0'}],{duration:520,easing:'ease-out'})],wing=target.querySelector('.cs-wing');
 if(wing)animations.push(wing.animate([{transform:'rotate(0deg)'},{transform:'rotate(-35deg)',offset:.3},{transform:'rotate(8deg)',offset:.6},{transform:'rotate(0deg)'}],{duration:520,easing:'ease-in-out'}));
 reactions.set(target,animations);return true;
}
function validate(expected){
 var errors=[];expected=expected||data.sceneIds;
 Object.keys(data.sprites).forEach(function(name){var s=data.sprites[name],native=s.format==='svg',limit=native?s.frameCount:(s.columns||1)*(s.rows||1);if(!native&&(!Number.isInteger(s.columns)||s.columns<1||!Number.isInteger(s.rows)||s.rows<1))errors.push('Invalid sprite grid '+name);Object.keys(s.frames||{}).forEach(function(expression){var frame=s.frames[expression];if(!Number.isInteger(frame)||frame<0||frame>=limit||native&&!s.frameAssets[expression])errors.push('Invalid sprite frame '+name+'/'+expression)})});
 expected.forEach(function(id){var s=scenes[id];if(!s){errors.push('Missing scene '+id);return}
  if(!data.backgrounds[s.background])errors.push('Missing background '+id);
  var variants=s.actors.concat(Object.entries(s.companions||{}).map(function(entry){return Object.assign({companionRoute:entry[0]},entry[1])}));
  variants.forEach(function(a){var sprite=data.sprites[a.sprite||a.character];if(!sprite||sprite.frames[a.expression]===undefined)errors.push('Missing sprite frame '+id+'/'+a.character+'/'+a.expression+(a.companionRoute?'/'+a.companionRoute:''));['desktop','mobile'].forEach(function(device){var p=a[device];if(!p||p.left<0||p.width<=0||p.left+p.width>100||p.bottom<0)errors.push('Invalid position '+id+'/'+a.character+'/'+device)})});
  if(s.sparrow.asset!==data.sprites.sparrow.asset)errors.push('Invalid Sparrow '+id);
 });return errors;
}
return {version:data.version,sceneIds:data.sceneIds,scenes:scenes,sprites:data.sprites,backgrounds:data.backgrounds,render:render,mount:mount,setExpression:setExpression,react:react,preload:preload,validate:validate};
})();
