import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

/**
 * Configuración de Vite para el Proyecto "Mi Rutina Semanal"
 * Optimizado para despliegue en Netlify y capacidades PWA nativas.
 */
export default defineConfig({
  // Configuración del servidor de desarrollo local
  server: {
    port: 5173,
    open: true, // Abre el navegador automáticamente al iniciar
    strictPort: false // Permite cambiar de puerto si el 5173 está ocupado
  },

  // Configuración de plugins
  plugins: [
    /**
     * Vite Plugin PWA
     * Genera automáticamente el manifest.json y el Service Worker (usando Workbox).
     * Esto soluciona los problemas previos de iconos y caché en móviles.
     */
    VitePWA({
      registerType: 'autoUpdate', // Actualiza la PWA automáticamente cuando hay cambios
      includeAssets: ['favicon.svg', 'assets/icons/*.png', 'robots.txt'],
      manifest: {
        name: 'Mi Rutina Semanal',
        short_name: 'Mi Rutina',
        description: 'Gestión Inteligente de Tareas y Hábitos Semanales',
        theme_color: '#6366f1', // Color de la barra de estado en Android
        background_color: '#f1f5f9',
        display: 'standalone', // Se abre como app nativa, sin barra de navegador
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        lang: 'es',
        categories: ['productivity', 'lifestyle', 'utilities'],
        icons: [
          {
            src: '/assets/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable' // Permite que Android adapte el icono
          },
          {
            src: '/assets/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      // Estrategias de caché de Workbox para modo offline
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            // Cachea Chart.js y otras librerías externas si se usaran por CDN
            urlPattern: /^https:\/\/cdn\.jsdelivr\.net\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'cdn-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 año
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ],

  // Configuración de construcción para Producción (Netlify)
  build: {
    outDir: 'dist', // Directorio de salida (debe coincidir con netlify.toml)
    sourcemap: false, // Desactivar en producción para reducir tamaño y proteger código
    minify: 'terser', // Minificación agresiva
    chunkSizeWarningLimit: 1000, // Aumenta el límite de advertencia para Chart.js
    rollupOptions: {
      output: {
        // Separa Chart.js en su propio chunk para mejorar el caché del navegador
        manualChunks: {
          vendor: ['chart.js']
        }
      }
    }
  },

  // Optimización de dependencias
  optimizeDeps: {
    include: ['chart.js']
  }
});