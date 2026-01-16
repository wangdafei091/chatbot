# 开发指南

> AI编码助手和人类开发者的开发规范
> **目标**：避免重复造轮子，确保代码一致性

---

## 📋 目录

- [开发前必读](#开发前必读)
- [编码规范](#编码规范)
- [常见任务指南](#常见任务指南)
- [AI编码助手提示](#ai编码助手提示)
- [常见陷阱](#常见陷阱)
- [检查清单](#检查清单)
- [相关文档](#相关文档)

---

## 🚀 开发前必读

### 🔴 重要约束

**不要做的事情**：

1. **不要建议引入重型框架**
   - ❌ Vue、React、Angular（当前定位是轻量级）
   - ❌ NestJS、TypeScript（增加复杂度）
   - ✅ 保持当前技术栈

2. **不要建议添加数据库**
   - ❌ MongoDB、PostgreSQL、Redis
   - ❌ Prisma、TypeORM
   - ✅ 继续使用 localStorage

3. **不要重写流式响应**
   - ❌ WebSocket、Socket.io
   - ✅ 继续使用 SSE（已实现）

4. **不要修改生成文件**
   - ❌ `public/config.js` - 自动生成
   - ✅ 修改 `config/frontend.config.js`

5. **不要过度设计**
   - ❌ 微服务架构
   - ❌ 复杂的设计模式
   - ✅ 保持简单

### ✅ 鼓励的改进

- ✅ 性能优化（代码层面）
- ✅ UI/UX改进
- ✅ 新功能（符合项目定位）
- ✅ Bug修复
- ✅ 文档改进

### 📖 前置知识

在开始开发前，请先阅读：
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - 技术栈选择理由和架构决策 ⭐
- **[SETUP.md](SETUP.md)** - 本地开发环境配置和常用命令

---

## 📝 编码规范

### JavaScript 风格

**命名约定**：
```javascript
// ✅ 好的命名
const getUserData = () => { };
const chatWithGLM = () => { };
const API_BASE_URL = '...';

// ❌ 避免的命名
const getData = () => { }; // 太模糊
const temp = () => { }; // 无意义
```

**函数结构**：
```javascript
/**
 * 函数说明（JSDoc）
 * @param {string} message - 消息内容
 * @param {Array} history - 对话历史
 * @returns {Promise<Object>} API响应
 */
async function chatWithGLM(message, history = []) {
    // 1. 参数验证
    if (!message) {
        throw new Error('消息不能为空');
    }

    // 2. 业务逻辑
    const response = await fetch('/api/chat', {
        method: 'POST',
        body: JSON.stringify({ message, history })
    });

    // 3. 返回结果
    return response.json();
}
```

**错误处理**：
```javascript
// ✅ 好的错误处理
try {
    const result = await riskyOperation();
    return { success: true, data: result };
} catch (error) {
    console.error('Operation failed:', error);
    return { success: false, error: error.message };
}

// ❌ 避免静默失败
try {
    await riskyOperation();
} catch (error) {
    // 什么都不做 - 难以调试
}
```

### 注释规范

**需要注释的地方**：
```javascript
// ✅ 解释"为什么"
// 使用SSE而不是WebSocket，因为聊天场景只需要服务器→客户端的单向流
const response = await fetch('/api/chat/stream');

// ✅ 复杂逻辑的说明
// 解析SSE数据格式：data: {"content": "..."}
const lines = buffer.split('\n');

// ✅ TODO标记
// TODO: 添加消息重试机制
// FIXME: 流中断时可能出现数据丢失

// ❌ 不必要的注释
// 获取用户数据
const userData = getUserData();
```

### 代码组织

**文件内组织**：
```javascript
// 1. 导入
const express = require('express');
const axios = require('axios');

// 2. 配置
const PORT = process.env.PORT || 3000;

// 3. 类/函数定义
class AIAdapter { }
function helper() { }

// 4. 路由定义
app.post('/api/chat', ...);

// 5. 启动
app.listen(PORT, ...);
```

---

## 🛠️ 常见任务指南

### 任务1：添加新的AI模型

**前提**：已阅读 [ARCHITECTURE.md](ARCHITECTURE.md#添加新的ai模型)

**步骤**：
1. 在 `.env` 添加 `NEWMODEL_API_KEY`
2. 在 `config.js` 添加配置对象
3. 在 `server.js` 的 `AIAdapter` 类添加方法
4. 在 `validators.js` 添加验证

**代码模板**：
```javascript
// config.js
ai: {
    newmodel: {
        model: process.env.NEWMODEL_MODEL || 'newmodel-chat',
        temperature: parseFloat(process.env.NEWMODEL_TEMPERATURE) || 0.7,
        max_tokens: parseInt(process.env.NEWMODEL_MAX_TOKENS) || 2000
    }
}

// server.js
static async chatWithNewmodel(message, history = []) {
    const API_KEY = this.getApiKey('newmodel');
    const messages = this.formatMessages(message, history);
    const cfg = config.ai.newmodel;

    try {
        const response = await axios.post(
            'https://api.newmodel.com/v1/chat',
            { model: cfg.model, messages: messages },
            {
                headers: { 'Authorization': `Bearer ${API_KEY}` },
                timeout: cfg.timeout
            }
        );
        return { content: response.data.choices[0].message.content };
    } catch (error) {
        throw new Error(`Newmodel API 调用失败: ${error.message}`);
    }
}
```

### 任务2：添加新的API端点

**步骤**：
1. 在 `server.js` 添加路由处理函数
2. 添加请求验证
3. 实现业务逻辑
4. 添加错误处理

**代码模板**：
```javascript
app.post('/api/new-feature', async (req, res) => {
    const { param1, param2 } = req.body;

    // 1. 验证请求
    if (!param1) {
        return res.status(400).json({
            error: 'param1 is required',
            code: 'INVALID_PARAM'
        });
    }

    try {
        // 2. 业务逻辑
        const result = await someAsyncOperation(param1, param2);
        res.json({ success: true, data: result });
    } catch (error) {
        console.error('New Feature Error:', error);
        res.status(500).json({
            error: error.message || '操作失败',
            code: 'OPERATION_FAILED'
        });
    }
});
```

### 任务3：修改前端配置

**步骤**：
1. 编辑 `config/frontend.config.js`
2. 运行 `npm run generate-config`
3. 刷新浏览器

**重要**：❌ 不要直接编辑 `public/config.js`

### 任务4：开发新工具（Function Calling）

**前提**：已阅读 [Function Calling 框架设计](../design/function-calling-framework.md)

**工具开发流程**：

#### 步骤1：定义工具

```javascript
// tools/new-tool.js

// 工具定义（发送给 AI）
const newToolDefinition = {
  type: 'function',
  function: {
    name: 'newTool',
    description: '工具功能描述',
    parameters: {
      type: 'object',
      properties: {
        param1: {
          type: 'string',
          description: '参数说明'
        }
      },
      required: ['param1']
    }
  }
}

// 工具实现（服务器端执行）
const newToolHandler = async (params) => {
  const { param1 } = params
  // 实际业务逻辑
  return { result: '...' }
}

module.exports = {
  name: 'newTool',
  definition: newToolDefinition,
  handler: newToolHandler
}
```

#### 步骤2：注册工具

```javascript
// tools/index.js
const newTool = require('./new-tool')

module.exports = [
  newTool,
  // 其他工具...
]
```

---

## 🤖 AI编码助手提示

### 常见问题回复模板

**问题1**："建议添加数据库存储对话历史"

**回复**：
```
当前项目定位是轻量级应用，使用localStorage存储对话历史是有意的设计决策：
- 零运维成本
- 隐私保护（数据不离开用户设备）
- 简化部署

如果需要跨设备同步或用户认证，这已经超出项目当前定位范围。
参考：docs/ARCHITECTURE.md#决策2：无数据库架构
```

**问题2**："建议使用WebSocket替代SSE"

**回复**：
```
SSE（Server-Sent Events）是有意的选择：
- 聊天场景只需要服务器→客户端的单向流
- 浏览器原生支持，无需额外库
- 自动重连机制
- 实现更简单

WebSocket的双向通信在聊天场景中是不必要的复杂度。
参考：docs/ARCHITECTURE.md#技术栈选择理由
```

---

## ⚠️ 常见陷阱

**详细的陷阱说明和代码示例**：请参阅 [CLAUDE.md 的常见陷阱章节](../CLAUDE.md#常见陷阱)

**快速参考**：
- ✅ 使用现有代码（`AIAdapter`、`validators.js`）
- ✅ 编辑配置源文件（`config/frontend.config.js`）
- ✅ 先搜索相关功能，阅读现有实现
- ✅ 基于现有代码改进，而非重写
- ❌ 不要重复造轮子
- ❌ 不要修改生成文件（`public/config.js`）
- ❌ 不要建议重型框架/数据库（违反项目定位）

---

## ✅ 检查清单

### 提交代码前

- [ ] 代码符合现有风格
- [ ] 添加必要的注释
- [ ] 没有引入不必要的依赖
- [ ] 没有重复造轮子
- [ ] 测试通过（npm start）
- [ ] 配置验证通过
- [ ] 更新相关文档

### 功能开发前

- [ ] 阅读 [ARCHITECTURE.md](ARCHITECTURE.md)
- [ ] 确认功能符合项目定位
- [ ] 检查是否已有类似实现
- [ ] 评估复杂度是否合理
- [ ] 考虑长期维护成本

---

## 📚 相关文档

- 🏗️ [架构文档](ARCHITECTURE.md) - 技术栈选择理由 ⭐
- 🔧 [搭建指南](SETUP.md) - 快速启动和常用命令
- 📊 [实施进度](PROGRESS.md) - 开发计划
- 🗺️ [技术路线图](ROADMAP.md) - 长期规划

---

**最后更新**: 2026-01-16
**维护者**: 项目维护团队
