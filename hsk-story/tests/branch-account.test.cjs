const test=require('node:test'), assert=require('node:assert/strict');
const C=require('../branch-account.js'), E=require('../duong-re/branch-engine.js');
function storage(){const m=new Map();return {getItem:k=>m.has(k)?m.get(k):null,setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k)}}
function goPathToOldEnding(){let s=E.fresh(),limit=0;while(s.node!=="day2-epilogue"){if(++limit>70)throw Error("Could not reach former ending");const scene=E.data.byId[s.node],choice=scene.kind==="choice"?E.availableOptions(scene,s)[0].id:"next",out=E.step(s,choice);if(!out.ok)throw Error(out.error);s=out.state;}return s.path;}
function state(){const s=E.fresh(), out=E.step(s,E.data.byId[s.node].kind==='choice'?E.availableOptions(E.data.byId[s.node],s)[0].id:'next'); assert.ok(out.ok);return C.normalize({version:1,path:out.state.path,learning:Array(10).fill(null),draft:null})}
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

test('a delayed cloud restore notifies the running view after the snapshot is committed',async()=>{
 let s=storage(),srv=server(),online=false,remote=state(), notifications=0;
 srv.users.set('alice',{revision:2,snapshot:remote});
 let a=C.create({storage:s,fetch:async (...args)=>{if(!online)throw new TypeError('offline');return srv.fetch(...args)},onApplied:()=>{notifications++;assert.deepEqual(C.capture(s),remote);assert.equal(JSON.parse(s.getItem(C.keys.meta)).revision,2)}});
 assert.equal((await a.reconcile('alice')).ok,false);online=true;
 assert.equal((await a.flush()).changed,true);assert.equal(notifications,1);
});

test('newer snapshot, draft, path, and learning record versions cannot be silently normalized away',()=>{
 const cases=[{...state(),schemaVersion:2},state(),state(),state()];
 cases[1].draft={version:2};cases[2].path[0].version=2;cases[3].learning[0]={status:'correct',attempts:0,hint:false,version:2};
 for(const raw of cases){const before=JSON.stringify(raw);assert.throws(()=>C.normalize(raw),/mới hơn/);assert.equal(JSON.stringify(raw),before);}
});

test('capture and apply preserve newer local records, owner backups, and restore points byte-for-byte',()=>{
 const L=require('../duong-re/branch-learning.js'),newer=' { "version": 2, "future": "keep these bytes" }\n';
 const cases=[
  [C.keys.path,newer],[C.keys.learning,newer],[L.objectiveStorageKey,newer],[C.keys.draft,newer],
  [C.keys.learning,'[{"status":"correct","attempts":0,"hint":false,"version":2}]'],
  [C.keys.path,'{"version":1,"path":[{"at":"arrival","choice":"hold-mother","version":2}]}'],
  ['chimse-branch-pending-reply-v1',newer],['chimse-branch-pending-feedback-v1',newer],[C.keys.meta,newer],[C.keys.guest,'{"version":5}'],
  [C.keys.cache,JSON.stringify({other:{snapshot:{version:5},revision:7,base:C.empty()}})],
  [C.keys.restore,JSON.stringify([{owner:'other',snapshot:{version:5},at:1}])]
 ];
 const keys=[...Object.values(C.keys),L.objectiveStorageKey,'chimse-branch-pending-reply-v1','chimse-branch-pending-feedback-v1','hai-que-huong-progress-v3'];
 for(const [key,raw] of cases){
  const s=storage();C.apply(s,state());s.setItem('hai-que-huong-progress-v3','canonical progress');s.setItem(key,raw);
  const before=keys.map(k=>[k,s.getItem(k)]);
  assert.throws(()=>C.capture(s),/mới hơn/,key);assert.throws(()=>C.apply(s,C.empty()),/mới hơn/,key);
  assert.deepEqual(keys.map(k=>[k,s.getItem(k)]),before,key);
 }
});

test('a newer record appearing during account use blocks sync and owner changes without touching storage',async()=>{
 const s=storage(),srv=server();let requests=0;const a=C.create({storage:s,fetch:(...args)=>{requests++;return srv.fetch(...args)}});
 C.apply(s,state());assert.ok((await a.reconcile('alice')).ok);
 const future=' { "version": 2, "draft": "from a newer release" } ';s.setItem(C.keys.draft,future);
 const keys=Object.values(C.keys),before=keys.map(k=>[k,s.getItem(k)]),requestCount=requests;
 assert.equal((await a.reconcile('bob')).ok,false);assert.equal((await a.flush()).ok,false);assert.equal(await a.beforeSignOut(),false);assert.equal(await a.prepareLocalSignOut(),false);
 await assert.rejects(a.afterSignOut(),/mới hơn/);a.schedule();assert.equal(a.getStatus().state,'error');
 assert.equal(requests,requestCount);assert.deepEqual(keys.map(k=>[k,s.getItem(k)]),before);assert.equal(JSON.parse(s.getItem(C.keys.meta)).owner,'alice');
});

test('v1, v2, and v3 migrate to v4, appending new tasks without changing old evidence',()=>{
 const old={version:1,path:[],learning:Array(10).fill(null),draft:null},migrated=C.normalize(old);
 assert.equal(migrated.version,4);assert.equal(migrated.learning.length,15);assert.deepEqual(migrated.recall,{version:2,status:'unseen',attempts:0,helpUsed:false,boundary:'pending'});
 const oldV2={version:2,path:[],learning:Array(10).fill(null),draft:null,recall:{version:2,status:'unseen',attempts:0,helpUsed:false,boundary:'pending'}};assert.equal(C.normalize(oldV2).version,4);
 const completedPath=E.load({version:1,path:goPathToOldEnding()}).path;const completedV2=C.normalize({version:2,path:completedPath,learning:Array.from({length:10},(_,i)=>i===9?{status:'correct',attempts:1,hint:false}:null),draft:null,recall:{version:2,status:'unseen',attempts:0,helpUsed:false,boundary:'pending'}});assert.equal(completedV2.learning[9].status,'correct');assert.equal(completedV2.learning.length,15);assert.equal(completedV2.learning.slice(10).every(x=>x===null),true);
 const legacyV3=C.normalize({version:3,path:goPathToOldEnding(),learning:Array.from({length:12},(_,i)=>i===10?{status:'correct',attempts:2,hint:false}:null),draft:null,recall:{version:2,status:'unseen',attempts:0,helpUsed:false,boundary:'pending'}});assert.equal(legacyV3.version,4);assert.equal(legacyV3.learning[10].attempts,2);assert.equal(legacyV3.learning.length,15);assert.deepEqual(legacyV3.learning.slice(12),[null,null,null]);
 const s=storage(),snapshot=C.empty();snapshot.recall={version:2,status:'unassisted',attempts:1,helpUsed:false,boundary:'continued'};C.apply(s,snapshot);assert.deepEqual(C.capture(s).recall,snapshot.recall);assert.equal(C.hasProgress(snapshot),true);
 const before=JSON.stringify({...snapshot,version:5}),raw=JSON.parse(before);assert.throws(()=>C.normalize(raw));assert.equal(JSON.stringify(raw),before);
 s.setItem(C.keys.recall,'{"version":3,"future":true}');const unchanged=s.getItem(C.keys.recall);assert.throws(()=>C.apply(s,snapshot));assert.equal(s.getItem(C.keys.recall),unchanged);
});
test('recall rejects invalid states and only allows in-progress at the school gate after arrival',()=>{
 const snapshot=C.empty();snapshot.recall={version:1,status:'in-progress',attempts:0,helpUsed:false};assert.throws(()=>C.normalize(snapshot));
 let s=E.fresh();while(s.node!=='school-gate'){const n=E.data.byId[s.node],choice=n.kind==='choice'?E.availableOptions(n,s)[0].id:'next';s=E.step(s,choice).state;}snapshot.path=s.path;assert.equal(C.normalize(snapshot).recall.status,'in-progress');
 snapshot.recall={version:1,status:'wrong',attempts:0,helpUsed:false};assert.throws(()=>C.normalize(snapshot));
});

test('a storage failure during apply rolls back path, evidence and recall together',()=>{
 const inner=storage(),s={...inner},initial=C.empty();C.apply(s,initial);const keys=[C.keys.path,C.keys.learning,C.keys.draft,C.keys.recall,require('../duong-re/branch-learning.js').objectiveStorageKey],before=keys.map(k=>inner.getItem(k));
 let fail=true;s.setItem=(key,value)=>{if(key===C.keys.recall&&fail){fail=false;throw new Error('quota')}inner.setItem(key,value)};let next=state();next.recall={version:1,status:'unassisted',attempts:1,helpUsed:false};assert.throws(()=>C.apply(s,next));assert.deepEqual(keys.map(k=>inner.getItem(k)),before);
});

test('a newer cloud snapshot is rejected before any local bytes change',async()=>{
 const s=storage();C.apply(s,state());s.setItem('hai-que-huong-progress-v3','legacy');const before=[...Object.values(C.keys),'hai-que-huong-progress-v3'].map(k=>[k,s.getItem(k)]);let a=C.create({storage:s,fetch:async()=>({ok:true,status:200,json:async()=>({revision:7,snapshot:{version:5,path:[],learning:[],draft:null}})})});
 assert.equal((await a.reconcile('alice')).ok,false);assert.deepEqual(before.map(([k])=>[k,s.getItem(k)]),before);
});
