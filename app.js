const TRIGRAMS={1:{name:"乾",symbol:"☰",lines:[1,1,1]},2:{name:"兑",symbol:"☱",lines:[1,1,0]},3:{name:"离",symbol:"☲",lines:[1,0,1]},4:{name:"震",symbol:"☳",lines:[1,0,0]},5:{name:"巽",symbol:"☴",lines:[0,1,1]},6:{name:"坎",symbol:"☵",lines:[0,1,0]},7:{name:"艮",symbol:"☶",lines:[0,0,1]},8:{name:"坤",symbol:"☷",lines:[0,0,0]}}
const HISTORY_KEY="tiandi-yanshu-history-v2"
window.__TIANDI_BUILD__='20260814-context-4'
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)]
const el={form:$("#oracle-form"),question:$("#question"),questionCount:$("#question-count"),inputs:$$('.number-entry input'),entries:$$('.number-entry'),flowDots:$$('.entry-flow i'),entryStatus:$("#entry-status"),error:$("#number-error"),random:$("#random-button"),primary:$('.primary'),result:$("#result"),hex:$("#hexagram"),history:$("#history-grid")}
let readings=[],current=null,casting=false,readingsPromise=null
const reducedMotion=window.matchMedia('(prefers-reduced-motion:reduce)')
const wait=ms=>new Promise(r=>setTimeout(r,reducedMotion.matches?1:ms))
let motionMedia=null

// Offline stroke outlines + medians from hanzi-writer-data (Arphic Public License).
// Each median reveals only its matching outline, so adjacent strokes never bleed together.
const CAST_TITLE_HANZI={
  start:{
    strokes:[
      "M 398 589 Q 503 616 508 621 Q 515 628 511 637 Q 504 647 476 654 Q 448 658 402 640 L 348 622 Q 251 604 232 600 Q 196 593 223 578 Q 256 557 327 574 Q 337 577 349 578 L 398 589 Z",
      "M 389 478 Q 393 536 398 589 L 402 640 Q 402 707 423 786 Q 426 796 406 812 Q 370 831 346 835 Q 330 839 322 830 Q 315 823 323 807 Q 342 779 343 759 Q 347 693 348 622 L 349 578 Q 349 526 347 469 C 346 439 387 448 389 478 Z",
      "M 376 438 Q 442 451 521 461 Q 537 462 537 470 Q 538 482 522 491 Q 497 501 475 498 Q 429 488 389 478 L 347 469 Q 191 439 89 428 Q 77 427 74 420 Q 71 410 85 399 Q 122 372 161 384 Q 305 432 335 431 L 376 438 Z",
      "M 389 183 Q 393 249 396 304 L 398 334 Q 401 415 402 416 L 401 417 Q 388 430 376 438 C 352 456 323 459 335 431 Q 344 419 347 334 Q 347 289 347 208 C 347 178 387 153 389 183 Z",
      "M 396 304 Q 399 304 403 304 Q 464 313 510 318 Q 535 322 525 336 Q 513 351 487 355 Q 448 359 398 334 C 371 321 366 304 396 304 Z",
      "M 261 262 Q 279 290 298 314 Q 308 327 294 341 Q 255 377 228 373 Q 216 372 218 356 Q 227 247 102 120 Q 93 117 49 68 Q 42 53 56 57 Q 113 66 210 184 Q 241 235 245 237 L 261 262 Z",
      "M 245 237 Q 401 113 676 -20 Q 710 -36 772 -20 Q 928 28 940 41 Q 940 42 941 42 Q 945 54 926 53 Q 833 59 777 57 Q 624 57 424 165 Q 406 174 389 183 L 347 208 Q 304 235 261 262 C 236 278 221 255 245 237 Z",
      "M 778 492 Q 797 562 819 583 Q 841 608 819 622 Q 756 655 754 655 Q 744 655 736 650 Q 694 620 604 606 Q 592 606 595 599 Q 596 593 609 587 Q 624 580 686 592 Q 737 605 744 596 Q 751 590 743 559 Q 736 528 727 491 C 720 462 770 463 778 492 Z",
      "M 640 433 Q 647 442 794 459 Q 804 460 805 469 Q 805 476 778 492 C 763 501 756 499 727 491 Q 669 475 625 464 C 596 457 614 419 640 433 Z",
      "M 925 268 Q 910 302 898 360 Q 897 373 889 378 Q 882 382 879 364 Q 867 294 856 281 Q 832 254 730 254 Q 675 255 651 266 Q 630 276 626 291 Q 622 307 623 350 Q 627 396 637 419 Q 640 426 640 433 C 645 451 645 451 625 464 Q 585 492 573 488 Q 560 484 567 468 Q 585 437 581 388 Q 578 271 610 243 Q 634 225 684 216 Q 733 209 811 210 Q 881 211 910 227 Q 937 240 925 268 Z"
    ],
    medians:[[[224,590],[280,587],[350,600],[459,631],[501,630]],[[334,821],[380,781],[370,504],[353,477]],[[84,416],[116,407],[148,408],[288,442],[457,474],[509,478],[526,473]],[[342,431],[372,402],[369,221],[387,191]],[[400,311],[414,324],[468,335],[515,329]],[[229,361],[256,323],[200,206],[161,155],[113,106],[59,66]],[[263,252],[266,240],[312,208],[463,118],[583,61],[686,22],[756,17],[936,46]],[[602,599],[623,596],[672,604],[745,625],[773,611],[783,599],[763,527],[758,516],[733,497]],[[638,439],[648,454],[734,472],[772,474],[796,468]],[[576,476],[603,450],[608,436],[601,356],[606,291],[622,260],[650,245],[693,235],[766,232],[837,238],[884,256],[889,280],[888,371]]]
  },
  gua:{
    strokes:[
      "M 403 622 Q 527 650 530 653 Q 539 660 535 668 Q 528 680 500 687 Q 467 696 406 670 L 353 657 Q 349 657 347 656 Q 293 646 230 640 Q 194 634 219 618 Q 258 594 317 607 Q 333 611 355 613 L 403 622 Z",
      "M 396 511 Q 400 569 403 622 L 406 670 Q 406 695 422 800 Q 426 810 406 825 Q 372 843 348 847 Q 332 850 324 841 Q 317 834 325 819 Q 346 792 346 773 Q 350 718 353 657 L 355 613 Q 355 561 355 502 C 355 472 394 481 396 511 Z",
      "M 370 465 Q 457 484 567 498 Q 585 499 585 508 Q 586 521 568 531 Q 540 544 517 538 Q 448 523 396 511 L 355 502 Q 217 475 110 464 Q 97 463 93 455 Q 90 443 105 432 Q 147 404 189 416 Q 271 441 332 456 L 370 465 Z",
      "M 398 315 Q 407 318 512 335 Q 522 334 530 347 Q 531 357 509 367 Q 473 388 403 360 Q 402 360 400 359 L 347 345 Q 317 339 207 319 Q 180 315 201 299 Q 235 278 258 283 Q 297 293 347 304 L 398 315 Z",
      "M 391 192 Q 394 259 398 315 L 400 359 Q 401 374 402 388 Q 406 434 402 440 Q 386 456 370 465 C 344 481 320 483 332 456 Q 344 437 347 345 L 347 304 Q 347 255 347 182 C 347 152 390 162 391 192 Z",
      "M 347 182 Q 283 169 217 154 Q 195 148 158 152 Q 145 151 142 141 Q 138 128 148 118 Q 170 100 202 78 Q 212 74 226 82 Q 272 110 486 183 Q 517 193 540 207 Q 553 214 555 224 Q 549 230 537 228 Q 467 210 391 192 L 347 182 Z",
      "M 708 564 Q 708 694 725 758 Q 738 785 713 803 Q 695 815 665 833 Q 640 849 619 833 Q 613 829 621 812 Q 657 761 657 702 Q 672 227 637 92 Q 627 50 654 -14 Q 661 -32 669 -35 Q 676 -42 684 -33 Q 691 -29 702 -7 Q 712 20 710 52 Q 709 103 708 539 L 708 564 Z",
      "M 708 539 Q 709 538 715 534 Q 796 491 895 426 Q 916 411 931 411 Q 940 411 944 423 Q 953 439 930 477 Q 903 531 709 564 L 708 564 C 678 569 683 556 708 539 Z"
    ],
    medians:[[[222,630],[291,624],[411,646],[471,664],[524,663]],[[337,831],[383,793],[377,537],[360,510]],[[104,450],[167,441],[513,515],[573,511]],[[202,310],[250,304],[466,352],[519,348]],[[339,456],[373,425],[370,218],[353,191]],[[157,136],[212,116],[470,192],[549,221]],[[632,824],[648,816],[687,772],[686,351],[672,80],[675,-21]],[[709,558],[721,557],[728,544],[785,525],[871,483],[909,454],[930,425]]]
  }
}

function renderCastBrushTitle(){
  const svg=$('.cast-brush-mark svg')
  if(!svg)return
  const ns='http://www.w3.org/2000/svg'
  const make=name=>document.createElementNS(ns,name)
  const final=make('g')
  final.classList.add('cast-brush-final')
  ;[['起',500],['卦',1500]].forEach(([character,x])=>{
    const text=make('text')
    text.classList.add('cast-brush-type')
    text.setAttribute('x',String(x));text.setAttribute('y','760');text.setAttribute('text-anchor','middle')
    text.textContent=character;final.appendChild(text)
  })
  svg.replaceChildren(final)
  svg.setAttribute('viewBox','0 0 2000 900')
  svg.setAttribute('preserveAspectRatio','xMidYMid meet')
}

const TALISMANS=[
  {src:'./assets/talismans/bagua.webp',name:'太极 · 八卦',alt:'太极八卦符箓'},
  {src:'./assets/talismans/scholar.webp',name:'焚香 · 问学',alt:'书卷与焚香符箓'},
  {src:'./assets/talismans/stars.webp',name:'列宿 · 垂象',alt:'星宿列象符箓'},
  {src:'./assets/talismans/big-dipper.webp',name:'北斗 · 指时',alt:'北斗七星符箓'},
  {src:'./assets/talismans/thunder.webp',name:'雷霆 · 发机',alt:'雷霆符箓'},
  {src:'./assets/talismans/dragon-tiger.webp',name:'龙虎 · 相应',alt:'龙虎相应符箓'},
  {src:'./assets/talismans/guardian.webp',name:'守一 · 观照',alt:'守一观照符箓'},
  {src:'./assets/talismans/mountains.webp',name:'云山 · 入静',alt:'云山入静符箓'}
]

function initTalismanCarousel(){
  const root=$('#talisman-carousel')
  if(!root)return
  const layers=[$('.talisman-image-a'),$('.talisman-image-b')],backdrop=$('.talisman-backdrop'),canvas=$('.talisman-dither')
  const indexLabel=$('#talisman-index'),nameLabel=$('#talisman-name'),ctx=canvas?.getContext('2d',{willReadFrequently:true})
  const images=TALISMANS.map(item=>{const image=new Image();image.src=item.src;return image})
  let index=0,front=0,busy=false,timer=null,pointerStart=null

  function paintDither(image){
    if(!ctx||!image?.naturalWidth)return
    const width=180,height=360,scale=Math.max(width/image.naturalWidth,height/image.naturalHeight)
    const drawWidth=image.naturalWidth*scale,drawHeight=image.naturalHeight*scale
    ctx.clearRect(0,0,width,height);ctx.drawImage(image,(width-drawWidth)/2,(height-drawHeight)/2,drawWidth,drawHeight)
    const frame=ctx.getImageData(0,0,width,height),data=frame.data
    const matrix=[[0,8,2,10],[12,4,14,6],[3,11,1,9],[15,7,13,5]]
    for(let y=0;y<height;y++)for(let x=0;x<width;x++){
      const p=(y*width+x)*4,luma=data[p]*.299+data[p+1]*.587+data[p+2]*.114
      const threshold=(matrix[y%4][x%4]+.5)*16
      if(luma<threshold+18){data[p]=132;data[p+1]=48;data[p+2]=38;data[p+3]=226}
      else{data[p]=232;data[p+1]=204;data[p+2]=143;data[p+3]=166}
    }
    ctx.putImageData(frame,0,0)
  }

  function updateLabels(){
    indexLabel.textContent=String(index+1).padStart(2,'0');nameLabel.textContent=TALISMANS[index].name
  }
  function schedule(){clearTimeout(timer);if(!reducedMotion.matches&&!document.hidden)timer=setTimeout(()=>show(index+1,1),4800)}
  function show(rawIndex,direction=1){
    const nextIndex=(rawIndex+TALISMANS.length)%TALISMANS.length
    if(busy||nextIndex===index)return
    const targetImage=images[nextIndex]
    const run=()=>{
      busy=true
      const outgoing=layers[front],incoming=layers[1-front],item=TALISMANS[nextIndex]
      incoming.src=item.src;incoming.alt=item.alt;incoming.removeAttribute('aria-hidden')
      paintDither(targetImage);index=nextIndex;updateLabels();clearTimeout(timer)
      if(!window.gsap||reducedMotion.matches){
        outgoing.classList.remove('is-active');outgoing.alt='';outgoing.setAttribute('aria-hidden','true')
        incoming.classList.add('is-active');backdrop.src=item.src;front=1-front;busy=false;schedule();return
      }
      const gsap=window.gsap
      gsap.killTweensOf([outgoing,incoming,canvas,backdrop])
      gsap.set(incoming,{autoAlpha:0,scale:1.025,y:direction*8,filter:'blur(14px)'})
      gsap.set(canvas,{autoAlpha:.9,scale:1.015})
      const timeline=gsap.timeline({defaults:{overwrite:'auto'},onComplete:()=>{
        outgoing.classList.remove('is-active');outgoing.alt='';outgoing.setAttribute('aria-hidden','true')
        incoming.classList.add('is-active');front=1-front;busy=false
        gsap.set(outgoing,{clearProps:'opacity,visibility,transform,filter'});gsap.set(incoming,{clearProps:'opacity,visibility,transform,filter'});gsap.set(canvas,{autoAlpha:0,clearProps:'transform'})
        schedule()
      }})
      timeline
        .to(outgoing,{autoAlpha:0,scale:.99,y:-direction*5,filter:'blur(11px)',duration:.22,ease:'power2.in'},0)
        .to(incoming,{autoAlpha:1,scale:1,y:0,filter:'blur(0px)',duration:.48,ease:'power3.out'},.1)
        .to(canvas,{autoAlpha:0,scale:1,duration:.42,ease:'power2.out'},.15)
        .call(()=>{backdrop.src=item.src;gsap.fromTo(backdrop,{autoAlpha:.04},{autoAlpha:.18,duration:.32,ease:'power2.out'})},null,.17)
    }
    if(targetImage.complete&&targetImage.naturalWidth)run();else targetImage.addEventListener('load',run,{once:true})
  }

  root.querySelector('[data-carousel="prev"]')?.addEventListener('click',()=>show(index-1,-1))
  root.querySelector('[data-carousel="next"]')?.addEventListener('click',()=>show(index+1,1))
  root.addEventListener('keydown',event=>{if(event.key==='ArrowLeft'){event.preventDefault();show(index-1,-1)}if(event.key==='ArrowRight'){event.preventDefault();show(index+1,1)}})
  root.addEventListener('pointerdown',event=>{pointerStart=event.clientX},{passive:true})
  root.addEventListener('pointerup',event=>{if(pointerStart===null)return;const delta=event.clientX-pointerStart;pointerStart=null;if(Math.abs(delta)>38)show(index+(delta<0?1:-1),delta<0?1:-1)},{passive:true})
  root.addEventListener('mouseenter',()=>clearTimeout(timer));root.addEventListener('mouseleave',schedule)
  root.addEventListener('focusin',()=>clearTimeout(timer));root.addEventListener('focusout',schedule)
  document.addEventListener('visibilitychange',schedule)
  window.addEventListener('pagehide',()=>{clearTimeout(timer);window.gsap?.killTweensOf([...layers,canvas,backdrop])},{once:true})
  images[0].addEventListener('load',()=>paintDither(images[0]),{once:true});schedule()
}

function consumeBundledReadings(){
  const bundled=window.__YIJING_READINGS__
  if(!Array.isArray(bundled)||!bundled.length)return false
  readings=bundled;delete window.__YIJING_READINGS__;return true
}
function loadBundledReadings(){
  if(consumeBundledReadings())return Promise.resolve(true)
  return new Promise((resolve,reject)=>{
    const script=document.createElement('script')
    script.src='./data/readings.bundle.js?v=20260808-1';script.async=true;script.dataset.readingsFallback=''
    let settled=false
    const finish=(ok,error)=>{
      if(settled)return
      settled=true;window.clearTimeout(timeout);script.remove()
      ok?resolve(true):reject(error)
    }
    const timeout=window.setTimeout(()=>finish(false,Error('Bundled readings timed out')),15000)
    script.onload=()=>finish(consumeBundledReadings(),Error('Bundled readings are empty'))
    script.onerror=()=>finish(false,Error('Bundled readings failed to load'))
    document.head.append(script)
  })
}
async function ensureReadings(){
  if(readings.length)return true
  if(readingsPromise)return readingsPromise
  readingsPromise=(async()=>{
    if(consumeBundledReadings())return true
    if(location.protocol==='file:')return loadBundledReadings()
    try{
      const controller=new AbortController(),timeout=window.setTimeout(()=>controller.abort(),12000)
      let response
      try{response=await fetch('./data/readings.json?v=20260808-1',{cache:'no-store',signal:controller.signal})}
      finally{window.clearTimeout(timeout)}
      if(!response.ok)throw Error(`HTTP ${response.status}`)
      readings=await response.json();return true
    }catch(fetchError){return loadBundledReadings()}
  })().then(ok=>{el.error.textContent='';return ok}).catch(error=>{console.error(error);readingsPromise=null;el.error.textContent='卦象资料未能加载。请确认本地网站仍在运行，然后刷新页面重试。';el.error.focus({preventScroll:true});return false})
  return readingsPromise
}
function calculate(numbers){const n=numbers.map(Number);return{values:n,lower:n[0]%8||8,upper:n[1]%8||8,changingLine:n[2]%6||6}}
function findReading(upper,lower){return readings.find(r=>r.upper_trigram===upper&&r.lower_trigram===lower)}
function trigramFromLines(lines){return Number(Object.keys(TRIGRAMS).find(k=>TRIGRAMS[k].lines.join('')===lines.join('')))}
function validate(numbers){let valid=true;el.entries.forEach((entry,i)=>{const bad=!/^\d{3}$/.test(numbers[i]);entry.classList.toggle('has-error',bad);el.inputs[i].setAttribute('aria-invalid',String(bad));valid&&=!bad});el.error.textContent=valid?'':'请完整输入三组三位数字，例如 324、321、678。';if(!valid)el.inputs.find(input=>!/^\d{3}$/.test(input.value))?.focus();return valid}

function pulse(node,className,duration=280){if(reducedMotion.matches)return;node.classList.remove(className);requestAnimationFrame(()=>node.classList.add(className));window.setTimeout(()=>node.classList.remove(className),duration)}
function refreshScrollMotion(){
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
    const ScrollTrigger=window.ScrollTrigger
    if(!ScrollTrigger)return
    const coinTrigger=ScrollTrigger.getById('coin-scroll')
    ScrollTrigger.getAll().forEach(trigger=>{if(trigger!==coinTrigger)trigger.refresh()})
    ScrollTrigger.update()
  }))
}
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
  input.value=input.value.replace(/\D/g,'').slice(0,3);entry.classList.remove('has-error');input.removeAttribute('aria-invalid');el.error.textContent='';updateEntryState()
  if(!wasComplete&&input.value.length===3){pulse(entry,'just-completed');if(el.inputs[index+1])el.inputs[index+1].focus();else pulse(el.primary,'ready-pulse',420)}
}))
let questionSyncFrame=0
function syncQuestionInputState(){
  el.questionCount.textContent=el.question.value.length
  el.question.closest('.question-field').classList.toggle('has-content',Boolean(el.question.value.trim()))
  updateQuestionMode()
}
function scheduleQuestionInputSync(){
  syncQuestionInputState();cancelAnimationFrame(questionSyncFrame);questionSyncFrame=requestAnimationFrame(syncQuestionInputState)
}
;['input','change','compositionend'].forEach(eventName=>el.question.addEventListener(eventName,scheduleQuestionInputSync))
el.question.addEventListener('paste',()=>setTimeout(scheduleQuestionInputSync,0))
el.question.addEventListener('blur',syncQuestionInputState)
el.random.addEventListener('click',async()=>{
  if(casting)return
  const final=el.inputs.map(()=>String(Math.floor(Math.random()*900)+100)),originalText=el.random.textContent
  el.random.classList.add('is-shuffling');el.random.setAttribute('aria-busy','true');el.random.textContent='数字流转…';el.entries.forEach(entry=>entry.classList.add('is-rolling'))
  for(let i=0;i<7;i++){el.inputs.forEach(input=>input.value=String(Math.floor(Math.random()*900)+100));await wait(42)}
  el.inputs.forEach((input,i)=>{input.value=final[i];input.removeAttribute('aria-invalid')});el.entries.forEach(entry=>entry.classList.remove('is-rolling','has-error'));el.error.textContent='';updateEntryState();pulse(el.primary,'ready-pulse',420)
  if(window.gsap&&!reducedMotion.matches)window.gsap.fromTo(el.entries,{y:4,scale:.992},{y:0,scale:1,duration:.24,ease:'power2.out',stagger:.035,overwrite:'auto',clearProps:'transform'})
  el.random.textContent='数字已定';await wait(520);el.random.textContent=originalText;el.random.classList.remove('is-shuffling');el.random.removeAttribute('aria-busy')
})
el.form.addEventListener('submit',async event=>{
  event.preventDefault();const values=el.inputs.map(i=>i.value)
  if(!validate(values)){el.primary.classList.add('needs-input');return}
  try{await cast(values)}catch(error){
    console.error('起卦失败：',error)
    casting=false;el.form.classList.remove('is-casting');el.primary.removeAttribute('aria-busy')
    el.error.textContent='起卦过程未能完成，请刷新页面后重试。';el.error.focus({preventScroll:true})
  }
})

function renderHex(lines,changing,{animate=false}={}){el.hex.innerHTML=[...lines].reverse().map((yang,index)=>{const number=6-index;return `<div class="hex-line ${yang?'yang':''} ${number===changing?'changing':''} ${animate?'':'built'}" data-number="${number}" aria-label="第${number}爻${yang?'阳':'阴'}${number===changing?'，动爻':''}"><i></i><i></i></div>`}).join('')}
async function animateHexagram(){
  const status=$('#casting-status'),lineNames=['初爻','二爻','三爻','四爻','五爻','上爻'],lines=$$('#hexagram .hex-line').reverse()
  for(let index=0;index<lines.length;index+=1){const line=lines[index],kind=line.classList.contains('yang')?'阳爻':'阴爻';status.textContent=`${lineNames[index]} · ${kind}落定`;line.classList.add('built');await wait(230)}
  status.textContent='六爻已成 · 卦象显现';await wait(420)
}
function lunarDayText(value){
  const digits=['零','一','二','三','四','五','六','七','八','九'],number=Number(value)
  if(!Number.isFinite(number)||number<0)return String(value)
  if(number<10)return digits[number]
  if(number===10)return'十'
  if(number<20)return`十${digits[number-10]}`
  if(number<30)return`廿${number===20?'':digits[number-20]}`
  return`三十${number===30?'':digits[number-30]}`
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
    const monthIndex=monthNumbers[monthText]||1,day=Number(value('day'))||1,yearName=value('yearName')||fallbackYearName
    const ancientLabel=`${yearName}年${rawMonth}${lunarDayText(day)}`
    return{year,yearName,monthLabel:`农历${rawMonth}`,dateLabel:`农历${rawMonth}${lunarDayText(day)}`,ancientLabel,basis:'浏览器中国农历换算',...months[monthIndex]}
  }catch{
    const monthIndex=date.getMonth()+1
    return{year,yearName:fallbackYearName,monthLabel:`公历${monthIndex}月`,dateLabel:`公历${monthIndex}月${date.getDate()}日`,ancientLabel:`公历${year}年${monthIndex}月${date.getDate()}日`,basis:'浏览器公历记录',...months[monthIndex]}
  }
}
function normalizeChinesePunctuation(text){
  return String(text||'')
    .replace(/\s+/g,' ')
    .replace(/,/g,'，')
    .replace(/;/g,'；')
    .replace(/:/g,'：')
    .replace(/!/g,'！')
    .replace(/\?/g,'？')
    .replace(/\s*([，。！？；：、])\s*/g,'$1')
    .replace(/([。！？；])(?:[。！？；])+/g,'$1')
    .replace(/[，；：]+。/g,'。')
    .replace(/([“‘])\s+/g,'$1')
    .replace(/\s+([”’])/g,'$1')
    .trim()
}
function stripTerminalPunctuation(text){return normalizeChinesePunctuation(text).replace(/[，。！？；：]+$/,'')}
function ensureChineseSentence(text){
  const clean=normalizeChinesePunctuation(text)
  if(!clean)return''
  return/(?:[。！？；]|……)[”’]?$/.test(clean)?clean:`${clean}。`
}
function joinChineseSentences(...parts){return parts.flat().filter(Boolean).map(ensureChineseSentence).join('')}
function concise(text,max=54){const clean=normalizeChinesePunctuation(text);return clean.length>max?clean.slice(0,max).replace(/[，；、]$/,'')+'……':clean}
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
  relationship:['感情','关系','恋爱','婚姻','伴侣','对象','恋人','心上人','意中人','第三者','喜欢','复合','分手','结婚','迎娶','娶到','嫁给','白月光','出轨','背叛','忠诚','外遇','婚外情','劈腿','暧昧','相处','联系','沟通','朋友','家人','对方'],
  resources:['投资','理财','股票','基金','生意','收入','赚钱','挣钱','发财','财运','工资','薪资','利润','盈利','回报','钱','资金','财务','现金流','收益','亏损','损失','买房','借钱','借款','还钱','贷款','债务','预算','成本','资产','存款','财富','资源'],
  career:['工作','事业','职业','项目','求职','面试','晋升','升职','辞职','离职','跳槽','创业','合作','客户','团队','岗位','职场'],
  study:['学习','考试','考研','备考','读书','课程','技能','证书','论文','学校','专业','成长'],
  wellbeing:['健康','身体','情绪','焦虑','睡眠','压力','疲惫','内耗','康复','身心']
}
const QUESTION_CONTEXT_SIGNALS={
  resources:[
    {pattern:/(?:赚|挣|发财|财运|中奖|收入|工资|薪资|年薪|月薪|加薪|利润|盈利|回报|收益|亏损|亏钱|损失|赔钱|财富|资产|存款|现金流|投资|理财|股票|基金|借钱|借款|还钱|欠钱|欠款|贷款|债务|还款|预算|成本|价格|融资|分红)/,weight:5},
    {pattern:/(?:\d+(?:\.\d+)?|[一二三四五六七八九十百千万亿]+)(?:元|块|万|百万|千万|亿)|多少钱|金钱|资金/,weight:6},
    {pattern:/(?:买房|买车|生意|开店|财务|财产|资源)/,weight:4}
  ],
  relationship:[
    {pattern:/(?:复合|分手|结婚|迎娶|娶到|嫁给|白月光|心上人|意中人|第三者|离婚|相处|吵架|争吵|冷战|表白|出轨|背叛|忠诚|外遇|婚外情|劈腿|暧昧|感情|婚姻|关系|爱不爱|还爱|沟通|联系)/,weight:5},
    {pattern:/(?:女朋友|男朋友|伴侣|对象|爱人|家人|朋友|对方)/,weight:1}
  ],
  career:[
    {pattern:/(?:升职|晋升|跳槽|辞职|离职|入职|求职|面试|职业|岗位|职场|工作|事业|项目|创业|客户|团队)/,weight:5},
    {pattern:/(?:加薪|绩效|奖金)/,weight:6}
  ],
  study:[{pattern:/(?:考试|考研|备考|录取|论文|课程|学习|学校|专业|证书|成绩|分数)/,weight:5}],
  wellbeing:[{pattern:/(?:健康|身体|情绪|焦虑|睡眠|压力|疲惫|内耗|康复|疼痛|症状|身心)/,weight:5}]
}
const QUESTION_TERMINAL_INTENTS=[
  {key:'relationship',pattern:/(?:出轨|背叛|有外遇|外遇|劈腿|暧昧|分手|复合|离婚|结婚|表白|原谅|吵架|争吵|冷战|相处|联系|沟通)(?:吗|呢|怎么办|该怎么办|如何|怎么处理|会怎样)?[？?。！!]*$/},
  {key:'resources',pattern:/(?:赚钱|挣钱|发财|赚到|挣到|拿到|得到|损失|亏掉|赔掉|借到|还清|回本|盈利|亏损|投资|理财|买房|买车|多少钱)[^？?。！!]{0,12}(?:吗|呢|怎么办|该怎么办|如何|会怎样)?[？?。！!]*$/},
  {key:'career',pattern:/(?:升职|晋升|跳槽|辞职|离职|换工作|入职|找到工作|创业|加薪)(?:吗|呢|怎么办|该怎么办|如何|会怎样)?[？?。！!]*$/},
  {key:'study',pattern:/(?:考上|录取|通过考试|毕业|选专业|报考)(?:吗|呢|怎么办|该怎么办|如何|会怎样)?[？?。！!]*$/},
  {key:'wellbeing',pattern:/(?:失眠|焦虑|疲惫|内耗|康复|好起来|缓解)(?:吗|呢|怎么办|该怎么办|如何|会怎样)?[？?。！!]*$/}
]
const QUESTION_STRONG_CORE_INTENTS=[
  {key:'relationship',pattern:/(?:不再?|不会?|没有)?(?:出轨|背叛|外遇|婚外情|劈腿)|(?:忠诚|变心|第三者)/}
]
const QUESTION_INTENT_EXAMPLES={
  relationship:['我和喜欢的人能在一起吗','这段感情会有结果吗','伴侣会不会背叛我','我们是否适合结婚','怎样修复两个人的关系','对方还在意我吗'],
  resources:['这笔投资能不能回本','我什么时候能赚到钱','现在适合买房吗','这笔借款能收回来吗','收入能否覆盖支出','应该怎样控制损失'],
  career:['这份工作还要继续吗','我能不能升职加薪','现在适合跳槽吗','这个项目能推进吗','面试会有结果吗','创业的时机成熟吗'],
  study:['这次考试能通过吗','应该选择哪个专业','学习方法需要怎么调整','论文能顺利完成吗','现在适合报考吗','怎样突破学习瓶颈'],
  wellbeing:['最近压力很大怎么办','睡眠状态什么时候改善','怎样减少情绪内耗','我需要休息一段时间吗','如何恢复生活节奏','现在的身心状态需要注意什么'],
  decision:['两个选择应该选哪个','这件事要不要继续','现在做决定合适吗','应该留下还是离开','哪条路更适合我','是否值得尝试']
}
function charNgrams(value='',size=2){
  const chars=Array.from(String(value).replace(/[“”"'？?。！!，,；;：:\s]/g,''))
  if(chars.length<size)return new Set(chars)
  return new Set(chars.slice(0,chars.length-size+1).map((_,index)=>chars.slice(index,index+size).join('')))
}
function diceSimilarity(left,right){
  const a=charNgrams(left),b=charNgrams(right);if(!a.size||!b.size)return 0
  let overlap=0;a.forEach(token=>{if(b.has(token))overlap+=1})
  return(2*overlap)/(a.size+b.size)
}
function semanticExampleScore(text,key){return Math.max(0,...(QUESTION_INTENT_EXAMPLES[key]||[]).map(example=>diceSimilarity(text,example)))}
function extractQuestionIntentText(question=''){
  const text=String(question).trim().toLowerCase().replace(/\s+/g,'')
  if(!text)return''
  const conditionStart='(?:如果|假如|倘若|若是|等到|待到|当|在|因为|由于|只要|即使|哪怕)'
  const trailingCondition=text.match(new RegExp(`^(.+?(?:吗|呢|怎么办|该怎么办|如何|怎么处理))[，,；;]?${conditionStart}(?:.+)$`))
  if(trailingCondition?.[1])return trailingCondition[1]
  const leadingCondition=text.match(new RegExp(`^${conditionStart}[^，,；;]+[，,；;](.+)$`))
  if(leadingCondition?.[1])return leadingCondition[1]
  const leadingTimedCondition=text.match(/^(?:如果|假如|倘若|若是|等到|待到).+?(?:以后|之后|的时候|之时)[，,；;]?(.+)$/)
  if(leadingTimedCondition?.[1])return leadingTimedCondition[1]
  const questionEnd=text.search(/[？?]/)
  if(questionEnd>=0){
    const tail=text.slice(questionEnd+1).replace(/^[，,；;：:。！!]+/,'')
    if(new RegExp(`^${conditionStart}`).test(tail))return text.slice(0,questionEnd)
  }
  return text
}
function classifyQuestionDetails(question=''){
  const text=extractQuestionIntentText(question);if(!text)return'general'
  const strongCoreIntent=QUESTION_STRONG_CORE_INTENTS.find(signal=>signal.pattern.test(text))
  if(strongCoreIntent)return{category:strongCoreIntent.key,focusText:text,confidence:.98,reason:'strong-core-intent',scores:[]}
  const terminalIntent=QUESTION_TERMINAL_INTENTS.find(signal=>signal.pattern.test(text))
  if(terminalIntent)return{category:terminalIntent.key,focusText:text,confidence:.99,reason:'terminal-intent',scores:[]}
  const domains=['relationship','resources','career','study','wellbeing','decision'],scores=domains.map((key,index)=>{
    const markerScore=(QUESTION_MARKERS[key]||[]).reduce((sum,marker)=>sum+(text.includes(marker)?Math.max(1,marker.length-1):0),0)
    const contextScore=(QUESTION_CONTEXT_SIGNALS[key]||[]).reduce((sum,signal)=>sum+(signal.pattern.test(text)?signal.weight:0),0)
    const similarity=semanticExampleScore(text,key),exampleScore=similarity>=.42?similarity*4:0
    return{key,index,score:markerScore+contextScore+exampleScore,markerScore,contextScore,similarity}
  }).filter(item=>item.score>0).sort((a,b)=>b.score-a.score||a.index-b.index)
  const first=scores[0],second=scores[1],category=first?.key||'general',margin=first?first.score-(second?.score||0):0
  const confidence=first?Math.min(.96,.52+Math.min(first.score,10)*.025+Math.min(margin,6)*.035):.35
  return{category,focusText:text,confidence,reason:first?.similarity>=.42?'hybrid-examples':'weighted-context',scores}
}
function classifyQuestion(question=''){const result=classifyQuestionDetails(question);return typeof result==='string'?result:result.category}
const QUESTION_ACTIONS=['离开','辞职','离职','换工作','留下','继续','推进','暂停','放弃','复合','分手','迎娶','娶到','嫁给','出轨','联系','沟通','投资','购买','借款','报考','转行','合作','创业','搬家','结婚']
const QUESTION_TIME_MARKERS=['现在','目前','此刻','近期','最近','今年','明年','三个月内','半年内','尽快','马上','何时','什么时候']
function cleanQuestionPart(value=''){return String(value).replace(/[“”"'？?。！!，,；;：:]/g,'').replace(/^(我|我们|自己|此刻|现在|目前)/,'').replace(/(?:吗|呢)$/,'').trim()}
function extractQuestionProfile(question='',category=classifyQuestion(question)){
  const raw=String(question||'').trim(),intentText=extractQuestionIntentText(raw),plain=cleanQuestionPart(intentText),time=QUESTION_TIME_MARKERS.find(marker=>raw.includes(marker))||''
  const choice=intentText.match(/(.{1,14}?)(?:还是|或是|或者)(.{1,14}?)(?:[？?。]|$)/)
  const action=QUESTION_ACTIONS.find(word=>intentText.includes(word))||''
  let object='这件事'
  const objectPatterns=[/离开(?:现在的|目前的)?([^？?，,。！!]{2,14})/,/换(?:一份|个)?([^？?，,。！!]{2,14})/,/(?:推进|继续|暂停|放弃)([^？?，,。！!]{2,16})/,/(?:与|和)([^？?，,。！!]{2,10})(?:沟通|合作|联系|复合|分手)/,/(?:投资|购买|报考)([^？?，,。！!]{2,16})/]
  for(const pattern of objectPatterns){const match=intentText.match(pattern);if(match?.[1]){object=cleanQuestionPart(match[1]);break}}
  if(object==='这件事'&&category==='career')object='当前工作处境'
  if(object==='这件事'&&category==='relationship')object='这段关系'
  const form=choice?'choice':/(是否|要不要|该不该|能不能|可不可以|适合.{0,12}吗|吗[？?。！!]*$)/.test(raw)?'yes_no':/(何时|什么时候)/.test(raw)?'timing':/(如何|怎么|怎样)/.test(raw)?'how':/(会不会|能否成功|结果|未来)/.test(raw)?'outcome':'open'
  const alternatives=choice?[cleanQuestionPart(choice[1]),cleanQuestionPart(choice[2])]:form==='yes_no'&&action?[action,action==='离开'||action==='辞职'?'暂时留下':action==='继续'?'暂停':'不'+action]:[]
  const focus=action?`${time||'眼下'}${action}${object==='这件事'?'':object}`:plain||'当前处境'
  const concerns={decision:'选择的成立条件、代价与退出余地',career:'职责、资源、长期消耗与替代路径',relationship:'事实互动、双方边界与一次可完成的沟通',resources:'承受上限、期限、现金流与退出条件',study:'能力阶段、方法反馈与可持续练习',wellbeing:'持续时间、消耗来源、支持系统与求助条件',general:'事实、推测、代价与可验证反馈'}
  const evidencePrompts={decision:'哪项事实会真正改变你的选择，而不只是强化原有倾向？',career:'问题是一次波动，还是已经持续影响职责、成长或身心状态？',relationship:'哪些是已经发生的互动，哪些仍是你对对方想法的推测？',resources:'最坏情况下的损失、期限与退出方式是否已经写清？',study:'用什么具体结果判断方法有效，而不是只凭投入时长？',wellbeing:'这种状态持续多久、影响哪些日常功能，是否需要现实支持？',general:'哪一项新事实出现后，你会愿意调整当前判断？'}
  return{raw,category,form,time,action,object,focus,alternatives,concern:concerns[category],evidencePrompt:evidencePrompts[category]}
}
function questionSpecificActions(profile,rm,line){
  const action=stripTerminalPunctuation(rm.actions?.[0]||'完成一次低成本核对')
  if(profile.category==='career')return[`写下促使你考虑${profile.action||'改变'}的三项事实，并标记哪些已持续出现`,`核对${profile.action==='离开'||profile.action==='辞职'?'收入缓冲、下一步去向和交接成本':'职责、资源和可争取的支持'}`,`${action}，再设一个复核日期决定是否扩大动作`]
  if(profile.category==='relationship')return['各写一栏：已经发生的互动，以及你对对方的推测','用一句事实、一个感受和一个具体请求完成一次对话',`${action}，观察对方是否给出可核对的回应`]
  if(profile.category==='resources')return['写清可承受损失上限、占用期限和退出条件',`先用不影响基本安排的小额度验证“${action}”`,'只有证据与退出条件同时成立时再考虑扩大']
  if(profile.category==='study')return['把目标缩成一次能在一周内得到反馈的练习',`完成“${action}”，记录错误类型而不只记录分数`,'用连续两次反馈决定保留或调整方法']
  if(profile.category==='wellbeing')return['记录状态持续时间、触发情境和对睡眠或日常功能的影响','先减少一项可避免的消耗，并联系一个现实支持者','若持续不适或影响生活，及时寻求合格专业人员帮助']
  return[`列出关于“${profile.focus}”的已知事实、假设和未知项`,`${action}，只验证一个最关键的未知项`,'预先写下继续与暂停各需要出现什么证据']
}
const QUESTION_CARD_TITLES={
  decision:['真正要选的','选项与代价','变化信号','成立条件','误判风险','选择路径','验证一步'],
  career:['当前工作位置','职责与环境','变化信号','可争取空间','离开代价','去留路径','验证行动'],
  relationship:['关系现状','互动与边界','回应信号','沟通机会','关系风险','相处路径','一次对话'],
  resources:['资源基础','投入结构','变化信号','成立条件','损失风险','进退路径','小额验证'],
  study:['当前阶段','方法与反馈','进展信号','突破机会','学习风险','练习路径','验证练习'],
  wellbeing:['当前状态','消耗与支持','变化信号','恢复条件','需要留意','节奏路径','支持行动'],
  general:['眼下局势','关系结构','变化信号','机会','风险','发展路径','验证行动']
}
function directQuestionResponse(profile,result,rm,line,actions){
  const choice=profile.alternatives.length===2?`“${profile.alternatives[0]}”和“${profile.alternatives[1]}”之间`:`“${profile.focus}”`
  const core=compactFocus(rm.core,29),stage=compactFocus(lineModernOf(result).situation,28)
  const openings={choice:`${choice}真正要比较的是${profile.concern}。`,yes_no:`${choice}不宜立刻二选一，先核对${profile.concern}。`,timing:`${choice}暂不宜只用日期回答，先确认时机成立的信号。`,how:`要处理${choice}，落点在${profile.concern}。`,outcome:`${choice}的结果不能由卦象预定，目前能检查的是${profile.concern}。`,open:`你问到的${choice}，眼下最值得留意的是${profile.concern}。`}
  const opening=openings[profile.form]||openings.open
  return`${opening}${result.reading.name}提醒“${core}”；动点显示“${stage}”。先${actions[0]}，再决定是否扩大动作。`
}
function updateQuestionMode(){
  const classification=classifyQuestionDetails(el.question.value),category=typeof classification==='string'?classification:classification.category,mode=QUESTION_MODES[category],container=$('#question-mode')
  if(!container)return
  const changed=container.dataset.category!==category
  container.dataset.category=category;container.dataset.intentConfidence=typeof classification==='string'?'':classification.confidence.toFixed(2);container.dataset.intentReason=typeof classification==='string'?'':classification.reason;$('#question-category').textContent=mode.label;$('#question-structure').textContent=`将按“${mode.heading}”呈现`
  if(changed&&window.gsap&&!reducedMotion.matches)window.gsap.fromTo([$('#question-category'),$('#question-structure')],{autoAlpha:0,y:4},{autoAlpha:1,y:0,duration:.24,ease:'power2.out',stagger:.035,overwrite:'auto',clearProps:'opacity,visibility,transform'})
}
function stableHash(value){let hash=2166136261;for(const char of String(value)){hash^=char.codePointAt(0);hash=Math.imul(hash,16777619)}return hash>>>0}
function choose(options,seed,offset=0){return options[(stableHash(seed)+offset)%options.length]}
function modernOf(reading){return reading?.modern||{core:reading?.reflection||reading?.theme||'观察现实条件',strengths:[reading?.theme||'已有条件'],tensions:['愿望与条件仍需校准'],risks:['过早下结论'],actions:['完成一项可验证的小调整'],avoid:['忽略现实反馈'],questions:['哪一个事实最值得先确认？']}}
function lineModernOf(result){const line=result.lineReading?.modern;if(line)return line;return{situation:result.lineReading?.interpretation||'变化正在当前环节显现。',tension:'愿望与现实反馈需要重新校准。',warning:'不要把一次信号直接当成最终结论。',advice:['先完成一项低成本验证。'],signal:{label:'观察',meaning:'爻辞提供的是处境线索，而非替你作决定'},tone:'变化'}}
function makeLineGuidance(result,mode,seed){
  const number=result.calculation.changingLine,m=lineModernOf(result),isYang=Boolean(result.lines[number-1])
  const transition=isYang?'阳爻转阴，动作宜由外放转向复核与收束':'阴爻转阳，隐而未显的条件正转为可见行动'
  const advice=ensureChineseSentence(choose(m.advice||[],seed,17)||'先完成一项可验证的小调整。')
  const copies=[
    `${concise(m.situation,82)} ${transition}。${concise(m.tension,68)} ${mode.lens}。`,
    `${stripTerminalPunctuation(m.signal?.meaning||'爻辞提示重新观察现实条件')}。${transition}。针对${mode.label}，${mode.lens}；眼下可做的是：${advice}`,
    `${ensureChineseSentence(concise(m.tension,72))}${ensureChineseSentence(concise(m.warning,70))}对${mode.label}类问题，${mode.lens}；因而可以从“${stripTerminalPunctuation(advice)}”开始。`
  ]
  return{title:`${result.lineReading.title} · ${m.tone||'动点'}`,classic:result.lineReading.classic,copy:ensureChineseSentence(choose(copies,seed,29)),advice,signal:m.signal?.label||'观察'}
}
function makeAnalysis(result){
  const category=classifyQuestion(result.question),profile=extractQuestionProfile(result.question,category),mode=QUESTION_MODES[category],seed=`${result.question}|${result.numbers.join('-')}|${result.reading.id}`,r=result.reading,rm=modernOf(r),changed=result.changedReading,cm=modernOf(changed),time=seasonalContext(),lineGuidance=makeLineGuidance(result,mode,seed),lineModern=lineModernOf(result),specificActions=questionSpecificActions(profile,rm,lineModern)
  const opening=directQuestionResponse(profile,result,rm,lineModern,specificActions)
  const subject=result.question?`“${result.question}”`:'这件事'
  const openings=[`${subject}落在${r.name}卦，首先映出的是`,`${r.name}卦没有替${subject}下结论，它先照见`, `面对${subject}，本卦把注意力带到`]
  const stageOne=[
    `${choose(openings,seed)}“${rm.core}”。已有的支点是${rm.strengths?.[0]||r.theme}，但不要忽略${rm.risks?.[0]||'现实反馈'}。`,
    `${subject}当前可从“${r.theme}”理解：${rm.core}。先确认${rm.strengths?.[0]||'哪些条件已经存在'}，再处理${rm.tensions?.[0]||'愿望与现实之间的距离'}。`,
    `本卦的底色是“${r.theme}”。对${subject}而言，可用“${rm.questions?.[0]||'什么事实最值得先确认？'}”重新检查眼前条件。`
  ]
  const changedCopy=changed?`${changed.name}卦提示一种可能的后续方向：“${stripTerminalPunctuation(cm.core)}”。这不是预告结果。针对${mode.label}，${mode.lens}；${stripTerminalPunctuation(lineGuidance.advice)}，再看现实反馈是否支持继续。`:`变化仍在本卦内部展开。${mode.lens}，完成后再决定是否扩大行动。`
  const stages=[
    {title:`${r.name}卦 · ${r.theme}`,copy:choose(stageOne,seed,7)},
    {title:lineGuidance.title,copy:lineGuidance.copy},
    {title:changed?`${changed.name}卦 · ${changed.theme}`:'回到现实验证',copy:changedCopy}
  ]
  const action=stripTerminalPunctuation(choose(specificActions,seed,41))
  const highlights=[compactFocus(rm.tensions?.[0]||rm.core),compactFocus(lineModern.warning||lineModern.tension||lineModern.situation),compactFocus(action)]
  const tension=compactFocus(rm.tensions?.[0]||rm.core,26)
  const derived=ensureChineseSentence(`眼下先看清${tension}。可以从“${compactFocus(action,32)}”开始，再用这个问题复核：${profile.evidencePrompt}`)
  stages.forEach(stage=>{stage.copy=ensureChineseSentence(stage.copy)})
  return{category,profile,mode,opening:ensureChineseSentence(opening),specificActions,stages,time,action,derived,lineGuidance,highlights,root:r.theme,trend:changed?.theme||'现实反馈'}
}

function makeDeepCards(result){
  const r=result.reading,rm=modernOf(r),line=lineModernOf(result),changed=result.changedReading,cm=modernOf(changed),analysis=makeAnalysis(result),profile=analysis.profile,specificActions=analysis.specificActions
  const e=rm.extended||{},le=line.extended||{},s=e.situation||{},relation=e.relationship||{},opportunity=e.opportunity||{},risk=e.risk||{},paths=e.paths||{},validation=e.validation||{}
  const titles=QUESTION_CARD_TITLES[profile.category]||QUESTION_CARD_TITLES.general
  const lowerRole={1:'主动、原则与承担',2:'交流、回应与协商',3:'辨识、表达与显明',4:'启动、震动与迅速反应',5:'渗透、调整与持续影响',6:'风险、试探与信息缺口',7:'边界、停止与重新定位',8:'承载、配合与现实基础'}[result.calculation.lower]
  const upperRole={1:'主动、原则与承担',2:'交流、回应与协商',3:'辨识、表达与显明',4:'启动、震动与迅速反应',5:'渗透、调整与持续影响',6:'风险、试探与信息缺口',7:'边界、停止与重新定位',8:'承载、配合与现实基础'}[result.calculation.upper]
  const action=stripTerminalPunctuation(validation.do||rm.actions?.[0]||'完成一项低成本验证')
  const observe=validation.observe||rm.questions?.[0]||'现实中出现了什么新反馈？'
  const continueIf=validation.continue_if||`出现与“${rm.strengths?.[0]||r.theme}”一致的现实反馈。`
  const pauseIf=validation.pause_if||`出现“${rm.avoid?.[0]||rm.risks?.[0]||'代价扩大'}”的迹象。`
  return[
    {title:titles[0],subtitle:`${profile.focus} · ${r.name}`,highlight:analysis.opening,copy:joinChineseSentences(`已有依据：${s.support||rm.strengths?.[0]||r.theme}`,`仍需核实：${s.constraint||rm.tensions?.[0]||'愿望与条件的距离'}`)},
    {title:titles[1],subtitle:`内在 · 自身 · 外部`,highlight:relation.interaction||`内部的“${lowerRole}”正在回应外部的“${upperRole}”。`,copy:joinChineseSentences(relation.inner||`下卦${result.lower.name}，内部偏向${lowerRole}`,relation.outer||`上卦${result.upper.name}，外部偏向${upperRole}`,relation.boundary||'这里只描述互动结构，不据此断定他人的真实想法')},
    {title:titles[2],subtitle:`${result.lineReading.title} · ${line.tone||'变化'}`,highlight:le.trigger?.observe||line.signal?.meaning||line.situation,copy:joinChineseSentences(le.trigger?.threshold||'出现可核对的新反馈后，才把它视为局面开始转向',le.decision?.pause_if||line.warning)},
    {title:titles[3],subtitle:`${profile.object} · 成立条件`,highlight:opportunity.condition||`当“${rm.strengths?.[0]||r.theme}”转化为真实回应时，机会才算出现。`,copy:ensureChineseSentence(`对“${profile.focus}”而言，${opportunity.evidence||`先用“${specificActions[1]}”取得一次可核对的反馈`}`)},
    {title:titles[4],subtitle:`${profile.focus} · 误判点`,highlight:risk.trigger||`如果开始出现“${rm.avoid?.[0]||'忽略现实反馈'}”，风险会被放大。`,copy:joinChineseSentences(risk.effect||`最需要防止的是：${rm.risks?.[0]||line.warning}`,`对当前问题尤其要问：${profile.evidencePrompt}`)},
    {title:titles[5],subtitle:`${r.name} → ${changed?.name||r.name}`,highlight:paths.ready||`如果关键条件得到确认，可以小步推进。`,copy:paths.not_ready||`如果“${rm.tensions?.[0]||'关键条件'}”仍无证据支持，先停止加码，回到事实核对。`},
    {title:titles[6],subtitle:`${profile.object} · 三步核对`,highlight:`先做：${specificActions[0]}`,copy:joinChineseSentences(`接着：${specificActions[1]}`,`复核：${specificActions[2]}`,`暂停条件：${pauseIf}`)}
  ].map(card=>({...card,highlight:ensureChineseSentence(card.highlight),copy:ensureChineseSentence(card.copy)}))
}

async function cast(numbers,{save=true,scroll=true}={}){
  if(casting)return;casting=true;el.form.classList.add('is-casting');el.primary.setAttribute('aria-busy','true');el.result.hidden=true
  if(!await ensureReadings()){casting=false;el.form.classList.remove('is-casting');el.primary.removeAttribute('aria-busy');return}
  const calculation=calculate(numbers),lower=TRIGRAMS[calculation.lower],upper=TRIGRAMS[calculation.upper],lines=[...lower.lines,...upper.lines],reading=findReading(calculation.upper,calculation.lower)
  if(!reading){el.error.textContent='没有找到对应卦象，请检查本地资料。';el.error.focus({preventScroll:true});casting=false;el.form.classList.remove('is-casting');el.primary.removeAttribute('aria-busy');return}
  await wait(220)
  const changedLines=[...lines];changedLines[calculation.changingLine-1]=changedLines[calculation.changingLine-1]?0:1
  const changedLower=trigramFromLines(changedLines.slice(0,3)),changedUpper=trigramFromLines(changedLines.slice(3)),changedReading=findReading(changedUpper,changedLower)
  current={timestamp:Date.now(),question:el.question.value.trim(),numbers,calculation,lower,upper,lines,reading,lineReading:reading.lines[String(calculation.changingLine)],changedReading,changedLines}
  fillResult(current,{animate:true});el.result.classList.remove('is-revealed');el.result.classList.add('is-casting');el.result.hidden=false
  if(scroll){await wait(60);el.result.scrollIntoView({behavior:'smooth',block:'start'});await wait(360)}
await animateHexagram();el.result.classList.remove('is-casting');el.result.classList.add('is-revealed');animateResultReveal();el.form.classList.remove('is-casting');el.primary.removeAttribute('aria-busy');casting=false;if(save)saveHistory(current)
}
function fillResult(result,{animate=false}={}){const a=makeAnalysis(result),r=result.reading
  $('#result-index').textContent=`第 ${String(r.id).padStart(2,'0')} 卦 · ${result.lower.name}下${result.upper.name}上`;$('#result-name').textContent=r.name;$('#result-pinyin').textContent=r.pinyin.toUpperCase();$('#result-question').textContent=result.question||'未填写具体问题 · 以当下处境观照';$('#result-theme').textContent=r.theme;$('#result-reflection').textContent=result.question?a.opening:r.reflection;renderHex(result.lines,result.calculation.changingLine,{animate})
  const cards=makeDeepCards(result);cards.forEach((card,index)=>{const node=$(`[data-reading-card="${index}"]`);node.querySelector('h4').textContent=card.title;$(`#card-subtitle-${index}`).textContent=card.subtitle;$(`#card-highlight-${index}`).textContent=card.highlight;$(`#card-copy-${index}`).textContent=card.copy})
  fillReadingVisuals(result,cards);setReadingCard(0,{animate:false})
  $('#time-label').textContent=a.time.ancientLabel;$('#derived-copy').textContent=a.derived;$('#path-root').textContent=compactFocus(a.root,16);$('#path-trend').textContent=compactFocus(a.trend,16);$('#path-action').textContent=compactFocus(a.action,22)
  $('#structure-lower').textContent=`${result.lower.name} ${result.lower.symbol}`;$('#structure-upper').textContent=`${result.upper.name} ${result.upper.symbol}`;$('#structure-moving').textContent=`${result.lineReading.title} · ${lineModernOf(result).tone||'变化'}`;$('#changed-name').textContent=result.changedReading?`${result.changedReading.name}卦`:'本卦内变';$('#changed-theme').textContent=result.changedReading?.theme||'变化仍在当前卦象中展开'
}
function resultText(result){const a=makeAnalysis(result),cards=makeDeepCards(result);return `天地衍数｜第${result.reading.id}卦 ${result.reading.name}\n${result.question?`所问：${result.question}\n`:''}问题类型：${a.mode.label}\n数字：${result.numbers.join(' · ')}\n主题：${result.reading.theme}\n\n${cards.map(card=>`【${card.title}】${card.highlight}\n${card.copy}`).join('\n\n')}\n\n《周易》：${result.lineReading.classic}\n【精炼总结】${a.derived}\n【起卦纪时】${a.time.ancientLabel}\n\n传统文化参考，不作确定性预测。`}

let readingCardIndex=0
function shortText(value,max=36){return compactFocus(String(value||'—').replace(/[。；]$/,''),max)}
function fillReadingVisuals(result,cards){
  const rm=modernOf(result.reading),line=lineModernOf(result),e=rm.extended||{},le=line.extended||{},validation=e.validation||{}
  $('#visual-support').textContent=shortText(rm.strengths?.[0]||result.reading.theme);$('#visual-tension').textContent=shortText(rm.tensions?.[0]||rm.core);$('#visual-stage').textContent=shortText(line.situation)
  $('#visual-outer').textContent=`${result.upper.name} · ${shortText(e.relationship?.outer||'外部现实条件',26)}`;$('#visual-self').textContent=shortText(validation.do||rm.actions?.[0],30);$('#visual-inner').textContent=`${result.lower.name} · ${shortText(e.relationship?.inner||'内部推动方式',26)}`;$('#visual-relation-boundary').textContent=e.relationship?.boundary||'只描述互动结构，不替任何人断定内心。'
  $('#visual-signal-now').textContent=shortText(line.situation,34);$('#visual-signal-label').textContent=le.trigger?.label||line.signal?.label||'观察';$('#visual-signal-observe').textContent=shortText(le.trigger?.observe||line.signal?.meaning,42);$('#visual-signal-threshold').textContent=shortText(le.trigger?.threshold||'出现可核对的新反馈',42)
  $('#visual-opportunity-base').textContent=shortText(rm.strengths?.[0]||result.reading.theme,38);$('#visual-opportunity-evidence').textContent=shortText(e.opportunity?.evidence||cards[3].copy,38)
  $('#visual-risk-trigger').textContent=shortText(e.risk?.trigger||rm.avoid?.[0],34);$('#visual-risk-effect').textContent=shortText(e.risk?.effect||rm.risks?.[0],34);$('#visual-risk-pause').textContent=shortText(validation.pause_if||line.warning,34)
  $('#visual-path-origin').textContent=`${result.reading.name} · ${result.lineReading.title}`;$('#visual-path-ready').textContent=shortText(e.paths?.ready||cards[5].highlight,58);$('#visual-path-pause').textContent=shortText(e.paths?.not_ready||cards[5].copy,58)
  $('#visual-action-do').textContent=shortText(validation.do||rm.actions?.[0],42);$('#visual-action-observe').textContent=shortText(validation.observe||rm.questions?.[0],42);$('#visual-action-continue').textContent=shortText(validation.continue_if||'出现支持当前方向的新反馈',42);$('#visual-action-pause').textContent=shortText(validation.pause_if||line.warning,42)
  const suffixes=['条件图','内外位置','三点确认','成立天平','放大路径','条件分叉','四步台账'];$$('.reading-visual>header h4').forEach((heading,index)=>heading.textContent=`${cards[index].title} · ${suffixes[index]}`)
}
function deckDistance(index,center,total){let distance=index-center;if(distance>total/2)distance-=total;if(distance<-total/2)distance+=total;return distance}
function setReadingCard(index,{animate=true,focus=false}={}){
  const cards=$$('.reading-card'),total=cards.length;if(!total)return;readingCardIndex=(index+total)%total
  cards.forEach((card,cardIndex)=>{const distance=deckDistance(cardIndex,readingCardIndex,total),abs=Math.abs(distance),hidden=abs>2,scale=1-Math.min(abs,2)*.055,x=distance*clampDeckSpacing(),rotation=distance*1.35,y=abs*12
    card.classList.toggle('is-active',distance===0);card.classList.toggle('is-hidden',hidden);card.setAttribute('aria-selected',String(distance===0));card.tabIndex=distance===0?0:-1
    const target={x,y,rotation,scale,opacity:hidden?0:Math.max(.18,1-abs*.48),zIndex:10-abs}
    if(window.gsap&&animate&&!reducedMotion.matches)window.gsap.to(card,{...target,duration:.34,ease:'power3.out',overwrite:'auto'})
    else Object.assign(card.style,{transform:`translate(${x}px,${y}px) rotate(${rotation}deg) scale(${scale})`,opacity:String(target.opacity),zIndex:String(target.zIndex)})
  })
  $('#reading-deck')?.setAttribute('aria-activedescendant',cards[readingCardIndex]?.id||'')
  $$('.reading-visual').forEach((visual,i)=>{const active=i===readingCardIndex;visual.classList.toggle('is-active',active);visual.setAttribute('aria-hidden',String(!active));visual.hidden=!active})
  $$('.deck-dots button').forEach((dot,i)=>{const active=i===readingCardIndex;dot.classList.toggle('is-active',active);dot.setAttribute('aria-selected',String(active));dot.tabIndex=active?0:-1})
  const counter=$('#deck-current');if(counter)counter.textContent=String(readingCardIndex+1).padStart(2,'0')
  const activeCard=cards[readingCardIndex];if(activeCard&&animate&&!reducedMotion.matches){activeCard.classList.remove('is-refracting');void activeCard.offsetWidth;activeCard.classList.add('is-refracting');setTimeout(()=>activeCard.classList.remove('is-refracting'),520)}
  if(focus)cards[readingCardIndex]?.focus({preventScroll:true})
}
function clampDeckSpacing(){return Math.max(116,Math.min(204,window.innerWidth*.132))}
function initReadingDeck(){
  const deck=$('#reading-deck'),cards=$$('.reading-card'),dots=$('.deck-dots');if(!deck||!cards.length)return
  const labels=cards.map(card=>card.querySelector('h4')?.textContent||'解读')
  dots.innerHTML=cards.map((_,i)=>`<button type="button" id="reading-tab-${i}" role="tab" aria-controls="reading-panel-${i}" aria-label="${labels[i]}" title="${labels[i]}"><span></span></button>`).join('')
  const visuals=$$('.reading-visual')
  visuals.forEach((visual,index)=>{visual.id=`reading-panel-${index}`;visual.setAttribute('role','tabpanel');visual.setAttribute('aria-labelledby',`reading-tab-${index}`)})
  cards.forEach((card,index)=>{card.id=`reading-option-${index}`;card.setAttribute('role','option');card.setAttribute('aria-label',labels[index]);card.setAttribute('aria-posinset',String(index+1));card.setAttribute('aria-setsize',String(cards.length));card.addEventListener('click',()=>setReadingCard(index));card.addEventListener('focus',()=>{if(index!==readingCardIndex)setReadingCard(index,{focus:false})});card.addEventListener('pointerenter',()=>{if(card.classList.contains('is-active')&&!reducedMotion.matches)card.classList.add('is-lit')});card.addEventListener('pointermove',event=>{if(reducedMotion.matches||event.pointerType==='touch')return;const rect=card.getBoundingClientRect(),x=(event.clientX-rect.left)/rect.width*100,y=(event.clientY-rect.top)/rect.height*100;card.style.setProperty('--glass-x',`${x.toFixed(1)}%`);card.style.setProperty('--glass-y',`${y.toFixed(1)}%`)});card.addEventListener('pointerleave',()=>{card.classList.remove('is-lit');card.style.removeProperty('--glass-x');card.style.removeProperty('--glass-y')})})
  $$('.deck-dots button').forEach((dot,index)=>dot.addEventListener('click',()=>setReadingCard(index,{focus:true})))
  $('.deck-prev').addEventListener('click',()=>setReadingCard(readingCardIndex-1,{focus:true}));$('.deck-next').addEventListener('click',()=>setReadingCard(readingCardIndex+1,{focus:true}))
  deck.addEventListener('keydown',event=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(event.key)){event.preventDefault();const target=event.key==='Home'?0:event.key==='End'?cards.length-1:readingCardIndex+(event.key==='ArrowRight'?1:-1);setReadingCard(target,{focus:true})}})
  let startX=null,startY=null,dragX=0,dragAxis=null
  const clearDrag=()=>{startX=null;startY=null;dragX=0;dragAxis=null;deck.classList.remove('is-dragging')}
  deck.addEventListener('pointerdown',event=>{if(event.pointerType==='mouse'&&event.button!==0)return;startX=event.clientX;startY=event.clientY;dragX=0;dragAxis=null})
  deck.addEventListener('pointermove',event=>{
    if(startX===null||reducedMotion.matches)return
    const deltaX=event.clientX-startX,deltaY=event.clientY-startY
    if(!dragAxis){
      if(Math.max(Math.abs(deltaX),Math.abs(deltaY))<8)return
      if(Math.abs(deltaY)>Math.abs(deltaX)*1.15){clearDrag();return}
      dragAxis='x';deck.classList.add('is-dragging');deck.setPointerCapture?.(event.pointerId)
    }
    if(dragAxis!=='x')return
    event.preventDefault();dragX=Math.max(-86,Math.min(86,deltaX))
    cards.forEach((card,cardIndex)=>{const distance=deckDistance(cardIndex,readingCardIndex,cards.length),abs=Math.abs(distance);if(abs>2)return;const x=distance*clampDeckSpacing()+dragX*.42,rotation=distance*1.35+dragX*.018;window.gsap?.set(card,{x,rotation})})
  })
  const finishDrag=(event,cancelled=false)=>{if(startX===null)return;const delta=dragX,wasHorizontal=dragAxis==='x';if(deck.hasPointerCapture?.(event.pointerId))deck.releasePointerCapture(event.pointerId);clearDrag();if(!cancelled&&wasHorizontal&&Math.abs(delta)>38){navigator.vibrate?.(8);setReadingCard(readingCardIndex+(delta<0?1:-1))}else if(wasHorizontal)setReadingCard(readingCardIndex)}
  deck.addEventListener('pointerup',event=>finishDrag(event));deck.addEventListener('pointercancel',event=>finishDrag(event,true))
  let resizeFrame=0;window.addEventListener('resize',()=>{cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(()=>setReadingCard(readingCardIndex,{animate:false}))})
  setReadingCard(0,{animate:false})
}

const shareDialog=$('#share-dialog'),shareCanvas=$('#share-canvas'),shareStatus=$('#share-status')
let shareReturnFocus=null,shareCloseTimer=0
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
function closeShareDialog(){if(!shareDialog?.open)return;shareDialog.classList.remove('is-open');window.clearTimeout(shareCloseTimer);shareCloseTimer=window.setTimeout(()=>{shareDialog.close();if(shareReturnFocus?.isConnected)shareReturnFocus.focus({preventScroll:true});shareReturnFocus=null},180)}
$('#share-card-button').addEventListener('click',async event=>{if(!current)return;const button=event.currentTarget;button.setAttribute('aria-busy','true');try{await document.fonts?.ready;drawShareCard(current);shareStatus.textContent='';shareReturnFocus=document.activeElement;shareDialog.showModal();requestAnimationFrame(()=>{shareDialog.classList.add('is-open');$('#share-close').focus({preventScroll:true})})}finally{button.removeAttribute('aria-busy')}})
$('#share-close').addEventListener('click',closeShareDialog)
shareDialog.addEventListener('cancel',event=>{event.preventDefault();closeShareDialog()})
shareDialog.addEventListener('click',event=>{if(event.target===shareDialog)closeShareDialog()})
window.addEventListener('pagehide',()=>window.clearTimeout(shareCloseTimer),{once:true})
$('#share-download').addEventListener('click',async()=>{try{const blob=await canvasBlob();downloadBlob(blob,shareFileName());shareStatus.textContent='图片已保存'}catch{shareStatus.textContent='图片未能生成，请重试'}})
$('#share-native').addEventListener('click',async()=>{try{const blob=await canvasBlob(),file=new File([blob],shareFileName(),{type:'image/png'});if(navigator.share&&navigator.canShare?.({files:[file]})){await navigator.share({title:`${current.reading.name}卦 · ${current.reading.theme}`,files:[file]});shareStatus.textContent='分享面板已打开'}else{downloadBlob(blob,shareFileName());shareStatus.textContent='当前浏览器不支持直接分享，已改为保存图片'}}catch(error){if(error?.name!=='AbortError')shareStatus.textContent='分享未完成，可选择保存图片'}})

$('#copy-button').addEventListener('click',async event=>{if(!current)return;const button=event.currentTarget;try{await navigator.clipboard.writeText(resultText(current));button.textContent='已复制 ✓';button.classList.add('is-success');setTimeout(()=>{button.textContent='复制解读';button.classList.remove('is-success')},1400)}catch{button.textContent='复制失败';button.classList.add('is-failed');setTimeout(()=>{button.textContent='复制解读';button.classList.remove('is-failed')},1400)}})
$('#reset-button').addEventListener('click',async()=>{current=null;el.result.classList.add('is-leaving');await wait(180);el.result.hidden=true;el.result.classList.remove('is-leaving','is-revealed');el.form.reset();el.questionCount.textContent='0';el.question.closest('.question-field').classList.remove('has-content');updateQuestionMode();el.error.textContent='';el.inputs.forEach(input=>input.removeAttribute('aria-invalid'));el.entries.forEach(e=>e.classList.remove('has-error','is-complete'));updateEntryState();refreshScrollMotion();$('#cast').scrollIntoView({behavior:'smooth'});await wait(260);el.inputs[0].focus()})

function loadHistory(){try{return JSON.parse(localStorage.getItem(HISTORY_KEY)||'[]')}catch{return[]}}
function saveHistory(result){const compact={timestamp:result.timestamp,question:result.question,numbers:result.numbers,id:result.reading.id,name:result.reading.name,theme:result.reading.theme};const history=[compact,...loadHistory().filter(i=>i.numbers.join()!=compact.numbers.join())].slice(0,6);localStorage.setItem(HISTORY_KEY,JSON.stringify(history));renderHistory()}
function escapeHtml(v){return String(v).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;')}
function renderHistory(){const history=loadHistory();if(!history.length){el.history.innerHTML='<p class="empty">还没有卦笺，完成第一次起卦后会显示在这里。</p>';return}el.history.innerHTML=history.map(item=>`<button class="history-item" data-numbers="${item.numbers.join(',')}" data-question="${escapeHtml(item.question||'')}"><span>第 ${String(item.id).padStart(2,'0')} 卦</span><h4>${escapeHtml(item.name)}</h4><p>${escapeHtml(item.theme)}</p></button>`).join('');$$('.history-item').forEach(button=>button.addEventListener('click',async()=>{const n=button.dataset.numbers.split(',');button.classList.add('is-loading');button.setAttribute('aria-busy','true');el.inputs.forEach((input,i)=>input.value=n[i]);el.question.value=button.dataset.question||'';el.questionCount.textContent=el.question.value.length;el.question.closest('.question-field').classList.toggle('has-content',Boolean(el.question.value.trim()));updateQuestionMode();updateEntryState();$('#cast').scrollIntoView({behavior:'smooth'});await wait(450);await cast(n,{save:false});button.classList.remove('is-loading');button.removeAttribute('aria-busy')}))}

function animateResultReveal(){
  if(!window.gsap||reducedMotion.matches){refreshScrollMotion();return}
  const targets=['.result-top>div:first-child','.hexagram-wrap','.result-summary','.reading-deck-heading','.deck-shell','.reading-visuals','.derived','.calculation','.result-actions'].map(target=>typeof target==='string'?$(target):target).filter(Boolean)
  window.gsap.fromTo(targets,{autoAlpha:0,y:14},{autoAlpha:1,y:0,duration:.42,ease:'power3.out',stagger:.045,overwrite:'auto',clearProps:'opacity,visibility,transform',onComplete:refreshScrollMotion})
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
      .from(['.intro-stage h1 span','.intro-stage h1 em','.hero-note-left','.hero-note-right','.hero-trust-mobile','.intro-stage .scroll-cue'],{autoAlpha:0,y:20,duration:.62,stagger:.07},.06)

    const coinTimeline=gsap.timeline({
      scrollTrigger:context.conditions.desktop?{
        id:'coin-scroll',trigger:'.coin-stage',start:'top top',end:'bottom bottom',
        pin:'.coin-scene',pinSpacing:false,scrub:.7,anticipatePin:1,invalidateOnRefresh:true
      }:{
        id:'coin-scroll',trigger:'.coin-stage',start:'top 72%',end:'bottom 24%',
        scrub:.82,invalidateOnRefresh:true
      }
    })
    const coinWords=gsap.utils.toArray('.coin-wordmark span')
    const wordEnter=context.conditions.mobile
      ? {autoAlpha:.08,x:0,y:index=>index===0?-112:112,scale:.68}
      : {autoAlpha:.1,x:index=>index===0?-46:46,y:0,scale:1}
    const wordSettle={autoAlpha:1,x:0,y:0,scale:1,duration:.34,ease:'sine.out'}
    const wordExit=context.conditions.mobile
      ? {autoAlpha:.08,x:0,y:index=>index===0?-112:112,scale:.68,duration:.34,ease:'sine.in'}
      : {autoAlpha:.1,x:index=>index===0?-46:46,y:0,scale:1,duration:.34,ease:'sine.in'}
    const coinEnter={autoAlpha:.08,y:32,scale:context.conditions.mobile ? .82 : .86,rotation:-4}
    const coinVisible={autoAlpha:1,y:0,scale:1,rotation:0,duration:.34,ease:'sine.out',force3D:true}
    const coinSettle={y:-3,scale:1,duration:.32,ease:'sine.inOut',force3D:true}
    const coinExit={autoAlpha:.08,y:-36,scale:.88,rotation:4,duration:.34,ease:'sine.in',force3D:true}
    const settleAt=.34,exitAt=.66
    coinTimeline
      .addLabel('enter',0)
      .fromTo(coinWords,wordEnter,wordSettle,'enter')
      .fromTo('.coin-real',coinEnter,coinVisible,'enter')
      .fromTo(['.coin-wrap p','.coin-note','.coin-cue'],{autoAlpha:0,y:7},{autoAlpha:1,y:0,duration:.2,ease:'sine.out',stagger:.018},'enter+=0.12')
      .addLabel('settle',settleAt)
      .to('.coin-real',coinSettle,'settle')
      .addLabel('exit',exitAt)
      .to(['.coin-wrap p','.coin-note','.coin-cue'],{autoAlpha:0,y:-7,duration:.2,ease:'sine.in',stagger:.012},'exit+=0.02')
      .to('.coin-real',coinExit,'exit')
      .to(coinWords,wordExit,'exit')

    gsap.fromTo('.cast-card',{autoAlpha:0,y:40,scale:.975},{
      autoAlpha:1,y:0,scale:1,duration:.72,ease:'power3.out',clearProps:'opacity,visibility,transform',
      scrollTrigger:{trigger:'.cast-stage',start:context.conditions.mobile?'top 76%':'top 68%',once:true}
    })
    gsap.fromTo('.cast-atmosphere',{autoAlpha:0},{
      autoAlpha:1,duration:1.1,ease:'power2.out',
      scrollTrigger:{trigger:'.cast-stage',start:'top 82%',once:true}
    })
    const revealTargets=['.method .section-title',...$$('.steps article'),'.trigrams','.history .section-title',...$$('.history-item'),'.contact-glass']
    gsap.set(revealTargets,{autoAlpha:0,y:context.conditions.mobile?10:16})
    ScrollTrigger.batch(revealTargets,{
      start:'top 88%',once:true,interval:.06,batchMax:4,
      onEnter:batch=>gsap.to(batch,{autoAlpha:1,y:0,duration:.4,ease:'power3.out',stagger:.04,overwrite:true,clearProps:'opacity,visibility,transform'})
    })
  })
  const refresh=()=>ScrollTrigger.refresh()
  window.addEventListener('load',refresh,{once:true})
  document.fonts?.ready?.then(refresh)
  window.addEventListener('pagehide',event=>{if(event.persisted)return;motionMedia?.revert();motionMedia=null},{once:true})
  return true
}

function initFallbackMotion(){
  document.documentElement.classList.add('motion-fallback','page-entered')
  const targets=$$('.coin-wrap,.coin-wordmark,.coin-note,.cast-card,.cast-atmosphere,.cast-section-title,.contact-glass')
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

function initContactSpecular(){
  const frame=$('[data-specular-frame]')
  if(!frame||reducedMotion.matches||!window.matchMedia('(hover:hover) and (pointer:fine)').matches)return
  let raf=0,lastEvent=null
  const render=()=>{
    raf=0
    if(!lastEvent)return
    const rect=frame.getBoundingClientRect(),x=lastEvent.clientX,y=lastEvent.clientY
    const dx=Math.max(rect.left-x,0,x-rect.right),dy=Math.max(rect.top-y,0,y-rect.bottom),distance=Math.hypot(dx,dy)
    const proximity=Math.max(0,1-distance/420),smooth=proximity*proximity*(3-2*proximity)
    const cx=rect.left+rect.width/2,cy=rect.top+rect.height/2,angle=Math.atan2(y-cy,x-cx)*180/Math.PI+90
    frame.style.setProperty('--spec-angle',`${angle}deg`)
    frame.style.setProperty('--spec-opacity',String(.24+smooth*.76))
    frame.style.setProperty('--spec-x',`${Math.max(0,Math.min(100,(x-rect.left)/rect.width*100))}%`)
    frame.style.setProperty('--spec-y',`${Math.max(0,Math.min(100,(y-rect.top)/rect.height*100))}%`)
  }
  const onPointerMove=event=>{lastEvent=event;if(!raf)raf=requestAnimationFrame(render)}
  window.addEventListener('pointermove',onPointerMove,{passive:true})
  window.addEventListener('pagehide',()=>{cancelAnimationFrame(raf);window.removeEventListener('pointermove',onPointerMove)},{once:true})
}

function initContactCopy(){
  const button=$('#contact-copy')
  if(!button)return
  const status=$('#contact-copy-status'),icon=button.querySelector('i'),email=button.dataset.email
  let resetTimer=0
  const copyFallback=()=>{
    const field=document.createElement('textarea')
    field.value=email;field.setAttribute('readonly','');field.style.cssText='position:fixed;opacity:0;pointer-events:none'
    document.body.appendChild(field);field.select();const copied=document.execCommand('copy');field.remove()
    if(!copied)throw Error('Copy command failed')
  }
  button.addEventListener('click',async()=>{
    try{
      if(navigator.clipboard?.writeText)await navigator.clipboard.writeText(email)
      else copyFallback()
      clearTimeout(resetTimer);status.textContent='已复制';icon.textContent='✓';button.classList.add('is-copied')
      resetTimer=window.setTimeout(()=>{status.textContent='复制邮箱';icon.textContent='⧉';button.classList.remove('is-copied')},1600)
    }catch(error){
      try{copyFallback();status.textContent='已复制';icon.textContent='✓';button.classList.add('is-copied')}
      catch{status.textContent='复制失败';icon.textContent='!'}
      clearTimeout(resetTimer);resetTimer=window.setTimeout(()=>{status.textContent='复制邮箱';icon.textContent='⧉';button.classList.remove('is-copied')},1600)
    }
  })
  window.addEventListener('pagehide',()=>clearTimeout(resetTimer),{once:true})
}

function restoreReadingFromUrl(){
  const params=new URLSearchParams(location.search),numbers=['n1','n2','n3'].map(key=>params.get(key))
  if(numbers.some(value=>!/^\d{3}$/.test(value||'')))return
  el.inputs.forEach((input,index)=>input.value=numbers[index]);el.question.value=params.get('q')||'';el.questionCount.textContent=el.question.value.length
  el.question.closest('.question-field').classList.toggle('has-content',Boolean(el.question.value.trim()));updateQuestionMode();updateEntryState()
  window.setTimeout(()=>cast(numbers,{save:false,scroll:location.hash==='#result'}),80)
}

function scheduleHeroLiquid(){
  const host=$('[data-liquid-ether]')
  if(!host||reducedMotion.matches)return
  let started=false,idleId=0,timerId=0
  const load=()=>{
    if(started||document.querySelector('script[data-hero-liquid]'))return
    started=true
    const script=document.createElement('script')
    script.src='./assets/vendor/hero-liquid.bundle.js?v=20260811-1'
    script.async=true
    script.dataset.heroLiquid=''
    script.addEventListener('error',()=>host.classList.add('is-static'),{once:true})
    document.head.appendChild(script)
  }
  const queue=()=>{
    if('requestIdleCallback'in window)idleId=window.requestIdleCallback(load,{timeout:900})
    else timerId=window.setTimeout(load,180)
  }
  if(document.readyState==='complete')queue()
  else window.addEventListener('load',queue,{once:true})
  window.addEventListener('pagehide',()=>{
    if(idleId&&'cancelIdleCallback'in window)window.cancelIdleCallback(idleId)
    clearTimeout(timerId)
  },{once:true})
}

renderCastBrushTitle();initTalismanCarousel();initContactSpecular();initContactCopy();initReadingDeck();updateEntryState();updateQuestionMode();renderHistory()
if(!initGSAPMotion())initFallbackMotion()
scheduleHeroLiquid()
restoreReadingFromUrl()
