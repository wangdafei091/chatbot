/**
 * AI Chatbot - 后端服务器
 *
 * 项目定位：轻量级AI聊天机器人（非企业级应用）
 * 技术栈：Express.js + GLM-4/DeepSeek API
 * 架构：单体应用，无数据库（使用localStorage）
 *
 * 核心特性：
 * - 双AI模型支持（GLM-4、DeepSeek）
 * - 流式响应（SSE - Server-Sent Events）
 * - 多轮对话上下文记忆
 * - 配置验证系统
 *
 * 重要约定：
 * - 不要建议引入重型框架（Vue、React、NestJS）
 * - 不要添加数据库（MongoDB、PostgreSQL）
 * - 不要重写SSE为WebSocket
 * - public/config.js 是自动生成的，不要手动编辑
 *
 * 开发前必读：
 * - docs/ARCHITECTURE.md - 架构设计和技术栈选择理由
 * - docs/CONTRIBUTING.md - 开发规范和常见任务指南
 *
 * @version 2.0.0
 */

require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const rateLimit = require('express-rate-limit');
const config = require('./config');
const { toolRegistry, toolExecutor } = require('./tools');
const { errorHandler, notFoundHandler } = require('./middleware/error-handler');

const app = express();
const PORT = config.server.port;

// 导入参数验证工具
const { validateParams, analyzeIntent } = require('./tools/utils/param-validator');

// 导入错误处理工具
const { asyncHandler, AppError, ErrorCodes } = require('./tools/utils/error-handler');

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
        const messages = history.map(msg => {
            const formatted = { role: msg.role };

            // 处理工具调用相关的消息
            if (msg.role === 'assistant' && msg.tool_calls) {
                formatted.tool_calls = msg.tool_calls;
                // Assistant messages with tool_calls must have content field (can be null or empty string)
                formatted.content = msg.content || null;
            } else if (msg.role === 'tool') {
                formatted.tool_call_id = msg.tool_call_id;
                formatted.content = msg.content;
            } else {
                formatted.content = msg.content;
            }

            return formatted;
        });

        // 只有当 message 存在且不是工具响应消息时才添加用户消息
        const lastMsg = history[history.length - 1];
        if (message !== null && message !== undefined && (!lastMsg || lastMsg.role !== 'tool')) {
            messages.push({ role: 'user', content: message });
        }

        return messages;
    }

    /**
     * GLM (智谱AI) API 调用
     * 文档：https://open.bigmodel.cn/dev/api
     */
    static async chatWithGLM(message, history = [], tools = null) {
        const API_KEY = this.getApiKey('glm');
        let messages = this.formatMessages(message, history);
        const cfg = config.ai.glm;

        const requestBody = {
            model: cfg.model,
            messages: messages,
            temperature: cfg.temperature,
            top_p: cfg.top_p,
            max_tokens: cfg.max_tokens
        };

        // 添加 tools 参数（如果提供）
        if (tools && Array.isArray(tools) && tools.length > 0) {
            requestBody.tools = tools;
        }

        try {
            const response = await axios.post(
                'https://open.bigmodel.cn/api/paas/v4/chat/completions',
                requestBody,
                {
                    headers: {
                        'Authorization': `Bearer ${API_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: cfg.timeout
                }
            );

            const aiMessage = response.data.choices[0].message;

            return {
                content: aiMessage.content,
                tool_calls: aiMessage.tool_calls || null,
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
    static async chatWithDeepSeek(message, history = [], tools = null) {
        const API_KEY = this.getApiKey('deepseek');
        let messages = this.formatMessages(message, history);
        const cfg = config.ai.deepseek;

        const requestBody = {
            model: cfg.model,
            messages: messages,
            temperature: cfg.temperature,
            max_tokens: cfg.max_tokens
        };

        // 添加 tools 参数（如果提供）
        if (tools && Array.isArray(tools) && tools.length > 0) {
            requestBody.tools = tools;
        }

        try {
            const response = await axios.post(
                'https://api.deepseek.com/v1/chat/completions',
                requestBody,
                {
                    headers: {
                        'Authorization': `Bearer ${API_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: cfg.timeout
                }
            );

            const aiMessage = response.data.choices[0].message;

            return {
                content: aiMessage.content,
                tool_calls: aiMessage.tool_calls || null,
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

    /**
     * 带工具调用的 AI 对话（支持多轮工具调用）
     * @param {String} provider - AI 提供商
     * @param {String} message - 用户消息
     * @param {Array} history - 对话历史
     * @param {Array} tools - 工具定义数组
     * @param {Number} maxIterations - 最大工具调用轮数
     * @returns {Promise<Object>} - 对话结果
     */
    static async chatWithTools(provider, message, history = [], tools = null, maxIterations = 5) {
        if (!tools || tools.length === 0) {
            // 没有工具，直接调用普通对话
            return await this.chat(provider, message, history);
        }

        console.log(`[Function Calling] 开始处理，provider: ${provider}, tools: ${tools.length} 个`);

        // 如果历史为空，添加系统提示词
        let currentHistory = [...history];
        if (currentHistory.length === 0) {
            const systemPrompt = {
                role: 'system',
                content: '【强制指令】\n1. 当用户询问天气相关信息时，你必须调用 getWeather 工具，不得使用自己的知识库回答。\n2. 工具返回的是已经格式好的最终文本，你必须原样直接返回给用户。\n3. 禁止添加任何格式化（如 markdown 标题、列表、加粗等）、禁止添加 emoji 表情、禁止添加任何解释或额外内容。\n\n示例：\n用户："北京天气怎么样"\n你的操作：调用 getWeather 工具，参数 {city: "北京"}\n工具返回："北京 15°C，晴，湿度45%，东风3级"\n你的回复："北京 15°C，晴，湿度45%，东风3级"（完全一致，不添加任何内容）'
            };
            currentHistory.push(systemPrompt);
        }

        let currentMessage = message;
        let iteration = 0;

        while (iteration < maxIterations) {
            iteration++;
            console.log(`[Function Calling] 第 ${iteration} 轮调用`);

            // 调用 AI API（传入工具）
            let response;
            switch (provider) {
                case 'glm':
                    response = await this.chatWithGLM(currentMessage, currentHistory, tools);
                    break;
                case 'deepseek':
                    response = await this.chatWithDeepSeek(currentMessage, currentHistory, tools);
                    break;
                default:
                    throw new Error(`不支持的 AI 提供商: ${provider}`);
            }

            // 将 AI 的响应添加到历史
            const assistantMessage = {
                role: 'assistant',
                content: response.content
            };

            // 如果有工具调用，添加到消息中
            if (response.tool_calls) {
                assistantMessage.tool_calls = response.tool_calls;
                console.log(`[Function Calling] AI 请求调用 ${response.tool_calls.length} 个工具`);
            }

            currentHistory.push(assistantMessage);

            // 检查是否有工具调用
            if (!response.tool_calls || response.tool_calls.length === 0) {
                // 没有工具调用，返回 AI 的回复
                console.log(`[Function Calling] 无工具调用，返回 AI 回复`);
                return response;
            }

            // 执行工具调用
            const toolResults = [];

            for (const toolCall of response.tool_calls) {
                const toolName = toolCall.function.name;
                const toolArgs = JSON.parse(toolCall.function.arguments);

                console.log(`[Function Calling] 执行工具: ${toolName}`, toolArgs);

                try {
                    // 执行工具
                    const result = await toolExecutor.executeTool(toolName, toolArgs);

                    // 构造工具结果消息
                    toolResults.push({
                        role: 'tool',
                        tool_call_id: toolCall.id,
                        content: JSON.stringify(result)
                    });

                    console.log(`[Function Calling] 工具 ${toolName} 执行成功`);
                } catch (error) {
                    console.error(`[Function Calling] 工具 ${toolName} 执行失败:`, error.message);

                    // 返回错误信息给 AI
                    toolResults.push({
                        role: 'tool',
                        tool_call_id: toolCall.id,
                        content: JSON.stringify({
                            success: false,
                            error: error.message
                        })
                    });
                }
            }

            // 将工具结果添加到历史
            currentHistory.push(...toolResults);

            // 如果只有一个工具且结果是字符串（不是 JSON 对象），直接返回结果
            if (toolResults.length === 1) {
                const toolResult = JSON.parse(toolResults[0].content);
                // 如果结果是字符串，直接返回（用于天气工具等返回格式化文本的场景）
                if (typeof toolResult === 'string') {
                    console.log(`[Function Calling] 工具返回纯文本，直接返回结果`);
                    return {
                        content: toolResult,
                        tool_calls: null,
                        model: provider,
                        usage: response.usage
                    };
                }
            }

            // 清空 currentMessage（因为工具结果已经通过历史传递）
            currentMessage = null;
        }

        // 达到最大迭代次数
        console.warn(`[Function Calling] 达到最大迭代次数 (${maxIterations})`);
        const lastMessage = currentHistory[currentHistory.length - 1];
        return {
            content: lastMessage.content || '工具调用达到最大迭代次数',
            tool_calls: null,
            model: 'unknown',
            usage: null
        };
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
app.post('/api/chat', asyncHandler(async (req, res) => {
    const { message, history = [], provider = process.env.DEFAULT_MODEL || 'glm' } = req.body;

    // 验证请求
    if (!message || typeof message !== 'string') {
        throw new AppError('消息内容不能为空', 'INVALID_MESSAGE', 400);
    }

    if (message.length > 10000) {
        throw new AppError('消息长度不能超过 10000 字符', 'MESSAGE_TOO_LONG', 400);
    }

    // 调用 AI API
    const result = await AIAdapter.chat(provider, message, history);

    // 返回结果
    res.json({
        reply: result.content,
        model: result.model,
        usage: result.usage,
        provider: provider
    });
}));

/**
 * 聊天接口（流式，支持 Function Calling）
 * POST /api/chat/stream
 * Body: { message: string, history: array, provider: string, useTools: boolean }
 * 返回: Server-Sent Events (SSE)
 */
app.post('/api/chat/stream', asyncHandler(async (req, res) => {
    const { message, history = [], provider = config.api.defaultProvider, useTools = true } = req.body;

    // 验证请求
    if (!message || typeof message !== 'string') {
        throw new AppError('消息内容不能为空', 'INVALID_MESSAGE', 400);
    }

    if (message.length > config.validation.maxMessageLength) {
        throw new AppError(`消息长度不能超过 ${config.validation.maxMessageLength} 字符`, 'MESSAGE_TOO_LONG', 400);
    }

    // 如果需要使用工具且有可用工具，改用工具调用接口
    if (useTools && toolRegistry.size() > 0) {
        console.log('[Stream] useTools=true, switching to tools endpoint');

        try {
            const result = await AIAdapter.chatWithTools(
                provider,
                message,
                history,
                toolRegistry.getAllToolDefinitions()
            );

            // 返回工具调用结果（非流式）
            return res.json({
                reply: result.content,
                model: result.model,
                usage: result.usage,
                provider: provider,
                toolsUsed: result.tool_calls !== null,
                toolResults: result.tool_calls || []
            });
        } catch (error) {
            console.error('[Stream] Tools endpoint error, falling back to stream:', error.message);
            // 如果工具调用失败，降级到流式接口
        }
    }

    // 使用流式接口
    console.log('[Stream] Using stream endpoint');

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
}));

/**
 * 切换默认模型
 * POST /api/set-model
 * Body: { provider: string }
 */
app.post('/api/set-model', asyncHandler(async (req, res) => {
    const { provider } = req.body;

    if (!['glm', 'deepseek'].includes(provider)) {
        throw new AppError('无效的模型提供商，必须是 glm 或 deepseek', 'INVALID_PROVIDER', 400);
    }

    // 检查对应的 API Key 是否配置
    const apiKey = provider === 'glm'
        ? process.env.GLM_API_KEY
        : process.env.DEEPSEEK_API_KEY;

    if (!apiKey) {
        throw new AppError(`${provider.toUpperCase()} API Key 未配置`, 'API_KEY_NOT_CONFIGURED', 400);
    }

    process.env.DEFAULT_MODEL = provider;

    res.json({
        success: true,
        message: `已切换到 ${provider.toUpperCase()} 模型`,
        currentModel: provider
    });
}));

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

// ==================== 工具系统接口 ====================

/**
 * GET /api/tools - 获取所有已注册的工具
 */
app.get('/api/tools', asyncHandler(async (req, res) => {
    const tools = toolRegistry.getToolNames();
    const definitions = toolRegistry.getAllToolDefinitions();

    res.json({
        success: true,
        count: tools.length,
        tools: tools,
        definitions: definitions
    });
}));

/**
 * POST /api/chat/tools - 带工具调用的聊天接口（原生 Function Calling）
 *
 * 使用 AI API 的原生 Function Calling 能力
 * AI 会自动决定何时调用工具以及如何处理工具结果
 */
app.post('/api/chat/tools', asyncHandler(async (req, res) => {
    const { message, history = [], provider = process.env.DEFAULT_MODEL || 'glm' } = req.body;

    // 验证请求
    if (!message || typeof message !== 'string') {
        throw new AppError('消息内容不能为空', 'INVALID_MESSAGE', 400);
    }

    console.log('[Tools Chat] 收到消息:', message);

    // 获取所有工具定义
    const availableTools = toolRegistry.getAllToolDefinitions();
    console.log(`[Tools Chat] 可用工具: ${availableTools.length} 个`);

    if (availableTools.length === 0) {
        // 没有可用工具，使用普通对话
        console.log('[Tools Chat] 无可用工具，使用普通对话');
        const result = await AIAdapter.chat(provider, message, history);

        return res.json({
            reply: result.content,
            model: result.model,
            usage: result.usage,
            provider: provider,
            toolsUsed: false,
            toolResults: []
        });
    }

    // 使用原生 Function Calling
    console.log('[Tools Chat] 使用原生 Function Calling');
    const result = await AIAdapter.chatWithTools(
        provider,
        message,
        history,
        availableTools
    );

    // 判断是否使用了工具
    const toolsUsed = result.usage && result.usage.total_tokens > 0;

    res.json({
        reply: result.content,
        model: result.model,
        usage: result.usage,
        provider: provider,
        toolsUsed: toolsUsed,
        toolResults: result.tool_calls || []
    });
}));

// ==================== 静态文件服务 ====================

// 提供前端静态文件（优先从 public 目录）
app.use(express.static(path.join(__dirname, 'public')));

// 所有其他路由返回 index.html（支持前端路由）
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ==================== 错误处理 ====================

// 404 处理（使用统一错误处理器）
app.use(notFoundHandler);

// 全局错误处理（使用统一错误中间件）
app.use(errorHandler);

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
