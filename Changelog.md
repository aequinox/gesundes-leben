# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Card Component Ultra-Modern Redesign
- **UI Enhancement**
  - Completely redesigned Card.astro component with 2025 ultra-modern design principles:
    - Implemented advanced glass morphism with dynamic light effects and spatial depth layering
    - Added neural-responsive micro-interactions with physics-based animations
    - Created sophisticated 3D perspective with preserve-3d and subtle transformations
    - Enhanced image treatment with light reflection effects and dynamic gradients
    - Implemented adaptive color theory with context-aware color transitions
    - Added fluid typography with variable optical sizing and modern OpenType features
    - Created animated underline effects with origin-based transitions
    - Enhanced icon animations with rotation and scale transformations
    - Improved visual hierarchy with spatial background accents
    - Added ultra-modern read more link with encapsulated icon and multi-stage animations
    - Enhanced focus states with depth-based shadows and improved accessibility
    - Implemented high-performance animations with will-change and backface-visibility optimizations
    - Added comprehensive reduced motion support for accessibility
    - Enhanced print styles and high contrast mode compatibility

### BlogFilter Component Internationalization
- **Feature Enhancement & Bug Fix**
  - Added comprehensive internationalization support to BlogFilter component:
    - Implemented i18n translation system for all UI text elements
    - Added translation keys for filter labels, buttons, and status messages
    - Created English and German translations for all filter-related text
    - Enhanced filter status display with translated text
    - Improved accessibility with translated ARIA labels
    - Fixed group mapping issue for "kontra" posts in filtering logic
    - Enhanced post count display with proper translations
    - Fixed grid reorganization issues when resetting filters
    - Improved error handling with better type safety
    - Enhanced user experience with consistent translations across the interface

### BlogFilter Component Modernization
- **UI Enhancement & Bug Fix**
  - Redesigned BlogFilter.astro component with 2025 modern design principles:
    - Implemented advanced glass morphism UI with layered depth effects
    - Added filter status header with real-time post count display
    - Created modern pill-style category buttons with count badges
    - Enhanced group selectors with post count indicators
    - Added reset and clear filter buttons for better user experience
    - Implemented sophisticated micro-interactions and animations
    - Added staggered reveal animations for filtered content
    - Created "no results found" state with helpful guidance
    - Enhanced keyboard navigation for improved accessibility
    - Improved mobile responsiveness with adaptive layouts
  - Fixed critical filtering issues:
    - Completely refactored filtering logic to properly handle group types
    - Fixed grid layout to properly reflow when filtering posts
    - Ensured proper display/hide behavior for filtered content
    - Added proper TypeScript type safety throughout the component
    - Fixed group mapping for "fragezeiten" to "question-time"
    - Improved console logging for debugging filter states
    - Enhanced error handling for edge cases

### Card Component Modernization
- **UI Enhancement**
  - Redesigned Card.astro component with 2025 modern design principles:
    - Implemented glass morphism effects with backdrop blur and subtle transparency
    - Added dynamic borders that enhance on hover interactions
    - Created gradient overlays for images and color-coded group indicators
    - Enhanced shadows with modern, subtle effects that activate on hover
    - Updated typography with improved sizing, tracking, and line heights
    - Added micro-interactions including shine effects and elegant transitions
    - Implemented underline animation for titles with gradient reveal
    - Redesigned category pills with modern styling and hover effects
    - Enhanced image treatment with subtle gradient overlays
    - Improved overall spacing and layout with better visual hierarchy
    - Maintained all accessibility features including focus states, reduced motion, and high contrast mode
    - Enhanced responsiveness and visual consistency across all screen sizes
    - Improved code organization with semantic HTML and better class structure

### Navigation Enhancement with Tabler Icons
- **UI Enhancement**
  - Updated the mobile menu hamburger icon to use Tabler SVG icons:
    - Replaced CSS-based hamburger icon with Tabler SVG icons for better visual consistency
    - Implemented dynamic icon switching between menu (≡) and close (×) icons when toggling the mobile menu
    - Used CSS-based transitions for smooth icon switching with opacity animations
    - Enhanced mobile toggle button with proper color and sizing for the SVG icons
    - Improved accessibility with proper ARIA attributes and keyboard navigation
    - Added smooth transitions for icon changes
    - Maintained existing mobile menu functionality while improving visual appeal
  - Simplified Header component to work with the new navbar:
    - Removed redundant styling and positioning that's now handled by Navigation component
    - Maintained skip-to-content accessibility feature
    - Preserved theme initialization script for proper theme handling
    - Enhanced code organization following SOLID principles
    - Improved overall maintainability with cleaner separation of concerns

### WordPress to Markdown Exporter Image Handling Improvements
- **Bug Fix & Enhancement**
  - Fixed image file extension handling in WordPress to Markdown exporter:
    - Added file extension validation to check if images exist with different extensions
    - Implemented `findCorrectFileExtension()` function to automatically find the correct file extension
    - Enhanced image path normalization to handle extension mismatches
    - Fixed issue with incorrect file extensions in image references (e.g., .png vs .jpg)
  - Improved image alignment and caption handling:
    - Implemented intelligent image alignment based on aspect ratio:
      - Square-ish images (aspect ratio 0.8-1.2) alternate between left and right alignment
      - Wide images (aspect ratio > 1.5) are centered
      - Other images alternate between left and right
    - Added proper figcaption handling for Kadence image blocks
    - Ensured all images have proper alignment markers (`<`, `>`, or `_`) in captions
    - Added hash-based consistent alignment for images when dimensions aren't available
    - Preserved original captions from WordPress figcaption elements
  - Enhanced code architecture following SOLID principles:
    - Added `getImageDimensions` function to retrieve image dimensions from files
    - Applied Single Responsibility Principle with focused image handling functions
    - Improved error handling and logging for image processing
    - Added better validation for image paths and extensions
    - Enhanced type safety with TypeScript interfaces

### BlogFilter Component Enhancement
- **Feature Enhancement**
  - Implemented double filtering functionality in BlogFilter.astro:
    - Added ability to filter posts by both group (pro, question-time, contra) AND category simultaneously
    - Modified filtering logic to show only posts that match both selected group and category
    - Added reset functionality when "Alle" category is clicked to show all posts regardless of group
    - Implemented no-group-selected state to show all groups filtered by category only
    - Added toggle functionality for group selection (clicking selected group deselects it)
    - Enhanced state tracking with TypeScript type safety
    - Improved user experience with intuitive filtering behavior
    - Maintained existing animations and transitions
  - Added user-friendly filter explanation accordion to homepage:
    - Created collapsible accordion component with toggle functionality
    - Added comprehensive German explanation of filtering features
    - Implemented accessible design with proper ARIA attributes
    - Added smooth animations for opening/closing
    - Styled to match the site's design language
    - Enhanced user guidance with tips for effective filtering

### Hero Section Component Refactoring
- **Code Refactoring & UI Enhancement**
  - Created reusable PageHero component for consistent hero sections across pages:
    - Implemented configurable gradient colors via props (fromColor, toColor)
    - Added support for optional background images with 16:9 aspect ratio
    - Made component use gradient as fallback when no image is provided
    - Implemented sensible defaults for all optional properties
    - Added TypeScript interfaces for proper type safety
    - Replaced duplicate hero sections in imprint.astro, about.astro, our-vision.astro, and posts layout
    - Improved maintainability with centralized styling
    - Enhanced flexibility with configurable min-height
    - Ensured consistent visual appearance across all pages
  - Updated Posts.astro layout to use the PageHero component:
    - Added PageHero component before the Main component
    - Moved title and description from Main component to PageHero
    - Added horizontal rule for visual separation
    - Maintained existing functionality while improving visual consistency

### About Page Fixes
- **UI Enhancement & Bug Fix**
  - Fixed alignment of "Mehr erfahren" buttons on the About page:
    - Added fixed height to text content containers to ensure consistent button positioning
    - Changed button container positioning to use `mt-auto` for bottom alignment
    - Fixed SVG arrow rendering issue in light theme by adding `fill-transparent` to prevent black triangle artifacts
    - Improved overall visual consistency of call-to-action buttons

### Impressum Page Implementation
- **New Feature**
  - Added modern styled Impressum (legal information) page:
    - Created responsive layout with clear sections for legal information
    - Implemented hero section with gradient background and overlay
    - Designed card-based layout for different legal sections
    - Added contact information in a responsive grid layout
    - Styled legal text with improved typography and readability
    - Ensured proper dark mode support with theme-aware styling
    - Added link to Impressum in the footer of all pages
    - Maintained accessibility with semantic HTML structure
    - Implemented responsive design for all screen sizes

### Glossary System Redesign
- **UI Enhancement**
  - Redesigned Glossary pages with modern 2025 design:
    - Implemented hero section with gradient background and overlay
    - Created responsive card-based grid layout for glossary entries
    - Enhanced glossary cards with modern styling and hover effects
    - Added book icon with circular background to each glossary entry
    - Improved typography with better hierarchy and spacing
    - Added descriptive intro text for better user guidance
    - Enhanced read more links with animated arrow icons
    - Redesigned glossary details page with hero section and improved content layout
    - Added modern back-to-top button with hover effects
    - Improved sharing options with better visual presentation
    - Fixed CSS nesting issues with proper global styles
    - Ensured proper dark mode support with theme-aware styling
    - Maintained existing glossary functionality while improving visual appeal
    - Implemented responsive design for all screen sizes

### Tags Page Redesign
- **UI Enhancement**
  - Redesigned Tags page with modern 2025 design:
    - Implemented hero section with gradient background and overlay
    - Created responsive card-based grid layout for tags
    - Added interactive hover effects with smooth transitions
    - Enhanced tag icons with circular background and color transitions
    - Improved typography with better hierarchy and spacing
    - Added descriptive intro text for better user guidance
    - Ensured proper dark mode support with theme-aware styling
    - Maintained existing tag functionality while improving visual appeal
    - Implemented responsive design for all screen sizes

### Modern Page Redesign
- **UI Enhancement**
  - Redesigned "Our Vision" and "About Us" pages with modern grid-based layout:
    - Created consistent card design system across both pages
    - Implemented hero sections with gradient backgrounds
    - Added hover effects and animations for interactive elements
    - Integrated full-width images that use all available space
    - Created stylish contact form with gradient header and animated submit button
    - Improved founder profile cards with better image display
    - Enhanced "Mehr erfahren" buttons with arrow animations
    - Implemented responsive design for all screen sizes
    - Added proper dark mode support with theme-aware styling
    - Ensured accessibility with semantic HTML structure
    - Used modern CSS techniques for shadows, transitions, and transforms

### About Page Implementation
- **New Feature**
  - Added comprehensive "About Us" page based on the original website content:
    - Created responsive layout with clear sections for mission, team information, and values
    - Implemented hero section with gradient background
    - Added sections for "What We Want", "Who We Are", "Who We Are Not", "Personal", and "Professional"
    - Created founder cards with actual portrait images from the original website
    - Implemented responsive design for all screen sizes
    - Added proper dark mode support with theme-aware styling
    - Ensured accessibility with semantic HTML structure
    - Integrated with existing navigation system
    - Aligned "Mehr erfahren" buttons at the same height for better visual consistency
    - Fixed portrait image display to match the original website with black circular frames, proper size (300x300px), and consistent styling

### WordPress Exporter TypeScript Conversion and Fixes
- **Code Refactoring**
  - Converted `scripts/src/wizard.js` to TypeScript with SOLID and DRY principles:
    - Created a service-oriented architecture with clear separation of concerns
    - Implemented dependency injection for better testability and maintainability
    - Added proper TypeScript interfaces and type safety
    - Created specialized services for validation, coercion, and configuration
    - Applied Single Responsibility Principle with focused service classes
    - Enhanced error handling with proper TypeScript error types
    - Improved code organization and readability
    - Added comprehensive JSDoc documentation
    - Maintained backward compatibility with the original API
  - Fixed `scripts/wordpress-to-markdown-exporter.ts` to work with the TypeScript wizard:
    - Updated imports to use the proper types
    - Fixed type compatibility issues between modules
    - Added type assertions where needed for cross-module compatibility
    - Ensured proper error handling with TypeScript error types
  - Enhanced date formatting in WordPress exporter:
    - Fixed date parsing to properly handle RFC2822 format dates from WordPress exports
    - Added support for multiple date formats with graceful fallbacks
    - Improved error messages for date parsing failures
    - Enhanced robustness of date handling in frontmatter generation
  - Fixed image directory structure in WordPress exporter:
    - Updated image storage to place images in each post's directory instead of a common directory
    - Improved image organization for better content management
    - Enhanced compatibility with Astro's image handling
    - Ensured proper relative paths for images in markdown content
  - Added support for WordPress Kadence image blocks:
    - Fixed conversion of Kadence image blocks to proper Markdown format
    - Added specific rule for handling wp-block-kadence-image figures
    - Improved image alt text preservation
    - Enhanced compatibility with WordPress block editor content
    - Fixed image filename format to use correct size suffix (e.g., -1024x984.png)

### Slug System Redesign
- **Code Refactoring & Bug Fix**
  - Implemented a centralized slug generation system based on post titles:
    - Added `getPostSlug` method to SlugService to provide a single source of truth for post slugs
    - Ensured date prefixes (YYYY-MM-DD-) are automatically removed from titles when generating slugs
    - Updated all routes and OG image generation to use the centralized slug method
    - Fixed Card component to use consistent slug generation for post URLs
    - Updated PostUtils.postExists to use centralized slug generation
    - Updated glossary OG image generation to use consistent slug generation
    - Updated tests to mock SlugService.getPostSlug method
    - Fixed 404 errors for OG images and post links by ensuring consistent slug generation
    - Created migration script to handle transition from explicit slugs to title-based slugs
    - Added redirect system for backward compatibility with old URLs
    - Improved developer experience by removing the need to manually specify slugs in frontmatter
    - Enhanced maintainability with consistent slug generation across the application

### OG Template SVG Icon Fix
- **Bug Fix**
  - Fixed SVG icon display in Open Graph templates to show only the appropriate icon:
    - Implemented conditional rendering based on post type (PRO, KONTRA, FRAGEZEITEN)
    - Replaced multiple SVG icons with conditional logic to display only the relevant icon
    - Enhanced code readability with clear comments
    - Improved visual consistency in social media previews

### Test Fixes
- **Bug Fix**
  - Fixed failing tests in multiple modules:
    - Fixed `TagService.extractUniqueTags` to properly filter out draft posts
    - Updated `PostService.getAllPostsByGroup` mock implementation to correctly filter by group and draft status
    - Improved `set-drafts.ts` script with better error handling and testability
    - Fixed OG templates test by properly mocking the AuthorService
    - Enhanced test coverage and reliability
    - Improved TypeScript type safety in test files

### ESLint Fixes and Breadcrumbs Translation
- **Bug Fix**
  - Fixed breadcrumb item labels not being translated properly in non-English languages
  - Added translation support for common navigation segments (categories, tags, posts, etc.)
  - Removed hardcoded category label that was causing incorrect display
  - Improved i18n integration in the breadcrumb component
  - Fixed ESLint errors in multiple files:
    - Added proper block scoping for case statements in switch blocks in PostDetails.astro
    - Removed unused event parameter in Navigation.astro
    - Fixed unnecessary escape character in post-processor.js

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

## [2025-04-09]

### Fixed
- Fixed image handling in WordPress to Markdown exporter for Astro compatibility:
  - Updated Image.astro component to properly handle different types of image sources
  - Modified post-processor.js to ensure image paths are in the correct format for Astro
  - Fixed error "LocalImageUsedWrongly: Image's and getImage's src parameter must be an imported image or an URL"
  - Improved error handling in Image.astro component with proper TypeScript typing
  - Enhanced markdown image path normalization to ensure consistent format
  - Maintained standard markdown image format (![alt](path "title")) for better compatibility
  - Added fallback mechanisms for handling different image source types
  - Updated internal links in markdown content to use the new domain (gesundes-leben.vision)

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
