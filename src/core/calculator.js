/**
 * ==============================================================================
 * MOTOR DE CÁLCULO Y LÓGICA DE NEGOCIO - Mi Rutina Semanal
 * ==============================================================================
 * Encapsula toda la lógica matemática y de manipulación de estado.
 * No interactúa directamente con el DOM (Principio de Separación de Responsabilidades).
 * ==============================================================================
 */

import { dataStore } from './storage.js';
import { VERSIONS, CATEGORIES, PROGRESS_THRESHOLDS, STORAGE_KEYS } from './constants.js';

// Estado de la versión activa (Actualmente solo V2 según requerimiento)
let currentVersion = 'v2';

export const calculator = {
  /**
   * Configura la versión activa de la rutina.
   * @param {string} version - 'v1' | 'v2'
   */
  setVersion(version) {
    if (VERSIONS[version]) {
      currentVersion = version;
    } else {
      console.warn(`[Calculator] La versión "${version}" no existe. Usando default.`);
    }
  },

  getVersion() {
    return currentVersion;
  },

  // --- UTILIDADES DE CLAVES ---

  getKey(taskIdx, dayIdx) {
    return `${currentVersion}_${taskIdx}_${dayIdx}`;
  },

  getObsKey(taskIdx) {
    return `${currentVersion}_obs_${taskIdx}`;
  },

  // --- LÓGICA DE TIEMPO ---

  getMonthKey() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  },

  getWeekOfMonth() {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const dayOfMonth = now.getDate();
    const dayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1; // Ajuste a Lunes=0
    return Math.ceil((dayOfMonth + dayOfWeek) / 7);
  },

  // --- CÁLCULOS DE PROGRESO ---

  getProgressClass(percent) {
    if (percent >= PROGRESS_THRESHOLDS.COMPLETE) return 'complete';
    if (percent >= PROGRESS_THRESHOLDS.HIGH) return 'high';
    if (percent >= PROGRESS_THRESHOLDS.MEDIUM) return 'medium';
    return 'low';
  },

  calculateTaskProgress(taskIdx) {
    const tasks = VERSIONS[currentVersion].tasks;
    if (!tasks[taskIdx]) return 0;
    
    const task = tasks[taskIdx];
    let scheduled = 0;
    let completed = 0;

    task.days.forEach(dayIdx => {
      scheduled++;
      if (dataStore.checks[this.getKey(taskIdx, dayIdx)]) {
        completed++;
      }
    });

    return scheduled > 0 ? Math.round((completed / scheduled) * 100) : 0;
  },

  calculateCategoryProgress(categoryId) {
    const tasks = VERSIONS[currentVersion].tasks.filter(t => t.categoryId === categoryId);
    if (tasks.length === 0) return 0;

    const totalProgress = tasks.reduce((sum, task) => {
      const idx = VERSIONS[currentVersion].tasks.indexOf(task);
      return sum + this.calculateTaskProgress(idx);
    }, 0);

    return Math.round(totalProgress / tasks.length);
  },

  calculateDayCompliance(dayIdx) {
    const tasks = VERSIONS[currentVersion].tasks;
    let scheduled = 0;
    let completed = 0;

    tasks.forEach((task, tIdx) => {
      if (task.days.includes(dayIdx)) {
        scheduled++;
        if (dataStore.checks[this.getKey(tIdx, dayIdx)]) {
          completed++;
        }
      }
    });

    return scheduled > 0 ? Math.round((completed / scheduled) * 100) : 0;
  },

  calculateCategoryProgressByDay(categoryId, dayIdx) {
    const tasks = VERSIONS[currentVersion].tasks.filter(t => t.categoryId === categoryId);
    let scheduled = 0;
    let completed = 0;

    tasks.forEach(task => {
      const tIdx = VERSIONS[currentVersion].tasks.indexOf(task);
      if (task.days.includes(dayIdx)) {
        scheduled++;
        if (dataStore.checks[this.getKey(tIdx, dayIdx)]) {
          completed++;
        }
      }
    });

    return scheduled > 0 ? Math.round((completed / scheduled) * 100) : 0;
  },

  // --- MANIPULACIÓN DE ESTADO ---

  toggleCheck(taskIdx, dayIdx) {
    const key = this.getKey(taskIdx, dayIdx);
    // Invertir estado actual (si no existe, es false)
    dataStore.checks[key] = !dataStore.checks[key];
    dataStore.saveChecks();
    return dataStore.checks[key];
  },

  saveObservation(taskIdx, value) {
    const key = this.getObsKey(taskIdx);
    dataStore.observations[key] = value;
    dataStore.saveObservations();
  },

  getObservation(taskIdx) {
    return dataStore.observations[this.getObsKey(taskIdx)] || '';
  },

  // --- HISTÓRICO Y ESTADÍSTICAS ---

  saveMonthlyProgress() {
    const tasks = VERSIONS[currentVersion].tasks;
    const monthKey = this.getMonthKey();
    const weekNum = this.getWeekOfMonth();
    const weekKey = `S${weekNum}`;

    if (!dataStore.history[monthKey]) dataStore.history[monthKey] = {};
    if (!dataStore.history[monthKey][currentVersion]) dataStore.history[monthKey][currentVersion] = {};

    let total = 0;
    let done = 0;

    tasks.forEach((task, tIdx) => {
      task.days.forEach(dayIdx => {
        total++;
        if (dataStore.checks[this.getKey(tIdx, dayIdx)]) done++;
      });
    });

    const weekProgress = total > 0 ? Math.round((done / total) * 100) : 0;
    dataStore.history[monthKey][currentVersion][weekKey] = weekProgress;
    dataStore.saveHistory();
  },

  getWeeklyHistory() {
    const monthKey = this.getMonthKey();
    const monthData = dataStore.history[monthKey]?.[currentVersion] || {};
    const weeks = Object.keys(monthData).sort();
    
    // Retornar últimas 4 semanas para gráficas
    return weeks.slice(-4).map(w => ({
      label: `Semana ${w.replace('S', '')}`,
      data: monthData[w]
    }));
  },

  resetWeek() {
    Object.keys(dataStore.checks).forEach(key => {
      if (key.startsWith(`${currentVersion}_`) && !key.includes('_obs_')) {
        dataStore.checks[key] = false;
      }
    });
    dataStore.saveChecks();
  },

  getStats() {
    const tasks = VERSIONS[currentVersion].tasks;
    const categoryIds = [...new Set(tasks.map(t => t.categoryId))];
    
    const categoryAvgs = categoryIds.map(id => this.calculateCategoryProgress(id));
    const overallAvg = categoryAvgs.length > 0 
      ? Math.round(categoryAvgs.reduce((a, b) => a + b, 0) / categoryAvgs.length) 
      : 0;
      
    const maxAvg = Math.max(...categoryAvgs);
    const minAvg = Math.min(...categoryAvgs);
    
    const bestCatIdx = categoryAvgs.indexOf(maxAvg);
    const worstCatIdx = categoryAvgs.indexOf(minAvg);
    
    const completedTasks = tasks.filter((_, idx) => this.calculateTaskProgress(idx) === 100).length;

    return {
      overallAvg,
      bestCategory: categoryIds[bestCatIdx] || 'productivity',
      worstCategory: categoryIds[worstCatIdx] || 'productivity',
      completedTasks,
      totalTasks: tasks.length
    };
  }
};