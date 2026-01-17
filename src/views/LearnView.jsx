import React, { useState, useEffect, useMemo } from 'react';
import { useLocalization } from '../context/LocalizationContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useTutorial } from '../context/TutorialContext.jsx';
import DualRoleConversationSession from '../components/conversation/DualRoleConversationSession.jsx';
import DualRoleConversationCardGrid from '../components/conversation/DualRoleConversationCardGrid.jsx';
import { buildDualRoleConversationCardItems } from '../components/conversation/dualRoleConversationCardData.js';

export default function LearnView() {
  const { t } = useLocalization();
  const { languageId: practiceLanguageId } = useLanguage();
  const { startTutorial, hasCompletedTutorial, currentTutorial } = useTutorial();
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [selectedScript, setSelectedScript] = useState(null);

  // Auto-trigger readIntro tutorial on first visit
  useEffect(() => {
    if (!hasCompletedTutorial('readIntro') && !currentTutorial) {
      startTutorial('readIntro');
    }
  }, [hasCompletedTutorial, startTutorial, currentTutorial]);

  const dualRoleItems = useMemo(() => buildDualRoleConversationCardItems(), []);

  if (selectedScenario && selectedScript) {
    return (
      <DualRoleConversationSession
        scenario={selectedScenario}
        script={selectedScript}
        onExit={() => {
          setSelectedScenario(null);
          setSelectedScript(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <header className="space-y-2 px-1">
        <h2 className="text-2xl font-semibold text-slate-800">
          {t('read.title', 'Read')}
        </h2>
        <p className="text-sm text-slate-600">
          {t(
            'read.intro',
            'Select a text to practice translating word by word. Type the translation and press Enter to continue.'
          )}
        </p>
      </header>

      <div className="space-y-4">
        <div className="space-y-1 px-1">
          <h3 className="text-sm font-semibold text-slate-800">
            {t('conversation.list.intro.title', 'Learn through conversation')}
          </h3>
          <p className="text-xs text-slate-600">
            {t(
              'conversation.list.intro.description',
              'Each scenario teaches you practical phrases through listening, speaking, and typing exercises.'
            )}
          </p>
        </div>

        {practiceLanguageId === 'hebrew' ? (
          <DualRoleConversationCardGrid
            items={dualRoleItems}
            onSelect={(item) => {
              if (!item.scenario) return;
              setSelectedScript(item.script);
              setSelectedScenario(item.scenario);
            }}
          />
        ) : (
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
            {t('conversation.list.unavailable', 'Conversation practice is currently available for Hebrew.')}
          </div>
        )}
      </div>
    </div>
  );
}
