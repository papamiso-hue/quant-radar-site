'use strict';
const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pct = (x, d=1) => (x*100).toFixed(d) + '%';
const DATA = JSON.parse(document.getElementById('data').textContent);
const LG = DATA.leagues;
const WD = ['일','월','화','수','목','금','토'];

/* ---------- 경기 페이지 ---------- */
function hcap(m, fav, line){           // m: 점수차 -5..+5 확률, fav: 홈이 강팀이면 1, 원정이 강팀이면 -1
  let w=0,t=0; m.forEach((x,i)=>{ const k=(i-5)*fav; if(k>=line+1) w+=x; else if(k===line) t+=x; });
  return [w,t,Math.max(0,1-w-t)];
}
function formChips(f){ return f && f.length ? `<div class="form" title="최근 ${f.length}경기 (왼쪽이 오래된 경기)">${f.map(x=>`<i class="${x}">${{W:'승',D:'무',L:'패'}[x]}</i>`).join('')}</div>` : ''; }
function h2hBlock(q){
  const t = q.h2h;
  if(!t || !t.rows.length) return '<div class="sc">상대전적: 최근 맞대결 기록이 없습니다.</div>';
  const rows = t.rows.map(r => `<tr><td>${esc(r.date.slice(2))}</td><td class="tl">${esc(r.home)} <b>${r.hg} : ${r.ag}</b> ${esc(r.away)}</td></tr>`).join('');
  return `<details class="ex" open><summary>맞대결 · 최근 ${t.rows.length}경기: ${esc(q.home)} ${t.w[0]}승 ${t.w[1]}무 ${t.w[2]}패</summary>
    <div class="mut" style="margin-top:6px">홈/원정 구분 없이 두 팀의 최근 맞대결입니다. (최대 5경기) ${Q("상대전적 = 이 두 팀이 서로 만나 싸운 과거 경기 기록입니다. 승·무·패는 이번 경기의 홈팀 기준이에요.")}</div><table class="ot"><tbody>${rows}</tbody></table></details>`;
}
function oddsBlock(q){
  const fo=x=>x>=0.01?(1/x).toFixed(2):'-', cur=q.p.slice(0,3), today=(DATA.generated||'').slice(0,10), H=q.hist||[];
  const before=H.filter(r=>r[0]<today), prev=before[before.length-1], first=H[0] && H[0][0]<today ? H[0] : null;
  const lab=['홈','무','원정'];
  const cell=i=>{
    let t=`<span class="od"><small>${lab[i]}</small><b>${fo(cur[i])}</b>`;
    if(first){const a=first[i+1], d=(1/cur[i])-(1/a); t+=`<i class="ft">최초 ${fo(a)} → ${d>0.004?'<u class="up">▲</u>':d<-0.004?'<u class="dn">▼</u>':'='}</i>`;}
    return t+'</span>';
  };
  const chg=i=>{ if(!prev) return `<span class="chg"><small>${lab[i]}</small><em class="nu">첫 계산</em></span>`;
    const d=(cur[i]-prev[i+1])*100, c=Math.abs(d)<0.05?'nu':d>0?'up':'dn', ar=Math.abs(d)<0.05?'―':d>0?'▲':'▼';
    return `<span class="chg"><small>${lab[i]}</small><em class="${c}">${ar} ${Math.abs(d).toFixed(1)}%p</em></span>`; };
  return `<div class="oddsrow" >
    <div class="olab">AI 환산 배당 ${Q("AI가 계산한 확률을 '몇 배'로 바꿔 본 숫자입니다. 계산식은 1 ÷ 확률이에요. 예) 확률 40% → 2.5배. 숫자가 작을수록 AI가 그 결과를 더 잘 일어날 것으로 본 겁니다. 베팅 회사의 배당과는 전혀 관계없는, 우리 AI만의 숫자입니다.")}</div><div class="easy">쉽게 말해: 숫자가 <b>작을수록</b> 일어날 가능성이 높다고 AI가 본 결과입니다. (베팅 회사 배당 아님)</div><div class="ocells">${[0,1,2].map(cell).join('')}</div>
    <div class="olab" style="margin-top:6px">어제 대비 확률 변화${Q("어제 계산한 확률과 오늘 확률의 차이입니다. ▲는 올랐다, ▼는 내렸다는 뜻이고, %p는 퍼센트 포인트(예: 35% → 38%면 +3.0%p)입니다.")}${prev?` <small>(${esc(prev[0].slice(5).replace('-','/'))} → 오늘)</small>`:''}</div><div class="ocells">${[0,1,2].map(chg).join('')}</div></div>`;
}
const jo=(w,a,b)=>{const c=String(w).charCodeAt(String(w).length-1); return (c>=0xAC00&&c<=0xD7A3)?(((c-0xAC00)%28)?a:b):b;};
const TC={'본머스':'D71920','아스널':'EF0107','애스턴 빌라':'670E36','브렌트퍼드':'E30613','브라이턴':'0057B8','번리':'6C1D45','첼시':'034694','크리스털 팰리스':'1B458F','에버턴':'003399','풀럼':'111111','리즈':'FFCD00:1D428A','레스터':'003090','리버풀':'C8102E','맨체스터 시티':'6CABDD:1C2C5B','맨체스터 유나이티드':'DA291C','뉴캐슬':'241F20','노팅엄 포레스트':'DD0000','사우샘프턴':'D71920','선덜랜드':'EB172B','토트넘':'132257','웨스트햄':'7A263A','울버햄프턴':'FDB913:231F20','코번트리':'59CBE8:111111','입스위치':'3A64A3','헐 시티':'F5A12D:111111','루턴':'F78F1E:1B1B4D','셰필드 유나이티드':'EE2737','AC 밀란':'FB090B','인터 밀란':'0068A8','유벤투스':'111111','나폴리':'12A0D7','AS 로마':'8E1F2F','라치오':'87D8F7:111111','아탈란타':'1E71B8','피오렌티나':'4B2E83','볼로냐':'1A2F48','토리노':'8A1E41','우디네세':'222222','제노아':'AD1F2D','칼리아리':'A01C2A','레체':'E3A400:111111','파르마':'FFD500:111111','헬라스 베로나':'1B3F94','엠폴리':'0E6AB8','코모':'1E56A0','사수올로':'1B8F4C','몬차':'D71920','피사':'1A1A1A','크레모네세':'B3202A','베네치아':'0F6B3A','레알 마드리드':'FFFFFF:1F2A44','바르셀로나':'A50044','아틀레티코 마드리드':'CB3524','세비야':'D71920','발렌시아':'F28C00:111111','비야레알':'FBE122:111111','레알 베티스':'0BB363','레알 소시에다드':'0067B1','아틀레틱 빌바오':'EE2523','지로나':'D71920','셀타 비고':'8AC3EE:111111','오사수나':'D91A21','마요르카':'E20613','라요 바예카노':'FFFFFF:D71920','헤타페':'005999','알라베스':'0761AF','에스파뇰':'007FC8','라스팔마스':'FFE400:111111','레반테':'B8123C','엘체':'0B7A3E','레가네스':'2D6A9F','바이에른 뮌헨':'DC052D','도르트문트':'FDE100:111111','레버쿠젠':'E32221','라이프치히':'DD0741','프랑크푸르트':'E1000F','슈투트가르트':'E32219','볼프스부르크':'65B32E','묀헨글라트바흐':'1E8F3E','프라이부르크':'D71920','우니온 베를린':'D4011D','마인츠':'C3141E','호펜하임':'1961B5','베르더 브레멘':'1D9053','아우크스부르크':'BA3733','하이덴하임':'C3002F','쾰른':'D71920','장크트파울리':'5C3A21','함부르크':'1F4E9E','샬케':'004D9D','보훔':'005CA9','다름슈타트':'004E9E','홀슈타인 킬':'1D3F8A','파리 생제르맹':'004170','올림피크 마르세유':'2FAEE0','올림피크 리옹':'1F3E8F','모나코':'E2001A','릴':'E01E13','니스':'D1121B','랑스':'F7BE00:111111','렌':'E13327','스트라스부르':'0A88D6','툴루즈':'5B2A8C','낭트':'FBD600:111111','브레스트':'E2231A','랭스':'D71920','몽펠리에':'F0801A','로리앙':'F58220','생테티엔':'1E8C45','오세르':'1F5FB0','앙제':'111111','메스':'8F1D35','르아브르':'4A8FD6','파리 FC':'2A5CAA','아약스':'D2122E','PSV 에인트호번':'E2001A','페예노르트':'E2001A','AZ 알크마르':'D71920','트벤테':'E2001A','위트레흐트':'D71920','헤이렌베인':'1B5EA8','흐로닝언':'1A8F3E','NEC 네이메헌':'E2001A','스파르타 로테르담':'D71920','즈볼러':'2A6CB5','고 어헤드 이글스':'E2001A','포르투나 시타르트':'F7CF00:111111','헤라클레스':'111111','텔스타':'111111','빌럼 II':'E2001A','NAC 브레다':'F7C600:111111','RKC 발베이크':'F2C300:111111','엑셀시오르':'D71920','비테세':'111111','캄뷔르':'F7C600:111111','볼렌담':'E2001A','알메러 시티':'D71920','덴하흐':'1A8F3E'};

/* 어려운 말 옆의 ? 설명 */
const Q=(t)=>`<button type="button" class="qm" data-tip="${String(t).replace(/"/g,'&quot;')}" aria-label="설명 보기">?</button>`;
document.addEventListener('click',function(e){const b=e.target.closest&&e.target.closest('.qm');
  document.querySelectorAll('.qm.on').forEach(function(x){ if(x!==b) x.classList.remove('on'); });
  if(b){ e.preventDefault(); b.classList.toggle('on'); }});
function badge(n){ const nm=String(n), t=nm.replace(/\s+/g,'').slice(0,2); const c=TC[nm];
  if(c){ const [bg,fg]=c.split(':'); const light=!!fg; return `<span class="bd sh${light?' lt':''}" style="--bg:#${bg};--fg:#${fg||'ffffff'}" aria-hidden="true">${esc(t)}</span>`; }
  let h=0; for(const ch of nm) h=(h*31+ch.charCodeAt(0))%360;
  return `<span class="bd sh" style="--bg:hsl(${h} 52% 42%);--fg:#fff" aria-hidden="true">${esc(t)}</span>`; }
function formSum(f){ if(!f||!f.length) return ''; const c={W:0,D:0,L:0}; f.forEach(x=>c[x]++); return `${c.W}승 ${c.D}무 ${c.L}패`; }
function outlookText(q,top){
  const p=q.p, i=p.indexOf(Math.max(...p)), lab=[`${q.home} 승`,'무승부',`${q.away} 승`][i];
  const li=[`AI가 가장 높게 본 결과는 <b>${esc(lab)} ${pct(p[i],0)}</b>입니다.`,
    `가장 가능성이 높은 점수는 <b>${top[0][0]}-${top[0][1]}</b> (${pct(top[0][2],0)})입니다.`];
  if(q.form_h&&q.form_h.length&&q.form_a&&q.form_a.length) li.push(`최근 ${q.form_h.length}경기: ${esc(q.home)} ${formSum(q.form_h)} · ${esc(q.away)} ${formSum(q.form_a)}.`);
  const t=q.h2h; if(t&&t.rows&&t.rows.length) li.push(`최근 맞대결 ${t.rows.length}경기: ${esc(q.home)} ${t.w[0]}승 ${t.w[1]}무 ${t.w[2]}패.`);
  return `<ul>${li.map(x=>`<li>${x}</li>`).join('')}</ul><div class="mut" style="font-size:12px">통계 추정이며 결과를 보장하지 않습니다.</div>`;
}
const REFS=['woman.webp','woman2.webp','woman3.webp','woman4.webp','woman5.webp','woman6.webp'];
function refImg(q){let h=0;for(const c of String(q.home)+'|'+String(q.away)+'|'+String(q.date||'')){h=(h*31+c.charCodeAt(0))%9973;}return REFS[h%REFS.length];}

/* 시장 배당 변화: 원배당 → 시간별 중간배당 그래프 (참고용 통계) */
function kst(iso){ try{ return new Date(iso).toLocaleString('ko-KR',{timeZone:'Asia/Seoul',month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit',hour12:false}); }catch(e){ return iso; } }
function marketBlock(q){
  const m=q.odds_m; if(!m||!m.s||!m.s.length) return '';
  const S=m.s, last=S[S.length-1], first=S[0], lab=['홈','무','원정'], col=['#3f7fb0','#9a9188','#dd8f2e'];
  const f=x=>Number(x).toFixed(2);
  const arrow=(a,b)=>b>a+0.004?'<u class="up">▲</u>':b<a-0.004?'<u class="dn">▼</u>':'=';
  const row=(t,arr,tag)=>`<div class="mrow"><span class="mt">${tag}<small>${kst(t)}</small></span>`+arr.map((x,i)=>`<span class="od"><small>${lab[i]}</small><b>${f(x)}</b></span>`).join('')+'</div>';
  let h=`<div class="oddsrow mkt"><div class="olab">시장 배당 변화 ${Q("여러 해외 배당 업체가 내놓은 숫자의 중간값입니다. 처음 나온 값이 '원배당', 그 뒤 시간이 지나며 다시 기록한 값이 '중간배당'이에요. 숫자가 내려가면 그 결과를 시장이 더 가능성 있게 본다는 뜻입니다. 참고용 통계이며 특정 결과를 권하는 것이 아닙니다.")}</div>`;
  h+=row(first[0],first.slice(1,4),'원배당');
  if(S.length>1){
    h+=row(last[0],last.slice(1,4),'현재(중간)');
    h+=`<div class="mchg">원배당 대비: `+[0,1,2].map(i=>`${lab[i]} ${f(first[i+1])}→${f(last[i+1])} ${arrow(first[i+1],last[i+1])}`).join(' · ')+'</div>';
    const W=320,Hh=132,L=36,R=10,T=10,B=26, t0=Date.parse(first[0]), ko=Date.parse(m.ko), t1=Math.max(ko,Date.parse(last[0])), span=Math.max(t1-t0,1);
    let lo=1e9,hi=0; S.forEach(r=>{for(let i=1;i<4;i++){lo=Math.min(lo,r[i]);hi=Math.max(hi,r[i]);}});
    const pad=Math.max((hi-lo)*0.15,0.05); lo-=pad; hi+=pad;
    const X=t=>L+(Date.parse(t)-t0)/span*(W-L-R), Y=v=>T+(hi-v)/(hi-lo)*(Hh-T-B);
    let svg=`<svg class="mchart" viewBox="0 0 ${W} ${Hh}" role="img" aria-label="시간에 따른 홈·무·원정 배당 변화 그래프">`;
    for(let k=0;k<=3;k++){const v=lo+(hi-lo)*k/3, y=Y(v); svg+=`<line x1="${L}" x2="${W-R}" y1="${y.toFixed(1)}" y2="${y.toFixed(1)}" class="gl"/><text x="${L-4}" y="${(y+3).toFixed(1)}" text-anchor="end" class="ax">${v.toFixed(2)}</text>`;}
    const kx=W-R; svg+=`<line x1="${kx}" x2="${kx}" y1="${T}" y2="${Hh-B}" class="kl"/><text x="${kx}" y="${Hh-B+12}" text-anchor="end" class="ax">킥오프 ${kst(m.ko)}</text><text x="${L}" y="${Hh-B+12}" class="ax">${kst(first[0])}</text>`;
    [1,2,3].forEach((c,i)=>{ const pts=S.map(r=>`${X(r[0]).toFixed(1)},${Y(r[c]).toFixed(1)}`).join(' ');
      svg+=`<polyline points="${pts}" fill="none" stroke="${col[i]}" stroke-width="2" stroke-linejoin="round"/>`+S.map(r=>`<circle cx="${X(r[0]).toFixed(1)}" cy="${Y(r[c]).toFixed(1)}" r="2.6" fill="${col[i]}"><title>${lab[i]} ${f(r[c])} · ${kst(r[0])}</title></circle>`).join(''); });
    svg+='</svg>';
    h+=svg+`<div class="lg3"><span><i style="background:${col[0]}"></i>홈</span><span><i style="background:${col[1]}"></i>무</span><span><i style="background:${col[2]}"></i>원정</span></div>`;
    h+=`<details class="ex"><summary>시간별 배당 표 보기</summary><div class="mtab">`+S.map((r,k)=>`<div class="mrow"><span class="mt">${k===0?'원배당':'중간'}<small>${kst(r[0])}</small></span><span>${f(r[1])}</span><span>${f(r[2])}</span><span>${f(r[3])}</span></div>`).join('')+'</div></details>';
  } else {
    h+=`<div class="mchg">다음 기록부터 변화 그래프가 그려집니다. 경기가 가까워질수록 더 자주 기록합니다.</div>`;
  }
  h+=`<div class="mut" style="font-size:11.5px;margin-top:6px">여러 해외 업체 배당의 중간값(업체 이름 비공개) · ${m.n}개 업체 기준 · 참고용 통계이며 구매·참여를 권유하지 않습니다. 만 19세 미만 이용 불가, 도박 문제 상담 1336(무료).</div></div>`;
  return h;
}

/* 내 팀 즐겨찾기 (이 기기에만 저장) */
var __memFav=[];
function getFav(){ try{ return JSON.parse(localStorage.getItem('sl_fav')||'[]'); }catch(e){ return __memFav; } }
function setFav(a){ __memFav=a; try{ localStorage.setItem('sl_fav',JSON.stringify(a)); }catch(e){} }
function star(n){ return `<button type="button" class="fv" data-t="${esc(n)}" aria-pressed="false" aria-label="${esc(n)} 내 팀 추가">☆</button>`; }
function syncFav(){ const f=new Set(getFav());
  document.querySelectorAll('.fv').forEach(b=>{ const on=f.has(b.dataset.t); b.textContent=on?'★':'☆'; b.setAttribute('aria-pressed',on); b.classList.toggle('on',on); b.setAttribute('aria-label',b.dataset.t+(on?' 내 팀에서 빼기':' 내 팀 추가')); });
  const c=document.getElementById('favcnt'); if(c) c.textContent=f.size?' '+f.size:''; }
document.addEventListener('click',function(e){
  const b=e.target.closest&&e.target.closest('.fv');
  if(b){ const t=b.dataset.t; let a=getFav(); a=a.includes(t)?a.filter(x=>x!==t):a.concat([t]); setFav(a); syncFav(); if(window.__onFav) window.__onFav(); return; }
  const s=e.target.closest&&e.target.closest('.shr');
  if(s){ const u=new URL(s.dataset.u,location.href).href, ti=s.dataset.ti||document.title;
    if(navigator.share){ navigator.share({title:ti,url:u}).catch(function(){}); }
    else if(navigator.clipboard){ navigator.clipboard.writeText(u).then(function(){ s.textContent='주소 복사됨'; setTimeout(function(){ s.textContent='공유'; },1800); }).catch(function(){}); } }
});
function matchCard(q, HL){
  const v=[q.p[0],q.p[1],q.p[2]], mx=Math.max(...v), cls=['sh','sd','sa'], nm=['홈승','무','원정승'];
  const seg=v.map((x,i)=>`<span class="${cls[i]}${x===mx?' fav':''}" style="flex:${Math.max(x,0.001)}" title="${nm[i]} ${pct(x)}">${x>=0.1?`<em data-cu="${Math.round(x*100)}" data-suf="%">${Math.round(x*100)}%</em>`:''}</span>`).join('');
  const M=q.scores, cells=[]; M.forEach((r,i)=>r.forEach((x,j)=>cells.push([i,j,x])));
  const top=cells.slice().sort((a,b)=>b[2]-a[2]), mxv=top[0][2];
  const chips=top.slice(0,3).map((c,k)=>`<b class="${k===0?'top':''}">${c[0]}-${c[1]} · ${pct(c[2],0)}</b>`).join('');
  let grid='<div class="ax"></div>'+[0,1,2,3,4,5].map(j=>`<div class="ax">${j}</div>`).join('');
  M.forEach((r,i)=>{grid+=`<div class="ax">${i}</div>`+r.map((x,j)=>`<div class="c${x===mxv?' mx':''}" style="--t:${(x/mxv*0.85).toFixed(2)}" title="${esc(q.home)} ${i} - ${j} ${esc(q.away)} · ${pct(x)}">${x>=0.01?(x*100).toFixed(0):''}</div>`).join('');});
  const fav=q.p[0]>=q.p[2]?1:-1, nmf=fav===1?q.home:q.away, hv=hcap(q.margin,fav,HL), hm=Math.max(...hv), hs=['hw','hn','hl'], hn=['핸승','핸무','핸패'];
  const hc=`<div class="hlab">핸디캡 ${Q("실력이 센 팀에게 미리 1점을 빼고 시작하는 방식으로 다시 계산한 결과입니다. 핸승 = 강팀이 2점 차 이상으로 이김, 핸무 = 정확히 1점 차로 이김, 핸패 = 비기거나 짐.")} −${HL} · <b>${esc(nmf)}</b>이(가) ${HL}점을 주고 시작 (${HL}점 차 승리 = 핸무, ${HL+1}점 이상 차 승리 = 핸승)</div>
    <div class="hb" role="img" aria-label="핸승 ${pct(hv[0],0)}, 핸무 ${pct(hv[1],0)}, 핸패 ${pct(hv[2],0)}">${hv.map((x,i)=>`<span class="${hs[i]}${x===hm?' fav':''}" style="flex:${Math.max(x,0.001)}" title="${hn[i]} ${pct(x)}">${x>=0.1?`<em data-cu="${Math.round(x*100)}" data-pre="${hn[i]} " data-suf="%">${hn[i]} ${Math.round(x*100)}%</em>`:''}</span>`).join('')}</div>`;
  const rest=`${oddsBlock(q)}${marketBlock(q)}${hc}
      <div class="sc">예상 스코어 ${Q("AI가 보기에 가장 자주 나올 것 같은 점수 3개와 그 확률입니다. 1등 점수여도 확률은 보통 10% 안팎이라 빗나가는 일이 흔합니다.")} ${chips}</div>
      <div class="sc">3골 이상 나올 확률 ${Q("두 팀이 넣는 골을 합쳐서 3골 이상이 될 확률입니다.")} <b>${pct(q.o25,0)}</b> · 양 팀 모두 득점 ${Q("두 팀 모두 최소 1골씩 넣을 확률입니다.")} <b>${pct(q.btts,0)}</b></div>
      <details class="ex"><summary>스코어별 확률표 보기</summary><div class="mut" style="margin-top:6px">세로 = 홈팀 득점, 가로 = 원정팀 득점, 칸 안 숫자 = 확률(%).</div><div class="hm">${grid}</div></details>
      ${h2hBlock(q)}`;
  const legend=`<div class="lg3"><span><i style="background:#3f7fb0"></i>홈승</span><span><i style="background:#cfc8bf"></i>무</span><span><i style="background:#dd8f2e"></i>원정승</span></div>`;
  return `<div class="m" style="--i:${(window.__ci=(window.__ci||0)+1)%12}">
    <div class="mh"><span class="lgt">${esc(LG[q.league]||q.league)}</span>${q.slug?`<span class="mact"><a class="mlink" href="match-${esc(q.slug)}.html">이 경기만 보기</a><button type="button" class="shr" data-u="match-${esc(q.slug)}.html" data-ti="${esc(q.home)} vs ${esc(q.away)} 승무패 확률">공유</button></span>`:''}</div>
    <div class="vs"><div class="tm">${badge(q.home)}<b>${esc(q.home)}</b>${star(q.home)}<small>홈</small>${formChips(q.form_h)}</div><div class="vsx">VS</div><div class="tm">${badge(q.away)}<b>${esc(q.away)}</b>${star(q.away)}<small>원정</small>${formChips(q.form_a)}</div></div>
    <div class="pb" role="img" aria-label="홈 ${pct(q.p[0],0)}, 무 ${pct(q.p[1],0)}, 원정 ${pct(q.p[2],0)}">${seg}</div>${legend}
    <div class="outlook"><div class="otx"><h3>경기 전망 ${Q("AI가 계산한 결과를 알기 쉽게 글로 풀어 쓴 요약입니다. 결과를 보장하지 않습니다.")}</h3>${outlookText(q,top)}</div><img class="mascot" src="${refImg(q)}" alt="통계 안내 인물 이미지(AI 생성)" width="96" height="120" loading="lazy"></div>
    <div class="more">${rest}</div></div>`;
}
function setupMatches(){
  const HL=1, all=DATA.previews||[]; let cur='ALL';
  const render=sel=>{
    cur=sel; const fv=new Set(getFav());
    const rows=all.filter(q=>sel==='ALL'||(sel==='FAV'?(fv.has(q.home)||fv.has(q.away)):q.league===sel)), by={}; rows.forEach(q=>(by[q.date]=by[q.date]||[]).push(q));
    window.__ci=0; let h='', n=0; const mid=document.getElementById('ad-mid');
    const tp=document.getElementById('adday'), tpl=tp?[...tp.content.querySelectorAll('.adday')].map(x=>x.innerHTML):[]; let di=0;
    Object.keys(by).sort().forEach(d=>{const dd=new Date(d+'T00:00:00');
      if(tpl.length&&di>0){ h+=`<div class="adday">${tpl[pickAd(tpl.length)].replace(/ id="ad-x"/g,'')}</div>`; } di++;
      h+=`<div class="day">${d.slice(5).replace('-','/')} (${WD[dd.getDay()]}) · ${by[d].length}경기</div>`;
      by[d].forEach(q=>{ h+=matchCard(q,HL); n++; });});
    $('#list').innerHTML=h||(sel==='FAV'?'<div class="card mut">아직 보이는 내 팀 경기가 없어요. 경기 카드에서 팀 이름 옆 <b>☆</b>를 누르면 그 팀 경기만 모아 볼 수 있어요. (이 기기에만 저장됩니다)</div>':'<div class="card mut">표시할 예정 경기가 없습니다. (리그 휴식기이거나 일정 갱신 전일 수 있어요)</div>'); countUp($('#list')); syncFav();
  };
  const lv=document.getElementById('live'); if(lv) lv.innerHTML=`<span class="dot"></span>마지막 갱신 ${esc(DATA.generated)} · 매일 아침 자동 갱신`;
  const leagues=['ALL',...Object.keys(LG).filter(k=>all.some(q=>q.league===k))];
  $('#chips').innerHTML=leagues.map(k=>`<button type="button" class="chip" data-k="${k}" aria-pressed="${k==='ALL'}">${k==='ALL'?'전체':LG[k]}</button>`).join('')+'<button type="button" class="chip" data-k="FAV" aria-pressed="false">★ 내 팀<span id="favcnt"></span></button>';
  window.__onFav=function(){ if(cur==='FAV') render('FAV'); };
  $('#chips').onclick=e=>{const b=e.target.closest('.chip'); if(!b)return;
    document.querySelectorAll('#chips .chip').forEach(c=>c.setAttribute('aria-pressed',c===b)); render(b.dataset.k);};
  render('ALL');
}

/* ---------- 데이터센터 ---------- */
function setupData(){
  const keys=Object.keys(DATA.centers); let cur=keys[0];
  $('#chips').innerHTML=keys.map(k=>`<button type="button" class="chip" data-k="${k}" aria-pressed="${k===cur}">${LG[k]}</button>`).join('');
  const draw=()=>{
    const C=DATA.centers[cur];
    const tl=(n)=>{const k=C.teams.indexOf(n);return (k>=0&&C.slugs&&C.slugs[k]&&C.standings.some(r=>r[0]===n))?`<a href="team-${cur.toLowerCase()}-${C.slugs[k]}.html">${esc(n)}</a>`:esc(n);};
    const st=C.standings.map((r,i)=>`<tr><td>${i+1}</td><td class="tl">${tl(r[0])}</td><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td><td>${r[4]}</td><td>${r[5]}</td><td>${r[6]>0?'+':''}${r[6]}</td><td><b>${r[7]}</b></td></tr>`).join('');
    const rt=C.ratings.map((r,i)=>`<tr><td>${i+1}</td><td class="tl">${tl(r[0])}</td><td>${r[1]}</td><td>${r[2]}</td><td><b>${r[3]}</b></td></tr>`).join('');
    const opts=C.teams.map((t,i)=>`<option value="${i}">${esc(t)}</option>`).join('');
    $('#center').innerHTML=`
      <h2>${esc(LG[cur])} 순위표 <small class="mut">(이번 시즌 · ${C.standings.length?C.standings[0][1]+'경기 안팎':'자료 없음'})</small></h2>
      <div class="card scroll"><table class="ot"><thead><tr><th>#</th><th class="tl">팀</th><th>경기</th><th>승</th><th>무</th><th>패</th><th>득점</th><th>득실</th><th>승점</th></tr></thead><tbody>${st||'<tr><td colspan=9 class="mut">이번 시즌 경기 결과가 아직 없습니다.</td></tr>'}</tbody></table></div>
      <h2>팀 전력 지수 ${Q("AI가 과거 경기 결과로 계산한 팀의 힘입니다. 100이 리그 평균이고 높을수록 강합니다. 공격은 득점 능력, 수비는 실점을 막는 능력입니다.")} <small class="mut">(AI가 학습한 값 · 100 = 리그 평균)</small></h2>
      <div class="card scroll"><table class="ot"><thead><tr><th>#</th><th class="tl">팀</th><th>공격</th><th>수비</th><th>종합</th></tr></thead><tbody>${rt}</tbody></table>
      <div class="mut" style="margin-top:8px;font-size:12.5px">공격 지수가 높을수록 득점력이 좋고, 수비 지수가 높을수록 실점을 잘 막는다는 뜻입니다. 최근 경기에 더 큰 비중을 둡니다.</div></div>
      <h2>상대전적 조회</h2>
      <div class="card"><div class="row"><select id="ta">${opts}</select> <span>vs</span> <select id="tb">${opts}</select></div><div id="h2h" class="scroll"></div></div>`;
    const sel=()=>{const a=+$('#ta').value,b=+$('#tb').value; if(a===b){$('#h2h').innerHTML='<div class="mut">서로 다른 두 팀을 고르세요.</div>';return;}
      const rows=C.matches.filter(m=>(m[1]===a&&m[2]===b)||(m[1]===b&&m[2]===a)).sort((x,y)=>y[0].localeCompare(x[0])).slice(0,10);
      if(!rows.length){$('#h2h').innerHTML='<div class="mut">최근 4시즌 안에 맞대결 기록이 없습니다.</div>';return;}
      let w=[0,0,0]; rows.forEach(m=>{const [mine,oth]=m[1]===a?[m[3],m[4]]:[m[4],m[3]]; w[mine>oth?0:mine===oth?1:2]++;});
      $('#h2h').innerHTML=`<p><b>${esc(C.teams[a])}</b> 기준 최근 ${rows.length}경기: ${w[0]}승 ${w[1]}무 ${w[2]}패</p><table class="ot"><tbody>${rows.map(m=>`<tr><td>${esc(m[0])}</td><td class="tl">${esc(C.teams[m[1]])} <b>${m[3]} : ${m[4]}</b> ${esc(C.teams[m[2]])}</td></tr>`).join('')}</tbody></table>`;};
    $('#ta').value=0; $('#tb').value=Math.min(1,C.teams.length-1); $('#ta').onchange=$('#tb').onchange=sel; sel();
  };
  $('#chips').onclick=e=>{const b=e.target.closest('.chip'); if(!b)return; cur=b.dataset.k;
    document.querySelectorAll('#chips .chip').forEach(c=>c.setAttribute('aria-pressed',c===b)); draw();};
  draw();
}

/* ---------- AI 성적표 ---------- */
function calChart(cal){
  const W=420,H=420,L=46,B=44,T=12,R=14,cw=W-L-R,ch=H-T-B,X=v=>L+v*cw,Y=v=>T+(1-v)*ch;
  let s=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="예측 확률과 실제 발생 비율 비교 그래프" style="max-width:480px;width:100%">`;
  [0,.25,.5,.75,1].forEach(v=>{s+=`<line x1="${L}" x2="${W-R}" y1="${Y(v)}" y2="${Y(v)}" stroke="var(--line)"/><text x="${L-6}" y="${Y(v)+4}" text-anchor="end">${v*100}%</text><text x="${X(v)}" y="${H-B+16}" text-anchor="middle">${v*100}%</text>`;});
  s+=`<line x1="${X(0)}" y1="${Y(0)}" x2="${X(1)}" y2="${Y(1)}" stroke="var(--mut)" stroke-dasharray="5 4"/>`;
  s+=`<polyline fill="none" stroke="var(--hw)" stroke-width="2" points="${cal.map(c=>X(c.pred)+','+Y(c.actual)).join(' ')}"/>`;
  cal.forEach(c=>{s+=`<circle cx="${X(c.pred)}" cy="${Y(c.actual)}" r="5" fill="var(--hw)"><title>AI ${pct(c.pred,0)} → 실제 ${pct(c.actual,0)} (${c.n}건)</title></circle>`;});
  s+=`<text x="${(L+W-R)/2}" y="${H-6}" text-anchor="middle">AI가 말한 확률</text><text transform="translate(12 ${(T+H-B)/2}) rotate(-90)" text-anchor="middle">실제로 일어난 비율</text></svg>`;
  return s;
}
function setupScore(){
  const sc=DATA.scorecard; if(!sc){ $('#score').innerHTML='<div class="card mut">성적표를 아직 계산하지 못했습니다.</div>'; return; }
  const diff=(sc.acc-sc.acc_home)*100;
  const lg=Object.keys(sc.by_league).map(k=>{const r=sc.by_league[k];return `<div class="br"><span>${esc(LG[k]||k)}</span><div class="t"><div class="f" style="width:${(r.acc*100).toFixed(1)}%"></div><div class="ref" style="left:${(sc.acc_home*100).toFixed(1)}%"></div></div><span>${Math.round(r.acc*100)}% · ${r.n}경기</span></div>`;}).join('');
  $('#score').innerHTML=`<div class="stats">
    <div class="stat"><small>검증한 경기</small><b data-cu="${sc.n}" data-suf="경기" data-loc="1">${sc.n.toLocaleString()}경기</b><small>과거 경기를 그 경기 이전 자료만으로 예측</small></div>
    <div class="stat"><small>결과를 맞힌 비율</small><b data-cu="${(sc.acc*100).toFixed(1)}" data-dec="1" data-suf="%">${pct(sc.acc)}</b><small>가장 높게 본 결과가 실제로 나온 비율</small></div>
    <div class="stat"><small>비교: 무조건 홈승</small><b data-cu="${(sc.acc_home*100).toFixed(1)}" data-dec="1" data-suf="%">${pct(sc.acc_home)}</b><small>AI가 ${diff.toFixed(1)}%p ${diff>=0?'더 높아요':'낮아요'}</small></div>
    <div class="stat"><small>확률 정확도 개선</small><b>${sc.improve>=0?'+':''}${(sc.improve*100).toFixed(1)}%</b><small>과거 평균 비율로 찍는 방식 대비</small></div></div>
  <div class="card"><b>확률이 믿을 만한가?</b> <div class="mut" style="margin:4px 0 8px">점이 점선(완벽한 예측)에 가까울수록 AI가 말한 확률이 실제와 맞아요. AI가 "40%"라고 한 경기들에서 실제로 40% 정도 일어났다면 잘 맞는 거예요.</div>${calChart(sc.calibration)}</div>
  <div class="card"><b>리그별 맞힌 비율</b> <span class="mut">(세로선 = 무조건 홈승 비율 ${Math.round(sc.acc_home*100)}%)</span>${lg}</div>
  <p class="mut" style="font-size:12.5px">검증 기준일 ${esc(sc.stamp)} · 통계 AI의 추정 성능이며 미래 결과를 보장하지 않습니다.</p>`;
}
function countUp(root){
  if(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  (root||document).querySelectorAll('[data-cu]').forEach(el=>{
    const to=parseFloat(el.dataset.cu), dec=+(el.dataset.dec||0), pre=el.dataset.pre||'', suf=el.dataset.suf||'', loc=el.dataset.loc, t0=performance.now(), dur=1100;
    const fmt=v=>pre+(loc?Math.round(v).toLocaleString():v.toFixed(dec))+suf;
    const step=t=>{const k=Math.min(1,(t-t0)/dur), e=1-Math.pow(1-k,3); el.textContent=fmt(to*e); if(k<1) requestAnimationFrame(step); else el.textContent=fmt(to);};
    el.textContent=fmt(0); requestAnimationFrame(step);
  });
}
function scoreStrip(){
  const sc=DATA.scorecard; if(!sc||!sc.n) return;
  const d=(sc.acc-sc.acc_home)*100, host=document.getElementById('live')||document.querySelector('h1'); if(!host) return;
  const a=document.createElement('a'); a.className='scs'; a.href='score.html';
  a.innerHTML=`<span class="scs-t">AI 성적표 공개 중</span><span class="scs-b">과거 ${sc.n.toLocaleString()}경기 중 <b>${pct(sc.acc)}</b>의 결과를 맞혔어요 <span class="mut">(무조건 홈승 ${pct(sc.acc_home)}, ${d>=0?'+':''}${d.toFixed(1)}%p)</span></span><span class="scs-g">자세히 보기 →</span>`;
  host.insertAdjacentElement(host.id==='live'?'afterend':'afterend',a);
}
const page=document.body.dataset.page;
if(page==='matches'||page==='data') scoreStrip();
if(page==='match'){ const q=(DATA.previews||[])[0]; if(q){ window.__ci=0; $('#list').innerHTML=matchCard(q,1); countUp($('#list')); syncFav(); } } else if(page==='matches') setupMatches(); else if(page==='data') setupData(); else if(page==='score'){ setupScore(); countUp($('#score')); }

document.addEventListener('error',function(e){var t=e.target;if(t&&t.classList&&t.classList.contains('mascot')&&!/mascot\.svg$/.test(t.src)){t.src='mascot.svg';}},true);

/* 광고가 여러 개면 새로 열 때마다 무작위로 하나만 보여 줌 (같은 광고가 연속으로 나오지 않게) */
var __lastAd;
function pickAd(n){ if(n<2) return 0; let k; do{ k=Math.floor(Math.random()*n); }while(k===__lastAd); __lastAd=k; return k; }
document.querySelectorAll('.adset').forEach(function(s){ const a=[...s.children]; if(a.length>1){ const k=Math.floor(Math.random()*a.length); a.forEach(function(x,i){ if(i!==k) x.remove(); }); } });
