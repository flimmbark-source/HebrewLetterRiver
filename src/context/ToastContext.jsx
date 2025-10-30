import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { nanoid } from 'nanoid/non-secure';

const ToastContext = createContext({ addToast: () => {}, removeToast: () => {} });

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    setToasts((prev) => {
      const id = toast.id ?? nanoid();
      const next = { ...toast, id };
      return [...prev, next];
    });
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const value = useMemo(() => ({ addToast, removeToast, toasts }), [addToast, removeToast, toasts]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-4 right-4 flex flex-col gap-3 z-[100]">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`w-72 rounded-2xl border border-cyan-400/40 bg-slate-900/95 backdrop-blur px-4 py-3 shadow-lg transition-all ${toast.tone === 'success' ? 'border-emerald-400/60' : ''}`}
          >
            <div className="flex items-start gap-3">
              <div className="text-2xl">{toast.icon ?? '✨'}</div>
              <div className="flex-1">
                <p className="font-semibold text-white">{toast.title}</p>
                {toast.description ? (
                  <p className="text-sm text-slate-300 mt-1">{toast.description}</p>
                ) : null}
              </div>
              <button
                className="text-slate-500 hover:text-white"
                onClick={() => removeToast(toast.id)}
                aria-label="Dismiss notification"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
