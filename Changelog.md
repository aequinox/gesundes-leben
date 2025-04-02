# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### WordPress to Markdown Exporter Refactoring
- **Service-Oriented Architecture**
  - Refactored WordPress exporter to TypeScript with SOLID principles
  - Implemented dependency injection with Inversify
  - Created domain-driven design with clear separation of concerns
  - Added comprehensive error handling with Result pattern
  - Enhanced type safety with TypeScript interfaces and models
  - Improved maintainability with modular services

- **Feature Enhancements**
  - Added support for Astro content collections
  - Implemented image downloading and processing
  - Enhanced frontmatter generation
  - Added interactive configuration wizard
  - Created command-line interface with Commander
  - Improved HTML to Markdown conversion with Turndown

### Configuration Refactoring
- **Astro Configuration Enhancement**
  - Refactored `astro.config.ts` to follow SOLID principles
  - Implemented modular configuration with separate sections
  - Added TypeScript type safety with AstroUserConfig types
  - Enhanced documentation with JSDoc comments
  - Enabled syntax highlighting with Shiki
  - Integrated rehype plugins for improved HTML transformation
  - Improved code organization and maintainability

## [Unreleased]

### Categories Page Implementation
- **New Categories Page**
  - Added dedicated categories page to browse posts by category
  - Implemented responsive grid layout for category sections
  - Added category filtering with proper pagination
  - Enhanced posts page to support category filtering via query parameters
  - Created pagination system that preserves category filters
  - Improved user experience with clear category headings and navigation

### Navigation Redesign
- **Modern Navbar Enhancement**
  - Removed dividing line for a cleaner, more cohesive design
  - Implemented glass-morphism effect with subtle gradient background
  - Enhanced active state indicators with background highlighting
  - Improved action buttons with rounded styling and hover effects
  - Updated theme toggle button to match the new design language
  - Ensured consistent styling between light and dark modes

### Enhanced Theme Switching System
- **Theme Persistence**
  - Fixed navbar flickering issue during navigation in dark mode
  - Implemented aggressive theme persistence strategy during view transitions
  - Added session storage for reliable theme state preservation
  - Created early theme initialization script for immediate theme application

- **Performance Optimization**
  - Added targeted CSS transitions for theme-related properties
  - Implemented transition disabling during navigation to prevent flickering
  - Enhanced event handling with capture-phase listeners
  - Added mutation observer to ensure theme consistency

- **Code Quality**
  - Consolidated duplicate theme logic into ThemeService
  - Enhanced TypeScript type safety and error handling
  - Improved event listener cleanup and memory management
  - Added comprehensive documentation

### Service-Based Architecture Implementation
- **Core Infrastructure**
  - Created standardized error handling with `ApplicationError` classes
  - Implemented centralized configuration management with `ConfigService`

- **Content Services**
  - Added `PostService` for blog post operations
  - Implemented `PaginationService` for content pagination
  - Created `TagService` for tag management
  - Added `ReferenceService` for academic references
  - Implemented `AuthorService` for author information

- **Format Services**
  - Added `DateService` for date formatting and manipulation
  - Implemented `SlugService` for URL-friendly slugs
  - Created `FontService` for font loading and management

- **UI Services**
  - Added `ThemeService` for theme switching and persistence
  - Implemented `AnimationService` for AOS animations

- **Image Services**
  - Created `OgImageService` for OpenGraph image generation

- **Component Integration**
  - Updated `index.astro` to use `PostService`
  - Modified `Datetime.astro` to use `DateService`
  - Enhanced `ThemeToggle.astro` with `ThemeService`
  - Updated `Card.astro` to use `SlugService`
  - Improved `Author.astro` with `AuthorService`

- **SOLID Principles**
  - Implemented Single Responsibility Principle with focused services
  - Applied Open/Closed Principle through extensible interfaces
  - Ensured Liskov Substitution with interchangeable implementations
  - Created Interface Segregation with focused interfaces
  - Used Dependency Inversion with abstractions over implementations

## [0.0.1] - 2024-05-13

### Content Management Enhancement
- **Scripts**
  - Added `set-drafts.ts` utility script to manage blog post draft status
  - Implemented comprehensive test suite for draft management functionality
  - Added TypeScript type safety and error handling
  - Included clear console output for script execution status

## [0.0.1] - 2024-05-10

### Search System Enhancement
- **Search Interface**
  - Integrated Pagefind for improved search functionality
  - Added custom UI configuration options
  - Implemented responsive search design
  - Enhanced search result presentation

- **Type Safety**
  - Added SearchProps interface with strict typing
  - Implemented UI options type definitions
  - Enhanced type safety for search parameters
  - Added proper TypeScript configurations

- **Styling Improvements**
  - Added custom CSS variables for theming
  - Enhanced search input and results styling
  - Implemented smooth transitions and animations
  - Added responsive design adjustments
  - Improved accessibility with proper contrast

- **User Experience**
  - Added auto-focus functionality
  - Implemented clear search button
  - Enhanced search results formatting
  - Added loading states and transitions
  - Improved search result excerpts

## [0.0.1] - 2024-12-19

### Enhanced Content System
- **Type System**
  - Added proper TypeScript definitions with readonly properties
  - Implemented type guards for runtime validation
  - Improved type inference and safety
  - Added clear interfaces and documentation

- **Error Handling**
  - Created custom error classes for each domain
  - Enhanced error propagation
  - Added informative error messages
  - Implemented graceful fallbacks

- **Performance**
  - Added caching system for frequently accessed data
  - Optimized search algorithms
  - Implemented efficient data structures
  - Added parallel processing where beneficial

- **Code Quality**
  - Added comprehensive JSDoc documentation
  - Standardized code style
  - Implemented clear separation of concerns
  - Enhanced proper encapsulation

- **Maintainability**
  - Implemented modular architecture
  - Established clear naming conventions
  - Created well-documented APIs
  - Made codebase easy to extend

### Improved References Utility
- **Type Safety**
  - Integrated Astro's CollectionEntry type
  - Added explicit type definitions
  - Created ReferenceEntry type alias
  - Fixed TypeScript errors and implicit any types

- **Error Handling**
  - Implemented ReferenceError class
  - Added detailed error messages
  - Improved error propagation in async methods

- **Performance**
  - Added reference caching mechanism
  - Optimized filtering and sorting
  - Improved string comparison efficiency

- **Code Organization**
  - Enhanced method organization
  - Added private helper methods
  - Improved code structure

### Content Directory Improvements
- **Type Safety**
  - Added TypeScript interfaces and guards
  - Implemented readonly properties
  - Used ReadonlyArray for collections
  - Added custom type definitions

- **Performance**
  - Implemented caching systems
  - Added parallel processing
  - Optimized data structures

- **Documentation**
  - Added JSDoc comments
  - Included usage examples
  - Documented parameters and returns
  - Added complex logic descriptions

## [0.0.1] - 2024-12-18

### Section Components Enhancement
- **Code Quality**
  - Added JSDoc documentation
  - Improved TypeScript interfaces
  - Enhanced error handling
  - Standardized code organization

- **Accessibility**
  - Added ARIA attributes
  - Enhanced keyboard navigation
  - Improved focus management
  - Added screen reader support
  - Implemented high contrast mode

- **Performance**
  - Memoized computed values
  - Optimized event listeners
  - Enhanced animations
  - Implemented lazy loading
  - Improved resource loading

- **User Experience**
  - Enhanced responsive design
  - Added smooth animations
  - Implemented reduced motion
  - Improved mobile support
  - Added print styles

### BlogFilter Component Improvements
- **Documentation**
  - Added component-level JSDoc
  - Enhanced function documentation
  - Created clear type definitions

- **Type Safety**
  - Added TypeScript interfaces
  - Implemented proper type definitions
  - Created type-safe constants

- **Code Organization**
  - Separated logic into focused functions
  - Established constants
  - Improved variable naming

- **Accessibility**
  - Added ARIA labels and roles
  - Enhanced semantic HTML
  - Improved keyboard navigation

- **Performance**
  - Implemented DOM selector caching
  - Enhanced event handling
  - Added lazy loading support

## [2025-04-02]

### Changed
- Updated WordPress to Markdown exporter script to support configurable package managers (npm, bun, pnpm, etc.)
- Fixed WordPress to Markdown exporter to properly handle Astro content collection schema requirements:
  - Modified `coverImage.js` to return an object with `src` and `alt` properties instead of a string
  - Updated `taxonomy.js` to return a single string value from the enum: 'pro', 'kontra', or 'fragezeiten'
  - Added validation function to check frontmatter values against expected schemas
  - Created post-processor module to fix schema issues in existing markdown files
  - Added fix-markdown.js script to process existing markdown files
  - Integrated post-processor into the main workflow for automatic fixes
  - Fixed TypeError in writer.js when handling non-string values in frontmatter
  - Fixed image paths in heroImage to include './images/' prefix
