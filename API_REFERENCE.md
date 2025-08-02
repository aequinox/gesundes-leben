# 🔌 API Reference

**Comprehensive API documentation for the Healthy Life project's utilities, components, and services**

---

## 📋 Table of Contents

| Section | Description |
|---------|-------------|
| [🛠️ Core Utilities](#️-core-utilities) | Essential utility functions |
| [🧩 Component API](#-component-api) | Component props and interfaces |
| [📝 Content API](#-content-api) | Content collection schemas |
| [🎨 Design System](#-design-system-api) | Theme and styling utilities |
| [🔍 Search API](#-search-api) | Search functionality |
| [📊 Analytics API](#-analytics-api) | Performance and tracking |

---

## 🛠️ Core Utilities

### 📅 Date Utilities (`src/utils/date.ts`)

#### `formatDate(date: Date | string, locale?: string): string`
Format dates for display with German localization.

```typescript
// Usage
formatDate(new Date(), 'de-DE') // "2. August 2025"
formatDate('2025-08-02') // "2. August 2025"
```

**Parameters:**
- `date`: Date object or ISO string
- `locale`: Optional locale (default: 'de-DE')

**Returns:** Formatted date string

#### `getDateTimeString(date: Date | string): string`
Get ISO datetime string for schema markup.

```typescript
getDateTimeString(new Date()) // "2025-08-02T10:30:00.000Z"
```

### 📄 Post Utilities (`src/utils/posts.ts`)

#### `getSortedPosts(posts: CollectionEntry<'blog'>[]): CollectionEntry<'blog'>[]`
Sort blog posts by publication date (newest first).

```typescript
const sortedPosts = getSortedPosts(allPosts);
```

#### `getPostsByCategory(posts: CollectionEntry<'blog'>[], category: string): CollectionEntry<'blog'>[]`
Filter posts by category.

```typescript
const nutritionPosts = getPostsByCategory(allPosts, 'nutrition');
```

#### `getFeaturedPosts(posts: CollectionEntry<'blog'>[]): CollectionEntry<'blog'>[]`
Get only featured posts.

```typescript
const featured = getFeaturedPosts(allPosts);
```

### 🏷️ Tag Utilities (`src/utils/tags.ts`)

#### `extractUniqueTags(posts: CollectionEntry<'blog'>[]): TagCount[]`
Extract and count unique tags from posts.

```typescript
interface TagCount {
  tag: string;
  count: number;
}

const tags = extractUniqueTags(allPosts);
```

#### `getPostsByTag(posts: CollectionEntry<'blog'>[], tag: string): CollectionEntry<'blog'>[]`
Filter posts by tag.

```typescript
const taggedPosts = getPostsByTag(allPosts, 'wellness');
```

### 🔗 Slug Utilities (`src/utils/slugs.ts`)

#### `slugifyStr(str: string): string`
Create URL-safe slugs from strings.

```typescript
slugifyStr('Gesunde Ernährung Tips') // "gesunde-ernaehrung-tips"
```

#### `createPostSlug(title: string, date: Date): string`
Generate consistent post slugs.

```typescript
createPostSlug('Mein Artikel', new Date('2025-08-02'))
// "2025-08-02-mein-artikel"
```

### 👥 Author Utilities (`src/utils/authors.ts`)

#### `getAuthorById(authorId: string): Promise<CollectionEntry<'authors'> | undefined>`
Retrieve author by ID.

```typescript
const author = await getAuthorById('dr-anna-mueller');
```

#### `getAuthorPosts(authorId: string, posts: CollectionEntry<'blog'>[]): CollectionEntry<'blog'>[]`
Get all posts by specific author.

```typescript
const authorPosts = getAuthorPosts('dr-anna-mueller', allPosts);
```

### 📚 Reference Utilities (`src/utils/references.ts`)

#### `getReferenceById(id: string): Promise<Reference | null>`
Get reference by ID from YAML files.

```typescript
interface Reference {
  type: 'journal' | 'website' | 'book' | 'report' | 'other';
  title: string;
  authors: string[];
  year: number;
  journal?: string;
  url?: string;
  doi?: string;
  // ... additional fields
}

const ref = await getReferenceById('2023-smith-nutrition-gut-health');
```

#### `validateReferences(referenceIds: string[]): Promise<ValidationResult>`
Validate reference IDs exist.

```typescript
interface ValidationResult {
  valid: string[];
  invalid: string[];
  errors: string[];
}

const result = await validateReferences(['ref1', 'ref2']);
```

---

## 🧩 Component API

### 🎨 Element Components

#### `Button.astro`

**Props Interface:**
```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  href?: string;
  target?: '_blank' | '_self';
  ariaLabel?: string;
  class?: string;
}
```

**Usage:**
```astro
<Button variant="primary" size="lg" href="/contact">
  Kontakt aufnehmen
</Button>
```

#### `Badge.astro`

**Props Interface:**
```typescript
interface BadgeProps {
  variant?: 'default' | 'category' | 'status' | 'featured';
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'gray';
  size?: 'sm' | 'md' | 'lg';
  class?: string;
}
```

**Usage:**
```astro
<Badge variant="category" color="green">Ernährung</Badge>
```

#### `Image.astro`

**Props Interface:**
```typescript
interface ImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  quality?: number;
  format?: 'avif' | 'webp' | 'jpg' | 'png';
  loading?: 'lazy' | 'eager';
  class?: string;
  caption?: string;
  credit?: string;
}
```

**Usage:**
```astro
<Image 
  src="./hero.jpg" 
  alt="Gesunde Ernährung" 
  width={800} 
  height={400}
  format="avif"
  loading="eager"
  caption="Frisches Gemüse und Obst"
/>
```

### 📄 Partial Components

#### `ArticleHeader.astro`

**Props Interface:**
```typescript
interface ArticleHeaderProps {
  title: string;
  author: CollectionEntry<'authors'>;
  pubDatetime: Date;
  categories: string[];
  heroImage?: {
    src: string;
    alt: string;
  };
  readingTime?: string;
  featured?: boolean;
}
```

#### `References.astro`

**Props Interface:**
```typescript
interface ReferencesProps {
  referenceIds: string[];
  class?: string;
}
```

**Usage:**
```astro
<References referenceIds={post.data.references} />
```

### 🏢 Section Components

#### `Card.astro`

**Props Interface:**
```typescript
interface CardProps {
  title: string;
  excerpt?: string;
  href?: string;
  image?: {
    src: string;
    alt: string;
  };
  category?: string;
  date?: Date;
  author?: string;
  featured?: boolean;
  class?: string;
}
```

#### `Accordion.astro`

**Props Interface:**
```typescript
interface AccordionProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
  class?: string;
}

interface AccordionItem {
  id: string;
  title: string;
  content: string;
  open?: boolean;
}
```

---

## 📝 Content API

### 📰 Blog Collection Schema

**Frontmatter Schema:**
```typescript
const blogSchema = z.object({
  title: z.string(),
  author: z.string(),
  pubDatetime: z.date(),
  categories: z.array(z.enum(['nutrition', 'wellness', 'lifestyle', 'health'])),
  featured: z.boolean().default(false),
  draft: z.boolean().default(false),
  heroImage: z.object({
    src: z.string(),
    alt: z.string()
  }).optional(),
  description: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  references: z.array(z.string()).optional(),
  canonicalURL: z.string().url().optional(),
  tags: z.array(z.string()).optional(),
  group: z.string().optional()
});
```

### 👥 Authors Collection Schema

**Schema Definition:**
```typescript
const authorsSchema = z.object({
  name: z.string(),
  avatar: z.string(),
  bio: z.string(),
  social: z.object({
    website: z.string().url().optional(),
    twitter: z.string().optional(),
    linkedin: z.string().optional(),
    email: z.string().email().optional()
  }).optional(),
  credentials: z.array(z.string()).optional(),
  specialties: z.array(z.string()).optional()
});
```

### 📚 References Collection Schema

**YAML Structure:**
```typescript
interface Reference {
  type: 'journal' | 'website' | 'book' | 'report' | 'other';
  title: string;
  authors: string[];
  year: number;
  
  // Journal specific
  journal?: string;
  volume?: number;
  issue?: number;
  pages?: string;
  
  // Book specific
  publisher?: string;
  location?: string;
  edition?: string;
  isbn?: string;
  
  // Digital
  url?: string;
  doi?: string;
  pmid?: string;
  
  // Metadata
  keywords?: string[];
  abstract?: string;
}
```

### 📖 Glossary Collection Schema

**Schema Definition:**
```typescript
const glossarySchema = z.object({
  term: z.string(),
  category: z.enum(['nutrition', 'wellness', 'lifestyle', 'health', 'medical']),
  definition: z.string(),
  relatedTerms: z.array(z.string()).optional(),
  references: z.array(z.string()).optional()
});
```

---

## 🎨 Design System API

### 🎨 Theme Configuration

**Color System:**
```typescript
interface ColorSystem {
  primary: {
    50: string;
    100: string;
    500: string;
    600: string;
    700: string;
    900: string;
  };
  secondary: ColorScale;
  accent: ColorScale;
  neutral: ColorScale;
  success: ColorScale;
  warning: ColorScale;
  error: ColorScale;
}
```

**Typography Scale:**
```typescript
interface TypographyScale {
  'text-xs': string;    // 0.75rem
  'text-sm': string;    // 0.875rem
  'text-base': string;  // 1rem
  'text-lg': string;    // 1.125rem
  'text-xl': string;    // 1.25rem
  'text-2xl': string;   // 1.5rem
  'text-3xl': string;   // 1.875rem
  'text-4xl': string;   // 2.25rem
  'text-5xl': string;   // 3rem
  'text-6xl': string;   // 3.75rem
  'text-7xl': string;   // 4.5rem
  'text-8xl': string;   // 6rem
  'text-9xl': string;   // 8rem
}
```

### 🎯 Responsive Utilities

**Breakpoint System:**
```typescript
interface Breakpoints {
  sm: '640px';   // Small devices
  md: '768px';   // Medium devices
  lg: '1024px';  // Large devices
  xl: '1280px';  // Extra large devices
  '2xl': '1536px'; // 2X large devices
}
```

**Spacing Scale:**
```typescript
interface SpacingScale {
  '0': '0px';
  'px': '1px';
  '0.5': '0.125rem';  // 2px
  '1': '0.25rem';     // 4px
  '2': '0.5rem';      // 8px
  '3': '0.75rem';     // 12px
  '4': '1rem';        // 16px
  '6': '1.5rem';      // 24px
  '8': '2rem';        // 32px
  '12': '3rem';       // 48px
  '16': '4rem';       // 64px
  '20': '5rem';       // 80px
  '24': '6rem';       // 96px
}
```

---

## 🔍 Search API

### 🔍 Pagefind Integration

**Search Configuration:**
```typescript
interface SearchConfig {
  site: string;              // Build output directory
  excludeSelectors: string[]; // CSS selectors to exclude
  outputPath: string;         // Search index output
  language: string;           // Primary language (de)
}
```

**Search Functions:**
```typescript
// Client-side search interface
interface SearchResult {
  id: string;
  url: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  score: number;
}

// Search functionality
declare global {
  interface Window {
    pagefind: {
      search(query: string): Promise<SearchResult[]>;
      filters: {
        category: string[];
        date: string[];
      };
    };
  }
}
```

### 🌐 Search Translations

**German Search Interface:**
```typescript
interface SearchTranslations {
  placeholder: "Artikel durchsuchen...";
  noResults: "Keine Ergebnisse gefunden";
  resultsCount: "{count} Ergebnisse für '{query}'";
  categories: {
    nutrition: "Ernährung";
    wellness: "Wellness";
    lifestyle: "Lebensstil";
    health: "Gesundheit";
  };
}
```

---

## 📊 Analytics API

### 📈 Performance Monitoring

**Core Web Vitals Interface:**
```typescript
interface CoreWebVitals {
  LCP: number;  // Largest Contentful Paint
  FID: number;  // First Input Delay
  CLS: number;  // Cumulative Layout Shift
  FCP: number;  // First Contentful Paint
  TTFB: number; // Time to First Byte
}

// Performance measurement
function measureCoreWebVitals(): Promise<CoreWebVitals>;
```

### 📊 Bundle Analysis

**Bundle Information:**
```typescript
interface BundleAnalysis {
  totalSize: number;
  gzippedSize: number;
  modules: BundleModule[];
  duplicates: string[];
  unused: string[];
}

interface BundleModule {
  name: string;
  size: number;
  gzippedSize: number;
  path: string;
  chunks: string[];
}
```

### 🎯 Performance Budget

**Budget Configuration:**
```typescript
interface PerformanceBudget {
  initialLoad: {
    js: number;    // 150KB
    css: number;   // 50KB
    images: number; // 500KB
    total: number;  // 1MB
  };
  metrics: {
    LCP: number;   // 2.5s
    FID: number;   // 100ms
    CLS: number;   // 0.1
  };
}
```

---

## 🔧 Configuration APIs

### ⚙️ Site Configuration (`src/config.ts`)

**Configuration Interface:**
```typescript
interface SiteConfig {
  SITE: {
    website: string;
    title: string;
    desc: string;
    author: string;
    locale: string;
  };
  
  LOGO_IMAGE: {
    enable: boolean;
    svg: boolean;
    width: number;
    height: number;
  };
  
  SOCIALS: SocialLink[];
}

interface SocialLink {
  name: string;
  href: string;
  linkTitle: string;
  active: boolean;
}
```

### 🎨 Tailwind Configuration

**Theme Extension:**
```typescript
interface TailwindTheme {
  colors: ColorSystem;
  fontFamily: {
    sans: string[];
    serif: string[];
    mono: string[];
  };
  animation: {
    fadeIn: string;
    slideIn: string;
    bounce: string;
  };
  screens: Breakpoints;
}
```

---

## 🚨 Error Handling

### ❌ Error Types

**Custom Error Classes:**
```typescript
class ContentValidationError extends Error {
  constructor(
    public field: string,
    public value: unknown,
    message: string
  ) {
    super(message);
    this.name = 'ContentValidationError';
  }
}

class ReferenceNotFoundError extends Error {
  constructor(public referenceId: string) {
    super(`Reference not found: ${referenceId}`);
    this.name = 'ReferenceNotFoundError';
  }
}

class ImageOptimizationError extends Error {
  constructor(public imagePath: string, message: string) {
    super(`Image optimization failed for ${imagePath}: ${message}`);
    this.name = 'ImageOptimizationError';
  }
}
```

### 🛡️ Error Boundary

**Error Boundary Component:**
```typescript
interface ErrorBoundaryProps {
  fallback?: string;
  onError?: (error: Error, errorInfo: string) => void;
  class?: string;
}

// Usage in components
<ErrorBoundary fallback="Fehler beim Laden des Inhalts">
  <SomeComponent />
</ErrorBoundary>
```

---

## 🔌 Plugin APIs

### 📝 Remark Plugins

**Custom Plugin Interface:**
```typescript
interface RemarkPlugin {
  name: string;
  transform: (tree: Node, file: VFile) => Promise<Node>;
  options?: PluginOptions;
}

// Reading time plugin
interface ReadingTimeOptions {
  wordsPerMinute: number; // Default: 200
  locale: string;         // Default: 'de-DE'
}

// TOC plugin
interface TocOptions {
  heading: string;        // Default: 'Inhaltsverzeichnis'
  maxDepth: number;       // Default: 3
  ordered: boolean;       // Default: false
}
```

### 🎨 Rehype Plugins

**HTML Processing Plugins:**
```typescript
interface RehypePlugin {
  name: string;
  transform: (tree: Node, file: VFile) => Promise<Node>;
  options?: PluginOptions;
}

// Autolink headings options
interface AutolinkOptions {
  behavior: 'prepend' | 'append' | 'wrap';
  properties: {
    ariaLabel: string;
    className: string[];
  };
}
```

---

## 🧪 Testing APIs

### 🎯 Test Utilities

**Health Content Matchers:**
```typescript
// Custom Jest/Vitest matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveGermanContent(): R;
      toIncludeHealthDisclaimer(): R;
      toHaveValidReferences(): R;
      toMeetWCAGStandards(): R;
    }
  }
}

// Usage in tests
expect(content).toHaveGermanContent();
expect(healthArticle).toIncludeHealthDisclaimer();
```

**Test Helpers:**
```typescript
interface TestHelpers {
  createMockPost(overrides?: Partial<BlogPost>): BlogPost;
  createMockAuthor(overrides?: Partial<Author>): Author;
  createMockReference(overrides?: Partial<Reference>): Reference;
  mockImageOptimization(): void;
  setupTestEnvironment(): void;
}
```

### 🎪 E2E Test APIs

**Playwright Custom Commands:**
```typescript
interface CustomCommands {
  // Health content validation
  checkHealthDisclaimer(): Promise<void>;
  validateGermanContent(): Promise<void>;
  checkAccessibility(): Promise<void>;
  
  // Performance testing
  measureCoreWebVitals(): Promise<CoreWebVitals>;
  checkPerformanceBudget(): Promise<boolean>;
  
  // Content validation
  validateReferences(): Promise<boolean>;
  checkImageOptimization(): Promise<void>;
}
```

---

*📝 Last updated: 2025-08-02*  
*🔄 This API reference is automatically maintained and reflects the current codebase*

**Navigation**: [🔝 Back to Top](#-api-reference) | [📋 Project Index](./PROJECT_INDEX.md)