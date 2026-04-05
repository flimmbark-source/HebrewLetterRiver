import React, { useReducer, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  combatReducer,
  createCombatState,
  createLetterTile,
  ACTIONS,
} from './deepScriptEngine.js';
import { allDeepScriptLetters, getLetterPoolForWords } from '../../data/deepScript/words.js';
import { getNativeScript, getMeaning, getTextDirection, getVowelLetters, getVowelSymbol, getConsonantSymbol } from '../../lib/vocabLanguageAdapter.js';
import { celebrate } from '../../lib/celebration.js';
import {
  playSelect, playCorrect, playWrong,
  playGear, playVictory,
  playDefeat,
} from './dsSounds.js';
import { useFontSettings } from '../../hooks/useFontSettings.js';
import GuardianSigilEncounter from './GuardianSigilEncounter.jsx';

/**
 * CombatScreen — roguelike dungeon-crawler combat encounter.
 *
 * Layout (top to bottom):
 *   1. Top HUD: health and progress
 *   2. Dungeon viewport with encounter sigil + inscription slots
 *   3. Tray + Satchel tile row
 *   4. Ability cards row with tile sockets
 *   5. End Turn button
 */
export default function CombatScreen({
  wordId,
  runState,
  onEnd,
  isMiniboss,
  onOpenMenu,
  floorWords = [],
  onGuardianStrike = null,
  isPaused = false,
}) {
  const { getGameFontClass, getNativeScriptFontClass } = useFontSettings();
  const initialState = useMemo(() => {
    const state = createCombatState(wordId, {
      ...runState,
      maxTraySize: runState.traySize,
      maxSatchelSize: runState.satchelSize,
    });
    if (state) {
      state.maxTraySize = runState.traySize;
      state.maxSatchelSize = runState.satchelSize;
    }
    return state;
  }, [wordId, runState]);

  const [combat, dispatch] = useReducer(combatReducer, initialState);

  // Animation state
  const [justCorrectSlot, setJustCorrectSlot] = useState(null);
  const [justWrongSlot, setJustWrongSlot] = useState(null);
  const [activatingGear, setActivatingGear] = useState(null);
  const [spawnFxCounter, setSpawnFxCounter] = useState(0);
  const [recentTrayTiles, setRecentTrayTiles] = useState([]);
  const [overflowBursts, setOverflowBursts] = useState([]);
  const [nextCorrectBoost, setNextCorrectBoost] = useState(0);
  const prevPhaseRef = useRef(combat?.phase);
  const prevTrayIdsRef = useRef((combat?.tray || []).map(t => t.id));
  const prevLogLengthRef = useRef((combat?.log || []).length);
  const overflowTimersRef = useRef([]);

  useEffect(() => {
    return () => {
      overflowTimersRef.current.forEach(timerId => clearTimeout(timerId));
      overflowTimersRef.current = [];
    };
  }, []);

  // Handle combat end with sounds
  useEffect(() => {
    if (!combat) return;
    if (combat.phase === 'victory' && prevPhaseRef.current === 'active') {
      playVictory();
      celebrate({ particleCount: 100, spread: 80 });
    }
    if (combat.phase === 'defeat' && prevPhaseRef.current === 'active') {
      playDefeat();
    }
    prevPhaseRef.current = combat.phase;
  }, [combat?.phase]);

  // Handle combat end navigation
  useEffect(() => {
    if (combat?.phase === 'defeat') {
      const timer = setTimeout(() => onEnd('defeat', wordId), 1800);
      return () => clearTimeout(timer);
    }
  }, [combat?.phase, onEnd, wordId]);

  useEffect(() => {
    if (!isMiniboss || floorWords.length === 0) return;
    if ((runState?.health ?? 0) <= 0) {
      onEnd('defeat', wordId, { skipHealthPenalty: true });
    }
  }, [floorWords.length, isMiniboss, onEnd, runState?.health, wordId]);

  const handleProceed = useCallback(() => {
    onEnd('victory', wordId);
  }, [onEnd, wordId]);

  // Animation timeouts
  useEffect(() => {
    if (justCorrectSlot !== null) {
      const t = setTimeout(() => setJustCorrectSlot(null), 350);
      return () => clearTimeout(t);
    }
  }, [justCorrectSlot]);

  useEffect(() => {
    if (justWrongSlot !== null) {
      const t = setTimeout(() => setJustWrongSlot(null), 400);
      return () => clearTimeout(t);
    }
  }, [justWrongSlot]);

  useEffect(() => {
    if (activatingGear !== null) {
      const t = setTimeout(() => setActivatingGear(null), 300);
      return () => clearTimeout(t);
    }
  }, [activatingGear]);

  // ─── Handlers ─────────────────────────────────────────────

  const handleSlotClick = useCallback((slotIndex) => {
    if (!combat.selectedTrayTile && !combat.selectedSatchelTile) return;
    const tileId = combat.selectedTrayTile || combat.selectedSatchelTile;
    const tile = combat.tray.find(t => t.id === tileId) || combat.satchel.find(t => t.id === tileId);
    const slot = combat.answerTrack[slotIndex];
    if (tile && slot && !slot.correct && !slot.locked) {
      if (tile.letter === slot.targetLetter) {
        playCorrect();
        setJustCorrectSlot(slotIndex);
      } else {
        playWrong();
        setJustWrongSlot(slotIndex);
      }
    }
    dispatch({ type: ACTIONS.PLACE_LETTER, slotIndex, runState });
  }, [combat?.selectedTrayTile, combat?.selectedSatchelTile, combat?.tray, combat?.satchel, combat?.answerTrack, runState]);

  const handleTrayClick = useCallback((tileId) => {
    playSelect();
    dispatch({ type: ACTIONS.SELECT_TRAY_TILE, tileId });
  }, []);

  const wordLanguageId = combat?.word?.languageId || 'hebrew';
  const langVowels = useMemo(() => getVowelLetters(wordLanguageId), [wordLanguageId]);
  const hasVowelSplit = langVowels.length > 0;

  const handleProduceLetters = useCallback((kind) => {
    playGear();
    setActivatingGear(kind);
    const fullPool = combat?.letterPool || allDeepScriptLetters;
    const vowelPool = fullPool.filter(letter => langVowels.includes(letter));
    const consonantPool = fullPool.filter(letter => !langVowels.includes(letter));
    const pool = kind === 'vowel' ? (vowelPool.length > 0 ? vowelPool : fullPool) : (consonantPool.length > 0 ? consonantPool : fullPool);

    const remainingNeeded = combat.answerTrack
      .filter(slot => !slot.correct)
      .map(slot => slot.targetLetter)
      .filter(letter => pool.includes(letter));

    const generatedLetters = [];
    let generatedCorrect = false;

    const shouldForceCorrect = remainingNeeded.length > 0 && Math.random() < nextCorrectBoost;
    if (shouldForceCorrect) {
      const forced = remainingNeeded[Math.floor(Math.random() * remainingNeeded.length)];
      generatedLetters.push(forced);
      generatedCorrect = true;
    }

    while (generatedLetters.length < 1) {
      const letter = pool[Math.floor(Math.random() * pool.length)] || pool[0] || fullPool[0] || '?';
      generatedLetters.push(letter);
      if (!generatedCorrect && remainingNeeded.includes(letter)) {
        generatedCorrect = true;
      }
    }

    const generated = generatedLetters.map(letter => createLetterTile(letter, kind));
    setNextCorrectBoost(prev => {
      if (generatedCorrect) return 0;
      return Math.min(1, prev + (0.25 * generated.length));
    });

    dispatch({ type: ACTIONS.GENERATE_LETTERS, letters: generated, runState });
  }, [combat?.answerTrack, combat?.letterPool, langVowels, nextCorrectBoost, runState]);

  const handlePickChoice = useCallback((letter) => {
    playSelect();
    dispatch({ type: ACTIONS.PICK_CHOICE, letter, runState });
  }, []);

  useEffect(() => {
    if (!combat) return;
    const prevIds = prevTrayIdsRef.current;
    const nextIds = combat.tray.map(t => t.id);
    const added = combat.tray.filter(t => !prevIds.includes(t.id)).map(t => t.id);
    if (added.length > 0) {
      setRecentTrayTiles(added);
      setSpawnFxCounter(c => c + 1);
      const timer = setTimeout(() => setRecentTrayTiles([]), 500);
      prevTrayIdsRef.current = nextIds;
      return () => clearTimeout(timer);
    }
    prevTrayIdsRef.current = nextIds;
  }, [combat?.tray]);

  useEffect(() => {
    if (!combat) return;
    const prevLen = prevLogLengthRef.current || 0;
    const nextLog = combat.log || [];
    const newEntries = nextLog.slice(prevLen).filter(entry => entry.type === 'overflow_burst');
    if (newEntries.length > 0) {
      const burstDamage = newEntries.reduce((sum, entry) => sum + (entry.damage || 1), 0);
      const burstItems = newEntries.map((entry, idx) => ({
        id: `overflow-${Date.now()}-${idx}`,
        letter: entry.letter,
      }));
      setOverflowBursts(prev => [...prev, ...burstItems]);
      const damageTimer = setTimeout(() => {
        dispatch({ type: ACTIONS.RESOLVE_OVERFLOW_BURSTS, damage: burstDamage });
        overflowTimersRef.current = overflowTimersRef.current.filter(id => id !== damageTimer);
      }, 2100);
      const timer = setTimeout(() => {
        setOverflowBursts(prev => prev.filter(item => !burstItems.some(b => b.id === item.id)));
        overflowTimersRef.current = overflowTimersRef.current.filter(id => id !== timer);
      }, 2400);
      overflowTimersRef.current.push(damageTimer, timer);
      prevLogLengthRef.current = nextLog.length;
    }
    prevLogLengthRef.current = nextLog.length;
  }, [combat?.log]);

  if (!combat) return <div className="ds-screen">Loading...</div>;
  const isGuardianSigil = isMiniboss && floorWords.length > 0;

  const word = combat.word;
  const completedSlots = combat.answerTrack.filter(s => s.correct).length;
  const totalSlots = combat.answerTrack.length;

  // Health pips
  const healthPips = [];
  const maxHealth = runState?.maxHealth ?? combat.maxHealth;
  const activeHealth = runState?.health ?? combat.health;
  for (let i = 0; i < maxHealth; i++) {
    healthPips.push(i < activeHealth);
  }

  // Tile action availability
  const hasSelection = combat.selectedTrayTile;
  const latestLogEntry = [...combat.log].reverse().find(entry => entry.type !== 'overflow_burst');

  return (
    <div className="ds-combat-screen">
      {/* ═══ TOP HUD — health left, progress right ═══ */}
      <div className="ds-top-hud">
        <div className="ds-hud-left">
          <button type="button" className="ds-hamburger-btn" onClick={onOpenMenu} aria-label="Open game menu">
            ☰
          </button>
          <div className="ds-hud-health">
            {healthPips.map((full, i) => (
              <span key={i} className={`ds-hud-pip ${full ? 'ds-hud-pip--full' : 'ds-hud-pip--empty'}`} />
            ))}
          </div>
        </div>

        <div className="ds-hud-progress">
          <span className="ds-hud-progress-text">
            {isGuardianSigil ? '⚔ Battle' : `${completedSlots}/${totalSlots}`}
          </span>
        </div>
      </div>

      {/* ═══ DUNGEON VIEWPORT ═══ */}
      <div className="ds-viewport">
        <div className="ds-dungeon-room">
          <div className="ds-dungeon-floor" />
          <div className="ds-dungeon-wall-left" />
          <div className="ds-dungeon-wall-right" />
          <div className="ds-dungeon-ceiling" />
          <div className="ds-dungeon-back-wall">
            <div className="ds-dungeon-doorway ds-dungeon-doorway--left" />
            <div className="ds-dungeon-doorway ds-dungeon-doorway--right" />
          </div>

          <div className="ds-torch ds-torch--left">
            <div className="ds-torch-flame" />
          </div>
          <div className="ds-torch ds-torch--right">
            <div className="ds-torch-flame" />
          </div>

          {isGuardianSigil ? (
            <GuardianSigilEncounter
              words={floorWords}
              getGameFontClass={getGameFontClass}
              getNativeScriptFontClass={getNativeScriptFontClass}
              onDamage={(damage) => onGuardianStrike?.(damage)}
              onVictory={() => onEnd('victory', wordId)}
              paused={isPaused}
            />
          ) : (
            <>
              {/* ═══ ENCOUNTER ═══ */}
              <div className={`ds-encounter ${isMiniboss ? 'ds-encounter--boss' : ''}`}>
                {isMiniboss && <div className="ds-encounter-boss-glow" />}
                <div className="ds-encounter-sigil">
                  <div className="ds-encounter-rune-ring" />
                  <div className="ds-encounter-clue">
                    <span className={`ds-encounter-english ${getGameFontClass(`${word.id}-english`)}`}>{getMeaning(word)}</span>
                    <span className={`ds-encounter-translit ${getGameFontClass(`${word.id}-translit`)}`}>{word.transliteration}</span>
                  </div>
                </div>

                {/* Inscription slots */}
                <div className="ds-inscription" dir={getTextDirection(word.languageId || 'hebrew')}>
                  {combat.answerTrack.map((slot, index) => {
                    let slotCls = 'ds-rune-slot';
                    if (slot.correct) {
                      slotCls += ' ds-rune-slot--correct';
                      if (justCorrectSlot === index) slotCls += ' ds-rune-slot--just-correct';
                    } else if (slot.locked) {
                      slotCls += ' ds-rune-slot--locked';
                    } else if (justWrongSlot === index) {
                      slotCls += ' ds-rune-slot--just-wrong';
                    } else if (hasSelection && !slot.correct && !slot.locked) {
                      slotCls += ' ds-rune-slot--target';
                    }

                    return (
                      <button
                        key={index}
                        type="button"
                        className={slotCls}
                        onClick={() => handleSlotClick(index)}
                        disabled={slot.correct || slot.locked || combat.phase !== 'active'}
                      >
                        {slot.correct ? (
                          <span className={`ds-rune-letter ${getNativeScriptFontClass(`${word.id}-rune-${index}`, word.languageId)}`}>{slot.targetLetter}</span>
                        ) : slot.locked ? (
                          <span className="ds-rune-lock">🔒</span>
                        ) : slot.revealed ? (
                          <span className={`ds-rune-hint ${getNativeScriptFontClass(`${word.id}-hint-${index}`, word.languageId)}`}>{slot.targetLetter}</span>
                        ) : (
                          <span className="ds-rune-empty" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {!isGuardianSigil && <div className="ds-combat-controls">
        <div className="ds-tray-end-labels">
        </div>
        <div className="ds-tile-row ds-tile-row--solo">
          <div className="ds-inv-tray">
            <div className="ds-inv-label">Letter Tray</div>
            <div className="ds-inv-tiles ds-inv-tiles--flow">
              {combat.tray.map(tile => {
                let tileCls = 'ds-inv-tile';
                if (tile.cursed) tileCls += ' ds-inv-tile--cursed';
                if (combat.selectedTrayTile === tile.id) tileCls += ' ds-inv-tile--selected';
                if (recentTrayTiles.includes(tile.id)) tileCls += ' ds-inv-tile--spawned';
                return (
                  <button
                    key={tile.id}
                    type="button"
                    className={tileCls}
                    onClick={() => handleTrayClick(tile.id)}
                    disabled={combat.phase !== 'active'}
                  >
                    <span className={getNativeScriptFontClass(tile.id, word.languageId)}>{tile.letter}</span>
                  </button>
                );
              })}
              {Array.from({ length: Math.max(0, runState.traySize - combat.tray.length) }).map((_, i) => (
                <div key={`e-${i}`} className="ds-inv-tile ds-inv-tile--empty" />
              ))}
              <div className="spacer" />
            </div>
          </div>
        </div>

        {/* ═══ ABILITIES — letter generation buttons ═══ */}
        <div className="ds-ability-row ds-ability-row--dual">
          <div className="ds-ability-spawn-fx" key={`spawn-fx-${spawnFxCounter}`} />
          {hasVowelSplit ? (
            <>
              <button
                type="button"
                className={`ds-ability-card ds-ability-card--mega ds-ability-card--ready ${activatingGear === 'consonant' ? 'ds-ability-card--activating' : ''}`}
                onClick={() => handleProduceLetters('consonant')}
                disabled={combat.phase !== 'active'}
              >
                <div className="ds-ability-icon-center">{getConsonantSymbol(wordLanguageId)}</div>
                <div className="ds-ability-effect">Consonants</div>
              </button>

              <button
                type="button"
                className={`ds-ability-card ds-ability-card--mega ds-ability-card--ready ${activatingGear === 'vowel' ? 'ds-ability-card--activating' : ''}`}
                onClick={() => handleProduceLetters('vowel')}
                disabled={combat.phase !== 'active'}
              >
                <div className="ds-ability-icon-center">{getVowelSymbol(wordLanguageId)}</div>
                <div className="ds-ability-effect">Vowels</div>
              </button>
            </>
          ) : (
            <button
              type="button"
              className={`ds-ability-card ds-ability-card--mega ds-ability-card--ready ${activatingGear === 'consonant' ? 'ds-ability-card--activating' : ''}`}
              onClick={() => handleProduceLetters('consonant')}
              disabled={combat.phase !== 'active'}
            >
              <div className="ds-ability-icon-center">◌</div>
              <div className="ds-ability-effect">Generate Letter</div>
            </button>
          )}
        </div>
      </div>}

      {/* Choice Bundle Modal */}
      {!isGuardianSigil && overflowBursts.map((burst, index) => {
        const lane = (index % 5) - 2; // -2, -1, 0, 1, 2
        const columnOffset = lane * 28;
        const rowOffset = Math.floor(index / 5) * 24;
        return (
          <div
            key={burst.id}
            className="ds-overflow-shot"
            style={{
              left: `calc(50% + ${columnOffset}px)`,
              bottom: `calc(70px + env(safe-area-inset-bottom, 0px) + ${rowOffset}px)`,
            }}
            aria-hidden="true"
          >
            <span className="ds-overflow-shot-letter">{burst.letter}</span>
            <span className="ds-overflow-shot-hit"></span>
            <span className="ds-overflow-shot-burst" />
            <span className="ds-overflow-shot-shard ds-overflow-shot-shard--a" />
            <span className="ds-overflow-shot-shard ds-overflow-shot-shard--b" />
            <span className="ds-overflow-shot-shard ds-overflow-shot-shard--c" />
            <span className="ds-overflow-shot-shard ds-overflow-shot-shard--d" />
          </div>
        );
      })}

      {!isGuardianSigil && combat.choiceBundle && (
        <div className="ds-choice-overlay">
          <div className="ds-choice-modal">
            <h3 className="ds-choice-title">Choose a Rune</h3>
            <div className="ds-choice-options">
              {combat.choiceBundle.map((letter, i) => (
                <button
                  key={i}
                  type="button"
                  className="ds-choice-btn"
                  onClick={() => handlePickChoice(letter)}
                >
                  {letter}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Phase Overlays */}
      {!isGuardianSigil && combat.phase === 'victory' && (
        <div className="ds-phase-overlay ds-phase-victory">
          <div className="ds-phase-message">Word Vanquished!</div>
          <div className={`ds-phase-word ${getNativeScriptFontClass(`${word.id}-phase-hebrew`, word.languageId)}`} dir={getTextDirection(word.languageId || 'hebrew')}>{getNativeScript(word)}</div>
          {getMeaning(word) && (
            <div className={`ds-phase-translation ${getGameFontClass(`${word.id}-phase-translation`)}`}>{getMeaning(word)}</div>
          )}
          <button
            type="button"
            className="ds-phase-proceed-btn"
            onClick={handleProceed}
          >
            Proceed
          </button>
        </div>
      )}
      {!isGuardianSigil && combat.phase === 'defeat' && (
        <div className="ds-phase-overlay ds-phase-defeat">
          <div className="ds-phase-message">Overwhelmed...</div>
          <div className={`ds-phase-word ${getNativeScriptFontClass(`${word.id}-defeat`, word.languageId)}`} dir={getTextDirection(word.languageId || 'hebrew')}>{getNativeScript(word)} — {getMeaning(word)}</div>
        </div>
      )}

      {/* Log toast */}
      {!isGuardianSigil && latestLogEntry && (
        <div className="ds-log-toast" key={combat.log.length}>
          {latestLogEntry.message || latestLogEntry.type}
        </div>
      )}
    </div>
  );
}
