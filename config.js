/**
 * 配置文件
 * 集中管理所有配置项
 */

const { validateConfig } = require('./config/validators');

// ==================== 配置定义 ====================

const rawConfig = {
    // 服务器配置
    server: {
        port: process.env.PORT || 3000,
        env: process.env.NODE_ENV || 'development'
    },

    // CORS 配置
    cors: {
        origin: process.env.ALLOWED_ORIGINS
            ? process.env.ALLOWED_ORIGINS.split(',')
            : ['http://localhost:3000', 'http://127.0.0.1:3000'],
        credentials: true
    },

    // 速率限制配置
    rateLimit: {
        windowMs: 15 * 60 * 1000, // 15 分钟
        max: parseInt(process.env.RATE_LIMIT_MAX) || 100, // 每个 IP 15 分钟内最多 100 个请求
        message: {
            error: '请求过于频繁，请稍后再试',
            code: 'RATE_LIMIT_EXCEEDED'
        }
    },

    // 请求体大小限制
    bodyLimit: '1mb',

    // AI 模型配置
    ai: {
        glm: {
            model: process.env.GLM_MODEL || 'glm-4',
            temperature: parseFloat(process.env.GLM_TEMPERATURE) || 0.7,
            top_p: parseFloat(process.env.GLM_TOP_P) || 0.9,
            max_tokens: parseInt(process.env.GLM_MAX_TOKENS) || 2000,
            timeout: parseInt(process.env.GLM_TIMEOUT) || 30000,
            streamTimeout: parseInt(process.env.GLM_STREAM_TIMEOUT) || 60000
        },
        deepseek: {
            model: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
            temperature: parseFloat(process.env.DEEPSEEK_TEMPERATURE) || 0.7,
            max_tokens: parseInt(process.env.DEEPSEEK_MAX_TOKENS) || 2000,
            timeout: parseInt(process.env.DEEPSEEK_TIMEOUT) || 30000,
            streamTimeout: parseInt(process.env.DEEPSEEK_STREAM_TIMEOUT) || 60000
        }
    },

    // 消息验证配置
    validation: {
        maxMessageLength: parseInt(process.env.MAX_MESSAGE_LENGTH) || 10000,
        minMessageLength: 1
    },

    // API 配置
    api: {
        defaultProvider: process.env.DEFAULT_MODEL || 'glm',
        providers: ['glm', 'deepseek']
    }
};

// ==================== 配置验证 ====================

try {
    // 验证配置
    const validation = validateConfig(rawConfig);

    // 导出验证后的配置
    module.exports = rawConfig;

    // 将验证结果附加到配置对象（可选，用于调试）
    module.exports._validation = validation;

} catch (error) {
    console.error('配置验证失败，应用无法启动');
    console.error('请检查 .env 文件和配置项');
    process.exit(1); // 配置错误时，不启动应用
}
