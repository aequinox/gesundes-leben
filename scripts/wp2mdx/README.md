# WordPress XML to MDX Converter (Go)

A high-performance, modular Go application for converting WordPress XML exports to MDX files for the Gesundes Leben blog.

## 🚀 Features

- **Fast & Concurrent**: Parallel processing of posts and images using Go's goroutines
- **Modular Architecture**: Clean separation of concerns with well-defined packages
- **Comprehensive CLI**: Extensive command-line flags for maximum configurability
- **Image Processing**: Downloads and processes images with proper naming and imports
- **HTML to Markdown**: High-quality conversion preserving structure and semantics
- **Frontmatter Generation**: Complete metadata extraction and mapping
- **Category Mapping**: Intelligent WordPress to German category translation
- **Progress Reporting**: Real-time progress bars and detailed logging
- **Error Handling**: Robust error handling with detailed context

## 📦 Installation

```bash
cd scripts/wp2mdx
go build -o wp2mdx ./cmd/wp2mdx
```

## 🎯 Usage

### Basic Conversion

```bash
./wp2mdx convert -i export.xml -o ../../src/data/blog
```

### With Options

```bash
./wp2mdx convert \
  -i export.xml \
  -o ../../src/data/blog \
  --year-folders \
  --month-folders \
  --prefix-date \
  --post-folders \
  --concurrency 10 \
  --dry-run
```

### Available Commands

- `convert` - Convert WordPress XML to MDX files
- `validate` - Validate XML file structure
- `list` - List posts in XML file
- `categories` - Show category mapping

## ⚙️ Configuration Flags

### Input/Output
- `-i, --input` - Input WordPress XML file (required)
- `-o, --output` - Output directory (default: "./output")

### Organization
- `--year-folders` - Organize posts into year folders (YYYY/)
- `--month-folders` - Organize into month folders (YYYY/MM/)
- `--post-folders` - Create individual folder per post
- `--prefix-date` - Prefix filenames with date (YYYY-MM-DD-)

### Image Processing
- `--download-images` - Download images (default: true)
- `--download-attached` - Download attached images (default: true)
- `--download-scraped` - Download content images (default: true)
- `--image-quality` - Image quality for processing (1-100)
- `--max-image-width` - Maximum image width in pixels

### Processing
- `--concurrency` - Number of concurrent workers (default: 5)
- `--include-drafts` - Include draft posts (default: false)
- `--include-pages` - Include pages (default: false)
- `--include-types` - Include custom post types (default: false)

### Output Control
- `--dry-run` - Preview without writing files
- `--verbose` - Verbose logging
- `--quiet` - Suppress non-error output
- `--force` - Overwrite existing files

### Advanced
- `--author-mapping` - JSON file for author ID mapping
- `--category-mapping` - JSON file for custom category mapping
- `--image-base-url` - Base URL for image downloads
- `--timeout` - HTTP timeout for downloads (seconds)

## 📁 Project Structure

```
wp2mdx/
├── cmd/
│   └── wp2mdx/
│       └── main.go          # CLI entry point
├── pkg/
│   ├── config/              # Configuration management
│   ├── parser/              # XML parsing
│   ├── converter/           # HTML to Markdown
│   ├── frontmatter/         # Frontmatter generation
│   ├── images/              # Image processing
│   ├── writer/              # File writing
│   └── models/              # Data models
├── go.mod
└── README.md
```

## 🔧 Development

### Run Tests

```bash
go test ./...
```

### Build

```bash
go build -o wp2mdx ./cmd/wp2mdx
```

### Install Locally

```bash
go install ./cmd/wp2mdx
```

## 📊 Performance

The Go implementation is significantly faster than the TypeScript version:
- ~10x faster XML parsing
- Concurrent image downloads (configurable workers)
- Efficient memory usage with streaming
- Progress reporting for long-running operations

## 🎨 Example Output

```markdown
---
id: "12345"
title: "Das Schlafhormon Melatonin"
author: "sandra-pfeiffer"
pubDatetime: "2022-02-19T21:32:41.000Z"
modDatetime: "2022-02-19T21:32:41.000Z"
description: "Was hat Melatonin mit dem Schlaf zu tun..."
keywords:
  - Hormone
  - Schlaf
categories:
  - Organsysteme
group: "pro"
tags:
  - Hormone
heroImage:
  src: ./images/hero.jpg
  alt: "Descriptive alt text"
draft: false
featured: false
---

import Image from "@/components/elements/Image.astro";
import hero from "./images/hero.jpg";

## Your content here...

<Image src={hero} alt="Description" position="center" />
```

## 📝 License

MIT License - Part of the Gesundes Leben project
