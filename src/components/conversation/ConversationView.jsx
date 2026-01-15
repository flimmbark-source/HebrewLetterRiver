import { useState, useCallback } from 'react';
import ConversationScenarioList from './ConversationScenarioList.jsx';
import ConversationSession from './ConversationSession.jsx';
import DualRoleConversationSession from './DualRoleConversationSession.jsx';
import DualRoleModeSelector from './DualRoleModeSelector.jsx';

/**
 * ConversationView
 *
 * Top-level component for conversation practice mode.
 * Manages navigation between mode selection, scenario selection, and active session.
 * Supports both regular and dual-role conversation practice modes.
 */
export default function ConversationView({ onBack }) {
  const [practiceMode, setPracticeMode] = useState(null); // null | 'regular' | 'dual-role'
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [selectedScript, setSelectedScript] = useState(null);

  const handleSelectMode = useCallback((mode) => {
    setPracticeMode(mode);
  }, []);

  const handleSelectScenario = useCallback((scenario) => {
    setSelectedScenario(scenario);
  }, []);

  const handleSelectScript = useCallback((script, scenario) => {
    setSelectedScript(script);
    setSelectedScenario(scenario);
  }, []);

  const handleExitSession = useCallback(() => {
    setSelectedScenario(null);
    setSelectedScript(null);
  }, []);

  const handleBackToModeSelection = useCallback(() => {
    setPracticeMode(null);
    setSelectedScenario(null);
    setSelectedScript(null);
  }, []);

  // Show dual-role session if dual-role script is selected
  if (practiceMode === 'dual-role' && selectedScript && selectedScenario) {
    return (
      <DualRoleConversationSession
        scenario={selectedScenario}
        script={selectedScript}
        onExit={handleExitSession}
      />
    );
  }

  // Show regular session if regular scenario is selected
  if (practiceMode === 'regular' && selectedScenario) {
    return (
      <ConversationSession
        scenario={selectedScenario}
        onExit={handleExitSession}
      />
    );
  }

  // Show scenario list if mode is selected
  if (practiceMode) {
    return (
      <ConversationScenarioList
        onSelectScenario={handleSelectScenario}
        onSelectScript={handleSelectScript}
        onBack={handleBackToModeSelection}
        mode={practiceMode}
      />
    );
  }

  // Show mode selector
  return (
    <DualRoleModeSelector
      onSelectMode={handleSelectMode}
      onBack={onBack}
    />
  );
}
