/**
 * BrainGym 主应用文件
 * 负责模块切换、路由管理和应用初始化
 */

class BrainGymApp {
    constructor() {
        this.currentModule = 'home';
        this.modules = ['home', 'schulte', 'stroop', 'memory', 'auditory', 'stats'];
        this.init();
    }

    /**
     * 初始化应用
     */
    init() {
        this.bindNavigation();
        this.bindModuleCards();
        this.initStorage();
        this.loadInitialModule();
    }

    /**
     * 初始化存储系统
     */
    initStorage() {
        if (typeof StorageManager !== 'undefined') {
            StorageManager.init();
        }
    }

    /**
     * 加载初始模块
     */
    loadInitialModule() {
        const hash = window.location.hash.slice(1);
        if (hash && this.modules.includes(hash)) {
            this.switchModule(hash);
        } else {
            this.switchModule('home');
        }
    }

    /**
     * 绑定导航栏事件
     */
    bindNavigation() {
        const navButtons = document.querySelectorAll('.nav-btn');
        navButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const moduleName = e.target.dataset.module;
                if (moduleName) {
                    this.switchModule(moduleName);
                }
            });
        });

        // 监听浏览器后退/前进按钮
        window.addEventListener('popstate', (e) => {
            const moduleName = e.state?.module || 'home';
            this.switchModule(moduleName, false);
        });
    }

    /**
     * 绑定首页模块卡片点击事件
     */
    bindModuleCards() {
        const moduleCards = document.querySelectorAll('.module-card');
        moduleCards.forEach(card => {
            card.addEventListener('click', (e) => {
                const moduleName = card.dataset.module;
                if (moduleName) {
                    this.switchModule(moduleName);
                }
            });

            const startBtn = card.querySelector('.start-btn');
            if (startBtn) {
                startBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const moduleName = card.dataset.module;
                    if (moduleName) {
                        this.switchModule(moduleName);
                    }
                });
            }
        });
    }

    /**
     * 切换模块
     * @param {string} moduleName - 模块名称
     * @param {boolean} updateHistory - 是否更新浏览器历史
     */
    switchModule(moduleName, updateHistory = true) {
        if (!this.modules.includes(moduleName)) {
            console.error(`Unknown module: ${moduleName}`);
            return;
        }

        // 停止当前模块的游戏（如果有）
        this.stopCurrentModule();

        // 更新当前模块
        this.currentModule = moduleName;

        // 更新导航栏状态
        this.updateNavigationState();

        // 更新模块显示
        this.updateModuleDisplay();

        // 更新浏览器历史
        if (updateHistory) {
            history.pushState({ module: moduleName }, '', `#${moduleName}`);
        }

        // 初始化新模块
        this.initModule(moduleName);
    }

    /**
     * 停止当前模块的游戏
     */
    stopCurrentModule() {
        // 停止舒尔特表游戏
        if (typeof schulteGame !== 'undefined' && schulteGame.isRunning) {
            schulteGame.stopGame();
        }

        // 停止Stroop游戏
        if (typeof StroopGame !== 'undefined' && StroopGame.isRunning) {
            StroopGame.stop();
        }

        // 停止序列记忆游戏
        if (typeof memoryTrainer !== 'undefined' && memoryTrainer.isRunning) {
            memoryTrainer.stopTraining();
        }

        // 停止听觉注意游戏
        if (typeof AuditoryGame !== 'undefined' && AuditoryGame.isRunning) {
            AuditoryGame.stop();
        }
    }

    /**
     * 更新导航栏状态
     */
    updateNavigationState() {
        const navButtons = document.querySelectorAll('.nav-btn');
        navButtons.forEach(btn => {
            if (btn.dataset.module === this.currentModule) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    /**
     * 更新模块显示
     */
    updateModuleDisplay() {
        const modules = document.querySelectorAll('.module');
        modules.forEach(module => {
            if (module.id === this.currentModule) {
                module.classList.add('active');
            } else {
                module.classList.remove('active');
            }
        });
    }

    /**
     * 初始化模块
     * @param {string} moduleName - 模块名称
     */
    initModule(moduleName) {
        switch (moduleName) {
            case 'home':
                this.initHomeModule();
                break;
            case 'schulte':
                this.initSchulteModule();
                break;
            case 'stroop':
                this.initStroopModule();
                break;
            case 'memory':
                this.initMemoryModule();
                break;
            case 'auditory':
                this.initAuditoryModule();
                break;
            case 'stats':
                this.initStatsModule();
                break;
        }
    }

    /**
     * 初始化首页模块
     */
    initHomeModule() {
        // 首页不需要特殊初始化
    }

    /**
     * 初始化舒尔特表模块
     */
    initSchulteModule() {
        if (typeof schulteGame !== 'undefined') {
            schulteGame.init();
        }
    }

    /**
     * 初始化Stroop效应模块
     */
    initStroopModule() {
        if (typeof StroopGame !== 'undefined') {
            StroopGame.init();
        }
    }

    /**
     * 初始化序列记忆模块
     */
    initMemoryModule() {
        if (typeof memoryTrainer !== 'undefined') {
            memoryTrainer.init();
        }
    }

    /**
     * 初始化听觉注意模块
     */
    initAuditoryModule() {
        if (typeof AuditoryGame !== 'undefined') {
            AuditoryGame.init();
        }
    }

    /**
     * 初始化统计数据模块
     */
    initStatsModule() {
        if (typeof StatsManager !== 'undefined') {
            StatsManager.init();
            StatsManager.displayStats('schulte');
        }

        // 绑定统计标签切换事件
        this.bindStatsTabs();
    }

    /**
     * 绑定统计标签切换事件
     */
    bindStatsTabs() {
        const statsTabs = document.querySelectorAll('.stats-tab');
        statsTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                
                // 更新标签状态
                statsTabs.forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');

                // 显示对应模块的统计数据
                if (typeof StatsManager !== 'undefined') {
                    StatsManager.displayStats(tabName);
                }
            });
        });
    }

    /**
     * 获取当前模块名称
     * @returns {string} 当前模块名称
     */
    getCurrentModule() {
        return this.currentModule;
    }

    /**
     * 检查指定模块是否为当前模块
     * @param {string} moduleName - 模块名称
     * @returns {boolean} 是否为当前模块
     */
    isCurrentModule(moduleName) {
        return this.currentModule === moduleName;
    }
}

// 等待DOM加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
    window.brainGymApp = new BrainGymApp();
});

// 导出应用实例供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BrainGymApp;
}
