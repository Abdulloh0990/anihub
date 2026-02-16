import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import logo from './img/logo.png';

// ==================== CONSTANTS & CONFIGURATION ====================
const API = 'https://shikimori.one/api';
const ASSETS = 'https://shikimori.one';
const STORAGE_VERSION = 'v8_ultimate';
const AUTO_SAVE_DELAY = 1500;
// YANGI:
const SESSION_TIMEOUT = 30 * 24 * 60 * 60 * 1000; // 30 DAYS

const GENRES = [
  { id: 1, name: 'Сёнен', icon: '🔥', gradient: 'from-red-500 to-orange-500', desc: 'Боевики и приключения' },
  { id: 4, name: 'Комедия', icon: '😂', gradient: 'from-yellow-400 to-pink-400', desc: 'Смешные и веселые' },
  { id: 10, name: 'Фэнтези', icon: '🧙', gradient: 'from-purple-500 to-indigo-500', desc: 'Магия и волшебство' },
  { id: 2, name: 'Приключения', icon: '🗺️', gradient: 'from-green-400 to-cyan-400', desc: 'Путешествия и открытия' },
  { id: 8, name: 'Драма', icon: '😢', gradient: 'from-blue-500 to-purple-500', desc: 'Эмоциональные истории' },
  { id: 7, name: 'Мистика', icon: '🔮', gradient: 'from-violet-500 to-purple-600', desc: 'Тайны и загадки' },
  { id: 24, name: 'Фантастика', icon: '🚀', gradient: 'from-cyan-400 to-blue-500', desc: 'Будущее и технологии' },
  { id: 22, name: 'Романтика', icon: '❤️', gradient: 'from-pink-500 to-rose-500', desc: 'Любовные истории' },
  { id: 6, name: 'Демоны', icon: '👿', gradient: 'from-red-600 to-black', desc: 'Темная сторона' },
  { id: 11, name: 'Игры', icon: '🎮', gradient: 'from-indigo-500 to-cyan-500', desc: 'Виртуальные миры' }
];

const RANKS = [
  { min: 1, label: 'Новичок', color: 'text-gray-400', badge: '🌱', glow: 'shadow-gray-500/50' },
  { min: 10, label: 'Любитель', color: 'text-blue-400', badge: '⚡', glow: 'shadow-blue-500/50' },
  { min: 30, label: 'Ценитель', color: 'text-purple-400', badge: '💎', glow: 'shadow-purple-500/50' },
  { min: 60, label: 'Мастер', color: 'text-orange-400', badge: '🔥', glow: 'shadow-orange-500/50' },
  { min: 85, label: 'Элита', color: 'text-red-500', badge: '👑', glow: 'shadow-red-500/50' },
  { min: 100, label: 'Легенда', color: 'text-[#ff00ff]', badge: '⭐', glow: 'shadow-[#ff00ff]/80' }
];

const ACHIEVEMENTS = [
  { id: 'first_anime', name: 'Первый шаг', desc: 'Просмотрите первое аниме', icon: '🎬', xp: 10 },
  { id: 'rate_10', name: 'Критик', desc: 'Оцените 10 аниме', icon: '⭐', xp: 50 },
  { id: 'complete_50', name: 'Марафонец', desc: 'Завершите 50 аниме', icon: '🏃', xp: 100 },
  { id: 'level_10', name: 'Опытный', desc: 'Достигните 10 уровня', icon: '💪', xp: 75 },
  { id: 'binge_watcher', name: 'Запойный', desc: 'Просмотрите 5 аниме за день', icon: '📺', xp: 30 },
  { id: 'genre_master', name: 'Мастер жанров', desc: 'Все жанры освоены', icon: '🎭', xp: 150 },
  { id: 'social', name: 'Социальный', desc: 'Добавьте 20 в избранное', icon: '💬', xp: 40 },
  { id: 'reviewer', name: 'Рецензент', desc: 'Напишите 10 заметок', icon: '📝', xp: 60 },
  { id: 'collector', name: 'Коллекционер', desc: '100 аниме в библиотеке', icon: '📚', xp: 200 },
  { id: 'perfectionist', name: 'Перфекционист', desc: 'Поставьте 50 оценок "10"', icon: '🌟', xp: 150 },
  { id: 'early_bird', name: 'Ранняя пташка', desc: 'Зайдите в 6:00 утра', icon: '🌅', xp: 25 },
  { id: 'night_owl', name: 'Полуночник', desc: 'Зайдите после полуночи', icon: '🦉', xp: 25 },
  { id: 'week_streak', name: 'Неделя', desc: '7 дней подряд', icon: '📅', xp: 100 },
  { id: 'explorer', name: 'Исследователь', desc: 'Просмотрите все жанры', icon: '🗺️', xp: 80 },
  { id: 'speed_watcher', name: 'Скоростной', desc: '10 серий за день', icon: '⚡', xp: 50 }
];

const THEMES = {
  cyberpunk: {
    name: 'Киберпанк',
    icon: '🌃',
    primary: '#ff00ff',
    secondary: '#00ffff',
    bg: 'from-[#0a0a0f] via-[#1a0a2e] to-[#0f0a1e]',
    font: "'Orbitron', sans-serif"
  },
  synthwave: {
    name: 'Синтвейв',
    icon: '🌆',
    primary: '#ff006e',
    secondary: '#8338ec',
    bg: 'from-[#1a0033] via-[#2d0052] to-[#0d001a]',
    font: "'Audiowide', cursive"
  },
  matrix: {
    name: 'Матрица',
    icon: '💚',
    primary: '#00ff00',
    secondary: '#00cc00',
    bg: 'from-black via-[#001a00] to-black',
    font: "'Share Tech Mono', monospace"
  },
  sunset: {
    name: 'Закат',
    icon: '🌅',
    primary: '#ff6b35',
    secondary: '#f7931e',
    bg: 'from-[#1a0a00] via-[#331100] to-[#0d0500]',
    font: "'Righteous', cursive"
  },
  neon: {
    name: 'Неон',
    icon: '✨',
    primary: '#ff0080',
    secondary: '#00ff88',
    bg: 'from-[#0f0022] via-[#220033] to-[#0f0022]',
    font: "'Electrolize', sans-serif"
  },
  ocean: {
    name: 'Океан',
    icon: '🌊',
    primary: '#00d4ff',
    secondary: '#0066ff',
    bg: 'from-[#001a33] via-[#002244] to-[#001122]',
    font: "'Quicksand', sans-serif"
  },
  sakura: {
    name: 'Сакура',
    icon: '🌸',
    primary: '#ff69b4',
    secondary: '#ffb6c1',
    bg: 'from-[#1a0a14] via-[#2d1a28] to-[#0f050a]',
    font: "'Poppins', sans-serif"
  },
  tokyo: {
    name: 'Токио',
    icon: '🗼',
    primary: '#ff3366',
    secondary: '#3366ff',
    bg: 'from-[#0a0a1a] via-[#1a0a2a] to-[#0a0514]',
    font: "'Rajdhani', sans-serif"
  }
};

// Utility functions
const getRank = (lvl) => {
  return [...RANKS].reverse().find(r => lvl >= r.min) || RANKS[0];
};

const hashPassword = async (password) => {
  // Simple hash function (in production use proper crypto)
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
};

const generateSessionToken = () => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

// ==================== MAIN COMPONENT ====================
const App = () => {
  // ==================== AUTH STATE ====================
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [authError, setAuthError] = useState('');
  const [accounts, setAccounts] = useState({});
  const [currentAccount, setCurrentAccount] = useState(null);
  const [sessionToken, setSessionToken] = useState(null);
 const [rememberMe, setRememberMe] = useState(true);

  // ==================== APP STATE ====================
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
  const [showAchievement, setShowAchievement] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [sortBy, setSortBy] = useState('popularity');
  const [filterYear, setFilterYear] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [autoPlay, setAutoPlay] = useState(true);
  const [isDescOpen, setIsDescOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [friendsList, setFriendsList] = useState([]);
  const [dailyGoal, setDailyGoal] = useState(3);
  const [dailyProgress, setDailyProgress] = useState(0);
  
  const fileInputRef = useRef(null);
  const scrollRef = useRef(null);
  const saveTimerRef = useRef(null);

  // ==================== USER DATA STATE ====================
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [currentTheme, setCurrentTheme] = useState('cyberpunk');
  const [library, setLibrary] = useState({});
  const [history, setHistory] = useState([]);
  const [ratings, setRatings] = useState({});
  const [achievements, setAchievements] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [notes, setNotes] = useState({});
  const [user, setUser] = useState({
    name: 'Гость',
    avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Guest',
    bio: 'Добро пожаловать в AniHub! 🌟',
    xp: 0,
    joinDate: new Date().toISOString(),
    lastLogin: null,
    loginStreak: 0,
    totalLogins: 0
  });

  const theme = THEMES[currentTheme];

  // ==================== INITIALIZE APP ====================
  useEffect(() => {
    // Load accounts from localStorage
    const storedAccounts = localStorage.getItem('aniHub_accounts_v7');
    if (storedAccounts) {
      setAccounts(JSON.parse(storedAccounts));
    }

    // Check for existing session
    const storedSession = localStorage.getItem('aniHub_session');
    const storedUsername = localStorage.getItem('aniHub_username');
    
    if (storedSession && storedUsername) {
      const session = JSON.parse(storedSession);
      
      // Check if session is still valid
      if (Date.now() - session.timestamp < SESSION_TIMEOUT) {
        autoLogin(storedUsername, session.token);
      } else {
        // Session expired
        localStorage.removeItem('aniHub_session');
        localStorage.removeItem('aniHub_username');
      }
    }

    // Check for time-based achievements
    checkTimeAchievements();
  }, []);

  // ==================== USER STATS ====================
  const userStats = useMemo(() => {
    const level = Math.floor(user.xp / 100) + 1;
    const currentLevelXP = user.xp % 100;
    const totalWatched = Object.values(library).filter(a => a.status === 'completed').length;
    const totalRated = Object.keys(ratings).length;
    const avgRating = totalRated > 0 
      ? (Object.values(ratings).reduce((a, b) => a + b, 0) / totalRated).toFixed(1)
      : 0;
    const totalHours = Math.round(totalWatched * 4.5);
    const genresWatched = new Set(
      Object.values(library)
        .filter(a => a.status === 'completed')
        .flatMap(a => a.genres || [])
    ).size;
    const totalNotes = Object.keys(notes).filter(k => notes[k].text).length;
    const perfectRatings = Object.values(ratings).filter(r => r === 10).length;
    const watchingNow = Object.values(library).filter(a => a.status === 'watching').length;

    return { 
      level, 
      xp: currentLevelXP, 
      totalXp: user.xp, 
      nextLevelAt: 100,
      totalWatched,
      totalRated,
      avgRating,
      totalHours,
      genresWatched,
      totalNotes,
      perfectRatings,
      librarySize: Object.keys(library).length,
      favoritesCount: favorites.length,
      watchingNow,
      rank: getRank(level)
    };
  }, [user.xp, library, ratings, notes, favorites]);

  // ==================== AUTH FUNCTIONS ====================
  const checkTimeAchievements = () => {
    const hour = new Date().getHours();
    
    if (hour >= 5 && hour < 7 && !achievements.includes('early_bird')) {
      unlockAchievement('early_bird');
    }
    if ((hour >= 0 && hour < 3) && !achievements.includes('night_owl')) {
      unlockAchievement('night_owl');
    }
  };

  const unlockAchievement = (achievementId) => {
    if (!isLoggedIn || achievements.includes(achievementId)) return;
    
    const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
    if (achievement) {
      setAchievements(prev => [...prev, achievementId]);
      setUser(prev => ({ ...prev, xp: prev.xp + achievement.xp }));
      setShowAchievement(achievement);
      setTimeout(() => setShowAchievement(null), 5000);
    }
  };

  const handleRegister = async (username, password, email) => {
    setAuthError('');
    
    if (!username || !password) {
      setAuthError('Заполните все обязательные поля!');
      return;
    }
    
    if (accounts[username]) {
      setAuthError('Это имя пользователя уже занято!');
      return;
    }

    if (username.length < 3) {
      setAuthError('Имя пользователя должно быть не менее 3 символов!');
      return;
    }

    if (password.length < 6) {
      setAuthError('Пароль должен быть не менее 6 символов!');
      return;
    }

    const hashedPassword = await hashPassword(password);
    const newAccount = {
      username,
      passwordHash: hashedPassword,
      email,
      createdAt: new Date().toISOString(),
      userData: {
        user: {
          name: username,
          avatar: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${username}`,
          bio: `Привет! Я ${username} и я люблю аниме! 🎬`,
          xp: 0,
          joinDate: new Date().toISOString(),
          lastLogin: null,
          loginStreak: 0,
          totalLogins: 0
        },
        library: {},
        history: [],
        ratings: {},
        achievements: [],
        favorites: [],
        notes: {},
        watchlist: [],
        theme: 'cyberpunk',
        isDarkMode: true,
        dailyGoal: 3,
        dailyProgress: 0
      }
    };

    const updatedAccounts = { ...accounts, [username]: newAccount };
    setAccounts(updatedAccounts);
    localStorage.setItem('aniHub_accounts_v7', JSON.stringify(updatedAccounts));
    
    // Show success notification
    setNotifications(prev => [...prev, {
      id: Date.now(),
      type: 'success',
      message: `Добро пожаловать, ${username}! Регистрация успешна 🎉`
    }]);
    
    setTimeout(() => setAuthMode('login'), 1500);
  };

  const handleLogin = async (username, password) => {
    setAuthError('');
    
    if (!username || !password) {
      setAuthError('Заполните все поля!');
      return;
    }

    const account = accounts[username];
    
    if (!account) {
      setAuthError('Аккаунт не найден!');
      return;
    }

    const hashedPassword = await hashPassword(password);
    
    if (account.passwordHash !== hashedPassword) {
      setAuthError('Неверный пароль!');
      return;
    }

    // Create session
    const token = generateSessionToken();
    const session = {
      token,
      timestamp: Date.now()
    };

    // Load user data
    const userData = account.userData;
    
    // Update login stats
    const lastLogin = userData.user.lastLogin;
    const now = new Date();
    const lastLoginDate = lastLogin ? new Date(lastLogin) : null;
    
    let loginStreak = userData.user.loginStreak || 0;
    if (lastLoginDate) {
      const daysDiff = Math.floor((now - lastLoginDate) / (1000 * 60 * 60 * 24));
      if (daysDiff === 1) {
        loginStreak++;
      } else if (daysDiff > 1) {
        loginStreak = 1;
      }
    } else {
      loginStreak = 1;
    }

    const updatedUser = {
      ...userData.user,
      lastLogin: now.toISOString(),
      loginStreak,
      totalLogins: (userData.user.totalLogins || 0) + 1
    };

    setUser(updatedUser);
    setLibrary(userData.library || {});
    setHistory(userData.history || []);
    setRatings(userData.ratings || {});
    setAchievements(userData.achievements || []);
    setFavorites(userData.favorites || []);
    setNotes(userData.notes || {});
    setWatchlist(userData.watchlist || []);
    setCurrentTheme(userData.theme || 'cyberpunk');
    setIsDarkMode(userData.isDarkMode !== undefined ? userData.isDarkMode : true);
    setDailyGoal(userData.dailyGoal || 3);
    setDailyProgress(userData.dailyProgress || 0);

    setIsLoggedIn(true);
    setCurrentAccount(username);
    setSessionToken(token);
    
    // Save session
    if (rememberMe) {
      localStorage.setItem('aniHub_session', JSON.stringify(session));
      localStorage.setItem('aniHub_username', username);
    } else {
      sessionStorage.setItem('aniHub_session', JSON.stringify(session));
      sessionStorage.setItem('aniHub_username', username);
    }
    
    setShowAuthModal(false);
    
    // Check streak achievement
    if (loginStreak === 7 && !userData.achievements?.includes('week_streak')) {
      setTimeout(() => unlockAchievement('week_streak'), 1000);
    }
    
    // Welcome notification
    setNotifications(prev => [...prev, {
      id: Date.now(),
      type: 'success',
      message: `С возвращением, ${username}! 🎉 Серия входов: ${loginStreak} ${loginStreak === 1 ? 'день' : 'дня'}`
    }]);
  };

  const autoLogin = async (username, token) => {
    const account = accounts[username];
    if (!account) return;

    const userData = account.userData;
    setUser(userData.user);
    setLibrary(userData.library || {});
    setHistory(userData.history || []);
    setRatings(userData.ratings || {});
    setAchievements(userData.achievements || []);
    setFavorites(userData.favorites || []);
    setNotes(userData.notes || {});
    setWatchlist(userData.watchlist || []);
    setCurrentTheme(userData.theme || 'cyberpunk');
    setIsDarkMode(userData.isDarkMode !== undefined ? userData.isDarkMode : true);
    setDailyGoal(userData.dailyGoal || 3);
    setDailyProgress(userData.dailyProgress || 0);

    setIsLoggedIn(true);
    setCurrentAccount(username);
    setSessionToken(token);
  };

  const handleLogout = () => {
    if (confirm('Вы уверены, что хотите выйти из аккаунта?')) {
      saveUserData();
      
      // Clear session
      localStorage.removeItem('aniHub_session');
      localStorage.removeItem('aniHub_username');
      sessionStorage.removeItem('aniHub_session');
      sessionStorage.removeItem('aniHub_username');
      
      setIsLoggedIn(false);
      setCurrentAccount(null);
      setSessionToken(null);
      
      // Reset to guest
      setUser({
        name: 'Гость',
        avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Guest',
        bio: 'Добро пожаловать в AniHub! 🌟',
        xp: 0,
        joinDate: new Date().toISOString(),
        lastLogin: null,
        loginStreak: 0,
        totalLogins: 0
      });
      setLibrary({});
      setHistory([]);
      setRatings({});
      setAchievements([]);
      setFavorites([]);
      setNotes({});
      setWatchlist([]);
      setView('home');
      
      setNotifications(prev => [...prev, {
        id: Date.now(),
        type: 'info',
        message: 'Вы вышли из аккаунта. До встречи! 👋'
      }]);
    }
  };

  const saveUserData = useCallback(() => {
    if (!isLoggedIn || !currentAccount) return;

    const updatedAccounts = {
      ...accounts,
      [currentAccount]: {
        ...accounts[currentAccount],
        lastLogin: new Date().toISOString(),
        userData: {
          user,
          library,
          history,
          ratings,
          achievements,
          favorites,
          notes,
          watchlist,
          theme: currentTheme,
          isDarkMode,
          dailyGoal,
          dailyProgress
        }
      }
    };

    setAccounts(updatedAccounts);
    localStorage.setItem('aniHub_accounts_v7', JSON.stringify(updatedAccounts));
  }, [isLoggedIn, currentAccount, user, library, history, ratings, achievements, favorites, notes, watchlist, currentTheme, isDarkMode, dailyGoal, dailyProgress, accounts]);

  // Debounced auto-save
  useEffect(() => {
    if (isLoggedIn && currentAccount) {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
      
      saveTimerRef.current = setTimeout(() => {
        saveUserData();
      }, AUTO_SAVE_DELAY);
      
      return () => {
        if (saveTimerRef.current) {
          clearTimeout(saveTimerRef.current);
        }
      };
    }
  }, [user, library, history, ratings, achievements, favorites, notes, watchlist, currentTheme, isDarkMode, dailyGoal, dailyProgress, isLoggedIn, currentAccount, saveUserData]);

  // ==================== ACHIEVEMENTS SYSTEM ====================
  const checkAchievements = useCallback((type, data) => {
    if (!isLoggedIn) return;
    
    const newAchievements = [];
    
    if (type === 'watch' && userStats.totalWatched === 1 && !achievements.includes('first_anime')) {
      newAchievements.push('first_anime');
    }
    if (type === 'rate' && userStats.totalRated === 10 && !achievements.includes('rate_10')) {
      newAchievements.push('rate_10');
    }
    if (type === 'complete' && userStats.totalWatched === 50 && !achievements.includes('complete_50')) {
      newAchievements.push('complete_50');
    }
    if (type === 'level' && userStats.level === 10 && !achievements.includes('level_10')) {
      newAchievements.push('level_10');
    }
    if (type === 'genre' && userStats.genresWatched === GENRES.length && !achievements.includes('genre_master')) {
      newAchievements.push('genre_master');
    }
    if (type === 'favorite' && userStats.favoritesCount === 20 && !achievements.includes('social')) {
      newAchievements.push('social');
    }
    if (type === 'note' && userStats.totalNotes === 10 && !achievements.includes('reviewer')) {
      newAchievements.push('reviewer');
    }
    if (type === 'library' && userStats.librarySize === 100 && !achievements.includes('collector')) {
      newAchievements.push('collector');
    }
    if (type === 'perfect' && userStats.perfectRatings === 50 && !achievements.includes('perfectionist')) {
      newAchievements.push('perfectionist');
    }
    if (type === 'explorer' && userStats.genresWatched >= GENRES.length && !achievements.includes('explorer')) {
      newAchievements.push('explorer');
    }

    if (newAchievements.length > 0) {
      setAchievements(prev => [...prev, ...newAchievements]);
      const achievement = ACHIEVEMENTS.find(a => a.id === newAchievements[0]);
      if (achievement) {
        unlockAchievement(newAchievements[0]);
      }
    }
  }, [achievements, userStats, isLoggedIn]);

  // ==================== DATA FETCHING ====================
  const getImg = (item) => {
    if (!item?.image) return 'https://via.placeholder.com/225x320?text=No+Image';
    const path = item.image.original || (typeof item.image === 'string' ? item.image : '');
    return path.startsWith('http') ? path : ASSETS + path;
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const endpoint = view === 'manga' ? 'mangas' : 'animes';
      let order = sortBy;
      let url = `${API}/${endpoint}?limit=24&page=${page}&order=${order}`;
      
      if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;
      if (activeGenre) url += `&genre=${activeGenre}`;
      if (filterYear) url += `&season=${filterYear}`;

      const res = await fetch(url);
      const data = await res.json();
      setContent(Array.isArray(data) ? data : []);

      if (trending.length === 0) {
        const trendRes = await fetch(`${API}/animes?limit=20&order=popularity`);
        const trendData = await trendRes.json();
        setTrending(trendData);
      }
    } catch (err) {
      console.error("Ошибка загрузки:", err);
      setNotifications(prev => [...prev, {
        id: Date.now(),
        type: 'error',
        message: 'Ошибка загрузки данных. Попробуйте позже.'
      }]);
    } finally {
      setTimeout(() => setLoading(false), 300);
    }
  };

  useEffect(() => {
    if (view !== 'collection' && view !== 'history' && view !== 'trending_list' && view !== 'favorites' && view !== 'watchlist') {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [view, searchQuery, activeGenre, page, sortBy, filterYear]);

  useEffect(() => {
    const fetchDescription = async () => {
      if (selectedItem && selectedItem.id && !selectedItem.description) {
        try {
          const response = await fetch(`${API}/animes/${selectedItem.id}`);
          const data = await response.json();
          setSelectedItem(prev => ({
            ...prev,
            description: data.description_html || data.description || "Описание отсутствует.",
            genres: data.genres || [],
            studios: data.studios || [],
            screenshots: data.screenshots || []
          }));
        } catch (error) {
          console.error("Ошибка загрузки описания:", error);
        }
      }
    };
    fetchDescription();
  }, [selectedItem?.id]);

  // ==================== USER INTERACTIONS ====================
  const handleRating = (item, score) => {
    if (!isLoggedIn) {
      setShowAuthModal(true);
      setNotifications(prev => [...prev, {
        id: Date.now(),
        type: 'warning',
        message: 'Войдите в аккаунт, чтобы оценивать аниме!'
      }]);
      return;
    }
    
    setRatings(prev => ({ ...prev, [item.id]: score }));
    if (!library[item.id]) updateLibraryStatus(item, 'planned');
    setUser(prev => ({ ...prev, xp: prev.xp + 5 }));
    checkAchievements('rate', { score });
    if (score === 10) checkAchievements('perfect', {});
    
    setNotifications(prev => [...prev, {
      id: Date.now(),
      type: 'success',
      message: `Вы оценили "${item.russian || item.name}" на ${score}/10! (+5 XP)`
    }]);
  };

  const addToHistory = (item) => {
    const newItem = { 
      ...item, 
      date: new Date().toLocaleString('ru-RU'), 
      timestamp: Date.now() 
    };
    setHistory(prev => [newItem, ...prev.filter(h => h.id !== item.id)].slice(0, 100));
    
    if (isLoggedIn) {
      setUser(prev => ({ ...prev, xp: prev.xp + 2 }));
      
      // Update daily progress
      const today = new Date().toDateString();
      const lastProgressDate = localStorage.getItem('lastProgressDate');
      
      if (lastProgressDate !== today) {
        setDailyProgress(1);
        localStorage.setItem('lastProgressDate', today);
      } else {
        setDailyProgress(prev => Math.min(prev + 1, dailyGoal));
      }
    }
  };

  const updateLibraryStatus = (item, status) => {
    if (!isLoggedIn) {
      setShowAuthModal(true);
      setNotifications(prev => [...prev, {
        id: Date.now(),
        type: 'warning',
        message: 'Войдите в аккаунт, чтобы добавлять аниме в коллекцию!'
      }]);
      return;
    }
    
    const wasCompleted = library[item.id]?.status === 'completed';
    const isCompleting = status === 'completed' && !wasCompleted;
    
    setLibrary(prev => ({ 
      ...prev, 
      [item.id]: { 
        ...item, 
        status, 
        addedDate: new Date().toISOString(),
        genres: item.genres || []
      } 
    }));
    
    const xpGain = isCompleting ? 25 : 10;
    setUser(prev => ({ ...prev, xp: prev.xp + xpGain }));
    
    if (isCompleting) {
      checkAchievements('complete', { item });
      checkAchievements('genre', {});
      checkAchievements('explorer', {});
    }
    checkAchievements('library', {});
    
    const statusLabels = {
      watching: 'Смотрю',
      planned: 'В планах',
      completed: 'Завершено'
    };
    
    setNotifications(prev => [...prev, {
      id: Date.now(),
      type: 'success',
      message: `"${item.russian || item.name}" → ${statusLabels[status]} (+${xpGain} XP)`
    }]);
  };

  const toggleFavorite = (item) => {
    if (!isLoggedIn) {
      setShowAuthModal(true);
      setNotifications(prev => [...prev, {
        id: Date.now(),
        type: 'warning',
        message: 'Войдите в аккаунт, чтобы добавлять в избранное!'
      }]);
      return;
    }
    
    setFavorites(prev => {
      const exists = prev.find(f => f.id === item.id);
      if (exists) {
        setNotifications(prevNot => [...prevNot, {
          id: Date.now(),
          type: 'info',
          message: `Удалено из избранного`
        }]);
        return prev.filter(f => f.id !== item.id);
      } else {
        setUser(prevUser => ({ ...prevUser, xp: prevUser.xp + 5 }));
        checkAchievements('favorite', {});
        setNotifications(prevNot => [...prevNot, {
          id: Date.now(),
          type: 'success',
          message: `Добавлено в избранное! (+5 XP)`
        }]);
        return [...prev, { ...item, favoritedDate: new Date().toISOString() }];
      }
    });
  };

  const toggleWatchlist = (item) => {
    if (!isLoggedIn) {
      setShowAuthModal(true);
      return;
    }
    
    setWatchlist(prev => {
      const exists = prev.find(w => w.id === item.id);
      if (exists) {
        return prev.filter(w => w.id !== item.id);
      } else {
        setUser(prevUser => ({ ...prevUser, xp: prevUser.xp + 3 }));
        return [...prev, { ...item, addedDate: new Date().toISOString() }];
      }
    });
  };

  const addNote = (itemId, noteText) => {
    if (!isLoggedIn) return;
    setNotes(prev => ({
      ...prev,
      [itemId]: { text: noteText, date: new Date().toISOString() }
    }));
    if (noteText && !notes[itemId]?.text) checkAchievements('note', {});
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5000000) {
        setNotifications(prev => [...prev, {
          id: Date.now(),
          type: 'error',
          message: 'Файл слишком большой! Максимум 5MB'
        }]);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setUser({ ...user, avatar: reader.result });
        setNotifications(prev => [...prev, {
          id: Date.now(),
          type: 'success',
          message: 'Аватар обновлен!'
        }]);
      };
      reader.readAsDataURL(file);
    }
  };

  const getStatusLabel = (id) => {
    const map = { watching: 'Смотрю', planned: 'В планах', completed: 'Завершено' };
    return library[id]?.status ? map[library[id].status] : null;
  };

  const exportData = () => {
    if (!isLoggedIn) {
      setNotifications(prev => [...prev, {
        id: Date.now(),
        type: 'warning',
        message: 'Войдите в аккаунт для экспорта данных!'
      }]);
      return;
    }
    
    const data = {
      version: STORAGE_VERSION,
      exportDate: new Date().toISOString(),
      account: currentAccount,
      user,
      library,
      history,
      ratings,
      achievements,
      favorites,
      notes,
      watchlist,
      theme: currentTheme,
      isDarkMode,
      dailyGoal,
      dailyProgress
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `anihub-${currentAccount}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    setNotifications(prev => [...prev, {
      id: Date.now(),
      type: 'success',
      message: 'Данные успешно экспортированы! ✅'
    }]);
  };

  const importData = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          
          if (data.user) setUser(data.user);
          if (data.library) setLibrary(data.library);
          if (data.history) setHistory(data.history);
          if (data.ratings) setRatings(data.ratings);
          if (data.achievements) setAchievements(data.achievements);
          if (data.favorites) setFavorites(data.favorites);
          if (data.notes) setNotes(data.notes);
          if (data.watchlist) setWatchlist(data.watchlist);
          if (data.theme) setCurrentTheme(data.theme);
          if (data.isDarkMode !== undefined) setIsDarkMode(data.isDarkMode);
          if (data.dailyGoal) setDailyGoal(data.dailyGoal);
          if (data.dailyProgress !== undefined) setDailyProgress(data.dailyProgress);
          
          setNotifications(prev => [...prev, {
            id: Date.now(),
            type: 'success',
            message: 'Данные успешно импортированы! ✅'
          }]);
        } catch (err) {
          setNotifications(prev => [...prev, {
            id: Date.now(),
            type: 'error',
            message: 'Ошибка импорта данных! Проверьте файл. ❌'
          }]);
          console.error('Import error:', err);
        }
      };
      reader.readAsText(file);
    }
  };

  const displayContent = () => {
    if (view === 'collection') return Object.values(library);
    if (view === 'history') return history;
    if (view === 'trending_list') return trending;
    if (view === 'favorites') return favorites;
    if (view === 'watchlist') return watchlist;
    return content;
  };

  const finalContent = displayContent();

  const randomAnime = () => {
    if (content.length > 0) {
      const random = content[Math.floor(Math.random() * content.length)];
      setSelectedItem(random);
      addToHistory(random);
    }
  };

  const deleteAccount = () => {
    if (!isLoggedIn || !currentAccount) return;
    
    if (confirm('ВЫ УВЕРЕНЫ? Это удалит ваш аккаунт и все данные НАВСЕГДА!')) {
      if (confirm('ПОСЛЕДНЕЕ ПРЕДУПРЕЖДЕНИЕ! Восстановление невозможно. Продолжить?')) {
        const updatedAccounts = { ...accounts };
        delete updatedAccounts[currentAccount];
        localStorage.setItem('aniHub_accounts_v7', JSON.stringify(updatedAccounts));
        handleLogout();
        setNotifications(prev => [...prev, {
          id: Date.now(),
          type: 'info',
          message: 'Аккаунт удален. Спасибо за использование AniHub! 👋'
        }]);
      }
    }
  };

  // Clear old notifications
  useEffect(() => {
    if (notifications.length > 0) {
      const timer = setTimeout(() => {
        setNotifications(prev => prev.slice(1));
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notifications]);

  // ==================== RENDER ====================
  return (
    <div className={`min-h-screen font-sans transition-all duration-1000 ${
      isDarkMode 
        ? `bg-gradient-to-br ${theme.bg} text-white` 
        : 'bg-gradient-to-br from-[#f0f2f5] via-white to-[#e0e7ff] text-slate-900'
    }`}>
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@300;400;500;600;700&family=Orbitron:wght@400;700;900&family=Audiowide&family=Share+Tech+Mono&family=Righteous&family=Electrolize&family=Quicksand:wght@400;700&family=Poppins:wght@400;600;700;900&display=swap');
        
        * { 
          font-family: ${theme.font};
          -webkit-tap-highlight-color: transparent;
        }
        
        html { scroll-behavior: smooth; }
        
        img { 
          user-select: none;
          -webkit-user-drag: none;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideIn {
          from { transform: translateX(-100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideDown {
          from { transform: translateY(-100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.8; }
        }
        
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px ${theme.primary}80, 0 0 40px ${theme.primary}40; }
          50% { box-shadow: 0 0 30px ${theme.primary}ff, 0 0 60px ${theme.primary}80; }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(-350px * 20)); }
        }
        
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        .animate-fade-in { animation: fadeIn 0.5s ease-out forwards; }
        .animate-slide-in { animation: slideIn 0.4s ease-out forwards; }
        .animate-slide-in-right { animation: slideInRight 0.4s ease-out forwards; }
        .animate-slide-down { animation: slideDown 0.4s ease-out forwards; }
        .animate-pulse-slow { animation: pulse 3s ease-in-out infinite; }
        .animate-glow { animation: glow 2s ease-in-out infinite; }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-rotate { animation: rotate 10s linear infinite; }
        .animate-bounce-slow { animation: bounce 2s ease-in-out infinite; }
        .animate-gradient { animation: gradient 5s ease infinite; background-size: 200% 200%; }
        
        .animate-infinite-scroll {
          display: flex;
          width: max-content;
          animation: scroll 80s linear infinite;
          will-change: transform;
        }
        
        .animate-infinite-scroll:hover { animation-play-state: paused; }
        
        .glass {
          backdrop-filter: blur(16px) saturate(180%);
          -webkit-backdrop-filter: blur(16px) saturate(180%);
          background: ${isDarkMode ? 'rgba(10, 10, 20, 0.6)' : 'rgba(255, 255, 255, 0.6)'};
          border: 1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};
        }
        
        .glass-strong {
          backdrop-filter: blur(24px) saturate(200%);
          background: ${isDarkMode ? 'rgba(10, 10, 20, 0.85)' : 'rgba(255, 255, 255, 0.85)'};
          border: 1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)'};
        }
        
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: ${isDarkMode ? '#0a0a0f' : '#f0f0f0'}; }
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(${theme.primary}, ${theme.secondary});
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover { background: ${theme.primary}; }
        
        .card-hover {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .card-hover:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 20px 50px ${theme.primary}50;
        }
        
        .text-gradient {
          background: linear-gradient(135deg, ${theme.primary}, ${theme.secondary});
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .neon-text {
          text-shadow: 0 0 10px ${theme.primary}, 0 0 20px ${theme.primary};
        }
        
        .neon-border {
          box-shadow: 0 0 15px ${theme.primary}, inset 0 0 15px ${theme.primary};
        }

        .shimmer-overlay {
          position: absolute;
          top: -50%;
          left: -50%;
          right: -50%;
          bottom: -50%;
          background: linear-gradient(90deg, transparent, ${theme.primary}20, transparent);
          animation: shimmer 2s infinite;
        }
        
        @media (max-width: 768px) {
          .glass { backdrop-filter: blur(12px); }
          .glass-strong { backdrop-filter: blur(20px); }
        }

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>

      {/* Notifications */}
      <div className="fixed top-20 right-4 z-[10001] space-y-2 max-w-sm">
        {notifications.map((notif, idx) => (
          <div
            key={notif.id}
            className="animate-slide-in-right glass-strong p-4 rounded-xl border-2 shadow-2xl"
            style={{
              borderColor: notif.type === 'error' ? '#ef4444' : notif.type === 'warning' ? '#f59e0b' : notif.type === 'success' ? '#10b981' : theme.primary,
              animationDelay: `${idx * 0.1}s`
            }}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">
                {notif.type === 'error' ? '❌' : notif.type === 'warning' ? '⚠️' : notif.type === 'success' ? '✅' : 'ℹ️'}
              </span>
              <p className="text-sm font-bold">{notif.message}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Daily Goal Progress */}
      {isLoggedIn && (
        <div className="fixed bottom-4 left-4 z-[1000] glass-strong p-4 rounded-2xl border border-white/10 w-64 animate-slide-in">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-black uppercase opacity-70">Дневная цель</p>
            <span className="text-xs font-black" style={{ color: theme.primary }}>
              {dailyProgress}/{dailyGoal}
            </span>
          </div>
          <div className="h-2 bg-black/30 rounded-full overflow-hidden">
            <div
              className="h-full transition-all duration-500 rounded-full"
              style={{
                width: `${Math.min((dailyProgress / dailyGoal) * 100, 100)}%`,
                background: `linear-gradient(90deg, ${theme.primary}, ${theme.secondary})`
              }}
            />
          </div>
          {dailyProgress >= dailyGoal && (
            <p className="text-xs text-center mt-2 font-bold" style={{ color: theme.secondary }}>
              🎉 Цель достигнута!
            </p>
          )}
        </div>
      )}

      {/* Header - Same as before but optimized */}
      <header className="sticky top-0 z-[1000] glass-strong border-b border-white/10 backdrop-blur-2xl animate-slide-down">
        <div className="max-w-[1920px] mx-auto px-3 md:px-6 py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 md:gap-6 shrink-0">
            <div 
              onClick={() => { setView('home'); setPage(1); setActiveGenre(null); setSearchQuery(''); }} 
              className="flex items-center gap-2 cursor-pointer group"
            >
              <div className="relative w-8 h-8 md:w-12 md:h-12 overflow-hidden rounded-lg md:rounded-xl neon-border animate-glow">
                <div className="absolute inset-0 bg-gradient-to-br" style={{
                  backgroundImage: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`
                }} />
                <img 
                  src={logo} 
                  alt="AniHub"
                  className="relative w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 mix-blend-overlay"
                />
              </div>
              <h1 className="text-lg md:text-2xl font-black tracking-tighter uppercase hidden sm:block">
                ANI<span style={{ color: theme.primary }}>HUB</span>
              </h1>
            </div>

            <nav className="hidden lg:flex gap-4">
              {[
                { key: 'home', label: 'Главная', icon: '🏠' },
                { key: 'manga', label: 'Манга', icon: '📚' },
                { key: 'trending_list', label: 'Тренды', icon: '🔥' },
                { key: 'favorites', label: 'Избранное', icon: '❤️' },
                { key: 'collection', label: 'Коллекция', icon: '📁' }
                
              ].map(m => (
                <button
                  key={m.key}
                  onClick={() => setView(m.key)}
                  className={`text-[10px] font-black uppercase tracking-wider transition-all relative group ${
                    view === m.key ? 'neon-text scale-110' : 'opacity-60 hover:opacity-100'
                  }`}
                  style={{ color: view === m.key ? theme.primary : undefined }}
                >
                  <span className="mr-1">{m.icon}</span>
                  {m.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex-1 max-w-md mx-2">
            <div className="relative">
              <input
                type="text"
                placeholder="🔍 Поиск..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full py-2 md:py-3 px-3 md:px-4 pl-10 rounded-lg md:rounded-xl glass border-2 transition-all font-bold text-xs ${
                  isDarkMode 
                    ? 'bg-white/5 text-white placeholder-white/40' 
                    : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
                }`}
                style={{
                  borderColor: searchQuery ? theme.primary : 'transparent'
                }}
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-lg">🔍</div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button 
              onClick={randomAnime}
              className="hidden sm:flex items-center gap-1 px-3 py-2 glass rounded-lg hover:scale-105 transition-all text-xs font-black"
            >
              <span className="animate-rotate">🎲</span>
            </button>
            
            {!isLoggedIn ? (
              <button 
                onClick={() => setShowAuthModal(true)}
                className="px-3 md:px-4 py-2 rounded-lg font-black uppercase text-xs text-white hover:scale-105 transition-all"
                style={{
                  background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`
                }}
              >
                Войти
              </button>
            ) : (
              <>
                <button 
                  onClick={() => setIsSettingsOpen(true)}
                  className="w-8 h-8 md:w-10 md:h-10 rounded-lg glass flex items-center justify-center hover:scale-105 transition-all"
                >
                  ⚙️
                </button>
                
                <div 
                  onClick={() => setIsProfileModalOpen(true)} 
                  className="relative cursor-pointer group"
                >
                  <div className="absolute inset-0 rounded-lg animate-glow" style={{
                    boxShadow: `0 0 15px ${theme.primary}60`
                  }} />
                  <img 
                    src={user.avatar} 
                    className="relative w-8 h-8 md:w-10 md:h-10 rounded-lg object-cover border-2 group-hover:scale-110 transition-transform" 
                    style={{ borderColor: theme.primary }}
                    alt="Avatar" 
                  />
                  {achievements.length > 0 && (
                    <div 
                      className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black text-white"
                      style={{ background: theme.primary }}
                    >
                      {achievements.length}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="lg:hidden flex overflow-x-auto no-scrollbar gap-1 px-3 py-2 border-t border-white/5">
          {[
            { key: 'home', label: 'Главная', icon: '🏠' },
            { key: 'manga', label: 'Манга', icon: '📚' },
            { key: 'trending_list', label: 'Тренды', icon: '🔥' },
            { key: 'favorites', label: 'Избранное', icon: '❤️' },
            { key: 'collection', label: 'Коллекция', icon: '📁' },
            { key: 'watchlist', label: 'Список', icon: '📋' },
            { key: 'history', label: 'История', icon: '📜' }
          ].map(m => (
            <button
              key={m.key}
              onClick={() => setView(m.key)}
              className={`text-[9px] font-black uppercase whitespace-nowrap px-3 py-1.5 rounded-lg transition-all ${
                view === m.key ? 'text-white' : 'bg-white/5 opacity-60'
              }`}
              style={{
                background: view === m.key ? `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})` : undefined
              }}
            >
              {m.icon} {m.label}
            </button>
          ))}
        </div>
      </header>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/95 backdrop-blur-3xl animate-fade-in">
          <div className="relative w-full max-w-md glass-strong rounded-2xl p-6 border border-white/10">
            <button 
              onClick={() => { setShowAuthModal(false); setAuthError(''); }} 
              className="absolute top-4 right-4 text-xl opacity-50 hover:opacity-100 transition-opacity"
            >
              ×
            </button>
            
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                   style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})` }}>
                {authMode === 'login' ? '🔐' : '✨'}
              </div>
              <h2 className="text-2xl font-black uppercase text-gradient">
                {authMode === 'login' ? 'Вход' : 'Регистрация'}
              </h2>
            </div>

            {authError && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/20 border-2 border-red-500 text-red-400 text-sm font-bold text-center animate-fade-in">
                {authError}
              </div>
            )}

            <AuthForm 
              mode={authMode}
              onLogin={handleLogin}
              onRegister={handleRegister}
              theme={theme}
              isDarkMode={isDarkMode}
              rememberMe={rememberMe}
              setRememberMe={setRememberMe}
              
            />

            <div className="mt-4 text-center">
              <button
                onClick={() => { setAuthMode(authMode === 'login' ? 'register' : 'login'); setAuthError(''); }}
                className="text-xs opacity-70 hover:opacity-100 transition-opacity font-bold"
                style={{ color: theme.secondary }}
              >
                {authMode === 'login' ? '✨ Нет аккаунта? Зарегистрируйтесь' : '🔐 Есть аккаунт? Войдите'}
              </button>
            </div>
            
            <div className="mt-4 p-3 glass rounded-xl text-center">
              <p className="text-xs opacity-60">
                Пользователей: <span className="font-black" style={{ color: theme.primary }}>{Object.keys(accounts).length}</span>
              </p>
            </div>
          </div>
        </div>
      )}

 {/* Hero Trending Section - AUTO ROTATING */}
{view === 'home' && !searchQuery && page === 1 && trending.length > 0 && (
  <section className="mt-6 overflow-hidden py-6 animate-fade-in">
    <div className="px-4 md:px-6 mb-4">
      <h3 className="text-xl md:text-3xl font-black italic uppercase text-gradient">
        🔥 В ТРЕНДЕ
      </h3>
    </div>
    
    <div className="relative">
      <div className="animate-infinite-scroll flex gap-4" ref={scrollRef}>
        {[...trending, ...trending].map((item, i) => (
          <div 
            key={`${item.id}-${i}`} 
            onClick={() => { setSelectedItem(item); addToHistory(item); }} 
            className="w-56 md:w-72 group cursor-pointer relative shrink-0 card-hover"
          >
            <div className="relative aspect-video rounded-xl overflow-hidden glass border-2 border-transparent group-hover:neon-border transition-all">
              <img 
                src={getImg(item)} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                alt="" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
              
              <div className="absolute bottom-3 left-3 right-3 z-10">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded-lg text-[9px] font-black uppercase text-white" 
                        style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})` }}>
                    #{i % 20 + 1}
                  </span>
                  <span className="px-2 py-0.5 rounded-lg bg-black/60 text-[9px] font-black text-yellow-400">
                    ⭐ {item.score || '?'}
                  </span>
                </div>
                <h4 className="text-xs md:text-sm font-black text-white truncate">
                  {item.russian || item.name}
                </h4>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
)}

      {/* Main Content - Optimized */}
      <div className="max-w-[1920px] mx-auto px-3 md:px-6 py-6 flex flex-col lg:flex-row gap-6">
        {/* Sidebar - Compact */}
        <aside className="w-full lg:w-64 shrink-0 space-y-4 animate-slide-in">
          <div className="glass-strong p-4 rounded-2xl sticky top-20 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[9px] font-black uppercase opacity-50">Фильтры</p>
              <button 
                onClick={() => { setActiveGenre(null); setFilterYear(null); setSortBy('popularity'); }}
                className="text-[9px] font-black uppercase opacity-50 hover:opacity-100"
                style={{ color: theme.primary }}
              >
                Сбросить
              </button>
            </div>

            <div className="mb-4">
              <p className="text-[8px] font-black uppercase opacity-50 mb-2">Сортировка</p>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { value: 'popularity', label: 'Популярность', icon: '🔥' },
                  { value: 'ranked', label: 'Рейтинг', icon: '⭐' },
                  { value: 'aired_on', label: 'Дата', icon: '📅' },
                  { value: 'name', label: 'Название', icon: '🔤' }
                ].map(sort => (
                  <button
                    key={sort.value}
                    onClick={() => setSortBy(sort.value)}
                    className={`py-2 rounded-lg text-[8px] font-black uppercase transition-all ${
                      sortBy === sort.value ? 'text-white' : 'bg-white/5 opacity-60'
                    }`}
                    style={{
                      background: sortBy === sort.value ? `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})` : undefined
                    }}
                  >
                    {sort.icon}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[8px] font-black uppercase opacity-50 mb-2">Жанры</p>
              <div className="space-y-1.5 max-h-60 overflow-y-auto no-scrollbar">
                <button 
                  onClick={() => setActiveGenre(null)} 
                  className={`w-full py-2 rounded-lg text-[9px] font-black uppercase transition-all ${
                    !activeGenre ? 'text-white' : 'bg-white/5 opacity-60'
                  }`}
                  style={{
                    background: !activeGenre ? `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})` : undefined
                  }}
                >
                  🧩 Все
                </button>
                
                {GENRES.map(g => (
                  <button 
                    key={g.id} 
                    onClick={() => setActiveGenre(g.id)} 
                    className={`w-full py-2 rounded-lg text-[9px] font-black uppercase transition-all ${
                      activeGenre === g.id ? 'text-white' : 'bg-white/5 opacity-60'
                    }`}
                    style={{
                      background: activeGenre === g.id ? `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})` : undefined
                    }}
                  >
                    {g.icon} {g.name}
                  </button>
                ))}
              </div>
            </div>

            {isLoggedIn && (
              <div className="mt-4 p-3 glass rounded-xl">
                <p className="text-[9px] font-black uppercase mb-2 opacity-50">Статистика</p>
                <div className="space-y-1 text-[10px]">
                  <div className="flex justify-between">
                    <span className="opacity-70">Уровень:</span>
                    <span className="font-black" style={{ color: theme.primary }}>{userStats.level}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-70">XP:</span>
                    <span className="font-black" style={{ color: theme.secondary }}>{userStats.totalXp}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-70">Завершено:</span>
                    <span className="font-black">{userStats.totalWatched}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Main Content Grid */}
        <main className="flex-1 animate-fade-in">
          <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
            <div>
              <h2 className="text-2xl md:text-4xl font-black italic uppercase tracking-tighter text-gradient">
                {view === 'history' ? '📜 История' : 
                 view === 'collection' ? '📁 Коллекция' : 
                 view === 'manga' ? '📚 Манга' : 
                 view === 'trending_list' ? '🔥 Тренды' : 
                 view === 'favorites' ? '❤️ Избранное' : 
                 view === 'watchlist' ? '📋 Список просмотра' :
                 '🎬 Каталог'}
              </h2>
              <p className="text-xs opacity-60">
                <span className="font-black" style={{ color: theme.primary }}>{finalContent.length}</span> результатов
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex gap-1 glass p-1 rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${
                    viewMode === 'grid' ? 'text-white' : 'opacity-60'
                  }`}
                  style={{
                    background: viewMode === 'grid' ? `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})` : undefined
                  }}
                >
                  ⊞
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${
                    viewMode === 'list' ? 'text-white' : 'opacity-60'
                  }`}
                  style={{
                    background: viewMode === 'list' ? `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})` : undefined
                  }}
                >
                  ☰
                </button>
              </div>

              {['home', 'manga', 'top'].includes(view) && (
                <div className="flex items-center gap-2 glass p-1 rounded-lg">
                  <button 
                    onClick={() => setPage(p => Math.max(1, p - 1))} 
                    className="w-8 h-8 rounded-lg glass flex items-center justify-center text-lg hover:scale-110 transition-all"
                    style={{ color: theme.primary }}
                    disabled={page === 1}
                  >
                    ‹
                  </button>
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm text-white"
                    style={{
                      background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`
                    }}
                  >
                    {page}
                  </div>
                  <button 
                    onClick={() => setPage(p => p + 1)} 
                    className="w-8 h-8 rounded-lg glass flex items-center justify-center text-lg hover:scale-110 transition-all"
                    style={{ color: theme.primary }}
                  >
                    ›
                  </button>
                </div>
              )}
            </div>
          </div>

          {loading ? (
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3" 
              : "space-y-3"
            }>
              {[...Array(10)].map((_, i) => (
                <div 
                  key={i} 
                  className={viewMode === 'grid'
                    ? "aspect-[3/4.5] rounded-xl glass animate-pulse"
                    : "h-24 rounded-xl glass animate-pulse"
                  } 
                />
              ))}
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {finalContent.map((item, idx) => (
                <div 
                  key={`${item.id}-${idx}`} 
                  onClick={() => { setSelectedItem(item); addToHistory(item); }} 
                  className="group relative cursor-pointer animate-fade-in card-hover"
                  style={{ animationDelay: `${idx * 0.03}s` }}
                >
                  <div className="relative aspect-[3/4.5] rounded-xl overflow-hidden glass border-2 border-transparent group-hover:neon-border transition-all bg-black">
                    
                    {getStatusLabel(item.id) && (
                      <div className="absolute top-2 left-2 z-30 px-2 py-1 rounded-lg font-black text-[8px] uppercase text-white glass-strong">
                        {getStatusLabel(item.id)}
                      </div>
                    )}

                    {ratings[item.id] && (
                      <div 
                        className="absolute top-2 right-2 z-30 px-2 py-1 rounded-lg font-black text-[8px] uppercase text-white"
                        style={{
                          background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`
                        }}
                      >
                        ⭐ {ratings[item.id]}
                      </div>
                    )}

                    <button
                      onClick={(e) => { e.stopPropagation(); toggleFavorite(item); }}
                      className="absolute bottom-2 right-2 z-30 w-8 h-8 rounded-full glass flex items-center justify-center hover:scale-110 transition-all"
                    >
                      <span className="text-lg">
                        {favorites.find(f => f.id === item.id) ? '❤️' : '🤍'}
                      </span>
                    </button>

                    <img 
                      src={getImg(item)} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:opacity-30" 
                      alt="" 
                      loading="lazy"
                    />

                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-3 opacity-0 group-hover:opacity-100 transition-all duration-500 bg-black/60 backdrop-blur-md">
                      <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-500 text-center">
                        <div 
                          className="w-12 h-12 rounded-full flex items-center justify-center mb-2 mx-auto"
                          style={{
                            background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`
                          }}
                        >
                          <span className="text-white text-xl">▶</span>
                        </div>
                        <p className="text-white text-xs font-black uppercase">
                          Смотреть
                        </p>
                      </div>
                    </div>

                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent z-10 group-hover:opacity-0 transition-opacity" />
                    <div className="absolute bottom-3 left-3 right-3 z-10 group-hover:opacity-0 transition-opacity">
                      <h3 className="font-black text-[10px] uppercase leading-tight line-clamp-2 text-white neon-text">
                        {item.russian || item.name}
                      </h3>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {finalContent.map((item, idx) => (
                <div
                  key={`${item.id}-${idx}`}
                  onClick={() => { setSelectedItem(item); addToHistory(item); }}
                  className="flex gap-3 glass-strong p-3 rounded-xl border border-white/10 hover:scale-[1.01] transition-all cursor-pointer animate-fade-in"
                  style={{ animationDelay: `${idx * 0.03}s` }}
                >
                  <img
                    src={getImg(item)}
                    className="w-16 h-24 object-cover rounded-lg"
                    alt=""
                    loading="lazy"
                  />
                  <div className="flex-1">
                    <h3 className="text-sm font-black mb-1 neon-text line-clamp-1">
                      {item.russian || item.name}
                    </h3>
                    <div className="flex flex-wrap gap-1 mb-1">
                      <span className="px-2 py-0.5 rounded-lg bg-white/10 text-[9px] font-black">
                        {item.kind}
                      </span>
                      {item.score && (
                        <span className="px-2 py-0.5 rounded-lg bg-yellow-500/20 text-[9px] font-black text-yellow-400">
                          ⭐ {item.score}
                        </span>
                      )}
                    </div>
                    {getStatusLabel(item.id) && (
                      <span 
                        className="inline-block px-2 py-0.5 rounded-lg text-[9px] font-black text-white"
                        style={{
                          background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`
                        }}
                      >
                        {getStatusLabel(item.id)}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleFavorite(item); }}
                    className="flex items-center justify-center w-10 h-10 rounded-lg glass hover:scale-110 transition-all"
                  >
                    <span className="text-xl">
                      {favorites.find(f => f.id === item.id) ? '❤️' : '🤍'}
                    </span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Modal Player - Compact version */}
      {selectedItem && (
        <div className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-xl flex flex-col animate-fade-in">
          <div className="relative z-[100] h-14 px-4 flex items-center justify-between glass-strong border-b border-white/10">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setSelectedItem(null)} 
                className="w-8 h-8 rounded-lg glass hover:scale-110 text-white flex items-center justify-center transition-all text-lg"
              >
                ←
              </button>
              <h3 className="text-white font-black uppercase text-xs truncate max-w-[200px] md:max-w-2xl">
                {selectedItem.russian || selectedItem.name}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); toggleFavorite(selectedItem); }}
                className="w-8 h-8 rounded-lg glass hover:scale-110 transition-all flex items-center justify-center"
              >
                <span className="text-lg">
                  {favorites.find(f => f.id === selectedItem.id) ? '❤️' : '🤍'}
                </span>
              </button>
              <button 
                onClick={() => setSelectedItem(null)} 
                className="w-8 h-8 rounded-lg glass hover:bg-red-500 text-white flex items-center justify-center text-lg transition-all"
              >
                ×
              </button>
            </div>
          </div>

          <div className="relative z-10 flex-1 flex flex-col lg:flex-row overflow-hidden">
            <div className="w-full lg:w-80 overflow-y-auto glass-strong border-r border-white/10 p-4 no-scrollbar order-2 lg:order-1">
              <div className="grid grid-cols-2 gap-2 mb-4">
                {[
                  { label: 'Рейтинг', value: `${selectedItem.score || '0.0'} ★`, color: 'text-yellow-400' },
                  { label: 'Формат', value: selectedItem.kind, color: 'text-cyan-400' },
                  { label: 'Год', value: selectedItem.aired_on?.split('-')[0] || 'N/A', color: 'text-white' },
                  { label: 'Статус', value: selectedItem.status || 'N/A', color: 'text-green-400' }
                ].map((info, i) => (
                  <div key={i} className="bg-white/5 p-2 rounded-lg">
                    <p className="text-white/20 text-[7px] font-black uppercase">{info.label}</p>
                    <p className={`text-[10px] font-black ${info.color}`}>{info.value}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-1.5 mb-4">
                <p className="text-[8px] font-black text-white/30 uppercase">Статус</p>
                <div className="flex flex-col gap-1.5">
                  {[
                    { key: 'watching', label: '👁️ Смотрю' },
                    { key: 'planned', label: '⏳ В планах' },
                    { key: 'completed', label: '✅ Завершено' }
                  ].map(st => (
                    <button 
                      key={st.key} 
                      onClick={() => updateLibraryStatus(selectedItem, st.key)} 
                      className={`w-full py-2 rounded-lg font-black uppercase text-[8px] transition-all ${
                        library[selectedItem.id]?.status === st.key ? 'text-white' : 'bg-white/5 text-white/40'
                      }`}
                      style={{
                        background: library[selectedItem.id]?.status === st.key ? `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})` : undefined
                      }}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <h4 className="text-white/20 font-black uppercase text-[8px]">Оценка</h4>
                <div className="grid grid-cols-5 gap-1">
                  {[1,2,3,4,5,6,7,8,9,10].map(score => (
                    <button 
                      key={score} 
                      onClick={() => handleRating(selectedItem, score)} 
                      className={`aspect-square rounded-lg font-black text-[10px] transition-all ${
                        ratings[selectedItem.id] === score ? 'text-white scale-110' : 'bg-white/5 text-white/30'
                      }`}
                      style={{
                        background: ratings[selectedItem.id] === score ? `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})` : undefined
                      }}
                    >
                      {score}
                    </button>
                  ))}
                </div>
              </div>

              {isLoggedIn && (
                <div className="space-y-2 mb-4">
                  <h4 className="text-white/20 font-black uppercase text-[8px]">Заметки</h4>
                  <textarea
                    placeholder="Ваши мысли..."
                    value={notes[selectedItem.id]?.text || ''}
                    onChange={(e) => addNote(selectedItem.id, e.target.value)}
                    className="w-full p-2 rounded-lg glass border border-white/10 text-[10px] resize-none h-20 focus:outline-none"
                    style={{
                      borderColor: notes[selectedItem.id]?.text ? theme.primary : undefined
                    }}
                  />
                </div>
              )}

              <div className="border border-white/5 rounded-xl overflow-hidden glass">
                <button 
                  onClick={() => setIsDescOpen(!isDescOpen)}
                  className="w-full flex items-center justify-between p-3 hover:bg-white/5 transition-colors"
                >
                  <p className="text-[8px] font-black uppercase" style={{ color: theme.primary }}>
                    📝 Описание
                  </p>
                  <span style={{ 
                    color: theme.primary,
                    transform: isDescOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.3s'
                  }}>
                    ▼
                  </span>
                </button>
                {isDescOpen && (
                  <div className="p-3 pt-0 border-t border-white/5">
                    <div 
                      className="text-[10px] text-white/70 leading-relaxed max-h-40 overflow-y-auto no-scrollbar prose prose-invert"
                      dangerouslySetInnerHTML={{ 
                        __html: selectedItem?.description || '<span class="opacity-50 italic">Загрузка...</span>' 
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 bg-black flex items-center justify-center order-1 lg:order-2 relative">
              {selectedItem.kind === 'manga' ? (
                <div className="w-full h-full overflow-y-auto flex flex-col items-center py-8 no-scrollbar">
                  <img 
                    src={getImg(selectedItem)} 
                    className="w-48 md:w-60 rounded-2xl border-4 mb-4 shadow-2xl" 
                    style={{ borderColor: theme.primary }}
                    alt="" 
                  />
                  <a 
                    href={`https://shikimori.one${selectedItem.url}`} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="px-8 py-3 rounded-xl font-black uppercase hover:scale-105 transition-transform text-white text-sm"
                    style={{
                      background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`
                    }}
                  >
                    📖 Читать на Shikimori
                  </a>
                </div>
              ) : (
                <div className="w-full h-full">
                  <iframe 
                    src={`https://kodik.info/find-player?shikimoriID=${selectedItem.id}`} 
                    className="w-full h-full border-0" 
                    allowFullScreen 
                    allow="autoplay; fullscreen"
                    title="Anime Player"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Compact Profile Modal */}
      {isProfileModalOpen && isLoggedIn && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/95 backdrop-blur-3xl animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-lg glass-strong rounded-2xl p-6 border border-white/10 my-8">
            <button 
              onClick={() => setIsProfileModalOpen(false)} 
              className="absolute top-4 right-4 text-xl opacity-50 hover:opacity-100 transition-opacity z-10"
            >
              ×
            </button>
            
            <div className="relative w-20 h-20 mx-auto mb-3 group">
              <div 
                className="absolute inset-0 rounded-2xl blur-md opacity-40"
                style={{ background: theme.primary }}
              />
              <img 
                src={user.avatar} 
                className="relative w-full h-full rounded-2xl object-cover border-4 z-10" 
                style={{ borderColor: theme.primary }}
                alt="avatar" 
              />
              <input type="file" ref={fileInputRef} onChange={handleAvatarChange} className="hidden" accept="image/*" />
              <button 
                onClick={() => fileInputRef.current.click()} 
                className="absolute -bottom-1 -right-1 w-8 h-8 rounded-lg flex items-center justify-center z-20 shadow-xl hover:scale-110 transition-transform text-sm"
                style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})` }}
              >
                📸
              </button>
            </div>

            <div className="space-y-0.5 mb-4 text-center">
              <input 
                type="text" 
                value={user.name} 
                onChange={(e) => setUser({ ...user, name: e.target.value })} 
                className="w-full bg-transparent font-black uppercase text-center text-lg outline-none border-b border-transparent focus:border-white/10 text-white" 
                maxLength={20}
              />
              <p 
                className={`text-[10px] font-black uppercase tracking-wider ${userStats.rank.color}`}
              >
                {userStats.rank.badge} {userStats.rank.label}
              </p>
              <p className="text-[10px] opacity-50">
                {new Date(user.joinDate).toLocaleDateString('ru-RU')}
              </p>
              <p className="text-[10px] font-black" style={{ color: theme.secondary }}>
                🔥 Серия: {user.loginStreak} {user.loginStreak === 1 ? 'день' : 'дней'}
              </p>
            </div>

            <div className="glass-strong p-4 rounded-xl border border-white/10 mb-4">
              <div className="flex justify-between items-end mb-2">
                <div>
                  <p className="text-[7px] font-black text-white/30 uppercase">Уровень</p>
                  <p className="text-xl font-black" style={{ color: theme.primary }}>
                    {userStats.level}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[7px] font-black text-white/30 uppercase">Опыт</p>
                  <p className="text-xs font-black" style={{ color: theme.secondary }}>
                    {userStats.xp} / 100
                  </p>
                </div>
              </div>

              <div className="h-2 bg-black/50 rounded-full overflow-hidden p-[2px]">
                <div 
                  className="h-full rounded-full transition-all duration-1000"
                  style={{ 
                    width: `${(userStats.xp / 100) * 100}%`,
                    background: `linear-gradient(90deg, ${theme.primary}, ${theme.secondary})`
                  }} 
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-4">
              {[
                { label: 'Завершено', value: userStats.totalWatched, icon: '✅' },
                { label: 'Смотрю', value: userStats.watchingNow, icon: '👁️' },
                { label: 'Часов', value: userStats.totalHours, icon: '⏱️' },
                { label: 'Оценено', value: userStats.totalRated, icon: '⭐' },
                { label: 'Избранное', value: favorites.length, icon: '❤️' },
                { label: 'Заметок', value: userStats.totalNotes, icon: '📝' }
              ].map((stat, i) => (
                <div 
                  key={i}
                  className="glass p-2 rounded-xl border border-white/5 hover:scale-105 transition-all"
                >
                  <p className="text-[7px] font-black text-white/30 uppercase text-left">{stat.label}</p>
                  <div className="flex items-center gap-1">
                    <span className="text-sm">{stat.icon}</span>
                    <p className="text-sm font-black text-white">{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2 mb-4">
              <h4 className="text-[10px] font-black uppercase opacity-50">
                Достижения ({achievements.length}/{ACHIEVEMENTS.length})
              </h4>
              <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto no-scrollbar">
                {ACHIEVEMENTS.map(ach => (
                  <div
                    key={ach.id}
                    className={`p-2 rounded-lg border transition-all ${
                      achievements.includes(ach.id)
                        ? 'glass-strong border-white/20'
                        : 'bg-white/5 border-white/5 opacity-40'
                    }`}
                  >
                    <div className="text-lg mb-0.5">{ach.icon}</div>
                    <p className="text-[8px] font-black uppercase leading-tight">{ach.name}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={exportData}
                className="flex-1 py-2.5 rounded-lg glass hover:scale-105 transition-all font-black uppercase text-[10px]"
              >
                💾 Экспорт
              </button>
              <label className="flex-1">
                <input type="file" onChange={importData} className="hidden" accept=".json" />
                <div className="py-2.5 rounded-lg glass hover:scale-105 transition-all font-black uppercase text-[10px] text-center cursor-pointer">
                  📥 Импорт
                </div>
              </label>
              <button
                onClick={handleLogout}
                className="flex-1 py-2.5 rounded-lg bg-red-500/20 border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white font-black uppercase text-[10px] transition-all"
              >
                🚪 Выйти
              </button>
            </div>

            <button
              onClick={deleteAccount}
              className="w-full mt-2 py-2 rounded-lg bg-red-900/30 border border-red-900 text-red-400 hover:bg-red-900 hover:text-white font-black uppercase text-[9px] transition-all"
            >
              ⚠️ Удалить аккаунт
            </button>
          </div>
        </div>
      )}

      {/* Settings Modal - Compact */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/95 backdrop-blur-3xl animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-md glass-strong rounded-2xl p-6 border border-white/10 my-8">
            <button 
              onClick={() => setIsSettingsOpen(false)} 
              className="absolute top-4 right-4 text-xl opacity-50 hover:opacity-100 transition-opacity"
            >
              ×
            </button>
            
            <h2 className="text-xl font-black uppercase mb-6 text-gradient">
              ⚙️ Настройки
            </h2>

            <div className="space-y-3 mb-6">
              <h3 className="text-[10px] font-black uppercase opacity-50">Тема</h3>
              <div className="grid grid-cols-4 gap-2">
                {Object.entries(THEMES).map(([key, t]) => (
                  <button
                    key={key}
                    onClick={() => setCurrentTheme(key)}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      currentTheme === key ? 'scale-105' : 'border-white/10 opacity-60'
                    }`}
                    style={{
                      background: currentTheme === key ? `linear-gradient(135deg, ${t.primary}, ${t.secondary})` : 'rgba(255,255,255,0.05)',
                      borderColor: currentTheme === key ? t.primary : undefined
                    }}
                  >
                    <div className="text-xl mb-0.5">{t.icon}</div>
                    <p className="text-[8px] font-black uppercase">{t.name}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between p-3 glass rounded-xl mb-3">
              <div>
                <p className="text-xs font-black uppercase">Темный режим</p>
                <p className="text-[9px] opacity-50">Переключить тему</p>
              </div>
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`w-12 h-6 rounded-full transition-all ${
                  isDarkMode ? 'bg-gradient-to-r' : 'bg-white/20'
                }`}
                style={{
                  backgroundImage: isDarkMode ? `linear-gradient(90deg, ${theme.primary}, ${theme.secondary})` : undefined
                }}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  isDarkMode ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 glass rounded-xl mb-3">
              <div>
                <p className="text-xs font-black uppercase">Автовоспроизведение</p>
                <p className="text-[9px] opacity-50">Показывать последнее</p>
              </div>
              <button
                onClick={() => setAutoPlay(!autoPlay)}
                className={`w-12 h-6 rounded-full transition-all ${
                  autoPlay ? 'bg-gradient-to-r' : 'bg-white/20'
                }`}
                style={{
                  backgroundImage: autoPlay ? `linear-gradient(90deg, ${theme.primary}, ${theme.secondary})` : undefined
                }}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  autoPlay ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>

            {isLoggedIn && (
              <>
                <div className="p-3 glass rounded-xl mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-black uppercase">Дневная цель</p>
                    <span className="text-xs font-black" style={{ color: theme.primary }}>
                      {dailyGoal} аниме/день
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={dailyGoal}
                    onChange={(e) => setDailyGoal(parseInt(e.target.value))}
                    className="w-full h-2 rounded-full"
                    style={{
                      background: `linear-gradient(90deg, ${theme.primary}, ${theme.secondary})`
                    }}
                  />
                </div>

                <div className="p-3 glass rounded-xl mb-3">
                  <p className="text-xs font-black uppercase mb-2">Информация</p>
                  <div className="space-y-1 text-[10px]">
                    <div className="flex justify-between">
                      <span className="opacity-70">Логин:</span>
                      <span className="font-black">{currentAccount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="opacity-70">XP:</span>
                      <span className="font-black" style={{ color: theme.primary }}>{userStats.totalXp}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="opacity-70">В библиотеке:</span>
                      <span className="font-black">{userStats.librarySize}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="opacity-70">Входов:</span>
                      <span className="font-black">{user.totalLogins}</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            <button
              onClick={() => {
                if (confirm('Очистить кэш браузера?')) {
                  localStorage.clear();
                  sessionStorage.clear();
                  window.location.reload();
                }
              }}
              className="w-full py-3 rounded-xl bg-orange-500/20 border-2 border-orange-500 text-orange-500 font-black uppercase text-xs hover:bg-orange-500 hover:text-white transition-all"
            >
              🗑️ Очистить кэш
            </button>
          </div>
        </div>
      )}

      {/* Achievement Notification - Compact */}
      {showAchievement && (
        <div className="fixed top-20 right-4 z-[10001] animate-slide-in-right max-w-xs">
          <div 
            className="p-4 rounded-xl border-2 glass-strong backdrop-blur-xl shadow-2xl"
            style={{
              borderColor: theme.primary,
              boxShadow: `0 0 30px ${theme.primary}80`
            }}
          >
            <div className="flex items-center gap-3">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})` }}
              >
                {showAchievement.icon}
              </div>
              <div>
                <p className="text-[8px] font-black uppercase opacity-50 mb-0.5">Достижение!</p>
                <h4 className="text-sm font-black uppercase mb-0.5">{showAchievement.name}</h4>
                <p className="text-[10px] opacity-70">{showAchievement.desc}</p>
                <p className="text-[10px] font-black mt-1" style={{ color: theme.primary }}>
                  +{showAchievement.xp} XP
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Continue Watching Toast - Compact */}
      {showToast && history.length > 0 && autoPlay && (
        <div className="fixed bottom-4 right-4 z-[1000] animate-slide-in-right w-72">
          <div 
            onClick={() => { setSelectedItem(history[0]); setShowToast(false); }}
            className="p-3 rounded-xl border-2 flex items-center gap-3 cursor-pointer hover:scale-105 transition-all glass-strong"
            style={{
              borderColor: theme.primary,
              boxShadow: `0 10px 30px ${theme.primary}40`
            }}
          >
            <div className="w-10 h-14 shrink-0 rounded-lg overflow-hidden border border-white/10">
              <img src={getImg(history[0])} className="w-full h-full object-cover" alt="" />
            </div>
            <div className="flex-1 overflow-hidden">
              <p 
                className="text-[8px] font-black uppercase mb-0.5"
                style={{ color: theme.primary }}
              >
                ▶️ Продолжить?
              </p>
              <h4 className="text-[10px] font-black truncate uppercase text-white">
                {history[0].russian || history[0].name}
              </h4>
              <p className="text-[8px] opacity-50 mt-0.5">
                {history[0].date}
              </p>
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); setShowToast(false); }} 
              className="text-lg p-1 transition-colors text-white/40 hover:text-white"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Footer - Compact */}
      <footer className="mt-16 py-12 border-t border-white/5 text-center glass">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl font-black uppercase mb-3 text-gradient">
            ANI<span style={{ color: theme.primary }}>HUB</span>
          </h2>
          <p className="text-xs opacity-70 mb-3">
            Ваш портал в мир аниме 🌟
          </p>
          <div className="flex justify-center gap-4 mb-4">
            <a href="https://t.me/Sh1zoK1ll" target="_blank" rel="noreferrer" className="opacity-50 hover:opacity-100 transition-opacity hover:scale-110">
              <span className="text-2xl">✈️</span>
            </a>
          </div>
          {isLoggedIn && (
            <p className="text-xs opacity-50 mb-2">
              <span className="font-black" style={{ color: theme.primary }}>{user.name}</span> • Уровень {userStats.level}
            </p>
          )}
          <p className="text-[9px] font-black uppercase tracking-wider opacity-20">
            © 2026 @Sh1zoK1ll
          </p>
          <p className="text-[8px] opacity-30 mt-1">
            Shikimori API • {STORAGE_VERSION}
          </p>
        </div>
      </footer>
    </div>
  );
};

// ==================== AUTH FORM COMPONENT ====================
const AuthForm = ({ mode, onLogin, onRegister, theme, isDarkMode, rememberMe, setRememberMe }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (mode === 'login') {
      onLogin(username, password);
    } else {
      onRegister(username, password, email);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-[10px] font-black uppercase mb-1.5 opacity-70">
          Имя пользователя *
        </label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-3 rounded-xl glass border-2 border-transparent focus:border-white/20 outline-none text-white font-bold transition-all text-sm"
          style={{
            borderColor: username ? theme.primary : undefined
          }}
          placeholder="Введите имя"
          required
          minLength={3}
          maxLength={20}
        />
      </div>

      {mode === 'register' && (
        <div>
          <label className="block text-[10px] font-black uppercase mb-1.5 opacity-70">
            Email (опционально)
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 rounded-xl glass border-2 border-transparent focus:border-white/20 outline-none text-white font-bold text-sm"
            placeholder="email@example.com"
          />
        </div>
      )}

      <div>
        <label className="block text-[10px] font-black uppercase mb-1.5 opacity-70">
          Пароль *
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 pr-10 rounded-xl glass border-2 border-transparent focus:border-white/20 outline-none text-white font-bold transition-all text-sm"
            style={{
              borderColor: password ? theme.secondary : undefined
            }}
            placeholder="Введите пароль"
            required
            minLength={6}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-lg opacity-50 hover:opacity-100 transition-opacity"
          >
            {showPassword ? '🙈' : '👁️'}
          </button>
        </div>
      </div>

      {mode === 'login' && (
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="remember"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-4 h-4 rounded"
          />
          <label htmlFor="remember" className="text-xs opacity-70 cursor-pointer">
            Запомнить меня
          </label>
        </div>
      )}

      <button
        type="submit"
        className="w-full py-3 rounded-xl font-black uppercase text-sm text-white hover:scale-105 transition-all"
        style={{
          background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`
        }}
      >
        {mode === 'login' ? '🔐 Войти' : '✨ Зарегистрироваться'}
      </button>
    </form>
  );
};

export default App;