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
    <label htmlFor={id} className="group relative block rounded-full bg-[#f9f1fd] p-6 transition-colors hover:bg-[#ede6f1]">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          {leading}
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-[#4a6365]">{label}</p>
            <p className="text-lg font-bold">{options.find((option) => option.id === value)?.name ?? value}</p>
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
  const { player, badges, starLevelSize, updatePlayerProfile } = useProgress();
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

  const recentModes = useMemo(
    () => (player?.recentModesPlayed ?? player?.modesPlayed ?? []).slice(-4).reverse().map((modeId) => {
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
    }),
    [player?.modesPlayed, player?.recentModesPlayed, modeLabelById]
  );

  const totalWordsLearned = seenWordEntries.length;
  const totalWordTarget = bridgeBuilderWords.length;
  const wordProgressPct = totalWordTarget > 0 ? Math.min(Math.round((totalWordsLearned / totalWordTarget) * 100), 100) : 0;

  const modeDisplayByName = useMemo(() => ({
    'Letter River': { icon: 'water', iconClass: 'text-[#1b6b4f]', bgClass: 'bg-[#1b6b4f]/10', badgeClass: 'text-[#1b6b4f]' },
    'Bridge Builder': { icon: 'conversion_path', iconClass: 'text-[#855315]', bgClass: 'bg-[#855315]/10', badgeClass: 'text-[#855315]' },
    'Deep Script': { icon: 'ink_pen', iconClass: 'text-[#5b4b8a]', bgClass: 'bg-[#5b4b8a]/10', badgeClass: 'text-[#5b4b8a]' },
    'Loose Planks': { icon: 'view_stream', iconClass: 'text-[#3f5b96]', bgClass: 'bg-[#3f5b96]/10', badgeClass: 'text-[#3f5b96]' },
    Vocabulary: { icon: 'school', iconClass: 'text-[#1f6f8b]', bgClass: 'bg-[#1f6f8b]/10', badgeClass: 'text-[#1f6f8b]' }
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

    Object.entries(badges ?? {}).forEach(([badgeId, state]) => {
      const gameName = badgeGameById[badgeId] ?? 'Letter River';
      const unclaimedRewards = Array.isArray(state?.unclaimed) ? state.unclaimed : [];

      unclaimedRewards.forEach((reward) => {
        const earnedAtMs = reward?.earnedAt ? new Date(reward.earnedAt).getTime() : 0;
        if (!earnedAtMs || nowMs - earnedAtMs > recentWindowMs) return;

        totals[gameName] = (totals[gameName] ?? 0) + (reward?.stars ?? 0);
      });
    });

    return totals;
  }, [badges]);

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
    <div className="relative min-h-screen bg-[#fef7ff] text-[#1d1a22]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
      <main className="mx-auto max-w-2xl space-y-8 px-6 pb-48 pt-8">
        <section>
          <div className="flex flex-col items-center space-y-4 rounded-2xl border border-[#1b6b4f]/5 bg-white p-8 text-center shadow-sm">
            <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-[#f9f1fd]">
              <img alt="Avatar Large" className="h-20 w-20 rounded-full object-cover" src={playerAvatar || topAvatar} />
              <button onClick={() => setIsProfileEditorOpen(true)} className="absolute bottom-0 right-0 flex items-center justify-center rounded-full border-2 border-white bg-[#1b6b4f] p-2 text-white shadow-lg" type="button">
                <Icon className="text-sm">edit</Icon>
              </button>
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">{playerName}</h1>
              <p className="text-sm text-[#4a6365]">Learning since January 2024</p>
            </div>
            <div className="mt-4 w-full space-y-2">
              <div className="flex justify-between text-xs font-bold text-[#1b6b4f]">
                <span>LEVEL {level}</span>
                <span>{levelProgress.toLocaleString()} / {starsPerLevel.toLocaleString()} XP</span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-[#a7f3d0]">
                <div className="h-full rounded-full bg-[#1b6b4f]" style={{ width: `${progressPct}%` }}></div>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="px-2 text-xl font-bold">Language Learning</h2>
          <div className="space-y-4">
            <LanguageCard
              id="home-app-language-select"
              label="App Language"
              value={appLanguageId}
              onChange={selectAppLanguage}
              options={displayLanguageOptions}
              leading={<div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm"><Icon className="text-[#1b6b4f]">language</Icon></div>}
              trailing={<Icon className="text-[#6f7973]">expand_more</Icon>}
            />

            <LanguageCard
              id="home-practice-language-select"
              label="I'm Learning"
              value={languageId}
              onChange={selectLanguage}
              options={displayLanguageOptions}
              leading={<div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-white text-2xl shadow-sm">{LANGUAGE_FLAGS[languageId] ?? '🌐'}</div>}
              trailing={<div className="flex items-center gap-3"><span className="rounded-full bg-[#1b6b4f]/10 px-3 py-1 text-[10px] font-black text-[#1b6b4f]">ACTIVE</span><Icon className="text-[#6f7973]">swap_horiz</Icon></div>}
            />
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="px-2 text-xl font-bold">Profile Overview</h2>

          <div className="space-y-4 rounded-2xl bg-[#f9f1fd] p-5">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-[#4a6365]">Recent Mastery</p>
                <Icon className="text-[#6f7973]">account_circle</Icon>
              </div>
              {recentLetters.length > 0 ? (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {recentLetters.map((letter) => (
                    <div key={letter.id} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#bec9c2]/40 bg-[#ede6f1] text-lg font-bold text-[#1b6b4f] shadow-sm" title={letter.name}>
                      {letter.symbol}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[#4a6365]">Catch a few letters to unlock your mastery row.</p>
              )}
              {recentWords.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {recentWords.map((word) => (
                    <span key={word.id} className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#1d1a22] shadow-sm">
                      {word.text}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <p className="text-sm font-bold text-[#4a6365]">Game Activity</p>
              {recentModes.length > 0 ? (
                recentModes.slice(0, 3).map((modeName, index) => {
                  const modeUi = modeDisplayByName[modeName] ?? { icon: 'sports_esports', iconClass: 'text-[#1b6b4f]', bgClass: 'bg-[#1b6b4f]/10', badgeClass: 'text-[#1b6b4f]' };
                  return (
                    <div key={`${modeName}-${index}`} className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm">
                      <div className={`flex h-9 w-9 items-center justify-center rounded-full ${modeUi.bgClass}`}>
                        <Icon className={`text-lg ${modeUi.iconClass}`}>{modeUi.icon}</Icon>
                      </div>
                      <div className="flex flex-1 items-center justify-between">
                        <p className="text-sm font-bold">{modeName}</p>
                        <span className={`text-xs font-bold ${modeUi.badgeClass}`}>
                          +{recentAchievementXpByGame[modeName] ?? 0} XP
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-[#4a6365]">Start a game and your latest activity will appear here.</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-end justify-between">
                <p className="text-sm font-bold text-[#4a6365]">Total Progress</p>
                <p className="text-xs font-bold text-[#1b6b4f]">{totalWordsLearned} / {totalWordTarget} Words</p>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-white">
                <div className="h-full rounded-full bg-[#1b6b4f]" style={{ width: `${wordProgressPct}%` }}></div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-4">
          <div className="space-y-3 rounded-2xl bg-[#f9f1fd] p-6">
            <div className="flex items-start justify-between gap-2">
              <Icon className="text-3xl text-[#855315]" filled>bolt</Icon>
              <button type="button" className="rounded-full bg-white/70 p-1 text-[#6f7973]" onClick={() => setIsEditingGoal((prev) => !prev)}>
                <Icon className="text-sm">edit</Icon>
              </button>
            </div>
            <div>
              <h3 className="leading-tight font-bold">Daily Goal</h3>
              {isEditingGoal ? (
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="number"
                    min={5}
                    max={180}
                    value={dailyGoalMinutes}
                    onChange={(event) => setDailyGoalMinutes(Math.max(5, Math.min(180, Number(event.target.value) || 15)))}
                    className="w-20 rounded-lg border border-[#bec9c2] bg-white px-2 py-1 text-sm font-semibold text-[#1d1a22]"
                  />
                  <span className="text-xs font-semibold text-[#4a6365]">mins/day</span>
                </div>
              ) : (
                <p className="text-sm text-[#4a6365]">{dailyGoalMinutes} mins / day</p>
              )}
            </div>
          </div>
          <div className="space-y-3 rounded-2xl bg-[#f9f1fd] p-6">
            <div className="flex items-start justify-between gap-2">
              <Icon className="text-3xl text-[#1b6b4f]" filled>notifications</Icon>
              <button type="button" className="rounded-full bg-white/70 p-1 text-[#6f7973]" onClick={() => setIsEditingReminder((prev) => !prev)}>
                <Icon className="text-sm">edit</Icon>
              </button>
            </div>
            <div>
              <h3 className="leading-tight font-bold">Reminders</h3>
              {isEditingReminder ? (
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="time"
                    value={reminderTime}
                    onChange={(event) => setReminderTime(event.target.value)}
                    className="rounded-lg border border-[#bec9c2] bg-white px-2 py-1 text-sm font-semibold text-[#1d1a22]"
                  />
                </div>
              ) : (
                <p className="text-sm text-[#4a6365]">
                  {formatReminderTime(reminderTime)}
                </p>
              )}
            </div>
          </div>
        </section>

        <section className="pt-4">
          <button
            onClick={() => setShowPlayModal(true)}
            className="flex w-full items-center justify-center gap-3 rounded-full bg-gradient-to-br from-[#1b6b4f] to-[#1b6b4f]/80 py-5 text-lg font-bold text-white shadow-lg shadow-[#1b6b4f]/20 transition-all hover:scale-[1.02] active:scale-95"
            type="button"
          >
            Start learning
            <Icon>arrow_forward</Icon>
          </button>
          <p className="mt-6 px-8 text-center text-xs leading-relaxed text-[#4a6365]">
            Your progress is automatically synced with your cloud account.
            {' '}
            <a className="font-bold text-[#1b6b4f] underline underline-offset-4" href="#">Privacy Policy</a>
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
