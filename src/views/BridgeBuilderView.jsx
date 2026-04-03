import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BridgeBuilderSetup from '../components/bridgeBuilder/BridgeBuilderSetup.jsx';
import BridgeBuilderGame from '../components/bridgeBuilder/BridgeBuilderGame.jsx';
import LoosePlanksGame from '../components/bridgeBuilder/LoosePlanksGame.jsx';
import DeepScriptMode from '../components/deepScript/DeepScriptMode.jsx';
import { markBridgeBuilderComplete, markDeepScriptComplete } from '../lib/bridgeBuilderStorage.js';
import { bridgeBuilderWords, getWordsByIds } from '../data/bridgeBuilderWords.js';
import { convertBBWordsForDS } from '../data/deepScript/words.js';
import { useLanguage } from '../context/LanguageContext.jsx';
import { loadBridgeBuilderWords, getBridgeBuilderWordsSync } from '../data/bridgeBuilder/words/index.js';

/**
 * BridgeBuilderView — routes between setup screen, Bridge Builder gameplay,
 * Loose Planks gameplay, and Deep Script mode.
 *
 * Flow:
 *   1. Player sees setup screen (pack selection / random review / deep script)
 *   2. Player presses Play → sessionConfig is set (includes gameMode)
 *   3. Bridge Builder, Loose Planks, or Deep Script launches with the config
 *   4. "Back" from gameplay returns to setup screen
 */
export default function BridgeBuilderView() {
  const navigate = useNavigate();
  const { languageId } = useLanguage();
  const [sessionConfig, setSessionConfig] = useState(null);
  const [langWordsReady, setLangWordsReady] = useState(languageId === 'hebrew');
  const isHebrew = languageId === 'hebrew';

  // Load language-specific word data when a non-Hebrew language is selected
  useEffect(() => {
    if (isHebrew) {
      setLangWordsReady(true);
      return;
    }
    let cancelled = false;
    loadBridgeBuilderWords(languageId).then(() => {
      if (!cancelled) setLangWordsReady(true);
    });
    return () => { cancelled = true; };
  }, [languageId, isHebrew]);

  // Get the active word pool for the selected language
  const activeWordPool = useMemo(
    () => isHebrew ? bridgeBuilderWords : getBridgeBuilderWordsSync(languageId),
    [isHebrew, languageId, langWordsReady] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const handlePlay = (config) => {
    if (!isHebrew) {
      // For non-Hebrew languages, override selectedWordIds to use language pool
      // since pack word IDs reference Hebrew-specific words
      const langWords = activeWordPool;
      const langWordIds = langWords.map(w => w.id);
      setSessionConfig({
        ...config,
        selectedWordIds: langWordIds,
      });
    } else {
      setSessionConfig(config);
    }
  };

  const handleBackToSetup = () => {
    setSessionConfig(null);
  };

  const handleBackToHome = () => {
    navigate('/home');
  };

  /**
   * Called when Bridge Builder game ends successfully (round complete, not game over).
   * Marks the pack's Bridge Builder step as complete.
   */
  const handleBridgeBuilderComplete = useCallback((packId) => {
    if (packId) {
      markBridgeBuilderComplete(packId);
    }
  }, []);

  /**
   * Called when a pack-based Deep Script run completes with victory.
   */
  const handleDeepScriptRunComplete = useCallback((result) => {
    if (result === 'victory' && sessionConfig?.packId) {
      markDeepScriptComplete(sessionConfig.packId);
    }
  }, [sessionConfig?.packId]);

  /**
   * Advance to the next game mode in the pack sequence.
   * bridge_builder → loose_planks → deep_script
   */
  const handleNextFromBridgeBuilder = useCallback(() => {
    if (sessionConfig?.sessionType === 'guided_pack') {
      setSessionConfig(prev => ({ ...prev, gameMode: 'loose_planks' }));
    }
  }, [sessionConfig?.sessionType]);

  const handleNextFromLoosePlanks = useCallback(() => {
    if (sessionConfig?.sessionType === 'guided_pack') {
      setSessionConfig(prev => ({ ...prev, gameMode: 'deep_script' }));
    }
  }, [sessionConfig?.sessionType]);

  // Resolve word IDs from the active pool (language-aware)
  const getWordsFromPool = useCallback((ids) => {
    if (isHebrew) return getWordsByIds(ids);
    const idSet = new Set(ids);
    return activeWordPool.filter(w => idSet.has(w.id));
  }, [isHebrew, activeWordPool]);

  // Convert pack words to DS format for deep_script mode
  const packDSWords = useMemo(() => {
    if (sessionConfig?.gameMode === 'deep_script' && sessionConfig.selectedWordIds?.length > 0) {
      const bbWords = getWordsFromPool(sessionConfig.selectedWordIds);
      return convertBBWordsForDS(bbWords);
    }
    return null;
  }, [sessionConfig?.gameMode, sessionConfig?.selectedWordIds, getWordsFromPool]);

  if (sessionConfig) {
    if (sessionConfig.gameMode === 'deep_script') {
      return (
        <DeepScriptMode
          key={sessionConfig.packId || 'deep-script'}
          onBack={handleBackToSetup}
          packWords={packDSWords}
          onRunComplete={handleDeepScriptRunComplete}
          isGuidedPackRun={true}
          languageId={languageId}
        />
      );
    }

    if (sessionConfig.gameMode === 'loose_planks') {
      return (
        <LoosePlanksGame
          key={sessionConfig.packId || 'loose-planks'}
          sessionConfig={sessionConfig}
          wordPool={activeWordPool}
          onBack={handleBackToSetup}
          onNext={sessionConfig.sessionType === 'guided_pack' ? handleNextFromLoosePlanks : undefined}
        />
      );
    }

    return (
      <BridgeBuilderGame
        key={sessionConfig.packId || 'review'}
        sessionConfig={sessionConfig}
        wordPool={activeWordPool}
        onBack={handleBackToSetup}
        onRoundComplete={handleBridgeBuilderComplete}
        onNext={sessionConfig.sessionType === 'guided_pack' ? handleNextFromBridgeBuilder : undefined}
      />
    );
  }

  return (
    <BridgeBuilderSetup
      onPlay={handlePlay}
      onBack={handleBackToHome}
    />
  );
}
