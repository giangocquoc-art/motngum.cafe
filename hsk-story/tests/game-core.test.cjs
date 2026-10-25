const {test}=require("node:test");const assert=require("node:assert/strict");const c=require("../game-core.js");
function scene(id,answers){return {id,answers};}
test("normalizes punctuation and whitespace",()=>assert.equal(c.normalize("我 很好！"),"我很好"));
const tests=[
[0,["我很好"],"我很好",true],[0,["我很好"],"我不好",false],[0,["我很好"],"我很好但是我不好",false],
[1,["我叫安"],"我叫小明",false],[1,["我叫安"],"我叫Minh An",false],
[3,["有三个学生","有三个人"],"有三个人",true],[3,["有三个学生"],"没有三个学生",false],
[5,["谢谢"],"多少钱",false],[5,["谢谢"],"谢谢！",true],
[7,["我叫安，我是学生"],"我叫小明。我是学生。",false],[7,["我叫安，我是学生"],"我是学生",false],
[8,["星期二"],"星期二",true],[8,["星期二"],"星期三",false],
[9,["我想喝水"],"我想喝茶",true],[9,["我想喝水"],"我不想喝水",false]];
tests.forEach(([id,answers,input,expected],i)=>test("scoring fixture "+(i+1),()=>assert.equal(c.evaluate(scene(id,answers),input).ok,expected)));
test("summary distinguishes assisted attempts and exam",()=>assert.deepEqual(c.summarize([{status:"correct"},{status:"assisted"},{status:"correct"}],3,1),{total:3,completed:3,independently:2,hinted:0,assisted:1,examCorrect:1,examTotal:2}));

test("hinted correct is not scored as independent",()=>assert.deepEqual(c.summarize([{status:"correct",hint:true},{status:"correct",hint:false}],2,1),{total:2,completed:2,independently:1,hinted:1,assisted:0,examCorrect:1,examTotal:1}));
