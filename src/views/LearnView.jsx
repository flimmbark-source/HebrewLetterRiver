import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useLocalization } from '../context/LocalizationContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useTutorial } from '../context/TutorialContext.jsx';
import { getReadingTextsForLanguage } from '../data/readingTexts/index.js';
import { sentencesByTheme } from '../data/sentences/index.ts';
import ReadingArea from '../components/ReadingArea';
import SectionDictionary from '../components/SectionDictionary';
import { getLocalizedTitle, getLocalizedSubtitle, getLanguageCode } from '../lib/languageUtils';
import { getFontClass } from '../lib/readingUtils';
import PackVowelLayoutsIntroModal from '../components/reading/PackVowelLayoutsIntroModal.jsx';
import VowelLayoutSystemModal from '../components/reading/VowelLayoutSystemModal.jsx';
import { hasShownPackIntro, getLearnedLayouts } from '../lib/vowelLayoutProgress.js';
import { deriveLayoutFromTransliteration } from '../lib/vowelLayoutDerivation.js';
import SentencePracticeArea from '../components/SentencePracticeArea.jsx';
import { getThemeStats } from '../lib/sentenceProgressStorage.ts';
import ModuleCard from '../components/ModuleCard.jsx';
import { getModulesInOrder } from '../data/modules/index.ts';
import { isModuleUnlocked, initializeFirstModule } from '../lib/moduleProgressStorage.ts';

export default function LearnView() {
  const { t } = useLocalization();
  const { languageId: practiceLanguageId, appLanguageId } = useLanguage();
  const { startTutorial, hasCompletedTutorial, currentTutorial } = useTutorial();
  const [selectedTextId, setSelectedTextId] = useState(null);
  const [selectedSentenceTheme, setSelectedSentenceTheme] = useState(null);
  const [dictionarySectionId, setDictionarySectionId] = useState(null);
  const [packIntroTextId, setPackIntroTextId] = useState(null);
  const [showSystemModal, setShowSystemModal] = useState(false);
  const [moduleRefreshKey, setModuleRefreshKey] = useState(0);

  // Auto-trigger readIntro tutorial on first visit
  useEffect(() => {
    if (!hasCompletedTutorial('readIntro') && !currentTutorial) {
      startTutorial('readIntro');
    }
  }, [hasCompletedTutorial, startTutorial, currentTutorial]);

  // Initialize first module for new users
  useEffect(() => {
    initializeFirstModule();
  }, []);

  // Get all modules in order
  const modules = getModulesInOrder();

  // Handle module completion
  const handleModuleComplete = () => {
    // Refresh modules to show newly unlocked ones
    setModuleRefreshKey(prev => prev + 1);
  };

  // Get reading texts for current practice language
  const readingTexts = getReadingTextsForLanguage(practiceLanguageId);

  // Handle pack selection - go straight to practice
  // Note: Pack-specific vowel layout intro modal disabled in favor of global system modal in ReadingArea
  const handlePackSelect = (textId) => {
    // Go straight to practice (no pack intro modal)
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

  // Note: Old vocab texts are kept for backwards compatibility but hidden in new module layout
  // If a text is selected from old sections, show the reading area
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

  // Show learning path with modules
  return (
    <div className="space-y-6">
      <header className="space-y-2 px-1">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-semibold text-slate-800">
            Learning Path
          </h2>
          {practiceLanguageId === 'hebrew' && (
            <button
              onClick={() => setShowSystemModal(true)}
              className="flex-shrink-0 flex h-7 w-7 items-center justify-center rounded-full border border-slate-400 bg-slate-100 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-200 hover:border-slate-500 hover:text-slate-800"
              title="Learn about vowel patterns"
            >
              ?
            </button>
          )}
        </div>
        <p className="text-sm text-slate-600">
          Follow the modules below to learn Hebrew step by step. Complete vocab, grammar, and sentences in each module to unlock the next.
        </p>
      </header>

      {/* Learning Path - Modules in Sequential Order */}
      <div className="space-y-6" key={moduleRefreshKey}>
        {modules.map((module) => {
          const unlocked = isModuleUnlocked(module.id);
          return (
            <ModuleCard
              key={module.id}
              module={module}
              isLocked={!unlocked}
              onModuleComplete={handleModuleComplete}
            />
          );
        })}
      </div>

      {/* Vowel Layout System Modal (general explanation) */}
      <VowelLayoutSystemModal
        isVisible={showSystemModal}
        onClose={() => setShowSystemModal(false)}
        appFontClass={getFontClass(appLanguageId)}
      />
    </div>
  );
}

// Card component for each reading text
function SentenceThemeCard({ theme, sentences, onSelect, t }) {
  const difficulties = sentences.map((s) => s.difficulty);
  const min = Math.min(...difficulties);
  const max = Math.max(...difficulties);
  const stats = getThemeStats(theme, sentences);

  return (
    <article
      className="cursor-pointer rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md"
      onClick={onSelect}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <div>
          <h4 className="text-lg font-semibold text-slate-900">{theme}</h4>
          <p className="text-sm text-slate-600">
            {min === max ? `Tier ${min}` : `Tier ${min}–${max}`}
          </p>
        </div>
        <div className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
          {stats.practiced}/{stats.total} {t('read.sentence.card.progress')}
        </div>
      </div>
      <div className="flex items-center justify-between text-sm text-slate-700">
        <span>{t('read.sentence.card.callToAction')}</span>
        <span>→</span>
      </div>
    </article>
  );
}

SentenceThemeCard.propTypes = {
  theme: PropTypes.string.isRequired,
  sentences: PropTypes.arrayOf(PropTypes.object).isRequired,
  onSelect: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired
};

function ReadingTextCard({ text, appLanguageId, onSelect }) {
  const title = getLocalizedTitle(text, appLanguageId);
  const subtitle = getLocalizedSubtitle(text, appLanguageId);

  // Count words (exclude punctuation)
  const wordCount = text.tokens.filter(t => t.type === 'word').length;

  return (
    <article
      className="cursor-pointer rounded-xl border border-slate-200 bg-gradient-to-br from-amber-50 to-emerald-50 p-3 shadow-sm transition-all hover:shadow-md"
      onClick={onSelect}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <h4 className="text-lg font-semibold text-emerald-900">
          {title}
        </h4>
        <span className="rounded-full bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-600">
          {wordCount} words
        </span>
      </div>
      <p className="text-sm text-slate-600">{subtitle}</p>
      <div className="mt-3 flex items-center gap-2 text-xs font-medium text-emerald-600">
        <span>Start Reading</span>
        <span>→</span>
      </div>
    </article>
  );
}
