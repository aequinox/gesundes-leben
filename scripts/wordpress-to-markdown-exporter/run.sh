#!/bin/bash

# WordPress to Markdown Exporter Run Script

# Print colored messages
print_info() {
  echo -e "\033[1;34m[INFO]\033[0m $1"
}

print_success() {
  echo -e "\033[1;32m[SUCCESS]\033[0m $1"
}

print_error() {
  echo -e "\033[1;31m[ERROR]\033[0m $1"
}

# Check if npm is installed
if ! command -v npm &> /dev/null; then
  print_error "npm is not installed. Please install Node.js and npm first."
  exit 1
fi

# Check if the project is built
if [ ! -d "dist" ]; then
  print_info "Building the project..."
  npm run build
  
  if [ $? -ne 0 ]; then
    print_error "Failed to build the project."
    exit 1
  fi
fi

# Set default values
INPUT_FILE="../../gesundheitintbingen.WordPress.2025-04-01.xml"
OUTPUT_DIR="../../src/content/blog"
YEAR_FOLDERS=false
MONTH_FOLDERS=false
POST_FOLDERS=true
PREFIX_DATE=false
SAVE_ATTACHED_IMAGES=true
SAVE_SCRAPED_IMAGES=true
INCLUDE_OTHER_TYPES=false
STRICT_SSL=true

# Run the exporter
print_info "Running WordPress to Markdown Exporter..."
print_info "Input file: $INPUT_FILE"
print_info "Output directory: $OUTPUT_DIR"

node dist/index.js \
  --input "$INPUT_FILE" \
  --output "$OUTPUT_DIR" \
  $([ "$YEAR_FOLDERS" = true ] && echo "--year-folders") \
  $([ "$MONTH_FOLDERS" = true ] && echo "--month-folders") \
  $([ "$POST_FOLDERS" = true ] && echo "--post-folders") \
  $([ "$PREFIX_DATE" = true ] && echo "--prefix-date") \
  $([ "$SAVE_ATTACHED_IMAGES" = true ] && echo "--save-attached-images") \
  $([ "$SAVE_SCRAPED_IMAGES" = true ] && echo "--save-scraped-images") \
  $([ "$INCLUDE_OTHER_TYPES" = true ] && echo "--include-other-types") \
  $([ "$STRICT_SSL" = true ] && echo "--strict-ssl") \
  --no-wizard

if [ $? -ne 0 ]; then
  print_error "Failed to run the exporter."
  exit 1
fi

print_success "WordPress to Markdown conversion complete!"
print_info "Output files located at: $OUTPUT_DIR"
