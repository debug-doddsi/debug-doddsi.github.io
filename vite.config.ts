import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  assetsInclude: ['**/*.glb'],
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png', 'pwa-192x192.png', 'pwa-512x512.png'],
      manifest: {
        name: 'Sourdough Souschef',
        short_name: 'Sourdough',
        description: 'Sourdough feeding tracker and baking guide by Iona Kate',
        theme_color: '#c8882a',
        background_color: '#fdf6e8',
        display: 'standalone',
        scope: '/',
        start_url: '/sourdough',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        // The About page's 3D lanyard badge (three.js + rapier physics) pulls
        // in a JS chunk well past Workbox's 2 MiB default — it's lazy-loaded
        // and irrelevant to the installable Sourdough app this PWA targets,
        // but still gets swept up by the glob above, so raise the ceiling
        // rather than fight the precache manifest over it.
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
      },
    }),
  ],
  base: '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
