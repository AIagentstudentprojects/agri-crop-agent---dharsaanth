/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { FarmInputForm } from './components/FarmInputForm';
import { CurrentWeatherCard } from './components/CurrentWeatherCard';
import { ForecastCard } from './components/ForecastCard';
import { IrrigationAdvisoryCard } from './components/IrrigationAdvisoryCard';
import { CropRecommendationsCard } from './components/CropRecommendationsCard';
import { StandingCropAdviceCard } from './components/StandingCropAdviceCard';
import { WeatherChangeBanner } from './components/WeatherChangeBanner';
import { AiExplanationCard } from './components/AiExplanationCard';
import { AskAdvisorCard } from './components/AskAdvisorCard';
import { SafetyDisclaimer } from './components/SafetyDisclaimer';
import { CropLifecycleManager } from './components/cropLifecycle/CropLifecycleManager';
import { AuthModal } from './components/AuthModal';
import {
  FarmInputs,
  WeatherData,
  DailyForecast,
  FarmAdvisoryResponse,
  WeatherChangeComparison,
  SupportedLanguage,
  SoilType,
} from './types';
import { AlertTriangle, Sprout, LayoutDashboard, Layers } from 'lucide-react';
import { useLanguage } from './context/LanguageContext';
import { useAuth } from './context/AuthContext';
import { createClientFallbackAdvisory } from './utils/advisoryFallback';

const initialInputs: FarmInputs = {
  location: 'Punjab, India',
  latitude: 31.1471,
  longitude: 75.3412,
  soilType: 'Loamy',
  landArea: 5,
  areaUnit: 'acres',
  season: 'Kharif (Monsoon)',
  existingCrop: 'Paddy (Rice)',
  cropGrowthStage: 'Vegetative Growth',
};

export default function App() {
  const { language, t } = useLanguage();
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const [farmInputs, setFarmInputs] = useState<FarmInputs>(() => {
    return initialInputs;
  });
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [advisory, setAdvisory] = useState<FarmAdvisoryResponse | null>(null);
  const [weatherChangeAlert, setWeatherChangeAlert] = useState<WeatherChangeComparison | null>(null);

  // Tab Navigation: 'lifecycle' (Crop Life-Cycle & Farm Management), 'dashboard' (Weather & Advisory Overview), 'all' (Both)
  const [activeTab, setActiveTab] = useState<'lifecycle' | 'dashboard' | 'all'>('lifecycle');
  const [externalAiQuery, setExternalAiQuery] = useState<string | null>(null);

  const [isLoadingWeather, setIsLoadingWeather] = useState<boolean>(false);
  const [isLoadingAdvisory, setIsLoadingAdvisory] = useState<boolean>(false);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Synchronize farm inputs when authenticated user changes
  useEffect(() => {
    if (user) {
      setFarmInputs((prev) => ({
        ...prev,
        location: user.farmLocation || prev.location,
        latitude: user.latitude || prev.latitude,
        longitude: user.longitude || prev.longitude,
        soilType: user.soilType || prev.soilType,
        landArea: user.landArea || prev.landArea,
        areaUnit: user.areaUnit || prev.areaUnit,
        existingCrop: user.primaryCrop || prev.existingCrop,
        season: user.season || prev.season,
      }));
    }
  }, [user]);

  // Snapshot ref to continuously compare latest forecast with previous forecast (Feature 3)
  const previousForecastRef = useRef<DailyForecast[] | null>(null);
  const baselineWeatherRef = useRef<WeatherData | null>(null);
  const isFirstRender = useRef<boolean>(true);

  // Fetch weather for coordinates
  const fetchWeather = useCallback(async (lat: number, lon: number, name: string) => {
    setIsLoadingWeather(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/weather', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude: lat,
          longitude: lon,
          locationName: name,
        }),
      });
      if (!res.ok) throw new Error(`Weather fetch failed: ${res.status}`);
      const data: WeatherData = await res.json();
      return data;
    } catch (err: any) {
      console.error('Weather error:', err);
      setErrorMessage('Could not connect to live weather service; using agricultural offline estimate.');
      return null;
    } finally {
      setIsLoadingWeather(false);
    }
  }, []);

  // Fetch Gemini AI Farm Advisory with auto-retry and resilient client fallback
  const fetchAdvisory = useCallback(
    async (
      inputs: FarmInputs,
      currentW: WeatherData,
      prevForecast?: DailyForecast[] | null,
      langOverride?: SupportedLanguage,
      retryCount: number = 0
    ): Promise<void> => {
      setIsLoadingAdvisory(true);
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 18000);

        const res = await fetch('/api/advisory', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            farmInputs: inputs,
            weatherData: currentW,
            previousForecast: prevForecast || null,
            language: langOverride || language,
          }),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (!res.ok) throw new Error(`Advisory calculation error: HTTP ${res.status}`);
        const data: FarmAdvisoryResponse = await res.json();
        setAdvisory(data);
        setErrorMessage(null);
      } catch (err: any) {
        console.warn(`Advisory fetch attempt ${retryCount + 1} issue:`, err?.message || err);
        if (retryCount < 2) {
          // Dev server might be starting up or compiling; wait 1.2s and retry
          await new Promise((resolve) => setTimeout(resolve, 1200));
          return fetchAdvisory(inputs, currentW, prevForecast, langOverride, retryCount + 1);
        }

        console.info('Using client-side agronomic safety engine for uninterrupted advisory.');
        const fallback = createClientFallbackAdvisory(inputs, currentW, langOverride || language);
        setAdvisory(fallback);
      } finally {
        setIsLoadingAdvisory(false);
      }
    },
    [language]
  );

  // Check forecast variance / weather diff (Feature 3)
  const checkWeatherVariance = useCallback(
    async (
      currForecast: DailyForecast[],
      prevForecast: DailyForecast[],
      inputs: FarmInputs,
      langOverride?: SupportedLanguage
    ) => {
      try {
        const res = await fetch('/api/weather-diff', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            farmInputs: inputs,
            currentForecast: currForecast,
            previousForecast: prevForecast,
            language: langOverride || language,
          }),
        });
        if (res.ok) {
          const diffResult: WeatherChangeComparison = await res.json();
          setWeatherChangeAlert(diffResult);

          // If significant change, also update irrigation status in current advisory
          if (diffResult.hasSignificantChange && advisory) {
            setAdvisory((prev) => {
              if (!prev) return null;
              return {
                ...prev,
                irrigationAdvisory: {
                  ...prev.irrigationAdvisory,
                  status:
                    diffResult.changeType === 'RAIN_INCREASED'
                      ? 'POSTPONE'
                      : diffResult.changeType === 'RAIN_DECREASED' || diffResult.changeType === 'HEATWAVE'
                      ? 'IRRIGATE_NOW'
                      : prev.irrigationAdvisory.status,
                  statusTitle: diffResult.alertHeadline,
                  postponeReason:
                    diffResult.changeType === 'RAIN_INCREASED'
                      ? diffResult.whyRecommendationChanged
                      : prev.irrigationAdvisory.postponeReason,
                  summary: diffResult.updatedIrrigationAdvice,
                },
              };
            });
          }
        }
      } catch (err) {
        console.warn('Weather diff error:', err);
      }
    },
    [advisory, language]
  );

  // Initial Boot
  useEffect(() => {
    let isMounted = true;
    async function init() {
      const w = await fetchWeather(farmInputs.latitude, farmInputs.longitude, farmInputs.location);
      if (isMounted && w) {
        setWeatherData(w);
        baselineWeatherRef.current = JSON.parse(JSON.stringify(w));
        previousForecastRef.current = JSON.parse(JSON.stringify(w.forecast));
        await fetchAdvisory(farmInputs, w, null, language);
      }
    }
    init();
    return () => {
      isMounted = false;
    };
  }, []); // Run on mount

  // When language changes: immediately update advisory content via Gemini API
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (weatherData) {
      fetchAdvisory(farmInputs, weatherData, previousForecastRef.current, language);
      if (previousForecastRef.current) {
        checkWeatherVariance(weatherData.forecast, previousForecastRef.current, farmInputs, language);
      }
    }
  }, [language]);

  // Farmer clicks "Update Farm Advisory"
  const handleUpdateAdvisory = async () => {
    // If location changed, refresh weather
    let currentW = weatherData;
    if (
      !weatherData ||
      weatherData.latitude !== farmInputs.latitude ||
      weatherData.longitude !== farmInputs.longitude
    ) {
      const prev = weatherData?.forecast ? JSON.parse(JSON.stringify(weatherData.forecast)) : null;
      previousForecastRef.current = prev;

      currentW = await fetchWeather(farmInputs.latitude, farmInputs.longitude, farmInputs.location);
      if (currentW) {
        setWeatherData(currentW);
        baselineWeatherRef.current = JSON.parse(JSON.stringify(currentW));

        if (prev) {
          await checkWeatherVariance(currentW.forecast, prev, farmInputs);
        }
      }
    }

    if (currentW) {
      await fetchAdvisory(farmInputs, currentW, previousForecastRef.current);
    }
  };

  // Farmer selects or detects a new location (via GPS, Search, or Preset)
  const handleLocationSelect = async (newInputs: FarmInputs) => {
    setFarmInputs(newInputs);
    const prev = weatherData?.forecast ? JSON.parse(JSON.stringify(weatherData.forecast)) : null;
    previousForecastRef.current = prev;

    const freshWeather = await fetchWeather(newInputs.latitude, newInputs.longitude, newInputs.location);
    if (freshWeather) {
      setWeatherData(freshWeather);
      baselineWeatherRef.current = JSON.parse(JSON.stringify(freshWeather));
      if (prev) {
        await checkWeatherVariance(freshWeather.forecast, prev, newInputs);
      }
      await fetchAdvisory(newInputs, freshWeather, prev);
    }
  };

  // Weather Sync / Refresh button in header
  const handleRefreshAll = async () => {
    const prev = weatherData?.forecast ? JSON.parse(JSON.stringify(weatherData.forecast)) : null;
    previousForecastRef.current = prev;

    const freshWeather = await fetchWeather(farmInputs.latitude, farmInputs.longitude, farmInputs.location);
    if (freshWeather) {
      setWeatherData(freshWeather);
      baselineWeatherRef.current = JSON.parse(JSON.stringify(freshWeather));
      if (prev) {
        await checkWeatherVariance(freshWeather.forecast, prev, farmInputs);
      }
      await fetchAdvisory(farmInputs, freshWeather, prev);
    }
  };

  // Feature 3 Simulation Handler: allows testing weather shifts
  const handleSimulateChange = async (scenario: 'rain_spike' | 'heatwave' | 'dry_spell' | 'reset') => {
    if (!weatherData) return;
    setIsSimulating(true);

    if (scenario === 'reset') {
      if (baselineWeatherRef.current) {
        const restored = JSON.parse(JSON.stringify(baselineWeatherRef.current));
        setWeatherData(restored);
        setWeatherChangeAlert(null);
        await fetchAdvisory(farmInputs, restored, null);
      }
      setIsSimulating(false);
      return;
    }

    // Keep snapshot of the current forecast before modifying
    const prevSnapshot: DailyForecast[] = JSON.parse(JSON.stringify(weatherData.forecast));
    previousForecastRef.current = prevSnapshot;

    // Create modified forecast based on scenario
    const updatedForecast: DailyForecast[] = JSON.parse(JSON.stringify(weatherData.forecast));

    if (scenario === 'rain_spike') {
      // Significant monsoon downpour incoming
      updatedForecast[0].precipitationSum = 28.0;
      updatedForecast[0].precipitationProbability = 95;
      updatedForecast[0].weatherCondition = 'Heavy Rain / Thunderstorm';
      updatedForecast[1].precipitationSum = 22.5;
      updatedForecast[1].precipitationProbability = 85;
      updatedForecast[1].weatherCondition = 'Moderate Rain';
    } else if (scenario === 'heatwave') {
      // Temperature spikes +6°C and zero rain
      updatedForecast[0].tempMax += 6;
      updatedForecast[0].precipitationSum = 0;
      updatedForecast[0].precipitationProbability = 5;
      updatedForecast[0].weatherCondition = 'Hot / Sunny';
      updatedForecast[1].tempMax += 6;
      updatedForecast[1].precipitationSum = 0;
      updatedForecast[1].precipitationProbability = 5;
    } else if (scenario === 'dry_spell') {
      // Forecasted rain drops to 0
      updatedForecast[0].precipitationSum = 0;
      updatedForecast[0].precipitationProbability = 10;
      updatedForecast[0].weatherCondition = 'Partly Cloudy';
      updatedForecast[1].precipitationSum = 0;
      updatedForecast[1].precipitationProbability = 10;
    }

    const updatedWeatherData: WeatherData = {
      ...weatherData,
      current: {
        ...weatherData.current,
        temperature: scenario === 'heatwave' ? weatherData.current.temperature + 5 : weatherData.current.temperature,
        precipitationProbability: updatedForecast[0].precipitationProbability,
        precipitation: scenario === 'rain_spike' ? 12.0 : 0.0,
        weatherCondition: updatedForecast[0].weatherCondition,
      },
      forecast: updatedForecast,
      fetchedAt: new Date().toISOString(),
    };

    setWeatherData(updatedWeatherData);

    // Run Feature 3 diff engine
    await checkWeatherVariance(updatedForecast, prevSnapshot, farmInputs);

    // Re-run advisory with the shifted atmospheric data
    await fetchAdvisory(farmInputs, updatedWeatherData, prevSnapshot);

    setIsSimulating(false);
  };

  // Sync handlers between Crop Lifecycle Module and Dashboard
  const handleSyncLifecycleWithMainInputs = (
    cropName: string,
    soilType: SoilType,
    location: string
  ) => {
    setFarmInputs((prev) => ({
      ...prev,
      existingCrop: cropName,
      soilType: soilType,
      location: location,
    }));
  };

  const handleAskAiAboutStage = (query: string) => {
    setExternalAiQuery(query);
    setActiveTab('all');
    setTimeout(() => {
      const el = document.getElementById('ask-advisor-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 150);
  };

  return (
    <div id="app-root" className="min-h-screen bg-stone-100/60 text-stone-900 flex flex-col font-sans">
      <Header
        locationName={farmInputs.location}
        isUpdating={isLoadingWeather || isLoadingAdvisory}
        onRefreshAll={handleRefreshAll}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full space-y-6">
        {/* Error notification banner if any */}
        {errorMessage && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-stone-400 hover:text-stone-700 text-xs font-semibold cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Authenticated Farmer Profile Banner */}
        {isAuthenticated && user && (
          <div
            id="auth-farmer-welcome-banner"
            className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50/60 border border-emerald-200/90 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-emerald-700 text-white flex items-center justify-center text-2xl shadow-xs shrink-0">
                {user.avatar || '👨‍🌾'}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-sm text-stone-900">
                    Welcome back, {user.name}!
                  </span>
                  <span className="text-[11px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                    {user.role}
                  </span>
                  <span className="text-[11px] font-medium text-stone-500">
                    • {user.landArea} {user.areaUnit} ({user.soilType} Soil)
                  </span>
                </div>
                <p className="text-xs text-stone-600 mt-0.5">
                  Calibrated for <strong className="text-emerald-900">{user.primaryCrop}</strong> in{' '}
                  <span className="text-stone-700 font-medium">{user.farmLocation}</span>. Agronomic and irrigation models are synced.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={openAuthModal}
                className="px-3 py-1.5 bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                Switch Profile / Edit
              </button>
            </div>
          </div>
        )}

        {/* Navigation Switcher between Crop Life-Cycle & Farm Management and Weather/Advisory Dashboard */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-2 rounded-2xl border border-stone-200 shadow-2xs">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              id="tab-crop-lifecycle"
              onClick={() => setActiveTab('lifecycle')}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                activeTab === 'lifecycle'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-stone-700 hover:bg-stone-100'
              }`}
            >
              <Sprout className="w-4 h-4" />
              <span>{t.cropLifecycleManagement || 'Crop Life-Cycle & Management'}</span>
            </button>

            <button
              type="button"
              id="tab-farm-dashboard"
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-stone-700 hover:bg-stone-100'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>{t.weatherAdvisoryOverview || 'Weather & Advisory Overview'}</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-1 pr-2">
            <button
              type="button"
              id="tab-all-modules"
              onClick={() => setActiveTab('all')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-stone-800 text-white'
                  : 'text-stone-500 hover:text-stone-800 hover:bg-stone-100'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Show All Modules</span>
            </button>
          </div>
        </div>

        {/* View 1: Crop Life-Cycle & Farm Management Module */}
        {(activeTab === 'lifecycle' || activeTab === 'all') && (
          <section aria-label="Crop Life-Cycle and Farm Management">
            <CropLifecycleManager
              initialCropName={farmInputs.existingCrop || 'Tomato'}
              initialSoilType={farmInputs.soilType}
              initialLocation={farmInputs.location}
              weatherData={weatherData}
              onSyncWithMainInputs={handleSyncLifecycleWithMainInputs}
              onAskAiAboutStage={handleAskAiAboutStage}
            />
          </section>
        )}

        {/* View 2: Weather, Profile Inputs, and Advisory Dashboard */}
        {(activeTab === 'dashboard' || activeTab === 'all') && (
          <>
            {/* Farmer Inputs (1 to 6) */}
            <section aria-label="Farm Profile Inputs">
              <FarmInputForm
                inputs={farmInputs}
                onChange={setFarmInputs}
                onSubmit={handleUpdateAdvisory}
                onLocationSelect={handleLocationSelect}
                isLoading={isLoadingAdvisory || isLoadingWeather}
              />
            </section>

            {/* Feature 3: Weather Change Alert Banner & Real-time Variance Detector */}
            <section aria-label="Weather Change Monitor">
              <WeatherChangeBanner
                changeAlert={weatherChangeAlert}
                onSimulateChange={handleSimulateChange}
                isSimulating={isSimulating}
              />
            </section>

            {/* Feature 4: Primary Dashboard View */}
            <section aria-label="Weather and Irrigation Dashboard" className="space-y-6">
              {/* Weather Observations & 7-Day Forecast */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-5">
                  <CurrentWeatherCard
                    weather={weatherData}
                    isLoading={isLoadingWeather}
                    onRefresh={handleRefreshAll}
                  />
                </div>
                <div className="lg:col-span-7">
                  <ForecastCard forecast={weatherData?.forecast || []} />
                </div>
              </div>

              {/* Feature 2: Irrigation Advisory Card */}
              <div>
                <IrrigationAdvisoryCard
                  advisory={advisory?.irrigationAdvisory || null}
                  cropName={farmInputs.existingCrop}
                  soilType={farmInputs.soilType}
                />
              </div>

              {/* Standing Crop Care & Agronomic Stage Mandates */}
              {farmInputs.existingCrop && (
                <div>
                  <StandingCropAdviceCard
                    advice={advisory?.standingCropAdvice}
                    cropName={farmInputs.existingCrop}
                    stageName={farmInputs.cropGrowthStage}
                  />
                </div>
              )}

              {/* Feature 1: Crop & Seed Recommendations */}
              <div>
                <CropRecommendationsCard
                  crops={advisory?.recommendedCrops || []}
                  season={farmInputs.season}
                  soilType={farmInputs.soilType}
                />
              </div>

              {/* Gemini AI Agronomic Reasoning Breakdown & Alerts */}
              <div>
                <AiExplanationCard advisory={advisory} />
              </div>

              {/* Interactive Farmer Q&A Assistant */}
              <div>
                <AskAdvisorCard
                  farmInputs={farmInputs}
                  weatherData={weatherData}
                  externalQuery={externalAiQuery}
                  onClearExternalQuery={() => setExternalAiQuery(null)}
                />
              </div>
            </section>
          </>
        )}

        {/* Safety Disclaimer */}
        <SafetyDisclaimer />
      </main>

      {/* Mock Authentication Modal */}
      <AuthModal />
    </div>
  );
}

