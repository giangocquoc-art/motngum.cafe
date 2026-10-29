/* HSK Story v2 — deterministic guided-practice evaluator, not an AI or official HSK scoring system. */
var HSKCore=(function(){
"use strict";
function normalize(input){return String(input||"").normalize("NFKC").toLowerCase().replace(/[\s\u200b-\u200d。！？!?,，、:：.;；"'“”‘’（）()]/g,"").trim()}
function evaluate(scene,input){
 var s=normalize(input);
 if(!s)return {ok:false,reason:"Hãy thử trả lời bằng tiếng Trung trước nhé."};
 if(s.length>100)return {ok:false,reason:"Câu hơi dài cho thử thách này. Bạn thử viết ngắn gọn hơn nhé."};
 if(!/[\u3400-\u9fff]/.test(s)||/[a-z0-9]/.test(s))return {ok:false,reason:"Hãy trả lời bằng chữ Hán. Pinyin dùng để gợi ý, không phải câu trả lời."};
 if((scene.answers||[]).concat(scene.naturalAnswers||[]).some(function(a){return normalize(a)===s}))return {ok:true};
 if(scene.id===1&&/^(?:你好)?(?:老师)?我叫(?:安|明安)(?:老师好|谢谢)?$/.test(s))return {ok:true};
 if(scene.id===7&&/^(?:大家好|老师好|你好)?(?:我叫(?:安|明安)|我是安)(?:我)?是学生(?:谢谢)?$/.test(s))return {ok:true};
 if(scene.id===8&&/^(?:是)?(?:十块钱|十块|十元)$/.test(s))return {ok:true};
 if(scene.id===9&&/^(?:我想吃|我要|我想要)(?:一碗)?面条$/.test(s))return {ok:true};
 return {ok:false,reason:scene.error||"Thử dùng câu ngắn của lượt này nhé. Nếu chưa nhớ, bạn có thể nhờ gợi ý."};
}
function summarize(history,total,examStart){
 var list=Array.isArray(history)?history:[];
 var practiced=list.filter(function(x){return x&&["correct","assisted"].includes(x.status)});
 var own=practiced.filter(function(x){return x.status==="correct"&&!x.hint});
 var hinted=practiced.filter(function(x){return x.status==="correct"&&x.hint});
 return {total:total,completed:practiced.length,independently:own.length,hinted:hinted.length,assisted:practiced.filter(function(x){return x.status==="assisted"}).length,examCorrect:list.slice(examStart).filter(function(x){return x&&x.status==="correct"&&!x.hint&&x.attempts===0}).length,examTotal:total-examStart};
}
if(typeof module!=="undefined"&&module.exports)module.exports={normalize:normalize,evaluate:evaluate,summarize:summarize};
return {normalize:normalize,evaluate:evaluate,summarize:summarize};
})();
