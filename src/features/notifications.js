/**
 * ==============================================================================
 * MOTOR DE NOTIFICACIONES Y RECORDATORIOS - Mi Rutina Semanal
 * ==============================================================================
 * Gestiona la Notification API del navegador, permisos, intervalos de 
 * recordatorio y persistencia de preferencias del usuario.
 * ==============================================================================
 */

import { calculator } from '../core/calculator.js';
import { dataStore } from '../core/storage.js';
import { storage } from '../core/storage.js';
import { STORAGE_KEYS, VERSIONS } from '../core/constants.js';

let notifInterval = null;

export const notifications = {
  /**
   * Verifica si el navegador soporta la API de Notificaciones.
   * @returns {boolean}
   */
  isSupported() {
    return 'Notification' in window;
  },

  /**
   * Alterna el estado de las notificaciones (Activar/Desactivar).
   * Maneja los 3 estados de permisos: default, granted, denied.
   * @param {HTMLElement} btn - Botón de la UI.
   * @param {HTMLElement} statusEl - Elemento de texto de estado.
   */
  async toggle(btn, statusEl) {
    if (!this.isSupported()) {
      alert('⚠️ Tu navegador no soporta notificaciones nativas.');
      return;
    }

    // Caso 1: Permiso ya concedido
    if (Notification.permission === 'granted') {
      if (btn.classList.contains('active')) {
        // Desactivar
        btn.classList.remove('active');
        statusEl.textContent = '(desactivadas)';
        storage.setString(STORAGE_KEYS.NOTIFICATIONS, 'off');
        this.stop();
      } else {
        // Activar
        btn.classList.add('active');
        statusEl.textContent = '(activas)';
        storage.setString(STORAGE_KEYS.NOTIFICATIONS, 'on');
        this.start();
        new Notification('✅ Notificaciones activadas', { 
          body: 'Te recordaremos tus tareas pendientes de hoy.',
          icon: '/assets/icons/icon-192x192.png'
        });
      }
    } 
    // Caso 2: Permiso no solicitado aún
    else if (Notification.permission === 'default') {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          btn.classList.add('active');
          statusEl.textContent = '(activas)';
          storage.setString(STORAGE_KEYS.NOTIFICATIONS, 'on');
          this.start();
          new Notification('✅ Notificaciones activadas', { 
            body: 'Te recordaremos tus tareas pendientes de hoy.',
            icon: '/assets/icons/icon-192x192.png'
          });
        } else {
          alert('ℹ️ Los permisos de notificación fueron denegados. Puedes cambiarlos en la configuración de tu navegador.');
        }
      } catch (error) {
        console.error('[Notifications Error] Fallo al solicitar permisos:', error);
      }
    } 
    // Caso 3: Permiso denegado previamente por el usuario
    else {
      alert('⚠️ Las notificaciones están bloqueadas. Por favor, habilítalas manualmente en la configuración de tu navegador (candado en la barra de direcciones).');
    }
  },

  /**
   * Inicia el intervalo de recordatorio (cada 1 hora).
   */
  start() {
    this.stop(); // Prevenir múltiples intervalos simultáneos
    notifInterval = setInterval(() => this.sendReminder(), 3600000); // 3600000 ms = 1 hora
    // Ejecutar una comprobación inicial inmediata
    this.sendReminder(); 
  },

  /**
   * Detiene y limpia el intervalo de recordatorio.
   */
  stop() {
    if (notifInterval) {
      clearInterval(notifInterval);
      notifInterval = null;
    }
  },

  /**
   * Lógica de negocio para enviar el recordatorio.
   * Evalúa las tareas pendientes del día actual.
   */
  sendReminder() {
    const currentVersion = calculator.getVersion();
    const tasks = VERSIONS[currentVersion].tasks;
    
    // Obtener índice del día actual (0 = Lunes, 6 = Domingo)
    const today = new Date().getDay();
    const todayIdx = today === 0 ? 6 : today - 1;

    const pendingTasks = [];
    
    tasks.forEach((task, tIdx) => {
      if (task.days.includes(todayIdx)) {
        const key = calculator.getKey(tIdx, todayIdx);
        if (!dataStore.checks[key]) {
          pendingTasks.push(task.name);
        }
      }
    });

    // Solo notificar si hay tareas pendientes
    if (pendingTasks.length > 0) {
      const message = pendingTasks.length > 3 
        ? `Te faltan: ${pendingTasks.slice(0, 3).join(', ')} y ${pendingTasks.length - 3} más.` 
        : `Te faltan: ${pendingTasks.join(', ')}.`;

      new Notification('🎯 Tareas pendientes de hoy', {
        body: message,
        icon: '/assets/icons/icon-192x192.png',
        badge: '/assets/icons/icon-192x192.png',
        tag: 'rutina-semanal-reminder', // Evita duplicados en la bandeja
        requireInteraction: false
      });
    }
  },

  /**
   * Restaura el estado de las notificaciones al cargar la aplicación.
   * @param {HTMLElement} btn 
   * @param {HTMLElement} statusEl 
   */
  restoreState(btn, statusEl) {
    const savedState = storage.getString(STORAGE_KEYS.NOTIFICATIONS);
    if (savedState === 'on' && Notification.permission === 'granted') {
      btn.classList.add('active');
      statusEl.textContent = '(activas)';
      this.start();
    }
  }
};