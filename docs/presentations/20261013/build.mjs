import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath,pathToFileURL} from 'node:url';
process.on('uncaughtException',e=>{console.error(e.stack?.split('\n').filter(x=>x.length<1000).join('\n')||e.message);process.exit(1)});
const HERE=path.dirname(fileURLToPath(import.meta.url));
const RUNTIME=process.env.CODEX_DEPENDENCIES||'C:/Users/dtftn/.cache/codex-runtimes/codex-primary-runtime/dependencies';
const SKILL=process.env.PRESENTATIONS_SKILL||'C:/Users/dtftn/.codex/plugins/cache/openai-primary-runtime/presentations/26.1011.11113/skills/presentations';
// Use NTFS for the finalizer's atomic hard-link publication on this host.
const WORK=process.env.PPT_BUILD_ROOT||'C:/Users/dtftn/Documents/Codex/ppt_revision_20261013';
const OUT=process.env.PPT_OUTPUT_NAME||'FSDR_RACE_defence_20261013.pptx';
process.env.RUNTIME_NODE_MODULES=path.join(RUNTIME,'node/node_modules');
const {FileBlob,PresentationFile}=await import(pathToFileURL(path.join(RUNTIME,'node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs')).href);
const {finalizePresentation,applyPresentationChartFont}=await import(pathToFileURL(path.join(SKILL,'container_tools/artifact_tool_utils.mjs')).href);
await fs.mkdir(path.join(WORK,'.build'),{recursive:true});
await fs.mkdir(path.join(WORK,'output'),{recursive:true});
await fs.mkdir(path.join(WORK,'preview'),{recursive:true});
const SOURCE=path.join(HERE,'source_20260922_user.pptx');
const p=await PresentationFile.importPptx(await FileBlob.load(SOURCE));
if(p.slides.items.length!==23)throw Error('Expected the user-edited 23-slide deck');
const evidence=JSON.parse(await fs.readFile(path.join(HERE,'evidence/primary_results.json'),'utf8'));
const old=JSON.parse(await fs.readFile(path.join(HERE,'evidence/source_content.json'),'utf8'));
const ext=JSON.parse(await fs.readFile(path.join(HERE,'evidence/external_results.json'),'utf8'));
const assetBytes=new Map(await Promise.all((await fs.readdir(path.join(HERE,'assets'))).filter(f=>f.endsWith('.png')).map(async f=>[f,new Uint8Array(await fs.readFile(path.join(HERE,'assets',f)))])));
const seeds=[1219,2027,3407], groups=['Matched PLAM','FSDR','PLAM + complete RACE','FSDR + complete RACE'];
const rows=g=>evidence.rows.filter(r=>r.group===`J${g}`).sort((a,b)=>a.seed-b.seed);
const mean=a=>a.reduce((s,v)=>s+v,0)/a.length;
const stats=(g,k)=>{const a=rows(g).map(r=>100*r[k]),m=mean(a);return [m,Math.sqrt(a.reduce((s,v)=>s+(v-m)**2,0)/(a.length-1))]};
const ms=(g,k,d=2)=>stats(g,k).map(x=>x.toFixed(d)).join(' ± ');
const delta=(a,b)=>rows(a).map((r,i)=>100*(r.test_iou-rows(b)[i].test_iou));
if(evidence.status!=='complete'||evidence.rows.length!==12)throw Error('Incomplete experiment evidence');
if(Math.abs(stats(3,'test_iou')[0]-76.2262)>.00005)throw Error('Result snapshot changed');
const palette={ink:'#202124',muted:'#62686C',line:'#C9CDCF',blue:'#D5E5F4',blueLine:'#4F82AF',purple:'#DCDDF0',purpleLine:'#8586B7',green:'#DCEACC',greenLine:'#78974E',orange:'#F9DFC1',orangeLine:'#CA863D',yellow:'#F7E7AC',yellowLine:'#B39938'};
const text=(s,value,x,y,w,h,size=24,bold=false,color=palette.ink,font='Calibri',align='left')=>{
 const a=s.shapes.add({geometry:'textbox',name:value.slice(0,55),position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:'none',width:0}});
 a.text=value;a.text.style={typeface:font,fontSize:size,bold,color,alignment:align,verticalAlignment:'middle',wrap:'square',autoFit:'none',insets:0};return a;
};
const shape=(s,label,x,y,w,h,fill=palette.blue,stroke=palette.blueLine,size=22,geom='roundRect')=>{
 const a=s.shapes.add({geometry:geom,name:label,position:{left:x,top:y,width:w,height:h},fill,line:{fill:stroke,width:1.3},...(['roundRect','rect'].includes(geom)?{borderRadius:8}:{})});
 a.text=label;a.text.style={typeface:'Calibri',fontSize:size,color:palette.ink,alignment:'center',verticalAlignment:'middle',autoFit:'none',wrap:'square',insets:{left:7,right:7,top:3,bottom:3}};return a;
};
const tensor=(s,label,x,y,w,h,fill=palette.purple,stroke=palette.purpleLine)=>shape(s,label,x,y,w,h,fill,stroke,22,'cube');
const conn=(s,a,b,from='right',to='left',color=palette.muted,kind='straight',dash=false)=>s.shapes.connect(a,b,{kind,fromSide:from,toSide:to,line:{fill:color,width:1.8,style:dash?'dashed':'solid'},tail:{type:'triangle',width:'sm',length:'sm'}});
const line=(s,x,y,w,h,color=palette.line,dash=false)=>s.shapes.add({geometry:'line',position:{left:Math.min(x,x+w),top:Math.min(y,y+h),width:Math.abs(w),height:Math.abs(h)},line:{fill:color,width:1.4,style:dash?'dashed':'solid'},fill:'none'});
const arrow=(s,x,y,w,h,color=palette.muted)=>s.shapes.add({geometry:'connector',kind:'straight',position:{left:Math.min(x,x+w),top:Math.min(y,y+h),width:Math.abs(w),height:Math.abs(h)},line:{fill:color,width:1.8},[h<0||w<0?'head':'tail']:{type:'triangle',width:'sm',length:'sm'}});
const clear=n=>{const s=p.slides.items[n-1];for(const c of[s.shapes,s.tables,s.images,s.charts])for(const a of[...c.items])c.deleteById(a.id);return s};
const base=(n,title,footer='')=>{const s=clear(n);s.background.fill='#FFFFFF';text(s,title,67,38,1146,91,40,true,palette.ink,'Cambria');text(s,footer,67,680,1080,18,12,false,'#929699');text(s,String(n),1170,680,43,18,12,false,'#929699','Calibri','right');return s};
const table=(s,values,widths,y=185,h=330,size=25,boldRows=[])=>{
 const t=s.tables.add({rows:values.length,columns:values[0].length,left:67,top:y,width:1146,height:h,columnWidths:widths,values});
 t.borders.assign({fill:'#B8BFC3',width:.8,style:'solid'});
 t.cells.block({row:0,column:0,rowCount:values.length,columnCount:values[0].length}).assign({margins:{left:12,right:10,top:4,bottom:4},anchor:'center'});
 for(let r=0;r<values.length;r++){t.rows[r].height=h/values.length;for(let c=0;c<values[r].length;c++){const z=t.getCell(r,c);z.fill=r===0?'#202124':boldRows.includes(r)?'#EDF3E7':r%2===0?'#F4F5F5':'#FFFFFF';z.text.style={typeface:'Calibri',fontSize:size,bold:r===0||boldRows.includes(r),color:r===0?'#FFFFFF':palette.ink,verticalAlignment:'middle',autoFit:'none'}}}return t;
};
const img=(s,name,x,y,w,h,crop)=>s.images.add({blob:assetBytes.get(name),contentType:'image/png',position:{left:x,top:y,width:w,height:h},fit:'cover',...(crop?{crop}:{}),alt:name});
const primarySource='evidence/primary_results.json\nOriginal: docs/results/stage1_overall_20260915/FINAL_RESULTS.json';
const notes={};
const note=(n,en,cn,sources=primarySource)=>{const v=`English speaker notes\n${en}\n\n中文讲稿\n${cn}\n\nSources\n${sources}`;p.slides.items[n-1].speakerNotes.textFrame.setText(v);notes[n]=v};

// Preserve the user's cover and typography; the old date was a revision date.
{
 const s=p.slides.items[0];for(const a of s.shapes.items){const v=a.text?.toString?.()||'';if(v.includes('Updated 22 September'))a.text='Final defence';}
 note(1,'This work studies FSDR and complete RACE for text-guided infection segmentation in chest X-rays. All headline results use the fixed Test split and the matched single-cycle cosine study.','本次汇报介绍 FSDR 和完整 RACE 胸片感染分割。主结论来自固定测试集，以及采用单次余弦的匹配实验。');
}
{
 const s=base(2,'Text-guided infection segmentation','QaTa-COV19 v2 · example C07 · dataset-provided description');
 text(s,'Chest X-ray',67,149,270,36,25,true);img(s,'C07_image.png',67,198,268,268);
 text(s,'Report',420,149,350,36,25,true);
 text(s,'“Bilateral pulmonary infection,\ntwo infected areas, upper left\nlung and lower right lung.”',420,209,405,185,27);
 text(s,'Ground-truth mask',928,149,285,36,25,true);img(s,'C07_gt.png',928,198,268,268);
 text(s,'+',354,297,44,52,38,false,palette.muted,'Calibri','center');arrow(s,843,323,60,0);
 line(s,67,506,1146,0);
 text(s,'Semantic cues are coarse',67,529,525,40,28,true,palette.greenLine);
 text(s,'Fusion must retain local spatial detail.',67,574,525,60,25);
 text(s,'Report and image may disagree',678,529,535,40,28,true,palette.orangeLine);
 text(s,'Routing should also use visual evidence.',678,574,535,60,25);
 note(2,'The input is a chest X-ray and its dataset-provided text description, and the target is a binary infection mask. This is the exact description paired with C07. Anatomical wording is preserved as supplied; it is not a new clinical interpretation. The design motivations are detail-preserving fusion and report-image agreement.','输入为胸片和数据集配套描述，输出感染二值掩膜。展示的是 C07 原始配对描述，保留数据集解剖措辞，不重新进行临床判断。设计动机是兼顾语义与细节，并在报告引导中引入视觉一致性。','evidence/case_reports.json\nassets/C07_image.png\nassets/C07_gt.png\nevidence/qualitative_selection.json');
}
function sixty(){return 60;}
{
 const s=base(3,'Two architectural contributions','Matched single-cycle cosine · three seeds · Test macro IoU');
 text(s,'FSDR',67,158,220,55,39,true,palette.greenLine);
 text(s,'Frequency-aware Semantic–Detail Refinement',67,224,1146,38,28,true);
 text(s,'Keep CNN, ViT and decoder features separate during refinement.\nUse semantic support to guide local detail.',67,280,940,75,27);
 text(s,'+0.51 pp',1010,276,203,65,35,true,palette.greenLine,'Calibri','right');
 text(s,'vs. matched PLAM',954,344,259,30,20,false,palette.muted,'Calibri','right');
 line(s,67,398,1146,0);
 text(s,'RACE',67,425,220,55,39,true,palette.orangeLine);
 text(s,'Report–Anatomy Consistency and Evidence Fusion',67,490,1146,38,28,true);
 text(s,'Gate CNN skips with a report prior and visual evidence.\nEvaluate routing and auxiliary training as one complete module.',67,544,940,75,27);
 text(s,'+0.24 pp',1010,540,203,65,35,true,palette.orangeLine,'Calibri','right');
 text(s,'added to FSDR',954,610,259,28,20,false,palette.muted,'Calibri','right');
 note(3,'FSDR changes decoder skip fusion. Complete RACE refines CNN skips using report, anatomy and visual evidence and includes auxiliary training. The gains are 0.5058 and 0.2428 percentage points, respectively. Auxiliary supervision is not claimed as a separate innovation.','FSDR 改变解码器跳跃融合。完整 RACE 利用报告、解剖与视觉证据精炼 CNN 跳连，并包含辅助训练。两项增益分别为 0.5058 和 0.2428 个百分点，不将辅助监督单独计为创新点。');
}
{
 const s=base(4,'FSDR and RACE within LViT','Same labels identify matching feature ports · T: frozen CXR-BERT features · B: anatomical basis');
 text(s,'ViT branch',67,139,328,31,25,true,palette.blueLine);
 text(s,'CNN encoder',485,139,230,31,25,true,palette.purpleLine);
 text(s,'Skip refinement',736,139,228,31,25,true,palette.orangeLine);
 text(s,'CNN decoder',1030,139,195,31,25,true,palette.greenLine);
 text(s,'Report → CXR-BERT → T',67,180,370,31,22,false,palette.yellowLine);
 text(s,'X-ray ↓',490,181,150,31,22);text(s,'↑ Mask',1068,180,145,31,22);
 const vd=[],vu=[],cs=[],rs=[],us=[];
 for(let i=0;i<4;i++){
  const y=238+i*91;
  vd.push(tensor(s,`Down ${i+1}`,67,y,126,57,palette.blue,palette.blueLine));
  vu.push(tensor(s,`Up ${i+1}`,269,y,126,57,palette.blue,palette.blueLine));
  cs.push(tensor(s,`C${i+1}`,492,y,110,57));
  rs.push(tensor(s,`RACE ${i+1}`,748,y,138,57,palette.orange,palette.orangeLine));
  us.push(tensor(s,`FSDR ${i+1}`,1050,y,153,57,palette.green,palette.greenLine));
  conn(s,vd[i],vu[i],'right','left',palette.blueLine);
  conn(s,cs[i],rs[i],'right','left',palette.orangeLine);
  conn(s,rs[i],us[i],'right','left',palette.orangeLine);
  text(s,`C${i+1}, T`,67,y-23,125,21,17,false,palette.blueLine);
  text(s,`V${i+1}`,410,y+17,54,25,19,false,palette.blueLine);
  conn(s,vu[i],text(s,'',466,y+26,1,1),'right','left',palette.blueLine);
  text(s,'T, B',776,y-23,85,21,17,false,palette.yellowLine);
  text(s,`up${i+1}: V${i+1}, T`,1055,y-23,155,21,17,false,palette.blueLine);
  text(s,`C′${i+1}`,934,y+7,64,27,18,false,palette.orangeLine);
  if(i){conn(s,vd[i-1],vd[i],'bottom','top',palette.blueLine);conn(s,vu[i],vu[i-1],'top','bottom',palette.blueLine);conn(s,cs[i-1],cs[i],'bottom','top',palette.purpleLine);conn(s,us[i],us[i-1],'top','bottom',palette.greenLine);}
 }
 const bott=tensor(s,'C5 · Bottleneck',492,604,395,43);
 conn(s,cs[3],bott,'bottom','top',palette.purpleLine);conn(s,bott,us[3],'right','bottom',palette.greenLine,'elbow');
 note(4,'The double-U structure follows LViT. CNN features enter the same-scale ViT stages, and reconstructed ViT features V1–V4 return to the decoder. RACE refines only the decoder-bound CNN skips; the CNN encoder continues with the original features. FSDR is inside each up stage and replaces PLAM fusion. The labelled ViT, text and anatomy ports avoid crossing wires. Adaptive filtering is active only at up4 and up3.','整体保留 LViT 双 U 结构。同尺度 CNN 特征进入 ViT，重建 ViT 特征 V1–V4 返回解码器。RACE 仅精炼发往解码器的 CNN 跳连，编码器主路径继续使用原特征。FSDR 位于每个 up stage 内，替换 PLAM 融合。图中以同名端口连接 ViT、文本和解剖条件，自适应滤波仅作用于 up4/up3。','nets/LViT.py\nnets/eppa.py\nnets/race_fuse.py\ndocs/presentations/20260922/drawio/FSDR_RACE_architecture_concise.drawio');
}
{
 const s=base(5,'PLAM and FSDR fusion paths','C*: C with FSDR alone; C′ after RACE in the combined model · D: upsampled decoder feature');
 text(s,'PLAM',67,147,170,38,28,true);
 const c=tensor(s,'C',67,216,90,60),v=tensor(s,'V',67,302,90,60,palette.blue,palette.blueLine),a=shape(s,'+',244,255,54,54,'#F2F2F2','#9DA2A6',32,'ellipse');
 const pl=shape(s,'PLAM',393,255,180,60,palette.green,palette.greenLine,26),d=tensor(s,'D',631,327,110,58),cat=shape(s,'Concat',821,255,155,60,'#F2F2F2','#9DA2A6',24),cv=tensor(s,'3×3 ×2',1050,255,150,60);
 conn(s,c,a);conn(s,v,a);conn(s,a,pl);conn(s,pl,cat);conn(s,d,cat);conn(s,cat,cv);
 text(s,'CNN and ViT are added before pixel weighting.',393,180,800,35,25);
 line(s,67,405,1146,0);
 text(s,'FSDR',67,428,180,38,28,true,palette.greenLine);
 const c2=tensor(s,'C*',67,483,90,49),v2=tensor(s,'V',67,554,90,49,palette.blue,palette.blueLine),d2=tensor(s,'D',252,579,96,49);
 const f=shape(s,'FSDR',419,498,196,90,palette.green,palette.greenLine,30),y=tensor(s,'Y',709,484,105,53,palette.green,palette.greenLine),dp=tensor(s,'D′',709,580,105,53),ca=shape(s,'Concat',907,524,132,59,'#F2F2F2','#9DA2A6',24),co=tensor(s,'3×3 ×2',1090,524,123,59);
 const t=shape(s,'T',284,448,61,39,palette.yellow,palette.yellowLine,22);
 for(const z of[c2,v2,d2,t])conn(s,z,f);conn(s,f,y);conn(s,f,dp);conn(s,y,ca);conn(s,dp,ca);conn(s,ca,co);
 text(s,'Distinct sources remain available for refinement.',419,430,794,35,25);
 note(5,'PLAM receives the sum of CNN and reconstructed ViT features. FSDR keeps CNN, ViT, decoder and text features separate while computing corrections. It outputs a refined skip Y and decoder D prime before concatenation and two convolutions. D prime equals D at shallow stages. The matched baseline uses our common recipe, not an unchanged reproduction of the official training pipeline.','PLAM 接收 CNN 与 ViT 重建特征之和。FSDR 在计算修正时保留 CNN、ViT、解码器和文本来源，输出 Y 与 D′ 后再拼接并卷积。浅层 D′=D。匹配基线使用本研究共同配方，不等同于官方完整训练流程原样复现。','nets/LViT.py\nnets/eppa.py\ndocs/results/plam_baseline_audit_20260916/AUDIT.md');
}
{
 const s=base(6,'FSDR: semantic support guides detail','One scale shown · adaptive filtering at up4/up3 is detailed in the backup slides');
 const c=tensor(s,'C*',67,330,82,58),haar=shape(s,'Haar',196,330,107,58,'#F2F2F2','#93999D',24);
 const lo=tensor(s,'Low',356,250,95,58),hi=tensor(s,'High',356,434,95,58);
 const channel=shape(s,'Channel\ngate',512,245,140,68,palette.green,palette.greenLine,23),reg=shape(s,'Text FiLM\nRegion support',701,245,183,68,palette.green,palette.greenLine,23),sem=shape(s,'Semantic\nfusion',935,245,139,68,palette.green,palette.greenLine,23);
 const local=shape(s,'Local + dilated\nConv',512,430,181,68,palette.orange,palette.orangeLine,23),detail=shape(s,'Detail\nfusion',848,430,166,68,palette.orange,palette.orangeLine,24);
 const sum=shape(s,'+',1106,337,54,54,palette.green,palette.greenLine,32,'ellipse'),out=tensor(s,'Y',1190,337,60,54,palette.green,palette.greenLine);
 const context=shape(s,'Vlow, D′low, T',604,151,330,45,palette.blue,palette.blueLine,24);
 conn(s,c,haar);conn(s,haar,lo,'right','left',palette.blueLine,'elbow');conn(s,haar,hi,'right','left',palette.orangeLine,'elbow');
 conn(s,lo,channel);conn(s,reg,sem);
 line(s,402,250,0,-36,palette.greenLine);line(s,402,214,390,0,palette.greenLine);arrow(s,792,214,0,31,palette.greenLine);
 line(s,582,313,0,33,palette.greenLine);line(s,582,346,422,0,palette.greenLine);arrow(s,1004,346,0,-33,palette.greenLine);
 conn(s,context,channel,'bottom','top',palette.blueLine,'elbow',true);conn(s,context,reg,'bottom','top',palette.blueLine,'straight',true);
 text(s,'Vlow',973,187,95,30,21,false,palette.blueLine);arrow(s,1004,217,0,28,palette.blueLine);
 conn(s,hi,local,'right','left',palette.orangeLine);conn(s,local,detail,'right','left',palette.orangeLine);conn(s,reg,detail,'bottom','top',palette.greenLine,'elbow');text(s,'S',782,357,42,31,22,true,palette.greenLine);
 line(s,402,492,0,25,palette.orangeLine);line(s,402,517,529,0,palette.orangeLine);arrow(s,931,517,0,-19,palette.orangeLine);
 conn(s,sem,sum,'right','top',palette.greenLine,'elbow');conn(s,detail,sum,'right','bottom',palette.orangeLine,'elbow');conn(s,sum,out);
 // Explicit original-feature identity bypass, placed below the two branches.
 line(s,107,389,0,150,palette.purpleLine);line(s,107,539,1026,0,palette.purpleLine);arrow(s,1133,539,0,-148,palette.purpleLine);text(s,'Identity',358,511,150,25,20,false,palette.purpleLine);
 text(s,'Y = C* + Rsem + αd Rdetail + Radapt',67,584,950,46,31,true);
 text(s,'Rsem: channel, region and ViT residuals · Radapt and D′: adaptive branch → backup',67,635,1146,27,21,false,palette.muted);
 note(6,'This schematic isolates the semantic-detail paths. Fixed Haar decomposition separates low and high frequencies. Low-frequency CNN, ViT and refined decoder context plus text produce semantic corrections and region support S. S guides high-frequency local and dilated convolution refinement. The original CNN feature bypass is retained. The equation also includes the adaptive residual, whose bank and decoder update appear in the backup. Dashed context ports are schematic; this is not a proof that each mechanism alone causes the measured gain.','本页突出语义与细节两条路径：Haar 固定分频，低频 CNN、ViT、精炼解码器及文本产生语义修正与区域支持 S；S 引导高频局部/扩张卷积精炼。保留原始 CNN 特征恒等路径。公式中的自适应残差和 D′ 见备份。该图说明设计，不将各内部机制单独宣称为已验证的增益来源。','nets/eppa.py\ndocs/FSDR.md');
}
{
 const s=base(7,'RACE: prior, evidence and agreement','C1–C4 skips · bounded residual update · auxiliary objectives are used during training');
 text(s,'Report prior',67,145,330,38,28,true,palette.yellowLine);
 const t=tensor(s,'T',67,223,88,59,palette.yellow,palette.yellowLine),pool=shape(s,'Masked mean\nSlot MLP',211,215,167,75,palette.yellow,palette.yellowLine,24),z=shape(s,'z',430,231,56, fifty(),palette.yellow,palette.yellowLine,27,'ellipse'),b=shape(s,'B · 6 zones',536,158,165,44,'#F2F2F2','#A3A8AC',22),prior=shape(s,'Prior P',751,223,155,59,palette.orange,palette.orangeLine,26);
 conn(s,t,pool);conn(s,pool,z);conn(s,z,prior);conn(s,b,prior,'right','top',palette.yellowLine,'elbow');text(s,'σ',389,209,30,27,22);
 text(s,'Visual evidence',67,339,340,39,28,true,palette.blueLine);
 const c=tensor(s,'C',67,428,88,59),ev=shape(s,'Conv ×2 → σ\nEvidence E',211,415,190,77,palette.blue,palette.blueLine,24),zone=shape(s,'Zone pool',454,415,163, sixty(),palette.blue,palette.blueLine,24),agree=shape(s,'Agreement A',667,415,205,sixty(),palette.orange,palette.orangeLine,24),gate=shape(s,'P × E × A\nGate G',980,330,217,82,palette.orange,palette.orangeLine,27);
 conn(s,c,ev);conn(s,ev,zone);conn(s,zone,agree);conn(s,agree,gate,'right','bottom',palette.orangeLine,'elbow');conn(s,prior,gate,'right','top',palette.orangeLine,'elbow');
 text(s,'B',510,371,35,28,21);arrow(s,526,399,0,16,palette.blueLine);text(s,'z',743,371,35,28,21);arrow(s,761,399,0,16,palette.orangeLine);text(s,'q',631,426,30,25,21);text(s,'A',914,410,30,25,21);text(s,'E',850,342,30,25,21);
 conn(s,ev,gate,'top','left',palette.blueLine,'elbow');
 line(s,67,531,1146,0);
 text(s,'C′ = C + s G ⊙ R(C)',67,556,610,64,37,true);
 text(s,'R(C): DWConv → PWConv\ns = 0.15 tanh(a), initially zero',711,557,502,74,25);
 note(7,'Text features are pooled and mapped to six slot logits and probabilities z. The anatomical basis B maps those values to a spatial prior P. CNN features yield visual evidence E; anatomical zone pooling gives q, compared with z to obtain an agreement scalar A. Their product is G. A bounded, initially zero residual scale preserves the identity path. GroupNorm and GELU are omitted from the diagram for clarity and remain in the code. Count and slot auxiliary objectives belong to training; ground truth is not used in inference. Complete RACE is what the three-seed experiment measures.','文本经过池化与槽位预测得到 z，再与六区域解剖基底 B 形成空间先验 P。CNN 产生视觉证据 E，经区域池化得到 q，与 z 比较得到一致性标量 A。三者相乘为 G，以初始为零的有界残差尺度修正 C。图中为易读省略 GN/GELU，代码保留。计数及槽位辅助目标用于训练，推理无需 GT。三种子实验评价完整 RACE。','nets/race_fuse.py\nnets/LViT.py');
}
function fifty(){return 50;}
{
 const s=base(8,'Matched experimental design','Primary comparison · all 12 runs completed · single-cycle cosine');
 table(s,[['Item','Shared protocol'],['Data','QaTa-COV19 v2 · Train 5,716 / Val 1,429 / Test 2,113'],['Input / text','224 × 224 · frozen CXR-BERT · 32 tokens · no LoRA'],['Optimisation','80 epochs · batch 16 · Adam · weight decay 10⁻⁴'],['Learning rate / loss','Single-cycle cosine: 3×10⁻⁴ → 10⁻⁶ · Dice + Focal'],['Comparison','PLAM / FSDR × RACE off / on · seeds 1219, 2027, 3407'],['Selection / metric','Best Val macro IoU · Test macro IoU / Dice · probability > 0.5']],[295,851],161,396,24);
 text(s,'Hold the recipe fixed; change the architectural modules.',67,586,1146,42,28,true);
 text(s,'Test has prior research access. Split-audit limitations are retained in the backup.',67,639,1146,28,21,false,palette.muted);
 note(8,'The primary evidence uses a two-by-two architecture ablation across three seeds under one fixed protocol. Dice and Focal weights are 0.5 each, with focal gamma 2. The best checkpoint is selected only by validation macro IoU, then evaluated with a fixed strict threshold. The evaluation is retrospective, not an untouched prospective Test study.','核心证据为固定配方下两因素四配置、三种子的消融。Dice/Focal 权重均为 0.5，gamma=2。以验证集 macro IoU 选 Best，固定严格 >0.5 阈值后评估 Test。测试集曾用于研究，属于回顾性评价。');
}
{
 const s=base(9,'Test results across three seeds','Mean ± sample SD · macro metrics · percentage-point gain over matched PLAM');
 table(s,[['Configuration','Test IoU (%)','Test Dice (%)','Δ IoU (pp)'],...groups.map((g,i)=>[g,ms(i,'test_iou'),ms(i,'test_dice'),i?'+'+mean(delta(i,0)).toFixed(2):'—'])],[465,241,240,200],178,354,27,[4]);
 text(s,'76.23%',67,562,350,75,52,true,palette.greenLine);
 text(s,'Test IoU',67,637,330,28,23,false,palette.muted);
 text(s,'+0.75 pp',506,562,370,75,52,true,palette.greenLine);
 text(s,'over matched PLAM',506,637,470,28,23,false,palette.muted);
 note(9,'The combined model reaches 76.2262 plus or minus 0.0456 percent Test IoU and 84.7112 plus or minus 0.0348 percent Dice. Relative to matched PLAM the gains are 0.7487 and 0.6861 percentage points. Display rounding is two decimals, while every raw run is kept in the backup and source JSON. RACE means the complete module including auxiliary training.','组合 Test IoU 为 76.2262±0.0456%，Dice 为 84.7112±0.0348%；相对匹配 PLAM 分别提高 0.7487 和 0.6861 个百分点。主表仅显示两位小数，全部原始运行与更高精度保留在备份和 JSON。RACE 指包含辅助训练的完整模块。');
}
{
 const s=base(10,'Positive IoU gains in every paired seed','Same-seed contrasts · Test macro IoU gain in percentage points');
 const cats=['FSDR − PLAM','Complete RACE\nadded to FSDR','Combined − PLAM'];
 const ds=[delta(1,0),delta(3,1),delta(3,0)];
 const ch=s.charts.add('bar',{position:{left:67,top:162,width:1146,height:424},categories:cats,series:seeds.map((seed,i)=>({name:`Seed ${seed}`,values:ds.map(d=>Number(d[i].toFixed(6))),fill:['#527E9F','#A9C39A','#DFAB67'][i]})),hasLegend:true,legend:{position:'bottom',overlay:false,textStyle:{fontSize:22,fill:palette.ink}},barOptions:{direction:'column',grouping:'clustered',gapWidth:100},xAxis:{textStyle:{fontSize:22,fill:palette.ink},line:{fill:'#8B959A',width:1}},yAxis:{min:0,max:.9,majorUnit:.3,numberFormatCode:'0.0',textStyle:{fontSize:19,fill:palette.muted},majorGridlines:{fill:'#D6DBDE',width:.7}},dataLabels:{showValue:true,position:'outEnd',numberFormatCode:'0.00',textStyle:{fontSize:21,fill:palette.ink}},chartFill:'#FFFFFF',plotAreaFill:'#FFFFFF',chartLine:{fill:'none',width:0}});
 applyPresentationChartFont(ch,{fontFamily:'Calibri'});
 text(s,'Combined gain: +0.68 to +0.79 pp across the three seeds.',67,600,1146,38,28,true);
 text(s,'Three positive repetitions support consistency under this recipe; they do not establish universal stability.',67,644,1146,25,21,false,palette.muted);
 note(10,'Every displayed same-seed gain is positive. The combined improvement spans 0.6810 to 0.7895 percentage points. The full five-contrast table appears at the end of the backup. Three seeds support consistency in this protocol but are not evidence of universal stability or a population-level significance claim. Embedded chart values are rounded to six decimals for Excel portability, and visible labels to two; the unrounded source JSON is retained.','图中三种配对比较的全部种子增益为正，组合提升范围 0.6810–0.7895 个百分点。完整五组对比放在备份末页。三次重复支持本配方下的一致性，不宣称普遍稳定或总体统计显著。内嵌图表数值保留六位小数以兼容 Excel，标签显示两位，原始 JSON 保留完整精度。');
}
{
 const s=base(11,'External methods on the same Test images','Context comparison · 2,113 images · fixed probability > 0.5 · training recipes differ');
 const dd=ext.full_test.ddcmd.test,guide=ext.full_test.guide.test;
 table(s,[['Method','Model source','IoU (%)','Dice (%)'],['MMI-UNet','Author checkpoint','75.48','83.97'],['GuideDecoder','Retrained · seed 1219',(guide.macro_iou*100).toFixed(2),(guide.macro_dice*100).toFixed(2)],['DD-CMD','Retrained · seed 1219',(dd.macro_iou*100).toFixed(2),(dd.macro_dice*100).toFixed(2)],['FSDR + complete RACE','Three-seed mean',stats(3,'test_iou')[0].toFixed(2),stats(3,'test_dice')[0].toFixed(2)]],[330,404,206,206],179,350,26,[4]);
 text(s,'The matched module ablation is the core evidence for the contributions.',67,560,1146,63,28,true);
 text(s,'DD-CMD remains slightly higher (+0.0732 pp IoU). This comparison does not support a SOTA claim.',67,634,1146, thirty(),22,false,palette.muted);
 note(11,'External methods are evaluated on the same 2113 Test images at the same threshold. MMI uses the author checkpoint; GuideDecoder and DD-CMD are single-seed retrainings with their own recipes. Our row averages three models. DD-CMD is 0.0732 IoU percentage points higher. This is contextual evidence, while the recipe-matched ablation isolates our module changes.','外部方法采用相同 2113 张 Test 与相同阈值。MMI 使用作者权重，GuideDecoder/DD-CMD 为各自配方的单种子复训，本方法为三种子均值。DD-CMD 高 0.0732 个 IoU 百分点。此表提供背景，模块增益以同配方消融为核心证据。','evidence/external_results.json\n'+primarySource+'\ndocs/results/text_guided_baselines_20260920/FINAL_REPORT.md');
}
function thirty(){return 30;}
// Error overlays are crops of the existing, unmodified comparison figures.
function errorCrop(column,roi={x:0,y:0,w:1,h:1}){const x=24+336*column+320*roi.x,y=526+320*roi.y,w=320*roi.w,h=320*roi.h;return {left:x/2040,top:y/925,right:1-(x+w)/2040,bottom:1-(y+h)/925};}
function qualitative(n,id,leftGroup,leftLabel,liou,riou,caption,roi){
 const s=base(n,`${id}: ${caption}`,'Selected qualitative example · J0/J2: seed 3407 · J1/J3: seed 2027 · not a paired-seed ablation');
 const xpos=[67,364,661,958],labels=['Chest X-ray','Ground truth',leftLabel,'FSDR + RACE'];
 labels.forEach((v,i)=>text(s,v,xpos[i],151,246,38,25,true));
 img(s,`${id}_image.png`,xpos[0],200,245,245);img(s,`${id}_gt.png`,xpos[1],200,245,245);
 img(s,`${id}_comparison.png`,xpos[2],200,245,245,errorCrop(leftGroup+2));img(s,`${id}_comparison.png`,xpos[3],200,245,245,errorCrop(5));
 text(s,`IoU ${liou.toFixed(2)}%`,xpos[2],452,245,32,25,true);text(s,`IoU ${riou.toFixed(2)}%`,xpos[3],452,245,32,25,true);
 const colors=['#32BF6B','#FF454F','#418BFE'],legs=['TP','FP','FN'];legs.forEach((v,i)=>{shape(s,'',67+i*133,510,22,22,colors[i],colors[i],10,'rect');text(s,v,100+i*133,504,75,34,22)});
 text(s,id==='C07'?'Less missed infection in the highlighted region.':'The combined model still oversegments the boundary.',67,554,525,81,27,true);
 img(s,`${id}_comparison.png`,676,508,160,160,errorCrop(leftGroup+2,roi));img(s,`${id}_comparison.png`,1018,508,160,160,errorCrop(5,roi));
 text(s,'Same region\nDetail view',862,549,130,70,23,false,palette.muted,'Calibri','center');
 // ROI rectangles are annotation shapes, not altered model outputs.
 for(const x of [xpos[2],xpos[3]])s.shapes.add({geometry:'rect',position:{left:x+245*roi.x,top:200+245*roi.y,width:245*roi.w,height:245*roi.h},fill:'none',line:{fill:'#FFFFFF',width:1.8,style:'dashed'}});
 note(n,id==='C07'?'C07 illustrates reduced false-negative area relative to the selected PLAM checkpoint. The main row shows each image once rather than duplicating masks and errors. Zooms show the same image coordinates. These selected checkpoints use different seeds, so this slide illustrates a case and does not attribute the full per-image gain causally to one module.':'G18 is retained as a limitation: the combined model scores 78.3001 percent IoU versus 81.2922 for PLAM plus RACE, a decrease of 2.9921 percentage points. Boundary false positives remain. The selected checkpoints use different seeds; this is a qualitative limitation, not a matched causal estimate.',id==='C07'?'C07 展示相对所选 PLAM 模型漏分区域减少。主排不再重复展示二值掩膜和误差图，局部放大保持相同坐标。使用不同种子的模型，只作定性说明，不能将该图全部增益归因于单一模块。':'保留 G18 的局限：组合 IoU 为 78.3001%，低于 PLAM+RACE 的 81.2922%，下降 2.9921 个百分点，仍有边界误分。这是跨种子定性局限，不是匹配因果估计。','evidence/qualitative_selection.json\nevidence/qualitative_metrics.csv\nassets/'+id+'_comparison.png');
}
qualitative(12,'C07',0,'Matched PLAM',44.6772841926,82.15778505,'reduced missed regions',{x:.23,y:.27,w:.4,h:.4});
qualitative(13,'G18',2,'PLAM + RACE',81.2922113935,78.3000644468,'a remaining boundary error',{x:.6,y:.19,w:.4,h:.4});
{
 const s=base(14,'Conclusions','Primary evidence: four configurations × three seeds · Test macro metrics');
 text(s,'FSDR preserves source-specific information during fusion.',67,169,1125,48,30,true,palette.greenLine);
 text(s,'+0.51 pp mean IoU over matched PLAM.',67,230,1146,46,28);
 text(s,'Complete RACE adds report–image agreement to skip refinement.',67,315,1146,48,30,true,palette.orangeLine);
 text(s,'+0.24 pp when added to FSDR; routing alone needs repeated controls.',67,376,1146,46,28);
 line(s,67,465,1146,0);
 text(s,'76.23% Test IoU · 84.71% Dice',67,493,1146,73,43,true);
 text(s,'+0.75 pp IoU over matched PLAM, with a positive gain in every seed.',67,569,1146,45,28);
 text(s,'Next: independent-cohort evaluation and repeated routing-versus-auxiliary controls.',67,637,1146, thirty(),23,false,palette.muted);
 note(14,'The strongest supported claim is the matched three-seed improvement of FSDR and complete RACE on this dataset and protocol. The combined model improves mean Test IoU by 0.7487 percentage points. Remaining limits include retrospective Test access, split independence, and a single-seed routing-versus-auxiliary diagnosis. Independent-cohort evaluation and repeated mechanism controls are the next evidence needed.','最强结论是在当前数据集与配方下，三种子匹配实验支持 FSDR 与完整 RACE，组合平均 Test IoU 提高 0.7487 个百分点。限制包括测试集的既往研究使用、数据划分独立性，以及路由/辅助训练诊断仅有单种子。后续需独立队列与重复机制对照。');
}
// Preserve the existing Q&A and backup content while repairing page markers.
for(let n=15;n<=23;n++){
 const s=p.slides.items[n-1];
 for(const a of s.shapes.items){const v=a.text?.toString?.()||'';if(a.position?.top>=670&&/^\d+$/.test(v.trim()))a.text=String(n);}
 notes[n]=old[n-1].notes;
}
{
 const s=base(18,'FSDR: adaptive frequency refinement','Backup · up4 / up3 only · at up2 / up1: D′ = D and Radapt = 0');
 const context=shape(s,'Clow, Vlow, Dlow',67,168,294,61,palette.blue,palette.blueLine,26),shared=shape(s,'Context fusion',503,168,249,61,palette.blue,palette.blueLine,26);
 conn(s,context,shared);
 const low=shape(s,'Conv → Softmax\nwlow',248,307,256,73,palette.blue,palette.blueLine,26),high=shape(s,'Conv → Softmax\nwhigh',871,307,256,73,palette.orange,palette.orangeLine,26);
 conn(s,shared,low,'bottom','top',palette.blueLine,'elbow');conn(s,shared,high,'bottom','top',palette.orangeLine,'elbow');
 const d=tensor(s,'D',67,434,90,60),c=tensor(s,'C*',686,434,90,60),lpf=shape(s,'Filter bank\nLPlow(D)',248,425,256,80,palette.blue,palette.blueLine,26),hpf=shape(s,'Filter bank\nLPhigh(C*)',871,425,256,80,palette.orange,palette.orangeLine,26);
 conn(s,low,lpf,'bottom','top',palette.blueLine);conn(s,high,hpf,'bottom','top',palette.orangeLine);conn(s,d,lpf);conn(s,c,hpf);
 text(s,'D′ = D + α [LPlow(D) − D]',67,545,545,53,29,true,palette.blueLine);
 text(s,'Radapt = β [C* − LPhigh(C*)]',686,545,527,53,29,true,palette.orangeLine);
 text(s,'Each bank mixes identity, 3×3 blur and 5×5 blur with spatially varying weights.',67,626,1146,38,25);
 note(18,'The low-pass and high-pass branches learn different spatial mixing weights over the same three low-pass operators: identity, blur 3 and blur 5. The high-pass branch subtracts its learned low-pass result from the raw CNN skip. The decoder is updated by a bounded low-pass correction. Corrected D prime is Haar-split again before semantic refinement.','低通与高通分支对恒等、3×3 模糊、5×5 模糊学习不同空间混合权重。高通分支由原始 CNN 跳跃特征减去其低通结果得到；解码器采用有界低通修正。D′ 随后重新做 Haar 分解进入语义精炼。','nets/eppa.py\ndocs/FSDR.md');
}
// Preserve all five paired comparisons at full precision in one backup page.
p.slides.add();
{
 const s=base(24,'Paired-seed gains: full precision','Backup · Test macro IoU gain in percentage points · same-seed differences');
 const contrasts=[['FSDR − PLAM',1,0],['PLAM + RACE − PLAM',2,0],['Combined − FSDR',3,1],['Combined − PLAM + RACE',3,2],['Combined − PLAM',3,0]];
 table(s,[['Contrast','1219','2027','3407','Mean'],...contrasts.map(([name,a,b])=>{const d=delta(a,b);return [name,...d.map(x=>'+'+x.toFixed(4)),'+'+mean(d).toFixed(4)]})],[466,170,170,170,170],176,353,24,[5]);
 text(s,`Combined mean ± SD: IoU ${ms(3,'test_iou',4)}% · Dice ${ms(3,'test_dice',4)}%`,67,568,1146,52,26,true);
 text(s,'All 12 individual runs, negative evidence and evaluation boundaries remain in the backup.',67,634,1146,32,23,false,palette.muted);
 note(24,'These are the full-precision paired-seed comparisons behind the main chart. Each column subtracts two models with the same seed. Mean differences are computed before rounding. All five contrasts are positive in all three seeds.','这是主图对应的完整精度配对比较。每列比较同一种子的两模型，先计算差值和均值再显示舍入值。五组对比、三个种子全部为正。');
}
await fs.writeFile(path.join(WORK,'.build','inspect.ndjson'),(await p.inspect({kind:'slide,textbox,table,chart,notes',maxChars:1000000})).ndjson);
await fs.writeFile(path.join(HERE,'speaker_notes.json'),JSON.stringify(notes,null,2));
const candidatePath=path.join(WORK,'.build','candidate.pptx');
await(await PresentationFile.exportPptx(p)).save(candidatePath);
for(let i=0;i<p.slides.items.length;i++){
 const blob=await p.export({slide:p.slides.items[i],format:'png',scale:1.2});
 await fs.writeFile(path.join(WORK,'preview',`slide-${String(i+1).padStart(2,'0')}.png`),new Uint8Array(await blob.arrayBuffer()));
 console.log(`Rendered ${i+1}/${p.slides.items.length}`);
}
const finalPath=path.join(WORK,'output',OUT);
const tableOwners=[8,9,11,17,19,20,22,23,24];
const result=await finalizePresentation({workspaceDir:WORK,candidatePath,finalPath,pythonExecutable:path.join(RUNTIME,'python/python.exe'),integrityValidatorPath:path.join(SKILL,'container_tools/inspect_presentation_package_integrity.py'),layoutValidatorPath:path.join(SKILL,'container_tools/inspect_presentation_layout_geometry.py'),layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-bullet-geometry','--validate-heading-fit',...tableOwners.flatMap(x=>['--require-native-table-slide',String(x)])],requiredNativeTableOwnerSlides:tableOwners,requiredNativeChartOwnerSlides:[10],materializeLiteralChartWorkbooks:true,fontPolicy:{basis:'reference',families:['Cambria','Calibri'],referencePath:SOURCE,referenceSha256:crypto.createHash('sha256').update(await fs.readFile(SOURCE)).digest('hex')},verifyArtifactToolImport:true,receiptPath:path.join(WORK,'.build','validation.json')});
console.log(JSON.stringify({finalPath,result}));
process.exit(0);
