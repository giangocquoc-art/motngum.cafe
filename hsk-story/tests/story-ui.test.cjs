const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),vm=require("node:vm"),path=require("node:path");
const folder=path.resolve(__dirname,"..");
function loadModule(file,name){const box={module:{exports:{}}};vm.runInNewContext(fs.readFileSync(path.join(folder,file),"utf8"),box,{filename:file});return box.module.exports}
const C=loadModule("game-core.js"),M=loadModule("curriculum-data.js"),K=loadModule("learning-kit.js"),D=loadModule("story-director.js"),B=loadModule("story-beats.js"),Content=loadModule("content-manifest.js"),E=loadModule("active-encounter.js"),Graph=loadModule("story-graph.js"),Runtime=loadModule("story-runtime.js"),Art=loadModule("scene-art.js"),IO=loadModule("save-io.js"),World=loadModule("scene-world.js"),Skills=loadModule("skill-sampler.js"),Threads=loadModule("story-threads.js");
const html=fs.readFileSync(path.join(folder,"index.html"),"utf8"),source=fs.readFileSync(path.join(folder,"app.js"),"utf8");
const layerContext={HSKSceneManifest:loadModule("scene-manifest.js"),HSKFlatArt:loadModule("scene-flat-art.js")};vm.runInNewContext(fs.readFileSync(path.join(folder,"scene-renderer.js"),"utf8"),layerContext);const Layers=layerContext.HSKSceneLayers;
const ids=Array.from(html.matchAll(/id="([^"]+)"/g),x=>x[1]);
test("small story status and notebook Pinyin use shared high-contrast text colors",()=>{
 const css=fs.readFileSync(path.join(folder,"style.css"),"utf8"),tokens=fs.readFileSync(path.join(folder,"readability.css"),"utf8");
 assert.match(css,/#stepText\{font-size:10px;color:var\(--text-muted\)\}/);
 assert.match(css,/\.notebook-pinyin\{font-size:11px;color:var\(--accent-text\)\}/);
 assert.match(tokens,/\.sparrow-header \.identity-copy small\s*\{\s*color:\s*var\(--ink\)/);
 assert.match(tokens,/@media \(max-height: 620px\)\s*\{\s*\.sparrow-header \.identity-copy small\s*\{\s*display: none/);
 assert.match(tokens,/--text-muted:\s*var\(--cs-muted\)/i);assert.match(tokens,/--accent-text:\s*var\(--cs-terra\)/i);
 assert.match(tokens,/\.sparrow-hero \.review-entry-button\s*\{[^}]*min-height:\s*42px[^}]*font-size:\s*13px/s);
 const mobile=tokens.match(/@media \(max-width: 690px\)\s*\{([\s\S]*?)\n\}/)?.[1]||"";
 assert.match(mobile,/\.sparrow-hero \.review-entry-button\s*\{[^}]*min-height:\s*40px[^}]*font-size:\s*12px/s);
 assert.doesNotMatch(mobile,/\.sparrow-hero \.review-entry-button\s*\{[^}]*display:\s*none/s);
 const luminance=hex=>{const channels=hex.match(/[a-f\d]{2}/gi).map(x=>parseInt(x,16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);return .2126*channels[0]+.7152*channels[1]+.0722*channels[2]};
 const ratio=(front,back)=>{const a=luminance(front),b=luminance(back);return (Math.max(a,b)+.05)/(Math.min(a,b)+.05)};
 const theme=fs.readFileSync(path.join(folder,"theme.css"),"utf8"),color=name=>theme.match(new RegExp('--cs-'+name+':(#[a-f0-9]{6})','i'))[1];
 assert.ok(ratio(color('muted'),color('surface'))>=4.5,"story status must meet normal-text contrast");
 assert.ok(ratio(color('terra'),color('surface'))>=4.5,"notebook Pinyin must meet normal-text contrast");
 assert.ok(ratio(color('ink'),color('paper'))>=4.5,"the mobile brand tagline must remain readable over the hero wash");
 assert.ok(ratio(color('sky-ink'),color('surface'))>=4.5,"the story notebook link must remain readable on its quiet button surface");
 assert.match(tokens,/\.review-screen \.logo small\s*\{[^}]*font-size:\s*9px/s);
 assert.match(html,/id="closeGame" aria-label="Về trang truyện">← <span>Về trang truyện<\/span>/,
  "the visible back-button label and accessible name must match");
 assert.match(tokens,/\.game-shell \.input-wrap input\s*\{[^}]*font-size:\s*16px !important/s,
  "learner answer text remains legible and avoids mobile focus zoom");
 assert.match(tokens,/\.game-shell \.speaker-label\s*\{[^}]*font-size:\s*12px !important/s,
  "speaker identity stays readable while the keyboard is open");
 assert.match(tokens,/\.ai-tutor-form textarea\s*\{[^}]*font-size:\s*16px/s,
  "the tutor composer stays readable and avoids mobile browser text zoom");
 assert.match(tokens,/\.review-screen #exerciseCard \.options button\s*\{[^}]*min-height:\s*34px[^}]*font-size:\s*11px/s);
 assert.match(tokens,/\.intro-screen \.intro-dialogue > p:last-child\s*\{[^}]*font-size:\s*11px[^}]*line-height:\s*1\.4/s);
 assert.match(tokens,/\.ai-tutor-note\s*\{[^}]*line-height:\s*1\.45/s);
 assert.match(tokens,/@media \(max-width: 690px\) and \(max-height: 480px\)\s*\{[\s\S]*?\.sparrow-hero \.hero-copy\s*\{[^}]*max-height:\s*none[^}]*overflow:\s*visible/s,
  "short phone layouts must not clip the opening controls");
 assert.match(tokens,/@media \(max-height: 420px\)\s*\{\s*\.review-screen \.book\s*\{\s*flex-basis:\s*208px/s,
  "short review layouts must reserve enough room for every answer action");
 assert.match(tokens,/@media \(max-width: 690px\) and \(min-height: 621px\)\s*\{\s*\.intro-learning\s*\{\s*flex-basis:\s*clamp\(350px, 50dvh, 430px\)/);
 assert.match(html,/class="review-entry-button" href="\/ren-luyen\.html">Ôn lại trong sổ của An<\/a>/,
  "the homepage review action uses a short, scannable label");
 assert.match(tokens,/@media \(max-width: 690px\) and \(max-height: 480px\)[\s\S]*?\.sparrow-hero \.review-entry-button\s*\{[^}]*min-height:\s*40px[^}]*font-size:\s*12px/s,
  "the review action keeps readable text and a comfortable touch target on short phones");
 assert.match(css,/#storyInterlude>p\{font-size:11px;line-height:1\.35\}/,
  "compact scenes keep story narration above 10px");
});
test("short landscape dialogue stays within the illustration area while keeping translation and audio",()=>{
 const css=fs.readFileSync(path.join(folder,"style.css"),"utf8");
 const tokens=fs.readFileSync(path.join(folder,"readability.css"),"utf8");
 const medium=tokens.match(/@media \(orientation: landscape\) and \(min-height: 341px\) and \(max-height: 420px\)\s*\{([\s\S]*?)\n\}/)?.[1]||"";
 const compact=tokens.match(/@media \(orientation: landscape\) and \(max-height: 340px\)\s*\{([\s\S]*?)\n\}/)?.[1]||"";
 assert.match(medium,/\.game-shell:not\(\.keyboard-open\) #storyStage \.story-ui\s*\{\s*top:\s*calc\(var\(--scene-header, 56px\) - 4px\)/);
 assert.match(compact,/\.game-shell:not\(\.keyboard-open\) #storyStage \.story-ui\s*\{[^}]*max-height:\s*calc\(100% - 64px\)[^}]*overflow:\s*hidden/s);
 assert.match(compact,/\.game-shell:not\(\.keyboard-open\) #storyStage \.pinyin-text\s*\{\s*display:\s*none/s);
 assert.match(compact,/\.game-shell:not\(\.keyboard-open\) #storyStage \.viet-text\s*\{[^}]*font-size:\s*12px !important/s);
 assert.match(compact,/\.game-shell:not\(\.keyboard-open\) #storyStage \.tool-btn\s*\{[^}]*min-height:\s*26px/s);
 assert.match(tokens,/\.input-wrap:focus-within input:focus-visible\s*\{\s*outline:\s*0/s);
 assert.match(tokens,/\.game-shell\.keyboard-open #storyStage \.story-ui\s*\{[^}]*width:\s*calc\(100% - 16px\)/s,
  "keyboard-open dialogue must keep phone width instead of collapsing to the desktop card width");
 assert.match(css,/\.game-shell\.ai-tutor-active\.keyboard-open \.story-ui\{top:auto;bottom:4px\}/,
  "the Hỏi Sẻ dialogue follows the same keyboard-safe placement");
 assert.match(css,/\.game-shell\.keyboard-open \.stage\{min-height:112px\}/,
  "short keyboard viewports reserve enough height to keep the scene visible");
 assert.match(css,/#gameShell\.keyboard-open #storyStage \.story-ui\{top:4px!important;bottom:auto!important\}/,
  "the keyboard places dialogue above characters when the scene has enough height");
 assert.match(css,/@media\(max-height:320px\)\s*\{\s*#gameShell\.keyboard-open #storyStage \.story-ui\{top:auto!important;bottom:4px!important\}\s*\}/,
  "very short keyboard viewports move dialogue to the bottom while preserving the face-safe reserve");
 assert.match(css,/#gameShell\.keyboard-open\.builder-open\[data-mode="answer"\] #userInstruction\{display:none\}/,
  "the sentence builder frees space for every keyboard-visible action");
});
test("learning metadata places both noodle lessons at Grandma Liu’s shop",()=>{
 for(const id of [4,5]){assert.equal(Content.scenes[id].place,"noodle-shop");assert.match(M.scenes[id].topic,/Quán mì bà Lưu/)}
 assert.match(Content.scenes[4].tag,/QUÁN BÀ LƯU/);assert.match(Content.scenes[5].tag,/BÀ LƯU TÍNH TIỀN/);
});
function dismissStory(e){if(!e.skillPanel.hidden){e.skillSkip.click();e.skillSkip.click()}for(let n=0;n<4&&!e.storyInterlude.hidden;n++)e.interludeContinue.click()}
function finishEncounter(e,routeIndex=0){
 if(e.encounterPanel.hidden)return;
 e.encounterActions.children[0].click();e.encounterActions.children[1].click();
 e.encounterActions.children[routeIndex].click();
 e.encounterInput.value="我叫安";e.encounterInput.fire("input");e.encounterAnswerForm.fire("submit");
 e.encounterContinue.click();
}
function harness(sharedStorage={},options={}){
 let dom={},document,spoken=[];function element(id){return {id,hidden:false,disabled:false,value:"",textContent:"",innerHTML:"",style:{},dataset:{},firstChild:{textContent:""},isConnected:true,children:[],attributes:{},listeners:{},
  classList:{s:new Set,add(k){this.s.add(k)},remove(k){this.s.delete(k)},contains(k){return this.s.has(k)},toggle(k){this.s.has(k)?this.s.delete(k):this.s.add(k)}},
  addEventListener(k,f){(this.listeners[k]??=[]).push(f)},appendChild(v){this.children.push(v)},replaceChildren(){this.children=[]},getClientRects(){return [1]},
  setAttribute(k,v){this.attributes[k]=v},getAttribute(k){return this.attributes[k]},focus(){document.activeElement=this},
  click(){(this.listeners.click||[]).forEach(f=>f({preventDefault(){}}))},fire(k,args={}){(this.listeners[k]||[]).forEach(f=>f({preventDefault(){},...args}))}
 }}
 ids.forEach(id=>dom[id]=element(id));
 ["gameOverlay","notebookPanel","completionPane","assistBtn","nextBtn","sentenceBuilder","retakeExamBtn","storyChoicePanel","storyChoiceOutcome","storyBeat","storyEcho","storyInterlude","vocabRevealBtn","learningStrip","encounterPanel","encounterAnswerForm","encounterContinue","encounterHint","encounterSample","skillPanel","skillListen","practiceOpenBtn","worldPanel"].forEach(id=>dom[id].hidden=true);
 const nav=element("nav");
 document={body:{style:{},classList:{s:new Set,add(k){this.s.add(k)},remove(k){this.s.delete(k)},contains(k){return this.s.has(k)}}},activeElement:null,listeners:{},getElementById(id){if(!dom[id])throw Error("Missing DOM ID "+id);return dom[id]},querySelector(q){return q==="nav"?nav:null},createElement(tag){return element("new-"+tag)},querySelectorAll(){return []},addEventListener(k,f){(this.listeners[k]??=[]).push(f)}};
 const localStorage={getItem(k){return sharedStorage[k]||null},setItem(k,v){sharedStorage[k]=v}};
 const window={listeners:{},addEventListener(k,f){(this.listeners[k]??=[]).push(f)},dispatchEvent(event){(this.listeners[event.type]||[]).forEach(f=>f(event));return true},speechSynthesis:{cancel(){},getVoices(){return []},speak(u){spoken.push(u.text);if(options.audioFailure){u.onerror?.({error:"synthesis-failed"})}else if(!options.audioNeverEnds){u.onend?.()}}}};
 if(options.autoStart){
  window.location={search:"?play=hsk1",pathname:"/",hash:""};
  window.history={replaceState(_x,_title,path){window.lastReplacedPath=path}};
 }
 function SpeechSynthesisUtterance(text){this.text=text}
 vm.runInNewContext(source,{HSKCore:C,HSKCurriculum:M,HSKLearningKit:K,HSKStoryDirector:D,HSKStoryBeats:B,HSKContent:Content,HSKEncounter:E,HSKStoryGraph:Graph,HSKStoryRuntime:Runtime,HSKSceneLayers:Layers,HSKSaveIO:IO,HSKSceneWorld:World,HSKSkillSampler:Skills,HSKStoryThreads:Threads,document,window,localStorage,setTimeout:()=>0,clearTimeout:()=>{},SpeechSynthesisUtterance,URLSearchParams,console},{filename:"app.js"});
 return {e:dom,document,sharedStorage,spoken,window}
}

test('new learners meet a spoken model before answering and retain truthful guidance credit',()=>{
 const t=harness(),e=t.e;e.startBtn.click();e.interludeContinue.click();
 assert.equal(e.storyInterlude.dataset.kind,'model');assert.equal(e.dialogueText.textContent,Content.scenes[0].guidedModel.zh);
 assert.equal(e.answerForm.hidden,true);e.answerInput.value='我很好';e.answerForm.fire('submit');
 assert.equal(JSON.parse(t.sharedStorage['hai-que-huong-progress-v3']).history.length,0);
 e.listenBtn.click();assert.equal(t.spoken[0],Content.scenes[0].guidedModel.zh);
 e.interludeContinue.click();assert.equal(e.answerForm.hidden,false);
 e.answerInput.value='我很好';e.answerForm.fire('submit');const saved=JSON.parse(t.sharedStorage['hai-que-huong-progress-v3']);
 assert.equal(saved.history[0].hint,true);assert.equal(saved.history[0].status,'correct');
 assert.ok(saved.vocabSeen.includes(0));
});

test('checkpoint subtitles are reachable without opening the answer notebook and count as support',()=>{
 const store={'hai-que-huong-progress-v3':JSON.stringify({v:3,step:7,history:Array.from({length:7},()=>({status:'correct',hint:true,attempts:0})),storyBeats:B.beats.map(x=>x.id)})};
 const t=harness(store),e=t.e;e.resumeBtn.click();assert.equal(e.pinyinText.hidden,true);
 assert.equal(e.checkpointHelpBtn.hidden,false);e.checkpointHelpBtn.click();
 assert.equal(e.pinyinText.hidden,false);assert.equal(e.vietText.hidden,false);assert.equal(e.notebookPanel.hidden,true);
 assert.equal(e.dialogueText.textContent,Content.scenes[7].zh);
 e.notebookBtn.click();assert.equal(e.notebookPanel.hidden,true);
 e.answerInput.value=Content.scenes[7].answers[0];e.answerForm.fire('submit');
 const saved=JSON.parse(store['hai-que-huong-progress-v3']);assert.equal(saved.history[7].hint,true);
 assert.equal(C.summarize(saved.history,10,7).examCorrect,0);
});

test('a locked opening page gives the story reason instead of inventing a classroom test',()=>{
 const t=harness(),e=t.e;e.startBtn.click();e.notebookBtn.click();
 assert.ok(e.toast.textContent.includes('Đọc tiếp'));assert.ok(!e.toast.textContent.includes('kiểm tra'));
});
test("successful Hỏi Sẻ help marks a correct practice result as assisted for review",()=>{
 const t=harness(),e=t.e;e.startBtn.click();dismissStory(e);
 t.window.dispatchEvent({type:"chimse-ai-helped",detail:{sceneId:Graph.idAt(0)}});
 assert.equal(JSON.parse(t.sharedStorage["hai-que-huong-progress-v3"]).hintUsed,true);
 e.answerInput.value="我很好";e.answerForm.fire("submit");
 const saved=JSON.parse(t.sharedStorage["hai-que-huong-progress-v3"]),result=saved.history[0];
 assert.equal(result.status,"correct");assert.equal(result.hint,true);
 assert.equal(K.counts(saved.history,M.scenes).independent,0);
 assert.equal(K.needsReview(saved.history,M.scenes)[0].severity,2);
});
test("Hỏi Sẻ help signal is ignored for another scene and for checkpoint scenes",()=>{
 const t=harness(),e=t.e;e.startBtn.click();dismissStory(e);
 t.window.dispatchEvent({type:"chimse-ai-helped",detail:{sceneId:"hsk1.e01.school-introduction"}});
 assert.equal(!!JSON.parse(t.sharedStorage["hai-que-huong-progress-v3"]).hintUsed,true); // unchanged guided-practice flag
 const saved={"hai-que-huong-progress-v3":JSON.stringify({v:3,step:7,history:Array.from({length:7},()=>({status:"correct",attempts:0,hint:false}))})};
 const checkpoint=harness(saved),ce=checkpoint.e;ce.resumeBtn.click();
 checkpoint.window.dispatchEvent({type:"chimse-ai-helped",detail:{sceneId:Graph.idAt(7)}});
 assert.equal(!!JSON.parse(saved["hai-que-huong-progress-v3"]).hintUsed,false);
});
test("story: sentence builder is helpful and notebook only shows past expressions",()=>{
 const t=harness(),e=t.e;e.startBtn.click();dismissStory(e);
 assert.equal(e.notebookPanel.hidden,true);
 e.notebookBtn.click();assert.equal(e.notebookPanel.hidden,false);
 assert.ok(e.notebookWords.children.some(r=>r.children[0].textContent==="我很好")); // the guided model is now taught before answering
 assert.ok(!e.notebookWords.children.some(r=>r.children[0].textContent==="面条"));
 e.notebookClose.click();
 e.hintBtn.click();e.notebookBtn.click();
 assert.ok(e.notebookWords.children.some(r=>r.children[0].textContent==="我很好"));
 const learnedReply=e.notebookWords.children.find(r=>r.children[0].textContent==="我很好");
 learnedReply.click();assert.equal(t.spoken[0],"我很好");e.notebookClose.click();
 assert.equal(e.sentenceBuilder.hidden,true);assert.equal(e.openBuilderBtn.hidden,false);
 e.openBuilderBtn.click();assert.equal(e.sentenceBuilder.hidden,false);
 ["我","很","好"].forEach(token=>e.tileList.children.find(b=>b.textContent===token).click());
 assert.equal(e.answerInput.value,"我很好");
 e.answerForm.fire("submit");assert.equal(e.nextBtn.hidden,false);
 assert.equal(JSON.parse(t.sharedStorage["hai-que-huong-progress-v3"]).history[0].hint,true);
});
test("game view hides the landing illustration and restores it on exit",()=>{
 const t=harness(),e=t.e;e.startBtn.click();
 assert.equal(t.document.body.classList.contains("game-active"),true);
 e.closeGame.click();
 assert.equal(t.document.body.classList.contains("game-active"),false);
});
test("story: save/resume preserves answer status and typed draft",()=>{
 const state={};let t=harness(state),e=t.e;e.startBtn.click();
 dismissStory(e);e.answerInput.value="我很好";e.answerInput.fire("input");
 t=harness(state);e=t.e;e.resumeBtn.click();assert.equal(e.answerInput.value,"我很好");
 e.answerForm.fire("submit");
 t=harness(state);e=t.e;e.resumeBtn.click();
 assert.equal(e.answerInput.disabled,true);assert.equal(e.nextBtn.hidden,false);
 assert.equal(e.dialogueText.textContent,Content.replies[0].zh);
});

test("notebook pages keep learned words and memories accessible without changing saved results",()=>{
 const saved={'hai-que-huong-progress-v3':JSON.stringify({v:3,step:9,done:true,history:Array.from({length:10},()=>({status:'correct',attempts:0,hint:false})),storyChoices:{friendship:'ask-teacher','noodle-taste':'mild'},storyBeats:['arrival','gate','lunch','way-home','school-test'],encounter:{stage:'done',inspected:['desk','bag'],route:'friend',answer:'independent'}})};
 const t=harness(saved),e=t.e;e.resumeBtn.click();const before=JSON.stringify(saved);
 e.notebookBtn.click();assert.equal(e.storyStage.inert,true);
 const words=[];do{words.push(...e.notebookWords.children.filter(x=>!x.hidden).map(x=>x.children[0].textContent));if(e.notebookNext.disabled)break;e.notebookNext.click()}while(true);
 assert.deepEqual(words,e.notebookWords.children.map(x=>x.children[0].textContent));
 e.notebookMemoryTab.click();const memories=[];do{memories.push(e.storyMemory.textContent);if(e.notebookNext.disabled)break;e.notebookNext.click()}while(true);
 assert.ok(memories.some(x=>x.includes('cô Vương')));assert.ok(memories.some(x=>x.includes('sổ mẹ tặng')));
 e.notebookLearningTab.click();let pages=0;do{pages++;if(e.notebookNext.disabled)break;e.notebookNext.click()}while(pages<30);
 assert.ok(pages>4&&pages<30);assert.equal(JSON.stringify(saved),before);
 e.notebookClose.click();assert.equal(e.storyStage.inert,false);assert.equal(t.document.activeElement.id,'notebookBtn');
});

test("closing the sentence builder preserves its assistance flag and typed draft",()=>{
 const t=harness(),e=t.e;e.startBtn.click();dismissStory(e);e.openBuilderBtn.click();
 e.tileList.children.find(x=>x.textContent==='我').click();e.builderClose.click();
 assert.equal(e.answerInput.value,'我');assert.equal(e.sentenceBuilder.hidden,true);
 assert.equal(JSON.parse(t.sharedStorage['hai-que-huong-progress-v3']).hintUsed,true);
 e.answerInput.value='我很好';e.answerForm.fire('submit');
 assert.equal(JSON.parse(t.sharedStorage['hai-que-huong-progress-v3']).history[0].hint,true);
});

test("Sẻ speaks on request, returns to the same line and does not affect learning credit",()=>{
 const t=harness(),e=t.e;e.startBtn.click();dismissStory(e);
 const before=JSON.stringify(t.sharedStorage),line=e.dialogueText.textContent;
 assert.equal(e.sparrowWhisper.hidden,true);assert.equal(e.sparrowTalkBtn.hidden,false);
 e.sparrowTalkBtn.click();assert.equal(e.sparrowWhisper.hidden,false);assert.equal(t.document.activeElement.id,'sparrowTalkClose');
 e.sparrowTalkClose.click();assert.equal(e.sparrowWhisper.hidden,true);assert.equal(e.dialogueText.textContent,line);
 assert.equal(JSON.stringify(t.sharedStorage),before);assert.equal(t.document.activeElement.id,'sparrowTalkBtn');
});
test("Sẻ listens, worries at a wrong answer, thinks for a hint, and is happy when An answers",()=>{
 const t=harness(),e=t.e;e.startBtn.click();dismissStory(e);
 const sparrow={style:{},dataset:{expression:'curious'}};const host={dataset:{artScene:'hsk1.e01.arrival-greeting'},querySelector(selector){return selector==='.cs-sparrow'?sparrow:null}};
 // The UI harness shares the real renderer API but uses a tiny mount host for expression updates.
 const oldGet=t.document.getElementById.bind(t.document);
 t.document.getElementById=function(id){return id==='stageIllustration'?host:oldGet(id)};
 e.sparrowTalkBtn.click();assert.equal(sparrow.dataset.expression,'listening');
 e.answerInput.value='不对';e.answerForm.fire('submit');assert.equal(sparrow.dataset.expression,'worried');
 e.hintBtn.click();assert.equal(sparrow.dataset.expression,'thinking');
 e.answerInput.value='我很好';e.answerForm.fire('submit');assert.equal(sparrow.dataset.expression,'happy');
});
test("story: exams hide notebook and builder, retain independent grading",()=>{
 const t=harness(),e=t.e;e.startBtn.click();dismissStory(e);
 const correct=["我很好","我叫安","我是学生","有三个学生","我想吃面条","谢谢","好","我叫安我是学生","十块钱","我想吃面条"];
 for(let i=0;i<correct.length;i++){
  finishEncounter(e);dismissStory(e);
  assert.equal(e.stepText.textContent,String(i+1).padStart(2,"0")+" / 10");
  if(i===7){assert.equal(e.sentenceBuilder.hidden,true);e.notebookBtn.click();assert.equal(e.notebookPanel.hidden,true);}
  e.answerInput.value=correct[i];e.answerInput.fire("input");e.answerForm.fire("submit");
  if(i===2||i===4){assert.equal(e.nextBtn.hidden,true);assert.equal(e.storyChoicePanel.hidden,false);e.storyChoiceOptions.children[0].click();}
  assert.equal(e.nextBtn.hidden,false,"should solve "+i);
  e.nextBtn.click();
 }
 assert.equal(e.completionPane.hidden,false);
 assert.ok(e.summaryStats.textContent.includes("3/3 câu kiểm tra không cần trợ giúp"));
 e.retakeExamBtn.click();
 assert.equal(e.stepText.textContent,"08 / 10");
 assert.equal(e.sentenceBuilder.hidden,true);
});

test('story memory survives browser refresh and changes the next scene',()=>{
 const st={};let t=harness(st),e=t.e;e.startBtn.click();dismissStory(e);
 const answers=['我很好','我叫安','我是学生','有三个学生','我想吃面条'];
 for(let i=0;i<answers.length;i++){
  finishEncounter(e);dismissStory(e);
  e.answerInput.value=answers[i];e.answerInput.fire('input');e.answerForm.fire('submit');
  if(i===2){assert.equal(e.nextBtn.hidden,true);e.storyChoiceOptions.children[1].click();}
  if(i===4)e.storyChoiceOptions.children[0].click();
  e.nextBtn.click();
 }
 assert.ok(e.storyBeat.textContent.includes('刘奶奶'));
 assert.equal(JSON.parse(st['hai-que-huong-progress-v3']).storyChoices.friendship,'ask-teacher');
 t=harness(st);e=t.e;e.resumeBtn.click();dismissStory(e);assert.ok(e.storyBeat.textContent.includes('刘奶奶'));
 e.notebookBtn.click();e.notebookMemoryTab.click();assert.ok(e.storyMemory.textContent.includes('cô Vương'));
});

test('V6 prologue blocks quiz until acknowledged and resumes after reload',()=>{
 const saved={};let t=harness(saved),e=t.e;e.startBtn.click();
 assert.equal(e.storyInterlude.hidden,false);assert.equal(e.answerForm.hidden,true);
 e.answerInput.value="我很好";e.answerForm.fire("submit");
 assert.equal(e.nextBtn.hidden,true);
 t=harness(saved);e=t.e;e.resumeBtn.click();
 assert.equal(e.storyInterlude.hidden,false);
 e.interludeContinue.click();
 assert.equal(e.storyInterlude.hidden,false);assert.equal(e.dialogueText.textContent,Content.scenes[0].guidedModel.zh);
 e.interludeContinue.click();
 assert.equal(e.storyInterlude.hidden,true);
 assert.equal(e.answerForm.hidden,false);
 assert.equal(e.learningStrip.hidden,true);
 assert.equal(e.vocabRevealBtn.hidden,true);
});
test('V6 scene help stays on demand and is recorded as assisted',()=>{
 const t=harness(),e=t.e;e.startBtn.click();dismissStory(e);
 e.notebookBtn.click();assert.ok(e.notebookWords.children.some(r=>r.children[0].textContent==="我很好"));e.notebookClose.click();
 assert.equal(e.vocabRevealBtn.hidden,true);e.hintBtn.click();assert.equal(e.feedback.textContent.startsWith("Gợi ý:"),true);
 assert.equal(JSON.parse(t.sharedStorage['hai-que-huong-progress-v3']).hintUsed,true);
 e.answerInput.value='我很好';e.answerForm.fire('submit');
 assert.ok(e.feedback.textContent.includes('sau hỗ trợ'));
});

test('V6 reading a story page before exam does not create fake exam help',()=>{
 const st={};
 st['hai-que-huong-progress-v3']=JSON.stringify({v:3,step:7,history:Array.from({length:7},()=>({status:'correct',hint:false,attempts:0})),storyBeats:['arrival','gate','lunch','way-home'],skillSampler:{status:'legacy'}});
 const t=harness(st),e=t.e;e.startBtn.click();
 assert.equal(e.storyInterlude.hidden,false);
 e.toggleVietnamese.click();
 assert.equal(JSON.parse(st['hai-que-huong-progress-v3']).hintUsed,false);
 e.interludeContinue.click();
 assert.equal(e.storyInterlude.hidden,true);
 assert.equal(e.pinyinText.hidden,true);
 assert.equal(e.vietText.hidden,true);
});

test('V6 story narration playback and keyboard focus follow the visible page',()=>{
 const t=harness(),e=t.e;e.startBtn.click();
 assert.equal(t.document.activeElement.id,'interludeContinue');
 e.listenBtn.click();assert.equal(t.spoken[0],B.beats[0].zh);
 e.interludeContinue.click();
 assert.equal(t.document.activeElement.id,'interludeContinue');e.listenBtn.click();assert.equal(t.spoken[1],Content.scenes[0].guidedModel.zh);
 e.interludeContinue.click();
 assert.equal(t.document.activeElement.id,'answerInput');
 e.listenBtn.click();assert.equal(t.spoken[2],Content.scenes[0].zh);
});

test("V7 phrase suggestions cannot leak before learner opts in",()=>{
 const t=harness(),e=t.e;e.startBtn.click();dismissStory(e);
 assert.equal(e.sentenceBuilder.hidden,true);
 assert.equal(e.openBuilderBtn.hidden,false);
 assert.equal(e.learningStrip.hidden,true);
 e.answerInput.value="我很好";e.answerInput.fire("input");e.answerForm.fire("submit");
 const saved=JSON.parse(t.sharedStorage["hai-que-huong-progress-v3"]);
 assert.equal(saved.history[0].hint,true);
});
test("V7 opening phrase suggestions always counts as help before typing",()=>{
 const t=harness(),e=t.e;e.startBtn.click();dismissStory(e);
 e.openBuilderBtn.click();
 assert.equal(e.sentenceBuilder.hidden,false);
 assert.equal(e.openBuilderBtn.hidden,true);
 const pre=JSON.parse(t.sharedStorage["hai-que-huong-progress-v3"]);
 assert.equal(pre.hintUsed,true);
 e.answerInput.value="我很好";e.answerForm.fire("submit");
 assert.equal(JSON.parse(t.sharedStorage["hai-que-huong-progress-v3"]).history[0].hint,true);
});
test("V7 checkpoint never exposes construction hints",()=>{
 const s={'hai-que-huong-progress-v3':JSON.stringify({v:3,step:7,history:Array.from({length:7},()=>({status:"correct",attempts:0,hint:false})),storyBeats:["arrival","gate","lunch","way-home","school-test"]})};
 const t=harness(s),e=t.e;e.startBtn.click();
 assert.equal(e.openBuilderBtn.hidden,true);
 assert.equal(e.sentenceBuilder.hidden,true);
 e.openBuilderBtn.click();
 assert.notEqual(JSON.parse(s["hai-que-huong-progress-v3"]).hintUsed,true);
});

test("V8 lost notebook episode requires observed clues and retrievable personal introduction",()=>{
 const t=harness(),e=t.e;e.startBtn.click();dismissStory(e);
 const learned=["我很好","我叫安","我是学生","有三个学生"];
 for(let i=0;i<4;i++){
  dismissStory(e);e.answerInput.value=learned[i];e.answerForm.fire("submit");
  if(i===2)e.storyChoiceOptions.children[0].click();
  e.nextBtn.click();
 }
 assert.equal(e.stepText.textContent,"05 / 10");assert.equal(e.encounterPanel.hidden,false);
 assert.equal(e.answerForm.hidden,true);assert.equal(e.encounterActions.children.length,3);
 e.answerInput.value="我想吃面条";e.answerForm.fire("submit");
 assert.equal(e.encounterPanel.hidden,false);
 e.encounterActions.children[0].click();
 assert.equal(e.encounterActions.children.length,3);
 e.encounterActions.children[1].click();
 assert.equal(e.encounterActions.children.length,2);
 e.encounterActions.children[1].click();
 assert.equal(e.encounterAnswerForm.hidden,false);
 assert.match(e.stageIllustration.innerHTML,/data-character="wang"/,'The teacher route draws cô Vương in the office');
 assert.match(e.stageIllustration.innerHTML,/data-character="receptionist"/,'The receptionist remains the person speaking to An');
 assert.ok(e.encounterBody.textContent.includes("Vương"));
 e.encounterInput.value="我叫安";e.encounterInput.fire("input");
 let saved=JSON.parse(t.sharedStorage["hai-que-huong-progress-v3"]);
 assert.equal(saved.encounterDraft,"我叫安");assert.equal(saved.encounter.stage,"respond");
 e.encounterAnswerForm.fire("submit");saved=JSON.parse(t.sharedStorage["hai-que-huong-progress-v3"]);
 assert.equal(saved.encounter.answer,"independent");
 assert.equal(e.encounterContinue.hidden,false);
 assert.equal(e.speaker.textContent,"安 · Minh An");
 assert.equal(e.dialogueText.textContent,"谢谢您。");
 assert.equal(e.pinyinText.textContent,"Xièxie nín.");
 assert.equal(e.vietText.textContent,"Cháu cảm ơn cô ạ.");
 assert.doesNotMatch(e.dialogueText.textContent,/我找到了/);
 assert.match(e.encounterBody.textContent,/Cô trực tìm thấy tên An/);
 e.encounterContinue.click();
 assert.equal(e.encounterPanel.hidden,true);
 assert.equal(e.storyInterlude.hidden,false);
 assert.equal(JSON.parse(t.sharedStorage["hai-que-huong-progress-v3"]).history.length,4);
});
test("V8 clue decision copy stays true for all two-clue combinations",()=>{
 const inspectedPairs=[[0,1],[0,2],[1,2]];
 for(const pair of inspectedPairs){
  const t=harness(),e=t.e;e.startBtn.click();dismissStory(e);
  const learned=["我很好","我叫安","我是学生","有三个学生"];
  for(let i=0;i<4;i++){
   dismissStory(e);e.answerInput.value=learned[i];e.answerForm.fire("submit");
   if(i===2)e.storyChoiceOptions.children[0].click();
   e.nextBtn.click();
  }
  pair.forEach(index=>e.encounterActions.children[index].click());
  assert.equal(e.encounterBody.textContent,"An đã nhìn quanh, nhưng vẫn chưa biết quyển sổ đang ở đâu. Cậu có thể nhờ Tiểu Vũ đi cùng hoặc hỏi cô Vương đường tới phòng trực. Lựa chọn này không chấm điểm ngôn ngữ.");
 }
});
test("V8 transfer encounter can resume a route and preserves distinction from classroom examination",()=>{
 const storage={};
 let t=harness(storage),e=t.e;e.startBtn.click();dismissStory(e);
 for(const [i,answer] of ["我很好","我叫安","我是学生","有三个学生"].entries()){
  dismissStory(e);e.answerInput.value=answer;e.answerForm.fire("submit");
  if(i===2)e.storyChoiceOptions.children[0].click();
  e.nextBtn.click();
 }
 e.encounterActions.children[0].click();e.encounterActions.children[1].click();
 e.encounterActions.children[0].click();
 e.encounterInput.value="我不叫安";e.encounterInput.fire("input");e.encounterAnswerForm.fire("submit");
 assert.equal(JSON.parse(storage["hai-que-huong-progress-v3"]).encounter.attempts,1);
 t=harness(storage);e=t.e;e.resumeBtn.click();
 assert.equal(e.encounterAnswerForm.hidden,false);
 assert.equal(e.encounterInput.value,"我不叫安");
 e.encounterHint.click();e.encounterInput.value="我叫安";e.encounterAnswerForm.fire("submit");
 assert.equal(JSON.parse(storage["hai-que-huong-progress-v3"]).encounter.answer,"helped");
 e.encounterContinue.click();dismissStory(e);
 const remaining=["我想吃面条","谢谢","好","我叫安我是学生","十块钱","我想吃面条"];
 for(let i=0;i<remaining.length;i++){
  dismissStory(e);e.answerInput.value=remaining[i];e.answerForm.fire("submit");
  if(i===0)e.storyChoiceOptions.children[0].click();
  e.nextBtn.click();
 }
 assert.equal(e.completionPane.hidden,false);
 assert.ok(e.summaryStats.textContent.includes("3/3 câu kiểm tra không cần trợ giúp"));
 assert.ok(e.encounterSummary.textContent.includes("đúng nhờ gợi ý"));
 assert.ok(e.episodeEnding.textContent.includes("Mẹ")===false||e.episodeEnding.textContent.includes("An"));
});
test("V8 migrates V7 completed story without forcing new content replay",()=>{
 const store={"hai-que-huong-progress-v3":JSON.stringify({v:3,step:9,done:true,history:Array.from({length:10},()=>({status:"correct",attempts:0,hint:false})),storyBeats:["arrival","gate","lunch","way-home","school-test"]})};
 const t=harness(store),e=t.e;e.resumeBtn.click();
 assert.equal(e.completionPane.hidden,false);
 assert.equal(e.encounterPanel.hidden,true);
 assert.ok(e.encounterSummary.textContent.includes("bỏ qua"));
 e.retakeExamBtn.click();assert.equal(JSON.parse(store["hai-que-huong-progress-v3"]).encounter.stage,"legacy");
});

test("V9 stable scene reference is persisted and existing V8 save still resumes correctly",()=>{
 const store={"hai-que-huong-progress-v3":JSON.stringify({v:3,step:2,history:[{status:"correct",hint:false,attempts:0},{status:"correct",hint:false,attempts:0}],storyBeats:["arrival","gate"]})};
 const t=harness(store),e=t.e;e.resumeBtn.click();
 assert.equal(e.stepText.textContent,"03 / 10");dismissStory(e);
 e.answerInput.value="我是学生";e.answerForm.fire("submit");
 e.storyChoiceOptions.children[0].click();
 const saved=JSON.parse(store["hai-que-huong-progress-v3"]);
 assert.equal(saved.sceneRef,"hsk1.e01.xiaoyu-friendship");
 assert.equal(saved.history.length,3);
});
test("V9 inspecting scene objects adds notebook atmosphere but no learner score",()=>{
 const t=harness(),e=t.e;e.startBtn.click();dismissStory(e);
 assert.equal(e.worldPanel.hidden,true);e.worldOpenBtn.click();assert.equal(e.worldPanel.hidden,false);
 assert.equal(e.worldActions.children.length,3);
 e.worldActions.children[0].click();
 const saved=JSON.parse(t.sharedStorage["hai-que-huong-progress-v3"]);
 assert.equal(saved.worldSeen["hsk1.e01.arrival-greeting"].length,1);
 assert.equal(saved.history.length,0);
 e.worldActions.children[0].click();
 assert.equal(JSON.parse(t.sharedStorage["hai-que-huong-progress-v3"]).worldSeen["hsk1.e01.arrival-greeting"].length,1);
});
test("V10 real reading and browser-synthesized listening practice remain separate from school scores",()=>{
 const store={"hai-que-huong-progress-v3":JSON.stringify({v:3,step:7,history:Array.from({length:7},()=>({status:"correct",hint:false,attempts:0})),storyBeats:["arrival","gate","lunch","way-home","school-test"]})};
 const t=harness(store),e=t.e;e.resumeBtn.click();
 assert.equal(e.practiceOpenBtn.hidden,false);
 e.practiceOpenBtn.click();
 assert.equal(e.skillPanel.hidden,false);
 assert.equal(e.answerForm.hidden,true);
 assert.equal(e.skillOptions.children.length,3);
 e.skillOptions.children[0].click();
 assert.equal(e.skillPanel.hidden,false);
 assert.ok(e.skillStep.textContent.includes("Nghe hiểu"));
 e.skillListen.click();
 e.skillOptions.children[1].click();
 const saved=JSON.parse(store["hai-que-huong-progress-v3"]);
 assert.equal(saved.skillSampler.status,"done");
 assert.equal(saved.skillSampler.results[0].result,"correct");
 assert.equal(saved.skillSampler.results[1].result,"correct");
 assert.equal(saved.history.length,7);
 assert.equal(e.storyInterlude.hidden,true);
 assert.equal(e.answerForm.hidden,false);
});
test("V10 unsupported audio is explicitly unassessed; checkpoint retake retains skill evidence",()=>{
 const store={"hai-que-huong-progress-v3":JSON.stringify({v:3,step:7,history:Array.from({length:7},()=>({status:"correct",hint:false,attempts:0})),storyBeats:["arrival","gate","lunch","way-home","school-test"]})};
 const t=harness(store),e=t.e;e.resumeBtn.click();
 e.practiceOpenBtn.click();e.skillSkip.click();
 e.skillOptions.children[1].click();
 let state=JSON.parse(store["hai-que-huong-progress-v3"]);
 assert.equal(state.skillSampler.results[0].result,"unassessed");
 assert.equal(state.skillSampler.results[1].result,"unassessed");
 assert.equal(e.skillPanel.hidden,true);
 for(const answer of ["我叫安我是学生","十块钱","我想吃面条"]){
  e.answerInput.value=answer;e.answerForm.fire("submit");e.nextBtn.click();
 }
 assert.equal(e.completionPane.hidden,false);
 assert.ok(e.skillSummary.textContent.includes("unassessed"));
 e.retakeExamBtn.click();
 assert.equal(JSON.parse(store["hai-que-huong-progress-v3"]).skillSampler.status,"done");
});

test("Chapter 00 direct handoff opens existing HSK1 episode without overwriting old progress",()=>{
 const stored={"hai-que-huong-progress-v3":JSON.stringify({v:3,step:1,history:[{status:"correct",attempts:0,hint:false}],storyBeats:["arrival"]}),
  "hai-que-huong-intro-v1":JSON.stringify({step:8,maxReached:8,finished:true})};
 const before=stored["hai-que-huong-intro-v1"],t=harness(stored,{autoStart:true});
 assert.equal(t.e.gameOverlay.hidden,false);
 assert.equal(t.e.stepText.textContent,"02 / 10");
 assert.equal(t.window.lastReplacedPath,"/");
 assert.equal(stored["hai-que-huong-intro-v1"],before);
});

test("V4 shadow has verified V3 source, but old save remains the actual source of truth",()=>{
 const t=harness(),e=t.e;e.startBtn.click();dismissStory(e);
 e.answerInput.value="我很好";e.answerForm.fire("submit");
 const v3=t.sharedStorage["hai-que-huong-progress-v3"],v4=JSON.parse(t.sharedStorage["hai-que-huong-progress-v4"]);
 assert.equal(v4.v,4);assert.equal(v4.sceneRef,"hsk1.e01.arrival-greeting");
 assert.equal(Runtime.validateShadow(v4,v3,Graph),true);
 assert.equal(JSON.parse(v3).history.length,1);
 t.sharedStorage["hai-que-huong-progress-v4"]=JSON.stringify({...v4,sceneRef:"hsk5.graduation"});
 assert.equal(Runtime.readShadow({getItem:k=>t.sharedStorage[k]},"hai-que-huong-progress-v3",Graph),null);
 const resumed=harness(t.sharedStorage),e2=resumed.e;e2.resumeBtn.click();
 assert.equal(e2.stepText.textContent,"01 / 10"); // V3 not poisoned by tampered shadow
});
test("Listening sample needs speech completion event; queued-only speech is unassessed",()=>{
 const save={"hai-que-huong-progress-v3":JSON.stringify({v:3,step:7,history:Array.from({length:7},()=>({status:"correct",hint:false,attempts:0})),storyBeats:["arrival","gate","lunch","way-home","school-test"]})};
 const t=harness(save,{audioNeverEnds:true}),e=t.e;e.resumeBtn.click();
 e.practiceOpenBtn.click();e.skillOptions.children[0].click();e.skillListen.click();e.skillOptions.children[1].click();
 const st=JSON.parse(save["hai-que-huong-progress-v3"]);
 assert.equal(st.skillSampler.results[1].result,"unassessed");
});
test("Failed browser speech never grants listening credit",()=>{
 const save={"hai-que-huong-progress-v3":JSON.stringify({v:3,step:7,history:Array.from({length:7},()=>({status:"correct",hint:false,attempts:0})),storyBeats:["arrival","gate","lunch","way-home","school-test"]})};
 const t=harness(save,{audioFailure:true}),e=t.e;e.resumeBtn.click();
 e.practiceOpenBtn.click();e.skillOptions.children[0].click();e.skillListen.click();e.skillOptions.children[1].click();
 const st=JSON.parse(save["hai-que-huong-progress-v3"]);
 assert.equal(st.skillSampler.results[1].result,"unassessed");
});

test("Optional practice never gates the teacher's actual checkpoint and can be closed preserving draft",()=>{
 const stored={"hai-que-huong-progress-v3":JSON.stringify({v:3,step:7,history:Array.from({length:7},()=>({status:"correct",hint:false,attempts:0})),storyBeats:["arrival","gate","lunch","way-home","school-test"]})};
 const t=harness(stored),e=t.e;e.resumeBtn.click();
 assert.equal(e.skillPanel.hidden,true);
 assert.equal(e.answerForm.hidden,false);
 assert.equal(e.practiceOpenBtn.hidden,false);
 e.answerInput.value="我叫";e.answerInput.fire("input");
 e.practiceOpenBtn.click();
 assert.equal(e.skillPanel.hidden,false);assert.equal(e.answerForm.hidden,true);
 assert.equal(JSON.parse(stored["hai-que-huong-progress-v3"]).practiceOpen,true);
 e.practiceCloseBtn.click();
 assert.equal(e.skillPanel.hidden,true);assert.equal(e.answerInput.value,"我叫");
 assert.equal(JSON.parse(stored["hai-que-huong-progress-v3"]).practiceOpen,false);
 e.answerInput.value="我叫安我是学生";e.answerForm.fire("submit");
 assert.equal(e.nextBtn.hidden,false);
 e.nextBtn.click();
 assert.equal(e.stepText.textContent,"09 / 10");
 const state=JSON.parse(stored["hai-que-huong-progress-v3"]);
 assert.equal(state.skillSampler.status,"pending");
 assert.equal(state.history.length,8);
});
test("Optional sampler in progress resumes only when learner actually opened it",()=>{
 const saved={"hai-que-huong-progress-v3":JSON.stringify({v:3,step:7,history:Array.from({length:7},()=>({status:"correct",hint:false,attempts:0})),storyBeats:["arrival","gate","lunch","way-home","school-test"],practiceOpen:true})};
 let t=harness(saved),e=t.e;e.resumeBtn.click();
 assert.equal(e.skillPanel.hidden,false);
 e.practiceCloseBtn.click();
 t=harness(saved);e=t.e;e.resumeBtn.click();
 assert.equal(e.skillPanel.hidden,true);
 assert.equal(e.answerForm.hidden,false);
});

test("Gate3B inspecting street object shows Hanzi bridge and preserves selected object on V3/V4 reload",()=>{
 const storage={"hai-que-huong-intro-v1":JSON.stringify({maxReached:5,discovered:["日","木"],momRevealed:true,lightParts:["日","月"]})};
 let t=harness(storage),e=t.e;e.startBtn.click();dismissStory(e);
 assert.equal(e.worldPanel.hidden,true);e.worldOpenBtn.click();assert.equal(e.worldPanel.hidden,false);
 assert.equal(e.worldBridge.textContent,"");
 e.worldActions.children[0].click();
 assert.ok(e.worldBridge.textContent.includes("日"));
 assert.ok(e.worldBridge.textContent.includes("Bạn từng nhìn thấy"));
 assert.ok(e.worldBridge.textContent.includes("Không tính điểm"));
 assert.equal(e.gameShell.dataset.mode,'world');assert.equal(e.worldBridge.hidden,true);
 const beforePaging=JSON.stringify(storage);e.worldNext.click();assert.equal(e.worldBridge.hidden,false);assert.equal(e.worldDescription.hidden,true);
 e.worldPrev.click();assert.equal(e.worldDescription.hidden,false);assert.equal(JSON.stringify(storage),beforePaging);
 let state=JSON.parse(storage["hai-que-huong-progress-v3"]);
 assert.equal(state.worldFocus["hsk1.e01.arrival-greeting"],"window");
 assert.equal(state.history.length,0);
 const shadow=JSON.parse(storage["hai-que-huong-progress-v4"]);
 assert.equal(shadow.memory.worldFocus["hsk1.e01.arrival-greeting"],"window");
 t=harness(storage);e=t.e;e.resumeBtn.click();dismissStory(e);e.worldOpenBtn.click();
 assert.ok(e.worldBridge.textContent.includes("日"));
 assert.ok(e.worldDescription.textContent.includes("Nắng phản chiếu trên ô cửa bên cổng trường"));
});
test("Gate3B scene observation never leaks a previous scene description into unrelated scene",()=>{
 const storage={"hai-que-huong-progress-v3":JSON.stringify({v:3,step:6,history:Array.from({length:6},()=>({status:"correct",hint:false,attempts:0})),storyBeats:["arrival","gate","lunch","way-home"],worldSeen:{"hsk1.e01.arrival-greeting":["window","diary"]},worldFocus:{"hsk1.e01.arrival-greeting":"window"}})};
 const t=harness(storage),e=t.e;e.resumeBtn.click();dismissStory(e);
 assert.equal(e.worldPanel.hidden,true);e.worldOpenBtn.click();assert.equal(e.worldPanel.hidden,false);
 assert.equal(e.worldBridge.textContent,"");
 assert.ok(e.worldDescription.textContent.includes("Chọn một đồ vật"));
 e.worldActions.children[0].click();
 assert.ok(e.worldDescription.textContent.includes("Sáng nay An"));
 const state=JSON.parse(storage["hai-que-huong-progress-v3"]);
 assert.equal(state.history.length,6);
 assert.equal(state.worldSeen["hsk1.e01.walk-home"].length,1);
 assert.equal(state.worldFocus["hsk1.e01.walk-home"],"tree");
});

test("Unplayable roadmap is absent and story start remains accessible",()=>{
 const t=harness();assert.equal(t.e.chapterGrid.children.length,0);t.e.startBtn.click();assert.equal(t.e.gameOverlay.hidden,false);
});

test("Gate5 authored teacher greeting echo appears only after the prior mother greeting is resolved",()=>{
 const save={"hai-que-huong-progress-v3":JSON.stringify({v:3,step:1,history:[{status:"correct",attempts:0,hint:false}],storyBeats:["arrival"]})};
 const t=harness(save),e=t.e;e.resumeBtn.click();dismissStory(e);
 assert.equal(e.storyEcho.hidden,false);
 assert.ok(e.storyEcho.textContent.includes("你好"));
 assert.ok(e.storyEcho.textContent.includes("không chấm điểm"));
 const existing=JSON.parse(save["hai-que-huong-progress-v3"]);
 assert.equal(existing.history.length,1);
});
test("Gate5 friendship and noodle choices reappear in scene six, after actual earlier answers",()=>{
 const save={"hai-que-huong-progress-v3":JSON.stringify({v:3,step:6,history:Array.from({length:6},()=>({status:"correct",hint:false,attempts:0})),storyBeats:["arrival","gate","lunch"],storyChoices:{friendship:"ask-teacher","noodle-taste":"mild"},encounter:{stage:"done",inspected:["desk","bag"],route:"friend",answer:"independent"}})};
 const t=harness(save),e=t.e;e.resumeBtn.click();dismissStory(e);
 assert.equal(e.storyEcho.hidden,false);
 assert.ok(e.storyEcho.textContent.includes("Tiểu Vũ"));
 assert.ok(e.storyEcho.textContent.includes("bà Lưu"));
 assert.ok(e.storyEcho.textContent.includes("sổ"));
 assert.ok(!e.storyEcho.textContent.includes("điểm thi HSK"));
});
test("Gate5 notebook language thread separates context exposure and independent assessment",()=>{
 const save={"hai-que-huong-progress-v3":JSON.stringify({v:3,step:9,history:[...Array.from({length:8},()=>({status:"correct",hint:false,attempts:0})),{status:"assisted",hint:true,attempts:2}],storyBeats:["arrival","gate","lunch","way-home","school-test"]})};
 const t=harness(save),e=t.e;e.resumeBtn.click();dismissStory(e);
 e.notebookBtn.click();
 // Exam blocks notebook until current test solved, so use completed prior test note without forcing exam.
 assert.equal(e.notebookPanel.hidden,true);
 const rows=Threads.trace(JSON.parse(save["hai-que-huong-progress-v3"]).history,{});
 const price=Array.from(rows).find(x=>x.id==="price");
 assert.equal(price.first,"seen-in-context");
 assert.equal(price.checkpoint,"sample");
 assert.equal(e.storyEcho.hidden,true);
});
