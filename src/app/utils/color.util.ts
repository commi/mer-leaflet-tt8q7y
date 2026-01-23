/**
 * FARBVERWALTUNG
 * - Zuweisung Serien zu CSS Custom Properties
 * - Array-Index = Sortier-Reihenfolge
 */

export const LEGEND_COLOR_MAP: Map<RegExp, string> = new Map([
  // Infrastruktur
  [/^Infrastruktur OL-BEV$/, "var(--color-ol-bev-medium)"],
  [/^Infrastruktur BEV$/, "var(--color-bev-infrastructure)"],
  [/^Infrastruktur FCEV$/, "var(--color-fcev-light)"],
  [/^Infrastruktur BWS-BEV$/, "var(--color-bws-bev-light)"],
  [/^Infrastruktur Diesel$/, "var(--color-diesel-energy-light)"],

  // End of Life
  [/^EoL Diesel$/, "var(--color-diesel-energy-soft)"],
  [/^EoL OL-BEV$/, "var(--color-ol-bev-light)"],
  [/^EoL BEV$/, "var(--color-bev-highlight)"],
  [/^EoL FCEV$/, "var(--color-fcev-light)"],
  [/^EoL BWS-BEV$/, "var(--color-bws-bev-light)"],

  // Wartung
  [/^Wartung Diesel$/, "var(--color-diesel-energy-medium)"],
  [/^Wartung OL-BEV$/, "var(--color-ol-bev-medium)"],
  [/^Wartung BEV$/, "var(--color-bev-highlight)"],
  [/^Wartung FCEV$/, "var(--color-fcev-primary)"],
  [/^Wartung BWS-BEV$/, "var(--color-bws-bev-primary)"],

  // Energie
  [/^Energie_TTW Diesel$/, "var(--color-diesel-energy-ttw)"],
  [/^Energie_WTT Diesel$/, "var(--color-diesel-energy-wtt)"],
  [/^Energie OL-BEV$/, "var(--color-ol-bev-light)"],
  [/^Energie BEV$/, "var(--color-bev-energy)"],
  [/^Energie FCEV$/, "var(--color-fcev-light)"],
  [/^Energie BWS-BEV$/, "var(--color-bws-bev-light)"],

  // Akku
  [/^Akku OL-BEV$/, "var(--color-ol-bev-medium)"],
  [/^Akku BEV$/, "var(--color-bev-battery)"],
  [/^Akku BWS-BEV$/, "var(--color-bws-bev-primary)"],

  // Fahrzeuge (THG)
  [/^Fahrzeug Diesel$/, "var(--color-diesel-vehicle-dark)"],
  [/^Fahrzeug OL-BEV$/, "var(--color-ol-bev-dark)"],
  [/^Fahrzeug BEV$/, "var(--color-bev-vehicle)"],
  [/^Fahrzeug FCEV$/, "var(--color-fcev-primary)"],
  [/^Fahrzeug BWS-BEV$/, "var(--color-bws-bev-primary)"],

  // Gewichtsklassen (Bestand/Kosten)
  [/^Diesel Sattelzüge$/, "var(--color-diesel-vehicle-dark)"],
  [/^Diesel Lastzüge$/, "var(--color-diesel-vehicle-medium)"],
  [/^Diesel 12-26 t$/, "var(--color-diesel-energy-soft)"],
  [/^Diesel 3,5-12 t$/, "var(--color-diesel-energy-light)"],

  [/^OL-BEV Sattelzüge$/, "var(--color-ol-bev-dark)"],
  [/^OL-BEV Lastzüge$/, "var(--color-ol-bev-medium)"],
  [/^OL-BEV 12-26 t$/, "var(--color-ol-bev-light)"],
  [/^OL-BEV 3,5-12 t$/, "var(--color-ol-bev-light)"],

  [/^BEV Sattelzüge$/, "var(--color-bev-infrastructure)"],
  [/^BEV Lastzüge$/, "var(--color-bev-vehicle)"],
  [/^BEV 12-26 t$/, "var(--color-bev-battery)"],
  [/^BEV 3,5-12 t$/, "var(--color-bev-energy)"],

  [/^FCEV Sattelzüge$/, "var(--color-fcev-dark)"],
  [/^FCEV Lastzüge$/, "var(--color-fcev-light)"],
  [/^FCEV 12-26 t$/, "var(--color-fcev-primary)"],
  [/^FCEV 3,5-12 t$/, "var(--color-fcev-primary)"],

  [/^BWS-BEV Sattelzüge$/, "var(--color-bws-bev-dark)"],
  [/^BWS-BEV Lastzüge$/, "var(--color-bws-bev-light)"],
  [/^BWS-BEV 12-26 t$/, "var(--color-bws-bev-primary)"],
  [/^BWS-BEV 3,5-12 t$/, "var(--color-bws-bev-light)"],

  // Technologie-Label (ohne Größenklasse)
  [/^Diesel$/, "var(--color-diesel-vehicle-dark)"],
  [/^OL-BEV$/, "var(--color-ol-bev-medium)"],
  [/^BEV$/, "var(--color-bev-energy)"],
  [/^FCEV$/, "var(--color-fcev-light)"],
  [/^BWS-BEV$/, "var(--color-bws-bev-primary)"],
  [/^Batterieelektrisch$/, "var(--color-bev-energy)"],
  [/^Brennstoffzelle$/, "var(--color-fcev-primary)"],
  [/^Batteriewechsel(system)?$/, "var(--color-bws-bev-primary)"],

  // Generische (am Ende)
  [/\bDiesel\b/i, "var(--color-diesel-vehicle-dark)"],
  [/\bOL-BEV\b/i, "var(--color-ol-bev-medium)"],
  [/\bBWS-BEV\b/i, "var(--color-bws-bev-primary)"],
  [/\bBEV\b/i, "var(--color-bev-energy)"],
  [/\b(FCEV|Brennstoffzelle)\b/i, "var(--color-fcev-primary)"],
]);

export function getChartColor(seriesName: string): string {
  for (const [regex, cssVar] of LEGEND_COLOR_MAP) {
    if (regex.test(seriesName)) return cssVar;
  }
  console.warn(`Keine Farbe für "${seriesName}"`);
  return '#F00';
}

/**
 * THG-Chart: Bottom → Top (Legende reversed, daher Infrastruktur oben).
 * Array-Index = Sortierung.
 */
const THG_SERIES_ORDER: RegExp[] = [
  // Fahrzeug
  /^Fahrzeug BEV$/,
  /^Fahrzeug FCEV$/,
  /^Fahrzeug OL-BEV$/,
  /^Fahrzeug BWS-BEV$/,
  /^Fahrzeug Diesel$/,

  // Akku
  /^Akku BEV$/,
  /^Akku FCEV$/,
  /^Akku OL-BEV$/,
  /^Akku BWS-BEV$/,
  /^Akku Diesel$/,

  // Energie
  /^Energie BEV$/,
  /^Energie FCEV$/,
  /^Energie OL-BEV$/,
  /^Energie BWS-BEV$/,
  /^Energie Diesel$/,

  // Energie_WTT
  /^Energie_WTT BEV$/,
  /^Energie_WTT FCEV$/,
  /^Energie_WTT OL-BEV$/,
  /^Energie_WTT BWS-BEV$/,
  /^Energie_WTT Diesel$/,

  // Energie_TTW
  /^Energie_TTW BEV$/,
  /^Energie_TTW FCEV$/,
  /^Energie_TTW OL-BEV$/,
  /^Energie_TTW BWS-BEV$/,
  /^Energie_TTW Diesel$/,

  // Wartung
  /^Wartung BEV$/,
  /^Wartung FCEV$/,
  /^Wartung OL-BEV$/,
  /^Wartung BWS-BEV$/,
  /^Wartung Diesel$/,

  // EoL
  /^EoL BEV$/,
  /^EoL FCEV$/,
  /^EoL OL-BEV$/,
  /^EoL BWS-BEV$/,
  /^EoL Diesel$/,

  // Infrastruktur
  /^Infrastruktur BEV$/,
  /^Infrastruktur FCEV$/,
  /^Infrastruktur OL-BEV$/,
  /^Infrastruktur BWS-BEV$/,
  /^Infrastruktur Diesel$/,
];

/**
 * Bestand/Kosten Legende: Diesel → OL-BEV → BEV → FCEV → BWS-BEV
 */
const BESTAND_KOSTEN_LEGEND_ORDER: RegExp[] = [
  /\bDiesel\b/,
  /\bFCEV\b/,
  /\bBWS/,
  /\bOL-BEV\b/,
  /\bBEV\b(?!.*(OL-BEV))/,
];

function findOrder(seriesName: string, patterns: RegExp[]): number {
  for (let i = 0; i < patterns.length; i++) {
    if (patterns[i].test(seriesName)) return i;
  }
  return Infinity;
}

export function getThgSeriesOrder(seriesName: string): number {
  return findOrder(seriesName, THG_SERIES_ORDER);
}

export function getBestandKostenLegendOrder(seriesName: string): number {
  return findOrder(seriesName, BESTAND_KOSTEN_LEGEND_ORDER);
}

export function getBestandKostenStackOrder(seriesName: string): number {
  return findOrder(seriesName, BESTAND_KOSTEN_LEGEND_ORDER.toReversed());
}

// Size Classes (für UI)
export const ALL_SIZE_CLASSES = 'alle Größenklassen';

export const SIZE_CLASSES = [
  ALL_SIZE_CLASSES,
  '3,5-12 t',
  '12-26 t',
  'Lastzüge',
  'Sattelzüge'
];
