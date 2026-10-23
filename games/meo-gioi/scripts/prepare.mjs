import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const revision = "443bb0f427bac6491e90e569b179facdccc4ecdc";
if (fs.existsSync(path.join(root, "src", "standalone.ts")) && fs.existsSync(path.join(root, "public", "map", "simplemap.tmx"))) {
 console.log("[Meo Gioi] Source ready"); 
} else {
 const url = "https://codeload.github.com/rpgjs/starter/tar.gz/" + revision;
 const response = await fetch(url, {signal: AbortSignal.timeout(60000)});
 if(!response.ok) throw new Error("Cannot get pinned RPGJS starter: HTTP "+response.status);
 const tmp=fs.mkdtempSync(path.join(os.tmpdir(),"meo-gioi-"));
 const tgz=path.join(tmp,"starter.tar.gz");
 fs.writeFileSync(tgz, Buffer.from(await response.arrayBuffer()));
 const dst=path.join(tmp,"repo"); fs.mkdirSync(dst);
 execFileSync("tar",["-xzf",tgz,"--strip-components=1","-C",dst]);
 for(const part of ["src","public","vite.config.ts","tsconfig.json"]){
  fs.cpSync(path.join(dst,part),path.join(root,part),{recursive:true,force:true});
 }
 fs.rmSync(tmp,{recursive:true,force:true});
}
const overlay=path.join(root,"overrides");
function overlayCopy(src,target){
 for (const entry of fs.readdirSync(src,{withFileTypes:true})){
  const from=path.join(src,entry.name),to=path.join(target,entry.name);
  if(entry.isDirectory()){fs.mkdirSync(to,{recursive:true});overlayCopy(from,to)}
  else fs.copyFileSync(from,to);
 }
}
overlayCopy(overlay,root);
await import("./generate-sprites.mjs");
console.log("[Meo Gioi] S0 source assembled");
