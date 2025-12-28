import React, { useState, useEffect } from 'react';
import { useLocalization } from '../context/LocalizationContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useTutorial } from '../context/TutorialContext.jsx';
import { getReadingTextsForLanguage } from '../data/readingTexts';
import ReadingArea from '../components/ReadingArea';
import { getLocalizedTitle, getLocalizedSubtitle } from '../lib/languageUtils';

export default function LearnView() {
  const { t } = useLocalization();
  const { languageId: practiceLanguageId, appLanguageId } = useLanguage();
  const { startTutorial, hasCompletedTutorial } = useTutorial();
  const [selectedTextId, setSelectedTextId] = useState(null);

  // Auto-trigger readIntro tutorial on first visit
  useEffect(() => {
    if (!hasCompletedTutorial('readIntro')) {
      startTutorial('readIntro');
    }
  }, [hasCompletedTutorial, startTutorial]);

  // Get reading texts for current practice language
  const readingTexts = getReadingTextsForLanguage(practiceLanguageId);

  // Group texts by sectionId (pure UI layer)
  const textsBySection = {};
  readingTexts.forEach(text => {
    const section = text.sectionId || 'starter'; // default to starter for backwards compatibility
    if (!textsBySection[section]) {
      textsBySection[section] = [];
    }
    textsBySection[section].push(text);
  });

  // Section metadata
  const sectionMeta = {
    starter: {
      titleKey: 'read.starter',
      descKey: 'read.starterDesc'
    },
    cafeTalk: {
      titleKey: 'read.cafeTalk',
      descKey: 'read.cafeTalkDesc'
    }
  };

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
    <div className="space-y-6">
      <header className="space-y-2 px-1">
        <h2 className="text-2xl font-semibold" style={{ color: '#1F2937' }}>{t('read.title')}</h2>
        <p className="text-sm" style={{ color: '#6B7280' }}>{t('read.intro')}</p>
      </header>

      {readingTexts.length === 0 ? (
        <div className="space-y-3 px-1">
          <p className="text-sm" style={{ color: '#374151' }}>{t('read.noTexts')}</p>
          <p className="text-xs" style={{ color: '#9CA3AF' }}>{t('read.comingSoon')}</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Render each section that has texts */}
          {Object.keys(textsBySection).map(sectionId => {
            const sectionTexts = textsBySection[sectionId];
            const meta = sectionMeta[sectionId];

            // Skip if no metadata (shouldn't happen but defensive)
            if (!meta) return null;

            return (
              <div key={sectionId} className="space-y-4">
                <div className="px-1">
                  <h3 className="text-lg font-semibold" style={{ color: '#1F2937' }}>{t(meta.titleKey)}</h3>
                  <p className="text-sm" style={{ color: '#6B7280' }}>{t(meta.descKey)}</p>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  {sectionTexts.map((text) => (
                    <ReadingTextCard
                      key={text.id}
                      text={text}
                      appLanguageId={appLanguageId}
                      onSelect={() => setSelectedTextId(text.id)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Card component for each reading text
function ReadingTextCard({ text, appLanguageId, onSelect }) {
  const title = getLocalizedTitle(text, appLanguageId);
  const subtitle = getLocalizedSubtitle(text, appLanguageId);

  // Count words (exclude punctuation)
  const wordCount = text.tokens.filter(t => t.type === 'word').length;

  return (
    <article
      className="cursor-pointer transition-all"
      style={{
        background: 'linear-gradient(135deg, #fffcea 0%, #fcfff2 100%)',
        borderRadius: '12px',
        padding: '12px',
        border: '1px solid #E5E7EB',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.15), 0 2px 4px -2px rgba(0, 0, 0, 0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)';
      }}
      onClick={onSelect}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <h4 className="text-lg font-semibold" style={{ color: '#064E3B' }}>
          {title}
        </h4>
        <span
          className="rounded-full px-2 py-0.5 text-xs font-medium"
          style={{
            background: '#F9FAFB',
            color: '#6B7280',
          }}
        >
          {wordCount} words
        </span>
      </div>
      <p className="text-sm" style={{ color: '#6B7280' }}>{subtitle}</p>
      <div className="mt-3 flex items-center gap-2 text-xs font-medium" style={{ color: '#059669' }}>
        <span>Start Reading</span>
        <span>→</span>
      </div>
    </article>
  );
}
