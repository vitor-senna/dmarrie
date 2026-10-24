/* =====================================================================================================
   D'marrie joias · comportamento da página
   Monta tudo a partir de window.DM_CONFIG (config.js). Ordem: utilitários · identidade · cabeçalho e menu ·
   carrossel principal · produtos e carrossel de fotos · faixas e depoimentos · rodapé · janelas · busca ·
   favoritos · sacola · espiadinha · cliques e teclado
   ===================================================================================================== */
(function () {
'use strict';

const C = window.DM_CONFIG;
const P = C.produtos;

/* ---------- utilitários ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const norm = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const brl = n => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const icon = (name, cls) => '<svg class="ic' + (cls ? ' ' + cls : '') + '" aria-hidden="true" focusable="false"><use href="#i-' + name + '"/></svg>';
const STARS = Array(5).fill(icon('star')).join('');
const byId = id => P.find(p => p.id === id);
const fotos = p => (Array.isArray(p.fotos) ? p.fotos.filter(Boolean) : []);
const hasOpt = p => Array.isArray(p.opcoes) && p.opcoes.length > 0;
const optLabel = p => p.rotuloOpcao || 'Tamanho';
const meta = p => 'Cód. ' + p.codigo + (p.material ? ' · ' + p.material : '');
const installments = p => '<strong>' + C.compra.parcelas + 'x</strong> de <strong>' + brl(p.preco / C.compra.parcelas) + '</strong> sem juros';
const pixPrice = p => brl(p.preco * (1 - C.compra.descontoPix)) + ' no Pix';
const setAll = (sel, fn) => $$(sel).forEach(fn);

/* ilustração em fio tracejado (sprite do index.html) */
function drawing(shape, tone, striped) {
  return '<svg class="art" viewBox="0 0 200 260" style="--g:var(--' + tone + ')" aria-hidden="true" focusable="false">' +
    '<use href="#j-' + shape + '"/>' + (striped ? '<use href="#j-' + shape + '" style="--pf:url(#pat-stripe)"/>' : '') + '</svg>';
}
/* miniatura usada na busca e na sacola: primeira foto ou a ilustração */
function thumb(p) {
  const f = fotos(p)[0];
  return f ? '<img class="art cover" src="' + esc(f) + '" alt="" loading="lazy" decoding="async">' : drawing(p.forma, p.tom);
}

/* ---------- identidade: logo, textos, contato ---------- */
(function identity() {
  const root = document.documentElement.style;
  root.setProperty('--logo', 'url("data:image/png;base64,' + C.logo.completo + '")');
  root.setProperty('--logo-d', 'url("data:image/png;base64,' + C.logo.monograma + '")');
  root.setProperty('--ar', C.logo.proporcao);
  root.setProperty('--ar-d', C.logo.proporcaoMonograma);

  $('meta[name="description"]').content = C.loja.descricao;
  $('#h1').textContent = C.loja.titulo;
  $('#brand').setAttribute('aria-label', C.loja.nome + ', voltar ao topo');
  $('#ftLogo').setAttribute('aria-label', C.loja.nome);
  $('#ftAbout').textContent = C.loja.sobre;
  $('#copy').textContent = '© ' + C.loja.ano + ' ' + C.loja.nome + '. Todos os direitos reservados. CNPJ ' + C.loja.cnpj + ' · ' + C.loja.cidade;

  const k = C.contato;
  const wa = 'https://api.whatsapp.com/send?phone=' + encodeURIComponent(k.whatsapp.replace(/\D/g, '')) +
    (k.whatsappMensagem ? '&text=' + encodeURIComponent(k.whatsappMensagem) : '');
  setAll('[data-wa], .hdr .help', a => { a.href = wa; a.target = '_blank'; a.rel = 'noopener noreferrer'; });
  setAll('[data-wa-text]', el => { el.textContent = k.whatsappExibir; });
  setAll('[data-mail]', el => { el.textContent = k.email; });
  setAll('[data-hours]', el => { el.textContent = k.horario; });

  const A = C.barraTopo;
  $('#announce').innerHTML = esc(A.antes) + ' <b>' + esc(A.destaque) + '</b><span class="dm" aria-hidden="true"></span>' + esc(A.depois);
  $('#hdrLinks').innerHTML = C.linksCabecalho.map(t => '<a href="#">' + t + '</a>').join('');
  $('#benefits').innerHTML = C.beneficios.map(b =>
    '<li>' + icon(b.icone) + '<span><strong>' + esc(b.titulo) + '</strong><small>' + esc(b.texto) + '</small></span></li>').join('');
  setAll('[data-title]', el => { el.textContent = C.secoes[el.dataset.title].titulo; });
  setAll('[data-sub]', el => { el.textContent = C.secoes[el.dataset.sub].sub; });
  $('#newsBtn').textContent = C.secoes.newsletter.botao;

  $('#popT').textContent = C.compra.cupomTitulo;
  $('#popLead').textContent = C.compra.cupomTexto;
  $('#popCode').textContent = C.compra.cupom;
})();

/* ---------- menu: categorias (computador) e menu lateral (celular) ---------- */
$('#navList').innerHTML = C.menu.map(m => m.sub
  ? '<li class="nav-item"><a class="nav-link" href="#" aria-haspopup="true">' + esc(m.t) + icon('chev') + '</a>' +
    '<div class="sub"><ul>' + m.sub.map(s => '<li><a href="#">' + esc(s) + '</a></li>').join('') + '</ul></div></li>'
  : '<li class="nav-item"><a class="nav-link" href="' + m.h + '">' + esc(m.t) + '</a></li>').join('');

$('#accList').innerHTML = C.menu.map((m, i) => m.sub
  ? '<li><button type="button" class="acc-btn" aria-expanded="false" aria-controls="acc' + i + '">' + esc(m.t) + icon('plus') + '</button>' +
    '<ul id="acc' + i + '" hidden><li><a href="#">Ver tudo</a></li>' + m.sub.map(s => '<li><a href="#">' + esc(s) + '</a></li>').join('') + '</ul></li>'
  : '<li><a class="acc-link" href="' + m.h + '">' + esc(m.t) + '</a></li>').join('');

$('#accList').addEventListener('click', e => {
  const b = e.target.closest('.acc-btn');
  if (!b) return;
  const open = b.getAttribute('aria-expanded') === 'true';
  b.setAttribute('aria-expanded', String(!open));
  document.getElementById(b.getAttribute('aria-controls')).hidden = open;
});
setAll('[data-tab]', b => b.addEventListener('click', () => {
  setAll('[data-tab]', x => x.setAttribute('aria-selected', String(x === b)));
  $('#tab-cats').hidden = b.dataset.tab !== 'cats';
  $('#tab-info').hidden = b.dataset.tab !== 'info';
}));

/* ---------- carrossel principal ---------- */
(function hero() {
  const hero = $('#hero'), track = $('#heroTrack'), dots = $('#heroDots');
  const n = C.hero.length;

  track.innerHTML = C.hero.map((h, i) => {
    const th = ((h.tema || i + 1) - 1) % 4 + 1;
    let art;
    if (h.imagem) {
      art = '<img src="' + esc(h.imagem) + '" alt="' + esc(h.descricaoImagem || '') + '" decoding="async"' + (i ? ' loading="lazy"' : '') + '>';
    } else {
      const c = h.circulo;
      const fill = th === 1 ? 'var(--thread-soft)' : th === 3 ? 'var(--surface)' : 'var(--sf)';
      art = '<svg viewBox="0 0 600 500" role="img" aria-label="' + esc(h.descricaoImagem || 'Ilustração de joias com costura em fio') + '" style="--st:var(--sf)">' +
        (c ? '<circle cx="' + c[0] + '" cy="' + c[1] + '" r="' + c[2] + '" fill="' + fill + '" opacity="' + (c[3] == null ? 1 : c[3]) + '"/>' : '') +
        (h.itens || []).map(it => '<use href="#j-' + it[0] + '" x="' + it[1] + '" y="' + it[2] + '" width="' + it[3] + '" height="' + it[4] + '" style="--g:var(--' + it[5] + ')"/>').join('') +
        (h.fio ? '<path class="thread" d="' + h.fio + '" fill="none" stroke="' + (th === 1 || th === 3 ? 'var(--thread)' : 'var(--sa)') + '" stroke-width="2.6" stroke-linecap="round"/>' : '') +
        '</svg>';
    }
    return '<div class="slide s' + th + '"' + (th === 2 || th === 4 ? ' data-tone="inv"' : '') + ' role="group" aria-roledescription="slide" aria-label="' + (i + 1) + ' de ' + n + '">' +
      '<div class="wrap slide-in"><div class="slide-copy"><p class="kicker">' + esc(h.kicker) + '</p>' +
      '<h2><span class="script">' + esc(h.script) + '</span><span class="ttl">' + esc(h.titulo) + '</span></h2>' +
      '<p class="slide-text">' + esc(h.texto) + '</p><a class="btn-solid" href="' + esc(h.link || '#') + '">' + esc(h.botao) + '</a></div>' +
      '<div class="slide-art">' + art + '</div></div></div>';
  }).join('');

  const slides = $$('.slide', track);
  dots.innerHTML = slides.map((_, k) => '<button type="button" aria-label="Ir para o slide ' + (k + 1) + '"></button>').join('');
  let cur = 0, timer = 0;

  function go(i) {
    cur = (i + n) % n;
    track.style.transform = 'translateX(' + (-cur * 100) + '%)';
    $$('button', dots).forEach((b, k) => b.setAttribute('aria-current', String(k === cur)));
    hero.dataset.tone = slides[cur].dataset.tone || '';
    slides.forEach((s, k) => { s.inert = k !== cur; });
  }
  const stop = () => clearInterval(timer);
  const play = () => { stop(); if (!reduceMotion) timer = setInterval(() => go(cur + 1), 5500); };

  dots.addEventListener('click', e => {
    const b = e.target.closest('button');
    if (b) { go($$('button', dots).indexOf(b)); play(); }
  });
  $('.prev', hero).addEventListener('click', () => { go(cur - 1); play(); });
  $('.next', hero).addEventListener('click', () => { go(cur + 1); play(); });
  hero.addEventListener('mouseenter', stop);
  hero.addEventListener('mouseleave', play);
  hero.addEventListener('focusin', stop);
  hero.addEventListener('focusout', play);

  let x0 = null;
  hero.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
  hero.addEventListener('touchend', e => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    x0 = null;
    if (Math.abs(dx) > 50) { go(dx < 0 ? cur + 1 : cur - 1); play(); }
  }, { passive: true });

  go(0);
  play();
})();

/* ---------- carrossel de fotos (cartões e espiadinha) ----------
   A faixa .gal-track rola de forma nativa. As setas e os pontinhos calculam a foto de destino e mandam
   a faixa rolar; o evento de rolagem atualiza os pontinhos, inclusive quando a pessoa arrasta com o dedo. */
function gallery(p) {
  const list = fotos(p);
  const total = list.length || C.fotosVazias || 3;
  const slides = [];
  for (let i = 0; i < total; i++) {
    slides.push(list.length
      ? '<div class="gal-slide"><img src="' + esc(list[i]) + '" alt="' + esc(p.nome) + ', foto ' + (i + 1) + ' de ' + total + '"' +
        (i ? ' loading="lazy"' : '') + ' decoding="async" draggable="false"></div>'
      : '<div class="gal-slide gal-empty">' + icon('camera') + '<span>Foto ' + (i + 1) + '</span></div>');
  }
  return '<div class="gal" data-gal aria-roledescription="carrossel" aria-label="Fotos de ' + esc(p.nome) + '">' +
    '<div class="gal-track">' + slides.join('') + '</div>' +
    (total > 1
      ? '<button type="button" class="gal-btn prev" data-gal-step="-1" aria-label="Foto anterior">' + icon('left') + '</button>' +
        '<button type="button" class="gal-btn next" data-gal-step="1" aria-label="Próxima foto">' + icon('right') + '</button>' +
        '<div class="gal-dots">' + slides.map((_, i) => '<button type="button" data-gal-to="' + i + '" aria-label="Foto ' + (i + 1) + '"' +
          (i ? '' : ' aria-current="true"') + '></button>').join('') + '</div>'
      : '') +
    '</div>';
}
function galIndex(track) {
  return Math.round(track.scrollLeft / (track.clientWidth || 1));
}
function galDots(gal, i) {
  $$('.gal-dots button', gal).forEach((b, k) => b.setAttribute('aria-current', String(k === i)));
}
function galGo(gal, i) {
  const track = $('.gal-track', gal);
  const n = track.children.length;
  const to = (i + n) % n;                       /* passa da última para a primeira e vice-versa */
  track.scrollTo({ left: to * track.clientWidth, behavior: reduceMotion ? 'auto' : 'smooth' });
  galDots(gal, to);
}
/* a rolagem não "borbulha", por isso a escuta é feita na fase de captura, uma vez para todas as faixas */
document.addEventListener('scroll', e => {
  const t = e.target;
  if (!(t instanceof Element) || !t.classList.contains('gal-track')) return;
  cancelAnimationFrame(t._raf);
  t._raf = requestAnimationFrame(() => galDots(t.parentElement, galIndex(t)));
}, true);

/* ---------- produtos ---------- */
function card(p) {
  const sizes = hasOpt(p)
    ? '<div class="sizes" aria-label="' + esc(optLabel(p)) + ' disponíveis">' + p.opcoes.map(s => '<span>' + esc(s) + '</span>').join('') + '</div>'
    : '';
  return '<article class="card" data-id="' + p.id + '">' +
    '<div class="media">' + gallery(p) +
      (p.etiqueta ? '<span class="tag">' + esc(p.etiqueta) + '</span>' : '') +
      '<button type="button" class="wish" data-wish="' + p.id + '" aria-pressed="false" aria-label="Favoritar ' + esc(p.nome) + '">' + icon('heart') + '</button>' +
      '<div class="actions"><button type="button" class="btn-mini" data-look="' + p.id + '">Olhar</button>' +
      '<button type="button" class="btn-mini solid" data-buy="' + p.id + '">Comprar</button></div>' +
    '</div>' +
    '<p class="code">' + esc(meta(p)) + '</p>' +
    '<h3 class="p-title"><a href="#" data-look="' + p.id + '">' + esc(p.nome) + '</a></h3>' +
    '<div class="stars" role="img" aria-label="Avaliação 5 de 5">' + STARS + '</div>' +
    '<p class="price">' + brl(p.preco) + '</p>' +
    '<p class="inst">' + installments(p) + '</p>' +
    '<p class="pix">' + pixPrice(p) + '</p>' + sizes +
    '<p class="more"><a href="#">+ ' + esc(p.cat) + '</a></p>' +
  '</article>';
}
/* 4 produtos de cada seção na página principal */
setAll('[data-products]', grid => {
  grid.innerHTML = P.filter(p => p.secao === grid.dataset.products).slice(0, 4).map(card).join('');
});

/* ---------- faixa em loop, depoimentos e Instagram ---------- */
(function strips() {
  const half = [0, 1, 2].map(() => C.faixaLoop.map(m => '<span class="m">' + esc(m) + '</span><span class="dm"></span>').join('')).join('');
  $('#loopTrack').innerHTML = half + half;

  $('#reviewTrack').innerHTML = C.avaliacoes.map(r =>
    '<article class="rev"><div class="stars" role="img" aria-label="5 de 5">' + STARS + '</div>' +
    (r.produto ? '<p class="rev-p">' + esc(r.produto) + '</p>' : '') +
    '<p class="rev-t">' + esc(r.texto) + '</p><p class="rev-n">' + esc(r.nome) + '</p></article>').join('');

  const ig = C.instagram;
  const user = (ig.usuario || '').replace(/^@/, '').trim();
  const url = 'https://www.instagram.com/' + (user ? encodeURIComponent(user) + '/' : '');
  $('#igHandle').textContent = user ? '@' + user : '@seu_instagram';
  $('#igCap').textContent = ig.legenda;
  $('#igText').textContent = ig.texto;
  const link = $('#igLink');
  link.href = url;
  link.textContent = ig.botao;
  $('#ftInsta').href = url;
  $('#igGrid').innerHTML = C.igGrade.map(g => '<div>' + (g.imagem ? '<img class="art cover" src="' + esc(g.imagem) + '" alt="">' : drawing(g.forma, g.tom)) + '</div>').join('');
  if (ig.fixo === false) $('#ig').hidden = true;
})();

/* trilho de depoimentos: rola por páginas e passa sozinho a cada 5 s */
(function rail(root) {
  const track = $('.rail-track', root), prev = $('.prev', root), next = $('.next', root), dots = $('.rail-dots', root);
  let pages = 1, page = 0, paused = false, raf = 0;
  const gap = () => parseFloat(getComputedStyle(track).columnGap) || 0;
  const step = () => track.clientWidth + gap();

  function sync() {
    page = Math.min(pages - 1, Math.max(0, Math.round(track.scrollLeft / step())));
    $$('button', dots).forEach((b, k) => b.setAttribute('aria-current', String(k === page)));
    prev.disabled = track.scrollLeft <= 2;
    next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
  }
  const go = i => track.scrollTo({ left: Math.max(0, i) * step(), behavior: reduceMotion ? 'auto' : 'smooth' });
  function build() {
    pages = Math.max(1, Math.round((track.scrollWidth + gap()) / step()));
    dots.innerHTML = Array.from({ length: pages }, (_, i) => '<button type="button" aria-label="Página ' + (i + 1) + '"></button>').join('');
    dots.hidden = pages < 2;
    sync();
  }
  dots.addEventListener('click', e => { const b = e.target.closest('button'); if (b) go($$('button', dots).indexOf(b)); });
  track.addEventListener('scroll', () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(sync); }, { passive: true });
  prev.addEventListener('click', () => go(page - 1));
  next.addEventListener('click', () => go(page + 1));
  if (window.ResizeObserver) new ResizeObserver(build).observe(track); else { build(); window.addEventListener('resize', build); }

  if (!reduceMotion) {
    ['mouseenter', 'focusin'].forEach(ev => root.addEventListener(ev, () => { paused = true; }));
    ['mouseleave', 'focusout'].forEach(ev => root.addEventListener(ev, () => { paused = false; }));
    setInterval(() => { if (!paused && pages > 1) go(page + 1 >= pages ? 0 : page + 1); }, 5000);
  }
})($('#reviews'));

/* ---------- rodapé ---------- */
(function footer() {
  const col = c => '<details open><summary>' + esc(c.titulo) + icon('chev') + '</summary><ul>' +
    c.links.map(l => '<li><a href="#">' + esc(l) + '</a></li>').join('') + '</ul></details>';
  $('#ftCols1').innerHTML = C.rodape.colunas.slice(0, 2).map(col).join('');
  $('#ftCols2').innerHTML = C.rodape.colunas.slice(2).map(col).join('');
  $('#pay').innerHTML = C.rodape.pagamentos.map(t => '<span>' + esc(t) + '</span>').join('');
  $('#seals').innerHTML = C.rodape.selos.map(s => '<span class="seal">' + icon(s.icone) + esc(s.texto) + '</span>').join('');

  /* no celular as colunas viram acordeão */
  const desktop = window.matchMedia('(min-width:701px)');
  const sync = () => setAll('.ft details', d => { d.open = desktop.matches; });
  desktop.addEventListener ? desktop.addEventListener('change', sync) : desktop.addListener(sync);
  sync();
})();

/* ---------- avisos ---------- */
let toastTimer = 0;
function toast(msg) {
  const el = $('#toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2800);
}

/* ---------- janelas (menu, sacola, espiadinha, login, cupom) ---------- */
const stack = [];
function openLayer(id) {
  const el = document.getElementById(id);
  if (!el || el.classList.contains('is-open')) return;
  el._back = document.activeElement;
  el.hidden = false;
  void el.offsetWidth;                          /* garante a transição de entrada */
  el.classList.add('is-open');
  document.documentElement.classList.add('lock');
  stack.push(el);
  const first = $$('input,button,a[href]', el).find(x => x.offsetParent !== null);
  if (first) setTimeout(() => first.focus({ preventScroll: true }), 30);
}
function closeLayer(el) {
  if (typeof el === 'string') el = document.getElementById(el);
  if (!el || !el.classList.contains('is-open')) return;
  el.classList.remove('is-open');
  stack.splice(stack.indexOf(el), 1);
  setTimeout(() => { if (!el.classList.contains('is-open')) el.hidden = true; }, reduceMotion ? 0 : 320);
  if (!stack.length) document.documentElement.classList.remove('lock');
  if (el.id === 'news') { try { sessionStorage.setItem('dm-news', '1'); } catch (_) {} }
  if (el._back && el._back.focus) el._back.focus({ preventScroll: true });
}

/* ---------- busca ---------- */
const hdr = $('#hdr'), q = $('#q'), suggest = $('#suggest');
function renderSuggest() {
  const term = norm(q.value.trim());
  if (!term) {
    suggest.innerHTML = '<p class="pop-lbl">Mais buscados</p><div class="chips">' +
      C.buscasPopulares.map(t => '<button type="button" data-term="' + esc(t) + '">' + esc(t) + '</button>').join('') + '</div>';
    return;
  }
  const found = P.filter(p => norm(p.nome + ' ' + p.cat).includes(term)).slice(0, 6);
  suggest.innerHTML = found.length
    ? '<p class="pop-lbl">Resultados</p><div class="suggest">' + found.map(p =>
        '<button type="button" data-look="' + p.id + '"><span class="thumb">' + thumb(p) + '</span>' +
        '<span><strong>' + esc(p.nome) + '</strong><br><small>' + brl(p.preco) + '</small></span></button>').join('') + '</div>'
    : '<p class="sg-none">Nenhum resultado para “' + esc(q.value.trim()) + '”.</p>';
}
function openSearch() {
  hdr.classList.add('search-open');
  setAll('[data-search]', b => b.setAttribute('aria-expanded', 'true'));
  renderSuggest();
  setTimeout(() => q.focus(), 30);
}
function closeSearch() {
  hdr.classList.remove('search-open');
  setAll('[data-search]', b => b.setAttribute('aria-expanded', 'false'));
}
q.addEventListener('input', renderSuggest);
$('#searchForm').addEventListener('submit', e => {
  e.preventDefault();
  const term = norm(q.value.trim());
  if (!term) return;
  const hit = P.find(p => norm(p.nome + ' ' + p.cat).includes(term));
  if (hit) { closeSearch(); openQuick(hit.id); } else toast('Nenhum resultado para essa busca.');
});

/* ---------- favoritos ---------- */
const wishes = new Set();
function toggleWish(id) {
  const on = !wishes.has(id);
  on ? wishes.add(id) : wishes.delete(id);
  setAll('[data-wish="' + id + '"]', b => b.setAttribute('aria-pressed', String(on)));
  setAll('.wish-count', el => { el.textContent = wishes.size; el.hidden = wishes.size === 0; });
  toast(on ? 'Adicionado aos favoritos.' : 'Removido dos favoritos.');
}

/* ---------- sacola ---------- */
const cart = [];
function renderCart() {
  const count = cart.reduce((a, i) => a + i.q, 0);
  const sub = cart.reduce((a, i) => a + i.q * byId(i.id).preco, 0);
  const free = C.compra.freteGratisAcima;
  setAll('.cart-count', el => { el.textContent = count; el.hidden = count === 0; });
  $('#cartList').innerHTML = cart.map(it => {
    const p = byId(it.id);
    return '<li><div class="thumb">' + thumb(p) + '</div><div>' +
      '<p class="ci-name">' + esc(p.nome) + '</p>' +
      '<p class="ci-meta">' + (it.size ? esc(optLabel(p)) + ' ' + esc(it.size) + ' · ' : '') + esc(meta(p)) + '</p>' +
      '<div class="ci-row"><div class="qty">' +
        '<button type="button" data-cq="dec" data-k="' + esc(it.k) + '" aria-label="Diminuir">' + icon('minus') + '</button>' +
        '<span>' + it.q + '</span>' +
        '<button type="button" data-cq="inc" data-k="' + esc(it.k) + '" aria-label="Aumentar">' + icon('plus') + '</button></div>' +
      '<span class="ci-price">' + brl(p.preco * it.q) + '</span>' +
      '<button type="button" class="ci-rm" data-cq="rm" data-k="' + esc(it.k) + '" aria-label="Remover ' + esc(p.nome) + '">' + icon('trash') + '</button>' +
      '</div></div></li>';
  }).join('');
  $('#cartEmpty').hidden = count > 0;
  $('#cartFoot').hidden = count === 0;
  $('#cartSub').textContent = brl(sub);
  $('#shipFill').style.width = Math.min(100, sub / free * 100) + '%';
  $('#shipMsg').innerHTML = count === 0
    ? 'Frete grátis em compras acima de <strong>' + brl(free) + '</strong>'
    : sub >= free ? 'Você ganhou <strong>frete grátis</strong>.' : 'Faltam <strong>' + brl(free - sub) + '</strong> para o frete grátis.';
}
function addToCart(id, size) {
  const k = id + '|' + size;
  const it = cart.find(i => i.k === k);
  if (it) it.q++; else cart.push({ k, id, size, q: 1 });
  renderCart();
  closeLayer('qv');
  openLayer('cart');
}
$('#cartList').addEventListener('click', e => {
  const b = e.target.closest('[data-cq]');
  if (!b) return;
  const i = cart.findIndex(x => x.k === b.dataset.k);
  if (i < 0) return;
  if (b.dataset.cq === 'inc') cart[i].q++;
  else if (b.dataset.cq === 'dec') { if (--cart[i].q < 1) cart.splice(i, 1); }
  else cart.splice(i, 1);
  renderCart();
});
$('#checkout').addEventListener('click', () => toast('Checkout de demonstração: nenhuma compra é processada aqui.'));

/* ---------- uma espiadinha ---------- */
let quick = { id: 0, size: '' };
function openQuick(id) {
  const p = byId(id);
  if (!p) return;
  quick = { id, size: '' };
  $('#qvArt').innerHTML = fotos(p).length ? gallery(p) : drawing(p.forma, p.tom);
  $('#qvTitle').textContent = p.nome;
  $('#qvCode').textContent = meta(p);
  $('#qvPrice').textContent = brl(p.preco);
  $('#qvInst').innerHTML = installments(p);
  $('#qvPix').textContent = pixPrice(p);
  $('#qvSizesWrap').hidden = !hasOpt(p);
  $('#qvSizeLbl').textContent = optLabel(p);
  $('#qvSizes').innerHTML = hasOpt(p)
    ? p.opcoes.map(s => '<button type="button" class="size" aria-pressed="false" data-size="' + esc(s) + '">' + esc(s) + '</button>').join('')
    : '';
  $('#qvMsg').textContent = '';
  const w = $('#qvWish');
  w.dataset.wish = id;
  w.setAttribute('aria-pressed', String(wishes.has(id)));
  openLayer('qv');
}
$('#qvSizes').addEventListener('click', e => {
  const b = e.target.closest('.size');
  if (!b) return;
  quick.size = b.dataset.size;
  setAll('#qvSizes .size', x => x.setAttribute('aria-pressed', String(x === b)));
  $('#qvMsg').textContent = '';
});
$('#qvAdd').addEventListener('click', () => {
  const p = byId(quick.id);
  if (hasOpt(p) && !quick.size) { $('#qvMsg').textContent = 'Escolha o ' + optLabel(p).toLowerCase() + ' para continuar.'; return; }
  addToCart(quick.id, quick.size);
});

/* ---------- Instagram flutuante e voltar ao topo ---------- */
(function floating() {
  const ig = $('#ig'), btn = $('#igBtn');
  const set = open => { ig.classList.toggle('open', open); btn.setAttribute('aria-expanded', String(open)); };
  btn.addEventListener('click', () => set(!ig.classList.contains('open')));
  $('#igClose').addEventListener('click', () => { set(false); btn.focus(); });

  const up = $('#toTop');
  window.addEventListener('scroll', () => up.classList.toggle('show', window.scrollY > 600), { passive: true });
  up.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));
})();

/* ---------- formulários de demonstração ---------- */
$('#newsForm').addEventListener('submit', e => { e.preventDefault(); e.target.reset(); toast('Cadastro de exemplo. Esta página não envia e-mails.'); });
$('#trackForm').addEventListener('submit', e => { e.preventDefault(); e.target.reset(); toast('Rastreio de exemplo. Conecte ao sistema de pedidos da loja.'); });
$('#loginForm').addEventListener('submit', e => { e.preventDefault(); e.target.reset(); closeLayer('login'); toast('Login de exemplo. Conecte ao cadastro de clientes da loja.'); });
$('#popFormEl').addEventListener('submit', e => { e.preventDefault(); $('#popForm').hidden = true; $('#popDone').hidden = false; });
$('#copyCoupon').addEventListener('click', () => {
  const code = C.compra.cupom;
  const ok = () => toast('Cupom copiado.');
  const fail = () => toast('Copie o cupom manualmente: ' + code);
  navigator.clipboard && navigator.clipboard.writeText ? navigator.clipboard.writeText(code).then(ok, fail) : fail();
});

/* ---------- cliques (um único ouvinte para a página toda) ---------- */
document.addEventListener('click', e => {
  const t = e.target;
  let el;
  if (hdr.classList.contains('search-open') && !t.closest('#hdr') && !t.closest('[data-search]')) closeSearch();

  /* carrossel de fotos */
  if ((el = t.closest('[data-gal-step]'))) { const g = el.closest('[data-gal]'); galGo(g, galIndex($('.gal-track', g)) + Number(el.dataset.galStep)); return; }
  if ((el = t.closest('[data-gal-to]'))) { galGo(el.closest('[data-gal]'), Number(el.dataset.galTo)); return; }
  if ((el = t.closest('.card .gal-track'))) { openQuick(Number(el.closest('.card').dataset.id)); return; }

  if ((el = t.closest('[data-term]'))) { q.value = el.dataset.term; renderSuggest(); q.focus(); return; }
  if ((el = t.closest('[data-look]'))) { e.preventDefault(); closeSearch(); openQuick(Number(el.dataset.look)); return; }
  if ((el = t.closest('[data-buy]'))) { const id = Number(el.dataset.buy); hasOpt(byId(id)) ? openQuick(id) : addToCart(id, ''); return; }
  if ((el = t.closest('[data-wish]'))) { toggleWish(Number(el.dataset.wish)); return; }
  if ((el = t.closest('[data-open]'))) {
    e.preventDefault();
    const cur = el.closest('.layer');
    if (cur) closeLayer(cur);
    closeSearch();
    openLayer(el.dataset.open);
    return;
  }
  if ((el = t.closest('[data-close]'))) { closeLayer(el.closest('.layer')); return; }
  if ((el = t.closest('[data-search]'))) { hdr.classList.contains('search-open') ? closeSearch() : openSearch(); return; }
  if ((el = t.closest('[data-wishlist]'))) {
    const n = wishes.size;
    toast(n ? 'Você tem ' + n + (n > 1 ? ' favoritos.' : ' favorito.') : 'Toque no coração de uma peça para favoritar.');
    return;
  }
  if ((el = t.closest('a'))) {
    const h = el.getAttribute('href');
    if (h === '#') { e.preventDefault(); toast('Link de exemplo desta página de demonstração.'); }
    else if (h && h.charAt(0) === '#' && el.closest('.layer')) closeLayer(el.closest('.layer'));
  }
});

/* ---------- teclado: Esc fecha, Tab fica dentro da janela aberta, setas no carrossel de fotos ---------- */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (stack.length) closeLayer(stack[stack.length - 1]);
    else if (hdr.classList.contains('search-open')) closeSearch();
    else if ($('#ig').classList.contains('open')) $('#igClose').click();
  }
  if ((e.key === 'ArrowLeft' || e.key === 'ArrowRight') && e.target.closest && e.target.closest('[data-gal]')) {
    const g = e.target.closest('[data-gal]');
    galGo(g, galIndex($('.gal-track', g)) + (e.key === 'ArrowRight' ? 1 : -1));
    e.preventDefault();
  }
  if (e.key === 'Tab' && stack.length) {
    const top = stack[stack.length - 1];
    const f = $$('a[href],button:not([disabled]),input,select,textarea', top).filter(x => x.offsetParent !== null);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
});

/* ---------- cupom de boas-vindas, uma vez por sessão ---------- */
(function coupon() {
  const ms = C.compra.cupomAtrasoMs;
  if (!ms) return;
  let seen = false;
  try { seen = sessionStorage.getItem('dm-news') === '1'; } catch (_) {}
  if (!seen) setTimeout(() => { if (!stack.length) openLayer('news'); }, ms);
})();

renderCart();
})();
