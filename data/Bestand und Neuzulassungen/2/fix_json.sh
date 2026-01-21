#!/bin/bash

# apt install jq
# npm install -g json5

# Find JSON files in the current directory and its subdirectories
find . -type f -name "*.json" | while read -r json_file; do
    # Check if the file has a syntax error using jq
    if jq --exit-status '.' "${json_file}" >/dev/null 2>&1; then
        echo "No syntax errors found in ${json_file}"
    else
        echo "Attempting to fix syntax error in ${json_file} using json5"
        # Fix the JSON file and create a temporary file
        json5 -c "${json_file}" -o "${json_file}.tmp" 2>/dev/null

        # Check if the temporary file is not empty and valid JSON
        if [[ -s "${json_file}.tmp" ]] && jq --exit-status '.' "${json_file}.tmp" >/dev/null 2>&1; then
            # Pretty-print the JSON file using jq and replace the original file
            jq '.' "${json_file}.tmp" > "${json_file}"
            rm "${json_file}.tmp"
            echo "Syntax error fixed in ${json_file}"
        else
            # Discard the temporary file and report an error
            rm "${json_file}.tmp"
            echo "Failed to fix syntax error in ${json_file}. You may need to fix it manually."
        fi
    fi
done
