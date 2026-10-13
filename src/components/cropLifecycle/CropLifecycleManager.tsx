import React, { useState, useMemo } from 'react';
import {
  Layers,
  Sprout,
  Compass,
  Calendar,
  Sparkles,
  RefreshCw,
  Droplets,
  MessageSquare,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import {
  CropProfile,
  FarmerCropSelection,
  SoilType,
  WeatherData,
  LifeCycleStageName,
} from '../../types';
import {
  CROP_CATALOG,
  findCropProfile,
  generateCustomCropProfile,
  estimateGrowthStageFromDap,
} from '../../data/cropCatalog';
import { CropSelectionCard } from './CropSelectionCard';
import { CropOverviewCard } from './CropOverviewCard';
import { GrowthTimelineView } from './GrowthTimelineView';
import { StageIrrigationAdvisoryCard } from './StageIrrigationAdvisoryCard';

interface Props {
  initialCropName?: string;
  initialSoilType?: SoilType;
  initialLocation?: string;
  weatherData: WeatherData | null;
  onSyncWithMainInputs?: (cropName: string, soilType: SoilType, location: string) => void;
  onAskAiAboutStage?: (query: string) => void;
}

export const CropLifecycleManager: React.FC<Props> = ({
  initialCropName = 'Tomato',
  initialSoilType = 'Loamy',
  initialLocation = 'Pune, Maharashtra',
  weatherData,
  onSyncWithMainInputs,
  onAskAiAboutStage,
}) => {
  // Compute default planting date ~35 days ago to start in an active vegetative/flowering stage
  const defaultPlantingDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 40);
    return d.toISOString().split('T')[0];
  }, []);

  // Initial lookup
  const initialProfile = findCropProfile(initialCropName) || CROP_CATALOG[2]; // Tomato

  const [selection, setSelection] = useState<FarmerCropSelection>({
    cropId: initialProfile.id,
    cropName: initialProfile.name,
    category: initialProfile.category,
    location: initialLocation,
    soilType: initialSoilType,
    plantingDate: defaultPlantingDate,
    currentGrowthStage: 'Vegetative Stage',
    soilMoistureStatus: 'Adequately Moist',
  });

  // Calculate Days After Planting (DAP)
  const dap = useMemo(() => {
    if (!selection.plantingDate) return 0;
    const pDate = new Date(selection.plantingDate);
    if (isNaN(pDate.getTime())) return 0;
    const today = new Date();
    const diffTime = today.getTime() - pDate.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }, [selection.plantingDate]);

  // Current active crop profile (from catalog or custom generated)
  const currentCropProfile: CropProfile = useMemo(() => {
    const catalogMatch = CROP_CATALOG.find((c) => c.id === selection.cropId);
    if (catalogMatch) return catalogMatch;
    const namedMatch = findCropProfile(selection.cropName);
    if (namedMatch) return namedMatch;
    return generateCustomCropProfile(selection.cropName, selection.category);
  }, [selection.cropId, selection.cropName, selection.category]);

  // Current stage information object
  const currentStageInfo = useMemo(() => {
    return (
      currentCropProfile.stages.find(
        (s) => s.stageName.toLowerCase() === selection.currentGrowthStage.toLowerCase()
      ) || currentCropProfile.stages[0]
    );
  }, [currentCropProfile, selection.currentGrowthStage]);

  // Handle selection updates
  const handleSelectionChange = (updated: FarmerCropSelection) => {
    setSelection(updated);
    if (onSyncWithMainInputs) {
      onSyncWithMainInputs(updated.cropName, updated.soilType, updated.location);
    }
  };

  // Quick query to AI Advisor
  const handleAskAi = () => {
    if (onAskAiAboutStage) {
      const query = `For my ${selection.cropName} (${selection.category}) currently in the '${selection.currentGrowthStage}' stage (Day ${dap} after planting) in ${selection.soilType} soil at ${selection.location}: what are the top critical operations, nutrient management priorities, and pest scouting advice right now?`;
      onAskAiAboutStage(query);
    }
  };

  return (
    <div id="crop-lifecycle-farm-management" className="space-y-6">
      {/* Module Title & Introduction Header */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white rounded-2xl p-6 sm:p-7 shadow-sm border border-emerald-700/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/30 border border-emerald-400/40 text-[11px] font-bold tracking-wider uppercase text-emerald-200">
                Farm Management Module
              </span>
              <span className="text-xs text-emerald-300">Stage-by-Stage Advisory</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Crop Life-Cycle & Farm Management
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/90 max-w-2xl leading-relaxed">
              Detailed, stage-by-stage agronomic management system for crops, fruits, and vegetables.
              Track growth timelines from land preparation to harvest with synchronized weather and irrigation guidance.
            </p>
          </div>

          {/* Quick AI Advisor Query Button */}
          {onAskAiAboutStage && (
            <button
              type="button"
              onClick={handleAskAi}
              className="px-4 py-3 bg-white text-emerald-950 font-bold text-xs sm:text-sm rounded-xl shadow-xs hover:bg-emerald-50 active:scale-98 transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-emerald-700" />
              <span>Ask AI About This Stage</span>
            </button>
          )}
        </div>
      </div>

      {/* 1. Crop Selection Card */}
      <CropSelectionCard
        selection={selection}
        onSelectionChange={handleSelectionChange}
        availableCrops={CROP_CATALOG}
        weatherData={weatherData}
      />

      {/* 2. Crop Overview Card */}
      <CropOverviewCard
        crop={currentCropProfile}
        plantingDate={selection.plantingDate}
      />

      {/* 3. Complete Growth Timeline View */}
      <GrowthTimelineView
        crop={currentCropProfile}
        currentStageName={selection.currentGrowthStage}
        onSelectStage={(newStage) =>
          handleSelectionChange({
            ...selection,
            currentGrowthStage: newStage,
          })
        }
        daysAfterPlanting={dap}
      />

      {/* 4. Stage-Specific Water and Irrigation Guidance Card */}
      <StageIrrigationAdvisoryCard
        crop={currentCropProfile}
        currentStage={currentStageInfo}
        soilType={selection.soilType}
        soilMoistureStatus={selection.soilMoistureStatus}
        weatherData={weatherData}
      />
    </div>
  );
};
