/* Compile the authored art manifest for synchronous static-page loading. */
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'art/manifest.json'),'utf8'));
const backgrounds=Object.fromEntries(Object.entries(manifest.backgrounds).map(([id,b])=>[id,{desktop:b.desktop,mobile:b.mobile,...(b.compact?{compact:b.compact}:{})}]));
const data={version:manifest.version,sceneIds:Object.keys(manifest.scenes),sprites:manifest.spriteCharacters,backgrounds,scenes:{...manifest.scenes,...manifest.auxiliaryScenes}};
const output='/* Generated from art/manifest.json. Run node scripts/build-scene-manifest.cjs. */\nvar HSKSceneManifest='+JSON.stringify(data)+';\nif(typeof module!=="undefined"&&module.exports)module.exports=HSKSceneManifest;\n';
const dest=path.join(root,'scene-manifest.js');
if(process.argv.includes('--check')){
 if(!fs.existsSync(dest)||fs.readFileSync(dest,'utf8').replace(/\r\n/g,'\n')!==output)throw Error('scene-manifest.js is stale; rebuild it from art/manifest.json');
}else fs.writeFileSync(dest,output);
