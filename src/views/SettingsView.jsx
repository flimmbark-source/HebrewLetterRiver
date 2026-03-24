import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocalization } from '../context/LocalizationContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useProgress, STAR_LEVEL_SIZE } from '../context/ProgressContext.jsx';
import { getFormattedLanguageName } from '../lib/languageUtils.js';

const settingsAvatar = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDUjBvQAnHlZBktrT9o1W3YJUpW42Dva-kXRxJ36vz9skzw42LyTlGdmdnqDsNY-wYCeEDTDpl-jJdXbgMy6C_SSnUVdNfzsuPwS_o1ErMYKXeTWpZupeNxNKb4qeTbgc2Y4Xw8cXVuaU7HMVKBfeYDB2vehJLu2laKpGjx14gjcCdSRmMzkdbqlmIsFfw6zQ-up1LViUOct0bGeXOQjQ6CvJBc2bKowsO61lic47tlxkLQtzAzX7BuqQv1uCxs2EXNNhNzWvmNH055';

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

function Toggle({ id, label, icon, checked, onChange }) {
  return (
    <label htmlFor={id} className="group flex cursor-pointer items-center justify-between">
      <div className="flex items-center gap-4">
        <Icon className="text-[#4a6365] transition-colors group-hover:text-[#1b6b4f]">{icon}</Icon>
        <span className="font-semibold text-[#1d1a22]">{label}</span>
      </div>
      <div className="relative inline-flex items-center">
        <input id={id} type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="peer sr-only" />
        <div className="h-6 w-11 rounded-full bg-[#e7e0eb] transition peer-checked:bg-[#1b6b4f] after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition peer-checked:after:translate-x-full"></div>
      </div>
    </label>
  );
}

export default function SettingsView() {
  const navigate = useNavigate();
  const { t } = useLocalization();
  const { player, starLevelSize } = useProgress();
  const { languageId, selectLanguage, appLanguageId, selectAppLanguage, languageOptions } = useLanguage();

  const [showIntroductions, setShowIntroductions] = useState(true);
  const [highContrast, setHighContrast] = useState(false);
  const [randomLetters, setRandomLetters] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [gameFont, setGameFont] = useState('default');
  const [fontShuffle, setFontShuffle] = useState(false);
  const [slowRiver, setSlowRiver] = useState(false);
  const [clickMode, setClickMode] = useState(false);
  const [associationMode, setAssociationMode] = useState(false);
  const [startingLetters, setStartingLetters] = useState(2);
  const [hasLoadedSettings, setHasLoadedSettings] = useState(false);

  useEffect(() => {
    const loadSettings = () => {
      try {
        const saved = localStorage.getItem('gameSettings');
        if (saved) {
          const settings = JSON.parse(saved);
          setShowIntroductions(settings.showIntroductions ?? true);
          setHighContrast(settings.highContrast ?? false);
          setRandomLetters(settings.randomLetters ?? false);
          setReducedMotion(settings.reducedMotion ?? false);
          const savedFont = settings.gameFont === 'opendyslexic' ? 'lexend' : (settings.gameFont ?? 'default');
          setGameFont(savedFont);
          setFontShuffle(settings.fontShuffle ?? false);
          setSlowRiver(settings.slowRiver ?? false);
          setClickMode(settings.clickMode ?? false);
          setAssociationMode(settings.associationMode ?? false);
          setStartingLetters(Math.min(10, Math.max(1, settings.startingLetters ?? 2)));
        }
        setHasLoadedSettings(true);
      } catch (e) {
        console.error('Failed to load game settings', e);
      }
    };

    loadSettings();
    window.addEventListener('gameSettingsChanged', loadSettings);
    return () => window.removeEventListener('gameSettingsChanged', loadSettings);
  }, []);

  useEffect(() => {
    if (!hasLoadedSettings) return;
    try {
      const settings = {
        showIntroductions,
        highContrast,
        randomLetters,
        reducedMotion,
        gameFont,
        fontShuffle,
        slowRiver,
        clickMode,
        associationMode,
        startingLetters
      };
      localStorage.setItem('gameSettings', JSON.stringify(settings));
      window.dispatchEvent(new Event('gameSettingsChanged'));
      if (highContrast) document.body.classList.add('high-contrast');
      else document.body.classList.remove('high-contrast');
    } catch (e) {
      console.error('Failed to save game settings', e);
    }
  }, [hasLoadedSettings, showIntroductions, highContrast, randomLetters, reducedMotion, gameFont, fontShuffle, slowRiver, clickMode, associationMode, startingLetters]);

  const starsPerLevel = starLevelSize ?? STAR_LEVEL_SIZE;
  const totalStarsEarned = player.totalStarsEarned ?? player.stars ?? 0;
  const level = player.level ?? Math.floor(totalStarsEarned / starsPerLevel) + 1;
  const levelProgress = player.levelProgress ?? (totalStarsEarned % starsPerLevel);
  const progressPct = starsPerLevel > 0 ? Math.round(Math.min((levelProgress / starsPerLevel) * 100, 100)) : 0;

  const fontOptions = [
    { value: 'default', label: 'Default' },
    { value: 'lexend', label: 'Lexend / Noto Sans' },
    { value: 'comic-sans', label: 'Comic Sans' },
    { value: 'arial', label: 'Arial' },
    { value: 'verdana', label: 'Verdana' }
  ];

  const displayLanguageOptions = useMemo(
    () => languageOptions.map((option) => ({ ...option, name: getFormattedLanguageName(option, t) })),
    [languageOptions, t]
  );

  return (
    <div className="min-h-screen bg-[#fef7ff] pb-36 text-[#1d1a22]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
      <header className="fixed left-0 right-0 top-0 z-40 flex h-16 items-center justify-between bg-[#fef7ff]/80 px-6 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <button className="text-[#1b6b4f] transition hover:opacity-80 active:scale-95" onClick={() => navigate('/')} type="button" aria-label="Back to Home">
            <Icon>arrow_back</Icon>
          </button>
          <h1 className="text-lg font-bold text-[#1b6b4f]">Settings</h1>
        </div>
        <div className="w-10"></div>
      </header>

      <main className="mx-auto max-w-2xl space-y-8 px-6 pt-20">
        <section className="relative flex items-center gap-6 overflow-hidden rounded-xl bg-[#f9f1fd] p-6">
          <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-[#1b6b4f]/10 blur-2xl"></div>
          <div className="relative">
            <div className="h-20 w-20 overflow-hidden rounded-full border-4 border-white shadow-lg">
              <img src={settingsAvatar} alt="Profile avatar" className="h-full w-full object-cover" />
            </div>
            <div className="absolute -bottom-1 -right-1 rounded-full bg-[#855315] px-2 py-0.5 text-[10px] font-bold text-white shadow-md">LVL {level}</div>
          </div>
          <div className="flex-1 space-y-2">
            <h2 className="text-2xl font-extrabold tracking-tight">Alex River</h2>
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold text-[#4a6365]">
                <span>Progress</span>
                <span>{levelProgress.toLocaleString()} / {starsPerLevel.toLocaleString()} XP</span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-[#a7f3d0]">
                <div className="h-full rounded-full bg-[#1b6b4f]" style={{ width: `${progressPct}%` }}></div>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="px-2 text-sm font-bold uppercase tracking-widest text-[#4a6365]">Language Preferences</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-xl bg-white p-5 shadow-sm">
              <label htmlFor="settings-app-language-select" className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Icon className="text-[#1b6b4f]">language</Icon>
                  <div>
                    <p className="text-xs font-medium text-[#4a6365]">App Language</p>
                    <p className="font-bold">{displayLanguageOptions.find((option) => option.id === appLanguageId)?.name}</p>
                  </div>
                </div>
                <Icon className="text-[#bec9c2]">expand_more</Icon>
              </label>
              <select id="settings-app-language-select" value={appLanguageId} onChange={(event) => selectAppLanguage(event.target.value)} className="mt-3 w-full rounded-lg border border-[#bec9c2]/60 bg-white px-3 py-2 text-sm font-semibold text-[#1d1a22]">
                {displayLanguageOptions.map((option) => (
                  <option key={option.id} value={option.id}>{option.name}</option>
                ))}
              </select>
            </div>

            <div className="rounded-xl bg-white p-5 shadow-sm">
              <label htmlFor="settings-practice-language-select" className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-6 w-8 items-center justify-center overflow-hidden rounded border border-[#bec9c2]/20 bg-slate-100 text-xs font-bold">IL</div>
                  <div>
                    <p className="text-xs font-medium text-[#4a6365]">I'm Learning</p>
                    <p className="font-bold">{displayLanguageOptions.find((option) => option.id === languageId)?.name}</p>
                  </div>
                </div>
                <span className="rounded-md bg-[#1b6b4f] px-2 py-1 text-[10px] font-black text-white">ACTIVE</span>
              </label>
              <select id="settings-practice-language-select" value={languageId} onChange={(event) => selectLanguage(event.target.value)} className="mt-3 w-full rounded-lg border border-[#bec9c2]/60 bg-white px-3 py-2 text-sm font-semibold text-[#1d1a22]">
                {displayLanguageOptions.map((option) => (
                  <option key={option.id} value={option.id}>{option.name}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="px-2 text-sm font-bold uppercase tracking-widest text-[#4a6365]">Game Settings</h3>
          <div className="overflow-hidden rounded-xl bg-white shadow-sm">
            <div className="divide-y divide-[#bec9c2]/20">
              <div className="flex items-center justify-between p-4 hover:bg-[#f9f1fd]">
                <div className="flex items-center gap-4">
                  <Icon className="text-[#4a6365]">text_fields</Icon>
                  <span className="font-semibold">Game Font</span>
                </div>
                <select id="settings-font-select" value={gameFont} onChange={(event) => setGameFont(event.target.value)} className="rounded-md border border-[#bec9c2]/50 px-2 py-1 font-bold text-[#1b6b4f]">
                  {fontOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-between p-4 hover:bg-[#f9f1fd]">
                <div className="flex items-center gap-4">
                  <Icon className="text-[#4a6365]">format_list_numbered</Icon>
                  <span className="font-semibold">Starting Letters</span>
                </div>
                <select id="settings-starting-letters-select" value={startingLetters} onChange={(event) => setStartingLetters(parseInt(event.target.value, 10))} className="rounded-md border border-[#bec9c2]/50 pl-2 pr-8 py-1 font-bold text-[#1b6b4f]">
                  {Array.from({ length: 10 }, (_, index) => index + 1).map((value) => (
                    <option key={value} value={value}>{value}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-6 p-4">
              <label htmlFor="settings-toggle-introductions" className="flex cursor-pointer items-center justify-between">
                <div className="flex items-center gap-4">
                  <Icon className="text-[#4a6365]">info</Icon>
                  <span className="font-semibold">{t('game.accessibility.showIntroductions')}</span>
                </div>
                <input id="settings-toggle-introductions" type="checkbox" checked={showIntroductions} onChange={(event) => setShowIntroductions(event.target.checked)} className="h-5 w-5 rounded border-[#6f7973] text-[#1b6b4f]" />
              </label>

              <Toggle id="settings-font-shuffle-toggle" label="Font Shuffle" icon="shuffle" checked={fontShuffle} onChange={setFontShuffle} />
              <Toggle id="settings-high-contrast-toggle" label={t('game.accessibility.highContrast')} icon="contrast" checked={highContrast} onChange={setHighContrast} />
              <Toggle id="settings-random-letters-toggle" label={t('game.accessibility.randomLetters')} icon="casino" checked={randomLetters} onChange={setRandomLetters} />
              <Toggle id="settings-reduced-motion-toggle" label={t('game.accessibility.reducedMotion')} icon="motion_photos_off" checked={reducedMotion} onChange={setReducedMotion} />
              <Toggle id="settings-slow-river-toggle" label="Slow River Mode" icon="waves" checked={slowRiver} onChange={setSlowRiver} />
              <Toggle id="settings-click-mode-toggle" label="Click Mode" icon="ads_click" checked={clickMode} onChange={setClickMode} />
              <Toggle id="settings-association-mode-toggle" label="Association Mode" icon="hub" checked={associationMode} onChange={setAssociationMode} />
            </div>
          </div>
        </section>

        <section className="pb-12 pt-4">
          <button className="w-full rounded-xl bg-[#ffdad6]/20 py-4 text-sm font-extrabold uppercase tracking-widest text-[#ba1a1a] transition-colors hover:bg-[#ffdad6]/40" type="button">
            Log Out
          </button>
          <p className="mt-8 text-center text-[10px] font-medium text-[#4a6365]">River Mint Language App — Version 2.4.0</p>
        </section>
      </main>
    </div>
  );
}
