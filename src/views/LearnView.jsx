import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLocalization } from '../context/LocalizationContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useTutorial } from '../context/TutorialContext.jsx';
import DualRoleConversationSession from '../components/conversation/DualRoleConversationSession.jsx';
import DualRoleConversationCardGrid from '../components/conversation/DualRoleConversationCardGrid.jsx';
import { buildDualRoleConversationCardItems } from '../components/conversation/dualRoleConversationCardData.js';
import { bridgeBuilderPacks } from '../data/bridgeBuilderPacks.js';

function getPackById(packId) {
  return bridgeBuilderPacks.find((pack) => pack.id === packId) || null;
}

function getContextualReadItem(pack, dualRoleItems) {
  if (!pack || !dualRoleItems.length) return null;

  const title = `${pack.title || ''} ${pack.theme || ''}`.toLowerCase();
  const preferredTheme = title.includes('food') || title.includes('cafe')
    ? 'food'
    : title.includes('home') || title.includes('family')
      ? 'home'
      : title.includes('time') || title.includes('number')
        ? 'time'
        : 'greeting';

  return dualRoleItems.find((item) => {
    const haystack = `${item.metadata?.title || ''} ${item.metadata?.subtitle || ''} ${item.title || ''} ${item.subtitle || ''}`.toLowerCase();
    return haystack.includes(preferredTheme);
  }) || dualRoleItems[0] || null;
}

export default function LearnView() {
  const { t } = useLocalization();
  const { languageId: practiceLanguageId } = useLanguage();
  const { startTutorial, hasCompletedTutorial, currentTutorial } = useTutorial();
  const [searchParams] = useSearchParams();
  const contextPackId = searchParams.get('packId');
  const contextPack = useMemo(() => contextPackId ? getPackById(contextPackId) : null, [contextPackId]);
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [selectedScript, setSelectedScript] = useState(null);

  // Auto-trigger readIntro tutorial on first visit
  useEffect(() => {
    if (!hasCompletedTutorial('readIntro') && !currentTutorial) {
      startTutorial('readIntro');
    }
  }, [hasCompletedTutorial, startTutorial, currentTutorial]);

  const dualRoleItems = useMemo(() => buildDualRoleConversationCardItems(), []);
  const contextualReadItem = useMemo(
    () => getContextualReadItem(contextPack, dualRoleItems),
    [contextPack, dualRoleItems]
  );

  const startConversationItem = (item) => {
    if (!item?.scenario) return;
    setSelectedScript(item.script);
    setSelectedScenario(item.scenario);
  };

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
        <h2 className="text-2xl font-semibold" style={{ color: 'var(--app-on-surface)', fontFamily: '"Baloo 2", system-ui, sans-serif' }}>
          {t('read.title', 'Read')}
        </h2>
        <p className="text-sm" style={{ color: 'var(--app-muted)' }}>
          {t(
            'read.intro',
            'Select a text to practice translating word by word. Type the translation and press Enter to continue.'
          )}
        </p>
      </header>

      {contextPack && (
        <section
          className="rounded-3xl p-4 space-y-3"
          style={{
            border: '1px solid rgba(18, 73, 61, 0.12)',
            background: 'linear-gradient(180deg, rgba(255, 247, 231, 0.98), rgba(244, 252, 247, 0.98))',
            boxShadow: '0 12px 28px rgba(18, 73, 61, 0.10)'
          }}
          aria-label={t('read.contextualPack.title', 'Read in context')}
        >
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wide" style={{ color: '#2a6a44' }}>
              {t('read.contextualPack.eyebrow', 'From Vocabulary Journey')}
            </p>
            <h3 className="text-xl font-bold" style={{ color: 'var(--app-on-surface)', fontFamily: '"Baloo 2", system-ui, sans-serif' }}>
              {t('read.contextualPack.heading', 'Read in Context: {{pack}}', { pack: contextPack.title })}
            </h3>
            <p className="text-sm" style={{ color: 'var(--app-muted)' }}>
              {t(
                'read.contextualPack.description',
                'Practice this pack inside a short sentence and conversation activity. This is the first bridge from pack words into reading.'
              )}
            </p>
          </div>

          {practiceLanguageId === 'hebrew' && contextualReadItem ? (
            <button
              type="button"
              className="w-full rounded-2xl px-4 py-3 text-left font-bold flex items-center justify-between"
              style={{
                background: 'linear-gradient(180deg, #ffba3d, #f59b1e)',
                color: '#fff',
                boxShadow: '0 8px 18px rgba(191, 103, 13, 0.22)'
              }}
              onClick={() => startConversationItem(contextualReadItem)}
            >
              <span>{t('read.contextualPack.start', 'Start contextual reading')}</span>
              <span className="material-symbols-outlined" aria-hidden="true">chevron_right</span>
            </button>
          ) : (
            <div className="rounded-xl p-3 text-sm" style={{ border: '1px solid var(--app-card-border)', background: 'var(--app-card-bg)', color: 'var(--app-muted)' }}>
              {t('read.contextualPack.unavailable', 'Contextual reading for this pack is not available in the selected language yet.')}
            </div>
          )}
        </section>
      )}

      <div className="space-y-4">
        <div className="space-y-1 px-1">
          <h3 className="text-sm font-semibold" style={{ color: 'var(--app-on-surface)' }}>
            {t('conversation.list.intro.title', 'Learn through conversation')}
          </h3>
          <p className="text-xs" style={{ color: 'var(--app-muted)' }}>
            {t(
              'conversation.list.intro.description',
              'Each scenario teaches you practical phrases through listening, speaking, and typing exercises.'
            )}
          </p>
        </div>

        {practiceLanguageId === 'hebrew' ? (
          <DualRoleConversationCardGrid
            items={dualRoleItems}
            onSelect={startConversationItem}
          />
        ) : (
          <div className="rounded-xl p-4 text-sm" style={{ border: '1px solid var(--app-card-border)', background: 'var(--app-card-bg)', color: 'var(--app-muted)' }}>
            {t('conversation.list.unavailable', 'No conversation practice available for this language yet.')}
          </div>
        )}
      </div>
    </div>
  );
}
