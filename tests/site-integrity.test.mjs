import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("configurator contains the approved prices and Zalo handoff", async () => {
  const source = await read("components/StudioConfigurator.tsx");
  for (const price of ["1_888_000", "3_888_000", "9_888_000", "10_000_000"]) assert.match(source, new RegExp(price));
  assert.match(source, /https:\/\/zalo\.me\/0583799593/);
  assert.match(source, /Mail Pro/);
  assert.match(source, /Sao chép báo giá/);
});

test("domain provider is read-only and prices through configurable markup", async () => {
  const source = await read("lib/domain-provider.ts");
  assert.match(source, /DOMAIN_MARKUP_VND/);
  assert.match(source, /checkavailable/);
  assert.doesNotMatch(source, /domain\/create|domain\/renew|updatedns|updaterecord/);
  assert.match(source, /status: "unknown"/);
});

test("WordPress catalog protects writes and exposes a read-only catalog", async () => {
  const source = await read("wordpress/motngum-studio/motngum-studio.php");
  assert.match(source, /wp_verify_nonce/);
  assert.match(source, /current_user_can\('edit_post'/);
  assert.match(source, /register_rest_route\('motngum\/v1', '\/catalog'/);
  assert.match(source, /mn_domain_markup/);
});
