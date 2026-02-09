/**
 * StorageManager - localStorage数据管理工具
 * 负责所有训练数据的存储、加载和管理
 */

class StorageManager {
    constructor() {
        this.storageKey = 'brainGymData';
        this.data = null;
        this.isInitialized = false;
    }

    /**
     * 初始化存储系统
     * 检查localStorage中是否存在数据，如果不存在则创建初始数据结构
     */
    init() {
        try {
            const storedData = localStorage.getItem(this.storageKey);
            
            if (storedData) {
                this.data = JSON.parse(storedData);
            } else {
                this.data = this.createInitialData();
                this.save();
            }
            
            this.isInitialized = true;
            console.log('StorageManager initialized successfully');
        } catch (error) {
            console.error('Failed to initialize StorageManager:', error);
            this.data = this.createInitialData();
        }
    }

    /**
     * 创建初始数据结构
     * @returns {Object} 初始数据对象
     */
    createInitialData() {
        return {
            version: '1.0.0',
            lastUpdated: new Date().toISOString(),
            settings: {
                soundEnabled: true,
                difficulty: 'normal'
            },
            schulte: {
                records: [],
                bestTime: null,
                averageTime: null,
                totalGames: 0
            },
            stroop: {
                records: [],
                bestScore: null,
                averageScore: null,
                totalGames: 0
            },
            memory: {
                records: [],
                bestLevel: null,
                averageLevel: null,
                totalGames: 0
            },
            auditory: {
                records: [],
                bestLevel: null,
                averageAccuracy: null,
                totalGames: 0
            }
        };
    }

    /**
     * 保存数据到localStorage
     * @returns {boolean} 保存是否成功
     */
    save() {
        try {
            this.data.lastUpdated = new Date().toISOString();
            const jsonString = JSON.stringify(this.data);
            localStorage.setItem(this.storageKey, jsonString);
            return true;
        } catch (error) {
            console.error('Failed to save data:', error);
            return false;
        }
    }

    /**
     * 从localStorage加载数据
     * @returns {Object|null} 数据对象，加载失败返回null
     */
    load() {
        try {
            const storedData = localStorage.getItem(this.storageKey);
            if (storedData) {
                this.data = JSON.parse(storedData);
                return this.data;
            }
            return null;
        } catch (error) {
            console.error('Failed to load data:', error);
            return null;
        }
    }

    /**
     * 添加训练记录
     * @param {string} module - 模块名称 ('schulte', 'stroop', 'memory', 'auditory')
     * @param {Object} record - 训练记录对象
     * @returns {boolean} 添加是否成功
     */
    addRecord(module, record) {
        try {
            if (!this.data[module]) {
                console.error(`Module ${module} does not exist`);
                return false;
            }

            // 添加时间戳
            record.timestamp = new Date().toISOString();
            record.id = this.generateId();

            // 添加记录
            this.data[module].records.push(record);

            // 更新统计数据
            this.updateModuleStats(module);

            // 保存数据
            this.save();

            return true;
        } catch (error) {
            console.error('Failed to add record:', error);
            return false;
        }
    }

    /**
     * 获取指定模块的所有记录
     * @param {string} module - 模块名称
     * @param {number} limit - 返回记录数量限制（可选）
     * @returns {Array} 记录数组
     */
    getRecords(module, limit = null) {
        if (!this.data[module]) {
            return [];
        }

        let records = [...this.data[module].records];

        // 按时间倒序排列
        records.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        // 应用数量限制
        if (limit && limit > 0) {
            records = records.slice(0, limit);
        }

        return records;
    }

    /**
     * 获取指定模块的统计数据
     * @param {string} module - 模块名称
     * @returns {Object} 统计数据对象
     */
    getStats(module) {
        if (!this.data[module]) {
            return null;
        }

        return {
            bestTime: this.data[module].bestTime,
            averageTime: this.data[module].averageTime,
            bestScore: this.data[module].bestScore,
            averageScore: this.data[module].averageScore,
            bestLevel: this.data[module].bestLevel,
            averageLevel: this.data[module].averageLevel,
            averageAccuracy: this.data[module].averageAccuracy,
            totalGames: this.data[module].totalGames
        };
    }

    /**
     * 更新指定模块的统计数据
     * @param {string} module - 模块名称
     */
    updateModuleStats(module) {
        const records = this.data[module].records;
        
        if (records.length === 0) {
            return;
        }

        this.data[module].totalGames = records.length;

        // 根据模块类型更新不同的统计指标
        switch (module) {
            case 'schulte':
                this.updateSchulteStats(records);
                break;
            case 'stroop':
                this.updateStroopStats(records);
                break;
            case 'memory':
                this.updateMemoryStats(records);
                break;
            case 'auditory':
                this.updateAuditoryStats(records);
                break;
        }
    }

    /**
     * 更新舒尔特表统计数据
     * @param {Array} records - 记录数组
     */
    updateSchulteStats(records) {
        const times = records.map(r => r.time);
        
        this.data.schulte.bestTime = Math.min(...times);
        this.data.schulte.averageTime = times.reduce((sum, t) => sum + t, 0) / times.length;
    }

    /**
     * 更新Stroop效应统计数据
     * @param {Array} records - 记录数组
     */
    updateStroopStats(records) {
        const scores = records.map(r => r.score);
        
        this.data.stroop.bestScore = Math.max(...scores);
        this.data.stroop.averageScore = scores.reduce((sum, s) => sum + s, 0) / scores.length;
    }

    /**
     * 更新序列记忆统计数据
     * @param {Array} records - 记录数组
     */
    updateMemoryStats(records) {
        const levels = records.map(r => r.level);
        
        this.data.memory.bestLevel = Math.max(...levels);
        this.data.memory.averageLevel = levels.reduce((sum, l) => sum + l, 0) / levels.length;
    }

    /**
     * 更新听觉注意统计数据
     * @param {Array} records - 记录数组
     */
    updateAuditoryStats(records) {
        const accuracies = records.map(r => r.accuracy);
        
        this.data.auditory.bestLevel = Math.max(...records.map(r => r.level));
        this.data.auditory.averageAccuracy = accuracies.reduce((sum, a) => sum + a, 0) / accuracies.length;
    }

    /**
     * 清除指定模块的所有记录
     * @param {string} module - 模块名称
     * @returns {boolean} 清除是否成功
     */
    clearRecords(module) {
        try {
            if (!this.data[module]) {
                return false;
            }

            this.data[module].records = [];
            this.data[module].bestTime = null;
            this.data[module].averageTime = null;
            this.data[module].bestScore = null;
            this.data[module].averageScore = null;
            this.data[module].bestLevel = null;
            this.data[module].averageLevel = null;
            this.data[module].averageAccuracy = null;
            this.data[module].totalGames = 0;

            this.save();
            return true;
        } catch (error) {
            console.error('Failed to clear records:', error);
            return false;
        }
    }

    /**
     * 清除所有数据
     * @returns {boolean} 清除是否成功
     */
    clearAll() {
        try {
            localStorage.removeItem(this.storageKey);
            this.data = this.createInitialData();
            this.save();
            return true;
        } catch (error) {
            console.error('Failed to clear all data:', error);
            return false;
        }
    }

    /**
     * 导出数据为JSON字符串
     * @returns {string} JSON字符串
     */
    exportData() {
        try {
            return JSON.stringify(this.data, null, 2);
        } catch (error) {
            console.error('Failed to export data:', error);
            return null;
        }
    }

    /**
     * 导入数据
     * @param {string} jsonString - JSON字符串
     * @returns {boolean} 导入是否成功
     */
    importData(jsonString) {
        try {
            const importedData = JSON.parse(jsonString);
            
            // 验证数据结构
            if (!this.validateDataStructure(importedData)) {
                console.error('Invalid data structure');
                return false;
            }

            this.data = importedData;
            this.save();
            return true;
        } catch (error) {
            console.error('Failed to import data:', error);
            return false;
        }
    }

    /**
     * 验证数据结构
     * @param {Object} data - 数据对象
     * @returns {boolean} 数据结构是否有效
     */
    validateDataStructure(data) {
        const requiredModules = ['schulte', 'stroop', 'memory', 'auditory'];
        
        for (const module of requiredModules) {
            if (!data[module] || !Array.isArray(data[module].records)) {
                return false;
            }
        }

        return true;
    }

    /**
     * 获取设置
     * @returns {Object} 设置对象
     */
    getSettings() {
        return this.data.settings;
    }

    /**
     * 更新设置
     * @param {Object} settings - 设置对象
     * @returns {boolean} 更新是否成功
     */
    updateSettings(settings) {
        try {
            this.data.settings = { ...this.data.settings, ...settings };
            this.save();
            return true;
        } catch (error) {
            console.error('Failed to update settings:', error);
            return false;
        }
    }

    /**
     * 生成唯一ID
     * @returns {string} 唯一ID
     */
    generateId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * 获取数据大小（字节）
     * @returns {number} 数据大小
     */
    getDataSize() {
        try {
            const jsonString = JSON.stringify(this.data);
            return new Blob([jsonString]).size;
        } catch (error) {
            console.error('Failed to calculate data size:', error);
            return 0;
        }
    }

    /**
     * 检查存储空间是否足够
     * @param {number} requiredSize - 需要的空间大小（字节）
     * @returns {boolean} 是否有足够空间
     */
    hasEnoughSpace(requiredSize) {
        try {
            const testKey = 'storage-test';
            const testData = 'x'.repeat(requiredSize);
            
            localStorage.setItem(testKey, testData);
            localStorage.removeItem(testKey);
            
            return true;
        } catch (error) {
            console.error('Not enough storage space:', error);
            return false;
        }
    }
}

// 创建全局实例
const storageManager = new StorageManager();

// 导出供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StorageManager;
}
