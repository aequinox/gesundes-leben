# TODO: Codebase Improvements & Enhancements

> **Generated:** 2025-11-17
> **Purpose:** Comprehensive improvement roadmap for code quality, maintainability, design, and best practices

---

## Table of Contents

1. [Critical Priority](#critical-priority) - Must fix immediately
2. [High Priority](#high-priority) - Should fix soon
3. [Medium Priority](#medium-priority) - Important improvements
4. [Low Priority](#low-priority) - Nice to have
5. [New Features (Blowfish-Inspired)](#new-features-blowfish-inspired) - Enhanced capabilities
6. [Architecture & Refactoring](#architecture--refactoring) - Long-term improvements

---

## Critical Priority

### 🚨 Accessibility Violations

**Issue:** 20+ blog posts contain empty alt text (`alt=""`), violating WCAG accessibility standards.

**Files Affected:**
- `src/data/blog/2024-11-04-hoffnungstraeger-spermidin/index.mdx`
- `src/data/blog/2024-02-28-4-regeln-fuer-ein-gutes-selbstwertgefuehl/index.mdx`
- `src/data/blog/2024-02-02-stoer-mich-nicht-in-meiner-krise/index.mdx`
- `src/data/blog/2023-12-18-wie-entsteht-krankheit/index.mdx`
- And 16+ more blog posts

**Action Items:**
- [ ] Audit all blog post images for missing or empty alt text
- [ ] Add descriptive alt text to all images (describe the image content)
- [ ] Create pre-commit hook to prevent empty alt text in new posts
- [ ] Add linting rule to catch `alt=""` in MDX files
- [ ] Document alt text best practices in contributor guide

**Resources:**
- [WCAG Alt Text Guidelines](https://www.w3.org/WAI/tutorials/images/)
- See existing good examples in recent blog posts

---

### 🔒 Security Review

**Issue:** innerHTML usage detected in 3 files, potential XSS vulnerability.

**Files Affected:**
- `src/utils/ui/TableOfContentsEngine.ts`
- `src/pages/search.astro`
- `src/components/sections/Navigation.astro`

**Action Items:**
- [ ] Review innerHTML usage in `TableOfContentsEngine.ts` - ensure content is sanitized
- [ ] Review innerHTML in `search.astro` - verify Pagefind output is safe
- [ ] Review innerHTML in `Navigation.astro` - ensure no user input flows to it
- [ ] Consider implementing DOMPurify for HTML sanitization
- [ ] Add security testing for XSS vulnerabilities
- [ ] Document safe HTML handling practices

**Recommendation:**
```typescript
// Before (potential XSS risk):
element.innerHTML = userContent;

// After (safe):
import DOMPurify from 'isomorphic-dompurify';
element.innerHTML = DOMPurify.sanitize(userContent);

// Or better (no innerHTML):
element.textContent = userContent;
```

---

## High Priority

### 📏 Component Size Violations

**Issue:** 15 components exceed the 300-line limit defined in CLAUDE.md.

#### Critical Violations (>400 lines)

**Files requiring immediate refactoring:**

1. **`src/components/elements/TagCloud.astro`** - 497 lines (197 over limit)
   - [ ] Extract tag rendering logic to `TagCloudItem.astro`
   - [ ] Move tag calculations to `src/utils/tag-calculations.ts`
   - [ ] Extract styles to `src/styles/components/tag-cloud.css`
   - [ ] Create `src/utils/tagCloudConfig.ts` for constants

2. **`src/components/elements/ErrorBoundary.astro`** - 495 lines (195 over limit)
   - [ ] Split error types into separate components (`ErrorMessage.astro`, `ErrorFallback.astro`)
   - [ ] Move error handling logic to `src/utils/error-handling/boundary.ts`
   - [ ] Extract error tracking to dedicated utility
   - [ ] Create error template components

3. **`src/components/partials/ArticleSidebar.astro`** - 480 lines (180 over limit)
   - [ ] Extract TOC to `partials/sidebar/TableOfContents.astro`
   - [ ] Extract related posts to `partials/sidebar/RelatedPosts.astro`
   - [ ] Extract social share to `partials/sidebar/SocialShare.astro`
   - [ ] Create sidebar configuration file

4. **`src/components/elements/Image.astro`** - 474 lines (174 over limit)
   - [ ] Move validation logic to `src/utils/image/validation.ts`
   - [ ] Extract transform logic to `src/utils/image/transforms.ts`
   - [ ] Move srcset generation to `src/utils/image/srcset.ts`
   - [ ] Create `src/utils/image/constants.ts` for breakpoints

5. **`src/components/sections/TopicCluster.astro`** - 463 lines (163 over limit)
   - [ ] Extract cluster item to `sections/topic-cluster/ClusterItem.astro`
   - [ ] Create `sections/topic-cluster/ClusterNavigation.astro`
   - [ ] Move cluster logic to `src/utils/topicClusterEngine.ts`
   - [ ] Extract styles to separate CSS file

6. **`src/components/seo/SEO.astro`** - 441 lines (141 over limit)
   - [ ] Split into `seo/MetaTags.astro`, `seo/OpenGraph.astro`, `seo/TwitterCard.astro`
   - [ ] Extract JSON-LD to `seo/StructuredData.astro`
   - [ ] Move SEO logic to `src/utils/seo/meta-builder.ts`

7. **`src/components/elements/ContextualLinks.astro`** - 418 lines (118 over limit)
   - [ ] Extract link types to separate components
   - [ ] Move link logic to utility file
   - [ ] Create link template components

8. **`src/components/sections/PillarNavigation.astro`** - 411 lines (111 over limit)
   - [ ] Extract navigation items to sub-components
   - [ ] Move navigation logic to utility
   - [ ] Create navigation configuration

9. **`src/components/elements/InternalLink.astro`** - 400 lines (100 over limit)
   - [ ] Split link types into separate components
   - [ ] Extract validation to utility
   - [ ] Create link builder utility

#### Major Violations (301-400 lines)

10. **`src/components/seo/WebsiteSchema.astro`** - 349 lines
    - [ ] Split schema types into separate files
    - [ ] Move schema generation to `src/utils/seo/SchemaBuilder.ts` (already exists, use it!)

11. **`src/components/elements/FeaturedList.astro`** - 348 lines
    - [ ] Extract list item to sub-component
    - [ ] Move filtering logic to utility

12. **`src/components/sections/List.astro`** - 339 lines
    - [ ] Extract list variants to separate components
    - [ ] Create list configuration utility

13. **`src/components/partials/RelatedPosts.astro`** - 313 lines
    - [ ] Extract post card to sub-component
    - [ ] Move related post logic to utility

14. **`src/components/sections/Navigation.astro`** - 309 lines
    - [ ] Split desktop/mobile navigation
    - [ ] Extract nav items to separate components

15. **`src/components/elements/Badge.astro`** - 309 lines
    - [ ] Extract badge variants to separate components
    - [ ] Move badge logic to utility

---

### 📐 Utility Size Violations

**Issue:** 21 utility files significantly exceed the 200-line limit.

#### Severe Violations (>500 lines)

1. **`src/utils/references.ts`** - 630 lines (430 over limit!)
   - [ ] Split into:
     - `src/utils/references/loader.ts` - Load references
     - `src/utils/references/formatter.ts` - Format citations
     - `src/utils/references/validator.ts` - Validate references
     - `src/utils/references/cache.ts` - Caching logic
     - `src/utils/references/types.ts` - Type definitions

2. **`src/utils/seo/seo-audit.ts`** - 622 lines (422 over limit)
   - [ ] Split into:
     - `src/utils/seo/audit/meta-audit.ts`
     - `src/utils/seo/audit/content-audit.ts`
     - `src/utils/seo/audit/performance-audit.ts`
     - `src/utils/seo/audit/report-generator.ts`

3. **`src/utils/internal-linking.ts`** - 607 lines (407 over limit)
   - [ ] Split into:
     - `src/utils/linking/internal/link-finder.ts`
     - `src/utils/linking/internal/link-builder.ts`
     - `src/utils/linking/internal/anchor-generator.ts`
     - `src/utils/linking/internal/context-analyzer.ts`

4. **`src/utils/validation/form-validation.ts`** - 595 lines (395 over limit)
   - [ ] Split by validation type:
     - `src/utils/validation/email-validator.ts`
     - `src/utils/validation/url-validator.ts`
     - `src/utils/validation/field-validator.ts`
     - `src/utils/validation/schema-validator.ts`

5. **`src/utils/posts.ts`** - 588 lines (388 over limit)
   - [ ] Split into:
     - `src/utils/posts/fetcher.ts` - Fetch posts
     - `src/utils/posts/filter.ts` - Filter logic
     - `src/utils/posts/sorter.ts` - Sort logic
     - `src/utils/posts/transformer.ts` - Transform post data
     - `src/utils/posts/pagination.ts` - Pagination logic

6. **`src/utils/ui/TableOfContentsEngine.ts`** - 562 lines (362 over limit)
   - [ ] Split into:
     - `src/utils/ui/toc/parser.ts`
     - `src/utils/ui/toc/renderer.ts`
     - `src/utils/ui/toc/navigation.ts`
     - `src/utils/ui/toc/types.ts`

7. **`src/utils/propValidation.ts`** - 560 lines (360 over limit)
   - [ ] Split by component type or validation category
   - [ ] Create validators directory structure

8. **`src/utils/seo/SchemaBuilder.ts`** - 533 lines (333 over limit)
   - [ ] Split by schema type:
     - `src/utils/seo/schema/article-schema.ts`
     - `src/utils/seo/schema/website-schema.ts`
     - `src/utils/seo/schema/person-schema.ts`
     - `src/utils/seo/schema/organization-schema.ts`

9. **`src/utils/ui/AccordionEngine.ts`** - 529 lines (329 over limit)
   - [ ] Split into:
     - `src/utils/ui/accordion/state-manager.ts`
     - `src/utils/ui/accordion/renderer.ts`
     - `src/utils/ui/accordion/accessibility.ts`

10. **`src/utils/link-analytics.ts`** - 502 lines (302 over limit)
    - [ ] Split into:
      - `src/utils/analytics/link-tracker.ts`
      - `src/utils/analytics/event-logger.ts`
      - `src/utils/analytics/report-generator.ts`

#### Critical Violations (300-500 lines)

11. **`src/utils/seo/german-seo-optimization.ts`** - 497 lines
    - [ ] Split by optimization type (meta, content, technical)

12. **`src/utils/error-handling/error-boundary-utils.ts`** - 456 lines
    - [ ] Split by error type and handler

13. **`src/utils/linking/analytics.ts`** - 453 lines
    - [ ] Merge with or split from link-analytics.ts (duplication?)

14. **`src/utils/glossary-linking.ts`** - 448 lines
    - [ ] Split into term finder, linker, and formatter

15. **`src/utils/error-handling/shared.ts`** - 443 lines
    - [ ] Split by error category

16. **`src/utils/seo/enhanced-sitemap.ts`** - 440 lines
    - [ ] Split into builder, validator, and generator

17. **`src/utils/logger.ts`** - 413 lines (213 over limit)
    - [ ] Split into:
      - `src/utils/logger/core.ts`
      - `src/utils/logger/formatters.ts`
      - `src/utils/logger/transports.ts`
      - `src/utils/logger/types.ts`

18. **`src/utils/linking/helpers.ts`** - 404 lines
    - [ ] Split by helper category

19. **`src/utils/safeRender.ts`** - 401 lines
    - [ ] Split rendering strategies

20. **`src/utils/linkValidator.ts`** - 399 lines (borderline)
    - [ ] Consider splitting into internal/external validators

21. **`src/utils/seo/performance-optimization.ts`** - 392 lines
    - [ ] Split by optimization strategy

---

### 🧪 Missing Test Coverage

**Issue:** Low test coverage - only ~22.5% of utilities tested, 0% of components tested.

#### High-Priority Utilities Without Tests

**Critical utilities that need tests immediately:**

- [ ] `src/utils/generateOgImages.ts` - No error handling or tests
- [ ] `src/utils/postFilter.ts` - Core filtering logic untested
- [ ] `src/utils/referenceCache.ts` - Cache logic needs validation
- [ ] `src/utils/internal-linking.ts` - Complex logic needs comprehensive tests
- [ ] `src/utils/glossary-linking.ts` - Term detection needs testing
- [ ] `src/utils/linkValidator.ts` - Validation logic critical
- [ ] `src/utils/pagination.ts` - Pagination math needs tests

#### Component Testing

**Current state:** 0% component test coverage (0 of 96 components tested)

**Recommended testing strategy:**

1. **Priority 1: Core Components (Week 1-2)**
   - [ ] `src/components/elements/Image.astro`
   - [ ] `src/components/elements/Button.astro`
   - [ ] `src/components/elements/InternalLink.astro`
   - [ ] `src/components/sections/Card.astro`
   - [ ] `src/components/sections/Navigation.astro`

2. **Priority 2: Interactive Components (Week 3-4)**
   - [ ] `src/components/sections/Accordion.astro`
   - [ ] `src/components/sections/BlogFilter.astro`
   - [ ] `src/components/search/Search.astro`
   - [ ] `src/components/sections/Favorites.astro`

3. **Priority 3: SEO Components (Week 5-6)**
   - [ ] `src/components/seo/SEO.astro`
   - [ ] `src/components/seo/WebsiteSchema.astro`
   - [ ] `src/components/seo/ArticleSchema.astro`

4. **Priority 4: Remaining Components (Ongoing)**
   - [ ] All elements/* components
   - [ ] All partials/* components
   - [ ] All sections/* components

**Testing Infrastructure Setup:**

- [ ] Set up component testing with Vitest + Testing Library
- [ ] Create component test templates
- [ ] Add visual regression testing (consider Playwright)
- [ ] Set up accessibility testing with axe-core
- [ ] Configure test coverage reporting
- [ ] Set minimum coverage thresholds in CI

---

### ⚡ Error Handling Gaps

**Issue:** Missing error handling in critical functions.

**Files Affected:**

1. **`src/utils/generateOgImages.ts`**
   - [ ] Add try-catch to `generateOgImageForPost()`
   - [ ] Add try-catch to `generateOgImageForSite()`
   - [ ] Add error logging with logger utility
   - [ ] Add fallback for failed image generation
   - [ ] Add JSDoc documentation

2. **`src/utils/slugs.ts`**
   - [ ] Add context to thrown errors
   - [ ] Consider returning Result type instead of throwing
   - [ ] Add validation error messages

**Recommended pattern:**
```typescript
import { withAsyncErrorHandling } from '@/utils/error-handling/shared';
import { logger } from '@/utils/logger';

export const generateOgImageForPost = withAsyncErrorHandling(
  async (post: Post) => {
    // Implementation
  },
  {
    context: 'OG Image Generation',
    fallback: () => '/default-og-image.png'
  }
);
```

---

## Medium Priority

### 📝 TypeScript Best Practices

**Issue:** Type vs Interface violations - should use `interface` for object shapes per CLAUDE.md.

**Files to fix:**

1. **`src/utils/slugs.ts` (Lines 9-16)**
   ```typescript
   // Current (incorrect):
   type SlugifyOptions = {
     lower?: boolean;
     strict?: boolean;
     // ...
   };

   // Should be (correct):
   interface SlugifyOptions {
     lower?: boolean;
     strict?: boolean;
     // ...
   }
   ```
   - [ ] Convert `SlugifyOptions` type to interface

2. **`src/components/elements/Image.astro` (Line 90)**
   ```typescript
   // Current (incorrect):
   type Props = {
     src: string;
     alt: string;
     // ...
   };

   // Should be (correct):
   interface Props {
     src: string;
     alt: string;
     // ...
   }
   ```
   - [ ] Convert component `Props` type to interface

**Guidelines from CLAUDE.md:**
- Use `interface` for object shapes (especially component props)
- Use `type` for unions, intersections, mapped types, primitives
- Use `interface` when you expect consumers to extend/implement

---

### 🎨 Native Image Tag Usage

**Issue:** Some components use native `<img>` tags instead of the optimized Image component.

**Files Affected:**
- `src/components/sections/Navigation.astro`
- `src/components/sections/PageHero.astro`
- `src/components/elements/Blockquote.astro`

**Action Items:**
- [ ] Audit native `<img>` usage in each file
- [ ] Determine if Image component is appropriate for each case
- [ ] Replace with Image component where applicable
- [ ] Document when native `<img>` is acceptable (e.g., icons, SVGs)

---

### 📚 Documentation Gaps

**Issue:** Missing JSDoc comments in some utilities.

**Files Affected:**
- `src/utils/generateOgImages.ts`

**Action Items:**
- [ ] Add JSDoc to all exported functions in `generateOgImages.ts`
- [ ] Add @param and @returns tags
- [ ] Add usage examples
- [ ] Document error conditions

**Example:**
```typescript
/**
 * Generates an Open Graph image for a blog post
 * @param post - The blog post object containing title, author, and metadata
 * @returns Path to the generated OG image
 * @throws {Error} If image generation fails
 * @example
 * ```typescript
 * const imagePath = await generateOgImageForPost(post);
 * ```
 */
export async function generateOgImageForPost(post: Post): Promise<string> {
  // Implementation
}
```

---

### 🔧 ESLint Disable Review

**Issue:** Several files have eslint-disable directives that should be reviewed.

**Files Affected:**
- `src/utils/safeRender.ts` - `@typescript-eslint/no-explicit-any`
- `src/utils/logger.ts` - Various disables
- `src/types/index.ts` - `@typescript-eslint/no-explicit-any`
- `src/utils/og-templates/post-node.js` - Multiple disables
- `src/plugins/remarkPlugins/remark-hashtag.ts` - Disables

**Action Items:**
- [ ] Review each eslint-disable directive
- [ ] Determine if it's still necessary
- [ ] Refactor code to comply with linting rules where possible
- [ ] Document why disables are needed if they must remain
- [ ] Consider using more specific disable comments

---

### ✅ TODO/FIXME Resolution

**Issue:** Outstanding TODO comments in code.

**Files Affected:**
- `src/utils/linking/analytics.ts`

**Action Items:**
- [ ] Search codebase for all TODO/FIXME comments
- [ ] Create issues for each TODO
- [ ] Resolve or remove outdated TODOs
- [ ] Add context to remaining TODOs

**Search command:**
```bash
bun run grep -rn "TODO\|FIXME" src/
```

---

## Low Priority

### 🎯 Code Organization Improvements

**Potential code duplication to investigate:**
- [ ] Review validation patterns across components
- [ ] Check for duplicated logic in SEO utilities
- [ ] Identify repeated configuration patterns
- [ ] Consider creating shared validators/helpers

---

### 🚀 Performance Optimizations

**Potential improvements:**
- [ ] Analyze bundle size with `bun run analyze`
- [ ] Review lazy loading opportunities for below-fold components
- [ ] Investigate code splitting opportunities
- [ ] Consider implementing route-based code splitting
- [ ] Review and optimize Web Vitals (FCP, LCP, CLS)

---

### 📦 Dependency Updates

**Regular maintenance:**
- [ ] Review and update dependencies quarterly
- [ ] Check for security vulnerabilities with `bun audit`
- [ ] Update Astro to latest stable version
- [ ] Update TypeScript to latest version
- [ ] Review and update testing dependencies

---

## New Features (Blowfish-Inspired)

> **Note:** This project uses Astro, not Hugo. Blowfish is a Hugo theme, but we can implement similar functionality using Astro components.

### 🎨 Missing Components (Inspired by Blowfish Shortcodes)

Based on Blowfish's shortcode capabilities, here are suggested new Astro components to enhance the blog:

#### High Priority Components

1. **Alert Component** ✅ (Consider enhancing)
   - [ ] Review current implementation
   - [ ] Add icon variants (info, warning, error, success)
   - [ ] Add dismissible functionality
   - [ ] Add color customization
   - [ ] Add accessibility improvements (ARIA roles)

   **Example usage:**
   ```astro
   <Alert type="warning" icon="alert-triangle" dismissible>
     **Wichtig:** Diese Information sollte beachtet werden.
   </Alert>
   ```

2. **Chart Component** 🆕
   - [ ] Create `src/components/elements/Chart.astro`
   - [ ] Integrate Chart.js or similar library
   - [ ] Support chart types: line, bar, pie, doughnut, radar
   - [ ] Add responsive behavior
   - [ ] Add accessibility (data tables as fallback)

   **Example usage:**
   ```astro
   <Chart
     type="bar"
     data={{
       labels: ['Jan', 'Feb', 'Mar'],
       datasets: [{
         label: 'Vitamin D Levels',
         data: [30, 45, 60]
       }]
     }}
     caption="Vitamin D Spiegel über 3 Monate"
   />
   ```

3. **Timeline Component** 🆕
   - [ ] Create `src/components/sections/Timeline.astro`
   - [ ] Support vertical and horizontal layouts
   - [ ] Add icons and dates
   - [ ] Add responsive mobile view
   - [ ] Perfect for showing health journey or treatment progression

   **Example usage:**
   ```astro
   <Timeline orientation="vertical">
     <TimelineItem date="2024-01" icon="calendar">
       <h3>Diagnose</h3>
       <p>Erste Symptome aufgetreten</p>
     </TimelineItem>
     <TimelineItem date="2024-02" icon="pill">
       <h3>Behandlung begonnen</h3>
       <p>Start der Therapie mit Vitamin D</p>
     </TimelineItem>
   </Timeline>
   ```

4. **Swatches/Color Palette Component** 🆕
   - [ ] Create `src/components/elements/Swatches.astro`
   - [ ] Display color palettes with names and hex codes
   - [ ] Useful for showing food colors, supplement levels, etc.
   - [ ] Add copy-to-clipboard functionality

   **Example usage:**
   ```astro
   <Swatches title="Lebensmittel nach Antioxidantien-Gehalt">
     <Swatch color="#8B4513" label="Kakao" />
     <Swatch color="#800020" label="Beeren" />
     <Swatch color="#228B22" label="Grünkohl" />
   </Swatches>
   ```

5. **Code Importer Component** 🆕
   - [ ] Create `src/components/elements/CodeImporter.astro`
   - [ ] Import code from external URLs or local files
   - [ ] Support syntax highlighting
   - [ ] Support line range selection
   - [ ] Useful for showing recipe code, scripts, etc.

   **Example usage:**
   ```astro
   <CodeImporter
     src="/examples/supplements-calculator.js"
     lang="javascript"
     lines="10-25"
     highlight="15,18"
   />
   ```

6. **Markdown Importer Component** 🆕
   - [ ] Create `src/components/elements/MarkdownImporter.astro`
   - [ ] Import external markdown files
   - [ ] Useful for reusing content across posts
   - [ ] Support frontmatter filtering

   **Example usage:**
   ```astro
   <MarkdownImporter src="/shared/disclaimer.md" />
   ```

7. **TypeIt Animated Text Component** 🆕
   - [ ] Create `src/components/elements/TypeIt.astro`
   - [ ] Integrate TypeIt library for animated text
   - [ ] Add typing effects for emphasis
   - [ ] Useful for hero sections or key statements

   **Example usage:**
   ```astro
   <TypeIt
     strings={["Gesund leben", "Bewusst ernähren", "Aktiv bleiben"]}
     speed={50}
     loop={true}
   />
   ```

8. **YouTube Lite Component** 🆕
   - [ ] Create `src/components/elements/YouTubeLite.astro`
   - [ ] Lazy load YouTube videos
   - [ ] Show thumbnail with play button
   - [ ] Load video player only on click
   - [ ] Improve page performance significantly

   **Example usage:**
   ```astro
   <YouTubeLite
     videoId="dQw4w9WgXcQ"
     title="Vitamin D: Alles was Sie wissen müssen"
     poster="maxresdefault"
   />
   ```

#### Medium Priority Components

9. **GitHub/GitLab Card Component** 🆕
   - [ ] Create `src/components/elements/GitCard.astro`
   - [ ] Display repository info with live stats
   - [ ] Support GitHub, GitLab, Gitea
   - [ ] Useful if blog shares code or tools

10. **KaTeX Math Component** 🆕
    - [ ] Create `src/components/elements/Math.astro`
    - [ ] Render mathematical equations
    - [ ] Support inline and block equations
    - [ ] Useful for scientific articles

    **Example usage:**
    ```astro
    <Math inline>E = mc^2</Math>

    <Math block>
      \frac{d}{dx}\left( \int_{0}^{x} f(u)\,du\right)=f(x)
    </Math>
    ```

11. **Lead Text Component** 🆕
    - [ ] Create `src/components/elements/Lead.astro`
    - [ ] Emphasize introductory paragraphs
    - [ ] Increase font size and weight
    - [ ] Improve readability

    **Example usage:**
    ```astro
    <Lead>
      Vitamin D ist ein essentieller Nährstoff, der eine zentrale Rolle für unsere Gesundheit spielt.
    </Lead>
    ```

12. **Keyword Highlight Component** 🆕
    - [ ] Create `src/components/elements/Keyword.astro`
    - [ ] Highlight important terms
    - [ ] Different from Badge (inline highlighting)
    - [ ] Useful for SEO and readability

    **Example usage:**
    ```astro
    <Keyword>Vitamin D3</Keyword> ist die bioaktive Form.
    ```

#### Low Priority / Nice to Have

13. **Mermaid Diagram Component** (Check if already exists)
    - [ ] Verify if Mermaid is already integrated via remark plugin
    - [ ] If not, create `src/components/elements/Mermaid.astro`
    - [ ] Support flowcharts, sequence diagrams, gantt charts
    - [ ] Useful for showing processes, relationships

14. **Gist Embed Component** 🆕
    - [ ] Create `src/components/elements/Gist.astro`
    - [ ] Embed GitHub Gists
    - [ ] Support specific file selection
    - [ ] Low priority for health blog

---

### 🎨 Enhanced Existing Components

#### Image Component Enhancements
- [ ] Add zoom functionality (like Blowfish Figure shortcode)
- [ ] Add lightbox support for image galleries
- [ ] Add image comparison slider
- [ ] Add loading state placeholder

#### Carousel Component
- [ ] Check if carousel exists, create if not
- [ ] Add auto-scroll functionality
- [ ] Add aspect ratio control
- [ ] Add navigation dots
- [ ] Add swipe gesture support

#### Gallery Component
- [ ] Create if doesn't exist: `src/components/sections/Gallery.astro`
- [ ] Support grid layouts (2, 3, 4 columns)
- [ ] Add masonry layout option
- [ ] Add lightbox integration
- [ ] Perfect for before/after health transformations

---

### 📋 Component Documentation

**Action Items:**
- [ ] Update `docs/component-style-guide.md` with new components
- [ ] Update `docs/component-quick-reference.md`
- [ ] Create example usage for each new component
- [ ] Add component props documentation
- [ ] Create component preview page (like Storybook)

---

## Architecture & Refactoring

### 🏗️ Long-term Architecture Improvements

#### 1. Monorepo Utilities Organization

**Current issue:** Utilities are growing large and complex.

**Proposed structure:**
```
src/utils/
├── analytics/          # Analytics utilities
│   ├── link-tracker.ts
│   ├── event-logger.ts
│   └── index.ts
├── image/              # Image processing
│   ├── validation.ts
│   ├── transforms.ts
│   ├── srcset.ts
│   └── index.ts
├── posts/              # Post management
│   ├── fetcher.ts
│   ├── filter.ts
│   ├── sorter.ts
│   └── index.ts
├── references/         # Reference management
│   ├── loader.ts
│   ├── formatter.ts
│   ├── cache.ts
│   └── index.ts
├── seo/                # SEO utilities
│   ├── audit/
│   ├── schema/
│   ├── optimization/
│   └── index.ts
└── validation/         # Validation utilities
    ├── email-validator.ts
    ├── url-validator.ts
    └── index.ts
```

**Benefits:**
- Better organization and discoverability
- Easier to maintain and test
- Clear module boundaries
- Supports tree-shaking

**Action Items:**
- [ ] Create detailed refactoring plan
- [ ] Refactor one module at a time
- [ ] Update imports across codebase
- [ ] Update tests
- [ ] Update documentation

---

#### 2. Component Library Structure

**Proposed enhancement:**
```
src/components/
├── elements/           # Atomic components (existing)
├── partials/           # Molecular components (existing)
├── sections/           # Organism components (existing)
├── layouts/            # Move to src/layouts/ (already there)
└── templates/          # NEW: Full page templates
    ├── BlogPostTemplate.astro
    ├── LandingPageTemplate.astro
    └── AuthorPageTemplate.astro
```

**Action Items:**
- [ ] Consider creating templates directory for page patterns
- [ ] Document component hierarchy
- [ ] Create component dependency graph

---

#### 3. Design System Documentation

**Current state:** Components exist but no centralized design system docs.

**Action Items:**
- [ ] Create `docs/design-system/` directory
- [ ] Document color system
- [ ] Document typography scale
- [ ] Document spacing system
- [ ] Document component variants
- [ ] Create visual component library (Storybook or similar)

---

#### 4. Content Schema Enhancements

**Current:** Content collections use Zod schemas.

**Potential improvements:**
- [ ] Add schema versioning
- [ ] Add migration scripts for schema changes
- [ ] Add schema validation CLI tool
- [ ] Document schema evolution strategy

---

#### 5. Performance Monitoring

**Current:** Performance budgets defined, but limited monitoring.

**Action Items:**
- [ ] Set up real-user monitoring (RUM)
- [ ] Add performance dashboard
- [ ] Track Core Web Vitals over time
- [ ] Set up alerts for performance regressions
- [ ] Add bundle size monitoring in CI

---

#### 6. Accessibility Enhancements

**Current:** Good foundation, but room for improvement.

**Action Items:**
- [ ] Add axe-core automated testing
- [ ] Conduct manual accessibility audit
- [ ] Add keyboard navigation testing
- [ ] Add screen reader testing
- [ ] Document accessibility patterns
- [ ] Create accessibility checklist for contributors

---

#### 7. Internationalization Expansion

**Current:** German (de) and English (en) supported.

**Potential expansion:**
- [ ] Add French (fr)
- [ ] Add Spanish (es)
- [ ] Add Italian (it)
- [ ] Add Dutch (nl)
- [ ] Create translation workflow
- [ ] Set up translation management system

---

#### 8. Content Management Improvements

**Current:** MDX files with frontmatter.

**Potential improvements:**
- [ ] Consider headless CMS integration (optional)
- [ ] Add content preview functionality
- [ ] Add content scheduling
- [ ] Add draft/review workflow
- [ ] Create content editor guide

---

## Implementation Strategy

### Phase 1: Critical Fixes (Week 1-2)
1. Fix accessibility violations (alt text)
2. Review security concerns (innerHTML)
3. Add error handling to `generateOgImages.ts`
4. Fix TypeScript type/interface violations

### Phase 2: Code Quality (Week 3-6)
1. Refactor top 5 oversized components
2. Refactor top 5 oversized utilities
3. Add tests for critical utilities
4. Set up component testing infrastructure

### Phase 3: New Features (Week 7-10)
1. Implement high-priority Blowfish-inspired components
2. Update documentation
3. Create component examples
4. Add to component library

### Phase 4: Architecture (Week 11-16)
1. Refactor utility structure
2. Improve design system documentation
3. Add performance monitoring
4. Conduct accessibility audit

### Phase 5: Ongoing Maintenance
1. Continue adding tests to reach 80% coverage
2. Regular dependency updates
3. Performance monitoring and optimization
4. Content and component library expansion

---

## Metrics & Success Criteria

### Code Quality Metrics
- [ ] Component size: 0 violations (currently 15)
- [ ] Utility size: 0 violations (currently 21)
- [ ] Test coverage: >80% (currently ~22.5% utilities, 0% components)
- [ ] Accessibility: 0 WCAG violations (currently 20+ alt text issues)
- [ ] TypeScript: 0 `any` types outside of tests (currently 3 files)
- [ ] Security: 0 innerHTML without sanitization (currently 3 files)

### Performance Metrics
- [ ] First Contentful Paint: <1.5s (current: <2s)
- [ ] Largest Contentful Paint: <2.0s (current: <2.5s)
- [ ] Cumulative Layout Shift: <0.05 (current: <0.1)
- [ ] Bundle size: <200KB (gzipped)

### Feature Completeness
- [ ] 8+ new Blowfish-inspired components implemented
- [ ] Component documentation 100% complete
- [ ] Design system documented
- [ ] Accessibility audit passed

---

## Resources

### Internal Documentation
- `docs/component-style-guide.md` - Component usage guide
- `docs/component-quick-reference.md` - Quick reference
- `CLAUDE.md` - Development principles and guidelines
- `docs/performance-optimization-report.md` - Performance strategies

### External Resources
- [Astro Documentation](https://docs.astro.build/)
- [Blowfish Theme](https://blowfish.page/docs/) - Inspiration for features
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/)
- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/docs/astro-testing-library/intro/)

---

## Contributing

When working on items from this TODO:

1. **Create an issue** for the task if one doesn't exist
2. **Create a feature branch** following convention: `feature/ISSUE-description`
3. **Follow CLAUDE.md guidelines** for code style and structure
4. **Add tests** for new functionality
5. **Update documentation** as needed
6. **Run quality checks** before committing:
   ```bash
   bun run quality:check
   ```
7. **Commit with descriptive messages** following git workflow in CLAUDE.md
8. **Create PR** with clear description and link to issue

---

## Notes

- This TODO is a living document and should be updated as progress is made
- Priorities may shift based on business needs and user feedback
- Regular reviews (monthly) recommended to reassess priorities
- Consider creating GitHub issues for major tasks for better tracking

---

**Last Updated:** 2025-11-17
**Generated by:** Claude Code Analysis
**Next Review:** 2025-12-17
