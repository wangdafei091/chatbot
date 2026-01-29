# 文档维护指南

> 如何在编码完成后及时同步更新文档，并严格遵守文档定位和规范
> **最后更新**：2026-01-29

---

## 📋 目录

- [核心原则](#核心原则)
- [文档维护工作流](#文档维护工作流)
- [代码变更时如何更新文档](#代码变更时如何更新文档)
- [文档定位检查清单](#文档定位检查清单)
- [文档维护最佳实践](#文档维护最佳实践)
- [自动化机制](#自动化机制)

---

## 核心原则

### 原则1：代码与文档同步更新

```
代码变更
   ↓
文档必须同步更新
   ↓
一起提交到 Git
```

**禁止**：
- ❌ 先提交代码，"以后再更新文档"
- ❌ 文档更新滞后于代码变更
- ❌ 文档与代码不一致

---

### 原则2：单一数据源（Single Source of Truth）

每类信息只有一个权威来源：

| 信息类型 | 权威文档 | 不应该出现在 |
|---------|---------|-------------|
| 项目约束 | CLAUDE.md | CONTRIBUTING.md、AI_PROMPTS.md（已删除） |
| API 接口说明 | API.md | ARCHITECTURE.md、README.md |
| 编码规范 | CONTRIBUTING.md | CLAUDE.md、README.md |
| 进度跟踪 | PROGRESS.md | 其他文档 |
| 技术选型理由 | ARCHITECTURE.md | 所有其他文档 |

---

### 原则3：引用而非重复

```markdown
✅ 正确做法：
<!-- CONTRIBUTING.md -->
详细的编码规范请参阅 [CLAUDE.md 的陷阱章节](../CLAUDE.md#常见陷阱)

❌ 错误做法：
<!-- CONTRIBUTING.md -->
## 常见陷阱
（重复 CLAUDE.md 中的所有内容）
```

---

## 文档维护工作流

### 完整工作流程

```
┌─────────────────────────────────────────┐
│ 1. 编码阶段                              │
│    - 按 CONTRIBUTING.md 规范编写代码    │
│    - 添加必要注释                        │
└──────────────┬──────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────┐
│ 2. 提交前检查（使用清单）                │
│    - [ ] 是否影响了公共 API？           │
│    - [ ] 是否新增了功能？               │
│    - [ ] 是否修复了 Bug？               │
│    - [ ] 是否改变了架构决策？           │
└──────────────┬──────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────┐
│ 3. 更新文档                              │
│    - 根据清单更新相应文档                │
│    - 使用文档定位检查清单               │
│    - 遵循文档更新规范                   │
└──────────────┬──────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────┐
│ 4. 文档验证                              │
│    - [ ] 文档与代码一致                 │
│    - [ ] 没有引入新的重复               │
│    - [ ] 文档定位准确                   │
│    - [ ] 引用关系正确                   │
└──────────────┬──────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────┐
│ 5. 一起提交                              │
│    git add <代码文件> <文档文件>        │
│    git commit -m "feat: xxx"            │
│    - 代码和文档在同一个提交             │
└─────────────────────────────────────────┘
```

---

## 代码变更时如何更新文档

### 场景1：新增 API 端点

**影响范围**：
- 代码：`server.js`（新增路由）
- 文档：`docs/API.md`（必需）✅

**更新步骤**：
1. 在 `server.js` 添加新端点
2. 在 `docs/API.md` 添加：
   - 端点说明
   - 请求/响应格式
   - 使用示例
3. 如果是重要变更，在 `README.md` 的"技术栈"部分添加简要说明
4. **检查清单**：
   - [ ] API.md 包含完整信息
   - [ ] 使用示例可运行
   - [ ] 错误码已记录

**不应该做的**：
- ❌ 在 `ARCHITECTURE.md` 添加详细的 API 说明
- ❌ 在 `README.md` 添加详细的 API 文档

---

### 场景2：新增功能特性

**影响范围**：
- 代码：新增功能
- 文档：
  - `README.md`（核心特性部分）✅
  - `docs/PROGRESS.md`（进度跟踪）✅
  - `docs/TESTING.md`（测试用例）✅

**更新步骤**：
1. 在 `README.md` 的"核心特性"部分添加：
   ```markdown
   ### 🤖 AI 模型集成
   - **新功能**：xxx 功能
   ```

2. 在 `docs/PROGRESS.md` 更新：
   - 标记为"已完成"
   - 更新进度百分比
   - 移除"待办任务"清单

3. 在 `docs/TESTING.md` 添加：
   - 新功能的测试用例
   - 验收标准

**不应该做的**：
- ❌ 在 `CONTRIBUTING.md` 添加功能说明（这是项目进度）
- ❌ 在 `ARCHITECTURE.md` 添加功能描述（除非涉及架构变更）

---

### 场景3：修改配置项

**影响范围**：
- 代码：`config/`、`.env.example`
- 文档：`docs/SETUP.md`（配置说明）✅

**更新步骤**：
1. 更新 `.env.example`
2. 在 `docs/SETUP.md` 的"环境配置"部分添加：
   - 新配置项说明
   - 默认值
   - 可选值

**不应该做的**：
- ❌ 在 `README.md` 添加详细配置说明（链接到 SETUP.md）
- ❌ 在 `CONTRIBUTING.md` 添加配置步骤

---

### 场景4：修复 Bug

**影响范围**：
- 代码：修复 Bug
- 文档：
  - `docs/TROUBLESHOOTING.md`（如果是常见问题）✅
  - `docs/TESTING.md`（如果是测试问题）✅

**更新步骤**：
1. 如果 Bug 是用户常见问题，在 `docs/TROUBLESHOOTING.md` 添加：
   - 问题症状
   - 解决方案
   - 预防措施

2. 如果 Bug 影响功能测试，在 `docs/TESTING.md` 更新测试用例

**不应该做的**：
- ❌ 在 `README.md` 记录 Bug（除非是已知限制）
- ❌ 在 `PROGRESS.md` 记录（除非是进度相关）

---

### 场景4+：功能实施过程中的 Bug 修复

**影响范围**：
- 代码：修复功能实施中发现的 Bug
- 文档：
  - `docs/design/[feature-name].md`（详细记录）✅
  - `docs/PROGRESS.md`（简要提及，1-2行）✅

**背景**：
功能开发过程中发现的 Bug，分为两类：
1. **功能特定 Bug**：只影响当前功能 → 记录在该功能的设计文档
2. **框架级 Bug**：影响多个功能 → 记录在功能设计文档，并标记"需要迁移到框架文档"

**更新步骤**：
1. 在 `docs/design/[feature-name].md` 的"修改记录"部分添加：
   ```markdown
   - [x] Bug 修复与优化（YYYY-MM-DD）：

     **Bug #1：[标题]**
     - **位置**：`file.js:line-range`
     - **发现时间**：[什么时候发现的]
     - **问题现象**：
       - [用户可见的症状]
       - [错误日志/表现]
     - **根本原因**：
       - [技术原因，包含代码片段]
     - **修复方案**：
       - [具体的修复代码]
     - **影响范围**：
       - [影响哪些功能/模块]
     - **测试验证**：
       - [如何验证修复]
     - **框架级 Bug 处理**（如果是框架问题）：
       - [为什么记录在这里而不是框架文档]
       - [什么时候应该迁移到独立文档]
   ```

2. 在 `docs/PROGRESS.md` 的功能条目中添加**一行**简要提及：
   ```markdown
   - ✅ Bug 修复：[简短描述]（详见 design/[feature-name].md §修改记录）
   ```

**示例**（天气功能增强中的 Bug 修复）：

**PROGRESS.md**（1行）：
```markdown
- [x] **天气查询功能增强**（2026-01-29）✨
  - ...（其他条目）
  - ✅ Bug 修复：Function Calling 框架兼容性 + 温度趋势描述优化（详见 design/weather-enhancement.md §修改记录）
```

**design/weather-enhancement.md**（详细记录，60行）：
```markdown
**修改记录**：
- [x] Bug 修复与优化（2026-01-29）：

  **Bug #1：Function Calling 框架兼容性问题**
  - **位置**：`server.js:534-552`
  - **发现时间**：功能实施后的浏览器测试
  - **问题现象**：
    - 天气工具执行成功并返回正确的纯文本结果
    - 但系统仍进行第2轮 GLM API 调用，导致错误 "messages 参数非法"
    - 用户看到的是 AI 生成的长篇回复，而非工具返回的简洁文本
  - **根本原因**：
    - `tools/index.js` 中的 `ToolExecutor.executeTool()` 返回包装对象：
      ```javascript
      return {
          tool: toolName,
          success: true,
          result: result
      };
      ```
    - 但 `server.js:510` 将整个包装对象序列化...
  - **修复方案**：...
  - **影响范围**：所有返回纯文本的工具
  - **框架级 Bug 处理**：
    - 虽然这是框架级问题，但记录在天气功能设计文档中
    - 原因：问题在天气功能实施中发现，且目前只有天气工具受影响
    - 如果将来其他工具遇到类似问题，应迁移到独立的框架设计文档
```

**不应该做的**：
- ❌ 在 PROGRESS.md 中展开技术细节（超过3行）
- ❌ 在多个地方重复记录相同的 Bug
- ❌ 将框架级 Bug 记录在功能文档中，但不标注"需要迁移"

**文档管理原则**：
1. **Single Source of Truth**：Bug 的详细技术描述只有一个权威来源（design/*.md）
2. **可追溯性**：代码变更的原因可以在 design/*.md 中找到完整答案
3. **渐进式文档**：框架级 Bug 先记录在发现它的功能文档中，待第2个功能遇到时再迁移

---

### 场景5：改变技术决策

**影响范围**：
- 代码：架构变更
- 文档：
  - `docs/ARCHITECTURE.md`（必需）✅
  - `CLAUDE.md`（如果影响约束）✅
  - `docs/CONTRIBUTING.md`（如果影响编码规范）✅

**更新步骤**：
1. 在 `docs/ARCHITECTURE.md` 的"关键设计决策"部分：
   - 更新或新增决策记录
   - 说明变更理由
   - 记录权衡（trade-off）

2. 如果影响项目约束，在 `CLAUDE.md` 的"重要约束"部分更新

3. 如果影响编码方式，在 `docs/CONTRIBUTING.md` 更新编码规范

**示例**：
```markdown
<!-- ARCHITECTURE.md -->
### 决策6：从 Express.js 迁移到 Fastify（2026-01-16）

**选择**：Fastify

**理由**：
- 性能提升明显（benchmarks 显示快 30%）
- 更好的 TypeScript 支持
- 仍保持轻量级定位

**权衡**：
- ✅ 性能提升、更好的类型支持
- ❌ 需要重写中间件、学习曲线

**迁移时间**：2周
```

---

### 场景6：新增开发陷阱

**影响范围**：
- 发现新的常见错误模式
- 文档：`CLAUDE.md`（必需）✅

**更新步骤**：
1. 在 `CLAUDE.md` 的"常见陷阱"部分添加：
   - 陷阱名称和编号
   - 错误示例
   - 正确做法
   - 检查清单

2. 在 `docs/CONTRIBUTING.md` 的"常见陷阱"部分：
   - 添加快速引用
   - 链接到 `CLAUDE.md` 的详细说明

**示例**：
```markdown
<!-- CLAUDE.md -->
**陷阱6：直接修改 DOM 导致状态不一致**

❌ 错误示例：
```javascript
document.getElementById('output').innerHTML = '...';
```

✅ 正确做法：
```javascript
const output = document.getElementById('output');
output.textContent = '...';
updateState({ output: '...' });
```

**检查清单**：
- [ ] 使用状态管理更新 UI
- [ ] 避免直接操作 DOM
```

---

## 文档定位检查清单

### 在更新任何文档前，使用此清单

#### 步骤1：确认文档职责

**问题1：这个信息应该放在哪个文档？**

| 信息类型 | 正确位置 | ❌ 错误位置 |
|---------|---------|-----------|
| 项目约束（不要做什么） | `CLAUDE.md` | CONTRIBUTING.md |
| API 端点详细说明 | `docs/API.md` | ARCHITECTURE.md、README.md |
| 编码规范（命名、注释） | `docs/CONTRIBUTING.md` | CLAUDE.md |
| 技术选型理由 | `docs/ARCHITECTURE.md` | 所有其他文档 |
| 进度跟踪 | `docs/PROGRESS.md` | 所有其他文档 |
| 环境搭建步骤 | `docs/SETUP.md` | README.md（简化版） |
| 故障排查 | `docs/TROUBLESHOOTING.md` | 所有其他文档 |
| 测试用例 | `docs/TESTING.md` | 所有其他文档 |
| 功能专题（虚拟形象等） | `docs/AVATAR_GUIDE.md` 等 | README.md（简化版） |

---

#### 步骤2：检查重复

**问题2：这个信息是否在其他文档中存在？**

**检查方法**：
```bash
# 搜索关键词
grep -r "API 端点" docs/*.md
grep -r "流式响应" docs/*.md

# 如果找到多个结果，说明可能存在重复
```

**决策树**：
```
这个信息是否已经在其他文档中详细说明？
│
├─ 是 → 是否完全相同？
│   ├─ 是 → 不要重复，添加引用
│   └─ 否 → 概览在一处，详细在另一处
│
└─ 否 → 这是哪个文档的职责？
    └─ 添加到该文档
```

**示例**：
```markdown
✅ 正确：
<!-- README.md -->
详细的 API 文档请参阅 [docs/API.md](docs/API.md)

❌ 错误：
<!-- README.md -->
## API 接口
（复制 API.md 的所有内容）
```

---

#### 步骤3：验证详细程度

**问题3：这个内容的详细程度是否合适？**

| 文档类型 | 详细程度 | 示例 |
|---------|---------|------|
| **README.md** | ⭐⭐ 简要（1-2句话） | "支持流式响应" |
| **INDEX.md** | ⭐⭐ 导航（链接列表） | "API.md - API参考文档" |
| **ARCHITECTURE.md** | ⭐⭐⭐ 中等（为什么） | "选择 Express.js 的3个理由" |
| **API.md** | ⭐⭐⭐⭐⭐ 详细（完整参考） | "端点、请求、响应、示例" |
| **design/*.md** | ⭐⭐⭐⭐⭐ 极详细（实施步骤） | "步骤1.1-1.8，包含代码" |
| **PROGRESS.md** | ⭐ 概览（一行说明） | "第1步：基础框架（1-2天）" |
| **CONTRIBUTING.md** | ⭐⭐⭐ 实用（代码模板） | "命名约定、函数结构" |
| **CLAUDE.md** | ⭐⭐⭐ 完整（AI必须知道） | "项目约束、工作流程、陷阱" |

---

#### 步骤4：确认读者对象

**问题4：这个文档的读者是谁？**

| 读者 | 主要文档 | 说明 |
|------|---------|------|
| **AI 助手** | `CLAUDE.md` | 自动读取，必须完整准确 |
| **人类开发者** | `docs/CONTRIBUTING.md`、`docs/API.md` | 详细、可操作 |
| **新开发者** | `docs/SETUP.md`、`README.md` | 简单、清晰 |
| **架构师** | `docs/ARCHITECTURE.md`、`docs/design/*.md` | 技术深度 |
| **项目管理者** | `docs/PROGRESS.md`、`docs/ROADMAP.md` | 进度、规划 |
| **终端用户** | `docs/USER_GUIDE.md`（未来） | 易用、图文并茂 |

---

### 快速检查清单

在提交文档更新前，快速回答以下问题：

1. ✅ 这个信息放在我正在更新的文档中，是否合适？
2. ✅ 这个信息是否与其他文档重复？
3. ✅ 这个信息的详细程度是否符合该文档的定位？
4. ✅ 这个文档的读者是谁？内容对他们有用吗？
5. ✅ 如果引用了其他文档，链接是否正确？

---

## 文档维护最佳实践

### 实践1：代码和文档一起提交

**提交原则**：
- ✅ 代码变更和文档更新在同一个 commit
- ✅ Commit message 同时描述代码和文档变更
- ❌ 避免代码提交后"回头再更新文档"

**示例**：
```bash
# 提交新功能
git add server.js docs/API.md docs/PROGRESS.md
git commit -m "feat: 添加用户统计API

- 新增 GET /api/user/stats 接口
- 更新 API.md 文档
- 标记 PROGRESS.md 任务为已完成"
```

---

### 实践2：文档更新模板

为常见变更创建模板：

#### 新增 API 模板

```markdown
## 变更说明
新增了 xxx API 端点

## 文档更新
- [ ] docs/API.md - 添加端点说明
  - [ ] 端点路径和方法
  - [ ] 请求参数
  - [ ] 响应格式
  - [ ] 使用示例
  - [ ] 错误码

## 检查清单
- [ ] API.md 已包含完整信息
- [ ] 使用示例可运行
- [ ] 没有与其他文档重复
```

#### 修复 Bug 模板

```markdown
## 变更说明
修复了 xxx 问题

## 文档更新
- [ ] docs/TROUBLESHOOTING.md - 添加问题解决步骤（如果是常见问题）
- [ ] docs/TESTING.md - 更新测试用例（如果影响测试）

## 检查清单
- [ ] 问题已记录到 TROUBLESHOOTING.md
- [ ] 解决方案清晰可操作
```

---

### 实践3：定期文档审查

**审查频率**：
- 小型项目：每季度
- 中型项目：每月
- 大型项目：每两周

**审查内容**：
- [ ] 文档与代码一致性
- [ ] 文档间是否有重复
- [ ] 文档定位是否清晰
- [ ] 链接是否有效
- [ ] 示例代码是否可运行

**审查流程**：
```bash
# 1. 检查文档与代码一致性
git log --since="3 months ago" --pretty=format:"%h" | while read commit; do
  git show $commit --name-only | grep "server.js" > /tmp/changed_files.txt
  # 检查对应的文档是否同时更新
done

# 2. 使用 grep 查找可能的重复
grep -r "流式响应" docs/*.md | wc -l
# 如果 > 3，可能存在重复

# 3. 检查链接
grep -r "\](.*.md)" docs/*.md | while read line; do
  # 验证链接文件存在
done
```

---

### 实践4：文档版本标记

在文档中标注适用的代码版本：

```markdown
<!-- docs/API.md -->
# API 参考文档

> **适用版本**：v2.2.0+
> **最后更新**：2026-01-16
```

**好处**：
- 读者知道文档是否适用于当前版本
- 维护者知道文档可能已过时

---

## 自动化机制

### 1. Git Hook 检查

创建 `.git/hooks/pre-commit`：

```bash
#!/bin/bash
# .git/hooks/pre-commit

echo "📝 检查文档是否需要更新..."

# 检查是否修改了 server.js
if git diff --cached --name-only | grep -q "server.js"; then
  echo "⚠️  检测到 server.js 变更"
  echo "请确认："
  echo "  - [ ] 如果新增了 API，已更新 docs/API.md"
  echo "  - [ ] 如果修改了 API，已更新 docs/API.md"
  echo ""
  read -p "文档已更新？(y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ 请先更新文档，然后再提交"
    exit 1
  fi
fi

# 检查是否修改了 config/
if git diff --cached --name-only | grep -q "config/"; then
  echo "⚠️  检测到配置文件变更"
  echo "请确认："
  echo "  - [ ] 已更新 docs/SETUP.md"
  echo ""
fi

echo "✅ 文档检查通过"
```

**使用方法**：
```bash
# 赋予执行权限
chmod +x .git/hooks/pre-commit

# 现在 Git 会在每次提交前自动检查
```

---

### 2. 文档更新提醒脚本

创建 `scripts/check-docs.js`：

```javascript
// scripts/check-docs.js
const { execSync } = require('child_process');
const fs = require('fs');

// 获取变更的文件
const changedFiles = execSync('git diff --name-only HEAD', { encoding: 'utf-8' });

const checks = [
  {
    pattern: /server\.js$/,
    message: '检测到 server.js 变更',
    docs: ['docs/API.md', 'docs/ARCHITECTURE.md'],
    prompt: 'API 接口是否已更新？'
  },
  {
    pattern: /config\//,
    message: '检测到配置文件变更',
    docs: ['docs/SETUP.md'],
    prompt: '配置文档是否已更新？'
  },
  {
    pattern: /tools\//,
    message: '检测到工具代码变更',
    docs: ['docs/design/function-calling-framework.md'],
    prompt: '设计文档是否已更新？'
  }
];

let needsUpdate = false;

for (const file of changedFiles.split('\n')) {
  for (const check of checks) {
    if (check.pattern.test(file)) {
      console.log(`\n⚠️  ${check.message}`);
      console.log(`   可能需要更新：${check.docs.join(', ')}`);
      console.log(`   ${check.prompt}`);
      needsUpdate = true;
    }
  }
}

if (needsUpdate) {
  console.log('\n💡 请在提交前确认文档已更新');
  console.log('   参考：docs/DOCUMENTATION_MAINTENANCE.md\n');
}
```

**使用方法**：
```bash
# 在每次提交前运行
node scripts/check-docs.js
git add .
git commit -m "..."
```

---

### 3. 文档一致性检查脚本

创建 `scripts/validate-docs.js`：

```javascript
// scripts/validate-docs.js
const fs = require('fs');
const path = require('path');

// 检查 1：文档引用有效性
function checkLinks() {
  const docsDir = path.join(__dirname, '../docs');
  const issues = [];

  const files = fs.readdirSync(docsDir).filter(f => f.endsWith('.md'));

  for (const file of files) {
    const content = fs.readFileSync(path.join(docsDir, file), 'utf-8');

    // 查找所有 Markdown 链接
    const links = content.match(/\]\([^)]+\.md\)/g) || [];

    for (const link of links) {
      const target = link.match(/\(([^)]+)\)/)[1];
      const targetPath = path.join(docsDir, target);

      if (!fs.existsSync(targetPath)) {
        issues.push(`Broken link in ${file}: ${target}`);
      }
    }
  }

  return issues;
}

// 检查 2：重复内容检测
function checkDuplicates() {
  // 简化版：检查是否有相同的章节标题
  const allHeadings = {};
  const issues = [];

  const files = fs.readdirSync(path.join(__dirname, '../docs'))
    .filter(f => f.endsWith('.md'));

  for (const file of files) {
    const content = fs.readFileSync(path.join(__dirname, '../docs', file), 'utf-8');
    const headings = content.match(/^#+\s+.+$/gm) || [];

    for (const heading of headings) {
      const key = heading.replace(/^#+\s+/, '');

      if (!allHeadings[key]) {
        allHeadings[key] = [];
      }

      allHeadings[key].push(file);
    }
  }

  // 查找出现在多个文档中的章节
  for (const [heading, files] of Object.entries(allHeadings)) {
    if (files.length > 2) {
      issues.push(`Possible duplication: "${heading}" appears in ${files.length} docs`);
    }
  }

  return issues;
}

// 运行检查
console.log('🔍 检查文档一致性...\n');

const linkIssues = checkLinks();
const duplicateIssues = checkDuplicates();

if (linkIssues.length > 0) {
  console.log('❌ 发现断链：');
  linkIssues.forEach(issue => console.log(`   - ${issue}`));
}

if (duplicateIssues.length > 0) {
  console.log('⚠️  发现可能的重复：');
  duplicateIssues.forEach(issue => console.log(`   - ${issue}`));
}

if (linkIssues.length === 0 && duplicateIssues.length === 0) {
  console.log('✅ 文档一致性检查通过');
  process.exit(0);
} else {
  console.log('\n💡 请修复以上问题');
  process.exit(1);
}
```

**使用方法**：
```bash
node scripts/validate-docs.js
```

---

## 文档更新规范

### 规范1：文档更新时机

**必须更新文档的情况**：
- ✅ 新增、修改、删除 API 端点
- ✅ 新增功能特性
- ✅ 改变项目约束或架构决策
- ✅ 新增配置项
- ✅ 发现新的常见错误或陷阱

**可选更新文档的情况**：
- ⚠️ 优化代码性能（不影响外部接口）
- ⚠️ 重构内部实现（不改变行为）
- ⚠️ 修复 Bug（除非是常见问题）

---

### 规范2：文档更新内容

**新增 API 时必须包含**：
- ✅ 端点路径和 HTTP 方法
- ✅ 请求参数（类型、是否必需、默认值）
- ✅ 响应格式（成功和失败）
- ✅ 使用示例（curl 和 JavaScript）
- ✅ 错误码说明

**新增功能时必须包含**：
- ✅ 功能描述（1-2句话）
- ✅ 使用场景
- ✅ 测试用例

---

### 规范3：文档更新格式

**文档头部必须包含**：
```markdown
# 文档标题

> 文档说明
> **适用版本**：v2.x.x
> **最后更新**：YYYY-MM-DD
```

**重大变更必须记录**：
```markdown
## 变更历史

| 版本 | 日期 | 变更说明 |
|------|------|---------|
| v2.2.0 | 2026-01-16 | 新增 Function Calling API |
```

---

## 快速参考

### 代码变更 → 文档更新对照表

| 代码变更 | 必须更新文档 | 可选更新文档 |
|---------|-------------|-------------|
| 新增 API 端点 | `docs/API.md` | - |
| 修改 API 端点 | `docs/API.md` | - |
| 新增功能 | `README.md`、`docs/PROGRESS.md`、`docs/design/[feature-name].md` | `docs/TESTING.md` |
| 修改配置 | `docs/SETUP.md` | - |
| 改变架构 | `docs/ARCHITECTURE.md` | `CLAUDE.md`（如果影响约束） |
| 新增陷阱 | `CLAUDE.md` | `docs/CONTRIBUTING.md`（引用） |
| 修复用户常见问题 Bug | - | `docs/TROUBLESHOOTING.md` |
| **修复功能实施中的 Bug** | **`docs/design/[feature-name].md`** + **`docs/PROGRESS.md`（1行）** | - |
| 添加测试 | - | `docs/TESTING.md` |

---

### 文档定位速查

**我想...应该更新哪个文档？**

| 我想... | 应该更新 | ❌ 不要更新 |
|---------|----------|--------------|
| 记录新 API | `docs/API.md` | `README.md`（详细API） |
| 说明新功能 | `README.md`（简要） | `CONTRIBUTING.md` |
| 记录技术决策 | `docs/ARCHITECTURE.md` | 所有其他文档 |
| 更新进度 | `docs/PROGRESS.md` | 所有其他文档 |
| 添加配置说明 | `docs/SETUP.md` | `README.md`（详细） |
| 记录 Bug 解决 | `docs/TROUBLESHOOTING.md` | `README.md` |
| 添加测试用例 | `docs/TESTING.md` | 所有其他文档 |
| 记录陷阱 | `CLAUDE.md` | 所有其他文档 |
| 更新编码规范 | `docs/CONTRIBUTING.md` | `CLAUDE.md`（只放约束） |

---

## 相关文档

- [开发指南](CONTRIBUTING.md) - 编码规范
- [API 参考文档](API.md) - API 端点说明
- [CLAUDE.md](../CLAUDE.md) - AI 助手工作指南

---

**最后更新**：2026-01-16
**维护者**：项目维护团队
