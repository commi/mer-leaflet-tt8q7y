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
  { prefix: 'Diesel', primary: '#003847', dark: '#4C7380', light: '#B2C4C7' },
  { prefix: 'BEV', primary: '#DEDB00', dark: '#616100', light: '#9C9E3B' },
  { prefix: 'BWS', primary: '#998A87', dark: '#5C5957', light: '#CCC4C2' },
  { prefix: 'OL', primary: '#85C200', dark: '#00692E', light: '#CFE899' },
  { prefix: 'O-BEV', primary: '#85C200', dark: '#00692E', light: '#CFE899' },
  { prefix: 'O-HEV', primary: '#85C200', dark: '#00692E', light: '#CFE899' },
  { prefix: 'FCEV', primary: '#0061A1', dark: '#66A1C7', light: '#B2D1E3' },
  { prefix: 'H2 FCEV', primary: '#0061A1', dark: '#66A1C7', light: '#B2D1E3' },
  { prefix: 'H2', primary: '#0061A1', dark: '#66A1C7', light: '#B2D1E3' },
  { prefix: 'Strom BEV', primary: '#DEDB00', dark: '#616100', light: '#9C9E3B' },
  { prefix: 'Strom O-BEV', primary: '#85C200', dark: '#00692E', light: '#CFE899' },
  { prefix: 'Fzg.-Herstellung BEV', primary: '#DEDB00', dark: '#616100', light: '#9C9E3B' },
  { prefix: 'Fzg.-Herstellung O-BEV', primary: '#85C200', dark: '#00692E', light: '#CFE899' },
  { prefix: 'Fzg.-Herstellung FCEV', primary: '#0061A1', dark: '#66A1C7', light: '#B2D1E3' },
  { prefix: 'Fzg.-Herstellung Diesel', primary: '#003847', dark: '#4C7380', light: '#B2C4C7' },
  { prefix: 'Infrastruktur BEV', primary: '#DEDB00', dark: '#616100', light: '#9C9E3B' },
  { prefix: 'Infrastruktur O-BEV', primary: '#85C200', dark: '#00692E', light: '#CFE899' }
];

export const SIZE_CLASSES = [
  'alle Größenklassen',
  '3,5-7,5t',
  '7,5-12t',
  '12-18t',
  '18-26t',
  '26-40t'
];

/**
 * Get color for a series name, with automatic shading for size classes
 * @param seriesName Full series name (e.g., "BEV" or "BEV_3,5-7,5t")
 * @returns Hex color string
 */
export function getSeriesColor(seriesName: string): string {
  // Find matching technology color by prefix (longest match first)
  const sortedColors = [...TECHNOLOGY_COLORS].sort((a, b) => b.prefix.length - a.prefix.length);
  const techColor = sortedColors.find(tc =>
    seriesName.startsWith(tc.prefix)
  );

  if (!techColor) {
    console.warn(`No technology color found for series: ${seriesName}`);
    return '#CCCCCC';
  }

  // Extract size class suffix if present
  const hasSuffix = seriesName.includes('_');
  if (!hasSuffix) {
    // No suffix = return primary color
    return techColor.primary;
  }

  // Parse suffix to determine shade index
  const suffix = seriesName.split('_')[1];
  const shadeIndex = getSizeClassIndex(suffix);

  // Use designer colors: light → primary → dark
  return getShadeFromPalette(techColor, shadeIndex, SIZE_CLASSES.length);
}

/**
 * Get index of size class for shading
 */
function getSizeClassIndex(sizeClass: string): number {
  const index = SIZE_CLASSES.indexOf(sizeClass);
  return index >= 0 ? index : 0;
}

/**
 * Get shade from designer palette based on size class index
 */
function getShadeFromPalette(techColor: TechnologyColor, index: number, totalShades: number): string {
  // If "alle Größenklassen" (index 0), return primary color
  if (index === 0) {
    return techColor.primary;
  }

  // Interpolate between light → primary → dark
  const scale = chroma.scale([
    techColor.light,
    techColor.primary,
    techColor.dark
  ]).mode('lab').colors(totalShades);

  return scale[index];
}

/**
 * Get primary color for a technology (for legend display)
 */
export function getTechnologyColor(technology: string): string {
  const techColor = TECHNOLOGY_COLORS.find(tc => tc.prefix === technology);
  return techColor ? techColor.primary : '#CCCCCC';
}

