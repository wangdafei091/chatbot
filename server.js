require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());

// 日志中间件
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// AI 服务适配器
class AIAdapter {
    /**
     * GLM (智谱AI) API 调用
     * 文档：https://open.bigmodel.cn/dev/api
     */
    static async chatWithGLM(message, history = []) {
        const API_KEY = process.env.GLM_API_KEY;
        if (!API_KEY) {
            throw new Error('GLM_API_KEY 未配置');
        }

        // GLM API 格式：将历史消息转换为 GLM 格式
        const messages = history.map(msg => ({
            role: msg.role === 'assistant' ? 'assistant' : 'user',
            content: msg.content
        }));
        messages.push({ role: 'user', content: message });

        try {
            const response = await axios.post(
                'https://open.bigmodel.cn/api/paas/v4/chat/completions',
                {
                    model: 'glm-4',  // 使用 GLM-4 模型
                    messages: messages,
                    temperature: 0.7,
                    top_p: 0.9,
                    max_tokens: 2000
                },
                {
                    headers: {
                        'Authorization': `Bearer ${API_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 30000
                }
            );

            return {
                content: response.data.choices[0].message.content,
                model: 'glm-4',
                usage: response.data.usage
            };
        } catch (error) {
            console.error('GLM API Error:', error.response?.data || error.message);
            throw new Error(`GLM API 调用失败: ${error.response?.data?.error?.message || error.message}`);
        }
    }

    /**
     * DeepSeek API 调用
     * 文档：https://platform.deepseek.com/api-docs
     */
    static async chatWithDeepSeek(message, history = []) {
        const API_KEY = process.env.DEEPSEEK_API_KEY;
        if (!API_KEY) {
            throw new Error('DEEPSEEK_API_KEY 未配置');
        }

        // DeepSeek API 格式
        const messages = history.map(msg => ({
            role: msg.role === 'assistant' ? 'assistant' : 'user',
            content: msg.content
        }));
        messages.push({ role: 'user', content: message });

        try {
            const response = await axios.post(
                'https://api.deepseek.com/v1/chat/completions',
                {
                    model: 'deepseek-chat',  // DeepSeek 聊天模型
                    messages: messages,
                    temperature: 0.7,
                    max_tokens: 2000
                },
                {
                    headers: {
                        'Authorization': `Bearer ${API_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 30000
                }
            );

            return {
                content: response.data.choices[0].message.content,
                model: 'deepseek-chat',
                usage: response.data.usage
            };
        } catch (error) {
            console.error('DeepSeek API Error:', error.response?.data || error.message);
            throw new Error(`DeepSeek API 调用失败: ${error.response?.data?.error?.message || error.message}`);
        }
    }

    /**
     * 根据提供商调用相应的 AI 服务
     */
    static async chat(provider, message, history = []) {
        console.log(`Calling ${provider} API with message: "${message.substring(0, 50)}..."`);

        switch (provider) {
            case 'glm':
                return await this.chatWithGLM(message, history);
            case 'deepseek':
                return await this.chatWithDeepSeek(message, history);
            default:
                throw new Error(`不支持的 AI 提供商: ${provider}`);
        }
    }
}

// ==================== API 路由 ====================

/**
 * 健康检查接口
 */
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        models: {
            glm: !!process.env.GLM_API_KEY,
            deepseek: !!process.env.DEEPSEEK_API_KEY
        }
    });
});

/**
 * 获取可用的模型列表
 */
app.get('/api/models', (req, res) => {
    const models = [];
    if (process.env.GLM_API_KEY) {
        models.push({ id: 'glm', name: 'GLM-4 (智谱AI)', provider: 'glm' });
    }
    if (process.env.DEEPSEEK_API_KEY) {
        models.push({ id: 'deepseek', name: 'DeepSeek Chat', provider: 'deepseek' });
    }
    res.json({ models, default: process.env.DEFAULT_MODEL || 'glm' });
});

/**
 * 聊天接口（非流式）
 * POST /api/chat
 * Body: { message: string, history: array, provider: string }
 */
app.post('/api/chat', async (req, res) => {
    const { message, history = [], provider = process.env.DEFAULT_MODEL || 'glm' } = req.body;

    // 验证请求
    if (!message || typeof message !== 'string') {
        return res.status(400).json({
            error: '消息内容不能为空',
            code: 'INVALID_MESSAGE'
        });
    }

    if (message.length > 10000) {
        return res.status(400).json({
            error: '消息长度不能超过 10000 字符',
            code: 'MESSAGE_TOO_LONG'
        });
    }

    try {
        // 调用 AI API
        const result = await AIAdapter.chat(provider, message, history);

        // 返回结果
        res.json({
            reply: result.content,
            model: result.model,
            usage: result.usage,
            provider: provider
        });

    } catch (error) {
        console.error('Chat API Error:', error);

        // 返回错误信息
        res.status(500).json({
            error: error.message || 'AI 服务暂时不可用，请稍后重试',
            code: 'API_ERROR',
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

/**
 * 切换默认模型
 * POST /api/set-model
 * Body: { provider: string }
 */
app.post('/api/set-model', (req, res) => {
    const { provider } = req.body;

    if (!['glm', 'deepseek'].includes(provider)) {
        return res.status(400).json({
            error: '无效的模型提供商，必须是 glm 或 deepseek',
            code: 'INVALID_PROVIDER'
        });
    }

    // 检查对应的 API Key 是否配置
    const apiKey = provider === 'glm'
        ? process.env.GLM_API_KEY
        : process.env.DEEPSEEK_API_KEY;

    if (!apiKey) {
        return res.status(400).json({
            error: `${provider.toUpperCase()} API Key 未配置`,
            code: 'API_KEY_NOT_CONFIGURED'
        });
    }

    process.env.DEFAULT_MODEL = provider;

    res.json({
        success: true,
        message: `已切换到 ${provider.toUpperCase()} 模型`,
        currentModel: provider
    });
});

/**
 * 获取当前配置信息
 */
app.get('/api/config', (req, res) => {
    res.json({
        defaultModel: process.env.DEFAULT_MODEL || 'glm',
        availableModels: {
            glm: !!process.env.GLM_API_KEY,
            deepseek: !!process.env.DEEPSEEK_API_KEY
        }
    });
});

// ==================== 静态文件服务 ====================

// 提供前端静态文件
app.use(express.static(__dirname));

// 所有其他路由返回 index.html（支持前端路由）
app.get('*', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// ==================== 错误处理 ====================

// 404 处理
app.use((req, res) => {
    res.status(404).json({
        error: '接口不存在',
        path: req.path
    });
});

// 全局错误处理
app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(500).json({
        error: '服务器内部错误',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// ==================== 启动服务器 ====================

app.listen(PORT, () => {
    console.log('\n=================================');
    console.log('🚀 AI Chatbot 后端服务已启动');
    console.log('=================================');
    console.log(`📡 服务地址: http://localhost:${PORT}`);
    console.log(`🔧 环境: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🤖 默认模型: ${process.env.DEFAULT_MODEL || 'glm'}`);
    console.log('\n已配置的模型:');
    if (process.env.GLM_API_KEY) console.log('  ✅ GLM-4 (智谱AI)');
    else console.log('  ❌ GLM-4 (未配置 API Key)');

    if (process.env.DEEPSEEK_API_KEY) console.log('  ✅ DeepSeek Chat');
    else console.log('  ❌ DeepSeek (未配置 API Key)');
    console.log('=================================\n');
});

// 优雅退出
process.on('SIGTERM', () => {
    console.log('收到 SIGTERM 信号，正在关闭服务器...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('\n收到 SIGINT 信号，正在关闭服务器...');
    process.exit(0);
});
