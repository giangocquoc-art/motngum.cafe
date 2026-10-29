import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../src/worker.mjs';

function fixture() {
  const merchants = new Map();
  const env = {
    PROVISIONING_TOKEN: 'ci-only-service-token-longer-than-48-characters-never-deploy',
    DB: {
      prepare(query) {
        return {
          async first() {
            if (query.startsWith('SELECT 1 AS ok')) return { ok: 1 };
            if (query.includes('COUNT(*) AS n')) return { n: merchants.size };
            throw new Error('unexpected unbound SQL');
          },
          bind(...params) {
            return {
              async first() {
                if (query.startsWith('SELECT id, slug, display_name, state FROM merchants WHERE id = ? OR slug = ?')) {
                  return [...merchants.values()].find(m => m.id === params[0] || m.slug === params[1]) ?? null;
                }
                if (query.startsWith('SELECT id, slug, display_name, state FROM merchants WHERE id = ?')) {
                  return merchants.get(params[0]) ?? null;
                }
                if (query.startsWith('SELECT 1 AS ok')) return { ok: 1 };
                if (query.includes('COUNT(*) AS n')) return { n: merchants.size };
                return null;
              },
              async run() {
                if (!query.startsWith('INSERT OR IGNORE INTO merchants')) throw new Error('unexpected SQL');
                const [id, slug, display_name] = params;
                if (![...merchants.values()].some(m => m.id === id || m.slug === slug)) {
                  merchants.set(id, { id, slug, display_name, state: 'provisioning' });
                }
                return { meta: { changes: 1 } };
              }
            };
          }
        };
      }
    }
  };
  return { env, merchants };
}
function request(path, body, authorization) {
  return new Request('https://commerce-preview.motngum.cafe' + path, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(authorization ? { authorization: 'Bearer ' + authorization } : {})
    },
    body: JSON.stringify(body)
  });
}
const ID1 = '46957b12-31d9-422e-805a-618cd14e53e4';
const ID2 = '933c0cb6-5420-4bb4-9758-8f92218f7113';

test('D1 provisioning denies unauthenticated requests without writes', async () => {
  const { env, merchants } = fixture();
  const body = { id: ID1, slug: 'shop-one', display_name: 'Shop One' };
  assert.equal((await worker.fetch(request('/internal/merchants', body), env, {})).status, 401);
  assert.equal((await worker.fetch(request('/internal/merchants', body, 'wrong-token'), env, {})).status, 401);
  assert.equal(merchants.size, 0);
  assert.equal((await worker.fetch(new Request('https://commerce-preview.motngum.cafe/health'), env, {})).status, 200);
});
test('D1 provisioning is idempotent and does not activate shops', async () => {
  const { env, merchants } = fixture();
  const first = { id: ID1, slug: 'shop-one', display_name: 'Shop One' };
  const token = env.PROVISIONING_TOKEN;
  const created = await worker.fetch(request('/internal/merchants', first, token), env, {});
  assert.equal(created.status, 201, await created.text().then(() => 'create failed'));
  // Cannot reuse the response body after reading status.
  const replay = await worker.fetch(request('/internal/merchants', first, token), env, {});
  assert.equal(replay.status, 200);
  assert.equal((await replay.json()).merchant.state, 'provisioning');
  assert.equal(merchants.size, 1);
  assert.equal((await worker.fetch(request('/internal/merchants', { ...first, id: ID2 }, token), env, {})).status, 409);
  assert.equal((await worker.fetch(request('/internal/merchants', { ...first, display_name: 'Wrong Name' }, token), env, {})).status, 409);
  assert.equal(merchants.size, 1);
});
test('D1 rejects invalid slugs and unsafe IDs', async () => {
  const { env, merchants } = fixture(); const token = env.PROVISIONING_TOKEN;
  assert.equal((await worker.fetch(request('/internal/merchants',
    { id: ID1, slug: '../other', display_name: 'Shop One' }, token), env, {})).status, 400);
  assert.equal((await worker.fetch(request('/internal/merchants',
    { id: '1', slug: 'shop-two', display_name: 'Shop Two' }, token), env, {})).status, 400);
  assert.equal(merchants.size, 0);
});
