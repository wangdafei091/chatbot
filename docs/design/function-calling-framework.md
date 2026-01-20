# Function Calling 框架设计文档

> 为 AI 聊天机器人添加工具调用能力，实现智能助理功能
> **创建日期**：2026-01-15
> **状态**：✅ 已完成（2026-01-17）
> **最后更新**：2026-01-17

---

## ⚠️ 项目范围说明（2026-01-17 更新）

**实际实施范围**：
- ✅ **核心框架**：ToolRegistry + ToolExecutor（已实现）
- ✅ **AI 原生 Function Calling**：GLM-4 + DeepSeek（已实现）
- ✅ **快速开始（Aha Moment）**：3个快速开始按钮（已实现）
- ✅ **文本处理工具**：文章总结、关键信息提取（已实现）
- ✅ **天气查询工具**：wttr.in API（已实现）
- ✅ **智能引导**：AI 原生参数引导 + 参数验证（已实现）
- ✅ **用户上下文系统**：localStorage 统计（已实现）
- ❌ **不再开发**：
  - 价格对比、航班查询、任务管理、图片处理等工具
  - 用户偏好记忆、预配置引导模板等智能引导增强功能
  - 用户设置界面、个性化信息管理等用户上下文增强功能

**调整理由**：
- 保持项目轻量级定位
- 避免引入复杂的第三方 API 依赖
- 降低维护成本
- 当前功能已充分验证 Function Calling 框架的可行性
- 项目已达到预期目标

**设计文档价值**：
- 本文档保留完整的架构设计和实施思路
- 可作为未来扩展的参考（如需添加新工具）
- 核心框架部分已完全实现并验证
- 未实现的增强功能仅供参考，不再纳入开发计划

---

## ✅ 完成状态概览（2026-01-17）

| 功能模块 | 状态 | 完成时间 | 说明 |
|---------|------|----------|------|
| 核心框架（ToolRegistry + ToolExecutor） | ✅ 100% | 2026-01-15 | 工具注册和执行 |
| 快速开始（Aha Moment） | ✅ 100% | 2026-01-15 | 3个示例按钮 |
| 文本处理工具 | ✅ 100% | 2026-01-15 | 文章总结、关键信息提取 |
| AI 原生 Function Calling | ✅ 100% | 2026-01-16 | GLM-4 + DeepSeek |
| 智能引导 | ✅ 100% | 2026-01-17 | AI原生参数引导 |
| 用户上下文系统 | ✅ 100% | 2026-01-17 | localStorage统计 |
| 天气查询工具 | ✅ 100% | 2026-01-16 | wttr.in API |
| 基础错误处理 | 🟡 60% | 2026-01-15 | AppError类，ErrorHandler待实现 |

**总体进度**：✅ 100%（按项目定位）

---

## 📘 如何使用本文档

### 快速导航

```
如果你是...  →  阅读这些章节
─────────────────────────────────────────────────
项目审核人   →  1. 背景和目标 + 3.0 功能边界概览 + 5. 实施步骤
开发者       →  3. 技术方案设计 + 4. 代码结构规划 + 5. 实施步骤
实施负责人   →  3.0 功能边界概览 + 5. 实施步骤分解（按优先级）
新加入成员   →  1. 背景和目标 + 2. 功能需求分析 + docs/CONTRIBUTING.md
```

### 重要提示 ⚠️

**本文档采用"功能边界"设计，避免实施时功能相互干扰**：

1. **按功能块逐个实施**（不要同时开发多个功能）
2. **每完成一个功能块，验收后再进入下一块**
3. **优先级标识**：
   - 🔴 P0 = 必须立即完成
   - 🟡 P1 = 高优先级（基础稳定后实施）
   - 🟢 P2 = 可选（优化阶段）
4. **依赖关系**：严格遵循依赖图，不要跳级实施

### 功能模块清单

| 章节 | 功能 | 优先级 | 实施阶段 | 依赖 | 预计时间 |
|------|------|--------|----------|------|----------|
| 3.2 | 核心框架 | 🔴 P0 | 阶段 1.A | 无 | 10.5h |
| 3.3 | Aha Moment | 🔴 P0 | 阶段 1.B | 阶段 0 | 4.5h |
| 3.4.5 | 基础错误处理 | 🔴 P0 | 阶段 1.C | 无 | 2h |
| 3.4.4 | 用户上下文 | 🟡 P1 | 阶段 2.5 | 3.2 + 前端 | 4.5h |
| 3.4.3 | 智能引导 | 🟡 P1 | 阶段 2 | 3.2 | 0.5-1天 |
| 3.4.5 | 高级监控 | 🟢 P2 | 优化阶段 | 基础错误处理 | 3-4h |

### 实施顺序

```
第 0 步：阅读 1. 背景和目标 + 2. 功能需求分析
   ↓
第 1 步：阅读 3.0 功能边界概览（理解全局架构）
   ↓
第 2 步：按 5. 实施步骤分解逐个实施（按功能块）
   ↓
第 3 步：每完成一个功能块，按照验收标准检查
   ↓
第 4 步：进入下一个功能块
```

---

## 📋 目录

- [1. 背景和目标](#1-背景和目标)
- [2. 功能需求分析](#2-功能需求分析)
- [3. 技术方案设计](#3-技术方案设计)
- [4. 代码结构规划](#4-代码结构规划)
- [5. 实施步骤分解](#5-实施步骤分解)
- [6. 测试计划](#6-测试计划)
- [7. 风险评估](#7-风险评估)
- [8. 后续扩展路径](#8-后续扩展路径)

---

## 1. 背景和目标

### 1.1 背景

当前项目是一个轻量级 AI 聊天机器人，支持基础的对话功能。用户希望将其升级为智能助理，能够：

- 查询天气、商品价格、航班信息等外部数据
- 处理图片、文档等文件（如去水印、总结文章）
- 管理日常任务（待办事项、历史统计看板）
- 智能识别用户意图，主动引导交互

### 1.2 目标

**核心目标**：引入 Function Calling（工具调用）框架，让 AI 能够根据用户意图自动调用相应工具。

**设计原则**：
- ✅ **适度升级**：不重构整个架构，保持轻量级定位
- ✅ **可扩展性**：工具系统易于添加新功能
- ✅ **向后兼容**：不影响现有对话功能
- ✅ **渐进式开发**：先实现基础框架，再逐步添加工具

### 1.3 非目标

- ❌ 不引入重型框架（如 LangChain）
- ❌ 不立即实现所有规划功能（优先核心框架 + 1-2个示例工具）
- ❌ 不升级数据库架构（任务管理延后）
- ❌ 不破坏现有的流式响应机制

---

## 2. 功能需求分析

### 2.1 核心能力需求

| 能力 | 优先级 | 复杂度 | 说明 |
|------|--------|--------|------|
| **意图识别** | P0 | 🔧🔧 | AI 自动识别用户想要做什么 |
| **工具调度** | P0 | 🔧🔧🔧 | 根据意图调用相应工具函数 |
| **智能引导** | P1 | 🔧🔧 | 意图不明确时主动询问 |
| **结果整合** | P0 | 🔧🔧 | 将工具结果返回给 AI 生成回复 |
| **流式工具调用** | P1 | 🔧🔧🔧 | 工具调用过程也支持流式反馈 |

### 2.2 场景示例

#### 场景1：文章总结（无需外部 API）

```
用户：帮我把这篇文章总结一下
[粘贴文章内容]

AI 识别意图：
  → 需要调用 summarizeArticle 工具

执行工具：
  → summarizeArticle(content)
  → 返回：文章要点总结

AI 生成回复：
  → "这篇文章主要讲了..."
```

#### 场景2：天气查询（需要外部 API）

```
用户：今天北京天气怎么样？

AI 识别意图：
  → 需要调用 getWeather 工具
  → 但缺少参数：地点

AI 智能引导：
  → "请问您想查询哪个城市的天气？"

用户：北京

AI 识别意图：
  → 需要调用 getWeather 工具
  → 参数：city = "北京"

执行工具：
  → getWeather("北京")
  → 返回：{ temp: 15, condition: "晴" }

AI 生成回复：
  → "北京今天晴天，温度15℃..."
```

### 2.3 工具分类

| 工具类型 | 示例 | 依赖 | 第一阶段 |
|---------|------|------|---------|
| **文本处理** | 文章总结、关键信息提取 | AI 原生能力 | ✅ 实现 |
| **信息查询** | 天气、价格、航班 | 外部 API | 📋 后续 |
| **任务管理** | 待办事项、统计看板 | 数据存储 | 📋 延后 |
| **文件处理** | 图片去水印 | 图片处理库 | 📋 后续 |

---

## 3. 技术方案设计

### 3.0 功能边界概览 📋

**重要**：本设计文档包含多个功能模块，按实施优先级和依赖关系组织。

```
┌─────────────────────────────────────────────────────────────┐
│  Function Calling 框架 - 功能模块图                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  🔴 P0 - 阶段 1（必需，2-2.5天）                           │
│  ├─ 3.1 整体架构                        [独立，无依赖]     │
│  ├─ 3.2 核心框架（ToolRegistry + ToolExecutor）             │
│  │   ├─ 3.2.1 核心概念                                     │
│  │   ├─ 3.2.2 多模型支持（简化）                            │
│  │   └─ 3.2.3 添加新模型流程                               │
│  ├─ 3.3 用户体验（Aha Moment）           [独立，依赖阶段0]   │
│  └─ 3.4.5 基础错误处理                    [横切关注点]       │
│                                                             │
│  🟡 P1 - 阶段 2/2.5（高优先级，1.5-2天）                    │
│  ├─ 3.4.3 智能引导系统                    [依赖：3.2]        │
│  │   └─ 🔀 详细设计：smart-guidance-system.md (待创建)     │
│  └─ 3.4.4 用户上下文系统                  [依赖：3.2 + 前端] │
│      └─ 🔀 详细设计：user-context-system.md (待创建)       │
│                                                             │
│  🟢 P2 - 优化阶段（可选，3-4h）                              │
│  └─ 3.4.5 高级监控和重试                 [依赖：基础错误处理] │
│                                                             │
│  🔧 阶段 0 - 前置任务（1-2h）                                │
│  └─ 代码结构优化：index.html → index.html + styles.css + app.js │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**实施策略**：
1. ✅ **按功能块逐个实施**，不要同时开发多个功能
2. ✅ **每完成一个功能块，验收后再进入下一块**
3. ✅ **横切关注点（错误处理）最后集成**
4. ✅ **复杂功能实施前，先创建独立详细文档**

**依赖关系**：
```
阶段 0 (代码结构)
   ↓
阶段 1.1 (核心框架: ToolRegistry + ToolExecutor)
   ↓
阶段 1.2 (基础错误处理) ← 横切，影响所有功能
   ↓
阶段 1.3 (快速开始: Aha Moment)
   ↓
阶段 2.5 (用户上下文系统) ← 可选，依赖前端
   ↓
阶段 2 (智能引导系统) ← 可选，依赖核心框架
```

---

### 3.1 整体架构

```
┌─────────────────────────────────────────────────────────┐
│  前端 (public/index.html)                                │
│  ┌────────────────────────────────────────────────────┐ │
│  │  消息输入 → sendMessage()                           │ │
│  │         ↓                                          │ │
│  │  显示工具调用提示（"正在查询天气..."）              │ │
│  └────────────────────────────────────────────────────┘ │
└────────────────────┬────────────────────────────────────┘
                     │ POST /api/chat/stream
                     ▼
┌─────────────────────────────────────────────────────────┐
│  后端 (server.js)                                         │
│                                                         │
│  1️⃣ 意图识别层                                           │
│  ┌──────────────────────────────────────────────────┐  │
│  │  AI 分析用户消息 + 工具描述                        │  │
│  │  → 返回：需要调用哪个工具（或直接回复）            │  │
│  └──────────────────────────────────────────────────┘  │
│                    ↓                                    │
│  2️⃣ 工具调度中心 ⭐                                     │
│  ┌──────────────────────────────────────────────────┐  │
│  │  如果需要调用工具：                                │  │
│  │  1. 验证参数完整性                                │  │
│  │  2. 调用具体工具函数                              │  │
│  │  3. 获取工具执行结果                              │  │
│  └──────────────────────────────────────────────────┘  │
│                    ↓                                    │
│  3️⃣ 结果整合层                                           │
│  ┌──────────────────────────────────────────────────┐  │
│  │  将工具结果返回给 AI                               │  │
│  │  → AI 根据工具结果生成自然语言回复                 │  │
│  └──────────────────────────────────────────────────┘  │
│                    ↓                                    │
│  4️⃣ 流式响应层                                           │
│  ┌──────────────────────────────────────────────────┐  │
│  │  通过 SSE 逐字返回 AI 生成的回复                   │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### 3.2 Function Calling 核心框架 ✅ 已完成

> ⚠️ **实施状态**：✅ 已完成（2026-01-15）
> **实施内容**：ToolRegistry + ToolExecutor + 格式转换函数

**功能边界**：
- **实施阶段**：阶段 1.A（已完成）
- **优先级**：🔴 P0（核心框架）
- **依赖**：无依赖，可独立实施
- **输出**：ToolRegistry + ToolExecutor + 格式转换函数 ✅
- **验收**：工具调用流程完整运行 ✅

---

#### 3.2.1 核心概念

Function Calling 是一种让 AI 模型能够调用外部函数的机制：

```javascript
// 传统方式：用户 → AI → 回复
用户消息 → AI → 直接回复

// Function Calling：用户 → AI → 工具 → AI → 回复
用户消息 → AI 识别意图 → 调用工具 → AI 整合结果 → 回复
```

#### 3.2.2 多模型支持设计（简化方案）

**核心挑战**：不同AI模型的Function Calling API格式可能不一致

**实际情况分析**：

| 模型 | Function Calling 格式 | 兼容性 |
|------|----------------------|--------|
| **GLM-4** | OpenAI 兼容 | ✅ 完全兼容 |
| **DeepSeek** | OpenAI 兼容 | ✅ 完全兼容 |
| **OpenAI** | OpenAI 原生 | ✅ 标准 |
| **Claude** | 自有格式 | ⚠️ 需要转换 |

**观察结论**：
- ✅ GLM-4 和 DeepSeek 的 Function Calling API **完全兼容 OpenAI 格式**
- ✅ 当前只有 2 个模型，格式高度一致
- ❌ 完整的适配器架构可能是 **YAGNI**（You Aren't Gonna Need It）

**设计决策**：采用**渐进式方案**

---

##### 当前实现：简单的格式转换函数

```javascript
// server.js

/**
 * 将内部工具格式转换为 OpenAI 兼容格式
 * GLM-4 和 DeepSeek 都支持此格式
 *
 * @param {Array} tools - 内部工具定义数组
 * @returns {Array} OpenAI 格式的工具数组
 */
function formatToolsForAI(tools) {
  return tools.map(tool => ({
    type: 'function',
    function: {
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters
    }
  }))
}

/**
 * 解析 AI 响应，提取工具调用信息
 * 支持 GLM-4 和 DeepSeek（都兼容 OpenAI 格式）
 *
 * @param {Object} response - AI 的原始响应
 * @returns {Object} { type: 'tool_call' | 'direct_response', toolCalls?, content? }
 */
function parseAIResponse(response) {
  const choice = response.choices?.[0]
  if (!choice) {
    return { type: 'direct_response', content: '' }
  }

  const message = choice.message

  // 检查是否有工具调用
  if (message.tool_calls && message.tool_calls.length > 0) {
    return {
      type: 'tool_call',
      toolCalls: message.tool_calls.map(call => ({
        id: call.id,
        name: call.function.name,
        arguments: JSON.parse(call.function.arguments)
      }))
    }
  }

  // 直接回复
  return {
    type: 'direct_response',
    content: message.content || ''
  }
}
```

##### 在 AIAdapter 中使用

```javascript
// server.js - 扩展现有的 AIAdapter 类

class AIAdapter {
  // ... 现有代码 ...

  /**
   * 支持工具调用的聊天方法
   *
   * @param {string} provider - 'glm' | 'deepseek'
   * @param {string} message - 用户消息
   * @param {Array} history - 对话历史
   * @param {Array} tools - 工具定义（可选）
   * @returns {Promise<Object>} AI 响应
   */
  static async chatWithTools(provider, message, history = [], tools = null) {
    const API_KEY = this.getApiKey(provider)
    const messages = this.formatMessages(message, history)
    const cfg = config.ai[provider]

    // 构建请求
    const requestBody = {
      model: cfg.model,
      messages: messages,
      temperature: cfg.temperature,
      max_tokens: cfg.max_tokens
    }

    // 如果有工具，添加工具定义（OpenAI 格式）
    if (tools && tools.length > 0) {
      requestBody.tools = formatToolsForAI(tools)
      // 工具调用模式不返回内容，需要调用工具
      requestBody.tool_choice = 'auto'
    }

    try {
      const response = await this.callAPI(provider, requestBody, cfg)
      return parseAIResponse(response)
    } catch (error) {
      console.error(`${provider} API Error:`, error.response?.data || error.message)
      throw new Error(`${provider} API 调用失败: ${error.response?.data?.error?.message || error.message}`)
    }
  }

  /**
   * 调用 API 的底层方法（复用现有逻辑）
   */
  static async callAPI(provider, requestBody, cfg) {
    const API_KEY = this.getApiKey(provider)
    const url = this.getAPIUrl(provider) // 获取 API URL

    const response = await axios.post(url, requestBody, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: cfg.timeout
    })

    return response.data
  }

  /**
   * 获取 API URL（新增辅助方法）
   */
  static getAPIUrl(provider) {
    const urls = {
      glm: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
      deepseek: 'https://api.deepseek.com/v1/chat/completions'
      // 未来添加：
      // openai: 'https://api.openai.com/v1/chat/completions'
    }
    return urls[provider]
  }
}
```

---

##### 未来重构路径：如果接入差异大的模型

**触发条件**：
- 接入第 3 个模型（如 Claude）且格式差异大
- 或者模型数量 > 3 个

**重构方案**：引入适配器模式

```javascript
// 未来如果需要，可以这样重构：

class ModelAdapter {
  formatTools(tools) { throw new Error('子类必须实现') }
  parseResponse(response) { throw new Error('子类必须实现') }
}

class GLMAdapter extends ModelAdapter {
  formatTools(tools) { /* GLM 特定逻辑 */ }
  parseResponse(response) { /* GLM 特定逻辑 */ }
}

class ClaudeAdapter extends ModelAdapter {
  formatTools(tools) {
    // Claude 使用不同的格式
    return tools.map(tool => ({
      name: tool.name,
      description: tool.description,
      input_schema: tool.parameters
    }))
  }
  // ...
}

const modelAdapters = {
  glm: new GLMAdapter(),
  deepseek: new GLMAdapter(), // 共享相同的适配器（因为格式相同）
  claude: new ClaudeAdapter()
}
```

**重构成本估算**：2-3 小时
- 提取现有函数到适配器类
- 更新调用代码
- 测试所有模型

---

##### 设计原则总结

| 原则 | 当前实现 | 未来重构 |
|------|----------|----------|
| **YAGNI** | ✅ 只实现当前需要的功能 | 需要时再重构 |
| **简单性** | ✅ 2 个格式转换函数 | 适配器类（4个方法） |
| **可扩展性** | ⚠️ 接入新模型需修改代码 | ✅ 只需添加新适配器 |
| **维护成本** | ✅ 低（简单函数） | ⚠️ 中（类继承） |

**建议**：
- ✅ **当前使用简单函数**（推荐）
- ⏸️ **预留重构路径**（文档说明如何重构）
- 🔜 **按需重构**（接入差异大的模型时）

---

##### 多模型扩展时间估算

| 场景 | 复杂度 | 预计时间 | 说明 |
|------|--------|----------|------|
| **接入 OpenAI** | 🔧 简单 | 0.5小时 | 格式完全兼容 |
| **接入兼容 OpenAI 的模型** | 🔧 简单 | 0.5小时 | 复用现有逻辑 |
| **接入 Claude** | 🔧🔧 中等 | 2-3小时 | 需要格式转换 |
| **重构为适配器架构** | 🔧🔧🔧 中等 | 2-3小时 | 如果模型数 > 3 |

**结论**：当前使用简单函数即可，未来根据需要重构。

---

#### 3.2.3 添加新模型的流程

**当前方案（简单函数）**：

| 步骤 | 任务 | 预计时间 |
|------|------|----------|
| 1 | 在 `.env` 添加新模型的 API_KEY | 2分钟 |
| 2 | 在 `config.js` 添加配置对象 | 5分钟 |
| 3 | 在 `getAPIUrl()` 添加 URL 映射 | 1分钟 |
| 4 | 测试新模型 | 10分钟 |

**代码示例**：

```javascript
// .env
NEWMODEL_API_KEY=your_api_key

// config.js
ai: {
  newmodel: {
    model: process.env.NEWMODEL_MODEL || 'newmodel-chat',
    temperature: parseFloat(process.env.NEWMODEL_TEMPERATURE) || 0.7,
    max_tokens: parseInt(process.env.NEWMODEL_MAX_TOKENS) || 2000,
    timeout: parseInt(process.env.NEWMODEL_TIMEOUT) || 30000
  }
}

// server.js - getAPIUrl()
static getAPIUrl(provider) {
  const urls = {
    glm: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
    deepseek: 'https://api.deepseek.com/v1/chat/completions',
    newmodel: 'https://api.newmodel.com/v1/chat/completions'  // 新增
  }
  return urls[provider]
}
```

**总时间**：**20 分钟**（如果模型兼容 OpenAI 格式）

**未来方案（适配器架构）**：如果接入格式差异大的模型（如 Claude），重构后：
- 创建新的适配器类（10-15分钟）
- 注册适配器（1行代码）
- 测试（5分钟）

---

#### 3.2.4 意图识别机制

**方案**：让 AI 根据工具描述自动识别意图

```javascript
// 发送给 AI 的请求
const response = await ai.chat({
  messages: [
    { role: 'user', content: '帮我把这篇文章总结一下' }
  ],
  tools: getAllToolDefinitions()  // 告诉 AI 有哪些可用工具
})

// AI 返回
{
  tool_calls: [{
    function: {
      name: 'summarizeArticle',
      arguments: '{"content": "..."}'
    }
  }]
}
```

**优点**：
- ✅ 无需训练模型
- ✅ 自动适配新工具
- ✅ 理解自然语言能力强

**参数完整性检查**：

AI 识别意图后，可能缺少必需参数：

```javascript
// 示例：用户说"查询天气"但没说城市
AI 返回：
{
  tool_calls: [{
    function: {
      name: 'getWeather',
      arguments: '{}'  // 缺少 city 参数
    }
  }]
}

// 服务器端检查
if (!arguments.city) {
  // 返回给 AI："参数不完整，请询问用户城市"
  // AI 生成："请问您想查询哪个城市的天气？"
}
```

**策略**：
1. 检查必需参数是否完整
2. 如果不完整，让 AI 主动询问
3. 如果完整，执行工具调用

---

### 3.2.5 核心组件：工具注册表（ToolRegistry）

#### 职责
- 注册和管理所有可用工具
- 提供工具定义（供 AI 调用）
- 参数验证
- 工具执行

#### 接口设计

```javascript
// server.js

/**
 * 工具注册表类
 */
class ToolRegistry {
  constructor() {
    this.tools = new Map()  // 工具存储：name -> { definition, handler }
  }

  /**
   * 注册工具
   * @param {string} name - 工具名称
   * @param {Object} definition - 工具定义（发送给 AI）
   * @param {Function} handler - 工具执行函数（服务器端）
   */
  registerTool(name, definition, handler) {
    // 验证工具定义
    this.validateDefinition(definition)

    // 存储工具
    this.tools.set(name, { definition, handler })

    console.log(`[ToolRegistry] 工具已注册: ${name}`)
  }

  /**
   * 获取所有工具定义（用于发送给 AI）
   * @returns {Array} 工具定义数组
   */
  getToolDefinitions() {
    return Array.from(this.tools.values()).map(item => item.definition)
  }

  /**
   * 执行工具
   * @param {string} name - 工具名称
   * @param {Object} arguments - 工具参数
   * @returns {Promise<Object>} 工具执行结果
   */
  async executeTool(name, args) {
    const tool = this.tools.get(name)

    if (!tool) {
      throw new Error(`工具不存在: ${name}`)
    }

    // 验证参数
    this.validateArguments(name, args, tool.definition)

    // 执行工具
    try {
      const result = await tool.handler(args)
      return { success: true, data: result }
    } catch (error) {
      console.error(`[ToolRegistry] 工具执行失败: ${name}`, error)
      return { success: false, error: error.message }
    }
  }

  /**
   * 验证工具定义
   */
  validateDefinition(definition) {
    if (!definition.name || typeof definition.name !== 'string') {
      throw new Error('工具定义必须包含 name 字段')
    }
    if (!definition.description || typeof definition.description !== 'string') {
      throw new Error('工具定义必须包含 description 字段')
    }
    if (!definition.parameters || !definition.parameters.type) {
      throw new Error('工具定义必须包含 parameters 对象')
    }
  }

  /**
   * 验证工具参数
   */
  validateArguments(name, args, definition) {
    const required = definition.parameters.required || []
    const properties = definition.parameters.properties || {}

    // 检查必需参数
    for (const param of required) {
      if (!(param in args)) {
        throw new Error(`缺少必需参数: ${param}`)
      }
    }

    // 检查参数类型
    for (const [key, value] of Object.entries(args)) {
      const prop = properties[key]
      if (prop) {
        // 基本类型检查
        if (prop.type === 'string' && typeof value !== 'string') {
          throw new Error(`参数 ${key} 必须是字符串`)
        }
        if (prop.type === 'number' && typeof value !== 'number') {
          throw new Error(`参数 ${key} 必须是数字`)
        }
        if (prop.type === 'array' && !Array.isArray(value)) {
          throw new Error(`参数 ${key} 必须是数组`)
        }
      }
    }
  }

  /**
   * 检查工具是否存在
   */
  hasTool(name) {
    return this.tools.has(name)
  }

  /**
   * 获取工具信息
   */
  getTool(name) {
    return this.tools.get(name)
  }
}
```

#### 使用示例

```javascript
// 创建全局工具注册表
const toolRegistry = new ToolRegistry()

// 注册工具
toolRegistry.registerTool(
  'summarizeArticle',
  {
    type: 'function',
    function: {
      name: 'summarizeArticle',
      description: '总结文章的关键信息，提取主要观点',
      parameters: {
        type: 'object',
        properties: {
          content: {
            type: 'string',
            description: '文章内容'
          }
        },
        required: ['content']
      }
    }
  },
  async (args) => {
    // 工具实现
    const summary = await summarizeText(args.content)
    return { summary }
  }
)
```

---

### 3.2.6 核心组件：工具执行器（ToolExecutor）

#### 职责
- 协调 AI 和工具调用的交互
- 处理多轮对话（AI → 工具 → AI → 用户）
- 管理对话历史和工具调用上下文
- 流式响应支持

#### 接口设计

```javascript
// server.js

/**
 * 工具执行器类
 */
class ToolExecutor {
  constructor(toolRegistry, aiAdapter) {
    this.toolRegistry = toolRegistry
    this.aiAdapter = aiAdapter
  }

  /**
   * 处理用户消息（支持工具调用）
   *
   * @param {string} message - 用户消息
   * @param {Array} history - 对话历史
   * @param {string} provider - AI 模型提供商
   * @param {Function} onData - 流式数据回调
   * @param {Function} onComplete - 完成回调
   * @returns {Promise<string>} AI 回复
   */
  async processMessage(message, history, provider, onData, onComplete) {
    const tools = this.toolRegistry.getToolDefinitions()

    // 第一轮：调用 AI，可能返回工具调用请求
    const response1 = await this.aiAdapter.chatWithTools(
      provider,
      message,
      history,
      tools.length > 0 ? tools : null
    )

    // 如果 AI 要求调用工具
    if (response1.type === 'tool_call') {
      // 发送工具调用提示（流式）
      if (onData) {
        onData(`\n\n🔧 正在调用工具：${response1.toolCalls[0].name}...\n\n`)
      }

      // 执行工具
      const toolResults = []
      for (const call of response1.toolCalls) {
        const result = await this.toolRegistry.executeTool(call.name, call.arguments)
        toolResults.push({
          toolCallId: call.id,
          name: call.name,
          result: result
        })
      }

      // 构建新的对话历史（包含工具调用和结果）
      const newHistory = [
        ...history,
        { role: 'user', content: message },
        { role: 'assistant', content: null, tool_calls: response1.toolCalls },
        ...toolResults.map(r => ({
          role: 'tool',
          tool_call_id: r.toolCallId,
          name: r.name,
          content: JSON.stringify(r.result)
        }))
      ]

      // 第二轮：将工具结果返回给 AI，生成最终回复
      const response2 = await this.aiAdapter.chatWithTools(
        provider,
        null,  // 没有新的用户消息
        newHistory,
        null   // 不需要工具定义
      )

      if (onComplete) onComplete()
      return response2.content
    }

    // 直接回复（无工具调用）
    if (onComplete) onComplete()
    return response1.content
  }
}
```

---

### 3.4 高级功能 🟡 P1

#### 3.4.1 智能引导系统设计 ✅ 已完成

> ⚠️ **实施状态**：✅ 已完成（2026-01-17）
> **实际实施范围**：AI原生参数引导 + 参数验证模块
> **不再开发**：预配置引导模板、用户偏好记忆、GuidanceHandler类（保持项目轻量级定位）

**功能边界**：
- **实施阶段**：阶段 2（已完成）
- **优先级**：🟡 P1（高优先级，但不是 P0）
- **依赖**：3.2 核心框架（ToolExecutor）
- **输出**：AI原生参数引导 + 参数验证模块
- **验收**：参数不完整时 AI 主动询问 ✅
- **实际实现**：使用 GLM/DeepSeek API 自带的参数引导功能

---

##### 核心挑战

当用户意图明确但缺少必需参数时，如何友好地引导用户提供信息？

##### 方案对比

| 方案 | 优点 | 缺点 | 选择 |
|------|------|------|------|
| **预配置话术模板** | 可控、一致性好 | 不够灵活、维护成本高 | ❌ |
| **AI 动态生成** | 自然、灵活、上下文感知 | 不可控、可能不精确 | ✅ |
| **混合方案** | 兼顾灵活性和可控性 | 略复杂 | ✅✅ **推荐** |

##### 推荐方案：AI 动态生成 + 可选模板

**实现策略**：
1. **优先使用 AI 动态生成**（保持灵活性）
2. **提供可选的引导提示配置**（关键场景）
3. **上下文感知**（记住用户之前说过的话）

##### 实现细节

**1. 工具定义时添加引导提示**

```javascript
// tools/weather-tools.js

const getWeatherTool = {
  name: 'getWeather',
  description: '获取指定城市的天气信息',
  parameters: {
    type: 'object',
    properties: {
      city: {
        type: 'string',
        description: '城市名称，例如：北京、上海、深圳'
      }
    },
    required: ['city']
  },

  // ⭐ 新增：智能引导配置
  guidance: {
    // 缺失参数时的引导提示（可选，用于关键场景）
    prompts: {
      city: {
        template: '请问您想查询哪个城市的天气？',
        examples: ['北京', '上海', '深圳', '广州'],
        hint: '可以输入中国任意城市的名称'
      }
    },

    // 多轮对话上下文提示
    context: {
      rememberPrevious: true,  // 记住用户之前的偏好
      suggestFromHistory: true  // 从历史记录中建议
    }
  }
}
```

**2. 智能引导处理器**

```javascript
// server.js

/**
 * 智能引导处理器
 */
class GuidanceHandler {
  constructor() {
    this.contextMemory = new Map()  // 记住用户偏好
  }

  /**
   * 生成引导提示
   * @param {string} toolName - 工具名称
   * @param {Object} missingParams - 缺失的参数
   * @param {Array} history - 对话历史
   * @param {Object} toolConfig - 工具配置
   * @returns {string} 引导提示
   */
  async generateGuidance(toolName, missingParams, history, toolConfig) {
    const guidance = toolConfig.guidance

    // 1. 检查是否有预配置的模板
    if (guidance && guidance.prompts) {
      return this.useTemplateGuidance(missingParams, guidance, history)
    }

    // 2. 使用 AI 动态生成
    return await this.useAIGuidance(toolName, missingParams, history, toolConfig)
  }

  /**
   * 使用预配置模板（关键场景）
   */
  useTemplateGuidance(missingParams, guidance, history) {
    const prompts = []

    for (const param of Object.keys(missingParams)) {
      const config = guidance.prompts[param]

      if (config) {
        // 使用模板
        prompts.push(config.template)

        // 添加示例
        if (config.examples && config.examples.length > 0) {
          prompts.push(`例如：${config.examples.join('、')}`)
        }

        // 添加提示
        if (config.hint) {
          prompts.push(`提示：${config.hint}`)
        }
      }
    }

    return prompts.join('\n')
  }

  /**
   * 使用 AI 动态生成（灵活场景）
   */
  async useAIGuidance(toolName, missingParams, history, toolConfig) {
    const missingList = Object.keys(missingParams).join('、')

    const prompt = `
用户想要使用 ${toolName} 功能，但缺少以下参数：${missingList}

工具说明：${toolConfig.description}

请自然地询问用户这些参数的值，要求：
1. 友好、自然
2. 简洁明了
3. 如果可能，提供示例
4. 保持对话的连贯性

对话历史：
${this.formatHistory(history)}
`

    // 调用 AI 生成引导提示
    const response = await aiAdapter.chat({
      message: prompt,
      history: [],
      provider: 'glm'  // 使用便宜的模型
    })

    return response.content
  }

  /**
   * 格式化对话历史（用于上下文感知）
   */
  formatHistory(history) {
    // 最近3轮对话
    return history.slice(-6).map(msg => {
      return `${msg.role}: ${msg.content}`
    }).join('\n')
  }

  /**
   * 从历史记录中建议参数值
   */
  suggestFromHistory(paramName, history) {
    // 查找用户之前提供的值
    const suggestions = []

    for (const msg of history) {
      if (msg.role === 'user') {
        // 简单的匹配逻辑（可以更复杂）
        if (paramName === 'city' && msg.content.includes('市')) {
          suggestions.push(msg.content)
        }
      }
    }

    return suggestions
  }

  /**
   * 记住用户偏好（用于后续对话）
   */
  rememberPreference(userId, paramName, value) {
    if (!this.contextMemory.has(userId)) {
      this.contextMemory.set(userId, new Map())
    }

    this.contextMemory.get(userId).set(paramName, value)
  }

  /**
   * 获取用户偏好
   */
  getPreference(userId, paramName) {
    const userContext = this.contextMemory.get(userId)
    return userContext ? userContext.get(paramName) : null
  }
}
```

**3. ToolExecutor 集成智能引导**

```javascript
class ToolExecutor {
  constructor(toolRegistry, aiAdapter) {
    this.toolRegistry = toolRegistry
    this.aiAdapter = aiAdapter
    this.guidanceHandler = new GuidanceHandler()  // ⭐ 新增
  }

  async processMessage(message, history, provider) {
    const modelAdapter = getModelAdapter(provider)
    const tools = this.toolRegistry.getToolDefinitions()

    // 第1轮：意图识别
    const request = modelAdapter.buildRequest(history, tools, {
      model: config.ai[provider].model,
      temperature: config.ai[provider].temperature
    })

    const response = await this.aiAdapter.chat(provider, request)
    const parsed = modelAdapter.parseResponse(response)

    if (parsed.type === 'tool_call') {
      return await this.executeToolCall(
        parsed.toolCalls,
        message,
        history,
        provider,
        modelAdapter
      )
    }

    return parsed
  }

  async executeToolCall(toolCalls, message, history, provider, modelAdapter) {
    const results = []

    for (const call of toolCalls) {
      const { name, arguments: args } = call.function
      const argsObj = typeof args === 'string' ? JSON.parse(args) : args

      // 检查参数完整性
      const validation = this.toolRegistry.validateParameters(name, argsObj)

      if (!validation.valid) {
        // ⭐ 使用智能引导处理器
        return await this.provideGuidance(
          name,
          validation.missing,
          argsObj,
          message,
          history,
          provider
        )
      }

      // 执行工具
      const result = await this.toolRegistry.executeTool(name, argsObj)
      results.push({ name, result })
    }

    // 第2轮：结果整合
    return await this.generateResponse(message, history, results, provider)
  }

  /**
   * 提供智能引导
   */
  async provideGuidance(toolName, missingParam, argsObj, message, history, provider) {
    const toolConfig = this.toolRegistry.getToolConfig(toolName)

    // ⭐ 生成引导提示
    const guidance = await this.guidanceHandler.generateGuidance(
      toolName,
      { [missingParam]: true },
      history,
      toolConfig
    )

    return {
      type: 'guidance',
      content: guidance,
      toolName: toolName,
      missingParam: missingParam
    }
  }
}
```

##### 多参数缺失的处理

**场景**：用户说"查询天气"，但缺少城市和日期

```javascript
// 策略1：逐个询问（推荐）
AI: "请问您想查询哪个城市的天气？"
用户: "北京"
AI: "好的，想查询哪一天的天气？（今天、明天、还是具体日期？）"
用户: "明天"
// 执行工具

// 策略2：一次性询问所有参数
AI: "请问您想查询哪个城市、哪一天的天气？例如：北京明天的天气"
// 缺点：用户可能遗漏部分信息
```

**实现**：

```javascript
// 参数验证时返回所有缺失参数
validateParameters(toolName, args) {
  const tool = this.tools.get(toolName)
  const required = tool.definition.parameters.required || []
  const missing = []

  for (const param of required) {
    if (!(param in args) || !args[param]) {
      missing.push(param)
    }
  }

  if (missing.length > 0) {
    // 返回第一个缺失参数（逐个询问）
    return {
      valid: false,
      missing: missing[0],  // 只返回第一个
      allMissing: missing   // 保存所有缺失信息
    }
  }

  return { valid: true }
}
```

##### 前端显示优化

```javascript
// public/index.html

function showGuidanceMessage(guidance) {
  // 显示引导提示（不同于普通消息）
  const guidanceDiv = document.createElement('div')
  guidanceDiv.className = 'message guidance'
  guidanceDiv.innerHTML = `
    <div class="guidance-icon">💡</div>
    <div class="guidance-content">
      <div class="guidance-text">${escapeHtml(guidance.content)}</div>
      ${guidance.examples ? `
        <div class="guidance-examples">
          例如：
          ${guidance.examples.map(ex =>
            `<button class="example-btn" onclick="fillInput('${ex}')">${ex}</button>`
          ).join('')}
        </div>
      ` : ''}
    </div>
  `

  messagesContainer.appendChild(guidanceDiv)
}
```

##### 配置示例

```javascript
// config/guidance.config.js（可选，用于复杂场景）

module.exports = {
  // 天气工具引导配置
  getWeather: {
    city: {
      template: '请问您想查询哪个城市的天气？',
      examples: ['北京', '上海', '深圳', '杭州'],
      hint: '可以输入中国任意主要城市的名称',
      // 从历史记录中学习
      learnFromHistory: true
    },
    date: {
      template: '想查询哪一天的天气？',
      examples: ['今天', '明天', '后天', '本周五'],
      hint: '可以输入"今天"、"明天"或具体日期',
      defaultValue: 'today'  // 默认值
    }
  },

  // 价格查询工具引导配置
  comparePrice: {
    product: {
      template: '请问您想查询哪个商品的价格？',
      examples: ['iPhone 15', '小米14', 'MacBook Pro'],
      hint: '可以输入商品名称或型号',
      // 支持模糊匹配
      fuzzyMatch: true
    }
  }
}
```

##### 不使用模板的场景

大多数场景下，不需要配置模板，让 AI 动态生成即可：

```javascript
// 工具定义（不配置 guidance）
const summarizeArticleTool = {
  name: 'summarizeArticle',
  description: '总结文章的关键信息',
  parameters: {
    type: 'object',
    properties: {
      content: {
        type: 'string',
        description: '文章内容'
      }
    },
    required: ['content']
  }
  // 不配置 guidance，让 AI 动态生成
}

// 用户："帮我总结一下"
// AI 生成："请问您想总结哪篇文章？可以把文章内容发给我。"
```

##### 总结

**实现方式**：
- ✅ **默认**：使用 AI 动态生成（灵活、自然）
- ✅ **可选**：配置模板（关键场景、品牌一致性）
- ✅ **上下文感知**：记住用户偏好
- ✅ **逐个询问**：多参数时逐个引导（避免遗漏）

**是否需要配置模板？**
- ❌ **不需要**：大多数场景用 AI 动态生成即可
- ✅ **可选**：高频场景（天气查询）可以配置模板提升体验

**配置模板的好处**：
- 可控性强
- 一致性好
- 可以添加示例按钮（快速输入）

**AI 动态生成的好处**：
- 灵活自然
- 零维护成本
- 上下文感知

---

#### 3.4.2 用户上下文系统（个性化支持） ✅ 已完成

> ⚠️ **实施状态**：✅ 已完成（2026-01-17）
> **实际实施范围**：localStorage统计（使用次数、偏好排序）
> **不再开发**：用户设置界面、个性化信息管理、个性化工具调用（保持项目轻量级定位）

**功能边界**：
- **实施阶段**：阶段 2.5（已完成）
- **优先级**：🟡 P1（高优先级，但不是 P0）
- **依赖**：3.2 核心框架 + 前端（localStorage）
- **输出**：UserContext 模块（客户端）+ 使用统计
- **验收**：用户使用次数统计正常，偏好功能排序正常 ✅
- **实际实现**：基于 localStorage 的轻量级统计
- **架构决策**：不使用 req.session（符合无数据库定位）

---

##### 核心挑战

用户提到"糖尿病患者发送检查报告"的场景，暴露了当前设计的一个关键问题：

> **如何让 AI 了解用户背景，提供个性化的服务？**

##### 场景分析

**场景**：糖尿病患者发送全血检查报告

**用户期望**：
- 重点关注异常指标
- 关注与糖尿病相关的指标（血糖、糖化血红蛋白等）
- 提供针对性的健康建议
- 而不是天马行空地总结

**当前设计的问题**：
- ❌ AI 不知道用户的健康状况
- ❌ 工具调用时没有传递用户上下文
- ❌ 总结是通用的，缺乏针对性

---

##### 解决方案：客户端管理的用户上下文系统

**关键决策**：使用 **localStorage** 完全客户端管理，不使用服务器端会话

```
┌─────────────────────────────────────────────────┐
│  用户上下文系统架构（无数据库方案）              │
├─────────────────────────────────────────────────┤
│  1. 客户端存储（localStorage）                  │
│     ├─ 用户画像：健康状况、关注点               │
│     ├─ 偏好设置：详细程度、术语使用             │
│     └─ 无需登录，浏览器本地存储                 │
│                                                 │
│  2. 前端传递                                   │
│     ├─ 每次请求携带用户上下文                   │
│     └─ 作为普通参数发送给服务器                 │
│                                                 │
│  3. 无状态服务器                               │
│     ├─ 不存储用户会话                           │
│     ├─ 不使用 req.session                       │
│     └─ 符合轻量级、无数据库定位                 │
│                                                 │
│  4. 工具参数增强                                │
│     └─ 工具接收用户上下文参数                   │
└─────────────────────────────────────────────────┘
```

**为什么不使用 req.session？**
- ❌ `req.session` 需要 session store（如 Redis、MemoryStore）
- ❌ 违背项目"无数据库"定位
- ❌ 增加服务器复杂度和状态管理
- ✅ **客户端 localStorage**：零成本、零运维、隐私保护

---

##### 实现设计

**1. 前端：用户上下文管理（public/app.js）**

```javascript
/**
 * 用户上下文管理器（客户端）
 */
class UserContextManager {
  constructor() {
    this.storageKey = 'user_context'
    this.context = this.load()
  }

  /**
   * 加载用户上下文
   */
  load() {
    const stored = localStorage.getItem(this.storageKey)
    if (stored) {
      return JSON.parse(stored)
    }

    // 默认上下文
    return {
      profile: {
        // 健康状况（疾病史）
        healthConditions: [],  // ['糖尿病', '高血压']

        // 关注点（优先级）
        focusAreas: [],  // ['血糖', '糖化血红蛋白', '血压']

        // 偏好设置
        preferences: {
          detailLevel: 'medium',  // 'simple', 'medium', 'detailed'
          useTerminology: 'balanced'  // 'plain', 'balanced', 'professional'
        }
      },
      lastUpdated: Date.now()
    }
  }

  /**
   * 保存用户上下文
   */
  save() {
    this.context.lastUpdated = Date.now()
    localStorage.setItem(this.storageKey, JSON.stringify(this.context))
  }

  /**
   * 获取用户上下文（用于发送给服务器）
   */
  getContext() {
    return this.context.profile
  }

  /**
   * 更新健康状况
   */
  updateHealthConditions(conditions) {
    this.context.profile.healthConditions = conditions
    this.save()
  }

  /**
   * 更新关注点
   */
  updateFocusAreas(areas) {
    this.context.profile.focusAreas = areas
    this.save()
  }

  /**
   * 更新偏好设置
   */
  updatePreferences(preferences) {
    Object.assign(this.context.profile.preferences, preferences)
    this.save()
  }

  /**
   * 清除用户上下文
   */
  clear() {
    localStorage.removeItem(this.storageKey)
    this.context = this.load()
  }
}

// 全局实例
const userContextManager = new UserContextManager()
```

**2. 前端：发送消息时携带用户上下文**

```javascript
/**
 * 发送消息（携带用户上下文）
 */
async function sendMessage(message) {
  const userContext = userContextManager.getContext()

  const response = await fetch('/api/chat/stream', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: message,
      provider: currentProvider,
      userContext: userContext  // ⭐ 携带用户上下文
    })
  })

  // ...
}
```

**3. 后端：工具参数增强**

```javascript
// tools/text-tools.js

/**
 * 文章总结工具（支持个性化）
 */
const summarizeArticleTool = {
  name: 'summarizeArticle',
  description: '总结文章的关键信息，可根据用户健康状况提供针对性总结',
  parameters: {
    type: 'object',
    properties: {
      content: {
        type: 'string',
        description: '文章内容'
      },
      // ⭐ 新增：用户上下文（可选）
      userContext: {
        type: 'object',
        description: '用户上下文信息（可选，用于个性化）',
        properties: {
          healthConditions: {
            type: 'array',
            items: { type: 'string' },
            description: '用户健康状况（如["糖尿病", "高血压"]）'
          },
          focusAreas: {
            type: 'array',
            items: { type: 'string' },
            description: '特别关注的指标（如["血糖", "血压"]）'
          }
        }
      }
    }
  },
  required: ['content']  // userContext 不是必需的
}

/**
 * 工具实现（支持个性化）
 */
const summarizeArticleHandler = async (params) => {
  const { content, userContext } = params

  // 构建基础提示词
  let prompt = '请总结这篇文章的关键信息。'

  // ⭐ 如果有用户上下文，个性化提示词
  if (userContext) {
    if (userContext.healthConditions && userContext.healthConditions.length > 0) {
      prompt += `\n\n用户健康状况：${userContext.healthConditions.join('、')}`
    }

    if (userContext.focusAreas && userContext.focusAreas.length > 0) {
      prompt += `\n\n请特别关注以下指标：${userContext.focusAreas.join('、')}`
    }

    prompt += `\n\n请根据用户的健康状况，重点分析与疾病相关的异常指标，并提供针对性的建议。`
  }

  // 调用 AI 进行总结
  const summary = await callAIForSummary(content, prompt)

  return {
    summary: summary,
    personalized: !!userContext  // 标记是否为个性化总结
  }
}
```

**4. 后端：API 接口支持用户上下文**

```javascript
// server.js

/**
 * 聊天接口（支持用户上下文）
 */
app.post('/api/chat/stream', async (req, res) => {
  const { message, provider, userContext } = req.body  // ⭐ 接收用户上下文

  // ... 现有逻辑

  // 传递用户上下文给 ToolExecutor
  const response = await toolExecutor.processMessage(
    message,
    history,
    provider,
    userContext  // ⭐ 传递用户上下文
  )

  // ...
})
```

**5. ToolExecutor 传递用户上下文**

```javascript
class ToolExecutor {
  async processMessage(message, history, provider, userContext = null) {
    // ...

    if (parsed.type === 'tool_call') {
      return await this.executeToolCall(
        parsed.toolCalls,
        userContext  // ⭐ 传递用户上下文
      )
    }

    return parsed
  }

  async executeToolCall(toolCalls, userContext = null) {
    const results = []

    for (const call of toolCalls) {
      const { name, arguments: args } = call.function
      const argsObj = typeof args === 'string' ? JSON.parse(args) : args

      // ⭐ 注入用户上下文
      const enhancedArgs = {
        ...argsObj,
        userContext: userContext || undefined
      }

      // 执行工具
      const result = await this.toolRegistry.executeTool(name, enhancedArgs)
      results.push({ name, result })
    }

    return results
  }
}
```

**6. 前端：用户设置界面**

```javascript
// public/app.js

/**
 * 显示用户设置
 */
function showUserSettings() {
  const profile = userContextManager.getContext()

  const settingsHTML = `
    <div class="user-settings">
      <h3>⚙️ 个人信息设置</h3>

      <div class="setting-group">
        <label>健康状况</label>
        <input type="text" id="healthConditions"
               value="${profile.healthConditions.join(', ')}"
               placeholder="例如：糖尿病、高血压">
        <small>多个状况用逗号分隔</small>
      </div>

      <div class="setting-group">
        <label>重点关注指标</label>
        <input type="text" id="focusAreas"
               value="${profile.focusAreas.join(', ')}"
               placeholder="例如：血糖、血压、心率">
        <small>多个指标用逗号分隔</small>
      </div>

      <div class="setting-group">
        <label>详细程度</label>
        <select id="detailLevel">
          <option value="simple" ${profile.preferences.detailLevel === 'simple' ? 'selected' : ''}>简洁</option>
          <option value="medium" ${profile.preferences.detailLevel === 'medium' ? 'selected' : ''}>适中</option>
          <option value="detailed" ${profile.preferences.detailLevel === 'detailed' ? 'selected' : ''}>详细</option>
        </select>
      </div>

      <div class="setting-actions">
        <button onclick="saveUserSettings()">保存设置</button>
        <button onclick="clearUserSettings()">清除</button>
      </div>
    </div>
  `

  showModal(settingsHTML)
}

/**
 * 保存用户设置
 */
function saveUserSettings() {
  const healthConditions = document.getElementById('healthConditions').value
    .split(',')
    .map(s => s.trim())
    .filter(s => s)

  const focusAreas = document.getElementById('focusAreas').value
    .split(',')
    .map(s => s.trim())
    .filter(s => s)

  const detailLevel = document.getElementById('detailLevel').value

  // 保存到 localStorage
  userContextManager.updateHealthConditions(healthConditions)
  userContextManager.updateFocusAreas(focusAreas)
  userContextManager.updatePreferences({ detailLevel })

  alert('✅ 设置已保存！')

  closeModal()
}

/**
 * 清除用户设置
 */
function clearUserSettings() {
  if (confirm('确定要清除所有个人设置吗？')) {
    userContextManager.clear()
    alert('✅ 设置已清除！')
    closeModal()
  }
}
```

---

##### 实际效果对比

**场景**：糖尿病患者发送全血检查报告

**没有用户上下文**：
```
AI: 这份报告包含了血常规、生化检查等20项指标。
大部分指标在正常范围内，血糖略高，
建议注意饮食控制...
```

**有用户上下文**（用户设置了"糖尿病" + 关注"血糖、血压"）：
```
AI: 作为糖尿病患者，您需要特别关注以下指标：

🔴 异常指标：
1. 空腹血糖：7.2 mmol/L（偏高，参考值：3.9-6.1）
2. 糖化血红蛋白：7.5%（偏高，参考值：4-6%）
3. 尿微量白蛋白：45 mg/L（偏高，可能提示早期肾损伤）

✅ 正常指标：
- 血压、血脂等指标正常

建议：
1. 血糖控制不理想，建议咨询医生调整用药
2. 注意监测肾功能（尿微量白蛋白偏高）
3. 饮食控制：减少碳水化合物摄入
4. 适度运动，有助于血糖控制

下次检查建议：3个月后复查糖化血红蛋白
```

---

##### 优势分析

| 方面 | 客户端 localStorage | 服务器端 session |
|------|-------------------|-----------------|
| **数据库依赖** | ✅ 无 | ❌ 需要 Redis/MemoryStore |
| **服务器状态** | ✅ 无状态 | ❌ 有状态 |
| **复杂度** | ✅ 简单 | ❌ 复杂 |
| **部署成本** | ✅ 零成本 | ❌ 需要额外资源 |
| **跨设备同步** | ❌ 不支持 | ✅ 支持 |
| **隐私保护** | ✅ 数据不离开设备 | ❌ 数据在服务器 |

**符合项目定位**：
- ✅ 轻量级
- ✅ 无数据库
- ✅ 快速部署
- ✅ 隐私保护

---

##### 实施优先级

| 阶段 | 任务 | 优先级 | 预计时间 | 说明 |
|------|------|--------|----------|------|
| **阶段 2.5** | 基础用户上下文框架 | 🟡 P1 | 2h | localStorage + 前端管理 |
| 阶段 2.5 | 工具参数增强 | 🟡 P1 | 1h | 支持可选的 userContext 参数 |
| 阶段 2.5 | 简单设置界面 | 🟡 P1 | 1.5h | 健康状况、关注点、详细程度 |
| **阶段 3+** | 智能学习（从对话中提取） | 🟢 P2 | 2-3h | 可选，从对话中自动学习 |
| 阶段 3+ | 高级设置界面 | 🟢 P3 | 2h | 可选，更丰富的配置选项 |

**为什么不在阶段 1？**
- ❌ 阶段 1 专注于核心框架和快速开始
- ❌ 用户上下文是增强功能，不是必需功能
- ✅ 阶段 2.5 实现更合适（基础框架稳定后）

**为什么阶段 2.5？**
- ✅ 阶段 2 完成智能引导后，添加个性化支持
- ✅ 时间点：基础框架稳定后，外部 API 集成前
- ✅ 优先级：P1（高优先级，但不是 P0）

**总计时间**：4.5 小时（阶段 2.5）

---

---

#### 3.4.3 错误处理和监控系统

**功能边界**：
- **分级设计**：分为基础错误处理和高级监控两部分
- **基础错误处理**（阶段 1.C，必需，2h）：🔴 P0
- **高级监控和重试**（优化阶段，可选，3-4h）：🟢 P2
- **依赖**：横切关注点，影响所有功能
- **输出**：AppError + ErrorHandler + RetryHandler + Monitor
- **特点**：横切所有功能，在所有功能完成后集成

##### 设计分级说明

**重要**：错误处理分为两个级别，实施优先级不同

| 功能 | 基础错误处理 | 高级监控和重试 |
|------|-------------|--------------|
| **实施阶段** | ✅ **阶段 1（必需）** | ⏸️ 优化阶段（可选） |
| **优先级** | 🔴 P0 | 🟢 P2 |
| **预计时间** | 2h | 3-4h |
| **目标** | 让应用不崩溃，用户友好提示 | 让应用更健壮，可观测 |

**基础错误处理（阶段 1）**：
- ✅ AppError 类（错误分类）
- ✅ ErrorHandler（用户友好提示）
- ✅ 前端 Toast 消息
- ✅ console.error 日志

**高级监控和重试（优化阶段）**：
- RetryHandler（智能重试、指数退避）
- StreamHandler（流式中断恢复）
- SimpleMonitor（错误统计、文件日志）

**本章节说明**：
- **3.4.5.1 - 3.4.5.3**：基础错误处理（阶段 1 必需）⭐
- **3.4.5.4 - 3.4.5.6**：高级监控和重试（优化阶段可选）

---

##### 核心挑战

生产环境中，各种错误都可能发生：
- AI API 超时
- 工具调用失败（天气API挂了）
- 流式响应中断
- 网络波动

**问题**：用户看到什么？如何恢复？

##### 设计原则

1. **用户友好**：清晰的错误提示，不显示技术细节
2. **可恢复**：提供重试机制
3. **可监控**：关键错误记录到日志
4. **轻量级**：不引入复杂的监控系统

##### 错误分类和处理策略

```
┌─────────────────────────────────────────────────┐
│  错误类型分类                                     │
├─────────────────────────────────────────────────┤
│  1. 客户端错误（4xx）                             │
│     ├─ 参数错误（消息为空、格式错误）            │
│     ├─ 权限错误（API密钥无效）                  │
│     └─ 限流（请求过于频繁）                      │
│     策略：提示用户 + 帮助文档链接               │
│                                                 │
│  2. 服务器错误（5xx）                            │
│     ├─ AI API 超时                              │
│     ├─ AI API 内部错误                          │
│     └─ 工具执行失败（外部API挂了）              │
│     策略：重试 + 友好提示 + 降级方案            │
│                                                 │
│  3. 网络错误                                    │
│     ├─ 连接超时                                  │
│     ├─ 连接中断                                  │
│     └─ 流式响应中断                              │
│     策略：自动重试 + 状态提示                   │
│                                                 │
│  4. 工具执行错误                                │
│     ├─ 参数验证失败                              │
│     ├─ 工具返回错误                              │
│     └─ 工具超时                                  │
│     策略：智能引导 + 错误提示 + 重试             │
└─────────────────────────────────────────────────┘
```

##### 错误处理组件设计

**1. 错误类型定义**

```javascript
// server.js

/**
 * 错误类型定义
 */
class AppError extends Error {
  constructor(code, message, details = {}, retryable = false) {
    super(message)
    this.code = code  // 错误代码
    this.details = details  // 错误详情
    this.retryable = retryable  // 是否可重试
    this.timestamp = new Date()
  }

  toJSON() {
    return {
      code: this.code,
      message: this.message,
      details: this.details,
      retryable: this.retryable,
      timestamp: this.timestamp
    }
  }
}

// 预定义错误类型
class ErrorTypes {
  // 客户端错误
  static INVALID_PARAMS = new AppError(
    'INVALID_PARAMS',
    '请求参数不正确',
    { hint: '请检查输入后重试' },
    false
  )

  static RATE_LIMITED = new AppError(
    'RATE_LIMITED',
    '请求过于频繁，请稍后再试',
    { hint: '请等待1分钟后重试', retryAfter: 60 },
    true
  )

  static UNAUTHORIZED = new AppError(
    'UNAUTHORIZED',
    'API密钥无效或已过期',
    { hint: '请检查配置文件中的API密钥' },
    false
  )

  // 服务器错误
  static AI_TIMEOUT = new AppError(
    'AI_TIMEOUT',
    'AI服务响应超时',
    { hint: '请稍后重试', originalError: null },
    true
  )

  static AI_ERROR = new AppError(
    'AI_ERROR',
    'AI服务出现错误',
    { hint: '请稍后重试或联系技术支持' },
    true
  )

  static TOOL_EXECUTION_FAILED = new AppError(
    'TOOL_EXECUTION_FAILED',
    '工具执行失败',
    { toolName: '', error: '' },
    true
  )

  // 网络错误
  static NETWORK_ERROR = new AppError(
    'NETWORK_ERROR',
    '网络连接异常',
    { hint: '请检查网络连接后重试' },
    true
  )

  static STREAM_INTERRUPTED = new AppError(
    'STREAM_INTERRUPTED',
    '响应中断',
    { hint: '可以点击重试继续' },
    true
  )
}
```

**2. 错误处理器**

```javascript
/**
 * 错误处理器
 */
class ErrorHandler {
  /**
   * 处理错误并返回用户友好的响应
   */
  handleError(error, res) {
    // 记录错误
    this.logError(error)

    // 判断错误类型
    if (error instanceof AppError) {
      return this.handleAppError(error, res)
    }

    // 未知错误
    return this.handleUnknownError(error, res)
  }

  /**
   * 处理应用错误
   */
  handleAppError(error, res) {
    const response = {
      success: false,
      error: {
        code: error.code,
        message: this.getUserFriendlyMessage(error),
        retryable: error.retryable,
        hint: error.details.hint
      }
    }

    // 根据错误码返回合适的HTTP状态码
    const statusMap = {
      'INVALID_PARAMS': 400,
      'UNAUTHORIZED': 401,
      'RATE_LIMITED': 429,
      'AI_TIMEOUT': 504,
      'AI_ERROR': 502,
      'TOOL_EXECUTION_FAILED': 502,
      'NETWORK_ERROR': 503,
      'STREAM_INTERRUPTED': 503
    }

    res.status(statusMap[error.code] || 500)
    res.json(response)
  }

  /**
   * 处理未知错误
   */
  handleUnknownError(error, res) {
    this.logError(error, '未知错误')

    res.status(500)
    res.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '服务器内部错误，请稍后重试',
        retryable: true
      }
    })
  }

  /**
   * 获取用户友好的错误消息
   */
  getUserFriendlyMessage(error) {
    const messages = {
      'INVALID_PARAMS': '抱歉，您的请求格式不正确',
      'RATE_LIMITED': '抱歉，您发送消息过于频繁，请稍后再试',
      'UNAUTHORIZED': '服务配置错误，请联系管理员',
      'AI_TIMEOUT': 'AI服务暂时无响应，请稍后重试',
      'AI_ERROR': 'AI服务出现异常，请稍后重试',
      'TOOL_EXECUTION_FAILED': '工具执行失败，请稍后重试',
      'NETWORK_ERROR': '网络连接异常，请检查网络后重试',
      'STREAM_INTERRUPTED': '响应中断，请重试'
    }

    return messages[error.code] || '服务暂时不可用'
  }

  /**
   * 记录错误到日志
   */
  logError(error, context = '') {
    const logEntry = {
      timestamp: new Date().toISOString(),
      context: context,
      error: error instanceof AppError ? error.toJSON() : {
        message: error.message,
        stack: error.stack
      }
    }

    // 控制台输出（带颜色）
    console.error(`[Error] ${context}`, logEntry)

    // ⭐ 未来扩展：写入日志文件
    // fs.appendFileSync('logs/errors.log', JSON.stringify(logEntry) + '\n')
  }
}
```

**3. 重试机制**

```javascript
/**
 * 重试处理器
 */
class RetryHandler {
  constructor(maxRetries = 3, retryDelay = 1000) {
    this.maxRetries = maxRetries
    this.retryDelay = retryDelay
    this.retryCount = new Map()  // 记录每个操作的重试次数
  }

  /**
   * 执行带重试的操作
   */
  async executeWithRetry(operation, context = '') {
    const retryKey = `${context}_${Date.now()}`
    let lastError

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        return await operation()
      } catch (error) {
        lastError = error

        // 检查是否可重试
        if (!this.isRetryable(error)) {
          throw error
        }

        // 最后一次尝试失败，不再重试
        if (attempt === this.maxRetries) {
          throw error
        }

        // 记录重试
        console.warn(`[Retry] ${context} 尝试 ${attempt + 1}/${this.maxRetries + 1}`)

        // 等待后重试
        await this.delay(this.retryDelay * (attempt + 1))
      }
    }

    throw lastError
  }

  /**
   * 判断错误是否可重试
   */
  isRetryable(error) {
    if (error instanceof AppError) {
      return error.retryable
    }

    // 网络错误可重试
    if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT') {
      return true
    }

    return false
  }

  /**
   * 延迟
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}
```

**4. 流式响应错误处理**

```javascript
/**
 * 流式响应处理器
 */
class StreamHandler {
  /**
   * 处理流式响应
   */
  async handleStream(req, res, aiCall) {
    let interrupted = false

    // 监听客户端断开
    req.on('close', () => {
      interrupted = true
      console.log('[Stream] 客户端断开连接')
    })

    try {
      // 调用AI获取流
      const stream = await aiCall()

      // 设置SSE响应头
      res.setHeader('Content-Type', 'text/event-stream')
      res.setHeader('Cache-Control', 'no-cache')
      res.setHeader('Connection', 'keep-alive')

      // 处理流数据
      for await (const chunk of stream) {
        if (interrupted) {
          throw ErrorTypes.STREAM_INTERRUPTED
        }

        res.write(`data: ${JSON.stringify({ type: 'content', content: chunk })}\n\n`)
      }

      res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`)

    } catch (error) {
      if (interrupted || error.code === 'STREAM_INTERRUPTED') {
        // 流中断，通知客户端
        res.write(`data: ${JSON.stringify({
          type: 'error',
          error: {
            code: 'STREAM_INTERRUPTED',
            message: '响应中断，可以重试',
            retryable: true
          }
        })}\n\n`)
      } else {
        // 其他错误
        this.handleStreamError(error, res)
      }
    } finally {
      res.end()
    }
  }

  /**
   * 处理流错误
   */
  handleStreamError(error, res) {
    console.error('[Stream Error]', error)

    res.write(`data: ${JSON.stringify({
      type: 'error',
      error: {
        code: 'STREAM_ERROR',
        message: '处理响应时出错',
        retryable: true
      }
    })}\n\n`)
  }
}
```

##### 前端错误处理和重试

**1. 错误消息显示**

```javascript
// public/index.html

/**
 * 显示错误消息
 */
function showError(error) {
  const errorDiv = document.createElement('div')
  errorDiv.className = 'message error'

  const icon = error.retryable ? '🔄' : '⚠️'
  const retryButton = error.retryable ?
    `<button class="retry-btn" onclick="retryLastMessage()">重试</button>` : ''

  errorDiv.innerHTML = `
    <div class="error-icon">${icon}</div>
    <div class="error-content">
      <div class="error-message">${escapeHtml(error.message)}</div>
      ${error.hint ? `<div class="error-hint">${escapeHtml(error.hint)}</div>` : ''}
      ${retryButton}
    </div>
  `

  messagesContainer.appendChild(errorDiv)
  scrollToBottom()
}

/**
 * 重试最后一条消息
 */
async function retryLastMessage() {
  if (!lastMessage) return

  // 显示重试中状态
  const statusDiv = document.createElement('div')
  statusDiv.className = 'message status'
  statusDiv.innerHTML = '<div class="status-text">正在重试...</div>'
  messagesContainer.appendChild(statusDiv)

  try {
    // 重新发送消息
    await sendMessage(lastMessage.content, lastMessage.history)
    statusDiv.remove()  // 移除重试状态
  } catch (error) {
    statusDiv.remove()
    showError({
      message: '重试失败',
      retryable: true
    })
  }
}
```

**2. 流式响应中断处理**

```javascript
// public/index.html

/**
 * 处理流式响应
 */
async function fetchStream(url, body) {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      const errorData = await response.json()
      showError(errorData.error)
      return
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()

    while (true) {
      const { done, value } = await reader.read()

      if (done) break

      const chunk = decoder.decode(value)
      const lines = chunk.split('\n')

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = JSON.parse(line.slice(6))

          if (data.type === 'content') {
            appendMessage(data.content)
          } else if (data.type === 'done') {
            finalizeMessage()
          } else if (data.type === 'error') {
            showError(data.error)
            return  // 停止处理
          }
        }
      }
    }

  } catch (error) {
    if (error.name === 'AbortError') {
      // 用户主动取消
      console.log('请求已取消')
    } else {
      // 网络错误
      showError({
        message: '网络连接异常',
        hint: '请检查网络连接后重试',
        retryable: true
      })
    }
  }
}
```

##### 错误消息模板

```javascript
// server.js - 错误消息模板

const ErrorMessages = {
  // AI 相关
  'AI_TIMEOUT': {
    message: 'AI服务暂时无响应',
    hint: '请稍后重试',
    action: 'retry'
  },

  'AI_ERROR': {
    message: 'AI服务出现异常',
    hint: '请稍后重试或联系技术支持',
    action: 'retry'
  },

  // 工具相关
  'TOOL_EXECUTION_FAILED': {
    message: '工具执行失败',
    hint: '可能是外部服务暂时不可用',
    action: 'retry'
  },

  'TOOL_TIMEOUT': {
    message: '工具执行超时',
    hint: '请稍后重试',
    action: 'retry'
  },

  // 网络相关
  'NETWORK_ERROR': {
    message: '网络连接异常',
    hint: '请检查网络连接后重试',
    action: 'retry'
  },

  'STREAM_INTERRUPTED': {
    message: '响应中断',
    hint: '可以点击重试继续',
    action: 'retry'
  },

  // 客户端相关
  'INVALID_PARAMS': {
    message: '请求格式不正确',
    hint: '请检查输入后重试',
    action: 'none'
  },

  'RATE_LIMITED': {
    message: '发送消息过于频繁',
    hint: '请等待1分钟后再试',
    action: 'wait'
  },

  // 通用
  'INTERNAL_ERROR': {
    message: '服务器内部错误',
    hint: '请稍后重试',
    action: 'retry'
  }
}
```

##### 监控和日志（轻量级）

```javascript
// server.js

/**
 * 轻量级监控
 */
class SimpleMonitor {
  constructor() {
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      errors: {}
    }
  }

  /**
   * 记录请求
   */
  recordRequest(success, error = null) {
    this.metrics.totalRequests++

    if (success) {
      this.metrics.successfulRequests++
    } else {
      this.metrics.failedRequests++

      if (error) {
        const errorCode = error.code || 'UNKNOWN'
        this.metrics.errors[errorCode] = (this.metrics.errors[errorCode] || 0) + 1
      }
    }
  }

  /**
   * 获取健康状态
   */
  getHealthStatus() {
    const errorRate = this.metrics.totalRequests > 0
      ? this.metrics.failedRequests / this.metrics.totalRequests
      : 0

    return {
      totalRequests: this.metrics.totalRequests,
      successRate: 1 - errorRate,
      errors: this.metrics.errors,
      status: errorRate < 0.1 ? 'healthy' : 'degraded'
    }
  }

  /**
   * 定期输出统计（每小时）
   */
  startPeriodicReport() {
    setInterval(() => {
      const health = this.getHealthStatus()
      console.log('[Monitor] 每小时统计:', health)
    }, 3600000)  // 1小时
  }
}

// 全局监控实例
const monitor = new SimpleMonitor()
monitor.startPeriodicReport()
```

##### 代码结构更新

```javascript
server.js (扩展现有文件)
├── ErrorTypes（新增）⭐
│   └─ 预定义错误类型
│
├── ErrorHandler 类（新增）⭐
│   ├── handleError() - 处理错误
│   ├── getUserFriendlyMessage() - 用户友好消息
│   └── logError() - 记录错误
│
├── RetryHandler 类（新增）⭐
│   ├── executeWithRetry() - 带重试的执行
│   └── isRetryable() - 判断是否可重试
│
├── StreamHandler 类（新增）⭐
│   ├── handleStream() - 处理流式响应
│   └── handleStreamError() - 处理流错误
│
├── SimpleMonitor 类（新增）⭐
│   ├── recordRequest() - 记录请求
│   ├── getHealthStatus() - 获取健康状态
│   └── startPeriodicReport() - 定期统计
│
└── ErrorMessages 常量（新增）⭐
    └─ 错误消息模板
```

##### 实施步骤

| 步骤 | 任务 | 文件 | 预计时间 | 优先级 |
|------|------|------|----------|--------|
| 1.1 | 定义错误类型 | `server.js` | 0.5h | P0 |
| 1.2 | 实现 ErrorHandler | `server.js` | 1h | P0 |
| 1.3 | 实现 RetryHandler | `server.js` | 1h | P0 |
| 1.4 | 实现 StreamHandler | `server.js` | 1h | P0 |
| 1.5 | 前端错误显示 | `public/index.html` | 1h | P0 |
| 1.6 | 前端重试功能 | `public/index.html` | 1h | P0 |
| 1.7 | 简单监控 | `server.js` | 0.5h | P1 |

**总计**：6小时（1天）

**验收标准**：
- ✅ 所有错误都有友好的用户提示
- ✅ 可重试的错误显示重试按钮
- ✅ 关键错误记录到 console.error
- ✅ 流式响应中断可以重试
- ✅ API超时自动重试（最多3次）

---

## 3.3 用户体验设计：Aha Moment（惊喜时刻） 🔴 P0

**功能边界**：
- **实施阶段**：阶段 1.B（必需，4.5 小时）
- **优先级**：🔴 P0（核心用户体验）
- **依赖**：阶段 0（代码结构优化）
- **输出**：快速开始按钮 + 交互逻辑 + 样式
- **验收**：新用户 10 秒内完成首次交互
- **特点**：独立功能，不影响核心框架

---

### 3.3.1 问题分析

**当前痛点**：新用户进入后，不知道该说什么

```
当前欢迎界面：
"你好！我是AI助手，有什么可以帮你的吗？"

用户反应：
"额...不知道" ❌
```

**根本原因**：
- ❌ 缺少使用引导
- ❌ 用户不了解 AI 能做什么
- ❌ 没有即时的价值体验
- ❌ 缺少"低门槛入口"

---

### 3.3.2 Aha Moment 设计

**核心目标**：让用户在 10 秒内体验到 AI 的价值

#### 方案：快速开始（Quick Start）按钮

**欢迎界面设计**：

```
┌─────────────────────────────────────────┐
│  👋 你好！我是AI智能助理                 │
│                                         │
│  选择一个任务，立即开始体验：            │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │ 📝 帮我总结一篇文章                │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │ 🌤️ 查询北京天气                   │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │ 💡 给我5个创意点子                 │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ┌───────────────────────────────────┐  │
│  📊 提取文章关键信息                  │  │
│  └───────────────────────────────────┘  │
│                                         │
│  或者直接输入你的问题...                │
└─────────────────────────────────────────┘
```

#### 交互流程

**步骤 1**：用户点击按钮
```javascript
// 点击"📝 帮我总结一篇文章"
onClick: {
  action: 'fillMessage',
  message: '请帮我总结下面这篇文章：\n\n[在这里粘贴你的文章内容，或者上传文件]',
  sendImmediately: false  // 用户可以编辑后再发送
}
```

**步骤 2**：自动填入示例文本
```javascript
// 输入框自动填充
messageInput.value = '请帮我总结下面这篇文章：\n\n[在这里粘贴你的文章内容，或者上传文件]'

// 光标定位到可编辑位置
messageInput.focus()
messageInput.setSelectionRange(30, 30)  // 定位到"文章内容"后面
```

**步骤 3**：用户点击发送
```
用户: "请帮我总结下面这篇文章：\n\n[内容]"

AI: "我来帮你总结这篇文章。🔧 正在调用工具：summarizeArticle..."

[处理中...]

AI: "✅ 总结完成！\n\n文章主要观点：\n1. ...\n2. ...\n3. ..."
```

**步骤 4**：用户感受到价值 ✨
- "哇，真的能总结文章！"
- "原来可以这样用"
- "我知道该怎么问了"

---

### 3.3.3 快速开始场景设计

#### 场景 1：文本处理（通用场景）

| 按钮 | 文案 | 示例文本 | 触发工具 |
|------|------|----------|----------|
| 📝 | 帮我总结一篇文章 | `请帮我总结下面这篇文章：\n\n[在这里粘贴你的文章内容]` | summarizeArticle |
| 📊 | 提取文章关键信息 | `请从下面的文章中提取关键信息：\n\n[粘贴文章内容]` | extractKeyInfo |
| ✍️ | 帮我写一段摘要 | `请为下面的文章写一段150字以内的摘要：\n\n[粘贴文章内容]` | summarizeArticle |

#### 场景 2：智能助理（阶段 4 功能）

| 按钮 | 文案 | 示例文本 | 触发工具 |
|------|------|----------|----------|
| 🌤️ | 查询北京天气 | `查询北京今天的天气情况` | getWeather |
| 🛒 | 对比商品价格 | `帮我对比 iPhone 15 在京东和淘宝的价格` | comparePrice |
| ✈️ | 查询航班信息 | `查询明天从北京到上海的航班` | getFlightInfo |

#### 场景 3：创意助手（无需工具）

| 按钮 | 文案 | 示例文本 | 说明 |
|------|------|----------|------|
| 💡 | 给我5个创意点子 | `给我5个关于环保的创意点子` | 直接 AI 生成 |
| 📖 | 帮我解释一个概念 | `用简单的语言解释什么是"区块链"` | 直接 AI 生成 |
| 🎯 | 帮我制定计划 | `帮我制定一个一周的健身计划` | 直接 AI 生成 |

---

### 3.3.4 实现方式

#### 前端代码（`public/app.js`）

```javascript
// 快速开始配置
const quickStartButtons = [
  {
    id: 'summarize',
    emoji: '📝',
    text: '帮我总结一篇文章',
    message: '请帮我总结下面这篇文章：\n\n[在这里粘贴你的文章内容]',
    category: 'text'
  },
  {
    id: 'extract',
    emoji: '📊',
    text: '提取文章关键信息',
    message: '请从下面的文章中提取关键信息（如日期、人名、地点）：\n\n[粘贴文章内容]',
    category: 'text'
  },
  {
    id: 'weather',
    emoji: '🌤️',
    text: '查询北京天气',
    message: '查询北京今天的天气情况',
    category: 'assistant',
    requiresAPI: true  // 需要外部 API
  },
  {
    id: 'creative',
    emoji: '💡',
    text: '给我5个创意点子',
    message: '给我5个关于[主题]的创意点子，要求：\n1. 创新性强\n2. 可落地\n3. 成本低',
    category: 'general'
  }
]

/**
 * 渲染快速开始按钮
 */
function renderQuickStartButtons() {
  const container = document.getElementById('quick-start-container')

  // 根据功能可用性过滤按钮
  const availableButtons = quickStartButtons.filter(btn => {
    // 如果需要外部 API 但未配置，则不显示
    if (btn.requiresAPI) {
      // 检查是否配置了相应 API
      return false  // 阶段 4 实现后改为 true
    }
    return true
  })

  container.innerHTML = availableButtons.map(btn => `
    <button class="quick-start-btn" data-id="${btn.id}">
      <span class="emoji">${btn.emoji}</span>
      <span class="text">${btn.text}</span>
    </button>
  `).join('')

  // 绑定点击事件
  container.querySelectorAll('.quick-start-btn').forEach(btn => {
    btn.addEventListener('click', () => handleQuickStartClick(btn.dataset.id))
  })
}

/**
 * 处理快速开始按钮点击
 */
function handleQuickStartClick(buttonId) {
  const button = quickStartButtons.find(b => b.id === buttonId)
  if (!button) return

  // 填充消息到输入框
  const messageInput = document.getElementById('message-input')
  messageInput.value = button.message

  // 如果消息中有占位符，定位到占位符位置
  const placeholderMatch = button.message.match(/\[.*?\]/)
  if (placeholderMatch) {
    const placeholderIndex = button.message.indexOf(placeholderMatch[0])
    messageInput.focus()
    messageInput.setSelectionRange(
      placeholderIndex,
      placeholderIndex + placeholderMatch[0].length
    )
  } else {
    // 没有占位符，聚焦到末尾
    messageInput.focus()
    messageInput.setSelectionRange(button.message.length, button.message.length)
  }

  // 可选：自动发送（取决于配置）
  // sendMessage(button.message)
}
```

#### CSS 样式（`public/styles.css`）

```css
/* 快速开始容器 */
#quick-start-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin: 20px 0;
  padding: 16px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 12px;
}

/* 快速开始按钮 */
.quick-start-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  background: white;
  border: 2px solid transparent;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.quick-start-btn:hover {
  border-color: #4CAF50;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.2);
}

.quick-start-btn:active {
  transform: translateY(0);
}

.quick-start-btn .emoji {
  font-size: 24px;
  flex-shrink: 0;
}

.quick-start-btn .text {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  text-align: left;
}

/* 移动端适配 */
@media (max-width: 768px) {
  #quick-start-container {
    grid-template-columns: 1fr;
  }
}
```

---

### 3.3.5 个性化快速开始（基于用户上下文）🟢 P2

**功能边界**：
- **实施阶段**：阶段 2.5 完成后（需要用户上下文系统）
- **依赖**：3.4.2 用户上下文系统（🟡 P1）
- **优先级**：🟢 P2（可选的增强功能）
- **输出**：个性化推荐算法 + 动态按钮生成
- **特点**：增强用户体验，非必需功能

---

**场景**：如果用户配置了健康偏好，显示个性化按钮

```javascript
// 如果用户有糖尿病史
if (userContext.healthConditions.includes('糖尿病')) {
  personalizedButtons.push({
    id: 'diabetes-summary',
    emoji: '🩺',
    text: '针对糖尿病患者分析检查报告',
    message: '我是一名糖尿病患者，请帮我分析这份血液检查报告，重点关注血糖相关指标：\n\n[粘贴检查报告]'
  })
}
```

---

### 3.3.6 实施优先级

| 阶段 | 功能 | 优先级 | 预计时间 |
|------|------|--------|----------|
| **阶段 1** | 基础快速开始按钮 | 🔴 P0 | 2h |
| 阶段 1 | 前端交互实现 | 🔴 P0 | 1.5h |
| 阶段 1 | 样式优化（响应式） | 🟡 P1 | 1h |
| 阶段 2 | 智能隐藏不可用按钮 | 🟡 P1 | 1h |
| 阶段 3 | 个性化按钮（基于用户上下文） | 🟢 P2 | 1.5h |

**阶段 1 实现**（第一版）- 4.5小时：

快速开始按钮配置（3个）：
1. 📝 **帮我总结一篇文章**
   - 示例文本：`请帮我总结下面这篇文章：\n\n[在这里粘贴你的文章内容]`
   - 触发工具：summarizeArticle
   - 类别：文本处理

2. 📊 **提取文章关键信息**
   - 示例文本：`请从下面的文章中提取关键信息（如日期、人名、地点）：\n\n[粘贴文章内容]`
   - 触发工具：extractKeyInfo
   - 类别：文本处理

3. 💡 **给我5个创意点子**
   - 示例文本：`给我5个关于[主题]的创意点子，要求：\n1. 创新性强\n2. 可落地\n3. 成本低`
   - 无需工具（AI 直接生成）
   - 类别：创意助手

验收标准：
- ✅ 点击按钮自动填入示例文本到输入框
- ✅ 光标自动定位到占位符位置（如 `[粘贴文章内容]`）
- ✅ 响应式设计（移动端自适应）

**后续优化**（阶段 2/3）：
- ✨ 根据工具可用性动态显示按钮（🟡 P1）
- ✨ 个性化推荐（基于历史使用）（🟢 P2）
- ✨ A/B 测试不同文案（🟢 P2）

---

### 3.3.7 效果衡量

**关键指标**：

| 指标 | 目标 | 说明 |
|------|------|------|
| **首次交互时间** | < 10 秒 | 从打开页面到第一次发送消息 |
| **快速开始使用率** | > 60% | 新用户使用快速开始按钮的比例 |
| **会话留存率** | > 80% | 使用快速开始的用户完成首次对话 |
| **满意度评分** | > 4.5/5 | 用户反馈"容易上手"的比例 |

---

#### A/B 测试方案 🟢 P2

**说明**：A/B 测试属于优化手段，建议在阶段 2/3 实施，当前阶段 1 专注于基础功能实现。

**测试表格**（阶段 2/3 使用）：

| 变体 | 欢迎语 | 快速开始按钮 | 预期效果 |
|------|--------|-------------|----------|
| A（控制组） | "你好！我是AI助手" | 无 | 基线 |
| B（实验组1） | "你好！我是AI助手" | 3个通用按钮 | +40% 首次交互 |
| C（实验组2） | "选择一个任务开始" | 3-4 个按钮 + 引导语 | +60% 首次交互 |

---

### 3.3.8 设计原则总结

✅ **低门槛**：不需要学习，点击即可使用
✅ **即时价值**：10 秒内体验 AI 能力
✅ **渐进式**：从简单任务到复杂场景
✅ **可扩展**：新增功能时快速添加按钮
✅ **智能化**：根据用户上下文个性化推荐

---

## 4. 代码结构规划

### 4.1 新增文件

```
server.js (扩展现有文件)
├── ModelAdapter 基类（新增）⭐
│   ├── formatTools() - 格式化工具定义
│   ├── parseResponse() - 解析AI响应
│   ├── extractToolCalls() - 提取工具调用
│   └── buildRequest() - 构建API请求
│
├── GLMAdapter 类（新增）⭐
│   └── 继承 ModelAdapter，实现GLM-4格式
│
├── DeepSeekAdapter 类（新增）⭐
│   └─ 继承 ModelAdapter，实现DeepSeek格式
│
├── modelAdapters 注册表（新增）⭐
│   └── 管理所有模型适配器
│
├── GuidanceHandler 类（新增）⭐
│   ├── generateGuidance() - 生成引导提示
│   ├── useTemplateGuidance() - 使用预配置模板
│   ├── useAIGuidance() - 使用AI动态生成
│   ├── rememberPreference() - 记住用户偏好
│   └── getPreference() - 获取用户偏好
│
├── ToolRegistry 类（新增）⭐
│   ├── registerTool() - 注册工具
│   ├── getToolDefinitions() - 获取工具定义
│   └── executeTool() - 执行工具
│
├── ToolExecutor 类（新增）⭐
│   ├── processMessage() - 处理消息（支持工具调用）
│   └── executeToolCall() - 执行工具调用
│
└── AIAdapter 类（扩展）
    ├── chat() - 支持工具参数 ⭐
    ├── chatWithGLMStream() - 支持工具流 ⭐
    └── chatWithDeepSeekStream() - 支持工具流 ⭐

tools/
├── index.js - 工具注册入口
├── text-tools.js - 文本处理工具
│   ├── summarizeArticle
│   └── extractKeyInfo
└── (后续添加)
    ├── weather-tools.js - 天气工具
    ├── price-tools.js - 价格工具
    └── task-tools.js - 任务管理工具
```

### 4.2 核心类设计（更新版）

#### 4.2.1 ModelAdapter 基类

```javascript
/**
 * 模型适配器基类（抽象接口）
 * 职责：统一不同AI模型的Function Calling接口差异
 */
class ModelAdapter {
  formatTools(tools) { /* 抽象方法 */ }
  parseResponse(response) { /* 抽象方法 */ }
  extractToolCalls(message) { /* 抽象方法 */ }
  buildRequest(messages, tools, options) { /* 抽象方法 */ }
}
```

**扩展性**：
- ✅ 添加新模型只需继承并实现4个方法
- ✅ 不影响现有代码
- ✅ 统一的内部接口

#### 4.2.2 模型适配器实现示例

**GLMAdapter**：
```javascript
class GLMAdapter extends ModelAdapter {
  // 实现GLM-4特定的格式转换逻辑
  formatTools(tools) { /* ... */ }
  parseResponse(response) { /* ... */ }
  extractToolCalls(message) { /* ... */ }
  buildRequest(messages, tools, options) { /* ... */ }
}
```

**添加新模型（未来）**：
```javascript
class OpenAIAdapter extends ModelAdapter {
  // 实现OpenAI特定的格式转换逻辑
  formatTools(tools) { /* ... */ }
  parseResponse(response) { /* ... */ }
  extractToolCalls(message) { /* ... */ }
  buildRequest(messages, tools, options) { /* ... */ }
}
```

#### 4.2.3 ToolRegistry 类

```javascript
class ToolRegistry {
  constructor() {
    this.tools = new Map()
  }

  // 注册工具
  registerTool(name, definition, handler) {
    this.tools.set(name, { definition, handler })
  }

  // 获取所有工具定义（发送给 AI）
  getToolDefinitions() {
    return Array.from(this.tools.values()).map(t => t.definition)
  }

  // 执行工具
  async executeTool(name, args) {
    const tool = this.tools.get(name)
    if (!tool) {
      throw new Error(`Tool not found: ${name}`)
    }

    return await tool.handler(args)
  }

  // 检查参数完整性
  validateParameters(toolName, args) {
    const tool = this.tools.get(toolName)
    const required = tool.definition.parameters.required || []

    for (const param of required) {
      if (!(param in args)) {
        return { valid: false, missing: param }
      }
    }

    return { valid: true }
  }
}
```

#### 4.2.2 ToolExecutor 类

```javascript
class ToolExecutor {
  constructor(toolRegistry, aiAdapter) {
    this.toolRegistry = toolRegistry
    this.aiAdapter = aiAdapter
  }

  // 处理消息（支持工具调用）
  async processMessage(message, history, provider) {
    const tools = this.toolRegistry.getToolDefinitions()

    // 第1轮：让 AI 识别意图
    const intent = await this.detectIntent(message, history, tools, provider)

    if (intent.type === 'tool_call') {
      // 需要调用工具
      return await this.executeToolCall(intent, message, history, provider)
    } else {
      // 直接回复
      return intent
    }
  }

  // 意图识别
  async detectIntent(message, history, tools, provider) {
    const response = await this.aiAdapter.chat({
      message,
      history,
      provider,
      tools  // 传入工具定义
    })

    // 检查 AI 是否返回了 tool_calls
    if (response.tool_calls && response.tool_calls.length > 0) {
      return {
        type: 'tool_call',
        tool_calls: response.tool_calls
      }
    }

    return {
      type: 'direct_response',
      content: response.content
    }
  }

  // 执行工具调用
  async executeToolCall(intent, message, history, provider) {
    const results = []

    for (const call of intent.tool_calls) {
      const { name, arguments: args } = call.function

      // 检查参数完整性
      const validation = this.toolRegistry.validateParameters(name, JSON.parse(args))

      if (!validation.valid) {
        // 参数不完整，让 AI 询问用户
        return await this.askForParameters(name, validation.missing, message, history, provider)
      }

      // 执行工具
      const result = await this.toolRegistry.executeTool(name, JSON.parse(args))
      results.push({ name, result })
    }

    // 第2轮：让 AI 根据工具结果生成回复
    return await this.generateResponse(message, history, results, provider)
  }

  // 询问缺失参数
  async askForParameters(toolName, missingParam, message, history, provider) {
    const prompt = `用户想要调用 ${toolName} 工具，但缺少参数：${missingParam}。请询问用户这个参数的值。`

    return await this.aiAdapter.chat({
      message: prompt,
      history,
      provider
    })
  }

  // 根据工具结果生成回复
  async generateResponse(message, history, toolResults, provider) {
    const toolContext = toolResults.map(r => `${r.name}: ${JSON.stringify(r.result)}`).join('\n')

    const prompt = `${message}\n\n工具执行结果：\n${toolContext}\n\n请根据工具结果生成自然语言回复。`

    return await this.aiAdapter.chat({
      message: prompt,
      history,
      provider
    })
  }
}
```

### 4.3 API 路由调整

```javascript
// server.js

// 初始化
const toolRegistry = new ToolRegistry()
const toolExecutor = new ToolExecutor(toolRegistry, AIAdapter)

// 注册工具
require('./tools').forEach(tool => {
  toolRegistry.registerTool(tool.name, tool.definition, tool.handler)
})

// 修改现有流式接口
app.post('/api/chat/stream', async (req, res) => {
  const { message, history, provider } = req.body

  // 使用 ToolExecutor 处理
  const response = await toolExecutor.processMessage(message, history, provider)

  // 流式返回（现有逻辑）
  // ...
})
```

---

## 5. 实施步骤分解

### 5.0 实施边界概览 📋

**重要**：严格按照功能边界逐个实施，不要同时开发多个功能。

```
实施优先级图：
┌─────────────────────────────────────────────┐
│ 🔴 P0 - 必须完成（阶段 0 + 阶段 1，17h）   │
│   ├─ 阶段 0：代码结构优化（1-2h）           │
│   ├─ 阶段 1.A：核心框架（10.5h）            │
│   ├─ 阶段 1.C：基础错误处理（2h）⭐         │
│   └─ 阶段 1.B：快速开始（4.5h）            │
├─────────────────────────────────────────────┤
│ 🟡 P1 - 高优先级（阶段 2 + 2.5，1.5-2天）  │
│   ├─ 阶段 2.5：用户上下文系统（4.5h）       │
│   └─ 阶段 2：智能引导（0.5-1天）             │
├─────────────────────────────────────────────┤
│ 🟢 P2 - 可选优化（优化阶段，3-4h）         │
│   └─ 高级监控和重试（3-4h）                 │
└─────────────────────────────────────────────┘
```

**实施原则**：
1. ✅ **逐个功能块实施**，不要并行开发
2. ✅ **每个功能块验收后再进入下一个**
3. ✅ **遇到问题及时记录**，不要影响其他功能块
4. ✅ **横切关注点（错误处理）在所有功能完成后集成**

---

### 5.0 阶段 0：代码结构优化（1-2小时）

**目标**：拆分 `public/index.html` 为独立的 CSS 和 JS 文件，提升可维护性

**背景**：
- 当前 `index.html` 已达 1200+ 行（HTML + 900行 CSS + 1230行 JS）
- 问题：代码导航困难、修改影响范围不明确、新手难以快速定位
- 解决方案：拆分为 3 个文件，**无需构建工具**（浏览器原生支持）

| 步骤 | 任务 | 文件 | 预计时间 |
|------|------|------|----------|
| 0.1 | 提取 CSS 到独立文件 | `public/styles.css` | 0.5h |
| 0.2 | 提取 JavaScript 到独立文件 | `public/app.js` | 0.5h |
| 0.3 | 更新 index.html 引用资源 | `public/index.html` | 0.25h |
| 0.4 | 测试功能完整性 | - | 0.5h |
| 0.5 | 更新相关文档 | `docs/` | 0.25h |

**文件结构**：
```
public/
├── index.html      (< 200 行)  - HTML 结构 + 资源引用
├── styles.css      (900 行)    - 所有样式
├── app.js          (1230 行)   - 所有业务逻辑
└── config.js       (自动生成)   - 前端配置
```

**验收标准**：
- ✅ 所有现有功能正常工作（对话、流式响应、样式）
- ✅ 浏览器缓存 CSS 和 JS（性能提升）
- ✅ 代码导航更方便（修改样式只需打开 styles.css）
- ✅ 无需构建工具，直接刷新浏览器即可生效

**实现方式**（浏览器原生支持）：
```html
<!-- index.html -->
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <link rel="stylesheet" href="styles.css">  <!-- 浏览器原生支持 -->
</head>
<body>
    <div id="app">...</div>
    <script src="config.js"></script>           <!-- 自动生成 -->
    <script src="app.js"></script>               <!-- 浏览器原生支持 -->
</body>
</html>
```

**优势**：
- ✅ 保持轻量级原则（无需构建工具）
- ✅ 职责清晰（结构、样式、逻辑分离）
- ✅ 易于维护（修改样式只需打开 styles.css）
- ✅ 更好的缓存（CSS 和 JS 可以被浏览器单独缓存）

---

### 5.1 第一阶段：基础框架 + 快速开始（2-3天）

**目标**：
1. 实现 Function Calling 框架，不依赖外部 API
2. 添加快速开始功能，提升新用户体验（Aha Moment）

#### A 部分：Function Calling 基础框架（1-2天）

| 步骤 | 任务 | 文件 | 预计时间 |
|------|------|------|----------|
| 1.1 | 创建 `tools/` 目录结构 | `tools/` | 0.5h |
| 1.2 | 实现 `ToolRegistry` 类 | `server.js` | 1.5h |
| 1.3 | 实现 `ToolExecutor` 类 | `server.js` | 2h |
| 1.4 | 扩展 `AIAdapter` 支持工具参数 | `server.js` | 1.5h |
| 1.5 | 实现简单函数 `formatToolsForAI` | `server.js` | 0.5h |
| 1.6 | 实现简单函数 `parseAIResponse` | `server.js` | 0.5h |
| 1.7 | 实现 `summarizeArticle` 工具 | `tools/text-tools.js` | 1h |
| 1.8 | 实现 `extractKeyInfo` 工具 | `tools/text-tools.js` | 1h |
| 1.9 | 更新前端支持工具调用反馈 | `public/app.js` | 1h |
| 1.10 | 测试工具调用流程 | - | 1h |

**A 部分验收标准**：
- ✅ 用户发送文章内容，AI 能识别并调用 summarizeArticle 工具
- ✅ 工具执行结果能正确返回给 AI 生成回复
- ✅ 流式响应正常工作
- ✅ 前端显示工具调用提示（"🔧 正在调用工具：summarizeArticle..."）

---

#### C 部分：基础错误处理（2小时）🔴 必需

**为什么基础错误处理是必需的？**
- ❌ 没有错误处理，用户看到的是技术错误堆栈
- ❌ 网络波动、API超时会导致应用"卡死"
- ✅ 基础错误处理让应用更健壮、用户体验更好

**与高级监控的区别**：
| 功能 | 基础错误处理（阶段 1） | 高级监控（优化阶段） |
|------|---------------------|-------------------|
| **错误分类** | ✅ AppError + 错误码 | ✅ 更详细的分类 |
| **用户友好提示** | ✅ 中文提示 + 建议 | ✅ 更详细的帮助文档 |
| **自动重试** | ✅ 简单重试（1次） | ✅ 智能重试（指数退避） |
| **日志记录** | ✅ console.error | ✅ 文件日志 + 统计 |
| **流式中断处理** | ✅ 基础处理 | ✅ 自动恢复 |

| 步骤 | 任务 | 文件 | 预计时间 |
|------|------|------|----------|
| 1.11 | 实现 `AppError` 类 | `server.js` | 0.5h |
| 1.12 | 实现 `ErrorHandler` 基础版 | `server.js` | 1h |
| 1.13 | 前端错误提示（Toast 消息） | `public/app.js` | 0.5h |

**代码示例**：

```javascript
// server.js - 基础错误处理

/**
 * 应用错误类
 */
class AppError extends Error {
  constructor(code, message, retryable = false) {
    super(message)
    this.code = code
    this.retryable = retryable
  }
}

/**
 * 错误处理器（基础版）
 */
class ErrorHandler {
  /**
   * 处理错误并返回用户友好的响应
   */
  handleError(error, res) {
    // 记录错误
    console.error('[Error]', error.code, error.message)

    // 用户友好的错误消息
    const messages = {
      'INVALID_PARAMS': '请求参数不正确，请检查后重试',
      'AI_TIMEOUT': 'AI服务响应超时，请稍后重试',
      'AI_ERROR': 'AI服务暂时不可用，请稍后重试',
      'TOOL_EXECUTION_FAILED': '工具执行失败，请重试',
      'NETWORK_ERROR': '网络连接异常，请检查网络后重试'
    }

    const userMessage = messages[error.code] || '系统错误，请稍后重试'

    res.status(500).json({
      success: false,
      error: {
        code: error.code,
        message: userMessage,
        retryable: error.retryable
      }
    })
  }
}

// 使用示例
const errorHandler = new ErrorHandler()

try {
  await toolRegistry.executeTool(toolName, args)
} catch (error) {
  return errorHandler.handleError(new AppError('TOOL_EXECUTION_FAILED', error.message, true), res)
}
```

**C 部分验收标准**：
- ✅ 所有错误都有用户友好的中文提示
- ✅ 可重试的错误显示"重试"按钮
- ✅ 关键错误记录到 console.error
- ✅ 前端显示 Toast 提示（不使用 alert）

---

#### B 部分：Aha Moment - 快速开始功能（4.5小时）

| 步骤 | 任务 | 文件 | 预计时间 |
|------|------|------|----------|
| 1.14 | 添加快速开始按钮配置 | `public/app.js` | 1h |
| 1.15 | 实现按钮点击处理逻辑 | `public/app.js` | 1.5h |
| 1.16 | 实现快速开始样式（响应式） | `public/styles.css` | 1h |
| 1.17 | 添加移动端适配 | `public/styles.css` | 0.5h |
| 1.18 | 测试快速开始交互 | - | 0.5h |

**B 部分验收标准**：
- ✅ 欢迎界面显示 3-4 个快速开始按钮（2x2 网格布局）
- ✅ 点击按钮自动填入示例文本到输入框
- ✅ 光标智能定位到占位符位置（如 `[粘贴文章内容]`）
- ✅ 按钮有 hover 效果和点击反馈
- ✅ 移动端显示为单列布局
- ✅ 新用户能在 10 秒内完成首次交互

---

#### 第一阶段总体验收标准

**功能完整性**：
- ✅ 工具调用流程：用户 → AI 识别 → 工具执行 → AI 整合 → 回复
- ✅ 快速开始流程：欢迎界面 → 点击按钮 → 自动填入 → 发送 → 体验价值
- ✅ 流式响应：工具调用过程有实时反馈
- ✅ 移动端适配：所有功能在手机上正常工作

**用户体验**：
- ✅ 新用户首次交互时间 < 10 秒
- ✅ 快速开始按钮使用率 > 60%（测试数据）
- ✅ 工具调用过程有清晰的状态提示
- ✅ **错误提示友好且可操作** ⭐

**代码质量**：
- ✅ 代码符合现有风格（参考 CONTRIBUTING.md）
- ✅ 无 console 错误或警告
- ✅ 工具定义格式统一
- ✅ 前端代码结构清晰（app.js、styles.css 分离）
- ✅ **所有错误都有处理** ⭐

---

**总计时间**：
- A 部分（基础框架）：10.5 小时
- C 部分（基础错误处理）：2 小时 ⭐ 新增
- B 部分（快速开始）：4.5 小时
- **总计**：**17 小时**（约 2-2.5 个工作日）

### 5.2 第二阶段：智能引导（0.5-1天）

**目标**：实现参数不完整时的智能引导

**策略**：
- ✅ **优先使用 AI 动态生成**（灵活、自然）
- ✅ **可选配置模板**（高频场景）
- ✅ **逐个询问参数**（避免遗漏）

| 步骤 | 任务 | 文件 | 预计时间 |
|------|------|------|----------|
| 2.1 | 实现 `GuidanceHandler` 类 | `server.js` | 1.5h |
| 2.2 | 扩展 `ToolRegistry` 支持参数验证 | `server.js` | 0.5h |
| 2.3 | 更新 `ToolExecutor` 集成智能引导 | `server.js` | 1h |
| 2.4 | （可选）配置天气工具引导模板 | `tools/weather-tools.js` | 0.5h |
| 2.5 | 更新前端显示引导提示 | `public/index.html` | 0.5h |
| 2.6 | 测试多轮对话场景 | - | 1h |

**验收标准**：
- ✅ 参数不完整时，AI 主动询问（自然友好）
- ✅ 用户补充信息后，工具正确执行
- ✅ 多轮对话上下文保持一致
- ✅ （可选）天气查询使用模板，显示示例按钮
- ✅ 移动端引导提示正常显示

**实施要点**：
1. **GuidanceHandler 实现**：
   - `generateGuidance()` - 生成引导提示（优先模板，fallback到AI）
   - `useTemplateGuidance()` - 使用预配置模板
   - `useAIGuidance()` - 调用AI动态生成
   - `rememberPreference()` - 记住用户偏好（可选）

2. **参数验证**：
   - 检查必需参数是否完整
   - 返回第一个缺失参数（逐个询问）
   - 保存所有缺失信息（供后续优化）

3. **前端显示**：
   - 引导消息使用特殊样式（💡 图标）
   - 配置模板时显示示例按钮
   - 点击示例快速填入

---

### 5.2.5 阶段 2.5：用户上下文系统（4.5h）🟡 P1

**目标**：实现个性化支持，让 AI 了解用户背景

**依赖**：
- ✅ 阶段 1（核心框架）
- ✅ 阶段 2（智能引导）
- ⏸️ 在外部 API 集成之前实施

**为什么是阶段 2.5？**
- 在阶段 2（智能引导）之后，可以增强智能引导的个性化
- 在阶段 3（外部 API）之前，测试更简单（不需要外部 API）
- 是增强功能（P1），不是必需功能（P0）

**详细设计**：见 [3.4.2 用户上下文系统](#342-用户上下文系统个性化支持-🟡-p1)

| 步骤 | 任务 | 文件 | 预计时间 |
|------|------|------|----------|
| 2.5.1 | 实现 `UserContextManager` 类 | `public/app.js` | 1.5h |
| 2.5.2 | 前端发送消息时携带用户上下文 | `public/app.js` | 0.5h |
| 2.5.3 | 工具参数增强（支持可选 userContext） | `tools/text-tools.js` | 1h |
| 2.5.4 | 后端 API 接口支持用户上下文 | `server.js` | 0.5h |
| 2.5.5 | 实现用户设置界面 | `public/app.js` | 1h |

**验收标准**：
- ✅ localStorage 存储用户上下文（健康状况、关注点、偏好）
- ✅ 用户可以设置个人信息
- ✅ 工具接收用户上下文参数（可选）
- ✅ 个性化工具调用（如糖尿病患者查看检查报告）
- ✅ 设置界面移动端适配

**总计时间**：4.5 小时

---

### 5.3 第三阶段：外部 API 集成（调研后，2-3天）

**目标**：集成外部 API（天气、价格等）

**前提**：完成 API 调研，获得 API 密钥

| 步骤 | 任务 | 预计时间 |
|------|------|----------|
| 3.1 | 实现天气工具 | 2h |
| 3.2 | 实现价格对比工具 | 3h |
| 3.3 | 添加 API 错误处理 | 1h |
| 3.4 | 测试外部 API 调用 | 1h |

### 5.4 第四阶段：优化和文档（1天）

| 步骤 | 任务 | 预计时间 |
|------|------|----------|
| 4.1 | 性能优化 | 2h |
| 4.2 | 错误处理完善 | 2h |
| 4.3 | 更新文档 | 3h |
| 4.4 | 代码审查和重构 | 1h |

---

## 6. 测试计划

### 6.1 单元测试

**ToolRegistry 类**：
- [ ] 注册工具功能
- [ ] 获取工具定义
- [ ] 执行工具
- [ ] 参数验证

**ToolExecutor 类**：
- [ ] 意图识别
- [ ] 工具调用
- [ ] 参数完整性检查
- [ ] 智能引导

### 6.2 集成测试

**场景测试**：
- [ ] 文章总结（无需外部 API）
- [ ] 关键信息提取（无需外部 API）
- [ ] 智能引导（参数不完整场景）
- [ ] 多轮对话（上下文保持）

**性能测试**：
- [ ] 工具调用响应时间 < 3秒
- [ ] 流式响应延迟 < 500ms
- [ ] 并发处理能力

### 6.3 用户体验测试

- [ ] 前端显示工具调用状态
- [ ] 错误提示友好清晰
- [ ] 移动端兼容性
- [ ] 对话自然流畅

---

## 7. 风险评估

### 7.1 技术风险

| 风险 | 影响 | 概率 | 缓解措施 |
|------|------|------|----------|
| AI 模型不支持工具调用 | 高 | 低 | 已确认 GLM-4 和 DeepSeek 都支持 |
| 工具调用性能问题 | 中 | 中 | 异步执行、超时控制 |
| 流式响应复杂度增加 | 中 | 高 | 充分测试、简化逻辑 |
| 外部 API 不可用 | 中 | 中 | 降级方案、友好提示 |

### 7.2 架构风险

| 风险 | 影响 | 概率 | 缓解措施 |
|------|------|------|----------|
| 过度设计导致复杂度增加 | 高 | 中 | 遵循适度升级原则 |
| 破坏现有功能 | 高 | 低 | 向后兼容、充分测试 |
| 难以扩展新工具 | 中 | 低 | 清晰的工具注册机制 |

### 7.3 项目风险

| 风险 | 影响 | 概率 | 缓解措施 |
|------|------|------|----------|
| 开发时间超期 | 中 | 中 | 分阶段实施、优先核心功能 |
| 外部 API 申请困难 | 中 | 中 | 提前调研、准备备选方案 |
| 用户接受度低 | 低 | 低 | 渐进式发布、收集反馈 |

---

## 8. 后续扩展路径

> ⚠️ **重要说明**（2026-01-17）：
> 以下扩展计划仅作为设计参考。根据项目轻量级定位，部分功能已标记为"不再开发"。
> 已实现的功能请参考章节3的完成状态。

### 8.1 短期扩展（1-2个月）

#### ✅ 已完成的扩展

**天气查询**（2026-01-16完成）：
- ✅ 实时天气查询（温度、体感、湿度、风速等）
- ✅ wttr.in API 集成
- ✅ 中英文城市名称支持
- ✅ Function Calling 集成测试通过

#### ❌ 不再开发的扩展

**商品价格对比**：
- ❌ 不再开发（保持项目轻量级定位）

**航班查询**：
- ❌ 不再开发（避免引入复杂的第三方API）

**图片处理（去水印）**：
- ❌ 不再开发（超出项目定位）

**体验优化**：
- ❌ 工具调用进度显示（不再开发）
- ❌ 更智能的意图识别（不再开发）
- ❌ 上下文记忆增强（不再开发）

### 8.2 中期扩展（3-6个月）

#### ❌ 全部不再开发

**任务管理**：
- ❌ 待办事项管理
- ❌ 任务提醒
- ❌ 历史统计看板

**多模态能力**：
- ❌ 图片识别
- ❌ 语音交互
- ❌ 文档解析

### 8.3 长期扩展（6个月以上）

#### ❌ 全部不再开发

**用户系统**：
- ❌ 用户认证
- ❌ 个人设置
- ❌ 使用统计（已有基础统计，增强功能不再开发）

**开放平台**：
- ❌ 开放 API
- ❌ 第三方工具开发
- ❌ 插件市场

**总结**：项目已达到预期目标，所有扩展功能不再开发，保持轻量级定位。

---

## 9. 决策记录

### 9.1 技术选型

| 决策点 | 选择 | 理由 |
|--------|------|------|
| **框架选择** | 不使用 LangChain | 项目定位轻量级，LangChain 过重 |
| **意图识别** | 基于 AI 的识别 | 无需训练，自动适配新工具 |
| **工具存储** | 内存注册表 | 简单快速，符合当前规模 |
| **参数验证** | 服务器端检查 | 安全可靠，用户体验好 |

### 9.2 架构决策

| 决策点 | 选择 | 理由 |
|--------|------|------|
| **存储方案** | 保持 localStorage | 符合轻量级定位，任务管理延后 |
| **向后兼容** | 保留现有对话功能 | 渐进式升级，降低风险 |
| **工具组织** | 独立 `tools/` 目录 | 清晰分离，易于扩展 |
| **设计文档** | 独立文档记录 | 重大架构变更需要详细设计 |

---

## 10. 附录

### 10.1 参考资料

- [GLM-4 Function Calling 文档](https://open.bigmodel.cn/dev/api#glm4)
- [DeepSeek API 文档](https://platform.deepseek.com/api-docs/)
- [OpenAI Function Calling 规范](https://platform.openai.com/docs/guides/function-calling)

### 10.2 相关文档

- `CLAUDE.md` - AI 编码助手工作指南（包含 AI 行为准则）
- `docs/ARCHITECTURE.md` - 项目架构文档
- `docs/CONTRIBUTING.md` - 开发指南
- `docs/PROGRESS.md` - 实施进度

---

**文档状态**：✅ 已完成（2026-01-17）

**实施结果**：
- ✅ 所有核心功能已实现
- ✅ 项目已达到预期目标
- ✅ 文档与实际实施完全一致

**项目阶段**：维护阶段

**最后更新**：2026-01-17
