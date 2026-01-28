/**
 * 天气查询工具
 * 使用 wttr.in API 提供实时天气查询（完全免费，无需 key）
 * 优化版本：通过 AI 原生方案，返回简洁格式的天气文本
 */

const axios = require('axios');

/**
 * 将风速转换为风力等级
 * @param {Number} kmh - 风速
 * @returns {String} - 风力等级
 */
function convertWindLevel(kmh) {
    const speed = parseFloat(kmh);
    if (speed < 1) return '0级';
    if (speed < 6) return '1级';
    if (speed < 12) return '2级';
    if (speed < 20) return '3级';
    if (speed < 29) return '4级';
    if (speed < 39) return '5级';
    if (speed < 50) return '6级';
    if (speed < 62) return '7级';
    if (speed < 75) return '8级';
    if (speed < 89) return '9级';
    if (speed < 103) return '10级';
    if (speed < 117) return '11级';
    return '12级';
}

/**
 * 将风向英文缩写转换为中文
 * @param {String} dir - 英文风向缩写
 * @returns {String} - 中文风向
 */
function translateWindDir(dir) {
    const windDirMap = {
        'N': '北风',
        'NNE': '东北偏北风',
        'NE': '东北风',
        'ENE': '东北偏东风',
        'E': '东风',
        'ESE': '东南偏东风',
        'SE': '东南风',
        'SSE': '东南偏南风',
        'S': '南风',
        'SSW': '西南偏南风',
        'SW': '西南风',
        'WSW': '西南偏西风',
        'W': '西风',
        'WNW': '西北偏西风',
        'NW': '西北风',
        'NNW': '西北偏北风',
        'Variable': '风向不定',
        'VRB': '风向不定'
    };

    return windDirMap[dir] || dir;
}

/**
 * 将英文天气描述转换为中文
 * @param {String} desc - 英文描述
 * @returns {String} - 中文描述
 */
function translateWeatherDesc(desc) {
    const lowerDesc = desc.toLowerCase().trim();

    // 精确匹配
    if (lowerDesc === 'sunny' || lowerDesc === 'clear') return '晴';
    if (lowerDesc === 'partly cloudy') return '多云';
    if (lowerDesc === 'cloudy' || lowerDesc === 'overcast') return '阴';
    if (lowerDesc === 'light rain') return '小雨';
    if (lowerDesc === 'moderate rain') return '中雨';
    if (lowerDesc === 'heavy rain') return '大雨';
    if (lowerDesc === 'shower') return '阵雨';
    if (lowerDesc === 'rain') return '雨';
    if (lowerDesc === 'drizzle') return '毛毛雨';
    if (lowerDesc === 'freezing drizzle') return '冻雨';
    if (lowerDesc.includes('patchy freezing drizzle')) return '局部冻雨';
    if (lowerDesc === 'light snow') return '小雪';
    if (lowerDesc === 'moderate snow') return '中雪';
    if (lowerDesc === 'heavy snow') return '大雪';
    if (lowerDesc === 'snow') return '雪';
    if (lowerDesc === 'blizzard') return '暴风雪';
    if (lowerDesc === 'sleet') return '雨夹雪';
    if (lowerDesc === 'mist') return '薄雾';
    if (lowerDesc === 'fog') return '雾';
    if (lowerDesc === 'haze') return '霾';
    if (lowerDesc === 'smoke') return '烟雾';
    if (lowerDesc.includes('thund') || lowerDesc.includes('thunder')) return '雷';

    // 模糊匹配
    if (lowerDesc.includes('cloudy')) return '多云';
    if (lowerDesc.includes('rain')) return '雨';
    if (lowerDesc.includes('snow')) return '雪';
    if (lowerDesc.includes('fog') || lowerDesc.includes('mist')) return '雾';

    // 如果没有匹配，返回原文
    return desc;
}

/**
 * 生成天气预警信息
 * @param {Object} current - 当前天气数据
 * @param {Object} forecast - 明日预报数据
 * @returns {String|null} - 预警信息，无预警时返回 null
 */
function generateWeatherAlert(current, forecast) {
    const alerts = [];

    const temp = parseInt(current.temp_C);
    const windSpeed = parseFloat(current.windspeedKmph);
    const visibility = parseFloat(current.visibility);
    const weatherDesc = current.weatherDesc[0].value.toLowerCase();

    // 高温预警
    if (temp > 35) {
        alerts.push('高温预警，避免长时间户外活动');
    }

    // 雾霾预警
    if (visibility < 5 || weatherDesc.includes('霾') || weatherDesc.includes('雾') || weatherDesc.includes('fog') || weatherDesc.includes('mist')) {
        alerts.push('能见度低，外出注意防护');
    }

    // 大风预警
    if (windSpeed > 30) {
        alerts.push('大风预警，避免高空作业');
    }

    // 降雨预警（检查当前和未来天气）
    const rainKeywords = ['rain', 'drizzle', 'shower', 'thund', 'snow'];
    const currentHasRain = rainKeywords.some(keyword => weatherDesc.includes(keyword));

    // 检查今日每小时预报（前3小时）
    const todayHourly = forecast && forecast.hourly ? forecast.hourly.slice(0, 3) : [];
    const willRainSoon = todayHourly.some(hour => {
        const desc = hour.weatherDesc[0].value.toLowerCase();
        return rainKeywords.some(keyword => desc.includes(keyword));
    });

    if (willRainSoon && !currentHasRain) {
        alerts.push('未来3小时有降雨，建议带伞');
    } else if (currentHasRain) {
        alerts.push('当前有降雨，减少外出');
    }

    // 降温预警（比较今日和明日最高温）
    if (forecast && forecast.maxtempC) {
        const todayMax = temp;
        const tomorrowMax = parseInt(forecast.maxtempC);
        if (todayMax - tomorrowMax >= 8) {
            alerts.push(`明日降温至${tomorrowMax}°C，注意保暖`);
        }
    }

    return alerts.length > 0 ? alerts.join('；') : null;
}

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

        // 解析明日预报（用于降温预警）
        const tomorrow = data.weather && data.weather[1] ? data.weather[1] : null;

        // 翻译天气描述为中文
        const weatherDescCN = translateWeatherDesc(current.weatherDesc[0].value);

        // 翻译风向为中文
        const windDirCN = translateWindDir(current.winddir16Point);

        // 生成预警（使用英文描述进行匹配）
        const alert = generateWeatherAlert(current, tomorrow);

        // 风力等级
        const windLevel = convertWindLevel(current.windspeedKmph);

        return {
            city: city,
            temp: current.temp_C,
            humidity: current.humidity,
            windDir: windDirCN,
            windSpeed: current.windspeedKmph,
            windLevel: windLevel,
            weatherDesc: weatherDescCN,
            alert: alert,
            tomorrowMax: tomorrow ? tomorrow.maxtempC : null
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
        description: '查询指定城市的实时天气信息。工具返回已格式化的简洁文本（包含温度、天气状况、湿度、风力等级）和突发天气预警（降雨、降温、高温、雾霾、大风）。\n\n重要约束：\n1. 请直接原样返回工具查询结果\n2. 不要添加任何额外的格式化\n3. 不要添加 emoji 表情\n4. 不要添加解释或建议\n\n返回格式示例：\n"北京 1°C，晴，湿度47%，东风1级\n\n未来3小时有降雨，建议带伞"',
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
 * @returns {Promise<String>} - 天气信息（纯文本）
 */
async function getWeatherHandler(params) {
    const { city } = params;

    // 验证参数
    if (!city || city.trim().length === 0) {
        throw new Error('城市名称不能为空');
    }

    try {
        const weatherInfo = await getWeatherFromWttr(city.trim());

        // 生成简洁格式文本
        // 第一行：城市 温度，天气，湿度%，风向风级
        let response = `${weatherInfo.city} ${weatherInfo.temp}°C，${weatherInfo.weatherDesc}，湿度${weatherInfo.humidity}%，${weatherInfo.windDir}${weatherInfo.windLevel}`;

        // 如果有预警，添加到新的一行
        if (weatherInfo.alert) {
            response += `\n\n${weatherInfo.alert}`;
        }

        // 直接返回文本字符串（让 AI 传递给用户）
        return response;
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
