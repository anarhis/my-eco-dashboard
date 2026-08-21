import React, { useState, useEffect } from 'react';
import { 
  Activity, Anchor, Award, Beaker, CloudRain, Compass, Database, Droplet, 
  Eye, Feather, HardDrive, Heart, Home, Layers, MapPin, Navigation, 
  Radio, RefreshCw, Rss, Shield, ShieldAlert, Sun, Thermometer, Trash2, 
  Wind, Zap, CheckSquare, Plus, AlertTriangle, Cpu, Camera, Filter, HardHat,
  Bell, Volume2, Waves, EyeOff
} from 'lucide-react';

// === МОКОВЫЕ ДАННЫЕ ДЛЯ СТАРТА ===
const INITIAL_SECURITY_LOG = [
  { id: 1, time: '14:23:10', location: 'Буй №4 (Палаван)', event: 'AI-радар обнаружил неопознанное плавсредство на дистанции 800м. Оповещение отправлено.', severity: 'high' },
  { id: 2, time: '13:05:45', location: 'Сектор А3 (Коста-Рика)', event: 'Автоматический полив включен. Температура почвы >28°C. Расход: 450л.', severity: 'info' },
  { id: 3, time: '12:44:12', location: 'Буй №2 (Палаван)', event: 'AI-анализ звука: зафиксированы шумы винтов туристического катера. Безопасная зона.', severity: 'info' },
  { id: 4, time: '09:15:30', location: 'Улей №12 (Коста-Рика)', event: 'Внимание! Резкое падение звуковой активности (активность семьи <70%). Рекомендуется осмотр.', severity: 'warning' },
];

const INITIAL_RFID_REGISTRY = {
  'RFID-PAL-001': { type: 'Сетка жемчужниц (L-1)', age: '18 месяцев', lastCleaned: '2026-08-10', density: '45 шт/сетка', species: 'Pinctada maxima', status: 'Норма' },
  'RFID-PAL-002': { type: 'Сетка жемчужниц (L-3)', age: '24 месяца', lastCleaned: '2026-08-01', density: '40 шт/сетка', species: 'Pinctada maxima', status: 'Требуется чистка' },
  'RFID-PAL-003': { type: 'Садок с лангустами (M-2)', age: '8 месяцев', lastCleaned: '2026-08-15', density: '15 шт/садок', species: 'Panulirus ornatus', status: 'Норма' },
};

const COFFEE_BATCHES = [
  { id: 'CR-GEO-09', variety: 'Geisha (Спешелти)', stage: 'Ферментация (Анаэробная)', hoursLeft: 14, brix: '23%', moisture: '42%', temp: '21.5°C' },
  { id: 'CR-SL28-02', variety: 'SL-28 (Экспериментальная)', stage: 'Сушка на африканских кроватях', moisture: '11.8%', daysRemaining: 3, brix: 'N/A', temp: '24.2°C' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('global'); // 'global' | 'palawan' | 'costarica'
  const [timePalawan, setTimePalawan] = useState('');
  const [timeCostaRica, setTimeCostaRica] = useState('');
  
  // Real-Time Telemetry (с поддержкой ручного тайфуна)
  const [typhoonSimulated, setTyphoonSimulated] = useState(false);
  const [telemetry, setTelemetry] = useState({
    palawan: { temp: 28.4, pH: 8.15, do: 6.75, salinity: 34.2, turbidity: 1.8, status: 'SECURE' },
    costarica: { soilMoisture: 68.2, airTemp: 23.4, rain: 12.0, bloomIndex: 88, hivesHealth: 94 }
  });

  // Локальные реактивные состояния для интерактивности модулей
  const [securityLog, setSecurityLog] = useState(INITIAL_SECURITY_LOG);
  const [newAlertMessage, setNewAlertMessage] = useState('');
  
  // Симуляция тревоги браконьеров
  const [poacherAlert, setPoacherAlert] = useState(false);
  const [activeNotification, setActiveNotification] = useState(null);

  // RFID Сканнер
  const [rfidSearch, setRfidSearch] = useState('');
  const [scannedItem, setScannedItem] = useState(null);
  const [cleaningChecklist, setCleaningChecklist] = useState([
    { id: 1, label: 'Чистка сетки RFID-PAL-002 (Линия Л-3)', done: false },
    { id: 2, label: 'Осмотр крепежей длинной линии Л-3 (Морской червь)', done: true },
    { id: 3, label: 'Замер уровня планктона в секторе Юг (Красный прилив)', done: false }
  ]);
  const [mortalityLog, setMortalityLog] = useState([
    { date: '2026-08-19', type: 'Жемчужницы (Pinctada maxima)', qty: 2, cause: 'Естественный отбор' }
  ]);
  const [newMortality, setNewMortality] = useState({ qty: '', cause: 'Естественный отбор' });

  // Коста-Рика Кофе & Ваниль & Пчелы
  const [vanillaPollinations, setVanillaPollinations] = useState([
    { id: 'V-SEC-B', count: 142, pollinatedToday: 18, matureStatus: '85% зеленые стручки' },
    { id: 'V-SEC-C', count: 95, pollinatedToday: 12, matureStatus: '40% созревание' }
  ]);
  const [newPollinationCount, setNewPollinationCount] = useState('');
  const [selectedSector, setSelectedSector] = useState('Кофе Восток');

  // AI-Сортировка
  const [aiSortingType, setAiSortingType] = useState('pearl'); // 'pearl' | 'mop' | 'coffee'
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  // Обновление локальных часов реального времени для двух таймзон
  useEffect(() => {
    const updateClocks = () => {
      const now = new Date();
      // Филиппины (UTC+8)
      const optionsPalawan = { timeZone: 'Asia/Manila', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
      setTimePalawan(new Intl.DateTimeFormat('ru-RU', optionsPalawan).format(now));

      // Коста-Рика (UTC-6)
      const optionsCR = { timeZone: 'America/Costa_Rica', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
      setTimeCostaRica(new Intl.DateTimeFormat('ru-RU', optionsCR).format(now));
    };

    updateClocks();
    const clockInterval = setInterval(updateClocks, 1000);
    return () => clearInterval(clockInterval);
  }, []);

  // Имитация живых датчиков (дрейф параметров)
  useEffect(() => {
    const telemetryInterval = setInterval(() => {
      setTelemetry(prev => {
        const d_temp = (Math.random() - 0.5) * 0.1;
        const d_ph = (Math.random() - 0.5) * 0.02;
        const d_do = (Math.random() - 0.5) * 0.05;
        const d_sal = typhoonSimulated ? 0 : (Math.random() - 0.5) * 0.05;
        const d_turb = (Math.random() - 0.5) * 0.1;

        return {
          palawan: {
            temp: parseFloat((prev.palawan.temp + d_temp).toFixed(2)),
            pH: parseFloat((prev.palawan.pH + d_ph).toFixed(2)),
            do: parseFloat((prev.palawan.do + d_do).toFixed(2)),
            salinity: typhoonSimulated ? 24.5 : parseFloat((prev.palawan.salinity + d_sal).toFixed(2)),
            turbidity: parseFloat((prev.palawan.turbidity + d_turb).toFixed(2)),
            status: poacherAlert ? 'ALERT' : 'SECURE'
          },
          costarica: {
            soilMoisture: parseFloat((prev.costarica.soilMoisture + (Math.random() - 0.5) * 0.4).toFixed(1)),
            airTemp: parseFloat((prev.costarica.airTemp + (Math.random() - 0.5) * 0.15).toFixed(1)),
            rain: prev.costarica.rain,
            bloomIndex: prev.costarica.bloomIndex,
            hivesHealth: prev.costarica.hivesHealth
          }
        };
      });
    }, 4000);

    return () => clearInterval(telemetryInterval);
  }, [typhoonSimulated, poacherAlert]);

  // Симуляция проникновения браконьеров
  const triggerPoacherSimulation = () => {
    setPoacherAlert(true);
    const alarmLog = {
      id: Date.now(),
      time: new Date().toLocaleTimeString('ru-RU'),
      location: 'Буй №4 (Палаван)',
      event: 'ВНИМАНИЕ! Тепловизор YOLOv8 зафиксировал моторную лодку (бангка) в закрытой зоне жемчужниц! Включены прожекторы наблюдательной вышки.',
      severity: 'high'
    };
    setSecurityLog(prev => [alarmLog, ...prev]);
    setActiveNotification({
      title: "🚨 AI-ОХРАНА: ОБНАРУЖЕНО ВТОРЖЕНИЕ!",
      desc: "Распознан объект: Лодка (Бангка). Автоматически включены прожекторы на вышке, сирена активирована. Уведомление отправлено на пульт старейшины.",
      type: "alarm"
    });
  };

  // Сброс тревоги браконьеров
  const resetPoacherAlert = () => {
    setPoacherAlert(false);
    setActiveNotification(null);
    const secureLog = {
      id: Date.now(),
      time: new Date().toLocaleTimeString('ru-RU'),
      location: 'Буй №4 (Палаван)',
      event: 'Тревога снята оператором. Акватория чиста. Сирена отключена.',
      severity: 'info'
    };
    setSecurityLog(prev => [secureLog, ...prev]);
  };

  // Симуляция тайфуна (опреснение воды)
  const triggerTyphoonSimulation = () => {
    setTyphoonSimulated(true);
    setTelemetry(prev => ({
      ...prev,
      palawan: { ...prev.palawan, salinity: 24.5, temp: 25.1 }
    }));
    const typhoonLog = {
      id: Date.now(),
      time: new Date().toLocaleTimeString('ru-RU'),
      location: 'Остров Палаван',
      event: 'КРИТИЧЕСКИЙ СТАТУС: Зафиксировано падение солености до 24.5‰ после супертайфуна. Риск осмотического шока устриц!',
      severity: 'high'
    };
    setSecurityLog(prev => [typhoonLog, ...prev]);
    setActiveNotification({
      title: "🌀 ТАЙФУН / ОПРЕСНЕНИЕ ВОДЫ!",
      desc: "Уровень солености упал до 24.5‰. Рекомендован экстренный спуск линий жемчужниц глубже 8 метров.",
      type: "warning"
    });
  };

  // Сброс симуляции тайфуна
  const resetTyphoonSimulation = () => {
    setTyphoonSimulated(false);
    setTelemetry(prev => ({
      ...prev,
      palawan: { ...prev.palawan, salinity: 34.2, temp: 28.4 }
    }));
  };

  // Функция симуляции RFID сканирования
  const handleRfidScan = (e) => {
    e.preventDefault();
    const trimmed = rfidSearch.trim().toUpperCase();
    if (INITIAL_RFID_REGISTRY[trimmed]) {
      setScannedItem({ id: trimmed, ...INITIAL_RFID_REGISTRY[trimmed] });
      // Если это Линия-3, автоматически обновляем чек-лист
      if (trimmed === 'RFID-PAL-002') {
        setCleaningChecklist(prev => prev.map(item => item.id === 1 ? { ...item, done: true } : item));
      }
    } else {
      setScannedItem({ error: 'Метка не найдена в локальном реестре.' });
    }
  };

  // Симуляция AI-анализа качества
  const handleAiAnalysis = () => {
    setAiAnalyzing(true);
    setAiResult(null);
    setTimeout(() => {
      setAiAnalyzing(false);
      if (aiSortingType === 'pearl') {
        const grades = [
          { grade: 'AAA Premium Gem Quality (Топ 10%)', size: '14.2 мм', shape: 'Идеальная сфера (99.1%)', color: 'South Sea Gold (AAA Deep Gold)', surface: '98.5% Чистота (Без дефектов)', luster: 'Зеркальный люстр (Gem Quality)', action: 'Ювелирный бренд (Собственная коллекция)' },
          { grade: 'Класс AA (Оптовый экспорт)', size: '12.8 мм', shape: 'Овальный/Симметричный (91.2%)', color: 'Medium Gold', surface: '92.0% Чистота', luster: 'Высокий блеск', action: 'Оптовая сдача ювелирным дилерам' },
          { grade: 'Класс Baroque (Дизайнерский люкс)', size: '15.5 мм', shape: 'Барокко (Асимметричный)', color: 'Champagne Gold', surface: 'Уникальные природные борозды', luster: 'Средний металлический блеск', action: 'Дизайнерские эксклюзивные лоты' }
        ];
        setAiResult(grades[Math.floor(Math.random() * grades.length)]);
      } else if (aiSortingType === 'mop') {
        const shells = [
          { grade: 'Премиум-Монолит (>20 см)', desc: 'Идеально ровная створка Pinctada maxima, перламутр без микротрещин.', size: '22.4 см', action: 'Производство фирменных перламутровых тарелок и икорных приборов бренда' },
          { grade: 'Категория Б (Оптовый сброс)', desc: 'Минорные сколы по краям, ровный центральный пласт.', size: '17.2 см', action: 'Оптовая сдача для фурнитуры, пуговиц и инкрустации мебели' }
        ];
        setAiResult(shells[Math.floor(Math.random() * shells.length)]);
      } else {
        const defects = [
          { grade: 'Качество: Превосходное (SCAA 88+)', desc: 'Крупные дефекты отсутствуют. Равномерная плотность влажности 11.2%. Оценка спешелти.', action: 'Допустить в лот премиум обжарки' },
          { grade: 'Обнаружен дефект: Квакеры / Недозрелые', desc: 'Обнаружено 3 недозрелых зерна на 100г. AI рекомендует дополнительную ручную калибровку.', action: 'Направить на повторную сортировку' }
        ];
        setAiResult(defects[Math.floor(Math.random() * defects.length)]);
      }
    }, 1800);
  };

  // Добавление кастомного события/алерта в IoT Лог
  const handleAddAlert = (e) => {
    e.preventDefault();
    if (!newAlertMessage.trim()) return;
    const newLog = {
      id: Date.now(),
      time: new Date().toLocaleTimeString('ru-RU'),
      location: activeTab === 'palawan' ? 'Пост Палаван (AI)' : activeTab === 'costarica' ? 'Коста-Рика Сенсоры' : 'Глобальная консоль',
      event: newAlertMessage,
      severity: 'warning'
    };
    setSecurityLog([newLog, ...securityLog]);
    setNewAlertMessage('');
  };

  // Функция для динамического фона на основе выбранной вкладки (Фермы)
  const getDynamicBg = () => {
    const overlays = activeTab === 'palawan' 
      ? "linear-gradient(to bottom, rgba(8, 47, 73, 0.92), rgba(2, 6, 23, 0.98))"
      : activeTab === 'costarica'
      ? "linear-gradient(to bottom, rgba(6, 78, 59, 0.92), rgba(2, 6, 23, 0.98))"
      : "linear-gradient(to bottom, rgba(15, 23, 42, 0.92), rgba(2, 6, 23, 0.98))";
    
    let imgUrl = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=80"; // Global High-tech Grid
    if (activeTab === 'palawan') {
      imgUrl = "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1600&q=80"; // Palawan Underwater Reef
    } else if (activeTab === 'costarica') {
      imgUrl = "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=1600&q=80"; // Costa Rica Rain Forest
    }
    return {
      backgroundImage: `${overlays}, url('${imgUrl}')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed'
    };
  };

  // JIT-безопасные цветовые темы для жесткого динамического брендинга
  const theme = activeTab === 'palawan' 
    ? {
        primaryText: 'text-cyan-400',
        primaryBg: 'bg-cyan-500',
        primaryBorder: 'border-cyan-500/20',
        glow: 'shadow-[0_0_15px_rgba(34,211,238,0.35)]',
        accentText: 'text-sky-300',
        badge: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',
        gradientText: 'from-cyan-400 via-sky-400 to-teal-300',
        btnActive: 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(34,211,238,0.45)]',
        btnHover: 'hover:text-cyan-400',
        cardBg: 'bg-slate-900/50 border-cyan-500/10',
        iconColor: 'text-cyan-400',
        statusColor: 'text-cyan-400 border-cyan-500/30 bg-cyan-950/40',
        laserColor: 'via-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]'
      }
    : activeTab === 'costarica'
    ? {
        primaryText: 'text-emerald-400',
        primaryBg: 'bg-emerald-500',
        primaryBorder: 'border-emerald-500/20',
        glow: 'shadow-[0_0_15px_rgba(16,185,129,0.35)]',
        accentText: 'text-amber-300',
        badge: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
        gradientText: 'from-emerald-400 via-green-400 to-amber-300',
        btnActive: 'bg-emerald-500 text-slate-950 shadow-[0_0_12px_rgba(16,185,129,0.45)]',
        btnHover: 'hover:text-emerald-400',
        cardBg: 'bg-slate-900/50 border-emerald-500/10',
        iconColor: 'text-emerald-400',
        statusColor: 'text-emerald-400 border-emerald-500/30 bg-emerald-950/40',
        laserColor: 'via-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]'
      }
    : {
        primaryText: 'text-teal-400',
        primaryBg: 'bg-teal-500',
        primaryBorder: 'border-teal-500/20',
        glow: 'shadow-[0_0_15px_rgba(20,184,166,0.35)]',
        accentText: 'text-amber-300',
        badge: 'bg-teal-500/10 text-teal-300 border-teal-500/20',
        gradientText: 'from-teal-400 via-emerald-400 to-amber-300',
        btnActive: 'bg-gradient-to-r from-slate-800 to-slate-700 text-teal-400 shadow-sm border border-slate-700/50',
        btnHover: 'hover:text-teal-400',
        cardBg: 'bg-slate-900/40 border-slate-800',
        iconColor: 'text-teal-400',
        statusColor: 'text-teal-400 border-teal-500/30 bg-teal-950/40',
        laserColor: 'via-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]'
      };

  return (
    <div style={getDynamicBg()} className="min-h-screen text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-900 transition-all duration-700 ease-in-out">
      
      {/* HEADER / ТАКТИЧЕСКИЙ БАР */}
      <header className={`sticky top-0 z-50 border-b ${theme.primaryBorder} bg-slate-950/80 backdrop-blur-md px-4 py-3 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors duration-500`}>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl text-slate-950 ${theme.primaryBg} ${theme.glow} transition-all duration-500`}>
            <Cpu className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className={`text-lg font-black tracking-tight bg-gradient-to-r ${theme.gradientText} bg-clip-text text-transparent transition-all duration-500`}>
              ECO-SYNAPSE PWA
            </h1>
            <p className="text-xs text-slate-400 font-mono">Autonomous Bi-Farm Controller [v2.0.0-multi-tenant]</p>
          </div>
        </div>

        {/* НАВИГАЦИОННЫЙ ПЕРЕКЛЮЧАТЕЛЬ ЛОКАЦИЙ */}
        <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-xl w-full sm:w-auto overflow-x-auto">
          <button 
            onClick={() => { setActiveTab('global'); setAiResult(null); }}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold tracking-wide transition-all duration-300 ${activeTab === 'global' ? 'bg-gradient-to-r from-slate-800 to-slate-700 text-teal-400 shadow-sm border border-slate-700/50' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Home className="w-3.5 h-3.5" />
            Глобальный Обзор
          </button>
          <button 
            onClick={() => { setActiveTab('palawan'); setAiSortingType('pearl'); setAiResult(null); }}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold tracking-wide transition-all duration-300 ${activeTab === 'palawan' ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(34,211,238,0.45)]' : 'text-slate-400 hover:text-cyan-400'}`}
          >
            <Anchor className="w-3.5 h-3.5" />
            Ферма 1: Палаван (Морская)
          </button>
          <button 
            onClick={() => { setActiveTab('costarica'); setAiSortingType('coffee'); setAiResult(null); }}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold tracking-wide transition-all duration-300 ${activeTab === 'costarica' ? 'bg-emerald-500 text-slate-950 shadow-[0_0_12px_rgba(16,185,129,0.45)]' : 'text-slate-400 hover:text-emerald-400'}`}
          >
            <Feather className="w-3.5 h-3.5" />
            Ферма 2: Коста-Рика (Агро)
          </button>
        </div>

        {/* СТАТУС ОФФЛАЙН-СИНХРОНИЗАЦИИ */}
        <div className="hidden md:flex items-center gap-3 text-xs bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
          <span className="flex h-2 w-2 relative">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${activeTab === 'palawan' ? 'bg-cyan-400' : activeTab === 'costarica' ? 'bg-emerald-400' : 'bg-teal-400'}`}></span>
            <span className={`relative inline-flex rounded-full h-2 w-2 ${activeTab === 'palawan' ? 'bg-cyan-500' : activeTab === 'costarica' ? 'bg-emerald-500' : 'bg-teal-500'}`}></span>
          </span>
          <span className="font-mono text-slate-300">IndexedDB Synced</span>
          <Database className={`w-3.5 h-3.5 ${theme.iconColor}`} />
        </div>
      </header>

      {/* ШАБЛОН ДИНАМИЧЕСКИХ ПУШ-УВЕДОМЛЕНИЙ */}
      {activeNotification && (
        <div className="max-w-[1600px] mx-auto px-4 pt-4 animate-slideDown">
          <div className={`p-4 rounded-2xl border flex items-start gap-3 shadow-2xl backdrop-blur-lg ${
            activeNotification.type === 'alarm' 
              ? 'bg-rose-950/85 border-rose-500/40 text-rose-200 shadow-rose-500/10' 
              : 'bg-amber-950/85 border-amber-500/40 text-amber-200 shadow-amber-500/10'
          }`}>
            <Bell className="w-5 h-5 mt-0.5 animate-bounce flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-bold text-sm tracking-wide">{activeNotification.title}</h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">{activeNotification.desc}</p>
              <div className="flex gap-2 mt-3">
                {activeNotification.type === 'alarm' ? (
                  <button 
                    onClick={resetPoacherAlert}
                    className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px] px-3 py-1 rounded-lg transition-colors border border-rose-500/30"
                  >
                    Отключить Сирену / Сбросить
                  </button>
                ) : (
                  <button 
                    onClick={resetTyphoonSimulation}
                    className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-[10px] px-3 py-1 rounded-lg transition-colors border border-amber-500/30"
                  >
                    Снять аварийный статус солености
                  </button>
                )}
                <button 
                  onClick={() => setActiveNotification(null)}
                  className="bg-slate-900/80 hover:bg-slate-800 text-slate-300 text-[10px] px-2.5 py-1 rounded-lg"
                >
                  Скрыть
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ОСНОВНОЙ КОНТЕНТ */}
      <main className="p-4 lg:p-8 max-w-[1600px] mx-auto space-y-8">
        
        {/* КАРТОЧКА ПОДДЕРЖКИ PWA АЛЕРТА */}
        <div className={`bg-slate-900/40 border ${theme.primaryBorder} p-4 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 backdrop-blur-sm transition-colors duration-500`}>
          <div className="flex gap-3">
            <div className={`p-2 rounded-xl self-start ${theme.primaryBg} bg-opacity-20 ${theme.primaryText}`}>
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Дашборд готов к автономной оффлайн-работе (PWA)</h3>
              <p className="text-xs text-slate-400 mt-0.5">Вся статистика и логи сохраняются в IndexedDB на вашем устройстве и синхронизируются автоматически.</p>
            </div>
          </div>
          <button className={`bg-slate-900 hover:bg-slate-800 text-slate-200 border ${theme.primaryBorder} px-4 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all`}>
            Установить как PWA
          </button>
        </div>

        {/* ========================================================
            TAB 1: ГЛОБАЛЬНЫЙ ОБЗОР (ТОЛЬКО ВЕРХНИЙ УРОВЕНЬ ТЕЛЕМЕТРИИ)
            ======================================================== */}
        {activeTab === 'global' && (
          <section className="space-y-8 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* КАРТА-ВИДЖЕТ: ПАЛАВАН */}
              <div className="relative overflow-hidden rounded-3xl bg-slate-900/40 border border-slate-800 p-6 shadow-xl backdrop-blur-md">
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-3xl rounded-full"></div>
                
                {/* Фото-баннер Палаван (Морской Коралл) */}
                <div className="h-44 rounded-2xl mb-6 overflow-hidden relative border border-cyan-500/20 group">
                  <img 
                    src="https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=800&q=80" 
                    alt="Palawan Lagoon Reef" 
                    className="w-full h-full object-cover brightness-[0.70] group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 to-transparent"></div>
                  <span className="absolute bottom-3 left-3 bg-cyan-950/90 text-cyan-300 border border-cyan-500/30 px-3 py-1 rounded-xl text-[10px] font-black tracking-wider uppercase font-mono">
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
                    <p className="text-2xl font-mono font-bold tracking-wider text-slate-100">{timePalawan || '--:--:--'}</p>
                    <p className="text-xs text-slate-400 font-mono">GMT+8 (UTC+8)</p>
                  </div>
                </div>

                {/* МЕТРИКИ ПАЛАВАНА */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block mb-1">Вода Temp</span>
                    <div className="text-sm font-bold font-mono text-cyan-300">{telemetry.palawan.temp}°C</div>
                  </div>
                  <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block mb-1">Кислород DO</span>
                    <div className="text-sm font-bold font-mono text-slate-100">{telemetry.palawan.do} мг/л</div>
                  </div>
                  <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block mb-1">Кислотность pH</span>
                    <div className="text-sm font-bold font-mono text-slate-100">{telemetry.palawan.pH}</div>
                  </div>
                  <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block mb-1">Соленость</span>
                    <div className="text-sm font-bold font-mono text-slate-100">{telemetry.palawan.salinity} ‰</div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/60 pt-3">
                  <span>Мутность: <strong className="text-slate-200 font-mono">{telemetry.palawan.turbidity} NTU</strong></span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${poacherAlert ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-400'}`}>
                    {poacherAlert ? '🚨 ВТОРЖЕНИЕ!' : '✓ SECURE'}
                  </span>
                </div>
              </div>

              {/* КАРТА-ВИДЖЕТ: КОСТА-РИКА */}
              <div className="relative overflow-hidden rounded-3xl bg-slate-900/40 border border-slate-800 p-6 shadow-xl backdrop-blur-md">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full"></div>
                
                {/* Фото-баннер Коста-Рика (Реальный Кофе) */}
                <div className="h-44 rounded-2xl mb-6 overflow-hidden relative border border-emerald-500/20 group">
                  <img 
                    src="https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80" 
                    alt="Costa Rica Coffee Beans Branch" 
                    className="w-full h-full object-cover brightness-[0.70] group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 to-transparent"></div>
                  <span className="absolute bottom-3 left-3 bg-emerald-950/90 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-xl text-[10px] font-black tracking-wider uppercase font-mono">
                    📍 Монтеверде • Высокогорный спешелти кофе
                  </span>
                </div>

                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Ферма 2 • Центральная Америка</span>
                    <h2 className="text-2xl font-black text-slate-100 mt-1">Коста-Рика</h2>
                    <p className="text-xs text-emerald-200/60 mt-0.5">Высокогорная Пермакультура</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-mono font-bold tracking-wider text-slate-100">{timeCostaRica || '--:--:--'}</p>
                    <p className="text-xs text-slate-400 font-mono">GMT-6 (UTC-6)</p>
                  </div>
                </div>

                {/* МЕТРИКИ КОСТА-РИКИ */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block mb-1">Влажн. Почвы</span>
                    <div className="text-sm font-bold font-mono text-emerald-300">{telemetry.costarica.soilMoisture}%</div>
                  </div>
                  <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block mb-1">Темп. Воздуха</span>
                    <div className="text-sm font-bold font-mono text-slate-100">{telemetry.costarica.airTemp}°C</div>
                  </div>
                  <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block mb-1">Осадки (24ч)</span>
                    <div className="text-sm font-bold font-mono text-slate-100">{telemetry.costarica.rain} мм</div>
                  </div>
                  <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block mb-1">Пасека</span>
                    <div className="text-sm font-bold font-mono text-yellow-400">{telemetry.costarica.hivesHealth}%</div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/60 pt-3">
                  <span>Цветение: <strong className="text-slate-200 font-mono">{telemetry.costarica.bloomIndex}%</strong></span>
                  <span className="text-emerald-400">✓ Активен медосбор</span>
                </div>
              </div>

            </div>
          </section>
        )}

        {/* ========================================================
            TAB 2: ФИЛИППИНЫ - ОСТРОВ ПАЛАВАН (МОРСКАЯ БАЗА)
            ======================================================== */}
        {activeTab === 'palawan' && (
          <section className="space-y-8 animate-fadeIn">
            
            {/* ТАКТИЧЕСКИЕ ДАТЧИКИ И ДЕМО КНОПКИ СТОРМОВ/БРАКОНЬЕРОВ */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Левый блок: Основная телеметрия */}
              <div className="lg:col-span-2 bg-slate-900/40 border border-cyan-500/20 p-6 rounded-3xl space-y-6 backdrop-blur-md">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-xs text-cyan-400 font-bold uppercase tracking-wider font-mono">📍 Palawan IoT Node</span>
                    <h3 className="text-lg font-black text-slate-100 mt-0.5">Качество Воды и Экология Лагуны</h3>
                  </div>
                  <span className="text-xs bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 px-3 py-1 rounded-full font-mono">24/7 Буй-01</span>
                </div>

                {/* Четыре датчика воды + Мутность */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block mb-1">Вода Temp</span>
                    <span className="text-lg font-mono font-bold text-cyan-300">{telemetry.palawan.temp}°C</span>
                    <span className="text-[9px] text-emerald-400 block mt-1">Оптимально</span>
                  </div>
                  <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block mb-1">Кислород DO</span>
                    <span className="text-lg font-mono font-bold text-slate-100">{telemetry.palawan.do} мг/л</span>
                    <span className="text-[9px] text-emerald-400 block mt-1">Стабильно</span>
                  </div>
                  <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block mb-1">Кислотность pH</span>
                    <span className="text-lg font-mono font-bold text-slate-100">{telemetry.palawan.pH}</span>
                    <span className="text-[9px] text-amber-400 block mt-1">Слабощелочная</span>
                  </div>
                  <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block mb-1">Соленость</span>
                    <span className={`text-lg font-mono font-bold block ${typhoonSimulated ? 'text-rose-400' : 'text-slate-100'}`}>
                      {telemetry.palawan.salinity} ‰
                    </span>
                    <span className={`text-[9px] block mt-1 ${typhoonSimulated ? 'text-rose-400 font-bold' : 'text-emerald-400'}`}>
                      {typhoonSimulated ? 'ШОК (Тайфун)' : 'Норма'}
                    </span>
                  </div>
                  <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 col-span-2 md:col-span-1">
                    <span className="text-[10px] text-slate-400 block mb-1">Мутность</span>
                    <span className="text-lg font-mono font-bold text-slate-100">{telemetry.palawan.turbidity} NTU</span>
                    <span className="text-[9px] text-emerald-400 block mt-1">Прозрачно</span>
                  </div>
                </div>

                {/* Предикативные алерты ИИ */}
                <div className={`p-4 rounded-2xl border ${typhoonSimulated ? 'bg-rose-950/50 border-rose-500/30' : 'bg-cyan-950/20 border-cyan-500/20'}`}>
                  <div className="flex gap-2 items-start">
                    <Cpu className={`w-5 h-5 mt-0.5 ${typhoonSimulated ? 'text-rose-400' : 'text-cyan-400'}`} />
                    <div>
                      <h4 className={`text-xs font-bold ${typhoonSimulated ? 'text-rose-300' : 'text-cyan-300'}`}>AI-Predictive Advisory</h4>
                      <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                        {typhoonSimulated 
                          ? "ВНИМАНИЕ: Зафиксировано критическое опреснение воды после тайфуна (соленость упала ниже 25‰). Риск осмотического шока жемчужного стада! Рекомендуется экстренно опустить линии с жемчужницами глубже 8 метров в более соленые придонные слои."
                          : "Все параметры лагуны стабильны. Риск ядовитого «красного прилива» (планктона Pyrodinium) составляет <2.1%. Условия для секреции перламутра оптимальные."
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Правый блок: Тактический симулятор кризисов */}
              <div className="bg-slate-900/40 border border-cyan-500/20 p-6 rounded-3xl space-y-4 backdrop-blur-md flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-black text-slate-100">Инженерный пульт PWA</h3>
                  <p className="text-xs text-slate-400 mt-1">Специальные симуляторы кризисных ситуаций для демонстрации работы автономных систем защиты и алертов:</p>
                </div>

                <div className="space-y-3">
                  {/* Симуляция тайфуна */}
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
                    <div>
                      <span className="text-xs font-bold block">🌀 Опреснение (Тайфун)</span>
                      <span className="text-[10px] text-slate-500">Симулировать сброс солености</span>
                    </div>
                    {typhoonSimulated ? (
                      <button 
                        onClick={resetTyphoonSimulation}
                        className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2.5 py-1.5 rounded-lg"
                      >
                        Сбросить
                      </button>
                    ) : (
                      <button 
                        onClick={triggerTyphoonSimulation}
                        className="bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition-colors"
                      >
                        Запустить
                      </button>
                    )}
                  </div>

                  {/* Симуляция браконьеров */}
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
                    <div>
                      <span className="text-xs font-bold block">🚨 Ночные браконьеры</span>
                      <span className="text-[10px] text-slate-500">Проникновение лодки в акваторию</span>
                    </div>
                    {poacherAlert ? (
                      <button 
                        onClick={resetPoacherAlert}
                        className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2.5 py-1.5 rounded-lg"
                      >
                        Сбросить
                      </button>
                    ) : (
                      <button 
                        onClick={triggerPoacherSimulation}
                        className="bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition-colors"
                      >
                        Запустить
                      </button>
                    )}
                  </div>
                </div>
              </div>

            </div>

            {/* БЕЗОПАСНОСТЬ И ОХРАНА ОТ БРАКОНЬЕРОВ (ANTI-POACHING AI) */}
            <div className={`border rounded-3xl p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 transition-all duration-500 ${poacherAlert ? 'bg-rose-950/20 border-rose-500/40 shadow-[0_0_20px_rgba(239,68,68,0.15)]' : 'bg-slate-900/40 border-cyan-500/20'}`}>
              <div className="lg:col-span-4 space-y-4">
                <div className="flex items-center gap-2">
                  <Shield className={`w-6 h-6 ${poacherAlert ? 'text-rose-400 animate-pulse' : 'text-cyan-400'}`} />
                  <h3 className="text-lg font-black text-slate-100">Anti-Poaching AI Radar</h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Кража драгоценных раковин золотистого жемчуга ночью — один из критических рисков бизнеса на Филиппинах. Наша система береговой охраны задействует круглосуточные поворотные IP-камеры с ИК-подсветкой и встроенный AI-анализ YOLOv8.
                </p>
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between border-b border-slate-800 pb-1.5">
                    <span className="text-slate-400">Алгоритм распознавания:</span>
                    <span className="text-slate-200">YOLOv8-Thermal v4</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800 pb-1.5">
                    <span className="text-slate-400">Статус вышки охраны:</span>
                    <span className={poacherAlert ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                      {poacherAlert ? '🚨 ПРОЖЕКТОРЫ ВКЛЮЧЕНЫ' : '✓ Ожидание в темноте'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Сирена деревни:</span>
                    <span className={poacherAlert ? 'text-rose-400 font-bold animate-pulse' : 'text-slate-500'}>
                      {poacherAlert ? '🔊 АКТИВИРОВАНА' : '✕ Откл.'}
                    </span>
                  </div>
                </div>
              </div>

              {/* YOLOv8 Видеопоток-Симулятор */}
              <div className="lg:col-span-8 bg-slate-950 rounded-2xl border border-slate-850 p-4 relative min-h-[300px] overflow-hidden flex flex-col justify-between">
                <div className="absolute top-3 left-3 bg-slate-950/90 border border-slate-800 px-2.5 py-1 rounded text-[10px] font-mono flex items-center gap-1.5 z-10 text-slate-300">
                  <span className={`w-2 h-2 rounded-full ${poacherAlert ? 'bg-rose-500 animate-ping' : 'bg-emerald-500'}`}></span>
                  CAM-04 (Буй #4) • Thermal Night-Vision
                </div>

                {/* Термальная графика */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  {poacherAlert ? (
                    // Лодка браконьеров в перекрестии
                    <div className="w-full h-full relative animate-fadeIn">
                      <div className="absolute inset-0 bg-rose-500/5 animate-pulse"></div>
                      {/* Сетка перекрестия */}
                      <div className="absolute inset-0 border-t border-b border-dashed border-rose-500/20 top-1/2 bottom-1/2"></div>
                      <div className="absolute inset-0 border-l border-r border-dashed border-rose-500/20 left-1/2 right-1/2"></div>
                      
                      {/* Рамка детекции браконьеров */}
                      <div className="absolute border-2 border-rose-500 bg-rose-500/10 rounded-lg p-2 animate-bounce" style={{ top: '35%', left: '42%', width: '130px', height: '80px', animationDuration: '4s' }}>
                        <span className="absolute -top-5 left-0 bg-rose-500 text-white font-mono text-[9px] font-bold px-1 py-0.5 rounded uppercase">
                          Target: Poacher Boat (97.4%)
                        </span>
                        <div className="w-4 h-4 border-t-2 border-l-2 border-white absolute top-0 left-0"></div>
                        <div className="w-4 h-4 border-b-2 border-r-2 border-white absolute bottom-0 right-0"></div>
                      </div>
                      
                      {/* Ложное распознавание: волны */}
                      <div className="absolute border border-slate-600 bg-slate-800/10 rounded p-1 opacity-40" style={{ top: '65%', left: '20%', width: '60px', height: '30px' }}>
                        <span className="absolute -top-4 left-0 text-slate-400 font-mono text-[7px] uppercase">
                          Wave (Filtered)
                        </span>
                      </div>
                    </div>
                  ) : (
                    // Спокойное море, ночной радар сканирует
                    <div className="w-full h-full relative">
                      <div className="absolute inset-0 bg-cyan-500/[0.02]"></div>
                      {/* Зеленая сетка */}
                      <div className="absolute inset-0 border-t border-b border-dashed border-cyan-500/10 top-1/2 bottom-1/2"></div>
                      <div className="absolute inset-0 border-l border-r border-dashed border-cyan-500/10 left-1/2 right-1/2"></div>
                      
                      {/* Колеблющийся радарный луч */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/0 via-cyan-500/[0.04] to-cyan-500/0 transform origin-bottom-left animate-pulse"></div>

                      <div className="absolute text-center text-xs text-slate-500" style={{ top: '45%', left: '38%' }}>
                        <Waves className="w-8 h-8 text-cyan-500/20 mx-auto animate-pulse" />
                        Акватория чиста. В ожидании детекции лодок...
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-auto z-10 flex justify-between items-center bg-slate-950/90 p-2 rounded-xl border border-slate-850">
                  <div className="text-[10px] font-mono text-slate-400">
                    Coords: 9°44'12"N, 118°43'55"E • IR-illuminator ACTIVE
                  </div>
                  {poacherAlert && (
                    <button 
                      onClick={resetPoacherAlert}
                      className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px] px-3 py-1 rounded"
                    >
                      Сбросить тревогу
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* СМАРТ-УЧЕТ, ДЛИННЫЕ ЛИНИИ И RFID (SMART INVENTORY) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Карта длинных линий */}
              <div className="lg:col-span-2 bg-slate-900/40 border border-cyan-500/20 p-6 rounded-3xl space-y-6 backdrop-blur-md">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-black flex items-center gap-2 text-cyan-400">
                    <Layers className="w-5 h-5" /> Карта Длинных Линий (Longlines Map)
                  </h3>
                  <span className="text-xs bg-cyan-500/10 text-cyan-300 px-3 py-1 rounded-full border border-cyan-500/20">4 Линии в лагуне</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map(line => (
                    <div key={line} className={`bg-slate-950/80 border p-4 rounded-2xl relative ${line === 3 ? 'border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.1)]' : 'border-slate-800'}`}>
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-bold text-sm">Линия Л-{line}</span>
                        {line === 3 ? (
                          <span className="text-[9px] text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full font-bold animate-pulse">СРОЧНО ЧИСТКА</span>
                        ) : (
                          <span className="text-[9px] text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full font-bold">ОК</span>
                        )}
                      </div>
                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between text-slate-400">
                          <span>Сетки:</span> <span className="font-mono text-slate-200">12 шт</span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>Биомасса:</span> <span className="font-mono text-slate-200">480 раковин</span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>Статус:</span> 
                          <span className={line === 3 ? 'text-amber-400 font-bold' : 'text-cyan-400 font-semibold'}>
                            {line === 3 ? 'Обрастание балянусами' : 'Стабильный рост'}
                          </span>
                        </div>
                      </div>

                      {/* Линейка прогресса загрязнения / обростания */}
                      <div className="w-full bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden">
                        <div 
                          className={`h-1.5 rounded-full ${line === 3 ? 'bg-amber-400' : 'bg-gradient-to-r from-cyan-500 to-sky-400'}`} 
                          style={{ width: line === 1 ? '90%' : line === 2 ? '75%' : line === 3 ? '35%' : '80%' }}
                        ></div>
                      </div>
                      
                      {line === 3 && (
                        <p className="text-[9px] text-amber-400 mt-2 font-mono leading-tight">
                          ⚠️ Не чистилась >4 недель. Рост жемчуга замедлен на 15%!
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {/* RFID Сканирование */}
                <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800 space-y-4">
                  <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                    <Rss className="w-4 h-4 text-cyan-400" /> Смарт-контроль RFID-меток чистки раковин
                  </h4>
                  <form onSubmit={handleRfidScan} className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Вбейте RFID-код (например: RFID-PAL-002)"
                      value={rfidSearch}
                      onChange={(e) => setRfidSearch(e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 flex-1 font-mono"
                    />
                    <button type="submit" className="bg-cyan-500 text-slate-950 px-5 py-2 rounded-xl text-sm font-bold hover:bg-cyan-400 transition-colors">
                      Сканировать
                    </button>
                  </form>

                  {/* Результат сканирования */}
                  {scannedItem && (
                    <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 text-xs space-y-2 animate-fadeIn">
                      {scannedItem.error ? (
                        <span className="text-rose-400 font-bold">{scannedItem.error}</span>
                      ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="border-r border-slate-800 pr-2">
                            <span className="text-slate-400 block">Тип сетки:</span>
                            <strong className="text-cyan-300">{scannedItem.type}</strong>
                          </div>
                          <div className="border-r border-slate-800 pr-2 font-mono">
                            <span className="text-slate-400 block">Возраст биомассы:</span>
                            <span className="text-slate-200 font-bold">{scannedItem.age}</span>
                          </div>
                          <div className="border-r border-slate-800 pr-2">
                            <span className="text-slate-400 block">Статус ухода:</span>
                            <span className={scannedItem.id === 'RFID-PAL-002' ? 'text-emerald-400 font-bold' : 'text-slate-200 font-mono'}>
                              {scannedItem.id === 'RFID-PAL-002' ? '✓ ЧИСТКА ЗАВЕРШЕНА' : 'Норма'}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 block">Вид моллюска:</span>
                            <span className="text-slate-300 font-mono italic">{scannedItem.species}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Морской Чек-лист и регистрация падежа */}
              <div className="bg-slate-900/40 border border-cyan-500/20 p-6 rounded-3xl space-y-6 backdrop-blur-md">
                <div>
                  <h3 className="text-base font-black text-slate-100">Журнал чистки & Контроль ухода</h3>
                  <p className="text-xs text-slate-400 mt-1">Отслеживание рутины персонала на лонглайнах:</p>
                </div>

                <div className="space-y-2.5">
                  {cleaningChecklist.map(task => (
                    <label key={task.id} className="flex items-start gap-3 p-3 bg-slate-950/80 rounded-xl border border-slate-850 cursor-pointer hover:border-cyan-500/40 transition-colors">
                      <input 
                        type="checkbox"
                        checked={task.done}
                        onChange={() => {
                          setCleaningChecklist(prev => prev.map(t => t.id === task.id ? { ...t, done: !t.done } : t));
                        }}
                        className="mt-0.5 rounded text-cyan-500 focus:ring-cyan-500 bg-slate-950 border-slate-800 w-4 h-4"
                      />
                      <span className={`text-xs ${task.done ? 'line-through text-slate-500' : 'text-slate-200'}`}>{task.label}</span>
                    </label>
                  ))}
                </div>

                {/* УЧЕТ СМЕРТНОСТИ / ПАДЕЖА */}
                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 animate-pulse" /> Фиксация падежа / смертности стада
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    <input 
                      type="number" 
                      placeholder="Штук"
                      value={newMortality.qty}
                      onChange={(e) => setNewMortality({ ...newMortality, qty: e.target.value })}
                      className="bg-slate-950 border border-slate-850 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-rose-500 font-mono"
                    />
                    <select 
                      value={newMortality.cause}
                      onChange={(e) => setNewMortality({ ...newMortality, cause: e.target.value })}
                      className="bg-slate-950 border border-slate-850 rounded-lg px-2.5 py-1 text-xs text-slate-400 focus:outline-none focus:ring-1 focus:ring-rose-500"
                    >
                      <option value="Естественный отбор">Естеств. отбор</option>
                      <option value="Хищники">Хищники</option>
                      <option value="Паразиты (Полидор)">Паразиты</option>
                      <option value="Тайфун / Пресная вода">Опреснение</option>
                    </select>
                  </div>
                  <button 
                    onClick={() => {
                      if (!newMortality.qty) return;
                      setMortalityLog([{
                        date: new Date().toISOString().split('T')[0],
                        type: 'Жемчужницы (Pinctada maxima)',
                        qty: parseInt(newMortality.qty),
                        cause: newMortality.cause
                      }, ...mortalityLog]);
                      setNewMortality({ qty: '', cause: 'Естественный отбор' });
                    }}
                    className="w-full bg-rose-600 hover:bg-rose-500 text-slate-100 font-bold text-xs py-1.5 rounded-lg transition-colors"
                  >
                    Зарегистрировать в базу IndexedDB
                  </button>

                  <div className="space-y-1.5 pt-1.5 max-h-[80px] overflow-y-auto border-t border-slate-900 mt-2">
                    {mortalityLog.map((log, idx) => (
                      <div key={idx} className="flex justify-between text-[10px] text-slate-500 font-mono">
                        <span>{log.date} — {log.qty} шт ({log.cause})</span>
                        <span className="text-rose-400">Записано</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>

            {/* МНОГОУРОВНЕВАЯ СИСТЕМА IMTA (БИОМАССА РАЗНЫХ ЯРУСОВ) */}
            <div className="bg-slate-900/40 border border-cyan-500/20 p-6 rounded-3xl space-y-6 backdrop-blur-md">
              <div>
                <h3 className="text-lg font-black flex items-center gap-2 text-cyan-400">
                  <Compass className="w-5 h-5" /> Контроль многоуровневой системы IMTA (Биомасса)
                </h3>
                <p className="text-xs text-slate-400 mt-1">Оптимизация биологической продуктивности в разных ярусах водного столба лагуны:</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Верхний ярус */}
                <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800 space-y-3 relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-cyan-500/10 px-2 py-0.5 rounded-bl-xl text-[9px] font-mono text-cyan-400 font-bold border-l border-b border-slate-800">
                    Верхний Ярус
                  </div>
                  <h4 className="font-bold text-sm text-cyan-300">Пищевые устрицы (Crassostrea)</h4>
                  <div className="space-y-2 text-xs">
                    <p className="text-slate-300 leading-relaxed">
                      Выращиваются для естественной фильтрации поверхностного планктона и коммерческого мяса (Pearl Meat).
                    </p>
                    <div className="flex justify-between border-t border-slate-900 pt-2 font-mono text-[11px]">
                      <span className="text-slate-500">Общее поголовье:</span>
                      <span className="text-slate-200">8,500 шт</span>
                    </div>
                    <div className="flex justify-between font-mono text-[11px]">
                      <span className="text-slate-500">Темп роста створок:</span>
                      <span className="text-emerald-400">+1.2 мм / неделя</span>
                    </div>
                  </div>
                </div>

                {/* Средний ярус */}
                <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800 space-y-3 relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-cyan-500/10 px-2 py-0.5 rounded-bl-xl text-[9px] font-mono text-cyan-400 font-bold border-l border-b border-slate-800">
                    Средний Ярус
                  </div>
                  <h4 className="font-bold text-sm text-cyan-300">Тигровые лангусты (Panulirus)</h4>
                  <div className="space-y-2 text-xs">
                    <p className="text-slate-300 leading-relaxed">
                      Выращиваются в плавучих сетчатых садках под лонглайнами. Питаются биообрастаниями и кормом.
                    </p>
                    <div className="flex justify-between border-t border-slate-900 pt-2 font-mono text-[11px]">
                      <span className="text-slate-500">Популяция:</span>
                      <span className="text-slate-200">450 особей в садках</span>
                    </div>
                    <div className="flex justify-between font-mono text-[11px]">
                      <span className="text-slate-500">Средний вес / корм:</span>
                      <span className="text-slate-200">720г / 45кг в сутки</span>
                    </div>
                  </div>
                </div>

                {/* Донный ярус */}
                <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800 space-y-3 relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-cyan-500/10 px-2 py-0.5 rounded-bl-xl text-[9px] font-mono text-cyan-400 font-bold border-l border-b border-slate-800">
                    Донный Ярус
                  </div>
                  <h4 className="font-bold text-sm text-cyan-300">Золотой трепанг (Holothuria)</h4>
                  <div className="space-y-2 text-xs">
                    <p className="text-slate-300 leading-relaxed">
                      Морские огурцы очищают дно под садками лангустов и жемчужниц от органического детрита, снижая накопление ила.
                    </p>
                    <div className="flex justify-between border-t border-slate-900 pt-2 font-mono text-[11px]">
                      <span className="text-slate-500">Плотность дна:</span>
                      <span className="text-slate-200">8 особей / м²</span>
                    </div>
                    <div className="flex justify-between font-mono text-[11px]">
                      <span className="text-slate-500">Статус очистки грунта:</span>
                      <span className="text-emerald-400">ВЫСОКОЭФФЕКТИВНО</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* ПРОГНОЗИРУЕМЫЙ УРОЖАЙ И КЛАДОВКА (СЧЕТЧИКИ) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-3xl shadow-lg backdrop-blur-md">
                <span className="text-xs text-slate-400 font-semibold block uppercase tracking-wider">Прогноз Жемчуга</span>
                <span className="text-3xl font-black font-mono text-cyan-300 block mt-2">1,240 шт</span>
                <span className="text-[10px] text-slate-500 font-mono block mt-1">Категории AAA/AA (Золотой Южно-Морской)</span>
              </div>
              <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-3xl shadow-lg backdrop-blur-md">
                <span className="text-xs text-slate-400 font-semibold block uppercase tracking-wider">Сушеный трепанг</span>
                <span className="text-3xl font-black font-mono text-slate-100 block mt-2">420 кг</span>
                <span className="text-[10px] text-slate-500 font-mono block mt-1">Коммерческий сорт очистителей дна</span>
              </div>
              <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-3xl shadow-lg backdrop-blur-md">
                <span className="text-xs text-slate-400 font-semibold block uppercase tracking-wider">Устричное мясо (Pearl Meat)</span>
                <span className="text-3xl font-black font-mono text-slate-100 block mt-2">150 кг</span>
                <span className="text-[10px] text-slate-500 font-mono block mt-1">Деликатесные мускулы Pinctada</span>
              </div>
              <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-3xl shadow-lg backdrop-blur-md">
                <span className="text-xs text-slate-400 font-semibold block uppercase tracking-wider">Перламутровая посуда</span>
                <span className="text-3xl font-black font-mono text-slate-100 block mt-2">85 шт</span>
                <span className="text-[10px] text-slate-500 font-mono block mt-1">Монолитные тарелки бренда (>20 см)</span>
              </div>
            </div>

            {/* ИИ-ГРЕЙДИНГ И СОРТИРОВКА (ЖЕМЧУГ И СТВОРКИ) */}
            <div className="bg-slate-900/40 border border-cyan-500/20 p-6 rounded-3xl space-y-6 backdrop-blur-md">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-lg font-black flex items-center gap-2 text-cyan-400">
                    <Cpu className="w-5 h-5 animate-pulse text-cyan-400" /> Модуль ИИ-Грейдинга Жемчуга и Перламутра
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Сверточное компьютерное зрение (WASM TensorFlow.js) калибрует драгоценный жемчуг и створки раковин по фракциям.
                  </p>
                </div>

                <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                  <button 
                    onClick={() => { setAiSortingType('pearl'); setAiResult(null); }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${aiSortingType === 'pearl' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400'}`}
                  >
                    Жемчуг Pinctada Maxima
                  </button>
                  <button 
                    onClick={() => { setAiSortingType('mop'); setAiResult(null); }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${aiSortingType === 'mop' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400'}`}
                  >
                    Створки раковин (Mother-of-Pearl)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Камера и визуализация */}
                <div className="bg-slate-950 border border-dashed border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-4 hover:border-cyan-500/50 transition-all relative overflow-hidden min-h-[320px]">
                  {aiResult || aiAnalyzing ? (
                    <div className="absolute inset-0 w-full h-full animate-fadeIn">
                      <img 
                        src={aiSortingType === 'pearl'
                          ? "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=600&q=80" // Реальный золотой жемчуг южных морей (без косметики!)
                          : "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=600&q=80" // Створки/ракушки в воде
                        } 
                        alt="AI Scan Item" 
                        className="w-full h-full object-cover brightness-[0.7] contrast-[1.05]"
                      />
                      <div className="absolute left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_10px_rgba(34,211,238,0.8)] animate-bounce" style={{ top: '35%', animationDuration: '3s' }}></div>
                      
                      {!aiAnalyzing && aiResult && (
                        <div className="absolute inset-4 border-2 border-dashed rounded-xl border-cyan-400/40 flex items-center justify-center">
                          <div className="bg-slate-950/95 border border-cyan-400/40 p-3 rounded-lg text-[10px] text-cyan-300 font-mono text-left max-w-[220px] shadow-2xl absolute top-4 left-4">
                            <div className="font-bold border-b border-cyan-400/20 pb-0.5 mb-1 flex items-center gap-1">
                              <Cpu className="w-3 h-3 animate-spin" /> Neural-Scan v2
                            </div>
                            <div>Класс: <span className="text-white font-bold">{aiSortingType === 'pearl' ? 'AAA Golden Pearl' : 'Pinctada Maxima Shell'}</span></div>
                            <div>Достоверность: <span className="text-emerald-400 font-bold">99.4%</span></div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="p-4 bg-slate-900 rounded-full border border-slate-800 inline-block">
                        <Camera className="w-8 h-8 text-cyan-400" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-300">Камера ИИ-экспертизы Pinctada</h4>
                        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                          Сфотографируйте жемчуг на контрастном подносе для оценки параметров или створки раковины под производство тарелок.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 z-10 mt-auto bg-slate-950/90 p-2 rounded-xl border border-slate-800">
                    <button type="button" className="bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-800">
                      Снимок с телефона
                    </button>
                    <button 
                      onClick={handleAiAnalysis}
                      disabled={aiAnalyzing}
                      className="bg-cyan-500 text-slate-950 text-xs font-bold px-4 py-1.5 rounded-lg shadow-lg hover:bg-cyan-400 transition-all disabled:opacity-50"
                    >
                      {aiAnalyzing ? 'Анализ нейросетью...' : 'Запустить ИИ-тест'}
                    </button>
                    {(aiResult || aiAnalyzing) && (
                      <button 
                        onClick={() => setAiResult(null)}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-2.5 py-1.5 rounded-lg border border-slate-700"
                      >
                        Сбросить
                      </button>
                    )}
                  </div>
                </div>

                {/* Вывод результатов */}
                <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-850 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 font-mono">Параметры сортировки</h4>
                    
                    {aiAnalyzing && (
                      <div className="space-y-4 py-8 text-center md:text-left">
                        <div className="flex items-center gap-3 text-xs text-slate-300 justify-center md:justify-start">
                          <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin" />
                          <span>WASM TensorFlow.js распознает контуры, рефракцию цвета и блеск...</span>
                        </div>
                        <div className="w-full bg-slate-850 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-cyan-500 h-1.5 rounded-full animate-pulse" style={{ width: '85%' }}></div>
                        </div>
                      </div>
                    )}

                    {!aiAnalyzing && aiResult && (
                      <div className="space-y-4 animate-fadeIn">
                        <div className="flex justify-between items-center border-b border-slate-800/80 pb-2">
                          <span className="text-xs text-slate-400">Грейд классификации:</span>
                          <span className="text-xs bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2.5 py-1 rounded-full font-black">
                            {aiResult.grade}
                          </span>
                        </div>

                        {aiSortingType === 'pearl' ? (
                          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-850">
                              <span className="text-slate-500 block">Размер:</span>
                              <strong className="text-slate-200">{aiResult.size}</strong>
                            </div>
                            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-850">
                              <span className="text-slate-500 block">Сферичность:</span>
                              <strong className="text-slate-200">{aiResult.shape}</strong>
                            </div>
                            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-850">
                              <span className="text-slate-500 block">Золотистость (Brix/Lux):</span>
                              <strong className="text-amber-400">{aiResult.color}</strong>
                            </div>
                            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-850">
                              <span className="text-slate-500 block">Чистота / Luster:</span>
                              <strong className="text-cyan-300">{aiResult.luster}</strong>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-slate-950 p-3 rounded-lg border border-slate-850 text-xs space-y-1.5">
                            <div className="flex justify-between">
                              <span className="text-slate-400">Размер створки:</span>
                              <strong className="text-slate-200">{aiResult.size}</strong>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Дефекты / Состояние:</span>
                              <span className="text-slate-300">{aiResult.desc}</span>
                            </div>
                          </div>
                        )}

                        <div className="p-3 bg-slate-950 rounded-xl border border-cyan-500/20 text-xs">
                          <strong className="text-slate-400">Назначение / Сортировка:</strong>
                          <p className="text-emerald-400 font-bold mt-1">{aiResult.action}</p>
                        </div>
                      </div>
                    )}

                    {!aiAnalyzing && !aiResult && (
                      <div className="text-slate-500 text-xs text-center py-12 font-mono">
                        Ожидание съемки урожая. Протестируйте AI-тест для калибровки и распределения лотов.
                      </div>
                    )}
                  </div>

                  <div className="text-[9px] text-slate-500 mt-4 border-t border-slate-800/60 pt-3">
                    Используется локальная глубокая сверточная сеть MobileNetV3 (обучена на 50k+ макроснимках жемчуга Pinctada).
                  </div>
                </div>

              </div>
            </div>

            {/* ИЗОЛИРОВАННЫЙ IOT-ЛОГ СОБЫТИЙ ОХРАНЫ И ЛАГУНЫ (ФИЛЬТРУЕТСЯ) */}
            <div className="bg-slate-900/40 border border-cyan-500/20 p-6 rounded-3xl space-y-6 backdrop-blur-md">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-base font-black text-slate-100 flex items-center gap-2">
                    <ShieldAlert className="text-cyan-400 w-5 h-5" /> Панель Мониторинга Охраны Палавана (Логи 24/7)
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Логи тепловизоров береговой охраны, датчиков глубины и тайфунных буев лагуны</p>
                </div>

                <form onSubmit={handleAddAlert} className="flex gap-2 w-full sm:w-auto">
                  <input 
                    type="text" 
                    placeholder="Симулировать ручную запись..."
                    value={newAlertMessage}
                    onChange={(e) => setNewAlertMessage(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono flex-1 sm:w-60"
                  />
                  <button type="submit" className="bg-cyan-500 text-slate-950 hover:bg-cyan-400 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors">
                    Внести
                  </button>
                </form>
              </div>

              <div className="bg-slate-950 rounded-2xl border border-slate-850 overflow-hidden">
                <div className="grid grid-cols-12 bg-slate-900 px-4 py-2.5 text-xs font-bold text-slate-400 border-b border-slate-800">
                  <div className="col-span-2">Время</div>
                  <div className="col-span-3">Узел / Сенсор</div>
                  <div className="col-span-5">Запись события</div>
                  <div className="col-span-2 text-right">Угроза</div>
                </div>

                <div className="divide-y divide-slate-900/80 max-h-[180px] overflow-y-auto">
                  {securityLog
                    .filter(log => log.location.includes('Палаван') || log.location.includes('Буй'))
                    .map((log) => (
                      <div key={log.id} className="grid grid-cols-12 px-4 py-3 text-xs text-slate-300 hover:bg-slate-900/40 items-center transition-colors">
                        <div className="col-span-2 font-mono text-slate-500">{log.time}</div>
                        <div className="col-span-3 font-semibold flex items-center gap-1.5 text-cyan-300 font-mono">
                          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400"></span>
                          {log.location}
                        </div>
                        <div className="col-span-5 text-slate-400 font-mono">{log.event}</div>
                        <div className="col-span-2 text-right">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            log.severity === 'high' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20 animate-pulse' :
                            log.severity === 'warning' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                            'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                          }`}>
                            {log.severity.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>

          </section>
        )}

        {/* ========================================================
            TAB 3: КОСТА-РИКА - ВЫСОКОГОРНАЯ ПЕРМАКУЛЬТУРА (AGRO)
            ======================================================== */}
        {activeTab === 'costarica' && (
          <section className="space-y-8 animate-fadeIn">
            
            {/* ТЕЛЕМЕТРИЯ КЛИМАТА */}
            <div className="bg-slate-900/40 border border-emerald-500/20 p-6 rounded-3xl space-y-6 backdrop-blur-md">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <div>
                  <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider font-mono">📍 Costa Rica Agro Node</span>
                  <h3 className="text-lg font-black text-slate-100 mt-0.5">Климат, Орошение и Контроль Плантации</h3>
                </div>
                <span className="text-xs bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-3 py-1 rounded-full font-mono">24/7 Node-02</span>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block mb-1">Влажность почвы</span>
                  <span className="text-lg font-mono font-bold text-emerald-300">{telemetry.costarica.soilMoisture}%</span>
                  <span className="text-[9px] text-emerald-400 block mt-1">✓ Норма</span>
                </div>
                <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block mb-1">Темп. воздуха</span>
                  <span className="text-lg font-mono font-bold text-slate-100">{telemetry.costarica.airTemp}°C</span>
                  <span className="text-[9px] text-slate-400 block mt-1">Утренний туман</span>
                </div>
                <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block mb-1">Осадки (24ч)</span>
                  <span className="text-lg font-mono font-bold text-slate-100">{telemetry.costarica.rain} мм</span>
                  <span className="text-[9px] text-indigo-300 block mt-1">Умеренно</span>
                </div>
                <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block mb-1">Здоровье Пасеки</span>
                  <span className="text-lg font-mono font-bold text-yellow-400">{telemetry.costarica.hivesHealth}%</span>
                  <span className="text-[9px] text-yellow-500 font-bold block mt-1">Высокий лет</span>
                </div>
              </div>
            </div>

            {/* КОФЕ, ВАНИЛЬ, ПЧЕЛЫ */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              <div className="lg:col-span-2 bg-slate-900/40 border border-emerald-500/20 p-6 rounded-3xl space-y-6 backdrop-blur-md">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <h3 className="text-lg font-bold flex items-center gap-2 text-emerald-400">
                    <Layers className="w-5 h-5" /> Учет Микро-Лотов Кофе & Какао
                  </h3>
                  <span className="text-xs bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-3 py-1 rounded-full font-mono">Сбор 2026</span>
                </div>

                {/* Кофе лоты */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {COFFEE_BATCHES.map(batch => (
                    <div key={batch.id} className="bg-slate-950/80 border border-slate-850 p-4 rounded-2xl space-y-3">
                      <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                        <span className="font-bold text-sm text-amber-400 font-mono">{batch.id}</span>
                        <span className="text-[10px] bg-slate-900 text-slate-300 px-2 py-0.5 rounded border border-slate-800 font-mono">{batch.variety}</span>
                      </div>
                      <div className="space-y-1.5 text-xs text-slate-300">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Стадия процесса:</span>
                          <span className="font-bold text-emerald-400">{batch.stage}</span>
                        </div>
                        <div className="flex justify-between font-mono text-[11px]">
                          <span className="text-slate-500">Влажность зерна:</span>
                          <span>{batch.moisture}</span>
                        </div>
                        <div className="flex justify-between font-mono text-[11px]">
                          <span className="text-slate-500">Сахар BRIX:</span>
                          <span className="text-amber-300 font-bold">{batch.brix}</span>
                        </div>
                        {batch.hoursLeft && (
                          <div className="flex justify-between font-mono text-[11px]">
                            <span className="text-slate-500">Времени осталось:</span>
                            <span className="text-cyan-400 animate-pulse font-bold">{batch.hoursLeft} часов</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Ручное опыление ванили */}
                <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800 space-y-4">
                  <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2 font-mono">
                    <Sun className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '8s' }} /> Опыление Дикой Ванили (Vanilla planifolia)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {vanillaPollinations.map(sec => (
                      <div key={sec.id} className="bg-slate-950 p-3 rounded-xl border border-slate-850 text-xs space-y-2">
                        <div className="flex justify-between font-bold">
                          <span>Сектор: {sec.id}</span>
                          <span className="text-emerald-400 font-mono">{sec.count} лиан</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Опылено сегодня:</span>
                          <span className="text-amber-400 font-mono font-bold">{sec.pollinatedToday} цветков</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Стадия стручков:</span>
                          <span className="text-slate-300">{sec.matureStatus}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <input 
                      type="number" 
                      placeholder="Добавить опыленные сегодня цветки (+ шт)"
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
                      Записать в базу
                    </button>
                  </div>
                </div>
              </div>

              {/* Пасека и карта участков */}
              <div className="bg-slate-900/40 border border-emerald-500/20 p-6 rounded-3xl space-y-6 backdrop-blur-md flex flex-col justify-between">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-black text-yellow-400 flex items-center gap-1.5">
                      🐝 Контроль Пасеки (Апикультура)
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">Опылители кофе и дикой ванили:</p>
                  </div>

                  <div className="space-y-3">
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-850">
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span>Семья У-12 (Italian Honeybee)</span>
                        <span className="text-rose-400 font-bold">Осмотр улья!</span>
                      </div>
                      <div className="w-full bg-slate-900 rounded-full h-1.5 mt-2">
                        <div className="bg-rose-500 h-1.5 rounded-full" style={{ width: '64%' }}></div>
                      </div>
                      <span className="text-[9px] text-slate-500 font-mono block mt-2">Снижен гул до 68Гц. Возможно деление роя.</span>
                    </div>

                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-850">
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span>Семья У-15 (Carnica Mix)</span>
                        <span className="text-emerald-400 font-bold">Здорова</span>
                      </div>
                      <div className="w-full bg-slate-900 rounded-full h-1.5 mt-2">
                        <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '96%' }}></div>
                      </div>
                      <span className="text-[9px] text-slate-500 font-mono block mt-2">Отличный лет, активный сбор дикого нектара.</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-850 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Карта Участков Плантации</h4>
                  <div className="grid grid-cols-2 gap-1.5">
                    {['Кофе Восток', 'Кофе Запад', 'Какао Низина', 'Сад Ванили'].map(sec => (
                      <button 
                        key={sec}
                        onClick={() => setSelectedSector(sec)}
                        className={`text-[10px] p-2 rounded-lg border font-bold transition-all ${selectedSector === sec ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-black' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'}`}
                      >
                        {sec}
                      </button>
                    ))}
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded-lg text-center text-xs border border-slate-800/80">
                    Активен сектор: <strong className="text-emerald-400 font-bold">{selectedSector}</strong>
                    <p className="text-[9px] text-slate-500 mt-1 leading-tight">Биологические ЭМ-препараты защиты внесены успешно.</p>
                  </div>
                </div>
              </div>

            </div>

            {/* ИИ-ГРЕЙДИНГ И СОРТИРОВКА КОФЕ */}
            <div className="bg-slate-900/40 border border-emerald-500/20 p-6 rounded-3xl space-y-6 backdrop-blur-md">
              <div>
                <h3 className="text-lg font-black flex items-center gap-2 text-emerald-400">
                  <Cpu className="w-5 h-5 animate-pulse" /> Оценка Качества Кофе-Ягод (Computer Vision)
                </h3>
                <p className="text-xs text-slate-400 mt-1">Определение дефектов и квакеров ягод арабики в реальном времени с помощью YOLOv8 WebAssembly.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Камера */}
                <div className="bg-slate-950 border border-dashed border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-4 hover:border-emerald-500/50 transition-all relative overflow-hidden min-h-[300px]">
                  {aiResult || aiAnalyzing ? (
                    <div className="absolute inset-0 w-full h-full animate-fadeIn">
                      <img 
                        src="https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=600&q=80" // Зеленые и спелые кофейные бобы (без кроссовок!)
                        alt="AI Coffee Scan" 
                        className="w-full h-full object-cover brightness-[0.7] contrast-[1.05]"
                      />
                      <div className="absolute left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_10px_rgba(16,185,129,0.8)] animate-bounce" style={{ top: '45%', animationDuration: '3s' }}></div>
                      
                      {!aiAnalyzing && aiResult && (
                        <div className="absolute inset-4 border-2 border-dashed rounded-xl border-emerald-400/40 flex items-center justify-center">
                          <div className="bg-slate-950/95 border border-emerald-400/40 p-3 rounded-lg text-[10px] text-emerald-300 font-mono text-left max-w-[220px] shadow-2xl absolute top-4 left-4">
                            <div className="font-bold border-b border-emerald-400/20 pb-0.5 mb-1 flex items-center gap-1">
                              <Cpu className="w-3 h-3 animate-spin" /> Arabica-Vision v1
                            </div>
                            <div>Лот: <span className="text-white font-bold">Premium Arabica</span></div>
                            <div>Оценка дефектов: <span className="text-emerald-400 font-bold">Крупных нет</span></div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="p-4 bg-slate-900 rounded-full border border-slate-800 inline-block">
                        <Camera className="w-8 h-8 text-emerald-400" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-300">Камера ИИ-анализа кофе</h4>
                        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                          Загрузите макроснимок лота спелых ягод или зерен на сушильной кровати для поиска квакеров.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 z-10 mt-auto bg-slate-950/90 p-2 rounded-xl border border-slate-800">
                    <button type="button" className="bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-800">
                      Снимок с камеры
                    </button>
                    <button 
                      onClick={handleAiAnalysis}
                      disabled={aiAnalyzing}
                      className="bg-emerald-500 text-slate-950 text-xs font-bold px-4 py-1.5 rounded-lg shadow-lg hover:bg-emerald-400 transition-all disabled:opacity-50"
                    >
                      {aiAnalyzing ? 'Анализ лота...' : 'Запустить ИИ-тест'}
                    </button>
                    {(aiResult || aiAnalyzing) && (
                      <button 
                        onClick={() => setAiResult(null)}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-2.5 py-1.5 rounded-lg border border-slate-700"
                      >
                        Сбросить
                      </button>
                    )}
                  </div>
                </div>

                {/* Результаты грейдинга кофе */}
                <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-850 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 font-mono">Вердикт экспертной системы</h4>
                    
                    {aiAnalyzing && (
                      <div className="space-y-4 py-8 text-center md:text-left">
                        <div className="flex items-center gap-3 text-xs text-slate-300 justify-center md:justify-start">
                          <RefreshCw className="w-4 h-4 text-emerald-400 animate-spin" />
                          <span>Анализ плотности влажности и калибра зерен по шкале SCAA...</span>
                        </div>
                        <div className="w-full bg-slate-850 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-emerald-500 h-1.5 rounded-full animate-pulse" style={{ width: '85%' }}></div>
                        </div>
                      </div>
                    )}

                    {!aiAnalyzing && aiResult && (
                      <div className="space-y-4 animate-fadeIn">
                        <div className="flex justify-between items-center border-b border-slate-800/80 pb-2">
                          <span className="text-xs text-slate-400">Спешелти грейд:</span>
                          <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-full font-black font-mono">
                            {aiResult.grade}
                          </span>
                        </div>
                        <p className="text-sm text-slate-300 leading-relaxed font-mono">{aiResult.desc}</p>
                        <div className="p-3 bg-slate-950 rounded-xl border border-emerald-500/20 text-xs">
                          <strong className="text-slate-400">Допуск партии:</strong>
                          <p className="text-emerald-400 font-bold mt-1">{aiResult.action}</p>
                        </div>
                      </div>
                    )}

                    {!aiAnalyzing && !aiResult && (
                      <div className="text-slate-500 text-xs text-center py-12 font-mono">
                        Ожидание съемки урожая кофе. Запустите ИИ-тест для анализа SCAA.
                      </div>
                    )}
                  </div>

                  <div className="text-[9px] text-slate-500 mt-4 border-t border-slate-800/60 pt-3">
                    Используется нейросеть MobileNet, предобученная на дефектах арабики (черные зерна, повреждения вредителями, квакеры).
                  </div>
                </div>

              </div>
            </div>

            {/* ИЗОЛИРОВАННЫЕ ЛОГИ КОСТА-РИКИ */}
            <div className="bg-slate-900/40 border border-emerald-500/20 p-6 rounded-3xl space-y-6 backdrop-blur-md">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-base font-black text-slate-100 flex items-center gap-2">
                    <ShieldAlert className="text-emerald-400 w-5 h-5" /> Панель Контроля Микроклимата и Орошения (Коста-Рика)
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Логи климатических станций, параметров ульев и датчиков влажности почвы в реальном времени</p>
                </div>

                <form onSubmit={handleAddAlert} className="flex gap-2 w-full sm:w-auto">
                  <input 
                    type="text" 
                    placeholder="Записать лог вручную..."
                    value={newAlertMessage}
                    onChange={(e) => setNewAlertMessage(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono flex-1 sm:w-60"
                  />
                  <button type="submit" className="bg-emerald-500 text-slate-950 hover:bg-emerald-400 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors">
                    Внести
                  </button>
                </form>
              </div>

              <div className="bg-slate-950 rounded-2xl border border-slate-850 overflow-hidden">
                <div className="grid grid-cols-12 bg-slate-900 px-4 py-2.5 text-xs font-bold text-slate-400 border-b border-slate-800">
                  <div className="col-span-2">Время</div>
                  <div className="col-span-3">Узел / Сенсор</div>
                  <div className="col-span-5">Запись события</div>
                  <div className="col-span-2 text-right">Статус</div>
                </div>

                <div className="divide-y divide-slate-900/80 max-h-[180px] overflow-y-auto">
                  {securityLog
                    .filter(log => log.location.includes('Коста-Рика') || log.location.includes('Улей'))
                    .map((log) => (
                      <div key={log.id} className="grid grid-cols-12 px-4 py-3 text-xs text-slate-300 hover:bg-slate-900/40 items-center transition-colors">
                        <div className="col-span-2 font-mono text-slate-500">{log.time}</div>
                        <div className="col-span-3 font-semibold flex items-center gap-1.5 text-emerald-300 font-mono">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                          {log.location}
                        </div>
                        <div className="col-span-5 text-slate-400 font-mono">{log.event}</div>
                        <div className="col-span-2 text-right">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            log.severity === 'high' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20 animate-pulse' :
                            log.severity === 'warning' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                            'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                          }`}>
                            {log.severity.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>

          </section>
        )}

      </main>

      {/* FOOTER */}
      <footer className={`border-t ${theme.primaryBorder} mt-12 py-8 text-center text-xs text-slate-500 bg-slate-950 transition-colors duration-500`}>
        <p>© 2026 Eco-Synapse Systems. Разработано для оффлайн-нод Филиппины-Палаван & Коста-Рика.</p>
        <p className="mt-1 font-mono text-[10px] text-cyan-500">Node ID: NODE-SECURE-ALPHA-01</p>
      </footer>

    </div>
  );
}
