const {test}=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const root=path.resolve(__dirname,"..");
test("local environment files are excluded from both Git and Vercel uploads",()=>{
 const gitignore=fs.readFileSync(path.join(root,"..",".gitignore"),"utf8");
 const vercelignore=fs.readFileSync(path.join(root,".vercelignore"),"utf8");
 assert.match(gitignore,/^\.env\*$/m);
 assert.match(vercelignore,/^\.env\*$/m);
});
