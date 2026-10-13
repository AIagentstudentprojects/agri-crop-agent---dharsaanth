import React from 'react';
import { Sparkles, Bot, AlertTriangle, ShieldCheck, Lightbulb } from 'lucide-react';
import { FarmAdvisoryResponse } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface Props {
  advisory: FarmAdvisoryResponse | null;
}

export const AiExplanationCard: React.FC<Props> = ({ advisory }) => {
  const { t } = useLanguage();
  if (!advisory) return null;

  const { aiExplanation, weatherAlerts } = advisory;

  return (
    <div id="ai-explanation-section" className="space-y-4">
      {/* Weather Alerts if present */}
      {weatherAlerts && weatherAlerts.length > 0 && (
        <div className="space-y-2">
          {weatherAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-xl border flex items-start gap-3 shadow-xs ${
                alert.severity === 'urgent'
                  ? 'bg-rose-50 border-rose-200 text-rose-950'
                  : alert.severity === 'warning'
                  ? 'bg-amber-50 border-amber-200 text-amber-950'
                  : 'bg-sky-50 border-sky-200 text-sky-950'
              }`}
            >
              <AlertTriangle
                className={`w-5 h-5 shrink-0 mt-0.5 ${
                  alert.severity === 'urgent'
                    ? 'text-rose-600'
                    : alert.severity === 'warning'
                    ? 'text-amber-600'
                    : 'text-sky-600'
                }`}
              />
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h4 className="text-sm font-bold">{alert.headline}</h4>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-white/70 rounded-md border border-stone-200/50">
                    {alert.severity}
                  </span>
                </div>
                <p className="text-xs leading-relaxed opacity-90">{alert.description}</p>
                <div className="mt-1 text-[10px] opacity-70">Source: {alert.source}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* AI Reasoning card */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-sm">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-stone-900">{t.aiReasoningTitle}</h3>
              <p className="text-xs text-stone-500">{t.aiReasoningSubtitle}</p>
            </div>
          </div>
          {advisory.engineUsed === 'Agronomic Expert Engine' ? (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-amber-700" /> Agronomic Expert Engine
            </span>
          ) : (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> {advisory.engineUsed || 'Gemini AI Engine'}
            </span>
          )}
        </div>

        <div className="space-y-4 text-xs sm:text-sm">
          {/* Executive Overview */}
          <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200/80">
            <div className="text-xs font-semibold text-stone-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t.executiveSynthesis}</span>
            </div>
            <p className="text-stone-700 leading-relaxed">{aiExplanation.overview}</p>
          </div>

          {/* Climate & Soil Analysis */}
          <div className="p-3.5 bg-white rounded-xl border border-stone-200">
            <div className="text-xs font-semibold text-stone-800 uppercase tracking-wider mb-1">
              {t.climateSoilBalance}
            </div>
            <p className="text-stone-700 leading-relaxed">{aiExplanation.climateAndSoilAnalysis}</p>
          </div>

          {/* Farmer Key Takeaway */}
          <div className="p-3.5 bg-emerald-50/70 rounded-xl border border-emerald-200 text-emerald-950">
            <div className="text-xs font-bold text-emerald-900 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-emerald-700" />
              <span>{t.keyPriorityFarmer}</span>
            </div>
            <p className="font-medium leading-relaxed">{aiExplanation.keyTakeawayForFarmer}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
