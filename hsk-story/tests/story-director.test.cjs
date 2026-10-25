const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const box={module:{exports:{}}};vm.runInNewContext(fs.readFileSync(require('node:path').join(__dirname,'../story-director.js'),'utf8'),box);const D=box.module.exports;
test('branches reconverge before exam',()=>assert.equal(D.validate(10,7).join(','),''));
test('choice points are scene 2 and 4, never exam',()=>{assert.equal(D.pending(2,{}).id,'friendship');assert.equal(D.pending(4,{}).id,'noodle-taste');assert.equal(D.pending(7,{}),null)});
test('choice options change next scene but never scene id',()=>{const a=D.select({},'friendship','sit-with-friend'),b=D.select({},'friendship','ask-teacher');assert.notEqual(D.beat(3,a).zh,D.beat(3,b).zh);assert.equal(D.beat(4,a),null)});
test('immutable accepted choice and safe corrupt storage',()=>{const a=D.select({},'noodle-taste','mild');assert.throws(()=>D.select(a,'noodle-taste','try-spicy'));assert.equal(D.clean({friendship:'malicious','noodle-taste':'mild'}).friendship,undefined);assert.equal(D.memory(a).length,1)});
