import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { setupGame } from '../game/game.js';
import { useLocalization } from './LocalizationContext.jsx';

const GameContext = createContext({ openGame: () => {}, closeGame: () => {} });

export function GameProvider({ children }) {
  const [isVisible, setIsVisible] = useState(false);
  const [options, setOptions] = useState(null);
  const containerRef = useRef(null);
  const gameApiRef = useRef(null);
  const [hasMounted, setHasMounted] = useState(false);
  const { languagePack, interfaceLanguagePack, t, dictionary } = useLocalization();
  const fontClass = languagePack.metadata?.fontClass ?? 'language-font-hebrew';
  const direction = interfaceLanguagePack.metadata?.textDirection ?? 'ltr';

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (!gameApiRef.current) return;
    const api = gameApiRef.current;
    api.resetToSetupScreen?.();
    gameApiRef.current = null;
  }, [languagePack.id, interfaceLanguagePack.id]);

  useEffect(() => {
    if (!isVisible) return;
    if (!containerRef.current) return;
    if (!gameApiRef.current) {
      gameApiRef.current = setupGame({
        onReturnToMenu: () => {
          setIsVisible(false);
        },
        languagePack,
        translate: t,
        dictionary
      });
    }
    const api = gameApiRef.current;
    api.resetToSetupScreen();
    if (options?.mode) api.setGameMode(options.mode);
    if (options?.forceLetter) api.forceStartByHebrew(options.forceLetter);
    if (options?.autostart) {
      requestAnimationFrame(() => api.startGame());
    }
  }, [isVisible, options, languagePack, t, dictionary]);

  const openGame = useCallback((openOptions = {}) => {
    setOptions(openOptions);
    setIsVisible(true);
  }, []);

  const closeGame = useCallback(() => {
    if (gameApiRef.current) {
      gameApiRef.current.resetToSetupScreen();
    }
    setIsVisible(false);
  }, []);

  const contextValue = useMemo(() => ({ openGame, closeGame, isVisible }), [openGame, closeGame, isVisible]);

  return (
    <GameContext.Provider value={contextValue}>
      {children}
      {hasMounted
        ? createPortal(
            <div
              className={`fixed inset-0 z-50 transition-opacity duration-200 ${
                isVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
              }`}
            >
              <div className="absolute inset-0 backdrop-blur" style={{ background: 'rgba(74, 34, 8, 0.85)' }} onClick={closeGame} />
              <div className="absolute inset-0 overflow-y-auto overscroll-contain">
                <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
                  <div
                    ref={containerRef}
                    className={`relative h-full w-full max-w-5xl overflow-hidden rounded-2xl shadow-2xl transition-transform sm:rounded-3xl ${
                      isVisible ? 'scale-100' : 'scale-95'
                    }`}
                    style={{
                      background: 'linear-gradient(180deg, #fffaf0 0%, #ffe9c9 45%, #ffe2b8 100%)',
                      border: '2px solid #e49b5a',
                      maxHeight: 'calc(100vh - 2rem)'
                    }}
                    onClick={(e) => e.stopPropagation()}
                    dir={direction}
                  >
                    <GameCanvas key={languagePack.id} fontClass={fontClass} />
                  </div>
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </GameContext.Provider>
  );
}

function GameCanvas({ fontClass }) {
  const { t } = useLocalization();
  return (
    <div id="game-view" className="flex h-full w-full flex-col overflow-hidden">
      <div
        id="game-container"
        className="relative flex h-full min-h-[calc(100vh-4rem)] flex-col sm:min-h-[600px]"
        style={{
          background: 'linear-gradient(180deg, #fff9eb 0%, #ffe5bd 100%)',
          maxHeight: 'calc(100vh - 2rem)'
        }}
      >
        <div className="relative flex flex-col">
          <div
            id="top-bar"
            className="relative text-sm shadow-lg sm:text-base"
            style={{ background: 'rgba(255, 229, 201, 0.9)' }}
          >
            <span
              id="back-to-menu-button"
              className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-semibold uppercase tracking-wide sm:left-6"
              style={{ color: '#b07737' }}
            >
              {t('game.controls.exitToMenu')}
            </span>
            <div className="top-bar-content flex w-full flex-wrap items-center justify-center gap-3 sm:gap-6">
              <div className="inline-flex items-center gap-2 text-center">
                <span className="font-semibold" style={{ color: '#6c3b14' }}>{t('game.labels.level')}</span>
                <span id="level" className="text-2xl font-bold" style={{ color: '#ff9247' }}>
                  1
                </span>
              </div>
              <div className="flex items-center gap-2 text-center">
                <span className="font-semibold" style={{ color: '#6c3b14' }}>{t('game.labels.score')}</span>
                <span id="score" className="text-2xl font-bold" style={{ color: '#ffce4a' }}>
                  0
                </span>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3" id="river-stat-container">
                <div className="stat-badge" id="wave-stat" aria-live="polite">
                  <span className="sr-only">{t('game.labels.bestWave', 'Best wave')}</span>
                  <span className="stat-badge__icon" aria-hidden="true">🌊</span>
                  <span className="stat-badge__value" id="wave-stat-value">
                    0
                  </span>
                  <span className="stat-badge__ghost" id="wave-stat-ghost" aria-hidden="true" />
                </div>
                <div className="stat-badge" id="streak-stat" aria-live="polite">
                  <span className="sr-only">{t('game.labels.bestStreak', 'Best streak')}</span>
                  <span className="stat-badge__icon" aria-hidden="true">🔥</span>
                  <span className="stat-badge__value" id="streak-stat-value">
                    0
                  </span>
                  <span className="stat-badge__ghost" id="streak-stat-ghost" aria-hidden="true" />
                </div>
              </div>
              <div id="lives-container" className="flex items-center gap-2" />
            </div>
          </div>
        </div>

        <div id="play-area" className="relative flex-1 overflow-hidden" style={{ background: 'linear-gradient(180deg, rgba(255, 218, 168, 0.3), rgba(255, 229, 201, 0.5))' }}>
          <div
            id="learn-overlay"
            className="absolute left-1/2 top-4 z-20 flex -translate-x-1/2 items-center gap-4 rounded-2xl px-6 py-3 shadow-lg"
            style={{
              border: '2px solid rgba(235, 179, 105, 0.95)',
              background: 'linear-gradient(180deg, #fff5dd 0%, #ffe5c2 100%)',
              boxShadow: '0 4px 0 rgba(214, 140, 64, 1), 0 8px 12px rgba(214, 140, 64, 0.6)'
            }}
          >
            <div id="learn-letter" className={`text-6xl font-bold ${fontClass}`} style={{ color: '#ff9247' }} />
            <div className="flex flex-col text-center">
              <div id="learn-name" className="text-2xl font-semibold" style={{ color: '#4a2208' }} />
              <div id="learn-sound" className="text-lg" style={{ color: '#6c3b14' }} />
            </div>
          </div>
        </div>

        <div
          id="choices-container"
          className="grid w-full flex-shrink-0 grid-cols-2 gap-3 px-4 pb-6 pt-4 sm:grid-cols-3 sm:px-6 md:grid-cols-4 lg:grid-cols-5"
          style={{ background: 'linear-gradient(180deg, #fff9eb 0%, #ffe5bd 100%)' }}
        />

          <div
            id="modal"
            className="fixed inset-0 z-30 flex items-center justify-center overflow-y-auto p-4 sm:p-6"
            style={{ background: 'rgba(74, 34, 8, 0.8)' }}
          >
            <div
              id="modal-content"
              className="relative w-full max-w-3xl shadow-2xl"
              style={{
                border: '2px solid rgba(235, 179, 105, 0.95)',
                background: 'linear-gradient(180deg, #dfcba5ff 0%, #e0bf95ff 55%, #d3b894ff 100%)',
                boxShadow: '0 8px 0 rgba(214, 140, 64, 1), 0 16px 24px rgba(214, 140, 64, 0.6)'
              }}
            >
              <button
                id="accessibility-btn"
                className="absolute right-4 top-4 text-2xl transition"
                aria-label={t('game.accessibility.gear')}
                style={{ color: '#b07737' }}
              >
                ⚙️
              </button>

              <div id="setup-view" className="flex flex-col h-full">
                <div
                  className="relative flex items-center justify-center px-3 py-2 border-b-2"
                  style={{ borderColor: 'rgba(235, 179, 105, 0.3)' }}
                >
                  <button
                    id="setup-exit-button"
                    type="button"
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold transition sm:text-sm"
                    style={{ color: '#6c3b14' }}
                  >
                    {t('game.controls.exitToMenu')}
                  </button>
                  <div className="flex flex-col items-center flex-1 text-center gap-1">
                    <h1 className={`modal-title text-xl sm:text-2xl font-bold ${fontClass}`} style={{ color: '#ff9247' }}>
                      {t('game.setup.title')}
                    </h1>
                    <p id="modal-subtitle" className="text-xs font-semibold sm:text-sm" style={{ color: '#6c3b14' }}>
                      {t('game.setup.subtitleFallback')}
                    </p>
                  </div>
                </div>
                <div className="setup-body px-4">
                  <aside className="goal-column" aria-label="Goal settings">
                    <div className="goal-column__label text-xs font-bold uppercase tracking-wider" style={{ color: '#6c3b14' }}>
                      {t('game.setup.goal', 'Goal')}
                    </div>

                    <div className="goal-badge" aria-live="polite">
                      <button
                        className="goal-badge__info-icon"
                        id="goalInfoIcon"
                        aria-label="Goal information"
                        aria-controls="goalTooltip"
                        aria-expanded="false"
                        type="button"
                      >
                        <span aria-hidden="true" className="goal-badge__info-glyph">i</span>
                      </button>
                      <div className="goal-badge__value" id="goalValue">Medium</div>
                      <div className="goal-badge__tooltip hidden" id="goalTooltip">
                        {t('game.setup.goalTooltip', 'The Goal number represents the amount of letters you need to collect correctly in a row within a single wave. Complete a wave with this number of letters to win!')}
                      </div>
                    </div>

                    <div className="goal-column__controls" aria-label="Adjust goal">
                      <button className="goal-icon-button" type="button" id="goalIncrease" aria-label="Increase goal">+</button>

                      <div className="goal-progress-bar" aria-label="Goal progress">
                        <div className="goal-progress-bar__inner">
                          <div className="goal-progress-bar__fill" id="goalProgressFill"></div>
                          <div className="goal-progress-bar__ticks">
                            <span className="goal-progress-bar__tick"></span>
                            <span className="goal-progress-bar__tick"></span>
                            <span className="goal-progress-bar__tick"></span>
                            <span className="goal-progress-bar__tick"></span>
                            <span className="goal-progress-bar__tick"></span>
                            <span className="goal-progress-bar__tick"></span>
                            <span className="goal-progress-bar__tick"></span>
                            <span className="goal-progress-bar__tick"></span>
                            <span className="goal-progress-bar__tick"></span>
                            <span className="goal-progress-bar__tick"></span>
                          </div>
                        </div>
                      </div>

                      <button className="goal-icon-button" type="button" id="goalDecrease" aria-label="Decrease goal">–</button>
                    </div>
                  </aside>

                  <section className="mode-column">
                    <h2 className="mode-column__headline text-xs font-bold uppercase tracking-wider" style={{ color: '#6c3b14' }}>
                      {t('game.setup.prompt')}
                    </h2>

                    <div className="mode-panel">
                      <div id="mode-options" className="mode-buttons-container" />

                      <div className="mode-panel__footer">
                        <button
                          id="start-button"
                          className="primary-cta"
                          type="button"
                          style={{
                            border: '2px solid #5aa838',
                            background: 'linear-gradient(135deg, #e8ffd8 0%, #7bd74f 100%)',
                            color: '#ffffff',
                            boxShadow: '0 6px 0 #5aa838, 0 8px 20px rgba(90, 168, 56, 0.3)',
                            textShadow: '0 2px 4px rgba(0, 0, 0, 0.15)'
                          }}
                        >
                          {t('game.controls.start')}
                        </button>
                      </div>
                    </div>
                  </section>
                </div>
              </div>

              <div id="game-over-view" className="relative hidden pt-12 text-center">
                <div
                  id="game-over-exit-button"
                  className="absolute left-0 top-0 flex items-center gap-2 px-4 py-2 text-xs font-semibold sm:text-sm"
                  style={{ color: '#4a2208' }}
                >
                  <span className="text-lg" aria-hidden="true">

                  </span>
                  <span>{t('game.controls.exitToMenu')}</span>
                </div>
                <h2 id="game-over-heading" className={`mb-4 text-4xl font-bold ${fontClass}`} style={{ color: '#ff9247' }}>
                  {t('game.summary.gameOver')}
                </h2>
                <p id="final-score" className="mb-6 text-2xl" style={{ color: '#4a2208' }}>
                  {t('game.summary.finalScore', { score: 0 })}
                </p>
                <div className="learning-summary-container my-6" />
              </div>

              <div id="win-view" className="relative hidden pt-8 text-center px-4">
                <div className="space-y-6">
                  <div className="text-6xl">🎉</div>
                  <h2 className={`text-5xl font-bold ${fontClass}`} style={{ color: '#7bd74f' }}>
                    {t('game.win.title', 'You Win!')}
                  </h2>
                  <p className="text-xl font-semibold" style={{ color: '#4a2208' }}>
                    {t('game.win.message', 'You reached your goal!')}
                  </p>
                  <div className="space-y-2">
                    <p className="text-lg" style={{ color: '#6c3b14' }}>
                      {t('game.win.sessionCorrectPrefix', 'You caught')}{' '}
                      <span className="font-bold" id="session-correct-display">0</span> {t('game.win.sessionCorrectSuffix', 'letters in a row this game!')}
                    </p>
                    <p className="text-base" style={{ color: '#6c3b14' }}>
                      {t('game.win.totalWins', 'Total wins')}: <span className="font-bold" id="total-wins-display">0</span>
                    </p>
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row sm:justify-center mt-8">
                    <button
                      id="continue-playing-button"
                      className="w-full rounded-full px-8 py-3 text-base font-semibold transition sm:w-auto"
                      style={{
                        border: '2px solid #5aa838',
                        background: 'linear-gradient(135deg, #e8ffd8 0%, #7bd74f 100%)',
                        color: '#ffffff',
                        boxShadow: '0 4px 0 #5aa838, 0 6px 12px rgba(90, 168, 56, 0.3)',
                        textShadow: '0 2px 4px rgba(0, 0, 0, 0.15)'
                      }}
                    >
                      {t('game.win.continue', 'Continue Playing')}
                    </button>
                    <button
                      id="win-exit-button"
                      className="w-full rounded-full px-8 py-3 text-base font-semibold transition sm:w-auto"
                      style={{
                        border: 0,
                        background: 'radial-gradient(circle at 20% 0, #ffe6c7 0, #ffb45f 40%, #ff7a3b 100%)',
                        color: '#4a1a06',
                        boxShadow: '0 4px 0 #c85a24, 0 7px 12px rgba(200, 90, 36, 0.7)'
                      }}
                    >
                      {t('game.controls.backToMenu')}
                    </button>
                  </div>
                </div>
              </div>

              <div id="setup-footer" className="mt-2 flex flex-shrink-0 flex-col items-center gap-3 pb-4 sm:flex-row sm:justify-center">
                <button
                  id="install-btn"
                  className="hidden rounded-full px-5 py-3 text-sm font-semibold transition"
                  style={{
                    border: 0,
                    background: 'radial-gradient(circle at 20% 0, #fff7cf 0, #ffd96d 45%, #e79b26 100%)',
                    color: '#4a1a06',
                    boxShadow: '0 3px 0 rgba(176, 104, 38, 1), 0 6px 10px rgba(176, 104, 38, 0.7)'
                  }}
                >
                  {t('game.controls.install')}
                </button>
              </div>
            </div>
          </div>

        <div
          id="accessibility-view"
          className="hidden absolute right-6 top-28 z-40 w-72 rounded-2xl p-4 text-left shadow-xl"
          style={{
            border: '2px solid rgba(235, 179, 105, 0.95)',
            background: 'linear-gradient(180deg, #fff5dd 0%, #ffe5c2 100%)',
            boxShadow: '0 4px 0 rgba(214, 140, 64, 1), 0 8px 12px rgba(214, 140, 64, 0.6)'
          }}
        >
          <button id="close-accessibility-btn" className="absolute right-3 top-3 text-2xl transition" style={{ color: '#b07737' }}>
            ×
          </button>
          <h3 className="mb-4 text-center text-lg font-semibold" style={{ color: '#ff9247' }}>{t('game.controls.accessibility')}</h3>
          <div className="space-y-4 text-sm" style={{ color: '#4a2208' }}>
            <label className="flex items-center justify-between">
              <span>{t('game.accessibility.showIntroductions')}</span>
              <input id="toggle-introductions" type="checkbox" className="h-5 w-5 rounded" style={{ borderColor: '#e49b5a', background: '#fff5dd', accentColor: '#ff9247' }} defaultChecked />
            </label>
            <label className="flex items-center justify-between">
              <span>{t('game.accessibility.highContrast')}</span>
              <input id="high-contrast-toggle" type="checkbox" className="h-5 w-5 rounded" style={{ borderColor: '#e49b5a', background: '#fff5dd', accentColor: '#ff9247' }} />
            </label>
            <label className="flex items-center justify-between">
              <span>{t('game.accessibility.randomLetters')}</span>
              <input id="random-letters-toggle" type="checkbox" className="h-5 w-5 rounded" style={{ borderColor: '#e49b5a', background: '#fff5dd', accentColor: '#ff9247' }} />
            </label>
            <label className="flex items-center justify-between">
              <span>{t('game.accessibility.reducedMotion')}</span>
              <input id="reduced-motion-toggle" type="checkbox" className="h-5 w-5 rounded" style={{ borderColor: '#e49b5a', background: '#fff5dd', accentColor: '#ff9247' }} />
            </label>
            <div>
              <label htmlFor="game-speed-slider" className="text-sm" style={{ color: '#4a2208' }}>
                {t('game.accessibility.speed')} (<span id="speed-label">{t('game.accessibility.speedNormal')}</span>)
              </label>
              <input id="game-speed-slider" type="range" min="10" max="24" defaultValue="17" className="mt-2 w-full" style={{ accentColor: '#ff9247' }} />
            </div>
          </div>
        </div>

        <div
          id="summary-tooltip"
          className="pointer-events-none absolute z-50 hidden rounded-xl px-3 py-2 text-center text-sm shadow-lg"
          style={{
            border: '2px solid rgba(235, 179, 105, 0.95)',
            background: 'linear-gradient(180deg, #fff5dd 0%, #ffe5c2 100%)',
            color: '#4a2208',
            boxShadow: '0 4px 0 rgba(214, 140, 64, 1), 0 8px 12px rgba(214, 140, 64, 0.6)'
          }}
        />
        <div id="correct-answer-ghost" className="pointer-events-none absolute text-4xl font-bold opacity-0" style={{ color: '#5acb5a' }} />
      </div>
    </div>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
