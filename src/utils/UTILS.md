# Utilities Documentation

This directory contains utility functions and modules used throughout the application. Each utility is designed with specific responsibilities following SOLID principles.

## Table of Contents

- [Animation](#animation)
- [Content Management](#content-management)
- [Date Handling](#date-handling)
- [Image Generation](#image-generation)
- [Navigation](#navigation)
- [Post Management](#post-management)
- [Reference Management](#reference-management)
- [Theme Management](#theme-management)

## Animation

### `aos.ts`

Handles Animate On Scroll functionality with configurable options.

**Key Features:**

- Configurable animation settings
- Debounced refresh mechanism
- Type-safe configuration

**Usage Example:**

```typescript
import { aosInit, refreshAOS } from "./utils/aos";

// Initialize with default settings
aosInit();

// Custom configuration
aosInit({
  duration: 1000,
  easing: "ease-in-out",
  once: true,
});
```

## Image Generation

### `generateOgImages.tsx`

Generates OpenGraph images for blog posts and site content.

**Key Features:**

- Customizable image dimensions
- Multiple fit modes
- Font loading support
- Error handling

**Usage Example:**

```typescript
import { generateOgImageForPost } from "./utils/generateOgImages";

const image = await generateOgImageForPost(post, {
  width: 1200,
  height: 630,
  background: "#ffffff",
});
```

## Date Handling

### `getFormattedDate.ts`

Provides date formatting utilities with locale support.

**Key Features:**

- Cached formatters for performance
- Locale-aware formatting
- Multiple format options

**Usage Example:**

```typescript
import { formatDate, formatTime } from "./utils/getFormattedDate";

const date = formatDate("2024-02-24");
const time = formatTime("2024-02-24T15:30:00");
```

## Post Management

### `getPostsBy.ts`, `getPostsWithRT.ts`, `getSortedPosts.ts`

Collection of utilities for post filtering, sorting, and management.

**Key Features:**

- Category and tag filtering
- Reading time calculation
- Sort by publication date
- Draft post handling

**Usage Example:**

```typescript
import { getPostsByTag, getPostsByCategory } from "./utils/getPostsBy";

const tagPosts = await getPostsByTag(posts, "typescript");
const categoryPosts = await getPostsByCategory(posts, "tutorial");
```

## Reference Management

### `references.ts`

Comprehensive academic reference management system.

**Key Features:**

- Multiple citation styles (APA, MLA, Harvard)
- Reference sorting and filtering
- Validation system
- Group management

**Usage Example:**

```typescript
import { formatCitation, CitationStyle } from "./utils/references";

const citation = formatCitation(reference, CitationStyle.APA);
```

## Theme Management

### `theme.ts`

Handles theme switching and persistence.

**Key Features:**

- System preference detection
- Theme persistence
- Event-driven updates
- Automatic meta color updates

**Usage Example:**

```typescript
import { themeManager } from "./utils/theme";

themeManager.initThemeFeature();
themeManager.toggleTheme();
```

## Best Practices

1. **Error Handling**

   - All utilities implement comprehensive error handling
   - Errors are properly typed and documented
   - Error messages are descriptive and actionable

2. **Performance**

   - Implement caching where appropriate
   - Use memoization for expensive operations
   - Optimize loops and data structure operations

3. **Type Safety**

   - Leverage TypeScript's type system
   - Use strict type checking
   - Implement proper type guards

4. **Testing**
   - Each utility has corresponding test files
   - Cover edge cases and error conditions
   - Maintain high test coverage

## Contributing

When adding or modifying utilities:

1. Follow the established documentation pattern
2. Add comprehensive JSDoc comments
3. Include usage examples
4. Update this documentation
5. Add appropriate tests
6. Follow SOLID principles
7. Consider performance implications

## Performance Considerations

- Use appropriate data structures
- Implement caching for expensive operations
- Consider memory usage
- Profile performance critical code
- Document performance characteristics

## Error Handling Strategy

All utilities follow a consistent error handling approach:

1. Validate inputs early
2. Use typed error classes
3. Provide descriptive error messages
4. Include recovery suggestions
5. Log errors appropriately

## Maintenance

Regular maintenance tasks:

1. Review and update documentation
2. Check for deprecated dependencies
3. Update type definitions
4. Optimize performance
5. Add new tests as needed
