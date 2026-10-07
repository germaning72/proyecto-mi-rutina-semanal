/**
 * ==============================================================================
 * SISTEMA DE GAMIFICACIÓN Y RACHAS - Mi Rutina Semanal
 * ==============================================================================
 * Gestiona el conteo de días consecutivos de actividad (Streak).
 * Implementa lógica de validación temporal para evitar incrementos duplicados
 * y manejar correctamente los días perdidos.
 * ==============================================================================
 */

import { storage } from '../core/storage.js';
import { STORAGE_KEYS } from '../core/constants.js';

export const streak = {
  /**
   * Obtiene la racha actual desde el almacenamiento.
   * @returns {number}
   */
  getCurrent() {
    return parseInt(storage.getString(STORAGE_KEYS.STREAK, '0'), 10) || 0;
  },

  /**
   * Obtiene la última fecha registrada de actividad.
   * @returns {string} Fecha en formato toDateString() o vacío.
   */
  getLastDate() {
    return storage.getString(STORAGE_KEYS.LAST_CHECK_DATE);
  },

  /**
   * Actualiza la racha basándose en la fecha actual.
   * Lógica:
   * - Si es el mismo día: No hace nada (previene duplicados).
   * - Si es el día siguiente (ayer): Incrementa la racha.
   * - Si se saltó días: Reinicia la racha a 1.
   */
  update() {
    try {
      const lastDateStr = this.getLastDate();
      const todayStr = new Date().toDateString();
      let currentStreak = this.getCurrent();

      // Caso 1: Ya se registró actividad hoy (No incrementar)
      if (lastDateStr === todayStr) {
        this.render(currentStreak);
        return;
      }

      // Caso 2: Primera vez o se saltó días (Reiniciar a 1)
      if (!lastDateStr) {
        currentStreak = 1;
      } else {
        const lastDate = new Date(lastDateStr);
        const today = new Date(todayStr);
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);

        // Comparar si la última fecha fue exactamente ayer
        if (lastDate.toDateString() === yesterday.toDateString()) {
          currentStreak += 1; // Incrementar racha
        } else {
          currentStreak = 1; // Reiniciar racha (día perdido)
        }
      }

      // Persistir nuevos valores
      storage.setString(STORAGE_KEYS.STREAK, currentStreak.toString());
      storage.setString(STORAGE_KEYS.LAST_CHECK_DATE, todayStr);

      // Actualizar interfaz
      this.render(currentStreak);
      
      console.log(`[Streak] Racha actualizada: ${currentStreak} días`);
    } catch (error) {
      console.error('[Streak Error] Fallo al actualizar la racha:', error);
    }
  },

  /**
   * Renderiza el valor de la racha en el badge del header.
   * @param {number} count 
   */
  render(count) {
    const badge = document.getElementById('streakBadge');
    if (badge) {
      const textSpan = badge.querySelector('span');
      if (textSpan) {
        textSpan.textContent = `${count} día${count !== 1 ? 's' : ''}`;
      }
    }
  },

  /**
   * Reinicia la racha manualmente (útil para testing o reseteos totales).
   */
  reset() {
    storage.setString(STORAGE_KEYS.STREAK, '0');
    storage.remove(STORAGE_KEYS.LAST_CHECK_DATE);
    this.render(0);
  }
};