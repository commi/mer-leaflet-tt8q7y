export interface ChartConfig {
  id: string;
  dataSource: string;
  title: string;
  unitDivisor: number;
  unitLabel: string;
}

export const CHART_CONFIGS: ChartConfig[] = [
  {
    id: 'bestand',
    dataSource: 'Bestand',
    title: 'Bestand',
    unitDivisor: 1000,
    unitLabel: 'in Tsd. Fahrzeuge'
  },
  {
    id: 'kosten',
    dataSource: 'Kosten',
    title: 'Kosten',
    unitDivisor: 1000000000,
    unitLabel: 'in Mrd. €'
  },
  {
    id: 'thg',
    dataSource: 'THG-Emissionen',
    title: 'THG-Emissionen',
    unitDivisor: 1,
    unitLabel: 'in Mt CO2äq'
  }
];
