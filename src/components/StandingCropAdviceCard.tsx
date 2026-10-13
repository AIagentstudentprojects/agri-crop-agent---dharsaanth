import React from 'react';
import { Wheat, CheckCircle2, AlertTriangle, Bug, Sparkles } from 'lucide-react';
import { StandingCropAdvice } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { getLocalizedStandingAdvice } from '../utils/localizedAdvisoryEngine';

interface Props {
  advice?: StandingCropAdvice;
  cropName?: string;
  stageName?: string;
}

export const StandingCropAdviceCard: React.FC<Props> = ({ advice, cropName, stageName }) => {
  const { language } = useLanguage();

  if (!advice && !cropName) {
    return null;
  }

  const displayedCrop = advice?.cropName || cropName || 'Standing Crop';
  const displayedStage = advice?.stage || stageName || 'Current Stage';

  // Get localized fallback advice
  const localizedAdvice = getLocalizedStandingAdvice(displayedCrop, displayedStage, language);

  // If advice is available and isn't purely empty, prefer it; otherwise use localized
  const stageSummary = advice?.stageSummary || localizedAdvice.stageSummary;
  const actionItems =
    advice?.keyActionItems && advice.keyActionItems.length > 0
      ? advice.keyActionItems
      : localizedAdvice.actionItems;
  const pestVigilance = advice?.pestAndDiseaseVigilance || localizedAdvice.pestVigilance;
  const sprayAdvice = advice?.fertilizerAndSprayAdvice || localizedAdvice.fertilizerAdvice;

  // Localized UI header labels
  const uiLabels = {
    en: {
      cardTitle: `Standing Crop Care: ${displayedCrop}`,
      subtitle: 'Stage-specific field actions, weather safeguards, and chemical spray timings',
      tag: 'Agronomic Stage Mandates',
      tasksTitle: 'Priority Field Tasks',
      pestTitle: 'Pest & Disease Vigilance',
      sprayTitle: 'Chemical & Fertilizer Rules',
    },
    hi: {
      cardTitle: `खड़ी फसल देखभाल: ${displayedCrop}`,
      subtitle: 'अवस्था-विशिष्ट कार्य, मौसम सुरक्षा उपाय और कीटनाशक छिड़काव समय',
      tag: 'कृषि अवस्था निर्देश',
      tasksTitle: 'प्राथमिक कृषि कार्य',
      pestTitle: 'कीट एवं रोग सतर्कता',
      sprayTitle: 'उर्वरक एवं छिड़काव नियम',
    },
    ta: {
      cardTitle: `வயல் பயிர் பாதுகாப்பு: ${displayedCrop}`,
      subtitle: 'வளர்ச்சி நிலை சார்ந்த களப்பணிகள், வானிலை பாதுகாப்பு மற்றும் தெளிப்பு நேரங்கள்',
      tag: 'வேளாண் நிலை வழிகாட்டல்',
      tasksTitle: 'முன்னுரிமை களப் பணிகள்',
      pestTitle: 'பூச்சி மற்றும் நோய் கண்காணிப்பு',
      sprayTitle: 'உரங்கள் & தெளிப்பு நெறிமுறைகள்',
    },
    te: {
      cardTitle: `పంట సంరక్షణ: ${displayedCrop}`,
      subtitle: 'దశలవారీ పనులు, వాతావరణ రక్షణ చర్యలు మరియు పిచికారీ సమయాలు',
      tag: 'వ్యవసాయ దశ మార్గదర్శకాలు',
      tasksTitle: 'ముఖ్యమైన క్షేత్ర పనులు',
      pestTitle: 'పురుగులు & తెగుళ్ల నిఘా',
      sprayTitle: 'ఎరువులు & పిచికారీ నియమాలు',
    },
    kn: {
      cardTitle: `ಬೆಳೆ ಸಂರಕ್ಷಣೆ: ${displayedCrop}`,
      subtitle: 'ಹಂತ-ನಿರ್ದಿಷ್ಟ ಕ್ಷೇತ್ರ ಕಾರ್ಯಗಳು ಮತ್ತು ಸಿಂಪಡಣೆ ಸಮಯ',
      tag: 'ಕೃಷಿ ಹಂತದ ನಿಯಮಗಳು',
      tasksTitle: 'ಆದ್ಯತೆಯ ಕ್ಷೇತ್ರ ಕಾರ್ಯಗಳು',
      pestTitle: 'ಕೀಟ ಮತ್ತು ರೋಗ ಜಾಗರೂಕತೆ',
      sprayTitle: 'ರಸಗೊಬ್ಬರ ಮತ್ತು ಸಿಂಪಡಣೆ ನಿಯಮಗಳು',
    },
    pa: {
      cardTitle: `ਖੜ੍ਹੀ ਫਸਲ ਦੀ ਦੇਖਭਾਲ: ${displayedCrop}`,
      subtitle: 'ਅਵਸਥਾ ਅਨੁਸਾਰ ਖੇਤੀ ਕੰਮ, ਮੌਸਮੀ ਬਚਾਅ ਅਤੇ ਛਿੜਕਾਅ ਦੇ ਨਿਯਮ',
      tag: 'ਖੇਤੀਬਾੜੀ ਅਵਸਥਾ ਨਿਯਮ',
      tasksTitle: 'ਮੁੱਖ ਖੇਤੀ ਕੰਮ',
      pestTitle: 'ਕੀੜੇ ਅਤੇ ਬਿਮਾਰੀ ਤੋਂ ਸੁਚੇਤਤਾ',
      sprayTitle: 'ਖਾਦ ਅਤੇ ਛਿੜਕਾਅ ਨਿਯਮ',
    },
    es: {
      cardTitle: `Cuidado del Cultivo en Pie: ${displayedCrop}`,
      subtitle: 'Labores de campo por etapa, resguardo climático y tiempos de aplicación',
      tag: 'Mandatos Agronómicos',
      tasksTitle: 'Tareas Prioritarias de Campo',
      pestTitle: 'Vigilancia de Plagas y Enfermedades',
      sprayTitle: 'Reglas de Fertilización y Fumigación',
    },
  }[language] || {
    cardTitle: `Standing Crop Care: ${displayedCrop}`,
    subtitle: 'Stage-specific field actions, weather safeguards, and chemical spray timings',
    tag: 'Agronomic Stage Mandates',
    tasksTitle: 'Priority Field Tasks',
    pestTitle: 'Pest & Disease Vigilance',
    sprayTitle: 'Chemical & Fertilizer Rules',
  };

  return (
    <div id="standing-crop-advice-section" className="bg-white rounded-xl border border-stone-200 p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b border-stone-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-amber-50 text-amber-800 rounded-lg">
            <Wheat className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-stone-900">{uiLabels.cardTitle}</h3>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                {displayedStage}
              </span>
            </div>
            <p className="text-xs text-stone-500">{uiLabels.subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-stone-600 bg-stone-50 px-3 py-1.5 rounded-lg border border-stone-200">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>{uiLabels.tag}</span>
        </div>
      </div>

      {stageSummary && (
        <div className="mb-4 p-3.5 rounded-lg bg-stone-50 border border-stone-200 text-xs sm:text-sm text-stone-800 leading-relaxed font-medium">
          {stageSummary}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 1. Key Action Items */}
        <div className="p-4 rounded-xl border border-stone-200 bg-white flex flex-col justify-between">
          <div>
            <div className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{uiLabels.tasksTitle}</span>
            </div>
            <ul className="space-y-2 text-xs text-stone-700">
              {actionItems.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 2. Pest & Disease Surveillance */}
        <div className="p-4 rounded-xl border border-stone-200 bg-white flex flex-col justify-between">
          <div>
            <div className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Bug className="w-4 h-4 text-amber-600" />
              <span>{uiLabels.pestTitle}</span>
            </div>
            <p className="text-xs text-stone-700 leading-relaxed bg-amber-50/40 p-2.5 rounded-lg border border-amber-100">
              {pestVigilance}
            </p>
          </div>
        </div>

        {/* 3. Spray & Fertilizer Timing Guidance */}
        <div className="p-4 rounded-xl border border-stone-200 bg-white flex flex-col justify-between">
          <div>
            <div className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>{uiLabels.sprayTitle}</span>
            </div>
            <p className="text-xs text-stone-700 leading-relaxed bg-rose-50/40 p-2.5 rounded-lg border border-rose-100">
              {sprayAdvice}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
