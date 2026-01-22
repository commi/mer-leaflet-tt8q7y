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
const TECHNOLOGY_COLORS: TechnologyColor[] = [
  // Primary technologies (longest prefixes first for matching!)
  { prefix: 'OL-BEV', primary: '#85C200', dark: '#00692E', light: '#CFE899' },
  { prefix: 'BWS-BEV', primary: '#998A87', dark: '#5C5957', light: '#CCC4C2' },
  { prefix: 'Diesel', primary: '#003847', dark: '#4C7380', light: '#B2C4C7' },
  { prefix: 'BEV', primary: '#DEDB00', dark: '#616100', light: '#9C9E3B' },
  { prefix: 'FCEV', primary: '#0061A1', dark: '#66A1C7', light: '#B2D1E3' },
];

// THG component order for color shading (light to dark gradient)
const COMPONENT_ORDER = ['Fahrzeug', 'Energie_WTT', 'Energie_TTW', 'Wartung', 'EoL', 'Akku', 'Infrastruktur'];

// Technologies that use gradient towards lighter, others use dark gradient
const USE_LIGHT_GRADIENT = ['Diesel', 'BWS-BEV', 'FCEV'];

// Special size class value for "all size classes"
export const ALL_SIZE_CLASSES = 'alle Größenklassen';

// Size classes from enERSyn data
export const SIZE_CLASSES = [
  ALL_SIZE_CLASSES,
  '3,5-12 t',
  '12-26 t',
  'Lastzüge',
  'Sattelzüge'
];

/**
 * Extract technology name from series name
 * @param seriesName Full series name (e.g., "Diesel_Sattelzüge", "Fahrzeug Diesel", "BEV")
 * @returns Technology name (e.g., "Diesel", "BEV", "BWS-BEV", "OL-BEV", "FCEV")
 */
function extractTechnology(seriesName: string): string {
  // Check longest prefixes first to avoid matching "BEV" when it's "BWS-BEV" or "OL-BEV"
  for (const tech of TECHNOLOGY_COLORS) {
    if (seriesName.includes(tech.prefix)) {
      return tech.prefix;
    }
  }
  return '';
}

/**
 * Extract size class from series name
 * @param seriesName Full series name (e.g., "Diesel_Sattelzüge", "BEV 3,5-12 t")
 * @returns Size class or null if not found
 */
function extractSizeClass(seriesName: string): string | null {
  for (const sizeClass of SIZE_CLASSES) {
    if (sizeClass === ALL_SIZE_CLASSES) continue;
    if (seriesName.includes(sizeClass)) {
      return sizeClass;
    }
  }
  return null;
}

/**
 * Extract THG component from series name
 * @param seriesName Full series name (e.g., "Fahrzeug Diesel", "Energie_WTT BEV")
 * @returns Component name or null if not found
 */
function extractComponent(seriesName: string): string | null {
  for (const component of COMPONENT_ORDER) {
    if (seriesName.includes(component)) {
      return component;
    }
  }
  return null;
}

/**
 * Get technology color object
 * @param technology Technology name
 * @returns TechnologyColor object or null if not found
 */
function getTechColor(technology: string): TechnologyColor | null {
  return TECHNOLOGY_COLORS.find(tc => tc.prefix === technology) || null;
}

/**
 * Calculate size class color with gradation
 * @param techColor Technology color object
 * @param sizeClass Size class name
 * @param selectedSizeClasses Currently selected size classes
 * @returns Hex color string
 */
function getSizeClassColor(
  techColor: TechnologyColor,
  sizeClass: string | null,
  selectedSizeClasses?: string[]
): string {
  // If "alle Größenklassen" is selected or no specific size class
  if (!sizeClass || selectedSizeClasses?.includes(ALL_SIZE_CLASSES)) {
    // Special case: FCEV with "alle GK" uses lighter blue
    if (techColor.prefix === 'FCEV') {
      return techColor.light;
    }
    return techColor.primary;
  }

  // Determine gradient direction
  const targetColor = USE_LIGHT_GRADIENT.includes(techColor.prefix) ? techColor.light : techColor.dark;

  // Sattelzüge is base (primary), gradient towards 3,5-12t
  const gradients: { [key: string]: number } = {
    'Sattelzüge': 0,      // base (primary)
    'Lastzüge': 0.33,     // towards target
    '12-26 t': 0.67,      // more towards target
    '3,5-12 t': 1.0       // full target
  };

  return chroma.mix(techColor.primary, targetColor, gradients[sizeClass] ?? 0, 'oklab').hex();
}

/**
 * Calculate THG component color with shading
 * @param techColor Technology color object
 * @param component Component name
 * @returns Hex color string
 */
function getComponentColor(techColor: TechnologyColor, component: string): string {
  const index = COMPONENT_ORDER.findIndex(c => component.includes(c));
  if (index === -1) return techColor.primary;

  // Create gradient from light to dark across components
  const proportion = index / (COMPONENT_ORDER.length - 1);
  return chroma.mix(techColor.primary, 'white', proportion, 'oklab').hex();
}

/**
 * CENTRAL COLOR FUNCTION
 * Get color for any chart series based on context
 *
 * @param seriesName Full series name from data (e.g., "Diesel_Sattelzüge", "Fahrzeug Diesel", "BEV")
 * @param selectedSizeClasses Optional array of currently selected size classes (for context)
 * @returns Hex color string
 *
 * @example
 * // Bestand/Kosten with size class
 * getChartColor("Diesel_Sattelzüge", ["Sattelzüge", "Lastzüge"]) // → primary color
 *
 * @example
 * // Bestand/Kosten with "alle GK" selected
 * getChartColor("FCEV", ["alle Größenklassen"]) // → light blue (special case)
 *
 * @example
 * // THG component
 * getChartColor("Fahrzeug Diesel") // → shaded color based on component order
 *
 * @example
 * // Legend (just technology)
 * getChartColor("BEV") // → primary color
 */
export function getChartColor(seriesName: string, selectedSizeClasses?: string[]): string {
  // Extract technology
  const technology = extractTechnology(seriesName);
  const techColor = getTechColor(technology);

  if (!techColor) {
    console.warn(`No technology color found for series: ${seriesName}`);
    return '#CCCCCC';
  }

  // Check if this is a THG component series
  const component = extractComponent(seriesName);
  if (component) {
    return getComponentColor(techColor, component);
  }

  // Check if this has a size class
  const sizeClass = extractSizeClass(seriesName);
  return getSizeClassColor(techColor, sizeClass, selectedSizeClasses);
}

/**
 * Get primary color for a technology (for legend display)
 */
export function getTechnologyColor(technology: string): string {
  return TECHNOLOGY_COLORS.find(tc => tc.prefix === technology)?.primary ?? '#CCCCCC';
}

