require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const rateLimit = require('express-rate-limit');
const config = require('./config');

const app = express();
const PORT = config.server.port;

// ==================== 中间件配置 ====================

// CORS 配置（白名单）
app.use(cors(config.cors));

// 请求体大小限制
app.use(express.json({ limit: config.bodyLimit }));
app.use(express.urlencoded({ limit: config.bodyLimit, extended: true }));

// 速率限制
const limiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.max,
    message: config.rateLimit.message,
    standardHeaders: true, // 返回速率限制信息在 `RateLimit-*` 头中
    legacyHeaders: false,
});
app.use('/api/', limiter);

// 日志中间件
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// AI 服务适配器
class AIAdapter {
    /**
     * 获取 API Key
     */
    static getApiKey(provider) {
        const key = process.env[`${provider.toUpperCase()}_API_KEY`];
        if (!key) {
            throw new Error(`${provider.toUpperCase()}_API_KEY 未配置`);
        }
        return key;
    }

    /**
     * 格式化消息历史
     */
    static formatMessages(message, history = []) {
        const messages = history.map(msg => ({
            role: msg.role === 'assistant' ? 'assistant' : 'user',
            content: msg.content
        }));
        messages.push({ role: 'user', content: message });
        return messages;
    }

    /**
     * GLM (智谱AI) API 调用
     * 文档：https://open.bigmodel.cn/dev/api
     */
    static async chatWithGLM(message, history = []) {
        const API_KEY = this.getApiKey('glm');
        const messages = this.formatMessages(message, history);
        const cfg = config.ai.glm;

        try {
            const response = await axios.post(
                'https://open.bigmodel.cn/api/paas/v4/chat/completions',
                {
                    model: cfg.model,
                    messages: messages,
                    temperature: cfg.temperature,
                    top_p: cfg.top_p,
                    max_tokens: cfg.max_tokens
                },
                {
                    headers: {
                        'Authorization': `Bearer ${API_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: cfg.timeout
                }
            );

            return {
                content: response.data.choices[0].message.content,
                model: cfg.model,
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
        const API_KEY = this.getApiKey('deepseek');
        const messages = this.formatMessages(message, history);
        const cfg = config.ai.deepseek;

        try {
            const response = await axios.post(
                'https://api.deepseek.com/v1/chat/completions',
                {
                    model: cfg.model,
                    messages: messages,
                    temperature: cfg.temperature,
                    max_tokens: cfg.max_tokens
                },
                {
                    headers: {
                        'Authorization': `Bearer ${API_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: cfg.timeout
                }
            );

            return {
                content: response.data.choices[0].message.content,
                model: cfg.model,
                usage: response.data.usage
            };
        } catch (error) {
            console.error('DeepSeek API Error:', error.response?.data || error.message);
            throw new Error(`DeepSeek API 调用失败: ${error.response?.data?.error?.message || error.message}`);
        }
    }

    /**
     * GLM 流式 API 调用
     * 支持 Server-Sent Events (SSE)
     */
    static async chatWithGLMStream(message, history = [], onData, onError, onComplete, abortController = null) {
        const API_KEY = this.getApiKey('glm');
        const messages = this.formatMessages(message, history);
        const cfg = config.ai.glm;

        console.log(`[GLM Stream] 开始调用 API，消息: "${message.substring(0, 30)}..."`);

        try {
            const response = await axios.post(
                'https://open.bigmodel.cn/api/paas/v4/chat/completions',
                {
                    model: cfg.model,
                    messages: messages,
                    stream: true,
                    temperature: cfg.temperature,
                    top_p: cfg.top_p,
                    max_tokens: cfg.max_tokens
                },
                {
                    headers: {
                        'Authorization': `Bearer ${API_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    responseType: 'stream',
                    timeout: cfg.streamTimeout,
                    signal: abortController?.signal // 支持取消请求
                }
            );

            console.log('[GLM Stream] API 响应成功，开始读取流...');
            let buffer = '';
            let chunkCount = 0;

            response.data.on('data', (chunk) => {
                // 检查是否已中止
                if (abortController?.signal.aborted) {
                    console.log('[GLM Stream] 请求已中止');
                    return;
                }

                chunkCount++;
                buffer += chunk.toString();
                const lines = buffer.split('\n');

                // 保留最后一个可能不完整的行
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (line.trim() === '') continue;
                    if (!line.startsWith('data: ')) continue;

                    const data = line.slice(6).trim();

                    if (data === '[DONE]') {
                        console.log('[GLM Stream] 收到 [DONE]');
                        if (onComplete) onComplete();
                        return;
                    }

                    try {
                        const parsed = JSON.parse(data);
                        const content = parsed.choices?.[0]?.delta?.content;

                        if (content) {
                            console.log(`[GLM Stream] 收到内容: "${content.substring(0, 20)}..."`);
                            if (onData) onData(content);
                        }
                    } catch (e) {
                        console.warn('[GLM Stream] 解析错误:', e.message, 'Data:', data.substring(0, 100));
                    }
                }
            });

            response.data.on('end', () => {
                console.log(`[GLM Stream] 流结束，共 ${chunkCount} 个数据块`);
                if (onComplete) onComplete();
            });

            response.data.on('error', (error) => {
                if (abortController?.signal.aborted) {
                    console.log('[GLM Stream] 请求已中止');
                    return;
                }
                console.error('[GLM Stream] 流错误:', error);
                if (onError) onError(error);
            });

        } catch (error) {
            if (axios.isCancel(error)) {
                console.log('[GLM Stream] 请求已取消');
                return;
            }
            console.error('[GLM Stream] API 调用错误:', error.response?.data || error.message);
            if (onError) onError(error);
        }
    }

    /**
     * DeepSeek 流式 API 调用
     * 支持 Server-Sent Events (SSE)
     */
    static async chatWithDeepSeekStream(message, history = [], onData, onError, onComplete, abortController = null) {
        const API_KEY = this.getApiKey('deepseek');
        const messages = this.formatMessages(message, history);
        const cfg = config.ai.deepseek;

        try {
            const response = await axios.post(
                'https://api.deepseek.com/v1/chat/completions',
                {
                    model: cfg.model,
                    messages: messages,
                    stream: true,
                    temperature: cfg.temperature,
                    max_tokens: cfg.max_tokens
                },
                {
                    headers: {
                        'Authorization': `Bearer ${API_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    responseType: 'stream',
                    timeout: cfg.streamTimeout,
                    signal: abortController?.signal // 支持取消请求
                }
            );

            let buffer = '';
            let chunkCount = 0;

            response.data.on('data', (chunk) => {
                // 检查是否已中止
                if (abortController?.signal.aborted) {
                    console.log('[DeepSeek Stream] 请求已中止');
                    return;
                }

                chunkCount++;
                buffer += chunk.toString();
                const lines = buffer.split('\n');

                // 保留最后一个可能不完整的行
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (line.trim() === '') continue;
                    if (!line.startsWith('data: ')) continue;

                    const data = line.slice(6).trim();

                    if (data === '[DONE]') {
                        console.log(`[DeepSeek Stream] 流结束，共 ${chunkCount} 个数据块`);
                        if (onComplete) onComplete();
                        return;
                    }

                    try {
                        const parsed = JSON.parse(data);
                        const content = parsed.choices?.[0]?.delta?.content;

                        if (content) {
                            if (onData) onData(content);
                        }
                    } catch (e) {
                        console.warn('[DeepSeek Stream] 解析错误:', e.message, 'Data:', data.substring(0, 100));
                    }
                }
            });

            response.data.on('end', () => {
                console.log(`[DeepSeek Stream] 流结束`);
                if (onComplete) onComplete();
            });

            response.data.on('error', (error) => {
                if (abortController?.signal.aborted) {
                    console.log('[DeepSeek Stream] 请求已中止');
                    return;
                }
                console.error('[DeepSeek Stream] 流错误:', error);
                if (onError) onError(error);
            });

        } catch (error) {
            if (axios.isCancel(error)) {
                console.log('[DeepSeek Stream] 请求已取消');
                return;
            }
            console.error('[DeepSeek Stream] API 调用错误:', error.response?.data || error.message);
            if (onError) onError(error);
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
 * 聊天接口（流式）
 * POST /api/chat/stream
 * Body: { message: string, history: array, provider: string }
 * 返回: Server-Sent Events (SSE)
 */
app.post('/api/chat/stream', async (req, res) => {
    const { message, history = [], provider = config.api.defaultProvider } = req.body;

    // 验证请求
    if (!message || typeof message !== 'string') {
        return res.status(400).json({
            error: '消息内容不能为空',
            code: 'INVALID_MESSAGE'
        });
    }

    if (message.length > config.validation.maxMessageLength) {
        return res.status(400).json({
            error: `消息长度不能超过 ${config.validation.maxMessageLength} 字符`,
            code: 'MESSAGE_TOO_LONG'
        });
    }

    // 设置 SSE 响应头
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');  // 禁用 Nginx 缓冲

    // 创建 AbortController 用于中断请求
    const abortController = new AbortController();

    // 发送初始事件
    res.write(`data: ${JSON.stringify({ type: 'start', provider })}\n\n`);

    // 处理客户端断开连接
    req.on('close', () => {
        console.log('[Stream] Client closed connection, aborting API call');
        abortController.abort();  // 中断 axios 请求
    });

    try {
        // 根据提供商调用流式 API
        switch (provider) {
            case 'glm':
                await AIAdapter.chatWithGLMStream(
                    message,
                    history,
                    // onData 回调
                    (content) => {
                        if (!res.writableEnded) {
                            res.write(`data: ${JSON.stringify({ type: 'content', content })}\n\n`);
                        }
                    },
                    // onError 回调
                    (error) => {
                        if (!res.writableEnded) {
                            res.write(`data: ${JSON.stringify({ type: 'error', error: error.message })}\n\n`);
                            res.end();
                        }
                    },
                    // onComplete 回调
                    () => {
                        if (!res.writableEnded) {
                            res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
                            res.end();
                        }
                    },
                    abortController  // 传递 abortController
                );
                break;

            case 'deepseek':
                await AIAdapter.chatWithDeepSeekStream(
                    message,
                    history,
                    // onData 回调
                    (content) => {
                        if (!res.writableEnded) {
                            res.write(`data: ${JSON.stringify({ type: 'content', content })}\n\n`);
                        }
                    },
                    // onError 回调
                    (error) => {
                        if (!res.writableEnded) {
                            res.write(`data: ${JSON.stringify({ type: 'error', error: error.message })}\n\n`);
                            res.end();
                        }
                    },
                    // onComplete 回调
                    () => {
                        if (!res.writableEnded) {
                            res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
                            res.end();
                        }
                    },
                    abortController  // 传递 abortController
                );
                break;

            default:
                res.write(`data: ${JSON.stringify({ type: 'error', error: '不支持的提供商' })}\n\n`);
                res.end();
        }

    } catch (error) {
        console.error('Stream Chat API Error:', error);

        if (!res.writableEnded) {
            res.write(`data: ${JSON.stringify({ type: 'error', error: error.message || 'AI 服务暂时不可用' })}\n\n`);
            res.end();
        }
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
