import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProgress } from '../context/ProgressContext.jsx';
import { useSRS } from '../context/SRSContext.jsx';
import { useGame } from '../context/GameContext.jsx';
import { PROGRESS_TERMS, getStageForUser } from '../lib/progressTerms.js';

/**
 * PATH-02: Journey Map
 *
 * A compact vertical path showing learning progression stages:
 * Letters -> Words -> Reading -> Conversation
 */

const STAGE_ORDER = ['letters', 'words', 'reading', 'conversation'];

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

export default function JourneyMap() {
  const { player } = useProgress();
  const { statistics } = useSRS();
  const { openGame, setShowPlayModal } = useGame();
  const navigate = useNavigate();

  const currentStage = useMemo(
    () => getStageForUser(player, statistics),
    [player, statistics]
  );

  const currentIndex = STAGE_ORDER.indexOf(currentStage);

  function handleStageClick(stageKey) {
    switch (stageKey) {
      case 'letters':
        openGame({ autostart: false });
        break;
      case 'words':
        navigate('/bridge');
        break;
      case 'reading':
        navigate('/read');
        break;
      case 'conversation':
        navigate('/read');
        break;
      default:
        setShowPlayModal(true);
    }
  }

  return (
    <div className="card-elevated p-5">
      <p className="mb-4 text-sm font-bold" style={{ color: 'var(--app-muted)' }}>Learning Journey</p>

      <div className="relative flex flex-col gap-0">
        {STAGE_ORDER.map((stageKey, index) => {
          const stage = PROGRESS_TERMS.stages[stageKey];
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isFuture = index > currentIndex;

          // Colors
          let nodeColor = 'var(--app-muted)';
          let nodeBg = 'transparent';
          let textColor = 'var(--app-muted)';
          if (isCompleted) {
            nodeColor = '#D4A017';
            nodeBg = 'rgba(212, 160, 23, 0.12)';
            textColor = 'var(--app-on-surface)';
          } else if (isCurrent) {
            nodeColor = 'var(--app-primary)';
            nodeBg = 'var(--app-primary-container)';
            textColor = 'var(--app-on-surface)';
          }

          return (
            <div key={stageKey} className="relative flex items-stretch">
              {/* Vertical line connector */}
              <div className="relative flex flex-col items-center" style={{ width: 36 }}>
                {/* Line above (not for first) */}
                {index > 0 && (
                  <div
                    className="w-0.5 flex-1"
                    style={{
                      background: index <= currentIndex
                        ? 'var(--app-primary)'
                        : 'var(--app-muted)',
                      opacity: index <= currentIndex ? 0.6 : 0.2
                    }}
                  />
                )}
                {index === 0 && <div className="flex-1" />}

                {/* Node circle */}
                <button
                  type="button"
                  className="btn-press relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all"
                  style={{
                    background: nodeBg,
                    border: `2px solid ${nodeColor}`,
                    opacity: isFuture ? 0.5 : 1
                  }}
                  onClick={() => handleStageClick(stageKey)}
                  aria-label={`${stage.label}${isCurrent ? ' (current)' : ''}${isCompleted ? ' (completed)' : ''}`}
                >
                  {isCompleted ? (
                    <Icon className="text-base" filled style={{ color: nodeColor }}>check</Icon>
                  ) : (
                    <Icon className="text-base" filled={isCurrent} style={{ color: nodeColor }}>{stage.icon}</Icon>
                  )}
                </button>

                {/* Line below (not for last) */}
                {index < STAGE_ORDER.length - 1 && (
                  <div
                    className="w-0.5 flex-1"
                    style={{
                      background: index < currentIndex
                        ? 'var(--app-primary)'
                        : 'var(--app-muted)',
                      opacity: index < currentIndex ? 0.6 : 0.2,
                      minHeight: 8
                    }}
                  />
                )}
                {index === STAGE_ORDER.length - 1 && <div className="flex-1" />}
              </div>

              {/* Label */}
              <button
                type="button"
                className="btn-press flex min-h-[48px] flex-1 items-center rounded-xl px-3 py-2 text-left transition-all hover:bg-black/[0.03]"
                onClick={() => handleStageClick(stageKey)}
              >
                <div className="min-w-0">
                  <p
                    className="text-sm font-bold leading-tight"
                    style={{ color: textColor }}
                  >
                    {stage.label}
                    {isCurrent && (
                      <span
                        className="ml-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-black uppercase"
                        style={{
                          background: 'var(--app-primary-container)',
                          color: 'var(--app-primary)'
                        }}
                      >
                        Current
                      </span>
                    )}
                  </p>
                </div>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
