/**
 * Internal Linking System
 *
 * Consolidated linking utilities with shared core functionality.
 * Eliminates duplication across internal-linking, glossary-linking,
 * and analytics utilities.
 *
 * @module linking
 */

// Core infrastructure
export {
  StorageManager,
  SessionManager,
  DataValidator,
  defaultStorage,
  defaultSession,
} from "./core";

// Scoring and matching
export {
  LinkScorer,
  MatchingEngine,
  TextNormalizer,
  SCORING_WEIGHTS,
  defaultScorer,
  defaultMatcher,
} from "./scoring";

// Helper utilities
export * from "./helpers";

// Analytics
export {
  LinkAnalyticsService,
  LinkAnalytics,
  linkAnalytics,
  trackLinkClick,
  generateSessionId,
} from "./analytics";

export type {
  ExtendedLinkClickEvent,
  ContentAnalytics,
  InternalLinkAudit,
  SEOLinkAnalysis,
} from "./analytics";

// Types
export type * from "./types";
