import React, { useMemo } from 'react';
import { useProgress, STAR_LEVEL_SIZE } from '../context/ProgressContext.jsx';
import { useGame } from '../context/GameContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { getFormattedLanguageName } from '../lib/languageUtils.js';
import { useLocalization } from '../context/LocalizationContext.jsx';
import { bridgeBuilderWords } from '../data/bridgeBuilderWords.js';
import { deepScriptWords } from '../data/deepScript/words.js';
import { languagePacks } from '../data/languages/index.js';
import ProfileEditorModal from '../components/ProfileEditorModal.jsx';
import { DEFAULT_PROFILE_NAME, PROFILE_AVATARS } from '../data/profileAvatars.js';

const topAvatar = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBIzHWOoiXw0a1BU87o2LewTUl8n-_HZC92abDxxI91uQwUGpDDtDgWHkTor7IjvjQUcxU7G-n8vr_x7LsbbX6UCGbzaOGQiMHvD0X0hLDyDkwxenmzAxbV13d80mSxIEbzburnmpLQI0pGLrCNFySYaPuV-i4du-NITzYGpCAUfJ6_xI-xPhTpvL3foKAaOrn9l0TeZ1FkLoJDs6MmFvm0sYR4IaDSqzapogXZiRaJ6Vtk8P5f_5-7mlXebxZLoP1TEu4n2VyOKKDq';
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
  const playerName = player?.name || DEFAULT_PROFILE_NAME;
  const playerAvatar = player?.avatar || PROFILE_AVATARS[0];
  const byMode = player?.totals?.byMode ?? {};
  const gamesByMode = [
    { key: 'letterRiver', label: 'Letter River', count: byMode.letterRiver ?? 0 },
    { key: 'bridgeBuilder', label: 'Bridge Builder', count: byMode.bridgeBuilder ?? 0 },
    { key: 'deepScript', label: 'Deep Script', count: byMode.deepScript ?? 0 }
  ].filter((mode) => mode.count > 0);
  const lettersLearned = useMemo(() => {
    const pack = languagePacks[languageId];
    const itemsById = pack?.itemsById ?? {};
    return Object.keys(player?.letters ?? {})
      .map((letterId) => itemsById[letterId] ?? { id: letterId, symbol: letterId })
      .filter(Boolean);
  }, [languageId, player?.letters]);
  const recentWordsLearned = useMemo(() => {
    const wordLookup = new Map([
      ...bridgeBuilderWords.map((word) => [word.id, { id: word.id, hebrew: word.hebrew, translation: word.translation }]),
      ...deepScriptWords.map((word) => [word.id, { id: word.id, hebrew: word.hebrew, translation: word.english }])
    ]);
    return (player?.learnedWordIds ?? [])
      .map((wordId) => wordLookup.get(wordId))
      .filter(Boolean)
      .slice(-6)
      .reverse();
  }, [player?.learnedWordIds]);

  return (
    <div className="relative min-h-screen bg-[#fef7ff] text-[#1d1a22]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
      <header className="fixed left-0 right-0 top-0 z-40 flex items-center justify-between bg-[#fef7ff]/80 px-6 py-4 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 overflow-hidden rounded-full border-2 border-[#1b6b4f] bg-[#e7e0eb]">
            <img alt="User Profile" src={playerAvatar || topAvatar} className="h-full w-full object-cover" />
          </div>
          <span className="text-lg font-bold tracking-tight text-[#1b6b4f]">Level {level} • {totalStarsEarned.toLocaleString()} XP</span>
        </div>
        <button className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-[#1b6b4f]/10" type="button">
          <Icon className="text-[#1b6b4f]" filled>local_fire_department</Icon>
        </button>
      </header>

      <main className="mx-auto max-w-2xl space-y-8 px-6 pb-48 pt-24">
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
              leading={<div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-white text-2xl shadow-sm">🇮🇱</div>}
              trailing={<div className="flex items-center gap-3"><span className="rounded-full bg-[#1b6b4f]/10 px-3 py-1 text-[10px] font-black text-[#1b6b4f]">ACTIVE</span><Icon className="text-[#6f7973]">swap_horiz</Icon></div>}
            />
          </div>
        </section>

        <section className="grid grid-cols-2 gap-4">
          <div className="space-y-3 rounded-2xl bg-[#f9f1fd] p-6">
            <Icon className="text-3xl text-[#855315]" filled>bolt</Icon>
            <div>
              <h3 className="leading-tight font-bold">Daily Goal</h3>
              <p className="text-sm text-[#4a6365]">15 mins / day</p>
            </div>
          </div>
          <div className="space-y-3 rounded-2xl bg-[#f9f1fd] p-6">
            <Icon className="text-3xl text-[#1b6b4f]" filled>notifications</Icon>
            <div>
              <h3 className="leading-tight font-bold">Reminders</h3>
              <p className="text-sm text-[#4a6365]">8:00 PM Daily</p>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="px-2 text-xl font-bold">Profile Overview</h2>
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-2xl bg-[#f9f1fd] p-4 text-center">
              <p className="text-[10px] font-black uppercase tracking-wider text-[#4a6365]">Games</p>
              <p className="mt-1 text-xl font-extrabold text-[#1b6b4f]">{(player?.totals?.sessions ?? 0).toLocaleString()}</p>
            </div>
            <div className="rounded-2xl bg-[#f9f1fd] p-4 text-center">
              <p className="text-[10px] font-black uppercase tracking-wider text-[#4a6365]">Words</p>
              <p className="mt-1 text-xl font-extrabold text-[#1b6b4f]">{(player?.learnedWordIds?.length ?? 0).toLocaleString()}</p>
            </div>
            <div className="rounded-2xl bg-[#f9f1fd] p-4 text-center">
              <p className="text-[10px] font-black uppercase tracking-wider text-[#4a6365]">Letters</p>
              <p className="mt-1 text-xl font-extrabold text-[#1b6b4f]">{lettersLearned.length.toLocaleString()}</p>
            </div>
          </div>
          <div className="rounded-2xl bg-[#f9f1fd] p-4">
            <p className="text-[10px] font-black uppercase tracking-wider text-[#4a6365]">Games played</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {gamesByMode.length > 0 ? gamesByMode.map((mode) => (
                <span key={mode.key} className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[#1b6b4f]">{mode.label}: {mode.count}</span>
              )) : <span className="text-xs font-semibold text-[#4a6365]">No games played yet.</span>}
            </div>
          </div>
          <div className="rounded-2xl bg-[#f9f1fd] p-4">
            <p className="text-[10px] font-black uppercase tracking-wider text-[#4a6365]">Recent words learned</p>
            <div className="mt-2 space-y-2">
              {recentWordsLearned.length > 0 ? recentWordsLearned.map((word) => (
                <div key={word.id} className="flex items-center justify-between rounded-lg bg-white px-3 py-2">
                  <span className="font-bold text-[#1d1a22]" dir="rtl">{word.hebrew}</span>
                  <span className="text-xs font-semibold text-[#4a6365]">{word.translation}</span>
                </div>
              )) : <span className="text-xs font-semibold text-[#4a6365]">Play Bridge Builder or Deep Script to add words here.</span>}
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
