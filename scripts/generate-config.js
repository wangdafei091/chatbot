#!/usr/bin/env node

/**
 * 生成前端配置文件
 * 运行: node scripts/generate-config.js
 */

const fs = require('fs');
const path = require('path');

// 读取前端配置
const frontendConfig = require('../config/frontend.config');

// 生成配置内容
const configContent = `/**
 * 前端配置文件
 * 此文件由 scripts/generate-config.js 自动生成
 * 最后更新时间: ${new Date().toISOString()}
 */

window.CONFIG = {
    // API 配置
    api: {
        baseUrl: '', // 运行时动态判断（localhost 使用 http://localhost:3000，生产环境使用相对路径）
        timeout: ${frontendConfig.api.timeout}
    },

    // 功能配置
    features: {
        defaultProvider: '${frontendConfig.features.defaultProvider}',
        enableStream: ${frontendConfig.features.enableStream},
        maxMessageLength: ${frontendConfig.features.maxMessageLength},
        maxHistoryMessages: ${frontendConfig.features.maxHistoryMessages}
    },

    // 虚拟形象配置
    avatars: ${JSON.stringify(frontendConfig.avatars, null, 4)},

    // UI 配置
    ui: {
        theme: '${frontendConfig.ui.theme}',
        autoScroll: ${frontendConfig.ui.autoScroll},
        showTypingIndicator: ${frontendConfig.ui.showTypingIndicator}
    }
};

console.log('✅ 前端配置已加载');
`;

// 写入文件
const outputPath = path.join(__dirname, '../public/config.js');
fs.writeFileSync(outputPath, configContent, 'utf8');

console.log('✅ 前端配置文件已生成:', outputPath);
console.log('📊 配置摘要:');
console.log('  - 默认模型:', frontendConfig.features.defaultProvider);
console.log('  - 虚拟形象数量:', Object.keys(frontendConfig.avatars).length);
console.log('  - 最大消息长度:', frontendConfig.features.maxMessageLength);
