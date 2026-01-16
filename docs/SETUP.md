# 本地开发环境搭建指南

> AI 聊天机器人本地环境配置和运行指南
> 更新时间：2026-01-16

---

## 前置要求

- ✅ **Node.js** 18.0+ （检查：`node --version`）
- ✅ **npm** （随 Node.js 自动安装）
- ✅ **代码编辑器**（VS Code 推荐）

---

## 快速开始（5 分钟）

### 1. 获取 API Key

**GLM-4（智谱AI）**
- 访问：https://open.bigmodel.cn/usercenter/apikeys
- 注册/登录并创建 API Key
- 复制保存

**DeepSeek**
- 访问：https://platform.deepseek.com/api-keys
- 注册/登录并创建 API Key
- 复制保存

### 2. 配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑 .env 文件，填入 API Key
```

`.env` 文件内容：

```bash
# GLM (智谱AI) API 配置
GLM_API_KEY=你的GLM_API_KEY粘贴到这里

# DeepSeek API 配置
DEEPSEEK_API_KEY=你的DeepSeek_API_KEY粘贴到这里

# 默认使用的模型 (glm 或 deepseek)
DEFAULT_MODEL=glm

# 服务器端口
PORT=3000

# 节点环境
NODE_ENV=development
```

> ⚠️ **重要**：`.env` 文件包含敏感信息，已在 `.gitignore` 中配置，不会提交到 Git

### 3. 安装依赖并启动

```bash
# 安装依赖
npm install

# 启动服务
npm start
```

### 4. 访问应用

浏览器打开：**http://localhost:3000**

---

## 详细说明

### 项目结构

```
chatbot/
├── server.js                  # Node.js 后端服务
├── config.js                  # 后端配置
├── config/
│   ├── frontend.config.js     # 前端配置源
│   └── validators.js          # 配置验证器
├── scripts/
│   └── generate-config.js     # 配置生成脚本
├── public/
│   ├── index.html             # 前端界面
│   └── config.js              # 自动生成的前端配置
├── package.json               # 依赖配置
├── .env                       # 环境变量（需配置）
└── .env.example               # 环境变量模板
```

### 启动命令说明

| 命令 | 说明 |
|------|------|
| `npm start` | 生产模式启动 |
| `npm run dev` | 开发模式（使用 nodemon，代码修改自动重启） |
| `npm run generate-config` | 仅生成前端配置文件 |

### 配置验证

启动时会自动验证配置：

```
✅ 配置验证通过！
📊 配置摘要:
  环境: development
  端口: 3000
  默认模型: glm
  速率限制: 100 次/15 分钟
  已配置模型: GLM-4 DeepSeek
```

如果配置错误，应用会拒绝启动并显示具体错误信息。

---

## 常见问题排查

### ❌ npm install 失败

**错误**：`EACCES: permission denied`

**解决方案**：
```bash
# macOS/Linux
sudo npm install

# 或使用 nvm（推荐）
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
```

---

### ❌ API Key 无效

**错误**：`GLM_API_KEY 未配置` 或 `401 Unauthorized`

**检查清单**：
- [ ] `.env` 文件是否存在
- [ ] API Key 是否正确粘贴（没有多余空格）
- [ ] API Key 是否有效（登录平台查看）
- [ ] 重启后端服务（`.env` 修改后需要重启）

---

### ❌ 端口 3000 已被占用

**错误**：`Error: listen EADDRINUSE: address already in use :::3000`

**解决方案 1**：关闭占用进程
```bash
# macOS/Linux
lsof -ti:3000 | xargs kill -9
```

**解决方案 2**：更改端口
```bash
# 编辑 .env
PORT=3001
```

---

### ❌ 配置验证失败

**错误示例**：
```
❌ 配置验证失败!
PORT 必须在 1-65535 之间，当前值: 99999
```

**解决方案**：检查 `.env` 中的配置值，修正后重启

---

### ❌ API 请求超时

**可能原因**：
- 网络连接问题
- API 服务暂时不可用
- API Key 余额不足

**解决方案**：
1. 检查网络连接
2. 尝试切换模型（GLM ↔ DeepSeek）
3. 登录平台查看余额

---

## 开发技巧

### 使用 nodemon 自动重启

开发时修改代码后需要手动重启。使用 nodemon 可以自动重启：

```bash
npm run dev
```

### 查看后端日志

后端服务会打印所有 API 请求：

```
[2026-01-12T10:30:45.123Z] POST /api/chat
Calling glm API with message: "你好..."
```

### 清除对话历史

浏览器控制台执行：

```javascript
localStorage.clear();
location.reload();
```

### 切换 AI 模型

**临时切换**（当前会话）：
```javascript
// 浏览器控制台
currentProvider = 'deepseek';
```

**永久切换**（修改配置）：
```bash
# .env
DEFAULT_MODEL=deepseek
```

---

## 项目文件说明

### 后端文件

| 文件 | 说明 |
|------|------|
| `server.js` | Express 服务器，API 路由 |
| `config.js` | 后端配置（服务器、AI、安全） |
| `config/validators.js` | 配置验证器 |
| `config/frontend.config.js` | 前端配置源文件 |
| `scripts/generate-config.js` | 生成 `public/config.js` |

### 前端文件

| 文件 | 说明 |
|------|------|
| `public/index.html` | 前端界面（1272 行） |
| `public/config.js` | 前端配置（自动生成，勿编辑） |

---

## 技术栈

### 后端
- Node.js 18+
- Express.js
- axios（HTTP 客户端）
- dotenv（环境变量）
- express-rate-limit（速率限制）

### 前端
- HTML5 + CSS3 + 原生 JavaScript
- 无框架依赖

### AI 服务
- GLM-4（智谱AI）
- DeepSeek Chat

---

## 下一步

### 本地测试成功后

1. **测试功能**
   - 发送各种类型的消息
   - 测试长对话
   - 切换不同模型

2. **自定义**
   - 修改 AI 模型参数（temperature、max_tokens）
   - 自定义虚拟形象（参考 [AVATAR_GUIDE.md](AVATAR_GUIDE.md)）
   - 调整 UI 配色（修改 CSS 变量）

3. **准备部署**
   - 配置生产环境变量
   - 参考 [ROADMAP.md](ROADMAP.md) 的部署方案

### 相关文档

- 📊 [实施进度](PROGRESS.md) - 查看已完成和待办任务
- 🗺️ [开发路线图](ROADMAP.md) - 技术架构和长期规划
- 🎨 [虚拟形象配置](AVATAR_GUIDE.md) - 自定义虚拟形象

---

**技术支持**：遇到问题请查看后端日志（终端）和前端日志（浏览器 F12）
