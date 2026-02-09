/**
 * MemoryTrainer - 序列工作记忆训练模块
 * 
 * 功能特性：
 * 1. 两种训练模式：视觉空间（3×3网格）和数字序列
 * 2. 自适应难度算法
 * 3. 序列生成、显示和用户输入验证
 * 4. 记忆广度记录
 * 5. 训练动画和反馈
 */

class MemoryTrainer {
    constructor() {
        // 训练配置
        this.mode = 'visual'; // 'visual' 或 'digit'
        this.sequenceLength = 3; // 起始序列长度
        this.maxSequenceLength = 3; // 记忆广度
        this.correctStreak = 0; // 连续正确次数
        
        // 游戏状态
        this.sequence = []; // 生成的序列
        this.userInput = []; // 用户输入的序列
        this.isDisplaying = false; // 是否正在显示序列
        this.isRunning = false; // 游戏是否运行中
        
        // 视觉空间模式的网格位置
        this.gridPositions = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        
        // 动画配置
        this.highlightDuration = 800; // 高亮显示持续时间（毫秒）
        this.intervalBetweenItems = 200; // 序列项之间的间隔时间（毫秒）
        
        this.isInitialized = false;
    }

    /**
     * 初始化记忆训练模块
     */
    init() {
        if (this.isInitialized) {
            return;
        }

        this.bindEvents();
        this.isInitialized = true;
        console.log('MemoryTrainer initialized');
    }

    /**
     * 绑定事件监听器
     */
    bindEvents() {
        const startBtn = document.querySelector('#memory-game .start-game-btn');
        const resetBtn = document.querySelector('#memory-game .reset-game-btn');
        const modeSelect = document.getElementById('memory-mode');

        if (startBtn) {
            startBtn.addEventListener('click', () => this.startTraining());
        }

        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetTraining());
        }

        if (modeSelect) {
            modeSelect.addEventListener('change', (e) => {
                this.mode = e.target.value;
                this.updateModeUI();
            });
        }
    }

    /**
     * 更新模式UI
     */
    updateModeUI() {
        const display = document.getElementById('memory-display');
        const inputContainer = document.getElementById('memory-input');
        const gridContainer = document.getElementById('memory-grid');
        
        if (display) {
            if (this.mode === 'visual') {
                display.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 40px;">记住网格中高亮的位置顺序<br><br>点击"开始训练"按钮开始</p>';
            } else {
                display.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 40px;">记住显示的数字序列<br><br>点击"开始训练"按钮开始</p>';
            }
        }

        if (inputContainer) {
            inputContainer.style.display = this.mode === 'digit' ? 'block' : 'none';
        }

        if (gridContainer) {
            gridContainer.style.display = this.mode === 'visual' ? 'grid' : 'none';
        }
    }

    /**
     * 开始训练
     */
    startTraining() {
        if (this.isRunning) {
            return;
        }

        // 重置训练状态
        this.sequenceLength = 3;
        this.maxSequenceLength = 3;
        this.correctStreak = 0;
        this.isRunning = true;

        // 更新UI
        this.updateUI();

        // 开始第一轮
        setTimeout(() => {
            this.startRound();
        }, 500);

        // 播放音效
        if (typeof audioManager !== 'undefined') {
            audioManager.playClick();
        }
    }

    /**
     * 重置训练
     */
    resetTraining() {
        this.stopTraining();
        this.sequenceLength = 3;
        this.maxSequenceLength = 3;
        this.correctStreak = 0;
        this.userInput = [];
        this.updateUI();
        this.clearDisplay();
        this.updateModeUI();
    }

    /**
     * 停止训练
     */
    stopTraining() {
        this.isRunning = false;
        this.isDisplaying = false;
        
        // 保存记录
        if (typeof storageManager !== 'undefined') {
            storageManager.addRecord('memory', {
                mode: this.mode,
                level: this.maxSequenceLength,
                sequenceLength: this.sequenceLength,
                correctStreak: this.correctStreak,
                completed: true
            });
        }
    }

    /**
     * 开始新的一轮训练
     */
    startRound() {
        if (!this.isRunning) {
            return;
        }

        this.userInput = [];
        this.generateSequence();
        this.displaySequence();
    }

    /**
     * 生成序列
     */
    generateSequence() {
        this.sequence = [];
        
        if (this.mode === 'visual') {
            // 视觉空间模式：生成网格位置序列
            const positions = [...this.gridPositions];
            this.shuffleArray(positions);
            this.sequence = positions.slice(0, this.sequenceLength);
        } else {
            // 数字序列模式：生成数字序列
            for (let i = 0; i < this.sequenceLength; i++) {
                this.sequence.push(Math.floor(Math.random() * 10));
            }
        }
        
        console.log(`Generated sequence: ${this.sequence.join(', ')}`);
    }

    /**
     * 显示序列
     */
    displaySequence() {
        this.isDisplaying = true;
        
        if (this.mode === 'visual') {
            this.displayVisualSequence();
        } else {
            this.displayDigitSequence();
        }
    }

    /**
     * 显示视觉空间序列
     */
    displayVisualSequence() {
        const display = document.getElementById('memory-display');
        const grid = document.getElementById('memory-grid');
        
        if (display) {
            display.innerHTML = '<p style="text-align: center; font-size: 18px; color: var(--text-secondary);">请记住高亮的位置顺序...</p>';
        }

        if (grid) {
            // 清空网格
            grid.innerHTML = '';
            
            // 创建3×3网格
            for (let i = 1; i <= 9; i++) {
                const cell = document.createElement('div');
                cell.className = 'memory-grid-cell';
                cell.dataset.position = i;
                cell.textContent = i;
                grid.appendChild(cell);
            }
        }

        // 高亮显示序列
        let index = 0;
        const interval = setInterval(() => {
            if (index >= this.sequence.length) {
                clearInterval(interval);
                this.hideVisualSequence();
                return;
            }

            // 高亮当前位置
            const position = this.sequence[index];
            const cell = document.querySelector(`.memory-grid-cell[data-position="${position}"]`);
            
            if (cell) {
                cell.classList.add('highlight');
                
                // 播放音效
                if (typeof audioManager !== 'undefined') {
                    audioManager.playDigit(position);
                }

                // 移除高亮
                setTimeout(() => {
                    cell.classList.remove('highlight');
                }, this.highlightDuration - 100);
            }

            index++;
        }, this.highlightDuration + this.intervalBetweenItems);
    }

    /**
     * 隐藏视觉序列并等待用户输入
     */
    hideVisualSequence() {
        const display = document.getElementById('memory-display');
        const grid = document.getElementById('memory-grid');
        
        if (display) {
            display.innerHTML = '<p style="text-align: center; font-size: 18px; color: var(--text-secondary);">请按顺序点击刚才高亮的位置</p>';
        }

        if (grid) {
            // 绑定网格点击事件
            const cells = grid.querySelectorAll('.memory-grid-cell');
            cells.forEach(cell => {
                cell.addEventListener('click', () => {
                    this.handleGridClick(cell);
                });
            });
        }

        this.isDisplaying = false;
    }

    /**
     * 显示数字序列
     */
    displayDigitSequence() {
        const display = document.getElementById('memory-display');
        
        if (display) {
            display.innerHTML = '<p style="text-align: center; font-size: 18px; color: var(--text-secondary);">请记住下面的数字序列...</p>';
        }

        // 创建数字键盘
        this.createNumpad();

        // 显示数字序列
        let index = 0;
        const interval = setInterval(() => {
            if (index >= this.sequence.length) {
                clearInterval(interval);
                this.hideDigitSequence();
                return;
            }

            // 显示当前数字
            if (display) {
                display.innerHTML = `
                    <div class="memory-sequence">
                        <div class="memory-digit">${this.sequence[index]}</div>
                    </div>
                `;
            }

            // 播放数字音效
            if (typeof audioManager !== 'undefined') {
                audioManager.playDigit(this.sequence[index]);
            }

            // 添加视觉效果
            const digit = display.querySelector('.memory-digit');
            if (digit && typeof visualsManager !== 'undefined') {
                visualsManager.pulse(digit);
            }

            index++;
        }, this.highlightDuration);
    }

    /**
     * 隐藏数字序列并等待用户输入
     */
    hideDigitSequence() {
        const display = document.getElementById('memory-display');
        
        if (display) {
            display.innerHTML = '<p style="text-align: center; font-size: 18px; color: var(--text-secondary);">请输入刚才的数字序列</p>';
        }

        this.isDisplaying = false;
        this.updateInputDisplay();
    }

    /**
     * 创建数字键盘
     */
    createNumpad() {
        const inputContainer = document.getElementById('memory-input');
        if (!inputContainer) return;

        // 创建数字键盘
        const numpadHTML = `
            <div class="memory-input-display" id="memory-input-display"></div>
            <div class="memory-numpad">
                <button class="numpad-btn" data-digit="1">1</button>
                <button class="numpad-btn" data-digit="2">2</button>
                <button class="numpad-btn" data-digit="3">3</button>
                <button class="numpad-btn" data-digit="4">4</button>
                <button class="numpad-btn" data-digit="5">5</button>
                <button class="numpad-btn" data-digit="6">6</button>
                <button class="numpad-btn" data-digit="7">7</button>
                <button class="numpad-btn" data-digit="8">8</button>
                <button class="numpad-btn" data-digit="9">9</button>
                <button class="numpad-btn clear">清除</button>
                <button class="numpad-btn" data-digit="0">0</button>
                <button class="numpad-btn submit">提交</button>
            </div>
        `;

        inputContainer.innerHTML = numpadHTML;

        // 绑定数字按钮点击事件
        const numpadBtns = inputContainer.querySelectorAll('.numpad-btn');
        numpadBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const digit = e.target.dataset.digit;
                
                if (digit !== undefined) {
                    this.handleDigitInput(parseInt(digit));
                } else if (e.target.classList.contains('clear')) {
                    this.clearInput();
                } else if (e.target.classList.contains('submit')) {
                    this.submitInput();
                }
            });
        });

        // 绑定键盘事件
        document.addEventListener('keydown', (e) => {
            if (!this.isRunning || this.isDisplaying || this.mode !== 'digit') {
                return;
            }

            if (e.key >= '0' && e.key <= '9') {
                this.handleDigitInput(parseInt(e.key));
            } else if (e.key === 'Backspace') {
                this.backspace();
            } else if (e.key === 'Enter') {
                this.submitInput();
            }
        });
    }

    /**
     * 处理网格点击（视觉空间模式）
     * @param {HTMLElement} cell - 被点击的网格单元格
     */
    handleGridClick(cell) {
        if (!this.isRunning || this.isDisplaying) {
            return;
        }

        const position = parseInt(cell.dataset.position);
        
        // 添加到用户输入
        this.userInput.push(position);
        
        // 标记用户输入
        cell.classList.add('user-input');
        
        // 播放音效
        if (typeof audioManager !== 'undefined') {
            audioManager.playClick();
        }

        // 检查是否完成输入
        if (this.userInput.length === this.sequence.length) {
            setTimeout(() => {
                this.checkAnswer();
            }, 300);
        }
    }

    /**
     * 处理数字输入（数字序列模式）
     * @param {number} digit - 输入的数字
     */
    handleDigitInput(digit) {
        if (!this.isRunning || this.isDisplaying) {
            return;
        }

        this.userInput.push(digit);
        this.updateInputDisplay();

        // 播放点击音效
        if (typeof audioManager !== 'undefined') {
            audioManager.playClick();
        }
    }

    /**
     * 清除输入
     */
    clearInput() {
        this.userInput = [];
        this.updateInputDisplay();
    }

    /**
     * 退格
     */
    backspace() {
        this.userInput.pop();
        this.updateInputDisplay();
    }

    /**
     * 提交输入（数字序列模式）
     */
    submitInput() {
        if (!this.isRunning || this.isDisplaying || this.userInput.length === 0) {
            return;
        }

        this.checkAnswer();
    }

    /**
     * 检查答案
     */
    checkAnswer() {
        // 检查答案是否正确
        const isCorrect = this.userInput.length === this.sequence.length &&
            this.userInput.every((value, index) => value === this.sequence[index]);

        if (isCorrect) {
            // 正确
            this.correctStreak++;
            this.showFeedback(true);
            
            // 播放正确音效
            if (typeof audioManager !== 'undefined') {
                audioManager.playCorrect();
            }

            // 更新记忆广度
            if (this.sequenceLength > this.maxSequenceLength) {
                this.maxSequenceLength = this.sequenceLength;
            }

            // 检查是否需要增加难度
            if (this.correctStreak >= 2) {
                this.sequenceLength++;
                this.correctStreak = 0;
            }

            setTimeout(() => {
                this.startRound();
            }, 1000);
        } else {
            // 错误
            this.correctStreak = 0;
            
            // 减少难度（最低3）
            if (this.sequenceLength > 3) {
                this.sequenceLength--;
            }

            this.showFeedback(false);
            
            // 播放错误音效
            if (typeof audioManager !== 'undefined') {
                audioManager.playWrong();
            }

            // 显示正确答案
            setTimeout(() => {
                this.showCorrectAnswer();
                
                // 重新开始当前难度
                setTimeout(() => {
                    this.startRound();
                }, 2000);
            }, 1000);
        }

        this.updateUI();
    }

    /**
     * 显示反馈
     * @param {boolean} isCorrect - 是否正确
     */
    showFeedback(isCorrect) {
        const display = document.getElementById('memory-display');
        if (!display) return;

        const message = isCorrect ? '✓ 正确！' : '✗ 错误！';
        const color = isCorrect ? 'var(--success-color)' : 'var(--primary-color)';

        display.innerHTML = `
            <div style="text-align: center; font-size: 32px; font-weight: 700; color: ${color};">
                ${message}
            </div>
        `;

        // 视觉空间模式：标记错误位置
        if (!isCorrect && this.mode === 'visual') {
            this.userInput.forEach((position, index) => {
                if (position !== this.sequence[index]) {
                    const cell = document.querySelector(`.memory-grid-cell[data-position="${position}"]`);
                    if (cell) {
                        cell.classList.remove('user-input');
                        cell.classList.add('error');
                    }
                }
            });
        }
    }

    /**
     * 显示正确答案
     */
    showCorrectAnswer() {
        const display = document.getElementById('memory-display');
        if (!display) return;

        if (this.mode === 'visual') {
            display.innerHTML = `<p style="text-align: center; font-size: 18px; color: var(--text-secondary);">正确顺序：${this.sequence.join(', ')}</p>`;
            
            // 高亮显示正确顺序
            const grid = document.getElementById('memory-grid');
            if (grid) {
                grid.innerHTML = '';
                
                for (let i = 1; i <= 9; i++) {
                    const cell = document.createElement('div');
                    cell.className = 'memory-grid-cell';
                    cell.dataset.position = i;
                    cell.textContent = i;
                    
                    // 标记正确序列中的位置
                    if (this.sequence.includes(i)) {
                        const index = this.sequence.indexOf(i) + 1;
                        cell.style.background = 'var(--info-color)';
                        cell.textContent = index;
                    }
                    
                    grid.appendChild(cell);
                }
            }
        } else {
            display.innerHTML = `<p style="text-align: center; font-size: 18px; color: var(--text-secondary);">正确序列：${this.sequence.join(' ')}</p>`;
        }
    }

    /**
     * 更新输入显示
     */
    updateInputDisplay() {
        const inputDisplay = document.getElementById('memory-input-display');
        if (!inputDisplay) return;

        inputDisplay.textContent = this.userInput.join(' ');
    }

    /**
     * 更新UI显示
     */
    updateUI() {
        const lengthDisplay = document.getElementById('memory-length');
        const streakDisplay = document.getElementById('memory-correct-streak');
        const spanDisplay = document.getElementById('memory-span');
        
        if (lengthDisplay) {
            lengthDisplay.textContent = this.sequenceLength;
        }
        
        if (streakDisplay) {
            streakDisplay.textContent = this.correctStreak;
        }

        if (spanDisplay) {
            spanDisplay.textContent = this.maxSequenceLength;
        }

        // 更新按钮状态
        const startBtn = document.querySelector('#memory-game .start-game-btn');
        const resetBtn = document.querySelector('#memory-game .reset-game-btn');
        
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
        const display = document.getElementById('memory-display');
        const inputContainer = document.getElementById('memory-input');
        const grid = document.getElementById('memory-grid');
        
        if (display) {
            display.innerHTML = '';
        }

        if (inputContainer) {
            inputContainer.innerHTML = '';
        }

        if (grid) {
            grid.innerHTML = '';
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
const memoryTrainer = new MemoryTrainer();

// 导出供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MemoryTrainer;
}
