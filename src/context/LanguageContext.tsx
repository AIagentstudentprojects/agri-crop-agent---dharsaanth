import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { SupportedLanguage, LanguageOption, SoilType, Season, GrowthStage } from '../types';
import {
  translations,
  TranslationStrings,
  SUPPORTED_LANGUAGES,
  SOIL_TRANSLATIONS,
  SEASON_TRANSLATIONS,
  GROWTH_STAGE_TRANSLATIONS,
  SUGGESTED_QUESTIONS,
} from '../translations';

const STORAGE_KEY = 'preferred_farm_language';

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: TranslationStrings;
  supportedLanguages: LanguageOption[];
  currentLanguageOption: LanguageOption;
  translateSoil: (soil: SoilType) => { name: string; description: string };
  translateSeason: (season: Season) => string;
  translateGrowthStage: (stage: GrowthStage) => string;
  suggestedQuestions: string[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as SupportedLanguage;
      if (saved && translations[saved]) {
        return saved;
      }
    } catch (e) {
      // localStorage may be unavailable or restricted
    }
    return 'en';
  });

  const setLanguage = (newLang: SupportedLanguage) => {
    setLanguageState(newLang);
    try {
      localStorage.setItem(STORAGE_KEY, newLang);
    } catch (e) {
      console.warn('Failed to save language preference:', e);
    }
  };

  const t = useMemo(() => {
    return translations[language] || translations.en;
  }, [language]);

  const currentLanguageOption = useMemo(() => {
    const found = SUPPORTED_LANGUAGES.find((opt) => opt.code === language);
    return found || SUPPORTED_LANGUAGES[0];
  }, [language]);

  const translateSoil = (soil: SoilType) => {
    const langDict = SOIL_TRANSLATIONS[language] || SOIL_TRANSLATIONS.en;
    return langDict[soil] || { name: soil, description: '' };
  };

  const translateSeason = (season: Season) => {
    const langDict = SEASON_TRANSLATIONS[language] || SEASON_TRANSLATIONS.en;
    return langDict[season] || season;
  };

  const translateGrowthStage = (stage: GrowthStage) => {
    const langDict = GROWTH_STAGE_TRANSLATIONS[language] || GROWTH_STAGE_TRANSLATIONS.en;
    return langDict[stage] || stage;
  };

  const suggestedQuestions = useMemo(() => {
    return SUGGESTED_QUESTIONS[language] || SUGGESTED_QUESTIONS.en;
  }, [language]);

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        supportedLanguages: SUPPORTED_LANGUAGES,
        currentLanguageOption,
        translateSoil,
        translateSeason,
        translateGrowthStage,
        suggestedQuestions,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
