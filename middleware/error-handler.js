/**
 * 统一错误处理中间件
 *
 * 功能：
 * - 规范化所有错误为 AppError 格式
 * - 统一错误响应格式
 * - 自动记录错误日志
 * - 区分开发/生产环境
 */

const { AppError, ErrorCodes, logError } = require('../tools/utils/error-handler');

/**
 * 转换普通错误为 AppError
 * @param {Error} error - 原始错误对象
 * @returns {AppError} - 规范化后的错误
 */
const normalizeError = (error) => {
    // 如果已经是 AppError，直接返回
    if (error instanceof AppError) {
        return error;
    }

    // 处理 Axios 错误（外部 API 调用失败）
    if (error.response) {
        const statusCode = error.response.status || 500;
        const errorMessage = error.response.data?.error?.message || '外部服务调用失败';

        return new AppError(
            errorMessage,
            ErrorCodes.AI_API_ERROR,
            statusCode
        );
    }

    // 处理网络错误（无响应）
    if (error.request) {
        return new AppError(
            '网络连接失败，请检查网络设置',
            ErrorCodes.NETWORK_ERROR,
            503
        );
    }

    // 处理验证错误
    if (error.name === 'ValidationError') {
        return new AppError(
            error.message,
            ErrorCodes.VALIDATION_ERROR,
            400
        );
    }

    // 处理超时错误
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        return new AppError(
            '请求超时，请稍后重试',
            ErrorCodes.TIMEOUT_ERROR,
            504
        );
    }

    // 未知错误转换为通用错误
    return new AppError(
        process.env.NODE_ENV === 'production'
            ? '服务器内部错误'
            : error.message,
        ErrorCodes.INTERNAL_ERROR,
        500
    );
};

/**
 * Express 错误处理中间件
 * @param {Error} err - 错误对象
 * @param {Request} req - Express 请求对象
 * @param {Response} res - Express 响应对象
 * @param {Function} next - Next 函数
 */
const errorHandler = (err, req, res, next) => {
    // 规范化错误
    const normalizedError = normalizeError(err);

    // 记录错误（包含请求上下文）
    logError(normalizedError, {
        path: req.path,
        method: req.method,
        body: req.body,
        query: req.query,
        ip: req.ip
    });

    // 构造响应
    const response = {
        error: {
            message: normalizedError.message,
            code: normalizedError.code
        }
    };

    // 开发环境添加调试信息
    if (process.env.NODE_ENV !== 'production') {
        response.error.stack = err.stack;
        response.error.original = err.message;
    }

    // 发送响应
    res.status(normalizedError.statusCode).json(response);
};

/**
 * 404 处理器
 * @param {Request} req - Express 请求对象
 * @param {Response} res - Express 响应对象
 */
const notFoundHandler = (req, res) => {
    res.status(404).json({
        error: {
            message: '接口不存在',
            code: 'NOT_FOUND',
            path: req.path
        }
    });
};

module.exports = {
    errorHandler,
    notFoundHandler,
    normalizeError
};
