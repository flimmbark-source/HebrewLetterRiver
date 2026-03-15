import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BridgeBuilderSetup from '../components/bridgeBuilder/BridgeBuilderSetup.jsx';
import BridgeBuilderGame from '../components/bridgeBuilder/BridgeBuilderGame.jsx';

/**
 * BridgeBuilderView — routes between setup screen and gameplay.
 *
 * Flow:
 *   1. Player sees setup screen (pack selection / random review)
 *   2. Player presses Play → sessionConfig is set
 *   3. BridgeBuilderGame launches with the config
 *   4. "Back" from gameplay returns to setup screen
 */
export default function BridgeBuilderView() {
  const navigate = useNavigate();
  const [sessionConfig, setSessionConfig] = useState(null);

  const handlePlay = (config) => {
    setSessionConfig(config);
  };

  const handleBackToSetup = () => {
    setSessionConfig(null);
  };

  const handleBackToHome = () => {
    navigate('/home');
  };

  if (sessionConfig) {
    return (
      <BridgeBuilderGame
        key={sessionConfig.packId || 'review'}
        sessionConfig={sessionConfig}
        onBack={handleBackToSetup}
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
