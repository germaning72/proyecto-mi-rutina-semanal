/**
 * ==============================================================================
 * MOTOR DE EXPORTACIÓN DE DATOS - Mi Rutina Semanal
 * ==============================================================================
 * Genera archivos CSV compatibles con Excel (UTF-8 con BOM).
 * Maneja la sanitización de datos, el formato de símbolos y la estructura 
 * de resumen solicitada por el negocio.
 * ==============================================================================
 */

import { calculator } from '../core/calculator.js';
import { dataStore } from '../core/storage.js';
import { CATEGORIES, VERSIONS, DAYS_SHORT } from '../core/constants.js';

export const exporter = {
  /**
   * Genera y descarga el archivo CSV con el estado actual de la rutina.
   */
  toCSV() {
    try {
      const currentVersion = calculator.getVersion();
      const tasks = VERSIONS[currentVersion].tasks;
      
      // BOM (Byte Order Mark) para forzar la codificación UTF-8 en Excel
      const BOM = '\uFEFF';
      
      // 1. Encabezados
      let csv = 'Categoria,Actividad,Lunes,Martes,Miercoles,Jueves,Viernes,Sabado,Domingo,Cumplimiento,Observaciones\n';

      // 2. Filas de Datos por Actividad
      tasks.forEach((task, tIdx) => {
        const category = CATEGORIES[task.categoryId];
        
        // Sanitización de comillas dobles (Estándar RFC 4180)
        const taskName = task.name.replace(/"/g, '""');
        const categoryName = category.name.replace(/"/g, '""');
        
        let row = `"${categoryName}","${taskName}",`;
        let scheduled = 0;
        let completed = 0;

        // Iterar sobre los 7 días de la semana
        DAYS_SHORT.forEach((_, dIdx) => {
          const isEnabled = task.days.includes(dIdx);
          const key = calculator.getKey(tIdx, dIdx);
          const isChecked = dataStore.checks[key] || false;

          if (isEnabled) {
            scheduled++;
            if (isChecked) {
              completed++;
              row += '✓,'; // COMPLETO
            } else {
              row += 'P,'; // PENDIENTE
            }
          } else {
            row += '-,'; // NO PROGRAMADO
          }
        });

        // Calcular porcentaje de cumplimiento de la actividad
        const percent = scheduled > 0 ? Math.round((completed / scheduled) * 100) : 0;
        
        // Sanitizar observaciones (eliminar saltos de línea y escapar comillas)
        const obs = calculator.getObservation(tIdx).replace(/"/g, '""').replace(/\n/g, ' ');
        row += `${percent}%,"${obs}"\n`;
        
        csv += row;
      });

      // 3. Sección de Resumen (Alineación estricta de columnas)
      csv += '\n'; // Fila vacía de separación
      csv += ',"Resumen por día:",,,,,,,,,\n'; // Columna A vacía, B con texto
      csv += '"","Día",Lunes,Martes,Miercoles,Jueves,Viernes,Sabado,Domingo,,\n'; // Columna A vacía, B con texto
      csv += '"","Cumplimiento",'; // Columna A vacía, B con texto

      // Calcular y agregar cumplimiento por día
      DAYS_SHORT.forEach((_, dIdx) => {
        const dayPercent = calculator.calculateDayCompliance(dIdx);
        csv += `${dayPercent}%,`;
      });
      csv += ',\n'; // Cierre de fila

      // 4. Generación del Blob y descarga
      const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      link.setAttribute('href', url);
      link.setAttribute('download', `rutina_${currentVersion}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      
      // Limpieza de memoria
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);

    } catch (error) {
      console.error('[Exporter Error] Fallo al generar el archivo CSV:', error);
      alert(' Ocurrió un error al exportar los datos. Por favor, revisa la consola.');
    }
  }
};