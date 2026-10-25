const {test}=require("node:test");const assert=require("node:assert/strict");const {readFileSync}=require("node:fs");const {runInNewContext}=require("node:vm");const path=require("node:path");const box={module:{exports:{}}};runInNewContext(readFileSync(path.join(__dirname,"../game-core.js"),"utf8"),box);const c=box.module.exports;
function scene(id,answers){return {id,answers};}
test("normalizes punctuation and whitespace",()=>assert.equal(c.normalize("我 很好！"),"我很好"));
const tests=[
[0,["我很好"],"我很好",true],[0,["我很好"],"我不好",false],[0,["我很好"],"我很好但是我不好",false],
[1,["我叫安"],"我叫小明",false],[1,["我叫安"],"我叫Minh An",false],
[3,["有三个学生","有三个人"],"有三个人",true],[3,["有三个学生"],"没有三个学生",false],
[5,["谢谢"],"多少钱",false],[5,["谢谢"],"谢谢！",true],
[7,["我叫安，我是学生"],"我叫小明。我是学生。",false],[7,["我叫安，我是学生"],"我是学生",false],
[8,["十块钱"],"十块钱",true],[8,["十块钱"],"星期二",false],
[9,["我想吃面条"],"我想吃一碗面条",true],[9,["我想吃面条"],"我不想吃面条",false]];
tests.forEach(([id,answers,input,expected],i)=>test("scoring fixture "+(i+1),()=>assert.equal(c.evaluate(scene(id,answers),input).ok,expected)));
test("summary distinguishes assisted attempts and exam",()=>assert.equal(JSON.stringify(c.summarize([{status:"correct",attempts:0},{status:"assisted",attempts:0},{status:"correct",attempts:0}],3,1)),JSON.stringify({total:3,completed:3,independently:2,hinted:0,assisted:1,examCorrect:1,examTotal:2})));

test("hinted correct is not scored as independent",()=>assert.equal(JSON.stringify(c.summarize([{status:"correct",hint:true,attempts:0},{status:"correct",hint:false,attempts:0}],2,1)),JSON.stringify({total:2,completed:2,independently:1,hinted:1,assisted:0,examCorrect:1,examTotal:1})));

test("scene 8 tests previously taught noodle price, not weekdays",()=>{assert.equal(c.evaluate(scene(8,["十块钱"]),"十块钱").ok,true);assert.equal(c.evaluate(scene(8,["十块钱"]),"星期二").ok,false)});
test("scene 9 tests already practiced noodle order, not new drinks",()=>{assert.equal(c.evaluate(scene(9,["我想吃面条"]),"我想吃面条").ok,true);assert.equal(c.evaluate(scene(9,["我想吃面条"]),"我想喝茶").ok,false)});

test("exam requires first try without help",()=>{assert.equal(c.summarize([{status:"correct",attempts:1,hint:false}],1,0).examCorrect,0);assert.equal(c.summarize([{status:"correct",attempts:0,hint:false}],1,0).examCorrect,1)});
