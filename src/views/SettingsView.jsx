import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocalization } from '../context/LocalizationContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useProgress, STAR_LEVEL_SIZE } from '../context/ProgressContext.jsx';
import { getFormattedLanguageName } from '../lib/languageUtils.js';
import ProfileEditorModal from '../components/ProfileEditorModal.jsx';
import { DEFAULT_PROFILE_NAME, PROFILE_AVATARS } from '../data/profileAvatars.js';
import { setSoundEnabled, isSoundEnabled, setSoundVolume, getSoundVolume } from '../lib/soundLibrary.js';

const APP_VERSION = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '0.1.0';

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
        <Icon style={{ color: 'var(--app-muted)', transition: 'color 0.15s' }}>{icon}</Icon>
        <span className="font-semibold" style={{ color: 'var(--app-on-surface)' }}>{label}</span>
      </div>
      <div className="relative inline-flex items-center">
        <input id={id} type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="peer sr-only" />
        <div className="h-6 w-11 rounded-full transition after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition peer-checked:after:translate-x-full" style={{ background: checked ? 'var(--app-primary)' : 'var(--app-surface-highest)' }}></div>
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

  // Sound & Audio settings
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [uiSounds, setUiSounds] = useState(() => isSoundEnabled());
  const [soundVolume, setSoundVolumeState] = useState(() => Math.round(getSoundVolume() * 100));

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
      const root = document.documentElement;
      root.classList.toggle('dark-mode', darkMode);
      document.body.classList.toggle('dark-mode', darkMode);
      root.setAttribute('data-theme', darkMode ? 'dark' : 'light');
      document.body.setAttribute('data-theme', darkMode ? 'dark' : 'light');
      document.body.classList.remove('high-contrast');
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

  const InfoButton = ({ settingKey, children }) => (
    <button
      type="button"
      className="cursor-help font-semibold text-left"
      style={{ color: 'inherit', background: 'none', border: 'none', padding: 0 }}
      aria-label={`${children}: show info`}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        showInfo(settingKey, event);
      }}
    >
      {children}
    </button>
  );

  return (
    <div
      className="settings-view min-h-screen pb-36"
      style={{
        fontFamily: 'var(--app-language-font, "Nunito", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif)',
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
        <section className="stable-card relative flex items-center gap-6 overflow-hidden rounded-xl p-6" style={{ background: 'var(--app-surface)' }}>
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
          <h3 className="px-2 text-sm font-bold uppercase tracking-widest" style={{ color: 'var(--app-muted)' }}>Language Preferences</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="stable-card rounded-xl p-5 shadow-sm" style={{ background: 'var(--app-card-bg)', border: '1px solid var(--app-card-border)' }}>
              <label htmlFor="settings-app-language-select" className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Icon style={{ color: 'var(--app-primary)' }}>language</Icon>
                  <div>
                    <p className="line-clamp-1-stable text-xs font-medium" style={{ color: 'var(--app-muted)' }}>App Language</p>
                    <p className="line-clamp-1-stable font-bold" style={{ color: 'var(--app-on-surface)' }}>{displayLanguageOptions.find((option) => option.id === appLanguageId)?.name}</p>
                  </div>
                </div>
                <Icon style={{ color: 'var(--app-outline-variant)' }}>expand_more</Icon>
              </label>
              <select id="settings-app-language-select" value={appLanguageId} onChange={(event) => selectAppLanguage(event.target.value)} className="mt-3 w-full rounded-lg px-3 py-2 text-sm font-semibold" style={{ border: '1px solid var(--app-input-border)', background: 'var(--app-input-bg)', color: 'var(--app-on-surface)' }}>
                {displayLanguageOptions.map((option) => (
                  <option key={option.id} value={option.id}>{option.name}</option>
                ))}
              </select>
            </div>

            <div className="stable-card rounded-xl p-5 shadow-sm" style={{ background: 'var(--app-card-bg)', border: '1px solid var(--app-card-border)' }}>
              <label htmlFor="settings-practice-language-select" className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-6 w-8 items-center justify-center overflow-hidden rounded text-base" style={{ border: '1px solid var(--app-card-border)', background: 'var(--app-surface)' }}>{LANGUAGE_FLAGS[languageId] ?? '🌐'}</div>
                  <div>
                    <p className="line-clamp-1-stable text-xs font-medium" style={{ color: 'var(--app-muted)' }}>I'm Learning</p>
                    <p className="line-clamp-1-stable font-bold" style={{ color: 'var(--app-on-surface)' }}>{displayLanguageOptions.find((option) => option.id === languageId)?.name}</p>
                  </div>
                </div>
                <span className="rounded-md px-2 py-1 text-[10px] font-black" style={{ background: 'var(--app-primary)', color: 'var(--app-on-primary)' }}>ACTIVE</span>
              </label>
              <select id="settings-practice-language-select" value={languageId} onChange={(event) => selectLanguage(event.target.value)} className="mt-3 w-full rounded-lg px-3 py-2 text-sm font-semibold" style={{ border: '1px solid var(--app-input-border)', background: 'var(--app-input-bg)', color: 'var(--app-on-surface)' }}>
                {displayLanguageOptions.map((option) => (
                  <option key={option.id} value={option.id}>{option.name}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="px-2 text-sm font-bold uppercase tracking-widest" style={{ color: 'var(--app-muted)' }}>Game Settings</h3>
          <div className="stable-card overflow-hidden rounded-xl shadow-sm" style={{ background: 'var(--app-card-bg)', border: '1px solid var(--app-card-border)' }}>
            <div className="space-y-5 p-4">
              <div className="rounded-lg p-4" style={{ border: '1px solid var(--app-card-border)' }}>
                <Toggle id="settings-dark-mode-toggle" label={<InfoButton settingKey="darkMode">Dark Mode</InfoButton>} icon="dark_mode" checked={darkMode} onChange={setDarkMode} />
              </div>

              <div className="rounded-lg" style={{ border: '1px solid var(--app-card-border)' }}>
                <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--app-card-border)' }}>
                  <p className="text-xs font-extrabold uppercase tracking-wider" style={{ color: 'var(--app-muted)' }}>App Font</p>
                </div>
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <Icon style={{ color: 'var(--app-muted)' }}>text_format</Icon>
                    <InfoButton settingKey="appFont">App Font</InfoButton>
                  </div>
                  <select id="settings-app-font-select" value={appFont} onChange={(event) => setAppFont(event.target.value)} className="rounded-md px-2 py-1 font-bold" style={{ border: '1px solid var(--app-input-border)', color: 'var(--app-primary)', background: 'var(--app-input-bg)' }}>
                    {fontOptions.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="rounded-lg" style={{ border: '1px solid var(--app-card-border)' }}>
                <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--app-card-border)' }}>
                  <p className="text-xs font-extrabold uppercase tracking-wider" style={{ color: 'var(--app-muted)' }}>Game Font</p>
                </div>
                <div style={{ borderBottom: '1px solid var(--app-card-border)' }}>
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                      <Icon style={{ color: 'var(--app-muted)' }}>text_fields</Icon>
                      <InfoButton settingKey="gameFont">Game Font</InfoButton>
                    </div>
                    <select id="settings-font-select" value={gameFont} onChange={(event) => setGameFont(event.target.value)} className="rounded-md px-2 py-1 font-bold" style={{ border: '1px solid var(--app-input-border)', color: 'var(--app-primary)', background: 'var(--app-input-bg)' }}>
                      {fontOptions.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="p-4">
                  <Toggle id="settings-font-shuffle-toggle" label={<InfoButton settingKey="fontShuffle">Font Shuffle</InfoButton>} icon="shuffle" checked={fontShuffle} onChange={setFontShuffle} />
                </div>
              </div>

              <div className="rounded-lg" style={{ border: '1px solid var(--app-card-border)' }}>
                <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--app-card-border)' }}>
                  <p className="text-xs font-extrabold uppercase tracking-wider" style={{ color: 'var(--app-muted)' }}>Letter River Settings</p>
                </div>
                <div className="space-y-6 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Icon style={{ color: 'var(--app-muted)' }}>format_list_numbered</Icon>
                      <InfoButton settingKey="startingLetters">Starting Letters</InfoButton>
                    </div>
                    <select id="settings-starting-letters-select" value={startingLetters} onChange={(event) => setStartingLetters(parseInt(event.target.value, 10))} className="rounded-md pl-2 pr-8 py-1 font-bold" style={{ border: '1px solid var(--app-input-border)', color: 'var(--app-primary)', background: 'var(--app-input-bg)' }}>
                      {Array.from({ length: 10 }, (_, index) => index + 1).map((value) => (
                        <option key={value} value={value}>{value}</option>
                      ))}
                    </select>
                  </div>

                  <Toggle id="settings-toggle-introductions" label={<InfoButton settingKey="showIntroductions">{t('game.accessibility.showIntroductions')}</InfoButton>} icon="info" checked={showIntroductions} onChange={setShowIntroductions} />

                  <Toggle id="settings-random-letters-toggle" label={<InfoButton settingKey="randomLetters">{t('game.accessibility.randomLetters')}</InfoButton>} icon="casino" checked={randomLetters} onChange={setRandomLetters} />
                  <Toggle id="settings-reduced-motion-toggle" label={<InfoButton settingKey="reducedMotion">{t('game.accessibility.reducedMotion')}</InfoButton>} icon="motion_photos_off" checked={reducedMotion} onChange={setReducedMotion} />
                  <Toggle id="settings-slow-river-toggle" label={<InfoButton settingKey="slowRiver">Slow River Mode</InfoButton>} icon="waves" checked={slowRiver} onChange={setSlowRiver} />
                  <Toggle id="settings-click-mode-toggle" label={<InfoButton settingKey="clickMode">Click Mode</InfoButton>} icon="ads_click" checked={clickMode} onChange={setClickMode} />
                  <Toggle id="settings-association-mode-toggle" label={<InfoButton settingKey="associationMode">Association Mode</InfoButton>} icon="hub" checked={associationMode} onChange={setAssociationMode} />
                </div>
              </div>

            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="px-2 text-sm font-bold uppercase tracking-widest" style={{ color: 'var(--app-muted)' }}>Sound & Audio</h3>
          <div className="stable-card overflow-hidden rounded-xl shadow-sm" style={{ background: 'var(--app-card-bg)', border: '1px solid var(--app-card-border)' }}>
            <div className="space-y-4 p-4">
              <Toggle id="settings-tts-toggle" label="Pronunciation Audio" icon="record_voice_over" checked={ttsEnabled} onChange={(val) => {
                setTtsEnabled(val);
                try { localStorage.setItem('settings.ttsEnabled', JSON.stringify(val)); } catch (_e) { /* noop */ }
              }} />
              <Toggle id="settings-ui-sounds-toggle" label="Game Sounds" icon="volume_up" checked={uiSounds} onChange={(val) => {
                setUiSounds(val);
                setSoundEnabled(val);
              }} />
              <div className="flex items-center gap-4">
                <Icon style={{ color: 'var(--app-muted)' }}>tune</Icon>
                <span className="flex-1 font-semibold" style={{ color: 'var(--app-on-surface)' }}>Volume</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={soundVolume}
                  onChange={(e) => {
                    const vol = Number(e.target.value);
                    setSoundVolumeState(vol);
                    setSoundVolume(vol / 100);
                  }}
                  className="w-24"
                />
                <span className="w-8 text-right text-xs font-bold" style={{ color: 'var(--app-muted)' }}>{soundVolume}%</span>
              </div>
            </div>
          </div>
        </section>

        <section className="pb-12 pt-4">
          <button className="btn-press w-full rounded-xl py-4 text-sm font-extrabold uppercase tracking-widest transition-colors" style={{ background: 'var(--app-error-bg)', color: 'var(--app-error-text)' }} type="button">
            Log Out
          </button>
          <p className="mt-8 text-center text-[10px] font-medium" style={{ color: 'var(--app-muted)' }}>River Mint Language App — Version {APP_VERSION}</p>
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
          role="tooltip"
          className="animate-scale-in fixed z-50 max-w-xs rounded-xl p-3 shadow-xl backdrop-blur-sm"
          style={{ left: `${popupPosition.x}px`, top: `${popupPosition.y}px`, background: 'var(--app-popup-bg)', border: '1px solid var(--app-popup-border)' }}
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => { if (e.key === 'Escape') setShowInfoPopup(false); }}
        >
          <p className="text-sm font-bold" style={{ color: 'var(--app-primary)' }}>{infoPopupContent.title}</p>
          <p className="mt-1 text-xs leading-relaxed" style={{ color: 'var(--app-muted)' }}>{infoPopupContent.description}</p>
        </div>
      )}
    </div>
  );
}
