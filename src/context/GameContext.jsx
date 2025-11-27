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
  }, [languagePack.id]);

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

  const contextValue = useMemo(() => ({ openGame, closeGame }), [openGame, closeGame]);

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
              <div className="absolute inset-0 bg-slate-950/85 backdrop-blur" onClick={closeGame} />
              <div className="absolute inset-0 overflow-y-auto overscroll-contain">
                <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
                  <div
                    ref={containerRef}
                    className={`relative h-full w-full max-w-5xl overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl transition-transform sm:rounded-3xl ${
                      isVisible ? 'scale-100' : 'scale-95'
                    }`}
                    style={{ maxHeight: 'calc(100vh - 2rem)' }}
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
        className="relative flex h-full min-h-[calc(100vh-4rem)] flex-col bg-slate-900 sm:min-h-[600px]"
        style={{ maxHeight: 'calc(100vh - 2rem)' }}
      >
        <div className="relative flex flex-col">
          <div
            id="top-bar"
            className="bg-slate-800/90 text-sm shadow-lg sm:text-base"
          >
            <button
              id="back-to-menu-button"
              type="button"
              className="flex shrink-0 items-center justify-center gap-2 rounded-full border border-slate-700 bg-slate-800/90 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400 sm:px-4 sm:text-sm"
            >
              <span className="text-lg" aria-hidden="true">
                ←
              </span>
              <span>{t('game.controls.exitToMenu')}</span>
            </button>
            <div className="flex-1 text-center">
              <div className="inline-flex items-baseline gap-2">
                <span className="font-semibold text-slate-300">{t('game.labels.level')}</span>
                <span id="level" className="text-2xl font-bold text-yellow-400">
                  1
                </span>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-4 sm:gap-6">
              <div className="text-left">
                <span className="font-semibold text-slate-300">{t('game.labels.score')}</span>
                <span id="score" className="ml-2 text-2xl font-bold text-cyan-400">
                  0
                </span>
              </div>
              <div id="lives-container" className="flex items-center gap-2" />
            </div>
          </div>
        </div>

        <div id="play-area" className="relative flex-1 overflow-hidden bg-slate-900">
          <div
            id="learn-overlay"
            className="absolute left-1/2 top-4 z-20 flex -translate-x-1/2 items-center gap-4 rounded-2xl border border-slate-700 bg-slate-900/95 px-6 py-3 shadow-lg"
          >
            <div id="learn-letter" className={`text-6xl font-bold text-cyan-400 ${fontClass}`} />
            <div className="flex flex-col text-center">
              <div id="learn-name" className="text-2xl font-semibold text-white" />
              <div id="learn-sound" className="text-lg text-slate-300" />
            </div>
          </div>
        </div>

        <div
          id="choices-container"
          className="grid w-full flex-shrink-0 grid-cols-2 gap-3 bg-slate-900 px-4 pb-6 pt-4 sm:grid-cols-3 sm:px-6 md:grid-cols-4 lg:grid-cols-5"
        />

          <div
            id="modal"
            className="fixed inset-0 z-30 flex items-center justify-center overflow-y-auto bg-black/80 p-4 text-white sm:p-6"
          >
            <div
              id="modal-content"
              className="relative w-full max-w-3xl border border-slate-700 bg-slate-900/95 shadow-2xl"
            >
              <button
                id="setup-exit-button"
                type="button"
                className="absolute left-4 top-4 flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800/90 px-4 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400 sm:text-sm"
              >
                <span className="text-lg" aria-hidden="true">
                  ←
                </span>
                <span>{t('game.controls.exitToMenu')}</span>
              </button>

              <button
                id="accessibility-btn"
                className="absolute right-4 top-4 text-2xl text-slate-400 transition hover:text-cyan-400"
                aria-label={t('game.accessibility.gear')}
              >
                ⚙️
              </button>

              <div id="setup-view" className="space-y-4 pt-14 sm:pt-16 sm:space-y-5">
                <div className="space-y-2 text-center">
                  <h1 className={`text-2xl font-bold text-cyan-300 sm:text-3xl ${fontClass}`}>{t('game.setup.title')}</h1>
                  <p id="modal-subtitle" className="text-sm text-slate-400">
                    {t('game.setup.subtitleFallback')}
                  </p>
                </div>

                <p className="text-center text-sm text-slate-300 sm:text-base">{t('game.setup.prompt')}</p>

                <div id="mode-options" className="mode-cards-container mx-auto max-w-2xl" />
              </div>

              <div id="game-over-view" className="relative hidden pt-12 text-center">
                <button
                  id="game-over-exit-button"
                  type="button"
                  className="absolute left-0 top-0 flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800/90 px-4 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400 sm:text-sm"
                >
                  <span className="text-lg" aria-hidden="true">
                    ←
                  </span>
                  <span>{t('game.controls.exitToMenu')}</span>
                </button>
                <h2 id="game-over-heading" className={`mb-4 text-4xl font-bold text-cyan-400 ${fontClass}`}>
                  {t('game.summary.gameOver')}
                </h2>
                <p id="final-score" className="mb-6 text-2xl text-white">
                  {t('game.summary.finalScore', { score: 0 })}
                </p>
                <div className="learning-summary-container my-6" />
              </div>

              <div className="mt-4 flex flex-shrink-0 flex-col items-center gap-3 sm:flex-row sm:justify-center">
                <button
                  id="start-button"
                  className="w-full rounded-full bg-cyan-500 px-6 py-3 text-base font-semibold text-slate-900 transition hover:bg-cyan-400 sm:w-auto sm:text-lg"
                >
                  {t('game.controls.start')}
                </button>
                <button
                  id="install-btn"
                  className="hidden rounded-full bg-yellow-400 px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-yellow-300"
                >
                  {t('game.controls.install')}
                </button>
              </div>
            </div>
          </div>

        <div
          id="accessibility-view"
          className="hidden absolute right-6 top-28 z-40 w-72 rounded-2xl border border-slate-700 bg-slate-900/95 p-4 text-left shadow-xl"
        >
          <button id="close-accessibility-btn" className="absolute right-3 top-3 text-2xl text-slate-400 hover:text-white">
            ×
          </button>
          <h3 className="mb-4 text-center text-lg font-semibold text-cyan-400">{t('game.controls.accessibility')}</h3>
          <div className="space-y-4 text-sm text-slate-300">
            <label className="flex items-center justify-between">
              <span>{t('game.accessibility.showIntroductions')}</span>
              <input id="toggle-introductions" type="checkbox" className="h-5 w-5 rounded border-slate-600 bg-slate-700 text-cyan-400 focus:ring-cyan-500" defaultChecked />
            </label>
            <label className="flex items-center justify-between">
              <span>{t('game.accessibility.highContrast')}</span>
              <input id="high-contrast-toggle" type="checkbox" className="h-5 w-5 rounded border-slate-600 bg-slate-700 text-cyan-400 focus:ring-cyan-500" />
            </label>
            <label className="flex items-center justify-between">
              <span>{t('game.accessibility.randomLetters')}</span>
              <input id="random-letters-toggle" type="checkbox" className="h-5 w-5 rounded border-slate-600 bg-slate-700 text-cyan-400 focus:ring-cyan-500" />
            </label>
            <label className="flex items-center justify-between">
              <span>{t('game.accessibility.reducedMotion')}</span>
              <input id="reduced-motion-toggle" type="checkbox" className="h-5 w-5 rounded border-slate-600 bg-slate-700 text-cyan-400 focus:ring-cyan-500" />
            </label>
            <div>
              <label htmlFor="game-speed-slider" className="text-sm text-slate-300">
                {t('game.accessibility.speed')} (<span id="speed-label">{t('game.accessibility.speedNormal')}</span>)
              </label>
              <input id="game-speed-slider" type="range" min="10" max="24" defaultValue="17" className="mt-2 w-full" />
            </div>
          </div>
        </div>

        <div
          id="summary-tooltip"
          className="pointer-events-none absolute z-50 hidden rounded-xl border border-slate-600 bg-slate-900 px-3 py-2 text-center text-sm text-white shadow-lg"
        />
        <div id="correct-answer-ghost" className="pointer-events-none absolute text-xl font-bold text-green-400 opacity-0" />
      </div>
    </div>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
