import { useState, useCallback } from 'react';
import ConversationScenarioList from './ConversationScenarioList.jsx';
import ConversationSession from './ConversationSession.jsx';

/**
 * ConversationView
 *
 * Top-level component for conversation practice mode.
 * Manages navigation between scenario selection and active session.
 */
export default function ConversationView({ onBack }) {
  const [selectedScenario, setSelectedScenario] = useState(null);

  const handleSelectScenario = useCallback((scenario) => {
    setSelectedScenario(scenario);
  }, []);

  const handleExitSession = useCallback(() => {
    setSelectedScenario(null);
  }, []);

  // Show session if scenario is selected
  if (selectedScenario) {
    return (
      <ConversationSession
        scenario={selectedScenario}
        onExit={handleExitSession}
      />
    );
  }

  // Show scenario list
  return (
    <ConversationScenarioList
      onSelectScenario={handleSelectScenario}
      onBack={onBack}
    />
  );
}
