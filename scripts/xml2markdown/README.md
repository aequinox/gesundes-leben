# XML to Markdown Blog Converter

A WordPress XML export converter adapted for the Healthy Life blog. Converts WordPress posts into Astro-compatible MDX files with proper YAML frontmatter.

## Features

- **Complete ES Module Support**: Modern JavaScript with import/export
- **German Content Localization**: Category mapping and language-specific handling
- **Blog Schema Compliance**: Generates frontmatter matching `src/content.config.ts`
- **Intelligent Content Processing**: Extracts keywords, determines group classification
- **Image Management**: Downloads and organizes post images
- **Robust Date Handling**: Multiple date format parsing with fallbacks
- **Astro Image Components**: Converts HTML `<figure>` elements to Astro `<Image>` components with imports

## Prerequisites

- Bun runtime
- WordPress XML export file(s) in the `xml/` directory

## Installation

```bash
cd scripts/xml2markdown
bun install
```

## Quick Start

Place your WordPress XML export files in the `xml/` directory, then run:

```bash
bun run index.js
```

The converter will process all XML files and generate MDX files in `../../src/data/blog/`.

## Usage

### Basic Conversion

Convert all XML files in the `xml/` directory:

```bash
bun run index.js
```

### Convert Specific File

```bash
bun run index.js --input xml/your-export-file.xml
```

### Configuration Options

The converter accepts several command-line options:

```bash
# Include all post types (not just 'post')
bun run index.js --other-types

# Download attached images
bun run index.js --save-attached-images

# Download images from post content
bun run index.js --save-scraped-images

# Organize posts in year folders
bun run index.js --year-folders

# Organize posts in month folders (requires year-folders)
bun run index.js --month-folders

# Create individual folders for each post
bun run index.js --post-folders

# Add date prefix to filenames
bun run index.js --prefix-date

# Custom output directory
bun run index.js --output ../custom-output-dir
```

### Full Example

```bash
bun run index.js \
  --input xml/gesundheitblog.xml \
  --output ../../src/data/blog \
  --save-attached-images \
  --year-folders \
  --prefix-date
```

## Output Structure

The converter generates MDX files with this structure:

```markdown
---
id: "12345"
title: "Effective Tips for Managing Anger"
author: "healthy-life-author"
pubDatetime: "2024-01-15T10:30:00.000Z"
modDatetime: "2024-01-16T08:20:00.000Z"
description: "Learn practical strategies for anger management..."
keywords: 
  - anger management
  - mental health
  - wellness
categories: 
  - Gesundheit
  - Wellness
group: "pro"
tags: 
  - tips
  - psychology
heroImage:
  src: "./images/anger-management-hero.jpg"
  alt: "Person practicing mindfulness meditation"
draft: false
featured: false
---

import Image from "@/components/elements/Image.astro";
import teabagPlasticHeader from "./images/Teabag-Plastic-Header.jpg";
import healthBenefits from "./images/health-benefits.png";

# Your converted blog content here...

<Image
  src={teabagPlasticHeader}
  alt="Eine weiße Tasse mit einem Totenkopfsymbol, die eine dampfende Flüssigkeit enthält"
  position="right"
/>

More content with properly converted images...
```

## Frontmatter Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | WordPress post ID |
| `title` | string | Post title |
| `author` | string | Author identifier (defaults to "healthy-life-author") |
| `pubDatetime` | string | Publication date in ISO format |
| `modDatetime` | string | Last modified date in ISO format |
| `description` | string | Post excerpt or generated description |
| `keywords` | array | Extracted keywords (max 10) |
| `categories` | array | Mapped German categories |
| `group` | string | Classification: "pro", "kontra", or "fragezeiten" |
| `tags` | array | WordPress tags |
| `heroImage` | object | Featured image with `src` and `alt` |
| `draft` | boolean | Draft status |
| `featured` | boolean | Featured status |

## Category Mapping

WordPress categories are intelligently mapped to German blog categories:

- Nutrition → Ernährung
- Health → Gesundheit  
- Wellness → Wellness
- Mental Health → Mentale Gesundheit
- Fitness → Fitness
- Immune System → Immunsystem
- Prevention → Prävention
- Natural Remedies → Naturheilkunde

## Group Classification

Posts are automatically classified into groups:

- **"pro"**: Positive health content, tips, benefits
- **"kontra"**: Warnings, risks, things to avoid
- **"fragezeiten"**: Q&A content, FAQ-style posts

## File Organization

```
src/data/blog/
├── 2024-01-15-effective-anger-management/
│   ├── index.mdx
│   └── images/
│       ├── hero-image.jpg
│       └── content-image.png
└── 2024-01-16-nutrition-basics.mdx
```

## Image Conversion

The converter automatically transforms HTML `<figure>` elements into Astro `<Image>` components:

### Input (WordPress HTML)
```html
<figure class="alignright">
  <img src="images/Teabag-Plastic-Header.jpg" alt="Eine weiße Tasse mit einem Totenkopfsymbol...">
  <figcaption>
    Bild von KI-generiert
  </figcaption>
</figure>
```

### Output (Astro MDX)
```javascript
---
// frontmatter here
---

import Image from "@/components/elements/Image.astro";
import teabagPlasticHeader from "./images/Teabag-Plastic-Header.jpg";

// In the content:
<Image
  src={teabagPlasticHeader}
  alt="Eine weiße Tasse mit einem Totenkopfsymbol..."
  position="right"
/>
```

### Position Detection

The converter automatically detects image positioning from WordPress CSS classes:

| WordPress Class | Position Output | Description |
|----------------|-----------------|-------------|
| `alignright` | `position="right"` | Right-aligned image |
| `alignleft` | `position="left"` | Left-aligned image |
| `aligncenter` | `position="center"` | Center-aligned image |
| Custom classes | `position="center"` | Default fallback |

### Variable Name Generation

Image filenames are converted to camelCase JavaScript variables:

- `Teabag-Plastic-Header.jpg` → `teabagPlasticHeader`
- `health-benefits-2024.png` → `healthBenefits2024`
- `vitamin-d3_supplement.webp` → `vitaminD3Supplement`

## Troubleshooting

### Common Issues

**Invalid DateTime errors**: The converter now handles multiple date formats and uses fallbacks. Check console warnings for problematic dates.

**Missing categories**: Unmapped WordPress categories will be logged. Add new mappings to `src/frontmatter/categories.js`.

**Image download failures**: Network issues or invalid URLs. Check console output for failed downloads.

**ES Module errors**: Ensure you're using Bun and all files are properly converted to ES modules.

### Debugging

Enable verbose logging by checking the console output during conversion. The converter provides detailed information about:

- Posts processed
- Categories mapped
- Images downloaded
- Date parsing issues
- File creation status

## Development

### Project Structure

```
scripts/xml2markdown/
├── src/
│   ├── frontmatter/        # Frontmatter field generators
│   │   ├── utils/          # Utility functions
│   │   ├── author.js
│   │   ├── categories.js
│   │   ├── keywords.js     # New: keyword extraction
│   │   ├── group.js        # New: group classification
│   │   ├── heroImage.js    # New: hero image handling
│   │   └── ...
│   ├── parser.js           # XML parsing logic
│   ├── writer.js          # File writing and formatting
│   ├── settings.js        # Configuration
│   └── translator.js      # HTML to Markdown conversion
├── index.js               # Main entry point
└── package.json           # ES module configuration
```

### Adding New Frontmatter Fields

1. Create a new generator in `src/frontmatter/`
2. Add the field to `frontmatter_fields` in `settings.js`
3. Import and add to the getters object in `parser.js`

### Customizing Category Mapping

Edit the `CATEGORY_MAP` in `src/frontmatter/categories.js` to add new WordPress to German category mappings.

## Version History

- **v2.0.0**: Complete ES module conversion, enhanced German localization
- **v1.0.0**: Initial adaptation from WordPress exporter
