/**
 * ==============================================================================
 * CAPA DE PERSISTENCIA - Mi Rutina Semanal
 * ==============================================================================
 * Abstracción segura para la gestión de localStorage.
 * Previene errores de cuota, modo incógnito y corrupción de datos JSON.
 * ==============================================================================
 */

import { STORAGE_KEYS } from './constants.js';

/**
 * Objeto de utilidades para operaciones CRUD directas en localStorage.
 */
export const storage = {
  /**
   * Obtiene y parsea un objeto JSON desde localStorage.
   * @param {string} key - Clave de almacenamiento.
   * @param {any} defaultValue - Valor por defecto si no existe o hay error.
   * @returns {any}
   */
  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`[Storage Error] Fallo al leer/parsear la clave "${key}":`, error);
      return defaultValue;
    }
  },

  /**
   * Serializa y guarda un objeto en localStorage.
   * @param {string} key - Clave de almacenamiento.
   * @param {any} value - Valor a guardar.
   * @returns {boolean} True si fue exitoso.
   */
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`[Storage Error] Fallo al escribir la clave "${key}":`, error);
      if (error.name === 'QuotaExceededError') {
        alert('⚠️ Alerta: El almacenamiento local de tu navegador está lleno. Por favor, limpia datos antiguos.');
      }
      return false;
    }
  },

  /**
   * Elimina una clave específica.
   * @param {string} key 
   */
  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`[Storage Error] Fallo al eliminar la clave "${key}":`, error);
    }
  },

  /**
   * Obtiene un valor de tipo string primitivo.
   * @param {string} key 
   * @param {string} defaultValue 
   * @returns {string}
   */
  getString(key, defaultValue = '') {
    return localStorage.getItem(key) || defaultValue;
  },

  /**
   * Guarda un valor de tipo string primitivo.
   * @param {string} key 
   * @param {string} value 
   */
  setString(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error(`[Storage Error] Fallo al escribir string en "${key}":`, error);
    }
  }
};

/**
 * ==============================================================================
 * GESTOR DE ESTADO DE LA APLICACIÓN (DATA STORE)
 * ==============================================================================
 * Mantiene el estado en memoria para acceso rápido (O(1)) y sincroniza 
 * con localStorage solo cuando es necesario (patrón Write-Behind).
 * ==============================================================================
 */
export const dataStore = {
  // Estado inicial cargado desde localStorage
  checks: storage.get(STORAGE_KEYS.CHECKS, {}),
  observations: storage.get(STORAGE_KEYS.OBSERVATIONS, {}),
  history: storage.get(STORAGE_KEYS.HISTORY, {}),

  /**
   * Persiste el estado de los checkboxes (tareas completadas).
   */
  saveChecks() {
    storage.set(STORAGE_KEYS.CHECKS, this.checks);
  },

  /**
   * Persiste las observaciones de las tareas.
   */
  saveObservations() {
    storage.set(STORAGE_KEYS.OBSERVATIONS, this.observations);
  },

  /**
   * Persiste el histórico de progreso mensual/semanal.
   */
  saveHistory() {
    storage.set(STORAGE_KEYS.HISTORY, this.history);
  },

  /**
   * Limpia el estado en memoria y en disco (útil para testing o reseteos totales).
   */
  clearAll() {
    this.checks = {};
    this.observations = {};
    this.history = {};
    storage.remove(STORAGE_KEYS.CHECKS);
    storage.remove(STORAGE_KEYS.OBSERVATIONS);
    storage.remove(STORAGE_KEYS.HISTORY);
  }
};