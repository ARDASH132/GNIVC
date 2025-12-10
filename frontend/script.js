document.addEventListener('DOMContentLoaded', function() {
    // Основные элементы
    const authTypeSelector = document.getElementById('authTypeSelector');
    const userAuthSection = document.getElementById('userAuthSection');
    const adminAuthSection = document.getElementById('adminAuthSection');
    
    // Кнопки выбора типа авторизации
    const selectTypeButtons = document.querySelectorAll('.btn-select-type');
    const authTypeCards = document.querySelectorAll('.auth-type-card');
    const mobileMenuItems = document.querySelectorAll('.mobile-menu-item[data-section]');
    const mobileNavItems = document.querySelectorAll('.nav-item[data-section]');
    
    // Мобильное меню
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenuClose = document.getElementById('mobileMenuClose');
    const mobileMenu = document.getElementById('mobileMenu');
    
    // Пользовательская авторизация
    const personalDataForm = document.getElementById('personalDataForm');
    const passportDataForm = document.getElementById('passportDataForm');
    const gosuslugiForm = document.getElementById('gosuslugiForm');
    const userSuccessStep = document.getElementById('userSuccessStep');
    const userBackToSelect = document.getElementById('userBackToSelect');
    const userLogoutBtn = document.getElementById('userLogoutBtn');
    
    // Кнопки навигации пользователя
    const backToPersonalData = document.getElementById('backToPersonalData');
    const backToPassportData = document.getElementById('backToPassportData');
    const continueToSystem = document.getElementById('continueToSystem');
    
    // Административная авторизация
    const adminLoginForm = document.getElementById('adminLoginForm');
    const adminLoginInput = document.getElementById('adminLogin');
    const adminPasswordInput = document.getElementById('adminPassword');
    const adminBackToSelect = document.getElementById('adminBackToSelect');
    const adminSuccessMessage = document.getElementById('adminSuccessMessage');
    
    // Данные пользователя
    const lastNameInput = document.getElementById('lastName');
    const firstNameInput = document.getElementById('firstName');
    const middleNameInput = document.getElementById('middleName');
    const birthDateInput = document.getElementById('birthDate');
    const snilsInput = document.getElementById('snils');
    
    // Паспортные данные
    const passportSeriesInput = document.getElementById('passportSeries');
    const passportNumberInput = document.getElementById('passportNumber');
    const passportIssuedByInput = document.getElementById('passportIssuedBy');
    const passportIssueDateInput = document.getElementById('passportIssueDate');
    const passportDepartmentCodeInput = document.getElementById('passportDepartmentCode');
    
    // Элементы для подтверждения
    const confirmFullName = document.getElementById('confirmFullName');
    const confirmBirthDate = document.getElementById('confirmBirthDate');
    const confirmSnils = document.getElementById('confirmSnils');
    const confirmPassport = document.getElementById('confirmPassport');
    
    // Элементы приветствия
    const welcomeName = document.getElementById('welcomeName');
    const welcomeBirthDate = document.getElementById('welcomeBirthDate');
    const welcomeSnils = document.getElementById('welcomeSnils');
    const adminWelcomeName = document.getElementById('adminWelcomeName');
    
    // Переменные состояния
    let currentAuthType = 'user';
    let userData = {};
    let currentUserStep = 0;
    let requiresAdminVerification = false;
    let passportMatchStatus = null;
    
    // API базовый URL
    const API_BASE_URL = window.location.origin.includes('localhost') 
        ? 'http://localhost:3000/api' 
        : '/api';
    
    // ====================
    // ОБЩИЕ ФУНКЦИИ
    // ====================
    
    // Переключение типа авторизации
    function switchAuthType(type) {
        currentAuthType = type;
        
        // Скрыть все секции
        authTypeSelector.style.display = 'none';
        userAuthSection.style.display = 'none';
        adminAuthSection.style.display = 'none';
        
        // Сбросить активные карточки
        authTypeCards.forEach(card => {
            card.classList.remove('active');
        });
        
        // Показать выбранную секцию
        if (type === 'user') {
            userAuthSection.style.display = 'block';
            document.querySelector('.auth-type-card[data-type="user"]').classList.add('active');
            resetUserAuth();
        } else if (type === 'admin') {
            adminAuthSection.style.display = 'block';
            document.querySelector('.auth-type-card[data-type="admin"]').classList.add('active');
            resetAdminAuth();
        }
        
        // Обновить мобильное меню
        updateMobileMenu(type);
        
        // Закрыть мобильное меню
        mobileMenu.classList.remove('open');
    }
    
    // Возврат к выбору типа
    function backToTypeSelector() {
        authTypeSelector.style.display = 'block';
        userAuthSection.style.display = 'none';
        adminAuthSection.style.display = 'none';
        
        // Сбросить все формы
        resetUserAuth();
        resetAdminAuth();
        
        mobileMenu.classList.remove('open');
    }
    
    // Обновление мобильного меню
    function updateMobileMenu(type) {
        mobileMenuItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('data-section') === `${type}-auth`) {
                item.classList.add('active');
            }
        });
        
        mobileNavItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('data-section') === `${type}-auth`) {
                item.classList.add('active');
            }
        });
    }
    
    // Показать уведомление
    function showNotification(message, type = 'info') {
        const colors = {
            info: '#1a73e8',
            success: '#34a853',
            error: '#d93025',
            warning: '#f9ab00'
        };
        
        const notification = document.createElement('div');
        notification.className = 'mobile-notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            left: 50%;
            transform: translateX(-50%);
            background-color: ${colors[type]};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            z-index: 1002;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            max-width: 90%;
            text-align: center;
            animation: slideDown 0.3s ease;
        `;
        
        // Добавить стиль анимации
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideDown {
                from { top: 60px; opacity: 0; }
                to { top: 80px; opacity: 1; }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transition = 'opacity 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    document.body.removeChild(notification);
                }
                if (style.parentNode) {
                    document.head.removeChild(style);
                }
            }, 300);
        }, 3000);
    }
    
    // ====================
    // ПОЛЬЗОВАТЕЛЬСКАЯ АВТОРИЗАЦИЯ
    // ====================
    
    // Сброс пользовательской авторизации
    function resetUserAuth() {
        personalDataForm.reset();
        passportDataForm.reset();
        gosuslugiForm.reset();
        document.getElementById('passportConsent').checked = false;
        document.getElementById('gosuslugiConsent').checked = false;
        userSuccessStep.style.display = 'none';
        personalDataForm.classList.add('active');
        passportDataForm.classList.remove('active');
        gosuslugiForm.classList.remove('active');
        currentUserStep = 0;
        updateUserProgress();
        userData = {};
        requiresAdminVerification = false;
        passportMatchStatus = null;
    }
    
    // Обновление прогресса пользователя
    function updateUserProgress() {
        const steps = userAuthSection.querySelectorAll('.step');
        const mobileProgress = document.getElementById('userMobileProgressFill');
        
        steps.forEach((stepEl, index) => {
            if (index <= currentUserStep) {
                stepEl.classList.add('active');
            } else {
                stepEl.classList.remove('active');
            }
        });
        
        if (mobileProgress) {
            const progress = currentUserStep === 0 ? '33%' : 
                           currentUserStep === 1 ? '66%' : '100%';
            mobileProgress.style.width = progress;
        }
    }
    
    // Переход между шагами пользователя
    function goToUserStep(step) {
        currentUserStep = step;
        
        // Скрыть все шаги
        const userFormSteps = userAuthSection.querySelectorAll('.form-step');
        userFormSteps.forEach(step => step.classList.remove('active'));
        
        // Показать нужный шаг
        if (step === 0) {
            personalDataForm.classList.add('active');
        } else if (step === 1) {
            // ВСЕГДА очищаем форму паспортных данных
            passportDataForm.reset();
            document.getElementById('passportConsent').checked = false;
            passportDataForm.classList.add('active');
        } else if (step === 2) {
            gosuslugiForm.classList.add('active');
            updateConfirmationData();
            updateVerificationWarning();
        } else if (step === 3) {
            userSuccessStep.classList.add('active');
            updateWelcomeData();
        }
        
        updateUserProgress();
        
        // Прокрутить вверх на мобильных
        if (window.innerWidth <= 768) {
            window.scrollTo({top: 0, behavior: 'smooth'});
        }
    }
    
    // Обновление данных для подтверждения
    function updateConfirmationData() {
        if (userData.lastName && userData.firstName) {
            let fullName = `${userData.lastName} ${userData.firstName}`;
            if (userData.middleName) {
                fullName += ` ${userData.middleName}`;
            }
            confirmFullName.textContent = fullName;
        }
        
        if (userData.birthDate) {
            const date = new Date(userData.birthDate);
            confirmBirthDate.textContent = date.toLocaleDateString('ru-RU');
        }
        
        if (userData.snils) {
            confirmSnils.textContent = userData.snils;
        }
        
        if (userData.passportSeries && userData.passportNumber) {
            confirmPassport.textContent = `${userData.passportSeries} ${userData.passportNumber}`;
            
            // Добавляем статус проверки
            let statusText = '';
            let statusColor = 'gray';
            
            if (passportMatchStatus === true) {
                statusText = ' ✓ Совпадает с предыдущими данными';
                statusColor = 'green';
            } else if (passportMatchStatus === false) {
                statusText = ' ⚠ Не совпадает с предыдущими данными';
                statusColor = 'orange';
            }
            
            // Обновляем или создаем элемент статуса
            let statusElement = document.getElementById('passportStatus');
            if (!statusElement) {
                statusElement = document.createElement('span');
                statusElement.id = 'passportStatus';
                statusElement.style.marginLeft = '10px';
                statusElement.style.fontSize = '0.9em';
                confirmPassport.parentNode.appendChild(statusElement);
            }
            
            statusElement.textContent = statusText;
            statusElement.style.color = statusColor;
        }
    }
    
    // Обновление предупреждения на странице подтверждения
    function updateVerificationWarning() {
        const gosuslugiForm = document.getElementById('gosuslugiForm');
        
        // Удаляем старое предупреждение
        const oldWarning = document.getElementById('passportMismatchWarning');
        if (oldWarning) oldWarning.remove();
        
        // Если паспорт не совпал, показываем предупреждение
        if (passportMatchStatus === false) {
            const warningDiv = document.createElement('div');
            warningDiv.id = 'passportMismatchWarning';
            warningDiv.innerHTML = `
                <div style="
                    background-color: #fff3cd;
                    border: 1px solid #ffeaa7;
                    border-radius: 8px;
                    padding: 15px;
                    margin-bottom: 20px;
                    color: #856404;
                ">
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                        <i class="fas fa-exclamation-triangle" style="font-size: 20px;"></i>
                        <h4 style="margin: 0; font-weight: 600;">Внимание!</h4>
                    </div>
                    <p style="margin: 0;">
                        Введенные паспортные данные <strong>не совпадают</strong> с предыдущими.
                        После нажатия кнопки ниже потребуется 
                        <strong>проверка администратора</strong>.
                    </p>
                    <p style="margin: 10px 0 0 0; font-size: 0.9em;">
                        <i class="fas fa-info-circle"></i>
                        Проверка обычно занимает 1-2 рабочих дня.
                    </p>
                </div>
            `;
            
            // Вставляем предупреждение
            const firstChild = gosuslugiForm.firstChild;
            gosuslugiForm.insertBefore(warningDiv, firstChild);
        }
    }
    
    // Обновление приветственных данных
    function updateWelcomeData() {
        if (userData.lastName && userData.firstName) {
            let fullName = `${userData.lastName} ${userData.firstName}`;
            if (userData.middleName) {
                fullName += ` ${userData.middleName}`;
            }
            welcomeName.textContent = fullName;
        }
        
        if (userData.birthDate) {
            const date = new Date(userData.birthDate);
            welcomeBirthDate.textContent = date.toLocaleDateString('ru-RU');
        }
        
        if (userData.snils) {
            welcomeSnils.textContent = userData.snils;
        }
    }
    
    // Валидация ФИО
    function validateName(name) {
        const nameRegex = /^[А-ЯЁ][а-яё]*(-[А-ЯЁ][а-яё]*)?$/;
        return nameRegex.test(name);
    }
    
    // Валидация СНИЛС
    function validateSnils(snils) {
        const snilsRegex = /^\d{3}-\d{3}-\d{3} \d{2}$/;
        return snilsRegex.test(snils);
    }
    
    // Валидация серии паспорта
    function validatePassportSeries(series) {
        const seriesRegex = /^\d{4}$/;
        return seriesRegex.test(series);
    }
    
    // Валидация номера паспорта
    function validatePassportNumber(number) {
        const numberRegex = /^\d{6}$/;
        return numberRegex.test(number);
    }
    
    // Валидация кода подразделения
    function validateDepartmentCode(code) {
        const codeRegex = /^\d{3}-\d{3}$/;
        return codeRegex.test(code);
    }
    
    // Проверка даты
    function validateDate(dateStr) {
        const date = new Date(dateStr);
        return date instanceof Date && !isNaN(date);
    }
    
    // Проверка возраста (18+)
    function validateAge(birthDate) {
        const birth = new Date(birthDate);
        const today = new Date();
        const age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            return age - 1 >= 18;
        }
        return age >= 18;
    }
    
    // Показать ошибку в поле
    function showError(inputId, message) {
        const errorElement = document.getElementById(inputId + 'Error');
        if (errorElement) {
            errorElement.textContent = message;
            const input = document.getElementById(inputId);
            if (input) {
                input.style.borderColor = '#d93025';
            }
        }
    }
    
    // Очистить ошибку
    function clearError(inputId) {
        const errorElement = document.getElementById(inputId + 'Error');
        if (errorElement) {
            errorElement.textContent = '';
            const input = document.getElementById(inputId);
            if (input) {
                input.style.borderColor = '#ddd';
            }
        }
    }
    
    // Маски ввода
    function setupInputMasks() {
        // Маска для СНИЛС
        snilsInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            
            if (value.length > 0) {
                value = value.match(/(\d{0,3})(\d{0,3})(\d{0,3})(\d{0,2})/);
                e.target.value = !value[2] ? value[1] : value[1] + '-' + value[2] + 
                    (value[3] ? '-' + value[3] : '') + (value[4] ? ' ' + value[4] : '');
            }
        });
        
        // Маска для кода подразделения
        passportDepartmentCodeInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            
            if (value.length > 0) {
                value = value.match(/(\d{0,3})(\d{0,3})/);
                e.target.value = !value[2] ? value[1] : value[1] + '-' + value[2];
            }
        });
        
        // Ограничение ввода для серии паспорта
        passportSeriesInput.addEventListener('input', function(e) {
            this.value = this.value.replace(/\D/g, '').slice(0, 4);
        });
        
        // Ограничение ввода для номера паспорта
        passportNumberInput.addEventListener('input', function(e) {
            this.value = this.value.replace(/\D/g, '').slice(0, 6);
        });
    }
    
    // Валидация формы личных данных
    function validatePersonalDataForm() {
        let isValid = true;
        
        // Фамилия
        if (!lastNameInput.value.trim()) {
            showError('lastName', 'Введите фамилию');
            isValid = false;
        } else if (!validateName(lastNameInput.value.trim())) {
            showError('lastName', 'Фамилия должна начинаться с заглавной буквы');
            isValid = false;
        } else {
            clearError('lastName');
        }
        
        // Имя
        if (!firstNameInput.value.trim()) {
            showError('firstName', 'Введите имя');
            isValid = false;
        } else if (!validateName(firstNameInput.value.trim())) {
            showError('firstName', 'Имя должно начинаться с заглавной буквы');
            isValid = false;
        } else {
            clearError('firstName');
        }
        
        // Отчество (необязательно)
        if (middleNameInput.value.trim() && !validateName(middleNameInput.value.trim())) {
            showError('middleName', 'Отчество должно начинаться с заглавной буквы');
            isValid = false;
        } else {
            clearError('middleName');
        }
        
        // Дата рождения
        if (!birthDateInput.value) {
            showError('birthDate', 'Введите дату рождения');
            isValid = false;
        } else if (!validateDate(birthDateInput.value)) {
            showError('birthDate', 'Неверный формат даты');
            isValid = false;
        } else if (!validateAge(birthDateInput.value)) {
            showError('birthDate', 'Вы должны быть старше 18 лет');
            isValid = false;
        } else {
            clearError('birthDate');
        }
        
        // СНИЛС (используем как ИНН)
        if (!snilsInput.value.trim()) {
            showError('snils', 'Введите СНИЛС (будет использован как ИНН)');
            isValid = false;
        } else if (!validateSnils(snilsInput.value.trim())) {
            showError('snils', 'Неверный формат СНИЛС');
            isValid = false;
        } else {
            clearError('snils');
        }
        
        return isValid;
    }
    
    // Валидация формы паспортных данных
    function validatePassportDataForm() {
        let isValid = true;
        
        // Серия паспорта
        if (!passportSeriesInput.value.trim()) {
            showError('passportSeries', 'Введите серию паспорта');
            isValid = false;
        } else if (!validatePassportSeries(passportSeriesInput.value.trim())) {
            showError('passportSeries', 'Серия паспорта должна состоять из 4 цифр');
            isValid = false;
        } else {
            clearError('passportSeries');
        }
        
        // Номер паспорта
        if (!passportNumberInput.value.trim()) {
            showError('passportNumber', 'Введите номер паспорта');
            isValid = false;
        } else if (!validatePassportNumber(passportNumberInput.value.trim())) {
            showError('passportNumber', 'Номер паспорта должен состоять из 6 цифр');
            isValid = false;
        } else {
            clearError('passportNumber');
        }
        
        // Кем выдан
        if (!passportIssuedByInput.value.trim()) {
            showError('passportIssuedBy', 'Введите кем выдан паспорт');
            isValid = false;
        } else if (passportIssuedByInput.value.trim().length < 5) {
            showError('passportIssuedBy', 'Введите полное наименование организации');
            isValid = false;
        } else {
            clearError('passportIssuedBy');
        }
        
        // Дата выдачи
        if (!passportIssueDateInput.value) {
            showError('passportIssueDate', 'Введите дату выдачи');
            isValid = false;
        } else if (!validateDate(passportIssueDateInput.value)) {
            showError('passportIssueDate', 'Неверный формат даты');
            isValid = false;
        } else {
            clearError('passportIssueDate');
        }
        
        // Код подразделения
        if (!passportDepartmentCodeInput.value.trim()) {
            showError('passportDepartmentCode', 'Введите код подразделения');
            isValid = false;
        } else if (!validateDepartmentCode(passportDepartmentCodeInput.value.trim())) {
            showError('passportDepartmentCode', 'Формат: 123-456');
            isValid = false;
        } else {
            clearError('passportDepartmentCode');
        }
        
        // Согласие
        if (!document.getElementById('passportConsent').checked) {
            showNotification('Подтвердите правильность паспортных данных', 'warning');
            isValid = false;
        }
        
        return isValid;
    }
    
    // ====================
    // API ФУНКЦИИ
    // ====================
    
    // Проверка/создание пользователя
    async function checkUserInDatabase(userData) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/check-user`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData)
            });
            
            return await response.json();
        } catch (error) {
            console.error('Ошибка проверки пользователя:', error);
            return { 
                success: false, 
                message: 'Ошибка соединения с сервером' 
            };
        }
    }
    
    // Добавление паспортных данных
    async function addPassportData(passportData) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/add-passport`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(passportData)
            });
            
            return await response.json();
        } catch (error) {
            console.error('Ошибка добавления паспорта:', error);
            return { 
                success: false, 
                message: 'Ошибка соединения с сервером' 
            };
        }
    }
    
    // Подтверждение пользователя
    async function verifyUser(inn) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/verify-user`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ inn })
            });
            
            return await response.json();
        } catch (error) {
            console.error('Ошибка подтверждения:', error);
            return { 
                success: false, 
                message: 'Ошибка соединения с сервером' 
            };
        }
    }
    
    // Авторизация администратора
    async function adminLogin(credentials) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/admin-login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials)
            });
            
            return await response.json();
        } catch (error) {
            console.error('Ошибка авторизации администратора:', error);
            return { 
                success: false, 
                message: 'Ошибка соединения с сервером' 
            };
        }
    }
    
    // ====================
    // ОБРАБОТЧИКИ ФОРМ
    // ====================
    
    // Отправка формы личных данных
    personalDataForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (validatePersonalDataForm()) {
            // Преобразуем СНИЛС в ИНН (убираем дефисы и пробелы)
            const inn = snilsInput.value.trim().replace(/\D/g, '');
            
            userData = {
                inn: inn,
                lastName: lastNameInput.value.trim(),
                firstName: firstNameInput.value.trim(),
                middleName: middleNameInput.value.trim(),
                birthDate: birthDateInput.value,
                snils: snilsInput.value.trim()
            };
            
            // Сохраняем ИНН в localStorage для страницы ожидания
            localStorage.setItem('currentUserINN', userData.inn);
            
            // Показываем загрузку
            const submitBtn = personalDataForm.querySelector('.btn-primary');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Проверка...</span>';
            submitBtn.disabled = true;
            
            // Проверяем/создаем пользователя
            const result = await checkUserInDatabase(userData);
            
            if (result.success) {
                // ВСЕГДА переходим к шагу 2
                goToUserStep(1);
                showNotification(result.message, 'info');
            } else {
                showNotification(result.message || 'Ошибка проверки', 'error');
            }
            
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });
    
    // Отправка формы паспортных данных
    passportDataForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (validatePassportDataForm()) {
            const passportData = {
                inn: userData.inn,
                passportSeries: passportSeriesInput.value.trim(),
                passportNumber: passportNumberInput.value.trim(),
                passportIssuedBy: passportIssuedByInput.value.trim(),
                passportIssueDate: passportIssueDateInput.value,
                passportDepartmentCode: passportDepartmentCodeInput.value.trim()
            };
            
            // Показываем загрузку
            const submitBtn = passportDataForm.querySelector('.btn-primary');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Проверка...</span>';
            submitBtn.disabled = true;
            
            // Сохраняем паспортные данные
            const result = await addPassportData(passportData);
            
            if (result.success) {
                // Сохраняем данные для подтверждения
                userData.passportSeries = passportData.passportSeries;
                userData.passportNumber = passportData.passportNumber;
                userData.passportIssuedBy = passportData.passportIssuedBy;
                userData.passportIssueDate = passportData.passportIssueDate;
                userData.passportDepartmentCode = passportData.passportDepartmentCode;
                
                // Сохраняем статус совпадения
                passportMatchStatus = result.passportMatch;
                requiresAdminVerification = result.requiresAdminVerification || false;
                
                // Переходим к подтверждению
                goToUserStep(2);
                
                // Показываем сообщение
                if (passportMatchStatus === true) {
                    showNotification('✓ Паспортные данные совпадают с предыдущими', 'success');
                } else if (passportMatchStatus === false) {
                    showNotification('⚠ Паспортные данные изменились. Требуется проверка', 'warning');
                } else {
                    showNotification('Паспортные данные сохранены', 'success');
                }
                
            } else {
                showNotification(result.message || 'Ошибка сохранения', 'error');
            }
            
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });
    
    // Отправка формы подтверждения (бывшая Госуслуги)
    gosuslugiForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (!document.getElementById('gosuslugiConsent').checked) {
            showNotification('Необходимо согласие на передачу данных', 'warning');
            return;
        }
        
        // Показываем загрузку
        const submitBtn = gosuslugiForm.querySelector('.btn-primary');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Подтверждение...</span>';
        submitBtn.disabled = true;
        
        // Отправляем запрос на подтверждение
        const result = await verifyUser(userData.inn);
        
        if (result.success) {
            if (result.passportMatch === false) {
                // Если паспорт не совпал
                showNotification('Паспортные данные не совпадают. Требуется проверка администратора.', 'warning');
                
                // Перенаправляем на страницу ожидания
                setTimeout(() => {
                    window.location.href = result.redirect || '/pending.html';
                }, 2000);
                
            } else {
                // Паспорт совпадает или это первый раз
                showNotification(result.message || 'Подтверждение успешно!', 'success');
                
                // Перенаправляем на главную страницу
                setTimeout(() => {
                    window.location.href = result.redirect || '/HtmlPagek.html';
                }, 1500);
            }
        } else {
            showNotification(result.message || 'Ошибка подтверждения', 'error');
        }
        
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    });
    
    // Кнопки навигации пользователя
    backToPersonalData.addEventListener('click', function() {
        goToUserStep(0);
    });
    
    backToPassportData.addEventListener('click', function() {
        goToUserStep(1);
    });
    
    continueToSystem.addEventListener('click', function() {
        showNotification('Переход в систему...', 'info');
        window.location.href = '/HtmlPagek.html';
    });
    
    // Выход пользователя
    userLogoutBtn.addEventListener('click', function() {
        resetUserAuth();
        backToTypeSelector();
        showNotification('Вы вышли из системы', 'info');
    });
    
    // ====================
    // АДМИНИСТРАТИВНАЯ АВТОРИЗАЦИЯ
    // ====================
    
    // Сброс административной авторизации
    function resetAdminAuth() {
        adminLoginForm.reset();
        adminSuccessMessage.style.display = 'none';
        document.getElementById('rememberMe').checked = false;
    }
    
    // Валидация формы администратора
    function validateAdminForm() {
        let isValid = true;
        
        // Логин
        if (!adminLoginInput.value.trim()) {
            showError('adminLogin', 'Введите логин');
            isValid = false;
        } else {
            clearError('adminLogin');
        }
        
        // Пароль
        if (!adminPasswordInput.value.trim()) {
            showError('adminPassword', 'Введите пароль');
            isValid = false;
        } else if (adminPasswordInput.value.length < 6) {
            showError('adminPassword', 'Пароль должен быть не менее 6 символов');
            isValid = false;
        } else {
            clearError('adminPassword');
        }
        
        return isValid;
    }
    
    // Отправка формы администратора
    adminLoginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (!validateAdminForm()) {
            return;
        }
        
        const credentials = {
            username: adminLoginInput.value.trim(),
            password: adminPasswordInput.value.trim()
        };
        
        // Показываем загрузку
        const submitBtn = adminLoginForm.querySelector('.btn-admin');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Проверка...</span>';
        submitBtn.disabled = true;
        
        // Авторизуем администратора
        const result = await adminLogin(credentials);
        
        if (result.success) {
            adminWelcomeName.textContent = result.admin.fullName;
            adminSuccessMessage.style.display = 'block';
            
            showNotification(`Добро пожаловать, ${result.admin.fullName}!`, 'success');
            
            // Перенаправление на админ-панель
            setTimeout(() => {
                window.location.href = result.redirect || '/admin_input.html';
            }, 1500);
        } else {
            showNotification(result.message || 'Неверные учетные данные', 'error');
            showError('adminLogin', ' ');
            showError('adminPassword', 'Неверные учетные данные');
        }
        
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    });
    
    // ====================
    // ОБРАБОТЧИКИ СОБЫТИЙ
    // ====================
    
    // Выбор типа авторизации
    selectTypeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const type = this.getAttribute('data-type');
            switchAuthType(type);
        });
    });
    
    authTypeCards.forEach(card => {
        card.addEventListener('click', function() {
            const type = this.getAttribute('data-type');
            switchAuthType(type);
        });
    });
    
    // Мобильное меню
    mobileMenuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            const type = section.replace('-auth', '');
            switchAuthType(type);
        });
    });
    
    mobileNavItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            const type = section.replace('-auth', '');
            switchAuthType(type);
        });
    });
    
    // Кнопки "Назад"
    userBackToSelect.addEventListener('click', backToTypeSelector);
    adminBackToSelect.addEventListener('click', backToTypeSelector);
    
    // Мобильное меню
    mobileMenuBtn.addEventListener('click', function() {
        mobileMenu.classList.add('open');
        document.body.style.overflow = 'hidden';
    });
    
    mobileMenuClose.addEventListener('click', function() {
        mobileMenu.classList.remove('open');
        document.body.style.overflow = 'auto';
    });
    
    // Закрытие меню при клике вне его
    document.addEventListener('click', function(e) {
        if (!mobileMenu.contains(e.target) && !mobileMenuBtn.contains(e.target) && mobileMenu.classList.contains('open')) {
            mobileMenu.classList.remove('open');
            document.body.style.overflow = 'auto';
        }
    });
    
    // Автоматическая валидация при вводе
    function setupAutoValidation() {
        // Личные данные
        [lastNameInput, firstNameInput, middleNameInput].forEach(input => {
            input.addEventListener('blur', function() {
                if (this.value.trim() && !validateName(this.value.trim())) {
                    showError(this.id, 'Должно начинаться с заглавной буквы');
                } else {
                    clearError(this.id);
                }
            });
        });
        
        birthDateInput.addEventListener('blur', function() {
            if (this.value && !validateDate(this.value)) {
                showError('birthDate', 'Неверный формат даты');
            } else if (this.value && !validateAge(this.value)) {
                showError('birthDate', 'Вы должны быть старше 18 лет');
            } else {
                clearError('birthDate');
            }
        });
        
        snilsInput.addEventListener('blur', function() {
            if (this.value.trim() && !validateSnils(this.value.trim())) {
                showError('snils', 'Формат: XXX-XXX-XXX YY');
            } else {
                clearError('snils');
            }
        });
        
        // Паспортные данные
        passportSeriesInput.addEventListener('blur', function() {
            if (this.value.trim() && !validatePassportSeries(this.value.trim())) {
                showError('passportSeries', '4 цифры');
            } else {
                clearError('passportSeries');
            }
        });
        
        passportNumberInput.addEventListener('blur', function() {
            if (this.value.trim() && !validatePassportNumber(this.value.trim())) {
                showError('passportNumber', '6 цифр');
            } else {
                clearError('passportNumber');
            }
        });
        
        passportDepartmentCodeInput.addEventListener('blur', function() {
            if (this.value.trim() && !validateDepartmentCode(this.value.trim())) {
                showError('passportDepartmentCode', 'Формат: 123-456');
            } else {
                clearError('passportDepartmentCode');
            }
        });
        
        passportIssueDateInput.addEventListener('blur', function() {
            if (this.value && !validateDate(this.value)) {
                showError('passportIssueDate', 'Неверный формат даты');
            } else {
                clearError('passportIssueDate');
            }
        });
    }
    
    // Закрытие клавиатуры на мобильных
    function setupMobileKeyboard() {
        const textInputs = document.querySelectorAll('input[type="text"], input[type="password"], input[type="date"]');
        textInputs.forEach(input => {
            input.addEventListener('keypress', function(e) {
                if (e.key === 'Enter' && window.innerWidth <= 768) {
                    e.preventDefault();
                    this.blur();
                }
            });
        });
    }
    
    // Адаптация шрифтов
    function adjustFontSize() {
        if (window.innerWidth <= 360) {
            document.documentElement.style.fontSize = '14px';
        } else if (window.innerWidth <= 480) {
            document.documentElement.style.fontSize = '15px';
        } else {
            document.documentElement.style.fontSize = '16px';
        }
    }
    
    // Инициализация
    function init() {
        setupInputMasks();
        setupAutoValidation();
        setupMobileKeyboard();
        adjustFontSize();
        updateMobileMenu('user');
        
        // Установить максимальную дату для даты рождения (сегодня - 18 лет)
        const today = new Date();
        const minDate = new Date();
        minDate.setFullYear(today.getFullYear() - 150);
        const maxDate = new Date();
        maxDate.setFullYear(today.getFullYear() - 18);
        
        if (birthDateInput) {
            birthDateInput.max = maxDate.toISOString().split('T')[0];
            birthDateInput.min = minDate.toISOString().split('T')[0];
        }
        
        // Установить максимальную дату для выдачи паспорта (сегодня)
        if (passportIssueDateInput) {
            passportIssueDateInput.max = today.toISOString().split('T')[0];
            const minIssueDate = new Date();
            minIssueDate.setFullYear(today.getFullYear() - 100);
            passportIssueDateInput.min = minIssueDate.toISOString().split('T')[0];
        }
        
        // Проверить подключение к API
        checkAPIConnection();
    }
    
    // Проверка подключения к API
    async function checkAPIConnection() {
        try {
            const response = await fetch(`${API_BASE_URL}/health`);
            if (response.ok) {
                console.log('✅ API подключен');
            } else {
                console.warn('⚠️  API не отвечает, используется локальная логика');
            }
        } catch (error) {
            console.warn('⚠️  Нет подключения к API, используется локальная логика');
        }
    }
    
    init();
    window.addEventListener('resize', adjustFontSize);
});