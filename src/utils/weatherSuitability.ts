import { CropProfile, WeatherData, Season, SupportedLanguage } from '../types';

export interface CropWeatherSuitability {
  cropId: string;
  cropName: string;
  category: string;
  isSuitable: boolean;
  score: number; // 0 to 100
  verdict: 'Highly Suitable' | 'Suitable' | 'Marginal' | 'Not Recommended';
  verdictLabel: string;
  weatherSuitabilityReason: string;
  climateSuitabilityReason: string;
  temperatureFitSummary: string;
  recommendedAction: string;
  optimalTemperatureText: string;
  suitableClimateText: string;
  waterNeedLevel: string;
}

// Localized verdict and reason dictionaries
const LOCALIZED_TEXTS: Record<
  string,
  {
    highlySuitable: string;
    suitable: string;
    marginal: string;
    notRecommended: string;
    weatherMatchPrefix: string;
    climateMatchPrefix: string;
    tempFitGood: (temp: number, opt: string) => string;
    tempFitCold: (temp: number, opt: string) => string;
    tempFitHot: (temp: number, opt: string) => string;
    rainFitNote: (rain: number, waterNeed: string) => string;
    climateDesc: (crop: string, climate: string) => string;
    actionPlantNow: string;
    actionIrrigateWarm: string;
    actionWaitSeason: string;
  }
> = {
  en: {
    highlySuitable: 'Highly Suitable for Current Weather',
    suitable: 'Suitable for Current Weather',
    marginal: 'Marginally Suitable (Needs Care)',
    notRecommended: 'Not Recommended for Current Weather',
    weatherMatchPrefix: 'Weather Match',
    climateMatchPrefix: 'Climate Suitability',
    tempFitGood: (t, opt) => `Current temperature (${t}°C) aligns with the optimal range (${opt}).`,
    tempFitCold: (t, opt) => `Current temperature (${t}°C) is colder than optimal (${opt}); germination and growth will be suppressed.`,
    tempFitHot: (t, opt) => `Current temperature (${t}°C) exceeds optimal limits (${opt}); thermal stress may affect flowering.`,
    rainFitNote: (r, w) => r >= 8 ? `Upcoming precipitation (${r.toFixed(1)} mm) provides natural moisture for ${w.toLowerCase()} water demand.` : `Low rain forecast (${r.toFixed(1)} mm); standard supplemental irrigation needed for ${w.toLowerCase()} water demand.`,
    climateDesc: (c, clim) => `${c} is well-adapted to this climate: ${clim}`,
    actionPlantNow: 'Current atmospheric conditions are favorable for active cultivation or sowing.',
    actionIrrigateWarm: 'Provide light morning irrigation to buffer root zone against afternoon heat.',
    actionWaitSeason: 'Consider waiting for a more temperate season or selecting heat/cold-tolerant varieties.',
  },
  hi: {
    highlySuitable: 'वर्तमान मौसम के लिए अत्यधिक उपयुक्त',
    suitable: 'वर्तमान मौसम के अनुकूल',
    marginal: 'सीमित अनुकूल (विशेष देखभाल आवश्यक)',
    notRecommended: 'वर्तमान मौसम के लिए अनुशंसित नहीं',
    weatherMatchPrefix: 'मौसम अनुकूलता',
    climateMatchPrefix: 'जलवायु उपयुक्तता',
    tempFitGood: (t, opt) => `वर्तमान तापमान (${t}°C) इस फसल के अनुकूल तापमान (${opt}) के साथ बिल्कुल मेल खाता है।`,
    tempFitCold: (t, opt) => `वर्तमान तापमान (${t}°C) सामान्य अनुकूल तापमान (${opt}) से कम है; अंकुरण धीमा रह सकता है।`,
    tempFitHot: (t, opt) => `वर्तमान तापमान (${t}°C) सामान्य अनुकूल तापमान (${opt}) से अधिक है; गर्मी का तनाव हो सकता है।`,
    rainFitNote: (r, w) => r >= 8 ? `आगामी बारिश (${r.toFixed(1)} मिमी) ${w} पानी की आवश्यकता वाले पौधों के लिए प्राकृतिक नमी देगी।` : `कम बारिश का अनुमान (${r.toFixed(1)} मिमी); सिंचाई की आवश्यकता होगी।`,
    climateDesc: (c, clim) => `${c} इस जलवायु के लिए सर्वथा उपयुक्त है: ${clim}`,
    actionPlantNow: 'वर्तमान मौसम बुवाई एवं स्वस्थ वानस्पतिक विकास के लिए अत्यंत अनुकूल है।',
    actionIrrigateWarm: 'दोपहर की गर्मी से बचाने के लिए सुबह के समय हल्की सिंचाई करें।',
    actionWaitSeason: 'मौसम अनुकूल होने तक प्रतीक्षा करें या तापमान-सहनशील किस्मों का चयन करें।',
  },
  ta: {
    highlySuitable: 'தற்போதைய வானிலைக்கு மிகவும் ஏற்றது',
    suitable: 'தற்போதைய வானிலைக்கு ஏற்றது',
    marginal: 'மிதமான பொருத்தம் (கூடுதல் பராமரிப்பு தேவை)',
    notRecommended: 'தற்போதைய வானிலைக்கு உகந்ததல்ல',
    weatherMatchPrefix: 'வானிலை பொருத்தம்',
    climateMatchPrefix: 'காலநிலை ஏற்புத்தன்மை',
    tempFitGood: (t, opt) => `தற்போதைய வெப்பநிலை (${t}°C) இந்த பயிரின் உகந்த வளர்ச்சி வரம்போடு (${opt}) சரியாகப் பொருந்துகிறது.`,
    tempFitCold: (t, opt) => `தற்போதைய வெப்பநிலை (${t}°C) உகந்த அளவை (${opt}) விடக் குறைவாக உள்ளதால் வளர்ச்சி மெதுவாக இருக்கும்.`,
    tempFitHot: (t, opt) => `தற்போதைய வெப்பநிலை (${t}°C) வெப்ப வரம்பை (${opt}) விட அதிகமாக உள்ளதால் வெப்ப அழுத்தம் ஏற்படலாம்.`,
    rainFitNote: (r, w) => r >= 8 ? `எதிர்பார்க்கப்படும் மழை (${r.toFixed(1)} மி.மீ) ${w} நீர் தேவைப்படும் பயிருக்கு நல்ல இயற்கை ஈரப்பதத்தை தரும்.` : `மழை அளவு குறைவு (${r.toFixed(1)} மி.மீ); மிதமான பாசனம் தேவைப்படும்.`,
    climateDesc: (c, clim) => `${c} இந்த தட்பவெப்ப நிலைக்கு மிகவும் ஏற்றது: ${clim}`,
    actionPlantNow: 'தற்போதைய வானிலை விதைப்பு மற்றும் துரித வளர்ச்சிக்கு மிகச் சாதகமாக உள்ளது.',
    actionIrrigateWarm: 'நண்பகல் வெப்பத்திலிருந்து பாதுகாக்க அதிகாலையில் மிதமான நீர் பாய்ச்சவும்.',
    actionWaitSeason: 'சாதகமான பருவம் வரும் வரை காத்திருக்கவும் அல்லது தகுந்த மாற்று பயிரைத் தேர்வு செய்யவும்.',
  },
  te: {
    highlySuitable: 'ప్రస్తుత వాతావరణానికి అత్యంత అనుకూలమైనది',
    suitable: 'ప్రస్తుత వాతావరణానికి అనుకూలమైనది',
    marginal: 'పరిమిత అనుకూలత (ప్రత్యేక శ్రద్ధ అవసరం)',
    notRecommended: 'ప్రస్తుత వాతావరణానికి సిఫార్సు చేయబడలేదు',
    weatherMatchPrefix: 'వాతావరణ సరిపోలిక',
    climateMatchPrefix: 'శీతోష్ణస్థితి అనుకూలత',
    tempFitGood: (t, opt) => `ప్రస్తుత ఉష్ణోగ్రత (${t}°C) సరైన ఉష్ణోగ్రత శ్రేణితో (${opt}) సరిగ్గా సరిపోలుతుంది.`,
    tempFitCold: (t, opt) => `ప్రస్తుత ఉష్ణోగ్రత (${t}°C) సరైన పరిధి (${opt}) కంటే తక్కువగా ఉంది.`,
    tempFitHot: (t, opt) => `ప్రస్తుత ఉష్ణోగ్రత (${t}°C) పరిమితి (${opt}) కంటే ఎక్కువగా ఉంది; ఉష్ణ ఒత్తిడి ఉండవచ్చు.`,
    rainFitNote: (r, w) => r >= 8 ? `రాబోయే వర్షపాతం (${r.toFixed(1)} మి.మీ) మంచి తేమను అందిస్తుంది.` : `వర్షం తక్కువ (${r.toFixed(1)} మి.మీ); అనుబంధ నీటిపారుదల అవసరం.`,
    climateDesc: (c, clim) => `${c} ఈ శీతోష్ణస్థితికి చక్కగా సరిపోతుంది: ${clim}`,
    actionPlantNow: 'ప్రస్తుత వాతావరణ పరిస్థితులు సాగుకు చాలా అనుకూలంగా ఉన్నాయి.',
    actionIrrigateWarm: 'వేడి ఒత్తిడిని తగ్గించడానికి ఉదయాన్నే నీరు పెట్టండి.',
    actionWaitSeason: 'సరైన కాలం వరకు ఆగండి లేదా తట్టుకునే రకాలను ఎంచుకోండి.',
  },
  kn: {
    highlySuitable: 'ಪ್ರಸ್ತುತ ಹವಾಮಾನಕ್ಕೆ ಅತ್ಯಂತ ಸೂಕ್ತವಾಗಿದೆ',
    suitable: 'ಪ್ರಸ್ತುತ ಹವಾಮಾನಕ್ಕೆ ಸೂಕ್ತವಾಗಿದೆ',
    marginal: 'ಮಧ್ಯಮ ಸೂಕ್ತತೆ (ಹೆಚ್ಚಿನ ಕಾಳಜಿ ಅಗತ್ಯ)',
    notRecommended: 'ಪ್ರಸ್ತುತ ಹವಾಮಾನಕ್ಕೆ ಶಿಫಾರಸು ಮಾಡಲಾಗಿಲ್ಲ',
    weatherMatchPrefix: 'ಹವಾಮಾನ ಹೊಂದಾಣಿಕೆ',
    climateMatchPrefix: 'ವಾಯುಗುಣ ಸೂಕ್ತತೆ',
    tempFitGood: (t, opt) => `ಪ್ರಸ್ತುತ ತಾಪಮಾನ (${t}°C) ಅತ್ಯುತ್ತಮ ಬೆಳವಣಿಗೆಯ ಶ್ರೇಣಿಯೊಂದಿಗೆ (${opt}) ಹೊಂದಾಣಿಕೆಯಾಗುತ್ತದೆ.`,
    tempFitCold: (t, opt) => `ಪ್ರಸ್ತುತ ತಾಪಮಾನ (${t}°C) ಸೂಕ್ತ ಶ್ರೇಣಿಗಿಂತ (${opt}) ಕಡಿಮೆಯಿದೆ.`,
    tempFitHot: (t, opt) => `ಪ್ರಸ್ತುत ತಾಪಮಾನ (${t}°C) ಗರಿಷ್ಠ ಮಿತಿಗಿಂತ (${opt}) ಹೆಚ್ಚಾಗಿದೆ.`,
    rainFitNote: (r, w) => r >= 8 ? `ನಿರೀಕ್ಷಿತ ಮಳೆ (${r.toFixed(1)} ಮಿಮೀ) ನೈಸರ್ಗಿಕ ತೇವಾಂಶವನ್ನು ಒದಗಿಸುತ್ತದೆ.` : `ಕಡಿಮೆ ಮಳೆಯ ಮುನ್ಸೂಚನೆ (${r.toFixed(1)} ಮಿಮೀ); ನೀರಾವರಿ ಅಗತ್ಯವಿದೆ.`,
    climateDesc: (c, clim) => `${c} ಈ ಹವಾಮಾನಕ್ಕೆ ಹೊಂದಿಕೊಳ್ಳುತ್ತದೆ: ${clim}`,
    actionPlantNow: 'ಪ್ರಸ್ತುತ ಪರಿಸ್ಥಿತಿಗಳು ಬಿತ್ತನೆ ಮತ್ತು ಸಕ್ರಿಯ ಬೆಳವಣಿಗೆಗೆ ಅನುಕೂಲಕರವಾಗಿವೆ.',
    actionIrrigateWarm: 'ಮಧ್ಯಾಹ್ನದ ಬಿಸಿಲಿನಿಂದ ರಕ್ಷಿಸಲು ಮುಂಜಾನೆ ನೀರು ನೀಡಿ.',
    actionWaitSeason: 'ಅನುಕೂಲಕರ ಋತುವಿನವರೆಗೆ ಕಾಯಿರಿ.',
  },
  pa: {
    highlySuitable: 'ਮੌਜੂਦਾ ਮੌਸਮ ਲਈ ਬਹੁਤ ਢੁਕਵਾਂ',
    suitable: 'ਮੌਜੂਦਾ ਮੌਸਮ ਲਈ ਅਨੁਕੂਲ',
    marginal: 'ਸੀਮਤ ਅਨੁਕੂਲ (ਵਿਸ਼ੇਸ਼ ਦੇਖਭਾਲ ਦੀ ਲੋੜ)',
    notRecommended: 'ਮੌਜੂਦਾ ਮੌਸਮ ਲਈ ਸਿਫਾਰਸ਼ ਨਹੀਂ ਕੀਤੀ ਜਾਂਦੀ',
    weatherMatchPrefix: 'ਮੌਸਮ ਅਨੁਕੂਲਤਾ',
    climateMatchPrefix: 'ਜਲਵਾਯੂ ਅਨੁਕੂਲਤਾ',
    tempFitGood: (t, opt) => `ਮੌਜੂਦਾ ਤਾਪਮਾਨ (${t}°C) ਅਨੁਕੂਲ ਹੱਦ (${opt}) ਨਾਲ ਪੂਰੀ ਤਰ੍ਹਾਂ ਮੇਲ ਖਾਂਦਾ ਹੈ।`,
    tempFitCold: (t, opt) => `ਮੌਜੂਦਾ ਤਾਪਮਾਨ (${t}°C) ਅਨੁਕੂਲ ਹੱਦ (${opt}) ਤੋਂ ਘੱਟ ਹੈ।`,
    tempFitHot: (t, opt) => `ਮੌਜੂਦਾ ਤਾਪਮਾਨ (${t}°C) ਅਨੁਕੂਲ ਹੱਦ (${opt}) ਤੋਂ ਵੱਧ ਹੈ।`,
    rainFitNote: (r, w) => r >= 8 ? `ਮੀਂਹ (${r.toFixed(1)} ਮਿ.ਮੀ.) ਕੁਦਰਤੀ ਨਮੀ ਪ੍ਰਦਾਨ ਕਰੇਗਾ।` : `ਮੀਂਹ ਘੱਟ (${r.toFixed(1)} ਮਿ.ਮੀ.); ਸਿੰਚਾਈ ਦੀ ਲੋੜ ਪਵੇਗੀ।`,
    climateDesc: (c, clim) => `${c} ਇਸ ਜਲਵਾਯੂ ਲਈ ਬਹੁਤ ਵਧੀਆ ਹੈ: ${clim}`,
    actionPlantNow: 'ਮੌਜੂਦਾ ਹਾਲਾਤ ਬਿਜਾਈ ਅਤੇ ਵਾਧੇ ਲਈ ਬਹੁਤ ਅਨੁਕੂਲ ਹਨ।',
    actionIrrigateWarm: 'ਸਵੇਰ ਵੇਲੇ ਹਲਕਾ ਪਾਣੀ ਲਾਓ ਤਾਂ ਜੋ ਗਰਮੀ ਤੋਂ ਬਚਾਅ ਹੋ ਸਕੇ।',
    actionWaitSeason: 'ਮੌਸਮ ਸੁਖਾਵਾਂ ਹੋਣ ਦੀ ਉਡੀਕ ਕਰੋ।',
  },
  mr: {
    highlySuitable: 'सध्याच्या हवामानासाठी अत्यंत योग्य',
    suitable: 'सध्याच्या हवामानास अनुकूल',
    marginal: 'मध्यम अनुकूल (विशेष काळजी आवश्यक)',
    notRecommended: 'सध्याच्या हवामानासाठी शिफारस केलेले नाही',
    weatherMatchPrefix: 'हवामान सुसंगतता',
    climateMatchPrefix: 'हवामान योग्यता',
    tempFitGood: (t, opt) => `सध्याचे तापमान (${t}°C) या पिकाच्या योग्य तापमान श्रेणीशी (${opt}) सुसंगत आहे.`,
    tempFitCold: (t, opt) => `सध्याचे तापमान (${t}°C) योग्य श्रेणीपेक्षा (${opt}) कमी आहे.`,
    tempFitHot: (t, opt) => `सध्याचे तापमान (${t}°C) योग्य श्रेणीपेक्षा (${opt}) जास्त आहे.`,
    rainFitNote: (r, w) => r >= 8 ? `अपेक्षित पाऊस (${r.toFixed(1)} मिमी) नैसर्गिक ओलावा देईल.` : `कमी पाऊस (${r.toFixed(1)} मिमी); पाण्याची सोय ठेवावी लागेल.`,
    climateDesc: (c, clim) => `${c} या हवामानासाठी अत्यंत योग्य आहे: ${clim}`,
    actionPlantNow: 'सध्याची परिस्थिती लागवड आणि वाढीसाठी उत्तम आहे.',
    actionIrrigateWarm: 'दुपारच्या उष्णतेपासून वाचवण्यासाठी सकाळी पाणी द्या.',
    actionWaitSeason: 'योग्य ऋतूची वाट पहा किंवा उष्णता-सहनशील वाण निवडा.',
  },
  bn: {
    highlySuitable: 'বর্তমান আবহাওয়ার জন্য অত্যন্ত উপযোগী',
    suitable: 'বর্তমান আবহাওয়ার উপযোগী',
    marginal: 'সীমিত উপযোগী (যত্ন প্রয়োজন)',
    notRecommended: 'বর্তমান আবহাওয়ায় রোপণ না করার পরামর্শ',
    weatherMatchPrefix: 'আবহাওয়া সামঞ্জস্য',
    climateMatchPrefix: 'জলবায়ু উপযুক্ততা',
    tempFitGood: (t, opt) => `বর্তমান তাপমাত্রা (${t}°C) এই ফসলের আদর্শ তাপমাত্রার (${opt}) সাথে নিখুঁতভাবে মেলে।`,
    tempFitCold: (t, opt) => `বর্তমান তাপমাত্রা (${t}°C) আদর্শ সীমার (${opt}) চেয়ে কম।`,
    tempFitHot: (t, opt) => `বর্তমান তাপমাত্রা (${t}°C) আদর্শ সীমার (${opt}) চেয়ে বেশি।`,
    rainFitNote: (r, w) => r >= 8 ? `বৃষ্টিপাতের পূর্বাভাস (${r.toFixed(1)} মিমি) প্রাকৃতিক আর্দ্রতা জোগাবে।` : `বৃষ্টির পরিমাণ কম (${r.toFixed(1)} মিমি); সেচের প্রয়োজন হতে পারে।`,
    climateDesc: (c, clim) => `${c} এই জলবায়ুর সাথে চমৎকারভাবে মানানসই: ${clim}`,
    actionPlantNow: 'বর্তমান পরিবেশ রোপণ এবং বৃদ্ধির জন্য অত্যন্ত অনুকূল।',
    actionIrrigateWarm: 'রোদের তাপ থেকে বাঁচাতে সকালে হালকা সেচ দিন।',
    actionWaitSeason: 'উপযুক্ত মৌসুম পর্যন্ত অপেক্ষা করুন।',
  },
  es: {
    highlySuitable: 'Muy adecuado para el clima actual',
    suitable: 'Adecuado para el clima actual',
    marginal: 'Parcialmente adecuado (requiere cuidado)',
    notRecommended: 'No recomendado para el clima actual',
    weatherMatchPrefix: 'Alineación Climática',
    climateMatchPrefix: 'Idoneidad de Clima',
    tempFitGood: (t, opt) => `La temperatura actual (${t}°C) coincide con el rango óptimo (${opt}).`,
    tempFitCold: (t, opt) => `La temperatura actual (${t}°C) es más fría que la óptima (${opt}).`,
    tempFitHot: (t, opt) => `La temperatura actual (${t}°C) excede los límites óptimos (${opt}).`,
    rainFitNote: (r, w) => r >= 8 ? `La lluvia proyectada (${r.toFixed(1)} mm) proporciona humedad natural para necesidad ${w.toLowerCase()}.` : `Poca lluvia pronosticada (${r.toFixed(1)} mm); requiere riego suplementario.`,
    climateDesc: (c, clim) => `${c} está bien adaptado a este clima: ${clim}`,
    actionPlantNow: 'Las condiciones atmosféricas actuales son favorables para el cultivo o siembra.',
    actionIrrigateWarm: 'Riegue temprano por la mañana para proteger contra el calor de la tarde.',
    actionWaitSeason: 'Espere una estación más templada o elija variedades tolerantes.',
  },
};

// Helper to extract min and max temperature from string
function parseTemperatureRange(tempStr: string): { min: number; max: number } {
  const matches = tempStr.match(/(\d+)\s*°?C?\s*[-–to]+\s*(\d+)\s*°?C?/i);
  if (matches && matches[1] && matches[2]) {
    return { min: parseInt(matches[1], 10), max: parseInt(matches[2], 10) };
  }
  return { min: 18, max: 32 };
}

/**
 * Evaluate if a crop is suitable for live weather and climate
 */
export function evaluateCropWeatherSuitability(
  crop: CropProfile,
  weatherData: WeatherData | null,
  seasonOrLang?: Season | SupportedLanguage,
  langParam: SupportedLanguage = 'en'
): CropWeatherSuitability {
  let season: Season | undefined;
  let language: SupportedLanguage = 'en';

  if (typeof seasonOrLang === 'string') {
    if (['en', 'hi', 'ta', 'te', 'kn', 'pa', 'mr', 'bn', 'ml', 'es', 'fr', 'sw'].includes(seasonOrLang)) {
      language = seasonOrLang as SupportedLanguage;
    } else {
      season = seasonOrLang as Season;
      language = langParam;
    }
  }

  const currentTemp = weatherData?.current?.temperature ?? 28;
  const humidity = weatherData?.current?.relativeHumidity ?? 60;
  const upcomingRain = weatherData?.forecast
    ? weatherData.forecast.slice(0, 3).reduce((acc, d) => acc + (d.precipitationSum || 0), 0)
    : 0;

  const { min: optMin, max: optMax } = parseTemperatureRange(
    crop.importantEnvironmentalConditions.optimalTemperature
  );

  let tempScore = 0;
  let tempStatus: 'good' | 'cold' | 'hot' = 'good';

  if (currentTemp >= optMin && currentTemp <= optMax) {
    tempScore = 50; // Perfect match
    tempStatus = 'good';
  } else if (currentTemp >= optMin - 4 && currentTemp <= optMax + 4) {
    tempScore = 35; // Moderate match
    tempStatus = currentTemp < optMin ? 'cold' : 'hot';
  } else if (currentTemp >= optMin - 8 && currentTemp <= optMax + 8) {
    tempScore = 20; // Marginal
    tempStatus = currentTemp < optMin ? 'cold' : 'hot';
  } else {
    tempScore = 0; // Out of range
    tempStatus = currentTemp < optMin ? 'cold' : 'hot';
  }

  // Rainfall & water need compatibility
  const waterLevel = crop.importantEnvironmentalConditions.waterRequirementLevel;
  let waterScore = 25;
  if (upcomingRain >= 15 && (waterLevel === 'Low' || crop.name.includes('Watermelon') || crop.category === 'Pulse / Legume')) {
    waterScore = 10; // Rain sensitive
  } else if (upcomingRain >= 10 && (waterLevel === 'High' || waterLevel === 'Very High' || crop.name.includes('Rice') || crop.name.includes('Banana'))) {
    waterScore = 30; // Benefits from abundant moisture
  } else {
    waterScore = 25;
  }

  // Humidity compatibility
  let humidityScore = 20;
  if (humidity > 80 && (crop.category === 'Vegetable' || crop.name.includes('Tomato') || crop.name.includes('Watermelon'))) {
    humidityScore = 12; // Risk of foliar blight
  } else {
    humidityScore = 20;
  }

  const totalScore = Math.min(100, Math.max(0, tempScore + waterScore + humidityScore));

  let verdict: 'Highly Suitable' | 'Suitable' | 'Marginal' | 'Not Recommended' = 'Suitable';
  let isSuitable = true;

  if (totalScore >= 80) {
    verdict = 'Highly Suitable';
    isSuitable = true;
  } else if (totalScore >= 55) {
    verdict = 'Suitable';
    isSuitable = true;
  } else if (totalScore >= 35) {
    verdict = 'Marginal';
    isSuitable = false;
  } else {
    verdict = 'Not Recommended';
    isSuitable = false;
  }

  // Retrieve localized strings (fallback to en)
  const loc = LOCALIZED_TEXTS[language] || LOCALIZED_TEXTS.en;

  const verdictLabel =
    verdict === 'Highly Suitable'
      ? loc.highlySuitable
      : verdict === 'Suitable'
      ? loc.suitable
      : verdict === 'Marginal'
      ? loc.marginal
      : loc.notRecommended;

  const tempReason =
    tempStatus === 'good'
      ? loc.tempFitGood(currentTemp, `${optMin}°C - ${optMax}°C`)
      : tempStatus === 'cold'
      ? loc.tempFitCold(currentTemp, `${optMin}°C - ${optMax}°C`)
      : loc.tempFitHot(currentTemp, `${optMin}°C - ${optMax}°C`);

  const rainReason = loc.rainFitNote(upcomingRain, waterLevel);
  const weatherSuitabilityReason = `${tempReason} ${rainReason}`;
  const climateSuitabilityReason = loc.climateDesc(crop.name, crop.suitableClimate);

  const recommendedAction =
    isSuitable && tempStatus === 'good'
      ? loc.actionPlantNow
      : tempStatus === 'hot'
      ? loc.actionIrrigateWarm
      : loc.actionWaitSeason;

  return {
    cropId: crop.id,
    cropName: crop.name,
    category: crop.category,
    isSuitable,
    score: totalScore,
    verdict,
    verdictLabel,
    weatherSuitabilityReason,
    climateSuitabilityReason,
    temperatureFitSummary: `Optimal: ${optMin}°C - ${optMax}°C | Current: ${currentTemp}°C`,
    recommendedAction,
    optimalTemperatureText: crop.importantEnvironmentalConditions.optimalTemperature,
    suitableClimateText: crop.suitableClimate,
    waterNeedLevel: waterLevel,
  };
}

/**
 * Filter crops from a list and return only those suitable for current weather, sorted by match score.
 */
export function filterWeatherSuitableCrops(
  crops: CropProfile[],
  weatherData: WeatherData | null,
  language: SupportedLanguage = 'en'
): { crop: CropProfile; suitability: CropWeatherSuitability }[] {
  const evaluated = crops.map((crop) => ({
    crop,
    suitability: evaluateCropWeatherSuitability(crop, weatherData, language),
  }));

  // Filter suitable and sort by score descending
  return evaluated
    .filter((item) => item.suitability.isSuitable)
    .sort((a, b) => b.suitability.score - a.suitability.score);
}

