(function(){
'use strict';
const C=window.DM_CONFIG;
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const brl=n=>n.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const ic=(n,c)=>'<svg class="ic'+(c?' '+c:'')+'" aria-hidden="true" focusable="false"><use href="#i-'+n+'"/></svg>';
const FREE=C.compra.freteGratisAcima, NPAR=C.compra.parcelas, PIX=C.compra.descontoPix, CUPOM=C.compra.cupom;
const MENU=C.menu, P=C.produtos, R=C.avaliacoes;
const byId=id=>P.find(p=>p.id===id);

/* ---------- identidade: logo, nome, contato ---------- */
(function(){
  const rs=document.documentElement.style;
  rs.setProperty('--logo','url("data:image/png;base64,'+C.logo.completo+'")');
  rs.setProperty('--logo-d','url("data:image/png;base64,'+C.logo.monograma+'")');
  rs.setProperty('--ar',C.logo.proporcao);
  rs.setProperty('--ar-d',C.logo.proporcaoMonograma);
  const md=document.querySelector('meta[name="description"]')||document.head.appendChild(Object.assign(document.createElement('meta'),{name:'description'}));
  md.content=C.loja.descricao;
  $('#h1').textContent=C.loja.titulo;
  $('#brand').setAttribute('aria-label',C.loja.nome+', voltar ao topo');
  $('#ftLogo').setAttribute('aria-label',C.loja.nome);
  const wa='https://api.whatsapp.com/send?phone='+encodeURIComponent(C.contato.whatsapp.replace(/\D/g,''))+(C.contato.whatsappMensagem?'&text='+encodeURIComponent(C.contato.whatsappMensagem):'');
  ['#waFab','#ftWa','#mnWa','.hdr .help'].forEach(s=>{const a=$(s); if(a){a.href=wa;a.target='_blank';a.rel='noopener noreferrer';}});
  $('#ftWa strong').textContent=C.contato.whatsappExibir;
  $('#mnWa strong').textContent=C.contato.whatsappExibir;
  $('#ftMail').textContent=$('#mnMail').textContent=C.contato.email;
  $('#ftHours').textContent=$('#mnHours').textContent=C.contato.horario;
  $('#ftAbout').textContent=C.loja.sobre;
  $('#copy').textContent='© '+C.loja.ano+' '+C.loja.nome+'. Todos os direitos reservados. CNPJ '+C.loja.cnpj+' · '+C.loja.cidade;
  const u=(C.instagram.usuario||'').replace(/^@/,'').trim();
  const igUrl=u?'https://www.instagram.com/'+encodeURIComponent(u)+'/':'https://www.instagram.com/';
  $('#igHandle').textContent=u?'@'+u:'@seu_instagram';
  $('#igCap').textContent=C.instagram.legenda;
  $('#igText').textContent=C.instagram.texto;
  const il=$('#igLink'); il.href=igUrl; il.textContent=C.instagram.botao;
  $('#ftInsta').href=igUrl;
  if(C.instagram.fixo===false) $('#ig').hidden=true;
  const A=C.barraTopo;
  $('#announce').innerHTML=esc(A.antes)+' <b>'+esc(A.destaque)+'</b><span class="dm" aria-hidden="true"></span>'+esc(A.depois);
  $('#hdrLinks').innerHTML=C.linksCabecalho.map(t=>'<a href="#">'+t+'</a>').join('');
  $('#benefits').innerHTML=C.beneficios.map(x=>'<li>'+ic(x.icone)+'<span><strong>'+esc(x.titulo)+'</strong><small>'+esc(x.texto)+'</small></span></li>').join('');
  $$('[data-t]').forEach(el=>{el.textContent=C.secoes[el.dataset.t].titulo;});
  $$('[data-s]').forEach(el=>{el.textContent=C.secoes[el.dataset.s].sub;});
  $('#newsBtn').textContent=C.secoes.newsletter.botao;
  const col=c=>'<details open><summary>'+esc(c.titulo)+ic('chev')+'</summary><ul>'+c.links.map(l=>'<li><a href="#">'+esc(l)+'</a></li>').join('')+'</ul></details>';
  $('#ftCols1').innerHTML=C.rodape.colunas.slice(0,2).map(col).join('');
  $('#ftCols2').innerHTML=C.rodape.colunas.slice(2).map(col).join('');
  $('#pay').innerHTML=C.rodape.pagamentos.map(t=>'<span>'+esc(t)+'</span>').join('');
  $('#seals').innerHTML=C.rodape.selos.map(s=>'<span class="seal">'+ic(s.icone)+esc(s.texto)+'</span>').join('');
  $('#popT').textContent=C.compra.cupomTitulo;
  $('#popLead').textContent=C.compra.cupomTexto;
  $('#popCode').textContent=CUPOM;
})();

/* ---------- ilustração ou foto ---------- */
const STARS=Array(5).fill(ic('star')).join('');
function pic(shape,tone,img,variant,alt){
  if(img) return '<img class="art art-'+variant+'" src="'+esc(img)+'" alt="'+esc(alt||'')+'" loading="lazy" decoding="async">';
  return '<svg class="art art-'+variant+'" viewBox="0 0 200 260" style="--g:var(--'+tone+')" aria-hidden="true" focusable="false"><use href="#j-'+shape+'"/>'+(variant==='b'?'<use href="#j-'+shape+'" style="--pf:url(#pat-stripe)"/>':'')+'</svg>';
}
function art(p,v){
  if(v==='b'){
    if(p.imagem&&!p.imagem2) return '';
    return pic(p.forma,p.tom2||p.tom,p.imagem2,'b',p.nome);
  }
  return pic(p.forma,p.tom,p.imagem||(p.imagens&&p.imagens[0]),'a',p.nome);
}
/* faces da roleta: fotos do produto ou, sem foto, variações da ilustração */
function faces(p){
  const ph=(src,i,n)=>'<img class="ph" src="'+esc(src)+'" alt="'+esc(p.nome)+(n>1?', foto '+(i+1)+' de '+n:'')+'" loading="lazy" decoding="async">';
  const list=(p.imagens&&p.imagens.length)?p.imagens:[p.imagem,p.imagem2].filter(Boolean);
  if(list.length) return list.map((s,i)=>ph(s,i,list.length));
  const t2=p.tom2||p.tom;
  return [pic(p.forma,p.tom,'','a',p.nome),pic(p.forma,t2,'','b',p.nome),pic(p.forma,t2,'','a',p.nome)];
}
function roulette(p){
  const f=faces(p), n=f.length;
  /* raio do prisma em larguras do cartão: 1 / (2·tan(π/n)); com 2 faces vira um giro de 180° */
  const k=n>2?1/(2*Math.tan(Math.PI/n)):0;
  return '<div class="rl" data-n="'+n+'" data-step="0" style="--n:'+n+';--k:'+k.toFixed(4)+';--a:0">'+
    '<div class="rl-ring">'+f.map((h,i)=>'<div class="rl-face'+(i?'':' is-on')+'" style="--i:'+i+'"'+(i?' aria-hidden="true"':'')+'>'+h+'</div>').join('')+'</div>'+
  '</div>';
}
function rlControls(p,n){
  if(n<2) return '';
  return '<button type="button" class="rl-btn prev" data-rl="-1" aria-label="Foto anterior de '+esc(p.nome)+'">'+ic('left')+'</button>'+
    '<button type="button" class="rl-btn next" data-rl="1" aria-label="Próxima foto de '+esc(p.nome)+'">'+ic('right')+'</button>'+
    '<div class="rl-pips" aria-hidden="true">'+Array.from({length:n},(_,i)=>'<i'+(i?'':' class="on"')+'></i>').join('')+'</div>';
}
function spin(media,dir){
  const rl=$('.rl',media); if(!rl) return;
  const n=+rl.dataset.n, step=+rl.dataset.step+dir, cur=((step%n)+n)%n;
  rl.dataset.step=step;
  rl.style.setProperty('--a',String(-step*360/n));
  $$('.rl-face',rl).forEach((f,i)=>{f.classList.toggle('is-on',i===cur);i===cur?f.removeAttribute('aria-hidden'):f.setAttribute('aria-hidden','true');});
  $$('.rl-pips i',media).forEach((d,i)=>d.classList.toggle('on',i===cur));
}
const optLabel=p=>p.rotuloOpcao||'Tamanho';
const hasOpt=p=>Array.isArray(p.opcoes)&&p.opcoes.length>0;
const priceLines=p=>({inst:'<strong>'+NPAR+'x</strong> de <strong>'+brl(p.preco/NPAR)+'</strong> sem juros',pix:brl(p.preco*(1-PIX))+' no Pix'});
const meta=p=>'Cód. '+p.codigo+(p.material?' · '+p.material:'');

/* menu desktop e mobile */
$('#navList').innerHTML=MENU.map(m=>m.sub
  ?'<li class="nav-item"><a class="nav-link" href="#" aria-haspopup="true">'+esc(m.t)+ic('chev')+'</a><div class="sub"><ul>'+m.sub.map(s=>'<li><a href="#">'+esc(s)+'</a></li>').join('')+'</ul></div></li>'
  :'<li class="nav-item"><a class="nav-link" href="'+m.h+'">'+esc(m.t)+'</a></li>').join('');
$('#accList').innerHTML=MENU.map((m,i)=>m.sub
  ?'<li><button type="button" class="acc-btn" aria-expanded="false" aria-controls="acc'+i+'">'+esc(m.t)+ic('plus')+'</button><ul id="acc'+i+'" hidden><li><a href="#">Ver tudo</a></li>'+m.sub.map(s=>'<li><a href="#">'+esc(s)+'</a></li>').join('')+'</ul></li>'
  :'<li><a class="acc-link" href="'+m.h+'">'+esc(m.t)+'</a></li>').join('');
$('#accList').addEventListener('click',e=>{
  const b=e.target.closest('.acc-btn'); if(!b) return;
  const open=b.getAttribute('aria-expanded')==='true';
  b.setAttribute('aria-expanded',String(!open));
  $('#'+b.getAttribute('aria-controls')).hidden=open;
});
$$('[data-tab]').forEach(b=>b.addEventListener('click',()=>{
  $$('[data-tab]').forEach(x=>x.setAttribute('aria-selected',String(x===b)));
  $('#tab-cats').hidden=b.dataset.tab!=='cats';
  $('#tab-info').hidden=b.dataset.tab!=='info';
}));

/* cartões */
function card(p){
  const opts=hasOpt(p)?'<div class="sizes" aria-label="'+esc(optLabel(p))+' disponíveis">'+p.opcoes.map(s=>'<span>'+esc(s)+'</span>').join('')+'</div>':'';
  const pl=priceLines(p);
  const n=faces(p).length;
  return '<article class="card" data-id="'+p.id+'">'+
    '<div class="media">'+
      '<a class="media-link" href="#" data-qv="'+p.id+'" aria-label="Ver '+esc(p.nome)+'">'+roulette(p)+'</a>'+
      rlControls(p,n)+
      (p.etiqueta?'<span class="tag">'+esc(p.etiqueta)+'</span>':'')+
      '<button type="button" class="wish" data-id="'+p.id+'" aria-pressed="false" aria-label="Favoritar '+esc(p.nome)+'">'+ic('heart')+'</button>'+
      '<div class="actions"><button type="button" class="btn-mini" data-act="look">Olhar</button><button type="button" class="btn-mini solid" data-act="buy">Comprar</button></div>'+
    '</div>'+
    '<p class="code">'+esc(meta(p))+'</p>'+
    '<h3 class="p-title"><a href="#" data-qv="'+p.id+'">'+esc(p.nome)+'</a></h3>'+
    '<div class="stars" role="img" aria-label="Avaliação 5 de 5">'+STARS+'</div>'+
    '<p class="price">'+brl(p.preco)+'</p>'+
    '<p class="inst">'+pl.inst+'</p>'+
    '<p class="pix">'+pl.pix+'</p>'+opts+
    '<p class="more"><a href="#">+ '+esc(p.cat)+'</a></p>'+
  '</article>';
}
$('#trkNew').innerHTML=P.filter(p=>p.secao==='novos').slice(0,4).map(card).join('');
$('#trkBest').innerHTML=P.filter(p=>p.secao==='top').slice(0,4).map(card).join('');
/* arrastar para o lado gira a roleta no celular */
$$('.grid4 .media').forEach(m=>{
  if(!$('.rl-btn',m)) return;
  let x0=null;
  m.addEventListener('touchstart',e=>{x0=e.touches[0].clientX;},{passive:true});
  m.addEventListener('touchend',e=>{
    if(x0===null) return;
    const dx=e.changedTouches[0].clientX-x0; x0=null;
    if(Math.abs(dx)>40)spin(m,dx<0?1:-1);
  },{passive:true});
});
$('#trkRev').innerHTML=R.map(r=>'<article class="rev"><div class="stars" role="img" aria-label="5 de 5">'+STARS+'</div>'+(r.produto?'<p class="rev-p">'+esc(r.produto)+'</p>':'')+'<p class="rev-t">'+esc(r.texto)+'</p><p class="rev-n">'+esc(r.nome)+'</p></article>').join('');

/* faixa em loop */
(function(){
  const half=[0,1,2].map(()=>C.faixaLoop.map(m=>'<span class="m">'+esc(m)+'</span><span class="dm"></span>').join('')).join('');
  $('#loopTrack').innerHTML=half+half;
})();

/* mini grade do Instagram */
$('#igGrid').innerHTML=C.igGrade.map(g=>'<div>'+pic(g.forma,g.tom,g.imagem,'a','')+'</div>').join('');

/* hero montado a partir da configuração */
(function(){
  const n=C.hero.length;
  $('#heroTrack').innerHTML=C.hero.map((h,i)=>{
    const th=((h.tema||i+1)-1)%4+1;
    let art;
    if(h.imagem){
      art='<img src="'+esc(h.imagem)+'" alt="'+esc(h.descricaoImagem||'')+'" decoding="async"'+(i?' loading="lazy"':'')+'>';
    }else{
      const c=h.circulo;
      const fill=th===1?'var(--thread-soft)':(th===3?'var(--surface)':'var(--sf)');
      art='<svg viewBox="0 0 600 500" role="img" aria-label="'+esc(h.descricaoImagem||'Ilustração de joias com costura em fio')+'" style="--st:var(--sf)">'+
        (c?'<circle cx="'+c[0]+'" cy="'+c[1]+'" r="'+c[2]+'" fill="'+fill+'" opacity="'+(c[3]==null?1:c[3])+'"/>':'')+
        (h.itens||[]).map(it=>'<use href="#j-'+it[0]+'" x="'+it[1]+'" y="'+it[2]+'" width="'+it[3]+'" height="'+it[4]+'" style="--g:var(--'+it[5]+')"/>').join('')+
        (h.fio?'<path class="thread" d="'+h.fio+'" fill="none" stroke="'+(th===1||th===3?'var(--thread)':'var(--sa)')+'" stroke-width="2.6" stroke-linecap="round"/>':'')+
      '</svg>';
    }
    return '<div class="slide s'+th+'"'+((th===2||th===4)?' data-tone="inv"':'')+' role="group" aria-roledescription="slide" aria-label="'+(i+1)+' de '+n+'">'+
      '<div class="wrap slide-in"><div class="slide-copy"><p class="kicker">'+esc(h.kicker)+'</p>'+
      '<h2><span class="script">'+esc(h.script)+'</span><span class="ttl">'+esc(h.titulo)+'</span></h2><p>'+esc(h.texto)+'</p>'+
      '<a class="btn-solid" href="'+esc(h.link||'#')+'">'+esc(h.botao)+'</a></div><div class="slide-art">'+art+'</div></div></div>';
  }).join('');
})();

/* toast */
let tt;
function toast(msg){const el=$('#toast');el.textContent=msg;el.classList.add('show');clearTimeout(tt);tt=setTimeout(()=>el.classList.remove('show'),2800);}

/* camadas */
const stack=[];
function openLayer(id){
  const el=document.getElementById(id);
  if(!el||el.classList.contains('is-open')) return;
  el._ret=document.activeElement;
  el.hidden=false; void el.offsetWidth; el.classList.add('is-open');
  document.documentElement.classList.add('lock');
  stack.push(el);
  const f=Array.from(el.querySelectorAll('input,button,a[href]')).find(x=>x.offsetParent!==null);
  if(f) setTimeout(()=>f.focus({preventScroll:true}),30);
}
function closeLayer(el){
  if(typeof el==='string') el=document.getElementById(el);
  if(!el||!el.classList.contains('is-open')) return;
  el.classList.remove('is-open');
  const i=stack.indexOf(el); if(i>-1) stack.splice(i,1);
  setTimeout(()=>{if(!el.classList.contains('is-open')) el.hidden=true;},reduce?0:320);
  if(!stack.length) document.documentElement.classList.remove('lock');
  if(el.id==='news'){try{sessionStorage.setItem('dm-news','1')}catch(_){}}
  if(el._ret&&el._ret.focus) el._ret.focus({preventScroll:true});
}

/* busca */
const hdr=$('#hdr'), qIn=$('#q'), sBox=$('#suggest');
function renderSuggest(){
  const q=norm(qIn.value.trim());
  if(!q){
    sBox.innerHTML='<p class="pop-lbl">Mais buscados</p><div class="chips">'+C.buscasPopulares.map(t=>'<button type="button" data-term="'+t+'">'+t+'</button>').join('')+'</div>';
    return;
  }
  const list=P.filter(p=>norm(p.nome+' '+p.cat).includes(q)).slice(0,6);
  sBox.innerHTML=list.length
    ?'<p class="pop-lbl">Resultados</p><div class="suggest">'+list.map(p=>'<button type="button" data-qv="'+p.id+'"><span class="sg-th">'+art(p,'a')+'</span><span><strong>'+esc(p.nome)+'</strong><br><small>'+brl(p.preco)+'</small></span></button>').join('')+'</div>'
    :'<p class="sg-none">Nenhum resultado para “'+esc(qIn.value.trim())+'”.</p>';
}
function openSearch(){hdr.classList.add('search-open');$$('[data-search]').forEach(b=>b.setAttribute('aria-expanded','true'));renderSuggest();setTimeout(()=>qIn.focus(),30);}
function closeSearch(){hdr.classList.remove('search-open');$$('[data-search]').forEach(b=>b.setAttribute('aria-expanded','false'));}
qIn.addEventListener('input',renderSuggest);
$('#searchForm').addEventListener('submit',e=>{
  e.preventDefault();
  const q=norm(qIn.value.trim()); if(!q) return;
  const f=P.find(p=>norm(p.nome+' '+p.cat).includes(q));
  if(f){closeSearch();openQuick(f.id);} else toast('Nenhum resultado para essa busca.');
});

/* favoritos */
const wishes=new Set();
function toggleWish(id){
  const on=!wishes.has(id);
  on?wishes.add(id):wishes.delete(id);
  $$('.wish[data-id="'+id+'"]').forEach(b=>b.setAttribute('aria-pressed',String(on)));
  const n=wishes.size;
  $$('.wish-count').forEach(el=>{el.textContent=n;el.hidden=n===0;});
  toast(on?'Adicionado aos favoritos.':'Removido dos favoritos.');
}

/* sacola */
const cart=[];
function renderCart(){
  const n=cart.reduce((a,i)=>a+i.q,0);
  const sub=cart.reduce((a,i)=>a+i.q*byId(i.id).preco,0);
  $$('.cart-count').forEach(el=>{el.textContent=n;el.hidden=n===0;});
  $('#cartList').innerHTML=cart.map(it=>{
    const p=byId(it.id);
    return '<li><div class="ci-art">'+art(p,'a')+'</div><div><p class="ci-name">'+esc(p.nome)+'</p><p class="ci-meta">'+(it.size?esc(optLabel(p))+' '+esc(it.size)+' · ':'')+esc(meta(p))+'</p>'+
      '<div class="ci-row"><div class="qty"><button type="button" data-cq="dec" data-k="'+esc(it.k)+'" aria-label="Diminuir">'+ic('minus')+'</button><span>'+it.q+'</span><button type="button" data-cq="inc" data-k="'+esc(it.k)+'" aria-label="Aumentar">'+ic('plus')+'</button></div>'+
      '<span class="ci-price">'+brl(p.preco*it.q)+'</span><button type="button" class="ci-rm" data-cq="rm" data-k="'+esc(it.k)+'" aria-label="Remover '+esc(p.nome)+'">'+ic('trash')+'</button></div></div></li>';
  }).join('');
  $('#cartEmpty').hidden=n>0;
  $('#cartFoot').hidden=n===0;
  $('#cartSub').textContent=brl(sub);
  $('#shipFill').style.width=Math.min(100,sub/FREE*100)+'%';
  $('#shipMsg').innerHTML=n===0?'Frete grátis em compras acima de <strong>'+brl(FREE)+'</strong>':(sub>=FREE?'Você ganhou <strong>frete grátis</strong>.':'Faltam <strong>'+brl(FREE-sub)+'</strong> para o frete grátis.');
}
function addToCart(id,size){
  const k=id+'|'+size, it=cart.find(i=>i.k===k);
  if(it) it.q++; else cart.push({k,id,size,q:1});
  renderCart(); closeLayer('qv'); openLayer('cart');
}
$('#cartList').addEventListener('click',e=>{
  const b=e.target.closest('[data-cq]'); if(!b) return;
  const i=cart.findIndex(x=>x.k===b.dataset.k); if(i<0) return;
  if(b.dataset.cq==='inc') cart[i].q++;
  else if(b.dataset.cq==='dec'){cart[i].q--; if(cart[i].q<1) cart.splice(i,1);}
  else cart.splice(i,1);
  renderCart();
});
$('#checkout').addEventListener('click',()=>toast('Checkout de demonstração: nenhuma compra é processada aqui.'));

/* espiadinha */
let qv={id:0,size:''};
function openQuick(id){
  const p=byId(id); if(!p) return;
  qv={id,size:''};
  const pl=priceLines(p);
  $('#qvArt').innerHTML=art(p,'a');
  $('#qvTitle').textContent=p.nome;
  $('#qvCode').textContent=meta(p);
  $('#qvPrice').textContent=brl(p.preco);
  $('#qvInst').innerHTML=pl.inst;
  $('#qvPix').textContent=pl.pix;
  $('#qvSizesWrap').hidden=!hasOpt(p);
  $('#qvSizeLbl').textContent=optLabel(p);
  $('#qvSizes').innerHTML=hasOpt(p)?p.opcoes.map(s=>'<button type="button" class="size" aria-pressed="false" data-size="'+esc(s)+'">'+esc(s)+'</button>').join(''):'';
  $('#qvMsg').textContent='';
  const w=$('#qvWish'); w.dataset.id=id; w.setAttribute('aria-pressed',String(wishes.has(id)));
  openLayer('qv');
}
$('#qvSizes').addEventListener('click',e=>{
  const b=e.target.closest('.size'); if(!b) return;
  qv.size=b.dataset.size;
  $$('.size').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));
  $('#qvMsg').textContent='';
});
$('#qvAdd').addEventListener('click',()=>{
  const p=byId(qv.id);
  if(hasOpt(p)&&!qv.size){$('#qvMsg').textContent='Escolha o '+optLabel(p).toLowerCase()+' para continuar.';return;}
  addToCart(qv.id,qv.size);
});

/* carrosséis de rolagem */
function initCar(root,auto){
  const tr=$('.car-track',root), prev=$('.prev',root), next=$('.next',root), dots=$('.car-dots',root);
  let pages=1, page=0, raf=0, paused=false;
  const gap=()=>parseFloat(getComputedStyle(tr).columnGap)||0;
  function sync(){
    const g=gap();
    page=Math.min(pages-1,Math.max(0,Math.round(tr.scrollLeft/(tr.clientWidth+g))));
    $$('button',dots).forEach((b,k)=>b.setAttribute('aria-current',String(k===page)));
    prev.disabled=tr.scrollLeft<=2;
    next.disabled=tr.scrollLeft+tr.clientWidth>=tr.scrollWidth-2;
  }
  function go(i){
    const g=gap();
    tr.scrollTo({left:Math.max(0,i)*(tr.clientWidth+g),behavior:reduce?'auto':'smooth'});
  }
  function build(){
    const g=gap(), cw=tr.clientWidth||1;
    pages=Math.max(1,Math.round((tr.scrollWidth+g)/(cw+g)));
    dots.innerHTML='';
    for(let i=0;i<pages;i++){
      const b=document.createElement('button');
      b.type='button'; b.setAttribute('aria-label','Página '+(i+1));
      b.addEventListener('click',()=>go(i));
      dots.appendChild(b);
    }
    dots.hidden=pages<2;
    const m=$('.media',tr);
    root.style.setProperty('--ay',m?(m.offsetHeight/2)+'px':'50%');
    sync();
  }
  tr.addEventListener('scroll',()=>{cancelAnimationFrame(raf);raf=requestAnimationFrame(sync);},{passive:true});
  prev.addEventListener('click',()=>go(page-1));
  next.addEventListener('click',()=>go(page+1));
  if(window.ResizeObserver) new ResizeObserver(build).observe(tr); else {build();window.addEventListener('resize',build);}
  if(auto&&!reduce){
    root.addEventListener('mouseenter',()=>{paused=true});
    root.addEventListener('mouseleave',()=>{paused=false});
    root.addEventListener('focusin',()=>{paused=true});
    root.addEventListener('focusout',()=>{paused=false});
    setInterval(()=>{if(!paused&&pages>1) go(page+1>=pages?0:page+1);},5000);
  }
}
initCar($('#carRev'),true);

/* hero */
(function(){
  const hero=$('#hero'), track=$('.hero-track',hero), slides=$$('.slide',hero), box=$('#heroDots');
  let i=0, timer;
  slides.forEach((s,k)=>{
    const b=document.createElement('button');
    b.type='button'; b.setAttribute('aria-label','Ir para o slide '+(k+1));
    b.addEventListener('click',()=>{go(k);play();});
    box.appendChild(b);
  });
  function go(n){
    i=(n+slides.length)%slides.length;
    track.style.transform='translateX('+(-i*100)+'%)';
    $$('button',box).forEach((b,k)=>b.setAttribute('aria-current',String(k===i)));
    hero.dataset.tone=slides[i].dataset.tone||'';
    slides.forEach((s,k)=>{s.inert=k!==i;});
  }
  function stop(){clearInterval(timer);}
  function play(){stop();if(reduce)return;timer=setInterval(()=>go(i+1),5500);}
  $('.prev',hero).addEventListener('click',()=>{go(i-1);play();});
  $('.next',hero).addEventListener('click',()=>{go(i+1);play();});
  hero.addEventListener('mouseenter',stop);
  hero.addEventListener('mouseleave',play);
  hero.addEventListener('focusin',stop);
  hero.addEventListener('focusout',play);
  let x0=null;
  hero.addEventListener('touchstart',e=>{x0=e.touches[0].clientX;},{passive:true});
  hero.addEventListener('touchend',e=>{
    if(x0===null) return;
    const dx=e.changedTouches[0].clientX-x0; x0=null;
    if(Math.abs(dx)>50){go(dx<0?i+1:i-1);play();}
  },{passive:true});
  go(0); play();
})();

/* instagram fixo */
(function(){
  const ig=$('#ig'), btn=$('#igBtn');
  function set(o){ig.classList.toggle('open',o);btn.setAttribute('aria-expanded',String(o));}
  btn.addEventListener('click',()=>set(!ig.classList.contains('open')));
  $('#igClose').addEventListener('click',()=>{set(false);btn.focus();});
})();

/* voltar ao topo */
const up=$('#toTop');
window.addEventListener('scroll',()=>{up.classList.toggle('show',window.scrollY>600);},{passive:true});
up.addEventListener('click',()=>window.scrollTo({top:0,behavior:reduce?'auto':'smooth'}));

/* rodapé em acordeão no celular */
(function(){
  const mq=window.matchMedia('(min-width:701px)');
  const sync=()=>$$('.ft details').forEach(d=>{d.open=mq.matches;});
  if(mq.addEventListener) mq.addEventListener('change',sync); else mq.addListener(sync);
  sync();
})();

/* formulários de exemplo */
$('#newsForm').addEventListener('submit',e=>{e.preventDefault();e.target.reset();toast('Cadastro de exemplo. Esta página não envia e-mails.');});
$('#trackForm').addEventListener('submit',e=>{e.preventDefault();e.target.reset();toast('Rastreio de exemplo. Conecte ao sistema de pedidos da loja.');});
$('#loginForm').addEventListener('submit',e=>{e.preventDefault();e.target.reset();closeLayer('login');toast('Login de exemplo. Conecte ao cadastro de clientes da loja.');});
$('#popFormEl').addEventListener('submit',e=>{e.preventDefault();$('#popForm').hidden=true;$('#popDone').hidden=false;});
$('#copyCoupon').addEventListener('click',()=>{
  const ok=()=>toast('Cupom copiado.');
  const fail=()=>toast('Copie o cupom manualmente: '+CUPOM);
  if(navigator.clipboard&&navigator.clipboard.writeText) navigator.clipboard.writeText(CUPOM).then(ok,fail); else fail();
});

/* cliques globais */
document.addEventListener('click',e=>{
  const t=e.target; let el;
  if(hdr.classList.contains('search-open')&&!t.closest('#hdr')&&!t.closest('[data-search]')) closeSearch();
  if((el=t.closest('[data-rl]'))){spin(el.closest('.media'),+el.dataset.rl);return;}
  if((el=t.closest('[data-term]'))){qIn.value=el.dataset.term;renderSuggest();qIn.focus();return;}
  if((el=t.closest('[data-qv]'))){e.preventDefault();closeSearch();openQuick(+el.dataset.qv);return;}
  if((el=t.closest('[data-act]'))){
    const id=+el.closest('.card').dataset.id, p=byId(id);
    if(el.dataset.act==='buy'&&!hasOpt(p)) addToCart(id,''); else openQuick(id);
    return;
  }
  if((el=t.closest('.wish[data-id]'))){toggleWish(+el.dataset.id);return;}
  if((el=t.closest('[data-open]'))){
    e.preventDefault();
    const cur=el.closest('.layer'); if(cur) closeLayer(cur);
    closeSearch(); openLayer(el.dataset.open); return;
  }
  if((el=t.closest('[data-close]'))){closeLayer(el.closest('.layer'));return;}
  if((el=t.closest('[data-search]'))){hdr.classList.contains('search-open')?closeSearch():openSearch();return;}
  if((el=t.closest('[data-wishlist]'))){const n=wishes.size;toast(n?'Você tem '+n+(n>1?' favoritos.':' favorito.'):'Toque no coração de uma peça para favoritar.');return;}
  if((el=t.closest('a'))){
    const h=el.getAttribute('href');
    if(h==='#'){e.preventDefault();toast('Link de exemplo desta página de demonstração.');}
    else if(h&&h.charAt(0)==='#'&&el.closest('.layer')) closeLayer(el.closest('.layer'));
  }
});

/* teclado */
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){
    if(stack.length) closeLayer(stack[stack.length-1]);
    else if(hdr.classList.contains('search-open')) closeSearch();
    else if($('#ig').classList.contains('open')){$('#ig').classList.remove('open');$('#igBtn').setAttribute('aria-expanded','false');}
  }
  if(e.key==='Tab'&&stack.length){
    const top=stack[stack.length-1];
    const f=$$('a[href],button:not([disabled]),input,select,textarea',top).filter(x=>x.offsetParent!==null);
    if(!f.length) return;
    const a=f[0], b=f[f.length-1];
    if(e.shiftKey&&document.activeElement===a){e.preventDefault();b.focus();}
    else if(!e.shiftKey&&document.activeElement===b){e.preventDefault();a.focus();}
  }
});


/* popup de cupom, uma vez por sessão */
(function(){
  const ms=C.compra.cupomAtrasoMs;
  if(!ms) return;
  let seen=false; try{seen=sessionStorage.getItem('dm-news')==='1';}catch(_){}
  if(!seen) setTimeout(()=>{if(!stack.length) openLayer('news');},ms);
})();

renderCart();
})();
