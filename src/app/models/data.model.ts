// Data format for Bestand and Kosten (with size classes)
export interface BestandKostenRow {
  Szenario: string;
  Groessenklasse: string;
  Technologie: string;
  Jahr: string;
  Bestand?: string;
  Kosten?: string;
}

// Data format for THG (with components, no size classes)
export interface THGRow {
  Szenario: string;
  Komponente: string;
  Jahr: string;
  THG: string;
}

// Union type for all data formats
export type DataRow = BestandKostenRow | THGRow;

// Type guard to check if row has Groessenklasse (Bestand/Kosten format)
export function hasGroessenklasse(row: DataRow): row is BestandKostenRow {
  return 'Groessenklasse' in row;
}

// Type guard to check if row has Komponente (THG format)
export function hasKomponente(row: DataRow): row is THGRow {
  return 'Komponente' in row;
}
