# Internal Linking Guide

Complete guide for using the internal linking system to improve SEO and user engagement.

## Overview

The internal linking system provides intelligent, automated linking between related content with comprehensive analytics tracking. It consists of three main components:

1. **InternalLink** - Manual link placement
2. **ContextualLinks** - Automated related content suggestions  
3. **Analytics System** - Performance tracking and insights

## Components

### InternalLink Component

Manual internal link creation with rich styling and tracking.

**Basic Usage:**
```astro
import InternalLink from "@/components/elements/InternalLink.astro";

<InternalLink href="/posts/vitamin-d-mangel/">
  Vitamin D Mangel erkennen
</InternalLink>
```

**Props:**
- `href` (required): Target URL or post slug
- `variant`: "inline" (default), "button", "highlight", "subtle"
- `context`: "strong", "moderate" (default), "weak"
- `placement`: "content" (default), "sidebar", "navigation"
- `icon`: Optional icon from predefined set
- `title`: Optional tooltip text
- `external`: Set to true for external links
- `trackClick`: Enable analytics (default: true)

**Examples:**

```astro
<!-- Inline text link -->
<InternalLink href="/posts/intermittierendes-fasten/" variant="inline" context="strong">
  intermittierendes Fasten
</InternalLink>

<!-- Button style link -->
<InternalLink href="/posts/vitamin-d-benefits/" variant="button" icon="health">
  Mehr über Vitamin D
</InternalLink>

<!-- Highlighted promotional link -->
<InternalLink href="/posts/new-research/" variant="highlight" context="strong">
  Neue Forschungsergebnisse
</InternalLink>

<!-- Subtle reference link -->
<InternalLink href="/posts/related-topic/" variant="subtle" context="weak">
  verwandtes Thema
</InternalLink>
```

### ContextualLinks Component

Automatically suggests related content based on content analysis.

**Basic Usage:**
```astro
import ContextualLinks from "@/components/elements/ContextualLinks.astro";

<ContextualLinks 
  currentPost={post}
  maxLinks={3}
  placement="inline"
/>
```

**Props:**
- `currentPost` (required): Current post object
- `maxLinks`: Maximum number of links to show (default: 3)
- `placement`: "inline" (default), "sidebar", "footer"
- `variant`: "simple" (default), "boxed", "highlighted"
- `title`: Custom section title
- `showScores`: Show relationship scores in dev mode

**Examples:**

```astro
<!-- Simple inline suggestions -->
<ContextualLinks 
  currentPost={post}
  maxLinks={4}
  title="Ähnliche Artikel zur gesunden Ernährung"
/>

<!-- Boxed sidebar suggestions -->
<ContextualLinks 
  currentPost={post}
  maxLinks={5}
  placement="sidebar"
  variant="boxed"
  title="Weitere Informationen"
/>

<!-- Highlighted footer suggestions -->
<ContextualLinks 
  currentPost={post}
  maxLinks={6}
  placement="footer"
  variant="highlighted"
  title="Das könnte Sie auch interessieren"
/>
```

## Best Practices

### Link Placement Strategy

**1. Content Context Links**
Use InternalLink for contextual references within article text:
```astro
<!-- Within paragraph text -->
Eine gesunde Ernährung mit viel <InternalLink href="/posts/entzuendungshemmende-lebensmittel/" variant="inline" context="strong">entzündungshemmenden Lebensmitteln</InternalLink> führt zu weniger Entzündungen.
```

**2. Related Content Sections**
Use ContextualLinks for automated related content:
```astro
<!-- After main content, before references -->
<ContextualLinks 
  currentPost={post}
  maxLinks={4}
  title="Ähnliche Artikel"
/>
```

**3. Call-to-Action Links**
Use button variant for important links:
```astro
<InternalLink href="/posts/important-guide/" variant="button" context="strong">
  Vollständigen Leitfaden lesen
</InternalLink>
```

### SEO Optimization

**Anchor Text Variation**
- Use natural, descriptive anchor text
- Vary anchor text for same target page
- Include relevant keywords naturally
- Avoid generic "click here" or "read more"

**Link Context Strength**
- `strong`: Primary topic connections, pillar content
- `moderate`: Related topics, supporting content  
- `weak`: Tangentially related, brief mentions

**Link Distribution**
- 3-5 internal links per 1000 words
- Mix of contextual and related content links
- Balance outbound and inbound link equity

### Content Team Workflow

**1. Writing Phase**
- Identify 3-5 key internal linking opportunities
- Use InternalLink for contextual references
- Plan ContextualLinks placement

**2. Review Phase**
- Verify link relevance and value to readers
- Check anchor text variation
- Test link functionality

**3. Publishing Phase**
- Add ContextualLinks after main content
- Verify analytics tracking is enabled
- Monitor link performance in analytics

## Analytics and Tracking

### Automatic Tracking

All internal links are automatically tracked with the following data:
- Click timestamp and user session
- Source and target posts
- Link type (internal, contextual)
- Variant and context strength
- User engagement metrics

### Available Metrics

**Link Performance:**
- Total clicks and unique sessions
- Click-through rates by variant
- Most effective link placements
- Top-performing anchor text

**Content Analytics:**
- Most linked-to content
- Content with highest engagement
- Cross-cluster relationship strength
- User navigation patterns

### Accessing Analytics Data

**Development Mode:**
Link clicks are logged to browser console for testing.

**Production:**
Analytics data is sent to Google Analytics and stored locally for internal analysis.

**Export Options:**
```javascript
// Export analytics data (JSON format)
import { exportAnalyticsData } from "@/utils/internal-linking-analytics";
const data = exportAnalyticsData('json');

// Export as CSV for analysis
const csvData = exportAnalyticsData('csv');
```

## Component Variants

### InternalLink Variants

**Inline (default)**
- Underlined text with accent color
- Best for: In-content references
- Use case: Natural text flow

**Button**
- Rounded button with background
- Best for: Call-to-action links
- Use case: Important navigation

**Highlight**
- Gradient background highlight
- Best for: Featured content
- Use case: Promotional links

**Subtle**
- Muted colors, dotted underline
- Best for: Secondary references
- Use case: Brief mentions

### ContextualLinks Variants

**Simple (default)**
- Clean list with accent border
- Best for: Most use cases
- Placement: Inline content

**Boxed**
- Card-style container with background
- Best for: Sidebar placement
- Visual impact: Medium

**Highlighted**
- Gradient background with icon
- Best for: Important suggestions
- Visual impact: High

## Technical Implementation

### Component Architecture

The internal linking system uses:
- TypeScript for type safety
- Astro components for SSR performance
- CSS custom properties for theming
- Local storage for analytics persistence

### Performance Considerations

- Links are prefetched on hover for faster navigation
- Analytics data is batched and rate-limited
- Component rendering is optimized for SSR
- Styles use CSS custom properties for efficiency

### Accessibility Features

- Proper ARIA labels and roles
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support
- Focus management and indication

## Troubleshooting

### Common Issues

**Links not working:**
- Verify href starts with `/posts/` for blog posts
- Check that target post exists and is published
- Ensure proper URL formatting

**Analytics not tracking:**
- Verify `trackClick={true}` is set (default)
- Check browser console for errors
- Ensure JavaScript is enabled

**Styling issues:**
- Verify component variant spelling
- Check CSS custom property availability
- Test in different themes/modes

### Debug Mode

Enable debug information in development:
```astro
<ContextualLinks 
  currentPost={post}
  showScores={true}
/>
```

This displays relationship scores and matching reasons for each suggested link.

## Migration Guide

### From Manual Links

Replace manual markdown links with InternalLink components:

**Before:**
```markdown
[Vitamin D Mangel](../vitamin-d-mangel/)
```

**After:**
```astro
<InternalLink href="/posts/vitamin-d-mangel/">
  Vitamin D Mangel
</InternalLink>
```

### From Legacy Components

Update existing custom link components to use the new API:
- Replace `to` prop with `href`
- Replace `anchor` prop with slot content
- Update variant names if needed

## Support

For questions or issues:
1. Check this documentation
2. Review component examples in existing posts
3. Test in development mode with debug enabled
4. Check browser console for error messages

The internal linking system is designed to be intuitive and powerful while maintaining excellent performance and user experience.