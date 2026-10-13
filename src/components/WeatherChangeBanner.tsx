import React from 'react';
import {
  AlertTriangle,
  Zap,
  CloudRain,
  Flame,
  Snowflake,
  Wind,
  CheckCircle,
  HelpCircle,
  Sliders,
} from 'lucide-react';
import { WeatherChangeComparison } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface Props {
  changeAlert: WeatherChangeComparison | null;
  onSimulateChange: (scenario: 'rain_spike' | 'heatwave' | 'dry_spell' | 'reset') => void;
  isSimulating: boolean;
}

export const WeatherChangeBanner: React.FC<Props> = ({
  changeAlert,
  onSimulateChange,
  isSimulating,
}) => {
  const { t } = useLanguage();

  const getChangeIcon = (type: string) => {
    switch (type) {
      case 'RAIN_INCREASED':
        return <CloudRain className="w-5 h-5 text-blue-600" />;
      case 'HEATWAVE':
        return <Flame className="w-5 h-5 text-amber-600" />;
      case 'COLD_DROP':
        return <Snowflake className="w-5 h-5 text-cyan-600" />;
      case 'HIGH_WINDS':
        return <Wind className="w-5 h-5 text-teal-600" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-amber-600" />;
    }
  };

  return (
    <div id="weather-change-feature-section" className="bg-white rounded-xl border border-stone-200 p-5 shadow-sm">
      {/* Feature 3 Header and Simulation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-3 border-b border-stone-100">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-amber-50 text-amber-700 rounded-lg">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-stone-900">{t.weatherChangeTitle}</h3>
              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-amber-100 text-amber-800">
                Feature 3
              </span>
            </div>
            <p className="text-xs text-stone-500">
              {t.weatherChangeSubtitle}
            </p>
          </div>
        </div>

        {/* Quick Simulator Controls for Feature 3 demonstration */}
        <div className="flex items-center flex-wrap gap-1.5 bg-stone-50 p-1 rounded-lg border border-stone-200">
          <span className="text-[10px] text-stone-500 font-medium px-1.5 flex items-center gap-1">
            <Sliders className="w-3 h-3" /> {t.testShift}:
          </span>
          <button
            type="button"
            onClick={() => onSimulateChange('rain_spike')}
            disabled={isSimulating}
            className="text-[11px] font-medium px-2 py-1 rounded bg-white hover:bg-blue-50 text-blue-800 border border-stone-200 transition-colors cursor-pointer"
            title="Simulate sudden heavy rainfall in forecast"
          >
            {t.rainSpike}
          </button>
          <button
            type="button"
            onClick={() => onSimulateChange('heatwave')}
            disabled={isSimulating}
            className="text-[11px] font-medium px-2 py-1 rounded bg-white hover:bg-amber-50 text-amber-800 border border-stone-200 transition-colors cursor-pointer"
            title="Simulate sudden heatwave surge"
          >
            {t.heatwave}
          </button>
          <button
            type="button"
            onClick={() => onSimulateChange('dry_spell')}
            disabled={isSimulating}
            className="text-[11px] font-medium px-2 py-1 rounded bg-white hover:bg-rose-50 text-rose-800 border border-stone-200 transition-colors cursor-pointer"
            title="Simulate rain clouds dissipating unexpectedly"
          >
            {t.dryDissipated}
          </button>
          <button
            type="button"
            onClick={() => onSimulateChange('reset')}
            disabled={isSimulating}
            className="text-[11px] font-medium px-2 py-1 rounded bg-stone-200 hover:bg-stone-300 text-stone-700 transition-colors cursor-pointer"
            title="Reset to live weather model"
          >
            {t.resetWeather}
          </button>
        </div>
      </div>

      {/* When significant change is detected */}
      {changeAlert && changeAlert.hasSignificantChange ? (
        <div className="rounded-xl border border-amber-300 bg-gradient-to-r from-amber-50/90 via-orange-50/50 to-amber-50/30 p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-100 rounded-lg shrink-0 mt-0.5">
              {getChangeIcon(changeAlert.changeType)}
            </div>

            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="text-sm font-bold text-amber-950 flex items-center gap-2">
                  <span>Weather Alert: {changeAlert.alertHeadline}</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-amber-200/80 text-amber-900 rounded-full">
                    {changeAlert.alertSeverity}
                  </span>
                </h4>
                <span className="text-[11px] text-stone-500">
                  Detected at {new Date(changeAlert.detectedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <p className="text-xs text-stone-800 font-medium leading-relaxed">
                {changeAlert.alertMessage}
              </p>

              {/* Explicit requirement: "Explain why the recommendation changed" */}
              <div className="p-3 bg-white/80 rounded-lg border border-amber-200/80 text-xs">
                <div className="font-semibold text-amber-900 mb-0.5 flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-amber-700" />
                  <span>{t.whyChanged}</span>
                </div>
                <p className="text-stone-700 leading-relaxed">
                  {changeAlert.whyRecommendationChanged}
                </p>
              </div>

              {/* Explicit requirement: "Update irrigation advice" */}
              <div className="p-3 bg-blue-50/80 rounded-lg border border-blue-200 text-xs">
                <div className="font-semibold text-blue-900 mb-0.5 flex items-center gap-1.5">
                  <CloudRain className="w-3.5 h-3.5 text-blue-700" />
                  <span>{t.updatedIrrigationAction}</span>
                </div>
                <p className="text-blue-950 font-medium leading-relaxed">
                  {changeAlert.updatedIrrigationAdvice}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 p-3 bg-emerald-50/40 rounded-xl border border-emerald-200 text-xs text-emerald-900">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <div>
            {t.forecastAligned}
          </div>
        </div>
      )}
    </div>
  );
};
