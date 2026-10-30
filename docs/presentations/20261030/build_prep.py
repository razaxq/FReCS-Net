from pathlib import Path
import json,re,html,hashlib,shutil,os
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet,ParagraphStyle
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate,Paragraph,Spacer,PageBreak,Table,TableStyle,KeepTogether
import pypdfium2 as pdfium
from pypdf import PdfReader

W=Path(os.environ.get('FRECS_PREP_WORK',str(Path(__file__).resolve().parent)))
D=json.loads((W/'content.json').read_text(encoding='utf8'))
M=json.loads((W/'source_manifest.json').read_text(encoding='utf8'))
O=W/'output'; O.mkdir(exist_ok=True)
P=O/'FReCS-Net_15min_Defence_Preparation_20261030.pdf'
pdfmetrics.registerFont(TTFont('Body','C:/Windows/Fonts/calibri.ttf'))
pdfmetrics.registerFont(TTFont('Bold','C:/Windows/Fonts/calibrib.ttf'))
pdfmetrics.registerFont(TTFont('CN','C:/Windows/Fonts/simsun.ttc',subfontIndex=0))
S={
 'title':ParagraphStyle('title',fontName='Bold',fontSize=24,leading=28,spaceAfter=12),
 'h1':ParagraphStyle('h1',fontName='Bold',fontSize=17,leading=21,spaceBefore=7,spaceAfter=9),
 'h2':ParagraphStyle('h2',fontName='Bold',fontSize=13.5,leading=17,spaceBefore=7,spaceAfter=6),
 'en':ParagraphStyle('en',fontName='Body',fontSize=11.5,leading=16,spaceAfter=9),
 'cn':ParagraphStyle('cn',fontName='CN',fontSize=10.2,leading=15.3,spaceAfter=7),
 'small':ParagraphStyle('small',fontName='Body',fontSize=9,leading=12,spaceAfter=6,textColor=colors.HexColor('#626b72')),
 'cue':ParagraphStyle('cue',fontName='Bold',fontSize=11,leading=15,spaceAfter=7,textColor=colors.HexColor('#235d73')),
 'cell':ParagraphStyle('cell',fontName='Body',fontSize=10,leading=12),
 'cellbold':ParagraphStyle('cellbold',fontName='Bold',fontSize=10,leading=12,textColor=colors.white)
}
E=lambda x:html.escape(str(x))
def p(x,k='en'):return Paragraph(E(x),S[k])
def cn(x):return p(x,'cn')
def footer(c,d):
 c.setFont('Body',9);c.setFillColor(colors.HexColor('#77818a'))
 c.drawString(43,26,'FReCS-Net | ELEC5223 | Practice material | 30 October 2026')
 c.drawRightString(A4[0]-43,26,str(d.page))
def mm(s):return f'{s//60}:{s%60:02d}'
flow=[p('FReCS Net 15 Minute Defence Preparation','title'),cn('基于 2026 年 10 月 28 日编译的最新 108 页论文，供 15 分钟主讲与 5 分钟问答准备。主讲按 13 页设计，总计 14 分 20 秒，留 40 秒给换页、停顿和临场解释。'),cn('核心论点：FSDR 有选择地精炼语义与细节，RACE 显式连接描述区域与图像证据；匹配消融显示增益，误差分析说明谁受益。'),cn('邮件明确：演讲不能照读；问答不得使用电子辅助。英文段落仅用于练习。正式演讲依靠图和关键词；问答按闭卷口头方式准备，不依赖电脑、手机或备用幻灯片。邮件未附具体评分维度，本材料不假设评分权重。')]
clock=0
rows=[[p('Slide','cellbold'),p('Speaking focus','cellbold'),p('Time window','cellbold')]]
for s in D['slides']:
 s['start']=clock;clock+=s['seconds'];s['end']=clock
 rows.append([p(str(s['n']),'cell'),p(s['title'],'cell'),p(mm(s['start'])+'–'+mm(s['end']),'cell')])
assert clock==860
T=Table(rows,colWidths=[38,340,96],hAlign='LEFT')
T.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),colors.HexColor('#263641')),('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),8),('RIGHTPADDING',(0,0),(-1,-1),8),('TOPPADDING',(0,0),(-1,-1),5),('BOTTOMPADDING',(0,0),(-1,-1),5),('LINEBELOW',(0,0),(-1,0),.6,colors.HexColor('#263641')),('ROWBACKGROUNDS',(0,1),(-1,-1),[colors.white,colors.HexColor('#f2f5f6')])]))
flow += [Spacer(1,5),T,Spacer(1,10),cn('计时检查点：3:15 开始 FSDR，6:35 进入实验设置，9:10 进入增益来源，12:10 进入外部比较与开销，13:50 开始结论。若落后，优先删去细节公式与外部比较展开，保留主结果、小病灶分析和结论。')]
words=0
for i in range(0,13,2):
 flow.append(PageBreak());flow.append(p('Speaking practice and recall cues','h1'))
 flow.append(cn('先看图和关键词尝试讲述，再用英文参考段落核对信息。无需逐字记忆。'))
 for s in D['slides'][i:i+2]:
  words+=len(re.findall(r"\b[\w]+(?:[-'][\w]+)*\b",s['script']))
  flow.append(p(f"{s['n']:02d}  {s['title']}  |  {mm(s['start'])}–{mm(s['end'])}",'h2'))
  flow.append(p(s['cues'],'cue'))
  flow.append(cn('画面建议：'+s['visual']))
  flow.append(p(s['script']))
  flow.append(cn('讲述提示：'+s['cn']))
  flow.append(p('Thesis source: '+s['source'],'small'))
  flow.append(Spacer(1,9))
 if i==12:
  flow.extend([p('Numbers to recall without notes','h2'),cn('76.23% IoU；84.71% Dice；总体 +0.75 pp；FSDR +0.51 pp；RACE 加在 FSDR 上 +0.24 pp；最小病灶四分位 +1.90 pp；3 seeds；2,113 Test images；474 Test patients。'),p('A short answer structure','h2'),cn('先直接回答，再给一条结果或设计依据，最后补充必要范围。例如：The effects are approximately additive. The interaction averages only plus 0.02 points and changes sign across seeds. I therefore describe complementary contributions, without claiming strong synergy.'),cn('问答开始后停止使用练习材料。不要假定可以打开备用页或在屏幕上查数据；若评委另有明确要求，再按其指示操作。')])
for j in range(0,20,5):
 flow.append(PageBreak());flow.append(p(f'Questions to practise without notes  {j+1}–{j+5}','h1'))
 flow.append(cn('目标：每题先用 20–30 秒回答核心；评委追问时再扩展。5 分钟可先按 4–6 个问题模拟，实际数量取决于追问。'))
 for n,q in enumerate(D['qa'][j:j+5],j+1):
  flow.append(p(f"{n:02d}  {q['q']}",'h2'));flow.append(cn(q['cn']));flow.append(p(q['answer']))
flow.append(PageBreak());flow.append(p('Rehearsal plan and source map','h1'))
for title,body in [
 ('First pass  Understand the story','不计时。只看各页图，回答：问题是什么？我改了哪里？用什么比较支持？为什么小病灶获益？读英文段落是为了确认知识，不是背诵句子。'),
 ('Second pass  Recall from cues','盖住参考段落，用每页 3–4 个关键词说一遍。记录卡住的概念，回到论文补足，再用自己的英语重讲。优先记住 FSDR 与 RACE 的输入、处理、输出。'),
 ('Third pass  Record a timed attempt','以 14:00–14:30 为练习目标，按第一页检查点计时。先完整讲完再回看录音。删去重复定义、逐格读表和实现参数；不要靠提高语速补救。'),
 ('Fourth pass  Simulate the five minute Q and A','关闭所有电子资料，随机抽取问题口头回答。先结论、再依据、再范围。答不出的细节说清楚已做和待验证的内容，不猜测结果。'),
 ('The day before  Check the presentation','PPT 应与这份 13 页结构对齐。新增误差及小病灶页、文本干预页、开销信息；统一项目名称。复核图中字、单位和颜色。必要证据置于主讲，问答不以备用幻灯片为前提。')]:
 flow.append(p(title,'h2'));flow.append(cn(body))
flow.append(p('How to update the October presentation','h2'))
flow.append(cn('保留：任务图、LViT 对照、整体结构、FSDR、RACE、匹配四配置和三种子结果。合并：重复结构页、成对消融大表、重复定性整图。新增：小病灶与误差类型、文本干预、参数与实际时延。主讲不展开：完整自适应滤波推导、所有训练运行、探索失败清单、warm-restart 表。它们属于理解准备范围。'))
flow.append(p('Verified sources','h2'))
flow.append(p('Latest thesis: FReCS-Net-thesis.pdf, compiled 28 October 2026; 108 PDF pages. Reviewed 30 October 2026.','small'))
flow.append(p('Figure 3.1 (printed p.17); Figure 3.2 (p.19); Figures 3.4–3.5 (pp.23–24); Tables 5.3–5.4 (pp.50–51); Tables 5.6–5.7 and Figure 5.3 (pp.53–54); Figure 5.8 and Table 5.10 (p.63); Tables 5.11–5.12 (p.68); Chapter 6. Page numbers here refer to printed thesis pages.','small'))
flow.append(p('Interpretation note: the seven unparsed side-swap descriptions need an unknown category or manual checking. The talk therefore uses the recognised region-preserving subset and limits the wording claim to that specific intervention.','small'))
flow.append(p('Thesis SHA-256: '+M['sha256'],'small'))
SimpleDocTemplate(str(P),pagesize=A4,rightMargin=43,leftMargin=43,topMargin=40,bottomMargin=40,title='FReCS-Net 15 Minute Defence Preparation',author='Ruoheng Wang',pageCompression=1).build(flow,onFirstPage=footer,onLaterPages=footer)
reader=PdfReader(P); pages=len(reader.pages)
render=W/'render';render.mkdir(exist_ok=True)
pdf=pdfium.PdfDocument(str(P))
for n in range(len(pdf)):
 pdf[n].render(scale=1.35).to_pil().save(render/f'page-{n+1:02d}.png')
(W/'prep_text.txt').write_text('\n'.join(f'=== PAGE {i+1} ===\n'+pg.extract_text() for i,pg in enumerate(reader.pages)),encoding='utf8')
info={'pages':pages,'speaking_words':words,'target_seconds':clock,'estimated_speaking_seconds_at_125wpm':round(words/125*60),'pause_and_pointer_budget_seconds_at_125wpm':round(clock-words/125*60),'slide_count':len(D['slides']),'questions':len(D['qa']),'thesis_sha256':M['sha256'],'output_sha256':hashlib.sha256(P.read_bytes()).hexdigest()}
(W/'verification.json').write_text(json.dumps(info,indent=2),encoding='utf8')
(W/'content.json').write_text(json.dumps(D,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print(json.dumps(info,indent=2))
