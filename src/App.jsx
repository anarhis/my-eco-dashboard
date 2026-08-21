import React, { useState, useEffect } from 'react';
import { 
  Activity, Anchor, Award, Beaker, CloudRain, Compass, Database, Droplet, 
  Eye, Feather, HardDrive, Heart, Home, Layers, MapPin, Navigation, 
  Radio, RefreshCw, Rss, Shield, ShieldAlert, Sun, Thermometer, Trash2, 
  Wind, Zap, CheckSquare, Plus, AlertTriangle, Cpu, Camera, Filter, HardHat,
  Volume2, Wifi, Power, RefreshCw as Loop, Check, Download, AlertOctagon, EyeOff
} from 'lucide-react';

// === МОКОВЫЕ ДАННЫЕ ДЛЯ СТАРТА ===
const INITIAL_SECURITY_LOG = [
  { id: 1, time: '17:42:10', location: 'Буй №4 (Палаван)', event: 'AI-радар обнаружил неопознанное плавсредство на дистанции 800м. Оповещение отправлено.', severity: 'high', farm: 'palawan' },
  { id: 2, time: '16:05:45', location: 'Сектор А3 (Коста-Рика)', event: 'Автоматический полив включен. Температура почвы >28°C. Расход: 450л.', severity: 'info', farm: 'costarica' },
  { id: 3, time: '15:44:12', location: 'Буй №2 (Палаван)', event: 'AI-анализ звука: зафиксированы шумы винтов туристического катера. Безопасная зона.', severity: 'info', farm: 'palawan' },
  { id: 4, time: '14:15:30', location: 'Улей №12 (Коста-Рика)', event: 'Внимание! Резкое падение звуковой активности (активность семьи <70%). Рекомендуется осмотр.', severity: 'warning', farm: 'costarica' },
];

const INITIAL_RFID_REGISTRY = {
  'RFID-PAL-001': { type: 'Сетка жемчужниц', age: '18 месяцев', lastCleaned: '2026-08-10', density: '45 шт/сетка', species: 'Pinctada maxima', status: 'Норма' },
  'RFID-PAL-002': { type: 'Сетка жемчужниц', age: '24 месяца', lastCleaned: '2026-08-05', density: '40 шт/сетка', species: 'Pinctada maxima', status: 'Норма' },
  'RFID-PAL-003': { type: 'Садок с лангустами', age: '8 месяцев', lastCleaned: '2026-08-15', density: '15 шт/садок', species: 'Panulirus ornatus', status: 'Норма' },
};

export default function App() {
  const [activeTab, setActiveTab] = useState('global'); // 'global' | 'palawan' | 'costarica'
  const [timePalawan, setTimePalawan] = useState('');
  const [timeCostaRica, setTimeCostaRica] = useState('');
  
  // === СОСТОЯНИЯ ФИЛИППИНЫ (ПАЛАВАН) ===
  const [palawanStatus, setPalawanStatus] = useState('SECURE'); // 'SECURE' | 'ALERT' | 'TYPHOON'
  const [palawanTelemetry, setPalawanTelemetry] = useState({
    temp: 28.4, pH: 8.15, do: 6.75, salinity: 34.2, turbidity: 4.1
  });
  const [longlines, setLonglines] = useState([
    { id: 1, label: 'Линия Л-1', load: 12, qty: 480, status: 'OK', depth: 2.5, lastCleaned: '2026-08-12' },
    { id: 2, label: 'Линия Л-2', load: 10, qty: 400, status: 'OK', depth: 2.5, lastCleaned: '2026-08-08' },
    { id: 3, label: 'Линия Л-3', load: 14, qty: 560, status: 'DIRTY', depth: 2.5, lastCleaned: '2026-07-20' }, // Просрочена чистка
    { id: 4, label: 'Линия Л-4', load: 8,  qty: 320, status: 'OK', depth: 2.5, lastCleaned: '2026-08-14' }
  ]);
  const [rfidSearch, setRfidSearch] = useState('');
  const [scannedItem, setScannedItem] = useState(null);
  const [mortalityLog, setMortalityLog] = useState([
    { date: '2026-08-19', type: 'Жемчужницы (Pinctada)', qty: 2, cause: 'Естественный отбор' }
  ]);
  const [newMortality, setNewMortality] = useState({ qty: '', cause: 'Естественный отбор' });
  const [cleaningChecklist, setCleaningChecklist] = useState([
    { id: 1, label: 'Чистка сетки RFID-PAL-002', done: false },
    { id: 2, label: 'Осмотр крепежей длинной линии Л-3', done: false },
    { id: 3, label: 'Замер уровня планктона в секторе Юг', done: true }
  ]);

  // Симуляции камер Палавана
  const [palCamMode, setPalCamMode] = useState('NORMAL'); // 'NORMAL' | 'IR' | 'DETECTION'
  const [palPoacherSimulation, setPalPoacherSimulation] = useState(false);
  const [palAiGradingType, setPalAiGradingType] = useState('pearl'); // 'pearl' | 'shell'
  const [palAiAnalyzing, setPalAiAnalyzing] = useState(false);
  const [palAiResult, setPalAiResult] = useState(null);

  // === СОСТОЯНИЯ КОСТА-РИКА ===
  const [crStatus, setCrStatus] = useState('SECURE'); // 'SECURE' | 'FIRE_RISK' | 'INTRUSION'
  const [crTelemetry, setCrTelemetry] = useState({
    soilMoisture: 68.2, airTemp: 23.4, rain: 12.0, airHumidity: 78.5, soilPh: 6.2
  });
  const [isIrrigationActive, setIsIrrigationActive] = useState(false);
  const [isAiWateringMode, setIsAiWateringMode] = useState(true);
  const [coffeeBrixInput, setCoffeeBrixInput] = useState('');
  const [coffeeBrixLogs, setCoffeeBrixLogs] = useState([
    { id: 1, batch: 'CR-GEO-09', brix: '23.4%', stage: 'Спелое зерно', time: '15:30' },
    { id: 2, batch: 'CR-SL28-02', brix: '21.1%', stage: 'Полуспелое', time: '11:15' }
  ]);
  const [coffeeBatches, setCoffeeBatches] = useState([
    { id: 'CR-GEO-09', variety: 'Geisha', stage: 'Ферментация (Анаэробная)', hoursLeft: 14, brix: '23.4%', moisture: '42%', temp: '21.5°C', sealed: true },
    { id: 'CR-SL28-02', variety: 'SL-28', stage: 'Сушка на африканских кроватях', moisture: '14.8%', daysRemaining: 3, brix: '21.1%', temp: '24.2°C', sealed: false }
  ]);
  const [vanillaPollinations, setVanillaPollinations] = useState([
    { id: 'Сектор Ванили A', count: 142, pollinatedToday: 18, matureStatus: '85% зеленые стручки' },
    { id: 'Сектор Ванили B', count: 95, pollinatedToday: 12, matureStatus: '40% созревание' }
  ]);
  const [newPollinationCount, setNewPollinationCount] = useState('');
  const [selectedVanillaSector, setSelectedVanillaSector] = useState('Сектор Ванили A');
  const [crAiAnalyzing, setCrAiAnalyzing] = useState(false);
  const [crAiResult, setCrAiResult] = useState(null);

  // Ульи
  const [hives, setHives] = useState([
    { id: 'Улей №12', variety: 'Golden Italian', freq: 180, health: 'Норма', weight: '42кг', activity: 'Высокая' },
    { id: 'Улей №15', variety: 'Carnica Mix', freq: 245, health: 'Роение (Осмотр!)', weight: '51кг', activity: 'Аномальный гул' }
  ]);
  const [selectedHive, setSelectedHive] = useState('Улей №12');
  const [isCentrifugeActive, setIsCentrifugeActive] = useState(false);
  const [honeyHarvested, setHoneyHarvested] = useState(128); // в кг

  // Безопасность Коста-Рики
  const [crPerimeterArmed, setCrPerimeterArmed] = useState(true);
  const [crAnimalSimulation, setCrAnimalSimulation] = useState(false);

  // Глобальные IoT логи и PUSH-уведомления
  const [securityLog, setSecurityLog] = useState(INITIAL_SECURITY_LOG);
  const [pushNotification, setPushNotification] = useState(null);

  // === СЕРВИСНЫЕ ИНТЕРВАЛЫ ЧАСОВ И ДАТЧИКОВ ===
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

  useEffect(() => {
    const telemetryInterval = setInterval(() => {
      // Дрейф датчиков Палаван
      setPalawanTelemetry(prev => {
        const drift = (Math.random() - 0.5) * 0.1;
        return {
          ...prev,
          temp: parseFloat((prev.temp + drift).toFixed(2)),
          pH: parseFloat((prev.pH + (Math.random() - 0.5) * 0.02).toFixed(2)),
          do: parseFloat((prev.do + (Math.random() - 0.5) * 0.05).toFixed(2)),
          salinity: palawanStatus === 'TYPHOON' ? 24.5 : parseFloat((prev.salinity + (Math.random() - 0.5) * 0.05).toFixed(2)),
          turbidity: palawanStatus === 'TYPHOON' ? 12.8 : parseFloat((prev.turbidity + (Math.random() - 0.5) * 0.1).toFixed(2))
        };
      });

      // Дрейф датчиков Коста-Рика
      setCrTelemetry(prev => {
        const soilMoistureDrift = isIrrigationActive ? 0.8 : -0.2;
        return {
          ...prev,
          soilMoisture: parseFloat(Math.min(100, Math.max(10, prev.soilMoisture + soilMoistureDrift)).toFixed(1)),
          airTemp: parseFloat((prev.airTemp + (Math.random() - 0.5) * 0.15).toFixed(1)),
          airHumidity: parseFloat(Math.min(100, Math.max(20, prev.airHumidity + (Math.random() - 0.5) * 0.5)).toFixed(1)),
          rain: prev.rain,
          soilPh: parseFloat((prev.soilPh + (Math.random() - 0.5) * 0.01).toFixed(2))
        };
      });
    }, 4000);
    return () => clearInterval(telemetryInterval);
  }, [palawanStatus, isIrrigationActive]);

  // === ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ===
  const triggerPush = (title, body, type = 'info') => {
    setPushNotification({ title, body, type });
    setTimeout(() => setPushNotification(null), 6000);
  };

  const addLog = (location, event, severity, farm) => {
    const newLog = {
      id: Date.now(),
      time: new Date().toLocaleTimeString('ru-RU'),
      location,
      event,
      severity,
      farm
    };
    setSecurityLog(prev => [newLog, ...prev]);
  };

  // === ПАЛАВАН КНОПКИ УПРАВЛЕНИЯ ===
  const handleTyphoonSimulation = () => {
    setPalawanStatus('TYPHOON');
    setPalawanTelemetry(prev => ({ ...prev, salinity: 24.5, turbidity: 12.8 }));
    triggerPush('🚨 ТАЙФУН: КРИТИЧЕСКИЙ ШТОРМ', 'Соленость лагуны упала до 24.5 ‰. Риск осмотического шока устриц!', 'error');
    addLog('Буй №3 (Палаван)', 'Зафиксировано критическое опреснение воды после тайфуна (24.5 ‰). Риск замора!', 'high', 'palawan');
  };

  const handleSinkLines = () => {
    setLonglines(prev => prev.map(line => ({ ...line, depth: 8.0, status: 'DEEP' })));
    triggerPush('⚓ ПОГРУЖЕНИЕ ЛИНИЙ', 'Все длинные линии опущены на безопасную глубину 8 метров.', 'info');
    addLog('Консоль управления', 'Поступила команда оператора: Заглубить все линии на 8м для защиты от тайфуна.', 'info', 'palawan');
    if (palawanStatus === 'TYPHOON') {
      setPalawanStatus('SECURE');
      triggerPush('✅ УГРОЗА СНЯТА', 'Устрицы опущены ниже опресненного слоя. Стабилизация состояния.', 'success');
      addLog('ИИ-Анализатор', 'Биомасса в безопасности на глубине 8м. Угроза осмотического шока нейтрализована.', 'info', 'palawan');
    }
  };

  const handleLiftLinesForCleaning = () => {
    setLonglines(prev => prev.map(line => ({ ...line, depth: 0.5, status: 'MAINTENANCE' })));
    triggerPush('🧼 ПОДЪЕМ ДЛЯ ОБМЫВА', 'Линии подняты на глубину 0.5м для очистки устриц от обрастаний.', 'warning');
    addLog('Консоль управления', 'Линии подняты в верхний технический слой (0.5м) для инспекции и обмыва.', 'info', 'palawan');
  };

  const handleResetPalawanClimate = () => {
    setPalawanStatus('SECURE');
    setPalawanTelemetry({ temp: 28.4, pH: 8.15, do: 6.75, salinity: 34.2, turbidity: 4.1 });
    setLonglines(prev => prev.map(line => ({ ...line, depth: 2.5, status: 'OK' })));
    triggerPush('🔄 СБРОС КЛИМАТА ПАЛАВАНА', 'Параметры экосистемы лагуны возвращены к стандартной норме.', 'info');
    addLog('Консоль управления', 'Произведен полный сброс параметров лагуны к референсным значениям.', 'info', 'palawan');
  };

  const handlePoachingSimulation = () => {
    setPalPoacherSimulation(true);
    setPalCamMode('DETECTION');
    triggerPush('🚨 ИИ-РАДАР: ОБНАРУЖЕНО ВТОРЖЕНИЕ', 'Замечена неопознанная лодка браконьеров! Включены сирены и прожекторы вышки.', 'error');
    addLog('ИК-Камера Вышка', 'YOLOv8: Обнаружена браконьерская бангка (97.4% уверенности). Сектор Юго-Запад.', 'high', 'palawan');
  };

  const handleRfidScan = (e) => {
    e.preventDefault();
    const trimmed = rfidSearch.trim().toUpperCase();
    if (INITIAL_RFID_REGISTRY[trimmed]) {
      setScannedItem({ id: trimmed, ...INITIAL_RFID_REGISTRY[trimmed] });
      triggerPush('🏷️ RFID СКАН', `Считана метка ${trimmed}. Данные подгружены из IndexedDB.`, 'success');
    } else {
      setScannedItem({ error: 'Метка не найдена в базе данных IndexedDB' });
      triggerPush('⚠️ ОШИБКА RFID', 'Метка отсутствует в локальном реестре.', 'warning');
    }
  };

  const handlePalAiAnalysis = () => {
    setPalAiAnalyzing(true);
    setPalAiResult(null);
    setTimeout(() => {
      setPalAiAnalyzing(false);
      if (palAiGradingType === 'pearl') {
        setPalAiResult({
          grade: 'AAA Golden Pearl',
          desc: 'Сверхплотный слой перламутра. Идеальная сферичность. Цвет: Deep South Sea Gold (98.2%). Рекомендовано для элитных колье бренда.',
          metrics: { size: '13.4 мм', shape: 'Сфера 99.1%', luster: 'Зеркальный AAA', surface: 'Чистая 98.9%' },
          dest: 'Ювелирный бренд (Премиум)'
        });
        triggerPush('✨ ИИ-ГРЕЙДИНГ', 'Анализ завершен: Обнаружен жемчуг высшей ювелирной пробы AAA!', 'success');
      } else {
        setPalAiResult({
          grade: 'Mother-of-Pearl Monolith',
          desc: 'Раковина Pinctada maxima крупного калибра (>22 см). Отличная целостность структуры. Подходит для монолитных перламутровых сетов бренда.',
          metrics: { size: '22.8 см', integrity: 'Высокая (без сколов)', pattern: 'Радужный перламутр' },
          dest: 'Цех элитной посуды и икорных сетов'
        });
        triggerPush('🐚 ИИ-ГРЕЙДИНГ', 'Раковина классифицирована как Премиум-Монолит для посудной линии.', 'success');
      }
    }, 1800);
  };

  // === КОСТА-РИКА КНОПКИ УПРАВЛЕНИЯ ===
  const handleToggleIrrigation = () => {
    setIsIrrigationActive(prev => {
      const next = !prev;
      if (next) {
        triggerPush('💧 ПОЛИВ ВКЛЮЧЕН', 'Принудительный капельный полив запущен на всех секциях.', 'success');
        addLog('Контроллер полива', 'Запущен ручной режим капельного орошения плантаций кофе.', 'info', 'costarica');
      } else {
        triggerPush('💨 ПОЛИВ ВЫКЛЮЧЕН', 'Капельный полив успешно деактивирован.', 'info');
        addLog('Контроллер полива', 'Капельное орошение плантаций отключено оператором.', 'info', 'costarica');
      }
      return next;
    });
  };

  const handleAddBrixLog = (e) => {
    e.preventDefault();
    if (!coffeeBrixInput) return;
    const val = parseFloat(coffeeBrixInput);
    if (isNaN(val)) return;
    const newLog = {
      id: Date.now(),
      batch: 'CR-GEO-09',
      brix: `${val}%`,
      stage: val >= 22 ? 'Превосходная спелость (Сбор!)' : 'Дозревание (Второй проход)',
      time: new Date().toLocaleTimeString('ru-RU').substring(0, 5)
    };
    setCoffeeBrixLogs(prev => [newLog, ...prev]);
    triggerPush('📊 BRIX ЗАФИКСИРОВАН', `Внесено значение сахара: ${val}% BRIX.`, 'info');
    addLog('Плантация Кофе', `Вручную внесен показатель BRIX для лота CR-GEO-09: ${val}%.`, 'info', 'costarica');
    setCoffeeBrixInput('');
  };

  const handleSealFermentation = (batchId) => {
    setCoffeeBatches(prev => prev.map(b => b.id === batchId ? { ...b, sealed: !b.sealed, stage: b.sealed ? 'Сушка на кроватях' : 'Герметично (CO2 Ферментация)' } : b));
    const batch = coffeeBatches.find(b => b.id === batchId);
    if (!batch.sealed) {
      triggerPush('🔒 АНАЭРОБНАЯ ФЕРМЕНТАЦИЯ', `Бак ${batchId} полностью герметизирован. Начался ИИ-контроль выделения CO2.`, 'success');
      addLog('Анаэробный цех', `Бак лота ${batchId} изолирован. Датчики давления и температуры активированы.`, 'info', 'costarica');
    } else {
      triggerPush('🔓 РАЗГЕРМЕТИЗАЦИЯ', `Бак ${batchId} открыт. Лот передан в сушильный цех.`, 'warning');
      addLog('Анаэробный цех', `Процесс анаэробной ферментации бака ${batchId} завершен оператором.`, 'info', 'costarica');
    }
  };

  const handleAddVanillaPollination = () => {
    if (!newPollinationCount) return;
    const qty = parseInt(newPollinationCount);
    if (isNaN(qty)) return;
    setVanillaPollinations(prev => prev.map(sec => sec.id === selectedVanillaSector ? {
      ...sec,
      count: sec.count + qty,
      pollinatedToday: sec.pollinatedToday + qty
    } : sec));
    triggerPush('🌸 ОПЫЛЕНИЕ ЗАПИСАНО', `Успешно внесено +${qty} опыленных цветков ванили в ${selectedVanillaSector}.`, 'success');
    addLog('Сады Ванили', `В локальную базу занесено ручное опыление +${qty} цветков ванили в ${selectedVanillaSector}.`, 'info', 'costarica');
    setNewPollinationCount('');
  };

  const handleCrAiAnalysis = () => {
    setCrAiAnalyzing(true);
    setCrAiResult(null);
    setTimeout(() => {
      setCrAiAnalyzing(false);
      setCrAiResult({
        grade: 'Vanilla Grade A (Premium)',
        desc: 'Длина стручка составляет 17.8 см (норма Grade A > 15см). Мясистая структура без трещин и сколов. Рекомендован под собственный бренд специй.',
        metrics: { length: '17.8 см', moisture: '32%', color: 'Темно-шоколадный', quality: 'Элитное (Grade A)' }
      });
      triggerPush('🌱 ИИ-ГРЕЙДИНГ ВАНИЛИ', 'Стручок классифицирован как Grade A Premium!', 'success');
    }, 1800);
  };

  const handleAcousticDiagnostic = () => {
    triggerPush('🎤 АКУСТИЧЕСКИЙ АНАЛИЗ', 'ИИ-микрофоны внутри ульев начали сканирование звукового спектра...', 'info');
    setTimeout(() => {
      setHives(prev => prev.map(h => h.id === 'Улей №15' ? { ...h, freq: 175, health: 'Нормализован', activity: 'Стабильный гул' } : h));
      triggerPush('🐝 АНАЛИЗ ЗАВЕРШЕН', 'Специфический гул роения купирован. Матка улья №15 успокоилась.', 'success');
      addLog('Пасека Апикультура', 'ИИ-анализ частоты ульев: частота У-15 упала с 245Гц до безопасных 175Гц.', 'info', 'costarica');
    }, 2000);
  };

  const handleHoneyCentrifuge = () => {
    setIsCentrifugeActive(true);
    triggerPush('🍯 ВЫКАЧКА МЕДА', 'Автоматизированная медогонка запущена. Сбор дикого меда с ульев...', 'warning');
    setTimeout(() => {
      setIsCentrifugeActive(false);
      setHoneyHarvested(prev => prev + 24);
      triggerPush('✅ ВЫКАЧКА ЗАВЕРШЕНА', 'Собрано +24 кг чистейшего меда! Вес ульев обнулен.', 'success');
      addLog('Медовый цех', 'Произведена плановая выкачка меда. Собрано 24 кг дикого ванильно-кофейного меда.', 'info', 'costarica');
    }, 3000);
  };

  const handleAnimalSimulation = () => {
    setCrAnimalSimulation(true);
    triggerPush('🦌 ДЕТЕКЦИЯ ПЕРИМЕТРА', 'Обнаружено движение на границе леса! Камеры ночного видения зафиксировали объект.', 'warning');
    addLog('ИК-Камера Лес', 'YOLOv8: Обнаружен Тапир (94% уверенности). Движение в сторону буферной зоны.', 'info', 'costarica');
  };

  // === ОБЩИЙ ДИНАМИЧЕСКИЙ ФОН ПРИЛОЖЕНИЯ ===
  const getDynamicBg = () => {
    const overlays = "linear-gradient(to bottom, rgba(2, 6, 23, 0.90), rgba(2, 6, 23, 0.98))";
    let imgUrl = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=80"; // Космическая High-Tech сетка
    if (activeTab === 'palawan') {
      imgUrl = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80"; // Палаван лагуна
    } else if (activeTab === 'costarica') {
      imgUrl = "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=1600&q=80"; // Коста-Рика джунгли
    }
    return {
      backgroundImage: `${overlays}, url('${imgUrl}')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed'
    };
  };

  // Стили брендинга в зависимости от вкладки
  const brandColor = activeTab === 'palawan' ? 'cyan' : activeTab === 'costarica' ? 'emerald' : 'teal';
  const brandBorderClass = activeTab === 'palawan' ? 'border-cyan-500/20' : activeTab === 'costarica' ? 'border-emerald-500/20' : 'border-teal-500/20';

  return (
    <div style={getDynamicBg()} className="min-h-screen text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-900 transition-all duration-700 ease-in-out">
      
      {/* ПЛАВАЮЩЕЕ PUSH-УВЕДОМЛЕНИЕ */}
      {pushNotification && (
        <div className="fixed top-20 right-4 z-50 max-w-sm bg-slate-900/95 border-2 border-slate-800 rounded-2xl p-4 shadow-2xl animate-slideIn backdrop-blur-xl">
          <div className="flex gap-3">
            <div className={`p-2 rounded-xl text-slate-950 ${
              pushNotification.type === 'error' ? 'bg-rose-500' :
              pushNotification.type === 'success' ? 'bg-emerald-500' :
              pushNotification.type === 'warning' ? 'bg-amber-500' : 'bg-cyan-500'
            }`}>
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-100">{pushNotification.title}</h4>
              <p className="text-xs text-slate-400 mt-1">{pushNotification.body}</p>
            </div>
          </div>
        </div>
      )}

      {/* HEADER / ТАКТИЧЕСКИЙ БАР */}
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-4 py-3 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl text-slate-950 shadow-lg transition-colors duration-500 ${
            activeTab === 'palawan' ? 'bg-cyan-500 shadow-cyan-500/20' :
            activeTab === 'costarica' ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-teal-500 shadow-teal-500/20'
          }`}>
            <Cpu className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight bg-gradient-to-r from-teal-400 via-emerald-400 to-amber-300 bg-clip-text text-transparent">
              ECO-SYNAPSE SYSTEM
            </h1>
            <p className="text-xs text-slate-400 font-mono">Autonomous Bi-Farm Controller [v1.5.0-PWA]</p>
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
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all duration-300 ${activeTab === 'palawan' ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(34,211,238,0.4)]' : 'text-slate-400 hover:text-cyan-400'}`}
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

        {/* ======================================================= */}
        {/* === ВАРХЕЙД: ГЛОБАЛЬНЫЙ ОБЗОР (ТОЛЬКО СУММАРНЫЕ КАРТЫ) === */}
        {/* ======================================================= */}
        {activeTab === 'global' && (
          <section className="space-y-8 animate-fadeIn">
            <div className="bg-gradient-to-r from-teal-500/10 via-emerald-500/10 to-amber-500/10 border border-teal-500/20 p-4 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex gap-3">
                <div className="p-2 bg-teal-500/20 rounded-xl text-teal-300 self-start">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Глобальная диспетчерская служба</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Вся аналитика синхронизируется на локальном шлюзе IndexedDB. При потере интернета система функционирует автономно.</p>
                </div>
              </div>
              <button className="bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 px-4 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors">
                Установить как PWA на Смартфон
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Суммарный виджет: Филиппины */}
              <div className="relative overflow-hidden rounded-3xl bg-slate-900/40 border border-slate-800 p-6 shadow-xl backdrop-blur-md">
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-3xl rounded-full"></div>
                
                <div className="h-40 rounded-2xl mb-6 overflow-hidden relative border border-cyan-500/20">
                  <img 
                    src="https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80" 
                    alt="Palawan Lagoon" 
                    className="w-full h-full object-cover brightness-[0.75]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 to-transparent"></div>
                  <span className="absolute bottom-3 left-3 bg-cyan-950/80 text-cyan-300 border border-cyan-500/30 px-3 py-1 rounded-xl text-[10px] font-bold tracking-wider uppercase">
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
                    <p className="text-xs text-slate-400 font-mono">GMT+8</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase block">Вода Temp / Соленость</span>
                    <span className="text-lg font-bold font-mono text-cyan-400">{palawanTelemetry.temp}°C / {palawanTelemetry.salinity}‰</span>
                  </div>
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase block">Статус охраны AI</span>
                    <span className="text-lg font-bold font-mono text-emerald-400">АКТИВЕН (SECURE)</span>
                  </div>
                </div>
                <button onClick={() => setActiveTab('palawan')} className="w-full mt-4 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-cyan-400 text-xs font-bold py-2.5 rounded-xl transition-colors">
                  Открыть панель управления Палаваном ➡️
                </button>
              </div>

              {/* Суммарный виджет: Коста-Рика */}
              <div className="relative overflow-hidden rounded-3xl bg-slate-900/40 border border-slate-800 p-6 shadow-xl backdrop-blur-md">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full"></div>
                
                <div className="h-40 rounded-2xl mb-6 overflow-hidden relative border border-emerald-500/20">
                  <img 
                    src="https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80" 
                    alt="Costa Rica Coffee" 
                    className="w-full h-full object-cover brightness-[0.75]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 to-transparent"></div>
                  <span className="absolute bottom-3 left-3 bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-xl text-[10px] font-bold tracking-wider uppercase">
                    📍 Монтеверде • Высокогорные угодья
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
                    <p className="text-xs text-slate-400 font-mono">GMT-6</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase block">Влажность почвы / pH</span>
                    <span className="text-lg font-bold font-mono text-emerald-400">{crTelemetry.soilMoisture}% / {crTelemetry.soilPh}</span>
                  </div>
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase block">Пасека мониторинг</span>
                    <span className="text-lg font-bold font-mono text-yellow-400">Ульев: 2 (OK)</span>
                  </div>
                </div>
                <button onClick={() => setActiveTab('costarica')} className="w-full mt-4 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-emerald-400 text-xs font-bold py-2.5 rounded-xl transition-colors">
                  Открыть панель управления Коста-Рикой ➡️
                </button>
              </div>
            </div>

            {/* Единая базовая консоль логирования (только общие алерты) */}
            <div className="bg-slate-900/40 border border-slate-850 p-6 rounded-3xl space-y-4">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Shield className="w-4 h-4 text-teal-400" /> Последние события глобальной безопасности (Единый IoT Лог)
              </h3>
              <div className="divide-y divide-slate-800/60">
                {securityLog.slice(0, 3).map(log => (
                  <div key={log.id} className="py-2.5 text-xs flex justify-between items-center">
                    <span className="font-mono text-slate-500">{log.time} [{log.farm.toUpperCase()}]</span>
                    <span className="text-slate-300 font-mono ml-4 flex-1 text-left">{log.event}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                      log.severity === 'high' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {log.severity.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ======================================================= */}
        {/* === ФЕРМА 1: ПАЛАВАН — МОРСКАЯ БАЗА (БИРЮЗОВАЯ ТЕМА) === */}
        {/* ======================================================= */}
        {activeTab === 'palawan' && (
          <section className="space-y-8 animate-fadeIn">
            
            {/* ШАПКА ФЕРМЫ + КНОПКИ ГЛАВНОГО УПРАВЛЕНИЯ КЛИМАТОМ */}
            <div className="relative overflow-hidden rounded-3xl bg-slate-900/40 border border-cyan-500/20 p-6 shadow-xl backdrop-blur-md">
              <div className="absolute top-0 right-0 w-40 h-40 bg-cyan-500/10 blur-3xl rounded-full"></div>
              
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6">
                <div>
                  <span className="text-xs font-black uppercase tracking-widest text-cyan-400">Ферма 1 • Филиппины</span>
                  <h2 className="text-3xl font-black text-slate-100 mt-1">Остров Палаван</h2>
                  <p className="text-sm text-slate-400 mt-1">Комплексная марикультура IMTA (Жемчужницы, Лангусты, Трепанг) под охраной ИИ</p>
                </div>
                
                {/* ПУЛЬТ КРИЗИСНЫХ КНОПОК ПАЛАВАНА */}
                <div className="bg-slate-950/95 p-4 rounded-2xl border border-cyan-500/30 w-full md:w-auto space-y-3">
                  <span className="text-[10px] font-bold text-cyan-300 uppercase block tracking-wider text-center">📟 Пульт управления длинными линиями & климатом</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={handleSinkLines}
                      className="bg-cyan-500 text-slate-950 hover:bg-cyan-400 font-bold text-xs px-3 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md shadow-cyan-500/20"
                    >
                      <Anchor className="w-3.5 h-3.5" /> Затопить глубже (8м)
                    </button>
                    <button 
                      onClick={handleLiftLinesForCleaning}
                      className="bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-cyan-500/30 font-bold text-xs px-3 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Loop className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '4s' }} /> Поднять для обмыва
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={handleTyphoonSimulation}
                      className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs px-3 py-1.5 rounded-xl flex items-center justify-center gap-1 transition-all"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" /> Имитация тайфуна
                    </button>
                    <button 
                      onClick={handleResetPalawanClimate}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-3 py-1.5 rounded-xl flex items-center justify-center gap-1 transition-all"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Сбросить алерты
                    </button>
                  </div>
                </div>
              </div>

              {/* МЕТРИКИ IoT-БУЯ 24/7 (ГРАФИЧЕСКИЕ ИНДИКАТОРЫ) */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850">
                  <div className="flex justify-between text-slate-400 text-xs mb-1">
                    <span>Температура воды</span>
                    <Thermometer className="w-4 h-4 text-cyan-400" />
                  </div>
                  <span className="text-xl font-black font-mono text-cyan-300">{palawanTelemetry.temp}°C</span>
                  <div className="w-full bg-slate-900 h-1 mt-2 rounded-full overflow-hidden">
                    <div className="bg-cyan-500 h-full" style={{ width: `${(palawanTelemetry.temp / 40) * 100}%` }}></div>
                  </div>
                  <span className="text-[9px] text-emerald-400 block mt-1">Норма (26-30°C)</span>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850">
                  <div className="flex justify-between text-slate-400 text-xs mb-1">
                    <span>Раств. кислород DO</span>
                    <Activity className="w-4 h-4 text-sky-400" />
                  </div>
                  <span className="text-xl font-black font-mono text-slate-100">{palawanTelemetry.do} мг/л</span>
                  <div className="w-full bg-slate-900 h-1 mt-2 rounded-full overflow-hidden">
                    <div className="bg-sky-400 h-full" style={{ width: `${(palawanTelemetry.do / 10) * 100}%` }}></div>
                  </div>
                  <span className="text-[9px] text-emerald-400 block mt-1">Оптимальный уровень</span>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850">
                  <div className="flex justify-between text-slate-400 text-xs mb-1">
                    <span>Водородный pH</span>
                    <Beaker className="w-4 h-4 text-indigo-400" />
                  </div>
                  <span className="text-xl font-black font-mono text-slate-100">{palawanTelemetry.pH}</span>
                  <div className="w-full bg-slate-900 h-1 mt-2 rounded-full overflow-hidden">
                    <div className="bg-indigo-500 h-full" style={{ width: `${(palawanTelemetry.pH / 14) * 100}%` }}></div>
                  </div>
                  <span className="text-[9px] text-indigo-400 block mt-1">Слабощелочная норма</span>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850">
                  <div className="flex justify-between text-slate-400 text-xs mb-1">
                    <span>Соленость лагуны</span>
                    <Droplet className="w-4 h-4 text-blue-400" />
                  </div>
                  <span className={`text-xl font-black font-mono ${palawanStatus === 'TYPHOON' ? 'text-rose-400 animate-pulse' : 'text-slate-100'}`}>
                    {palawanTelemetry.salinity} ‰
                  </span>
                  <div className="w-full bg-slate-900 h-1 mt-2 rounded-full overflow-hidden">
                    <div className={`${palawanStatus === 'TYPHOON' ? 'bg-rose-500' : 'bg-blue-400'} h-full`} style={{ width: `${(palawanTelemetry.salinity / 40) * 100}%` }}></div>
                  </div>
                  <span className={`text-[9px] block mt-1 ${palawanStatus === 'TYPHOON' ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {palawanStatus === 'TYPHOON' ? 'Опреснение! Экстренно' : 'Норма океана'}
                  </span>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850">
                  <div className="flex justify-between text-slate-400 text-xs mb-1">
                    <span>Мутность воды</span>
                    <Wind className="w-4 h-4 text-teal-400" />
                  </div>
                  <span className={`text-xl font-black font-mono ${palawanStatus === 'TYPHOON' ? 'text-rose-400' : 'text-slate-100'}`}>
                    {palawanTelemetry.turbidity} NTU
                  </span>
                  <div className="w-full bg-slate-900 h-1 mt-2 rounded-full overflow-hidden">
                    <div className={`${palawanStatus === 'TYPHOON' ? 'bg-rose-500' : 'bg-teal-400'} h-full`} style={{ width: `${(palawanTelemetry.turbidity / 20) * 100}%` }}></div>
                  </div>
                  <span className={`text-[9px] block mt-1 ${palawanStatus === 'TYPHOON' ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {palawanStatus === 'TYPHOON' ? 'Взвесь и песок!' : 'Высокая прозрачность'}
                  </span>
                </div>

              </div>

              {/* ПРЕДИКТИВНЫЕ ИИ-АЛЕРТЫ */}
              <div className={`mt-5 p-4 rounded-2xl border flex items-center justify-between ${
                palawanStatus === 'TYPHOON' 
                  ? 'bg-rose-950/40 border-rose-500/50 text-rose-200' 
                  : 'bg-cyan-950/20 border-cyan-500/30 text-slate-300'
              }`}>
                <div className="flex items-center gap-3">
                  <Cpu className={`w-5 h-5 ${palawanStatus === 'TYPHOON' ? 'text-rose-400 animate-spin' : 'text-cyan-400'}`} />
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider">Предикативный ИИ-Анализатор лагуны</h4>
                    <p className="text-xs mt-0.5">
                      {palawanStatus === 'TYPHOON' 
                        ? 'Внимание! Экстремальное падение солености из-за осадков. Требуется заглубление линий Л-1 - Л-4 на отметку 8м!'
                        : 'Все системы лагуны стабильны. Оптимальное прохождение планктона через ферму.'}
                    </p>
                  </div>
                </div>
                {palawanStatus === 'TYPHOON' && (
                  <button onClick={handleSinkLines} className="bg-rose-600 text-white font-bold text-xs px-3 py-1.5 rounded-lg border border-rose-400/30 shadow-lg">
                    Применить рекомендацию ИИ
                  </button>
                )}
              </div>
            </div>

            {/* БЛОК 1. БЕЗОПАСНОСТЬ И ОХРАНА ОТ БРАКОНЬЕРОВ (ANTI-POACHING AI) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Симулятор камеры ночного видения с YOLOv8 детекцией */}
              <div className="lg:col-span-8 bg-slate-900/40 border border-slate-800 p-6 rounded-3xl space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold text-cyan-400 flex items-center gap-2">
                    <Eye className="w-5 h-5" /> Система ночного ИК-сканирования (Anti-Poaching AI)
                  </h3>
                  <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                    {['NORMAL', 'IR', 'DETECTION'].map(mode => (
                      <button 
                        key={mode} 
                        onClick={() => setPalCamMode(mode)}
                        className={`text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all ${palCamMode === mode ? 'bg-cyan-500 text-slate-950' : 'text-slate-400'}`}
                      >
                        {mode === 'NORMAL' ? 'Дневной' : mode === 'IR' ? 'ИК-Режим' : 'ИИ-Радар'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Экран видеопотока с тепловизора */}
                <div className="h-96 rounded-2xl border-2 border-slate-850 relative overflow-hidden flex items-center justify-center bg-slate-950">
                  <img 
                    src="https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80" 
                    alt="IR Feed" 
                    className={`w-full h-full object-cover transition-all duration-700 ${
                      palCamMode === 'IR' ? 'brightness-50 contrast-125 saturate-0 hue-rotate-90' :
                      palCamMode === 'DETECTION' ? 'brightness-[0.4] saturate-[0.2]' : 'brightness-90'
                    }`}
                  />
                  
                  {/* ИК-сетка и разметка детектора */}
                  {palCamMode === 'IR' && (
                    <div className="absolute inset-0 bg-green-950/20 pointer-events-none border border-green-500/30 flex items-center justify-center">
                      <div className="w-3/4 h-3/4 border border-dashed border-green-500/20 rounded-full animate-pulse"></div>
                      <span className="absolute top-4 left-4 font-mono text-[10px] text-green-400">● LIVE IR STREAM PALAWAN S-03</span>
                    </div>
                  )}

                  {/* ИИ-разметка детектора YOLOv8 */}
                  {palCamMode === 'DETECTION' && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                      <div className="absolute inset-0 border border-cyan-500/20"></div>
                      <div className="w-full h-full bg-gradient-to-t from-cyan-950/10 to-transparent"></div>
                      <div className="absolute top-4 left-4 font-mono text-[10px] text-cyan-400 animate-pulse">● YOLOv8 LIVE RADAR SCAN ACTIVE</div>
                      
                      {/* Сетка радара */}
                      <div className="absolute w-64 h-64 border border-cyan-500/30 rounded-full animate-ping" style={{ animationDuration: '4s' }}></div>

                      {/* Если браконьеры активны */}
                      {palPoacherSimulation && (
                        <div className="absolute top-1/3 left-1/4 border-2 border-dashed border-rose-500 p-2 text-rose-400 font-mono text-xs animate-fadeIn shadow-[0_0_15px_rgba(244,63,94,0.5)]">
                          <div className="font-bold">⚠️ TARGET DETECTED</div>
                          <div>Type: Bankka Boat</div>
                          <div>Confidence: 97.4%</div>
                          <div>Distance: 320m</div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Вспышки сирены */}
                  {palPoacherSimulation && (
                    <div className="absolute inset-0 bg-rose-600/10 animate-pulse pointer-events-none border-4 border-rose-500"></div>
                  )}
                </div>

                {/* Кнопки управления периметром */}
                <div className="flex gap-2">
                  <button 
                    onClick={handlePoachingSimulation}
                    className="flex-1 bg-rose-600 hover:bg-rose-500 font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-rose-600/20"
                  >
                    <ShieldAlert className="w-4 h-4" /> Имитация браконьерского вторжения ночью
                  </button>
                  {palPoacherSimulation && (
                    <button 
                      onClick={() => {
                        setPalPoacherSimulation(false);
                        triggerPush('🔒 ОХРАНА СТАБИЛИЗИРОВАНА', 'Браконьеры покинули территорию. Прожекторы выключены.', 'success');
                        addLog('Береговая охрана', 'Браконьерское плавсредство скрылось в нейтральных водах. Режим тревоги деактивирован.', 'info', 'palawan');
                      }}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs px-4 rounded-xl transition-all"
                    >
                      Выключить сирену / Сброс
                    </button>
                  )}
                </div>
              </div>

              {/* Правая колонка: Описание мер охраны и ТТХ ИИ */}
              <div className="lg:col-span-4 bg-slate-900/40 border border-slate-800 p-6 rounded-3xl space-y-6 flex flex-col justify-between">
                <div>
                  <h4 className="text-sm font-black uppercase tracking-wider text-cyan-400">Спецификация Охраны ИИ</h4>
                  <ul className="space-y-4 text-xs text-slate-300 mt-4">
                    <li className="flex gap-2.5">
                      <Cpu className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-slate-100">Нейросеть YOLOv8:</strong>
                        <p className="text-slate-400 mt-0.5">Встроена прямо в купольные PTZ-камеры. Обучена на образах катеров, моторных лодок и пловцов с аквалангом.</p>
                      </div>
                    </li>
                    <li className="flex gap-2.5">
                      <Radio className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-slate-100">Мгновенный отклик:</strong>
                        <p className="text-slate-400 mt-0.5">При детекции автоматически срабатывают поворотные прожекторы на вышке и включается судовая сирена.</p>
                      </div>
                    </li>
                    <li className="flex gap-2.5">
                      <Zap className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-slate-100">Двойное оповещение:</strong>
                        <p className="text-slate-400 mt-0.5">Сигнал уходит на дашборд и старейшине прибрежной общины баджао для поддержки.</p>
                      </div>
                    </li>
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/20 text-xs">
                  <span className="font-bold text-cyan-300 block">⚡ Текущий статус сирены вышки:</span>
                  <p className="text-slate-400 mt-1">{palPoacherSimulation ? '🚨 РЕЖИМ СИРЕНЫ АКТИВЕН' : '● Дежурный мониторинг (Тихий режим)'}</p>
                </div>
              </div>

            </div>

            {/* БЛОК 3. УЧЕТ СТАДА И КОНТРОЛЬ РАБОТЫ (SMART INVENTORY & RFID) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Карта лонглайнов */}
              <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800 p-6 rounded-3xl space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold flex items-center gap-2 text-cyan-400">
                    <Layers className="w-5 h-5" /> Карта длинных линий (Longlines) & Садов IMTA
                  </h3>
                  <span className="text-xs bg-cyan-500/10 text-cyan-300 px-3 py-1 rounded-full border border-cyan-500/20">4 Длинные Линии</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {longlines.map(line => (
                    <div key={line.id} className={`p-4 rounded-2xl border transition-colors duration-500 ${
                      line.status === 'DIRTY' ? 'bg-amber-950/20 border-amber-500/40' :
                      line.status === 'DEEP' ? 'bg-cyan-950/20 border-cyan-500/40' : 'bg-slate-950 border-slate-850'
                    }`}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-sm">{line.label}</span>
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                          line.status === 'DIRTY' ? 'bg-amber-500/20 text-amber-400' :
                          line.status === 'DEEP' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-emerald-500/20 text-emerald-400'
                        }`}>
                          {line.status === 'DIRTY' ? 'ВНИМАНИЕ' : line.status === 'DEEP' ? 'Глубоко (8м)' : 'ОК'}
                        </span>
                      </div>
                      <ul className="text-xs text-slate-400 space-y-1">
                        <li>Сеток: <strong className="text-slate-200">{line.load} шт</strong></li>
                        <li>Устриц: <strong className="text-slate-200">{line.qty} шт</strong></li>
                        <li>Глубина: <strong className="text-cyan-400">{line.depth}м</strong></li>
                      </ul>
                      <div className="w-full bg-slate-900 h-1 mt-3 rounded-full overflow-hidden">
                        <div className={`h-full ${line.status === 'DIRTY' ? 'bg-amber-400' : 'bg-cyan-400'}`} style={{ width: line.id === 3 ? '100%' : '60%' }}></div>
                      </div>
                      {line.status === 'DIRTY' && (
                        <button 
                          onClick={() => {
                            setLonglines(prev => prev.map(l => l.id === 3 ? { ...l, status: 'OK', lastCleaned: '2026-08-20' } : l));
                            triggerPush('🧼 ЛИНИЯ ОЧИЩЕНА', 'Лонглайн Л-3 успешно промыт. Рост жемчужниц стабилизирован.', 'success');
                            addLog('Длинная линия Л-3', 'Зафиксирована плановая очистка раковин от биообрастаний с помощью RFID.', 'info', 'palawan');
                          }}
                          className="w-full mt-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[10px] py-1 rounded-lg transition-colors"
                        >
                          Промыть / Очистить Л-3
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* RFID-сканирование устриц в море */}
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-850 space-y-4">
                  <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                    <Rss className="w-4 h-4 text-cyan-400" /> RFID-Сканирование Садков (Учет ухода)
                  </h4>
                  <form onSubmit={handleRfidScan} className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Введите код (например: RFID-PAL-002)"
                      value={rfidSearch}
                      onChange={(e) => setRfidSearch(e.target.value)}
                      className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 flex-1 font-mono"
                    />
                    <button type="submit" className="bg-cyan-500 text-slate-950 px-5 py-2 rounded-xl text-sm font-bold hover:bg-cyan-400 transition-colors">
                      Сканировать
                    </button>
                  </form>

                  {/* Результат RFID */}
                  {scannedItem && (
                    <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-xs space-y-2 animate-fadeIn">
                      {scannedItem.error ? (
                        <span className="text-rose-400">{scannedItem.error}</span>
                      ) : (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-slate-500">Тип объекта:</span>
                            <p className="font-bold text-slate-200">{scannedItem.type}</p>
                          </div>
                          <div>
                            <span className="text-slate-500">Плотность:</span>
                            <p className="font-mono text-slate-200">{scannedItem.density}</p>
                          </div>
                          <div>
                            <span className="text-slate-500">Возраст стада:</span>
                            <p className="font-mono text-slate-200">{scannedItem.age}</p>
                          </div>
                          <div>
                            <span className="text-slate-500">Последняя чистка:</span>
                            <p className="font-mono text-emerald-400 font-bold">{scannedItem.lastCleaned}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

              </div>

              {/* Чек-лист персонала и учет смертности */}
              <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-cyan-400">Морской Чек-лист</h3>
                  <p className="text-xs text-slate-400 mt-1">Регулярное обслуживание линий и раковин устриц</p>
                </div>

                <div className="space-y-3">
                  {cleaningChecklist.map(task => (
                    <label key={task.id} className="flex items-start gap-3 p-3 bg-slate-950 rounded-xl border border-slate-850 cursor-pointer hover:border-cyan-500/40 transition-all">
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

                {/* Регистрация смертности */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 space-y-4">
                  <h4 className="text-sm font-bold text-rose-400 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> Регистрация падежа в БД
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    <input 
                      type="number" 
                      placeholder="Штук"
                      value={newMortality.qty}
                      onChange={(e) => setNewMortality({ ...newMortality, qty: e.target.value })}
                      className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-rose-500"
                    />
                    <select 
                      value={newMortality.cause}
                      onChange={(e) => setNewMortality({ ...newMortality, cause: e.target.value })}
                      className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
                    >
                      <option value="Естественный отбор">Естеств. отбор</option>
                      <option value="Хищники">Хищники</option>
                      <option value="Паразиты">Паразиты</option>
                      <option value="Тайфун / Шторм">Тайфун / Шторм</option>
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
                      triggerPush('📉 ПАДЕЖ ЗАРЕГИСТРИРОВАН', `Учтено ${newMortality.qty} шт падежа. Схема IndexedDB обновлена.`, 'error');
                      addLog('База марикультуры', `Зарегистрирован падеж раковин в количестве ${newMortality.qty} шт по причине: ${newMortality.cause}.`, 'warning', 'palawan');
                      setNewMortality({ qty: '', cause: 'Естественный отбор' });
                    }}
                    className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs py-2 rounded-lg transition-colors"
                  >
                    Зарегистрировать падеж в БД
                  </button>

                  <div className="space-y-1 max-h-[80px] overflow-y-auto pt-2 border-t border-slate-900">
                    {mortalityLog.map((log, idx) => (
                      <div key={idx} className="flex justify-between text-[10px] text-slate-400">
                        <span>{log.date} — {log.qty} шт ({log.cause})</span>
                        <span className="text-rose-400">Внесено</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>

            {/* БЛОК 4. АВТОМАТИЧЕСКАЯ СОРТИРОВКА И ОЦЕНКА УРОЖАЯ (AI GRADING) */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold flex items-center gap-2 text-slate-100">
                    <Cpu className="text-cyan-400 w-5 h-5 animate-pulse" /> Автоматическая сортировка и оценка ИИ (AI Grading)
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">Оценка золотистого жемчуга и перламутровых створок Pinctada maxima с помощью сверточных сетей</p>
                </div>
                
                {/* Выбор сортировки */}
                <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                  <button 
                    onClick={() => { setPalAiGradingType('pearl'); setPalAiResult(null); }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${palAiGradingType === 'pearl' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400'}`}
                  >
                    Жемчуг South Sea
                  </button>
                  <button 
                    onClick={() => { setPalAiGradingType('shell'); setPalAiResult(null); }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${palAiGradingType === 'shell' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400'}`}
                  >
                    Створки раковин
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Интерактивное Окно ИИ-Камеры (Реальные фотки!) */}
                <div className="bg-slate-950 border border-dashed border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center text-center relative overflow-hidden min-h-[300px]">
                  
                  {/* Изображение жемчуга или ракушки */}
                  <div className="absolute inset-0 w-full h-full animate-fadeIn">
                    <img 
                      src={palAiGradingType === 'pearl'
                        ? "https://images.unsplash.com/photo-1515688594390-b649af70d282?auto=format&fit=crop&w=600&q=80" // Роскошный золотой жемчуг!
                        : "https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=600&q=80" // Радужные перламутровые створки!
                      } 
                      alt="AI Target" 
                      className="w-full h-full object-cover brightness-[0.7] contrast-[1.1]"
                    />
                    
                    {/* Анимированный лазер */}
                    {palAiAnalyzing && (
                      <div className="absolute left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_rgba(34,211,238,0.9)] animate-bounce" style={{ top: '35%', animationDuration: '2.5s' }}></div>
                    )}

                    {/* Нейросетевой Bounding Box */}
                    {!palAiAnalyzing && palAiResult && (
                      <div className="absolute inset-8 border-2 border-dashed rounded-xl border-cyan-400/60 flex items-center justify-center">
                        <div className="bg-slate-950/95 border border-cyan-400/40 p-2.5 rounded-lg text-[10px] text-cyan-300 font-mono text-left max-w-[220px] absolute top-4 left-4">
                          <div className="font-bold border-b border-cyan-400/20 pb-0.5 mb-1 flex items-center gap-1">
                            <Cpu className="w-3 h-3 text-cyan-400 animate-spin" /> TensorFlow.js Active
                          </div>
                          <div>Объект: <span className="text-white font-bold">{palAiGradingType === 'pearl' ? 'South Sea Gold' : 'Pinctada Maxima'}</span></div>
                          <div>Калибр: <span className="text-emerald-400 font-bold">{palAiGradingType === 'pearl' ? '13.4мм' : '22.8см'}</span></div>
                          <div>Уверенность: <span className="text-emerald-400 font-bold">99.4%</span></div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Кнопки управления поверх */}
                  <div className="flex gap-2 z-10 mt-auto bg-slate-950/90 p-2 rounded-xl border border-slate-800">
                    <button onClick={handlePalAiAnalysis} disabled={palAiAnalyzing} className="bg-gradient-to-tr from-cyan-500 to-blue-500 hover:brightness-110 text-slate-950 text-xs font-black px-4 py-2 rounded-lg shadow-lg">
                      {palAiAnalyzing ? 'Калибровка ИИ...' : 'Запустить ИИ-тест'}
                    </button>
                    {(palAiResult || palAiAnalyzing) && (
                      <button onClick={() => setPalAiResult(null)} className="bg-slate-850 hover:bg-slate-800 text-slate-300 text-xs px-3 py-2 rounded-lg">
                        Сбросить
                      </button>
                    )}
                  </div>
                </div>

                {/* Результат сканирования */}
                <div className="bg-slate-950 p-6 rounded-2xl border border-slate-850 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Результаты экспертизы качества ИИ</h4>
                    
                    {palAiAnalyzing && (
                      <div className="space-y-4 py-6">
                        <div className="flex items-center gap-2 text-sm text-cyan-300 font-mono">
                          <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                          <span>Сканирование слоев перламутра по 5 параметрам...</span>
                        </div>
                        <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                          <div className="bg-cyan-500 h-full animate-pulse" style={{ width: '85%' }}></div>
                        </div>
                      </div>
                    )}

                    {!palAiAnalyzing && palAiResult ? (
                      <div className="space-y-4 animate-fadeIn">
                        <div className="flex justify-between items-center">
                          <span className="text-xs bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-3 py-1 rounded-full font-bold">
                            {palAiResult.grade}
                          </span>
                          <span className="text-xs text-slate-400">Назначение: <strong className="text-emerald-400">{palAiResult.dest}</strong></span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed bg-slate-900 p-3 rounded-lg border border-slate-850">{palAiResult.desc}</p>
                        
                        {/* Технические параметры */}
                        <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                          {Object.entries(palAiResult.metrics).map(([key, val]) => (
                            <div key={key} className="bg-slate-900 p-2 rounded border border-slate-850">
                              <span className="text-slate-500 uppercase block">{key}:</span>
                              <span className="text-slate-200 font-bold">{val}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-slate-500 text-xs text-center py-12 font-mono">
                        Ожидание старта ИИ-теста... Нажмите кнопку «Запустить ИИ-тест» под изображением для оценки жемчужины или раковины.
                      </div>
                    )}
                  </div>
                  <div className="text-[9px] text-slate-500 font-mono border-t border-slate-900 pt-3">
                    Используется локальная обученная нейросеть MobileNet-V3. Скорость обработки снимка: 120мс.
                  </div>
                </div>

              </div>
            </div>

            {/* БЛОК 5. МОНИТОРИНГ МНОГОУРОВНЕВОЙ СИСТЕМЫ IMTA (БИО-МАССА) */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-cyan-400">Многоуровневая система IMTA (Биомасса лагуны)</h3>
                <span className="text-xs text-slate-400">Адаптивный баланс трофических уровней</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Верхний ярус */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 space-y-3">
                  <span className="text-xs font-bold text-cyan-400 block uppercase tracking-wider">▲ Верхний ярус (Пищевые устрицы)</span>
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-xs space-y-1.5">
                    <div className="flex justify-between"><span>Вид:</span><strong className="text-slate-200">Crassostrea gigas</strong></div>
                    <div className="flex justify-between"><span>Состояние роста:</span><strong className="text-emerald-400">Ускоренный (+12%)</strong></div>
                    <div className="flex justify-between"><span>Плотность посадки:</span><strong className="text-slate-200">55 шт/сетку</strong></div>
                  </div>
                  <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden">
                    <div className="bg-cyan-500 h-full" style={{ width: '85%' }}></div>
                  </div>
                </div>

                {/* Средний ярус */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 space-y-3">
                  <span className="text-xs font-bold text-sky-400 block uppercase tracking-wider">◆ Средний ярус (Тигровые Лангусты)</span>
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-xs space-y-1.5">
                    <div className="flex justify-between"><span>Объект:</span><strong className="text-slate-200">Panulirus ornatus</strong></div>
                    <div className="flex justify-between"><span>Состояние садков:</span><strong className="text-emerald-400">Оптимально (Чистые)</strong></div>
                    <div className="flex justify-between"><span>Ср. вес особи:</span><strong className="text-slate-200">620 грамм</strong></div>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 pt-1">
                    <button 
                      onClick={() => {
                        triggerPush('🦞 КОРМЛЕНИЕ ЛАНГУСТОВ', 'Порция органического корма внесена в садки. Схема кормления зафиксирована.', 'success');
                        addLog('Плавучий садок лангустов', 'Зарегистрирована ручная подача корма рабочими.', 'info', 'palawan');
                      }}
                      className="bg-slate-900 hover:bg-slate-850 text-sky-400 border border-sky-500/20 text-[9px] py-1 rounded font-bold"
                    >
                      Внести корм
                    </button>
                    <button 
                      onClick={() => {
                        triggerPush('📊 ЗАМЕР БИОМАССЫ', 'Проведен выборочный взвес лангустов. Средний вес стабилен.', 'info');
                      }}
                      className="bg-slate-900 hover:bg-slate-850 text-slate-300 text-[9px] py-1 rounded"
                    >
                      Взвесить
                    </button>
                  </div>
                </div>

                {/* Донный ярус */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 space-y-3">
                  <span className="text-xs font-bold text-indigo-400 block uppercase tracking-wider">▼ Донный ярус (Золотой трепанг)</span>
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-xs space-y-1.5">
                    <div className="flex justify-between"><span>Вид:</span><strong className="text-slate-200">Holothuria scabra</strong></div>
                    <div className="flex justify-between"><span>Плотность дна:</span><strong className="text-indigo-400 font-mono">14 шт/м²</strong></div>
                    <div className="flex justify-between"><span>Очистка дна:</span><strong className="text-emerald-400">Эффективность 98.4%</strong></div>
                  </div>
                  <button 
                    onClick={() => {
                      triggerPush('🔍 АНАЛИЗ ДОННОГО ИЛА', 'Отобран образец грунта под садками. Патогенные накопления отсутствуют.', 'success');
                      addLog('База марикультуры', 'Проведен анализ грунта: морские огурцы полностью перерабатывают осадок лангустов.', 'info', 'palawan');
                    }}
                    className="w-full bg-slate-900 hover:bg-slate-850 text-indigo-400 border border-indigo-500/20 text-[10px] py-1.5 rounded font-bold"
                  >
                    Замерить плотность трепанга
                  </button>
                </div>

              </div>

              {/* СЧЕТЧИКИ УРОЖАЯ */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 border-t border-slate-800 pt-6">
                <div className="bg-slate-950 p-3 rounded-xl text-center">
                  <span className="text-[10px] text-slate-500 uppercase block">Жемчуг AAA (Сейф)</span>
                  <span className="text-xl font-bold text-cyan-300 font-mono">142 шт</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl text-center">
                  <span className="text-[10px] text-slate-500 uppercase block">Сушеный трепанг</span>
                  <span className="text-xl font-bold text-slate-300 font-mono">310 кг</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl text-center">
                  <span className="text-[10px] text-slate-500 uppercase block">Устричное мясо</span>
                  <span className="text-xl font-bold text-slate-300 font-mono">820 порций</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl text-center">
                  <span className="text-[10px] text-slate-500 uppercase block">Перламутр комплекты</span>
                  <span className="text-xl font-bold text-emerald-400 font-mono">45 сетов</span>
                </div>
              </div>
            </div>

            {/* ЛОКАЛЬНЫЙ IoT ЛОГ ПАЛАВАНА */}
            <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl space-y-4">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Shield className="w-4 h-4 text-cyan-400" /> Журнал событий марикультуры & Охраны Палавана
              </h3>
              <div className="divide-y divide-slate-850 max-h-[200px] overflow-y-auto">
                {securityLog.filter(log => log.farm === 'palawan').map(log => (
                  <div key={log.id} className="py-2.5 text-xs flex justify-between items-center hover:bg-slate-900/20 px-2 transition-all">
                    <span className="font-mono text-slate-500">{log.time}</span>
                    <span className="font-semibold text-cyan-300 ml-4 shrink-0">{log.location}</span>
                    <span className="text-slate-400 font-mono ml-4 flex-1 text-left">{log.event}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                      log.severity === 'high' ? 'bg-rose-500/20 text-rose-400 animate-pulse' :
                      log.severity === 'warning' ? 'bg-amber-500/10 text-amber-400' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {log.severity.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </section>
        )}

        {/* ======================================================= */}
        {/* === ФЕРМА 2: КОСТА-РИКА — АГРОСФЕРА (ИЗУМРУДНО-ЯНТАРНАЯ) === */}
        {/* ======================================================= */}
        {activeTab === 'costarica' && (
          <section className="space-y-8 animate-fadeIn">
            
            {/* ШАПКА ФЕРМЫ + ПУЛЬТ УПРАВЛЕНИЯ ОРОШЕНИЕМ И ПАРАМЕТРАМИ */}
            <div className="relative overflow-hidden rounded-3xl bg-slate-900/40 border border-emerald-500/20 p-6 shadow-xl backdrop-blur-md">
              <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 blur-3xl rounded-full"></div>
              
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6">
                <div>
                  <span className="text-xs font-black uppercase tracking-widest text-emerald-400 font-mono">Ферма 2 • Центральная Америка</span>
                  <h2 className="text-3xl font-black text-slate-100 mt-1">Коста-Рика • Монтеверде</h2>
                  <p className="text-sm text-slate-400 mt-1">Высокогорная агролесомелиорация спешелти-кофе, дикой ванили и пчел в защищенном био-коридоре</p>
                </div>
                
                {/* ПУЛЬТ КНОПОК КОСТА-РИКИ */}
                <div className="bg-slate-950/95 p-4 rounded-2xl border border-emerald-500/30 w-full md:w-auto space-y-3">
                  <span className="text-[10px] font-bold text-emerald-300 uppercase block tracking-wider text-center">📟 Пульт капельного орошения & автоматики</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={handleToggleIrrigation}
                      className={`font-bold text-xs px-3 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                        isIrrigationActive 
                          ? 'bg-rose-600 text-white animate-pulse' 
                          : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-md shadow-emerald-500/20'
                      }`}
                    >
                      <Power className="w-3.5 h-3.5" /> {isIrrigationActive ? 'Выключить полив' : 'Запустить полив'}
                    </button>
                    <button 
                      onClick={() => {
                        setIsAiWateringMode(prev => {
                          const next = !prev;
                          triggerPush(next ? '🤖 ИИ-ПОЛИВ АКТИВЕН' : '🤖 ИИ-ПОЛИВ ОТКЛЮЧЕН', next ? 'Автоматическая калибровка влажности по прогнозу осадков включена.' : 'Управление поливом переведено в ручной режим.', 'info');
                          return next;
                        });
                      }}
                      className={`font-bold text-xs px-3 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                        isAiWateringMode 
                          ? 'bg-slate-900 text-emerald-400 border border-emerald-500/30' 
                          : 'bg-slate-950 text-slate-500 border border-slate-850'
                      }`}
                    >
                      <Cpu className="w-3.5 h-3.5" /> {isAiWateringMode ? 'ИИ-Полив: АКТИВЕН' : 'ИИ-Полив: ВЫКЛ'}
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={handleAnimalSimulation}
                      className="bg-slate-900 hover:bg-slate-850 text-amber-400 border border-amber-500/20 font-bold text-xs px-3 py-1.5 rounded-xl flex items-center justify-center gap-1 transition-all"
                    >
                      <Eye className="w-3.5 h-3.5" /> Имитация зверя
                    </button>
                    <button 
                      onClick={() => {
                        setCrTelemetry(prev => ({ ...prev, soilMoisture: 38.0, airHumidity: 32.0 }));
                        triggerPush('🚨 СИМУЛЯЦИЯ ЗАСУХИ', 'Влажность воздуха упала до 32%. Высокий риск лесных пожаров!', 'error');
                        addLog('Климатическая станция', 'Внимание! Зафиксировано падение влажности ниже 35%. Высокий класс пожароопасности!', 'high', 'costarica');
                      }}
                      className="bg-rose-950/20 hover:bg-rose-900/30 text-rose-400 border border-rose-500/30 text-[10px] py-1.5 rounded-xl font-bold"
                    >
                      Вызвать засуху (Пожар)
                    </button>
                  </div>
                </div>
              </div>

              {/* БЛОК 1. ПОЧВА, КЛИМАТ И ПОЛИВ (Environmental IoT) */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850">
                  <span className="text-slate-400 text-xs flex justify-between items-center mb-1">
                    Влажность почвы
                    <Droplet className="w-4 h-4 text-emerald-400" />
                  </span>
                  <span className={`text-xl font-black font-mono ${crTelemetry.soilMoisture < 45 ? 'text-rose-400' : 'text-emerald-300'}`}>
                    {crTelemetry.soilMoisture}%
                  </span>
                  <div className="w-full bg-slate-900 h-1 mt-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full" style={{ width: `${crTelemetry.soilMoisture}%` }}></div>
                  </div>
                  <span className="text-[9px] text-slate-400 block mt-1">{isIrrigationActive ? 'Капельное орошение...' : 'Норма (60-80%)'}</span>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850">
                  <span className="text-slate-400 text-xs flex justify-between items-center mb-1">
                    Темп. воздуха
                    <Thermometer className="w-4 h-4 text-amber-400" />
                  </span>
                  <span className="text-xl font-black font-mono text-slate-100">{crTelemetry.airTemp}°C</span>
                  <div className="w-full bg-slate-900 h-1 mt-2 rounded-full overflow-hidden">
                    <div className="bg-amber-400 h-full" style={{ width: `${(crTelemetry.airTemp / 40) * 100}%` }}></div>
                  </div>
                  <span className="text-[9px] text-slate-400 block mt-1">Высокогорная прохлада</span>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850">
                  <span className="text-slate-400 text-xs flex justify-between items-center mb-1">
                    Влажность воздуха
                    <CloudRain className="w-4 h-4 text-sky-400" />
                  </span>
                  <span className={`text-xl font-black font-mono ${crTelemetry.airHumidity < 40 ? 'text-rose-400' : 'text-slate-100'}`}>
                    {crTelemetry.airHumidity}%
                  </span>
                  <div className="w-full bg-slate-900 h-1 mt-2 rounded-full overflow-hidden">
                    <div className="bg-sky-400 h-full" style={{ width: `${crTelemetry.airHumidity}%` }}></div>
                  </div>
                  <span className="text-[9px] text-slate-400 block mt-1">{crTelemetry.airHumidity < 40 ? '⚠️ СУХО (Пожароопасность)' : 'Оптимально'}</span>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850">
                  <span className="text-slate-400 text-xs flex justify-between items-center mb-1">
                    Осадки (24ч)
                    <CloudRain className="w-4 h-4 text-indigo-400" />
                  </span>
                  <span className="text-xl font-black font-mono text-slate-100">{crTelemetry.rain} мм</span>
                  <div className="w-full bg-slate-900 h-1 mt-2 rounded-full overflow-hidden">
                    <div className="bg-indigo-400 h-full" style={{ width: `${(crTelemetry.rain / 50) * 100}%` }}></div>
                  </div>
                  <span className="text-[9px] text-slate-400 block mt-1">Тропический туман</span>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850">
                  <span className="text-slate-400 text-xs flex justify-between items-center mb-1">
                    Кислотность почвы
                    <Beaker className="w-4 h-4 text-amber-500" />
                  </span>
                  <span className="text-xl font-black font-mono text-slate-100">{crTelemetry.soilPh} pH</span>
                  <div className="w-full bg-slate-900 h-1 mt-2 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full" style={{ width: `${(crTelemetry.soilPh / 14) * 100}%` }}></div>
                  </div>
                  <span className="text-[9px] text-emerald-400 block mt-1">Оптимально для Арабики</span>
                </div>

              </div>

              {/* График / Сетка полива ИИ */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 text-xs text-slate-300 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Cpu className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-200 uppercase block tracking-wider text-[10px]">ИИ-Календарь прецизионного орошения</span>
                    <p className="text-slate-400 mt-0.5">Нейросеть проанализировала дефицит осадков за 5 дней. Прогноз влажности стабилен. Полив перенесен на 18:00.</p>
                  </div>
                </div>
                <div className="bg-emerald-950/40 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-lg font-mono">
                  SmartSchedule Active
                </div>
              </div>

            </div>

            {/* БЛОК 2. СПЕШЕЛТИ КОФЕ И КАКАО (Контроль урожая и переработки) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Ферментационные танки и сушка */}
              <div className="lg:col-span-8 bg-slate-900/40 border border-slate-800 p-6 rounded-3xl space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold text-emerald-400 flex items-center gap-2">
                    <Layers className="w-5 h-5" /> Контроль переработки Спешелти-Кофе и Какао (Микро-Партии)
                  </h3>
                  <span className="text-xs bg-emerald-500/10 text-emerald-300 px-3 py-1 rounded-full border border-emerald-500/20">Сезон 2026</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {coffeeBatches.map(batch => (
                    <div key={batch.id} className={`p-5 rounded-2xl border space-y-4 transition-colors duration-500 ${
                      batch.sealed ? 'bg-emerald-950/10 border-emerald-500/30' : 'bg-slate-950 border-slate-850'
                    }`}>
                      <div className="flex justify-between items-center">
                        <span className="font-mono font-bold text-amber-400 text-sm">{batch.id} • {batch.variety}</span>
                        <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-bold ${
                          batch.sealed ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                        }`}>
                          {batch.sealed ? 'ГЕРМЕТИЧНАЯ ФЕРМЕНТАЦИЯ' : 'СУШКА НА КРОВАТЯХ'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 font-mono">
                        <div className="bg-slate-900 p-2 rounded">
                          <span className="text-slate-500 text-[10px] block">Температура бака:</span>
                          <strong>{batch.temp}</strong>
                        </div>
                        <div className="bg-slate-900 p-2 rounded">
                          <span className="text-slate-500 text-[10px] block">Сахар BRIX:</span>
                          <strong className="text-amber-300">{batch.brix}</strong>
                        </div>
                        <div className="bg-slate-900 p-2 rounded">
                          <span className="text-slate-500 text-[10px] block">Влажность зерна:</span>
                          <strong className="text-emerald-300">{batch.moisture}</strong>
                        </div>
                        <div className="bg-slate-900 p-2 rounded">
                          <span className="text-slate-500 text-[10px] block">Контроль сушки (ИИ):</span>
                          <strong>{batch.sealed ? 'CO2 Контроль' : 'Цель: 10-12%'}</strong>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {batch.id === 'CR-GEO-09' && (
                          <button 
                            onClick={() => handleSealFermentation(batch.id)}
                            className="flex-1 bg-emerald-500 text-slate-950 font-bold text-xs py-1.5 rounded-lg hover:bg-emerald-400 transition-colors"
                          >
                            {batch.sealed ? 'Разгерметизировать бак' : 'Герметизировать бак'}
                          </button>
                        )}
                        {batch.id === 'CR-SL28-02' && (
                          <button 
                            onClick={() => {
                              setCoffeeBatches(prev => prev.map(b => b.id === 'CR-SL28-02' ? { ...b, moisture: '11.4%', stage: 'Готов к GrainPro-мешкам' } : b));
                              triggerPush('☕ СУШКА ЗАВЕРШЕНА', 'Влажность кофе достигла идеальных 11.4%. Затаривание разрешено!', 'success');
                              addLog('Сушильный цех', 'ИИ-анализ влажности: достигнут целевой порог 11.4% для лота CR-SL28-02.', 'info', 'costarica');
                            }}
                            className="flex-1 bg-amber-500 text-slate-950 font-bold text-xs py-1.5 rounded-lg hover:bg-amber-400 transition-colors"
                          >
                            Снять показания сушки (ИИ)
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Ввод BRIX сахара рабочими */}
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-850 space-y-4">
                  <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-400" /> Ручной ввод BRIX-индекса спелости ягод перед сбором
                  </h4>
                  <form onSubmit={handleAddBrixLog} className="flex gap-2">
                    <input 
                      type="number" 
                      step="0.1"
                      placeholder="Внесите показатель % BRIX (например: 23.4)"
                      value={coffeeBrixInput}
                      onChange={(e) => setCoffeeBrixInput(e.target.value)}
                      className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 flex-1 font-mono"
                    />
                    <button type="submit" className="bg-emerald-500 text-slate-950 px-5 py-2 rounded-xl text-sm font-bold hover:bg-emerald-400 transition-colors">
                      Зафиксировать BRIX
                    </button>
                  </form>

                  <div className="space-y-1 pt-1 max-h-[80px] overflow-y-auto">
                    {coffeeBrixLogs.map(log => (
                      <div key={log.id} className="flex justify-between text-[11px] text-slate-400 border-b border-slate-900 pb-1">
                        <span> Batch: <strong className="text-slate-200 font-mono">{log.batch}</strong> — Сахар: <strong className="text-amber-300 font-mono">{log.brix}</strong> ({log.stage})</span>
                        <span className="text-slate-500 font-mono">{log.time}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Правая колонка: Описание ИИ-процесса сушки */}
              <div className="lg:col-span-4 bg-slate-900/40 border border-slate-800 p-6 rounded-3xl space-y-6 flex flex-col justify-between">
                <div>
                  <h4 className="text-sm font-black uppercase tracking-wider text-emerald-400">ИИ-График падения влажности</h4>
                  <p className="text-xs text-slate-400 mt-2">
                    Для сохранения класса Specialty кофе должен сушиться плавно, без перегрева. ИИ-алгоритм строит кривую сушки и высылает алерт при отклонениях.
                  </p>
                  
                  {/* Имитация графика */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 mt-4 space-y-2">
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>День 1: 42%</span>
                      <span>День 3: 14.8%</span>
                      <span>День 5: 11%</span>
                    </div>
                    <div className="h-12 w-full bg-slate-900 rounded border border-slate-800 relative overflow-hidden flex items-end">
                      <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 to-transparent"></div>
                      <svg className="w-full h-full stroke-emerald-500 stroke-2" fill="none">
                        <path d="M 0 5 L 60 25 L 120 40 L 200 45" />
                      </svg>
                      <span className="absolute bottom-1 right-2 text-[9px] text-emerald-400 font-mono font-bold">Идеал: 10.5%</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 text-xs">
                  <span className="font-bold text-emerald-300 block">📉 Влажность по датчикам:</span>
                  <p className="text-slate-400 mt-1">Оптимальная усадка зерна. Плесень заблокирована.</p>
                </div>
              </div>

            </div>

            {/* БЛОК 3. ВАНИЛЬ (Трекинг ручных процессов) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Учет ручного опыления */}
              <div className="lg:col-span-6 bg-slate-900/40 border border-slate-800 p-6 rounded-3xl space-y-4">
                <h3 className="text-lg font-bold text-emerald-400 flex items-center gap-2">
                  <Sun className="w-5 h-5 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} /> Ручной учет опыления дикой ванили
                </h3>
                <p className="text-xs text-slate-400">
                  Цветок ванили цветет всего несколько часов утром. Рабочие опыляют цветы вручную бамбуковой иглой и мгновенно регистрируют результаты.
                </p>

                <div className="grid grid-cols-2 gap-4">
                  {vanillaPollinations.map(sec => (
                    <div key={sec.id} className="bg-slate-950 p-4 rounded-xl border border-slate-850 text-xs space-y-1">
                      <div className="flex justify-between font-bold">
                        <span className="text-slate-200">{sec.id}</span>
                        <span className="text-emerald-400 font-mono">{sec.count} шт</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Сегодня вручную:</span>
                        <strong className="text-amber-400 font-mono font-bold">+{sec.pollinatedToday} цветков</strong>
                      </div>
                      <span className="text-[10px] text-slate-500 block">{sec.matureStatus}</span>
                    </div>
                  ))}
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-3">
                  <span className="text-xs font-bold block text-slate-300">Быстрый ввод опыленных цветков:</span>
                  <div className="flex gap-2">
                    <select 
                      value={selectedVanillaSector}
                      onChange={(e) => setSelectedVanillaSector(e.target.value)}
                      className="bg-slate-900 border border-slate-800 rounded-lg px-2 text-xs text-slate-200"
                    >
                      <option value="Сектор Ванили A">Сектор А</option>
                      <option value="Сектор Ванили B">Сектор B</option>
                    </select>
                    <input 
                      type="number" 
                      placeholder="+ Кол-во цветков"
                      value={newPollinationCount}
                      onChange={(e) => setNewPollinationCount(e.target.value)}
                      className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1 text-xs text-slate-200 flex-1 font-mono focus:outline-none"
                    />
                    <button onClick={handleAddVanillaPollination} className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold px-3 py-1 rounded-lg">
                      Записать
                    </button>
                  </div>
                </div>
              </div>

              {/* ИИ сортировка длинных стручков ванили */}
              <div className="lg:col-span-6 bg-slate-900/40 border border-slate-800 p-6 rounded-3xl space-y-4">
                <h3 className="text-lg font-bold text-amber-400 flex items-center gap-2">
                  <Camera className="w-5 h-5 text-amber-400" /> ИИ-сортировка стручков ванили
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Окно ИИ сканера */}
                  <div className="bg-slate-950 border border-dashed border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center relative overflow-hidden min-h-[200px]">
                    <div className="absolute inset-0">
                      <img 
                        src="https://images.unsplash.com/photo-1596436889106-be35e843f974?auto=format&fit=crop&w=400&q=80" // Зеленая свежая ваниль / пряности
                        alt="Vanilla pods" 
                        className="w-full h-full object-cover brightness-50"
                      />
                      {crAiAnalyzing && (
                        <div className="absolute left-0 right-0 h-1 bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-bounce" style={{ top: '40%' }}></div>
                      )}
                      {!crAiAnalyzing && crAiResult && (
                        <div className="absolute inset-4 border border-dashed border-emerald-400/60 rounded">
                          <span className="absolute top-2 left-2 bg-slate-950/90 text-emerald-400 text-[9px] font-mono p-1 rounded">Grade A Pod Detected</span>
                        </div>
                      )}
                    </div>
                    <button onClick={handleCrAiAnalysis} disabled={crAiAnalyzing} className="z-10 mt-auto bg-slate-950/90 text-emerald-400 border border-emerald-500/30 hover:bg-slate-900 text-xs font-bold px-3 py-1.5 rounded-lg shadow-xl">
                      {crAiAnalyzing ? 'Сканирование стручка...' : 'Запустить ИИ-тест ванили'}
                    </button>
                  </div>

                  {/* Результаты ИИ ванили */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block font-mono">Вердикт TensorFlow.js</span>
                      {crAiAnalyzing && (
                        <div className="text-xs text-slate-400 animate-pulse mt-4">Оценка длины стручка и влажности...</div>
                      )}
                      {!crAiAnalyzing && crAiResult ? (
                        <div className="space-y-2 mt-2 animate-fadeIn text-xs">
                          <span className="text-xs bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded border border-emerald-500/30 block text-center">
                            {crAiResult.grade}
                          </span>
                          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{crAiResult.desc}</p>
                          <div className="text-[9px] font-mono text-slate-300 bg-slate-900 p-2 rounded">
                            Длина: {crAiResult.metrics.length} <br />
                            Влажность: {crAiResult.metrics.moisture} <br />
                            Качество: {crAiResult.metrics.quality}
                          </div>
                        </div>
                      ) : (
                        <div className="text-slate-500 text-[10px] text-center py-10 font-mono">
                          Ожидание снимка стручка ванили...
                        </div>
                      )}
                    </div>
                  </div>
                </div>

              </div>

            </div>

            {/* БЛОК 4. ПАСЕКА И МЕД (Апикультура) */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="text-lg font-bold text-yellow-400 flex items-center gap-2">
                    🐝 Акустический ИИ-мониторинг пасеки (Апикультура)
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">IoT-микрофоны внутри ульев улавливают тональность гула для предотвращения роения пчел</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={handleAcousticDiagnostic}
                    className="bg-slate-950 hover:bg-slate-900 text-yellow-400 border border-yellow-500/30 text-xs font-bold px-4 py-2 rounded-xl transition-all"
                  >
                    Акустическая ИИ-диагностика
                  </button>
                  <button 
                    onClick={handleHoneyCentrifuge}
                    disabled={isCentrifugeActive}
                    className="bg-gradient-to-tr from-amber-500 to-yellow-400 hover:brightness-110 text-slate-950 text-xs font-black px-4 py-2 rounded-xl shadow-lg transition-all"
                  >
                    {isCentrifugeActive ? 'Медогонка активна...' : 'Запустить выкачку меда'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Интерактивный список ульев */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {hives.map(hive => (
                    <div 
                      key={hive.id} 
                      onClick={() => setSelectedHive(hive.id)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                        selectedHive === hive.id 
                          ? 'bg-amber-950/20 border-yellow-400 shadow-md shadow-yellow-400/10' 
                          : 'bg-slate-950 border-slate-850 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-sm text-slate-200">{hive.id}</span>
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                          hive.health.includes('Роение') ? 'bg-rose-500/20 text-rose-400 animate-pulse' : 'bg-emerald-500/20 text-emerald-400'
                        }`}>
                          {hive.health}
                        </span>
                      </div>
                      <ul className="text-xs text-slate-400 space-y-1">
                        <li>Семья: <strong className="text-slate-200">{hive.variety}</strong></li>
                        <li>Частота гула: <strong className="text-yellow-400 font-mono">{hive.freq} Гц</strong></li>
                        <li>Текущий вес: <strong className="text-slate-100 font-mono">{hive.weight}</strong></li>
                      </ul>
                      <div className="w-full bg-slate-900 h-1.5 mt-3 rounded-full overflow-hidden">
                        <div className={`h-full ${hive.health.includes('Роение') ? 'bg-rose-500' : 'bg-yellow-400'}`} style={{ width: hive.id === 'Улей №12' ? '80%' : '95%' }}></div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Выбранный улей и медосбор */}
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-850 flex flex-col justify-between">
                  <div className="text-xs space-y-2">
                    <span className="text-[10px] text-slate-500 uppercase block font-mono">Детализация акустического ИИ</span>
                    <strong className="text-slate-200 text-sm">{selectedHive} — {hives.find(h => h.id === selectedHive)?.variety}</strong>
                    <p className="text-slate-400 leading-relaxed">
                      {selectedHive === 'Улей №12' 
                        ? 'Стабильный спектр частот (180 Гц). Рабочие пчелы активно собирают нектар дикой ванили и арабики. Летная работа в норме.' 
                        : 'Внимание! Фиксируется аномальное повышение звуковой частоты до 245 Гц. Признак деления пчелиной семьи и скорого ухода роя. Требуется установить маточную решетку!'}
                    </p>
                  </div>
                  <div className="border-t border-slate-900 pt-4 flex justify-between items-center text-xs">
                    <span className="text-slate-400">Суммарный собранный мед:</span>
                    <strong className="text-yellow-400 text-lg font-mono">{honeyHarvested} кг</strong>
                  </div>
                </div>

              </div>
            </div>

            {/* БЛОК 5. БЕЗОПАСНОСТЬ И ПЕРИМЕТР (КОСТА-РИКА) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Камера ночного видения с датчиком движения */}
              <div className="lg:col-span-8 bg-slate-900/40 border border-slate-800 p-6 rounded-3xl space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold text-emerald-400 flex items-center gap-2">
                    <Shield className="w-5 h-5 animate-pulse" /> Контур безопасности сушилен и границ леса
                  </h3>
                  <button 
                    onClick={() => {
                      setCrPerimeterArmed(prev => {
                        triggerPush(prev ? '🔓 ОХРАНА ОТКЛЮЧЕНА' : '🔒 ОХРАНА АКТИВИРОВАНА', prev ? 'Камеры периметра переведены в режим сна.' : 'Периметр сушилен и плантации под защитой ИИ-видеоаналитики.', 'warning');
                        return !prev;
                      });
                    }}
                    className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${
                      crPerimeterArmed ? 'bg-emerald-500 text-slate-950 border-emerald-400' : 'bg-slate-950 text-slate-500 border-slate-850'
                    }`}
                  >
                    {crPerimeterArmed ? 'ИИ-Охрана: АКТИВНА' : 'ИИ-Охрана: ВЫКЛ'}
                  </button>
                </div>

                {/* Экран видеопотока с лесной камеры */}
                <div className="h-64 rounded-2xl border border-slate-850 bg-slate-950 relative overflow-hidden flex items-center justify-center">
                  <img 
                    src="https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=800&q=80" // Ночной туманный лес
                    alt="Forest security IR" 
                    className={`w-full h-full object-cover brightness-[0.25] saturate-0 hue-rotate-60 ${crAnimalSimulation ? 'brightness-[0.4]' : ''}`}
                  />
                  <div className="absolute inset-0 bg-green-950/10 pointer-events-none"></div>
                  <span className="absolute top-3 left-3 font-mono text-[9px] text-emerald-400">● FOREST BORDER CAMERA S-09 [IR-ACTIVE]</span>

                  {/* Сетка детекции движения */}
                  <div className="absolute inset-x-0 top-1/2 h-[1px] bg-emerald-500/30 animate-pulse"></div>

                  {crAnimalSimulation && (
                    <div className="absolute bottom-6 right-6 border border-amber-500 bg-slate-950/90 p-3 rounded-lg text-amber-300 font-mono text-[10px] animate-fadeIn shadow-2xl">
                      <div className="font-bold flex items-center gap-1">⚠️ MOTION DETECTED</div>
                      <div>YOLOv8: Tapir (Wild Animal)</div>
                      <div>Confidence: 94%</div>
                      <div>Action: No Alert (Safe Zone)</div>
                    </div>
                  )}
                </div>

                {/* Управление */}
                <div className="flex gap-2">
                  <button 
                    onClick={handleAnimalSimulation}
                    className="flex-1 bg-slate-950 hover:bg-slate-900 text-amber-400 border border-slate-850 font-bold text-xs py-2.5 rounded-xl transition-colors"
                  >
                    Имитировать приближение дикого животного к плантации
                  </button>
                  {crAnimalSimulation && (
                    <button 
                      onClick={() => setCrAnimalSimulation(false)}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-4 rounded-xl"
                    >
                      Сброс
                    </button>
                  )}
                </div>
              </div>

              {/* Правая колонка: Описание ИИ-периметра */}
              <div className="lg:col-span-4 bg-slate-900/40 border border-slate-800 p-6 rounded-3xl space-y-4 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-emerald-400">Сводка угроз периметра</h4>
                  <ul className="space-y-3 text-[11px] text-slate-300 mt-3 font-mono">
                    <li>● Риск лесных пожаров: <span className={crTelemetry.airHumidity < 40 ? 'text-rose-400 animate-pulse font-bold' : 'text-emerald-400'}>{crTelemetry.airHumidity < 40 ? 'КРИТИЧЕСКИЙ (Сухо!)' : 'Низкий'}</span></li>
                    <li>● Сектор сушильни кофе: <span className="text-emerald-400">Под защитой</span></li>
                    <li>● Охрана периметра: <span className="text-emerald-400">Активна</span></li>
                  </ul>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-[10px] leading-relaxed text-slate-400">
                  <strong className="text-emerald-300 block mb-1">🔥 ИИ-Алерты по сушильням:</strong>
                  Влажность воздуха стабильна. Системы пожаротушения сушильных кроватей находятся в дежурном режиме готовности.
                </div>
              </div>

            </div>

            {/* ЛОКАЛЬНЫЙ IoT ЛОГ КОСТА-РИКИ */}
            <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl space-y-4">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" /> Журнал датчиков, орошения и агро-событий Коста-Рики
              </h3>
              <div className="divide-y divide-slate-850 max-h-[200px] overflow-y-auto">
                {securityLog.filter(log => log.farm === 'costarica').map(log => (
                  <div key={log.id} className="py-2.5 text-xs flex justify-between items-center hover:bg-slate-900/20 px-2 transition-all">
                    <span className="font-mono text-slate-500">{log.time}</span>
                    <span className="font-semibold text-emerald-300 ml-4 shrink-0">{log.location}</span>
                    <span className="text-slate-400 font-mono ml-4 flex-1 text-left">{log.event}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                      log.severity === 'high' ? 'bg-rose-500/20 text-rose-400' :
                      log.severity === 'warning' ? 'bg-amber-500/10 text-amber-400' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {log.severity.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </section>
        )}

      </main>

      {/* FOOTER */}
      <footer className={`border-t border-slate-900 mt-12 py-8 text-center text-xs text-slate-500 bg-slate-950 transition-colors duration-500`}>
        <p>© 2026 Eco-Synapse Systems. Разработано для оффлайн-нод Филиппины-Палаван & Коста-Рика.</p>
        <p className="mt-1 font-mono text-[10px] text-teal-500">Autonomous Node ID: NODE-SECURE-ALPHA-01</p>
      </footer>

    </div>
  );
}
