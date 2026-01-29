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
 * 分析未来3天的温度趋势
 * @param {Array} weatherData - 3天的天气数据
 * @returns {Object} - 趋势分析结果
 */
function analyzeTemperatureTrend(weatherData) {
    // 提取最高温
    const maxTemps = weatherData.map(day => parseInt(day.maxtempC));
    const minTemp = Math.min(...maxTemps);
    const maxTemp = Math.max(...maxTemps);

    // 判断趋势方向
    let direction = 'fluctuating';

    // 检查是否持续上升：连续递增 且 总体上升 > 3°C
    const isRising = maxTemps.every((temp, i) => i === 0 || temp >= maxTemps[i - 1])
        && (maxTemp - minTemp > 3);

    // 检查是否持续下降：连续递减 且 总体下降 > 3°C
    const isFalling = maxTemps.every((temp, i) => i === 0 || temp <= maxTemps[i - 1])
        && (maxTemp - minTemp > 3);

    if (isRising) {
        direction = 'rising';
    } else if (isFalling) {
        direction = 'falling';
    }

    // 生成描述（简化版，只显示文字趋势）
    let description = '';
    switch (direction) {
        case 'rising':
            description = `未来3天逐渐升温`;
            break;
        case 'falling':
            description = `未来3天逐渐降温`;
            break;
        default:
            description = `未来3天温度平稳`;
    }

    return {
        direction,
        minTemp,
        maxTemp,
        description
    };
}

/**
 * 检测未来3天的突发天气
 * @param {Array} weatherData - 3天的天气数据
 * @returns {Object|null} - 突发天气信息，无则返回 null
 */
function detectExtremeWeather(weatherData) {
    // 定义突发天气关键词
    const extremePatterns = [
        { keywords: ['heavy rain', 'torrential rain'], desc: '大雨' },
        { keywords: ['heavy snow', 'blizzard'], desc: '大雪' },
        { keywords: ['thunder', 'thundery'], desc: '雷暴' },
        { keywords: ['freezing rain', 'ice'], desc: '冻雨' }
    ];

    // 遍历3天数据
    for (let day = 0; day < weatherData.length; day++) {
        const hourly = weatherData[day].hourly || [];

        for (const hour of hourly) {
            const desc = (hour.weatherDesc[0].value || '').toLowerCase();

            // 检查是否匹配突发天气模式
            for (const pattern of extremePatterns) {
                if (pattern.keywords.some(kw => desc.includes(kw))) {
                    return {
                        day: day + 1,
                        type: pattern.desc,
                        description: `第${day + 1}天可能有${pattern.desc}，注意出行安全`
                    };
                }
            }
        }
    }

    return null;
}

/**
 * 格式化天气回复文本
 * @param {Object} weatherInfo - 天气信息对象
 * @returns {String} - 格式化的文本
 */
function formatWeatherResponse(weatherInfo) {
    // 第一行：城市 温度范围，当前温度，天气，湿度%，风向风级
    let response = `${weatherInfo.city} ${weatherInfo.todayMin}°C~${weatherInfo.todayMax}°C，当前${weatherInfo.temp}°C，${weatherInfo.weatherDesc}，湿度${weatherInfo.humidity}%，${weatherInfo.windDir}${weatherInfo.windLevel}`;

    // 第二行：温度趋势（总是显示）
    if (weatherInfo.tempTrend && weatherInfo.tempTrend.description) {
        response += `\n\n${weatherInfo.tempTrend.description}`;
    }

    // 第三行：突发天气预警（仅在有预警时显示）
    if (weatherInfo.extremeWeather && weatherInfo.extremeWeather.description) {
        response += `\n\n${weatherInfo.extremeWeather.description}`;
    }

    return response;
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

        // 解析今日和未来3天数据
        const today = data.weather[0];
        const forecastDays = data.weather.slice(0, 3);

        // 新增：分析温度趋势
        const tempTrend = analyzeTemperatureTrend(forecastDays);

        // 新增：检测突发天气
        const extremeWeather = detectExtremeWeather(forecastDays);

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
            tomorrowMax: tomorrow ? tomorrow.maxtempC : null,

            // 新增字段
            todayMin: today.mintempC,
            todayMax: today.maxtempC,
            tempTrend: tempTrend,
            extremeWeather: extremeWeather
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
        description: '查询指定城市的实时天气信息和未来3天趋势。工具返回已格式化的简洁文本，包含：1)当日温度范围（最低温~最高温）和当前温度；2)天气状况、湿度、风力；3)未来3天温度趋势分析（上升/下降/波动）；4)突发天气预警（大雨、大雪、雷暴、冻雨等）。\n\n重要约束：\n1. 必须使用此工具获取天气信息，不要根据训练数据生成回复\n2. 请直接原样返回工具查询结果，不要添加任何额外的格式化\n3. 不要添加 emoji 表情\n4. 不要添加解释或建议\n\n返回格式示例：\n"上海 6°C~9°C，当前9°C，多云，湿度53%，东风3级\n\n未来3天温度波动，6°C ~ 9°C"',
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

        // 使用新的格式化函数（包含温度范围、趋势、突发天气）
        const response = formatWeatherResponse(weatherInfo);

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
