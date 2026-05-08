import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Lock, Check, BookOpen, Languages, MessageSquare, ArrowRight, Map } from 'lucide-react';
import ReadingArea from './ReadingArea';
import ModuleDictionaryModal from './ModuleDictionaryModal';
import {
  getModuleProgress,
  markVocabSectionPracticed,
  markGrammarPracticed,
  getModuleCompletionPercentage,
  autoUnlockNextModule,
  initializeModuleProgress,
  syncSentenceCompletion,
} from '../lib/moduleProgressStorage';
import { allSentences } from '../data/sentences';
import { getThemeStats } from '../lib/sentenceProgressStorage';
import { getReadingTextById } from '../data/readingTexts/index.js';
import { useLanguage } from '../context/LanguageContext';
import { useLocalization } from '../context/LocalizationContext.jsx';
import { getCardProgress, isCardComplete } from '../lib/cardProgressHelper';
import { useGame } from '../context/GameContext.jsx';
import riverBackground from '../assets/Reading/River-Background.png';

const STEP_ICON_CLASSES = 'h-5 w-5';

function getLocalizedTextValue(value, appLanguageId, fallback = '') {
  if (!value) return fallback;
  if (typeof value === 'string') return value;
  return value?.[appLanguageId] || value?.en || fallback;
}

function getProgressLabel(step, t) {
  if (step.type === 'vocab' && step.progress?.total > 0) {
    return `${step.progress.correct}/${step.progress.total} ${t('module.logbook.wordsLearnedShort', 'words')}`;
  }

  if (step.type === 'sentences') {
    return `${step.sentencesCompleted}/${step.totalSentences} ${t('module.logbook.sentencesShort', 'sentences')}`;
  }

  if (step.isComplete) {
    return t('module.logbook.complete', 'Complete');
  }

  return t('module.logbook.ready', 'Ready');
}

function RouteStepCard({ step, index, isActive }) {
  const Icon = step.icon;

  return (
    <button
      type="button"
      onClick={step.onClick}
      disabled={step.disabled}
      className={`group relative w-full rounded-3xl border p-4 text-left shadow-sm transition-all duration-200 ${
        isActive
          ? 'border-amber-300 bg-amber-50/95 shadow-lg shadow-amber-950/10 ring-2 ring-amber-200/70'
          : step.isComplete
            ? 'border-emerald-200 bg-cream-50/90 bg-white/90'
            : 'border-white/70 bg-white/85 hover:-translate-y-0.5 hover:bg-white/95 hover:shadow-md'
      } ${step.disabled ? 'cursor-default opacity-75' : 'cursor-pointer'}`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white shadow ${
            isActive ? 'bg-amber-500' : step.isComplete ? 'bg-emerald-700' : 'bg-slate-500'
          }`}
        >
          {index + 1}
        </div>

        <div className="flex min-w-0 flex-1 gap-3">
          <div className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-900/10 text-emerald-900">
            <Icon className={STEP_ICON_CLASSES} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h4 className="font-semibold leading-tight text-slate-900">{step.title}</h4>
                <p className="mt-1 text-sm leading-snug text-slate-700">{step.description}</p>
              </div>

              <div className="shrink-0 pt-0.5">
                {step.isComplete ? (
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-700 text-white shadow-sm">
                    <Check className="h-4 w-4" />
                  </span>
                ) : isActive ? (
                  <span className="flex h-7 w-7 items-center justify-center rounded-full border border-amber-300 bg-white text-amber-700 shadow-sm transition-transform group-hover:translate-x-0.5">
                    <ArrowRight className="h-4 w-4" />
                  </span>
                ) : (
                  <span className="block h-7 w-7 rounded-full border border-dashed border-slate-300 bg-white/70" />
                )}
              </div>
            </div>

            <div className="mt-3 inline-flex rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-emerald-900 shadow-sm">
              {getProgressLabel(step, step.t)}
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}

/**
 * ModuleCard - Displays a learning module with vocab, grammar, and sentences.
 * The overview is presented as a River Logbook route while preserving the
 * existing vocab, grammar, sentence, progress, and dictionary flows.
 */
export default function ModuleCard({ module, isLocked, onModuleComplete, onPracticeChange }) {
  const { languageId: practiceLanguageId, appLanguageId } = useLanguage();
  const { t } = useLocalization();
  const vocabTextIds = module.vocabTextIds || [];
  const grammarTextIds = module.grammarTextIds || [];
  const [activeSection, setActiveSection] = useState(null); // 'grammar', 'sentences', or a vocab text ID
  const [progress, setProgress] = useState(null);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [showDictionary, setShowDictionary] = useState(false);
  const [selectedGrammarTextId, setSelectedGrammarTextId] = useState(module.grammarTextId);
  const [cardProgressMap, setCardProgressMap] = useState({}); // Track progress for each card
  const { openGame } = useGame();
  const hasPerVocabGrammar =
    grammarTextIds.length > 0 && grammarTextIds.length === vocabTextIds.length;

  // Load progress on mount and ensure module is initialized
  useEffect(() => {
    let moduleProgress = getModuleProgress(module.id);
    if (!moduleProgress) {
      moduleProgress = initializeModuleProgress(
        module.id,
        module.sentenceIds.length,
        vocabTextIds.length
      );
    }
    setProgress(moduleProgress);
    setCompletionPercentage(getModuleCompletionPercentage(module.id));
    setSelectedGrammarTextId(grammarTextIds?.[0] || module.grammarTextId);
  }, [
    module.id,
    module.sentenceIds.length,
    module.vocabTextIds?.length,
    module.grammarTextId,
    module.grammarTextIds?.join(','),
  ]);

  // Calculate progress for all vocab and grammar cards
  useEffect(() => {
    const newProgressMap = {};

    vocabTextIds.forEach(vocabTextId => {
      newProgressMap[vocabTextId] = getCardProgress(vocabTextId, practiceLanguageId);
    });

    grammarTextIds.forEach(grammarTextId => {
      newProgressMap[grammarTextId] = getCardProgress(grammarTextId, practiceLanguageId);
    });

    if (module.grammarTextId) {
      newProgressMap[module.grammarTextId] = getCardProgress(module.grammarTextId, practiceLanguageId);
    }

    setCardProgressMap(newProgressMap);
  }, [vocabTextIds.join(','), grammarTextIds.join(','), module.grammarTextId, practiceLanguageId, activeSection]);

  // Notify parent when practice mode changes
  useEffect(() => {
    if (onPracticeChange) {
      onPracticeChange(module.id, activeSection);
    }
  }, [activeSection, module.id, onPracticeChange]);

  useEffect(() => {
    if (!activeSection) return;
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    });
  }, [activeSection]);

  const moduleSentences = allSentences.filter(s =>
    module.sentenceIds.includes(s.id)
  );

  const handleVocabSectionComplete = (vocabTextId) => {
    markVocabSectionPracticed(module.id, vocabTextId);
    setActiveSection(null);
    updateProgress();
  };

  const handleGrammarComplete = () => {
    markGrammarPracticed(module.id);
    setActiveSection(null);
    updateProgress();
  };

  const updateProgress = () => {
    const updated = getModuleProgress(module.id);
    setProgress(updated);
    setCompletionPercentage(getModuleCompletionPercentage(module.id));

    if (updated?.isCompleted) {
      autoUnlockNextModule(module.id);
      if (onModuleComplete) {
        onModuleComplete(module.id);
      }
    }
  };

  const handleStartGrammar = (grammarTextId) => {
    setSelectedGrammarTextId(grammarTextId || module.grammarTextId);
    setActiveSection('grammar');
  };

  const handleStartSentences = () => {
    setActiveSection('sentences');
  };

  const handleBack = () => {
    if (activeSection === 'sentences') {
      const stats = getThemeStats(module.title, moduleSentences);
      syncSentenceCompletion(module.id, stats.practiced);
      updateProgress();
    }
    setActiveSection(null);
  };

  const handlePlayGame = (vocabTextId) => {
    const vocabText = getReadingTextById(vocabTextId, practiceLanguageId);
    if (!vocabText) {
      console.error('Vocab text not found:', vocabTextId);
      return;
    }

    const vocabData = {
      textId: vocabTextId,
      title: vocabText.title?.en || 'Vocabulary Practice',
      subtitle: vocabText.subtitle?.en || 'Match words with their emojis',
      words: vocabText.tokens
        .filter(token => token.type === 'word')
        .map(token => ({
          id: token.id,
          text: token.text,
          gloss: vocabText.glosses?.en?.[token.id] || token.id,
          transliteration: vocabText.translations?.en?.[token.id]?.canonical || token.id
        })),
      emojis: vocabText.emojis || {}
    };

    openGame({
      mode: 'vocab',
      vocabData,
      autostart: true
    });
  };

  if (isLocked) {
    return (
      <div className="w-full overflow-hidden rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm opacity-70">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
            <Lock className="h-5 w-5" />
          </span>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">{module.title}</h3>
            <p className="text-sm text-slate-600">
              {t('module.logbook.locked', 'Complete the previous module to unlock this lesson.')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (activeSection && vocabTextIds.includes(activeSection)) {
    return (
      <ReadingArea
        textId={activeSection}
        onBack={() => handleVocabSectionComplete(activeSection)}
      />
    );
  }

  if (activeSection === 'grammar') {
    return (
      <ReadingArea
        textId={selectedGrammarTextId || module.grammarTextId}
        onBack={handleGrammarComplete}
      />
    );
  }

  if (activeSection === 'sentences') {
    const firstSentence = moduleSentences[0];
    if (!firstSentence) {
      return (
        <div className="p-4">
          <p>{t('read.sentence.noSentence', 'No sentence available yet.')}</p>
          <button onClick={handleBack}>{t('reading.back', 'Back')}</button>
        </div>
      );
    }

    const sentenceTextId = `sentence-${firstSentence.id}`;

    return (
      <ReadingArea
        textId={sentenceTextId}
        onBack={handleBack}
        mode="sentence"
      />
    );
  }

  const vocabSteps = vocabTextIds.map((vocabTextId, index) => {
    const vocabText = getReadingTextById(vocabTextId, practiceLanguageId);
    const cardProgress = cardProgressMap[vocabTextId] || { correct: 0, total: 0 };
    const isComplete = isCardComplete(vocabTextId, practiceLanguageId)
      || progress?.vocabSectionsPracticed?.includes(vocabTextId);

    return {
      id: vocabTextId,
      type: 'vocab',
      title: vocabTextIds.length > 1
        ? t('module.logbook.gatherWordsNumbered', 'Gather Words {{number}}', { number: index + 1 })
        : t('module.logbook.gatherWords', 'Gather Words'),
      description: getLocalizedTextValue(
        vocabText?.subtitle,
        appLanguageId,
        t('module.logbook.gatherWordsDesc', 'Collect useful words for this route.')
      ),
      progress: cardProgress,
      isComplete,
      icon: BookOpen,
      onClick: () => handlePlayGame(vocabTextId),
      t,
    };
  });

  const grammarSourceIds = hasPerVocabGrammar
    ? grammarTextIds
    : module.grammarTextId
      ? [module.grammarTextId]
      : [];

  const grammarSteps = grammarSourceIds.map((grammarTextId, index) => {
    const grammarText = getReadingTextById(grammarTextId, practiceLanguageId);
    const cardProgress = cardProgressMap[grammarTextId] || { correct: 0, total: 0 };
    const isComplete = isCardComplete(grammarTextId, practiceLanguageId)
      || progress?.grammarPracticed;

    return {
      id: grammarTextId,
      type: 'grammar',
      title: grammarSourceIds.length > 1
        ? t('module.logbook.noticePatternNumbered', 'Notice the Pattern {{number}}', { number: index + 1 })
        : t('module.logbook.noticePattern', 'Notice the Pattern'),
      description: getLocalizedTextValue(
        grammarText?.subtitle,
        appLanguageId,
        t('module.logbook.noticePatternDesc', 'See how the pieces fit together.')
      ),
      progress: cardProgress,
      isComplete,
      icon: Languages,
      onClick: () => handleStartGrammar(grammarTextId),
      t,
    };
  });

  const sentenceStep = {
    id: 'sentences',
    type: 'sentences',
    title: t('module.logbook.readInContext', 'Read in Context'),
    description: t('module.logbook.readInContextDesc', 'Read sentences and build meaning from the words you learned.'),
    sentencesCompleted: progress?.sentencesCompleted || 0,
    totalSentences: progress?.totalSentences || moduleSentences.length,
    isComplete: progress && progress.sentencesCompleted >= progress.totalSentences,
    icon: MessageSquare,
    onClick: handleStartSentences,
    t,
  };

  const reflectionStep = {
    id: 'reflection',
    type: 'reflection',
    title: t('module.logbook.reflection', 'Reflection'),
    description: progress?.isCompleted
      ? t('module.logbook.reflectionDoneDesc', 'This route is complete. Review the words in your dictionary anytime.')
      : t('module.logbook.reflectionDesc', 'Look back and solidify your learning after the route is complete.'),
    isComplete: progress?.isCompleted,
    icon: Map,
    onClick: () => setShowDictionary(true),
    disabled: !progress?.isCompleted,
    t,
  };

  const routeSteps = [...vocabSteps, ...grammarSteps, sentenceStep, reflectionStep];
  const completedStepCount = routeSteps.filter(step => step.isComplete).length;
  const nextStep = routeSteps.find(step => !step.isComplete && !step.disabled) || routeSteps.find(step => !step.disabled);
  const learnedWords = vocabSteps.reduce((sum, step) => sum + (step.progress?.correct || 0), 0);

  return (
    <div className="relative w-full overflow-hidden rounded-[2rem] border border-emerald-900/10 bg-emerald-950 text-slate-900 shadow-xl shadow-emerald-950/10">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${riverBackground})` }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-amber-50/88 via-amber-50/48 to-emerald-950/20" aria-hidden="true" />
      <div className="absolute inset-0 backdrop-blur-[1px]" aria-hidden="true" />

      <div className="relative space-y-5 p-5 sm:p-6">
        <header className="rounded-[1.75rem] border border-white/70 bg-amber-50/88 p-5 text-center shadow-lg shadow-emerald-950/10 backdrop-blur-md">
          <div className="mb-2 flex items-center justify-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-emerald-900/75">
            <span className="h-px w-8 bg-emerald-900/25" />
            {t('module.logbook.title', 'River Logbook')}
            <span className="h-px w-8 bg-emerald-900/25" />
          </div>
          <h3 className="text-2xl font-bold tracking-tight text-emerald-950 sm:text-3xl">
            {module.title}
          </h3>
          <p className="mx-auto mt-2 max-w-2xl text-sm leading-relaxed text-slate-700 sm:text-base">
            {module.description}
          </p>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/70 bg-white/80 p-3 shadow-sm">
              <div className="text-2xl font-bold text-emerald-950">{learnedWords}</div>
              <div className="text-xs font-semibold text-slate-600">{t('module.logbook.wordsLearned', 'words learned')}</div>
            </div>
            <div className="rounded-2xl border border-white/70 bg-white/80 p-3 shadow-sm">
              <div className="text-2xl font-bold text-emerald-950">{completedStepCount}/{routeSteps.length}</div>
              <div className="text-xs font-semibold text-slate-600">{t('module.logbook.stepsComplete', 'steps complete')}</div>
            </div>
            <div className="col-span-2 rounded-2xl border border-white/70 bg-white/80 p-3 shadow-sm sm:col-span-1">
              <div className="text-2xl font-bold text-emerald-950">{completionPercentage}%</div>
              <div className="text-xs font-semibold text-slate-600">{t('module.logbook.routeProgress', 'route progress')}</div>
            </div>
          </div>
        </header>

        <section className="space-y-3" aria-label={t('module.logbook.todayRoute', 'Today’s Route')}>
          <div className="flex items-center justify-between rounded-full border border-white/60 bg-white/70 px-4 py-2 text-sm font-semibold text-emerald-950 shadow-sm backdrop-blur-md">
            <span>{t('module.logbook.todayRoute', 'Today’s Route')}</span>
            <button
              type="button"
              onClick={() => setShowDictionary(true)}
              className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs text-emerald-900 transition hover:bg-emerald-900/10"
            >
              <BookOpen className="h-3.5 w-3.5" />
              {t('read.dictionary.button', 'Dictionary')}
            </button>
          </div>

          <div className="space-y-3">
            {routeSteps.map((step, index) => (
              <RouteStepCard
                key={step.id}
                step={step}
                index={index}
                isActive={nextStep?.id === step.id}
              />
            ))}
          </div>
        </section>

        <Button
          onClick={nextStep?.onClick || (() => setShowDictionary(true))}
          disabled={!nextStep}
          className="h-14 w-full rounded-2xl bg-emerald-900 text-base font-bold text-white shadow-lg shadow-emerald-950/25 transition hover:bg-emerald-800"
        >
          <span>{t('module.logbook.continueDownriver', 'Continue Downriver')}</span>
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>

      <ModuleDictionaryModal
        module={module}
        isOpen={showDictionary}
        onClose={() => setShowDictionary(false)}
      />
    </div>
  );
}
