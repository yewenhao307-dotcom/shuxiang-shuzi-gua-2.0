const TRIGRAMS={
  1:{name:'乾',symbol:'☰',lines:[1,1,1],role:'主动、原则与承担'},
  2:{name:'兑',symbol:'☱',lines:[1,1,0],role:'交流、回应与协商'},
  3:{name:'离',symbol:'☲',lines:[1,0,1],role:'辨识、表达与显明'},
  4:{name:'震',symbol:'☳',lines:[1,0,0],role:'启动、震动与迅速反应'},
  5:{name:'巽',symbol:'☴',lines:[0,1,1],role:'渗透、调整与持续影响'},
  6:{name:'坎',symbol:'☵',lines:[0,1,0],role:'风险、试探与信息缺口'},
  7:{name:'艮',symbol:'☶',lines:[0,0,1],role:'边界、停止与重新定位'},
  8:{name:'坤',symbol:'☷',lines:[0,0,0],role:'承载、配合与现实基础'}
}
const $=selector=>document.querySelector(selector)
const readings=Array.isArray(window.__YIJING_READINGS__)?window.__YIJING_READINGS__:[]
delete window.__YIJING_READINGS__

function params(){
  const query=new URLSearchParams(location.search)
  const values=['n1','n2','n3'].map((key,index)=>query.get(key)||['324','321','678'][index])
  return{values,question:query.get('q')||''}
}
function calculation(values){const n=values.map(Number);return{lower:n[0]%8||8,upper:n[1]%8||8,line:n[2]%6||6}}
function findReading(upper,lower){return readings.find(item=>item.upper_trigram===upper&&item.lower_trigram===lower)}
function trigramFromLines(lines){return Number(Object.keys(TRIGRAMS).find(key=>TRIGRAMS[key].lines.join('')===lines.join('')))}
function setText(id,value){const node=$(id);if(node)node.textContent=value||'—'}
function renderLines(node,lines,changing=0){
  if(!node)return
  node.replaceChildren(...[...lines].reverse().map((yang,index)=>{
    const row=document.createElement('i'),number=6-index
    row.className=`${yang?'yang':'yin'}${number===changing?' moving':''}`
    row.setAttribute('aria-label',`${number===changing?'动爻，':''}${yang?'阳爻':'阴爻'}`)
    return row
  }))
}
function readingText(state){
  const e=state.reading.modern.extended,l=state.line.modern.extended
  return `天地衍数｜${state.reading.name}卦深度解读\n${state.question?`所问：${state.question}\n`:''}本卦：${state.reading.name}｜动爻：${state.line.title}｜变卦：${state.changed.name}\n\n【眼下局势】${e.situation.direct}${e.situation.support}${e.situation.constraint}\n\n【关系结构】${e.relationship.inner}${e.relationship.outer}${e.relationship.interaction}\n\n【变化信号】${l.trigger.observe}${l.trigger.threshold}\n\n【机会】${e.opportunity.condition}${e.opportunity.evidence}\n【风险】${e.risk.trigger}${e.risk.effect}\n\n【条件成立】${e.paths.ready}\n【条件未成】${e.paths.not_ready}\n\n【验证行动】\n先做：${e.validation.do}\n观察：${e.validation.observe}\n继续条件：${e.validation.continue_if}\n暂停条件：${e.validation.pause_if}\n\n传统文化参考，不作确定性预测。`
}
function fill(){
  const input=params()
  if(input.values.some(value=>!/^\d{3}$/.test(value))||readings.length!==64){
    document.body.classList.add('has-error');setText('#page-title','解读资料未能载入');return
  }
  const calc=calculation(input.values),lower=TRIGRAMS[calc.lower],upper=TRIGRAMS[calc.upper]
  const lines=[...lower.lines,...upper.lines],reading=findReading(calc.upper,calc.lower),line=reading.lines[String(calc.line)]
  const changedLines=[...lines];changedLines[calc.line-1]=changedLines[calc.line-1]?0:1
  const changedLower=trigramFromLines(changedLines.slice(0,3)),changedUpper=trigramFromLines(changedLines.slice(3))
  const changed=findReading(changedUpper,changedLower),extended=reading.modern.extended,lineExtended=line.modern.extended
  const state={...input,calc,lower,upper,lines,reading,line,changed,changedLines,changedLower,changedUpper}

  setText('#question-text',input.question||'未填写具体问题 · 以当下处境观照')
  setText('#hex-name',reading.name);renderLines($('#hero-hex'),lines,calc.line)
  setText('#fact-primary',reading.name);setText('#fact-line',line.title);setText('#fact-changed',changed.name)
  setText('#situation-direct',extended.situation.direct);setText('#situation-support',extended.situation.support)
  setText('#situation-constraint',extended.situation.constraint);setText('#situation-stage',line.modern.situation)

  setText('#relation-summary',extended.relationship.interaction)
  setText('#relation-outer-title',`${upper.name} · ${upper.role}`);setText('#relation-outer',extended.relationship.outer)
  setText('#relation-inner-title',`${lower.name} · ${lower.role}`);setText('#relation-inner',extended.relationship.inner)
  setText('#relation-self',`当前能够直接调整的是：${extended.validation.do}。`);setText('#relation-boundary',extended.relationship.boundary)

  setText('#trigger-intro',`${line.title}处在“${line.modern.tone}”阶段，动点集中在这一环节。`)
  setText('#trigger-now',line.modern.situation);setText('#trigger-label',lineExtended.trigger.label)
  setText('#trigger-observe',lineExtended.trigger.observe);setText('#trigger-threshold',lineExtended.trigger.threshold)
  setText('#trigger-boundary',lineExtended.decision.pause_if)

  setText('#opportunity-condition',extended.opportunity.condition);setText('#opportunity-evidence',extended.opportunity.evidence)
  setText('#risk-trigger',extended.risk.trigger);setText('#risk-effect',extended.risk.effect)
  setText('#path-origin',`当前 · ${reading.name} · ${line.title}`);setText('#path-ready',extended.paths.ready);setText('#path-not-ready',extended.paths.not_ready)
  setText('#action-do',extended.validation.do);setText('#action-observe',extended.validation.observe)
  setText('#action-continue',extended.validation.continue_if);setText('#action-pause',extended.validation.pause_if)

  renderLines($('#lower-hex'),lower.lines);renderLines($('#upper-hex'),upper.lines)
  renderLines($('#moving-hex'),lines,calc.line);renderLines($('#changed-hex'),changedLines)
  setText('#lower-name',`${lower.name} ${lower.symbol}`);setText('#lower-role',`内部：${lower.role}`)
  setText('#upper-name',`${upper.name} ${upper.symbol}`);setText('#upper-role',`外部：${upper.role}`)
  setText('#moving-name',line.title);setText('#moving-role',`${line.modern.tone} · ${lineExtended.trigger.label}`)
  setText('#changed-name',`${changed.name}卦`);setText('#changed-role',changed.theme)
  setText('#classic-line',line.classic)
  setText('#calculation-note',`第一组 ${input.values[0]} ÷ 8 取余得${calc.lower}，定${lower.name}为下卦；第二组 ${input.values[1]} ÷ 8 取余得${calc.upper}，定${upper.name}为上卦；第三组 ${input.values[2]} ÷ 6 取余得${calc.line}，定${line.title}为动爻。`)
  const back=new URL('./index.html',location.href);back.searchParams.set('n1',input.values[0]);back.searchParams.set('n2',input.values[1]);back.searchParams.set('n3',input.values[2]);if(input.question)back.searchParams.set('q',input.question);back.hash='result';$('#back-reading').href=back

  $('#copy-deep-reading').addEventListener('click',async()=>{
    try{await navigator.clipboard.writeText(readingText(state));setText('#copy-status','已复制完整解读');setTimeout(()=>setText('#copy-status',''),1600)}
    catch{setText('#copy-status','复制未完成，请稍后重试')}
  })
}

function initSectionIndex(){
  const links=[...document.querySelectorAll('.reading-index a')],sections=[...document.querySelectorAll('.section-track')]
  if(!('IntersectionObserver'in window))return
  const observer=new IntersectionObserver(entries=>{
    const visible=entries.filter(entry=>entry.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0]
    if(!visible)return
    links.forEach(link=>link.classList.toggle('is-active',link.hash===`#${visible.target.id}`))
  },{rootMargin:'-20% 0px -60%',threshold:[0,.2,.6]})
  sections.forEach(section=>observer.observe(section))
}

fill();initSectionIndex()
