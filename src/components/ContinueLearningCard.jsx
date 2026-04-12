import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProgress } from '../context/ProgressContext.jsx';
import { useSRS } from '../context/SRSContext.jsx';
import { useGame } from '../context/GameContext.jsx';
import { getRecommendation } from '../lib/progressTerms.js';

/**
 * PATH-01: "Continue Learning" Card
 *
 * A dominant recommendation card for HomeView that tells the user
 * what to do next, based on SRS due items, daily quests, streak, and weak letters.
 */

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

export default function ContinueLearningCard() {
  const { player, streak, daily } = useProgress();
  const { statistics } = useSRS();
  const { openGame, setShowPlayModal } = useGame();
  const navigate = useNavigate();

  const recommendation = useMemo(
    () => getRecommendation(player, statistics, daily, streak),
    [player, statistics, daily, streak]
  );

  function handleAction() {
    switch (recommendation.action) {
      case 'navigate':
        if (recommendation.route) navigate(recommendation.route);
        break;
      case 'open_game':
        openGame({ autostart: false });
        break;
      case 'open_modal':
      default:
        setShowPlayModal(true);
        break;
    }
  }

  return (
    <button
      type="button"
      onClick={handleAction}
      className="btn-press group relative w-full overflow-hidden rounded-2xl p-6 text-left shadow-lg transition-all duration-200 hover:shadow-xl"
      style={{
        background: 'linear-gradient(135deg, var(--app-primary) 0%, var(--app-primary-dark) 100%)',
        color: 'var(--app-on-primary)',
        border: 'none'
      }}
    >
      {/* Decorative circles */}
      <div
        className="absolute -right-6 -top-6 h-28 w-28 rounded-full blur-2xl"
        style={{ background: 'rgba(74, 232, 152, 0.12)' }}
      />
      <div
        className="absolute -left-4 bottom-0 h-20 w-20 rounded-full blur-xl"
        style={{ background: 'rgba(255, 255, 255, 0.06)' }}
      />

      <div className="relative z-10 flex items-center gap-4">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
          style={{ background: 'rgba(255, 255, 255, 0.15)' }}
        >
          <Icon className="text-2xl" filled>{recommendation.icon}</Icon>
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-lg font-extrabold leading-tight">{recommendation.title}</p>
          <p className="mt-0.5 text-sm leading-snug opacity-75">{recommendation.description}</p>
        </div>

        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-transform group-hover:translate-x-0.5"
          style={{ background: 'rgba(255, 255, 255, 0.2)' }}
        >
          <Icon className="text-xl">arrow_forward</Icon>
        </div>
      </div>
    </button>
  );
}
