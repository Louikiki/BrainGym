/**
 * AuditoryGame - 听觉选择性注意训练模块
 * 用户需要听声音序列，识别目标声音出现的位置
 */

class AuditoryGame {
    constructor() {
        this.sounds = [
            { type: 'high', name: '高音', icon: '🔊' },
            { type: 'low', name: '低音', icon: '🔉' },
            { type: 'short', name: '短音', icon: '⚡' },
            { type: 'long', name: '长音', icon: '〰️' }
        ];
        this.sequence = [];
        this.userInput = [];
        this.targetSound = null;
        this.level = 1;
        this.sequenceLength = 5;
        this.isPlaying = false;
        this.isRunning = false;
        this.isInitialized = false;
    }

    /**
     * 初始化听觉注意游戏
     */
    init() {
        if (this.isInitialized) {
            return;
        }

        this.bindEvents();
        this.isInitialized = true;
        console.log('AuditoryGame initialized');
    }

    /**
     * 绑定事件监听器
     */
    bindEvents() {
        const startBtn = document.querySelector('#auditory-game .start-game-btn');
        const resetBtn = document.querySelector('#auditory-game .reset-game-btn');
        const playBtn = document.getElementById('play-sound-btn');

        if (startBtn) {
            startBtn.addEventListener('click', () => this.startGame());
        }

        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetGame());
        }

        if (playBtn) {
            playBtn.addEventListener('click', () => this.playSequence());
        }

        // 绑定数字键盘
        this.bindNumpad();
    }

    /**
     * 绑定数字键盘事件
     */
    bindNumpad() {
        const inputContainer = document.getElementById('auditory-input');
        if (!inputContainer) return;

        // 创建数字键盘
        const numpadHTML = `
            <div class="memory-input-display" id="auditory-input-display"></div>
            <div class="memory-numpad">
                <button class="numpad-btn" data-position="1">1</button>
                <button class="numpad-btn" data-position="2">2</button>
                <button class="numpad-btn" data-position="3">3</button>
                <button class="numpad-btn" data-position="4">4</button>
                <button class="numpad-btn" data-position="5">5</button>
                <button class="numpad-btn" data-position="6">6</button>
                <button class="numpad-btn" data-position="7">7</button>
                <button class="numpad-btn" data-position="8">8</button>
                <button class="numpad-btn" data-position="9">9</button>
                <button class="numpad-btn clear">清除</button>
                <button class="numpad-btn" data-position="0">0</button>
                <button class="numpad-btn submit">提交</button>
            </div>
        `;

        inputContainer.innerHTML = numpadHTML;

        // 绑定数字按钮点击事件
        const numpadBtns = inputContainer.querySelectorAll('.numpad-btn');
        numpadBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const position = e.target.dataset.position;
                
                if (position !== undefined) {
                    this.handlePositionInput(parseInt(position));
                } else if (e.target.classList.contains('clear')) {
                    this.clearInput();
                } else if (e.target.classList.contains('submit')) {
                    this.submitInput();
                }
            });
        });

        // 绑定键盘事件
        document.addEventListener('keydown', (e) => {
            if (!this.isRunning || this.isPlaying) {
                return;
            }

            if (e.key >= '0' && e.key <= '9') {
                this.handlePositionInput(parseInt(e.key));
            } else if (e.key === 'Backspace') {
                this.backspace();
            } else if (e.key === 'Enter') {
                this.submitInput();
            }
        });
    }

    /**
     * 开始游戏
     */
    startGame() {
        if (this.isRunning) {
            return;
        }

        this.level = 1;
        this.sequenceLength = 5;
        this.isRunning = true;

        // 更新UI
        this.updateUI();

        // 开始第一关
        setTimeout(() => {
            this.startLevel();
        }, 500);

        // 播放音效
        if (typeof audioManager !== 'undefined') {
            audioManager.playClick();
        }
    }

    /**
     * 重置游戏
     */
    resetGame() {
        this.stopGame();
        this.level = 1;
        this.sequenceLength = 5;
        this.userInput = [];
        this.updateUI();
        this.clearDisplay();
    }

    /**
     * 停止游戏
     */
    stopGame() {
        this.isRunning = false;
        this.isPlaying = false;
    }

    /**
     * 开始新关卡
     */
    startLevel() {
        if (!this.isRunning) {
            return;
        }

        this.userInput = [];
        this.generateSequence();
        this.selectTargetSound();
        this.updateDisplay();
    }

    /**
     * 生成随机声音序列
     */
    generateSequence() {
        this.sequence = [];
        for (let i = 0; i < this.sequenceLength; i++) {
            const randomSound = this.sounds[Math.floor(Math.random() * this.sounds.length)];
            this.sequence.push(randomSound);
        }

        // 确保目标声音至少出现一次
        if (!this.sequence.some(s => s.type === this.targetSound?.type)) {
            const randomIndex = Math.floor(Math.random() * this.sequenceLength);
            this.sequence[randomIndex] = this.targetSound;
        }
    }

    /**
     * 选择目标声音
     */
    selectTargetSound() {
        this.targetSound = this.sounds[Math.floor(Math.random() * this.sounds.length)];
    }

    /**
     * 更新显示
     */
    updateDisplay() {
        const targetSoundDisplay = document.getElementById('target-sound');
        if (targetSoundDisplay) {
            targetSoundDisplay.textContent = `${this.targetSound.icon} ${this.targetSound.name}`;
        }

        this.updateInputDisplay();
    }

    /**
     * 播放声音序列
     */
    playSequence() {
        if (!this.isRunning || this.isPlaying) {
            return;
        }

        this.isPlaying = true;
        this.userInput = [];
        this.updateInputDisplay();

        const playBtn = document.getElementById('play-sound-btn');
        if (playBtn) {
            playBtn.classList.add('playing');
            playBtn.disabled = true;
        }

        // 播放目标声音示例
        if (typeof audioManager !== 'undefined') {
            audioManager.playAuditorySound(this.targetSound.type);
        }

        // 延迟后播放序列
        setTimeout(() => {
            let index = 0;
            const interval = setInterval(() => {
                if (index >= this.sequence.length) {
                    clearInterval(interval);
                    this.finishPlaying();
                    return;
                }

                // 播放当前声音
                if (typeof audioManager !== 'undefined') {
                    audioManager.playAuditorySound(this.sequence[index].type);
                }

                // 显示当前声音
                this.showCurrentSound(index);

                index++;
            }, 1000);
        }, 1500);
    }

    /**
     * 显示当前播放的声音
     * @param {number} index - 声音索引
     */
    showCurrentSound(index) {
        const display = document.getElementById('auditory-display');
        if (!display) return;

        const soundInfo = display.querySelector('.target-sound-info');
        if (soundInfo) {
            soundInfo.innerHTML = `
                <span class="label">第 ${index + 1} 个声音：</span>
                <span class="value">${this.sequence[index].icon} ${this.sequence[index].name}</span>
            `;
        }

        // 添加视觉效果
        if (typeof visualsManager !== 'undefined') {
            const value = soundInfo?.querySelector('.value');
            if (value) {
                visualsManager.pulse(value);
            }
        }
    }

    /**
     * 完成播放
     */
    finishPlaying() {
        this.isPlaying = false;

        const playBtn = document.getElementById('play-sound-btn');
        if (playBtn) {
            playBtn.classList.remove('playing');
            playBtn.disabled = false;
        }

        // 恢复显示
        const display = document.getElementById('auditory-display');
        if (display) {
            const soundInfo = display.querySelector('.target-sound-info');
            if (soundInfo) {
                soundInfo.innerHTML = `
                    <span class="label">目标声音：</span>
                    <span class="value">${this.targetSound.icon} ${this.targetSound.name}</span>
                `;
            }
        }
    }

    /**
     * 处理位置输入
     * @param {number} position - 位置（1-based）
     */
    handlePositionInput(position) {
        if (this.isPlaying || this.userInput.length >= this.sequence.length) {
            return;
        }

        this.userInput.push(position);
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
     * 提交输入
     */
    submitInput() {
        if (this.isPlaying || this.userInput.length === 0) {
            return;
        }

        // 检查答案
        const isCorrect = this.checkAnswer();

        if (isCorrect) {
            // 正确
            this.level++;
            this.sequenceLength++;
            
            // 播放正确音效
            if (typeof audioManager !== 'undefined') {
                audioManager.playCorrect();
            }

            // 显示正确提示
            this.showFeedback(true);

            setTimeout(() => {
                this.startLevel();
            }, 1000);
        } else {
            // 错误，游戏结束
            this.gameOver();
        }
    }

    /**
     * 检查答案是否正确
     * @returns {boolean} 是否正确
     */
    checkAnswer() {
        if (this.userInput.length === 0) {
            return false;
        }

        // 获取目标声音的所有位置
        const targetPositions = [];
        for (let i = 0; i < this.sequence.length; i++) {
            if (this.sequence[i].type === this.targetSound.type) {
                targetPositions.push(i + 1); // 转换为1-based索引
            }
        }

        // 检查用户输入是否包含所有目标位置
        if (this.userInput.length !== targetPositions.length) {
            return false;
        }

        for (const pos of this.userInput) {
            if (!targetPositions.includes(pos)) {
                return false;
            }
        }

        return true;
    }

    /**
     * 计算准确率
     * @returns {number} 准确率（0-1）
     */
    calculateAccuracy() {
        if (this.userInput.length === 0) {
            return 0;
        }

        let correctCount = 0;
        const targetPositions = [];
        
        for (let i = 0; i < this.sequence.length; i++) {
            if (this.sequence[i].type === this.targetSound.type) {
                targetPositions.push(i + 1);
            }
        }

        for (const pos of this.userInput) {
            if (targetPositions.includes(pos)) {
                correctCount++;
            }
        }

        return correctCount / targetPositions.length;
    }

    /**
     * 显示反馈
     * @param {boolean} isCorrect - 是否正确
     */
    showFeedback(isCorrect) {
        const display = document.getElementById('auditory-display');
        if (!display) return;

        const soundInfo = display.querySelector('.target-sound-info');
        if (soundInfo) {
            const message = isCorrect ? '✓ 正确！' : '✗ 错误！';
            const color = isCorrect ? 'var(--success-color)' : 'var(--primary-color)';
            
            soundInfo.innerHTML = `
                <span class="value" style="color: ${color}; font-size: 28px;">${message}</span>
            `;
        }
    }

    /**
     * 游戏结束
     */
    gameOver() {
        this.stopGame();

        const accuracy = this.calculateAccuracy();

        // 播放游戏结束音效
        if (typeof audioManager !== 'undefined') {
            audioManager.playGameOver();
        }

        // 保存记录
        if (typeof storageManager !== 'undefined') {
            storageManager.addRecord('auditory', {
                level: this.level,
                sequenceLength: this.sequenceLength,
                accuracy: accuracy,
                completed: true
            });
        }

        // 显示结果
        this.showResult();
    }

    /**
     * 显示游戏结果
     */
    showResult() {
        const display = document.getElementById('auditory-display');
        const inputContainer = document.getElementById('auditory-input');
        
        const targetPositions = [];
        for (let i = 0; i < this.sequence.length; i++) {
            if (this.sequence[i].type === this.targetSound.type) {
                targetPositions.push(i + 1);
            }
        }

        if (display) {
            display.innerHTML = `
                <div style="text-align: center; padding: 20px;">
                    <h3 style="font-size: 32px; color: var(--primary-color); margin-bottom: 20px;">
                        游戏结束！
                    </h3>
                    <p style="font-size: 24px; margin-bottom: 20px;">
                        达到关卡：<span style="font-weight: 700; color: var(--primary-color);">${this.level}</span>
                    </p>
                    <p style="font-size: 18px; color: var(--text-secondary);">
                        目标声音：${this.targetSound.icon} ${this.targetSound.name}
                    </p>
                    <p style="font-size: 18px; color: var(--text-secondary);">
                        正确答案：${targetPositions.join(', ')}
                    </p>
                    <p style="font-size: 18px; color: var(--text-secondary);">
                        你的答案：${this.userInput.join(', ')}
                    </p>
                    <p style="font-size: 16px; color: var(--text-secondary); margin-top: 10px;">
                        ${this.getPerformanceComment(this.level)}
                    </p>
                </div>
            `;
        }

        if (inputContainer) {
            inputContainer.innerHTML = '';
        }

        // 更新按钮状态
        const startBtn = document.querySelector('#auditory-game .start-game-btn');
        const resetBtn = document.querySelector('#auditory-game .reset-game-btn');
        
        if (startBtn) {
            startBtn.style.display = 'inline-block';
            startBtn.textContent = '再玩一次';
        }
        
        if (resetBtn) {
            resetBtn.style.display = 'none';
        }
    }

    /**
     * 根据关卡获取评价
     * @param {number} level - 关卡数
     * @returns {string} 评价文本
     */
    getPerformanceComment(level) {
        if (level >= 8) {
            return '太棒了！你的听觉注意能力非常出色！🌟';
        } else if (level >= 6) {
            return '做得很好！继续保持！💪';
        } else if (level >= 4) {
            return '不错的成绩！多加练习会更好！👍';
        } else {
            return '继续努力，熟能生巧！🎯';
        }
    }

    /**
     * 更新输入显示
     */
    updateInputDisplay() {
        const inputDisplay = document.getElementById('auditory-input-display');
        if (!inputDisplay) return;

        inputDisplay.textContent = this.userInput.join(', ');
    }

    /**
     * 更新UI显示
     */
    updateUI() {
        const levelDisplay = document.getElementById('auditory-level');
        const accuracyDisplay = document.getElementById('auditory-accuracy');
        
        if (levelDisplay) {
            levelDisplay.textContent = this.level;
        }
        
        if (accuracyDisplay) {
            accuracyDisplay.textContent = '0%';
        }

        // 更新按钮状态
        const startBtn = document.querySelector('#auditory-game .start-game-btn');
        const resetBtn = document.querySelector('#auditory-game .reset-game-btn');
        
        if (startBtn) {
            startBtn.style.display = 'none';
        }
        
        if (resetBtn) {
            resetBtn.style.display = 'inline-block';
        }
    }

    /**
     * 清空显示
     */
    clearDisplay() {
        const display = document.getElementById('auditory-display');
        const inputContainer = document.getElementById('auditory-input');
        
        if (display) {
            display.innerHTML = `
                <div class="target-sound-info">
                    <span class="label">目标声音：</span>
                    <span class="value" id="target-sound">-</span>
                </div>
                <div class="play-sound-btn" id="play-sound-btn">▶ 播放声音</div>
            `;
        }

        if (inputContainer) {
            inputContainer.innerHTML = '';
        }
    }
}

// 创建全局实例
const auditoryGame = new AuditoryGame();

// 导出供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuditoryGame;
}
