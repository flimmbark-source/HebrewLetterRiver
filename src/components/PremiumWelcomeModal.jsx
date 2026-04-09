import React from 'react';
import { loadState, saveState } from '../lib/storage.js';
import { usePremium } from '../context/PremiumContext.jsx';
import { celebrate } from '../lib/celebration.js';

function Icon({ children, className = '', filled = false }) {
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={{ fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' 500, 'GRAD' 0, 'opsz' 24` }}
      aria-hidden="true"
    >
      {children}
    </span>
  );
}

const UNLOCKED_FEATURES = [
  { icon: 'extension', text: 'All vocabulary packs are now unlocked' },
  { icon: 'explore', text: 'Unlimited Deep Script dungeon runs' },
  { icon: 'forum', text: 'Every conversation scenario available' },
  { icon: 'bar_chart', text: 'Advanced learning statistics ready' },
];

export default function PremiumWelcomeModal() {
  const { isPremium } = usePremium();
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    if (isPremium && !loadState('premium.welcomeShown', false)) {
      setIsVisible(true);
      celebrate({ particleCount: 160, spread: 90, originY: 0.45 });
    }
  }, [isPremium]);

  if (!isVisible) return null;

  const handleContinue = () => {
    saveState('premium.welcomeShown', true);
    setIsVisible(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div
        className="w-full max-w-md rounded-3xl p-6 text-center shadow-2xl animate-scale-in"
        style={{ background: 'var(--app-card-bg)', border: '1px solid var(--app-card-border)' }}
      >
        {/* Premium icon */}
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full" style={{ background: 'linear-gradient(135deg, #D4A017, #F5D76E)' }}>
          <Icon className="text-4xl" filled style={{ color: '#fff' }}>workspace_premium</Icon>
        </div>

        <h2 className="text-2xl font-bold" style={{ fontFamily: '"Baloo 2", system-ui, sans-serif', color: 'var(--app-on-surface)' }}>
          Welcome to Premium!
        </h2>
        <p className="mt-2 text-sm" style={{ color: 'var(--app-muted)' }}>
          Thank you for supporting Letter River. Here's what just unlocked:
        </p>

        {/* Unlocked features */}
        <div className="mt-5 space-y-3 text-left">
          {UNLOCKED_FEATURES.map((feature) => (
            <div key={feature.icon} className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ background: 'rgba(212, 160, 23, 0.15)' }}>
                <Icon className="text-base" filled style={{ color: '#D4A017' }}>{feature.icon}</Icon>
              </div>
              <span className="text-sm font-medium" style={{ color: 'var(--app-on-surface)' }}>{feature.text}</span>
            </div>
          ))}
        </div>

        {/* Suggestion */}
        <div className="mt-5 rounded-xl p-3" style={{ background: 'var(--app-surface)', border: '1px solid var(--app-card-border)' }}>
          <p className="text-xs font-bold" style={{ color: 'var(--app-primary)' }}>Try this first</p>
          <p className="mt-1 text-sm" style={{ color: 'var(--app-on-surface)' }}>
            Explore a new vocabulary pack in Bridge Builder — all packs are now unlocked!
          </p>
        </div>

        <button type="button" onClick={handleContinue} className="btn-cta mt-5 w-full py-4 text-base font-bold">
          Continue
        </button>
      </div>
    </div>
  );
}
