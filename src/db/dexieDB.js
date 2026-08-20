import Dexie from 'dexie';

export const db = new Dexie('EcoSynapseDB');

db.version(1).stores({
  telemetry: '++id, timestamp, farm, temp, pH, do, salinity, soilMoisture',
  rfidRegistry: 'rfidTag, type, age, lastCleaned, density, species, status',
  coffeeBatches: 'id, variety, stage, moisture, brix, temp',
  vanillaPollination: '++id, sector, count, date',
  securityLogs: '++id, time, location, event, severity'
});

export async function seedDatabase() {
  const rfidCount = await db.rfidRegistry.count();
  if (rfidCount === 0) {
    await db.rfidRegistry.bulkAdd([
      { rfidTag: 'RFID-PAL-001', type: 'Сетка жемчужниц', age: '18 месяцев', lastCleaned: '2026-08-10', density: '45 шт/сетка', species: 'Pinctada maxima', status: 'Норма' },
      { rfidTag: 'RFID-PAL-002', type: 'Сетка жемчужниц', age: '24 месяца', lastCleaned: '2026-08-05', density: '40 шт/сетка', species: 'Pinctada maxima', status: 'Требуется чистка' },
      { rfidTag: 'RFID-PAL-003', type: 'Садок с лангустами', age: '8 месяцев', lastCleaned: '2026-08-15', density: '15 шт/садок', species: 'Panulirus ornatus', status: 'Норма' }
    ]);
  }

  const logCount = await db.securityLogs.count();
  if (logCount === 0) {
    await db.securityLogs.bulkAdd([
      { time: '14:23:10', location: 'Буй №4 (Палаван)', event: 'AI-радар обнаружил неопознанное плавсредство на дистанции 800м. Оповещение отправлено.', severity: 'high' },
      { time: '13:05:45', location: 'Сектор А3 (Коста-Рика)', event: 'Автоматический полив включен. Температура почвы >28°C. Расход: 450л.', severity: 'info' }
    ]);
  }
}
