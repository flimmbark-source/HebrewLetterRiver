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
            // Cache Google Fonts CSS (one entry per unique URL)
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            // Cache Google Fonts webfont binaries.
            // The app uses many font families each with multiple unicode-range
            // subsets — easily 50+ individual woff2 files. The old limit of 10
            // caused constant LRU eviction, forcing re-fetches that fail on slow
            // mobile connections. 100 entries covers all fonts comfortably.
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 100,
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
