import React from 'react';
import {
  CloudRain,
  Thermometer,
  Droplets,
  Wind,
  Sun,
  CloudSun,
  Cloud,
  CloudLightning,
  RefreshCw,
  Clock,
} from 'lucide-react';
import { WeatherData } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface Props {
  weather: WeatherData | null;
  isLoading: boolean;
  onRefresh: () => void;
}

export const CurrentWeatherCard: React.FC<Props> = ({ weather, isLoading, onRefresh }) => {
  const { t } = useLanguage();

  if (!weather) {
    return (
      <div id="current-weather-skeleton" className="bg-white rounded-xl border border-stone-200 p-5 animate-pulse">
        <div className="h-6 bg-stone-200 rounded w-1/3 mb-4"></div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="h-16 bg-stone-100 rounded"></div>
          <div className="h-16 bg-stone-100 rounded"></div>
          <div className="h-16 bg-stone-100 rounded"></div>
          <div className="h-16 bg-stone-100 rounded"></div>
        </div>
      </div>
    );
  }

  const { current, locationName, fetchedAt } = weather;

  // Icon mapping
  const getWeatherIcon = (condition: string) => {
    const c = condition.toLowerCase();
    if (c.includes('thunder')) return <CloudLightning className="w-8 h-8 text-amber-500" />;
    if (c.includes('rain') || c.includes('drizzle') || c.includes('shower'))
      return <CloudRain className="w-8 h-8 text-sky-500" />;
    if (c.includes('partly')) return <CloudSun className="w-8 h-8 text-amber-500" />;
    if (c.includes('cloud') || c.includes('overcast') || c.includes('fog'))
      return <Cloud className="w-8 h-8 text-stone-500" />;
    return <Sun className="w-8 h-8 text-amber-500" />;
  };

  // Expected rainfall today
  const todayForecast = weather.forecast?.[0];
  const expectedTodayRain = todayForecast ? todayForecast.precipitationSum : current.precipitation;
  const todayRainProb = todayForecast ? todayForecast.precipitationProbability : current.precipitationProbability;

  const formatTime = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Just now';
    }
  };

  return (
    <div id="current-weather-card" className="bg-white rounded-xl border border-stone-200 p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b border-stone-100">
        <div className="flex items-center gap-2">
          <span className="p-2 bg-sky-50 text-sky-700 rounded-lg">
            <CloudSun className="w-5 h-5" />
          </span>
          <div>
            <h3 className="text-base font-semibold text-stone-900">{t.currentWeather}</h3>
            <p className="text-xs text-stone-500">Live observation for {locationName}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-stone-400 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {formatTime(fetchedAt)}
          </span>
          <button
            id="refresh-weather-btn"
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            className="p-1.5 text-stone-500 hover:text-emerald-700 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
            title="Refresh live weather"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-emerald-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Condition Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-gradient-to-r from-sky-50/70 via-emerald-50/40 to-stone-50 rounded-xl border border-sky-100/80 mb-4">
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-white rounded-xl shadow-xs border border-sky-100">
            {getWeatherIcon(current.weatherCondition)}
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight text-stone-900">
                {current.temperature}°C
              </span>
              <span className="text-xs text-stone-500 font-medium">
                {t.feelsLike} {current.apparentTemperature}°C
              </span>
            </div>
            <p className="text-sm font-medium text-stone-700">{current.weatherCondition}</p>
          </div>
        </div>

        {/* Rain probability callout */}
        <div className="flex items-center gap-3 bg-white/90 px-3.5 py-2.5 rounded-lg border border-sky-100">
          <div className="p-2 bg-sky-100/60 rounded-full text-sky-700">
            <CloudRain className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs text-stone-500">{t.rainProb}</div>
            <div className="text-sm font-bold text-sky-900">
              {todayRainProb}%
            </div>
          </div>
        </div>
      </div>

      {/* Weather Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* 1. Temperature */}
        <div className="p-3 bg-stone-50 rounded-lg border border-stone-200/70">
          <div className="flex items-center gap-1.5 text-xs text-stone-500 mb-1">
            <Thermometer className="w-3.5 h-3.5 text-rose-500" />
            <span>Temperature</span>
          </div>
          <div className="text-lg font-bold text-stone-900">{current.temperature}°C</div>
          <div className="text-[11px] text-stone-500">Range: {todayForecast?.tempMin ?? current.temperature - 3}° - {todayForecast?.tempMax ?? current.temperature + 3}°C</div>
        </div>

        {/* 2. Humidity */}
        <div className="p-3 bg-stone-50 rounded-lg border border-stone-200/70">
          <div className="flex items-center gap-1.5 text-xs text-stone-500 mb-1">
            <Droplets className="w-3.5 h-3.5 text-sky-500" />
            <span>{t.humidity}</span>
          </div>
          <div className="text-lg font-bold text-stone-900">{current.relativeHumidity}%</div>
          <div className="text-[11px] text-stone-500">
            {current.relativeHumidity > 75 ? 'High (Disease risk)' : current.relativeHumidity < 35 ? 'Dry (Fast drying)' : 'Optimal range'}
          </div>
        </div>

        {/* 3. Expected Rainfall */}
        <div className="p-3 bg-stone-50 rounded-lg border border-stone-200/70">
          <div className="flex items-center gap-1.5 text-xs text-stone-500 mb-1">
            <CloudRain className="w-3.5 h-3.5 text-blue-600" />
            <span>{t.precipitation}</span>
          </div>
          <div className="text-lg font-bold text-stone-900">{expectedTodayRain.toFixed(1)} mm</div>
          <div className="text-[11px] text-stone-500">
            {expectedTodayRain > 5 ? 'Substantial rainfall' : expectedTodayRain > 0 ? 'Light moisture' : 'No rain today'}
          </div>
        </div>

        {/* 4. Wind Speed */}
        <div className="p-3 bg-stone-50 rounded-lg border border-stone-200/70">
          <div className="flex items-center gap-1.5 text-xs text-stone-500 mb-1">
            <Wind className="w-3.5 h-3.5 text-teal-600" />
            <span>{t.wind}</span>
          </div>
          <div className="text-lg font-bold text-stone-900">{current.windSpeed} km/h</div>
          <div className="text-[11px] text-stone-500">
            {current.windSpeed > 25 ? 'Breezy (Avoid spraying)' : 'Calm conditions'}
          </div>
        </div>
      </div>
    </div>
  );
};
