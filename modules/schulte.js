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
        // 游戏配置
        this.gridSize = 5;
        this.contentType = 'number'; // 'number' 或 'letter'
        this.totalItems = this.gridSize * this.gridSize;
        
        // 时间限制映射（根据网格大小自动设置）
        this.timeLimitMap = {
            3: 15,   // 3×3 = 15秒
            4: 30,   // 4×4 = 30秒
            5: 45,   // 5×5 = 45秒
            6: 60,   // 6×6 = 60秒
            7: 90,   // 7×7 = 90秒
            8: 120,  // 8×8 = 120秒
            9: 150,  // 9×9 = 150秒
            10: 180  // 10×10 = 180秒
        };
        
        // 游戏状态
        this.currentItem = 1;
        this.startTime = null;
        this.endTime = null;
        this.isRunning = false;
        this.timerInterval = null;
        this.errorCount = 0;
        
        // 颜色配置
        this.colors = [
            'linear-gradient(135deg, #A8D8EA, #C9E8F0)',
            'linear-gradient(135deg, #95E1D3, #B5F5E8)',
            'linear-gradient(135deg, #FFE66D, #FFF0A0)'
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
        const gridSizeSelect = document.getElementById('schulte-grid-size');
        const contentTypeSelect = document.getElementById('schulte-content-type');

        if (startBtn) {
            startBtn.addEventListener('click', () => this.startGame());
        }

        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetGame());
        }

        if (gridSizeSelect) {
            gridSizeSelect.addEventListener('change', (e) => {
                this.gridSize = parseInt(e.target.value);
                this.totalItems = this.gridSize * this.gridSize;
                if (!this.isRunning) {
                    this.updateGridSizeClass();
                    this.updateUI();
                }
            });
        }

        if (contentTypeSelect) {
            contentTypeSelect.addEventListener('change', (e) => {
                this.contentType = e.target.value;
                
                // 字母模式下限制网格大小最多为5×5
                const gridSizeSelect = document.getElementById('schulte-grid-size');
                if (this.contentType === 'letter' && gridSizeSelect) {
                    // 保存当前选择的网格大小
                    const currentSize = parseInt(gridSizeSelect.value);
                    
                    // 清空并重新添加选项
                    gridSizeSelect.innerHTML = '';
                    for (let i = 3; i <= 5; i++) {
                        const option = document.createElement('option');
                        option.value = i;
                        option.textContent = `${i}×${i}`;
                        if (i === currentSize && currentSize <= 5) {
                            option.selected = true;
                        } else if (i === 5) {
                            option.selected = true;
                        }
                        gridSizeSelect.appendChild(option);
                    }
                    
                    // 更新网格大小
                    this.gridSize = Math.min(currentSize, 5);
                    this.totalItems = this.gridSize * this.gridSize;
                } else if (this.contentType === 'number' && gridSizeSelect) {
                    // 数字模式下恢复所有网格大小选项
                    gridSizeSelect.innerHTML = '';
                    for (let i = 3; i <= 10; i++) {
                        const option = document.createElement('option');
                        option.value = i;
                        option.textContent = `${i}×${i}`;
                        if (i === 5) {
                            option.selected = true;
                        }
                        gridSizeSelect.appendChild(option);
                    }
                    
                    // 更新网格大小
                    this.gridSize = 5;
                    this.totalItems = this.gridSize * this.gridSize;
                }
                
                if (!this.isRunning) {
                    this.updateGridSizeClass();
                    this.clearGrid();
                    this.updateUI();
                }
            });
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
        this.errorCount = 0;
        this.isRunning = true;
        this.startTime = Date.now();

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
     * 重置游戏
     */
    resetGame() {
        this.stopGame();
        this.currentItem = 1;
        this.errorCount = 0;
        this.updateUI();
        this.clearGrid();
        this.updateGridSizeClass();
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
     * 生成舒尔特表网格
     */
    generateGrid() {
        const grid = document.getElementById('schulte-grid');
        if (!grid) return;

        grid.innerHTML = '';

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
        
        if (this.contentType === 'number') {
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
            this.errorCount++;
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
                errorCount: this.errorCount,
                totalItems: this.totalItems,
                completed: true
            });
        }

        // 显示结果
        this.showResult(time);
    }

    /**
     * 显示游戏结果
     * @param {number} time - 用时（秒）
     */
    showResult(time) {
        const grid = document.getElementById('schulte-grid');
        if (!grid) return;

        const accuracy = this.calculateAccuracy();

        grid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px;">
                <h3 style="font-size: 32px; color: var(--primary-color); margin-bottom: 20px;">
                    🎉 恭喜完成！
                </h3>
                <p style="font-size: 24px; margin-bottom: 10px;">
                    用时：<span style="font-weight: 700; color: var(--primary-color);">${time.toFixed(2)}</span> 秒
                </p>
                <p style="font-size: 18px; margin-bottom: 10px;">
                    错误次数：<span style="font-weight: 700; color: var(--primary-color);">${this.errorCount}</span> 次
                </p>
                <p style="font-size: 18px; margin-bottom: 20px;">
                    准确率：<span style="font-weight: 700; color: var(--primary-color);">${accuracy.toFixed(1)}</span>%
                </p>
                <p style="font-size: 16px; color: var(--text-secondary);">
                    ${this.getPerformanceComment(time, this.errorCount)}
                </p>
            </div>
        `;

        // 保存记录
        if (typeof storageManager !== 'undefined') {
            const timeLimit = this.timeLimitMap[this.gridSize] || 0;
            storageManager.addRecord('schulte', {
                time: time,
                timeLimit: timeLimit,
                gridSize: this.gridSize,
                contentType: this.contentType,
                errorCount: this.errorCount,
                completedItems: this.totalItems,
                totalItems: this.totalItems,
                accuracy: accuracy,
                timeout: false,
                completed: true
            });
        }

        // 更新按钮状态
        const startBtn = document.querySelector('#schulte-game .start-game-btn');
        const resetBtn = document.querySelector('#schulte-game .reset-game-btn');
        
        if (startBtn) {
            startBtn.style.display = 'inline-block';
            startBtn.textContent = '再玩一次';
        }
        
        if (resetBtn) {
            resetBtn.style.display = 'none';
        }
    }

    /**
     * 计算准确率
     * @returns {number} 准确率（0-100）
     */
    calculateAccuracy() {
        const totalClicks = this.currentItem - 1 + this.errorCount;
        if (totalClicks === 0) return 100;
        return ((this.currentItem - 1) / totalClicks) * 100;
    }

    /**
     * 根据用时和错误数获取评价
     * @param {number} time - 用时（秒）
     * @param {number} errors - 错误次数
     * @returns {string} 评价文本
     */
    getPerformanceComment(time, errors) {
        const avgTimePerItem = time / this.totalItems;
        
        if (avgTimePerItem < 0.5 && errors === 0) {
            return '太棒了！你的专注力和反应速度非常出色！🌟';
        } else if (avgTimePerItem < 1 && errors < 3) {
            return '做得很好！继续保持这样的速度和准确性！💪';
        } else if (avgTimePerItem < 2 && errors < 5) {
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
    }

    /**
     * 显示超时结果
     */
    showTimeoutResult() {
        const grid = document.getElementById('schulte-grid');
        if (!grid) return;

        const completedItems = this.currentItem - 1;
        const accuracy = this.calculateAccuracy();
        const actualTime = (Date.now() - this.startTime) / 1000;
        const timeLimit = this.timeLimitMap[this.gridSize] || 0;

        grid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px;">
                <h3 style="font-size: 32px; color: var(--primary-color); margin-bottom: 20px;">
                    ❌ 挑战失败
                </h3>
                <p style="font-size: 24px; margin-bottom: 10px;">
                    用时：<span style="font-weight: 700; color: var(--primary-color);">${actualTime.toFixed(2)}</span> 秒
                </p>
                <p style="font-size: 18px; margin-bottom: 10px;">
                    限时：<span style="font-weight: 700; color: var(--primary-color);">${timeLimit}</span> 秒
                </p>
                <p style="font-size: 24px; margin-bottom: 10px;">
                    完成：<span style="font-weight: 700; color: var(--primary-color);">${completedItems}</span> / ${this.totalItems}
                </p>
                <p style="font-size: 18px; margin-bottom: 10px;">
                    错误次数：<span style="font-weight: 700; color: var(--primary-color);">${this.errorCount}</span> 次
                </p>
                <p style="font-size: 18px; margin-bottom: 20px;">
                    准确率：<span style="font-weight: 700; color: var(--primary-color);">${accuracy.toFixed(1)}</span>%
                </p>
                <p style="font-size: 16px; color: var(--text-secondary);">
                    ${this.getTimeoutComment(completedItems, this.totalItems)}
                </p>
            </div>
        `;

        // 保存记录
        if (typeof storageManager !== 'undefined') {
            storageManager.addRecord('schulte', {
                time: actualTime,
                timeLimit: timeLimit,
                gridSize: this.gridSize,
                contentType: this.contentType,
                errorCount: this.errorCount,
                completedItems: completedItems,
                totalItems: this.totalItems,
                accuracy: accuracy,
                timeout: true,
                completed: false
            });
        }

        // 更新按钮状态
        const startBtn = document.querySelector('#schulte-game .start-game-btn');
        const resetBtn = document.querySelector('#schulte-game .reset-game-btn');
        
        if (startBtn) {
            startBtn.style.display = 'inline-block';
            startBtn.textContent = '再玩一次';
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
        // 更新当前目标
        const currentDisplay = document.getElementById('schulte-current');
        if (currentDisplay) {
            if (this.contentType === 'number') {
                currentDisplay.textContent = this.currentItem;
            } else {
                // 显示字母
                const charCode = 65 + ((this.currentItem - 1) % 26);
                currentDisplay.textContent = String.fromCharCode(charCode);
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

        // 更新错误次数
        const errorsDisplay = document.getElementById('schulte-errors');
        if (errorsDisplay) {
            errorsDisplay.textContent = this.errorCount;
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
            grid.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; color: var(--text-secondary); padding: 40px;">选择网格大小和类型，点击"开始游戏"按钮开始训练</p>';
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
