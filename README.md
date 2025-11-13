# Healthy Life Blog 🌱

A sophisticated health-focused blog platform built with modern web technologies, featuring German content about nutrition, wellness, and lifestyle. Built with Astro for optimal performance and developer experience.

## 🏗️ Architecture

### Tech Stack

- **Framework**: [Astro](https://astro.build/) - Static site generator with island architecture
- **Runtime**: [Bun](https://bun.sh/) - Fast JavaScript runtime and package manager
- **Language**: TypeScript with comprehensive type safety
- **Styling**: Tailwind CSS with custom design system
- **Testing**: Vitest with multi-environment configuration
- **Content**: Markdown/MDX with advanced processing plugins

### Key Features

- 🔒 **Type-safe content collections** with Zod validation
- ⚡ **Performance optimized** with lazy loading and AVIF images
- ♿ **Accessibility-first** with WCAG 2.1 AA compliance
- 🇩🇪 **German localization** throughout the application
- 🔍 **Advanced search** with Pagefind integration
- 📱 **Responsive design** with mobile-first approach
- 🧩 **Modular plugin system** for content processing
- ✅ **Comprehensive testing** across multiple environments

## 🚀 Quick Start

### Prerequisites

- [Bun](https://bun.sh/) >= 1.0.0
- Node.js >= 18.0.0 (for compatibility)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd gesundes-leben

# Install dependencies
bun install

# Start development server
bun run dev
```

## ⚙️ Available Commands

### Development

```bash
bun run dev          # Start development server
bun run build        # Build and type-check
bun run preview      # Preview production build
bun run sync         # Sync Astro content collections
```

### Quality & Testing

```bash
bun run test         # Run all tests
bun run test:coverage # Run tests with coverage
bun run test:ui      # Run tests with UI
bun run lint         # Run linter
bun run format:check # Check formatting
bun run format       # Auto-format code
```

## 📂 Project Structure

```
src/
├── components/          # Component architecture
│   ├── elements/       # Atomic components (Button, Badge, H1-H6)
│   ├── partials/       # Molecular components (ArticleHeader, etc.)
│   ├── sections/       # Organism components (Card, Hero, Footer)
│   ├── filter/         # Blog filtering components
│   └── socials/        # Social media integration
├── data/               # Content collections
│   ├── authors/        # Author profiles (Markdown)
│   ├── blog/           # Blog posts (MDX)
│   ├── glossary/       # Health term definitions
│   ├── favorites/      # Product recommendations (YAML)
│   └── references/     # Scientific references (YAML)
├── layouts/            # Page templates
├── pages/              # Route definitions
├── plugins/            # Custom remark/rehype plugins
├── styles/             # Global styles and utilities
├── utils/              # Shared utilities and helpers
└── config.ts           # Site configuration
```

## 📝 Content Management

### Content Collections

The project uses Astro's content collections for structured, type-safe content:

#### Blog Posts (`src/data/blog/`)

```yaml
---
title: "Your Post Title"
author: "author-id"
pubDatetime: 2024-01-15
categories: ["nutrition", "wellness"]
featured: true
draft: false
heroImage:
  src: "./images/hero.jpg"
  alt: "Hero image description"
references:
  - "2023-smith-nutrition-health"
  - "2024-jones-mindfulness-meditation-stress"
---
```

#### References System

Scientific references stored as individual YAML files in `src/data/references/`:

Example `2023-smith-nutrition-health.yaml`:

```yaml
type: journal
title: "Nutrition and Gut Health Review"
authors:
  - "Smith, J."
  - "Johnson, A."
year: 2023
journal: "Journal of Nutrition"
url: "https://example.com/paper"
keywords:
  - "nutrition"
  - "gut-health"
  - "microbiome"
```

Reference blog posts by filename: `references: ["2023-smith-nutrition-health"]`

### Content Processing Pipeline

Advanced markdown processing with custom plugins:

- **Reading Time Calculation**: Automatic reading time estimation
- **Table of Contents**: German "Inhaltsverzeichnis" generation
- **Hashtag Processing**: Automatic hashtag linking
- **Collapsible Sections**: Enhanced content organization
- **Automatic Heading Links**: Accessible anchor generation

## 🧱 Component System

### Three-Tier Architecture

1. **Elements** (`src/components/elements/`): Atomic UI components
2. **Partials** (`src/components/partials/`): Molecular page sections
3. **Sections** (`src/components/sections/`): Full-width organisms

### Design System

- Consistent design tokens and utilities
- Accessibility-first approach with ARIA compliance
- Responsive utilities with breakpoint management
- Component variants using factory patterns

### Enhanced Components

For content creation, see:

- 📖 Full guide: `docs/component-style-guide.md`
- 🔖 Quick reference: `docs/component-quick-reference.md`

### Example Component Usage

```astro
---
import { Button } from "@/components/elements";
import { ArticleHeader } from "@/components/partials";
---

<ArticleHeader title="Article Title" author={author} />
<Button variant="primary" size="large">Read More</Button>
```

## 🛠️ Configuration

### Key Configuration Files

- `astro.config.ts`: Astro build configuration
- `src/config.ts`: Site-wide settings
- `src/content.config.ts`: Content collection schemas
- `tailwind.config.cjs`: Tailwind CSS customization
- `vitest.config.ts`: Testing configuration

### Environment Variables

```env
# Add your environment variables here
SITE_URL=https://your-site.com
```

## 🧪 Testing Strategy

Multi-environment testing with Vitest:

### Test Categories

- **Unit Tests**: Utilities and helpers (`src/utils/**/*.test.ts`)
- **Component Tests**: Component behavior and props
- **Integration Tests**: Feature workflows
- **Health Tests**: System health checks

### Running Specific Test Suites

```bash
bun run test:unit        # Unit tests only
bun run test:component   # Component tests only
bun run test:integration # Integration tests only
bun run test:health      # Health checks only
```

## ⚡ Performance Features

### Optimization Strategies

- **Island Architecture**: Selective hydration with Astro
- **Image Optimization**: AVIF format with responsive loading
- **Bundle Optimization**: Advanced tree shaking and code splitting
- **Search Optimization**: Indexed search with German language support
- **Font Loading**: Optimized local font loading strategy

### Performance Monitoring

- Lighthouse integration for performance testing
- Bundle analyzer for size optimization
- Coverage reporting for test effectiveness

## 🌍 Internationalization

### German Language Optimization

- Primary language: German (de-DE)
- Localized content throughout
- German table of contents ("Inhaltsverzeichnis")
- Cultural adaptation for health content

## 🔐 Security & Quality

### Code Quality

- Comprehensive TypeScript with strict configuration
- ESLint with Astro-specific rules
- Prettier with import sorting
- Husky git hooks for pre-commit validation

### Security Features

- Content Security Policy headers
- Sanitized markdown processing
- Secure image handling
- No sensitive data exposure

## 📖 Content Guidelines

### Writing Style

- Health-focused content in German
- Evidence-based articles with scientific references
- Accessible language for general audience
- SEO optimization with structured data

### Categories

Available categories for blog posts:

- `nutrition` - Ernährung
- `wellness` - Wellness
- `lifestyle` - Lebensstil
- `health` - Gesundheit

## 🤝 Contributing

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes following the established patterns
4. Run tests and linting (`bun run test && bun run lint`)
5. Commit with descriptive messages
6. Push to your branch and create a Pull Request

### Code Standards

- Follow existing TypeScript patterns
- Maintain accessibility standards
- Add tests for new functionality
- Update documentation as needed
- Use German language for content

## 📊 Performance Metrics

### Build Performance

- Build time: ~30-45 seconds
- Bundle size: <500KB initial load
- Lighthouse scores: 90+ across all metrics
- Test coverage: >80% across all test suites

### User Experience

- First Contentful Paint: <1.5s
- Largest Contentful Paint: <2.5s
- Cumulative Layout Shift: <0.1
- First Input Delay: <100ms

## 📚 Resources

### Documentation

- [Astro Documentation](https://docs.astro.build/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vitest Guide](https://vitest.dev/guide/)

### Health Content Resources

- Scientific journals and publications
- Health organization guidelines
- Evidence-based nutrition research

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

Built with ❤️ for health and wellness education in German.
