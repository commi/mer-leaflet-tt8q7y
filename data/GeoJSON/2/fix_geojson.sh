#!/bin/bash

# Überprüfen, ob ogr2ogr installiert ist
if ! command -v ogr2ogr >/dev/null 2>&1; then
  echo "ogr2ogr ist nicht installiert. Bitte installieren Sie die GDAL-Bibliothek:"
  echo "Für Ubuntu/Debian:"
  echo "  sudo apt-get install gdal-bin"
  echo "Für Fedora:"
  echo "  sudo dnf install gdal"
  echo "Für CentOS/RHEL:"
  echo "  sudo yum install gdal"
  exit 1
fi

# Überprüfen, ob ein Dateipfad als Parameter angegeben wurde
if [ -z "$1" ]; then
  echo "Bitte geben Sie den Pfad zur GeoJSON-Datei oder zum Ordner als Parameter an."
  exit 1
fi

# Eingabe (Datei oder Ordner)
input_path="$1"

# Zielprojektion (EPSG:25832)
target_projection="EPSG:25832"

# Genauigkeit der Koordinaten in Metern (1 Meter)
coordinate_precision=0

# Datei überschreiben oder neue Datei erstellen
overwrite=false
if [ "$2" == "--overwrite" ]; then
  overwrite=true
fi

# Funktion zum Konvertieren einer einzelnen Datei
convert_file() {
  local input_file="$1"
  local output_file

  if [ "$overwrite" = true ]; then
    output_file="$input_file"
  else
    output_file="${input_file%.geojson}_converted.geojson"
  fi

  # Projektion ändern und Genauigkeit der Koordinaten reduzieren
  ogr2ogr -f "GeoJSON" -t_srs "$target_projection" /vsistdout/ "$input_file" | \
    ogr2ogr -f "GeoJSON" -lco COORDINATE_PRECISION=$coordinate_precision "$output_file" /vsistdin/
    
  # normalize value property  
  sed -E -i 's/"([A-Za-z]+_[A-Za-z]+)"/"value"/g' "$output_file"  

  echo "Die Projektion von $input_file wurde geändert und die Genauigkeit der Koordinaten wurde reduziert. Die neue Datei ist $output_file."
}

# Überprüfen, ob der Eingabepfad ein Ordner ist
if [ -d "$input_path" ]; then
  # Wenn --folder gesetzt ist, konvertiere alle GeoJSON-Dateien im Ordner
  for file in "$input_path"/*.geojson; do
    [ -e "$file" ] || continue
    # Starte die convert_file-Funktion in einer Subshell im Hintergrund
    (convert_file "$file") &
  done
  # Warte auf alle Subshells, bevor das Skript beendet wird
  wait
else
  # Andernfalls konvertiere nur die angegebene Datei
  convert_file "$input_path"
fi
