import React, { useState, useEffect } from 'react';
import {
  Sprout,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ClipboardList,
  ShieldAlert,
  ArrowRight,
  Eye,
  Sparkles,
  Info,
  Calendar,
  ChevronRight,
} from 'lucide-react';
import {
  CropProfile,
  StageInformation,
  LifeCycleStageName,
  ALL_GROWTH_STAGES,
} from '../../types';

interface Props {
  crop: CropProfile;
  currentStageName: LifeCycleStageName;
  onSelectStage?: (stageName: LifeCycleStageName) => void;
  daysAfterPlanting?: number;
}

export const GrowthTimelineView: React.FC<Props> = ({
  crop,
  currentStageName,
  onSelectStage,
  daysAfterPlanting = 0,
}) => {
  // Find current stage object
  const activeStageIndex = crop.stages.findIndex(
    (s) => s.stageName.toLowerCase() === currentStageName.toLowerCase()
  );
  const safeActiveIndex = activeStageIndex >= 0 ? activeStageIndex : 0;

  // Selected stage for inspection (defaults to active stage)
  const [inspectedIndex, setInspectedIndex] = useState<number>(safeActiveIndex);

  // When crop or currentStageName changes, update inspected stage
  useEffect(() => {
    setInspectedIndex(safeActiveIndex);
  }, [crop.id, safeActiveIndex]);

  const inspectedStage: StageInformation =
    crop.stages[inspectedIndex] || crop.stages[0];

  const handleStageClick = (idx: number) => {
    setInspectedIndex(idx);
    if (onSelectStage) {
      onSelectStage(crop.stages[idx].stageName);
    }
  };

  // Progress percentage through the 10 stages
  const progressPercent = Math.round(
    ((safeActiveIndex + 1) / ALL_GROWTH_STAGES.length) * 100
  );

  return (
    <div
      id="complete-growth-timeline"
      className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 shadow-xs space-y-6"
    >
      {/* Header & Progress */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
              <Sprout className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-stone-950 tracking-tight">
                Complete Crop Life-Cycle Timeline
              </h3>
              <p className="text-xs text-stone-500">
                10-Stage Developmental Roadmap for {crop.name} ({crop.approximateGrowingDuration})
              </p>
            </div>
          </div>
        </div>

        {/* Current status chip & Quick jump button */}
        <div className="flex items-center gap-2">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-semibold text-stone-900">
              Stage {safeActiveIndex + 1} of 10: <span className="text-emerald-700">{currentStageName}</span>
            </div>
            <div className="text-[11px] text-stone-500">
              {daysAfterPlanting > 0 ? `${daysAfterPlanting} Days After Planting` : 'Pre-planting phase'} • {progressPercent}% cycle complete
            </div>
          </div>

          {inspectedIndex !== safeActiveIndex && (
            <button
              type="button"
              onClick={() => setInspectedIndex(safeActiveIndex)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <span>Jump to Current Stage</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px] font-semibold text-stone-500">
          <span>Life-Cycle Progress</span>
          <span className="text-emerald-800 font-bold">{progressPercent}% Completed</span>
        </div>
        <div className="w-full bg-stone-100 h-2.5 rounded-full overflow-hidden p-0.5">
          <div
            className="bg-gradient-to-r from-emerald-600 to-emerald-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Horizontal Interactive Stage Navigator (All 10 Stages) */}
      <div className="relative">
        <div className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2 flex items-center justify-between">
          <span>Click Any Stage to Inspect Details</span>
          <span className="text-[11px] font-normal text-stone-400">Scroll horizontally →</span>
        </div>

        <div className="overflow-x-auto pb-3 pt-1 -mx-2 px-2 scrollbar-thin">
          <div className="flex items-center gap-2 min-w-[860px]">
            {crop.stages.map((stage, idx) => {
              const isCurrent = idx === safeActiveIndex;
              const isSelected = idx === inspectedIndex;
              const isPast = idx < safeActiveIndex;

              return (
                <button
                  key={stage.stageName}
                  id={`stage-tab-${stage.stageNumber}`}
                  type="button"
                  onClick={() => handleStageClick(idx)}
                  className={`flex-1 min-w-[140px] p-3 rounded-xl border text-left transition-all relative cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-800 text-white border-emerald-900 shadow-md ring-2 ring-emerald-600/30'
                      : isCurrent
                      ? 'bg-emerald-50 text-emerald-950 border-emerald-400 font-semibold shadow-xs'
                      : isPast
                      ? 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                      : 'bg-white text-stone-500 border-stone-200 hover:bg-stone-50 hover:text-stone-800'
                  }`}
                >
                  {/* Badge */}
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span
                      className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md ${
                        isSelected
                          ? 'bg-emerald-900 text-emerald-100'
                          : isCurrent
                          ? 'bg-emerald-200 text-emerald-900'
                          : isPast
                          ? 'bg-stone-200 text-stone-700'
                          : 'bg-stone-100 text-stone-500'
                      }`}
                    >
                      {stage.stageNumber}
                    </span>

                    {isCurrent ? (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        isSelected ? 'bg-amber-400 text-stone-950' : 'bg-emerald-600 text-white'
                      }`}>
                        Active
                      </span>
                    ) : isPast ? (
                      <CheckCircle2 className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-200' : 'text-emerald-600'}`} />
                    ) : (
                      <Clock className="w-3 h-3 text-stone-300" />
                    )}
                  </div>

                  {/* Stage Name */}
                  <div
                    className={`text-xs font-bold leading-tight truncate ${
                      isSelected ? 'text-white' : 'text-stone-900'
                    }`}
                    title={stage.stageName}
                  >
                    {stage.stageName}
                  </div>

                  {/* Day range */}
                  <div
                    className={`text-[11px] mt-1 ${
                      isSelected ? 'text-emerald-200' : 'text-stone-500'
                    }`}
                  >
                    {stage.dayRange}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Inspected Stage Details Header Card */}
      <div className="bg-stone-900 text-white rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-emerald-500 text-stone-950 font-bold text-xs rounded-full uppercase tracking-wider">
              Stage {inspectedStage.stageNumber} of 10
            </span>
            <span className="text-xs text-stone-300 font-medium">
              Duration: {inspectedStage.dayRange}
            </span>
            {inspectedIndex === safeActiveIndex && (
              <span className="px-2 py-0.5 bg-amber-400 text-stone-950 font-bold text-[10px] rounded-full uppercase tracking-wider">
                Current Active Stage
              </span>
            )}
          </div>
          <h4 className="text-lg sm:text-xl font-bold text-white tracking-tight mt-1.5">
            {inspectedStage.stageName}
          </h4>
        </div>

        {/* Stage moisture requirement note */}
        {inspectedStage.isMoistureCritical ? (
          <div className="flex items-center gap-2 bg-amber-500/20 border border-amber-500/40 px-3 py-1.5 rounded-lg text-amber-200 text-xs font-semibold">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>High Moisture Sensitivity</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-stone-800 border border-stone-700 px-3 py-1.5 rounded-lg text-stone-300 text-xs">
            <Info className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            <span>Standard Moisture Management</span>
          </div>
        )}
      </div>

      {/* The 4 Stage Information Categories (Required by User Prompt) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Category 1: What happens during this stage */}
        <div className="p-4 rounded-xl border border-stone-200 bg-white space-y-2.5">
          <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs uppercase tracking-wider border-b border-stone-100 pb-2">
            <Sparkles className="w-4 h-4 text-emerald-700" />
            <span>1. What Happens During This Stage</span>
          </div>
          <p className="text-xs sm:text-sm text-stone-800 leading-relaxed font-normal">
            {inspectedStage.whatHappens}
          </p>
        </div>

        {/* Category 2: What the farmer should monitor */}
        <div className="p-4 rounded-xl border border-stone-200 bg-white space-y-2.5">
          <div className="flex items-center gap-2 text-sky-900 font-bold text-xs uppercase tracking-wider border-b border-stone-100 pb-2">
            <Eye className="w-4 h-4 text-sky-700" />
            <span>2. What the Farmer Should Monitor</span>
          </div>
          <ul className="space-y-1.5 text-xs text-stone-700">
            {inspectedStage.whatToMonitor.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 mt-0.5 shrink-0" />
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Category 3: Important care requirements */}
        <div className="p-4 rounded-xl border border-stone-200 bg-white space-y-2.5">
          <div className="flex items-center gap-2 text-indigo-900 font-bold text-xs uppercase tracking-wider border-b border-stone-100 pb-2">
            <ClipboardList className="w-4 h-4 text-indigo-700" />
            <span>3. Important Care Requirements</span>
          </div>
          <ul className="space-y-1.5 text-xs text-stone-700">
            {inspectedStage.careRequirements.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Category 4: Common problems that may occur */}
        <div className="p-4 rounded-xl border border-rose-200/80 bg-rose-50/30 space-y-2.5">
          <div className="flex items-center gap-2 text-rose-950 font-bold text-xs uppercase tracking-wider border-b border-rose-200/60 pb-2">
            <ShieldAlert className="w-4 h-4 text-rose-700" />
            <span>4. Common Problems That May Occur</span>
          </div>
          <ul className="space-y-1.5 text-xs text-rose-900">
            {inspectedStage.commonProblems.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600 mt-0.5 shrink-0" />
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
