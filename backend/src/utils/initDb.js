const bcrypt = require('bcrypt');
const db = require('../database/db');

async function initializeDatabase() {
  try {
    // Создаем тестового администратора если его нет
    const adminCheck = await db.query(
      'SELECT * FROM admins WHERE username = $1',
      ['admin']
    );

    if (adminCheck.rows.length === 0) {
      const passwordHash = await bcrypt.hash('admin123', 10);
      
      await db.query(
        `INSERT INTO admins (username, password_hash, full_name) 
         VALUES ($1, $2, $3)`,
        ['admin', passwordHash, 'Администратор Системы']
      );
      
      console.log('✅ Тестовый администратор создан');
      console.log('👤 Логин: admin');
      console.log('🔑 Пароль: admin123');
    }

    // Проверяем таблицу пользователей
    const userCount = await db.query('SELECT COUNT(*) FROM users');
    console.log(`👥 Пользователей в системе: ${userCount.rows[0].count}`);

  } catch (error) {
    console.error('❌ Ошибка инициализации БД:', error);
    throw error;
  }
}

module.exports = { initializeDatabase };