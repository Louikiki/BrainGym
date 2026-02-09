/**
 * StatsManager - 统计计算工具
 * 负责计算和显示各种统计数据
 */

class StatsManager {
    constructor() {
        this.currentModule = 'schulte';
        this.chart = null;
        this.isInitialized = false;
    }

    /**
     * 初始化统计管理器
     */
    init() {
        if (this.isInitialized) {
            return;
        }
        
        this.isInitialized = true;
        console.log('StatsManager initialized');
    }

    /**
     * 显示指定模块的统计数据
     * @param {string} module - 模块名称
     */
    displayStats(module) {
        this.currentModule = module;
        
        // 获取统计数据
        const stats = storageManager.getStats(module);
        const records = storageManager.getRecords(module, 20);
        
        // 显示摘要信息
        this.displaySummary(module, stats);
        
        // 显示历史记录
        this.displayHistory(records);
        
        // 显示图表
        this.displayChart(module, records);
    }

    /**
     * 显示统计摘要
     * @param {string} module - 模块名称
     * @param {Object} stats - 统计数据
     */
    displaySummary(module, stats) {
        const summaryContainer = document.getElementById('stats-summary');
        
        if (!summaryContainer || !stats) {
            return;
        }

        let summaryHTML = '';

        switch (module) {
            case 'schulte':
                summaryHTML = `
                    <div class="summary-card">
                        <div class="label">最佳成绩</div>
                        <div class="value">${stats.bestTime ? stats.bestTime.toFixed(2) + 's' : '-'}</div>
                    </div>
                    <div class="summary-card">
                        <div class="label">平均用时</div>
                        <div class="value">${stats.averageTime ? stats.averageTime.toFixed(2) + 's' : '-'}</div>
                    </div>
                    <div class="summary-card">
                        <div class="label">总游戏次数</div>
                        <div class="value">${stats.totalGames}</div>
                    </div>
                `;
                break;
                
            case 'stroop':
                summaryHTML = `
                    <div class="summary-card">
                        <div class="label">最高得分</div>
                        <div class="value">${stats.bestScore || '-'}</div>
                    </div>
                    <div class="summary-card">
                        <div class="label">平均得分</div>
                        <div class="value">${stats.averageScore ? stats.averageScore.toFixed(1) : '-'}</div>
                    </div>
                    <div class="summary-card">
                        <div class="label">总游戏次数</div>
                        <div class="value">${stats.totalGames}</div>
                    </div>
                `;
                break;
                
            case 'memory':
                summaryHTML = `
                    <div class="summary-card">
                        <div class="label">最高关卡</div>
                        <div class="value">${stats.bestLevel || '-'}</div>
                    </div>
                    <div class="summary-card">
                        <div class="label">平均关卡</div>
                        <div class="value">${stats.averageLevel ? stats.averageLevel.toFixed(1) : '-'}</div>
                    </div>
                    <div class="summary-card">
                        <div class="label">总游戏次数</div>
                        <div class="value">${stats.totalGames}</div>
                    </div>
                `;
                break;
                
            case 'auditory':
                summaryHTML = `
                    <div class="summary-card">
                        <div class="label">最高关卡</div>
                        <div class="value">${stats.bestLevel || '-'}</div>
                    </div>
                    <div class="summary-card">
                        <div class="label">平均正确率</div>
                        <div class="value">${stats.averageAccuracy ? (stats.averageAccuracy * 100).toFixed(1) + '%' : '-'}</div>
                    </div>
                    <div class="summary-card">
                        <div class="label">总游戏次数</div>
                        <div class="value">${stats.totalGames}</div>
                    </div>
                `;
                break;
        }

        summaryContainer.innerHTML = summaryHTML;
    }

    /**
     * 显示历史记录列表
     * @param {Array} records - 记录数组
     */
    displayHistory(records) {
        const historyList = document.getElementById('history-list');
        
        if (!historyList) {
            return;
        }

        if (records.length === 0) {
            historyList.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">暂无记录</p>';
            return;
        }

        let historyHTML = '';
        
        records.forEach(record => {
            const date = new Date(record.timestamp);
            const dateStr = date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
            const timeStr = date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
            
            let scoreValue = '';
            
            switch (this.currentModule) {
                case 'schulte':
                    scoreValue = record.time.toFixed(2) + 's';
                    break;
                case 'stroop':
                    scoreValue = record.score + '分';
                    break;
                case 'memory':
                    scoreValue = '关卡 ' + record.level;
                    break;
                case 'auditory':
                    scoreValue = '关卡 ' + record.level + ' (' + (record.accuracy * 100).toFixed(0) + '%)';
                    break;
            }

            historyHTML += `
                <div class="history-item">
                    <span class="date">${dateStr} ${timeStr}</span>
                    <span class="score">${scoreValue}</span>
                </div>
            `;
        });

        historyList.innerHTML = historyHTML;
    }

    /**
     * 显示性能图表
     * @param {string} module - 模块名称
     * @param {Array} records - 记录数组
     */
    displayChart(module, records) {
        const canvas = document.getElementById('performance-chart');
        
        if (!canvas || typeof Chart === 'undefined') {
            return;
        }

        // 销毁现有图表
        if (this.chart) {
            this.chart.destroy();
        }

        if (records.length === 0) {
            return;
        }

        // 准备图表数据
        const labels = [];
        const data = [];
        
        // 只显示最近20条记录，并按时间正序排列
        const recentRecords = [...records].reverse().slice(-20);
        
        recentRecords.forEach((record, index) => {
            labels.push(`第${index + 1}次`);
            
            switch (module) {
                case 'schulte':
                    data.push(record.time);
                    break;
                case 'stroop':
                    data.push(record.score);
                    break;
                case 'memory':
                    data.push(record.level);
                    break;
                case 'auditory':
                    data.push(record.accuracy * 100);
                    break;
            }
        });

        // 确定图表类型和标签
        let chartType = 'line';
        let label = '';
        let yAxisLabel = '';
        
        switch (module) {
            case 'schulte':
                chartType = 'line';
                label = '用时 (秒)';
                yAxisLabel = '时间 (秒)';
                break;
            case 'stroop':
                chartType = 'bar';
                label = '得分';
                yAxisLabel = '得分';
                break;
            case 'memory':
                chartType = 'line';
                label = '关卡';
                yAxisLabel = '关卡';
                break;
            case 'auditory':
                chartType = 'line';
                label = '正确率 (%)';
                yAxisLabel = '正确率 (%)';
                break;
        }

        // 创建图表
        const ctx = canvas.getContext('2d');
        
        this.chart = new Chart(ctx, {
            type: chartType,
            data: {
                labels: labels,
                datasets: [{
                    label: label,
                    data: data,
                    borderColor: 'rgba(255, 107, 107, 1)',
                    backgroundColor: 'rgba(255, 107, 107, 0.2)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: yAxisLabel
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: '游戏次数'
                        }
                    }
                }
            }
        });
    }

    /**
     * 计算平均值
     * @param {Array} values - 数值数组
     * @returns {number} 平均值
     */
    calculateAverage(values) {
        if (values.length === 0) {
            return 0;
        }
        return values.reduce((sum, val) => sum + val, 0) / values.length;
    }

    /**
     * 计算标准差
     * @param {Array} values - 数值数组
     * @returns {number} 标准差
     */
    calculateStandardDeviation(values) {
        if (values.length === 0) {
            return 0;
        }
        
        const avg = this.calculateAverage(values);
        const squareDiffs = values.map(value => Math.pow(value - avg, 2));
        const avgSquareDiff = this.calculateAverage(squareDiffs);
        
        return Math.sqrt(avgSquareDiff);
    }

    /**
     * 计算中位数
     * @param {Array} values - 数值数组
     * @returns {number} 中位数
     */
    calculateMedian(values) {
        if (values.length === 0) {
            return 0;
        }
        
        const sorted = [...values].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        
        if (sorted.length % 2 === 0) {
            return (sorted[mid - 1] + sorted[mid]) / 2;
        } else {
            return sorted[mid];
        }
    }

    /**
     * 计算趋势（上升、下降、稳定）
     * @param {Array} values - 数值数组
     * @returns {string} 趋势
     */
    calculateTrend(values) {
        if (values.length < 2) {
            return 'stable';
        }

        const firstHalf = values.slice(0, Math.floor(values.length / 2));
        const secondHalf = values.slice(Math.floor(values.length / 2));
        
        const firstAvg = this.calculateAverage(firstHalf);
        const secondAvg = this.calculateAverage(secondHalf);
        
        const threshold = 0.05; // 5%的变化阈值
        
        if (secondAvg > firstAvg * (1 + threshold)) {
            return 'up';
        } else if (secondAvg < firstAvg * (1 - threshold)) {
            return 'down';
        } else {
            return 'stable';
        }
    }
}

// 创建全局实例
const statsManager = new StatsManager();

// 导出供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StatsManager;
}
