const db = require('../database/db');
const bcrypt = require('bcrypt');

class Admin {
  // Поиск администратора по логину
  static async findByUsername(username) {
    const result = await db.query(
      'SELECT * FROM admins WHERE username = $1',
      [username]
    );
    return result.rows[0];
  }

  // Создание администратора (для инициализации)
  static async create(adminData) {
    const { username, password, fullName } = adminData;
    const passwordHash = await bcrypt.hash(password, 10);

    const result = await db.query(
      `INSERT INTO admins (username, password_hash, full_name) 
       VALUES ($1, $2, $3) 
       RETURNING id, username, full_name, created_at`,
      [username, passwordHash, fullName]
    );
    return result.rows[0];
  }

  // Проверка пароля
  static async checkPassword(admin, password) {
    return await bcrypt.compare(password, admin.password_hash);
  }
}

module.exports = Admin;