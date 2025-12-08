const { Pool } = require('pg');
require('dotenv').config();

// Для Railway PostgreSQL используем connection string
const connectionString = process.env.DATABASE_URL;

// Проверяем наличие connection string
if (!connectionString) {
    console.error('❌ DATABASE_URL не найден в переменных окружения');
    console.log('💡 На Railway: добавьте PostgreSQL через панель управления');
    console.log('💡 Локально: создайте .env файл с DATABASE_URL');
}

// Создаем пул соединений
const pool = new Pool({
    connectionString: connectionString,
    ssl: {
        rejectUnauthorized: false // Обязательно для Railway
    }
});

// Функция для инициализации базы данных
async function initDatabase() {
    const client = await pool.connect();
    
    try {
        console.log('🚀 Инициализация базы данных на Railway...');
        
        // Проверяем существующие таблицы
        const tablesResult = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        
        const existingTables = tablesResult.rows.map(row => row.table_name);
        console.log('📋 Существующие таблицы:', existingTables);
        
        // Создаем таблицы, если их нет
        if (!existingTables.includes('users')) {
            await client.query(`
                CREATE TABLE users (
                    id SERIAL PRIMARY KEY,
                    inn VARCHAR(20) UNIQUE NOT NULL,
                    last_name VARCHAR(100) NOT NULL,
                    first_name VARCHAR(100) NOT NULL,
                    middle_name VARCHAR(100),
                    birth_date DATE,
                    has_passport BOOLEAN DEFAULT FALSE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);
            console.log('✅ Таблица users создана');
        }
        
        if (!existingTables.includes('passports')) {
            await client.query(`
                CREATE TABLE passports (
                    id SERIAL PRIMARY KEY,
                    user_id INTEGER NOT NULL,
                    passport_series VARCHAR(10) NOT NULL,
                    passport_number VARCHAR(20) NOT NULL,
                    passport_issued_by TEXT NOT NULL,
                    passport_issue_date DATE NOT NULL,
                    passport_department_code VARCHAR(10) NOT NULL,
                    verified BOOLEAN DEFAULT FALSE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                )
            `);
            console.log('✅ Таблица passports создана');
        }
        
        if (!existingTables.includes('admins')) {
            await client.query(`
                CREATE TABLE admins (
                    id SERIAL PRIMARY KEY,
                    username VARCHAR(50) UNIQUE NOT NULL,
                    password_hash VARCHAR(255) NOT NULL,
                    full_name VARCHAR(150) NOT NULL,
                    role VARCHAR(50) DEFAULT 'operator',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);
            console.log('✅ Таблица admins создана');
        }
        
        if (!existingTables.includes('temp_users')) {
            await client.query(`
                CREATE TABLE temp_users (
                    id SERIAL PRIMARY KEY,
                    inn VARCHAR(20) UNIQUE NOT NULL,
                    last_name VARCHAR(100) NOT NULL,
                    first_name VARCHAR(100) NOT NULL,
                    middle_name VARCHAR(100),
                    birth_date DATE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);
            console.log('✅ Таблица temp_users создана');
        }
        
        // Проверяем наличие тестовых данных
        const adminCount = await client.query('SELECT COUNT(*) FROM admins');
        if (parseInt(adminCount.rows[0].count) === 0) {
            // Хешируем пароли
            const bcrypt = require('bcryptjs');
            const adminHash = await bcrypt.hash('admin123', 10);
            const operatorHash = await bcrypt.hash('operator123', 10);
            const supportHash = await bcrypt.hash('support123', 10);
            
            // Добавляем администраторов
            await client.query(`
                INSERT INTO admins (username, password_hash, full_name, role) 
                VALUES 
                ('admin', $1, 'Главный администратор', 'admin'),
                ('operator', $2, 'Оператор системы', 'operator'),
                ('support', $3, 'Техническая поддержка', 'support')
            `, [adminHash, operatorHash, supportHash]);
            
            console.log('✅ Тестовые администраторы добавлены');
        }
        
        console.log('🎉 База данных готова к работе!');
        
    } catch (error) {
        console.error('❌ Ошибка инициализации базы данных:', error.message);
    } finally {
        client.release();
    }
}

// Вызываем инициализацию при старте
initDatabase();

// Экспортируем методы для работы с БД
module.exports = {
    // Базовый запрос
    query: (text, params) => pool.query(text, params),
    
    // Пользователи
    getUserByInn: async (inn) => {
        const result = await pool.query('SELECT * FROM users WHERE inn = $1', [inn]);
        return result.rows[0];
    },
    
    getTempUserByInn: async (inn) => {
        const result = await pool.query('SELECT * FROM temp_users WHERE inn = $1', [inn]);
        return result.rows[0];
    },
    
    getAdminByUsername: async (username) => {
        const result = await pool.query('SELECT * FROM admins WHERE username = $1', [username]);
        return result.rows[0];
    },
    
    getPassportByUserId: async (userId) => {
        const result = await pool.query(
            'SELECT * FROM passports WHERE user_id = $1 AND verified = true', 
            [userId]
        );
        return result.rows[0];
    },
    
    // Создание
    createUser: async (userData) => {
        const { inn, lastName, firstName, middleName, birthDate } = userData;
        const result = await pool.query(
            `INSERT INTO users (inn, last_name, first_name, middle_name, birth_date) 
             VALUES ($1, $2, $3, $4, $5) 
             RETURNING *`,
            [inn, lastName, firstName, middleName, birthDate]
        );
        return result.rows[0];
    },
    
    createTempUser: async (userData) => {
        const { inn, lastName, firstName, middleName, birthDate } = userData;
        const result = await pool.query(
            `INSERT INTO temp_users (inn, last_name, first_name, middle_name, birth_date) 
             VALUES ($1, $2, $3, $4, $5) 
             ON CONFLICT (inn) DO UPDATE SET
             last_name = EXCLUDED.last_name,
             first_name = EXCLUDED.first_name,
             middle_name = EXCLUDED.middle_name,
             birth_date = EXCLUDED.birth_date
             RETURNING *`,
            [inn, lastName, firstName, middleName, birthDate]
        );
        return result.rows[0];
    },
    
    createPassport: async (passportData) => {
        const { userId, passportSeries, passportNumber, passportIssuedBy, 
                passportIssueDate, passportDepartmentCode } = passportData;
        
        const client = await pool.connect();
        
        try {
            await client.query('BEGIN');
            
            // Добавляем паспорт
            const passportResult = await client.query(
                `INSERT INTO passports 
                 (user_id, passport_series, passport_number, passport_issued_by, 
                  passport_issue_date, passport_department_code, verified) 
                 VALUES ($1, $2, $3, $4, $5, $6, true) 
                 RETURNING *`,
                [userId, passportSeries, passportNumber, passportIssuedBy, 
                 passportIssueDate, passportDepartmentCode]
            );
            
            // Обновляем статус пользователя
            await client.query(
                'UPDATE users SET has_passport = true WHERE id = $1',
                [userId]
            );
            
            // Удаляем из временной базы
            const user = await client.query('SELECT inn FROM users WHERE id = $1', [userId]);
            if (user.rows[0]) {
                await client.query('DELETE FROM temp_users WHERE inn = $1', [user.rows[0].inn]);
            }
            
            await client.query('COMMIT');
            
            return passportResult.rows[0];
            
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    },
    
    // Удаление
    deleteTempUser: async (inn) => {
        await pool.query('DELETE FROM temp_users WHERE inn = $1', [inn]);
    }
};