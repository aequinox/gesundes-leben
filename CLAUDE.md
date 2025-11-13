# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **📖 Project Documentation**: For complete project documentation, see [README.md](./README.md)

## Development Principles

### SOLID Principles
Follow Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, and Dependency Inversion principles in component design and architecture.

### DRY (Don't Repeat Yourself)
Avoid code duplication by creating reusable components, utilities, and shared configurations.

### Best Practices
Adhere to industry standards for TypeScript, Astro, and modern web development including proper error handling, performance optimization, and maintainable code structure.

### Logging Standards
Use the project's logger utility (`src/utils/logger.ts`) instead of console statements in all Astro components, utilities, and server-side code. For standalone Node.js scripts (like performance tests), console.log is acceptable for user-facing output.

### Component Size Guidelines
To maintain readability and testability, follow these size limits:

- **Components** (`*.astro`, `*.tsx`): Maximum 300 lines
- **Utility Files** (`src/utils/`): Maximum 200 lines
- **Page Files** (`src/pages/`): Maximum 400 lines
- **Test Files**: Maximum 500 lines

When a file exceeds limits:
1. Extract reusable logic to utilities
2. Split into sub-components
3. Move configuration to separate files
4. Create composition patterns

Example refactorings:
```typescript
// Before: Image.astro (634 lines)
// After:
//   - Image.astro (200 lines) - Main component
//   - utils/image/validation.ts (50 lines)
//   - utils/image/transforms.ts (80 lines)
//   - utils/image/constants.ts (30 lines)

// Before: Card.astro (594 lines)
// After:
//   - Card.astro (259 lines) - Main orchestration
//   - sections/card/CardImage.astro (84 lines)
//   - sections/card/CardContent.astro (96 lines)
//   - sections/card/CardFooter.astro (51 lines)
//   - sections/card/card-styles.css (210 lines)

// Before: ContentSeries.astro (538 lines)
// After:
//   - ContentSeries.astro (182 lines) - Main component
//   - sections/content-series/SeriesItem.astro (42 lines)
//   - sections/content-series/SeriesNavigation.astro (96 lines)
//   - sections/content-series/SeriesProgress.astro (35 lines)
//   - utils/seriesConfig.ts (60 lines) - Configuration data

// Before: BlogFilter.astro (508 lines)
// After:
//   - BlogFilter.astro (249 lines) - Main component
//   - filter/blog-filter/GroupSelector.astro (111 lines)
//   - filter/blog-filter/CategoryFilter.astro (73 lines)
//   - filter/blog-filter/FilterResults.astro (58 lines)
//   - utils/filterConfig.ts (27 lines) - Constants and types
```

**Refactoring Strategy**:
1. Create a subdirectory for complex components (e.g., `sections/card/`)
2. Extract sub-components for distinct UI sections or responsibilities
3. Move configuration and constants to `src/utils/` (e.g., `seriesConfig.ts`, `filterConfig.ts`)
4. Create shared CSS files for component families (e.g., `card-styles.css`)
5. Keep main component as orchestrator, delegating to sub-components

## TypeScript Best Practices

### Type vs Interface Guidelines

**Use `interface` for**:
- Object shapes (especially for component props)
- When you expect consumers to extend/implement
- Public APIs

**Use `type` for**:
- Union types (`type Status = "pending" | "active"`)
- Intersection types
- Mapped types and conditional types
- Primitive aliases (`type ID = string`)
- Tuples

Examples:
```typescript
// ✅ Good
interface BlogPostProps {
  title: string;
  author: Author;
}

type PostStatus = "draft" | "published" | "archived";
type ID = string;

// ❌ Avoid
type BlogPostProps = {  // Use interface instead
  title: string;
}
```

## Component Usage for Content Team

The blog uses enhanced Astro components for improved performance, accessibility, and SEO:

**Component Documentation**:
- 📖 Full guide: `docs/component-style-guide.md`
- 🔖 Quick reference: `docs/component-quick-reference.md`

**Content Migration Rules**:
- ❌ Never use markdown images `![alt](image.jpg)`
- ✅ Always use Image component with proper alt text
- ✅ Convert bullet lists to List components
- ✅ Use Blockquote for "Therapeuten Tipp" sections
- ✅ Use Accordion for warnings and collapsible content

## Performance Optimization Guidelines

### Lazy Loading Patterns
- **View Transitions CSS**: Lazy loaded on first navigation via `src/utils/load-view-transitions.ts`
  - Reduces initial bundle by ~8KB
  - Loaded via 'astro:before-preparation' event
- **Images**: Use native lazy loading with `loading="lazy"` attribute
- **Components**: Consider dynamic imports for below-the-fold components

### Font Optimization
- **Custom @font-face declarations** in `src/styles/fonts.css`
  - Use `font-display: swap` to prevent FOIT (Flash of Invisible Text)
  - Improves First Contentful Paint (FCP) metrics
- **Preload critical fonts** in Layout.astro:
  ```html
  <link rel="preload" href="/src/assets/fonts/Poppins-400.woff2" as="font" type="font/woff2" crossorigin />
  ```
- **Disable experimental Astro fonts** - Use custom loading for better control

### Image Guidelines
- **Maximum file size**: 1MB (enforced by pre-commit hook)
- **Optimization command**: `bun run images:optimize`
- **Format preference**: WebP for modern browsers, JPEG fallback
- **Placement**: Store in post-specific folders under `images/`

## Internationalization (i18n)

The project uses a modular translation file structure:

**File Organization**:
- `src/i18n/ui.ts` - Type definitions and language registry (275 lines)
- `src/i18n/languages/en.ts` - English translations (279 lines)
- `src/i18n/languages/de.ts` - German translations (280 lines)

**Adding New Languages**:
1. Create `src/i18n/languages/[lang].ts` with all required translation keys
2. Import and add to `ui` object in `src/i18n/ui.ts`
3. Update `languages` and `defaultLang` constants if needed

**Translation Key Structure**:
```typescript
export const de: UITranslations = {
  "nav.skipToContent": "Zum Inhalt springen",
  "nav.about": "Über uns",
  // ... more keys
};
```

## Development Tips

1. Always run type checking before commits (`bun run build`)
2. Use the predefined CATEGORIES constant for blog post categories
3. Images should be placed in the post's folder under `images/`
4. Use enhanced component system for all content (see component docs)
5. German language conventions apply throughout the codebase
6. Add new scientific references as individual YAML files in `src/data/references/` for reuse across articles
7. Optimize images before committing - pre-commit hook will enforce 1MB limit

## Git Workflow

**Commit Strategy**: Commit to git repository (Gitea) after every major step or feature completion. Use detailed, descriptive commit messages that explain the what, why, and impact of changes.

**Pre-commit Hooks**: The repository uses Husky for pre-commit validation:
- **Image Size Check**: Prevents committing images larger than 1MB
  - Scans: `.jpg`, `.jpeg`, `.png`, `.webp` files in `src/data/blog`
  - Error message includes file names, sizes, and optimization command
  - Configure in: `.husky/pre-commit`
- **Lint Staged**: Runs linters on staged files (via `lint-staged`)

## References System Implementation

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
