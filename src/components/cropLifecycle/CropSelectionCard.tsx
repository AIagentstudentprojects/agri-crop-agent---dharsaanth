import React, { useState, useMemo } from 'react';
import {
  Sprout,
  MapPin,
  Calendar,
  Layers,
  ChevronDown,
  Sparkles,
  Calculator,
  Droplets,
  HelpCircle,
  Navigation,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Filter,
  Check,
  Thermometer,
  CloudSun,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import {
  FarmerCropSelection,
  CropCategory,
  SoilType,
  LifeCycleStageName,
  ALL_GROWTH_STAGES,
  CropProfile,
  WeatherData,
} from '../../types';
import {
  CROP_CATALOG,
  estimateGrowthStageFromDap,
  generateCustomCropProfile,
  findCropProfile,
} from '../../data/cropCatalog';
import { useLanguage } from '../../context/LanguageContext';
import { getLiveFarmerLocation } from '../../utils/geolocation';
import {
  evaluateCropWeatherSuitability,
  CropWeatherSuitability,
} from '../../utils/weatherSuitability';
import { LOCALIZED_CATEGORIES } from '../../utils/localizedAdvisoryEngine';

interface Props {
  selection: FarmerCropSelection;
  onSelectionChange: (updated: FarmerCropSelection) => void;
  availableCrops?: CropProfile[];
  weatherData?: WeatherData | null;
}

const CATEGORIES: (CropCategory | 'All')[] = [
  'All',
  'Vegetable',
  'Fruit',
  'Cereal / Grain',
  'Pulse / Legume',
  'Cash Crop',
  'Oilseed',
];

const SOIL_TYPES: SoilType[] = [
  'Sandy',
  'Sandy Loam',
  'Loamy',
  'Clay Loam',
  'Clay',
  'Silt',
];

// Quick example products spanning Vegetables, Fruits, and Field Crops
const QUICK_PRODUCT_EXAMPLES = [
  { id: 'tomato', name: 'Tomato', category: 'Vegetable' as CropCategory, icon: '🍅' },
  { id: 'onion', name: 'Onion', category: 'Vegetable' as CropCategory, icon: '🧅' },
  { id: 'potato', name: 'Potato', category: 'Vegetable' as CropCategory, icon: '🥔' },
  { id: 'banana', name: 'Banana', category: 'Fruit' as CropCategory, icon: '🍌' },
  { id: 'papaya', name: 'Papaya', category: 'Fruit' as CropCategory, icon: '🍈' },
  { id: 'mango', name: 'Mango', category: 'Fruit' as CropCategory, icon: '🥭' },
  { id: 'watermelon', name: 'Watermelon', category: 'Fruit' as CropCategory, icon: '🍉' },
  { id: 'paddy-rice', name: 'Paddy / Rice', category: 'Cereal / Grain' as CropCategory, icon: '🌾' },
  { id: 'wheat', name: 'Wheat', category: 'Cereal / Grain' as CropCategory, icon: '🌾' },
  { id: 'maize', name: 'Maize', category: 'Cereal / Grain' as CropCategory, icon: '🌽' },
  { id: 'chickpea', name: 'Chickpea', category: 'Pulse / Legume' as CropCategory, icon: '🫘' },
  { id: 'cotton', name: 'Cotton', category: 'Cash Crop' as CropCategory, icon: '💰' },
];

export const CropSelectionCard: React.FC<Props> = ({
  selection,
  onSelectionChange,
  availableCrops = CROP_CATALOG,
  weatherData = null,
}) => {
  const { language, t } = useLanguage();
  const [isCustomCrop, setIsCustomCrop] = useState(false);
  const [customCropName, setCustomCropName] = useState('');
  const [showMoistureGuide, setShowMoistureGuide] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [liveLocationInfo, setLiveLocationInfo] = useState<{
    text: string;
    coords?: string;
  } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Category filter and weather suitability filter
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<CropCategory | 'All'>('All');
  const [weatherSuitableOnly, setWeatherSuitableOnly] = useState<boolean>(false);

  // Compute Days After Planting (DAP)
  const computeDAP = (): number => {
    if (!selection.plantingDate) return 0;
    const pDate = new Date(selection.plantingDate);
    if (isNaN(pDate.getTime())) return 0;
    const today = new Date();
    const diffTime = today.getTime() - pDate.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  const dap = computeDAP();

  // Ensure available crops are strictly deduplicated by ID to guarantee unique React keys
  const uniqueAvailableCrops = useMemo(() => {
    return Array.from(new Map(availableCrops.map((c) => [c.id, c])).values());
  }, [availableCrops]);

  // Evaluate suitability map for all available crops against current weather
  const cropSuitabilityMap = useMemo(() => {
    const map = new Map<string, CropWeatherSuitability>();
    for (const crop of uniqueAvailableCrops) {
      const evalResult = evaluateCropWeatherSuitability(crop, weatherData, language);
      map.set(crop.id, evalResult);
    }
    return map;
  }, [uniqueAvailableCrops, weatherData, language]);

  // Current selected crop profile & its weather suitability
  const currentCropProfile = useMemo(() => {
    return findCropProfile(selection.cropId) || uniqueAvailableCrops[0];
  }, [selection.cropId, uniqueAvailableCrops]);

  const currentSuitability = useMemo(() => {
    return evaluateCropWeatherSuitability(currentCropProfile, weatherData, language);
  }, [currentCropProfile, weatherData, language]);

  // Filtered available crops based on category and weather suitability
  const filteredCrops = useMemo(() => {
    return uniqueAvailableCrops.filter((crop) => {
      // 1. Category filter
      if (selectedCategoryFilter !== 'All' && crop.category !== selectedCategoryFilter) {
        return false;
      }
      // 2. Weather suitability filter
      if (weatherSuitableOnly) {
        const suit = cropSuitabilityMap.get(crop.id);
        if (!suit || !suit.isSuitable) {
          return false;
        }
      }
      return true;
    });
  }, [uniqueAvailableCrops, selectedCategoryFilter, weatherSuitableOnly, cropSuitabilityMap]);

  // Number of crops suitable for the current weather
  const suitableCropsCount = useMemo(() => {
    let count = 0;
    for (const crop of uniqueAvailableCrops) {
      const suit = cropSuitabilityMap.get(crop.id);
      if (suit?.isSuitable) count++;
    }
    return count;
  }, [uniqueAvailableCrops, cropSuitabilityMap]);

  const handleCatalogCropChange = (cropId: string) => {
    if (cropId === 'custom') {
      setIsCustomCrop(true);
      return;
    }
    setIsCustomCrop(false);
    const found = uniqueAvailableCrops.find((c) => c.id === cropId);
    if (found) {
      onSelectionChange({
        ...selection,
        cropId: found.id,
        cropName: found.name,
        category: found.category,
        currentGrowthStage: estimateGrowthStageFromDap(found, dap),
      });
    }
  };

  const handleSelectExample = (ex: typeof QUICK_PRODUCT_EXAMPLES[0]) => {
    setIsCustomCrop(false);
    const found = uniqueAvailableCrops.find((c) => c.id === ex.id || c.name.toLowerCase().includes(ex.name.toLowerCase()));
    if (found) {
      onSelectionChange({
        ...selection,
        cropId: found.id,
        cropName: found.name,
        category: found.category,
        currentGrowthStage: estimateGrowthStageFromDap(found, dap),
      });
    } else {
      onSelectionChange({
        ...selection,
        cropId: ex.id,
        cropName: ex.name,
        category: ex.category,
      });
    }
  };

  const handleCustomSubmit = () => {
    if (!customCropName.trim()) return;
    const customProfile = generateCustomCropProfile(customCropName, selection.category);
    onSelectionChange({
      ...selection,
      cropId: customProfile.id,
      cropName: customProfile.name,
      category: customProfile.category,
      currentGrowthStage: estimateGrowthStageFromDap(customProfile, dap),
    });
  };

  const handleAutoCalculateStage = () => {
    const estimated = estimateGrowthStageFromDap(currentCropProfile, dap);
    onSelectionChange({
      ...selection,
      currentGrowthStage: estimated,
    });
  };

  const handleGetLiveLocation = async () => {
    setIsLocating(true);
    setLocationError(null);
    try {
      const res = await getLiveFarmerLocation();
      if (res && res.placeName) {
        onSelectionChange({
          ...selection,
          location: res.placeName,
        });
        setLiveLocationInfo({
          text: res.placeName,
          coords: `${res.latitude.toFixed(3)}°N, ${res.longitude.toFixed(3)}°E`,
        });
      } else {
        setLocationError('Could not identify live coordinates. Please enter location manually.');
      }
    } catch (err: any) {
      setLocationError(err?.message || 'Failed to detect live location.');
    } finally {
      setIsLocating(false);
    }
  };

  const categoryDict = LOCALIZED_CATEGORIES[language] || LOCALIZED_CATEGORIES.en;

  // Localized UI helper labels
  const uiLabels = {
    en: {
      chooseAnyProduct: 'Choose Any Product Example (Vegetables, Fruits, Crops)',
      weatherSuitableToggle: 'Show Weather-Suitable Products Only',
      weatherSuitableActive: `Showing ${filteredCrops.length} products suitable for current ${weatherData?.current?.temperature ?? 28}°C weather & climate`,
      weatherSuitableAll: `Showing all ${uniqueAvailableCrops.length} catalog products`,
      suitabilityHeader: 'Weather & Climate Suitability Assessment',
      whySuitableTitle: 'Why This Product Is Suitable For This Climate & Weather',
      climateLabel: 'Suitable Climate',
      weatherFitLabel: 'Live Weather Match',
      optimalTemp: 'Optimal Temp',
      recommendedActionLabel: 'Agricultural Recommendation',
      scoreLabel: 'Suitability Score',
    },
    hi: {
      chooseAnyProduct: 'कोई भी उत्पाद चुनें (सब्जियां, फल, मुख्य फसलें)',
      weatherSuitableToggle: 'केवल मौसम-अनुकूल उत्पाद दिखाएं',
      weatherSuitableActive: `वर्तमान ${weatherData?.current?.temperature ?? 28}°C मौसम व जलवायु के लिए ${filteredCrops.length} उपयुक्त उत्पाद दिखाए जा रहे हैं`,
      weatherSuitableAll: `सभी ${uniqueAvailableCrops.length} उत्पाद प्रदर्शित`,
      suitabilityHeader: 'मौसम एवं जलवायु उपयुक्तता विश्लेषण',
      whySuitableTitle: 'यह उत्पाद इस जलवायु और मौसम के लिए क्यों उपयुक्त है?',
      climateLabel: 'अनुकूल जलवायु',
      weatherFitLabel: 'वर्तमान मौसम तालमेल',
      optimalTemp: 'अनुकूल तापमान',
      recommendedActionLabel: 'कृषि संस्तुति',
      scoreLabel: 'उपयुक्तता स्कोर',
    },
    ta: {
      chooseAnyProduct: 'விளைபொருளைத் தேர்ந்தெடுக்கவும் (காய்கறிகள், பழங்கள், தானியங்கள்)',
      weatherSuitableToggle: 'தற்போதைய வானிலைக்கு ஏற்ற விளைபொருட்கள் மட்டும்',
      weatherSuitableActive: `தற்போதைய ${weatherData?.current?.temperature ?? 28}°C வானிலைக்கு ஏற்ற ${filteredCrops.length} விளைபொருட்கள் காட்டப்படுகின்றன`,
      weatherSuitableAll: `அனைத்து ${uniqueAvailableCrops.length} விளைபொருட்களும் காட்டப்படுகின்றன`,
      suitabilityHeader: 'வானிலை மற்றும் காலநிலை ஏற்புத்தன்மை ஆய்வு',
      whySuitableTitle: 'இந்த விளைபொருள் இந்த தட்பவெப்ப நிலைக்கு ஏன் பொருத்தமானது?',
      climateLabel: 'ஏற்ற காலநிலை',
      weatherFitLabel: 'தற்போதைய வானிலை பொருத்தம்',
      optimalTemp: 'உகந்த வெப்பநிலை',
      recommendedActionLabel: 'விவசாயப் பரிந்துரை',
      scoreLabel: 'பொருத்த மதிப்பெண்',
    },
    te: {
      chooseAnyProduct: 'ఏదైనా ఉత్పత్తిని ఎంచుకోండి (కూరగాయలు, పండ్లు, పంటలు)',
      weatherSuitableToggle: 'వాతావరణానికి సరిపోయే ఉత్పత్తులను మాత్రమే చూపించు',
      weatherSuitableActive: `ప్రస్తుత ${weatherData?.current?.temperature ?? 28}°C వాతావరణానికి అనువైన ${filteredCrops.length} ఉత్పత్తులు చూపబడుతున్నాయి`,
      weatherSuitableAll: `మొత్తం ${uniqueAvailableCrops.length} ఉత్పత్తులు`,
      suitabilityHeader: 'వాతావరణం & శీతోష్ణస్థితి అనుకూలత విశ్లేషణ',
      whySuitableTitle: 'ఈ ఉత్పత్తి ఈ వాతావరణానికి ఎందుకు అనుకూలంగా ఉంది?',
      climateLabel: 'అనువైన శీతోష్ణస్థితి',
      weatherFitLabel: 'ప్రత్యక్ష వాతావరణం సరిపోలిక',
      optimalTemp: 'సరైన ఉష్ణోగ్రత',
      recommendedActionLabel: 'వ్యవసాయ సిఫార్సు',
      scoreLabel: 'అనుకూలత స్కోరు',
    },
    kn: {
      chooseAnyProduct: 'ಯಾವುದೇ ಉತ್ಪನ್ನವನ್ನು ಆರಿಸಿ (ತರಕಾರಿಗಳು, ಹಣ್ಣುಗಳು, ಬೆಳೆಗಳು)',
      weatherSuitableToggle: 'ಪ್ರಸ್ತುತ ಹವಾಮಾನಕ್ಕೆ ಸೂಕ್ತವಾದ ಉತ್ಪನ್ನಗಳನ್ನು ಮಾತ್ರ ತೋರಿಸಿ',
      weatherSuitableActive: `ಪ್ರಸ್ತುತ ${weatherData?.current?.temperature ?? 28}°C ಹವಾಮಾನಕ್ಕೆ ಸೂಕ್ತವಾದ ${filteredCrops.length} ಉತ್ಪನ್ನಗಳು`,
      weatherSuitableAll: `ಎಲ್ಲಾ ${uniqueAvailableCrops.length} ಉತ್ಪನ್ನಗಳು`,
      suitabilityHeader: 'ಹವಾಮಾನ ಮತ್ತು ವಾಯುಗುಣ ಸೂಕ್ತತೆಯ ಮೌಲ್ಯಮಾಪನ',
      whySuitableTitle: 'ಈ ಉತ್ಪನ್ನವು ಈ ಹವಾಮಾನಕ್ಕೆ ಏಕೆ ಸೂಕ್ತವಾಗಿದೆ?',
      climateLabel: 'ಸೂಕ್ತ ವಾಯುಗುಣ',
      weatherFitLabel: 'ಲೈವ್ ಹವಾಮಾನ ಹೊಂದಾಣಿಕೆ',
      optimalTemp: 'ಅತ್ಯುತ್ತಮ ತಾಪಮಾನ',
      recommendedActionLabel: 'ಕೃಷಿ ಶಿಫಾರಸು',
      scoreLabel: 'ಸೂಕ್ತತೆಯ ಅಂಕ',
    },
    pa: {
      chooseAnyProduct: 'ਕੋਈ ਵੀ ਉਤਪਾਦ ਚੁਣੋ (ਸਬਜ਼ੀਆਂ, ਫਲ, ਫਸਲਾਂ)',
      weatherSuitableToggle: 'ਸਿਰਫ਼ ਮੌਸਮ-ਅਨੁਕੂਲ ਉਤਪਾਦ ਦਿਖਾਓ',
      weatherSuitableActive: `ਮੌਜੂਦਾ ${weatherData?.current?.temperature ?? 28}°C ਮੌਸਮ ਅਨੁਸਾਰ ${filteredCrops.length} ਉਤਪਾਦ`,
      weatherSuitableAll: `ਸਾਰੇ ${uniqueAvailableCrops.length} ਉਤਪਾਦ`,
      suitabilityHeader: 'ਮੌਸਮ ਅਤੇ ਜਲਵਾਯੂ ਅਨੁਕੂਲਤਾ ਜਾਂਚ',
      whySuitableTitle: 'ਇਹ ਉਤਪਾਦ ਇਸ ਜਲਵਾਯੂ ਲਈ ਕਿਉਂ ਢੁਕਵਾਂ ਹੈ?',
      climateLabel: 'ਅਨੁਕੂਲ ਜਲਵਾਯੂ',
      weatherFitLabel: 'ਲਾਈਵ ਮੌਸਮ ਮੇਲ',
      optimalTemp: 'ਅਨੁਕੂਲ ਤਾਪਮਾਨ',
      recommendedActionLabel: 'ਖੇਤੀਬਾੜੀ ਸਿਫਾਰਸ਼',
      scoreLabel: 'ਅਨੁਕੂਲਤਾ ਸਕੋਰ',
    },
    es: {
      chooseAnyProduct: 'Elija cualquier producto (Verduras, Frutas, Cultivos)',
      weatherSuitableToggle: 'Mostrar solo productos aptos para el clima actual',
      weatherSuitableActive: `Mostrando ${filteredCrops.length} productos aptos para el clima actual (${weatherData?.current?.temperature ?? 28}°C)`,
      weatherSuitableAll: `Mostrando los ${uniqueAvailableCrops.length} productos`,
      suitabilityHeader: 'Evaluación de Idoneidad Climática y Meteorológica',
      whySuitableTitle: '¿Por qué este producto es adecuado para este clima?',
      climateLabel: 'Clima Apto',
      weatherFitLabel: 'Ajuste Meteorológico',
      optimalTemp: 'Temp. Óptima',
      recommendedActionLabel: 'Recomendación Agrícola',
      scoreLabel: 'Puntaje de Idoneidad',
    },
  }[language] || {
    chooseAnyProduct: 'Choose Any Product Example (Vegetables, Fruits, Crops)',
    weatherSuitableToggle: 'Show Weather-Suitable Products Only',
    weatherSuitableActive: `Showing ${filteredCrops.length} products suitable for current ${weatherData?.current?.temperature ?? 28}°C weather & climate`,
    weatherSuitableAll: `Showing all ${uniqueAvailableCrops.length} catalog products`,
    suitabilityHeader: 'Weather & Climate Suitability Assessment',
    whySuitableTitle: 'Why This Product Is Suitable For This Climate & Weather',
    climateLabel: 'Suitable Climate',
    weatherFitLabel: 'Live Weather Match',
    optimalTemp: 'Optimal Temp',
    recommendedActionLabel: 'Agricultural Recommendation',
    scoreLabel: 'Suitability Score',
  };

  return (
    <div
      id="crop-selection-card"
      className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 shadow-xs space-y-5"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
            <Sprout className="w-5 h-5" />
          </span>
          <div>
            <h3 className="text-base font-bold text-stone-950 tracking-tight">
              {t.cropAndFarmInfo || 'Crop & Farm Information'}
            </h3>
            <p className="text-xs text-stone-500">
              {t.cropAndFarmInfoSubtitle ||
                'Select your crop, fruit, or vegetable; check climate suitability; and manage growth stages'}
            </p>
          </div>
        </div>

        {/* Days After Planting Chip & Weather Fit summary */}
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>
              {dap >= 0
                ? `${dap} ${t.daysAfterPlantingLabel || 'Days After Planting (DAP)'}`
                : `${Math.abs(dap)} ${t.daysBeforeSowingLabel || 'Days Before Sowing'}`}
            </span>
          </div>
        </div>
      </div>

      {/* FEATURE 1: CHOOSE ANY PRODUCT EXAMPLES (Vegetables, Fruits, Field Crops) */}
      <div className="p-4 rounded-xl bg-stone-50/80 border border-stone-200 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CloudSun className="w-4 h-4 text-emerald-700" />
            <span className="text-xs font-bold text-stone-900 uppercase tracking-wide">
              {uiLabels.chooseAnyProduct}
            </span>
          </div>

          {/* Toggle: Weather Suitable Only */}
          <button
            id="toggle-weather-suitable-crops-btn"
            type="button"
            onClick={() => setWeatherSuitableOnly(!weatherSuitableOnly)}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer shadow-2xs ${
              weatherSuitableOnly
                ? 'bg-emerald-700 text-white border-emerald-800 ring-2 ring-emerald-400/40'
                : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-100'
            }`}
          >
            <ShieldCheck className={`w-3.5 h-3.5 ${weatherSuitableOnly ? 'text-emerald-200' : 'text-stone-500'}`} />
            <span>{uiLabels.weatherSuitableToggle}</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full font-extrabold ${
                weatherSuitableOnly ? 'bg-emerald-900 text-emerald-100' : 'bg-stone-200 text-stone-700'
              }`}
            >
              {suitableCropsCount}
            </span>
          </button>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategoryFilter === cat;
            const label = categoryDict[cat] || cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategoryFilter(cat)}
                className={`text-xs px-2.5 py-1 rounded-lg border transition-colors cursor-pointer font-medium ${
                  isSelected
                    ? 'bg-emerald-800 text-white border-emerald-900 font-semibold shadow-2xs'
                    : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Quick Pick Example Product Chips */}
        <div className="pt-2 border-t border-stone-200/70">
          <div className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-2">
            Quick Pick Examples:
          </div>
          <div className="flex flex-wrap gap-2">
            {QUICK_PRODUCT_EXAMPLES.map((ex) => {
              const isSelected = selection.cropId === ex.id || selection.cropName.toLowerCase() === ex.name.toLowerCase();
              const suit = cropSuitabilityMap.get(ex.id);
              const isSuitable = suit ? suit.isSuitable : true;

              // If weatherSuitableOnly is active and this example is not suitable, dim or mark it
              if (weatherSuitableOnly && !isSuitable) {
                return null;
              }

              return (
                <button
                  key={ex.id}
                  type="button"
                  onClick={() => handleSelectExample(ex)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-emerald-700 text-white border-emerald-800 shadow-xs ring-2 ring-emerald-500/30'
                      : 'bg-white text-stone-800 border-stone-200 hover:border-emerald-400 hover:bg-emerald-50/50'
                  }`}
                >
                  <span>{ex.icon}</span>
                  <span>{ex.name}</span>
                  <span
                    className={`text-[9px] px-1 py-0.2 rounded font-mono uppercase ${
                      isSelected
                        ? 'bg-emerald-800 text-emerald-100'
                        : isSuitable
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-stone-100 text-stone-500'
                    }`}
                  >
                    {isSuitable ? '✓' : '•'}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="text-[11px] text-stone-500 mt-2">
            {weatherSuitableOnly ? uiLabels.weatherSuitableActive : uiLabels.weatherSuitableAll}
          </div>
        </div>
      </div>

      {/* FEATURE 2: EXPLICIT WEATHER & CLIMATE SUITABILITY INFORMATION BANNER */}
      {currentSuitability && (
        <div
          id="product-weather-climate-suitability-banner"
          className={`p-4 rounded-xl border transition-all space-y-3 ${
            currentSuitability.score >= 80
              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
              : currentSuitability.score >= 55
              ? 'bg-teal-50/70 border-teal-200 text-teal-950'
              : currentSuitability.score >= 35
              ? 'bg-amber-50/70 border-amber-200 text-amber-950'
              : 'bg-rose-50/70 border-rose-200 text-rose-950'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-black/5 pb-2">
            <div className="flex items-center gap-2">
              {currentSuitability.isSuitable ? (
                <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0" />
              )}
              <div>
                <span className="text-xs font-bold uppercase tracking-wider block">
                  {uiLabels.suitabilityHeader}
                </span>
                <span className="text-sm font-extrabold">
                  {currentSuitability.verdictLabel} ({selection.cropName})
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-white/80 border border-black/10 shadow-2xs">
                {uiLabels.scoreLabel}: <strong>{currentSuitability.score}/100</strong>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {/* Weather Match Explanation */}
            <div className="p-3 bg-white/80 rounded-xl border border-black/5 space-y-1">
              <div className="font-bold text-stone-800 flex items-center gap-1.5">
                <Thermometer className="w-3.5 h-3.5 text-rose-600" />
                <span>{uiLabels.weatherFitLabel}</span>
              </div>
              <p className="text-stone-700 leading-relaxed">
                {currentSuitability.weatherSuitabilityReason}
              </p>
              <div className="text-[11px] text-stone-500 pt-1">
                {currentSuitability.temperatureFitSummary}
              </div>
            </div>

            {/* Climate Suitability Explanation */}
            <div className="p-3 bg-white/80 rounded-xl border border-black/5 space-y-1">
              <div className="font-bold text-stone-800 flex items-center gap-1.5">
                <CloudSun className="w-3.5 h-3.5 text-emerald-600" />
                <span>{uiLabels.climateLabel}</span>
              </div>
              <p className="text-stone-700 leading-relaxed">
                {currentSuitability.climateSuitabilityReason}
              </p>
              <div className="text-[11px] text-stone-500 pt-1">
                {uiLabels.optimalTemp}: <strong className="text-stone-700">{currentSuitability.optimalTemperatureText}</strong>
              </div>
            </div>
          </div>

          {/* Explicit statement informing the farmer why it is suitable */}
          <div className="p-3 bg-white/90 rounded-xl border border-black/5 space-y-1">
            <div className="font-bold text-stone-900 flex items-center gap-1.5 text-xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{uiLabels.whySuitableTitle}</span>
            </div>
            <p className="text-xs text-stone-800 leading-relaxed font-normal">
              {currentSuitability.recommendedAction}
            </p>
          </div>
        </div>
      )}

      {/* Form Fields Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 1. Crop Selection Dropdown */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-stone-700 uppercase tracking-wide flex items-center justify-between">
            <span>{t.cropFruitVegetable || 'Crop / Fruit / Vegetable'}</span>
            <button
              type="button"
              onClick={() => setIsCustomCrop(!isCustomCrop)}
              className="text-[11px] text-emerald-700 hover:text-emerald-800 font-medium cursor-pointer"
            >
              {isCustomCrop ? 'Choose from list' : '+ Enter custom crop'}
            </button>
          </label>

          {isCustomCrop ? (
            <div className="flex items-center gap-1.5">
              <input
                id="custom-crop-input"
                type="text"
                value={customCropName}
                onChange={(e) => setCustomCropName(e.target.value)}
                placeholder="e.g. Mustard, Pomegranate, Chili"
                className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
              />
              <button
                type="button"
                onClick={handleCustomSubmit}
                className="px-3 py-2 bg-emerald-700 text-white rounded-xl text-xs font-semibold hover:bg-emerald-800 shrink-0 cursor-pointer"
              >
                Apply
              </button>
            </div>
          ) : (
            <div className="relative">
              <select
                id="crop-select-dropdown"
                value={selection.cropId}
                onChange={(e) => handleCatalogCropChange(e.target.value)}
                className="w-full appearance-none text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 pr-9 font-medium"
              >
                {filteredCrops.map((c) => {
                  const suit = cropSuitabilityMap.get(c.id);
                  const isMatch = suit?.isSuitable;
                  return (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.category}) {isMatch ? '✓ Weather Fit' : ''}
                    </option>
                  );
                })}
              </select>
              <ChevronDown className="w-4 h-4 text-stone-400 absolute right-3 top-3 pointer-events-none" />
            </div>
          )}
        </div>

        {/* 2. Crop Category / Type */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-stone-700 uppercase tracking-wide">
            {t.cropTypeCategory || 'Crop Type / Category'}
          </label>
          <div className="relative">
            <select
              id="crop-category-select"
              value={selection.category}
              onChange={(e) =>
                onSelectionChange({
                  ...selection,
                  category: e.target.value as CropCategory,
                })
              }
              className="w-full appearance-none text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 pr-9"
            >
              {CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                <option key={cat} value={cat}>
                  {categoryDict[cat] || cat}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-stone-400 absolute right-3 top-3 pointer-events-none" />
          </div>
        </div>

        {/* 3. Location with Live Location Feature */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-stone-700 uppercase tracking-wide flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-700" />
              <span>{t.locationLabel || 'Farm Location'}</span>
            </label>
            <button
              id="crop-use-live-location-btn"
              type="button"
              onClick={handleGetLiveLocation}
              disabled={isLocating}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 active:bg-emerald-200 border border-emerald-300/80 rounded-lg cursor-pointer transition-colors disabled:opacity-60"
              title={t.useLiveLocation || 'Use Live Location (GPS)'}
            >
              {isLocating ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin text-emerald-700" />
                  <span>{t.locating || 'Locating...'}</span>
                </>
              ) : (
                <>
                  <Navigation className="w-3 h-3 text-emerald-700 fill-emerald-600/20" />
                  <span>{t.useLiveLocation || 'Live Location (GPS)'}</span>
                </>
              )}
            </button>
          </div>
          <div className="relative">
            <input
              id="farm-location-input"
              type="text"
              value={selection.location}
              onChange={(e) => {
                setLiveLocationInfo(null);
                onSelectionChange({
                  ...selection,
                  location: e.target.value,
                });
              }}
              placeholder="e.g. Pune, Maharashtra or Village, District"
              className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-stone-900 bg-white"
            />
          </div>

          {/* Live location feedback confirmation */}
          {liveLocationInfo && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="font-semibold">{t.liveLocation || 'Live Location'}:</span>
              <span className="truncate">{liveLocationInfo.text}</span>
              {liveLocationInfo.coords && (
                <span className="text-emerald-600/90 text-[10px] ml-auto shrink-0 font-mono">
                  {liveLocationInfo.coords}
                </span>
              )}
            </div>
          )}

          {locationError && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-amber-50 border border-amber-200 text-[11px] text-amber-800">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>{locationError}</span>
            </div>
          )}
        </div>

        {/* 4. Soil Type */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-stone-700 uppercase tracking-wide flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-stone-500" />
            <span>{t.soilTypeLabel || 'Soil Type'}</span>
          </label>
          <div className="relative">
            <select
              id="soil-type-select"
              value={selection.soilType}
              onChange={(e) =>
                onSelectionChange({
                  ...selection,
                  soilType: e.target.value as SoilType,
                })
              }
              className="w-full appearance-none text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 pr-9"
            >
              {SOIL_TYPES.map((st) => (
                <option key={st} value={st}>
                  {st} Soil
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-stone-400 absolute right-3 top-3 pointer-events-none" />
          </div>
        </div>

        {/* 5. Planting Date */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-stone-700 uppercase tracking-wide flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-stone-500" />
            <span>{t.plantingSowingDate || 'Planting / Sowing Date'}</span>
          </label>
          <input
            id="planting-date-input"
            type="date"
            value={selection.plantingDate}
            onChange={(e) => {
              const newDate = e.target.value;
              onSelectionChange({
                ...selection,
                plantingDate: newDate,
              });
            }}
            className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
          />
        </div>

        {/* 6. Current Growth Stage with Auto-Calculate button */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-stone-700 uppercase tracking-wide">
              {t.growthStageLabel || 'Current Growth Stage'}
            </label>
            <button
              type="button"
              onClick={handleAutoCalculateStage}
              className="text-[11px] text-emerald-700 hover:text-emerald-800 font-semibold cursor-pointer flex items-center gap-1"
              title={t.autoCalculateStage || 'Calculate stage from planting date'}
            >
              <Calculator className="w-3 h-3" />
              <span>{t.autoCalculateStage || 'Auto-calc'}</span>
            </button>
          </div>
          <div className="relative">
            <select
              id="growth-stage-select"
              value={selection.currentGrowthStage}
              onChange={(e) =>
                onSelectionChange({
                  ...selection,
                  currentGrowthStage: e.target.value as LifeCycleStageName,
                })
              }
              className="w-full appearance-none text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-emerald-300 bg-emerald-50/40 text-emerald-950 font-bold focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 pr-9"
            >
              {ALL_GROWTH_STAGES.map((stg, idx) => (
                <option key={stg} value={stg}>
                  {idx + 1}. {stg}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-emerald-700 absolute right-3 top-3 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Soil Moisture Field with Quick Feel-and-Appearance Guide */}
      <div className="pt-2 border-t border-stone-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Droplets className="w-4 h-4 text-sky-600" />
            <span className="text-xs font-bold text-stone-700 uppercase tracking-wide">
              Current Soil Moisture (Optional field observation)
            </span>
            <button
              type="button"
              onClick={() => setShowMoistureGuide(!showMoistureGuide)}
              className="text-stone-400 hover:text-stone-600 cursor-pointer"
              title="How to test soil moisture"
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {(['Dry Topsoil', 'Adequately Moist', 'Wet / Saturated', 'Unknown'] as const).map(
              (opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() =>
                    onSelectionChange({
                      ...selection,
                      soilMoistureStatus: opt,
                    })
                  }
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                    selection.soilMoistureStatus === opt
                      ? 'bg-sky-700 text-white border-sky-800 font-semibold shadow-xs'
                      : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  {opt}
                </button>
              )
            )}
          </div>
        </div>

        {/* Moisture Test Guide Dropdown */}
        {showMoistureGuide && (
          <div className="mt-3 p-3.5 bg-sky-50/70 border border-sky-200 rounded-xl text-xs text-sky-950 space-y-1">
            <div className="font-bold text-sky-900">How to test soil moisture in the field:</div>
            <p>
              Dig 10-15 cm into the root zone. Take a handful of soil and squeeze firmly in your palm.
            </p>
            <ul className="list-disc list-inside space-y-0.5 text-sky-900 pt-0.5">
              <li>
                <strong>Dry Topsoil:</strong> Soil crumbles loosely and will not hold a ball shape.
              </li>
              <li>
                <strong>Adequately Moist:</strong> Soil forms a ball that holds together without free water dripping.
              </li>
              <li>
                <strong>Wet / Saturated:</strong> Free water leaves a glossy sheen or mud drips from your fingers.
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
