export type SoilType =
  | 'Sandy'
  | 'Loamy'
  | 'Clay'
  | 'Silt'
  | 'Sandy Loam'
  | 'Clay Loam'
  | 'Peaty'
  | 'Chalky';

export type Season =
  | 'Kharif (Monsoon)'
  | 'Rabi (Winter)'
  | 'Zaid (Summer)'
  | 'Spring'
  | 'Summer'
  | 'Autumn'
  | 'Winter';

export type GrowthStage =
  | 'Land Preparation / Sowing'
  | 'Germination / Seedling'
  | 'Vegetative Growth'
  | 'Flowering & Pollination'
  | 'Fruiting / Grain Formation'
  | 'Maturity / Harvesting';

export type SupportedLanguage =
  | 'en'
  | 'hi'
  | 'pa'
  | 'es'
  | 'ta'
  | 'ml'
  | 'kn'
  | 'te'
  | 'mr'
  | 'bn'
  | 'fr'
  | 'sw';

export interface LanguageOption {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
}

export interface FarmInputs {
  location: string;
  latitude: number;
  longitude: number;
  soilType: SoilType;
  landArea: number;
  areaUnit: 'acres' | 'hectares';
  season: Season;
  existingCrop?: string;
  cropGrowthStage?: GrowthStage;
  language?: SupportedLanguage;
}

export interface CurrentWeather {
  temperature: number; // °C
  apparentTemperature: number; // °C
  relativeHumidity: number; // %
  windSpeed: number; // km/h
  precipitation: number; // mm (past 1-3 hrs)
  precipitationProbability: number; // %
  weatherCode: number;
  weatherCondition: string;
  time: string;
}

export interface DailyForecast {
  date: string;
  dayName: string;
  tempMax: number;
  tempMin: number;
  precipitationSum: number; // mm
  precipitationProbability: number; // %
  windSpeedMax: number;
  weatherCode: number;
  weatherCondition: string;
}

export interface WeatherData {
  locationName: string;
  latitude: number;
  longitude: number;
  current: CurrentWeather;
  forecast: DailyForecast[];
  fetchedAt: string;
}

export interface CropRecommendation {
  cropName: string;
  varietyOrType?: string;
  whySuitable: string;
  suitableWeatherConditions: string;
  importantLimitations: string;
  waterNeedLevel: 'Low' | 'Moderate' | 'High';
  estimatedDuration?: string;
  growthPotentialNote: string;
}

export type IrrigationStatus =
  | 'IRRIGATE_NOW'
  | 'POSTPONE'
  | 'ADEQUATE_MOISTURE'
  | 'MONITOR_SOIL';

export interface IrrigationAdvisory {
  status: IrrigationStatus;
  statusTitle: string;
  summary: string;
  checkSchedule: string;
  postponeReason?: string;
  recentRainfallImpact: string;
  forecastRainfallImpact: string;
  approximateWaterRequirement?: string;
  soilWaterRetentionNote: string;
  actionSteps: string[];
}

export interface WeatherAlert {
  id: string;
  severity: 'urgent' | 'warning' | 'info';
  headline: string;
  description: string;
  source: string;
  issuedAt: string;
}

export interface WeatherChangeComparison {
  hasSignificantChange: boolean;
  changeType: 'RAIN_INCREASED' | 'RAIN_DECREASED' | 'HEATWAVE' | 'COLD_DROP' | 'HIGH_WINDS' | 'STABLE';
  summary: string;
  alertHeadline: string;
  alertMessage: string;
  whyRecommendationChanged: string;
  updatedIrrigationAdvice: string;
  detectedAt: string;
}

export interface StandingCropAdvice {
  cropName: string;
  stage: string;
  stageSummary: string;
  keyActionItems: string[];
  pestAndDiseaseVigilance: string;
  fertilizerAndSprayAdvice: string;
}

export interface FarmAdvisoryResponse {
  aiExplanation: {
    overview: string;
    climateAndSoilAnalysis: string;
    keyTakeawayForFarmer: string;
  };
  standingCropAdvice?: StandingCropAdvice;
  recommendedCrops: CropRecommendation[];
  irrigationAdvisory: IrrigationAdvisory;
  weatherAlerts: WeatherAlert[];
  safetyDisclaimer: string;
  weatherChangeAlert?: WeatherChangeComparison;
  engineUsed?: string;
}

export type AdvisoryResponse = FarmAdvisoryResponse;
export type RecommendedCrop = CropRecommendation;

// -------------------------------------------------------------
// Crop Life-Cycle & Farm Management Module Types
// -------------------------------------------------------------

export type LifeCycleStageName =
  | 'Land Preparation'
  | 'Seed Selection'
  | 'Seed Sowing / Planting'
  | 'Germination'
  | 'Early Growth'
  | 'Vegetative Stage'
  | 'Flowering Stage'
  | 'Fruit / Vegetable Development'
  | 'Maturity'
  | 'Harvest';

export const ALL_GROWTH_STAGES: LifeCycleStageName[] = [
  'Land Preparation',
  'Seed Selection',
  'Seed Sowing / Planting',
  'Germination',
  'Early Growth',
  'Vegetative Stage',
  'Flowering Stage',
  'Fruit / Vegetable Development',
  'Maturity',
  'Harvest',
];

export type CropCategory =
  | 'Cereal / Grain'
  | 'Fruit'
  | 'Vegetable'
  | 'Pulse / Legume'
  | 'Cash Crop'
  | 'Oilseed';

export interface StageInformation {
  stageName: LifeCycleStageName;
  stageNumber: number; // 1 to 10
  dayRange: string;
  dayStart: number;
  dayEnd: number;
  whatHappens: string;
  whatToMonitor: string[];
  careRequirements: string[];
  commonProblems: string[];
  isMoistureCritical: boolean;
  moistureSensitivityNote: string;
}

export interface CropProfile {
  id: string;
  name: string;
  scientificName?: string;
  category: CropCategory;
  suitableClimate: string;
  suitableSoilTypes: string[];
  approximateGrowingDuration: string;
  totalDurationDays: number;
  importantEnvironmentalConditions: {
    optimalTemperature: string;
    humidity: string;
    sunlight: string;
    waterRequirementLevel: 'Low' | 'Moderate' | 'High' | 'Very High';
    soilPh: string;
  };
  expectedHarvestStage: {
    indicators: string[];
    harvestWindow: string;
    postHarvestTip: string;
  };
  stages: StageInformation[];
}

export interface FarmerCropSelection {
  cropId: string;
  cropName: string;
  category: CropCategory;
  location: string;
  soilType: SoilType;
  plantingDate: string; // YYYY-MM-DD
  currentGrowthStage: LifeCycleStageName;
  soilMoistureStatus?: 'Dry Topsoil' | 'Adequately Moist' | 'Wet / Saturated' | 'Unknown';
}

export interface StageIrrigationEvaluation {
  irrigationStatus: 'IRRIGATE_NOW' | 'POSTPONE' | 'ADEQUATE_MOISTURE' | 'MONITOR_SOIL';
  statusTitle: string;
  statusHeadline: string;
  isStageCritical: boolean;
  explanation: string;
  whenIrrigationMayBeNeeded: string;
  whenSoilMoistureShouldBeChecked: string;
  weatherConditionsIncreasingNeeds: string[];
  weatherConditionsReducingNeeds: string[];
  postponementReason?: string;
  soilDrainageGuidance: string;
  reliableAgriculturalRule: string;
}

export type UserRole =
  | 'Farmer / Landowner'
  | 'Smallholder Farmer'
  | 'Commercial Grower'
  | 'Agronomist / Officer'
  | 'Student / Researcher';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
  farmLocation: string;
  latitude: number;
  longitude: number;
  soilType: SoilType;
  landArea: number;
  areaUnit: 'acres' | 'hectares' | 'bigha' | 'cents';
  primaryCrop: string;
  season?: string;
  joinedDate: string;
}

