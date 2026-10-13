import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {pathToFileURL} from 'node:url';
process.on('uncaughtException',e=>{console.error(e.message);process.exit(1)});
const runtime=process.env.CODEX_DEPENDENCIES||'C:/Users/dtftn/.cache/codex-runtimes/codex-primary-runtime/dependencies';
const work=process.env.PPT_BUILD_ROOT||'C:/Users/dtftn/Documents/Codex/ppt_revision_20261013';
const input=process.argv[2]||path.join(work,'output/FSDR_RACE_defence_20261013.pptx');
const {FileBlob,PresentationFile}=await import(pathToFileURL(path.join(runtime,'node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs')).href);
const p=await PresentationFile.importPptx(await FileBlob.load(input));
const dest=path.join(work,'final-preview');await fs.mkdir(dest,{recursive:true});
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const results=[];
for(let i=0;i<p.slides.items.length;i++){
 const name=`slide-${String(i+1).padStart(2,'0')}.png`;
 const bytes=new Uint8Array(await(await p.export({slide:p.slides.items[i],format:'png',scale:1.2})).arrayBuffer());
 await fs.writeFile(path.join(dest,name),bytes);
 const old=await fs.readFile(path.join(work,'preview',name));
 results.push({slide:i+1,identicalToReviewedDraft:hash(bytes)===hash(old),sha256:hash(bytes)});
}
await fs.writeFile(path.join(work,'.build/final-render-check.json'),JSON.stringify({input,results},null,2));
console.log(JSON.stringify({slides:p.slides.items.length,changed:results.filter(r=>!r.identicalToReviewedDraft).map(r=>r.slide)}));
process.exit(0);
