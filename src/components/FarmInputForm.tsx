import React, { useState } from 'react';
import {
  MapPin,
  Layers,
  Maximize2,
  Calendar,
  Sprout,
  TrendingUp,
  Navigation,
  HelpCircle,
  Check,
  CheckCircle2,
  AlertCircle,
  Globe,
  X,
} from 'lucide-react';
import { FarmInputs, SoilType, Season, GrowthStage } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface Props {
  inputs: FarmInputs;
  onChange: (updated: FarmInputs) => void;
  onSubmit: () => void;
  onLocationSelect?: (updated: FarmInputs) => void;
  isLoading: boolean;
}

const soilTypes: SoilType[] = [
  'Loamy',
  'Clay',
  'Sandy',
  'Sandy Loam',
  'Clay Loam',
  'Silt',
  'Peaty',
  'Chalky',
];

const seasons: Season[] = [
  'Kharif (Monsoon)',
  'Rabi (Winter)',
  'Zaid (Summer)',
  'Spring',
  'Summer',
  'Autumn',
  'Winter',
];

const growthStages: GrowthStage[] = [
  'Land Preparation / Sowing',
  'Germination / Seedling',
  'Vegetative Growth',
  'Flowering & Pollination',
  'Fruiting / Grain Formation',
  'Maturity / Harvesting',
];

const popularLocations = [
  { name: 'Punjab, India', lat: 31.1471, lon: 75.3412 },
  { name: 'Maharashtra (Nashik), India', lat: 19.9975, lon: 73.7898 },
  { name: 'Des Moines, Iowa, USA (Corn Belt)', lat: 41.5868, lon: -93.625 },
  { name: 'Fresno, Central Valley, California, USA', lat: 36.7468, lon: -119.7726 },
  { name: 'East Anglia, UK (Norfolk)', lat: 52.6309, lon: 1.2974 },
  { name: 'Rift Valley, Nakuru, Kenya', lat: -0.3031, lon: 36.08 },
  { name: 'Darling Downs, Queensland, Australia', lat: -27.5598, lon: 151.9507 },
];

export const FarmInputForm: React.FC<Props> = ({
  inputs,
  onChange,
  onSubmit,
  onLocationSelect,
  isLoading,
}) => {
  const { t, translateSoil, translateSeason, translateGrowthStage } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [isGeolocating, setIsGeolocating] = useState(false);
  const [showSoilTip, setShowSoilTip] = useState(false);
  const [gpsStatus, setGpsStatus] = useState<{
    message: string;
    type: 'success' | 'warning' | 'info' | 'error';
    canRetry?: boolean;
  } | null>(null);

  const handleLocationSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const res = await fetch(`/api/search-location?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setSearchResults(data);
      setShowLocationDropdown(true);
    } catch (err) {
      console.warn('Search error', err);
    } finally {
      setIsSearching(false);
    }
  };

  const selectSearchResult = (item: any) => {
    const updated: FarmInputs = {
      ...inputs,
      location: item.name,
      latitude: item.latitude,
      longitude: item.longitude,
    };
    onChange(updated);
    if (onLocationSelect) {
      onLocationSelect(updated);
    }
    setSearchQuery('');
    setSearchResults([]);
    setShowLocationDropdown(false);
    setGpsStatus({
      message: `Location set to ${item.name}`,
      type: 'success',
    });
  };

  const selectPreset = (loc: (typeof popularLocations)[0]) => {
    const updated: FarmInputs = {
      ...inputs,
      location: loc.name,
      latitude: loc.lat,
      longitude: loc.lon,
    };
    onChange(updated);
    if (onLocationSelect) {
      onLocationSelect(updated);
    }
    setGpsStatus({
      message: `Preset loaded: ${loc.name}`,
      type: 'success',
    });
  };

  // Reverse geocodes coordinates to human-readable district/state/country
  const resolveCoordinatesToPlaceName = async (lat: number, lon: number): Promise<string> => {
    try {
      const res = await fetch(`/api/reverse-geocode?lat=${lat}&lon=${lon}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.name) {
          return data.name;
        }
      }
    } catch (err) {
      console.warn('Reverse geocoding error:', err);
    }
    return `Farm Location (${lat.toFixed(3)}°, ${lon.toFixed(3)}°)`;
  };

  // Graceful fallback when browser GPS is blocked, denied, or unavailable
  const fallbackToIpLocation = async (reasonNote?: string) => {
    setIsGeolocating(true);
    setGpsStatus({
      message: reasonNote
        ? `${reasonNote} Detecting location via network IP...`
        : 'Detecting network location...',
      type: 'info',
    });

    try {
      const res = await fetch('/api/detect-ip-location');
      if (res.ok) {
        const data = await res.json();
        if (data && typeof data.latitude === 'number' && typeof data.longitude === 'number') {
          const resolvedName = data.name || `${data.city || 'Detected Location'}, ${data.country || ''}`;
          const updated: FarmInputs = {
            ...inputs,
            location: resolvedName,
            latitude: data.latitude,
            longitude: data.longitude,
          };
          onChange(updated);
          if (onLocationSelect) {
            onLocationSelect(updated);
          }
          setGpsStatus({
            message: `Located via Network: ${resolvedName}. Local weather synchronized!`,
            type: 'info',
          });
          setIsGeolocating(false);
          return;
        }
      }
    } catch (err) {
      console.warn('IP fallback failed:', err);
    }

    setGpsStatus({
      message: 'Unable to auto-detect location. Please search or pick a farming region below.',
      type: 'warning',
      canRetry: true,
    });
    setIsGeolocating(false);
  };

  const handlePositionSuccess = async (pos: GeolocationPosition) => {
    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;
    const accuracy = pos.coords.accuracy;

    setGpsStatus({
      message: 'GPS coordinates locked! Resolving local region name...',
      type: 'info',
    });

    const placeName = await resolveCoordinatesToPlaceName(lat, lon);
    const updated: FarmInputs = {
      ...inputs,
      location: placeName,
      latitude: lat,
      longitude: lon,
    };

    onChange(updated);
    if (onLocationSelect) {
      onLocationSelect(updated);
    }

    const accuracyText = accuracy && accuracy < 2000
      ? ` (±${Math.round(accuracy)}m precision)`
      : '';

    setGpsStatus({
      message: `GPS Active: ${placeName}${accuracyText}. Local weather synchronized!`,
      type: 'success',
    });
    setIsGeolocating(false);
  };

  const useCurrentLocation = () => {
    if (typeof window === 'undefined' || !navigator || !navigator.geolocation) {
      fallbackToIpLocation('Browser GPS not supported.');
      return;
    }

    setIsGeolocating(true);
    setGpsStatus({
      message: 'Contacting GPS satellites & network location...',
      type: 'info',
    });

    // Stage 1: High accuracy GPS
    navigator.geolocation.getCurrentPosition(
      handlePositionSuccess,
      (err1) => {
        console.warn('High-accuracy GPS failed:', err1.code, err1.message);

        // If user actively denied browser permission, immediately switch to IP fallback
        if (err1.code === 1 /* PERMISSION_DENIED */) {
          fallbackToIpLocation('Browser GPS permission was denied or restricted.');
          return;
        }

        // If timeout or position unavailable, retry with low-accuracy / Wi-Fi / cell tower
        setGpsStatus({
          message: 'Retrying with network geolocation...',
          type: 'info',
        });

        navigator.geolocation.getCurrentPosition(
          handlePositionSuccess,
          (err2) => {
            console.warn('Standard geolocation failed:', err2.code, err2.message);
            fallbackToIpLocation('Device GPS satellite fix timed out.');
          },
          {
            enableHighAccuracy: false,
            timeout: 10000,
            maximumAge: 300000, // allow up to 5 min cached position
          }
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      }
    );
  };

  const activeSoilTranslation = translateSoil(inputs.soilType);

  return (
    <div id="farm-inputs-panel" className="bg-white rounded-xl border border-stone-200 p-5 shadow-sm">
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-stone-100">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-50 rounded-lg text-emerald-700">
            <Sprout className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-stone-900">{t.farmProfile}</h2>
            <p className="text-xs text-stone-500">{t.farmProfileSubtitle}</p>
          </div>
        </div>
        <span className="text-xs font-medium px-2.5 py-1 bg-stone-100 text-stone-600 rounded-full">
          6 Input Parameters
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 1. Location */}
        <div className="relative">
          <label htmlFor="farm-location-input" className="block text-xs font-medium text-stone-700 mb-1 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              {t.locationLabel} <span className="text-rose-500">*</span>
            </span>
            <button
              id="gps-location-btn"
              type="button"
              onClick={useCurrentLocation}
              disabled={isGeolocating}
              className="text-[11px] text-emerald-600 hover:text-emerald-700 flex items-center gap-1 font-medium cursor-pointer"
            >
              <Navigation className="w-3 h-3" />
              {isGeolocating ? t.locating : t.useGps}
            </button>
          </label>

          <div className="relative">
            <input
              id="farm-location-input"
              type="text"
              placeholder={t.locationPlaceholder}
              value={searchQuery || inputs.location}
              onChange={(e) => handleLocationSearch(e.target.value)}
              onFocus={() => {
                if (searchResults.length > 0) setShowLocationDropdown(true);
              }}
              className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-stone-900"
            />
            {isSearching && (
              <div className="absolute right-3 top-2.5">
                <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>

          {/* Quick presets or search results */}
          {showLocationDropdown && searchResults.length > 0 && (
            <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-stone-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
              {searchResults.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => selectSearchResult(item)}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-emerald-50 text-stone-700 border-b border-stone-50 last:border-0 flex items-center justify-between cursor-pointer"
                >
                  <span className="truncate font-medium">{item.name}</span>
                  <span className="text-[10px] text-stone-400">
                    {item.latitude.toFixed(2)}°, {item.longitude.toFixed(2)}°
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* GPS feedback status banner */}
          {gpsStatus && (
            <div
              className={`mt-1.5 p-1.5 px-2 rounded-lg text-[11px] flex items-center justify-between border transition-all ${
                gpsStatus.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : gpsStatus.type === 'warning'
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : 'bg-sky-50 text-sky-800 border-sky-200'
              }`}
            >
              <div className="flex items-center gap-1.5 overflow-hidden">
                {gpsStatus.type === 'success' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                ) : gpsStatus.type === 'warning' ? (
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                ) : (
                  <Globe className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                )}
                <span className="truncate">{gpsStatus.message}</span>
              </div>
              <div className="flex items-center gap-1 shrink-0 ml-1">
                {gpsStatus.canRetry && (
                  <button
                    type="button"
                    onClick={useCurrentLocation}
                    className="underline text-[10px] font-medium hover:text-stone-900 cursor-pointer"
                  >
                    Retry
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setGpsStatus(null)}
                  className="text-stone-400 hover:text-stone-600 p-0.5 cursor-pointer"
                  title="Dismiss"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}

          {/* Location quick chips */}
          <div className="mt-1.5 flex flex-wrap items-center gap-1">
            <span className="text-[10px] text-stone-400 py-0.5">Presets:</span>
            {popularLocations.slice(0, 3).map((loc, i) => (
              <button
                key={i}
                type="button"
                onClick={() => selectPreset(loc)}
                className="text-[10px] px-1.5 py-0.5 bg-stone-100 hover:bg-emerald-100 text-stone-600 rounded transition-colors cursor-pointer"
              >
                {loc.name.split(',')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Soil Type */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="soil-type-select" className="text-xs font-medium text-stone-700 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-amber-600" />
              {t.soilTypeLabel} <span className="text-rose-500">*</span>
            </label>
            <button
              type="button"
              onClick={() => setShowSoilTip(!showSoilTip)}
              className="text-[11px] text-stone-400 hover:text-stone-600 flex items-center gap-0.5 cursor-pointer"
            >
              <HelpCircle className="w-3 h-3" />
              {showSoilTip ? 'Hide' : 'Info'}
            </button>
          </div>
          <select
            id="soil-type-select"
            value={inputs.soilType}
            onChange={(e) => onChange({ ...inputs, soilType: e.target.value as SoilType })}
            className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-stone-900 cursor-pointer"
          >
            {soilTypes.map((type) => {
              const trans = translateSoil(type);
              return (
                <option key={type} value={type}>
                  {trans.name}
                </option>
              );
            })}
          </select>
          {showSoilTip && (
            <p className="mt-1 text-[11px] text-amber-800 bg-amber-50 p-1.5 rounded border border-amber-200">
              {activeSoilTranslation.description}
            </p>
          )}
        </div>

        {/* 3. Land Area */}
        <div>
          <label htmlFor="land-area-input" className="block text-xs font-medium text-stone-700 mb-1 flex items-center gap-1.5">
            <Maximize2 className="w-3.5 h-3.5 text-sky-600" />
            {t.landAreaLabel} <span className="text-rose-500">*</span>
          </label>
          <div className="flex rounded-lg border border-stone-300 overflow-hidden bg-stone-50 focus-within:ring-2 focus-within:ring-emerald-500 focus-within:bg-white">
            <input
              id="land-area-input"
              type="number"
              min="0.1"
              step="0.5"
              value={inputs.landArea}
              onChange={(e) => onChange({ ...inputs, landArea: Math.max(0.1, parseFloat(e.target.value) || 1) })}
              className="w-full px-3 py-2 text-sm bg-transparent focus:outline-none text-stone-900"
            />
            <div className="flex items-center border-l border-stone-300 bg-stone-100 text-xs text-stone-700">
              <button
                type="button"
                onClick={() => onChange({ ...inputs, areaUnit: 'acres' })}
                className={`px-2.5 py-2 font-medium transition-colors cursor-pointer ${
                  inputs.areaUnit === 'acres' ? 'bg-emerald-700 text-white' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {t.acres}
              </button>
              <button
                type="button"
                onClick={() => onChange({ ...inputs, areaUnit: 'hectares' })}
                className={`px-2.5 py-2 font-medium transition-colors cursor-pointer ${
                  inputs.areaUnit === 'hectares' ? 'bg-emerald-700 text-white' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {t.hectares}
              </button>
            </div>
          </div>
        </div>

        {/* 4. Season */}
        <div>
          <label htmlFor="season-select" className="block text-xs font-medium text-stone-700 mb-1 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
            {t.seasonLabel} <span className="text-rose-500">*</span>
          </label>
          <select
            id="season-select"
            value={inputs.season}
            onChange={(e) => onChange({ ...inputs, season: e.target.value as Season })}
            className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-stone-900 cursor-pointer"
          >
            {seasons.map((s) => (
              <option key={s} value={s}>
                {translateSeason(s)}
              </option>
            ))}
          </select>
        </div>

        {/* 5. Existing Crop (Optional) */}
        <div>
          <label htmlFor="existing-crop-input" className="block text-xs font-medium text-stone-700 mb-1 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Sprout className="w-3.5 h-3.5 text-emerald-600" />
              {t.existingCropLabel}
            </span>
            <span className="text-[10px] text-stone-400 font-normal">(Optional)</span>
          </label>
          <input
            id="existing-crop-input"
            type="text"
            placeholder={t.cropPlaceholder}
            value={inputs.existingCrop || ''}
            onChange={(e) => onChange({ ...inputs, existingCrop: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-stone-900"
          />
        </div>

        {/* 6. Crop Growth Stage (Optional) */}
        <div>
          <label htmlFor="growth-stage-select" className="block text-xs font-medium text-stone-700 mb-1 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-sky-600" />
              {t.growthStageLabel}
            </span>
            <span className="text-[10px] text-stone-400 font-normal">(Optional)</span>
          </label>
          <select
            id="growth-stage-select"
            value={inputs.cropGrowthStage || ''}
            onChange={(e) => onChange({ ...inputs, cropGrowthStage: (e.target.value as GrowthStage) || undefined })}
            className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-stone-900 cursor-pointer"
          >
            <option value="">-- Select growth stage --</option>
            {growthStages.map((stage) => (
              <option key={stage} value={stage}>
                {translateGrowthStage(stage)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-xs text-stone-500">
          Selected: <strong className="text-stone-800">{inputs.location}</strong> • {activeSoilTranslation.name} • {inputs.landArea} {inputs.areaUnit === 'acres' ? t.acres : t.hectares} • {translateSeason(inputs.season)}
        </div>
        <button
          id="generate-advisory-btn"
          type="button"
          onClick={onSubmit}
          disabled={isLoading}
          className="w-full sm:w-auto px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white font-medium text-sm rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>{t.generatingAdvisory}</span>
            </>
          ) : (
            <>
              <Check className="w-4 h-4" />
              <span>{t.updateAdvisoryBtn}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
