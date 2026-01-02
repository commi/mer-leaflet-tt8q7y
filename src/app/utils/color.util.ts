import chroma from 'chroma-js';

/**
 * Function to calculate the color of a feature based on a number
 * @param colorMap Map of colors for certain values
 * @param wert The value to calculate the color for
 * @return Color as hex string
 */
export function getLineColor(colorMap: { [key: number]: string }, wert: number): string {
  // Get the keys and sort them
  const keys = Object.keys(colorMap).map(Number).sort((a, b) => a - b);

  // Clamp the value to the range defined by the minimum and maximum keys
  const clampedWert = Math.min(Math.max(wert, keys[0]), keys[keys.length - 1]);

  // Find the keys that are nearest to the clamped value
  let lowKey: number = keys[0];
  let highKey: number = keys[1];
  for (let i = 0; i < keys.length - 1; i++) {
    if (keys[i] <= clampedWert && clampedWert <= keys[i + 1]) {
      lowKey = keys[i];
      highKey = keys[i + 1];
      break;
    }
  }

  // Calculate the proportion of the value between the nearest keys
  const proportion = (clampedWert - lowKey) / (highKey - lowKey);

  // Interpolate between the two colors based on the proportion, return the color as a string
  return chroma.mix(colorMap[lowKey], colorMap[highKey], proportion, 'hsl').hex();
}

// ========================================
// Chart Technology Colors
// ========================================

export interface TechnologyColor {
  prefix: string;
  primary: string;
  dark: string;
  light: string;
}

// Designer color palette from enERSyn brand guidelines
export const TECHNOLOGY_COLORS: TechnologyColor[] = [
  // Primary technologies (longest prefixes first for matching!)
  { prefix: 'OL-BEV', primary: '#85C200', dark: '#00692E', light: '#CFE899' },
  { prefix: 'BWS-BEV', primary: '#998A87', dark: '#5C5957', light: '#CCC4C2' },
  { prefix: 'Diesel', primary: '#003847', dark: '#4C7380', light: '#B2C4C7' },
  { prefix: 'BEV', primary: '#DEDB00', dark: '#616100', light: '#9C9E3B' },
  { prefix: 'FCEV', primary: '#0061A1', dark: '#66A1C7', light: '#B2D1E3' },
  // THG component categories
  { prefix: 'Fahrzeug Diesel', primary: '#003847', dark: '#4C7380', light: '#B2C4C7' },
  { prefix: 'Fahrzeug BEV', primary: '#DEDB00', dark: '#616100', light: '#9C9E3B' },
  { prefix: 'Fahrzeug BWS-BEV', primary: '#998A87', dark: '#5C5957', light: '#CCC4C2' },
  { prefix: 'Fahrzeug OL-BEV', primary: '#85C200', dark: '#00692E', light: '#CFE899' },
  { prefix: 'Fahrzeug FCEV', primary: '#0061A1', dark: '#66A1C7', light: '#B2D1E3' },
  { prefix: 'Energie Diesel', primary: '#003847', dark: '#4C7380', light: '#B2C4C7' },
  { prefix: 'Energie BEV', primary: '#DEDB00', dark: '#616100', light: '#9C9E3B' },
  { prefix: 'Energie BWS-BEV', primary: '#998A87', dark: '#5C5957', light: '#CCC4C2' },
  { prefix: 'Energie OL-BEV', primary: '#85C200', dark: '#00692E', light: '#CFE899' },
  { prefix: 'Energie FCEV', primary: '#0061A1', dark: '#66A1C7', light: '#B2D1E3' },
  { prefix: 'Energie_TTW Diesel', primary: '#003847', dark: '#4C7380', light: '#B2C4C7' },
  { prefix: 'Infrastruktur BEV', primary: '#DEDB00', dark: '#616100', light: '#9C9E3B' },
  { prefix: 'Infrastruktur BWS-BEV', primary: '#998A87', dark: '#5C5957', light: '#CCC4C2' },
  { prefix: 'Infrastruktur OL-BEV', primary: '#85C200', dark: '#00692E', light: '#CFE899' },
  { prefix: 'Infrastruktur FCEV', primary: '#0061A1', dark: '#66A1C7', light: '#B2D1E3' },
  { prefix: 'Akku BEV', primary: '#DEDB00', dark: '#616100', light: '#9C9E3B' },
  { prefix: 'Akku BWS-BEV', primary: '#998A87', dark: '#5C5957', light: '#CCC4C2' },
  { prefix: 'Akku OL-BEV', primary: '#85C200', dark: '#00692E', light: '#CFE899' },
  { prefix: 'Akku FCEV', primary: '#0061A1', dark: '#66A1C7', light: '#B2D1E3' },
  { prefix: 'Wartung BEV', primary: '#DEDB00', dark: '#616100', light: '#9C9E3B' },
  { prefix: 'Wartung BWS-BEV', primary: '#998A87', dark: '#5C5957', light: '#CCC4C2' },
  { prefix: 'Wartung Diesel', primary: '#003847', dark: '#4C7380', light: '#B2C4C7' },
  { prefix: 'Wartung FCEV', primary: '#0061A1', dark: '#66A1C7', light: '#B2D1E3' },
  { prefix: 'Wartung OL-BEV', primary: '#85C200', dark: '#00692E', light: '#CFE899' },
  { prefix: 'EoL BEV', primary: '#DEDB00', dark: '#616100', light: '#9C9E3B' },
  { prefix: 'EoL BWS-BEV', primary: '#998A87', dark: '#5C5957', light: '#CCC4C2' },
  { prefix: 'EoL Diesel', primary: '#003847', dark: '#4C7380', light: '#B2C4C7' },
  { prefix: 'EoL FCEV', primary: '#0061A1', dark: '#66A1C7', light: '#B2D1E3' },
  { prefix: 'EoL OL-BEV', primary: '#85C200', dark: '#00692E', light: '#CFE899' }
];

// Size classes from enERSyn data
export const SIZE_CLASSES = [
  'alle Größenklassen',
  '3,5-12 t',
  '12-26 t',
  'Lastzüge',
  'Sattelzüge'
];

// Static color mapping: Technology + Size Class → Fixed Color
// This ensures consistent colors regardless of which size classes are selected
const COLOR_MAP: { [key: string]: string } = {};

// Build static color map on module load
(() => {
  TECHNOLOGY_COLORS.forEach(tech => {
    // No suffix (or "alle Größenklassen") → primary color
    COLOR_MAP[tech.prefix] = tech.primary;

    // Each size class gets a fixed shade
    const sizeClassColors = [
      tech.primary,     // "alle Größenklassen" or no suffix
      tech.light,       // "3,5-12 t"
      tech.primary,     // "12-26 t"
      tech.dark,        // "Lastzüge"
      chroma.mix(tech.primary, tech.dark, 0.5, 'lab').hex()  // "Sattelzüge"
    ];

    SIZE_CLASSES.forEach((sizeClass, index) => {
      const key = `${tech.prefix}_${sizeClass}`;
      COLOR_MAP[key] = sizeClassColors[index] || tech.primary;
    });
  });
})();

/**
 * Get color for a series name with static tech + size class mapping
 * @param seriesName Full series name (e.g., "BEV" or "BEV_3,5-12 t")
 * @returns Hex color string
 */
export function getSeriesColor(seriesName: string): string {
  // Check static map first
  if (COLOR_MAP[seriesName]) {
    return COLOR_MAP[seriesName];
  }

  // Find matching technology color by prefix (longest match first)
  const sortedColors = [...TECHNOLOGY_COLORS].sort((a, b) => b.prefix.length - a.prefix.length);
  const techColor = sortedColors.find(tc =>
    seriesName.startsWith(tc.prefix)
  );

  if (!techColor) {
    console.warn(`No technology color found for series: ${seriesName}`);
    return '#CCCCCC';
  }

  // Return primary color as fallback
  return techColor.primary;
}

/**
 * Get primary color for a technology (for legend display)
 */
export function getTechnologyColor(technology: string): string {
  const techColor = TECHNOLOGY_COLORS.find(tc => tc.prefix === technology);
  return techColor ? techColor.primary : '#CCCCCC';
}

