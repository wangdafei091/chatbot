# 📚 文档导航

> AI 聊天机器人项目的完整文档索引
> 最后更新：2026-01-16

---

## 🎯 快速入口

### 我想...

| 我想... | 查看文档 | 说明 |
|---------|---------|------|
| **快速上手** | [SETUP.md](SETUP.md) | 5 分钟搭建开发环境 |
| **了解架构** | [ARCHITECTURE.md](ARCHITECTURE.md) | 技术栈选择和设计决策 ⭐ |
| **参与开发** | [CONTRIBUTING.md](CONTRIBUTING.md) | 编码规范和开发指南 ⭐ |
| **查看进度** | [PROGRESS.md](PROGRESS.md) | 开发进度和待办任务 |
| **自定义配置** | [AVATAR_GUIDE.md](AVATAR_GUIDE.md) | 虚拟形象配置指南 |

---

## 📂 文档分类

### 🌟 核心文档

| 文档 | 说明 | 适用对象 | 优先级 |
|------|------|---------|--------|
| [README.md](../README.md) | 项目说明和快速开始 | 所有人 | ⭐⭐⭐⭐⭐ |
| [CLAUDE.md](../CLAUDE.md) | AI 编码助手工作指南 | AI 助手 | ⭐⭐⭐⭐⭐ |

---

### 👨‍💻 开发文档

| 文档 | 说明 | 适用对象 | 何时阅读 |
|------|------|---------|----------|
| [SETUP.md](SETUP.md) | 本地开发环境搭建 | 新开发者 | 开始开发前 |
| [ARCHITECTURE.md](ARCHITECTURE.md) | 技术架构和设计决策 | 开发者/架构师 | 了解"为什么" ⭐ |
| [CONTRIBUTING.md](CONTRIBUTING.md) | 编码规范和任务指南 | 开发者 | 编写代码时 ⭐ |
| [API.md](API.md) | API 接口参考文档 | 开发者 | API 开发时 ⭐ |
| [TROUBLESHOOTING.md](TROUBLESHOOTING.md) | 故障排查指南 | 开发者 | 遇到问题时 |
| [TESTING.md](TESTING.md) | 测试指南 | 开发者/测试人员 | 测试功能时 |

---

### 📊 项目文档

| 文档 | 说明 | 适用对象 | 更新频率 |
|------|------|---------|----------|
| [PROGRESS.md](PROGRESS.md) | 开发进度和短期计划 | 项目管理者/开发者 | 每周更新 |
| [ROADMAP.md](ROADMAP.md) | 技术路线图和长期规划 | 项目管理者/架构师 | 季度回顾 |

---

### 🎨 功能专题

| 文档 | 说明 | 适用场景 |
|------|------|---------|
| [AVATAR_GUIDE.md](AVATAR_GUIDE.md) | 虚拟形象配置指南 | 自定义虚拟形象 |
| [GITHUB_SETUP.md](GITHUB_SETUP.md) | GitHub 仓库配置指南 | 推送代码到 GitHub |

---

### 🏗️ 设计文档

| 文档 | 说明 | 适用场景 |
|------|------|---------|
| [Function Calling 框架设计](design/function-calling-framework.md) | 详细技术方案和实施步骤 | 开发新功能前 |

---

## 📖 阅读顺序建议

### 1️⃣ 新手入门（第一天）

```
README.md (了解项目)
   ↓
SETUP.md (搭建环境)
   ↓
运行项目并体验
```

### 2️⃣ 深入理解（第一周）

```
ARCHITECTURE.md (理解架构决策)
   ↓
CONTRIBUTING.md (学习编码规范)
   ↓
阅读源代码
```

### 3️⃣ 功能开发（持续）

```
PROGRESS.md (查看待办任务)
   ↓
设计文档 (如果需要)
   ↓
CONTRIBUTING.md (参考任务指南)
   ↓
开始编码
```

---

## 🔍 文档定位说明

### 按读者分类

**面向用户**：
- [README.md](../README.md) - 项目介绍和快速开始

**面向开发者**：
- [SETUP.md](SETUP.md) - 环境搭建
- [CONTRIBUTING.md](CONTRIBUTING.md) - 编码规范
- [ARCHITECTURE.md](ARCHITECTURE.md) - 架构设计

**面向 AI 助手**：
- [CLAUDE.md](../CLAUDE.md) - 项目约束和代码位置

**面向项目管理者**：
- [PROGRESS.md](PROGRESS.md) - 进度跟踪
- [ROADMAP.md](ROADMAP.md) - 长期规划

---

## 🔄 文档关系图

```
README.md (项目门面)
    │
    ├─── 快速开始 ───→ SETUP.md
    │
    ├─── 文档导航 ───→ INDEX.md (本文件)
    │
    ├─── 了解项目 ───→ ARCHITECTURE.md
    │                  └── CONTRIBUTING.md
    │
    ├─── 查看进度 ───→ PROGRESS.md
    │                  └── ROADMAP.md
    │
    └─── 功能指南 ───→ AVATAR_GUIDE.md
                       └── GITHUB_SETUP.md

CLAUDE.md (AI 助手专用)
    │
    └─── 引用 ───→ 所有文档的定位说明
```

---

## 📝 文档维护

### 更新责任

| 文档 | 维护者 | 更新频率 | 说明 |
|------|--------|---------|------|
| README.md | 项目维护者 | 每个版本 | 版本更新时同步 |
| PROGRESS.md | 项目维护者 | 每周 | 开发进度变更 |
| 其他文档 | 相关贡献者 | 按需 | 功能变更时更新 |

### 更新原则

1. **准确性优先** - 文档必须与代码保持一致
2. **简洁明了** - 避免冗余，引用而非重复
3. **及时更新** - 代码变更时同步更新文档
4. **版本标记** - 在文档底部标注最后更新时间

---

## 🤔 如何使用本文档

### 场景1：我是新开发者

**阅读顺序**：
1. [README.md](../README.md) - 了解项目是什么
2. [SETUP.md](SETUP.md) - 搭建开发环境
3. [ARCHITECTURE.md](ARCHITECTURE.md) - 理解技术栈选择
4. [CONTRIBUTING.md](CONTRIBUTING.md) - 学习编码规范

### 场景2：我是 AI 编码助手

**阅读顺序**：
1. [CLAUDE.md](../CLAUDE.md) - 了解项目约束
2. [CONTRIBUTING.md](CONTRIBUTING.md) - 查看编码规范
3. [ARCHITECTURE.md](ARCHITECTURE.md) - 理解设计决策

### 场景3：我想添加新功能

**阅读顺序**：
1. [PROGRESS.md](PROGRESS.md) - 查看开发计划
2. [ARCHITECTURE.md](ARCHITECTURE.md) - 确认符合架构
3. [CONTRIBUTING.md](CONTRIBUTING.md) - 查看任务指南
4. 设计文档（如果有）- 详细技术方案

---

## 💡 文档优化建议

如果你发现文档有任何问题，欢迎提出建议或直接改进：

- 🔗 提交 [Issue](https://github.com/wangdafei091/chatbot/issues)
- 🔗 发送 [Pull Request](https://github.com/wangdafei091/chatbot/pulls)

---

**最后更新**: 2026-01-16
**维护者**: 项目维护团队
