#!/usr/bin/env bun

/**
 * Convert Reference Data from CSV to JSON
 */

import {readFileSync, writeFileSync} from 'fs';

function convertCSVToJSON(inputPath: string, outputPath: string): void {

  // Read CSV file
  const csvContent = readFileSync(inputPath, 'utf-8');
  const lines = csvContent.trim().split('\n');

  // Parse header (years) - simple CSV split
  const header = lines[0].split(',');
  const years = header.slice(1); // Skip first empty column

  // Parse data row - handle quoted values properly
  const dataLine = lines[1];

  // Extract label (before first comma)
  const firstComma = dataLine.indexOf(',');
  const label = dataLine.substring(0, firstComma);

  // Extract values (after first comma) - they are quoted with commas inside
  const valuesString = dataLine.substring(firstComma + 1);

  // Match quoted values: "66,6233430401856"
  const valueMatches = valuesString.match(/"([^"]+)"/g);
  const valuesStr = valueMatches ? valueMatches.map(v => v.replace(/"/g, '')) : [];


  // Convert German decimal format (comma) to English (dot) and parse
  // Values in CSV are in Mrd. € (billions)
  const values = valuesStr.map(v => {
    const cleaned = v.replace(/"/g, '').replace(',', '.');
    return parseFloat(cleaned);
  });

  // Create JSON array with numeric values
  const data = years.map((year, index) => {
    // Convert from Mrd. € to raw value (multiply by 1e9)
    // This matches the format used in Kosten.json
    const rawValue = values[index] * 1_000_000_000;

    return {
      Jahr: year.replace(/"/g, ''),
      Kosten: rawValue  // Keep as number, not string
    };
  });

  // Write JSON file
  const jsonContent = JSON.stringify(data, null, 2);
  writeFileSync(outputPath, jsonContent, 'utf-8');

  console.log(`Created ${outputPath}`);
  console.log(`${data.length} data points converted`);
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
