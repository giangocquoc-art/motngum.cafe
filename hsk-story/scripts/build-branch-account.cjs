const esbuild=require('esbuild');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
esbuild.build({entryPoints:[path.join(root,'server/branch-progress.mjs')],outfile:path.join(root,'api/branch-progress.js'),bundle:true,format:'cjs',platform:'node',target:'node22',minify:true,legalComments:'eof'}).catch(error=>{console.error(error.message);process.exitCode=1});
