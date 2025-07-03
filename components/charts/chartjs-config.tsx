// Import Chart.js
import { Chart, Tooltip } from 'chart.js'
import { adjustColorOpacity, getCssVariable } from '@/components/utils/utils'

Chart.register(Tooltip)

// Define Chart.js default settings
Chart.defaults.font.family = '"Inter", sans-serif'
Chart.defaults.font.weight = 500
Chart.defaults.plugins.tooltip.borderWidth = 1
Chart.defaults.plugins.tooltip.displayColors = false
Chart.defaults.plugins.tooltip.mode = 'nearest'
Chart.defaults.plugins.tooltip.intersect = false
Chart.defaults.plugins.tooltip.position = 'nearest'
Chart.defaults.plugins.tooltip.caretSize = 0
Chart.defaults.plugins.tooltip.caretPadding = 20
Chart.defaults.plugins.tooltip.cornerRadius = 8
Chart.defaults.plugins.tooltip.padding = 8

interface ChartArea {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

interface ColorStop {
  stop: number;
  color: string;
}

// Function that generates a gradient for line charts
export const chartAreaGradient = (
  ctx: CanvasRenderingContext2D | null,
  chartArea: ChartArea | null,
  colorStops: ColorStop[] | null
): CanvasGradient | string | null => {
  if (!ctx || !chartArea || !colorStops || colorStops.length === 0) {
    return 'transparent';
  }
  const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
  colorStops.forEach(({ stop, color }) => {
    gradient.addColorStop(stop, color);
  });
  return gradient;
};

// Lazy-load chart colors to prevent SSR hydration issues
export const getChartColors = () => {
  if (typeof window === 'undefined') {
    // Return fallback colors for SSR
    return {
      textColor: {
        light: '#9ca3af',
        dark: '#6b7280'
      },  
      gridColor: {
        light: '#f3f4f6',
        dark: 'rgba(55, 65, 81, 0.6)'
      },
      backdropColor: {
        light: '#ffffff',
        dark: '#1f2937'
      },
      tooltipTitleColor: {
        light: '#1f2937',
        dark: '#f3f4f6'
      },
      tooltipBodyColor: {
        light: '#6b7280',
        dark: '#9ca3af'
      },
      tooltipBgColor: {
        light: '#ffffff',
        dark: '#374151'
      },
      tooltipBorderColor: {
        light: '#e5e7eb',
        dark: '#4b5563'
      },
    };
  }
  
  return {
    textColor: {
      light: getCssVariable('--color-gray-400'),
      dark: getCssVariable('--color-gray-500')
    },  
    gridColor: {
      light: getCssVariable('--color-gray-100'),
      dark: adjustColorOpacity(getCssVariable('--color-gray-700'), 0.6)
    },
    backdropColor: {
      light: getCssVariable('--color-white'),
      dark: getCssVariable('--color-gray-800')
    },
    tooltipTitleColor: {
      light: getCssVariable('--color-gray-800'),
      dark: getCssVariable('--color-gray-100')
    },
    tooltipBodyColor: {
      light: getCssVariable('--color-gray-500'),
      dark: getCssVariable('--color-gray-400')
    },
    tooltipBgColor: {
      light: getCssVariable('--color-white'),
      dark: getCssVariable('--color-gray-700')
    },
    tooltipBorderColor: {
      light: getCssVariable('--color-gray-200'),
      dark: getCssVariable('--color-gray-600')
    },
  };
};
