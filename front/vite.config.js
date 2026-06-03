import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate', // Met à jour le Service Worker automatiquement
      includeAssets: ['assets/icons/favicon.ico', 'assets/icons/apple-touch-icon.png', 'assets/icons/favicon.svg'],
      manifest: {
        name: 'JamSport',
        short_name: 'JamSport',
        description: 'Géolocalisation des complexes sportifs et fitness à Douala',
        theme_color: '#ffffff', // Change cette couleur selon ta charte graphique
        background_color: '#ffffff', // Couleur de fond du Splash Screen
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: '/assets/icons/favicon-96x96.png',
            sizes: '96x96',
            type: 'image/png'
          },
          {
            src: '/assets/icons/apple-touch-icon.png',
            sizes: '180x180',
            type: 'image/png'
          },
          // Icône masquable obligatoire pour la conformité Android / Google Chrome PWA
          {
            src: '/assets/icons/apple-touch-icon.png', 
            sizes: '180x180',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        // Met en cache tous les fichiers générés pour le mode hors-ligne (HTML, JS, CSS, icônes...)
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}']
      }
    })
  ],
})