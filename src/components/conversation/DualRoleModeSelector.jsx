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
    <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-3 sm:p-4">
      <div className="max-w-2xl w-full">
        {/* Header - minimal */}
        {onBack && (
          <button
            onClick={onBack}
            className="mb-2 flex items-center gap-1.5 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <span className="text-base sm:text-lg">←</span>
            <span className="text-xs sm:text-sm">Back</span>
          </button>
        )}

        <h1 className="text-lg sm:text-xl font-bold mb-3 text-center">
          Choose Practice Mode
        </h1>

        {/* Mode cards - ultra compact */}
        <div className="grid gap-2">
          {modes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => onSelectMode(mode.id)}
              className="w-full text-left bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-750 hover:to-slate-850 border border-slate-700 hover:border-slate-600 rounded-lg p-2.5 sm:p-3 transition-all duration-200 active:scale-98 shadow-lg hover:shadow-xl relative overflow-hidden"
            >
              {/* Recommended badge */}
              {mode.recommended && (
                <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 px-1.5 py-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[8px] sm:text-[9px] font-bold rounded-full">
                  ★ RECOMMENDED
                </div>
              )}

              {/* Header row */}
              <div className="flex items-start gap-2 sm:gap-3 pr-14 sm:pr-16 mb-2">
                <div className="text-xl sm:text-2xl flex-shrink-0">{mode.icon}</div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-sm sm:text-base font-bold text-slate-100 leading-tight">
                    {mode.title}
                  </h2>
                  <p className="text-[10px] sm:text-xs text-slate-400 leading-tight mt-0.5">
                    {mode.subtitle}
                  </p>
                </div>
              </div>

              {/* Description */}
              <p className="text-[11px] sm:text-xs text-slate-300 leading-snug mb-2">
                {mode.description}
              </p>

              {/* Key features - compact */}
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] sm:text-xs text-slate-400">
                {mode.features.slice(0, 2).map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-1">
                    <span className="text-emerald-400">✓</span>
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
