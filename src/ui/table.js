/**
 * ==============================================================================
 * INTERFAZ DE USUARIO: TABLA DE TAREAS - Mi Rutina Semanal
 * ==============================================================================
 * Responsable del renderizado dinámico de la tabla de actividades, 
 * checkboxes, barras de progreso y campos de observación.
 * Utiliza Custom Events para notificar cambios de estado sin acoplamiento fuerte.
 * ==============================================================================
 */

import { calculator } from '../core/calculator.js';
import { dataStore } from '../core/storage.js';
import { CATEGORIES, VERSIONS, DAYS_SHORT } from '../core/constants.js';

// Mapeo de clases de Tailwind para las barras de progreso según el umbral
const PROGRESS_BAR_CLASSES = {
  low: 'from-red-500 to-red-400',
  medium: 'from-amber-500 to-amber-400',
  high: 'from-emerald-500 to-emerald-400',
  complete: 'from-emerald-600 to-emerald-500'
};

export const table = {
  /**
   * Renderiza completamente la tabla de tareas y la fila de cumplimiento diario.
   */
  render() {
    const currentVersion = calculator.getVersion();
    const tasks = VERSIONS[currentVersion].tasks;
    
    const thead = document.getElementById('tableHead');
    const tbody = document.getElementById('tableBody');

    if (!thead || !tbody) {
      console.error('[Table Error] Elementos #tableHead o #tableBody no encontrados en el DOM.');
      return;
    }

    // 1. Renderizar Encabezados (Thead)
    thead.innerHTML = `
      <tr>
        <th class="border border-slate-200 bg-slate-50 p-3 text-left text-xs font-bold uppercase tracking-wider dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 w-[280px] lg:w-[320px]">
          Actividad
        </th>
        ${DAYS_SHORT.map(day => `
          <th class="border border-slate-200 bg-slate-50 p-3 text-center text-xs font-bold uppercase tracking-wider dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 w-[80px] lg:w-[100px]">
            ${day}
          </th>
        `).join('')}
        <th class="border border-slate-200 bg-slate-50 p-3 text-center text-xs font-bold uppercase tracking-wider dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 w-[140px] lg:w-[160px]">
          Cumplimiento
        </th>
        <th class="border border-slate-200 bg-slate-50 p-3 text-left text-xs font-bold uppercase tracking-wider dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 w-[200px] lg:w-[250px]">
          Observaciones
        </th>
      </tr>
    `;  

    // 2. Renderizar Filas de Tareas (Tbody)
    tbody.innerHTML = '';
    
    tasks.forEach((task, tIdx) => {
      const category = CATEGORIES[task.categoryId];
      const progress = calculator.calculateTaskProgress(tIdx);
      const progressClass = calculator.getProgressClass(progress);
      const barGradient = PROGRESS_BAR_CLASSES[progressClass];
      const observation = calculator.getObservation(tIdx);

      const tr = document.createElement('tr');
      tr.className = 'transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50';

      // Celda de Información de la Tarea
      let html = `
        <td class="border border-slate-200 p-3 dark:border-slate-700">
          <div class="flex items-center gap-3">
            <span class="text-2xl flex-shrink-0" role="img" aria-label="Icono">${task.icon}</span>
            <div class="flex flex-col min-w-0 flex-1">
              <span class="font-semibold text-slate-800 dark:text-slate-100 text-sm lg:text-base">${task.name}</span>
              <span class="text-xs text-slate-500 dark:text-slate-400">${task.desc}</span>
              <span class="mt-1 inline-flex w-fit items-center rounded-full px-2 py-0.5 text-[10px] font-bold text-white shadow-sm" 
                    style="background-color: ${category.color}">
                ${category.shortName}
              </span>
            </div>
          </div>
        </td>
      `;

      // Celdas de Días (Checkboxes)
      DAYS_SHORT.forEach((_, dIdx) => {
        const isScheduled = task.days.includes(dIdx);
        const key = calculator.getKey(tIdx, dIdx);
        const isChecked = dataStore.checks[key] || false;

        if (isScheduled) {
          html += `
            <td class="border border-slate-200 p-3 text-center dark:border-slate-700 relative">
              <input type="checkbox" 
                    class="task-checkbox h-7 w-7 lg:h-8 lg:w-8 cursor-pointer appearance-none rounded-md border-2 border-slate-300 transition-all checked:border-emerald-500 checked:bg-emerald-500 hover:scale-110 dark:border-slate-600 dark:checked:border-emerald-400 dark:checked:bg-emerald-400 relative overflow-hidden"
                    data-task="${tIdx}" 
                    data-day="${dIdx}"
                    ${isChecked ? 'checked' : ''}
                    aria-label="Marcar ${task.name} del ${DAYS_SHORT[dIdx]}">
            </td>
          `;
        } else {
          html += `<td class="border border-slate-200 p-3 text-center text-2xl font-light text-slate-300 dark:border-slate-700 dark:text-slate-600 relative">—</td>`;
        }
      });

      // Celda de Barra de Progreso
      html += `
        <td class="border border-slate-200 p-3 dark:border-slate-700">
          <div class="flex min-w-[140px] lg:min-w-[160px] items-center gap-3">
            <div class="h-3 lg:h-3.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
              <div class="h-full rounded-full bg-gradient-to-r ${barGradient} transition-all duration-500 ease-out" 
                  style="width: ${progress}%"></div>
            </div>
            <span class="min-w-[40px] text-right text-sm font-bold text-slate-700 dark:text-slate-200">${progress}%</span>
          </div>
        </td>
      `;

      // Celda de Observaciones
      html += `
        <td class="border border-slate-200 p-2 dark:border-slate-700">
          <textarea class="obs-input w-full resize-none rounded border border-transparent bg-transparent p-2 text-sm text-slate-600 transition focus:border-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary dark:text-slate-300 dark:focus:bg-slate-800" 
                    placeholder="Agregar nota..." 
                    data-task="${tIdx}"
                    rows="2">${observation}</textarea>
        </td>
      `;

      tr.innerHTML = html;
      tbody.appendChild(tr);
    });

    // 3. Renderizar Fila de Cumplimiento Diario (Footer)
    const footerTr = document.createElement('tr');
    footerTr.className = 'bg-slate-100 font-bold dark:bg-slate-900/80';
    
    let footerHtml = `
      <td class="border-t-2 border-primary p-3 text-xs text-primary dark:border-slate-700">
        📊 Cumplimiento del día
      </td>
    `;

    DAYS_SHORT.forEach((_, dIdx) => {
      const dayProgress = calculator.calculateDayCompliance(dIdx);
      const dayClass = calculator.getProgressClass(dayProgress);
      const dayGradient = PROGRESS_BAR_CLASSES[dayClass];

      footerHtml += `
        <td class="border-t-2 border-primary p-3 dark:border-slate-700">
          <div class="flex min-w-[120px] items-center gap-2">
            <div class="h-2.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
              <div class="h-full rounded-full bg-gradient-to-r ${dayGradient} transition-all duration-500" 
                   style="width: ${dayProgress}%"></div>
            </div>
            <span class="min-w-[35px] text-right text-xs font-bold text-slate-700 dark:text-slate-200">${dayProgress}%</span>
          </div>
        </td>
      `;
    });

    footerHtml += `<td colspan="2" class="border-t-2 border-primary dark:border-slate-700"></td>`;
    footerTr.innerHTML = footerHtml;
    tbody.appendChild(footerTr);

    // 4. Asignación de Event Listeners (Después de renderizar el DOM)
    this.bindEvents();
  },

  /**
   * Asigna los listeners a los elementos interactivos recién creados.
   */
  bindEvents() {
    // Checkboxes
    document.querySelectorAll('.task-checkbox').forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        const tIdx = parseInt(e.target.dataset.task, 10);
        const dIdx = parseInt(e.target.dataset.day, 10);
        
        // Actualizar estado en el núcleo
        calculator.toggleCheck(tIdx, dIdx);
        calculator.saveMonthlyProgress();
        
        // Disparar evento global para que app.js actualice gráficas y stats
        window.dispatchEvent(new CustomEvent('app:state-changed'));
      });
    });

    // Textareas de Observaciones
    document.querySelectorAll('.obs-input').forEach(textarea => {
      // Usamos 'change' (se dispara al perder el foco) para evitar re-renders mientras se escribe
      textarea.addEventListener('change', (e) => {
        const tIdx = parseInt(e.target.dataset.task, 10);
        calculator.saveObservation(tIdx, e.target.value);
      });
    });
  }
};