import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocalization } from '../context/LocalizationContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useProgress, STAR_LEVEL_SIZE } from '../context/ProgressContext.jsx';
import { getFormattedLanguageName } from '../lib/languageUtils.js';
import ProfileEditorModal from '../components/ProfileEditorModal.jsx';
import { DEFAULT_PROFILE_NAME, PROFILE_AVATARS } from '../data/profileAvatars.js';

const LANGUAGE_FLAGS = {
  hebrew: '🇮🇱', english: '🇬🇧', spanish: '🇪🇸', french: '🇫🇷',
  portuguese: '🇧🇷', russian: '🇷🇺', arabic: '🇸🇦', hindi: '🇮🇳',
  bengali: '🇧🇩', mandarin: '🇨🇳', japanese: '🇯🇵', amharic: '🇪🇹',
};

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
  const { player, starLevelSize, updatePlayerProfile } = useProgress();
  const { languageId, selectLanguage, appLanguageId, selectAppLanguage, languageOptions } = useLanguage();

  const [showIntroductions, setShowIntroductions] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [randomLetters, setRandomLetters] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [gameFont, setGameFont] = useState('default');
  const [appFont, setAppFont] = useState('default');
  const [fontShuffle, setFontShuffle] = useState(false);
  const [slowRiver, setSlowRiver] = useState(false);
  const [clickMode, setClickMode] = useState(false);
  const [associationMode, setAssociationMode] = useState(false);
  const [startingLetters, setStartingLetters] = useState(2);
  const [hasLoadedSettings, setHasLoadedSettings] = useState(false);
  const [isProfileEditorOpen, setIsProfileEditorOpen] = useState(false);
  const [showInfoPopup, setShowInfoPopup] = useState(false);
  const [infoPopupContent, setInfoPopupContent] = useState({ title: '', description: '' });
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const loadSettings = () => {
      try {
        const saved = localStorage.getItem('gameSettings');
        if (saved) {
          const settings = JSON.parse(saved);
          setShowIntroductions(settings.showIntroductions ?? true);
          setDarkMode(settings.darkMode ?? settings.highContrast ?? false);
          setRandomLetters(settings.randomLetters ?? false);
          setReducedMotion(settings.reducedMotion ?? false);
          const savedFont = settings.gameFont === 'opendyslexic' ? 'lexend' : (settings.gameFont ?? 'default');
          const savedAppFont = settings.appFont === 'opendyslexic' ? 'lexend' : (settings.appFont ?? 'default');
          setGameFont(savedFont);
          setAppFont(savedAppFont);
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
        darkMode,
        randomLetters,
        reducedMotion,
        gameFont,
        appFont,
        fontShuffle,
        slowRiver,
        clickMode,
        associationMode,
        startingLetters
      };
      localStorage.setItem('gameSettings', JSON.stringify(settings));
      window.dispatchEvent(new Event('gameSettingsChanged'));
      if (darkMode) {
        document.body.classList.add('dark-mode');
        document.body.classList.remove('high-contrast');
      } else {
        document.body.classList.remove('dark-mode');
        document.body.classList.remove('high-contrast');
      }
    } catch (e) {
      console.error('Failed to save game settings', e);
    }
  }, [hasLoadedSettings, showIntroductions, darkMode, randomLetters, reducedMotion, gameFont, appFont, fontShuffle, slowRiver, clickMode, associationMode, startingLetters]);

  const starsPerLevel = starLevelSize ?? STAR_LEVEL_SIZE;
  const totalStarsEarned = player.totalStarsEarned ?? player.stars ?? 0;
  const level = player.level ?? Math.floor(totalStarsEarned / starsPerLevel) + 1;
  const levelProgress = player.levelProgress ?? (totalStarsEarned % starsPerLevel);
  const progressPct = starsPerLevel > 0 ? Math.round(Math.min((levelProgress / starsPerLevel) * 100, 100)) : 0;
  const playerName = player?.name || DEFAULT_PROFILE_NAME;
  const playerAvatar = player?.avatar || PROFILE_AVATARS[0];

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

  const settingInfo = useMemo(() => ({
    gameFont: {
      title: 'Game Font',
      description: 'Choose from different fonts, including dyslexia-friendly options, to improve readability and comfort.'
    },
    appFont: {
      title: 'App Font',
      description: 'Changes the interface font for the app UI only. Game mode text uses the separate Game Font setting.'
    },
    startingLetters: {
      title: 'Starting Letters',
      description: 'Sets how many letters are introduced at the start of practice. Lower values can make onboarding easier.'
    },
    showIntroductions: {
      title: t('game.accessibility.showIntroductions'),
      description: 'Shows an intro screen for each new letter before gameplay so you can preview sounds and shapes first.'
    },
    fontShuffle: {
      title: 'Font Shuffle',
      description: 'Randomizes letter font styles during play to build recognition across different typographic forms.'
    },
    darkMode: {
      title: 'Dark Mode',
      description: 'Switch to a dark color scheme that is easier on the eyes in low-light environments.'
    },
    randomLetters: {
      title: t('game.accessibility.randomLetters'),
      description: 'Presents letters in random order instead of a fixed sequence for more varied practice.'
    },
    reducedMotion: {
      title: t('game.accessibility.reducedMotion'),
      description: 'Reduces animation complexity for a calmer visual experience and easier tracking.'
    },
    slowRiver: {
      title: 'Slow River Mode',
      description: 'Keeps letters on screen longer so you have more time to identify and place each one.'
    },
    clickMode: {
      title: 'Click Mode',
      description: 'Lets you click to select and place letters instead of dragging.'
    },
    associationMode: {
      title: 'Association Mode',
      description: 'Shows image-based cues to support letter-sound matching through visual associations.'
    }
  }), [t]);

  const showInfo = (settingKey, event) => {
    if (!settingInfo[settingKey]) return;
    const clientX = event?.clientX || event?.touches?.[0]?.clientX || 0;
    const clientY = event?.clientY || event?.touches?.[0]?.clientY || 0;
    const viewportWidth = window.innerWidth || document.documentElement.clientWidth || 0;
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
    const horizontalPadding = 16;
    const verticalOffset = 15;
    const bottomBuffer = 24;
    const estimatedPopupHeight = 180;
    const maxPopupWidth = 320;
    const rawX = clientX + 15;
    const x = Math.min(Math.max(rawX, horizontalPadding), viewportWidth - maxPopupWidth - horizontalPadding);
    const rawY = clientY + verticalOffset;
    const maxY = viewportHeight - estimatedPopupHeight - bottomBuffer;
    const y = Math.min(rawY, maxY);
    setInfoPopupContent(settingInfo[settingKey]);
    setPopupPosition({ x, y });
    setShowInfoPopup(true);
  };

  // Close popup when clicking anywhere else
  useEffect(() => {
    if (!showInfoPopup) return;
    const handleDismiss = () => setShowInfoPopup(false);
    document.addEventListener('click', handleDismiss);
    document.addEventListener('touchstart', handleDismiss);
    return () => {
      document.removeEventListener('click', handleDismiss);
      document.removeEventListener('touchstart', handleDismiss);
    };
  }, [showInfoPopup]);

  const getInfoHandlers = (settingKey) => ({
    onClick: (event) => {
      event.preventDefault();
      event.stopPropagation();
      showInfo(settingKey, event);
    },
    onTouchStart: (event) => {
      event.preventDefault();
      event.stopPropagation();
      showInfo(settingKey, event);
    }
  });

  return (
    <div
      className="min-h-screen pb-36"
      style={{
        fontFamily: 'var(--app-language-font, "Nunito", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif)',
        background: 'var(--app-bg)',
        color: 'var(--app-on-surface)'
      }}
    >
      <header className="fixed left-0 right-0 top-0 z-40 flex h-16 items-center justify-between px-6 backdrop-blur-xl" style={{ background: 'var(--app-nav-bg)' }}>
        <div className="flex items-center gap-4">
          <button className="transition hover:opacity-80 active:scale-95" style={{ color: 'var(--app-primary)' }} onClick={() => navigate('/')} type="button" aria-label="Back to Home">
            <Icon>arrow_back</Icon>
          </button>
          <h1 className="text-lg font-bold" style={{ color: 'var(--app-primary)' }}>Settings</h1>
        </div>
        <div className="w-10"></div>
      </header>

      <main className="mx-auto max-w-2xl space-y-8 px-6 pt-20">
        <section className="relative flex items-center gap-6 overflow-hidden rounded-xl p-6" style={{ background: 'var(--app-surface)' }}>
          <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full blur-2xl" style={{ background: 'var(--app-primary-container)' }}></div>
          <div className="relative">
            <div className="h-20 w-20 overflow-hidden rounded-full border-4 shadow-lg" style={{ borderColor: 'var(--app-card-bg)' }}>
              <img src={playerAvatar} alt="Profile avatar" className="h-full w-full object-cover" />
            </div>
            <button type="button" onClick={() => setIsProfileEditorOpen(true)} className="absolute -bottom-1 -right-1 rounded-full border p-1" style={{ borderColor: 'var(--app-card-bg)', background: 'var(--app-primary)', color: 'var(--app-on-primary)' }}>
              <Icon className="text-[14px]">edit</Icon>
            </button>
            <div className="absolute -bottom-1 left-0 rounded-full px-2 py-0.5 text-[10px] font-bold shadow-md" style={{ background: 'var(--app-secondary)', color: 'var(--app-on-primary)' }}>LVL {level}</div>
          </div>
          <div className="flex-1 space-y-2">
            <h2 className="text-2xl font-extrabold tracking-tight">{playerName}</h2>
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold" style={{ color: 'var(--app-muted)' }}>
                <span>Progress</span>
                <span>{levelProgress.toLocaleString()} / {starsPerLevel.toLocaleString()} XP</span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full" style={{ background: 'var(--app-progress-bg)' }}>
                <div className="h-full rounded-full" style={{ width: `${progressPct}%`, background: 'var(--app-progress-fill)' }}></div>
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
                  <div className="flex h-6 w-8 items-center justify-center overflow-hidden rounded border border-[#bec9c2]/20 bg-slate-100 text-base">{LANGUAGE_FLAGS[languageId] ?? '🌐'}</div>
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
            <div className="space-y-5 p-4">
              <div className="rounded-lg border border-[#bec9c2]/25 p-4">
                <Toggle id="settings-dark-mode-toggle" label={<span className="cursor-help" {...getInfoHandlers('darkMode')}>Dark Mode</span>} icon="dark_mode" checked={darkMode} onChange={setDarkMode} />
              </div>

              <div className="rounded-lg border border-[#bec9c2]/25">
                <div className="border-b border-[#bec9c2]/20 px-4 py-3">
                  <p className="text-xs font-extrabold uppercase tracking-wider text-[#4a6365]">App Font</p>
                </div>
                <div className="flex items-center justify-between p-4 hover:bg-[#f9f1fd]">
                  <div className="flex items-center gap-4">
                    <Icon className="text-[#4a6365]">text_format</Icon>
                    <span className="cursor-help font-semibold" {...getInfoHandlers('appFont')}>App Font</span>
                  </div>
                  <select id="settings-app-font-select" value={appFont} onChange={(event) => setAppFont(event.target.value)} className="rounded-md border border-[#bec9c2]/50 px-2 py-1 font-bold text-[#1b6b4f]">
                    {fontOptions.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="rounded-lg border border-[#bec9c2]/25">
                <div className="border-b border-[#bec9c2]/20 px-4 py-3">
                  <p className="text-xs font-extrabold uppercase tracking-wider text-[#4a6365]">Game Font</p>
                </div>
                <div className="divide-y divide-[#bec9c2]/20">
                  <div className="flex items-center justify-between p-4 hover:bg-[#f9f1fd]">
                    <div className="flex items-center gap-4">
                      <Icon className="text-[#4a6365]">text_fields</Icon>
                      <span className="cursor-help font-semibold" {...getInfoHandlers('gameFont')}>Game Font</span>
                    </div>
                    <select id="settings-font-select" value={gameFont} onChange={(event) => setGameFont(event.target.value)} className="rounded-md border border-[#bec9c2]/50 px-2 py-1 font-bold text-[#1b6b4f]">
                      {fontOptions.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="p-4">
                    <Toggle id="settings-font-shuffle-toggle" label={<span className="cursor-help" {...getInfoHandlers('fontShuffle')}>Font Shuffle</span>} icon="shuffle" checked={fontShuffle} onChange={setFontShuffle} />
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-[#bec9c2]/25">
                <div className="border-b border-[#bec9c2]/20 px-4 py-3">
                  <p className="text-xs font-extrabold uppercase tracking-wider text-[#4a6365]">Letter River Settings</p>
                </div>
                <div className="space-y-6 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Icon className="text-[#4a6365]">format_list_numbered</Icon>
                      <span className="cursor-help font-semibold" {...getInfoHandlers('startingLetters')}>Starting Letters</span>
                    </div>
                    <select id="settings-starting-letters-select" value={startingLetters} onChange={(event) => setStartingLetters(parseInt(event.target.value, 10))} className="rounded-md border border-[#bec9c2]/50 pl-2 pr-8 py-1 font-bold text-[#1b6b4f]">
                      {Array.from({ length: 10 }, (_, index) => index + 1).map((value) => (
                        <option key={value} value={value}>{value}</option>
                      ))}
                    </select>
                  </div>

                  <label htmlFor="settings-toggle-introductions" className="flex cursor-pointer items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Icon className="text-[#4a6365]">info</Icon>
                      <span className="cursor-help font-semibold" {...getInfoHandlers('showIntroductions')}>{t('game.accessibility.showIntroductions')}</span>
                    </div>
                    <input id="settings-toggle-introductions" type="checkbox" checked={showIntroductions} onChange={(event) => setShowIntroductions(event.target.checked)} className="h-5 w-5 rounded border-[#6f7973] text-[#1b6b4f]" />
                  </label>

                  <Toggle id="settings-random-letters-toggle" label={<span className="cursor-help" {...getInfoHandlers('randomLetters')}>{t('game.accessibility.randomLetters')}</span>} icon="casino" checked={randomLetters} onChange={setRandomLetters} />
                  <Toggle id="settings-reduced-motion-toggle" label={<span className="cursor-help" {...getInfoHandlers('reducedMotion')}>{t('game.accessibility.reducedMotion')}</span>} icon="motion_photos_off" checked={reducedMotion} onChange={setReducedMotion} />
                  <Toggle id="settings-slow-river-toggle" label={<span className="cursor-help" {...getInfoHandlers('slowRiver')}>Slow River Mode</span>} icon="waves" checked={slowRiver} onChange={setSlowRiver} />
                  <Toggle id="settings-click-mode-toggle" label={<span className="cursor-help" {...getInfoHandlers('clickMode')}>Click Mode</span>} icon="ads_click" checked={clickMode} onChange={setClickMode} />
                  <Toggle id="settings-association-mode-toggle" label={<span className="cursor-help" {...getInfoHandlers('associationMode')}>Association Mode</span>} icon="hub" checked={associationMode} onChange={setAssociationMode} />
                </div>
              </div>

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
      {showInfoPopup && (
        <div
          className="fixed z-50 max-w-xs rounded-xl border border-[#bec9c2]/40 bg-white/95 p-3 shadow-xl backdrop-blur-sm"
          style={{ left: `${popupPosition.x}px`, top: `${popupPosition.y}px` }}
          onClick={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
        >
          <p className="text-sm font-bold text-[#1b6b4f]">{infoPopupContent.title}</p>
          <p className="mt-1 text-xs leading-relaxed text-[#4a6365]">{infoPopupContent.description}</p>
        </div>
      )}
    </div>
  );
}
