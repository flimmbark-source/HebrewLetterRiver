import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLocalization } from '../context/LocalizationContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useTutorial } from '../context/TutorialContext.jsx';
import DualRoleConversationSession from '../components/conversation/DualRoleConversationSession.jsx';
import DualRoleConversationCardGrid from '../components/conversation/DualRoleConversationCardGrid.jsx';
import { buildDualRoleConversationCardItems } from '../components/conversation/dualRoleConversationCardData.js';
import { bridgeBuilderPacks } from '../data/bridgeBuilderPacks.js';
import riverBackground from '../assets/Reading/River-Background.png';

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

  useEffect(() => {
    if (selectedScenario && selectedScript) {
      document.body.classList.remove('read-logbook-active');
      return undefined;
    }

    document.body.classList.add('read-logbook-active');
    return () => {
      document.body.classList.remove('read-logbook-active');
    };
  }, [selectedScenario, selectedScript]);

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
    <div className="river-logbook-page -mx-3 -mt-2 space-y-5 sm:mx-0 sm:mt-0">
      <section
        className="relative overflow-hidden rounded-[2rem] border px-5 pb-5 pt-8 shadow-xl sm:px-6 sm:pt-10"
        style={{
          borderColor: 'rgba(35, 90, 72, 0.12)',
          background: 'linear-gradient(180deg, rgba(255, 250, 238, 0.96), rgba(240, 249, 244, 0.92))',
          boxShadow: '0 18px 44px rgba(25, 68, 55, 0.14)'
        }}
      >
        <div
          className="absolute inset-0 bg-cover bg-center opacity-70"
          style={{ backgroundImage: `url(${riverBackground})` }}
          aria-hidden="true"
        />
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(180deg, rgba(255, 251, 239, 0.62), rgba(255, 251, 239, 0.20) 42%, rgba(255, 251, 239, 0.90) 100%)'
          }}
          aria-hidden="true"
        />

        <div className="relative mx-auto max-w-2xl text-center">
          <div className="mb-2 text-2xl" aria-hidden="true">⌁</div>
          <h2
            className="text-3xl font-bold tracking-tight sm:text-4xl"
            style={{ color: '#153d2e', fontFamily: '"Baloo 2", system-ui, sans-serif' }}
          >
            {t('read.logbook.title', 'River Logbook')}
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm font-medium sm:text-base" style={{ color: '#315c4b' }}>
            {t('read.logbook.subtitle', 'Practice real conversations as you travel downriver.')}
          </p>
        </div>
      </section>

      {contextPack && (
        <section
          className="mx-3 rounded-[1.75rem] p-4 space-y-3 sm:mx-0"
          style={{
            border: '1px solid rgba(18, 73, 61, 0.12)',
            background: 'linear-gradient(180deg, rgba(255, 247, 231, 0.98), rgba(244, 252, 247, 0.98))',
            boxShadow: '0 12px 28px rgba(18, 73, 61, 0.10)'
          }}
          aria-label={t('read.contextualPack.title', 'Read in context')}
        >
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-[0.16em]" style={{ color: '#2a6a44' }}>
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
                background: 'linear-gradient(180deg, #c77912, #af650e)',
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

      <section className="mx-3 space-y-3 sm:mx-0">
        <div className="flex items-end justify-between gap-3 px-1">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em]" style={{ color: '#2f6b4c' }}>
              <span aria-hidden="true">☙</span>
              {t('read.logbook.todayRoutes', 'Today’s Routes')}
            </div>
            <p className="mt-1 text-xs sm:text-sm" style={{ color: 'var(--app-muted)' }}>
              {t(
                'read.logbook.routesDescription',
                'Choose a route, listen to both sides, and build meaning step by step.'
              )}
            </p>
          </div>
        </div>

        {practiceLanguageId === 'hebrew' ? (
          <DualRoleConversationCardGrid
            items={dualRoleItems}
            onSelect={startConversationItem}
          />
        ) : (
          <div className="rounded-2xl p-4 text-sm" style={{ border: '1px solid var(--app-card-border)', background: 'var(--app-card-bg)', color: 'var(--app-muted)' }}>
            {t('conversation.list.unavailable', 'No conversation practice available for this language yet.')}
          </div>
        )}
      </section>
    </div>
  );
}
