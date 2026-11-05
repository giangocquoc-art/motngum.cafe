import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');

test('customer and admin share exactly one account identifier', () => {
  const customer = read('public/index.html');
  const admin = read('public/admin.html');
  const customerJs = read('public/site.js');
  const adminJs = read('public/admin.js');
  const lookup = read('api/code.js');
  assert.match(customer, /id="account"/);
  assert.doesNotMatch(customer, /id="pin"|id="access"/);
  assert.match(customerJs, /account:\$\('account'\)\.value\.trim\(\)/);
  assert.match(admin, /id="login"/);
  assert.doesNotMatch(admin, /id="accessPin"/);
  assert.match(adminJs, /const issued=payload\.login\.trim\(\)\.toLowerCase\(\)/);
  assert.doesNotMatch(adminJs, /accessToken|M2\./);
  assert.match(adminJs, /crypto\.getRandomValues/);
  assert.match(lookup, /const raw=bodyOf\(req\)\.account/);
  assert.match(lookup, /isPrivateID/);
  assert.match(lookup, /token-v2/);
  assert.match(lookup, /verifyPass/);
});
