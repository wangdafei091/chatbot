# 快速入门

> 5 分钟上手 AI 聊天机器人
> 更新时间：2026-01-12

---

## 🎯 选择你的使用方式

### 方式 1：本地完整运行（推荐）✨

**适合**：开发者、想体验完整功能的人

**前提条件**：
- Node.js 18+ 已安装
- 有 GLM 或 DeepSeek API Key

**快速开始**：

```bash
# 1. 进入项目目录
cd chatbot

# 2. 安装依赖
npm install

# 3. 配置 API Key
cp .env.example .env
# 编辑 .env，填入你的 API Key

# 4. 启动服务
npm start

# 5. 浏览器访问
open http://localhost:3000
```

**详细说明**：查看 [详细搭建指南](SETUP_GUIDE.md)

---

### 方式 2：纯前端静态运行

**适合**：快速查看 UI 效果

**注意**：AI 响应是模拟的（仅用于演示 UI）

**快速开始**：

```bash
# 直接打开
open index.html

# 或使用本地服务器
python -m http.server 8000
# 然后访问 http://localhost:8000
```

---

## 🔑 获取 API Key

### GLM（智谱AI）

1. 访问：https://open.bigmodel.cn/usercenter/apikeys
2. 注册/登录
3. 创建 API Key
4. 复制并保存

**免费额度**：通常有免费试用额度

---

### DeepSeek

1. 访问：https://platform.deepseek.com/api-keys
2. 注册/登录
3. 创建 API Key
4. 复制并保存

**价格**：非常便宜（约 ¥0.001/1K tokens）

---

## 🧪 快速测试

启动服务后，尝试这些消息：

```
你好
用 Python 写个快速排序
今天北京的天气怎么样？
```

---

## ❓ 常见问题

### Q1：npm install 失败

**解决方案**：
```bash
# 清除缓存重试
rm -rf node_modules package-lock.json
npm install

# 或使用 sudo（macOS/Linux）
sudo npm install
```

---

### Q2：端口 3000 已被占用

**解决方案**：
```bash
# macOS/Linux - 杀掉占用进程
lsof -ti:3000 | xargs kill -9

# 或修改 .env 中的端口
PORT=3001
```

---

### Q3：API Key 无效

**检查清单**：
- [ ] `.env` 文件是否存在
- [ ] API Key 是否正确粘贴（没有多余空格）
- [ ] API Key 是否有效（登录平台查看）
- [ ] 重启后端服务（`.env` 修改后需要重启）

---

### Q4：API 调用超时

**可能原因**：
- 网络连接问题
- API 服务暂时不可用
- API Key 余额不足

**解决方案**：
- 检查网络连接
- 尝试切换模型（GLM ↔ DeepSeek）
- 登录平台查看余额

---

### Q5：如何切换 AI 模型？

**方法 1**：编辑 `.env` 文件
```bash
DEFAULT_MODEL=deepseek  # 或 glm
```

**方法 2**：浏览器控制台
```javascript
currentProvider = 'deepseek';  // 临时切换
```

---

## 📚 下一步

**学习更多**：
- 📘 [详细搭建指南](SETUP_GUIDE.md) - 完整的配置和故障排查
- 🗺️ [完整路线图](ROADMAP.md) - 技术架构和功能规划
- 📊 [实施进度](PROGRESS.md) - 已完成和待办任务

**开始开发**：
- 🎯 [开发计划](PROGRESS.md#下一步开发计划) - 下一步开发任务

**自定义配置**：
- 🎨 [虚拟形象配置](AVATAR_GUIDE.md) - 自定义虚拟形象

---

## 🆘 需要帮助？

1. **查看日志**：
   - 浏览器控制台（F12）
   - 终端（后端日志）

2. **查看文档**：
   - [详细搭建指南](SETUP_GUIDE.md) 的"常见问题"部分
   - [实施进度](PROGRESS.md) 的"已知问题"部分

3. **重启服务**：很多问题重启可以解决

---

**祝你使用愉快！** 🎉

有问题随时查看详细文档或提交 Issue。
