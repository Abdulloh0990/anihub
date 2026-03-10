import React, {
  useState, useEffect, useRef, useMemo, useCallback, memo
} from 'react';

/* ═══════════════════════════════════════════════════════════════
   SUPABASE CONFIG
═══════════════════════════════════════════════════════════════ */
const CFG_KEY = 'anihub_sb_cfg';
const DEFAULT_CFG = {
  url: 'https://ggcsqczvjzbxlmnxwvtf.supabase.co',
  key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdnY3NxY3p2anpieGxtbnh3dnRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3MjA5ODAsImV4cCI6MjA4ODI5Njk4MH0.0_d_MW1NheE4LqO8c-nCNVGWuGuZMYoYb6YR1Rf2M0g'
};
const loadCfg = () => { try { const v = localStorage.getItem(CFG_KEY); return v ? JSON.parse(v) : DEFAULT_CFG; } catch { return DEFAULT_CFG; } };
const saveCfg = (cfg) => { try { if (cfg) localStorage.setItem(CFG_KEY, JSON.stringify(cfg)); else localStorage.removeItem(CFG_KEY); } catch {} };

/* ═══════════════════════════════════════════════════════════════
   SUPABASE API
═══════════════════════════════════════════════════════════════ */
const mkSB = (url, key) => ({
  async signUp(email, password, displayName) {
    const r = await fetch(`${url}/auth/v1/signup`, { method:'POST', headers:{'Content-Type':'application/json',apikey:key,Authorization:`Bearer ${key}`}, body:JSON.stringify({email,password,data:{display_name:displayName}}) });
    return r.json();
  },
  async signIn(email, password) {
    const r = await fetch(`${url}/auth/v1/token?grant_type=password`, { method:'POST', headers:{'Content-Type':'application/json',apikey:key,Authorization:`Bearer ${key}`}, body:JSON.stringify({email,password}) });
    return r.json();
  },
  async sendEmailOTP(email) {
    const r = await fetch(`${url}/auth/v1/otp`, { method:'POST', headers:{'Content-Type':'application/json',apikey:key,Authorization:`Bearer ${key}`}, body:JSON.stringify({email,create_user:true}) });
    return r.ok ? {ok:true} : r.json();
  },
  async verifyEmailOTP(email, token) {
    const r = await fetch(`${url}/auth/v1/verify`, { method:'POST', headers:{'Content-Type':'application/json',apikey:key,Authorization:`Bearer ${key}`}, body:JSON.stringify({email,token,type:'email'}) });
    return r.json();
  },
  async refreshToken(refresh_token) {
    const r = await fetch(`${url}/auth/v1/token?grant_type=refresh_token`, { method:'POST', headers:{'Content-Type':'application/json',apikey:key,Authorization:`Bearer ${key}`}, body:JSON.stringify({refresh_token}) });
    return r.json();
  },
  async signOut(access_token) {
    await fetch(`${url}/auth/v1/logout`, { method:'POST', headers:{apikey:key,Authorization:`Bearer ${access_token}`} });
  },
  async getData(access_token, user_id) {
    const r = await fetch(`${url}/rest/v1/anihub_data?user_id=eq.${user_id}&select=*`, { headers:{apikey:key,Authorization:`Bearer ${access_token}`} });
    const d = await r.json();
    return Array.isArray(d) && d.length > 0 ? d[0].data : null;
  },
  async upsertData(access_token, user_id, data) {
    const r = await fetch(`${url}/rest/v1/anihub_data`, { method:'POST', headers:{'Content-Type':'application/json',apikey:key,Authorization:`Bearer ${access_token}`,Prefer:'resolution=merge-duplicates'}, body:JSON.stringify({user_id,data,updated_at:new Date().toISOString()}) });
    return r.ok;
  },
  async checkUsername(username) {
    const r = await fetch(`${url}/rest/v1/anihub_profiles?username=eq.${encodeURIComponent(username.toLowerCase())}&select=username`, { headers:{apikey:key,Authorization:`Bearer ${key}`} });
    const d = await r.json(); return Array.isArray(d) && d.length > 0;
  },
  async createProfile(access_token, user_id, username, email) {
    const r = await fetch(`${url}/rest/v1/anihub_profiles`, { method:'POST', headers:{'Content-Type':'application/json',apikey:key,Authorization:`Bearer ${access_token}`,Prefer:'resolution=ignore-duplicates'}, body:JSON.stringify({user_id,username:username.toLowerCase(),email}) });
    return r.ok;
  },
  async getEmailByUsername(username) {
    const r = await fetch(`${url}/rest/v1/anihub_profiles?username=eq.${encodeURIComponent(username.toLowerCase())}&select=email`, { headers:{apikey:key,Authorization:`Bearer ${key}`} });
    const d = await r.json(); return Array.isArray(d) && d.length > 0 ? d[0].email : null;
  },
});

/* ═══════════════════════════════════════════════════════════════
   LOCAL STORAGE
═══════════════════════════════════════════════════════════════ */
const LS = {
  get: k => { try { return localStorage.getItem(k); } catch { return null; } },
  set: (k, v) => { try { localStorage.setItem(k, String(v)); } catch {} },
  del: k => { try { localStorage.removeItem(k); } catch {} },
  json: k => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch { return null; } },
};
const SESS_KEY = 'anihub_session';

/* ═══════════════════════════════════════════════════════════════
   CONSTANTS
═══════════════════════════════════════════════════════════════ */
const API      = 'https://shikimori.one/api';
const ASSETS   = 'https://shikimori.one';
const PER_PAGE = 28;
const TREND_PER= 28;
const SAVE_DELAY = 1800;

const THEMES = {
  ocean:  { n:'Океан',   i:'🌊', p:'#22d3ee', s:'#0ea5e9', b:'#020c14', m:'#051220' },
  royal:  { n:'Аметист', i:'💎', p:'#a78bfa', s:'#7c3aed', b:'#080412', m:'#100820' },
  sunset: { n:'Закат',   i:'🌅', p:'#fb923c', s:'#ef4444', b:'#140800', m:'#1e0d02' },
  forest: { n:'Лес',     i:'🌲', p:'#4ade80', s:'#16a34a', b:'#011208', m:'#041a0a' },
  rose:   { n:'Роза',    i:'🌸', p:'#f472b6', s:'#db2777', b:'#130010', m:'#1c0018' },
  gold:   { n:'Золото',  i:'✨', p:'#fbbf24', s:'#d97706', b:'#130f00', m:'#1e1600' },
  cyber:  { n:'Кибер',   i:'🤖', p:'#39ff14', s:'#00cc6a', b:'#000d06', m:'#011408' },
  ice:    { n:'Лёд',     i:'❄️', p:'#93c5fd', s:'#3b82f6', b:'#02080e', m:'#040e18' },
};

const GENRES = [
  {id:1,n:'Сёнен',e:'🔥'},{id:4,n:'Комедия',e:'😂'},{id:10,n:'Фэнтези',e:'🧙'},
  {id:2,n:'Приключения',e:'🗺️'},{id:8,n:'Драма',e:'😢'},{id:7,n:'Мистика',e:'🔮'},
  {id:24,n:'Sci-Fi',e:'🚀'},{id:22,n:'Романтика',e:'❤️'},{id:6,n:'Демоны',e:'👿'},
  {id:14,n:'Ужасы',e:'👻'},{id:36,n:'Слайс',e:'☕'},{id:11,n:'Игры',e:'🎮'},
  {id:37,n:'Сверхъест',e:'🌟'},{id:23,n:'Школа',e:'🏫'},
];

const RANKS = [
  {min:1,l:'Новичок',c:'#64748b',b:'🌱'},{min:10,l:'Зритель',c:'#3b82f6',b:'⚡'},
  {min:30,l:'Ценитель',c:'#a855f7',b:'💎'},{min:60,l:'Мастер',c:'#f97316',b:'🔥'},
  {min:85,l:'Элита',c:'#ef4444',b:'👑'},{min:100,l:'Легенда',c:'#eab308',b:'⭐'},
];

const ACHS = [
  {id:'first',n:'Первый шаг',d:'Первое аниме открыто',e:'🎬',xp:10},
  {id:'rate10',n:'Критик',d:'Оценено 10 аниме',e:'⭐',xp:50},
  {id:'comp50',n:'Марафонец',d:'Завершено 50 аниме',e:'🏃',xp:100},
  {id:'lv10',n:'Опытный',d:'Достигнут уровень 10',e:'💪',xp:75},
  {id:'night',n:'Полуночник',d:'Заход после полуночи',e:'🦉',xp:25},
  {id:'early',n:'Утренник',d:'Заход в 5–7 утра',e:'🌅',xp:25},
  {id:'fav20',n:'Коллекционер',d:'20 в избранном',e:'❤️',xp:40},
  {id:'notes10',n:'Рецензент',d:'10 заметок написано',e:'📝',xp:60},
  {id:'lib100',n:'Архивист',d:'100 в библиотеке',e:'📚',xp:200},
  {id:'streak7',n:'Неделя',d:'7 дней подряд',e:'📅',xp:100},
  {id:'search10',n:'Следопыт',d:'10 уникальных поисков',e:'🔍',xp:30},
  {id:'share5',n:'Блогер',d:'Поделился 5 раз',e:'📤',xp:20},
  {id:'perf10',n:'Перфект',d:'10 оценок «10»',e:'🌟',xp:80},
  {id:'genres',n:'Всеядный',d:'Аниме всех жанров',e:'🎭',xp:150},
];

const NAV = [
  {k:'home',l:'Главная',i:'⊞'},{k:'trending',l:'Тренды',i:'📈'},
  {k:'manga',l:'Манга',i:'📖'},{k:'favs',l:'Избранное',i:'♥'},
  {k:'library',l:'Библиотека',i:'◈'},{k:'history',l:'История',i:'⏱'},
  {k:'watchlist',l:'Список',i:'◎'},{k:'stats',l:'Статы',i:'📊'},
];

const SORTS = [
  {v:'popularity',l:'🔥 Поп.'},{v:'ranked',l:'★ Рейт.'},
  {v:'aired_on',l:'📅 Дата'},{v:'name',l:'🔤 А-Я'},
];

const YEARS = Array.from({length:36},(_,i) => 2025 - i);

/* ═══════════════════════════════════════════════════════════════
   PURE HELPERS
═══════════════════════════════════════════════════════════════ */
const getRank   = xp => { const lv = Math.floor(xp/100)+1; return [...RANKS].reverse().find(r => lv >= r.min) ?? RANKS[0]; };
const today     = () => new Date().toDateString();
const fmt       = n  => n >= 1000 ? (n/1000).toFixed(1)+'k' : String(n ?? 0);
const imgSrc    = item => { if (!item?.image) return ''; const p = item.image?.original ?? (typeof item.image==='string' ? item.image : ''); return p ? (p.startsWith('http') ? p : ASSETS+p) : ''; };
const stripHtml = h  => h ? h.replace(/<[^>]*>/g,' ').replace(/\[.*?\]/g,'').replace(/\s+/g,' ').trim() : '';
const mkUser    = (name='Гость') => ({name,bio:'Добро пожаловать в AniHub! 🌟',avatar:`https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${name}`,xp:0,joinDate:new Date().toISOString(),lastLogin:null,loginStreak:0,totalLogins:0});

/* ═══════════════════════════════════════════════════════════════
   GLOBAL CSS
═══════════════════════════════════════════════════════════════ */
const buildCSS = (p, s, b, m) => `
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
.ns{scrollbar-width:none;-ms-overflow-style:none}
.ns::-webkit-scrollbar{display:none}
:root{--p:${p};--s:${s};--base:${b};--mid:${m};--glass:rgba(255,255,255,.05);--glass-b:rgba(255,255,255,.09);--dim:rgba(255,255,255,.4);--text:rgba(255,255,255,.85);--card-bg:rgba(255,255,255,.04);--r:16px}

@keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes slideUp{from{opacity:0;transform:translateY(100%)}to{opacity:1;transform:translateY(0)}}
@keyframes scaleIn{from{opacity:0;transform:scale(.85) translateY(12px)}to{opacity:1;transform:scale(1) translateY(0)}}
@keyframes pop{0%{opacity:0;transform:scale(.55) rotate(-15deg)}65%{transform:scale(1.08) rotate(3deg)}100%{opacity:1;transform:scale(1) rotate(0)}}
@keyframes shimmer{0%{background-position:-800px 0}100%{background-position:800px 0}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes glow{0%,100%{box-shadow:0 0 12px ${p}55,0 0 24px ${p}22}50%{box-shadow:0 0 24px ${p}99,0 0 50px ${p}44}}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
@keyframes marquee{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
@keyframes toastIn{from{opacity:0;transform:translateX(28px) scale(.9)}to{opacity:1;transform:translateX(0) scale(1)}}
@keyframes barFill{from{width:0}to{width:var(--bar-w,100%)}}
@keyframes heartPop{0%{transform:scale(1)}40%{transform:scale(1.5)}70%{transform:scale(.9)}100%{transform:scale(1)}}
@keyframes trendIn{from{opacity:0;transform:translateX(-20px)}to{opacity:1;transform:translateX(0)}}
@keyframes posterIn{from{opacity:0;transform:scale(.94)}to{opacity:1;transform:scale(1)}}
@keyframes descSlide{from{opacity:0;max-height:0;transform:translateY(-8px)}to{opacity:1;max-height:600px;transform:translateY(0)}}
@keyframes overlayIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes countUp{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
@keyframes playerIn{from{opacity:0;transform:scale(.96) translateY(20px)}to{opacity:1;transform:scale(1) translateY(0)}}
@keyframes sheetUp{from{opacity:0;transform:translateY(60px)}to{opacity:1;transform:translateY(0)}}
@keyframes bgBlur{from{opacity:0;backdrop-filter:blur(0px)}to{opacity:1;backdrop-filter:blur(32px)}}
@keyframes glowPulse{0%,100%{opacity:.4}50%{opacity:.8}}
@keyframes ripple{0%{transform:scale(0);opacity:.5}100%{transform:scale(4);opacity:0}}

.fu{animation:fadeUp .36s cubic-bezier(.4,0,.2,1) both}
.fi{animation:fadeIn .24s ease both}
.su{animation:slideUp .4s cubic-bezier(.34,1.1,.64,1) both}
.si{animation:scaleIn .32s cubic-bezier(.34,1.1,.64,1) both}
.ap{animation:pop .48s cubic-bezier(.34,1.56,.64,1) both}
.pi{animation:playerIn .5s cubic-bezier(.34,1.1,.64,1) both}
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

input[type=range]{-webkit-appearance:none;appearance:none;height:6px;border-radius:99px;cursor:pointer;outline:none;border:none}
input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:20px;height:20px;border-radius:50%;background:white;cursor:pointer;box-shadow:0 2px 10px rgba(0,0,0,.5);transition:transform .15s}
input[type=range]::-webkit-slider-thumb:hover{transform:scale(1.2)}

.card-h{transition:transform .28s cubic-bezier(.4,0,.2,1),filter .28s ease,box-shadow .28s ease}
.card-h:hover{transform:translateY(-6px) scale(1.025);filter:brightness(1.07)}
.card-h:hover .card-overlay{opacity:1 !important}
@media(hover:none){.card-h:hover{transform:none;filter:none}.card-h:active{transform:scale(.96)}}

/* Player fullscreen */
.player-fullscreen{position:fixed!important;inset:0!important;z-index:9999!important;display:flex!important;flex-direction:column!important;background:#000!important}
.player-bg-blur{position:absolute;inset:0;background-size:cover;background-position:center;filter:blur(40px) brightness(.2) saturate(1.4);transform:scale(1.1);z-index:0;transition:opacity .6s ease}
.player-inner{position:relative;z-index:1;display:flex;flex-direction:column;height:100%}
@media(min-width:1024px){.player-inner{flex-direction:row!important}}
.player-video-wrap{position:relative;width:100%;background:#000;flex-shrink:0}
@media(min-width:1024px){.player-video-wrap{flex:1;height:100%!important;max-height:none!important}}
.player-side{position:relative;z-index:2;overflow:hidden;flex-shrink:0}
@media(min-width:1024px){.player-side{width:380px;height:100%;border-left:1px solid rgba(255,255,255,.07)}}
.detail-sheet-mobile{position:relative;z-index:10;border-radius:24px 24px 0 0;background:rgba(4,8,18,.97);backdrop-filter:blur(30px);border-top:1px solid rgba(255,255,255,.1)}
@media(min-width:1024px){.detail-sheet-mobile{border-radius:0!important;background:transparent!important;border:none!important;height:100%}}
.player-header{position:absolute;top:0;left:0;right:0;z-index:20;padding:12px 14px;background:linear-gradient(to bottom,rgba(0,0,0,.85) 0%,transparent 100%);display:flex;align-items:center;gap:10}
.player-footer{position:absolute;bottom:0;left:0;right:0;z-index:20;padding:12px 14px 16px;background:linear-gradient(to top,rgba(0,0,0,.9) 0%,transparent 100%)}
.info-scroll{overflow-y:auto;height:100%}
.info-scroll::-webkit-scrollbar{width:3px}
.info-scroll::-webkit-scrollbar-thumb{background:${p}44;border-radius:99px}

/* Responsive */
.d-nav{display:none!important}
@media(min-width:1024px){.d-nav{display:flex!important}}
.m-nav{display:flex!important}
@media(min-width:1024px){.m-nav{display:none!important}}
.sidebar{display:none!important}
@media(min-width:1024px){.sidebar{display:block!important}}
.bot-nav{display:flex!important}
@media(min-width:1024px){.bot-nav{display:none!important}}
.logo-txt{display:none}
@media(min-width:420px){.logo-txt{display:inline}}
.desk{display:none!important}
@media(min-width:1024px){.desk{display:flex!important}}
.mob-genres{display:flex!important}
@media(min-width:1024px){.mob-genres{display:none!important}}
@media(max-width:420px){.search-bar{max-width:140px!important}}
@media(max-width:1023px){.main-scroll{padding-bottom:80px}}
.card-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(134px,1fr));gap:10px}
@media(max-width:480px){.card-grid{grid-template-columns:repeat(auto-fill,minmax(108px,1fr));gap:8px}}
@media(max-width:320px){.card-grid{grid-template-columns:repeat(2,1fr);gap:7px}}
article{overflow:visible!important}
.trend-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:12px}
@media(max-width:600px){.trend-grid{grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px}}
@media(max-width:360px){.trend-grid{grid-template-columns:repeat(2,1fr);gap:7px}}
.desc-expand{animation:descSlide .35s cubic-bezier(.4,0,.2,1) both;overflow:hidden}
.stats-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}
@media(min-width:640px){.stats-grid{grid-template-columns:repeat(4,1fr)}}
@media(min-width:640px){.prof-sheet{max-width:520px;margin:0 auto;border-radius:28px!important}}
.noise-layer{position:fixed;inset:0;z-index:9999;pointer-events:none;opacity:.015;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")}
.swipe-indicator{position:absolute;top:10px;left:50%;transform:translateX(-50%);width:38px;height:4px;border-radius:99px;background:rgba(255,255,255,.3);cursor:pointer}
.rating-btn{aspect-ratio:1/1;border-radius:10px;border:none;cursor:pointer;font-weight:900;font-size:13px;font-family:inherit;transition:all .2s}
.rating-btn:hover{transform:scale(1.15)}
.rating-btn.active{transform:scale(1.1)}
/* Scroll lock when modal open */
.scroll-lock{overflow:hidden!important}
`;

/* ═══════════════════════════════════════════════════════════════
   MICRO UI
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
  <div onClick={() => onChange(!v)} style={{width:48,height:27,borderRadius:99,position:'relative',cursor:'pointer',flexShrink:0,transition:'all .3s',background:v?`linear-gradient(90deg,${color},${color}bb)`:'rgba(255,255,255,.15)',boxShadow:v?`0 0 16px ${color}55`:''}}>
    <div style={{position:'absolute',top:3,left:4,width:21,height:21,borderRadius:'50%',background:'white',boxShadow:'0 2px 8px rgba(0,0,0,.4)',transition:'transform .3s cubic-bezier(.34,1.56,.64,1)',transform:`translateX(${v?21:0}px)`}}/>
  </div>
));

const Score = memo(({n}) => {
  const x = parseFloat(n); const c = x>=8?'#22c55e':x>=6?'#eab308':x>=4?'#f97316':'#ef4444';
  return <span style={{display:'inline-flex',alignItems:'center',gap:2,borderRadius:8,padding:'1px 7px',fontSize:11,fontWeight:900,background:`${c}22`,color:c,border:`1px solid ${c}44`,flexShrink:0}}>★{n}</span>;
});

const StatusDot = memo(({status}) => {
  const m = {watching:{l:'Смотрю',c:'#60a5fa'},planned:{l:'В планах',c:'#f59e0b'},completed:{l:'Завершено',c:'#22c55e'}};
  const x = m[status]; if (!x) return null;
  return <span style={{display:'inline-block',borderRadius:7,padding:'2px 7px',fontSize:10,fontWeight:900,background:`${x.c}dd`,color:'#000',letterSpacing:'.02em'}}>{x.l}</span>;
});

const SkeletonCard = memo(() => (
  <div style={{borderRadius:16,overflow:'hidden',aspectRatio:'2/3',background:'#0b1628',position:'relative'}}>
    <div className="shimmer" style={{position:'absolute',inset:0}}/>
  </div>
));

const Toasts = memo(({items}) => {
  const cfg = {success:{i:'✓',c:'#22c55e'},error:{i:'✕',c:'#ef4444'},warning:{i:'!',c:'#f59e0b'},info:{i:'ℹ',c:'#60a5fa'}};
  return (
    <div style={{position:'fixed',top:66,right:14,zIndex:12000,display:'flex',flexDirection:'column',gap:8,width:'min(300px,calc(100vw - 28px))',pointerEvents:'none'}}>
      {items.map(t => {
        const {i,c} = cfg[t.type] ?? cfg.info;
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
   SETUP SCREEN
═══════════════════════════════════════════════════════════════ */
const SetupScreen = memo(({onSave}) => {
  const [url,setUrl] = useState('');
  const [key,setKey] = useState('');
  const [step,setStep] = useState(0);
  const [err,setErr] = useState('');

  const SQL = `-- ═══ AniHub · SQL Setup ═══
create table if not exists anihub_data (
  user_id    uuid references auth.users on delete cascade primary key,
  data       jsonb not null default '{}',
  updated_at timestamptz default now()
);
alter table anihub_data enable row level security;
create policy "anihub_data_select" on anihub_data for select using (auth.uid() = user_id);
create policy "anihub_data_insert" on anihub_data for insert with check (auth.uid() = user_id);
create policy "anihub_data_update" on anihub_data for update using (auth.uid() = user_id);

create table if not exists anihub_profiles (
  user_id    uuid references auth.users on delete cascade primary key,
  username   text unique not null,
  email      text not null,
  created_at timestamptz default now()
);
alter table anihub_profiles enable row level security;
create policy "anihub_profiles_select" on anihub_profiles for select using (true);
create policy "anihub_profiles_insert" on anihub_profiles for insert with check (auth.uid() = user_id);`;

  const handleSave = () => {
    if (!url.startsWith('https://') || !url.includes('supabase.co')) { setErr('Неверный URL (https://xxx.supabase.co)'); return; }
    if (key.length < 30) { setErr('Anon key слишком короткий'); return; }
    saveCfg({url:url.trim(),key:key.trim()});
    onSave({url:url.trim(),key:key.trim()});
  };

  const inp = {width:'100%',padding:'12px 14px',borderRadius:13,border:'1.5px solid rgba(255,255,255,.12)',background:'rgba(255,255,255,.06)',color:'white',fontSize:13,fontWeight:600,outline:'none',fontFamily:'Outfit,system-ui,sans-serif',transition:'all .2s'};

  return (
    <div style={{position:'fixed',inset:0,background:'#020c14',display:'flex',alignItems:'center',justifyContent:'center',padding:16,fontFamily:'Outfit,system-ui,sans-serif',zIndex:99999}}>
      <div style={{width:'100%',maxWidth:520,display:'flex',flexDirection:'column',gap:20}}>
        <div style={{textAlign:'center',marginBottom:4}}>
          <div style={{width:64,height:64,borderRadius:20,background:'linear-gradient(135deg,#22d3ee,#0ea5e9)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 12px',boxShadow:'0 0 32px #22d3ee55',animation:'glow 3s ease infinite'}}>
            <span style={{fontSize:28,fontWeight:900,color:'white'}}>A</span>
          </div>
          <h1 style={{fontSize:28,fontWeight:900,background:'linear-gradient(135deg,#22d3ee,white)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',margin:'0 0 4px'}}>AniHub · Настройка</h1>
          <p style={{fontSize:13,color:'rgba(255,255,255,.35)',fontWeight:600}}>Supabase интеграция</p>
        </div>
        <div style={{display:'flex',gap:8,borderRadius:14,background:'rgba(255,255,255,.06)',padding:5}}>
          {[['🗄️ SQL Таблица',0],['🔑 API Ключи',1]].map(([l,s]) => (
            <button key={s} onClick={() => setStep(s)} style={{flex:1,padding:'9px 4px',borderRadius:10,border:'none',cursor:'pointer',fontFamily:'inherit',fontSize:12,fontWeight:800,transition:'all .2s',background:step===s?'linear-gradient(135deg,#22d3ee,#0ea5e9)':'transparent',color:step===s?'white':'rgba(255,255,255,.38)',boxShadow:step===s?'0 4px 14px #22d3ee44':''}}>{l}</button>
          ))}
        </div>
        {step===0 && (
          <div style={{display:'flex',flexDirection:'column',gap:14}}>
            <div style={{padding:16,borderRadius:16,background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.08)'}}>
              <p style={{fontSize:13,fontWeight:800,color:'rgba(255,255,255,.8)',marginBottom:10}}>1. Создайте проект на supabase.com</p>
              <p style={{fontSize:13,fontWeight:800,color:'rgba(255,255,255,.8)',marginBottom:10}}>2. SQL Editor → выполните:</p>
              <div style={{position:'relative'}}>
                <pre style={{fontSize:11,lineHeight:1.65,color:'#4ade80',background:'rgba(0,0,0,.5)',padding:14,borderRadius:12,overflowX:'auto',border:'1px solid rgba(74,222,128,.2)',fontFamily:'JetBrains Mono,monospace',whiteSpace:'pre-wrap',wordBreak:'break-word'}}>{SQL}</pre>
                <button onClick={() => navigator.clipboard?.writeText(SQL)} style={{position:'absolute',top:8,right:8,padding:'4px 10px',borderRadius:8,border:'1px solid rgba(255,255,255,.15)',background:'rgba(255,255,255,.08)',color:'rgba(255,255,255,.6)',cursor:'pointer',fontSize:11,fontWeight:700,fontFamily:'inherit'}}>📋 Копировать</button>
              </div>
            </div>
            <div style={{padding:14,borderRadius:14,background:'rgba(251,191,36,.07)',border:'1px solid rgba(251,191,36,.25)'}}>
              <p style={{fontSize:12,fontWeight:800,color:'#fbbf24',marginBottom:6}}>⚡ Для мгновенной регистрации:</p>
              <p style={{fontSize:11,color:'rgba(255,255,255,.55)',lineHeight:1.7}}>Auth → Providers → Email → отключите <b style={{color:'#fbbf24'}}>"Confirm email"</b></p>
            </div>
            <button onClick={() => setStep(1)} className="btn-primary" style={{padding:'13px',borderRadius:14,fontSize:14,width:'100%',boxShadow:'0 8px 24px #22d3ee44'}}>Далее → API ключи</button>
          </div>
        )}
        {step===1 && (
          <div style={{display:'flex',flexDirection:'column',gap:14}}>
            <div style={{padding:14,borderRadius:14,background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.08)'}}>
              <p style={{fontSize:12,fontWeight:700,color:'rgba(255,255,255,.6)'}}>Где найти: <span style={{color:'#22d3ee'}}>Project Settings → API</span></p>
            </div>
            {err && <div style={{padding:'10px 13px',borderRadius:12,background:'#ef444418',border:'1px solid #ef444440',color:'#f87171',fontSize:13,fontWeight:700}}>{err}</div>}
            <div>
              <label style={{display:'block',fontSize:10,fontWeight:900,opacity:.4,textTransform:'uppercase',letterSpacing:'.07em',marginBottom:6}}>Project URL</label>
              <input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://abcdefgh.supabase.co" style={inp} onFocus={e=>{e.target.style.borderColor='#22d3ee88'}} onBlur={e=>{e.target.style.borderColor='rgba(255,255,255,.12)'}}/>
            </div>
            <div>
              <label style={{display:'block',fontSize:10,fontWeight:900,opacity:.4,textTransform:'uppercase',letterSpacing:'.07em',marginBottom:6}}>Anon Public Key</label>
              <input value={key} onChange={e => setKey(e.target.value)} placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." style={{...inp,fontFamily:'monospace',fontSize:11}} onFocus={e=>{e.target.style.borderColor='#22d3ee88'}} onBlur={e=>{e.target.style.borderColor='rgba(255,255,255,.12)'}}/>
            </div>
            <button onClick={handleSave} className="btn-primary" style={{padding:'14px',borderRadius:14,fontSize:15,width:'100%',boxShadow:'0 8px 28px #22d3ee44',marginTop:4}}>🚀 Запустить AniHub</button>
          </div>
        )}
      </div>
    </div>
  );
});

/* ═══════════════════════════════════════════════════════════════
   AUTH FORM
═══════════════════════════════════════════════════════════════ */
const AuthForm = memo(({sb,themeP,themeS,onSuccess,onClose}) => {
  const [tab,setTab]           = useState('password');
  const [login,setLogin]       = useState('');
  const [email,setEmail]       = useState('');
  const [username,setUsername] = useState('');
  const [password,setPassword] = useState('');
  const [otp,setOtp]           = useState('');
  const [otpSent,setOtpSent]   = useState(false);
  const [loading,setLoading]   = useState(false);
  const [err,setErr]           = useState('');
  const [mode,setMode]         = useState('login');
  const [showPass,setShowPass] = useState(false);
  const [uniqSt,setUniqSt]     = useState('idle');
  const checkRef = useRef(null);
  const grad = `linear-gradient(135deg,${themeP},${themeS})`;
  const inp  = {width:'100%',padding:'12px 14px',borderRadius:13,border:'1.5px solid rgba(255,255,255,.1)',background:'rgba(255,255,255,.07)',color:'white',fontSize:14,fontWeight:600,outline:'none',fontFamily:'Outfit,system-ui,sans-serif',transition:'all .2s',boxSizing:'border-box'};
  const onFocus = e => {e.target.style.borderColor=themeP+'88';e.target.style.boxShadow=`0 0 0 3px ${themeP}15`};
  const onBlur  = e => {e.target.style.borderColor='rgba(255,255,255,.1)';e.target.style.boxShadow=''};

  const onUsernameChange = val => {
    const clean = val.replace(/[^a-zA-Z0-9_]/g,'').slice(0,20);
    setUsername(clean); setUniqSt('idle'); clearTimeout(checkRef.current);
    if (clean.length < 3) return;
    setUniqSt('checking');
    checkRef.current = setTimeout(async () => {
      try { const taken = await sb.checkUsername(clean); setUniqSt(taken?'taken':'ok'); } catch { setUniqSt('ok'); }
    }, 600);
  };

  const handleEmailOTP = async () => {
    setErr(''); if (!email.includes('@')) {setErr('Введите корректный email');return;}
    setLoading(true); const r = await sb.sendEmailOTP(email); setLoading(false);
    if (r?.ok || r===undefined) setOtpSent(true); else setErr(r?.msg||r?.error_description||'Ошибка отправки');
  };

  const handleEmailVerify = async () => {
    setErr(''); if (otp.length < 6) {setErr('Введите 6-значный код');return;}
    setLoading(true); const r = await sb.verifyEmailOTP(email,otp); setLoading(false);
    if (r?.access_token) {
      LS.set(SESS_KEY,JSON.stringify({access_token:r.access_token,refresh_token:r.refresh_token,user_id:r.user?.id,email:r.user?.email,expires_at:Date.now()+3600*1000}));
      onSuccess(r);
    } else setErr(r?.msg||r?.error_description||'Неверный код');
  };

  const handleLogin = async () => {
    setErr('');
    if (!login.trim()) {setErr('Введите email или никнейм');return;}
    if (password.length < 6) {setErr('Пароль: минимум 6 символов');return;}
    setLoading(true);
    try {
      let loginEmail = login.trim();
      if (!loginEmail.includes('@')) {
        try {
          const found = await sb.getEmailByUsername(loginEmail);
          if (!found) {setErr('Пользователь с таким ником не найден');setLoading(false);return;}
          loginEmail = found;
        } catch {setErr('Вход по никнейму недоступен');setLoading(false);return;}
      }
      const r = await sb.signIn(loginEmail,password);
      if (r?.access_token) {
        LS.set(SESS_KEY,JSON.stringify({access_token:r.access_token,refresh_token:r.refresh_token,user_id:r.user?.id,email:r.user?.email,expires_at:Date.now()+3600*1000}));
        onSuccess(r);
      } else setErr(r?.msg||r?.error_description||'Неверный логин или пароль');
    } catch(e) {setErr('Ошибка соединения');} finally {setLoading(false);}
  };

  const handleRegister = async () => {
    setErr('');
    if (username.length < 3) {setErr('Никнейм: минимум 3 символа');return;}
    if (uniqSt==='taken') {setErr('Этот никнейм уже занят!');return;}
    if (uniqSt==='checking') {setErr('Проверяем никнейм...');return;}
    if (!email.includes('@')) {setErr('Введите корректный email');return;}
    if (password.length < 6) {setErr('Пароль: минимум 6 символов');return;}
    setLoading(true);
    try {
      const r = await sb.signUp(email,password,username);
      if (r?.access_token) {
        LS.set(SESS_KEY,JSON.stringify({access_token:r.access_token,refresh_token:r.refresh_token,user_id:r.user?.id,email:r.user?.email,expires_at:Date.now()+3600*1000}));
        try {await sb.createProfile(r.access_token,r.user.id,username,email);} catch {}
        onSuccess(r);
      } else if (r?.user?.id && !r?.access_token) {
        try {
          const r2 = await sb.signIn(email,password);
          if (r2?.access_token) {
            LS.set(SESS_KEY,JSON.stringify({access_token:r2.access_token,refresh_token:r2.refresh_token,user_id:r2.user?.id,email:r2.user?.email,expires_at:Date.now()+3600*1000}));
            try {await sb.createProfile(r2.access_token,r2.user.id,username,email);} catch {}
            onSuccess(r2);
          } else setErr('📧 Подтвердите email и войдите снова');
        } catch {setErr('📧 Аккаунт создан. Подтвердите email.');}
      } else {
        const msg = r?.msg||r?.error_description||r?.message||'';
        if (msg.toLowerCase().includes('already')) setErr('⚠️ Email уже зарегистрирован — войдите!');
        else setErr(msg||'Ошибка регистрации');
      }
    } catch(e) {setErr('Ошибка соединения');} finally {setLoading(false);}
  };

  const uniqIcon  = {idle:'',checking:'⏳',ok:'✅',taken:'❌'}[uniqSt];
  const uniqColor = {idle:'transparent',checking:'#fbbf24',ok:'#22c55e',taken:'#ef4444'}[uniqSt];
  const uniqMsg   = {idle:'',checking:'Проверяем...',ok:'Никнейм свободен!',taken:'Этот никнейм уже занят!'}[uniqSt];

  return (
    <div style={{display:'flex',flexDirection:'column',gap:14}}>
      <div style={{display:'flex',gap:5,borderRadius:14,background:'rgba(255,255,255,.06)',padding:4}}>
        {[['password','🔑 Логин/Пароль'],['email','📧 Email OTP']].map(([t,l]) => (
          <button key={t} onClick={() => {setTab(t);setOtpSent(false);setErr('');setOtp('');}} style={{flex:1,padding:'8px 4px',borderRadius:10,border:'none',cursor:'pointer',fontFamily:'Outfit,system-ui,sans-serif',fontSize:12,fontWeight:800,transition:'all .2s',background:tab===t?grad:'transparent',color:tab===t?'white':'rgba(255,255,255,.38)',boxShadow:tab===t?`0 4px 12px ${themeP}44`:''}}>{l}</button>
        ))}
      </div>
      {err && <div style={{padding:'10px 13px',borderRadius:12,background:'#ef444418',border:'1px solid #ef444440',color:'#f87171',fontSize:13,fontWeight:700,textAlign:'center'}}>{err}</div>}
      {tab==='password' && (
        <>
          <div style={{display:'flex',gap:5,borderRadius:11,background:'rgba(255,255,255,.06)',padding:3}}>
            {[['login','Войти'],['register','Регистрация']].map(([m2,l]) => (
              <button key={m2} onClick={() => {setMode(m2);setErr('');}} style={{flex:1,padding:'7px',borderRadius:9,border:'none',cursor:'pointer',fontFamily:'inherit',fontSize:12,fontWeight:800,transition:'all .2s',background:mode===m2?grad:'transparent',color:mode===m2?'white':'rgba(255,255,255,.38)'}}>{l}</button>
            ))}
          </div>
          {mode==='login' && (
            <>
              <div>
                <label style={{display:'block',fontSize:10,fontWeight:900,opacity:.4,textTransform:'uppercase',letterSpacing:'.06em',marginBottom:6}}>Email или Никнейм</label>
                <input value={login} onChange={e => setLogin(e.target.value)} placeholder="example@mail.com или anime_fan99" style={inp} onFocus={onFocus} onBlur={onBlur} onKeyDown={e => e.key==='Enter' && handleLogin()}/>
              </div>
              <div style={{position:'relative'}}>
                <label style={{display:'block',fontSize:10,fontWeight:900,opacity:.4,textTransform:'uppercase',letterSpacing:'.06em',marginBottom:6}}>Пароль</label>
                <input type={showPass?'text':'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Введите пароль" style={{...inp,paddingRight:44}} onFocus={onFocus} onBlur={onBlur} onKeyDown={e => e.key==='Enter' && handleLogin()}/>
                <button type="button" onClick={() => setShowPass(x => !x)} style={{position:'absolute',bottom:12,right:13,background:'none',border:'none',cursor:'pointer',fontSize:16,opacity:.4,color:'white',padding:0}}>{showPass?'🙈':'👁'}</button>
              </div>
              <button onClick={handleLogin} className="btn-primary" disabled={loading} style={{padding:'14px',borderRadius:14,fontSize:14,width:'100%',boxShadow:`0 8px 24px ${themeP}44`,opacity:loading?.7:1}}>
                {loading ? <Spinner size={18} color="white"/> : '🔐 Войти'}
              </button>
            </>
          )}
          {mode==='register' && (
            <>
              <div>
                <label style={{display:'block',fontSize:10,fontWeight:900,opacity:.4,textTransform:'uppercase',letterSpacing:'.06em',marginBottom:6}}>Уникальный никнейм <span style={{color:themeP}}>*</span></label>
                <div style={{position:'relative'}}>
                  <input value={username} onChange={e => onUsernameChange(e.target.value)} placeholder="anime_fan99" maxLength={20}
                    style={{...inp,paddingRight:36,borderColor:uniqSt==='taken'?'#ef4444':uniqSt==='ok'?'#22c55e':'rgba(255,255,255,.1)'}}
                    onFocus={onFocus} onBlur={onBlur}/>
                  {uniqIcon && <span style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',fontSize:16}}>{uniqIcon}</span>}
                </div>
                {uniqMsg && <p style={{fontSize:11,fontWeight:700,color:uniqColor,marginTop:5}}>{uniqMsg}</p>}
              </div>
              <div>
                <label style={{display:'block',fontSize:10,fontWeight:900,opacity:.4,textTransform:'uppercase',letterSpacing:'.06em',marginBottom:6}}>Email</label>
                <input value={email} onChange={e => setEmail(e.target.value)} placeholder="example@gmail.com" type="email" style={inp} onFocus={onFocus} onBlur={onBlur}/>
              </div>
              <div style={{position:'relative'}}>
                <label style={{display:'block',fontSize:10,fontWeight:900,opacity:.4,textTransform:'uppercase',letterSpacing:'.06em',marginBottom:6}}>Пароль</label>
                <input type={showPass?'text':'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Мин. 6 символов" style={{...inp,paddingRight:44}} onFocus={onFocus} onBlur={onBlur} onKeyDown={e => e.key==='Enter' && handleRegister()}/>
                <button type="button" onClick={() => setShowPass(x => !x)} style={{position:'absolute',bottom:12,right:13,background:'none',border:'none',cursor:'pointer',fontSize:16,opacity:.4,color:'white',padding:0}}>{showPass?'🙈':'👁'}</button>
              </div>
              <button onClick={handleRegister} className="btn-primary" disabled={loading} style={{padding:'14px',borderRadius:14,fontSize:14,width:'100%',boxShadow:`0 8px 24px ${themeP}44`,opacity:loading?.7:1}}>
                {loading ? <Spinner size={18} color="white"/> : '✨ Зарегистрироваться'}
              </button>
            </>
          )}
        </>
      )}
      {tab==='email' && (
        !otpSent ? (
          <>
            <div>
              <label style={{display:'block',fontSize:10,fontWeight:900,opacity:.4,textTransform:'uppercase',letterSpacing:'.06em',marginBottom:6}}>Email адрес</label>
              <input value={email} onChange={e => setEmail(e.target.value)} placeholder="example@gmail.com" type="email" style={inp} onFocus={onFocus} onBlur={onBlur} onKeyDown={e => e.key==='Enter' && handleEmailOTP()}/>
            </div>
            <button onClick={handleEmailOTP} className="btn-primary" disabled={loading} style={{padding:'14px',borderRadius:14,fontSize:14,width:'100%',boxShadow:`0 8px 24px ${themeP}44`,opacity:loading?.7:1}}>
              {loading ? <Spinner size={18} color="white"/> : '📧 Отправить код'}
            </button>
          </>
        ) : (
          <>
            <div style={{padding:14,borderRadius:14,background:'rgba(34,197,94,.08)',border:'1px solid rgba(34,197,94,.25)',textAlign:'center'}}>
              <p style={{fontSize:22,marginBottom:6}}>📬</p>
              <p style={{fontSize:13,fontWeight:800,color:'#22c55e'}}>{email}</p>
              <p style={{fontSize:12,opacity:.55,marginTop:4}}>6-значный код отправлен</p>
            </div>
            <input value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g,'').slice(0,6))} placeholder="123456" maxLength={6}
              style={{...inp,textAlign:'center',fontSize:24,fontWeight:900,letterSpacing:'0.4em',fontFamily:'JetBrains Mono,monospace'}}
              onFocus={onFocus} onBlur={onBlur} onKeyDown={e => e.key==='Enter' && handleEmailVerify()} autoFocus/>
            <button onClick={handleEmailVerify} className="btn-primary" disabled={loading||otp.length<6} style={{padding:'14px',borderRadius:14,fontSize:14,width:'100%',boxShadow:`0 8px 24px ${themeP}44`,opacity:(loading||otp.length<6)?.65:1}}>
              {loading ? <Spinner size={18} color="white"/> : '✓ Войти'}
            </button>
            <button onClick={() => {setOtpSent(false);setOtp('');}} style={{background:'none',border:'none',color:themeP,fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:'inherit',opacity:.7}}>← Другой email</button>
          </>
        )
      )}
    </div>
  );
});

/* ═══════════════════════════════════════════════════════════════
   DESC TOOLTIP
═══════════════════════════════════════════════════════════════ */
const DescTooltip = memo(({item,p,s,side='right'}) => {
  const desc = item?.desc_text || stripHtml(item?.description) || '';
  return (
    <div style={{position:'absolute',top:0,[side==='right'?'left':'right']:'calc(100% + 10px)',zIndex:600,width:280,animation:'overlayIn .22s ease both',pointerEvents:'none'}}>
      <div className="glass-dark" style={{borderRadius:18,padding:14,boxShadow:`0 20px 60px rgba(0,0,0,.75),0 0 0 1px ${p}22`,border:`1px solid ${p}33`}}>
        <p style={{fontSize:13,fontWeight:800,color:'#fff',lineHeight:1.3,marginBottom:7}}>{item?.russian||item?.name}</p>
        <div style={{display:'flex',flexWrap:'wrap',gap:4,marginBottom:8}}>
          {item?.score && <Score n={item.score}/>}
          {item?.kind && <span style={{fontSize:10,fontWeight:800,padding:'2px 7px',borderRadius:6,background:`${p}22`,color:p}}>{item.kind.toUpperCase()}</span>}
          {item?.aired_on && <span style={{fontSize:10,fontWeight:700,padding:'2px 7px',borderRadius:6,background:'rgba(255,255,255,.08)',color:'rgba(255,255,255,.45)'}}>{item.aired_on.slice(0,4)}</span>}
          {item?.episodes && <span style={{fontSize:10,fontWeight:700,padding:'2px 7px',borderRadius:6,background:'rgba(255,255,255,.08)',color:'rgba(255,255,255,.45)'}}>{item.episodes} эп.</span>}
        </div>
        {desc && <p style={{fontSize:11,lineHeight:1.65,color:'rgba(255,255,255,.55)',display:'-webkit-box',WebkitLineClamp:5,WebkitBoxOrient:'vertical',overflow:'hidden'}}>{desc}</p>}
        {item?.genres?.length > 0 && (
          <div style={{display:'flex',flexWrap:'wrap',gap:4,marginTop:8}}>
            {item.genres.slice(0,4).map(g => (
              <span key={g.id} style={{fontSize:10,fontWeight:700,padding:'2px 8px',borderRadius:20,background:`${p}15`,color:`${p}cc`,border:`1px solid ${p}30`}}>{g.russian||g.name}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

/* ═══════════════════════════════════════════════════════════════
   ANIME CARD
═══════════════════════════════════════════════════════════════ */
const AnimeCard = memo(({item,onClick,onFav,faved,status,userRating,themeP,themeS,cache,colIdx=0,cols=5}) => {
  const [loaded,setLoaded] = useState(false);
  const [hover,setHover]   = useState(false);
  const timer = useRef(null);
  const src   = imgSrc(item);
  const rich  = cache?.[item?.id] ? {...item,...cache[item.id]} : item;
  const side  = colIdx >= cols-2 ? 'left' : 'right';
  const onEnter = () => { timer.current = setTimeout(() => setHover(true), 480); };
  const onLeave = () => { clearTimeout(timer.current); setHover(false); };
  return (
    <article className="card-h" onClick={() => onClick(item)} onMouseEnter={onEnter} onMouseLeave={onLeave} style={{cursor:'pointer',userSelect:'none',position:'relative',zIndex:hover?20:1,borderRadius:16}}>
      <div style={{borderRadius:16,overflow:'hidden',aspectRatio:'2/3',background:'linear-gradient(135deg,#0b1628,#152040)',position:'relative'}}>
        {!loaded && <div className="shimmer" style={{position:'absolute',inset:0,zIndex:1}}/>}
        {src && <img src={src} alt={item.russian||item.name} loading="lazy" onLoad={() => setLoaded(true)} style={{width:'100%',height:'100%',objectFit:'cover',opacity:loaded?1:0,transition:'opacity .5s ease',animation:loaded?'posterIn .5s ease both':''}}/>}
        <div style={{position:'absolute',inset:0,background:'linear-gradient(to top,rgba(0,0,0,.95) 0%,rgba(0,0,0,.3) 45%,transparent 72%)'}}/>
        <div className="card-overlay" style={{position:'absolute',inset:0,background:`linear-gradient(to top,${themeP}33,transparent)`,opacity:0,transition:'opacity .3s ease'}}/>
        <div style={{position:'absolute',top:7,left:7,right:7,display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:4}}>
          {status && <StatusDot status={status}/>}
          {userRating && <span style={{marginLeft:'auto',background:'rgba(234,179,8,.95)',color:'#000',borderRadius:7,padding:'2px 7px',fontSize:10,fontWeight:900,boxShadow:'0 2px 8px rgba(0,0,0,.4)'}}>★{userRating}</span>}
        </div>
        <div style={{position:'absolute',bottom:0,left:0,right:0,padding:'10px 9px 10px'}}>
          {item.score && <Score n={item.score}/>}
          <p className="lc2" style={{marginTop:4,fontSize:11,fontWeight:800,color:'white',lineHeight:1.3}}>{item.russian||item.name}</p>
          {item.aired_on && <p style={{marginTop:2,fontSize:9,fontWeight:700,color:'rgba(255,255,255,.38)'}}>{item.aired_on.slice(0,4)}{item.episodes?` · ${item.episodes}эп`:''}</p>}
        </div>
        <button onClick={e => {e.stopPropagation();onFav(item);}} style={{position:'absolute',bottom:8,right:8,width:30,height:30,borderRadius:10,border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,background:faved?'#ec489999':'rgba(0,0,0,.55)',backdropFilter:'blur(8px)',transition:'all .2s',color:faved?'#fff':'rgba(255,255,255,.5)',zIndex:2,animation:faved?'heartPop .3s ease':''}}>{faved?'♥':'♡'}</button>
        {faved && <div style={{position:'absolute',inset:0,borderRadius:'inherit',boxShadow:'inset 0 0 0 2px #ec489966'}}/>}
      </div>
      {hover && <DescTooltip item={rich} p={themeP} s={themeS} side={side}/>}
    </article>
  );
});

/* ═══════════════════════════════════════════════════════════════
   ANIME ROW
═══════════════════════════════════════════════════════════════ */
const AnimeRow = memo(({item,onClick,onFav,faved,themeP,themeS,cache}) => {
  const [expanded,setExpanded] = useState(false);
  const src  = imgSrc(item);
  const rich = cache?.[item?.id] ? {...item,...cache[item.id]} : item;
  const desc = rich?.desc_text || stripHtml(rich?.description) || '';
  return (
    <div className="card" style={{borderRadius:16,overflow:'hidden',transition:'background .2s'}}>
      <div onClick={() => onClick(item)} style={{display:'flex',gap:12,padding:'11px 12px',cursor:'pointer',transition:'background .2s',position:'relative'}}
        onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,.06)'}
        onMouseLeave={e => e.currentTarget.style.background='transparent'}>
        <div style={{width:52,flexShrink:0,borderRadius:10,overflow:'hidden',aspectRatio:'2/3',background:'#0b1628',position:'relative'}}>
          {src && <img src={src} alt="" loading="lazy" style={{width:'100%',height:'100%',objectFit:'cover'}}/>}
        </div>
        <div style={{flex:1,minWidth:0,display:'flex',flexDirection:'column',justifyContent:'center',gap:5}}>
          <p className="lc2" style={{fontSize:13,fontWeight:800,color:'white',lineHeight:1.3}}>{item.russian||item.name}</p>
          <div style={{display:'flex',flexWrap:'wrap',gap:4}}>
            {item.score && <Score n={item.score}/>}
            {item.kind && <span style={{fontSize:10,fontWeight:700,padding:'2px 7px',borderRadius:6,background:'rgba(255,255,255,.08)',color:'rgba(255,255,255,.4)'}}>{item.kind}</span>}
            {item.aired_on && <span style={{fontSize:10,fontWeight:700,padding:'2px 7px',borderRadius:6,background:'rgba(255,255,255,.08)',color:'rgba(255,255,255,.35)'}}>{item.aired_on.slice(0,4)}</span>}
          </div>
          {desc && !expanded && <p className="lc2" style={{fontSize:11,lineHeight:1.55,color:'rgba(255,255,255,.32)',fontWeight:500}}>{desc}</p>}
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:6,alignItems:'center',flexShrink:0}}>
          <button onClick={e => {e.stopPropagation();onFav(item);}} style={{width:34,height:34,borderRadius:10,border:'none',cursor:'pointer',background:faved?'#ec489922':'rgba(255,255,255,.06)',color:faved?'#ec4899':'rgba(255,255,255,.3)',fontSize:15,transition:'all .2s',display:'flex',alignItems:'center',justifyContent:'center'}}>{faved?'♥':'♡'}</button>
          {desc && <button onClick={e => {e.stopPropagation();setExpanded(x => !x);}} style={{width:34,height:34,borderRadius:10,border:'none',cursor:'pointer',background:expanded?`${themeP}22`:'rgba(255,255,255,.06)',color:expanded?themeP:'rgba(255,255,255,.3)',fontSize:10,fontWeight:900,transition:'all .2s',display:'flex',alignItems:'center',justifyContent:'center',transform:expanded?'rotate(180deg)':'none'}}>▼</button>}
        </div>
      </div>
      {expanded && desc && (
        <div className="desc-expand" style={{padding:'0 12px 12px'}}>
          <div style={{padding:12,borderRadius:12,background:'rgba(255,255,255,.04)',border:`1px solid ${themeP}22`}}>
            {rich?.genres?.length > 0 && <div style={{display:'flex',flexWrap:'wrap',gap:4,marginBottom:8}}>
              {rich.genres.slice(0,6).map(g => <span key={g.id} style={{fontSize:10,fontWeight:700,padding:'2px 8px',borderRadius:20,background:`${themeP}18`,color:`${themeP}cc`,border:`1px solid ${themeP}33`}}>{g.russian||g.name}</span>)}
            </div>}
            <p style={{fontSize:12,lineHeight:1.68,color:'rgba(255,255,255,.6)'}}>{desc}</p>
          </div>
        </div>
      )}
    </div>
  );
});

/* ═══════════════════════════════════════════════════════════════
   TRENDING PAGE
═══════════════════════════════════════════════════════════════ */
const TrendingPage = memo(({themeP,themeS,onOpen,onFav,favIds,cache,library}) => {
  const [items,setItems]     = useState([]);
  const [page,setPage]       = useState(1);
  const [more,setMore]       = useState(true);
  const [loading,setLoading] = useState(true);
  const [loadingMore,setLM]  = useState(false);
  const grad = `linear-gradient(135deg,${themeP},${themeS})`;

  const fetchPage = useCallback(async (pg,append=false) => {
    try {
      const r = await fetch(`${API}/animes?limit=${TREND_PER}&page=${pg}&order=popularity`);
      const arr = await r.json();
      if (append) setItems(prev => [...prev,...(Array.isArray(arr)?arr:[])]);
      else setItems(Array.isArray(arr)?arr:[]);
      if ((Array.isArray(arr)?arr:[]).length < TREND_PER) setMore(false);
    } catch {}
    setLoading(false); setLM(false);
  }, []);

  useEffect(() => {setLoading(true);fetchPage(1,false);}, [fetchPage]);

  const loadMore = () => {
    if (loadingMore || !more) return;
    setLM(true); const next = page+1; setPage(next); fetchPage(next,true);
  };

  return (
    <div className="fu">
      <div style={{borderRadius:22,overflow:'hidden',position:'relative',marginBottom:20,background:`linear-gradient(135deg,${themeP}22,${themeS}11)`,border:`1px solid ${themeP}33`,padding:'22px 20px'}}>
        <div style={{display:'flex',alignItems:'center',gap:14,position:'relative'}}>
          <div style={{width:58,height:58,borderRadius:18,background:grad,display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,boxShadow:`0 8px 28px ${themeP}55`,flexShrink:0,animation:'glow 3s ease infinite'}}>📈</div>
          <div>
            <h2 style={{margin:'0 0 4px',fontSize:22,fontWeight:900}}>В тренде</h2>
            <p style={{margin:0,fontSize:12,color:'rgba(255,255,255,.45)',fontWeight:600}}>Самые популярные аниме · {items.length} показано</p>
          </div>
        </div>
      </div>
      {loading ? (
        <div className="trend-grid stagger">{Array(TREND_PER).fill(0).map((_,i) => <SkeletonCard key={i}/>)}</div>
      ) : (
        <>
          <div className="trend-grid stagger">
            {items.map((item,idx) => (
              <div key={`tr-${item.id}-${idx}`} style={{animation:`trendIn .35s ${Math.min(idx*.025,.4)}s both`}}>
                <AnimeCard item={item} onClick={onOpen} onFav={onFav} faved={favIds.has(item.id)} status={library[item.id]?.status} themeP={themeP} themeS={themeS} cache={cache} colIdx={idx%5} cols={5}/>
                <div style={{marginTop:5,display:'flex',alignItems:'center',gap:4}}>
                  <span style={{fontSize:11,fontWeight:900,color:idx<3?themeP:'rgba(255,255,255,.3)'}}>#{idx+1}</span>
                </div>
              </div>
            ))}
          </div>
          {more && (
            <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:10,marginTop:28,padding:'0 0 16px'}}>
              {loadingMore ? <Spinner size={28} color={themeP}/> : (
                <button onClick={loadMore} className="btn-primary" style={{padding:'13px 36px',borderRadius:14,fontSize:14,boxShadow:`0 8px 28px ${themeP}44`,display:'flex',alignItems:'center',gap:8}}>
                  <span>Загрузить ещё</span><span style={{fontSize:18}}>↓</span>
                </button>
              )}
            </div>
          )}
          {!more && items.length > 0 && <div style={{textAlign:'center',padding:'24px 0 16px',color:'rgba(255,255,255,.22)',fontSize:12,fontWeight:700}}>✓ Всё загружено · {items.length} аниме</div>}
        </>
      )}
    </div>
  );
});

/* ═══════════════════════════════════════════════════════════════
   SEARCH OVERLAY
═══════════════════════════════════════════════════════════════ */
const SearchOverlay = memo(({onClose,themeP,themeS,onOpen,history,onClearHist}) => {
  const [q,setQ]     = useState('');
  const [res,setRes] = useState([]);
  const [loading,setLd] = useState(false);
  const inputRef = useRef(null);
  const debRef   = useRef(null);
  useEffect(() => {inputRef.current?.focus();}, []);
  useEffect(() => {
    if (!q.trim()) {setRes([]);return;}
    setLd(true); clearTimeout(debRef.current);
    debRef.current = setTimeout(async () => {
      try {const r = await fetch(`${API}/animes?search=${encodeURIComponent(q)}&limit=14&order=popularity`);const d = await r.json();setRes(Array.isArray(d)?d:[]);} catch {}
      setLd(false);
    }, 400);
  }, [q]);
  return (
    <div className="fi" style={{position:'fixed',inset:0,zIndex:11000,background:'var(--base)',display:'flex',flexDirection:'column',backgroundColor:'#020c14'}}>
      <div style={{padding:'10px 14px 0',flexShrink:0}}>
        <div style={{display:'flex',alignItems:'center',gap:10,padding:'0 0 10px'}}>
          <button onClick={onClose} style={{width:38,height:38,borderRadius:12,border:'none',background:'rgba(255,255,255,.09)',cursor:'pointer',fontSize:18,display:'flex',alignItems:'center',justifyContent:'center',color:'white',flexShrink:0}}>←</button>
          <div style={{flex:1,position:'relative'}}>
            <input ref={inputRef} value={q} onChange={e => setQ(e.target.value)} placeholder="Поиск аниме, манги..." autoComplete="off" spellCheck={false} className="input" style={{width:'100%',padding:'11px 42px 11px 14px',borderRadius:14,fontSize:15,fontWeight:600}} onKeyDown={e => e.key==='Escape' && onClose()}/>
            {loading && <div style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)'}}><Spinner size={16} color={themeP}/></div>}
            {q && !loading && <button onClick={() => setQ('')} style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:'rgba(255,255,255,.4)',fontSize:16,padding:0}}>✕</button>}
          </div>
        </div>
      </div>
      <div className="ns" style={{flex:1,overflowY:'auto',padding:'0 14px 24px'}}>
        {!q && history?.length > 0 && (
          <div className="fu">
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
              <p style={{fontSize:11,fontWeight:800,opacity:.35,textTransform:'uppercase',letterSpacing:'.08em'}}>Недавние</p>
              <button onClick={onClearHist} style={{background:'none',border:'none',color:themeP,fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:'inherit',opacity:.7}}>Очистить</button>
            </div>
            {history.slice(0,8).map((h,i) => (
              <div key={i} onClick={() => setQ(h)} style={{display:'flex',alignItems:'center',gap:10,padding:'11px 12px',borderRadius:14,cursor:'pointer',transition:'background .15s',animation:`fadeUp .28s ${i*.04}s both`}}
                onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,.07)'}
                onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                <span style={{fontSize:16,opacity:.4}}>⏱</span>
                <span style={{fontSize:14,fontWeight:600,color:'rgba(255,255,255,.7)'}}>{h}</span>
                <span style={{marginLeft:'auto',fontSize:14,opacity:.2}}>↗</span>
              </div>
            ))}
          </div>
        )}
        {!q && (
          <div style={{textAlign:'center',padding:'52px 20px'}}>
            <div style={{fontSize:52,marginBottom:14,animation:'float 3s ease infinite'}}>🔍</div>
            <p style={{fontSize:16,fontWeight:800,marginBottom:6}}>Начните вводить</p>
            <p style={{fontSize:13,color:'rgba(255,255,255,.3)',fontWeight:600}}>Поиск по названию, жанру, году…</p>
          </div>
        )}
        {q && (loading && res.length===0 ? (
          <div style={{display:'flex',flexDirection:'column',alignItems:'center',padding:'48px 0',gap:12}}>
            <Spinner size={28} color={themeP}/><p style={{fontSize:13,fontWeight:700,opacity:.4}}>Ищем…</p>
          </div>
        ) : res.length===0 ? (
          <div style={{textAlign:'center',padding:'52px 20px',color:'rgba(255,255,255,.25)'}}>
            <div style={{fontSize:48,marginBottom:12,animation:'float 3s ease infinite'}}>📭</div>
            <p style={{fontSize:15,fontWeight:800}}>Ничего не нашли</p>
          </div>
        ) : (
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            <p style={{fontSize:11,fontWeight:800,opacity:.3,textTransform:'uppercase',letterSpacing:'.07em',marginBottom:4}}>Результаты: {res.length}</p>
            {res.map((item,i) => {
              const s2 = imgSrc(item);
              return (
                <div key={item.id} onClick={() => {onOpen(item);onClose();}}
                  style={{display:'flex',gap:12,padding:'10px 11px',borderRadius:14,cursor:'pointer',transition:'background .15s',border:'1px solid rgba(255,255,255,.07)',background:'rgba(255,255,255,.03)',animation:`fadeUp .28s ${i*.03}s both`}}
                  onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,.08)'}
                  onMouseLeave={e => e.currentTarget.style.background='rgba(255,255,255,.03)'}>
                  <div style={{width:46,height:64,borderRadius:10,overflow:'hidden',background:'#0b1628',flexShrink:0}}>
                    {s2 && <img src={s2} alt="" style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}}/>}
                  </div>
                  <div style={{flex:1,minWidth:0,display:'flex',flexDirection:'column',justifyContent:'center',gap:5}}>
                    <p className="lc2" style={{fontSize:14,fontWeight:800,color:'white',lineHeight:1.3}}>{item.russian||item.name}</p>
                    <div style={{display:'flex',flexWrap:'wrap',gap:4}}>
                      {item.score && <Score n={item.score}/>}
                      {item.kind && <span style={{fontSize:10,fontWeight:700,padding:'1px 7px',borderRadius:6,background:'rgba(255,255,255,.09)',color:'rgba(255,255,255,.4)'}}>{item.kind}</span>}
                    </div>
                  </div>
                  <span style={{fontSize:18,opacity:.2,alignSelf:'center'}}>→</span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
});

/* ═══════════════════════════════════════════════════════════════
   SPOTLIGHT
═══════════════════════════════════════════════════════════════ */
const Spotlight = memo(({onClose,themeP,themeS,onOpen,history,onClearHist}) => {
  const [q,setQ]     = useState('');
  const [res,setRes] = useState([]);
  const [ld,setLd]   = useState(false);
  const inputRef = useRef(null);
  const debRef   = useRef(null);
  useEffect(() => {inputRef.current?.focus();}, []);
  useEffect(() => {
    if (!q.trim()) {setRes([]);return;}
    setLd(true); clearTimeout(debRef.current);
    debRef.current = setTimeout(async () => {
      try {const r = await fetch(`${API}/animes?search=${encodeURIComponent(q)}&limit=10&order=popularity`);const d = await r.json();setRes(Array.isArray(d)?d:[]);} catch {}
      setLd(false);
    }, 360);
  }, [q]);
  return (
    <div className="fi" style={{position:'fixed',inset:0,zIndex:12000,display:'flex',alignItems:'flex-start',justifyContent:'center',padding:'80px 16px 16px',background:'rgba(0,0,0,.82)',backdropFilter:'blur(20px)'}}>
      <div onClick={onClose} style={{position:'absolute',inset:0}}/>
      <div className="glass-dark si" style={{position:'relative',width:'100%',maxWidth:580,borderRadius:22,overflow:'hidden',boxShadow:`0 30px 80px rgba(0,0,0,.8),0 0 0 1px ${themeP}33`}}>
        <div style={{display:'flex',alignItems:'center',gap:10,padding:'14px 16px',borderBottom:'1px solid rgba(255,255,255,.08)'}}>
          <span style={{fontSize:17,opacity:.35}}>🔍</span>
          <input ref={inputRef} value={q} onChange={e => setQ(e.target.value)} placeholder="Поиск аниме…" style={{flex:1,background:'transparent',border:'none',outline:'none',fontSize:16,fontWeight:600,color:'white',fontFamily:'inherit'}} onKeyDown={e => e.key==='Escape' && onClose()}/>
          {ld && <Spinner size={16} color={themeP}/>}
          <kbd style={{fontSize:11,fontWeight:700,padding:'3px 7px',borderRadius:7,background:'rgba(255,255,255,.09)',color:'rgba(255,255,255,.35)',border:'1px solid rgba(255,255,255,.13)',flexShrink:0}}>ESC</kbd>
        </div>
        <div className="ns" style={{maxHeight:400,overflowY:'auto'}}>
          {res.length > 0 ? res.map(item => (
            <div key={item.id} onClick={() => {onOpen(item);onClose();}} style={{display:'flex',gap:11,padding:'9px 16px',cursor:'pointer',transition:'background .12s',alignItems:'center'}}
              onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,.07)'}
              onMouseLeave={e => e.currentTarget.style.background='transparent'}>
              <div style={{width:36,height:52,borderRadius:8,overflow:'hidden',background:'#0b1628',flexShrink:0}}>
                {imgSrc(item) && <img src={imgSrc(item)} alt="" style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}}/>}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <p className="lc1" style={{fontSize:13,fontWeight:800,color:'white',marginBottom:4}}>{item.russian||item.name}</p>
                <div style={{display:'flex',gap:5}}>
                  {item.score && <Score n={item.score}/>}
                  {item.kind && <span style={{fontSize:10,fontWeight:700,padding:'1px 6px',borderRadius:5,background:'rgba(255,255,255,.08)',color:'rgba(255,255,255,.4)'}}>{item.kind}</span>}
                </div>
              </div>
              <span style={{opacity:.22}}>→</span>
            </div>
          )) : q && !ld ? (
            <div style={{padding:'36px',textAlign:'center',color:'rgba(255,255,255,.25)'}}><p style={{fontSize:14,fontWeight:700}}>Ничего не найдено</p></div>
          ) : history?.length > 0 ? (
            <div style={{padding:'10px 16px'}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
                <span style={{fontSize:11,fontWeight:800,opacity:.3,textTransform:'uppercase',letterSpacing:'.07em'}}>Недавние</span>
                <button onClick={onClearHist} style={{background:'none',border:'none',color:themeP,fontSize:11,fontWeight:700,cursor:'pointer',fontFamily:'inherit',opacity:.7}}>Очистить</button>
              </div>
              {history.slice(0,5).map((h,i) => (
                <div key={i} onClick={() => setQ(h)} style={{padding:'8px 10px',borderRadius:10,cursor:'pointer',fontSize:13,fontWeight:600,color:'rgba(255,255,255,.55)',transition:'all .15s',display:'flex',alignItems:'center',gap:8}}
                  onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,.07)'}
                  onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                  <span style={{opacity:.35}}>⏱</span>{h}
                </div>
              ))}
            </div>
          ) : null}
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
  const apply = () => {onChange(loc);onClose();};
  const reset = () => {const d={year:null,scoreMin:0,kind:'',status:''};setLoc(d);onChange(d);onClose();};
  const kinds    = [{v:'',l:'Все'},{v:'tv',l:'TV'},{v:'movie',l:'Фильм'},{v:'ova',l:'OVA'},{v:'ona',l:'ONA'},{v:'special',l:'Спешл'}];
  const statuses = [{v:'',l:'Все'},{v:'released',l:'Вышло'},{v:'ongoing',l:'Онгоинг'},{v:'anons',l:'Анонс'}];
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
          <div>
            <label style={{display:'block',fontSize:11,fontWeight:800,opacity:.35,textTransform:'uppercase',letterSpacing:'.07em',marginBottom:8}}>Год выхода</label>
            <div className="ns" style={{display:'flex',gap:5,overflowX:'auto',paddingBottom:4}}>
              <button onClick={() => setLoc(p => ({...p,year:null}))} style={{flexShrink:0,padding:'6px 12px',borderRadius:20,border:`1px solid ${!loc.year?themeP+'66':'rgba(255,255,255,.12)'}`,background:!loc.year?`${themeP}22`:'rgba(255,255,255,.06)',color:!loc.year?themeP:'rgba(255,255,255,.5)',cursor:'pointer',fontSize:12,fontWeight:800,fontFamily:'inherit'}}>Все</button>
              {YEARS.map(y => <button key={y} onClick={() => setLoc(p => ({...p,year:y}))} style={{flexShrink:0,padding:'6px 12px',borderRadius:20,border:`1px solid ${loc.year===y?themeP+'66':'rgba(255,255,255,.12)'}`,background:loc.year===y?`${themeP}22`:'rgba(255,255,255,.06)',color:loc.year===y?themeP:'rgba(255,255,255,.5)',cursor:'pointer',fontSize:12,fontWeight:800,fontFamily:'inherit'}}>{y}</button>)}
            </div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
            <div>
              <label style={{display:'block',fontSize:11,fontWeight:800,opacity:.35,textTransform:'uppercase',letterSpacing:'.07em',marginBottom:8}}>Тип</label>
              <div style={{display:'flex',flexWrap:'wrap',gap:5}}>
                {kinds.map(({v,l}) => <button key={v} onClick={() => setLoc(p => ({...p,kind:v}))} style={{padding:'6px 12px',borderRadius:20,border:`1px solid ${loc.kind===v?themeP+'66':'rgba(255,255,255,.12)'}`,background:loc.kind===v?`${themeP}22`:'rgba(255,255,255,.06)',color:loc.kind===v?themeP:'rgba(255,255,255,.5)',cursor:'pointer',fontSize:11,fontWeight:800,fontFamily:'inherit'}}>{l}</button>)}
              </div>
            </div>
            <div>
              <label style={{display:'block',fontSize:11,fontWeight:800,opacity:.35,textTransform:'uppercase',letterSpacing:'.07em',marginBottom:8}}>Статус</label>
              <div style={{display:'flex',flexWrap:'wrap',gap:5}}>
                {statuses.map(({v,l}) => <button key={v} onClick={() => setLoc(p => ({...p,status:v}))} style={{padding:'6px 12px',borderRadius:20,border:`1px solid ${loc.status===v?themeP+'66':'rgba(255,255,255,.12)'}`,background:loc.status===v?`${themeP}22`:'rgba(255,255,255,.06)',color:loc.status===v?themeP:'rgba(255,255,255,.5)',cursor:'pointer',fontSize:11,fontWeight:800,fontFamily:'inherit'}}>{l}</button>)}
              </div>
            </div>
          </div>
          <div>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
              <label style={{fontSize:11,fontWeight:800,opacity:.35,textTransform:'uppercase',letterSpacing:'.07em'}}>Мин. рейтинг</label>
              <span style={{fontSize:13,fontWeight:900,color:themeP}}>{loc.scoreMin>0?`${loc.scoreMin}+`:'Любой'}</span>
            </div>
            <input type="range" min={0} max={9} step={1} value={loc.scoreMin} onChange={e => setLoc(p => ({...p,scoreMin:+e.target.value}))} style={{width:'100%',background:`linear-gradient(90deg,${themeP} ${loc.scoreMin/9*100}%,rgba(255,255,255,.15) ${loc.scoreMin/9*100}%)`}}/>
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
   DETAIL PANEL (используется внутри плеера)
═══════════════════════════════════════════════════════════════ */
const DetailPanel = memo(({item,lib,ratings,notes,favs,wl,themeP,themeS,isAuth,onStatus,onRate,onNote,onFav,onWL,onShare}) => {
  const [descOpen,setDescOpen] = useState(true);
  const status = lib[item?.id]?.status;
  const rating = ratings[item?.id];
  const note   = notes[item?.id]?.text ?? '';
  const isFav  = favs.has(item?.id);
  const inWL   = wl.has(item?.id);
  const desc   = item?.desc_text || stripHtml(item?.description) || '';
  const grad   = `linear-gradient(135deg,${themeP},${themeS})`;
  if (!item) return null;

  const statusBtnStyle = (active,ac) => ({
    padding:'10px 12px',borderRadius:12,border:`1.5px solid ${active?ac+'55':'transparent'}`,
    cursor:'pointer',fontWeight:800,fontSize:12,fontFamily:'inherit',transition:'all .2s',
    background:active?`${ac}1a`:'rgba(255,255,255,.05)',color:active?ac:'rgba(255,255,255,.4)',
    boxShadow:active?`0 4px 16px ${ac}30`:'',width:'100%',textAlign:'left'
  });

  return (
    <div className="ns info-scroll" style={{padding:'14px',display:'flex',flexDirection:'column',gap:12}}>
      {/* Постер + инфо */}
      <div style={{display:'flex',gap:12,alignItems:'flex-start'}}>
        {imgSrc(item) && (
          <div style={{width:80,flexShrink:0,borderRadius:13,overflow:'hidden',aspectRatio:'2/3',boxShadow:`0 8px 28px rgba(0,0,0,.6),0 0 0 2px ${themeP}44`,animation:'posterIn .4s ease'}}>
            <img src={imgSrc(item)} alt="" style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}}/>
          </div>
        )}
        <div style={{flex:1,minWidth:0}}>
          <p style={{fontSize:16,fontWeight:900,color:'white',lineHeight:1.3,marginBottom:6}}>{item.russian||item.name}</p>
          {item.name && item.russian && item.name!==item.russian && <p style={{fontSize:11,color:'rgba(255,255,255,.35)',fontWeight:600,marginBottom:8}} className="lc1">{item.name}</p>}
          <div style={{display:'flex',flexWrap:'wrap',gap:5}}>
            {item.score && <Score n={item.score}/>}
            {item.kind && <span style={{fontSize:10,fontWeight:800,padding:'2px 8px',borderRadius:7,background:`${themeP}22`,color:themeP}}>{item.kind.toUpperCase()}</span>}
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,marginTop:9}}>
            {[[item.aired_on?.slice(0,4),'📅 Год'],[item.episodes?`${item.episodes} эп.`:null,'🎬 Серии']].filter(([v]) => v).map(([v,l]) => (
              <div key={l} style={{padding:'7px 9px',borderRadius:10,background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.07)'}}>
                <p style={{margin:'0 0 2px',fontSize:9,fontWeight:700,opacity:.35}}>{l}</p>
                <p style={{margin:0,fontSize:13,fontWeight:900}}>{v}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Описание */}
      {desc && (
        <div style={{borderRadius:14,overflow:'hidden',background:'rgba(255,255,255,.04)',border:`1px solid ${themeP}22`}}>
          <button onClick={() => setDescOpen(x => !x)} style={{width:'100%',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 13px',background:'none',border:'none',cursor:'pointer',color:themeP,fontSize:11,fontWeight:900,textTransform:'uppercase',letterSpacing:'.06em',fontFamily:'inherit'}}>
            <span>📝 Описание</span>
            <span style={{transition:'transform .3s',transform:descOpen?'rotate(180deg)':'none',opacity:.6}}>▾</span>
          </button>
          {descOpen && (
            <div className="desc-expand ns" style={{padding:'0 13px 13px',maxHeight:180,overflowY:'auto'}}>
              {item?.genres?.length > 0 && <div style={{display:'flex',flexWrap:'wrap',gap:4,marginBottom:10}}>
                {item.genres.map(g => <span key={g.id} style={{fontSize:10,fontWeight:700,padding:'2px 8px',borderRadius:20,background:`${themeP}18`,color:`${themeP}cc`,border:`1px solid ${themeP}30`}}>{g.russian||g.name}</span>)}
              </div>}
              <p style={{fontSize:12,lineHeight:1.7,color:'rgba(255,255,255,.6)'}}>{desc}</p>
            </div>
          )}
        </div>
      )}

      {/* Статус */}
      <div>
        <p style={{fontSize:10,fontWeight:900,opacity:.35,textTransform:'uppercase',letterSpacing:'.08em',marginBottom:7}}>Статус просмотра</p>
        <div style={{display:'flex',flexDirection:'column',gap:5}}>
          {[['watching','👁 Смотрю','#60a5fa'],['planned','⏳ В планах','#f59e0b'],['completed','✅ Завершено','#22c55e']].map(([k,l,c]) => (
            <button key={k} onClick={() => onStatus(item,k)} style={statusBtnStyle(status===k,c)}>{l}</button>
          ))}
        </div>
      </div>

      {/* Оценка */}
      <div>
        <p style={{fontSize:10,fontWeight:900,opacity:.35,textTransform:'uppercase',letterSpacing:'.08em',marginBottom:7}}>Оценка</p>
        <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:5}}>
          {[1,2,3,4,5,6,7,8,9,10].map(sc => (
            <button key={sc} onClick={() => onRate(item,sc)}
              className={`rating-btn${rating===sc?' active':''}`}
              style={{background:rating===sc?grad:'rgba(255,255,255,.07)',color:rating===sc?'white':'rgba(255,255,255,.35)',boxShadow:rating===sc?`0 4px 14px ${themeP}44`:'',transform:rating===sc?'scale(1.1)':'scale(1)',animation:rating===sc?'pop .3s ease both':''}}>
              {sc}
            </button>
          ))}
        </div>
      </div>

      {/* Заметки */}
      {isAuth && (
        <div>
          <p style={{fontSize:10,fontWeight:900,opacity:.35,textTransform:'uppercase',letterSpacing:'.08em',marginBottom:7}}>Заметки</p>
          <textarea value={note} onChange={e => onNote(item.id,e.target.value)} placeholder="Ваши мысли…" rows={3}
            style={{width:'100%',padding:'10px 12px',borderRadius:12,border:`1.5px solid ${note?themeP+'66':'rgba(255,255,255,.1)'}`,background:'rgba(255,255,255,.05)',color:'rgba(255,255,255,.85)',fontSize:12,fontWeight:500,resize:'vertical',outline:'none',fontFamily:'inherit',transition:'border-color .2s',minHeight:70}}
            onFocus={e => e.target.style.borderColor=themeP+'88'}
            onBlur={e => e.target.style.borderColor=note?themeP+'66':'rgba(255,255,255,.1)'}/>
        </div>
      )}

      {/* Действия */}
      <div style={{display:'flex',gap:7}}>
        <button onClick={() => onWL(item)} style={{...statusBtnStyle(inWL,themeP),flex:1}}>{inWL?'✓ В списке':'+ В список'}</button>
        <button onClick={() => onFav(item)} style={{...statusBtnStyle(isFav,'#ec4899'),flex:1}}>{isFav?'♥ Избранное':'♡ Избранное'}</button>
      </div>
      <button onClick={() => onShare(item)} className="btn-ghost" style={{padding:'9px',borderRadius:12,fontSize:12,fontWeight:800,display:'flex',alignItems:'center',justifyContent:'center',gap:6}}>
        <span>📤</span><span>Поделиться</span>
      </button>
    </div>
  );
});

/* ═══════════════════════════════════════════════════════════════
   ITEM MODAL — FULLSCREEN CINEMATIC PLAYER
═══════════════════════════════════════════════════════════════ */
const ItemModal = memo(({item,...rest}) => {
  if (!item) return null;
  const {themeP,themeS,onClose} = rest;
  const grad  = `linear-gradient(135deg,${themeP},${themeS})`;
  const bgSrc = imgSrc(item);
  const isManga = item.kind === 'manga';

  /* Swipe-to-close on mobile */
  const sheetRef    = useRef(null);
  const startY      = useRef(0);
  const [sheetH,setSheetH]   = useState(null); // null = default
  const [dragging,setDragging] = useState(false);
  const [infoOpen,setInfoOpen] = useState(false); // mobile info expand

  const onTouchStart = e => {
    startY.current = e.touches[0].clientY;
    setDragging(true);
  };
  const onTouchMove = e => {
    if (!dragging) return;
    const dy = e.touches[0].clientY - startY.current;
    if (dy > 0) setSheetH(Math.max(0, dy));
  };
  const onTouchEnd = () => {
    setDragging(false);
    if (sheetH > 120) { onClose(); }
    else setSheetH(null);
  };

  /* Lock body scroll */
  useEffect(() => {
    document.body.classList.add('scroll-lock');
    return () => document.body.classList.remove('scroll-lock');
  }, []);

  return (
    <div className="player-fullscreen fi" style={{fontFamily:'Outfit,system-ui,sans-serif'}}>
      {/* Blurred background */}
      {bgSrc && (
        <div className="player-bg-blur" style={{backgroundImage:`url(${bgSrc})`,backgroundSize:'cover',backgroundPosition:'center top'}}/>
      )}
      {/* Dark overlay */}
      <div style={{position:'absolute',inset:0,background:'rgba(0,0,0,.78)',zIndex:1}}/>

      {/* Content */}
      <div className="player-inner" style={{position:'relative',zIndex:2,display:'flex',flexDirection:'column',height:'100%',overflow:'hidden'}}>

        {/* ─── Шапка плеера ─── */}
        <div style={{display:'flex',alignItems:'center',gap:10,padding:'10px 14px',background:'rgba(0,0,0,.5)',backdropFilter:'blur(20px)',borderBottom:'1px solid rgba(255,255,255,.07)',flexShrink:0,zIndex:30}}>
          <button onClick={onClose} style={{width:36,height:36,borderRadius:12,border:'none',background:'rgba(255,255,255,.1)',cursor:'pointer',color:'white',fontSize:18,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,transition:'all .2s'}}
            onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,.2)'}
            onMouseLeave={e => e.currentTarget.style.background='rgba(255,255,255,.1)'}>
            ←
          </button>
          <div style={{flex:1,minWidth:0}}>
            <p className="lc1" style={{fontSize:14,fontWeight:900,color:'white'}}>{item.russian||item.name}</p>
            <div style={{display:'flex',gap:6,alignItems:'center',marginTop:2}}>
              {item.score && <Score n={item.score}/>}
              {item.kind && <span style={{fontSize:10,fontWeight:800,padding:'1px 7px',borderRadius:6,background:`${themeP}22`,color:themeP}}>{item.kind.toUpperCase()}</span>}
              {item.aired_on && <span style={{fontSize:10,color:'rgba(255,255,255,.35)',fontWeight:700}}>{item.aired_on.slice(0,4)}</span>}
            </div>
          </div>
          <button onClick={onClose} style={{width:32,height:32,borderRadius:10,border:'1px solid rgba(239,68,68,.4)',background:'rgba(239,68,68,.12)',cursor:'pointer',color:'#f87171',fontSize:14,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,transition:'all .2s'}}
            onMouseEnter={e => e.currentTarget.style.background='rgba(239,68,68,.3)'}
            onMouseLeave={e => e.currentTarget.style.background='rgba(239,68,68,.12)'}>
            ✕
          </button>
        </div>

        {/* ─── Основной блок: плеер + инфо ─── */}
        <div style={{flex:1,display:'flex',overflow:'hidden',flexDirection:'column'}}
          className="player-layout">
          
          {/* Плеер */}
          <div style={{position:'relative',background:'#000',flexShrink:0,width:'100%'}}
            className="player-video-wrap pi">
            
            {/* Видео / Манга */}
            {isManga ? (
              <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:16,padding:28,minHeight:220,background:'linear-gradient(135deg,rgba(0,0,0,.8),rgba(0,0,0,.6))'}}>
                {bgSrc && (
                  <div style={{position:'relative'}}>
                    <div style={{width:130,borderRadius:18,overflow:'hidden',boxShadow:`0 16px 48px rgba(0,0,0,.8),0 0 0 2px ${themeP}55`,animation:'posterIn .5s ease'}}>
                      <img src={bgSrc} alt="" style={{width:'100%',display:'block'}}/>
                    </div>
                    <div style={{position:'absolute',inset:0,borderRadius:18,boxShadow:`inset 0 0 0 2px ${themeP}44`}}/>
                  </div>
                )}
                <a href={`https://shikimori.one${item.url||''}`} target="_blank" rel="noreferrer"
                  className="btn-primary" style={{padding:'13px 32px',borderRadius:14,fontSize:14,boxShadow:`0 8px 28px ${themeP}55`,display:'inline-block',textAlign:'center'}}>
                  📖 Читать на Shikimori
                </a>
              </div>
            ) : (
              <div style={{position:'relative',width:'100%',paddingTop:'56.25%' /* 16:9 */}}>
                <iframe
                  src={`https://kodik.info/find-player?shikimoriID=${item.id}`}
                  style={{position:'absolute',inset:0,width:'100%',height:'100%',border:'none',display:'block'}}
                  allowFullScreen
                  allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
                  title={item.russian||item.name}
                />
                {/* Gradient overlay at bottom */}
                <div style={{position:'absolute',bottom:0,left:0,right:0,height:60,background:'linear-gradient(to top,rgba(0,0,0,.6),transparent)',pointerEvents:'none'}}/>
              </div>
            )}
          </div>

          {/* ─── Инфо панель ─── */}
          {/* Mobile: slide-up sheet */}
          <div className="detail-sheet-mobile"
            ref={sheetRef}
            style={{
              flex:1,
              transform: sheetH ? `translateY(${sheetH}px)` : 'none',
              transition: dragging ? 'none' : 'transform .3s cubic-bezier(.34,1.1,.64,1)',
              overflowY: 'hidden',
              display:'flex',
              flexDirection:'column',
            }}>
            {/* Swipe handle — только на мобайле */}
            <div
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
              style={{
                display:'flex',justifyContent:'center',alignItems:'center',
                padding:'10px 0 6px',cursor:'grab',flexShrink:0,
                background:'rgba(4,8,18,.97)'
              }}>
              <div style={{width:38,height:4,borderRadius:99,background:'rgba(255,255,255,.25)'}}/>
            </div>

            {/* Mobile quick-toggle info */}
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 14px 8px',flexShrink:0,background:'rgba(4,8,18,.97)'}}
              className="info-mobile-toggle">
              <div style={{display:'flex',gap:8,alignItems:'center'}}>
                <span style={{fontSize:12,fontWeight:800,color:'rgba(255,255,255,.5)'}}>
                  {item.russian?.length > 22 ? item.russian.slice(0,22)+'…' : (item.russian||item.name)}
                </span>
              </div>
              <button onClick={() => setInfoOpen(x => !x)}
                style={{padding:'5px 12px',borderRadius:20,border:`1px solid ${themeP}55`,background:`${themeP}18`,color:themeP,cursor:'pointer',fontFamily:'inherit',fontSize:12,fontWeight:800,display:'flex',alignItems:'center',gap:5}}>
                {infoOpen ? '▾ Скрыть' : '▸ Инфо'}
              </button>
            </div>

            {/* Detail content */}
            <div style={{flex:1,overflowY:'auto',scrollbarWidth:'none',background:'rgba(4,8,18,.97)'}}
              className={infoOpen ? '' : 'info-desktop-always'}>
              <DetailPanel item={item} {...rest}/>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop стили через inline style tag */}
      <style>{`
        @media(min-width:1024px){
          .player-layout{flex-direction:row!important}
          .player-video-wrap{flex:1!important;min-width:0!important;padding-top:0!important;height:100%!important}
          .player-video-wrap iframe{position:relative!important;height:100%!important;padding-top:0!important;min-height:400px}
          .player-video-wrap>div{padding-top:0!important;height:100%!important}
          .detail-sheet-mobile{width:380px!important;flex-shrink:0!important;border-radius:0!important;background:rgba(4,8,18,.97)!important;border-left:1px solid rgba(255,255,255,.08)!important;transform:none!important}
          .info-mobile-toggle{display:none!important}
          .info-desktop-always{display:block!important}
          .detail-sheet-mobile>div:first-child{display:none!important}
        }
        @media(max-width:1023px){
          .info-desktop-always>div{display:none}
          .info-mobile-toggle+.info-desktop-always>div{display:block}
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
  const dist  = Array.from({length:10},(_,i) => ({s:i+1,c:rvals.filter(r => r===i+1).length}));
  const maxC  = Math.max(...dist.map(d => d.c),1);
  const byS   = {completed:Object.values(lib).filter(a => a.status==='completed').length,watching:Object.values(lib).filter(a => a.status==='watching').length,planned:Object.values(lib).filter(a => a.status==='planned').length};
  return (
    <div className="fu" style={{display:'flex',flexDirection:'column',gap:14}}>
      <div style={{borderRadius:22,padding:20,background:`linear-gradient(135deg,${themeP}1a,${themeS}0d)`,border:`1px solid ${themeP}33`,position:'relative',overflow:'hidden'}}>
        <div style={{display:'flex',alignItems:'center',gap:14,position:'relative'}}>
          <div style={{width:68,height:68,borderRadius:18,background:grad,display:'flex',alignItems:'center',justifyContent:'center',fontSize:32,boxShadow:`0 8px 28px ${themeP}55`,flexShrink:0,animation:'glow 3s ease infinite'}}>{rank.b}</div>
          <div style={{flex:1,minWidth:0}}>
            <p style={{fontSize:22,fontWeight:900,color:rank.c,marginBottom:3}}>{rank.l}</p>
            <p style={{fontSize:12,color:'rgba(255,255,255,.45)',fontWeight:600,marginBottom:9}}>Уровень {stats.level} · {user.xp} XP</p>
            <Bar value={stats.xpInLvl} max={100} grad={grad} h={6}/>
            <p style={{fontSize:10,color:'rgba(255,255,255,.3)',fontWeight:600,marginTop:4}}>{stats.xpInLvl}/100 XP до следующего уровня</p>
          </div>
        </div>
      </div>
      <div className="stats-grid">
        {[['Завершено',stats.watched,'#22c55e','✅'],['Смотрю',stats.watching,'#60a5fa','👁'],['В планах',stats.planned,'#f59e0b','⏳'],['Часов',stats.hours,'#a855f7','⏱'],['Оценено',stats.rated,'#eab308','★'],['Ср.оценка',stats.avgRating,'#ec4899','♥'],['Избранное',favs,'#f97316','♡'],['Заметки',stats.notes,'#14b8a6','📝']].map(([l,v,c,i]) => (
          <div key={l} style={{padding:12,borderRadius:14,background:`${c}0e`,border:`1px solid ${c}22`,animation:'countUp .4s ease both'}}>
            <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:4}}>
              <span style={{fontSize:14}}>{i}</span>
              <span style={{fontSize:10,fontWeight:700,color:`${c}88`,textTransform:'uppercase',letterSpacing:'.04em'}}>{l}</span>
            </div>
            <p style={{fontSize:24,fontWeight:900,color:c,lineHeight:1}}>{fmt(v)}</p>
          </div>
        ))}
      </div>
      <div className="card" style={{borderRadius:18,padding:18}}>
        <p style={{fontSize:11,fontWeight:800,opacity:.35,textTransform:'uppercase',letterSpacing:'.08em',marginBottom:14}}>Библиотека</p>
        {[['completed','Завершено','#22c55e'],['watching','Смотрю','#60a5fa'],['planned','В планах','#f59e0b']].map(([k,l,c]) => (
          <div key={k} style={{marginBottom:12}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:5}}>
              <span style={{fontSize:12,fontWeight:700,color:'rgba(255,255,255,.55)'}}>{l}</span>
              <span style={{fontSize:12,fontWeight:900,color:c}}>{byS[k]}</span>
            </div>
            <Bar value={byS[k]} max={Math.max(...Object.values(byS),1)} grad={`linear-gradient(90deg,${c},${c}88)`} h={5}/>
          </div>
        ))}
      </div>
      {rvals.length > 0 && (
        <div className="card" style={{borderRadius:18,padding:18}}>
          <p style={{fontSize:11,fontWeight:800,opacity:.35,textTransform:'uppercase',letterSpacing:'.08em',marginBottom:14}}>Распределение оценок</p>
          <div style={{display:'flex',gap:5,alignItems:'flex-end',height:80}}>
            {dist.map(({s,c}) => {
              const h = (c/maxC)*100;
              const col = s>=8?'#22c55e':s>=6?'#eab308':s>=4?'#f97316':'#ef4444';
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
      <div className="card" style={{borderRadius:18,padding:18}}>
        <div style={{display:'flex',justifyContent:'space-between',marginBottom:12}}>
          <p style={{fontSize:11,fontWeight:800,opacity:.35,textTransform:'uppercase',letterSpacing:'.08em'}}>Достижения</p>
          <span style={{fontSize:12,fontWeight:900,color:themeP}}>{achs.length}/{ACHS.length}</span>
        </div>
        <Bar value={achs.length} max={ACHS.length} grad={grad} h={6} style={{marginBottom:14}}/>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:6}}>
          {ACHS.map(a => {
            const done = achs.includes(a.id);
            return (
              <div key={a.id} title={`${a.n}: ${a.d}`} style={{borderRadius:12,padding:'9px 4px',textAlign:'center',background:done?`${themeP}18`:'rgba(255,255,255,.04)',border:`1px solid ${done?themeP+'44':'rgba(255,255,255,.06)'}`,opacity:done?1:.38,transition:'all .3s',animation:done?'pop .5s ease both':''}}>
                <span style={{fontSize:18,display:'block',marginBottom:3}}>{a.e}</span>
                <p style={{fontSize:9,fontWeight:900,color:done?'white':'rgba(255,255,255,.5)',lineHeight:1.2}}>{a.n}</p>
                {done && <p style={{fontSize:9,fontWeight:900,color:themeP,marginTop:2}}>+{a.xp}XP</p>}
              </div>
            );
          })}
        </div>
      </div>
      <div className="card" style={{borderRadius:18,padding:18}}>
        <div style={{display:'flex',justifyContent:'space-between',marginBottom:12}}>
          <p style={{fontSize:11,fontWeight:800,opacity:.35,textTransform:'uppercase',letterSpacing:'.08em'}}>Стрик входа</p>
          <span style={{fontSize:12,fontWeight:900,color:'#f97316'}}>{user.loginStreak||0} дней 🔥</span>
        </div>
        <div style={{display:'flex',gap:5}}>
          {Array(7).fill(0).map((_,i) => <div key={i} style={{flex:1,height:8,borderRadius:99,background:i<(user.loginStreak||0)?grad:'rgba(255,255,255,.09)',transition:'background .3s'}}/>)}
        </div>
        <div style={{display:'flex',justifyContent:'space-between',marginTop:6}}>
          {['Пн','Вт','Ср','Чт','Пт','Сб','Вс'].map((d,i) => <span key={i} style={{flex:1,textAlign:'center',fontSize:9,fontWeight:700,color:i<(user.loginStreak||0)?themeP:'rgba(255,255,255,.2)'}}>{d}</span>)}
        </div>
      </div>
    </div>
  );
});

/* ═══════════════════════════════════════════════════════════════
   PROFILE SHEET
═══════════════════════════════════════════════════════════════ */
const ProfileSheet = memo(({user,stats,achs,themeP,themeS,syncSt,curTheme,darkMode,dailyGoal,sbCfg,onClose,onSave,onLogout,onExport,onImport,onAvatar,onUser,onTheme,onDark,onDGoal,onResetCfg,fileRef}) => {
  const [tab,setTab] = useState('profile');
  const rank = getRank(user.xp);
  const grad = `linear-gradient(135deg,${themeP},${themeS})`;
  const syncC = {idle:'rgba(255,255,255,.3)',syncing:themeP,synced:'#22c55e',error:'#ef4444'}[syncSt];
  const inp   = {width:'100%',padding:'11px 13px',borderRadius:12,border:'1.5px solid rgba(255,255,255,.1)',background:'rgba(255,255,255,.06)',color:'white',fontSize:13,fontWeight:700,outline:'none',fontFamily:'inherit',transition:'all .2s'};
  return (
    <div style={{position:'fixed',inset:0,zIndex:9900,display:'flex',flexDirection:'column',justifyContent:'flex-end'}}>
      <div className="fi" style={{position:'absolute',inset:0,background:'rgba(0,0,0,.78)',backdropFilter:'blur(16px)'}} onClick={onClose}/>
      <div className="su glass-dark prof-sheet" style={{position:'relative',borderRadius:'26px 26px 0 0',maxHeight:'92dvh',display:'flex',flexDirection:'column',boxShadow:'0 -28px 70px rgba(0,0,0,.75)'}}>
        <div style={{display:'flex',justifyContent:'center',padding:'10px 0 4px',flexShrink:0}}>
          <div style={{width:36,height:4,borderRadius:99,background:'rgba(255,255,255,.2)'}}/>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:12,padding:'8px 18px 12px',flexShrink:0,borderBottom:'1px solid rgba(255,255,255,.07)'}}>
          <div style={{position:'relative',flexShrink:0}}>
            <img src={user.avatar} alt="" onClick={() => fileRef.current?.click()} style={{width:52,height:52,borderRadius:16,objectFit:'cover',border:`2.5px solid ${themeP}`,boxShadow:`0 0 18px ${themeP}55`,cursor:'pointer',display:'block'}}/>
            <input type="file" ref={fileRef} onChange={onAvatar} accept="image/*" style={{display:'none'}}/>
            <div style={{position:'absolute',bottom:-4,right:-4,width:18,height:18,borderRadius:6,background:grad,display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,color:'white',fontWeight:900,pointerEvents:'none'}}>✎</div>
          </div>
          <div style={{flex:1,minWidth:0}}>
            <p className="lc1" style={{fontSize:16,fontWeight:900,color:'white'}}>{user.name}</p>
            <p style={{fontSize:11,fontWeight:700,color:rank.c,marginTop:2}}>{rank.b} {rank.l} · Ур.{stats.level}</p>
            {user.email && <p style={{fontSize:10,color:'rgba(255,255,255,.25)',marginTop:1}}>{user.email}</p>}
          </div>
          <div style={{display:'flex',alignItems:'center',gap:8,flexShrink:0}}>
            <div style={{display:'flex',alignItems:'center',gap:5,padding:'4px 9px',borderRadius:8,background:'rgba(255,255,255,.06)',color:syncC,fontSize:10,fontWeight:800}}>
              {syncSt==='syncing' ? <Spinner size={10} color={themeP}/> : <span style={{width:6,height:6,borderRadius:'50%',background:'currentColor',display:'inline-block',flexShrink:0}}/>}
              <span>{syncSt==='synced'?'Сохр.':syncSt==='syncing'?'Синхр.':syncSt==='error'?'Ошибка':'☁️'}</span>
            </div>
            <button onClick={onClose} style={{width:30,height:30,borderRadius:10,border:'none',background:'rgba(255,255,255,.08)',cursor:'pointer',color:'rgba(255,255,255,.5)',fontSize:14,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'inherit'}}>✕</button>
          </div>
        </div>
        <div style={{padding:'8px 18px 12px',flexShrink:0,borderBottom:'1px solid rgba(255,255,255,.07)'}}>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:5}}>
            <span style={{fontSize:11,opacity:.35,fontWeight:700}}>Прогресс уровня</span>
            <span style={{fontSize:11,fontWeight:900,color:themeP}}>{stats.xpInLvl}/100 XP</span>
          </div>
          <Bar value={stats.xpInLvl} max={100} grad={grad} h={5}/>
        </div>
        <div style={{display:'flex',gap:4,padding:'8px 18px',flexShrink:0,borderBottom:'1px solid rgba(255,255,255,.07)'}}>
          {[['profile','Профиль','👤'],['settings','Настройки','⚙️'],['data','Данные','💾']].map(([k,l,i]) => (
            <button key={k} onClick={() => setTab(k)} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:2,padding:'7px 4px',borderRadius:10,border:'none',cursor:'pointer',fontFamily:'inherit',background:tab===k?`${themeP}22`:'transparent',color:tab===k?themeP:'rgba(255,255,255,.35)',transition:'all .2s'}}>
              <span style={{fontSize:15}}>{i}</span><span style={{fontSize:10,fontWeight:800}}>{l}</span>
            </button>
          ))}
        </div>
        <div className="ns" style={{flex:1,overflowY:'auto',padding:'16px 18px 32px'}}>
          {tab==='profile' && (
            <div className="fu" style={{display:'flex',flexDirection:'column',gap:12}}>
              <div>
                <label style={{display:'block',fontSize:10,fontWeight:900,opacity:.35,textTransform:'uppercase',letterSpacing:'.06em',marginBottom:6}}>Имя</label>
                <input value={user.name} maxLength={20} onChange={e => onUser({name:e.target.value})} style={inp} onFocus={e => {e.target.style.borderColor=themeP+'88';}} onBlur={e => {e.target.style.borderColor='rgba(255,255,255,.1)';}}/>
              </div>
              <div>
                <label style={{display:'block',fontSize:10,fontWeight:900,opacity:.35,textTransform:'uppercase',letterSpacing:'.06em',marginBottom:6}}>Биография</label>
                <input value={user.bio||''} maxLength={80} onChange={e => onUser({bio:e.target.value})} placeholder="Расскажите о себе…" style={{...inp,color:'rgba(255,255,255,.7)'}} onFocus={e => {e.target.style.borderColor=themeP+'88';}} onBlur={e => {e.target.style.borderColor='rgba(255,255,255,.1)';}}/>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8}}>
                {[['Завершено',stats.watched,'✅'],['Часов',stats.hours,'⏱'],['Оценено',stats.rated,'★']].map(([l,v,i]) => (
                  <div key={l} style={{borderRadius:14,padding:'12px 8px',textAlign:'center',background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.07)'}}>
                    <span style={{fontSize:20,display:'block',marginBottom:3}}>{i}</span>
                    <p style={{fontSize:18,fontWeight:900,color:'white'}}>{fmt(v)}</p>
                    <p style={{fontSize:10,opacity:.35,fontWeight:700}}>{l}</p>
                  </div>
                ))}
              </div>
              <button onClick={() => {onSave();onClose();}} className="btn-primary" style={{padding:13,borderRadius:14,fontSize:14,boxShadow:`0 8px 24px ${themeP}44`}}>💾 Сохранить</button>
              <button onClick={onLogout} className="btn-ghost" style={{padding:11,borderRadius:12,fontSize:13,border:'1px solid rgba(239,68,68,.3)',color:'#f87171',background:'rgba(239,68,68,.09)'}}>🚪 Выйти из аккаунта</button>
            </div>
          )}
          {tab==='settings' && (
            <div className="fu" style={{display:'flex',flexDirection:'column',gap:16}}>
              <div>
                <p style={{fontSize:11,fontWeight:800,opacity:.35,textTransform:'uppercase',letterSpacing:'.08em',marginBottom:10}}>Цветовая тема</p>
                <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:7}}>
                  {Object.entries(THEMES).map(([k,t]) => {
                    const active = curTheme===k;
                    return <button key={k} onClick={() => onTheme(k)} style={{padding:'10px 4px',borderRadius:13,border:`1.5px solid ${active?t.p:'rgba(255,255,255,.07)'}`,background:active?`${t.p}22`:'rgba(255,255,255,.04)',cursor:'pointer',textAlign:'center',fontFamily:'inherit',transition:'all .2s',transform:active?'scale(1.06)':'scale(1)'}}>
                      <div style={{fontSize:17,marginBottom:3}}>{t.i}</div>
                      <p style={{fontSize:10,fontWeight:900,color:active?t.p:'rgba(255,255,255,.45)',margin:0}}>{t.n}</p>
                    </button>;
                  })}
                </div>
              </div>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 13px',borderRadius:14,background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.07)'}}>
                <p style={{fontSize:13,fontWeight:800}}>Тёмный режим</p>
                <Toggle v={darkMode} onChange={onDark} color={themeP}/>
              </div>
              <div style={{padding:'12px 13px',borderRadius:14,background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.07)'}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:10}}>
                  <p style={{fontSize:13,fontWeight:800}}>Дневная цель</p>
                  <span style={{fontSize:24,fontWeight:900,color:themeP}}>{dailyGoal}</span>
                </div>
                <input type="range" min={1} max={10} value={dailyGoal} onChange={e => onDGoal(+e.target.value)} style={{width:'100%',background:`linear-gradient(90deg,${themeP} ${dailyGoal*10}%,rgba(255,255,255,.12) ${dailyGoal*10}%)`}}/>
              </div>
            </div>
          )}
          {tab==='data' && (
            <div className="fu" style={{display:'flex',flexDirection:'column',gap:11}}>
              <div style={{padding:14,borderRadius:14,background:'rgba(34,197,94,.06)',border:'1px solid rgba(34,197,94,.2)'}}>
                <p style={{fontSize:12,fontWeight:800,color:'#22c55e',marginBottom:5}}>✓ Синхронизация Supabase активна</p>
                <p style={{fontSize:11,opacity:.5,lineHeight:1.55}}>Данные синхронизируются автоматически. Войдите с тем же аккаунтом на любом устройстве.</p>
                <p style={{fontSize:11,color:'rgba(255,255,255,.35)',marginTop:6}}>Сервер: {sbCfg?.url?.replace('https://','').split('.')[0]}…</p>
              </div>
              <div style={{display:'flex',gap:8}}>
                <button onClick={onExport} className="btn-ghost" style={{flex:1,padding:12,borderRadius:12,fontSize:12}}>💾 Экспорт</button>
                <label style={{flex:1,cursor:'pointer'}}>
                  <input type="file" onChange={onImport} accept=".json" style={{display:'none'}}/>
                  <div className="btn-ghost" style={{padding:12,borderRadius:12,fontSize:12,fontWeight:800,textAlign:'center',cursor:'pointer',border:'1px solid rgba(255,255,255,.1)'}}>📥 Импорт</div>
                </label>
              </div>
              <button onClick={onResetCfg} style={{padding:10,borderRadius:12,border:'1px solid rgba(249,115,22,.3)',background:'rgba(249,115,22,.07)',color:'#fb923c',cursor:'pointer',fontSize:12,fontWeight:800,fontFamily:'inherit'}}>⚙ Сбросить Supabase настройки</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

/* ═══════════════════════════════════════════════════════════════
   MAIN APP
═══════════════════════════════════════════════════════════════ */
export default function App() {
  /* ── Supabase config ── */
  const [sbCfg,setSbCfg]   = useState(() => loadCfg());
  const sb = useMemo(() => sbCfg ? mkSB(sbCfg.url,sbCfg.key) : null, [sbCfg]);

  /* ── Auth ── */
  const [session,setSession]   = useState(null);
  const [isAuth,setIsAuth]     = useState(false);
  const [authOpen,setAuthOpen] = useState(false);
  const [profOpen,setProfOpen] = useState(false);
  const [syncSt,setSyncSt]     = useState('idle');

  /* ── User data ── */
  const [user,setUser]           = useState(() => mkUser());
  const [library,setLibrary]     = useState({});
  const [histD,setHistD]         = useState([]);
  const [ratings,setRatings]     = useState({});
  const [achs,setAchs]           = useState([]);
  const [favs,setFavs]           = useState([]);
  const [notes,setNotes]         = useState({});
  const [wl,setWl]               = useState([]);
  const [dailyGoal,setDailyGoal] = useState(3);
  const [dailyProg,setDailyProg] = useState(0);
  const [searchHist,setSearchHist] = useState([]);
  const [shareCount,setShareCount] = useState(0);
  const [xpToday,setXpToday]     = useState({});

  /* ── UI ── */
  const [boot,setBoot]         = useState(true);
  const [view,setView]         = useState('home');
  const [content,setContent]   = useState([]);
  const [trendCache,setTC]     = useState([]);
  const [selItem,setSelItem]   = useState(null);
  const [loading,setLoading]   = useState(true);
  const [search,setSearch]     = useState('');
  const [genre,setGenre]       = useState(null);
  const [page,setPage]         = useState(1);
  const [sort,setSort]         = useState('popularity');
  const [vMode,setVMode]       = useState('grid');
  const [curTheme,setCurTheme] = useState('ocean');
  const [darkMode,setDarkMode] = useState(true);
  const [toasts,setToasts]     = useState([]);
  const [achPop,setAchPop]     = useState(null);
  const [descCache,setDescCache] = useState({});
  const [spotlight,setSpotlight] = useState(false);
  const [mSearch,setMSearch]   = useState(false);
  const [filterOpen,setFilterOpen] = useState(false);
  const [filters,setFilters]   = useState({year:null,scoreMin:0,kind:'',status:''});
  const [mousePos,setMousePos] = useState({x:0,y:0});
  const [logoutDlg,setLogoutDlg] = useState(false);

  const fileRef       = useRef(null);
  const saveRef       = useRef(null);
  const dataLoadedRef = useRef(false); // ma'lumotlar yuklanmaguncha save bloklanadi
  const theme         = THEMES[curTheme] ?? THEMES.ocean;

  /* ── Mouse glow ── */
  useEffect(() => {
    const h = e => setMousePos({x:e.clientX,y:e.clientY});
    window.addEventListener('mousemove',h,{passive:true});
    return () => window.removeEventListener('mousemove',h);
  }, []);

  /* ── Keyboard shortcuts ── */
  useEffect(() => {
    const h = e => {
      if ((e.ctrlKey||e.metaKey) && e.key==='k') {e.preventDefault();setSpotlight(x => !x);}
      if (e.key==='Escape') {setSpotlight(false);setFilterOpen(false);setMSearch(false);}
    };
    window.addEventListener('keydown',h);
    return () => window.removeEventListener('keydown',h);
  }, []);

  /* ── CSS inject ── */
  useEffect(() => {
    let el = document.getElementById('ahub-css');
    if (!el) {el=document.createElement('style');el.id='ahub-css';document.head.appendChild(el);}
    el.textContent = buildCSS(theme.p,theme.s,theme.b,theme.m);
    document.body.style.background = theme.b;
  }, [curTheme,theme]);

  /* ── Boot ── */
  useEffect(() => {const t=setTimeout(() => setBoot(false),1600);return () => clearTimeout(t);}, []);

  /* ── Toast ── */
  const toast = useCallback((msg,type='success') => {
    const id = Date.now()+Math.random();
    setToasts(p => [...p.slice(-3),{id,msg,type}]);
    setTimeout(() => setToasts(p => p.filter(t => t.id!==id)),3800);
  }, []);

  /* ── XP ── */
  const addXP = useCallback((amt,key) => {
    if (!isAuth) return;
    const k = `${key}_${today()}`;
    setXpToday(p => {
      if (p[k]) return p;
      setUser(u => ({...u,xp:u.xp+amt}));
      return {...p,[k]:true};
    });
  }, [isAuth]);

  /* ── Achievements ── */
  const achsRef = useRef([]);
  const unlockAch = useCallback((id) => {
    if (!isAuth) return;
    if (achsRef.current.includes(id)) return;
    setAchs(prev => {
      if (prev.includes(id)) return prev;
      achsRef.current = [...prev,id];
      const a = ACHS.find(x => x.id===id); if (!a) return prev;
      setUser(u => ({...u,xp:u.xp+a.xp}));
      setAchPop(a); setTimeout(() => setAchPop(null),4200);
      return [...prev,id];
    });
  }, [isAuth]);

  /* ── Stats ── */
  const stats = useMemo(() => {
    const lv       = Math.floor(user.xp/100)+1;
    const libV     = Object.values(library);
    const watched  = libV.filter(a => a.status==='completed').length;
    const watching = libV.filter(a => a.status==='watching').length;
    const planned  = libV.filter(a => a.status==='planned').length;
    const rv       = Object.values(ratings);
    const rated    = rv.length;
    const avg      = rated ? (rv.reduce((a,b) => a+b,0)/rated).toFixed(1) : '—';
    const notesCnt = Object.values(notes).filter(n => n?.text).length;
    const perf10   = rv.filter(r => r===10).length;
    const genreSet = new Set(libV.filter(a => a.status==='completed').flatMap(a => a.genres?.map(g => g.id)??[]));
    return {level:lv,xpInLvl:user.xp%100,watched,watching,planned,rated,avgRating:avg,hours:Math.round(watched*4.5),notes:notesCnt,perf10,genres:genreSet.size,libSize:Object.keys(library).length};
  }, [user.xp,library,ratings,notes]);

  /* ── Auth guard ── */
  const PROTECTED = useMemo(() => new Set(['library','history','watchlist','favs','stats']), []);
  const prevViewRef = useRef('home');
  useEffect(() => {
    if (!isAuth && PROTECTED.has(view)) {
      setView(prevViewRef.current);
      toast('🔐 Войдите для доступа к этому разделу','warning');
      setAuthOpen(true);
    } else {
      prevViewRef.current = view;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, isAuth]);

  /* ── Ach triggers ── */
  useEffect(() => {
    if (!isAuth) return;
    if (stats.watched>=1)    unlockAch('first');
    if (stats.rated>=10)    unlockAch('rate10');
    if (stats.watched>=50)   unlockAch('comp50');
    if (stats.level>=10)    unlockAch('lv10');
    if (favs.length>=20)    unlockAch('fav20');
    if (stats.notes>=10)    unlockAch('notes10');
    if (stats.libSize>=100) unlockAch('lib100');
    if (searchHist.length>=10) unlockAch('search10');
    if (shareCount>=5)       unlockAch('share5');
    if (stats.perf10>=10)   unlockAch('perf10');
    const h = new Date().getHours();
    if (h>=5 && h<7) unlockAch('early');
    if (h<3)         unlockAch('night');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stats,isAuth,favs.length,searchHist.length,shareCount]);

  /* ── Apply user data from Supabase ── */
  const applyUserData = useCallback((data) => {
    if (!data) return;
    setUser(data.user ?? mkUser());
    setLibrary(data.library ?? {});
    setHistD(data.history ?? []);
    setRatings(data.ratings ?? {});
    const la = data.achs ?? [];
    achsRef.current = la;
    setAchs(la);
    setFavs(data.favs ?? []);
    setNotes(data.notes ?? {});
    setWl(data.wl ?? []);
    setCurTheme(data.theme ?? 'ocean');
    setDarkMode(data.dark ?? true);
    setDailyGoal(data.dGoal ?? 3);
    setDailyProg(data.dProg ?? 0);
    setSearchHist(data.searchHist ?? []);
    setShareCount(data.shareCount ?? 0);
  }, []);

  const onAuthSuccess = useCallback(async (r) => {
    const sess = LS.json(SESS_KEY);
    if (!sess) return;
    setSession(sess); setIsAuth(true); setAuthOpen(false);
    const email  = r.user?.email||'';
    const sbName = r.user?.user_metadata?.display_name||email.split('@')[0]||'Anime Fan';
    try {
      const data = await sb.getData(sess.access_token,sess.user_id);
      if (data) { applyUserData(data); toast(`С возвращением, ${data.user?.name||sbName}! 👋`); }
      else {
        const nu = mkUser(sbName); nu.email = email;
        setUser(nu); toast(`Добро пожаловать, ${sbName}! 🎉`);
      }
    } catch {toast('Данные загружены локально','info');}
    dataLoadedRef.current = true; // endi save ishlashi mumkin
  }, [sb,applyUserData,toast]);

  /* ── Auto-login ── */
  useEffect(() => {
    if (!sb) return;
    (async () => {
      const sess = LS.json(SESS_KEY);
      if (!sess?.access_token) return;
      if (sess.expires_at && Date.now() > sess.expires_at-60000) {
        try {
          const nr = await sb.refreshToken(sess.refresh_token);
          if (nr?.access_token) {
            const ns = {...sess,access_token:nr.access_token,refresh_token:nr.refresh_token,expires_at:Date.now()+3600*1000};
            LS.set(SESS_KEY,JSON.stringify(ns)); setSession(ns); setIsAuth(true);
            const data = await sb.getData(ns.access_token,ns.user_id);
            if (data) applyUserData(data);
            dataLoadedRef.current = true; // token yangilangan, data yuklandi
            return;
          }
        } catch {}
        LS.del(SESS_KEY); return;
      }
      setSession(sess); setIsAuth(true);
      try {
        const data = await sb.getData(sess.access_token,sess.user_id);
        if (data) applyUserData(data);
      } catch {}
      dataLoadedRef.current = true; // auto-login tugadi, save ruxsat berildi
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sb]);

  /* ── Auto-refresh token ── */
  useEffect(() => {
    if (!session?.refresh_token||!sb) return;
    const remaining = (session.expires_at||0)-Date.now()-5*60*1000;
    if (remaining<=0) return;
    const t = setTimeout(async () => {
      try {
        const nr = await sb.refreshToken(session.refresh_token);
        if (nr?.access_token) {
          const ns = {...session,access_token:nr.access_token,refresh_token:nr.refresh_token,expires_at:Date.now()+3600*1000};
          LS.set(SESS_KEY,JSON.stringify(ns)); setSession(ns);
        }
      } catch {}
    }, remaining);
    return () => clearTimeout(t);
  }, [session,sb]);

  /* ── Save to Supabase (debounced) ── */
  const latestRef = useRef({});
  useEffect(() => {
    latestRef.current = {isAuth,session,sb,user,library,histD,ratings,achs,favs,notes,wl,curTheme,darkMode,dailyGoal,dailyProg,searchHist,shareCount};
  });

  const save = useCallback(async () => {
    const d = latestRef.current;
    if (!d.isAuth||!d.session||!d.sb) return;
    if (!dataLoadedRef.current) return; // ma'lumotlar yuklanmagan bo'lsa saqlamaymiz
    const payload = {user:d.user,library:d.library,history:d.histD,ratings:d.ratings,achs:d.achs,favs:d.favs,notes:d.notes,wl:d.wl,theme:d.curTheme,dark:d.darkMode,dGoal:d.dailyGoal,dProg:d.dailyProg,searchHist:d.searchHist.slice(0,20),shareCount:d.shareCount};
    setSyncSt('syncing');
    try {const ok = await d.sb.upsertData(d.session.access_token,d.session.user_id,payload);setSyncSt(ok?'synced':'error');}
    catch {setSyncSt('error');}
    setTimeout(() => setSyncSt('idle'),2400);
  }, []);

  useEffect(() => {
    if (!isAuth||!session) return;
    clearTimeout(saveRef.current);
    saveRef.current = setTimeout(save,SAVE_DELAY);
    return () => clearTimeout(saveRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user,library,histD,ratings,achs,favs,notes,wl,curTheme,darkMode,dailyGoal,dailyProg,isAuth,session]);

  /* ── Logout ── */
  const doLogout = useCallback(async () => {
    if (session?.access_token&&sb) { try {await sb.signOut(session.access_token);} catch {} }
    LS.del(SESS_KEY);
    dataLoadedRef.current = false; // keyingi loginda yana bloklash
    setSession(null); setIsAuth(false); setUser(mkUser()); setLibrary({}); setHistD([]);
    setRatings({}); setAchs([]); setFavs([]); setNotes({}); setWl([]);
    setLogoutDlg(false); setProfOpen(false);
    toast('До встречи! 👋','info');
  }, [session,sb,toast]);

  /* ── Content fetch ── */
  const SKIP = useMemo(() => new Set(['library','history','trending','favs','watchlist','stats']), []);
  useEffect(() => {
    if (SKIP.has(view)) {setLoading(false);return;}
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const ep  = view==='manga' ? 'mangas' : 'animes';
        let url = `${API}/${ep}?limit=${PER_PAGE}&page=${page}&order=${sort}`;
        if (search)         url += `&search=${encodeURIComponent(search)}`;
        if (genre)          url += `&genre=${genre}`;
        if (filters.year)   url += `&season=${filters.year}`;
        if (filters.kind)   url += `&kind=${filters.kind}`;
        if (filters.status) url += `&status=${filters.status}`;
        if (filters.scoreMin) url += `&score=${filters.scoreMin}`;
        const [dataR,trendR] = await Promise.all([
          fetch(url),
          trendCache.length ? null : fetch(`${API}/animes?limit=${TREND_PER}&page=1&order=popularity`),
        ]);
        if (cancelled) return;
        const data = await dataR.json();
        setContent(Array.isArray(data)?data:[]);
        if (trendR) {const td = await trendR.json();if (!cancelled) setTC(Array.isArray(td)?td:[]);}
      } catch {if (!cancelled) toast('Ошибка загрузки','error');}
      finally {if (!cancelled) setTimeout(() => setLoading(false),80);}
    })();
    return () => {cancelled=true;};
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view,search,genre,page,sort,filters]);

  /* ── Fetch full item details ── */
  useEffect(() => {
    if (!selItem?.id||selItem.description) return;
    let cancelled = false;
    const ep = selItem.kind==='manga' ? 'mangas' : 'animes';
    fetch(`${API}/${ep}/${selItem.id}`).then(r => r.json()).then(d => {
      if (cancelled) return;
      const desc_text = stripHtml(d.description_html??d.description??'');
      const enr = {description:d.description_html??d.description??'',desc_text,genres:d.genres??[],episodes:d.episodes??selItem.episodes,status:d.status??selItem.status};
      setSelItem(p => p ? {...p,...enr} : null);
      setDescCache(c => ({...c,[selItem.id]:enr}));
    }).catch(() => {});
    return () => {cancelled=true;};
  }, [selItem?.id]);

  /* ── Actions ── */
  const openItem = useCallback((item) => {
    setSelItem(item);
    setHistD(p => [{...item,viewDate:new Date().toLocaleString('ru'),ts:Date.now()},...p.filter(h => h.id!==item.id)].slice(0,120));
    if (isAuth) addXP(2,`view_${item.id}`);
  }, [isAuth,addXP]);

  const handleStatus = useCallback((item,status) => {
    if (!isAuth) {setAuthOpen(true);return;}
    setLibrary(p => {
      const was = p[item.id]?.status;
      addXP(status==='completed'&&was!=='completed'?25:10,`lib_${item.id}_${status}`);
      return {...p,[item.id]:{...item,status,addedDate:new Date().toISOString(),genres:item.genres??[]}};
    });
    toast({watching:'👁 Смотрю',planned:'⏳ В планах',completed:'✅ Завершено'}[status]);
  }, [isAuth,addXP,toast]);

  const handleRate = useCallback((item,score) => {
    if (!isAuth) {setAuthOpen(true);return;}
    setRatings(p => ({...p,[item.id]:score}));
    addXP(5,`rate_${item.id}`);
    toast(`Оценка ${score}/10 ★`);
  }, [isAuth,addXP,toast]);

  const handleFav = useCallback((item) => {
    if (!isAuth) {setAuthOpen(true);return;}
    setFavs(p => {
      const has = p.some(f => f.id===item.id);
      toast(has?'Убрано из избранного':'♥ В избранное',has?'info':'success');
      if (!has) addXP(5,`fav_${item.id}`);
      return has ? p.filter(f => f.id!==item.id) : [...p,{...item,favDate:new Date().toISOString()}];
    });
  }, [isAuth,addXP,toast]);

  const handleWL = useCallback((item) => {
    if (!isAuth) {setAuthOpen(true);return;}
    setWl(p => {
      const has = p.some(w => w.id===item.id);
      toast(has?'Убрано из списка':'+ В список',has?'info':'success');
      if (!has) addXP(3,`wl_${item.id}`);
      return has ? p.filter(w => w.id!==item.id) : [...p,{...item,wlDate:new Date().toISOString()}];
    });
  }, [isAuth,addXP,toast]);

  const handleNote  = useCallback((id,text) => {if (!isAuth) return;setNotes(p => ({...p,[id]:{text,date:new Date().toISOString()}}));addXP(2,`note_${id}`);}, [isAuth,addXP]);
  const handleShare = useCallback((item) => {
    const url = `https://shikimori.one${item.url||''}`;
    if (navigator.share) navigator.share({title:item.russian||item.name,url}).catch(()=>{});
    else navigator.clipboard?.writeText(url).then(() => toast('Ссылка скопирована 📋')).catch(() => toast('Ошибка копирования','error'));
    if (isAuth) {setShareCount(x => x+1);addXP(2,`share_${item.id}`);}
  }, [isAuth,addXP,toast]);

  const handleAvatar = useCallback((e) => {
    const f = e.target.files?.[0]; if (!f) return;
    if (f.size>5e6) {toast('Файл слишком большой!','error');return;}
    const r = new FileReader();
    r.onloadend = () => {setUser(p => ({...p,avatar:r.result}));toast('Аватар обновлён! 🖼');};
    r.readAsDataURL(f);
  }, [toast]);

  const handleSearch = useCallback((v) => {
    setSearch(v); setPage(1);
    if (v.trim()&&isAuth) setSearchHist(p => [v,...p.filter(s => s!==v)].slice(0,20));
  }, [isAuth]);

  const randomAnime = useCallback(() => {
    const pool = content.length ? content : trendCache;
    if (!pool.length) {toast('Список пуст','info');return;}
    openItem(pool[Math.floor(Math.random()*pool.length)]);
    toast('🎲 Случайное аниме!');
  }, [content,trendCache,openItem,toast]);

  const doExport = useCallback(() => {
    if (!isAuth) {toast('Войдите!','warning');return;}
    const blob = new Blob([JSON.stringify({user,library,history:histD,ratings,achs,favs,notes,wl,theme:curTheme})],{type:'application/json'});
    const a = Object.assign(document.createElement('a'),{href:URL.createObjectURL(blob),download:`anihub-export-${Date.now()}.json`});
    a.click(); URL.revokeObjectURL(a.href); toast('Экспортировано 💾');
  }, [isAuth,user,library,histD,ratings,achs,favs,notes,wl,curTheme,toast]);

  const doImport = useCallback((e) => {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader();
    r.onload = ev => {
      try {
        const d = JSON.parse(ev.target.result);
        if (d.user)    setUser(d.user);
        if (d.library) setLibrary(d.library);
        if (d.history) setHistD(d.history);
        if (d.ratings) setRatings(d.ratings);
        if (d.achs)    setAchs(d.achs);
        if (d.favs)    setFavs(d.favs);
        if (d.notes)   setNotes(d.notes);
        if (d.wl)      setWl(d.wl);
        if (d.theme)   setCurTheme(d.theme);
        toast('Импортировано ✅');
      } catch {toast('Ошибка импорта','error');}
    };
    r.readAsText(f);
  }, [toast]);

  /* ── Display data ── */
  const displayData = useMemo(() => {
    const m = {library:Object.values(library),history:histD,trending:trendCache,favs,watchlist:wl};
    return m[view] ?? content;
  }, [view,library,histD,trendCache,favs,wl,content]);

  const favIds    = useMemo(() => new Set(favs.map(f => f.id)), [favs]);
  const wlIds     = useMemo(() => new Set(wl.map(w => w.id)), [wl]);
  const hasFilters = filters.year||filters.scoreMin>0||filters.kind||filters.status;
  const viewTitle  = {history:'⏱ История',library:'◈ Библиотека',manga:'📖 Манга',favs:'♥ Избранное',watchlist:'◎ Список',stats:'📊 Статистика'};
  const gridCols   = typeof window!=='undefined' ? Math.max(Math.floor((window.innerWidth-248)/145),3) : 5;

  const dpProps = useMemo(() => ({
    lib:library,ratings,notes,favs:favIds,wl:wlIds,themeP:theme.p,themeS:theme.s,isAuth,
    onStatus:handleStatus,onRate:handleRate,onNote:handleNote,onFav:handleFav,onWL:handleWL,onShare:handleShare,
  }), [library,ratings,notes,favIds,wlIds,theme.p,theme.s,isAuth,handleStatus,handleRate,handleNote,handleFav,handleWL,handleShare]);

  /* ══════════════════ SETUP ══════════════════ */
  if (!sbCfg) return <SetupScreen onSave={cfg => setSbCfg(cfg)}/>;

  /* ══════════════════ BOOT ══════════════════ */
  if (boot) return (
    <div style={{position:'fixed',inset:0,background:theme.b,display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:24,fontFamily:'Outfit,system-ui,sans-serif'}}>
      <div style={{position:'relative',width:96,height:96}}>
        <div style={{position:'absolute',inset:0,borderRadius:28,background:`conic-gradient(${theme.p},${theme.s},#a855f7,${theme.p})`,animation:'spin 1.8s linear infinite'}}/>
        <div style={{position:'absolute',inset:4,borderRadius:24,background:theme.b,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <span style={{fontSize:38,fontWeight:900,color:'white'}}>A</span>
        </div>
      </div>
      <div style={{textAlign:'center'}}>
        <p style={{fontSize:36,fontWeight:900,background:`linear-gradient(135deg,${theme.p},#a855f7,${theme.s})`,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',margin:'0 0 6px'}}>AniHub</p>
        <p style={{fontSize:12,color:'rgba(255,255,255,.28)',fontWeight:600}}>Premium · Supabase Edition</p>
      </div>
      <div style={{display:'flex',gap:8}}>
        {[0,1,2,3,4].map(i => <div key={i} style={{width:7,height:7,borderRadius:'50%',background:theme.p,animation:`float .85s ${i*.12}s ease-in-out infinite`}}/>)}
      </div>
    </div>
  );

  /* ══════════════════ MAIN RENDER ══════════════════ */
  return (
    <div style={{minHeight:'100dvh',background:theme.b,color:'white',overflowX:'hidden',position:'relative'}}>
      <div className="noise-layer"/>
      {/* Mouse glow */}
      <div style={{position:'fixed',width:520,height:520,borderRadius:'50%',background:`radial-gradient(circle,${theme.p}0d 0%,transparent 70%)`,left:mousePos.x,top:mousePos.y,transform:'translate(-50%,-50%)',pointerEvents:'none',zIndex:0,transition:'left .08s,top .08s'}}/>

      <Toasts items={toasts}/>

      {/* Achievement popup */}
      {achPop && (
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
      {mSearch    && <SearchOverlay onClose={() => setMSearch(false)} themeP={theme.p} themeS={theme.s} onOpen={openItem} history={searchHist} onClearHist={() => setSearchHist([])}/>}
      {spotlight  && <Spotlight onClose={() => setSpotlight(false)} themeP={theme.p} themeS={theme.s} onOpen={openItem} history={searchHist} onClearHist={() => setSearchHist([])}/>}
      {filterOpen && <FilterPanel filters={filters} onChange={setFilters} themeP={theme.p} themeS={theme.s} onClose={() => setFilterOpen(false)}/>}

      {/* CINEMATIC PLAYER */}
      {selItem && <ItemModal item={selItem} onClose={() => setSelItem(null)} {...dpProps}/>}

      {profOpen && isAuth && (
        <ProfileSheet user={user} stats={stats} achs={achs} themeP={theme.p} themeS={theme.s} syncSt={syncSt} curTheme={curTheme} darkMode={darkMode} dailyGoal={dailyGoal} sbCfg={sbCfg}
          onClose={() => setProfOpen(false)} onSave={save} onLogout={() => {setProfOpen(false);setLogoutDlg(true);}}
          onExport={doExport} onImport={doImport} onAvatar={handleAvatar}
          onUser={d => setUser(p => ({...p,...d}))} onTheme={setCurTheme} onDark={setDarkMode} onDGoal={setDailyGoal}
          onResetCfg={() => {saveCfg(null);setSbCfg(null);}}
          fileRef={fileRef}/>
      )}

      {/* Auth modal */}
      {authOpen && (
        <div className="fi" style={{position:'fixed',inset:0,zIndex:9500,display:'flex',flexDirection:'column',justifyContent:'flex-end'}}>
          <div style={{position:'absolute',inset:0,background:'rgba(0,0,0,.82)',backdropFilter:'blur(18px)'}} onClick={() => setAuthOpen(false)}/>
          <div className="glass-dark su prof-sheet" style={{position:'relative',borderRadius:'26px 26px 0 0',padding:'20px 20px 38px',boxShadow:'0 -24px 70px rgba(0,0,0,.75)'}}>
            <div style={{display:'flex',justifyContent:'center',marginBottom:10}}><div style={{width:32,height:4,borderRadius:99,background:'rgba(255,255,255,.2)'}}/></div>
            <div style={{display:'flex',alignItems:'center',gap:13,marginBottom:22}}>
              <div style={{width:48,height:48,borderRadius:14,background:`linear-gradient(135deg,${theme.p},${theme.s})`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,boxShadow:`0 8px 22px ${theme.p}44`,flexShrink:0}}>🔐</div>
              <div>
                <p style={{fontSize:18,fontWeight:900,color:'white',marginBottom:2}}>Вход / Регистрация</p>
                <p style={{fontSize:12,opacity:.35}}>Email или код подтверждения</p>
              </div>
              <button onClick={() => setAuthOpen(false)} style={{marginLeft:'auto',width:30,height:30,borderRadius:10,border:'none',background:'rgba(255,255,255,.08)',color:'rgba(255,255,255,.5)',cursor:'pointer',fontSize:14,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'inherit'}}>✕</button>
            </div>
            <AuthForm sb={sb} themeP={theme.p} themeS={theme.s} onSuccess={onAuthSuccess} onClose={() => setAuthOpen(false)}/>
          </div>
        </div>
      )}

      {/* Logout confirm */}
      {logoutDlg && (
        <div className="fi" style={{position:'fixed',inset:0,zIndex:9600,display:'flex',alignItems:'center',justifyContent:'center',padding:'0 20px',background:'rgba(0,0,0,.88)',backdropFilter:'blur(18px)'}}>
          <div className="glass-dark si" style={{borderRadius:24,padding:'28px 24px',textAlign:'center',maxWidth:300,width:'100%'}}>
            <div style={{width:56,height:56,borderRadius:18,margin:'0 auto 14px',background:'rgba(239,68,68,.12)',border:'1px solid rgba(239,68,68,.3)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:24}}>🚪</div>
            <p style={{fontSize:18,fontWeight:900,marginBottom:7}}>Выйти?</p>
            <p style={{fontSize:12,opacity:.35,marginBottom:22}}>Все данные сохранены в Supabase.</p>
            <div style={{display:'flex',gap:10}}>
              <button onClick={() => setLogoutDlg(false)} className="btn-ghost" style={{flex:1,padding:12,borderRadius:13,fontSize:13}}>Отмена</button>
              <button onClick={doLogout} className="btn-primary" style={{flex:1,padding:12,borderRadius:13,fontSize:13,background:'linear-gradient(135deg,#ef4444,#dc2626)',boxShadow:'0 8px 22px rgba(239,68,68,.4)'}}>Выйти</button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════ HEADER ════════════════ */}
      <header style={{position:'sticky',top:0,zIndex:700,background:`${theme.b}ee`,backdropFilter:'blur(24px) saturate(200%)',borderBottom:'1px solid rgba(255,255,255,.07)'}}>
        <div style={{maxWidth:1700,margin:'0 auto',padding:'0 16px',height:56,display:'flex',alignItems:'center',gap:10}}>
          <div onClick={() => {setView('home');setPage(1);setGenre(null);setSearch('');setFilters({year:null,scoreMin:0,kind:'',status:''});}} style={{display:'flex',alignItems:'center',gap:9,cursor:'pointer',flexShrink:0,userSelect:'none'}}
            onMouseEnter={e => e.currentTarget.querySelector('.logo-icon').style.transform='scale(1.1) rotate(-5deg)'}
            onMouseLeave={e => e.currentTarget.querySelector('.logo-icon').style.transform='scale(1) rotate(0)'}>
            <div className="logo-icon" style={{width:34,height:34,borderRadius:11,background:`linear-gradient(135deg,${theme.p},${theme.s})`,display:'flex',alignItems:'center',justifyContent:'center',boxShadow:`0 0 16px ${theme.p}55`,transition:'transform .3s cubic-bezier(.34,1.56,.64,1)',animation:'glow 3s ease infinite',flexShrink:0}}>
              <span style={{fontSize:17,fontWeight:900,color:'white'}}>A</span>
            </div>
            <span className="logo-txt" style={{fontSize:19,fontWeight:900,background:`linear-gradient(135deg,${theme.p},white)`,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>AniHub</span>
          </div>

          <nav className="d-nav" style={{gap:2,flexShrink:0}}>
            {NAV.map(v => (
              <button key={v.k} onClick={() => setView(v.k)} style={{padding:'6px 11px',borderRadius:10,border:'none',cursor:'pointer',fontFamily:'inherit',fontSize:12,fontWeight:700,transition:'all .2s',whiteSpace:'nowrap',background:view===v.k?`${theme.p}1e`:'transparent',color:view===v.k?theme.p:'rgba(255,255,255,.38)',borderBottom:view===v.k?`2px solid ${theme.p}`:'2px solid transparent'}}>
                {v.l}
              </button>
            ))}
          </nav>

          <div className="search-bar" onClick={() => {if (window.innerWidth>=1024) setSpotlight(true);else setMSearch(true);}} style={{flex:1,maxWidth:400,margin:'0 8px',cursor:'pointer',userSelect:'none'}}>
            <div style={{display:'flex',alignItems:'center',gap:9,padding:'8px 13px',borderRadius:12,background:'rgba(255,255,255,.07)',border:'1.5px solid rgba(255,255,255,.09)',transition:'all .2s'}}
              onMouseEnter={e => e.currentTarget.style.borderColor=theme.p+'55'}
              onMouseLeave={e => e.currentTarget.style.borderColor='rgba(255,255,255,.09)'}>
              <span style={{fontSize:14,opacity:.3}}>🔍</span>
              <span style={{fontSize:13,fontWeight:600,color:'rgba(255,255,255,.28)',flex:1}}>{search||'Поиск аниме…'}</span>
              <kbd className="desk" style={{fontSize:10,fontWeight:700,padding:'2px 7px',borderRadius:7,background:'rgba(255,255,255,.08)',color:'rgba(255,255,255,.28)',border:'1px solid rgba(255,255,255,.12)',flexShrink:0}}>Ctrl+K</kbd>
            </div>
          </div>

          <div style={{display:'flex',alignItems:'center',gap:7,flexShrink:0,marginLeft:'auto'}}>
            <button onClick={() => setFilterOpen(true)} style={{width:35,height:35,borderRadius:11,border:`1px solid ${hasFilters?theme.p+'55':'rgba(255,255,255,.1)'}`,background:hasFilters?`${theme.p}18`:'rgba(255,255,255,.07)',cursor:'pointer',fontSize:14,display:'flex',alignItems:'center',justifyContent:'center',transition:'all .2s',color:hasFilters?theme.p:'rgba(255,255,255,.45)',position:'relative'}}>
              ⚙
              {hasFilters && <div style={{position:'absolute',top:4,right:4,width:6,height:6,borderRadius:'50%',background:theme.p,boxShadow:`0 0 6px ${theme.p}`}}/>}
            </button>
            <button onClick={randomAnime} className="desk" style={{width:35,height:35,borderRadius:11,border:'1px solid rgba(255,255,255,.1)',background:'rgba(255,255,255,.07)',cursor:'pointer',fontSize:14,display:'flex',alignItems:'center',justifyContent:'center',transition:'all .2s',color:'rgba(255,255,255,.55)'}}
              onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,.13)'}
              onMouseLeave={e => e.currentTarget.style.background='rgba(255,255,255,.07)'}>🎲</button>

            {isAuth && (
              <div className="desk" style={{alignItems:'center',gap:5,padding:'4px 9px',borderRadius:9,background:'rgba(255,255,255,.06)',fontSize:10,fontWeight:800,color:{idle:'rgba(255,255,255,.28)',syncing:theme.p,synced:'#22c55e',error:'#ef4444'}[syncSt]}}>
                {syncSt==='syncing' ? <Spinner size={10} color={theme.p}/> : <span style={{width:6,height:6,borderRadius:'50%',background:'currentColor',display:'inline-block'}}/>}
                <span>{syncSt==='synced'?'Сохр.':syncSt==='syncing'?'Синхр.':syncSt==='error'?'Ошибка':'☁️'}</span>
              </div>
            )}

            {!isAuth ? (
              <button onClick={() => setAuthOpen(true)} className="btn-primary" style={{padding:'8px 15px',borderRadius:12,fontSize:13,boxShadow:`0 4px 16px ${theme.p}44`}}>Войти</button>
            ) : (
              <button onClick={() => setProfOpen(true)} style={{position:'relative',background:'none',border:'none',padding:0,cursor:'pointer',flexShrink:0}}>
                <img src={user.avatar} alt="" style={{width:35,height:35,borderRadius:11,objectFit:'cover',border:`2px solid ${theme.p}`,boxShadow:`0 0 12px ${theme.p}55`,display:'block',transition:'transform .2s'}}
                  onMouseEnter={e => e.target.style.transform='scale(1.1)'}
                  onMouseLeave={e => e.target.style.transform='scale(1)'}/>
                {achs.length>0 && <div style={{position:'absolute',top:-5,right:-5,width:17,height:17,borderRadius:'50%',background:`linear-gradient(135deg,${theme.p},${theme.s})`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:8,color:'white',fontWeight:900,pointerEvents:'none'}}>{achs.length}</div>}
              </button>
            )}
          </div>
        </div>

        {/* Mobile nav tabs */}
        <div className="ns m-nav" style={{overflowX:'auto',gap:5,padding:'5px 14px 8px',borderTop:'1px solid rgba(255,255,255,.06)'}}>
          {NAV.map(v => (
            <button key={v.k} onClick={() => setView(v.k)} style={{flexShrink:0,display:'flex',alignItems:'center',gap:5,padding:'6px 12px',borderRadius:20,border:'none',cursor:'pointer',fontFamily:'inherit',fontSize:12,fontWeight:800,transition:'all .2s',whiteSpace:'nowrap',background:view===v.k?`linear-gradient(135deg,${theme.p},${theme.s})`:'rgba(255,255,255,.07)',color:view===v.k?'white':'rgba(255,255,255,.38)',boxShadow:view===v.k?`0 4px 12px ${theme.p}44`:''}}>
              <span style={{fontSize:12}}>{v.i}</span><span>{v.l}</span>
            </button>
          ))}
        </div>
      </header>

      {/* Trending marquee */}
      {view==='home' && !search && page===1 && trendCache.length>0 && (
        <section style={{overflow:'hidden',marginTop:6,marginBottom:4}}>
          <div style={{maxWidth:1700,margin:'0 auto',padding:'0 16px 6px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <p style={{fontSize:12,fontWeight:900,opacity:.5}}>📈 В тренде</p>
            <button onClick={() => setView('trending')} style={{background:'none',border:'none',cursor:'pointer',color:theme.p,fontSize:12,fontWeight:800,fontFamily:'inherit',opacity:.75}}>Смотреть всё →</button>
          </div>
          <div>
            <div style={{display:'flex',gap:9,paddingLeft:16,animation:'marquee 70s linear infinite',width:'max-content'}}
              onMouseEnter={e => e.currentTarget.style.animationPlayState='paused'}
              onMouseLeave={e => e.currentTarget.style.animationPlayState='running'}>
              {[...trendCache,...trendCache].map((item,i) => (
                <div key={`m-${item.id}-${i}`} onClick={() => openItem(item)} style={{flexShrink:0,width:90,cursor:'pointer'}}>
                  <div style={{borderRadius:13,overflow:'hidden',aspectRatio:'2/3',background:'#0b1628',position:'relative',transition:'transform .3s'}}
                    onMouseEnter={e => e.currentTarget.style.transform='scale(1.08)'}
                    onMouseLeave={e => e.currentTarget.style.transform='scale(1)'}>
                    {imgSrc(item) && <img src={imgSrc(item)} alt="" loading="lazy" style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}}/>}
                    <div style={{position:'absolute',inset:0,background:'linear-gradient(to top,rgba(0,0,0,.9) 0%,transparent 55%)'}}/>
                    <div style={{position:'absolute',top:5,left:5,padding:'2px 6px',borderRadius:7,fontSize:9,fontWeight:900,color:'white',background:`${theme.p}cc`}}>#{i%trendCache.length+1}</div>
                    <div style={{position:'absolute',bottom:5,left:5,right:5}}>
                      {item.score && <span style={{fontSize:9,color:'#fbbf24',fontWeight:900}}>★{item.score}</span>}
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
            <div>
              <p style={{fontSize:9,fontWeight:900,opacity:.3,textTransform:'uppercase',letterSpacing:'.1em',marginBottom:8}}>Сортировка</p>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:5}}>
                {SORTS.map(({v,l}) => (
                  <button key={v} onClick={() => setSort(v)} style={{padding:'7px 4px',borderRadius:10,border:'none',cursor:'pointer',fontFamily:'inherit',fontSize:10,fontWeight:800,transition:'all .2s',background:sort===v?`linear-gradient(135deg,${theme.p},${theme.s})`:'rgba(255,255,255,.07)',color:sort===v?'white':'rgba(255,255,255,.38)',boxShadow:sort===v?`0 4px 12px ${theme.p}44`:''}}>{l}</button>
                ))}
              </div>
            </div>
            <div>
              <p style={{fontSize:9,fontWeight:900,opacity:.3,textTransform:'uppercase',letterSpacing:'.1em',marginBottom:8}}>Жанры</p>
              <div className="ns" style={{display:'flex',flexDirection:'column',gap:3,maxHeight:310,overflowY:'auto'}}>
                <button onClick={() => setGenre(null)} style={{padding:'7px 10px',borderRadius:10,border:`1px solid ${!genre?theme.p+'44':'transparent'}`,cursor:'pointer',fontFamily:'inherit',fontSize:11,fontWeight:800,transition:'all .2s',background:!genre?`${theme.p}18`:'rgba(255,255,255,.05)',color:!genre?theme.p:'rgba(255,255,255,.38)',textAlign:'left'}}>🧩 Все жанры</button>
                {GENRES.map(g => (
                  <button key={g.id} onClick={() => setGenre(g.id)} style={{padding:'7px 10px',borderRadius:10,border:`1px solid ${genre===g.id?theme.p+'44':'transparent'}`,cursor:'pointer',fontFamily:'inherit',fontSize:11,fontWeight:800,transition:'all .2s',background:genre===g.id?`${theme.p}18`:'rgba(255,255,255,.05)',color:genre===g.id?theme.p:'rgba(255,255,255,.38)',textAlign:'left',display:'flex',alignItems:'center',gap:7}}>
                    <span>{g.e}</span><span>{g.n}</span>
                  </button>
                ))}
              </div>
            </div>
            {isAuth && (
              <div style={{padding:12,borderRadius:14,background:`${theme.p}0d`,border:`1px solid ${theme.p}22`}}>
                <p style={{fontSize:9,fontWeight:900,opacity:.35,textTransform:'uppercase',letterSpacing:'.1em',marginBottom:8}}>Мой прогресс</p>
                <div style={{display:'flex',flexDirection:'column',gap:5}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <span style={{fontSize:11,opacity:.45,fontWeight:700}}>Ур.</span>
                    <span style={{fontSize:15,fontWeight:900,color:theme.p}}>{stats.level}</span>
                  </div>
                  <Bar value={stats.xpInLvl} max={100} grad={`linear-gradient(90deg,${theme.p},${theme.s})`} h={4}/>
                  {[['Завершено',stats.watched],['Оценено',stats.rated],['Избранное',favs.length]].map(([l,v]) => (
                    <div key={l} style={{display:'flex',justifyContent:'space-between'}}>
                      <span style={{fontSize:10,opacity:.35,fontWeight:700}}>{l}</span>
                      <span style={{fontSize:11,fontWeight:900,color:'white'}}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <button onClick={() => {setGenre(null);setSort('popularity');setFilters({year:null,scoreMin:0,kind:'',status:''}); }} style={{padding:6,borderRadius:10,border:'none',background:'transparent',color:'rgba(255,255,255,.2)',cursor:'pointer',fontSize:11,fontWeight:700,fontFamily:'inherit'}}>↺ Сбросить</button>
          </div>
        </aside>

        {/* Main content */}
        <main style={{flex:1,minWidth:0}}>
          {view==='trending' && <TrendingPage themeP={theme.p} themeS={theme.s} onOpen={openItem} onFav={handleFav} favIds={favIds} cache={descCache} library={library}/>}
          {view==='stats'    && <StatsPage stats={stats} user={user} lib={library} ratings={ratings} favs={favs.length} achs={achs} themeP={theme.p} themeS={theme.s}/>}

          {view!=='trending' && view!=='stats' && (
            <>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:13,gap:8,flexWrap:'wrap'}}>
                <div>
                  <h1 style={{fontSize:20,fontWeight:900,margin:'0 0 2px'}}>{viewTitle[view]??'⊞ Каталог'}</h1>
                  <p style={{fontSize:11,fontWeight:700,color:'rgba(255,255,255,.3)',margin:0}}>
                    <span style={{color:theme.p,fontWeight:900}}>{displayData.length}</span> {view==='manga'?'манг':'аниме'}
                    {hasFilters && <span style={{color:'#f59e0b',marginLeft:8}}>· Фильтры</span>}
                  </p>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:7,flexWrap:'wrap'}}>
                  <div className="ns mob-genres" style={{display:'flex',overflowX:'auto',gap:5,maxWidth:180}}>
                    <button onClick={() => setGenre(null)} style={{flexShrink:0,padding:'5px 10px',borderRadius:99,border:`1px solid ${!genre?theme.p+'55':'rgba(255,255,255,.1)'}`,background:!genre?`${theme.p}18`:'rgba(255,255,255,.06)',color:!genre?theme.p:'rgba(255,255,255,.38)',cursor:'pointer',fontSize:11,fontWeight:800,fontFamily:'inherit',whiteSpace:'nowrap'}}>Все</button>
                    {GENRES.slice(0,6).map(g => (
                      <button key={g.id} onClick={() => setGenre(g.id)} style={{flexShrink:0,padding:'5px 10px',borderRadius:99,border:`1px solid ${genre===g.id?theme.p+'55':'rgba(255,255,255,.1)'}`,background:genre===g.id?`${theme.p}18`:'rgba(255,255,255,.06)',color:genre===g.id?theme.p:'rgba(255,255,255,.38)',cursor:'pointer',fontSize:11,fontWeight:800,fontFamily:'inherit',whiteSpace:'nowrap'}}>{g.e}</button>
                    ))}
                  </div>
                  <div style={{display:'flex',borderRadius:11,overflow:'hidden',border:'1px solid rgba(255,255,255,.1)',flexShrink:0}}>
                    {[['grid','⊞'],['list','☰']].map(([m,i]) => (
                      <button key={m} onClick={() => setVMode(m)} style={{width:35,height:33,border:'none',cursor:'pointer',fontFamily:'inherit',fontSize:14,fontWeight:900,transition:'all .2s',background:vMode===m?`linear-gradient(135deg,${theme.p},${theme.s})`:'rgba(255,255,255,.07)',color:vMode===m?'white':'rgba(255,255,255,.38)'}}>{i}</button>
                    ))}
                  </div>
                  {['home','manga'].includes(view) && (
                    <div style={{display:'flex',alignItems:'center',borderRadius:11,overflow:'hidden',border:'1px solid rgba(255,255,255,.1)',flexShrink:0}}>
                      <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1} style={{width:33,height:33,border:'none',background:'rgba(255,255,255,.07)',color:'rgba(255,255,255,.55)',cursor:page===1?'not-allowed':'pointer',fontSize:15,fontWeight:900,opacity:page===1?.3:1}}>‹</button>
                      <span style={{width:30,textAlign:'center',fontSize:12,fontWeight:900,color:theme.p,background:'rgba(255,255,255,.04)'}}>{page}</span>
                      <button onClick={() => setPage(p => p+1)} style={{width:33,height:33,border:'none',background:'rgba(255,255,255,.07)',color:'rgba(255,255,255,.55)',cursor:'pointer',fontSize:15,fontWeight:900}}>›</button>
                    </div>
                  )}
                </div>
              </div>

              {loading ? (
                <div style={{display:vMode==='grid'?'grid':'flex',gridTemplateColumns:vMode==='grid'?'repeat(auto-fill,minmax(134px,1fr))':undefined,flexDirection:'column',gap:vMode==='grid'?10:8}} className={vMode==='grid'?'card-grid':''}>
                  {Array(vMode==='grid'?20:8).fill(0).map((_,i) => vMode==='grid' ? <SkeletonCard key={i}/> : <div key={i} style={{height:80,borderRadius:14,background:'#0b1628',position:'relative',overflow:'hidden'}}><div className="shimmer" style={{position:'absolute',inset:0}}/></div>)}
                </div>
              ) : displayData.length===0 ? (
                <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'64px 20px',gap:14}}>
                  <span style={{fontSize:56,animation:'float 3s ease infinite'}}>📭</span>
                  <p style={{fontSize:16,fontWeight:900,opacity:.35}}>Ничего не найдено</p>
                  {hasFilters && <button onClick={() => setFilters({year:null,scoreMin:0,kind:'',status:''})} className="btn-ghost" style={{marginTop:4,padding:'9px 18px',borderRadius:12,fontSize:13}}>Сбросить фильтры</button>}
                </div>
              ) : vMode==='grid' ? (
                <div className="card-grid stagger">
                  {displayData.map((item,idx) => (
                    <div key={`${item.id}-${idx}`} style={{animation:`fadeUp .32s ${Math.min(idx*.025,.4)}s both`}}>
                      <AnimeCard item={item} onClick={openItem} onFav={handleFav} faved={favIds.has(item.id)} status={library[item.id]?.status} userRating={ratings[item.id]} themeP={theme.p} themeS={theme.s} cache={descCache} colIdx={idx%gridCols} cols={gridCols}/>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{display:'flex',flexDirection:'column',gap:8}}>
                  {displayData.map((item,idx) => (
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

      {/* ════════════════ MOBILE BOTTOM NAV ════════════════ */}
      <nav className="bot-nav" style={{
        position:'fixed',bottom:0,left:0,right:0,zIndex:600,
        background:`${theme.b}f5`,backdropFilter:'blur(24px) saturate(200%)',
        borderTop:'1px solid rgba(255,255,255,.08)',
        paddingBottom:'env(safe-area-inset-bottom,0px)',
        display:'flex',justifyContent:'center'
      }}>
        <div style={{display:'flex',justifyContent:'center',alignItems:'center',padding:'7px 10px',width:'100%',maxWidth:'450px'}}>
          {[
            {k:'home',l:'Главная',svg:'M208,120v88a16,16,0,0,1-16,16H160a16,16,0,0,1-16-16V160H112v48a16,16,0,0,1-16,16H64a16,16,0,0,1-16-16V120a8,8,0,0,1,2.34-5.66l72-72a8,8,0,0,1,11.32,0l72,72A8,8,0,0,1,208,120Z'},
            {k:'trending',l:'Тренды',svg:'M232,128a8,8,0,0,1-8,8H203.31l-34.65,57.75a8,8,0,0,1-13.32.8L120,144.3,85.33,196A8,8,0,0,1,72,200H32a8,8,0,0,1,0-16H65.33l34.67-52a8,8,0,0,1,13.31-.8L148,167.7l34.67-57.75A8,8,0,0,1,196,104h28A8,8,0,0,1,232,128Z'},
            {k:'manga',l:'Манга',svg:'M208,32H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM160,192H96a8,8,0,0,1,0-16h64a8,8,0,0,1,0,16Zm0-32H96a8,8,0,0,1,0-16h64a8,8,0,0,1,0,16Zm0-32H96a8,8,0,0,1,0-16h64a8,8,0,0,1,0,16Z'},
            {k:'favs',l:'Изб.',svg:'M128,216a8,8,0,0,1-5.66-2.34l-80-80a56,56,0,0,1,79.2-79.16l6.46,6.46,6.46-6.46a56,56,0,0,1,79.2,79.16l-80,80A8,8,0,0,1,128,216Z'},
            {k:'library',l:'Моё',svg:'M184,32H72A16,16,0,0,0,56,48V224a8,8,0,0,0,12.24,6.78L128,193.43l59.76,37.35A8,8,0,0,0,200,224V48A16,16,0,0,0,184,32Z'},
          ].map(v => (
            <button key={v.k} onClick={() => setView(v.k)} style={{
              display:'flex',flexDirection:'column',alignItems:'center',flex:1,gap:3,
              background:view===v.k?`${theme.p}1e`:'transparent',
              color:view===v.k?theme.p:'rgba(255,255,255,.26)',
              border:'none',borderRadius:14,padding:'6px 0',transition:'all .2s'
            }}>
              <svg width="20" height="20" fill={view===v.k?theme.p:'currentColor'} viewBox="0 0 256 256">
                <path d={v.svg}/>
              </svg>
              <span style={{fontSize:9,fontWeight:800}}>{v.l}</span>
            </button>
          ))}
          {isAuth ? (
            <button onClick={() => setProfOpen(true)} style={{display:'flex',flexDirection:'column',alignItems:'center',flex:1,gap:3,background:'transparent',border:'none',padding:'6px 0',cursor:'pointer'}}>
              <img src={user.avatar} style={{width:20,height:20,borderRadius:6,objectFit:'cover',border:`1.5px solid ${theme.p}`,display:'block'}} alt=""/>
              <span style={{fontSize:9,fontWeight:800,color:'rgba(255,255,255,.26)'}}>Профиль</span>
            </button>
          ) : (
            <button onClick={() => setAuthOpen(true)} style={{
              display:'flex',flexDirection:'column',alignItems:'center',flex:1,gap:3,
              background:`${theme.p}1e`,color:theme.p,border:'none',borderRadius:14,padding:'6px 0',cursor:'pointer'
            }}>
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
                <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm48-88a8,8,0,0,1-8,8H136v32a8,8,0,0,1-16,0V136H88a8,8,0,0,1,0-16h32V88a8,8,0,0,1,16,0v32h32A8,8,0,0,1,176,128Z"/>
              </svg>
              <span style={{fontSize:9,fontWeight:800}}>Войти</span>
            </button>
          )}
        </div>
      </nav>

      {/* Footer */}
      <footer className="desk" style={{borderTop:'1px solid rgba(255,255,255,.06)',padding:'24px 18px',flexDirection:'column',gap:4,marginTop:16,textAlign:'center',position:'relative',zIndex:2}}>
        <p style={{fontSize:16,fontWeight:900,background:`linear-gradient(135deg,${theme.p},white)`,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>AniHub</p>
        <p style={{fontSize:11,color:'rgba(255,255,255,.16)'}}>© 2026 · Supabase Edition · Powered by Shikimori</p>
      </footer>
    </div>
  );
}