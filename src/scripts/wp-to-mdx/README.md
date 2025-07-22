# WordPress to Astro MDX Converter

A comprehensive tool to convert WordPress XML exports into Astro MDX blog posts that match your existing German health blog format.

## Overview

This converter transforms WordPress XML exports into fully compatible Astro MDX files with:

- ✅ Perfect schema compliance with your `content.config.ts`
- ✅ Automatic image download and organization
- ✅ German content optimization with TOC generation
- ✅ Smart category and author mapping
- ✅ Complete validation and error reporting

## Quick Start

### 1. Export from WordPress

1. Go to your WordPress admin panel
2. Navigate to **Tools** → **Export**
3. Select **Posts** and click **Download Export File**
4. Save the XML file (e.g., `export.xml`)

### 2. Run the Converter

```bash
# Basic conversion
bun run wp-convert -i path/to/export.xml

# Dry run (preview without creating files)
bun run wp-convert -i path/to/export.xml --dry-run

# Skip image downloads (faster)
bun run wp-convert -i path/to/export.xml --no-download-images
```

### 3. Review Results

The converter will create:

```
src/data/blog/
├── YYYY-MM-DD-post-slug/
│   ├── index.mdx           # Blog post with German content
│   └── images/             # Downloaded WordPress images
│       ├── image1.jpg
│       └── image2.png
```

## Command Options

```bash
bun run wp-convert [options]

Required:
  -i, --input <file>         WordPress XML export file

Options:
  -o, --output <dir>         Output directory (default: "src/data/blog")
  --dry-run                  Preview conversion without writing files
  --skip-drafts              Skip draft posts (default: true)
  --no-download-images       Skip downloading images
  --no-generate-toc          Skip generating table of contents
  --filter-date-from <date>  Only convert posts from date (YYYY-MM-DD)
  --filter-date-to <date>    Only convert posts until date (YYYY-MM-DD)
  --author-mapping <file>    JSON file with custom author mapping
  --category-mapping <file>  JSON file with custom category mapping
  -h, --help                 Display help
```

## Examples

### Convert Recent Posts Only

```bash
bun run wp-convert -i export.xml --filter-date-from 2024-01-01
```

### Preview Conversion

```bash
bun run wp-convert -i export.xml --dry-run
```

### Custom Output Directory

```bash
bun run wp-convert -i export.xml -o custom/blog/directory
```

### Skip Images (Fast Preview)

```bash
bun run wp-convert -i export.xml --no-download-images --dry-run
```

## Content Mapping

### Authors

WordPress authors are automatically mapped to your existing authors:

- `KRenner`, `Kai`, `admin` → `kai-renner`
- `Sandra` → `sandra-pfeiffer`

### Categories

WordPress categories are intelligently mapped to your health blog categories:

- `ernährung` → `["Ernährung"]`
- `immunsystem`, `gesundheit` → `["Immunsystem"]`
- `mikronährstoffe`, `vitamine` → `["Mikronährstoffe"]`
- `wissenschaftliches`, `studien` → `["Wissenschaftliches"]`
- And many more...

### Group Assignment

Posts are automatically assigned to groups based on content:

- **`kontra`** - Posts about dangers, risks, problems (e.g., "Gefahren von...")
- **`pro`** - Posts about benefits, advantages, recommendations
- **`fragezeichen`** - Posts with questions, uncertainty, exploration

## Generated Frontmatter

Each converted post includes complete frontmatter:

```yaml
---
id: 15641
title: 7 grundlegende Gefahren von Mikroplastik für deine Gesundheit
author: kai-renner
pubDatetime: 2025-03-28T13:00:16.000Z
modDatetime: 2025-04-01T11:39:41.000Z
description: "Mikroplastik als Gesundheitsgefährdung – was du wissen solltest..."
keywords:
  - Mikroplastik
  - BPA
  - Gesundheit
categories:
  - Organsysteme
  - Wissenschaftliches
group: kontra
tags:
  - Mikroplastik
  - BPA
heroImage:
  src: ./images/featured-image.jpg
  alt: Article title
draft: false
references: []
---
```

## Validation & Quality

The converter includes comprehensive validation:

### ✅ Schema Compliance

- Validates against your `content.config.ts`
- Ensures all required fields are present
- Checks data types and constraints

### ✅ Content Quality

- Verifies image references exist
- Checks for valid category assignments
- Validates German content formatting
- Ensures proper MDX syntax

### ✅ File Structure

- Creates proper folder naming (`YYYY-MM-DD-slug`)
- Organizes images in `./images/` subdirectories
- Updates all image paths to local references

## Troubleshooting

### Common Issues

**Build fails with image references:**

```bash
# The converter updates image paths automatically, but if you see errors:
# 1. Check that images were downloaded to ./images/ folder
# 2. Verify image filenames match content references
# 3. Run conversion again if images failed to download
```

**Posts not appearing:**

```bash
# Check if posts were marked as drafts
bun run wp-convert -i export.xml --dry-run
# Look for "draft: true" in output
```

**Category validation errors:**

```bash
# Posts need valid categories from your CATEGORIES array
# Invalid categories are automatically mapped to "Wissenswertes"
# Check the conversion log for mapping details
```

### Debug Mode

```bash
# Enable debug logging
DEBUG=1 bun run wp-convert -i export.xml
```

## Advanced Configuration

### Custom Author Mapping

Create `authors.json`:

```json
{
  "wp_username": "astro-author-id",
  "john_doe": "kai-renner"
}
```

Use with:

```bash
bun run wp-convert -i export.xml --author-mapping authors.json
```

### Custom Category Mapping

Create `categories.json`:

```json
{
  "wordpress-category": ["Astro", "Category"],
  "nutrition": ["Ernährung", "Mikronährstoffe"]
}
```

Use with:

```bash
bun run wp-convert -i export.xml --category-mapping categories.json
```

## Integration with Existing Workflow

### After Conversion

1. **Review generated posts** - Check content formatting and images
2. **Run build test** - `bun run build` to verify everything works
3. **Update references** - Add scientific references to `references.json` if needed
4. **Test in browser** - `bun run dev` to preview converted posts

### Backup Strategy

The converter automatically creates backups when posts already exist:

```
src/data/blog/
├── existing-post/                    # Your original post
└── existing-post-backup-timestamp/   # Automatic backup
```

## Technical Details

### Architecture

The converter has been completely redesigned with modern software engineering principles:

#### Core Components

- **Parser** (`parser.ts`) - WordPress XML processing with enhanced type safety
- **Translator** (`translator.ts`) - HTML→MDX with extensible processor pipeline
- **Mapper** (`mapper.ts`) - WordPress→Astro schema transformation with validation
- **Writer** (`writer.ts`) - File creation with dependency injection for image downloading
- **Validator** (`validator.ts`) - Comprehensive quality assurance and validation

#### New Improvements (v2.0)

- **🏗️ SOLID Architecture** - Single responsibility, dependency injection, extensible design
- **⚡ Performance Optimization** - Concurrent processing, caching, retry mechanisms
- **🔒 Security First** - Input sanitization, content validation, safe file handling
- **🧩 Plugin System** - Extensible content processors for custom transformations
- **📊 Enhanced Error Handling** - Detailed error collection, categorization, and reporting
- **🎯 Type Safety** - Replaced all `any` types with proper TypeScript interfaces
- **⚙️ Configuration Management** - Centralized constants and configurable thresholds

#### Processing Pipeline

1. **XML Parsing** - Secure parsing with content sanitization
2. **Content Processing** - Extensible pipeline with multiple processors:
   - Security sanitization processor
   - WordPress shortcode handler
   - German content optimizer
   - Image path rewriter
   - Table of contents generator
3. **Schema Mapping** - Intelligent WordPress to Astro conversion
4. **Concurrent Processing** - Batch processing for improved performance
5. **Validation** - Multi-layered validation with detailed reporting

### Dependencies

- `xml2js` - WordPress XML parsing
- `turndown` + `turndown-plugin-gfm` - HTML to Markdown conversion
- `axios` - Image downloading with retry logic
- `commander` - CLI interface
- `uuid` - Unique ID generation
- `zod` - Schema validation

## Support

### Getting Help

If you encounter issues:

1. Run with `--dry-run` to preview without changes
2. Check the conversion summary for specific errors
3. Enable debug mode: `DEBUG=1 bun run wp-convert ...`
4. Review generated files in dry-run mode first

### Limitations

- WordPress custom blocks may require manual review
- Complex shortcodes are removed (can be re-added manually)
- Very large image files may timeout during download
- WordPress-specific plugins content may need adjustment

---

**Happy converting!** 🚀

This tool will save hours of manual migration work and ensure your WordPress content integrates perfectly with your Astro health blog.
