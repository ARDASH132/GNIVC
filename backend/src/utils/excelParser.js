const XLSX = require('xlsx');
const db = require('../database/db');
const path = require('path');

async function parseExcelAndSaveToDB(filePath) {
  try {
    console.log('📖 Чтение Excel файла...');
    
    // Чтение файла
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Конвертация в JSON
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    console.log(`📊 Найдено ${data.length - 1} записей`);
    
    // Пропускаем заголовки
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      
      // Предполагаемая структура Excel (на основе вашего файла)
      const [publicationDate, messageType, debtorName, inn, address, publishedBy] = row;
      
      // Вставляем в БД
      await db.query(
        `INSERT INTO bankruptcies 
         (publication_date, message_type, debtor_name, inn, address, published_by) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [publicationDate, messageType, debtorName, inn, address, publishedBy]
      );
      
      if (i % 100 === 0) {
        console.log(`✅ Обработано ${i} записей`);
      }
    }
    
    console.log('✅ Все данные успешно сохранены в базу данных');
    
  } catch (error) {
    console.error('❌ Ошибка при парсинге Excel:', error);
  }
}

// Для запуска из командной строки
if (require.main === module) {
  const filePath = path.join(__dirname, '../../MessageSearchResult.xls');
  parseExcelAndSaveToDB(filePath)
    .then(() => process.exit(0))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { parseExcelAndSaveToDB };