import React from 'react';

/**
 * ShareCard (SHARE-01)
 * A visually appealing card designed for social sharing / screenshots.
 * Renders at ~600x400 responsive with game-themed CSS gradients.
 *
 * @param {Object} props
 * @param {string} props.mode - 'letter_river' | 'bridge_builder' | 'deep_script'
 * @param {number} [props.score]
 * @param {number} [props.accuracy] - 0-100
 * @param {Object} [props.details] - Mode-specific details
 * @param {string} [props.playerName]
 * @param {number} [props.playerLevel]
 * @param {string} [props.languageId]
 * @param {number} [props.streakCount]
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

const MODE_LABELS = {
  letter_river: 'Letter River',
  letterRiver: 'Letter River',
  bridge_builder: 'Bridge Builder',
  bridgeBuilder: 'Bridge Builder',
  deep_script: 'Deep Script',
  deepScript: 'Deep Script',
};

const MODE_GRADIENTS = {
  letter_river: 'linear-gradient(135deg, #0d7346 0%, #145e42 50%, #0b4a33 100%)',
  letterRiver: 'linear-gradient(135deg, #0d7346 0%, #145e42 50%, #0b4a33 100%)',
  bridge_builder: 'linear-gradient(135deg, #5b3a8c 0%, #7c4dbd 50%, #4a2d73 100%)',
  bridgeBuilder: 'linear-gradient(135deg, #5b3a8c 0%, #7c4dbd 50%, #4a2d73 100%)',
  deep_script: 'linear-gradient(135deg, #1a3a5c 0%, #234d78 50%, #142c45 100%)',
  deepScript: 'linear-gradient(135deg, #1a3a5c 0%, #234d78 50%, #142c45 100%)',
};

function StatBubble({ icon, label, value }) {
  return (
    <div
      className="flex flex-col items-center rounded-xl px-3 py-2"
      style={{ background: 'rgba(255, 255, 255, 0.12)' }}
    >
      <span className="text-lg">{icon}</span>
      <span className="text-xl font-extrabold text-white">{value}</span>
      <span className="text-[10px] font-bold uppercase tracking-wider text-white/60">{label}</span>
    </div>
  );
}

function LetterRiverContent({ score, accuracy, details, streakCount }) {
  return (
    <div className="flex flex-wrap justify-center gap-3">
      <StatBubble icon="⭐" label="Score" value={score ?? 0} />
      <StatBubble icon="🎯" label="Accuracy" value={`${accuracy ?? 0}%`} />
      <StatBubble
        icon="📝"
        label="Letters"
        value={details?.lettersLearned ?? details?.totalLetters ?? 0}
      />
      {streakCount > 0 && <StatBubble icon="🔥" label="Streak" value={streakCount} />}
    </div>
  );
}

function BridgeBuilderContent({ details, streakCount }) {
  return (
    <div className="flex flex-wrap justify-center gap-3">
      <StatBubble icon="🧩" label="Words" value={details?.wordsCompleted ?? 0} />
      {details?.packName && <StatBubble icon="📦" label="Pack" value={details.packName} />}
      {streakCount > 0 && <StatBubble icon="🔥" label="Streak" value={streakCount} />}
    </div>
  );
}

function DeepScriptContent({ details, streakCount }) {
  return (
    <div className="flex flex-wrap justify-center gap-3">
      <StatBubble icon="🏰" label="Floors" value={details?.floorsCleared ?? 0} />
      <StatBubble icon="📖" label="Words" value={details?.wordsEncountered ?? 0} />
      {details?.runResult && <StatBubble icon="🏆" label="Result" value={details.runResult} />}
      {streakCount > 0 && <StatBubble icon="🔥" label="Streak" value={streakCount} />}
    </div>
  );
}

export default function ShareCard({
  mode,
  score,
  accuracy,
  details,
  playerName,
  playerLevel,
  languageId,
  streakCount,
}) {
  const flag = LANGUAGE_FLAGS[languageId] || '🌐';
  const langName = LANGUAGE_NAMES[languageId] || languageId || '';
  const modeLabel = MODE_LABELS[mode] || 'Letter River';
  const gradient = MODE_GRADIENTS[mode] || MODE_GRADIENTS.letter_river;

  const isLetterRiver = modeLabel === 'Letter River';
  const isBridgeBuilder = modeLabel === 'Bridge Builder';
  const isDeepScript = modeLabel === 'Deep Script';

  return (
    <div
      className="relative mx-auto w-full max-w-[600px] overflow-hidden rounded-2xl p-6"
      style={{
        background: gradient,
        aspectRatio: '3 / 2',
        minHeight: 280,
      }}
    >
      {/* Decorative blurs */}
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full"
        style={{ background: 'rgba(255, 255, 255, 0.06)', filter: 'blur(40px)' }}
      />
      <div
        className="pointer-events-none absolute -left-12 bottom-0 h-36 w-36 rounded-full"
        style={{ background: 'rgba(74, 232, 152, 0.08)', filter: 'blur(30px)' }}
      />

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col justify-between">
        {/* Top row: branding + language */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-white" style={{ fontFamily: '"Baloo 2", system-ui, sans-serif' }}>
              {modeLabel}
            </h2>
            <p className="mt-0.5 text-xs font-bold text-white/60">Letter River</p>
          </div>
          <div className="flex items-center gap-2 rounded-full px-3 py-1.5" style={{ background: 'rgba(255,255,255,0.12)' }}>
            <span className="text-lg">{flag}</span>
            <span className="text-sm font-bold text-white">{langName}</span>
          </div>
        </div>

        {/* Middle: mode-specific stats */}
        <div className="my-4">
          {isLetterRiver && (
            <LetterRiverContent score={score} accuracy={accuracy} details={details} streakCount={streakCount} />
          )}
          {isBridgeBuilder && (
            <BridgeBuilderContent details={details} streakCount={streakCount} />
          )}
          {isDeepScript && (
            <DeepScriptContent details={details} streakCount={streakCount} />
          )}
        </div>

        {/* Bottom row: player info */}
        <div className="flex items-end justify-between">
          <div className="flex items-center gap-2">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-extrabold text-white"
              style={{ background: 'rgba(255,255,255,0.2)' }}
            >
              {playerLevel ?? 1}
            </div>
            <span className="text-sm font-bold text-white/80">{playerName || 'Player'}</span>
          </div>
          <p className="text-[10px] font-bold text-white/40">letterriver.app</p>
        </div>
      </div>
    </div>
  );
}
