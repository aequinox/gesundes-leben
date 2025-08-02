# 🏗️ Architecture Documentation

**Comprehensive system architecture guide for the Healthy Life health-focused blog platform**

---

## 📋 Table of Contents

| Section | Description |
|---------|-------------|
| [🎯 Architecture Overview](#-architecture-overview) | High-level system design |
| [🧩 Component Architecture](#-component-architecture) | UI component patterns |
| [📝 Content Architecture](#-content-architecture) | Content management system |
| [🔄 Data Flow](#-data-flow) | Information processing |
| [🎨 Design System](#-design-system) | Styling and theming |
| [⚡ Performance Architecture](#-performance-architecture) | Optimization strategies |
| [🧪 Testing Architecture](#-testing-architecture) | Quality assurance |
| [🚀 Build & Deploy](#-build--deploy-architecture) | Production pipeline |

---

## 🎯 Architecture Overview

### 🏛️ System Design Philosophy

**Core Principles:**
- **Static-First**: Astro's island architecture for optimal performance
- **Type Safety**: TypeScript throughout with Zod validation
- **Component Driven**: Atomic design methodology
- **Content-Centric**: Git-based content management
- **Performance-Obsessed**: Sub-3s load times on 3G networks
- **Accessibility-First**: WCAG 2.1 AA compliance by default

### 🎯 Technology Stack

```
┌─────────────────────────────────────────────────────────────┐
│                    HEALTHY LIFE ARCHITECTURE                │
├─────────────────────────────────────────────────────────────┤
│  Presentation Layer                                         │
│  ┌─────────────┬──────────────┬─────────────────────────────┤
│  │   Browser   │    Astro     │        Components           │
│  │  JavaScript │   Islands    │     (TypeScript)            │
│  └─────────────┴──────────────┴─────────────────────────────┤
│                                                             │
│  Content Layer                                              │
│  ┌─────────────┬──────────────┬─────────────────────────────┤
│  │     MDX     │    YAML      │        Collections          │
│  │   Content   │ References   │      (Zod Schemas)          │
│  └─────────────┴──────────────┴─────────────────────────────┤
│                                                             │
│  Build Layer                                                │
│  ┌─────────────┬──────────────┬─────────────────────────────┤
│  │    Vite     │  Tailwind    │       Optimization          │
│  │   Bundler   │     CSS      │    (Sharp, Pagefind)        │
│  └─────────────┴──────────────┴─────────────────────────────┤
│                                                             │
│  Quality Layer                                              │
│  ┌─────────────┬──────────────┬─────────────────────────────┤
│  │   Vitest    │  Playwright  │        Lighthouse           │
│  │   Testing   │     E2E      │      Performance            │
│  └─────────────┴──────────────┴─────────────────────────────┘
```

### 🎨 Architecture Patterns

#### **Island Architecture (Astro)**
```
┌─────────────────┐
│   Static HTML   │ ← Server-side rendered
├─────────────────┤
│    🏝️ Island    │ ← Client-side hydrated
│  (Interactive)  │
├─────────────────┤
│   Static HTML   │ ← Server-side rendered
├─────────────────┤
│    🏝️ Island    │ ← Client-side hydrated
│   (ThemeToggle) │
└─────────────────┘
```

**Benefits:**
- Minimal JavaScript shipped to client
- Selective hydration for interactive components
- Fast initial page loads
- SEO-friendly static content

#### **Atomic Design Pattern**
```
🔬 Atoms (Elements)
  ├── Button
  ├── Badge  
  ├── Icon
  └── Typography

🧪 Molecules (Partials)
  ├── ArticleHeader
  ├── AuthorCard
  └── References

🧬 Organisms (Sections)
  ├── Header
  ├── Footer
  └── Card Grid

📄 Templates (Layouts)
  ├── Layout
  ├── PostDetails
  └── Main

🌍 Pages
  ├── Index
  ├── Blog Posts
  └── Categories
```

---

## 🧩 Component Architecture

### 🏗️ Three-Tier Component System

#### **Tier 1: Elements** (`src/components/elements/`)
*Atomic components - indivisible UI pieces*

```typescript
// Component Structure
interface ElementComponent {
  props: TypeScriptInterface;
  styling: TailwindUtilities;
  accessibility: ARIACompliant;
  variants: DesignSystemTokens;
}

// Example: Button Component
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'outline' | 'ghost';
  size: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  // ... accessibility props
}
```

**Key Elements:**
- `Button.astro` - Interactive buttons with variants
- `Badge.astro` - Status and category indicators  
- `H1.astro` - `H6.astro` - Semantic heading hierarchy
- `Image.astro` - Optimized responsive images
- `Icon.astro` - SVG icon system integration

#### **Tier 2: Partials** (`src/components/partials/`)
*Molecular components - combining elements with purpose*

```typescript
// Partial Component Pattern
interface PartialComponent {
  elements: ElementComponent[];
  businessLogic: DomainSpecific;
  dataBinding: ContentCollections;
  composition: LayoutStructure;
}

// Example: ArticleHeader
interface ArticleHeaderProps {
  title: string;
  author: AuthorData;
  pubDatetime: Date;
  categories: CategoryData[];
  heroImage?: ImageData;
}
```

**Key Partials:**
- `ArticleHeader.astro` - Blog post headers with metadata
- `ArticleFooter.astro` - Post conclusions with references
- `Author.astro` - Author information and credentials
- `References.astro` - Scientific citation display
- `RelatedPosts.astro` - Content recommendation system

#### **Tier 3: Sections** (`src/components/sections/`)
*Organism components - full-width page sections*

```typescript
// Section Component Pattern  
interface SectionComponent {
  partials: PartialComponent[];
  elements: ElementComponent[];
  layout: ResponsiveDesign;
  semantics: HTMLSectionStructure;
}

// Example: Header Section
interface HeaderProps {
  navigation: NavigationData;
  branding: BrandingData;
  searchEnabled: boolean;
  responsive: BreakpointBehavior;
}
```

**Key Sections:**
- `Header.astro` - Site navigation and branding
- `Footer.astro` - Site footer with links and legal
- `HeroSection.astro` - Landing page hero areas
- `Card.astro` - Content card layouts
- `Navigation.astro` - Menu and navigation systems

### 🔧 Component Factory Pattern

**Dynamic Component Generation:**
```typescript
// Component Factory Implementation
interface ComponentFactory {
  create<T extends ComponentType>(
    type: T, 
    props: ComponentProps<T>
  ): ComponentInstance<T>;
}

// Usage Example
const button = ComponentFactory.create('Button', {
  variant: 'primary',
  size: 'lg',
  children: 'Mehr erfahren'
});
```

### 🎨 Design System Integration

**Component Variants System:**
```typescript
// Variant Configuration
interface VariantSystem {
  [component: string]: {
    [variant: string]: {
      base: string;
      variants: Record<string, string>;
      sizes: Record<string, string>;
      states: Record<string, string>;
    };
  };
}

// Example: Button Variants
const buttonVariants = {
  base: 'inline-flex items-center justify-center rounded-md font-medium transition-colors',
  variants: {
    primary: 'bg-primary-600 text-white hover:bg-primary-700',
    secondary: 'bg-secondary-100 text-secondary-900 hover:bg-secondary-200'
  },
  sizes: {
    sm: 'h-9 px-3 text-sm',
    md: 'h-10 px-4 text-base',
    lg: 'h-11 px-6 text-lg'
  }
};
```

---

## 📝 Content Architecture

### 📚 Content Collections System

**Collection-Based Content Management:**
```
src/data/
├── 📰 blog/           # Blog posts (MDX)
│   ├── 2024-01-15-post-title.mdx
│   └── images/        # Post-specific images
├── 👥 authors/        # Author profiles (Markdown)  
│   ├── dr-anna-mueller.md
│   └── images/        # Author avatars
├── 📖 glossary/       # Health terminology (Markdown)
│   └── mikrobiom.md
├── ⭐ favorites/       # Product recommendations (YAML)
│   └── green-tea.yaml
└── 📚 references/     # Scientific citations (YAML)
    ├── 2023-smith-nutrition-gut-health.yaml
    └── 2024-jones-mindfulness-stress.yaml
```

### 🔍 Content Schema Architecture

**Type-Safe Content with Zod:**
```typescript
// Schema Definition Pattern
const contentSchema = z.object({
  // Required fields with validation
  title: z.string().min(1).max(200),
  pubDatetime: z.date(),
  
  // Enum validation for categories
  categories: z.array(z.enum(['nutrition', 'wellness', 'lifestyle', 'health'])),
  
  // Conditional validation
  heroImage: z.object({
    src: z.string(),
    alt: z.string().min(1)
  }).optional(),
  
  // Reference validation
  references: z.array(z.string()).optional()
});

// Type Inference
type BlogPost = z.infer<typeof contentSchema>;
```

### 📄 Content Processing Pipeline

**Multi-Stage Content Transformation:**
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│     MDX     │ →  │  Remark     │ →  │   Rehype    │ →  │    HTML     │
│   Source    │    │  Plugins    │    │  Plugins    │    │   Output    │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │                   │
       │                   ▼                   ▼                   │
       │           ┌─────────────┐    ┌─────────────┐              │
       │           │ Reading     │    │ Autolink    │              │
       │           │ Time        │    │ Headings    │              │
       │           └─────────────┘    └─────────────┘              │
       │                   │                   │                   │
       │                   ▼                   ▼                   │
       │           ┌─────────────┐    ┌─────────────┐              │
       │           │ Hashtag     │    │   Slug      │              │
       │           │ Processing  │    │ Generation  │              │
       │           └─────────────┘    └─────────────┘              │
       │                   │                   │                   │
       └───────────────────┼───────────────────┼───────────────────┘
                           │                   │
                           ▼                   ▼
                  ┌─────────────┐    ┌─────────────┐
                  │     TOC     │    │ Collapsible │
                  │ Generation  │    │  Sections   │
                  └─────────────┘    └─────────────┘
```

**Plugin Architecture:**
```typescript
// Remark Plugin Interface
interface RemarkPlugin {
  name: string;
  transform: (tree: MDASTree, file: VFile) => Promise<MDASTree>;
  options?: PluginOptions;
}

// Custom Plugins
const remarkPlugins = [
  remarkReadingTime,     // Calculate reading time
  remarkHashtag,         // Process #hashtags 
  remarkSectionize,      // Wrap sections
  remarkToc,             // Generate German TOC
  remarkCollapse         // Collapsible content
];

const rehypePlugins = [
  rehypeSlug,            // Add heading IDs
  rehypeAutolinkHeadings // Create anchor links
];
```

---

## 🔄 Data Flow

### 📊 Information Architecture

**Content → Component → Page Flow:**
```
┌─────────────────┐
│ Content Source  │ (YAML/MDX files)
└─────────────────┘
         │
         ▼
┌─────────────────┐
│ Content API     │ (Astro Collections)
└─────────────────┘
         │
         ▼
┌─────────────────┐
│ Data Transform  │ (Utils & Helpers)
└─────────────────┘
         │
         ▼
┌─────────────────┐
│ Component Tree  │ (Elements → Partials → Sections)
└─────────────────┘
         │
         ▼
┌─────────────────┐
│ Page Assembly   │ (Layouts & Templates)
└─────────────────┘
         │
         ▼
┌─────────────────┐
│ Static Output   │ (Built HTML/CSS/JS)
└─────────────────┘
```

### 🔍 Reference Resolution System

**Scientific Citation Flow:**
```typescript
// Reference Resolution Architecture
interface ReferenceSystem {
  storage: YAMLFileStore;           // Individual YAML files
  cache: InMemoryCache;             // Build-time caching
  validation: SchemaValidation;     // Zod type checking
  resolution: IDResolver;           // String ID → Reference object
  rendering: CitationFormatter;     // Reference → HTML
}

// Flow Example
const referenceFlow = async (referenceIds: string[]) => {
  // 1. Validate reference IDs exist
  const validation = await validateReferences(referenceIds);
  
  // 2. Resolve to full reference objects
  const references = await Promise.all(
    validation.valid.map(id => getReferenceById(id))
  );
  
  // 3. Format for display
  const formatted = references.map(ref => formatCitation(ref));
  
  return { references: formatted, errors: validation.invalid };
};
```

### 🎯 Search Index Architecture

**Pagefind Integration Flow:**
```
┌─────────────────┐
│  Built Pages    │ (Static HTML)
└─────────────────┘
         │
         ▼
┌─────────────────┐
│ Content Extract │ (Pagefind Indexer)
└─────────────────┘
         │
         ▼
┌─────────────────┐
│  Search Index   │ (Optimized Binary)
└─────────────────┘
         │
         ▼
┌─────────────────┐
│ Client Search   │ (JavaScript Interface)
└─────────────────┘

// Configuration
{
  "site": "dist",
  "exclude_selectors": ["details", "#toc", "#inhaltsverzeichnis"],
  "output_path": "./public/pagefind",
  "language": "de"
}
```

---

## 🎨 Design System

### 🎨 Token Architecture

**Design Token Hierarchy:**
```typescript
// Design System Structure
interface DesignSystem {
  tokens: {
    colors: ColorTokens;
    typography: TypographyTokens;
    spacing: SpacingTokens;
    shadows: ShadowTokens;
    animations: AnimationTokens;
  };
  
  components: {
    [componentName: string]: ComponentTokens;
  };
  
  patterns: {
    layout: LayoutPatterns;
    navigation: NavigationPatterns;
    content: ContentPatterns;
  };
}

// Color System
interface ColorTokens {
  primary: {
    50: '#f0fdf4';   // Lightest green
    500: '#22c55e';  // Base green  
    900: '#14532d';  // Darkest green
  };
  semantic: {
    success: ColorScale;
    warning: ColorScale;
    error: ColorScale;
    info: ColorScale;
  };
}
```

### 📱 Responsive Design Architecture

**Mobile-First Approach:**
```scss
// Breakpoint Strategy
$breakpoints: (
  'sm': 640px,   // Small devices (phones)
  'md': 768px,   // Medium devices (tablets)  
  'lg': 1024px,  // Large devices (laptops)
  'xl': 1280px,  // Extra large devices (desktops)
  '2xl': 1536px  // 2X large devices (large desktops)
);

// Usage Pattern
.component {
  // Mobile-first base styles
  @apply text-sm p-4;
  
  // Progressive enhancement
  @screen md {
    @apply text-base p-6;
  }
  
  @screen lg {
    @apply text-lg p-8;
  }
}
```

### 🎭 Theme System Architecture

**Dark/Light Mode Implementation:**
```typescript
// Theme Configuration
interface ThemeSystem {
  storage: LocalStorageAPI;
  detection: SystemPreferenceAPI;
  toggle: ThemeToggleComponent;
  persistence: CrossPageConsistency;
}

// CSS Custom Properties Strategy
:root {
  --color-bg: theme('colors.white');
  --color-text: theme('colors.gray.900');
}

[data-theme="dark"] {
  --color-bg: theme('colors.gray.900');
  --color-text: theme('colors.white');
}

.component {
  background-color: var(--color-bg);
  color: var(--color-text);
}
```

---

## ⚡ Performance Architecture

### 🚀 Optimization Strategy

**Performance-First Architecture:**
```typescript
// Performance Optimization Layers
interface PerformanceArchitecture {
  buildTime: {
    bundleOptimization: ViteBundler;
    imageOptimization: SharpProcessor;
    cssOptimization: TailwindPurging;
    codeOptimization: TypeScriptCompiler;
  };
  
  runtime: {
    lazyLoading: IntersectionObserver;
    imageDelivery: AvifWebpFallback;
    codeDelivery: ESModulesStrategy;
    caching: ServiceWorkerStrategy;
  };
  
  monitoring: {
    coreWebVitals: PerformanceObserver;
    bundleAnalysis: WebpackBundleAnalyzer;
    lighthouseCI: AutomatedAudits;
  };
}
```

### 📊 Core Web Vitals Architecture

**Performance Monitoring System:**
```typescript
// Performance Measurement
interface CoreWebVitalsMonitoring {
  LCP: {
    target: 2.5;     // seconds
    measurement: PerformanceObserver;
    optimization: [
      'Image optimization',
      'Critical CSS inlining', 
      'Hero image preloading'
    ];
  };
  
  FID: {
    target: 100;     // milliseconds
    measurement: EventListener;
    optimization: [
      'Minimal JavaScript hydration',
      'Efficient event handlers',
      'Code splitting'
    ];
  };
  
  CLS: {
    target: 0.1;     // layout shift score
    measurement: LayoutShiftDetection;
    optimization: [
      'Image aspect ratios',
      'Font loading strategy',
      'Reserved space for dynamic content'
    ];
  };
}
```

### 🖼️ Image Optimization Architecture

**Multi-Format Image Delivery:**
```typescript
// Image Processing Pipeline
interface ImageOptimization {
  formats: ['avif', 'webp', 'jpg'];
  sizes: ResponsiveSizeGeneration;
  quality: AdaptiveQualitySettings;
  loading: LazyLoadingStrategy;
  
  // Processing Chain
  pipeline: [
    'Sharp image processing',
    'Format conversion (AVIF/WebP)', 
    'Responsive size generation',
    'Quality optimization',
    'Lazy loading implementation'
  ];
}

// Picture Element Strategy  
<picture>
  <source srcset="image.avif" type="image/avif">
  <source srcset="image.webp" type="image/webp">
  <img src="image.jpg" alt="..." loading="lazy">
</picture>
```

---

## 🧪 Testing Architecture

### 🎯 Multi-Layer Testing Strategy

**Comprehensive Testing Pyramid:**
```
                    ┌─────────────┐
                    │     E2E     │ ← Playwright (Browser automation)
                    │   Testing   │
                ┌───┴─────────────┴───┐
                │   Integration      │ ← Vitest (Feature workflows)
                │     Testing        │
            ┌───┴───────────────────────┴───┐
            │        Component             │ ← Vitest (Component behavior)
            │        Testing               │
        ┌───┴─────────────────────────────────┴───┐
        │              Unit                      │ ← Vitest (Utilities, helpers)
        │             Testing                    │
        └───────────────────────────────────────────┘
```

### 🧪 Testing Environment Architecture

**Multi-Environment Configuration:**
```typescript
// Vitest Workspace Configuration
interface TestingArchitecture {
  environments: {
    unit: {
      framework: 'vitest';
      environment: 'happy-dom';
      coverage: 'v8';
      target: '>90%';
    };
    
    integration: {
      framework: 'vitest';
      environment: 'node';
      scope: 'feature workflows';
      target: '>70%';
    };
    
    component: {
      framework: 'vitest';  
      environment: 'jsdom';
      scope: 'component behavior';
      target: '>80%';
    };
    
    e2e: {
      framework: 'playwright';
      browsers: ['chromium', 'firefox', 'webkit'];
      scope: 'user journeys';
      target: '100% critical paths';
    };
  };
}
```

### 🏥 Health Content Testing

**Domain-Specific Testing:**
```typescript
// Health Content Validation
interface HealthContentTesting {
  medicalDisclaimer: {
    presence: RequiredValidation;
    placement: VisibilityValidation;
    content: GermanLanguageValidation;
  };
  
  scientificReferences: {
    validity: ReferenceExistenceCheck;
    formatting: CitationStandardCompliance;
    accessibility: ScreenReaderCompatibility;
  };
  
  terminology: {
    accuracy: GermanMedicalTerminology;
    consistency: CrossArticleConsistency;
    definition: GlossaryLinkage;
  };
  
  accessibility: {
    wcag: WCAG21AACompliance;
    screenReader: ARIALabelValidation;
    keyboard: KeyboardNavigationTesting;
  };
}
```

---

## 🚀 Build & Deploy Architecture

### 🏗️ Build Pipeline

**Multi-Stage Build Process:**
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Source    │ →  │   Build     │ →  │  Optimize   │ →  │   Deploy    │
│  Validation │    │  Generation │    │ & Package   │    │   & Serve   │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │                   │
       ▼                   ▼                   ▼                   ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ TypeScript  │    │   Astro     │    │ Asset       │    │ Static      │
│ Type Check  │    │ SSG Build   │    │ Optimization│    │ Hosting     │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │                   │
       ▼                   ▼                   ▼                   ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ ESLint      │    │ Content     │    │ Image       │    │ CDN         │
│ Validation  │    │ Processing  │    │ Processing  │    │ Distribution│
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │                   │
       ▼                   ▼                   ▼                   ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Test        │    │ MDX         │    │ Bundle      │    │ Performance │
│ Execution   │    │ Compilation │    │ Analysis    │    │ Monitoring  │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

### ⚙️ Build Configuration Architecture

**Astro Build Configuration:**
```typescript
// astro.config.ts Structure
interface AstroBuildConfig {
  output: 'static';
  
  integrations: [
    mdx(),              // MDX processing
    sitemap(),          // SEO sitemap
    robotsTxt(),        // Robots.txt generation
    tailwind()          // Tailwind CSS integration
  ];
  
  vite: {
    build: {
      target: 'es2020';           // Modern browser support
      minify: 'esbuild';          // Fast minification
      sourcemap: false;           // Production optimization
    };
    
    optimizeDeps: {
      include: ['dayjs', 'sharp']; // Pre-bundle dependencies
    };
  };
  
  markdown: {
    remarkPlugins: CustomRemarkPlugins;
    rehypePlugins: CustomRehypePlugins;
    shikiConfig: GermanSyntaxHighlighting;
  };
}
```

### 📦 Deployment Architecture

**Static Site Deployment Strategy:**
```typescript
// Deployment Pipeline
interface DeploymentArchitecture {
  buildArtifacts: {
    staticFiles: HTMLCSSJSFiles;
    assets: OptimizedImages;
    searchIndex: PagefindDatabase;
    sitemap: SEOSitemap;
  };
  
  hosting: {
    platform: 'Netlify' | 'Vercel' | 'GitHub Pages';
    cdn: GlobalContentDelivery;
    caching: EdgeCacheStrategy;
    compression: GzipBrotliCompression;
  };
  
  performance: {
    monitoring: LighthouseCI;
    budgets: PerformanceBudgetEnforcement;
    analytics: CoreWebVitalsTracking;
  };
  
  security: {
    headers: SecurityHeadersConfiguration;
    csp: ContentSecurityPolicy;
    ssl: HTTPSEnforcement;
  };
}
```

### 🔄 CI/CD Pipeline Architecture

**Automated Quality Assurance:**
```yaml
# GitHub Actions Workflow
pipeline:
  triggers:
    - push: [main, develop]
    - pull_request: [main]
  
  stages:
    quality_assurance:
      - typescript_check
      - eslint_validation  
      - prettier_formatting
      - test_execution
      - coverage_reporting
    
    build_validation:
      - astro_build
      - bundle_analysis
      - performance_budget
      - accessibility_audit
    
    deployment:
      - static_hosting
      - cdn_deployment
      - performance_monitoring
      - error_tracking
```

---

## 🛡️ Security Architecture

### 🔒 Security-First Design

**Multi-Layer Security Strategy:**
```typescript
// Security Architecture
interface SecuritySystem {
  contentSecurity: {
    sanitization: MarkdownSanitization;
    validation: InputValidation;
    xss: CrossSiteScriptingPrevention;
  };
  
  dataSecurity: {
    noSensitiveData: ContentValidation;
    encryptedTransmission: HTTPSEnforcement;
    accessControl: StaticFilePermissions;
  };
  
  buildSecurity: {
    dependencyScanning: VulnerabilityDetection;
    secretManagement: EnvironmentVariableSecure;
    codeAnalysis: StaticSecurityAnalysis;
  };
  
  runtimeSecurity: {
    csp: ContentSecurityPolicyHeaders;
    cors: CrossOriginResourceSharing;
    headers: SecurityHeadersConfiguration;
  };
}
```

### 🛠️ Content Security Policy

**CSP Configuration:**
```typescript
// Security Headers
const securityHeaders = {
  'Content-Security-Policy': [
    "default-src 'self'",
    "img-src 'self' data: https:",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "font-src 'self'",
    "connect-src 'self'"
  ].join('; '),
  
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
};
```

---

## 📈 Monitoring & Analytics Architecture

### 📊 Performance Monitoring

**Real-Time Performance Tracking:**
```typescript
// Monitoring System
interface MonitoringArchitecture {
  performance: {
    coreWebVitals: WebVitalsAPI;
    bundleSize: BundleAnalyzer;
    buildTime: BuildPerformanceTracker;
    lighthouse: AutomatedAudits;
  };
  
  quality: {
    testCoverage: CoverageReporting;
    accessibility: A11yMonitoring;
    security: VulnerabilityScanning;
  };
  
  user: {
    analytics: PrivacyFriendlyAnalytics;
    searchUsage: SearchAnalytics;
    contentPerformance: ContentMetrics;
  };
}
```

### 🎯 Quality Metrics Dashboard

**Automated Quality Tracking:**
```typescript
// Quality Metrics
interface QualityDashboard {
  buildHealth: {
    typeScriptErrors: 0;
    eslintWarnings: 0;
    testFailures: 0;
    buildStatus: 'passing';
  };
  
  performance: {
    lighthouseScore: '>90';
    bundleSize: '<500KB';
    loadTime: '<3s';
    coreWebVitals: 'green';
  };
  
  accessibility: {
    wcagCompliance: 'AA';
    colorContrast: '>4.5:1';
    keyboardNavigation: '100%';
    screenReaderCompatibility: '100%';
  };
  
  content: {
    referenceValidation: '100%';
    germanLanguageCompliance: '100%';
    healthDisclaimers: '100%';
    medicalTerminologyAccuracy: '100%';
  };
}
```

---

## 🔄 Maintenance & Evolution

### 🛠️ Architectural Flexibility

**Future-Proof Design Decisions:**
```typescript
// Evolutionary Architecture
interface MaintenanceStrategy {
  modularity: {
    componentIsolation: AtomicDesignPattern;
    contentDecoupling: CollectionBasedCMS;
    utilityFunctions: PureFunctionDesign;
  };
  
  extensibility: {
    pluginSystem: RemarkRehypePlugins;
    themeSystem: DesignTokenArchitecture;
    contentTypes: FlexibleSchemaDesign;
  };
  
  scalability: {
    performanceOptimization: StaticSiteGeneration;
    contentManagement: GitBasedWorkflow;
    buildOptimization: IncrementalStaticRegeneration;
  };
  
  monitoring: {
    healthChecks: AutomatedTesting;
    performanceTracking: ContinuousMonitoring;
    qualityAssurance: ComprehensiveTestSuite;
  };
}
```

### 📈 Growth & Scaling Strategy

**Architectural Roadmap:**
```typescript
// Scaling Considerations
interface ScalingArchitecture {
  contentScale: {
    currentCapacity: '1000+ articles';
    optimizations: [
      'Incremental builds',
      'Content chunking', 
      'Search optimization',
      'CDN distribution'
    ];
  };
  
  performanceScale: {
    targetMetrics: CoreWebVitalsGreen;
    strategies: [
      'Bundle optimization',
      'Image delivery optimization',
      'Critical resource prioritization',
      'Edge caching strategies'
    ];
  };
  
  featureScale: {
    plannedFeatures: [
      'Advanced search filters',
      'Content recommendation',
      'User personalization',
      'Progressive web app'
    ];
    architecturalImpact: MinimalRefactoring;
  };
}
```

---

*🏗️ Last updated: 2025-08-02*  
*🔄 This architecture documentation reflects the current system design and is maintained alongside code changes*

**Navigation**: [🔝 Back to Top](#️-architecture-documentation) | [📋 Project Index](./PROJECT_INDEX.md) | [🔌 API Reference](./API_REFERENCE.md)