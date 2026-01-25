import React, { useState, useEffect, useMemo } from 'react';

// --- КОНСТАНТЫ ---
const API = 'https://shikimori.one/api';
const ASSETS = 'https://shikimori.one';

const GENRES = [
  { id: 1, name: 'Сёнен', icon: '🔥' }, { id: 4, name: 'Комедия', icon: '😂' },
  { id: 10, name: 'Фэнтези', icon: '🧙' }, { id: 2, name: 'Приключения', icon: '🗺️' },
  { id: 8, name: 'Драма', icon: '😢' }, { id: 14, name: 'Хоррор', icon: '👻' },
  { id: 7, name: 'Мистика', icon: '🔮' }, { id: 24, name: 'Фантастика', icon: '🚀' },
  { id: 37, name: 'Сверхъестественное', icon: '✨' }, { id: 22, name: 'Романтика', icon: '❤️' }
];

const App = () => {
  const [view, setView] = useState('home'); 
  const [content, setContent] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- LOCAL STORAGE BILAN BOG'LANGAN STATE-LAR ---
  
  // Dark Mode holatini xotiradan olish
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('aniHub_theme_v3');
    return savedTheme ? JSON.parse(savedTheme) : true;
  });

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeGenre, setActiveGenre] = useState(null);
  const [page, setPage] = useState(1);

  const [library, setLibrary] = useState(() => {
    const saved = localStorage.getItem('aniHub_library_v3');
    return saved ? JSON.parse(saved) : {}; 
  });

  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('aniHub_history_v3');
    return saved ? JSON.parse(saved) : []; 
  });

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('aniHub_user_v3');
    return saved ? JSON.parse(saved) : { 
      name: 'ShizoFan', 
      avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Shizo',
      bio: 'Аниме — это жизнь'
    };
  });

  // Ma'lumotlarni xotiraga yozish (isDarkMode ham qo'shildi)
  useEffect(() => {
    localStorage.setItem('aniHub_library_v3', JSON.stringify(library));
    localStorage.setItem('aniHub_history_v3', JSON.stringify(history));
    localStorage.setItem('aniHub_user_v3', JSON.stringify(user));
    localStorage.setItem('aniHub_theme_v3', JSON.stringify(isDarkMode));
  }, [library, history, user, isDarkMode]);

  // --- ФУНКЦИИ (O'zgarmadi) ---
  const updateStatus = (item, status) => {
    setLibrary(prev => ({
      ...prev,
      [item.id]: { 
        id: item.id, 
        status, 
        name: item.russian || item.name, 
        image: item.image?.original || item.image,
        score: item.score,
        kind: item.kind
      }
    }));
  };

  const addToHistory = (item) => {
    const newItem = { 
      id: item.id, 
      name: item.russian || item.name, 
      image: item.image?.original || item.image,
      date: new Date().toLocaleString('ru-RU'),
      type: view === 'manga' ? 'Манга' : 'Аниме'
    };
    setHistory(prev => [newItem, ...prev.filter(h => h.id !== item.id)].slice(0, 30));
  };

  const removeFromHistory = (id) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      let endpoint = view === 'manga' ? 'mangas' : 'animes';
      let url = `${API}/${endpoint}?limit=50&page=${page}&order=popularity`;
      
      if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;
      if (activeGenre) url += `&genre=${activeGenre}`;
      if (view === 'top') url += `&order=ranked`;

      const res = await fetch(url);
      const data = await res.json();
      setContent(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Ошибка:", err);
      setContent([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 400);
    return () => clearTimeout(timer);
  }, [view, searchQuery, activeGenre, page]);

  if (loading && content.length === 0) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#050505]">
        <div className="relative">
          <div className="w-24 h-24 border-4 border-green-500/20 rounded-full"></div>
          <div className="w-24 h-24 border-t-4 border-green-500 rounded-full animate-spin absolute top-0 left-0"></div>
        </div>
        <h2 className="text-green-500 font-black italic mt-6 tracking-[0.5em] animate-pulse">ANIHUB</h2>
      </div>
    );
  }

  return (
    <div className={`min-h-screen font-sans transition-colors duration-700 ${isDarkMode ? 'bg-[#050505] text-white' : 'bg-[#f8fafc] text-slate-900'}`}>
      
      {/* ДИНАМИЧЕСКИЙ ФОН */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className={`absolute inset-0 transition-opacity duration-1000 ${isDarkMode ? 'opacity-[0.15]' : 'opacity-[0.05]'}`}>
             <img src="https://images.alphacoders.com/132/1323334.png" className="w-full h-full object-cover blur-md scale-110" alt="" />
          </div>
          <div className={`absolute inset-0 ${isDarkMode ? 'bg-gradient-to-b from-transparent via-[#050505] to-[#050505]' : 'bg-gradient-to-b from-white/50 to-white'}`}></div>
      </div>

  {/* ХЕДЕР */}
<header className={`sticky top-0 z-[100] backdrop-blur-3xl border-b transition-all ${isDarkMode ? 'bg-black/60 border-white/5' : 'bg-white/70 border-slate-200'}`}>
  <div className="max-w-[1800px] mx-auto p-4 md:px-8 flex flex-col gap-4"> 
    
    <div className="flex items-center justify-between gap-6">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => {setView('home'); setActiveGenre(null); setPage(1)}}>
          <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center font-black text-black text-2xl shadow-[0_0_30px_rgba(34,197,94,0.5)] group-hover:rotate-[360deg] transition-transform duration-700">A</div>
          <h1 className="text-2xl font-black uppercase italic tracking-tighter hidden xl:block">Ani<span className="text-green-500 underline decoration-2 underline-offset-4">Hub</span></h1>
        </div>

        <a href="https://t.me/Sh1zoK1ll" target="_blank" rel="noreferrer" 
           className="hidden md:flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 px-5 py-2.5 rounded-2xl text-[10px] font-black tracking-widest transition-all">
          <span className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></span>
          РАЗРАБОТАНО SHIZO
        </a>
      </div>

      <div className="flex-1 max-w-xl hidden lg:block">
        <div className="relative group">
          <i className="fas fa-search absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-green-500 transition-colors"></i>
          <input 
            type="text" 
            placeholder="Поиск по вселенной аниме..." 
            className={`w-full pl-14 pr-6 py-3.5 rounded-2xl outline-none border-2 transition-all ${isDarkMode ? 'bg-white/5 border-transparent focus:border-green-500/30 focus:bg-white/10' : 'bg-slate-100 border-transparent focus:border-green-500/30 focus:bg-white'}`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button 
          onClick={() => setIsDarkMode(!isDarkMode)} 
          className={`w-12 h-12 rounded-2xl border flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-lg ${isDarkMode ? 'bg-white/10 border-white/10 text-yellow-500 shadow-yellow-500/10' : 'bg-slate-800 border-slate-700 text-indigo-400 shadow-indigo-500/20'}`}
          title={isDarkMode ? "Svetni yoqish" : "Svetni o'chirish"}
        >
          <i className={`fas ${isDarkMode ? 'fa-sun' : 'fa-moon'} text-xl`}></i>
        </button>

        <div onClick={() => setIsProfileModalOpen(true)} className="flex items-center gap-3 cursor-pointer bg-green-500/10 p-1 pr-4 rounded-2xl border border-green-500/20 hover:bg-green-500/20 transition-all">
          <img src={user.avatar} className="w-10 h-10 rounded-xl object-cover border-2 border-green-500 shadow-lg shadow-green-500/20" alt="" />
          <span className="font-black text-xs hidden sm:block truncate max-w-[100px] uppercase italic">{user.name}</span>
        </div>
      </div>
    </div>

    <div className="block lg:hidden w-full pb-2">
      <div className="relative">
        <i className="fas fa-search absolute left-5 top-1/2 -translate-y-1/2 text-gray-500"></i>
        <input 
          type="text" 
          placeholder="Поиск аниме..." 
          className={`w-full pl-12 pr-4 py-3 rounded-xl outline-none border-2 transition-all ${isDarkMode ? 'bg-white/5 border-white/5 focus:border-green-500/30' : 'bg-slate-100 border-slate-200 focus:border-green-500/30'}`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
    </div>

  </div>
</header>

      <div className="relative z-10 max-w-[1800px] mx-auto p-4 md:p-8 flex flex-col lg:flex-row gap-8">
        
        {/* САЙДБАР */}
        <aside className="w-full lg:w-80 shrink-0 space-y-6">
          <div className={`p-4 rounded-[32px] border ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-white border-slate-200 shadow-xl'}`}>
            <p className="text-[10px] font-black uppercase text-gray-500 tracking-[0.3em] mb-4 ml-4">Вселенная</p>
            <nav className="flex flex-col gap-1">
              {[
                { id: 'home', n: 'Сериалы', i: 'fa-play' },
                { id: 'manga', n: 'Манга / Новеллы', i: 'fa-book-open' },
                { id: 'top', n: 'Рейтинг Топ', i: 'fa-crown' },
                { id: 'library', n: 'Моя Полка', i: 'fa-bookmark' },
                { id: 'history', n: 'История', i: 'fa-history' }
              ].map(nav => (
                <button 
                  key={nav.id} 
                  onClick={() => {setView(nav.id); setActiveGenre(null); setPage(1)}} 
                  className={`flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-500 ${view === nav.id ? 'bg-green-500 text-black shadow-[0_15px_30px_rgba(34,197,94,0.3)] translate-x-2' : 'hover:bg-white/5 opacity-60 hover:opacity-100'}`}>
                  <i className={`fas ${nav.i} w-5`}></i> {nav.n}
                </button>
              ))}
            </nav>
          </div>

          <div className={`p-6 rounded-[32px] border ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-white border-slate-200'}`}>
            <p className="text-[10px] font-black uppercase text-green-500 tracking-[0.3em] mb-6">Жанры</p>
            <div className="grid grid-cols-2 gap-2">
              {GENRES.map(g => (
                <button 
                  key={g.id} 
                  onClick={() => {setActiveGenre(g.id); setView('home'); setPage(1)}}
                  className={`px-3 py-3 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-2 border ${activeGenre === g.id ? 'bg-green-500 border-green-500 text-black' : 'bg-white/5 border-transparent hover:border-green-500/50'}`}>
                  <span>{g.icon}</span> <span className="truncate">{g.name}</span>
                </button>
              ))}
            </div>
            {activeGenre && (
              <button onClick={() => setActiveGenre(null)} className="w-full mt-4 py-3 bg-red-500/10 text-red-500 rounded-xl text-[10px] font-black uppercase hover:bg-red-500 hover:text-white transition-all">Сбросить</button>
            )}
          </div>
        </aside>

        {/* КОНТЕНТ */}
        <main className="flex-1">
          <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <h2 className="text-6xl font-black italic uppercase tracking-tighter leading-none">
                {view === 'home' && (activeGenre ? `Жанр: ${GENRES.find(g => g.id === activeGenre)?.name}` : 'Популярное')}
                {view === 'manga' && 'Манга'}
                {view === 'top' && 'Легенды'}
                {view === 'library' && 'Полка'}
                {view === 'history' && 'История'}
              </h2>
              <div className="flex items-center gap-3">
                 <div className="h-2 w-32 bg-green-500 rounded-full shadow-[0_0_20px_rgba(34,197,94,0.5)]"></div>
                 <span className="text-[10px] font-black uppercase opacity-40 italic">Найдено: {content.length} ед.</span>
              </div>
            </div>
          </div>

          {/* СИСТЕМА СЕТКИ */}
          {view === 'library' ? (
            <div className="space-y-16">
               {['watching', 'planned', 'completed', 'dropped'].map(cat => {
                 const items = Object.values(library).filter(i => i.status === cat);
                 if (items.length === 0) return null;
                 return (
                   <div key={cat} className="animate-in slide-in-from-bottom-10 duration-700">
                     <h3 className="text-xl font-black uppercase italic mb-8 flex items-center gap-4">
                        <span className="w-2 h-8 bg-green-500 rounded-full"></span>
                        {cat === 'watching' ? 'Смотрю' : cat === 'planned' ? 'В планах' : cat === 'completed' ? 'Завершено' : 'Брошено'}
                        <span className="text-green-500/40 text-sm font-normal">/ {items.length}</span>
                     </h3>
                     <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                        {items.map(item => (
                          <div key={item.id} onClick={() => setSelectedItem(item)} className="group cursor-pointer">
                             <div className="relative aspect-[3/4.2] rounded-[24px] overflow-hidden border-2 border-white/5 group-hover:border-green-500 transition-all duration-500 group-hover:shadow-[0_0_40px_rgba(34,197,94,0.2)]">
                                <img src={ASSETS + item.image} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700" alt="" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                             </div>
                             <h4 className="mt-4 font-black text-[11px] uppercase italic truncate group-hover:text-green-500 transition-colors px-2">{item.name}</h4>
                          </div>
                        ))}
                     </div>
                   </div>
                 )
               })}
            </div>
          ) : view === 'history' ? (
            <div className="grid gap-4 max-w-4xl">
               {history.map((h, i) => (
                 <div key={i} className="group flex items-center gap-6 p-4 rounded-[24px] border border-white/5 bg-white/5 hover:bg-white/10 transition-all">
                    <img src={ASSETS + h.image} className="w-16 h-20 shrink-0 rounded-xl object-cover shadow-xl" alt="" />
                    <div className="flex-1">
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md mb-2 inline-block ${h.type === 'Манга' ? 'bg-orange-500 text-black' : 'bg-blue-500 text-white'}`}>{h.type}</span>
                        <h3 className="text-lg font-black italic line-clamp-1 uppercase">{h.name}</h3>
                        <p className="text-[10px] opacity-40 font-bold uppercase">{h.date}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setSelectedItem(h)} className="w-12 h-12 bg-green-500 text-black rounded-xl flex items-center justify-center hover:scale-110 transition-all"><i className="fas fa-play"></i></button>
                      <button onClick={() => removeFromHistory(h.id)} className="w-12 h-12 bg-white/5 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"><i className="fas fa-trash"></i></button>
                    </div>
                 </div>
               ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 md:gap-8">
              {content.map((item, index) => (
                <div 
                  key={item.id} 
                  onClick={() => {setSelectedItem(item); addToHistory(item)}}
                  className="group cursor-pointer relative animate-in fade-in zoom-in duration-500"
                  style={{ animationDelay: `${(index % 15) * 50}ms` }}
                >
                  <div className={`relative aspect-[3/4.5] rounded-[28px] overflow-hidden border-2 transition-all duration-700 group-hover:-translate-y-4 ${isDarkMode ? 'border-white/5 group-hover:border-green-500 group-hover:shadow-[0_20px_60px_rgba(0,0,0,0.8)]' : 'border-slate-200'}`}>
                    <img src={ASSETS + item.image.original} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt="" />
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-90 group-hover:opacity-100" />
                    
                    <div className="absolute top-4 left-4">
                       <div className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 flex items-center gap-2">
                          <i className="fas fa-star text-yellow-500 text-[10px]"></i>
                          <span className="text-white text-[10px] font-black">{item.score}</span>
                       </div>
                    </div>

                    <div className="absolute bottom-6 left-6 right-6">
                       <p className="text-green-500 text-[9px] font-black uppercase tracking-[0.2em] mb-1">{item.kind}</p>
                       <h3 className="text-white font-black text-sm md:text-md leading-tight uppercase italic line-clamp-2 group-hover:text-green-400 transition-colors">
                         {item.russian || item.name}
                       </h3>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ПАГИНАЦИЯ */}
          {['home', 'manga', 'top'].includes(view) && (
            <div className="mt-20 flex items-center justify-center gap-4">
               <button 
                 disabled={page === 1}
                 onClick={() => {setPage(p => p - 1); window.scrollTo(0,0)}}
                 className="px-8 py-4 bg-white/5 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-green-500 hover:text-black disabled:opacity-20 transition-all border border-white/5">
                 Назад
               </button>
               <span className="w-14 h-14 bg-green-500 text-black flex items-center justify-center rounded-2xl font-black italic">{page}</span>
               <button 
                 onClick={() => {setPage(p => p + 1); window.scrollTo(0,0)}}
                 className="px-8 py-4 bg-white/5 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-green-500 hover:text-black transition-all border border-white/5">
                 Вперед
               </button>
            </div>
          )}
        </main>
      </div>

      {/* ФУТЕР */}
      <footer className="mt-32 py-16 border-t border-white/5 bg-white/[0.02]">
        <div className="max-w-[1800px] mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-10">
           <div className="space-y-4 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3">
                 <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center font-black text-black">A</div>
                 <h2 className="font-black uppercase italic text-xl">AniHub</h2>
              </div>
              <p className="text-[10px] font-bold uppercase opacity-30 tracking-[0.4em]">Твой идеальный проводник в мире аниме</p>
           </div>
           
           <div className="flex gap-12">
              {['Discord', 'Telegram', 'Github', 'Twitter'].map(social => (
                <a key={social} href="#" className="text-[10px] font-black uppercase tracking-widest hover:text-green-500 transition-colors opacity-50 hover:opacity-100">{social}</a>
              ))}
           </div>
           
           <p className="text-[10px] font-black opacity-20 uppercase tracking-widest">© 2026 Crafted by ShizoKill</p>
        </div>
      </footer>

      {/* --- МОДАЛКА ПЛЕЕРА --- */}
      {selectedItem && (
        <div className="fixed inset-0 z-[1000] bg-black overflow-y-auto animate-in fade-in duration-500">
          <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
             <img src={ASSETS + (selectedItem.image?.original || selectedItem.image)} className="w-full h-full object-cover blur-[120px]" alt="" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto p-4 md:p-12">
            <button onClick={() => setSelectedItem(null)} className="group mb-12 flex items-center gap-4 px-8 py-4 bg-white/5 hover:bg-green-500 rounded-full transition-all border border-white/10 hover:text-black">
               <i className="fas fa-arrow-left group-hover:-translate-x-2 transition-transform"></i>
               <span className="font-black uppercase text-xs tracking-widest">Вернуться во Вселенную</span>
            </button>

            <div className="grid lg:grid-cols-[1fr_420px] gap-12">
               <div className="space-y-8">
                  {view === 'manga' ? (
                    <div className="bg-white/5 rounded-[48px] p-8 md:p-16 border border-white/10 backdrop-blur-3xl text-center">
                       <img src={ASSETS + (selectedItem.image?.original || selectedItem.image)} className="w-64 mx-auto rounded-[32px] shadow-2xl border-4 border-green-500 mb-10" alt="" />
                       <h2 className="text-5xl font-black italic uppercase tracking-tighter mb-6 leading-tight">{selectedItem.russian || selectedItem.name}</h2>
                       <div className="flex flex-wrap justify-center gap-3 mb-10">
                          <span className="px-6 py-3 bg-white/5 rounded-2xl text-[10px] font-black uppercase border border-white/5">Томов: {selectedItem.volumes || '??'}</span>
                          <span className="px-6 py-3 bg-white/5 rounded-2xl text-[10px] font-black uppercase border border-white/5">Глав: {selectedItem.chapters || '??'}</span>
                          <span className="px-6 py-3 bg-green-500/20 text-green-500 rounded-2xl text-[10px] font-black uppercase border border-green-500/20">{selectedItem.status}</span>
                       </div>
                       <a href={`https://shikimori.one${selectedItem.url || ''}`} target="_blank" rel="noreferrer" 
                          className="inline-block bg-white text-black px-12 py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-green-500 hover:scale-110 transition-all">
                          Читать на Shikimori
                       </a>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      <div className="aspect-video bg-black rounded-[40px] overflow-hidden border-4 border-white/5 shadow-2xl relative group">
                        <iframe className="w-full h-full" src={`https://kodik.info/find-player?shikimoriID=${selectedItem.id}&hide_ad=1&color=%2322c55e`} allowFullScreen></iframe>
                      </div>
                      <div className="bg-white/5 backdrop-blur-3xl p-8 rounded-[32px] border border-white/10 flex items-center justify-between">
                         <div className="flex items-center gap-6">
                            <div className="w-14 h-14 bg-green-500 rounded-2xl flex items-center justify-center text-black text-xl"><i className="fas fa-bolt"></i></div>
                            <div>
                               <h4 className="text-xl font-black italic uppercase leading-none mb-1">Ультра Стриминг</h4>
                               <p className="text-[10px] opacity-40 font-black uppercase tracking-widest">Доступно несколько источников</p>
                            </div>
                         </div>
                      </div>
                    </div>
                  )}
               </div>

               <div className="space-y-6">
                  <div className="p-8 rounded-[40px] bg-white/5 border border-white/10 backdrop-blur-3xl">
                     <p className="text-[10px] font-black uppercase text-green-500 tracking-[0.4em] mb-8">Обновить статус</p>
                     <div className="grid gap-3">
                        {[
                          { id: 'watching', n: 'Смотрю', c: 'bg-blue-600', i: 'fa-play' },
                          { id: 'planned', n: 'В планах', c: 'bg-orange-500', i: 'fa-calendar' },
                          { id: 'completed', n: 'Завершено', c: 'bg-green-500', i: 'fa-check' },
                          { id: 'dropped', n: 'Брошено', c: 'bg-red-600', i: 'fa-times' }
                        ].map(st => (
                          <button 
                            key={st.id}
                            onClick={() => updateStatus(selectedItem, st.id)}
                            className={`flex items-center justify-between px-6 py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all border-2 ${library[selectedItem.id]?.status === st.id ? `${st.c} text-white border-transparent scale-[1.05]` : 'bg-white/5 border-white/5 hover:border-white/20'}`}>
                            <span className="flex items-center gap-3"><i className={`fas ${st.i}`}></i> {st.n}</span>
                            {library[selectedItem.id]?.status === st.id && <i className="fas fa-check-circle"></i>}
                          </button>
                        ))}
                     </div>
                  </div>

                  <div className="p-8 rounded-[40px] bg-green-500 text-black">
                     <i className="fas fa-info-circle text-3xl mb-4"></i>
                     <p className="font-black italic text-lg leading-tight uppercase">
                       "Любой шедевр начинается с первой серии. Приятного просмотра!"
                     </p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* --- МОДАЛКА ПРОФИЛЯ --- */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/95 backdrop-blur-3xl" onClick={() => setIsProfileModalOpen(false)}></div>
            <div className="relative w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-[48px] p-10 text-center shadow-2xl">
              <div className="relative inline-block mb-10">
                 <img src={user.avatar} className="w-32 h-32 rounded-[32px] object-cover border-4 border-green-500 shadow-[0_0_40px_rgba(34,197,94,0.3)]" alt="" />
                 <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center text-black border-4 border-[#0a0a0a]"><i className="fas fa-pen"></i></div>
              </div>

              <div className="space-y-6 mb-10 text-left">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-green-500 ml-4 tracking-[0.3em]">Никнейм</label>
                    <input type="text" value={user.name} onChange={(e) => setUser({...user, name: e.target.value})} className="w-full bg-white/5 border border-white/10 focus:border-green-500 rounded-2xl px-6 py-4 outline-none font-black italic uppercase tracking-widest text-sm" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-green-500 ml-4 tracking-[0.3em]">Ссылка на аватар</label>
                    <input type="text" placeholder="https://..." onChange={(e) => e.target.value && setUser({...user, avatar: e.target.value})} className="w-full bg-white/5 border border-white/10 focus:border-green-500 rounded-2xl px-6 py-4 outline-none text-xs font-mono" />
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-10">
                 <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                    <p className="text-3xl font-black italic text-green-500">{Object.keys(library).length}</p>
                    <p className="text-[10px] font-black uppercase opacity-40">Тайтлов</p>
                 </div>
                 <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                    <p className="text-3xl font-black italic text-green-500">{history.length}</p>
                    <p className="text-[10px] font-black uppercase opacity-40">В истории</p>
                 </div>
              </div>

              <button onClick={() => setIsProfileModalOpen(false)} className="w-full bg-green-500 text-black py-5 rounded-2xl font-black uppercase tracking-[0.4em] text-xs hover:scale-105 transition-all shadow-xl shadow-green-500/20">
                Сохранить изменения
              </button>
            </div>
        </div>
      )}
    </div>
  );
};

export default App;