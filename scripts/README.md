# WordPress to Markdown Exporter Scripts

This directory contains scripts for converting WordPress XML exports to Markdown files and fixing common issues with the generated content. The scripts are built using a service-oriented architecture that follows SOLID principles and DRY practices.

## Table of Contents

- [Overview](#overview)
- [Installation](#installation)
- [Scripts](#scripts)
  - [WordPress to Markdown Exporter](#wordpress-to-markdown-exporter)
  - [Fix Image Paths](#fix-image-paths)
  - [Fix Missing Hero Images](#fix-missing-hero-images)
- [Services](#services)
  - [ErrorService](#errorservice)
  - [LoggerService](#loggerservice)
  - [ConfigService](#configservice)
  - [ImageService](#imageservice)
  - [ContentService](#contentservice)
  - [FrontmatterService](#frontmatterservice)
- [Common Scenarios](#common-scenarios)
  - [Converting a WordPress Export](#converting-a-wordpress-export)
  - [Fixing Image Path Issues](#fixing-image-path-issues)
  - [Fixing Missing Hero Images](#fixing-missing-hero-images)
  - [Customizing the Conversion Process](#customizing-the-conversion-process)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

## Overview

The WordPress to Markdown Exporter is a tool for converting WordPress XML exports to Markdown files compatible with Astro content collections. It handles:

- Converting HTML to Markdown
- Downloading and organizing images
- Creating proper frontmatter
- Fixing common issues with the generated content

The tool is built using a service-oriented architecture that makes it easy to extend and maintain.

## Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/GIT-Astro.git
cd GIT-Astro
```

2. Install dependencies:

```bash
npm install
```

3. Make the scripts executable:

```bash
chmod +x scripts/*.ts
```

## Scripts

### WordPress to Markdown Exporter

The main script for converting WordPress XML exports to Markdown files.

#### Usage

```bash
npx ts-node scripts/xml-converter.ts --input=path/to/export.xml --output=src/content/blog
```

#### Options

- `--input`: Path to the WordPress XML export file (required)
- `--output`: Path to the output directory (required)
- `--year-folders`: Create year folders (default: false)
- `--month-folders`: Create month folders (default: false)
- `--post-folders`: Create a folder for each post (default: true)
- `--prefix-date`: Prefix post folders/files with date (default: false)
- `--save-attached-images`: Save images attached to posts (default: true)
- `--save-scraped-images`: Save images scraped from post body content (default: true)
- `--include-other-types`: Include custom post types and pages (default: false)
- `--image-request-delay`: Delay between image requests in ms (default: 500)
- `--image-download-timeout`: Image download timeout in ms (default: 30000)
- `--markdown-write-delay`: Delay between markdown file writes in ms (default: 25)
- `--include-time-with-date`: Include time with post dates (default: true)
- `--custom-date-formatting`: Custom date formatting string (default: '')
- `--custom-date-timezone`: Custom date timezone (default: 'utc')
- `--strict-ssl`: Enforce strict SSL when downloading images (default: true)

#### Example

```bash
# Basic usage
npx ts-node scripts/xml-converter.ts --input=export.xml --output=src/content/blog

# With additional options
npx ts-node scripts/xml-converter.ts \
  --input=export.xml \
  --output=src/content/blog \
  --year-folders \
  --prefix-date \
  --include-other-types \
  --image-request-delay=1000
```

### Fix Image Paths

A script for fixing image paths in Markdown files.

#### Usage

```bash
npx ts-node scripts/fix-image-paths.ts
```

#### Example

```bash
# Fix image paths in all blog posts
npx ts-node scripts/fix-image-paths.ts
```

### Fix Missing Hero Images

A script for fixing missing hero images in blog posts.

#### Usage

```bash
npx ts-node scripts/fix-missing-hero-images.ts
```

#### Example

```bash
# Fix missing hero images in all blog posts
npx ts-node scripts/fix-missing-hero-images.ts
```

## Services

The scripts are built using a service-oriented architecture with the following services:

### ErrorService

Handles error creation, wrapping, and propagation.

```typescript
import { errorService } from './src/services/error/ErrorService';

try {
  // Some code that might throw an error
} catch (error) {
  // Wrap the error with additional context
  const wrappedError = errorService.wrapError(error, 'Failed to process file');
  console.error(wrappedError.message, wrappedError.details);
}
```

### LoggerService

Provides consistent logging with different log levels.

```typescript
import { loggerService } from './src/services/logger/LoggerService';

// Configure the logger
loggerService.updateConfig({
  minLevel: LogLevel.INFO,
  includeTimestamps: true,
  useColors: true,
  includeNewlines: true,
});

// Log messages
loggerService.info('Processing file...');
loggerService.success('File processed successfully');
loggerService.warn('Some non-critical issue occurred');
loggerService.error('An error occurred', error);
```

### ConfigService

Manages configuration options and settings.

```typescript
import configService from './src/services/config/ConfigService';

// Get configuration from command line arguments
const config = await configService.getConfig(process.argv);

// Get application settings
const settings = configService.getSettings();

// Update settings
configService.updateSettings({
  image_download_timeout: 60000,
  strict_ssl: false,
});
```

### ImageService

Handles image processing, downloading, and path normalization.

```typescript
import { imageService } from './src/services/image/ImageService';

// Download an image
const imageBuffer = await imageService.downloadImage('https://example.com/image.jpg');

// Get image dimensions
const dimensions = await imageService.getImageDimensions('path/to/image.jpg');

// Determine image alignment
const alignment = imageService.determineAlignment(dimensions);

// Extract filename from URL
const filename = imageService.getFilenameFromUrl('https://example.com/image.jpg');

// Check if a filename is a resized version
const baseFilename = imageService.getBaseFilenameIfResized('image-300x200.jpg');

// Normalize image path
const normalizedPath = imageService.getNormalizedImagePath('path/to/image.jpg', 'base/path');
```

### ContentService

Handles content transformation and processing.

```typescript
import { contentService } from './src/services/content/ContentService';

// Fix image paths in content
const fixedContent = contentService.fixImagePaths(content, 'base/path');

// Fix image references in a post
const fixedPost = contentService.fixPostImageReferences(post);

// Process a post
const processedPost = contentService.processPost(post);
```

### FrontmatterService

Handles frontmatter extraction, validation, and updating.

```typescript
import { frontmatterService } from './src/services/content/FrontmatterService';

// Extract frontmatter from content
const frontmatter = frontmatterService.extractFrontmatter(content);

// Validate frontmatter
const errors = frontmatterService.validateFrontmatter(frontmatter, ['heroImage', 'title']);

// Update frontmatter in content
const updatedContent = frontmatterService.updateFrontmatter(content, frontmatter);

// Ensure a post has a hero image
const modified = frontmatterService.ensureHeroImage('path/to/post.mdx');
```

## Common Scenarios

### Converting a WordPress Export

**Scenario**: You have a WordPress XML export file and want to convert it to Markdown files for use with Astro.

**Solution**:

1. Export your WordPress site as an XML file.
2. Run the WordPress to Markdown Exporter:

```bash
npx ts-node scripts/xml-converter.ts --input=export.xml --output=src/content/blog
```

3. Check the output directory for the converted files.

**Example Output**:

```
INFO: Configuration loaded successfully
INFO: Input file: export.xml
INFO: Output directory: src/content/blog
INFO: Image download timeout: 30000ms
INFO: Frontmatter fields: id, title, author, date, pubDatetime, modDatetime, slug, excerpt:description, categories, taxonomy:group, tags, coverImage:heroImage
SUCCESS: Parsed 42 posts successfully
INFO: Processing sample image: https://example.com/wp-content/uploads/2022/01/sample-image.jpg
INFO: Extracted filename: sample-image.jpg
INFO: Suggested alignment marker: >
SUCCESS: Files written successfully
SUCCESS: Conversion complete! Output files located at: /home/user/Projects/GIT-Astro/src/content/blog
```

### Fixing Image Path Issues

**Scenario**: You have Markdown files with incorrect image paths, causing errors like "Cannot find module 'images/image.png'".

**Solution**:

1. Run the Fix Image Paths script:

```bash
npx ts-node scripts/fix-image-paths.ts
```

2. The script will find all Markdown files in the blog directory and fix the image paths.

**Example Output**:

```
INFO: Searching for MDX files in: /home/user/Projects/GIT-Astro/src/content/blog
INFO: Found 42 MDX files
INFO: Processing: /home/user/Projects/GIT-Astro/src/content/blog/2022-01-01-sample-post/index.mdx
SUCCESS: Fixed image paths in: /home/user/Projects/GIT-Astro/src/content/blog/2022-01-01-sample-post/index.mdx
INFO: Processing: /home/user/Projects/GIT-Astro/src/content/blog/2022-01-02-another-post/index.mdx
INFO: No changes needed for: /home/user/Projects/GIT-Astro/src/content/blog/2022-01-02-another-post/index.mdx
SUCCESS: Processed 42 files, modified 15 files
```

### Fixing Missing Hero Images

**Scenario**: You have blog posts with missing hero images, causing errors like "InvalidContentEntryDataError: blog → post-slug data does not match collection schema. heroImage: Required".

**Solution**:

1. Run the Fix Missing Hero Images script:

```bash
npx ts-node scripts/fix-missing-hero-images.ts
```

2. The script will find all Markdown files in the blog directory and add hero images where missing.

**Example Output**:

```
INFO: Searching for MDX files in: /home/user/Projects/GIT-Astro/src/content/blog
INFO: Found 42 MDX files
INFO: Processing: /home/user/Projects/GIT-Astro/src/content/blog/2022-01-01-sample-post/index.mdx
WARN: Validation errors in /home/user/Projects/GIT-Astro/src/content/blog/2022-01-01-sample-post/index.mdx: Missing required field: heroImage
SUCCESS: Added heroImage to /home/user/Projects/GIT-Astro/src/content/blog/2022-01-01-sample-post/index.mdx
INFO: Processing: /home/user/Projects/GIT-Astro/src/content/blog/2022-01-02-another-post/index.mdx
SUCCESS: Processed 42 files, modified 8 files, encountered 0 errors
```

### Customizing the Conversion Process

**Scenario**: You want to customize the conversion process to match your specific requirements.

**Solution**:

1. Modify the services to match your requirements:

```typescript
// Example: Customize the image alignment options
import { ImageService, ImageAlignment } from './src/services/image/ImageService';

const customImageService = new ImageService({
  squareAspectRatioMin: 0.9,
  squareAspectRatioMax: 1.1,
  wideAspectRatioThreshold: 1.8,
  defaultAlignment: ImageAlignment.LEFT,
});
```

2. Create a custom script that uses the services:

```typescript
// Example: Custom script for processing specific posts
import { contentService } from './src/services/content/ContentService';
import { frontmatterService } from './src/services/content/FrontmatterService';
import { loggerService } from './src/services/logger/LoggerService';

async function processSpecificPosts() {
  const postPaths = [
    'src/content/blog/post1/index.mdx',
    'src/content/blog/post2/index.mdx',
  ];
  
  for (const postPath of postPaths) {
    loggerService.info(`Processing: ${postPath}`);
    
    try {
      // Read the file
      const content = fs.readFileSync(postPath, 'utf8');
      
      // Extract frontmatter
      const frontmatter = frontmatterService.extractFrontmatter(content);
      
      // Customize frontmatter
      frontmatter.customField = 'Custom value';
      
      // Update the file
      const updatedContent = frontmatterService.updateFrontmatter(content, frontmatter);
      fs.writeFileSync(postPath, updatedContent, 'utf8');
      
      loggerService.success(`Updated: ${postPath}`);
    } catch (error) {
      loggerService.error(`Error processing: ${postPath}`, error);
    }
  }
}

processSpecificPosts();
```

## Troubleshooting

### Common Issues

#### Error: Cannot find module 'images/image.png'

This error occurs when an image path is incorrect. Run the Fix Image Paths script to fix this issue:

```bash
npx ts-node scripts/fix-image-paths.ts
```

#### Error: InvalidContentEntryDataError: blog → post-slug data does not match collection schema. heroImage: Required

This error occurs when a blog post is missing the required heroImage field. Run the Fix Missing Hero Images script to fix this issue:

```bash
npx ts-node scripts/fix-missing-hero-images.ts
```

#### Error: Failed to download image

This error occurs when an image cannot be downloaded. Check your internet connection and try again. If the issue persists, you can increase the image download timeout:

```bash
npx ts-node scripts/xml-converter.ts --input=export.xml --output=src/content/blog --image-download-timeout=60000
```

#### Error: SSL certificate problem

This error occurs when there's an issue with the SSL certificate of the image server. You can disable strict SSL checking:

```bash
npx ts-node scripts/xml-converter.ts --input=export.xml --output=src/content/blog --strict-ssl=false
```

### Debugging

If you encounter issues, you can enable more verbose logging by modifying the LoggerService configuration:

```typescript
import { LogLevel, loggerService } from './src/services/logger/LoggerService';

loggerService.updateConfig({
  minLevel: LogLevel.DEBUG,
  includeTimestamps: true,
});
```

## Contributing

Contributions are welcome! Here's how you can contribute:

1. Fork the repository
2. Create a new branch for your feature or bugfix
3. Make your changes
4. Submit a pull request

Please make sure your code follows the existing style and includes appropriate tests.
