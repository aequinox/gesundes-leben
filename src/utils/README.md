# Utilities (`src/utils/`)

This directory contains reusable utility functions, helpers, and shared logic for the Gesundes Leben health blog.

## Directory Structure

```
src/utils/
├── linking/          # Internal linking system (consolidated)
│   ├── core.ts       # Core infrastructure (storage, session, validation)
│   ├── scoring.ts    # Link scoring and matching algorithms
│   ├── helpers.ts    # Helper utilities
│   ├── analytics.ts  # Link analytics tracking
│   ├── types.ts      # TypeScript type definitions
│   └── index.ts      # Barrel exports
├── ui/              # UI-related utilities
│   ├── filter/      # Content filtering logic
│   └── TableOfContentsEngine.ts
├── seo/             # SEO utilities
│   └── seo-audit.ts
├── validation/      # Validation utilities
│   └── form-validation.ts
├── image/           # Image processing utilities
│   └── validation.ts
├── viewTransitions/ # View transition utilities
│   └── preloader.ts
├── error-handling/  # Error handling utilities
│   └── shared.ts
└── __tests__/       # Unit tests for utilities
```

## Core Utilities

### Content & Posts
- **`posts.ts`** (588 lines) - Blog post processing and relationships
  - `getRelatedPosts()` - Smart content recommendations
  - `processPosts()` - Batch post processing
  - Post filtering, sorting, and aggregation

- **`postFilter.ts`** - Draft and scheduled post filtering
  - Default export filters posts by draft status and publish time

### References System
- **`references.ts`** (628 lines) - Academic/scientific reference management
  - YAML-based reference loading
  - Citation formatting
  - Reference validation and caching

### Linking System (Consolidated)
> **Note:** Use `@/utils/linking` instead of old files

- **`linking/core.ts`** - Storage, session, data validation
- **`linking/scoring.ts`** - Content matching and relevance scoring
- **`linking/analytics.ts`** - Link performance tracking
- **`linking/helpers.ts`** - Utility functions

**Deprecated (Do Not Use):**
- ~~`internal-linking.ts`~~ → Use `linking/`
- ~~`internal-linking-analytics.ts`~~ → Use `linking/analytics.ts`
- ~~`link-analytics.ts`~~ → Use `linking/analytics.ts`
- ~~`linkValidator.ts`~~ → Use `linking/` validation

### Validation
- **`validation/form-validation.ts`** - Form input validation
- **`propValidation.ts`** - Component prop validation
- **`image/validation.ts`** - Image validation rules

### Data & Formatting
- **`date.ts`** - Date formatting and localization
- **`authors.ts`** - Author data processing
- **`categories.ts`** - Category management
- **`tags.ts`** - Tag processing
- **`slugs.ts`** - URL slug generation
- **`types.ts`** - Shared TypeScript types

### UI & Display
- **`logger.ts`** (414 lines) - Logging service (use instead of console)
- **`pagination.ts`** - Pagination logic
- **`ui/TableOfContentsEngine.ts`** - ToC generation
- **`ui/filter/`** - Content filtering logic

### Performance
- **`load-view-transitions.ts`** - Lazy-load view transition CSS
- **`viewTransitions/preloader.ts`** - Link prefetching
- **`performance/lazy-loading.ts`** - Lazy loading utilities

### SEO
- **`seo/seo-audit.ts`** (622 lines) - SEO analysis and auditing
- **`glossary-linking.ts`** - Automatic glossary term linking

### Error Handling
- **`errors.ts`** - Custom error classes
- **`safeRender.ts`** - Safe rendering with error boundaries
- **`error-handling/shared.ts`** - Shared error handling logic

### Other
- **`componentFactory.ts`** - Component creation utilities
- **`getPath.ts`** - Path resolution
- **`generateOgImages.ts`** - OG image generation
- **`loadGoogleFont.ts`** - Font loading utilities

## Best Practices

### Import Guidelines
```typescript
// ✅ Good - Use barrel exports
import { LinkAnalytics, trackLinkClick } from "@/utils/linking";

// ❌ Bad - Don't import deprecated files
import { LinkAnalytics } from "@/utils/link-analytics";
```

### Logging
```typescript
// ✅ Good - Use logger utility
import { logger } from "@/utils/logger";
logger.info("Processing posts...");

// ❌ Bad - Don't use console
console.log("Processing posts...");
```

### File Size Guidelines (from CLAUDE.md)
- **Maximum:** 200 lines per utility file
- **Current violations:** 34 files exceed limit
- **Refactoring:** Split large files into focused modules

### Code Quality
- Add JSDoc comments for all exported functions
- Include usage examples in JSDoc
- Maintain Single Responsibility Principle
- Write unit tests in `__tests__/` subdirectory

## Testing

Unit tests are located in `__tests__/` subdirectories:
```bash
# Run all utility tests
bun test:unit

# Run specific test file
bun test src/utils/__tests__/posts.test.ts
```

## Common Tasks

### Adding a New Utility
1. Create file in appropriate subdirectory
2. Keep under 200 lines (see guidelines)
3. Add comprehensive JSDoc comments
4. Export from barrel file if in subdirectory
5. Write unit tests
6. Update this README

### Refactoring Large Files
Files exceeding 200 lines should be split:
1. Identify logical groupings
2. Create subdirectory with focused modules
3. Add `index.ts` for barrel exports
4. Update imports across codebase
5. Maintain backward compatibility

## Dependencies

Common dependencies used across utilities:
- **Astro** - Content collections, image optimization
- **Zod** - Schema validation
- **dayjs** - Date manipulation
- **slugify** - URL slug generation

## Contributing

When contributing utilities:
1. Follow TypeScript strict mode
2. Add return type annotations
3. Avoid `any` types (use `unknown` instead)
4. Document all public APIs
5. Keep files focused and small
6. Write tests for new functionality

## Related Documentation
- Component documentation: [`src/components/README.md`](../components/README.md)
- Project guidelines: [`/CLAUDE.md`](/CLAUDE.md)
- Component style guide: [`/docs/component-style-guide.md`](/docs/component-style-guide.md)
