/* Unscored first-session recall. It stores outcomes only, never learner text. */
(function(root,factory){"use strict";var api=factory();if(typeof module==="object"&&module.exports)module.exports=api;root.ChimSeBranchSessionRecall=api;})(typeof globalThis!=="undefined"?globalThis:this,function(){"use strict";
var storageKey="chimse-branch-session-recall-v1",statuses=["unseen","in-progress","independent","assisted","skipped"];
function fresh(){return {version:1,status:"unseen",attempts:0,helpUsed:false};}
function invalid(message,code){var error=new Error(message);error.code=code||"invalid";return error;}
function clean(raw){
 if(raw==null)return fresh();
 if(!raw||typeof raw!=="object"||Array.isArray(raw))throw invalid("Invalid session recall state");
 if(Number.isInteger(raw.version)&&raw.version>1)throw invalid("Newer session recall state","newer");
 if(raw.version!==1||!statuses.includes(raw.status)||!Number.isInteger(raw.attempts)||raw.attempts<0||raw.attempts>100||typeof raw.helpUsed!=="boolean")throw invalid("Invalid session recall state");
 return {version:1,status:raw.status,attempts:raw.attempts,helpUsed:raw.helpUsed};
}
function start(raw){var value=clean(raw);if(value.status==="unseen")value.status="in-progress";return value;}
function fail(raw){var value=clean(raw);if(value.status!=="in-progress")return value;value.attempts=Math.min(100,value.attempts+1);return value;}
function help(raw){var value=clean(raw);if(value.status!=="in-progress"||value.attempts<1)return value;value.helpUsed=true;return value;}
function finish(raw,outcome){var value=clean(raw);if(value.status!=="in-progress")return value;if(outcome==="skipped"){value.status="skipped";return value;}if(outcome!=="correct")throw invalid("Invalid session recall outcome");value.attempts=Math.min(100,value.attempts+1);value.status=value.helpUsed?"assisted":"independent";return value;}
function isFinished(raw){return ["independent","assisted","skipped"].includes(clean(raw).status);}
return {version:1,storageKey:storageKey,fresh:fresh,clean:clean,start:start,fail:fail,help:help,finish:finish,isFinished:isFinished};
});
