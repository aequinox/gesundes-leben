#!/bin/bash

# Script to run XML converter with proper options for AI-enhanced images and correct folder structure

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Running XML to MDX Converter with AI Enhancement${NC}"
echo -e "${YELLOW}This will create proper folder structure and generate German alt texts${NC}"
echo

# Check if XML file is provided
if [ -z "$1" ]; then
    echo -e "${RED}❌ Error: Please provide the XML file path as an argument${NC}"
    echo "Usage: ./convert-with-ai.sh path/to/wordpress-export.xml"
    exit 1
fi

# Check if VISIONATI_API_KEY is set
if [ -z "$VISIONATI_API_KEY" ]; then
    echo -e "${YELLOW}⚠️  Warning: VISIONATI_API_KEY not set. AI alt text generation will be skipped.${NC}"
    echo "Set it with: export VISIONATI_API_KEY='your-api-key'"
    echo
fi

# Run the converter with all necessary options
echo -e "${GREEN}Running converter...${NC}"
bun run scripts/xml-converter.ts \
    --input "$1" \
    --output ./src/data/blog \
    --post-folders \
    --prefix-date \
    --save-attached-images \
    --save-scraped-images \
    --generate-alt-texts \
    --visionati-backend claude \
    --visionati-language de \
    --verbose

echo -e "${GREEN}✅ Conversion complete!${NC}"