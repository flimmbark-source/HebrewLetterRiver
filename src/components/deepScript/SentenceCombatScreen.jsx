import React, { useReducer, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  sentenceCombatReducer,
  createSentenceCombatState,
  SENTENCE_ACTIONS,
} from './sentenceCombatEngine.js';
import { getTextDirection } from '../../lib/vocabLanguageAdapter.js';
import { getConnectorInfo } from '../../data/deepScript/sentenceConnectors.js';
import { celebrate } from '../../lib/celebration.js';
import {
  playSelect, playCorrect, playWrong,
  playGear, playVictory, playDefeat,
} from './dsSounds.js';
import { useFontSettings } from '../../hooks/useFontSettings.js';

/**
 * SentenceCombatScreen — Deep Script sentence-mode battle.
 *
 * Adapted from CombatScreen. Layout (top to bottom):
 *   1. Top HUD: health and progress
 *   2. Dungeon viewport with translation prompt + word slots
 *   3. Word block tray
 *   4. Two generation buttons: Pack Words / Connector Words
 */
export default function SentenceCombatScreen({
  encounter,
  runState,
  onEnd,
  onOpenMenu,
  isFinalEncounter = false,
  isPaused = false,
  encounterProgress = '',
}) {
  const { getGameFontClass, getNativeScriptFontClass } = useFontSettings();

  const initialState = useMemo(
    () => createSentenceCombatState(encounter, runState),
    [encounter, runState]
  );

  const [combat, dispatch] = useReducer(sentenceCombatReducer, initialState);

  // Animation state
  const [justCorrectSlot, setJustCorrectSlot] = useState(null);
  const [justWrongSlot, setJustWrongSlot] = useState(null);
  const [activatingButton, setActivatingButton] = useState(null);
  const [recentTrayTiles, setRecentTrayTiles] = useState([]);
  // Tap-to-peek: shows connector meaning above a slot when tapped with no
  // tile selected. Auto-clears after a short delay.
  const [peekSlotIndex, setPeekSlotIndex] = useState(null);
  const prevPhaseRef = useRef(combat?.phase);
  const prevTrayIdsRef = useRef((combat?.tray || []).map(t => t.id));

  // Handle phase transitions (victory/defeat sounds)
  useEffect(() => {
    if (!combat) return;
    if (combat.phase === 'victory' && prevPhaseRef.current === 'active') {
      playVictory();
      celebrate({ particleCount: 80, spread: 70 });
    }
    if (combat.phase === 'defeat' && prevPhaseRef.current === 'active') {
      playDefeat();
    }
    prevPhaseRef.current = combat.phase;
  }, [combat?.phase]);

  // Auto-navigate on defeat
  useEffect(() => {
    if (combat?.phase === 'defeat') {
      const timer = setTimeout(() => onEnd('defeat'), 1800);
      return () => clearTimeout(timer);
    }
  }, [combat?.phase, onEnd]);

  // Track new tray tiles for spawn animation
  useEffect(() => {
    if (!combat) return;
    const prevIds = prevTrayIdsRef.current;
    const nextIds = combat.tray.map(t => t.id);
    const added = combat.tray.filter(t => !prevIds.includes(t.id)).map(t => t.id);
    if (added.length > 0) {
      setRecentTrayTiles(added);
      const timer = setTimeout(() => setRecentTrayTiles([]), 500);
      prevTrayIdsRef.current = nextIds;
      return () => clearTimeout(timer);
    }
    prevTrayIdsRef.current = nextIds;
  }, [combat?.tray]);

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
    if (activatingButton !== null) {
      const t = setTimeout(() => setActivatingButton(null), 300);
      return () => clearTimeout(t);
    }
  }, [activatingButton]);

  // Clear peek popup after a short delay so it doesn't linger
  useEffect(() => {
    if (peekSlotIndex !== null) {
      const t = setTimeout(() => setPeekSlotIndex(null), 2200);
      return () => clearTimeout(t);
    }
  }, [peekSlotIndex]);

  // ─── Handlers ─────────────────────────────────────────────

  const handleSlotClick = useCallback((slotIndex) => {
    // No tile selected → treat tap as a "peek" request. For connector slots
    // we reveal the English meaning as a small tooltip above the slot so the
    // player can learn the glue word in context without leaving the screen.
    if (!combat.selectedTileId) {
      const slot = combat.wordSlots[slotIndex];
      if (slot && !slot.correct && slot.source === 'connector') {
        playSelect();
        setPeekSlotIndex(slotIndex);
      }
      return;
    }
    const tile = combat.tray.find(t => t.id === combat.selectedTileId);
    const slot = combat.wordSlots[slotIndex];
    if (tile && slot && !slot.correct) {
      if (tile.word === slot.targetWord) {
        playCorrect();
        setJustCorrectSlot(slotIndex);
      } else {
        playWrong();
        setJustWrongSlot(slotIndex);
      }
    }
    dispatch({ type: SENTENCE_ACTIONS.PLACE_WORD, slotIndex });
  }, [combat?.selectedTileId, combat?.tray, combat?.wordSlots]);

  const handleTileClick = useCallback((tileId) => {
    playSelect();
    dispatch({ type: SENTENCE_ACTIONS.SELECT_TILE, tileId });
  }, []);

  const handleGenerateWord = useCallback((source) => {
    playGear();
    setActivatingButton(source);
    dispatch({ type: SENTENCE_ACTIONS.GENERATE_WORD, source });
  }, []);

  const handleProceed = useCallback(() => {
    onEnd('victory');
  }, [onEnd]);

  if (!combat) return <div className="ds-screen">Loading...</div>;

  const completedSlots = combat.wordSlots.filter(s => s.correct).length;
  const totalSlots = combat.wordSlots.length;
  const hasSelection = !!combat.selectedTileId;
  const langId = combat.languageId || 'hebrew';
  const targetSentence = combat.wordSlots.map(slot => slot.targetWord).join(' ');

  // Health pips
  const healthPips = [];
  const maxHealth = combat.maxHealth;
  const activeHealth = combat.health;
  for (let i = 0; i < maxHealth; i++) {
    healthPips.push(i < activeHealth);
  }

  return (
    <div className="ds-combat-screen">
      {/* ═══ TOP HUD ═══ */}
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
            {encounterProgress || `${completedSlots}/${totalSlots}`}
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

          {/* ═══ SENTENCE ENCOUNTER ═══ */}
          <div className={`ds-encounter ${isFinalEncounter ? 'ds-encounter--boss' : ''}`}>
            {isFinalEncounter && <div className="ds-encounter-boss-glow" />}
            <div className="ds-encounter-sigil">
              <div className="ds-encounter-rune-ring" />
              <div className="ds-encounter-clue">
                <span className={`ds-encounter-english ${getGameFontClass('sentence-translation')}`}>
                  {combat.translation}
                </span>
              </div>
            </div>

            {/* Word slots (sentence inscription) */}
            <div className="ds-inscription ds-inscription--sentence" dir={getTextDirection(langId)}>
              {combat.wordSlots.map((slot, index) => {
                let slotCls = 'ds-rune-slot ds-rune-slot--word';
                if (slot.source === 'connector') slotCls += ' ds-rune-slot--connector';
                if (slot.correct) {
                  slotCls += ' ds-rune-slot--correct';
                  if (justCorrectSlot === index) slotCls += ' ds-rune-slot--just-correct';
                } else if (justWrongSlot === index) {
                  slotCls += ' ds-rune-slot--just-wrong';
                } else if (hasSelection && !slot.correct) {
                  slotCls += ' ds-rune-slot--target';
                }

                const connectorInfo =
                  !slot.correct && slot.source === 'connector'
                    ? getConnectorInfo(slot.targetWord, langId)
                    : null;
                const showPeek = peekSlotIndex === index && connectorInfo;

                return (
                  <button
                    key={index}
                    type="button"
                    className={slotCls}
                    onClick={() => handleSlotClick(index)}
                    disabled={slot.correct || combat.phase !== 'active'}
                    aria-label={
                      connectorInfo
                        ? `Connector slot: tap to reveal meaning`
                        : undefined
                    }
                  >
                    {slot.correct ? (
                      <span className={`ds-rune-letter ds-rune-letter--word ${getNativeScriptFontClass(`sent-slot-${index}`, langId)}`}>
                        {slot.targetWord}
                      </span>
                    ) : (
                      <span className="ds-rune-empty ds-rune-empty--word">
                        {slot.source === 'pack' ? '▪' : '·'}
                      </span>
                    )}
                    {showPeek && (
                      <span className="ds-peek-tooltip" dir="ltr" role="tooltip">
                        <span className="ds-peek-tooltip-meaning">
                          {connectorInfo.meaning}
                        </span>
                        <span className="ds-peek-tooltip-translit">
                          {connectorInfo.transliteration}
                        </span>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ═══ COMBAT CONTROLS ═══ */}
      <div className="ds-combat-controls ds-combat-controls--sentence">
        {/* Word block tray */}
        <div className="ds-tile-row ds-tile-row--solo">
          <div className="ds-inv-tray">
            <div className="ds-inv-label">Word Blocks</div>
            <div className="ds-inv-tiles ds-inv-tiles--flow ds-inv-tiles--words">
              {combat.tray.map(tile => {
                let tileCls = 'ds-inv-tile ds-inv-tile--word';
                if (tile.source === 'connector') tileCls += ' ds-inv-tile--connector';
                if (combat.selectedTileId === tile.id) tileCls += ' ds-inv-tile--selected';
                if (recentTrayTiles.includes(tile.id)) tileCls += ' ds-inv-tile--spawned';
                return (
                  <button
                    key={tile.id}
                    type="button"
                    className={tileCls}
                    onClick={() => handleTileClick(tile.id)}
                    disabled={combat.phase !== 'active'}
                  >
                    <span className={getNativeScriptFontClass(tile.id, langId)}>{tile.word}</span>
                  </button>
                );
              })}
              {Array.from({ length: Math.max(0, combat.maxTraySize - combat.tray.length) }).map((_, i) => (
                <div key={`e-${i}`} className="ds-inv-tile ds-inv-tile--empty ds-inv-tile--word" />
              ))}
            </div>
          </div>
        </div>

        {/* ═══ TWO GENERATION BUTTONS: Pack Words / Connectors ═══ */}
        <div className="ds-ability-row ds-ability-row--dual">
          <button
            type="button"
            className={`ds-ability-card ds-ability-card--mega ds-ability-card--ready ${activatingButton === 'pack' ? 'ds-ability-card--activating' : ''}`}
            onClick={() => handleGenerateWord('pack')}
            disabled={combat.phase !== 'active'}
          >
            <div className="ds-ability-icon-center">
              <span className="material-symbols-outlined" style={{ fontSize: 22 }}>dictionary</span>
            </div>
            <div className="ds-ability-effect">Pack Words</div>
          </button>

          <button
            type="button"
            className={`ds-ability-card ds-ability-card--mega ds-ability-card--ready ${activatingButton === 'connector' ? 'ds-ability-card--activating' : ''}`}
            onClick={() => handleGenerateWord('connector')}
            disabled={combat.phase !== 'active'}
          >
            <div className="ds-ability-icon-center">
              <span className="material-symbols-outlined" style={{ fontSize: 22 }}>link</span>
            </div>
            <div className="ds-ability-effect">Connectors</div>
          </button>
        </div>
      </div>

      {/* ═══ Phase Overlays ═══ */}
      {combat.phase === 'victory' && (
        <div className="ds-phase-overlay ds-phase-victory">
          <div className="ds-phase-message">
            {isFinalEncounter ? 'Expedition Complete!' : 'Sentence Complete!'}
          </div>
          <div className={`ds-phase-word ${getGameFontClass('sentence-victory-translation')}`}>
            {combat.translation}
          </div>
          <div className={`ds-phase-word ds-phase-word--target ${getNativeScriptFontClass('sentence-victory-target', langId)}`}>
            {targetSentence}
          </div>

          {/* Word-by-word breakdown — teaches connectors after success */}
          <div
            className="ds-sentence-breakdown"
            dir={getTextDirection(langId)}
            aria-label="Word by word breakdown"
          >
            {combat.wordSlots.map((slot, index) => {
              const info =
                slot.source === 'connector'
                  ? getConnectorInfo(slot.targetWord, langId)
                  : null;
              const isConnector = slot.source === 'connector';
              return (
                <div
                  key={index}
                  className={`ds-breakdown-chip ${
                    isConnector
                      ? 'ds-breakdown-chip--connector'
                      : 'ds-breakdown-chip--pack'
                  }`}
                >
                  <span
                    className={`ds-breakdown-word ${getNativeScriptFontClass(`breakdown-${index}`, langId)}`}
                  >
                    {slot.targetWord}
                  </span>
                  {info ? (
                    <>
                      <span className="ds-breakdown-translit" dir="ltr">
                        {info.transliteration}
                      </span>
                      <span className="ds-breakdown-meaning" dir="ltr">
                        {info.meaning}
                      </span>
                    </>
                  ) : (
                    <span
                      className="ds-breakdown-meaning ds-breakdown-meaning--pack"
                      dir="ltr"
                    >
                      pack word
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <button
            type="button"
            className="ds-phase-proceed-btn"
            onClick={handleProceed}
          >
            {isFinalEncounter ? 'Finish' : 'Proceed'}
          </button>
        </div>
      )}
      {combat.phase === 'defeat' && (
        <div className="ds-phase-overlay ds-phase-defeat">
          <div className="ds-phase-message">Overwhelmed...</div>
          <div className={`ds-phase-word ${getGameFontClass('sentence-defeat-translation')}`}>
            {combat.translation}
          </div>
        </div>
      )}

    </div>
  );
}
