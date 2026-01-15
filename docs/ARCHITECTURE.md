# 项目架构文档

> AI聊天机器人的完整架构说明
> **目标读者**：AI编码助手、新加入开发者、架构师

---

## 📋 目录

- [项目概览](#项目概览)
- [技术栈选择理由](#技术栈选择理由)
- [系统架构](#系统架构)
- [数据流](#数据流)
- [关键设计决策](#关键设计决策)
- [代码结构](#代码结构)
- [扩展指南](#扩展指南)

---

## 项目概览

### 定位

**轻量级AI聊天机器人** - 强调简洁、可维护、快速启动

**核心特征**：
- 单体应用（非微服务）
- 无数据库（使用localStorage）
- 最小依赖（6个npm包）
- 快速启动（npm install → npm start）

**目标用户**：
- 个人开发者
- 小团队内部工具
- 学习AI集成的开发者

### 非目标（明确不做什么）

- ❌ 企业级多用户系统
- ❌ 云端对话历史存储
- ❌ 复杂的权限管理
- ❌ 高并发场景（>1000用户）

**重要**：如果需要上述功能，请重构为完整架构

---

## 技术栈选择理由

### 后端：Express.js

**选择理由**：
1. **极简主义** - 符合项目定位（轻量级）
2. **中间件生态** - CORS、rate-limit等成熟方案
3. **学习成本低** - 大量教程和社区支持
4. **快速开发** - 最小化配置

**未选择方案**：
- ❌ NestJS - 过度设计，增加复杂度
- ❌ Koa - 中间件不够成熟，学习成本高
- ❌ Fastify - 性能优势在当前场景不明显

### 前端：原生JavaScript

**选择理由**：
1. **零依赖** - 不需要构建工具
2. **快速迭代** - 修改即生效
3. **学习价值** - 理解底层原理
4. **轻量级** - 单文件即可运行

**未选择方案**：
- ❌ Vue/React - 对简单项目过度设计
- ❌ TypeScript - 增加构建步骤（后期可考虑）

### 流式响应：SSE（Server-Sent Events）

**选择理由**：
1. **单向流** - 服务器→客户端，符合聊天场景
2. **自动重连** - 浏览器原生支持
3. **简单实现** - 不需要额外库
4. **HTTP协议** - 无需特殊配置

**未选择方案**：
- ❌ WebSocket - 双向通信，聊天场景不需要
- ❌ 轮询 - 性能差，延迟高

### 配置管理：自定义方案

**选择理由**：
1. **完全控制** - 根据项目需求定制
2. **零依赖** - 不引入额外库
3. **验证机制** - 启动时检查配置
4. **前后端分离** - 各自管理配置

**未选择方案**：
- ❌ convict - 功能过度
- ❌ config - 复杂度高
- ❌ dotenv-only - 缺少验证

### 对话存储：localStorage

**选择理由**：
1. **客户端存储** - 无需服务器
2. **零成本** - 不需要数据库
3. **隐私保护** - 数据不离开用户设备
4. **简单实现** - 浏览器原生API

**未选择方案**：
- ❌ MongoDB/PostgreSQL - 增加运维成本
- ❌ Redis - 分布式场景才需要
- ❌ IndexedDB - 对话数据不需要复杂查询

---

## 系统架构

### 整体架构图

```
┌─────────────────────────────────────────────────┐
│                   用户浏览器                     │
│  ┌───────────────────────────────────────────┐  │
│  │  前端 (public/index.html)                 │  │
│  │                                            │  │
│  │  ┌──────────────┐  ┌──────────────────┐   │  │
│  │  │  UI 层       │  │  状态管理层       │   │  │
│  │  │  - 消息界面  │  │  - localStorage  │   │  │
│  │  │  - 输入框    │  │  - 对话历史      │   │  │
│  │  │  - 虚拟形象  │  │  - 用户设置      │   │  │
│  │  │  - 工具状态  │  │                  │   │  │
│  │  └──────────────┘  └──────────────────┘   │  │
│  │         │                   │             │  │
│  │         ▼                   ▼             │  │
│  │  ┌──────────────────────────────────┐     │  │
│  │  │  API 调用层                       │     │  │
│  │  │  - sendMessage()                 │     │  │
│  │  │  - fetch(/api/chat/stream)       │     │  │
│  │  │  - ReadableStream 处理            │     │  │
│  │  └──────────────────────────────────┘     │  │
│  └───────────────────────────────────────────┘  │
└───────────────────┬─────────────────────────────┘
                    │ HTTPS
                    ▼
┌─────────────────────────────────────────────────┐
│              Node.js 后端服务器                  │
│  ┌───────────────────────────────────────────┐  │
│  │  Express.js 应用                          │  │
│  │                                           │  │
│  │  ┌────────────┐  ┌──────────────────┐    │  │
│  │  │ 中间件层   │  │  路由层          │    │  │
│  │  │ - CORS     │  │  - /api/chat     │    │  │
│  │  │ - Rate Limit│ │  - /api/models   │    │  │
│  │  │ - Body Parse│ │  - /api/health   │    │  │
│  │  └────────────┘  └──────────────────┘    │  │
│  │         │                   │             │  │
│  │         ▼                   ▼             │  │
│  │  ┌──────────────────────────────────┐    │  │
│  │  │  业务逻辑层                       │    │  │
│  │  │  ┌────────────────────────────┐  │    │  │
│  │  │  │  ToolExecutor 类 ⭐         │  │    │  │
│  │  │  │  - 意图识别                │  │    │  │
│  │  │  │  - 工具调度                │  │    │  │
│  │  │  │  - 结果整合                │  │    │  │
│  │  │  └────────────────────────────┘  │    │  │
│  │  │  ┌────────────────────────────┐  │    │  │
│  │  │  │  ToolRegistry 类 ⭐         │  │    │  │
│  │  │  │  - 工具注册                │  │    │  │
│  │  │  │  - 工具执行                │  │    │  │
│  │  │  │  - 参数验证                │  │    │  │
│  │  │  └────────────────────────────┘  │    │  │
│  │  │  ┌────────────────────────────┐  │    │  │
│  │  │  │  AIAdapter 类              │  │    │  │
│  │  │  │  - 消息格式化              │  │    │  │
│  │  │  │  - 历史管理                │  │    │  │
│  │  │  │  - Function Calling支持 ⭐  │  │    │  │
│  │  │  └────────────────────────────┘  │    │  │
│  │  └──────────────────────────────────┘    │  │
│  │         │                                  │  │
│  │         ▼                                  │  │
│  │  ┌──────────────────────────────────┐    │  │
│  │  │  工具层 ⭐ (tools/)              │    │  │
│  │  │  - 文本处理工具                  │    │  │
│  │  │  - 外部API工具（未来）           │    │  │
│  │  │  - 任务管理工具（未来）          │    │  │
│  │  └──────────────────────────────────┘    │  │
│  │         │                                  │  │
│  │         ▼                                  │  │
│  │  ┌──────────────────────────────────┐    │  │
│  │  │  配置层                           │    │  │
│  │  │  - config.js                     │    │  │
│  │  │  - validators.js                 │    │  │
│  │  │  - frontend.config.js            │    │  │
│  │  └──────────────────────────────────┘    │  │
│  └───────────────────────────────────────────┘  │
└───────────────────┬─────────────────────────────┘
                    │ HTTPS
                    ▼
┌─────────────────────────────────────────────────┐
│              外部AI服务和API                      │
│  ┌──────────────┐  ┌──────────────────┐        │
│  │  GLM-4 API   │  │  DeepSeek API    │        │
│  │  智谱AI      │  │                  │        │
│  └──────────────┘  └──────────────────┘        │
│                                                 │
│  ┌──────────────┐  ┌──────────────────┐        │
│  │  天气API     │  │  其他API         │        │
│  │  (未来)      │  │  (未来)          │        │
│  └──────────────┘  └──────────────────┘        │
└─────────────────────────────────────────────────┘
```

### 分层说明

**前端层**：
- **UI层** - 用户界面组件
- **状态层** - localStorage持久化
- **API层** - 封装的API调用

**后端层**：
- **中间件层** - CORS、限流、解析
- **路由层** - API端点定义
- **业务层** - AIAdapter核心逻辑
- **配置层** - 配置管理和验证

---

## 数据流

### 聊天消息流（流式响应）

```
用户输入
   │
   ▼
前端：sendMessage()
   │
   ├─ 1. 读取对话历史 (localStorage)
   │
   ├─ 2. 显示用户消息气泡
   │
   ├─ 3. 发送请求
   │      POST /api/chat/stream
   │      Body: { message, history, provider }
   │
   ▼
后端：/api/chat/stream
   │
   ├─ 4. 验证请求（消息长度、格式）
   │
   ├─ 5. 调用 AIAdapter.chatWithGLMStream()
   │      │
   │      ├─ 6. 格式化消息（添加历史）
   │      │
   │      ├─ 7. 调用 GLM API (stream: true)
   │      │      │
   │      │      ▼
   │      │   GLM API (SSE流)
   │      │      │
   │      │      ├─ data: {"choices": [{"delta": {"content": "你"}}]}
   │      │      ├─ data: {"choices": [{"delta": {"content": "好"}}]}
   │      │      └─ data: [DONE]
   │      │
   │      └─ 8. 解析SSE数据，通过回调返回
   │
   └─ 9. 转发给前端 (SSE格式)
         │
         ▼
前端：ReadableStream 读取
   │
   ├─ 10. 逐块解析 (data: {...})
   │
   ├─ 11. 逐字追加到消息气泡
   │
   ├─ 12. 自动滚动到底部
   │
   └─ 13. 保存到对话历史 (localStorage)
```

### 配置生成流

```
启动：npm start
   │
   ├─ 1. npm run generate-config
   │      │
   │      ├─ 读取 config/frontend.config.js
   │      │
   │      ├─ 生成 window.CONFIG 对象
   │      │
   │      └─ 写入 public/config.js
   │
   ├─ 2. node server.js
   │      │
   │      ├─ 读取 config.js
   │      │
   │      ├─ 调用 validators.validateConfig()
   │      │      │
   │      │      ├─ 验证端口、环境、CORS
   │      │      ├─ 验证AI配置（API Keys）
   │      │      ├─ 验证参数范围
   │      │      └─ 失败则拒绝启动
   │      │
   │      └─ 启动 Express 服务器
   │
   └─ 3. 服务器就绪
```
## 架构概览

### 技术栈选择理由

| 技术 | 选择理由 | 不要替换为 |
|------------|------------------|---------------------|
| **Express.js** | 极简、快速开发、优秀的中间件生态 | NestJS、Koa |
| **原生 JavaScript** | 零依赖、即时迭代、教育价值 | Vue、React、TypeScript |
| **SSE** | 单向流（服务器→客户端）、自动重连、浏览器原生支持 | WebSocket |
| **localStorage** | 零成本、隐私设计、无需服务器存储 | MongoDB、PostgreSQL、Redis |

### 代码结构

```
Backend:
├── server.js (678 lines) - 主服务器文件
│   ├── AIAdapter class - AI 服务抽象层 ⭐
│   │   ├── chatWithGLM() - GLM API 调用
│   │   ├── chatWithDeepSeek() - DeepSeek API 调用
│   │   ├── chatWithGLMStream() - GLM 流式调用 (SSE) ⭐
│   │   ├── chatWithDeepSeekStream() - DeepSeek 流式调用 (SSE) ⭐
│   │   └── chat() - 统一入口
│   └── API 路由
│       ├── POST /api/chat - 非流式聊天
│       ├── POST /api/chat/stream - 流式聊天 (SSE) ⭐
│       ├── GET /api/models - 列出可用模型
│       ├── GET /api/health - 健康检查
│       └── POST /api/set-model - 切换默认模型
├── config.js - 后端配置与验证
├── config/validators.js - 配置验证工具
└── config/frontend.config.js - 前端配置源文件

Frontend:
└── public/index.html (1200+ lines)
    ├── UI 渲染（消息、输入框、头像）
    ├── sendMessage() - 发送消息（支持流式）⭐
    ├── fetchStream() - 处理 SSE 响应 ⭐
    └── localStorage 管理（对话历史、用户设置）

Scripts:
└── scripts/generate-config.js - 从 config/frontend.config.js 生成 public/config.js
```

## 核心架构模式

### 1. AI 适配器模式

所有 AI 提供商在 `AIAdapter` 类中实现相同的接口：

```javascript
// 添加新的 AI 提供商：
static async chatWithNewProvider(message, history = []) { }
static async chatWithNewProviderStream(message, history, onData, onError, onComplete, abortController) { }
```

### 2. 流式响应流程 (SSE)

```
用户输入 → sendMessage()
  ↓
POST /api/chat/stream（携带历史记录）
  ↓
AIAdapter.chatWithGLMStream()
  ↓
Axios stream → GLM API（SSE 格式）
  ↓
解析 SSE 数据块 → 回调函数
  ↓
通过 SSE 转发到前端
  ↓
前端 ReadableStream → 逐字追加到消息气泡
  ↓
保存到 localStorage
```

**关键文件**：`server.js:169-264`（GLM 流）、`server.js:270-360`（DeepSeek 流）、`public/index.html`（前端 SSE 处理）

### 3. 配置生成

- **源文件**：`config/frontend.config.js`
- **生成器**：`scripts/generate-config.js`
- **输出**：`public/config.js`（自动生成，请勿编辑）

修改前端配置：
1. 编辑 `config/frontend.config.js`
2. 运行 `npm run generate-config`（或 `npm start`，已包含此步骤）
3. 刷新浏览器

---

## Function Calling 框架

> **版本**：v2.1.0（已完成 60%）✨
> **设计文档**：[docs/design/function-calling-framework.md](design/function-calling-framework.md)
> **状态**：🚧 进行中（基础框架、智能引导、用户上下文已完成）

### 概述

Function Calling 框架是项目的重大架构升级，让 AI 能够根据用户意图自动调用外部工具，实现智能助理功能。

### 核心组件

| 组件 | 职责 | 位置 |
|------|------|------|
| **ToolRegistry** | 工具注册表 | `tools/index.js` ✅ |
| **ToolExecutor** | 工具执行器 | `tools/index.js` ✅ |
| **ParamValidator** | 参数验证和智能引导 | `tools/utils/param-validator.js` ✅ |
| **ErrorHandler** | 错误处理 | `tools/utils/error-handler.js` ✅ |
| **TextTools** | 文本处理工具 | `tools/text-tools.js` ✅ |
| **UserContext** | 用户上下文（客户端） | `public/app.js` ✅ |
| **AIAdapter** | 支持 Function Calling 参数 | `server.js` ✅ |

### 工作流程

```
用户消息
  ↓
意图识别（AI + 工具描述）
  ↓
┌─────────────────────────────┐
│ 需要调用工具？               │
├─────────────────────────────┤
│ 是 → 参数完整？              │
│      ├─ 是 → 执行工具        │
│      └─ 否 → 智能引导        │
│ 否 → 直接回复                │
└─────────────────────────────┘
  ↓
AI 生成自然语言回复
  ↓
流式返回给用户
```

### 工具分类

| 类型 | 示例 | 状态 | 依赖 |
|------|------|------|------|
| **文本处理** | 文章总结、关键信息提取 | ✅ 已完成 (v2.1.0) | AI 原生 |
| **信息查询** | 天气、价格、航班 | 📋 待调研 | 外部 API |
| **任务管理** | 待办事项、统计看板 | 📋 延后 | 数据存储 |
| **文件处理** | 图片去水印 | 📋 后续 | 图片库 |

### 技术选型

| 决策 | 选择 | 理由 |
|------|------|------|
| **框架** | 自研（不使用 LangChain） | 轻量级定位 |
| **意图识别** | 基于 AI | 无需训练，自动适配 |
| **工具存储** | 内存注册表 | 简单快速 |

### 详细设计

完整的架构设计请参阅：[docs/design/function-calling-framework.md](design/function-calling-framework.md)

---

## 关键设计决策

### 决策1：单体应用 vs 微服务

**选择**：单体应用

**理由**：
- 项目规模小（<2000行代码）
- 团队规模小（1-3人）
- 部署简单（单台服务器）
- 调试方便（单进程）

**权衡**：
- ✅ 简单、快速
- ❌ 无法独立扩展
- ❌ 单点故障

**何时重构**：
- 代码量 > 10000行
- 团队 > 5人
- 需要高可用

### 决策2：无数据库架构

**选择**：客户端localStorage

**理由**：
- 对话历史不需要跨设备同步
- 降低运维成本（无数据库）
- 提升隐私保护（数据不离开设备）
- 简化部署（无需数据迁移）

**权衡**：
- ✅ 零成本、零运维
- ✅ 隐私保护
- ❌ 清除浏览器数据会丢失
- ❌ 无法跨设备同步

**何时添加数据库**：
- 需要跨设备同步
- 需要用户认证
- 需要数据分析

### 决策3：配置文件生成

**选择**：脚本生成 public/config.js

**理由**：
- 前端需要 JavaScript 配置（window.CONFIG）
- 后端配置包含 Node.js 代码（process.env）
- 需要转换成浏览器可执行格式
- 启动时自动同步

**权衡**：
- ✅ 前后端配置分离
- ✅ 自动化同步
- ❌ 需要手动运行脚本（已集成到 npm start）

### 决策4：速率限制

**选择**：express-rate-limit

**配置**：100次/15分钟

**理由**：
- 防止API滥用
- 控制成本（AI API按调用计费）
- 保护服务器稳定性

**权衡**：
- ✅ 安全性
- ✅ 成本控制
- ❌ 可能限制正常使用（可调整）

### 决策5：流式响应

**选择**：SSE（Server-Sent Events）

**实现**：
- 后端：`chatWithGLMStream()` - axios流式调用
- 前端：`ReadableStream` - 逐块解析

**权衡**：
- ✅ 用户体验好（逐字显示）
- ✅ 实时反馈
- ❌ 实现复杂度略高
- ❌ 错误处理更复杂

---

## 代码结构

### 后端文件职责

```
server.js (652行)
├── 中间件配置 (12-35行)
│   ├── CORS
│   ├── body parser
│   └── rate limiting
├── AIAdapter 类 (37-351行)
│   ├── getApiKey() - 获取API密钥
│   ├── formatMessages() - 格式化消息
│   ├── chatWithGLM() - GLM普通调用
│   ├── chatWithDeepSeek() - DeepSeek普通调用
│   ├── chatWithGLMStream() - GLM流式调用 ⭐
│   ├── chatWithDeepSeekStream() - DeepSeek流式调用 ⭐
│   └── chat() - 统一入口
├── API 路由 (353-594行)
│   ├── GET /api/health - 健康检查
│   ├── GET /api/models - 模型列表
│   ├── POST /api/chat - 普通聊天
│   ├── POST /api/chat/stream - 流式聊天 ⭐
│   ├── POST /api/set-model - 切换模型
│   └── GET /api/config - 配置信息
├── 静态文件服务 (595-603行)
└── 启动服务器 (624-652行)

config.js (87行)
├── 配置定义 (10-68行)
├── 配置验证 (72-86行)
└── 导出验证后的配置

config/validators.js (176行)
├── validateConfig() - 主验证函数
├── validatePort() - 端口验证
├── validateArray() - 数组验证
├── validateUrl() - URL验证
├── validateNumberRange() - 数值范围验证
└── validateEnum() - 枚举值验证

config/frontend.config.js (98行)
├── API配置
├── 功能配置
├── 虚拟形象配置
└── UI配置

scripts/generate-config.js (59行)
└── 生成 public/config.js
```

### 前端代码结构

```
public/index.html (1200+行)
├── HTML结构
│   ├── 顶部导航（虚拟形象切换）
│   ├── 聊天消息区域
│   └── 输入区域
├── CSS样式（内联<style>）
│   ├── CSS变量（配色、间距）
│   ├── 响应式布局
│   └── 动画效果
└── JavaScript（内联<script>）
    ├── 配置加载（window.CONFIG）
    ├── 状态管理
    │   ├── conversationHistory
    │   ├── currentAvatar
    │   └── currentProvider
    ├── API调用
    │   ├── sendMessage()
    │   ├── fetchStream() - SSE处理 ⭐
    │   └── parseStream() - 数据解析
    ├── UI渲染
    │   ├── renderMessage()
    │   ├── scrollToBottom()
    │   └── updateAvatar()
    └── 工具函数
        ├── escapeHtml()
        └── formatTime()
```

---
## 重要实现细节

### SSE 流处理

流式实现使用 Server-Sent Events：
- **后端**：Axios 配置 `responseType: 'stream'`，解析 SSE 数据块
- **前端**：Fetch API 使用 `ReadableStream`，解析 `data: {}` 行
- **中止支持**：使用 `AbortController` 取消请求

**关键**：客户端断开检测（`req.on('close')`）会中止上游 API 调用，防止资源泄漏。

完整流式实现参见 `server.js:462-570`。

### 配置验证

`config/validators.js` 提供：
- `validateConfig()` - 主验证函数
- `validatePort()`、`validateNumberRange()`、`validateEnum()`、`validateUrl()`
- 配置错误时应用退出（快速失败）

### 速率限制

使用 `express-rate-limit`：每 IP 每 15 分钟 100 次请求。
配置位于 `server.js:47-55`。


---

## 相关文档

- 🔧 [搭建指南](SETUP.md) - 快速启动
- 📊 [实施进度](PROGRESS.md) - 开发计划
- 🗺️ [技术路线图](ROADMAP.md) - 长期规划

---

**最后更新**: 2026-01-12
**维护者**: 项目维护团队
