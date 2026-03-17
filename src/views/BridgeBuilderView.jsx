import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import BridgeBuilderSetup from '../components/bridgeBuilder/BridgeBuilderSetup.jsx';
import BridgeBuilderGame from '../components/bridgeBuilder/BridgeBuilderGame.jsx';
import LoosePlanksGame from '../components/bridgeBuilder/LoosePlanksGame.jsx';
import DeepScriptMode from '../components/deepScript/DeepScriptMode.jsx';
import { markBridgeBuilderComplete } from '../lib/bridgeBuilderStorage.js';

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
  const [sessionConfig, setSessionConfig] = useState(null);
  const [showDeepScript, setShowDeepScript] = useState(false);

  const handlePlay = (config) => {
    setSessionConfig(config);
  };

  const handleBackToSetup = () => {
    setSessionConfig(null);
    setShowDeepScript(false);
  };

  const handleBackToHome = () => {
    navigate('/home');
  };

  const handleDeepScriptOpen = () => {
    setShowDeepScript(true);
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

  if (showDeepScript) {
    return <DeepScriptMode onBack={handleBackToSetup} />;
  }

  if (sessionConfig) {
    if (sessionConfig.gameMode === 'loose_planks') {
      return (
        <LoosePlanksGame
          key={sessionConfig.packId || 'loose-planks'}
          sessionConfig={sessionConfig}
          onBack={handleBackToSetup}
        />
      );
    }

    return (
      <BridgeBuilderGame
        key={sessionConfig.packId || 'review'}
        sessionConfig={sessionConfig}
        onBack={handleBackToSetup}
        onRoundComplete={handleBridgeBuilderComplete}
      />
    );
  }

  return (
    <BridgeBuilderSetup
      onPlay={handlePlay}
      onBack={handleBackToHome}
      onDeepScript={handleDeepScriptOpen}
    />
  );
}
