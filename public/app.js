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
