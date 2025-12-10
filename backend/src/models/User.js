const db = require('../database/db');

class User {
  // Проверка существования пользователя по ИНН
  static async findByINN(inn) {
    const result = await db.query(
      'SELECT * FROM users WHERE inn = $1',
      [inn]
    );
    return result.rows[0];
  }

  // Проверка паспортных данных
  static async checkPassport(inn, passportSeries, passportNumber) {
    const result = await db.query(
      `SELECT * FROM users 
       WHERE inn = $1 
       AND passport_series = $2 
       AND passport_number = $3`,
      [inn, passportSeries, passportNumber]
    );
    return result.rows[0];
  }

  // Создание нового пользователя
  static async create(userData) {
    const {
      inn,
      lastName,
      firstName,
      middleName,
      birthDate,
      snils
    } = userData;

    const result = await db.query(
      `INSERT INTO users 
       (inn, last_name, first_name, middle_name, birth_date, snils) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [inn, lastName, firstName, middleName, birthDate, snils]
    );
    return result.rows[0];
  }

  // Обновление паспортных данных
  static async updatePassport(userId, passportData) {
    const {
      passportSeries,
      passportNumber,
      passportIssuedBy,
      passportIssueDate,
      passportDepartmentCode
    } = passportData;

    const result = await db.query(
      `UPDATE users 
       SET passport_series = $1, 
           passport_number = $2, 
           passport_issued_by = $3, 
           passport_issue_date = $4, 
           passport_department_code = $5,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $6 
       RETURNING *`,
      [passportSeries, passportNumber, passportIssuedBy, 
       passportIssueDate, passportDepartmentCode, userId]
    );
    return result.rows[0];
  }

  // Пометить, что требуется проверка администратора
  static async flagForAdminVerification(userId) {
    await db.query(
      'UPDATE users SET requires_admin_verification = true WHERE id = $1',
      [userId]
    );
  }

  // Подтвердить пользователя
  static async verifyUser(inn) {
    await db.query(
      'UPDATE users SET is_verified = true WHERE inn = $1',
      [inn]
    );
  }
}

module.exports = User;