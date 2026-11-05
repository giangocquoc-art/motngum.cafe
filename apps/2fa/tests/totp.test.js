import test from 'node:test';import assert from 'node:assert/strict';
import {totp,encryptSecret,decryptSecret,hashPass,verifyPass,normalizeSecret} from '../api/_lib/security.js';
test('RFC6238 SHA1 vectors truncated to 6 digits',()=>{const s='GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ';assert.equal(totp(s,59000).code,'287082');assert.equal(totp(s,1111111109000).code,'081804');assert.equal(totp(s,1111111111000).code,'050471')});
test('secret normalization and cipher',()=>{process.env.TOTP_ENC_KEY='11'.repeat(32);const s=normalizeSecret('JBSW Y3DP EHPK 3PXP');assert.equal(decryptSecret(encryptSecret(s)),s)});
test('hashed access codes',()=>{const x=hashPass('test-account-pin');assert.ok(verifyPass('test-account-pin',x.salt,x.hash));assert.equal(verifyPass('wrong',x.salt,x.hash),false)});
