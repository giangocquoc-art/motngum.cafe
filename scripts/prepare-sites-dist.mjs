import { cp, mkdir, rm } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const openNextDir = resolve(root, ".open-next");
const distDir = resolve(root, "dist");

await rm(distDir, { recursive: true, force: true });
await mkdir(resolve(distDir, "server"), { recursive: true });

// Keep the complete OpenNext tree beside the Sites-compatible entrypoint so
// relative imports and server-function assets retain their original paths.
// Sites' worker contract starts at dist/server/index.js, while OpenNext's
// native entrypoint is .open-next/worker.js.
await cp(openNextDir, resolve(distDir, "server"), { recursive: true });
await cp(
  resolve(openNextDir, "worker.js"),
  resolve(distDir, "server", "index.js")
);

// Preserve a conventional client directory for hosting adapters that mount
// static assets separately from the Worker bundle.
await cp(resolve(openNextDir, "assets"), resolve(distDir, "client"), {
  recursive: true,
});

await mkdir(resolve(distDir, ".openai"), { recursive: true });
await cp(
  resolve(root, ".openai", "hosting.json"),
  resolve(distDir, ".openai", "hosting.json")
);

console.log("Sites artifact prepared: dist/server/index.js");
