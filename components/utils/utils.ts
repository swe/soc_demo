export const formatValue = (value: number): string => Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumSignificantDigits: 3,
  notation: 'compact',
}).format(value)

export const formatThousands = (value: number): string => Intl.NumberFormat('en-US', {
  maximumSignificantDigits: 3,
  notation: 'compact',
}).format(value)

export const getCssVariable = (variable: string): string => {
  if (typeof window === 'undefined') {
    // Return fallback values for SSR
    const fallbackValues: { [key: string]: string } = {
      '--color-violet-500': '#8b5cf6',
      '--color-violet-600': '#7c3aed',
      '--color-violet-700': '#6d28d9',
      '--color-violet-800': '#5b21b6',
      '--color-violet-900': '#4c1d95',
      '--color-violet-100': '#f3e8ff',
      '--color-violet-200': '#e9d5ff',
      '--color-violet-300': '#d8b4fe',
      '--color-violet-400': '#c084fc',
      '--color-sky-500': '#0ea5e9',
      '--color-sky-600': '#0284c7',
      '--color-sky-700': '#0369a1',
      '--color-sky-800': '#075985',
      '--color-sky-900': '#0c4a6e',
      '--color-sky-100': '#e0f2fe',
      '--color-sky-200': '#bae6fd',
      '--color-sky-300': '#7dd3fc',
      '--color-sky-400': '#38bdf8',
      '--color-green-500': '#10b981',
      '--color-green-600': '#059669',
      '--color-green-700': '#047857',
      '--color-green-800': '#065f46',
      '--color-green-900': '#064e3b',
      '--color-green-100': '#d1fae5',
      '--color-green-200': '#a7f3d0',
      '--color-green-300': '#6ee7b7',
      '--color-green-400': '#34d399',
      '--color-red-500': '#ef4444',
      '--color-red-600': '#dc2626',
      '--color-red-700': '#b91c1c',
      '--color-red-800': '#991b1b',
      '--color-red-900': '#7f1d1d',
      '--color-red-100': '#fee2e2',
      '--color-red-200': '#fecaca',
      '--color-red-300': '#fca5a5',
      '--color-red-400': '#f87171',
      '--color-gray-100': '#f3f4f6',
      '--color-gray-200': '#e5e7eb',
      '--color-gray-300': '#d1d5db',
      '--color-gray-400': '#9ca3af',
      '--color-gray-500': '#6b7280',
      '--color-gray-600': '#4b5563',
      '--color-gray-700': '#374151',
      '--color-gray-800': '#1f2937',
      '--color-gray-900': '#111827',
      '--color-white': '#ffffff',
    };
    return fallbackValues[variable] || '';
  }  
  return getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
};

const adjustHexOpacity = (hexColor: string, opacity: number): string => {
  // Remove the '#' if it exists
  hexColor = hexColor.replace('#', '');

  // Convert hex to RGB
  const r = parseInt(hexColor.substring(0, 2), 16);
  const g = parseInt(hexColor.substring(2, 4), 16);
  const b = parseInt(hexColor.substring(4, 6), 16);

  // Return RGBA string
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

const adjustHSLOpacity = (hslColor: string, opacity: number): string => {
  // Convert HSL to HSLA
  return hslColor.replace('hsl(', 'hsla(').replace(')', `, ${opacity})`);
};

const adjustOKLCHOpacity = (oklchColor: string, opacity: number): string => {
  // Add alpha value to OKLCH color
  return oklchColor.replace(/oklch\((.*?)\)/, (match, p1) => `oklch(${p1} / ${opacity})`);
};

export const adjustColorOpacity = (color: string, opacity: number): string => {
  if (color.startsWith('#')) {
    return adjustHexOpacity(color, opacity);
  } else if (color.startsWith('hsl')) {
    return adjustHSLOpacity(color, opacity);
  } else if (color.startsWith('oklch')) {
    return adjustOKLCHOpacity(color, opacity);
  } else {
    return "";    
  }
};

export const oklchToRGBA = (oklchColor: string): string => {
  if (typeof window === 'undefined') {
    // Return a fallback for SSR
    return '#000000';
  }
  
  // Create a temporary div to use for color conversion
  const tempDiv = document.createElement('div');
  tempDiv.style.color = oklchColor;
  document.body.appendChild(tempDiv);
  
  // Get the computed style and convert to RGB
  const computedColor = window.getComputedStyle(tempDiv).color;
  document.body.removeChild(tempDiv);
  
  return computedColor;
};