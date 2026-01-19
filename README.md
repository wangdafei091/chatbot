# AI 智能助手 - Soft Pastel 版

> 一个温和、清爽的 AI 聊天机器人，采用柔和粉彩设计，集成真实 AI 模型（GLM、DeepSeek），支持可配置的虚拟形象和 Function Calling 智能工具调用。

![Version](https://img.shields.io/badge/version-2.2.0-success)
![License](https://img.shields.io/badge/license-MIT-blue)
![Node.js](https://img.shields.io/badge/node.js-18+-green)
![Status](https://img.shields.io/badge/status-Production%20Ready-brightgreen)

---

## ✨ 核心特性

### 🤖 AI 模型集成
- **多模型支持** - GLM-4（智谱AI）、DeepSeek Chat
- **流式响应** - 实时打字机效果，逐字显示 AI 回复
- **Function Calling** - 智能工具调用框架
  - 📝 文章总结工具
  - 📊 关键信息提取工具
  - 🌤️ 天气查询工具
- **上下文记忆** - 多轮对话，自动保存历史

### 🎨 视觉体验
- **柔和粉彩配色** - 薄荷绿、桃色、淡紫的温馨组合
- **虚拟形象系统** - 4 个可配置角色（小樱🌸、咪咪🐱、小智🤖、阿狐🦊）
- **快速开始** - 一键体验常用功能

### 💡 技术特点
- **轻量级架构** - 单体应用，无数据库，最小依赖
- **快速启动** - `npm install` → `npm start`
- **易于扩展** - 清晰的代码结构，详细的开发文档

---

## 🚀 快速开始

### 本地运行（推荐）

```bash
# 1. 克隆并安装
git clone https://github.com/wangdafei091/chatbot.git
cd chatbot && npm install

# 2. 配置 API Key
cp .env.example .env
# 编辑 .env，填入 GLM 或 DeepSeek API Key

# 3. 启动服务
npm start
# 访问 http://localhost:3000
```

📖 **详细说明**：[搭建指南](docs/SETUP.md) - 5 分钟上手

### 在线演示

👉 体验在线版本：[https://wangdafei091.github.io/chatbot/](https://wangdafei091.github.io/chatbot/)

---

## 📚 文档导航

### 🎯 快速入口

| 我想... | 查看文档 |
|---------|---------|
| 快速上手 | [搭建指南](docs/SETUP.md) |
| 了解架构 | [架构文档](docs/ARCHITECTURE.md) ⭐ |
| 参与开发 | [开发指南](docs/CONTRIBUTING.md) ⭐ |
| 查看进度 | [实施进度](docs/PROGRESS.md) |
| 自定义配置 | [虚拟形象配置](docs/AVATAR_GUIDE.md) |

### 📁 完整文档列表

**核心文档**：
- [README.md](README.md) - 项目说明（本文件）
- [CLAUDE.md](CLAUDE.md) - AI 编码助手指南

**开发文档**：
- [SETUP.md](docs/SETUP.md) - 本地开发环境搭建
- [ARCHITECTURE.md](docs/ARCHITECTURE.md) - 技术架构和设计决策 ⭐
- [CONTRIBUTING.md](docs/CONTRIBUTING.md) - 编码规范和常见任务 ⭐

**项目文档**：
- [PROGRESS.md](docs/PROGRESS.md) - 开发进度和短期计划
- [ROADMAP.md](docs/ROADMAP.md) - 技术路线图和长期规划

**功能专题**：
- [AVATAR_GUIDE.md](docs/AVATAR_GUIDE.md) - 虚拟形象配置指南
- [GITHUB_SETUP.md](docs/GITHUB_SETUP.md) - GitHub 仓库配置

**设计文档**：
- [Function Calling 框架设计](docs/design/function-calling-framework.md) - 详细技术方案

---

## 📂 项目结构

```
chatbot/
├── server.js              # Node.js 后端服务
├── tools/                 # Function Calling 工具系统
│   ├── index.js          # 工具注册表 + 执行器
│   ├── text-tools.js     # 文本处理工具
│   └── weather-tools.js  # 天气查询工具
├── public/
│   ├── index.html        # 前端界面
│   ├── styles.css        # 样式文件
│   └── app.js            # 前端逻辑
├── docs/                  # 文档目录
└── config/               # 配置文件
```

详细说明：[架构文档](docs/ARCHITECTURE.md#代码结构)

---

## 🎯 技术栈

| 技术 | 用途 | 说明 |
|------|------|------|
| **Node.js 18+** | 后端运行时 | 轻量级服务器 |
| **Express.js** | Web 框架 | 极简、快速开发 |
| **原生 JS** | 前端框架 | 零依赖、快速迭代 |
| **SSE** | 流式响应 | 单向流、自动重连 |
| **localStorage** | 数据存储 | 零成本、隐私保护 |

**为什么这样选择？** 详见 [架构文档](docs/ARCHITECTURE.md#技术栈选择理由)

---

## 🚧 下一步计划

### 短期（v2.3）
- [ ] 基础错误处理完善（Toast 提示）
- [ ] 智能引导增强（示例按钮）
- [ ] 用户上下文系统完善（设置界面）

### 中期（v2.5）
- [ ] 对话历史管理界面
- [ ] 多会话管理
- [ ] 模型参数调整

详细规划：[实施进度](docs/PROGRESS.md) | [技术路线图](docs/ROADMAP.md)

---

## 🤝 贡献指南

欢迎贡献！请查看 [开发指南](docs/CONTRIBUTING.md) 了解：
- 编码规范
- 常见任务指南
- 项目约束（轻量级定位）

快速流程：
1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

---

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

---

## 📞 联系方式

- 提交 [Issue](https://github.com/wangdafei091/chatbot/issues)
- 发送 [Pull Request](https://github.com/wangdafei091/chatbot/pulls)

---

**版本**: v2.2.0
**状态**: ✅ 核心功能全部完成，项目已达到预期目标
**最后更新**: 2026-01-17
