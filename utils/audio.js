/**
 * AudioManager - 音频管理工具
 * 使用Howler.js处理所有音效和背景音乐
 */

class AudioManager {
    constructor() {
        this.sounds = {};
        this.isMuted = false;
        this.volume = 0.7;
        this.isInitialized = false;
    }

    /**
     * 初始化音频管理器
     */
    init() {
        if (this.isInitialized) {
            return;
        }

        // 检查Howler.js是否可用
        if (typeof Howl === 'undefined') {
            console.warn('Howler.js is not loaded. Audio features will be disabled.');
            return;
        }

        // 加载设置
        this.loadSettings();

        // 预加载音效
        this.preloadSounds();

        this.isInitialized = true;
        console.log('AudioManager initialized');
    }

    /**
     * 加载音频设置
     */
    loadSettings() {
        const settings = storageManager.getSettings();
        if (settings) {
            this.isMuted = !settings.soundEnabled;
            this.volume = settings.volume || 0.7;
        }
    }

    /**
     * 预加载音效
     */
    preloadSounds() {
        // 点击音效
        this.sounds.click = new Howl({
            src: ['assets/sounds/click.mp3'],
            volume: this.volume
        });

        // 正确音效
        this.sounds.correct = new Howl({
            src: ['assets/sounds/correct.mp3'],
            volume: this.volume
        });

        // 错误音效
        this.sounds.wrong = new Howl({
            src: ['assets/sounds/wrong.mp3'],
            volume: this.volume
        });

        // 成功音效
        this.sounds.success = new Howl({
            src: ['assets/sounds/success.mp3'],
            volume: this.volume
        });

        // 游戏结束音效
        this.sounds.gameOver = new Howl({
            src: ['assets/sounds/gameover.mp3'],
            volume: this.volume
        });

        // 数字音效（用于序列记忆）
        this.sounds.digits = {};
        for (let i = 0; i <= 9; i++) {
            this.sounds.digits[i] = new Howl({
                src: [`assets/sounds/digit${i}.mp3`],
                volume: this.volume
            });
        }

        // 听觉注意训练音效
        this.sounds.auditory = {
            high: new Howl({
                src: ['assets/sounds/high.mp3'],
                volume: this.volume
            }),
            low: new Howl({
                src: ['assets/sounds/low.mp3'],
                volume: this.volume
            }),
            short: new Howl({
                src: ['assets/sounds/short.mp3'],
                volume: this.volume
            }),
            long: new Howl({
                src: ['assets/sounds/long.mp3'],
                volume: this.volume
            })
        };
    }

    /**
     * 播放点击音效
     */
    playClick() {
        if (this.isMuted || !this.sounds.click) return;
        this.sounds.click.play();
    }

    /**
     * 播放正确音效
     */
    playCorrect() {
        if (this.isMuted || !this.sounds.correct) return;
        this.sounds.correct.play();
    }

    /**
     * 播放错误音效
     */
    playWrong() {
        if (this.isMuted || !this.sounds.wrong) return;
        this.sounds.wrong.play();
    }

    /**
     * 播放成功音效
     */
    playSuccess() {
        if (this.isMuted || !this.sounds.success) return;
        this.sounds.success.play();
    }

    /**
     * 播放游戏结束音效
     */
    playGameOver() {
        if (this.isMuted || !this.sounds.gameOver) return;
        this.sounds.gameOver.play();
    }

    /**
     * 播放数字音效
     * @param {number} digit - 数字（0-9）
     */
    playDigit(digit) {
        if (this.isMuted || !this.sounds.digits || !this.sounds.digits[digit]) return;
        this.sounds.digits[digit].play();
    }

    /**
     * 播放数字序列
     * @param {Array} digits - 数字数组
     * @param {number} interval - 播放间隔（毫秒）
     * @param {Function} callback - 播放完成回调
     */
    playDigitSequence(digits, interval = 800, callback) {
        if (!Array.isArray(digits) || digits.length === 0) {
            if (callback) callback();
            return;
        }

        let index = 0;
        
        const playNext = () => {
            if (index < digits.length) {
                this.playDigit(digits[index]);
                index++;
                setTimeout(playNext, interval);
            } else {
                if (callback) callback();
            }
        };

        playNext();
    }

    /**
     * 播放听觉注意音效
     * @param {string} type - 音效类型 ('high', 'low', 'short', 'long')
     */
    playAuditorySound(type) {
        if (this.isMuted || !this.sounds.auditory || !this.sounds.auditory[type]) return;
        this.sounds.auditory[type].play();
    }

    /**
     * 播放听觉注意音效序列
     * @param {Array} sounds - 音效类型数组
     * @param {number} interval - 播放间隔（毫秒）
     * @param {Function} callback - 播放完成回调
     */
    playAuditorySequence(sounds, interval = 1000, callback) {
        if (!Array.isArray(sounds) || sounds.length === 0) {
            if (callback) callback();
            return;
        }

        let index = 0;
        
        const playNext = () => {
            if (index < sounds.length) {
                this.playAuditorySound(sounds[index]);
                index++;
                setTimeout(playNext, interval);
            } else {
                if (callback) callback();
            }
        };

        playNext();
    }

    /**
     * 设置音量
     * @param {number} volume - 音量值（0-1）
     */
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        
        // 更新所有音效的音量
        Object.values(this.sounds).forEach(sound => {
            if (sound instanceof Howl) {
                sound.volume(this.volume);
            } else if (typeof sound === 'object') {
                Object.values(sound).forEach(s => {
                    if (s instanceof Howl) {
                        s.volume(this.volume);
                    }
                });
            }
        });

        // 保存设置
        storageManager.updateSettings({ volume: this.volume });
    }

    /**
     * 静音/取消静音
     */
    toggleMute() {
        this.isMuted = !this.isMuted;
        storageManager.updateSettings({ soundEnabled: !this.isMuted });
        return this.isMuted;
    }

    /**
     * 停止所有音效
     */
    stopAll() {
        Object.values(this.sounds).forEach(sound => {
            if (sound instanceof Howl) {
                sound.stop();
            } else if (typeof sound === 'object') {
                Object.values(sound).forEach(s => {
                    if (s instanceof Howl) {
                        s.stop();
                    }
                });
            }
        });
    }

    /**
     * 检查音频是否已初始化
     * @returns {boolean} 是否已初始化
     */
    isReady() {
        return this.isInitialized;
    }
}

// 创建全局实例
const audioManager = new AudioManager();

// 导出供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AudioManager;
}
