#!/usr/bin/env bun

/**
 * Convert Reference Data from CSV to JSON
 */

import {readFileSync, writeFileSync} from 'fs';

interface ReferenceDataRow {
  Groessenklasse: string;
  Jahr: string;
  Kosten: number;
}

function convertCSVToJSON(inputPath: string, outputPath: string): void {

  // Read CSV file
  const csvContent = readFileSync(inputPath, 'utf-8');
  const lines = csvContent.trim().split('\n');

  // Parse header (years)
  const header = lines[0].split(',');
  const years = header.slice(1).map(y => y.trim()); // Skip first column (label)


  const allData: ReferenceDataRow[] = [];

  // Process each data row (size class)
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    // Parse CSV line - split by comma but respect quotes
    const parts: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        parts.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    parts.push(current.trim());

    const sizeClass = parts[0].replace(/"/g, '');
    const valuesStr = parts.slice(1);


    // Convert German decimal format (comma) to English (dot) and parse
    // Values in CSV are already in Euro (not billions)
    const values = valuesStr.map(v => {
      const cleaned = v.replace(',', '.');
      return parseFloat(cleaned);
    });

    // Create data rows for this size class
    years.forEach((year, index) => {
      allData.push({
        Groessenklasse: sizeClass,
        Jahr: year,
        Kosten: values[index]
      });
    });
  }

  // Write JSON file
  const jsonContent = JSON.stringify(allData, null, 2);
  writeFileSync(outputPath, jsonContent, 'utf-8');

  console.log(`Created ${outputPath}`);
  console.log(`${allData.length} data points converted`);
}

// Main execution
const inputPath = 'Kosten_Keine_Antriebswende.csv';
const outputPath = 'KeineAntriebswende.json';

try {
  convertCSVToJSON(inputPath, outputPath);
} catch (error) {
  console.error('Error:', error);
  process.exit(1);
}
