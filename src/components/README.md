# Components (`src/components/`)

This directory contains all Astro components for the Gesundes Leben health blog, organized by hierarchy and purpose.

## Directory Structure

```
src/components/
├── elements/        # Atomic design elements
├── partials/        # Reusable partial components
├── sections/        # Page sections and complex components
├── layout/          # Layout components
├── seo/             # SEO-related components
├── search/          # Search functionality components
├── filter/          # Content filtering components
├── socials/         # Social media components
└── types/           # TypeScript type definitions
```

## Component Hierarchy

### Elements (Atomic Components)
Small, reusable UI primitives that form the foundation of larger components.

**Typography:**
- `H.astro` - Base heading component (h1-h6) with variants
- `H1.astro` through `H6.astro` - Semantic heading wrappers
- `Paragraph.astro` - Styled paragraph component

**Navigation:**
- `Button.astro` (259 lines) - Flexible button with variants, icons, loading states
- `LinkButton.astro` - Button styled as link (consider using Button with href)
- `InternalLink.astro` - Enhanced internal links with analytics
- `BackButton.astro` - Smart back navigation with sessionStorage

**Content:**
- `Image.astro` (474 lines) - Responsive image with optimization
- `Blockquote.astro` (238 lines) - Quote blocks with variants (therapist tip, expert)
- `Hr.astro` - Horizontal rule component
- `ArrowIcon.astro` - Arrow icon component

**UI Elements:**
- `Badge.astro` (283 lines) - Label/status badges with 7 variants
- `Icon.astro` - Icon wrapper component
- `LoadingSpinner.astro` - Loading state indicator
- `ThemeToggle.astro` - Dark/light mode switcher
- `ErrorBoundary.astro` (495 lines) - Error boundary wrapper

**Lists & Organization:**
- `FeaturedList.astro` - Featured content list
- `BadgeGroup.astro` - Group of badges
- `TagCloud.astro` (497 lines) - Tag cloud display
- `SectionHeading.astro` - Section title component

**Special:**
- `ContextualLinks.astro` - Context-aware link suggestions
- `GlossaryAutoLinker.astro` - Automatic glossary term linking

### Partials (Reusable Sections)
Medium-sized components that combine elements into functional units.

**Article Components:**
- `ArticleMeta.astro` - Post metadata display
- `ArticleSidebar.astro` (478 lines) - Sidebar with ToC, sharing, related posts
- `ArticleProgressBar.astro` - Reading progress indicator
- `ArticleFooter.astro` - Article footer with references
- `Author.astro` - Author bio display
- `Datetime.astro` - Formatted date/time display
- `ReadingTime.astro` - Estimated reading time
- `References.astro` - Reference citations list
- `RelatedPosts.astro` - Related content recommendations

**Navigation:**
- `Head.astro` - HTML head metadata

### Sections (Complex Components)
Large, feature-rich components that typically make up major page sections.

**Navigation:**
- `Header.astro` - Site header with navigation
- `Footer.astro` - Site footer
- `Navigation.astro` (309 lines) - Main navigation menu
- `MegaMenu.astro` - Expanded navigation menu
- `Pagination.astro` (Basic - 46 lines, Advanced - 218 lines) - Page navigation
- `Modal.astro` - Modal dialog component

**Content Display:**
- `HeroSection.astro` - Page hero/banner
- `PageHero.astro` - Page-specific hero
- `Headline.astro` - Large headline component
- `CallToAction.astro` - CTA sections
- `Features.astro` - Feature showcase
- `List.astro` (339 lines) - Content list display
- `ListColumn.astro` - Columnar list layout
- `ItemGrid.astro` - Grid layout for items
- `Accordion.astro` - Collapsible content sections

**Blog & Content:**
- `TopicCluster.astro` (463 lines) - Topic clustering display
- `PillarNavigation.astro` (411 lines) - Pillar content navigation
- `CrossClusterLinks.astro` - Cross-topic linking
- `ArchiveYearGroup.astro` - Yearly archive grouping
- `ArchiveMonthGroup.astro` - Monthly archive grouping
- `Favorites.astro` - Favorite items display

**Special:**
- `MeiroEmbed.astro` - Third-party embed component

### Layout
- `SectionContainer.astro` - Section wrapper with consistent spacing

### SEO Components
- `SEO.astro` - Main SEO meta tags
- `WebsiteSchema.astro` - Schema.org structured data
- `HealthArticleSchema.astro` - Health article schema
- `BreadcrumbSchema.astro` - Breadcrumb schema
- `types.ts` - SEO-related types

### Search Components
- `SearchContainer.astro` - Search UI container
- `SearchLoadingSkeleton.astro` - Loading state for search
- `SearchKeyboardShortcuts.astro` - Keyboard shortcuts display

### Other Components
- `SizeIndicator.astro` - File/content size indicator
- `ShareLinks.astro` - Social sharing buttons
- `Pagination.astro` (Basic version) - Simple pagination

## Component Types

### Type Definitions (`types/`)
Shared TypeScript interfaces and types for components:
- `base.ts` - Base component props
- `button.ts` - Button-related types
- `callToAction.ts` - CTA types
- `css.ts` - CSS-related types
- `features.ts` - Feature component types
- `grid.ts` - Grid layout types
- `headline.ts` - Headline types
- `icon.ts` - Icon types
- `index.ts` - Barrel exports
- `item.ts` - List item types
- `media.ts` - Media types
- `navigation.ts` - Navigation types
- `pagination.ts` - Pagination types
- `widget.ts` - Widget types

## File Size Guidelines (from CLAUDE.md)

**Maximum:** 300 lines per component

**Files Exceeding Limit (14 total):**
1. TagCloud.astro (497 lines) - +197 over
2. ErrorBoundary.astro (495 lines) - +195 over
3. ArticleSidebar.astro (478 lines) - +178 over
4. Image.astro (474 lines) - +174 over
5. TopicCluster.astro (463 lines) - +163 over
6. PillarNavigation.astro (411 lines) - +111 over
7. List.astro (339 lines) - +39 over
8. Navigation.astro (309 lines) - +9 over

**Refactoring Strategy:**
- Extract sub-components to `sections/[component-name]/` subdirectory
- Move business logic to utilities
- Extract configuration to separate files
- Create shared CSS files

## Best Practices

### Component Documentation
All components should include JSDoc comments:
```astro
---
/**
 * Component Name
 *
 * Brief description of what the component does.
 *
 * Features:
 * - Feature 1
 * - Feature 2
 *
 * Usage:
 * ```astro
 * <ComponentName prop="value" />
 * ```
 *
 * @component
 */
export interface Props {
  /** Prop description */
  prop: string;
}
---
```

### Props Interface
- Always define Props interface
- Add JSDoc comments for each prop
- Use `type` for unions, `interface` for objects
- Mark optional props with `?`

### Component Size
- Keep components under 300 lines
- Extract complex logic to utilities
- Split into sub-components when needed
- Move configuration to separate files

### Styling
- Use Tailwind CSS utilities
- Scope styles with `<style>` blocks
- Extract repeated patterns to CSS files
- Support dark mode where appropriate

### Accessibility
- Include proper ARIA labels
- Ensure keyboard navigation
- Provide screen reader text
- Validate with accessibility tools

## Common Patterns

### AriaLabel Pattern
Many components use this pattern for accessibility:
```astro
const { "aria-label": ariaLabelAttr, ariaLabel, ...rest } = Astro.props;
const finalAriaLabel = ariaLabelAttr || ariaLabel;
```

### GroupType Usage
Components using group-based content organization (pro/contra/fragezeiten):
- Card.astro
- CardImage.astro
- FilterState.ts

> **Note:** Consider extracting to `src/components/types/group.ts`

### Slot Usage
```astro
<Component>
  <slot /> <!-- Default slot -->
  <slot name="header" /> <!-- Named slot -->
</Component>
```

## Component Examples

### Simple Element
```astro
<Badge text="New" variant="primary" />
<H2>Section Title</H2>
```

### Complex Section
```astro
<TopicCluster
  clusterId="mental-health"
  posts={clusterPosts}
  showRelated={true}
/>
```

### With Slots
```astro
<Blockquote variant="therapist">
  This is expert advice from a therapist.
</Blockquote>
```

## Testing

Component tests use Vitest:
```bash
# Run component tests
bun test:component

# Run specific component test
bun test src/components/__tests__/Button.test.ts
```

## Common Tasks

### Adding a New Component
1. Choose appropriate directory (elements/partials/sections)
2. Create `.astro` file
3. Add JSDoc documentation
4. Define Props interface
5. Keep under 300 lines
6. Write tests if complex
7. Update this README

### Refactoring Large Components
When a component exceeds 300 lines:
1. Create subdirectory: `sections/[component-name]/`
2. Extract sub-components
3. Move business logic to utilities
4. Create shared CSS file if needed
5. Update imports
6. Maintain backward compatibility

### Using Existing Components
1. Check component documentation (JSDoc)
2. Review usage examples
3. Import from correct path
4. Pass required props
5. Test in different contexts

## Documentation Resources

- **Quick Reference:** `/docs/component-quick-reference.md`
- **Style Guide:** `/docs/component-style-guide.md`
- **Refactoring Guide:** `/docs/component-refactoring-guide.md`
- **Project Guidelines:** `/CLAUDE.md`

## Related
- Utilities: [`src/utils/README.md`](../utils/README.md)
- Types: [`src/components/types/`](./types/)
- Examples: `/docs/component-examples/`

## Contributing

When contributing components:
1. Follow Astro component patterns
2. Use TypeScript for props
3. Add comprehensive JSDoc
4. Keep files under 300 lines
5. Support accessibility features
6. Test in light/dark modes
7. Document usage examples
