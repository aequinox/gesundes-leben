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

Example refactoring:
```typescript
// Before: Image.astro (634 lines)
// After:
//   - Image.astro (200 lines) - Main component
//   - utils/image/validation.ts (50 lines)
//   - utils/image/transforms.ts (80 lines)
//   - utils/image/constants.ts (30 lines)
```

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

## Development Tips

1. Always run type checking before commits (`bun run build`)
2. Use the predefined CATEGORIES constant for blog post categories
3. Images should be placed in the post's folder under `images/`
4. Use enhanced component system for all content (see component docs)
5. German language conventions apply throughout the codebase
6. Add new scientific references as individual YAML files in `src/data/references/` for reuse across articles

## Git Workflow

**Commit Strategy**: Commit to git repository (Gitea) after every major step or feature completion. Use detailed, descriptive commit messages that explain the what, why, and impact of changes.

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
