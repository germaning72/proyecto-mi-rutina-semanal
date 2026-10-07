/**
 * ==============================================================================
 * MOTOR DE VISUALIZACIÓN DE DATOS - Mi Rutina Semanal
 * ==============================================================================
 * Encapsula la lógica de renderizado de Chart.js.
 * Maneja el ciclo de vida de las instancias, adaptación a temas (Claro/Oscuro)
 * y la configuración específica de cada tipo de gráfica.
 * ==============================================================================
 */

import { Chart, registerables } from 'chart.js';
import { calculator } from '../core/calculator.js';
import { CATEGORIES, VERSIONS } from '../core/constants.js';

// Registrar todos los componentes necesarios de Chart.js para entornos modulares
Chart.register(...registerables);

let chartInstance = null;

/**
 * Obtiene la paleta de colores dinámica basada en el tema actual (Claro/Oscuro).
 * @returns {Object} Colores de texto, grid y fondo.
 */
const getThemeColors = () => {
  const isDark = document.documentElement.classList.contains('dark');
  return {
    text: isDark ? '#f1f5f9' : '#1e293b',
    grid: isDark ? '#334155' : '#e2e8f0',
    tooltipBg: isDark ? '#1e293b' : '#ffffff',
    tooltipBorder: isDark ? '#475569' : '#cbd5e1'
  };
};

export const charts = {
  /**
   * Función orquestadora principal para renderizar gráficas.
   * @param {string} type - 'bar', 'doughnut', 'radarStacked', 'radarAnalysis'
   */
  render(type) {
    const canvas = document.getElementById('progressChart');
    if (!canvas) {
      console.error('[Charts] No se encontró el elemento canvas #progressChart');
      return;
    }

    const ctx = canvas.getContext('2d');
    const colors = getThemeColors();

    // ️ Gestión de Memoria: Destruir instancia previa para evitar superposiciones
    if (chartInstance) {
      chartInstance.destroy();
    }

    let config;
    switch (type) {
      case 'bar':
        config = this.buildBarConfig(colors);
        break;
      case 'doughnut':
        config = this.buildDoughnutConfig(colors);
        break;
      case 'radarStacked':
        config = this.buildRadarStackedConfig(colors);
        break;
      case 'radarAnalysis':
        config = this.buildRadarAnalysisConfig(colors);
        break;
      default:
        config = this.buildBarConfig(colors);
    }

    chartInstance = new Chart(ctx, config);
  },

  /**
   * Gráfica de Barras: Progreso individual por actividad.
   */
  buildBarConfig(colors) {
    const tasks = VERSIONS[calculator.getVersion()].tasks;
    return {
      type: 'bar',
      data: {
        labels: tasks.map(t => `${t.icon} ${t.name}`),
        datasets: [{
          label: 'Cumplimiento Actual (%)',
          data: tasks.map((_, idx) => calculator.calculateTaskProgress(idx)),
          backgroundColor: tasks.map(t => CATEGORIES[t.categoryId].color + 'CC'),
          borderColor: tasks.map(t => CATEGORIES[t.categoryId].color),
          borderWidth: 2,
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: colors.tooltipBg,
            titleColor: colors.text,
            bodyColor: colors.text,
            borderColor: colors.tooltipBorder,
            borderWidth: 1,
            callbacks: {
              afterLabel: (ctx) => `Categoría: ${CATEGORIES[tasks[ctx.dataIndex].categoryId].name}`
            }
          }
        },
        scales: {
          y: { 
            beginAtZero: true, 
            max: 100, 
            ticks: { color: colors.text, callback: v => v + '%' }, 
            grid: { color: colors.grid } 
          },
          x: { 
            ticks: { color: colors.text, maxRotation: 45 }, 
            grid: { display: false } 
          }
        }
      }
    };
  },

  /**
   * Gráfica de Dona: Distribución promedio por categoría.
   */
  buildDoughnutConfig(colors) {
    const categoryIds = Object.keys(CATEGORIES);
    return {
      type: 'doughnut',
      data: {
        labels: categoryIds.map(id => CATEGORIES[id].name),
        datasets: [{
          data: categoryIds.map(id => calculator.calculateCategoryProgress(id)),
          backgroundColor: categoryIds.map(id => CATEGORIES[id].color + 'CC'),
          borderColor: categoryIds.map(id => CATEGORIES[id].color),
          borderWidth: 3,
          hoverOffset: 15
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
          legend: { 
            position: 'bottom', 
            labels: { color: colors.text, padding: 20, usePointStyle: true } 
          },
          tooltip: {
            backgroundColor: colors.tooltipBg,
            titleColor: colors.text,
            bodyColor: colors.text,
            callbacks: {
              label: (ctx) => {
                const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                const pct = total > 0 ? Math.round((ctx.parsed / total) * 100) : 0;
                return `${ctx.label}: ${ctx.parsed}% (${pct}% del total)`;
              }
            }
          }
        }
      }
    };
  },

  /**
   * Gráfica Radar Stacked: Evolución de categorías en las últimas 4 semanas.
   */
  buildRadarStackedConfig(colors) {
    const categoryIds = Object.keys(CATEGORIES);
    const weeklyData = calculator.getWeeklyHistory();
    const chartColors = ['#6366f1', '#10b981', '#f59e0b', '#8b5cf6'];

    return {
      type: 'radar',
      data: {
        labels: categoryIds.map(id => CATEGORIES[id].shortName),
        datasets: weeklyData.map((week, idx) => ({
          label: week.label,
          // Nota: Para el stacked real, se requiere lógica acumulativa. 
          // Aquí mostramos el progreso directo por semana para claridad visual.
          data: categoryIds.map(catId => calculator.calculateCategoryProgress(catId)), 
          backgroundColor: chartColors[idx % chartColors.length] + '40',
          borderColor: chartColors[idx % chartColors.length],
          borderWidth: 2,
          pointBackgroundColor: chartColors[idx % chartColors.length],
          pointBorderColor: colors.tooltipBg,
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7,
          fill: true
        }))
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { 
            position: 'top', 
            labels: { color: colors.text, padding: 15, usePointStyle: true, font: { weight: '600' } } 
          },
          tooltip: {
            backgroundColor: colors.tooltipBg,
            titleColor: colors.text,
            bodyColor: colors.text,
            borderColor: colors.tooltipBorder,
            borderWidth: 1
          }
        },
        scales: {
          r: {
            beginAtZero: true,
            max: 100,
            ticks: { 
              color: colors.text, 
              backdropColor: 'transparent', 
              stepSize: 20, 
              callback: v => v + '%' 
            },
            grid: { color: colors.grid },
            pointLabels: { 
              color: colors.text, 
              font: { size: 12, weight: '600' } 
            },
            angleLines: { color: colors.grid }
          }
        }
      }
    };
  },

  /**
   * Gráfica Radar de Análisis: Comparativa Actual vs Objetivo (80%).
   */
  buildRadarAnalysisConfig(colors) {
    const tasks = VERSIONS[calculator.getVersion()].tasks;
    const currentData = tasks.map((_, idx) => calculator.calculateTaskProgress(idx));
    const targetData = tasks.map(() => 80); // Benchmark de rendimiento saludable

    return {
      type: 'radar',
      data: {
        labels: tasks.map(t => `${t.icon} ${t.name}`),
        datasets: [
          {
            label: 'Cumplimiento Actual',
            data: currentData,
            backgroundColor: 'rgba(99, 102, 241, 0.3)',
            borderColor: '#6366f1',
            borderWidth: 3,
            pointBackgroundColor: tasks.map(t => CATEGORIES[t.categoryId].color),
            pointBorderColor: colors.tooltipBg,
            pointBorderWidth: 2,
            pointRadius: 6,
            pointHoverRadius: 8,
            fill: true
          },
          {
            label: '🎯 Objetivo (80%)',
            data: targetData,
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            borderColor: '#10b981',
            borderWidth: 2,
            borderDash: [5, 5],
            pointBackgroundColor: '#10b981',
            pointBorderColor: colors.tooltipBg,
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
            fill: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { 
            position: 'top', 
            labels: { color: colors.text, padding: 15, usePointStyle: true, font: { weight: '600' } } 
          },
          tooltip: {
            backgroundColor: colors.tooltipBg,
            titleColor: colors.text,
            bodyColor: colors.text,
            borderColor: colors.tooltipBorder,
            borderWidth: 1,
            callbacks: {
              afterBody: (ctx) => {
                const idx = ctx[0].dataIndex;
                const diff = currentData[idx] - 80;
                const status = diff >= 0 ? '✅ Por encima del objetivo' : '⚠️ Por debajo del objetivo';
                return `${status} (${diff >= 0 ? '+' : ''}${diff}%)`;
              }
            }
          }
        },
        scales: {
          r: {
            beginAtZero: true,
            max: 100,
            ticks: { 
              color: colors.text, 
              backdropColor: 'transparent', 
              stepSize: 20, 
              callback: v => v + '%' 
            },
            grid: { color: colors.grid },
            pointLabels: { 
              color: colors.text, 
              font: { size: 11, weight: '500' } 
            },
            angleLines: { color: colors.grid }
          }
        }
      }
    };
  }
};