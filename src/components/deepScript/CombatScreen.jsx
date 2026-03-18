import React, { useReducer, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  combatReducer,
  createCombatState,
  ACTIONS,
  getIntentDisplay,
} from './deepScriptEngine.js';
import { getGearById } from '../../data/deepScript/gear.js';
import { celebrate } from '../../lib/celebration.js';
import {
  playSelect, playCorrect, playWrong, playBurn,
  playStow, playGear, playEndTurn, playVictory,
  playDefeat, playPressureWarning,
} from './dsSounds.js';

/**
 * CombatScreen — roguelike dungeon-crawler combat encounter.
 *
 * Layout (top to bottom):
 *   1. Top HUD: health, energy, tension, progress
 *   2. Enemy intent banner
 *   3. Dungeon viewport with encounter sigil + inscription slots
 *   4. Tray + Satchel tile row
 *   5. Ability cards row with tile sockets
 *   6. End Turn button
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
  const [turnStarted, setTurnStarted] = useState(true); // first turn auto-started

  // Animation state
  const [justCorrectSlot, setJustCorrectSlot] = useState(null);
  const [justWrongSlot, setJustWrongSlot] = useState(null);
  const [activatingGear, setActivatingGear] = useState(null);
  const [pressureCritical, setPressureCritical] = useState(false);
  const [enemyActing, setEnemyActing] = useState(false);
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

  const handleSocketTile = useCallback((gearId, socketIndex) => {
    playSelect();
    dispatch({ type: ACTIONS.SOCKET_TILE, gearId, socketIndex });
  }, []);

  const handleUnsocketTile = useCallback((gearId, socketIndex) => {
    playSelect();
    dispatch({ type: ACTIONS.UNSOCKET_TILE, gearId, socketIndex });
  }, []);

  const handleUseGear = useCallback((gearId) => {
    playGear();
    setActivatingGear(gearId);
    dispatch({ type: ACTIONS.USE_GEAR, gearId, runState });
  }, [runState]);

  const handleEndTurn = useCallback(() => {
    playEndTurn();
    setEnemyActing(true);
    // Brief delay to show enemy acting animation
    setTimeout(() => {
      dispatch({ type: ACTIONS.END_TURN });
      setEnemyActing(false);
      setTurnStarted(false);
      // Auto-start next turn after a moment
      setTimeout(() => {
        dispatch({ type: ACTIONS.START_TURN });
        setTurnStarted(true);
      }, 400);
    }, 600);
  }, []);

  const handlePickChoice = useCallback((letter) => {
    playSelect();
    dispatch({ type: ACTIONS.PICK_CHOICE, letter });
  }, []);

  if (!combat) return <div className="ds-screen">Loading...</div>;

  const word = combat.word;
  const completedSlots = combat.answerTrack.filter(s => s.correct).length;
  const totalSlots = combat.answerTrack.length;

  // Health pips
  const healthPips = [];
  for (let i = 0; i < runState.maxHealth; i++) {
    healthPips.push(i < runState.health);
  }

  // Energy pips
  const energyPips = [];
  for (let i = 0; i < combat.maxEnergy; i++) {
    energyPips.push(i < combat.energy);
  }

  // Tile action availability
  const selectedTrayTile = combat.tray.find(t => t.id === combat.selectedTrayTile);
  const canStow = selectedTrayTile && !selectedTrayTile.faded && combat.satchel.length < runState.satchelSize;
  const canRetrieve = !!combat.selectedSatchelTile && combat.tray.length < runState.traySize;
  const hasSelection = combat.selectedTrayTile || combat.selectedSatchelTile;

  // Enemy intent display
  const intentDisplay = getIntentDisplay(combat.enemyIntent);

  return (
    <div className="ds-combat-screen">
      {/* ═══ TOP HUD BAR ═══ */}
      <div className="ds-top-hud">
        <div className="ds-hud-health">
          {healthPips.map((full, i) => (
            <span key={i} className={`ds-hud-pip ${full ? 'ds-hud-pip--full' : 'ds-hud-pip--empty'}`} />
          ))}
        </div>

        <div className="ds-hud-energy">
          {energyPips.map((full, i) => (
            <span key={i} className={`ds-energy-pip ${full ? 'ds-energy-pip--full' : 'ds-energy-pip--empty'}`} />
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

      {/* ═══ ENEMY INTENT BANNER ═══ */}
      <div className={`ds-intent-banner ${enemyActing ? 'ds-intent-banner--acting' : ''} ${combat.warded ? 'ds-intent-banner--warded' : ''} ds-intent-banner--${combat.enemyIntent?.type || 'idle'}`}>
        <span className="ds-intent-icon">{intentDisplay.icon}</span>
        <span className="ds-intent-text">{intentDisplay.description}</span>
        {combat.warded && <span className="ds-intent-ward">🛡️</span>}
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

          {/* ═══ ENCOUNTER ═══ */}
          <div className={`ds-encounter ${isMiniboss ? 'ds-encounter--boss' : ''}`}>
            {isMiniboss && <div className="ds-encounter-boss-glow" />}
            <div className="ds-encounter-sigil">
              <div className="ds-encounter-rune-ring" />
              <div className="ds-encounter-clue">
                <span className="ds-encounter-english">{word.english}</span>
                <span className="ds-encounter-translit">{word.transliteration}</span>
              </div>
            </div>

            {/* Inscription slots */}
            <div className="ds-inscription" dir="rtl">
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
                      <span className="ds-rune-letter">{slot.targetLetter}</span>
                    ) : slot.locked ? (
                      <span className="ds-rune-lock">🔒</span>
                    ) : slot.revealed ? (
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

      {/* ═══ TILE INVENTORY ═══ */}
      <div className="ds-tile-row">
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

        <div className="ds-inv-actions-compact">
          {canStow && (
            <button type="button" className="ds-inv-act ds-inv-act--stow" onClick={handleStow} title="Stow to satchel">
              <span className="ds-inv-act-icon">⬇</span>
            </button>
          )}
          {canRetrieve && (
            <button type="button" className="ds-inv-act ds-inv-act--retrieve" onClick={handleRetrieve} title="Retrieve from satchel">
              <span className="ds-inv-act-icon">⬆</span>
            </button>
          )}
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
      </div>

      {/* ═══ ABILITY CARDS ═══ */}
      <div className="ds-ability-row">
        {runState.gearIds.map(gearId => {
          const gear = getGearById(gearId);
          const gs = combat.gearStates[gearId];
          if (!gear || !gs) return null;

          const onCooldown = gs.currentCooldown > 0;
          const noUses = gs.usesRemaining === 0;
          const notEnoughEnergy = combat.energy < gear.energyCost;
          const requiredSocketsFilled = gs.sockets
            .filter(s => s.type === 'required')
            .every(s => s.tileId !== null);
          const hasSockets = gs.sockets.length > 0;
          const needsSockets = hasSockets && gs.sockets.some(s => s.type === 'required');
          const isReady = !onCooldown && !noUses && !notEnoughEnergy && (!needsSockets || requiredSocketsFilled);
          const disabled = onCooldown || noUses || combat.phase !== 'active';

          let cardCls = 'ds-ability-card';
          if (onCooldown) cardCls += ' ds-ability-card--cooldown';
          if (noUses) cardCls += ' ds-ability-card--depleted';
          if (notEnoughEnergy) cardCls += ' ds-ability-card--no-energy';
          if (isReady) cardCls += ' ds-ability-card--ready';
          if (activatingGear === gearId) cardCls += ' ds-ability-card--activating';

          return (
            <div key={gearId} className={cardCls}>
              {/* Card header: icon + name */}
              <div className="ds-ability-header">
                <span className="ds-ability-icon">{gear.icon}</span>
                <span className="ds-ability-name">{gear.name}</span>
              </div>

              {/* Cost badges */}
              <div className="ds-ability-costs">
                {gear.energyCost > 0 && (
                  <span className={`ds-ability-cost-energy ${notEnoughEnergy ? 'ds-ability-cost--insufficient' : ''}`}>
                    {'◆'.repeat(gear.energyCost)}
                  </span>
                )}
                {gear.energyCost === 0 && (
                  <span className="ds-ability-cost-energy ds-ability-cost--free">FREE</span>
                )}
                {onCooldown && (
                  <span className="ds-ability-cost-cd">{gs.currentCooldown}⏳</span>
                )}
                {gs.usesRemaining >= 0 && !noUses && (
                  <span className="ds-ability-cost-uses">{gs.usesRemaining}×</span>
                )}
              </div>

              {/* Tile sockets */}
              {hasSockets && (
                <div className="ds-ability-sockets">
                  {gs.sockets.map((socket, si) => (
                    <button
                      key={si}
                      type="button"
                      className={`ds-ability-socket ${socket.type === 'required' ? 'ds-ability-socket--required' : 'ds-ability-socket--empower'} ${socket.tileId ? 'ds-ability-socket--filled' : ''}`}
                      onClick={() => socket.tileId
                        ? handleUnsocketTile(gearId, si)
                        : hasSelection ? handleSocketTile(gearId, si) : null
                      }
                      disabled={combat.phase !== 'active' || (!socket.tileId && !hasSelection)}
                      title={socket.tileId ? `${socket.tileLetter} (click to unsocket)` : 'Place a selected tile here'}
                    >
                      {socket.tileLetter || ''}
                    </button>
                  ))}
                </div>
              )}

              {/* Effect text */}
              <div className="ds-ability-effect">{gear.description}</div>

              {/* Activate button */}
              <button
                type="button"
                className="ds-ability-activate"
                onClick={() => handleUseGear(gearId)}
                disabled={disabled || notEnoughEnergy || (needsSockets && !requiredSocketsFilled)}
              >
                {onCooldown ? `CD ${gs.currentCooldown}` : noUses ? 'Used' : 'USE'}
              </button>
            </div>
          );
        })}
      </div>

      {/* ═══ END TURN ═══ */}
      <div className="ds-endturn-row">
        <button
          type="button"
          className="ds-endturn-btn"
          onClick={handleEndTurn}
          disabled={combat.phase !== 'active' || enemyActing}
          title="End your turn — enemy will act"
        >
          <span className="ds-endturn-icon">⚔</span>
          <span className="ds-endturn-label">End Turn</span>
        </button>
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
