# Gesundes Leben - Hugo Implementation

Hugo-based static site generator implementation for the Gesundes Leben health and wellness blog, migrated from Astro.js using the Blowfish theme.

## 📋 Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Migration Guide](#migration-guide)
- [Development](#development)
- [Content Management](#content-management)
- [Deployment](#deployment)
- [Customization](#customization)

## 🎯 Overview

This Hugo site replaces the existing Astro.js implementation while maintaining:
- All blog content and metadata
- Scientific references system
- Author profiles
- Glossary functionality
- German language support (i18n)
- SEO optimization
- Performance optimizations

### Why Hugo?

- **Faster builds**: Hugo is significantly faster than Astro for large sites
- **Go templates**: More powerful templating with Hugo's built-in functions
- **Native i18n**: First-class multilingual support
- **Mature ecosystem**: Extensive theme and plugin ecosystem
- **Single binary**: No Node.js dependencies for production

### Technology Stack

- **Framework**: Hugo v0.139.3+ (Extended)
- **Theme**: Blowfish (customized)
- **Language**: Go templates
- **Styling**: Tailwind CSS (via Blowfish)
- **Search**: Pagefind
- **Content**: Markdown with YAML frontmatter

## 📦 Prerequisites

### Required Software

1. **Hugo Extended** (v0.128.0 or later)
   ```bash
   # macOS
   brew install hugo

   # Linux
   # Download from https://github.com/gohugoio/hugo/releases

   # Verify installation
   hugo version
   ```

2. **Node.js** (v18+ for migration scripts)
   ```bash
   node --version
   npm --version
   ```

3. **Git** (for theme submodule)
   ```bash
   git --version
   ```

See [SETUP.md](./SETUP.md) for detailed installation instructions.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Install Node.js dependencies for migration scripts
npm install

# Initialize Blowfish theme as git submodule
git submodule add -b main https://github.com/nunocoracao/blowfish.git themes/blowfish
git submodule update --init --recursive
```

### 2. Run Migration Scripts

```bash
# Migrate all content (dry run first)
npm run migrate:dry-run

# Migrate scientific references
npm run migrate:references

# Migrate author profiles
npm run migrate:authors

# Migrate blog posts
npm run migrate

# Or migrate everything at once
npm run migrate:all
```

### 3. Validate Migration

```bash
# Validate all migrated content
npm run validate
```

### 4. Start Development Server

```bash
# Start Hugo development server
npm run hugo:server

# Or use Hugo directly
hugo server -D
```

Visit: http://localhost:1313

### 5. Build for Production

```bash
# Build static site
npm run hugo:build

# Build with search index
hugo --minify && npm run search:build
```

Output will be in the `public/` directory.

## 📂 Project Structure

```
hugo/
├── archetypes/              # Content templates
│   ├── default.md          # Default archetype
│   ├── blog.md             # Blog post template
│   ├── authors.md          # Author profile template
│   └── glossary.md         # Glossary entry template
│
├── assets/                  # Source assets
│   └── css/
│       └── schemes/
│           └── gesundes-leben.css  # Custom color scheme
│
├── content/                 # All markdown content
│   ├── blog/               # Blog posts
│   │   └── YYYY-MM-DD-slug/
│   │       ├── index.md
│   │       └── images/
│   ├── authors/            # Author profiles
│   ├── glossary/           # Health glossary
│   └── pages/              # Static pages
│
├── data/                    # Data files
│   └── references/         # Scientific references (YAML)
│
├── i18n/                    # Translations
│   └── de.yaml             # German UI translations
│
├── layouts/                 # Custom templates
│   ├── _default/           # Base layouts
│   ├── blog/               # Blog layouts
│   ├── partials/           # Reusable partials
│   │   └── references.html # References display
│   └── shortcodes/         # Content shortcodes
│       ├── image.html
│       ├── featured-list.html
│       ├── blockquote.html
│       ├── accordion.html
│       └── list.html
│
├── static/                  # Static files (copied as-is)
│   ├── images/
│   └── fonts/
│
├── themes/
│   └── blowfish/           # Blowfish theme (git submodule)
│
├── config/                  # Configuration
│   └── _default/
│       ├── hugo.toml       # Main Hugo config
│       ├── params.toml     # Theme parameters
│       ├── menus.de.toml   # German navigation
│       └── languages.toml  # Language settings
│
├── scripts/                 # Migration scripts
│   ├── migrate-content.js  # Blog post migration
│   ├── migrate-authors.js  # Author migration
│   ├── migrate-references.js  # References migration
│   └── validate-migration.js  # Validation
│
├── hugo.toml               # Root configuration
├── package.json            # NPM scripts and dependencies
├── SETUP.md                # Setup guide
├── ACTIONPLAN.md           # Full migration action plan
└── README.md               # This file
```

## 🔄 Migration Guide

### Automated Migration

The migration scripts handle conversion from Astro to Hugo format:

#### 1. References Migration

```bash
npm run migrate:references
```

Copies YAML reference files from `src/data/references/` to `data/references/`.

#### 2. Authors Migration

```bash
npm run migrate:authors
```

Converts author profiles from Astro format to Hugo:
- Transforms frontmatter
- Copies avatar images to `static/images/authors/`
- Creates individual `.md` files in `content/authors/`

#### 3. Blog Posts Migration

```bash
# Dry run first to preview changes
npm run migrate:dry-run

# Verbose output to see detailed conversion
npm run migrate:verbose

# Migrate single post for testing
npm run migrate:single -- 2024-01-15-example-post

# Migrate all posts
npm run migrate
```

The migration script:
- Converts Astro frontmatter to Hugo format
- Transforms Astro components to Hugo shortcodes
- Preserves image structure
- Maintains all metadata

#### Component to Shortcode Conversion

| Astro Component | Hugo Shortcode | Example |
|----------------|----------------|---------|
| `<Image src={} alt="" />` | `{{< image >}}` | `{{< image src="images/example.jpg" alt="Description" >}}` |
| `<FeaturedList>` | `{{< featured-list >}}` | `{{< featured-list >}}..{{< /featured-list >}}` |
| `<Blockquote>` | `{{< blockquote >}}` | `{{< blockquote author="Dr. Name" type="tip" >}}` |
| `<Accordion>` | `{{< accordion >}}` | `{{< accordion title="Details" >}}` |
| `<List>` | `{{< list >}}` | `{{< list >}}` |

### Manual Migration

For posts requiring manual intervention:

1. Copy post directory to `content/blog/`
2. Rename `index.mdx` to `index.md`
3. Convert frontmatter using template in `archetypes/blog.md`
4. Replace Astro components with Hugo shortcodes
5. Update image paths (remove `./` prefix)

### Validation

After migration, validate the results:

```bash
npm run validate
```

This checks:
- All posts migrated
- All authors present
- All references copied
- Images copied correctly
- Frontmatter validity

## 💻 Development

### Development Server

```bash
# Start server with drafts
hugo server -D

# Start on different port
hugo server -p 1314

# Watch for changes (automatic)
hugo server --watch

# Disable fast render (rebuild everything)
hugo server --disableFastRender
```

### Creating Content

#### New Blog Post

```bash
# Create new blog post
hugo new blog/2024-11-15-my-new-post/index.md

# This uses the blog archetype template
```

Edit the created file and add your content using shortcodes.

#### New Author

```bash
hugo new authors/author-slug.md
```

#### New Glossary Entry

```bash
hugo new glossary/term-name.md
```

### Using Shortcodes

#### Image

```markdown
{{< image src="images/example.jpg" alt="Description" position="center" title="Caption" >}}

Parameters:
- src: Image path (required)
- alt: Alt text (required)
- position: left, center, right, full (default: center)
- title: Optional caption
- invert: true/false - Invert in dark mode
```

#### Featured List

```markdown
{{< featured-list >}}
- Important point 1
- Important point 2
- Important point 3
{{< /featured-list >}}
```

#### Blockquote (Therapeuten Tipp)

```markdown
{{< blockquote author="Dr. Kai Renner" type="tip" >}}
This is an important tip for readers...
{{< /blockquote >}}

Parameters:
- author: Quote author (optional)
- type: tip, warning, note, quote (default: quote)
- icon: Custom emoji (optional)
```

#### Accordion

```markdown
{{< accordion title="Click to expand" open="false" >}}
Content that can be collapsed...
{{< /accordion >}}

Parameters:
- title: Accordion header (required)
- open: true/false - Initially open (default: false)
```

### Building

```bash
# Production build (minified)
hugo --minify

# Build with specific environment
hugo --environment production

# Generate drafts
hugo -D

# Verbose output
hugo --verbose
```

### Search

Build search index after building site:

```bash
# Build site first
hugo --minify

# Then build search index
npm run search:build

# Or combined
hugo --minify && npm run search:build
```

## ✍️ Content Management

### Frontmatter Reference

#### Blog Post

```yaml
---
title: "Post Title"
date: 2024-11-15T10:00:00Z
lastmod: 2024-11-15T10:00:00Z
draft: false
author: "kai-renner"
description: "Brief description for SEO"
keywords: ["keyword1", "keyword2"]
categories: ["Lifestyle & Psyche"]
tags: ["Emotionen", "Gedanken"]
featured: false

params:
  group: "basic"  # or "pro"
  heroImage: "images/hero.jpg"
  heroImageAlt: "Image description"
  references: ["2023-smith-nutrition", "2024-jones-wellness"]
---
```

#### Author

```yaml
---
title: "Author Name"
type: "author"
bio: "Brief biography"
avatar: "/images/authors/author-slug.jpg"
email: "author@example.com"
website: "https://example.com"
social:
  twitter: "username"
  linkedin: "username"
expertise: ["Nutrition", "Wellness"]
credentials: ["PhD", "Certified Nutritionist"]
---
```

### Adding References

1. Create YAML file in `data/references/`:

```yaml
# data/references/2024-author-topic.yaml
type: journal
title: "Study Title"
authors:
  - "Smith, J."
  - "Johnson, K."
year: 2024
journal: "Journal Name"
volume: 10
issue: 3
pages: "123-145"
doi: "10.1234/journal.2024.123"
keywords:
  - "health"
  - "nutrition"
```

2. Reference in blog post frontmatter:

```yaml
params:
  references:
    - "2024-author-topic"
```

3. References will automatically display at the end of the post.

### Categories and Tags

Use predefined categories from Astro codebase:
- Bewegung & Ergonomie
- Ernährung & Rezepte
- Lifestyle & Psyche

Tags are flexible but should be consistent.

## 🚀 Deployment

### Netlify (Recommended)

Create `netlify.toml`:

```toml
[build]
  publish = "public"
  command = "hugo --minify && npx pagefind --site public --language de"

[build.environment]
  HUGO_VERSION = "0.139.3"
  HUGO_ENV = "production"
  HUGO_ENABLEGITINFO = "false"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

### Vercel

Install Vercel CLI and deploy:

```bash
vercel --prod
```

### GitHub Pages

```bash
# Build site
hugo --minify

# Deploy to GitHub Pages (configure repository settings)
```

### Custom Server

```bash
# Build site
hugo --minify && npm run search:build

# Upload public/ directory to your server
rsync -avz public/ user@server:/var/www/html/
```

## 🎨 Customization

### Color Scheme

Edit `assets/css/schemes/gesundes-leben.css` to customize colors.

### Layouts

Override Blowfish templates by creating files in `layouts/`:
- `layouts/_default/single.html` - Single page layout
- `layouts/_default/list.html` - List page layout
- `layouts/blog/single.html` - Blog post layout

### Partials

Create reusable components in `layouts/partials/`:
- Already includes `references.html`
- Add custom partials as needed

### Menus

Edit `config/_default/menus.de.toml`:

```toml
[[main]]
  name = "New Menu Item"
  pageRef = "page-slug"
  weight = 50
```

### Theme Parameters

Edit `config/_default/params.toml` for Blowfish theme settings.

## 📚 Resources

- **Hugo Documentation**: https://gohugo.io/documentation/
- **Blowfish Theme**: https://blowfish.page/
- **Action Plan**: See [ACTIONPLAN.md](./ACTIONPLAN.md)
- **Setup Guide**: See [SETUP.md](./SETUP.md)

## 🐛 Troubleshooting

### Hugo not found
- Ensure Hugo Extended is installed
- Check `hugo version` shows "extended"
- Add Hugo to PATH

### Theme not loading
- Initialize submodule: `git submodule update --init --recursive`
- Check `theme = "blowfish"` in `hugo.toml`

### Migration errors
- Run `npm run migrate:dry-run` first
- Check `--verbose` output for details
- Validate individual posts with `--single`

### Build errors
- Ensure Hugo Extended (not regular Hugo)
- Check Hugo version >= 0.128.0
- Review error messages for missing files

### Search not working
- Build search index after Hugo build
- Check Pagefind is installed: `npm install`
- Verify German language support configured

## 📝 License

Copyright © 2025 Gesundes Leben. All rights reserved.

## 🤝 Contributing

This is a private project. For questions or issues, contact the development team.

---

**Version**: 1.0.0
**Last Updated**: 2025-11-15
**Status**: Production Ready (pending Hugo installation and content migration)
