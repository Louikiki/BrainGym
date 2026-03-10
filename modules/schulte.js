/**
 * SchulteGame - 舒尔特表训练模块
 * 用户需要按顺序从1到N快速点击数字或字母
 * 
 * 功能特性：
 * 1. 可配置的网格大小（3x3到10x10）
 * 2. 支持数字和字母两种内容类型
 * 3. 相邻格子颜色不同（柔和对比色）
 * 4. 计时和错误计数
 * 5. 完整的数据记录和统计
 */

class SchulteGame {
    constructor() {
        // 关卡配置
        this.levels = [
            { size: 3, name: '3×3' },
            { size: 4, name: '4×4' },
            { size: 5, name: '5×5' },
            { size: 6, name: '6×6' },
            { size: 7, name: '7×7' },
            { size: 8, name: '8×8' },
            { size: 9, name: '9×9' },
            { size: 10, name: '10×10' }
        ];
        this.currentLevel = 0; // 从0开始索引
        this.completedLevels = [];
        
        // 游戏配置
        this.gridSize = this.levels[this.currentLevel].size;
        this.contentType = 'number'; // 'number' 或 'letter'
        this.totalItems = this.gridSize * this.gridSize;
        
        // 时间限制映射（根据网格大小自动设置）
        this.timeLimitMap = {
            3: 15,   // 3×3 = 15秒
            4: 30,   // 4×4 = 30秒
            5: 45,   // 5×5 = 45秒
            6: 60,   // 6×6 = 60秒
            7: 90,   // 7×7 = 90秒
            8: 150,  // 8×8 = 150秒
            9: 180,  // 9×9 = 180秒
            10: 210  // 10×10 = 210秒
        };
        
        // 游戏状态
        this.currentItem = 1;
        this.startTime = null;
        this.endTime = null;
        this.isRunning = false;
        this.timerInterval = null;
        
        // 颜色配置
        this.colors = [
            'linear-gradient(135deg, #A8D8EA, #C9E8F0)',
            'linear-gradient(135deg, #95E1D3, #B5F5E8)',
            'linear-gradient(135deg, #FFE66D, #FFF0A0)',
            'linear-gradient(135deg, #FFB997, #FFD4B3)',
            'linear-gradient(135deg, #C7CEEA, #E0F4FF)',
            'linear-gradient(135deg, #FF9AA2, #FFC3D0)'
        ];
        
        this.isInitialized = false;
    }

    /**
     * 初始化舒尔特表游戏
     */
    init() {
        if (this.isInitialized) {
            return;
        }

        this.bindEvents();
        this.updateUI();
        this.isInitialized = true;
        console.log('SchulteGame initialized');
    }

    /**
     * 绑定事件监听器
     */
    bindEvents() {
        const startBtn = document.querySelector('#schulte-game .start-game-btn');
        const resetBtn = document.querySelector('#schulte-game .reset-game-btn');
        const retryBtn = document.querySelector('#schulte-game .retry-game-btn');

        if (startBtn) {
            startBtn.addEventListener('click', () => this.startGame());
        }

        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetGame());
        }

        if (retryBtn) {
            retryBtn.addEventListener('click', () => this.retryGame());
        }

        // 绑定关卡步骤点击事件
        const steps = document.querySelectorAll('.level-steps .step');
        steps.forEach(step => {
            step.addEventListener('click', (e) => {
                const level = parseInt(e.target.dataset.level) - 1; // 转换为0-based索引
                if (level <= this.currentLevel && !this.isRunning) {
                    this.currentLevel = level;
                    this.gridSize = this.levels[this.currentLevel].size;
                    this.totalItems = this.gridSize * this.gridSize;
                    this.updateGridSizeClass();
                    this.clearGrid();
                    this.updateUI();
                }
            });
        });
    }

    /**
     * 更新关卡UI显示
     */
    updateLevelUI() {
        // 更新当前关卡显示
        const levelDisplay = document.getElementById('schulte-level');
        
        if (levelDisplay) {
            levelDisplay.textContent = this.currentLevel + 1;
        }
    }

    /**
     * 更新网格大小CSS类
     */
    updateGridSizeClass() {
        const grid = document.getElementById('schulte-grid');
        if (!grid) return;

        // 移除所有网格大小类
        for (let i = 3; i <= 10; i++) {
            grid.classList.remove(`grid-${i}`);
        }

        // 添加当前网格大小类
        grid.classList.add(`grid-${this.gridSize}`);
    }

    /**
     * 开始游戏
     */
    startGame() {
        if (this.isRunning) {
            return;
        }

        this.currentItem = 1;
        this.isRunning = true;
        this.startTime = Date.now();

        // 为当前关卡设置固定的内容类型
        if (this.currentLevel >= 0 && this.currentLevel <= 2) {
            // 第1-3关随机选择数字或字母
            this.contentType = Math.random() > 0.5 ? 'number' : 'letter';
        } else {
            // 第4关及以上使用数字模式（因为字母只有26个，无法满足更大的网格）
            this.contentType = 'number';
        }

        // 隐藏除信息和方格外的其他元素
        this.toggleGameElements(false);
        
        // 显示重新挑战按钮
        const retryButtonContainer = document.querySelector('.retry-button-container');
        if (retryButtonContainer) {
            retryButtonContainer.style.display = 'flex';
        }

        // 更新UI
        this.updateUI();
        this.updateGridSizeClass();
        this.generateGrid();
        this.startTimer();

        // 播放音效
        if (typeof audioManager !== 'undefined') {
            audioManager.playClick();
        }
    }

    /**
     * 切换游戏元素的显示/隐藏
     * @param {boolean} show - 是否显示
     */
    toggleGameElements(show) {
        const header = document.querySelector('.header');
        const moduleHeader = document.querySelector('#schulte .module-header');
        const gameProgress = document.querySelector('.game-progress');
        const gameControls = document.querySelector('.game-controls');
        
        if (header) {
            header.style.display = show ? 'block' : 'none';
        }
        
        if (moduleHeader) {
            // 只隐藏module-header的内容，保留back-home-btn
            const headerContent = moduleHeader.querySelector('.header-content');
            if (headerContent) {
                headerContent.style.display = show ? 'block' : 'none';
            }
            // 确保back-home-btn始终可见
            const backHomeBtn = moduleHeader.querySelector('.back-home-btn');
            if (backHomeBtn) {
                backHomeBtn.style.display = 'block';
            }
        }
        
        if (gameProgress) {
            gameProgress.style.display = show ? 'block' : 'none';
        }
        
        if (gameControls) {
            gameControls.style.display = show ? 'flex' : 'none';
        }
    }

    /**
     * 重置游戏
     */
    resetGame() {
        this.stopGame();
        this.currentItem = 1;
        
        // 恢复隐藏的元素
        this.toggleGameElements(true);
        
        this.updateUI();
        this.clearGrid();
        this.updateGridSizeClass();
    }

    /**
     * 重新挑战当前关卡
     */
    retryGame() {
        this.stopGame();
        this.currentItem = 1;
        
        // 显示现有的挑战失败提示
        this.showRetryFailure();
    }

    /**
     * 显示重新挑战的失败提示
     */
    showRetryFailure() {
        const grid = document.getElementById('schulte-grid');
        if (!grid) return;

        // 创建遮罩元素，不清除原有网格内容
        const overlay = document.createElement('div');
        overlay.className = 'grid-content';
        overlay.innerHTML = `
            <h3 style="font-size: 32px; margin-bottom: 20px;">
                ❌ 挑战失败
            </h3>
            <p style="font-size: 24px; margin-bottom: 10px;">
                用时：<span style="font-weight: 700; color: var(--primary-color);">0.0</span> 秒
            </p>
            <p style="font-size: 16px; margin-bottom: 30px;">
                重新挑战当前关卡
            </p>
            <div class="game-controls">
                ${this.currentLevel > 0 ? `
                <button class="control-btn prev-level-btn" style="padding: 12px 32px; font-size: 14px;">
                    上一关
                </button>
                ` : ''}
                <button class="control-btn restart-game-btn" style="padding: 12px 32px; font-size: 14px;">
                    再玩一次
                </button>
                ${this.currentLevel < this.levels.length - 1 ? `
                <button class="control-btn next-level-btn" style="padding: 12px 32px; font-size: 14px; background-color: #ccc; cursor: not-allowed;">
                    下一关
                </button>
                ` : ''}
            </div>
        `;

        // 添加遮罩到网格
        grid.appendChild(overlay);
        
        // 确保遮罩层显示
        overlay.style.display = 'flex';
        overlay.style.zIndex = '1000';
        
        // 绑定按钮事件
        const restartBtn = overlay.querySelector('.restart-game-btn');
        if (restartBtn) {
            restartBtn.addEventListener('click', () => {
                this.isRunning = true;
                this.startTime = Date.now();
                
                // 显示重新挑战按钮
                const retryButtonContainer = document.querySelector('.retry-button-container');
                if (retryButtonContainer) {
                    retryButtonContainer.style.display = 'flex';
                }
                
                // 立即重置已用时间显示
                const elapsedDisplay = document.getElementById('schulte-elapsed');
                if (elapsedDisplay) {
                    elapsedDisplay.textContent = '0.0s';
                }
                
                this.updateUI();
                this.clearGrid();
                this.generateGrid();
                this.startTimer();
                
                // 播放音效
                if (typeof audioManager !== 'undefined') {
                    audioManager.playClick();
                }
            });
        }
        
        const prevLevelBtn = overlay.querySelector('.prev-level-btn');
        if (prevLevelBtn) {
            prevLevelBtn.addEventListener('click', () => {
                // 设置当前关卡为上一关
                this.currentLevel = Math.max(0, this.currentLevel - 1);
                this.gridSize = this.levels[this.currentLevel].size;
                this.totalItems = this.gridSize * this.gridSize;
                this.updateGridSizeClass();
                this.resetGame();
            });
        }
        
        const nextLevelBtn = overlay.querySelector('.next-level-btn');
        if (nextLevelBtn) {
            nextLevelBtn.addEventListener('click', () => {
                // 显示提示，当前关卡挑战失败，不能进入下一关
                alert('当前关卡挑战失败，需要先完成当前关卡才能进入下一关！');
            });
        }
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
        
        // 隐藏重新挑战按钮
        const retryButtonContainer = document.querySelector('.retry-button-container');
        if (retryButtonContainer) {
            retryButtonContainer.style.display = 'none';
        }
    }

    /**
     * 生成舒尔特表网格
     */
    generateGrid() {
        const grid = document.getElementById('schulte-grid');
        if (!grid) return;

        // 恢复grid的display为grid，以便网格正确显示
        grid.style.display = 'grid';

        // 完全清除网格内容，包括所有单元格和遮罩层
        grid.innerHTML = '';
        grid.classList.add('has-items');

        // 生成项目数组
        const items = this.generateItems();
        
        // 随机打乱
        this.shuffleArray(items);

        // 创建网格单元格
        const gridArray = Array(this.gridSize).fill().map(() => Array(this.gridSize).fill(null));
        
        // 填充网格
        let itemIndex = 0;
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                const item = items[itemIndex];
                gridArray[row][col] = item;
                itemIndex++;
            }
        }

        // 渲染单元格并分配颜色
        itemIndex = 0;
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                const item = items[itemIndex];
                const cell = this.createCell(item, row, col, gridArray);
                grid.appendChild(cell);
                itemIndex++;
            }
        }
    }

    /**
     * 生成项目数组（数字或字母）
     * @returns {Array} 项目数组
     */
    generateItems() {
        const items = [];
        
        // 使用在startGame中设置的固定内容类型
        let currentContentType = this.contentType;
        
        if (currentContentType === 'number') {
            for (let i = 1; i <= this.totalItems; i++) {
                items.push({
                    value: i,
                    display: i.toString()
                });
            }
        } else {
            // 生成字母（A-Z，超过26个时循环）
            for (let i = 0; i < this.totalItems; i++) {
                const charCode = 65 + (i % 26);
                const letter = String.fromCharCode(charCode);
                items.push({
                    value: i + 1,
                    display: letter
                });
            }
        }
        
        return items;
    }

    /**
     * 创建单元格元素
     * @param {Object} item - 项目对象
     * @param {number} row - 行索引
     * @param {number} col - 列索引
     * @param {Array} gridArray - 网格数组
     * @returns {HTMLElement} 单元格元素
     */
    createCell(item, row, col, gridArray) {
        const cell = document.createElement('button');
        cell.className = 'schulte-cell';
        cell.textContent = item.display;
        cell.dataset.value = item.value;
        cell.dataset.row = row;
        cell.dataset.col = col;
        
        // 设置文字颜色为黑色
        cell.style.color = '#000000';
        
        // 分配颜色（确保相邻格子颜色不同）
        const colorIndex = this.getColorIndex(row, col, gridArray);
        cell.style.background = this.colors[colorIndex];
        
        cell.addEventListener('click', () => this.handleCellClick(cell, item.value));
        return cell;
    }

    /**
     * 获取单元格颜色索引
     * @param {number} row - 行索引
     * @param {number} col - 列索引
     * @param {Array} gridArray - 网格数组
     * @returns {number} 颜色索引
     */
    getColorIndex(row, col, gridArray) {
        // 检查上下左右相邻的格子颜色
        const usedColors = new Set();
        
        // 上
        if (row > 0) {
            const neighbor = gridArray[row - 1][col];
            if (neighbor && neighbor.colorIndex !== undefined) {
                usedColors.add(neighbor.colorIndex);
            }
        }
        
        // 左
        if (col > 0) {
            const neighbor = gridArray[row][col - 1];
            if (neighbor && neighbor.colorIndex !== undefined) {
                usedColors.add(neighbor.colorIndex);
            }
        }
        
        // 选择一个未使用的颜色
        for (let i = 0; i < this.colors.length; i++) {
            if (!usedColors.has(i)) {
                // 记录颜色索引到网格数组
                if (gridArray[row][col]) {
                    gridArray[row][col].colorIndex = i;
                }
                return i;
            }
        }
        
        // 如果所有颜色都被使用，随机选择一个
        return Math.floor(Math.random() * this.colors.length);
    }

    /**
     * 处理单元格点击
     * @param {HTMLElement} cell - 被点击的单元格
     * @param {number} value - 单元格值
     */
    handleCellClick(cell, value) {
        if (!this.isRunning) {
            return;
        }

        if (value === this.currentItem) {
            // 正确点击
            cell.classList.add('correct');
            cell.disabled = true;
            
            // 播放正确音效
            if (typeof audioManager !== 'undefined') {
                audioManager.playCorrect();
            }

            // 添加视觉效果
            if (typeof visualsManager !== 'undefined') {
                visualsManager.pulse(cell);
            }

            this.currentItem++;

            // 检查是否完成
            if (this.currentItem > this.totalItems) {
                this.completeGame();
            } else {
                this.updateUI();
            }
        } else {
            // 错误点击
            cell.classList.add('wrong');
            
            // 播放错误音效
            if (typeof audioManager !== 'undefined') {
                audioManager.playWrong();
            }

            // 添加抖动效果
            if (typeof visualsManager !== 'undefined') {
                visualsManager.shake(cell);
            }

            setTimeout(() => {
                cell.classList.remove('wrong');
            }, 300);

            this.updateUI();
        }
    }

    /**
     * 完成游戏
     */
    completeGame() {
        this.endTime = Date.now();
        const time = (this.endTime - this.startTime) / 1000;

        this.stopGame();

        // 播放成功音效
        if (typeof audioManager !== 'undefined') {
            audioManager.playSuccess();
        }

        // 保存记录
        if (typeof storageManager !== 'undefined') {
            storageManager.addRecord('schulte', {
                time: time,
                gridSize: this.gridSize,
                contentType: this.contentType,
                totalItems: this.totalItems,
                completed: true,
                level: this.currentLevel + 1
            });
        }

        // 标记当前关卡为已完成
        if (!this.completedLevels.includes(this.currentLevel)) {
            this.completedLevels.push(this.currentLevel);
        }

        // 检查是否还有下一关
        if (this.currentLevel < this.levels.length - 1) {
            // 保存当前关卡信息
            const completedLevel = this.currentLevel;
            const currentTime = time;
            
            // 显示关卡完成提示（保留方格数字）
            this.showLevelComplete(currentTime, completedLevel);
            
            // 进入下一关（在用户点击按钮后）
        } else {
            // 所有关卡完成（保留方格数字）
            this.showGameComplete(time);
        }

        // 恢复隐藏的元素（在显示完成提示后）
        this.toggleGameElements(true);
    }

    /**
     * 显示关卡完成提示
     * @param {number} time - 用时（秒）
     * @param {number} completedLevel - 已完成的关卡索引
     */
    showLevelComplete(time, completedLevel) {
        const grid = document.getElementById('schulte-grid');
        if (!grid) return;

        const nextLevel = Math.min(this.levels.length - 1, this.currentLevel);

        // 创建遮罩元素，不清除原有网格内容
        const overlay = document.createElement('div');
        overlay.className = 'grid-content';
        overlay.innerHTML = `
            <h3 style="font-size: 32px; margin-bottom: 20px;">
                🎉 挑战成功！
            </h3>
            <p style="font-size: 24px; margin-bottom: 10px;">
                用时：<span style="font-weight: 700; color: var(--primary-color);">${time.toFixed(2)}</span> 秒
            </p>
            <p style="font-size: 20px; margin-bottom: 20px; font-weight: 600;">
                即将进入第 ${completedLevel + 2} 关：${this.levels[completedLevel + 1].name}
            </p>
            <p style="font-size: 16px; margin-bottom: 30px;">
                ${this.getPerformanceComment(time)}
            </p>
            <div class="game-controls">
                ${this.currentLevel > 0 ? `
                <button class="control-btn prev-level-btn" style="padding: 12px 32px; font-size: 14px;">
                    上一关
                </button>
                ` : ''}
                <button class="control-btn restart-game-btn" style="padding: 12px 32px; font-size: 14px;">
                    再玩一次
                </button>
                ${this.currentLevel < this.levels.length - 1 ? `
                <button class="control-btn next-level-btn" style="padding: 12px 32px; font-size: 14px;">
                    进入下一关
                </button>
                ` : ''}
            </div>
        `;

        // 添加遮罩到网格
        grid.appendChild(overlay);
        
        // 确保遮罩层显示
        overlay.style.display = 'flex';
        overlay.style.zIndex = '1000';
        
        // 调试信息
        console.log('Overlay added to grid:', overlay.parentNode === grid);
        console.log('Grid children count after:', grid.children.length);
        console.log('Overlay display style:', overlay.style.display);
        console.log('Overlay z-index:', overlay.style.zIndex);
        
        // 确保遮罩层显示
        overlay.style.display = 'flex';
        overlay.style.zIndex = '1000';
        
        // 确保遮罩层显示
        overlay.style.display = 'flex';
        overlay.style.zIndex = '1000';
        
        // 确保遮罩层显示
        overlay.style.display = 'flex';
        overlay.style.zIndex = '1000';
        
        // 确保遮罩层显示
        overlay.style.display = 'flex';
        overlay.style.zIndex = '1000';
        
        // 确保遮罩层显示
        overlay.style.display = 'flex';
        overlay.style.zIndex = '1000';
        
        // 确保遮罩层显示
        overlay.style.display = 'flex';
        overlay.style.zIndex = '1000';
        
        // 调试信息
        console.log('showLevelComplete called');
        console.log('Overlay added to grid:', overlay.parentNode === grid);
        console.log('Grid children count:', grid.children.length);

        // 绑定按钮事件
        const nextLevelBtn = overlay.querySelector('.next-level-btn');
        if (nextLevelBtn) {
            nextLevelBtn.addEventListener('click', () => {
                // 进入下一关
                this.currentLevel++;
                this.gridSize = this.levels[this.currentLevel].size;
                this.totalItems = this.gridSize * this.gridSize;
                this.updateGridSizeClass();
                this.resetGame();
                this.startGame();
            });
        }

        const restartBtn = overlay.querySelector('.restart-game-btn');
        if (restartBtn) {
            restartBtn.addEventListener('click', () => {
                this.resetGame();
                this.startGame();
            });
        }

        const prevLevelBtn = overlay.querySelector('.prev-level-btn');
        if (prevLevelBtn) {
            prevLevelBtn.addEventListener('click', () => {
                // 设置当前关卡为上一关
                this.currentLevel = Math.max(0, this.currentLevel - 1);
                this.gridSize = this.levels[this.currentLevel].size;
                this.totalItems = this.gridSize * this.gridSize;
                this.updateGridSizeClass();
                this.resetGame();
                this.clearGrid(); // 确保显示开始按钮
                this.updateUI(); // 更新UI显示当前关卡信息
            });
        }

        // 更新按钮状态
        const startBtn = document.querySelector('#schulte-game .start-game-btn');
        const resetBtn = document.querySelector('#schulte-game .reset-game-btn');
        
        if (startBtn) {
            startBtn.style.display = 'none';
        }
        
        if (resetBtn) {
            resetBtn.style.display = 'none';
        }
    }

    /**
     * 显示游戏全部完成提示
     * @param {number} time - 用时（秒）
     */
    showGameComplete(time) {
        const grid = document.getElementById('schulte-grid');
        if (!grid) return;

        // 创建遮罩元素，不清除原有网格内容
        const overlay = document.createElement('div');
        overlay.className = 'grid-content';
        overlay.innerHTML = `
            <h3 style="font-size: 36px; margin-bottom: 20px;">
                🏆 恭喜完成所有关卡！
            </h3>
            <p style="font-size: 24px; margin-bottom: 10px;">
                用时：<span style="font-weight: 700; color: var(--primary-color);">${time.toFixed(2)}</span> 秒
            </p>
            <p style="font-size: 20px; margin-bottom: 30px; font-weight: 600;">
                你已经成功挑战了所有 8 个关卡！
            </p>
            <p style="font-size: 16px; margin-bottom: 30px;">
                ${this.getPerformanceComment(time)}
            </p>
            <p style="font-size: 16px; margin-bottom: 30px;">
                你的专注力和视觉搜索能力已经得到了很好的训练！继续保持练习，挑战更高的水平！
            </p>
            <div class="game-controls">
                <button class="control-btn prev-level-btn" style="padding: 12px 32px; font-size: 14px;">
                    上一关
                </button>
                <button class="control-btn restart-game-btn" style="padding: 12px 32px; font-size: 14px;">
                    重新开始
                </button>
            </div>
        `;

        // 添加遮罩到网格
        grid.appendChild(overlay);
        
        // 确保遮罩层显示
        overlay.style.display = 'flex';
        overlay.style.zIndex = '1000';

        // 绑定按钮事件
        const restartBtn = overlay.querySelector('.restart-game-btn');
        if (restartBtn) {
            restartBtn.addEventListener('click', () => {
                this.resetGame();
                this.currentLevel = 0;
                this.gridSize = this.levels[this.currentLevel].size;
                this.totalItems = this.gridSize * this.gridSize;
                this.completedLevels = [];
                this.updateGridSizeClass();
                this.clearGrid();
                this.updateUI();
            });
        }

        const prevLevelBtn = overlay.querySelector('.prev-level-btn');
        if (prevLevelBtn) {
            prevLevelBtn.addEventListener('click', () => {
                this.currentLevel = Math.max(0, this.currentLevel - 1);
                this.gridSize = this.levels[this.currentLevel].size;
                this.totalItems = this.gridSize * this.gridSize;
                this.updateGridSizeClass();
                this.resetGame();
            });
        }

        // 更新按钮状态
        const startBtn = document.querySelector('#schulte-game .start-game-btn');
        const resetBtn = document.querySelector('#schulte-game .reset-game-btn');
        
        if (startBtn) {
            startBtn.style.display = 'none';
        }
        
        if (resetBtn) {
            resetBtn.style.display = 'none';
        }
    }

    /**
     * 显示游戏结果
     * @param {number} time - 用时（秒）
     */
    showResult(time) {
        const grid = document.getElementById('schulte-grid');
        if (!grid) return;

        // 创建遮罩元素，不清除原有网格内容
        const overlay = document.createElement('div');
        overlay.className = 'grid-content';
        overlay.innerHTML = `
            <h3 style="font-size: 32px; margin-bottom: 20px;">
                🎉 恭喜完成！
            </h3>
            <p style="font-size: 24px; margin-bottom: 10px;">
                用时：<span style="font-weight: 700;">${time.toFixed(2)}</span> 秒
            </p>
            <p style="font-size: 16px; margin-bottom: 30px;">
                ${this.getPerformanceComment(time)}
            </p>
            <div class="game-controls">
                ${this.currentLevel > 0 ? `
                <button class="control-btn prev-level-btn" style="padding: 12px 32px; font-size: 16px;">
                    上一关
                </button>
                ` : ''}
                <button class="control-btn restart-game-btn" style="padding: 12px 32px; font-size: 16px;">
                    再玩一次
                </button>
                ${this.currentLevel < this.levels.length - 1 ? `
                <button class="control-btn next-level-btn" style="padding: 12px 32px; font-size: 16px;">
                    下一关
                </button>
                ` : ''}
            </div>
        `;

        // 添加遮罩到网格
        grid.appendChild(overlay);
        
        // 确保遮罩层显示
        overlay.style.display = 'flex';
        overlay.style.zIndex = '1000';
        
        // 调试信息
        console.log('showTimeoutResult called');
        console.log('Overlay added to grid:', overlay.parentNode === grid);
        console.log('Grid children count:', grid.children.length);

        // 绑定按钮事件
        const restartBtn = overlay.querySelector('.restart-game-btn');
        if (restartBtn) {
            restartBtn.addEventListener('click', () => {
                this.resetGame();
                this.startGame();
            });
        }

        const nextLevelBtn = overlay.querySelector('.next-level-btn');
        if (nextLevelBtn) {
            nextLevelBtn.addEventListener('click', () => {
                this.currentLevel = Math.min(this.levels.length - 1, this.currentLevel + 1);
                this.gridSize = this.levels[this.currentLevel].size;
                this.totalItems = this.gridSize * this.gridSize;
                this.updateGridSizeClass();
                this.resetGame();
                this.startGame();
            });
        }

        const prevLevelBtn = overlay.querySelector('.prev-level-btn');
        if (prevLevelBtn) {
            prevLevelBtn.addEventListener('click', () => {
                this.currentLevel = Math.max(0, this.currentLevel - 1);
                this.gridSize = this.levels[this.currentLevel].size;
                this.totalItems = this.gridSize * this.gridSize;
                this.updateGridSizeClass();
                this.resetGame();
            });
        }

        // 保存记录
        if (typeof storageManager !== 'undefined') {
            const timeLimit = this.timeLimitMap[this.gridSize] || 0;
            storageManager.addRecord('schulte', {
                time: time,
                timeLimit: timeLimit,
                gridSize: this.gridSize,
                contentType: this.contentType,
                completedItems: this.totalItems,
                totalItems: this.totalItems,
                timeout: false,
                completed: true
            });
        }

        // 更新按钮状态
        const startBtn = document.querySelector('#schulte-game .start-game-btn');
        const resetBtn = document.querySelector('#schulte-game .reset-game-btn');
        
        if (startBtn) {
            startBtn.style.display = 'none';
        }
        
        if (resetBtn) {
            resetBtn.style.display = 'none';
        }
    }

    /**
     * 根据用时获取评价
     * @param {number} time - 用时（秒）
     * @returns {string} 评价文本
     */
    getPerformanceComment(time) {
        const avgTimePerItem = time / this.totalItems;
        
        if (avgTimePerItem < 0.5) {
            return '太棒了！你的专注力和反应速度非常出色！🌟';
        } else if (avgTimePerItem < 1) {
            return '做得很好！继续保持这样的速度！💪';
        } else if (avgTimePerItem < 2) {
            return '不错的成绩！多加练习会更上一层楼！👍';
        } else {
            return '继续努力，熟能生巧！保持专注，你会做得更好！🎯';
        }
    }

    /**
     * 开始计时器
     */
    startTimer() {
        // 获取当前网格大小对应的时间限制
        const timeLimit = this.timeLimitMap[this.gridSize] || 0;
        
        this.timerInterval = setInterval(() => {
            const currentTime = (Date.now() - this.startTime) / 1000;
            const elapsedDisplay = document.getElementById('schulte-elapsed');
            const timeDisplay = document.getElementById('schulte-time');
            
            // 显示已用时间
            if (elapsedDisplay) {
                elapsedDisplay.textContent = currentTime.toFixed(1) + 's';
            }
            
            // 显示限时
            if (timeDisplay) {
                timeDisplay.textContent = timeLimit + 's';
            }
            
            // 检查是否超时（当实际用时等于或超过限时）
            if (currentTime >= timeLimit) {
                clearInterval(this.timerInterval); // 清除计时器，避免多次调用
                this.handleTimeout();
            }
        }, 100);
    }

    /**
     * 处理超时
     */
    handleTimeout() {
        this.stopGame();
        
        // 播放超时音效
        if (typeof audioManager !== 'undefined') {
            audioManager.playWrong();
        }

        // 显示超时结果
        this.showTimeoutResult();
        
        // 恢复隐藏的元素（在显示超时结果后）
        this.toggleGameElements(true);
        
        // 调试信息
        console.log('handleTimeout called');
        console.log('Current level:', this.currentLevel);
        console.log('Grid size:', this.gridSize);
        console.log('Time limit:', this.timeLimitMap[this.gridSize]);
    }

    /**
     * 显示超时结果
     */
    showTimeoutResult() {
        const grid = document.getElementById('schulte-grid');
        if (!grid) {
            console.log('showTimeoutResult: grid not found');
            return;
        }
        
        // 调试信息
        console.log('showTimeoutResult called');
        console.log('Grid found:', grid);
        console.log('Grid children count before:', grid.children.length);

        const completedItems = this.currentItem - 1;
        const actualTime = (Date.now() - this.startTime) / 1000;

        // 创建遮罩元素，不清除原有网格内容
        const overlay = document.createElement('div');
        overlay.className = 'grid-content';
        overlay.innerHTML = `
            <h3 style="font-size: 32px; margin-bottom: 20px;">
                ❌ 挑战失败
            </h3>
            <p style="font-size: 24px; margin-bottom: 10px;">
                用时：<span style="font-weight: 700; color: var(--primary-color);">${actualTime.toFixed(2)}</span> 秒
            </p>
            <p style="font-size: 16px; margin-bottom: 30px;">
                ${this.getTimeoutComment(completedItems, this.totalItems)}
            </p>
            <div class="game-controls">
                ${this.currentLevel > 0 ? `
                <button class="control-btn prev-level-btn" style="padding: 12px 32px; font-size: 14px;">
                    上一关
                </button>
                ` : ''}
                <button class="control-btn restart-game-btn" style="padding: 12px 32px; font-size: 14px;">
                    再玩一次
                </button>
                ${this.currentLevel < this.levels.length - 1 ? `
                <button class="control-btn next-level-btn" style="padding: 12px 32px; font-size: 14px; background-color: #ccc; cursor: not-allowed;">
                    下一关
                </button>
                ` : ''}
            </div>
        `;

        // 添加遮罩到网格
        grid.appendChild(overlay);
        
        // 确保遮罩层显示
        overlay.style.display = 'flex';
        overlay.style.zIndex = '1000';

        // 绑定按钮事件
        const restartBtn = overlay.querySelector('.restart-game-btn');
        if (restartBtn) {
            restartBtn.addEventListener('click', () => {
                this.resetGame();
                this.startGame();
            });
        }

        const nextLevelBtn = overlay.querySelector('.next-level-btn');
        if (nextLevelBtn) {
            nextLevelBtn.addEventListener('click', () => {
                alert('挑战成功才可以进入下一关');
            });
        }

        const prevLevelBtn = overlay.querySelector('.prev-level-btn');
        if (prevLevelBtn) {
            prevLevelBtn.addEventListener('click', () => {
                this.currentLevel = Math.max(0, this.currentLevel - 1);
                this.gridSize = this.levels[this.currentLevel].size;
                this.totalItems = this.gridSize * this.gridSize;
                this.updateGridSizeClass();
                this.resetGame();
            });
        }

        // 保存记录
        if (typeof storageManager !== 'undefined') {
            const timeLimit = this.timeLimitMap[this.gridSize] || 0;
            storageManager.addRecord('schulte', {
                time: actualTime,
                timeLimit: timeLimit,
                gridSize: this.gridSize,
                contentType: this.contentType,
                completedItems: completedItems,
                totalItems: this.totalItems,
                timeout: true,
                completed: false
            });
        }

        // 更新按钮状态
        const startBtn = document.querySelector('#schulte-game .start-game-btn');
        const resetBtn = document.querySelector('#schulte-game .reset-game-btn');
        
        if (startBtn) {
            startBtn.style.display = 'none';
        }
        
        if (resetBtn) {
            resetBtn.style.display = 'none';
        }
    }

    /**
     * 根据完成度获取超时评价
     * @param {number} completed - 完成数量
     * @param {number} total - 总数量
     * @returns {string} 评价文本
     */
    getTimeoutComment(completed, total) {
        const percentage = (completed / total) * 100;
        
        if (percentage >= 90) {
            return '非常接近完成！再快一点点就成功了！🌟';
        } else if (percentage >= 70) {
            return '完成度不错！继续练习提高速度！💪';
        } else if (percentage >= 50) {
            return '还需要更多练习，加油！👍';
        } else {
            return '不要气馁，熟能生巧！🎯';
        }
    }

    /**
     * 更新UI显示
     */
    updateUI() {
        // 使用在startGame中设置的固定内容类型
        let currentContentType = this.contentType;
        
        // 更新当前目标
        const currentDisplay = document.getElementById('schulte-current');
        if (currentDisplay) {
            if (currentContentType === 'number') {
                currentDisplay.textContent = this.currentItem;
            } else {
                // 显示字母
                const charCode = 65 + ((this.currentItem - 1) % 26);
                currentDisplay.textContent = String.fromCharCode(charCode);
            }
        }

        // 更新终极目标
        const ultimateDisplay = document.getElementById('schulte-ultimate');
        if (ultimateDisplay) {
            if (currentContentType === 'number') {
                ultimateDisplay.textContent = this.totalItems;
            } else {
                // 显示字母
                const charCode = 65 + ((this.totalItems - 1) % 26);
                ultimateDisplay.textContent = String.fromCharCode(charCode);
            }
        }

        // 更新时间显示
        const elapsedDisplay = document.getElementById('schulte-elapsed');
        const timeDisplay = document.getElementById('schulte-time');
        if (elapsedDisplay && !this.isRunning) {
            elapsedDisplay.textContent = '0.0s';
        }
        if (timeDisplay && !this.isRunning) {
            const timeLimit = this.timeLimitMap[this.gridSize] || 0;
            timeDisplay.textContent = timeLimit + 's';
        }

        // 更新关卡显示
        const levelDisplay = document.getElementById('current-level');
        if (levelDisplay) {
            levelDisplay.textContent = this.currentLevel + 1;
        }

        const totalLevelsDisplay = document.getElementById('total-levels');
        if (totalLevelsDisplay) {
            totalLevelsDisplay.textContent = this.levels.length;
        }

        // 更新按钮状态
        const startBtn = document.querySelector('#schulte-game .start-game-btn');
        const resetBtn = document.querySelector('#schulte-game .reset-game-btn');
        
        if (startBtn) {
            startBtn.style.display = this.isRunning ? 'none' : 'inline-block';
        }
        
        if (resetBtn) {
            resetBtn.style.display = this.isRunning ? 'inline-block' : 'none';
        }
    }

    /**
     * 清空网格
     */
    clearGrid() {
        const grid = document.getElementById('schulte-grid');
        if (grid) {
            // 暂时将grid的display设置为block，以便游戏规则正确显示
            grid.style.display = 'block';
            
            grid.innerHTML = `
                <div class="grid-content game-rules-container">
                    <div class="game-rules">
                        <h3>游戏规则</h3>
                        <p>按顺序快速点击数字或字母，越快越好！</p>
                    </div>
                    <div class="game-controls">
                        <button class="control-btn start-game-btn">开始游戏</button>
                        <button class="control-btn reset-game-btn" style="display:none;">重新开始</button>
                    </div>
                </div>
            `;
            
            // 移除has-items类
            grid.classList.remove('has-items');
            
            // 重新绑定按钮事件
            const startBtn = grid.querySelector('.start-game-btn');
            const resetBtn = grid.querySelector('.reset-game-btn');
            
            if (startBtn) {
                startBtn.addEventListener('click', () => this.startGame());
            }
            
            if (resetBtn) {
                resetBtn.addEventListener('click', () => this.resetGame());
            }
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
const schulteGame = new SchulteGame();

// 导出供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SchulteGame;
}
