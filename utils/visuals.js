/**
 * VisualsManager - 视觉动画工具
 * 负责处理各种视觉效果和动画
 */

class VisualsManager {
    constructor() {
        this.animations = [];
        this.isInitialized = false;
    }

    /**
     * 初始化视觉管理器
     */
    init() {
        if (this.isInitialized) {
            return;
        }

        this.isInitialized = true;
        console.log('VisualsManager initialized');
    }

    /**
     * 添加淡入动画
     * @param {HTMLElement} element - 目标元素
     * @param {number} duration - 动画持续时间（毫秒）
     * @param {Function} callback - 动画完成回调
     */
    fadeIn(element, duration = 300, callback) {
        if (!element) return;

        element.style.opacity = '0';
        element.style.transition = `opacity ${duration}ms ease`;
        
        // 强制重绘
        element.offsetHeight;
        
        element.style.opacity = '1';
        
        setTimeout(() => {
            if (callback) callback();
        }, duration);
    }

    /**
     * 添加淡出动画
     * @param {HTMLElement} element - 目标元素
     * @param {number} duration - 动画持续时间（毫秒）
     * @param {Function} callback - 动画完成回调
     */
    fadeOut(element, duration = 300, callback) {
        if (!element) return;

        element.style.opacity = '1';
        element.style.transition = `opacity ${duration}ms ease`;
        
        // 强制重绘
        element.offsetHeight;
        
        element.style.opacity = '0';
        
        setTimeout(() => {
            if (callback) callback();
        }, duration);
    }

    /**
     * 添加缩放动画
     * @param {HTMLElement} element - 目标元素
     * @param {number} scale - 缩放比例
     * @param {number} duration - 动画持续时间（毫秒）
     * @param {Function} callback - 动画完成回调
     */
    scale(element, scale = 1.1, duration = 200, callback) {
        if (!element) return;

        element.style.transition = `transform ${duration}ms ease`;
        element.style.transform = `scale(${scale})`;
        
        setTimeout(() => {
            element.style.transform = 'scale(1)';
            if (callback) callback();
        }, duration);
    }

    /**
     * 添加脉冲动画
     * @param {HTMLElement} element - 目标元素
     * @param {number} count - 脉冲次数
     * @param {number} duration - 每次脉冲持续时间（毫秒）
     */
    pulse(element, count = 1, duration = 300) {
        if (!element) return;

        let currentCount = 0;
        
        const pulseOnce = () => {
            if (currentCount >= count) return;
            
            element.style.transition = `transform ${duration / 2}ms ease`;
            element.style.transform = 'scale(1.15)';
            
            setTimeout(() => {
                element.style.transform = 'scale(1)';
                currentCount++;
                
                if (currentCount < count) {
                    setTimeout(pulseOnce, duration / 2);
                }
            }, duration / 2);
        };

        pulseOnce();
    }

    /**
     * 添加抖动动画
     * @param {HTMLElement} element - 目标元素
     * @param {number} duration - 动画持续时间（毫秒）
     */
    shake(element, duration = 300) {
        if (!element) return;

        const keyframes = [
            { transform: 'translateX(0)' },
            { transform: 'translateX(-10px)' },
            { transform: 'translateX(10px)' },
            { transform: 'translateX(-10px)' },
            { transform: 'translateX(10px)' },
            { transform: 'translateX(0)' }
        ];

        const animation = element.animate(keyframes, {
            duration: duration,
            easing: 'ease-in-out'
        });

        return animation;
    }

    /**
     * 添加旋转动画
     * @param {HTMLElement} element - 目标元素
     * @param {number} degrees - 旋转角度
     * @param {number} duration - 动画持续时间（毫秒）
     */
    rotate(element, degrees = 360, duration = 500) {
        if (!element) return;

        element.style.transition = `transform ${duration}ms ease`;
        element.style.transform = `rotate(${degrees}deg)`;
        
        setTimeout(() => {
            element.style.transform = 'rotate(0deg)';
        }, duration);
    }

    /**
     * 添加滑动动画
     * @param {HTMLElement} element - 目标元素
     * @param {string} direction - 滑动方向 ('up', 'down', 'left', 'right')
     * @param {number} distance - 滑动距离（像素）
     * @param {number} duration - 动画持续时间（毫秒）
     */
    slide(element, direction = 'up', distance = 20, duration = 300) {
        if (!element) return;

        const transforms = {
            up: `translateY(-${distance}px)`,
            down: `translateY(${distance}px)`,
            left: `translateX(-${distance}px)`,
            right: `translateX(${distance}px)`
        };

        element.style.transition = `transform ${duration}ms ease`;
        element.style.transform = transforms[direction] || transforms.up;
        
        setTimeout(() => {
            element.style.transform = 'translate(0)';
        }, duration);
    }

    /**
     * 添加弹跳动画
     * @param {HTMLElement} element - 目标元素
     * @param {number} duration - 动画持续时间（毫秒）
     */
    bounce(element, duration = 500) {
        if (!element) return;

        const keyframes = [
            { transform: 'translateY(0)', easing: 'ease-out' },
            { transform: 'translateY(-20px)', easing: 'ease-in' },
            { transform: 'translateY(0)', easing: 'ease-out' }
        ];

        const animation = element.animate(keyframes, {
            duration: duration,
            iterations: 1
        });

        return animation;
    }

    /**
     * 添加闪烁动画
     * @param {HTMLElement} element - 目标元素
     * @param {number} count - 闪烁次数
     * @param {number} duration - 每次闪烁持续时间（毫秒）
     */
    blink(element, count = 3, duration = 200) {
        if (!element) return;

        let currentCount = 0;
        
        const blinkOnce = () => {
            if (currentCount >= count) {
                element.style.opacity = '1';
                return;
            }
            
            element.style.transition = `opacity ${duration / 2}ms ease`;
            element.style.opacity = '0.3';
            
            setTimeout(() => {
                element.style.opacity = '1';
                currentCount++;
                
                if (currentCount < count) {
                    setTimeout(blinkOnce, duration / 2);
                }
            }, duration / 2);
        };

        blinkOnce();
    }

    /**
     * 添加高亮效果
     * @param {HTMLElement} element - 目标元素
     * @param {string} color - 高亮颜色
     * @param {number} duration - 动画持续时间（毫秒）
     */
    highlight(element, color = '#FFE66D', duration = 500) {
        if (!element) return;

        const originalBg = element.style.backgroundColor;
        
        element.style.transition = `background-color ${duration}ms ease`;
        element.style.backgroundColor = color;
        
        setTimeout(() => {
            element.style.backgroundColor = originalBg;
        }, duration);
    }

    /**
     * 添加进度条动画
     * @param {HTMLElement} element - 进度条元素
     * @param {number} progress - 进度值（0-100）
     * @param {number} duration - 动画持续时间（毫秒）
     */
    animateProgress(element, progress, duration = 500) {
        if (!element) return;

        const currentWidth = parseFloat(element.style.width) || 0;
        const targetWidth = Math.max(0, Math.min(100, progress));
        
        element.style.transition = `width ${duration}ms ease`;
        element.style.width = `${targetWidth}%`;
    }

    /**
     * 添加数字计数动画
     * @param {HTMLElement} element - 目标元素
     * @param {number} targetValue - 目标值
     * @param {number} duration - 动画持续时间（毫秒）
     * @param {number} decimals - 小数位数
     */
    animateNumber(element, targetValue, duration = 1000, decimals = 0) {
        if (!element) return;

        const startValue = parseFloat(element.textContent) || 0;
        const startTime = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // 使用缓动函数
            const easedProgress = 1 - Math.pow(1 - progress, 3);
            
            const currentValue = startValue + (targetValue - startValue) * easedProgress;
            element.textContent = currentValue.toFixed(decimals);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }

    /**
     * 创建粒子效果
     * @param {HTMLElement} container - 容器元素
     * @param {number} x - 起始X坐标
     * @param {number} y - 起始Y坐标
     * @param {string} color - 粒子颜色
     * @param {number} count - 粒子数量
     */
    createParticles(container, x, y, color = '#FF6B6B', count = 10) {
        if (!container) return;

        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: absolute;
                width: 8px;
                height: 8px;
                background: ${color};
                border-radius: 50%;
                pointer-events: none;
                left: ${x}px;
                top: ${y}px;
            `;
            
            container.appendChild(particle);
            
            // 随机方向和速度
            const angle = Math.random() * Math.PI * 2;
            const velocity = 2 + Math.random() * 3;
            const vx = Math.cos(angle) * velocity;
            const vy = Math.sin(angle) * velocity;
            
            // 动画
            const animation = particle.animate([
                { transform: 'translate(0, 0) scale(1)', opacity: 1 },
                { transform: `translate(${vx * 50}px, ${vy * 50}px) scale(0)`, opacity: 0 }
            ], {
                duration: 500,
                easing: 'ease-out'
            });
            
            animation.onfinish = () => {
                particle.remove();
            };
        }
    }

    /**
     * 添加波浪动画
     * @param {HTMLElement} element - 目标元素
     * @param {number} duration - 动画持续时间（毫秒）
     */
    wave(element, duration = 1000) {
        if (!element) return;

        const keyframes = [
            { transform: 'translateY(0)' },
            { transform: 'translateY(-10px)' },
            { transform: 'translateY(0)' },
            { transform: 'translateY(-10px)' },
            { transform: 'translateY(0)' }
        ];

        const animation = element.animate(keyframes, {
            duration: duration,
            iterations: Infinity,
            easing: 'ease-in-out'
        });

        return animation;
    }

    /**
     * 停止所有动画
     */
    stopAllAnimations() {
        this.animations.forEach(animation => {
            if (animation && animation.cancel) {
                animation.cancel();
            }
        });
        this.animations = [];
    }

    /**
     * 检查是否支持动画
     * @returns {boolean} 是否支持动画
     */
    supportsAnimations() {
        return typeof Element !== 'undefined' && 
               typeof Element.prototype.animate === 'function';
    }
}

// 创建全局实例
const visualsManager = new VisualsManager();

// 导出供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VisualsManager;
}
