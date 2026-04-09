import React, { useCallback, useState } from 'react';
import { shareResult, canNativeShare } from '../lib/shareService.js';
import { useToast } from '../context/ToastContext.jsx';
import { emit } from '../lib/eventBus.js';

/**
 * ShareButton (SHARE-03)
 * Reusable share button that handles native share / clipboard fallback with toast feedback.
 *
 * @param {Object} props
 * @param {Object} props.data - Share data passed to shareResult()
 * @param {string} [props.surface] - Analytics surface identifier
 * @param {string} [props.className] - Additional CSS class names
 * @param {React.ReactNode} [props.children] - Optional custom label
 */
export default function ShareButton({ data, surface, className = '', children }) {
  const { addToast } = useToast();
  const [busy, setBusy] = useState(false);
  const native = canNativeShare();

  const handleShare = useCallback(async () => {
    if (busy) return;
    setBusy(true);

    // Fire analytics event
    emit('share:attempt', { surface, mode: data?.mode, type: data?.type });

    try {
      const result = await shareResult(data);

      if (result.success) {
        if (result.method === 'clipboard') {
          addToast({
            title: 'Copied to clipboard!',
            description: 'Your result is ready to paste and share.',
            icon: '📋',
            tone: 'success',
          });
        } else if (result.method === 'native') {
          addToast({
            title: 'Shared!',
            icon: '🎉',
            tone: 'success',
          });
        }
        emit('share:success', { surface, method: result.method, mode: data?.mode });
      } else if (result.method === 'none') {
        addToast({
          title: 'Could not share',
          description: 'Try taking a screenshot of the card instead!',
          icon: '📸',
        });
      }
      // If native share was dismissed (success=false, method=native), do nothing
    } catch {
      addToast({
        title: 'Share failed',
        description: 'Something went wrong. Try again!',
        icon: '⚠️',
      });
    } finally {
      setBusy(false);
    }
  }, [busy, data, surface, addToast]);

  const label = children ?? (native ? 'Share' : 'Copy Result');
  const icon = native ? 'share' : 'content_copy';

  return (
    <button
      type="button"
      onClick={handleShare}
      disabled={busy}
      className={`btn-press inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-bold transition-all duration-200 ${
        busy ? 'opacity-60' : ''
      } ${className}`}
      style={{
        background: 'rgba(255, 255, 255, 0.15)',
        color: '#fff',
        border: '1.5px solid rgba(255, 255, 255, 0.25)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <span
        className="material-symbols-outlined text-lg"
        style={{ fontVariationSettings: "'FILL' 0, 'wght' 500, 'GRAD' 0, 'opsz' 24" }}
        aria-hidden="true"
      >
        {icon}
      </span>
      {label}
    </button>
  );
}
