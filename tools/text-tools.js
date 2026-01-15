/**
 * 文本处理工具
 * 提供文本总结、关键信息提取等功能
 */

const axios = require('axios');
const config = require('../config');

/**
 * 调用 AI API 进行文本处理
 * @param {String} prompt - 提示词
 * @returns {Promise<String>} - AI 响应内容
 */
async function callAIForTextProcessing(prompt) {
    try {
        const response = await axios.post(
            'http://localhost:3000/api/chat',
            {
                message: prompt,
                provider: config.ai.defaultProvider || 'glm',
                stream: false
            },
            {
                headers: { 'Content-Type': 'application/json' },
                timeout: 30000
            }
        );

        return response.data.content || response.data.message || '';
    } catch (error) {
        throw new Error(`AI 调用失败: ${error.message}`);
    }
}

// ===== 工具 1：文章总结 =====

/**
 * 总结文章工具定义
 */
const summarizeArticleDefinition = {
    type: 'function',
    function: {
        name: 'summarizeArticle',
        description: '总结文章的关键信息，提取主要观点和核心内容',
        parameters: {
            type: 'object',
            properties: {
                content: {
                    type: 'string',
                    description: '文章内容（可以是长文本）'
                },
                maxLength: {
                    type: 'number',
                    description: '总结的最大长度（字数）',
                    default: 200
                }
            },
            required: ['content']
        }
    }
};

/**
 * 总结文章处理器
 * @param {Object} params - 参数
 * @param {String} params.content - 文章内容
 * @param {Number} params.maxLength - 最大长度
 * @returns {Promise<Object>} - 总结结果
 */
async function summarizeArticleHandler(params) {
    const { content, maxLength = 200 } = params;

    // 验证参数
    if (!content || content.trim().length === 0) {
        throw new Error('文章内容不能为空');
    }

    if (content.length > 10000) {
        throw new Error('文章内容过长（最大 10000 字）');
    }

    // 构建提示词
    const prompt = `请用简洁的语言总结以下文章的核心观点，要求：
1. 提取主要观点（3-5 个要点）
2. 每个要点用一句话概括
3. 总长度控制在 ${maxLength} 字以内
4. 使用列表格式输出

文章内容：
${content}

请开始总结：`;

    try {
        const summary = await callAIForTextProcessing(prompt);

        return {
            success: true,
            summary: summary,
            originalLength: content.length,
            summaryLength: summary.length
        };
    } catch (error) {
        throw new Error(`总结失败: ${error.message}`);
    }
}

// ===== 工具 2：提取关键信息 =====

/**
 * 提取关键信息工具定义
 */
const extractKeyInfoDefinition = {
    type: 'function',
    function: {
        name: 'extractKeyInfo',
        description: '从文章中提取关键信息（如人名、地名、日期、数据等）',
        parameters: {
            type: 'object',
            properties: {
                content: {
                    type: 'string',
                    description: '文章内容'
                },
                infoTypes: {
                    type: 'array',
                    items: { type: 'string' },
                    description: '需要提取的信息类型（如：人名、地名、日期、数字、组织等）',
                    default: ['人名', '地名', '日期', '数字']
                }
            },
            required: ['content']
        }
    }
};

/**
 * 提取关键信息处理器
 * @param {Object} params - 参数
 * @param {String} params.content - 文章内容
 * @param {Array<String>} params.infoTypes - 信息类型
 * @returns {Promise<Object>} - 提取结果
 */
async function extractKeyInfoHandler(params) {
    const { content, infoTypes = ['人名', '地名', '日期', '数字'] } = params;

    // 验证参数
    if (!content || content.trim().length === 0) {
        throw new Error('文章内容不能为空');
    }

    // 构建提示词
    const infoTypesStr = infoTypes.join('、');
    const prompt = `请从以下文章中提取关键信息：${infoTypesStr}

要求：
1. 仔细阅读文章，找出所有相关信息
2. 按类别组织提取结果
3. 使用清晰的格式输出（如 JSON）

文章内容：
${content}

请开始提取：`;

    try {
        const result = await callAIForTextProcessing(prompt);

        // 尝试解析 AI 返回的结构化数据
        // 如果 AI 返回的是 JSON 格式，直接使用；否则作为文本返回
        let keyInfo = { raw: result };

        // 简单的 JSON 检测（如果 AI 返回的是格式化的数据）
        if (result.includes('{') && result.includes('}')) {
            try {
                // 尝试提取 JSON 部分
                const jsonMatch = result.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    keyInfo = JSON.parse(jsonMatch[0]);
                }
            } catch (e) {
                // JSON 解析失败，使用原始文本
                console.warn('JSON 解析失败，使用原始文本');
            }
        }

        return {
            success: true,
            keyInfo: keyInfo,
            extractedTypes: infoTypes
        };
    } catch (error) {
        throw new Error(`提取关键信息失败: ${error.message}`);
    }
}

// ===== 导出工具 =====

module.exports = [
    {
        name: 'summarizeArticle',
        definition: summarizeArticleDefinition,
        handler: summarizeArticleHandler
    },
    {
        name: 'extractKeyInfo',
        definition: extractKeyInfoDefinition,
        handler: extractKeyInfoHandler
    }
];
