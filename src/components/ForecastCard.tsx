import React from 'react';
import { Calendar, CloudRain, Droplets, Sun, CloudSun, Cloud, CloudLightning } from 'lucide-react';
import { DailyForecast } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface Props {
  forecast: DailyForecast[];
}

export const ForecastCard: React.FC<Props> = ({ forecast }) => {
  const { t } = useLanguage();
  if (!forecast || forecast.length === 0) return null;

  const getConditionIcon = (condition: string) => {
    const c = condition.toLowerCase();
    if (c.includes('thunder')) return <CloudLightning className="w-5 h-5 text-amber-500" />;
    if (c.includes('rain') || c.includes('drizzle')) return <CloudRain className="w-5 h-5 text-sky-500" />;
    if (c.includes('partly')) return <CloudSun className="w-5 h-5 text-amber-500" />;
    if (c.includes('cloud') || c.includes('overcast')) return <Cloud className="w-5 h-5 text-stone-400" />;
    return <Sun className="w-5 h-5 text-amber-500" />;
  };

  // Cumulative rain over the 7 days
  const totalRain = forecast.reduce((acc, d) => acc + d.precipitationSum, 0);

  return (
    <div id="forecast-card-section" className="bg-white rounded-xl border border-stone-200 p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b border-stone-100">
        <div className="flex items-center gap-2">
          <span className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
            <Calendar className="w-5 h-5" />
          </span>
          <div>
            <h3 className="text-base font-semibold text-stone-900">{t.sevenDayForecast}</h3>
            <p className="text-xs text-stone-500">
              7-day total rain: <strong className="text-sky-700">{totalRain.toFixed(1)} mm</strong>
            </p>
          </div>
        </div>
        <span className="text-[11px] text-stone-500 bg-stone-100 px-2 py-1 rounded-md">
          Used to calculate root-zone moisture recharge
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
        {forecast.map((day, idx) => {
          const hasSignificantRain = day.precipitationSum >= 5 || day.precipitationProbability >= 50;

          return (
            <div
              key={day.date}
              className={`p-3 rounded-xl border text-center transition-all flex flex-col justify-between ${
                idx === 0
                  ? 'bg-emerald-50/50 border-emerald-300 ring-1 ring-emerald-400/30'
                  : hasSignificantRain
                  ? 'bg-sky-50/40 border-sky-200'
                  : 'bg-stone-50/60 border-stone-200/80 hover:bg-stone-50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between sm:justify-center gap-1 mb-1">
                  <span className={`text-xs font-semibold ${idx === 0 ? 'text-emerald-800' : 'text-stone-800'}`}>
                    {day.dayName}
                  </span>
                  {idx === 0 && (
                    <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-1 rounded sm:hidden">
                      Today
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-stone-400 mb-2">
                  {day.date.split('-').slice(1).join('/')}
                </div>

                <div className="flex justify-center my-1.5">{getConditionIcon(day.weatherCondition)}</div>

                <div className="text-xs font-bold text-stone-900 mt-1">
                  {day.tempMax}° / <span className="text-stone-500 font-normal">{day.tempMin}°C</span>
                </div>
              </div>

              {/* Rain info */}
              <div className="mt-3 pt-2 border-t border-stone-200/60 text-[11px]">
                <div className="flex items-center justify-center gap-1 text-sky-700 font-medium">
                  <Droplets className="w-3 h-3" />
                  <span>{day.precipitationSum} mm</span>
                </div>
                <div className="text-[10px] text-stone-500 mt-0.5">
                  {day.precipitationProbability}% prob.
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
