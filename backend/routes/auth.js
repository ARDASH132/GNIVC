const express = require('express');
const router = express.Router();
const db = require('../database');
const bcrypt = require('bcryptjs');

// Проверка пользователя (гражданина)
router.post('/check-user', async (req, res) => {
    try {
        const { inn, lastName, firstName, middleName } = req.body;
        
        console.log('🔍 Проверка пользователя:', { inn, lastName, firstName });

        // Проверяем, есть ли пользователь в основной базе
        const user = await db.getUserByInn(inn);
        
        if (user) {
            // Проверяем совпадение имени и фамилии
            if (user.last_name === lastName && user.first_name === firstName) {
                // Проверяем, есть ли у него паспорт
                const passport = await db.getPassportByUserId(user.id);
                
                if (passport) {
                    // Пользователь есть, паспорт есть - вход разрешен
                    return res.json({
                        success: true,
                        message: 'Пользователь найден',
                        user: {
                            id: user.id,
                            fullName: `${user.last_name} ${user.first_name} ${user.middle_name || ''}`.trim(),
                            inn: user.inn
                        },
                        hasPassport: true,
                        redirect: '/account'
                    });
                } else {
                    // Пользователь есть, но паспорта нет
                    return res.json({
                        success: true,
                        message: 'Пользователь найден, но требуется паспорт',
                        user: {
                            id: user.id,
                            inn: user.inn
                        },
                        hasPassport: false,
                        redirect: '/add-passport'
                    });
                }
            } else {
                return res.status(400).json({
                    success: false,
                    message: 'Данные не совпадают с зарегистрированными'
                });
            }
        } else {
            // Пользователя нет - сохраняем во временную базу
            const tempUserData = {
                inn: inn,
                last_name: lastName,
                first_name: firstName,
                middle_name: middleName || null,
                birth_date: req.body.birthDate || null
            };
            
            await db.createTempUser(tempUserData);
            
            return res.json({
                success: true,
                message: 'Пользователь добавлен во временную базу',
                isNewUser: true,
                inn: inn,
                redirect: '/add-passport'
            });
        }
    } catch (error) {
        console.error('❌ Ошибка проверки пользователя:', error.message);
        res.status(500).json({ 
            success: false, 
            message: 'Ошибка сервера',
            error: error.message 
        });
    }
});

// Добавление паспортных данных
router.post('/add-passport', async (req, res) => {
    try {
        const {
            inn,
            passportSeries,
            passportNumber,
            passportIssuedBy,
            passportIssueDate,
            passportDepartmentCode
        } = req.body;

        console.log('📝 Добавление паспорта для ИНН:', inn);

        // Находим пользователя во временной базе
        const tempUser = await db.getTempUserByInn(inn);

        if (!tempUser) {
            return res.status(400).json({
                success: false,
                message: 'Пользователь не найден во временной базе'
            });
        }

        // Проверяем, есть ли уже пользователь с таким ИНН
        let user = await db.getUserByInn(inn);

        if (!user) {
            // Создаем нового пользователя
            const userData = {
                inn: tempUser.inn,
                last_name: tempUser.last_name,
                first_name: tempUser.first_name,
                middle_name: tempUser.middle_name,
                birth_date: tempUser.birth_date
            };
            
            user = await db.createUser(userData);
        }

        // Добавляем паспортные данные
        const passportData = {
            user_id: user.id,
            passport_series: passportSeries,
            passport_number: passportNumber,
            passport_issued_by: passportIssuedBy,
            passport_issue_date: passportIssueDate,
            passport_department_code: passportDepartmentCode
        };
        
        await db.createPassport(passportData);

        // Обновляем статус пользователя
        await db.updateUserPassportStatus(user.id, true);

        // Удаляем из временной базы
        await db.deleteTempUser(inn);

        return res.json({
            success: true,
            message: 'Паспортные данные успешно добавлены',
            user: {
                id: user.id,
                fullName: `${user.last_name} ${user.first_name} ${user.middle_name || ''}`.trim()
            },
            redirect: '/account'
        });

    } catch (error) {
        console.error('❌ Ошибка добавления паспорта:', error.message);
        res.status(500).json({ 
            success: false, 
            message: 'Ошибка сервера',
            error: error.message 
        });
    }
});

// Авторизация администратора
router.post('/admin-login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        console.log('🔐 Авторизация администратора:', username);

        // Находим администратора
        const admin = await db.getAdminByUsername(username);

        if (!admin) {
            return res.status(401).json({
                success: false,
                message: 'Неверные учетные данные'
            });
        }

        // Проверяем пароль
        const isValid = await bcrypt.compare(password, admin.password_hash);

        if (isValid) {
            return res.json({
                success: true,
                message: 'Вход выполнен успешно',
                admin: {
                    id: admin.id,
                    username: admin.username,
                    fullName: admin.full_name,
                    role: admin.role
                },
                redirect: '/admin/dashboard'
            });
        } else {
            return res.status(401).json({
                success: false,
                message: 'Неверные учетные данные'
            });
        }
    } catch (error) {
        console.error('❌ Ошибка авторизации администратора:', error.message);
        res.status(500).json({ 
            success: false, 
            message: 'Ошибка сервера',
            error: error.message 
        });
    }
});

// Получение данных пользователя
router.get('/user/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        
        // Получаем данные пользователя
        const userResult = await db.query(`
            SELECT u.*, p.* 
            FROM users u 
            LEFT JOIN passports p ON u.id = p.user_id AND p.verified = true
            WHERE u.id = $1
        `, [userId]);

        if (userResult.rows.length > 0) {
            const user = userResult.rows[0];
            res.json({ 
                success: true, 
                user: {
                    id: user.id,
                    inn: user.inn,
                    fullName: `${user.last_name} ${user.first_name} ${user.middle_name || ''}`.trim(),
                    birthDate: user.birth_date,
                    passport: user.passport_series && user.passport_number 
                        ? `${user.passport_series} ${user.passport_number}` 
                        : null,
                    passportIssuedBy: user.passport_issued_by,
                    passportIssueDate: user.passport_issue_date
                }
            });
        } else {
            res.status(404).json({ 
                success: false, 
                message: 'Пользователь не найден' 
            });
        }
    } catch (error) {
        console.error('❌ Ошибка получения данных пользователя:', error.message);
        res.status(500).json({ 
            success: false, 
            message: 'Ошибка сервера',
            error: error.message 
        });
    }
});

// Получение статистики (для админки)
router.get('/stats', async (req, res) => {
    try {
        const usersCount = await db.query('SELECT COUNT(*) FROM users');
        const adminsCount = await db.query('SELECT COUNT(*) FROM admins');
        const passportsCount = await db.query('SELECT COUNT(*) FROM passports WHERE verified = true');
        
        res.json({
            success: true,
            stats: {
                users: parseInt(usersCount.rows[0].count),
                admins: parseInt(adminsCount.rows[0].count),
                passports: parseInt(passportsCount.rows[0].count)
            }
        });
    } catch (error) {
        console.error('❌ Ошибка получения статистики:', error.message);
        res.status(500).json({ 
            success: false, 
            message: 'Ошибка сервера' 
        });
    }
});

// Тестовый маршрут для проверки соединения
router.get('/test-db', async (req, res) => {
    try {
        const result = await db.query('SELECT version() as version, current_timestamp as time');
        res.json({
            success: true,
            message: 'База данных работает',
            database: {
                version: result.rows[0].version,
                time: result.rows[0].time
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Ошибка подключения к базе данных',
            error: error.message
        });
    }
});

module.exports = router;