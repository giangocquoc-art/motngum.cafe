const test=require('node:test'), assert=require('node:assert/strict');
const C=require('../branch-account.js'), E=require('../duong-re/branch-engine.js');
function storage(){const m=new Map();return {getItem:k=>m.has(k)?m.get(k):null,setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k)}}
function state(){const s=E.fresh(), out=E.step(s,E.data.byId[s.node].kind==='choice'?E.availableOptions(E.data.byId[s.node],s)[0].id:'next'); assert.ok(out.ok);return {version:1,path:out.state.path,learning:Array(10).fill(null),draft:null}}
function server(){const users=new Map();return {users,fetch:async (_url,opts)=>{let owner=opts.headers['X-Chimse-Owner'], row=users.get(owner)||{revision:0,snapshot:null};if(opts.method==='PUT'){let data=JSON.parse(opts.body);if(data.revision!==row.revision)return {ok:false,status:409,json:async()=>row};row={revision:row.revision+1,snapshot:data.snapshot};users.set(owner,row)}return {ok:true,status:200,json:async()=>row}}}}
test('uploads guest progress, preserves separate owners and restores guest after signout',async()=>{let s=storage(),srv=server(),a=C.create({storage:s,fetch:srv.fetch}), progress=state(); C.apply(s,progress);assert.ok((await a.reconcile('alice')).ok);assert.deepEqual(srv.users.get('alice').snapshot,progress);assert.ok(await a.beforeSignOut());await a.afterSignOut();assert.deepEqual(C.capture(s),progress);C.apply(s,C.empty());assert.ok((await a.reconcile('alice')).ok);assert.deepEqual(C.capture(s),progress);assert.ok(await a.beforeSignOut());await a.afterSignOut();assert.deepEqual(C.capture(s),C.empty());});
test('conflicting local and cloud data require an explicit choice and keep restore points',async()=>{let s=storage(),srv=server(),a=C.create({storage:s,fetch:srv.fetch}), local=state(), remote=C.empty();remote.learning[0]={status:'correct',attempts:0,hint:false}; C.apply(s,local);srv.users.set('alice',{revision:2,snapshot:remote});assert.equal((await a.reconcile('alice')).conflict,true);assert.equal((await a.flush()).conflict,true);assert.ok((await a.resolve('cloud')).ok);assert.deepEqual(C.capture(s),remote);assert.ok(JSON.parse(s.getItem(C.keys.restore)).length);});
test('rejects malformed path and drafts',()=>{let bad=state();bad.path.push({at:'bad',choice:'next'});assert.throws(()=>C.normalize(bad));bad=C.empty();bad.draft={index:0,at:'bad',path:[],attempts:0,helped:false,draft:''};assert.throws(()=>C.normalize(bad));});


test('a failed initial read cannot make an unverified empty save look synchronized',async()=>{
 let s=storage(),srv=server(),online=false,remote=state();
 srv.users.set('alice',{revision:3,snapshot:remote});
 let a=C.create({storage:s,fetch:async (...args)=>{if(!online)throw new TypeError('offline');return srv.fetch(...args)}});
 assert.equal((await a.reconcile('alice')).ok,false);
 assert.equal((await a.flush()).ok,false);
 assert.equal(a.getStatus().state,'error');
 assert.equal(await a.beforeSignOut(),false);
 online=true;
 assert.ok((await a.flush()).ok);
 assert.deepEqual(C.capture(s),remote);
 assert.equal(a.getStatus().state,'saved');
});

test('edits made during conflict resolution are saved after the chosen local snapshot',async()=>{
 let s=storage(),srv=server(),local=state(),remote=C.empty();
 remote.learning[0]={status:'correct',attempts:0,hint:false};
 C.apply(s,local);srv.users.set('alice',{revision:2,snapshot:remote});
 let release,started;const wait=new Promise(r=>release=r), began=new Promise(r=>started=r);
 let a=C.create({storage:s,fetch:async (url,opts)=>{if(opts.method==='PUT'){started();await wait}return srv.fetch(url,opts)}});
 assert.equal((await a.reconcile('alice')).conflict,true);
 const saving=a.resolve('local');await began;
 let updated=structuredClone(local);updated.learning[0]={status:'correct',attempts:0,hint:false};C.apply(s,updated);
 release();assert.ok((await saving).ok);
 assert.deepEqual(srv.users.get('alice').snapshot,updated);
});

test('offline signout keeps the account story in its local backup and restores it on return',async()=>{
 let s=storage(),srv=server(),online=true,a=C.create({storage:s,fetch:(...args)=>online?srv.fetch(...args):Promise.reject(new TypeError('offline'))});
 assert.ok((await a.reconcile('alice')).ok);
 let progress=state();C.apply(s,progress);online=false;
 assert.equal(await a.beforeSignOut(),false);
 assert.equal(await a.prepareLocalSignOut(),true);
 await a.afterSignOut();assert.deepEqual(C.capture(s),C.empty());
 online=true;assert.ok((await a.reconcile('alice')).ok);
 assert.deepEqual(C.capture(s),progress);assert.deepEqual(srv.users.get('alice').snapshot,progress);
});
