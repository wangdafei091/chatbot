# CLAUDE.md

本文件为 Claude Code (claude.ai/code) 在此代码库中工作时提供指导。

## 项目概览

**AI Chatbot** - 一个轻量级 AI 聊天机器人，集成了真实 AI 模型（GLM-4、DeepSeek Chat），支持流式响应、虚拟头像和柔和的马卡龙配色设计。

**核心特性**：
- **单体应用**（非微服务）
- **无数据库** - 使用客户端 localStorage
- **最小依赖** - 仅 6 个 npm 包
- **快速启动** - `npm install` → `npm start`

**重要约束**：
- 这是一个轻量级的个人工具，不是企业级应用
- 不要建议重型框架（Vue、React、NestJS、TypeScript）
- 不要添加数据库（MongoDB、PostgreSQL、Redis）
- 不要将 SSE（Server-Sent Events）重写为 WebSocket
- `public/config.js` 是自动生成的，请勿手动编辑

详细的架构决策请参阅 `docs/ARCHITECTURE.md`。
详细开发指南请参阅 `docs/CONTRIBUTING.md`。

## 快速参考

### 常用命令

```bash
# 启动开发服务器（自动生成配置）
npm start

# 启动并监听文件变化自动重载
npm run dev

# 仅重新生成前端配置
npm run generate-config
```

### 关键文件位置

| 文件 | 说明 |
|------|------|
| `server.js` | 主服务器文件，包含 `AIAdapter` 类和所有 API 路由 |
| `public/index.html` | 前端单文件（UI + 逻辑，1200+ 行） |
| `config/frontend.config.js` | 前端配置源文件（虚拟头像、提示词等） |
| `public/config.js` | 前端配置生成文件（自动生成，请勿编辑） |
| `.env` | API 密钥配置 |
| `config/validators.js` | 配置验证工具 |

### 核心代码位置

- **AI 适配器**：`server.js` 中的 `AIAdapter` 类
  - `chatWithGLM()` / `chatWithDeepSeek()` - 非流式调用
  - `chatWithGLMStream()` / `chatWithDeepSeekStream()` - 流式调用 (SSE)
- **流式处理**：`server.js:462-570`
- **前端 SSE 处理**：`public/index.html` 中的 `fetchStream()` 函数

## 相关文档

- `docs/ARCHITECTURE.md` - 详细架构决策和技术选型理由
- `docs/CONTRIBUTING.md` - 代码规范和常见任务指南
- `docs/SETUP.md` - 本地开发环境搭建（5 分钟）
- `docs/PROGRESS.md` - 实现进度和待办事项
- `docs/ROADMAP.md` - 长期技术路线图
- `docs/AI_PROMPTS.md` - AI开发提示词指南

## 修改之前必读

首先阅读这些文档：
- `docs/ARCHITECTURE.md` - 理解为什么选择某些技术
- `docs/CONTRIBUTING.md` - 代码规范和重要约束和开发指南

- 尽量复用现有代码，避免非必要的新增（使用 `AIAdapter`、validators 等）
**核心原则**：这是一个轻量级、易维护的个人工具。避免过度设计。