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
bun run test

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
5. **References** (`src/data/references/`): Scientific papers and website references as individual YAML files

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

### Development Principles

**SOLID Principles**: Follow Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, and Dependency Inversion principles in component design and architecture.

**DRY (Don't Repeat Yourself)**: Avoid code duplication by creating reusable components, utilities, and shared configurations.

**Best Practices**: Adhere to industry standards for TypeScript, Astro, and modern web development including proper error handling, performance optimization, and maintainable code structure.

**Logging Standards**: Use the project's logger utility (`src/utils/logger.ts`) instead of console statements in all Astro components, utilities, and server-side code. For standalone Node.js scripts (like performance tests), console.log is acceptable for user-facing output.

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

Optional fields include `group`, `tags`, `description`, `keywords`, `canonicalURL`, `references`

### References System
The project uses a YAML-based references collection stored in individual files in `src/data/references/`:

**YAML File Structure**: Each reference is stored as a separate `.yaml` file with:
- `type`: "journal", "website", "book", "report", or "other"
- `title`: Reference title (required)
- `authors`: Array of author names (required)
- `year`: Publication year as number (required)
- `journal`: Journal name (for journal articles)
- `volume`, `issue`, `pages`: Journal metadata (optional)
- `publisher`, `location`, `edition`, `isbn`: Book metadata (optional)
- `url`: Direct link to source (optional, must be valid URL)
- `doi`: DOI identifier (optional)
- `pmid`: PubMed ID (optional)
- `keywords`: Array of keywords (optional)
- `abstract`: Brief description (optional)

**Reference Naming Schema**: Follow the pattern `year-author-topic-keywords`
- Format: `YYYY-lastname-topic-keywords`
- Example: `2023-smith-nutrition-health`
- Use lowercase, separate words with hyphens
- Keep total length reasonable (under 50 characters)

**Usage in blog posts**: Add reference IDs to the `references` array in frontmatter:
```yaml
references: 
  - "2023-smith-nutrition-health"
  - "2024-jones-mindfulness-meditation-stress"
```

**Example YAML file** (`src/data/references/2023-smith-nutrition-health.yaml`):
```yaml
type: journal
title: "Nutrition and Gut Health: A Comprehensive Review"
authors:
  - "Smith, J."
  - "Johnson, K."
year: 2023
journal: "Journal of Nutrition Research"
volume: 45
issue: 3
pages: "123-145"
doi: "10.1234/jnr.2023.45.3.123"
keywords:
  - "nutrition"
  - "gut health"
  - "microbiome"
abstract: "This study examines the relationship between nutrition and gut health..."
```

### Component Usage for Content Team
The blog uses enhanced Astro components for improved performance, accessibility, and SEO:

**Component Documentation**:
- 📖 Full guide: `docs/component-style-guide.md`
- 🔖 Quick reference: `docs/component-quick-reference.md`

**Key Components**:
- **List**: Enhanced lists with better styling (`@/components/elements/List.astro`)
- **Blockquote**: Professional quotes and expert tips (`@/components/elements/Blockquote.astro`)
- **Accordion**: Collapsible content sections (`@/components/elements/Accordion.astro`)
- **Image**: Responsive, optimized images with multiple styles (`@/components/elements/Image.astro`)

**Content Migration Rules**:
- ❌ Never use markdown images `![alt](image.jpg)`
- ✅ Always use Image component with proper alt text
- ✅ Convert bullet lists to List components
- ✅ Use Blockquote for "Therapeuten Tipp" sections
- ✅ Use Accordion for warnings and collapsible content

### Development Tips
1. Always run type checking before commits (`bun run build`)
2. Use the predefined CATEGORIES constant for blog post categories
3. Images should be placed in the post's folder under `images/`
4. Use enhanced component system for all content (see component docs)
5. German language conventions apply throughout the codebase
6. Add new scientific references to `references.json` for reuse across articles

### Git Workflow
**Commit Strategy**: Commit to git repository (Gitea) after every major step or feature completion. Use detailed, descriptive commit messages that explain the what, why, and impact of changes.