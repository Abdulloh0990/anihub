// // import React, { useState, useEffect, useRef, useMemo } from 'react';
// // import logo from './img/logo.png';
// // const API = 'https://shikimori.one/api';
// // const ASSETS = 'https://shikimori.one';

// // const GENRES = [
// //   { id: 1, name: 'Сёнен', icon: '🔥' }, { id: 4, name: 'Комедия', icon: '😂' },
// //   { id: 10, name: 'Фэнтези', icon: '🧙' }, { id: 2, name: 'Приключения', icon: '🗺️' },
// //   { id: 8, name: 'Драма', icon: '😢' }, { id: 7, name: 'Мистика', icon: '🔮' },
// //   { id: 24, name: 'Фантастика', icon: '🚀' }, { id: 22, name: 'Романтика', icon: '❤️' },
// //   { id: 6, name: 'Демоны', icon: '👿' }, { id: 11, name: 'Игры', icon: '🎮' }
// // ];

// // const RANKS = [
// //   { min: 1, label: 'Новичок', color: 'text-gray-400' },
// //   { min: 10, label: 'Любитель', color: 'text-blue-400' },
// //   { min: 30, label: 'Ценитель', color: 'text-purple-400' },
// //   { min: 60, label: 'Мастер', color: 'text-orange-400' },
// //   { min: 85, label: 'Элита', color: 'text-red-500' },
// //   { min: 100, label: 'Легендарный Отаку', color: 'text-[#ff00ff] drop-shadow-[0_0_10px_#ff00ff]' }
// // ];

// // const getRank = (lvl) => {
// //   return [...RANKS].reverse().find(r => lvl >= r.min) || RANKS[0];
// // };

// // const App = () => {
// //   const [view, setView] = useState('home');
// //   const [content, setContent] = useState([]);
// //   const [trending, setTrending] = useState([]);
// //   const [selectedItem, setSelectedItem] = useState(null);
// //   const [loading, setLoading] = useState(true);
// //   const [searchQuery, setSearchQuery] = useState('');
// //   const [activeGenre, setActiveGenre] = useState(null);
// //   const [page, setPage] = useState(1);
// //   const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
// //   const [showToast, setShowToast] = useState(false);
// //   const fileInputRef = useRef(null);

// //   const [isDarkMode, setIsDarkMode] = useState(() => JSON.parse(localStorage.getItem('aniHub_theme_v4')) ?? true);
// //   const [library, setLibrary] = useState(() => JSON.parse(localStorage.getItem('aniHub_lib_v4')) ?? {});
// //   const [history, setHistory] = useState(() => JSON.parse(localStorage.getItem('aniHub_hist_v4')) ?? []);
// //   const [ratings, setRatings] = useState(() => JSON.parse(localStorage.getItem('aniHub_ratings_v4')) ?? {});
// //   const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('aniHub_user_v4')) ?? {
    

    
// //     name: 'Кибер_Пользователь',
// //     avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Shizo',
// //     bio: 'Жизнь в стиле Киберпанк',
// //     xp: 0
// //   });

// //   // Level va XP hisoblash logikasi (Xatoni to'g'irlash uchun qo'shildi)
// //   const userStats = useMemo(() => {
// //     const level = Math.floor(user.xp / 100) + 1;
// //     const nextLevelAt = level * 100;
// //     const currentLevelXP = user.xp % 100;
// //     return { level, xp: currentLevelXP, totalXp: user.xp, nextLevelAt: 100 };
// //   }, [user.xp]);

// //   // Opisaniyeni yuklash uchun useEffect
// // useEffect(() => {
// //   const fetchDescription = async () => {
// //     // Agar anime tanlangan bo'lsa va hali opisaniyesi yuklanmagan bo'lsa
// //     if (selectedItem && selectedItem.id && !selectedItem.description) {
// //       try {
// //         const response = await fetch(`https://shikimori.one/api/animes/${selectedItem.id}`);
// //         const data = await response.json();
        
// //         // Mavjud selectedItem ga descriptionni qo'shib yangilaymiz
// //         setSelectedItem(prev => ({
// //           ...prev,
// //           description: data.description_html || data.description || "Описание отсутствует."
// //         }));
// //       } catch (error) {
// //         console.error("Opisaniye yuklashda xato:", error);
// //       }
// //     }
// //   };

// //   fetchDescription();
// // }, [selectedItem?.id]); // Faqat anime o'zgarganda ishlaydi
// // const [isDescOpen, setIsDescOpen] = useState(false);
// //   useEffect(() => {
// //     localStorage.setItem('aniHub_lib_v4', JSON.stringify(library));
// //     localStorage.setItem('aniHub_hist_v4', JSON.stringify(history));
// //     localStorage.setItem('aniHub_user_v4', JSON.stringify(user));
// //     localStorage.setItem('aniHub_theme_v4', JSON.stringify(isDarkMode));
// //     localStorage.setItem('aniHub_ratings_v4', JSON.stringify(ratings));
// //   }, [library, history, user, isDarkMode, ratings]);

// //   useEffect(() => {
// //     if (history.length > 0) {
// //       setShowToast(true);
// //       const timer = setTimeout(() => setShowToast(false), 6000);
// //       return () => clearTimeout(timer);
// //     }
// //   }, []);

// //   const getImg = (item) => {
// //     if (!item?.image) return 'https://via.placeholder.com/225x320?text=No+Image';
// //     const path = item.image.original || (typeof item.image === 'string' ? item.image : '');
// //     return path.startsWith('http') ? path : ASSETS + path;
// //   };

// //   const fetchData = async () => {
// //     setLoading(true);
// //     try {
// //       const endpoint = view === 'manga' ? 'mangas' : 'animes';
// //       const order = view === 'top' ? 'ranked' : 'popularity';
// //       let url = `${API}/${endpoint}?limit=24&page=${page}&order=${order}`;
// //       if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;
// //       if (activeGenre) url += `&genre=${activeGenre}`;

// //       const res = await fetch(url);
// //       const data = await res.json();
// //       setContent(Array.isArray(data) ? data : []);

// //       if (trending.length === 0) {
// //         const trendRes = await fetch(`${API}/animes?limit=15&order=popularity`);
// //         const trendData = await trendRes.json();
// //         setTrending(trendData);
// //       }
// //     } catch (err) {
// //       console.error("Fetch Error:", err);
// //     } finally {
// //       setTimeout(() => setLoading(false), 800);
// //     }
// //   };

// //   useEffect(() => {
// //     if (view !== 'collection' && view !== 'history' && view !== 'trending_list') fetchData();
// //     else setLoading(false);
// //   }, [view, searchQuery, activeGenre, page]);

// //   const handleRating = (item, score) => {
// //     setRatings(prev => ({ ...prev, [item.id]: score }));
// //     if (!library[item.id]) updateLibraryStatus(item, 'planned');
// //     setUser(prev => ({ ...prev, xp: prev.xp + 2 })); // Baholash uchun XP
// //   };

// //   const addToHistory = (item) => {
// //     const newItem = { ...item, date: new Date().toLocaleString(), timestamp: Date.now() };
// //     setHistory(prev => [newItem, ...prev.filter(h => h.id !== item.id)].slice(0, 40));
// //     setUser(prev => ({ ...prev, xp: prev.xp + 5 }));
// //   };

// //   const updateLibraryStatus = (item, status) => {
// //     setLibrary(prev => ({ ...prev, [item.id]: { ...item, status } }));
// //     setUser(prev => ({ ...prev, xp: prev.xp + 10 })); // Ro'yxatga qo'shish uchun XP
// //   };

// //   const handleAvatarChange = (e) => {
// //     const file = e.target.files[0];
// //     if (file) {
// //       const reader = new FileReader();
// //       reader.onloadend = () => setUser({ ...user, avatar: reader.result });
// //       reader.readAsDataURL(file);
// //     }
// //   };

// //   const getStatusLabel = (id) => {
// //     const map = { watching: 'Смотрю', planned: 'В планах', completed: 'Завершено' };
// //     return library[id]?.status ? map[library[id].status] : null;
// //   };

// //   const displayContent = () => {
// //     if (view === 'collection') return Object.values(library);
// //     if (view === 'history') return history;
// //     if (view === 'trending_list') return trending;
// //     return content;
// //   };

// //   const finalContent = displayContent();

// //   return (
// //     <div className={`min-h-screen font-sans transition-all duration-700 ${isDarkMode ? 'bg-[#0a0a0f] text-white' : 'bg-gradient-to-br from-[#f0f2f5] to-[#e0e7ff] text-slate-900'}`}>
      
// //       <style>{`
// //         @keyframes fadeIn { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
// //         @keyframes scroll { 0% { transform: translateX(0); } 100% { transform: translateX(calc(-320px * 15 - 2.5rem * 15)); } }
// //         .animate-fade-in { animation: fadeIn 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
// //         .animate-infinite-scroll { display: flex; width: max-content; animation: scroll 40s linear infinite; }
// //         .animate-infinite-scroll:hover { animation-play-state: paused; }
// //         .glass { backdrop-filter: blur(20px); background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); }
// //         .no-scrollbar::-webkit-scrollbar { display: none; }
// //         .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
// //         ::-webkit-scrollbar { width: 8px; }
// //         ::-webkit-scrollbar-thumb { background: linear-gradient(#ff00ff, #00ffff); border-radius: 10px; }
// //       `}</style>

// //  {/* Header */}
// //       <header className={`sticky top-0 z-[1000] glass border-b ${isDarkMode ? 'border-white/10' : 'border-slate-200'} backdrop-blur-2xl`}>
// //         <div className="max-w-[1920px] mx-auto px-4 md:px-6 py-4 flex items-center justify-between gap-4">
// //           <div className="flex items-center gap-4 md:gap-10 shrink-0">
// //             {/* Yangi Logotip Bloki */}
// //             <div onClick={() => { setView('home'); setPage(1); }} className="flex items-center gap-3 cursor-pointer group">
// //               <div className="w-10 h-10 md:w-14 md:h-14 overflow-hidden rounded-xl md:rounded-2xl shadow-[0_0_20px_rgba(255,0,255,0.3)]">
// //                 <img 
// //                   src={logo} 
// //                   alt="AniHub Logo"
// //                   className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
// //                 />
// //               </div>
// //               <h1 className="text-xl md:text-3xl font-black tracking-tighter uppercase hidden sm:block">
// //                 ANI<span className="text-[#ff00ff]">HUB</span>
// //               </h1>
// //             </div>

// //             <nav className="hidden xl:flex gap-6">
// //               {['home', 'manga', 'top', 'trending_list', 'collection', 'history'].map(m => (
// //                 <button
// //                   key={m}
// //                   onClick={() => setView(m)}
// //                   className={`text-xs font-black uppercase tracking-wider transition-all relative group ${view === m ? 'text-[#ff00ff]' : 'opacity-60 hover:opacity-100'}`}
// //                 >
// //                   {m === 'home' ? 'Главная' : m === 'manga' ? 'Манга' : m === 'top' ? 'Топ' : m === 'trending_list' ? 'Тренды' : m === 'collection' ? 'Коллекция' : 'История'}
// //                 </button>
// //               ))}
// //             </nav>
// //           </div>

// //           <div className="flex-1 max-w-xl mx-2 md:mx-10">
// //     <div className="flex-1 max-w-xl mx-2 md:mx-10">
// //   <input
// //     type="text"
// //     placeholder="Поиск..."
// //     value={searchQuery}
// //     onChange={(e) => setSearchQuery(e.target.value)}
// //     className={`w-full py-2.5 md:py-4 px-4 md:px-6 rounded-xl md:rounded-2xl glass border-2 transition-all font-bold text-xs md:text-sm 
// //       ${isDarkMode 
// //         ? 'bg-white/5 border-transparent focus:border-[#ff00ff] text-white placeholder-white/40' 
// //         : 'bg-white border-slate-200 text-slate-900 focus:border-[#ff00ff] placeholder-slate-400 shadow-sm'
// //       }`}
// //   />
// // </div>
// //           </div>

// //           <div className="flex items-center gap-3 md:gap-6 shrink-0">
// //              <button 
// //               onClick={() => {
// //                 if (content.length > 0) {
// //                   const random = content[Math.floor(Math.random() * content.length)];
// //                   setSelectedItem(random);
// //                   addToHistory(random);
// //                 }
// //               }}
// //               className="hidden sm:flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-[#ff00ff]/20 transition-all"
// //             >
// //               <span className="text-lg">🎲</span>
// //             </button>
// //             <button onClick={() => setIsDarkMode(!isDarkMode)} className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl glass flex items-center justify-center text-lg hover:bg-[#ff00ff]/20">
// //               {isDarkMode ? '☀️' : '🌙'}
// //             </button>
// //             <div onClick={() => setIsProfileModalOpen(true)} className="flex items-center cursor-pointer">
// //               <img src={user.avatar} className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl object-cover border-2 border-[#ff00ff]" alt="" />
// //             </div>
// //           </div>
// //         </div>

// //         <div className="xl:hidden flex overflow-x-auto no-scrollbar gap-4 px-4 py-3 border-t border-white/5">
// //            {['home', 'manga', 'top', 'trending_list', 'collection', 'history'].map(m => (
// //               <button
// //                 key={m}
// //                 onClick={() => setView(m)}
// //                 className={`text-[10px] font-black uppercase whitespace-nowrap px-4 py-2 rounded-lg ${view === m ? 'bg-[#ff00ff] text-white' : 'bg-white/5 opacity-60'}`}
// //               >
// //                 {m === 'home' ? 'Главная' : m === 'manga' ? 'Манга' : m === 'top' ? 'Топ' : m === 'trending_list' ? 'Тренды' : m === 'collection' ? 'Коллекция' : 'История'}
// //               </button>
// //             ))}
// //         </div>
// //       </header>

// //       {/* Hero Trending */}
// //       {view === 'home' && !searchQuery && page === 1 && (
// //         <section className="mt-10 overflow-hidden py-4 md:py-10">
// //           <div className="px-6 md:px-10 mb-6">
// //             <h3 className="text-2xl md:text-4xl font-black italic uppercase tracking-tighter bg-gradient-to-r from-[#ff00ff] to-[#00ffff] inline-block text-transparent bg-clip-text">Сейчас в тренде</h3>
// //           </div>
// //           <div className="relative">
// //             <div className="animate-infinite-scroll flex gap-10">
// //               {[...trending, ...trending].map((item, i) => (
// //                 <div key={`${item.id}-${i}`} onClick={() => { setSelectedItem(item); addToHistory(item); }} className="w-64 md:w-80 group cursor-pointer relative shrink-0">
// //                   <div className="relative aspect-video rounded-2xl md:rounded-[32px] overflow-hidden glass border-2 border-transparent group-hover:border-[#ff00ff] transition-all duration-500">
// //                     <img src={getImg(item)} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="" />
// //                     <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
// //                     <div className="absolute bottom-4 left-4">
// //                       <h4 className="text-sm md:text-lg font-black text-white truncate w-56 italic">{item.russian || item.name}</h4>
// //                     </div>
// //                   </div>
// //                 </div>
// //               ))}
// //             </div>
// //           </div>
// //         </section>
// //       )}

// //       {/* Main Grid */}
// //       <div className="max-w-[1920px] mx-auto px-4 md:px-10 py-8 md:py-12 flex flex-col lg:flex-row gap-10">
// //         <aside className="w-full lg:w-80 shrink-0 space-y-6">
// //           <div className="glass p-6 md:p-8 rounded-3xl md:rounded-[40px] sticky top-32 border-white/5">
// //             <p className="text-xs font-black uppercase opacity-50 mb-6 tracking-[0.2em] text-center">Категории</p>
// //             <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
// //               <button onClick={() => setActiveGenre(null)} className={`py-3 md:py-4 rounded-xl md:rounded-2xl text-[10px] md:text-sm font-black uppercase transition-all ${!activeGenre ? 'bg-gradient-to-r from-[#ff00ff] to-[#00ffff] text-white' : 'bg-white/5'}`}> 🧩 Все жанры</button>
// //               {GENRES.map(g => (
// //                 <button key={g.id} onClick={() => setActiveGenre(g.id)} className={`py-3 md:py-4 rounded-xl md:rounded-2xl text-[10px] md:text-sm font-black uppercase transition-all ${activeGenre === g.id ? 'bg-gradient-to-r from-[#ff00ff] to-[#00ffff] text-white' : 'bg-white/5'}`}>
// //                   {g.icon} {g.name}
// //                 </button>
// //               ))}
// //             </div>
            
// //             <div className="mt-6 md:mt-8 pt-6 md:pt-8 border-t border-white/10">
// //               <a href="https://t.me/Sh1zoK1ll" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-3 w-full py-4 rounded-xl md:rounded-2xl bg-[#0088cc] hover:brightness-110 transition-all shadow-lg">
// //                 <span className="text-xl">✈️</span>
// //                 <div className="text-left">
// //                   <p className="text-[9px] font-black uppercase text-white/70 leading-none">Developer</p>
// //                   <p className="text-xs md:text-sm font-black text-white">@Sh1zoK1ll</p>
// //                 </div>
// //               </a>
// //             </div>
// //           </div>
// //         </aside>

// //         <main className="flex-1">
// //           <div className="flex flex-col md:flex-row items-center justify-between mb-8 md:mb-12 gap-6">
// //             <h2 className="text-3xl md:text-5xl lg:text-7xl font-black italic uppercase tracking-tighter bg-gradient-to-r from-[#ff00ff] to-[#00ffff] inline-block text-transparent bg-clip-text">
// //               {view === 'history' ? 'История' : view === 'collection' ? 'Коллекция' : view === 'manga' ? 'Манга' : view === 'trending_list' ? 'Тренды' : 'Каталог'}
// //             </h2>
// //             {['home', 'manga', 'top'].includes(view) && (
// //               <div className="flex items-center gap-4 bg-white/5 p-2 md:p-3 rounded-2xl md:rounded-[30px] border border-white/10">
// //                 <button onClick={() => setPage(p => Math.max(1, p - 1))} className="w-10 h-10 md:w-14 md:h-14 rounded-lg md:rounded-2xl glass flex items-center justify-center text-xl md:text-3xl hover:text-[#ff00ff]">‹</button>
// //                 <div className="w-10 h-10 md:w-14 md:h-14 rounded-lg md:rounded-2xl bg-gradient-to-r from-[#ff00ff] to-[#00ffff] flex items-center justify-center font-black text-sm md:text-xl text-white">{page}</div>
// //                 <button onClick={() => setPage(p => p + 1)} className="w-10 h-10 md:w-14 md:h-14 rounded-lg md:rounded-2xl glass flex items-center justify-center text-xl md:text-3xl hover:text-[#ff00ff]">›</button>
// //               </div>
// //             )}
// //           </div>

// //           {loading ? (
// //             <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-8">
// //               {[...Array(10)].map((_, i) => <div key={i} className="aspect-[3/4.5] rounded-2xl md:rounded-[40px] bg-white/5 animate-pulse" />)}
// //             </div>
// //           ) : (
// //             <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-8">
// //               {finalContent.map((item, idx) => (
// //                 <div key={`${item.id}-${idx}`} onClick={() => { setSelectedItem(item); addToHistory(item); }} className="group relative cursor-pointer animate-fade-in">
// //                   <div className="relative aspect-[3/4.5] rounded-2xl md:rounded-[40px] overflow-hidden glass border-2 border-transparent group-hover:border-[#ff00ff] transition-all duration-500 shadow-2xl bg-black">
                    
// //                     {ratings[item.id] && (
// //                       <div className="absolute top-2 md:top-4 left-2 md:left-4 z-30 px-2 md:px-3 py-1 rounded-lg font-black text-[8px] md:text-[10px] uppercase text-white bg-gradient-to-r from-[#ff00ff] to-[#00ffff]">
// //                         ⭐ {ratings[item.id]}
// //                       </div>
// //                     )}

// //                     <img src={getImg(item)} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:opacity-40" alt="" />

// //                     <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-4 opacity-0 group-hover:opacity-100 transition-all duration-500 bg-black/40 backdrop-blur-md">
// //                        <div className="translate-y-6 group-hover:translate-y-0 transition-transform duration-500 text-center">
// //                           <div className="w-10 h-10 md:w-12 md:h-12 bg-[#ff00ff] rounded-full flex items-center justify-center mb-3 mx-auto shadow-[0_0_20px_#ff00ff]">
// //                             <span className="text-white text-lg">▶</span>
// //                           </div>
// //                           <p className="text-[#00ffff] text-[9px] md:text-[10px] font-black uppercase tracking-tighter mb-1">{item.kind} • {item.episodes || '?'} эп.</p>
// //                           <p className="text-white text-[10px] md:text-xs font-black uppercase italic">Смотреть</p>
// //                        </div>
// //                     </div>

// //                     <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent z-10 group-hover:opacity-0 transition-opacity" />
// //                     <div className="absolute bottom-4 md:bottom-6 left-4 md:left-6 right-4 md:right-6 z-10 group-hover:opacity-0 transition-opacity">
// //                       <h3 className="font-black text-[10px] md:text-sm uppercase leading-tight line-clamp-2 text-white italic">{item.russian || item.name}</h3>
// //                       {getStatusLabel(item.id) && (
// //                         <p className="text-[8px] font-black uppercase text-cyan-400 mt-2">{getStatusLabel(item.id)}</p>
// //                       )}
// //                     </div>
// //                   </div>
// //                 </div>
// //               ))}
// //             </div>
// //           )}
// //         </main>
// //       </div>

// //       {/* Modal Player */}
// //       {selectedItem && (
// //         <div className="fixed inset-0 z-[9999] bg-[#050507] flex flex-col animate-fade-in overflow-hidden">
// //           <div className="relative z-[100] h-16 md:h-20 px-4 md:px-10 flex items-center justify-between bg-black/60 border-b border-white/5 backdrop-blur-xl">
// //             <div className="flex items-center gap-4">
// //               <button onClick={() => setSelectedItem(null)} className="w-10 h-10 rounded-xl bg-white/5 hover:bg-[#ff00ff]/20 text-white flex items-center justify-center transition-all">←</button>
// //               <h3 className="text-white font-black uppercase text-xs md:text-base truncate italic max-w-[200px] md:max-w-3xl">
// //                 {selectedItem.russian || selectedItem.name}
// //               </h3>
// //             </div>
// //             <button onClick={() => setSelectedItem(null)} className="w-10 h-10 rounded-xl bg-white/5 hover:bg-red-500 text-white flex items-center justify-center text-xl transition-all">×</button>
// //           </div>

// //           <div className="relative z-10 flex-1 flex flex-col lg:flex-row overflow-hidden">
// //             <div className="w-full lg:w-[400px] overflow-y-auto bg-black/40 border-r border-white/5 p-6 md:p-10 no-scrollbar order-2 lg:order-1">
// //               <div className="grid grid-cols-2 gap-3 mb-8">
// //                 {[
// //                   { label: 'Рейтинг', value: `${selectedItem.score || '0.0'} ★`, color: 'text-yellow-400' },
// //                   { label: 'Формат', value: selectedItem.kind, color: 'text-cyan-400' },
// //                   { label: 'Год', value: selectedItem.aired_on?.split('-')[0], color: 'text-white' },
// //                   { label: 'Статус', value: selectedItem.status, color: 'text-green-400' }
                  
// //                 ].map((info, i) => (
// //                   <div key={i} className="bg-white/5 p-4 rounded-2xl border border-white/5">
// //                     <p className="text-white/20 text-[9px] font-black uppercase mb-1">{info.label}</p>
// //                     <p className={`text-sm font-black uppercase ${info.color}`}>{info.value}</p>
// //                   </div>
// //                 ))}
// //               </div>

// //               <div className="space-y-3 mb-8">
// //                 <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-2">Статус</p>
// //                 <div className="flex flex-col gap-2">
// //                   {['watching', 'planned', 'completed'].map(st => (
// //                     <button key={st} onClick={() => updateLibraryStatus(selectedItem, st)} className={`w-full py-4 rounded-2xl font-black uppercase text-[10px] transition-all ${library[selectedItem.id]?.status === st ? 'bg-gradient-to-r from-[#ff00ff] to-[#00ffff] text-white' : 'bg-white/5 text-white/40'}`}>
// //                       {st === 'watching' ? '👁️ Смотрю' : st === 'planned' ? '⏳ В планах' : '✅ Завершено'}
// //                     </button>
// //                   ))}
// //                 </div>
// //               </div>

// //               <div className="space-y-4">
// //                 <h4 className="text-white/20 font-black uppercase text-[10px] tracking-[0.2em] ml-2">Ваша оценка</h4>
// //                 <div className="grid grid-cols-5 gap-2">
// //                   {[1,2,3,4,5,6,7,8,9,10].map(score => (
// //                     <button key={score} onClick={() => handleRating(selectedItem, score)} className={`aspect-square rounded-xl font-black text-sm transition-all ${ratings[selectedItem.id] === score ? 'bg-[#ff00ff] text-white scale-110 shadow-[0_0_15px_#ff00ff]' : 'bg-white/5 text-white/30'}`}>
// //                       {score}
// //                     </button>
// //                   ))}
// //                 </div>
// //               </div>
// //             </div>

// //             <div className="flex-1 bg-black flex items-center justify-center order-1 lg:order-2">
// //               {selectedItem.kind === 'manga' ? (
// //                 <div className="w-full h-full overflow-y-auto flex flex-col items-center py-10 no-scrollbar">
// //                   <img src={getImg(selectedItem)} className="w-56 md:w-72 rounded-[32px] border-4 border-[#ff00ff] mb-6 shadow-2xl" alt="" />
// //                   <a href={`https://shikimori.one${selectedItem.url}`} target="_blank" rel="noreferrer" className="px-10 py-4 bg-[#ff00ff] text-white rounded-2xl font-black uppercase hover:scale-105 transition-transform shadow-[0_0_20px_#ff00ff]">Читать на Shikimori</a>
// //                 </div>
// //               ) : (
// //                 <div className="w-full h-full">
// //                    <iframe 
// //                     src={`https://kodik.info/find-player?shikimoriID=${selectedItem.id}&color=%23ff00ff`} 
// //                     className="w-full h-full border-0 aspect-video lg:aspect-auto" 
// //                     allowFullScreen 
// //                     allow="autoplay; fullscreen" 
// //                   />
// //                 </div>
// //               )}
// //             </div>
// //           </div>
// // {/* Opisaniye Bloki */}
// // <div className="mt-6 border border-white/5 rounded-3xl overflow-hidden bg-white/5 transition-all duration-500">
// //   {/* Tugma */}
// //   <button 
// //     onClick={() => setIsDescOpen(!isDescOpen)}
// //     className="w-full flex items-center justify-between p-5 hover:bg-white/5 transition-colors"
// //   >
// //     <p className="text-[10px] font-black text-[#ff00ff] uppercase tracking-[0.2em]">Описание ✨</p>
    
// //     {/* isDescOpen true (ochiq) bo'lganda rotate-180 bo'lib uchi pastga qaraydi */}
// //     {/* isDescOpen false (yopiq) bo'lganda rotate-0 bo'lib uchi tepaga qaraydi */}
// //     <span className={`text-[#ff00ff] transition-transform duration-300 ${isDescOpen ? 'rotate-180' : 'rotate-0'}`}>
// //       <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
// //         <path d="M18 15l-6-6-6 6"/> {/* Bu boshlang'ichda tepaga qaragan ^ shakl */}
// //       </svg>
// //     </span>
// //   </button>

// //   {/* Ochiladigan qism */}
// //   <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isDescOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
// //     <div className="p-5 pt-0 border-t border-white/5">
// //       <div 
// //         className="text-xs md:text-sm text-white/70 leading-relaxed prose prose-invert max-h-80 overflow-y-auto no-scrollbar"
// //         dangerouslySetInnerHTML={{ 
// //           __html: selectedItem?.description || '<span class="opacity-50 italic animate-pulse">Загрузка описания...</span>' 
// //         }}
// //       />
// //     </div>
// //   </div>
// // </div>
// //         </div>
// //       )}

// //       {/* Profile Modal */}
// //       {isProfileModalOpen && (
// //         <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/90 backdrop-blur-3xl animate-fade-in text-white">
// //           <div className="relative w-full max-w-lg glass rounded-[40px] p-8 md:p-12 text-center border border-white/10 overflow-hidden bg-[#0a0a0c]">
// //             <button onClick={() => setIsProfileModalOpen(false)} className="absolute top-6 right-6 text-3xl opacity-50 hover:opacity-100 transition-opacity">×</button>
            
// //             <div className="relative w-32 h-32 md:w-44 md:h-44 mx-auto mb-6 group">
// //               <div className="absolute inset-0 rounded-[40px] bg-[#ff00ff] blur-md opacity-20 group-hover:opacity-40 animate-pulse"></div>
// //               <img src={user.avatar} className="relative w-full h-full rounded-3xl md:rounded-[40px] object-cover border-4 border-[#ff00ff] z-10" alt="avatar" />
// //               <input type="file" ref={fileInputRef} onChange={handleAvatarChange} className="hidden" />
// //               <button onClick={() => fileInputRef.current.click()} className="absolute -bottom-2 -right-2 bg-[#ff00ff] w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center z-20 shadow-xl hover:scale-110 transition-transform">📸</button>
// //             </div>

// //             <div className="space-y-1 mb-8">
// //               <input 
// //                 type="text" 
// //                 value={user.name} 
// //                 onChange={(e) => setUser({ ...user, name: e.target.value })} 
// //                 className="w-full bg-transparent font-black uppercase text-center text-2xl outline-none border-b border-transparent focus:border-white/10" 
// //               />
// //               <p className={`text-[10px] md:text-xs font-black uppercase tracking-[0.3em] ${getRank(userStats.level).color}`}>
// //                 {getRank(userStats.level).label}
// //               </p>
// //             </div>

// //             <div className="bg-white/5 p-6 md:p-8 rounded-[35px] border border-white/5 relative">
// //               <div className="flex justify-between items-end mb-4">
// //                 <div className="text-left">
// //                   <p className="text-[8px] font-black text-white/30 uppercase tracking-widest">Уровень</p>
// //                   <p className="text-3xl font-black italic">{userStats.level}</p>
// //                 </div>
// //                 <div className="text-right">
// //                   <p className="text-[8px] font-black text-white/30 uppercase tracking-widest">Опыт</p>
// //                   <p className="text-sm font-black text-cyan-400">
// //                     {userStats.xp} / 100
// //                   </p>
// //                 </div>
// //               </div>

// //               <div className="h-4 bg-black/50 rounded-full overflow-hidden p-[2px] border border-white/5">
// //                 <div 
// //                   className="h-full bg-gradient-to-r from-[#ff00ff] via-[#00ffff] to-[#ff00ff] rounded-full transition-all duration-1000" 
// //                   style={{ width: `${(userStats.xp / 100) * 100}%` }} 
// //                 />
// //               </div>

// //               <div className="mt-8 grid grid-cols-2 gap-3">
// //                 <div className="bg-white/5 p-4 rounded-3xl border border-white/5">
// //                   <p className="text-[8px] font-black text-white/30 uppercase mb-1 text-left">Завершено</p>
// //                   <p className="text-xl font-black text-white italic text-left">{Object.values(library).filter(a => a.status === 'completed').length}</p>
// //                 </div>
// //                 <div className="bg-white/5 p-4 rounded-3xl border border-white/5">
// //                   <p className="text-[8px] font-black text-white/30 uppercase mb-1 text-left">История</p>
// //                   <p className="text-xl font-black text-white italic text-left">{history.length}</p>
// //                 </div>
// //                 {/* STATISTIKA */}
// // <div className="mt-8 grid grid-cols-2 gap-3">
// //   <div className="bg-white/5 p-4 rounded-3xl border border-white/5">
// //     <p className="text-[8px] font-black text-white/30 uppercase mb-1 text-left">Завершено</p>
// //     <p className="text-xl font-black text-white italic text-left">{Object.values(library).filter(a => a.status === 'completed').length}</p>
// //   </div>
// //   <div className="bg-white/5 p-4 rounded-3xl border border-white/5">
// //     <p className="text-[8px] font-black text-white/30 uppercase mb-1 text-left">Часов</p>
// //     <p className="text-xl font-black text-white italic text-left">
// //       {Math.round(Object.values(library).filter(a => a.status === 'completed').length * 4.5)}
// //     </p>
// //   </div>
// // </div>
// //               </div>
// //             </div>
// //           </div>
// //         </div>
// //       )}

// //      {/* Toast */}
// //       {showToast && history.length > 0 && (
// //         <div className="fixed bottom-6 right-6 z-[10001] animate-fade-in w-[calc(100%-3rem)] md:w-96">
// //           <div 
// //             onClick={() => setSelectedItem(history[0])}
// //             className={`p-4 rounded-2xl border-2 border-[#ff00ff] flex items-center gap-4 cursor-pointer hover:scale-105 transition-all shadow-[0_10px_40px_rgba(255,0,255,0.2)] 
// //               ${isDarkMode 
// //                 ? 'bg-[#12121a]/95 backdrop-blur-xl text-white' 
// //                 : 'bg-white text-slate-900'
// //               }`}
// //           >
// //             <div className="w-12 h-16 shrink-0 rounded-lg overflow-hidden border border-white/10">
// //               <img src={getImg(history[0])} className="w-full h-full object-cover" alt="" />
// //             </div>
// //             <div className="flex-1 overflow-hidden">
// //               <p className="text-[10px] font-black uppercase text-[#ff00ff] mb-1">Продолжить? ✨</p>
// //               <h4 className={`text-xs font-black truncate uppercase italic ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
// //                 {history[0].russian || history[0].name}
// //               </h4>
// //             </div>
// //             <button 
// //               onClick={(e) => { e.stopPropagation(); setShowToast(false); }} 
// //               className={`text-xl p-2 transition-colors ${isDarkMode ? 'text-white/40 hover:text-white' : 'text-slate-400 hover:text-slate-900'}`}
// //             >
// //               ×
// //             </button>
// //           </div>
// //         </div>
// //       )}

// //       <footer className="mt-20 py-16 border-t border-white/5 text-center">
// //         <h2 className="text-2xl md:text-4xl font-black uppercase text-white mb-4">ANI<span className="text-[#ff00ff]">HUB</span></h2>
// //         <p className="text-[10px] font-black uppercase tracking-[0.5em] opacity-20 text-white">© 2026 Developed by @Sh1zoK1ll</p>
// //       </footer>

// //       <style>{`
// //   @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
// //   @keyframes scroll { 0% { transform: translateX(0); } 100% { transform: translateX(calc(-320px * 15 - 2.5rem * 15)); } }
  
// //   .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
// //   .animate-infinite-scroll { 
// //     display: flex; 
// //     width: max-content; 
// //     animation: scroll 60s linear infinite; 
// //     will-change: transform; /* GPU uchun optimizatsiya */
// //     backface-visibility: hidden;
// //   }
  
// //   /* Kuchsiz qurilmalarda blur effektini o'chirish yoki kamaytirish */
// //   .glass { 
// //     backdrop-filter: blur(10px); 
// //     -webkit-backdrop-filter: blur(10px); 
// //     background: ${isDarkMode ? 'rgba(15, 15, 20, 0.8)' : 'rgba(255, 255, 255, 0.9)'}; 
// //   }

// //   /* Rasm yuklanguncha joyini tayyorlab turish */
// //   .img-container { aspect-ratio: 3/4.5; background: #1a1a1a; overflow: hidden; }
// // `}</style>
// //     </div>
// //   );
// // };

// // export default App;







// import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
// import logo from './img/logo.png';

// // ==================== CONSTANTS & CONFIGURATION ====================
// const API = 'https://shikimori.one/api';
// const ASSETS = 'https://shikimori.one';
// const STORAGE_VERSION = 'v10_enhanced';
// // const AUTO_SAVE_DELAY = 1500;
// // const SESSION_TIMEOUT = 30 * 24 * 60 * 60 * 1000;
// // const CLOUD_SYNC = true;

// // const GENRES = [
// //   { id: 1, name: 'Сёнен', icon: '🔥', gradient: 'from-red-500 to-orange-500', desc: 'Боевики и приключения' },
// //   { id: 4, name: 'Комедия', icon: '😂', gradient: 'from-yellow-400 to-pink-400', desc: 'Смешные и веселые' },
// //   { id: 10, name: 'Фэнтези', icon: '🧙', gradient: 'from-purple-500 to-indigo-500', desc: 'Магия и волшебство' },
// //   { id: 2, name: 'Приключения', icon: '🗺️', gradient: 'from-green-400 to-cyan-400', desc: 'Путешествия и открытия' },
// //   { id: 8, name: 'Драма', icon: '😢', gradient: 'from-blue-500 to-purple-500', desc: 'Эмоциональные истории' },
// //   { id: 7, name: 'Мистика', icon: '🔮', gradient: 'from-violet-500 to-purple-600', desc: 'Тайны и загадки' },
// //   { id: 24, name: 'Фантастика', icon: '🚀', gradient: 'from-cyan-400 to-blue-500', desc: 'Будущее и технологии' },
// //   { id: 22, name: 'Романтика', icon: '❤️', gradient: 'from-pink-500 to-rose-500', desc: 'Любовные истории' },
// //   { id: 6, name: 'Демоны', icon: '👿', gradient: 'from-red-600 to-black', desc: 'Темная сторона' },
// //   { id: 11, name: 'Игры', icon: '🎮', gradient: 'from-indigo-500 to-cyan-500', desc: 'Виртуальные миры' }
// // ];

// // const RANKS = [
// //   { min: 1, label: 'Новичок', color: 'text-gray-400', badge: '🌱', glow: 'shadow-gray-500/50' },
// //   { min: 10, label: 'Любитель', color: 'text-blue-400', badge: '⚡', glow: 'shadow-blue-500/50' },
// //   { min: 30, label: 'Ценитель', color: 'text-purple-400', badge: '💎', glow: 'shadow-purple-500/50' },
// //   { min: 60, label: 'Мастер', color: 'text-orange-400', badge: '🔥', glow: 'shadow-orange-500/50' },
// //   { min: 85, label: 'Элита', color: 'text-red-500', badge: '👑', glow: 'shadow-red-500/50' },
// //   { min: 100, label: 'Легенда', color: 'text-[#ff00ff]', badge: '⭐', glow: 'shadow-[#ff00ff]/80' }
// // ];

// // const ACHIEVEMENTS = [
// //   { id: 'first_anime', name: 'Первый шаг', desc: 'Просмотрите первое аниме', icon: '🎬', xp: 10 },
// //   { id: 'rate_10', name: 'Критик', desc: 'Оцените 10 аниме', icon: '⭐', xp: 50 },
// //   { id: 'complete_50', name: 'Марафонец', desc: 'Завершите 50 аниме', icon: '🏃', xp: 100 },
// //   { id: 'level_10', name: 'Опытный', desc: 'Достигните 10 уровня', icon: '💪', xp: 75 },
// //   { id: 'binge_watcher', name: 'Запойный', desc: 'Просмотрите 5 аниме за день', icon: '📺', xp: 30 },
// //   { id: 'genre_master', name: 'Мастер жанров', desc: 'Все жанры освоены', icon: '🎭', xp: 150 },
// //   { id: 'social', name: 'Социальный', desc: 'Добавьте 20 в избранное', icon: '💬', xp: 40 },
// //   { id: 'reviewer', name: 'Рецензент', desc: 'Напишите 10 заметок', icon: '📝', xp: 60 },
// //   { id: 'collector', name: 'Коллекционер', desc: '100 аниме в библиотеке', icon: '📚', xp: 200 },
// //   { id: 'perfectionist', name: 'Перфекционист', desc: 'Поставьте 50 оценок "10"', icon: '🌟', xp: 150 },
// //   { id: 'early_bird', name: 'Ранняя пташка', desc: 'Зайдите в 6:00 утра', icon: '🌅', xp: 25 },
// //   { id: 'night_owl', name: 'Полуночник', desc: 'Зайдите после полуночи', icon: '🦉', xp: 25 },
// //   { id: 'week_streak', name: 'Неделя', desc: '7 дней подряд', icon: '📅', xp: 100 },
// //   { id: 'explorer', name: 'Исследователь', desc: 'Просмотрите все жанры', icon: '🗺️', xp: 80 },
// //   { id: 'speed_watcher', name: 'Скоростной', desc: '10 серий за день', icon: '⚡', xp: 50 }
// // ];

// // const THEMES = {
// //   cyberpunk: {
// //     name: 'Киберпанк',
// //     icon: '🌃',
// //     primary: '#6366f1',
// //     secondary: '#8b5cf6',
// //     bg: 'from-slate-950 via-slate-900 to-slate-950',
// //     font: "'Inter', sans-serif"
// //   },
// //   minimal: {
// //     name: 'Минимал',
// //     icon: '⚪',
// //     primary: '#3b82f6',
// //     secondary: '#06b6d4',
// //     bg: 'from-slate-900 via-slate-800 to-slate-900',
// //     font: "'Inter', sans-serif"
// //   },
// //   sunset: {
// //     name: 'Закат',
// //     icon: '🌅',
// //     primary: '#f59e0b',
// //     secondary: '#ef4444',
// //     bg: 'from-slate-950 via-orange-950/20 to-slate-950',
// //     font: "'Inter', sans-serif"
// //   },
// //   ocean: {
// //     name: 'Океан',
// //     icon: '🌊',
// //     primary: '#06b6d4',
// //     secondary: '#0ea5e9',
// //     bg: 'from-slate-950 via-cyan-950/20 to-slate-950',
// //     font: "'Inter', sans-serif"
// //   }
// // };

// // const getRank = (lvl) => {
// //   return [...RANKS].reverse().find(r => lvl >= r.min) || RANKS[0];
// // };

// // const hashPassword = async (password) => {
// //   let hash = 0;
// //   for (let i = 0; i < password.length; i++) {
// //     const char = password.charCodeAt(i);
// //     hash = ((hash << 5) - hash) + char;
// //     hash = hash & hash;
// //   }
// //   return Math.abs(hash).toString(36);
// // };

// // const generateSessionToken = () => {
// //   return Math.random().toString(36).substring(2) + Date.now().toString(36);
// // };

// // // ==================== MAIN COMPONENT ====================
// // const App = () => {
// //   const [isInitialLoading, setIsInitialLoading] = useState(true);
// //   const [isLoggedIn, setIsLoggedIn] = useState(false);
// //   const [showAuthModal, setShowAuthModal] = useState(false);
// //   const [authMode, setAuthMode] = useState('login');
// //   const [authError, setAuthError] = useState('');
// //   const [accounts, setAccounts] = useState({});
// //   const [currentAccount, setCurrentAccount] = useState(null);
// //   const [sessionToken, setSessionToken] = useState(null);
// //   const [rememberMe, setRememberMe] = useState(true);
// //   const [showLogoutModal, setShowLogoutModal] = useState(false);
// //   const [syncStatus, setSyncStatus] = useState('idle');

// //   const [view, setView] = useState('home');
// //   const [content, setContent] = useState([]);
// //   const [trending, setTrending] = useState([]);
// //   const [trendingHeroIdx, setTrendingHeroIdx] = useState(0);
// //   const [selectedItem, setSelectedItem] = useState(null);
// //   const [loading, setLoading] = useState(true);
// //   const [searchQuery, setSearchQuery] = useState('');
// //   const [activeGenre, setActiveGenre] = useState(null);
// //   const [page, setPage] = useState(1);
// //   const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
// //   const [showToast, setShowToast] = useState(false);
// //   const [showAchievement, setShowAchievement] = useState(null);
// //   const [isSettingsOpen, setIsSettingsOpen] = useState(false);
// //   const [sortBy, setSortBy] = useState('popularity');
// //   const [filterYear, setFilterYear] = useState(null);
// //   const [viewMode, setViewMode] = useState('grid');
// //   const [autoPlay, setAutoPlay] = useState(true);
// //   const [isDescOpen, setIsDescOpen] = useState(false);
// //   const [notifications, setNotifications] = useState([]);
// //   const [watchlist, setWatchlist] = useState([]);
// //   const [dailyGoal, setDailyGoal] = useState(3);
// //   const [dailyProgress, setDailyProgress] = useState(0);
  
// //   const fileInputRef = useRef(null);
// //   const saveTimerRef = useRef(null);

// //   const [isDarkMode, setIsDarkMode] = useState(true);
// //   const [currentTheme, setCurrentTheme] = useState('minimal');
// //   const [library, setLibrary] = useState({});
// //   const [history, setHistory] = useState([]);
// //   const [ratings, setRatings] = useState({});
// //   const [achievements, setAchievements] = useState([]);
// //   const [favorites, setFavorites] = useState([]);
// //   const [notes, setNotes] = useState({});
// //   const [user, setUser] = useState({
// //     name: 'Гость',
// //     avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Guest',
// //     bio: 'Добро пожаловать в AniHub! 🌟',
// //     xp: 0,
// //     joinDate: new Date().toISOString(),
// //     lastLogin: null,
// //     loginStreak: 0,
// //     totalLogins: 0
// //   });

// //   const theme = THEMES[currentTheme];

// //  // Initial loading animation
// //   useEffect(() => {
// //     const timer = setTimeout(() => {
// //       setIsInitialLoading(false);
// //     }, 2000);
// //     return () => clearTimeout(timer);
// //   }, []);

// //   useEffect(() => {
// //     const loadFromCloud = async () => {
// //       try {
// //         if (window.storage) {
// //           const cloudAccounts = await window.storage.get('aniHub_accounts_cloud');
// //           if (cloudAccounts?.value) {
// //             const parsed = JSON.parse(cloudAccounts.value);
// //             setAccounts(parsed);
// //             localStorage.setItem('aniHub_accounts_v9', JSON.stringify(parsed));
// //             return parsed;
// //           }
// //         }
// //       } catch (e) {}
// //       const storedAccounts = localStorage.getItem('aniHub_accounts_v9') || localStorage.getItem('aniHub_accounts_v7');
// //       if (storedAccounts) {
// //         const parsed = JSON.parse(storedAccounts);
// //         setAccounts(parsed);
// //         return parsed;
// //       }
// //       return {};
// //     };

// //     loadFromCloud().then(loadedAccounts => {
// //       const storedSession = localStorage.getItem('aniHub_session') || sessionStorage.getItem('aniHub_session');
// //       const storedUsername = localStorage.getItem('aniHub_username') || sessionStorage.getItem('aniHub_username');
      
// //       if (storedSession && storedUsername && loadedAccounts[storedUsername]) {
// //         const session = JSON.parse(storedSession);
// //         if (Date.now() - session.timestamp < SESSION_TIMEOUT) {
// //           autoLoginWithAccounts(storedUsername, session.token, loadedAccounts);
// //         } else {
// //           localStorage.removeItem('aniHub_session');
// //           localStorage.removeItem('aniHub_username');
// //           sessionStorage.removeItem('aniHub_session');
// //           sessionStorage.removeItem('aniHub_username');
// //         }
// //       }
// //     });

// //     checkTimeAchievements();
// //   }, []);

// //   useEffect(() => {
// //     if (trending.length === 0) return;
// //     const interval = setInterval(() => {
// //       setTrendingHeroIdx(prev => (prev + 1) % Math.min(trending.length, 10));
// //     }, 5000);
// //     return () => clearInterval(interval);
// //   }, [trending]);

// //   const userStats = useMemo(() => {
// //     const level = Math.floor(user.xp / 100) + 1;
// //     const currentLevelXP = user.xp % 100;
// //     const totalWatched = Object.values(library).filter(a => a.status === 'completed').length;
// //     const totalRated = Object.keys(ratings).length;
// //     const avgRating = totalRated > 0 
// //       ? (Object.values(ratings).reduce((a, b) => a + b, 0) / totalRated).toFixed(1)
// //       : 0;
// //     const totalHours = Math.round(totalWatched * 4.5);
// //     const genresWatched = new Set(
// //       Object.values(library)
// //         .filter(a => a.status === 'completed')
// //         .flatMap(a => a.genres || [])
// //     ).size;
// //     const totalNotes = Object.keys(notes).filter(k => notes[k].text).length;
// //     const perfectRatings = Object.values(ratings).filter(r => r === 10).length;
// //     const watchingNow = Object.values(library).filter(a => a.status === 'watching').length;

// //     return { 
// //       level, 
// //       xp: currentLevelXP, 
// //       totalXp: user.xp, 
// //       nextLevelAt: 100,
// //       totalWatched,
// //       totalRated,
// //       avgRating,
// //       totalHours,
// //       genresWatched,
// //       totalNotes,
// //       perfectRatings,
// //       librarySize: Object.keys(library).length,
// //       favoritesCount: favorites.length,
// //       watchingNow,
// //       rank: getRank(level)
// //     };
// //   }, [user.xp, library, ratings, notes, favorites]);

// //   const checkTimeAchievements = () => {
// //     const hour = new Date().getHours();
// //     if (hour >= 5 && hour < 7 && !achievements.includes('early_bird')) {
// //       unlockAchievement('early_bird');
// //     }
// //     if ((hour >= 0 && hour < 3) && !achievements.includes('night_owl')) {
// //       unlockAchievement('night_owl');
// //     }
// //   };

// //   const unlockAchievement = (achievementId) => {
// //     if (!isLoggedIn || achievements.includes(achievementId)) return;
// //     const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
// //     if (achievement) {
// //       setAchievements(prev => [...prev, achievementId]);
// //       setUser(prev => ({ ...prev, xp: prev.xp + achievement.xp }));
// //       setShowAchievement(achievement);
// //       setTimeout(() => setShowAchievement(null), 5000);
// //     }
// //   };

// //   const handleRegister = async (username, password, email) => {
// //     setAuthError('');
// //     if (!username || !password) {
// //       setAuthError('Заполните все обязательные поля!');
// //       return;
// //     }
// //     if (accounts[username]) {
// //       setAuthError('Это имя пользователя уже занято!');
// //       return;
// //     }
// //     if (username.length < 3) {
// //       setAuthError('Имя пользователя должно быть не менее 3 символов!');
// //       return;
// //     }
// //     if (password.length < 6) {
// //       setAuthError('Пароль должен быть не менее 6 символов!');
// //       return;
// //     }

// //     const hashedPassword = await hashPassword(password);
// //     const newAccount = {
// //       username,
// //       passwordHash: hashedPassword,
// //       email,
// //       createdAt: new Date().toISOString(),
// //       userData: {
// //         user: {
// //           name: username,
// //           avatar: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${username}`,
// //           bio: `Привет! Я ${username} и я люблю аниме! 🎬`,
// //           xp: 0,
// //           joinDate: new Date().toISOString(),
// //           lastLogin: null,
// //           loginStreak: 0,
// //           totalLogins: 0
// //         },
// //         library: {},
// //         history: [],
// //         ratings: {},
// //         achievements: [],
// //         favorites: [],
// //         notes: {},
// //         watchlist: [],
// //         theme: 'minimal',
// //         isDarkMode: true,
// //         dailyGoal: 3,
// //         dailyProgress: 0
// //       }
// //     };

// //     const updatedAccounts = { ...accounts, [username]: newAccount };
// //     setAccounts(updatedAccounts);
// //     localStorage.setItem('aniHub_accounts_v9', JSON.stringify(updatedAccounts));
    
// //     if (window.storage && CLOUD_SYNC) {
// //       try {
// //         await window.storage.set('aniHub_accounts_cloud', JSON.stringify(updatedAccounts));
// //       } catch (e) {}
// //     }
    
// //     setNotifications(prev => [...prev, {
// //       id: Date.now(),
// //       type: 'success',
// //       message: `Добро пожаловать, ${username}! 🎉`
// //     }]);
    
// //     setTimeout(() => setAuthMode('login'), 1500);
// //   };

// //   const handleLogin = async (username, password) => {
// //     setAuthError('');
// //     if (!username || !password) {
// //       setAuthError('Заполните все поля!');
// //       return;
// //     }

// //     const account = accounts[username];
// //     if (!account) {
// //       setAuthError('Аккаунт не найден!');
// //       return;
// //     }

// //     const hashedPassword = await hashPassword(password);
// //     if (account.passwordHash !== hashedPassword) {
// //       setAuthError('Неверный пароль!');
// //       return;
// //     }

// //     const token = generateSessionToken();
// //     const session = { token, timestamp: Date.now() };
// //     const userData = account.userData;
    
// //     const lastLogin = userData.user.lastLogin;
// //     const now = new Date();
// //     const lastLoginDate = lastLogin ? new Date(lastLogin) : null;
    
// //     let loginStreak = userData.user.loginStreak || 0;
// //     if (lastLoginDate) {
// //       const daysDiff = Math.floor((now - lastLoginDate) / (1000 * 60 * 60 * 24));
// //       if (daysDiff === 1) {
// //         loginStreak++;
// //       } else if (daysDiff > 1) {
// //         loginStreak = 1;
// //       }
// //     } else {
// //       loginStreak = 1;
// //     }

// //     const updatedUser = {
// //       ...userData.user,
// //       lastLogin: now.toISOString(),
// //       loginStreak,
// //       totalLogins: (userData.user.totalLogins || 0) + 1
// //     };

// //     setUser(updatedUser);
// //     setLibrary(userData.library || {});
// //     setHistory(userData.history || []);
// //     setRatings(userData.ratings || {});
// //     setAchievements(userData.achievements || []);
// //     setFavorites(userData.favorites || []);
// //     setNotes(userData.notes || {});
// //     setWatchlist(userData.watchlist || []);
// //     setCurrentTheme(userData.theme || 'minimal');
// //     setIsDarkMode(userData.isDarkMode !== undefined ? userData.isDarkMode : true);
// //     setDailyGoal(userData.dailyGoal || 3);
// //     setDailyProgress(userData.dailyProgress || 0);
// //     setIsLoggedIn(true);
// //     setCurrentAccount(username);
// //     setSessionToken(token);
    
// //     if (rememberMe) {
// //       localStorage.setItem('aniHub_session', JSON.stringify(session));
// //       localStorage.setItem('aniHub_username', username);
// //     } else {
// //       sessionStorage.setItem('aniHub_session', JSON.stringify(session));
// //       sessionStorage.setItem('aniHub_username', username);
// //     }
    
// //     setShowAuthModal(false);
    
// //     if (loginStreak === 7 && !userData.achievements?.includes('week_streak')) {
// //       setTimeout(() => unlockAchievement('week_streak'), 1000);
// //     }
    
// //     setNotifications(prev => [...prev, {
// //       id: Date.now(),
// //       type: 'success',
// //       message: `С возвращением, ${username}! 🎉`
// //     }]);
// //   };

// //   const autoLoginWithAccounts = async (username, token, loadedAccounts) => {
// //     const account = loadedAccounts[username];
// //     if (!account) return;
// //     const userData = account.userData;
// //     setUser(userData.user);
// //     setLibrary(userData.library || {});
// //     setHistory(userData.history || []);
// //     setRatings(userData.ratings || {});
// //     setAchievements(userData.achievements || []);
// //     setFavorites(userData.favorites || []);
// //     setNotes(userData.notes || {});
// //     setWatchlist(userData.watchlist || []);
// //     setCurrentTheme(userData.theme || 'minimal');
// //     setIsDarkMode(userData.isDarkMode !== undefined ? userData.isDarkMode : true);
// //     setDailyGoal(userData.dailyGoal || 3);
// //     setDailyProgress(userData.dailyProgress || 0);
// //     setIsLoggedIn(true);
// //     setCurrentAccount(username);
// //     setSessionToken(token);
// //   };

// //   const handleLogout = () => {
// //     setShowLogoutModal(true);
// //   };

// //   const confirmLogout = () => {
// //     saveUserData();
// //     localStorage.removeItem('aniHub_session');
// //     localStorage.removeItem('aniHub_username');
// //     sessionStorage.removeItem('aniHub_session');
// //     sessionStorage.removeItem('aniHub_username');
// //     setIsLoggedIn(false);
// //     setCurrentAccount(null);
// //     setSessionToken(null);
// //     setShowLogoutModal(false);
// //     setIsProfileModalOpen(false);
// //     setUser({
// //       name: 'Гость',
// //       avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Guest',
// //       bio: 'Добро пожаловать в AniHub! 🌟',
// //       xp: 0,
// //       joinDate: new Date().toISOString(),
// //       lastLogin: null,
// //       loginStreak: 0,
// //       totalLogins: 0
// //     });
// //     setLibrary({});
// //     setHistory([]);
// //     setRatings({});
// //     setAchievements([]);
// //     setFavorites([]);
// //     setNotes({});
// //     setWatchlist([]);
// //     setView('home');
// //     setNotifications(prev => [...prev, {
// //       id: Date.now(),
// //       type: 'info',
// //       message: 'Вы вышли из аккаунта. До встречи! 👋'
// //     }]);
// //   };

// //   const saveUserData = useCallback(async () => {
// //     if (!isLoggedIn || !currentAccount) return;

// //     const updatedAccounts = {
// //       ...accounts,
// //       [currentAccount]: {
// //         ...accounts[currentAccount],
// //         lastLogin: new Date().toISOString(),
// //         userData: {
// //           user,
// //           library,
// //           history,
// //           ratings,
// //           achievements,
// //           favorites,
// //           notes,
// //           watchlist,
// //           theme: currentTheme,
// //           isDarkMode,
// //           dailyGoal,
// //           dailyProgress
// //         }
// //       }
// //     };

// //     setAccounts(updatedAccounts);
// //     localStorage.setItem('aniHub_accounts_v9', JSON.stringify(updatedAccounts));
    
// //     if (window.storage && CLOUD_SYNC) {
// //       try {
// //         setSyncStatus('syncing');
// //         await window.storage.set('aniHub_accounts_cloud', JSON.stringify(updatedAccounts));
// //         setSyncStatus('synced');
// //         setTimeout(() => setSyncStatus('idle'), 3000);
// //       } catch (e) {
// //         setSyncStatus('error');
// //         setTimeout(() => setSyncStatus('idle'), 3000);
// //       }
// //     }
// //   }, [isLoggedIn, currentAccount, user, library, history, ratings, achievements, favorites, notes, watchlist, currentTheme, isDarkMode, dailyGoal, dailyProgress, accounts]);

// //   useEffect(() => {
// //     if (isLoggedIn && currentAccount) {
// //       if (saveTimerRef.current) {
// //         clearTimeout(saveTimerRef.current);
// //       }
      
// //       saveTimerRef.current = setTimeout(() => {
// //         saveUserData();
// //       }, AUTO_SAVE_DELAY);
      
// //       return () => {
// //         if (saveTimerRef.current) {
// //           clearTimeout(saveTimerRef.current);
// //         }
// //       };
// //     }
// //   }, [user, library, history, ratings, achievements, favorites, notes, watchlist, currentTheme, isDarkMode, dailyGoal, dailyProgress, isLoggedIn, currentAccount, saveUserData]);

// //   const checkAchievements = useCallback((type, data) => {
// //     if (!isLoggedIn) return;
    
// //     const newAchievements = [];
    
// //     if (type === 'watch' && userStats.totalWatched === 1 && !achievements.includes('first_anime')) {
// //       newAchievements.push('first_anime');
// //     }
// //     if (type === 'rate' && userStats.totalRated === 10 && !achievements.includes('rate_10')) {
// //       newAchievements.push('rate_10');
// //     }
// //     if (type === 'complete' && userStats.totalWatched === 50 && !achievements.includes('complete_50')) {
// //       newAchievements.push('complete_50');
// //     }
// //     if (type === 'level' && userStats.level === 10 && !achievements.includes('level_10')) {
// //       newAchievements.push('level_10');
// //     }
// //     if (type === 'genre' && userStats.genresWatched === GENRES.length && !achievements.includes('genre_master')) {
// //       newAchievements.push('genre_master');
// //     }
// //     if (type === 'favorite' && userStats.favoritesCount === 20 && !achievements.includes('social')) {
// //       newAchievements.push('social');
// //     }
// //     if (type === 'note' && userStats.totalNotes === 10 && !achievements.includes('reviewer')) {
// //       newAchievements.push('reviewer');
// //     }
// //     if (type === 'library' && userStats.librarySize === 100 && !achievements.includes('collector')) {
// //       newAchievements.push('collector');
// //     }
// //     if (type === 'perfect' && userStats.perfectRatings === 50 && !achievements.includes('perfectionist')) {
// //       newAchievements.push('perfectionist');
// //     }
// //     if (type === 'explorer' && userStats.genresWatched >= GENRES.length && !achievements.includes('explorer')) {
// //       newAchievements.push('explorer');
// //     }

// //     if (newAchievements.length > 0) {
// //       setAchievements(prev => [...prev, ...newAchievements]);
// //       const achievement = ACHIEVEMENTS.find(a => a.id === newAchievements[0]);
// //       if (achievement) {
// //         unlockAchievement(newAchievements[0]);
// //       }
// //     }
// //   }, [achievements, userStats, isLoggedIn]);

// //   const getImg = (item) => {
// //     if (!item?.image) return 'https://via.placeholder.com/225x320?text=No+Image';
// //     const path = item.image.original || (typeof item.image === 'string' ? item.image : '');
// //     return path.startsWith('http') ? path : ASSETS + path;
// //   };

// //   const fetchData = async () => {
// //     setLoading(true);
// //     try {
// //       const endpoint = view === 'manga' ? 'mangas' : 'animes';
// //       let order = sortBy;
// //       let url = `${API}/${endpoint}?limit=24&page=${page}&order=${order}`;
      
// //       if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;
// //       if (activeGenre) url += `&genre=${activeGenre}`;
// //       if (filterYear) url += `&season=${filterYear}`;

// //       const res = await fetch(url);
// //       const data = await res.json();
// //       setContent(Array.isArray(data) ? data : []);

// //       if (trending.length === 0) {
// //         const trendRes = await fetch(`${API}/animes?limit=20&order=popularity`);
// //         const trendData = await trendRes.json();
// //         setTrending(Array.isArray(trendData) ? trendData : []);
// //       }
// //     } catch (err) {
// //       console.error("Ошибка загрузки:", err);
// //       setNotifications(prev => [...prev, {
// //         id: Date.now(),
// //         type: 'error',
// //         message: 'Ошибка загрузки данных'
// //       }]);
// //     } finally {
// //       setTimeout(() => setLoading(false), 300);
// //     }
// //   };

// //   useEffect(() => {
// //     if (view !== 'collection' && view !== 'history' && view !== 'trending_list' && view !== 'favorites' && view !== 'watchlist') {
// //       fetchData();
// //     } else {
// //       setLoading(false);
// //     }
// //   }, [view, searchQuery, activeGenre, page, sortBy, filterYear]);

// //   useEffect(() => {
// //     const fetchDescription = async () => {
// //       if (selectedItem && selectedItem.id && !selectedItem.description) {
// //         try {
// //           const response = await fetch(`${API}/animes/${selectedItem.id}`);
// //           const data = await response.json();
// //           setSelectedItem(prev => ({
// //             ...prev,
// //             description: data.description_html || data.description || "Описание отсутствует.",
// //             genres: data.genres || [],
// //             studios: data.studios || [],
// //             screenshots: data.screenshots || []
// //           }));
// //         } catch (error) {
// //           console.error("Ошибка загрузки описания:", error);
// //         }
// //       }
// //     };
// //     fetchDescription();
// //   }, [selectedItem?.id]);

// //   const handleRating = (item, score) => {
// //     if (!isLoggedIn) {
// //       setShowAuthModal(true);
// //       setNotifications(prev => [...prev, {
// //         id: Date.now(),
// //         type: 'warning',
// //         message: 'Войдите в аккаунт!'
// //       }]);
// //       return;
// //     }
    
// //     setRatings(prev => ({ ...prev, [item.id]: score }));
// //     if (!library[item.id]) updateLibraryStatus(item, 'planned');
// //     setUser(prev => ({ ...prev, xp: prev.xp + 5 }));
// //     checkAchievements('rate', { score });
// //     if (score === 10) checkAchievements('perfect', {});
    
// //     setNotifications(prev => [...prev, {
// //       id: Date.now(),
// //       type: 'success',
// //       message: `Оценка ${score}/10 добавлена (+5 XP)`
// //     }]);
// //   };

// //   const addToHistory = (item) => {
// //     const newItem = { 
// //       ...item, 
// //       date: new Date().toLocaleString('ru-RU'), 
// //       timestamp: Date.now() 
// //     };
// //     setHistory(prev => [newItem, ...prev.filter(h => h.id !== item.id)].slice(0, 100));
    
// //     if (isLoggedIn) {
// //       setUser(prev => ({ ...prev, xp: prev.xp + 2 }));
      
// //       const today = new Date().toDateString();
// //       const lastProgressDate = localStorage.getItem('lastProgressDate');
      
// //       if (lastProgressDate !== today) {
// //         setDailyProgress(1);
// //         localStorage.setItem('lastProgressDate', today);
// //       } else {
// //         setDailyProgress(prev => Math.min(prev + 1, dailyGoal));
// //       }
// //     }
// //   };

// //   const updateLibraryStatus = (item, status) => {
// //     if (!isLoggedIn) {
// //       setShowAuthModal(true);
// //       setNotifications(prev => [...prev, {
// //         id: Date.now(),
// //         type: 'warning',
// //         message: 'Войдите в аккаунт!'
// //       }]);
// //       return;
// //     }
    
// //     const wasCompleted = library[item.id]?.status === 'completed';
// //     const isCompleting = status === 'completed' && !wasCompleted;
    
// //     setLibrary(prev => ({ 
// //       ...prev, 
// //       [item.id]: { 
// //         ...item, 
// //         status, 
// //         addedDate: new Date().toISOString(),
// //         genres: item.genres || []
// //       } 
// //     }));
    
// //     const xpGain = isCompleting ? 25 : 10;
// //     setUser(prev => ({ ...prev, xp: prev.xp + xpGain }));
    
// //     if (isCompleting) {
// //       checkAchievements('complete', { item });
// //       checkAchievements('genre', {});
// //       checkAchievements('explorer', {});
// //     }
// //     checkAchievements('library', {});
    
// //     const statusLabels = {
// //       watching: 'Смотрю',
// //       planned: 'В планах',
// //       completed: 'Завершено'
// //     };
    
// //     setNotifications(prev => [...prev, {
// //       id: Date.now(),
// //       type: 'success',
// //       message: `${statusLabels[status]} (+${xpGain} XP)`
// //     }]);
// //   };

// //   const toggleFavorite = (item) => {
// //     if (!isLoggedIn) {
// //       setShowAuthModal(true);
// //       return;
// //     }
    
// //     setFavorites(prev => {
// //       const exists = prev.find(f => f.id === item.id);
// //       if (exists) {
// //         setNotifications(prevNot => [...prevNot, {
// //           id: Date.now(),
// //           type: 'info',
// //           message: `Удалено из избранного`
// //         }]);
// //         return prev.filter(f => f.id !== item.id);
// //       } else {
// //         setUser(prevUser => ({ ...prevUser, xp: prevUser.xp + 5 }));
// //         checkAchievements('favorite', {});
// //         setNotifications(prevNot => [...prevNot, {
// //           id: Date.now(),
// //           type: 'success',
// //           message: `Добавлено в избранное (+5 XP)`
// //         }]);
// //         return [...prev, { ...item, favoritedDate: new Date().toISOString() }];
// //       }
// //     });
// //   };

// //   const toggleWatchlist = (item) => {
// //     if (!isLoggedIn) {
// //       setShowAuthModal(true);
// //       return;
// //     }
    
// //     setWatchlist(prev => {
// //       const exists = prev.find(w => w.id === item.id);
// //       if (exists) {
// //         return prev.filter(w => w.id !== item.id);
// //       } else {
// //         setUser(prevUser => ({ ...prevUser, xp: prevUser.xp + 3 }));
// //         return [...prev, { ...item, addedDate: new Date().toISOString() }];
// //       }
// //     });
// //   };

// //   const addNote = (itemId, noteText) => {
// //     if (!isLoggedIn) return;
// //     setNotes(prev => ({
// //       ...prev,
// //       [itemId]: { text: noteText, date: new Date().toISOString() }
// //     }));
// //     if (noteText && !notes[itemId]?.text) checkAchievements('note', {});
// //   };

// //   const handleAvatarChange = (e) => {
// //     const file = e.target.files[0];
// //     if (file) {
// //       if (file.size > 5000000) {
// //         setNotifications(prev => [...prev, {
// //           id: Date.now(),
// //           type: 'error',
// //           message: 'Файл слишком большой!'
// //         }]);
// //         return;
// //       }
// //       const reader = new FileReader();
// //       reader.onloadend = () => {
// //         setUser({ ...user, avatar: reader.result });
// //         setNotifications(prev => [...prev, {
// //           id: Date.now(),
// //           type: 'success',
// //           message: 'Аватар обновлен!'
// //         }]);
// //       };
// //       reader.readAsDataURL(file);
// //     }
// //   };

// //   const getStatusLabel = (id) => {
// //     const map = { watching: 'Смотрю', planned: 'В планах', completed: 'Завершено' };
// //     return library[id]?.status ? map[library[id].status] : null;
// //   };

// //   const exportData = () => {
// //     if (!isLoggedIn) {
// //       setNotifications(prev => [...prev, {
// //         id: Date.now(),
// //         type: 'warning',
// //         message: 'Войдите в аккаунт!'
// //       }]);
// //       return;
// //     }
    
// //     const data = {
// //       version: STORAGE_VERSION,
// //       exportDate: new Date().toISOString(),
// //       account: currentAccount,
// //       user,
// //       library,
// //       history,
// //       ratings,
// //       achievements,
// //       favorites,
// //       notes,
// //       watchlist,
// //       theme: currentTheme,
// //       isDarkMode,
// //       dailyGoal,
// //       dailyProgress
// //     };
    
// //     const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
// //     const url = URL.createObjectURL(blob);
// //     const a = document.createElement('a');
// //     a.href = url;
// //     a.download = `anihub-${currentAccount}-${Date.now()}.json`;
// //     a.click();
// //     URL.revokeObjectURL(url);
    
// //     setNotifications(prev => [...prev, {
// //       id: Date.now(),
// //       type: 'success',
// //       message: 'Данные экспортированы ✅'
// //     }]);
// //   };

// //   const importData = (e) => {
// //     const file = e.target.files[0];
// //     if (file) {
// //       const reader = new FileReader();
// //       reader.onload = (event) => {
// //         try {
// //           const data = JSON.parse(event.target.result);
          
// //           if (data.user) setUser(data.user);
// //           if (data.library) setLibrary(data.library);
// //           if (data.history) setHistory(data.history);
// //           if (data.ratings) setRatings(data.ratings);
// //           if (data.achievements) setAchievements(data.achievements);
// //           if (data.favorites) setFavorites(data.favorites);
// //           if (data.notes) setNotes(data.notes);
// //           if (data.watchlist) setWatchlist(data.watchlist);
// //           if (data.theme) setCurrentTheme(data.theme);
// //           if (data.isDarkMode !== undefined) setIsDarkMode(data.isDarkMode);
// //           if (data.dailyGoal) setDailyGoal(data.dailyGoal);
// //           if (data.dailyProgress !== undefined) setDailyProgress(data.dailyProgress);
          
// //           setNotifications(prev => [...prev, {
// //             id: Date.now(),
// //             type: 'success',
// //             message: 'Данные импортированы ✅'
// //           }]);
// //         } catch (err) {
// //           setNotifications(prev => [...prev, {
// //             id: Date.now(),
// //             type: 'error',
// //             message: 'Ошибка импорта ❌'
// //           }]);
// //         }
// //       };
// //       reader.readAsText(file);
// //     }
// //   };

// //   const displayContent = () => {
// //     if (view === 'collection') return Object.values(library);
// //     if (view === 'history') return history;
// //     if (view === 'trending_list') return trending;
// //     if (view === 'favorites') return favorites;
// //     if (view === 'watchlist') return watchlist;
// //     return content;
// //   };

// //   const finalContent = displayContent();

// //   const randomAnime = () => {
// //     if (content.length > 0) {
// //       const random = content[Math.floor(Math.random() * content.length)];
// //       setSelectedItem(random);
// //       addToHistory(random);
// //     }
// //   };

// //   const deleteAccount = () => {
// //     if (!isLoggedIn || !currentAccount) return;
    
// //     if (confirm('ВЫ УВЕРЕНЫ? Это удалит ваш аккаунт и все данные НАВСЕГДА!')) {
// //       if (confirm('ПОСЛЕДНЕЕ ПРЕДУПРЕЖДЕНИЕ! Восстановление невозможно. Продолжить?')) {
// //         const updatedAccounts = { ...accounts };
// //         delete updatedAccounts[currentAccount];
// //         localStorage.setItem('aniHub_accounts_v9', JSON.stringify(updatedAccounts));
// //         handleLogout();
// //         setNotifications(prev => [...prev, {
// //           id: Date.now(),
// //           type: 'info',
// //           message: 'Аккаунт удален 👋'
// //         }]);
// //       }
// //     }
// //   };

// //   useEffect(() => {
// //     if (notifications.length > 0) {
// //       const timer = setTimeout(() => {
// //         setNotifications(prev => prev.slice(1));
// //       }, 4000);
// //       return () => clearTimeout(timer);
// //     }
// //   }, [notifications]);

// //   // Loading Screen
// //   if (isInitialLoading) {
// //     return (
// //       <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
// //         <div className="text-center">
// //           <div className="w-24 h-24 mx-auto mb-6 relative">
// //             <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 animate-pulse" />
// //             <img 
// //               src={logo} 
// //               alt="AniHub"
// //               className="relative w-full h-full object-cover rounded-3xl mix-blend-overlay"
// //             />
// //           </div>
// //           <h1 className="text-4xl font-black mb-4 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
// //             AniHub
// //           </h1>
// //           <div className="flex gap-2 justify-center">
// //             <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0ms' }} />
// //             <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '150ms' }} />
// //             <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '300ms' }} />
// //           </div>
// //         </div>
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className={`min-h-screen transition-all duration-500 ${
// //       isDarkMode 
// //         ? `bg-gradient-to-br ${theme.bg} text-white` 
// //         : 'bg-gradient-to-br from-slate-50 via-white to-slate-100 text-slate-900'
// //     }`} style={{ fontFamily: theme.font }}>
      
// //       <style>{`
// //         @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        
// //         * { 
// //           font-family: ${theme.font};
// //           -webkit-tap-highlight-color: transparent;
// //         }
        
// //         html { scroll-behavior: smooth; }
        
// //         img { 
// //           user-select: none;
// //           -webkit-user-drag: none;
// //         }
        
// //         @keyframes fadeIn {
// //           from { opacity: 0; transform: translateY(10px); }
// //           to { opacity: 1; transform: translateY(0); }
// //         }
        
// //         @keyframes slideIn {
// //           from { transform: translateX(-20px); opacity: 0; }
// //           to { transform: translateX(0); opacity: 1; }
// //         }
        
// //         @keyframes slideInRight {
// //           from { transform: translateX(20px); opacity: 0; }
// //           to { transform: translateX(0); opacity: 1; }
// //         }
        
// //         @keyframes slideDown {
// //           from { transform: translateY(-20px); opacity: 0; }
// //           to { transform: translateY(0); opacity: 1; }
// //         }
        
// //         @keyframes scroll {
// //           0% { transform: translateX(0); }
// //           100% { transform: translateX(calc(-280px * 20)); }
// //         }
        
// //         @keyframes syncPing {
// //           0% { transform: scale(0.8); opacity: 1; }
// //           100% { transform: scale(2); opacity: 0; }
// //         }
        
// //         @keyframes float3d {
// //           0%, 100% { transform: translateY(0px) rotateX(0deg); }
// //           50% { transform: translateY(-5px) rotateX(5deg); }
// //         }
        
// //         .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
// //         .animate-slide-in { animation: slideIn 0.3s ease-out forwards; }
// //         .animate-slide-in-right { animation: slideInRight 0.3s ease-out forwards; }
// //         .animate-slide-down { animation: slideDown 0.3s ease-out forwards; }
// //         .animate-sync-ping { animation: syncPing 1s ease-out infinite; }
        
// //         .animate-infinite-scroll {
// //           display: flex;
// //           width: max-content;
// //           animation: scroll 60s linear infinite;
// //           will-change: transform;
// //         }
        
// //         .animate-infinite-scroll:hover { animation-play-state: paused; }
        
// //         .glass {
// //           backdrop-filter: blur(12px);
// //           background: ${isDarkMode ? 'rgba(15, 23, 42, 0.5)' : 'rgba(255, 255, 255, 0.7)'};
// //           border: 1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'};
// //         }
        
// //         .glass-strong {
// //           backdrop-filter: blur(16px);
// //           background: ${isDarkMode ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.9)'};
// //           border: 1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'};
// //         }
        
// //         .no-scrollbar::-webkit-scrollbar { display: none; }
// //         .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
// //         ::-webkit-scrollbar { width: 6px; height: 6px; }
// //         ::-webkit-scrollbar-track { background: transparent; }
// //         ::-webkit-scrollbar-thumb {
// //           background: ${theme.primary};
// //           border-radius: 10px;
// //         }
        
// //         .card-hover {
// //           transition: all 0.2s ease;
// //         }
        
// //         .card-hover:hover {
// //           transform: translateY(-4px);
// //         }
        
// //         /* 3D Icon Styles */
// //         .icon-3d {
// //           display: inline-block;
// //           font-style: normal;
// //           text-shadow: 
// //             1px 1px 0px rgba(0,0,0,0.2),
// //             2px 2px 0px rgba(0,0,0,0.15),
// //             3px 3px 0px rgba(0,0,0,0.1),
// //             0 0 10px rgba(255,255,255,0.3);
// //           transform: perspective(500px) rotateX(10deg);
// //           transition: all 0.3s ease;
// //         }
        
// //         .icon-3d:hover {
// //           transform: perspective(500px) rotateX(0deg) translateY(-2px);
// //           text-shadow: 
// //             1px 1px 0px rgba(0,0,0,0.3),
// //             2px 2px 0px rgba(0,0,0,0.2),
// //             3px 3px 0px rgba(0,0,0,0.15),
// //             4px 4px 0px rgba(0,0,0,0.1),
// //             0 0 15px rgba(255,255,255,0.5);
// //           animation: float3d 2s ease-in-out infinite;
// //         }
        
// //         .icon-3d-button {
// //           display: inline-flex;
// //           align-items: center;
// //           justify-content: center;
// //           transform: perspective(1000px) translateZ(0);
// //           transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
// //           position: relative;
// //         }
        
// //         .icon-3d-button::before {
// //           content: '';
// //           position: absolute;
// //           inset: 0;
// //           border-radius: inherit;
// //           background: linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 50%);
// //           opacity: 0;
// //           transition: opacity 0.3s ease;
// //         }
        
// //         .icon-3d-button:hover {
// //           transform: perspective(1000px) translateZ(20px) rotateX(5deg);
// //           box-shadow: 
// //             0 10px 30px rgba(0,0,0,0.3),
// //             inset 0 1px 0 rgba(255,255,255,0.2);
// //         }
        
// //         .icon-3d-button:hover::before {
// //           opacity: 1;
// //         }
        
// //         .icon-3d-button:active {
// //           transform: perspective(1000px) translateZ(10px) rotateX(2deg);
// //         }
        
// //         @media (max-width: 768px) {
// //           .glass { backdrop-filter: blur(8px); }
// //           .glass-strong { backdrop-filter: blur(12px); }
// //           .icon-3d {
// //             text-shadow: 
// //               1px 1px 0px rgba(0,0,0,0.2),
// //               2px 2px 0px rgba(0,0,0,0.15);
// //           }
// //         }
// //       `}</style>

// //       {/* Notifications */}
// //       <div className="fixed top-20 right-4 z-[10001] space-y-2 max-w-sm">
// //         {notifications.map((notif, idx) => (
// //           <div
// //             key={notif.id}
// //             className="animate-slide-in-right glass-strong p-3 rounded-lg shadow-lg"
// //             style={{
// //               borderLeft: `3px solid ${notif.type === 'error' ? '#ef4444' : notif.type === 'warning' ? '#f59e0b' : notif.type === 'success' ? '#10b981' : theme.primary}`,
// //               animationDelay: `${idx * 0.1}s`
// //             }}
// //           >
// //             <div className="flex items-center gap-2">
// //               <span className="text-lg icon-3d">
// //                 {notif.type === 'error' ? '❌' : notif.type === 'warning' ? '⚠️' : notif.type === 'success' ? '✅' : 'ℹ️'}
// //               </span>
// //               <p className="text-xs font-medium">{notif.message}</p>
// //             </div>
// //           </div>
// //         ))}
// //       </div>

// //       {/* Daily Goal */}
// //       {isLoggedIn && (
// //         <div className="fixed bottom-4 left-4 z-[1000] glass-strong p-3 rounded-lg w-56 animate-slide-in">
// //           <div className="flex items-center justify-between mb-2">
// //             <p className="text-[10px] font-semibold opacity-70">Дневная цель</p>
// //             <span className="text-xs font-bold" style={{ color: theme.primary }}>
// //               {dailyProgress}/{dailyGoal}
// //             </span>
// //           </div>
// //           <div className="h-1.5 bg-black/20 rounded-full overflow-hidden">
// //             <div
// //               className="h-full transition-all duration-500"
// //               style={{
// //                 width: `${Math.min((dailyProgress / dailyGoal) * 100, 100)}%`,
// //                 background: theme.primary
// //               }}
// //             />
// //           </div>
// //         </div>
// //       )}

// //       {/* Header */}
// //       <header className="sticky top-0 z-[1000] glass-strong border-b animate-slide-down"
// //         style={{ borderColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }}>
// //         <div className="max-w-[1920px] mx-auto px-4 md:px-6 py-3 flex items-center justify-between gap-3">
// //           <div className="flex items-center gap-4 shrink-0">
// //             <div 
// //               onClick={() => { setView('home'); setPage(1); setActiveGenre(null); setSearchQuery(''); }} 
// //               className="flex items-center gap-2 cursor-pointer group"
// //             >
// //               <div className="relative w-9 h-9 rounded-lg overflow-hidden" 
// //                 style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})` }}>
// //                 <img 
// //                   src={logo} 
// //                   alt="AniHub"
// //                   className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300 mix-blend-overlay"
// //                 />
// //               </div>
// //               <h1 className="text-xl font-black tracking-tight hidden sm:block">
// //                 Ani<span style={{ color: theme.primary }}>Hub</span>
// //               </h1>
// //             </div>

// //             <nav className="hidden lg:flex gap-2">
// //               {[
// //                 { key: 'home', label: 'Главная', icon: '🏠' },
// //                 { key: 'manga', label: 'Манга', icon: '📚' },
// //                 { key: 'trending_list', label: 'Тренды', icon: '🔥' },
// //                 { key: 'favorites', label: 'Избранное', icon: '❤️' },
// //                 { key: 'collection', label: 'Коллекция', icon: '📁' },
// //                 { key: 'history', label: 'История', icon: '📜' }
// //               ].map(m => (
// //                 <button
// //                   key={m.key}
// //                   onClick={() => setView(m.key)}
// //                   className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all icon-3d-button ${
// //                     view === m.key ? 'text-white' : 'opacity-60 hover:opacity-100'
// //                   }`}
// //                   style={{
// //                     background: view === m.key ? theme.primary : 'transparent'
// //                   }}
// //                 >
// //                   <span className="icon-3d mr-1">{m.icon}</span>
// //                   {m.label}
// //                 </button>
// //               ))}
// //             </nav>
// //           </div>

// //           <div className="flex-1 max-w-md mx-2">
// //             <input
// //               type="text"
// //               placeholder="🔍 Поиск..."
// //               value={searchQuery}
// //               onChange={(e) => setSearchQuery(e.target.value)}
// //               className="w-full py-2 px-4 rounded-lg glass border transition-all text-sm font-medium"
// //               style={{
// //                 borderColor: searchQuery ? theme.primary : 'transparent'
// //               }}
// //             />
// //           </div>

// //           <div className="flex items-center gap-2 shrink-0">
// //             <button 
// //               onClick={randomAnime}
// //               className="hidden sm:flex items-center justify-center w-9 h-9 glass rounded-lg hover:scale-105 transition-all text-lg icon-3d-button"
// //             >
// //               <span className="icon-3d">🎲</span>
// //             </button>

// //             {isLoggedIn && (
// //               <div className="hidden sm:flex items-center gap-1.5 glass px-2.5 py-1.5 rounded-lg">
// //                 <div className="relative w-2 h-2">
// //                   <div 
// //                     className={`absolute inset-0 rounded-full ${syncStatus === 'syncing' ? 'animate-sync-ping' : ''}`}
// //                     style={{ 
// //                       background: syncStatus === 'synced' ? '#10b981' : syncStatus === 'error' ? '#ef4444' : syncStatus === 'syncing' ? theme.primary : '#64748b',
// //                     }}
// //                   />
// //                 </div>
// //                 <span className="text-[9px] font-semibold opacity-60">
// //                   {syncStatus === 'synced' ? 'Synced' : syncStatus === 'syncing' ? 'Syncing' : syncStatus === 'error' ? 'Error' : 'Cloud'}
// //                 </span>
// //               </div>
// //             )}
            
// //             {!isLoggedIn ? (
// //               <button 
// //                 onClick={() => setShowAuthModal(true)}
// //                 className="px-4 py-2 rounded-lg font-semibold text-sm text-white hover:scale-105 transition-all"
// //                 style={{ background: theme.primary }}
// //               >
// //                 Войти
// //               </button>
// //             ) : (
// //               <>
// //                 <button 
// //                   onClick={() => setIsSettingsOpen(true)}
// //                   className="w-9 h-9 rounded-lg glass flex items-center justify-center hover:scale-105 transition-all icon-3d-button"
// //                 >
// //                   <span className="icon-3d">⚙️</span>
// //                 </button>
                
// //                 <div 
// //                   onClick={() => setIsProfileModalOpen(true)} 
// //                   className="relative cursor-pointer group"
// //                 >
// //                   <img 
// //                     src={user.avatar} 
// //                     className="w-9 h-9 rounded-lg object-cover border-2 group-hover:scale-110 transition-transform" 
// //                     style={{ borderColor: theme.primary }}
// //                     alt="Avatar" 
// //                   />
// //                   {achievements.length > 0 && (
// //                     <div 
// //                       className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold text-white"
// //                       style={{ background: theme.primary }}
// //                     >
// //                       {achievements.length}
// //                     </div>
// //                   )}
// //                 </div>
// //               </>
// //             )}
// //           </div>
// //         </div>

// //         {/* Mobile Nav */}
// //         <div className="lg:hidden flex overflow-x-auto no-scrollbar gap-1 px-3 py-2 border-t"
// //           style={{ borderColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
// //           {[
// //             { key: 'home', label: 'Главная', icon: '🏠' },
// //             { key: 'manga', label: 'Манга', icon: '📚' },
// //             { key: 'trending_list', label: 'Тренды', icon: '🔥' },
// //             { key: 'favorites', label: 'Избранное', icon: '❤️' },
// //             { key: 'collection', label: 'Коллекция', icon: '📁' },
// //             { key: 'watchlist', label: 'Список', icon: '📋' },
// //             { key: 'history', label: 'История', icon: '📜' }
// //           ].map(m => (
// //             <button
// //               key={m.key}
// //               onClick={() => setView(m.key)}
// //               className={`text-[10px] font-semibold whitespace-nowrap px-3 py-1.5 rounded-lg transition-all icon-3d-button ${
// //                 view === m.key ? 'text-white' : 'opacity-60'
// //               }`}
// //               style={{
// //                 background: view === m.key ? theme.primary : 'rgba(255,255,255,0.05)'
// //               }}
// //             >
// //               <span className="icon-3d">{m.icon}</span> {m.label}
// //             </button>
// //           ))}
// //         </div>
// //       </header>

// //       {/* Auth Modal */}
// //       {showAuthModal && (
// //         <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fade-in">
// //           <div className="relative w-full max-w-md glass-strong rounded-2xl p-6">
// //             <button 
// //               onClick={() => { setShowAuthModal(false); setAuthError(''); }} 
// //               className="absolute top-4 right-4 text-xl opacity-50 hover:opacity-100 transition-opacity"
// //             >
// //               ×
// //             </button>
            
// //             <div className="flex items-center justify-center gap-3 mb-6">
// //               <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
// //                    style={{ background: theme.primary }}>
// //                 {authMode === 'login' ? '🔐' : '✨'}
// //               </div>
// //               <h2 className="text-2xl font-black">
// //                 {authMode === 'login' ? 'Вход' : 'Регистрация'}
// //               </h2>
// //             </div>

// //             {authError && (
// //               <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-400 text-sm font-medium text-center animate-fade-in">
// //                 {authError}
// //               </div>
// //             )}

// //             <AuthForm 
// //               mode={authMode}
// //               onLogin={handleLogin}
// //               onRegister={handleRegister}
// //               theme={theme}
// //               isDarkMode={isDarkMode}
// //               rememberMe={rememberMe}
// //               setRememberMe={setRememberMe}
// //             />

// //             <div className="mt-4 text-center">
// //               <button
// //                 onClick={() => { setAuthMode(authMode === 'login' ? 'register' : 'login'); setAuthError(''); }}
// //                 className="text-xs opacity-70 hover:opacity-100 transition-opacity font-medium"
// //                 style={{ color: theme.primary }}
// //               >
// //                 {authMode === 'login' ? '✨ Нет аккаунта? Регистрация' : '🔐 Есть аккаунт? Войти'}
// //               </button>
// //             </div>
// //           </div>
// //         </div>
// //       )}

// //       {/* Trending Hero */}
// //       {view === 'home' && !searchQuery && page === 1 && trending.length > 0 && (
// //         <section className="animate-fade-in mb-6">
// //           <div className="py-3 px-4 md:px-6 flex items-center justify-between">
// //             <h3 className="text-base md:text-lg font-bold">
// //               🔥 В тренде
// //             </h3>
// //             <button 
// //               onClick={() => setView('trending_list')}
// //               className="text-xs font-medium opacity-60 hover:opacity-100 transition-opacity"
// //               style={{ color: theme.primary }}
// //             >
// //               Все →
// //             </button>
// //           </div>

// //           <div className="relative overflow-hidden pb-4">
// //             <div className="animate-infinite-scroll flex gap-3 px-4">
// //               {[...trending, ...trending].map((item, i) => (
// //                 <div 
// //                   key={`${item.id}-${i}`} 
// //                   onClick={() => { setSelectedItem(item); addToHistory(item); }} 
// //                   className="w-32 md:w-40 group cursor-pointer shrink-0 card-hover"
// //                 >
// //                   <div className="relative aspect-[3/4] rounded-lg overflow-hidden glass border"
// //                     style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
// //                     <img 
// //                       src={getImg(item)} 
// //                       className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
// //                       alt=""
// //                       loading="lazy"
// //                     />
// //                     <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
// //                     <div className="absolute bottom-2 left-2 right-2">
// //                       <div className="flex items-center gap-1 mb-1">
// //                         <span className="px-1.5 py-0.5 rounded text-[8px] font-bold text-white"
// //                           style={{ background: theme.primary }}>
// //                           #{i % 20 + 1}
// //                         </span>
// //                         {item.score && (
// //                           <span className="text-[8px] font-bold text-yellow-400">⭐{item.score}</span>
// //                         )}
// //                       </div>
// //                       <h4 className="text-[9px] font-bold text-white truncate">
// //                         {item.russian || item.name}
// //                       </h4>
// //                     </div>
// //                   </div>
// //                 </div>
// //               ))}
// //             </div>
// //           </div>
// //         </section>
// //       )}

// //       {/* Main Content */}
// //       <div className="max-w-[1920px] mx-auto px-4 md:px-6 py-4 flex flex-col lg:flex-row gap-6">
// //         {/* Sidebar */}
// //         <aside className="w-full lg:w-60 shrink-0 space-y-3 animate-slide-in">
// //           <div className="glass-strong p-4 rounded-xl sticky top-20">
// //             <div className="flex items-center justify-between mb-3">
// //               <p className="text-[10px] font-semibold opacity-50">Фильтры</p>
// //               <button 
// //                 onClick={() => { setActiveGenre(null); setFilterYear(null); setSortBy('popularity'); }}
// //                 className="text-[10px] font-semibold opacity-50 hover:opacity-100"
// //                 style={{ color: theme.primary }}
// //               >
// //                 Сбросить
// //               </button>
// //             </div>

// //             <div className="mb-3">
// //               <p className="text-[9px] font-semibold opacity-50 mb-2">Сортировка</p>
// //               <div className="grid grid-cols-2 gap-1.5">
// //                 {[
// //                   { value: 'popularity', label: 'Популярность', icon: '🔥' },
// //                   { value: 'ranked', label: 'Рейтинг', icon: '⭐' },
// //                   { value: 'aired_on', label: 'Дата', icon: '📅' },
// //                   { value: 'name', label: 'Название', icon: '🔤' }
// //                 ].map(sort => (
// //                   <button
// //                     key={sort.value}
// //                     onClick={() => setSortBy(sort.value)}
// //                     className={`py-1.5 rounded-lg text-[9px] font-semibold transition-all ${
// //                       sortBy === sort.value ? 'text-white' : 'opacity-60'
// //                     }`}
// //                     style={{
// //                       background: sortBy === sort.value ? theme.primary : 'rgba(255,255,255,0.05)'
// //                     }}
// //                   >
// //                     {sort.icon}
// //                   </button>
// //                 ))}
// //               </div>
// //             </div>

// //             <div>
// //               <p className="text-[9px] font-semibold opacity-50 mb-2">Жанры</p>
// //               <div className="space-y-1.5 max-h-60 overflow-y-auto no-scrollbar">
// //                 <button 
// //                   onClick={() => setActiveGenre(null)} 
// //                   className={`w-full py-1.5 rounded-lg text-[10px] font-semibold transition-all icon-3d-button ${
// //                     !activeGenre ? 'text-white' : 'opacity-60'
// //                   }`}
// //                   style={{
// //                     background: !activeGenre ? theme.primary : 'rgba(255,255,255,0.05)'
// //                   }}
// //                 >
// //                   <span className="icon-3d">🧩</span> Все
// //                 </button>
                
// //                 {GENRES.map(g => (
// //                   <button 
// //                     key={g.id} 
// //                     onClick={() => setActiveGenre(g.id)} 
// //                     className={`w-full py-1.5 rounded-lg text-[10px] font-semibold transition-all icon-3d-button ${
// //                       activeGenre === g.id ? 'text-white' : 'opacity-60'
// //                     }`}
// //                     style={{
// //                       background: activeGenre === g.id ? theme.primary : 'rgba(255,255,255,0.05)'
// //                     }}
// //                   >
// //                     <span className="icon-3d">{g.icon}</span> {g.name}
// //                   </button>
// //                 ))}
// //               </div>
// //             </div>

// //             {isLoggedIn && (
// //               <div className="mt-3 p-3 glass rounded-lg">
// //                 <p className="text-[9px] font-semibold mb-2 opacity-50">Статистика</p>
// //                 <div className="space-y-1 text-[10px]">
// //                   <div className="flex justify-between">
// //                     <span className="opacity-70">Уровень:</span>
// //                     <span className="font-bold" style={{ color: theme.primary }}>{userStats.level}</span>
// //                   </div>
// //                   <div className="flex justify-between">
// //                     <span className="opacity-70">XP:</span>
// //                     <span className="font-bold">{userStats.totalXp}</span>
// //                   </div>
// //                   <div className="flex justify-between">
// //                     <span className="opacity-70">Завершено:</span>
// //                     <span className="font-bold">{userStats.totalWatched}</span>
// //                   </div>
// //                 </div>
// //               </div>
// //             )}
// //           </div>
// //         </aside>

// //         {/* Main Grid */}
// //         <main className="flex-1 animate-fade-in">
// //           <div className="flex flex-col md:flex-row items-center justify-between mb-4 gap-3">
// //             <div>
// //               <h2 className="text-2xl md:text-3xl font-black">
// //                 {view === 'history' ? '📜 История' : 
// //                  view === 'collection' ? '📁 Коллекция' : 
// //                  view === 'manga' ? '📚 Манга' : 
// //                  view === 'trending_list' ? '🔥 Тренды' : 
// //                  view === 'favorites' ? '❤️ Избранное' : 
// //                  view === 'watchlist' ? '📋 Список просмотра' :
// //                  '🎬 Каталог'}
// //               </h2>
// //               <p className="text-xs opacity-60">
// //                 <span className="font-bold" style={{ color: theme.primary }}>{finalContent.length}</span> результатов
// //               </p>
// //             </div>

// //             <div className="flex items-center gap-2">
// //               <div className="flex gap-1 glass p-1 rounded-lg">
// //                 <button
// //                   onClick={() => setViewMode('grid')}
// //                   className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
// //                     viewMode === 'grid' ? 'text-white' : 'opacity-60'
// //                   }`}
// //                   style={{
// //                     background: viewMode === 'grid' ? theme.primary : undefined
// //                   }}
// //                 >
// //                   ⊞
// //                 </button>
// //                 <button
// //                   onClick={() => setViewMode('list')}
// //                   className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
// //                     viewMode === 'list' ? 'text-white' : 'opacity-60'
// //                   }`}
// //                   style={{
// //                     background: viewMode === 'list' ? theme.primary : undefined
// //                   }}
// //                 >
// //                   ☰
// //                 </button>
// //               </div>

// //               {['home', 'manga', 'top'].includes(view) && (
// //                 <div className="flex items-center gap-2 glass p-1 rounded-lg">
// //                   <button 
// //                     onClick={() => setPage(p => Math.max(1, p - 1))} 
// //                     className="w-7 h-7 rounded-lg glass flex items-center justify-center hover:scale-110 transition-all"
// //                     disabled={page === 1}
// //                   >
// //                     ‹
// //                   </button>
// //                   <div 
// //                     className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs text-white"
// //                     style={{ background: theme.primary }}
// //                   >
// //                     {page}
// //                   </div>
// //                   <button 
// //                     onClick={() => setPage(p => p + 1)} 
// //                     className="w-7 h-7 rounded-lg glass flex items-center justify-center hover:scale-110 transition-all"
// //                   >
// //                     ›
// //                   </button>
// //                 </div>
// //               )}
// //             </div>
// //           </div>

// //           {loading ? (
// //             <div className={viewMode === 'grid' 
// //               ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3" 
// //               : "space-y-3"
// //             }>
// //               {[...Array(10)].map((_, i) => (
// //                 <div 
// //                   key={i} 
// //                   className={viewMode === 'grid'
// //                     ? "aspect-[3/4] rounded-lg glass animate-pulse"
// //                     : "h-20 rounded-lg glass animate-pulse"
// //                   } 
// //                 />
// //               ))}
// //             </div>
// //           ) : viewMode === 'grid' ? (
// //             <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
// //               {finalContent.map((item, idx) => (
// //                 <div 
// //                   key={`${item.id}-${idx}`} 
// //                   onClick={() => { setSelectedItem(item); addToHistory(item); }} 
// //                   className="group relative cursor-pointer animate-fade-in card-hover"
// //                   style={{ animationDelay: `${idx * 0.02}s` }}
// //                 >
// //                   <div className="relative aspect-[3/4] rounded-lg overflow-hidden glass border"
// //                     style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                    
// //                     {getStatusLabel(item.id) && (
// //                       <div className="absolute top-2 left-2 z-20 px-2 py-0.5 rounded-lg font-semibold text-[8px] text-white glass-strong">
// //                         {getStatusLabel(item.id)}
// //                       </div>
// //                     )}

// //                     {ratings[item.id] && (
// //                       <div 
// //                         className="absolute top-2 right-2 z-20 px-2 py-0.5 rounded-lg font-semibold text-[8px] text-white"
// //                         style={{ background: theme.primary }}
// //                       >
// //                         ⭐ {ratings[item.id]}
// //                       </div>
// //                     )}

// //                     <button
// //                       onClick={(e) => { e.stopPropagation(); toggleFavorite(item); }}
// //                       className="absolute bottom-2 right-2 z-20 w-7 h-7 rounded-full glass flex items-center justify-center hover:scale-110 transition-all"
// //                     >
// //                       <span className="text-base">
// //                         {favorites.find(f => f.id === item.id) ? '❤️' : '🤍'}
// //                       </span>
// //                     </button>

// //                     <img 
// //                       src={getImg(item)} 
// //                       className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
// //                       alt="" 
// //                       loading="lazy"
// //                     />

// //                     <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
// //                     <div className="absolute bottom-2 left-2 right-2">
// //                       <h3 className="font-bold text-[10px] leading-tight line-clamp-2 text-white">
// //                         {item.russian || item.name}
// //                       </h3>
// //                     </div>
// //                   </div>
// //                 </div>
// //               ))}
// //             </div>
// //           ) : (
// //             <div className="space-y-2">
// //               {finalContent.map((item, idx) => (
// //                 <div
// //                   key={`${item.id}-${idx}`}
// //                   onClick={() => { setSelectedItem(item); addToHistory(item); }}
// //                   className="flex gap-3 glass-strong p-3 rounded-lg hover:scale-[1.01] transition-all cursor-pointer animate-fade-in"
// //                   style={{ animationDelay: `${idx * 0.02}s` }}
// //                 >
// //                   <img
// //                     src={getImg(item)}
// //                     className="w-14 h-20 object-cover rounded-lg"
// //                     alt=""
// //                     loading="lazy"
// //                   />
// //                   <div className="flex-1">
// //                     <h3 className="text-sm font-bold mb-1 line-clamp-1">
// //                       {item.russian || item.name}
// //                     </h3>
// //                     <div className="flex flex-wrap gap-1">
// //                       <span className="px-2 py-0.5 rounded-lg glass text-[9px] font-semibold">
// //                         {item.kind}
// //                       </span>
// //                       {item.score && (
// //                         <span className="px-2 py-0.5 rounded-lg bg-yellow-500/20 text-[9px] font-semibold text-yellow-400">
// //                           ⭐ {item.score}
// //                         </span>
// //                       )}
// //                     </div>
// //                   </div>
// //                   <button
// //                     onClick={(e) => { e.stopPropagation(); toggleFavorite(item); }}
// //                     className="flex items-center justify-center w-9 h-9 rounded-lg glass hover:scale-110 transition-all"
// //                   >
// //                     <span className="text-lg">
// //                       {favorites.find(f => f.id === item.id) ? '❤️' : '🤍'}
// //                     </span>
// //                   </button>
// //                 </div>
// //               ))}
// //             </div>
// //           )}
// //         </main>
// //       </div>

// //       {/* Modal Player */}
// //       {selectedItem && (
// //         <div className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-xl flex flex-col animate-fade-in">
// //           <div className="h-14 px-4 flex items-center justify-between glass-strong">
// //             <div className="flex items-center gap-3">
// //               <button 
// //                 onClick={() => setSelectedItem(null)} 
// //                 className="w-8 h-8 rounded-lg glass hover:bg-red-500/30 text-white flex items-center justify-center transition-all"
// //               >
// //                 ←
// //               </button>
// //               <h3 className="text-white font-bold text-xs truncate max-w-[200px] md:max-w-2xl">
// //                 {selectedItem.russian || selectedItem.name}
// //               </h3>
// //             </div>
// //             <button 
// //               onClick={() => setSelectedItem(null)} 
// //               className="w-8 h-8 rounded-lg bg-red-500/20 border border-red-500/50 hover:bg-red-500 text-white flex items-center justify-center font-bold transition-all"
// //             >
// //               ✕
// //             </button>
// //           </div>

// //           <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
// //             <div className="w-full lg:w-80 overflow-y-auto glass-strong p-4 no-scrollbar order-2 lg:order-1">
// //               <div className="grid grid-cols-2 gap-2 mb-3">
// //                 {[
// //                   { label: 'Рейтинг', value: `${selectedItem.score || '0.0'} ★`, color: 'text-yellow-400' },
// //                   { label: 'Формат', value: selectedItem.kind, color: 'text-cyan-400' },
// //                   { label: 'Год', value: selectedItem.aired_on?.split('-')[0] || 'N/A', color: 'text-white' },
// //                   { label: 'Статус', value: selectedItem.status || 'N/A', color: 'text-green-400' }
// //                 ].map((info, i) => (
// //                   <div key={i} className="glass p-2 rounded-lg">
// //                     <p className="text-white/40 text-[8px] font-semibold">{info.label}</p>
// //                     <p className={`text-[10px] font-bold ${info.color}`}>{info.value}</p>
// //                   </div>
// //                 ))}
// //               </div>

// //               <div className="space-y-1.5 mb-3">
// //                 <p className="text-[9px] font-semibold text-white/40">Статус</p>
// //                 <div className="flex flex-col gap-1.5">
// //                   {[
// //                     { key: 'watching', label: '👁️ Смотрю' },
// //                     { key: 'planned', label: '⏳ В планах' },
// //                     { key: 'completed', label: '✅ Завершено' }
// //                   ].map(st => (
// //                     <button 
// //                       key={st.key} 
// //                       onClick={() => updateLibraryStatus(selectedItem, st.key)} 
// //                       className={`w-full py-2 rounded-lg font-semibold text-[9px] transition-all ${
// //                         library[selectedItem.id]?.status === st.key ? 'text-white' : 'text-white/40'
// //                       }`}
// //                       style={{
// //                         background: library[selectedItem.id]?.status === st.key ? theme.primary : 'rgba(255,255,255,0.05)'
// //                       }}
// //                     >
// //                       {st.label}
// //                     </button>
// //                   ))}
// //                 </div>
// //               </div>

// //               <div className="space-y-2 mb-3">
// //                 <h4 className="text-white/40 font-semibold text-[9px]">Оценка</h4>
// //                 <div className="grid grid-cols-5 gap-1">
// //                   {[1,2,3,4,5,6,7,8,9,10].map(score => (
// //                     <button 
// //                       key={score} 
// //                       onClick={() => handleRating(selectedItem, score)} 
// //                       className={`aspect-square rounded-lg font-bold text-[10px] transition-all ${
// //                         ratings[selectedItem.id] === score ? 'text-white scale-105' : 'text-white/40'
// //                       }`}
// //                       style={{
// //                         background: ratings[selectedItem.id] === score ? theme.primary : 'rgba(255,255,255,0.05)'
// //                       }}
// //                     >
// //                       {score}
// //                     </button>
// //                   ))}
// //                 </div>
// //               </div>

// //               {isLoggedIn && (
// //                 <div className="space-y-2 mb-3">
// //                   <h4 className="text-white/40 font-semibold text-[9px]">Заметки</h4>
// //                   <textarea
// //                     placeholder="Ваши мысли..."
// //                     value={notes[selectedItem.id]?.text || ''}
// //                     onChange={(e) => addNote(selectedItem.id, e.target.value)}
// //                     className="w-full p-2 rounded-lg glass text-[10px] resize-none h-20 focus:outline-none"
// //                     style={{
// //                       borderColor: notes[selectedItem.id]?.text ? theme.primary : 'transparent'
// //                     }}
// //                   />
// //                 </div>
// //               )}

// //               <div className="glass rounded-lg overflow-hidden">
// //                 <button 
// //                   onClick={() => setIsDescOpen(!isDescOpen)}
// //                   className="w-full flex items-center justify-between p-3 hover:bg-white/5 transition-colors"
// //                 >
// //                   <p className="text-[9px] font-semibold" style={{ color: theme.primary }}>
// //                     📝 Описание
// //                   </p>
// //                   <span style={{ 
// //                     color: theme.primary,
// //                     transform: isDescOpen ? 'rotate(180deg)' : 'rotate(0deg)',
// //                     transition: 'transform 0.3s'
// //                   }}>
// //                     ▼
// //                   </span>
// //                 </button>
// //                 {isDescOpen && (
// //                   <div className="p-3 pt-0">
// //                     <div 
// //                       className="text-[10px] text-white/70 leading-relaxed max-h-40 overflow-y-auto no-scrollbar"
// //                       dangerouslySetInnerHTML={{ 
// //                         __html: selectedItem?.description || '<span class="opacity-50 italic">Загрузка...</span>' 
// //                       }}
// //                     />
// //                   </div>
// //                 )}
// //               </div>
// //             </div>

// //             <div className="flex-1 bg-black flex items-center justify-center order-1 lg:order-2">
// //               {selectedItem.kind === 'manga' ? (
// //                 <div className="w-full h-full overflow-y-auto flex flex-col items-center py-8 no-scrollbar">
// //                   <img 
// //                     src={getImg(selectedItem)} 
// //                     className="w-48 md:w-60 rounded-xl border-4 mb-4 shadow-2xl" 
// //                     style={{ borderColor: theme.primary }}
// //                     alt="" 
// //                   />
// //                   <a 
// //                     href={`https://shikimori.one${selectedItem.url}`} 
// //                     target="_blank" 
// //                     rel="noreferrer" 
// //                     className="px-8 py-3 rounded-xl font-bold hover:scale-105 transition-transform text-white text-sm"
// //                     style={{ background: theme.primary }}
// //                   >
// //                     📖 Читать на Shikimori
// //                   </a>
// //                 </div>
// //               ) : (
// //                 <iframe 
// //                   src={`https://kodik.info/find-player?shikimoriID=${selectedItem.id}`} 
// //                   className="w-full h-full border-0" 
// //                   allowFullScreen 
// //                   allow="autoplay; fullscreen"
// //                   title="Anime Player"
// //                 />
// //               )}
// //             </div>
// //           </div>
// //         </div>
// //       )}

// //       {/* Profile Modal */}
// //       {isProfileModalOpen && isLoggedIn && (
// //         <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fade-in overflow-y-auto">
// //           <div className="relative w-full max-w-lg glass-strong rounded-2xl p-6 my-8">
// //             <button 
// //               onClick={() => setIsProfileModalOpen(false)} 
// //               className="absolute top-4 right-4 text-xl opacity-50 hover:opacity-100 transition-opacity"
// //             >
// //               ×
// //             </button>
            
// //             <div className="relative w-20 h-20 mx-auto mb-3 group">
// //               <img 
// //                 src={user.avatar} 
// //                 className="w-full h-full rounded-xl object-cover border-4" 
// //                 style={{ borderColor: theme.primary }}
// //                 alt="avatar" 
// //               />
// //               <input type="file" ref={fileInputRef} onChange={handleAvatarChange} className="hidden" accept="image/*" />
// //               <button 
// //                 onClick={() => fileInputRef.current.click()} 
// //                 className="absolute -bottom-1 -right-1 w-8 h-8 rounded-lg flex items-center justify-center shadow-xl hover:scale-110 transition-transform text-sm"
// //                 style={{ background: theme.primary }}
// //               >
// //                 📸
// //               </button>
// //             </div>

// //             <div className="space-y-1 mb-4 text-center">
// //               <input 
// //                 type="text" 
// //                 value={user.name} 
// //                 onChange={(e) => setUser({ ...user, name: e.target.value })} 
// //                 className="w-full bg-transparent font-black text-center text-lg outline-none border-b border-transparent focus:border-white/10 text-white" 
// //                 maxLength={20}
// //               />
// //               <p className={`text-[10px] font-bold ${userStats.rank.color}`}>
// //                 {userStats.rank.badge} {userStats.rank.label}
// //               </p>
// //               <p className="text-[10px] opacity-50">
// //                 {new Date(user.joinDate).toLocaleDateString('ru-RU')}
// //               </p>
// //               <input
// //                 type="text"
// //                 value={user.bio || ''}
// //                 onChange={(e) => setUser({ ...user, bio: e.target.value })}
// //                 className="w-full bg-transparent text-center text-[10px] outline-none border-b border-transparent focus:border-white/10 text-white/60"
// //                 placeholder="Ваш статус..."
// //                 maxLength={60}
// //               />
// //             </div>

// //             <div className="glass-strong p-4 rounded-xl mb-4">
// //               <div className="flex justify-between items-end mb-2">
// //                 <div>
// //                   <p className="text-[8px] font-semibold text-white/40">Уровень</p>
// //                   <p className="text-xl font-black" style={{ color: theme.primary }}>
// //                     {userStats.level}
// //                   </p>
// //                 </div>
// //                 <div className="text-right">
// //                   <p className="text-[8px] font-semibold text-white/40">Опыт</p>
// //                   <p className="text-xs font-bold">{userStats.xp} / 100</p>
// //                 </div>
// //               </div>

// //               <div className="h-2 bg-black/30 rounded-full overflow-hidden">
// //                 <div 
// //                   className="h-full rounded-full transition-all duration-1000"
// //                   style={{ 
// //                     width: `${(userStats.xp / 100) * 100}%`,
// //                     background: theme.primary
// //                   }} 
// //                 />
// //               </div>
// //             </div>

// //             <div className="grid grid-cols-3 gap-2 mb-4">
// //               {[
// //                 { label: 'Завершено', value: userStats.totalWatched, icon: '✅' },
// //                 { label: 'Смотрю', value: userStats.watchingNow, icon: '👁️' },
// //                 { label: 'Часов', value: userStats.totalHours, icon: '⏱️' },
// //                 { label: 'Оценено', value: userStats.totalRated, icon: '⭐' },
// //                 { label: 'Избранное', value: favorites.length, icon: '❤️' },
// //                 { label: 'Заметок', value: userStats.totalNotes, icon: '📝' }
// //               ].map((stat, i) => (
// //                 <div 
// //                   key={i}
// //                   className="glass p-2 rounded-lg hover:scale-105 transition-all"
// //                 >
// //                   <p className="text-[8px] font-semibold text-white/40">{stat.label}</p>
// //                   <div className="flex items-center gap-1">
// //                     <span className="text-sm">{stat.icon}</span>
// //                     <p className="text-sm font-bold text-white">{stat.value}</p>
// //                   </div>
// //                 </div>
// //               ))}
// //             </div>

// //             <div className="space-y-2 mb-4">
// //               <h4 className="text-[10px] font-bold opacity-50">
// //                 Достижения ({achievements.length}/{ACHIEVEMENTS.length})
// //               </h4>
// //               <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto no-scrollbar">
// //                 {ACHIEVEMENTS.map(ach => (
// //                   <div
// //                     key={ach.id}
// //                     className={`p-2 rounded-lg transition-all ${
// //                       achievements.includes(ach.id)
// //                         ? 'glass-strong'
// //                         : 'glass opacity-40'
// //                     }`}
// //                   >
// //                     <div className="text-lg mb-0.5">{ach.icon}</div>
// //                     <p className="text-[8px] font-bold leading-tight">{ach.name}</p>
// //                   </div>
// //                 ))}
// //               </div>
// //             </div>

// //             <div className="flex gap-2 mb-2">
// //               <button
// //                 onClick={exportData}
// //                 className="flex-1 py-2.5 rounded-lg glass hover:scale-105 transition-all font-bold text-[10px]"
// //               >
// //                 💾 Экспорт
// //               </button>
// //               <label className="flex-1">
// //                 <input type="file" onChange={importData} className="hidden" accept=".json" />
// //                 <div className="py-2.5 rounded-lg glass hover:scale-105 transition-all font-bold text-[10px] text-center cursor-pointer">
// //                   📥 Импорт
// //                 </div>
// //               </label>
// //               <button
// //                 onClick={() => { setIsProfileModalOpen(false); handleLogout(); }}
// //                 className="flex-1 py-2.5 rounded-lg bg-red-500/20 border border-red-500 text-red-500 hover:bg-red-500 hover:text-white font-bold text-[10px] transition-all"
// //               >
// //                 🚪 Выйти
// //               </button>
// //             </div>

// //             <button
// //               onClick={deleteAccount}
// //               className="w-full py-2 rounded-lg bg-red-900/30 border border-red-900 text-red-400 hover:bg-red-900 hover:text-white font-bold text-[9px] transition-all mb-2"
// //             >
// //               ⚠️ Удалить аккаунт
// //             </button>

// //             <button
// //               onClick={() => { saveUserData(); setIsProfileModalOpen(false); }}
// //               className="w-full py-3 rounded-xl font-bold text-sm text-white hover:scale-105 transition-all"
// //               style={{ background: theme.primary }}
// //             >
// //               💾 Сохранить
// //             </button>
// //           </div>
// //         </div>
// //       )}

// //       {/* Settings Modal */}
// //       {isSettingsOpen && (
// //         <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fade-in overflow-y-auto">
// //           <div className="relative w-full max-w-md glass-strong rounded-2xl p-6 my-8">
// //             <button 
// //               onClick={() => setIsSettingsOpen(false)} 
// //               className="absolute top-4 right-4 text-xl opacity-50 hover:opacity-100 transition-opacity"
// //             >
// //               ×
// //             </button>
            
// //             <h2 className="text-xl font-black mb-6">⚙️ Настройки</h2>

// //             <div className="space-y-3 mb-6">
// //               <h3 className="text-[10px] font-bold opacity-50">Тема</h3>
// //               <div className="grid grid-cols-4 gap-2">
// //                 {Object.entries(THEMES).map(([key, t]) => (
// //                   <button
// //                     key={key}
// //                     onClick={() => setCurrentTheme(key)}
// //                     className={`p-3 rounded-lg border transition-all ${
// //                       currentTheme === key ? 'scale-105' : 'opacity-60'
// //                     }`}
// //                     style={{
// //                       background: currentTheme === key ? t.primary : 'rgba(255,255,255,0.05)',
// //                       borderColor: currentTheme === key ? t.primary : 'rgba(255,255,255,0.1)'
// //                     }}
// //                   >
// //                     <div className="text-xl mb-0.5">{t.icon}</div>
// //                     <p className="text-[8px] font-bold">{t.name}</p>
// //                   </button>
// //                 ))}
// //               </div>
// //             </div>

// //             <div className="flex items-center justify-between p-3 glass rounded-lg mb-3">
// //               <div>
// //                 <p className="text-xs font-bold">Темный режим</p>
// //                 <p className="text-[9px] opacity-50">Переключить тему</p>
// //               </div>
// //               <button
// //                 onClick={() => setIsDarkMode(!isDarkMode)}
// //                 className={`w-12 h-6 rounded-full transition-all ${
// //                   isDarkMode ? '' : 'bg-white/20'
// //                 }`}
// //                 style={{
// //                   background: isDarkMode ? theme.primary : undefined
// //                 }}
// //               >
// //                 <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
// //                   isDarkMode ? 'translate-x-6' : 'translate-x-0.5'
// //                 }`} />
// //               </button>
// //             </div>

// //             {isLoggedIn && (
// //               <div className="p-3 glass rounded-lg mb-3">
// //                 <div className="flex items-center justify-between mb-2">
// //                   <p className="text-xs font-bold">Дневная цель</p>
// //                   <span className="text-xs font-bold" style={{ color: theme.primary }}>
// //                     {dailyGoal} аниме/день
// //                   </span>
// //                 </div>
// //                 <input
// //                   type="range"
// //                   min="1"
// //                   max="10"
// //                   value={dailyGoal}
// //                   onChange={(e) => setDailyGoal(parseInt(e.target.value))}
// //                   className="w-full h-2 rounded-full"
// //                   style={{ background: theme.primary }}
// //                 />
// //               </div>
// //             )}

// //             <button
// //               onClick={() => {
// //                 if (confirm('Очистить кэш браузера?')) {
// //                   localStorage.clear();
// //                   sessionStorage.clear();
// //                   window.location.reload();
// //                 }
// //               }}
// //               className="w-full py-3 rounded-lg bg-orange-500/20 border border-orange-500 text-orange-500 font-bold text-xs hover:bg-orange-500 hover:text-white transition-all"
// //             >
// //               🗑️ Очистить кэш
// //             </button>
// //           </div>
// //         </div>
// //       )}

// //       {/* Achievement Toast */}
// //       {showAchievement && (
// //         <div className="fixed top-20 right-4 z-[10001] animate-slide-in-right max-w-xs">
// //           <div 
// //             className="p-4 rounded-xl border-2 glass-strong shadow-2xl"
// //             style={{ borderColor: theme.primary }}
// //           >
// //             <div className="flex items-center gap-3">
// //               <div 
// //                 className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl icon-3d-button"
// //                 style={{ background: theme.primary }}
// //               >
// //                 <span className="icon-3d">{showAchievement.icon}</span>
// //               </div>
// //               <div>
// //                 <p className="text-[8px] font-semibold opacity-50 mb-0.5">Достижение!</p>
// //                 <h4 className="text-sm font-bold mb-0.5">{showAchievement.name}</h4>
// //                 <p className="text-[10px] opacity-70">{showAchievement.desc}</p>
// //                 <p className="text-[10px] font-bold mt-1" style={{ color: theme.primary }}>
// //                   +{showAchievement.xp} XP
// //                 </p>
// //               </div>
// //             </div>
// //           </div>
// //         </div>
// //       )}

// //       {/* Continue Watching Toast */}
// //       {showToast && history.length > 0 && autoPlay && (
// //         <div className="fixed bottom-4 right-4 z-[1000] animate-slide-in-right w-72">
// //           <div 
// //             onClick={() => { setSelectedItem(history[0]); setShowToast(false); }}
// //             className="p-3 rounded-xl border-2 flex items-center gap-3 cursor-pointer hover:scale-105 transition-all glass-strong"
// //             style={{ borderColor: theme.primary }}
// //           >
// //             <div className="w-10 h-14 shrink-0 rounded-lg overflow-hidden">
// //               <img src={getImg(history[0])} className="w-full h-full object-cover" alt="" />
// //             </div>
// //             <div className="flex-1 overflow-hidden">
// //               <p className="text-[8px] font-bold mb-0.5" style={{ color: theme.primary }}>
// //                 ▶️ Продолжить?
// //               </p>
// //               <h4 className="text-[10px] font-bold truncate text-white">
// //                 {history[0].russian || history[0].name}
// //               </h4>
// //               <p className="text-[8px] opacity-50 mt-0.5">
// //                 {history[0].date}
// //               </p>
// //             </div>
// //             <button 
// //               onClick={(e) => { e.stopPropagation(); setShowToast(false); }} 
// //               className="text-lg transition-colors text-white/40 hover:text-white"
// //             >
// //               ×
// //             </button>
// //           </div>
// //         </div>
// //       )}

// //       {/* Logout Modal */}
// //       {showLogoutModal && (
// //         <div className="fixed inset-0 z-[20000] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fade-in">
// //           <div className="relative w-full max-w-sm glass-strong rounded-2xl p-6 text-center">
// //             <div 
// //               className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4"
// //               style={{ background: `${theme.primary}40` }}
// //             >
// //               🚪
// //             </div>
// //             <h3 className="text-xl font-black mb-2">Выход из аккаунта</h3>
// //             <p className="text-sm opacity-70 mb-6">
// //               Вы уверены? Ваши данные сохранены.
// //             </p>
// //             <div className="flex gap-3">
// //               <button
// //                 onClick={() => setShowLogoutModal(false)}
// //                 className="flex-1 py-3 rounded-xl glass font-bold text-sm hover:scale-105 transition-all"
// //               >
// //                 Отмена
// //               </button>
// //               <button
// //                 onClick={confirmLogout}
// //                 className="flex-1 py-3 rounded-xl font-bold text-sm text-white hover:scale-105 transition-all"
// //                 style={{ background: '#ef4444' }}
// //               >
// //                 Выйти 🚪
// //               </button>
// //             </div>
// //           </div>
// //         </div>
// //       )}

// //       {/* Footer */}
// //       <footer className="mt-16 py-8 border-t glass text-center" 
// //         style={{ borderColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
// //         <div className="max-w-4xl mx-auto px-6">
// //           <h2 className="text-2xl font-black mb-2">
// //             Ani<span style={{ color: theme.primary }}>Hub</span>
// //           </h2>
// //           <p className="text-xs opacity-70 mb-3">
// //             Ваш портал в мир аниме 🌟
// //           </p>
// //           {isLoggedIn && (
// //             <p className="text-xs opacity-50 mb-2">
// //               <span className="font-bold" style={{ color: theme.primary }}>{user.name}</span> • Уровень {userStats.level}
// //             </p>
// //           )}
// //           <p className="text-[9px] font-bold opacity-20">
// //             © 2026 @Sh1zoK1ll • {STORAGE_VERSION}
// //           </p>
// //         </div>
// //       </footer>
// //     </div>
// //   );
// // };

// // // Auth Form Component
// // const AuthForm = ({ mode, onLogin, onRegister, theme, isDarkMode, rememberMe, setRememberMe }) => {
// //   const [username, setUsername] = useState('');
// //   const [password, setPassword] = useState('');
// //   const [email, setEmail] = useState('');
// //   const [showPassword, setShowPassword] = useState(false);

// //   const handleSubmit = (e) => {
// //     e.preventDefault();
// //     if (mode === 'login') {
// //       onLogin(username, password);
// //     } else {
// //       onRegister(username, password, email);
// //     }
// //   };

// //   return (
// //     <form onSubmit={handleSubmit} className="space-y-3">
// //       <div>
// //         <label className="block text-[10px] font-semibold mb-1.5 opacity-70">
// //           Имя пользователя *
// //         </label>
// //         <input
// //           type="text"
// //           value={username}
// //           onChange={(e) => setUsername(e.target.value)}
// //           className="w-full p-3 rounded-lg glass border-2 border-transparent focus:outline-none text-white font-medium transition-all text-sm"
// //           style={{
// //             borderColor: username ? theme.primary : undefined
// //           }}
// //           placeholder="Введите имя"
// //           required
// //           minLength={3}
// //           maxLength={20}
// //         />
// //       </div>

// //       {mode === 'register' && (
// //         <div>
// //           <label className="block text-[10px] font-semibold mb-1.5 opacity-70">
// //             Email (опционально)
// //           </label>
// //           <input
// //             type="email"
// //             value={email}
// //             onChange={(e) => setEmail(e.target.value)}
// //             className="w-full p-3 rounded-lg glass border-2 border-transparent focus:outline-none text-white font-medium text-sm"
// //             placeholder="email@example.com"
// //           />
// //         </div>
// //       )}

// //       <div>
// //         <label className="block text-[10px] font-semibold mb-1.5 opacity-70">
// //           Пароль *
// //         </label>
// //         <div className="relative">
// //           <input
// //             type={showPassword ? 'text' : 'password'}
// //             value={password}
// //             onChange={(e) => setPassword(e.target.value)}
// //             className="w-full p-3 pr-10 rounded-lg glass border-2 border-transparent focus:outline-none text-white font-medium transition-all text-sm"
// //             style={{
// //               borderColor: password ? theme.secondary : undefined
// //             }}
// //             placeholder="Введите пароль"
// //             required
// //             minLength={6}
// //           />
// //           <button
// //             type="button"
// //             onClick={() => setShowPassword(!showPassword)}
// //             className="absolute right-3 top-1/2 -translate-y-1/2 text-lg opacity-50 hover:opacity-100 transition-opacity"
// //           >
// //             {showPassword ? '🙈' : '👁️'}
// //           </button>
// //         </div>
// //       </div>

// //       {mode === 'login' && (
// //         <div className="flex items-center gap-2">
// //           <input
// //             type="checkbox"
// //             id="remember"
// //             checked={rememberMe}
// //             onChange={(e) => setRememberMe(e.target.checked)}
// //             className="w-4 h-4 rounded"
// //           />
// //           <label htmlFor="remember" className="text-xs opacity-70 cursor-pointer">
// //             Запомнить меня
// //           </label>
// //         </div>
// //       )}

// //       <button
// //         type="submit"
// //         className="w-full py-3 rounded-lg font-bold text-sm text-white hover:scale-105 transition-all"
// //         style={{ background: theme.primary }}
// //       >
// //         {mode === 'login' ? '🔐 Войти' : '✨ Зарегистрироваться'}
// //       </button>
// //     </form>
// //   );
// // };

// // export default App;