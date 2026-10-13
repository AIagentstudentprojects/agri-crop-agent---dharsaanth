import {
  FarmInputs,
  WeatherData,
  SupportedLanguage,
  FarmAdvisoryResponse,
} from '../types';
import { generateComprehensiveAgronomicAdvisory } from '../data/agronomicExpertEngine';

export function createClientFallbackAdvisory(
  inputs: FarmInputs,
  weather: WeatherData,
  lang: SupportedLanguage = 'en'
): FarmAdvisoryResponse {
  return generateComprehensiveAgronomicAdvisory(inputs, weather, lang);
}

