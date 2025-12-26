import React, { useState } from 'react';
import { useLocalization } from '../context/LocalizationContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { getReadingTextsForLanguage } from '../data/readingTexts';
import ReadingArea from '../components/ReadingArea';

export default function LearnView() {
  const { t } = useLocalization();
  const { languageId: practiceLanguageId, appLanguageId } = useLanguage();
  const [selectedTextId, setSelectedTextId] = useState(null);

  // Get reading texts for current practice language
  const readingTexts = getReadingTextsForLanguage(practiceLanguageId);

  // If a text is selected, show the reading area
  if (selectedTextId) {
    return (
      <ReadingArea
        textId={selectedTextId}
        onBack={() => setSelectedTextId(null)}
      />
    );
  }

  // Show reading text selection
  return (
    <section className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900/60 p-6 text-slate-200 shadow-lg shadow-slate-950/40">
      <header className="space-y-2">
        <h2 className="text-2xl font-semibold text-white">{t('learn.title')}</h2>
        <p className="text-sm text-slate-400">{t('learn.intro')}</p>
      </header>

      {readingTexts.length === 0 ? (
        <div className="space-y-3">
          <p className="text-sm text-slate-300">{t('learn.noTexts')}</p>
          <p className="text-xs text-slate-500">{t('learn.comingSoon')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-white">{t('learn.readingMode')}</h3>
          <p className="text-sm text-slate-400">{t('learn.readingModeDesc')}</p>

          <div className="grid gap-3 md:grid-cols-2">
            {readingTexts.map((text) => (
              <ReadingTextCard
                key={text.id}
                text={text}
                appLanguageId={appLanguageId}
                onSelect={() => setSelectedTextId(text.id)}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

// Card component for each reading text
function ReadingTextCard({ text, appLanguageId, onSelect }) {
  const title = text.title[appLanguageId] || text.title.en || text.id;
  const subtitle = text.subtitle?.[appLanguageId] || text.subtitle?.en || '';

  // Count words (exclude punctuation)
  const wordCount = text.tokens.filter(t => t.type === 'word').length;

  return (
    <article
      className="group cursor-pointer rounded-2xl border border-slate-700 bg-slate-800/60 p-4 transition-all hover:border-slate-600 hover:bg-slate-700/60"
      onClick={onSelect}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <h4 className="text-lg font-semibold text-white group-hover:text-orange-300">
          {title}
        </h4>
        <span className="rounded-full bg-slate-700 px-2 py-0.5 text-xs font-medium text-slate-300">
          {wordCount} words
        </span>
      </div>
      <p className="text-sm text-slate-400">{subtitle}</p>
      <div className="mt-3 flex items-center gap-2 text-xs text-orange-400">
        <span>Start Reading</span>
        <span>→</span>
      </div>
    </article>
  );
}
