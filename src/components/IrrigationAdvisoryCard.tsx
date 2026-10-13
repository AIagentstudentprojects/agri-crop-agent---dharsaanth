import React from 'react';
import {
  Droplets,
  Clock,
  CheckCircle2,
  CalendarClock,
  Layers,
  CloudRain,
} from 'lucide-react';
import { IrrigationAdvisory, IrrigationStatus } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface Props {
  advisory: IrrigationAdvisory | null;
  cropName?: string;
  soilType?: string;
}

export const IrrigationAdvisoryCard: React.FC<Props> = ({ advisory, cropName, soilType }) => {
  const { t } = useLanguage();

  if (!advisory) {
    return (
      <div className="bg-white rounded-xl border border-stone-200 p-6 animate-pulse">
        <div className="h-6 bg-stone-200 rounded w-1/2 mb-4"></div>
        <div className="h-20 bg-stone-100 rounded mb-4"></div>
        <div className="h-32 bg-stone-100 rounded"></div>
      </div>
    );
  }

  const getStatusBadge = (status: IrrigationStatus) => {
    switch (status) {
      case 'POSTPONE':
        return {
          bg: 'bg-blue-50 text-blue-800 border-blue-200',
          icon: <CloudRain className="w-5 h-5 text-blue-600" />,
          pill: t.statusPostpone,
          themeBorder: 'border-l-4 border-l-blue-600',
        };
      case 'IRRIGATE_NOW':
        return {
          bg: 'bg-amber-50 text-amber-900 border-amber-200',
          icon: <Droplets className="w-5 h-5 text-amber-600" />,
          pill: t.statusIrrigateNow,
          themeBorder: 'border-l-4 border-l-amber-500',
        };
      case 'ADEQUATE_MOISTURE':
        return {
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
          pill: t.statusAdequate,
          themeBorder: 'border-l-4 border-l-emerald-600',
        };
      case 'MONITOR_SOIL':
      default:
        return {
          bg: 'bg-teal-50 text-teal-800 border-teal-200',
          icon: <Clock className="w-5 h-5 text-teal-600" />,
          pill: t.statusMonitor,
          themeBorder: 'border-l-4 border-l-teal-600',
        };
    }
  };

  const statusMeta = getStatusBadge(advisory.status);

  return (
    <div id="irrigation-advisory-card" className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-stone-100 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-sky-50 text-sky-700 rounded-lg">
            <Droplets className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-stone-900">{t.irrigationAdvisoryTitle}</h3>
              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-stone-100 text-stone-700">
                Feature 2
              </span>
            </div>
            <p className="text-xs text-stone-500">
              Calibrated for {cropName ? <strong>{cropName}</strong> : 'Field Profile'} in {soilType || 'Local'} soil
            </p>
          </div>
        </div>

        {/* Prominent Status Pill */}
        <div className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 ${statusMeta.bg}`}>
          {statusMeta.icon}
          <span>{statusMeta.pill}</span>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Status Title & Summary Banner */}
        <div className={`p-4 rounded-xl bg-stone-50 border border-stone-200 ${statusMeta.themeBorder}`}>
          <h4 className="text-sm font-bold text-stone-900 mb-1">{advisory.statusTitle}</h4>
          <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">{advisory.summary}</p>

          {/* Postpone Reason Callout if applicable */}
          {advisory.postponeReason && (
            <div className="mt-3 p-2.5 bg-blue-100/60 rounded-lg border border-blue-200 text-xs text-blue-950 flex items-start gap-2">
              <CloudRain className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
              <div>
                <strong>Postponement Rationale:</strong> {advisory.postponeReason}
              </div>
            </div>
          )}
        </div>

        {/* 2-Column Grid: Schedule & Moisture Impact */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* When to Check / Irrigate */}
          <div className="p-3.5 rounded-lg border border-stone-200 bg-white">
            <div className="flex items-center gap-2 text-xs font-semibold text-stone-800 mb-2">
              <CalendarClock className="w-4 h-4 text-emerald-600" />
              <span>{t.whenToIrrigate}</span>
            </div>
            <p className="text-xs text-stone-700 font-medium bg-emerald-50/50 p-2 rounded border border-emerald-100">
              {advisory.checkSchedule}
            </p>
          </div>

          {/* Approximate Water Requirement (Reliable benchmarks only) */}
          <div className="p-3.5 rounded-lg border border-stone-200 bg-white">
            <div className="flex items-center gap-2 text-xs font-semibold text-stone-800 mb-2">
              <Droplets className="w-4 h-4 text-sky-600" />
              <span>Approximate Water Requirement</span>
            </div>
            <p className="text-xs text-stone-700 bg-sky-50/50 p-2 rounded border border-sky-100">
              {advisory.approximateWaterRequirement ||
                'Determine water depth via root soil probe test (5–10 cm depth) prior to pumping.'}
            </p>
          </div>
        </div>

        {/* Rainfall Dynamics & Soil Behavior */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-stone-50 rounded-lg border border-stone-200/80">
            <div className="text-stone-500 font-medium mb-1">Precipitation Dynamics</div>
            <div className="text-stone-800 space-y-1">
              <div>• {advisory.recentRainfallImpact}</div>
              <div>• {advisory.forecastRainfallImpact}</div>
            </div>
          </div>

          <div className="p-3 bg-stone-50 rounded-lg border border-stone-200/80">
            <div className="text-stone-500 font-medium mb-1 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-amber-600" />
              <span>Soil Moisture Retention ({soilType || 'Soil'})</span>
            </div>
            <p className="text-stone-800 leading-relaxed">{advisory.soilWaterRetentionNote}</p>
          </div>
        </div>

        {/* Action Steps Checklist */}
        {advisory.actionSteps && advisory.actionSteps.length > 0 && (
          <div className="pt-2">
            <h5 className="text-xs font-semibold text-stone-800 uppercase tracking-wider mb-2">
              Action Steps & Field Guidance
            </h5>
            <div className="space-y-1.5">
              {advisory.actionSteps.map((step, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 p-2 bg-white rounded-lg border border-stone-200/70 text-xs text-stone-700"
                >
                  <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
