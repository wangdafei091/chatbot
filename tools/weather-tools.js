/**
 * 天气查询工具
 * 使用 wttr.in API 提供实时天气查询（完全免费，无需 key）
 */

const axios = require('axios');

/**
 * wttr.in API 调用
 * @param {String} city - 城市名称（支持中文或拼音）
 * @returns {Promise<Object>} - 天气信息
 */
async function getWeatherFromWttr(city) {
    try {
        // wttr.in API（完全免费，无需 key）
        // 格式：?format=j1 返回 JSON 格式
        const apiUrl = `https://wttr.in/${encodeURIComponent(city)}?format=j1&lang=zh`;

        const response = await axios.get(apiUrl, {
            headers: {
                'User-Agent': 'curl/7.68.0',  // wttr.in 要求
                'Accept': 'application/json'
            },
            timeout: 15000
        });

        const data = response.data;

        // 解析当前天气
        const current = data.current_condition[0];

        return {
            city: city,
            temp: current.temp_C,
            feelsLike: current.FeelsLikeC,
            humidity: current.humidity,
            windDir: current.winddir16Point,
            windSpeed: current.windspeedKmph,
            weatherDesc: current.weatherDesc[0].value,
            visibility: current.visibility,
            uvIndex: current.uvIndex,
            time: current.obs_time
        };
    } catch (error) {
        throw new Error(`天气查询失败: ${error.message}`);
    }
}

// ===== 工具 1：实时天气查询 =====

/**
 * 查询实时天气工具定义
 */
const getWeatherDefinition = {
    type: 'function',
    function: {
        name: 'getWeather',
        description: '查询指定城市的实时天气信息，包括温度、体感温度、湿度、风速、天气状况、紫外线指数等',
        parameters: {
            type: 'object',
            properties: {
                city: {
                    type: 'string',
                    description: '城市名称（支持中文或拼音），如：北京、Shanghai、广州、Guangzhou 等'
                }
            },
            required: ['city']
        }
    }
};

/**
 * 查询实时天气处理器
 * @param {Object} params - 参数
 * @param {String} params.city - 城市名称
 * @returns {Promise<Object>} - 天气信息
 */
async function getWeatherHandler(params) {
    const { city } = params;

    // 验证参数
    if (!city || city.trim().length === 0) {
        throw new Error('城市名称不能为空');
    }

    try {
        const weatherInfo = await getWeatherFromWttr(city.trim());

        return {
            success: true,
            city: weatherInfo.city,
            temperature: `${weatherInfo.temp}°C`,
            feelsLike: `${weatherInfo.feelsLike}°C`,
            weather: weatherInfo.weatherDesc,
            humidity: `${weatherInfo.humidity}%`,
            windDirection: weatherInfo.windDir,
            windSpeed: `${weatherInfo.windSpeed} km/h`,
            visibility: `${weatherInfo.visibility} km`,
            uvIndex: weatherInfo.uvIndex,
            updateTime: weatherInfo.time,
            summary: `${weatherInfo.city}当前天气：${weatherInfo.weatherDesc}，气温 ${weatherInfo.temp}°C（体感 ${weatherInfo.feelsLike}°C），湿度 ${weatherInfo.humidity}%，${weatherInfo.windDir}风 ${weatherInfo.windSpeed} km/h`
        };
    } catch (error) {
        throw new Error(`查询天气失败: ${error.message}`);
    }
}

// ===== 导出工具 =====

module.exports = [
    {
        name: 'getWeather',
        definition: getWeatherDefinition,
        handler: getWeatherHandler
    }
];
