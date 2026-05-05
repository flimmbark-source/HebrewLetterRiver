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

function WordChips({ words }) {
  return (
    <div className="vj-word-chips" dir="rtl">
      {words.length === 0 ? (
        <div style={{ padding: '8px', color: '#999', fontSize: '0.875rem' }}>Loading words...</div>
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

function ProgressSteps({ steps }) {
  return (
    <div className="vj-progress-steps" aria-label="Pack learning progress">
      {steps.map((step) => (
        <div key={step.id} className="vj-progress-step">
          <span className={`vj-progress-node ${step.complete ? 'vj-progress-node--complete' : ''}`}>
            {step.complete ? (
              <Icon className="vj-progress-check">check</Icon>
            ) : (
              step.label.split(' ')[0][0]
            )}
          </span>
          <span className="vj-progress-label">{step.label}</span>
        </div>
      ))}
    </div>
  );
}

function SheetProgress({ steps }) {
  return (
    <div className="vj-sheet-progress" aria-label="Pack learning progress">
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
  isOpen,
  onClose,
  currentPack,
  wordPreview,
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
        aria-label="Pack details"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="vj-sheet-handle" />
        <div className="vj-sheet-hero">
          <img src={cafeArt} alt="" loading="lazy" />
          <div className="vj-sheet-hero-fade" />
          <button type="button" className="vj-sheet-nav-btn vj-sheet-nav-btn--left" onClick={onClose} aria-label="Close pack details">
            <Icon>arrow_back</Icon>
          </button>
          <button type="button" className="vj-sheet-nav-btn vj-sheet-nav-btn--right" aria-label="Save pack">
            <Icon>bookmark</Icon>
          </button>
        </div>
        <header className="vj-sheet-title-block">
          <h2>{currentPack.title}</h2>
          <p>{currentPack.description || 'Continue learning new words.'}</p>
        </header>

        <WordChips words={wordPreview} />
        <SheetProgress steps={stage.steps} />

        <div className="vj-recommended">
          <h3>Recommended next</h3>
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
          <h3>More ways to learn</h3>
          <button type="button" className="vj-option" onClick={onLaunchLoosePlanks}>
            <span className="vj-option-icon vj-option-icon--teal"><Icon filled>view_stream</Icon></span>
            <span><strong>Strengthen — Loose Planks</strong><small>Reinforce with targeted practice.</small></span>
            <Icon>chevron_right</Icon>
          </button>

          <button type="button" className="vj-option" onClick={onReview} disabled={reviewCount <= 0}>
            <span className="vj-option-icon vj-option-icon--blue"><Icon filled>calendar_month</Icon></span>
            <span><strong>Review — Today’s Review</strong><small>Review words for memory.</small></span>
            <Icon>chevron_right</Icon>
          </button>

          <button type="button" className="vj-option" onClick={onLaunchDeepScript}>
            <span className="vj-option-icon vj-option-icon--purple"><Icon filled>ink_pen</Icon></span>
            <span><strong>Challenge — Deep Script</strong><small>Test depth with writing and recall.</small></span>
            <Icon>chevron_right</Icon>
          </button>

          <button type="button" className="vj-option" disabled>
            <span className="vj-option-icon vj-option-icon--blue"><Icon filled>menu_book</Icon></span>
            <span><strong>Read — Cafe Talk</strong><small>See the words in a real conversation.</small></span>
            <Icon>lock</Icon>
          </button>
        </div>
      </section>
    </div>
  );
}

export default function VocabJourneyPanel({
  sectionData,
  activePackId,
  languageId = 'he',
  dueReviewCount,
  weakReviewCount,
  onSelectPack,
  onLaunchPackMethod,
  onReview,
  onOpenBrowse,
}) {
  // Derive all data from the model
  const currentPackData = useMemo(() => getCurrentJourneyPack(sectionData, activePackId), [sectionData, activePackId]);
  const currentPack = currentPackData?.pack;
  const currentProgress = currentPackData?.progress;
  const currentCompletion = currentPackData?.completion;

  const journeyStops = useMemo(() => getJourneyStops(sectionData, activePackId), [sectionData, activePackId]);
  const displayWords = useMemo(() => getPackWordPreview(currentPack, languageId), [currentPack, languageId]);
  const stageInfo = useMemo(() => getPackLearningStage(currentProgress, currentCompletion), [currentProgress, currentCompletion]);
  const recommendedAction = useMemo(() => getRecommendedJourneyAction(currentProgress, currentCompletion), [currentProgress, currentCompletion]);
  const journeyStats = useMemo(() => getJourneyStats(sectionData), [sectionData]);
  const [isPackSheetOpen, setIsPackSheetOpen] = useState(false);

  if (!currentPack) {
    return (
      <section className="vj-shell" aria-label="Vocabulary Journey">
        <div className="vj-hero" style={{ backgroundImage: `url(${riverHero})` }}>
          <div className="vj-hero-scrim" />
          <div className="vj-brand-row">
            <div className="vj-brand">
              <span className="vj-logo">🌊</span>
              <span>Letter River</span>
            </div>
          </div>
          <div className="vj-hero-copy">
            <h1>Vocabulary Journey</h1>
            <p>Start your learning path</p>
          </div>
        </div>
        <div className="vj-main-grid" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <p style={{ color: '#666', marginBottom: '1.5rem' }}>No packs available yet.</p>
          <button type="button" className="vj-main-cta" onClick={onOpenBrowse}>
            <Icon filled>arrow_forward</Icon>
            <span>All Packs</span>
          </button>
        </div>
      </section>
    );
  }

  const reviewCount = dueReviewCount + weakReviewCount;

  return (
    <section className="vj-shell" aria-label="Vocabulary Journey">
      <div className="vj-hero" style={{ backgroundImage: `url(${riverHero})` }}>
        <div className="vj-hero-scrim" />
        <div className="vj-brand-row">
          <div className="vj-brand">
            <span className="vj-logo">🌊</span>
            <span>Letter River</span>
          </div>
          <div className="vj-streak-pill">
            <Icon filled>auto_stories</Icon>
            <span>{journeyStats.completedPacks}</span>
          </div>
        </div>

        <div className="vj-hero-copy">
          <h1>Vocabulary Journey</h1>
          <p>{journeyStats.currentSectionTitle} · {journeyStats.overallProgressPct}% complete</p>
        </div>

        <article
          className="vj-current-card vj-current-card--clickable"
          role="button"
          tabIndex={0}
          aria-label={`Open details for ${currentPack.title}`}
          onClick={() => setIsPackSheetOpen(true)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              setIsPackSheetOpen(true);
            }
          }}
        >
          <div className="vj-card-copy">
            <span className="vj-badge">Current Pack</span>
            <h2>{currentPack.title}</h2>
            <p className="vj-learn-line">
              <Icon filled>eco</Icon>
              Learn {currentPack.targetsNewCount || currentPack.wordIds?.length || 8} everyday words
            </p>
            <p className="vj-goal-line">Current goal: {stageInfo.label}</p>
            <p className="vj-card-details-hint"><Icon>expand_more</Icon>Tap for pack details</p>

            <button
              type="button"
              className="vj-main-cta"
              onClick={(event) => {
                event.stopPropagation();
                onLaunchPackMethod(currentPack, recommendedAction.method);
              }}
            >
              <Icon filled>conversion_path</Icon>
              <span>{recommendedAction.ctaLabel}</span>
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
              <strong>Today’s Review — {reviewCount} words</strong>
              <small>{reviewCount > 0 ? 'Keep your words strong.' : 'Complete a pack to unlock review.'}</small>
            </span>
            <Icon>chevron_right</Icon>
          </button>

          <button type="button" className="vj-support-row vj-support-row--locked">
            <span className="vj-row-icon vj-row-icon--blue">
              <Icon filled>menu_book</Icon>
            </span>
            <span className="vj-row-text">
              <strong>Read in Context — Cafe Talk</strong>
              <small>Unlocks after this pack.</small>
            </span>
            <Icon>lock</Icon>
          </button>

        </div>

        <aside className="vj-river-path" style={{ backgroundImage: `url(${riverPathMap})` }}>
          <div className="vj-path-overlay">
            {journeyStops.map((stop) => {
              const locked = stop.status === 'Locked';
              const statusLabel = stop.status === 'Open' ? 'Open path' : stop.status;
              return (
                <button
                  key={stop.id}
                  type="button"
                  className={`vj-path-stop ${stop.status === 'Current' ? 'vj-path-stop--current' : ''} ${locked ? 'vj-path-stop--locked' : ''}`}
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
                    <strong>{stop.title}</strong>
                    <small>{statusLabel}</small>
                  </span>
                  {locked
                    ? <Icon>lock</Icon>
                    : stop.status === 'Complete'
                      ? <Icon className="vj-path-check" filled>check_circle</Icon>
                      : <Icon>chevron_right</Icon>}
                </button>
              );
            })}
          </div>
        </aside>
      </div>
      <CurrentPackDetailSheet
        isOpen={isPackSheetOpen}
        onClose={() => setIsPackSheetOpen(false)}
        currentPack={currentPack}
        wordPreview={displayWords}
        stage={stageInfo}
        recommendedAction={recommendedAction}
        reviewCount={reviewCount}
        onLaunchRecommended={() => onLaunchPackMethod(currentPack, recommendedAction.method)}
        onLaunchLoosePlanks={() => onLaunchPackMethod(currentPack, 'loose_planks')}
        onLaunchDeepScript={() => onLaunchPackMethod(currentPack, 'deep_script')}
        onReview={onReview}
      />
    </section>
  );
}
