import React, { useState, useEffect } from 'react';
import { useLocalization } from '../context/LocalizationContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useTutorial } from '../context/TutorialContext.jsx';
import { getReadingTextsForLanguage } from '../data/readingTexts/index.js';
import ReadingArea from '../components/ReadingArea';
import SectionDictionary from '../components/SectionDictionary';
import { getLocalizedTitle, getLocalizedSubtitle, getLanguageCode } from '../lib/languageUtils';
import { getFontClass } from '../lib/readingUtils';
import PackVowelLayoutsIntroModal from '../components/reading/PackVowelLayoutsIntroModal.jsx';
import { hasShownPackIntro, getLearnedLayouts } from '../lib/vowelLayoutProgress.js';
import { deriveLayoutFromTransliteration } from '../lib/vowelLayoutDerivation.js';

export default function LearnView() {
  const { t } = useLocalization();
  const { languageId: practiceLanguageId, appLanguageId } = useLanguage();
  const { startTutorial, hasCompletedTutorial, currentTutorial } = useTutorial();
  const [selectedTextId, setSelectedTextId] = useState(null);
  const [dictionarySectionId, setDictionarySectionId] = useState(null);
  const [packIntroTextId, setPackIntroTextId] = useState(null);

  // Auto-trigger readIntro tutorial on first visit
  useEffect(() => {
    if (!hasCompletedTutorial('readIntro') && !currentTutorial) {
      startTutorial('readIntro');
    }
  }, [hasCompletedTutorial, startTutorial, currentTutorial]);

  // Get reading texts for current practice language
  const readingTexts = getReadingTextsForLanguage(practiceLanguageId);

  // Handle pack selection - show intro modal first for Hebrew packs if needed
  const handlePackSelect = (textId) => {
    const text = readingTexts.find(t => t.id === textId);

    // Only show intro for Hebrew packs with derivable vowel layouts
    if (practiceLanguageId === 'hebrew' && text) {
      // Check if any tokens have derivable layouts
      const hasVowelLayouts = text.tokens.some(token => {
        if (token.type !== 'word') return false;
        const translit = text.translations?.en?.[token.id]?.canonical;
        if (!translit) return false;
        const layout = deriveLayoutFromTransliteration(translit);
        return layout !== null;
      });

      if (hasVowelLayouts && !hasShownPackIntro(textId)) {
        // Show intro modal first
        setPackIntroTextId(textId);
        return;
      }
    }

    // Otherwise, go straight to practice
    setSelectedTextId(textId);
  };

  // Handle starting practice from intro modal
  const handleStartFromIntro = () => {
    if (packIntroTextId) {
      setSelectedTextId(packIntroTextId);
      setPackIntroTextId(null);
    }
  };
  console.log('[LearnView DEBUG] practiceLanguageId:', practiceLanguageId);
  console.log('[LearnView DEBUG] readingTexts.length:', readingTexts.length);
  console.log('[LearnView DEBUG] readingTexts:', readingTexts);

  // Group texts by sectionId (pure UI layer)
  const textsBySection = {};
  readingTexts.forEach(text => {
    const section = text.sectionId || 'starter'; // default to starter for backwards compatibility
    if (!textsBySection[section]) {
      textsBySection[section] = [];
    }
    textsBySection[section].push(text);
  });

  console.log('[LearnView DEBUG] textsBySection:', textsBySection);
  console.log('[LearnView DEBUG] Object.keys(textsBySection):', Object.keys(textsBySection));

  // Section metadata
  const sectionMeta = {
    starter: {
      titleKey: 'read.starter',
      descKey: 'read.starterDesc'
    },
    // Old cafeTalk section (kept for backwards compatibility)
    cafeTalk: {
      titleKey: 'read.cafeTalk',
      descKey: 'read.cafeTalkDesc'
    },
    // Vowel Layout Practice section (appears after Starter, before Cafe Talk subsections)
    vowelLayoutPractice: {
      titleKey: 'read.vowelLayoutPractice',
      descKey: 'read.vowelLayoutPracticeDesc',
      fallbackTitle: 'Vowel Layout Practice',
      fallbackDesc: 'Focused practice on vowel patterns'
    },
    // New Cafe Talk subsections
    conversationGlue: {
      titleKey: 'read.conversationGlue',
      descKey: 'read.conversationGlueDesc',
      fallbackTitle: 'Conversation Glue',
      fallbackDesc: 'Essential discourse markers and connectors'
    },
    timeSequencing: {
      titleKey: 'read.timeSequencing',
      descKey: 'read.timeSequencingDesc',
      fallbackTitle: 'Time & Sequencing',
      fallbackDesc: 'Words for expressing when things happen'
    },
    peopleWords: {
      titleKey: 'read.peopleWords',
      descKey: 'read.peopleWordsDesc',
      fallbackTitle: 'People Words',
      fallbackDesc: 'Pronouns and references to people'
    },
    coreStoryVerbs: {
      titleKey: 'read.coreStoryVerbs',
      descKey: 'read.coreStoryVerbsDesc',
      fallbackTitle: 'Core Story Verbs',
      fallbackDesc: 'Essential action verbs for storytelling'
    },
    lifeLogistics: {
      titleKey: 'read.lifeLogistics',
      descKey: 'read.lifeLogisticsDesc',
      fallbackTitle: 'Life Logistics',
      fallbackDesc: 'Daily life and practical words'
    },
    reactionsFeelings: {
      titleKey: 'read.reactionsFeelings',
      descKey: 'read.reactionsFeelingsDesc',
      fallbackTitle: 'Reactions & Feelings',
      fallbackDesc: 'Emotional responses and descriptions'
    },
    everydayTopics: {
      titleKey: 'read.everydayTopics',
      descKey: 'read.everydayTopicsDesc',
      fallbackTitle: 'Everyday Topics',
      fallbackDesc: 'Common conversation topics and things'
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

  // Get section title for dictionary modal
  const getDictionarySectionTitle = (sectionId) => {
    const meta = sectionMeta[sectionId];
    if (!meta) return '';
    // Try to get translated title, fall back to English if not available
    const translatedTitle = t(meta.titleKey);
    return translatedTitle !== meta.titleKey ? translatedTitle : (meta.fallbackTitle || '');
  };

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

            // Get translated or fallback title/desc
            const sectionTitle = (() => {
              const translated = t(meta.titleKey);
              return translated !== meta.titleKey ? translated : (meta.fallbackTitle || sectionId);
            })();
            const sectionDesc = (() => {
              const translated = t(meta.descKey);
              return translated !== meta.descKey ? translated : (meta.fallbackDesc || '');
            })();

            return (
              <div key={sectionId} className="space-y-4">
                <div className="flex items-start justify-between gap-4 px-1">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold" style={{ color: '#1F2937' }}>{sectionTitle}</h3>
                    <p className="text-sm" style={{ color: '#6B7280' }}>{sectionDesc}</p>
                  </div>
                  <button
                    onClick={() => setDictionarySectionId(sectionId)}
                    className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700"
                    style={{ marginTop: '2px' }}
                  >
                    <span>📖</span>
                    <span>{t('read.dictionary.button')}</span>
                  </button>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  {sectionTexts.map((text) => (
                    <ReadingTextCard
                      key={text.id}
                      text={text}
                      appLanguageId={appLanguageId}
                      onSelect={() => handlePackSelect(text.id)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Section Dictionary Modal */}
      <SectionDictionary
        sectionId={dictionarySectionId}
        sectionTitle={getDictionarySectionTitle(dictionarySectionId)}
        isOpen={dictionarySectionId !== null}
        onClose={() => setDictionarySectionId(null)}
      />

      {/* Pack Vowel Layouts Intro Modal (Hebrew only) */}
      {packIntroTextId && (() => {
        const text = readingTexts.find(t => t.id === packIntroTextId);
        if (!text) return null;

        // Derive unique layout IDs from tokens
        const layoutsMap = new Map();
        text.tokens.forEach(token => {
          if (token.type !== 'word') return;
          const translit = text.translations?.en?.[token.id]?.canonical;
          if (!translit) return;
          const layout = deriveLayoutFromTransliteration(translit);
          if (layout) {
            if (!layoutsMap.has(layout.id)) {
              layoutsMap.set(layout.id, []);
            }
            layoutsMap.get(layout.id).push({
              hebrew: token.text,
              transliteration: translit,
              meaning: text.meaningKeys?.[token.id]
                ? t(text.meaningKeys[token.id])
                : (text.glosses?.[getLanguageCode(appLanguageId)]?.[token.id] ?? token.id)
            });
          }
        });

        const layoutIdsInPack = Array.from(layoutsMap.keys());

        // Get learned layouts for Hebrew
        const learnedLayouts = getLearnedLayouts('he');

        // Build examples map (layoutId -> examples array)
        const examplesMap = {};
        layoutsMap.forEach((examples, layoutId) => {
          examplesMap[layoutId] = examples;
        });

        return (
          <PackVowelLayoutsIntroModal
            isVisible={true}
            onStart={handleStartFromIntro}
            packId={packIntroTextId}
            packTitle={getLocalizedTitle(text, appLanguageId)}
            layoutIdsInPack={layoutIdsInPack}
            learnedLayouts={learnedLayouts}
            examples={examplesMap}
            practiceFontClass={getFontClass(practiceLanguageId)}
            appFontClass={getFontClass(appLanguageId)}
          />
        );
      })()}
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
