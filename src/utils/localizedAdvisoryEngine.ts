import {
  SupportedLanguage,
  SoilType,
  Season,
  IrrigationStatus,
  LifeCycleStageName,
  CropCategory,
} from '../types';

export interface LocalizedStageAdvisory {
  statusTitle: string;
  primaryExplanation: string;
  postponementReason: string | null;
  ruleTitle: string;
  ruleDescription: string;
  soilGuidance: string;
  checklistTitle: string;
  checkSteps: string[];
  weatherFactorsTitle: string;
  weatherConservingTitle: string;
  suitabilityTitle: string;
}

export interface LocalizedStandingAdvice {
  stageSummary: string;
  actionItems: string[];
  pestVigilance: string;
  fertilizerAdvice: string;
}

export interface LocalizedExecutiveAnalysis {
  overview: string;
  climateSoilAnalysis: string;
  keyTakeaway: string;
}

// Category translations
export const LOCALIZED_CATEGORIES: Record<
  SupportedLanguage,
  Record<CropCategory | 'All', string>
> = {
  en: {
    All: 'All Products',
    'Vegetable': '🥬 Vegetables',
    'Fruit': '🍎 Fruits',
    'Cereal / Grain': '🌾 Field Crops & Cereals',
    'Pulse / Legume': '🫘 Pulses & Legumes',
    'Cash Crop': '💰 Cash Crops',
    'Oilseed': '🌻 Oilseeds',
  },
  hi: {
    All: 'सभी उत्पाद',
    'Vegetable': '🥬 सब्जियां',
    'Fruit': '🍎 फल',
    'Cereal / Grain': '🌾 मुख्य फसलें व अनाज',
    'Pulse / Legume': '🫘 दालें व दलहन',
    'Cash Crop': '💰 नकदी फसलें',
    'Oilseed': '🌻 तिलहन',
  },
  ta: {
    All: 'அனைத்து விளைபொருட்கள்',
    'Vegetable': '🥬 காய்கறிகள்',
    'Fruit': '🍎 பழங்கள்',
    'Cereal / Grain': '🌾 தானியங்கள் & நெல்',
    'Pulse / Legume': '🫘 பருப்பு வகைகள்',
    'Cash Crop': '💰 பணப்பயிர்கள்',
    'Oilseed': '🌻 எண்ணெய் வித்துக்கள்',
  },
  te: {
    All: 'అన్ని ఉత్పత్తులు',
    'Vegetable': '🥬 కూరగాయలు',
    'Fruit': '🍎 పండ్లు',
    'Cereal / Grain': '🌾 ప్రధాన పంటలు & ధాన్యాలు',
    'Pulse / Legume': '🫘 పప్పుధాన్యాలు',
    'Cash Crop': '💰 వాణిజ్య పంటలు',
    'Oilseed': '🌻 నూనెగింజలు',
  },
  kn: {
    All: 'ಎಲ್ಲಾ ಉತ್ಪನ್ನಗಳು',
    'Vegetable': '🥬 ತರಕಾರಿಗಳು',
    'Fruit': '🍎 ಹಣ್ಣುಗಳು',
    'Cereal / Grain': '🌾 ಮುಖ್ಯ ಬೆಳೆಗಳು & ಧಾನ್ಯಗಳು',
    'Pulse / Legume': '🫘 ಬೇಳೆಕಾಳುಗಳು',
    'Cash Crop': '💰 ವಾಣಿಜ್ಯ ಬೆಳೆಗಳು',
    'Oilseed': '🌻 ಎಣ್ಣೆಕಾಳುಗಳು',
  },
  pa: {
    All: 'ਸਾਰੇ ਉਤਪਾਦ',
    'Vegetable': '🥬 ਸਬਜ਼ੀਆਂ',
    'Fruit': '🍎 ਫਲ',
    'Cereal / Grain': '🌾 ਮੁੱਖ ਫਸਲਾਂ ਤੇ ਅਨਾਜ',
    'Pulse / Legume': '🫘 ਦਾਲਾਂ',
    'Cash Crop': '💰 ਨਕਦੀ ਫਸਲਾਂ',
    'Oilseed': '🌻 ਤੇਲ ਬੀਜ',
  },
  mr: {
    All: 'सर्व उत्पादने',
    'Vegetable': '🥬 भाज्या',
    'Fruit': '🍎 फळे',
    'Cereal / Grain': '🌾 मुख्य पिके व धान्ये',
    'Pulse / Legume': '🫘 कडधान्ये व डाळी',
    'Cash Crop': '💰 नगदी पिके',
    'Oilseed': '🌻 गळित धान्ये',
  },
  bn: {
    All: 'সকল ফসল',
    'Vegetable': '🥬 শাকসবজি',
    'Fruit': '🍎 ফলমূল',
    'Cereal / Grain': '🌾 খাদ্যশস্য ও ধান',
    'Pulse / Legume': '🫘 ডালজাতীয় ফসল',
    'Cash Crop': '💰 অর্থকরী ফসল',
    'Oilseed': '🌻 তৈলবীজ',
  },
  ml: {
    All: 'എല്ലാ വിളകളും',
    'Vegetable': '🥬 പച്ചക്കറികൾ',
    'Fruit': '🍎 പഴങ്ങൾ',
    'Cereal / Grain': '🌾 ധാന്യങ്ങൾ',
    'Pulse / Legume': '🫘 പയറുവർഗ്ഗങ്ങൾ',
    'Cash Crop': '💰 നാണ്യവിളകൾ',
    'Oilseed': '🌻 എണ്ണക്കുരുക്കൾ',
  },
  es: {
    All: 'Todos los Productos',
    'Vegetable': '🥬 Vegetales y Hortalizas',
    'Fruit': '🍎 Frutas',
    'Cereal / Grain': '🌾 Cereales y Granos',
    'Pulse / Legume': '🫘 Legumbres y Leguminosas',
    'Cash Crop': '💰 Cultivos Comerciales',
    'Oilseed': '🌻 Oleaginosas',
  },
  fr: {
    All: 'Tous les Produits',
    'Vegetable': '🥬 Légumes',
    'Fruit': '🍎 Fruits',
    'Cereal / Grain': '🌾 Céréales et Grains',
    'Pulse / Legume': '🫘 Légumineuses',
    'Cash Crop': '💰 Cultures de Rente',
    'Oilseed': '🌻 Oléagineux',
  },
  sw: {
    All: 'Mazao Yote',
    'Vegetable': '🥬 Mboga za Majani',
    'Fruit': '🍎 Matunda',
    'Cereal / Grain': '🌾 Nafaka na Nafaka Kuu',
    'Pulse / Legume': '🫘 Jamii ya Kunde',
    'Cash Crop': '💰 Mazao ya Biashara',
    'Oilseed': '🌻 Mazao ya Mafuta',
  },
};

// Stage name translations
export const LOCALIZED_STAGES: Record<SupportedLanguage, Record<LifeCycleStageName, string>> = {
  en: {
    'Land Preparation': 'Land Preparation',
    'Seed Selection': 'Seed Selection',
    'Seed Sowing / Planting': 'Seed Sowing / Planting',
    'Germination': 'Germination',
    'Early Growth': 'Early Growth',
    'Vegetative Stage': 'Vegetative Stage',
    'Flowering Stage': 'Flowering Stage',
    'Fruit / Vegetable Development': 'Fruit / Vegetable Development',
    'Maturity': 'Maturity',
    'Harvest': 'Harvest',
  },
  hi: {
    'Land Preparation': 'खेत की तैयारी',
    'Seed Selection': 'बीज चयन व शोधन',
    'Seed Sowing / Planting': 'बीज बुवाई / रोपाई',
    'Germination': 'अंकुरण अवस्था',
    'Early Growth': 'प्रारंभिक वृद्धि',
    'Vegetative Stage': 'वानस्पतिक विकास',
    'Flowering Stage': 'फूल आने की अवस्था',
    'Fruit / Vegetable Development': 'फल / दाना विकास',
    'Maturity': 'परिपक्वता अवस्था',
    'Harvest': 'कटाई व तुड़ाई',
  },
  ta: {
    'Land Preparation': 'நிலம் தயாரித்தல்',
    'Seed Selection': 'விதை தேர்வு மற்றும் நேர்த்தி',
    'Seed Sowing / Planting': 'விதைப்பு / நடுதல்',
    'Germination': 'முளைக்கும் பருவம்',
    'Early Growth': 'ஆரம்ப வளர்ச்சி',
    'Vegetative Stage': 'தழைப்பருவம் / கிளைத்தல்',
    'Flowering Stage': 'பூக்கும் பருவம்',
    'Fruit / Vegetable Development': 'காய் / கனி / கதிர் உருவாக்கம்',
    'Maturity': 'முதிர்ச்சி நிலை',
    'Harvest': 'அறுவடை காலம்',
  },
  te: {
    'Land Preparation': 'భూమి తయారీ',
    'Seed Selection': 'విత్తన ఎంపిక & శుద్ధి',
    'Seed Sowing / Planting': 'విత్తనం విత్తడం / నాటడం',
    'Germination': 'మొలకెత్తే దశ',
    'Early Growth': 'ప్రారంభ పెరుగుదల',
    'Vegetative Stage': 'శాకీయ ఎదుగుదల దశ',
    'Flowering Stage': 'పూత దశ',
    'Fruit / Vegetable Development': 'కాయ / గింజ అభివృద్ధి దశ',
    'Maturity': 'పరిపక్వత దశ',
    'Harvest': 'కోత దశ',
  },
  kn: {
    'Land Preparation': 'ಭೂಮಿ ಸಿದ್ಧತೆ',
    'Seed Selection': 'ಬೀಜ ಆಯ್ಕೆ ಮತ್ತು ಉಪಚಾರ',
    'Seed Sowing / Planting': 'ಬಿತ್ತನೆ / ನಾಟಿ',
    'Germination': 'ಮೊಳಕೆಯೊಡೆಯುವ ಹಂತ',
    'Early Growth': 'ಆರಂಭಿಕ ಬೆಳವಣಿಗೆ',
    'Vegetative Stage': 'ಸಸ್ಯಕ ಬೆಳವಣಿಗೆಯ ಹಂತ',
    'Flowering Stage': 'ಹೂಬಿಡುವ ಹಂತ',
    'Fruit / Vegetable Development': 'ಕಾಯಿ / ಕಾಳು ಕಟ್ಟುವ ಹಂತ',
    'Maturity': 'ಪಕ್ವತೆಯ ಹಂತ',
    'Harvest': 'ಕೊಯ್ಲು ಹಂತ',
  },
  pa: {
    'Land Preparation': 'ਜ਼ਮੀਨ ਦੀ ਤਿਆਰੀ',
    'Seed Selection': 'ਬੀਜ ਚੋਣ ਅਤੇ ਸੋਧ',
    'Seed Sowing / Planting': 'ਬਿਜਾਈ / ਲੁਆਈ',
    'Germination': 'ਪੁੰਗਰਨ ਦੀ ਅਵਸਥਾ',
    'Early Growth': 'ਮੁੱਢਲਾ ਵਾਧਾ',
    'Vegetative Stage': 'ਬਨਸਪਤੀ ਵਾਧਾ',
    'Flowering Stage': 'ਫੁੱਲ ਪੈਣ ਦੀ ਅਵਸਥਾ',
    'Fruit / Vegetable Development': 'ਫਲ / ਦਾਣਾ ਬਣਨਾ',
    'Maturity': 'ਪੱਕਣ ਦੀ ਅਵਸਥਾ',
    'Harvest': 'ਵਾਢੀ ਦਾ ਸਮਾਂ',
  },
  mr: {
    'Land Preparation': 'जमीन तयार करणे',
    'Seed Selection': 'बियाणे निवड व प्रक्रिया',
    'Seed Sowing / Planting': 'बियाणे पेरणी / पुनर्लागवड',
    'Germination': 'उगवण अवस्था',
    'Early Growth': 'सुरुवातीची वाढ',
    'Vegetative Stage': 'शाकीय वाढीची अवस्था',
    'Flowering Stage': 'फुलोरा अवस्था',
    'Fruit / Vegetable Development': 'फळ / दाणे भरणे अवस्था',
    'Maturity': 'परिपक्वता अवस्था',
    'Harvest': 'कापणी व काढणी',
  },
  bn: {
    'Land Preparation': 'জমি প্রস্তুতি',
    'Seed Selection': 'বীজ নির্বাচন ও শোধন',
    'Seed Sowing / Planting': 'বীজ বপন / রোপণ',
    'Germination': 'অঙ্কুরোদগম পর্যায়',
    'Early Growth': 'প্রাথমিক বৃদ্ধি',
    'Vegetative Stage': 'অঙ্গজ বৃদ্ধি পর্যায়',
    'Flowering Stage': 'ফুল ফোটার পর্যায়',
    'Fruit / Vegetable Development': 'ফল / দানা গঠন পর্যায়',
    'Maturity': 'পরিপক্বতা পর্যায়',
    'Harvest': 'ফসল তোলা / কর্তন',
  },
  ml: {
    'Land Preparation': 'നിലമൊരുക്കൽ',
    'Seed Selection': 'വിത്ത് തിരഞ്ഞെടുപ്പും പരിചരണവും',
    'Seed Sowing / Planting': 'വിത്തുവിതയ്ക്കൽ / നടീൽ',
    'Germination': 'മുളയ്ക്കൽ ഘട്ടം',
    'Early Growth': 'പ്രാരംഭ വളർച്ച',
    'Vegetative Stage': 'കായിക വളർച്ചാ ഘട്ടം',
    'Flowering Stage': 'പൂവിടൽ ഘട്ടം',
    'Fruit / Vegetable Development': 'കായ്ഫല രൂപീകരണ ഘട്ടം',
    'Maturity': 'വിളവെത്തൽ ഘട്ടം',
    'Harvest': 'വിളവെടുപ്പ് ഘട്ടം',
  },
  es: {
    'Land Preparation': 'Preparación del Suelo',
    'Seed Selection': 'Selección y Tratamiento de Semilla',
    'Seed Sowing / Planting': 'Siembra o Trasplante',
    'Germination': 'Germinación y Emergencia',
    'Early Growth': 'Crecimiento Inicial',
    'Vegetative Stage': 'Desarrollo Vegetativo',
    'Flowering Stage': 'Etapa de Floración',
    'Fruit / Vegetable Development': 'Desarrollo de Fruto / Grano',
    'Maturity': 'Maduración Fisiológica',
    'Harvest': 'Cosecha y Recolección',
  },
  fr: {
    'Land Preparation': 'Préparation du Sol',
    'Seed Selection': 'Sélection et Traitement des Semences',
    'Seed Sowing / Planting': 'Semis / Plantation',
    'Germination': 'Germination et Levée',
    'Early Growth': 'Croissance Précoce',
    'Vegetative Stage': 'Développement Végétatif',
    'Flowering Stage': 'Stade de Floraison',
    'Fruit / Vegetable Development': 'Développement des Fruits / Grains',
    'Maturity': 'Maturité Physiologique',
    'Harvest': 'Récolte',
  },
  sw: {
    'Land Preparation': 'Matayarisho ya Shamba',
    'Seed Selection': 'Uteuzi na Matibabu ya Mbegu',
    'Seed Sowing / Planting': 'Upandaji wa Mbegu / Miche',
    'Germination': 'Uotaji wa Mbegu',
    'Early Growth': 'Ukuaji wa Awali',
    'Vegetative Stage': 'Ukuaji wa Majani na Matawi',
    'Flowering Stage': 'Kipindi cha Kuchanua Maua',
    'Fruit / Vegetable Development': 'Ukuaji wa Matunda / Nafaka',
    'Maturity': 'Kukomaa kwa Zao',
    'Harvest': 'Kipindi cha Mavuno',
  },
};

/**
 * Generate fully translated Stage Irrigation Guidance
 */
export function getLocalizedStageAdvisory(
  cropName: string,
  stageName: LifeCycleStageName,
  soilType: SoilType,
  status: IrrigationStatus,
  upcomingRain: number,
  maxRainProb: number,
  temp: number,
  language: SupportedLanguage = 'en'
): LocalizedStageAdvisory {
  const isHarvest = stageName === 'Maturity' || stageName === 'Harvest';
  const hasRain = status === 'POSTPONE';
  const isIrrigate = status === 'IRRIGATE_NOW';

  const transStage = (LOCALIZED_STAGES[language] || LOCALIZED_STAGES.en)[stageName] || stageName;

  switch (language) {
    case 'ta':
      return {
        statusTitle: isHarvest
          ? 'பாசனத்தை நிறுத்தவும்: பயிர் முதிர்ச்சி / அறுவடை நிலை'
          : hasRain
          ? `பாசனத்தை ஒத்திவைக்கவும்: மழை வரவுள்ளது (${upcomingRain.toFixed(1)} மி.மீ)`
          : isIrrigate
          ? 'இன்றே பாசனம் செய்யவும்: மண் ஈரப்பதம் குறைவு'
          : 'வேர் பகுதி மண் ஈரப்பதத்தை கண்காணிக்கவும்',
        primaryExplanation: isHarvest
          ? `${cropName} பயிர் தற்போது ${transStage} நிலையில் உள்ளது. அறுவடைக்கு 10-15 நாட்களுக்கு முன்பே பாசனத்தை நிறுத்த வேண்டும். இது தானியங்கள் சீராக உலரவும், பழங்கள் அழுகாமல் இருக்கவும், மண் கெட்டியாகி அறுவடை இயந்திரங்கள் எளிதாக இறங்கவும் உதவும்.`
          : hasRain
          ? `அடுத்த 72 மணி நேரத்தில் சுமார் ${upcomingRain.toFixed(1)} மி.மீ மழை பெய்ய வாய்ப்புள்ளது (${maxRainProb}% வாய்ப்பு). இயற்கை மழையே வேர் மண்டலத்தை ஈரப்படுத்தும். இப்போது தண்ணீர் பாய்ச்சினால் ${soilType} மண்ணில் நீர் தேங்கி வேரழுகல் மற்றும் சத்துக்கள் அடித்துச் செல்லப்படும் அபாயம் உள்ளது.`
          : isIrrigate
          ? `தற்போதைய வெப்பநிலை (${temp}°C) மற்றும் ${soilType} மண் தன்மையால் நீர் ஆவியாதல் அதிகம். பயிரின் வளர்ச்சி பாதிக்காமல் இருக்க அதிகாலை அல்லது மாலையில் சீரான பாசனம் அளிக்கவும்.`
          : `தற்போதைய வானிலையில் மண் ஈரப்பதம் மிதமாக உள்ளது. ${soilType} மண்ணில் 5-10 செ.மீ ஆழத்தில் பரிசோதித்து தேவைப்பட்டால் மட்டும் மிதமான பாசனம் செய்யவும்.`,
        postponementReason: hasRain
          ? `எதிர்பார்க்கப்படும் ${upcomingRain.toFixed(1)} மி.மீ மழை மண்ணின் ஈரப்பதத்தை ஈடுசெய்யும். வீணாக பாசனம் செய்து வேர் அழுகலை உண்டாக்காதீர்கள்.`
          : null,
        ruleTitle: 'நம்பகமான வேளாண் விதிமுறை',
        ruleDescription: isHarvest
          ? 'அறுவடைக்கு முன் பாசனத்தை நிறுத்துவது விளைபொருளின் சேமிப்பு காலத்தை கூட்டும் மற்றும் பூஞ்சை தாக்குதலை முழுமையாக தடுக்கும்.'
          : 'பூக்கும் மற்றும் காய் பிடிக்கும் தருணங்களில் நீர் பற்றாக்குறை வராமல் காப்பதே அதிக மகசூலின் திறவுகோலாகும்.',
        soilGuidance: `${soilType} மண் நீர் வடியும் தன்மையை சீராக வைத்திருக்க வடிகால்களை தூர்வாரி வைக்கவும்.`,
        checklistTitle: 'முக்கிய களப்பணிகள் சரிபார்ப்பு பட்டியல்',
        checkSteps: isHarvest
          ? [
              'அறுவடைக்கு 10-15 நாட்களுக்கு முன் பாசனத்தை முழுமையாக நிறுத்துங்கள்.',
              'தானியங்கள் அல்லது காய்களின் ஈரப்பதம் அறுவடைக்கு ஏற்றவாறு உள்ளதா என சோதிக்கவும்.',
              'அறுவடை செய்த விளைபொருளை வெயிலில் காய வைக்காமல் நிழலில் உலர்த்துங்கள்.',
            ]
          : hasRain
          ? [
              'மழைநீர் தேங்காமல் வழிய வரப்பு வடிகால்களை திறந்து வையுங்கள்.',
              'மழை முடியும் வரை உரமிடுதல் அல்லது பூச்சிக்கொல்லி தெளிப்பை தள்ளிப்போடுங்கள்.',
              'மழை நின்ற பின் மண்ணின் ஈரப்பதத்தை அளவிடவும்.',
            ]
          : [
              'அதிகாலை வேளையில் மட்டுமே மிதமான பாசனம் செய்யவும்.',
              'இலைகளில் பூச்சி அல்லது பூஞ்சை அறிகுறிகளை உற்று கவனியுங்கள்.',
              'ஈரப்பதம் காக்க இயற்கை மூடாக்கு அமைக்கவும்.',
            ],
        weatherFactorsTitle: 'நீர் தேவையை அதிகரிக்கும் வானிலை காரணிகள்',
        weatherConservingTitle: 'ஈரப்பதத்தை பாதுகாக்கும் வானிலை காரணிகள்',
        suitabilityTitle: 'வானிலை & காலநிலை பொருத்தம்',
      };

    case 'hi':
      return {
        statusTitle: isHarvest
          ? 'सिंचाई बंद करें: परिपक्वता / कटाई अवस्था'
          : hasRain
          ? `सिंचाई स्थगित करें: बारिश का पूर्वानुमान (${upcomingRain.toFixed(1)} मिमी)`
          : isIrrigate
          ? 'सिंचाई की तत्काल आवश्यकता: मिट्टी में नमी कम'
          : 'जड़ क्षेत्र में मिट्टी की नमी की निगरानी करें',
        primaryExplanation: isHarvest
          ? `${cropName} फसल इस समय ${transStage} में है। कटाई से 10-15 दिन पूर्व सिंचाई रोक दें ताकि दाने अच्छी तरह पकें, फफूंद न लगे और कटाई मशीन आसानी से चल सके।`
          : hasRain
          ? `अगले 72 घंटों में लगभग ${upcomingRain.toFixed(1)} मिमी बारिश का अनुमान है (${maxRainProb}% संभावना)। बारिश से मिट्टी को स्वाभाविक नमी मिलेगी। अभी पानी देने से ${soilType} मिट्टी में जलभराव और खाद बहने का खतरा है।`
          : isIrrigate
          ? `वर्तमान तापमान (${temp}°C) के कारण ${soilType} मिट्टी से नमी तेजी से घट रही है। सुबह के समय हल्की सिंचाई करें।`
          : `मौसम सामान्य है। ${soilType} मिट्टी में 5-10 सेमी गहराई पर नमी जांचें, आवश्यकता होने पर ही पानी दें।`,
        postponementReason: hasRain
          ? `आगामी ${upcomingRain.toFixed(1)} मिमी वर्षा से फसल को पर्याप्त नमी मिलेगी। अनावश्यक पानी न लगाएं।`
          : null,
        ruleTitle: 'प्रमाणित कृषि सिद्धांत',
        ruleDescription: isHarvest
          ? 'कटाई से पहले पानी रोकना दाने की चमक बढ़ाता है और भंडारण में सड़ांध से बचाता है।'
          : 'फूल और फल बनने के समय नमी का संतुलन बनाए रखना अधिकतम उपज के लिए आवश्यक है।',
        soilGuidance: `${soilType} मिट्टी में जलभराव रोकने के लिए जल निकासी नालियों को साफ रखें।`,
        checklistTitle: 'किसान भाइयों के लिए आज के जरूरी काम',
        checkSteps: isHarvest
          ? [
              'कटाई से 10-15 दिन पहले सिंचाई पूरी तरह बंद कर दें।',
              'फसल में दाने की परिपक्वता और नमी (12-14%) की जांच करें।',
              'कटाई उपरांत उपज को सूखे और हवादार स्थान पर रखें।',
            ]
          : hasRain
          ? [
              'खेत की जलनिकास नालियों को खोलें ताकि पानी न भरे।',
              'बारिश के पहले किसी भी कीटनाशक या यूरिया का छिड़काव न करें।',
              'बारिश के बाद ही खेत में नमी देखकर अगला निर्णय लें।',
            ]
          : [
              'तेज धूप से बचने के लिए सुबह जल्दी सिंचाई करें।',
              'जड़ों के पास नमी बनाए रखने के लिए मल्चिंग करें।',
              'पत्तियों पर रस चूसक कीटों की निगरानी करें।',
            ],
        weatherFactorsTitle: 'पानी की मांग बढ़ाने वाले मौसमी कारक',
        weatherConservingTitle: 'नमी संरक्षित करने वाले मौसमी कारक',
        suitabilityTitle: 'मौसम व जलवायु उपयुक्तता',
      };

    case 'te':
      return {
        statusTitle: isHarvest
          ? 'నీటిపారుదల ఆపివేయండి: కోత / పరిపక్వత దశ'
          : hasRain
          ? `నీటిపారుదల వాయిదా వేయండి: వర్ష సూచన (${upcomingRain.toFixed(1)} మి.మీ)`
          : isIrrigate
          ? 'వెంటనే నీరు పెట్టండి: నేలలో తేమ తక్కువ'
          : 'వేరు మండలంలో తేమను పర్యవేక్షించండి',
        primaryExplanation: isHarvest
          ? `${cropName} ప్రస్తుతం ${transStage} దశలో ఉంది. కోతకు 10-15 రోజుల ముందు నీరు పెట్టడం పూర్తిగా ఆపాలి.`
          : hasRain
          ? `రాబోయే 72 గంటల్లో దాదాపు ${upcomingRain.toFixed(1)} మి.మీ వర్షం కురిసే అవకాశం ఉంది. ఇప్పుడు నీరు పెడితే నీరు నిలిచి పంట పాడవుతుంది.`
          : isIrrigate
          ? `ప్రస్తుత ఉష్ణోగ్రత (${temp}°C) వల్ల నేలలోని తేమ వేగంగా తగ్గుతోంది. ఉదయాన్నే నీరు పెట్టండి.`
          : `వాతావరణం అనుకూలంగా ఉంది. 5-10 సెం.మీ లోతులో తేమను తనిఖీ చేసి అవసరమైతేనే నీరు ఇవ్వండి.`,
        postponementReason: hasRain ? `వర్షపాతం నేలకు సరిపడా తేమను అందిస్తుంది.` : null,
        ruleTitle: 'ప్రామాణిక వ్యవసాయ నియమం',
        ruleDescription: 'కోతకు ముందు నీరు నిలిపివేయడం గింజ నాణ్యతను పెంచుతుంది.',
        soilGuidance: `${soilType} నేలలో మురుగు నీరు నిలవకుండా కాలువలను సిద్ధం చేయండి.`,
        checklistTitle: 'ముఖ్యమైన క్షేత్రస్థాయి పనుల జాబితా',
        checkSteps: [
          'మురుగు కాలువలను శుభ్రంగా ఉంచండి.',
          'తేమ తనిఖీ చేసిన తర్వాతే నీటిపారుదల చేపట్టండి.',
          'ఎండ ఎక్కువగా ఉన్నప్పుడు రసాయనాలు పిచికారీ చేయవద్దు.',
        ],
        weatherFactorsTitle: 'నీటి అవసరాన్ని పెంచే వాతావరణ అంశాలు',
        weatherConservingTitle: 'తేమను కాపాడే వాతావరణ అంశాలు',
        suitabilityTitle: 'వాతావరణ & శీతోష్ణస్థితి అనుకూలత',
      };

    case 'kn':
      return {
        statusTitle: isHarvest
          ? 'ನೀರಾವರಿ ನಿಲ್ಲಿಸಿ: ಕೊಯ್ಲು / ಪಕ್ವತೆಯ ಹಂತ'
          : hasRain
          ? `ನೀರಾವರಿ ಮುಂದೂಡಿ: ಮಳೆಯ ಮುನ್ಸೂಚನೆ (${upcomingRain.toFixed(1)} ಮಿಮೀ)`
          : isIrrigate
          ? 'ಕೂಡಲೇ ನೀರು ಹಾಯಿಸಿ: ಮಣ್ಣಿನಲ್ಲಿ ತೇವಾಂಶ ಕೊರತೆ'
          : 'ಬೇರಿನ ವಲಯದಲ್ಲಿ ತೇವಾಂಶವನ್ನು ಗಮನಿಸಿ',
        primaryExplanation: isHarvest
          ? `${cropName} ಬೆಳೆಯು ${transStage} ಹಂತದಲ್ಲಿದೆ. ಕೊಯ್ಲಿಗೆ 10-15 ದಿನಗಳ ಮುಂಚಿತವಾಗಿ ನೀರು ಹಾಯಿಸುವುದನ್ನು ನಿಲ್ಲಿಸಿ.`
          : hasRain
          ? `ಮುಂದಿನ 72 ಗಂಟೆಗಳಲ್ಲಿ ಸುಮಾರು ${upcomingRain.toFixed(1)} ಮಿಮೀ ಮಳೆಯಾಗುವ ಸಾಧ್ಯತೆಯಿದೆ. ನೈಸರ್ಗಿಕ ಮಳೆಯೇ ಮಣ್ಣನ್ನು ತೇವಗೊಳಿಸುತ್ತದೆ.`
          : isIrrigate
          ? `ಪ್ರಸ್ತುತ ತಾಪಮಾನ (${temp}°C) ಹೆಚ್ಚಿರುವುದರಿಂದ ಬೆಳಿಗ್ಗೆ ಲಘು ನೀರಾವರಿ ನೀಡಿ.`
          : `ಪರಿಸ್ಥಿತಿ ಸಾಧಾರಣವಾಗಿದೆ. ಮಣ್ಣಿನ ತೇವಾಂಶ ಪರೀಕ್ಷಿಸಿ ಅಗತ್ಯವಿದ್ದಾಗ ಮಾತ್ರ ನೀರು ಹಾಯಿಸಿ.`,
        postponementReason: hasRain ? `ನಿರೀಕ್ಷಿತ ಮಳೆಯು ಬೇರಿಗೆ ಅಗತ್ಯ ತೇವಾಂಶ ಒದಗಿಸುತ್ತದೆ.` : null,
        ruleTitle: 'ವಿಶ್ವಾಸಾರ್ಹ ಕೃಷಿ ನಿಯಮ',
        ruleDescription: 'ಕೊಯ್ಲಿನ ಮುನ್ನ ನೀರು ನಿಲ್ಲಿಸುವುದು ಕಾಳುಗಳನ್ನು ಗಟ್ಟಿಗೊಳಿಸುತ್ತದೆ.',
        soilGuidance: `${soilType} ಮಣ್ಣಿನಲ್ಲಿ ನೀರು ನಿಲ್ಲದಂತೆ ಕಾಲುವೆಗಳನ್ನು ತೆರವುಗೊಳಿಸಿ.`,
        checklistTitle: 'ಇಂದಿನ ಪ್ರಮುಖ ಕೃಷಿ ಕಾರ್ಯಗಳು',
        checkSteps: [
          'ಬೆಳೆಯ ಬುಡದಲ್ಲಿ ನೀರು ನಿಲ್ಲದಂತೆ ಎಚ್ಚರವಹಿಸಿ.',
          'ಮಳೆ ಮುನ್ಸೂಚನೆ ಇದ್ದಾಗ ಗೊಬ್ಬರ ಅಥವಾ ಕೀಟನಾಶಕ ಸಿಂಪಡಿಸಬೇಡಿ.',
          'ಮಣ್ಣಿನ ತೇವಾಂಶವನ್ನು ಪರೀಕ್ಷಿಸಿ ನಿರ್ಧಾರ ಕೈಗೊಳ್ಳಿ.',
        ],
        weatherFactorsTitle: 'ನೀರಿನ ಬೇಡಿಕೆ ಹೆಚ್ಚಿಸುವ ಹವಾಮಾನ ಅಂಶಗಳು',
        weatherConservingTitle: 'ತೇವಾಂಶ ಉಳಿಸುವ ಹವಾಮಾನ ಅಂಶಗಳು',
        suitabilityTitle: 'ಹವಾಮಾನ ಮತ್ತು ವಾಯುಗುಣ ಹೊಂದಾಣಿಕೆ',
      };

    case 'pa':
      return {
        statusTitle: isHarvest
          ? 'ਸਿੰਚਾਈ ਬੰਦ ਕਰੋ: ਫਸਲ ਪੱਕਣ / ਵਾਢੀ ਦੀ ਅਵਸਥਾ'
          : hasRain
          ? `ਸਿੰਚਾਈ ਰੋਕੋ: ਮੀਂਹ ਦੀ ਸੰਭਾਵਨਾ (${upcomingRain.toFixed(1)} ਮਿ.ਮੀ.)`
          : isIrrigate
          ? 'ਸਿੰਚਾਈ ਕਰੋ: ਮਿੱਟੀ ਵਿੱਚ ਨਮੀ ਘਟ ਗਈ ਹੈ'
          : 'ਜੜ੍ਹ ਖੇਤਰ ਵਿੱਚ ਨਮੀ ਦੀ ਪਰਖ ਕਰੋ',
        primaryExplanation: isHarvest
          ? `${cropName} ਫਸਲ ${transStage} ਅਵਸਥਾ ਵਿੱਚ ਹੈ। ਵਾਢੀ ਤੋਂ 10-15 ਦਿਨ ਪਹਿਲਾਂ ਪਾਣੀ ਪੂਰੀ ਤਰ੍ਹਾਂ ਬੰਦ ਕਰ ਦਿਓ।`
          : hasRain
          ? `ਅਗਲੇ 72 ਘੰਟਿਆਂ ਵਿੱਚ ਲਗਭਗ ${upcomingRain.toFixed(1)} ਮਿ.ਮੀ. ਮੀਂਹ ਪੈਣ ਦੀ ਉਮੀਦ ਹੈ। ਹੁਣੇ ਪਾਣੀ ਨਾ ਲਾਓ।`
          : isIrrigate
          ? `ਤਾਪਮਾਨ (${temp}°C) ਕਾਰਨ ${soilType} ਜ਼ਮੀਨ ਵਿੱਚ ਨਮੀ ਘਟੀ ਹੈ। ਸਵੇਰੇ ਹਲਕਾ ਪਾਣੀ ਲਾਓ।`
          : `ਮੌਸਮ ਆਮ ਹੈ। ਜ਼ਮੀਨ ਵਿੱਚ 5-10 ਸੈਂਟੀਮੀਟਰ ਡੂੰਘਾਈ 'ਤੇ ਨਮੀ ਪਰਖੋ।`,
        postponementReason: hasRain ? `ਆਉਣ ਵਾਲਾ ਮੀਂਹ ਖੇਤ ਨੂੰ ਲੋੜੀਂਦੀ ਨਮੀ ਦੇਵੇਗਾ।` : null,
        ruleTitle: 'ਪ੍ਰਮਾਣਿਤ ਖੇਤੀ ਅਸੂਲ',
        ruleDescription: 'ਵਾਢੀ ਤੋਂ ਪਹਿਲਾਂ ਪਾਣੀ ਬੰਦ ਕਰਨਾ ਦਾਣੇ ਦੀ ਕੁਆਲਿਟੀ ਵਧਾਉਂਦਾ ਹੈ।',
        soilGuidance: `${soilType} ਜ਼ਮੀਨ ਵਿੱਚ ਪਾਣੀ ਦੇ ਨਿਕਾਸ ਦਾ ਪ੍ਰਬੰਧ ਰੱਖੋ।`,
        checklistTitle: 'ਅੱਜ ਦੇ ਜ਼ਰੂਰੀ ਖੇਤੀ ਕੰਮ',
        checkSteps: [
          'ਮੀਂਹ ਤੋਂ ਪਹਿਲਾਂ ਨਿਕਾਸ ਨਾਲਿਆਂ ਦੀ ਸਫਾਈ ਕਰੋ।',
          'ਮੀਂਹ ਦੀ ਸੰਭਾਵਨਾ ਸਮੇਂ ਸਪਰੇਅ ਜਾਂ ਯੂਰੀਆ ਨਾ ਪਾਓ।',
          'ਮਿੱਟੀ ਦੀ ਨਮੀ ਵੇਖ ਕੇ ਹੀ ਅਗਲਾ ਪਾਣੀ ਲਾਓ।',
        ],
        weatherFactorsTitle: 'ਪਾਣੀ ਦੀ ਮੰਗ ਵਧਾਉਣ ਵਾਲੇ ਮੌਸਮੀ ਕਾਰਕ',
        weatherConservingTitle: 'ਨਮੀ ਬਚਾਉਣ ਵਾਲੇ ਮੌਸਮੀ ਕਾਰਕ',
        suitabilityTitle: 'ਮੌਸਮ ਅਤੇ ਜਲਵਾਯੂ ਅਨੁਕੂਲਤਾ',
      };

    case 'es':
      return {
        statusTitle: isHarvest
          ? 'Suspender Riego: Etapa de Madurez / Cosecha'
          : hasRain
          ? `Posponer Riego: Lluvia Prevista (${upcomingRain.toFixed(1)} mm)`
          : isIrrigate
          ? 'Riego Recomendado: Baja Humedad en Suelo'
          : 'Monitorear Humedad en Zona Radicular',
        primaryExplanation: isHarvest
          ? `${cropName} se encuentra en fase de ${transStage}. Suspenda el riego suplementario 10-15 días antes de la cosecha para facilitar el secado y evitar pudriciones.`
          : hasRain
          ? `Se pronostican aproximadamente ${upcomingRain.toFixed(1)} mm de lluvia en las próximas 72 horas (${maxRainProb}% de probabilidad). El riego ahora provocaría encharcamiento en suelo ${soilType}.`
          : isIrrigate
          ? `La temperatura actual (${temp}°C) acelera la evapotranspiración en suelo ${soilType}. Riegue temprano por la mañana.`
          : `Condiciones moderadas. Compruebe la humedad a 5-10 cm de profundidad antes de regar.`,
        postponementReason: hasRain ? `La lluvia proyectada suplirá las necesidades hídricas naturales.` : null,
        ruleTitle: 'Regla Agronómica Fundamental',
        ruleDescription: 'Detener el riego previo a cosecha mejora la firmeza y vida poscosecha del fruto/grano.',
        soilGuidance: `Mantenga zanjas de drenaje limpias en suelo ${soilType}.`,
        checklistTitle: 'Lista de Verificación de Campo',
        checkSteps: [
          'Limpiar surcos y desagües para evitar encharcamientos.',
          'No aplicar agroquímicos si se prevén lluvias en 24 horas.',
          'Verificar la humedad antes de iniciar el ciclo de bombeo.',
        ],
        weatherFactorsTitle: 'Factores que incrementan la demanda de agua',
        weatherConservingTitle: 'Factores que conservan la humedad',
        suitabilityTitle: 'Idoneidad Climática y Meteorológica',
      };

    default:
      return {
        statusTitle: isHarvest
          ? 'Cease Irrigation: Crop at Maturity / Harvest Phase'
          : hasRain
          ? `Postpone Irrigation: Rain Forecast Ahead (${upcomingRain.toFixed(1)} mm)`
          : isIrrigate
          ? 'Irrigation Advised: Elevated Evapotranspiration'
          : 'Monitor Root-Zone Soil Moisture Before Irrigating',
        primaryExplanation: isHarvest
          ? `${cropName} is in the ${transStage} phase. Agricultural protocols mandate withdrawing supplemental irrigation 10-15 days prior to harvest. This allows produce to cure, prevents fungal decay, and avoids crop lodging.`
          : hasRain
          ? `With approximately ${upcomingRain.toFixed(1)} mm of rain projected over the next 72 hours (${maxRainProb}% peak probability), natural rainfall is expected to replenish the root zone. Applying irrigation now would cause surface runoff and risk root waterlogging in ${soilType} soil.`
          : isIrrigate
          ? `Current temperature (${temp}°C) and atmospheric conditions indicate active root water consumption in ${soilType} soil. Apply light supplemental irrigation during early morning hours.`
          : `Atmospheric moisture is currently balanced (${temp}°C). Inspect moisture depth at 5-10 cm before starting pumps.`,
        postponementReason: hasRain
          ? `Forecast rainfall of ${upcomingRain.toFixed(1)} mm is sufficient to recharge the root zone naturally.`
          : null,
        ruleTitle: 'Reliable Agricultural Rule',
        ruleDescription: isHarvest
          ? 'Withholding irrigation prior to harvest hardens produce and maximizes post-harvest shelf life.'
          : 'Maintaining steady moisture at critical stages prevents flower abortion and blossom end rot.',
        soilGuidance: `In ${soilType} soil, ensure peripheral drainage furrows are open to prevent localized puddling.`,
        checklistTitle: 'Critical Field Checklist',
        checkSteps: isHarvest
          ? [
              'Withhold irrigation 10-15 days before harvest.',
              'Check grain/fruit firmness and maturity indices.',
              'Store harvested crop in dry, well-ventilated shaded sheds.',
            ]
          : hasRain
          ? [
              'Ensure drainage ditches are clear of weeds and sediment.',
              'Postpone fertilizer broadcasting and chemical spraying until rain passes.',
              'Check root-zone moisture depth after the storm passes.',
            ]
          : [
              'Water during early morning to reduce midday evaporation.',
              'Scout undersides of leaves for emerging sap-sucking pests.',
              'Maintain mulch cover to shield topsoil from solar heat.',
            ],
        weatherFactorsTitle: 'Weather Factors Increasing Water Demand',
        weatherConservingTitle: 'Weather Factors Conserving Moisture',
        suitabilityTitle: 'Weather & Climate Suitability',
      };
  }
}

/**
 * Generate localized standing crop agronomic advice for any language
 */
export function getLocalizedStandingAdvice(
  cropName: string,
  stageName: string,
  language: SupportedLanguage = 'en'
): LocalizedStandingAdvice {
  switch (language) {
    case 'ta':
      return {
        stageSummary: `${cropName} பயிரின் ${stageName} நிலையிலான கள மேலாண்மை வழிகாட்டுதல். தற்போதைய வானிலை சூழலில் வேர் மண்டல ஈரப்பதம் மற்றும் பயிர் பாதுகாப்பில் கவனம் செலுத்தவும்.`,
        actionItems: [
          'வேர் மண்டலத்தில் 10-15 செ.மீ ஆழத்தில் மண் ஈரப்பதத்தை பரிசோதிக்கவும்.',
          'வயல் வடிகால் வாய்க்கால்களை அடைப்புகள் இல்லாமல் தூய்மையாக வைத்திருக்கவும்.',
          'காலை அல்லது மாலை வேளையில் மட்டுமே களப்பணிகளை மேற்கொள்ளவும்.',
        ],
        pestVigilance: 'இலைகளின் அடிப்பகுதி மற்றும் தண்டுப் பகுதியில் சாறு உறிஞ்சும் பூச்சிகள் அல்லது பூஞ்சை புள்ளிகள் உள்ளதா என அதிகாலையில் ஆய்வு செய்யவும்.',
        fertilizerAdvice: 'காற்று வேகம் 15 கி.மீ/மணிக்கு மேல் இருக்கும் போதோ அல்லது அடுத்த 24 மணி நேரத்தில் மழை எதிர்பார்க்கப்படும் போதோ இலைவழி தெளிப்புகளை தவிர்க்கவும்.',
      };

    case 'hi':
      return {
        stageSummary: `${cropName} फसल की ${stageName} अवस्था के लिए कृषि परामर्श। वर्तमान मौसम में जड़ क्षेत्र की नमी और फसल सुरक्षा पर विशेष ध्यान दें।`,
        actionItems: [
          'जड़ क्षेत्र में 10-15 सेमी गहराई पर मिट्टी की नमी जांचें।',
          'खेत की जलनिकासी नालियों को साफ रखें ताकि पानी जमा न हो।',
          'खेत के आवश्यक कार्य सुबह या देर शाम के समय ही करें।',
        ],
        pestVigilance: 'सुबह के समय निचली पत्तियों और तने पर कीटों या फफूंद के लक्षणों की बारीकी से निगरानी करें।',
        fertilizerAdvice: '15 किमी/घंटा से अधिक तेज हवा या आगामी 24 घंटे में बारिश की संभावना होने पर किसी भी रसायन का छिड़काव न करें।',
      };

    case 'te':
      return {
        stageSummary: `${cropName} పంట ${stageName} దశకు సంబంధించిన వ్యవసాయ సూచనలు. ప్రస్తుత వాతావరణంలో తేమ మరియు తెగుళ్ల నివారణపై శ్రద్ధ వహించండి.`,
        actionItems: [
          'వేరు మండలంలో 10-15 సెం.మీ లోతులో నేల తేమను పరిశీలించండి.',
          'మురుగునీటి కాలువలను ఎప్పటికప్పుడు శుభ్రపరచండి.',
          'పనులను ఉదయం లేదా సాయంత్రం వేళల్లోనే నిర్వహించండి.',
        ],
        pestVigilance: 'ఉదయాన్నే ఆకుల అడుగుభాగం మరియు కాండంపై తెగుళ్లు లేదా శిలీంధ్రాల గుర్తులను గమనించండి.',
        fertilizerAdvice: 'గాలి వేగం గంటకు 15 కి.మీ దాటినా లేదా రాబోయే 24 గంటల్లో వర్ష సూచన ఉన్నా పిచికారీ చేయవద్దు.',
      };

    case 'kn':
      return {
        stageSummary: `${cropName} ಬೆಳೆಯ ${stageName} ಹಂತದ ಕೃಷಿ ನಿರ್ವಹಣಾ ಸಲಹೆಗಳು. ಪ್ರಸ್ತುತ ಹವಾಮಾನದಲ್ಲಿ ತೇವಾಂಶ ಮತ್ತು ಬೆಳೆ ರಕ್ಷಣೆಗೆ ಆದ್ಯತೆ ನೀಡಿ.`,
        actionItems: [
          'ಬೇರಿನ ಆಳದಲ್ಲಿ (10-15 ಸೆಂ.ಮೀ) ಮಣ್ಣಿನ ತೇವಾಂಶವನ್ನು ಪರೀಕ್ಷಿಸಿ.',
          'ಬಸಿಗಾಲುವೆಗಳನ್ನು ಸ್ವಚ್ಛವಾಗಿಟ್ಟುಕೊಳ್ಳಿ.',
          'ಬೆಳಗಿನ ಅಥವಾ ಸಂಜೆಯ ವೇಳೆಯಲ್ಲಿ ಕೃಷಿ ಕೆಲಸಗಳನ್ನು ನಿರ್ವಹಿಸಿ.',
        ],
        pestVigilance: 'ಎಲೆಗಳ ಕೆಳಭಾಗ ಮತ್ತು ಕಾಂಡದ ಬುಡದಲ್ಲಿ ಕೀಟ ಅಥವಾ ಶಿಲೀಂಧ್ರ ರೋಗಲಕ್ಷಣಗಳನ್ನು ಗಮನಿಸಿ.',
        fertilizerAdvice: 'ಗಾಳಿಯ ವೇಗ ಹೆಚ್ಚಿರುವಾಗ ಅಥವಾ ಮಳೆಯ ಮುನ್ಸೂಚನೆ ಇರುವಾಗ ಸಿಂಪಡಣೆಯನ್ನು ಕೈಗೊಳ್ಳಬೇಡಿ.',
      };

    case 'pa':
      return {
        stageSummary: `${cropName} ਦੀ ${stageName} ਅਵਸਥਾ ਲਈ ਖੇਤੀਬਾੜੀ ਸਲਾਹ। ਮੌਜੂਦਾ ਮੌਸਮ ਵਿੱਚ ਜੜ੍ਹ ਖੇਤਰ ਦੀ ਨਮੀ ਅਤੇ ਕੀੜਿਆਂ ਦੀ ਰੋਕਥਾਮ ਵੱਲ ਧਿਆਨ ਦਿਓ।`,
        actionItems: [
          'ਜੜ੍ਹ ਖੇਤਰ ਵਿੱਚ 10-15 ਸੈਂਟੀਮੀਟਰ ਡੂੰਘਾਈ ਤੇ ਮਿੱਟੀ ਦੀ ਨਮੀ ਪਰਖੋ।',
          'ਪਾਣੀ ਦੇ ਨਿਕਾਸ ਵਾਲੀਆਂ ਨਾਲੀਆਂ ਨੂੰ ਸਾਫ਼ ਰੱਖੋ।',
          'ਸਵੇਰੇ ਜਾਂ ਸ਼ਾਮ ਦੇ ਵੇਲੇ ਹੀ ਖੇਤ ਦੇ ਕੰਮ ਕਰੋ।',
        ],
        pestVigilance: 'ਸਵੇਰ ਸਮੇਂ ਪੱਤਿਆਂ ਦੇ ਹੇਠਲੇ ਹਿੱਸੇ ਤੇ ਕੀੜਿਆਂ ਜਾਂ ਉੱਲੀ ਦੀ ਜਾਂਚ ਕਰੋ।',
        fertilizerAdvice: 'ਤੇਜ਼ ਹਵਾ (15 ਕਿਲੋਮੀਟਰ/ਘੰਟਾ ਤੋਂ ਵੱਧ) ਜਾਂ ਮੀਂਹ ਦੀ ਸੰਭਾਵਨਾ ਵੇਲੇ ਛਿੜਕਾਅ ਨਾ ਕਰੋ।',
      };

    case 'es':
      return {
        stageSummary: `Manejo agronómico para ${cropName} en la etapa de ${stageName}. Priorice la humedad radicular y la sanidad vegetal bajo el clima actual.`,
        actionItems: [
          'Verificar la humedad del suelo a 10-15 cm de profundidad en la zona radicular.',
          'Mantener limpias las zanjas de drenaje para evitar encharcamientos.',
          'Realizar labores agrícolas en las primeras horas de la mañana.',
        ],
        pestVigilance: 'Inspeccionar el envés de las hojas y la base del tallo en busca de plagas o manchas fúngicas.',
        fertilizerAdvice: 'No realizar aplicaciones foliares con viento superior a 15 km/h o pronóstico de lluvia en 24 horas.',
      };

    default:
      return {
        stageSummary: `Agronomic standing crop protocol for ${cropName} during the ${stageName} phase. Prioritize balanced root-zone moisture and proactive plant health monitoring under current weather conditions.`,
        actionItems: [
          'Inspect root-zone moisture depth (10-15 cm) using feel-and-appearance testing.',
          'Clear field drainage swales to prevent localized pooling.',
          'Schedule critical field operations during early morning or late afternoon hours.',
        ],
        pestVigilance: 'Scout lower leaves and stem bases in early morning for emerging sap-sucking insects or foliar fungal lesions.',
        fertilizerAdvice: 'Never spray foliar agrochemicals when ambient wind speeds exceed 15 km/h or within 24 hours of anticipated rainfall.',
      };
  }
}

