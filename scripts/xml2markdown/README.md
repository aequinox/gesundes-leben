# WordPress XML to MDX Converter for Healthy Life Blog

A modern, TypeScript-enabled converter that transforms WordPress XML exports into Astro-compatible MDX files for the Healthy Life blog. Features comprehensive error handling, logging integration, and optimized performance for Bun runtime.

## ✨ Features

- **🔄 WordPress XML Parsing**: Converts WordPress export files to MDX format
- **🎯 Astro Integration**: Generates MDX files compatible with Astro content collections
- **🖼️ Image Processing**: Downloads and processes attached and embedded images
- **📁 Flexible Organization**: Supports year/month folders and custom naming schemes
- **🔧 TypeScript Support**: Full type safety with comprehensive interfaces
- **📊 Advanced Logging**: Integrated with project's centralized logging system
- **⚡ Bun Optimized**: Optimized for Bun runtime with modern JavaScript features
- **🛡️ Error Handling**: Robust error handling with detailed context
- **🌐 German Localization**: Supports German content and categories

## 🚀 Installation

The converter is included in the main Healthy Life project and requires no separate installation.

```bash
# Install project dependencies
bun install
```

## 📖 Usage

### Quick Start

```bash
# Basic conversion
bun run xml-convert -i export.xml

# Convert with year/month organization
bun run xml-convert -i export.xml --year-folders --month-folders

# Dry run to preview changes
bun run xml-convert -i export.xml --dry-run
```

### Command Line Options

| Option                   | Description                                           | Default           |
| ------------------------ | ----------------------------------------------------- | ----------------- |
| `-i, --input <file>`     | Input WordPress XML file path                         | Required          |
| `-o, --output <dir>`     | Output directory path                                 | `./src/data/blog` |
| `--year-folders`         | Organize posts into year folders                      | `false`           |
| `--month-folders`        | Organize into month folders (requires --year-folders) | `false`           |
| `--post-folders`         | Create individual folders for each post               | `false`           |
| `--prefix-date`          | Add date prefix to filenames/folders                  | `false`           |
| `--save-attached-images` | Download attached images                              | `true`            |
| `--save-scraped-images`  | Download images from post content                     | `true`            |
| `--include-other-types`  | Include custom post types and pages                   | `false`           |
| `--dry-run`              | Preview without making changes                        | `false`           |
| `-v, --verbose`          | Enable verbose logging                                | `false`           |
| `-q, --quiet`            | Suppress non-error output                             | `false`           |

### Advanced Examples

```bash
# Full conversion with organization and images
bun run xml-convert \
  -i wordpress-export.xml \
  -o ./src/data/blog \
  --year-folders \
  --month-folders \
  --prefix-date \
  --post-folders

# Quick conversion without images
bun run xml-convert \
  -i export.xml \
  --no-save-attached-images \
  --no-save-scraped-images

# Include all content types with verbose logging
bun run xml-convert \
  -i export.xml \
  --include-other-types \
  --verbose
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

| Field         | Type    | Description                                           |
| ------------- | ------- | ----------------------------------------------------- |
| `id`          | string  | WordPress post ID                                     |
| `title`       | string  | Post title                                            |
| `author`      | string  | Author identifier (defaults to "healthy-life-author") |
| `pubDatetime` | string  | Publication date in ISO format                        |
| `modDatetime` | string  | Last modified date in ISO format                      |
| `description` | string  | Post excerpt or generated description                 |
| `keywords`    | array   | Extracted keywords (max 10)                           |
| `categories`  | array   | Mapped German categories                              |
| `group`       | string  | Classification: "pro", "kontra", or "fragezeiten"     |
| `tags`        | array   | WordPress tags                                        |
| `heroImage`   | object  | Featured image with `src` and `alt`                   |
| `draft`       | boolean | Draft status                                          |
| `featured`    | boolean | Featured status                                       |

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
  <img
    src="images/Teabag-Plastic-Header.jpg"
    alt="Eine weiße Tasse mit einem Totenkopfsymbol..."
  />
  <figcaption>Bild von KI-generiert</figcaption>
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

| WordPress Class | Position Output     | Description          |
| --------------- | ------------------- | -------------------- |
| `alignright`    | `position="right"`  | Right-aligned image  |
| `alignleft`     | `position="left"`   | Left-aligned image   |
| `aligncenter`   | `position="center"` | Center-aligned image |
| Custom classes  | `position="center"` | Default fallback     |

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
