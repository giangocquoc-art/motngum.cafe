const esbuild=require('esbuild');
const path=require('node:path');
const fs=require('node:fs');
const root=path.resolve(__dirname,'..');
const outfile=path.join(root,'api/branch-progress.js');
esbuild.build({entryPoints:[path.join(root,'server/branch-progress.mjs')],outfile:outfile,bundle:true,format:'cjs',platform:'node',target:'node22',minify:true,legalComments:'eof'}).then(()=>{
 const bundled=fs.readFileSync(outfile,'utf8');
 fs.writeFileSync(outfile,bundled.replace(/[ \t]+(?=\r?$)/gm,''));
}).catch(error=>{console.error(error.message);process.exitCode=1});
