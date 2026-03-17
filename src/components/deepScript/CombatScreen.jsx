import React, { useReducer, useCallback, useEffect, useMemo } from 'react';
import {
  combatReducer,
  createCombatState,
  ACTIONS,
  generateLetters,
  createLetterTile,
} from './deepScriptEngine.js';
import { getGearById } from '../../data/deepScript/gear.js';
import RunStatusBar from './RunStatusBar.jsx';

/**
 * CombatScreen — the core gameplay screen.
 * Manages combat state via useReducer and the combatReducer.
 */
export default function CombatScreen({ wordId, runState, onEnd, isMiniboss }) {
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

  // Handle combat end
  useEffect(() => {
    if (combat?.phase === 'victory') {
      const timer = setTimeout(() => onEnd('victory', wordId), 1500);
      return () => clearTimeout(timer);
    }
    if (combat?.phase === 'defeat') {
      const timer = setTimeout(() => onEnd('defeat', wordId), 1500);
      return () => clearTimeout(timer);
    }
  }, [combat?.phase, onEnd, wordId]);

  const handleSlotClick = useCallback((slotIndex) => {
    if (!combat.selectedTrayTile && !combat.selectedSatchelTile) return;
    dispatch({ type: ACTIONS.PLACE_LETTER, slotIndex });
  }, [combat?.selectedTrayTile, combat?.selectedSatchelTile]);

  const handleTrayClick = useCallback((tileId) => {
    dispatch({ type: ACTIONS.SELECT_TRAY_TILE, tileId });
  }, []);

  const handleSatchelClick = useCallback((tileId) => {
    dispatch({ type: ACTIONS.SELECT_SATCHEL_TILE, tileId });
  }, []);

  const handleStow = useCallback(() => {
    dispatch({ type: ACTIONS.STOW_LETTER });
  }, []);

  const handleRetrieve = useCallback(() => {
    dispatch({ type: ACTIONS.RETRIEVE_FROM_SATCHEL });
  }, []);

  const handleBurn = useCallback(() => {
    dispatch({ type: ACTIONS.BURN_LETTER, burnBonus: runState.upgrades?.burnBonus });
  }, [runState]);

  const handleEndTurn = useCallback(() => {
    dispatch({ type: ACTIONS.END_TURN, genAccuracy: runState.upgrades?.genAccuracy || 0 });
  }, [runState]);

  const handleUseGear = useCallback((gearId) => {
    dispatch({ type: ACTIONS.USE_GEAR, gearId, runState });
  }, [runState]);

  const handlePickChoice = useCallback((letter) => {
    dispatch({ type: ACTIONS.PICK_CHOICE, letter });
  }, []);

  if (!combat) return <div className="ds-screen">Loading...</div>;

  const word = combat.word;
  const pressurePercent = (combat.pressure / combat.maxPressure) * 100;

  return (
    <div className="ds-screen ds-combat">
      <RunStatusBar runState={runState} />

      {/* Enemy / Clue Panel */}
      <div className={`ds-clue-panel ${isMiniboss ? 'ds-clue-panel--boss' : ''}`}>
        {isMiniboss && <div className="ds-boss-label">GUARDIAN</div>}
        <div className="ds-clue-english">{word.english}</div>
        <div className="ds-clue-translit">{word.transliteration}</div>
      </div>

      {/* Pressure Track */}
      <div className="ds-pressure-track">
        <div className="ds-pressure-label">
          Pressure {combat.pressure}/{combat.maxPressure}
        </div>
        <div className="ds-pressure-bar">
          <div
            className={`ds-pressure-fill ${combat.pressure >= combat.maxPressure - 1 ? 'ds-pressure-fill--danger' : ''}`}
            style={{ width: `${pressurePercent}%` }}
          />
        </div>
      </div>

      {/* Answer Track (RTL) */}
      <div className="ds-answer-track" dir="rtl">
        {combat.answerTrack.map((slot, index) => {
          const placed = slot.placedTile;
          const revealed = slot.revealed;
          const correct = slot.correct;
          const hasSelection = combat.selectedTrayTile || combat.selectedSatchelTile;

          let slotCls = 'ds-answer-slot';
          if (correct) slotCls += ' ds-answer-slot--correct';
          else if (placed) slotCls += ' ds-answer-slot--wrong';
          else if (hasSelection) slotCls += ' ds-answer-slot--target';

          return (
            <button
              key={index}
              type="button"
              className={slotCls}
              onClick={() => handleSlotClick(index)}
              disabled={correct || combat.phase !== 'active'}
            >
              {correct ? (
                <span className="ds-slot-letter">{slot.targetLetter}</span>
              ) : revealed ? (
                <span className="ds-slot-hint">{slot.targetLetter}</span>
              ) : (
                <span className="ds-slot-empty">_</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Choice Bundle Modal */}
      {combat.choiceBundle && (
        <div className="ds-choice-overlay">
          <div className="ds-choice-modal">
            <h3 className="ds-choice-title">Choose a Letter</h3>
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

      {/* Tray */}
      <div className="ds-tray-section">
        <div className="ds-section-label">
          Tray ({combat.tray.length}/{runState.traySize})
        </div>
        <div className="ds-tray">
          {combat.tray.map(tile => {
            let tileCls = 'ds-tile';
            if (tile.faded) tileCls += ' ds-tile--faded';
            if (combat.selectedTrayTile === tile.id) tileCls += ' ds-tile--selected';
            return (
              <button
                key={tile.id}
                type="button"
                className={tileCls}
                onClick={() => handleTrayClick(tile.id)}
                disabled={combat.phase !== 'active'}
              >
                {tile.letter}
              </button>
            );
          })}
          {/* Empty slots */}
          {Array.from({ length: Math.max(0, runState.traySize - combat.tray.length) }).map((_, i) => (
            <div key={`empty-${i}`} className="ds-tile ds-tile--empty" />
          ))}
        </div>
      </div>

      {/* Satchel */}
      <div className="ds-satchel-section">
        <div className="ds-section-label">
          Satchel ({combat.satchel.length}/{runState.satchelSize})
        </div>
        <div className="ds-satchel">
          {combat.satchel.map(tile => {
            let tileCls = 'ds-tile ds-tile--satchel';
            if (combat.selectedSatchelTile === tile.id) tileCls += ' ds-tile--selected';
            return (
              <button
                key={tile.id}
                type="button"
                className={tileCls}
                onClick={() => handleSatchelClick(tile.id)}
                disabled={combat.phase !== 'active'}
              >
                {tile.letter}
              </button>
            );
          })}
          {Array.from({ length: Math.max(0, runState.satchelSize - combat.satchel.length) }).map((_, i) => (
            <div key={`empty-s-${i}`} className="ds-tile ds-tile--empty ds-tile--satchel-empty" />
          ))}
        </div>
      </div>

      {/* Action Bar */}
      <div className="ds-action-bar">
        {combat.selectedTrayTile && !combat.tray.find(t => t.id === combat.selectedTrayTile)?.faded && (
          <button
            type="button"
            className="ds-action-btn ds-action-stow"
            onClick={handleStow}
            disabled={combat.satchel.length >= runState.satchelSize}
          >
            Stow
          </button>
        )}
        {combat.selectedTrayTile && (
          <button type="button" className="ds-action-btn ds-action-burn" onClick={handleBurn}>
            Burn
          </button>
        )}
        {combat.selectedSatchelTile && (
          <button
            type="button"
            className="ds-action-btn ds-action-retrieve"
            onClick={handleRetrieve}
            disabled={combat.tray.length >= runState.traySize}
          >
            Retrieve
          </button>
        )}
      </div>

      {/* Gear Bar */}
      <div className="ds-gear-bar">
        {runState.gearIds.map(gearId => {
          const gear = getGearById(gearId);
          const gs = combat.gearStates[gearId];
          if (!gear || !gs) return null;

          const onCooldown = gs.currentCooldown > 0;
          const noUses = gs.usesRemaining === 0;
          const disabled = onCooldown || noUses || combat.phase !== 'active';

          // Special: some gear requires a selection
          const needsSelection = gear.invokeCost > 0 || gear.type === 'duplicate' || gear.type === 'transform';
          const hasSelection = combat.selectedTrayTile || combat.selectedSatchelTile;

          let gearCls = 'ds-gear-btn';
          if (onCooldown) gearCls += ' ds-gear-btn--cooldown';
          if (noUses) gearCls += ' ds-gear-btn--depleted';

          return (
            <button
              key={gearId}
              type="button"
              className={gearCls}
              onClick={() => handleUseGear(gearId)}
              disabled={disabled || (needsSelection && !hasSelection)}
              title={`${gear.name}: ${gear.description}`}
            >
              <span className="ds-gear-icon">{gear.icon}</span>
              <span className="ds-gear-name">{gear.name}</span>
              {onCooldown && <span className="ds-gear-cd">{gs.currentCooldown}</span>}
              {gs.usesRemaining >= 0 && (
                <span className="ds-gear-uses">{gs.usesRemaining}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* End Turn Button */}
      <div className="ds-turn-bar">
        <button
          type="button"
          className="ds-end-turn-btn"
          onClick={handleEndTurn}
          disabled={combat.phase !== 'active'}
        >
          End Turn — Draw Letters
        </button>
      </div>

      {/* Phase Overlay */}
      {combat.phase === 'victory' && (
        <div className="ds-phase-overlay ds-phase-victory">
          <div className="ds-phase-message">Word Complete!</div>
          <div className="ds-phase-word" dir="rtl">{word.hebrew}</div>
        </div>
      )}
      {combat.phase === 'defeat' && (
        <div className="ds-phase-overlay ds-phase-defeat">
          <div className="ds-phase-message">Overwhelmed...</div>
          <div className="ds-phase-word" dir="rtl">{word.hebrew} — {word.english}</div>
        </div>
      )}

      {/* Last log entry feedback */}
      {combat.log.length > 0 && (
        <div className="ds-log-toast">
          {combat.log[combat.log.length - 1].message || combat.log[combat.log.length - 1].type}
        </div>
      )}
    </div>
  );
}
