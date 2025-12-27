import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'icons/*.png'],

      manifest: {
        name: 'Hebrew Letter River',
        short_name: 'Letter River',
        description: 'Learn and practice Hebrew letters with an engaging river-catching game',
        theme_color: '#06b6d4',
        background_color: '#0f172a',
        display: 'standalone',
        orientation: 'portrait-primary',
        categories: ['education', 'games'],
        icons: [
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ],
        shortcuts: [
          {
            name: 'Play Game',
            short_name: 'Play',
            description: 'Start playing Letter River',
            url: '/play',
            icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }]
          },
          {
            name: 'Daily Quests',
            short_name: 'Quests',
            description: 'View daily quests',
            url: '/daily',
            icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }]
          },
          {
            name: 'Achievements',
            short_name: 'Badges',
            description: 'View your achievements',
            url: '/achievements',
            icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }]
          }
        ]
      },

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
            // Cache images
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/,
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
        enabled: true,
        type: 'module'
      }
    })
  ]
});
