import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { readFileSync } from 'fs';
import { webcrypto } from 'node:crypto';

// Some environments expose a partial global crypto object without
// getRandomValues() (or without crypto at all), which Vite expects
// during startup. globalThis.crypto is a non-writable accessor in
// newer Node, so we must defineProperty or patch in place rather than
// reassign.
(function ensureGlobalCrypto() {
  if (!globalThis.crypto) {
    try {
      Object.defineProperty(globalThis, 'crypto', {
        value: webcrypto,
        writable: true,
        configurable: true,
      });
    } catch {
      globalThis.crypto = webcrypto;
    }
    return;
  }
  if (typeof globalThis.crypto.getRandomValues !== 'function') {
    try {
      globalThis.crypto.getRandomValues = webcrypto.getRandomValues.bind(webcrypto);
    } catch {
      try {
        Object.defineProperty(globalThis, 'crypto', {
          value: webcrypto,
          writable: true,
          configurable: true,
        });
      } catch {
        // Last resort — best-effort assignment.
        globalThis.crypto = webcrypto;
      }
    }
  }
})();

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',

      manifest: false,

      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2,ttf,eot,json}'],

        // Runtime caching strategies
        runtimeCaching: [
          {
            // Cache Google Fonts
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            // Cache Google Fonts webfonts
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            // Cache language pack JSON files
            urlPattern: /\/i18n\/.*\.json$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'language-packs-cache',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 1 week
              }
            }
          },
          {
            // Cache game data JSON files
            urlPattern: /\/data\/.*\.json$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'game-data-cache',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 1 week
              }
            }
          },
          {
            // Cache images (excluding .ico which is precached by globPatterns)
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          }
        ],

        // Don't cache these
        navigateFallback: null,
        navigateFallbackDenylist: [/^\/api/],

        // Clean up old caches
        cleanupOutdatedCaches: true,

        // Max cache size
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024 // 5MB
      },

      devOptions: {
        enabled: false
      }
    })
  ]
});
