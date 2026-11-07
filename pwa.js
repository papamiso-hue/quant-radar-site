/* 홈 화면 추가(앱처럼 쓰기) 도우미: 서비스 워커 등록, 설치 버튼, 기기별 안내 펼치기 */
(function(){
  if('serviceWorker' in navigator && location.protocol==='https:'){ window.addEventListener('load',function(){ navigator.serviceWorker.register('sw.js').catch(function(){}); }); }
  var dp=null, btn=document.getElementById('pwa-install'), ok=document.getElementById('pwa-done');
  window.addEventListener('beforeinstallprompt',function(e){ e.preventDefault(); dp=e; if(btn) btn.hidden=false; });
  if(btn) btn.addEventListener('click',function(){ if(!dp) return; dp.prompt(); dp.userChoice.finally(function(){ dp=null; btn.hidden=true; }); });
  window.addEventListener('appinstalled',function(){ if(btn) btn.hidden=true; if(ok) ok.hidden=false; });
  var ua=navigator.userAgent||'', k=/iPhone|iPad|iPod/i.test(ua)?'ios':/Android/i.test(ua)?'android':'pc';
  var g=document.getElementById('g-'+k); if(g) g.setAttribute('open','');
  var me=document.getElementById('mydev'); if(me) me.textContent=k==='ios'?'지금 아이폰(아이패드)으로 보고 계시네요. 아래 "아이폰" 순서를 따라 해 주세요.':k==='android'?'지금 안드로이드 폰으로 보고 계시네요. 아래 "안드로이드" 순서를 따라 해 주세요.':'지금 컴퓨터로 보고 계시네요. 아래 "컴퓨터" 순서를 따라 해 주세요.';
  if(window.matchMedia && matchMedia('(display-mode: standalone)').matches){ var s=document.getElementById('standalone'); if(s) s.hidden=false; }
})();

/* ===== 모든 페이지 공통: 아래쪽 "앱 설치" 띠 (한 번 누르면 설치창, 아이폰은 순서 안내) ===== */
(function(){
  var ua=navigator.userAgent||'', ios=/iPhone|iPad|iPod/i.test(ua), android=/Android/i.test(ua);
  var inapp=/KAKAOTALK|NAVER\(inapp|Instagram|FBAN|FBAV|Line\/|DaumApps/i.test(ua);
  var standalone=(window.matchMedia&&matchMedia('(display-mode: standalone)').matches)||navigator.standalone===true;
  if(standalone||/install\.html$/.test(location.pathname)) return;
  var KEY='sl_ib_off';
  function off(){ try{ var t=+localStorage.getItem(KEY)||0; return Date.now()-t<7*864e5; }catch(e){ return false; } }
  function setOff(){ try{ localStorage.setItem(KEY,String(Date.now())); }catch(e){} }
  if(off()) return;
  var dp2=null, bar=null;
  function el(t,c,x){ var e=document.createElement(t); if(c) e.className=c; if(x!=null) e.textContent=x; return e; }
  function build(kind){
    if(bar) return; bar=el('div','ib'); bar.setAttribute('role','region'); bar.setAttribute('aria-label','앱 설치 안내');
    var ic=el('img','ib-ic'); ic.src='icon-192.png'; ic.alt=''; ic.width=40; ic.height=40;
    var tx=el('div','ib-tx'); tx.appendChild(el('b','', '스탯로그 앱 설치'));
    tx.appendChild(el('span','', kind==='inapp'?'지금 화면(카카오톡 등)에서는 설치가 안 돼요':kind==='ios'?'홈 화면에 추가하면 앱처럼 열려요':'누르면 휴대폰 홈 화면에 바로 설치돼요'));
    var go=el('button','ib-go', kind==='inapp'?'방법':kind==='ios'?'방법 보기':'설치'); go.type='button';
    var x=el('button','ib-x','✕'); x.type='button'; x.setAttribute('aria-label','닫기');
    bar.appendChild(ic); bar.appendChild(tx); bar.appendChild(go); bar.appendChild(x); document.body.appendChild(bar);
    document.body.classList.add('has-ib');
    x.addEventListener('click',function(){ setOff(); hide(); });
    go.addEventListener('click',function(){
      if(kind==='android'&&dp2){ dp2.prompt(); dp2.userChoice.finally(function(){ dp2=null; hide(); }); }
      else sheet(kind);
    });
  }
  function hide(){ if(bar){ bar.remove(); bar=null; document.body.classList.remove('has-ib'); } }
  function sheet(kind){
    var ov=el('div','ib-ov'); var bx=el('div','ib-box'); ov.appendChild(bx);
    var steps= kind==='ios'
      ? ['화면 맨 아래 가운데의 공유 버튼(네모 위로 화살표)을 누르세요. (사파리에서만 보여요)','메뉴를 위로 쓸어 올려 「홈 화면에 추가」를 누르세요.','오른쪽 위 「추가」를 누르면 홈 화면에 아이콘이 생겨요.']
      : kind==='inapp'
      ? ['오른쪽 위(또는 아래) 점 세 개 ⋮ 메뉴를 누르세요.','「다른 브라우저로 열기」 또는 「크롬으로 열기」를 고르세요.','크롬에서 열리면 아래 「설치」 띠가 나타나요. 누르면 설치됩니다.']
      : ['크롬 오른쪽 위 점 세 개 ⋮ 를 누르세요.','「홈 화면에 추가」 또는 「앱 설치」를 누르세요.','「설치」를 누르면 끝!'];
    bx.appendChild(el('h3','', kind==='ios'?'아이폰 홈 화면에 추가':kind==='inapp'?'다른 브라우저로 열어 주세요':'홈 화면에 설치'));
    var ol=el('ol'); steps.forEach(function(s){ ol.appendChild(el('li','',s)); }); bx.appendChild(ol);
    var a=el('a','ib-more','그림으로 자세히 보기 →'); a.href='install.html'; bx.appendChild(a);
    var c=el('button','ib-go','닫기'); c.type='button'; bx.appendChild(c);
    function close(){ ov.remove(); }
    c.addEventListener('click',close); ov.addEventListener('click',function(e){ if(e.target===ov) close(); });
    document.body.appendChild(ov);
  }
  window.addEventListener('beforeinstallprompt',function(e){ e.preventDefault(); dp2=e; if(!inapp) build('android'); });
  window.addEventListener('appinstalled',function(){ hide(); });
  if(inapp&&android) build('inapp');
  else if(ios&&!/CriOS|FxiOS|EdgiOS/i.test(ua)) build('ios');
  else if(ios) build('ios');
})();
