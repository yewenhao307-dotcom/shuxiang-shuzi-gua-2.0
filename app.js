const TRIGRAMS={1:{name:"乾",symbol:"☰",lines:[1,1,1]},2:{name:"兑",symbol:"☱",lines:[1,1,0]},3:{name:"离",symbol:"☲",lines:[1,0,1]},4:{name:"震",symbol:"☳",lines:[1,0,0]},5:{name:"巽",symbol:"☴",lines:[0,1,1]},6:{name:"坎",symbol:"☵",lines:[0,1,0]},7:{name:"艮",symbol:"☶",lines:[0,0,1]},8:{name:"坤",symbol:"☷",lines:[0,0,0]}}
const HISTORY_KEY="tiandi-yanshu-history-v2"
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)]
const el={form:$("#oracle-form"),question:$("#question"),questionCount:$("#question-count"),inputs:$$('.number-entry input'),entries:$$('.number-entry'),flowDots:$$('.entry-flow i'),entryStatus:$("#entry-status"),error:$("#number-error"),random:$("#random-button"),primary:$('.primary'),result:$("#result"),hex:$("#hexagram"),history:$("#history-grid")}
let readings=[],current=null,casting=false,readingsPromise=null
const reducedMotion=window.matchMedia('(prefers-reduced-motion:reduce)')
const wait=ms=>new Promise(r=>setTimeout(r,reducedMotion.matches?1:ms))
let motionMedia=null

async function ensureReadings(){
  if(readings.length)return true
  const bundled=window.__YIJING_READINGS__
  if(Array.isArray(bundled)&&bundled.length){readings=bundled;delete window.__YIJING_READINGS__;el.error.textContent='';return true}
  if(!readingsPromise)readingsPromise=fetch('./data/readings.json?v=20260808-1',{cache:'no-store'}).then(response=>{if(!response.ok)throw Error(`HTTP ${response.status}`);return response.json()}).then(data=>{readings=data;el.error.textContent='';return true}).catch(error=>{console.error(error);readingsPromise=null;el.error.textContent='卦象资料未能加载。请确认本地网站仍在运行，然后刷新页面重试。';return false})
  return readingsPromise
}
function calculate(numbers){const n=numbers.map(Number);return{values:n,lower:n[0]%8||8,upper:n[1]%8||8,changingLine:n[2]%6||6}}
function findReading(upper,lower){return readings.find(r=>r.upper_trigram===upper&&r.lower_trigram===lower)}
function trigramFromLines(lines){return Number(Object.keys(TRIGRAMS).find(k=>TRIGRAMS[k].lines.join('')===lines.join('')))}
function validate(numbers){let valid=true;el.entries.forEach((entry,i)=>{const bad=!/^\d{3}$/.test(numbers[i]);entry.classList.toggle('has-error',bad);valid&&=!bad});el.error.textContent=valid?'':'请完整输入三组三位数字，例如 324、321、678。';if(!valid)el.inputs.find(input=>!/^\d{3}$/.test(input.value))?.focus();return valid}

function pulse(node,className,duration=280){if(reducedMotion.matches)return;node.classList.remove(className);requestAnimationFrame(()=>node.classList.add(className));window.setTimeout(()=>node.classList.remove(className),duration)}
function updateEntryState(){
  const completed=el.inputs.filter(input=>/^\d{3}$/.test(input.value)).length
  el.primary.classList.remove('needs-input')
  el.form.style.setProperty('--entry-progress',String(completed/3))
  el.entries.forEach((entry,index)=>entry.classList.toggle('is-complete',/^\d{3}$/.test(el.inputs[index].value)))
  el.flowDots.forEach((dot,index)=>dot.classList.toggle('is-lit',index<completed))
  el.form.classList.toggle('is-ready',completed===3)
  el.primary.classList.toggle('is-ready',completed===3)
  el.entryStatus.textContent=completed===0?'三数未定':completed===3?'三数已定 · 可起卦':`已定 ${completed} 数 · 尚待 ${3-completed} 数`
}

el.inputs.forEach((input,index)=>input.addEventListener('input',()=>{
  const entry=input.closest('.number-entry'),wasComplete=entry.classList.contains('is-complete')
  input.value=input.value.replace(/\D/g,'').slice(0,3);entry.classList.remove('has-error');el.error.textContent='';updateEntryState()
  if(!wasComplete&&input.value.length===3){pulse(entry,'just-completed');if(el.inputs[index+1])el.inputs[index+1].focus();else pulse(el.primary,'ready-pulse',420)}
}))
el.question.addEventListener('input',()=>{el.questionCount.textContent=el.question.value.length;el.question.closest('.question-field').classList.toggle('has-content',Boolean(el.question.value.trim()));updateQuestionMode()})
el.random.addEventListener('click',async()=>{
  if(casting)return
  const final=el.inputs.map(()=>String(Math.floor(Math.random()*900)+100)),originalText=el.random.textContent
  el.random.classList.add('is-shuffling');el.random.textContent='数字流转…';el.entries.forEach(entry=>entry.classList.add('is-rolling'))
  for(let i=0;i<7;i++){el.inputs.forEach(input=>input.value=String(Math.floor(Math.random()*900)+100));await wait(42)}
  el.inputs.forEach((input,i)=>input.value=final[i]);el.entries.forEach(entry=>entry.classList.remove('is-rolling','has-error'));el.error.textContent='';updateEntryState();pulse(el.primary,'ready-pulse',420)
  if(window.gsap&&!reducedMotion.matches)window.gsap.fromTo(el.entries,{y:4,scale:.992},{y:0,scale:1,duration:.24,ease:'power2.out',stagger:.035,overwrite:'auto',clearProps:'transform'})
  el.random.textContent='数字已定';await wait(520);el.random.textContent=originalText;el.random.classList.remove('is-shuffling')
})
el.form.addEventListener('submit',async event=>{
  event.preventDefault();const values=el.inputs.map(i=>i.value)
  if(!validate(values)){el.primary.classList.add('needs-input');return}
  try{await cast(values)}catch(error){
    console.error('起卦失败：',error)
    casting=false;el.form.classList.remove('is-casting');el.primary.removeAttribute('aria-busy')
    el.error.textContent='起卦过程未能完成，请刷新页面后重试。'
  }
})

function renderHex(lines,changing,{animate=false}={}){el.hex.innerHTML=[...lines].reverse().map((yang,index)=>{const number=6-index;return `<div class="hex-line ${yang?'yang':''} ${number===changing?'changing':''} ${animate?'':'built'}" data-number="${number}" aria-label="第${number}爻${yang?'阳':'阴'}${number===changing?'，动爻':''}"><i></i><i></i></div>`}).join('')}
async function animateHexagram(){
  const status=$('#casting-status'),lineNames=['初爻','二爻','三爻','四爻','五爻','上爻'],lines=$$('#hexagram .hex-line').reverse()
  for(let index=0;index<lines.length;index+=1){const line=lines[index],kind=line.classList.contains('yang')?'阳爻':'阴爻';status.textContent=`${lineNames[index]} · ${kind}落定`;line.classList.add('built');await wait(230)}
  status.textContent='六爻已成 · 卦象显现';await wait(420)
}
function seasonalContext(date=new Date()){
  const stems=['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'],branches=['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥']
  const year=date.getFullYear(),fallbackYearName=stems[(year-4)%10]+branches[(year-4)%12]
  const months=[null,{name:'孟春',element:'木',note:'萌发之月，宜定方向、试新芽。'},{name:'仲春',element:'木',note:'生机渐盛，宜沟通、舒展与建立连接。'},{name:'季春',element:'土',note:'春意收束，宜整理基础、校准承诺。'},{name:'孟夏',element:'火',note:'行动升温，宜让重点清晰，避免躁进。'},{name:'仲夏',element:'火',note:'能量外显，宜聚焦主事，也要留意消耗。'},{name:'季夏',element:'土',note:'转换将近，宜收拢事务、稳住节奏。'},{name:'孟秋',element:'金',note:'由放转收，宜辨别取舍、建立边界。'},{name:'仲秋',element:'金',note:'澄明之时，宜审视成果、精简路径。'},{name:'季秋',element:'土',note:'收成将毕，宜复盘、归档与补齐缺口。'},{name:'孟冬',element:'水',note:'气机内藏，宜蓄力、调研，不急于外显。'},{name:'仲冬',element:'水',note:'静中见深，宜修复资源、等待信号。'},{name:'季冬',element:'土',note:'旧岁将转，宜结束旧循环，为新局腾挪。'}]
  const monthNumbers={'正月':1,'一月':1,'二月':2,'三月':3,'四月':4,'五月':5,'六月':6,'七月':7,'八月':8,'九月':9,'十月':10,'十一月':11,'冬月':11,'十二月':12,'腊月':12}
  try{
    const parts=new Intl.DateTimeFormat('zh-CN-u-ca-chinese',{year:'numeric',month:'long',day:'numeric'}).formatToParts(date)
    const value=type=>parts.find(part=>part.type===type)?.value
    const rawMonth=value('month')||'',monthText=rawMonth.replace(/^闰/,'')
    const monthIndex=monthNumbers[monthText]||1,day=value('day')||'',yearName=value('yearName')||fallbackYearName
    return{year,yearName,monthLabel:`农历${rawMonth}`,dateLabel:`农历${rawMonth}${day}日`,basis:'浏览器中国农历换算',...months[monthIndex]}
  }catch{
    const monthIndex=date.getMonth()+1
    return{year,yearName:fallbackYearName,monthLabel:`公历${monthIndex}月近似`,dateLabel:`公历${monthIndex}月近似`,basis:'公历月份近似映射',...months[monthIndex]}
  }
}
function concise(text,max=54){const clean=String(text||'').replace(/。\s*/g,'。');return clean.length>max?clean.slice(0,max).replace(/[，；、]$/,'')+'……':clean}
function compactFocus(text,max=28){
  const clean=String(text||'').replace(/^就.+?而言[，,:：]\s*/,'').replace(/^真正的拉扯来自/,'').replace(/^.+?第[一二三四五六1-6]+爻(?:可|宜|应当)?/,'').replace(/[“”]/g,'').trim()
  const phrase=clean.split(/[。；]/).find(part=>part.trim().length>=4)?.trim()||clean
  if(phrase.length<=max)return phrase
  const clause=phrase.split(/[，,]/).find(part=>part.trim().length>=6)?.trim()||phrase
  return concise(clause,max)
}
const QUESTION_MODES={
  decision:{label:'选择判断',heading:'条件 · 代价 · 试行',kicker:'围绕选择本身拆开来看',stageLabels:['成立条件','关键取舍','验证一步'],lens:'先把两个选项各自的成立条件写清，不把焦虑误当成答案'},
  career:{label:'事业工作',heading:'局面 · 资源 · 推进',kicker:'从职责、资源与现实反馈观照',stageLabels:['当前局面','资源阻力','推进方式'],lens:'区分职责、资源与个人期待，先处理最影响结果的一个环节'},
  relationship:{label:'关系沟通',heading:'感受 · 边界 · 对话',kicker:'把双方处境与边界放在一起看',stageLabels:['关系底色','互动张力','沟通落点'],lens:'先描述事实和自己的需要，再邀请对方回应，避免替对方下结论'},
  resources:{label:'金钱资源',heading:'基础 · 风险 · 边界',kicker:'以承受能力和退出条件为尺',stageLabels:['资源基础','主要风险','控制边界'],lens:'先核对损失上限、期限与退出条件，重要决定仍应参考专业意见'},
  study:{label:'学习成长',heading:'基础 · 卡点 · 练习',kicker:'从反馈循环而非一次成败观照',stageLabels:['已有基础','学习卡点','练习方向'],lens:'把目标缩成一次可获得反馈的练习，再按结果调整方法'},
  wellbeing:{label:'身心状态',heading:'状态 · 消耗 · 支持',kicker:'以休息、边界和现实支持为先',stageLabels:['状态线索','消耗来源','支持动作'],lens:'优先照顾睡眠、节奏和支持系统；若持续不适，请及时寻求专业帮助'},
  general:{label:'综合观照',heading:'处境 · 动点 · 路径',kicker:'从当前事实走向可验证的一步',stageLabels:['处境底色','正在变化','行动路径'],lens:'先分清事实、感受和推测，再选一件可以验证的小事'}
}
const QUESTION_MARKERS={
  decision:['是否','要不要','该不该','值不值得','能不能','可不可以','适合吗','还是','选择','决定','怎么选','如何选','哪一个','哪个更','去留','离开','辞职','换工作','继续吗'],
  relationship:['感情','关系','恋爱','婚姻','伴侣','对象','喜欢','复合','分手','相处','联系','沟通','朋友','家人','对方'],
  resources:['投资','理财','股票','基金','生意','收入','钱','资金','财务','现金流','收益','亏损','买房','借款','贷款','债务','资源'],
  career:['工作','事业','职业','项目','求职','面试','晋升','创业','合作','客户','团队','岗位','职场'],
  study:['学习','考试','考研','备考','读书','课程','技能','证书','论文','学校','专业','成长'],
  wellbeing:['健康','身体','情绪','焦虑','睡眠','压力','疲惫','内耗','康复','身心']
}
function classifyQuestion(question=''){
  const text=question.trim().toLowerCase();if(!text)return'general'
  return Object.keys(QUESTION_MARKERS).find(key=>QUESTION_MARKERS[key].some(marker=>text.includes(marker)))||'general'
}
function updateQuestionMode(){
  const category=classifyQuestion(el.question.value),mode=QUESTION_MODES[category],container=$('#question-mode')
  if(!container)return
  const changed=container.dataset.category!==category
  container.dataset.category=category;$('#question-category').textContent=mode.label;$('#question-structure').textContent=`将按“${mode.heading}”呈现`
  if(changed&&window.gsap&&!reducedMotion.matches)window.gsap.fromTo([$('#question-category'),$('#question-structure')],{autoAlpha:0,y:4},{autoAlpha:1,y:0,duration:.24,ease:'power2.out',stagger:.035,overwrite:'auto',clearProps:'opacity,visibility,transform'})
}
function stableHash(value){let hash=2166136261;for(const char of String(value)){hash^=char.codePointAt(0);hash=Math.imul(hash,16777619)}return hash>>>0}
function choose(options,seed,offset=0){return options[(stableHash(seed)+offset)%options.length]}
function modernOf(reading){return reading?.modern||{core:reading?.reflection||reading?.theme||'观察现实条件',strengths:[reading?.theme||'已有条件'],tensions:['愿望与条件仍需校准'],risks:['过早下结论'],actions:['完成一项可验证的小调整'],avoid:['忽略现实反馈'],questions:['哪一个事实最值得先确认？']}}
function lineModernOf(result){const line=result.lineReading?.modern;if(line)return line;return{situation:result.lineReading?.interpretation||'变化正在当前环节显现。',tension:'愿望与现实反馈需要重新校准。',warning:'不要把一次信号直接当成最终结论。',advice:['先完成一项低成本验证。'],signal:{label:'观察',meaning:'爻辞提供的是处境线索，而非替你作决定'},tone:'变化'}}
function makeLineGuidance(result,mode,seed){
  const number=result.calculation.changingLine,m=lineModernOf(result),isYang=Boolean(result.lines[number-1])
  const transition=isYang?'阳爻转阴，动作宜由外放转向复核与收束':'阴爻转阳，隐而未显的条件正转为可见行动'
  const advice=choose(m.advice||[],seed,17)||'先完成一项可验证的小调整。'
  const copies=[
    `${concise(m.situation,82)} ${transition}。${concise(m.tension,68)} ${mode.lens}。`,
    `${m.signal?.meaning||'爻辞提示重新观察现实条件'}。${transition}。针对${mode.label}，${mode.lens}；眼下可做的是：${advice}`,
    `${concise(m.tension,72)} ${concise(m.warning,70)} 对${mode.label}类问题，${mode.lens}；因而可以从“${advice.replace(/[。；]$/,'')}”开始。`
  ]
  return{title:`${result.lineReading.title} · ${m.tone||'动点'}`,classic:result.lineReading.classic,copy:choose(copies,seed,29),advice,signal:m.signal?.label||'观察'}
}
function makeAnalysis(result){
  const category=classifyQuestion(result.question),mode=QUESTION_MODES[category],seed=`${result.question}|${result.numbers.join('-')}|${result.reading.id}`,r=result.reading,rm=modernOf(r),changed=result.changedReading,cm=modernOf(changed),time=seasonalContext(),lineGuidance=makeLineGuidance(result,mode,seed),lineModern=lineModernOf(result)
  const subject=result.question?`“${result.question}”`:'这件事'
  const openings=[`${subject}落在${r.name}卦，首先映出的是`,`${r.name}卦没有替${subject}下结论，它先照见`, `面对${subject}，本卦把注意力带到`]
  const stageOne=[
    `${choose(openings,seed)}“${rm.core}”。已有的支点是${rm.strengths?.[0]||r.theme}，但不要忽略${rm.risks?.[0]||'现实反馈'}。`,
    `${subject}当前可从“${r.theme}”理解：${rm.core}。先确认${rm.strengths?.[0]||'哪些条件已经存在'}，再处理${rm.tensions?.[0]||'愿望与现实之间的距离'}。`,
    `本卦的底色是“${r.theme}”。对${subject}而言，可用“${rm.questions?.[0]||'什么事实最值得先确认？'}”重新检查眼前条件。`
  ]
  const changedCopy=changed?`${changed.name}卦提示一种可能的后续方向：“${cm.core}”。这不是预告结果。针对${mode.label}，${mode.lens}；${lineGuidance.advice.replace(/[。；]$/,'')}，再看现实反馈是否支持继续。`:`变化仍在本卦内部展开。${mode.lens}，完成后再决定是否扩大行动。`
  const stages=[
    {title:`${r.name}卦 · ${r.theme}`,copy:choose(stageOne,seed,7)},
    {title:lineGuidance.title,copy:lineGuidance.copy},
    {title:changed?`${changed.name}卦 · ${changed.theme}`:'回到现实验证',copy:changedCopy}
  ]
  const action=choose([lineGuidance.advice,rm.actions?.[0],mode.lens].filter(Boolean),seed,41).replace(/[。；]$/,'')
  const highlights=[compactFocus(rm.tensions?.[0]||rm.core),compactFocus(lineModern.warning||lineModern.tension||lineModern.situation),compactFocus(action)]
  const elementFocus={木:'成长与连接',火:'表达与行动',金:'取舍与规则',水:'蓄力与洞察',土:'稳定与整合'}[time.element]||'现实校准'
  const derived=`${time.monthLabel}“${time.name}”在传统月令中偏向${elementFocus}。把这层时间意象放在${r.name}卦的“${r.theme}”旁边看，当前更值得检查的是${rm.tensions?.[0]||'条件变化'}。对${mode.label}类问题，可把它作为整理节奏的提醒：${mode.lens}。`
  return{category,mode,stages,time,action,derived,lineGuidance,highlights,root:r.theme,trend:changed?.theme||'现实反馈'}
}

async function cast(numbers,{save=true,scroll=true}={}){
  if(casting)return;casting=true;el.form.classList.add('is-casting');el.primary.setAttribute('aria-busy','true');el.result.hidden=true
  if(!await ensureReadings()){casting=false;el.form.classList.remove('is-casting');el.primary.removeAttribute('aria-busy');return}
  const calculation=calculate(numbers),lower=TRIGRAMS[calculation.lower],upper=TRIGRAMS[calculation.upper],lines=[...lower.lines,...upper.lines],reading=findReading(calculation.upper,calculation.lower)
  if(!reading){el.error.textContent='没有找到对应卦象，请检查本地资料。';casting=false;el.form.classList.remove('is-casting');el.primary.removeAttribute('aria-busy');return}
  await wait(220)
  const changedLines=[...lines];changedLines[calculation.changingLine-1]=changedLines[calculation.changingLine-1]?0:1
  const changedLower=trigramFromLines(changedLines.slice(0,3)),changedUpper=trigramFromLines(changedLines.slice(3)),changedReading=findReading(changedUpper,changedLower)
  current={timestamp:Date.now(),question:el.question.value.trim(),numbers,calculation,lower,upper,lines,reading,lineReading:reading.lines[String(calculation.changingLine)],changedReading,changedLines}
  fillResult(current,{animate:true});el.result.classList.remove('is-revealed');el.result.classList.add('is-casting');el.result.hidden=false
  if(scroll){await wait(60);el.result.scrollIntoView({behavior:'smooth',block:'start'});await wait(360)}
await animateHexagram();el.result.classList.remove('is-casting');el.result.classList.add('is-revealed');animateResultReveal();el.form.classList.remove('is-casting');el.primary.removeAttribute('aria-busy');casting=false;if(save)saveHistory(current)
}
function fillResult(result,{animate=false}={}){const a=makeAnalysis(result),r=result.reading
  $('#result-index').textContent=`第 ${String(r.id).padStart(2,'0')} 卦 · ${result.lower.name}下${result.upper.name}上`;$('#result-name').textContent=r.name;$('#result-pinyin').textContent=r.pinyin.toUpperCase();$('#result-question').textContent=result.question||'未填写具体问题 · 以当下处境观照';$('#result-theme').textContent=r.theme;$('#result-reflection').textContent=r.reflection;renderHex(result.lines,result.calculation.changingLine,{animate})
  $('#analysis-heading').textContent=a.mode.heading;$('#analysis-kicker').textContent=`${a.mode.kicker} · ${a.mode.label}`
  ;['past','present','future'].forEach((key,i)=>{$(`#stage-label-${i}`).textContent=a.mode.stageLabels[i];$(`#${key}-title`).textContent=a.stages[i].title;$(`#${key}-copy`).textContent=a.stages[i].copy;$(`#focus-key-${i}`).textContent=a.highlights[i]})
  $('#present-classic').textContent=`《周易》：${a.lineGuidance.classic}`;$('#time-label').textContent=`${a.time.year} · ${a.time.yearName}流年 / ${a.time.dateLabel} · ${a.time.name}`;$('#derived-copy').textContent=a.derived;$('#season-note').textContent=`${a.time.note} 当前流月以${a.time.monthLabel}为时间锚点，不与公历月份直接等同。`;$('#path-root').textContent=a.root;$('#path-trend').textContent=a.trend;$('#path-action').textContent=a.action
  $('#structure-lower').textContent=`${result.lower.name} ${result.lower.symbol}`;$('#structure-upper').textContent=`${result.upper.name} ${result.upper.symbol}`;$('#structure-moving').textContent=`${result.lineReading.title} · ${lineModernOf(result).tone||'变化'}`;$('#changed-name').textContent=result.changedReading?`${result.changedReading.name}卦`:'本卦内变';$('#changed-theme').textContent=result.changedReading?.theme||'变化仍在当前卦象中展开';setReadingFocus(0,{animate:false})
}
function resultText(result){const a=makeAnalysis(result);return `天地衍数｜第${result.reading.id}卦 ${result.reading.name}\n${result.question?`所问：${result.question}\n`:''}问题类型：${a.mode.label}\n数字：${result.numbers.join(' · ')}\n主题：${result.reading.theme}\n\n【${a.mode.stageLabels[0]}】${a.stages[0].title}\n${a.stages[0].copy}\n\n【${a.mode.stageLabels[1]}】${a.stages[1].title}\n《周易》：${a.lineGuidance.classic}\n${a.stages[1].copy}\n\n【${a.mode.stageLabels[2]}】${a.stages[2].title}\n${a.stages[2].copy}\n\n【因时察势】${a.derived}\n行动提示：${a.action}\n\n传统文化参考，不作确定性预测。`}

function setReadingFocus(index,{animate=true}={}){
  const cards=$$('[data-reading-card]'),buttons=$$('.focus-key')
  cards.forEach((card,i)=>card.classList.toggle('is-focused',i===index))
  buttons.forEach((button,i)=>button.setAttribute('aria-pressed',String(i===index)))
  $('.three-c')?.classList.add('has-focus')
  const target=cards[index]
  if(animate&&target&&window.gsap&&!reducedMotion.matches)window.gsap.fromTo(target,{scale:.992,y:5},{scale:1,y:0,duration:.24,ease:'power3.out',clearProps:'transform'})
}
$$('.focus-key').forEach(button=>button.addEventListener('click',()=>setReadingFocus(Number(button.dataset.focus))))
$$('[data-reading-card]').forEach((card,index)=>{
  card.addEventListener('pointerenter',event=>{if(event.pointerType!=='touch')setReadingFocus(index,{animate:false})})
  card.addEventListener('focusin',()=>setReadingFocus(index,{animate:false}))
})

const shareDialog=$('#share-dialog'),shareCanvas=$('#share-canvas'),shareStatus=$('#share-status')
function roundedRect(ctx,x,y,width,height,radius){
  const r=Math.min(radius,width/2,height/2);ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+width,y,x+width,y+height,r);ctx.arcTo(x+width,y+height,x,y+height,r);ctx.arcTo(x,y+height,x,y,r);ctx.arcTo(x,y,x+width,y,r);ctx.closePath()
}
function drawWrapped(ctx,text,x,y,maxWidth,lineHeight,maxLines=2){
  const chars=[...String(text||'')],lines=[];let line=''
  for(const char of chars){const trial=line+char;if(ctx.measureText(trial).width>maxWidth&&line){lines.push(line);line=char;if(lines.length===maxLines)break}else line=trial}
  if(lines.length<maxLines&&line)lines.push(line)
  const consumed=lines.join('').length;if(consumed<chars.length&&lines.length){lines[lines.length-1]=lines[lines.length-1].replace(/[，。；、\s]+$/,'')+'…'}
  lines.forEach((value,index)=>ctx.fillText(value,x,y+index*lineHeight));return y+lines.length*lineHeight
}
function drawShareCard(result){
  const canvas=shareCanvas,ctx=canvas.getContext('2d'),a=makeAnalysis(result),r=result.reading
  ctx.clearRect(0,0,canvas.width,canvas.height)
  const background=ctx.createLinearGradient(0,0,1080,1350);background.addColorStop(0,'#f5f2ea');background.addColorStop(.56,'#ebe5d9');background.addColorStop(1,'#f7f5ef');ctx.fillStyle=background;ctx.fillRect(0,0,1080,1350)
  ctx.fillStyle='rgba(155,64,53,.07)';ctx.beginPath();ctx.arc(930,260,330,0,Math.PI*2);ctx.fill();ctx.strokeStyle='rgba(45,42,35,.08)';ctx.lineWidth=1;ctx.beginPath();ctx.arc(105,1220,260,0,Math.PI*2);ctx.stroke()
  ctx.fillStyle='#9b4035';roundedRect(ctx,72,66,52,52,13);ctx.fill();ctx.fillStyle='#fffaf2';ctx.font='700 27px "Songti SC",serif';ctx.textAlign='center';ctx.fillText('衍',98,102)
  ctx.textAlign='left';ctx.fillStyle='#24231f';ctx.font='600 27px "Songti SC",serif';ctx.fillText('天地衍数',142,91);ctx.fillStyle='#77736b';ctx.font='400 18px sans-serif';ctx.fillText('观数 · 察象 · 明势',142,119)
  ctx.fillStyle='#9b4035';ctx.font='500 19px sans-serif';ctx.fillText(`第 ${String(r.id).padStart(2,'0')} 卦`,72,205)
  ctx.fillStyle='#1d1d1a';ctx.font='600 172px "Songti SC","SimSun",serif';ctx.fillText(r.name,66,382)
  ctx.fillStyle='#9b4035';ctx.font='500 36px "Songti SC",serif';ctx.fillText(r.theme,74,447)
  ctx.fillStyle='#77736b';ctx.font='400 20px sans-serif';ctx.fillText(`${result.lower.name}下 · ${result.upper.name}上`,76,488)
  const lineX=718,lineWidth=250,lineHeight=24,lineGap=23
  ;[...result.lines].reverse().forEach((yang,index)=>{const number=6-index,y=202+index*(lineHeight+lineGap);ctx.fillStyle=number===result.calculation.changingLine?'#a94135':'#292923';if(yang){roundedRect(ctx,lineX,y,lineWidth,lineHeight,12);ctx.fill()}else{roundedRect(ctx,lineX,y,105,lineHeight,12);ctx.fill();roundedRect(ctx,lineX+145,y,105,lineHeight,12);ctx.fill()}})
  ctx.strokeStyle='rgba(44,42,36,.18)';ctx.beginPath();ctx.moveTo(72,548);ctx.lineTo(1008,548);ctx.stroke()
  ctx.fillStyle='#77736b';ctx.font='500 18px sans-serif';ctx.fillText('本卦三点',72,596)
  const labels=['处境','动点','行动'],ys=[650,820,990]
  ys.forEach((y,index)=>{ctx.fillStyle=index===1?'#9b4035':'#9a7648';roundedRect(ctx,72,y-34,78,34,17);ctx.fill();ctx.fillStyle='#fffaf3';ctx.font='500 17px sans-serif';ctx.textAlign='center';ctx.fillText(labels[index],111,y-11);ctx.textAlign='left';ctx.fillStyle='#25241f';ctx.font='500 39px "Songti SC","Microsoft YaHei",serif';drawWrapped(ctx,a.highlights[index],178,y-6,790,55,2);ctx.strokeStyle='rgba(44,42,36,.1)';ctx.beginPath();ctx.moveTo(72,y+93);ctx.lineTo(1008,y+93);ctx.stroke()})
  ctx.fillStyle='#77736b';ctx.font='400 19px sans-serif';ctx.fillText('变象',72,1192);ctx.fillStyle='#24231f';ctx.font='600 27px "Songti SC",serif';ctx.fillText(`${result.changedReading?.name||'本卦内变'} · ${result.changedReading?.theme||'回到现实验证'}`,136,1193)
  ctx.fillStyle='#8a867e';ctx.font='400 16px sans-serif';ctx.fillText('传统文化参考 · 观照而非定论',72,1286);ctx.textAlign='right';ctx.fillText('本地生成 · 数据不上传',1008,1286);ctx.textAlign='left'
}
function canvasBlob(){return new Promise((resolve,reject)=>shareCanvas.toBlob(blob=>blob?resolve(blob):reject(Error('图片生成失败')),'image/png'))}
function downloadBlob(blob,name){const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=name;link.click();setTimeout(()=>URL.revokeObjectURL(url),1200)}
function shareFileName(){return `天地衍数-${current?.reading.name||'卦象'}.png`}
function closeShareDialog(){if(!shareDialog?.open)return;shareDialog.classList.remove('is-open');setTimeout(()=>shareDialog.close(),180)}
$('#share-card-button').addEventListener('click',async()=>{if(!current)return;await document.fonts?.ready;drawShareCard(current);shareStatus.textContent='';shareDialog.showModal();requestAnimationFrame(()=>shareDialog.classList.add('is-open'))})
$('#share-close').addEventListener('click',closeShareDialog)
shareDialog.addEventListener('cancel',event=>{event.preventDefault();closeShareDialog()})
shareDialog.addEventListener('click',event=>{if(event.target===shareDialog)closeShareDialog()})
$('#share-download').addEventListener('click',async()=>{try{const blob=await canvasBlob();downloadBlob(blob,shareFileName());shareStatus.textContent='图片已保存'}catch{shareStatus.textContent='图片未能生成，请重试'}})
$('#share-native').addEventListener('click',async()=>{try{const blob=await canvasBlob(),file=new File([blob],shareFileName(),{type:'image/png'});if(navigator.share&&navigator.canShare?.({files:[file]})){await navigator.share({title:`${current.reading.name}卦 · ${current.reading.theme}`,files:[file]});shareStatus.textContent='分享面板已打开'}else{downloadBlob(blob,shareFileName());shareStatus.textContent='当前浏览器不支持直接分享，已改为保存图片'}}catch(error){if(error?.name!=='AbortError')shareStatus.textContent='分享未完成，可选择保存图片'}})

$('#copy-button').addEventListener('click',async event=>{if(!current)return;const button=event.currentTarget;try{await navigator.clipboard.writeText(resultText(current));button.textContent='已复制 ✓';button.classList.add('is-success');setTimeout(()=>{button.textContent='复制解读';button.classList.remove('is-success')},1400)}catch{button.textContent='复制失败';button.classList.add('is-failed');setTimeout(()=>{button.textContent='复制解读';button.classList.remove('is-failed')},1400)}})
$('#reset-button').addEventListener('click',async()=>{current=null;el.result.classList.add('is-leaving');await wait(180);el.result.hidden=true;el.result.classList.remove('is-leaving','is-revealed');el.form.reset();el.questionCount.textContent='0';el.question.closest('.question-field').classList.remove('has-content');updateQuestionMode();el.error.textContent='';el.entries.forEach(e=>e.classList.remove('has-error','is-complete'));updateEntryState();$('#cast').scrollIntoView({behavior:'smooth'});await wait(260);el.inputs[0].focus()})

function loadHistory(){try{return JSON.parse(localStorage.getItem(HISTORY_KEY)||'[]')}catch{return[]}}
function saveHistory(result){const compact={timestamp:result.timestamp,question:result.question,numbers:result.numbers,id:result.reading.id,name:result.reading.name,theme:result.reading.theme};const history=[compact,...loadHistory().filter(i=>i.numbers.join()!=compact.numbers.join())].slice(0,6);localStorage.setItem(HISTORY_KEY,JSON.stringify(history));renderHistory()}
function escapeHtml(v){return String(v).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;')}
function renderHistory(){const history=loadHistory();if(!history.length){el.history.innerHTML='<p class="empty">还没有卦笺，完成第一次起卦后会显示在这里。</p>';return}el.history.innerHTML=history.map(item=>`<button class="history-item" data-numbers="${item.numbers.join(',')}" data-question="${escapeHtml(item.question||'')}"><span>第 ${String(item.id).padStart(2,'0')} 卦</span><h4>${escapeHtml(item.name)}</h4><p>${escapeHtml(item.theme)}</p></button>`).join('');$$('.history-item').forEach(button=>button.addEventListener('click',async()=>{const n=button.dataset.numbers.split(',');button.classList.add('is-loading');button.setAttribute('aria-busy','true');el.inputs.forEach((input,i)=>input.value=n[i]);el.question.value=button.dataset.question||'';el.questionCount.textContent=el.question.value.length;el.question.closest('.question-field').classList.toggle('has-content',Boolean(el.question.value.trim()));updateQuestionMode();updateEntryState();$('#cast').scrollIntoView({behavior:'smooth'});await wait(450);await cast(n,{save:false});button.classList.remove('is-loading');button.removeAttribute('aria-busy')}))}

function animateResultReveal(){
  if(!window.gsap||reducedMotion.matches)return
  const targets=['.result-top>div:first-child','.hexagram-wrap','.result-summary','.three-c .section-title',...$$('.three-c article'),'.derived','.calculation','.result-actions'].map(target=>typeof target==='string'?$(target):target).filter(Boolean)
  window.gsap.fromTo(targets,{autoAlpha:0,y:14},{autoAlpha:1,y:0,duration:.42,ease:'power3.out',stagger:.045,overwrite:'auto',clearProps:'opacity,visibility,transform',onComplete:()=>window.ScrollTrigger?.refresh()})
}

function initGSAPMotion(){
  const gsap=window.gsap,ScrollTrigger=window.ScrollTrigger
  if(!gsap||!ScrollTrigger||reducedMotion.matches)return false
  gsap.registerPlugin(ScrollTrigger);document.documentElement.classList.add('gsap-ready')
  motionMedia=gsap.matchMedia()
  motionMedia.add({desktop:'(min-width:701px)',mobile:'(max-width:700px)',reduce:'(prefers-reduced-motion:reduce)'},context=>{
    if(context.conditions.reduce)return
    const intro=gsap.timeline({defaults:{ease:'power3.out'},onComplete:()=>ScrollTrigger.refresh()})
    intro.from('.topbar',{autoAlpha:0,y:-10,duration:.38})
      .from(['.intro-stage .overline','.intro-stage h1 span','.intro-stage h1 em','.intro-stage .lead','.intro-stage .trust','.intro-stage .scroll-cue'],{autoAlpha:0,y:16,duration:.52,stagger:.055},.06)

    if(context.conditions.desktop){
      const coinTimeline=gsap.timeline({
        scrollTrigger:{
          trigger:'.coin-stage',start:'top top',end:'bottom bottom',
          pin:'.coin-scene',pinSpacing:false,scrub:.9,anticipatePin:1,invalidateOnRefresh:true
        }
      })
      coinTimeline
        .fromTo('.coin-real',{autoAlpha:0,y:72,scale:.58,rotation:-13},{autoAlpha:1,y:0,scale:1,rotation:0,duration:.62,ease:'power3.out'},0)
        .fromTo('.coin-wrap p',{autoAlpha:0,y:18},{autoAlpha:1,y:0,duration:.25,ease:'power2.out'},.46)
        .fromTo('.coin-cue',{autoAlpha:0,y:10},{autoAlpha:1,y:0,duration:.2,ease:'power2.out'},.68)
        .to('.coin-real',{y:-12,scale:1.025,duration:.25,ease:'none'},.75)
    }else{
      gsap.fromTo(['.coin-real','.coin-wrap p'],{autoAlpha:0,y:32,scale:.9},{
        autoAlpha:1,y:0,scale:1,duration:.62,ease:'power3.out',stagger:.09,
        scrollTrigger:{trigger:'.coin-stage',start:'top 72%',once:true}
      })
    }

    gsap.fromTo('.cast-card',{autoAlpha:0,y:40,scale:.975},{
      autoAlpha:1,y:0,scale:1,duration:.72,ease:'power3.out',clearProps:'opacity,visibility,transform',
      scrollTrigger:{trigger:'.cast-stage',start:context.conditions.mobile?'top 76%':'top 68%',once:true}
    })
    gsap.fromTo('.cast-atmosphere',{autoAlpha:0},{
      autoAlpha:1,duration:1.1,ease:'power2.out',
      scrollTrigger:{trigger:'.cast-stage',start:'top 82%',once:true}
    })

    const revealTargets=['.method .section-title',...$$('.steps article'),'.trigrams','.history .section-title',...$$('.history-item'),'footer']
    gsap.set(revealTargets,{autoAlpha:0,y:context.conditions.mobile?10:16})
    ScrollTrigger.batch(revealTargets,{
      start:'top 88%',once:true,interval:.06,batchMax:4,
      onEnter:batch=>gsap.to(batch,{autoAlpha:1,y:0,duration:.4,ease:'power3.out',stagger:.04,overwrite:true,clearProps:'opacity,visibility,transform'})
    })
  })
  const refresh=()=>ScrollTrigger.refresh()
  window.addEventListener('load',refresh,{once:true})
  document.fonts?.ready?.then(refresh)
  window.addEventListener('pagehide',()=>{motionMedia?.revert();motionMedia=null},{once:true})
  return true
}

function initFallbackMotion(){
  document.documentElement.classList.add('motion-fallback','page-entered')
  const targets=$$('.coin-wrap,.cast-card,.cast-atmosphere')
  if(reducedMotion.matches||!('IntersectionObserver'in window)){
    targets.forEach(target=>target.classList.add('is-inview'));return
  }
  const observer=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(!entry.isIntersecting)return
      entry.target.classList.add('is-inview');observer.unobserve(entry.target)
    })
  },{rootMargin:'0px 0px -12% 0px',threshold:.12})
  targets.forEach(target=>observer.observe(target))
  window.addEventListener('pagehide',()=>observer.disconnect(),{once:true})
}

updateEntryState();updateQuestionMode();renderHistory();ensureReadings()
if(!initGSAPMotion())initFallbackMotion()
