// ===== 虚拟形象配置系统 =====

let currentAvatar = {
emoji: '🌸',
name: '小樱',
status: '在线'
};

// ===== API 配置 =====
// 从全局配置读取
const API_BASE_URL = window.CONFIG?.api?.baseUrl || '';
const API_TIMEOUT = window.CONFIG?.api?.timeout || 30000;

// 对话历史
let conversationHistory = [];
let currentProvider = window.CONFIG?.features?.defaultProvider || 'glm';

// ===== 用户上下文系统（阶段 2.5）=====
/**
 * 用户上下文管理
 * 使用 localStorage 存储用户偏好和使用统计
 */
const UserContext = {
// 存储键名
STORAGE_KEY: 'chatbot_user_context',

/**
 * 默认上下文数据
 */
defaultContext: {
    // 快速开始功能使用统计
    quickStartUsage: {
        summarize: 0,
        extract: 0,
        ideas: 0
    },
    // 工具使用统计
    toolUsage: {
        summarizeArticle: 0,
        extractKeyInfo: 0
    },
    // 首次访问时间
    firstVisit: null,
    // 最后访问时间
    lastVisit: null,
    // 总对话次数
    totalConversations: 0,
    // 偏好的功能（按使用次数排序）
    preferredFeatures: []
},

/**
 * 加载用户上下文
 */
load() {
    try {
        const data = localStorage.getItem(this.STORAGE_KEY);
        if (data) {
            return { ...this.defaultContext, ...JSON.parse(data) };
        }
    } catch (error) {
        console.error('加载用户上下文失败:', error);
    }
    return { ...this.defaultContext };
},

/**
 * 保存用户上下文
 */
save(context) {
    try {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(context));
    } catch (error) {
        console.error('保存用户上下文失败:', error);
    }
},

/**
 * 记录快速开始使用
 */
recordQuickStart(type) {
    const context = this.load();
    context.quickStartUsage[type] = (context.quickStartUsage[type] || 0) + 1;
    context.lastVisit = new Date().toISOString();
    this.save(context);
    this.updatePreferredFeatures(context);
},

/**
 * 记录工具使用
 */
recordToolUsage(toolName) {
    const context = this.load();
    context.toolUsage[toolName] = (context.toolUsage[toolName] || 0) + 1;
    context.lastVisit = new Date().toISOString();
    this.save(context);
    this.updatePreferredFeatures(context);
},

/**
 * 更新偏好功能排序
 */
updatePreferredFeatures(context) {
    // 合并快速开始和工具使用统计
    const allUsage = {
        ...context.quickStartUsage,
        ...context.toolUsage
    };

    // 按使用次数排序
    context.preferredFeatures = Object.entries(allUsage)
        .sort(([, a], [, b]) => b - a)
        .map(([feature]) => feature);

    this.save(context);
},

/**
 * 获取推荐的快速开始顺序
 */
getRecommendedOrder() {
    const context = this.load();
    return context.preferredFeatures.length > 0
        ? context.preferredFeatures
        : ['summarize', 'extract', 'ideas']; // 默认顺序
},

/**
 * 初始化上下文（首次访问）
 */
initialize() {
    const context = this.load();
    if (!context.firstVisit) {
        context.firstVisit = new Date().toISOString();
        this.save(context);
        console.log('✓ 用户上下文已初始化');
    }
}
};

// 初始化用户上下文
UserContext.initialize();

// 虚拟形象数据库（从配置读取）
const avatarDatabase = window.CONFIG?.avatars || {
'小樱': {
emoji: '🌸',
name: '小樱',
status: '在线',
personality: '温柔',
gradient: 'linear-gradient(135deg, #C5E8D0, #DDE8D8, #FFE5D8, #FFD4C2)',
}
};

function toggleAvatarSelector() {
const selector = document.getElementById('avatarSelector');
const container = document.getElementById('avatarContainer');

selector.classList.toggle('active');
container.classList.toggle('expanded');
}

function selectAvatar(emoji, name) {
currentAvatar = avatarDatabase[name];

document.getElementById('topAvatarEmoji').textContent = emoji;
document.getElementById('avatarName').textContent = name;
document.getElementById('largeAvatarEmoji').textContent = emoji;
document.getElementById('welcomeTitle').textContent = `嗨，我是${name}`;

const gradient = currentAvatar.gradient;
document.querySelectorAll('.avatar-small-top, .robot-avatar-large').forEach(el => {
el.style.background = gradient;
});

toggleAvatarSelector();
localStorage.setItem('selectedAvatar', JSON.stringify(currentAvatar));
}

document.addEventListener('click', function(event) {
const selector = document.getElementById('avatarSelector');
const avatarContainer = document.querySelector('.avatar-container');

if (!selector.contains(event.target) && !avatarContainer.contains(event.target)) {
selector.classList.remove('active');
document.getElementById('avatarContainer').classList.remove('expanded');
}
});

function loadSavedAvatar() {
const saved = localStorage.getItem('selectedAvatar');
if (saved) {
const avatar = JSON.parse(saved);
selectAvatar(avatar.emoji, avatar.name);
}
}

window.addEventListener('load', loadSavedAvatar);

// ===== 聊天功能 =====

const mockResponses = [
"很好的问题！让我来帮你解答...",
"我理解你的需求。这里有一些建议：\n\n1. 首先要明确目标\n2. 制定详细的计划\n3. 逐步实施并持续优化",
"有趣的话题！从我的角度来看，关键在于...",
"让我想想...根据我的分析，我建议...",
"感谢你的提问！这里有一些相关信息...",
"这确实值得深入探讨。我们可以从以下几个方面来理解...",
"这个想法很有创意！我还可以提供一些扩展建议...",
"让我为你详细分析一下这个问题..."
];

function autoResize(textarea) {
textarea.style.height = 'auto';
textarea.style.height = Math.min(textarea.scrollHeight, 100) + 'px';
}

function updateSendButton() {
const input = document.getElementById('messageInput');
const button = document.getElementById('sendButton');
button.disabled = !input.value.trim();
}

function handleKeyDown(event) {
if (event.key === 'Enter' && !event.shiftKey) {
event.preventDefault();
sendMessage();
}
}

function sendPrompt(text) {
document.getElementById('messageInput').value = text;
updateSendButton();
sendMessage();
}

/**
 * 快速开始功能（Aha Moment）
 * @param {String} type - 快速开始类型
 */
function quickStart(type) {
const quickStartPrompts = {
    summarize: `请帮我总结下面这篇文章：

[在这里粘贴你的文章内容]

要求：
1. 提取主要观点（3-5 个要点）
2. 每个要点用一句话概括
3. 总长度控制在 200 字以内`,
    extract: `请从下面的文章中提取关键信息：

[粘贴文章内容]

需要提取的信息类型：
- 人名
- 地名
- 日期
- 重要数据`,
    ideas: `给我5个关于[主题]的创意点子，要求：
1. 创新性强
2. 可落地
3. 成本低

请为每个点子说明：创意点 + 实施方式`
};

const prompt = quickStartPrompts[type];
if (prompt) {
    document.getElementById('messageInput').value = prompt;
    updateSendButton();
    // 不自动发送，让用户可以先修改示例文本
    document.getElementById('messageInput').focus();

    // 记录使用情况（用户上下文）
    UserContext.recordQuickStart(type);
    console.log(`✓ 记录快速开始使用: ${type}`);
}
}

async function sendMessage() {
const input = document.getElementById('messageInput');
const message = input.value.trim();

if (!message) return;

// 隐藏欢迎界面
const welcome = document.getElementById('robotWelcome');
const decoration = document.getElementById('emptyStateDecoration');
if (welcome) {
welcome.style.display = 'none';
}
if (decoration) {
decoration.style.display = 'none';
}

// 添加用户消息到界面
addMessage(message, 'user');

// 添加到对话历史
conversationHistory.push({
role: 'user',
content: message
});

// 清空输入框
input.value = '';
input.style.height = 'auto';
updateSendButton();

// 显示"正在输入"动画
showTypingIndicator();

try {
// 调用后端流式 API
const response = await fetch(`${API_BASE_URL}/api/chat/stream`, {
method: 'POST',
headers: {
'Content-Type': 'application/json'
},
body: JSON.stringify({
message: message,
history: conversationHistory.slice(0, -1),  // 不包含当前消息
provider: currentProvider
})
});

if (!response.ok) {
throw new Error(`HTTP ${response.status}`);
}

// 隐藏"正在输入"动画
hideTypingIndicator();

// 创建 AI 消息容器（初始为空）
const aiMessageId = 'ai-' + Date.now();
addMessage('', 'ai', aiMessageId);
const messageElement = document.getElementById(aiMessageId);
const contentElement = messageElement.querySelector('.bubble');

// 读取流式响应
const reader = response.body.getReader();
const decoder = new TextDecoder();
let fullResponse = '';

while (true) {
const { done, value } = await reader.read();
if (done) break;

const chunk = decoder.decode(value);
const lines = chunk.split('\n');

for (const line of lines) {
if (line.startsWith('data: ')) {
const data = line.slice(6).trim();
if (!data) continue;

try {
const parsed = JSON.parse(data);

if (parsed.type === 'start') {
console.log(`✓ 开始流式响应，模型: ${parsed.provider}`);
} else if (parsed.type === 'content') {
// 追加内容到消息
fullResponse += parsed.content;
contentElement.textContent = fullResponse;
scrollToBottom();
} else if (parsed.type === 'error') {
// 显示错误
contentElement.textContent = `错误：${parsed.error}`;
fullResponse = '';  // 清空，不保存错误消息
} else if (parsed.type === 'done') {
// 流式响应完成
console.log('✓ 流式响应完成');
}
} catch (e) {
console.warn('Parse SSE data error:', e.message);
}
}
}
}

// 如果成功获取到回复，保存到对话历史
if (fullResponse) {
conversationHistory.push({
role: 'assistant',
content: fullResponse
});

// 保存到 localStorage
saveConversationHistory();
}

} catch (error) {
hideTypingIndicator();
console.error('❌ 流式 API 调用失败:', error);

// 显示错误消息
const errorMessage = `抱歉，发生了错误：${error.message}`;
addMessage(errorMessage, 'ai');

// 移除用户消息（因为失败了）
conversationHistory.pop();
}
}

// 保存对话历史到 localStorage
function saveConversationHistory() {
try {
localStorage.setItem('chatbot_history', JSON.stringify(conversationHistory));
localStorage.setItem('chatbot_provider', currentProvider);
} catch (error) {
console.warn('无法保存对话历史:', error);
}
}

// 从 localStorage 加载对话历史
function loadConversationHistory() {
try {
const saved = localStorage.getItem('chatbot_history');
const savedProvider = localStorage.getItem('chatbot_provider');

if (saved) {
conversationHistory = JSON.parse(saved);
// 可选：恢复历史消息到界面
// conversationHistory.forEach(msg => addMessage(msg.content, msg.role === 'assistant' ? 'ai' : 'user'));
}

if (savedProvider) {
currentProvider = savedProvider;
}
} catch (error) {
console.warn('无法加载对话历史:', error);
}
}

function addMessage(text, type, id = null) {
const container = document.getElementById('messagesContainer');
const time = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });

const messageDiv = document.createElement('div');
messageDiv.className = `message ${type}`;
if (id) messageDiv.id = id;  // 设置 ID（用于流式更新）

const avatar = type === 'ai' ? currentAvatar.emoji : '🌿';

messageDiv.innerHTML = `
<div class="avatar-small"><span class="emoji">${avatar}</span></div>
<div>
<div class="bubble">${escapeHtml(text).replace(/\n/g, '<br>')}</div>
<div class="message-time">${time}</div>
</div>
`;

container.appendChild(messageDiv);
scrollToBottom();
}

function showTypingIndicator() {
const container = document.getElementById('messagesContainer');
const typingDiv = document.createElement('div');
typingDiv.className = 'message ai';
typingDiv.id = 'typingIndicator';
typingDiv.innerHTML = `
<div class="avatar-small"><span class="emoji">${currentAvatar.emoji}</span></div>
<div class="typing-dots">
<div class="dot"></div>
<div class="dot"></div>
<div class="dot"></div>
</div>
`;
container.appendChild(typingDiv);
scrollToBottom();
}

function hideTypingIndicator() {
const typingIndicator = document.getElementById('typingIndicator');
if (typingIndicator) {
typingIndicator.remove();
}
}

function scrollToBottom() {
const container = document.getElementById('messagesContainer');
container.scrollTop = container.scrollHeight;
}

function escapeHtml(text) {
const div = document.createElement('div');
div.textContent = text;
return div.innerHTML;
}

window.onload = () => {
document.getElementById('messageInput').focus();
loadConversationHistory();
console.log('✓ 聊天机器人已启动');
console.log(`✓ 当前使用模型: ${currentProvider.toUpperCase()}`);
};
