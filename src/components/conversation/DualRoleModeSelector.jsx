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
    }
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center px-4 py-6 sm:p-6">
      <div className="max-w-3xl w-full">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          {onBack && (
            <button
              onClick={onBack}
              className="mb-3 flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <span className="text-xl">←</span>
              <span className="text-sm">Back</span>
            </button>
          )}

          <h1 className="text-2xl sm:text-3xl font-bold mb-2">
            {t('conversation.modeSelector.title', 'Conversation Practice')}
          </h1>
          <p className="text-sm sm:text-base text-slate-400">
            {t('conversation.modeSelector.subtitle', 'Choose your practice mode')}
          </p>
        </div>

        {/* Mode cards */}
        <div className="grid gap-3 sm:gap-4">
          {modes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => onSelectMode(mode.id)}
              className="w-full text-left bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-750 hover:to-slate-850 border border-slate-700 hover:border-slate-600 rounded-xl p-4 sm:p-5 transition-all duration-200 active:scale-98 shadow-lg hover:shadow-xl relative overflow-hidden"
            >
              {/* Recommended badge */}
              {mode.recommended && (
                <div className="absolute top-2 right-2 sm:top-3 sm:right-3 px-2 py-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[10px] sm:text-xs font-bold rounded-full">
                  ★ RECOMMENDED
                </div>
              )}

              {/* Header */}
              <div className="flex items-start gap-3 mb-3 pr-20">
                <div className="text-3xl sm:text-4xl flex-shrink-0">{mode.icon}</div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg sm:text-xl font-bold text-slate-100 mb-1">
                    {mode.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400">
                    {mode.subtitle}
                  </p>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-slate-300 mb-3 leading-relaxed">
                {mode.description}
              </p>

              {/* Features */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
                {mode.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-slate-400">
                    <span className="text-emerald-400 mt-0.5">✓</span>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
