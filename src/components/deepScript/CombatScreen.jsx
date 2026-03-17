import React, { useReducer, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  combatReducer,
  createCombatState,
  ACTIONS,
  generateLetters,
  createLetterTile,
} from './deepScriptEngine.js';
import { getGearById } from '../../data/deepScript/gear.js';
import { celebrate } from '../../lib/celebration.js';
import {
  playSelect, playCorrect, playWrong, playBurn,
  playStow, playGear, playEndTurn, playVictory,
  playDefeat, playPressureWarning,
} from './dsSounds.js';

/**
 * CombatScreen — immersive dungeon-crawler combat encounter.
 * Central viewport with first-person dungeon room, compact edge HUD.
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

  // Animation state
  const [justCorrectSlot, setJustCorrectSlot] = useState(null);
  const [justWrongSlot, setJustWrongSlot] = useState(null);
  const [activatingGear, setActivatingGear] = useState(null);
  const [pressureCritical, setPressureCritical] = useState(false);
  const prevPhaseRef = useRef(combat?.phase);
  const prevPressureRef = useRef(combat?.pressure ?? 0);

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

  // Pressure warning sound
  useEffect(() => {
    if (!combat) return;
    if (combat.pressure > prevPressureRef.current && combat.pressure >= combat.maxPressure - 1) {
      playPressureWarning();
      setPressureCritical(true);
      const t = setTimeout(() => setPressureCritical(false), 300);
      return () => clearTimeout(t);
    }
    prevPressureRef.current = combat.pressure;
  }, [combat?.pressure, combat?.maxPressure]);

  // Handle combat end navigation
  useEffect(() => {
    if (combat?.phase === 'victory') {
      const timer = setTimeout(() => onEnd('victory', wordId), 1800);
      return () => clearTimeout(timer);
    }
    if (combat?.phase === 'defeat') {
      const timer = setTimeout(() => onEnd('defeat', wordId), 1800);
      return () => clearTimeout(timer);
    }
  }, [combat?.phase, onEnd, wordId]);

  // Clear animation classes
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

  const handleSlotClick = useCallback((slotIndex) => {
    if (!combat.selectedTrayTile && !combat.selectedSatchelTile) return;
    const tileId = combat.selectedTrayTile || combat.selectedSatchelTile;
    const tile = combat.tray.find(t => t.id === tileId) || combat.satchel.find(t => t.id === tileId);
    const slot = combat.answerTrack[slotIndex];
    if (tile && slot && !slot.correct) {
      if (tile.letter === slot.targetLetter) {
        playCorrect();
        setJustCorrectSlot(slotIndex);
      } else {
        playWrong();
        setJustWrongSlot(slotIndex);
      }
    }
    dispatch({ type: ACTIONS.PLACE_LETTER, slotIndex });
  }, [combat?.selectedTrayTile, combat?.selectedSatchelTile, combat?.tray, combat?.satchel, combat?.answerTrack]);

  const handleTrayClick = useCallback((tileId) => {
    playSelect();
    dispatch({ type: ACTIONS.SELECT_TRAY_TILE, tileId });
  }, []);

  const handleSatchelClick = useCallback((tileId) => {
    playSelect();
    dispatch({ type: ACTIONS.SELECT_SATCHEL_TILE, tileId });
  }, []);

  const handleStow = useCallback(() => {
    playStow();
    dispatch({ type: ACTIONS.STOW_LETTER });
  }, []);

  const handleRetrieve = useCallback(() => {
    playStow();
    dispatch({ type: ACTIONS.RETRIEVE_FROM_SATCHEL });
  }, []);

  const handleBurn = useCallback(() => {
    playBurn();
    dispatch({ type: ACTIONS.BURN_LETTER, burnBonus: runState.upgrades?.burnBonus });
  }, [runState]);

  const handleEndTurn = useCallback(() => {
    playEndTurn();
    dispatch({ type: ACTIONS.END_TURN, genAccuracy: runState.upgrades?.genAccuracy || 0 });
  }, [runState]);

  const handleUseGear = useCallback((gearId) => {
    playGear();
    setActivatingGear(gearId);
    dispatch({ type: ACTIONS.USE_GEAR, gearId, runState });
  }, [runState]);

  const handlePickChoice = useCallback((letter) => {
    playSelect();
    dispatch({ type: ACTIONS.PICK_CHOICE, letter });
  }, []);

  if (!combat) return <div className="ds-screen">Loading...</div>;

  const word = combat.word;
  const pressurePercent = (combat.pressure / combat.maxPressure) * 100;
  const hintEndTurn = combat.tray.length >= (runState.traySize - 1) && combat.phase === 'active';
  const completedSlots = combat.answerTrack.filter(s => s.correct).length;
  const totalSlots = combat.answerTrack.length;
  const progressPercent = (completedSlots / totalSlots) * 100;

  // Health pips for top HUD
  const healthPips = [];
  for (let i = 0; i < runState.maxHealth; i++) {
    healthPips.push(i < runState.health);
  }

  // Can the selected tile be stowed?
  const selectedTrayTile = combat.tray.find(t => t.id === combat.selectedTrayTile);
  const canStow = selectedTrayTile && !selectedTrayTile.faded && combat.satchel.length < runState.satchelSize;
  const canBurn = !!combat.selectedTrayTile;
  const canRetrieve = !!combat.selectedSatchelTile && combat.tray.length < runState.traySize;

  return (
    <div className="ds-combat-screen">
      {/* ═══ TOP HUD BAR ═══ */}
      <div className="ds-top-hud">
        <div className="ds-hud-health">
          {healthPips.map((full, i) => (
            <span key={i} className={`ds-hud-pip ${full ? 'ds-hud-pip--full' : 'ds-hud-pip--empty'}`} />
          ))}
        </div>

        <div className={`ds-hud-pressure ${pressureCritical ? 'ds-hud-pressure--critical' : ''}`}>
          <div className="ds-hud-pressure-label">TENSION</div>
          <div className="ds-hud-pressure-track">
            {Array.from({ length: combat.maxPressure }).map((_, i) => (
              <span
                key={i}
                className={`ds-hud-pressure-pip ${i < combat.pressure ? 'ds-hud-pressure-pip--filled' : ''} ${i === combat.maxPressure - 1 && combat.pressure >= combat.maxPressure - 1 ? 'ds-hud-pressure-pip--danger' : ''}`}
              />
            ))}
          </div>
        </div>

        <div className="ds-hud-progress">
          <span className="ds-hud-progress-text">{completedSlots}/{totalSlots}</span>
        </div>
      </div>

      {/* ═══ DUNGEON VIEWPORT ═══ */}
      <div className="ds-viewport">
        {/* Dungeon room layers */}
        <div className="ds-dungeon-room">
          <div className="ds-dungeon-floor" />
          <div className="ds-dungeon-wall-left" />
          <div className="ds-dungeon-wall-right" />
          <div className="ds-dungeon-ceiling" />
          <div className="ds-dungeon-back-wall">
            {/* Doorway arches to suggest passages */}
            <div className="ds-dungeon-doorway ds-dungeon-doorway--left" />
            <div className="ds-dungeon-doorway ds-dungeon-doorway--right" />
          </div>

          {/* Torches */}
          <div className="ds-torch ds-torch--left">
            <div className="ds-torch-flame" />
          </div>
          <div className="ds-torch ds-torch--right">
            <div className="ds-torch-flame" />
          </div>

          {/* ═══ ENCOUNTER — the enemy/word in the room ═══ */}
          <div className={`ds-encounter ${isMiniboss ? 'ds-encounter--boss' : ''}`}>
            {isMiniboss && <div className="ds-encounter-boss-glow" />}
            <div className="ds-encounter-sigil">
              <div className="ds-encounter-rune-ring" />
              <div className="ds-encounter-clue">
                <span className="ds-encounter-english">{word.english}</span>
                <span className="ds-encounter-translit">{word.transliteration}</span>
              </div>
            </div>

            {/* Answer track — inscription plates below the encounter */}
            <div className="ds-inscription" dir="rtl">
              {combat.answerTrack.map((slot, index) => {
                const revealed = slot.revealed;
                const correct = slot.correct;
                const hasSelection = combat.selectedTrayTile || combat.selectedSatchelTile;

                let slotCls = 'ds-rune-slot';
                if (correct) {
                  slotCls += ' ds-rune-slot--correct';
                  if (justCorrectSlot === index) slotCls += ' ds-rune-slot--just-correct';
                } else if (justWrongSlot === index) {
                  slotCls += ' ds-rune-slot--just-wrong';
                } else if (hasSelection && !correct) {
                  slotCls += ' ds-rune-slot--target';
                }

                return (
                  <button
                    key={index}
                    type="button"
                    className={slotCls}
                    onClick={() => handleSlotClick(index)}
                    disabled={correct || combat.phase !== 'active'}
                  >
                    {correct ? (
                      <span className="ds-rune-letter">{slot.targetLetter}</span>
                    ) : revealed ? (
                      <span className="ds-rune-hint">{slot.targetLetter}</span>
                    ) : (
                      <span className="ds-rune-empty" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ═══ BOTTOM HUD ═══ */}
      <div className="ds-bottom-hud">
        {/* Inventory panel — Tray + Satchel */}
        <div className="ds-inventory">
          <div className="ds-inv-tray">
            <div className="ds-inv-label">Tray</div>
            <div className="ds-inv-tiles">
              {combat.tray.map(tile => {
                let tileCls = 'ds-inv-tile';
                if (tile.faded) tileCls += ' ds-inv-tile--faded';
                if (combat.selectedTrayTile === tile.id) tileCls += ' ds-inv-tile--selected';
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
              {Array.from({ length: Math.max(0, runState.traySize - combat.tray.length) }).map((_, i) => (
                <div key={`e-${i}`} className="ds-inv-tile ds-inv-tile--empty" />
              ))}
            </div>
          </div>

          <div className="ds-inv-satchel">
            <div className="ds-inv-label ds-inv-label--satchel">Satchel</div>
            <div className="ds-inv-tiles">
              {combat.satchel.map(tile => {
                let tileCls = 'ds-inv-tile ds-inv-tile--satchel';
                if (combat.selectedSatchelTile === tile.id) tileCls += ' ds-inv-tile--selected';
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
                <div key={`es-${i}`} className="ds-inv-tile ds-inv-tile--empty ds-inv-tile--satchel-empty" />
              ))}
            </div>
          </div>

          {/* Tile actions — compact icons */}
          <div className="ds-inv-actions">
            {canStow && (
              <button type="button" className="ds-inv-act ds-inv-act--stow" onClick={handleStow} title="Stow to satchel">
                <span className="ds-inv-act-icon">⬇</span>
              </button>
            )}
            {canBurn && (
              <button type="button" className="ds-inv-act ds-inv-act--burn" onClick={handleBurn} title="Burn tile">
                <span className="ds-inv-act-icon">🔥</span>
              </button>
            )}
            {canRetrieve && (
              <button type="button" className="ds-inv-act ds-inv-act--retrieve" onClick={handleRetrieve} title="Retrieve from satchel">
                <span className="ds-inv-act-icon">⬆</span>
              </button>
            )}
          </div>
        </div>

        {/* Gear hotbar — compact relic icons */}
        <div className="ds-hotbar">
          {runState.gearIds.map(gearId => {
            const gear = getGearById(gearId);
            const gs = combat.gearStates[gearId];
            if (!gear || !gs) return null;

            const onCooldown = gs.currentCooldown > 0;
            const noUses = gs.usesRemaining === 0;
            const disabled = onCooldown || noUses || combat.phase !== 'active';
            const needsSelection = gear.invokeCost > 0 || gear.type === 'duplicate' || gear.type === 'transform';
            const hasSelection = combat.selectedTrayTile || combat.selectedSatchelTile;

            let gearCls = 'ds-hotbar-slot';
            if (onCooldown) gearCls += ' ds-hotbar-slot--cooldown';
            if (noUses) gearCls += ' ds-hotbar-slot--depleted';
            if (activatingGear === gearId) gearCls += ' ds-hotbar-slot--activating';
            if (!disabled && !(needsSelection && !hasSelection)) gearCls += ' ds-hotbar-slot--ready';

            return (
              <button
                key={gearId}
                type="button"
                className={gearCls}
                onClick={() => handleUseGear(gearId)}
                disabled={disabled || (needsSelection && !hasSelection)}
                title={`${gear.name}: ${gear.description}`}
              >
                <span className="ds-hotbar-icon">{gear.icon}</span>
                {onCooldown && <span className="ds-hotbar-cd">{gs.currentCooldown}</span>}
                {gs.usesRemaining >= 0 && !noUses && (
                  <span className="ds-hotbar-uses">{gs.usesRemaining}</span>
                )}
                <span className="ds-hotbar-name">{gear.name}</span>
              </button>
            );
          })}

          {/* End Turn */}
          <button
            type="button"
            className={`ds-hotbar-endturn ${hintEndTurn ? 'ds-hotbar-endturn--hint' : ''}`}
            onClick={handleEndTurn}
            disabled={combat.phase !== 'active'}
            title="End turn — draw new letters"
          >
            <span className="ds-hotbar-endturn-icon">↻</span>
            <span className="ds-hotbar-endturn-label">Draw</span>
          </button>
        </div>
      </div>

      {/* Choice Bundle Modal */}
      {combat.choiceBundle && (
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
      {combat.phase === 'victory' && (
        <div className="ds-phase-overlay ds-phase-victory">
          <div className="ds-phase-message">Word Vanquished!</div>
          <div className="ds-phase-word" dir="rtl">{word.hebrew}</div>
        </div>
      )}
      {combat.phase === 'defeat' && (
        <div className="ds-phase-overlay ds-phase-defeat">
          <div className="ds-phase-message">Overwhelmed...</div>
          <div className="ds-phase-word" dir="rtl">{word.hebrew} — {word.english}</div>
        </div>
      )}

      {/* Log toast */}
      {combat.log.length > 0 && (
        <div className="ds-log-toast" key={combat.log.length}>
          {combat.log[combat.log.length - 1].message || combat.log[combat.log.length - 1].type}
        </div>
      )}
    </div>
  );
}
