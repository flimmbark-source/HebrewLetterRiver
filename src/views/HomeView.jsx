import React, { useMemo } from 'react';
import { useProgress, STAR_LEVEL_SIZE } from '../context/ProgressContext.jsx';
import { useGame } from '../context/GameContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { getFormattedLanguageName } from '../lib/languageUtils.js';
import { useLocalization } from '../context/LocalizationContext.jsx';
import ProfileEditorModal from '../components/ProfileEditorModal.jsx';
import { DEFAULT_PROFILE_NAME, PROFILE_AVATARS } from '../data/profileAvatars.js';
import { languagePacks } from '../data/languages/index.js';
import { bridgeBuilderWords } from '../data/bridgeBuilderWords.js';
import { getAllSeenWords, getSeenWordsUpdatedEventName } from '../lib/seenWordsStorage.ts';
import { findDictionaryEntryForWord } from '../lib/sentenceDictionaryLookup.ts';

const LANGUAGE_FLAGS = {
  hebrew: '🇮🇱', english: '🇬🇧', spanish: '🇪🇸', french: '🇫🇷',
  portuguese: '🇧🇷', russian: '🇷🇺', arabic: '🇸🇦', hindi: '🇮🇳',
  bengali: '🇧🇩', mandarin: '🇨🇳', japanese: '🇯🇵', amharic: '🇪🇹',
};

const topAvatar = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBIzHWOoiXw0a1BU87o2LewTUl8n-_HZC92abDxxI91uQwUGpDDtDgWHkTor7IjvjQUcxU7G-n8vr_x7LsbbX6UCGbzaOGQiMHvD0X0hLDyDkwxenmzAxbV13d80mSxIEbzburnmpLQI0pGLrCNFySYaPuV-i4du-NITzYGpCAUfJ6_xI-xPhTpvL3foKAaOrn9l0TeZ1FkLoJDs6MmFvm0sYR4IaDSqzapogXZiRaJ6Vtk8P5f_5-7mlXebxZLoP1TEu4n2VyOKKDq';
function formatReminderTime(reminderTime) {
  if (typeof reminderTime !== 'string') return 'Daily';
  const [hoursRaw, minutesRaw] = reminderTime.split(':');
  const hours = Number(hoursRaw);
  const minutes = Number(minutesRaw);

  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return 'Daily';

  const safeDate = new Date(2000, 0, 1, hours, minutes, 0);
  if (Number.isNaN(safeDate.getTime())) return 'Daily';

  return `${safeDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} Daily`;
}

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

function LanguageCard({ id, label, value, onChange, options, leading, trailing }) {
  return (
    <label htmlFor={id} className="card-elevated group relative block rounded-2xl p-6 transition-all duration-200 hover:scale-[1.01]">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          {leading}
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--app-muted)' }}>{label}</p>
            <p className="line-clamp-1-stable text-lg font-bold" style={{ color: 'var(--app-on-surface)' }}>{options.find((option) => option.id === value)?.name ?? value}</p>
          </div>
        </div>
        {trailing}
      </div>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        aria-label={label}
      >
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function HomeView() {
  const { player, starLevelSize, updatePlayerProfile } = useProgress();
  const { setShowPlayModal } = useGame();
  const { languageId, appLanguageId, languageOptions, selectLanguage, selectAppLanguage } = useLanguage();
  const { t } = useLocalization();

  const displayLanguageOptions = useMemo(
    () => languageOptions.map((option) => ({ ...option, name: getFormattedLanguageName(option, t) })),
    [languageOptions, t]
  );

  const starsPerLevel = starLevelSize ?? STAR_LEVEL_SIZE;
  const totalStarsEarned = player.totalStarsEarned ?? player.stars ?? 0;
  const level = player.level ?? Math.floor(totalStarsEarned / starsPerLevel) + 1;
  const levelProgress = player.levelProgress ?? (totalStarsEarned % starsPerLevel);
  const progressPct = starsPerLevel > 0 ? Math.round(Math.min((levelProgress / starsPerLevel) * 100, 100)) : 0;
  const [isProfileEditorOpen, setIsProfileEditorOpen] = React.useState(false);
  const [dailyGoalMinutes, setDailyGoalMinutes] = React.useState(15);
  const [reminderTime, setReminderTime] = React.useState('20:00');
  const [isEditingGoal, setIsEditingGoal] = React.useState(false);
  const [isEditingReminder, setIsEditingReminder] = React.useState(false);
  const [seenWordsVersion, setSeenWordsVersion] = React.useState(0);
  const playerName = player?.name || DEFAULT_PROFILE_NAME;
  const playerAvatar = player?.avatar || PROFILE_AVATARS[0];

  React.useEffect(() => {
    const handleSeenWordsUpdated = () => setSeenWordsVersion((prev) => prev + 1);
    const eventName = getSeenWordsUpdatedEventName();
    window.addEventListener(eventName, handleSeenWordsUpdated);
    return () => {
      window.removeEventListener(eventName, handleSeenWordsUpdated);
    };
  }, []);

  const seenWordEntries = useMemo(
    () => Object.values(getAllSeenWords() ?? {}),
    [seenWordsVersion, player?.totals?.sessions]
  );

  const recentLetters = useMemo(() => {
    const letterIds = Object.keys(player?.letters ?? {});
    const currentPack = languagePacks[languageId];
    const candidateItems = [
      ...(currentPack?.items ?? []),
      ...(currentPack?.allItems ?? []),
      ...(currentPack?.consonants ?? []),
      ...(currentPack?.basicConsonants ?? []),
      ...(currentPack?.finalForms ?? []),
      ...(currentPack?.niqqudWithCarrier ?? []),
      ...(currentPack?.vowels?.syllableBases ?? []),
    ];
    const itemsById = candidateItems.reduce((acc, item) => {
      if (item?.id) acc[item.id] = item;
      return acc;
    }, {});

    return letterIds
      .slice(-5)
      .reverse()
      .map((letterId) => {
        const item = itemsById[letterId];
        return {
          id: letterId,
          symbol: item?.symbol ?? item?.hebrew ?? item?.character ?? item?.glyph ?? letterId,
          name: item?.name ?? letterId
        };
      });
  }, [player?.letters, languageId]);

  const recentWords = useMemo(() => {
    return seenWordEntries
      .sort((a, b) => new Date(b.firstSeenAt).getTime() - new Date(a.firstSeenAt).getTime())
      .slice(0, 5)
      .map((entry) => {
        const dictionaryEntry = findDictionaryEntryForWord(entry.wordId, languageId, appLanguageId, t);

        return {
          id: entry.wordId,
          text: dictionaryEntry.practiceWord
        };
      });
  }, [appLanguageId, languageId, seenWordEntries, t]);

  const modeLabelById = useMemo(() => ({
    letter_river: 'Letter River',
    letterRiver: 'Letter River',
    bridge_builder: 'Bridge Builder',
    bridgeBuilder: 'Bridge Builder',
    loose_planks: 'Loose Planks',
    deep_script: 'Deep Script',
    deepScript: 'Deep Script',
    vocab: 'Vocabulary'
  }), []);

  const recentModes = useMemo(() => {
    const modeIds = (player?.recentModesPlayed ?? player?.modesPlayed ?? []).slice(-12).reverse();
    const labels = modeIds.map((modeId) => {
      const explicitLabel = modeLabelById[modeId];
      if (explicitLabel) return explicitLabel;

      // Letter River practice submodes should display as the parent game name.
      if (
        modeId?.includes('consonants') ||
        modeId?.includes('forms') ||
        modeId?.includes('niqqud') ||
        modeId?.includes('vowel')
      ) {
        return 'Letter River';
      }

      return modeId;
    });

    // Show only one entry per game mode in profile activity.
    return Array.from(new Set(labels));
  }, [player?.modesPlayed, player?.recentModesPlayed, modeLabelById]);

  const totalWordsLearned = seenWordEntries.length;
  const totalWordTarget = bridgeBuilderWords.length;
  const wordProgressPct = totalWordTarget > 0 ? Math.min(Math.round((totalWordsLearned / totalWordTarget) * 100), 100) : 0;

  const modeDisplayByName = useMemo(() => ({
    'Letter River': { icon: 'waves', color: 'var(--app-mode-river)', bg: 'var(--app-mode-river-bg)', surface: 'var(--app-mode-river-surface)', border: 'var(--app-mode-river-bg)' },
    'Bridge Builder': { icon: 'extension', color: 'var(--app-mode-bridge)', bg: 'var(--app-mode-bridge-bg)', surface: 'var(--app-mode-bridge-surface)', border: 'var(--app-mode-bridge-bg)' },
    'Deep Script': { icon: 'explore', color: 'var(--app-mode-deep)', bg: 'var(--app-mode-deep-bg)', surface: 'var(--app-mode-deep-surface)', border: 'var(--app-mode-deep-bg)' },
    'Loose Planks': { icon: 'view_stream', color: 'var(--app-mode-planks)', bg: 'var(--app-mode-planks-bg)', surface: 'var(--app-mode-planks-surface)', border: 'var(--app-mode-planks-bg)' },
    Vocabulary: { icon: 'school', color: 'var(--app-mode-vocab)', bg: 'var(--app-mode-vocab-bg)', surface: 'var(--app-mode-vocab-surface)', border: 'var(--app-mode-vocab-bg)' }
  }), []);

  const recentAchievementXpByGame = useMemo(() => {
    const nowMs = Date.now();
    const recentWindowMs = 14 * 24 * 60 * 60 * 1000;
    const badgeGameById = {
      'bridge-architect': 'Bridge Builder',
      'bridge-perfectionist': 'Bridge Builder',
      'word-collector': 'Bridge Builder',
      'dungeon-delver': 'Deep Script',
      'rune-vanquisher': 'Deep Script',
      'iron-will': 'Deep Script'
    };

    const totals = {};
    const claims = Array.isArray(player?.recentAchievementClaims) ? player.recentAchievementClaims : [];
    claims.forEach((claim) => {
      const claimedAtMs = claim?.claimedAt ? new Date(claim.claimedAt).getTime() : 0;
      if (!claimedAtMs || nowMs - claimedAtMs > recentWindowMs) return;
      const stars = Number.isFinite(claim?.stars) ? claim.stars : 0;
      if (stars <= 0) return;
      const gameName = badgeGameById[claim.badgeId] ?? 'Letter River';
      totals[gameName] = (totals[gameName] ?? 0) + stars;
    });

    return totals;
  }, [player?.recentAchievementClaims]);

  React.useEffect(() => {
    try {
      const saved = localStorage.getItem('homePreferences');
      if (!saved) return;
      const parsed = JSON.parse(saved);
      setDailyGoalMinutes(Math.max(5, Math.min(180, parsed.dailyGoalMinutes ?? 15)));
      setReminderTime(parsed.reminderTime ?? '20:00');
    } catch (error) {
      console.error('Failed to load home preferences', error);
    }
  }, []);

  React.useEffect(() => {
    try {
      localStorage.setItem('homePreferences', JSON.stringify({ dailyGoalMinutes, reminderTime }));
    } catch (error) {
      console.error('Failed to save home preferences', error);
    }
  }, [dailyGoalMinutes, reminderTime]);

  return (
    <div className="relative min-h-screen" style={{ color: 'var(--app-on-surface)' }}>
      <main className="mx-auto max-w-2xl space-y-8 px-6 pb-48 pt-8 stagger-children">
        <section className="animate-fade-in-up">
          <div className="relative overflow-hidden rounded-2xl p-8 text-center shadow-lg" style={{ background: 'linear-gradient(135deg, var(--app-primary) 0%, #145e42 60%, #0f4a34 100%)', color: 'var(--app-on-primary)' }}>
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full blur-3xl" style={{ background: 'rgba(255, 255, 255, 0.08)' }}></div>
            <div className="absolute -left-6 bottom-0 h-28 w-28 rounded-full blur-2xl" style={{ background: 'rgba(74, 232, 152, 0.1)' }}></div>
            <div className="relative z-10 flex flex-col items-center space-y-4">
              <div className="relative flex h-24 w-24 items-center justify-center rounded-full shadow-lg" style={{ background: 'rgba(255, 255, 255, 0.15)', border: '3px solid rgba(255, 255, 255, 0.25)' }}>
                <img alt="Avatar Large" className="h-20 w-20 rounded-full object-cover" src={playerAvatar || topAvatar} />
                <button onClick={() => setIsProfileEditorOpen(true)} className="btn-press absolute bottom-0 right-0 flex items-center justify-center rounded-full border-2 p-2 shadow-lg" style={{ borderColor: 'rgba(255,255,255,0.3)', background: 'var(--app-secondary)', color: '#fff' }} type="button">
                  <Icon className="text-sm">edit</Icon>
                </button>
              </div>
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight">{playerName}</h1>
                <p className="line-clamp-1-stable text-sm opacity-70">Learning since January 2024</p>
              </div>
              <div className="mt-4 w-full space-y-2">
                <div className="flex justify-between text-xs font-bold opacity-80">
                  <span>LEVEL {level}</span>
                  <span>{levelProgress.toLocaleString()} / {starsPerLevel.toLocaleString()} XP</span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full" style={{ background: 'rgba(255, 255, 255, 0.15)' }}>
                  <div className="progress-fill h-full rounded-full" style={{ width: `${progressPct}%`, background: 'linear-gradient(90deg, #4ae898, #80f0b8)' }}></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="px-2 text-xl font-bold" style={{ fontFamily: '"Baloo 2", system-ui, sans-serif' }}>Language Learning</h2>
          <div className="space-y-3">
            <LanguageCard
              id="home-app-language-select"
              label="App Language"
              value={appLanguageId}
              onChange={selectAppLanguage}
              options={displayLanguageOptions}
              leading={<div className="flex h-12 w-12 items-center justify-center rounded-full shadow-sm" style={{ background: 'var(--app-primary-container)' }}><Icon style={{ color: 'var(--app-primary)' }}>language</Icon></div>}
              trailing={<Icon style={{ color: 'var(--app-outline)' }}>expand_more</Icon>}
            />

            <LanguageCard
              id="home-practice-language-select"
              label="I'm Learning"
              value={languageId}
              onChange={selectLanguage}
              options={displayLanguageOptions}
              leading={<div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full text-2xl shadow-sm" style={{ background: 'var(--app-secondary-container)' }}>{LANGUAGE_FLAGS[languageId] ?? '🌐'}</div>}
              trailing={<div className="flex items-center gap-3"><span className="rounded-full px-3 py-1 text-[10px] font-black" style={{ background: 'var(--app-primary-container)', color: 'var(--app-primary)' }}>ACTIVE</span><Icon style={{ color: 'var(--app-outline)' }}>swap_horiz</Icon></div>}
            />
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="px-2 text-xl font-bold" style={{ fontFamily: '"Baloo 2", system-ui, sans-serif' }}>Profile Overview</h2>

          <div className="card-elevated space-y-4 p-5">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold" style={{ color: 'var(--app-muted)' }}>Recent Mastery</p>
                <Icon style={{ color: 'var(--app-outline)' }}>account_circle</Icon>
              </div>
              {recentLetters.length > 0 ? (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {recentLetters.map((letter) => (
                    <div key={letter.id} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg font-bold shadow-sm" style={{ border: '1px solid var(--app-primary-container)', background: 'var(--app-primary-container)', color: 'var(--app-primary)' }} title={letter.name}>
                      {letter.symbol}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="line-clamp-2-stable text-sm" style={{ color: 'var(--app-muted)' }}>Catch a few letters to unlock your mastery row.</p>
              )}
              {recentWords.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {recentWords.map((word) => (
                    <span key={word.id} className="shrink-0 rounded-full px-3 py-1 text-xs font-semibold shadow-sm" style={{ background: 'var(--app-mode-deep-bg)', color: 'var(--app-mode-deep)' }}>
                      {word.text}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <p className="text-sm font-bold" style={{ color: 'var(--app-muted)' }}>Game Activity</p>
              {recentModes.length > 0 ? (
                recentModes.slice(0, 3).map((modeName) => {
                  const modeUi = modeDisplayByName[modeName] ?? { icon: 'sports_esports', color: 'var(--app-primary)', bg: 'var(--app-primary-container)' };
                  return (
                    <div key={modeName} className="flex items-center gap-3 rounded-xl p-3 shadow-sm" style={{ background: modeUi.surface, border: `1px solid ${modeUi.border}` }}>
                      <div className="flex h-9 w-9 items-center justify-center rounded-full shadow-sm" style={{ background: modeUi.bg }}>
                        <Icon className="text-lg" style={{ color: modeUi.color }}>{modeUi.icon}</Icon>
                      </div>
                      <div className="flex flex-1 items-center justify-between">
                        <p className="text-sm font-bold" style={{ color: 'var(--app-on-surface)' }}>{modeName}</p>
                        <span className="text-xs font-bold" style={{ color: modeUi.color }}>
                          +{recentAchievementXpByGame[modeName] ?? 0} XP
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="line-clamp-2-stable text-sm" style={{ color: 'var(--app-muted)' }}>Start a game and your latest activity will appear here.</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-end justify-between">
                <p className="text-sm font-bold" style={{ color: 'var(--app-muted)' }}>Total Progress</p>
                <p className="text-xs font-bold" style={{ color: 'var(--app-primary)' }}>{totalWordsLearned} / {totalWordTarget} Words</p>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full" style={{ background: 'var(--app-mode-river-bg)' }}>
                <div className="progress-fill h-full rounded-full" style={{ width: `${wordProgressPct}%`, background: 'linear-gradient(90deg, var(--app-mode-river), var(--app-mode-vocab))' }}></div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-4">
          <div className="space-y-3 rounded-2xl p-6 shadow-sm" style={{ background: 'var(--app-mode-bridge-surface)', border: '1px solid var(--app-mode-bridge-bg)' }}>
            <div className="flex items-start justify-between gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl shadow-sm" style={{ background: 'var(--app-mode-bridge-bg)' }}><Icon className="text-xl" style={{ color: 'var(--app-mode-bridge)' }} filled>bolt</Icon></div>
              <button type="button" className="btn-press rounded-full p-1" style={{ background: 'rgba(255,255,255,0.5)', color: 'var(--app-mode-bridge)' }} onClick={() => setIsEditingGoal((prev) => !prev)}>
                <Icon className="text-sm">edit</Icon>
              </button>
            </div>
            <div>
              <h3 className="leading-tight font-bold" style={{ color: 'var(--app-on-surface)' }}>Daily Goal</h3>
              {isEditingGoal ? (
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="number"
                    min={5}
                    max={180}
                    value={dailyGoalMinutes}
                    onChange={(event) => setDailyGoalMinutes(Math.max(5, Math.min(180, Number(event.target.value) || 15)))}
                    className="w-20 rounded-lg px-2 py-1 text-sm font-semibold"
                    style={{ border: '1px solid var(--app-mode-bridge-bg)', background: 'rgba(255,255,255,0.7)', color: 'var(--app-on-surface)' }}
                  />
                  <span className="text-xs font-semibold" style={{ color: 'var(--app-mode-bridge)' }}>mins/day</span>
                </div>
              ) : (
                <p className="line-clamp-1-stable text-sm font-semibold" style={{ color: 'var(--app-mode-bridge)' }}>{dailyGoalMinutes} mins / day</p>
              )}
            </div>
          </div>
          <div className="space-y-3 rounded-2xl p-6 shadow-sm" style={{ background: 'var(--app-mode-river-surface)', border: '1px solid var(--app-mode-river-bg)' }}>
            <div className="flex items-start justify-between gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl shadow-sm" style={{ background: 'var(--app-mode-river-bg)' }}><Icon className="text-xl" style={{ color: 'var(--app-mode-river)' }} filled>notifications</Icon></div>
              <button type="button" className="btn-press rounded-full p-1" style={{ background: 'rgba(255,255,255,0.5)', color: 'var(--app-mode-river)' }} onClick={() => setIsEditingReminder((prev) => !prev)}>
                <Icon className="text-sm">edit</Icon>
              </button>
            </div>
            <div>
              <h3 className="leading-tight font-bold" style={{ color: 'var(--app-on-surface)' }}>Reminders</h3>
              {isEditingReminder ? (
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="time"
                    value={reminderTime}
                    onChange={(event) => setReminderTime(event.target.value)}
                    className="rounded-lg px-2 py-1 text-sm font-semibold"
                    style={{ border: '1px solid var(--app-mode-river-bg)', background: 'rgba(255,255,255,0.7)', color: 'var(--app-on-surface)' }}
                  />
                </div>
              ) : (
                <p className="line-clamp-1-stable text-sm font-semibold" style={{ color: 'var(--app-mode-river)' }}>
                  {formatReminderTime(reminderTime)}
                </p>
              )}
            </div>
          </div>
        </section>

        <section className="pt-4">
          <button
            onClick={() => setShowPlayModal(true)}
            className="btn-cta flex w-full items-center justify-center gap-3 py-5 text-lg"
            type="button"
          >
            Start learning
            <Icon>arrow_forward</Icon>
          </button>
          <p className="mt-6 px-8 text-center text-xs leading-relaxed" style={{ color: 'var(--app-muted)' }}>
            Your progress is automatically synced with your cloud account.
            {' '}
            <a className="font-bold underline underline-offset-4" style={{ color: 'var(--app-primary)' }} href="#">Privacy Policy</a>
          </p>
        </section>
      </main>
      <ProfileEditorModal
        isOpen={isProfileEditorOpen}
        initialName={playerName}
        initialAvatar={playerAvatar}
        onClose={() => setIsProfileEditorOpen(false)}
        onSave={(profile) => {
          updatePlayerProfile(profile);
          setIsProfileEditorOpen(false);
        }}
      />
    </div>
  );
}
