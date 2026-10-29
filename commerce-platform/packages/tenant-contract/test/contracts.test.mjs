import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizeHostname, assertNewMerchantSlug, assertTenantDomainActivation, makeRequestScopedCommerceClient, tenantScopedEventKey } from "../src/index.mjs";

test("hostnames canonicalize without trusting forwarded host fragments", () => {
 assert.equal(normalizeHostname("Shop-A.Motngum.Cafe."),"shop-a.motngum.cafe");
 for (const bad of ["","shop..cafe","https://shop.com","shop.com:1234","shop.com/foo"]) assert.throws(()=>normalizeHostname(bad));
});
test("reserved domain prefix and platform hosts are blocked", () => {
 assert.throws(()=>assertNewMerchantSlug("hsk"));
 assert.throws(()=>assertNewMerchantSlug("app"));
 assert.equal(assertNewMerchantSlug("shop-123"),"shop-123");
 assert.throws(()=>assertTenantDomainActivation({hostname:"hsk.motngum.cafe",merchant_state:"active",ownership_state:"verified",tls_state:"issued",routing_state:"active"}));
});
test("domain must pass all status gates", () => {
 const valid={hostname:"a.motngum.cafe",merchant_state:"active",ownership_state:"verified",tls_state:"issued",routing_state:"active"};
 assert.equal(assertTenantDomainActivation(valid),"a.motngum.cafe");
 for(const key of ["merchant_state","ownership_state","tls_state","routing_state"]) assert.throws(()=>assertTenantDomainActivation({...valid,[key]:"pending"}));
});
test("100 parallel merchant SDKs use trusted request-local values, never a global singleton",async()=>{
 const allowedBackendHosts=["a.medusa.example","b.medusa.example"]; const make=(ch)=>makeRequestScopedCommerceClient({hostname:ch+".motngum.cafe",resolvedConnection:{merchantId:ch,hostname:ch+".motngum.cafe",backendUrl:"https://"+ch+".medusa.example/",publishableKey:"pk_"+ch},sdkFactory:v=>({...v,requestTenant:ch}),allowedBackendHosts});
 const all=await Promise.all(Array.from({length:100},(_,i)=>Promise.resolve(make(i%2?"b":"a"))));
 for(let i=0;i<all.length;i++){const t=i%2?"b":"a";assert.equal(all[i].requestTenant,t);assert.equal(all[i].publishableKey,"pk_"+t);assert.equal(all[i].baseUrl,"https://"+t+".medusa.example")}
});
test("host mismatch and arbitrary backend URL are forbidden",()=>{
 const base={hostname:"a.motngum.cafe",resolvedConnection:{merchantId:"a",hostname:"a.motngum.cafe",backendUrl:"https://a.medusa.example/",publishableKey:"pk_a"},sdkFactory:x=>x,allowedBackendHosts:["a.medusa.example"]};
 assert.throws(()=>makeRequestScopedCommerceClient({...base,hostname:"b.motngum.cafe"}));
 assert.throws(()=>makeRequestScopedCommerceClient({...base,resolvedConnection:{...base.resolvedConnection,backendUrl:"http://127.0.0.1/"}}));
 assert.throws(()=>makeRequestScopedCommerceClient({...base,resolvedConnection:{...base.resolvedConnection,backendUrl:"https://evil.example/"}}));
});
test("same provider event ID across merchants must NOT deduplicate each other",()=>{
 assert.notEqual(tenantScopedEventKey({merchantId:"a",provider:"tiktok",eventId:"123"}),tenantScopedEventKey({merchantId:"b",provider:"tiktok",eventId:"123"}));
 assert.notEqual(tenantScopedEventKey({merchantId:"a",provider:"meta",eventId:"123"}),tenantScopedEventKey({merchantId:"a",provider:"tiktok",eventId:"123"}));
});
