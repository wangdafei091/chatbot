/**
 * 配置验证器
 * 在应用启动时验证配置的完整性和正确性
 */

/**
 * 验证端口配置
 */
function validatePort(port, name = 'PORT') {
    const portNum = parseInt(port);
    if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
        throw new Error(`${name} 必须在 1-65535 之间，当前值: ${port}`);
    }
    return portNum;
}

/**
 * 验证数组配置
 */
function validateArray(value, name) {
    if (!Array.isArray(value)) {
        throw new Error(`${name} 必须是数组类型`);
    }
    if (value.length === 0) {
        throw new Error(`${name} 不能为空数组`);
    }
    return value;
}

/**
 * 验证 URL 格式
 */
function validateUrl(url, name) {
    if (typeof url !== 'string') {
        throw new Error(`${name} 必须是字符串类型`);
    }
    // 允许空字符串（表示使用相对路径）
    if (url === '') return true;

    try {
        new URL(url);
        return true;
    } catch (error) {
        throw new Error(`${name} URL 格式无效: ${url}`);
    }
}

/**
 * 验证数值范围
 */
function validateNumberRange(value, name, min, max) {
    const num = parseFloat(value);
    if (isNaN(num)) {
        throw new Error(`${name} 必须是数字`);
    }
    if (num < min || num > max) {
        throw new Error(`${name} 必须在 ${min}-${max} 之间，当前值: ${num}`);
    }
    return num;
}

/**
 * 验证枚举值
 */
function validateEnum(value, name, allowedValues) {
    if (!allowedValues.includes(value)) {
        throw new Error(`${name} 必须是以下值之一: ${allowedValues.join(', ')}, 当前值: ${value}`);
    }
    return value;
}

/**
 * 主配置验证函数
 */
function validateConfig(config) {
    const errors = [];
    const warnings = [];

    try {
        // 1. 验证服务器配置
        console.log('🔍 验证服务器配置...');
        const port = validatePort(config.server.port, 'PORT');
        const env = validateEnum(config.server.env, 'NODE_ENV', ['development', 'production', 'test']);

        // 2. 验证 CORS 配置
        console.log('🔍 验证 CORS 配置...');
        const origins = validateArray(config.cors.origin, 'CORS origin');
        origins.forEach((origin, index) => {
            if (origin !== '*') {
                validateUrl(origin, `CORS origin[${index}]`);
            }
        });

        // 3. 验证安全配置
        console.log('🔍 验证安全配置...');
        if (typeof config.bodyLimit !== 'string') {
            errors.push('bodyLimit 必须是字符串类型（如 "1mb"）');
        }
        validateNumberRange(config.rateLimit.max, 'RATE_LIMIT_MAX', 1, 10000);

        // 4. 验证 AI 配置
        console.log('🔍 验证 AI 配置...');
        const hasGlmKey = !!process.env.GLM_API_KEY;
        const hasDeepSeekKey = !!process.env.DEEPSEEK_API_KEY;

        if (!hasGlmKey && !hasDeepSeekKey) {
            errors.push('至少需要配置一个 AI API Key（GLM_API_KEY 或 DEEPSEEK_API_KEY）');
        }

        // 验证 AI 模型参数
        if (hasGlmKey) {
            console.log('  ✅ GLM-4 已配置');
            validateNumberRange(config.ai.glm.temperature, 'GLM_TEMPERATURE', 0, 2);
            validateNumberRange(config.ai.glm.max_tokens, 'GLM_MAX_TOKENS', 1, 32000);
        } else {
            warnings.push('GLM_API_KEY 未配置');
        }

        if (hasDeepSeekKey) {
            console.log('  ✅ DeepSeek 已配置');
            validateNumberRange(config.ai.deepseek.temperature, 'DEEPSEEK_TEMPERATURE', 0, 2);
            validateNumberRange(config.ai.deepseek.max_tokens, 'DEEPSEEK_MAX_TOKENS', 1, 32000);
        } else {
            warnings.push('DEEPSEEK_API_KEY 未配置');
        }

        // 5. 验证验证配置
        console.log('🔍 验证验证配置...');
        validateNumberRange(config.validation.maxMessageLength, 'MAX_MESSAGE_LENGTH', 1, 100000);

        // 6. 验证 API 配置
        console.log('🔍 验证 API 配置...');
        validateEnum(config.api.defaultProvider, 'DEFAULT_MODEL', config.api.providers);

        // 检查是否有错误
        if (errors.length > 0) {
            throw new Error(`\n❌ 配置错误:\n${errors.map(e => `  - ${e}`).join('\n')}`);
        }

        // 显示警告
        if (warnings.length > 0) {
            console.log('\n⚠️  配置警告:');
            warnings.forEach(w => console.log(`  - ${w}`));
        }

        // 验证成功
        console.log('\n✅ 配置验证通过！');
        console.log(`📊 配置摘要:`);
        console.log(`  环境: ${env}`);
        console.log(`  端口: ${port}`);
        console.log(`  默认模型: ${config.api.defaultProvider}`);
        console.log(`  速率限制: ${config.rateLimit.max} 次/${config.rateLimit.windowMs/1000/60} 分钟`);
        console.log(`  已配置模型: ${hasGlmKey ? 'GLM-4 ' : ''}${hasDeepSeekKey ? 'DeepSeek' : ''}`);

        return {
            port,
            env,
            isValid: true
        };

    } catch (error) {
        console.error('\n❌ 配置验证失败!');
        console.error(error.message);
        throw error;
    }
}

module.exports = {
    validateConfig,
    validatePort,
    validateArray,
    validateUrl,
    validateNumberRange,
    validateEnum
};
