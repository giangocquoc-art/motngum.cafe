/* Shared raster scene renderer. Data is compiled from the authored art manifest. */
var HSKSceneLayers=(function(){"use strict";
var data=HSKSceneManifest,scenes=data.scenes,observers=new WeakMap(),preloaded=new Set();
function escape(value){return String(value).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
function sprite(name,expression,extra,position){
 var s=data.sprites[name],frame=s.frames[expression];
 if(frame===undefined)throw Error("Missing expression: "+name+"/"+expression);
 var x=s.columns===1?0:(frame%s.columns)/(s.columns-1)*100,y=s.rows===1?0:Math.floor(frame/s.columns)/(s.rows-1)*100;
 var style='background-image:url(/art/'+s.asset+');background-size:'+s.columns*100+'% '+s.rows*100+'%;background-position:'+x+'% '+y+'%;';
 if(position){style+='--actor-left:'+position.desktop.left+'%;--actor-width:'+position.desktop.width+'%;--actor-bottom:'+position.desktop.bottom+'%;--actor-mobile-left:'+position.mobile.left+'%;--actor-mobile-width:'+position.mobile.width+'%;--actor-mobile-bottom:'+position.mobile.bottom+'%;';if(position.tablet)style+='--actor-tablet-left:'+position.tablet.left+'%;--actor-tablet-width:'+position.tablet.width+'%;--actor-tablet-bottom:'+position.tablet.bottom+'%;'}
 return '<div class="'+extra+'" data-character="'+name+'" data-expression="'+expression+'" data-face="'+s.face.join(',')+'" data-asset="'+s.asset+'" style="'+style+'" aria-hidden="true"></div>';
}
function setExpression(host,name,expression){
 var spec=data.sprites[name];if(!spec)throw Error("Unknown sprite: "+name);
 var frame=spec.frames[expression];if(frame===undefined)throw Error("Missing expression: "+name+"/"+expression);
 if(!host||typeof host.querySelector!=="function")return false;
 var target=name==='sparrow'?host.querySelector('.cs-sparrow'):host.querySelector('.cs-actor[data-character="'+name+'"]');
 if(!target)return false;
 var x=spec.columns===1?0:(frame%spec.columns)/(spec.columns-1)*100,y=spec.rows===1?0:Math.floor(frame/spec.columns)/(spec.rows-1)*100;
 target.style.backgroundPosition=x+'% '+y+'%';target.dataset.expression=expression;return true;
}
function render(place,id,options){
 var scene=scenes[id];if(!scene)throw Error("Unknown art scene: "+id);
 var bg=data.backgrounds[scene.background],midground=scene.layers.midground,foreground=scene.layers.foreground,showForeground=!!foreground&&(!foreground.visibleWhen||options&&options.showForeground===true),actors=scene.actors.map(function(a){return sprite(a.character,options&&options.anExpression&&a.character==='an'?options.anExpression:a.expression,'cs-actor',a)}).join('');
 var p=scene.sparrow,sparrow=sprite('sparrow',p.expression,'cs-sparrow').replace('style="','style="--sparrow-left:'+p.desktop.left+'%;--sparrow-top:'+p.desktop.top+'%;--sparrow-mobile-left:'+p.mobile.left+'%;--sparrow-mobile-top:'+p.mobile.top+'%;');
 var label=scene.background==='bedroom'?'Căn phòng của An trước ngày đến trường':scene.background==='noodle-shop'?'An và những người bạn trong quán mì':scene.background==='school-office'?'An gặp cô trực ở phòng tìm đồ thất lạc':scene.background==='classroom'?'An ở lớp học':'An trên đường phố Thành Đô';
 return '<div class="cs-scene" data-scene="'+escape(id)+'" data-background="'+scene.background+'" role="img" aria-label="'+escape(label)+'"><picture class="cs-background" data-layer="background"><source media="(max-width:900px) and (orientation:portrait)" srcset="/art/'+bg.mobile+'"><img src="/art/'+bg.desktop+'" alt="" decoding="async"></picture><div class="cs-midground" data-layer="midground" aria-hidden="true">'+(midground?'<img alt="" data-asset="'+midground.asset+'">':'')+'</div><div class="cs-actors" data-layer="characters">'+actors+sparrow+'</div><div class="cs-foreground" data-layer="foreground" aria-hidden="true">'+(showForeground?'<img src="/art/'+foreground.asset+'" alt="" data-asset="'+foreground.asset+'">':'')+'</div></div>';
}
function mount(host,id,options){
 options=options||{};host.classList.add('chimse-art');
 var sceneForeground=(scenes[id].layers||{}).foreground,foregroundMode=sceneForeground&&(!sceneForeground.visibleWhen||options.showForeground===true)?'shown':'hidden';
 if(host.dataset.artScene!==id||host.dataset.artExpression!==(options.anExpression||'')||host.dataset.artForeground!==foregroundMode){
  host.innerHTML=render(null,id,options);host.dataset.artScene=id;host.dataset.artExpression=options.anExpression||'';host.dataset.artForeground=foregroundMode;
 }
 if(!host.parentElement||typeof window==='undefined'||!window.ResizeObserver)return;
 var current=observers.get(host);if(current){current.fit();return}
 var stage=host.parentElement,dialogue=options.dialogue,glyph=options.glyph,bottomAvoid=options.bottomAvoid;
 var headerElement=options.header&&(stage.closest('.game-shell')?.querySelector('.game-top')||document.querySelector('.site-header'));
 function fit(){
  var r=stage.getBoundingClientRect(),keyboard=!!stage.closest('.keyboard-open'),header=options.header&&!keyboard?headerElement?Math.max(0,headerElement.getBoundingClientRect().bottom-r.top):56:0;
  var assetPortrait=!!(window.matchMedia&&window.matchMedia('(max-width:900px) and (orientation:portrait)').matches),portrait=assetPortrait&&r.height>r.width*.72,tabletPortrait=assetPortrait&&r.width>690,compact=!!glyph&&r.width>=690&&r.height<240,shortLandscape=!portrait&&r.height<300&&r.width>r.height;
  host.dataset.composition=compact?'compact':portrait?'portrait':shortLandscape?'short-landscape':'wide';host.dataset.tabletPortrait=tabletPortrait&&portrait?'true':'false';stage.style.setProperty('--scene-header',header+'px');
  var card=dialogue&&dialogue.getBoundingClientRect(),top=portrait&&card?card.bottom-r.top+10:header+8;
  if(glyph){top=compact?8:card?card.bottom-r.top+10:10;stage.style.setProperty('--glyph-top',top+'px');stage.style.setProperty('--glyph-left',compact?'46%':'12px');stage.style.setProperty('--glyph-width',compact?'25%':'calc(48% - 24px)')}
  host.style.setProperty('--actors-top',Math.max(0,top)+'px');host.style.setProperty('--actors-left',compact?'74%':glyph?'52%':portrait?'3%':'52%');
  if(bottomAvoid){host.style.setProperty('--actors-top',(header+8)+'px');host.style.setProperty('--actors-bottom',portrait?Math.max(0,r.bottom-bottomAvoid.getBoundingClientRect().top)+'px':'0px')}
  var background=host.querySelector('.cs-background img'),foreground=host.querySelector('.cs-foreground'),prop=foreground&&foreground.querySelector('img'),activeScene=data.scenes[host.dataset.artScene];
  if(prop&&background&&background.naturalWidth){
   var cfg=(activeScene&&activeScene.layers.foreground)||{},anchor=host.dataset.artForeground==='hidden'?null:shortLandscape&&cfg.compact?cfg.compact:tabletPortrait&&cfg.tablet?cfg.tablet:assetPortrait?cfg.mobile:cfg.desktop;
   if(anchor){var scale=Math.max(r.width/background.naturalWidth,r.height/background.naturalHeight),drawW=background.naturalWidth*scale,drawH=background.naturalHeight*scale,offsetX=(r.width-drawW)/2,offsetY=(r.height-drawH)*.52;
    foreground.style.left=(offsetX+anchor.x*scale)+'px';foreground.style.top=(offsetY+anchor.y*scale)+'px';prop.style.width=(anchor.width*scale)+'px';
   }
  }
  var midImage=host.querySelector('.cs-midground img'),midConfig=(activeScene&&activeScene.layers.midground)||{},midAnchor=shortLandscape&&midConfig.compact?midConfig.compact:tabletPortrait&&midConfig.tablet?midConfig.tablet:assetPortrait?midConfig.mobile:midConfig.desktop;
  if(midImage&&background&&background.naturalWidth){if(midAnchor){var midSrc='/art/'+midImage.dataset.asset;if(midImage.getAttribute('src')!==midSrc){midImage.src=midSrc}var sceneScale=Math.max(r.width/background.naturalWidth,r.height/background.naturalHeight),midW=background.naturalWidth*sceneScale,midH=background.naturalHeight*sceneScale,midX=(r.width-midW)/2,midY=(r.height-midH)*.52;midImage.style.left=(midX+midAnchor.x*sceneScale)+'px';midImage.style.top=(midY+midAnchor.y*sceneScale)+'px';midImage.style.width=(midAnchor.width*sceneScale)+'px'}else{midImage.removeAttribute('src');midImage.style.width='0px'}}
  var bird=host.querySelector('.cs-sparrow'),actorsLayer=host.querySelector('.cs-actors');if(bird&&actorsLayer){
   bird.style.removeProperty('left');bird.style.removeProperty('top');
   var preferred=bird.getBoundingClientRect(),ar=actorsLayer.getBoundingClientRect(),size=preferred.width;
   var faces=Array.from(actorsLayer.querySelectorAll('.cs-actor')).map(function(actor){var a=actor.getBoundingClientRect(),f=actor.dataset.face.split(',').map(Number);return {left:a.left+a.width*f[0],top:a.top+a.height*f[1],right:a.left+a.width*f[2],bottom:a.top+a.height*f[3]}});
   var blockers=Array.from(stage.querySelectorAll('.story-ui,.intro-dialogue,.glyph-frame,.opening,.hero-copy,.cs-midground img,.cs-foreground img')).filter(function(el){return el!==bird&&el.getBoundingClientRect().width>0}).map(function(el){return el.getBoundingClientRect()});
   function collision(a,b){return Math.max(0,Math.min(a.right,b.right)-Math.max(a.left,b.left))*Math.max(0,Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top))>1}
   function safe(a){return a.left>=r.left-1&&a.top>=r.top-1&&a.right<=r.right+1&&a.bottom<=r.bottom+1&&!faces.some(function(f){return collision(a,f)})&&!blockers.some(function(b){return collision(a,b)})}
   if(!safe(preferred)){
    var points=[];for(var gx=0;gx<=20;gx++){var x=gx/20;[.02,.12,.22,.32,.42,.52,.62,.72,.82,.92].forEach(function(y){var candidate={x:x,y:y,score:Math.pow(x-(preferred.left-ar.left)/Math.max(1,ar.width-size),2)+Math.pow(y-(preferred.top-ar.top)/Math.max(1,ar.height-size),2)};points.push(candidate)})}
    points.sort(function(a,b){return a.score-b.score});
    for(var i=0;i<points.length;i++){var x=points[i].x*(ar.width-size),y=points[i].y*(ar.height-size);bird.style.left=x+'px';bird.style.top=y+'px';if(safe(bird.getBoundingClientRect()))break}
   }
   var b=bird.getBoundingClientRect();stage.style.setProperty('--sparrow-hit-left',(b.left-r.left-3)+'px');stage.style.setProperty('--sparrow-hit-top',(b.top-r.top-3)+'px');stage.style.setProperty('--sparrow-hit-size',(b.width+6)+'px')
  }
 }
 var observer=new window.ResizeObserver(fit);observer.observe(stage);if(dialogue)observer.observe(dialogue);if(glyph)observer.observe(glyph);if(bottomAvoid)observer.observe(bottomAvoid);if(headerElement)observer.observe(headerElement);
 var backgroundImage=host.querySelector('.cs-background img');if(backgroundImage)backgroundImage.addEventListener('load',fit);
 observers.set(host,{fit:fit,observer:observer});fit();
}
function preload(id){
 if(typeof window==='undefined'||!window.Image||!scenes[id])return;
 var bg=data.backgrounds[scenes[id].background],portrait=window.matchMedia('(max-width:900px) and (orientation:portrait)').matches,asset=portrait?bg.mobile:bg.desktop;
 if(preloaded.has(asset))return;preloaded.add(asset);var image=new window.Image();image.decoding='async';image.src='/art/'+asset;
}
function validate(expected){
 var errors=[];expected=expected||data.sceneIds;
 expected.forEach(function(id){var s=scenes[id];if(!s){errors.push('Missing scene '+id);return}
  if(!data.backgrounds[s.background])errors.push('Missing background '+id);
  s.actors.forEach(function(a){var sprite=data.sprites[a.character];if(!sprite||sprite.frames[a.expression]===undefined)errors.push('Missing sprite frame '+id+'/'+a.character);['desktop','mobile'].forEach(function(device){var p=a[device];if(!p||p.left<0||p.width<=0||p.left+p.width>100||p.bottom<0)errors.push('Invalid position '+id+'/'+a.character+'/'+device)})});
  if(s.sparrow.asset!==data.sprites.sparrow.asset)errors.push('Invalid Sparrow '+id);
 });return errors;
}
return {version:data.version,sceneIds:data.sceneIds,scenes:scenes,sprites:data.sprites,backgrounds:data.backgrounds,render:render,mount:mount,setExpression:setExpression,preload:preload,validate:validate};
})();
