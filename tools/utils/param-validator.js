/**
 * 参数验证和智能引导模块
 * 检查参数完整性并生成引导性问题
 */

const { logError } = require('./error-handler');

/**
 * 检查参数是否完整
 * @param {Object} toolDefinition - 工具定义
 * @param {String} userMessage - 用户消息
 * @returns {Object} - { isComplete: boolean, missingParams: Array, prompt: String }
 */
function validateParams(toolDefinition, userMessage) {
    const requiredParams = toolDefinition.function.parameters.required || [];
    const properties = toolDefinition.function.parameters.properties || {};

    const missingParams = [];
    const foundParams = {};

    // 检查每个必需参数
    requiredParams.forEach(paramName => {
        const paramDef = properties[paramName];

        // 检查用户消息中是否包含该参数的值
        const value = extractParamValue(userMessage, paramName, paramDef);

        if (value && value !== null && value !== undefined && value !== '') {
            foundParams[paramName] = value;
        } else {
            missingParams.push({
                name: paramName,
                description: paramDef.description || '',
                type: paramDef.type || 'string'
            });
        }
    });

    const isComplete = missingParams.length === 0;

    // 生成引导提示
    let prompt = null;
    if (!isComplete) {
        prompt = generateGuidancePrompt(toolDefinition.function.name, missingParams, foundParams);
    }

    return {
        isComplete,
        missingParams,
        foundParams,
        prompt
    };
}

/**
 * 从用户消息中提取参数值
 * @param {String} message - 用户消息
 * @param {String} paramName - 参数名称
 * @param {Object} paramDef - 参数定义
 * @returns {*} - 提取的值或 null
 */
function extractParamValue(message, paramName, paramDef) {
    if (!message) return null;

    // 简单的关键词匹配策略
    const paramNameLower = paramName.toLowerCase();

    // 对于 content 类型的参数（文章内容）
    if (paramNameLower === 'content' || paramDef.description?.includes('文章')) {
        // 检查消息中是否包含实际内容（不仅仅是占位符）
        const contentIndicators = [
            /[文章内容|文本|以下|如下][：:]\s*\n+/,
            /第[一二三四五六七八九十]+[章节部分]/,
            /\w{100,}/  // 至少 100 个字符
        ];

        for (const indicator of contentIndicators) {
            if (indicator.test(message)) {
                // 提取实际内容部分
                const match = message.match(/[：:]\s*\n+([\s\S]+)/);
                if (match && match[1].trim().length > 50) {
                    return match[1].trim();
                }
                // 如果没有明确分隔符，检查消息长度
                if (message.length > 100) {
                    return message;
                }
            }
        }

        // 检查是否有占位符（说明用户还没提供实际内容）
        const placeholders = [
            '[在这里粘贴',
            '[粘贴文章',
            '[内容]',
            '文章内容',
            'your content here'
        ];

        const hasPlaceholder = placeholders.some(ph => message.toLowerCase().includes(ph.toLowerCase()));
        if (hasPlaceholder) {
            return null;
        }
    }

    // 对于 maxLength 等数字参数
    if (paramDef.type === 'number' || paramDef.type === 'integer') {
        const numberMatch = message.match(/(\d+)\s*(字|字符|长度)/);
        if (numberMatch) {
            return parseInt(numberMatch[1], 10);
        }
        // 返回默认值
        return paramDef.default || null;
    }

    // 对于数组参数（如 infoTypes）
    if (paramDef.type === 'array') {
        const defaultArray = paramDef.default || [];
        // 检查用户是否指定了特定的信息类型
        const typeKeywords = {
            '人名': '人名',
            '姓名': '人名',
            '地名': '地名',
            '城市': '地名',
            '地点': '地名',
            '日期': '日期',
            '时间': '日期',
            '数字': '数字',
            '数据': '数字',
            '组织': '组织',
            '公司': '组织'
        };

        const foundTypes = new Set(defaultArray);
        for (const [keyword, type] of Object.entries(typeKeywords)) {
            if (message.includes(keyword)) {
                foundTypes.add(type);
            }
        }

        return Array.from(foundTypes);
    }

    // 默认返回 null
    return null;
}

/**
 * 生成引导提示
 * @param {String} toolName - 工具名称
 * @param {Array} missingParams - 缺失的参数
 * @param {Object} foundParams - 已找到的参数
 * @returns {String} - 引导提示
 */
function generateGuidancePrompt(toolName, missingParams, foundParams) {
    const toolDescriptions = {
        'summarizeArticle': '总结文章',
        'extractKeyInfo': '提取关键信息'
    };

    const action = toolDescriptions[toolName] || '执行此操作';

    let prompt = `好的，我可以帮你${action}。`;

    // 根据缺失的参数生成引导
    if (missingParams.length === 1) {
        const param = missingParams[0];
        if (param.name === 'content') {
            prompt += `\n\n请提供你想处理的文章内容，你可以：\n`;
            prompt += `1. 直接粘贴文章内容\n`;
            prompt += `2. 提供文章链接（如果是网上的文章）`;
        } else {
            prompt += `\n\n请提供：${param.description}`;
        }
    } else {
        prompt += `\n\n请提供以下信息：\n`;
        missingParams.forEach((param, index) => {
            prompt += `${index + 1}. ${param.description}\n`;
        });
    }

    // 如果有已找到的参数，确认一下
    if (Object.keys(foundParams).length > 0) {
        prompt += `\n\n我已识别到：`;
        Object.entries(foundParams).forEach(([key, value]) => {
            if (Array.isArray(value)) {
                prompt += `\n- ${key}: ${value.join(', ')}`;
            } else if (typeof value === 'number') {
                prompt += `\n- ${key}: ${value}`;
            } else if (typeof value === 'string' && value.length > 50) {
                prompt += `\n- ${key}: [${value.substring(0, 30)}...]`;
            } else {
                prompt += `\n- ${key}: ${value}`;
            }
        });
    }

    return prompt;
}

/**
 * 分析用户意图，判断是否需要调用工具
 * @param {String} message - 用户消息
 * @param {Array} tools - 可用工具列表
 * @returns {Object} - { needTool: boolean, toolName: string, confidence: number }
 */
function analyzeIntent(message, tools) {
    if (!message || !tools || tools.length === 0) {
        return { needTool: false, confidence: 0 };
    }

    const messageLower = message.toLowerCase();

    // 工具关键词映射
    const toolKeywords = {
        'summarizeArticle': {
            keywords: ['总结', '摘要', '概括', '要点', '主旨', '大意', '浓缩'],
            weight: 1.0
        },
        'extractKeyInfo': {
            keywords: ['提取', '关键信息', '人名', '地名', '日期', '数据', '信息提取'],
            weight: 1.0
        }
    };

    let bestMatch = { toolName: null, confidence: 0 };

    for (const tool of tools) {
        const toolName = tool.name || tool.function?.name;
        const keywords = toolKeywords[toolName];

        if (!keywords) continue;

        let matchScore = 0;
        for (const keyword of keywords.keywords) {
            if (messageLower.includes(keyword)) {
                matchScore += keywords.weight;
            }
        }

        // 归一化分数
        const normalizedScore = matchScore / keywords.keywords.length;

        if (normalizedScore > bestMatch.confidence) {
            bestMatch = { toolName, confidence: normalizedScore };
        }
    }

    // 阈值：confidence > 0.3 才认为需要工具
    return {
        needTool: bestMatch.confidence > 0.3,
        toolName: bestMatch.toolName,
        confidence: bestMatch.confidence
    };
}

module.exports = {
    validateParams,
    extractParamValue,
    generateGuidancePrompt,
    analyzeIntent
};
