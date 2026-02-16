// import React, { useState, useEffect, useRef, useMemo } from 'react';
// import logo from './img/logo.png';
// const API = 'https://shikimori.one/api';
// const ASSETS = 'https://shikimori.one';

// const GENRES = [
//   { id: 1, name: 'Сёнен', icon: '🔥' }, { id: 4, name: 'Комедия', icon: '😂' },
//   { id: 10, name: 'Фэнтези', icon: '🧙' }, { id: 2, name: 'Приключения', icon: '🗺️' },
//   { id: 8, name: 'Драма', icon: '😢' }, { id: 7, name: 'Мистика', icon: '🔮' },
//   { id: 24, name: 'Фантастика', icon: '🚀' }, { id: 22, name: 'Романтика', icon: '❤️' },
//   { id: 6, name: 'Демоны', icon: '👿' }, { id: 11, name: 'Игры', icon: '🎮' }
// ];

// const RANKS = [
//   { min: 1, label: 'Новичок', color: 'text-gray-400' },
//   { min: 10, label: 'Любитель', color: 'text-blue-400' },
//   { min: 30, label: 'Ценитель', color: 'text-purple-400' },
//   { min: 60, label: 'Мастер', color: 'text-orange-400' },
//   { min: 85, label: 'Элита', color: 'text-red-500' },
//   { min: 100, label: 'Легендарный Отаку', color: 'text-[#ff00ff] drop-shadow-[0_0_10px_#ff00ff]' }
// ];

// const getRank = (lvl) => {
//   return [...RANKS].reverse().find(r => lvl >= r.min) || RANKS[0];
// };

// const App = () => {
//   const [view, setView] = useState('home');
//   const [content, setContent] = useState([]);
//   const [trending, setTrending] = useState([]);
//   const [selectedItem, setSelectedItem] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [activeGenre, setActiveGenre] = useState(null);
//   const [page, setPage] = useState(1);
//   const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
//   const [showToast, setShowToast] = useState(false);
//   const fileInputRef = useRef(null);

//   const [isDarkMode, setIsDarkMode] = useState(() => JSON.parse(localStorage.getItem('aniHub_theme_v4')) ?? true);
//   const [library, setLibrary] = useState(() => JSON.parse(localStorage.getItem('aniHub_lib_v4')) ?? {});
//   const [history, setHistory] = useState(() => JSON.parse(localStorage.getItem('aniHub_hist_v4')) ?? []);
//   const [ratings, setRatings] = useState(() => JSON.parse(localStorage.getItem('aniHub_ratings_v4')) ?? {});
//   const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('aniHub_user_v4')) ?? {
    

    
//     name: 'Кибер_Пользователь',
//     avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Shizo',
//     bio: 'Жизнь в стиле Киберпанк',
//     xp: 0
//   });

//   // Level va XP hisoblash logikasi (Xatoni to'g'irlash uchun qo'shildi)
//   const userStats = useMemo(() => {
//     const level = Math.floor(user.xp / 100) + 1;
//     const nextLevelAt = level * 100;
//     const currentLevelXP = user.xp % 100;
//     return { level, xp: currentLevelXP, totalXp: user.xp, nextLevelAt: 100 };
//   }, [user.xp]);

//   // Opisaniyeni yuklash uchun useEffect
// useEffect(() => {
//   const fetchDescription = async () => {
//     // Agar anime tanlangan bo'lsa va hali opisaniyesi yuklanmagan bo'lsa
//     if (selectedItem && selectedItem.id && !selectedItem.description) {
//       try {
//         const response = await fetch(`https://shikimori.one/api/animes/${selectedItem.id}`);
//         const data = await response.json();
        
//         // Mavjud selectedItem ga descriptionni qo'shib yangilaymiz
//         setSelectedItem(prev => ({
//           ...prev,
//           description: data.description_html || data.description || "Описание отсутствует."
//         }));
//       } catch (error) {
//         console.error("Opisaniye yuklashda xato:", error);
//       }
//     }
//   };

//   fetchDescription();
// }, [selectedItem?.id]); // Faqat anime o'zgarganda ishlaydi
// const [isDescOpen, setIsDescOpen] = useState(false);
//   useEffect(() => {
//     localStorage.setItem('aniHub_lib_v4', JSON.stringify(library));
//     localStorage.setItem('aniHub_hist_v4', JSON.stringify(history));
//     localStorage.setItem('aniHub_user_v4', JSON.stringify(user));
//     localStorage.setItem('aniHub_theme_v4', JSON.stringify(isDarkMode));
//     localStorage.setItem('aniHub_ratings_v4', JSON.stringify(ratings));
//   }, [library, history, user, isDarkMode, ratings]);

//   useEffect(() => {
//     if (history.length > 0) {
//       setShowToast(true);
//       const timer = setTimeout(() => setShowToast(false), 6000);
//       return () => clearTimeout(timer);
//     }
//   }, []);

//   const getImg = (item) => {
//     if (!item?.image) return 'https://via.placeholder.com/225x320?text=No+Image';
//     const path = item.image.original || (typeof item.image === 'string' ? item.image : '');
//     return path.startsWith('http') ? path : ASSETS + path;
//   };

//   const fetchData = async () => {
//     setLoading(true);
//     try {
//       const endpoint = view === 'manga' ? 'mangas' : 'animes';
//       const order = view === 'top' ? 'ranked' : 'popularity';
//       let url = `${API}/${endpoint}?limit=24&page=${page}&order=${order}`;
//       if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;
//       if (activeGenre) url += `&genre=${activeGenre}`;

//       const res = await fetch(url);
//       const data = await res.json();
//       setContent(Array.isArray(data) ? data : []);

//       if (trending.length === 0) {
//         const trendRes = await fetch(`${API}/animes?limit=15&order=popularity`);
//         const trendData = await trendRes.json();
//         setTrending(trendData);
//       }
//     } catch (err) {
//       console.error("Fetch Error:", err);
//     } finally {
//       setTimeout(() => setLoading(false), 800);
//     }
//   };

//   useEffect(() => {
//     if (view !== 'collection' && view !== 'history' && view !== 'trending_list') fetchData();
//     else setLoading(false);
//   }, [view, searchQuery, activeGenre, page]);

//   const handleRating = (item, score) => {
//     setRatings(prev => ({ ...prev, [item.id]: score }));
//     if (!library[item.id]) updateLibraryStatus(item, 'planned');
//     setUser(prev => ({ ...prev, xp: prev.xp + 2 })); // Baholash uchun XP
//   };

//   const addToHistory = (item) => {
//     const newItem = { ...item, date: new Date().toLocaleString(), timestamp: Date.now() };
//     setHistory(prev => [newItem, ...prev.filter(h => h.id !== item.id)].slice(0, 40));
//     setUser(prev => ({ ...prev, xp: prev.xp + 5 }));
//   };

//   const updateLibraryStatus = (item, status) => {
//     setLibrary(prev => ({ ...prev, [item.id]: { ...item, status } }));
//     setUser(prev => ({ ...prev, xp: prev.xp + 10 })); // Ro'yxatga qo'shish uchun XP
//   };

//   const handleAvatarChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       const reader = new FileReader();
//       reader.onloadend = () => setUser({ ...user, avatar: reader.result });
//       reader.readAsDataURL(file);
//     }
//   };

//   const getStatusLabel = (id) => {
//     const map = { watching: 'Смотрю', planned: 'В планах', completed: 'Завершено' };
//     return library[id]?.status ? map[library[id].status] : null;
//   };

//   const displayContent = () => {
//     if (view === 'collection') return Object.values(library);
//     if (view === 'history') return history;
//     if (view === 'trending_list') return trending;
//     return content;
//   };

//   const finalContent = displayContent();

//   return (
//     <div className={`min-h-screen font-sans transition-all duration-700 ${isDarkMode ? 'bg-[#0a0a0f] text-white' : 'bg-gradient-to-br from-[#f0f2f5] to-[#e0e7ff] text-slate-900'}`}>
      
//       <style>{`
//         @keyframes fadeIn { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
//         @keyframes scroll { 0% { transform: translateX(0); } 100% { transform: translateX(calc(-320px * 15 - 2.5rem * 15)); } }
//         .animate-fade-in { animation: fadeIn 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
//         .animate-infinite-scroll { display: flex; width: max-content; animation: scroll 40s linear infinite; }
//         .animate-infinite-scroll:hover { animation-play-state: paused; }
//         .glass { backdrop-filter: blur(20px); background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); }
//         .no-scrollbar::-webkit-scrollbar { display: none; }
//         .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
//         ::-webkit-scrollbar { width: 8px; }
//         ::-webkit-scrollbar-thumb { background: linear-gradient(#ff00ff, #00ffff); border-radius: 10px; }
//       `}</style>

//  {/* Header */}
//       <header className={`sticky top-0 z-[1000] glass border-b ${isDarkMode ? 'border-white/10' : 'border-slate-200'} backdrop-blur-2xl`}>
//         <div className="max-w-[1920px] mx-auto px-4 md:px-6 py-4 flex items-center justify-between gap-4">
//           <div className="flex items-center gap-4 md:gap-10 shrink-0">
//             {/* Yangi Logotip Bloki */}
//             <div onClick={() => { setView('home'); setPage(1); }} className="flex items-center gap-3 cursor-pointer group">
//               <div className="w-10 h-10 md:w-14 md:h-14 overflow-hidden rounded-xl md:rounded-2xl shadow-[0_0_20px_rgba(255,0,255,0.3)]">
//                 <img 
//                   src={logo} 
//                   alt="AniHub Logo"
//                   className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
//                 />
//               </div>
//               <h1 className="text-xl md:text-3xl font-black tracking-tighter uppercase hidden sm:block">
//                 ANI<span className="text-[#ff00ff]">HUB</span>
//               </h1>
//             </div>

//             <nav className="hidden xl:flex gap-6">
//               {['home', 'manga', 'top', 'trending_list', 'collection', 'history'].map(m => (
//                 <button
//                   key={m}
//                   onClick={() => setView(m)}
//                   className={`text-xs font-black uppercase tracking-wider transition-all relative group ${view === m ? 'text-[#ff00ff]' : 'opacity-60 hover:opacity-100'}`}
//                 >
//                   {m === 'home' ? 'Главная' : m === 'manga' ? 'Манга' : m === 'top' ? 'Топ' : m === 'trending_list' ? 'Тренды' : m === 'collection' ? 'Коллекция' : 'История'}
//                 </button>
//               ))}
//             </nav>
//           </div>

//           <div className="flex-1 max-w-xl mx-2 md:mx-10">
//     <div className="flex-1 max-w-xl mx-2 md:mx-10">
//   <input
//     type="text"
//     placeholder="Поиск..."
//     value={searchQuery}
//     onChange={(e) => setSearchQuery(e.target.value)}
//     className={`w-full py-2.5 md:py-4 px-4 md:px-6 rounded-xl md:rounded-2xl glass border-2 transition-all font-bold text-xs md:text-sm 
//       ${isDarkMode 
//         ? 'bg-white/5 border-transparent focus:border-[#ff00ff] text-white placeholder-white/40' 
//         : 'bg-white border-slate-200 text-slate-900 focus:border-[#ff00ff] placeholder-slate-400 shadow-sm'
//       }`}
//   />
// </div>
//           </div>

//           <div className="flex items-center gap-3 md:gap-6 shrink-0">
//              <button 
//               onClick={() => {
//                 if (content.length > 0) {
//                   const random = content[Math.floor(Math.random() * content.length)];
//                   setSelectedItem(random);
//                   addToHistory(random);
//                 }
//               }}
//               className="hidden sm:flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-[#ff00ff]/20 transition-all"
//             >
//               <span className="text-lg">🎲</span>
//             </button>
//             <button onClick={() => setIsDarkMode(!isDarkMode)} className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl glass flex items-center justify-center text-lg hover:bg-[#ff00ff]/20">
//               {isDarkMode ? '☀️' : '🌙'}
//             </button>
//             <div onClick={() => setIsProfileModalOpen(true)} className="flex items-center cursor-pointer">
//               <img src={user.avatar} className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl object-cover border-2 border-[#ff00ff]" alt="" />
//             </div>
//           </div>
//         </div>

//         <div className="xl:hidden flex overflow-x-auto no-scrollbar gap-4 px-4 py-3 border-t border-white/5">
//            {['home', 'manga', 'top', 'trending_list', 'collection', 'history'].map(m => (
//               <button
//                 key={m}
//                 onClick={() => setView(m)}
//                 className={`text-[10px] font-black uppercase whitespace-nowrap px-4 py-2 rounded-lg ${view === m ? 'bg-[#ff00ff] text-white' : 'bg-white/5 opacity-60'}`}
//               >
//                 {m === 'home' ? 'Главная' : m === 'manga' ? 'Манга' : m === 'top' ? 'Топ' : m === 'trending_list' ? 'Тренды' : m === 'collection' ? 'Коллекция' : 'История'}
//               </button>
//             ))}
//         </div>
//       </header>

//       {/* Hero Trending */}
//       {view === 'home' && !searchQuery && page === 1 && (
//         <section className="mt-10 overflow-hidden py-4 md:py-10">
//           <div className="px-6 md:px-10 mb-6">
//             <h3 className="text-2xl md:text-4xl font-black italic uppercase tracking-tighter bg-gradient-to-r from-[#ff00ff] to-[#00ffff] inline-block text-transparent bg-clip-text">Сейчас в тренде</h3>
//           </div>
//           <div className="relative">
//             <div className="animate-infinite-scroll flex gap-10">
//               {[...trending, ...trending].map((item, i) => (
//                 <div key={`${item.id}-${i}`} onClick={() => { setSelectedItem(item); addToHistory(item); }} className="w-64 md:w-80 group cursor-pointer relative shrink-0">
//                   <div className="relative aspect-video rounded-2xl md:rounded-[32px] overflow-hidden glass border-2 border-transparent group-hover:border-[#ff00ff] transition-all duration-500">
//                     <img src={getImg(item)} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="" />
//                     <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
//                     <div className="absolute bottom-4 left-4">
//                       <h4 className="text-sm md:text-lg font-black text-white truncate w-56 italic">{item.russian || item.name}</h4>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </section>
//       )}

//       {/* Main Grid */}
//       <div className="max-w-[1920px] mx-auto px-4 md:px-10 py-8 md:py-12 flex flex-col lg:flex-row gap-10">
//         <aside className="w-full lg:w-80 shrink-0 space-y-6">
//           <div className="glass p-6 md:p-8 rounded-3xl md:rounded-[40px] sticky top-32 border-white/5">
//             <p className="text-xs font-black uppercase opacity-50 mb-6 tracking-[0.2em] text-center">Категории</p>
//             <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
//               <button onClick={() => setActiveGenre(null)} className={`py-3 md:py-4 rounded-xl md:rounded-2xl text-[10px] md:text-sm font-black uppercase transition-all ${!activeGenre ? 'bg-gradient-to-r from-[#ff00ff] to-[#00ffff] text-white' : 'bg-white/5'}`}> 🧩 Все жанры</button>
//               {GENRES.map(g => (
//                 <button key={g.id} onClick={() => setActiveGenre(g.id)} className={`py-3 md:py-4 rounded-xl md:rounded-2xl text-[10px] md:text-sm font-black uppercase transition-all ${activeGenre === g.id ? 'bg-gradient-to-r from-[#ff00ff] to-[#00ffff] text-white' : 'bg-white/5'}`}>
//                   {g.icon} {g.name}
//                 </button>
//               ))}
//             </div>
            
//             <div className="mt-6 md:mt-8 pt-6 md:pt-8 border-t border-white/10">
//               <a href="https://t.me/Sh1zoK1ll" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-3 w-full py-4 rounded-xl md:rounded-2xl bg-[#0088cc] hover:brightness-110 transition-all shadow-lg">
//                 <span className="text-xl">✈️</span>
//                 <div className="text-left">
//                   <p className="text-[9px] font-black uppercase text-white/70 leading-none">Developer</p>
//                   <p className="text-xs md:text-sm font-black text-white">@Sh1zoK1ll</p>
//                 </div>
//               </a>
//             </div>
//           </div>
//         </aside>

//         <main className="flex-1">
//           <div className="flex flex-col md:flex-row items-center justify-between mb-8 md:mb-12 gap-6">
//             <h2 className="text-3xl md:text-5xl lg:text-7xl font-black italic uppercase tracking-tighter bg-gradient-to-r from-[#ff00ff] to-[#00ffff] inline-block text-transparent bg-clip-text">
//               {view === 'history' ? 'История' : view === 'collection' ? 'Коллекция' : view === 'manga' ? 'Манга' : view === 'trending_list' ? 'Тренды' : 'Каталог'}
//             </h2>
//             {['home', 'manga', 'top'].includes(view) && (
//               <div className="flex items-center gap-4 bg-white/5 p-2 md:p-3 rounded-2xl md:rounded-[30px] border border-white/10">
//                 <button onClick={() => setPage(p => Math.max(1, p - 1))} className="w-10 h-10 md:w-14 md:h-14 rounded-lg md:rounded-2xl glass flex items-center justify-center text-xl md:text-3xl hover:text-[#ff00ff]">‹</button>
//                 <div className="w-10 h-10 md:w-14 md:h-14 rounded-lg md:rounded-2xl bg-gradient-to-r from-[#ff00ff] to-[#00ffff] flex items-center justify-center font-black text-sm md:text-xl text-white">{page}</div>
//                 <button onClick={() => setPage(p => p + 1)} className="w-10 h-10 md:w-14 md:h-14 rounded-lg md:rounded-2xl glass flex items-center justify-center text-xl md:text-3xl hover:text-[#ff00ff]">›</button>
//               </div>
//             )}
//           </div>

//           {loading ? (
//             <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-8">
//               {[...Array(10)].map((_, i) => <div key={i} className="aspect-[3/4.5] rounded-2xl md:rounded-[40px] bg-white/5 animate-pulse" />)}
//             </div>
//           ) : (
//             <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-8">
//               {finalContent.map((item, idx) => (
//                 <div key={`${item.id}-${idx}`} onClick={() => { setSelectedItem(item); addToHistory(item); }} className="group relative cursor-pointer animate-fade-in">
//                   <div className="relative aspect-[3/4.5] rounded-2xl md:rounded-[40px] overflow-hidden glass border-2 border-transparent group-hover:border-[#ff00ff] transition-all duration-500 shadow-2xl bg-black">
                    
//                     {ratings[item.id] && (
//                       <div className="absolute top-2 md:top-4 left-2 md:left-4 z-30 px-2 md:px-3 py-1 rounded-lg font-black text-[8px] md:text-[10px] uppercase text-white bg-gradient-to-r from-[#ff00ff] to-[#00ffff]">
//                         ⭐ {ratings[item.id]}
//                       </div>
//                     )}

//                     <img src={getImg(item)} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:opacity-40" alt="" />

//                     <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-4 opacity-0 group-hover:opacity-100 transition-all duration-500 bg-black/40 backdrop-blur-md">
//                        <div className="translate-y-6 group-hover:translate-y-0 transition-transform duration-500 text-center">
//                           <div className="w-10 h-10 md:w-12 md:h-12 bg-[#ff00ff] rounded-full flex items-center justify-center mb-3 mx-auto shadow-[0_0_20px_#ff00ff]">
//                             <span className="text-white text-lg">▶</span>
//                           </div>
//                           <p className="text-[#00ffff] text-[9px] md:text-[10px] font-black uppercase tracking-tighter mb-1">{item.kind} • {item.episodes || '?'} эп.</p>
//                           <p className="text-white text-[10px] md:text-xs font-black uppercase italic">Смотреть</p>
//                        </div>
//                     </div>

//                     <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent z-10 group-hover:opacity-0 transition-opacity" />
//                     <div className="absolute bottom-4 md:bottom-6 left-4 md:left-6 right-4 md:right-6 z-10 group-hover:opacity-0 transition-opacity">
//                       <h3 className="font-black text-[10px] md:text-sm uppercase leading-tight line-clamp-2 text-white italic">{item.russian || item.name}</h3>
//                       {getStatusLabel(item.id) && (
//                         <p className="text-[8px] font-black uppercase text-cyan-400 mt-2">{getStatusLabel(item.id)}</p>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </main>
//       </div>

//       {/* Modal Player */}
//       {selectedItem && (
//         <div className="fixed inset-0 z-[9999] bg-[#050507] flex flex-col animate-fade-in overflow-hidden">
//           <div className="relative z-[100] h-16 md:h-20 px-4 md:px-10 flex items-center justify-between bg-black/60 border-b border-white/5 backdrop-blur-xl">
//             <div className="flex items-center gap-4">
//               <button onClick={() => setSelectedItem(null)} className="w-10 h-10 rounded-xl bg-white/5 hover:bg-[#ff00ff]/20 text-white flex items-center justify-center transition-all">←</button>
//               <h3 className="text-white font-black uppercase text-xs md:text-base truncate italic max-w-[200px] md:max-w-3xl">
//                 {selectedItem.russian || selectedItem.name}
//               </h3>
//             </div>
//             <button onClick={() => setSelectedItem(null)} className="w-10 h-10 rounded-xl bg-white/5 hover:bg-red-500 text-white flex items-center justify-center text-xl transition-all">×</button>
//           </div>

//           <div className="relative z-10 flex-1 flex flex-col lg:flex-row overflow-hidden">
//             <div className="w-full lg:w-[400px] overflow-y-auto bg-black/40 border-r border-white/5 p-6 md:p-10 no-scrollbar order-2 lg:order-1">
//               <div className="grid grid-cols-2 gap-3 mb-8">
//                 {[
//                   { label: 'Рейтинг', value: `${selectedItem.score || '0.0'} ★`, color: 'text-yellow-400' },
//                   { label: 'Формат', value: selectedItem.kind, color: 'text-cyan-400' },
//                   { label: 'Год', value: selectedItem.aired_on?.split('-')[0], color: 'text-white' },
//                   { label: 'Статус', value: selectedItem.status, color: 'text-green-400' }
                  
//                 ].map((info, i) => (
//                   <div key={i} className="bg-white/5 p-4 rounded-2xl border border-white/5">
//                     <p className="text-white/20 text-[9px] font-black uppercase mb-1">{info.label}</p>
//                     <p className={`text-sm font-black uppercase ${info.color}`}>{info.value}</p>
//                   </div>
//                 ))}
//               </div>

//               <div className="space-y-3 mb-8">
//                 <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-2">Статус</p>
//                 <div className="flex flex-col gap-2">
//                   {['watching', 'planned', 'completed'].map(st => (
//                     <button key={st} onClick={() => updateLibraryStatus(selectedItem, st)} className={`w-full py-4 rounded-2xl font-black uppercase text-[10px] transition-all ${library[selectedItem.id]?.status === st ? 'bg-gradient-to-r from-[#ff00ff] to-[#00ffff] text-white' : 'bg-white/5 text-white/40'}`}>
//                       {st === 'watching' ? '👁️ Смотрю' : st === 'planned' ? '⏳ В планах' : '✅ Завершено'}
//                     </button>
//                   ))}
//                 </div>
//               </div>

//               <div className="space-y-4">
//                 <h4 className="text-white/20 font-black uppercase text-[10px] tracking-[0.2em] ml-2">Ваша оценка</h4>
//                 <div className="grid grid-cols-5 gap-2">
//                   {[1,2,3,4,5,6,7,8,9,10].map(score => (
//                     <button key={score} onClick={() => handleRating(selectedItem, score)} className={`aspect-square rounded-xl font-black text-sm transition-all ${ratings[selectedItem.id] === score ? 'bg-[#ff00ff] text-white scale-110 shadow-[0_0_15px_#ff00ff]' : 'bg-white/5 text-white/30'}`}>
//                       {score}
//                     </button>
//                   ))}
//                 </div>
//               </div>
//             </div>

//             <div className="flex-1 bg-black flex items-center justify-center order-1 lg:order-2">
//               {selectedItem.kind === 'manga' ? (
//                 <div className="w-full h-full overflow-y-auto flex flex-col items-center py-10 no-scrollbar">
//                   <img src={getImg(selectedItem)} className="w-56 md:w-72 rounded-[32px] border-4 border-[#ff00ff] mb-6 shadow-2xl" alt="" />
//                   <a href={`https://shikimori.one${selectedItem.url}`} target="_blank" rel="noreferrer" className="px-10 py-4 bg-[#ff00ff] text-white rounded-2xl font-black uppercase hover:scale-105 transition-transform shadow-[0_0_20px_#ff00ff]">Читать на Shikimori</a>
//                 </div>
//               ) : (
//                 <div className="w-full h-full">
//                    <iframe 
//                     src={`https://kodik.info/find-player?shikimoriID=${selectedItem.id}&color=%23ff00ff`} 
//                     className="w-full h-full border-0 aspect-video lg:aspect-auto" 
//                     allowFullScreen 
//                     allow="autoplay; fullscreen" 
//                   />
//                 </div>
//               )}
//             </div>
//           </div>
// {/* Opisaniye Bloki */}
// <div className="mt-6 border border-white/5 rounded-3xl overflow-hidden bg-white/5 transition-all duration-500">
//   {/* Tugma */}
//   <button 
//     onClick={() => setIsDescOpen(!isDescOpen)}
//     className="w-full flex items-center justify-between p-5 hover:bg-white/5 transition-colors"
//   >
//     <p className="text-[10px] font-black text-[#ff00ff] uppercase tracking-[0.2em]">Описание ✨</p>
    
//     {/* isDescOpen true (ochiq) bo'lganda rotate-180 bo'lib uchi pastga qaraydi */}
//     {/* isDescOpen false (yopiq) bo'lganda rotate-0 bo'lib uchi tepaga qaraydi */}
//     <span className={`text-[#ff00ff] transition-transform duration-300 ${isDescOpen ? 'rotate-180' : 'rotate-0'}`}>
//       <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
//         <path d="M18 15l-6-6-6 6"/> {/* Bu boshlang'ichda tepaga qaragan ^ shakl */}
//       </svg>
//     </span>
//   </button>

//   {/* Ochiladigan qism */}
//   <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isDescOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
//     <div className="p-5 pt-0 border-t border-white/5">
//       <div 
//         className="text-xs md:text-sm text-white/70 leading-relaxed prose prose-invert max-h-80 overflow-y-auto no-scrollbar"
//         dangerouslySetInnerHTML={{ 
//           __html: selectedItem?.description || '<span class="opacity-50 italic animate-pulse">Загрузка описания...</span>' 
//         }}
//       />
//     </div>
//   </div>
// </div>
//         </div>
//       )}

//       {/* Profile Modal */}
//       {isProfileModalOpen && (
//         <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/90 backdrop-blur-3xl animate-fade-in text-white">
//           <div className="relative w-full max-w-lg glass rounded-[40px] p-8 md:p-12 text-center border border-white/10 overflow-hidden bg-[#0a0a0c]">
//             <button onClick={() => setIsProfileModalOpen(false)} className="absolute top-6 right-6 text-3xl opacity-50 hover:opacity-100 transition-opacity">×</button>
            
//             <div className="relative w-32 h-32 md:w-44 md:h-44 mx-auto mb-6 group">
//               <div className="absolute inset-0 rounded-[40px] bg-[#ff00ff] blur-md opacity-20 group-hover:opacity-40 animate-pulse"></div>
//               <img src={user.avatar} className="relative w-full h-full rounded-3xl md:rounded-[40px] object-cover border-4 border-[#ff00ff] z-10" alt="avatar" />
//               <input type="file" ref={fileInputRef} onChange={handleAvatarChange} className="hidden" />
//               <button onClick={() => fileInputRef.current.click()} className="absolute -bottom-2 -right-2 bg-[#ff00ff] w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center z-20 shadow-xl hover:scale-110 transition-transform">📸</button>
//             </div>

//             <div className="space-y-1 mb-8">
//               <input 
//                 type="text" 
//                 value={user.name} 
//                 onChange={(e) => setUser({ ...user, name: e.target.value })} 
//                 className="w-full bg-transparent font-black uppercase text-center text-2xl outline-none border-b border-transparent focus:border-white/10" 
//               />
//               <p className={`text-[10px] md:text-xs font-black uppercase tracking-[0.3em] ${getRank(userStats.level).color}`}>
//                 {getRank(userStats.level).label}
//               </p>
//             </div>

//             <div className="bg-white/5 p-6 md:p-8 rounded-[35px] border border-white/5 relative">
//               <div className="flex justify-between items-end mb-4">
//                 <div className="text-left">
//                   <p className="text-[8px] font-black text-white/30 uppercase tracking-widest">Уровень</p>
//                   <p className="text-3xl font-black italic">{userStats.level}</p>
//                 </div>
//                 <div className="text-right">
//                   <p className="text-[8px] font-black text-white/30 uppercase tracking-widest">Опыт</p>
//                   <p className="text-sm font-black text-cyan-400">
//                     {userStats.xp} / 100
//                   </p>
//                 </div>
//               </div>

//               <div className="h-4 bg-black/50 rounded-full overflow-hidden p-[2px] border border-white/5">
//                 <div 
//                   className="h-full bg-gradient-to-r from-[#ff00ff] via-[#00ffff] to-[#ff00ff] rounded-full transition-all duration-1000" 
//                   style={{ width: `${(userStats.xp / 100) * 100}%` }} 
//                 />
//               </div>

//               <div className="mt-8 grid grid-cols-2 gap-3">
//                 <div className="bg-white/5 p-4 rounded-3xl border border-white/5">
//                   <p className="text-[8px] font-black text-white/30 uppercase mb-1 text-left">Завершено</p>
//                   <p className="text-xl font-black text-white italic text-left">{Object.values(library).filter(a => a.status === 'completed').length}</p>
//                 </div>
//                 <div className="bg-white/5 p-4 rounded-3xl border border-white/5">
//                   <p className="text-[8px] font-black text-white/30 uppercase mb-1 text-left">История</p>
//                   <p className="text-xl font-black text-white italic text-left">{history.length}</p>
//                 </div>
//                 {/* STATISTIKA */}
// <div className="mt-8 grid grid-cols-2 gap-3">
//   <div className="bg-white/5 p-4 rounded-3xl border border-white/5">
//     <p className="text-[8px] font-black text-white/30 uppercase mb-1 text-left">Завершено</p>
//     <p className="text-xl font-black text-white italic text-left">{Object.values(library).filter(a => a.status === 'completed').length}</p>
//   </div>
//   <div className="bg-white/5 p-4 rounded-3xl border border-white/5">
//     <p className="text-[8px] font-black text-white/30 uppercase mb-1 text-left">Часов</p>
//     <p className="text-xl font-black text-white italic text-left">
//       {Math.round(Object.values(library).filter(a => a.status === 'completed').length * 4.5)}
//     </p>
//   </div>
// </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//      {/* Toast */}
//       {showToast && history.length > 0 && (
//         <div className="fixed bottom-6 right-6 z-[10001] animate-fade-in w-[calc(100%-3rem)] md:w-96">
//           <div 
//             onClick={() => setSelectedItem(history[0])}
//             className={`p-4 rounded-2xl border-2 border-[#ff00ff] flex items-center gap-4 cursor-pointer hover:scale-105 transition-all shadow-[0_10px_40px_rgba(255,0,255,0.2)] 
//               ${isDarkMode 
//                 ? 'bg-[#12121a]/95 backdrop-blur-xl text-white' 
//                 : 'bg-white text-slate-900'
//               }`}
//           >
//             <div className="w-12 h-16 shrink-0 rounded-lg overflow-hidden border border-white/10">
//               <img src={getImg(history[0])} className="w-full h-full object-cover" alt="" />
//             </div>
//             <div className="flex-1 overflow-hidden">
//               <p className="text-[10px] font-black uppercase text-[#ff00ff] mb-1">Продолжить? ✨</p>
//               <h4 className={`text-xs font-black truncate uppercase italic ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
//                 {history[0].russian || history[0].name}
//               </h4>
//             </div>
//             <button 
//               onClick={(e) => { e.stopPropagation(); setShowToast(false); }} 
//               className={`text-xl p-2 transition-colors ${isDarkMode ? 'text-white/40 hover:text-white' : 'text-slate-400 hover:text-slate-900'}`}
//             >
//               ×
//             </button>
//           </div>
//         </div>
//       )}

//       <footer className="mt-20 py-16 border-t border-white/5 text-center">
//         <h2 className="text-2xl md:text-4xl font-black uppercase text-white mb-4">ANI<span className="text-[#ff00ff]">HUB</span></h2>
//         <p className="text-[10px] font-black uppercase tracking-[0.5em] opacity-20 text-white">© 2026 Developed by @Sh1zoK1ll</p>
//       </footer>

//       <style>{`
//   @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
//   @keyframes scroll { 0% { transform: translateX(0); } 100% { transform: translateX(calc(-320px * 15 - 2.5rem * 15)); } }
  
//   .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
//   .animate-infinite-scroll { 
//     display: flex; 
//     width: max-content; 
//     animation: scroll 60s linear infinite; 
//     will-change: transform; /* GPU uchun optimizatsiya */
//     backface-visibility: hidden;
//   }
  
//   /* Kuchsiz qurilmalarda blur effektini o'chirish yoki kamaytirish */
//   .glass { 
//     backdrop-filter: blur(10px); 
//     -webkit-backdrop-filter: blur(10px); 
//     background: ${isDarkMode ? 'rgba(15, 15, 20, 0.8)' : 'rgba(255, 255, 255, 0.9)'}; 
//   }

//   /* Rasm yuklanguncha joyini tayyorlab turish */
//   .img-container { aspect-ratio: 3/4.5; background: #1a1a1a; overflow: hidden; }
// `}</style>
//     </div>
//   );
// };

// export default App;