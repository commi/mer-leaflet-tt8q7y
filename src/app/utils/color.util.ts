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
