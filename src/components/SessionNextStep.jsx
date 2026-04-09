import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProgress } from '../context/ProgressContext.jsx';
import { useSRS } from '../context/SRSContext.jsx';
import { useGame } from '../context/GameContext.jsx';
import { getSessionRecommendation } from '../lib/progressTerms.js';

/**
 * PATH-05: End-of-Session Next Step
 *
 * Placed at the bottom of post-game screens. Summarises what improved,
 * highlights what is still weak, and recommends a next action.
 *
 * @param {Object} props
 * @param {Object} props.sessionResults
 * @param {number} props.sessionResults.correctCount
 * @param {number} props.sessionResults.incorrectCount
 * @param {Array}  props.sessionResults.lettersPracticed  - [{ id, symbol, name, correct, incorrect }]
 * @param {Array}  props.sessionResults.lettersImproved   - [{ id, symbol, name }]
 * @param {Array}  props.sessionResults.weakLetters       - [{ id, symbol, name, accuracy }]
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

export default function SessionNextStep({ sessionResults }) {
  const { player, streak, daily } = useProgress();
  const { statistics } = useSRS();
  const { openGame, setShowPlayModal } = useGame();
  const navigate = useNavigate();

  const results = sessionResults ?? {};
  const lettersPracticed = results.lettersPracticed ?? [];
  const lettersImproved = results.lettersImproved ?? [];
  const weakLetters = results.weakLetters ?? [];

  const recommendation = useMemo(
    () => getSessionRecommendation(results, player, statistics, daily, streak),
    [results, player, statistics, daily, streak]
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

  const practicedCount = lettersPracticed.length;
  const improvedCount = lettersImproved.length;

  return (
    <div
      className="rounded-2xl p-4"
      style={{
        background: 'rgba(255, 255, 255, 0.6)',
        border: '2px solid rgba(27, 125, 85, 0.2)'
      }}
    >
      <p className="mb-3 text-sm font-bold" style={{ color: '#4a2208' }}>
        What's Next
      </p>

      {/* Session summary */}
      <div className="mb-3 space-y-1">
        {practicedCount > 0 && (
          <div className="flex items-center gap-2 text-sm" style={{ color: '#6c3b14' }}>
            <Icon className="text-base" style={{ color: '#10B981' }} filled>check_circle</Icon>
            <span>
              {practicedCount} letter{practicedCount === 1 ? '' : 's'} practiced
              {improvedCount > 0 && `, ${improvedCount} improved`}
            </span>
          </div>
        )}
        {weakLetters.length > 0 && (
          <div className="flex items-center gap-2 text-sm" style={{ color: '#6c3b14' }}>
            <Icon className="text-base" style={{ color: '#E57373' }}>error</Icon>
            <span>
              {weakLetters.map(l => l.symbol || l.name || l.id).join(', ')} need{weakLetters.length === 1 ? 's' : ''} more practice
            </span>
          </div>
        )}
      </div>

      {/* Recommended next action */}
      <button
        type="button"
        onClick={handleAction}
        className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left font-bold transition-all active:scale-[0.98]"
        style={{
          background: 'linear-gradient(135deg, #e8ffd8 0%, #7bd74f 100%)',
          color: '#1a5a1a',
          boxShadow: '0 2px 0 #4a9b2f, 0 4px 8px rgba(74, 155, 47, 0.3)',
          border: '1px solid rgba(255, 255, 255, 0.5)'
        }}
      >
        <Icon className="text-xl" filled>{recommendation.icon}</Icon>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold leading-tight">{recommendation.title}</p>
          <p className="text-xs font-medium opacity-70">{recommendation.description}</p>
        </div>
        <Icon className="text-lg">arrow_forward</Icon>
      </button>
    </div>
  );
}
