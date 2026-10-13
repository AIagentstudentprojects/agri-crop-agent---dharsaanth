import React, { useState } from 'react';
import { MessageSquare, Send, Sparkles } from 'lucide-react';
import { FarmInputs, WeatherData } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface Props {
  farmInputs: FarmInputs;
  weatherData: WeatherData | null;
  externalQuery?: string | null;
  onClearExternalQuery?: () => void;
}

export const AskAdvisorCard: React.FC<Props> = ({
  farmInputs,
  weatherData,
  externalQuery,
  onClearExternalQuery,
}) => {
  const { t, language, suggestedQuestions } = useLanguage();
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Trigger query when externalQuery changes
  React.useEffect(() => {
    if (externalQuery && externalQuery.trim()) {
      setQuestion(externalQuery);
      handleAsk(externalQuery);
      if (onClearExternalQuery) {
        onClearExternalQuery();
      }
    }
  }, [externalQuery]);

  const handleAsk = async (qText?: string) => {
    const query = qText || question;
    if (!query.trim()) return;

    setIsLoading(true);
    setAnswer(null);

    try {
      const res = await fetch('/api/ask-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: query,
          farmInputs,
          weatherData,
          language,
        }),
      });
      const data = await res.json();
      setAnswer(data.answer || 'Consult your local agronomy extension worker for direct field tests.');
    } catch (err) {
      console.warn('Q&A error:', err);
      setAnswer(
        'For safe soil and crop management, maintain good field drainage and inspect root moisture. Consult your local agricultural officer for specific localized prescriptions.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="ask-advisor-section" className="bg-white rounded-xl border border-stone-200 p-5 shadow-sm">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-stone-100">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-stone-900">{t.askAdvisorTitle}</h3>
            <p className="text-xs text-stone-500">{t.askAdvisorSubtitle}</p>
          </div>
        </div>
        <span className="text-[11px] text-stone-500 bg-stone-100 px-2 py-1 rounded-md flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-emerald-600" /> Powered by Gemini
        </span>
      </div>

      {/* Suggested quick questions */}
      <div className="mb-3">
        <div className="text-xs text-stone-500 mb-1.5 font-medium">{t.frequentlyAsked}</div>
        <div className="flex flex-wrap gap-1.5">
          {suggestedQuestions.map((sq, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setQuestion(sq);
                handleAsk(sq);
              }}
              className="text-left text-[11px] px-2.5 py-1.5 rounded-lg bg-stone-50 hover:bg-emerald-50 text-stone-700 hover:text-emerald-800 border border-stone-200 transition-colors cursor-pointer"
            >
              {sq}
            </button>
          ))}
        </div>
      </div>

      {/* Input row */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder={t.askInputPlaceholder}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleAsk();
          }}
          className="flex-1 px-3 py-2 text-xs sm:text-sm bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-stone-900"
        />
        <button
          type="button"
          onClick={() => handleAsk()}
          disabled={isLoading || !question.trim()}
          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              <span>{t.askBtn}</span>
              <Send className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>

      {/* Answer container */}
      {answer && (
        <div className="mt-4 p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-200 text-xs text-stone-800 leading-relaxed">
          <div className="font-semibold text-emerald-900 mb-1 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
            <span>{t.advisoryResponse}</span>
          </div>
          <p>{answer}</p>
        </div>
      )}
    </div>
  );
};
