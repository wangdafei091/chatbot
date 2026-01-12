# GitHub 项目配置指南

> 推送代码到 GitHub 后，按照以下步骤完善你的项目

---

## 📋 项目基本信息

### 项目名称
```
AI Chatbot - Soft Pastel
```

### 项目描述
```
一个温和、清爽的 AI 聊天界面，采用柔和粉彩设计。支持可配置的虚拟形象、响应式布局和无障碍访问。纯 HTML/CSS/JS 实现，易于定制和扩展。
```

### 项目标签 (Topics)
在 GitHub 仓库页面设置以下标签：

```
chatbot, ai-chatbot, html, css, javascript, responsive-design, web-app, ui-design, soft-pastel, accessibility, wcag, chat-interface, virtual-avatar, emoji, animations, minimalist-design, pastel-colors
```

**中文标签**（也可添加）：
```
聊天机器人, 人工智能, 网页设计, 响应式, 用户界面
```

---

## 🎨 GitHub 仓库设置建议

### 1. 仓库信息

在 `Settings > General` 中设置：

- **Description**:
  ```
  一个温和、清爽的 AI 聊天界面，采用柔和粉彩设计。支持可配置的虚拟形象和响应式布局。
  ```

- **Website**:
  ```
  https://wangdafei091.github.io/chatbot/
  ```
  （如果启用 GitHub Pages）

- **Topics**:
  复制上面的标签列表

### 2. 功能开关建议

在 `Settings > Features` 中启用：

- ✅ **Issues** - 用于 Bug 反馈和功能建议
- ✅ **Pull Requests** - 用于贡献代码
- ✅ **Actions** - 用于 CI/CD（可选）
- ✅ **Wiki** - 用于详细文档（可选）
- ✅ **Pages** - 用于在线演示（推荐）

### 3. 分支保护

在 `Settings > Branches` 中为 `main` 分支启用：

- 🔒 **Require pull request reviews before merging**
  - Required approvals: 1

- 🔒 **Require status checks to pass before merging**
  - Require branches to be up to date before merging

---

## 🌐 GitHub Pages 设置

### 启用步骤

1. 进入 `Settings > Pages`

2. **Source** 选择：
   - Branch: `main`
   - Folder: `/ (root)`

3. 点击 **Save**

4. 等待部署完成（约 1-2 分钟）

5. 访问：`https://wangdafei091.github.io/chatbot/`

### 自定义域名（可选）

如果你有自己的域名：

1. 在 `Settings > Pages > Custom domain` 中输入域名
2. 在域名 DNS 设置中添加 CNAME 记录

---

## 🔧 仓库管理配置

### Issue 模板

已创建以下模板（在 `.github/ISSUE_TEMPLATE/` 目录）：

1. **🐛 Bug 报告** (`bug_report.md`)
   - 用于报告问题
   - 包含复现步骤、环境信息等

2. **✨ 功能建议** (`feature_request.md`)
   - 用于提出新功能
   - 包含解决方案、替代方案等

### Pull Request 模板

已创建 PR 模板（在 `.github/PULL_REQUEST_TEMPLATE.md`）：

- 包含变更类型、检查清单等
- 确保 PR 质量

### Labels（标签）

建议在仓库中创建以下标签：

| 标签名 | 颜色 | 描述 |
|--------|------|------|
| `bug` | 🔴 d73a4a | Bug 报告 |
| `enhancement` | 🟢 a2eeef | 功能增强 |
| `documentation` | 🔵 0075ca | 文档更新 |
| `good first issue` | 🟢 7057ff | 适合新手 |
| `help wanted` | 🟡 008672 | 需要帮助 |
| `priority: high` | 🔴 b60205 | 高优先级 |
| `priority: low` | ⚪ e4e669 | 低优先级 |
| `wontfix` | ⚪ ffffff | 不会修复 |
| `question` | 🟡 fef2c0 | 问题 |

---

## 📊 仓库徽章 (Badges)

可以在 README.md 顶部添加这些徽章：

```markdown
![Version](https://img.shields.io/badge/version-1.0.0-success)
![License](https://img.shields.io/badge/license-MIT-blue)
![HTML5](https://img.shields.io/badge/html5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/css3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/javascript-F7DF1E?logo=javascript&logoColor=black)
![Status](https://img.shields.io/badge/status-production--ready-brightgreen)
![GitHub Issues](https://img.shields.io/github/issues/wangdafei091/chatbot)
![GitHub Stars](https://img.shields.io/github/stars/wangdafei091/chatbot)
```

---

## 🎯 推广建议

### 初期推广

1. **社交媒体分享**
   - 微博、Twitter、朋友圈
   - 设计相关社区（站酷、UI 中国）

2. **技术社区**
   - GitHub Trending
   - Hacker News
   - Reddit (r/webdev, r/webdesign)
   - V2EX
   - 掘金、 SegmentFault

3. **项目展示**
   - Product Hunt
   - Designer News
   - Indie Hackers

### SEO 优化

确保 README.md 包含：
- 清晰的项目描述
- 关键词（AI、chatbot、聊天界面等）
- 使用示例和截图
- 良好的代码示例

---

## 📝 社区管理

### 贡献指南 (Contributing)

建议创建 `CONTRIBUTING.md`：

```markdown
# 贡献指南

感谢你考虑为 AI Chatbot 项目做出贡献！

## 如何贡献

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 开发规范

- 遵循现有代码风格
- 添加必要的注释
- 更新相关文档
- 确保无控制台错误

## 问题反馈

使用 GitHub Issues 报告问题或提出建议。
```

### 行为准则

建议创建 `CODE_OF_CONDUCT.md`：

```markdown
# 行为准则

## 我们的承诺

为了营造开放和友好的环境，我们承诺...

## 期望的行为

- 尊重不同的观点和经验
- 优雅地接受建设性批评
- 关注对社区最有利的事情
- 对其他社区成员表示同理心
```

---

## 🔗 有用的链接

- **GitHub Docs**: https://docs.github.com/
- **GitHub Pages**: https://pages.github.com/
- **GitHub Actions**: https://github.com/features/actions
- **社区指南**: https://opensource.guide/

---

**最后更新**: 2026-01-09
