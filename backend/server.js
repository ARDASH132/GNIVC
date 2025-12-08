const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Статические файлы фронтенда
app.use(express.static(path.join(__dirname, '../frontend')));

// Простая проверка для Railway healthcheck
app.get('/', (req, res) => {
    res.json({
        status: 'ok',
        service: 'Государственная система авторизации',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// Маршруты API
app.use('/api/auth', authRoutes);

// Проверка работоспособности (без БД для Railway)
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'Государственная система авторизации',
        environment: process.env.NODE_ENV || 'development'
    });
});

// Проверка БД (отдельно)
app.get('/api/health/db', async (req, res) => {
    try {
        await db.query('SELECT 1');
        res.json({
            status: 'healthy',
            database: 'connected',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            status: 'unhealthy',
            database: 'disconnected',
            error: error.message
        });
    }
});

// Тестовая страница
app.get('/api/test', (req, res) => {
    res.json({
        success: true,
        message: '🚀 API работает!',
        timestamp: new Date().toISOString(),
        endpoints: {
            health: '/api/health',
            healthDb: '/api/health/db',
            checkUser: 'POST /api/auth/check-user',
            addPassport: 'POST /api/auth/add-passport',
            adminLogin: 'POST /api/auth/admin-login'
        }
    });
});

// Остальные маршруты оставьте как есть...

// Запуск сервера
app.listen(PORT, () => {
    console.log('========================================');
    console.log('🚀 Государственная система авторизации');
    console.log(`📡 Порт: ${PORT}`);
    console.log(`🌍 Окружение: ${process.env.NODE_ENV || 'development'}`);
    console.log('========================================');
    console.log(`✅ Сервер запущен`);
    console.log(`🔧 Healthcheck: http://localhost:${PORT}/`);
    console.log(`🔧 API Health: http://localhost:${PORT}/api/health`);
    console.log(`👤 Фронтенд: http://localhost:${PORT}`);
    console.log('========================================');
});