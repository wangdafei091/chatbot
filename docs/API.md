# API 参考文档

> AI 聊天机器人后端 API 接口完整说明
> **最后更新**：2026-01-16
> **API 版本**：v2.2.0

---

## 📋 目录

- [API 概览](#api-概览)
- [认证与授权](#认证与授权)
- [通用响应格式](#通用响应格式)
- [错误码说明](#错误码说明)
- [API 端点](#api-端点)
  - [健康检查](#1-健康检查)
  - [模型管理](#2-模型管理)
  - [聊天接口](#3-聊天接口)
  - [配置管理](#4-配置管理)
  - [工具系统](#5-工具系统)
- [数据模型](#数据模型)
- [使用示例](#使用示例)

---

## API 概览

### 基础信息

**Base URL**：
- 开发环境：`http://localhost:3000`
- 生产环境：`https://your-domain.com`

**Content-Type**：`application/json`

**响应格式**：JSON

### API 端点列表

| 方法 | 端点 | 说明 | 认证 |
|------|------|------|------|
| GET | `/api/health` | 健康检查 | ❌ 否 |
| GET | `/api/models` | 获取可用模型列表 | ❌ 否 |
| GET | `/api/config` | 获取当前配置 | ❌ 否 |
| POST | `/api/chat` | 非流式聊天 | ❌ 否 |
| POST | `/api/chat/stream` | 流式聊天（SSE） | ❌ 否 |
| POST | `/api/set-model` | 切换默认模型 | ❌ 否 |
| GET | `/api/tools` | 获取工具列表 | ❌ 否 |
| POST | `/api/chat/tools` | Function Calling 聊天 | ❌ 否 |

---

## 认证与授权

**当前版本**：所有 API 端点**无需认证**（开放访问）

**安全说明**：
- 生产环境建议添加 API Key 认证
- 建议配置 CORS 策略限制访问来源
- 建议添加速率限制（当前已配置：100次/15分钟）

---

## 通用响应格式

### 成功响应

```json
{
  "success": true,
  "data": { ... }
}
```

### 错误响应

```json
{
  "error": "错误描述",
  "code": "ERROR_CODE",
  "details": "详细错误信息（仅开发环境）"
}
```

---

## 错误码说明

| 错误码 | HTTP状态码 | 说明 | 示例 |
|--------|-----------|------|------|
| `INVALID_MESSAGE` | 400 | 消息内容为空或格式错误 | 消息不能为空 |
| `MESSAGE_TOO_LONG` | 400 | 消息长度超过限制 | 消息长度不能超过10000字符 |
| `INVALID_PROVIDER` | 400 | 无效的模型提供商 | 必须是 glm 或 deepseek |
| `API_KEY_NOT_CONFIGURED` | 400 | API Key 未配置 | GLM API KEY 未配置 |
| `INVALID_PARAMS` | 400 | 参数验证失败 | 缺少必需参数 |
| `API_ERROR` | 500 | AI 服务错误 | AI 服务暂时不可用 |
| `TOOL_EXECUTION_ERROR` | 500 | 工具执行失败 | 工具执行出错 |
| `RATE_LIMIT_EXCEEDED` | 429 | 超过速率限制 | 请求过于频繁 |

---

## API 端点

### 1. 健康检查

#### 1.1 检查服务状态

**端点**：`GET /api/health`

**说明**：检查服务是否正常运行，以及已配置的 AI 模型

**请求**：无需参数

**响应示例**：
```json
{
  "status": "ok",
  "timestamp": "2026-01-16T10:30:00.000Z",
  "models": {
    "glm": true,
    "deepseek": true
  }
}
```

**字段说明**：
- `status`：服务状态（`ok` | `error`）
- `timestamp`：当前时间（ISO 8601格式）
- `models`：已配置的模型
  - `glm`：GLM-4 API Key 是否已配置
  - `deepseek`：DeepSeek API Key 是否已配置

---

### 2. 模型管理

#### 2.1 获取可用模型列表

**端点**：`GET /api/models`

**说明**：获取所有已配置 API Key 的可用模型

**请求**：无需参数

**响应示例**：
```json
{
  "models": [
    {
      "id": "glm",
      "name": "GLM-4 (智谱AI)",
      "provider": "glm"
    },
    {
      "id": "deepseek",
      "name": "DeepSeek Chat",
      "provider": "deepseek"
    }
  ],
  "default": "glm"
}
```

**字段说明**：
- `models`：模型列表
  - `id`：模型ID（用于请求）
  - `name`：模型显示名称
  - `provider`：提供商标识
- `default`：默认模型ID

---

#### 2.2 切换默认模型

**端点**：`POST /api/set-model`

**说明**：切换默认使用的 AI 模型

**请求参数**：
```json
{
  "provider": "glm"
}
```

**参数说明**：
- `provider`（必需）：模型提供商
  - 可选值：`glm` | `deepseek`

**响应示例**：
```json
{
  "success": true,
  "message": "已切换到 GLM 模型",
  "currentModel": "glm"
}
```

**错误响应**：
```json
{
  "error": "无效的模型提供商，必须是 glm 或 deepseek",
  "code": "INVALID_PROVIDER"
}
```

---

### 3. 聊天接口

#### 3.1 非流式聊天

**端点**：`POST /api/chat`

**说明**：发送消息给 AI，获取完整响应（非流式）

**请求参数**：
```json
{
  "message": "你好，请介绍一下自己",
  "history": [
    {
      "role": "user",
      "content": "你好"
    },
    {
      "role": "assistant",
      "content": "你好！我是AI助手"
    }
  ],
  "provider": "glm"
}
```

**参数说明**：
- `message`（必需）：用户消息内容
  - 类型：`string`
  - 最大长度：10000字符
- `history`（可选）：对话历史
  - 类型：`array`
  - 默认值：`[]`
- `provider`（可选）：AI 模型提供商
  - 类型：`string`
  - 可选值：`glm` | `deepseek`
  - 默认值：系统默认模型

**响应示例**：
```json
{
  "reply": "你好！我是AI聊天助手...",
  "model": "glm-4",
  "usage": {
    "prompt_tokens": 10,
    "completion_tokens": 20,
    "total_tokens": 30
  },
  "provider": "glm"
}
```

**字段说明**：
- `reply`：AI 的回复内容
- `model`：使用的模型名称
- `usage`：Token 使用统计
  - `prompt_tokens`：输入Token数
  - `completion_tokens`：输出Token数
  - `total_tokens`：总Token数
- `provider`：模型提供商

**错误响应**：
```json
{
  "error": "消息内容不能为空",
  "code": "INVALID_MESSAGE"
}
```

---

#### 3.2 流式聊天（推荐）⭐

**端点**：`POST /api/chat/stream`

**说明**：发送消息给 AI，以流式方式获取响应（Server-Sent Events）

**请求参数**：
```json
{
  "message": "你好",
  "history": [],
  "provider": "glm",
  "useTools": true
}
```

**参数说明**：
- `message`（必需）：用户消息内容
- `history`（可选）：对话历史
- `provider`（可选）：AI 模型提供商
- `useTools`（可选）：是否启用 Function Calling
  - 类型：`boolean`
  - 默认值：`false`

**响应格式**：Server-Sent Events (SSE)

**SSE 数据流示例**：
```
data: {"type":"start","message":"开始生成..."}

data: {"type":"token","content":"你"}

data: {"type":"token","content":"好"}

data: {"type":"token","content":"！"}

data: {"type":"tool","tool":"summarizeArticle","params":{"content":"..."}}

data: {"type":"end","usage":{"prompt_tokens":10,"completion_tokens":20}}
```

**SSE 事件类型**：
- `start`：开始生成
- `token`：生成的文本片段
- `tool`：工具调用信息（如果启用 Function Calling）
- `end`：生成结束
- `error`：生成错误

**JavaScript 客户端示例**：
```javascript
const response = await fetch('/api/chat/stream', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message, history, provider })
});

const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  const chunk = decoder.decode(value);
  const lines = chunk.split('\n');

  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const data = JSON.parse(line.slice(6));

      if (data.type === 'token') {
        // 追加文本到消息气泡
        appendMessage(data.content);
      } else if (data.type === 'tool') {
        // 显示工具调用信息
        showToolCall(data.tool, data.params);
      } else if (data.type === 'end') {
        // 显示使用统计
        showUsage(data.usage);
      }
    }
  }
}
```

---

#### 3.3 Function Calling 聊天

**端点**：`POST /api/chat/tools`

**说明**：启用 Function Calling 的聊天接口，AI 可以自动调用工具

**请求参数**：
```json
{
  "message": "帮我总结这篇文章的主要内容",
  "history": [],
  "provider": "glm"
}
```

**参数说明**：
- `message`（必需）：用户消息内容
- `history`（可选）：对话历史
- `provider`（可选）：AI 模型提供商

**响应格式**：Server-Sent Events (SSE)

**工具调用流程**：
```
1. 用户发送消息
   ↓
2. AI 判断是否需要调用工具
   ↓
3. 如果需要，返回工具调用信息
   data: {"type":"tool","tool":"summarizeArticle","params":{...}}
   ↓
4. 服务器执行工具
   ↓
5. 将工具结果返回给 AI
   ↓
6. AI 基于工具结果生成最终回复
   data: {"type":"token","content":"..."}
   ↓
7. 返回最终回复
   data: {"type":"end","usage":{...}}
```

**可用的工具**：
- `summarizeArticle` - 文章总结
- `extractKeyInfo` - 关键信息提取
- `getWeather` - 天气查询

---

### 4. 配置管理

#### 4.1 获取当前配置

**端点**：`GET /api/config`

**说明**：获取当前系统的配置信息

**请求**：无需参数

**响应示例**：
```json
{
  "defaultModel": "glm",
  "availableModels": {
    "glm": true,
    "deepseek": true
  }
}
```

**字段说明**：
- `defaultModel`：当前默认模型
- `availableModels`：可用模型状态
  - `glm`：GLM-4 是否可用
  - `deepseek`：DeepSeek 是否可用

---

### 5. 工具系统

#### 5.1 获取工具列表

**端点**：`GET /api/tools`

**说明**：获取所有已注册的 Function Calling 工具

**请求**：无需参数

**响应示例**：
```json
{
  "tools": [
    {
      "name": "summarizeArticle",
      "description": "总结文章的关键信息",
      "parameters": {
        "type": "object",
        "properties": {
          "content": {
            "type": "string",
            "description": "文章内容"
          }
        },
        "required": ["content"]
      }
    },
    {
      "name": "extractKeyInfo",
      "description": "提取文章中的关键信息",
      "parameters": {
        "type": "object",
        "properties": {
          "content": {
            "type": "string",
            "description": "文章内容"
          }
        },
        "required": ["content"]
      }
    },
    {
      "name": "getWeather",
      "description": "查询指定城市的实时天气",
      "parameters": {
        "type": "object",
        "properties": {
          "city": {
            "type": "string",
            "description": "城市名称（支持中英文）"
          }
        },
        "required": ["city"]
      }
    }
  ],
  "count": 3
}
```

**字段说明**：
- `tools`：工具列表
  - `name`：工具名称
  - `description`：工具描述
  - `parameters`：参数定义（JSON Schema格式）
- `count`：工具总数

---

## 数据模型

### 对话历史 (ConversationHistory)

```typescript
type ConversationHistory = Array<{
  role: 'user' | 'assistant' | 'tool';
  content: string;
  toolCallId?: string;  // 工具调用时提供
  toolName?: string;    // 工具名称
}>;
```

### 消息请求 (MessageRequest)

```typescript
interface MessageRequest {
  message: string;        // 用户消息
  history?: ConversationHistory;  // 对话历史
  provider?: 'glm' | 'deepseek';  // AI提供商
  useTools?: boolean;     // 是否启用工具
}
```

### 工具调用 (ToolCall)

```typescript
interface ToolCall {
  type: 'tool';
  tool: string;           // 工具名称
  params: Record<string, any>;  // 工具参数
}
```

### Token 使用统计 (TokenUsage)

```typescript
interface TokenUsage {
  prompt_tokens: number;      // 输入Token数
  completion_tokens: number;  // 输出Token数
  total_tokens: number;       // 总Token数
}
```

---

## 使用示例

### 示例1：简单的聊天对话

```javascript
// 发送消息
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: '你好，请介绍一下你自己',
    provider: 'glm'
  })
});

const data = await response.json();
console.log(data.reply);  // AI 的回复
console.log(data.usage);  // Token 使用统计
```

### 示例2：流式聊天

```javascript
const response = await fetch('/api/chat/stream', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: '写一首关于春天的诗',
    provider: 'glm'
  })
});

const reader = response.body.getReader();
const decoder = new TextDecoder();
let fullResponse = '';

while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  const chunk = decoder.decode(value);
  const lines = chunk.split('\n');

  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const data = JSON.parse(line.slice(6));

      if (data.type === 'token') {
        fullResponse += data.content;
        console.log(fullResponse);  // 实时显示
      }
    }
  }
}
```

### 示例3：多轮对话

```javascript
let history = [];

// 第一轮
history.push({ role: 'user', content: '我叫小明' });
let response = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: '我叫小明',
    history: history,
    provider: 'glm'
  })
});
let data = await response.json();
history.push({ role: 'assistant', content: data.reply });

// 第二轮
history.push({ role: 'user', content: '我叫什么名字？' });
response = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: '我叫什么名字？',
    history: history,
    provider: 'glm'
  })
});
data = await response.json();
console.log(data.reply);  // "你叫小明"
```

### 示例4：使用 Function Calling

```javascript
const response = await fetch('/api/chat/tools', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: '帮我查询北京的天气',
    provider: 'glm'
  })
});

const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  const chunk = decoder.decode(value);
  const lines = chunk.split('\n');

  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const data = JSON.parse(line.slice(6));

      if (data.type === 'tool') {
        console.log('调用工具:', data.tool);
        console.log('参数:', data.params);
      } else if (data.type === 'token') {
        process.stdout.write(data.content);  // 逐字显示
      }
    }
  }
}
```

---

## 速率限制

**当前配置**：每个 IP 地址每 15 分钟最多 100 次请求

**超过限制时的响应**：
```json
{
  "error": "请求过于频繁，请稍后重试",
  "code": "RATE_LIMIT_EXCEEDED"
}
```

**HTTP 状态码**：`429 Too Many Requests`

---

## 版本历史

| 版本 | 日期 | 变更说明 |
|------|------|---------|
| v2.2.0 | 2026-01-16 | 新增 Function Calling API |
| v2.1.0 | 2026-01-15 | 新增工具系统接口 |
| v2.0.0 | 2026-01-12 | 新增流式聊天接口 |
| v1.0.0 | 2026-01-10 | 初始版本 |

---

## 相关文档

- [架构文档](ARCHITECTURE.md) - 系统架构说明
- [开发指南](CONTRIBUTING.md) - 开发规范
- [故障排查](TROUBLESHOOTING.md) - 常见问题解决

---

**最后更新**：2026-01-16
**维护者**：项目维护团队
