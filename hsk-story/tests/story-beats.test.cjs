const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const box={module:{exports:{}}};vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../story-beats.js'),'utf8'),box);
const B=box.module.exports;
test('narrative pages localized, unique and do not interrupt exam',()=>{assert.equal(B.validate(10,7).join(''),'');assert.equal(B.beats.length,5)});
test('first arrival is unscored story moment',()=>assert.equal(B.pending(0,[]).id,'arrival'));
test('acknowledged page stays acknowledged',()=>{const x=B.mark([],'arrival');assert.equal(B.pending(0,x),null);assert.equal(B.mark(x,'arrival').length,1)});
test('invalid browser event cannot unlock page',()=>assert.throws(()=>B.mark([],'forged')));
test('V5 progress migration does not skip unseen current story page',()=>{const x=B.migrate(undefined,4,[{status:'correct'},{status:'correct'},{status:'correct'},{status:'correct'}],false);assert.ok(x.includes('arrival'));assert.ok(x.includes('gate'));assert.ok(!x.includes('lunch'))});
test('V6 save retains explicit story pages',()=>{const x=B.migrate(['arrival'],2,[{status:'correct'}],false);assert.equal(B.pending(0,x),null);assert.equal(B.pending(1,x).id,'gate')});
