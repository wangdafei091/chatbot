# 项目开发路线图

> AI 聊天机器人完整的技术架构和功能规划
> 最后更新：2026-01-12

---

## 📋 目录

- [项目现状](#项目现状)
- [技术架构](#技术架构)
- [开发阶段](#开发阶段)
- [功能模块](#功能模块)
- [技术栈](#技术栈)
- [部署方案](#部署方案)

---

## 项目现状

### 当前版本：v2.0.0（AI 集成版）✅

**已完成**：
- ✅ 真实 AI API 集成（GLM-4、DeepSeek）
- ✅ **流式响应（SSE 打字机效果）** ✨
- ✅ 多轮对话上下文记忆
- ✅ 对话历史保存（localStorage）
- ✅ 完整的本地开发环境
- ✅ 错误处理和重试机制

**技术栈**：
- 前端：HTML5 + CSS3 + 原生 JavaScript
- 后端：Node.js 18 + Express.js
- AI 模型：GLM-4（智谱AI）、DeepSeek Chat

---

## 技术架构

### 整体架构

```
┌─────────────────────────────────────┐
│         用户浏览器                  │
│  ┌───────────────────────────────┐  │
│  │  前端 (index.html)            │  │
│  │  - 消息界面                   │  │
│  │  - 虚拟形象                   │  │
│  │  - 对话历史 (localStorage)    │  │
│  └───────────────────────────────┘  │
└─────────────┬───────────────────────┘
              │ HTTPS
              ▼
┌─────────────────────────────────────┐
│      后端服务器 (Node.js)           │
│  ┌───────────────────────────────┐  │
│  │  Express.js API 服务          │  │
│  │  - /api/chat                  │  │
│  │  - /api/models                │  │
│  │  - /api/health                │  │
│  │  - 静态文件服务               │  │
│  └───────────────────────────────┘  │
└─────────────┬───────────────────────┘
              │ HTTPS
              ▼
┌─────────────────────────────────────┐
│        AI 服务提供商                 │
│  - GLM-4 (智谱AI)                   │
│  - DeepSeek Chat                    │
└─────────────────────────────────────┘
```

### API 架构

**后端接口**：
- `POST /api/chat` - 聊天接口（普通响应）
- `POST /api/chat/stream` - **流式聊天接口（SSE）** ✨
- `GET /api/health` - 健康检查
- `GET /api/models` - 模型列表
- `POST /api/set-model` - 切换模型
- `GET /api/config` - 配置信息

**前端功能**：
- API 调用封装
- **流式响应处理（ReadableStream + SSE）** ✨
- 实时打字机效果
- 对话历史管理
- 错误处理
- localStorage 持久化

---

## 开发阶段

### ✅ 阶段 1：MVP（已完成 2026-01-12）

**目标**：本地运行真实 AI 对话

**已完成**：
- ✅ Node.js 后端服务搭建（587 行）
- ✅ GLM-4 和 DeepSeek API 集成（普通 + 流式）
- ✅ 前端 API 调用实现
- ✅ **流式响应实现（SSE + ReadableStream）** ✨
- ✅ 对话历史管理
- ✅ 错误处理机制
- ✅ 本地开发环境配置
- ✅ 完整文档体系

**技术实现**：
- 后端：`server.js`（587 行，含流式接口）
- 前端：`index.html`（1272 行，含流式处理）
- 配置：`.env` 环境变量管理
- 流式技术：Server-Sent Events (SSE) + ReadableStream API

---

### 🚧 阶段 2：功能增强（进行中，预计 2-4 周）

**目标**：提升用户体验和功能完整性

#### ✅ 已完成功能

**1. 流式响应（SSE）** ✅ ✨
- ✅ 打字机效果（实时逐字显示）
- ✅ 后端 Server-Sent Events 接口（`/api/chat/stream`）
- ✅ 前端 ReadableStream 处理
- ✅ GLM-4 流式调用（`chatWithGLMStream`）
- ✅ DeepSeek 流式调用（`chatWithDeepSeekStream`）
- ✅ 流中断错误处理
- ✅ 提升所有场景的对话体验

#### 中优先级功能（待开发）

**2. 历史对话管理**
- 查看历史对话列表
- 恢复历史对话
- 删除对话

**3. 对话导出**
- 导出为 JSON
- 导出为纯文本

**4. 模型切换界面**
- 前端模型选择器
- 显示当前模型

---

### 📋 阶段 3：架构升级（计划中，3-6 个月）

**目标**：为长期维护和扩展做准备

#### 后端优化
- 请求缓存（减少 API 调用）
- 速率限制（防止滥用）
- 日志系统（Winston / Pino）
- 数据库集成（PostgreSQL / MongoDB）
- 用户认证系统（可选）

#### 前端优化
- 迁移到 Vue 3（可选）
- 添加 TypeScript（可选）
- 状态管理（Pinia / Zustand）
- 单元测试（Vitest / Jest）

#### 部署优化
- Docker 容器化
- CI/CD 流程
- 监控和告警
- 备份策略

---

## 功能模块

### 1. AI 对话系统 🔴 P0

**当前状态**：
- ✅ 基础 UI 框架
- ✅ GLM-4 集成（普通 + 流式）
- ✅ DeepSeek Chat 集成（普通 + 流式）
- ✅ 多轮对话上下文
- ✅ 对话历史保存
- ✅ **流式响应（SSE）** ✨

**待实现**：
- [ ] 图片生成和显示
- [ ] 文件上传和分析
- [ ] 语音消息（转文字）

---

### 2. 虚拟形象系统 🟡 P1

**当前状态**：
- ✅ Emoji 占位符
- ✅ 角色切换功能（4 个预设角色）
- ✅ 持久化存储

**待实现**：
- [ ] Lottie 动画集成
- [ ] 3D 模型支持（Three.js）
- [ ] 用户上传自定义形象
- [ ] 表情系统（开心、惊讶、思考）
- [ ] 根据对话内容切换表情

---

### 3. 输入交互 🟡 P1

**当前状态**：
- ✅ 文本输入
- ✅ 自动高度调整
- ✅ Enter 发送 / Shift+Enter 换行

**待实现**：
- [ ] 语音输入（Web Speech API）
- [ ] 快捷指令（/clear /export /settings）
- [ ] @ 提及（引用历史消息）
- [ ] 图片拖拽上传
- [ ] 文件上传（PDF、Word、Excel）

---

### 4. 用户体验 🟡 P1

**当前状态**：
- ✅ 基础响应式
- ✅ 移动端适配

**待实现**：
- [ ] 主题系统（深色模式）
- [ ] 个性化设置（字体大小、消息密度）
- [ ] 侧边栏（历史记录、设置）
- [ ] 手势交互（滑动、长按）

---

### 5. 高级功能 🟢 P2

**待实现**：
- [ ] 智能建议（推荐问题、快速回复）
- [ ] 协作功能（分享对话、评论）
- [ ] 浏览器插件（网页摘要）
- [ ] API 开放（第三方集成）
- [ ] 数据分析（使用统计）

---

## 技术栈

### 当前技术栈

**前端**：
- HTML5 + CSS3 + 原生 JavaScript
- 无框架依赖
- CSS Variables（主题系统）

**后端**：
- Node.js 18+
- Express.js
- axios（HTTP 客户端）
- dotenv（环境变量）

**AI 服务**：
- GLM-4（智谱AI）
- DeepSeek Chat

---

### 建议技术栈（长期）

**前端升级**：
- Vue 3 / React
- TypeScript
- Vite（构建工具）
- Pinia / Zustand（状态管理）
- Naive UI / Shadcn UI（组件库）

**后端优化**：
- NestJS（可选）
- Prisma（ORM）
- PostgreSQL / MongoDB
- Redis（缓存）
- Winston（日志）

**部署**：
- Docker
- Nginx
- PM2（进程管理）
- Let's Encrypt（SSL）

---

## 部署方案

### 本地开发

**环境要求**：
- Node.js 18+
- npm 或 yarn

**快速开始**：
```bash
# 1. 安装依赖
npm install

# 2. 配置环境变量
cp .env.example .env
# 编辑 .env 填入 API Key

# 3. 启动服务
npm start

# 4. 访问
open http://localhost:3000
```

详细说明：查看 [docs/SETUP_GUIDE.md](SETUP_GUIDE.md)

---

### 腾讯云部署（推荐）

**服务器配置**：
- 轻量应用服务器
- 2 核 CPU
- 4GB 内存
- 60GB SSD
- 成本：约 ¥60-100/月

**部署架构**：
```
Nginx (反向代理)
  ├─ 静态文件托管（/ → index.html）
  └─ API 反向代理（/api/* → Node.js）

Node.js 后端
  ├─ Express.js API 服务
  ├─ GLM/DeepSeek API 调用
  └─ 环境变量管理
```

**部署步骤**：
1. 安装 Node.js 和 Nginx
2. 配置 SSL 证书（Let's Encrypt）
3. 上传代码到服务器
4. 配置环境变量
5. 启动服务（PM2）
6. 配置 Nginx 反向代理

**Nginx 配置示例**：
```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # 前端静态文件
    location / {
        root /var/www/chatbot;
        index index.html;
    }

    # API 反向代理
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

### 其他部署选项

**Vercel / Netlify**：
- 优点：自动部署、Serverless Functions
- 缺点：免费额度有限
- 适合：个人项目、低流量

**自建服务器**：
- 优点：完全控制、成本可控
- 缺点：需要运维
- 适合：生产环境、高可用要求

---

## 成本估算

### 服务器成本

| 方案 | 月成本 | 适用场景 |
|------|--------|----------|
| 腾讯云轻量服务器 | ¥60-100 | 推荐 |
| Vercel（Hobby） | 免费 | 个人项目 |
| Vercel（Pro） | $20/月 | 商业项目 |
| 自建服务器（云） | ¥50-200/月 | 生产环境 |

### AI API 成本

**假设**：每天 100 个用户，每人 10 轮对话

```
每天消息数: 2,000 条
每天 tokens: 200,000
每月 tokens: 6,000,000

GLM-4: 6M tokens × ¥0.008 = ¥48/月
DeepSeek: 6M tokens × ¥0.001 = ¥6/月

总计：约 ¥50-100/月
```

**新用户福利**：
- GLM：通常有免费额度
- DeepSeek：新用户优惠

---

## 下一步行动

查看详细的实施计划：
- 📊 [进度跟踪](PROGRESS.md) - 已完成和待办任务
- 📘 [快速入门](GETTING_STARTED.md) - 快速上手指南
- 🔧 [搭建指南](SETUP_GUIDE.md) - 详细配置说明

---

**文档维护**：定期更新以反映最新进展
**最后更新**：2026-01-12
