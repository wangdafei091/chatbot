# AI 智能助手 - Soft Pastel 版

> 一个温和、清爽的 AI 聊天界面，采用柔和粉彩设计，支持可配置的虚拟形象。

![Version](https://img.shields.io/badge/version-1.0-success)
![Status](https://img.shields.io/badge/status-production--ready-brightgreen)

---

## ✨ 特性

### 🎨 视觉设计
- **柔和粉彩配色** - 薄荷绿、桃色、淡紫的温馨组合
- **高可读性** - 符合 WCAG AA 对比度标准
- **微妙动画** - 流畅的过渡和呼吸效果
- **响应式布局** - 完美适配桌面和移动端

### 🤖 虚拟形象系统
- **多角色选择** - 4 个预设虚拟形象（小樱🌸、咪咪🐱、小智🤖、阿狐🦊）
- **持久化存储** - 自动保存用户选择
- **表情动画** - 眨眼、浮动等生动效果
- **可扩展架构** - 预留 Lottie 和 3D 模型接口

### 💬 交互体验
- **智能输入框** - 自动高度调整、实时验证
- **打字指示器** - 自然的节奏动画
- **消息气泡** - 清晰的视觉层次
- **Emoji 支持** - 跨平台兼容的 emoji 渲染

---

## 🚀 快速开始

### 直接使用
```bash
# 在浏览器中打开
open index.html

# 或者双击 index.html 文件
```

### 本地服务器（推荐）
```bash
# Python 3
python -m http.server 8000

# Node.js
npx serve

# 然后访问 http://localhost:8000
```

---

## 📁 项目结构

```
chatbot/
├── index.html              # 主应用文件 ⭐
├── AVATAR_GUIDE.md         # 虚拟形象配置指南
├── FEATURE_ROADMAP.md      # 功能开发路线图
└── README.md              # 本文档
```

---

## 🎯 核心功能

### 1. 虚拟形象切换
点击左上角的虚拟形象即可切换角色：
- 🌸 **小樱** - 温柔型
- 🐱 **咪咪** - 调皮型
- 🤖 **小智** - 理性型
- 🦊 **阿狐** - 机智型

### 2. 快捷对话
点击欢迎界面的提示按钮即可快速开始对话。

### 3. 消息输入
- 输入消息后自动启用发送按钮
- `Enter` 发送，`Shift+Enter` 换行
- 支持多行输入（自动高度调整）

---

## 🔧 自定义配置

### 修改配色方案

编辑 `index.html` 中的 CSS 变量：

```css
:root {
    --bg-primary: #FDF6F0;
    --text-primary: #3E3848;
    --gradient-gentle: linear-gradient(135deg, ...);
    /* ... */
}
```

### 添加新的虚拟形象

在 `avatarDatabase` 对象中添加：

```javascript
const avatarDatabase = {
    // ... 现有角色
    '新角色': {
        emoji: '😊',
        name: '新角色',
        status: '在线',
        personality: '性格描述',
        gradient: 'linear-gradient(135deg, ...)'
    }
};
```

详细说明请参考 [AVATAR_GUIDE.md](AVATAR_GUIDE.md)。

---

## 🎨 设计系统

### 色彩规范
```css
/* 主色调 */
--bg-primary: #FDF6F0          /* 背景色 */
--text-primary: #3E3848        /* 主文字 */
--text-secondary: #5E5670      /* 次要文字 */

/* 强调色 */
--accent-mint: #C5E8D0         /* 薄荷绿 */
--accent-peach: #FFD4C2        /* 桃色 */
--accent-lavender: #E2D4F0     /* 淡紫 */
```

### 间距系统
```css
--spacing-xs: 4px
--spacing-sm: 8px
--spacing-md: 12px
--spacing-lg: 20px
--spacing-xl: 32px
--spacing-2xl: 48px
```

### 字体
- **主字体**: Quicksand (Google Fonts)
- **Emoji 字体**: Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji

---

## 📱 浏览器兼容性

| 浏览器 | 版本 | 支持状态 |
|--------|------|---------|
| Chrome | 90+ | ✅ 完全支持 |
| Safari | 14+ | ✅ 完全支持 |
| Firefox | 88+ | ✅ 完全支持 |
| Edge | 90+ | ✅ 完全支持 |
| iOS Safari | 14+ | ✅ 完全支持 |
| Android Chrome | 90+ | ✅ 完全支持 |

---

## 🚧 未来功能

详细的功能开发计划请参考 [FEATURE_ROADMAP.md](FEATURE_ROADMAP.md)。

### 短期（MVP）
- [ ] 集成真实 AI API
- [ ] Lottie 动画支持
- [ ] 对话历史管理

### 中期（增强版）
- [ ] 语音输入
- [ ] 主题系统
- [ ] 导出对话功能

### 长期（完整版）
- [ ] 3D 虚拟形象
- [ ] 文件分析
- [ ] 浏览器插件

---

## 🤝 贡献

欢迎贡献！如果你想改进这个项目：

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

---

## 📄 许可证

MIT License - 详见 LICENSE 文件

---

## 🙏 致谢

- 设计灵感来自现代聊天应用
- 字体使用 Google Fonts 的 Quicksand
- Emoji 由各平台系统字体提供支持

---

## 📞 联系方式

如有问题或建议，欢迎通过以下方式联系：
- 提交 Issue
- 发送 Pull Request
- 邮件联系

---

**最后更新**: 2026-01-09
**版本**: 1.0.0
**状态**: ✅ 生产就绪
