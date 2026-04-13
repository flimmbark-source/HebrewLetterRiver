import React, { useEffect, useRef, useCallback } from 'react';

/**
 * Accessible modal dialog primitive.
 *
 * Features:
 * - role="dialog" + aria-modal="true" + aria-labelledby
 * - Focus trap (Tab / Shift+Tab cycle within modal)
 * - Escape key closes
 * - Returns focus to the trigger element on close
 * - Optional overlay click to dismiss
 * - Uses design tokens for consistent light/dark mode styling
 */

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

export default function Modal({
  isOpen,
  onClose,
  titleId,
  children,
  closeOnOverlay = true,
  className = '',
}) {
  const panelRef = useRef(null);
  const lastActiveRef = useRef(null);

  // Capture the element that opened the modal
  useEffect(() => {
    if (isOpen) {
      lastActiveRef.current = document.activeElement;
    }
  }, [isOpen]);

  // Focus management: move focus into modal, restore on close
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      const panel = panelRef.current;
      if (!panel) return;
      const firstFocusable = panel.querySelector(FOCUSABLE);
      (firstFocusable || panel).focus();
    }, 0);

    return () => {
      clearTimeout(timer);
      // Return focus when modal closes
      lastActiveRef.current?.focus?.();
    };
  }, [isOpen]);

  // Keyboard: Escape to close + focus trap
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose?.();
        return;
      }

      if (e.key === 'Tab') {
        const panel = panelRef.current;
        if (!panel) return;

        const focusableEls = [...panel.querySelectorAll(FOCUSABLE)];
        if (focusableEls.length === 0) {
          e.preventDefault();
          return;
        }

        const first = focusableEls[0];
        const last = focusableEls[focusableEls.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    },
    [onClose]
  );

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
      onMouseDown={(e) => {
        if (closeOnOverlay && e.target === e.currentTarget) onClose?.();
      }}
      onKeyDown={handleKeyDown}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={`animate-scale-in w-full max-w-md rounded-3xl shadow-2xl outline-none ${className}`}
        style={{
          background: 'var(--app-card-bg)',
          border: '1px solid var(--app-card-border)',
        }}
      >
        {children}
      </div>
    </div>
  );
}
