const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Admin = require('../models/Admin');

// Проверка/создание пользователя
router.post('/check-user', async (req, res) => {
  try {
    const { inn, lastName, firstName, middleName, birthDate, snils } = req.body;

    // Проверяем существующего пользователя
    const existingUser = await User.findByINN(inn);

    if (existingUser) {
      // Пользователь уже существует
      return res.json({
        success: true,
        message: 'Пользователь найден в системе',
        userExists: true,
        userId: existingUser.id,
        requiresPassport: true // Переходим к паспортным данным
      });
    } else {
      // Создаем нового пользователя
      const newUser = await User.create({
        inn,
        lastName,
        firstName,
        middleName,
        birthDate,
        snils
      });

      return res.json({
        success: true,
        message: 'Новый пользователь создан',
        userExists: false,
        userId: newUser.id,
        requiresPassport: true
      });
    }
  } catch (error) {
    console.error('Ошибка проверки пользователя:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ошибка сервера при проверке пользователя' 
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

    // Ищем пользователя
    const user = await User.findByINN(inn);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Пользователь не найден' 
      });
    }

    // Проверяем, совпадают ли паспортные данные
    const passportMatch = await User.checkPassport(
      inn, 
      passportSeries, 
      passportNumber
    );

    let requiresAdminVerification = false;

    if (passportMatch) {
      // Паспорт совпадает с предыдущим
      await User.updatePassport(user.id, {
        passportSeries,
        passportNumber,
        passportIssuedBy,
        passportIssueDate,
        passportDepartmentCode
      });
    } else if (user.passport_series) {
      // Паспортные данные изменились - требуется проверка администратора
      requiresAdminVerification = true;
      await User.updatePassport(user.id, {
        passportSeries,
        passportNumber,
        passportIssuedBy,
        passportIssueDate,
        passportDepartmentCode
      });
      await User.flagForAdminVerification(user.id);
    } else {
      // Первая запись паспортных данных
      await User.updatePassport(user.id, {
        passportSeries,
        passportNumber,
        passportIssuedBy,
        passportIssueDate,
        passportDepartmentCode
      });
    }

    res.json({
      success: true,
      message: requiresAdminVerification 
        ? 'Паспортные данные изменены. Требуется проверка администратора.' 
        : 'Паспортные данные сохранены',
      passportMatch: !!passportMatch,
      requiresAdminVerification,
      userId: user.id
    });
  } catch (error) {
    console.error('Ошибка добавления паспорта:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ошибка сервера при сохранении паспортных данных' 
    });
  }
});

// Подтверждение пользователя (фейковая "Госуслуги")
router.post('/verify-user', async (req, res) => {
  try {
    const { inn } = req.body;

    const user = await User.findByINN(inn);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Пользователь не найден' 
      });
    }

    // Если требуется проверка администратора
    if (user.requires_admin_verification) {
      return res.json({
        success: true,
        message: 'Требуется проверка администратора',
        passportMatch: false,
        requiresAdminVerification: true,
        redirect: '/pending.html' // Страница ожидания проверки
      });
    }

    // Если все в порядке - подтверждаем
    await User.verifyUser(inn);

    res.json({
      success: true,
      message: 'Пользователь подтвержден',
      passportMatch: true,
      redirect: '/HtmlPagek.html' // Главная страница пользователя
    });
  } catch (error) {
    console.error('Ошибка подтверждения:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ошибка сервера при подтверждении' 
    });
  }
});

// Авторизация администратора
router.post('/admin-login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Ищем администратора
    const admin = await Admin.findByUsername(username);
    if (!admin) {
      return res.status(401).json({ 
        success: false, 
        message: 'Неверные учетные данные' 
      });
    }

    // Проверяем пароль
    const passwordValid = await Admin.checkPassword(admin, password);
    if (!passwordValid) {
      return res.status(401).json({ 
        success: false, 
        message: 'Неверные учетные данные' 
      });
    }

    // Успешная авторизация
    res.json({
      success: true,
      message: 'Авторизация успешна',
      admin: {
        id: admin.id,
        username: admin.username,
        fullName: admin.full_name
      },
      redirect: '/admin_input.html'
    });
  } catch (error) {
    console.error('Ошибка авторизации администратора:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ошибка сервера при авторизации' 
    });
  }
});

module.exports = router;