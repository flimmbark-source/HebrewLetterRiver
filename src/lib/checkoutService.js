/**
 * Checkout Service — placeholder for payment integration.
 *
 * In production this would talk to Stripe, App Store, or Play Store.
 * For now it saves intent locally and supports a dev-mode mock purchase.
 */
import { loadState, saveState } from './storage.js';
import { emit } from './eventBus.js';

const CHECKOUT_PENDING_KEY = 'premium.checkoutPending';

const PLAN_PRICES = {
  monthly: { amount: 6.99, label: 'Monthly', period: 'month' },
  annual: { amount: 47.99, label: 'Annual', period: 'year' },
  lifetime: { amount: 89.99, label: 'Lifetime', period: null },
};

/**
 * Begin the checkout flow for a given plan.
 * Returns the checkout intent object.
 */
export function startCheckout(plan) {
  const priceInfo = PLAN_PRICES[plan];
  if (!priceInfo) {
    console.warn('startCheckout: unknown plan', plan);
    return null;
  }

  const intent = {
    plan,
    price: priceInfo.amount,
    label: priceInfo.label,
    timestamp: new Date().toISOString(),
    status: 'pending',
  };

  saveState(CHECKOUT_PENDING_KEY, intent);
  emit('checkout_started', { plan, price: priceInfo.amount });

  // Placeholder: in production, open payment URL
  // window.open(`https://checkout.letterriver.app/${plan}`, '_blank');

  return intent;
}

/**
 * Complete a checkout with receipt data.
 * Returns an object suitable for PremiumContext.setPremiumStatus().
 */
export function completeCheckout(receiptData) {
  if (!receiptData || !receiptData.plan) {
    console.warn('completeCheckout: invalid receipt', receiptData);
    return null;
  }

  const priceInfo = PLAN_PRICES[receiptData.plan];
  const now = new Date();

  let expiresAt = null;
  if (receiptData.plan === 'monthly') {
    expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
  } else if (receiptData.plan === 'annual') {
    expiresAt = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString();
  }
  // lifetime: expiresAt stays null

  const status = {
    isPremium: true,
    purchasedAt: now.toISOString(),
    plan: receiptData.plan,
    expiresAt,
  };

  // Clear pending checkout
  saveState(CHECKOUT_PENDING_KEY, null);

  emit('premium_started', { plan: receiptData.plan, price: priceInfo?.amount });

  return status;
}

/**
 * Check for a pending checkout (e.g. after app reload).
 */
export function getPendingCheckout() {
  return loadState(CHECKOUT_PENDING_KEY, null);
}

/**
 * Restore a previous purchase. Placeholder for app store restore.
 */
export function restorePurchase() {
  const stored = loadState('premium.status', null);
  if (stored && stored.isPremium) {
    return stored;
  }
  return null;
}

/**
 * Dev-mode mock purchase. Only works when dev.mockPremium is set.
 */
export function mockPurchase(plan = 'lifetime') {
  const devMode = loadState('dev.mockPremium', false);
  if (!devMode && typeof process !== 'undefined' && process.env?.NODE_ENV !== 'development') {
    console.warn('mockPurchase: dev mode not enabled. Set dev.mockPremium in localStorage.');
    return null;
  }
  return completeCheckout({ plan });
}

export { PLAN_PRICES };
