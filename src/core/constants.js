/**
 * ==============================================================================
 * CONSTANTES DEL NÚCLEO - Mi Rutina Semanal
 * ==============================================================================
 * Fuente única de la verdad para configuraciones inmutables, categorías, 
 * versiones de tareas y claves de almacenamiento.
 * ==============================================================================
 */

// 1. CONFIGURACIÓN TEMPORAL
export const DAYS = Object.freeze([
  'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'
]);

export const DAYS_SHORT = Object.freeze([
  'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'
]);

export const MONTHS = Object.freeze([
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]);

// 2. SISTEMA DE CATEGORÍAS
// Los colores están definidos en HEX para inyección directa en estilos inline (badges, gráficas)
export const CATEGORIES = Object.freeze({
  productivity: {
    id: 'productivity',
    name: '💼 Productividad / Proyecto',
    shortName: '💼 Productividad',
    color: '#6366f1', // Indigo
    tasks: ['Avance de Proyecto', 'Mecanografía']
  },
  skills: {
    id: 'skills',
    name: '🧠 Nuevas Skills',
    shortName: '🧠 Nuevas Skills',
    color: '#8b5cf6', // Violet
    tasks: ['Clases de Inglés', 'Spiking - Inglés']
  },
  fitness: {
    id: 'fitness',
    name: '🏃‍♂️ Actividad Física',
    shortName: '🏃‍️ Actividad Física',
    color: '#10b981', // Emerald
    tasks: ['Basket', 'Nado Mar Abierto', 'Running']
  },
  personal: {
    id: 'personal',
    name: '📚 Desarrollo Personal',
    shortName: '📚 Desarrollo Personal',
    color: '#f59e0b', // Amber
    tasks: ['Lectura']
  }
});

// 3. VERSIONES DE RUTINA
// Actualizado con la nueva rutina de 12 actividades
export const VERSIONS = Object.freeze({
  v2: {
    name: "Versión 2 (Rutina Actualizada)",
    tasks: Object.freeze([
      // 💼 PRODUCTIVIDAD / PROYECTO (4 actividades)
      { 
        icon: "🛒", 
        name: "Proyecto E-commerce", 
        desc: "Desarrollo plataforma e-commerce", 
        days: [1, 2, 3], // Martes, Miércoles, Jueves
        categoryId: 'productivity' 
      },
      { 
        icon: "💻", 
        name: "Proyecto 4-Bytes", 
        desc: "Desarrollo proyecto 4-Bytes", 
        days: [0, 3], // Lunes, Jueves
        categoryId: 'productivity' 
      },
      { 
        icon: "🏅", 
        name: "Proyecto Marca Personal", 
        desc: "Construcción de marca personal", 
        days: [0, 2], // Lunes, Miércoles
        categoryId: 'productivity' 
      },
      { 
        icon: "🏠", 
        name: "Proyecto Alquiler Inmobiliario", 
        desc: "Gestión de propiedades en alquiler", 
        days: [4], // Viernes
        categoryId: 'productivity' 
      },
      
      //  NUEVAS SKILLS (2 actividades)
      { 
        icon: "🎓", 
        name: "Clases de Inglés", 
        desc: "Clases formales de inglés", 
        days: [0, 2, 4], // Lunes, Miércoles, Viernes
        categoryId: 'skills' 
      },
      { 
        icon: "🎯", 
        name: "Spiking - Inglés", 
        desc: "Práctica intensiva de inglés", 
        days: [0, 2, 4], // Lunes, Miércoles, Viernes
        categoryId: 'skills' 
      },
      
      // 📚 DESARROLLO PERSONAL (3 actividades)
      { 
        icon: "📊", 
        name: "Lectura Finanzas", 
        desc: "Lectura sobre finanzas personales", 
        days: [0, 2], // Lunes, Miércoles
        categoryId: 'personal' 
      },
      { 
        icon: "📈", 
        name: "Lectura Ventas y Marketing", 
        desc: "Lectura sobre ventas y marketing", 
        days: [1, 3], // Martes, Jueves
        categoryId: 'personal' 
      },
      { 
        icon: "🧠", 
        name: "Lectura Comportamiento Humano", 
        desc: "Lectura sobre psicología y comportamiento", 
        days: [4], // Viernes
        categoryId: 'personal' 
      },
      
      // 🏃‍♂️ ACTIVIDAD FÍSICA (4 actividades)
      { 
        icon: "🏊", 
        name: "Nado Mar Abierto", 
        desc: "Natación en aguas abiertas", 
        days: [1, 5, 6], // Martes, Sábado, Domingo
        categoryId: 'fitness' 
      },
      { 
        icon: "🏀", 
        name: "Basketball", 
        desc: "Práctica de basketball", 
        days: [4, 5, 6], // Viernes, Sábado, Domingo
        categoryId: 'fitness' 
      },
      { 
        icon: "🚴", 
        name: "Cycling", 
        desc: "Ciclismo de ruta o montaña", 
        days: [4, 5, 6], // Viernes, Sábado, Domingo
        categoryId: 'fitness' 
      },
      { 
        icon: "🏃", 
        name: "Running", 
        desc: "Carrera a pie", 
        days: [3], // Jueves
        categoryId: 'fitness' 
      }
    ])
  }
});

// 4. CLAVES DE ALMACENAMIENTO (LOCALSTORAGE)
// Centralizar las claves previene errores de tipeo (magic strings) y facilita la refactorización.
export const STORAGE_KEYS = Object.freeze({
  CHECKS: 'taskChecks',
  OBSERVATIONS: 'observations',
  HISTORY: 'progressHistory',
  STREAK: 'streak',
  LAST_CHECK_DATE: 'lastCheckDate',
  THEME: 'theme',
  NOTIFICATIONS: 'notifications'
});

// 5. UMBRALES DE PROGRESO (UI)
export const PROGRESS_THRESHOLDS = Object.freeze({
  COMPLETE: 100,
  HIGH: 70,
  MEDIUM: 40,
  LOW: 0
});