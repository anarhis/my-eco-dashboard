import React, { useState, useEffect } from 'react';
import { 
  Activity, Anchor, Award, Beaker, CloudRain, Compass, Database, Droplet, 
  Eye, Feather, HardDrive, Heart, Home, Layers, MapPin, Navigation, 
  Radio, RefreshCw, Rss, Shield, ShieldAlert, Sun, Thermometer, Trash2, 
  Wind, Zap, CheckSquare, Plus, AlertTriangle, Cpu, Camera, Filter, HardHat,
  Volume2, Wifi, Power, RefreshCw as Loop, Check, Download, AlertOctagon, EyeOff,
  ChevronRight, VolumeX, Flame, Bell, Edit, X
} from 'lucide-react';

// === НАЧАЛЬНЫЕ ЛОКАЛЬНЫЕ ДАННЫЕ ===
const INITIAL_SECURITY_LOG = [
  { id: 1, time: '18:05:12', location: 'Купольная Камера №3 (Палаван)', event: 'YOLOv8: Детекция чужой лодки (бангка) на границе буферной зоны.', severity: 'high', farm: 'palawan' },
  { id: 2, time: '17:44:20', location: 'Сектор А3 (Коста-Рика)', event: 'Капельный полив активирован ИИ. Влажность почвы на 10см упала ниже 45%.', severity: 'info', farm: 'costarica' },
  { id: 3, time: '16:12:05', location: 'Буй №2 (Палаван)', event: 'Гидроакустика зафиксировала винты моторного судна. Направление: Северо-Запад.', severity: 'warning', farm: 'palawan' },
  { id: 4, time: '15:30:10', location: 'Улей №12 (Коста-Рика)', event: 'Акустический датчик: частота гула повысилась до 245Гц. Риск роения!', severity: 'warning', farm: 'costarica' },
];

const INITIAL_RFID_REGISTRY = {
  'RFID-PAL-001': { type: 'Сетка жемчужниц', age: '18 месяцев', lastCleaned: '2026-08-10', density: '45 шт/сетка', species: 'Pinctada maxima', status: 'Норма' },
  'RFID-PAL-002': { type: 'Сетка жемчужниц', age: '24 месяца', lastCleaned: '2026-08-01', density: '40 шт/сетка', species: 'Pinctada maxima', status: 'Срочно требуется чистка (>4 недель)' },
  'RFID-PAL-003': { type: 'Садок с лангустами', age: '8 месяцев', lastCleaned: '2026-08-15', density: '15 шт/садок', species: 'Panulirus ornatus', status: 'Норма' },
};

export default function App() {
  const [activeTab, setActiveTab] = useState('global'); // 'global' | 'palawan' | 'costarica'
  const [timePalawan, setTimePalawan] = useState('');
  const [timeCostaRica, setTimeCostaRica] = useState('');

  // Логирование событий (в реальном времени)
  const [securityLog, setSecurityLog] = useState(INITIAL_SECURITY_LOG);
  const [newAlertMessage, setNewAlertMessage] = useState('');

  // === PUSH УВЕДОМЛЕНИЯ ===
  const [pushNotifications, setPushNotifications] = useState([]);
  const triggerPush = (title, message, type = 'info') => {
    const id = Date.now();
    setPushNotifications(prev => [{ id, title, message, type }, ...prev]);
    setTimeout(() => {
      setPushNotifications(prev => prev.filter(p => p.id !== id));
    }, 5000);
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

  // ==========================================
  // === ФИЛИППИНЫ (ПАЛАВАН) — МОРСКОЕ СОСТОЯНИЕ ===
  // ==========================================
  const [palawanClimate, setPalawanClimate] = useState({
    temp: 28.4,
    do: 6.75,
    pH: 8.15,
    salinity: 34.2,
    turbidity: 12.0, // Мутность воды
    status: 'SECURE', // 'SECURE' | 'WARNING' | 'TYPHOON'
    depth: 2 // Текущая глубина реек (в метрах)
  });

  // Карта длинных линий
  const [longlines, setLonglines] = useState([
    { id: 'Л-1', count: 12, pearls: 480, status: 'Норма', lastCleaned: '3 недели назад' },
    { id: 'Л-2', count: 15, pearls: 600, status: 'Норма', lastCleaned: '2 недели назад' },
    { id: 'Л-3', count: 10, pearls: 400, status: '⚠️ Требуется чистка', lastCleaned: '4+ недели назад' },
    { id: 'Л-4', count: 8, pearls: 320, status: 'Норма', lastCleaned: '1 неделя назад' }
  ]);

  const [rfidSearch, setRfidSearch] = useState('');
  const [scannedItem, setScannedItem] = useState(null);

  // Охрана берега Палавана
  const [poacherAlert, setPoacherAlert] = useState(false);
  const [cameraMode, setCameraMode] = useState('ir'); // 'day' | 'ir' | 'ai'
  const [floodlightOn, setFloodlightOn] = useState(false);

  // ИИ-Калибровка жемчуга и створок
  const [pearlAiType, setPearlAiType] = useState('pearl'); // 'pearl' | 'motherofpearl'
  const [pearlAiAnalyzing, setPearlAiAnalyzing] = useState(false);
  const [pearlAiResult, setPearlAiResult] = useState(null);

  // Состояние ярусов биомассы IMTA
  const [imtaOysters, setImtaOysters] = useState({ growth: '1.2 мм/нед', health: 98, lastMeasure: '2026-08-18' });
  const [imtaLobsters, setImtaLobsters] = useState({ weight: '1.45 кг', feed: '450 г/день', lastFeed: 'Сегодня 08:30' });
  const [imtaCucumber, setImtaCucumber] = useState({ density: '12 шт/м²', weight: '380 г', lastClean: 'Вчера' });

  // Счетчики урожая Палавана
  const [palawanHarvest, setPalawanHarvest] = useState({
    goldPearls: 1420,
    trepang: 840,
    pearlMeat: 2300,
    mopPlates: 450
  });

  // ==========================================
  // === КОСТА-РИКА — АГРОСФЕРА СОСТОЯНИЕ ===
  // ==========================================
  const [crTelemetry, setCrTelemetry] = useState({
    airTemp: 23.4,
    airHumidity: 68.2,
    rain: 12.0,
    soilPh: 6.2,
    soilMoisture10cm: 68.2,
    soilMoisture30cm: 74.5,
    soilMoisture60cm: 81.0,
    status: 'OPTIMAL' // 'OPTIMAL' | 'DRY' | 'FIRE_RISK'
  });

  const [isIrrigationActive, setIsIrrigationActive] = useState(false);
  const [isAiWateringMode, setIsAiWateringMode] = useState(true);

  // Лоты кофе и какао
  const [coffeeBatches, setCoffeeBatches] = useState([
    { id: 'CR-GEO-09', variety: 'Geisha (Анаэробная)', stage: 'Ферментация', hoursLeft: 14, brix: '23%', moisture: '42%', temp: '21.5°C', sealed: true },
    { id: 'CR-SL28-02', variety: 'SL-28 (Спешелти)', stage: 'Сушка на африканских кроватях', daysLeft: 3, brix: '21%', moisture: '14.8%', temp: '24.2°C', sealed: false }
  ]);

  const [coffeeBrixInput, setCoffeeBrixInput] = useState('');
  const [coffeeBrixLogs, setCoffeeBrixLogs] = useState([
    { id: 1, batch: 'CR-GEO-09', brix: '23.4%', time: '15:30' },
    { id: 2, batch: 'CR-SL28-02', brix: '21.1%', time: '11:15' }
  ]);

  // Ваниль
  const [vanillaSectors, setVanillaSectors] = useState([
    { id: 'Сектор А', count: 120, pollinatedToday: 32, status: '85% созревание' },
    { id: 'Сектор B', count: 95, pollinatedToday: 18, status: '40% созревание' }
  ]);
  const [pollinationInput, setPollinationInput] = useState('');
  const [selectedVanillaSector, setSelectedVanillaSector] = useState('Сектор А');

  // ИИ ваниль
  const [vanillaAiAnalyzing, setVanillaAiAnalyzing] = useState(false);
  const [vanillaAiResult, setVanillaAiResult] = useState(null);

  // Пасека и мед
  const [hives, setHives] = useState([
    { id: 'У-12', variety: 'Golden Italian', frequency: 245, health: 68, alert: true, note: 'Критический гул! Риск роения.' },
    { id: 'У-15', variety: 'Carnica Mix', frequency: 165, health: 96, alert: false, note: 'Стабильный гул медосбора.' }
  ]);
  const [honeyHarvestWeight, setHoneyHarvestWeight] = useState(680); // кг меда

  // Охрана периметра Коста-Рика
  const [wildlifeAlert, setWildlifeAlert] = useState(false);
  const [wildlifeTarget, setWildlifeTarget] = useState('');

  // Состояния для работы Административной Панели
  const [adminSelectedTable, setAdminSelectedTable] = useState('longlines'); // 'longlines' | 'coffee' | 'vanilla' | 'hives' | 'logs'
  const [adminEditingItem, setAdminEditingItem] = useState(null); 
  const [adminForm, setAdminForm] = useState({}); 
  const [isAdminFormOpen, setIsAdminFormOpen] = useState(false);

  // ==========================================
  // === ЭФФЕКТЫ И ЧАСЫ РЕАЛЬНОГО ВРЕМЕНИ ===
  // ==========================================
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

  // Имитация датчиков
  useEffect(() => {
    const telemetryInterval = setInterval(() => {
      // Филиппины
      setPalawanClimate(prev => {
        if (prev.status === 'TYPHOON') return prev; // При тайфуне держим критические показатели до ручного вмешательства
        return {
          ...prev,
          temp: parseFloat((prev.temp + (Math.random() - 0.5) * 0.1).toFixed(2)),
          pH: parseFloat((prev.pH + (Math.random() - 0.5) * 0.02).toFixed(2)),
          do: parseFloat((prev.do + (Math.random() - 0.5) * 0.05).toFixed(2)),
          salinity: parseFloat((prev.salinity + (Math.random() - 0.5) * 0.05).toFixed(2)),
          turbidity: parseFloat((prev.turbidity + (Math.random() - 0.5) * 0.2).toFixed(1))
        };
      });

      // Коста-Рика
      setCrTelemetry(prev => {
        const isWatering = isIrrigationActive;
        const drip = isWatering ? 1.5 : (Math.random() - 0.6) * 0.5;
        const newSoil = Math.min(100, Math.max(0, parseFloat((prev.soilMoisture10cm + drip).toFixed(1))));
        return {
          ...prev,
          airTemp: parseFloat((prev.airTemp + (Math.random() - 0.5) * 0.1).toFixed(1)),
          airHumidity: parseFloat((prev.airHumidity + (Math.random() - 0.5) * 0.2).toFixed(1)),
          soilMoisture10cm: newSoil,
          soilMoisture30cm: parseFloat((prev.soilMoisture30cm + (isWatering ? 0.4 : -0.1)).toFixed(1)),
          soilMoisture60cm: parseFloat((prev.soilMoisture60cm + (isWatering ? 0.1 : -0.05)).toFixed(1))
        };
      });
    }, 4000);

    return () => clearInterval(telemetryInterval);
  }, [isIrrigationActive]);

  // ==========================================
  // === КНОПКИ УПРАВЛЕНИЯ ФИЛИППИНЫ (ПАЛАВАН) ===
  // ==========================================

  // 1. Имитация ночного вторжения браконьеров
  const handleTriggerPoacher = () => {
    setPoacherAlert(true);
    setCameraMode('ai');
    triggerPush('🚨 ВТОРЖЕНИЕ В ЛАГУНУ!', 'Обнаружена неопознанная лодка браконьеров (бангка) в секторе Юг. Активированы сирена и прожекторы!', 'error');
    addLog('Береговая охрана', 'YOLOv8: ЦЕЛЬ ОБНАРУЖЕНА. Запущена сирена, прожекторы вышки №2 направлены на плавсредство.', 'high', 'palawan');
    setFloodlightOn(true);
  };

  const handleResetPoacher = () => {
    setPoacherAlert(false);
    setFloodlightOn(false);
    triggerPush('✅ ОХРАНА СБРОШЕНА', 'Угроза ликвидирована. Охрана переведена в штатный режим.', 'success');
    addLog('Береговая охрана', 'Тревога сброшена дежурным оператором. Сирена отключена.', 'info', 'palawan');
  };

  // 2. Симуляция Тайфуна
  const handleTriggerTyphoon = () => {
    setPalawanClimate(prev => ({
      ...prev,
      temp: 24.2,
      do: 4.10,
      pH: 7.65,
      salinity: 22.1, // Опасное падение солености
      turbidity: 48.5, // Мутность зашкаливает
      status: 'TYPHOON'
    }));
    triggerPush('⛈️ КРИТИЧЕСКИЙ ТАЙФУН!', 'Падение солености воды до 22.1‰! Риск замора жемчужниц. Требуется срочное заглубление реек!', 'error');
    addLog('Экологический мониторинг', 'Аварийное опреснение и замутнение лагуны после проливных дождей тайфуна.', 'high', 'palawan');
  };

  // 3. Затопить глубже (на 8м)
  const handleSinkLines = () => {
    setPalawanClimate(prev => ({
      ...prev,
      depth: 8,
      salinity: 31.8, // На глубине соленость выше и безопаснее
      do: 5.9,
      status: 'SECURE'
    }));
    triggerPush('⚓ ЗАГЛУБЛЕНИЕ ВЫПОЛНЕНО', 'Рейки с жемчужницами затоплены на глубину 8м. Угроза осмотического шока снята.', 'success');
    addLog('Управление лонглайнами', 'Все 4 длинные линии успешно затоплены на безопасную глубину 8 метров.', 'info', 'palawan');
  };

  // 4. Поднять для обмыва
  const handleLiftLines = () => {
    setPalawanClimate(prev => ({
      ...prev,
      depth: 0.5,
      status: 'SECURE'
    }));
    triggerPush('🧹 ПОДЪЕМ НА ОБМЫВ', 'Рейки подняты до уровня 0.5м для очистки от наростов водорослей и паразитов.', 'info');
    addLog('Управление лонглайнами', 'Рейки подняты на техническую высоту 0.5 метра для обслуживания рабочими.', 'info', 'palawan');
  };

  // 5. Восстановить климат
  const handleResetPalawanClimate = () => {
    setPalawanClimate({
      temp: 28.4,
      do: 6.75,
      pH: 8.15,
      salinity: 34.2,
      turbidity: 12.0,
      status: 'SECURE',
      depth: 2
    });
    addLog('Экологический мониторинг', 'Показатели воды лагуны сброшены в штатные значения.', 'info', 'palawan');
  };

  // 6. RFID Сканирование
  const handleRfidScan = (e) => {
    e.preventDefault();
    const code = rfidSearch.trim().toUpperCase();
    if (INITIAL_RFID_REGISTRY[code]) {
      const item = INITIAL_RFID_REGISTRY[code];
      setScannedItem({ code, ...item });
      if (code === 'RFID-PAL-002') {
        // Очищаем Линию Л-3
        setLonglines(prev => prev.map(line => line.id === 'Л-3' ? { ...line, status: 'Норма', lastCleaned: 'Только что очищено' } : line));
        triggerPush('🏷️ RFID: ЛИНИЯ Л-3 ОЧИЩЕНА', 'Статус линии обновлен в базе данных IndexedDB. Предупреждение снято.', 'success');
        addLog('Рабочий терминал RFID', 'Сканирование RFID-PAL-002: завершены работы по чистке устриц на Линии Л-3.', 'info', 'palawan');
      } else {
        triggerPush('🏷️ RFID: СКАН УСПЕШЕН', `Распознано: ${item.type}. Состояние нормальное.`, 'info');
      }
    } else {
      setScannedItem({ error: 'Метка не зарегистрирована в базе данных IndexedDB!' });
      triggerPush('❌ ОШИБКА RFID', 'Неизвестная метка.', 'error');
    }
  };

  // 7. ИИ Сортировка Жемчуга
  const handlePearlAiAnalysis = () => {
    setPearlAiAnalyzing(true);
    setPearlAiResult(null);
    setTimeout(() => {
      setPearlAiAnalyzing(false);
      if (pearlAiType === 'pearl') {
        setPearlAiResult({
          title: 'Оценка Золотого Жемчуга South Sea Gold',
          metrics: [
            { label: 'Диаметр (Размер)', val: '14.85 мм (Премиум)' },
            { label: 'Форма', val: 'Сферическая 99.1% (Идеал)' },
            { label: 'Золотой цвет', val: '24K Intense Gold (AAA)' },
            { label: 'Чистота поверхности', val: '98.5% Без дефектов' },
            { label: 'Блеск (Luster)', val: 'Зеркальный зеркальный блеск' }
          ],
          verdict: '🏆 GEM-КАТЕГОРИЯ (Класс AAA) — Направлено в премиальный ювелирный фонд бренда Eco-Synapse.'
        });
        setPalawanHarvest(prev => ({ ...prev, goldPearls: prev.goldPearls + 1 }));
        addLog('ИИ Сортировка Жемчуга', 'Проведен анализ макро-фотографии устричного жемчуга. Вердикт: Идеальная сфера AAA.', 'info', 'palawan');
      } else {
        setPearlAiResult({
          title: 'Анализ Створок Раковины Pinctada Maxima',
          metrics: [
            { label: 'Ширина створки', val: '22.4 см (Мощный размер)' },
            { label: 'Качество перламутра', val: 'Монолитный перламутровый слой без сколов' },
            { label: 'Толщина', val: '8.4 мм' }
          ],
          verdict: '🍽️ ПРЕМИУМ-МОНОЛИТ — Передать ювелирным дизайнерам для вырезки фирменных икорных ложек и тарелок бренда.'
        });
        setPalawanHarvest(prev => ({ ...prev, mopPlates: prev.mopPlates + 1 }));
        addLog('ИИ Сортировка Раковин', 'Просканирована створка Pinctada Maxima. Рекомендована для премиум-дизайна посуды.', 'info', 'palawan');
      }
    }, 1800);
  };


  // ==========================================
  // === КНОПКИ УПРАВЛЕНИЯ КОСТА-РИКА ===
  // ==========================================

  // 1. Ручной запуск капельного полива
  const handleToggleIrrigation = () => {
    setIsIrrigationActive(prev => {
      const next = !prev;
      if (next) {
        triggerPush('💧 ПОЛИВ АКТИВИРОВАН', 'Капельные форсунки на секциях Кофе Восток и Запад запущены. Влажность почвы начала расти.', 'info');
        addLog('Автополив', 'Запущен ручной режим капельного орошения плантаций кофе.', 'info', 'costarica');
      } else {
        triggerPush('⏹️ ПОЛИВ ОТКЛЮЧЕН', 'Капельный полив плантаций переведен в дежурный автоматический режим.', 'info');
        addLog('Автополив', 'Капельное орошение плантаций остановлено оператором.', 'info', 'costarica');
      }
      return next;
    });
  };

  // 2. Симуляция лесного пожара / засухи
  const handleTriggerDrought = () => {
    setCrTelemetry(prev => ({
      ...prev,
      soilMoisture10cm: 28.5,
      soilMoisture30cm: 41.2,
      airHumidity: 18.4,
      airTemp: 34.5,
      status: 'FIRE_RISK'
    }));
    triggerPush('🚨 КРИТИЧЕСКАЯ ЗАСУХА!', 'Влажность воздуха упала до 18.4%! Риск возгорания сушилен кофе. Сенсоры периметра приведены в боевую готовность!', 'error');
    addLog('Климатическая станция', 'Внимание! Зафиксировано критическое падение влажности и перегрев воздуха. Высокий риск пожара!', 'high', 'costarica');
  };

  const handleResetCrClimate = () => {
    setCrTelemetry({
      airTemp: 23.4,
      airHumidity: 68.2,
      rain: 12.0,
      soilPh: 6.2,
      soilMoisture10cm: 68.2,
      soilMoisture30cm: 74.5,
      soilMoisture60cm: 81.0,
      status: 'OPTIMAL'
    });
    triggerPush('✅ КЛИМАТ ВОССТАНОВЛЕН', 'Показатели плантации сброшены к нормальным утренним средним.', 'success');
    addLog('Климатическая станция', 'Показатели микроклимата возвращены в оптимальные рамки.', 'info', 'costarica');
  };

  // 3. Ручной ввод BRIX
  const handleAddBrixLog = (e) => {
    e.preventDefault();
    const val = parseFloat(coffeeBrixInput);
    if (!val || isNaN(val)) return;
    const newLog = {
      id: Date.now(),
      batch: 'CR-GEO-09',
      brix: `${val}%`,
      time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
    };
    setCoffeeBrixLogs(prev => [newLog, ...prev]);
    setCoffeeBrixInput('');
    triggerPush('☕ BRIX ЗАФИКСИРОВАН', `Показатель спелости лота CR-GEO-09 занесен в лог: ${val}% sugar.`, 'success');
    addLog('Лаборатория кофе', `Вручную внесен показатель BRIX для лота CR-GEO-09 перед сбором урожая: ${val}%.`, 'info', 'costarica');
  };

  // 4. Герметизация анаэробного бака ферментации
  const handleToggleFermentationSeal = (id) => {
    setCoffeeBatches(prev => prev.map(b => {
      if (b.id === id) {
        const nextSealed = !b.sealed;
        triggerPush(nextSealed ? '🔒 БАК ГЕРМЕТИЗИРОВАН' : '🔓 БАК РАЗГЕРМЕТИЗИРОВАН', nextSealed ? 'Анаэробные клапаны закрыты. Давление стабильное.' : 'Анаэробный бак открыт. Кофе слит на промыв.', 'info');
        addLog('Анаэробный цех', nextSealed ? `Бак кофе ${id} герметично закрыт. Контроль CO2 активен.` : `Бак кофе ${id} разгерметизирован для промывки ягод.`, 'info', 'costarica');
        return { ...b, sealed: nextSealed, stage: nextSealed ? 'Ферментация (Анаэробная)' : 'Промывка зерен' };
      }
      return b;
    }));
  };

  // 5. Контроль сушки (ИИ-график влажности)
  const handleTriggerDryingScan = () => {
    setCoffeeBatches(prev => prev.map(b => {
      if (b.id === 'CR-SL28-02') {
        triggerPush('📊 ИИ-АНАЛИЗ СУШКИ', 'Анализ кривой падения влажности зерна. Влажность достигла идеальных 11.2%! Рекомендована затарка в мешки.', 'success');
        addLog('Сушильный цех', 'ИИ-анализ влажности: достигнут целевой порог 11.2% для лота CR-SL28-02. Запуск упаковочной линии.', 'info', 'costarica');
        return { ...b, moisture: '11.2% (Готово)', stage: 'Упаковка в GrainPro' };
      }
      return b;
    }));
  };

  // 6. Запись ручного опыления ванили
  const handleAddVanillaPollination = (e) => {
    e.preventDefault();
    const qty = parseInt(pollinationInput);
    if (!qty || isNaN(qty)) return;

    setVanillaSectors(prev => prev.map(sec => 
      sec.id === selectedVanillaSector 
        ? { ...sec, pollinatedToday: sec.pollinatedToday + qty } 
        : sec
    ));
    setPollinationInput('');
    triggerPush('🌸 ВАНИЛЬ ОПЫЛЕНА', `В ${selectedVanillaSector} успешно добавлено ${qty} опыленных цветков.`, 'success');
    addLog('Сады Ванили', `Рабочий внес запись: опылено +${qty} лиан ванили в ${selectedVanillaSector}.`, 'info', 'costarica');
  };

  // 7. ИИ Сортировка Стручков Ванили
  const handleVanillaAiAnalysis = () => {
    setVanillaAiAnalyzing(true);
    setVanillaAiResult(null);
    setTimeout(() => {
      setVanillaAiAnalyzing(false);
      const verdicts = [
        { grade: 'Grade A (Экспортный премиум)', desc: 'Длина стручка 18.5 см. Глянцевый маслянистый блеск, отсутствие расщеплений.', action: 'Направить на медленную теневую ферментацию под собственный бренд.' },
        { grade: 'Короткий/Расщепленный класс', desc: 'Длина стручка 11.2 см. Небольшие трещины на кончике.', action: 'Отправить в переработку на органический жидкий ванильный экстракт.' }
      ];
      const res = verdicts[Math.floor(Math.random() * verdicts.length)];
      setVanillaAiResult(res);
      addLog('ИИ Сортировка Ванили', `Проведен анализ длины стручка ванили. Результат: ${res.grade}.`, 'info', 'costarica');
    }, 1500);
  };

  // 8. Акустическая диагностика ульев
  const handleAcousticTherapy = () => {
    setHives(prev => prev.map(hive => {
      if (hive.id === 'У-12') {
        triggerPush('🐝 ИИ-АКУСТИЧЕСКОЕ ПОДАВЛЕНИЕ', 'Подан успокаивающий противочастотный белый шум ИИ. Частота упала с 245Гц до 165Гц. Семья вернулась к работе.', 'success');
        addLog('Апикультура Пасека', 'Акустическая терапия улья У-12: частота роения успешно погашена противовибрационным генератором.', 'info', 'costarica');
        return { ...hive, frequency: 165, health: 95, alert: false, note: 'Стабильный гул медосбора после ИИ-терапии.' };
      }
      return hive;
    }));
  };

  // 9. Запустить выкачку меда
  const handleHoneyHarvest = () => {
    setHoneyHarvestWeight(prev => prev + 24);
    triggerPush('🍯 ВЫКАЧКА МЕДА ВЫПОЛНЕНА', 'Сняты рамки со зрелым ванильно-кофейным медом. База данных IndexedDB обновила общий вес меда (+24 кг).', 'success');
    addLog('Медовый цех', 'Плановая выкачка меда: ульи У-15 разгружены. Собрано 24 кг дикого горного меда.', 'info', 'costarica');
  };

  // 10. Имитация движения диких животных на границе леса
  const handleAnimalSimulation = () => {
    setWildlifeAlert(true);
    const animals = ['Тапир', 'Ягуар', 'Гигантский броненосец'];
    const chosen = animals[Math.floor(Math.random() * animals.length)];
    setWildlifeTarget(chosen);
    triggerPush('🐆 ДВИЖЕНИЕ НА ПЕРИМЕТРЕ!', `ИК-Камера зафиксировала движение на границе леса. YOLOv8: ОБНАРУЖЕН ${chosen.toUpperCase()}!`, 'warning');
    addLog('Охрана периметра', `Камера ИК-4: Распознан движущийся объект: ${chosen} (уверенность 94.2%). Безопасная граница не нарушена.`, 'info', 'costarica');
  };

  const handleResetWildlife = () => {
    setWildlifeAlert(false);
    triggerPush('✅ ПЕРИМЕТР ЧИСТ', 'Камеры ночного видения переведены в штатный режим ожидания.', 'info');
  };

  // === ФУНКЦИОНАЛ АДМИН-ПАНЕЛИ (СУБ-БД) ===
  const handleAdminEditClick = (item) => {
    setAdminEditingItem(item);
    setAdminForm({ ...item });
    setIsAdminFormOpen(true);
  };

  const handleAdminAddClick = () => {
    setAdminEditingItem(null);
    if (adminSelectedTable === 'longlines') {
      setAdminForm({ id: `Л-${longlines.length + 1}`, count: 12, pearls: 480, status: 'Норма', lastCleaned: '3 недели назад', fill: 80 });
    } else if (adminSelectedTable === 'coffee') {
      setAdminForm({ id: `CR-BATCH-${coffeeBatches.length + 1}`, variety: 'Catuai', stage: 'Ферментация', hoursLeft: 24, brix: '21%', moisture: '12.5%', temp: '22.0°C', sealed: false });
    } else if (adminSelectedTable === 'vanilla') {
      setAdminForm({ id: `Сектор ${String.fromCharCode(65 + vanillaSectors.length)}`, count: 100, pollinatedToday: 0, status: 'Рост стручков' });
    } else if (adminSelectedTable === 'hives') {
      setAdminForm({ id: `У-${hives.length + 12}`, variety: 'Italian Buckfast', frequency: 180, health: 90, alert: false, note: 'Стабильный гул.' });
    } else if (adminSelectedTable === 'logs') {
      setAdminForm({ id: Date.now(), time: new Date().toLocaleTimeString('ru-RU'), location: 'Ручной ввод', event: 'Кастомное событие БД', severity: 'info', farm: 'palawan' });
    }
    setIsAdminFormOpen(true);
  };

  const handleAdminSave = (e) => {
    e.preventDefault();
    const table = adminSelectedTable;
    const isEdit = adminEditingItem !== null;

    if (table === 'longlines') {
      if (isEdit) {
        setLonglines(prev => prev.map(item => item.id === adminEditingItem.id ? { ...adminForm, count: parseInt(adminForm.count) || 0, pearls: parseInt(adminForm.pearls) || 0, fill: parseInt(adminForm.fill) || 0 } : item));
        triggerPush('БД ОБНОВЛЕНА', `Длинная линия ${adminForm.id} успешно изменена в локальной БД.`, 'success');
      } else {
        if (longlines.some(l => l.id === adminForm.id)) {
          alert('ID Линии уже существует!');
          return;
        }
        setLonglines(prev => [...prev, { ...adminForm, count: parseInt(adminForm.count) || 0, pearls: parseInt(adminForm.pearls) || 0, fill: parseInt(adminForm.fill) || 0 }]);
        triggerPush('БД ОБНОВЛЕНА', `Создана новая линия ${adminForm.id} в локальной БД.`, 'success');
      }
    } else if (table === 'coffee') {
      if (isEdit) {
        setCoffeeBatches(prev => prev.map(item => item.id === adminEditingItem.id ? { ...adminForm } : item));
        triggerPush('БД ОБНОВЛЕНА', `Лот кофе ${adminForm.id} успешно обновлен.`, 'success');
      } else {
        if (coffeeBatches.some(c => c.id === adminForm.id)) {
          alert('ID Лота уже существует!');
          return;
        }
        setCoffeeBatches(prev => [...prev, { ...adminForm }]);
        triggerPush('БД ОБНОВЛЕНА', `Создан новый лот кофе ${adminForm.id}.`, 'success');
      }
    } else if (table === 'vanilla') {
      if (isEdit) {
        setVanillaSectors(prev => prev.map(item => item.id === adminEditingItem.id ? { ...adminForm, count: parseInt(adminForm.count) || 0, pollinatedToday: parseInt(adminForm.pollinatedToday) || 0 } : item));
        triggerPush('БД ОБНОВЛЕНА', `Сектор ванили ${adminForm.id} успешно изменен.`, 'success');
      } else {
        if (vanillaSectors.some(v => v.id === adminForm.id)) {
          alert('Сектор с таким ID уже существует!');
          return;
        }
        setVanillaSectors(prev => [...prev, { ...adminForm, count: parseInt(adminForm.count) || 0, pollinatedToday: parseInt(adminForm.pollinatedToday) || 0 }]);
        triggerPush('БД ОБНОВЛЕНА', `Добавлен новый сектор ванили ${adminForm.id}.`, 'success');
      }
    } else if (table === 'hives') {
      if (isEdit) {
        setHives(prev => prev.map(item => item.id === adminEditingItem.id ? { ...adminForm, frequency: parseInt(adminForm.frequency) || 0, health: parseInt(adminForm.health) || 0 } : item));
        triggerPush('БД ОБНОВЛЕНА', `Улей ${adminForm.id} успешно отредактирован.`, 'success');
      } else {
        if (hives.some(h => h.id === adminForm.id)) {
          alert('Улей с таким ID уже существует!');
          return;
        }
        setHives(prev => [...prev, { ...adminForm, frequency: parseInt(adminForm.frequency) || 0, health: parseInt(adminForm.health) || 0 }]);
        triggerPush('БД ОБНОВЛЕНА', `Новый улей ${adminForm.id} добавлен на пасеку.`, 'success');
      }
    } else if (table === 'logs') {
      if (isEdit) {
        setSecurityLog(prev => prev.map(item => item.id === adminEditingItem.id ? { ...adminForm } : item));
      } else {
        setSecurityLog(prev => [{ ...adminForm, id: Date.now() }, ...prev]);
      }
      triggerPush('БД ОБНОВЛЕНА', 'Журнал событий успешно обновлен.', 'success');
    }

    setIsAdminFormOpen(false);
    setAdminEditingItem(null);
  };

  const handleAdminDelete = (id) => {
    const table = adminSelectedTable;
    if (table === 'longlines') {
      setLonglines(prev => prev.filter(item => item.id !== id));
      triggerPush('БД ОБНОВЛЕНА', `Линия ${id} удалена из базы данных.`, 'warning');
    } else if (table === 'coffee') {
      setCoffeeBatches(prev => prev.filter(item => item.id !== id));
      triggerPush('БД ОБНОВЛЕНА', `Лот кофе ${id} удален из базы данных.`, 'warning');
    } else if (table === 'vanilla') {
      setVanillaSectors(prev => prev.filter(item => item.id !== id));
      triggerPush('БД ОБНОВЛЕНА', `Сектор ванили ${id} удален.`, 'warning');
    } else if (table === 'hives') {
      setHives(prev => prev.filter(item => item.id !== id));
      triggerPush('БД ОБНОВЛЕНА', `Улей ${id} удален с пасеки.`, 'warning');
    } else if (table === 'logs') {
      setSecurityLog(prev => prev.filter(item => item.id !== id));
      triggerPush('БД ОБНОВЛЕНА', `Запись лога удалена.`, 'warning');
    }
  };

  const handleResetToDefaults = () => {
    if (window.confirm('Вы действительно хотите сбросить всю базу данных к исходным значениям?')) {
      setLonglines([
        { id: 'Л-1', count: 12, pearls: 480, status: 'Норма', lastCleaned: '3 недели назад' },
        { id: 'Л-2', count: 15, pearls: 600, status: 'Норма', lastCleaned: '2 недели назад' },
        { id: 'Л-3', count: 10, pearls: 400, status: '⚠️ Требуется чистка', lastCleaned: '4+ недели назад' },
        { id: 'Л-4', count: 8, pearls: 320, status: 'Норма', lastCleaned: '1 неделя назад' }
      ]);
      setCoffeeBatches([
        { id: 'CR-GEO-09', variety: 'Geisha (Анаэробная)', stage: 'Ферментация', hoursLeft: 14, brix: '23%', moisture: '42%', temp: '21.5°C', sealed: true },
        { id: 'CR-SL28-02', variety: 'SL-28 (Спешелти)', stage: 'Сушка на африканских кроватях', daysLeft: 3, brix: '21%', moisture: '14.8%', temp: '24.2°C', sealed: false }
      ]);
      setVanillaSectors([
        { id: 'Сектор А', count: 120, pollinatedToday: 32, status: '85% созревание' },
        { id: 'Сектор B', count: 95, pollinatedToday: 18, status: '40% созревание' }
      ]);
      setHives([
        { id: 'У-12', variety: 'Golden Italian', frequency: 245, health: 68, alert: true, note: 'Критический гул! Риск роения.' },
        { id: 'У-15', variety: 'Carnica Mix', frequency: 165, health: 96, alert: false, note: 'Стабильный гул медосбора.' }
      ]);
      setSecurityLog(INITIAL_SECURITY_LOG);
      triggerPush('БД СБРОШЕНА', 'Все локальные таблицы успешно перезаписаны дефолтными значениями.', 'info');
    }
  };


  // ==========================================
  // === ОПРЕДЕЛЕНИЕ ТЕМ И ЦВЕТОВ НА ЛЕТУ ===
  // ==========================================
  const isPalawan = activeTab === 'palawan';
  const isCostaRica = activeTab === 'costarica';
  const isGlobal = activeTab === 'global';
  const isAdmin = activeTab === 'admin';

  const brandColorClass = isPalawan ? 'text-cyan-400' : isCostaRica ? 'text-emerald-400' : isAdmin ? 'text-violet-400' : 'text-teal-400';
  const brandBorderClass = isPalawan ? 'border-cyan-500/30' : isCostaRica ? 'border-emerald-500/30' : isAdmin ? 'border-violet-500/30' : 'border-teal-500/30';
  const brandBgButtonClass = isPalawan ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950' : isCostaRica ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950' : isAdmin ? 'bg-violet-600 hover:bg-violet-500 text-white shadow-[0_0_15px_rgba(139,92,246,0.4)]' : 'bg-teal-500 hover:bg-teal-400 text-slate-950';

  const getDynamicBg = () => {
    const overlays = "linear-gradient(to bottom, rgba(2, 6, 23, 0.90), rgba(2, 6, 23, 0.98))";
    let imgUrl = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=80"; // Космическая High-tech Grid
    if (isPalawan) {
      imgUrl = "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1600&q=80"; // Бирюзовая глубокая лагуна Филиппин
    } else if (isCostaRica) {
      imgUrl = "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=1600&q=80"; // Джунгли в облаках Монтеверде
    } else if (isAdmin) {
      imgUrl = "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1600&q=80"; // Фиолетовый серверный зал для админа
    }
    return {
      backgroundImage: `${overlays}, url('${imgUrl}')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed'
    };
  };

  return (
    <div style={getDynamicBg()} className="min-h-screen text-slate-100 font-sans transition-all duration-1000 ease-in-out pb-12">
      
      {/* ========================================== */}
      {/* === ВСПЛЫВАЮЩИЕ PUSH-УВЕДОМЛЕНИЯ === */}
      {/* ========================================== */}
      <div className="fixed top-20 right-4 z-50 space-y-2 max-w-sm w-full">
        {pushNotifications.map(push => (
          <div 
            key={push.id} 
            className={`p-4 rounded-xl shadow-2xl border flex items-start gap-3 animate-slideIn backdrop-blur-md ${
              push.type === 'error' ? 'bg-rose-950/85 border-rose-500/50 text-rose-200 shadow-rose-500/15' :
              push.type === 'success' ? 'bg-emerald-950/85 border-emerald-500/50 text-emerald-200' :
              'bg-slate-900/85 border-slate-700/50 text-slate-200'
            }`}
          >
            <div className="p-1 bg-white/10 rounded">
              {push.type === 'error' ? <AlertOctagon className="w-5 h-5 text-rose-400 animate-pulse" /> : <Bell className="w-5 h-5 text-emerald-400" />}
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-xs font-mono uppercase">{push.title}</h4>
              <p className="text-[11px] text-slate-300 mt-1">{push.message}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ========================================== */}
      {/* === HEADER / ШАПКА === */}
      {/* ========================================== */}
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md px-4 py-3 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl text-slate-950 shadow-[0_0_15px_rgba(20,184,166,0.3)] ${
            isPalawan ? 'bg-cyan-400 shadow-cyan-400/30' : isCostaRica ? 'bg-emerald-400 shadow-emerald-400/30' : 'bg-teal-400 shadow-teal-400/30'
          }`}>
            <Cpu className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-wider bg-gradient-to-r from-teal-400 via-emerald-400 to-amber-300 bg-clip-text text-transparent">
              ECO-SYNAPSE PWA
            </h1>
            <p className="text-[10px] text-slate-400 font-mono">Autonomous Bi-Farm Controller [v2.0-offline]</p>
          </div>
        </div>

        {/* НАВИГАЦИОННЫЙ ПЕРЕКЛЮЧАТЕЛЬ */}
        <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-xl w-full sm:w-auto">
          <button 
            onClick={() => setActiveTab('global')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all duration-300 ${isGlobal ? 'bg-slate-800 text-teal-400 shadow-sm border border-slate-700/50' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Home className="w-3.5 h-3.5" />
            Глобальный Обзор
          </button>
          <button 
            onClick={() => setActiveTab('palawan')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all duration-300 ${isPalawan ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(34,211,238,0.4)] font-bold' : 'text-slate-400 hover:text-cyan-400'}`}
          >
            <Anchor className="w-3.5 h-3.5" />
            Ферма 1: Филиппины (Палаван)
          </button>
          <button 
            onClick={() => setActiveTab('costarica')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all duration-300 ${isCostaRica ? 'bg-emerald-500 text-slate-950 shadow-[0_0_12px_rgba(16,185,129,0.4)] font-bold' : 'text-slate-400 hover:text-emerald-400'}`}
          >
            <Feather className="w-3.5 h-3.5" />
            Ферма 2: Коста-Рика (Агро)
          </button>
          <button 
            onClick={() => setActiveTab('admin')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all duration-300 ${isAdmin ? 'bg-violet-600 text-white shadow-[0_0_12px_rgba(139,92,246,0.4)] font-bold' : 'text-slate-400 hover:text-violet-400'}`}
          >
            <Database className="w-3.5 h-3.5" />
            Управление БД (Админ)
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

        {/* КАРТОЧКА ПОДДЕРЖКИ PWA */}
        <div className={`bg-gradient-to-r ${isPalawan ? 'from-cyan-500/10 via-sky-500/5 to-slate-950' : isCostaRica ? 'from-emerald-500/10 via-green-500/5 to-slate-950' : 'from-teal-500/10 via-emerald-500/5 to-slate-950'} border ${brandBorderClass} p-4 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4`}>
          <div className="flex gap-3">
            <div className={`p-2 bg-slate-900/80 rounded-xl ${brandColorClass}`}>
              <Zap className="w-5 h-5 animate-bounce" style={{ animationDuration: '3s' }} />
            </div>
            <div>
              <h3 className="font-bold text-sm">Автономный дашборд PWA активен [Связь зашифрована]</h3>
              <p className="text-xs text-slate-400 mt-0.5">Вся статистика сохраняется в IndexedDB на вашем устройстве и синхронизируется при возобновлении связи.</p>
            </div>
          </div>
          <button className={`px-4 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${brandBgButtonClass}`}>
            Установить как PWA
          </button>
        </div>

        {/* ======================================================= */}
        {/* === ЭКРАН 1: ГЛОБАЛЬНЫЙ ОБЗОР (SIDE-BY-SIDE + LOGS) === */}
        {/* ======================================================= */}
        {isGlobal && (
          <div className="space-y-8 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* СВОДКА ПАЛАВАН */}
              <div className="relative overflow-hidden rounded-3xl bg-slate-900/40 border border-cyan-500/20 p-6 shadow-xl backdrop-blur-md">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-xs font-bold uppercase text-cyan-400 font-mono">Ферма 1 • Филиппины</span>
                    <h2 className="text-2xl font-black text-slate-100 mt-0.5">Палаван</h2>
                    <p className="text-xs text-slate-400">Морская IMTA Аквакультура</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-mono font-bold tracking-wider text-slate-100">{timePalawan || '--:--:--'}</p>
                    <p className="text-[10px] text-slate-400 font-mono">GMT+8 (UTC+8)</p>
                  </div>
                </div>
                {/* Картинка-заглушка океана */}
                <div className="h-32 rounded-xl overflow-hidden mb-4 relative border border-slate-800">
                  <img src="https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80" alt="Palawan" className="w-full h-full object-cover brightness-75" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent"></div>
                  <span className="absolute bottom-2 left-2 text-[10px] bg-slate-950/90 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded-lg font-mono">Pearl Lagoon Monitor</span>
                </div>
                {/* Метрики короткие */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-850">
                    <span className="text-slate-400 block text-[10px]">Темп. воды</span>
                    <strong className="text-cyan-300 font-mono">{palawanClimate.temp}°C</strong>
                  </div>
                  <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-850">
                    <span className="text-slate-400 block text-[10px]">Соленость</span>
                    <strong className="text-cyan-300 font-mono">{palawanClimate.salinity}‰</strong>
                  </div>
                  <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-850">
                    <span className="text-slate-400 block text-[10px]">Статус ИИ</span>
                    <strong className={`font-mono ${palawanClimate.status === 'TYPHOON' ? 'text-rose-400' : 'text-emerald-400'}`}>{palawanClimate.status}</strong>
                  </div>
                </div>
                <button onClick={() => setActiveTab('palawan')} className="w-full mt-4 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-cyan-400 text-xs font-bold py-2.5 rounded-xl transition-colors">
                  Открыть консоль Палавана →
                </button>
              </div>

              {/* СВОДКА КОСТА-РИКА */}
              <div className="relative overflow-hidden rounded-3xl bg-slate-900/40 border border-emerald-500/20 p-6 shadow-xl backdrop-blur-md">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-xs font-bold uppercase text-emerald-400 font-mono">Ферма 2 • Коста-Рика</span>
                    <h2 className="text-2xl font-black text-slate-100 mt-0.5">Монтеверде</h2>
                    <p className="text-xs text-slate-400">Высокогорная Пермакультура</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-mono font-bold tracking-wider text-slate-100">{timeCostaRica || '--:--:--'}</p>
                    <p className="text-[10px] text-slate-400 font-mono">GMT-6 (UTC-6)</p>
                  </div>
                </div>
                {/* Картинка-заглушка кофе */}
                <div className="h-32 rounded-xl overflow-hidden mb-4 relative border border-slate-800">
                  <img src="https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80" alt="Coffee" className="w-full h-full object-cover brightness-75" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent"></div>
                  <span className="absolute bottom-2 left-2 text-[10px] bg-slate-950/90 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-lg font-mono">Coffee & Apiculture Area</span>
                </div>
                {/* Метрики короткие */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-850">
                    <span className="text-slate-400 block text-[10px]">Влажность почвы</span>
                    <strong className="text-emerald-300 font-mono">{crTelemetry.soilMoisture10cm}%</strong>
                  </div>
                  <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-850">
                    <span className="text-slate-400 block text-[10px]">Воздух Темп</span>
                    <strong className="text-emerald-300 font-mono">{crTelemetry.airTemp}°C</strong>
                  </div>
                  <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-850">
                    <span className="text-slate-400 block text-[10px]">Статус ИИ</span>
                    <strong className={`font-mono ${crTelemetry.status === 'FIRE_RISK' ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`}>{crTelemetry.status}</strong>
                  </div>
                </div>
                <button onClick={() => setActiveTab('costarica')} className="w-full mt-4 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-emerald-400 text-xs font-bold py-2.5 rounded-xl transition-colors">
                  Открыть консоль Коста-Рики →
                </button>
              </div>

            </div>

            {/* СЧЕТЧИКИ ПРОГНОЗИРУЕМОГО УРОЖАЯ */}
            <div className="bg-slate-900/30 border border-slate-800 p-6 rounded-3xl space-y-4">
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Award className="text-amber-400 w-5 h-5" /> Прогнозируемый Сбор Урожая & Продукция Экосистемы (Синхронизация IndexedDB)
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 text-center">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Жемчуг (AAA)</span>
                  <strong className="text-xl text-amber-400 font-mono">{palawanHarvest.goldPearls} шт</strong>
                  <span className="text-[9px] text-slate-400 block mt-1">Pinctada Gold</span>
                </div>
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 text-center">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Суш. Трепанг</span>
                  <strong className="text-xl text-cyan-300 font-mono">{palawanHarvest.trepang} кг</strong>
                  <span className="text-[9px] text-slate-400 block mt-1">Holothuria Scabra</span>
                </div>
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 text-center">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Устричное Мясо</span>
                  <strong className="text-xl text-cyan-300 font-mono">{palawanHarvest.pearlMeat} порц</strong>
                  <span className="text-[9px] text-slate-400 block mt-1">Pearl Meat</span>
                </div>
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 text-center">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Перламутр. Посуда</span>
                  <strong className="text-xl text-cyan-300 font-mono">{palawanHarvest.mopPlates} шт</strong>
                  <span className="text-[9px] text-slate-400 block mt-1">Mother of Pearl</span>
                </div>
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 text-center">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Кофе Geisha</span>
                  <strong className="text-xl text-amber-300 font-mono">2,800 кг</strong>
                  <span className="text-[9px] text-slate-400 block mt-1">Specialty Grade</span>
                </div>
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 text-center">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Ваниль Grade A</span>
                  <strong className="text-xl text-emerald-300 font-mono">320 кг</strong>
                  <span className="text-[9px] text-slate-400 block mt-1">Premium 15+ см</span>
                </div>
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 text-center">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Дикий Мед</span>
                  <strong className="text-xl text-yellow-400 font-mono">{honeyHarvestWeight} кг</strong>
                  <span className="text-[9px] text-slate-400 block mt-1">Ванильно-кофейный</span>
                </div>
              </div>
            </div>

            {/* ЕДИНАЯ ТАКТИЧЕСКАЯ ПАНЕЛЬ СОБЫТИЙ (ГЛОБАЛЬНАЯ) */}
            <div className="bg-slate-900/30 border border-slate-800 p-6 rounded-3xl space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                    <Shield className="text-teal-400 w-5 h-5" /> Единая тактическая панель безопасности (Глобальный лог)
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Оповещения в реальном времени с обеих оффлайн-нод. Возможна симуляция событий в формах ферм.</p>
                </div>
                {/* Быстрое ручное тестирование */}
                <div className="flex gap-2 w-full sm:w-auto">
                  <input 
                    type="text" 
                    placeholder="Быстрый ручной лог..."
                    value={newAlertMessage}
                    onChange={(e) => setNewAlertMessage(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-400 flex-1 sm:w-64"
                  />
                  <button 
                    onClick={() => {
                      if(!newAlertMessage.trim()) return;
                      addLog('Глобальный пульт', newAlertMessage, 'warning', 'global');
                      triggerPush('⚠️ РУЧНОЙ АЛЕРТ', newAlertMessage, 'info');
                      setNewAlertMessage('');
                    }}
                    className="bg-teal-500 text-slate-950 text-xs font-bold px-3 py-1.5 rounded-xl"
                  >
                    Записать
                  </button>
                </div>
              </div>

              {/* Таблица */}
              <div className="bg-slate-950 rounded-2xl border border-slate-850 overflow-hidden">
                <div className="grid grid-cols-12 bg-slate-900/80 px-4 py-3 text-xs font-bold text-slate-400 border-b border-slate-800">
                  <div className="col-span-2">Время</div>
                  <div className="col-span-3">Локация / Источник</div>
                  <div className="col-span-5">Событие</div>
                  <div className="col-span-2 text-right">Уровень</div>
                </div>
                <div className="divide-y divide-slate-900/60 max-h-[300px] overflow-y-auto font-mono text-xs">
                  {securityLog.map(log => (
                    <div key={log.id} className="grid grid-cols-12 px-4 py-3.5 hover:bg-slate-900/30 items-center transition-colors">
                      <div className="col-span-2 text-slate-500">{log.time}</div>
                      <div className="col-span-3 font-semibold flex items-center gap-1.5">
                        <span className={`h-1.5 w-1.5 rounded-full ${
                          log.farm === 'palawan' ? 'bg-cyan-400' : log.farm === 'costarica' ? 'bg-emerald-400' : 'bg-teal-400'
                        }`}></span>
                        {log.location}
                      </div>
                      <div className="col-span-5 text-slate-300">{log.event}</div>
                      <div className="col-span-2 text-right">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          log.severity === 'high' ? 'bg-rose-500/20 text-rose-400 animate-pulse' :
                          log.severity === 'warning' ? 'bg-amber-500/10 text-amber-400' :
                          'bg-slate-800 text-slate-400'
                        }`}>
                          {log.severity.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================= */}
        {/* === ФЕРМА 1: ФИЛИППИНЫ (ПАЛАВАН) — ОКЕАНИЧЕСКАЯ ТЕМА === */}
        {/* ======================================================= */}
        {isPalawan && (
          <div className="space-y-8 animate-fadeIn text-cyan-100">
            
            {/* ШАПКА ФЕРМЫ + ПУЛЬТ КРИЗИСНОГО УПРАВЛЕНИЯ */}
            <div className="relative overflow-hidden rounded-3xl bg-slate-900/40 border border-cyan-500/20 p-6 shadow-xl backdrop-blur-md">
              <div className="absolute top-0 right-0 w-40 h-40 bg-cyan-500/10 blur-3xl rounded-full"></div>
              
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-cyan-400 font-mono">Ферма 1 • Филиппины</span>
                  <h2 className="text-3xl font-black text-slate-100 mt-0.5">Палаван • Морская База</h2>
                  <p className="text-sm text-slate-400 mt-1">Интегрированная мультитрофическая аквакультура (IMTA): Золотой жемчуг Pinctada, лобстеры, трепанг</p>
                </div>

                {/* ПУЛЬТ АВТОМАТИКИ И ТАЙФУНОВ */}
                <div className="bg-slate-950/95 p-4 rounded-2xl border border-cyan-500/30 w-full lg:w-auto space-y-3">
                  <span className="text-[10px] font-bold text-cyan-300 uppercase block tracking-wider text-center">📟 Пульт заглубления реек & симуляций</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={handleSinkLines}
                      className="bg-cyan-500 text-slate-950 hover:bg-cyan-400 font-bold text-xs px-3 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md shadow-cyan-500/20"
                    >
                      <Anchor className="w-3.5 h-3.5" /> Затопить глубже (8м)
                    </button>
                    <button 
                      onClick={handleLiftLines}
                      className="bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-cyan-500/30 font-bold text-xs px-3 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Layers className="w-3.5 h-3.5" /> Поднять для обмыва (0.5м)
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={handleTriggerTyphoon}
                      className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs px-3 py-1.5 rounded-xl flex items-center justify-center gap-1 transition-all"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 animate-pulse" /> Имитация тайфуна
                    </button>
                    <button 
                      onClick={handleResetPalawanClimate}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-3 py-1.5 rounded-xl flex items-center justify-center gap-1 transition-all"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Сбросить климат
                    </button>
                  </div>
                </div>
              </div>

              {/* МЕТРИКИ IoT-БУЯ (ЗЕЛЕНЫЙ/ЖЕЛТЫЙ/КРАСНЫЙ СТАТУСЫ) */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850">
                  <span className="text-slate-400 text-xs flex justify-between items-center mb-1">
                    Вода Темп
                    <Thermometer className="w-4 h-4 text-cyan-400" />
                  </span>
                  <span className="text-xl font-black font-mono text-slate-100">{palawanClimate.temp}°C</span>
                  <div className="w-full bg-slate-900 h-1 mt-2 rounded-full overflow-hidden">
                    <div className="bg-cyan-400 h-full" style={{ width: `${(palawanClimate.temp / 40) * 100}%` }}></div>
                  </div>
                  <span className="text-[9px] text-emerald-400 block mt-1">Оптимально</span>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850">
                  <span className="text-slate-400 text-xs flex justify-between items-center mb-1">
                    Раствор. Кислород (DO)
                    <Activity className="w-4 h-4 text-cyan-400" />
                  </span>
                  <span className={`text-xl font-black font-mono ${palawanClimate.do < 5.0 ? 'text-rose-400' : 'text-slate-100'}`}>
                    {palawanClimate.do} мг/л
                  </span>
                  <div className="w-full bg-slate-900 h-1 mt-2 rounded-full overflow-hidden">
                    <div className={`${palawanClimate.do < 5.0 ? 'bg-rose-500' : 'bg-cyan-400'} h-full`} style={{ width: `${(palawanClimate.do / 10) * 100}%` }}></div>
                  </div>
                  <span className={`text-[9px] block mt-1 ${palawanClimate.do < 5.0 ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`}>
                    {palawanClimate.do < 5.0 ? '⚠️ Риск замора!' : 'Стабильно'}
                  </span>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850">
                  <span className="text-slate-400 text-xs flex justify-between items-center mb-1">
                    Кислотность pH
                    <Beaker className="w-4 h-4 text-cyan-400" />
                  </span>
                  <span className="text-xl font-black font-mono text-slate-100">{palawanClimate.pH}</span>
                  <div className="w-full bg-slate-900 h-1 mt-2 rounded-full overflow-hidden">
                    <div className="bg-cyan-400 h-full" style={{ width: `${(palawanClimate.pH / 14) * 100}%` }}></div>
                  </div>
                  <span className="text-[9px] text-emerald-400 block mt-1">Слабощелочная</span>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850">
                  <span className="text-slate-400 text-xs flex justify-between items-center mb-1">
                    Соленость воды
                    <Droplet className="w-4 h-4 text-cyan-400" />
                  </span>
                  <span className={`text-xl font-black font-mono ${palawanClimate.salinity < 28.0 ? 'text-rose-400' : 'text-slate-100'}`}>
                    {palawanClimate.salinity} ‰
                  </span>
                  <div className="w-full bg-slate-900 h-1 mt-2 rounded-full overflow-hidden">
                    <div className={`${palawanClimate.salinity < 28.0 ? 'bg-rose-500' : 'bg-cyan-400'} h-full`} style={{ width: `${(palawanClimate.salinity / 40) * 100}%` }}></div>
                  </div>
                  <span className={`text-[9px] block mt-1 ${palawanClimate.salinity < 28.0 ? 'text-rose-400 font-bold' : 'text-emerald-400'}`}>
                    {palawanClimate.salinity < 28.0 ? '🚨 КРИТИЧЕСКОЕ ОПРЕСНЕНИЕ!' : 'Норма океана'}
                  </span>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850">
                  <span className="text-slate-400 text-xs flex justify-between items-center mb-1">
                    Мутность (Turbidity)
                    <CloudRain className="w-4 h-4 text-cyan-400" />
                  </span>
                  <span className={`text-xl font-black font-mono ${palawanClimate.turbidity > 25.0 ? 'text-amber-400' : 'text-slate-100'}`}>
                    {palawanClimate.turbidity} NTU
                  </span>
                  <div className="w-full bg-slate-900 h-1 mt-2 rounded-full overflow-hidden">
                    <div className={`${palawanClimate.turbidity > 25.0 ? 'bg-amber-400' : 'bg-cyan-400'} h-full`} style={{ width: `${(palawanClimate.turbidity / 60) * 100}%` }}></div>
                  </div>
                  <span className="text-[9px] text-slate-400 block mt-1">
                    {palawanClimate.turbidity > 25.0 ? '⚠️ Иззвесть/Взвесь шторма' : 'Идеальная прозрачность'}
                  </span>
                </div>
              </div>

              {/* ПРЕДИКТИВНЫЙ АЛЕРТ ИИ НА ОСНОВЕ ПАРАМЕТРОВ ВОДЫ */}
              <div className="mt-4 bg-slate-950/90 p-4 rounded-2xl border border-cyan-500/20 text-xs flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Cpu className="w-5 h-5 text-cyan-400 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-200 uppercase tracking-wider text-[10px]">Предикативный Анализ ИИ (Water Environmental AI)</span>
                    {palawanClimate.salinity < 28.0 ? (
                      <p className="text-rose-400 font-semibold mt-0.5 animate-pulse">
                        ВНИМАНИЕ: Угроза осмотического шока жемчужниц из-за штормового опреснения верхнего яруса! РЕКОМЕНДУЕТСЯ: Затопить лонглайны на глубину не менее 8 метров.
                      </p>
                    ) : (
                      <p className="text-slate-400 mt-0.5">
                        Параметры экосистемы лагуны стабильны. Плотность фитопланктона (диатомовых водорослей) в норме. Угрозы «красного прилива» не зафиксировано.
                      </p>
                    )}
                  </div>
                </div>
                <div className="font-mono bg-cyan-950/50 text-cyan-400 border border-cyan-500/30 px-3 py-1 rounded-xl text-[10px]">
                  Текущая глубина реек: <strong className="font-black text-white">{palawanClimate.depth}м</strong>
                </div>
              </div>
            </div>

            {/* БЛОК 1. БЕЗОПАСНОСТЬ И ОХРАНА ОТ БРАКОНЬЕРОВ (ANTI-POACHING AI) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* ИИ тепловизор и симулятор купольной камеры */}
              <div className="lg:col-span-8 bg-slate-900/40 border border-slate-800 p-6 rounded-3xl space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold text-cyan-400 flex items-center gap-2">
                    <Eye className="w-5 h-5" /> Система Купольного Тепловизионного Наблюдения береговой охраны (YOLOv8)
                  </h3>
                  <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
                    <button onClick={() => setCameraMode('day')} className={`px-2.5 py-1 rounded ${cameraMode === 'day' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400'}`}>Дневной</button>
                    <button onClick={() => setCameraMode('ir')} className={`px-2.5 py-1 rounded ${cameraMode === 'ir' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400'}`}>ИК-Ночь</button>
                    <button onClick={() => setCameraMode('ai')} className={`px-2.5 py-1 rounded ${cameraMode === 'ai' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400'}`}>ИИ-Радар</button>
                  </div>
                </div>

                {/* Simulated Screen */}
                <div className="relative h-64 rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center">
                  
                  {cameraMode === 'day' && (
                    <img src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80" alt="Lagoon Day" className="w-full h-full object-cover brightness-75" />
                  )}
                  {cameraMode === 'ir' && (
                    <img src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80" alt="Lagoon IR" className="w-full h-full object-cover brightness-50 sepia hue-rotate-[100deg] saturate-200" />
                  )}
                  {cameraMode === 'ai' && (
                    <div className="w-full h-full relative">
                      <img src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80" alt="Lagoon AI" className="w-full h-full object-cover brightness-50 sepia hue-rotate-[100deg] saturate-200" />
                      
                      {/* Сетка радара */}
                      <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(34,211,238,0.1)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>
                      
                      {poacherAlert ? (
                        <>
                          {/* Цель браконьеров */}
                          <div className="absolute top-[35%] left-[45%] border-2 border-rose-500 rounded p-1 animate-pulse bg-rose-950/40 text-[10px] font-mono text-rose-300">
                            <span className="font-bold block">🚨 TARGET: POACHER_BOAT</span>
                            <span>YOLOv8: 97.4%</span>
                            <span className="block text-rose-400 animate-ping">INTRUDER DETECTED</span>
                          </div>
                          {/* Сигнальные линии лазера прожекторов */}
                          <svg className="absolute inset-0 w-full h-full stroke-rose-500/60 stroke-2">
                            <line x1="0" y1="0" x2="400" y2="120" className="animate-pulse" />
                            <line x1="800" y1="0" x2="400" y2="120" className="animate-pulse" />
                          </svg>
                        </>
                      ) : (
                        <div className="absolute top-[20%] left-[20%] border border-cyan-500/40 rounded p-1 text-[8px] font-mono text-cyan-400 bg-slate-950/80">
                          <span>⛵ Local bangka (Village)</span>
                          <span className="block text-emerald-400 font-bold">Safe whitelist</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Светошумовые прожекторы статус */}
                  <div className="absolute bottom-4 left-4 bg-slate-950/90 border border-slate-800 p-2.5 rounded-xl text-[10px] font-mono">
                    <span className="block text-slate-400">🚨 Охранный комплекс:</span>
                    <span className="flex items-center gap-1.5 mt-1">
                      <span className={`h-2 w-2 rounded-full ${floodlightOn ? 'bg-rose-500 animate-ping' : 'bg-emerald-500'}`}></span>
                      Мощные прожекторы: <strong>{floodlightOn ? 'ВКЛЮЧЕНЫ (НАПРАВЛЕНЫ)' : 'АВТО (ВЫКЛ)'}</strong>
                    </span>
                    <span className="flex items-center gap-1.5 mt-1">
                      <span className={`h-2 w-2 rounded-full ${poacherAlert ? 'bg-rose-500 animate-ping' : 'bg-slate-700'}`}></span>
                      Звуковая сирена вышки: <strong>{poacherAlert ? 'АКТИВНА (110 dB)' : 'ДЕЖУРНЫЙ РЕЖИМ'}</strong>
                    </span>
                  </div>

                  {/* Оповещение старейшине */}
                  {poacherAlert && (
                    <div className="absolute top-4 right-4 bg-rose-600 border border-rose-400 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg animate-bounce shadow-lg shadow-rose-500/30 font-mono">
                      ✉️ TELEGRAM PUSH: СТАРЕЙШИНЕ ДЕРЕВНИ ОТПРАВЛЕНО!
                    </div>
                  )}
                </div>

                {/* Кнопки управления безопасностью */}
                <div className="flex gap-2 justify-end">
                  <button 
                    onClick={handleTriggerPoacher} 
                    className="bg-rose-600 hover:bg-rose-500 text-slate-100 font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-rose-600/20"
                  >
                    <ShieldAlert className="w-4 h-4" /> Имитировать ночное вторжение (YOLOv8)
                  </button>
                  <button 
                    onClick={handleResetPoacher} 
                    className="bg-slate-950 hover:bg-slate-900 border border-slate-800 text-cyan-400 font-bold text-xs px-4 py-2 rounded-xl transition-all"
                  >
                    Сбросить тревогу & Выключить прожекторы
                  </button>
                </div>
              </div>

              {/* Узкоспециализированные логи безопасности Филиппины */}
              <div className="lg:col-span-4 bg-slate-900/40 border border-slate-800 p-6 rounded-3xl flex flex-col justify-between space-y-4">
                <div>
                  <h4 className="text-sm font-black uppercase text-cyan-400 font-mono">Консоль радара & Лог буев охраны</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Сюда стекаются события оптических ИК-камер и датчиков шума винтов. Кликни по симуляции слева для проверки тревожного механизма.
                  </p>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 h-44 overflow-y-auto divide-y divide-slate-900/80 font-mono text-[10px]">
                  {securityLog.filter(log => log.farm === 'palawan').map(log => (
                    <div key={log.id} className="py-2 flex flex-col gap-0.5">
                      <div className="flex justify-between text-slate-500">
                        <span>{log.time} — {log.location}</span>
                        <span className={log.severity === 'high' ? 'text-rose-400' : 'text-amber-400'}>{log.severity.toUpperCase()}</span>
                      </div>
                      <p className="text-slate-300">{log.event}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* БЛОК 2. УЧЕТ СТАДА И КОНТРОЛЬ РАБОТЫ (SMART INVENTORY & RFID) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Карта длинных линий */}
              <div className="lg:col-span-8 bg-slate-900/40 border border-slate-800 p-6 rounded-3xl space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold text-cyan-400 flex items-center gap-2">
                    <Layers className="w-5 h-5" /> Карта Длинных Линий (Longlines) & Садов устриц в море
                  </h3>
                  <span className="text-xs bg-cyan-500/10 text-cyan-300 px-3 py-1 rounded-full border border-cyan-500/20">4 Линии под контролем</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {longlines.map(line => (
                    <div key={line.id} className={`p-4 rounded-2xl border transition-all ${
                      line.id === 'Л-3' && line.status.includes('Требуется')
                        ? 'bg-amber-950/20 border-amber-500/40 animate-pulse' 
                        : 'bg-slate-950 border-slate-850'
                    }`}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-sm">Линия {line.id}</span>
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                          line.id === 'Л-3' && line.status.includes('Требуется')
                            ? 'bg-amber-500/20 text-amber-300' 
                            : 'bg-emerald-500/20 text-emerald-400'
                        }`}>
                          {line.id === 'Л-3' && line.status.includes('Требуется') ? '⚠️ ПРЕДУПРЕЖДЕНИЕ' : 'ШТАТНО'}
                        </span>
                      </div>
                      <div className="space-y-1 text-xs text-slate-300 font-mono">
                        <div className="flex justify-between"><span>Канатов:</span> <strong>{line.count} шт</strong></div>
                        <div className="flex justify-between"><span>Жемчужниц:</span> <strong>{line.pearls} шт</strong></div>
                        <div className="flex justify-between"><span>Очистка:</span> <strong className="text-cyan-300">{line.lastCleaned}</strong></div>
                      </div>
                      {line.id === 'Л-3' && line.status.includes('Требуется') && (
                        <p className="text-[9px] text-amber-400 font-bold mt-2 leading-tight">
                          ❌ Не чистилась >4 недель! Скорость нарастания устриц падает на 15%!
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Модуль RFID терминала */}
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-850 space-y-4">
                  <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                    <Rss className="w-4 h-4 text-cyan-400" /> Имитатор RFID сканера ухода рабочих за линиями
                  </h4>
                  <form onSubmit={handleRfidScan} className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Введите код сетки для отметки о чистке (например: RFID-PAL-002)"
                      value={rfidSearch}
                      onChange={(e) => setRfidSearch(e.target.value)}
                      className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 flex-1 font-mono"
                    />
                    <button type="submit" className="bg-cyan-500 text-slate-950 px-5 py-2 rounded-xl text-sm font-bold hover:bg-cyan-400 transition-colors">
                      Сканировать RFID
                    </button>
                  </form>

                  {scannedItem && (
                    <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 text-xs space-y-2 animate-fadeIn font-mono">
                      {scannedItem.error ? (
                        <span className="text-rose-400">{scannedItem.error}</span>
                      ) : (
                        <div className="grid grid-cols-2 gap-2">
                          <div>Тип: <strong className="text-cyan-300">{scannedItem.type}</strong></div>
                          <div>Возраст биомассы: <strong className="text-slate-200">{scannedItem.age}</strong></div>
                          <div>Плотность устриц: <strong className="text-slate-200">{scannedItem.density}</strong></div>
                          <div>Статус в IndexedDB: <strong className="text-emerald-400">{scannedItem.status}</strong></div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Правая колонка: Описание ИИ учета рутины */}
              <div className="lg:col-span-4 bg-slate-900/40 border border-slate-800 p-6 rounded-3xl flex flex-col justify-between">
                <div>
                  <h4 className="text-sm font-black uppercase text-cyan-400 font-mono">ИИ-Контроль Рутинного Ухода</h4>
                  <p className="text-xs text-slate-400 mt-2">
                    Система на основе ИИ автоматически вычисляет интервалы чистки раковин рабочими. Каждая сетка должна очищаться раз в 3 недели.
                  </p>
                  <p className="text-xs text-slate-400 mt-2">
                    Если метка RFID не регистрировалась смартфоном рабочего более 28 дней, система подсвечивает узел красным цветом и включает тревогу о падении продуктивности.
                  </p>
                </div>
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-850 text-xs">
                  <span className="text-cyan-300 font-bold block mb-1">Справка для тестов:</span>
                  Введите в строку ввода слева код <strong className="text-white font-mono">RFID-PAL-002</strong> и нажмите кнопку сканирования — вы симулируете работу сотрудника, и Линия Л-3 мгновенно станет чистой и здоровой!
                </div>
              </div>

            </div>

            {/* БЛОК 3. АВТОМАТИЧЕСКАЯ СОРТИРОВКА И ОЦЕНКА УРОЖАЯ (AI GRADING) */}
            <div className="bg-slate-900/30 border border-slate-800 p-6 rounded-3xl space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-lg font-bold text-cyan-400 flex items-center gap-2">
                    <Camera className="w-5 h-5 animate-pulse" /> Автоматическая ИИ-оценка урожая (Deep Learning Grading)
                  </h3>
                  <p className="text-xs text-slate-400">Компьютерное зрение в браузере (TensorFlow.js) классифицирует жемчужины по 5 параметрам и сортирует створки раковин.</p>
                </div>

                {/* Переключатель ИИ сортировки */}
                <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-850 text-xs">
                  <button onClick={() => { setPearlAiType('pearl'); setPearlAiResult(null); }} className={`px-3 py-1.5 rounded-lg font-bold transition-all ${pearlAiType === 'pearl' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400'}`}>
                    Золотистый Жемчуг (South Sea Gold)
                  </button>
                  <button onClick={() => { setPearlAiType('motherofpearl'); setPearlAiResult(null); }} className={`px-3 py-1.5 rounded-lg font-bold transition-all ${pearlAiType === 'motherofpearl' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400'}`}>
                    Створки раковин (Mother-of-Pearl)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Visual Scanner */}
                <div className="bg-slate-950 border border-dashed border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center relative overflow-hidden min-h-[300px]">
                  <div className="absolute inset-0">
                    {pearlAiType === 'pearl' ? (
                      <img src="https://images.unsplash.com/photo-1515688594390-b649af70d282?auto=format&fit=crop&w=800&q=80" alt="Gold Pearl" className="w-full h-full object-cover brightness-[0.65]" />
                    ) : (
                      <img src="https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80" alt="Pearl Shells" className="w-full h-full object-cover brightness-[0.55]" />
                    )}
                    {/* Световой луч сканирования */}
                    {pearlAiAnalyzing && (
                      <div className="absolute left-0 right-0 h-1 bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)] animate-bounce" style={{ top: '40%' }}></div>
                    )}
                    {/* Bounding box */}
                    {!pearlAiAnalyzing && pearlAiResult && (
                      <div className="absolute top-[30%] left-[35%] w-32 h-32 border-2 border-dashed border-cyan-400/60 rounded-full flex items-center justify-center animate-fadeIn">
                        <span className="bg-slate-950/90 text-cyan-300 text-[9px] font-mono p-1 rounded border border-cyan-500/30">Target: Gold Pearl (99%)</span>
                      </div>
                    )}
                  </div>

                  <button 
                    onClick={handlePearlAiAnalysis} 
                    disabled={pearlAiAnalyzing} 
                    className="z-10 bg-slate-950/90 text-cyan-400 border border-cyan-500/30 hover:bg-slate-900 text-xs font-bold px-4 py-2 rounded-xl transition-all disabled:opacity-50 mt-auto shadow-2xl"
                  >
                    {pearlAiAnalyzing ? 'WASM Сверточная сеть работает...' : `Запустить ИИ-экспертизу ${pearlAiType === 'pearl' ? 'жемчуга' : 'створки'}`}
                  </button>
                </div>

                {/* AI Verdict */}
                <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-4 font-mono">Спецификация анализа нейросети</h4>
                    
                    {pearlAiAnalyzing && (
                      <div className="space-y-4 py-6">
                        <div className="flex items-center gap-2 text-xs text-slate-300">
                          <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin" />
                          <span>Анализ геометрического калибра, чистоты перламутра и спектра золотого оттенка...</span>
                        </div>
                        <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                          <div className="bg-gradient-to-r from-cyan-500 to-teal-400 h-2 animate-pulse" style={{ width: '80%' }}></div>
                        </div>
                      </div>
                    )}

                    {!pearlAiAnalyzing && pearlAiResult && (
                      <div className="space-y-4 animate-fadeIn">
                        <div className="space-y-2">
                          <span className="text-xs bg-cyan-950 border border-cyan-500/30 text-cyan-300 font-bold px-3 py-1 rounded-full inline-block font-mono">
                            {pearlAiResult.title}
                          </span>
                          <div className="grid grid-cols-1 gap-1.5 mt-2 font-mono text-xs text-slate-300">
                            {pearlAiResult.metrics.map((m, idx) => (
                              <div key={idx} className="flex justify-between border-b border-slate-800/60 pb-1">
                                <span className="text-slate-400">{m.label}:</span>
                                <strong className="text-white">{m.val}</strong>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="p-3 bg-slate-950 rounded-xl border border-slate-850 text-xs mt-4">
                          <span className="text-slate-500 block uppercase text-[9px] font-bold">Итоговое распределение:</span>
                          <p className="text-emerald-400 font-black mt-1 leading-relaxed">{pearlAiResult.verdict}</p>
                        </div>
                      </div>
                    )}

                    {!pearlAiAnalyzing && !pearlAiResult && (
                      <div className="text-center py-12 text-slate-500 text-xs">
                        Положите объект на поднос и запустите тест. Нейросеть автоматически отсортирует жемчуг по калибру и цвету или створки раковины под производство тарелок.
                      </div>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono border-t border-slate-800/60 pt-4 mt-4">
                    Модель: MobileNet-V3 Custom Classifier. Локальные веса WASM. База устриц Pinctada maxima.
                  </div>
                </div>

              </div>
            </div>

            {/* БЛОК 4. МОНИТОРИНГ МНОГОУРОВНЕВОЙ СИСТЕМЫ IMTA (БИО-МАССА) */}
            <div className="bg-slate-900/30 border border-slate-800 p-6 rounded-3xl space-y-4">
              <h3 className="text-lg font-bold text-cyan-400 flex items-center gap-2">
                <Compass className="w-5 h-5 animate-spin" style={{ animationDuration: '8s' }} /> Контроль продуктивности многоуровневой системы IMTA (Ярусы биомассы)
              </h3>
              <p className="text-xs text-slate-400">
                Комплексная экологическая аквакультура. Верхний ярус фильтрует воду, средний ярус кормит ракообразных, донный ярус утилизирует органику, исключая экологический след.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* UPPER LAYER */}
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-850 space-y-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 text-[10px] bg-cyan-950 text-cyan-300 font-mono font-bold px-2.5 py-1 rounded-bl-xl border-l border-b border-cyan-500/20">
                    Верхний ярус (Устрицы)
                  </div>
                  <h4 className="font-bold text-sm text-slate-200">Устрицы Crassostrea gigas</h4>
                  <div className="space-y-1.5 text-xs text-slate-300 font-mono">
                    <div className="flex justify-between"><span>Скорость прироста:</span> <strong>{imtaOysters.growth}</strong></div>
                    <div className="flex justify-between"><span>Индекс здоровья:</span> <strong className="text-emerald-400">{imtaOysters.health}%</strong></div>
                    <div className="flex justify-between"><span>Последний замер:</span> <span>{imtaOysters.lastMeasure}</span></div>
                  </div>
                  <button 
                    onClick={() => {
                      setImtaOysters(prev => ({ ...prev, growth: '1.45 мм/нед (Ускоренно)', health: 100 }));
                      triggerPush('🦪 ЗАМЕР ВЫПОЛНЕН', 'Успешный замер биомассы пищевой устрицы в верхнем ярусе.', 'success');
                      addLog('IMTA Верхний ярус', 'Проведен физический замер калибра пищевой устрицы. Скорость фильтрации лагуны высокая.', 'info', 'palawan');
                    }}
                    className="w-full bg-slate-900 hover:bg-slate-850 text-cyan-400 font-bold text-xs py-2 rounded-lg border border-cyan-500/20 transition-colors"
                  >
                    Замерить рост устриц
                  </button>
                </div>

                {/* MIDDLE LAYER */}
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-850 space-y-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 text-[10px] bg-cyan-950 text-cyan-300 font-mono font-bold px-2.5 py-1 rounded-bl-xl border-l border-b border-cyan-500/20">
                    Средний ярус (Клетки)
                  </div>
                  <h4 className="font-bold text-sm text-slate-200">Тигровые лангусты Panulirus</h4>
                  <div className="space-y-1.5 text-xs text-slate-300 font-mono">
                    <div className="flex justify-between"><span>Средний вес особи:</span> <strong>{imtaLobsters.weight}</strong></div>
                    <div className="flex justify-between"><span>Расход корма:</span> <span>{imtaLobsters.feed}</span></div>
                    <div className="flex justify-between"><span>Последнее кормление:</span> <span className="text-cyan-300">{imtaLobsters.lastFeed}</span></div>
                  </div>
                  <button 
                    onClick={() => {
                      setImtaLobsters(prev => ({ ...prev, weight: '1.49 кг', lastFeed: 'Только что раздано' }));
                      triggerPush('🦞 КОРМЛЕНИЕ ЗАВЕРШЕНО', 'Органический планктонный корм успешно подан в плавучие садки.', 'success');
                      addLog('IMTA Средний ярус', 'Подача корма лангустам на садках сектора Восток.', 'info', 'palawan');
                    }}
                    className="w-full bg-slate-900 hover:bg-slate-850 text-cyan-400 font-bold text-xs py-2 rounded-lg border border-cyan-500/20 transition-colors"
                  >
                    Раздать органический корм
                  </button>
                </div>

                {/* BOTTOM LAYER */}
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-850 space-y-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 text-[10px] bg-cyan-950 text-cyan-300 font-mono font-bold px-2.5 py-1 rounded-bl-xl border-l border-b border-cyan-500/20">
                    Донный ярус (Морской огурец)
                  </div>
                  <h4 className="font-bold text-sm text-slate-200">Золотой Трепанг Scabra</h4>
                  <div className="space-y-1.5 text-xs text-slate-300 font-mono">
                    <div className="flex justify-between"><span>Плотность на дне:</span> <strong>{imtaCucumber.density}</strong></div>
                    <div className="flex justify-between"><span>Масса трепанга:</span> <strong>{imtaCucumber.weight}</strong></div>
                    <div className="flex justify-between"><span>Очистка дна садов:</span> <span className="text-emerald-400">{imtaCucumber.lastClean}</span></div>
                  </div>
                  <button 
                    onClick={() => {
                      setImtaCucumber(prev => ({ ...prev, density: '14 шт/м² (Био-барьер)', lastClean: 'Сегодня 12:00' }));
                      triggerPush('🥒 ОЧИСТКА ДНА ЗАПУЩЕНА', 'Морские огурцы эффективно перерабатывают детрит под садками устриц.', 'success');
                      addLog('IMTA Донный ярус', 'Мониторинг донной зоны: трепанг активен, содержание аммиака на дне критически низкое.', 'info', 'palawan');
                    }}
                    className="w-full bg-slate-900 hover:bg-slate-850 text-cyan-400 font-bold text-xs py-2 rounded-lg border border-cyan-500/20 transition-colors"
                  >
                    Запустить донную очистку
                  </button>
                </div>

              </div>
            </div>

          </div>
        )}

        {/* ======================================================= */}
        {/* === ФЕРМА 2: КОСТА-РИКА — ИЗУМРУДНО-ЯНТАРНАЯ ТЕМА === */}
        {/* ======================================================= */}
        {isCostaRica && (
          <div className="space-y-8 animate-fadeIn text-emerald-100">
            
            {/* ШАПКА ФЕРМЫ + ПУЛЬТ ОРОШЕНИЯ И АВТОМАТИКИ */}
            <div className="relative overflow-hidden rounded-3xl bg-slate-900/40 border border-emerald-500/20 p-6 shadow-xl backdrop-blur-md">
              <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 blur-3xl rounded-full"></div>
              
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 font-mono">Ферма 2 • Центральная Америка</span>
                  <h2 className="text-3xl font-black text-slate-100 mt-0.5">Коста-Рика • Монтеверде</h2>
                  <p className="text-sm text-slate-400 mt-1">Высокогорная агролесомелиорация спешелти-кофе, дикой ванили и пчел в защищенном био-коридоре</p>
                </div>

                {/* ПУЛЬТ АВТОМАТИКИ ОРОШЕНИЯ И ЗАЖИГАНИЯ */}
                <div className="bg-slate-950/95 p-4 rounded-2xl border border-emerald-500/30 w-full lg:w-auto space-y-3">
                  <span className="text-[10px] font-bold text-emerald-300 uppercase block tracking-wider text-center">📟 Пульт капельного полива & климата</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={handleToggleIrrigation}
                      className={`font-bold text-xs px-3 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                        isIrrigationActive 
                          ? 'bg-rose-600 text-white animate-pulse' 
                          : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-md shadow-emerald-500/20'
                      }`}
                    >
                      <Power className="w-3.5 h-3.5" /> {isIrrigationActive ? 'Отключить полив' : 'Запустить полив'}
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
                      onClick={handleTriggerDrought}
                      className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs px-3 py-1.5 rounded-xl flex items-center justify-center gap-1 transition-all"
                    >
                      <Flame className="w-3.5 h-3.5" /> Имитировать засуху
                    </button>
                    <button 
                      onClick={handleResetCrClimate}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-3 py-1.5 rounded-xl flex items-center justify-center gap-1 transition-all"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Сбросить алерты
                    </button>
                  </div>
                </div>
              </div>

              {/* МЕТРИКИ IoT МИКРОКЛИМАТА И ПОЧВЫ НА ГЛУБИНАХ */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850">
                  <span className="text-slate-400 text-xs flex justify-between items-center mb-1">
                    Влажность 10см
                    <Droplet className="w-4 h-4 text-emerald-400" />
                  </span>
                  <span className={`text-xl font-black font-mono ${crTelemetry.soilMoisture10cm < 45.0 ? 'text-rose-400' : 'text-slate-100'}`}>
                    {crTelemetry.soilMoisture10cm}%
                  </span>
                  <div className="w-full bg-slate-900 h-1 mt-2 rounded-full overflow-hidden">
                    <div className={`${crTelemetry.soilMoisture10cm < 45.0 ? 'bg-rose-500' : 'bg-emerald-400'} h-full`} style={{ width: `${crTelemetry.soilMoisture10cm}%` }}></div>
                  </div>
                  <span className="text-[9px] text-slate-400 block mt-1">{isIrrigationActive ? 'Капельное орошение...' : 'Норма (60-80%)'}</span>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850">
                  <span className="text-slate-400 text-xs flex justify-between items-center mb-1">
                    Влажность 30см
                    <Droplet className="w-4 h-4 text-emerald-400" />
                  </span>
                  <span className="text-xl font-black font-mono text-slate-100">{crTelemetry.soilMoisture30cm}%</span>
                  <div className="w-full bg-slate-900 h-1 mt-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-400 h-full" style={{ width: `${crTelemetry.soilMoisture30cm}%` }}></div>
                  </div>
                  <span className="text-[9px] text-slate-400 block mt-1">Корневая зона кофе</span>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850">
                  <span className="text-slate-400 text-xs flex justify-between items-center mb-1">
                    Влажность 60см
                    <Droplet className="w-4 h-4 text-emerald-400" />
                  </span>
                  <span className="text-xl font-black font-mono text-slate-100">{crTelemetry.soilMoisture60cm}%</span>
                  <div className="w-full bg-slate-900 h-1 mt-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-400 h-full" style={{ width: `${crTelemetry.soilMoisture60cm}%` }}></div>
                  </div>
                  <span className="text-[9px] text-slate-400 block mt-1">Глубинный водоносный ярус</span>
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

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850">
                  <span className="text-slate-400 text-xs flex justify-between items-center mb-1">
                    Влажность воздуха
                    <CloudRain className="w-4 h-4 text-emerald-400" />
                  </span>
                  <span className={`text-xl font-black font-mono ${crTelemetry.airHumidity < 35.0 ? 'text-rose-400 animate-pulse' : 'text-slate-100'}`}>
                    {crTelemetry.airHumidity}%
                  </span>
                  <div className="w-full bg-slate-900 h-1 mt-2 rounded-full overflow-hidden">
                    <div className={`${crTelemetry.airHumidity < 35.0 ? 'bg-rose-500' : 'bg-emerald-400'} h-full`} style={{ width: `${crTelemetry.airHumidity}%` }}></div>
                  </div>
                  <span className={`text-[9px] block mt-1 ${crTelemetry.airHumidity < 35.0 ? 'text-rose-400 font-bold' : 'text-slate-400'}`}>
                    {crTelemetry.airHumidity < 35.0 ? '🚨 КРИТИЧЕСКИ СУХО' : 'Оптимально'}
                  </span>
                </div>
              </div>

              {/* ИИ КАЛЕНДАРЬ ПОЛИВА */}
              <div className="mt-4 bg-slate-950/90 p-4 rounded-2xl border border-emerald-500/20 text-xs flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Cpu className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-200 uppercase tracking-wider text-[10px]">ИИ-Контроллер орошения (Precision Ag AI)</span>
                    {crTelemetry.status === 'FIRE_RISK' ? (
                      <p className="text-rose-400 font-semibold mt-0.5 animate-pulse">
                        КРИТИЧЕСКИЙ УРОВЕНЬ ПОЖАРООПАСНОСТИ! Влажность почвы и воздуха упала ниже критических 30%. Капельный полив запущен в форсированном режиме!
                      </p>
                    ) : (
                      <p className="text-slate-400 mt-0.5">
                        Анализ прогноза осадков на 5 дней: Ожидаются грозы с вероятностью 80% через 36 часов. ИИ оптимизировал расход воды — снижен напор ручных клапанов на 25%.
                      </p>
                    )}
                  </div>
                </div>
                <div className="font-mono bg-emerald-950/50 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-xl text-[10px]">
                  ИИ-Полив: <strong className="font-black text-white">{isAiWateringMode ? 'АКТИВЕН' : 'РУЧНОЙ РЕЖИМ'}</strong>
                </div>
              </div>
            </div>

            {/* БЛОК 1. СПЕШЕЛТИ КОФЕ И КАКАО (КОНТРОЛЬ УРОЖАЯ И ФЕРМЕНТАЦИИ) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Ферментационные баки */}
              <div className="lg:col-span-8 bg-slate-900/40 border border-slate-800 p-6 rounded-3xl space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold text-emerald-400 flex items-center gap-2">
                    <Layers className="w-5 h-5" /> Учет переработки лотов Спешелти-Кофе и Какао (Микро-партии)
                  </h3>
                  <span className="text-xs bg-emerald-500/10 text-emerald-300 px-3 py-1 rounded-full border border-emerald-500/20">Сезон сбора 2026</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {coffeeBatches.map(batch => (
                    <div key={batch.id} className={`p-5 rounded-2xl border space-y-4 transition-all duration-500 ${
                      batch.sealed ? 'bg-emerald-950/10 border-emerald-500/30' : 'bg-slate-950 border-slate-850'
                    }`}>
                      <div className="flex justify-between items-center">
                        <span className="font-mono font-bold text-amber-400 text-sm">{batch.id} • {batch.variety}</span>
                        <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-bold ${
                          batch.sealed ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}>
                          {batch.sealed ? 'ГЕРМЕТИЧНАЯ АНАЭРОБНАЯ' : 'СУШКА НА КРОВАТЯХ'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 font-mono">
                        <div className="bg-slate-900 p-2 rounded">
                          <span className="text-slate-500 text-[10px] block">Температура:</span>
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
                          <span className="text-slate-500 text-[10px] block">Процесс ИИ:</span>
                          <strong>{batch.sealed ? 'CO2 Стабилен' : 'Цель: 10-12%'}</strong>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {batch.id === 'CR-GEO-09' && (
                          <button 
                            onClick={() => handleToggleFermentationSeal(batch.id)}
                            className="flex-1 bg-emerald-500 text-slate-950 font-bold text-xs py-1.5 rounded-lg hover:bg-emerald-400 transition-colors"
                          >
                            {batch.sealed ? '🔓 Разгерметизировать бак' : '🔒 Герметизировать бак'}
                          </button>
                        )}
                        {batch.id === 'CR-SL28-02' && (
                          <button 
                            onClick={handleTriggerDryingScan}
                            className="flex-1 bg-amber-500 text-slate-950 font-bold text-xs py-1.5 rounded-lg hover:bg-amber-400 transition-colors"
                          >
                            Снять показания сушки (ИИ)
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Ввод BRIX сахара */}
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-850 space-y-4">
                  <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-400" /> Лабораторный ввод BRIX-индекса спелости ягод перед сбором
                  </h4>
                  <form onSubmit={handleAddBrixLog} className="flex gap-2">
                    <input 
                      type="number" 
                      step="0.1"
                      placeholder="Внесите показатель % BRIX спелой ягоды (например: 22.4)"
                      value={coffeeBrixInput}
                      onChange={(e) => setCoffeeBrixInput(e.target.value)}
                      className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 flex-1 font-mono"
                    />
                    <button type="submit" className="bg-emerald-500 text-slate-950 px-5 py-2 rounded-xl text-sm font-bold hover:bg-emerald-400 transition-colors">
                      Зафиксировать BRIX
                    </button>
                  </form>

                  <div className="space-y-1.5 max-h-[80px] overflow-y-auto divide-y divide-slate-900/60 font-mono text-[11px] text-slate-400">
                    {coffeeBrixLogs.map(log => (
                      <div key={log.id} className="py-1 flex justify-between items-center">
                        <span>Сектор: <strong>CR-SL28-02</strong> — Зафиксирован BRIX: <strong className="text-amber-300">{log.brix}</strong></span>
                        <span>{log.time}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Правая колонка: ИИ-График влажности кофе */}
              <div className="lg:col-span-4 bg-slate-900/40 border border-slate-800 p-6 rounded-3xl flex flex-col justify-between space-y-4">
                <div>
                  <h4 className="text-sm font-black uppercase text-emerald-400 font-mono">ИИ-График падения влажности</h4>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    Слишком быстрая сушка портит зерно. Наш ИИ ведет непрерывный мониторинг влажности зерна. Цель — достичь идеальных <strong className="text-emerald-300">10-12%</strong> перед упаковкой в герметичные мешки GrainPro.
                  </p>

                  {/* SVG график */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 mt-4 space-y-2">
                    <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                      <span>День 1: 42%</span>
                      <span>День 3: 14.8%</span>
                      <span>День 5: 11.2%</span>
                    </div>
                    <div className="h-20 w-full bg-slate-900 rounded border border-slate-800 relative overflow-hidden flex items-end">
                      <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/5 to-transparent"></div>
                      <svg className="w-full h-full stroke-emerald-500 stroke-2" fill="none">
                        <path d="M 0 5 L 60 25 L 120 50 L 220 58" />
                      </svg>
                      <span className="absolute bottom-1 right-2 text-[9px] text-emerald-400 font-mono font-bold">Цель достигнута 🎯</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-950 rounded-xl border border-slate-850 text-xs">
                  <span className="text-emerald-300 font-bold block mb-1">Справка оператора:</span>
                  Нажмите на кнопку <strong className="text-white font-mono">Снять показания сушки</strong> в карточке лота SL-28 — ИИ завершит замер влажности и автоматически упакует лот!
                </div>
              </div>

            </div>

            {/* БЛОК 2. РУЧНОЕ ОПЫЛЕНИЕ ДИКОЙ ВАНИЛИ (TRACKING) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              <div className="lg:col-span-8 bg-slate-900/40 border border-slate-800 p-6 rounded-3xl space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold text-emerald-400 flex items-center gap-2">
                    <Sun className="w-5 h-5 animate-spin" style={{ animationDuration: '6s' }} /> Ручное Опыление Дикой Ванили (Vanilla planifolia)
                  </h3>
                  <span className="text-xs bg-emerald-500/10 text-emerald-300 px-3 py-1 rounded-full border border-emerald-500/20">Вектор ручного контроля</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {vanillaSectors.map(sec => (
                    <div key={sec.id} className="bg-slate-950 p-4 rounded-xl border border-slate-850 text-xs space-y-2">
                      <div className="flex justify-between font-bold">
                        <span>Сектор плантации: {sec.id}</span>
                        <span className="text-emerald-400">{sec.count} лиан</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-900 pb-1">
                        <span className="text-slate-400">Сегодня успешно опылено:</span>
                        <span className="text-amber-400 font-bold font-mono">{sec.pollinatedToday} цветков</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Текущая стадия созревания стручков:</span>
                        <strong className="text-slate-300">{sec.status}</strong>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Запись опыления */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-3">
                  <span className="text-xs font-bold block text-slate-200">Ввести запись опыления ванили сотрудником (Цветок цветет пару часов!)</span>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <select 
                      value={selectedVanillaSector}
                      onChange={(e) => setSelectedVanillaSector(e.target.value)}
                      className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200"
                    >
                      <option value="Сектор А">Сектор А</option>
                      <option value="Сектор B">Сектор B</option>
                    </select>
                    <input 
                      type="number"
                      placeholder="Внесите количество опылений сегодня (+ шт)"
                      value={pollinationInput}
                      onChange={(e) => setPollinationInput(e.target.value)}
                      className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 flex-1 font-mono focus:outline-none"
                    />
                    <button onClick={handleAddVanillaPollination} className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold px-4 py-1.5 rounded-lg">
                      Записать опыление
                    </button>
                  </div>
                </div>
              </div>

              {/* ИИ сортировка длинных стручков ванили */}
              <div className="lg:col-span-4 bg-slate-900/40 border border-slate-800 p-6 rounded-3xl space-y-4 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-amber-400 flex items-center gap-2 font-mono">
                    <Camera className="w-5 h-5 text-amber-400" /> ИИ-Сортировка стручков ванили
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed mt-1">
                    Стручки сортируются на Grade A (длина стручка от 15+ см) под премиум бренд, и короткие/расщепленные под ванильные экстракты.
                  </p>
                </div>
                
                <div className="bg-slate-950 border border-dashed border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center relative overflow-hidden h-36">
                  <div className="absolute inset-0">
                    <img src="https://images.unsplash.com/photo-1596436889106-be35e843f974?auto=format&fit=crop&w=400&q=80" alt="Vanilla Pods" className="w-full h-full object-cover brightness-50" />
                    {vanillaAiAnalyzing && (
                      <div className="absolute left-0 right-0 h-1 bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-bounce" style={{ top: '40%' }}></div>
                    )}
                    {!vanillaAiAnalyzing && vanillaAiResult && (
                      <div className="absolute inset-4 border border-dashed border-emerald-400/60 rounded flex items-center justify-center font-mono text-[9px] text-emerald-300">
                        <span>Grade A Pod (18.5см) detected</span>
                      </div>
                    )}
                  </div>
                  <button onClick={handleVanillaAiAnalysis} disabled={vanillaAiAnalyzing} className="z-10 bg-slate-950/90 text-emerald-400 border border-emerald-500/30 hover:bg-slate-900 text-xs font-bold px-3 py-1.5 rounded-lg shadow-xl">
                    {vanillaAiAnalyzing ? 'Анализ длины...' : 'Запустить ИИ-тест ванили'}
                  </button>
                </div>

                {vanillaAiResult && (
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-850 text-xs animate-fadeIn leading-relaxed">
                    <strong className="text-emerald-400 font-mono block">{vanillaAiResult.grade}</strong>
                    <span className="text-[10px] text-slate-400 block mt-1">{vanillaAiResult.desc}</span>
                    <strong className="text-white block mt-1 text-[10px]">Рекомендация: {vanillaAiResult.action}</strong>
                  </div>
                )}
              </div>

            </div>

            {/* БЛОК 3. АКУСТИЧЕСКИЙ МОНИТОРИНГ ПАСЕКИ (АПИКУЛЬТУРА) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              <div className="lg:col-span-8 bg-slate-900/40 border border-slate-800 p-6 rounded-3xl space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold text-yellow-400 flex items-center gap-2">
                    🐝 Акустический ИИ-мониторинг ульев в тропических садах
                  </h3>
                  <span className="text-xs bg-yellow-500/10 text-yellow-300 px-3 py-1 rounded-full border border-yellow-500/20">WASM Аудио Ноды</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {hives.map(hive => (
                    <div key={hive.id} className={`p-4 rounded-xl border transition-all ${
                      hive.alert ? 'bg-rose-950/20 border-rose-500/40 animate-pulse' : 'bg-slate-950 border-slate-850'
                    }`}>
                      <div className="flex justify-between items-center">
                        <span className="font-bold font-mono text-slate-200">Улей {hive.id} ({hive.variety})</span>
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                          hive.alert ? 'bg-rose-500/20 text-rose-400 animate-pulse' : 'bg-emerald-500/20 text-emerald-400'
                        }`}>
                          {hive.alert ? '⚠️ УХОД РОЯ / СТРЕСС!' : 'ЗДОРОВ / МЕДОСБОР'}
                        </span>
                      </div>
                      <div className="space-y-1 mt-3 text-xs text-slate-300 font-mono">
                        <div className="flex justify-between"><span>Акустический гул:</span> <strong className={hive.alert ? 'text-rose-400' : 'text-emerald-400'}>{hive.frequency} Гц</strong></div>
                        <div className="flex justify-between"><span>Здоровье семьи:</span> <strong>{hive.health}%</strong></div>
                        <p className="text-[10px] text-slate-400 mt-2 leading-tight">Заметка: {hive.note}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Акустическая диагностика и гашение роения */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <span className="font-bold text-slate-200 text-xs block font-mono">ИИ-Противовибрационный глушитель роения ульев</span>
                    <p className="text-[11px] text-slate-400 mt-0.5">При повышении частоты гула выше 220Гц ИИ подает на микродинамик белый шум для гашения роения пчёл.</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleAcousticTherapy} className="bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold text-xs px-4 py-2 rounded-lg whitespace-nowrap">
                      Акустическое подавление (У-12)
                    </button>
                    <button onClick={handleHoneyHarvest} className="bg-slate-900 border border-slate-800 text-yellow-400 hover:bg-slate-800 font-bold text-xs px-4 py-2 rounded-lg whitespace-nowrap">
                      Запустить выкачку меда (+24кг)
                    </button>
                  </div>
                </div>
              </div>

              {/* Сводка апикультуры */}
              <div className="lg:col-span-4 bg-slate-900/40 border border-slate-800 p-6 rounded-3xl flex flex-col justify-between space-y-4">
                <div>
                  <h4 className="text-sm font-black uppercase text-emerald-400 font-mono">Контроль медосбора</h4>
                  <p className="text-xs text-slate-400 leading-relaxed mt-1">
                    Сенсорные весы ульев непрерывно передают массу меда в IndexedDB. Когда вес улья превышает 45кг, ИИ отправляет рекомендацию рабочим начать ручную выкачку.
                  </p>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 text-xs text-center font-mono">
                  <span>Общий вес меда в хранилище:</span>
                  <strong className="text-xl text-yellow-400 block mt-1 font-black">{honeyHarvestWeight} кг</strong>
                </div>
              </div>

            </div>

            {/* БЛОК 4. БЕЗОПАСНОСТЬ И ПЕРИМЕТР (ДИКИЕ ЖИВОТНЫЕ & ПОЖАРЫ) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* ИК-Камера на границе леса Коста-Рики */}
              <div className="lg:col-span-8 bg-slate-900/40 border border-slate-800 p-6 rounded-3xl space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold text-emerald-400 flex items-center gap-2">
                    🐆 Ночная ИК-Камера охраны периметра от животных на границе леса (YOLOv8)
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">Внешняя ИК-Купольная камера 04</span>
                </div>

                <div className="relative h-60 bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center">
                  <img src="https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=800&q=80" alt="Cloud Forest Night" className="w-full h-full object-cover brightness-50 sepia hue-rotate-[130deg] saturate-150" />
                  
                  {/* Сетка детекции */}
                  <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(16,185,129,0.08)_1px,transparent_1px)] bg-[size:15px_15px] pointer-events-none"></div>

                  {wildlifeAlert ? (
                    <div className="absolute top-[40%] left-[35%] border-2 border-dashed border-amber-400 rounded p-2 bg-slate-950/90 text-xs font-mono animate-pulse">
                      <span className="text-amber-300 font-black">🐆 DETECTED: WILD_ANIMAL_INTRUDER</span>
                      <span className="block text-white">YOLOv8 Class: {wildlifeTarget}</span>
                      <span className="block text-emerald-400 font-bold">Уверенность: 94.2%</span>
                    </div>
                  ) : (
                    <div className="absolute top-[20%] left-[10%] text-[9px] font-mono bg-slate-950/80 border border-slate-800 text-slate-500 p-1 rounded">
                      <span>No activity on rainforest edge</span>
                    </div>
                  )}

                  {wildlifeAlert && (
                    <div className="absolute top-4 right-4 bg-amber-600 border border-amber-400 text-slate-950 font-bold text-[10px] px-3 py-1 rounded animate-bounce font-mono">
                      🐆 PUSH: Распознан {wildlifeTarget} на границе периметра!
                    </div>
                  )}
                </div>

                <div className="flex gap-2 justify-end">
                  <button onClick={handleAnimalSimulation} className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-4 py-2 rounded-xl">
                    Запустить симуляцию движения диких животных (YOLOv8)
                  </button>
                  {wildlifeAlert && (
                    <button onClick={handleResetWildlife} className="bg-slate-900 border border-slate-800 text-slate-300 text-xs px-4 py-2 rounded-xl">
                      Сбросить
                    </button>
                  )}
                </div>
              </div>

              {/* Описание пожаров периметра */}
              <div className="lg:col-span-4 bg-slate-900/40 border border-slate-800 p-6 rounded-3xl flex flex-col justify-between space-y-4">
                <div>
                  <h4 className="text-sm font-black uppercase text-emerald-400 font-mono">Охрана сушилен периметра</h4>
                  <p className="text-xs text-slate-400 leading-relaxed mt-1">
                    Ночная купольная ИК-камера контролирует склады высушенного кофе и пасеки. ИИ предотвращает кражу ценных лотов дикими животными или злоумышленниками.
                  </p>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    Датчики влажности периметра следят за пожароопасностью — при снижении влажности воздуха ниже 25% система включает противопожарные дождеватели.
                  </p>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-850 text-[10px] text-slate-400 font-mono">
                  Попробуйте вызвать пожароопасную засуху кнопкой «Имитировать засуху» на пульте орошения сверху — система мгновенно выдаст аварию и запишет алерты.
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ======================================================= */}
        {/* === ЭКРАН 4: ПАНЕЛЬ АДМИНИСТРАТОРА (ФИОЛЕТОВАЯ ТЕМА) === */}
        {/* ======================================================= */}
        {isAdmin && (
          <div className="space-y-8 animate-fadeIn text-violet-100">
            <div className="relative overflow-hidden rounded-3xl bg-slate-900/40 border border-violet-500/20 p-6 shadow-xl backdrop-blur-md">
              <div className="absolute top-0 right-0 w-40 h-40 bg-violet-500/10 blur-3xl rounded-full"></div>
              
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-6">
                <div>
                  <span className="text-xs font-black uppercase tracking-widest text-violet-400 font-mono">🔑 СУПЕРПОЛЬЗОВАТЕЛЬ • ЦЕНТРАЛЬНАЯ СУБ-БД</span>
                  <h2 className="text-3xl font-black text-slate-100 mt-1">Панель Администратора (Админ-Панель)</h2>
                  <p className="text-sm text-slate-400 mt-1">Редактирование, добавление, удаление контейнеров, длинных линий, ульев и лотов ферментации кофе в реальном времени.</p>
                </div>
                
                {/* КНОПКА СБРОСА БД */}
                <button 
                  onClick={handleResetToDefaults}
                  className="bg-rose-950/40 hover:bg-rose-900/40 border border-rose-500/30 text-rose-300 font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all w-full lg:w-auto justify-center"
                >
                  <Trash2 className="w-4 h-4" /> Сбросить БД к дефолтным
                </button>
              </div>

              {/* СЕЛЕКТОР ТАБЛИЦ БД */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2 bg-slate-950/80 p-2 rounded-2xl border border-slate-850 mb-6">
                <button 
                  onClick={() => { setAdminSelectedTable('longlines'); setIsAdminFormOpen(false); }}
                  className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${adminSelectedTable === 'longlines' ? 'bg-violet-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  <Anchor className="w-3.5 h-3.5" /> 🐚 Филиппины (Линии)
                </button>
                <button 
                  onClick={() => { setAdminSelectedTable('coffee'); setIsAdminFormOpen(false); }}
                  className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${adminSelectedTable === 'coffee' ? 'bg-violet-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  <Layers className="w-3.5 h-3.5" /> ☕ Коста-Рика (Кофе)
                </button>
                <button 
                  onClick={() => { setAdminSelectedTable('vanilla'); setIsAdminFormOpen(false); }}
                  className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${adminSelectedTable === 'vanilla' ? 'bg-violet-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  <Sun className="w-3.5 h-3.5" /> 🌸 Коста-Рика (Ваниль)
                </button>
                <button 
                  onClick={() => { setAdminSelectedTable('hives'); setIsAdminFormOpen(false); }}
                  className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${adminSelectedTable === 'hives' ? 'bg-violet-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  <span>🐝 Коста-Рика (Ульи)</span>
                </button>
                <button 
                  onClick={() => { setAdminSelectedTable('logs'); setIsAdminFormOpen(false); }}
                  className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${adminSelectedTable === 'logs' ? 'bg-violet-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  <Database className="w-3.5 h-3.5" /> 📜 Логи & Датчики
                </button>
              </div>

              {/* ОКНО ИНЛАЙН РЕДАКТОРА (ФОРМА ДОБАВЛЕНИЯ / РЕДАКТИРОВАНИЯ) */}
              {isAdminFormOpen && (
                <form onSubmit={handleAdminSave} className="bg-slate-950 p-6 rounded-2xl border border-violet-500/30 mb-8 space-y-4 animate-fadeIn">
                  <div className="flex justify-between items-center border-b border-slate-850 pb-3">
                    <h3 className="font-bold text-sm text-violet-400 flex items-center gap-2">
                      <Plus className="w-4 h-4 animate-spin" style={{ animationDuration: '6s' }} /> 
                      {adminEditingItem ? `Редактировать объект: ${adminEditingItem.id}` : `Добавить новую запись в таблицу`}
                    </h3>
                    <button type="button" onClick={() => setIsAdminFormOpen(false)} className="text-slate-500 hover:text-slate-200 text-xs">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    
                    {/* ПОЛЯ ДЛЯ ТАБЛИЦЫ: LONGLINES */}
                    {adminSelectedTable === 'longlines' && (
                      <>
                        <div>
                          <label className="block text-[10px] text-slate-400 uppercase font-mono mb-1">ID Линии</label>
                          <input 
                            type="text" 
                            value={adminForm.id || ''} 
                            onChange={e => setAdminForm({ ...adminForm, id: e.target.value })}
                            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white w-full font-mono focus:outline-none focus:ring-1 focus:ring-violet-500"
                            disabled={adminEditingItem !== null}
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-400 uppercase font-mono mb-1">Канатов (кол-во шт)</label>
                          <input 
                            type="number" 
                            value={adminForm.count || 0} 
                            onChange={e => setAdminForm({ ...adminForm, count: e.target.value })}
                            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white w-full font-mono focus:outline-none focus:ring-1 focus:ring-violet-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-400 uppercase font-mono mb-1">Жемчужниц (шт)</label>
                          <input 
                            type="number" 
                            value={adminForm.pearls || 0} 
                            onChange={e => setAdminForm({ ...adminForm, pearls: e.target.value })}
                            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white w-full font-mono focus:outline-none focus:ring-1 focus:ring-violet-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-400 uppercase font-mono mb-1">Последняя чистка</label>
                          <select 
                            value={adminForm.lastCleaned || '3 недели назад'} 
                            onChange={e => setAdminForm({ ...adminForm, lastCleaned: e.target.value })}
                            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white w-full focus:outline-none focus:ring-1 focus:ring-violet-500 font-mono"
                          >
                            <option value="Только что очищено">Только что очищено</option>
                            <option value="1 неделя назад">1 неделя назад</option>
                            <option value="2 недели назад">2 недели назад</option>
                            <option value="3 недели назад">3 недели назад</option>
                            <option value="4+ недели назад">4+ недели назад</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-400 uppercase font-mono mb-1">Статус чистки</label>
                          <select 
                            value={adminForm.status || 'Норма'} 
                            onChange={e => setAdminForm({ ...adminForm, status: e.target.value })}
                            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white w-full focus:outline-none focus:ring-1 focus:ring-violet-500"
                          >
                            <option value="Норма">Норма</option>
                            <option value="⚠️ Требуется чистка">⚠️ Требуется чистка</option>
                            <option value="Критично">Критично</option>
                          </select>
                        </div>
                      </>
                    )}

                    {/* ПОЛЯ ДЛЯ ТАБЛИЦЫ: COFFEE */}
                    {adminSelectedTable === 'coffee' && (
                      <>
                        <div>
                          <label className="block text-[10px] text-slate-400 uppercase font-mono mb-1">ID Лота</label>
                          <input 
                            type="text" 
                            value={adminForm.id || ''} 
                            onChange={e => setAdminForm({ ...adminForm, id: e.target.value })}
                            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white w-full font-mono focus:outline-none focus:ring-1 focus:ring-violet-500"
                            disabled={adminEditingItem !== null}
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-400 uppercase font-mono mb-1">Сорт кофе / Какао</label>
                          <select 
                            value={adminForm.variety || 'Geisha (Анаэробная)'} 
                            onChange={e => setAdminForm({ ...adminForm, variety: e.target.value })}
                            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white w-full focus:outline-none focus:ring-1 focus:ring-violet-500"
                          >
                            <option value="Geisha (Анаэробная)">Geisha (Анаэробная)</option>
                            <option value="Geisha (Спешелти)">Geisha (Спешелти)</option>
                            <option value="SL-28 (Экспериментальная)">SL-28 (Экспериментальная)</option>
                            <option value="SL-28 (Спешелти)">SL-28 (Спешелти)</option>
                            <option value="Catuai (Высокогорный)">Catuai (Высокогорный)</option>
                            <option value="Catuai">Catuai</option>
                            <option value="Criollo (Элитный Какао)">Criollo (Элитный Какао)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-400 uppercase font-mono mb-1">Стадия процесса</label>
                          <select 
                            value={adminForm.stage || 'Ферментация'} 
                            onChange={e => setAdminForm({ ...adminForm, stage: e.target.value })}
                            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white w-full focus:outline-none focus:ring-1 focus:ring-violet-500"
                          >
                            <option value="Ферментация">Ферментация</option>
                            <option value="Ферментация (Анаэробная)">Ферментация (Анаэробная)</option>
                            <option value="Сушка на африканских кроватях">Сушка на африканских кроватях</option>
                            <option value="Готов к GrainPro-мешкам">Готов к GrainPro-мешкам</option>
                            <option value="Спелое зерно">Спелое зерно</option>
                            <option value="Полуспелое">Полуспелое</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-400 uppercase font-mono mb-1">Сахар BRIX</label>
                          <select 
                            value={adminForm.brix || '23%'} 
                            onChange={e => setAdminForm({ ...adminForm, brix: e.target.value })}
                            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white w-full font-mono focus:outline-none focus:ring-1 focus:ring-violet-500"
                          >
                            <option value="N/A">N/A</option>
                            <option value="18%">18%</option>
                            <option value="20%">20%</option>
                            <option value="21%">21%</option>
                            <option value="22%">22%</option>
                            <option value="23%">23%</option>
                            <option value="23.4%">23.4%</option>
                            <option value="24%">24%</option>
                            <option value="25%">25%</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-400 uppercase font-mono mb-1">Влажность зерна (%)</label>
                          <select 
                            value={adminForm.moisture || '12%'} 
                            onChange={e => setAdminForm({ ...adminForm, moisture: e.target.value })}
                            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white w-full font-mono focus:outline-none focus:ring-1 focus:ring-violet-500"
                          >
                            <option value="42%">42%</option>
                            <option value="35%">35%</option>
                            <option value="25%">25%</option>
                            <option value="18%">18%</option>
                            <option value="14.8%">14.8%</option>
                            <option value="12.5%">12.5%</option>
                            <option value="12%">12%</option>
                            <option value="11.8%">11.8%</option>
                            <option value="11.4%">11.4%</option>
                            <option value="11%">11%</option>
                            <option value="10.5%">10.5%</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-400 uppercase font-mono mb-1">Температура</label>
                          <select 
                            value={adminForm.temp || '21.5°C'} 
                            onChange={e => setAdminForm({ ...adminForm, temp: e.target.value })}
                            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white w-full font-mono focus:outline-none focus:ring-1 focus:ring-violet-500"
                          >
                            <option value="18.0°C">18.0°C</option>
                            <option value="19.5°C">19.5°C</option>
                            <option value="20.0°C">20.0°C</option>
                            <option value="21.5°C">21.5°C</option>
                            <option value="22.0°C">22.0°C</option>
                            <option value="23.5°C">23.5°C</option>
                            <option value="24.2°C">24.2°C</option>
                            <option value="25.0°C">25.0°C</option>
                          </select>
                        </div>
                        <div className="flex items-center h-full pt-4">
                          <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-200">
                            <input 
                              type="checkbox" 
                              checked={adminForm.sealed || false} 
                              onChange={e => setAdminForm({ ...adminForm, sealed: e.target.checked })}
                              className="rounded text-violet-600 focus:ring-violet-500 bg-slate-900 border-slate-800 h-4 w-4"
                            />
                            Герметичная анаэробная
                          </label>
                        </div>
                      </>
                    )}

                    {/* ПОЛЯ ДЛЯ ТАБЛИЦЫ: VANILLA */}
                    {adminSelectedTable === 'vanilla' && (
                      <>
                        <div>
                          <label className="block text-[10px] text-slate-400 uppercase font-mono mb-1">Сектор ванили</label>
                          <input 
                            type="text" 
                            value={adminForm.id || ''} 
                            onChange={e => setAdminForm({ ...adminForm, id: e.target.value })}
                            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white w-full font-mono focus:outline-none focus:ring-1 focus:ring-violet-500"
                            disabled={adminEditingItem !== null}
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-400 uppercase font-mono mb-1">Кол-во Лиан (шт)</label>
                          <input 
                            type="number" 
                            value={adminForm.count || 0} 
                            onChange={e => setAdminForm({ ...adminForm, count: e.target.value })}
                            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white w-full font-mono focus:outline-none focus:ring-1 focus:ring-violet-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-400 uppercase font-mono mb-1">Опылено сегодня</label>
                          <input 
                            type="number" 
                            value={adminForm.pollinatedToday || 0} 
                            onChange={e => setAdminForm({ ...adminForm, pollinatedToday: e.target.value })}
                            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white w-full font-mono focus:outline-none focus:ring-1 focus:ring-violet-500"
                            required
                          />
                        </div>
                        <div className="md:col-span-3">
                          <label className="block text-[10px] text-slate-400 uppercase font-mono mb-1">Стадия созревания стручков</label>
                          <select 
                            value={adminForm.status || '85% созревание'} 
                            onChange={e => setAdminForm({ ...adminForm, status: e.target.value })}
                            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white w-full focus:outline-none focus:ring-1 focus:ring-violet-500"
                          >
                            <option value="85% созревание">85% созревание</option>
                            <option value="40% созревание">40% созревание</option>
                            <option value="Зеленые стручки (Формирование)">Зеленые стручки (Формирование)</option>
                            <option value="Рост стручков">Рост стручков</option>
                            <option value="Сбор урожая">Сбор урожая</option>
                            <option value="Цветение">Цветение</option>
                          </select>
                        </div>
                      </>
                    )}

                    {/* ПОЛЯ ДЛЯ ТАБЛИЦЫ: HIVES */}
                    {adminSelectedTable === 'hives' && (
                      <>
                        <div>
                          <label className="block text-[10px] text-slate-400 uppercase font-mono mb-1">ID Улья</label>
                          <input 
                            type="text" 
                            value={adminForm.id || ''} 
                            onChange={e => setAdminForm({ ...adminForm, id: e.target.value })}
                            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white w-full font-mono focus:outline-none focus:ring-1 focus:ring-violet-500"
                            disabled={adminEditingItem !== null}
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-400 uppercase font-mono mb-1">Порода пчел</label>
                          <select 
                            value={adminForm.variety || 'Golden Italian'} 
                            onChange={e => setAdminForm({ ...adminForm, variety: e.target.value })}
                            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white w-full focus:outline-none focus:ring-1 focus:ring-violet-500"
                          >
                            <option value="Golden Italian">Golden Italian</option>
                            <option value="Carnica Mix">Carnica Mix</option>
                            <option value="Melipona (Безжалостные)">Melipona (Безжалостные)</option>
                            <option value="Italian Buckfast">Italian Buckfast</option>
                            <option value="Caucasian Honeybee">Caucasian Honeybee</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-400 uppercase font-mono mb-1">Частота гула (Гц)</label>
                          <input 
                            type="number" 
                            value={adminForm.frequency || 0} 
                            onChange={e => setAdminForm({ ...adminForm, frequency: e.target.value })}
                            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white w-full font-mono focus:outline-none focus:ring-1 focus:ring-violet-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-400 uppercase font-mono mb-1">Здоровье семьи (%)</label>
                          <input 
                            type="number" 
                            min="0"
                            max="100"
                            value={adminForm.health || 0} 
                            onChange={e => setAdminForm({ ...adminForm, health: e.target.value })}
                            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white w-full font-mono focus:outline-none focus:ring-1 focus:ring-violet-500"
                            required
                          />
                        </div>
                        <div className="flex items-center h-full pt-4">
                          <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-200">
                            <input 
                              type="checkbox" 
                              checked={adminForm.alert || false} 
                              onChange={e => setAdminForm({ ...adminForm, alert: e.target.checked })}
                              className="rounded text-violet-600 focus:ring-violet-500 bg-slate-900 border-slate-800 h-4 w-4"
                            />
                            Триггер тревоги (стресс пчёл)
                          </label>
                        </div>
                        <div className="md:col-span-3">
                          <label className="block text-[10px] text-slate-400 uppercase font-mono mb-1">Текстовая заметка улья</label>
                          <select 
                            value={adminForm.note || 'Стабильный гул.'} 
                            onChange={e => setAdminForm({ ...adminForm, note: e.target.value })}
                            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white w-full focus:outline-none focus:ring-1 focus:ring-violet-500"
                          >
                            <option value="Стабильный гул медосбора.">Стабильный гул медосбора.</option>
                            <option value="Критический гул! Риск роения.">Критический гул! Риск роения.</option>
                            <option value="Семья здорова, высокая активность.">Семья здорова, высокая активность.</option>
                            <option value="Требуется визуальный осмотр рамок.">Требуется визуальный осмотр рамок.</option>
                            <option value="Снижена звуковая активность.">Снижена звуковая активность.</option>
                            <option value="Стабильный гул.">Стабильный гул.</option>
                          </select>
                        </div>
                      </>
                    )}

                    {/* ПОЛЯ ДЛЯ ТАБЛИЦЫ: SECURITY LOGS */}
                    {adminSelectedTable === 'logs' && (
                      <>
                        <div>
                          <label className="block text-[10px] text-slate-400 uppercase font-mono mb-1">Локация / Датчик</label>
                          <select 
                            value={adminForm.location || 'Буй №4 (Палаван)'} 
                            onChange={e => setAdminForm({ ...adminForm, location: e.target.value })}
                            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white w-full focus:outline-none focus:ring-1 focus:ring-violet-500"
                          >
                            <option value="Буй №1 (Палаван)">Буй №1 (Палаван)</option>
                            <option value="Буй №2 (Палаван)">Буй №2 (Палаван)</option>
                            <option value="Буй №4 (Палаван)">Буй №4 (Палаван)</option>
                            <option value="Вышка №2 (Палаван)">Вышка №2 (Палаван)</option>
                            <option value="Лаборатория (Палаван)">Лаборатория (Палаван)</option>
                            <option value="Сектор А3 (Коста-Рика)">Сектор А3 (Коста-Рика)</option>
                            <option value="Улей №12 (Коста-Рика)">Улей №12 (Коста-Рика)</option>
                            <option value="Улей №15 (Коста-Рика)">Улей №15 (Коста-Рика)</option>
                            <option value="Сушильный цех (Коста-Рика)">Сушильный цех (Коста-Рика)</option>
                            <option value="Анаэробный бак (Коста-Рика)">Анаэробный бак (Коста-Рика)</option>
                            <option value="Ручной ввод">Ручной ввод</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-400 uppercase font-mono mb-1">Зафиксированное событие</label>
                          <select 
                            value={adminForm.event || 'Кастомное событие БД'} 
                            onChange={e => setAdminForm({ ...adminForm, event: e.target.value })}
                            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white w-full focus:outline-none focus:ring-1 focus:ring-violet-500"
                          >
                            <option value="AI-радар обнаружил неопознанное плавсредство на дистанции 800м. Оповещение отправлено.">AI-радар обнаружил неопознанное плавсредство на дистанции 800м.</option>
                            <option value="Автоматический полив включен. Температура почвы >28°C. Расход: 450л.">Автоматический полив включен. Расход: 450л.</option>
                            <option value="AI-анализ звука: зафиксированы шумы винтов туристического катера. Безопасная зона.">AI-анализ звука: шумы винтов катера.</option>
                            <option value="Внимание! Резкое падение звуковой активности (активность семьи <70%). Рекомендуется осмотр.">Резкое падение звуковой активности улья.</option>
                            <option value="Проведен физический замер калибра пищевой устрицы. Скорость фильтрации лагуны высокая.">Физический замер калибра устриц.</option>
                            <option value="Акустическая терапия улья У-12: частота роения успешно погашена противовибрационным генератором.">Акустическая терапия улья У-12 завершена.</option>
                            <option value="Запущен ручной режим капельного орошения плантаций кофе.">Ручной запуск капельного орошения.</option>
                            <option value="YOLOv8: Обнаружен Тапир (94% уверенности). Движение в сторону буферной зоны.">YOLOv8: обнаружен тапир у леса.</option>
                            <option value="Кастомное событие БД">Кастомное событие БД</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-400 uppercase font-mono mb-1">Класс угрозы</label>
                          <select 
                            value={adminForm.severity || 'info'} 
                            onChange={e => setAdminForm({ ...adminForm, severity: e.target.value })}
                            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white w-full focus:outline-none focus:ring-1 focus:ring-violet-500"
                          >
                            <option value="info">info (Информационное)</option>
                            <option value="warning">warning (Внимание)</option>
                            <option value="high">high (Критическая угроза)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-400 uppercase font-mono mb-1">Принадлежность к ферме</label>
                          <select 
                            value={adminForm.farm || 'palawan'} 
                            onChange={e => setAdminForm({ ...adminForm, farm: e.target.value })}
                            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white w-full focus:outline-none focus:ring-1 focus:ring-violet-500"
                          >
                            <option value="palawan">Палаван (Филиппины)</option>
                            <option value="costarica">Коста-Рика (Центральная Америка)</option>
                          </select>
                        </div>
                      </>
                    )}

                  </div>

                  <div className="flex gap-2 justify-end pt-3">
                    <button 
                      type="button" 
                      onClick={() => setIsAdminFormOpen(false)}
                      className="bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 font-bold text-xs px-4 py-2 rounded-xl transition-all"
                    >
                      Отменить
                    </button>
                    <button 
                      type="submit"
                      className="bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs px-5 py-2 rounded-xl transition-all shadow-md shadow-violet-500/20"
                    >
                      <Check className="w-4 h-4 inline-block mr-1.5" /> Сохранить в Базу Данных
                    </button>
                  </div>
                </form>
              )}

              {/* КНОПКА ДОБАВИТЬ НОВУЮ ЗАПИСЬ (Отображается, если форма закрыта) */}
              {!isAdminFormOpen && (
                <button 
                  onClick={handleAdminAddClick}
                  className="mb-6 bg-violet-600 hover:bg-violet-500 text-white font-black text-xs px-5 py-3 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-violet-500/20"
                >
                  <Plus className="w-4 h-4" /> Добавить новую строку / контейнер
                </button>
              )}

              {/* ОТОБРАЖЕНИЕ ТАБЛИЦЫ ДАННЫХ */}
              <div className="bg-slate-950 rounded-2xl border border-slate-850 overflow-hidden shadow-2xl">
                
                {/* Рендеринг LONGLINES */}
                {adminSelectedTable === 'longlines' && (
                  <div>
                    <div className="grid grid-cols-12 bg-slate-900 px-4 py-3 text-xs font-bold text-slate-400 border-b border-slate-800 font-mono">
                      <div className="col-span-2">ID Линии</div>
                      <div className="col-span-2">Канаты (шт)</div>
                      <div className="col-span-2">Жемчужницы (шт)</div>
                      <div className="col-span-2">Последняя чистка</div>
                      <div className="col-span-2">Статус</div>
                      <div className="col-span-2 text-right">Действия</div>
                    </div>
                    <div className="divide-y divide-slate-900/80">
                      {longlines.map(line => (
                        <div key={line.id} className="grid grid-cols-12 px-4 py-3.5 text-xs text-slate-300 hover:bg-violet-950/10 items-center transition-colors font-mono">
                          <div className="col-span-2 font-bold text-violet-400">{line.id}</div>
                          <div className="col-span-2">{line.count} шт</div>
                          <div className="col-span-2">{line.pearls} шт</div>
                          <div className="col-span-2 text-slate-400">{line.lastCleaned}</div>
                          <div className="col-span-2">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${line.status.includes('Требуется') ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                              {line.status}
                            </span>
                          </div>
                          <div className="col-span-2 flex justify-end gap-1">
                            <button type="button" onClick={() => handleAdminEditClick(line)} className="bg-slate-900 hover:bg-slate-800 p-1.5 rounded-lg border border-slate-800 text-violet-300 hover:text-white transition-all"><Edit className="w-3.5 h-3.5" /></button>
                            <button type="button" onClick={() => handleAdminDelete(line.id)} className="bg-slate-900 hover:bg-rose-950/40 p-1.5 rounded-lg border border-slate-800 text-rose-400 hover:text-rose-200 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Рендеринг COFFEE */}
                {adminSelectedTable === 'coffee' && (
                  <div>
                    <div className="grid grid-cols-12 bg-slate-900 px-4 py-3 text-xs font-bold text-slate-400 border-b border-slate-800 font-mono">
                      <div className="col-span-2">ID Лота</div>
                      <div className="col-span-2">Сорт</div>
                      <div className="col-span-3">Стадия</div>
                      <div className="col-span-1">BRIX</div>
                      <div className="col-span-1">Влажн.</div>
                      <div className="col-span-1">Темп</div>
                      <div className="col-span-2 text-right">Действия</div>
                    </div>
                    <div className="divide-y divide-slate-900/80 font-mono">
                      {coffeeBatches.map(batch => (
                        <div key={batch.id} className="grid grid-cols-12 px-4 py-3.5 text-xs text-slate-300 hover:bg-violet-950/10 items-center transition-colors">
                          <div className="col-span-2 font-bold text-violet-400">{batch.id}</div>
                          <div className="col-span-2 text-slate-200">{batch.variety}</div>
                          <div className="col-span-3 text-emerald-400 flex items-center gap-1">
                            <span className={`h-1.5 w-1.5 rounded-full ${batch.sealed ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`}></span>
                            {batch.stage}
                          </div>
                          <div className="col-span-1 text-amber-300">{batch.brix}</div>
                          <div className="col-span-1 text-emerald-300">{batch.moisture}</div>
                          <div className="col-span-1 text-slate-400">{batch.temp}</div>
                          <div className="col-span-2 flex justify-end gap-1">
                            <button type="button" onClick={() => handleAdminEditClick(batch)} className="bg-slate-900 hover:bg-slate-800 p-1.5 rounded-lg border border-slate-800 text-violet-300 hover:text-white transition-all"><Edit className="w-3.5 h-3.5" /></button>
                            <button type="button" onClick={() => handleAdminDelete(batch.id)} className="bg-slate-900 hover:bg-rose-950/40 p-1.5 rounded-lg border border-slate-800 text-rose-400 hover:text-rose-200 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Рендеринг VANILLA */}
                {adminSelectedTable === 'vanilla' && (
                  <div>
                    <div className="grid grid-cols-12 bg-slate-900 px-4 py-3 text-xs font-bold text-slate-400 border-b border-slate-800 font-mono">
                      <div className="col-span-3">Сектор</div>
                      <div className="col-span-3">Лианы (шт)</div>
                      <div className="col-span-2">Опылено сегодня</div>
                      <div className="col-span-2">Статус</div>
                      <div className="col-span-2 text-right">Действия</div>
                    </div>
                    <div className="divide-y divide-slate-900/80 font-mono">
                      {vanillaSectors.map(sec => (
                        <div key={sec.id} className="grid grid-cols-12 px-4 py-3.5 text-xs text-slate-300 hover:bg-violet-950/10 items-center transition-colors">
                          <div className="col-span-3 font-bold text-violet-400">{sec.id}</div>
                          <div className="col-span-3">{sec.count} лиан</div>
                          <div className="col-span-2 text-amber-300 font-bold">{sec.pollinatedToday}</div>
                          <div className="col-span-2 text-emerald-400">{sec.status}</div>
                          <div className="col-span-2 flex justify-end gap-1">
                            <button type="button" onClick={() => handleAdminEditClick(sec)} className="bg-slate-900 hover:bg-slate-800 p-1.5 rounded-lg border border-slate-800 text-violet-300 hover:text-white transition-all"><Edit className="w-3.5 h-3.5" /></button>
                            <button type="button" onClick={() => handleAdminDelete(sec.id)} className="bg-slate-900 hover:bg-rose-950/40 p-1.5 rounded-lg border border-slate-800 text-rose-400 hover:text-rose-200 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Рендеринг HIVES */}
                {adminSelectedTable === 'hives' && (
                  <div>
                    <div className="grid grid-cols-12 bg-slate-900 px-4 py-3 text-xs font-bold text-slate-400 border-b border-slate-800 font-mono">
                      <div className="col-span-2">ID Улья</div>
                      <div className="col-span-2">Порода пчел</div>
                      <div className="col-span-1">Гул (Гц)</div>
                      <div className="col-span-1">Здоровье</div>
                      <div className="col-span-4">Заметка</div>
                      <div className="col-span-2 text-right">Действия</div>
                    </div>
                    <div className="divide-y divide-slate-900/80 font-mono">
                      {hives.map(hive => (
                        <div key={hive.id} className="grid grid-cols-12 px-4 py-3.5 text-xs text-slate-300 hover:bg-violet-950/10 items-center transition-colors">
                          <div className="col-span-2 font-bold text-violet-400">{hive.id}</div>
                          <div className="col-span-2 text-slate-200">{hive.variety}</div>
                          <div className="col-span-1 text-amber-300 font-bold">{hive.frequency} Гц</div>
                          <div className="col-span-1 text-emerald-400">{hive.health}%</div>
                          <div className="col-span-4 text-slate-400 text-[10px] leading-tight truncate">{hive.note}</div>
                          <div className="col-span-2 flex justify-end gap-1">
                            <button type="button" onClick={() => handleAdminEditClick(hive)} className="bg-slate-900 hover:bg-slate-800 p-1.5 rounded-lg border border-slate-800 text-violet-300 hover:text-white transition-all"><Edit className="w-3.5 h-3.5" /></button>
                            <button type="button" onClick={() => handleAdminDelete(hive.id)} className="bg-slate-900 hover:bg-rose-950/40 p-1.5 rounded-lg border border-slate-800 text-rose-400 hover:text-rose-200 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Рендеринг LOGS */}
                {adminSelectedTable === 'logs' && (
                  <div>
                    <div className="grid grid-cols-12 bg-slate-900 px-4 py-3 text-xs font-bold text-slate-400 border-b border-slate-800 font-mono">
                      <div className="col-span-2">Время</div>
                      <div className="col-span-3">Локация</div>
                      <div className="col-span-4">Событие</div>
                      <div className="col-span-1">Класс</div>
                      <div className="col-span-2 text-right">Действия</div>
                    </div>
                    <div className="divide-y divide-slate-900/80 font-mono">
                      {securityLog.map(log => (
                        <div key={log.id} className="grid grid-cols-12 px-4 py-3.5 text-xs text-slate-300 hover:bg-violet-950/10 items-center transition-colors">
                          <div className="col-span-2 text-slate-500">{log.time}</div>
                          <div className="col-span-3 text-slate-200">{log.location}</div>
                          <div className="col-span-4 text-slate-400 text-[11px] truncate">{log.event}</div>
                          <div className="col-span-1">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${log.severity === 'high' ? 'bg-rose-500/10 text-rose-400' : log.severity === 'warning' ? 'bg-amber-500/10 text-amber-400' : 'bg-slate-800 text-slate-400'}`}>
                              {log.severity}
                            </span>
                          </div>
                          <div className="col-span-2 flex justify-end gap-1">
                            <button type="button" onClick={() => handleAdminEditClick(log)} className="bg-slate-900 hover:bg-slate-800 p-1.5 rounded-lg border border-slate-800 text-violet-300 hover:text-white transition-all"><Edit className="w-3.5 h-3.5" /></button>
                            <button type="button" onClick={() => handleAdminDelete(log.id)} className="bg-slate-900 hover:bg-rose-950/40 p-1.5 rounded-lg border border-slate-800 text-rose-400 hover:text-rose-200 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
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
