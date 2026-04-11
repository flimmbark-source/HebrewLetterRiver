import React from 'react';
import { PLAN_PRICES, startCheckout, completeCheckout } from '../lib/checkoutService.js';
import { usePremium } from '../context/PremiumContext.jsx';

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

const BENEFITS = [
  { icon: 'waves', title: 'Unlimited Letter River', desc: 'Always free — no limits ever' },
  { icon: 'extension', title: 'All Vocabulary Packs', desc: 'Unlock every word pack in Bridge Builder' },
  { icon: 'explore', title: 'Unlimited Deep Script', desc: 'No daily run limit — explore endlessly' },
  { icon: 'forum', title: 'Unlimited Conversations', desc: 'Practice every dialogue scenario' },
  { icon: 'bar_chart', title: 'Advanced Statistics', desc: 'Deep insights into your learning progress' },
  { icon: 'palette', title: 'Custom Themes', desc: 'Personalize your learning environment' },
  { icon: 'block', title: 'Ad-Free Experience', desc: 'No interruptions, just learning' },
  { icon: 'favorite', title: 'Support Development', desc: 'Help us add new languages and features' },
];

export default function PremiumValueScreen({ onClose, onSelectPlan }) {
  const { isPremium, setPremiumStatus } = usePremium();
  const [selectedPlan, setSelectedPlan] = React.useState('annual');

  const handlePurchase = () => {
    if (onSelectPlan) {
      onSelectPlan(selectedPlan);
      return;
    }
    const intent = startCheckout(selectedPlan);
    if (!intent) return;
    const status = completeCheckout({ plan: selectedPlan });
    if (status) {
      setPremiumStatus(status);
      onClose?.();
    }
  };

  if (isPremium) {
    return (
      <div className="mx-auto max-w-lg space-y-6 px-4 py-8">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full" style={{ background: 'linear-gradient(135deg, #D4A017, #F5D76E)' }}>
            <Icon className="text-3xl" filled style={{ color: '#fff' }}>workspace_premium</Icon>
          </div>
          <h2 className="text-2xl font-bold" style={{ fontFamily: '"Baloo 2", system-ui, sans-serif', color: 'var(--app-on-surface)' }}>
            You're Premium!
          </h2>
          <p className="mt-2 text-sm" style={{ color: 'var(--app-muted)' }}>
            Thank you for supporting Letter River. All features are unlocked.
          </p>
        </div>
        {onClose && (
          <button type="button" onClick={onClose} className="btn-cta mx-auto block px-8 py-3">
            Continue Learning
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-6 px-4 py-8">
      {/* Hero */}
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full" style={{ background: 'linear-gradient(135deg, var(--app-primary), #145e42)' }}>
          <Icon className="text-3xl" filled style={{ color: '#fff' }}>workspace_premium</Icon>
        </div>
        <h2 className="text-2xl font-bold" style={{ fontFamily: '"Baloo 2", system-ui, sans-serif', color: 'var(--app-on-surface)' }}>
          Letter River Premium
        </h2>
        <p className="mt-2 text-sm" style={{ color: 'var(--app-muted)' }}>
          Unlock the full learning experience
        </p>
      </div>

      {/* Benefits grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {BENEFITS.map((benefit) => (
          <div
            key={benefit.icon}
            className="flex items-start gap-3 rounded-xl p-3"
            style={{ background: 'var(--app-surface)', border: '1px solid var(--app-card-border)' }}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" style={{ background: 'var(--app-primary)', opacity: 0.15 }}>
              <Icon className="text-lg" filled style={{ color: 'var(--app-primary)' }}>{benefit.icon}</Icon>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold" style={{ color: 'var(--app-on-surface)' }}>{benefit.title}</p>
              <p className="text-xs" style={{ color: 'var(--app-muted)' }}>{benefit.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Pricing */}
      <div className="space-y-2">
        {['monthly', 'annual', 'lifetime'].map((planId) => {
          const plan = PLAN_PRICES[planId];
          const isSelected = selectedPlan === planId;
          const isAnnual = planId === 'annual';
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
                  {isAnnual && (
                    <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: 'var(--app-primary)', color: '#fff' }}>
                      Best Value
                    </span>
                  )}
                </div>
                <span className="text-xs" style={{ color: 'var(--app-muted)' }}>
                  {plan.period ? `$${plan.amount}/${plan.period}` : `$${plan.amount} one-time`}
                  {isAnnual ? ' ($3.99/mo)' : ''}
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
      <button type="button" onClick={handlePurchase} className="btn-cta w-full py-4 text-base font-bold">
        Start Premium
      </button>

      {onClose && (
        <button type="button" onClick={onClose} className="w-full py-2 text-center text-sm font-medium" style={{ color: 'var(--app-muted)' }}>
          Maybe later
        </button>
      )}

      <p className="text-center text-[10px]" style={{ color: 'var(--app-muted)' }}>
        7-day free trial. Cancel anytime. Prices in USD.
      </p>
    </div>
  );
}
