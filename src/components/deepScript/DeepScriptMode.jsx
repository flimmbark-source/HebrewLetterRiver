import React, { useState, useCallback, useMemo } from 'react';
import { starterKits, getStarterKit } from '../../data/deepScript/starterKits.js';
import { getSharedGear } from '../../data/deepScript/gear.js';
import { generateRunMap } from '../../data/deepScript/roomGenerator.js';
import { createRunState } from './deepScriptEngine.js';
import { upgradeDefinitions } from '../../data/deepScript/upgrades.js';
import KitSelectScreen from './KitSelectScreen.jsx';
import RoomChoiceScreen from './RoomChoiceScreen.jsx';
import CombatScreen from './CombatScreen.jsx';
import ArchiveScreen from './ArchiveScreen.jsx';
import ShrineScreen from './ShrineScreen.jsx';
import RunEndScreen from './RunEndScreen.jsx';
import './DeepScript.css';

/**
 * DeepScriptMode — top-level orchestrator for the Deep Script game mode.
 *
 * Flow: Kit Select → Room Choice → Room (Combat/Archive/Shrine) → ... → Miniboss → End
 */
export default function DeepScriptMode({ onBack }) {
  const [screen, setScreen] = useState('kit_select'); // kit_select | running | end
  const [runState, setRunState] = useState(null);
  const [endResult, setEndResult] = useState(null); // 'victory' | 'defeat'

  const handleKitSelect = useCallback((kitId) => {
    const kit = getStarterKit(kitId);
    if (!kit) return;
    const sharedGearIds = getSharedGear().map(g => g.id);
    const runMap = generateRunMap(6);
    const newRun = createRunState(kit, sharedGearIds, runMap);
    setRunState(newRun);
    setScreen('running');
  }, []);

  const handleRoomSelect = useCallback((room) => {
    setRunState(prev => ({
      ...prev,
      currentRoom: room,
      phase: room.type,
    }));
  }, []);

  const handleCombatEnd = useCallback((result, wordId) => {
    setRunState(prev => {
      if (result === 'victory') {
        const newState = {
          ...prev,
          combatsWon: prev.combatsWon + 1,
          wordsCompleted: [...prev.wordsCompleted, wordId],
          roomsCompleted: prev.roomsCompleted + 1,
          roomIndex: prev.roomIndex + 1,
          currentRoom: null,
          phase: 'room_choice',
        };
        // Check if this was the last room (miniboss beaten)
        if (prev.roomIndex >= prev.runMap.length - 1) {
          newState.phase = 'victory';
          setEndResult('victory');
          setScreen('end');
        }
        return newState;
      } else {
        // Defeat — lose health
        const newHealth = prev.health - 1;
        if (newHealth <= 0) {
          setEndResult('defeat');
          setScreen('end');
          return { ...prev, health: 0, phase: 'defeat' };
        }
        return {
          ...prev,
          health: newHealth,
          roomsCompleted: prev.roomsCompleted + 1,
          roomIndex: prev.roomIndex + 1,
          currentRoom: null,
          phase: 'room_choice',
        };
      }
    });
  }, []);

  const handleArchiveComplete = useCallback((rewardId) => {
    setRunState(prev => {
      const newState = {
        ...prev,
        roomsCompleted: prev.roomsCompleted + 1,
        roomIndex: prev.roomIndex + 1,
        currentRoom: null,
        phase: 'room_choice',
      };

      // Apply archive reward
      switch (rewardId) {
        case 'heal':
          newState.health = Math.min(prev.maxHealth, prev.health + 1);
          break;
        case 'clue-hint':
          newState.insightNextCombat = true;
          break;
        // 'free-letter' and 'insight' are handled in the archive screen
        default:
          break;
      }

      return newState;
    });
  }, []);

  const handleShrineComplete = useCallback((upgradeId) => {
    setRunState(prev => {
      const newState = {
        ...prev,
        roomsCompleted: prev.roomsCompleted + 1,
        roomIndex: prev.roomIndex + 1,
        currentRoom: null,
        phase: 'room_choice',
        upgrades: { ...prev.upgrades },
      };

      // Apply upgrade
      const upgrade = upgradeDefinitions.find(u => u.id === upgradeId);
      if (upgrade) {
        switch (upgrade.effect) {
          case 'satchelSize':
            newState.satchelSize = (prev.satchelSize || 3) + upgrade.value;
            break;
          case 'traySize':
            newState.traySize = (prev.traySize || 6) + upgrade.value;
            break;
          case 'maxPressure':
            newState.upgrades.maxPressure = (prev.upgrades.maxPressure || 0) + upgrade.value;
            break;
          case 'heal':
            newState.health = Math.min(prev.maxHealth + upgrade.value, prev.health + upgrade.value);
            newState.maxHealth = prev.maxHealth + upgrade.value;
            break;
          case 'genAccuracy':
            newState.upgrades.genAccuracy = (prev.upgrades.genAccuracy || 0) + upgrade.value;
            break;
          case 'burnBonus':
            newState.upgrades.burnBonus = true;
            break;
          case 'cooldownReduction':
            newState.upgrades.cooldownReduction = (prev.upgrades.cooldownReduction || 0) + upgrade.value;
            break;
          case 'startReveal':
            newState.upgrades.startReveal = (prev.upgrades.startReveal || 0) + upgrade.value;
            break;
          default:
            break;
        }
      }

      return newState;
    });
  }, []);

  const handleRestart = useCallback(() => {
    setScreen('kit_select');
    setRunState(null);
    setEndResult(null);
  }, []);

  // Determine what to render
  if (screen === 'kit_select') {
    return (
      <div className="ds-mode">
        <KitSelectScreen onSelect={handleKitSelect} onBack={onBack} />
      </div>
    );
  }

  if (screen === 'end') {
    return (
      <div className="ds-mode">
        <RunEndScreen
          result={endResult}
          runState={runState}
          onRestart={handleRestart}
          onBack={onBack}
        />
      </div>
    );
  }

  // Running state
  if (!runState) return null;

  const currentNode = runState.runMap[runState.roomIndex];
  const currentRoom = runState.currentRoom;

  if (currentRoom) {
    switch (currentRoom.type) {
      case 'combat':
      case 'miniboss':
        return (
          <div className="ds-mode">
            <CombatScreen
              wordId={currentRoom.wordId}
              runState={runState}
              onEnd={handleCombatEnd}
              isMiniboss={currentRoom.type === 'miniboss'}
            />
          </div>
        );
      case 'archive':
        return (
          <div className="ds-mode">
            <ArchiveScreen
              room={currentRoom}
              runState={runState}
              onComplete={handleArchiveComplete}
            />
          </div>
        );
      case 'shrine':
        return (
          <div className="ds-mode">
            <ShrineScreen
              runState={runState}
              onComplete={handleShrineComplete}
            />
          </div>
        );
      default:
        break;
    }
  }

  // Room choice phase
  return (
    <div className="ds-mode">
      <RoomChoiceScreen
        node={currentNode}
        runState={runState}
        onSelect={handleRoomSelect}
        onBack={onBack}
      />
    </div>
  );
}
