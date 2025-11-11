# Quick Start Guide

Get up and running with wp2mdx in under 2 minutes.

## Installation

### Option 1: Build from Source (Recommended)

```bash
cd scripts/wp2mdx
go build -o wp2mdx ./cmd/wp2mdx
```

### Option 2: Install Globally

```bash
cd scripts/wp2mdx
go install ./cmd/wp2mdx
```

Then `wp2mdx` will be available system-wide.

## Basic Usage

### 1. Convert a WordPress Export

```bash
./wp2mdx convert -i export.xml -o ../../src/data/blog
```

This will:
- Parse the WordPress XML file
- Convert all posts to MDX format
- Download images
- Create organized folder structure
- Generate proper frontmatter

### 2. Dry Run (Preview Without Writing)

```bash
./wp2mdx convert -i export.xml --dry-run
```

See what would be converted without actually writing files.

### 3. Validate XML File

```bash
./wp2mdx validate -i export.xml
```

Check if your WordPress export is valid and see statistics.

### 4. List All Posts

```bash
./wp2mdx list -i export.xml
```

See all posts that would be converted.

## Common Workflows

### Convert with Custom Organization

```bash
./wp2mdx convert \
  -i export.xml \
  -o ../../src/data/blog \
  --year-folders \
  --month-folders \
  --post-folders \
  --prefix-date
```

This creates structure like:
```
src/data/blog/
└── 2024/
    └── 03/
        └── 2024-03-28-post-title/
            ├── index.mdx
            └── images/
                └── hero.jpg
```

### Convert Without Images

```bash
./wp2mdx convert \
  -i export.xml \
  -o ../../src/data/blog \
  --download-images=false
```

Useful for testing or when images are already downloaded.

### Fast Conversion (High Concurrency)

```bash
./wp2mdx convert \
  -i export.xml \
  -o ../../src/data/blog \
  --concurrency 20
```

Use more workers for faster processing on large exports.

### Include All Content Types

```bash
./wp2mdx convert \
  -i export.xml \
  -o ../../src/data/blog \
  --include-drafts \
  --include-pages \
  --include-types
```

Convert drafts, pages, and custom post types in addition to published posts.

## Advanced Usage

### Custom Author Mapping

Create `authors.json`:
```json
{
  "john": "john-doe",
  "jane": "jane-smith",
  "admin": "site-admin"
}
```

Use it:
```bash
./wp2mdx convert \
  -i export.xml \
  -o ../../src/data/blog \
  --author-mapping authors.json
```

### Custom Category Mapping

Create `categories.json`:
```json
{
  "recipes": "Ernährung",
  "workouts": "Fitness",
  "meditation": "Lifestyle & Psyche"
}
```

Use it:
```bash
./wp2mdx convert \
  -i export.xml \
  -o ../../src/data/blog \
  --category-mapping categories.json
```

### Specify Image Base URL

For relative image URLs in your WordPress export:

```bash
./wp2mdx convert \
  -i export.xml \
  -o ../../src/data/blog \
  --image-base-url https://old-site.com
```

## Output Structure

### With Default Settings

```
output/
└── 2024-03-28-post-title/
    ├── index.mdx
    └── images/
        ├── hero.jpg
        └── content-image.png
```

### MDX File Format

```markdown
---
id: "12345"
title: "Post Title"
author: "author-slug"
pubDatetime: "2024-03-28T13:00:16Z"
modDatetime: "2024-03-28T13:00:16Z"
description: "Post excerpt..."
keywords:
  - keyword1
  - keyword2
categories:
  - Ernährung
  - Gesundheit
group: "pro"
tags:
  - tag1
  - tag2
heroImage:
  src: ./images/hero.jpg
  alt: "Hero image description"
draft: false
featured: false
---

import Image from "@/components/elements/Image.astro";
import hero from "./images/hero.jpg";
import contentImage from "./images/content-image.png";

## Your Content

<Image
  src={hero}
  alt="Hero image description"
  position="center"
/>

More content here...
```

## Troubleshooting

### "Input file does not exist"

Make sure the path to your XML file is correct. Use absolute path or relative to current directory.

### "Images failed to download"

Check:
1. Image URLs are accessible
2. You have internet connection
3. Use `--image-base-url` if images have relative paths
4. Check `--timeout` setting (default: 30s)

### "File already exists"

Use `--force` to overwrite existing files:

```bash
./wp2mdx convert -i export.xml -o output --force
```

### Memory Issues with Large Files

Increase concurrency or process in batches:

```bash
./wp2mdx convert -i export.xml --concurrency 3
```

## Tips & Best Practices

1. **Always validate first**: Run `validate` before `convert`
2. **Use dry-run**: Test with `--dry-run` before actual conversion
3. **Start small**: Test with a subset of posts first
4. **Check output**: Review a few converted posts manually
5. **Adjust concurrency**: Balance between speed and resource usage
6. **Keep originals**: Never delete your WordPress export until conversion is verified

## Getting Help

```bash
# General help
./wp2mdx --help

# Command-specific help
./wp2mdx convert --help
./wp2mdx validate --help
./wp2mdx list --help

# Show version
./wp2mdx --version

# Show category mapping
./wp2mdx categories
```

## Next Steps

1. Review `README.md` for complete documentation
2. Check `COMPARISON.md` for TypeScript vs Go comparison
3. Customize category mapping for your site
4. Set up author mapping if needed
5. Integrate into your build process

## Example: Complete Conversion Workflow

```bash
# 1. Validate the export
./wp2mdx validate -i wordpress-export.xml

# 2. List posts to preview
./wp2mdx list -i wordpress-export.xml | head -20

# 3. Dry run to test
./wp2mdx convert \
  -i wordpress-export.xml \
  -o ../../src/data/blog \
  --dry-run

# 4. Actual conversion
./wp2mdx convert \
  -i wordpress-export.xml \
  -o ../../src/data/blog \
  --post-folders \
  --prefix-date \
  --concurrency 10

# 5. Check results
ls -la ../../src/data/blog/
```

## Integration with Build Process

Add to your `package.json`:

```json
{
  "scripts": {
    "import-posts": "cd scripts/wp2mdx && ./wp2mdx convert -i $INPUT -o ../../src/data/blog"
  }
}
```

Use it:
```bash
INPUT=export.xml npm run import-posts
```

---

For more details, see [README.md](./README.md) and [COMPARISON.md](./COMPARISON.md).
