import { useLocalization } from '../../context/LocalizationContext.jsx';

/**
 * DualRoleModeSelector
 *
 * Allows users to choose between regular and dual-role conversation practice modes.
 */
export default function DualRoleModeSelector({ onSelectMode, onBack }) {
  const { t } = useLocalization();

  const modes = [
    {
      id: 'dual-role',
      title: 'Dual-Role Conversation',
      subtitle: 'Play both sides of a dialogue',
      description: 'Learn by playing both Speaker A and Speaker B in short conversations. Each turn alternates between listening/speaking and typing/choosing.',
      icon: '🎭',
      recommended: true,
      features: [
        'Shorter, focused sessions (4 turns)',
        'Alternating module pairs (Listen→Shadow, Type→Choose)',
        'Conversation-like progression',
        'Reinforcement for new phrases'
      ]
    },
    {
      id: 'regular',
      title: 'Regular Practice',
      subtitle: 'Traditional multi-module practice',
      description: 'Practice each phrase through all four modules in sequence. Comprehensive practice for deeper mastery.',
      icon: '📚',
      recommended: false,
      features: [
        'Complete module sequence per phrase',
        'Listen → Shadow → Reply → Type',
        'Thorough reinforcement',
        'Best for difficult content'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          {onBack && (
            <button
              onClick={onBack}
              className="mb-3 sm:mb-4 flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <span className="text-xl">←</span>
              <span>Back</span>
            </button>
          )}

          <h1 className="text-2xl sm:text-4xl font-bold mb-1 sm:mb-2">
            Conversation Practice
          </h1>
          <p className="text-base sm:text-lg text-slate-400">
            Choose your practice mode
          </p>
        </div>

        {/* Intro message */}
        <div className="mb-6 sm:mb-8 p-4 sm:p-5 bg-blue-900/20 border border-blue-700/50 rounded-lg">
          <div className="flex items-start gap-3">
            <span className="text-xl sm:text-2xl flex-shrink-0">💡</span>
            <div>
              <h3 className="font-semibold text-slate-200 mb-1 text-sm sm:text-base">
                New: Dual-Role Conversations
              </h3>
              <p className="text-xs sm:text-sm text-slate-300">
                Try our new conversation-style learning where you practice both sides of a dialogue.
                It's more engaging and helps you learn faster!
              </p>
            </div>
          </div>
        </div>

        {/* Mode cards */}
        <div className="grid gap-4 sm:gap-6">
          {modes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => onSelectMode(mode.id)}
              className="w-full text-left bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-750 hover:to-slate-850 border border-slate-700 hover:border-slate-600 rounded-xl p-4 sm:p-6 transition-all duration-200 active:scale-98 shadow-lg hover:shadow-xl relative overflow-hidden"
            >
              {/* Recommended badge */}
              {mode.recommended && (
                <div className="absolute top-3 right-3 sm:top-4 sm:right-4 px-2 py-0.5 sm:px-3 sm:py-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[10px] sm:text-xs font-bold rounded-full shadow-lg">
                  RECOMMENDED
                </div>
              )}

              {/* Header */}
              <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4 pr-20 sm:pr-24">
                <div className="text-3xl sm:text-4xl flex-shrink-0">{mode.icon}</div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg sm:text-2xl font-bold text-slate-100 mb-0.5 sm:mb-1">
                    {mode.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400">
                    {mode.subtitle}
                  </p>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm sm:text-base text-slate-300 mb-3 sm:mb-4 leading-relaxed">
                {mode.description}
              </p>

              {/* Features */}
              <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4">
                {mode.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-400">
                    <span className="text-emerald-400 mt-0.5 flex-shrink-0">✓</span>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-slate-700">
                <span className="text-xs sm:text-sm text-slate-500">
                  Select this mode
                </span>
                <span className="text-slate-400">→</span>
              </div>
            </button>
          ))}
        </div>

        {/* Help text */}
        <div className="mt-6 sm:mt-8 text-center text-xs sm:text-sm text-slate-500 px-2">
          <p>Not sure which to choose? Start with Dual-Role Conversation - it's more engaging for beginners!</p>
        </div>
      </div>
    </div>
  );
}
