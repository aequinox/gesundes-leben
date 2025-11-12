/**
 * @file utils/index.ts
 * @description Centralized exports for all utility functions
 *
 * This index file provides a convenient way to import utilities
 * throughout the application. Utilities are organized by category
 * for better discoverability and maintainability.
 *
 * @example
 * ```typescript
 * // Single import approach
 * import { logger, slugify, formatDate, validateEmail } from '@/utils';
 *
 * // Category-specific imports
 * import { validation, posts, dates } from '@/utils';
 * ```
 */

// === Core Utilities ===
export { logger, type LogLevelName, type LoggerConfig } from "./logger";
export {
  createError,
  ValidationError,
  ConfigurationError,
  ContentProcessingError,
  isAppError,
  formatErrorMessage,
  handleAsync,
  type AppError,
} from "./errors";

// === Content & Posts ===
export {
  getAllPosts,
  getSortedPosts,
  getFeaturedPosts,
  getRecentPosts,
  getRelatedPosts,
  getPostsWithReadingTime,
  processAllPosts,
  getPostsByTag,
  getPostsByCategory,
  getPostsByGroup,
  getAllPostsByGroup,
  groupByCondition,
  type ProcessPostsOptions,
  type GroupFunction,
  type GroupKey,
} from "./posts";

// === Internal Linking & SEO ===
export {
  TOPIC_CLUSTERS,
  LINKING_WEIGHTS,
  analyzeContentRelationships,
  identifyTopicCluster,
  analyzeTopicClusters,
  findCrossClusterLinkingOpportunities,
  generateInternalLinkingReport,
  type ContentRelationship,
  type TopicClusterAnalysis,
} from "./internal-linking";

export {
  LinkAnalytics,
  linkAnalytics,
  trackLinkClick,
  getLinkPerformanceMetrics,
  generateInternalLinkingReport as generateAnalyticsReport,
  type LinkClickData,
  type LinkPerformanceMetrics,
  type InternalLinkAudit,
  type SEOLinkAnalysis,
} from "./link-analytics";

export { getAuthors, getAuthorById, type AuthorData } from "./authors";

// === Text Processing ===
export { slugify, getPostSlug, type SlugifyOptions } from "./slugs";

export {
  extractUniqueTags,
  formatTags,
  sortTagsByFrequency,
  type TagFrequency,
} from "./tags";

export {
  extractUniqueCategories,
  filterPostsByCategory,
  getCategoryCounts,
  type CategoryInfo,
} from "./categories";

// === Date & Time ===
export {
  formatDate,
  formatDatetime,
  getRelativeTime,
  isValidDate,
  parseDate,
  type DateFormatOptions,
} from "./date";

// === Validation ===
export {
  isValidEmail,
  isSimpleValidEmail,
  validateEmails,
  extractEmailDomain,
  normalizeEmail,
  type EmailValidationOptions,
} from "./validation";

export {
  validateProp,
  validateProps,
  createValidator,
  createStrictValidator,
  withValidation,
  sizeVariantValidator,
  colorVariantValidator,
  buttonVariantValidator,
  urlValidator,
  emailValidator,
  accessibleNameValidator,
  commonRules,
  type PropValidationRule,
  type PropValidationSchema,
  type ValidationContext,
} from "./propValidation";

// === Component Utilities ===
export {
  createComponentFactory,
  createButtonVariants,
  createBadgeVariants,
  createCardVariants,
  createLayoutVariants,
  composeComponents,
  createResponsiveVariant,
  createThemeVariants,
  withValidation as withComponentValidation,
  withPerformanceMonitoring,
  buttonFactory,
  badgeFactory,
  cardFactory,
  layoutFactory,
  type ComponentVariantConfig,
  type ComponentFactory,
  type InteractiveComponent,
  type VariantComponent,
  type LayoutComponent,
  type ContentComponent,
} from "./componentFactory";

// === Safe Rendering ===
export {
  safelyRender,
  safelyExecute,
  withErrorBoundary,
  safelyRenderAll,
  safeFetch,
  safeJsonParse,
  createSafeDebounced,
  createSafeMemoized,
  isSafeResult,
  ErrorRecoveryStrategies,
  type SafeRenderConfig,
} from "./safeRender";

// === Performance ===
export {
  createLazyObserver,
  setupLazyImages,
  lazyLoadComponent,
  preloadCriticalResources,
  deferNonCriticalJS,
  trackBundleSize,
  perf,
  addResourceHints,
  optimizeCriticalCSS,
  type LazyLoadConfig,
} from "./performance/lazy-loading";

export {
  PerformanceMonitor,
  measure,
  measureAsync,
  performanceMonitor,
  getComponentMetrics,
  trackWebVitals,
  type PerformanceEntry,
  type WebVitalsMetrics,
} from "./performance/performance-monitor";

// === Type Utilities ===
export type {
  Post,
  Author,
  Tag,
  Category,
  ContentMeta,
  PostData,
  AuthorProfile,
  PostCategory,
  PostGroup,
} from "./types";

// === Category Namespaces ===
// These provide alternative import patterns for better organization

/**
 * Validation utilities namespace
 */
export const validation = {
  isValidEmail,
  isSimpleValidEmail,
  validateEmails,
  extractEmailDomain,
  normalizeEmail,
  validateProp,
  validateProps,
  createValidator,
  createStrictValidator,
  withValidation,
  validators: {
    sizeVariant: sizeVariantValidator,
    colorVariant: colorVariantValidator,
    buttonVariant: buttonVariantValidator,
    url: urlValidator,
    email: emailValidator,
    accessibleName: accessibleNameValidator,
  },
  commonRules,
} as const;

/**
 * Posts utilities namespace
 */
export const posts = {
  getAll: getAllPosts,
  getSorted: getSortedPosts,
  getFeatured: getFeaturedPosts,
  getRecent: getRecentPosts,
  getRelated: getRelatedPosts,
  withReadingTime: getPostsWithReadingTime,
  processAll: processAllPosts,
  byTag: getPostsByTag,
  byCategory: getPostsByCategory,
  byGroup: getPostsByGroup,
  allByGroup: getAllPostsByGroup,
  groupBy: groupByCondition,
  getSlug: getPostSlug,
} as const;

/**
 * Date utilities namespace
 */
export const dates = {
  format: formatDate,
  formatDatetime,
  relative: getRelativeTime,
  isValid: isValidDate,
  parse: parseDate,
} as const;

/**
 * Text processing utilities namespace
 */
export const text = {
  slugify,
  tags: {
    extract: extractUniqueTags,
    format: formatTags,
    sortByFrequency: sortTagsByFrequency,
  },
} as const;

/**
 * Performance utilities namespace
 */
export const performance = {
  lazy: {
    createObserver: createLazyObserver,
    setupImages: setupLazyImages,
    loadComponent: lazyLoadComponent,
    preloadResources: preloadCriticalResources,
    deferJS: deferNonCriticalJS,
  },
  monitor: {
    PerformanceMonitor,
    measure,
    measureAsync,
    instance: performanceMonitor,
    getComponentMetrics,
    trackWebVitals,
  },
  utils: {
    trackBundleSize,
    addResourceHints,
    optimizeCriticalCSS,
    perf,
  },
} as const;

/**
 * Error handling utilities namespace
 */
export const errors = {
  create: createError,
  format: formatErrorMessage,
  handleAsync,
  isAppError,
  types: {
    ValidationError,
    ConfigurationError,
    ContentProcessingError,
  },
  safe: {
    render: safelyRender,
    execute: safelyExecute,
    withBoundary: withErrorBoundary,
    renderAll: safelyRenderAll,
    fetch: safeFetch,
    jsonParse: safeJsonParse,
    debounced: createSafeDebounced,
    memoized: createSafeMemoized,
    isResult: isSafeResult,
    strategies: ErrorRecoveryStrategies,
  },
} as const;

// === Development Utilities ===
// Only available in development mode

/**
 * Development-only utilities
 * These functions are only available in development mode
 */
export const dev = import.meta.env.DEV
  ? ({
      /**
       * Log performance metrics for a component
       */
      logComponentPerformance: (componentName: string) => {
        const metrics = getComponentMetrics(componentName);
        logger.debug(`Component ${componentName} metrics:`, metrics);
      },

      /**
       * Validate and log component props
       */
      validateAndLogProps: <T extends Record<string, unknown>>(
        props: T,
        schema: Record<string, unknown>,
        componentName: string
      ) => {
        const result = validateProps(props, schema, { componentName });
        if (!result.isValid) {
          logger.warn(`Invalid props for ${componentName}:`, result.errors);
        }
        return result;
      },

      /**
       * Track bundle size for development
       */
      trackDevBundleSize: (bundleName: string, size: number) => {
        trackBundleSize(bundleName, size);
      },
    } as const)
  : undefined;
