# Visionati Cache Implementation

## Overview

A persistent file-based caching system has been implemented for the Visionati API integration to avoid reprocessing images that have already been analyzed. This saves API credits and reduces processing time for subsequent conversions.

## Features

### 1. Persistent JSON Cache

- Stores API results in `.visionati-cache.json` file
- Survives across converter runs
- Automatically excluded from git

### 2. Intelligent Cache Key Generation

- Cache keys include: image URL + backend + language + prompt
- Automatic cache invalidation when configuration changes
- Ensures correct results for different AI backends or prompts

### 3. TTL (Time To Live) Support

- Default: 30 days
- Configurable via CLI or config
- Automatic pruning of expired entries

### 4. Cache Statistics

- Track cache hits/misses
- Monitor credits saved
- View cache size and entry count

### 5. CLI Management Commands

```bash
# Show cache statistics
bun run scripts/xml-converter.ts --cache-stats

# Clear cache
bun run scripts/xml-converter.ts --clear-cache

# Disable cache for current run
bun run scripts/xml-converter.ts -i export.xml --generate-alt-texts --visionati-cache-disable

# Custom cache file and TTL
bun run scripts/xml-converter.ts -i export.xml --generate-alt-texts \
  --visionati-cache-file my-cache.json --visionati-cache-ttl 60
```

## Configuration Options

Added to `config.ts` and `types.ts`:

- `visionatiCacheEnabled` (default: true)
- `visionatiCacheFile` (default: '.visionati-cache.json')
- `visionatiCacheTTL` (default: 30 days)

## Implementation Details

### Files Modified:

1. **src/cache.js** - New cache service module
2. **src/visionati.js** - Updated to use persistent cache
3. **src/image-processor.js** - Initialize cache and report stats
4. **src/config.ts** - Added cache configuration options
5. **src/types.ts** - Added TypeScript types for cache config
6. **scripts/xml-converter.ts** - Added CLI cache management options
7. **.gitignore** - Exclude cache files from git

### Cache Structure:

```json
{
  "version": "1.0",
  "configHash": "sha256-hash-of-config",
  "entries": {
    "https://example.com/image.jpg": {
      "altText": "German alt text",
      "filename": "seo-optimized-filename",
      "creditsUsed": 1,
      "timestamp": "2025-01-24T10:00:00Z",
      "configHash": "sha256-hash"
    }
  }
}
```

## Usage Example

When processing WordPress XML with AI enhancement:

```bash
# First run - processes all images
bun run scripts/xml-converter.ts -i export.xml --generate-alt-texts
# Output: "Credits used: 50"

# Second run - uses cached results
bun run scripts/xml-converter.ts -i export.xml --generate-alt-texts
# Output: "Credits used: 0, Cache hit rate: 100%"
```

## Benefits

- Saves API credits by avoiding redundant calls
- Faster processing on subsequent runs
- Maintains consistency across runs
- Automatic cache management (TTL, pruning)
- Full visibility through statistics and CLI commands
