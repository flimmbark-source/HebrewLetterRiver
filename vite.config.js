import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { readFileSync } from 'fs';

// NOTE: the globalThis.crypto polyfill needed by Vite startup on older
// Node 18 builds lives in scripts/vite-with-crypto.mjs, because Vite
// touches crypto inside resolveConfig() — before this file is read.

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
            // Font CSS should not be locked behind a year-long CacheFirst rule.
            // If a cached stylesheet points to stale or failed font binaries, icon
            // ligatures can leak as words after reload. NetworkFirst refreshes the
            // CSS while still keeping a cached copy for offline starts.
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'google-fonts-styles-v3',
              networkTimeoutSeconds: 3,
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              },
              cacheableResponse: {
                statuses: [200]
              }
            }
          },
          {
            // Cache Google Fonts webfont binaries after a successful network load.
            // The cache name is bumped so users with older font-cache entries get a
            // clean cache after this service worker deploys.
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'gstatic-fonts-cache-v3',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [200]
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
