import React from 'react';
import { Sprout, AlertCircle, Thermometer } from 'lucide-react';
import { CropRecommendation } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface Props {
  crops: CropRecommendation[];
  season: string;
  soilType: string;
}

export const CropRecommendationsCard: React.FC<Props> = ({ crops, season, soilType }) => {
  const { t, translateSeason, translateSoil } = useLanguage();

  if (!crops || crops.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-stone-200 p-6 animate-pulse">
        <div className="h-6 bg-stone-200 rounded w-1/3 mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-40 bg-stone-100 rounded"></div>
          <div className="h-40 bg-stone-100 rounded"></div>
        </div>
      </div>
    );
  }

  const getWaterBadge = (level: string) => {
    switch (level) {
      case 'Low':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'High':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Moderate':
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  return (
    <div id="crop-recommendations-section" className="bg-white rounded-xl border border-stone-200 p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b border-stone-100">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
            <Sprout className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-stone-900">{t.cropRecTitle}</h3>
              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-stone-100 text-stone-700">
                Feature 1
              </span>
            </div>
            <p className="text-xs text-stone-500">
              Matched for {translateSeason(season as any)} season and {translateSoil(soilType as any).name} conditions
            </p>
          </div>
        </div>

        <span className="text-[11px] text-amber-800 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200 font-medium">
          {t.noYieldGuarantee}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {crops.map((crop, idx) => (
          <div
            key={idx}
            className="flex flex-col justify-between p-4 rounded-xl border border-stone-200 hover:border-emerald-300 hover:shadow-xs transition-all bg-white"
          >
            <div>
              {/* Header: Crop name & traits */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h4 className="text-base font-bold text-stone-900 flex items-center gap-1.5">
                    {crop.cropName}
                  </h4>
                  {crop.varietyOrType && (
                    <span className="text-xs text-emerald-700 font-medium">{crop.varietyOrType}</span>
                  )}
                </div>
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${getWaterBadge(
                    crop.waterNeedLevel
                  )}`}
                >
                  {crop.waterNeedLevel} Water
                </span>
              </div>

              {/* Estimated duration if available */}
              {crop.estimatedDuration && (
                <div className="text-[11px] text-stone-500 mb-2">
                  Duration: <strong className="text-stone-700">{crop.estimatedDuration}</strong>
                </div>
              )}

              {/* 1. Why it may be suitable */}
              <div className="mb-3">
                <div className="text-[11px] font-semibold text-stone-600 uppercase tracking-wider mb-1">
                  {t.whySuitable}
                </div>
                <p className="text-xs text-stone-700 leading-relaxed bg-stone-50 p-2 rounded-lg border border-stone-100">
                  {crop.whySuitable}
                </p>
              </div>

              {/* 2. Suitable weather conditions */}
              <div className="mb-3">
                <div className="text-[11px] font-semibold text-sky-800 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Thermometer className="w-3 h-3 text-sky-600" />
                  <span>{t.suitableConditions}</span>
                </div>
                <p className="text-xs text-stone-700 leading-relaxed bg-sky-50/50 p-2 rounded-lg border border-sky-100">
                  {crop.suitableWeatherConditions}
                </p>
              </div>

              {/* 3. Important limitations */}
              <div className="mb-3">
                <div className="text-[11px] font-semibold text-rose-800 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 text-rose-600" />
                  <span>{t.importantLimitations}</span>
                </div>
                <p className="text-xs text-stone-700 leading-relaxed bg-rose-50/60 p-2 rounded-lg border border-rose-100">
                  {crop.importantLimitations}
                </p>
              </div>
            </div>

            {/* Growth potential note disclaimer */}
            <div className="mt-2 pt-2 border-t border-stone-100 text-[10px] text-stone-500 italic">
              {crop.growthPotentialNote ||
                'Success depends on seed purity, pest management, and localized micro-climate.'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
