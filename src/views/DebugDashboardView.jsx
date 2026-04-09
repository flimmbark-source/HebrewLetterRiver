import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getEventLog, getEventCounts, getFunnelMetrics, clearAnalytics } from '../lib/eventTracker.js';
import { useExperiment } from '../context/ExperimentContext.jsx';

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

export default function DebugDashboardView() {
  const navigate = useNavigate();
  const { flags, setFlag, resetFlags } = useExperiment();
  const [refreshKey, setRefreshKey] = useState(0);
  const [copyLabel, setCopyLabel] = useState('Copy JSON');

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  // Re-read data on each render / refresh
  void refreshKey;
  const eventCounts = getEventCounts();
  const funnel = getFunnelMetrics();
  const recentEvents = getEventLog().slice(-20).reverse();

  const handleClear = () => {
    clearAnalytics();
    refresh();
  };

  const handleCopyJSON = async () => {
    const data = {
      eventCounts,
      funnelMetrics: funnel,
      recentEvents: getEventLog(),
      experimentFlags: flags,
    };
    try {
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      setCopyLabel('Copied!');
      setTimeout(() => setCopyLabel('Copy JSON'), 1500);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = JSON.stringify(data, null, 2);
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopyLabel('Copied!');
      setTimeout(() => setCopyLabel('Copy JSON'), 1500);
    }
  };

  const flagEntries = Object.entries(flags);

  return (
    <div
      className="min-h-screen pb-36"
      style={{
        fontFamily: 'var(--app-language-font, "Nunito", system-ui, sans-serif)',
        color: 'var(--app-on-surface)',
      }}
    >
      {/* Header */}
      <header
        className="fixed left-0 right-0 top-0 z-40 flex h-16 items-center justify-between px-6 backdrop-blur-xl"
        style={{ background: 'var(--app-nav-bg)' }}
      >
        <div className="flex items-center gap-4">
          <button
            className="transition hover:opacity-80 active:scale-95"
            style={{ color: 'var(--app-primary)' }}
            onClick={() => navigate('/')}
            type="button"
            aria-label="Back to Home"
          >
            <Icon>arrow_back</Icon>
          </button>
          <h1 className="text-lg font-bold" style={{ color: 'var(--app-primary)' }}>
            Debug Dashboard
          </h1>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={refresh}
            className="rounded-lg px-3 py-1.5 text-xs font-bold"
            style={{ background: 'var(--app-surface)', color: 'var(--app-primary)', border: '1px solid var(--app-card-border)' }}
          >
            Refresh
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-2xl space-y-8 px-6 pt-20">
        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleClear}
            className="rounded-xl px-4 py-2.5 text-sm font-extrabold uppercase tracking-widest transition-colors"
            style={{ background: 'var(--app-error-bg)', color: 'var(--app-error-text)' }}
          >
            Clear Analytics
          </button>
          <button
            type="button"
            onClick={handleCopyJSON}
            className="rounded-xl px-4 py-2.5 text-sm font-extrabold uppercase tracking-widest transition-colors"
            style={{ background: 'var(--app-card-bg)', color: 'var(--app-on-surface)', border: '1px solid var(--app-card-border)' }}
          >
            {copyLabel}
          </button>
        </div>

        {/* Funnel Metrics */}
        <section className="space-y-4">
          <h3 className="px-2 text-sm font-bold uppercase tracking-widest" style={{ color: 'var(--app-muted)' }}>
            Funnel Metrics
          </h3>
          <div className="stable-card overflow-hidden rounded-xl shadow-sm" style={{ background: 'var(--app-card-bg)', border: '1px solid var(--app-card-border)' }}>
            <div className="grid grid-cols-2 gap-px" style={{ background: 'var(--app-card-border)' }}>
              <MetricCell label="First Session" value={funnel.first_session_completed ? 'Yes' : 'No'} />
              <MetricCell label="Total Sessions" value={funnel.sessions_total} />
              <MetricCell label="D1 Returned" value={funnel.d1_returned ? 'Yes' : 'No'} />
              <MetricCell label="D7 Returned" value={funnel.d7_returned ? 'Yes' : 'No'} />
              <MetricCell label="Share Clicks" value={funnel.share_click_count} />
              <MetricCell label="Paywall Views" value={funnel.paywall_view_count} />
            </div>
          </div>
        </section>

        {/* Mode Usage */}
        <section className="space-y-4">
          <h3 className="px-2 text-sm font-bold uppercase tracking-widest" style={{ color: 'var(--app-muted)' }}>
            Mode Usage
          </h3>
          <div className="stable-card overflow-hidden rounded-xl shadow-sm" style={{ background: 'var(--app-card-bg)', border: '1px solid var(--app-card-border)' }}>
            {Object.keys(funnel.mode_usage).length === 0 ? (
              <p className="p-4 text-sm" style={{ color: 'var(--app-muted)' }}>No mode usage recorded yet.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--app-card-border)' }}>
                    <th className="px-4 py-3 text-left font-bold" style={{ color: 'var(--app-muted)' }}>Mode</th>
                    <th className="px-4 py-3 text-right font-bold" style={{ color: 'var(--app-muted)' }}>Sessions</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(funnel.mode_usage).map(([mode, count]) => (
                    <tr key={mode} style={{ borderBottom: '1px solid var(--app-card-border)' }}>
                      <td className="px-4 py-2 font-semibold" style={{ color: 'var(--app-on-surface)' }}>{mode}</td>
                      <td className="px-4 py-2 text-right font-bold" style={{ color: 'var(--app-primary)' }}>{count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        {/* Event Counts */}
        <section className="space-y-4">
          <h3 className="px-2 text-sm font-bold uppercase tracking-widest" style={{ color: 'var(--app-muted)' }}>
            Event Counts
          </h3>
          <div className="stable-card overflow-hidden rounded-xl shadow-sm" style={{ background: 'var(--app-card-bg)', border: '1px solid var(--app-card-border)' }}>
            {Object.keys(eventCounts).length === 0 ? (
              <p className="p-4 text-sm" style={{ color: 'var(--app-muted)' }}>No events recorded yet.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--app-card-border)' }}>
                    <th className="px-4 py-3 text-left font-bold" style={{ color: 'var(--app-muted)' }}>Event</th>
                    <th className="px-4 py-3 text-right font-bold" style={{ color: 'var(--app-muted)' }}>Count</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(eventCounts)
                    .sort((a, b) => b[1] - a[1])
                    .map(([name, count]) => (
                      <tr key={name} style={{ borderBottom: '1px solid var(--app-card-border)' }}>
                        <td className="px-4 py-2 font-mono text-xs" style={{ color: 'var(--app-on-surface)' }}>{name}</td>
                        <td className="px-4 py-2 text-right font-bold" style={{ color: 'var(--app-primary)' }}>{count}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        {/* Experiment Flags */}
        <section className="space-y-4">
          <h3 className="px-2 text-sm font-bold uppercase tracking-widest" style={{ color: 'var(--app-muted)' }}>
            Experiment Flags
          </h3>
          <div className="stable-card overflow-hidden rounded-xl shadow-sm" style={{ background: 'var(--app-card-bg)', border: '1px solid var(--app-card-border)' }}>
            <div className="space-y-1 p-4">
              {flagEntries.map(([name, value]) => (
                <label key={name} className="flex cursor-pointer items-center justify-between py-2">
                  <span className="font-mono text-sm font-semibold" style={{ color: 'var(--app-on-surface)' }}>{name}</span>
                  <div className="relative inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => setFlag(name, e.target.checked)}
                      className="peer sr-only"
                    />
                    <div
                      className="h-6 w-11 rounded-full transition after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition peer-checked:after:translate-x-full"
                      style={{ background: value ? 'var(--app-primary)' : 'var(--app-surface-highest)' }}
                    ></div>
                  </div>
                </label>
              ))}
            </div>
            <div className="border-t px-4 py-3" style={{ borderColor: 'var(--app-card-border)' }}>
              <button
                type="button"
                onClick={resetFlags}
                className="text-xs font-bold uppercase tracking-widest"
                style={{ color: 'var(--app-muted)' }}
              >
                Reset All Flags
              </button>
            </div>
          </div>
        </section>

        {/* Recent Events */}
        <section className="space-y-4 pb-12">
          <h3 className="px-2 text-sm font-bold uppercase tracking-widest" style={{ color: 'var(--app-muted)' }}>
            Last 20 Events
          </h3>
          <div
            className="stable-card overflow-hidden rounded-xl shadow-sm"
            style={{ background: 'var(--app-card-bg)', border: '1px solid var(--app-card-border)', maxHeight: '400px', overflowY: 'auto' }}
          >
            {recentEvents.length === 0 ? (
              <p className="p-4 text-sm" style={{ color: 'var(--app-muted)' }}>No events recorded yet.</p>
            ) : (
              <div className="divide-y" style={{ borderColor: 'var(--app-card-border)' }}>
                {recentEvents.map((evt, idx) => (
                  <div key={idx} className="px-4 py-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold" style={{ color: 'var(--app-primary)' }}>
                        {evt.event}
                      </span>
                      <span className="text-[10px] font-medium" style={{ color: 'var(--app-muted)' }}>
                        {new Date(evt.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <pre
                      className="mt-1 overflow-x-auto text-[10px] leading-tight"
                      style={{ color: 'var(--app-muted)' }}
                    >
                      {JSON.stringify(
                        Object.fromEntries(
                          Object.entries(evt).filter(([k]) => k !== 'event' && k !== 'timestamp')
                        ),
                        null,
                        2
                      )}
                    </pre>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

function MetricCell({ label, value }) {
  return (
    <div className="px-4 py-3" style={{ background: 'var(--app-card-bg)' }}>
      <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--app-muted)' }}>
        {label}
      </p>
      <p className="mt-1 text-lg font-extrabold" style={{ color: 'var(--app-on-surface)' }}>
        {value}
      </p>
    </div>
  );
}
