import React, { useState, useEffect, useRef } from 'react';

const API = 'https://shikimori.one/api';
const ASSETS = 'https://shikimori.one';

const GENRES = [
  { id: 1, name: 'Сёнен', icon: '🔥' }, { id: 4, name: 'Комедия', icon: '😂' },
  { id: 10, name: 'Фэнтези', icon: '🧙' }, { id: 2, name: 'Приключения', icon: '🗺️' },
  { id: 8, name: 'Драма', icon: '😢' }, { id: 7, name: 'Мистика', icon: '🔮' },
  { id: 24, name: 'Фантастика', icon: '🚀' }, { id: 22, name: 'Романтика', icon: '❤️' },
  { id: 6, name: 'Демоны', icon: '👿' }, { id: 11, name: 'Игры', icon: '🎮' }
];

const App = () => {
  const [view, setView] = useState('home');
  const [content, setContent] = useState([]);
  const [trending, setTrending] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeGenre, setActiveGenre] = useState(null);
  const [page, setPage] = useState(1);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const fileInputRef = useRef(null);

  const [isDarkMode, setIsDarkMode] = useState(() => JSON.parse(localStorage.getItem('aniHub_theme_v4')) ?? true);
  const [library, setLibrary] = useState(() => JSON.parse(localStorage.getItem('aniHub_lib_v4')) ?? {});
  const [history, setHistory] = useState(() => JSON.parse(localStorage.getItem('aniHub_hist_v4')) ?? []);
  const [ratings, setRatings] = useState(() => JSON.parse(localStorage.getItem('aniHub_ratings_v4')) ?? {});
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('aniHub_user_v4')) ?? {
    name: 'Кибер_Пользователь',
    avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Shizo',
    bio: 'Жизнь в стиле Киберпанк',
    xp: 0
  });

  useEffect(() => {
    localStorage.setItem('aniHub_lib_v4', JSON.stringify(library));
    localStorage.setItem('aniHub_hist_v4', JSON.stringify(history));
    localStorage.setItem('aniHub_user_v4', JSON.stringify(user));
    localStorage.setItem('aniHub_theme_v4', JSON.stringify(isDarkMode));
    localStorage.setItem('aniHub_ratings_v4', JSON.stringify(ratings));
  }, [library, history, user, isDarkMode, ratings]);

  useEffect(() => {
    if (history.length > 0) {
      setShowToast(true);
      const timer = setTimeout(() => setShowToast(false), 6000);
      return () => clearTimeout(timer);
    }
  }, []);

  const getImg = (item) => {
    if (!item?.image) return 'https://via.placeholder.com/225x320?text=No+Image';
    const path = item.image.original || (typeof item.image === 'string' ? item.image : '');
    return path.startsWith('http') ? path : ASSETS + path;
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const endpoint = view === 'manga' ? 'mangas' : 'animes';
      const order = view === 'top' ? 'ranked' : 'popularity';
      let url = `${API}/${endpoint}?limit=24&page=${page}&order=${order}`;
      if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;
      if (activeGenre) url += `&genre=${activeGenre}`;

      const res = await fetch(url);
      const data = await res.json();
      setContent(Array.isArray(data) ? data : []);

      if (trending.length === 0) {
        const trendRes = await fetch(`${API}/animes?limit=15&order=popularity`);
        const trendData = await trendRes.json();
        setTrending(trendData);
      }
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setTimeout(() => setLoading(false), 800);
    }
  };

  useEffect(() => {
    if (view !== 'collection' && view !== 'history' && view !== 'trending_list') fetchData();
    else setLoading(false);
  }, [view, searchQuery, activeGenre, page]);

  const handleRating = (item, score) => {
    setRatings(prev => ({ ...prev, [item.id]: score }));
    if (!library[item.id]) updateLibraryStatus(item, 'planned');
  };

  const addToHistory = (item) => {
    const newItem = { ...item, date: new Date().toLocaleString(), timestamp: Date.now() };
    setHistory(prev => [newItem, ...prev.filter(h => h.id !== item.id)].slice(0, 40));
    setUser(prev => ({ ...prev, xp: prev.xp + 5 }));
  };

  const updateLibraryStatus = (item, status) => {
    setLibrary(prev => ({ ...prev, [item.id]: { ...item, status } }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setUser({ ...user, avatar: reader.result });
      reader.readAsDataURL(file);
    }
  };

  const getStatusLabel = (id) => {
    const map = { watching: 'Смотрю', planned: 'В планах', completed: 'Завершено' };
    return library[id]?.status ? map[library[id].status] : null;
  };

  const displayContent = () => {
    if (view === 'collection') return Object.values(library);
    if (view === 'history') return history;
    if (view === 'trending_list') return trending;
    return content;
  };

  const finalContent = displayContent();

  return (
    <div className={`min-h-screen font-sans transition-all duration-700 ${isDarkMode ? 'bg-[#0a0a0f] text-white' : 'bg-gradient-to-br from-[#f0f2f5] to-[#e0e7ff] text-slate-900'}`}>
      
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scroll { 0% { transform: translateX(0); } 100% { transform: translateX(calc(-320px * 15 - 2.5rem * 15)); } }
        .animate-fade-in { animation: fadeIn 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
        .animate-infinite-scroll { display: flex; width: max-content; animation: scroll 40s linear infinite; }
        .animate-infinite-scroll:hover { animation-play-state: paused; }
        .glass { backdrop-filter: blur(20px); background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-thumb { background: linear-gradient(#ff00ff, #00ffff); border-radius: 10px; }
      `}</style>

      {/* Header */}
      <header className={`sticky top-0 z-[1000] glass border-b ${isDarkMode ? 'border-white/10' : 'border-slate-200'} backdrop-blur-2xl`}>
        <div className="max-w-[1920px] mx-auto px-4 md:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 md:gap-10 shrink-0">
            <div onClick={() => { setView('home'); setPage(1); }} className="flex items-center gap-3 cursor-pointer group">
              <div className="w-10 h-10 md:w-14 md:h-14 bg-gradient-to-br from-[#ff00ff] to-[#00ffff] rounded-xl md:rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(255,0,255,0.5)]">
                <span className="text-xl md:text-3xl font-black text-white">A</span>
              </div>
              <h1 className="text-xl md:text-3xl font-black tracking-tighter uppercase hidden sm:block">
                ANI<span className="text-[#ff00ff]">HUB</span>
              </h1>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden xl:flex gap-6">
              {['home', 'manga', 'top', 'trending_list', 'collection', 'history'].map(m => (
                <button
                  key={m}
                  onClick={() => setView(m)}
                  className={`text-xs font-black uppercase tracking-wider transition-all relative group ${view === m ? 'text-[#ff00ff]' : 'opacity-60 hover:opacity-100'}`}
                >
                  {m === 'home' ? 'Главная' : m === 'manga' ? 'Манга' : m === 'top' ? 'Топ' : m === 'trending_list' ? 'Тренды' : m === 'collection' ? 'Коллекция' : 'История'}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex-1 max-w-xl mx-2 md:mx-10">
            <input
              type="text"
              placeholder="Поиск..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full py-2.5 md:py-4 px-4 md:px-6 rounded-xl md:rounded-2xl glass border-2 transition-all font-bold text-xs md:text-sm ${isDarkMode ? 'bg-white/5 border-transparent focus:border-[#ff00ff]' : 'bg-white border-slate-200'}`}
            />
          </div>

          <div className="flex items-center gap-3 md:gap-6 shrink-0">
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl glass flex items-center justify-center text-lg hover:bg-[#ff00ff]/20">
              {isDarkMode ? '☀️' : '🌙'}
            </button>
            <div onClick={() => setIsProfileModalOpen(true)} className="flex items-center cursor-pointer">
              <img src={user.avatar} className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl object-cover border-2 border-[#ff00ff]" alt="" />
            </div>
          </div>
        </div>

        {/* MOBILE NAV - Trending, Collection, History included here */}
        <div className="xl:hidden flex overflow-x-auto no-scrollbar gap-4 px-4 py-3 border-t border-white/5">
           {['home', 'manga', 'top', 'trending_list', 'collection', 'history'].map(m => (
              <button
                key={m}
                onClick={() => setView(m)}
                className={`text-[10px] font-black uppercase whitespace-nowrap px-4 py-2 rounded-lg ${view === m ? 'bg-[#ff00ff] text-white' : 'bg-white/5 opacity-60'}`}
              >
                {m === 'home' ? 'Главная' : m === 'manga' ? 'Манга' : m === 'top' ? 'Топ' : m === 'trending_list' ? 'Тренды' : m === 'collection' ? 'Коллекция' : 'История'}
              </button>
            ))}
        </div>
      </header>

      {/* Trending SECTION WITH INFINITE ANIMATION */}
      {view === 'home' && !searchQuery && page === 1 && (
        <section className="mt-10 overflow-hidden py-4 md:py-10">
          <div className="px-6 md:px-10 mb-6">
            <h3 className="text-2xl md:text-4xl font-black italic uppercase tracking-tighter bg-gradient-to-r from-[#ff00ff] to-[#00ffff] inline-block text-transparent bg-clip-text">Сейчас в тренде</h3>
          </div>
          <div className="relative">
            <div className="animate-infinite-scroll flex gap-10">
              {/* Ikki marta aylantiramizki, uzilish bo'lmasin */}
              {[...trending, ...trending].map((item, i) => (
                <div key={`${item.id}-${i}`} onClick={() => { setSelectedItem(item); addToHistory(item); }} className="w-64 md:w-80 group cursor-pointer relative shrink-0">
                  <div className="relative aspect-video rounded-2xl md:rounded-[32px] overflow-hidden glass border-2 border-transparent group-hover:border-[#ff00ff] transition-all duration-500">
                    <img src={getImg(item)} className="w-full h-full object-cover" alt="" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4">
                      <h4 className="text-sm md:text-lg font-black text-white truncate w-56">{item.russian || item.name}</h4>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
      {/* Main Grid */}
      <div className="max-w-[1920px] mx-auto px-4 md:px-10 py-8 md:py-12 flex flex-col lg:flex-row gap-10">
        <aside className="w-full lg:w-80 shrink-0 space-y-6">
          <div className="glass p-6 md:p-8 rounded-3xl md:rounded-[40px] sticky top-32 border-white/5">
            <p className="text-xs font-black uppercase opacity-50 mb-6 tracking-[0.2em] text-center">Категории</p>
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
              <button onClick={() => setActiveGenre(null)} className={`py-3 md:py-4 rounded-xl md:rounded-2xl text-[10px] md:text-sm font-black uppercase transition-all ${!activeGenre ? 'bg-gradient-to-r from-[#ff00ff] to-[#00ffff] text-white' : 'bg-white/5'}`}>🌈 Все жанры</button>
              {GENRES.map(g => (
                <button key={g.id} onClick={() => setActiveGenre(g.id)} className={`py-3 md:py-4 rounded-xl md:rounded-2xl text-[10px] md:text-sm font-black uppercase transition-all ${activeGenre === g.id ? 'bg-gradient-to-r from-[#ff00ff] to-[#00ffff] text-white' : 'bg-white/5'}`}>
                  {g.icon} {g.name}
                </button>
              ))}
            </div>
            
            {/* TELEGRAM LINK UNDER GENRES */}
            <div className="mt-6 md:mt-8 pt-6 md:pt-8 border-t border-white/10">
              <a 
                href="https://t.me/Sh1zoK1ll" 
                target="_blank" 
                rel="noreferrer" 
                className="flex items-center justify-center gap-3 w-full py-4 rounded-xl md:rounded-2xl bg-[#0088cc] hover:brightness-110 transition-all shadow-lg"
              >
                <span className="text-xl">✈️</span>
                <div className="text-left">
                  <p className="text-[9px] font-black uppercase text-white/70 leading-none">Developer</p>
                  <p className="text-xs md:text-sm font-black text-white">@Sh1zoK1ll</p>
                </div>
              </a>
            </div>
          </div>
        </aside>

        <main className="flex-1">
          <div className="flex flex-col md:flex-row items-center justify-between mb-8 md:mb-12 gap-6">
            <h2 className="text-3xl md:text-5xl lg:text-7xl font-black italic uppercase tracking-tighter bg-gradient-to-r from-[#ff00ff] to-[#00ffff] inline-block text-transparent bg-clip-text">
              {view === 'history' ? 'История' : view === 'collection' ? 'Коллекция' : view === 'manga' ? 'Манга' : view === 'trending_list' ? 'Тренды' : 'Каталог'}
            </h2>
            {['home', 'manga', 'top'].includes(view) && (
              <div className="flex items-center gap-4 bg-white/5 p-2 md:p-3 rounded-2xl md:rounded-[30px] border border-white/10">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} className="w-10 h-10 md:w-14 md:h-14 rounded-lg md:rounded-2xl glass flex items-center justify-center text-xl md:text-3xl hover:text-[#ff00ff]">‹</button>
                <div className="w-10 h-10 md:w-14 md:h-14 rounded-lg md:rounded-2xl bg-gradient-to-r from-[#ff00ff] to-[#00ffff] flex items-center justify-center font-black text-sm md:text-xl text-white">{page}</div>
                <button onClick={() => setPage(p => p + 1)} className="w-10 h-10 md:w-14 md:h-14 rounded-lg md:rounded-2xl glass flex items-center justify-center text-xl md:text-3xl hover:text-[#ff00ff]">›</button>
              </div>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-8">
              {[...Array(10)].map((_, i) => <div key={i} className="aspect-[3/4.5] rounded-2xl md:rounded-[40px] bg-white/5 animate-pulse" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-8">
              {finalContent.map((item, idx) => (
                <div key={`${item.id}-${idx}`} onClick={() => { setSelectedItem(item); addToHistory(item); }} className="group relative cursor-pointer animate-fade-in" style={{ animationDelay: `${idx * 20}ms` }}>
                  <div className="relative aspect-[3/4.5] rounded-2xl md:rounded-[40px] overflow-hidden glass border-2 border-transparent group-hover:border-[#ff00ff] transition-all duration-500 shadow-2xl">
                    
                    {ratings[item.id] && (
                      <div className={`absolute top-2 md:top-4 left-2 md:left-4 z-20 px-2 md:px-4 py-1 md:py-2 rounded-lg md:rounded-2xl font-black text-[9px] md:text-xs uppercase text-white bg-gradient-to-r ${ratings[item.id] > 5 ? 'from-[#ff00ff] to-[#00ffff]' : 'from-cyan-500 to-blue-600'}`}>
                        ⭐ {ratings[item.id]}
                      </div>
                    )}

                    <img src={getImg(item)} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-80" />
                    <div className="absolute bottom-4 md:bottom-6 left-4 md:left-6 right-4 md:right-6">
                      <p className="text-[8px] md:text-[10px] font-black text-[#ff00ff] uppercase mb-1">{item.kind}</p>
                      <h3 className="font-black text-xs md:text-sm uppercase leading-tight line-clamp-2 text-white">{item.russian || item.name}</h3>
                      {getStatusLabel(item.id) && (
                        <p className="text-[8px] md:text-[10px] font-black uppercase text-cyan-400 mt-2">{getStatusLabel(item.id)}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Modal Player & Manga Display */}
      {selectedItem && (
        <div className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center p-0 md:p-6 overflow-hidden animate-fade-in">
          <div className="absolute inset-0 bg-cover bg-center opacity-20 blur-[100px] pointer-events-none" style={{ backgroundImage: `url(${getImg(selectedItem)})` }} />
          <div className="w-full h-full md:max-h-[90vh] md:max-w-[90vw] bg-[#0a0a0c] md:rounded-[40px] flex flex-col relative z-10 border border-white/10 overflow-hidden">
            <div className="h-16 md:h-20 shrink-0 px-6 flex items-center justify-between bg-black/60 border-b border-white/10 backdrop-blur-xl">
              <h3 className="text-white font-black uppercase text-sm md:text-lg truncate max-w-xl">{selectedItem.russian || selectedItem.name}</h3>
              <button onClick={() => setSelectedItem(null)} className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white/5 hover:bg-red-500 text-white flex items-center justify-center text-2xl transition-all">×</button>
            </div>

            <div className="flex-1 overflow-y-auto bg-[#050507]">
              <div className="w-full bg-black">
                {selectedItem.kind === 'manga' ? (
                  <div className="py-10 md:py-16 flex flex-col items-center">
                    <img src={getImg(selectedItem)} className="w-48 md:w-64 rounded-2xl md:rounded-3xl shadow-2xl border-4 border-[#ff00ff] mb-8" alt="" />
                    <a href={`https://shikimori.one${selectedItem.url}`} target="_blank" rel="noreferrer" className="px-8 md:px-12 py-3 md:py-5 bg-white text-black rounded-xl md:rounded-2xl font-black uppercase hover:scale-105 transition shadow-xl">Читать на Shikimori</a>
                  </div>
                ) : (
                  <div className="relative aspect-video w-full">
                    <iframe src={`https://kodik.info/find-player?shikimoriID=${selectedItem.id}&color=%23ff00ff`} className="absolute inset-0 w-full h-full border-0" allowFullScreen allow="autoplay; fullscreen" />
                  </div>
                )}
              </div>

              <div className="p-6 md:p-12 max-w-6xl mx-auto flex flex-col lg:flex-row gap-12">
                <div className="w-full lg:w-64 shrink-0 flex flex-col gap-3">
                   {['watching', 'planned', 'completed'].map(st => (
                     <button key={st} onClick={() => updateLibraryStatus(selectedItem, st)} className={`py-3 md:py-4 rounded-xl md:rounded-2xl font-black uppercase text-[10px] transition-all ${library[selectedItem.id]?.status === st ? 'bg-[#ff00ff] text-white shadow-lg' : 'bg-white/5 text-white/40'}`}>
                        {st === 'watching' ? '👁️ Смотрю' : st === 'planned' ? '⏳ В планах' : '✅ Завершено'}
                     </button>
                   ))}
                </div>

                <div className="flex-1 space-y-10">
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 md:p-6 rounded-3xl bg-white/5">
                      <div className="text-center">
                        <p className="text-white/20 text-[9px] font-black uppercase mb-1">Рейтинг</p>
                        <p className="text-lg md:text-xl font-black text-yellow-400">{selectedItem.score || '0.0'} ★</p>
                      </div>
                      <div className="text-center">
                        <p className="text-white/20 text-[9px] font-black uppercase mb-1">Формат</p>
                        <p className="text-lg md:text-xl font-black text-cyan-400 uppercase">{selectedItem.kind}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-white/20 text-[9px] font-black uppercase mb-1">Статус</p>
                        <p className="text-lg md:text-xl font-black text-green-400 uppercase">{selectedItem.status}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-white/20 text-[9px] font-black uppercase mb-1">Год</p>
                        <p className="text-lg md:text-xl font-black text-white">{selectedItem.aired_on?.split('-')[0]}</p>
                      </div>
                   </div>

                   <div className="space-y-4">
                      <h4 className="text-white/20 font-black uppercase text-[10px]">Ваша оценка:</h4>
                      <div className="flex flex-wrap gap-2">
                        {[1,2,3,4,5,6,7,8,9,10].map(score => (
                          <button key={score} onClick={() => handleRating(selectedItem, score)} className={`w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl font-black text-xs md:text-sm transition-all ${ratings[selectedItem.id] === score ? 'bg-gradient-to-tr from-[#ff00ff] to-[#00ffff] text-white scale-110' : 'bg-white/5 text-white/40'}`}>
                            {score}
                          </button>
                        ))}
                      </div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/90 backdrop-blur-3xl animate-fade-in">
          <div className="relative w-full max-w-lg glass rounded-[40px] p-8 md:p-12 text-center border border-white/10">
            <button onClick={() => setIsProfileModalOpen(false)} className="absolute top-6 right-6 text-3xl text-white opacity-50">×</button>
            <div className="relative w-32 h-32 md:w-44 md:h-44 mx-auto mb-8 md:10 group">
              <img src={user.avatar} className="w-full h-full rounded-3xl md:rounded-[40px] object-cover border-4 border-[#ff00ff]" alt="" />
              <input type="file" ref={fileInputRef} onChange={handleAvatarChange} className="hidden" />
              <button onClick={() => fileInputRef.current.click()} className="absolute -bottom-2 -right-2 bg-[#ff00ff] w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center text-white">📸</button>
            </div>
            <input type="text" value={user.name} onChange={(e) => setUser({ ...user, name: e.target.value })} className="w-full bg-white/5 rounded-2xl px-6 py-4 font-black uppercase text-center text-white outline-none focus:border-[#ff00ff] border border-transparent" />
            <div className="mt-8 bg-white/5 p-6 md:p-8 rounded-[35px]">
              <div className="flex justify-between text-[10px] font-black uppercase mb-4">
                <span className="text-cyan-400">Ур. {Math.floor(user.xp / 100) + 1}</span>
                <span className="text-[#ff00ff]">{user.xp % 100}% XP</span>
              </div>
              <div className="h-3 bg-black/50 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#ff00ff] to-[#00ffff]" style={{ width: `${user.xp % 100}%` }} />
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className="mt-20 py-16 border-t border-white/5 text-center">
        <h2 className="text-2xl md:text-4xl font-black uppercase text-white mb-4">ANI<span className="text-[#ff00ff]">HUB</span></h2>
        <p className="text-[10px] font-black uppercase tracking-[0.5em] opacity-20 text-white">© 2026 Developed by @Sh1zoK1ll</p>
      </footer>
    </div>
  );
};

export default App;