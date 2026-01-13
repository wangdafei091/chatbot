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
│  │  │  - AIAdapter 类                  │    │  │
│  │  │  - 消息格式化                     │    │  │
│  │  │  - 历史管理                       │    │  │
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
│              外部AI服务                          │
│  ┌──────────────┐  ┌──────────────────┐        │
│  │  GLM-4 API   │  │  DeepSeek API    │        │
│  │  智谱AI      │  │                  │        │
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

## 扩展指南

### 添加新的AI模型

**步骤**：

1. **在 `config.js` 添加配置**
```javascript
ai: {
    newmodel: {
        model: process.env.NEWMODEL_MODEL || 'newmodel-chat',
        temperature: parseFloat(process.env.NEWMODEL_TEMPERATURE) || 0.7,
        max_tokens: parseInt(process.env.NEWMODEL_MAX_TOKENS) || 2000,
        timeout: parseInt(process.env.NEWMODEL_TIMEOUT) || 30000,
        streamTimeout: parseInt(process.env.NEWMODEL_STREAM_TIMEOUT) || 60000
    }
}
```

2. **在 `server.js` 添加API调用方法**
```javascript
static async chatWithNewModel(message, history = []) {
    const API_KEY = this.getApiKey('newmodel');
    const messages = this.formatMessages(message, history);
    const cfg = config.ai.newmodel;

    const response = await axios.post(
        'https://api.newmodel.com/v1/chat',
        { model: cfg.model, messages: messages },
        { headers: { 'Authorization': `Bearer ${API_KEY}` } }
    );

    return { content: response.data.choices[0].message.content };
}
```

3. **更新路由**
```javascript
// 在 chat() 方法中添加case
case 'newmodel':
    return await this.chatWithNewModel(message, history);
```

4. **添加环境变量**
```bash
NEWMODEL_API_KEY=your_key_here
NEWMODEL_MODEL=newmodel-chat
```

### 添加新的API端点

**步骤**：

1. **在 `server.js` 添加路由**
```javascript
/**
 * 新功能端点
 * POST /api/new-feature
 */
app.post('/api/new-feature', async (req, res) => {
    const { param1, param2 } = req.body;

    // 1. 验证请求
    if (!param1) {
        return res.status(400).json({ error: 'param1 required' });
    }

    try {
        // 2. 业务逻辑
        const result = await someFunction(param1, param2);

        // 3. 返回结果
        res.json({ success: true, data: result });
    } catch (error) {
        console.error('New Feature Error:', error);
        res.status(500).json({ error: error.message });
    }
});
```

2. **前端调用**
```javascript
async function callNewFeature(param1, param2) {
    const response = await fetch('/api/new-feature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ param1, param2 })
    });

    const data = await response.json();
    return data;
}
```

### 修改虚拟形象配置

**步骤**：

1. **编辑 `config/frontend.config.js`**
```javascript
avatars: {
    '新角色': {
        emoji: '😊',
        name: '新角色',
        status: '在线',
        personality: '性格描述',
        gradient: 'linear-gradient(135deg, #color1, #color2)'
    }
}
```

2. **重新生成配置**
```bash
npm run generate-config
```

3. **刷新浏览器**

---

## 相关文档

- 🔧 [搭建指南](SETUP.md) - 快速启动
- 📊 [实施进度](PROGRESS.md) - 开发计划
- 🗺️ [技术路线图](ROADMAP.md) - 长期规划

---

**最后更新**: 2026-01-12
**维护者**: 项目维护团队
