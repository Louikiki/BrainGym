/**
 * StroopGame - Stroop效应训练模块
 * 
 * 功能特性：
 * 1. 两种游戏模式：经典模式（选择颜色）和逆向模式（选择文字）
 * 2. 可配置的题目数量、单题限时和干扰级别
 * 3. 随机生成题目，确保文字含义和颜色不一致
 * 4. 计时和正确率统计
 * 5. 完整的数据记录和统计
 */

class StroopGame {
    constructor() {
        // 颜色配置
        this.colors = [
            { name: '红色', code: '#FF6B6B', english: 'red' },
            { name: '蓝色', code: '#4ECDC4', english: 'blue' },
            { name: '绿色', code: '#95E1D3', english: 'green' },
            { name: '黄色', code: '#FFE66D', english: 'yellow' },
            { name: '紫色', code: '#C7CEEA', english: 'purple' },
            { name: '橙色', code: '#FFB997', english: 'orange' }
        ];
        
        // 游戏配置
        this.mode = 'classic'; // 'classic' 或 'reverse'
        this.questionCount = 20;
        this.timeLimit = 3; // 单题限时（秒），0表示不限时
        this.difficulty = 'medium'; // 'easy', 'medium', 'hard'
        
        // 游戏状态
        this.currentQuestion = 0;
        this.correctCount = 0;
        this.incorrectCount = 0;
        this.responseTimes = [];
        this.currentWord = null;
        this.currentColor = null;
        this.isRunning = false;
        this.timerInterval = null;
        this.questionStartTime = null;
        
        this.isInitialized = false;
    }

    /**
     * 初始化Stroop游戏
     */
    init() {
        if (this.isInitialized) {
            return;
        }

        this.bindEvents();
        this.isInitialized = true;
        console.log('StroopGame initialized');
    }

    /**
     * 绑定事件监听器
     */
    bindEvents() {
        const startBtn = document.querySelector('#stroop-game .start-game-btn');
        const resetBtn = document.querySelector('#stroop-game .reset-game-btn');
        const modeSelect = document.getElementById('stroop-mode');
        const questionCountSelect = document.getElementById('stroop-question-count');
        const timeLimitSelect = document.getElementById('stroop-time-limit');
        const difficultySelect = document.getElementById('stroop-difficulty');

        if (startBtn) {
            startBtn.addEventListener('click', () => this.startGame());
        }

        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetGame());
        }

        if (modeSelect) {
            modeSelect.addEventListener('change', (e) => {
                this.mode = e.target.value;
                this.updateModeDescription();
            });
        }

        if (questionCountSelect) {
            questionCountSelect.addEventListener('change', (e) => {
                this.questionCount = parseInt(e.target.value);
            });
        }

        if (timeLimitSelect) {
            timeLimitSelect.addEventListener('change', (e) => {
                this.timeLimit = parseInt(e.target.value);
            });
        }

        if (difficultySelect) {
            difficultySelect.addEventListener('change', (e) => {
                this.difficulty = e.target.value;
            });
        }
    }

    /**
     * 更新模式描述
     */
    updateModeDescription() {
        const display = document.getElementById('stroop-display');
        if (!display || this.isRunning) {
            return;
        }

        const description = this.mode === 'classic' 
            ? '选择文字显示的颜色，忽略文字本身的含义！' 
            : '选择文字本身的含义，忽略文字显示的颜色！';

        display.innerHTML = `<p style="text-align: center; color: var(--text-secondary); padding: 40px;">${description}<br><br>点击"开始游戏"按钮开始训练</p>`;
    }

    /**
     * 开始游戏
     */
    startGame() {
        if (this.isRunning) {
            return;
        }

        // 重置游戏状态
        this.currentQuestion = 0;
        this.correctCount = 0;
        this.incorrectCount = 0;
        this.responseTimes = [];
        this.isRunning = true;

        // 加载配置
        this.loadConfig();

        // 更新UI
        this.updateUI();
        this.generateOptions();
        this.nextQuestion();

        // 播放音效
        if (typeof audioManager !== 'undefined') {
            audioManager.playClick();
        }
    }

    /**
     * 加载游戏配置
     */
    loadConfig() {
        const modeSelect = document.getElementById('stroop-mode');
        const questionCountSelect = document.getElementById('stroop-question-count');
        const timeLimitSelect = document.getElementById('stroop-time-limit');
        const difficultySelect = document.getElementById('stroop-difficulty');

        if (modeSelect) {
            this.mode = modeSelect.value;
        }

        if (questionCountSelect) {
            this.questionCount = parseInt(questionCountSelect.value);
        }

        if (timeLimitSelect) {
            this.timeLimit = parseInt(timeLimitSelect.value);
        }

        if (difficultySelect) {
            this.difficulty = difficultySelect.value;
        }
    }

    /**
     * 重置游戏
     */
    resetGame() {
        this.stopGame();
        this.currentQuestion = 0;
        this.correctCount = 0;
        this.incorrectCount = 0;
        this.responseTimes = [];
        this.updateUI();
        this.clearDisplay();
        this.updateModeDescription();
    }

    /**
     * 停止游戏
     */
    stopGame() {
        this.isRunning = false;
        
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    /**
     * 生成下一题
     */
    nextQuestion() {
        if (!this.isRunning) {
            return;
        }

        this.currentQuestion++;

        // 检查是否完成所有题目
        if (this.currentQuestion > this.questionCount) {
            this.completeGame();
            return;
        }

        // 生成题目
        this.generateQuestion();
        
        // 更新显示
        this.updateDisplay();
        this.updateUI();
        
        // 开始计时
        this.questionStartTime = Date.now();
        this.startQuestionTimer();
    }

    /**
     * 生成题目
     */
    generateQuestion() {
        // 根据难度选择颜色数量
        let availableColors = [...this.colors];
        if (this.difficulty === 'easy') {
            availableColors = availableColors.slice(0, 4);
        } else if (this.difficulty === 'medium') {
            availableColors = availableColors.slice(0, 5);
        }

        // 随机选择文字
        const randomWordIndex = Math.floor(Math.random() * availableColors.length);
        this.currentWord = availableColors[randomWordIndex];

        // 随机选择颜色，确保与文字含义不同
        let randomColorIndex;
        do {
            randomColorIndex = Math.floor(Math.random() * availableColors.length);
        } while (randomColorIndex === randomWordIndex);
        this.currentColor = availableColors[randomColorIndex];

        console.log(`Question ${this.currentQuestion}: "${this.currentWord.name}" in ${this.currentColor.name}`);
    }

    /**
     * 更新文字显示
     */
    updateDisplay() {
        const display = document.getElementById('stroop-display');
        if (!display) return;

        const modeText = this.mode === 'classic' 
            ? '选择文字显示的颜色' 
            : '选择文字本身的含义';

        display.innerHTML = `
            <div style="text-align: center; padding: 20px;">
                <p style="font-size: 18px; color: var(--text-secondary); margin-bottom: 40px;">
                    ${modeText}
                </p>
                <div class="stroop-word" style="color: ${this.currentColor.code}; font-size: 72px;">
                    ${this.currentWord.name}
                </div>
            </div>
        `;
    }

    /**
     * 生成选项按钮
     */
    generateOptions() {
        const optionsContainer = document.getElementById('stroop-options');
        if (!optionsContainer) return;

        optionsContainer.innerHTML = '';

        // 根据难度选择颜色数量
        let availableColors = [...this.colors];
        if (this.difficulty === 'easy') {
            availableColors = availableColors.slice(0, 4);
        } else if (this.difficulty === 'medium') {
            availableColors = availableColors.slice(0, 5);
        }

        // 打乱颜色顺序
        this.shuffleArray(availableColors);

        availableColors.forEach(color => {
            const btn = document.createElement('button');
            btn.className = 'stroop-option';
            btn.textContent = color.name;
            btn.style.color = color.code;
            btn.addEventListener('click', () => this.handleOptionClick(btn, color));
            optionsContainer.appendChild(btn);
        });
    }

    /**
     * 开始题目计时器
     */
    startQuestionTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }

        if (this.timeLimit > 0) {
            let timeLeft = this.timeLimit;
            
            this.timerInterval = setInterval(() => {
                timeLeft--;
                
                const timeDisplay = document.getElementById('stroop-time');
                if (timeDisplay) {
                    timeDisplay.textContent = timeLeft + 's';
                }

                if (timeLeft <= 0) {
                    clearInterval(this.timerInterval);
                    this.timerInterval = null;
                    this.handleTimeOut();
                }
            }, 1000);
        } else {
            // 不限时模式
            const timeDisplay = document.getElementById('stroop-time');
            if (timeDisplay) {
                timeDisplay.textContent = '不限时';
            }
        }
    }

    /**
     * 处理超时
     */
    handleTimeOut() {
        if (!this.isRunning) {
            return;
        }

        this.incorrectCount++;
        this.responseTimes.push(this.timeLimit * 1000); // 记录超时时间
        
        // 播放错误音效
        if (typeof audioManager !== 'undefined') {
            audioManager.playWrong();
        }

        // 显示超时提示
        const display = document.getElementById('stroop-display');
        if (display) {
            display.innerHTML += `
                <div style="text-align: center; margin-top: 20px;">
                    <span style="font-size: 24px; color: var(--primary-color); font-weight: 700;">⏰ 超时！</span>
                </div>
            `;
        }

        // 延迟后进入下一题
        setTimeout(() => {
            this.nextQuestion();
        }, 1000);
    }

    /**
     * 处理选项点击
     * @param {HTMLElement} btn - 被点击的按钮
     * @param {Object} color - 颜色对象
     */
    handleOptionClick(btn, color) {
        if (!this.isRunning) {
            return;
        }

        // 停止计时器
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }

        // 计算反应时间
        const responseTime = Date.now() - this.questionStartTime;
        this.responseTimes.push(responseTime);

        let isCorrect = false;

        if (this.mode === 'classic') {
            // 经典模式：选择颜色
            isCorrect = color.english === this.currentColor.english;
        } else {
            // 逆向模式：选择文字
            isCorrect = color.english === this.currentWord.english;
        }

        if (isCorrect) {
            // 正确
            this.correctCount++;
            btn.classList.add('correct');
            
            // 播放正确音效
            if (typeof audioManager !== 'undefined') {
                audioManager.playCorrect();
            }

            // 添加视觉效果
            if (typeof visualsManager !== 'undefined') {
                visualsManager.pulse(btn);
            }
        } else {
            // 错误
            this.incorrectCount++;
            btn.classList.add('wrong');
            
            // 播放错误音效
            if (typeof audioManager !== 'undefined') {
                audioManager.playWrong();
            }

            // 添加抖动效果
            if (typeof visualsManager !== 'undefined') {
                visualsManager.shake(btn);
            }
        }

        // 延迟后进入下一题
        setTimeout(() => {
            btn.classList.remove('correct', 'wrong');
            this.nextQuestion();
        }, 500);
    }

    /**
     * 完成游戏
     */
    completeGame() {
        this.stopGame();

        // 播放成功音效
        if (typeof audioManager !== 'undefined') {
            audioManager.playSuccess();
        }

        // 计算统计数据
        const totalTime = this.responseTimes.reduce((sum, time) => sum + time, 0) / 1000;
        const averageResponseTime = this.responseTimes.length > 0 
            ? totalTime / this.responseTimes.length 
            : 0;
        const accuracy = this.questionCount > 0 
            ? (this.correctCount / this.questionCount) * 100 
            : 0;

        // 保存记录
        if (typeof storageManager !== 'undefined') {
            storageManager.addRecord('stroop', {
                mode: this.mode,
                questionCount: this.questionCount,
                timeLimit: this.timeLimit,
                difficulty: this.difficulty,
                correctCount: this.correctCount,
                incorrectCount: this.incorrectCount,
                accuracy: accuracy,
                averageResponseTime: averageResponseTime,
                totalTime: totalTime,
                completed: true
            });
        }

        // 显示结果
        this.showResult(accuracy, averageResponseTime, totalTime);
    }

    /**
     * 显示游戏结果
     * @param {number} accuracy - 准确率
     * @param {number} averageResponseTime - 平均反应时间
     * @param {number} totalTime - 总时间
     */
    showResult(accuracy, averageResponseTime, totalTime) {
        const display = document.getElementById('stroop-display');
        const options = document.getElementById('stroop-options');
        
        if (display) {
            display.innerHTML = `
                <div style="text-align: center; padding: 20px;">
                    <h3 style="font-size: 32px; color: var(--primary-color); margin-bottom: 20px;">
                        🎉 训练完成！
                    </h3>
                    <p style="font-size: 24px; margin-bottom: 10px;">
                        准确率：<span style="font-weight: 700; color: var(--primary-color);">${accuracy.toFixed(1)}</span>%
                    </p>
                    <p style="font-size: 18px; margin-bottom: 10px;">
                        正确：<span style="font-weight: 700; color: var(--success-color);">${this.correctCount}</span> 题
                        错误：<span style="font-weight: 700; color: var(--primary-color);">${this.incorrectCount}</span> 题
                    </p>
                    <p style="font-size: 18px; margin-bottom: 10px;">
                        平均反应时间：<span style="font-weight: 700; color: var(--primary-color);">${averageResponseTime.toFixed(2)}</span> 秒
                    </p>
                    <p style="font-size: 18px; margin-bottom: 20px;">
                        总用时：<span style="font-weight: 700; color: var(--primary-color);">${totalTime.toFixed(2)}</span> 秒
                    </p>
                    <p style="font-size: 16px; color: var(--text-secondary);">
                        ${this.getPerformanceComment(accuracy, averageResponseTime)}
                    </p>
                </div>
            `;
        }

        if (options) {
            options.innerHTML = '';
        }

        // 更新按钮状态
        const startBtn = document.querySelector('#stroop-game .start-game-btn');
        const resetBtn = document.querySelector('#stroop-game .reset-game-btn');
        
        if (startBtn) {
            startBtn.style.display = 'inline-block';
            startBtn.textContent = '再玩一次';
        }
        
        if (resetBtn) {
            resetBtn.style.display = 'none';
        }
    }

    /**
     * 根据准确率和反应时间获取评价
     * @param {number} accuracy - 准确率
     * @param {number} averageResponseTime - 平均反应时间
     * @returns {string} 评价文本
     */
    getPerformanceComment(accuracy, averageResponseTime) {
        if (accuracy >= 90 && averageResponseTime < 1) {
            return '太棒了！你的认知控制能力非常出色！🌟';
        } else if (accuracy >= 80 && averageResponseTime < 2) {
            return '做得很好！继续保持这样的表现！💪';
        } else if (accuracy >= 60 && averageResponseTime < 3) {
            return '不错的成绩！多加练习会更上一层楼！👍';
        } else {
            return '继续努力，熟能生巧！保持专注，你会做得更好！🎯';
        }
    }

    /**
     * 更新UI显示
     */
    updateUI() {
        // 更新当前题目
        const currentQuestionDisplay = document.getElementById('stroop-current-question');
        if (currentQuestionDisplay) {
            currentQuestionDisplay.textContent = `${this.currentQuestion}/${this.questionCount}`;
        }

        // 更新正确计数
        const correctDisplay = document.getElementById('stroop-correct');
        if (correctDisplay) {
            correctDisplay.textContent = this.correctCount;
        }

        // 更新错误计数
        const incorrectDisplay = document.getElementById('stroop-incorrect');
        if (incorrectDisplay) {
            incorrectDisplay.textContent = this.incorrectCount;
        }

        // 更新按钮状态
        const startBtn = document.querySelector('#stroop-game .start-game-btn');
        const resetBtn = document.querySelector('#stroop-game .reset-game-btn');
        
        if (startBtn) {
            startBtn.style.display = this.isRunning ? 'none' : 'inline-block';
        }
        
        if (resetBtn) {
            resetBtn.style.display = this.isRunning ? 'inline-block' : 'none';
        }
    }

    /**
     * 清空显示
     */
    clearDisplay() {
        const display = document.getElementById('stroop-display');
        const options = document.getElementById('stroop-options');
        
        if (display) {
            display.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 40px;">点击"开始游戏"按钮开始训练</p>';
        }

        if (options) {
            options.innerHTML = '';
        }
    }

    /**
     * 随机打乱数组
     * @param {Array} array - 要打乱的数组
     */
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
}

// 创建全局实例
const stroopGame = new StroopGame();

// 导出供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StroopGame;
}
