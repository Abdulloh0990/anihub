import React, {
  useState, useEffect, useRef, useMemo, useCallback,
  memo, lazy, Suspense
} from 'react';

/* ═══════════════════════════════════════════════════════════════
   STORAGE — localStorage (reload-safe) + cloud (cross-device)
═══════════════════════════════════════════════════════════════ */
const LS = {
  get:  k => { try { return localStorage.getItem(k); } catch { return null; } },
  set:  (k,v) => { try { localStorage.setItem(k,String(v)); } catch {} },
  del:  k => { try { localStorage.removeItem(k); } catch {} },
  json: k => { try { const v=localStorage.getItem(k); return v?JSON.parse(v):null; } catch { return null; } },
};
const CS = {
  get: async k => { try { const r=await window.storage?.get(k); return r?.value??null; } catch { return null; } },
  set: async (k,v) => { try { await window.storage?.set(k,v); } catch {} },
  del: async k => { try { await window.storage?.delete(k); } catch {} },
};

/* ═══════════════════════════════════════════════════════════════
   CONSTANTS
═══════════════════════════════════════════════════════════════ */
const API         = 'https://shikimori.one/api';
const ASSETS      = 'https://shikimori.one';
const VER         = 'v17';
const SAVE_DELAY  = 1400;
const SESSION_TTL = 90*24*3600*1000;
const PER_PAGE    = 28;
const TREND_PER   = 28;
const CLOUD_KEY   = 'aniHub_v17_data';
const SESS_KEY    = 'aniHub_v17_sess';
const USER_KEY    = 'aniHub_v17_user';

const THEMES = {
  ocean:  {n:'Океан',  i:'🌊', p:'#22d3ee', s:'#0ea5e9', b:'#020c14', m:'#051220'},
  royal:  {n:'Аметист',i:'💎', p:'#a78bfa', s:'#7c3aed', b:'#080412', m:'#100820'},
  sunset: {n:'Закат',  i:'🌅', p:'#fb923c', s:'#ef4444', b:'#140800', m:'#1e0d02'},
  forest: {n:'Лес',    i:'🌲', p:'#4ade80', s:'#16a34a', b:'#011208', m:'#041a0a'},
  rose:   {n:'Роза',   i:'🌸', p:'#f472b6', s:'#db2777', b:'#130010', m:'#1c0018'},
  gold:   {n:'Золото', i:'✨', p:'#fbbf24', s:'#d97706', b:'#130f00', m:'#1e1600'},
  cyber:  {n:'Кибер',  i:'🤖', p:'#39ff14', s:'#00cc6a', b:'#000d06', m:'#011408'},
  ice:    {n:'Лёд',    i:'❄️', p:'#93c5fd', s:'#3b82f6', b:'#02080e', m:'#040e18'},
};

const GENRES = [
  {id:1, n:'Сёнен',    e:'🔥'},{id:4,  n:'Комедия',   e:'😂'},
  {id:10,n:'Фэнтези',  e:'🧙'},{id:2,  n:'Приключения',e:'🗺️'},
  {id:8, n:'Драма',    e:'😢'},{id:7,  n:'Мистика',    e:'🔮'},
  {id:24,n:'Sci-Fi',   e:'🚀'},{id:22, n:'Романтика',  e:'❤️'},
  {id:6, n:'Демоны',   e:'👿'},{id:14, n:'Ужасы',      e:'👻'},
  {id:36,n:'Слайс',    e:'☕'},{id:11, n:'Игры',        e:'🎮'},
  {id:37,n:'Сверхъест',e:'🌟'},{id:23, n:'Школа',       e:'🏫'},
];

const RANKS = [
  {min:1,  l:'Новичок',  c:'#64748b',b:'🌱'},
  {min:10, l:'Зритель',  c:'#3b82f6',b:'⚡'},
  {min:30, l:'Ценитель', c:'#a855f7',b:'💎'},
  {min:60, l:'Мастер',   c:'#f97316',b:'🔥'},
  {min:85, l:'Элита',    c:'#ef4444',b:'👑'},
  {min:100,l:'Легенда',  c:'#eab308',b:'⭐'},
];

const ACHS = [
  {id:'first',  n:'Первый шаг',  d:'Первое аниме открыто',  e:'🎬',xp:10},
  {id:'rate10', n:'Критик',      d:'Оценено 10 аниме',      e:'⭐',xp:50},
  {id:'comp50', n:'Марафонец',   d:'Завершено 50 аниме',    e:'🏃',xp:100},
  {id:'lv10',   n:'Опытный',     d:'Достигнут уровень 10',  e:'💪',xp:75},
  {id:'night',  n:'Полуночник',  d:'Заход после полуночи',  e:'🦉',xp:25},
  {id:'early',  n:'Утренник',    d:'Заход в 5–7 утра',      e:'🌅',xp:25},
  {id:'fav20',  n:'Коллекционер',d:'20 в избранном',        e:'❤️',xp:40},
  {id:'notes10',n:'Рецензент',   d:'10 заметок написано',   e:'📝',xp:60},
  {id:'lib100', n:'Архивист',    d:'100 в библиотеке',      e:'📚',xp:200},
  {id:'streak7',n:'Неделя',      d:'7 дней подряд',         e:'📅',xp:100},
  {id:'search10',n:'Следопыт',   d:'10 уникальных поисков', e:'🔍',xp:30},
  {id:'share5', n:'Блогер',      d:'Поделился 5 раз',       e:'📤',xp:20},
  {id:'perf10', n:'Перфект',     d:'10 оценок «10»',        e:'🌟',xp:80},
  {id:'genres', n:'Всеядный',    d:'Аниме всех жанров',     e:'🎭',xp:150},
];

const NAV = [
  {k:'home',    l:'Главная',  i:'⊞'},
  {k:'trending',l:'Тренды',   i:'📈'},
  {k:'manga',   l:'Манга',    i:'📖'},
  {k:'favs',    l:'Избранное',i:'♥'},
  {k:'library', l:'Библиотека',i:'◈'},
  {k:'history', l:'История',  i:'⏱'},
  {k:'watchlist',l:'Список',  i:'◎'},
  {k:'stats',   l:'Статы',    i:'📊'},
];

const SORTS = [
  {v:'popularity',l:'🔥 Поп.'},
  {v:'ranked',    l:'★ Рейт.'},
  {v:'aired_on',  l:'📅 Дата'},
  {v:'name',      l:'🔤 А-Я'},
];

const YEARS = Array.from({length:36},(_,i)=>2025-i);

/* ═══════════════════════════════════════════════════════════════
   PURE HELPERS
═══════════════════════════════════════════════════════════════ */
const getRank   = xp => { const lv=Math.floor(xp/100)+1; return [...RANKS].reverse().find(r=>lv>=r.min)??RANKS[0]; };
const hashPw    = pw => { let h=0; for(const c of pw) h=(Math.imul(31,h)+c.charCodeAt(0))|0; return Math.abs(h).toString(36); };
const genToken  = ()  => typeof crypto?.randomUUID==='function'?crypto.randomUUID():Math.random().toString(36)+Date.now().toString(36);
const today     = ()  => new Date().toDateString();
const fmt       = n   => n>=1000?(n/1000).toFixed(1)+'k':String(n??0);
const imgSrc    = item=> { if(!item?.image) return ''; const p=item.image?.original??(typeof item.image==='string'?item.image:''); return p?(p.startsWith('http')?p:ASSETS+p):''; };
const stripHtml = h   => h?h.replace(/<[^>]*>/g,' ').replace(/\[.*?\]/g,'').replace(/\s+/g,' ').trim():'';
const mkUser    = (n='Гость')=>({name:n,bio:'Добро пожаловать в AniHub! 🌟',avatar:`https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${n}`,xp:0,joinDate:new Date().toISOString(),lastLogin:null,loginStreak:0,totalLogins:0});

/* ═══════════════════════════════════════════════════════════════
   GLOBAL CSS — injected once, updated on theme change
═══════════════════════════════════════════════════════════════ */
const buildCSS = (p,s,b,m) => `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@500;700&display=swap');

*,*::before,*::after{box-sizing:border-box;-webkit-tap-highlight-color:transparent;margin:0;padding:0}
html{scroll-behavior:smooth;height:100%}
body{font-family:'Outfit',system-ui,sans-serif;background:${b};color:#fff;overflow-x:hidden;min-height:100dvh}
img{user-select:none;-webkit-user-drag:none;display:block}
input,textarea,select,button{font-family:'Outfit',system-ui,sans-serif;color-scheme:dark}
a{color:inherit;text-decoration:none}

::-webkit-scrollbar{width:3px;height:3px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:${p}44;border-radius:99px}
::-webkit-scrollbar-thumb:hover{background:${p}88}
.ns{scrollbar-width:none;-ms-overflow-style:none}
.ns::-webkit-scrollbar{display:none}

:root{
  --p:${p};--s:${s};--base:${b};--mid:${m};
  --glass:rgba(255,255,255,.05);
  --glass-b:rgba(255,255,255,.09);
  --dim:rgba(255,255,255,.4);
  --text:rgba(255,255,255,.85);
  --card-bg:rgba(255,255,255,.04);
  --r:16px;
}

/* ── KEYFRAMES ── */
@keyframes fadeUp   {from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeDown {from{opacity:0;transform:translateY(-14px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn   {from{opacity:0}to{opacity:1}}
@keyframes slideUp  {from{opacity:0;transform:translateY(100%)}to{opacity:1;transform:translateY(0)}}
@keyframes scaleIn  {from{opacity:0;transform:scale(.85) translateY(12px)}to{opacity:1;transform:scale(1) translateY(0)}}
@keyframes pop      {0%{opacity:0;transform:scale(.55) rotate(-15deg)}65%{transform:scale(1.08) rotate(3deg)}100%{opacity:1;transform:scale(1) rotate(0)}}
@keyframes shimmer  {0%{background-position:-800px 0}100%{background-position:800px 0}}
@keyframes spin     {to{transform:rotate(360deg)}}
@keyframes glow     {0%,100%{box-shadow:0 0 12px ${p}55,0 0 24px ${p}22}50%{box-shadow:0 0 24px ${p}99,0 0 50px ${p}44}}
@keyframes float    {0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
@keyframes marquee  {0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
@keyframes toastIn  {from{opacity:0;transform:translateX(28px) scale(.9)}to{opacity:1;transform:translateX(0) scale(1)}}
@keyframes barFill  {from{width:0}to{width:var(--bar-w,100%)}}
@keyframes ripple   {0%{transform:scale(0);opacity:.5}100%{transform:scale(3.5);opacity:0}}
@keyframes heartPop {0%{transform:scale(1)}40%{transform:scale(1.5)}70%{transform:scale(.9)}100%{transform:scale(1)}}
@keyframes trendIn  {from{opacity:0;transform:translateX(-20px)}to{opacity:1;transform:translateX(0)}}
@keyframes posterIn {from{opacity:0;transform:scale(.94)}to{opacity:1;transform:scale(1)}}
@keyframes descSlide{from{opacity:0;max-height:0;transform:translateY(-8px)}to{opacity:1;max-height:600px;transform:translateY(0)}}
@keyframes overlayIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes countUp  {from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
@keyframes progressBar{from{width:0}to{width:100%}}
@keyframes spinnerDash{0%{stroke-dashoffset:200}100%{stroke-dashoffset:0}}

/* ── UTILITY CLASSES ── */
.fu{animation:fadeUp .36s cubic-bezier(.4,0,.2,1) both}
.fd{animation:fadeDown .3s ease both}
.fi{animation:fadeIn .24s ease both}
.su{animation:slideUp .4s cubic-bezier(.34,1.1,.64,1) both}
.si{animation:scaleIn .32s cubic-bezier(.34,1.1,.64,1) both}
.ap{animation:pop .48s cubic-bezier(.34,1.56,.64,1) both}
.stagger>*:nth-child(1){animation-delay:.04s}
.stagger>*:nth-child(2){animation-delay:.08s}
.stagger>*:nth-child(3){animation-delay:.12s}
.stagger>*:nth-child(4){animation-delay:.16s}
.stagger>*:nth-child(5){animation-delay:.20s}
.stagger>*:nth-child(n+6){animation-delay:.24s}

.glass{background:var(--glass);backdrop-filter:blur(14px);border:1px solid var(--glass-b)}
.glass-dark{background:rgba(4,8,18,.96);backdrop-filter:blur(28px) saturate(180%);border:1px solid rgba(255,255,255,.08)}
.card{background:var(--card-bg);border:1px solid rgba(255,255,255,.07);border-radius:var(--r)}

.shimmer{background:linear-gradient(90deg,rgba(255,255,255,0) 0%,rgba(255,255,255,.08) 50%,rgba(255,255,255,0) 100%);background-size:800px 100%;animation:shimmer 1.9s ease-in-out infinite}

.btn-primary{background:linear-gradient(135deg,${p},${s});color:#fff;border:none;cursor:pointer;font-weight:800;transition:all .2s;font-family:'Outfit',system-ui,sans-serif}
.btn-primary:hover{filter:brightness(1.14);transform:translateY(-1px);box-shadow:0 8px 24px ${p}44}
.btn-primary:active{transform:scale(.97)}

.btn-ghost{background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1);color:rgba(255,255,255,.7);cursor:pointer;font-weight:700;transition:all .2s;font-family:'Outfit',system-ui,sans-serif}
.btn-ghost:hover{background:rgba(255,255,255,.13);border-color:rgba(255,255,255,.2)}

.input{background:rgba(255,255,255,.07);border:1.5px solid rgba(255,255,255,.1);color:#fff;outline:none;transition:all .22s;font-family:'Outfit',system-ui,sans-serif;font-weight:600}
.input:focus{border-color:${p}88;box-shadow:0 0 0 3px ${p}15;background:rgba(255,255,255,.09)}
.input::placeholder{color:rgba(255,255,255,.28);font-weight:500}

.lc1{display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;overflow:hidden}
.lc2{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.lc3{display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.lc4{display:-webkit-box;-webkit-line-clamp:4;-webkit-box-orient:vertical;overflow:hidden}

input[type=range]{-webkit-appearance:none;appearance:none;height:6px;border-radius:99px;cursor:pointer;outline:none;border:none}
input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:20px;height:20px;border-radius:50%;background:white;cursor:pointer;box-shadow:0 2px 10px rgba(0,0,0,.5);transition:transform .15s}
input[type=range]::-webkit-slider-thumb:hover{transform:scale(1.2)}

/* ── CARD HOVER ── */
.card-h{transition:transform .28s cubic-bezier(.4,0,.2,1),filter .28s ease,box-shadow .28s ease}
.card-h:hover{transform:translateY(-6px) scale(1.025);filter:brightness(1.07)}
.card-h:hover .card-overlay{opacity:1 !important}
@media(hover:none){.card-h:hover{transform:none;filter:none}.card-h:active{transform:scale(.96)}}

/* ── RESPONSIVE ── */
/* Desktop nav visible only ≥1024 */
.d-nav{display:none!important}
@media(min-width:1024px){.d-nav{display:flex!important}}
/* Mobile scroll nav visible only <1024 */
.m-nav{display:flex!important}
@media(min-width:1024px){.m-nav{display:none!important}}
/* Sidebar visible only ≥1024 */
.sidebar{display:none!important}
@media(min-width:1024px){.sidebar{display:block!important}}
/* Bottom nav hidden on desktop */
.bot-nav{display:flex!important}
@media(min-width:1024px){.bot-nav{display:none!important}}
/* Logo text */
.logo-txt{display:none}
@media(min-width:420px){.logo-txt{display:inline}}
/* Desk only */
.desk{display:none!important}
@media(min-width:1024px){.desk{display:flex!important}}
/* Mobile genres strip (in toolbar) */
.mob-genres{display:flex!important}
@media(min-width:1024px){.mob-genres{display:none!important}}
/* Search bar full on desktop */
@media(max-width:420px){.search-bar{max-width:140px!important}}

/* Main bottom padding for mobile bottom nav */
@media(max-width:1023px){.main-scroll{padding-bottom:80px}}

/* Card grid responsive */
.card-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(134px,1fr));gap:10px}
@media(max-width:480px){.card-grid{grid-template-columns:repeat(auto-fill,minmax(108px,1fr));gap:8px}}
@media(max-width:320px){.card-grid{grid-template-columns:repeat(2,1fr);gap:7px}}

/* Poster visible in article */
article{overflow:visible!important}

/* Trending grid */
.trend-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:12px}
@media(max-width:600px){.trend-grid{grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px}}
@media(max-width:360px){.trend-grid{grid-template-columns:repeat(2,1fr);gap:7px}}

/* Description expand animation */
.desc-expand{animation:descSlide .35s cubic-bezier(.4,0,.2,1) both;overflow:hidden}

/* Modal layout */
.modal-inner{flex-direction:column}
@media(min-width:1024px){.modal-inner{flex-direction:row!important}}

/* Stats grid */
.stats-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}
@media(min-width:640px){.stats-grid{grid-template-columns:repeat(4,1fr)}}

/* Profile sheet desktop center */
@media(min-width:640px){
  .prof-sheet{max-width:520px;margin:0 auto;border-radius:28px!important}
}

/* Noise overlay */
.noise-layer{position:fixed;inset:0;z-index:9999;pointer-events:none;opacity:.015;
  background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")}
`;

/* ═══════════════════════════════════════════════════════════════
   MICRO UI COMPONENTS
═══════════════════════════════════════════════════════════════ */
const Spinner = memo(({size=22,color='rgba(255,255,255,.5)'}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{animation:'spin .7s linear infinite',flexShrink:0}}>
    <circle cx="12" cy="12" r="9" fill="none" strokeWidth="2.5" stroke="rgba(255,255,255,.1)"/>
    <path d="M12 3a9 9 0 0 1 9 9" fill="none" strokeWidth="2.5" stroke={color} strokeLinecap="round"/>
  </svg>
));

const Bar = memo(({value,max,grad,h=6,style={}}) => {
  const pct = Math.min(Math.max((value/Math.max(max,1))*100,0),100);
  return (
    <div style={{height:h,borderRadius:99,overflow:'hidden',background:'rgba(255,255,255,.1)',width:'100%',...style}}>
      <div style={{width:`${pct}%`,height:'100%',borderRadius:99,background:grad,transition:'width .7s cubic-bezier(.4,0,.2,1)',position:'relative',overflow:'hidden'}}>
        <div className="shimmer" style={{position:'absolute',inset:0}}/>
      </div>
    </div>
  );
});

const Toggle = memo(({v,onChange,color}) => (
  <div onClick={()=>onChange(!v)} style={{width:48,height:27,borderRadius:99,position:'relative',cursor:'pointer',flexShrink:0,transition:'all .3s',background:v?`linear-gradient(90deg,${color},${color}bb)`:'rgba(255,255,255,.15)',boxShadow:v?`0 0 16px ${color}55`:''}}>
    <div style={{position:'absolute',top:3,left:4,width:21,height:21,borderRadius:'50%',background:'white',boxShadow:'0 2px 8px rgba(0,0,0,.4)',transition:'transform .3s cubic-bezier(.34,1.56,.64,1)',transform:`translateX(${v?21:0}px)`}}/>
  </div>
));

const Score = memo(({n}) => {
  const x=parseFloat(n);const c=x>=8?'#22c55e':x>=6?'#eab308':x>=4?'#f97316':'#ef4444';
  return <span style={{display:'inline-flex',alignItems:'center',gap:2,borderRadius:8,padding:'1px 7px',fontSize:11,fontWeight:900,background:`${c}22`,color:c,border:`1px solid ${c}44`,flexShrink:0}}>★{n}</span>;
});

const StatusDot = memo(({status}) => {
  const m={watching:{l:'Смотрю',c:'#60a5fa'},planned:{l:'В планах',c:'#f59e0b'},completed:{l:'Завершено',c:'#22c55e'}};
  const x=m[status]; if(!x) return null;
  return <span style={{display:'inline-block',borderRadius:7,padding:'2px 7px',fontSize:10,fontWeight:900,background:`${x.c}dd`,color:'#000',letterSpacing:'.02em'}}>{x.l}</span>;
});

const SkeletonCard = memo(() => (
  <div style={{borderRadius:16,overflow:'hidden',aspectRatio:'2/3',background:'#0b1628',position:'relative'}}>
    <div className="shimmer" style={{position:'absolute',inset:0}}/>
  </div>
));

/* ═══════════════════════════════════════════════════════════════
   TOAST STACK
═══════════════════════════════════════════════════════════════ */
const Toasts = memo(({items}) => {
  const cfg={success:{i:'✓',c:'#22c55e'},error:{i:'✕',c:'#ef4444'},warning:{i:'!',c:'#f59e0b'},info:{i:'ℹ',c:'#60a5fa'}};
  return (
    <div style={{position:'fixed',top:66,right:14,zIndex:12000,display:'flex',flexDirection:'column',gap:8,width:'min(300px,calc(100vw - 28px))',pointerEvents:'none'}}>
      {items.map(t=>{
        const{i,c}=cfg[t.type]??cfg.info;
        return (
          <div key={t.id} className="glass-dark" style={{borderRadius:16,overflow:'hidden',animation:'toastIn .3s cubic-bezier(.34,1.2,.64,1) both',pointerEvents:'auto',borderLeft:`3px solid ${c}`}}>
            <div style={{display:'flex',alignItems:'center',gap:10,padding:'11px 14px'}}>
              <div style={{width:26,height:26,borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',background:`${c}22`,color:c,fontSize:12,fontWeight:900,flexShrink:0}}>{i}</div>
              <p style={{fontSize:13,fontWeight:700,color:'rgba(255,255,255,.92)',lineHeight:1.35}}>{t.msg}</p>
            </div>
            <div style={{height:2,background:c,animation:'barFill 3.6s linear forwards',animationDirection:'reverse'}}/>
          </div>
        );
      })}
    </div>
  );
});

/* ═══════════════════════════════════════════════════════════════
   DESCRIPTION TOOLTIP (desktop hover)
═══════════════════════════════════════════════════════════════ */
const DescTooltip = memo(({item,p,s,side='right'}) => {
  const desc = item?.desc_text||stripHtml(item?.description)||'';
  return (
    <div style={{position:'absolute',top:0,[side==='right'?'left':'right']:'calc(100% + 10px)',zIndex:600,width:280,animation:'overlayIn .22s ease both',pointerEvents:'none'}}>
      <div className="glass-dark" style={{borderRadius:18,padding:14,boxShadow:`0 20px 60px rgba(0,0,0,.75),0 0 0 1px ${p}22`,border:`1px solid ${p}33`}}>
        <p style={{fontSize:13,fontWeight:800,color:'#fff',lineHeight:1.3,marginBottom:7}}>{item?.russian||item?.name}</p>
        <div style={{display:'flex',flexWrap:'wrap',gap:4,marginBottom:8}}>
          {item?.score&&<Score n={item.score}/>}
          {item?.kind&&<span style={{fontSize:10,fontWeight:800,padding:'2px 7px',borderRadius:6,background:`${p}22`,color:p}}>{item.kind.toUpperCase()}</span>}
          {item?.aired_on&&<span style={{fontSize:10,fontWeight:700,padding:'2px 7px',borderRadius:6,background:'rgba(255,255,255,.08)',color:'rgba(255,255,255,.45)'}}>{item.aired_on.slice(0,4)}</span>}
          {item?.episodes&&<span style={{fontSize:10,fontWeight:700,padding:'2px 7px',borderRadius:6,background:'rgba(255,255,255,.08)',color:'rgba(255,255,255,.45)'}}>{item.episodes} эп.</span>}
        </div>
        {desc&&<p style={{fontSize:11,lineHeight:1.65,color:'rgba(255,255,255,.55)',display:'-webkit-box',WebkitLineClamp:5,WebkitBoxOrient:'vertical',overflow:'hidden'}}>{desc}</p>}
        {item?.genres?.length>0&&(
          <div style={{display:'flex',flexWrap:'wrap',gap:4,marginTop:8}}>
            {item.genres.slice(0,4).map(g=>(
              <span key={g.id} style={{fontSize:10,fontWeight:700,padding:'2px 8px',borderRadius:20,background:`${p}15`,color:`${p}cc`,border:`1px solid ${p}30`}}>{g.russian||g.name}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

/* ═══════════════════════════════════════════════════════════════
   ANIME CARD (grid mode) — with poster + hover tooltip
═══════════════════════════════════════════════════════════════ */
const AnimeCard = memo(({item,onClick,onFav,faved,status,userRating,themeP,themeS,cache,colIdx=0,cols=5}) => {
  const [loaded,setLoaded] = useState(false);
  const [hover, setHover]  = useState(false);
  const timer = useRef(null);
  const src   = imgSrc(item);
  const rich  = cache?.[item?.id]?{...item,...cache[item.id]}:item;
  const side  = colIdx>=cols-2?'left':'right';

  const onEnter=()=>{ timer.current=setTimeout(()=>setHover(true),480); };
  const onLeave=()=>{ clearTimeout(timer.current); setHover(false); };

  return (
    <article className="card-h" onClick={()=>onClick(item)} onMouseEnter={onEnter} onMouseLeave={onLeave}
      style={{cursor:'pointer',userSelect:'none',position:'relative',zIndex:hover?20:1,borderRadius:16}}>
      {/* Poster image */}
      <div style={{borderRadius:16,overflow:'hidden',aspectRatio:'2/3',background:'linear-gradient(135deg,#0b1628,#152040)',position:'relative'}}>
        {!loaded&&<div className="shimmer" style={{position:'absolute',inset:0,zIndex:1}}/>}
        {src&&<img src={src} alt={item.russian||item.name} loading="lazy" onLoad={()=>setLoaded(true)}
          style={{width:'100%',height:'100%',objectFit:'cover',opacity:loaded?1:0,transition:'opacity .5s ease',animation:loaded?'posterIn .5s ease both':''}}/>}
        {/* Gradient overlay */}
        <div style={{position:'absolute',inset:0,background:'linear-gradient(to top,rgba(0,0,0,.95) 0%,rgba(0,0,0,.3) 45%,transparent 72%)'}}/>
        {/* Hover overlay */}
        <div className="card-overlay" style={{position:'absolute',inset:0,background:`linear-gradient(to top,${themeP}33,transparent)`,opacity:0,transition:'opacity .3s ease'}}/>
        {/* Top badges */}
        <div style={{position:'absolute',top:7,left:7,right:7,display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:4}}>
          {status&&<StatusDot status={status}/>}
          {userRating&&<span style={{marginLeft:'auto',background:'rgba(234,179,8,.95)',color:'#000',borderRadius:7,padding:'2px 7px',fontSize:10,fontWeight:900,boxShadow:'0 2px 8px rgba(0,0,0,.4)'}}>★{userRating}</span>}
        </div>
        {/* Bottom info */}
        <div style={{position:'absolute',bottom:0,left:0,right:0,padding:'10px 9px 10px'}}>
          {item.score&&<Score n={item.score}/>}
          <p className="lc2" style={{marginTop:4,fontSize:11,fontWeight:800,color:'white',lineHeight:1.3}}>{item.russian||item.name}</p>
          {item.aired_on&&<p style={{marginTop:2,fontSize:9,fontWeight:700,color:'rgba(255,255,255,.38)'}}>{item.aired_on.slice(0,4)}{item.episodes?` · ${item.episodes}эп`:''}</p>}
        </div>
        {/* Fav button */}
        <button onClick={e=>{e.stopPropagation();onFav(item);}}
          style={{position:'absolute',bottom:8,right:8,width:30,height:30,borderRadius:10,border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,background:faved?'#ec489999':'rgba(0,0,0,.55)',backdropFilter:'blur(8px)',transition:'all .2s',color:faved?'#fff':'rgba(255,255,255,.5)',zIndex:2,animation:faved?'heartPop .3s ease':''}}>
          {faved?'♥':'♡'}
        </button>
        {/* Fav glow border */}
        {faved&&<div style={{position:'absolute',inset:0,borderRadius:'inherit',boxShadow:'inset 0 0 0 2px #ec489966'}}/>}
      </div>
      {/* Desktop hover tooltip */}
      {hover&&<DescTooltip item={rich} p={themeP} s={themeS} side={side}/>}
    </article>
  );
});

/* ═══════════════════════════════════════════════════════════════
   ANIME ROW (list mode) — with expandable description
═══════════════════════════════════════════════════════════════ */
const AnimeRow = memo(({item,onClick,onFav,faved,themeP,themeS,cache}) => {
  const [expanded,setExpanded] = useState(false);
  const src    = imgSrc(item);
  const rich   = cache?.[item?.id]?{...item,...cache[item.id]}:item;
  const desc   = rich?.desc_text||stripHtml(rich?.description)||'';

  return (
    <div className="card" style={{borderRadius:16,overflow:'hidden',transition:'background .2s'}}>
      <div onClick={()=>onClick(item)} style={{display:'flex',gap:12,padding:'11px 12px',cursor:'pointer',transition:'background .2s',position:'relative'}}
        onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,.06)'}
        onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
        {/* Poster */}
        <div style={{width:52,flexShrink:0,borderRadius:10,overflow:'hidden',aspectRatio:'2/3',background:'#0b1628',position:'relative'}}>
          {src&&<img src={src} alt="" loading="lazy" style={{width:'100%',height:'100%',objectFit:'cover'}}/>}
        </div>
        <div style={{flex:1,minWidth:0,display:'flex',flexDirection:'column',justifyContent:'center',gap:5}}>
          <p className="lc2" style={{fontSize:13,fontWeight:800,color:'white',lineHeight:1.3}}>{item.russian||item.name}</p>
          <div style={{display:'flex',flexWrap:'wrap',gap:4}}>
            {item.score&&<Score n={item.score}/>}
            {item.kind&&<span style={{fontSize:10,fontWeight:700,padding:'2px 7px',borderRadius:6,background:'rgba(255,255,255,.08)',color:'rgba(255,255,255,.4)'}}>{item.kind}</span>}
            {item.aired_on&&<span style={{fontSize:10,fontWeight:700,padding:'2px 7px',borderRadius:6,background:'rgba(255,255,255,.08)',color:'rgba(255,255,255,.35)'}}>{item.aired_on.slice(0,4)}</span>}
          </div>
          {desc&&!expanded&&<p className="lc2" style={{fontSize:11,lineHeight:1.55,color:'rgba(255,255,255,.32)',fontWeight:500}}>{desc}</p>}
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:6,alignItems:'center',flexShrink:0}}>
          <button onClick={e=>{e.stopPropagation();onFav(item);}}
            style={{width:34,height:34,borderRadius:10,border:'none',cursor:'pointer',background:faved?'#ec489922':'rgba(255,255,255,.06)',color:faved?'#ec4899':'rgba(255,255,255,.3)',fontSize:15,transition:'all .2s',display:'flex',alignItems:'center',justifyContent:'center'}}>
            {faved?'♥':'♡'}
          </button>
          {desc&&<button onClick={e=>{e.stopPropagation();setExpanded(x=>!x);}}
            style={{width:34,height:34,borderRadius:10,border:'none',cursor:'pointer',background:expanded?`${themeP}22`:'rgba(255,255,255,.06)',color:expanded?themeP:'rgba(255,255,255,.3)',fontSize:10,fontWeight:900,transition:'all .2s',display:'flex',alignItems:'center',justifyContent:'center',transform:expanded?'rotate(180deg)':'none'}}>▼</button>}
        </div>
      </div>
      {expanded&&desc&&(
        <div className="desc-expand" style={{padding:'0 12px 12px'}}>
          <div style={{padding:12,borderRadius:12,background:'rgba(255,255,255,.04)',border:`1px solid ${themeP}22`}}>
            {rich?.genres?.length>0&&<div style={{display:'flex',flexWrap:'wrap',gap:4,marginBottom:8}}>
              {rich.genres.slice(0,6).map(g=><span key={g.id} style={{fontSize:10,fontWeight:700,padding:'2px 8px',borderRadius:20,background:`${themeP}18`,color:`${themeP}cc`,border:`1px solid ${themeP}33`}}>{g.russian||g.name}</span>)}
            </div>}
            <p style={{fontSize:12,lineHeight:1.68,color:'rgba(255,255,255,.6)'}}>{desc}</p>
          </div>
        </div>
      )}
    </div>
  );
});

/* ═══════════════════════════════════════════════════════════════
   TRENDING FULL PAGE (infinite scroll "load more")
═══════════════════════════════════════════════════════════════ */
const TrendingPage = memo(({themeP,themeS,onOpen,onFav,favIds,cache,library}) => {
  const [items, setItems]   = useState([]);
  const [page,  setPage]    = useState(1);
  const [more,  setMore]    = useState(true);
  const [loading,setLoading]= useState(true);
  const [loadingMore,setLM] = useState(false);
  const grad = `linear-gradient(135deg,${themeP},${themeS})`;

  const fetchPage = useCallback(async (pg, append=false) => {
    try {
      const r = await fetch(`${API}/animes?limit=${TREND_PER}&page=${pg}&order=popularity`);
      const d = await r.json();
      const arr = Array.isArray(d)?d:[];
      if(append) setItems(prev=>[...prev,...arr]);
      else setItems(arr);
      if(arr.length<TREND_PER) setMore(false);
    } catch {}
    setLoading(false); setLM(false);
  },[]);

  useEffect(()=>{ setLoading(true); fetchPage(1,false); },[fetchPage]);

  const loadMore = () => {
    if(loadingMore||!more) return;
    setLM(true);
    const next = page+1;
    setPage(next);
    fetchPage(next,true);
  };

  return (
    <div className="fu">
      {/* Hero banner */}
      <div style={{borderRadius:22,overflow:'hidden',position:'relative',marginBottom:20,background:`linear-gradient(135deg,${themeP}22,${themeS}11)`,border:`1px solid ${themeP}33`,padding:'22px 20px'}}>
        <div style={{position:'absolute',top:-60,right:-60,width:220,height:220,borderRadius:'50%',background:`${themeP}0a`,pointerEvents:'none'}}/>
        <div style={{display:'flex',alignItems:'center',gap:14,position:'relative'}}>
          <div style={{width:58,height:58,borderRadius:18,background:grad,display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,boxShadow:`0 8px 28px ${themeP}55`,flexShrink:0,animation:'glow 3s ease infinite'}}>📈</div>
          <div>
            <h2 style={{margin:'0 0 4px',fontSize:22,fontWeight:900}}>В тренде</h2>
            <p style={{margin:0,fontSize:12,color:'rgba(255,255,255,.45)',fontWeight:600}}>Самые популярные аниме прямо сейчас · {items.length} показано</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="trend-grid stagger">
          {Array(TREND_PER).fill(0).map((_,i)=><SkeletonCard key={i}/>)}
        </div>
      ) : (
        <>
          <div className="trend-grid stagger">
            {items.map((item,idx)=>(
              <div key={`tr-${item.id}-${idx}`} style={{animation:`trendIn .35s ${Math.min(idx*.025,.4)}s both`}}>
                <AnimeCard item={item} onClick={onOpen} onFav={onFav}
                  faved={favIds.has(item.id)} status={library[item.id]?.status}
                  themeP={themeP} themeS={themeS} cache={cache}
                  colIdx={idx%5} cols={5}/>
                {/* Rank badge */}
                <div style={{marginTop:5,display:'flex',alignItems:'center',gap:4}}>
                  <span style={{fontSize:11,fontWeight:900,color:idx<3?themeP:'rgba(255,255,255,.3)'}}>#{idx+1}</span>
                  {idx<3&&<div style={{flex:1,height:2,borderRadius:99,background:grad,opacity:.4}}/>}
                </div>
              </div>
            ))}
          </div>
          {/* Load more */}
          {more&&(
            <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:10,marginTop:28,padding:'0 0 16px'}}>
              {loadingMore?(
                <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:8}}>
                  <Spinner size={28} color={themeP}/>
                  <p style={{fontSize:12,color:'rgba(255,255,255,.35)',fontWeight:700}}>Загружаем ещё…</p>
                </div>
              ):(
                <button onClick={loadMore} className="btn-primary" style={{padding:'13px 36px',borderRadius:14,fontSize:14,boxShadow:`0 8px 28px ${themeP}44`,display:'flex',alignItems:'center',gap:8}}>
                  <span>Загрузить ещё</span><span style={{fontSize:18}}>↓</span>
                </button>
              )}
              <p style={{fontSize:11,color:'rgba(255,255,255,.22)',fontWeight:600}}>Страница {page} · {items.length} аниме загружено</p>
            </div>
          )}
          {!more&&items.length>0&&(
            <div style={{textAlign:'center',padding:'24px 0 16px',color:'rgba(255,255,255,.22)',fontSize:12,fontWeight:700}}>
              ✓ Всё загружено · {items.length} аниме
            </div>
          )}
        </>
      )}
    </div>
  );
});

/* ═══════════════════════════════════════════════════════════════
   MOBILE SEARCH OVERLAY — full screen, touch-optimized
═══════════════════════════════════════════════════════════════ */
const SearchOverlay = memo(({onClose,themeP,themeS,onOpen,history,onClearHist}) => {
  const [q,setQ]         = useState('');
  const [res,setRes]     = useState([]);
  const [loading,setLd]  = useState(false);
  const [tab,setTab]     = useState('search'); // search | history | trending
  const [topItems,setTop]= useState([]);
  const inputRef = useRef(null);
  const debRef   = useRef(null);

  useEffect(()=>{ inputRef.current?.focus(); },[]);

  // Fetch top for trending tab
  useEffect(()=>{
    fetch(`${API}/animes?limit=12&order=popularity`).then(r=>r.json()).then(d=>setTop(Array.isArray(d)?d:[])).catch(()=>{});
  },[]);

  useEffect(()=>{
    if(!q.trim()){ setRes([]); return; }
    setLd(true);
    clearTimeout(debRef.current);
    debRef.current=setTimeout(async()=>{
      try{
        const r=await fetch(`${API}/animes?search=${encodeURIComponent(q)}&limit=12&order=popularity`);
        setRes(Array.isArray(await r.json())?await fetch(`${API}/animes?search=${encodeURIComponent(q)}&limit=12&order=popularity`).then(x=>x.json()):[]);
      }catch{}
      setLd(false);
    },380);
  },[q]);

  // fix double fetch
  useEffect(()=>{
    if(!q.trim()){ setRes([]); return; }
    setLd(true);
    clearTimeout(debRef.current);
    debRef.current=setTimeout(async()=>{
      try{
        const r=await fetch(`${API}/animes?search=${encodeURIComponent(q)}&limit=14&order=popularity`);
        const d=await r.json();
        setRes(Array.isArray(d)?d:[]);
      }catch{}
      setLd(false);
    },400);
  },[q]);

  const displayList = q.trim()?res:(tab==='trending'?topItems:[]);
  const grad=`linear-gradient(135deg,${themeP},${themeS})`;

  return (
    <div className="fi" style={{position:'fixed',inset:0,zIndex:11000,background:`${THEMES.ocean?.b??'#020c14'}`,display:'flex',flexDirection:'column',backgroundColor:'var(--base)'}}>
      {/* Header */}
      <div style={{padding:'10px 14px 0',flexShrink:0}}>
        <div style={{display:'flex',alignItems:'center',gap:10,padding:'0 0 10px'}}>
          <button onClick={onClose} style={{width:38,height:38,borderRadius:12,border:'none',background:'rgba(255,255,255,.09)',cursor:'pointer',fontSize:18,display:'flex',alignItems:'center',justifyContent:'center',color:'white',flexShrink:0}}>←</button>
          <div style={{flex:1,position:'relative'}}>
            <input ref={inputRef} value={q} onChange={e=>setQ(e.target.value)} placeholder="Поиск аниме, манги..." autoComplete="off" autoCorrect="off" spellCheck={false}
              className="input" style={{width:'100%',padding:'11px 42px 11px 14px',borderRadius:14,fontSize:15,fontWeight:600}}
              onKeyDown={e=>e.key==='Escape'&&onClose()}/>
            {loading&&<div style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)'}}><Spinner size={16} color={themeP}/></div>}
            {q&&!loading&&<button onClick={()=>setQ('')} style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:'rgba(255,255,255,.4)',fontSize:16,padding:0}}>✕</button>}
          </div>
        </div>
        {/* Tabs */}
        {!q&&<div style={{display:'flex',gap:6,paddingBottom:10}}>
          {[['search','🔍 Поиск'],['history','⏱ История'],['trending','📈 Популярное']].map(([k,l])=>(
            <button key={k} onClick={()=>setTab(k)} style={{flex:1,padding:'8px 0',borderRadius:12,border:'none',cursor:'pointer',fontFamily:'inherit',fontSize:12,fontWeight:800,transition:'all .2s',background:tab===k?grad:'rgba(255,255,255,.07)',color:tab===k?'white':'rgba(255,255,255,.4)',boxShadow:tab===k?`0 4px 14px ${themeP}44`:''}}>
              {l}
            </button>
          ))}
        </div>}
      </div>

      {/* Body */}
      <div className="ns" style={{flex:1,overflowY:'auto',padding:'0 14px 24px'}}>
        {/* History tab */}
        {!q&&tab==='history'&&(
          <div className="fu">
            {history?.length>0?(
              <>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
                  <p style={{fontSize:11,fontWeight:800,opacity:.35,textTransform:'uppercase',letterSpacing:'.08em'}}>Недавние запросы</p>
                  <button onClick={onClearHist} style={{background:'none',border:'none',color:themeP,fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:'inherit',opacity:.7}}>Очистить</button>
                </div>
                {history.slice(0,10).map((h,i)=>(
                  <div key={i} onClick={()=>setQ(h)} style={{display:'flex',alignItems:'center',gap:10,padding:'11px 12px',borderRadius:14,cursor:'pointer',transition:'background .15s',animation:`fadeUp .28s ${i*.04}s both`}}
                    onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,.07)'}
                    onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                    <span style={{fontSize:16,opacity:.4}}>⏱</span>
                    <span style={{fontSize:14,fontWeight:600,color:'rgba(255,255,255,.7)'}}>{h}</span>
                    <span style={{marginLeft:'auto',fontSize:14,opacity:.2}}>↗</span>
                  </div>
                ))}
              </>
            ):(
              <div style={{textAlign:'center',padding:'48px 20px',color:'rgba(255,255,255,.2)'}}>
                <div style={{fontSize:48,marginBottom:12,animation:'float 3s ease infinite'}}>⏱</div>
                <p style={{fontSize:14,fontWeight:700}}>История поиска пуста</p>
              </div>
            )}
          </div>
        )}
        {/* Empty search tab */}
        {!q&&tab==='search'&&(
          <div style={{textAlign:'center',padding:'52px 20px'}}>
            <div style={{fontSize:52,marginBottom:14,animation:'float 3s ease infinite'}}>🔍</div>
            <p style={{fontSize:16,fontWeight:800,marginBottom:6}}>Начните вводить</p>
            <p style={{fontSize:13,color:'rgba(255,255,255,.3)',fontWeight:600}}>Поиск по названию, жанру, году…</p>
          </div>
        )}
        {/* Trending tab */}
        {!q&&tab==='trending'&&(
          <div>
            <p style={{fontSize:11,fontWeight:800,opacity:.35,textTransform:'uppercase',letterSpacing:'.08em',marginBottom:12}}>Популярное сейчас</p>
            <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:8}}>
              {topItems.slice(0,12).map((item,i)=>(
                <div key={item.id} onClick={()=>{onOpen(item);onClose();}} className="card-h"
                  style={{borderRadius:14,overflow:'hidden',cursor:'pointer',position:'relative',aspectRatio:'16/9',background:'#0b1628',animation:`fadeUp .3s ${i*.03}s both`}}>
                  {imgSrc(item)&&<img src={imgSrc(item)} alt="" style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}}/>}
                  <div style={{position:'absolute',inset:0,background:'linear-gradient(to top,rgba(0,0,0,.9) 0%,transparent 60%)'}}/>
                  <div style={{position:'absolute',bottom:0,left:0,right:0,padding:'8px 9px'}}>
                    <p className="lc1" style={{fontSize:11,fontWeight:800,color:'white'}}>{item.russian||item.name}</p>
                    <div style={{display:'flex',alignItems:'center',gap:4,marginTop:2}}>
                      <span style={{fontSize:9,fontWeight:900,color:'#fbbf24'}}>★{item.score}</span>
                      <span style={{fontSize:9,color:'rgba(255,255,255,.3)',fontWeight:700}}>#{i+1}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Search results */}
        {q&&(
          loading&&res.length===0?(
            <div style={{display:'flex',flexDirection:'column',alignItems:'center',padding:'48px 0',gap:12}}>
              <Spinner size={28} color={themeP}/><p style={{fontSize:13,fontWeight:700,opacity:.4}}>Ищем…</p>
            </div>
          ):res.length===0?(
            <div style={{textAlign:'center',padding:'52px 20px',color:'rgba(255,255,255,.25)'}}>
              <div style={{fontSize:48,marginBottom:12,animation:'float 3s ease infinite'}}>📭</div>
              <p style={{fontSize:15,fontWeight:800}}>Ничего не нашли</p>
              <p style={{fontSize:12,marginTop:6}}>Попробуйте другой запрос</p>
            </div>
          ):(
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              <p style={{fontSize:11,fontWeight:800,opacity:.3,textTransform:'uppercase',letterSpacing:'.07em',marginBottom:4}}>Результаты: {res.length}</p>
              {res.map((item,i)=>{
                const src2=imgSrc(item);
                return (
                  <div key={item.id} onClick={()=>{onOpen(item);onClose();}}
                    style={{display:'flex',gap:12,padding:'10px 11px',borderRadius:14,cursor:'pointer',transition:'background .15s',border:'1px solid rgba(255,255,255,.07)',background:'rgba(255,255,255,.03)',animation:`fadeUp .28s ${i*.03}s both`}}
                    onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,.08)'}
                    onMouseLeave={e=>e.currentTarget.style.background='rgba(255,255,255,.03)'}>
                    <div style={{width:46,height:64,borderRadius:10,overflow:'hidden',background:'#0b1628',flexShrink:0}}>
                      {src2&&<img src={src2} alt="" style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}}/>}
                    </div>
                    <div style={{flex:1,minWidth:0,display:'flex',flexDirection:'column',justifyContent:'center',gap:5}}>
                      <p className="lc2" style={{fontSize:14,fontWeight:800,color:'white',lineHeight:1.3}}>{item.russian||item.name}</p>
                      <div style={{display:'flex',flexWrap:'wrap',gap:4}}>
                        {item.score&&<Score n={item.score}/>}
                        {item.kind&&<span style={{fontSize:10,fontWeight:700,padding:'1px 7px',borderRadius:6,background:'rgba(255,255,255,.09)',color:'rgba(255,255,255,.4)'}}>{item.kind}</span>}
                        {item.aired_on&&<span style={{fontSize:10,fontWeight:700,padding:'1px 7px',borderRadius:6,background:'rgba(255,255,255,.09)',color:'rgba(255,255,255,.35)'}}>{item.aired_on.slice(0,4)}</span>}
                      </div>
                    </div>
                    <span style={{fontSize:18,opacity:.2,alignSelf:'center'}}>→</span>
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>
    </div>
  );
});

/* ═══════════════════════════════════════════════════════════════
   SPOTLIGHT SEARCH (desktop Ctrl+K)
═══════════════════════════════════════════════════════════════ */
const Spotlight = memo(({onClose,themeP,themeS,onOpen,history,onClearHist}) => {
  const [q,setQ]       = useState('');
  const [res,setRes]   = useState([]);
  const [ld,setLd]     = useState(false);
  const inputRef = useRef(null);
  const debRef   = useRef(null);

  useEffect(()=>{ inputRef.current?.focus(); },[]);

  useEffect(()=>{
    if(!q.trim()){ setRes([]); return; }
    setLd(true);
    clearTimeout(debRef.current);
    debRef.current=setTimeout(async()=>{
      try{
        const r=await fetch(`${API}/animes?search=${encodeURIComponent(q)}&limit=10&order=popularity`);
        const d=await r.json(); setRes(Array.isArray(d)?d:[]);
      }catch{}
      setLd(false);
    },360);
  },[q]);

  return (
    <div className="fi" style={{position:'fixed',inset:0,zIndex:12000,display:'flex',alignItems:'flex-start',justifyContent:'center',padding:'80px 16px 16px',background:'rgba(0,0,0,.82)',backdropFilter:'blur(20px)'}}>
      <div onClick={onClose} style={{position:'absolute',inset:0}}/>
      <div className="glass-dark si" style={{position:'relative',width:'100%',maxWidth:580,borderRadius:22,overflow:'hidden',boxShadow:`0 30px 80px rgba(0,0,0,.8),0 0 0 1px ${themeP}33`}}>
        <div style={{display:'flex',alignItems:'center',gap:10,padding:'14px 16px',borderBottom:'1px solid rgba(255,255,255,.08)'}}>
          <span style={{fontSize:17,opacity:.35}}>🔍</span>
          <input ref={inputRef} value={q} onChange={e=>setQ(e.target.value)} placeholder="Поиск аниме…"
            style={{flex:1,background:'transparent',border:'none',outline:'none',fontSize:16,fontWeight:600,color:'white',fontFamily:'inherit'}}
            onKeyDown={e=>e.key==='Escape'&&onClose()}/>
          {ld&&<Spinner size={16} color={themeP}/>}
          <kbd style={{fontSize:11,fontWeight:700,padding:'3px 7px',borderRadius:7,background:'rgba(255,255,255,.09)',color:'rgba(255,255,255,.35)',border:'1px solid rgba(255,255,255,.13)',flexShrink:0}}>ESC</kbd>
        </div>
        <div className="ns" style={{maxHeight:400,overflowY:'auto'}}>
          {res.length>0?res.map(item=>(
            <div key={item.id} onClick={()=>{onOpen(item);onClose();}}
              style={{display:'flex',gap:11,padding:'9px 16px',cursor:'pointer',transition:'background .12s',alignItems:'center'}}
              onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,.07)'}
              onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
              <div style={{width:36,height:52,borderRadius:8,overflow:'hidden',background:'#0b1628',flexShrink:0}}>
                {imgSrc(item)&&<img src={imgSrc(item)} alt="" style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}}/>}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <p className="lc1" style={{fontSize:13,fontWeight:800,color:'white',marginBottom:4}}>{item.russian||item.name}</p>
                <div style={{display:'flex',gap:5}}>
                  {item.score&&<Score n={item.score}/>}
                  {item.kind&&<span style={{fontSize:10,fontWeight:700,padding:'1px 6px',borderRadius:5,background:'rgba(255,255,255,.08)',color:'rgba(255,255,255,.4)'}}>{item.kind}</span>}
                </div>
              </div>
              <span style={{opacity:.22}}>→</span>
            </div>
          )):q&&!ld?(
            <div style={{padding:'36px',textAlign:'center',color:'rgba(255,255,255,.25)'}}>
              <p style={{fontSize:14,fontWeight:700}}>Ничего не найдено</p>
            </div>
          ):history?.length>0?(
            <div style={{padding:'10px 16px'}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
                <span style={{fontSize:11,fontWeight:800,opacity:.3,textTransform:'uppercase',letterSpacing:'.07em'}}>Недавние</span>
                <button onClick={onClearHist} style={{background:'none',border:'none',color:themeP,fontSize:11,fontWeight:700,cursor:'pointer',fontFamily:'inherit',opacity:.7}}>Очистить</button>
              </div>
              {history.slice(0,5).map((h,i)=>(
                <div key={i} onClick={()=>setQ(h)} style={{padding:'8px 10px',borderRadius:10,cursor:'pointer',fontSize:13,fontWeight:600,color:'rgba(255,255,255,.55)',transition:'all .15s',display:'flex',alignItems:'center',gap:8}}
                  onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,.07)'}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <span style={{opacity:.35}}>⏱</span>{h}
                </div>
              ))}
            </div>
          ):null}
        </div>
        <div style={{padding:'10px 16px',borderTop:'1px solid rgba(255,255,255,.07)',display:'flex',gap:14}}>
          {[['↵','Открыть'],['ESC','Закрыть'],['Ctrl+K','Поиск']].map(([k,l])=>(
            <div key={k} style={{display:'flex',alignItems:'center',gap:5}}>
              <kbd style={{fontSize:10,fontWeight:700,padding:'2px 6px',borderRadius:5,background:'rgba(255,255,255,.07)',color:'rgba(255,255,255,.3)',border:'1px solid rgba(255,255,255,.1)'}}>{k}</kbd>
              <span style={{fontSize:10,color:'rgba(255,255,255,.22)',fontWeight:600}}>{l}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

/* ═══════════════════════════════════════════════════════════════
   FILTER PANEL
═══════════════════════════════════════════════════════════════ */
const FilterPanel = memo(({filters,onChange,themeP,themeS,onClose}) => {
  const [loc,setLoc] = useState(filters);
  const apply=()=>{ onChange(loc); onClose(); };
  const reset=()=>{ const d={year:null,scoreMin:0,kind:'',status:''}; setLoc(d); onChange(d); onClose(); };
  const kinds=[{v:'',l:'Все'},{v:'tv',l:'TV'},{v:'movie',l:'Фильм'},{v:'ova',l:'OVA'},{v:'ona',l:'ONA'},{v:'special',l:'Спешл'}];
  const statuses=[{v:'',l:'Все'},{v:'released',l:'Вышло'},{v:'ongoing',l:'Онгоинг'},{v:'anons',l:'Анонс'}];

  return (
    <div className="fi" style={{position:'fixed',inset:0,zIndex:11000,display:'flex',alignItems:'flex-end',justifyContent:'center',background:'rgba(0,0,0,.75)',backdropFilter:'blur(14px)'}}>
      <div onClick={onClose} style={{position:'absolute',inset:0}}/>
      <div className="glass-dark su prof-sheet" style={{position:'relative',borderRadius:'24px 24px 0 0',width:'100%',maxWidth:560,padding:'20px 18px 36px',boxShadow:'0 -24px 70px rgba(0,0,0,.7)'}}>
        <div style={{display:'flex',justifyContent:'center',marginBottom:14}}><div style={{width:36,height:4,borderRadius:99,background:'rgba(255,255,255,.2)'}}/></div>
        <div style={{display:'flex',justifyContent:'space-between',marginBottom:18,alignItems:'center'}}>
          <h3 style={{fontSize:18,fontWeight:900}}>Фильтры</h3>
          <button onClick={onClose} style={{width:30,height:30,borderRadius:10,border:'none',background:'rgba(255,255,255,.08)',color:'rgba(255,255,255,.5)',cursor:'pointer',fontSize:14,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'inherit'}}>✕</button>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:18}}>
          {/* Year */}
          <div>
            <label style={{display:'block',fontSize:11,fontWeight:800,opacity:.35,textTransform:'uppercase',letterSpacing:'.07em',marginBottom:8}}>Год выхода</label>
            <div className="ns" style={{display:'flex',gap:5,overflowX:'auto',paddingBottom:4}}>
              <button onClick={()=>setLoc(p=>({...p,year:null}))} style={{flexShrink:0,padding:'6px 12px',borderRadius:20,border:`1px solid ${!loc.year?themeP+'66':'rgba(255,255,255,.12)'}`,background:!loc.year?`${themeP}22`:'rgba(255,255,255,.06)',color:!loc.year?themeP:'rgba(255,255,255,.5)',cursor:'pointer',fontSize:12,fontWeight:800,fontFamily:'inherit'}}>Все</button>
              {YEARS.map(y=><button key={y} onClick={()=>setLoc(p=>({...p,year:y}))} style={{flexShrink:0,padding:'6px 12px',borderRadius:20,border:`1px solid ${loc.year===y?themeP+'66':'rgba(255,255,255,.12)'}`,background:loc.year===y?`${themeP}22`:'rgba(255,255,255,.06)',color:loc.year===y?themeP:'rgba(255,255,255,.5)',cursor:'pointer',fontSize:12,fontWeight:800,fontFamily:'inherit'}}>{y}</button>)}
            </div>
          </div>
          {/* Kind + Status */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
            <div>
              <label style={{display:'block',fontSize:11,fontWeight:800,opacity:.35,textTransform:'uppercase',letterSpacing:'.07em',marginBottom:8}}>Тип</label>
              <div style={{display:'flex',flexWrap:'wrap',gap:5}}>
                {kinds.map(({v,l})=><button key={v} onClick={()=>setLoc(p=>({...p,kind:v}))} style={{padding:'6px 12px',borderRadius:20,border:`1px solid ${loc.kind===v?themeP+'66':'rgba(255,255,255,.12)'}`,background:loc.kind===v?`${themeP}22`:'rgba(255,255,255,.06)',color:loc.kind===v?themeP:'rgba(255,255,255,.5)',cursor:'pointer',fontSize:11,fontWeight:800,fontFamily:'inherit'}}>{l}</button>)}
              </div>
            </div>
            <div>
              <label style={{display:'block',fontSize:11,fontWeight:800,opacity:.35,textTransform:'uppercase',letterSpacing:'.07em',marginBottom:8}}>Статус</label>
              <div style={{display:'flex',flexWrap:'wrap',gap:5}}>
                {statuses.map(({v,l})=><button key={v} onClick={()=>setLoc(p=>({...p,status:v}))} style={{padding:'6px 12px',borderRadius:20,border:`1px solid ${loc.status===v?themeP+'66':'rgba(255,255,255,.12)'}`,background:loc.status===v?`${themeP}22`:'rgba(255,255,255,.06)',color:loc.status===v?themeP:'rgba(255,255,255,.5)',cursor:'pointer',fontSize:11,fontWeight:800,fontFamily:'inherit'}}>{l}</button>)}
              </div>
            </div>
          </div>
          {/* Score */}
          <div>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
              <label style={{fontSize:11,fontWeight:800,opacity:.35,textTransform:'uppercase',letterSpacing:'.07em'}}>Мин. рейтинг</label>
              <span style={{fontSize:13,fontWeight:900,color:themeP}}>{loc.scoreMin>0?`${loc.scoreMin}+`:'Любой'}</span>
            </div>
            <input type="range" min={0} max={9} step={1} value={loc.scoreMin} onChange={e=>setLoc(p=>({...p,scoreMin:+e.target.value}))}
              style={{width:'100%',background:`linear-gradient(90deg,${themeP} ${loc.scoreMin/9*100}%,rgba(255,255,255,.15) ${loc.scoreMin/9*100}%)`}}/>
          </div>
          <div style={{display:'flex',gap:10}}>
            <button onClick={reset} className="btn-ghost" style={{flex:1,padding:13,borderRadius:14,fontSize:13}}>↺ Сброс</button>
            <button onClick={apply} className="btn-primary" style={{flex:2,padding:13,borderRadius:14,fontSize:13,boxShadow:`0 8px 24px ${themeP}44`}}>✓ Применить</button>
          </div>
        </div>
      </div>
    </div>
  );
});

/* ═══════════════════════════════════════════════════════════════
   DETAIL PANEL (inside modal)
═══════════════════════════════════════════════════════════════ */
const DetailPanel = memo(({item,lib,ratings,notes,favs,wl,themeP,themeS,isAuth,onStatus,onRate,onNote,onFav,onWL,onShare}) => {
  const [descOpen,setDescOpen] = useState(true);
  const status   = lib[item?.id]?.status;
  const rating   = ratings[item?.id];
  const note     = notes[item?.id]?.text??'';
  const isFav    = favs.has(item?.id);
  const inWL     = wl.has(item?.id);
  const desc     = item?.desc_text||stripHtml(item?.description)||'';
  const grad     = `linear-gradient(135deg,${themeP},${themeS})`;
  if(!item) return null;

  const btnStyle=(active,ac)=>({padding:'10px 12px',borderRadius:12,border:`1.5px solid ${active?ac+'55':'transparent'}`,cursor:'pointer',fontWeight:800,fontSize:12,fontFamily:'inherit',transition:'all .2s',background:active?`${ac}1a`:'rgba(255,255,255,.05)',color:active?ac:'rgba(255,255,255,.4)',boxShadow:active?`0 4px 16px ${ac}30`:'',width:'100%',textAlign:'left'});

  return (
    <div className="ns" style={{overflowY:'auto',padding:'14px',display:'flex',flexDirection:'column',gap:12,height:'100%'}}>
      {/* Poster + meta row */}
      <div style={{display:'flex',gap:12,alignItems:'flex-start'}}>
        {imgSrc(item)&&(
          <div style={{width:80,flexShrink:0,borderRadius:13,overflow:'hidden',aspectRatio:'2/3',boxShadow:`0 8px 28px rgba(0,0,0,.6),0 0 0 2px ${themeP}44`,animation:'posterIn .4s ease'}}>
            <img src={imgSrc(item)} alt="" style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}}/>
          </div>
        )}
        <div style={{flex:1,minWidth:0}}>
          <p style={{fontSize:16,fontWeight:900,color:'white',lineHeight:1.3,marginBottom:6}}>{item.russian||item.name}</p>
          {item.name&&item.russian&&item.name!==item.russian&&<p style={{fontSize:11,color:'rgba(255,255,255,.35)',fontWeight:600,marginBottom:8}} className="lc1">{item.name}</p>}
          <div style={{display:'flex',flexWrap:'wrap',gap:5}}>
            {item.score&&<Score n={item.score}/>}
            {item.kind&&<span style={{fontSize:10,fontWeight:800,padding:'2px 8px',borderRadius:7,background:`${themeP}22`,color:themeP}}>{item.kind.toUpperCase()}</span>}
            {item.status&&<span style={{fontSize:10,fontWeight:700,padding:'2px 8px',borderRadius:7,background:'rgba(255,255,255,.08)',color:'rgba(255,255,255,.45)'}}>{item.status}</span>}
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,marginTop:9}}>
            {[[item.aired_on?.slice(0,4),'📅 Год'],[item.episodes?`${item.episodes} эп.`:null,'🎬 Серии']].filter(([v])=>v).map(([v,l])=>(
              <div key={l} style={{padding:'7px 9px',borderRadius:10,background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.07)'}}>
                <p style={{margin:'0 0 2px',fontSize:9,fontWeight:700,opacity:.35}}>{l}</p>
                <p style={{margin:0,fontSize:13,fontWeight:900}}>{v}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Description */}
      {desc&&(
        <div style={{borderRadius:14,overflow:'hidden',background:'rgba(255,255,255,.04)',border:`1px solid ${themeP}22`}}>
          <button onClick={()=>setDescOpen(x=>!x)} style={{width:'100%',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 13px',background:'none',border:'none',cursor:'pointer',color:themeP,fontSize:11,fontWeight:900,textTransform:'uppercase',letterSpacing:'.06em',fontFamily:'inherit'}}>
            <span>📝 Описание</span>
            <span style={{transition:'transform .3s',transform:descOpen?'rotate(180deg)':'none',opacity:.6}}>▾</span>
          </button>
          {descOpen&&(
            <div className="desc-expand ns" style={{padding:'0 13px 13px',maxHeight:220,overflowY:'auto'}}>
              {item?.genres?.length>0&&<div style={{display:'flex',flexWrap:'wrap',gap:4,marginBottom:10}}>
                {item.genres.map(g=><span key={g.id} style={{fontSize:10,fontWeight:700,padding:'2px 8px',borderRadius:20,background:`${themeP}18`,color:`${themeP}cc`,border:`1px solid ${themeP}30`}}>{g.russian||g.name}</span>)}
              </div>}
              <p style={{fontSize:12,lineHeight:1.7,color:'rgba(255,255,255,.6)'}}>{desc}</p>
            </div>
          )}
        </div>
      )}

      {/* Status */}
      <div>
        <p style={{fontSize:10,fontWeight:900,opacity:.35,textTransform:'uppercase',letterSpacing:'.08em',marginBottom:7}}>Статус просмотра</p>
        <div style={{display:'flex',flexDirection:'column',gap:5}}>
          {[['watching','👁 Смотрю','#60a5fa'],['planned','⏳ В планах','#f59e0b'],['completed','✅ Завершено','#22c55e']].map(([k,l,c])=>(
            <button key={k} onClick={()=>onStatus(item,k)} style={btnStyle(status===k,c)}>{l}</button>
          ))}
        </div>
      </div>

      {/* Rating */}
      <div>
        <p style={{fontSize:10,fontWeight:900,opacity:.35,textTransform:'uppercase',letterSpacing:'.08em',marginBottom:7}}>Оценка</p>
        <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:5}}>
          {[1,2,3,4,5,6,7,8,9,10].map(sc=>(
            <button key={sc} onClick={()=>onRate(item,sc)} style={{aspectRatio:'1/1',borderRadius:10,border:'none',cursor:'pointer',fontWeight:900,fontSize:13,fontFamily:'inherit',transition:'all .2s',background:rating===sc?grad:'rgba(255,255,255,.07)',color:rating===sc?'white':'rgba(255,255,255,.35)',boxShadow:rating===sc?`0 4px 14px ${themeP}44`:'',transform:rating===sc?'scale(1.1)':'scale(1)',animation:rating===sc?'pop .3s ease both':''}}>
              {sc}
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      {isAuth&&(
        <div>
          <p style={{fontSize:10,fontWeight:900,opacity:.35,textTransform:'uppercase',letterSpacing:'.08em',marginBottom:7}}>Заметки</p>
          <textarea value={note} onChange={e=>onNote(item.id,e.target.value)} placeholder="Ваши мысли…" rows={3}
            style={{width:'100%',padding:'10px 12px',borderRadius:12,border:`1.5px solid ${note?themeP+'66':'rgba(255,255,255,.1)'}`,background:'rgba(255,255,255,.05)',color:'rgba(255,255,255,.85)',fontSize:12,fontWeight:500,resize:'vertical',outline:'none',fontFamily:'inherit',transition:'border-color .2s',minHeight:70}}
            onFocus={e=>e.target.style.borderColor=themeP+'88'}
            onBlur={e=>e.target.style.borderColor=note?themeP+'66':'rgba(255,255,255,.1)'}/>
        </div>
      )}

      {/* Actions */}
      <div style={{display:'flex',gap:7}}>
        <button onClick={()=>onWL(item)} style={{...btnStyle(inWL,themeP),flex:1}}>{inWL?'✓ В списке':'+ В список'}</button>
        <button onClick={()=>onFav(item)} style={{...btnStyle(isFav,'#ec4899'),flex:1}}>{isFav?'♥ Избранное':'♡ Избранное'}</button>
      </div>
      <button onClick={()=>onShare(item)} className="btn-ghost" style={{padding:'9px',borderRadius:12,fontSize:12,fontWeight:800,display:'flex',alignItems:'center',justifyContent:'center',gap:6}}>
        <span>📤</span><span>Поделиться</span>
      </button>
    </div>
  );
});

/* ═══════════════════════════════════════════════════════════════
   ITEM MODAL
═══════════════════════════════════════════════════════════════ */
const ItemModal = memo(({item,...rest}) => {
  if(!item) return null;
  const {themeP,themeS,onClose} = rest;
  return (
    <div className="fi" style={{position:'fixed',inset:0,zIndex:9800,background:'rgba(0,0,0,.97)',display:'flex',flexDirection:'column'}}>
      <div className="glass-dark" style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 13px',height:50,flexShrink:0,borderBottom:'1px solid rgba(255,255,255,.07)'}}>
        <div style={{display:'flex',alignItems:'center',gap:9,minWidth:0}}>
          <button onClick={onClose} style={{width:34,height:34,borderRadius:10,border:'none',background:'rgba(255,255,255,.08)',cursor:'pointer',color:'white',fontSize:16,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>←</button>
          <p className="lc1" style={{fontSize:13,fontWeight:900,color:'white'}}>{item.russian||item.name}</p>
        </div>
        <button onClick={onClose} style={{width:32,height:32,borderRadius:10,border:'1px solid rgba(239,68,68,.4)',background:'rgba(239,68,68,.12)',cursor:'pointer',color:'#f87171',fontSize:14,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>✕</button>
      </div>
      <div style={{flex:1,display:'flex',overflow:'hidden'}} className="modal-inner">
        {/* Player / image area */}
        <div style={{background:'#000',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,minHeight:220,maxHeight:'45vh',position:'relative',flex:'none',width:'100%'}} className="player-pane">
          {item.kind==='manga'?(
            <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:14,padding:20,width:'100%'}}>
              {imgSrc(item)&&<img src={imgSrc(item)} alt="" style={{maxHeight:200,borderRadius:16,boxShadow:`0 8px 32px ${themeP}44,0 0 0 2px ${themeP}44`,animation:'posterIn .5s ease'}}/>}
              <a href={`https://shikimori.one${item.url||''}`} target="_blank" rel="noreferrer" className="btn-primary" style={{padding:'12px 28px',borderRadius:14,fontSize:14,boxShadow:`0 8px 24px ${themeP}44`,display:'inline-block'}}>📖 Читать на Shikimori</a>
            </div>
          ):(
            <iframe src={`https://kodik.info/find-player?shikimoriID=${item.id}`} style={{width:'100%',height:'100%',border:'none',minHeight:220}} allowFullScreen allow="autoplay; fullscreen; picture-in-picture" title="Player"/>
          )}
        </div>
        {/* Detail panel */}
        <div style={{flex:1,overflow:'hidden',borderTop:'1px solid rgba(255,255,255,.07)'}}>
          <DetailPanel item={item} {...rest}/>
        </div>
      </div>
      <style>{`
        @media(min-width:1024px){
          .player-pane{flex:1!important;max-height:none!important;width:auto!important;min-height:0!important}
        }
      `}</style>
    </div>
  );
});

/* ═══════════════════════════════════════════════════════════════
   STATS PAGE
═══════════════════════════════════════════════════════════════ */
const StatsPage = memo(({stats,user,lib,ratings,favs,achs,themeP,themeS}) => {
  const grad  = `linear-gradient(135deg,${themeP},${themeS})`;
  const rank  = getRank(user.xp);
  const rvals = Object.values(ratings);
  const dist  = Array.from({length:10},(_,i)=>({s:i+1,c:rvals.filter(r=>r===i+1).length}));
  const maxC  = Math.max(...dist.map(d=>d.c),1);
  const byS   = {completed:Object.values(lib).filter(a=>a.status==='completed').length,watching:Object.values(lib).filter(a=>a.status==='watching').length,planned:Object.values(lib).filter(a=>a.status==='planned').length};

  return (
    <div className="fu" style={{display:'flex',flexDirection:'column',gap:14}}>
      {/* Rank hero */}
      <div style={{borderRadius:22,padding:20,background:`linear-gradient(135deg,${themeP}1a,${themeS}0d)`,border:`1px solid ${themeP}33`,position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:-50,right:-50,width:200,height:200,borderRadius:'50%',background:`${themeP}08`,pointerEvents:'none'}}/>
        <div style={{display:'flex',alignItems:'center',gap:14,position:'relative'}}>
          <div style={{width:68,height:68,borderRadius:18,background:grad,display:'flex',alignItems:'center',justifyContent:'center',fontSize:32,boxShadow:`0 8px 28px ${themeP}55`,flexShrink:0,animation:'glow 3s ease infinite'}}>{rank.b}</div>
          <div style={{flex:1,minWidth:0}}>
            <p style={{fontSize:22,fontWeight:900,color:rank.c,marginBottom:3}}>{rank.l}</p>
            <p style={{fontSize:12,color:'rgba(255,255,255,.45)',fontWeight:600,marginBottom:9}}>Уровень {stats.level} · {user.xp} XP всего</p>
            <Bar value={stats.xpInLvl} max={100} grad={grad} h={6}/>
            <p style={{fontSize:10,color:'rgba(255,255,255,.3)',fontWeight:600,marginTop:4}}>{stats.xpInLvl}/100 XP до следующего уровня</p>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="stats-grid">
        {[['Завершено',stats.watched,'#22c55e','✅'],['Смотрю',stats.watching,'#60a5fa','👁'],['В планах',stats.planned,'#f59e0b','⏳'],['Часов',stats.hours,'#a855f7','⏱'],['Оценено',stats.rated,'#eab308','★'],['Ср. оценка',stats.avgRating,'#ec4899','♥'],['Избранное',favs,'#f97316','♡'],['Заметки',stats.notes,'#14b8a6','📝']].map(([l,v,c,i])=>(
          <div key={l} style={{padding:12,borderRadius:14,background:`${c}0e`,border:`1px solid ${c}22`,animation:'countUp .4s ease both'}}>
            <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:4}}>
              <span style={{fontSize:14}}>{i}</span>
              <span style={{fontSize:10,fontWeight:700,color:`${c}88`,textTransform:'uppercase',letterSpacing:'.04em'}}>{l}</span>
            </div>
            <p style={{fontSize:24,fontWeight:900,color:c,lineHeight:1}}>{fmt(v)}</p>
          </div>
        ))}
      </div>

      {/* Library status distribution */}
      <div className="card" style={{borderRadius:18,padding:18}}>
        <p style={{fontSize:11,fontWeight:800,opacity:.35,textTransform:'uppercase',letterSpacing:'.08em',marginBottom:14}}>Библиотека</p>
        {[['completed','Завершено','#22c55e'],['watching','Смотрю','#60a5fa'],['planned','В планах','#f59e0b']].map(([k,l,c])=>(
          <div key={k} style={{marginBottom:12}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:5}}>
              <span style={{fontSize:12,fontWeight:700,color:'rgba(255,255,255,.55)'}}>{l}</span>
              <span style={{fontSize:12,fontWeight:900,color:c}}>{byS[k]}</span>
            </div>
            <Bar value={byS[k]} max={Math.max(...Object.values(byS),1)} grad={`linear-gradient(90deg,${c},${c}88)`} h={5}/>
          </div>
        ))}
      </div>

      {/* Rating chart */}
      {rvals.length>0&&(
        <div className="card" style={{borderRadius:18,padding:18}}>
          <p style={{fontSize:11,fontWeight:800,opacity:.35,textTransform:'uppercase',letterSpacing:'.08em',marginBottom:14}}>Распределение оценок</p>
          <div style={{display:'flex',gap:5,alignItems:'flex-end',height:80}}>
            {dist.map(({s,c})=>{
              const h=(c/maxC)*100;
              const col=s>=8?'#22c55e':s>=6?'#eab308':s>=4?'#f97316':'#ef4444';
              return (
                <div key={s} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:3}}>
                  <span style={{fontSize:9,fontWeight:900,color:'rgba(255,255,255,.35)'}}>{c||''}</span>
                  <div style={{width:'100%',borderRadius:'4px 4px 0 0',background:c?col:'rgba(255,255,255,.07)',height:`${Math.max(h,c?8:4)}%`,transition:'height .6s ease',minHeight:4}}/>
                  <span style={{fontSize:9,fontWeight:800,color:'rgba(255,255,255,.35)'}}>{s}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Achievements */}
      <div className="card" style={{borderRadius:18,padding:18}}>
        <div style={{display:'flex',justifyContent:'space-between',marginBottom:12}}>
          <p style={{fontSize:11,fontWeight:800,opacity:.35,textTransform:'uppercase',letterSpacing:'.08em'}}>Достижения</p>
          <span style={{fontSize:12,fontWeight:900,color:themeP}}>{achs.length}/{ACHS.length}</span>
        </div>
        <Bar value={achs.length} max={ACHS.length} grad={grad} h={6} style={{marginBottom:14}}/>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:6}}>
          {ACHS.map(a=>{
            const done=achs.includes(a.id);
            return (
              <div key={a.id} title={`${a.n}: ${a.d}`} style={{borderRadius:12,padding:'9px 4px',textAlign:'center',background:done?`${themeP}18`:'rgba(255,255,255,.04)',border:`1px solid ${done?themeP+'44':'rgba(255,255,255,.06)'}`,opacity:done?1:.38,transition:'all .3s',animation:done?'pop .5s ease both':''}}>
                <span style={{fontSize:18,display:'block',marginBottom:3}}>{a.e}</span>
                <p style={{fontSize:9,fontWeight:900,color:done?'white':'rgba(255,255,255,.5)',lineHeight:1.2}}>{a.n}</p>
                {done&&<p style={{fontSize:9,fontWeight:900,color:themeP,marginTop:2}}>+{a.xp}XP</p>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Login streak */}
      <div className="card" style={{borderRadius:18,padding:18}}>
        <div style={{display:'flex',justifyContent:'space-between',marginBottom:12}}>
          <p style={{fontSize:11,fontWeight:800,opacity:.35,textTransform:'uppercase',letterSpacing:'.08em'}}>Стрик входа</p>
          <span style={{fontSize:12,fontWeight:900,color:'#f97316'}}>{user.loginStreak||0} дней 🔥</span>
        </div>
        <div style={{display:'flex',gap:5}}>
          {Array(7).fill(0).map((_,i)=>(
            <div key={i} style={{flex:1,height:8,borderRadius:99,background:i<(user.loginStreak||0)?grad:'rgba(255,255,255,.09)',transition:'background .3s'}}/>
          ))}
        </div>
        <div style={{display:'flex',justifyContent:'space-between',marginTop:6}}>
          {['Пн','Вт','Ср','Чт','Пт','Сб','Вс'].map((d,i)=>(
            <span key={i} style={{flex:1,textAlign:'center',fontSize:9,fontWeight:700,color:i<(user.loginStreak||0)?themeP:'rgba(255,255,255,.2)'}}>{d}</span>
          ))}
        </div>
      </div>
    </div>
  );
});

/* ═══════════════════════════════════════════════════════════════
   PROFILE SHEET
═══════════════════════════════════════════════════════════════ */
const ProfileSheet = memo(({user,stats,achs,themeP,themeS,syncSt,curTheme,darkMode,dailyGoal,onClose,onSave,onLogout,onDelete,onExport,onImport,onAvatar,onUser,onTheme,onDark,onDGoal,fileRef}) => {
  const [tab,setTab] = useState('profile');
  const rank = getRank(user.xp);
  const grad = `linear-gradient(135deg,${themeP},${themeS})`;
  const syncC={idle:'rgba(255,255,255,.3)',syncing:themeP,synced:'#22c55e',error:'#ef4444'}[syncSt];
  const inp={width:'100%',padding:'11px 13px',borderRadius:12,border:'1.5px solid rgba(255,255,255,.1)',background:'rgba(255,255,255,.06)',color:'white',fontSize:13,fontWeight:700,outline:'none',fontFamily:'inherit',transition:'all .2s'};

  return (
    <div style={{position:'fixed',inset:0,zIndex:9900,display:'flex',flexDirection:'column',justifyContent:'flex-end'}}>
      <div className="fi" style={{position:'absolute',inset:0,background:'rgba(0,0,0,.78)',backdropFilter:'blur(16px)'}} onClick={onClose}/>
      <div className="su glass-dark prof-sheet" style={{position:'relative',borderRadius:'26px 26px 0 0',maxHeight:'92dvh',display:'flex',flexDirection:'column',boxShadow:'0 -28px 70px rgba(0,0,0,.75)'}}>
        <div style={{display:'flex',justifyContent:'center',padding:'10px 0 4px',flexShrink:0}}>
          <div style={{width:36,height:4,borderRadius:99,background:'rgba(255,255,255,.2)'}}/>
        </div>
        {/* Header */}
        <div style={{display:'flex',alignItems:'center',gap:12,padding:'8px 18px 12px',flexShrink:0,borderBottom:'1px solid rgba(255,255,255,.07)'}}>
          <div style={{position:'relative',flexShrink:0}}>
            <img src={user.avatar} alt="" onClick={()=>fileRef.current?.click()} style={{width:52,height:52,borderRadius:16,objectFit:'cover',border:`2.5px solid ${themeP}`,boxShadow:`0 0 18px ${themeP}55`,cursor:'pointer',display:'block'}}/>
            <input type="file" ref={fileRef} onChange={onAvatar} accept="image/*" style={{display:'none'}}/>
            <div style={{position:'absolute',bottom:-4,right:-4,width:18,height:18,borderRadius:6,background:grad,display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,color:'white',fontWeight:900,pointerEvents:'none'}}>✎</div>
          </div>
          <div style={{flex:1,minWidth:0}}>
            <p className="lc1" style={{fontSize:16,fontWeight:900,color:'white'}}>{user.name}</p>
            <p style={{fontSize:11,fontWeight:700,color:rank.c,marginTop:2}}>{rank.b} {rank.l} · Ур.{stats.level}</p>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:8,flexShrink:0}}>
            <div style={{display:'flex',alignItems:'center',gap:5,padding:'4px 9px',borderRadius:8,background:'rgba(255,255,255,.06)',color:syncC,fontSize:10,fontWeight:800}}>
              {syncSt==='syncing'?<Spinner size={10} color={themeP}/>:<span style={{width:6,height:6,borderRadius:'50%',background:'currentColor',display:'inline-block',flexShrink:0}}/>}
              <span>{syncSt==='synced'?'Сохр.':syncSt==='syncing'?'Синхр.':syncSt==='error'?'Ошибка':'Облако'}</span>
            </div>
            <button onClick={onClose} style={{width:30,height:30,borderRadius:10,border:'none',background:'rgba(255,255,255,.08)',cursor:'pointer',color:'rgba(255,255,255,.5)',fontSize:14,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'inherit'}}>✕</button>
          </div>
        </div>
        {/* XP bar */}
        <div style={{padding:'8px 18px 12px',flexShrink:0,borderBottom:'1px solid rgba(255,255,255,.07)'}}>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:5}}>
            <span style={{fontSize:11,opacity:.35,fontWeight:700}}>Прогресс уровня</span>
            <span style={{fontSize:11,fontWeight:900,color:themeP}}>{stats.xpInLvl}/100 XP</span>
          </div>
          <Bar value={stats.xpInLvl} max={100} grad={grad} h={5}/>
        </div>
        {/* Tabs */}
        <div style={{display:'flex',gap:4,padding:'8px 18px',flexShrink:0,borderBottom:'1px solid rgba(255,255,255,.07)'}}>
          {[['profile','Профиль','👤'],['settings','Настройки','⚙️'],['data','Данные','💾']].map(([k,l,i])=>(
            <button key={k} onClick={()=>setTab(k)} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:2,padding:'7px 4px',borderRadius:10,border:'none',cursor:'pointer',fontFamily:'inherit',background:tab===k?`${themeP}22`:'transparent',color:tab===k?themeP:'rgba(255,255,255,.35)',transition:'all .2s'}}>
              <span style={{fontSize:15}}>{i}</span><span style={{fontSize:10,fontWeight:800}}>{l}</span>
            </button>
          ))}
        </div>
        {/* Tab content */}
        <div className="ns" style={{flex:1,overflowY:'auto',padding:'16px 18px 32px'}}>
          {tab==='profile'&&(
            <div className="fu" style={{display:'flex',flexDirection:'column',gap:12}}>
              <div>
                <label style={{display:'block',fontSize:10,fontWeight:900,opacity:.35,textTransform:'uppercase',letterSpacing:'.06em',marginBottom:6}}>Имя</label>
                <input value={user.name} maxLength={20} onChange={e=>onUser({name:e.target.value})} style={inp} onFocus={e=>{e.target.style.borderColor=themeP+'88';e.target.style.boxShadow=`0 0 0 3px ${themeP}15`;}} onBlur={e=>{e.target.style.borderColor='rgba(255,255,255,.1)';e.target.style.boxShadow='';}}/>
              </div>
              <div>
                <label style={{display:'block',fontSize:10,fontWeight:900,opacity:.35,textTransform:'uppercase',letterSpacing:'.06em',marginBottom:6}}>Биография</label>
                <input value={user.bio||''} maxLength={80} onChange={e=>onUser({bio:e.target.value})} placeholder="Расскажите о себе…" style={{...inp,color:'rgba(255,255,255,.7)'}} onFocus={e=>{e.target.style.borderColor=themeP+'88';e.target.style.boxShadow=`0 0 0 3px ${themeP}15`;}} onBlur={e=>{e.target.style.borderColor='rgba(255,255,255,.1)';e.target.style.boxShadow='';}}/>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8}}>
                {[['Завершено',stats.watched,'✅'],['Часов',stats.hours,'⏱'],['Оценено',stats.rated,'★']].map(([l,v,i])=>(
                  <div key={l} style={{borderRadius:14,padding:'12px 8px',textAlign:'center',background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.07)'}}>
                    <span style={{fontSize:20,display:'block',marginBottom:3}}>{i}</span>
                    <p style={{fontSize:18,fontWeight:900,color:'white'}}>{fmt(v)}</p>
                    <p style={{fontSize:10,opacity:.35,fontWeight:700}}>{l}</p>
                  </div>
                ))}
              </div>
              <div style={{padding:13,borderRadius:14,background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.07)'}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:7}}>
                  <span style={{fontSize:11,opacity:.35,fontWeight:700}}>Стрик входа</span>
                  <span style={{fontSize:11,fontWeight:900,color:'#f97316'}}>{user.loginStreak||0} дней 🔥</span>
                </div>
                <div style={{display:'flex',gap:5}}>
                  {Array(7).fill(0).map((_,i)=><div key={i} style={{flex:1,height:6,borderRadius:99,background:i<(user.loginStreak||0)?grad:'rgba(255,255,255,.1)',transition:'background .3s'}}/>)}
                </div>
              </div>
              <button onClick={()=>{onSave();onClose();}} className="btn-primary" style={{padding:13,borderRadius:14,fontSize:14,boxShadow:`0 8px 24px ${themeP}44`}}>💾 Сохранить</button>
              <button onClick={onLogout} className="btn-ghost" style={{padding:11,borderRadius:12,fontSize:13,border:'1px solid rgba(239,68,68,.3)',color:'#f87171',background:'rgba(239,68,68,.09)'}}>🚪 Выйти</button>
              <button onClick={onDelete} style={{padding:7,borderRadius:10,border:'none',background:'transparent',color:'rgba(239,68,68,.25)',cursor:'pointer',fontSize:11,fontWeight:700,fontFamily:'inherit',textAlign:'center'}}>⚠ Удалить аккаунт</button>
            </div>
          )}
          {tab==='settings'&&(
            <div className="fu" style={{display:'flex',flexDirection:'column',gap:16}}>
              <div>
                <p style={{fontSize:11,fontWeight:800,opacity:.35,textTransform:'uppercase',letterSpacing:'.08em',marginBottom:10}}>Цветовая тема</p>
                <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:7}}>
                  {Object.entries(THEMES).map(([k,t])=>{
                    const active=curTheme===k;
                    return <button key={k} onClick={()=>onTheme(k)} style={{padding:'10px 4px',borderRadius:13,border:`1.5px solid ${active?t.p:'rgba(255,255,255,.07)'}`,background:active?`${t.p}22`:'rgba(255,255,255,.04)',cursor:'pointer',textAlign:'center',fontFamily:'inherit',transition:'all .2s',transform:active?'scale(1.06)':'scale(1)'}}>
                      <div style={{fontSize:17,marginBottom:3}}>{t.i}</div>
                      <p style={{fontSize:10,fontWeight:900,color:active?t.p:'rgba(255,255,255,.45)',margin:0}}>{t.n}</p>
                    </button>;
                  })}
                </div>
              </div>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 13px',borderRadius:14,background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.07)'}}>
                <div><p style={{fontSize:13,fontWeight:800}}>Тёмный режим</p><p style={{fontSize:11,opacity:.35,marginTop:2}}>Всегда тёмная тема</p></div>
                <Toggle v={darkMode} onChange={onDark} color={themeP}/>
              </div>
              <div style={{padding:'12px 13px',borderRadius:14,background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.07)'}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:10}}>
                  <div><p style={{fontSize:13,fontWeight:800}}>Дневная цель</p><p style={{fontSize:11,opacity:.35,marginTop:2}}>Аниме в день</p></div>
                  <span style={{fontSize:24,fontWeight:900,color:themeP}}>{dailyGoal}</span>
                </div>
                <input type="range" min={1} max={10} value={dailyGoal} onChange={e=>onDGoal(+e.target.value)} style={{width:'100%',background:`linear-gradient(90deg,${themeP} ${dailyGoal*10}%,rgba(255,255,255,.12) ${dailyGoal*10}%)`}}/>
              </div>
            </div>
          )}
          {tab==='data'&&(
            <div className="fu" style={{display:'flex',flexDirection:'column',gap:11}}>
              <div style={{padding:14,borderRadius:14,background:'rgba(34,197,94,.06)',border:'1px solid rgba(34,197,94,.2)'}}>
                <p style={{fontSize:12,fontWeight:800,color:'#22c55e',marginBottom:5}}>✓ Облачная синхронизация</p>
                <p style={{fontSize:11,opacity:.5,lineHeight:1.55}}>Данные синхронизируются между устройствами. Войдите с теми же данными на другом устройстве.</p>
              </div>
              <div style={{display:'flex',gap:8}}>
                <button onClick={onExport} className="btn-ghost" style={{flex:1,padding:12,borderRadius:12,fontSize:12}}>💾 Экспорт</button>
                <label style={{flex:1,cursor:'pointer'}}>
                  <input type="file" onChange={onImport} accept=".json" style={{display:'none'}}/>
                  <div className="btn-ghost" style={{padding:12,borderRadius:12,fontSize:12,fontWeight:800,textAlign:'center',cursor:'pointer',border:'1px solid rgba(255,255,255,.1)'}}>📥 Импорт</div>
                </label>
              </div>
              <button onClick={()=>{if(window.confirm('Сбросить все данные?')){Object.keys(localStorage).filter(k=>k.startsWith('aniHub')).forEach(k=>localStorage.removeItem(k));window.location.reload();}}} style={{padding:10,borderRadius:12,border:'1px solid rgba(249,115,22,.3)',background:'rgba(249,115,22,.07)',color:'#fb923c',cursor:'pointer',fontSize:12,fontWeight:800,fontFamily:'inherit'}}>🗑 Сбросить данные</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

/* ═══════════════════════════════════════════════════════════════
   AUTH FORM
═══════════════════════════════════════════════════════════════ */
const AuthForm = memo(({mode,onSubmit,themeP,themeS,error,onToggle}) => {
  const [u,su] = useState('');
  const [p,sp] = useState('');
  const [show,setShow] = useState(false);
  const [rem,setRem]   = useState(true);
  const inp={width:'100%',padding:'13px 14px',borderRadius:13,border:'1.5px solid rgba(255,255,255,.1)',background:'rgba(255,255,255,.07)',color:'white',fontSize:14,fontWeight:600,outline:'none',fontFamily:'inherit',transition:'all .2s'};

  return (
    <div style={{display:'flex',flexDirection:'column',gap:13}}>
      {error&&<div style={{padding:'10px 13px',borderRadius:12,background:'#ef444418',border:'1px solid #ef444440',color:'#f87171',fontSize:13,fontWeight:700,textAlign:'center'}}>{error}</div>}
      <div>
        <label style={{display:'block',fontSize:11,fontWeight:800,opacity:.4,marginBottom:6,textTransform:'uppercase',letterSpacing:'.06em'}}>Имя пользователя</label>
        <input value={u} onChange={e=>su(e.target.value)} placeholder="Минимум 3 символа" style={inp} onFocus={e=>{e.target.style.borderColor=themeP+'88';e.target.style.boxShadow=`0 0 0 3px ${themeP}15`;}} onBlur={e=>{e.target.style.borderColor='rgba(255,255,255,.1)';e.target.style.boxShadow='';}}/>
      </div>
      <div>
        <label style={{display:'block',fontSize:11,fontWeight:800,opacity:.4,marginBottom:6,textTransform:'uppercase',letterSpacing:'.06em'}}>Пароль</label>
        <div style={{position:'relative'}}>
          <input type={show?'text':'password'} value={p} onChange={e=>sp(e.target.value)} placeholder="Минимум 6 символов" style={{...inp,paddingRight:44}} onFocus={e=>{e.target.style.borderColor=themeP+'88';e.target.style.boxShadow=`0 0 0 3px ${themeP}15`;}} onBlur={e=>{e.target.style.borderColor='rgba(255,255,255,.1)';e.target.style.boxShadow='';}} onKeyDown={e=>e.key==='Enter'&&onSubmit({u,p,rem})}/>
          <button type="button" onClick={()=>setShow(x=>!x)} style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',fontSize:17,opacity:.4,color:'white',padding:0}}>{show?'🙈':'👁'}</button>
        </div>
      </div>
      <div style={{display:'flex',alignItems:'center',gap:10,cursor:'pointer'}} onClick={()=>setRem(x=>!x)}>
        <div style={{width:21,height:21,borderRadius:7,display:'flex',alignItems:'center',justifyContent:'center',background:rem?`linear-gradient(135deg,${themeP},${themeS})`:'rgba(255,255,255,.1)',border:`1.5px solid ${rem?themeP:'rgba(255,255,255,.2)'}`,flexShrink:0,transition:'all .2s'}}>
          {rem&&<span style={{color:'white',fontSize:11,fontWeight:900}}>✓</span>}
        </div>
        <span style={{fontSize:13,opacity:.5,fontWeight:600,userSelect:'none'}}>Запомнить на 90 дней</span>
      </div>
      <button type="button" onClick={()=>onSubmit({u,p,rem})} className="btn-primary" style={{width:'100%',padding:15,borderRadius:14,fontSize:15,boxShadow:`0 10px 28px ${themeP}44`}}>
        {mode==='login'?'🔐 Войти':'✨ Создать аккаунт'}
      </button>
      <p style={{textAlign:'center',fontSize:12}}>
        <button type="button" onClick={onToggle} style={{background:'none',border:'none',cursor:'pointer',color:themeP,fontWeight:700,fontSize:13,fontFamily:'inherit',opacity:.85}}>
          {mode==='login'?'Нет аккаунта? → Регистрация':'Есть аккаунт? → Войти'}
        </button>
      </p>
    </div>
  );
});

/* ═══════════════════════════════════════════════════════════════
   MAIN APP
═══════════════════════════════════════════════════════════════ */
export default function App() {

  /* ── Auth state ── */
  const [accounts, setAccounts] = useState({});
  const [isAuth,   setIsAuth]   = useState(false);
  const [curAcc,   setCurAcc]   = useState(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [authErr,  setAuthErr]  = useState('');
  const [logoutDlg,setLogoutDlg]= useState(false);
  const [syncSt,   setSyncSt]   = useState('idle');

  /* ── User data ── */
  const [user,     setUser]     = useState(()=>mkUser());
  const [library,  setLibrary]  = useState({});
  const [histD,    setHistD]    = useState([]);
  const [ratings,  setRatings]  = useState({});
  const [achs,     setAchs]     = useState([]);
  const [favs,     setFavs]     = useState([]);
  const [notes,    setNotes]    = useState({});
  const [wl,       setWl]       = useState([]);
  const [dailyGoal,setDailyGoal]= useState(3);
  const [dailyProg,setDailyProg]= useState(0);
  const [searchHist,setSearchHist]=useState([]);
  const [shareCount,setShareCount]=useState(0);
  const [xpToday,  setXpToday]  = useState({});

  /* ── UI state ── */
  const [boot,      setBoot]      = useState(true);
  const [view,      setView]      = useState('home');
  const [content,   setContent]   = useState([]);
  const [trendCache,setTrendCache]= useState([]);
  const [selItem,   setSelItem]   = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState('');
  const [genre,     setGenre]     = useState(null);
  const [page,      setPage]      = useState(1);
  const [sort,      setSort]      = useState('popularity');
  const [vMode,     setVMode]     = useState('grid');
  const [curTheme,  setCurTheme]  = useState('ocean');
  const [darkMode,  setDarkMode]  = useState(true);
  const [toasts,    setToasts]    = useState([]);
  const [achPop,    setAchPop]    = useState(null);
  const [profOpen,  setProfOpen]  = useState(false);
  const [descCache, setDescCache] = useState({});
  const [spotlight, setSpotlight] = useState(false);
  const [mSearch,   setMSearch]   = useState(false);  // mobile full-screen search
  const [filterOpen,setFilterOpen]= useState(false);
  const [filters,   setFilters]   = useState({year:null,scoreMin:0,kind:'',status:''});
  const [mousePos,  setMousePos]  = useState({x:0,y:0});

  const fileRef = useRef(null);
  const saveRef = useRef(null);
  const theme   = THEMES[curTheme]??THEMES.ocean;

  /* ── Mouse spotlight ── */
  useEffect(()=>{
    const h=e=>setMousePos({x:e.clientX,y:e.clientY});
    window.addEventListener('mousemove',h,{passive:true});
    return()=>window.removeEventListener('mousemove',h);
  },[]);

  /* ── Keyboard shortcuts ── */
  useEffect(()=>{
    const h=e=>{
      if((e.ctrlKey||e.metaKey)&&e.key==='k'){e.preventDefault();setSpotlight(x=>!x);}
      if(e.key==='Escape'){setSpotlight(false);setFilterOpen(false);setMSearch(false);}
    };
    window.addEventListener('keydown',h);
    return()=>window.removeEventListener('keydown',h);
  },[]);

  /* ── CSS inject ── */
  useEffect(()=>{
    let el=document.getElementById('ahub-css');
    if(!el){el=document.createElement('style');el.id='ahub-css';document.head.appendChild(el);}
    el.textContent=buildCSS(theme.p,theme.s,theme.b,theme.m);
    document.documentElement.style.setProperty('--base',theme.b);
    document.body.style.background=theme.b;
  },[curTheme,theme]);

  /* ── Boot splash ── */
  useEffect(()=>{ const t=setTimeout(()=>setBoot(false),1700); return()=>clearTimeout(t); },[]);

  /* ── Toast ── */
  const toast = useCallback((msg,type='success')=>{
    const id=Date.now()+Math.random();
    setToasts(p=>[...p.slice(-3),{id,msg,type}]);
    setTimeout(()=>setToasts(p=>p.filter(t=>t.id!==id)),3800);
  },[]);

  /* ── XP ── */
  const addXP = useCallback((amt,key)=>{
    if(!isAuth) return;
    const k=`${key}_${today()}`;
    if(xpToday[k]) return;
    setXpToday(p=>({...p,[k]:true}));
    setUser(p=>({...p,xp:p.xp+amt}));
  },[isAuth,xpToday]);

  /* ── Achievement unlock ── */
  const unlockAch = useCallback((id)=>{
    if(!isAuth) return;
    setAchs(prev=>{
      if(prev.includes(id)) return prev;
      const a=ACHS.find(x=>x.id===id); if(!a) return prev;
      setUser(u=>({...u,xp:u.xp+a.xp}));
      setAchPop(a); setTimeout(()=>setAchPop(null),4200);
      return [...prev,id];
    });
  },[isAuth]);

  /* ── Stats ── */
  const stats = useMemo(()=>{
    const lv   = Math.floor(user.xp/100)+1;
    const libV = Object.values(library);
    const watched  = libV.filter(a=>a.status==='completed').length;
    const watching = libV.filter(a=>a.status==='watching').length;
    const planned  = libV.filter(a=>a.status==='planned').length;
    const rv   = Object.values(ratings);
    const rated= rv.length;
    const avg  = rated?(rv.reduce((a,b)=>a+b,0)/rated).toFixed(1):'—';
    const notesCnt=Object.values(notes).filter(n=>n?.text).length;
    const perf10=rv.filter(r=>r===10).length;
    const genreSet=new Set(libV.filter(a=>a.status==='completed').flatMap(a=>a.genres?.map(g=>g.id)??[]));
    return {level:lv,xpInLvl:user.xp%100,watched,watching,planned,rated,avgRating:avg,hours:Math.round(watched*4.5),notes:notesCnt,perf10,genres:genreSet.size,libSize:Object.keys(library).length};
  },[user.xp,library,ratings,notes]);

  /* ── Ach triggers ── */
  useEffect(()=>{
    if(!isAuth) return;
    if(stats.watched>=1)    unlockAch('first');
    if(stats.rated>=10)     unlockAch('rate10');
    if(stats.watched>=50)   unlockAch('comp50');
    if(stats.level>=10)     unlockAch('lv10');
    if(favs.length>=20)     unlockAch('fav20');
    if(stats.notes>=10)     unlockAch('notes10');
    if(stats.libSize>=100)  unlockAch('lib100');
    if(searchHist.length>=10) unlockAch('search10');
    if(shareCount>=5)       unlockAch('share5');
    if(stats.perf10>=10)    unlockAch('perf10');
    if(stats.genres>=GENRES.length) unlockAch('genres');
    const h=new Date().getHours();
    if(h>=5&&h<7) unlockAch('early');
    if(h<3)       unlockAch('night');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[stats,isAuth,favs.length,searchHist.length,shareCount]);

  /* ═══════════════════════════════════════════════════════════════
     SESSION — localStorage first (reload-safe), cloud fallback
  ═══════════════════════════════════════════════════════════════ */
  const applyUserData = useCallback((uname,accs)=>{
    const ud=accs[uname]?.userData; if(!ud) return;
    setUser(ud.user??mkUser(uname));
    setLibrary(ud.library??{});
    setHistD(ud.history??[]);
    setRatings(ud.ratings??{});
    setAchs(ud.achs??[]);
    setFavs(ud.favs??[]);
    setNotes(ud.notes??{});
    setWl(ud.wl??[]);
    setCurTheme(ud.theme??'ocean');
    setDarkMode(ud.dark??true);
    setDailyGoal(ud.dGoal??3);
    setDailyProg(ud.dProg??0);
    setSearchHist(ud.searchHist??[]);
    setShareCount(ud.shareCount??0);
    setIsAuth(true);
    setCurAcc(uname);
  },[]);

  useEffect(()=>{
    (async()=>{
      // Load accounts
      let accs={};
      const lsRaw=LS.get(CLOUD_KEY);
      if(lsRaw){ try{accs=JSON.parse(lsRaw);}catch{} }
      try{
        const cr=await CS.get(CLOUD_KEY);
        if(cr){ const ca=JSON.parse(cr); accs=ca; LS.set(CLOUD_KEY,cr); }
      }catch{}
      setAccounts(accs);
      // XP today
      const td=today();
      if(LS.get('ahub_xp_date')!==td){ setXpToday({}); LS.set('ahub_xp_date',td); }
      else{ const s=LS.json('ahub_xp_today'); if(s) setXpToday(s); }
      // Auto-login from localStorage (reload-safe)
      const lsSess=LS.json(SESS_KEY);
      const lsUser=LS.get(USER_KEY);
      if(lsSess&&lsUser&&accs[lsUser]&&Date.now()-lsSess.ts<SESSION_TTL){
        applyUserData(lsUser,accs); return;
      }
      // Cloud session fallback (cross-device)
      try{
        const cr=await CS.get(SESS_KEY);
        const cu=await CS.get(USER_KEY);
        if(cr&&cu){ const cs=JSON.parse(cr); if(accs[cu]&&Date.now()-cs.ts<SESSION_TTL){ LS.set(SESS_KEY,cr); LS.set(USER_KEY,cu); applyUserData(cu,accs); } }
      }catch{}
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  /* ── Save ── */
  const save = useCallback(async()=>{
    if(!isAuth||!curAcc) return;
    const payload={user,library,history:histD,ratings,achs,favs,notes,wl,theme:curTheme,dark:darkMode,dGoal:dailyGoal,dProg:dailyProg,searchHist:searchHist.slice(0,20),shareCount};
    const upd={...accounts,[curAcc]:{...accounts[curAcc],userData:payload}};
    setAccounts(upd);
    const json=JSON.stringify(upd);
    LS.set(CLOUD_KEY,json);
    setSyncSt('syncing');
    try{ await CS.set(CLOUD_KEY,json); setSyncSt('synced'); }
    catch{ setSyncSt('error'); }
    setTimeout(()=>setSyncSt('idle'),2200);
  },[isAuth,curAcc,accounts,user,library,histD,ratings,achs,favs,notes,wl,curTheme,darkMode,dailyGoal,dailyProg,searchHist,shareCount]);

  useEffect(()=>{
    if(!isAuth||!curAcc) return;
    clearTimeout(saveRef.current);
    saveRef.current=setTimeout(save,SAVE_DELAY);
    return()=>clearTimeout(saveRef.current);
  },[user,library,histD,ratings,achs,favs,notes,wl,curTheme,darkMode,dailyGoal,dailyProg,isAuth,curAcc,save]);

  /* ── Auth handlers ── */
  const handleAuth = useCallback(async({u,p,rem})=>{
    setAuthErr('');
    if(!u||!p){ setAuthErr('Заполните все поля!'); return; }
    if(authMode==='register'){
      if(accounts[u])  { setAuthErr('Имя уже занято!'); return; }
      if(u.length<3)   { setAuthErr('Имя: мин. 3 символа!'); return; }
      if(p.length<6)   { setAuthErr('Пароль: мин. 6 символов!'); return; }
      const newAcc={username:u,hash:hashPw(p),created:new Date().toISOString(),userData:{user:mkUser(u),library:{},history:[],ratings:{},achs:[],favs:[],notes:{},wl:[],theme:'ocean',dark:true,dGoal:3,dProg:0,searchHist:[],shareCount:0}};
      const upd={...accounts,[u]:newAcc};
      const json=JSON.stringify(upd);
      LS.set(CLOUD_KEY,json); await CS.set(CLOUD_KEY,json);
      setAccounts(upd); toast(`Добро пожаловать, ${u}! 🎉`);
      setAuthMode('login'); setAuthErr(''); return;
    }
    const acc=accounts[u];
    if(!acc)               { setAuthErr('Аккаунт не найден!'); return; }
    if(acc.hash!==hashPw(p)){ setAuthErr('Неверный пароль!'); return; }
    const now=new Date();
    const last=acc.userData?.user?.lastLogin;
    let streak=acc.userData?.user?.loginStreak??0;
    if(last){ const d=Math.floor((+now-+new Date(last))/86400000); streak=d===1?streak+1:d>1?1:streak; } else streak=1;
    const sessObj=JSON.stringify({token:genToken(),ts:Date.now()});
    const updUser={...acc.userData.user,lastLogin:now.toISOString(),loginStreak:streak,totalLogins:(acc.userData.user.totalLogins??0)+1};
    const upd={...accounts,[u]:{...acc,userData:{...acc.userData,user:updUser}}};
    const json=JSON.stringify(upd);
    LS.set(CLOUD_KEY,json); await CS.set(CLOUD_KEY,json);
    setAccounts(upd);
    // Session — always localStorage, cloud if remember
    LS.set(SESS_KEY,sessObj); LS.set(USER_KEY,u);
    if(rem){ await CS.set(SESS_KEY,sessObj); await CS.set(USER_KEY,u); }
    applyUserData(u,upd);
    setAuthOpen(false);
    toast(`С возвращением, ${u}! 🎉`);
    if(streak===7) setTimeout(()=>unlockAch('streak7'),900);
  },[authMode,accounts,applyUserData,toast,unlockAch]);

  const doLogout = useCallback(async()=>{
    await save();
    LS.del(SESS_KEY); LS.del(USER_KEY);
    await CS.del(SESS_KEY); await CS.del(USER_KEY);
    setIsAuth(false); setCurAcc(null);
    setUser(mkUser()); setLibrary({}); setHistD([]); setRatings({});
    setAchs([]); setFavs([]); setNotes({}); setWl([]);
    setLogoutDlg(false); setProfOpen(false);
    toast('До встречи! 👋','info');
  },[save,toast]);

  const doDelete = useCallback(()=>{
    if(!window.confirm('Удалить аккаунт НАВСЕГДА?')) return;
    if(!window.confirm('Все данные исчезнут!')) return;
    const upd={...accounts}; delete upd[curAcc];
    const json=JSON.stringify(upd);
    LS.set(CLOUD_KEY,json); CS.set(CLOUD_KEY,json);
    setAccounts(upd); doLogout();
    toast('Аккаунт удалён','info');
  },[accounts,curAcc,doLogout,toast]);

  /* ── Content fetch ── */
  const SKIP=useMemo(()=>new Set(['library','history','trending','favs','watchlist','stats']),[]);

  useEffect(()=>{
    if(SKIP.has(view)){ setLoading(false); return; }
    let cancelled=false;
    (async()=>{
      setLoading(true);
      try{
        const ep=view==='manga'?'mangas':'animes';
        let url=`${API}/${ep}?limit=${PER_PAGE}&page=${page}&order=${sort}`;
        if(search) url+=`&search=${encodeURIComponent(search)}`;
        if(genre)  url+=`&genre=${genre}`;
        if(filters.year)    url+=`&season=${filters.year}`;
        if(filters.kind)    url+=`&kind=${filters.kind}`;
        if(filters.status)  url+=`&status=${filters.status}`;
        if(filters.scoreMin)url+=`&score=${filters.scoreMin}`;
        const [dataR,trendR]=await Promise.all([
          fetch(url),
          trendCache.length?null:fetch(`${API}/animes?limit=${TREND_PER}&page=1&order=popularity`),
        ]);
        if(cancelled) return;
        const data=await dataR.json();
        setContent(Array.isArray(data)?data:[]);
        if(trendR){ const td=await trendR.json(); if(!cancelled) setTrendCache(Array.isArray(td)?td:[]); }
      }catch{ if(!cancelled) toast('Ошибка загрузки','error'); }
      finally{ if(!cancelled) setTimeout(()=>setLoading(false),80); }
    })();
    return()=>{cancelled=true;};
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[view,search,genre,page,sort,filters]);

  /* ── Fetch full item desc ── */
  useEffect(()=>{
    if(!selItem?.id||selItem.description) return;
    let cancelled=false;
    const ep=selItem.kind==='manga'?'mangas':'animes';
    fetch(`${API}/${ep}/${selItem.id}`).then(r=>r.json()).then(d=>{
      if(cancelled) return;
      const desc_text=stripHtml(d.description_html??d.description??'');
      const enr={description:d.description_html??d.description??'',desc_text,genres:d.genres??[],episodes:d.episodes??selItem.episodes,status:d.status??selItem.status};
      setSelItem(p=>p?{...p,...enr}:null);
      setDescCache(c=>({...c,[selItem.id]:enr}));
    }).catch(()=>{});
    return()=>{cancelled=true;};
  },[selItem?.id]);

  /* ── Prefetch desc for list mode ── */
  useEffect(()=>{
    if(vMode!=='list') return;
    const visible=displayData.slice(0,10);
    visible.forEach(item=>{
      if(descCache[item.id]) return;
      fetch(`${API}/animes/${item.id}`).then(r=>r.json()).then(d=>{
        const desc_text=stripHtml(d.description_html??d.description??'');
        setDescCache(c=>({...c,[item.id]:{description:d.description_html??d.description??'',desc_text,genres:d.genres??[],episodes:d.episodes}}));
      }).catch(()=>{});
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[vMode,page,view]);

  /* ── Actions ── */
  const openItem = useCallback((item)=>{
    setSelItem(item);
    setHistD(p=>[{...item,viewDate:new Date().toLocaleString('ru'),ts:Date.now()},...p.filter(h=>h.id!==item.id)].slice(0,120));
    if(isAuth){
      addXP(2,`view_${item.id}`);
      const td=today();
      if(LS.get('ahub_pd')!==td){ setDailyProg(1); LS.set('ahub_pd',td); }
      else setDailyProg(p=>Math.min(p+1,dailyGoal));
    }
  },[isAuth,addXP,dailyGoal]);

  const handleStatus=useCallback((item,status)=>{
    if(!isAuth){ setAuthOpen(true); return; }
    setLibrary(p=>{ const was=p[item.id]?.status; addXP(status==='completed'&&was!=='completed'?25:10,`lib_${item.id}_${status}`); return {...p,[item.id]:{...item,status,addedDate:new Date().toISOString(),genres:item.genres??[]}}; });
    toast({watching:'👁 Смотрю',planned:'⏳ В планах',completed:'✅ Завершено'}[status]);
  },[isAuth,addXP,toast]);

  const handleRate=useCallback((item,score)=>{
    if(!isAuth){ setAuthOpen(true); return; }
    setRatings(p=>({...p,[item.id]:score}));
    addXP(5,`rate_${item.id}`);
    toast(`Оценка ${score}/10 ★`);
  },[isAuth,addXP,toast]);

  const handleFav=useCallback((item)=>{
    if(!isAuth){ setAuthOpen(true); return; }
    setFavs(p=>{ const has=p.some(f=>f.id===item.id); toast(has?'Убрано из избранного':'♥ В избранное',has?'info':'success'); if(!has) addXP(5,`fav_${item.id}`); return has?p.filter(f=>f.id!==item.id):[...p,{...item,favDate:new Date().toISOString()}]; });
  },[isAuth,addXP,toast]);

  const handleWL=useCallback((item)=>{
    if(!isAuth){ setAuthOpen(true); return; }
    setWl(p=>{ const has=p.some(w=>w.id===item.id); toast(has?'Убрано из списка':'+ В список',has?'info':'success'); if(!has) addXP(3,`wl_${item.id}`); return has?p.filter(w=>w.id!==item.id):[...p,{...item,wlDate:new Date().toISOString()}]; });
  },[isAuth,addXP,toast]);

  const handleNote=useCallback((id,text)=>{ if(!isAuth) return; setNotes(p=>({...p,[id]:{text,date:new Date().toISOString()}})); addXP(2,`note_${id}`); },[isAuth,addXP]);

  const handleShare=useCallback((item)=>{
    const url=`https://shikimori.one${item.url||''}`;
    if(navigator.share) navigator.share({title:item.russian||item.name,url}).catch(()=>{});
    else navigator.clipboard?.writeText(url).then(()=>toast('Ссылка скопирована 📋')).catch(()=>toast('Ошибка копирования','error'));
    if(isAuth){ setShareCount(x=>x+1); addXP(2,`share_${item.id}`); }
  },[isAuth,addXP,toast]);

  const handleAvatar=useCallback((e)=>{
    const f=e.target.files?.[0]; if(!f) return;
    if(f.size>5e6){ toast('Файл слишком большой!','error'); return; }
    const r=new FileReader();
    r.onloadend=()=>{ setUser(p=>({...p,avatar:r.result})); toast('Аватар обновлён! 🖼'); };
    r.readAsDataURL(f);
  },[toast]);

  const handleSearch=useCallback((v)=>{
    setSearch(v); setPage(1);
    if(v.trim()&&isAuth) setSearchHist(p=>[v,...p.filter(s=>s!==v)].slice(0,20));
  },[isAuth]);

  const randomAnime=useCallback(()=>{
    const pool=content.length?content:trendCache;
    if(!pool.length){ toast('Список пуст','info'); return; }
    openItem(pool[Math.floor(Math.random()*pool.length)]);
    toast('🎲 Случайное аниме!');
  },[content,trendCache,openItem,toast]);

  const doExport=useCallback(()=>{
    if(!isAuth){ toast('Войдите!','warning'); return; }
    const blob=new Blob([JSON.stringify({ver:VER,user,library,history:histD,ratings,achs,favs,notes,wl,theme:curTheme})],{type:'application/json'});
    const a=Object.assign(document.createElement('a'),{href:URL.createObjectURL(blob),download:`anihub-${curAcc}-${Date.now()}.json`});
    a.click(); URL.revokeObjectURL(a.href); toast('Экспортировано 💾');
  },[isAuth,user,library,histD,ratings,achs,favs,notes,wl,curTheme,curAcc,toast]);

  const doImport=useCallback((e)=>{
    const f=e.target.files?.[0]; if(!f) return;
    const r=new FileReader();
    r.onload=ev=>{ try{ const d=JSON.parse(ev.target.result); if(d.user) setUser(d.user); if(d.library) setLibrary(d.library); if(d.history) setHistD(d.history); if(d.ratings) setRatings(d.ratings); if(d.achs) setAchs(d.achs); if(d.favs) setFavs(d.favs); if(d.notes) setNotes(d.notes); if(d.wl) setWl(d.wl); if(d.theme) setCurTheme(d.theme); toast('Импортировано ✅'); }catch{ toast('Ошибка импорта','error'); } };
    r.readAsText(f);
  },[toast]);

  /* ── Display data ── */
  const displayData = useMemo(()=>{
    const m={library:Object.values(library),history:histD,trending:trendCache,favs,watchlist:wl};
    return m[view]??content;
  },[view,library,histD,trendCache,favs,wl,content]);

  const favIds = useMemo(()=>new Set(favs.map(f=>f.id)),[favs]);
  const wlIds  = useMemo(()=>new Set(wl.map(w=>w.id)),[wl]);
  const hasFilters = filters.year||filters.scoreMin>0||filters.kind||filters.status;

  const viewTitle={history:'⏱ История',library:'◈ Библиотека',manga:'📖 Манга',favs:'♥ Избранное',watchlist:'◎ Список',stats:'📊 Статистика'};
  const gridCols = typeof window!=='undefined'?Math.max(Math.floor((window.innerWidth-248)/145),3):5;

  /* ── Detail panel props ── */
  const dpProps = useMemo(()=>({
    lib:library,ratings,notes,favs:favIds,wl:wlIds,themeP:theme.p,themeS:theme.s,isAuth,
    onStatus:handleStatus,onRate:handleRate,onNote:handleNote,onFav:handleFav,onWL:handleWL,onShare:handleShare,
  }),[library,ratings,notes,favIds,wlIds,theme.p,theme.s,isAuth,handleStatus,handleRate,handleNote,handleFav,handleWL,handleShare]);

  /* ══════════════════════════════════════════════════
     BOOT SCREEN
  ══════════════════════════════════════════════════ */
  if(boot) return (
    <div style={{position:'fixed',inset:0,background:theme.b,display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:24,fontFamily:'Outfit,system-ui,sans-serif'}}>
      <div style={{position:'relative',width:96,height:96}}>
        <div style={{position:'absolute',inset:0,borderRadius:28,background:`conic-gradient(${theme.p},${theme.s},#a855f7,${theme.p})`,animation:'spin 1.8s linear infinite'}}/>
        <div style={{position:'absolute',inset:4,borderRadius:24,background:theme.b,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <span style={{fontSize:38,fontWeight:900,color:'white'}}>A</span>
        </div>
      </div>
      <div style={{textAlign:'center'}}>
        <p style={{fontSize:36,fontWeight:900,background:`linear-gradient(135deg,${theme.p},#a855f7,${theme.s})`,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',margin:'0 0 6px'}}>AniHub</p>
        <p style={{fontSize:12,color:'rgba(255,255,255,.28)',fontWeight:600}}>Premium Anime Platform</p>
      </div>
      <div style={{display:'flex',gap:8}}>
        {[0,1,2,3,4].map(i=><div key={i} style={{width:7,height:7,borderRadius:'50%',background:theme.p,animation:`float .85s ${i*.12}s ease-in-out infinite`}}/>)}
      </div>
    </div>
  );

  /* ══════════════════════════════════════════════════
     MAIN APP RENDER
  ══════════════════════════════════════════════════ */
  return (
    <div style={{minHeight:'100dvh',background:theme.b,color:'white',overflowX:'hidden',position:'relative'}}>
      {/* Noise layer */}
      <div className="noise-layer"/>
      {/* Cursor glow */}
      <div style={{position:'fixed',width:520,height:520,borderRadius:'50%',background:`radial-gradient(circle,${theme.p}0d 0%,transparent 70%)`,left:mousePos.x,top:mousePos.y,transform:'translate(-50%,-50%)',pointerEvents:'none',zIndex:0,transition:'left .08s,top .08s'}}/>

      <Toasts items={toasts}/>

      {/* Achievement popup */}
      {achPop&&(
        <div className="ap" style={{position:'fixed',bottom:88,right:14,zIndex:9700,maxWidth:280,width:'calc(100vw - 28px)'}}>
          <div className="glass-dark" style={{borderRadius:20,padding:15,border:`1.5px solid ${theme.p}55`,boxShadow:`0 20px 60px rgba(0,0,0,.7)`}}>
            <p style={{fontSize:10,fontWeight:900,opacity:.35,textTransform:'uppercase',letterSpacing:'.09em',marginBottom:10}}>🏆 Достижение!</p>
            <div style={{display:'flex',alignItems:'center',gap:11}}>
              <div style={{width:46,height:46,borderRadius:14,background:`linear-gradient(135deg,${theme.p},${theme.s})`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0,boxShadow:`0 6px 20px ${theme.p}55`}}>{achPop.e}</div>
              <div>
                <p style={{fontSize:14,fontWeight:900,color:'white',marginBottom:2}}>{achPop.n}</p>
                <p style={{fontSize:11,opacity:.45,marginBottom:4}}>{achPop.d}</p>
                <p style={{fontSize:12,fontWeight:900,color:theme.p}}>+{achPop.xp} XP</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {mSearch&&<SearchOverlay onClose={()=>setMSearch(false)} themeP={theme.p} themeS={theme.s} onOpen={openItem} history={searchHist} onClearHist={()=>setSearchHist([])}/>}
      {spotlight&&<Spotlight onClose={()=>setSpotlight(false)} themeP={theme.p} themeS={theme.s} onOpen={openItem} history={searchHist} onClearHist={()=>setSearchHist([])}/>}
      {filterOpen&&<FilterPanel filters={filters} onChange={setFilters} themeP={theme.p} themeS={theme.s} onClose={()=>setFilterOpen(false)}/>}
      {selItem&&<ItemModal item={selItem} onClose={()=>setSelItem(null)} {...dpProps}/>}
      {profOpen&&isAuth&&(
        <ProfileSheet user={user} stats={stats} achs={achs} themeP={theme.p} themeS={theme.s} syncSt={syncSt} curTheme={curTheme} darkMode={darkMode} dailyGoal={dailyGoal}
          onClose={()=>setProfOpen(false)} onSave={save} onLogout={()=>{setProfOpen(false);setLogoutDlg(true);}} onDelete={doDelete}
          onExport={doExport} onImport={doImport} onAvatar={handleAvatar}
          onUser={d=>setUser(p=>({...p,...d}))} onTheme={setCurTheme} onDark={setDarkMode} onDGoal={setDailyGoal} fileRef={fileRef}/>
      )}
      {/* Auth modal */}
      {authOpen&&(
        <div className="fi" style={{position:'fixed',inset:0,zIndex:9500,display:'flex',flexDirection:'column',justifyContent:'flex-end'}}>
          <div style={{position:'absolute',inset:0,background:'rgba(0,0,0,.82)',backdropFilter:'blur(18px)'}} onClick={()=>{setAuthOpen(false);setAuthErr('');}}/>
          <div className="glass-dark su prof-sheet" style={{position:'relative',borderRadius:'26px 26px 0 0',padding:'20px 20px 38px',boxShadow:'0 -24px 70px rgba(0,0,0,.75)'}}>
            <div style={{display:'flex',justifyContent:'center',marginBottom:10}}><div style={{width:32,height:4,borderRadius:99,background:'rgba(255,255,255,.2)'}}/></div>
            <div style={{display:'flex',alignItems:'center',gap:13,marginBottom:22}}>
              <div style={{width:48,height:48,borderRadius:14,background:`linear-gradient(135deg,${theme.p},${theme.s})`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,boxShadow:`0 8px 22px ${theme.p}44`,flexShrink:0}}>{authMode==='login'?'🔐':'✨'}</div>
              <div><p style={{fontSize:18,fontWeight:900,color:'white',marginBottom:2}}>{authMode==='login'?'Добро пожаловать':'Создать аккаунт'}</p><p style={{fontSize:12,opacity:.35}}>{authMode==='login'?'Войдите в аккаунт':'Начните путешествие'}</p></div>
              <button onClick={()=>{setAuthOpen(false);setAuthErr('');}} style={{marginLeft:'auto',width:30,height:30,borderRadius:10,border:'none',background:'rgba(255,255,255,.08)',color:'rgba(255,255,255,.5)',cursor:'pointer',fontSize:14,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'inherit'}}>✕</button>
            </div>
            <AuthForm mode={authMode} onSubmit={handleAuth} themeP={theme.p} themeS={theme.s} error={authErr} onToggle={()=>{setAuthMode(m=>m==='login'?'register':'login');setAuthErr('');}}/>
          </div>
        </div>
      )}
      {logoutDlg&&(
        <div className="fi" style={{position:'fixed',inset:0,zIndex:9600,display:'flex',alignItems:'center',justifyContent:'center',padding:'0 20px',background:'rgba(0,0,0,.88)',backdropFilter:'blur(18px)'}}>
          <div className="glass-dark si" style={{borderRadius:24,padding:'28px 24px',textAlign:'center',maxWidth:300,width:'100%'}}>
            <div style={{width:56,height:56,borderRadius:18,margin:'0 auto 14px',background:'rgba(239,68,68,.12)',border:'1px solid rgba(239,68,68,.3)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:24}}>🚪</div>
            <p style={{fontSize:18,fontWeight:900,marginBottom:7}}>Выйти?</p>
            <p style={{fontSize:12,opacity:.35,marginBottom:22}}>Данные сохранены в облаке.</p>
            <div style={{display:'flex',gap:10}}>
              <button onClick={()=>setLogoutDlg(false)} className="btn-ghost" style={{flex:1,padding:12,borderRadius:13,fontSize:13}}>Отмена</button>
              <button onClick={doLogout} className="btn-primary" style={{flex:1,padding:12,borderRadius:13,fontSize:13,background:'linear-gradient(135deg,#ef4444,#dc2626)',boxShadow:'0 8px 22px rgba(239,68,68,.4)'}}>Выйти</button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════ HEADER ════════════════ */}
      <header style={{position:'sticky',top:0,zIndex:700,background:`${theme.b}ee`,backdropFilter:'blur(24px) saturate(200%)',borderBottom:'1px solid rgba(255,255,255,.07)'}}>
        <div style={{maxWidth:1700,margin:'0 auto',padding:'0 16px',height:56,display:'flex',alignItems:'center',gap:10}}>
          {/* Logo */}
          <div onClick={()=>{setView('home');setPage(1);setGenre(null);setSearch('');setFilters({year:null,scoreMin:0,kind:'',status:''}); }} style={{display:'flex',alignItems:'center',gap:9,cursor:'pointer',flexShrink:0,userSelect:'none'}} onMouseEnter={e=>e.currentTarget.querySelector('.logo-icon').style.transform='scale(1.1) rotate(-5deg)'} onMouseLeave={e=>e.currentTarget.querySelector('.logo-icon').style.transform='scale(1) rotate(0)'}>
            <div className="logo-icon" style={{width:34,height:34,borderRadius:11,background:`linear-gradient(135deg,${theme.p},${theme.s})`,display:'flex',alignItems:'center',justifyContent:'center',boxShadow:`0 0 16px ${theme.p}55`,transition:'transform .3s cubic-bezier(.34,1.56,.64,1)',animation:'glow 3s ease infinite',flexShrink:0}}>
              <span style={{fontSize:17,fontWeight:900,color:'white'}}>A</span>
            </div>
            <span className="logo-txt" style={{fontSize:19,fontWeight:900,background:`linear-gradient(135deg,${theme.p},white)`,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>AniHub</span>
          </div>

          {/* Desktop nav */}
          <nav className="d-nav" style={{gap:2,flexShrink:0}}>
            {NAV.map(v=>(
              <button key={v.k} onClick={()=>setView(v.k)} style={{padding:'6px 11px',borderRadius:10,border:'none',cursor:'pointer',fontFamily:'inherit',fontSize:12,fontWeight:700,transition:'all .2s',whiteSpace:'nowrap',background:view===v.k?`${theme.p}1e`:'transparent',color:view===v.k?theme.p:'rgba(255,255,255,.38)',borderBottom:view===v.k?`2px solid ${theme.p}`:'2px solid transparent'}}>
                {v.l}
              </button>
            ))}
          </nav>

          {/* Search bar — desktop click-to-open spotlight, mobile opens full overlay */}
          <div className="search-bar" onClick={()=>{ if(window.innerWidth>=1024) setSpotlight(true); else setMSearch(true); }}
            style={{flex:1,maxWidth:400,margin:'0 8px',cursor:'pointer',userSelect:'none'}}>
            <div style={{display:'flex',alignItems:'center',gap:9,padding:'8px 13px',borderRadius:12,background:'rgba(255,255,255,.07)',border:'1.5px solid rgba(255,255,255,.09)',transition:'all .2s'}}
              onMouseEnter={e=>e.currentTarget.style.borderColor=theme.p+'55'}
              onMouseLeave={e=>e.currentTarget.style.borderColor='rgba(255,255,255,.09)'}>
              <span style={{fontSize:14,opacity:.3}}>🔍</span>
              <span style={{fontSize:13,fontWeight:600,color:'rgba(255,255,255,.28)',flex:1}}>{search||'Поиск аниме…'}</span>
              <kbd className="desk" style={{fontSize:10,fontWeight:700,padding:'2px 7px',borderRadius:7,background:'rgba(255,255,255,.08)',color:'rgba(255,255,255,.28)',border:'1px solid rgba(255,255,255,.12)',flexShrink:0}}>Ctrl+K</kbd>
            </div>
          </div>

          {/* Right actions */}
          <div style={{display:'flex',alignItems:'center',gap:7,flexShrink:0,marginLeft:'auto'}}>
            <button onClick={()=>setFilterOpen(true)} style={{width:35,height:35,borderRadius:11,border:`1px solid ${hasFilters?theme.p+'55':'rgba(255,255,255,.1)'}`,background:hasFilters?`${theme.p}18`:'rgba(255,255,255,.07)',cursor:'pointer',fontSize:14,display:'flex',alignItems:'center',justifyContent:'center',transition:'all .2s',color:hasFilters?theme.p:'rgba(255,255,255,.45)',position:'relative'}}>
              ⚙
              {hasFilters&&<div style={{position:'absolute',top:4,right:4,width:6,height:6,borderRadius:'50%',background:theme.p,boxShadow:`0 0 6px ${theme.p}`}}/>}
            </button>
            <button onClick={randomAnime} className="desk" style={{width:35,height:35,borderRadius:11,border:'1px solid rgba(255,255,255,.1)',background:'rgba(255,255,255,.07)',cursor:'pointer',fontSize:14,display:'flex',alignItems:'center',justifyContent:'center',transition:'all .2s',color:'rgba(255,255,255,.55)'}}
              onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,.13)'}
              onMouseLeave={e=>e.currentTarget.style.background='rgba(255,255,255,.07)'}>🎲</button>
            {/* Sync indicator desktop */}
            {isAuth&&<div className="desk" style={{alignItems:'center',gap:5,padding:'4px 9px',borderRadius:9,background:'rgba(255,255,255,.06)',fontSize:10,fontWeight:800,color:{idle:'rgba(255,255,255,.28)',syncing:theme.p,synced:'#22c55e',error:'#ef4444'}[syncSt]}}>
              {syncSt==='syncing'?<Spinner size={10} color={theme.p}/>:<span style={{width:6,height:6,borderRadius:'50%',background:'currentColor',display:'inline-block'}}/>}
              <span>{syncSt==='synced'?'Сохр.':syncSt==='syncing'?'…':syncSt==='error'?'ERR':'↑'}</span>
            </div>}
            {!isAuth?(
              <button onClick={()=>setAuthOpen(true)} className="btn-primary" style={{padding:'8px 15px',borderRadius:12,fontSize:13,boxShadow:`0 4px 16px ${theme.p}44`}}>Войти</button>
            ):(
              <button onClick={()=>setProfOpen(true)} style={{position:'relative',background:'none',border:'none',padding:0,cursor:'pointer',flexShrink:0}}>
                <img src={user.avatar} alt="" style={{width:35,height:35,borderRadius:11,objectFit:'cover',border:`2px solid ${theme.p}`,boxShadow:`0 0 12px ${theme.p}55`,display:'block',transition:'transform .2s'}}
                  onMouseEnter={e=>e.target.style.transform='scale(1.1)'}
                  onMouseLeave={e=>e.target.style.transform='scale(1)'}/>
                {achs.length>0&&<div style={{position:'absolute',top:-5,right:-5,width:17,height:17,borderRadius:'50%',background:`linear-gradient(135deg,${theme.p},${theme.s})`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:8,color:'white',fontWeight:900,pointerEvents:'none'}}>{achs.length}</div>}
              </button>
            )}
          </div>
        </div>

        {/* Mobile horizontal nav — ONE row, scrollable */}
        <div className="ns m-nav" style={{overflowX:'auto',gap:5,padding:'5px 14px 8px',borderTop:'1px solid rgba(255,255,255,.06)'}}>
          {NAV.map(v=>(
            <button key={v.k} onClick={()=>setView(v.k)}
              style={{flexShrink:0,display:'flex',alignItems:'center',gap:5,padding:'6px 12px',borderRadius:20,border:'none',cursor:'pointer',fontFamily:'inherit',fontSize:12,fontWeight:800,transition:'all .2s',whiteSpace:'nowrap',background:view===v.k?`linear-gradient(135deg,${theme.p},${theme.s})`:'rgba(255,255,255,.07)',color:view===v.k?'white':'rgba(255,255,255,.38)',boxShadow:view===v.k?`0 4px 12px ${theme.p}44`:''}}>
              <span style={{fontSize:12}}>{v.i}</span><span>{v.l}</span>
            </button>
          ))}
        </div>
      </header>

      {/* ════════════════ TRENDING MARQUEE (home only) ════════════════ */}
      {view==='home'&&!search&&page===1&&trendCache.length>0&&(
        <section style={{overflow:'hidden',marginTop:6,marginBottom:4}}>
          <div style={{maxWidth:1700,margin:'0 auto',padding:'0 16px 6px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <p style={{fontSize:12,fontWeight:900,opacity:.5}}>📈 В тренде</p>
            <button onClick={()=>setView('trending')} style={{background:'none',border:'none',cursor:'pointer',color:theme.p,fontSize:12,fontWeight:800,fontFamily:'inherit',opacity:.75}}>Смотреть всё →</button>
          </div>
          <div>
            <div style={{display:'flex',gap:9,paddingLeft:16,animation:'marquee 70s linear infinite',width:'max-content'}}
              onMouseEnter={e=>e.currentTarget.style.animationPlayState='paused'}
              onMouseLeave={e=>e.currentTarget.style.animationPlayState='running'}>
              {[...trendCache,...trendCache].map((item,i)=>(
                <div key={`m-${item.id}-${i}`} onClick={()=>openItem(item)} style={{flexShrink:0,width:90,cursor:'pointer'}}>
                  <div style={{borderRadius:13,overflow:'hidden',aspectRatio:'2/3',background:'#0b1628',position:'relative',transition:'transform .3s',animation:`trendIn .4s ${Math.min(i*.02,.4)}s both`}}
                    onMouseEnter={e=>e.currentTarget.style.transform='scale(1.08)'}
                    onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}>
                    {imgSrc(item)&&<img src={imgSrc(item)} alt="" loading="lazy" style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}}/>}
                    <div style={{position:'absolute',inset:0,background:'linear-gradient(to top,rgba(0,0,0,.9) 0%,transparent 55%)'}}/>
                    <div style={{position:'absolute',top:5,left:5,padding:'2px 6px',borderRadius:7,fontSize:9,fontWeight:900,color:'white',background:`${theme.p}cc`}}>#{i%trendCache.length+1}</div>
                    <div style={{position:'absolute',bottom:5,left:5,right:5}}>
                      {item.score&&<span style={{fontSize:9,color:'#fbbf24',fontWeight:900}}>★{item.score}</span>}
                      <p className="lc2" style={{fontSize:9,fontWeight:800,color:'white',lineHeight:1.2,marginTop:1}}>{item.russian||item.name}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ════════════════ LAYOUT ════════════════ */}
      <div style={{maxWidth:1700,margin:'0 auto',padding:'12px 16px',display:'flex',gap:14,alignItems:'flex-start',position:'relative',zIndex:2}} className="main-scroll">

        {/* Sidebar */}
        <aside className="sidebar" style={{width:208,flexShrink:0,position:'sticky',top:120}}>
          <div className="card" style={{borderRadius:20,padding:14,display:'flex',flexDirection:'column',gap:13}}>
            {/* Sort */}
            <div>
              <p style={{fontSize:9,fontWeight:900,opacity:.3,textTransform:'uppercase',letterSpacing:'.1em',marginBottom:8}}>Сортировка</p>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:5}}>
                {SORTS.map(({v,l})=>(
                  <button key={v} onClick={()=>setSort(v)} style={{padding:'7px 4px',borderRadius:10,border:'none',cursor:'pointer',fontFamily:'inherit',fontSize:10,fontWeight:800,transition:'all .2s',background:sort===v?`linear-gradient(135deg,${theme.p},${theme.s})`:'rgba(255,255,255,.07)',color:sort===v?'white':'rgba(255,255,255,.38)',boxShadow:sort===v?`0 4px 12px ${theme.p}44`:''}}>{l}</button>
                ))}
              </div>
            </div>
            {/* Genres */}
            <div>
              <p style={{fontSize:9,fontWeight:900,opacity:.3,textTransform:'uppercase',letterSpacing:'.1em',marginBottom:8}}>Жанры</p>
              <div className="ns" style={{display:'flex',flexDirection:'column',gap:3,maxHeight:310,overflowY:'auto'}}>
                <button onClick={()=>setGenre(null)} style={{padding:'7px 10px',borderRadius:10,border:`1px solid ${!genre?theme.p+'44':'transparent'}`,cursor:'pointer',fontFamily:'inherit',fontSize:11,fontWeight:800,transition:'all .2s',background:!genre?`${theme.p}18`:'rgba(255,255,255,.05)',color:!genre?theme.p:'rgba(255,255,255,.38)',textAlign:'left'}}>🧩 Все жанры</button>
                {GENRES.map(g=>(
                  <button key={g.id} onClick={()=>setGenre(g.id)} style={{padding:'7px 10px',borderRadius:10,border:`1px solid ${genre===g.id?theme.p+'44':'transparent'}`,cursor:'pointer',fontFamily:'inherit',fontSize:11,fontWeight:800,transition:'all .2s',background:genre===g.id?`${theme.p}18`:'rgba(255,255,255,.05)',color:genre===g.id?theme.p:'rgba(255,255,255,.38)',textAlign:'left',display:'flex',alignItems:'center',gap:7}}>
                    <span>{g.e}</span><span>{g.n}</span>
                  </button>
                ))}
              </div>
            </div>
            {/* Mini user stats */}
            {isAuth&&(
              <div style={{padding:12,borderRadius:14,background:`${theme.p}0d`,border:`1px solid ${theme.p}22`}}>
                <p style={{fontSize:9,fontWeight:900,opacity:.35,textTransform:'uppercase',letterSpacing:'.1em',marginBottom:8}}>Мой прогресс</p>
                <div style={{display:'flex',flexDirection:'column',gap:5}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <span style={{fontSize:11,opacity:.45,fontWeight:700}}>Ур.</span>
                    <span style={{fontSize:15,fontWeight:900,color:theme.p}}>{stats.level}</span>
                  </div>
                  <Bar value={stats.xpInLvl} max={100} grad={`linear-gradient(90deg,${theme.p},${theme.s})`} h={4}/>
                  {[['Завершено',stats.watched],['Оценено',stats.rated],['Избранное',favs.length]].map(([l,v])=>(
                    <div key={l} style={{display:'flex',justifyContent:'space-between'}}>
                      <span style={{fontSize:10,opacity:.35,fontWeight:700}}>{l}</span>
                      <span style={{fontSize:11,fontWeight:900,color:'white'}}>{v}</span>
                    </div>
                  ))}
                  {dailyProg>0&&(
                    <div style={{marginTop:3}}>
                      <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                        <span style={{fontSize:10,opacity:.35,fontWeight:700}}>Цель дня</span>
                        <span style={{fontSize:10,fontWeight:900,color:dailyProg>=dailyGoal?'#22c55e':theme.p}}>{dailyProg}/{dailyGoal}</span>
                      </div>
                      <Bar value={dailyProg} max={dailyGoal} grad={`linear-gradient(90deg,${dailyProg>=dailyGoal?'#22c55e':theme.p},${theme.s})`} h={4}/>
                    </div>
                  )}
                </div>
              </div>
            )}
            <button onClick={()=>{setGenre(null);setSort('popularity');setFilters({year:null,scoreMin:0,kind:'',status:''});}} style={{padding:6,borderRadius:10,border:'none',background:'transparent',color:'rgba(255,255,255,.2)',cursor:'pointer',fontSize:11,fontWeight:700,fontFamily:'inherit'}}>↺ Сбросить</button>
          </div>
        </aside>

        {/* Main */}
        <main style={{flex:1,minWidth:0}}>

          {/* TRENDING PAGE */}
          {view==='trending'&&<TrendingPage themeP={theme.p} themeS={theme.s} onOpen={openItem} onFav={handleFav} favIds={favIds} cache={descCache} library={library}/>}

          {/* STATS PAGE */}
          {view==='stats'&&<StatsPage stats={stats} user={user} lib={library} ratings={ratings} favs={favs.length} achs={achs} themeP={theme.p} themeS={theme.s}/>}

          {/* ALL OTHER VIEWS */}
          {view!=='trending'&&view!=='stats'&&(
            <>
              {/* Toolbar */}
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:13,gap:8,flexWrap:'wrap'}}>
                <div>
                  <h1 style={{fontSize:20,fontWeight:900,margin:'0 0 2px'}}>{viewTitle[view]??'⊞ Каталог'}</h1>
                  <p style={{fontSize:11,fontWeight:700,color:'rgba(255,255,255,.3)',margin:0}}>
                    <span style={{color:theme.p,fontWeight:900}}>{displayData.length}</span> {view==='manga'?'манг':'аниме'}
                    {hasFilters&&<span style={{color:'#f59e0b',marginLeft:8}}>· Фильтры</span>}
                  </p>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:7,flexWrap:'wrap'}}>
                  {/* Mobile genres strip */}
                  <div className="ns mob-genres" style={{display:'flex',overflowX:'auto',gap:5,maxWidth:180}}>
                    <button onClick={()=>setGenre(null)} style={{flexShrink:0,padding:'5px 10px',borderRadius:99,border:`1px solid ${!genre?theme.p+'55':'rgba(255,255,255,.1)'}`,background:!genre?`${theme.p}18`:'rgba(255,255,255,.06)',color:!genre?theme.p:'rgba(255,255,255,.38)',cursor:'pointer',fontSize:11,fontWeight:800,fontFamily:'inherit',whiteSpace:'nowrap'}}>Все</button>
                    {GENRES.slice(0,6).map(g=>(
                      <button key={g.id} onClick={()=>setGenre(g.id)} style={{flexShrink:0,padding:'5px 10px',borderRadius:99,border:`1px solid ${genre===g.id?theme.p+'55':'rgba(255,255,255,.1)'}`,background:genre===g.id?`${theme.p}18`:'rgba(255,255,255,.06)',color:genre===g.id?theme.p:'rgba(255,255,255,.38)',cursor:'pointer',fontSize:11,fontWeight:800,fontFamily:'inherit',whiteSpace:'nowrap'}}>{g.e}</button>
                    ))}
                  </div>
                  {/* View mode */}
                  <div style={{display:'flex',borderRadius:11,overflow:'hidden',border:'1px solid rgba(255,255,255,.1)',flexShrink:0}}>
                    {[['grid','⊞'],['list','☰']].map(([m,i])=>(
                      <button key={m} onClick={()=>setVMode(m)} style={{width:35,height:33,border:'none',cursor:'pointer',fontFamily:'inherit',fontSize:14,fontWeight:900,transition:'all .2s',background:vMode===m?`linear-gradient(135deg,${theme.p},${theme.s})`:'rgba(255,255,255,.07)',color:vMode===m?'white':'rgba(255,255,255,.38)'}}>{i}</button>
                    ))}
                  </div>
                  {/* Pagination */}
                  {['home','manga'].includes(view)&&(
                    <div style={{display:'flex',alignItems:'center',borderRadius:11,overflow:'hidden',border:'1px solid rgba(255,255,255,.1)',flexShrink:0}}>
                      <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} style={{width:33,height:33,border:'none',background:'rgba(255,255,255,.07)',color:'rgba(255,255,255,.55)',cursor:page===1?'not-allowed':'pointer',fontSize:15,fontWeight:900,opacity:page===1?.3:1}}>‹</button>
                      <span style={{width:30,textAlign:'center',fontSize:12,fontWeight:900,color:theme.p,background:'rgba(255,255,255,.04)'}}>{page}</span>
                      <button onClick={()=>setPage(p=>p+1)} style={{width:33,height:33,border:'none',background:'rgba(255,255,255,.07)',color:'rgba(255,255,255,.55)',cursor:'pointer',fontSize:15,fontWeight:900}}>›</button>
                    </div>
                  )}
                </div>
              </div>

              {/* Content */}
              {loading ? (
                <div style={{display:vMode==='grid'?'grid':'flex',gridTemplateColumns:vMode==='grid'?'repeat(auto-fill,minmax(134px,1fr))':undefined,flexDirection:'column',gap:vMode==='grid'?10:8}} className={vMode==='grid'?'card-grid':''}>
                  {Array(vMode==='grid'?20:8).fill(0).map((_,i)=>
                    vMode==='grid'?<SkeletonCard key={i}/>:
                    <div key={i} style={{height:80,borderRadius:14,background:'#0b1628',position:'relative',overflow:'hidden'}}><div className="shimmer" style={{position:'absolute',inset:0}}/></div>
                  )}
                </div>
              ):displayData.length===0?(
                <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'64px 20px',gap:14}}>
                  <span style={{fontSize:56,animation:'float 3s ease infinite'}}>📭</span>
                  <p style={{fontSize:16,fontWeight:900,opacity:.35}}>Ничего не найдено</p>
                  <p style={{fontSize:12,opacity:.2}}>Измените параметры</p>
                  {hasFilters&&<button onClick={()=>setFilters({year:null,scoreMin:0,kind:'',status:''})} className="btn-ghost" style={{marginTop:4,padding:'9px 18px',borderRadius:12,fontSize:13}}>Сбросить фильтры</button>}
                </div>
              ):vMode==='grid'?(
                <div className="card-grid stagger">
                  {displayData.map((item,idx)=>(
                    <div key={`${item.id}-${idx}`} style={{animation:`fadeUp .32s ${Math.min(idx*.025,.4)}s both`}}>
                      <AnimeCard item={item} onClick={openItem} onFav={handleFav}
                        faved={favIds.has(item.id)} status={library[item.id]?.status}
                        userRating={ratings[item.id]} themeP={theme.p} themeS={theme.s}
                        cache={descCache} colIdx={idx%gridCols} cols={gridCols}/>
                    </div>
                  ))}
                </div>
              ):(
                <div style={{display:'flex',flexDirection:'column',gap:8}}>
                  {displayData.map((item,idx)=>(
                    <div key={`${item.id}-${idx}`} style={{animation:`fadeUp .3s ${Math.min(idx*.022,.33)}s both`}}>
                      <AnimeRow item={item} onClick={openItem} onFav={handleFav} faved={favIds.has(item.id)} themeP={theme.p} themeS={theme.s} cache={descCache}/>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </main>
      </div>

   {/* ————————————————— MOBILE BOTTOM NAV (Hidden on PC) ————————————————— */}
<nav 
  className="fixed bottom-0 left-0 right-0 z-[600] flex justify-center border-t border-white/10 px-1 backdrop-blur-2xl saturate-200 md:hidden" 
  style={{ 
    background: `${theme.b}f5`, 
    paddingBottom: 'env(safe-area-inset-bottom, 0px)' 
  }}
>
  <div className="flex w-full max-w-md items-center justify-around py-2">
    {[
      { k: 'home', l: 'Главная', i: '⊞' },
      { k: 'trending', l: 'Тренды', i: '📈' },
      { k: 'favs', l: 'Избранное', i: '♥' },
      { k: 'library', l: 'Моё', i: '◈' },
      { k: 'stats', l: 'Статы', i: '📊' },
    ].map((v) => (
      <button
        key={v.k}
        onClick={() => setView(v.k)}
        className={`flex flex-1 flex-col items-center gap-0.5 rounded-xl py-1 transition-all duration-200 active:scale-90 
          ${view === v.k ? '' : 'text-white/30'}`}
        style={{ 
          backgroundColor: view === v.k ? `${theme.p}1e` : 'transparent',
          color: view === v.k ? theme.p : undefined 
        }}
      >
        <span className="text-[18px]">{v.i}</span>
        <span className="text-[9px] font-extrabold uppercase tracking-tight">{v.l}</span>
      </button>
    ))}

    {isAuth ? (
      <button
        onClick={() => setProfOpen(true)}
        className="flex flex-1 flex-col items-center gap-0.5 rounded-xl py-1 transition-all duration-200 active:scale-90"
      >
        <img
          src={user.avatar}
          alt="Avatar"
          className="h-[22px] w-[22px] rounded-lg object-cover"
          style={{ border: `1.5px solid ${theme.p}` }}
        />
        <span className="text-[9px] font-extrabold text-white/30 uppercase tracking-tight">Профиль</span>
      </button>
    ) : (
      <button
        onClick={() => setAuthOpen(true)}
        className="flex flex-1 flex-col items-center gap-0.5 rounded-xl py-1 transition-all duration-200 active:scale-90"
        style={{ backgroundColor: `${theme.p}1e`, color: theme.p }}
      >
        <span className="text-[18px]">◉</span>
        <span className="text-[9px] font-extrabold uppercase tracking-tight">Войти</span>
      </button>
    )}
  </div>
</nav>

      {/* Footer desktop */}
      <footer className="desk" style={{borderTop:'1px solid rgba(255,255,255,.06)',padding:'24px 18px',flexDirection:'column',gap:4,marginTop:16,textAlign:'center',position:'relative',zIndex:2}}>
        <p style={{fontSize:16,fontWeight:900,background:`linear-gradient(135deg,${theme.p},white)`,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>AniHub</p>
        <p style={{fontSize:11,color:'rgba(255,255,255,.16)'}}>© 2026 · {VER} · Premium Anime Platform · Powered by Shikimori</p>
      </footer>
    </div>
  );
}