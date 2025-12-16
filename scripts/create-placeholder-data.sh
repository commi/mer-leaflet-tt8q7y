#!/bin/bash

# Create placeholder data for scenarios 3-8 and add Kosten data
# TODO(enERSyn): Replace with final data when available

set -e  # Exit on error

cd "$(dirname "$0")/../public/data/Bestand und Neuzulassungen"

echo "Creating placeholder data for enERSyn..."
echo ""

# Copy scenarios 1 data to 3-8
for scenario in {3..8}; do
  if [ ! -d "$scenario" ]; then
    mkdir -p "$scenario"
    echo "✓ Created directory: $scenario"
  fi

  # Copy all files from scenario 1
  cp -r 1/*.json "$scenario/" 2>/dev/null || true
  echo "✓ Copied data to scenario $scenario (using scenario 1 as template)"
done

echo ""
echo "Creating Kosten files from Bestand structure..."
echo ""

# Create Kosten data by copying Bestand data in all scenarios
for scenario in {1..8}; do
  if [ ! -d "$scenario" ]; then
    echo "⚠ Scenario $scenario directory does not exist, skipping..."
    continue
  fi

  for file in "$scenario"/Bestand*.json; do
    if [ -f "$file" ]; then
      kostenFile="${file/Bestand/Kosten}"

      # Copy and replace "Bestand" key with "Kosten" in JSON
      sed 's/"Bestand":/"Kosten":/g' "$file" > "$kostenFile"
      echo "✓ Created: $(basename "$kostenFile")"
    fi
  done
done

echo ""
echo "========================================="
echo "✓ Placeholder data setup complete!"
echo "========================================="
echo ""
echo "Created:"
echo "  - Scenarios 3-8 (copied from scenario 1)"
echo "  - Kosten files for all scenarios 1-8"
echo ""
echo "⚠  WARNING: This is placeholder data for development!"
echo "   Replace with final data before production launch."
