import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';
import './styles/main.css';
import './styles/skeleton.css';

const SW_RESET_FLAG_KEY = 'hlr.forceSwReset';
const SW_RESET_QUERY_PARAM = 'reset-sw';
const SPEECH_DEBUG_FLAG_KEY = 'LETTER_RIVER_SPEECH_DEBUG';
const SPEECH_DEBUG_QUERY_PARAM = 'speech-debug';

function persistSpeechDebugFlag() {
  if (typeof window === 'undefined') return;

  try {
    const query = new URLSearchParams(window.location.search);
    const speechDebugValue = query.get(SPEECH_DEBUG_QUERY_PARAM);

    if (speechDebugValue === '1') {
      window.localStorage.setItem(SPEECH_DEBUG_FLAG_KEY, '1');
      return;
    }

    if (speechDebugValue === '0') {
      window.localStorage.removeItem(SPEECH_DEBUG_FLAG_KEY);
    }
  } catch {
    // Ignore storage/query failures; debug mode is optional.
  }
}

function shouldForceServiceWorkerReset() {
  if (typeof window === 'undefined') return false;
  const query = new URLSearchParams(window.location.search);
  if (query.get(SW_RESET_QUERY_PARAM) === '1') {
    try {
      window.localStorage.setItem(SW_RESET_FLAG_KEY, '1');
    } catch {
      // Ignore storage write failures; query param still activates this session.
    }
    return true;
  }

  try {
    return window.localStorage.getItem(SW_RESET_FLAG_KEY) === '1';
  } catch {
    return false;
  }
}

async function resetServiceWorkersAndCaches() {
  if (typeof window === 'undefined') return;
  const forceReset = shouldForceServiceWorkerReset();
  if (!forceReset) return;

  try {
    // Timeout for the entire SW reset operation (5 seconds max)
    await Promise.race([
      (async () => {
        if ('serviceWorker' in navigator) {
          const registrations = await navigator.serviceWorker.getRegistrations();
          await Promise.all(
            registrations.map(async (registration) => {
              try {
                const success = await registration.unregister();
                if (success) {
                  console.log('[PWA] Service Worker unregistered successfully');
                }
              } catch (error) {
                console.warn('[PWA] Failed to unregister SW:', error);
              }
            })
          );
        }

        if ('caches' in window) {
          const cacheKeys = await window.caches.keys();
          await Promise.all(
            cacheKeys
              .filter((key) => key.includes('workbox') || key.includes('cache') || key.includes('precache'))
              .map((key) => window.caches.delete(key).catch((error) => {
                console.warn('[PWA] Failed to delete cache:', error);
              }))
          );
          console.warn('[PWA] Forced cache reset completed.');
          try {
            window.localStorage.removeItem(SW_RESET_FLAG_KEY);
          } catch {
            // Ignore storage cleanup issues.
          }
        }
      })(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('SW reset timeout')), 5000)
      )
    ]);
  } catch (error) {
    if (error.message !== 'SW reset timeout') {
      console.warn('[PWA] SW reset error:', error);
    } else {
      console.warn('[PWA] Service worker reset timed out, continuing anyway');
    }
  }
}

console.info('[Bootstrap] Starting app initialization');
persistSpeechDebugFlag();
resetServiceWorkersAndCaches().catch((error) => {
  console.warn('[PWA] Failed to reset service workers/caches:', error);
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

console.info('[Bootstrap] React root rendered');