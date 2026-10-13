import React from 'react';
import {
  Sprout,
  Sun,
  Droplets,
  Thermometer,
  Compass,
  Calendar,
  Layers,
  CheckCircle2,
  Clock,
  Sparkles,
  Info,
} from 'lucide-react';
import { CropProfile } from '../../types';

interface Props {
  crop: CropProfile;
  plantingDate?: string;
}

export const CropOverviewCard: React.FC<Props> = ({ crop, plantingDate }) => {
  // Calculate estimated harvest date if planting date is provided
  let estimatedHarvestDateStr = 'Calculated after sowing';
  let daysRemaining: number | null = null;

  if (plantingDate) {
    const pDate = new Date(plantingDate);
    if (!isNaN(pDate.getTime())) {
      const hDate = new Date(pDate);
      hDate.setDate(hDate.getDate() + crop.totalDurationDays);
      estimatedHarvestDateStr = hDate.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });

      const today = new Date();
      const diffMs = hDate.getTime() - today.getTime();
      daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    }
  }

  return (
    <div
      id="crop-overview-card"
      className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 shadow-xs space-y-6"
    >
      {/* Title & Classification */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-800 to-emerald-600 flex items-center justify-center text-white shadow-xs">
            <Sprout className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg sm:text-xl font-bold text-stone-950 tracking-tight">
                {crop.name}
              </h3>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                {crop.category}
              </span>
            </div>
            <p className="text-xs text-stone-500 italic">
              {crop.scientificName || `${crop.name} cultivation guide`}
            </p>
          </div>
        </div>

        {/* Total Duration Chip */}
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-200 text-right">
            <div className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
              Growing Duration
            </div>
            <div className="text-sm font-bold text-stone-900">
              {crop.approximateGrowingDuration}
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Suitable Climate, Suitable Soil Types, Harvest Window */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Suitable Climate */}
        <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 space-y-2">
          <div className="flex items-center gap-2 text-stone-800 text-xs font-bold uppercase tracking-wider">
            <Compass className="w-4 h-4 text-emerald-700" />
            <span>Suitable Climate</span>
          </div>
          <p className="text-xs text-stone-700 leading-relaxed font-normal">
            {crop.suitableClimate}
          </p>
        </div>

        {/* Suitable Soil Types */}
        <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 space-y-2">
          <div className="flex items-center gap-2 text-stone-800 text-xs font-bold uppercase tracking-wider">
            <Layers className="w-4 h-4 text-emerald-700" />
            <span>Suitable Soil Types</span>
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {crop.suitableSoilTypes.map((st) => (
              <span
                key={st}
                className="text-xs font-medium px-2.5 py-1 bg-white border border-stone-200 rounded-lg text-stone-800"
              >
                {st} Soil
              </span>
            ))}
          </div>
          <div className="text-[11px] text-stone-500 pt-1">
            Optimal Soil pH: <span className="font-semibold text-stone-700">{crop.importantEnvironmentalConditions.soilPh}</span>
          </div>
        </div>

        {/* Expected Harvest Window & Target Date */}
        <div className="p-4 rounded-xl border border-stone-200 bg-emerald-50/40 space-y-2">
          <div className="flex items-center gap-2 text-emerald-900 text-xs font-bold uppercase tracking-wider">
            <Calendar className="w-4 h-4 text-emerald-700" />
            <span>Expected Harvest Stage</span>
          </div>
          <div className="text-xs text-stone-700">
            Window: <strong className="text-emerald-950 font-semibold">{crop.expectedHarvestStage.harvestWindow}</strong>
          </div>
          {plantingDate && (
            <div className="text-xs text-stone-600">
              Est. Harvest: <span className="font-bold text-emerald-800">{estimatedHarvestDateStr}</span>
              {daysRemaining !== null && (
                <span className="block text-[11px] text-stone-500 mt-0.5">
                  {daysRemaining > 0 ? `(~${daysRemaining} days remaining)` : '(Harvest window arrived)'}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Important Environmental Conditions Breakdown */}
      <div className="space-y-3">
        <div className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
          <Sun className="w-3.5 h-3.5 text-amber-600" />
          <span>Important Environmental Conditions</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Temperature */}
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-stone-500">
              <Thermometer className="w-3.5 h-3.5 text-rose-600" />
              <span>Optimal Temp</span>
            </div>
            <div className="text-xs font-bold text-stone-900 leading-tight">
              {crop.importantEnvironmentalConditions.optimalTemperature}
            </div>
          </div>

          {/* Humidity */}
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-stone-500">
              <Droplets className="w-3.5 h-3.5 text-sky-600" />
              <span>Relative Humidity</span>
            </div>
            <div className="text-xs font-bold text-stone-900 leading-tight">
              {crop.importantEnvironmentalConditions.humidity}
            </div>
          </div>

          {/* Sunlight */}
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-stone-500">
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span>Daily Sunlight</span>
            </div>
            <div className="text-xs font-bold text-stone-900 leading-tight">
              {crop.importantEnvironmentalConditions.sunlight}
            </div>
          </div>

          {/* Water Requirement Level */}
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-stone-500">
              <Droplets className="w-3.5 h-3.5 text-indigo-600" />
              <span>Water Need Level</span>
            </div>
            <div className="text-xs font-bold text-stone-900 leading-tight flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  crop.importantEnvironmentalConditions.waterRequirementLevel === 'Very High'
                    ? 'bg-blue-600'
                    : crop.importantEnvironmentalConditions.waterRequirementLevel === 'High'
                    ? 'bg-sky-500'
                    : crop.importantEnvironmentalConditions.waterRequirementLevel === 'Moderate'
                    ? 'bg-emerald-500'
                    : 'bg-amber-500'
                }`}
              />
              <span>{crop.importantEnvironmentalConditions.waterRequirementLevel}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Harvest Readiness & Post-Harvest Advisory */}
      <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200/70 space-y-2.5">
        <div className="flex items-center gap-2 text-xs font-bold text-amber-950 uppercase tracking-wider">
          <CheckCircle2 className="w-4 h-4 text-amber-700" />
          <span>Maturity Indicators for Harvest</span>
        </div>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-amber-950">
          {crop.expectedHarvestStage.indicators.map((ind, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 shrink-0" />
              <span className="leading-relaxed">{ind}</span>
            </li>
          ))}
        </ul>

        <div className="pt-2 border-t border-amber-200/50 text-[11px] text-amber-900 flex items-start gap-2">
          <Info className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
          <span>
            <strong>Post-Harvest Handling Tip:</strong> {crop.expectedHarvestStage.postHarvestTip}
          </span>
        </div>
      </div>
    </div>
  );
};
