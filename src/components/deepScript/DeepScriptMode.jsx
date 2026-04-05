import React, { useState, useCallback, useEffect, useRef } from 'react';
import { createDefaultRunStats } from './deepScriptEngine.js';
import { generateDungeonFloor, CHAMBER_TYPES } from '../../data/deepScript/floorGenerator.js';
import { createRunState } from './deepScriptEngine.js';
import { registerCustomWords, clearCustomWords, convertBBWordsForDS, getWordById, deepScriptWords } from '../../data/deepScript/words.js';
import { loadDeepScriptWords, getDeepScriptWordsSync } from '../../data/deepScript/words/index.js';
import { bridgeBuilderPacks } from '../../data/bridgeBuilderPacks.js';
import { getWordsByIds } from '../../data/bridgeBuilderWords.js';
import { emit } from '../../lib/eventBus.js';
import KitSelectScreen from './KitSelectScreen.jsx';
import ExplorationScreen from './ExplorationScreen.jsx';
import BattleTransition from './BattleTransition.jsx';
import CombatScreen from './CombatScreen.jsx';
import RunEndScreen from './RunEndScreen.jsx';
import './DeepScript.css';

/**
 * DeepScriptMode — top-level orchestrator for the Deep Script game mode.
 *
 * Flow: Kit Select → Exploration (move/turn/inspect/trigger) →
 *       Combat/Archive/Shrine → back to Exploration → ... → Miniboss → End
 */
function collectFloorWordIds(floor) {
  if (!floor?.chambers) return new Set();
  const wordIds = new Set();
  for (const chamber of floor.chambers.values()) {
    if (chamber?.payload?.wordId) {
      wordIds.add(chamber.payload.wordId);
    }
  }
  return wordIds;
}

function collectCombatWordIds(floor) {
  if (!floor?.chambers) return new Set();
  const wordIds = new Set();
  for (const chamber of floor.chambers.values()) {
    if (chamber?.type === CHAMBER_TYPES.COMBAT && chamber?.payload?.wordId) {
      wordIds.add(chamber.payload.wordId);
    }
  }
  return wordIds;
}

function mergeUniqueWordIds(existing = [], nextIds = []) {
  const merged = new Set(existing || []);
  for (const wordId of nextIds || []) {
    if (wordId) merged.add(wordId);
  }
  return Array.from(merged);
}

function getGuidedCombatCount(packSize) {
  if (packSize <= 0) return 3;
  return Math.min(4, Math.max(3, Math.ceil(packSize / 2)));
}

export default function DeepScriptMode({ onBack, packWords, onRunComplete, isGuidedPackRun = false, languageId = 'hebrew' }) {
  const hasCustomWordPool = !!(packWords && packWords.length > 0);
  const isHebrew = languageId === 'hebrew';
  const previousFloorWordIdsRef = useRef(new Set());
  const runStateRef = useRef(null);
  const hasAutoStarted = useRef(false);
  const [langDSWordsReady, setLangDSWordsReady] = useState(isHebrew);

  // Load language-specific Deep Script words
  useEffect(() => {
    if (isHebrew) return;
    loadDeepScriptWords(languageId).then(() => setLangDSWordsReady(true));
  }, [languageId, isHebrew]);
  const [wordSourceMode, setWordSourceMode] = useState('pack'); // pack | random (standalone only)
  const [screen, setScreen] = useState('kit_select'); // kit_select | exploring | combat | end
  const [isPauseMenuOpen, setIsPauseMenuOpen] = useState(false);
  const [runState, setRunState] = useState(null);
  const [endResult, setEndResult] = useState(null);
  const [floorNumber, setFloorNumber] = useState(1);

  // Exploration state
  const [floor, setFloor] = useState(null);
  const [currentChamberId, setCurrentChamberId] = useState(null);

  // Active encounter context
  const [activeCombat, setActiveCombat] = useState(null); // { wordId, chamberId, isMiniboss }
  const [activeMiniGame, setActiveMiniGame] = useState(null); // { chamberId, miniGameId }
  const [hasCompletedCapsulesMiniGameThisFloor, setHasCompletedCapsulesMiniGameThisFloor] = useState(false);
  const [isMemoryGateUnlocked, setIsMemoryGateUnlocked] = useState(false);
  const [floorMiniGameWords, setFloorMiniGameWords] = useState(null); // guided runs use remaining pack words; endless runs keep a smaller shared word set
  runStateRef.current = runState;

  // Get the default DS word pool for the active language
  const langDSWords = isHebrew ? deepScriptWords : getDeepScriptWordsSync(languageId);

  const getRandomPackWordsForFloor = useCallback(() => {
    if (!isHebrew) {
      // For non-Hebrew, use language-specific DS words directly
      return langDSWords;
    }
    if (bridgeBuilderPacks.length === 0) return [];
    const pack = bridgeBuilderPacks[Math.floor(Math.random() * bridgeBuilderPacks.length)];
    return convertBBWordsForDS(getWordsByIds(pack.wordIds));
  }, [isHebrew, langDSWords]);

  const markWordsSeen = useCallback((wordIds = []) => {
    if (wordIds.length === 0) return;
    setRunState(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        wordsSeen: mergeUniqueWordIds(prev.wordsSeen, wordIds),
      };
    });
  }, []);

  const createFloorForNumber = useCallback((targetFloorNumber) => {
    const combatCount = isGuidedPackRun && hasCustomWordPool
      ? getGuidedCombatCount(packWords.length)
      : Math.min(6, 3 + Math.floor((targetFloorNumber - 1) / 2));
    let floorWordPool;
    if (isGuidedPackRun) {
      floorWordPool = hasCustomWordPool ? packWords : null;
    } else if (!isHebrew) {
      // Non-Hebrew standalone: always use language DS words
      floorWordPool = langDSWords;
    } else {
      floorWordPool = wordSourceMode === 'pack' ? getRandomPackWordsForFloor() : null;
    }

    if (floorWordPool && floorWordPool.length > 0) {
      registerCustomWords(floorWordPool);
    } else {
      // Fallback: register language words so getWordById can find them
      if (!isHebrew && langDSWords.length > 0) {
        registerCustomWords(langDSWords);
        floorWordPool = langDSWords;
      } else {
        clearCustomWords();
      }
    }

    const nextFloor = generateDungeonFloor({
      combatCount,
      customWords: floorWordPool,
      excludeWordIds: previousFloorWordIdsRef.current,
    });
    previousFloorWordIdsRef.current = collectFloorWordIds(nextFloor);
    return nextFloor;
  }, [getRandomPackWordsForFloor, hasCustomWordPool, isGuidedPackRun, isHebrew, langDSWords, packWords, wordSourceMode]);

  // Guided pack runs assign mini-games any pack words not surfaced as combat chambers.
  // Endless runs keep the existing smaller shared mini-game selection.
  const pickMiniGameWords = useCallback((newFloor) => {
    if (isGuidedPackRun && hasCustomWordPool) {
      const combatWordIds = collectCombatWordIds(newFloor);
      const remainingPackWords = packWords.filter(word =>
        word &&
        !word.isMiniboss &&
        (word.meaning || word.english) &&
        !combatWordIds.has(word.id)
      );

      if (remainingPackWords.length > 0) {
        return remainingPackWords;
      }

      return packWords
        .filter(word => word && !word.isMiniboss && (word.meaning || word.english))
        .slice(0, Math.min(3, packWords.length));
    }

    const wordIds = collectFloorWordIds(newFloor);
    const fallbackPool = isHebrew ? deepScriptWords : langDSWords;
    const pool = wordIds.size > 0
      ? Array.from(wordIds).map(id => getWordById(id)).filter(Boolean)
      : [...fallbackPool];
    const candidates = pool.filter(w => !w.isMiniboss && (w.meaning || w.english));
    const shuffled = [...candidates].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);
  }, [hasCustomWordPool, isGuidedPackRun, isHebrew, langDSWords, packWords]);

  // Add/remove body class for nav bar hiding; clean up custom words on unmount
  useEffect(() => {
    document.body.classList.add('in-deep-script');
    return () => {
      document.body.classList.remove('in-deep-script');
      clearCustomWords();
    };
  }, []);

  useEffect(() => {
    if (screen !== 'exploring' && screen !== 'combat') {
      setIsPauseMenuOpen(false);
    }
  }, [screen]);

  // ─── Kit Selection ────────────────────────────────────────

  const handleStartRun = useCallback(() => {
    // Generate dungeon floor (pass custom words if available)
    const newFloor = createFloorForNumber(1);

    // Create run state with default stats
    const newRun = createRunState(createDefaultRunStats(), [], []);
    newRun.floor = newFloor;
    newRun.wordsSeen = [];

    setRunState(newRun);
    setFloor(newFloor);
    setCurrentChamberId(newFloor.startChamberId);
    setFloorNumber(1);
    setHasCompletedCapsulesMiniGameThisFloor(false);
    setIsMemoryGateUnlocked(false);
    setFloorMiniGameWords(pickMiniGameWords(newFloor));
    setScreen('exploring');
    setIsPauseMenuOpen(false);
  }, [createFloorForNumber, pickMiniGameWords]);

  // ─── Exploration: Movement ────────────────────────────────

  const handleMove = useCallback((targetChamberId) => {
    if (!floor) return;

    setCurrentChamberId(targetChamberId);

    // Mark chamber as visited
    setFloor(prev => {
      const newChambers = new Map(prev.chambers);
      const chamber = { ...newChambers.get(targetChamberId), visited: true };
      newChambers.set(targetChamberId, chamber);
      return { ...prev, chambers: newChambers };
    });

    // Use current chamber snapshot to decide whether to trigger combat
    const chamber = floor.chambers.get(targetChamberId);
    if (!chamber) return;

    // Auto-trigger combat in unresolved combat/miniboss chambers
    if (!chamber.resolved) {
      if (chamber.type === CHAMBER_TYPES.COMBAT || (chamber.type === CHAMBER_TYPES.MINIBOSS && isMemoryGateUnlocked)) {
        if (chamber.type === CHAMBER_TYPES.COMBAT && chamber.payload?.wordId) {
          markWordsSeen([chamber.payload.wordId]);
        }
        // Small delay to let the room render first, then show battle transition
        setTimeout(() => {
          setActiveCombat({
            wordId: chamber.payload?.wordId,
            chamberId: targetChamberId,
            isMiniboss: chamber.type === CHAMBER_TYPES.MINIBOSS,
          });
          setScreen('battle_transition');
        }, 600);
      }

      // Auto-trigger minigames in unresolved minigame chambers
      if (chamber.type === CHAMBER_TYPES.MINIGAME_PILLAR || chamber.type === CHAMBER_TYPES.MINIGAME_CAPSULES || chamber.type === CHAMBER_TYPES.MEMORY_GATE) {
        const memoryMiniGameId = chamber.type === CHAMBER_TYPES.MEMORY_GATE ? 'memory-gate' : null;
        const nextMiniGameId = hasCompletedCapsulesMiniGameThisFloor ? 'pillar' : 'capsules';
        setTimeout(() => {
          setActiveMiniGame({ chamberId: targetChamberId, miniGameId: memoryMiniGameId || nextMiniGameId });
        }, 600);
      }
    }
  }, [floor, hasCompletedCapsulesMiniGameThisFloor, isMemoryGateUnlocked, markWordsSeen]);

  // ─── Exploration: Trigger encounters from hotspots ────────

  const handleTriggerCombat = useCallback((wordId, chamberId) => {
    const chamber = floor?.chambers.get(chamberId);
    if (chamber?.type === CHAMBER_TYPES.COMBAT && wordId) {
      markWordsSeen([wordId]);
    }
    setActiveCombat({
      wordId,
      chamberId,
      isMiniboss: chamber?.type === CHAMBER_TYPES.MINIBOSS,
    });
    setScreen('battle_transition');
  }, [floor, markWordsSeen]);

  const handleBattleTransitionComplete = useCallback(() => {
    setScreen('combat');
  }, []);

  const handleTriggerMiniGame = useCallback((chamberId) => {
    const chamber = floor?.chambers.get(chamberId);
    if (!chamber) return;
    if (chamber.type === CHAMBER_TYPES.MEMORY_GATE) {
      setActiveMiniGame({ chamberId, miniGameId: 'memory-gate' });
      return;
    }
    const nextMiniGameId = hasCompletedCapsulesMiniGameThisFloor ? 'pillar' : 'capsules';
    setActiveMiniGame(prev => {
      if (prev?.chamberId === chamberId && prev?.miniGameId === nextMiniGameId) {
        return null;
      }
      return { chamberId, miniGameId: nextMiniGameId };
    });
  }, [floor, hasCompletedCapsulesMiniGameThisFloor]);

  const handleLoot = useCallback((chamberId, interactableId) => {
    // Loot effect: heal 1 HP
    setRunState(prev => ({
      ...prev,
      health: Math.min(prev.maxHealth, prev.health + 1),
    }));
  }, []);

  const handleResolveInteractable = useCallback((chamberId, interactableId) => {
    setFloor(prev => {
      const newChambers = new Map(prev.chambers);
      const chamber = { ...newChambers.get(chamberId) };
      chamber.interactables = chamber.interactables.map(obj =>
        obj.id === interactableId ? { ...obj, resolved: true } : obj
      );
      newChambers.set(chamberId, chamber);
      return { ...prev, chambers: newChambers };
    });
  }, []);

  // ─── Combat End ───────────────────────────────────────────

  const handleCombatEnd = useCallback((result, wordId, options = {}) => {
    const { chamberId, isMiniboss } = activeCombat || {};
    const { skipHealthPenalty = false } = options;

    if (result === 'victory') {
      // Mark chamber as resolved
      setFloor(prev => {
        const newChambers = new Map(prev.chambers);
        const chamber = { ...newChambers.get(chamberId), resolved: true };
        // Also resolve the sigil interactable
        chamber.interactables = chamber.interactables.map(obj =>
          obj.action === 'trigger-combat' ? { ...obj, resolved: true } : obj
        );
        newChambers.set(chamberId, chamber);
        return { ...prev, chambers: newChambers };
      });

      let updatedCombatsWon;
      let updatedWordsCompleted;

      setRunState(prev => {
        const updated = {
          ...prev,
          combatsWon: prev.combatsWon + 1,
          wordsCompleted: [...prev.wordsCompleted, wordId],
          roomsCompleted: prev.roomsCompleted + 1,
        };
        updatedCombatsWon = updated.combatsWon;
        updatedWordsCompleted = updated.wordsCompleted;
        return updated;
      });

      // Defer event emission so it doesn't trigger setState in
      // ProgressProvider during React's render cycle.
      queueMicrotask(() => {
        emit('deep-script:combat-won', {
          wordId,
          isMiniboss,
          combatsWon: updatedCombatsWon,
          floorNumber,
        });

        if (isMiniboss) {
          emit('deep-script:run-end', {
            result: 'victory',
            floorNumber,
            combatsWon: updatedCombatsWon,
            wordsCompleted: updatedWordsCompleted,
          });
        }
      });

      // Check if miniboss was defeated = victory
      if (isMiniboss) {
        setEndResult('victory');
        setScreen('end');
        if (onRunComplete && isGuidedPackRun) onRunComplete('victory');
      } else {
        setScreen('exploring');
      }
    } else {
      // Defeat — lose health
      const currentRun = runStateRef.current;
      const newHealth = skipHealthPenalty
        ? (currentRun?.health ?? 0)
        : ((currentRun?.health ?? 1) - 1);

      if (!skipHealthPenalty) {
        setRunState(prev => ({
          ...prev,
          health: Math.max(0, prev.health - 1),
        }));
      }

      if (newHealth <= 0 && !isMiniboss) {
        setEndResult('defeat');
        setScreen('end');
        queueMicrotask(() => {
          emit('deep-script:run-end', {
            result: 'defeat',
            floorNumber,
            combatsWon: currentRun?.combatsWon ?? 0,
            wordsCompleted: currentRun?.wordsCompleted ?? [],
          });
        });
      } else {
        if (newHealth <= 0 && isMiniboss) {
          // Guardian sigil losses should return the player to exploration so they can retry.
          setRunState(prev => ({
            ...prev,
            health: Math.max(1, prev.health),
          }));
        }
        // Still alive — return to exploration
        setTimeout(() => setScreen('exploring'), 0);
      }
    }

    setActiveCombat(null);
  }, [activeCombat, isGuidedPackRun, onRunComplete, floorNumber]);

  const handleGuardianStrike = useCallback((damage = 1) => {
    setRunState(prev => ({
      ...prev,
      health: Math.max(0, prev.health - damage),
    }));
  }, []);

  const handleNextFloor = useCallback(() => {
    if (isGuidedPackRun) {
      setEndResult('victory');
      setScreen('end');
      return;
    }
    const nextFloorNumber = floorNumber + 1;
    const nextFloor = createFloorForNumber(nextFloorNumber);

    setFloor(nextFloor);
    setCurrentChamberId(nextFloor.startChamberId);
    setActiveCombat(null);
    setActiveMiniGame(null);
    setRunState(prev => ({
      ...prev,
      floor: nextFloor,
      health: Math.min(prev.maxHealth, prev.health + 1),
    }));
    setHasCompletedCapsulesMiniGameThisFloor(false);
    setIsMemoryGateUnlocked(false);
    setFloorMiniGameWords(pickMiniGameWords(nextFloor));
    setFloorNumber(nextFloorNumber);
    setScreen('exploring');
  }, [createFloorForNumber, floorNumber, isGuidedPackRun, pickMiniGameWords]);

  // ─── Mini-game End ────────────────────────────────────────

  const handleMiniGameComplete = useCallback((result = {}) => {
    const { chamberId, miniGameId } = activeMiniGame || {};
    if (!chamberId) return;
    if (miniGameId === 'memory-gate' && !result.passed) {
      setActiveMiniGame(null);
      return;
    }

    setFloor(prev => {
      const newChambers = new Map(prev.chambers);
      const chamber = { ...newChambers.get(chamberId), resolved: true };
      chamber.interactables = chamber.interactables.map(obj => (
        obj.action === 'trigger-minigame' || obj.action === 'trigger-memory-gate'
          ? { ...obj, resolved: true }
          : obj
      ));
      if (miniGameId === 'memory-gate') {
        chamber.payload = {
          ...chamber.payload,
          memoryGatePassed: true,
          memoryGateBestScore: Math.max(chamber.payload?.memoryGateBestScore || 0, result.successRate || 0),
        };
      }
      newChambers.set(chamberId, chamber);
      return { ...prev, chambers: newChambers };
    });

    setRunState(prev => ({
      ...prev,
      roomsCompleted: prev.roomsCompleted + 1,
      wordsSeen: miniGameId === 'memory-gate'
        ? prev.wordsSeen
        : mergeUniqueWordIds(prev.wordsSeen, (floorMiniGameWords || []).map(word => word?.id)),
    }));

    if (miniGameId === 'capsules') {
      setHasCompletedCapsulesMiniGameThisFloor(true);
    }
    if (miniGameId === 'memory-gate') {
      setIsMemoryGateUnlocked(true);
    }

    setActiveMiniGame(null);
  }, [activeMiniGame, floorMiniGameWords]);

  const handleCloseMiniGame = useCallback(() => {
    setActiveMiniGame(null);
  }, []);

  // ─── Restart / Back ───────────────────────────────────────

  const handleRestart = useCallback(() => {
    clearCustomWords();
    setScreen('kit_select');
    setRunState(null);
    setFloor(null);
    setCurrentChamberId(null);
    setActiveMiniGame(null);
    setHasCompletedCapsulesMiniGameThisFloor(false);
    setIsMemoryGateUnlocked(false);
    setFloorMiniGameWords(null);
    setEndResult(null);
    setFloorNumber(1);
    previousFloorWordIdsRef.current = new Set();
    hasAutoStarted.current = false;
    setIsPauseMenuOpen(false);
  }, []);

  const handleResumeGame = useCallback(() => {
    setIsPauseMenuOpen(false);
  }, []);

  const handleOpenSettings = useCallback(() => {
    // Placeholder for upcoming settings screen flow.
    setIsPauseMenuOpen(false);
  }, []);

  const handleReturnToMenu = useCallback(() => {
    setIsPauseMenuOpen(false);
    onBack();
  }, [onBack]);

  // ─── Render ───────────────────────────────────────────────

  useEffect(() => {
    if (isGuidedPackRun && screen === 'kit_select' && !hasAutoStarted.current) {
      hasAutoStarted.current = true;
      handleStartRun();
    }
  }, [isGuidedPackRun, screen, handleStartRun]);

  if (screen === 'kit_select') {
    if (isGuidedPackRun) return null; // waiting for auto-start effect

    return (
      <div className="ds-mode">
        <KitSelectScreen
          onSelect={handleStartRun}
          onBack={onBack}
          wordSourceMode={wordSourceMode}
          onWordSourceModeChange={setWordSourceMode}
        />
      </div>
    );
  }

  if (screen === 'end') {
    return (
      <div className="ds-mode">
        <RunEndScreen
          result={endResult}
          runState={runState}
          floorNumber={floorNumber}
          onNextFloor={handleNextFloor}
          onRestart={handleRestart}
          onBack={onBack}
          canAdvanceFloor={!isGuidedPackRun}
        />
      </div>
    );
  }

  if (!runState || !floor) return null;
  const discoveredFloorWordPool = Array.from(collectFloorWordIds(floor))
    .map(id => getWordById(id))
    .filter(Boolean);
  const floorWordPool = isGuidedPackRun && hasCustomWordPool
    ? packWords.filter(Boolean)
    : discoveredFloorWordPool;
  const requiredMemoryGateWordIds = isGuidedPackRun && hasCustomWordPool
    ? packWords.map(word => word?.id).filter(Boolean)
    : [];
  const seenWordIds = new Set(runState.wordsSeen || []);
  const memoryGateWordsRemaining = requiredMemoryGateWordIds.filter(wordId => !seenWordIds.has(wordId)).length;
  const canEnterMemoryGate = !isGuidedPackRun || memoryGateWordsRemaining === 0;

  // Battle transition
  if (screen === 'battle_transition' && activeCombat) {
    return (
      <div className="ds-mode">
        <BattleTransition
          onComplete={handleBattleTransitionComplete}
          isMiniboss={activeCombat.isMiniboss}
        />
      </div>
    );
  }

  // Combat screen
  if (screen === 'combat' && activeCombat) {
    const guardianWords = floorWordPool
      .filter(word => word && (isGuidedPackRun || !word.isMiniboss))
      .map(word => ({
        id: word.id,
        hebrew: word.nativeScript || word.hebrew,
        nativeScript: word.nativeScript || word.hebrew,
        transliteration: word.transliteration,
        meaning: word.meaning || word.english,
        languageId: word.languageId || 'hebrew',
      }))
      .filter(word => (word.nativeScript || word.hebrew) && word.transliteration && word.meaning);

    return (
      <div className="ds-mode">
        <CombatScreen
          wordId={activeCombat.wordId}
          runState={runState}
          onEnd={handleCombatEnd}
          isMiniboss={activeCombat.isMiniboss}
          floorWords={guardianWords}
          onGuardianStrike={handleGuardianStrike}
          onOpenMenu={() => setIsPauseMenuOpen(true)}
          isPaused={isPauseMenuOpen}
        />
        {isPauseMenuOpen && (
          <div className="ds-pause-overlay" role="dialog" aria-modal="true" aria-label="Game menu">
            <div className="ds-pause-menu">
              <button type="button" className="ds-pause-btn" onClick={handleResumeGame}>Resume</button>
              <button type="button" className="ds-pause-btn" onClick={handleReturnToMenu}>Menu</button>
              <button type="button" className="ds-pause-btn" onClick={handleOpenSettings}>Settings</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Exploration
  return (
    <div className="ds-mode">
      <ExplorationScreen
        floor={floor}
        currentChamberId={currentChamberId}
        onMove={handleMove}
        onTriggerCombat={handleTriggerCombat}
        onTriggerMiniGame={handleTriggerMiniGame}
        onLoot={handleLoot}
        onResolveInteractable={handleResolveInteractable}
        activeMiniGame={activeMiniGame}
        onCompleteMiniGame={handleMiniGameComplete}
        onCloseMiniGame={handleCloseMiniGame}
        floorWordPool={floorWordPool}
        floorMiniGameWords={floorMiniGameWords}
        runState={runState}
        onOpenMenu={() => setIsPauseMenuOpen(true)}
        isMemoryGateUnlocked={isMemoryGateUnlocked}
        canEnterMemoryGate={canEnterMemoryGate}
        memoryGateWordsRemaining={memoryGateWordsRemaining}
      />
      {isPauseMenuOpen && (
        <div className="ds-pause-overlay" role="dialog" aria-modal="true" aria-label="Game menu">
          <div className="ds-pause-menu">
            <button type="button" className="ds-pause-btn" onClick={handleResumeGame}>Resume</button>
            <button type="button" className="ds-pause-btn" onClick={handleReturnToMenu}>Menu</button>
            <button type="button" className="ds-pause-btn" onClick={handleOpenSettings}>Settings</button>
          </div>
        </div>
      )}
    </div>
  );
}
