# Hugo Migration Action Plan

**Project**: Gesundes Leben - Astro.js to Hugo Migration
**Template**: Blowfish Hugo Theme
**Date**: 2025-11-15
**Status**: Planning Phase

---

## Executive Summary

This document outlines a comprehensive, phased approach to migrating the "Gesundes Leben" health blog from Astro.js to Hugo static site generator using the Blowfish theme as the foundation. The migration will preserve all existing functionality while leveraging Hugo's performance benefits and Go-based templating.

### Current State Analysis

- **Framework**: Astro.js 5.15.5 with TypeScript
- **Content**: 96 Astro components, MDX-based blog posts
- **Features**: Multilingual (German primary), content collections, references system, search (Pagefind), PWA
- **Build Tool**: Bun runtime
- **Styling**: Tailwind CSS 4.1.17
- **Content Types**: Blog posts, authors, glossary, favorites, references

### Target State

- **Framework**: Hugo (latest stable)
- **Theme**: Blowfish (customized)
- **Language**: Go templates + Hugo templating
- **Content**: Markdown with Hugo frontmatter
- **Styling**: Tailwind CSS (via Blowfish)
- **Features**: All existing features preserved/enhanced

---

## Phase 1: Environment Setup & Foundation (Week 1)

### 1.1 Development Environment Preparation

**Objective**: Establish Hugo development environment and tooling

**Tasks**:

1. **Install Hugo Extended Edition**
   ```bash
   # Linux/macOS
   brew install hugo
   # or download from https://github.com/gohugoio/hugo/releases

   # Verify installation (require v0.128.0+)
   hugo version
   ```

2. **Initialize Hugo Project**
   ```bash
   cd /home/user/gesundes-leben/hugo
   hugo new site . --force
   git init
   ```

3. **Install Blowfish Theme**
   ```bash
   # Method 1: Git submodule (recommended)
   git submodule add -b main https://github.com/nunocoracao/blowfish.git themes/blowfish

   # Method 2: Hugo modules (alternative)
   hugo mod init github.com/aequinox/gesundes-leben
   # Then add to hugo.toml
   ```

4. **Configure Base Settings**
   - Create `hugo.toml` (or `config/_default/hugo.toml`)
   - Set base URL, language, title
   - Configure Blowfish theme
   - Set up multilingual support (German primary)

**Deliverables**:
- [ ] Hugo installed and verified
- [ ] Blowfish theme integrated
- [ ] Base configuration files created
- [ ] Development server running (`hugo server`)

**Reference Documentation**:
- Hugo Quick Start: https://gohugo.io/getting-started/quick-start/
- Blowfish Installation: https://blowfish.page/docs/installation/
- Blowfish Configuration: https://blowfish.page/docs/configuration/

---

## Phase 2: Content Architecture & Schema Design (Week 1-2)

### 2.1 Hugo Directory Structure Setup

**Objective**: Establish Hugo-compliant directory structure

**Structure**:
```
hugo/
├── archetypes/           # Content templates
│   ├── default.md
│   ├── blog.md
│   ├── authors.md
│   └── glossary.md
├── assets/              # Source files (CSS, JS, images)
│   └── css/
├── content/             # All markdown content
│   ├── blog/           # Blog posts
│   │   └── YYYY-MM-DD-slug/
│   │       ├── index.md
│   │       └── images/
│   ├── authors/        # Author profiles
│   ├── glossary/       # Health terms
│   └── pages/          # Static pages
├── data/               # YAML/JSON data files
│   ├── favorites.yaml
│   └── references/     # Scientific references
├── i18n/               # Translations
│   ├── de.yaml
│   └── en.yaml
├── layouts/            # Custom templates
│   ├── _default/
│   ├── blog/
│   ├── partials/
│   └── shortcodes/
├── static/             # Static assets (copied as-is)
│   ├── images/
│   └── fonts/
├── themes/
│   └── blowfish/
└── hugo.toml          # Main configuration
```

**Tasks**:

1. **Create Directory Structure**
   ```bash
   mkdir -p content/{blog,authors,glossary,pages}
   mkdir -p data/references
   mkdir -p layouts/{_default,blog,partials,shortcodes}
   mkdir -p assets/css
   mkdir -p i18n
   mkdir -p archetypes
   ```

2. **Define Archetypes**
   - Create `archetypes/blog.md` with default blog frontmatter
   - Create `archetypes/authors.md` for author profiles
   - Create `archetypes/glossary.md` for glossary entries

3. **Configure Taxonomies**
   - Categories (Hugo default)
   - Tags (Hugo default)
   - Custom: groups (pro, basic, etc.)
   - Custom: keywords

**Deliverables**:
- [ ] Complete directory structure
- [ ] Archetype templates for all content types
- [ ] Taxonomy configuration in `hugo.toml`

### 2.2 Frontmatter Schema Mapping

**Objective**: Map Astro content collections to Hugo frontmatter

**Astro to Hugo Frontmatter Mapping**:

```yaml
# ASTRO (current)
---
id: dd3b73aa-233e-43a7-a32e-3c93a9441074
title: Vergebung verstehen
author: kai-renner
description: Wieso du Vergebung üben solltest...
keywords: [Vergebung]
heroImage:
  src: ./images/vergebung-verstehen.jpg
  alt: test3
pubDatetime: 2022-09-23T15:22:00Z
modDatetime: 2025-04-15T17:01:09Z
draft: false
featured: false
group: pro
categories: [Lifestyle & Psyche]
tags: [Emotionen, Gedanken]
---

# HUGO (target)
---
title: "Vergebung verstehen"
date: 2022-09-23T15:22:00Z
lastmod: 2025-04-15T17:01:09Z
draft: false
author: "kai-renner"
description: "Wieso du Vergebung üben solltest..."
keywords: ["Vergebung"]
categories: ["Lifestyle & Psyche"]
tags: ["Emotionen", "Gedanken"]
featured: false
# Custom params
params:
  group: "pro"
  heroImage: "/blog/2022-09-23-vergebung-verstehen/images/vergebung-verstehen.jpg"
  heroImageAlt: "test3"
  references: []
---
```

**Key Changes**:
- `pubDatetime` → `date`
- `modDatetime` → `lastmod`
- `heroImage.src` → `params.heroImage` (path-based)
- Move custom fields to `params` section
- Remove `id` (Hugo generates from filename)

**Deliverables**:
- [ ] Frontmatter mapping documentation
- [ ] Sample converted posts for validation

---

## Phase 3: Content Migration (Week 2-3)

### 3.1 Blog Post Migration

**Objective**: Convert all MDX blog posts to Hugo-compatible Markdown

**Migration Strategy**:

1. **Automated Conversion Script**
   - Create Go script or Node.js script for bulk conversion
   - Handle frontmatter transformation
   - Convert Astro component imports to Hugo shortcodes
   - Preserve image paths and structure

2. **Component to Shortcode Mapping**
   ```
   ASTRO COMPONENT                    → HUGO SHORTCODE
   ────────────────────────────────────────────────────
   <Image src={} alt="" />           → {{< image src="" alt="" >}}
   <FeaturedList items={} />         → {{< featured-list >}}...{{< /featured-list >}}
   <Blockquote>                      → {{< blockquote >}}...{{< /blockquote >}}
   <Accordion title="">              → {{< accordion title="" >}}...{{< /accordion >}}
   import statements                 → Remove/convert to shortcode params
   ```

3. **Content Organization**
   - Maintain date-based folder structure: `YYYY-MM-DD-slug/`
   - Keep images in `images/` subfolder within each post
   - Preserve all metadata

**Migration Script Pseudocode**:
```javascript
// scripts/migrate-content.js
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

function convertAstroToHugo(astroFilePath) {
  // 1. Read MDX file
  // 2. Extract frontmatter
  // 3. Transform frontmatter fields
  // 4. Convert component syntax to shortcodes
  // 5. Update image paths
  // 6. Write to Hugo content directory
}

function migrateAllPosts() {
  const astroPostsDir = '../src/data/blog';
  const hugoPostsDir = './content/blog';
  // Iterate and convert
}
```

**Tasks**:
1. Create migration script
2. Test on 3-5 sample posts
3. Review and validate output
4. Run bulk migration
5. Manual review of complex posts

**Deliverables**:
- [ ] Migration script (JavaScript/Go)
- [ ] All blog posts converted
- [ ] Image paths validated
- [ ] Migration report (success/errors)

### 3.2 Authors Migration

**Objective**: Convert author profiles from Markdown to Hugo format

**Current Structure** (`src/data/authors/`):
```yaml
---
name: Kai Renner
bio: Health enthusiast and nutritionist...
avatar: ./avatar.jpg
---
```

**Hugo Structure** (`content/authors/`):
```yaml
---
title: "Kai Renner"
type: "author"
bio: "Health enthusiast and nutritionist..."
avatar: "/images/authors/kai-renner.jpg"
---

# Optional extended bio in markdown body
```

**Tasks**:
1. Convert author markdown files
2. Move avatars to `static/images/authors/`
3. Update author references in blog posts

**Deliverables**:
- [ ] All author profiles converted
- [ ] Author avatars migrated
- [ ] Author taxonomy configured

### 3.3 References System Migration

**Objective**: Migrate scientific references from YAML to Hugo data files

**Current**: Individual YAML files in `src/data/references/`
**Target**: Hugo data directory `data/references/`

**Strategy**:
- Copy YAML files to `data/references/`
- Create Hugo partial to render references
- Update blog post templates to reference data

**Reference Access Pattern**:
```go-html-template
{{/* In blog post template */}}
{{ range .Params.references }}
  {{ $ref := index $.Site.Data.references . }}
  {{/* Render reference */}}
{{ end }}
```

**Tasks**:
1. Copy reference YAML files
2. Create reference rendering partial
3. Update blog post layout
4. Validate references display

**Deliverables**:
- [ ] References migrated to data/
- [ ] Reference partial created
- [ ] References rendering in posts

### 3.4 Glossary Migration

**Objective**: Convert glossary entries to Hugo content

**Tasks**:
1. Convert glossary markdown files
2. Configure glossary taxonomy
3. Create glossary list/single templates

**Deliverables**:
- [ ] Glossary entries converted
- [ ] Glossary section configured

---

## Phase 4: Theme Customization (Week 3-4)

### 4.1 Blowfish Theme Configuration

**Objective**: Configure Blowfish for German health blog

**Configuration Files** (`config/_default/`):

1. **hugo.toml** - Base configuration
```toml
baseURL = "https://gesundes-leben.vision/"
languageCode = "de-DE"
title = "Gesundes Leben"
theme = "blowfish"
defaultContentLanguage = "de"
enableRobotsTXT = true
paginate = 12

[params]
  description = "Dein vertrauenswürdiger Ratgeber für Gesundheit..."
  author = "Kai Renner"

[languages]
  [languages.de]
    languageName = "Deutsch"
    weight = 1
```

2. **params.toml** - Theme parameters
```toml
colorScheme = "custom"
defaultAppearance = "light"
autoSwitchAppearance = true

[header]
  layout = "basic"

[homepage]
  layout = "profile"
  showRecent = true
  recentLimit = 6

[article]
  showDate = true
  showAuthor = true
  showReadingTime = true
  showTableOfContents = true
```

3. **menus.de.toml** - Navigation menus
```toml
[[main]]
  name = "Blog"
  pageRef = "blog"
  weight = 10

[[main]]
  name = "Glossar"
  pageRef = "glossary"
  weight = 20

[[main]]
  name = "Über uns"
  pageRef = "about"
  weight = 30
```

**Tasks**:
1. Create configuration files
2. Configure multilingual (German)
3. Set up navigation menus
4. Configure article display options
5. Set pagination to 12 posts

**Deliverables**:
- [ ] Complete Blowfish configuration
- [ ] German language configured
- [ ] Navigation menus set up
- [ ] Theme customization documented

### 4.2 Custom Color Scheme

**Objective**: Match existing design with custom Blowfish color scheme

**Current Tailwind Colors** (from Astro):
- Primary: Health-focused greens
- Accent: Complementary colors
- Dark mode support

**Blowfish Color Customization**:

Create `assets/css/schemes/gesundes-leben.css`:
```css
:root {
  --color-neutral: 255, 255, 255;
  --color-neutral-700: 64, 64, 64;
  --color-primary-600: 34, 139, 34; /* Forest green */
  --color-primary-700: 0, 100, 0;
  /* Add all color variables */
}
```

**Tasks**:
1. Extract current color palette from Astro
2. Create custom color scheme CSS
3. Reference in `params.toml`
4. Test in light/dark modes

**Deliverables**:
- [ ] Custom color scheme created
- [ ] Colors match existing design
- [ ] Dark mode tested

### 4.3 Custom Layouts and Partials

**Objective**: Create custom layouts for specialized content

**Custom Layouts Needed**:

1. **Blog Post Layout** (`layouts/blog/single.html`)
   - Article header with author
   - Reading time
   - Table of contents (German: "Inhaltsverzeichnis")
   - References section
   - Share buttons
   - Related posts

2. **Blog List Layout** (`layouts/blog/list.html`)
   - Featured posts section
   - Post grid with pagination
   - Category/tag filtering
   - Search integration

3. **Author Layout** (`layouts/authors/single.html`)
   - Author bio
   - Avatar
   - List of author's posts

4. **Glossary Layout** (`layouts/glossary/`)
   - Alphabetical listing
   - Term definitions
   - Cross-references

**Key Partials** (`layouts/partials/`):

1. **article-header.html** - Post header with metadata
2. **references.html** - Scientific references rendering
3. **share-buttons.html** - Social sharing
4. **toc.html** - Custom table of contents
5. **related-posts.html** - Related content suggestions

**Tasks**:
1. Create custom layout files
2. Implement partials
3. Override Blowfish templates as needed
4. Test all layouts

**Deliverables**:
- [ ] Custom blog layouts created
- [ ] Author layout implemented
- [ ] Glossary layout created
- [ ] All partials functional

---

## Phase 5: Component Migration to Shortcodes (Week 4-5)

### 5.1 Core Shortcodes Development

**Objective**: Convert Astro components to Hugo shortcodes

**Priority Shortcodes**:

1. **Image Shortcode** (`layouts/shortcodes/image.html`)
```go-html-template
{{/* Usage: {{< image src="/path/to/image.jpg" alt="Description" position="left" >}} */}}
{{ $src := .Get "src" }}
{{ $alt := .Get "alt" }}
{{ $position := .Get "position" | default "center" }}
{{ $invert := .Get "invert" | default "false" }}

<figure class="image-{{ $position }}{{ if eq $invert "true" }} invert{{ end }}">
  {{ with resources.Get $src }}
    {{ $img := .Resize "1024x" }}
    <img src="{{ $img.RelPermalink }}"
         alt="{{ $alt }}"
         loading="lazy"
         width="{{ $img.Width }}"
         height="{{ $img.Height }}">
  {{ end }}
  {{ with .Get "title" }}
    <figcaption>{{ . }}</figcaption>
  {{ end }}
</figure>
```

2. **Featured List Shortcode** (`layouts/shortcodes/featured-list.html`)
```go-html-template
{{/* Usage: {{< featured-list >}}
- Item 1
- Item 2
{{< /featured-list >}} */}}

<ul class="featured-list">
  {{ .Inner | markdownify }}
</ul>
```

3. **Blockquote Shortcode** (`layouts/shortcodes/blockquote.html`)
```go-html-template
{{/* Usage: {{< blockquote author="Name" >}}Quote text{{< /blockquote >}} */}}

<blockquote class="therapist-tip">
  <p>{{ .Inner | markdownify }}</p>
  {{ with .Get "author" }}
    <cite>— {{ . }}</cite>
  {{ end }}
</blockquote>
```

4. **Accordion Shortcode** (`layouts/shortcodes/accordion.html`)
```go-html-template
{{/* Usage: {{< accordion title="Title" >}}Content{{< /accordion >}} */}}

<details class="accordion">
  <summary>{{ .Get "title" }}</summary>
  <div class="accordion-content">
    {{ .Inner | markdownify }}
  </div>
</details>
```

**Shortcode Development Checklist**:
- [ ] Image (with lazy loading, responsive)
- [ ] FeaturedList
- [ ] Blockquote (Therapeuten Tipp style)
- [ ] Accordion (collapsible sections)
- [ ] List (custom list styling)
- [ ] Card (if used in content)

**Tasks**:
1. Identify all Astro components used in content
2. Create equivalent Hugo shortcodes
3. Add CSS for shortcode styling
4. Test each shortcode
5. Document usage for content team

**Deliverables**:
- [ ] All shortcodes implemented
- [ ] Shortcode documentation created
- [ ] Styling applied and tested

### 5.2 Advanced Shortcodes

**Additional Shortcodes**:

1. **Reference Citation** (`layouts/shortcodes/cite.html`)
2. **Table of Contents** (custom TOC)
3. **Alert/Warning Box**
4. **YouTube/Video Embed** (if needed)
5. **Product Recommendation** (from favorites)

**Deliverables**:
- [ ] Advanced shortcodes created
- [ ] Integration tested

---

## Phase 6: Feature Parity & Functionality (Week 5-6)

### 6.1 Search Implementation

**Objective**: Implement search functionality (replacing Pagefind)

**Options**:

1. **Pagefind (Same as Astro)** ✅ Recommended
   - Static search index
   - German language support
   - Fast, no server required
   ```bash
   npm install pagefind
   hugo build
   npx pagefind --site public --language de
   ```

2. **Fuse.js** (JavaScript-based)
   - Client-side search
   - Lightweight
   - Good for smaller sites

3. **Algolia** (External service)
   - Powerful, but requires account
   - Best for large sites

**Recommended: Pagefind**

**Implementation**:
1. Install Pagefind
2. Add post-build script to `package.json`
3. Create search page layout
4. Integrate search UI
5. Configure German language support

**Tasks**:
- [ ] Choose search solution (Pagefind)
- [ ] Install and configure
- [ ] Create search page
- [ ] Test German search queries
- [ ] Exclude TOC from indexing

**Deliverables**:
- [ ] Search fully functional
- [ ] German language support verified

### 6.2 RSS Feed Generation

**Objective**: Generate RSS/Atom feeds for blog

**Hugo Built-in RSS**:
- Hugo has native RSS support
- Customize template: `layouts/_default/rss.xml`

**Configuration** (`hugo.toml`):
```toml
[outputs]
  home = ["HTML", "RSS", "JSON"]
  section = ["HTML", "RSS"]

[params.rss]
  limit = 20
```

**Custom RSS Template** (`layouts/_default/rss.xml`):
```xml
{{- $pages := where .RegularPages "Section" "blog" -}}
<rss version="2.0">
  <channel>
    <title>{{ .Site.Title }}</title>
    <link>{{ .Permalink }}</link>
    <description>{{ .Site.Params.description }}</description>
    {{ range first 20 $pages }}
    <item>
      <title>{{ .Title }}</title>
      <link>{{ .Permalink }}</link>
      <pubDate>{{ .Date.Format "Mon, 02 Jan 2006 15:04:05 -0700" }}</pubDate>
      <description>{{ .Summary | html }}</description>
    </item>
    {{ end }}
  </channel>
</rss>
```

**Tasks**:
- [ ] Configure RSS output
- [ ] Customize RSS template
- [ ] Test feed validation
- [ ] Add feed discovery links

**Deliverables**:
- [ ] RSS feed generated
- [ ] Feed validated

### 6.3 Sitemap Generation

**Objective**: Generate XML sitemap for SEO

**Hugo Built-in Sitemap**:
- Automatic generation
- Customize if needed: `layouts/_default/sitemap.xml`

**Configuration** (`hugo.toml`):
```toml
[sitemap]
  changefreq = "weekly"
  priority = 0.5
  filename = "sitemap.xml"
```

**Tasks**:
- [ ] Configure sitemap
- [ ] Test sitemap output
- [ ] Submit to search engines

**Deliverables**:
- [ ] Sitemap generated
- [ ] Submitted to Google/Bing

### 6.4 Internationalization (i18n)

**Objective**: Set up multilingual support (German primary, English future)

**Hugo i18n Structure**:
```
i18n/
├── de.yaml
└── en.yaml (future)
```

**Translation File** (`i18n/de.yaml`):
```yaml
- id: read_more
  translation: "Weiterlesen"
- id: published_on
  translation: "Veröffentlicht am"
- id: reading_time
  translation: "{{ .Count }} Min. Lesezeit"
- id: share
  translation: "Teilen"
- id: related_posts
  translation: "Verwandte Beiträge"
- id: table_of_contents
  translation: "Inhaltsverzeichnis"
```

**Usage in Templates**:
```go-html-template
{{ i18n "read_more" }}
{{ i18n "reading_time" (dict "Count" .ReadingTime) }}
```

**Tasks**:
- [ ] Extract all UI strings
- [ ] Create de.yaml translation file
- [ ] Update templates to use i18n
- [ ] Test all translated strings

**Deliverables**:
- [ ] German translations complete
- [ ] i18n implemented in all templates

### 6.5 SEO & Meta Tags

**Objective**: Implement comprehensive SEO

**SEO Partial** (`layouts/partials/seo.html`):
```go-html-template
<meta name="description" content="{{ .Description | default .Site.Params.description }}">
<meta name="keywords" content="{{ delimit .Params.keywords ", " }}">
<meta name="author" content="{{ .Params.author | default .Site.Params.author }}">

<!-- Open Graph -->
<meta property="og:title" content="{{ .Title }}">
<meta property="og:description" content="{{ .Description }}">
<meta property="og:type" content="article">
<meta property="og:url" content="{{ .Permalink }}">
{{ with .Params.heroImage }}
<meta property="og:image" content="{{ . | absURL }}">
{{ end }}

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{{ .Title }}">
<meta name="twitter:description" content="{{ .Description }}">

<!-- Schema.org -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "{{ .Title }}",
  "datePublished": "{{ .Date.Format "2006-01-02T15:04:05Z07:00" }}",
  "dateModified": "{{ .Lastmod.Format "2006-01-02T15:04:05Z07:00" }}",
  "author": {
    "@type": "Person",
    "name": "{{ .Params.author }}"
  },
  "description": "{{ .Description }}"
}
</script>
```

**Tasks**:
- [ ] Create SEO partial
- [ ] Add to base template
- [ ] Test with SEO tools
- [ ] Implement Schema.org markup

**Deliverables**:
- [ ] SEO meta tags implemented
- [ ] Schema.org structured data
- [ ] Validated with Google Rich Results

---

## Phase 7: Build & Performance Optimization (Week 6-7)

### 7.1 Build Configuration

**Objective**: Optimize Hugo build for production

**Hugo Configuration** (`hugo.toml`):
```toml
[build]
  writeStats = true

[minify]
  disableHTML = false
  disableCSS = false
  disableJS = false
  disableJSON = false
  disableSVG = false
  minifyOutput = true

[imaging]
  quality = 85
  resampleFilter = "lanczos"

[outputs]
  home = ["HTML", "RSS", "JSON"]
  section = ["HTML", "RSS"]

[caches]
  [caches.getjson]
    maxAge = "1h"
  [caches.images]
    maxAge = "24h"
```

**Tasks**:
- [ ] Configure build settings
- [ ] Enable minification
- [ ] Optimize image processing
- [ ] Configure caching

**Deliverables**:
- [ ] Optimized build configuration
- [ ] Fast build times documented

### 7.2 Image Optimization

**Objective**: Implement responsive images and optimization

**Hugo Image Processing**:
```go-html-template
{{ $image := resources.Get .src }}
{{ $webp := $image.Resize "1024x webp q85" }}
{{ $fallback := $image.Resize "1024x jpg q85" }}

<picture>
  <source srcset="{{ $webp.RelPermalink }}" type="image/webp">
  <img src="{{ $fallback.RelPermalink }}"
       alt="{{ .alt }}"
       loading="lazy"
       width="{{ $fallback.Width }}"
       height="{{ $fallback.Height }}">
</picture>
```

**Tasks**:
- [ ] Implement responsive images
- [ ] Generate WebP format
- [ ] Add lazy loading
- [ ] Optimize hero images

**Deliverables**:
- [ ] Image optimization working
- [ ] WebP support verified
- [ ] Performance tested

### 7.3 CSS & JavaScript Bundling

**Objective**: Optimize CSS/JS delivery

**Asset Pipeline** (Hugo Pipes):
```go-html-template
{{ $css := resources.Get "css/main.css" }}
{{ $css := $css | resources.PostCSS }}
{{ if hugo.IsProduction }}
  {{ $css := $css | minify | fingerprint }}
{{ end }}
<link rel="stylesheet" href="{{ $css.RelPermalink }}">
```

**Tasks**:
- [ ] Set up Hugo Pipes
- [ ] Configure PostCSS (Tailwind)
- [ ] Minify CSS/JS
- [ ] Add fingerprinting

**Deliverables**:
- [ ] Optimized asset delivery
- [ ] Bundle sizes reduced

### 7.4 Performance Testing

**Objective**: Ensure performance matches/exceeds Astro

**Metrics to Track**:
- Build time
- Page load time
- Lighthouse scores (all 90+)
- Bundle sizes
- Image loading

**Testing Tools**:
- Lighthouse
- WebPageTest
- GTmetrix
- Hugo build analytics

**Target Metrics**:
- Build time: < 30 seconds
- First Contentful Paint: < 1.5s
- Largest Contentful Paint: < 2.5s
- Lighthouse Performance: > 90
- Lighthouse SEO: > 95

**Tasks**:
- [ ] Run performance baselines
- [ ] Compare to Astro metrics
- [ ] Optimize bottlenecks
- [ ] Document performance

**Deliverables**:
- [ ] Performance report
- [ ] Comparison to Astro
- [ ] Optimization recommendations

---

## Phase 8: Testing & Quality Assurance (Week 7-8)

### 8.1 Content Validation

**Objective**: Verify all content migrated correctly

**Validation Checklist**:

1. **Blog Posts**
   - [ ] All posts present (verify count)
   - [ ] Frontmatter correct
   - [ ] Images display correctly
   - [ ] Internal links work
   - [ ] Shortcodes render properly
   - [ ] References display

2. **Authors**
   - [ ] All authors present
   - [ ] Avatars display
   - [ ] Author pages link to posts

3. **Glossary**
   - [ ] All terms present
   - [ ] Formatting preserved

4. **Static Pages**
   - [ ] About page
   - [ ] Contact (if exists)
   - [ ] Privacy policy

**Tasks**:
- [ ] Create validation script
- [ ] Manual spot-checks
- [ ] Link checker run
- [ ] Image validator

**Deliverables**:
- [ ] Validation report
- [ ] Issues list
- [ ] All issues resolved

### 8.2 Cross-Browser Testing

**Objective**: Ensure compatibility across browsers

**Test Browsers**:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile: iOS Safari, Chrome Android

**Test Items**:
- Page rendering
- Navigation
- Search functionality
- Responsive design
- Dark mode toggle

**Tasks**:
- [ ] Test on all browsers
- [ ] Test on mobile devices
- [ ] Fix browser-specific issues

**Deliverables**:
- [ ] Browser compatibility verified
- [ ] Mobile responsiveness confirmed

### 8.3 Accessibility Audit

**Objective**: Maintain WCAG 2.1 AA compliance

**Testing Tools**:
- axe DevTools
- WAVE
- Lighthouse Accessibility
- Manual keyboard navigation

**Focus Areas**:
- Semantic HTML
- ARIA labels
- Keyboard navigation
- Color contrast
- Screen reader compatibility

**Tasks**:
- [ ] Run accessibility audits
- [ ] Fix identified issues
- [ ] Test with screen readers
- [ ] Verify keyboard navigation

**Deliverables**:
- [ ] Accessibility report
- [ ] WCAG 2.1 AA compliance confirmed

### 8.4 Automated Testing

**Objective**: Set up automated testing pipeline

**Test Types**:

1. **Build Tests**
   ```bash
   hugo --minify
   # Check exit code
   ```

2. **Link Checking**
   ```bash
   # Use htmltest or similar
   htmltest public/
   ```

3. **HTML Validation**
   ```bash
   # Use W3C validator
   ```

4. **Performance Budgets**
   - Set limits on bundle sizes
   - Monitor build times

**CI/CD Integration** (GitHub Actions example):
```yaml
name: Hugo CI

on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          submodules: true

      - name: Setup Hugo
        uses: peaceiris/actions-hugo@v2
        with:
          hugo-version: 'latest'
          extended: true

      - name: Build
        run: hugo --minify

      - name: Test
        run: |
          npm install -g htmltest
          htmltest public/
```

**Tasks**:
- [ ] Set up CI/CD pipeline
- [ ] Configure automated tests
- [ ] Set performance budgets

**Deliverables**:
- [ ] CI/CD pipeline running
- [ ] Automated tests passing

---

## Phase 9: Deployment & Migration (Week 8)

### 9.1 Deployment Configuration

**Objective**: Prepare for production deployment

**Hosting Options**:

1. **Netlify** ✅ Recommended
   - `netlify.toml`:
   ```toml
   [build]
     publish = "public"
     command = "hugo --minify && npx pagefind --site public"

   [build.environment]
     HUGO_VERSION = "0.128.0"
     HUGO_ENV = "production"

   [[headers]]
     for = "/*"
     [headers.values]
       X-Frame-Options = "DENY"
       X-Content-Type-Options = "nosniff"
   ```

2. **Vercel**
3. **GitHub Pages**
4. **Cloudflare Pages**

**Tasks**:
- [ ] Choose hosting platform
- [ ] Configure build settings
- [ ] Set environment variables
- [ ] Configure custom domain
- [ ] Set up SSL/TLS

**Deliverables**:
- [ ] Deployment configuration ready
- [ ] Test deployment successful

### 9.2 Migration Strategy

**Objective**: Smooth transition from Astro to Hugo

**Options**:

**Option A: Direct Cutover** (Recommended if Hugo site complete)
1. Build Hugo site
2. Test thoroughly on staging URL
3. Update DNS/deployment to Hugo site
4. Monitor for 48 hours
5. Archive Astro site

**Option B: Phased Migration** (Lower risk)
1. Deploy Hugo to subdomain (e.g., new.gesundes-leben.vision)
2. Test in production environment
3. Redirect subset of traffic
4. Monitor and fix issues
5. Full cutover when ready

**Option C: Parallel Running** (Highest safety)
1. Run Hugo alongside Astro
2. Gradually migrate sections
3. Use A/B testing
4. Full migration over weeks

**Recommended**: Option A (if testing is thorough)

**Rollback Plan**:
- Keep Astro deployment ready
- DNS quick-switch capability
- Backup of Hugo site before launch

**Tasks**:
- [ ] Choose migration strategy
- [ ] Prepare rollback plan
- [ ] Schedule migration window
- [ ] Notify stakeholders

**Deliverables**:
- [ ] Migration plan documented
- [ ] Rollback tested
- [ ] Go-live checklist

### 9.3 Post-Migration Monitoring

**Objective**: Ensure stability after migration

**Monitoring Checklist** (First 72 hours):

1. **Analytics**
   - [ ] Traffic levels normal
   - [ ] No spike in 404 errors
   - [ ] Engagement metrics stable

2. **Performance**
   - [ ] Page load times
   - [ ] Build times
   - [ ] Server response times

3. **SEO**
   - [ ] Search rankings stable
   - [ ] Indexing status
   - [ ] Crawl errors

4. **User Reports**
   - [ ] Monitor for bug reports
   - [ ] Check social media
   - [ ] Support emails

**Tasks**:
- [ ] Set up monitoring
- [ ] Create alert system
- [ ] Daily checks for first week

**Deliverables**:
- [ ] Monitoring dashboard
- [ ] Issue tracking system
- [ ] Weekly status reports

---

## Phase 10: Documentation & Handoff (Week 8-9)

### 10.1 Technical Documentation

**Objective**: Document Hugo implementation for team

**Documentation to Create**:

1. **Development Setup**
   - Prerequisites
   - Installation steps
   - Local development workflow
   - Build commands

2. **Content Creation Guide**
   - How to create new posts
   - Frontmatter reference
   - Shortcode usage
   - Image guidelines
   - German language conventions

3. **Theme Customization**
   - Color scheme editing
   - Layout modifications
   - Adding new shortcodes
   - Blowfish overrides

4. **Deployment Guide**
   - Build process
   - Deployment steps
   - Environment variables
   - Troubleshooting

5. **Maintenance Guide**
   - Updating Hugo
   - Updating Blowfish
   - Backup procedures
   - Performance monitoring

**Tasks**:
- [ ] Write all documentation
- [ ] Create video tutorials (optional)
- [ ] Document common issues
- [ ] Create FAQ

**Deliverables**:
- [ ] Complete technical documentation
- [ ] Content team guide
- [ ] Maintenance procedures

### 10.2 Training & Knowledge Transfer

**Objective**: Train team on Hugo workflow

**Training Sessions**:

1. **Content Creators**
   - Hugo content structure
   - Markdown syntax
   - Shortcode usage
   - Image optimization
   - Publishing workflow

2. **Developers**
   - Hugo architecture
   - Go templates
   - Theme customization
   - Build pipeline
   - Deployment process

**Training Materials**:
- Step-by-step guides
- Screencasts
- Cheat sheets
- Quick reference cards

**Tasks**:
- [ ] Schedule training sessions
- [ ] Create training materials
- [ ] Conduct hands-on workshops
- [ ] Provide reference materials

**Deliverables**:
- [ ] Team trained
- [ ] Training materials provided
- [ ] Support channels established

---

## Phase 11: Optimization & Refinement (Week 9-10)

### 11.1 Performance Tuning

**Objective**: Fine-tune performance post-migration

**Areas to Optimize**:

1. **Build Performance**
   - Enable caching
   - Optimize image processing
   - Use Hugo modules efficiently
   - Reduce template complexity

2. **Runtime Performance**
   - Minimize JavaScript
   - Optimize critical CSS
   - Implement service worker
   - Configure CDN

3. **SEO Enhancement**
   - Optimize meta tags
   - Improve structured data
   - Enhance internal linking
   - Fix any crawl issues

**Tasks**:
- [ ] Profile build performance
- [ ] Optimize slow templates
- [ ] Review and optimize assets
- [ ] Implement PWA features

**Deliverables**:
- [ ] Performance improvements documented
- [ ] Baseline vs. optimized metrics

### 11.2 Content Enhancements

**Objective**: Improve content presentation

**Enhancements**:
- Related posts algorithm
- Better taxonomy displays
- Enhanced search
- Content recommendations
- Newsletter integration (if desired)

**Tasks**:
- [ ] Implement enhancements
- [ ] Test with real content
- [ ] Gather user feedback

**Deliverables**:
- [ ] Enhanced features live
- [ ] User feedback collected

### 11.3 Analytics & Tracking

**Objective**: Set up comprehensive analytics

**Analytics Setup**:

1. **Google Analytics 4**
   - Page views
   - User engagement
   - Conversion tracking

2. **Plausible/Fathom** (Privacy-focused alternative)

3. **Search Console**
   - Submit sitemap
   - Monitor search performance
   - Fix indexing issues

4. **Performance Monitoring**
   - Real User Monitoring (RUM)
   - Synthetic testing
   - Error tracking

**Tasks**:
- [ ] Set up analytics
- [ ] Configure tracking
- [ ] Create dashboards
- [ ] Set up alerts

**Deliverables**:
- [ ] Analytics fully configured
- [ ] Dashboards created
- [ ] Baseline metrics established

---

## Technical Architecture Details

### Hugo vs Astro: Key Differences

| Aspect | Astro | Hugo |
|--------|-------|------|
| **Language** | JavaScript/TypeScript | Go |
| **Templating** | Astro components (JSX-like) | Go templates |
| **Content** | MDX with components | Markdown with shortcodes |
| **Build Speed** | Fast | Very fast (often faster) |
| **Learning Curve** | Medium (web dev familiar) | Medium (template syntax) |
| **Ecosystem** | NPM packages | Go modules, limited JS |
| **Image Processing** | Sharp (Node.js) | Built-in (Go) |
| **Hydration** | Islands architecture | Static (+ JS if needed) |

### Component to Shortcode Philosophy

**Astro Components**: JavaScript/TypeScript with full programming capabilities
**Hugo Shortcodes**: Template-based, limited logic, focused on presentation

**Migration Strategy**:
- Simple components → Shortcodes
- Complex components → Break down into data + templates
- JavaScript-heavy → Consider alternatives or client-side JS

### Content Structure Comparison

**Astro Content Collections**:
```typescript
// src/content/config.ts
const blog = defineCollection({
  type: 'content',
  schema: z.object({ ... })
});
```

**Hugo Content Organization**:
```
content/
└── blog/
    └── post-name/
        ├── index.md       # Content
        └── images/        # Page resources
```

**Key Difference**: Hugo uses filesystem-based organization, Astro uses JavaScript config.

### Data Layer

**Astro**: Content collections + frontmatter + JavaScript
**Hugo**: Data files (YAML/JSON/TOML) + Page resources + Site data

**Hugo Data Access**:
```go-html-template
{{ .Site.Data.references.author2023 }}
{{ .Page.Resources.GetMatch "image.jpg" }}
{{ .Params.customField }}
```

---

## Risk Assessment & Mitigation

### High Risks

1. **Content Loss During Migration**
   - **Mitigation**: Automated migration scripts, validation, manual spot-checks
   - **Backup**: Keep Astro site intact until full validation

2. **SEO Impact**
   - **Mitigation**: Maintain URL structure, 301 redirects, sitemap submission
   - **Monitoring**: Daily search console checks for first 2 weeks

3. **Broken Functionality**
   - **Mitigation**: Comprehensive testing, feature parity checklist
   - **Rollback**: Keep Astro deployment ready

4. **Performance Regression**
   - **Mitigation**: Performance testing before migration, optimization phase
   - **Monitoring**: Real User Monitoring post-launch

### Medium Risks

1. **Learning Curve for Team**
   - **Mitigation**: Training, documentation, ongoing support

2. **Custom Component Complexity**
   - **Mitigation**: Thorough shortcode development, testing

3. **Build Pipeline Issues**
   - **Mitigation**: Test deployment early, have fallback

### Low Risks

1. **Theme Limitations**
   - **Mitigation**: Blowfish is highly customizable, can override anything

2. **Third-party Service Integration**
   - **Mitigation**: Most services work with any static site

---

## Success Criteria

### Technical Success Metrics

- [ ] All content migrated (100%)
- [ ] All features working (100% parity)
- [ ] Build time < 45 seconds
- [ ] Lighthouse scores > 90 (all categories)
- [ ] Zero broken links
- [ ] Mobile responsiveness perfect
- [ ] Accessibility WCAG 2.1 AA compliant

### Business Success Metrics

- [ ] No traffic drop > 5%
- [ ] Search rankings stable/improved
- [ ] Page load time < Astro baseline
- [ ] User complaints < 5 in first month
- [ ] Content team can publish independently

### User Success Metrics

- [ ] Bounce rate unchanged or better
- [ ] Time on page unchanged or better
- [ ] Search usability maintained
- [ ] Mobile experience maintained

---

## Timeline Summary

| Phase | Duration | Key Deliverables |
|-------|----------|------------------|
| 1. Environment Setup | Week 1 | Hugo installed, Blowfish integrated |
| 2. Content Architecture | Week 1-2 | Directory structure, frontmatter mapping |
| 3. Content Migration | Week 2-3 | All content migrated, validated |
| 4. Theme Customization | Week 3-4 | Custom layouts, color scheme |
| 5. Component Migration | Week 4-5 | Shortcodes developed |
| 6. Feature Parity | Week 5-6 | Search, RSS, i18n, SEO |
| 7. Build Optimization | Week 6-7 | Performance optimization |
| 8. Testing & QA | Week 7-8 | Comprehensive testing |
| 9. Deployment | Week 8 | Production migration |
| 10. Documentation | Week 8-9 | Docs, training |
| 11. Refinement | Week 9-10 | Optimization, analytics |

**Total Timeline**: 10-11 weeks for complete migration

**Minimum Viable Migration**: 6-7 weeks (skip some optimization phases)

---

## Resources & References

### Official Documentation

- **Hugo Documentation**: https://gohugo.io/documentation/
- **Hugo Forums**: https://discourse.gohugo.io/
- **Blowfish Theme**: https://blowfish.page/
- **Blowfish GitHub**: https://github.com/nunocoracao/blowfish

### Tools & Utilities

- **Hugo Extended**: https://github.com/gohugoio/hugo/releases
- **Pagefind**: https://pagefind.app/
- **PostCSS**: https://postcss.org/
- **Tailwind CSS**: https://tailwindcss.com/

### Learning Resources

- **Hugo Tutorial**: https://www.youtube.com/watch?v=qtIqKaDlqXo
- **Blowfish Tutorial**: https://n9o.xyz/posts/202310-blowfish-tutorial/
- **Go Templates**: https://pkg.go.dev/text/template

### Migration Tools

- **Content Migration Script**: TBD (custom script)
- **Link Checker**: https://github.com/wjdp/htmltest
- **Image Optimizer**: Hugo built-in

---

## Next Steps (Immediate Actions)

### Week 1 Kickoff

1. **Environment Setup** (Day 1-2)
   ```bash
   # Install Hugo
   brew install hugo

   # Initialize project
   cd /home/user/gesundes-leben/hugo
   hugo new site . --force

   # Add Blowfish theme
   git submodule add -b main https://github.com/nunocoracao/blowfish.git themes/blowfish

   # Create basic config
   echo 'theme = "blowfish"' >> hugo.toml
   echo 'baseURL = "https://gesundes-leben.vision/"' >> hugo.toml

   # Test
   hugo server
   ```

2. **Directory Structure** (Day 3)
   ```bash
   mkdir -p content/{blog,authors,glossary,pages}
   mkdir -p data/references
   mkdir -p layouts/{_default,blog,partials,shortcodes}
   mkdir -p assets/css
   mkdir -p i18n
   mkdir -p archetypes
   ```

3. **Sample Content Migration** (Day 4-5)
   - Migrate 3-5 blog posts manually
   - Validate frontmatter conversion
   - Test image display
   - Create basic shortcodes

4. **Team Review** (Day 5)
   - Demo Hugo site
   - Review migration approach
   - Gather feedback
   - Adjust plan if needed

### Questions to Resolve Before Starting

1. **Hosting Decision**: Where will Hugo site be deployed?
   - Netlify (recommended)
   - Vercel
   - GitHub Pages
   - Other?

2. **Timeline Flexibility**: Is 10-week timeline acceptable or need faster?

3. **Team Capacity**: Who will work on migration?
   - Developers available?
   - Content team involvement?

4. **Feature Prioritization**: Any features to deprioritize for faster migration?

5. **Testing Environment**: Staging URL for testing?

6. **Analytics**: Keep existing analytics or switch?

7. **Custom Requirements**: Any specific requirements not covered?

---

## Appendices

### Appendix A: Frontmatter Conversion Script

**Script**: `scripts/convert-frontmatter.js`

```javascript
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

function convertFrontmatter(astroFrontmatter) {
  return {
    title: astroFrontmatter.title,
    date: astroFrontmatter.pubDatetime,
    lastmod: astroFrontmatter.modDatetime,
    draft: astroFrontmatter.draft || false,
    author: astroFrontmatter.author,
    description: astroFrontmatter.description,
    keywords: astroFrontmatter.keywords || [],
    categories: astroFrontmatter.categories || [],
    tags: astroFrontmatter.tags || [],
    featured: astroFrontmatter.featured || false,
    params: {
      group: astroFrontmatter.group,
      heroImage: convertImagePath(astroFrontmatter.heroImage?.src),
      heroImageAlt: astroFrontmatter.heroImage?.alt,
      references: astroFrontmatter.references || []
    }
  };
}

function convertImagePath(astroPath) {
  // Convert relative image path to Hugo resource path
  if (!astroPath) return '';
  return astroPath.replace('./images/', 'images/');
}

module.exports = { convertFrontmatter };
```

### Appendix B: Component to Shortcode Reference

| Astro Component | Hugo Shortcode | Parameters |
|----------------|----------------|------------|
| `<Image src= alt= />` | `{{< image src= alt= >}}` | src, alt, position, title, invert |
| `<FeaturedList>` | `{{< featured-list >}}` | (content in .Inner) |
| `<Blockquote author=>` | `{{< blockquote author= >}}` | author, (content in .Inner) |
| `<Accordion title=>` | `{{< accordion title= >}}` | title, (content in .Inner) |
| `<List items=>` | `{{< list >}}` | (content in .Inner) |

### Appendix C: Hugo Configuration Template

**File**: `hugo/hugo.toml`

```toml
baseURL = "https://gesundes-leben.vision/"
title = "Gesundes Leben"
languageCode = "de-DE"
defaultContentLanguage = "de"
theme = "blowfish"
enableRobotsTXT = true
paginate = 12
enableGitInfo = false

[params]
  description = "Dein vertrauenswürdiger Ratgeber für Gesundheit, Ernährung und Wellness."
  author = "Kai Renner"
  timezone = "Europe/Berlin"

[languages]
  [languages.de]
    languageName = "Deutsch"
    weight = 1

[taxonomies]
  category = "categories"
  tag = "tags"
  group = "groups"

[sitemap]
  changefreq = "weekly"
  priority = 0.5

[outputs]
  home = ["HTML", "RSS", "JSON"]
  section = ["HTML", "RSS"]

[minify]
  minifyOutput = true

[build]
  writeStats = true
```

### Appendix D: Recommended VS Code Extensions

- Hugo Language and Syntax Support
- Hugo Helper
- Markdown All in One
- YAML
- Better TOML
- Go Template Support

---

## Conclusion

This action plan provides a comprehensive roadmap for migrating the Gesundes Leben blog from Astro.js to Hugo with the Blowfish theme. The phased approach ensures:

1. **Minimal Risk**: Thorough testing and validation at each stage
2. **Feature Parity**: All existing features preserved or enhanced
3. **Performance**: Optimized build and runtime performance
4. **Maintainability**: Well-documented, easy to maintain
5. **Team Readiness**: Training and documentation for ongoing success

**Key Success Factors**:
- Automated migration scripts to reduce manual errors
- Comprehensive testing before go-live
- Strong documentation for long-term maintenance
- Team training for smooth handoff
- Performance monitoring post-migration

**Estimated Effort**: 10-11 weeks with 1-2 developers

**Next Step**: Review this plan, answer questions in "Questions to Resolve", and begin Week 1 environment setup.

---

**Document Version**: 1.0
**Author**: AI Assistant (Claude)
**Last Updated**: 2025-11-15
**Status**: Draft for Review
