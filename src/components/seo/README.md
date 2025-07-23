# SEO Component Documentation

A professional, comprehensive SEO component for Astro applications with advanced meta tag management, structured data, and German language optimization.

## 🚀 Features

- **Complete Meta Tag Coverage**: Title, description, keywords, canonical URLs
- **Social Media Optimization**: Open Graph and Twitter Card support
- **Structured Data (JSON-LD)**: Schema.org markup for health/wellness content
- **German Language Support**: Optimized for German content and localization
- **Performance Optimized**: Server-side rendering with zero client-side JavaScript
- **Accessibility Compliant**: WCAG guidelines and screen reader support
- **Error Handling**: Robust validation and fallback mechanisms
- **TypeScript**: Full type safety with comprehensive interfaces

## 📦 Installation & Usage

### Basic Usage

```astro
---
import SEO from "@/components/seo/SEO.astro";
---

<html lang="de">
  <head>
    <SEO
      title="Your Page Title"
      description="Your page description"
      keywords={["keyword1", "keyword2", "keyword3"]}
    />
  </head>
  <body>
    <!-- Your content -->
  </body>
</html>
```

### Blog Article Example

```astro
---
import SEO from "@/components/seo/SEO.astro";

const post = {
  title: "Die 10 besten Superfoods für mehr Energie",
  description: "Entdecken Sie kraftvolle Superfoods...",
  publishedTime: new Date("2024-01-15"),
  author: { name: "Dr. Sarah Mueller" },
  tags: ["Superfoods", "Energie", "Gesundheit"],
};
---

<html lang="de">
  <head>
    <SEO
      title={post.title}
      description={post.description}
      pageType="article"
      publishedTime={post.publishedTime}
      author={post.author}
      section="Ernährung"
      tags={post.tags}
      keywords={post.tags.map(tag => tag.toLowerCase())}
      ogImage="/images/superfoods-hero.jpg"
      twitterCard="summary_large_image"
    />
  </head>
  <body>
    <!-- Article content -->
  </body>
</html>
```

## 🔧 API Reference

### Props Interface

```typescript
interface SEOProps extends SEOMetadata {
  /** Page type for structured data */
  pageType?: "article" | "webpage" | "aboutpage" | "contactpage";
  /** Publication date for articles */
  publishedTime?: Date;
  /** Last modified date */
  modifiedTime?: Date;
  /** Article author information */
  author?: {
    name: string;
    url?: string;
  };
  /** Article section/category */
  section?: string;
  /** Article tags */
  tags?: string[];
  /** Custom structured data to merge */
  customStructuredData?: Record<string, unknown>;
}

interface SEOMetadata {
  title: string;
  description: string;
  keywords?: string[];
  canonicalURL?: string;
  ogImage?: string;
  twitterCard?: "summary" | "summary_large_image";
  structuredData?: Record<string, unknown>;
}
```

### Page Types

- **`article`**: Blog posts, news articles (generates Article schema)
- **`webpage`**: Standard pages (generates WebPage schema)
- **`aboutpage`**: About/company pages (generates AboutPage schema)
- **`contactpage`**: Contact pages (generates ContactPage schema)

## 📊 Generated Meta Tags

### Basic Meta Tags

```html
<title>Your Page Title</title>
<meta name="description" content="Your page description" />
<meta name="keywords" content="keyword1, keyword2, keyword3" />
<link rel="canonical" href="https://example.com/page" />
<meta name="robots" content="index, follow" />
```

### Open Graph Tags

```html
<meta property="og:type" content="article" />
<meta property="og:site_name" content="Gesundes Leben" />
<meta property="og:title" content="Your Page Title" />
<meta property="og:description" content="Your page description" />
<meta property="og:url" content="https://example.com/page" />
<meta property="og:image" content="https://example.com/image.jpg" />
<meta property="og:locale" content="de-DE" />
```

### Twitter Card Tags

```html
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Your Page Title" />
<meta name="twitter:description" content="Your page description" />
<meta name="twitter:image" content="https://example.com/image.jpg" />
```

### Structured Data (JSON-LD)

```html
<script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Your Article Title",
    "description": "Article description",
    "author": {
      "@type": "Person",
      "name": "Author Name"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Gesundes Leben"
    }
  }
</script>
```

## 🏥 Health Content Optimization

The SEO component includes specialized optimization for health and wellness content:

### Health-Specific Structured Data

```javascript
// Automatically added for health articles
{
  "@type": "HealthTopicContent",
  "healthCondition": "Nutrition",
  "audience": {
    "@type": "MedicalAudience",
    "audienceType": "Patient"
  }
}
```

### German Health Keywords

- Optimized keyword processing for German health terms
- Automatic umlauts and special character handling
- Health-specific meta tag suggestions

## 🌍 Localization Features

### German Language Support

- Primary language: `de-DE`
- Proper locale tags for search engines
- German-optimized structured data
- Cultural context awareness

### Multi-Language Ready

The component is prepared for future multilingual expansion:

```astro
<SEO
  title="Gesunde Ernährung"
  description="Tipps für eine gesunde Ernährung"
  customStructuredData={{
    inLanguage: "de-DE",
    audience: {
      geographicArea: "Deutschland",
    },
  }}
/>
```

## 🔍 SEO Best Practices

### Automated Validations

The component automatically validates:

- Title length (warns if > 60 characters)
- Description length (warns if > 160 characters)
- Image URL validity
- Canonical URL format
- Required field presence

### Performance Optimization

- Server-side rendering only (no client-side JavaScript)
- Efficient image URL resolution
- Lazy loading support
- Core Web Vitals optimization

### Accessibility Features

- Proper semantic markup
- Screen reader compatibility
- Color scheme support
- Reduced motion respect

## 🧪 Testing

### Running Tests

```bash
# Run SEO component tests
bun run test src/components/seo/__tests__/SEO.test.ts

# Run with coverage
bun run test:coverage src/components/seo/
```

### Test Coverage

The test suite covers:

- ✅ Basic meta tag rendering
- ✅ Open Graph tag generation
- ✅ Twitter Card functionality
- ✅ Structured data creation
- ✅ Error handling and validation
- ✅ German language support
- ✅ Performance characteristics
- ✅ Accessibility compliance

## 🚨 Error Handling

### Input Validation

```typescript
// Automatic HTML sanitization
const sanitizedTitle = sanitizeText(title);

// URL validation with fallbacks
const imageURL = isValidURL(ogImage) ? ogImage : fallbackImage;

// Length validation with warnings
if (description.length > 160) {
  logger.warn("SEO: Description too long for optimal SEO");
}
```

### Graceful Degradation

- Invalid URLs → Use fallback images
- Missing data → Use site defaults
- Malformed structured data → Skip problematic sections
- Network failures → Continue with available data

## 📈 Monitoring & Analytics

### SEO Metrics

The component logs important SEO metrics:

- Title and description lengths
- Image loading status
- Structured data validation
- Canonical URL resolution

### Debug Mode

Enable debug logging in development:

```astro
---
// Development only logging
if (import.meta.env.DEV) {
  logger.debug("SEO component props:", Astro.props);
}
---
```

## 🔄 Migration Guide

### From Basic Head Component

Replace your existing Head component:

**Before:**

```astro
<Head title={title} description={description} ogImage={ogImage} />
```

**After:**

```astro
<SEO
  title={title}
  description={description}
  ogImage={ogImage}
  keywords={tags}
  pageType="article"
  publishedTime={pubDate}
/>
```

### Backward Compatibility

The Enhanced Head component maintains full backward compatibility with existing usage patterns while adding new SEO capabilities.

## 🛠️ Advanced Usage

### Custom Structured Data

```astro
<SEO
  title="Health Article"
  description="Article description"
  customStructuredData={{
    "@type": "MedicalWebPage",
    medicalAudience: {
      "@type": "MedicalAudience",
      audienceType: "Patient",
    },
    about: {
      "@type": "MedicalCondition",
      name: "Nutrition",
    },
  }}
/>
```

### E-E-A-T Optimization

For health content, the component supports Google's E-E-A-T guidelines:

```astro
<SEO
  title="Nutrition Guide by Dr. Smith"
  author={{
    name: "Dr. Sarah Smith",
    url: "https://example.com/authors/dr-smith",
  }}
  customStructuredData={{
    "@type": "MedicalWebPage",
    reviewedBy: {
      "@type": "Person",
      name: "Dr. Sarah Smith",
      jobTitle: "Nutritionist",
      affiliation: "Medical University",
    },
    dateReviewed: "2024-01-15",
  }}
/>
```

## 🤝 Contributing

### Development Setup

1. Install dependencies: `bun install`
2. Run tests: `bun run test`
3. Build project: `bun run build`

### Code Standards

- TypeScript strict mode
- Comprehensive error handling
- Test coverage > 90%
- Performance optimization
- Accessibility compliance

## 📚 Related Documentation

- [Astro SEO Guide](https://docs.astro.build/en/guides/integrations-guide/)
- [Schema.org Health Documentation](https://schema.org/MedicalWebPage)
- [Google SEO Guidelines](https://developers.google.com/search/docs)
- [Open Graph Protocol](https://ogp.me/)
- [Twitter Card Documentation](https://developer.twitter.com/en/docs/twitter-for-websites/cards)

## 📄 License

This component is part of the Gesundes Leben project and follows the same licensing terms.
