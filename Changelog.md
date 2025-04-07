# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### OG Image Template Redesign
- **UI Enhancement & Bug Fix**
  - Completely redesigned Open Graph image templates with premium modern aesthetics:
    - Enhanced post type indicator with icon and text badge for better readability
    - Added subtle geometric decorative elements for visual interest
    - Improved glass-morphism effect with increased opacity and blur
    - Enhanced color system with type-specific color palettes
    - Upgraded typography with optimized font sizes, weights, and spacing
    - Redesigned category tags with type-specific colors and subtle shadows
    - Enhanced author avatar with improved styling and border
    - Added decorative elements to site name display
    - Improved overall visual hierarchy and composition
  - Fixed rendering issues with special characters in all text elements
  - Added hardcoded mapping for post type display names to ensure proper rendering
  - Fixed React warnings by adding key props to mapped elements
  - Ensured zIndex is properly specified as a unitless value
  - Implemented comprehensive font loading with multiple weights
  - Enhanced TypeScript type safety throughout the template

### OG Image Templates Modernization
- **UI Enhancement**
  - Redesigned Open Graph image templates with modern styling:
    - Added glass-morphism effect with subtle gradient background
    - Implemented accent color bar at the top of images
    - Created card-like container with rounded corners and subtle shadow
    - Added post type indicators with appropriate colors (pro, contra, fragezeiten)
    - Enhanced typography with improved spacing and hierarchy
    - Added author avatar placeholder with first letter of name
    - Included category tags when available
    - Created consistent footer with author and site information
    - Improved overall visual hierarchy and readability
    - Ensured consistent styling between post and site templates
  - Enhanced color system with theme-aware colors
  - Improved responsive design for different screen sizes and devices
  - Added proper font loading with fallbacks

### Fixed Missing Utility Modules
- **Bug Fix**
  - Fixed TypeScript errors related to missing utility modules
  - Updated files to use the service-based architecture instead of non-existent utility modules:
    - Fixed "Cannot find module 'utils/getPagination'" by updating these files to use PaginationService:
      - `src/pages/pro.astro`&
      - `src/pages/kontra.astro`
      - `src/pages/fragezeiten.astro`
      - `src/pages/glossary/index.astro`
      - `src/pages/glossary/[slug]/index.astro`
    - Updated `src/pages/glossary/[slug]/index.astro` to use PaginationService.calculatePageNumbers instead of the non-existent getPageNumbers utility
    - Fixed "Cannot find module '../getAuthor'" in `src/utils/og-templates/post.tsx` by using AuthorService
    - Fixed "Cannot find module 'utils/slugify'" in these files by using SlugService:
      - `src/pages/posts/[slug]/index.png.ts`
      - `src/pages/glossary/[slug]/index.png.ts`
    - Added proper type annotations to fix implicit any type errors
  - Ensured consistent use of service-based architecture throughout the project

### SEO Meta Tags Implementation
- **Feature Enhancement**
  - Implemented SEO meta tags system based on astro-seo-meta package
  - Created modular components for better maintainability:
    - `Seo.astro` - Main component that orchestrates all SEO-related tags
    - `Meta.astro` - Handles basic meta tags (title, description, etc.)
    - `Facebook.astro` - Manages Open Graph meta tags for social sharing
    - `Twitter.astro` - Handles Twitter card meta tags
  - Enhanced Layout component to use the new SEO system
  - Improved social sharing capabilities with proper meta tags
  - Maintained backward compatibility with existing meta tag structure
  - Added TypeScript interfaces for type safety and better developer experience
  - Implemented conditional rendering for optional meta tags

### Table of Contents and List Improvements
- **Bug Fix & UI Enhancement**
  - Fixed doubled bullet points in lists by modifying text extraction logic
  - Improved TOC display with proper scrolling for long content
  - Enhanced TOC scrollbar with ultra-thin design in primary accent color
  - Fixed invalid href attributes and missing content in scroll observer
  
- **Accessibility Enhancements**
  - Added comprehensive ARIA attributes for screen readers
  - Implemented keyboard navigation with arrow keys for TOC
  - Added screen reader announcements for section navigation
  - Ensured all headings have valid IDs for proper linking
  - Added error handling and fallbacks for navigation
  - Fixed invalid tabindex on non-interactive elements
  - Implemented proper focus management with temporary tabindex
  - Added Home/End key support for keyboard navigation
  - Added sr-only utility class for screen reader content
  - Fixed text extraction to prevent duplicate text in TOC entries
  - Ensured all headings and anchors have accessible names
  - Added proper accessible name extraction from aria-label, aria-labelledby, img alt, and svg title
  - Added title elements to SVGs for better accessibility
  
- **Visual Improvements**
  - Implemented multi-column layout for lists on larger screens
  - Improved overall readability and user experience

### List Component Enhancement
- **Feature & UI Improvement**
  - Added multi-column layout support for List component on larger screens
  - Implemented responsive column layout that adapts to screen size:
    - Single column on mobile devices
    - Two columns on tablets (768px+)
    - Three columns on desktops (1280px+)
  - Added `columns` prop to allow manual control of column count (1-4)
  - Fixed doubled bullet points in List component by removing CSS-generated bullets
  - Improved list item styling with better spacing and typography
  - Enhanced compatibility with CSS columns using proper break-inside properties
  - Ensured consistent styling across different screen sizes

### List Component Enhancement
- **Bug Fix & UI Improvement**
  - Fixed doubled bullet points in List component by removing CSS-generated bullets
  - Redesigned List component with modern styling:
    - Added card-like container with rounded corners and subtle shadow
    - Implemented bookmark icon in section titles
    - Added border under section titles for visual separation
    - Created left border and single bullet points for list items
    - Added hover effects with subtle background color change and translation
    - Implemented staggered animation for list items
    - Enhanced typography with improved spacing and line height
    - Added responsive design adjustments for different screen sizes
  - Improved accessibility with proper ARIA attributes and semantic HTML
  - Enhanced user experience with smooth transitions and animations

### Reading Time Display Fix
- **Bug Fix**
  - Fixed reading time not showing in article metadata
  - Enabled remarkReadingTime plugin in remark plugins configuration
  - Updated BlogPostProcessor.transform method to properly calculate reading time
  - Fixed logical error in ArticleMeta.astro component
  - Added direct reading time calculation in post pages

### Deprecated Utility Function Removal
- **Code Refactoring**
  - Replaced deprecated utility function calls with service-based methods
  - Updated `src/pages/posts/index.astro` to use PaginationService and PostService
  - Updated `src/pages/posts/[page].astro` to use PaginationService and PostService
  - Updated `src/pages/posts/[slug]/index.astro` to use PaginationService and PostService
  - Updated `src/pages/tags/index.astro` to use TagService
  - Updated `src/pages/tags/[tag]/index.astro` to use TagService, PaginationService, and PostService
  - Updated `src/pages/tags/[tag]/[page].astro` to use TagService, PaginationService, and PostService
  - Updated `src/pages/author/[author]/index.astro` to use PaginationService
  - Updated `src/pages/author/[author]/[page].astro` to use custom implementation for author filtering
  - Updated `src/pages/rss.xml.ts` to use PostService
  - Updated `src/components/filter/BlogFilter.astro` to use PostService
  - Updated test files to use service-based methods
  - Implemented custom author filtering solution where no direct service method was available
  - Removed deprecation warnings from console output

### Service-Based Architecture Refactoring
- **Code Refactoring**
  - Replaced standalone utility functions with service class methods
  - Deprecated `getPostsWithRT.ts` utility in favor of PostUtils.addReadingTimeToPosts
  - Deprecated `getSortedPosts.ts` utility in favor of PostUtils.sortPostsByDate
  - Deprecated `getPageNumbers.ts` utility in favor of PaginationService.calculatePageNumbers
  - Deprecated `getPagination.ts` utility in favor of PaginationService.generatePagination
  - Deprecated `getPostsBy.ts` utility in favor of PostService methods
  - Deprecated `getUniqueTags.ts` utility in favor of TagService.extractUniqueTags
  - Deprecated `postFilter.ts` utility in favor of PostService.getAllPosts
  - Added backward compatibility with deprecation warnings
  - Enhanced error handling with custom error classes
  - Added comprehensive JSDoc documentation with migration examples
  - Improved code organization following SOLID principles

### Author Pages Implementation
- **New Feature**
  - Added dedicated author pages to display posts by specific authors
  - Created author listing page at `/author` to browse all authors
  - Implemented `AuthorPosts.astro` layout for consistent author page styling
  - Enhanced `getPostsBy.ts` utility with `getPostsByAuthor` function
  - Fixed 404 error when accessing author pages
  - Added proper author links in post metadata
  - Ensured consistent handling of author IDs with or without file extensions
  - Improved author name display with proper formatting

### Footer Component Fix
- **Bug Fix**
  - Fixed author name display in Footer component by enhancing AuthorService
  - Added robust author name resolution with proper fallback mechanism
  - Implemented caching for better performance
  - Enhanced error handling and logging
  - Added formatAuthorName utility to convert slugs to display names

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
- Fixed image downloader to prevent downloading duplicate resized versions of the same image:
  - Added detection for WordPress image naming patterns (e.g., image-name-123x456.jpg)
  - Implemented intelligent filtering to prioritize base images over resized versions
  - Added logging to show when resized versions are skipped
  - Updated HTML-to-Markdown converter to normalize image references to base filenames
  - Enhanced post-processor to fix image references in existing markdown files
  - Fixed module import errors by ensuring consistent image filenames
