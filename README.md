# BrainGym - 大脑训练网站

一个功能完整、无需登录、数据存储在用户本地的专业大脑训练网站。

## 项目特点

- 纯前端实现，无需后端支持
- 所有数据通过 localStorage 存储在浏览器端
- 四个训练模块：舒尔特表、Stroop效应、序列工作记忆、听觉选择性注意
- 儿童友好的界面设计，色彩明亮、圆角元素
- 完整的数据统计和可视化功能

## 项目结构

```
brain-gym/
├── index.html          # 主页面
├── style.css          # 全局样式
├── app.js             # 主应用逻辑
├── modules/           # 各训练模块
│   ├── schulte.js     # 舒尔特表训练
│   ├── stroop.js      # Stroop效应训练
│   ├── memory.js      # 序列记忆训练
│   └── auditory.js    # 听觉注意训练
├── utils/             # 工具函数
│   ├── storage.js     # localStorage操作
│   ├── stats.js       # 统计计算
│   ├── audio.js       # 音频管理
│   └── visuals.js     # 视觉动画
├── assets/            # 静态资源
│   ├── sounds/        # 音效文件
│   └── images/        # 图片资源
└── lib/               # 第三方库
    ├── chart.min.js   # 图表库
    └── howler.min.js  # 音频库
```

## 快速开始

### 1. 下载第三方库

在使用项目前，需要下载以下第三方库：

#### Chart.js
下载地址：https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js
将文件保存到 `lib/chart.min.js`

#### Howler.js
下载地址：https://cdnjs.cloudflare.com/ajax/libs/howler/2.2.3/howler.min.js
将文件保存到 `lib/howler.min.js`

或者直接在 `index.html` 中使用 CDN：
```html
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/howler/2.2.3/howler.min.js"></script>
```

### 2. 准备音效文件

在 `assets/sounds/` 目录下准备以下音效文件：

- `click.mp3` - 点击音效
- `correct.mp3` - 正确音效
- `wrong.mp3` - 错误音效
- `success.mp3` - 成功音效
- `gameover.mp3` - 游戏结束音效
- `digit0.mp3` 到 `digit9.mp3` - 数字0-9的发音
- `high.mp3` - 高音
- `low.mp3` - 低音
- `short.mp3` - 短音
- `long.mp3` - 长音

### 3. 运行项目

直接在浏览器中打开 `index.html` 文件即可开始使用。

## 训练模块说明

### 1. 舒尔特表训练
按顺序从1到25快速点击数字，训练专注力和视觉搜索能力。

### 2. Stroop效应训练
识别文字显示的颜色，而不是文字本身的含义，挑战认知控制能力。

### 3. 序列记忆训练
记住并重复数字序列，提升工作记忆容量。

### 4. 听觉注意训练
在多个声音中识别目标声音，训练听觉选择性注意。

## 数据存储

所有训练数据都存储在浏览器的 localStorage 中，包括：
- 每次训练的详细记录
- 最佳成绩、平均成绩等统计数据
- 用户设置（音效开关、音量等）

数据格式：
```javascript
{
  version: '1.0.0',
  lastUpdated: '2026-02-07T...',
  settings: {
    soundEnabled: true,
    difficulty: 'normal'
  },
  schulte: { records: [], bestTime: null, averageTime: null, totalGames: 0 },
  stroop: { records: [], bestScore: null, averageScore: null, totalGames: 0 },
  memory: { records: [], bestLevel: null, averageLevel: null, totalGames: 0 },
  auditory: { records: [], bestLevel: null, averageAccuracy: null, totalGames: 0 }
}
```

## 技术栈

- 原生 JavaScript (ES6+)
- 纯 CSS3
- Chart.js - 数据可视化
- Howler.js - 音频处理

## 浏览器兼容性

- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

## 开发说明

所有代码都有详细的中文注释，便于后续维护和扩展。

### 添加新模块

1. 在 `modules/` 目录下创建新的模块文件
2. 在 `index.html` 中添加对应的 HTML 结构
3. 在 `app.js` 中注册新模块
4. 在 `storage.js` 中添加数据存储结构

## 许可证

MIT License
