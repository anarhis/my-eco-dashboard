import React, { useState, useEffect } from 'react';
import { 
  Activity, Anchor, Award, Beaker, CloudRain, Compass, Database, Droplet, 
  Eye, Feather, HardDrive, Heart, Home, Layers, MapPin, Navigation, 
  Radio, RefreshCw, Rss, Shield, ShieldAlert, Sun, Thermometer, Trash2, 
  Wind, Zap, CheckSquare, Plus, AlertTriangle, Cpu, Camera, Filter, HardHat
} from 'lucide-react';

// === CONSTANTS & INITIAL DATA ===
const INITIAL_SECURITY_LOG = [
  { id: 1, time: '14:23:10', location: 'Буй №4 (Палаван)', event: 'AI-радар обнаружил неопознанное плавсредство на дистанции 800м. Оповещение отправлено.', severity: 'high' },
  { id: 2, time: '13:05:45', location: 'Сектор А3 (Коста-Рика)', event: 'Автоматический полив включен. Температура почвы >28°C. Расход: 450л.', severity: 'info' },
  { id: 3, time: '12:44:12', location: 'Буй №2 (Палаван)', event: 'AI-анализ звука: зафиксированы шумы винтов туристического катера. Безопасная зона.', severity: 'info' },
  { id: 4, time: '09:15:30', location: 'Улей №12 (Коста-Рика)', event: 'Внимание! Резкое падение звуковой активности (активность семьи <70%). Рекомендуется осмотр.', severity: 'warning' },
];

const INITIAL_RFID_REGISTRY = {
  'RFID-PAL-001': { type: 'Сетка жемчужниц', age: '18 месяцев', lastCleaned: '2026-08-10', density: '45 шт/сетка', species: 'Pinctada maxima', status: 'Норма' },
  'RFID-PAL-002': { type: 'Сетка жемчужниц', age: '24 месяца', lastCleaned: '2026-08-05', density: '40 шт/сетка', species: 'Pinctada maxima', status: 'Требуется чистка' },
  'RFID-PAL-003': { type: 'Садок с лангустами', age: '8 месяцев', lastCleaned: '2026-08-15', density: '15 шт/садок', species: 'Panulirus ornatus', status: 'Норма' },
};

const COFFEE_BATCHES = [
  { id: 'CR-GEO-09', variety: 'Geisha (Спешелти)', stage: 'Ферментация (Анаэробная)', hoursLeft: 14, brix: '23%', moisture: '42%', temp: '21.5°C' },
  { id: 'CR-SL28-02', variety: 'SL-28 (Экспериментальная)', stage: 'Сушка на африканских кроватях', moisture: '11.8%', daysRemaining: 3, brix: 'N/A', temp: '24.2°C' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('global'); // 'global' | 'palawan' | 'costarica'
  const [timePalawan, setTimePalawan] = useState('');
  const [timeCostaRica, setTimeCostaRica] = useState('');
  
  // IoT Telemetry with drifting values
  const [telemetry, setTelemetry] = useState({
    palawan: { temp: 28.4, pH: 8.15, do: 6.75, salinity: 34.2, status: 'SECURE' },
    costarica: { soilMoisture: 68.2, airTemp: 23.4, rain: 12.0, bloomIndex: 88, hivesHealth: 94 }
  });

  // Security Logs & Events
  const [securityLog, setSecurityLog] = useState(INITIAL_SECURITY_LOG);
  const [newPalawanAlert, setNewPalawanAlert] = useState('');
  const [newCostaRicaAlert, setNewCostaRicaAlert] = useState('');
  
  // RFID Scanner (Palawan)
  const [rfidSearch, setRfidSearch] = useState('');
  const [scannedItem, setScannedItem] = useState(null);
  const [cleaningChecklist, setCleaningChecklist] = useState([
    { id: 1, label: 'Чистка сетки RFID-PAL-002', done: false },
    { id: 2, label: 'Осмотр крепежей длинной линии Л-3', done: true },
    { id: 3, label: 'Замер уровня планктона в секторе Юг', done: false }
  ]);
  const [mortalityLog, setMortalityLog] = useState([
    { date: '2026-08-19', type: 'Жемчужницы (Pinctada)', qty: 2, cause: 'Естественный отбор' }
  ]);
  const [newMortality, setNewMortality] = useState({ qty: '', cause: 'Естественный отбор' });

  // Costa Rica Vanilla & Coffee states
  const [vanillaPollinations, setVanillaPollinations] = useState([
    { id: 'V-SEC-B', count: 142, pollinatedToday: 18, matureStatus: '85% зеленые стручки' },
    { id: 'V-SEC-C', count: 95, pollinatedToday: 12, matureStatus: '40% созревание' }
  ]);
  const [newPollinationCount, setNewPollinationCount] = useState('');
  const [selectedSector, setSelectedSector] = useState('Кофе Восток');

  // AI Sorting States (Fully separated)
  const [palawanAiAnalyzing, setPalawanAiAnalyzing] = useState(false);
  const [palawanAiResult, setPalawanAiResult] = useState(null);

  const [costaRicaAiAnalyzing, setCostaRicaAiAnalyzing] = useState(false);
  const [costaRicaAiResult, setCostaRicaAiResult] = useState(null);

  // Timezones Clocks
  useEffect(() => {
    const updateClocks = () => {
      const now = new Date();
      const optionsPalawan = { timeZone: 'Asia/Manila', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
      setTimePalawan(new Intl.DateTimeFormat('ru-RU', optionsPalawan).format(now));

      const optionsCR = { timeZone: 'America/Costa_Rica', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
      setTimeCostaRica(new Intl.DateTimeFormat('ru-RU', optionsCR).format(now));
    };

    updateClocks();
    const clockInterval = setInterval(updateClocks, 1000);
    return () => clearInterval(clockInterval);
  }, []);

  // Live sensor drifts
  useEffect(() => {
    const telemetryInterval = setInterval(() => {
      setTelemetry(prev => ({
        palawan: {
          temp: parseFloat((prev.palawan.temp + (Math.random() - 0.5) * 0.1).toFixed(2)),
          pH: parseFloat((prev.palawan.pH + (Math.random() - 0.5) * 0.02).toFixed(2)),
          do: parseFloat((prev.palawan.do + (Math.random() - 0.5) * 0.05).toFixed(2)),
          salinity: parseFloat((prev.palawan.salinity + (Math.random() - 0.5) * 0.05).toFixed(2)),
          status: Math.random() > 0.95 ? 'ALERT' : prev.palawan.status
        },
        costarica: {
          soilMoisture: parseFloat((prev.costarica.soilMoisture + (Math.random() - 0.5) * 0.4).toFixed(1)),
          airTemp: parseFloat((prev.costarica.airTemp + (Math.random() - 0.5) * 0.15).toFixed(1)),
          rain: prev.costarica.rain,
          bloomIndex: prev.costarica.bloomIndex,
          hivesHealth: prev.costarica.hivesHealth
        }
      }));
    }, 4000);

    return () => clearInterval(telemetryInterval);
  }, []);

  // RFID Scan (Palawan)
  const handleRfidScan = (e) => {
    e.preventDefault();
    const trimmed = rfidSearch.trim().toUpperCase();
    if (INITIAL_RFID_REGISTRY[trimmed]) {
      setScannedItem({ id: trimmed, ...INITIAL_RFID_REGISTRY[trimmed] });
    } else {
      setScannedItem({ error: 'Метка не найдена в базе данных IndexedDB' });
    }
  };

  // Palawan Pearl AI scan
  const runPalawanAi = () => {
    setPalawanAiAnalyzing(true);
    setPalawanAiResult(null);
    setTimeout(() => {
      setPalawanAiAnalyzing(false);
      const grades = [
        { grade: 'AAA Perfect Gold', desc: 'Идеальная сферичность, зеркальный золотистый люстр. Под премиум коллекцию.', shellUse: 'Выставочный стенд бренда' },
        { grade: 'Класс B (Экспорт)', desc: 'Минорные природные неровности. Рекомендовано для жемчужных нитей средней категории.', shellUse: 'Оптовая продажа раковины' },
        { grade: 'Класс C (Барокко)', desc: 'Уникальная асимметричная форма, высокий перламутровый блеск.', shellUse: 'Декор люкс-интерьеров' }
      ];
      setPalawanAiResult(grades[Math.floor(Math.random() * grades.length)]);
    }, 1800);
  };

  // Costa Rica Coffee AI scan
  const runCostaRicaAi = () => {
    setCostaRicaAiAnalyzing(true);
    setCostaRicaAiResult(null);
    setTimeout(() => {
      setCostaRicaAiAnalyzing(false);
      const defects = [
        { grade: 'Качество: Превосходное (SCAA 89+)', desc: 'Крупные дефекты отсутствуют. Равномерная плотность влажности 11.2%. Оценка спешелти.', action: 'Допустить в лот премиум обжарки' },
        { grade: 'Дефект: Квакеры / Недозрелые', desc: 'Обнаружено 3 недозрелых зерна на 100г. AI рекомендует дополнительную ручную калибровку.', action: 'Направить на повторную сортировку' }
      ];
      setCostaRicaAiResult(defects[Math.floor(Math.random() * defects.length)]);
    }, 1800);
  };

  // Manual alerts
  const handleAddPalawanAlert = (e) => {
    e.preventDefault();
    if (!newPalawanAlert.trim()) return;
    const newLog = {
      id: Date.now(),
      time: new Date().toLocaleTimeString('ru-RU'),
      location: 'Пост Палаван (AI)',
      event: newPalawanAlert,
      severity: 'warning'
    };
    setSecurityLog([newLog, ...securityLog]);
    setNewPalawanAlert('');
  };

  const handleAddCostaRicaAlert = (e) => {
    e.preventDefault();
    if (!newCostaRicaAlert.trim()) return;
    const newLog = {
      id: Date.now(),
      time: new Date().toLocaleTimeString('ru-RU'),
      location: 'Коста-Рика Сенсоры',
      event: newCostaRicaAlert,
      severity: 'info'
    };
    setSecurityLog([newLog, ...securityLog]);
    setNewCostaRicaAlert('');
  };

  // Theme-Branded styles
  const getThemeClasses = () => {
    if (activeTab === 'palawan') {
      return {
        bg: 'bg-slate-950',
        overlay: 'bg-gradient-to-b from-slate-950/90 via-cyan-950/20 to-slate-950/95',
        navBtnActive: 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(34,211,238,0.5)] border-cyan-400',
        navBtnInactive: 'text-slate-400 hover:text-cyan-400',
        cardBg: 'bg-slate-900/40 border-cyan-500/20 shadow-cyan-950/10',
        accentText: 'text-cyan-400',
        accentBg: 'bg-cyan-500',
        accentBorder: 'border-cyan-500/30',
        accentGlow: 'shadow-[0_0_12px_rgba(34,211,238,0.2)]',
        accentRing: 'focus:ring-cyan-500',
        logoText: 'from-cyan-400 via-sky-400 to-teal-300',
        bannerImg: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80'
      };
    } else if (activeTab === 'costarica') {
      return {
        bg: 'bg-slate-950',
        overlay: 'bg-gradient-to-b from-slate-950/90 via-emerald-950/20 to-slate-950/95',
        navBtnActive: 'bg-emerald-500 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.5)] border-emerald-400',
        navBtnInactive: 'text-slate-400 hover:text-emerald-400',
        cardBg: 'bg-slate-900/40 border-emerald-500/20 shadow-emerald-950/10',
        accentText: 'text-emerald-400',
        accentBg: 'bg-emerald-500',
        accentBorder: 'border-emerald-500/30',
        accentGlow: 'shadow-[0_0_12px_rgba(16,185,129,0.2)]',
        accentRing: 'focus:ring-emerald-500',
        logoText: 'from-emerald-400 via-green-400 to-amber-300',
        bannerImg: 'https://images.unsplash.com/photo-1530076881881-3f8d5cf2a10d?auto=format&fit=crop&w=1600&q=80'
      };
    } else {
      return {
        bg: 'bg-slate-950',
        overlay: 'bg-gradient-to-b from-slate-950/95 via-slate-900/40 to-slate-950/98',
        navBtnActive: 'bg-gradient-to-r from-slate-800 to-slate-700 text-teal-400 shadow-sm border border-slate-700/50',
        navBtnInactive: 'text-slate-400 hover:text-slate-200',
        cardBg: 'bg-slate-900/40 border-slate-800 shadow-slate-950/20',
        accentText: 'text-teal-400',
        accentBg: 'bg-teal-500',
        accentBorder: 'border-slate-800',
        accentGlow: 'shadow-none',
        accentRing: 'focus:ring-teal-500',
        logoText: 'from-teal-400 via-emerald-400 to-amber-300',
        bannerImg: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=80'
      };
    }
  };

  const theme = getThemeClasses();

  return (
    <div 
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(2, 6, 23, 0.88), rgba(2, 6, 23, 0.98)), url('${theme.bannerImg}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }} 
      className="min-h-screen text-slate-100 font-sans transition-all duration-700 ease-in-out"
    >
      
      {/* HEADER / ТАКТИЧЕСКИЙ БАР */}
      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-4 py-3 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl text-slate-950 transition-all duration-500 ${theme.accentBg} ${theme.accentGlow}`}>
            <Cpu className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className={`text-lg font-bold tracking-tight bg-gradient-to-r bg-clip-text text-transparent transition-all duration-500 ${theme.logoText}`}>
              ECO-SYNAPSE PWA
            </h1>
            <p className="text-xs text-slate-400 font-mono">Autonomous Bi-Farm Controller [v1.3.0-offline]</p>
          </div>
        </div>

        {/* НАВИГАЦИОННЫЙ ПЕРЕКЛЮЧАТЕЛЬ ЛОКАЦИЙ */}
        <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-xl w-full sm:w-auto overflow-x-auto">
          <button 
            onClick={() => setActiveTab('global')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all duration-500 ${activeTab === 'global' ? theme.navBtnActive : theme.navBtnInactive}`}
          >
            <Home className="w-3.5 h-3.5" />
            Глобальный Обзор
          </button>
          <button 
            onClick={() => setActiveTab('palawan')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all duration-500 ${activeTab === 'palawan' ? theme.navBtnActive : theme.navBtnInactive}`}
          >
            <Anchor className="w-3.5 h-3.5" />
            Ферма 1: Палаван (Морская)
          </button>
          <button 
            onClick={() => setActiveTab('costarica')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all duration-500 ${activeTab === 'costarica' ? theme.navBtnActive : theme.navBtnInactive}`}
          >
            <Feather className="w-3.5 h-3.5" />
            Ферма 2: Коста-Рика (Агро)
          </button>
        </div>

        {/* СТАТУС ОФФЛАЙН-СИНХРОНИЗАЦИИ */}
        <div className="hidden md:flex items-center gap-3 text-xs bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-mono text-slate-300">IndexedDB Synced</span>
          <Database className="w-3.5 h-3.5 text-emerald-400" />
        </div>
      </header>

      {/* ОСНОВНОЙ КОНТЕНТ */}
      <main className="p-4 lg:p-8 max-w-[1600px] mx-auto space-y-8">
        
        {/* КАРТОЧКА ПОДДЕРЖКИ PWA АЛЕРТА */}
        <div className={`bg-gradient-to-r from-teal-500/10 via-emerald-500/10 to-amber-500/10 border ${theme.accentBorder} p-4 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4`}>
          <div className="flex gap-3">
            <div className={`p-2 rounded-xl self-start ${activeTab === 'palawan' ? 'bg-cyan-500/20 text-cyan-300' : activeTab === 'costarica' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-teal-500/20 text-teal-300'}`}>
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Дашборд готов к автономной оффлайн-работе (PWA)</h3>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">Все логи датчиков и сессии ИИ кэшируются локально на вашем девайсе в IndexedDB.</p>
            </div>
          </div>
          <button className="bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 px-4 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors">
            Установить как PWA
          </button>
        </div>

        {/* ==================== 1. ГЛАВНЫЙ ЭКРАН / ГЛОБАЛЬНЫЙ ОБЗОР ==================== */}
        {activeTab === 'global' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Заголовок */}
            <div>
              <h2 className="text-2xl font-black text-slate-100 flex items-center gap-2">
                <Layers className="w-6 h-6 text-teal-400" /> Глобальная Консоль Управления
              </h2>
              <p className="text-xs text-slate-400 mt-1 font-mono">Управление автономными агро- и марикультурными нодами в реальном времени</p>
            </div>

            {/* Две фермы бок-о-бок */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* ВИДЖЕТ: ПАЛАВАН (Глобальный превью) */}
              <div className="relative overflow-hidden rounded-3xl bg-slate-900/40 border border-slate-800 p-6 shadow-xl backdrop-blur-md hover:border-cyan-500/30 transition-all duration-300">
                {/* Фото-баннер Палаван */}
                <div className="h-44 rounded-2xl mb-6 overflow-hidden relative border border-teal-500/20 group">
                  <img 
                    src="https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80" 
                    alt="Palawan Lagoon" 
                    className="w-full h-full object-cover brightness-[0.75] group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 to-transparent"></div>
                  <span className="absolute bottom-3 left-3 bg-teal-950/85 text-cyan-300 border border-cyan-500/30 px-3 py-1 rounded-xl text-[10px] font-bold tracking-wider uppercase font-mono">
                    📍 Остров Палаван • База Pearl Farming
                  </span>
                </div>

                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">Ферма 1 • Филиппины</span>
                    <h2 className="text-2xl font-black text-slate-100 mt-1">Палаван</h2>
                    <p className="text-xs text-teal-200/60 mt-0.5">Морская IMTA Аквакультура</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-mono font-bold tracking-wider text-slate-100">{timePalawan || '--:--:--'}</p>
                    <p className="text-[10px] text-slate-400 font-mono">GMT+8 (UTC+8)</p>
                  </div>
                </div>

                {/* Главные Метрики */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                    <div className="text-[10px] text-slate-400 uppercase">Температура воды</div>
                    <div className="text-lg font-bold font-mono text-cyan-300">{telemetry.palawan.temp}°C</div>
                  </div>
                  <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                    <div className="text-[10px] text-slate-400 uppercase">Кислород DO</div>
                    <div className="text-lg font-bold font-mono text-slate-100">{telemetry.palawan.do} мг/л</div>
                  </div>
                </div>

                <button 
                  onClick={() => setActiveTab('palawan')}
                  className="w-full mt-4 bg-slate-950 border border-slate-800 hover:border-cyan-500/40 text-cyan-400 font-bold text-xs py-2 rounded-xl transition-all flex items-center justify-center gap-1"
                >
                  Войти в панель Палавана <Navigation className="w-3 h-3" />
                </button>
              </div>

              {/* ВИДЖЕТ: КОСТА-РИКА (Глобальный превью) */}
              <div className="relative overflow-hidden rounded-3xl bg-slate-900/40 border border-slate-800 p-6 shadow-xl backdrop-blur-md hover:border-emerald-500/30 transition-all duration-300">
                {/* Фото-баннер Коста-Рика */}
                <div className="h-44 rounded-2xl mb-6 overflow-hidden relative border border-emerald-500/20 group">
                  <img 
                    src="https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80" 
                    alt="Costa Rica Coffee cherries" 
                    className="w-full h-full object-cover brightness-[0.75] group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 to-transparent"></div>
                  <span className="absolute bottom-3 left-3 bg-slate-950/85 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-xl text-[10px] font-bold tracking-wider uppercase font-mono">
                    📍 Монтеверде • Высокогорные плантации кофе
                  </span>
                </div>

                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Ферма 2 • Центральная Америка</span>
                    <h2 className="text-2xl font-black text-slate-100 mt-1">Коста-Рика</h2>
                    <p className="text-xs text-emerald-200/60 mt-0.5">Высокогорная Пермакультура</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-mono font-bold tracking-wider text-slate-100">{timeCostaRica || '--:--:--'}</p>
                    <p className="text-[10px] text-slate-400 font-mono">GMT-6 (UTC-6)</p>
                  </div>
                </div>

                {/* Главные Метрики */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                    <div className="text-[10px] text-slate-400 uppercase">Влажность почвы</div>
                    <div className="text-lg font-bold font-mono text-emerald-300">{telemetry.costarica.soilMoisture}%</div>
                  </div>
                  <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                    <div className="text-[10px] text-slate-400 uppercase">Пасека Здоровье</div>
                    <div className="text-lg font-bold font-mono text-yellow-400">{telemetry.costarica.hivesHealth}%</div>
                  </div>
                </div>

                <button 
                  onClick={() => setActiveTab('costarica')}
                  className="w-full mt-4 bg-slate-950 border border-slate-800 hover:border-emerald-500/40 text-emerald-400 font-bold text-xs py-2 rounded-xl transition-all flex items-center justify-center gap-1"
                >
                  Войти в панель Коста-Рики <Navigation className="w-3 h-3" />
                </button>
              </div>

            </section>

            {/* Чистый статус нод внизу глобальной вкладки без датчиков и ИИ */}
            <div className="bg-slate-900/20 rounded-2xl border border-slate-800 p-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
              <div className="flex items-center gap-3">
                <Database className="w-5 h-5 text-teal-400" />
                <div>
                  <h4 className="font-bold text-slate-200">Автономные локальные ноды синхронизированы</h4>
                  <p className="text-[11px] text-slate-500">Системы Palawan-Marine-01 и Costarica-Agro-02 работают в режиме Offline-First</p>
                </div>
              </div>
              <div className="flex gap-4 font-mono text-[10px] text-slate-400">
                <div>Морской AI Радар: <span className="text-emerald-400">Secure</span></div>
                <div>Апи-датчики: <span className="text-emerald-400">94% OK</span></div>
                <div>IndexedDB: <span className="text-teal-400">0ms latency</span></div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== 2. СЕГМЕНТ: ПАЛАВАН (100% МОРСКАЯ СТИЛИСТИКА) ==================== */}
        {activeTab === 'palawan' && (
          <div className="space-y-8 animate-fadeIn">
            
            {/* Заголовок */}
            <div>
              <h2 className="text-2xl font-black text-slate-100 flex items-center gap-2">
                <Anchor className="w-6 h-6 text-cyan-400" /> Морская Нода: Остров Палаван (Филиппины)
              </h2>
              <p className="text-xs text-slate-400 mt-1 font-mono">Система мониторинга садковой аквакультуры и ИИ-контроля жемчуга Pinctada maxima</p>
            </div>

            {/* Телеметрия + Специфические Локальные Модули */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* ЛЕВАЯ КОЛОНКА: Телеметрия с фото (4 колонки) */}
              <div className="lg:col-span-4 space-y-6">
                <div className="relative overflow-hidden rounded-3xl bg-slate-900/40 border border-cyan-500/20 p-6 shadow-xl backdrop-blur-md">
                  {/* Фото-баннер */}
                  <div className="h-44 rounded-2xl mb-6 overflow-hidden relative border border-cyan-500/30">
                    <img 
                      src="https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80" 
                      alt="Palawan Lagoon" 
                      className="w-full h-full object-cover brightness-[0.75]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 to-transparent"></div>
                    <span className="absolute bottom-3 left-3 bg-cyan-950/80 text-cyan-300 border border-cyan-500/30 px-3 py-1 rounded-xl text-[10px] font-bold tracking-wider uppercase font-mono">
                      🌊 Бухта лагуны Палаван
                    </span>
                  </div>

                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-sm text-cyan-400 uppercase tracking-wider">IoT-Телеметрия Сенсоров</h3>
                    <div className="text-right">
                      <p className="text-lg font-mono font-bold text-slate-100">{timePalawan}</p>
                    </div>
                  </div>

                  {/* Метрики */}
                  <div className="space-y-3">
                    <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex justify-between items-center">
                      <div>
                        <div className="text-xs text-slate-400">Температура воды</div>
                        <div className="text-[10px] text-emerald-400">Нормальный диапазон</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold font-mono text-cyan-300">{telemetry.palawan.temp}°C</div>
                      </div>
                    </div>

                    <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex justify-between items-center">
                      <div>
                        <div className="text-xs text-slate-400">Растворенный кислород (DO)</div>
                        <div className="text-[10px] text-emerald-400">Оптимальный замер</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold font-mono text-slate-100">{telemetry.palawan.do} мг/л</div>
                      </div>
                    </div>

                    <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex justify-between items-center">
                      <div>
                        <div className="text-xs text-slate-400">Кислотность воды (pH)</div>
                        <div className="text-[10px] text-amber-400">Слабощелочная среда</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold font-mono text-slate-100">{telemetry.palawan.pH}</div>
                      </div>
                    </div>

                    <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex justify-between items-center">
                      <div>
                        <div className="text-xs text-slate-400">Соленость океана</div>
                        <div className="text-[10px] text-emerald-400">34.2 PSU Стандарт</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold font-mono text-slate-100">{telemetry.palawan.salinity} ‰</div>
                      </div>
                    </div>
                  </div>

                  {/* Статус ИИ-Радара */}
                  <div className="mt-5 p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/30 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
                      <div className="text-[11px] font-bold text-cyan-300">ANTI-POACHING AI RADAR</div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/30">
                      {telemetry.palawan.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* ПРАВАЯ КОЛОНКА: Сетки + RFID + Чеклисты (8 колонок) */}
              <div className="lg:col-span-8 space-y-6">
                <div className="bg-slate-900/40 border border-cyan-500/20 p-6 rounded-3xl space-y-6 backdrop-blur-md">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold flex items-center gap-2 text-cyan-400">
                      <Layers className="w-5 h-5" /> Карта Длинных Линий (Longlines) & Садов
                    </h3>
                    <span className="text-xs bg-cyan-500/10 text-cyan-300 px-3 py-1 rounded-full border border-cyan-500/20 font-mono">3 Линии в заливе</span>
                  </div>

                  {/* Макет Сеток */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[1, 2, 3].map(line => (
                      <div key={line} className="bg-slate-950 border border-slate-800 p-4 rounded-2xl">
                        <div className="flex justify-between items-center mb-3">
                          <span className="font-bold text-sm">Линия Л-{line}</span>
                          <span className="text-[10px] text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full font-mono">OK</span>
                        </div>
                        <div className="space-y-1 text-xs text-slate-400">
                          <div className="flex justify-between"><span>Нагрузка:</span> <span className="font-mono text-slate-200">12 сеток</span></div>
                          <div className="flex justify-between"><span>Жемчужницы:</span> <span className="font-mono text-slate-200">480 шт</span></div>
                        </div>
                        {/* Полоса заполненности в цветах Cyan */}
                        <div className="w-full bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden">
                          <div className="bg-gradient-to-r from-cyan-500 to-teal-400 h-1.5" style={{ width: line === 1 ? '90%' : line === 2 ? '75%' : '60%' }}></div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* RFID Сканнер сеток */}
                  <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800 space-y-4">
                    <h4 className="text-xs font-bold text-cyan-300 uppercase flex items-center gap-2 tracking-wider">
                      <Rss className="w-4 h-4" /> RFID-Сканирование Сеток в море
                    </h4>
                    <form onSubmit={handleRfidScan} className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Введите метку (напр. RFID-PAL-001, RFID-PAL-002)"
                        value={rfidSearch}
                        onChange={(e) => setRfidSearch(e.target.value)}
                        className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 flex-1 font-mono"
                      />
                      <button type="submit" className="bg-cyan-500 text-slate-950 px-4 py-2 rounded-xl text-sm font-bold hover:bg-cyan-400 transition-colors">
                        Сканировать
                      </button>
                    </form>

                    {scannedItem && (
                      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs space-y-2 animate-fadeIn">
                        {scannedItem.error ? (
                          <span className="text-rose-400 font-mono">{scannedItem.error}</span>
                        ) : (
                          <div className="grid grid-cols-2 gap-2">
                            <div className="border-b border-slate-800 pb-1"><span className="text-slate-400">Объект:</span> <strong className="text-cyan-300">{scannedItem.type}</strong></div>
                            <div className="border-b border-slate-800 pb-1"><span className="text-slate-400">Возраст биомассы:</span> <span className="font-mono text-slate-200">{scannedItem.age}</span></div>
                            <div className="border-b border-slate-800 pb-1"><span className="text-slate-400">Плотность:</span> <span className="font-mono text-slate-200">{scannedItem.density}</span></div>
                            <div className="border-b border-slate-800 pb-1"><span className="text-slate-400">Статус:</span> <span className="text-emerald-400 font-bold">{scannedItem.status}</span></div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* СПЕЦИАЛЬНЫЕ ИНТЕГРИРОВАННЫЕ БЛОКИ: Модуль ИИ-Экспертизы Жемчуга + Журнал Охраны Палавана (БОК-О-БОК) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* 1. ИНТЕГРИРОВАННЫЙ ИИ-СКАНЕР ЖЕМЧУГА */}
              <section className="bg-slate-900/40 border border-cyan-500/20 rounded-3xl p-6 space-y-6 backdrop-blur-md">
                <div>
                  <h3 className="text-lg font-bold flex items-center gap-2 text-cyan-400">
                    <Cpu className="text-cyan-400 w-5 h-5 animate-pulse" /> Автокалибровка Жемчуга Pinctada
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">Определение сорта и качества перламутрового люстра в режиме офлайн</p>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {/* Интерактивное окно камеры с реальным фото */}
                  <div className="bg-slate-950 border border-dashed border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-4 hover:border-cyan-500/50 transition-all cursor-pointer relative overflow-hidden min-h-[300px]">
                    {palawanAiResult || palawanAiAnalyzing ? (
                      <div className="absolute inset-0 w-full h-full animate-fadeIn">
                        <img 
                          src="https://images.unsplash.com/photo-1515688594390-b649af70d282?auto=format&fit=crop&w=600&q=80" 
                          alt="AI Pearl Scan" 
                          className="w-full h-full object-cover brightness-[0.7] contrast-[1.05]"
                        />
                        {/* Голубой лазер */}
                        <div className="absolute left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_8px_rgba(34,211,238,0.8)] animate-bounce" style={{ top: '35%', animationDuration: '3s' }}></div>
                        
                        {!palawanAiAnalyzing && palawanAiResult && (
                          <div className="absolute inset-4 border-2 border-dashed rounded-xl border-cyan-400/40 flex items-center justify-center">
                            <div className="bg-slate-950/90 border border-cyan-400/40 p-2.5 rounded-lg text-[10px] text-cyan-300 font-mono text-left absolute top-4 left-4">
                              <div className="font-bold border-b border-cyan-400/20 pb-0.5 mb-1 flex items-center gap-1">
                                <Cpu className="w-3 h-3 animate-spin" /> TF.js WASM Node
                              </div>
                              <div>Калибр: <span className="text-white font-bold">Pinctada Pearl</span></div>
                              <div>Люстр: <span className="text-cyan-400 font-bold">Perfect Mirror</span></div>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4 flex flex-col items-center">
                        <div className="p-4 bg-slate-900 rounded-full border border-slate-800">
                          <Camera className="w-8 h-8 text-slate-400" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-300">Камера ИИ-Оценки Жемчужниц</h4>
                          <p className="text-xs text-slate-500 mt-1">AI определит сферичность, калибр и зеркальность перламутрового слоя</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Кнопки управления */}
                    <div className="flex gap-2 z-10 mt-auto bg-slate-950/90 p-2 rounded-xl border border-slate-800">
                      <button 
                        onClick={runPalawanAi}
                        disabled={palawanAiAnalyzing}
                        className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold px-4 py-2 rounded-lg shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50"
                      >
                        {palawanAiAnalyzing ? 'Калибровка...' : 'Сканировать жемчуг'}
                      </button>
                      {(palawanAiResult || palawanAiAnalyzing) && (
                        <button onClick={() => setPalawanAiResult(null)} className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-2.5 py-1.5 rounded-lg border border-slate-700">
                          Сбросить
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Результат */}
                  <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 min-h-[150px] flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 font-mono">Вердикт AI Ноды</h4>
                      {palawanAiAnalyzing && (
                        <div className="space-y-3 py-2">
                          <div className="flex items-center gap-2 text-xs text-slate-300">
                            <RefreshCw className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                            <span>Анализ сверточной сетью MobileNet-V3...</span>
                          </div>
                          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-cyan-500 h-1.5 rounded-full animate-pulse" style={{ width: '85%' }}></div>
                          </div>
                        </div>
                      )}
                      {!palawanAiAnalyzing && palawanAiResult && (
                        <div className="space-y-3 animate-fadeIn">
                          <span className="text-xs bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2.5 py-0.5 rounded-full font-bold font-mono">
                            {palawanAiResult.grade}
                          </span>
                          <p className="text-xs text-slate-300 leading-relaxed">{palawanAiResult.desc}</p>
                          <div className="text-[11px] text-slate-400 font-mono">Назначение раковины: <span className="text-emerald-400 font-bold">{palawanAiResult.shellUse}</span></div>
                        </div>
                      )}
                      {!palawanAiAnalyzing && !palawanAiResult && (
                        <div className="text-slate-500 text-xs text-center py-6 font-mono">
                          Ожидание загрузки макро-снимка. Запустите ИИ-тест.
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </section>

              {/* 2. ЛОКАЛЬНЫЙ ЖУРНАЛ ОХРАНЫ И РАДАРА ПАЛАВАНА */}
              <section className="bg-slate-900/40 border border-cyan-500/20 rounded-3xl p-6 space-y-6 backdrop-blur-md">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold flex items-center gap-2 text-cyan-400">
                      <Shield className="text-cyan-400 w-5 h-5" /> Панель Охраны & IoT-Событий
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">Локальное логирование AI-радаров и охраны акватории</p>
                  </div>
                </div>

                {/* Добавить алерт */}
                <form onSubmit={handleAddPalawanAlert} className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Ввести лог береговой охраны..."
                    value={newPalawanAlert}
                    onChange={(e) => setNewPalawanAlert(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 flex-1 font-mono"
                  />
                  <button type="submit" className="bg-cyan-500 text-slate-950 px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-cyan-400 transition-colors">
                    Внести событие
                  </button>
                </form>

                {/* Список логов (Отфильтрован строго по Палавану!) */}
                <div className="bg-slate-950 rounded-2xl border border-slate-850 overflow-hidden text-xs">
                  <div className="grid grid-cols-12 bg-slate-900 px-4 py-2.5 font-bold text-slate-400 border-b border-slate-800">
                    <div className="col-span-3">Время</div>
                    <div className="col-span-6">Локация / Датчик</div>
                    <div className="col-span-3 text-right">Статус</div>
                  </div>
                  <div className="divide-y divide-slate-900/80 max-h-[310px] overflow-y-auto">
                    {securityLog.filter(log => log.location.includes('Палаван') || log.location.includes('Глобальная')).map((log) => (
                      <div key={log.id} className="grid grid-cols-12 px-4 py-3 text-slate-300 hover:bg-slate-900/40 items-center">
                        <div className="col-span-3 font-mono text-slate-500">{log.time}</div>
                        <div className="col-span-6">
                          <span className="font-bold text-cyan-300 font-mono text-[10px] block">{log.location}</span>
                          <span className="text-slate-400 text-[11px] block">{log.event}</span>
                        </div>
                        <div className="col-span-3 text-right">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold font-mono ${
                            log.severity === 'high' ? 'bg-rose-500/20 text-rose-400' : 'bg-sky-500/20 text-sky-400'
                          }`}>
                            {log.severity.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </section>

            </div>

          </div>
        )}

        {/* ==================== 3. СЕГМЕНТ: КОСТА-РИКА (100% АГРО СТИЛИСТИКА) ==================== */}
        {activeTab === 'costarica' && (
          <div className="space-y-8 animate-fadeIn">
            
            {/* Заголовок */}
            <div>
              <h2 className="text-2xl font-black text-slate-100 flex items-center gap-2">
                <Feather className="w-6 h-6 text-emerald-400" /> Агро-Нода: Пермакультура Коста-Рика
              </h2>
              <p className="text-xs text-slate-400 mt-1 font-mono">Система микроклимата, учета лотов спешелти кофе и ИИ-анализа дефектов зерен</p>
            </div>

            {/* Телеметрия + Специфические Локальные Модули */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* ЛЕВАЯ КОЛОНКА: Телеметрия с фото (4 колонки) */}
              <div className="lg:col-span-4 space-y-6">
                <div className="relative overflow-hidden rounded-3xl bg-slate-900/40 border border-emerald-500/20 p-6 shadow-xl backdrop-blur-md">
                  {/* Фото-баннер БЕЗ КРОССОВОК! (Ягоды кофе на ветке) */}
                  <div className="h-44 rounded-2xl mb-6 overflow-hidden relative border border-emerald-500/30">
                    <img 
                      src="https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80" 
                      alt="Coffee Farm cherries on branch" 
                      className="w-full h-full object-cover brightness-[0.75]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 to-transparent"></div>
                    <span className="absolute bottom-3 left-3 bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-xl text-[10px] font-bold tracking-wider uppercase font-mono">
                      🌱 Плантация Спешелти-Кофе
                    </span>
                  </div>

                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-sm text-emerald-400 uppercase tracking-wider">IoT-Телеметрия Микроклимата</h3>
                    <div className="text-right">
                      <p className="text-lg font-mono font-bold text-slate-100">{timeCostaRica}</p>
                    </div>
                  </div>

                  {/* Метрики */}
                  <div className="space-y-3">
                    <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex justify-between items-center">
                      <div>
                        <div className="text-xs text-slate-400">Влажность почвы (Soil)</div>
                        <div className="text-[10px] text-emerald-400">Сектор А3 полит</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold font-mono text-emerald-300">{telemetry.costarica.soilMoisture}%</div>
                      </div>
                    </div>

                    <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex justify-between items-center">
                      <div>
                        <div className="text-xs text-slate-400">Температура воздуха</div>
                        <div className="text-[10px] text-slate-400">Утренний тропический бриз</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold font-mono text-slate-100">{telemetry.costarica.airTemp}°C</div>
                      </div>
                    </div>

                    <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex justify-between items-center">
                      <div>
                        <div className="text-xs text-slate-400">Осадки за сутки</div>
                        <div className="text-[10px] text-indigo-400">Умеренный дождь</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold font-mono text-slate-100">{telemetry.costarica.rain} мм</div>
                      </div>
                    </div>

                    <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex justify-between items-center">
                      <div>
                        <div className="text-xs text-slate-400">Здоровье пасеки ульев</div>
                        <div className="text-[10px] text-yellow-500 font-bold">Опыление в процессе</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold font-mono text-yellow-400">{telemetry.costarica.hivesHealth}%</div>
                      </div>
                    </div>
                  </div>

                  {/* Индекс цветения ванили */}
                  <div className="mt-5 p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sun className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '8s' }} />
                      <div className="text-[11px] font-bold text-emerald-300 uppercase tracking-wide">Vanilla Bloom Index</div>
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 bg-amber-500/20 text-amber-400 rounded-full border border-amber-500/30 font-mono">
                      {telemetry.costarica.bloomIndex}%
                    </span>
                  </div>
                </div>
              </div>

              {/* ПРАВАЯ КОЛОНКА: Кофе + Ваниль + Карта участков (8 колонок) */}
              <div className="lg:col-span-8 space-y-6">
                <div className="bg-slate-900/40 border border-emerald-500/20 p-6 rounded-3xl space-y-6 backdrop-blur-md">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold flex items-center gap-2 text-emerald-400">
                      <Layers className="w-5 h-5" /> Учет лотов Кофе, Какао и Ванили
                    </h3>
                    <span className="text-xs bg-emerald-500/10 text-emerald-300 px-3 py-1 rounded-full border border-emerald-500/20 font-mono">Сбор урожая 2026</span>
                  </div>

                  {/* Кофе и Какао микро-партии */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {COFFEE_BATCHES.map(batch => (
                      <div key={batch.id} className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-sm text-amber-400 font-mono">{batch.id}</span>
                          <span className="text-[10px] bg-slate-900 text-slate-300 px-2 py-0.5 rounded border border-slate-700 font-mono">{batch.variety}</span>
                        </div>
                        <div className="space-y-1 text-xs text-slate-300">
                          <div className="flex justify-between"><span className="text-slate-400">Стадия процесса:</span> <span className="font-semibold text-emerald-400">{batch.stage}</span></div>
                          <div className="flex justify-between"><span className="text-slate-400">Влажность зерна:</span> <span className="font-mono">{batch.moisture}</span></div>
                          <div className="flex justify-between"><span className="text-slate-400">Сахар BRIX:</span> <span className="font-mono text-amber-300">{batch.brix}</span></div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Ручное опыление ванили */}
                  <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800 space-y-4">
                    <h4 className="text-xs font-bold text-slate-200 uppercase flex items-center gap-2 tracking-wider">
                      <Sun className="w-4 h-4 text-amber-400" /> Внесение Опыления Дикой Ванили (Vanilla planifolia)
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {vanillaPollinations.map(sec => (
                        <div key={sec.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
                          <div className="flex justify-between font-bold"><span>Сектор: {sec.id}</span> <span className="text-emerald-400">{sec.count} лиан</span></div>
                          <div className="flex justify-between mt-1"><span className="text-slate-400">Опылено цветков:</span> <span className="text-amber-400 font-bold font-mono">{sec.pollinatedToday}</span></div>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <input 
                        type="number" 
                        placeholder="Опылено цветков сегодня (+ шт)"
                        value={newPollinationCount}
                        onChange={(e) => setNewPollinationCount(e.target.value)}
                        className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 flex-1 font-mono"
                      />
                      <button 
                        onClick={() => {
                          if (!newPollinationCount) return;
                          setVanillaPollinations(prev => prev.map((s, i) => i === 0 ? {
                            ...s,
                            pollinatedToday: s.pollinatedToday + parseInt(newPollinationCount)
                          } : s));
                          setNewPollinationCount('');
                        }}
                        className="bg-emerald-500 text-slate-950 px-4 py-2 rounded-xl text-sm font-bold hover:bg-emerald-400 transition-colors"
                      >
                        Записать
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* СПЕЦИАЛЬНЫЕ ИНТЕГРИРОВАННЫЕ БЛОКИ: ИИ-Сортировщик кофе + Логи климата Коста-Рики (БОК-О-БОК) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* 1. ИНТЕГРИРОВАННЫЙ ИИ-АНАЛИЗАТОР ДЕФЕКТОВ КОФЕ */}
              <section className="bg-slate-900/40 border border-emerald-500/20 rounded-3xl p-6 space-y-6 backdrop-blur-md">
                <div>
                  <h3 className="text-lg font-bold flex items-center gap-2 text-emerald-400">
                    <Cpu className="text-emerald-400 w-5 h-5 animate-pulse" /> Калибровщик зерен Coffea Arabica
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">Определение дефектов, уровня квакеров и спешелти-грейда по фото</p>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {/* Интерактивное окно камеры с реальным фото кофе */}
                  <div className="bg-slate-950 border border-dashed border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-4 hover:border-emerald-500/50 transition-all cursor-pointer relative overflow-hidden min-h-[300px]">
                    {costaRicaAiResult || costaRicaAiAnalyzing ? (
                      <div className="absolute inset-0 w-full h-full animate-fadeIn">
                        <img 
                          src="https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=600&q=80" 
                          alt="AI Coffee cherries Scan" 
                          className="w-full h-full object-cover brightness-[0.7] contrast-[1.05]"
                        />
                        {/* Изумрудный лазер */}
                        <div className="absolute left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-bounce" style={{ top: '35%', animationDuration: '3s' }}></div>
                        
                        {!costaRicaAiAnalyzing && costaRicaAiResult && (
                          <div className="absolute inset-4 border-2 border-dashed rounded-xl border-emerald-400/40 flex items-center justify-center">
                            <div className="bg-slate-950/90 border border-emerald-400/40 p-2.5 rounded-lg text-[10px] text-emerald-300 font-mono text-left absolute top-4 left-4">
                              <div className="font-bold border-b border-emerald-400/20 pb-0.5 mb-1 flex items-center gap-1">
                                <Cpu className="w-3 h-3 animate-spin" /> TF.js WASM Coffee
                              </div>
                              <div>Калибр: <span className="text-white font-bold">Coffea Arabica</span></div>
                              <div>Дефекты: <span className="text-emerald-400 font-bold">0.0% Perfect</span></div>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4 flex flex-col items-center">
                        <div className="p-4 bg-slate-900 rounded-full border border-slate-800">
                          <Camera className="w-8 h-8 text-slate-400" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-300">Камера ИИ-Оценки Кофе</h4>
                          <p className="text-xs text-slate-500 mt-1">AI проанализирует зерна на наличие квакеров, черных пятен или сколов</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Кнопки управления */}
                    <div className="flex gap-2 z-10 mt-auto bg-slate-950/90 p-2 rounded-xl border border-slate-800">
                      <button 
                        onClick={runCostaRicaAi}
                        disabled={costaRicaAiAnalyzing}
                        className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold px-4 py-2 rounded-lg shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
                      >
                        {costaRicaAiAnalyzing ? 'Анализ...' : 'Сканировать лот кофе'}
                      </button>
                      {(costaRicaAiResult || costaRicaAiAnalyzing) && (
                        <button onClick={() => setCostaRicaAiResult(null)} className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-2.5 py-1.5 rounded-lg border border-slate-700">
                          Сбросить
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Результат */}
                  <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 min-h-[150px] flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 font-mono">Вердикт AI Ноды</h4>
                      {costaRicaAiAnalyzing && (
                        <div className="space-y-3 py-2">
                          <div className="flex items-center gap-2 text-xs text-slate-300">
                            <RefreshCw className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
                            <span>Анализ сверточной сетью MobileNet-V3...</span>
                          </div>
                          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-emerald-500 h-1.5 rounded-full animate-pulse" style={{ width: '85%' }}></div>
                          </div>
                        </div>
                      )}
                      {!costaRicaAiAnalyzing && costaRicaAiResult && (
                        <div className="space-y-3 animate-fadeIn">
                          <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-bold font-mono">
                            {costaRicaAiResult.grade}
                          </span>
                          <p className="text-xs text-slate-300 leading-relaxed">{costaRicaAiResult.desc}</p>
                          <div className="text-[11px] text-slate-400 font-mono">Действие: <span className="text-emerald-400 font-bold">{costaRicaAiResult.action}</span></div>
                        </div>
                      )}
                      {!costaRicaAiAnalyzing && !costaRicaAiResult && (
                        <div className="text-slate-500 text-xs text-center py-6 font-mono">
                          Ожидание загрузки макро-снимка кофе. Запустите ИИ-тест.
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </section>

              {/* 2. ЛОКАЛЬНЫЙ ЖУРНАЛ КЛИМАТА И ИРРИГАЦИИ КОСТА-РИКИ */}
              <section className="bg-slate-900/40 border border-emerald-500/20 rounded-3xl p-6 space-y-6 backdrop-blur-md">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold flex items-center gap-2 text-emerald-400">
                      <CloudRain className="text-emerald-400 w-5 h-5" /> Панель Микроклимата & IoT-Событий
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">Локальное логирование климатических станций и автополива</p>
                  </div>
                </div>

                {/* Добавить алерт */}
                <form onSubmit={handleAddCostaRicaAlert} className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Ввести лог климатической станции..."
                    value={newCostaRicaAlert}
                    onChange={(e) => setNewCostaRicaAlert(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 flex-1 font-mono"
                  />
                  <button type="submit" className="bg-emerald-500 text-slate-950 px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-emerald-400 transition-colors">
                    Внести событие
                  </button>
                </form>

                {/* Список логов (Отфильтрован строго по Коста-Рике!) */}
                <div className="bg-slate-950 rounded-2xl border border-slate-850 overflow-hidden text-xs">
                  <div className="grid grid-cols-12 bg-slate-900 px-4 py-2.5 font-bold text-slate-400 border-b border-slate-800">
                    <div className="col-span-3">Время</div>
                    <div className="col-span-6">Локация / Датчик</div>
                    <div className="col-span-3 text-right">Статус</div>
                  </div>
                  <div className="divide-y divide-slate-900/80 max-h-[310px] overflow-y-auto">
                    {securityLog.filter(log => log.location.includes('Коста-Рика') || log.location.includes('Глобальная')).map((log) => (
                      <div key={log.id} className="grid grid-cols-12 px-4 py-3 text-slate-300 hover:bg-slate-900/40 items-center">
                        <div className="col-span-3 font-mono text-slate-500">{log.time}</div>
                        <div className="col-span-6">
                          <span className="font-bold text-emerald-300 font-mono text-[10px] block">{log.location}</span>
                          <span className="text-slate-400 text-[11px] block">{log.event}</span>
                        </div>
                        <div className="col-span-3 text-right">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold font-mono ${
                            log.severity === 'high' ? 'bg-rose-500/20 text-rose-400' : 'bg-sky-500/20 text-sky-400'
                          }`}>
                            {log.severity.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </section>

            </div>

          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-900 mt-12 py-8 text-center text-xs text-slate-500 bg-slate-950">
        <p>© 2026 Eco-Synapse Systems. Разработано для оффлайн-нод Филиппины-Палаван & Коста-Рика.</p>
        <p className="mt-1 font-mono text-[10px] text-teal-500">Node ID: NODE-SECURE-ALPHA-01</p>
      </footer>

    </div>
  );
}
