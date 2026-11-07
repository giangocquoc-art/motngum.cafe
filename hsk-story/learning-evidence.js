/* Evidence describes attempts, never story choices or certified mastery. No answers or recordings are stored. */
(function(root,factory){"use strict";var api=factory();if(typeof module!=="undefined"&&module.exports)module.exports=api;root.ChimSeLearningEvidence=api;})(typeof globalThis!=="undefined"?globalThis:this,function(){"use strict";
var SOURCES=["model","subtitles","tiles","sample","ai"],RESULTS=["incorrect","correct","sample","skipped"];
function sources(raw){if(!Array.isArray(raw)||raw.some(function(s){return !SOURCES.includes(s);}))throw Error("Invalid assistance source");return SOURCES.filter(function(s){return raw.includes(s);});}
function clean(raw){
 if(raw==null)return null;
 if(!raw||raw.version!==1||typeof raw.contentVersion!=="string"||!raw.contentVersion.length||raw.contentVersion.length>64||!Array.isArray(raw.events)||raw.events.length>102)throw Error("Invalid learning evidence");
 var seen=new Set(),events=raw.events.map(function(e){
  if(!e||!RESULTS.includes(e.result)||!Number.isInteger(e.attempt)||e.attempt<0||e.attempt>100||!(e.at===null||Number.isSafeInteger(e.at)&&e.at>=0)||!["typed","unrecorded"].includes(e.modality))throw Error("Invalid attempt evidence");
  var key=e.attempt+":"+e.result;if(seen.has(key))throw Error("Duplicate attempt evidence");seen.add(key);
  return {result:e.result,attempt:e.attempt,at:e.at,modality:e.modality,help:sources(e.help)};
 });
 return {version:1,contentVersion:raw.contentVersion,events:events};
}
function append(raw,event,contentVersion){var value=clean(raw)||{version:1,contentVersion:contentVersion,events:[]};if(value.contentVersion!==contentVersion)throw Error("Attempt content changed");var key=event.attempt+":"+event.result;if(value.events.some(function(e){return e.attempt+":"+e.result===key;}))return value;return clean({version:1,contentVersion:contentVersion,events:value.events.concat([event])});}
function status(record){if(!record)return "unassessed";if(record.status==="skipped")return "skipped";var e=record.evidence&&clean(record.evidence),last=e&&e.events[e.events.length-1];if(last&&last.result==="sample")return "sample";if(record.status==="assisted"||record.hint||last&&last.help.length)return "assisted";return record.attempts?"self-corrected":"independent";}
function describe(record){return {unassessed:"An chưa thử câu này.",skipped:"An để câu này lại; mình chưa biết An đã nhớ được chưa.",sample:"An đã xem câu mẫu. Mình sẽ gặp lại câu này để tự thử.",assisted:"An đã nói được với lời nhắc. Mình sẽ thử nhớ lại ở lần sau.","self-corrected":"An tự sửa sau khi thử lại. Một lần khác mình sẽ thử trong hoàn cảnh mới.",independent:"An tự nhớ được ở lượt này, chưa dùng gợi ý."}[status(record)];}
return {version:1,sources:sources,clean:clean,append:append,status:status,describe:describe};
});
