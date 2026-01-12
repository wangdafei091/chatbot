# 本地开发环境搭建指南

> 快速在本地运行 AI 聊天机器人
> 更新时间：2026-01-12

## 前置要求

在开始之前，请确保你的电脑已安装：

- ✅ **Node.js** (版本 18.0 或更高)
- ✅ **npm** (随 Node.js 自动安装)
- ✅ **代码编辑器**（VS Code 推荐）

### 检查 Node.js 版本

```bash
node --version
# 应该显示 v18.0.0 或更高

npm --version
# 应该显示 9.0.0 或更高
```

如果没有安装 Node.js，请访问 https://nodejs.org/ 下载安装。

---

## 第一步：配置 API Key

### 1.1 获取 GLM API Key（智谱AI）

1. 访问智谱AI开放平台：https://open.bigmodel.cn/usercenter/apikeys
2. 注册/登录账号
3. 创建新的 API Key
4. 复制 API Key（格式类似：`xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.**********`）

### 1.2 获取 DeepSeek API Key

1. 访问 DeepSeek 平台：https://platform.deepseek.com/api-keys
2. 注册/登录账号
3. 创建新的 API Key
4. 复制 API Key（格式类似：`sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`）

### 1.3 配置环境变量

在项目根目录，编辑 `.env` 文件：

```bash
# 使用代码编辑器打开 .env 文件
# 或者使用命令行：
nano .env
```

填入你的 API Key：

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

**保存文件并关闭编辑器。**

> ⚠️ **重要**：`.env` 文件包含敏感信息，**不要提交到 Git**（已在 .gitignore 中配置）

---

## 第二步：安装依赖

打开终端（Terminal），进入项目目录：

```bash
# 进入项目目录
cd /Users/wangdafei/cursor_pro/chatbot

# 安装 Node.js 依赖
npm install
```

等待安装完成（可能需要 1-2 分钟）。你会看到类似这样的输出：

```
added 87 packages, and audited 88 packages in 45s
found 0 vulnerabilities
```

---

## 第三步：启动后端服务

在终端中运行：

```bash
npm start
```

你应该看到这样的输出：

```
=================================
🚀 AI Chatbot 后端服务已启动
=================================
📡 服务地址: http://localhost:3000
🔧 环境: development
🤖 默认模型: glm

已配置的模型:
  ✅ GLM-4 (智谱AI)
  ✅ DeepSeek Chat
=================================
```

**保持这个终端窗口运行**，不要关闭！

> 💡 **提示**：如果看到 "❌ 未配置 API Key"，说明 `.env` 文件配置有问题，请检查：
> - API Key 是否正确粘贴
> - 文件是否保存
> - 是否有多余的空格或引号

---

## 第四步：打开前端应用

### 方法 1：直接打开 HTML 文件

在 Finder 中找到 `index.html`，双击打开（会在浏览器中打开）。

**但是**，这种方法可能遇到 CORS 跨域问题。推荐使用方法 2。

### 方法 2：使用后端静态文件服务（推荐）✨

你的后端服务（`server.js`）已经配置了静态文件服务，所以：

1. 打开浏览器
2. 访问：**http://localhost:3000**
3. 你应该看到聊天界面

### 方法 3：使用 VS Code Live Server（可选）

如果你使用 VS Code：

1. 安装 "Live Server" 扩展
2. 右键点击 `index.html`
3. 选择 "Open with Live Server"
4. 会自动在浏览器中打开

---

## 第五步：测试聊天功能

### 5.1 发送第一条消息

在输入框中输入：

```
你好
```

按 **Enter** 键或点击发送按钮。

### 5.2 观察后端日志

在你的终端窗口中，你应该看到：

```
[2026-01-12T...] POST /api/chat
Calling glm API with message: "你好..."
```

### 5.3 查看浏览器控制台

1. 按 **F12** 打开开发者工具
2. 切换到 **Console（控制台）** 标签
3. 你应该看到：

```
✓ 聊天机器人已启动
✓ 当前使用模型: GLM
✓ 使用 glm-4 (glm) 回复
```

### 5.4 测试其他消息

试试这些消息：

```
介绍一下你自己
用 Python 写一个快速排序
今天天气怎么样？
```

---

## 切换 AI 模型

### 临时切换（仅当前会话）

打开浏览器控制台（F12），输入：

```javascript
currentProvider = 'deepseek';
// 然后发送消息，会使用 DeepSeek
```

### 永久切换（修改配置）

编辑 `.env` 文件：

```bash
DEFAULT_MODEL=deepseek  # 改为 deepseek
```

然后重启后端服务：

1. 在终端中按 **Ctrl + C** 停止服务
2. 再次运行 `npm start`

---

## 常见问题排查

### ❌ 问题 1：npm install 失败

**错误信息**：`EACCES: permission denied`

**解决方案**：

```bash
# macOS/Linux
sudo npm install

# 或者使用 nvm（推荐）
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
```

---

### ❌ 问题 2：API Key 无效

**错误信息**：`GLM_API_KEY 未配置` 或 `401 Unauthorized`

**解决方案**：

1. 检查 `.env` 文件是否存在
2. 确保 API Key 正确粘贴（没有多余空格）
3. 检查 API Key 是否有效（登录平台查看是否过期）
4. 重启后端服务（`.env` 文件修改后需要重启）

---

### ❌ 问题 3：端口 3000 已被占用

**错误信息**：`Error: listen EADDRINUSE: address already in use :::3000`

**解决方案 1**：关闭占用端口的程序

```bash
# macOS/Linux
lsof -ti:3000 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <进程ID> /F
```

**解决方案 2**：更改端口

编辑 `.env` 文件：

```bash
PORT=3001  # 改为其他端口
```

同时修改 `index.html` 中的 API_BASE_URL（暂时跳过，后续会自动适配）

---

### ❌ 问题 4：CORS 跨域错误

**错误信息**：浏览器控制台显示 `Access to fetch at 'http://localhost:3000/api/chat' from origin 'null' has been blocked by CORS policy`

**原因**：直接双击打开 HTML 文件（`file://` 协议）会触发 CORS 限制

**解决方案**：

使用 **http://localhost:3000** 访问，而不是直接打开 HTML 文件

---

### ❌ 问题 5：API 请求超时

**错误信息**：`API 调用失败: Request timeout` 或 `ETIMEDOUT`

**可能原因**：

1. 网络连接问题
2. API 服务暂时不可用
3. API Key 余额不足

**解决方案**：

1. 检查网络连接
2. 尝试切换到另一个模型（GLM ↔ DeepSeek）
3. 登录 API 提供商平台查看余额
4. 稍后重试

---

### ❌ 问题 6：对话历史丢失

**原因**：浏览器 localStorage 被清空

**解决方案**：

- 不要使用浏览器隐私模式（无痕模式）
- 不要清除浏览器缓存
- 对话历史保存在本地，清除浏览器数据会丢失

---

## 开发技巧

### 实时查看后端日志

后端服务会打印所有 API 请求：

```bash
[2026-01-12T10:30:45.123Z] POST /api/chat
Calling glm API with message: "你好..."
```

### 使用 Nodemon 自动重启

开发时，修改代码后需要手动重启。使用 Nodemon 可以自动重启：

```bash
# 安装 nodemon（已在 package.json 中配置）
npm install --save-dev nodemon

# 使用 nodemon 启动
npm run dev
```

现在修改 `server.js` 后会自动重启！

### 清除对话历史

打开浏览器控制台，输入：

```javascript
localStorage.clear();
location.reload();
```

---

## 项目文件结构

```
chatbot/
├── index.html           # 前端界面（已修改，集成 API）
├── server.js            # 后端服务（新建，支持 GLM + DeepSeek）
├── package.json         # Node.js 依赖配置（新建）
├── .env                 # 环境变量（需配置 API Key）
├── .env.example         # 环境变量模板（新建）
├── .gitignore          # Git 忽略规则
└── LOCAL_SETUP_GUIDE.md # 本地搭建指南（本文件）
```

---

## 下一步

### ✅ 本地测试成功后

你可以：

1. **测试功能**
   - 发送各种类型的消息
   - 测试长对话
   - 切换不同模型

2. **自定义**
   - 修改提示词（在 `server.js` 中）
   - 调整模型参数（temperature、max_tokens）
   - 添加新功能

3. **准备部署**
   - 购买域名（你已经有了 ✅）
   - 准备腾讯云服务器（你已经有了 ✅）
   - 参考 `DEVELOPMENT_ROADMAP.md` 部署到云端

### 📚 相关文档

- **开发路线图**：`DEVELOPMENT_ROADMAP.md`
- **项目说明**：`README.md`
- **功能路线图**：`FEATURE_ROADMAP.md`

---

## 技术支持

如果遇到问题：

1. **查看日志**：浏览器控制台（F12）和终端
2. **检查配置**：`.env` 文件是否正确
3. **查看文档**：`DEVELOPMENT_ROADMAP.md`
4. **重启服务**：很多问题重启可以解决

---

**祝你使用愉快！** 🎉

有问题随时问我（Claude Code）！
