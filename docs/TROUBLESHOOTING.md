# 故障排查指南

> 常见问题及解决方案
> **最后更新**：2026-01-16

---

## 📋 目录

- [快速诊断](#快速诊断)
- [环境问题](#环境问题)
- [API 问题](#api-问题)
- [流式响应问题](#流式响应问题)
- [Function Calling 问题](#function-calling-问题)
- [前端问题](#前端问题)
- [性能问题](#性能问题)
- [调试技巧](#调试技巧)

---

## 快速诊断

### 问题诊断流程图

```
遇到问题
    │
    ├─ 服务无法启动？
    │   → 查看 [环境问题](#环境问题)
    │
    ├─ API 调用失败？
    │   → 查看 [API 问题](#api-问题)
    │
    ├─ 流式响应中断？
    │   → 查看 [流式响应问题](#流式响应问题)
    │
    ├─ Function Calling 不工作？
    │   → 查看 [Function Calling 问题](#function-calling-问题)
    │
    └─ 前端显示异常？
        → 查看 [前端问题](#前端问题)
```

### 健康检查

**第一步**：检查服务状态

```bash
# 访问健康检查接口
curl http://localhost:3000/api/health

# 预期响应
{
  "status": "ok",
  "timestamp": "2026-01-16T10:30:00.000Z",
  "models": {
    "glm": true,
    "deepseek": true
  }
}
```

**第二步**：检查日志

```bash
# 查看服务器日志
npm start

# 观察输出，查找错误信息
```

**第三步**：检查配置

```bash
# 验证 API Keys
echo $GLM_API_KEY
echo $DEEPSEEK_API_KEY

# 验证环境变量
cat .env
```

---

## 环境问题

### 问题1：服务无法启动

#### 症状
```bash
$ npm start
Error: listen EADDRINUSE: address already in use :::3000
```

#### 原因
端口 3000 已被占用

#### 解决方案

**方案1：关闭占用端口的进程**
```bash
# 查找占用端口的进程
lsof -i :3000

# 或
netstat -tulpn | grep :3000

# 杀死进程
kill -9 <PID>
```

**方案2：使用其他端口**
```bash
# 修改 .env 文件
PORT=3001 npm start
```

---

### 问题2：依赖安装失败

#### 症状
```bash
$ npm install
npm ERR! code ERESOLVE
```

#### 原因
依赖版本冲突

#### 解决方案

```bash
# 清除缓存
npm cache clean --force

# 删除 node_modules 和 package-lock.json
rm -rf node_modules package-lock.json

# 重新安装
npm install
```

---

### 问题3：配置文件未找到

#### 症状
```bash
Error: Configuration file not found
```

#### 原因
`.env` 文件不存在或路径错误

#### 解决方案

```bash
# 复制示例配置文件
cp .env.example .env

# 编辑 .env，填入 API Keys
nano .env
```

**必需配置**：
```env
GLM_API_KEY=your_glm_api_key_here
DEEPSEEK_API_KEY=your_deepseek_api_key_here
DEFAULT_MODEL=glm
PORT=3000
```

---

## API 问题

### 问题1：API 调用返回 400 错误

#### 症状
```json
{
  "error": "消息内容不能为空",
  "code": "INVALID_MESSAGE"
}
```

#### 原因
请求参数不正确

#### 解决方案

**检查清单**：
1. 确认 Content-Type 为 `application/json`
2. 确认请求体格式正确
3. 确认必需参数存在

**正确示例**：
```javascript
fetch('/api/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'  // ✅ 必需
  },
  body: JSON.stringify({
    message: '你好',  // ✅ 必需
    provider: 'glm'   // 可选
  })
});
```

---

### 问题2：API 调用返回 500 错误

#### 症状
```json
{
  "error": "AI 服务暂时不可用，请稍后重试",
  "code": "API_ERROR"
}
```

#### 原因
AI API 调用失败

#### 解决方案

**诊断步骤**：

1. **检查 API Key 是否正确**
```bash
# 验证 GLM API Key
curl -X POST https://open.bigmodel.cn/api/paas/v4/chat/completions \
  -H "Authorization: Bearer $GLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"glm-4","messages":[{"role":"user","content":"hi"}]}'
```

2. **检查服务器日志**
```bash
# 查看详细错误信息
npm start

# 在开发模式下会显示详细错误堆栈
```

3. **检查网络连接**
```bash
# 测试 API 连通性
ping open.bigmodel.cn
ping api.deepseek.com
```

4. **检查 API Key 配额**
- 登录智谱AI控制台：https://open.bigmodel.cn/
- 登录 DeepSeek 控制台：https://platform.deepseek.com/
- 查看 API 使用情况和配额

---

### 问题3：响应速度慢

#### 症状
API 调用超过 10 秒没有响应

#### 原因
- 网络延迟
- AI API 响应慢
- 消息内容过长

#### 解决方案

**检查网络延迟**：
```bash
# 测试到 AI API 的延迟
curl -w "@-" -o /dev/null -s "https://open.bigmodel.cn" <<'EOF'
    time_namelookup:  %{time_namelookup}\n
       time_connect:  %{time_connect}\n
    time_appconnect:  %{time_appconnect}\n
   time_pretransfer:  %{time_pretransfer}\n
      time_redirect:  %{time_redirect}\n
 time_starttransfer:  %{time_starttransfer}\n
                    ----------\n
         time_total:  %{time_total}\n
EOF
```

**优化建议**：
- 缩短消息内容
- 使用流式响应（`/api/chat/stream`）
- 检查对话历史长度，移除不必要的旧消息

---

## 流式响应问题

### 问题1：SSE 流中断

#### 症状
流式响应中途停止，只收到部分内容

#### 原因
- 网络不稳定
- 客户端断开连接
- AI API 超时

#### 解决方案

**客户端实现**：
```javascript
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 30000);  // 30秒超时

try {
  const response = await fetch('/api/chat/stream', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history }),
    signal: controller.signal
  });

  const reader = response.body.getReader();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    // 处理数据...
  }
} catch (error) {
  if (error.name === 'AbortError') {
    console.error('请求超时');
  } else {
    console.error('流式响应错误:', error);
  }
} finally {
  clearTimeout(timeoutId);
}
```

**服务器端配置**：
```javascript
// server.js 已配置客户端断开检测
req.on('close', () => {
  console.log('客户端断开连接');
  controller.abort();  // 中止上游 API 调用
});
```

---

### 问题2：SSE 数据解析错误

#### 症状
```javascript
SyntaxError: Unexpected token in JSON
```

#### 原因
SSE 数据格式不正确

#### 解决方案

**正确的 SSE 解析**：
```javascript
const reader = response.body.getReader();
const decoder = new TextDecoder();
let buffer = '';

while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  buffer += decoder.decode(value, { stream: true });
  const lines = buffer.split('\n');

  // 保留最后一行（可能不完整）
  buffer = lines.pop();

  for (const line of lines) {
    if (line.startsWith('data: ')) {
      try {
        const data = JSON.parse(line.slice(6));

        // 处理数据
        if (data.type === 'token') {
          console.log(data.content);
        }
      } catch (e) {
        console.error('解析错误:', line, e);
      }
    }
  }
}
```

**SSE 数据格式**：
```
data: {"type":"token","content":"你"}

data: {"type":"token","content":"好"}

data: {"type":"end"}

```

---

## Function Calling 问题

### 问题1：工具未被调用

#### 症状
发送"查询天气"消息，但 AI 没有调用工具

#### 原因
- 工具未注册
- 工具定义不完整
- AI 未识别到工具调用意图

#### 解决方案

**检查工具是否注册**：
```bash
# 访问工具列表接口
curl http://localhost:3000/api/tools

# 预期响应
{
  "tools": [
    {
      "name": "getWeather",
      "description": "查询指定城市的实时天气",
      ...
    }
  ],
  "count": 3
}
```

**检查工具定义**：
```javascript
// tools/weather-tools.js
const weatherToolDefinition = {
  type: 'function',
  function: {
    name: 'getWeather',
    description: '查询指定城市的实时天气',  // ✅ 描述要清晰
    parameters: {
      type: 'object',
      properties: {
        city: {
          type: 'string',
          description: '城市名称（支持中英文）'  // ✅ 参数说明要详细
        }
      },
      required: ['city']
    }
  }
}
```

**改进提示词**：
- 使用明确的意图表达："查询北京天气" 而非 "天气怎么样"
- 提供必要的上下文信息

---

### 问题2：工具执行失败

#### 症状
```json
{
  "type": "error",
  "error": "工具执行出错：..."
}
```

#### 原因
- 工具实现错误
- 参数验证失败
- 外部 API 调用失败

#### 解决方案

**查看服务器日志**：
```bash
npm start

# 查找工具执行错误
Tool Execution Error: ...
```

**检查工具实现**：
```javascript
// tools/weather-tools.js
const getWeatherHandler = async (params) => {
  const { city } = params;

  // ✅ 参数验证
  if (!city) {
    throw new Error('城市名称不能为空');
  }

  try {
    // 调用外部 API
    const response = await fetch(`https://wttr.in/${city}?format=j1`);

    if (!response.ok) {
      throw new Error(`天气API调用失败: ${response.status}`);
    }

    const data = await response.json();
    return { city, weather: data };

  } catch (error) {
    console.error('天气查询错误:', error);
    throw error;  // ✅ 重新抛出错误
  }
};
```

---

### 问题3：Function Calling 不工作

#### 症状
AI 总是直接回复，不调用工具

#### 原因
- 未启用 Function Calling
- AI 模型不支持 Function Calling
- 工具列表未传递给 AI

#### 解决方案

**确认使用正确的接口**：
```javascript
// ❌ 错误：使用普通聊天接口
fetch('/api/chat', { ... })

// ✅ 正确：使用 Function Calling 接口
fetch('/api/chat/tools', { ... })
```

**检查 AI 模型支持**：
- GLM-4：✅ 支持原生 Function Calling
- DeepSeek：✅ 支持原生 Tool Calls

**查看工具传递**：
```javascript
// server.js - AIAdapter.chatWithTools()
const response = await axios.post(
  apiUrl,
  {
    model: modelName,
    messages: messages,
    tools: toolDefinitions  // ✅ 确认工具列表已传递
  },
  { ... }
);
```

---

## 前端问题

### 问题1：配置文件未生效

#### 症状
修改 `config/frontend.config.js` 后，前端没有变化

#### 原因
前端使用的是 `public/config.js`（自动生成），需要重新生成

#### 解决方案

```bash
# 重新生成前端配置
npm run generate-config

# 或
npm start  # 自动包含生成步骤
```

**验证**：
```javascript
// 浏览器控制台
console.log(window.CONFIG);

// 应该看到更新后的配置
{
  api: { baseUrl: '', timeout: 30000 },
  features: { ... },
  avatars: { ... }
}
```

---

### 问题2：虚拟形象切换不工作

#### 症状
点击虚拟形象切换按钮没有反应

#### 原因
- JavaScript 错误
- 虚拟形象配置不正确

#### 解决方案

**打开浏览器控制台**：
```javascript
// 查找错误信息
console.error('...');
```

**检查虚拟形象配置**：
```javascript
// config/frontend.config.js
module.exports = {
  avatars: {
    "小樱": {
      emoji: "🌸",
      name: "小樱",
      status: "在线",
      personality: "温柔",
      gradient: "linear-gradient(135deg, #C5E8D0, #DDE8D8, #FFE5D8, #FFD4C2)"
    }
    // ... 其他虚拟形象
  }
};
```

**检查 JavaScript 函数**：
```javascript
// public/app.js
function updateAvatar(avatarName) {
  const avatar = CONFIG.avatars[avatarName];

  if (!avatar) {
    console.error('虚拟形象不存在:', avatarName);
    return;
  }

  // 更新 UI
  // ...
}
```

---

### 问题3：快速开始按钮点击无效

#### 症状
点击快速开始按钮，没有自动填充消息

#### 原因
JavaScript 加载失败或函数未定义

#### 解决方案

**检查 JavaScript 是否加载**：
```html
<!-- index.html -->
<script src="/app.js"></script>  <!-- ✅ 确认存在 -->
```

**检查浏览器控制台**：
```javascript
// 查找加载错误
Failed to load resource: net::ERR_FILE_NOT_FOUND
```

**检查函数定义**：
```javascript
// public/app.js
function quickStart(template) {
  console.log('快速开始:', template);
  const messageInput = document.getElementById('message-input');
  messageInput.value = template.message;
}
```

---

## 性能问题

### 问题1：首次加载慢

#### 症状
打开页面需要 5-10 秒

#### 原因
- 前端资源过大
- 网络延迟
- 并发请求过多

#### 解决方案

**检查加载时间**：
```javascript
// 浏览器开发者工具 - Network 面板
// 查看 Loading 时间
```

**优化建议**：
- 压缩 CSS 和 JavaScript
- 使用 CDN 加速
- 减少并发 API 请求

---

### 问题2：内存占用高

#### 症状
浏览器占用内存持续增长

#### 原因
- 对话历史过长
- 事件监听器未移除
- DOM 元素未清理

#### 解决方案

**检查对话历史**：
```javascript
// 检查历史长度
console.log(conversationHistory.length);

// 限制历史长度
const MAX_HISTORY = 100;
if (conversationHistory.length > MAX_HISTORY) {
  conversationHistory = conversationHistory.slice(-MAX_HISTORY);
}
```

**清理事件监听器**：
```javascript
// 添加事件监听器
button.addEventListener('click', handler);

// 移除事件监听器
button.removeEventListener('click', handler);
```

---

## 调试技巧

### 1. 使用浏览器开发者工具

**Network 面板**：
- 查看 API 请求和响应
- 检查请求参数
- 查看响应时间

**Console 面板**：
- 查看 JavaScript 错误
- 使用 `console.log()` 调试
- 查看网络请求错误

**Application 面板**：
- 查看 localStorage 内容
- 检查存储的对话历史
- 查看配置信息

---

### 2. 启用详细日志

**开发模式**：
```bash
# 设置环境变量
NODE_ENV=development npm start

# 日志会包含详细错误堆栈
```

**日志级别**：
```javascript
// server.js
console.log('Info: ...');      // 一般信息
console.error('Error: ...');   // 错误信息
console.warn('Warning: ...');  // 警告信息
```

---

### 3. 测试 API 接口

**使用 curl**：
```bash
# 测试健康检查
curl http://localhost:3000/api/health

# 测试聊天接口
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"你好","provider":"glm"}'
```

**使用 Postman**：
1. 导入 API 端点
2. 设置请求头
3. 发送请求并查看响应

---

### 4. 监控流式响应

**服务器端日志**：
```javascript
// server.js
app.post('/api/chat/stream', async (req, res) => {
  console.log('[SSE] 客户端连接');

  req.on('close', () => {
    console.log('[SSE] 客户端断开');
  });

  // ...
});
```

**客户端调试**：
```javascript
let eventCount = 0;
let lastEventTime = Date.now();

// 每收到10个事件，输出一次统计
setInterval(() => {
  const elapsed = Date.now() - lastEventTime;
  console.log(`[SSE] 已接收 ${eventCount} 个事件，上次事件距今 ${elapsed}ms`);
}, 5000);
```

---

## 常见错误码速查表

| 错误码 | 说明 | 解决方案 |
|--------|------|---------|
| `EADDRINUSE` | 端口被占用 | 关闭占用进程或使用其他端口 |
| `ENOTFOUND` | DNS 解析失败 | 检查网络连接 |
| `ETIMEDOUT` | 请求超时 | 检查网络或增加超时时间 |
| `ECONNREFUSED` | 连接被拒绝 | 检查服务是否启动 |
| `INVALID_MESSAGE` | 消息无效 | 检查请求参数 |
| `API_ERROR` | AI API 错误 | 检查 API Key 和网络 |
| `RATE_LIMIT_EXCEEDED` | 超过速率限制 | 等待后重试 |

---

## 获取帮助

### 文档资源

- [API 参考文档](API.md) - API 端点详细说明
- [架构文档](ARCHITECTURE.md) - 系统架构说明
- [开发指南](CONTRIBUTING.md) - 编码规范

### 社区支持

- 提交 [Issue](https://github.com/wangdafei091/chatbot/issues)
- 查看 [已有问题](https://github.com/wangdafei091/chatbot/issues?q=is%3Aissue)

### 调试检查清单

- [ ] 服务是否正常启动？
- [ ] API Key 是否正确配置？
- [ ] 网络连接是否正常？
- [ ] 浏览器控制台是否有错误？
- [ ] 服务器日志是否有错误信息？
- [ ] 请求参数是否正确？

---

**最后更新**：2026-01-16
**维护者**：项目维护团队
