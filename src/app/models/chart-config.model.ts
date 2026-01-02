export interface ChartConfig {
  id: string;
  dataSource: string;  // Filename: Bestand.json, Kosten.json, THG.json
  dataKey: string;     // JSON field name: "Bestand", "Kosten", "THG"
  title: string;
  unitDivisor: number;
  unitLabel: string;
}

export const CHART_CONFIGS: ChartConfig[] = [
  {
    id: 'bestand',
    dataSource: 'Bestand',
    dataKey: 'Bestand',
    title: 'Bestand',
    unitDivisor: 1000,
    unitLabel: 'in Tsd. Fahrzeuge'
  },
  {
    id: 'kosten',
    dataSource: 'Kosten',
    dataKey: 'Kosten',
    title: 'Kosten',
    unitDivisor: 1000000000,
    unitLabel: 'in Mrd. €'
  },
  {
    id: 'thg',
    dataSource: 'THG',
    dataKey: 'THG',
    title: 'THG-Emissionen',
    unitDivisor: 1,
    unitLabel: 'in Mt CO2äq'
  }
];
