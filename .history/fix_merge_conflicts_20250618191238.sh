#!/bin/bash

echo "Fixing merge conflicts by accepting incoming changes..."

# Find all files with merge conflicts
files_with_conflicts=$(grep -rl "<<<<<<< HEAD" src/ --include="*.tsx" --include="*.ts" --include="*.json" --include="*.css")

if [ -z "$files_with_conflicts" ]; then
    echo "No merge conflicts found!"
    exit 0
fi

echo "Found merge conflicts in the following files:"
echo "$files_with_conflicts"
echo ""

# Process each file
for file in $files_with_conflicts; do
    echo "Processing: $file"
    
    # Create a temporary file
    temp_file="${file}.temp"
    
    # Use awk to process the file and keep the incoming changes (after =======)
    awk '
        /^<<<<<<< HEAD/ { in_conflict = 1; next }
        /^\|\|\|\|\|\|\| / { if (in_conflict) { in_middle = 1; next } }
        /^=======/ { if (in_conflict) { in_middle = 0; in_incoming = 1; next } }
        /^>>>>>>> / { if (in_conflict) { in_conflict = 0; in_incoming = 0; next } }
        { if (!in_conflict || in_incoming) print }
    ' "$file" > "$temp_file"
    
    # Replace the original file
    mv "$temp_file" "$file"
    echo "Fixed: $file"
done

echo ""
echo "All merge conflicts have been resolved!"
echo "Please review the changes before committing." 