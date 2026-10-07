/**
 * ==============================================================================
 * PUNTO DE ENTRADA Y BOOTSTRAP - Mi Rutina Semanal
 * ==============================================================================
 * Este archivo actúa como el entry point de Vite.
 * Es responsable de inyectar los estilos globales, cargar el orquestador 
 * y garantizar una inicialización segura y libre de race conditions.
 * ==============================================================================
 */

// 1. Inyección de Estilos Globales
// Vite procesará este archivo, aplicará Tailwind CSS y generará el CSS optimizado.
import './styles/main.css';

// 2. Importación del Orquestador Principal
// Se importa el módulo que coordina toda la lógica de negocio y la UI.
import { app } from './app.js';

/**
 * Función de arranque seguro.
 * Verifica el estado del DOM para decidir cómo inicializar la aplicación.
 */
const bootstrapApp = () => {
  try {
    console.log('%c[Main] 🚀 Arrancando Mi Rutina Semanal...', 'color: #6366f1; font-weight: bold; font-size: 14px;');
    app.init();
  } catch (error) {
    console.error('%c[Main Error] ❌ Fallo crítico en el bootstrap de la aplicación:', 'color: #ef4444; font-weight: bold;', error);
  }
};

// 3. Estrategia de Inicialización
// Aunque el script se carga al final del <body> en index.html, 
// esta validación asegura compatibilidad con HMR (Hot Module Replacement) en desarrollo
// y evita errores si el script se moviera al <head> en el futuro.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrapApp);
} else {
  // El DOM ya está completamente parseado y accesible.
  bootstrapApp();
}

// 4. Manejo de Errores Globales (Safety Net)
// Captura errores no manejados en la aplicación para evitar el "White Screen of Death".
window.addEventListener('error', (event) => {
  console.error('[Main] Error global no capturado:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('[Main] Promesa rechazada no manejada:', event.reason);
});