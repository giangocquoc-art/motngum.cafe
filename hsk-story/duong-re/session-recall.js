/* Unscored first-session recall. It stores outcomes only, never learner text. */
(function(root,factory){"use strict";var api=factory();if(typeof module==="object"&&module.exports)module.exports=api;root.ChimSeBranchSessionRecall=api;})(typeof globalThis!=="undefined"?globalThis:this,function(){"use strict";
var storageKey="chimse-branch-session-recall-v1",statuses=["unseen","in-progress","unassisted","independent","assisted","skipped"],boundaries=["pending","paused","continued"];
function fresh(){return {version:2,status:"unseen",attempts:0,helpUsed:false,boundary:"pending"};}
function invalid(message,code){var error=new Error(message);error.code=code||"invalid";return error;}
function clean(raw){
 if(raw==null)return fresh();
 if(!raw||typeof raw!=="object"||Array.isArray(raw))throw invalid("Invalid session recall state");
 if(Number.isInteger(raw.version)&&raw.version>2)throw invalid("Newer session recall state","newer");
 if(![1,2].includes(raw.version)||!statuses.includes(raw.status)||!Number.isInteger(raw.attempts)||raw.attempts<0||raw.attempts>100||typeof raw.helpUsed!=="boolean")throw invalid("Invalid session recall state");
 var status=raw.status==="independent"?"unassisted":raw.status,finished=["unassisted","assisted","skipped"].includes(status),boundary=raw.version===1?(finished?"continued":"pending"):raw.boundary;
 if(!boundaries.includes(boundary)||(!finished&&boundary!=="pending"))throw invalid("Invalid session boundary");
 return {version:2,status:status,attempts:raw.attempts,helpUsed:raw.helpUsed,boundary:boundary};
}
function start(raw){var value=clean(raw);if(value.status==="unseen")value.status="in-progress";return value;}
function fail(raw){var value=clean(raw);if(value.status!=="in-progress")return value;value.attempts=Math.min(100,value.attempts+1);return value;}
function help(raw){var value=clean(raw);if(value.status!=="in-progress"||value.attempts<1)return value;value.helpUsed=true;return value;}
function finish(raw,outcome){var value=clean(raw);if(value.status!=="in-progress")return value;if(outcome==="skipped"){value.status="skipped";return value;}if(outcome!=="correct")throw invalid("Invalid session recall outcome");value.attempts=Math.min(100,value.attempts+1);value.status=value.helpUsed?"assisted":"unassisted";return value;}
function isFinished(raw){return ["unassisted","assisted","skipped"].includes(clean(raw).status);}
function pause(raw){var value=clean(raw);if(!isFinished(value))return value;value.boundary="paused";return value;}
function continueSession(raw){var value=clean(raw);if(!isFinished(value))return value;value.boundary="continued";return value;}
return {version:2,storageKey:storageKey,fresh:fresh,clean:clean,start:start,fail:fail,help:help,finish:finish,pause:pause,continueSession:continueSession,isFinished:isFinished};
});
