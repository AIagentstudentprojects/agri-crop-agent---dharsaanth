import React from 'react';
import {
  Droplets,
  CalendarCheck,
  TrendingUp,
  TrendingDown,
  CloudRain,
  AlertCircle,
  Clock,
  Layers,
  HelpCircle,
  CheckCircle2,
} from 'lucide-react';
import {
  CropProfile,
  StageInformation,
  SoilType,
  WeatherData,
} from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { getLocalizedStageAdvisory } from '../../utils/localizedAdvisoryEngine';

interface Props {
  crop: CropProfile;
  currentStage: StageInformation;
  soilType: SoilType;
  soilMoistureStatus?: 'Dry Topsoil' | 'Adequately Moist' | 'Wet / Saturated' | 'Unknown';
  weatherData: WeatherData | null;
  onCheckMoistureGuidance?: () => void;
}

export const StageIrrigationAdvisoryCard: React.FC<Props> = ({
  crop,
  currentStage,
  soilType,
  soilMoistureStatus = 'Unknown',
  weatherData,
}) => {
  const { language } = useLanguage();

  // Weather metrics
  const temp = weatherData?.current?.temperature ?? 28;
  const humidity = weatherData?.current?.relativeHumidity ?? 60;
  const wind = weatherData?.current?.windSpeed ?? 10;
  const recentRain = weatherData?.current?.precipitation ?? 0;

  // Upcoming 3-day forecast rain
  const upcomingRainSum = weatherData?.forecast
    ? weatherData.forecast.slice(0, 3).reduce((acc, d) => acc + (d.precipitationSum || 0), 0)
    : 0;
  const maxRainProb = weatherData?.forecast
    ? Math.max(...weatherData.forecast.slice(0, 3).map((d) => d.precipitationProbability || 0))
    : 0;

  const stageName = currentStage.stageName;
  const isMaturityOrHarvest = stageName === 'Maturity' || stageName === 'Harvest';
  const hasSubstantialRain = upcomingRainSum >= 5.0 || maxRainProb >= 50;

  // Evaluate status
  let status: 'IRRIGATE_NOW' | 'POSTPONE' | 'ADEQUATE_MOISTURE' | 'MONITOR_SOIL' = 'MONITOR_SOIL';
  let statusBadgeColor = 'bg-amber-100 text-amber-900 border-amber-300';

  if (isMaturityOrHarvest) {
    status = 'ADEQUATE_MOISTURE';
    statusBadgeColor = 'bg-stone-100 text-stone-800 border-stone-300';
  } else if (hasSubstantialRain) {
    status = 'POSTPONE';
    statusBadgeColor = 'bg-blue-100 text-blue-900 border-blue-300';
  } else if (soilMoistureStatus === 'Wet / Saturated') {
    status = 'ADEQUATE_MOISTURE';
    statusBadgeColor = 'bg-emerald-100 text-emerald-900 border-emerald-300';
  } else if (
    soilMoistureStatus === 'Dry Topsoil' ||
    (temp >= 32 && !hasSubstantialRain && currentStage.isMoistureCritical)
  ) {
    status = 'IRRIGATE_NOW';
    statusBadgeColor = 'bg-emerald-600 text-white border-emerald-700';
  } else {
    status = 'MONITOR_SOIL';
    statusBadgeColor = 'bg-amber-100 text-amber-900 border-amber-300';
  }

  // Get localized comprehensive stage advisory
  const locAdvisory = getLocalizedStageAdvisory(
    crop.name,
    stageName,
    soilType,
    status,
    upcomingRainSum,
    maxRainProb,
    temp,
    language
  );

  // Localized UI helper titles
  const sectionLabels = {
    en: {
      cardTitle: 'Stage-Specific Water & Irrigation Guidance',
      calibratedFor: `Calibrated for ${crop.name} • ${stageName} • ${soilType} Soil`,
      criticalAlert: 'Critical Moisture-Sensitive Stage:',
      rationaleTitle: 'Irrigation Decision & Scientific Rationale',
      whenNeededTitle: 'When Irrigation May Be Needed',
      whenCheckTitle: 'When & How Soil Moisture Should Be Checked',
      postponeTitle: 'Postponement Mandate: Rain In Forecast',
      postponeDesc: `Expected 3-day rainfall of ${upcomingRainSum.toFixed(1)} mm (up to ${maxRainProb}% probability) will provide natural root moisture. Postponing artificial pumping prevents waterlogging, protects against nitrogen fertilizer wash-off, and saves irrigation fuel/electricity.`,
      increasingTitle: locAdvisory.weatherFactorsTitle,
      reducingTitle: locAdvisory.weatherConservingTitle,
      soilDynamicsTitle: `Soil Profile Dynamics (${soilType} Soil)`,
      agriRuleNote: 'Agricultural Rule: Recommendations are based on root-zone wetting depths and atmospheric evapotranspiration rather than arbitrary water quantities.',
    },
    hi: {
      cardTitle: 'फसल अवस्था आधारित जल एवं सिंचाई मार्गदर्शन',
      calibratedFor: `${crop.name} • ${stageName} • ${soilType} मिट्टी के अनुसार गणना`,
      criticalAlert: 'जल-संवेदनशील महत्वपूर्ण अवस्था:',
      rationaleTitle: 'सिंचाई निर्णय एवं वैज्ञानिक कारण',
      whenNeededTitle: 'सिंचाई की आवश्यकता कब होगी?',
      whenCheckTitle: 'मृदा नमी कब और कैसे जांचें?',
      postponeTitle: 'सिंचाई स्थगन आदेश: बारिश का पूर्वानुमान',
      postponeDesc: `अगले 3 दिनों में ${upcomingRainSum.toFixed(1)} मिमी बारिश (अधिकतम ${maxRainProb}% संभावना) से प्राकृतिक नमी मिलेगी। सिंचाई टालने से जलभराव और खाद का क्षरण रुकेगा।`,
      increasingTitle: locAdvisory.weatherFactorsTitle,
      reducingTitle: locAdvisory.weatherConservingTitle,
      soilDynamicsTitle: `मृदा संरचना व्यवहार (${soilType} मिट्टी)`,
      agriRuleNote: 'कृषि नियम: सिफारिशें जड़-क्षेत्र की नमी गहराई और वाष्पोत्सर्जन पर आधारित हैं।',
    },
    ta: {
      cardTitle: 'பயிர் வளர்ச்சி நிலை சார்ந்த நீர் & பாசன வழிகாட்டுதல்',
      calibratedFor: `${crop.name} • ${stageName} • ${soilType} மண் சூழலுக்கு ஏற்ப`,
      criticalAlert: 'முக்கிய நீர்-தேவை நிலை:',
      rationaleTitle: 'பாசன முடிவும் அறிவியல் காரணமும்',
      whenNeededTitle: 'எப்போது பாசனம் தேவைப்படலாம்?',
      whenCheckTitle: 'மண் ஈரப்பதத்தை எப்போது எப்படி சரிபார்ப்பது?',
      postponeTitle: 'பாசனம் ஒத்திவைப்பு: மழை முன்னறிவிப்பு',
      postponeDesc: `அடுத்த 3 நாட்களில் எதிர்பார்க்கப்படும் ${upcomingRainSum.toFixed(1)} மி.மீ மழை (${maxRainProb}% வாய்ப்பு) இயற்கை ஈரப்பதத்தை வழங்கும். பாசனத்தை ஒத்திவைப்பது பயிரையும் உரத்தையும் பாதுகாக்கும்.`,
      increasingTitle: locAdvisory.weatherFactorsTitle,
      reducingTitle: locAdvisory.weatherConservingTitle,
      soilDynamicsTitle: `மண் தன்மையும் நீர் மேலாண்மையும் (${soilType} மண்)`,
      agriRuleNote: 'விவசாய விதி: பயிரின் வேர் பகுதி ஈரப்பதம் மற்றும் வானிலை காரணிகளை அடிப்படையாகக் கொண்டு பரிந்துரைக்கப்படுகிறது.',
    },
    te: {
      cardTitle: 'దశల వారీ నీటిపారుదల & యాజమాన్య సూచనలు',
      calibratedFor: `${crop.name} • ${stageName} • ${soilType} నేల ఆధారంగా`,
      criticalAlert: 'నీటి కొరత ప్రభావం చూపే కీలక దశ:',
      rationaleTitle: 'నీటిపారుదల నిర్ణయం & శాస్త్రీయ కారణం',
      whenNeededTitle: 'ఎప్పుడు నీరు పెట్టాలి?',
      whenCheckTitle: 'నేలలో తేమను ఎప్పుడు, ఎలా పరీక్షించాలి?',
      postponeTitle: 'నీటిపారుదల వాయిదా: వర్ష సూచన',
      postponeDesc: `రాబోయే 3 రోజుల్లో ${upcomingRainSum.toFixed(1)} మి.మీ వర్షం (${maxRainProb}% అవకాశం) తేమను సమకూరుస్తుంది. కృత్రిమ నీటిపారుదల వాయిదా వేయండి.`,
      increasingTitle: locAdvisory.weatherFactorsTitle,
      reducingTitle: locAdvisory.weatherConservingTitle,
      soilDynamicsTitle: `నేల లక్షణాలు (${soilType} నేల)`,
      agriRuleNote: 'వ్యవసాయ నియమం: సిఫార్సులు వేరు మండల తేమ మరియు వాతావరణంపై ఆధారపడి ఉంటాయి.',
    },
    kn: {
      cardTitle: 'ಹಂತ-ನಿರ್ದಿಷ್ಟ ನೀರಾವರಿ ಮಾರ್ಗದರ್ಶನ',
      calibratedFor: `${crop.name} • ${stageName} • ${soilType} ಮಣ್ಣಿಗೆ ಅನುಗುಣವಾಗಿ`,
      criticalAlert: 'ತೇವಾಂಶ ಸೂಕ್ಷ್ಮ ನಿರ್ಣಾಯಕ ಹಂತ:',
      rationaleTitle: 'ನೀರಾವರಿ ನಿರ್ಧಾರ ಮತ್ತು ವೈಜ್ಞಾನಿಕ ಸಮರ್ಥನೆ',
      whenNeededTitle: 'ನೀರಾವರಿ ಯಾವಾಗ ಬೇಕಾಗಬಹುದು?',
      whenCheckTitle: 'ಮಣ್ಣಿನ ತೇವಾಂಶವನ್ನು ಯಾವಾಗ ಮತ್ತು ಹೇಗೆ ಪರೀಕ್ಷಿಸಬೇಕು?',
      postponeTitle: 'ನೀರಾವರಿ ಮುಂದೂಡಿಕೆ: ಮಳೆಯ ಮುನ್ಸೂಚನೆ',
      postponeDesc: `ಮುಂದಿನ 3 ದಿನಗಳಲ್ಲಿ ನಿರೀಕ್ಷಿತ ${upcomingRainSum.toFixed(1)} ಮಿಮೀ ಮಳೆ ನೈಸರ್ಗಿಕ ತೇವಾಂಶವನ್ನು ನೀಡುತ್ತದೆ.`,
      increasingTitle: locAdvisory.weatherFactorsTitle,
      reducingTitle: locAdvisory.weatherConservingTitle,
      soilDynamicsTitle: `ಮಣ್ಣಿನ ಗುಣಲಕ್ಷಣ (${soilType} ಮಣ್ಣು)`,
      agriRuleNote: 'ಕೃಷಿ ನಿಯಮ: ಶಿಫಾರಸುಗಳು ಬೇರಿನ ತೇವಾಂಶ ಆಳವನ್ನು ಆಧರಿಸಿವೆ.',
    },
    pa: {
      cardTitle: 'ਫਸਲ ਅਵਸਥਾ ਅਨੁਸਾਰ ਸਿੰਚਾਈ ਮਾਰਗਦਰਸ਼ਨ',
      calibratedFor: `${crop.name} • ${stageName} • ${soilType} ਮਿੱਟੀ ਅਨੁਸਾਰ`,
      criticalAlert: 'ਪਾਣੀ ਦੀ ਮੰਗ ਵਾਲੀ ਅਹਿਮ ਅਵਸਥਾ:',
      rationaleTitle: 'ਸਿੰਚਾਈ ਦਾ ਫੈਸਲਾ ਅਤੇ ਵਿਗਿਆਨਕ ਆਧਾਰ',
      whenNeededTitle: 'ਸਿੰਚਾਈ ਕਦੋਂ ਕਰਨੀ ਚਾਹੀਦੀ ਹੈ?',
      whenCheckTitle: 'ਮਿੱਟੀ ਦੀ ਨਮੀ ਦੀ ਜਾਂਚ ਕਦੋਂ ਅਤੇ ਕਿਵੇਂ ਕਰੀਏ?',
      postponeTitle: 'ਸਿੰਚਾਈ ਰੋਕੋ: ਮੀਂਹ ਦਾ ਅਨੁਮਾਨ',
      postponeDesc: `ਅਗਲੇ 3 ਦਿਨਾਂ ਵਿੱਚ ${upcomingRainSum.toFixed(1)} ਮਿਲੀਮੀਟਰ ਮੀਂਹ ਪੈਣ ਦਾ ਅਨੁਮਾਨ ਹੈ। ਪਾਣੀ ਲਾਉਣਾ ਮੁਲਤਵੀ ਕਰੋ।`,
      increasingTitle: locAdvisory.weatherFactorsTitle,
      reducingTitle: locAdvisory.weatherConservingTitle,
      soilDynamicsTitle: `ਮਿੱਟੀ ਦੀ ਬਣਤਰ (${soilType} ਮਿੱਟੀ)`,
      agriRuleNote: 'ਖੇਤੀਬਾੜੀ ਨਿਯਮ: ਸਿਫਾਰਸ਼ਾਂ ਜੜ੍ਹ ਖੇਤਰ ਦੀ ਨਮੀ ਉੱਤੇ ਅਧਾਰਤ ਹਨ।',
    },
    es: {
      cardTitle: 'Orientación de Riego por Etapa de Crecimiento',
      calibratedFor: `Calibrado para ${crop.name} • ${stageName} • Suelo ${soilType}`,
      criticalAlert: 'Etapa Crítica Sensible al Agua:',
      rationaleTitle: 'Decisión de Riego y Justificación Científica',
      whenNeededTitle: '¿Cuándo se necesita riego?',
      whenCheckTitle: '¿Cuándo y cómo comprobar la humedad del suelo?',
      postponeTitle: 'Mandato de Posposición: Lluvia Pronosticada',
      postponeDesc: `Se pronostican ${upcomingRainSum.toFixed(1)} mm de lluvia en 3 días. Posponer el riego evita asfixia radicular.`,
      increasingTitle: locAdvisory.weatherFactorsTitle,
      reducingTitle: locAdvisory.weatherConservingTitle,
      soilDynamicsTitle: `Dinámica del Perfil del Suelo (${soilType})`,
      agriRuleNote: 'Regla agrícola: Recomendaciones basadas en profundidad radicular y evapotranspiración.',
    },
  }[language] || {
    cardTitle: 'Stage-Specific Water & Irrigation Guidance',
    calibratedFor: `Calibrated for ${crop.name} • ${stageName} • ${soilType} Soil`,
    criticalAlert: 'Critical Moisture-Sensitive Stage:',
    rationaleTitle: 'Irrigation Decision & Scientific Rationale',
    whenNeededTitle: 'When Irrigation May Be Needed',
    whenCheckTitle: 'When & How Soil Moisture Should Be Checked',
    postponeTitle: 'Postponement Mandate: Rain In Forecast',
    postponeDesc: `Expected 3-day rainfall of ${upcomingRainSum.toFixed(1)} mm (up to ${maxRainProb}% probability) will provide natural root moisture.`,
    increasingTitle: locAdvisory.weatherFactorsTitle,
    reducingTitle: locAdvisory.weatherConservingTitle,
    soilDynamicsTitle: `Soil Profile Dynamics (${soilType} Soil)`,
    agriRuleNote: 'Agricultural Rule: Recommendations are based on root-zone wetting depths.',
  };

  // Weather conditions that increase needs
  const conditionsIncreasingNeeds = [
    `${temp}°C - Elevated daytime temperature accelerates evapotranspiration`,
    humidity < 50
      ? `${humidity}% - Low relative humidity accelerates leaf moisture transpiration`
      : 'Midday solar radiation drives continuous vegetative water consumption',
    wind > 15
      ? `${wind} km/h - Elevated wind speed causes rapid topsoil and canopy desiccation`
      : 'Active root absorption during physiological growth phases',
    currentStage.isMoistureCritical
      ? `${stageName} - Critical moisture-demanding developmental window`
      : 'Biomass expansion and cellular turgor maintenance',
  ];

  // Weather conditions that reduce needs
  const conditionsReducingNeeds = [
    humidity >= 70
      ? `${humidity}% - High relative humidity dampens transpiration demand`
      : 'Cloud cover and moderate solar radiation buffer leaf temperature',
    recentRain > 0
      ? `${recentRain} mm - Recent rainfall replenished active root zone moisture`
      : 'Overnight cooling minimizes dark-period moisture dissipation',
    upcomingRainSum > 0
      ? `${upcomingRainSum.toFixed(1)} mm - Forecast precipitation expected to recharge soil`
      : 'Conservation mulch and soil capillary retention',
    isMaturityOrHarvest
      ? 'Senescence phase: crop naturally halts vegetative water uptake'
      : 'Deep rooting structure accessing residual moisture',
  ];

  return (
    <div
      id="stage-water-irrigation-card"
      className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 shadow-xs space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-sky-100 text-sky-800">
              <Droplets className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-stone-950 tracking-tight">
                {sectionLabels.cardTitle}
              </h3>
              <p className="text-xs text-stone-500">{sectionLabels.calibratedFor}</p>
            </div>
          </div>
        </div>

        {/* Current status pill */}
        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-bold px-3 py-1.5 rounded-full border ${statusBadgeColor} tracking-wide`}
          >
            {locAdvisory.statusTitle}
          </span>
        </div>
      </div>

      {/* Stage Moisture Criticality Alert Banner */}
      {currentStage.isMoistureCritical && (
        <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-950">
          <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-amber-900">{sectionLabels.criticalAlert} </span>
            <span>{currentStage.moistureSensitivityNote}</span>
          </div>
        </div>
      )}

      {/* Primary Recommendation Overview */}
      <div className="bg-stone-50 rounded-xl p-4 border border-stone-200/70 space-y-2">
        <div className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
          <CalendarCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>{sectionLabels.rationaleTitle}</span>
        </div>
        <p className="text-xs sm:text-sm text-stone-800 leading-relaxed font-medium">
          {locAdvisory.primaryExplanation}
        </p>
      </div>

      {/* Field Checklist & Schedule Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Checklist Steps */}
        <div className="p-4 rounded-xl bg-sky-50/60 border border-sky-100 space-y-2">
          <div className="flex items-center gap-1.5 text-sky-900 text-xs font-bold uppercase tracking-wide">
            <Clock className="w-4 h-4 text-sky-700" />
            <span>{locAdvisory.checklistTitle}</span>
          </div>
          <ul className="space-y-1.5 text-xs text-sky-950">
            {locAdvisory.checkSteps.map((step, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-sky-700 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{step}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Soil Guidance */}
        <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100 space-y-2">
          <div className="flex items-center gap-1.5 text-emerald-900 text-xs font-bold uppercase tracking-wide">
            <Layers className="w-4 h-4 text-emerald-700" />
            <span>{locAdvisory.ruleTitle}</span>
          </div>
          <p className="text-xs text-emerald-950 leading-relaxed font-medium">
            {locAdvisory.soilGuidance}
          </p>
          <p className="text-xs text-emerald-800/90 leading-relaxed">
            {locAdvisory.ruleDescription}
          </p>
        </div>
      </div>

      {/* Postponement Banner (if applicable) */}
      {hasSubstantialRain && !isMaturityOrHarvest && (
        <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-950 space-y-1.5">
          <div className="flex items-center gap-2 font-bold text-blue-900 text-xs sm:text-sm">
            <CloudRain className="w-4 h-4 text-blue-700" />
            <span>{sectionLabels.postponeTitle}</span>
          </div>
          <p className="leading-relaxed">{sectionLabels.postponeDesc}</p>
        </div>
      )}

      {/* Environmental Drivers: What Increases vs What Reduces Needs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
        {/* Factors Increasing Needs */}
        <div className="p-4 rounded-xl border border-stone-200 bg-white space-y-2.5">
          <div className="flex items-center gap-1.5 text-amber-800 text-xs font-bold uppercase tracking-wider">
            <TrendingUp className="w-4 h-4 text-amber-600" />
            <span>{sectionLabels.increasingTitle}</span>
          </div>
          <ul className="space-y-1.5 text-xs text-stone-700">
            {conditionsIncreasingNeeds.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Factors Reducing Needs */}
        <div className="p-4 rounded-xl border border-stone-200 bg-white space-y-2.5">
          <div className="flex items-center gap-1.5 text-emerald-800 text-xs font-bold uppercase tracking-wider">
            <TrendingDown className="w-4 h-4 text-emerald-600" />
            <span>{sectionLabels.reducingTitle}</span>
          </div>
          <ul className="space-y-1.5 text-xs text-stone-700">
            {conditionsReducingNeeds.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Soil Type Dynamics & Agronomic Rule Compliance */}
      <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2 text-xs">
        <div className="flex items-center justify-between text-stone-700 font-bold">
          <span className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-stone-500" />
            {sectionLabels.soilDynamicsTitle}
          </span>
          <span className="text-[11px] text-stone-500 font-normal">Agronomic Standard</span>
        </div>
        <p className="text-stone-600 leading-relaxed">{locAdvisory.soilGuidance}</p>
        <div className="pt-2 border-t border-stone-200/60 flex items-center gap-2 text-[11px] text-stone-500 italic">
          <HelpCircle className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
          <span>{sectionLabels.agriRuleNote}</span>
        </div>
      </div>
    </div>
  );
};
