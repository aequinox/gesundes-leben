# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a health-focused blog built with Astro, featuring German content about nutrition, wellness, and lifestyle. The site uses a custom theme with advanced features including multilingual support, search functionality, and sophisticated content management.

## Commands

### Development
```bash
# Start development server
bun run dev

# Build and type-check
bun run build

# Preview production build
bun run preview

# Sync Astro content collections
bun run sync
```

### Testing & Quality
```bash
# Run all tests
bun test

# Run tests with coverage
bun run test:coverage

# Run tests with UI
bun run test:ui

# Run linter
bun run lint

# Check formatting
bun run format:check

# Auto-format code
bun run format
```

### Post-build
```bash
# The postbuild script automatically runs after build to generate search indexes
# It excludes details tags, TOC, and German TOC (Inhaltsverzeichnis) from search
```

## Architecture Overview

### Content Collections Structure
The project uses Astro's content collections for structured content:

1. **Authors** (`src/data/authors/`): Markdown files with author profiles
2. **Blog** (`src/data/blog/`): Main blog posts in MDX format with complex frontmatter
3. **Glossary** (`src/data/glossary/`): Term definitions for health-related concepts
4. **Favorites** (`src/data/favorites/`): YAML files for product recommendations

### Component Architecture
```
src/components/
├── elements/        # Atomic UI components (Button, Badge, H1-H6, etc.)
├── partials/        # Page sections (ArticleHeader, ArticleFooter, etc.)
├── sections/        # Full-width sections (Card, Hero, Footer, etc.)
├── filter/          # Blog filtering components
└── socials/         # Social media integration
```

### Key Technical Patterns

1. **Type Safety**: All components use TypeScript interfaces for props
2. **Performance**: Lazy loading images, AVIF format optimization, view transitions
3. **Accessibility**: ARIA labels, keyboard navigation, screen reader support
4. **Internationalization**: Primary language is German (de-DE)
5. **SEO**: Dynamic OG images, structured data, canonical URLs

### Plugin System

**Remark Plugins** (Markdown processing):
- `remarkReadingTime`: Calculates and adds reading time
- `remarkHashtag`: Processes hashtags in content
- `remarkSectionize`: Wraps sections for styling
- `remarkToc`: Generates table of contents (German: "Inhaltsverzeichnis")
- `remarkCollapse`: Creates collapsible sections

**Rehype Plugins** (HTML processing):
- `rehypeSlug`: Adds IDs to headings
- `rehypeAutolinkHeadings`: Creates accessible anchor links

### Testing Strategy
- Framework: Vitest
- Coverage: v8 provider
- Test files: `**/*.test.ts` or `**/*.spec.ts`
- Path alias: `@` maps to `./src`

### Important Configuration Files
- `src/config.ts`: Site-wide configuration (title, author, SEO settings)
- `astro.config.ts`: Astro build configuration
- `src/content.config.ts`: Content collection schemas
- `tailwind.config.cjs`: Tailwind CSS configuration

### Content Frontmatter Schema
Blog posts require:
- `title`: Post title
- `author`: Author ID reference
- `pubDatetime`: Publication date
- `categories`: Array from predefined list
- `featured`: Boolean for homepage display
- `draft`: Boolean for draft status
- `heroImage`: Object with `src` and `alt`

Optional fields include `group`, `tags`, `description`, `keywords`, `canonicalURL`

### Development Tips
1. Always run type checking before commits (`bun run build`)
2. Use the predefined CATEGORIES constant for blog post categories
3. Images should be placed in the post's folder under `images/`
4. Use responsive image components for performance
5. German language conventions apply throughout the codebase