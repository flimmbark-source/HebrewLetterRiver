import React from 'react';
import ShareButton from './ShareButton.jsx';

/**
 * AchievementShareCard (SHARE-04)
 * Celebratory modal card shown when a badge is earned.
 * The share prompt is optional — user can dismiss without sharing.
 *
 * @param {Object} props
 * @param {string} props.badgeName - Display name of the badge
 * @param {string} [props.badgeTier] - Tier label (e.g., "Bronze", "Silver", "Gold")
 * @param {string} [props.description] - Achievement description
 * @param {string} [props.playerName]
 * @param {number} [props.playerLevel]
 * @param {string} [props.languageId]
 * @param {number} [props.streakCount]
 * @param {Function} props.onDismiss - Callback to close the card
 */

const LANGUAGE_FLAGS = {
  hebrew: '🇮🇱', english: '🇬🇧', spanish: '🇪🇸', french: '🇫🇷',
  portuguese: '🇧🇷', russian: '🇷🇺', arabic: '🇸🇦', hindi: '🇮🇳',
  bengali: '🇧🇩', mandarin: '🇨🇳', japanese: '🇯🇵', amharic: '🇪🇹',
};

const LANGUAGE_NAMES = {
  hebrew: 'Hebrew', english: 'English', spanish: 'Spanish', french: 'French',
  portuguese: 'Portuguese', russian: 'Russian', arabic: 'Arabic', hindi: 'Hindi',
  bengali: 'Bengali', mandarin: 'Mandarin', japanese: 'Japanese', amharic: 'Amharic',
};

const TIER_COLORS = {
  Bronze: { border: '#cd7f32', glow: 'rgba(205, 127, 50, 0.3)' },
  Silver: { border: '#c0c0c0', glow: 'rgba(192, 192, 192, 0.3)' },
  Gold: { border: '#ffd700', glow: 'rgba(255, 215, 0, 0.4)' },
};

export default function AchievementShareCard({
  badgeName,
  badgeTier,
  description,
  playerName,
  playerLevel,
  languageId,
  streakCount,
  onDismiss,
}) {
  const flag = LANGUAGE_FLAGS[languageId] || '🌐';
  const langName = LANGUAGE_NAMES[languageId] || languageId || '';
  const tierStyle = TIER_COLORS[badgeTier] || TIER_COLORS.Gold;
  const streak = streakCount ?? 0;

  const shareData = {
    type: 'achievement',
    mode: 'achievement',
    badgeName,
    playerName,
    playerLevel,
    languageId,
    streakCount: streak,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0, 0, 0, 0.6)' }}>
      <div
        className="relative w-full max-w-sm overflow-hidden rounded-2xl p-6"
        style={{
          background: 'linear-gradient(145deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
          border: `2px solid ${tierStyle.border}`,
          boxShadow: `0 0 30px ${tierStyle.glow}, 0 8px 32px rgba(0, 0, 0, 0.4)`,
        }}
      >
        {/* Sparkle accents */}
        <div className="pointer-events-none absolute left-4 top-4 text-lg" style={{ opacity: 0.5, animation: 'pulse 2s ease-in-out infinite' }}>
          ✦
        </div>
        <div className="pointer-events-none absolute right-6 top-8 text-sm" style={{ opacity: 0.4, animation: 'pulse 2s ease-in-out infinite 0.5s' }}>
          ✧
        </div>
        <div className="pointer-events-none absolute bottom-16 right-4 text-base" style={{ opacity: 0.3, animation: 'pulse 2s ease-in-out infinite 1s' }}>
          ✦
        </div>

        {/* Dismiss button */}
        <button
          type="button"
          onClick={onDismiss}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-white/50 transition-colors hover:bg-white/10 hover:text-white"
          aria-label="Dismiss"
        >
          <span
            className="material-symbols-outlined text-xl"
            style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
          >
            close
          </span>
        </button>

        {/* Trophy icon */}
        <div className="mb-4 flex justify-center">
          <div
            className="flex h-20 w-20 items-center justify-center rounded-full text-4xl"
            style={{
              background: `linear-gradient(135deg, ${tierStyle.border}33, ${tierStyle.border}11)`,
              border: `2px solid ${tierStyle.border}66`,
            }}
          >
            🏆
          </div>
        </div>

        {/* Badge info */}
        <div className="mb-4 text-center">
          {badgeTier && (
            <span
              className="mb-2 inline-block rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest"
              style={{ background: `${tierStyle.border}22`, color: tierStyle.border, border: `1px solid ${tierStyle.border}44` }}
            >
              {badgeTier}
            </span>
          )}
          <h2
            className="text-2xl font-extrabold text-white"
            style={{ fontFamily: '"Baloo 2", system-ui, sans-serif' }}
          >
            {badgeName}
          </h2>
          {description && (
            <p className="mt-1 text-sm text-white/60">{description}</p>
          )}
        </div>

        {/* Player & language info */}
        <div className="mb-5 flex items-center justify-center gap-4 text-xs text-white/50">
          <span className="font-bold">{playerName || 'Player'}</span>
          <span>Lv. {playerLevel ?? 1}</span>
          <span className="flex items-center gap-1">
            <span>{flag}</span> {langName}
          </span>
          {streak > 0 && (
            <span className="font-bold" style={{ color: '#ff9500' }}>
              🔥 {streak}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <ShareButton data={shareData} surface="achievement" />
          <button
            type="button"
            onClick={onDismiss}
            className="w-full rounded-full px-5 py-3 text-center text-sm font-bold text-white/60 transition-colors hover:text-white/80"
          >
            Continue
          </button>
        </div>

        {/* Brand line */}
        <p className="mt-4 text-center text-[10px] font-bold text-white/20">Letter River</p>
      </div>
    </div>
  );
}
