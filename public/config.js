/**
 * 前端配置文件
 * 此文件由 scripts/generate-config.js 自动生成
 * 最后更新时间: 2026-01-29T03:36:21.829Z
 */

window.CONFIG = {
    // API 配置
    api: {
        baseUrl: '', // 运行时动态判断（localhost 使用 http://localhost:3000，生产环境使用相对路径）
        timeout: 30000
    },

    // 功能配置
    features: {
        defaultProvider: 'glm',
        enableStream: true,
        maxMessageLength: 10000,
        maxHistoryMessages: 100
    },

    // 虚拟形象配置
    avatars: {
    "小樱": {
        "emoji": "🌸",
        "name": "小樱",
        "status": "在线",
        "personality": "温柔",
        "gradient": "linear-gradient(135deg, #C5E8D0, #DDE8D8, #FFE5D8, #FFD4C2)"
    },
    "咪咪": {
        "emoji": "🐱",
        "name": "咪咪",
        "status": "在线",
        "personality": "调皮",
        "gradient": "linear-gradient(135deg, #FFD4C2, #F5E0E0, #E8D8F0, #E2D4F0)"
    },
    "小智": {
        "emoji": "🤖",
        "name": "小智",
        "status": "在线",
        "personality": "理性",
        "gradient": "linear-gradient(135deg, #E2D4F0, #D8E8F0, #C5E8D8, #C5E8D0)"
    },
    "阿狐": {
        "emoji": "🦊",
        "name": "阿狐",
        "status": "在线",
        "personality": "机智",
        "gradient": "linear-gradient(135deg, #FFE5B4, #FFE0D0, #FFD8C8, #FFD4C2)"
    }
},

    // UI 配置
    ui: {
        theme: 'soft-pastel',
        autoScroll: true,
        showTypingIndicator: true
    }
};

console.log('✅ 前端配置已加载');
