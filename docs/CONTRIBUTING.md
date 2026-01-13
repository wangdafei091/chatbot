# 开发指南

> AI编码助手和人类开发者的开发规范
> **目标**：避免重复造轮子，确保代码一致性

---

## 📋 目录

- [快速理解项目](#快速理解项目)
- [开发前必读](#开发前必读)
- [编码规范](#编码规范)
- [常见任务指南](#常见任务指南)
- [AI编码助手提示](#ai编码助手提示)
- [常见陷阱](#常见陷阱)

---

## 快速理解项目

### 项目定位（30秒理解）

**轻量级AI聊天机器人** - 不是企业级应用

```
核心特征：
├── 单体应用（非微服务）
├── 无数据库（localStorage）
├── 最小依赖（6个npm包）
└── 快速启动（npm install → npm start）

非目标：
├── ❌ 企业级多用户系统
├── ❌ 云端对话历史
├── ❌ 复杂权限管理
└── ❌ 高并发场景
```

### 技术栈选择理由

| 技术 | 选择理由 | 不要替代为 |
|------|----------|------------|
| **Express.js** | 极简、快速开发 | NestJS、Koa |
| **原生JS** | 零依赖、快速迭代 | Vue、React |
| **SSE** | 单向流、自动重连 | WebSocket |
| **localStorage** | 零成本、隐私保护 | MongoDB、Redis |

**详细理由**：查看 [ARCHITECTURE.md](ARCHITECTURE.md#技术栈选择理由)

### 代码结构（1分钟理解）

```
后端核心：
├── server.js (652行)
│   ├── AIAdapter 类 - AI调用逻辑 ⭐
│   └── API 路由 - /api/chat, /api/chat/stream
├── config.js - 后端配置
├── config/validators.js - 配置验证
└── config/frontend.config.js - 前端配置源

前端核心：
└── public/index.html (1200行)
    ├── UI渲染
    ├── sendMessage() - 发送消息 ⭐
    ├── fetchStream() - SSE处理 ⭐
    └── localStorage管理

关键文件：
├── scripts/generate-config.js - 生成前端配置 ⚠️ 自动运行
└── public/config.js - 自动生成，勿手动编辑
```

---

## 开发前必读

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

---

## 编码规范

### JavaScript 风格

**命名约定**：
```javascript
// ✅ 好的命名
const getUserData = () => { };
const chatWithGLM = () => { };
const API_BASE_URL = '...';

// ❌ 避免的命名
const getData = () => { }; // 太模糊
const data = () => { }; // 不明确
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

## 常见任务指南

### 任务1：添加新的AI模型

**前提**：已阅读 [ARCHITECTURE.md](ARCHITECTURE.md#添加新的ai模型)

**步骤**：
1. 在 `.env` 添加 `NEWMODEL_API_KEY`
2. 在 `config.js` 添加配置对象
3. 在 `server.js` 的 `AIAdapter` 类添加方法：
   - `chatWithNewmodel()` - 普通调用
   - `chatWithNewmodelStream()` - 流式调用
4. 在 `chat()` 方法添加 `case`
5. 在 `validators.js` 添加验证

**代码模板**：
```javascript
// config.js
ai: {
    newmodel: {
        model: process.env.NEWMODEL_MODEL || 'newmodel-chat',
        temperature: parseFloat(process.env.NEWMODEL_TEMPERATURE) || 0.7,
        max_tokens: parseInt(process.env.NEWMODEL_MAX_TOKENS) || 2000,
        timeout: parseInt(process.env.NEWMODEL_TIMEOUT) || 30000,
        streamTimeout: parseInt(process.env.NEWMODEL_STREAM_TIMEOUT) || 60000
    }
}

// server.js - AIAdapter类
static async chatWithNewmodel(message, history = []) {
    const API_KEY = this.getApiKey('newmodel');
    const messages = this.formatMessages(message, history);
    const cfg = config.ai.newmodel;

    try {
        const response = await axios.post(
            'https://api.newmodel.com/v1/chat',
            {
                model: cfg.model,
                messages: messages,
                temperature: cfg.temperature,
                max_tokens: cfg.max_tokens
            },
            {
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json'
                },
                timeout: cfg.timeout
            }
        );

        return {
            content: response.data.choices[0].message.content,
            model: cfg.model,
            usage: response.data.usage
        };
    } catch (error) {
        console.error('Newmodel API Error:', error.response?.data || error.message);
        throw new Error(`Newmodel API 调用失败: ${error.response?.data?.error?.message || error.message}`);
    }
}

// 在 chat() 方法中
case 'newmodel':
    return await this.chatWithNewmodel(message, history);
```

### 任务2：添加新的API端点

**前提**：了解Express路由

**步骤**：
1. 在 `server.js` 添加路由处理函数
2. 添加请求验证
3. 实现业务逻辑
4. 添加错误处理
5. 更新前端调用

**代码模板**：
```javascript
/**
 * 新功能端点
 * POST /api/new-feature
 */
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

        // 3. 返回结果
        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('New Feature Error:', error);

        // 4. 错误处理
        res.status(500).json({
            error: error.message || '操作失败',
            code: 'OPERATION_FAILED'
        });
    }
});
```

### 任务3：修改前端配置

**前提**：理解配置生成流程

**步骤**：
1. 编辑 `config/frontend.config.js`
2. 运行 `npm run generate-config`
3. 刷新浏览器

**重要**：
- ❌ 不要直接编辑 `public/config.js`
- ✅ 修改源文件后重新生成

### 任务4：添加新的虚拟形象

**前提**：已阅读 [AVATAR_GUIDE.md](AVATAR_GUIDE.md)

**步骤**：
1. 编辑 `config/frontend.config.js`
2. 在 `avatars` 对象添加新角色
3. 运行 `npm run generate-config`
4. 刷新浏览器

**代码模板**：
```javascript
// config/frontend.config.js
avatars: {
    '新角色': {
        emoji: '😊',
        name: '新角色',
        status: '在线',
        personality: '性格描述',
        gradient: 'linear-gradient(135deg, #color1, #color2, #color3)'
    }
}
```

### 任务5：调试SSE流式响应

**前提**：了解Server-Sent Events

**调试步骤**：
1. **检查后端日志**
```bash
# 应该看到
[GLM Stream] 开始调用 API
[GLM Stream] 收到内容: "你"
[GLM Stream] 收到内容: "好"
[GLM Stream] 流结束
```

2. **检查前端Network**
```javascript
// 浏览器 DevTools → Network
// 找到 /api/chat/stream 请求
// 查看Response，应该看到：
data: {"type":"content","content":"你"}
data: {"type":"content","content":"好"}
data: {"type":"done"}
```

3. **常见问题**
- 流中断：检查 `abortController` 逻辑
- 数据不显示：检查 `ReadableStream` 解析
- CORS错误：检查后端CORS配置

---

## AI编码助手提示

### 给Claude/GitHub Copilot的提示

**项目上下文**：
```
这是一个轻量级AI聊天机器人项目（非企业级应用）。

核心特征：
- 单体Express.js应用（不要建议微服务）
- 无数据库（使用localStorage）
- 流式响应使用SSE（不要建议WebSocket）
- 前端使用原生JavaScript（不要建议框架）

技术栈选择理由：详见 docs/ARCHITECTURE.md

开发约束：
- 不要引入重型框架（Vue、React、NestJS）
- 不要添加数据库（MongoDB、PostgreSQL）
- 不要重写SSE为WebSocket
- public/config.js 是自动生成的，不要手动编辑

相关文档：
- docs/ARCHITECTURE.md - 架构设计
- docs/CONTRIBUTING.md - 本文档
- docs/SETUP.md - 搭建指南
```

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

**问题3**："建议迁移到Vue/React"

**回复**：
```
当前项目使用原生JavaScript是有意的设计：
- 零依赖，无需构建工具
- 快速迭代，修改即生效
- 学习价值，理解底层原理
- 轻量级，单文件可运行

前端框架会增加复杂度和构建步骤，与项目定位不符。
参考：docs/ARCHITECTURE.md#项目定位
```

---

## 常见陷阱

### 陷阱1：重复实现已有功能

**错误示例**：
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

### 陷阱2：修改生成文件

**错误示例**：
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

### 陷阱3：忽略项目定位

**错误示例**：
```
用户："添加用户认证功能"
AI助手："建议使用JWT + MongoDB + Passport.js..."

问题：
❌ 过度设计（项目当前不需要用户认证）
❌ 引入数据库（与无数据库架构冲突）
❌ 增加复杂度（违背轻量级定位）

正确做法：
✅ 先确认这是否符合项目定位
✅ 如果需要，说明这是重大架构变更
✅ 建议创建独立分支或新项目
```

### 陷阱4：不阅读现有代码

**错误示例**：
```javascript
// ❌ 没看现有代码就重写
function sendMessage(message) {
    fetch('/api/chat', { ... }); // 忽略了流式响应
}

// ✅ 基于现有代码扩展
// sendMessage() 已存在，支持流式响应
// 只需要修改部分逻辑
```

**建议**：
1. 先用Grep搜索相关功能
2. 阅读现有实现
3. 理解设计意图
4. 然后基于现有代码改进

---

## 检查清单

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

## 相关文档

- 🏗️ [架构文档](ARCHITECTURE.md) - 技术栈选择理由
- 🔧 [搭建指南](SETUP.md) - 快速启动
- 📊 [实施进度](PROGRESS.md) - 开发计划
- 🗺️ [技术路线图](ROADMAP.md) - 长期规划

---

**最后更新**: 2026-01-12
**维护者**: 项目维护团队

**重要**：本文档是为了帮助AI编码助手和人类开发者理解项目，避免重复造轮子和产生幻觉。
