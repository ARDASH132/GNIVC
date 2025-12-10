const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const { initializeDatabase } = require('./utils/initDb');

const app = express();
const PORT = process.env.PORT || 3000;

// Лимит запросов для безопасности
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 100 // лимит 100 запросов с одного IP
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(limiter);

// Логирование запросов
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Маршруты
app.use('/api/auth', authRoutes);

// Health check для Railway
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString() 
  });
});

// Основной API endpoint
app.get('/api', (req, res) => {
  res.json({ 
    message: 'API системы авторизации', 
    version: '1.0.0' 
  });
});

// Обработка ошибок
app.use((err, req, res, next) => {
  console.error('❌ Ошибка сервера:', err);
  res.status(500).json({ 
    success: false, 
    message: 'Внутренняя ошибка сервера' 
  });
});

// Запуск сервера
app.listen(PORT, async () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
  
  // Инициализация БД (создание тестового админа если нужно)
  try {
    await initializeDatabase();
    console.log('✅ База данных инициализирована');
  } catch (error) {
    console.error('❌ Ошибка инициализации БД:', error);
  }
});

module.exports = app;