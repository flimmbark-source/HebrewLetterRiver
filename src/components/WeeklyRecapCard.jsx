import React, { useMemo } from 'react';
import { useProgress } from '../context/ProgressContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { generateWeeklyRecap } from '../lib/weeklyRecapData.js';
import ShareButton from './ShareButton.jsx';

/**
 * WeeklyRecapCard (SHARE-05)
 * Auto-generated summary of the past 7 days. Also serves as a self-reflection tool.
 *
 * @param {Object} [props]
 * @param {Function} [props.onDismiss] - Optional callback to dismiss/hide the card
 */

const LANGUAGE_FLAGS = {
  hebrew: '🇮🇱', english: '🇬🇧', spanish: '🇪🇸', french: '🇫🇷',
  portuguese: '🇧🇷', russian: '🇷🇺', arabic: '🇸🇦', hindi: '🇮🇳',
  bengali: '🇧🇩', mandarin: '🇨🇳', japanese: '🇯🇵', amharic: '🇪🇹',
};

function RecapStat({ icon, label, value, accent }) {
  return (
    <div className="flex items-center gap-3 rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.06)' }}>
      <span className="text-xl">{icon}</span>
      <div className="flex-1">
        <p className="text-xs font-bold text-white/50">{label}</p>
        <p className="text-lg font-extrabold" style={{ color: accent || '#fff' }}>{value}</p>
      </div>
    </div>
  );
}

export default function WeeklyRecapCard({ onDismiss }) {
  const { player, streak } = useProgress();
  const { languageId } = useLanguage();

  const recap = useMemo(() => generateWeeklyRecap(player, streak), [player, streak]);
  const flag = LANGUAGE_FLAGS[languageId] || '🌐';

  const shareData = useMemo(() => ({
    type: 'weekly',
    mode: 'weekly',
    languageId,
    playerName: player?.name,
    playerLevel: player?.level,
    streakCount: recap.streakCurrent,
    weeklyData: recap,
  }), [languageId, player?.name, player?.level, recap]);

  const hasActivity = recap.sessionsThisWeek > 0 || recap.starsEarnedThisWeek > 0;

  return (
    <div
      className="relative overflow-hidden rounded-2xl p-6"
      style={{
        background: 'linear-gradient(145deg, #0d2137 0%, #152d4a 50%, #1a3d5c 100%)',
        border: '1px solid rgba(74, 232, 152, 0.2)',
      }}
    >
      {/* Decorative elements */}
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full"
        style={{ background: 'rgba(74, 232, 152, 0.06)', filter: 'blur(30px)' }}
      />

      {/* Header */}
      <div className="mb-5 flex items-start justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="text-xl">📊</span>
            <h3
              className="text-lg font-extrabold text-white"
              style={{ fontFamily: '"Baloo 2", system-ui, sans-serif' }}
            >
              Weekly Recap
            </h3>
          </div>
          <p className="text-xs font-bold text-white/40">Your progress this week</p>
        </div>
        <div className="flex items-center gap-1.5 rounded-full px-3 py-1" style={{ background: 'rgba(255,255,255,0.08)' }}>
          <span>{flag}</span>
          <span className="text-xs font-bold text-white/60">Lv. {player?.level ?? 1}</span>
        </div>
      </div>

      {/* Stats grid */}
      <div className="mb-5 space-y-2">
        <RecapStat
          icon="🎮"
          label="Sessions Played"
          value={recap.sessionsThisWeek}
          accent="#4ae898"
        />
        <RecapStat
          icon="📝"
          label="Letters Practiced"
          value={recap.lettersImproved}
          accent="#80b3ff"
        />
        <div className="grid grid-cols-2 gap-2">
          <RecapStat
            icon="🔥"
            label="Streak"
            value={recap.streakCurrent > 0 ? `${recap.streakCurrent} days` : 'Build one!'}
            accent="#ff9500"
          />
          <RecapStat
            icon="⭐"
            label="Stars Earned"
            value={recap.starsEarnedThisWeek}
            accent="#ffd700"
          />
        </div>
        {recap.topMode && (
          <RecapStat
            icon="🏆"
            label="Most Played"
            value={recap.topMode}
            accent="#c084fc"
          />
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {hasActivity && (
          <ShareButton data={shareData} surface="weekly_recap" />
        )}
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="rounded-full px-4 py-3 text-xs font-bold text-white/40 transition-colors hover:text-white/60"
          >
            Dismiss
          </button>
        )}
      </div>

      {/* Brand line */}
      <p className="mt-4 text-center text-[10px] font-bold text-white/15">Letter River</p>
    </div>
  );
}
