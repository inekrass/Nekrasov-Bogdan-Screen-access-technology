// Система капчи для предотвращения автоматических переходов
class CaptchaSystem {
    constructor() {
        this.currentAnswer = null;
        this.targetUrl = null;
    }

    // Генерация случайного математического примера
    generateMathProblem() {
        const operations = ['+', '-', '*'];
        const operation = operations[Math.floor(Math.random() * operations.length)];
        
        let num1, num2, answer;
        
        switch(operation) {
            case '+':
                num1 = Math.floor(Math.random() * 50) + 1;
                num2 = Math.floor(Math.random() * 50) + 1;
                answer = num1 + num2;
                break;
            case '-':
                num1 = Math.floor(Math.random() * 50) + 25;
                num2 = Math.floor(Math.random() * 25) + 1;
                answer = num1 - num2;
                break;
            case '*':
                num1 = Math.floor(Math.random() * 10) + 1;
                num2 = Math.floor(Math.random() * 10) + 1;
                answer = num1 * num2;
                break;
        }
        
        return {
            question: `${num1} ${operation} ${num2} = ?`,
            answer: answer
        };
    }

    // Создание визуальной капчи
    createVisualCaptcha(problem) {
        const canvas = document.createElement('canvas');
        canvas.width = 200;
        canvas.height = 60;
        canvas.style.border = '2px solid #333';
        canvas.style.backgroundColor = '#f0f0f0';
        
        const ctx = canvas.getContext('2d');
        
        // Добавляем шум в виде линий
        for(let i = 0; i < 5; i++) {
            ctx.strokeStyle = `rgba(${Math.random()*255}, ${Math.random()*255}, ${Math.random()*255}, 0.3)`;
            ctx.lineWidth = Math.random() * 3;
            ctx.beginPath();
            ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
            ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
            ctx.stroke();
        }
        
        // Добавляем точки как шум
        for(let i = 0; i < 50; i++) {
            ctx.fillStyle = `rgba(${Math.random()*255}, ${Math.random()*255}, ${Math.random()*255}, 0.5)`;
            ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 2, 2);
        }
        
        // Рисуем текст с искажениями
        ctx.font = 'bold 24px Arial';
        ctx.fillStyle = '#333';
        
        const chars = problem.question.split('');
        let x = 20;
        
        chars.forEach((char, index) => {
            const angle = (Math.random() - 0.5) * 0.4; // Поворот символа
            const y = 35 + (Math.random() - 0.5) * 10; // Вертикальное смещение
            
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(angle);
            ctx.fillText(char, 0, 0);
            ctx.restore();
            
            x += ctx.measureText(char).width + Math.random() * 5;
        });
          return canvas;
    }    // Показать модальное окно с капчей
    showCaptcha(url) {
        console.log('showCaptcha вызван с URL:', url);
        
        // Проверяем валидность URL
        if (!url || url === 'null' || url.trim() === '') {
            console.error('Некорректный URL в showCaptcha:', url);
            alert('Ошибка: некорректный адрес страницы');
            return;
        }
        
        this.targetUrl = url;
        console.log('targetUrl установлен:', this.targetUrl);
        
        const problem = this.generateMathProblem();
        this.currentAnswer = problem.answer;
        console.log('Сгенерирован пример:', problem.question);
        
        // Создаем модальное окно
        const modal = document.createElement('div');
        modal.className = 'captcha-modal';
        modal.innerHTML = `
            <div class="captcha-content">
                <h3>Подтвердите, что вы человек</h3>
                <p>Решите пример для продолжения:</p>
                <div class="captcha-image-container"></div>
                <input type="number" id="captcha-input" placeholder="Введите ответ" autocomplete="off">
                <div class="captcha-buttons">
                    <button onclick="captcha.checkAnswer()">Проверить</button>
                    <button onclick="captcha.refreshCaptcha()">Обновить</button>
                    <button onclick="captcha.closeCaptcha()">Отмена</button>
                </div>
                <div id="captcha-error" class="captcha-error"></div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Добавляем canvas с капчей
        const canvas = this.createVisualCaptcha(problem);
        modal.querySelector('.captcha-image-container').appendChild(canvas);
        
        // Фокус на поле ввода
        setTimeout(() => {
            document.getElementById('captcha-input').focus();
        }, 100);
        
        // Обработка Enter
        document.getElementById('captcha-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.checkAnswer();
            }        });
    }    // Проверка ответа
    checkAnswer() {
        const input = document.getElementById('captcha-input');
        const userAnswer = parseInt(input.value);
        const errorDiv = document.getElementById('captcha-error');
        
        console.log('Проверка ответа:', {
            userAnswer: userAnswer,
            correctAnswer: this.currentAnswer,
            targetUrl: this.targetUrl
        });
          if (userAnswer === this.currentAnswer) {
            console.log('Ответ правильный! Переходим...');
            
            // Сохраняем URL перед закрытием капчи
            const urlToGo = this.targetUrl;
            
            // Переход на целевую страницу
            if (urlToGo && urlToGo !== 'null' && urlToGo.trim() !== '') {
                console.log('Переходим на:', urlToGo);
                this.closeCaptcha(); // Закрываем капчу только после проверки URL
                window.location.href = urlToGo;
            } else {
                console.error('Некорректный URL для перехода:', urlToGo);
                alert('Ошибка перехода. Попробуйте еще раз.');
                this.closeCaptcha();
            }
        } else {
            errorDiv.textContent = 'Неверный ответ. Попробуйте еще раз.';
            input.value = '';
            input.focus();
            
            // Генерируем новую капчу через 2 секунды
            setTimeout(() => {
                this.refreshCaptcha();
            }, 2000);
        }
    }

    // Обновление капчи
    refreshCaptcha() {
        const modal = document.querySelector('.captcha-modal');
        if (modal) {
            const problem = this.generateMathProblem();
            this.currentAnswer = problem.answer;
            
            const container = modal.querySelector('.captcha-image-container');
            container.innerHTML = '';
            
            const canvas = this.createVisualCaptcha(problem);
            container.appendChild(canvas);
            
            document.getElementById('captcha-input').value = '';
            document.getElementById('captcha-error').textContent = '';
            document.getElementById('captcha-input').focus();
        }
    }

    // Закрытие капчи
    closeCaptcha() {
        const modal = document.querySelector('.captcha-modal');
        if (modal) {
            modal.remove();
        }
        this.currentAnswer = null;
        this.targetUrl = null;
    }
}

// Создаем глобальный экземпляр капчи
const captcha = new CaptchaSystem();

// Новая функция для переходов с капчей
function goWithCaptcha(url) {
    // Проверяем валидность URL
    if (!url || url === 'null' || url.trim() === '') {
        console.error('Некорректный URL:', url);
        alert('Ошибка: некорректный адрес страницы');
        return;
    }
    
    if (confirm('Перейти на другую страницу?')) {
        console.log('Переход на URL:', url); // Для отладки
        captcha.showCaptcha(url);
    }
}
