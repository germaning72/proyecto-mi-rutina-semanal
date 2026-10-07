/**
 * ==============================================================================
 * ORQUESTADOR PRINCIPAL DE LA APLICACIÓN - Mi Rutina Semanal
 * ==============================================================================
 * Punto de coordinación central. Inicializa módulos, escucha eventos globales
 * y orquesta las actualizaciones en cascada entre UI, gráficas y estadísticas.
 * Sigue el patrón de Diseño "Mediator" para desacoplar módulos.
 * ==============================================================================
 */

import { calculator } from './core/calculator.js';
import { dataStore } from './core/storage.js';
import { storage } from './core/storage.js';
import { STORAGE_KEYS, CATEGORIES } from './core/constants.js';
import { table } from './ui/table.js';
import { stats } from './ui/stats.js';
import { charts } from './features/charts.js';
import { exporter } from './features/export.js';
import { notifications } from './features/notifications.js';
import { streak } from './features/streak.js';

// Estado interno del orquestador
let currentChartType = 'bar';

export const app = {
  /**
   * Método de inicialización principal.
   * Se ejecuta una sola vez cuando el DOM está completamente cargado.
   */
  init() {
    try {
      console.log('[App]  Iniciando Mi Rutina Semanal...');
      
      // 1. Restaurar estado persistente (tema, notificaciones)
      this.restoreTheme();
      this.restoreNotifications();
      
      // 2. Renderizado inicial de la UI
      table.render();
      charts.render(currentChartType);
      stats.update();
      streak.update();
      
      // 3. Renderizar leyenda de categorías (si el panel está visible)
      this.renderCategoryLegend();
      
      // 4. Asignar Event Listeners globales
      this.bindGlobalEvents();
      
      // 5. Suscribirse al evento personalizado de cambio de estado
      this.subscribeToStateChanges();
      
      console.log('[App] ✅ Aplicación inicializada correctamente.');
    } catch (error) {
      console.error('[App Error] Fallo crítico durante la inicialización:', error);
    }
  },

  /**
   * Restaura el tema (claro/oscuro) desde localStorage.
   */
  restoreTheme() {
    const savedTheme = storage.getString(STORAGE_KEYS.THEME);
    const themeBtn = document.getElementById('themeBtn');
    
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
      if (themeBtn) themeBtn.textContent = '☀️';
    } else {
      document.documentElement.classList.remove('dark');
      if (themeBtn) themeBtn.textContent = '🌙';
    }
  },

  /**
   * Restaura el estado de las notificaciones desde localStorage.
   */
  restoreNotifications() {
    const btn = document.getElementById('btnNotif');
    const statusEl = document.getElementById('notifStatus');
    
    if (btn && statusEl) {
      notifications.restoreState(btn, statusEl);
    }
  },

  /**
   * Asigna los Event Listeners a los botones globales de la aplicación.
   */
  bindGlobalEvents() {
    // --- Toggle de Tema (Claro/Oscuro) ---
    const themeBtn = document.getElementById('themeBtn');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        const isDark = document.documentElement.classList.toggle('dark');
        themeBtn.textContent = isDark ? '☀️' : '🌙';
        storage.setString(STORAGE_KEYS.THEME, isDark ? 'dark' : 'light');
        
        // Re-renderizar gráfica con nuevos colores
        charts.render(currentChartType);
      });
    }

    // --- Toggle del Panel de Instrucciones ---
    const btnInstructions = document.getElementById('btnInstructions');
    if (btnInstructions) {
      btnInstructions.addEventListener('click', () => {
        const panel = document.getElementById('instructionsPanel');
        if (panel) {
          panel.classList.toggle('hidden');
          if (!panel.classList.contains('hidden')) {
            this.renderCategoryLegend();
          }
        }
      });
    }

    // --- Botones de Tipo de Gráfica ---
    document.querySelectorAll('.chart-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        // Actualizar estado visual de los botones
        document.querySelectorAll('.chart-btn').forEach(b => {
          b.classList.remove('active', 'bg-primary', 'border-primary', 'text-white');
          b.classList.add('bg-white', 'dark:bg-slate-800', 'dark:border-slate-700');
        });
        
        const target = e.currentTarget;
        target.classList.add('active', 'bg-primary', 'border-primary', 'text-white');
        target.classList.remove('bg-white', 'dark:bg-slate-800');
        
        // Actualizar tipo y re-renderizar
        currentChartType = target.dataset.type;
        charts.render(currentChartType);
      });
    });

    // --- Botón de Exportar Datos ---
    const btnExport = document.getElementById('btnExport');
    if (btnExport) {
      btnExport.addEventListener('click', () => {
        try {
          exporter.toCSV();
          console.log('[App] 📤 Datos exportados exitosamente.');
        } catch (error) {
          console.error('[App Error] Fallo al exportar:', error);
          alert('️ Ocurrió un error al exportar los datos.');
        }
      });
    }

    // --- Botón de Reiniciar Semana ---
    const btnReset = document.getElementById('btnReset');
    if (btnReset) {
      btnReset.addEventListener('click', () => {
        const confirmed = confirm(
          '¿Seguro que quieres reiniciar todos los checks de esta semana?\n\n' +
          '⚠️ Los checks se borrarán, pero las observaciones se mantendrán.'
        );
        
        if (confirmed) {
          calculator.resetWeek();
          // El evento 'app:state-changed' se dispara automáticamente desde table.render()
          // pero forzamos actualización completa aquí
          table.render();
          charts.render(currentChartType);
          stats.update();
          streak.update();
          console.log('[App] 🔄 Semana reiniciada.');
        }
      });
    }

    // --- Botón de Notificaciones ---
    const btnNotif = document.getElementById('btnNotif');
    const notifStatus = document.getElementById('notifStatus');
    if (btnNotif && notifStatus) {
      btnNotif.addEventListener('click', (e) => {
        notifications.toggle(e.currentTarget, notifStatus);
      });
    }
  },

  /**
   * Se suscribe al evento personalizado 'app:state-changed' disparado por table.js
   * cuando el usuario interactúa con los checkboxes.
   */
  subscribeToStateChanges() {
    window.addEventListener('app:state-changed', () => {
      console.log('[App] 📡 Evento state-changed recibido. Actualizando vistas...');
      
      // Actualización en cascada de todas las vistas dependientes
      table.render(); // Re-renderiza tabla (barras de progreso)
      charts.render(currentChartType); // Actualiza gráficas
      stats.update(); // Actualiza tarjetas de estadísticas
      streak.update(); // Actualiza racha motivacional
    });
  },

  /**
   * Renderiza la leyenda visual de categorías en el panel de instrucciones.
   */
  renderCategoryLegend() {
    const legend = document.getElementById('categoryLegend');
    if (!legend) return;

    legend.innerHTML = Object.values(CATEGORIES).map(cat => `
      <div class="flex items-center gap-3 rounded-lg border-l-4 bg-white p-3 shadow-sm dark:bg-slate-800" 
           style="border-left-color: ${cat.color}">
        <span class="text-2xl" role="img" aria-hidden="true">${cat.name.split(' ')[0]}</span>
        <div class="flex-1">
          <div class="font-bold text-slate-800 dark:text-slate-100">${cat.name}</div>
          <div class="text-xs text-slate-500 dark:text-slate-400">${cat.tasks.join(', ')}</div>
        </div>
      </div>
    `).join('');
  }
};