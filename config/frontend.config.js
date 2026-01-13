/**
 * 前端配置
 * 这些配置会注入到前端代码中
 */

module.exports = {
    // API 配置
    api: {
        // 基础 URL（根据环境自动判断）
        getBaseUrl() {
            const hostname = window.location.hostname;
            const port = window.location.port;

            // 本地开发环境
            if (hostname === 'localhost' || hostname === '127.0.0.1') {
                return `http://${hostname}:${port || 3000}`;
            }

            // 生产环境使用相对路径
            return '';
        },
        timeout: 30000
    },

    // 功能配置
    features: {
        defaultProvider: process.env.DEFAULT_MODEL || 'glm',
        enableStream: true,
        maxMessageLength: parseInt(process.env.MAX_MESSAGE_LENGTH) || 10000,
        maxHistoryMessages: 100
    },

    // 虚拟形象配置
    avatars: {
        '小樱': {
            emoji: '🌸',
            name: '小樱',
            status: '在线',
            personality: '温柔',
            gradient: 'linear-gradient(135deg, #C5E8D0, #DDE8D8, #FFE5D8, #FFD4C2)'
        },
        '咪咪': {
            emoji: '🐱',
            name: '咪咪',
            status: '在线',
            personality: '调皮',
            gradient: 'linear-gradient(135deg, #FFD4C2, #F5E0E0, #E8D8F0, #E2D4F0)'
        },
        '小智': {
            emoji: '🤖',
            name: '小智',
            status: '在线',
            personality: '理性',
            gradient: 'linear-gradient(135deg, #E2D4F0, #D8E8F0, #C5E8D8, #C5E8D0)'
        },
        '阿狐': {
            emoji: '🦊',
            name: '阿狐',
            status: '在线',
            personality: '机智',
            gradient: 'linear-gradient(135deg, #FFE5B4, #FFE0D0, #FFD8C8, #FFD4C2)'
        }
    },

    // UI 配置
    ui: {
        theme: 'soft-pastel',
        autoScroll: true,
        showTypingIndicator: true
    }
};

/**
 * 生成前端配置文件
 * 此函数在服务器启动时调用，生成 public/config.js
 */
function generateFrontendConfig() {
    const frontendConfig = require('./frontend.config');

    const config = {
        api: {
            baseUrl: '', // 运行时动态判断
            timeout: frontendConfig.api.timeout
        },
        features: frontendConfig.features,
        avatars: frontendConfig.avatars,
        ui: frontendConfig.ui
    };

    return `// 前端配置文件
// 此文件由服务器启动时自动生成，请勿手动编辑

window.CONFIG = ${JSON.stringify(config, null, 2)};`;
}

module.exports.generateFrontendConfig = generateFrontendConfig;
module.exports.config = module.exports;
