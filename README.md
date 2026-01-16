# AI 智能助手 - Soft Pastel 版

> 一个温和、清爽的 AI 聊天机器人，采用柔和粉彩设计，集成真实 AI 模型（GLM、DeepSeek），支持可配置的虚拟形象。

![Version](https://img.shields.io/badge/version-2.1.0-success)
![License](https://img.shields.io/badge/license-MIT-blue)
![HTML5](https://img.shields.io/badge/html5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/css3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/javascript-F7DF1E?logo=javascript&logoColor=black)
![Node.js](https://img.shields.io/badge/node.js-18+-green)
![Status](https://img.shields.io/badge/status-AI%20Integrated-brightgreen)
![GitHub Issues](https://img.shields.io/github/issues/wangdafei091/chatbot)
![GitHub Stars](https://img.shields.io/github/stars/wangdafei091/chatbot?style=social)

---

## ✨ 特性

### 🤖 AI 模型集成
- **多模型支持** - GLM-4（智谱AI）、DeepSeek Chat
- **智能对话** - 真实 AI 响应，支持多轮对话
- **上下文记忆** - 自动保存对话历史
- **模型切换** - 灵活切换不同 AI 提供商
- **Function Calling** ✨ - 工具调用框架，支持智能任务处理（v2.1 新增）
  - 文章总结工具
  - 关键信息提取工具
  - 天气查询工具 🌤️（最新）
  - 智能参数引导

### 🎨 视觉设计
- **柔和粉彩配色** - 薄荷绿、桃色、淡紫的温馨组合
- **高可读性** - 符合 WCAG AA 对比度标准
- **微妙动画** - 流畅的过渡和呼吸效果
- **响应式布局** - 完美适配桌面和移动端

### 🤖 虚拟形象系统
- **多角色选择** - 4 个预设虚拟形象（小樱🌸、咪咪🐱、小智🤖、阿狐🦊）
- **持久化存储** - 自动保存用户选择和对话历史
- **表情动画** - 眨眼、浮动等生动效果
- **可扩展架构** - 预留 Lottie 和 3D 模型接口

### 💬 交互体验
- **流式响应** - 实时打字机效果，像真人一样逐字显示 ✨
- **智能输入框** - 自动高度调整、实时验证
- **快速开始** ✨ - 一键体验常用功能（v2.1 新增）
  - 📝 帮我总结一篇文章
  - 📊 提取文章关键信息
  - 🌤️ 查询城市天气（最新）
- **用户上下文** ✨ - 个性化体验（v2.1 新增）
  - 自动记住使用偏好
  - 智能推荐常用功能
- **打字指示器** - 自然的节奏动画
- **消息气泡** - 清晰的视觉层次
- **Emoji 支持** - 跨平台兼容的 emoji 渲染

---

## 🌐 在线演示

👉 **体验在线版本**: [https://wangdafei091.github.io/chatbot/](https://wangdafei091.github.io/chatbot/)

---

## 📚 文档导航

### 🎯 我想...

**快速上手**
- 🔧 [搭建指南](docs/SETUP.md) - 本地开发环境配置（5 分钟上手）

**了解项目**
- 📖 [项目说明](README.md) - 本文档
- 🏗️ [架构文档](docs/ARCHITECTURE.md) - 技术架构和设计决策 ⭐
- 🗺️ [技术路线图](docs/ROADMAP.md) - 长期规划和功能扩展

**参与开发**
- 🤝 [开发指南](docs/CONTRIBUTING.md) - 编码规范和常见任务 ⭐
- 📊 [实施进度](docs/PROGRESS.md) - 已完成和待办任务

**自定义配置**
- 🎨 [虚拟形象配置](docs/AVATAR_GUIDE.md) - 自定义虚拟形象
- 🐙 [GitHub 配置](docs/GITHUB_SETUP.md) - GitHub 仓库设置

---

## 🚀 快速开始

### 方式 1：本地完整运行（推荐）✨

支持真实 AI 对话功能，需要 Node.js 18+：

```bash
# 1. 克隆项目
git clone https://github.com/wangdafei091/chatbot.git
cd chatbot

# 2. 安装依赖
npm install

# 3. 配置 API Key
cp .env.example .env
# 编辑 .env 文件，填入你的 GLM 或 DeepSeek API Key

# 4. 启动后端服务
npm start

# 5. 浏览器访问
open http://localhost:3000
```

**详细说明**：查看 [搭建指南](docs/SETUP.md)

### 方式 2：纯前端静态运行

仅展示 UI（无 AI 功能）：

```bash
# 在浏览器中打开
open index.html

# 或使用本地服务器
python -m http.server 8000
# 然后访问 http://localhost:8000
```

> ⚠️ **注意**：静态运行模式下，AI 响应是模拟的（仅用于演示 UI）

---

## 📸 截图展示

### 主界面
- 温和的粉彩配色
- 左侧虚拟形象布局
- 清晰的消息气泡

### 虚拟形象切换
- 4 个可配置角色
- 平滑的过渡动画
- 持久化用户选择

### 响应式设计
- 完美适配桌面端
- 移动端友好布局
- 触摸优化交互

---

## 📁 项目结构

```
chatbot/
├── server.js                  # Node.js 后端服务 ⭐
├── config.js                  # 后端配置
├── config/
│   ├── validators.js          # 配置验证器
│   └── frontend.config.js     # 前端配置源
├── tools/                     # 🔧 Function Calling 工具系统（v2.1 新增）
│   ├── index.js               # 工具注册表 + 执行器
│   ├── text-tools.js          # 文本处理工具
│   ├── weather-tools.js       # 天气查询工具 🌤️
│   └── utils/
│       ├── error-handler.js   # 错误处理
│       └── param-validator.js # 参数验证和引导
├── scripts/
│   └── generate-config.js     # 配置生成脚本
├── public/
│   ├── index.html             # 前端主应用 ⭐
│   ├── styles.css             # 样式文件（v2.1 拆分）
│   ├── app.js                 # 前端逻辑（v2.1 拆分）
│   └── config.js              # 前端配置（自动生成）
├── package.json               # Node.js 依赖配置
├── .env                       # 环境变量（API Key 配置）
├── .env.example               # 环境变量模板
├── README.md                  # 项目说明（本文件）
├── docs/                      # 📁 文档目录
│   ├── ARCHITECTURE.md        # 架构文档（技术栈选择）🏗️ ⭐
│   ├── CONTRIBUTING.md       # 开发指南（编码规范）🤝 ⭐
│   ├── SETUP.md              # 本地开发环境配置 🔧
│   ├── ROADMAP.md            # 技术路线图（长期规划）🗺️
│   ├── PROGRESS.md           # 实施进度（短期计划）📊
│   ├── AVATAR_GUIDE.md       # 虚拟形象配置指南 🎨
│   ├── GITHUB_SETUP.md       # GitHub 配置指南 🐙
│   └── design/               # 设计文档 📁
│       └── function-calling-framework.md
└── LICENSE                    # MIT 许可证
```

---

## 🎯 核心功能

### 1. AI 智能对话 ✨
- 支持多个 AI 模型（GLM-4、DeepSeek Chat）
- **流式响应** - 实时打字机效果，逐字显示 AI 回复
- 多轮对话上下文记忆
- 对话历史自动保存（localStorage）
- 错误处理和重试机制

### 2. 虚拟形象切换
点击左上角的虚拟形象即可切换角色：
- 🌸 **小樱** - 温柔型
- 🐱 **咪咪** - 调皮型
- 🤖 **小智** - 理性型
- 🦊 **阿狐** - 机智型

### 3. 快捷对话
点击欢迎界面的提示按钮即可快速开始对话。

### 4. 消息输入
- 输入消息后自动启用发送按钮
- `Enter` 发送，`Shift+Enter` 换行
- 支持多行输入（自动高度调整）

---

## 🔧 自定义配置

### 修改配色方案

编辑 `index.html` 中的 CSS 变量：

```css
:root {
    --bg-primary: #FDF6F0;
    --text-primary: #3E3848;
    --gradient-gentle: linear-gradient(135deg, ...);
    /* ... */
}
```

### 添加新的虚拟形象

在 `avatarDatabase` 对象中添加：

```javascript
const avatarDatabase = {
    // ... 现有角色
    '新角色': {
        emoji: '😊',
        name: '新角色',
        status: '在线',
        personality: '性格描述',
        gradient: 'linear-gradient(135deg, ...)'
    }
};
```

详细说明请参考 [AVATAR_GUIDE.md](AVATAR_GUIDE.md)。

---

## 🎨 设计系统

### 色彩规范
```css
/* 主色调 */
--bg-primary: #FDF6F0          /* 背景色 */
--text-primary: #3E3848        /* 主文字 */
--text-secondary: #5E5670      /* 次要文字 */

/* 强调色 */
--accent-mint: #C5E8D0         /* 薄荷绿 */
--accent-peach: #FFD4C2        /* 桃色 */
--accent-lavender: #E2D4F0     /* 淡紫 */
```

### 间距系统
```css
--spacing-xs: 4px
--spacing-sm: 8px
--spacing-md: 12px
--spacing-lg: 20px
--spacing-xl: 32px
--spacing-2xl: 48px
```

### 字体
- **主字体**: Quicksand (Google Fonts)
- **Emoji 字体**: Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji

---

## 📱 浏览器兼容性

| 浏览器 | 版本 | 支持状态 |
|--------|------|---------|
| Chrome | 90+ | ✅ 完全支持 |
| Safari | 14+ | ✅ 完全支持 |
| Firefox | 88+ | ✅ 完全支持 |
| Edge | 90+ | ✅ 完全支持 |
| iOS Safari | 14+ | ✅ 完全支持 |
| Android Chrome | 90+ | ✅ 完全支持 |

---

## 🚧 未来功能

详细的功能开发计划请参考：
- [技术路线图](docs/ROADMAP.md) - 技术架构和长期规划
- [实施进度](docs/PROGRESS.md) - 已完成和待办任务

### ✅ 已完成（v2.0）
- [x] 集成真实 AI API（GLM-4、DeepSeek）
- [x] 流式响应（打字机效果）✨
- [x] 对话历史管理（localStorage）
- [x] 多轮对话上下文记忆
- [x] 错误处理和重试机制
- [x] 本地开发环境

### 短期（v2.2）
- [x] 天气查询工具 🌤️
- [x] 前端工具调用集成优化
- [ ] 对话历史管理界面
- [ ] 对话历史导出功能

> **说明**：外部工具开发（如价格对比、航班查询）不再纳入计划，以保持项目轻量级定位。

### 中期（v2.5）
- [ ] 多会话管理
- [ ] 模型参数调整（temperature、max_tokens）
- [ ] 提示词模板
- [ ] 主题切换（深色模式）

### 长期（v3.0）
- [ ] 语音输入/输出
- [ ] Lottie 动画支持
- [ ] 3D 虚拟形象
- [ ] 文件分析
- [ ] 浏览器插件

---

## 🤝 贡献

欢迎贡献！如果你想改进这个项目：

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

---

## 📄 许可证

MIT License - 详见 LICENSE 文件

---

## 🙏 致谢

- 设计灵感来自现代聊天应用
- 字体使用 Google Fonts 的 Quicksand
- Emoji 由各平台系统字体提供支持

---

## 📞 联系方式

如有问题或建议，欢迎通过以下方式联系：
- 提交 Issue
- 发送 Pull Request
- 邮件联系

---

**最后更新**: 2026-01-16
**版本**: 2.2.0
**状态**: ✅ Function Calling 已集成，3 个工具可用
**下一步**:
- [搭建指南](docs/SETUP.md) - 5 分钟上手
- [实施进度](docs/PROGRESS.md) - 查看已完成和待办任务
- [技术路线图](docs/ROADMAP.md) - 了解技术架构和规划
