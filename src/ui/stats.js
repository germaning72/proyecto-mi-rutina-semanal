/**
 * ==============================================================================
 * INTERFAZ DE USUARIO: PANEL DE ESTADÍSTICAS - Mi Rutina Semanal
 * ==============================================================================
 * Responsable del renderizado dinámico de las tarjetas de métricas (KPIs).
 * Muestra el promedio general, mejor/peor categoría y actividades completadas.
 * ==============================================================================
 */

import { calculator } from '../core/calculator.js';
import { CATEGORIES } from '../core/constants.js';

export const stats = {
  /**
   * Actualiza y renderiza las 4 tarjetas de estadísticas principales.
   */
  update() {
    const container = document.getElementById('chartStats');
    
    // Validación de seguridad: Evitar errores si el DOM no está listo
    if (!container) {
      console.warn('[Stats] Contenedor #chartStats no encontrado en el DOM.');
      return;
    }

    // Obtener datos calculados desde el núcleo
    const data = calculator.getStats();
    
    // Manejo de seguridad para categorías (por si el objeto está vacío)
    const bestCat = CATEGORIES[data.bestCategory] || CATEGORIES.productivity;
    const worstCat = CATEGORIES[data.worstCategory] || CATEGORIES.productivity;

    // Renderizado dinámico de las tarjetas con soporte para Modo Oscuro
    container.innerHTML = `
      <!-- Tarjeta 1: Promedio General -->
      <div class="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm transition hover:shadow-md dark:border-slate-700 dark:bg-slate-800">
        <h4 class="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Promedio General
        </h4>
        <div class="text-3xl font-bold text-primary">
          ${data.overallAvg}%
        </div>
      </div>

      <!-- Tarjeta 2: Mejor Categoría -->
      <div class="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm transition hover:shadow-md dark:border-slate-700 dark:bg-slate-800">
        <h4 class="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Mejor Categoría
        </h4>
        <div class="text-lg font-bold" style="color: ${bestCat.color}">
          ${bestCat.shortName}
        </div>
      </div>

      <!-- Tarjeta 3: Categoría a Mejorar -->
      <div class="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm transition hover:shadow-md dark:border-slate-700 dark:bg-slate-800">
        <h4 class="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Por Mejorar
        </h4>
        <div class="text-lg font-bold" style="color: ${worstCat.color}">
          ${worstCat.shortName}
        </div>
      </div>

      <!-- Tarjeta 4: Actividades al 100% -->
      <div class="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm transition hover:shadow-md dark:border-slate-700 dark:bg-slate-800">
        <h4 class="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Actividades 100%
        </h4>
        <div class="text-3xl font-bold text-success">
          ${data.completedTasks}<span class="text-lg text-slate-400">/${data.totalTasks}</span>
        </div>
      </div>
    `;
  }
};