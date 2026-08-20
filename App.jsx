import React, { useState, useEffect } from 'react';
import { 
  Activity, Anchor, Award, Beaker, CloudRain, Compass, Database, Droplet, 
  Eye, Feather, HardDrive, Heart, Home, Layers, MapPin, Navigation, 
  Radio, RefreshCw, Rss, Shield, ShieldAlert, Sun, Thermometer, Trash2, 
  Wind, Zap, CheckSquare, Plus, AlertTriangle, Cpu, Camera, Filter, HardHat
} from 'lucide-react';

// === МОКОВЫЕ ДАННЫЕ ДЛЯ СТАРТА ===
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
  
  // IoT Real-Time Telemetry (с автоматическим дрейфом значений)
  const [telemetry, setTelemetry] = useState({
    palawan: { temp: 28.4, pH: 8.15, do: 6.75, salinity: 34.2, status: 'SECURE' },
    costarica: { soilMoisture: 68.2, airTemp: 23.4, rain: 12.0, bloomIndex: 88, hivesHealth: 94 }
  });

  // Локальные реактивные состояния для интерактивности модулей
  const [securityLog, setSecurityLog] = useState(INITIAL_SECURITY_LOG);
  const [newAlertMessage, setNewAlertMessage] = useState('');
  
  // RFID Сканнер
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

  // Коста-Рика Кофе & Ваниль & Пчелы
  const [vanillaPollinations, setVanillaPollinations] = useState([
    { id: 'V-SEC-B', count: 142, pollinatedToday: 18, matureStatus: '85% зеленые стручки' },
    { id: 'V-SEC-C', count: 95, pollinatedToday: 12, matureStatus: '40% созревание' }
  ]);
  const [newPollinationCount, setNewPollinationCount] = useState('');
  const [selectedSector, setSelectedSector] = useState('Кофе Восток');

  // AI-Сортировка (Симулятор)
  const [aiSortingType, setAiSortingType] = useState('pearl'); // 'pearl' | 'coffee'
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

  // Функция симуляции RFID сканирования
  const handleRfidScan = (e) => {
    e.preventDefault();
    const trimmed = rfidSearch.trim().toUpperCase();
    if (INITIAL_RFID_REGISTRY[trimmed]) {
      setScannedItem({ id: trimmed, ...INITIAL_RFID_REGISTRY[trimmed] });
    } else {
      setScannedItem({ error: 'Метка не найдена в базе данных IndexedDB' });
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
          { grade: 'AAA Gem Quality', desc: 'Идеальная сферичность, зеркальный золотистый люстр. Под бренд-коллекцию.', shellUse: 'Монолитная тарелка бренда' },
          { grade: 'Класс B (Экспорт)', desc: 'Минорные природные неровности. Рекомендовано для жемчужных нитей средней категории.', shellUse: 'Оптовая продажа раковины' },
          { grade: 'Класс C (Барочный жемчуг)', desc: 'Уникальная асимметричная форма, высокий перламутровый блеск.', shellUse: 'Декор интерьеров' }
        ];
        setAiResult(grades[Math.floor(Math.random() * grades.length)]);
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-900">
      
      {/* HEADER / ТАКТИЧЕСКИЙ БАР */}
      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-4 py-3 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-teal-500 to-emerald-400 p-2 rounded-xl text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
            <Cpu className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-teal-400 via-emerald-400 to-amber-300 bg-clip-text text-transparent">
              ECO-SYNAPSE PWA
            </h1>
            <p className="text-xs text-slate-400 font-mono">Autonomous Bi-Farm Controller [v1.2.0-offline]</p>
          </div>
        </div>

        {/* НАВИГАЦИОННЫЙ ПЕРЕКЛЮЧАТЕЛЬ ЛОКАЦИЙ */}
        <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-xl w-full sm:w-auto overflow-x-auto">
          <button 
            onClick={() => setActiveTab('global')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all duration-300 ${activeTab === 'global' ? 'bg-gradient-to-r from-slate-800 to-slate-700 text-teal-400 shadow-sm border border-slate-700/50' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Home className="w-3.5 h-3.5" />
            Глобальный Обзор
          </button>
          <button 
            onClick={() => setActiveTab('palawan')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all duration-300 ${activeTab === 'palawan' ? 'bg-teal-500 text-slate-950 shadow-[0_0_12px_rgba(20,184,166,0.4)]' : 'text-slate-400 hover:text-teal-400'}`}
          >
            <Anchor className="w-3.5 h-3.5" />
            Ферма 1: Палаван (Морская)
          </button>
          <button 
            onClick={() => setActiveTab('costarica')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all duration-300 ${activeTab === 'costarica' ? 'bg-emerald-500 text-slate-950 shadow-[0_0_12px_rgba(16,185,129,0.4)]' : 'text-slate-400 hover:text-emerald-400'}`}
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
        <div className="bg-gradient-to-r from-teal-500/10 via-emerald-500/10 to-amber-500/10 border border-teal-500/20 p-4 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex gap-3">
            <div className="p-2 bg-teal-500/20 rounded-xl text-teal-300 self-start">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Дашборд готов к автономной оффлайн-работе (PWA)</h3>
              <p className="text-xs text-slate-400 mt-0.5">Вся статистика сохраняется в IndexedDB на вашем устройстве и синхронизируется при возобновлении связи.</p>
            </div>
          </div>
          <button className="bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 px-4 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors">
            Установить как PWA
          </button>
        </div>

        {/* 1. ГЛАВНЫЙ ЭКРАН / ОБЗОР МЕТРИК И ВРЕМЕНИ */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* КАРТА-ВИДЖЕТ: ПАЛАВАН */}
          {(activeTab === 'global' || activeTab === 'palawan') && (
            <div className="relative overflow-hidden rounded-3xl bg-slate-900/40 border border-slate-800 p-6 shadow-xl backdrop-blur-md">
              <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 blur-3xl rounded-full"></div>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-teal-400">Ферма 1 • Филиппины</span>
                  <h2 className="text-2xl font-black text-slate-100 mt-1">Палаван</h2>
                  <p className="text-xs text-teal-200/60 mt-0.5">Морская IMTA Аквакультура</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-mono font-bold tracking-wider text-slate-100">{timePalawan || '--:--:--'}</p>
                  <p className="text-xs text-slate-400 font-mono">GMT+8 (UTC+8)</p>
                </div>
              </div>

              {/* МЕТРИКИ ПАЛАВАНА */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
                  <div className="flex justify-between items-center text-slate-400 mb-2">
                    <span className="text-xs">Вода Temp</span>
                    <Thermometer className="w-4 h-4 text-teal-400" />
                  </div>
                  <div className="text-lg font-bold font-mono text-teal-300">{telemetry.palawan.temp}°C</div>
                  <span className="text-[10px] text-emerald-400">Оптимально</span>
                </div>

                <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
                  <div className="flex justify-between items-center text-slate-400 mb-2">
                    <span className="text-xs">Кислород DO</span>
                    <Activity className="w-4 h-4 text-sky-400" />
                  </div>
                  <div className="text-lg font-bold font-mono text-slate-100">{telemetry.palawan.do} мг/л</div>
                  <span className="text-[10px] text-emerald-400">Стабильно</span>
                </div>

                <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
                  <div className="flex justify-between items-center text-slate-400 mb-2">
                    <span className="text-xs">Кислотность pH</span>
                    <Beaker className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div className="text-lg font-bold font-mono text-slate-100">{telemetry.palawan.pH}</div>
                  <span className="text-[10px] text-amber-400">Слабощелочная</span>
                </div>

                <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
                  <div className="flex justify-between items-center text-slate-400 mb-2">
                    <span className="text-xs">Соленость</span>
                    <Droplet className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="text-lg font-bold font-mono text-slate-100">{telemetry.palawan.salinity} ‰</div>
                  <span className="text-[10px] text-emerald-400">Норма океана</span>
                </div>
              </div>

              {/* БЕЗОПАСНОСТЬ ИИ */}
              <div className="mt-5 p-4 rounded-2xl bg-teal-950/20 border border-teal-500/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <span className="absolute inline-flex h-3 w-3 rounded-full bg-emerald-400 opacity-75 animate-ping"></span>
                    <Radio className="w-5 h-5 text-teal-400 relative" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-teal-300">ANTI-POACHING AI RADAR</h4>
                    <p className="text-[10px] text-slate-400">Буи и оптические камеры активны</p>
                  </div>
                </div>
                <span className="text-xs font-bold px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/30 font-mono">
                  {telemetry.palawan.status}
                </span>
              </div>
            </div>
          )}

          {/* КАРТА-ВИДЖЕТ: КОСТА-РИКА */}
          {(activeTab === 'global' || activeTab === 'costarica') && (
            <div className="relative overflow-hidden rounded-3xl bg-slate-900/40 border border-slate-800 p-6 shadow-xl backdrop-blur-md">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full"></div>
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
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
                  <div className="flex justify-between items-center text-slate-400 mb-2">
                    <span className="text-xs">Влажн. Почвы</span>
                    <Droplet className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-lg font-bold font-mono text-emerald-300">{telemetry.costarica.soilMoisture}%</div>
                  <span className="text-[10px] text-emerald-400">Влажная почва</span>
                </div>

                <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
                  <div className="flex justify-between items-center text-slate-400 mb-2">
                    <span className="text-xs">Темп. Воздуха</span>
                    <Thermometer className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-lg font-bold font-mono text-slate-100">{telemetry.costarica.airTemp}°C</div>
                  <span className="text-[10px] text-slate-400">Утренний бриз</span>
                </div>

                <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
                  <div className="flex justify-between items-center text-slate-400 mb-2">
                    <span className="text-xs">Осадки (24ч)</span>
                    <CloudRain className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div className="text-lg font-bold font-mono text-slate-100">{telemetry.costarica.rain} мм</div>
                  <span className="text-[10px] text-indigo-300">Умеренные</span>
                </div>

                <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
                  <div className="flex justify-between items-center text-slate-400 mb-2">
                    <span className="text-xs">Пасека Здоровье</span>
                    <Heart className="w-4 h-4 text-yellow-400" />
                  </div>
                  <div className="text-lg font-bold font-mono text-yellow-400">{telemetry.costarica.hivesHealth}%</div>
                  <span className="text-[10px] text-yellow-500 font-bold">Активный медосбор</span>
                </div>
              </div>

              {/* МЕТРИКА ЦВЕТЕНИЯ */}
              <div className="mt-5 p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Sun className="w-5 h-5 text-amber-400" />
                  <div>
                    <h4 className="text-xs font-bold text-emerald-300">ИНДЕКС ЦВЕТЕНИЯ (BLOOM INDEX)</h4>
                    <p className="text-[10px] text-slate-400">Кофе & Дикая Ваниль готовы к опылению</p>
                  </div>
                </div>
                <span className="text-xs font-bold px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full border border-amber-500/30 font-mono">
                  {telemetry.costarica.bloomIndex}%
                </span>
              </div>
            </div>
          )}
        </section>

        {/* 2. СПЕЦИАЛЬНЫЕ МОДУЛИ УЧЕТА ПО ЛОКАЦИЯМ */}
        {activeTab === 'palawan' && (
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* ТРЕКЕР ДЛИННЫХ ЛИНИЙ И КАРТЫ СЕТОК */}
            <div className="lg:col-span-2 bg-slate-900/30 border border-slate-800 p-6 rounded-3xl space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold flex items-center gap-2 text-teal-400">
                  <Layers className="w-5 h-5" /> Карта Длинных Линий (Longlines) & Садов
                </h3>
                <span className="text-xs bg-teal-500/10 text-teal-300 px-3 py-1 rounded-full border border-teal-500/20">3 Линии в море</span>
              </div>

              {/* ИНТЕРАКТИВНЫЙ МАКЕТ СЕТОК */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map(line => (
                  <div key={line} className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-bold text-sm">Линия Л-{line}</span>
                      <span className="text-[10px] text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">OK</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-slate-400">
                        <span>Нагрузка:</span> <span className="font-mono text-slate-200">12 сеток</span>
                      </div>
                      <div className="flex justify-between text-xs text-slate-400">
                        <span>Жемчужницы:</span> <span className="font-mono text-slate-200">480 шт</span>
                      </div>
                      <div className="flex justify-between text-xs text-slate-400">
                        <span>Текущий статус:</span> <span className="text-teal-400 text-xs">Стабильно</span>
                      </div>
                    </div>
                    {/* Визуальная заполненность линии */}
                    <div className="w-full bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden">
                      <div className="bg-gradient-to-r from-teal-500 to-sky-400 h-1.5" style={{ width: line === 1 ? '90%' : line === 2 ? '75%' : '60%' }}></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* RFID Сканнер сеток */}
              <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-4">
                <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <Rss className="w-4 h-4 text-teal-400" /> RFID-Сканирование Сеток в море
                </h4>
                <form onSubmit={handleRfidScan} className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Пример: RFID-PAL-001, RFID-PAL-002"
                    value={rfidSearch}
                    onChange={(e) => setRfidSearch(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 flex-1 font-mono"
                  />
                  <button type="submit" className="bg-teal-500 text-slate-950 px-4 py-2 rounded-xl text-sm font-bold hover:bg-teal-400 transition-colors">
                    Сканировать
                  </button>
                </form>

                {/* Результат сканирования */}
                {scannedItem && (
                  <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 text-xs space-y-2 animate-fadeIn">
                    {scannedItem.error ? (
                      <span className="text-rose-400">{scannedItem.error}</span>
                    ) : (
                      <>
                        <div className="flex justify-between border-b border-slate-800 pb-1">
                          <span className="text-slate-400 font-semibold">Объект:</span>
                          <span className="text-teal-300 font-bold">{scannedItem.type}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-800 pb-1">
                          <span className="text-slate-400">Возраст биомассы:</span>
                          <span className="text-slate-200 font-mono">{scannedItem.age}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-800 pb-1">
                          <span className="text-slate-400">Плотность посадки:</span>
                          <span className="text-slate-200 font-mono">{scannedItem.density}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Последняя чистка:</span>
                          <span className="text-slate-200 font-mono">{scannedItem.lastCleaned}</span>
                        </div>
                        <div className="flex justify-between pt-1">
                          <span className="text-slate-400">Статус сетки:</span>
                          <span className={`font-bold ${scannedItem.status.includes('Требуется') ? 'text-amber-400' : 'text-emerald-400'}`}>
                            {scannedItem.status}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* СПРАВА: ЧЕК-ЛИСТ ЧИСТКИ И РЕГИСТРАЦИЯ ПАДЕЖА */}
            <div className="bg-slate-900/30 border border-slate-800 p-6 rounded-3xl space-y-6">
              <div>
                <h3 className="text-lg font-bold text-teal-400">Морской Чек-лист</h3>
                <p className="text-xs text-slate-400 mt-1">Регулярное обслуживание линий IMTA</p>
              </div>

              {/* Чек-лист */}
              <div className="space-y-3">
                {cleaningChecklist.map(task => (
                  <label key={task.id} className="flex items-start gap-3 p-3 bg-slate-900/80 rounded-xl border border-slate-800 cursor-pointer hover:border-teal-500/40 transition-colors">
                    <input 
                      type="checkbox"
                      checked={task.done}
                      onChange={() => {
                        setCleaningChecklist(prev => prev.map(t => t.id === task.id ? { ...t, done: !t.done } : t));
                      }}
                      className="mt-0.5 rounded text-teal-500 focus:ring-teal-500 bg-slate-950 border-slate-800 w-4 h-4"
                    />
                    <span className={`text-xs ${task.done ? 'line-through text-slate-500' : 'text-slate-200'}`}>{task.label}</span>
                  </label>
                ))}
              </div>

              {/* РЕГИСТРАЦИЯ ПАДЕЖА (IndexedDB) */}
              <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 space-y-4">
                <h4 className="text-sm font-bold text-rose-400 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> Учет смертности/падежа биомассы
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <input 
                    type="number" 
                    placeholder="Кол-во (шт)"
                    value={newMortality.qty}
                    onChange={(e) => setNewMortality({ ...newMortality, qty: e.target.value })}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                  <select 
                    value={newMortality.cause}
                    onChange={(e) => setNewMortality({ ...newMortality, cause: e.target.value })}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-rose-500"
                  >
                    <option value="Естественный отбор">Естеств. отбор</option>
                    <option value="Хищники">Хищники</option>
                    <option value="Паразиты">Паразиты</option>
                    <option value="Механич. повреждение">Мех. повреждение</option>
                  </select>
                </div>
                <button 
                  onClick={() => {
                    if (!newMortality.qty) return;
                    setMortalityLog([{
                      date: new Date().toISOString().split('T')[0],
                      type: 'Жемчужницы (Pinctada)',
                      qty: parseInt(newMortality.qty),
                      cause: newMortality.cause
                    }, ...mortalityLog]);
                    setNewMortality({ qty: '', cause: 'Естественный отбор' });
                  }}
                  className="w-full bg-rose-600 hover:bg-rose-500 text-slate-100 font-bold text-xs py-2 rounded-lg transition-colors"
                >
                  Зарегистрировать падеж в БД
                </button>

                {/* Журнал смертности */}
                <div className="space-y-1 pt-2 max-h-[100px] overflow-y-auto">
                  {mortalityLog.map((log, idx) => (
                    <div key={idx} className="flex justify-between text-[10px] text-slate-400 border-b border-slate-800/60 pb-1">
                      <span>{log.date} — {log.qty} шт ({log.cause})</span>
                      <span className="text-rose-400">Зарегистрировано</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'costarica' && (
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* ТРЕКИНГ КОФЕ & КАКАО & ВАНИЛИ */}
            <div className="lg:col-span-2 bg-slate-900/30 border border-slate-800 p-6 rounded-3xl space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold flex items-center gap-2 text-emerald-400">
                  <Layers className="w-5 h-5" /> Учет лотов Кофе, Какао и Ванили
                </h3>
                <span className="text-xs bg-emerald-500/10 text-emerald-300 px-3 py-1 rounded-full border border-emerald-500/20">Сезон сбора урожая 2026</span>
              </div>

              {/* Кофе и Какао микро-партии */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {COFFEE_BATCHES.map(batch => (
                  <div key={batch.id} className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-sm text-amber-400 font-mono">{batch.id}</span>
                      <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">{batch.variety}</span>
                    </div>
                    <div className="space-y-1.5 text-xs text-slate-300">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Стадия процесса:</span>
                        <span className="font-semibold text-emerald-400">{batch.stage}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Влажность зерна:</span>
                        <span className="font-mono">{batch.moisture}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Сахар BRIX:</span>
                        <span className="font-mono text-amber-300">{batch.brix}</span>
                      </div>
                      {batch.hoursLeft && (
                        <div className="flex justify-between">
                          <span className="text-slate-400">Осталось времени:</span>
                          <span className="font-mono text-cyan-400 animate-pulse">{batch.hoursLeft} часов</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Ручное опыление ванили */}
              <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-4">
                <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <Sun className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} /> Ручное Опыление Дикой Ванили (Vanilla planifolia)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {vanillaPollinations.map(sec => (
                    <div key={sec.id} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs space-y-2">
                      <div className="flex justify-between font-bold">
                        <span>Сектор: {sec.id}</span>
                        <span className="text-emerald-400">{sec.count} лиан</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Сегодня опылено вручную:</span>
                        <span className="text-amber-400 font-bold font-mono">{sec.pollinatedToday} цветков</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Стадия созревания стручков:</span>
                        <span className="text-slate-300">{sec.matureStatus}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Быстрое внесение опыления */}
                <div className="flex gap-2">
                  <input 
                    type="number" 
                    placeholder="Внести опыленные сегодня цветки (+ шт)"
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

            {/* СПРАВА: ПАСЕКА И КАРТА ПЛАНТАЦИИ */}
            <div className="bg-slate-900/30 border border-slate-800 p-6 rounded-3xl space-y-6">
              <div>
                <h3 className="text-lg font-bold text-yellow-400 flex items-center gap-2">
                  🐝 Контроль Пасеки (Апикультура)
                </h3>
                <p className="text-xs text-slate-400 mt-1">Мониторинг ульев в тропических садах</p>
              </div>

              {/* Здоровье ульев */}
              <div className="space-y-3">
                <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-semibold text-slate-300">Пчелиная Семья У-12 (Golden Italian)</span>
                    <span className="text-xs text-rose-400 font-bold">Осмотр!</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2">
                    <div className="bg-rose-500 h-1.5 rounded-full" style={{ width: '64%' }}></div>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1.5">Снижена звуковая активность до 68Гц. Возможно деление роя.</p>
                </div>

                <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-semibold text-slate-300">Пчелиная Семья У-15 (Carnica Mix)</span>
                    <span className="text-xs text-emerald-400 font-bold">Здорова</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2">
                    <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '96%' }}></div>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1.5">Отличная летная работа, сбор нектара дикой ванили и кофе.</p>
                </div>
              </div>

              {/* ИНТЕРАКТИВНЫЙ ВЫБОР СЕКТОРА ПЛАНТАЦИИ */}
              <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">Карта Участков</h4>
                <div className="grid grid-cols-2 gap-2">
                  {['Кофе Восток', 'Кофе Запад', 'Какао Низина', 'Сад Ванили'].map(sec => (
                    <button 
                      key={sec}
                      onClick={() => setSelectedSector(sec)}
                      className={`text-xs p-2.5 rounded-xl border font-semibold transition-all duration-300 ${selectedSector === sec ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md font-bold' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'}`}
                    >
                      {sec}
                    </button>
                  ))}
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 text-center text-xs">
                  Активный сектор: <strong className="text-emerald-400 font-bold">{selectedSector}</strong>
                  <div className="text-[10px] text-slate-500 mt-1">Опрыскивание микробиологическими ЭМ-препаратами завершено</div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 3. МОДУЛЬ ИИ-СОРТИРОВКИ И КОНТРОЛЯ КАЧЕСТВА */}
        <section className="bg-slate-900/30 border border-slate-800 rounded-3xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-lg font-bold flex items-center gap-2 text-slate-100">
                <Cpu className="text-amber-400 w-5 h-5 animate-pulse" /> Модуль ИИ-Сортировки и Экспертизы Качества
              </h3>
              <p className="text-xs text-slate-400 mt-1">Локальный запуск компьютерного зрения WebNN / WASM (без отправки фото на сервер)</p>
            </div>

            {/* Выбор типа сортировки */}
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button 
                onClick={() => setAiSortingType('pearl')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${aiSortingType === 'pearl' ? 'bg-teal-500 text-slate-950' : 'text-slate-400'}`}
              >
                Жемчуг Pinctada (Палаван)
              </button>
              <button 
                onClick={() => setAiSortingType('coffee')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${aiSortingType === 'coffee' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'}`}
              >
                Ягоды Кофе (Коста-Рика)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Окно загрузки/камеры */}
            <div className="bg-slate-950 border border-dashed border-slate-800 rounded-2xl p-8 flex flex-col items-center justify-center text-center space-y-4 hover:border-teal-500/50 transition-all cursor-pointer">
              <div className="p-4 bg-slate-900 rounded-full border border-slate-800">
                <Camera className="w-8 h-8 text-slate-400" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-300">Загрузите снимок или включите камеру</h4>
                <p className="text-xs text-slate-500 mt-1">AI автоматически классифицирует жемчуг по классам или выявит дефекты ягод кофе</p>
              </div>
              <div className="flex gap-2">
                <button className="bg-slate-900 hover:bg-slate-800 text-xs font-bold text-slate-300 px-4 py-2 rounded-xl border border-slate-800 transition-colors">
                  Выбрать файл
                </button>
                <button 
                  onClick={handleAiAnalysis}
                  disabled={aiAnalyzing}
                  className="bg-gradient-to-tr from-amber-500 to-yellow-400 hover:brightness-110 text-slate-950 text-xs font-bold px-4 py-2 rounded-xl shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
                >
                  {aiAnalyzing ? 'Нейросеть думает...' : 'Запустить ИИ-тест'}
                </button>
              </div>
            </div>

            {/* Результат классификации */}
            <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Результат AI-Калибровки</h4>
                
                {aiAnalyzing && (
                  <div className="space-y-4 py-4">
                    <div className="flex items-center gap-3 text-sm text-slate-300">
                      <RefreshCw className="w-4 h-4 text-amber-400 animate-spin" />
                      <span>Локальный анализ сверточной сетью (MobileNet-V3)...</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div className="bg-gradient-to-r from-amber-500 to-yellow-400 h-2 rounded-full animate-pulse" style={{ width: '80%' }}></div>
                    </div>
                  </div>
                )}

                {!aiAnalyzing && aiResult && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-full font-bold">
                        {aiResult.grade}
                      </span>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed">{aiResult.desc}</p>
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                      <strong className="text-slate-400">Технологическое назначение:</strong> 
                      <p className="text-emerald-400 font-bold mt-1">{aiResult.shellUse || aiResult.action}</p>
                    </div>
                  </div>
                )}

                {!aiAnalyzing && !aiResult && (
                  <div className="text-slate-500 text-xs text-center py-10">
                    Ожидание загрузки изображения. Запустите ИИ-тест для получения моментального вердикта.
                  </div>
                )}
              </div>

              <div className="text-[10px] text-slate-500 mt-4 border-t border-slate-800/60 pt-4">
                Используется offline WebAssembly TensorFlow.js. База данных жемчуга Pinctada и арабики обучена на 50,000+ макро-снимках.
              </div>
            </div>
          </div>
        </section>

        {/* 4. БЕЗОПАСНОСТЬ, АЛЕРТЫ И ИНТЕРНЕТ ВЕЩЕЙ (IoT-ЛОГ) */}
        <section className="bg-slate-900/30 border border-slate-800 rounded-3xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Shield className="text-rose-400 w-5 h-5" /> Единая Панель Безопасности & IoT-датчиков (События в Реальном Времени)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Консоль логирования событий охраны Палавана и автополива/климата Коста-Рики</p>
            </div>

            {/* Форма симуляции ручного оповещения */}
            <form onSubmit={handleAddAlert} className="flex gap-2 w-full sm:w-auto">
              <input 
                type="text" 
                placeholder="Ввести тестовое событие..."
                value={newAlertMessage}
                onChange={(e) => setNewAlertMessage(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-rose-500 flex-1 sm:w-64 font-mono"
              />
              <button type="submit" className="bg-rose-600 hover:bg-rose-500 text-slate-100 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors">
                Вызвать Алерт
              </button>
            </form>
          </div>

          {/* Журнал IoT-событий */}
          <div className="bg-slate-950 rounded-2xl border border-slate-850 overflow-hidden">
            <div className="grid grid-cols-12 bg-slate-900 px-4 py-3 text-xs font-bold text-slate-400 border-b border-slate-800">
              <div className="col-span-2">Время</div>
              <div className="col-span-3">Локация / Датчик</div>
              <div className="col-span-5">Зафиксированное событие</div>
              <div className="col-span-2 text-right">Статус угрозы</div>
            </div>

            <div className="divide-y divide-slate-900/80 max-h-[300px] overflow-y-auto">
              {securityLog.map((log) => (
                <div key={log.id} className="grid grid-cols-12 px-4 py-3.5 text-xs text-slate-300 hover:bg-slate-900/40 items-center transition-colors">
                  <div className="col-span-2 font-mono text-slate-500">{log.time}</div>
                  <div className="col-span-3 font-semibold flex items-center gap-1.5">
                    <span className={`h-1.5 w-1.5 rounded-full ${log.location.includes('Палаван') ? 'bg-teal-400' : 'bg-emerald-400'}`}></span>
                    {log.location}
                  </div>
                  <div className="col-span-5 text-slate-400 font-mono">{log.event}</div>
                  <div className="col-span-2 text-right">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
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
        </section>

      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-900 mt-12 py-8 text-center text-xs text-slate-500 bg-slate-950">
        <p>© 2026 Eco-Synapse Systems. Разработано для оффлайн-нод Филиппины-Палаван & Коста-Рика.</p>
        <p className="mt-1 font-mono text-[10px] text-teal-500">Node ID: NODE-SECURE-ALPHA-01</p>
      </footer>

    </div>
  );
}
