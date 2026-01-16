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

## 修改之前必读

首先阅读这些文档：
- `docs/ARCHITECTURE.md` - 理解为什么选择某些技术
- `docs/CONTRIBUTING.md` - 代码规范和重要约束和开发指南

- 尽量复用现有代码，避免非必要的新增（使用 `AIAdapter`、validators 等）
**核心原则**：这是一个轻量级、易维护的个人工具。避免过度设计。

---

## AI 行为准则

### 回复人类请求时

当收到开发任务时，请按以下模式回复：

1. **先说明理解的项目定位**
   - 引用本文件中的约束
   - 说明需求是否符合轻量级定位
   - 示例："我已理解这是一个轻量级 AI 聊天机器人项目（单体应用、无数据库、最小依赖）"

2. **分析需求合理性**
   - 评估是否需要引入重型框架/数据库
   - 如果超出定位，说明原因和替代方案
   - 示例："这个需求符合项目定位" 或 "这个需求需要权衡，因为..."

3. **提供符合项目定位的方案**
   - 优先考虑简单方案
   - 避免过度设计
   - 说明权衡（简单性 vs 功能性）

4. **说明设计理由**
   - 引用 `docs/ARCHITECTURE.md` 的决策
   - 说明为什么这样选择

### 处理超出项目定位的请求

当人类提出不符合轻量级定位的需求时：

❌ **不要**：
- 直接说"不能做"
- 建议复杂方案（数据库、重型框架）
- 忽略项目定位

✅ **应该**：
- 引用 `docs/ARCHITECTURE.md` 的设计决策
- 说明权衡（为什么要这样设计）
- 提供符合当前定位的替代方案
- 如果一定要实现，说明应该创建独立项目

### 开发任务工作流程

开始任何开发任务前，请遵循以下流程：

1. **先阅读文档**
   - `docs/ARCHITECTURE.md` - 技术选型理由
   - `docs/CONTRIBUTING.md` - 编码规范
   - `docs/PROGRESS.md` - 当前进度

2. **检查现有实现**
   - 搜索相关功能（避免重复造轮子）
   - 理解现有设计模式
   - 基于现有代码改进，而非重写

3. **评估复杂度**
   - 是否符合轻量级定位？
   - 是否需要引入新依赖？（尽量避免）
   - 维护成本可接受吗？

4. **提供方案**
   - 说明方案为什么适合当前项目
   - 引用相关文档章节
   - 列出实施步骤

5. **实施时**
   - 遵循现有代码风格
   - 添加必要注释
   - 不添加不必要的依赖

6. **完成后：同步更新文档** ⚠️ **重要**
   - 代码和文档**必须同时提交**
   - 根据代码变更类型，更新对应文档：
     - 新增/修改 API → 更新 `docs/API.md`
     - 新功能 → 更新 `docs/README.md`、`docs/PROGRESS.md`、`docs/TESTING.md`
     - 配置变更 → 更新 `docs/SETUP.md`
     - Bug 修复 → 更新 `docs/TROUBLESHOOTING.md`（如果是常见问题）
     - 架构调整 → 更新 `docs/ARCHITECTURE.md`
     - 发现新陷阱 → 更新 `CLAUDE.md` 的"常见陷阱"部分
   - **检查清单**：
     - [ ] 是否新增/修改了 API？→ 更新 API.md
     - [ ] 是否新增了功能？→ 更新 README.md、PROGRESS.md、TESTING.md
     - [ ] 是否改变了配置？→ 更新 SETUP.md
     - [ ] 是否修复了常见问题？→ 更新 TROUBLESHOOTING.md
     - [ ] 是否改变了架构设计？→ 更新 ARCHITECTURE.md
     - [ ] 是否发现新的陷阱？→ 更新 CLAUDE.md

**参考**：详见 `docs/DOCUMENTATION_MAINTENANCE.md`

### 文档管理原则

**避免重复**：
- 每个信息只有一个权威来源（Single Source of Truth）
- 概览在一处，详细在另一处
- 使用引用标记连接文档

**文档职责定位**：

| 文档类型 | 职责 | 详细程度 | 示例 |
|---------|------|---------|------|
| **ARCHITECTURE.md** | 架构概览、技术选型理由 | ⭐⭐ 低 | "为什么选择 Express.js" |
| **design/*.md** | 详细技术设计、实施步骤 | ⭐⭐⭐⭐⭐ 高 | "如何实现 Function Calling" |
| **CONTRIBUTING.md** | 开发指南、编码规范 | ⭐⭐⭐ 低 | "命名约定、函数结构" |
| **PROGRESS.md** | 进度跟踪、优先级矩阵 | ⭐⭐ 低 | "第1步：基础框架（1-2天）" |

**判断标准**：
- 这个内容是"概览"还是"详细"？
  - 概览 → PROGRESS.md（一行说明）
  - 详细 → design/*.md（完整步骤）
- 这个信息是"进度"还是"设计"？
  - 进度 → PROGRESS.md（优先级、里程碑）
  - 设计 → design/*.md（技术方案、实施步骤）
- 修改一个地方能解决问题吗？
  - 否 → 可能存在重复，应该合并

**经验原则**：
- ✅ 概览在一处，详细在另一处
- ✅ 使用引用标记连接相关文档
- ✅ 每个信息只有一个权威来源
- ❌ 相同详细程度的内容出现在多处
- ❌ 需要同时更新多个文档

### 常见陷阱

**陷阱1：重复实现已有功能**

❌ **错误示例**：
```javascript
// ❌ 不要这样做：手动验证配置
function validateConfig(config) {
    if (config.port < 1 || config.port > 65535) {
        throw new Error('Invalid port');
    }
}

// ✅ 使用现有的验证器
const { validateConfig } = require('./config/validators');
validateConfig(config);
```

**检查清单**：
- [ ] 配置验证？→ 使用 `config/validators.js`
- [ ] 前端配置？→ 编辑 `config/frontend.config.js`
- [ ] AI调用？→ 使用 `AIAdapter` 类
- [ ] 流式响应？→ 扩展现有SSE实现

---

**陷阱2：修改生成文件**

❌ **错误示例**：
```javascript
// ❌ 不要编辑 public/config.js（自动生成）
window.CONFIG = {
    api: { baseUrl: '...' }
};

// ✅ 编辑 config/frontend.config.js
module.exports = {
    api: { baseUrl: '' }
};
```

**正确做法**：
- 编辑 `config/frontend.config.js`
- 运行 `npm run generate-config` 或 `npm start`（自动生成）

---

**陷阱3：忽略项目定位**

❌ **错误示例**：
```
用户："添加用户认证功能"
AI助手："建议使用JWT + MongoDB + Passport.js..."

问题：
❌ 过度设计（项目当前不需要用户认证）
❌ 引入数据库（与无数据库架构冲突）

正确做法：
✅ 先确认这是否符合项目定位
✅ 如果需要，说明这是重大架构变更
```

---

**陷阱4：不阅读现有代码**

**建议**：
1. ❌ 不要直接开始写代码
2. ✅ 先用 Grep 搜索相关功能
3. ✅ 阅读现有实现
4. ✅ 理解设计意图
5. ✅ 然后基于现有代码改进

---

**陷阱5：文档内容重复**

❌ **不要**：
- 在多个文档中维护相同详细程度的内容
- 在 PROGRESS.md 中包含详细实施步骤
- 需要同时更新多个文档

✅ **应该**：
- 概览在一处，详细在另一处
- 使用引用标记连接文档
- 每个信息只有一个权威来源

**判断标准**：
- 修改一个地方能解决问题吗？不能则可能重复
- 这是"概览"还是"详细"？概览 → PROGRESS.md，详细 → design/*.md
- 这是"进度"还是"设计"？进度 → PROGRESS.md，设计 → design/*.md