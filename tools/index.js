/**
 * 工具注册表和执行器
 * 实现 Function Calling 框架的核心逻辑
 */

const { ToolExecutionError, ToolNotFoundError, logError, formatErrorForAI } = require('./utils/error-handler');

/**
 * 工具注册表类
 */
class ToolRegistry {
    constructor() {
        this.tools = new Map();
    }

    /**
     * 注册工具
     * @param {String} name - 工具名称
     * @param {Object} definition - 工具定义（用于发送给 AI）
     * @param {Function} handler - 工具执行函数
     */
    registerTool(name, definition, handler) {
        if (!name || typeof name !== 'string') {
            throw new Error('工具名称必须是非空字符串');
        }

        if (!definition || typeof definition !== 'object') {
            throw new Error('工具定义必须是对象');
        }

        if (!handler || typeof handler !== 'function') {
            throw new Error('工具处理器必须是函数');
        }

        this.tools.set(name, {
            name,
            definition,
            handler
        });

        console.log(`✓ 工具已注册: ${name}`);
    }

    /**
     * 批量注册工具
     * @param {Array} tools - 工具数组 [{name, definition, handler}, ...]
     */
    registerTools(tools) {
        if (!Array.isArray(tools)) {
            throw new Error('tools 必须是数组');
        }

        tools.forEach(tool => {
            this.registerTool(tool.name, tool.definition, tool.handler);
        });
    }

    /**
     * 获取工具
     * @param {String} name - 工具名称
     * @returns {Object|null} - 工具对象
     */
    getTool(name) {
        return this.tools.get(name) || null;
    }

    /**
     * 检查工具是否存在
     * @param {String} name - 工具名称
     * @returns {Boolean} - 是否存在
     */
    hasTool(name) {
        return this.tools.has(name);
    }

    /**
     * 获取所有工具定义（用于发送给 AI）
     * @returns {Array} - 工具定义数组
     */
    getAllToolDefinitions() {
        return Array.from(this.tools.values()).map(tool => tool.definition);
    }

    /**
     * 获取所有工具名称
     * @returns {Array<String>} - 工具名称数组
     */
    getToolNames() {
        return Array.from(this.tools.keys());
    }

    /**
     * 注销工具
     * @param {String} name - 工具名称
     * @returns {Boolean} - 是否成功注销
     */
    unregisterTool(name) {
        return this.tools.delete(name);
    }

    /**
     * 清空所有工具
     */
    clear() {
        this.tools.clear();
        console.log('✓ 所有工具已注销');
    }

    /**
     * 获取工具数量
     * @returns {Number} - 工具数量
     */
    size() {
        return this.tools.size;
    }
}

/**
 * 工具执行器类
 */
class ToolExecutor {
    constructor(toolRegistry) {
        this.registry = toolRegistry;
    }

    /**
     * 执行单个工具
     * @param {String} toolName - 工具名称
     * @param {Object} parameters - 工具参数
     * @returns {Promise<Object>} - 执行结果
     */
    async executeTool(toolName, parameters = {}) {
        // 检查工具是否存在
        if (!this.registry.hasTool(toolName)) {
            const error = new ToolNotFoundError(toolName);
            logError(error);
            throw error;
        }

        const tool = this.registry.getTool(toolName);

        console.log(`[ToolExecutor] 执行工具: ${toolName}`);
        console.log(`[ToolExecutor] 参数:`, JSON.stringify(parameters, null, 2));

        try {
            // 执行工具处理器
            const result = await tool.handler(parameters);

            console.log(`[ToolExecutor] 工具 ${toolName} 执行成功`);
            console.log(`[ToolExecutor] 结果:`, JSON.stringify(result, null, 2));

            return {
                tool: toolName,
                success: true,
                result: result
            };
        } catch (error) {
            console.error(`[ToolExecutor] 工具 ${toolName} 执行失败:`, error.message);

            const executionError = new ToolExecutionError(toolName, error.message, error);
            logError(executionError);

            throw executionError;
        }
    }

    /**
     * 批量执行工具（按顺序）
     * @param {Array<Object>} toolCalls - 工具调用数组 [{name, parameters}, ...]
     * @returns {Promise<Array<Object>>} - 执行结果数组
     */
    async executeTools(toolCalls) {
        if (!Array.isArray(toolCalls) || toolCalls.length === 0) {
            return [];
        }

        console.log(`[ToolExecutor] 批量执行 ${toolCalls.length} 个工具`);

        const results = [];

        for (let i = 0; i < toolCalls.length; i++) {
            const { name, parameters } = toolCalls[i];

            try {
                const result = await this.executeTool(name, parameters);
                results.push(result);
            } catch (error) {
                // 即使某个工具失败，也继续执行其他工具
                results.push({
                    tool: name,
                    success: false,
                    error: error.message,
                    code: error.code
                });
            }
        }

        return results;
    }

    /**
     * 解析 AI 的工具调用请求
     * @param {Object} aiResponse - AI 响应
     * @returns {Array|null} - 工具调用数组，如果没有工具调用则返回 null
     */
    parseToolCalls(aiResponse) {
        // 检查 AI 响应中是否有工具调用请求
        // 这里需要根据实际的 AI API 响应格式进行调整

        if (!aiResponse) {
            return null;
        }

        // GLM-4 / DeepSeek 的工具调用格式
        if (aiResponse.tool_calls && Array.isArray(aiResponse.tool_calls)) {
            return aiResponse.tool_calls.map(call => ({
                name: call.function.name,
                parameters: JSON.parse(call.function.arguments)
            }));
        }

        // 如果没有工具调用，返回 null
        return null;
    }
}

// 创建全局实例
const toolRegistry = new ToolRegistry();
const toolExecutor = new ToolExecutor(toolRegistry);

// ===== 注册工具 =====

// 导入文本处理工具
const textTools = require('./text-tools');

// 注册所有文本处理工具
toolRegistry.registerTools(textTools);

console.log(`✓ 工具系统初始化完成，已注册 ${toolRegistry.size()} 个工具`);
console.log('✓ 已注册工具:', toolRegistry.getToolNames().join(', '));

module.exports = {
    ToolRegistry,
    ToolExecutor,
    toolRegistry,
    toolExecutor
};
