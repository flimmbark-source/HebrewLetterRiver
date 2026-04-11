import React from 'react';
import { PLAN_PRICES, startCheckout, completeCheckout } from '../lib/checkoutService.js';
import { usePremium } from '../context/PremiumContext.jsx';
import { useProgress } from '../context/ProgressContext.jsx';
import { emit } from '../lib/eventBus.js';

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

const PLAN_ORDER = ['monthly', 'annual', 'lifetime'];

const PLAN_EXTRAS = {
  monthly: { badge: null },
  annual: { badge: 'Best Value' },
  lifetime: { badge: 'One-Time' },
};

export default function PaywallModal({ isOpen, onClose, surface = 'unknown', feature = '' }) {
  const { setPremiumStatus } = usePremium();
  const { player } = useProgress();
  const [selectedPlan, setSelectedPlan] = React.useState('annual');

  React.useEffect(() => {
    if (isOpen) {
      emit('paywall_viewed', { surface, feature });
    }
  }, [isOpen, surface, feature]);

  if (!isOpen) return null;

  // Don't show paywall if user hasn't completed first session
  if ((player?.totals?.sessions ?? 0) < 1) {
    return null;
  }

  const handlePurchase = () => {
    const intent = startCheckout(selectedPlan);
    if (!intent) return;

    // In production: redirect to payment. For now, simulate success.
    const status = completeCheckout({ plan: selectedPlan });
    if (status) {
      setPremiumStatus(status);
      onClose?.();
    }
  };

  const contextTitle = feature
    ? `Unlock ${feature}`
    : 'Upgrade to Premium';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div
        className="w-full max-w-md rounded-3xl p-6 shadow-2xl animate-scale-in"
        style={{ background: 'var(--app-card-bg)', border: '1px solid var(--app-card-border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold" style={{ fontFamily: '"Baloo 2", system-ui, sans-serif', color: 'var(--app-on-surface)' }}>
            {contextTitle}
          </h2>
          <button type="button" onClick={onClose} className="rounded-full p-2 transition-colors" style={{ color: 'var(--app-muted)' }}>
            <Icon>close</Icon>
          </button>
        </div>

        {/* Value props */}
        <div className="mt-4 space-y-2">
          {[
            { icon: 'all_inclusive', text: 'Unlimited access to all modes' },
            { icon: 'extension', text: 'All vocabulary packs unlocked' },
            { icon: 'explore', text: 'Unlimited Deep Script runs' },
            { icon: 'bar_chart', text: 'Advanced learning statistics' },
          ].map((item) => (
            <div key={item.icon} className="flex items-center gap-3">
              <Icon className="text-lg" filled style={{ color: 'var(--app-primary)' }}>{item.icon}</Icon>
              <span className="text-sm font-medium" style={{ color: 'var(--app-on-surface)' }}>{item.text}</span>
            </div>
          ))}
        </div>

        {/* Plan selector */}
        <div className="mt-5 space-y-2">
          {PLAN_ORDER.map((planId) => {
            const plan = PLAN_PRICES[planId];
            const extra = PLAN_EXTRAS[planId];
            const isSelected = selectedPlan === planId;
            return (
              <button
                key={planId}
                type="button"
                onClick={() => setSelectedPlan(planId)}
                className="flex w-full items-center justify-between rounded-xl p-4 text-left transition-all"
                style={{
                  border: isSelected ? '2px solid var(--app-primary)' : '1px solid var(--app-card-border)',
                  background: isSelected ? 'var(--app-surface)' : 'transparent',
                }}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold" style={{ color: 'var(--app-on-surface)' }}>{plan.label}</span>
                    {extra.badge && (
                      <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: 'var(--app-primary)', color: '#fff' }}>
                        {extra.badge}
                      </span>
                    )}
                  </div>
                  <span className="text-xs" style={{ color: 'var(--app-muted)' }}>
                    {plan.period ? `$${plan.amount}/${plan.period}` : `$${plan.amount} one-time`}
                    {planId === 'annual' ? ' ($3.99/mo)' : ''}
                  </span>
                </div>
                <div className="flex h-5 w-5 items-center justify-center rounded-full" style={{ border: `2px solid ${isSelected ? 'var(--app-primary)' : 'var(--app-muted)'}` }}>
                  {isSelected && <div className="h-2.5 w-2.5 rounded-full" style={{ background: 'var(--app-primary)' }} />}
                </div>
              </button>
            );
          })}
        </div>

        {/* CTA */}
        <button
          type="button"
          onClick={handlePurchase}
          className="btn-cta mt-5 w-full py-4 text-base font-bold"
        >
          Start Premium
        </button>

        {/* Dismiss */}
        <button
          type="button"
          onClick={onClose}
          className="mt-3 w-full py-2 text-center text-sm font-medium"
          style={{ color: 'var(--app-muted)' }}
        >
          Not now
        </button>

        <p className="mt-2 text-center text-[10px]" style={{ color: 'var(--app-muted)' }}>
          7-day free trial. Cancel anytime.
        </p>
      </div>
    </div>
  );
}
