import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { setupGame } from '../game/game.js';

const GameContext = createContext({ openGame: () => {}, closeGame: () => {} });

export function GameProvider({ children }) {
  const [isVisible, setIsVisible] = useState(false);
  const [options, setOptions] = useState(null);
  const containerRef = useRef(null);
  const gameApiRef = useRef(null);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    if (!containerRef.current) return;
    if (!gameApiRef.current) {
      gameApiRef.current = setupGame({
        onReturnToMenu: () => {
          setIsVisible(false);
        }
      });
    }
    const api = gameApiRef.current;
    api.resetToSetupScreen();
    if (options?.mode) api.setGameMode(options.mode);
    if (options?.forceLetter) api.forceStartByHebrew(options.forceLetter);
    if (options?.autostart) {
      requestAnimationFrame(() => api.startGame());
    }
  }, [isVisible, options]);

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
              <div className="absolute inset-0 overflow-y-auto">
                <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
                  <div
                    ref={containerRef}
                    className={`relative h-full w-full max-w-5xl overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl transition-transform sm:rounded-3xl ${
                      isVisible ? 'scale-100' : 'scale-95'
                    }`}
                    style={{ maxHeight: 'calc(100vh - 2rem)' }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <GameCanvas />
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

function GameCanvas() {
  return (
    <div id="game-view" className="flex h-full w-full flex-col overflow-hidden">
      <div
        id="game-container"
        className="relative flex h-full min-h-[calc(100vh-4rem)] flex-col bg-slate-900 sm:min-h-[600px]"
        style={{ maxHeight: 'calc(100vh - 2rem)' }}
      >
        <div className="relative flex flex-col">
          <div id="top-bar" className="flex items-center bg-slate-800/90 px-6 py-4 text-base shadow-lg">
            <div className="flex-1 text-center">
              <div className="inline-flex items-baseline gap-2">
                <span className="font-semibold text-slate-300">Level</span>
                <span id="level" className="text-2xl font-bold text-yellow-400">
                  1
                </span>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-left">
                <span className="font-semibold text-slate-300">Score</span>
                <span id="score" className="ml-2 text-2xl font-bold text-cyan-400">
                  0
                </span>
              </div>
              <div id="lives-container" className="flex items-center gap-2" />
            </div>
          </div>

          <button
            id="back-to-menu-button"
            className="mx-6 mt-3 flex items-center justify-center gap-2 rounded-full border border-slate-700 bg-slate-800/90 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-700 sm:absolute sm:left-4 sm:top-4 sm:mx-0 sm:mt-0"
          >
            <span className="text-lg">←</span>
            <span>Leave Game</span>
          </button>
        </div>

        <div id="play-area" className="relative flex-1 overflow-hidden bg-slate-900">
          <div
            id="learn-overlay"
            className="absolute left-1/2 top-4 z-20 flex -translate-x-1/2 items-center gap-4 rounded-2xl border border-slate-700 bg-slate-900/95 px-6 py-3 shadow-lg"
          >
            <div id="learn-letter" className="text-6xl font-bold text-cyan-400 hebrew-font" />
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
            className="relative w-full max-w-3xl overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900/95 p-5 shadow-2xl sm:rounded-3xl sm:p-6"
            style={{ maxHeight: 'calc(100vh - 3rem)' }}
          >
            <button
              id="accessibility-btn"
              className="absolute right-4 top-4 text-2xl text-slate-400 transition hover:text-cyan-400"
            >
              ⚙️
            </button>

            <div id="setup-view" className="space-y-6">
              <div className="space-y-2 text-center">
                <h1 className="text-3xl font-bold text-cyan-300 hebrew-font sm:text-4xl">Hebrew Letter River</h1>
                <p id="modal-subtitle" className="text-sm text-slate-400 sm:text-base">
                  Drag the moving letter to the correct box!
                </p>
              </div>

              <p className="text-center text-base text-slate-300 sm:text-lg">Choose what you want to practice:</p>

              <div className="mx-auto grid max-w-2xl gap-3 sm:grid-cols-2">
                <label className="setup-label cursor-pointer">
                  <input type="radio" name="gameMode" value="letters" defaultChecked className="hidden" />
                  <div className="flex h-full flex-col rounded-2xl border-2 border-slate-600 bg-slate-800/70 p-4 transition hover:border-cyan-400/80">
                    <span className="text-base font-semibold text-white sm:text-lg">Letters Only</span>
                    <p className="mt-1 text-sm text-slate-400">Master the 22 core letters.</p>
                  </div>
                </label>
                <label className="setup-label cursor-pointer">
                  <input type="radio" name="gameMode" value="vowels1" className="hidden" />
                  <div className="flex h-full flex-col rounded-2xl border-2 border-slate-600 bg-slate-800/70 p-4 transition hover:border-cyan-400/80">
                    <span className="text-base font-semibold text-white sm:text-lg">'A' &amp; 'O' Vowels</span>
                    <p className="mt-1 text-sm text-slate-400">Practice Patach and Holam.</p>
                  </div>
                </label>
                <label className="setup-label cursor-pointer">
                  <input type="radio" name="gameMode" value="vowels2" className="hidden" />
                  <div className="flex h-full flex-col rounded-2xl border-2 border-slate-600 bg-slate-800/70 p-4 transition hover:border-cyan-400/80">
                    <span className="text-base font-semibold text-white sm:text-lg">'E' &amp; 'I' Vowels</span>
                    <p className="mt-1 text-sm text-slate-400">Practice Segol and Hirik.</p>
                  </div>
                </label>
                <label className="setup-label cursor-pointer">
                  <input type="radio" name="gameMode" value="expert" className="hidden" />
                  <div className="flex h-full flex-col rounded-2xl border-2 border-slate-600 bg-slate-800/70 p-4 transition hover:border-cyan-400/80">
                    <span className="text-base font-semibold text-white sm:text-lg">Expert Mode</span>
                    <p className="mt-1 text-sm text-slate-400">Mix of letters &amp; vowels.</p>
                  </div>
                </label>
              </div>
            </div>

            <div id="game-over-view" className="hidden text-center">
              <h2 className="mb-4 text-4xl font-bold text-cyan-400 hebrew-font">Game Over</h2>
              <div className="learning-summary-container my-6" />
            </div>

            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <button
                id="start-button"
                className="w-full rounded-full bg-cyan-500 px-6 py-3 text-base font-semibold text-slate-900 transition hover:bg-cyan-400 sm:w-auto sm:text-lg"
              >
                Start Game
              </button>
              <button
                id="install-btn"
                className="hidden rounded-full bg-yellow-400 px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-yellow-300"
              >
                Install App
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
          <h3 className="mb-4 text-center text-lg font-semibold text-cyan-400">Accessibility Options</h3>
          <div className="space-y-4 text-sm text-slate-300">
            <label className="flex items-center justify-between">
              <span>Show Introductions</span>
              <input id="toggle-introductions" type="checkbox" className="h-5 w-5 rounded border-slate-600 bg-slate-700 text-cyan-400 focus:ring-cyan-500" defaultChecked />
            </label>
            <label className="flex items-center justify-between">
              <span>High Contrast Mode</span>
              <input id="high-contrast-toggle" type="checkbox" className="h-5 w-5 rounded border-slate-600 bg-slate-700 text-cyan-400 focus:ring-cyan-500" />
            </label>
            <label className="flex items-center justify-between">
              <span>Reduced Motion</span>
              <input id="reduced-motion-toggle" type="checkbox" className="h-5 w-5 rounded border-slate-600 bg-slate-700 text-cyan-400 focus:ring-cyan-500" />
            </label>
            <div>
              <label htmlFor="game-speed-slider" className="text-sm text-slate-300">
                Game Speed (<span id="speed-label">Normal</span>)
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
