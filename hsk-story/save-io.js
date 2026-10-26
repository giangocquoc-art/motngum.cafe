/* Gate 4 safe serialization boundary. V3 read/write remains authoritative, V4 is derived shadow only. */
var HSKSaveIO=(function(){"use strict";
function readSafe(storage,key){try{return JSON.parse(storage.getItem(key)||"null")}catch(e){return null}}
function snapshot(state,graph){return {v:3,step:state.step,history:state.history,done:state.done,pinyin:state.pinyin,vi:state.vi,draft:state.draft,attempts:state.attempts,hintUsed:state.hintUsed,examHelp:state.examHelp,storyChoices:state.storyChoices,storyBeats:state.storyBeats,vocabSeen:state.vocabSeen,encounter:state.encounter,encounterDraft:state.encounterDraft,sceneRef:graph.idAt(state.step),worldSeen:state.worldSeen,worldFocus:state.worldFocus,skillSampler:state.skillSampler,practiceOpen:state.practiceOpen}}
function persist(storage,key,state,graph,runtime){var v3=snapshot(state,graph),serialized=JSON.stringify(v3);storage.setItem(key,serialized);var shadowOk=runtime.writeShadow(storage,v3,serialized,graph);return {legacySaved:true,shadowSaved:shadowOk};}
var api={readSafe:readSafe,snapshot:snapshot,persist:persist};if(typeof module!=="undefined"&&module.exports)module.exports=api;return api;
})();
