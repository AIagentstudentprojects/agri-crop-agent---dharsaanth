import React from 'react';
import { ShieldAlert, Users, BookOpen } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const SafetyDisclaimer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer id="safety-disclaimer-footer" className="mt-8 p-4 rounded-xl bg-stone-100 border border-stone-200 text-stone-600 text-xs">
      <div className="flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1.5">
          <h5 className="font-semibold text-stone-800 text-xs uppercase tracking-wide">
            {t.safetyTitle}
          </h5>
          <p className="leading-relaxed">
            {t.safetyBody}
          </p>
          <div className="flex flex-wrap gap-4 pt-1 text-[11px] text-stone-600">
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-emerald-700" />
              <span>
                {t.safetyOfficer}
              </span>
            </span>
            <span className="flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-sky-700" />
              <span>
                {t.safetyPesticide}
              </span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
