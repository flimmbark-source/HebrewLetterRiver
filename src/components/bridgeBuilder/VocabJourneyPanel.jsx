import React, { useEffect, useMemo, useState } from 'react';
import riverHero from '../../assets/vocab-journey/river-valley-hero.webp';
import cafeArt from '../../assets/vocab-journey/cafe-words-art.webp';
import bridgeArt from '../../assets/vocab-journey/bridge-builder-art.webp';
import riverPathMap from '../../assets/vocab-journey/river-path-map.webp';
import {
  getCurrentJourneyPack,
  getJourneyStops,
  getPackWordPreview,
  getPackLearningStage,
  getRecommendedJourneyAction,
  getJourneyStats,
} from './vocabJourneyModel.js';
import './VocabJourneyPanel.css';
import { useLocalization } from '../../context/LocalizationContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { loadBridgeBuilderWords } from '../../data/bridgeBuilder/words/index.js';

function Icon({ children, className = '', filled = false }) {
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={{ fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' 500, 'GRAD' 0, 'opsz' 24` }}
      aria-hidden="true"
    >
      {children}
    </span>
  );
}

function localizeStageInfo(stageInfo, t) {
  const stageLabelKeys = {
    'Not started': 'bridgeBuilder.vocabJourney.stageNotStarted',
    Complete: 'bridgeBuilder.vocabJourney.statusComplete',
    'Ready for challenge': 'bridgeBuilder.vocabJourney.stageReadyForChallenge',
    'Strengthening memory': 'bridgeBuilder.vocabJourney.stageStrengtheningMemory',
    'Learning meanings': 'bridgeBuilder.vocabJourney.stageLearningMeanings',
    'New pack': 'bridgeBuilder.vocabJourney.stageNewPack'
  };

  const stepLabelKeys = {
    first_look: 'bridgeBuilder.vocabJourney.stageFirstLook',
    meaning: 'bridgeBuilder.vocabJourney.stageMeaning',
    review: 'bridgeBuilder.vocabJourney.stageReview',
    challenge: 'bridgeBuilder.vocabJourney.stageChallenge'
  };

  return {
    ...stageInfo,
    label: t(stageLabelKeys[stageInfo?.label] || 'bridgeBuilder.vocabJourney.stageNotStarted', stageInfo?.label || 'Not started'),
    steps: (stageInfo?.steps || []).map((step) => ({
      ...step,
      label: t(stepLabelKeys[step.id] || 'bridgeBuilder.vocabJourney.stageNotStarted', step.label)
    }))
  };
}

function localizeRecommendedAction(action, t) {
  if (!action) return action;

  if (action.method === 'loose_planks') {
    return {
      ...action,
      title: t('bridgeBuilder.vocabJourney.actionLoosePlanksTitle', action.title),
      subtitle: t('bridgeBuilder.vocabJourney.actionLoosePlanksSubtitle', action.subtitle),
      ctaLabel: t('bridgeBuilder.vocabJourney.actionContinueLoosePlanks', action.ctaLabel)
    };
  }

  if (action.method === 'deep_script') {
    return {
      ...action,
      title: t('bridgeBuilder.vocabJourney.actionDeepScriptTitle', action.title),
      subtitle: t('bridgeBuilder.vocabJourney.actionDeepScriptSubtitle', action.subtitle),
      ctaLabel: t('bridgeBuilder.vocabJourney.actionContinueDeepScript', action.ctaLabel)
    };
  }

  if (action.method === 'review') {
    return {
      ...action,
      title: t('bridgeBuilder.vocabJourney.actionReviewTitle', action.title),
      subtitle: t('bridgeBuilder.vocabJourney.actionReviewSubtitle', action.subtitle),
      ctaLabel: t('bridgeBuilder.vocabJourney.actionReviewPack', action.ctaLabel)
    };
  }

  return {
    ...action,
    title: t('bridgeBuilder.vocabJourney.actionBridgeTitle', action.title),
    subtitle: t('bridgeBuilder.vocabJourney.actionBridgeSubtitle', action.subtitle),
    ctaLabel: action.ctaLabel?.toLowerCase().startsWith('start')
      ? t('bridgeBuilder.vocabJourney.actionStartBridge', action.ctaLabel)
      : t('bridgeBuilder.vocabJourney.actionContinueBridge', action.ctaLabel)
  };
}

function getStopStatusLabel(status, t) {
  if (status === 'Open') return t('bridgeBuilder.vocabJourney.statusOpenPath', 'Open path');
  if (status === 'Locked') return t('bridgeBuilder.vocabJourney.statusLocked', 'Locked');
  if (status === 'Complete') return t('bridgeBuilder.vocabJourney.statusComplete', 'Complete');
  if (status === 'Current') return t('bridgeBuilder.vocabJourney.statusCurrent', 'Current');
  return status;
}

function WordChips({ words, t, isMissingPackMapping, languageId = 'hebrew' }) {
  const direction = languageId === 'hebrew' || languageId === 'arabic' ? 'rtl' : 'ltr';

  return (
    <div className="vj-word-chips" dir={direction}>
      {words.length === 0 ? (
        <div style={{ padding: '8px', color: '#999', fontSize: '0.875rem' }}>
          {isMissingPackMapping
            ? t('bridgeBuilder.vocabJourney.missingPackContent', 'Content for this pack is not available in the selected practice language yet.')
            : t('bridgeBuilder.vocabJourney.loadingWords', 'Loading words...')}
        </div>
      ) : (
        words.map((word) => (
          <span key={word} className="vj-word-chip">
            {word}
          </span>
        ))
      )}
    </div>
  );
}

function SheetProgress({ steps, t }) {
  return (
    <div className="vj-sheet-progress" aria-label={t('bridgeBuilder.vocabJourney.packLearningProgress', 'Pack learning progress')}>
      {steps.map((step, index) => (
        <div key={step.id} className="vj-sheet-progress-step">
          <span className={`vj-sheet-progress-node ${step.complete ? 'is-complete' : ''}`}>
            {step.complete ? <Icon>check</Icon> : index + 1}
          </span>
          <span className="vj-sheet-progress-label">{step.label}</span>
        </div>
      ))}
    </div>
  );
}

function CurrentPackDetailSheet({
  t,
  isOpen,
  onClose,
  wordPreview,
  missingPackMapping,
  languageId,
  localizedPackTitle,
  localizedPackDescription,
  stage,
  recommendedAction,
  reviewCount,
  onLaunchRecommended,
  onLaunchLoosePlanks,
  onLaunchDeepScript,
  onReview,
}) {
  useEffect(() => {
    if (!isOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="vj-sheet-backdrop" onClick={onClose}>
      <section
        className="vj-sheet"
        role="dialog"
        aria-modal="true"
        aria-label={t('bridgeBuilder.vocabJourney.packDetails', 'Pack details')}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="vj-sheet-handle" />
        <div className="vj-sheet-hero">
          <img src={cafeArt} alt="" loading="lazy" />
          <div className="vj-sheet-hero-fade" />
          <button type="button" className="vj-sheet-nav-btn vj-sheet-nav-btn--left" onClick={onClose} aria-label={t('bridgeBuilder.vocabJourney.closePackDetails', 'Close pack details')}>
            <Icon>arrow_back</Icon>
          </button>
          <button type="button" className="vj-sheet-nav-btn vj-sheet-nav-btn--right" aria-label={t('bridgeBuilder.vocabJourney.savePack', 'Save pack')}>
            <Icon>bookmark</Icon>
          </button>
        </div>
        <header className="vj-sheet-title-block">
          <h2>{localizedPackTitle}</h2>
          <p>{localizedPackDescription || t('bridgeBuilder.vocabJourney.continueLearningWords', 'Continue learning new words.')}</p>
        </header>

        <WordChips words={wordPreview} t={t} isMissingPackMapping={missingPackMapping} languageId={languageId} />
        <SheetProgress steps={stage.steps} t={t} />

        <div className="vj-recommended">
          <h3>{t('bridgeBuilder.vocabJourney.recommendedNext', 'Recommended next')}</h3>
          <button type="button" className="vj-recommended-card" onClick={onLaunchRecommended}>
            <img src={bridgeArt} alt="" loading="lazy" />
            <span className="vj-recommended-copy">
              <strong>{recommendedAction.title}</strong>
              <small>{recommendedAction.subtitle}</small>
            </span>
            <span className="vj-orange-circle">
              <Icon>chevron_right</Icon>
            </span>
          </button>
        </div>

        <div className="vj-option-list">
          <h3>{t('bridgeBuilder.vocabJourney.moreWaysToLearn', 'More ways to learn')}</h3>
          <button type="button" className="vj-option" onClick={onLaunchLoosePlanks}>
            <span className="vj-option-icon vj-option-icon--teal"><Icon filled>view_stream</Icon></span>
            <span><strong>{t('bridgeBuilder.vocabJourney.optionLoosePlanksTitle', 'Strengthen — Loose Planks')}</strong><small>{t('bridgeBuilder.vocabJourney.optionLoosePlanksSubtitle', 'Reinforce with targeted practice.')}</small></span>
            <Icon>chevron_right</Icon>
          </button>

          <button type="button" className="vj-option" onClick={onReview} disabled={reviewCount <= 0}>
            <span className="vj-option-icon vj-option-icon--blue"><Icon filled>calendar_month</Icon></span>
            <span><strong>{t('bridgeBuilder.vocabJourney.optionReviewTitle', 'Review — Today’s Review')}</strong><small>{t('bridgeBuilder.vocabJourney.optionReviewSubtitle', 'Review words for memory.')}</small></span>
            <Icon>chevron_right</Icon>
          </button>

          <button type="button" className="vj-option" onClick={onLaunchDeepScript}>
            <span className="vj-option-icon vj-option-icon--purple"><Icon filled>ink_pen</Icon></span>
            <span><strong>{t('bridgeBuilder.vocabJourney.optionDeepScriptTitle', 'Challenge — Deep Script')}</strong><small>{t('bridgeBuilder.vocabJourney.optionDeepScriptSubtitle', 'Test depth with writing and recall.')}</small></span>
            <Icon>chevron_right</Icon>
          </button>

          <button type="button" className="vj-option" disabled>
            <span className="vj-option-icon vj-option-icon--blue"><Icon filled>menu_book</Icon></span>
            <span><strong>{t('bridgeBuilder.vocabJourney.optionReadTitle', 'Read — Cafe Talk')}</strong><small>{t('bridgeBuilder.vocabJourney.optionReadSubtitle', 'See the words in a real conversation.')}</small></span>
            <Icon>lock</Icon>
          </button>
        </div>
      </section>
    </div>
  );
}

function sortPackItems(packItems = []) {
  return [...packItems].sort((a, b) => (a.pack?.order ?? 0) - (b.pack?.order ?? 0));
}

function getPackItemState(packItem, currentPackId, t) {
  if (!packItem?.unlocked) {
    return {
      status: t('bridgeBuilder.vocabJourney.packStatusLocked', 'Locked'),
      action: '🔒',
      modifier: 'locked',
      disabled: true,
    };
  }

  if (packItem.pack?.id === currentPackId) {
    return {
      status: t('bridgeBuilder.vocabJourney.packStatusCurrent', 'Current'),
      action: t('bridgeBuilder.vocabJourney.packActionContinue', 'Continue'),
      modifier: 'current',
      disabled: false,
    };
  }

  if (packItem.progress?.completed) {
    return {
      status: t('bridgeBuilder.vocabJourney.packStatusComplete', 'Complete'),
      action: t('bridgeBuilder.vocabJourney.packActionReview', 'Review'),
      modifier: 'complete',
      disabled: false,
    };
  }

  return {
    status: t('bridgeBuilder.vocabJourney.packStatusNext', 'Next'),
    action: t('bridgeBuilder.vocabJourney.packActionStart', 'Start'),
    modifier: 'next',
    disabled: false,
  };
}

function getCompactPackItems(packItems, currentPackId) {
  if (packItems.length <= 3) return packItems;
  const currentIndex = packItems.findIndex((item) => item.pack?.id === currentPackId);

  if (currentIndex <= 1) return packItems.slice(0, 3);
  if (currentIndex >= packItems.length - 2) return packItems.slice(-3);
  return packItems.slice(currentIndex - 1, currentIndex + 2);
}

function PackTrayRow({ packItem, index, currentPackId, t, onSelectPack, compact = false }) {
  const state = getPackItemState(packItem, currentPackId, t);
  const pack = packItem.pack;
  const localizedTitle = t(`packs.${pack.id}.title`, pack.title);

  return (
    <button
      type="button"
      className={`vj-pack-tray-row vj-pack-tray-row--${state.modifier} ${compact ? 'vj-pack-tray-row--compact' : ''}`}
      onClick={() => {
        if (!state.disabled && onSelectPack) onSelectPack(pack.id);
      }}
      disabled={state.disabled}
    >
      <span className="vj-pack-tray-index">{index + 1}</span>
      <span className="vj-pack-tray-title">{localizedTitle}</span>
      <span className="vj-pack-tray-status">{compact ? state.status : state.action}</span>
    </button>
  );
}

function SectionPackTray({
  sectionItem,
  currentPackId,
  t,
  onSelectPack,
  expanded,
  onToggleExpanded,
}) {
  if (!sectionItem) return null;

  const packItems = sortPackItems(sectionItem.packData || []);
  const compactItems = getCompactPackItems(packItems, currentPackId);
  const hiddenCount = Math.max(0, packItems.length - compactItems.length);
  const sectionTitle = t(`bridgeBuilder.sections.${sectionItem.section.id}.title`, sectionItem.section.title);

  if (expanded) {
    return (
      <section className="vj-pack-drawer" aria-label={t('bridgeBuilder.vocabJourney.sectionPackDrawer', '{{section}} packs', { section: sectionTitle })}>
        <header className="vj-pack-drawer-header">
          <div>
            <h3>{t('bridgeBuilder.vocabJourney.sectionPackCount', '{{section}} · {{count}} packs', { section: sectionTitle, count: packItems.length })}</h3>
            <p>{t('bridgeBuilder.vocabJourney.pickPackInSection', 'Pick a pack from this section.')}</p>
          </div>
          <button type="button" className="vj-pack-drawer-close" onClick={onToggleExpanded} aria-label={t('common.close', 'Close')}>
            <Icon>close</Icon>
          </button>
        </header>
        <div className="vj-pack-drawer-list">
          {packItems.map((packItem, index) => (
            <PackTrayRow
              key={packItem.pack.id}
              packItem={packItem}
              index={index}
              currentPackId={currentPackId}
              t={t}
              onSelectPack={onSelectPack}
            />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="vj-pack-tray" aria-label={t('bridgeBuilder.vocabJourney.sectionPackTray', 'Packs in {{section}}', { section: sectionTitle })}>
      <h3>{t('bridgeBuilder.vocabJourney.packsInSection', 'Packs in {{section}}', { section: sectionTitle })}</h3>
      <div className="vj-pack-tray-list">
        {compactItems.map((packItem) => {
          const index = packItems.findIndex((item) => item.pack?.id === packItem.pack?.id);
          return (
            <PackTrayRow
              key={packItem.pack.id}
              packItem={packItem}
              index={index}
              currentPackId={currentPackId}
              t={t}
              onSelectPack={onSelectPack}
              compact
            />
          );
        })}
      </div>
      {hiddenCount > 0 && (
        <button type="button" className="vj-pack-tray-more" onClick={onToggleExpanded}>
          {t('bridgeBuilder.vocabJourney.morePacks', 'More…')}
          <span>{packItems.length}</span>
        </button>
      )}
    </section>
  );
}

export default function VocabJourneyPanel({
  sectionData,
  activePackId,
  languageId: languageIdProp,
  dueReviewCount,
  weakReviewCount,
  onSelectPack,
  onLaunchPackMethod,
  onReview,
  onOpenBrowse,
}) {
  const { t } = useLocalization();
  const { languageId: selectedPracticeLanguageId } = useLanguage();
  const languageId = languageIdProp || selectedPracticeLanguageId || 'hebrew';
  const [previewWordsReady, setPreviewWordsReady] = useState(languageId === 'hebrew');
  const [isPackTrayExpanded, setIsPackTrayExpanded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    if (languageId === 'hebrew') {
      setPreviewWordsReady(true);
      return undefined;
    }

    setPreviewWordsReady(false);
    loadBridgeBuilderWords(languageId)
      .then(() => {
        if (!cancelled) setPreviewWordsReady(true);
      })
      .catch((error) => {
        if (import.meta.env.DEV) {
          console.warn('[vocabJourney] Failed to load preview words for selected language', { languageId, error });
        }
        if (!cancelled) setPreviewWordsReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, [languageId]);

  const currentPackData = useMemo(() => getCurrentJourneyPack(sectionData, activePackId), [sectionData, activePackId]);
  const currentPack = currentPackData?.pack;
  const currentProgress = currentPackData?.progress;
  const localizedPackTitle = currentPack ? t(`packs.${currentPack.id}.title`, currentPack.title) : '';
  const localizedPackDescription = currentPack ? t(`packs.${currentPack.id}.description`, currentPack.description || '') : '';
  const currentCompletion = currentPackData?.completion;

  const selectedSectionItem = useMemo(() => {
    if (!currentPack) return sectionData.find((sectionItem) => sectionItem.unlocked) || sectionData[0] || null;
    return sectionData.find((sectionItem) =>
      (sectionItem.packData || []).some((packItem) => packItem.pack?.id === currentPack.id)
    ) || sectionData.find((sectionItem) => sectionItem.unlocked) || sectionData[0] || null;
  }, [currentPack, sectionData]);

  useEffect(() => {
    setIsPackTrayExpanded(false);
  }, [selectedSectionItem?.section?.id]);

  const journeyStops = useMemo(() => getJourneyStops(sectionData, activePackId), [sectionData, activePackId]);
  const preview = useMemo(() => {
    if (!previewWordsReady) {
      return { words: [], usedFallback: false, missingPackMapping: false };
    }
    return getPackWordPreview(currentPack, languageId);
  }, [currentPack, languageId, previewWordsReady]);
  const displayWords = preview.words;
  const missingPackMapping = preview.missingPackMapping;

  useEffect(() => {
    if (!import.meta.env.DEV) return;
    console.log('[language-debug][VocabJourneyPanel]', {
      route: typeof window !== 'undefined' ? window.location.pathname : 'unknown',
      appLanguage: (window.__LETTER_RIVER_LAST_APP_LANG__ || 'unknown'),
      practiceLanguage: languageId,
      requestedPackLanguage: languageId,
      previewWordsReady,
      resolvedPackId: currentPack?.id ?? null,
      resolvedWordsCount: displayWords.length,
      usedFallbackContent: preview.usedFallback,
      missingPackMapping
    });
  }, [languageId, previewWordsReady, currentPack?.id, displayWords.length, preview.usedFallback, missingPackMapping]);

  const stageInfo = useMemo(() => getPackLearningStage(currentProgress, currentCompletion), [currentProgress, currentCompletion]);
  const localizedStageInfo = useMemo(() => localizeStageInfo(stageInfo, t), [stageInfo, t]);
  const recommendedAction = useMemo(() => getRecommendedJourneyAction(currentProgress, currentCompletion), [currentProgress, currentCompletion]);
  const localizedRecommendedAction = useMemo(() => localizeRecommendedAction(recommendedAction, t), [recommendedAction, t]);
  const journeyStats = useMemo(() => getJourneyStats(sectionData), [sectionData]);
  const [isPackSheetOpen, setIsPackSheetOpen] = useState(false);

  if (!currentPack) {
    return (
      <section className="vj-shell" aria-label={t('bridgeBuilder.vocabJourney.title', 'Vocabulary Journey')}>
        <div className="vj-hero" style={{ backgroundImage: `url(${riverHero})` }}>
          <div className="vj-hero-scrim" />
          <div className="vj-brand-row">
            <div className="vj-brand">
              <span className="vj-logo">🌊</span>
              <span>{t('app.brand.name', 'Letter River')}</span>
            </div>
          </div>
          <div className="vj-hero-copy">
            <h1>{t('bridgeBuilder.vocabJourney.title', 'Vocabulary Journey')}</h1>
            <p>{t('bridgeBuilder.vocabJourney.startPath', 'Start your learning path')}</p>
          </div>
        </div>
        <div className="vj-main-grid" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <p style={{ color: '#666', marginBottom: '1.5rem' }}>{t('bridgeBuilder.vocabJourney.noPacks', 'No packs available yet.')}</p>
          <button type="button" className="vj-main-cta" onClick={onOpenBrowse}>
            <Icon filled>arrow_forward</Icon>
            <span>{t('bridgeBuilder.vocabJourney.allPacks', 'All Packs')}</span>
          </button>
        </div>
      </section>
    );
  }

  const reviewCount = dueReviewCount + weakReviewCount;

  return (
    <section className="vj-shell" aria-label={t('bridgeBuilder.vocabJourney.title', 'Vocabulary Journey')}>
      <div className="vj-hero" style={{ backgroundImage: `url(${riverHero})` }}>
        <div className="vj-hero-scrim" />
        <div className="vj-brand-row">
          <div className="vj-brand">
            <span className="vj-logo">🌊</span>
            <span>{t('app.brand.name', 'Letter River')}</span>
          </div>
          <div className="vj-streak-pill">
            <Icon filled>auto_stories</Icon>
            <span>{journeyStats.completedPacks}</span>
          </div>
        </div>

        <div className="vj-hero-copy">
          <h1>{t('bridgeBuilder.vocabJourney.title', 'Vocabulary Journey')}</h1>
          <p>{t('bridgeBuilder.vocabJourney.currentSectionProgress', '{{section}} · {{percent}}% complete', {
            section: journeyStats.currentSectionTitle,
            percent: journeyStats.overallProgressPct
          })}</p>
        </div>

        <article
          className="vj-current-card vj-current-card--clickable"
          role="button"
          tabIndex={0}
          aria-label={t('bridgeBuilder.vocabJourney.openDetailsFor', 'Open details for {{title}}', { title: localizedPackTitle })}
          onClick={() => setIsPackSheetOpen(true)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              setIsPackSheetOpen(true);
            }
          }}
        >
          <div className="vj-card-copy">
            <span className="vj-badge">{t('bridgeBuilder.vocabJourney.currentPack', 'Current Pack')}</span>
            <h2>{localizedPackTitle}</h2>
            <p className="vj-learn-line">
              <Icon filled>eco</Icon>
              {t('bridgeBuilder.vocabJourney.learnEverydayWords', 'Learn {{count}} everyday words', { count: currentPack.targetsNewCount || currentPack.wordIds?.length || 8 })}
            </p>
            <p className="vj-goal-line">{t('bridgeBuilder.vocabJourney.currentGoal', 'Current goal: {{goal}}', { goal: localizedStageInfo.label })}</p>
            <p className="vj-card-details-hint"><Icon>expand_more</Icon>{t('bridgeBuilder.vocabJourney.tapForPackDetails', 'Tap for pack details')}</p>

            <button
              type="button"
              className="vj-main-cta"
              onClick={(event) => {
                event.stopPropagation();
                onLaunchPackMethod(currentPack, recommendedAction.method);
              }}
            >
              <Icon filled>conversion_path</Icon>
              <span>{localizedRecommendedAction.ctaLabel}</span>
              <Icon>chevron_right</Icon>
            </button>
          </div>

          <img className="vj-cafe-art" src={cafeArt} alt="" loading="lazy" />
        </article>
      </div>

      <div className="vj-main-grid">
        <div className="vj-left-column">
          <button type="button" className="vj-support-row" onClick={onReview} disabled={reviewCount <= 0}>
            <span className="vj-row-icon vj-row-icon--green">
              <Icon filled>event_available</Icon>
            </span>
            <span className="vj-row-text">
              <strong>{t('bridgeBuilder.vocabJourney.todaysReviewWords', 'Today’s Review — {{count}} words', { count: reviewCount })}</strong>
              <small>{reviewCount > 0 ? t('bridgeBuilder.vocabJourney.keepWordsStrong', 'Keep your words strong.') : t('bridgeBuilder.vocabJourney.completePackToUnlockReview', 'Complete a pack to unlock review.')}</small>
            </span>
            <Icon>chevron_right</Icon>
          </button>

          <button type="button" className="vj-support-row vj-support-row--locked">
            <span className="vj-row-icon vj-row-icon--blue">
              <Icon filled>menu_book</Icon>
            </span>
            <span className="vj-row-text">
              <strong>{t('bridgeBuilder.vocabJourney.readInContextTitle', 'Read in Context — Cafe Talk')}</strong>
              <small>{t('bridgeBuilder.vocabJourney.readInContextLockedSubtitle', 'Unlocks after this pack.')}</small>
            </span>
            <Icon>lock</Icon>
          </button>
        </div>

        <aside className="vj-river-path" style={{ backgroundImage: `url(${riverPathMap})` }}>
          <div className="vj-path-overlay">
            {journeyStops.map((stop) => {
              const locked = stop.status === 'Locked';
              const statusLabel = getStopStatusLabel(stop.status, t);
              const isCurrentStop = stop.status === 'Current';
              return (
                <div
                  key={stop.id}
                  className={`vj-path-stop ${isCurrentStop ? 'vj-path-stop--current' : ''} ${locked ? 'vj-path-stop--locked' : ''}`}
                >
                  <button
                    type="button"
                    className="vj-path-stop-action"
                    onClick={() => {
                      if (!locked && stop.representativePackId && onSelectPack) {
                        onSelectPack(stop.representativePackId);
                      }
                    }}
                    disabled={locked}
                  >
                    <span className="vj-path-icon">
                      <Icon filled>{locked ? 'lock' : stop.icon}</Icon>
                    </span>
                    <span className="vj-path-copy">
                      <strong>{t(`bridgeBuilder.sections.${stop.id}.title`, stop.title)}</strong>
                      <small>{statusLabel}</small>
                    </span>
                    {locked
                      ? <Icon>lock</Icon>
                      : stop.status === 'Complete'
                        ? <Icon className="vj-path-check" filled>check_circle</Icon>
                        : <Icon>chevron_right</Icon>}
                  </button>
                  {isCurrentStop && selectedSectionItem?.section?.id === stop.id && !isPackTrayExpanded && (
                    <SectionPackTray
                      sectionItem={selectedSectionItem}
                      currentPackId={currentPack.id}
                      t={t}
                      onSelectPack={onSelectPack}
                      expanded={false}
                      onToggleExpanded={() => setIsPackTrayExpanded(true)}
                    />
                  )}
                </div>
              );
            })}
          </div>
          {isPackTrayExpanded && selectedSectionItem && (
            <SectionPackTray
              sectionItem={selectedSectionItem}
              currentPackId={currentPack.id}
              t={t}
              onSelectPack={onSelectPack}
              expanded
              onToggleExpanded={() => setIsPackTrayExpanded(false)}
            />
          )}
        </aside>
      </div>
      <CurrentPackDetailSheet
        t={t}
        isOpen={isPackSheetOpen}
        onClose={() => setIsPackSheetOpen(false)}
        wordPreview={displayWords}
        missingPackMapping={missingPackMapping}
        languageId={languageId}
        localizedPackTitle={localizedPackTitle}
        localizedPackDescription={localizedPackDescription}
        stage={localizedStageInfo}
        recommendedAction={localizedRecommendedAction}
        reviewCount={reviewCount}
        onLaunchRecommended={() => onLaunchPackMethod(currentPack, recommendedAction.method)}
        onLaunchLoosePlanks={() => onLaunchPackMethod(currentPack, 'loose_planks')}
        onLaunchDeepScript={() => onLaunchPackMethod(currentPack, 'deep_script')}
        onReview={onReview}
      />
    </section>
  );
}
