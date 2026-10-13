import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Endpoint to download the full project zip archive
app.get(['/api/download-zip', '/download-zip'], (req, res) => {
  const zipPath = path.join(process.cwd(), 'public', 'agri-crop-advisor-project.zip');
  if (fs.existsSync(zipPath)) {
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="agri-crop-advisor-project.zip"');
    res.sendFile(zipPath);
  } else {
    res.status(404).json({ error: 'Zip archive not found' });
  }
});

// Initialize Gemini SDK with telemetry header
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return geminiClient;
}

// Candidate models to attempt in order of preference if upstream 503/demand spikes occur
const TEXT_MODELS = ['gemini-3.1-flash-lite', 'gemini-flash-latest', 'gemini-3.8-flash'];

interface GeminiResult {
  text: string;
  modelUsed: string;
}

// Timeout helper to guarantee asynchronous operations never block or hang connections
function withTimeout<T>(promise: Promise<T>, ms: number, timeoutMsg = 'Operation timed out'): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(timeoutMsg)), ms);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => {
    clearTimeout(timer);
  });
}

async function executeGeminiWithRetry(
  ai: GoogleGenAI,
  prompt: string,
  systemInstruction: string,
  responseMimeType?: 'application/json' | 'text/plain',
  temperature: number = 0.2
): Promise<GeminiResult | null> {
  const startTime = Date.now();
  const MAX_TOTAL_TIME_MS = 14000; // 14 seconds max total to prevent reverse proxy timeouts

  for (let i = 0; i < TEXT_MODELS.length; i++) {
    // If running low on time budget, skip straight to local fallback
    if (Date.now() - startTime > MAX_TOTAL_TIME_MS - 3000) {
      console.info('[Gemini Info] Time budget reached; activating agronomic expert engine.');
      break;
    }

    const model = TEXT_MODELS[i];
    try {
      const response = await withTimeout(
        ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            systemInstruction,
            ...(responseMimeType ? { responseMimeType } : {}),
            temperature,
          },
        }),
        8000,
        `Model ${model} request exceeded 8s timeout`
      );

      const responseText = response.text ? response.text.trim() : '';
      if (responseText) {
        return { text: responseText, modelUsed: model };
      }
    } catch (err: any) {
      const errMsg = err?.message || String(err);
      const isTemporaryDemand =
        errMsg.includes('503') ||
        errMsg.includes('UNAVAILABLE') ||
        errMsg.includes('high demand') ||
        errMsg.includes('429') ||
        errMsg.includes('RESOURCE_EXHAUSTED') ||
        errMsg.includes('timeout');

      if (isTemporaryDemand) {
        const nextModel = TEXT_MODELS[i + 1];
        if (nextModel && Date.now() - startTime < MAX_TOTAL_TIME_MS - 3000) {
          console.info(`[Gemini Info] Model ${model} is experiencing temporary high demand; retrying with ${nextModel}...`);
          await new Promise((resolve) => setTimeout(resolve, 250));
          continue;
        } else {
          console.info(`[Gemini Info] Switching immediately to agronomic expert engine.`);
          break;
        }
      } else {
        console.warn(`[Gemini] Model ${model} encountered non-critical issue:`, errMsg);
      }
    }
  }
  return null;
}

// Weather code translation helper
function getWeatherCondition(code: number): string {
  if (code === 0) return 'Clear Sky';
  if (code === 1) return 'Mainly Clear';
  if (code === 2) return 'Partly Cloudy';
  if (code === 3) return 'Overcast';
  if (code === 45 || code === 48) return 'Foggy';
  if (code >= 51 && code <= 55) return 'Light Drizzle';
  if (code >= 61 && code <= 63) return 'Moderate Rain';
  if (code >= 64 && code <= 65) return 'Heavy Rain';
  if (code >= 71 && code <= 77) return 'Snow / Flurries';
  if (code >= 80 && code <= 82) return 'Rain Showers';
  if (code >= 95) return 'Thunderstorm';
  return 'Cloudy';
}

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Weather Fetcher from Open-Meteo with fallback
app.post('/api/weather', async (req, res) => {
  const { latitude, longitude, locationName } = req.body;
  const lat = typeof latitude === 'number' ? latitude : 28.6139;
  const lon = typeof longitude === 'number' ? longitude : 77.209;

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max&timezone=auto`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`Open-Meteo HTTP ${response.status}`);
    }

    const data = await response.json();

    const current = {
      temperature: Math.round(data.current.temperature_2m),
      apparentTemperature: Math.round(data.current.apparent_temperature),
      relativeHumidity: Math.round(data.current.relative_humidity_2m),
      windSpeed: Math.round(data.current.wind_speed_10m),
      precipitation: Number((data.current.precipitation || 0).toFixed(1)),
      precipitationProbability: Math.round(
        data.daily?.precipitation_probability_max?.[0] || 0
      ),
      weatherCode: data.current.weather_code,
      weatherCondition: getWeatherCondition(data.current.weather_code),
      time: data.current.time,
    };

    const forecast = (data.daily.time || []).slice(0, 7).map((dateStr: string, idx: number) => {
      const dateObj = new Date(dateStr);
      return {
        date: dateStr,
        dayName: idx === 0 ? 'Today' : dayNames[dateObj.getDay()],
        tempMax: Math.round(data.daily.temperature_2m_max[idx] ?? current.temperature + 2),
        tempMin: Math.round(data.daily.temperature_2m_min[idx] ?? current.temperature - 5),
        precipitationSum: Number((data.daily.precipitation_sum[idx] ?? 0).toFixed(1)),
        precipitationProbability: Math.round(data.daily.precipitation_probability_max?.[idx] ?? 0),
        windSpeedMax: Math.round(data.daily.wind_speed_10m_max?.[idx] ?? 12),
        weatherCode: data.daily.weather_code[idx] ?? 1,
        weatherCondition: getWeatherCondition(data.daily.weather_code[idx] ?? 1),
      };
    });

    res.json({
      locationName: locationName || 'Farm Location',
      latitude: lat,
      longitude: lon,
      current,
      forecast,
      fetchedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.warn('Live weather fetch failed, returning structured fallback weather data:', error);
    // Reliable Fallback Weather Data
    const today = new Date();
    const fallbackForecast = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const isRainy = i === 1 || i === 2;
      return {
        date: d.toISOString().split('T')[0],
        dayName: i === 0 ? 'Today' : dayNames[d.getDay()],
        tempMax: 29 + (i % 3),
        tempMin: 19 + (i % 2),
        precipitationSum: isRainy ? 14.5 : 0.0,
        precipitationProbability: isRainy ? 70 : 10,
        windSpeedMax: 14 + i,
        weatherCode: isRainy ? 61 : 1,
        weatherCondition: isRainy ? 'Moderate Rain' : 'Mainly Clear',
      };
    });

    res.json({
      locationName: locationName || 'Farm Location',
      latitude: lat,
      longitude: lon,
      current: {
        temperature: 28,
        apparentTemperature: 30,
        relativeHumidity: 65,
        windSpeed: 12,
        precipitation: 0.0,
        precipitationProbability: 30,
        weatherCode: 2,
        weatherCondition: 'Partly Cloudy',
        time: today.toISOString(),
      },
      forecast: fallbackForecast,
      fetchedAt: today.toISOString(),
    });
  }
});

// Location Search / Geocoding via Open-Meteo
app.get('/api/search-location', async (req, res) => {
  const query = req.query.q as string;
  if (!query || query.trim().length < 2) {
    return res.json([]);
  }

  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      query.trim()
    )}&count=6&language=en&format=json`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Geocoding response not ok');
    const data = await response.json();
    const results = (data.results || []).map((item: any) => ({
      name: `${item.name}${item.admin1 ? ', ' + item.admin1 : ''}, ${item.country || ''}`,
      latitude: item.latitude,
      longitude: item.longitude,
      country: item.country,
      timezone: item.timezone,
    }));
    res.json(results);
  } catch (err) {
    console.warn('Geocoding failed:', err);
    res.json([]);
  }
});

// Reverse Geocoding via Nominatim with graceful fallback
app.get('/api/reverse-geocode', async (req, res) => {
  const lat = parseFloat(req.query.lat as string);
  const lon = parseFloat(req.query.lon as string);

  if (isNaN(lat) || isNaN(lon)) {
    return res.status(400).json({ error: 'Valid latitude and longitude are required' });
  }

  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'WeatherFarmAdvisoryApp/1.0 (agronomic-advisory-service)',
        Accept: 'application/json',
      },
    });
    clearTimeout(timeout);

    if (response.ok) {
      const data = await response.json();
      const addr = data.address || {};
      const primary =
        addr.village ||
        addr.town ||
        addr.city ||
        addr.suburb ||
        addr.municipality ||
        addr.hamlet ||
        addr.county ||
        '';
      const state = addr.state || addr.state_district || addr.region || '';
      const country = addr.country || '';

      const parts = [primary, state, country].filter(Boolean);
      const formattedName =
        parts.length > 0
          ? parts.join(', ')
          : data.display_name?.split(',').slice(0, 3).join(',') ||
            `Location (${lat.toFixed(2)}°, ${lon.toFixed(2)}°)`;

      return res.json({
        name: formattedName,
        latitude: lat,
        longitude: lon,
        city: primary,
        state,
        country,
      });
    }
  } catch (err) {
    console.warn('Reverse geocoding error:', err);
  }

  // Graceful fallback if external geocoding fails
  res.json({
    name: `Farm Location (${lat.toFixed(2)}°, ${lon.toFixed(2)}°)`,
    latitude: lat,
    longitude: lon,
  });
});

// IP-based Location Fallback (when browser GPS is blocked, denied, or unavailable)
app.get('/api/detect-ip-location', async (req, res) => {
  try {
    const rawForwarded = req.headers['x-forwarded-for'];
    const clientIp =
      typeof rawForwarded === 'string'
        ? rawForwarded.split(',')[0].trim()
        : Array.isArray(rawForwarded)
        ? rawForwarded[0].trim()
        : '';

    const queryUrl =
      clientIp &&
      !clientIp.startsWith('127.') &&
      !clientIp.startsWith('10.') &&
      !clientIp.startsWith('192.168.')
        ? `http://ip-api.com/json/${clientIp}`
        : 'http://ip-api.com/json';

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const response = await fetch(queryUrl, { signal: controller.signal });
    clearTimeout(timeout);

    if (response.ok) {
      const data = await response.json();
      if (data && data.status === 'success' && typeof data.lat === 'number' && typeof data.lon === 'number') {
        const nameParts = [data.city, data.regionName, data.country].filter(Boolean);
        return res.json({
          success: true,
          name: nameParts.join(', ') || 'Detected Location',
          latitude: data.lat,
          longitude: data.lon,
          city: data.city,
          region: data.regionName,
          country: data.country,
          isIpFallback: true,
        });
      }
    }
  } catch (err) {
    console.warn('IP location detection error:', err);
  }

  res.json({
    success: false,
    name: 'Punjab, India',
    latitude: 30.901,
    longitude: 75.8573,
    isIpFallback: true,
  });
});

const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  hi: 'Hindi (हिंदी)',
  pa: 'Punjabi (ਪੰਜਾਬੀ)',
  es: 'Spanish (Español)',
  ta: 'Tamil (தமிழ்)',
  ml: 'Malayalam (മലയാളം)',
  kn: 'Kannada (ಕನ್ನಡ)',
  te: 'Telugu (తెలుగు)',
  mr: 'Marathi (मराठी)',
  bn: 'Bengali (বাংলা)',
  fr: 'French (Français)',
  sw: 'Swahili (Kiswahili)',
};

// AI Farm Advisory generation using Gemini
app.post('/api/advisory', async (req, res) => {
  try {
    const { farmInputs, weatherData, previousForecast, language } = req.body || {};

    if (!farmInputs || !weatherData) {
      return res.status(400).json({ error: 'Missing farmInputs or weatherData' });
    }

    const selectedLang = language || farmInputs.language || 'en';
    const targetLangName = LANGUAGE_NAMES[selectedLang] || 'English';

    // Calculate quick summary metrics for rain and temperature safely
    const forecastList = Array.isArray(weatherData.forecast) ? weatherData.forecast : [];
    const upcomingRainSum = forecastList.length
      ? forecastList.slice(0, 3).reduce((acc: number, d: any) => acc + (Number(d?.precipitationSum) || 0), 0)
      : 0;
    const maxRainProb = forecastList.length
      ? Math.max(0, ...forecastList.slice(0, 3).map((d: any) => Number(d?.precipitationProbability) || 0))
      : 0;

    let systemInstruction = `You are a certified agronomic expert and AI Farm Advisory Agent.
Your goal is to provide precise, actionable, and scientifically sound agricultural guidance to farmers based on their location, soil type, land area, season, current/existing crops, growth stage, and 7-day weather forecast.

CRITICAL AGRONOMIC ACCURACY & SAFETY MANDATES:
1. Growth Stage & Harvesting Rules:
   - If the crop growth stage is 'Maturity / Harvesting': You MUST NOT recommend IRRIGATE_NOW. Irrigation must be stopped or withdrawn 10-15 days prior to harvest to promote grain drying, prevent rotting/mold, and avoid lodging.
   - If 'Flowering & Pollination': Guard against moisture stress, but avoid overhead flooding or high-pressure spray that dislodges pollen.
   - If 'Germination / Seedling': Maintain light topsoil moisture without waterlogging.
2. Rainfall & Irrigation Logic:
   - If upcoming 72h rainfall is ≥ 5 mm or peak probability is ≥ 50%: Irrigation status MUST be 'POSTPONE' to prevent waterlogging, anaerobic root conditions, and nitrogen leaching.
   - If temperature is high (≥ 33°C) and no rain is expected for 5+ days on sandy/loamy soil during vegetative or grain fill: Recommend irrigation with explicit timing (early morning or late evening).
3. Chemical Spraying & Fertilizer Windows:
   - NEVER recommend spraying foliar pesticides or broadcasting nitrogen fertilizer if rain is forecast within 24-48 hours (rainfastness failure washes chemicals away into waterways).
   - If wind speed exceeds 15 km/h: Warn against spraying due to chemical drift hazard.
4. Standing Crop vs New Crop Sowing:
   - If the farmer has specified an Existing Crop and Growth Stage: The primary focus of your advice MUST be managing their CURRENT standing crop. You MUST populate "standingCropAdvice" with stage-specific field actions, pest/disease alerts (correlated with humidity & temperature), and spray advice.
   - For "recommendedCrops": When the farmer already has a standing crop, recommend crops suitable for the NEXT crop rotation cycle (following harvest of current crop) or companion intercropping. Do NOT recommend re-sowing the crop they currently have growing.
5. Soil Behavior:
   - Clay/Clay Loam: High water holding capacity, slow drainage. High risk of waterlogging; allow soil surface to aerate before re-watering.
   - Sandy/Sandy Loam: Drains rapidly. Needs light, frequent irrigation; never flood.
   - Loamy: Balanced water retention and aeration.
6. Safety & General Advisory:
   - Never provide lethal chemical dosage prescriptions. Emphasize consulting local agricultural extension officers for localized chemical products.
   - Never guarantee monetary profit or absolute crop yields.
   - Return strictly valid JSON without markdown code fences.`;

    if (selectedLang !== 'en') {
      systemInstruction += `\n7. LANGUAGE MANDATE: The farmer has requested advice in ${targetLangName}. You MUST author ALL human-readable advisory strings, summaries, action steps, alerts, and explanations in fluent, natural, everyday ${targetLangName}. Keep JSON keys strictly in English.`;
    }

    const currentW = weatherData.current || {};
    const prompt = `Analyze this farm profile and weather forecast to generate the farm advisory:

FARM PROFILE:
- Location: ${farmInputs.location || 'Farm'} (Lat: ${farmInputs.latitude}, Lon: ${farmInputs.longitude})
- Soil Type: ${farmInputs.soilType || 'Loamy'}
- Land Area: ${farmInputs.landArea || 1} ${farmInputs.areaUnit || 'Acres'}
- Season: ${farmInputs.season || 'Current Season'}
- Existing Crop: ${farmInputs.existingCrop || 'None specified / Seeking new crop selection'}
- Crop Growth Stage: ${farmInputs.cropGrowthStage || 'Not specified'}
- Farmer Language: ${targetLangName}

CURRENT WEATHER:
- Temperature: ${currentW.temperature ?? 28}°C (Feels like: ${currentW.apparentTemperature ?? 29}°C)
- Relative Humidity: ${currentW.relativeHumidity ?? 65}%
- Wind Speed: ${currentW.windSpeed ?? 10} km/h
- Current Condition: ${currentW.weatherCondition ?? 'Clear'}
- Immediate Precipitation: ${currentW.precipitation ?? 0} mm
- Today's Rain Probability: ${currentW.precipitationProbability ?? 10}%

7-DAY WEATHER FORECAST:
${forecastList
  .map(
    (d: any) =>
      `• ${d?.dayName || 'Day'} (${d?.date || ''}): Temp ${d?.tempMin ?? 20}°C - ${d?.tempMax ?? 30}°C, Expected Rain ${d?.precipitationSum ?? 0} mm (Prob: ${d?.precipitationProbability ?? 0}%), Wind Max ${d?.windSpeedMax ?? 10} km/h, ${d?.weatherCondition || 'Fair'}`
  )
  .join('\n')}

Upcoming 3-Day Expected Total Rainfall: ${upcomingRainSum.toFixed(1)} mm, Peak Rain Probability: ${maxRainProb}%.

${
  previousForecast
    ? `PREVIOUS FORECAST SNAPSHOT TO COMPARE (For Feature 3 Weather Change detection):
${JSON.stringify(previousForecast)}`
    : ''
}

${
  selectedLang !== 'en'
    ? `\nIMPORTANT: Write all text values in clear, natural ${targetLangName} so the farmer can understand easily.`
    : ''
}

Respond with a JSON object strictly having these keys:
{
  "aiExplanation": {
    "overview": "Clear 2-sentence executive summary of the current farm situation based on weather, crop stage, and soil.",
    "climateAndSoilAnalysis": "Detailed agronomic explanation connecting temperature, humidity, forecast rainfall, and ${farmInputs.soilType} soil dynamics.",
    "keyTakeawayForFarmer": "Top priority practical action for the farmer today."
  },
  ${
    farmInputs.existingCrop
      ? `"standingCropAdvice": {
    "cropName": "${farmInputs.existingCrop}",
    "stage": "${farmInputs.cropGrowthStage || 'Active Growth'}",
    "stageSummary": "Practical 2-sentence guidance on what the standing crop requires right now given the weather and stage.",
    "keyActionItems": ["Specific field task 1", "Specific field task 2", "Specific field task 3"],
    "pestAndDiseaseVigilance": "Pest or disease alert correlated with current humidity (${currentW.relativeHumidity ?? 65}%) and temperature (${currentW.temperature ?? 28}°C).",
    "fertilizerAndSprayAdvice": "Guidance on fertilizer application or chemical spraying based on upcoming rain and wind."
  },`
      : ''
  }
  "recommendedCrops": [
    {
      "cropName": "Name of crop",
      "varietyOrType": "Recommended variety/seed trait suited for this climate",
      "whySuitable": "Why it fits this soil type, season, and current temperature window (or fits as next rotation)",
      "suitableWeatherConditions": "Optimal temperature, rainfall, and humidity range",
      "importantLimitations": "Key vulnerabilities, pest/disease susceptibilities, or soil drainage prerequisites",
      "waterNeedLevel": "Low" | "Moderate" | "High",
      "estimatedDuration": "e.g., 90-120 days",
      "growthPotentialNote": "Explicit disclaimer that yield depends on field conditions, disease control, and micro-climate."
    }
  ],
  "irrigationAdvisory": {
    "status": "IRRIGATE_NOW" | "POSTPONE" | "ADEQUATE_MOISTURE" | "MONITOR_SOIL",
    "statusTitle": "Clear bold headline for the farmer (e.g. 'Postpone Irrigation: Significant Rain Forecast')",
    "summary": "Plain-language 2-3 sentence guidance on water management.",
    "checkSchedule": "Specific recommended time and method to test soil moisture (e.g. 'Check top 10cm tomorrow at 8:00 AM')",
    "postponeReason": "If postponing, explain the rain forecast impact, otherwise leave null or explain why postponing is not advised.",
    "recentRainfallImpact": "Explanation of how recent/current moisture affects root saturation in ${farmInputs.soilType} soil.",
    "forecastRainfallImpact": "Impact of the expected ${upcomingRainSum.toFixed(1)} mm rain over the next 72 hours.",
    "approximateWaterRequirement": "Standard agricultural benchmark guideline (or explicit guidance on how to gauge root-zone moisture) - DO NOT invent speculative numbers.",
    "soilWaterRetentionNote": "Behavioral characteristics of ${farmInputs.soilType} soil regarding drainage, aeration, and run-off.",
    "actionSteps": ["Step 1 for farmer", "Step 2 for farmer", "Step 3 for farmer"]
  },
  "weatherAlerts": [
    {
      "id": "alert-1",
      "severity": "urgent" | "warning" | "info",
      "headline": "Brief alert headline",
      "description": "Specific protective or precautionary guidance",
      "source": "Agri-Meteorological Analysis",
      "issuedAt": "Current date/time"
    }
  ],
  "safetyDisclaimer": "General agricultural advisory disclaimer recommending verification with local district agronomy officers before heavy capital or chemical commitments."
}`;

    const ai = getGeminiClient();

    if (ai) {
      const geminiResult = await executeGeminiWithRetry(
        ai,
        prompt,
        systemInstruction,
        'application/json',
        0.2
      );

      if (geminiResult) {
        try {
          const parsed = JSON.parse(geminiResult.text);
          parsed.engineUsed = geminiResult.modelUsed;
          return res.json(parsed);
        } catch (parseError) {
          console.warn('[Gemini] JSON parsing error in response, using agronomic expert engine:', parseError);
        }
      }
    }

    // Resilient fallback rule-based agricultural reasoning engine
    const fallbackAdvisory = generateFallbackAdvisory(farmInputs, weatherData, upcomingRainSum, maxRainProb, selectedLang);
    (fallbackAdvisory as any).engineUsed = 'Agronomic Expert Engine';
    return res.json(fallbackAdvisory);
  } catch (outerError) {
    console.error('[API Advisory Fatal Catch]', outerError);
    try {
      const selectedLang = req.body?.language || req.body?.farmInputs?.language || 'en';
      const safeInputs = req.body?.farmInputs || { soilType: 'Loamy', season: 'Kharif (Monsoon)' };
      const safeWeather = req.body?.weatherData || { current: { temperature: 28, relativeHumidity: 65 }, forecast: [] };
      const fallbackAdvisory = generateFallbackAdvisory(safeInputs, safeWeather, 0, 0, selectedLang);
      (fallbackAdvisory as any).engineUsed = 'Agronomic Expert Engine (Safety Fallback)';
      return res.json(fallbackAdvisory);
    } catch (fallbackError) {
      console.error('[API Advisory Fallback Fatal]', fallbackError);
      return res.status(500).json({ error: 'Advisory calculation temporary failure' });
    }
  }
});

// Weather Change Detection & Analysis (Feature 3)
app.post('/api/weather-diff', async (req, res) => {
  try {
    const { farmInputs, currentForecast, previousForecast, language } = req.body || {};
    const userLang = language || farmInputs?.language || 'en';

    if (!currentForecast || !previousForecast || !Array.isArray(currentForecast) || !Array.isArray(previousForecast)) {
      return res.status(400).json({ error: 'Missing currentForecast or previousForecast' });
    }

    // Calculate differences
    const prev3DayRain = previousForecast.slice(0, 3).reduce((acc: number, d: any) => acc + (d?.precipitationSum || 0), 0);
    const curr3DayRain = currentForecast.slice(0, 3).reduce((acc: number, d: any) => acc + (d?.precipitationSum || 0), 0);
    const rainDiff = curr3DayRain - prev3DayRain;

    const prevMaxProb = previousForecast.length ? Math.max(0, ...previousForecast.slice(0, 3).map((d: any) => d?.precipitationProbability || 0)) : 0;
    const currMaxProb = currentForecast.length ? Math.max(0, ...currentForecast.slice(0, 3).map((d: any) => d?.precipitationProbability || 0)) : 0;
    const probDiff = currMaxProb - prevMaxProb;

    const prevAvgTemp = (previousForecast.slice(0, 3).reduce((acc: number, d: any) => acc + (d?.tempMax || 0), 0) / 3) || 28;
    const currAvgTemp = (currentForecast.slice(0, 3).reduce((acc: number, d: any) => acc + (d?.tempMax || 0), 0) / 3) || 28;
    const tempDiff = currAvgTemp - prevAvgTemp;

    const prevMaxWind = previousForecast.length ? Math.max(0, ...previousForecast.slice(0, 3).map((d: any) => d?.windSpeedMax || 0)) : 10;
    const currMaxWind = currentForecast.length ? Math.max(0, ...currentForecast.slice(0, 3).map((d: any) => d?.windSpeedMax || 0)) : 10;

  let hasSignificantChange = false;
  let changeType: 'RAIN_INCREASED' | 'RAIN_DECREASED' | 'HEATWAVE' | 'COLD_DROP' | 'HIGH_WINDS' | 'STABLE' = 'STABLE';
  let alertHeadline = 'Forecast Stable';
  let alertMessage = 'No significant deviation detected in the latest weather model update.';
  let whyRecommendationChanged = 'The weather conditions remain within the anticipated envelope. Your existing irrigation schedule holds.';
  let updatedIrrigationAdvice = 'Continue current moisture monitoring protocol.';
  let alertSeverity: 'urgent' | 'warning' | 'info' = 'info';

  if (rainDiff >= 8 || (probDiff >= 30 && curr3DayRain >= 6)) {
    hasSignificantChange = true;
    changeType = 'RAIN_INCREASED';
    alertSeverity = 'urgent';
    alertHeadline = 'Rain Forecast Spiked Significantly';
    alertMessage = `Expected 3-day rainfall increased by +${rainDiff.toFixed(1)} mm (now ${curr3DayRain.toFixed(1)} mm total with up to ${currMaxProb}% probability).`;
    whyRecommendationChanged = `Because incoming precipitation is now forecast to supply adequate moisture directly to the root zone, continuing irrigation would risk waterlogging in ${farmInputs?.soilType || 'the'} soil and wasting water.`;
    updatedIrrigationAdvice = 'POSTPONE all scheduled irrigation rounds for the next 48-72 hours. Inspect drainage channels to avoid standing water.';
  } else if (rainDiff <= -8 && prev3DayRain >= 10) {
    hasSignificantChange = true;
    changeType = 'RAIN_DECREASED';
    alertSeverity = 'warning';
    alertHeadline = 'Forecast Rain Diminished';
    alertMessage = `Expected rainfall dropped by ${Math.abs(rainDiff).toFixed(1)} mm compared to previous model run.`;
    whyRecommendationChanged = `The predicted rain showers have moved or dissipated. Crops expecting natural replenishment will face moisture deficit under current temperatures.`;
    updatedIrrigationAdvice = 'RESUME planned irrigation. Check topsoil moisture today and apply supplemental irrigation if soil is dry at root depth.';
  } else if (tempDiff >= 4 || currAvgTemp >= 38) {
    hasSignificantChange = true;
    changeType = 'HEATWAVE';
    alertSeverity = 'warning';
    alertHeadline = 'Heatwave Spike Alert';
    alertMessage = `Average day temperatures have shifted upwards by +${tempDiff.toFixed(1)}°C, peaking above normal seasonal benchmarks.`;
    whyRecommendationChanged = 'Elevated temperatures accelerate evapotranspiration rates and create heat stress during midday hours.';
    updatedIrrigationAdvice = 'Irrigate strictly during early morning (5:00 - 8:00 AM) or late evening to minimize evaporative loss. Consider light mulching.';
  } else if (tempDiff <= -5 || (currAvgTemp <= 5 && prevAvgTemp > 7)) {
    hasSignificantChange = true;
    changeType = 'COLD_DROP';
    alertSeverity = 'warning';
    alertHeadline = 'Cold Snap / Sudden Temp Drop';
    alertMessage = `Temperatures have dropped sharply by ${Math.abs(tempDiff).toFixed(1)}°C.`;
    whyRecommendationChanged = 'Cold conditions slow water uptake by roots and increase vulnerability to chilling stress in wet soil.';
    updatedIrrigationAdvice = 'Moderate irrigation to prevent saturated cold roots. Avoid evening watering if overnight frost is possible.';
  } else if (currMaxWind >= 45 && prevMaxWind < 35) {
    hasSignificantChange = true;
    changeType = 'HIGH_WINDS';
    alertSeverity = 'warning';
    alertHeadline = 'High Wind Advisory Detected';
    alertMessage = `Peak wind gusts are now expected to reach ${currMaxWind} km/h.`;
    whyRecommendationChanged = 'Strong winds cause rapid desiccation and make overhead sprinkler irrigation inefficient and prone to drift.';
    updatedIrrigationAdvice = 'Postpone sprinkler or spray operations. Use drip or furrow irrigation where applicable.';
  }

  // Localized weather diff messages for non-English languages
  if (userLang === 'hi' && hasSignificantChange) {
    if (changeType === 'RAIN_INCREASED') {
      alertHeadline = 'भारी बारिश का नया पूर्वानुमान';
      alertMessage = `अगले 3 दिनों में बारिश का अनुमान +${rainDiff.toFixed(1)} मिमी बढ़कर अब कुल ${curr3DayRain.toFixed(1)} मिमी हो गया है (${currMaxProb}% संभावना)।`;
      whyRecommendationChanged = 'बारिश से खेत में पर्याप्त नमी आएगी, अतः तुरंत सिंचाई करने से पानी जमा होने और खाद बहने का खतरा रहेगा।';
      updatedIrrigationAdvice = 'अगले 48 से 72 घंटों के लिए सभी सिंचाई रोक दें। खेत में पानी निकासी की नालियों की जांच करें।';
    } else if (changeType === 'RAIN_DECREASED') {
      alertHeadline = 'बारिश का अनुमान घट गया';
      alertMessage = `पिछले पूर्वानुमान की तुलना में बारिश ${Math.abs(rainDiff).toFixed(1)} मिमी कम हो गई है।`;
      whyRecommendationChanged = 'संभावित बारिश के बादल छंट गए हैं। फसल में नमी की कमी हो सकती है।';
      updatedIrrigationAdvice = 'सिंचाई पुनः शुरू करें। खेत की मिट्टी में 5-10 सेमी गहराई पर नमी जांचें और जरूरत पड़ने पर पानी दें।';
    } else if (changeType === 'HEATWAVE') {
      alertHeadline = 'लू और तेज गर्मी की चेतावनी';
      alertMessage = `औसत तापमान में +${tempDiff.toFixed(1)}°C की बढ़ोतरी हुई है।`;
      whyRecommendationChanged = 'अधिक तापमान से मिट्टी की नमी तेजी से भाप बनकर उड़ती है।';
      updatedIrrigationAdvice = 'सिंचाई केवल सुबह (5 से 8 बजे) या शाम को करें। तेज धूप में पानी न दें।';
    }
  } else if (userLang === 'pa' && hasSignificantChange) {
    if (changeType === 'RAIN_INCREASED') {
      alertHeadline = 'ਭਾਰੀ ਮੀਂਹ ਦੀ ਨਵੀਂ ਚੇਤਾਵਨੀ';
      alertMessage = `ਅਗਲੇ 3 ਦਿਨਾਂ ਵਿੱਚ ਮੀਂਹ ਦਾ ਅਨੁਮਾਨ +${rainDiff.toFixed(1)} ਮਿਲੀਮੀਟਰ ਵੱਧ ਕੇ ਕੁੱਲ ${curr3DayRain.toFixed(1)} ਮਿਲੀਮੀਟਰ ਹੋ ਗਿਆ ਹੈ।`;
      whyRecommendationChanged = 'ਮੀਂਹ ਨਾਲ ਖੇਤ ਵਿੱਚ ਭਰਪੂਰ ਨਮੀ ਆਵੇਗੀ, ਹੁਣੇ ਪਾਣੀ ਲਾਉਣ ਨਾਲ ਪਾਣੀ ਖੜ੍ਹਨ ਦਾ ਖਤਰਾ ਵਧੇਗਾ।';
      updatedIrrigationAdvice = 'ਅਗਲੇ 48-72 ਘੰਟੇ ਸਿੰਚਾਈ ਰੋਕੋ। ਖੇਤ ਦੇ ਨਿਕਾਸ ਨਾਲਿਆਂ ਦੀ ਜਾਂਚ ਕਰੋ।';
    } else if (changeType === 'RAIN_DECREASED') {
      alertHeadline = 'ਮੀਂਹ ਦਾ ਅਨੁਮਾਨ ਘਟਿਆ';
      alertMessage = `ਪਿਛਲੇ ਮੌਸਮ ਅਨੁਮਾਨ ਨਾਲੋਂ ਮੀਂਹ ${Math.abs(rainDiff).toFixed(1)} ਮਿਲੀਮੀਟਰ ਘੱਟ ਗਿਆ ਹੈ।`;
      whyRecommendationChanged = 'ਬੱਦਲ ਛਾਂਟ ਗਏ ਹਨ, ਇਸ ਲਈ ਫਸਲ ਨੂੰ ਨਮੀ ਦੀ ਕਮੀ ਨਾ ਆਵੇ।';
      updatedIrrigationAdvice = 'ਲੋੜ ਅਨੁਸਾਰ ਪਾਣੀ ਲਾਓ। ਮਿੱਟੀ ਦੀ ਨਮੀ ਪਰਖ ਕੇ ਹਲਕੀ ਸਿੰਚਾਈ ਕਰੋ।';
    }
  } else if (userLang === 'ta' && hasSignificantChange) {
    if (changeType === 'RAIN_INCREASED') {
      alertHeadline = 'கனமழை முன்னறிவிப்பு மாற்றம்';
      alertMessage = `அடுத்த 3 நாட்களில் மழை அளவு +${rainDiff.toFixed(1)} மி.மீ அதிகரித்து மொத்தம் ${curr3DayRain.toFixed(1)} மி.மீ ஆகலாம்.`;
      whyRecommendationChanged = 'மழை பொழிய வாய்ப்புள்ளதால் இப்போது நீர் பாய்ச்சினால் வயலில் நீர் தேங்கி வேரழுகல் ஏற்படலாம்.';
      updatedIrrigationAdvice = 'அடுத்த 48-72 மணி நேரத்திற்கு பாசனத்தை ஒத்திவைக்கவும். வடிகால்களை சரிசெய்யவும்.';
    } else if (changeType === 'RAIN_DECREASED') {
      alertHeadline = 'மழை வாய்ப்பு குறைந்தது';
      alertMessage = `முந்தைய முன்னறிவிப்பை விட மழை ${Math.abs(rainDiff).toFixed(1)} மி.மீ குறைந்துள்ளது.`;
      whyRecommendationChanged = 'மழை மேகங்கள் கலைந்துவிட்டதால் பயிர்களுக்கு நீர் தேவைப்படலாம்.';
      updatedIrrigationAdvice = 'மண்ணின் ஈரப்பதத்தை சோதித்து தேவையான அளவு நீர் பாய்ச்சவும்.';
    } else if (changeType === 'HEATWAVE') {
      alertHeadline = 'வெப்ப அலை எச்சரிக்கை';
      alertMessage = `சராசரி வெப்பநிலை +${tempDiff.toFixed(1)}°C உயர்ந்துள்ளது.`;
      whyRecommendationChanged = 'அதிக வெப்பத்தால் நீர் ஆவியாதல் அதிகரிக்கும்.';
      updatedIrrigationAdvice = 'அதிகாலை அல்லது மாலையில் மட்டுமே பாசனம் செய்யவும்.';
    }
  } else if (userLang === 'te' && hasSignificantChange) {
    if (changeType === 'RAIN_INCREASED') {
      alertHeadline = 'భారీ వర్షపు హెచ్చరిక మార్పు';
      alertMessage = `రాబోయే 3 రోజుల్లో వర్షం +${rainDiff.toFixed(1)} మి.మీ పెరిగి మొత్తం ${curr3DayRain.toFixed(1)} మి.మీ అయ్యే అవకాశం ఉంది.`;
      whyRecommendationChanged = 'రాబోయే వర్షం నేలకు సరిపడా తేమను అందిస్తుంది, ఇప్పుడు నీరు పెడితే నీరు నిలిచి పంట దెబ్బతినే ప్రమాదం ఉంది.';
      updatedIrrigationAdvice = 'రాబోయే 48-72 గంటల పాటు నీటిపారుదల వాయిదా వేయండి. మురుగు కాలువలను సరిచూసుకోండి.';
    } else if (changeType === 'RAIN_DECREASED') {
      alertHeadline = 'వర్షపు అంచనా తగ్గింది';
      alertMessage = `గత అంచనా కంటే వర్షం ${Math.abs(rainDiff).toFixed(1)} మి.మీ తగ్గింది.`;
      whyRecommendationChanged = 'మేఘాలు తొలగిపోయినందున నేలలో తేమ లోపించే అవకాశం ఉంది.';
      updatedIrrigationAdvice = 'తేమను తనిఖీ చేసి అవసరమైన మేరకు నీటిపారుదల ప్రారంభించండి.';
    } else if (changeType === 'HEATWAVE') {
      alertHeadline = 'తీవ్ర వేడిమి హెచ్చరిక';
      alertMessage = `సగటు ఉష్ణోగ్రత +${tempDiff.toFixed(1)}°C పెరిగింది.`;
      whyRecommendationChanged = 'ఎక్కువ ఎండ వల్ల నేలలోని తేమ వేగంగా ఆవిరవుతుంది.';
      updatedIrrigationAdvice = 'ఉదయం లేదా సాయంత్రం మాత్రమే నీరు పెట్టండి.';
    }
  } else if (userLang === 'ml' && hasSignificantChange) {
    if (changeType === 'RAIN_INCREASED') {
      alertHeadline = 'കനത്ത മഴ മുന്നറിയിപ്പ് മാറ്റം';
      alertMessage = `അടുത്ത 3 ദിവസത്തിൽ മഴ +${rainDiff.toFixed(1)} മി.മീ വർധിച്ച് ആകെ ${curr3DayRain.toFixed(1)} മി.മീ ആകാം.`;
      whyRecommendationChanged = 'മഴ കാരണം മണ്ണിൽ ആവശ്യത്തിന് ഈർപ്പം ലഭിക്കും. ഇപ്പോൾ നനച്ചാൽ വെള്ളക്കെട്ടുണ്ടാകും.';
      updatedIrrigationAdvice = 'അടുത്ത 48-72 മണിക്കൂർ നനയ്ക്കുന്നത് മാറ്റിവയ്ക്കുക. ചാലുകൾ വൃത്തിയാക്കുക.';
    } else if (changeType === 'RAIN_DECREASED') {
      alertHeadline = 'മഴ സാധ്യത കുറഞ്ഞു';
      alertMessage = `മുൻ കണക്കുകൂട്ടലിനേക്കാൾ മഴ ${Math.abs(rainDiff).toFixed(1)} മി.മീ കുറഞ്ഞു.`;
      whyRecommendationChanged = 'മഴക്കാർ ഒഴിഞ്ഞുപോയതിനാൽ വേരുകളിൽ ഈർപ്പക്കുറവ് ഉണ്ടാകാം.';
      updatedIrrigationAdvice = 'മണ്ണിലെ ഈർപ്പം പരിശോധിച്ച് നനയ്ക്കുക.';
    } else if (changeType === 'HEATWAVE') {
      alertHeadline = 'കടുത്ത ചൂട് മുന്നറിയിപ്പ്';
      alertMessage = `താപനിലയിൽ +${tempDiff.toFixed(1)}°C വർധനവ് രേഖപ്പെടുത്തി.`;
      whyRecommendationChanged = 'ഉയർന്ന താപനില വേഗത്തിൽ ബാഷ്പീകരണത്തിന് കാരണമാകുന്നു.';
      updatedIrrigationAdvice = 'രാവിലെയോ വൈകുന്നേരമോ മാത്രം നനയ്ക്കുക.';
    }
  } else if (userLang === 'kn' && hasSignificantChange) {
    if (changeType === 'RAIN_INCREASED') {
      alertHeadline = 'ಭಾರೀ ಮಳೆಯ ಹೊಸ ಮುನ್ಸೂಚನೆ';
      alertMessage = `ಮುಂದಿನ 3 ದಿನಗಳಲ್ಲಿ ಮಳೆಯು +${rainDiff.toFixed(1)} ಮಿ.ಮೀ ಹೆಚ್ಚಾಗಿ ಒಟ್ಟು ${curr3DayRain.toFixed(1)} ಮಿ.ಮೀ ಆಗುವ ಸಾಧ್ಯತೆಯಿದೆ.`;
      whyRecommendationChanged = 'ಮಳೆಯಿಂದ ಮಣ್ಣಿನಲ್ಲಿ ಸಾಕಷ್ಟು ತೇವಾಂಶ ಸಿಗುವುದರಿಂದ, ಈಗ ನೀರು ಹಾಯಿಸಿದರೆ ನೀರು ನಿಲ್ಲುವ ಅಪಾಯವಿದೆ.';
      updatedIrrigationAdvice = 'ಮುಂದಿನ 48-72 ಗಂಟೆಗಳ ಕಾಲ ನೀರಾವರಿಯನ್ನು ಮುಂದೂಡಿ. ಚರಂಡಿ ವ್ಯವಸ್ಥೆ ಪರಿಶೀಲಿಸಿ.';
    } else if (changeType === 'RAIN_DECREASED') {
      alertHeadline = 'ಮಳೆಯ ಮುನ್ಸೂಚನೆ ಕಡಿಮೆಯಾಗಿದೆ';
      alertMessage = `ಹಿಂದಿನ ಮುನ್ಸೂಚನೆಗಿಂತ ಮಳೆ ${Math.abs(rainDiff).toFixed(1)} ಮಿ.ಮೀ ಕಡಿಮೆಯಾಗಿದೆ.`;
      whyRecommendationChanged = 'ಮೋಡ ಕರಗಿದ್ದರಿಂದ ಬೆಳೆಗಳಿಗೆ ತೇವಾಂಶದ ಕೊರತೆಯಾಗಬಹುದು.';
      updatedIrrigationAdvice = 'ಮಣ್ಣಿನ ತೇವಾಂಶ ಪರಿಶೀಲಿಸಿ ಅಗತ್ಯಕ್ಕೆ ತಕ್ಕಂತೆ ನೀರು ಹಾಯಿಸಿ.';
    } else if (changeType === 'HEATWAVE') {
      alertHeadline = 'ತೀವ್ರ ಶಾಖದ ಎಚ್ಚರಿಕೆ';
      alertMessage = `ಸರಾಸರಿ ತಾಪಮಾನ +${tempDiff.toFixed(1)}°C ಹೆಚ್ಚಾಗಿದೆ.`;
      whyRecommendationChanged = 'ಹೆಚ್ಚಿನ ತಾಪಮಾನವು ಮಣ್ಣಿನ ತೇವಾಂಶವನ್ನು ವೇಗವಾಗಿ ಆವಿಯಾಗಿಸುತ್ತದೆ.';
      updatedIrrigationAdvice = 'ಮುಂಜಾನೆ ಅಥವಾ ಸಂಜೆ ಮಾತ್ರ ನೀರು ಹಾಯಿಸಿ.';
    }
  } else if (userLang === 'es' && hasSignificantChange) {
    if (changeType === 'RAIN_INCREASED') {
      alertHeadline = 'Aumento Significativo en el Pronóstico de Lluvia';
      alertMessage = `La precipitación esperada para 3 días subió +${rainDiff.toFixed(1)} mm (total ${curr3DayRain.toFixed(1)} mm).`;
      whyRecommendationChanged = 'La lluvia pronosticada recargará el perfil del suelo. Regar ahora causaría encharcamiento.';
      updatedIrrigationAdvice = 'POSPONER el riego durante las próximas 48 a 72 horas. Revisar canales de drenaje.';
    } else if (changeType === 'RAIN_DECREASED') {
      alertHeadline = 'Pronóstico de Lluvia Disminuido';
      alertMessage = `La precipitación esperada bajó ${Math.abs(rainDiff).toFixed(1)} mm respecto al modelo anterior.`;
      whyRecommendationChanged = 'Las lluvias previstas se disiparon. Los cultivos necesitarán riego de apoyo.';
      updatedIrrigationAdvice = 'Reanudar el riego según el nivel de humedad observado en la zona de raíces.';
    } else if (changeType === 'HEATWAVE') {
      alertHeadline = 'Alerta de Ola de Calor';
      alertMessage = `Las temperaturas medias aumentaron +${tempDiff.toFixed(1)}°C.`;
      whyRecommendationChanged = 'Las altas temperaturas aceleran la evapotranspiración.';
      updatedIrrigationAdvice = 'Regar temprano en la mañana o al atardecer para minimizar la evaporación.';
    }
  }

  res.json({
    hasSignificantChange,
    changeType,
    alertSeverity,
    alertHeadline,
    alertMessage,
    whyRecommendationChanged,
    updatedIrrigationAdvice,
    detectedAt: new Date().toISOString(),
  });
  } catch (err) {
    console.error('[Weather-Diff Catch]', err);
    res.json({
      hasSignificantChange: false,
      changeType: 'STABLE',
      alertSeverity: 'info',
      alertHeadline: 'Forecast Model Updated',
      alertMessage: 'Atmospheric variance analysis completed. Continue recommended field practices.',
      whyRecommendationChanged: 'Atmospheric conditions remain aligned with current irrigation advice.',
      updatedIrrigationAdvice: 'Continue standard moisture monitoring.',
      detectedAt: new Date().toISOString(),
    });
  }
});

// Follow-up Q&A endpoint for the Farmer
app.post('/api/ask-advisor', async (req, res) => {
  try {
    const { question, farmInputs, weatherData, language } = req.body || {};
    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    const selectedLang = language || farmInputs?.language || 'en';
    const targetLangName = LANGUAGE_NAMES[selectedLang] || 'English';

    const upcomingRainSum = weatherData?.forecast
      ? weatherData.forecast.slice(0, 3).reduce((acc: number, d: any) => acc + (d?.precipitationSum || 0), 0)
      : 0;
    const maxRainProb = weatherData?.forecast
      ? Math.max(0, ...weatherData.forecast.slice(0, 3).map((d: any) => d?.precipitationProbability || 0))
      : 0;

  const ai = getGeminiClient();
  let systemInstruction = `You are a certified agricultural advisor speaking directly, respectfully, and practically to a farmer.
Your advice must be scientifically sound, grounded in local crop requirements, growth stage, soil type, and upcoming 7-day weather.

CRITICAL RULES:
1. Irrigation:
   - Check growth stage: If 'Maturity / Harvesting', advise stopping/withdrawing irrigation 10-15 days before harvest to avoid lodging and grain rot.
   - Check rain: If rain (>= 5mm or >= 50% probability) is expected in the next 1-3 days, advise postponing irrigation to avoid waterlogging and fertilizer leaching.
2. Spraying & Fertilizers:
   - Warn that spraying before rain washes chemicals away, and wind > 15 km/h causes drift. Urea/nitrogen before heavy rain leaches into groundwater.
3. Standing Crop:
   - Address their specific crop (${farmInputs?.existingCrop || 'crop'}) and growth stage (${farmInputs?.cropGrowthStage || 'current stage'}).
4. Language:
   - Formulate your entire answer in natural, clear, farmer-friendly ${targetLangName}.
5. Keep it concise, actionable, and structured with clear recommendations.`;

  if (selectedLang !== 'en') {
    systemInstruction += `\nLANGUAGE MANDATE: Formulate your entire answer in clear, everyday, easy-to-understand ${targetLangName} so the farmer can understand effortlessly.`;
  }

  const prompt = `The farmer has an urgent field question:
Location: ${farmInputs?.location || 'Unspecified'}
Soil: ${farmInputs?.soilType || 'Unspecified'}
Season: ${farmInputs?.season || 'Unspecified'}
Crop: ${farmInputs?.existingCrop || 'General Crop'} (${farmInputs?.cropGrowthStage || 'General Growth Stage'})
Current Weather: Temp ${weatherData?.current?.temperature}°C, ${weatherData?.current?.weatherCondition}, Humidity ${weatherData?.current?.relativeHumidity}%, Wind ${weatherData?.current?.windSpeed} km/h
Upcoming 3-day Rain: ${upcomingRainSum.toFixed(1)} mm (Max Rain Probability: ${maxRainProb}%)

Farmer's Question: "${question}"

Provide a clear, practical, and farmer-focused answer in ${targetLangName}.`;

  if (ai) {
    const result = await executeGeminiWithRetry(
      ai,
      prompt,
      systemInstruction,
      undefined,
      0.3
    );
    if (result && result.text) {
      return res.json({ answer: result.text });
    }
  }

  // Resilient heuristic answer generator based on user question intent and live conditions
  const qLower = question.toLowerCase();
  const crop = farmInputs?.existingCrop || 'crop';
  const stage = farmInputs?.cropGrowthStage || 'growth stage';
  const soil = farmInputs?.soilType || 'soil';
  const hasRainUpcoming = upcomingRainSum >= 5 || maxRainProb >= 50;
  const isHarvesting = stage.includes('Maturity') || stage.includes('Harvesting');

  let answer = '';

  if (qLower.includes('water') || qLower.includes('irrigat') || qLower.includes('தண்ணீர்') || qLower.includes('பாசனம்') || qLower.includes('पानी') || qLower.includes('सिंचाई') || qLower.includes('ਪਾਣੀ') || qLower.includes('riego')) {
    if (isHarvesting) {
      if (selectedLang === 'ta') {
        answer = `${crop} பயிர் தற்போது அறுவடை/முதிர்ச்சி நிலையில் உள்ளது. அறுவடைக்கு 10-15 நாட்களுக்கு முன்பே பாசனத்தை முழுமையாக நிறுத்துங்கள். இது தானியங்கள் சீராக முதிர்ச்சியடையவும், அழுகல் மற்றும் கதிர்கள் சாய்வதைத் தவிர்க்கவும் மிகவும் முக்கியம்.`;
      } else if (selectedLang === 'hi') {
        answer = `${crop} फसल इस समय कटाई/परिपक्वता अवस्था में है। कटाई से 10-15 दिन पहले सिंचाई पूरी तरह बंद कर दें ताकि दाने अच्छी तरह पकें और फसल गिरने या सड़ने से बचे।`;
      } else {
        answer = `Your ${crop} is in the maturity/harvesting phase. Discontinue irrigation 10-15 days prior to harvest. This promotes uniform grain drying, prevents lodging and head fungal mold, and hardens the soil for harvesting equipment.`;
      }
    } else if (hasRainUpcoming) {
      if (selectedLang === 'ta') {
        answer = `அடுத்த 72 மணி நேரத்தில் சுமார் ${upcomingRainSum.toFixed(1)} மி.மீ மழை பெய்ய வாய்ப்புள்ளது (மழை வாய்ப்பு: ${maxRainProb}%). எனவே இன்று பாசனம் செய்வதைத் தவிர்க்கவும். இயற்கை மழை மண்ணின் ஈரப்பதத்தை ஈடுசெய்யும்.`;
      } else if (selectedLang === 'hi') {
        answer = `अगले 72 घंटों में लगभग ${upcomingRainSum.toFixed(1)} मिमी बारिश का अनुमान है (${maxRainProb}% संभावना)। अभी सिंचाई स्थगित रखें। बारिश के बाद अपनी ${soil} मिट्टी में 5-10 सेमी गहराई पर नमी जांचें।`;
      } else {
        answer = `With ${upcomingRainSum.toFixed(1)} mm of rain forecast over the next 72 hours (${maxRainProb}% probability), hold off on supplemental irrigation. Allow natural precipitation to recharge root-zone moisture and prevent waterlogging in your ${soil} soil.`;
      }
    } else {
      if (selectedLang === 'ta') {
        answer = `தற்போதைய வெப்பநிலை ${weatherData?.current?.temperature || 30}°C ஆக உள்ளது. உங்கள் ${crop} (${stage}) பயிருக்கு அதிகப்படியான தண்ணீர் தேங்காமல், அதிகாலை அல்லது மாலையில் மிதமான பாசனம் அளிக்கவும்.`;
      } else if (selectedLang === 'hi') {
        answer = `वर्तमान तापमान ${weatherData?.current?.temperature || 30}°C है। अपनी ${crop} (${stage}) फसल के लिए सुबह या शाम के समय आवश्यकतानुसार हल्की सिंचाई करें।`;
      } else {
        answer = `With current temperatures around ${weatherData?.current?.temperature || 30}°C, maintain steady soil moisture for ${crop} at the ${stage} stage. Irrigate in early morning or late afternoon to minimize evaporative loss.`;
      }
    }
  } else if (qLower.includes('spray') || qLower.includes('pesticid') || qLower.includes('மருந்து') || qLower.includes('பூச்சி') || qLower.includes('कीटनाशक') || qLower.includes('छिड़काव') || qLower.includes('स्प्रे') || qLower.includes('fumigar')) {
    if (hasRainUpcoming) {
      if (selectedLang === 'ta') {
        answer = `கவனம்: அடுத்த சில நாட்களில் மழை வாய்ப்பு உள்ளதால் இன்று பூச்சிக்கொல்லி அல்லது மருந்துகளை தெளிப்பதைத் தவிர்க்கவும். மழை பெய்தால் மருந்து அடித்துச் செல்லப்பட்டு வீணாகிவிடும். மழை நின்ற பின்னர் தெளிக்கவும்.`;
      } else if (selectedLang === 'hi') {
        answer = `सावधानी: आगामी बारिश के पूर्वानुमान को देखते हुए अभी कीटनाशक या फफूंदनाशी का छिड़काव न करें। बारिश से दवाई धुल जाएगी। मौसम साफ होने के बाद ही छिड़काव करें।`;
      } else {
        answer = `Caution: With rainfall projected in the next 1-3 days, postpone all foliar chemical and pesticide spraying. Rain will wash active ingredients off foliage before absorption. Spray during clear weather with wind under 15 km/h.`;
      }
    } else {
      if (selectedLang === 'ta') {
        answer = `பூச்சிக்கொல்லி தெளிக்கும் போது காற்று வேகம் குறைவாக உள்ள அதிகாலை வேளையைத் தேர்ந்தெடுக்கவும். உங்கள் ${crop} பயிரின் இலைகளின் அடிப்பகுதியை நன்கு சோதித்து தேவையான அளவு மட்டும் பயன்படுத்தவும்.`;
      } else {
        answer = `For ${crop}, spray during calm morning hours when wind speed is under 15 km/h to prevent spray drift. Always wear protective gear and follow extension guidelines.`;
      }
    }
  } else if (qLower.includes('fertiliz') || qLower.includes('urea') || qLower.includes('உரம்') || qLower.includes('खाद') || qLower.includes('यूरिया') || qLower.includes('ਖਾਦ')) {
    if (hasRainUpcoming) {
      if (selectedLang === 'ta') {
        answer = `மழை பெய்ய வாய்ப்புள்ளதால் இன்று வயலில் யூரியா அல்லது தழைச்சத்து உரங்களை இடுவதைத் தவிர்க்கவும். மழை நீரில் உரம் அடித்துச் செல்லப்பட்டு வீணாக வாய்ப்புள்ளது.`;
      } else if (selectedLang === 'hi') {
        answer = `बारिश की संभावना के कारण आज यूरिया या नाइट्रोजन उर्वरक न डालें, अन्यथा वर्षा जल के साथ उर्वरक बहकर नष्ट हो जाएगा। बारिश के बाद ही खाद डालें।`;
      } else {
        answer = `Do not broadcast nitrogen/urea fertilizers today because upcoming rain will wash the nutrients away into runoff before root uptake. Apply fertilizers after rainfall when soil is moist but not waterlogged.`;
      }
    } else {
      if (selectedLang === 'ta') {
        answer = `${crop} பயிரின் ${stage} வளர்ச்சி நிலைக்கு பரிந்துரைக்கப்பட்ட அளவு தழை மற்றும் சாம்பல் சத்து உரங்களை மிதமான ஈரப்பதமுள்ள மண்ணில் இடவும்.`;
      } else {
        answer = `Apply balanced fertilizers calibrated for ${crop} at the ${stage} stage when soil has optimal moisture. Incorporate into the root zone to prevent volatilization.`;
      }
    }
  } else {
    // General crop care answer
    if (selectedLang === 'ta') {
      answer = `உங்கள் ${crop} பயிருக்கு (${stage} நிலை) தற்போதைய ${weatherData?.current?.temperature || 28}°C வானிலையில் சரியான நீர் மேலாண்மை மற்றும் பயிர் பாதுகாப்பு அவசியம். ஏதேனும் குறிப்பிட்ட நோய் அல்லது பூச்சி தாக்குதல் தென்பட்டால் உங்கள் வட்டார வேளாண்மை அலுவலரை அணுகவும்.`;
    } else if (selectedLang === 'hi') {
      answer = `आपकी ${crop} फसल (${stage}) के लिए मौजूदा तापमान (${weatherData?.current?.temperature || 28}°C) में उचित नमी और जलनिकास बनाए रखें। किसी भी विशिष्ट रोग के लक्षण दिखने पर स्थानीय कृषि विशेषज्ञ से संपर्क करें।`;
    } else {
      answer = `For your standing ${crop} at ${stage}, ensure healthy aeration in ${soil} soil and monitor for emerging pests given current humidity (${weatherData?.current?.relativeHumidity}%). Verify moisture depth before operations.`;
    }
  }

    res.json({ answer });
  } catch (err) {
    console.error('[Ask-Advisor Catch]', err);
    res.json({
      answer:
        'Please check soil moisture at 5-10cm root depth before field operations, and consult your local agricultural extension officer for specific localized chemical treatments.',
    });
  }
});

// Robust Heuristic Advisory Generator (Used if API Key is not set or network fails)
function generateFallbackAdvisory(farmInputs: any, weatherData: any, upcomingRainSum: number, maxRainProb: number, selectedLang: string = 'en') {
  const soil = farmInputs.soilType || 'Loamy';
  const season = farmInputs.season || 'Kharif (Monsoon)';
  const crop = farmInputs.existingCrop || 'General Crop';
  const stage = farmInputs.cropGrowthStage || 'Vegetative';
  const temp = weatherData.current?.temperature || 26;
  const humidity = weatherData.current?.relativeHumidity || 65;

  const isHarvesting = stage.includes('Maturity') || stage.includes('Harvesting');
  const hasRainUpcoming = upcomingRainSum >= 5 || maxRainProb >= 50;

  // Determine irrigation status based on growth stage, rain, temp, and soil
  let status: 'IRRIGATE_NOW' | 'POSTPONE' | 'ADEQUATE_MOISTURE' | 'MONITOR_SOIL' = 'MONITOR_SOIL';
  let statusTitle = 'Monitor Root-Zone Soil Moisture';
  let summary = 'Current weather and soil conditions indicate moderate moisture levels. Check root depth before irrigating.';
  let postponeReason: string | undefined = undefined;

  if (isHarvesting) {
    status = 'ADEQUATE_MOISTURE';
    statusTitle = selectedLang === 'ta'
      ? 'பாசனத்தை நிறுத்தவும்: பயிர் அறுவடை நிலை'
      : selectedLang === 'hi'
      ? 'सिंचाई बंद करें: फसल कटाई/परिपक्वता अवस्था'
      : selectedLang === 'pa'
      ? 'ਸਿੰਚਾਈ ਬੰਦ ਕਰੋ: ਫਸਲ ਪੱਕਣ ਦੀ ਅਵਸਥਾ'
      : selectedLang === 'es'
      ? 'Suspender Riego: Etapa de Madurez / Cosecha'
      : 'Cease Irrigation: Crop at Maturity / Harvesting Phase';
    summary = selectedLang === 'ta'
      ? `${crop} பயிர் முதிர்ச்சி/அறுவடை நிலையில் உள்ளதால், அறுவடைக்கு 10-15 நாட்களுக்கு முன்பே பாசனத்தை முழுமையாக நிறுத்தவும். இது தானியங்கள் சீராக உலரவும், சாய்வதைத் தடுக்கவும் உதவும்.`
      : selectedLang === 'hi'
      ? `${crop} फसल परिपक्वता अवस्था में है। कटाई से 10-15 दिन पूर्व सिंचाई रोक दें ताकि दाना मजबूत हो और कटाई मशीन आसानी से चल सके।`
      : `Your ${crop} is at the maturity/harvesting stage. Stop irrigation 10-15 days before harvest to promote uniform grain ripening, prevent mold/rot, and allow soil to dry for harvesting machinery.`;
  } else if (hasRainUpcoming) {
    status = 'POSTPONE';
    statusTitle = selectedLang === 'hi'
      ? 'सिंचाई स्थगित करें: बारिश का पूर्वानुमान'
      : selectedLang === 'pa'
      ? 'ਸਿੰਚਾਈ ਰੋਕੋ: ਮੀਂਹ ਦੀ ਸੰਭਾਵਨਾ'
      : selectedLang === 'ta'
      ? 'பாசனத்தை ஒத்திவைக்கவும்: மழை வரவுள்ளது'
      : selectedLang === 'es'
      ? 'Posponer el Riego: Lluvia Pronosticada'
      : 'Postpone Irrigation: Rain Forecast Ahead';
    summary = selectedLang === 'hi'
      ? `अगले 72 घंटों में लगभग ${upcomingRainSum.toFixed(1)} मिमी बारिश का अनुमान है (${maxRainProb}% संभावना)। वर्षा जल से मिट्टी को रिचार्ज होने दें।`
      : selectedLang === 'pa'
      ? `ਅਗਲੇ 72 ਘੰਟਿਆਂ ਵਿੱਚ ਲਗਭਗ ${upcomingRainSum.toFixed(1)} ਮਿਲੀਮੀਟਰ ਮੀਂਹ ਪੈਣ ਦੀ ਉਮੀਦ ਹੈ। ਹੁਣੇ ਪਾਣੀ ਨਾ ਲਾਓ।`
      : selectedLang === 'ta'
      ? `அடுத்த 72 மணி நேரத்தில் சுமார் ${upcomingRainSum.toFixed(1)} மி.மீ மழை பெய்ய வாய்ப்புள்ளது (${maxRainProb}% வாய்ப்பு). இயற்கை மழையைப் பயன்படுத்திக் கொள்ளவும்.`
      : `A total of approximately ${upcomingRainSum.toFixed(1)} mm of rainfall is expected within the next 72 hours (up to ${maxRainProb}% probability). Artificial irrigation should be postponed.`;
    postponeReason = selectedLang === 'hi'
      ? `${upcomingRainSum.toFixed(1)} मिमी वर्षा से ऊपरी मिट्टी में पर्याप्त नमी आ जाएगी। अभी पानी देने से ${soil} मिट्टी में जलभराव हो सकता है।`
      : selectedLang === 'ta'
      ? `எதிர்பார்க்கப்படும் ${upcomingRainSum.toFixed(1)} மி.மீ மழை மண்ணின் ஈரப்பதத்தை ஈடுசெய்யும். இப்போது நீர் பாய்ச்சினால் ${soil} மண்ணில் நீர் தேங்கும் அபாயம் உள்ளது.`
      : `Anticipated rainfall of ${upcomingRainSum.toFixed(1)} mm is sufficient to recharge the root zone. Irrigating now risks waterlogging in ${soil} soil and nitrogen leaching.`;
  } else if (temp >= 33 && (soil === 'Sandy' || soil === 'Sandy Loam')) {
    status = 'IRRIGATE_NOW';
    statusTitle = selectedLang === 'hi'
      ? 'सिंचाई की सिफारिश: तीव्र वाष्पीकरण'
      : selectedLang === 'pa'
      ? 'ਸਿੰਚਾਈ ਦੀ ਲੋੜ: ਤੇਜ਼ ਗਰਮੀ ਕਾਰਨ ਨਮੀ ਘਟੀ'
      : selectedLang === 'ta'
      ? 'நீர்ப்பாசனம் தேவை: அதிக ஆவியாதல்'
      : selectedLang === 'es'
      ? 'Riego Recomendado: Rápida Evaporación'
      : 'Irrigation Recommended: Rapid Evaporative Loss';
    summary = selectedLang === 'hi'
      ? `उच्च तापमान (${temp}°C) और ${soil} मिट्टी में नमी तेजी से घटती है। सुबह या शाम हल्की सिंचाई करने की सलाह है।`
      : selectedLang === 'ta'
      ? `அதிக வெப்பநிலை (${temp}°C) காரணமாக ${soil} மண்ணில் ஈரப்பதம் குறைகிறது. அதிகாலை அல்லது மாலையில் மிதமான நீர் பாய்ச்சவும்.`
      : `High temperatures (${temp}°C) combined with porous ${soil} soil accelerate moisture depletion. Supplemental water is advised during cooler morning/evening hours.`;
  } else {
    status = 'MONITOR_SOIL';
    statusTitle = selectedLang === 'hi'
      ? 'मृदा नमी की निगरानी करें'
      : selectedLang === 'ta'
      ? 'மண் ஈரப்பதத்தை கண்காணிக்கவும்'
      : 'Monitor Root-Zone Soil Moisture';
    summary = selectedLang === 'ta'
      ? `வானிலை மிதமாக உள்ளது (${temp}°C, ${humidity}% ஈரப்பதம்). ${soil} மண்ணில் 5-10 செ.மீ ஆழத்தில் பரிசோதித்த பின் பாசனம் செய்யவும்.`
      : `Moderate conditions (${temp}°C, ${humidity}% humidity). Verify moisture at 5-10 cm root depth before running supplemental water rounds.`;
  }

  // Soil water retention note
  const soilNotes: Record<string, string> = {
    Clay: 'Clay soil has high water retention capacity and slow percolation. Avoid over-watering to prevent aeration loss and root rot.',
    Loamy: 'Loamy soil offers ideal balance of drainage and moisture retention, providing a forgiving buffer for crop roots.',
    Sandy: 'Sandy soil drains very quickly with minimal water retention. Requires lighter, more frequent water applications to avoid leaching.',
    Silt: 'Silty soil holds moisture well with good nutrient retention, but can crust when dry; monitor surface permeability.',
    'Sandy Loam': 'Sandy loam drains freely while retaining adequate moisture for active root systems.',
    'Clay Loam': 'Clay loam retains good moisture reserves while permitting steady root penetration.',
    Peaty: 'Peat soils hold high moisture volumes with rich organic matter; ensure drainage paths are clear.',
    Chalky: 'Chalky soils are typically free-draining and alkaline; monitor moisture closely in dry heat.',
  };

  // Standing Crop Advice (If existing crop is provided)
  let standingCropAdvice: any = undefined;
  if (farmInputs.existingCrop) {
    let keyActionItems: string[] = [];
    let pestAndDiseaseVigilance = '';
    let fertilizerAndSprayAdvice = '';
    let stageSummary = '';

    if (isHarvesting) {
      stageSummary = selectedLang === 'ta'
        ? `${crop} பயிர் முதிர்ச்சி நிலையில் உள்ளது. வயல்வெளியை உலர வைத்து அறுவடைக்கான பணிகளைத் திட்டமிடுங்கள்.`
        : selectedLang === 'hi'
        ? `${crop} फसल पककर तैयार हो रही है। खेत को सूखा रखें और कटाई की तैयारी करें।`
        : `${crop} is in final ripening stage. Allow field to dry out uniformly for clean harvesting.`;
      keyActionItems = selectedLang === 'ta'
        ? ['அறுவடைக்கு 10-15 நாட்களுக்கு முன் பாசனத்தை நிறுத்துங்கள்', 'தானியத்தின் ஈரப்பதம் 14% நிலையை எட்டியுள்ளதா என சோதிக்கவும்', 'அறுவடை இயந்திரங்கள் செல்வதற்கான பாதையை தயார் செய்யவும்']
        : selectedLang === 'hi'
        ? ['कटाई से 10-15 दिन पूर्व सिंचाई बंद करें', 'दाने की नमी की जांच करें (14% आदर्श)', 'कटाई यंत्रों और भंडारण की व्यवस्था करें']
        : ['Cease all irrigation 10-15 days before harvest', 'Test grain moisture to ensure optimal harvest readiness', 'Prepare clean storage bags and threshing equipment'];
      pestAndDiseaseVigilance = selectedLang === 'ta'
        ? 'முதிர்ந்த தானியங்களில் பூஞ்சை அல்லது பூச்சி தாக்குதல் இல்லாதவாறு உலர்ந்த சூழலை பராமரிக்கவும்.'
        : 'Scout for grain discolouration or head molds; keep field dry to prevent ear rot.';
      fertilizerAndSprayAdvice = selectedLang === 'ta'
        ? 'அறுவடை நிலையில் எவ்வித ரசாயன உரங்களோ பூச்சிக்கொல்லிகளோ தெளிக்கக் கூடாது.'
        : 'Do NOT apply any fertilizers or chemical sprays at this harvest stage.';
    } else {
      stageSummary = selectedLang === 'ta'
        ? `${crop} பயிர் ${stage} நிலையில் உள்ளது. சீரான வேர் வளர்ச்சி மற்றும் பூச்சி கண்காணிப்பில் கவனம் செலுத்தவும்.`
        : `${crop} is at the ${stage} stage. Focus on root health, weed competition reduction, and weather-based pest monitoring.`;
      keyActionItems = selectedLang === 'ta'
        ? ['களைகளை நீக்கி பயிரின் ஊட்டச்சத்து போட்டியைத் தவிர்க்கவும்', hasRainUpcoming ? 'மழை வரவுள்ளதால் பாசனத்தை ஒத்திவைக்கவும்' : 'மண்ணின் ஈரப்பதத்தை சோதித்து தேவையான போது மட்டும் நீர் பாய்ச்சவும்', 'வடிகால் வாய்க்கால்களை தூர்வாரி வைக்கவும்']
        : ['Control early weeds to prevent nutrient competition', hasRainUpcoming ? 'Postpone irrigation in anticipation of forecast rain' : 'Check soil moisture at 5-10cm depth before watering', 'Keep drainage channels clear of silt'];
      pestAndDiseaseVigilance = humidity >= 70
        ? (selectedLang === 'ta' ? `அதிக காற்று ஈரப்பதம் (${humidity}%) உள்ளதால் இலைக்கருகல் மற்றும் பூஞ்சை நோய்கள் வர வாய்ப்புள்ளது. இலைகளை கண்காணிக்கவும்.` : `High atmospheric humidity (${humidity}%) elevates fungal disease pressure. Scout leaf surfaces regularly.`)
        : (selectedLang === 'ta' ? `வறண்ட வானிலையில் சாறு உறிஞ்சும் பூச்சிகள் வர வாய்ப்புள்ளது.` : `Moderate humidity; monitor for early sap-sucking pests.`);
      fertilizerAndSprayAdvice = hasRainUpcoming
        ? (selectedLang === 'ta' ? `மழை வரவுள்ளதால் இன்று உரம் இடுவதையோ பூச்சிக்கொல்லி தெளிப்பதையோ தவிர்க்கவும்.` : `Postpone foliar sprays and urea top-dressing until after forecast rain passes.`)
        : (selectedLang === 'ta' ? `காலை வேளையில் உரம் அல்லது தெளிப்பு பணிகளை மேற்கொள்ளவும்.` : `Foliar sprays can be applied in calm early morning hours if wind < 15 km/h.`);
    }

    standingCropAdvice = {
      cropName: farmInputs.existingCrop,
      stage,
      stageSummary,
      keyActionItems,
      pestAndDiseaseVigilance,
      fertilizerAndSprayAdvice,
    };
  }

  // Safe crop suggestions tailored to season (and filter out existing crop if already planted)
  const cropCatalog: Record<string, any[]> = {
    'Kharif (Monsoon)': [
      {
        cropName: 'Paddy (Rice)',
        varietyOrType: 'Medium duration drought-tolerant variety',
        whySuitable: `Well-suited for monsoon moisture conditions and soils with good retention like ${soil}.`,
        suitableWeatherConditions: '24°C - 35°C, high humidity, and good standing water control.',
        importantLimitations: 'Requires reliable water availability and adequate field bunding.',
        waterNeedLevel: 'High',
        estimatedDuration: '110 - 135 days',
        growthPotentialNote: 'Ensure water drainage prior to maturity to prevent grain discolouration.',
      },
      {
        cropName: 'Pigeon Pea (Arhar / Red Gram)',
        varietyOrType: 'Wilt-resistant medium duration variety',
        whySuitable: `Deep taproot system thrives in ${soil} soil; excellent nitrogen fixing rotation crop.`,
        suitableWeatherConditions: '25°C - 35°C with moderate rainfall and sunshine.',
        importantLimitations: 'Extremely sensitive to standing water/waterlogging during early seedling phase.',
        waterNeedLevel: 'Low',
        estimatedDuration: '140 - 160 days',
        growthPotentialNote: 'Avoid low-lying water stagnation plots to protect against Phytophthora blight.',
      },
      {
        cropName: 'Maize (Corn)',
        varietyOrType: 'High-yielding hybrid with drought tolerance',
        whySuitable: `Responds well to organic-rich ${soil} soil with active aeration.`,
        suitableWeatherConditions: '20°C - 32°C, moderate rainfall and well-drained slopes.',
        importantLimitations: 'Susceptible to Fall Armyworm; cannot tolerate waterlogging.',
        waterNeedLevel: 'Moderate',
        estimatedDuration: '90 - 105 days',
        growthPotentialNote: 'Apply nitrogen in split doses rather than single broadcast.',
      },
      {
        cropName: 'Soybean',
        varietyOrType: 'Early maturing, non-shattering selection',
        whySuitable: `Fast-growing leguminous crop that enriches ${soil} soil fertility.`,
        suitableWeatherConditions: '22°C - 30°C with steady moisture during pod filling.',
        importantLimitations: 'Poor germination if heavy crust forms on soil surface after sowing.',
        waterNeedLevel: 'Moderate',
        estimatedDuration: '85 - 100 days',
        growthPotentialNote: 'Ensure seed inoculation with Rhizobium culture prior to planting.',
      },
    ],
    'Rabi (Winter)': [
      {
        cropName: 'Wheat',
        varietyOrType: 'Rust-resistant semi-dwarf selection',
        whySuitable: `Performs best in fertile, well-drained ${soil} soils during cool winter months.`,
        suitableWeatherConditions: '15°C - 24°C, cool nights, and low humidity.',
        importantLimitations: 'Susceptible to terminal heat stress during grain fill if temperatures rise above 30°C.',
        waterNeedLevel: 'Moderate',
        estimatedDuration: '115 - 130 days',
        growthPotentialNote: 'Crown root initiation (CRI) at 21 days is the most critical irrigation stage.',
      },
      {
        cropName: 'Mustard / Rapeseed',
        varietyOrType: 'Bold-seeded drought-resilient variety',
        whySuitable: 'Low water requirement crop well adapted to conserved soil moisture in winter.',
        suitableWeatherConditions: '15°C - 25°C, cool nights, and low relative humidity.',
        importantLimitations: 'Vulnerable to aphid infestations if cloudy, humid weather persists during flowering.',
        waterNeedLevel: 'Low',
        estimatedDuration: '105 - 120 days',
        growthPotentialNote: 'Success relies on pest scouting and avoiding heavy overhead watering during flowering.',
      },
      {
        cropName: 'Chickpea (Gram)',
        varietyOrType: 'Desi / Kabuli wilt-resistant selection',
        whySuitable: `Deep taproot system efficiently mines moisture from deeper profiles of ${soil} soil.`,
        suitableWeatherConditions: '15°C - 28°C with dry atmospheric conditions during pod maturation.',
        importantLimitations: 'Susceptible to Ascochyta blight and pod borer; sensitive to excess irrigation and salinity.',
        waterNeedLevel: 'Low',
        estimatedDuration: '100 - 115 days',
        growthPotentialNote: 'Excess vegetative growth caused by over-irrigation can drastically suppress flower formation.',
      },
    ],
    default: [
      {
        cropName: 'Pearl Millet (Bajra / Sorghum)',
        varietyOrType: 'Dual-purpose grain & fodder hybrid',
        whySuitable: `Exceptional drought tolerance and resilience across ${soil} soils during fluctuating weather.`,
        suitableWeatherConditions: 'Warm climate (25°C - 35°C) with low to moderate rainfall.',
        importantLimitations: 'Seedling establishment sensitive to severe surface soil crusting.',
        waterNeedLevel: 'Low',
        estimatedDuration: '75 - 90 days',
        growthPotentialNote: 'A hardy staple option, though economic returns rely on grain quality and local market demand.',
      },
      {
        cropName: 'Vegetable Legumes (Mung / Cowpea)',
        varietyOrType: 'Short-season early maturity strain',
        whySuitable: 'Quick turnaround crop that fixes atmospheric nitrogen and conserves soil structure.',
        suitableWeatherConditions: '24°C - 32°C with good solar radiation.',
        importantLimitations: 'Sensitive to prolonged overcast rain and yellow mosaic virus in vector-heavy areas.',
        waterNeedLevel: 'Low',
        estimatedDuration: '60 - 75 days',
        growthPotentialNote: 'Ideal catch crop or rotation crop to maintain soil biological activity between major plantings.',
      },
    ],
  };

  let candidateCrops = cropCatalog[season] || cropCatalog['default'];
  if (farmInputs.existingCrop) {
    const existingLower = farmInputs.existingCrop.toLowerCase();
    const filtered = candidateCrops.filter((c: any) => !existingLower.includes(c.cropName.toLowerCase().split(' ')[0]));
    if (filtered.length >= 2) {
      candidateCrops = filtered;
    }
  }

  // Construct fallback weather alerts if applicable
  const weatherAlerts = [];
  if (upcomingRainSum >= 12 || maxRainProb >= 65) {
    weatherAlerts.push({
      id: 'alert-rain',
      severity: 'warning' as const,
      headline: selectedLang === 'ta' ? 'மழை முன்னறிவிப்பு எச்சரிக்கை' : 'Heavy Precipitation Outlook',
      description: selectedLang === 'ta'
        ? `அடுத்த 72 மணி நேரத்தில் சுமார் ${upcomingRainSum.toFixed(1)} மி.மீ மழை பெய்ய வாய்ப்புள்ளது. வடிகால் வாய்க்கால்களை சரிபார்க்கவும்.`
        : `Significant rainfall (${upcomingRainSum.toFixed(1)} mm) projected over the coming 72 hours. Inspect field drainage bunds and clear excess water channels.`,
      source: 'Agri-Meteorological Assessment',
      issuedAt: new Date().toLocaleDateString(),
    });
  }
  if (temp >= 36) {
    weatherAlerts.push({
      id: 'alert-heat',
      severity: 'warning' as const,
      headline: selectedLang === 'ta' ? 'அதிக வெப்ப எச்சரிக்கை' : 'High Thermal Stress Advisory',
      description: selectedLang === 'ta'
        ? `அதிக வெப்பநிலை (${temp}°C) பயிர் நீரிழப்பை அதிகரிக்கும். நண்பகல் வேளையில் தெளிப்பு மருந்து அடிக்க வேண்டாம்.`
        : `Current daytime temperatures (${temp}°C) accelerate plant transpiration. Avoid spraying chemicals during peak midday sun.`,
      source: 'Agri-Weather Engine',
      issuedAt: new Date().toLocaleDateString(),
    });
  }

  return {
    aiExplanation: {
      overview: selectedLang === 'ta'
        ? `${farmInputs.location || 'உங்கள் நிலம்'} பகுதிக்கு ${crop} பயிர் (${stage} நிலை), ${season} பருவம் மற்றும் ${soil} மண் சூழலை அடிப்படையாகக் கொண்டு இந்த ஆலோசனை தொகுக்கப்பட்டுள்ளது.`
        : `Advisory synthesized for ${farmInputs.location || 'your farm'} (${crop} at ${stage} stage) under ${season} conditions with ${soil} soil type.`,
      climateAndSoilAnalysis: selectedLang === 'ta'
        ? `தற்போதைய வெப்பநிலை ${temp}°C மற்றும் காற்றின் ஈரப்பதம் ${humidity}% ஆக உள்ளது. அடுத்த 72 மணி நேரத்தில் ${upcomingRainSum.toFixed(1)} மி.மீ மழை எதிர்பார்க்கப்படுகிறது. ${soilNotes[soil] || soilNotes.Loamy}`
        : `Current daytime temperature is ${temp}°C with ${humidity}% humidity. 7-day cumulative precipitation is anticipated at ${upcomingRainSum.toFixed(1)} mm. ${soilNotes[soil] || soilNotes.Loamy}`,
      keyTakeawayForFarmer: isHarvesting
        ? (selectedLang === 'ta' ? 'அறுவடைக்கு முன் பாசனத்தை நிறுத்தி, தானியங்கள் சீராக உலர வழிவகை செய்யுங்கள்.' : 'Cease irrigation 10-15 days prior to harvest to promote grain drying and prevent lodging.')
        : hasRainUpcoming
        ? (selectedLang === 'ta' ? 'மழை வரவுள்ளதால் பாசனத்தை ஒத்திவைத்து இயற்கை மழையைப் பயன்படுத்தவும்.' : 'Hold irrigation rounds; utilize upcoming natural rainfall to conserve fuel and prevent waterlogging.')
        : (selectedLang === 'ta' ? 'மண்ணில் 5-10 செ.மீ ஆழத்தில் ஈரப்பதத்தை சோதித்து தேவையான போது மட்டும் பாசனம் செய்யுங்கள்.' : 'Maintain routine field scouting; verify root-zone moisture at 5-10 cm depth prior to supplemental water.'),
    },
    standingCropAdvice,
    recommendedCrops: candidateCrops,
    irrigationAdvisory: {
      status,
      statusTitle,
      summary,
      checkSchedule: selectedLang === 'ta' ? 'நாளை காலை 7:00 முதல் 9:00 மணிக்குள் மண்ணின் ஈரப்பதத்தை சோதிக்கவும்.' : 'Inspect field moisture tomorrow morning between 7:00 AM and 9:00 AM.',
      postponeReason,
      recentRainfallImpact: selectedLang === 'ta' ? `சமீபத்திய மழைப்பொழிவு: ${weatherData.current?.precipitation || 0} மி.மீ.` : `Recent precipitation recorded at ${weatherData.current?.precipitation || 0} mm.`,
      forecastRainfallImpact: selectedLang === 'ta' ? `அடுத்த 72 மணி நேரத்தில் ${upcomingRainSum.toFixed(1)} மி.மீ மழை (வாய்ப்பு ${maxRainProb}%).` : `Upcoming 72-hour forecast projects ${upcomingRainSum.toFixed(1)} mm with ${maxRainProb}% peak probability.`,
      approximateWaterRequirement: isHarvesting
        ? (selectedLang === 'ta' ? 'அறுவடை நிலை: கூடுதல் நீர் தேவை இல்லை (0 மி.மீ).' : 'Harvesting Phase: No supplemental irrigation required (0 mm).')
        : (farmInputs.existingCrop
          ? `For established ${crop} in ${soil} soil, typical requirement is 25-35 mm equivalent per irrigation cycle, calibrated against field tension.`
          : 'Conduct the feel-and-appearance test at root depth (5-10 cm) before applying water.'),
      soilWaterRetentionNote: soilNotes[soil] || soilNotes.Loamy,
      actionSteps: [
        isHarvesting
          ? (selectedLang === 'ta' ? 'அறுவடைக்கு முன் பாசன பம்புகளை முழுமையாக நிறுத்துங்கள்' : 'Turn off irrigation pumps and dry the field')
          : hasRainUpcoming
          ? (selectedLang === 'ta' ? 'மழை வருவதால் பாசன பம்புகளை நிறுத்தி வைக்கவும்' : 'Pause automatic or manual irrigation pumps')
          : (selectedLang === 'ta' ? 'பாசன வாய்க்கால்களை சரிபார்க்கவும்' : 'Inspect irrigation emitter lines and furrows'),
        selectedLang === 'ta'
          ? '10 செ.மீ ஆழத்தில் மண்ணை கையில் எடுத்து உருட்டிப் பார்க்கவும் - உருண்டை உடைந்தால் மட்டுமே நீர் தேவை'
          : 'Verify soil moisture by taking a handful from 10cm depth — if it forms a pliable ball, moisture is sufficient',
        selectedLang === 'ta'
          ? 'வயல் வடிகால் வாய்க்கால்களில் அடைப்பு ஏதும் இன்றி பார்த்துக் கொள்ளவும்'
          : 'Ensure peripheral drainage ditches are free of debris to prevent pooling',
      ],
    },
    weatherAlerts,
    safetyDisclaimer:
      'All agronomic advisories provided herein serve as general decision-support guidance. Because soil chemistry, micro-topography, and disease vectors vary locally, farmers are advised to consult local district agricultural extension officers for critical planting and pest treatment decisions.',
  };
}

// Start server with Vite middleware in dev or static serving in prod
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Weather-Based Farm Advisory Agent running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
