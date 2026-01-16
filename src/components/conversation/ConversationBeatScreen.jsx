import { useState, useCallback, useMemo } from 'react';
import { useLocalization } from '../../context/LocalizationContext.jsx';
import ListenMeaningChoice from './modules/ListenMeaningChoice.jsx';
import ShadowRepeat from './modules/ShadowRepeat.jsx';
import GuidedReplyChoice from './modules/GuidedReplyChoice.jsx';
import TypeInput from './modules/TypeInput.jsx';

/**
 * ConversationBeatScreen
 *
 * Displays a single beat (line + module) with:
 * - Context bar showing scenario and progress
 * - Transcript area showing previous beats
 * - Module panel for current beat
 * - Feedback panel
 * - "Save phrase" button
 */
export default function ConversationBeatScreen({
  scenario,
  beat,
  beatIndex,
  totalBeats,
  attemptHistory,
  onBeatComplete,
  onSavePhrase,
  onExit
}) {
  const { t } = useLocalization();
  const [showTranscript, setShowTranscript] = useState(false);

  // Find the line for this beat
  const currentLine = useMemo(() => {
    return scenario.lines.find(l => l.id === beat.lineId);
  }, [scenario.lines, beat.lineId]);

  // Get distractor lines for choice modules
  const distractorLines = useMemo(() => {
    return scenario.lines.filter(l => l.id !== beat.lineId);
  }, [scenario.lines, beat.lineId]);

  const handleModuleResult = useCallback((result) => {
    onBeatComplete({
      beat,
      ...result,
      timestamp: new Date().toISOString()
    });
  }, [beat, onBeatComplete]);

  const handleSavePhrase = useCallback(() => {
    if (currentLine) {
      onSavePhrase(currentLine.id);
    }
  }, [currentLine, onSavePhrase]);

  const toggleTranscript = useCallback(() => {
    setShowTranscript(prev => !prev);
  }, []);

  // Render the appropriate module
  const renderModule = useCallback(() => {
    if (!currentLine) {
      return (
        <div className="text-center text-slate-400 py-12">
          {t('conversation.beat.errorNoLine', 'Line not found')}
        </div>
      );
    }

    switch (beat.moduleId) {
      case 'listenMeaningChoice':
        return (
          <ListenMeaningChoice
            line={currentLine}
            distractorLines={distractorLines}
            onResult={handleModuleResult}
          />
        );
      case 'shadowRepeat':
        return (
          <ShadowRepeat
            line={currentLine}
            onResult={handleModuleResult}
          />
        );
      case 'guidedReplyChoice':
        return (
          <GuidedReplyChoice
            line={currentLine}
            distractorLines={distractorLines}
            onResult={handleModuleResult}
          />
        );
      case 'typeInput':
        return (
          <TypeInput
            line={currentLine}
            onResult={handleModuleResult}
          />
        );
      default:
        return (
          <div className="text-center text-slate-400 py-12">
            {t('conversation.beat.errorUnknownModule', 'Unknown module type')}
          </div>
        );
    }
  }, [currentLine, beat.moduleId, distractorLines, handleModuleResult, t]);

  // Calculate progress percentage
  const progressPercent = totalBeats > 0 ? ((beatIndex + 1) / totalBeats) * 100 : 0;

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-slate-100">
      {/* Top bar */}
      <div className="bg-slate-800/80 border-b border-slate-700 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-2 sm:py-3">
          <div className="flex items-center justify-between">
            {/* Left: Scenario info */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <button
                onClick={onExit}
                className="p-1.5 sm:p-2 hover:bg-slate-700 rounded-lg transition-colors flex-shrink-0"
                aria-label={t('conversation.beat.exit', 'Exit')}
              >
                <span className="text-lg sm:text-xl">←</span>
              </button>
              <div className="min-w-0">
                <div className="text-xs sm:text-sm font-medium text-slate-400 truncate">
                  {t(scenario.metadata.titleKey, scenario.metadata.theme)}
                </div>
                <div className="text-[10px] sm:text-xs text-slate-500">
                  {t('conversation.beat.progress', 'Beat {{current}} of {{total}}', {
                    current: beatIndex + 1,
                    total: totalBeats
                  })}
                </div>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
              {/* Transcript toggle */}
              <button
                onClick={toggleTranscript}
                className={`
                  px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg text-xs sm:text-sm font-medium
                  transition-all duration-200
                  ${showTranscript
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }
                `}
              >
                <span className="hidden sm:inline">📜 {t('conversation.beat.transcript', 'Transcript')}</span>
                <span className="sm:hidden">📜</span>
              </button>

              {/* Save phrase button */}
              <button
                onClick={handleSavePhrase}
                className="px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg text-xs sm:text-sm font-medium bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors"
                title={t('conversation.beat.savePhrase', 'Save phrase to SRS')}
              >
                💾
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-2 sm:mt-3 h-1 sm:h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
          {/* Transcript panel (collapsible) */}
          {showTranscript && attemptHistory.length > 0 && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-slate-800/50 rounded-xl border border-slate-700">
              <h3 className="text-base sm:text-lg font-semibold mb-3 text-slate-300">
                {t('conversation.beat.transcriptTitle', 'Previous beats')}
              </h3>
              <div className="flex flex-col gap-2 sm:gap-3 max-h-60 overflow-y-auto">
                {attemptHistory.map((attempt, idx) => {
                  const attemptLine = scenario.lines.find(l => l.id === attempt.beat.lineId);
                  if (!attemptLine) return null;

                  return (
                    <div
                      key={idx}
                      className="flex flex-col gap-1.5 p-3 bg-slate-800 rounded-lg border border-slate-700/50"
                    >
                      {/* Hebrew */}
                      <div className="text-sm sm:text-base font-semibold text-slate-200" dir="rtl">
                        {attemptLine.he}
                      </div>
                      {/* English */}
                      <div className="text-xs sm:text-sm text-slate-400">
                        {attemptLine.en}
                      </div>
                      {/* Result indicator */}
                      <div className="text-xs">
                        {attempt.isCorrect ? (
                          <span className="text-emerald-400">✓ Correct</span>
                        ) : (
                          <span className="text-amber-400">~ {attempt.resultType}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Module panel */}
          <div>
            {renderModule()}
          </div>
        </div>
      </div>
    </div>
  );
}
