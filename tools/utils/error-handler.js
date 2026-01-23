/**
 * 错误处理工具
 * 提供统一的错误类和错误处理函数
 */

/**
 * 自定义应用错误类
 */
class AppError extends Error {
    constructor(message, code = 'UNKNOWN_ERROR', statusCode = 500) {
        super(message);
        this.name = 'AppError';
        this.code = code;
        this.statusCode = statusCode;
        this.timestamp = new Date().toISOString();

        // 保持堆栈跟踪（仅在开发环境）
        if (process.env.NODE_ENV !== 'production') {
            Error.captureStackTrace(this, this.constructor);
        }
    }

    /**
     * 转换为可发送给客户端的格式
     */
    toJSON() {
        return {
            error: {
                message: this.message,
                code: this.code,
                timestamp: this.timestamp
            }
        };
    }
}

/**
 * 错误代码枚举
 */
const ErrorCodes = {
    // 工具相关错误
    TOOL_NOT_FOUND: 'TOOL_NOT_FOUND',
    TOOL_EXECUTION_FAILED: 'TOOL_EXECUTION_FAILED',
    INVALID_TOOL_PARAMS: 'INVALID_TOOL_PARAMS',

    // AI 相关错误
    AI_API_ERROR: 'AI_API_ERROR',
    AI_RESPONSE_ERROR: 'AI_RESPONSE_ERROR',
    NO_TOOL_CALL_DETECTED: 'NO_TOOL_CALL_DETECTED',

    // 请求相关错误
    INVALID_REQUEST: 'INVALID_REQUEST',
    MISSING_REQUIRED_PARAM: 'MISSING_REQUIRED_PARAM',
    VALIDATION_ERROR: 'VALIDATION_ERROR',

    // 网络相关错误
    NETWORK_ERROR: 'NETWORK_ERROR',
    TIMEOUT_ERROR: 'TIMEOUT_ERROR',

    // 通用错误
    UNKNOWN_ERROR: 'UNKNOWN_ERROR',
    INTERNAL_ERROR: 'INTERNAL_ERROR'
};

/**
 * 工具执行错误
 */
class ToolExecutionError extends AppError {
    constructor(toolName, message, originalError = null) {
        const fullMessage = `工具 "${toolName}" 执行失败: ${message}`;
        super(fullMessage, ErrorCodes.TOOL_EXECUTION_FAILED, 500);

        this.toolName = toolName;
        this.originalError = originalError;
    }
}

/**
 * 工具未找到错误
 */
class ToolNotFoundError extends AppError {
    constructor(toolName) {
        super(`工具 "${toolName}" 未注册`, ErrorCodes.TOOL_NOT_FOUND, 404);
        this.toolName = toolName;
    }
}

/**
 * 错误处理函数（用于 async/await）
 * @param {Function} fn - 异步函数
 * @returns {Function} - 包装后的错误处理函数
 */
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

/**
 * 格式化错误消息供 AI 使用
 * @param {Error} error - 错误对象
 * @returns {String} - 格式化后的错误消息
 */
const formatErrorForAI = (error) => {
    if (error instanceof AppError) {
        return `[错误: ${error.code}] ${error.message}`;
    }

    // 对于未知错误，只返回基本信息（避免泄露敏感信息）
    return `[错误] 操作失败，请稍后重试`;
};

/**
 * 记录错误（在生产环境中可以发送到日志服务）
 * @param {Error} error - 错误对象
 * @param {Object} context - 错误上下文
 */
const logError = (error, context = {}) => {
    const logData = {
        timestamp: new Date().toISOString(),
        level: 'ERROR',
        code: error.code || 'UNKNOWN',
        message: error.message,
        context: context
    };

    // 如果是工具执行错误，记录工具名称
    if (error instanceof ToolExecutionError) {
        logData.toolName = error.toolName;
    }

    // 如果有原始错误，记录堆栈信息（仅在开发环境）
    if (error.originalError && process.env.NODE_ENV !== 'production') {
        logData.originalError = {
            message: error.originalError.message,
            stack: error.originalError.stack
        };
    }

    console.error('[Error]', JSON.stringify(logData, null, 2));
};

/**
 * 安全地解析 JSON（带错误处理）
 * @param {String} jsonString - JSON 字符串
 * @param {*} defaultValue - 解析失败时的默认值
 * @returns {*} - 解析结果或默认值
 */
const safeJSONParse = (jsonString, defaultValue = null) => {
    try {
        return JSON.parse(jsonString);
    } catch (error) {
        logError(error, { action: 'JSON_PARSE', input: jsonString });
        return defaultValue;
    }
};

module.exports = {
    AppError,
    ToolExecutionError,
    ToolNotFoundError,
    ErrorCodes,
    asyncHandler,
    formatErrorForAI,
    logError,
    safeJSONParse
};
