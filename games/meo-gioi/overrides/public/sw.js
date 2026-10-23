/* Migration worker: delete ONLY Meowniverse offline cache and retire legacy registration. */
self.addEventListener('install',event=>{self.skipWaiting()});
self.addEventListener('activate',event=>{
 event.waitUntil((async()=>{
   const keys=await caches.keys();
   await Promise.all(keys.filter(key=>key.startsWith('meowniverse-')).map(key=>caches.delete(key)));
   await self.registration.unregister();
   const clients=await self.clients.matchAll({type:'window',includeUncontrolled:true});
   await Promise.all(clients.map(client=>client.navigate(client.url).catch(()=>undefined)));
 })());
});
