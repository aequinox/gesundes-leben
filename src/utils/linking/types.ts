/**
 * Shared TypeScript Interfaces for Internal Linking System
 *
 * Consolidates type definitions used across all linking utilities.
 * Single source of truth for linking-related types.
 */

import type { Post, Category, Tag } from "../types";

/**
 * Link performance metrics interface
 * Used by both client-side and server-side analytics
 */
export interface LinkPerformanceMetrics {
  totalClicks: number;
  uniqueClicks: number;
  clickThroughRate: number;
  averageTimeOnTarget: number;
  bounceRate: number;
  topSourcePages: Array<{ page: string; clicks: number }>;
  topTargetPages: Array<{ page: string; clicks: number }>;
  conversionRate?: number;
}

/**
 * Link click event interface
 * Unified structure for tracking link interactions
 */
export interface LinkClickEvent {
  sourcePost: string;
  targetPost: string;
  linkText: string;
  timestamp: number;
  sessionId: string;
  userAgent?: string;
  referrer?: string;
}

/**
 * Deprecated: Use LinkClickEvent instead
 * @deprecated
 */
export interface LinkClickData extends LinkClickEvent {
  anchorText: string; // Alias for linkText
}

/**
 * Content relationship analysis result
 */
export interface ContentRelationship {
  targetPost: Post;
  score: number;
  matchReasons: string[];
  suggestedAnchorText: string[];
  linkingContext: "strong" | "moderate" | "weak";
}

/**
 * Topic cluster analysis result
 */
export interface TopicClusterAnalysis {
  clusterId: string;
  clusterName: string;
  posts: Post[];
  pillarPost?: Post;
  supportingPosts: Post[];
  internalLinkOpportunities: ContentRelationship[];
}

/**
 * Glossary term definition
 */
export interface GlossaryTerm {
  term: string;
  slug: string;
  variations: string[];
  category: GlossaryCategory;
  priority: number;
  definition?: string;
}

/**
 * Glossary term category
 */
export type GlossaryCategory =
  | "medical"
  | "nutrition"
  | "wellness"
  | "psychology"
  | "anatomy"
  | "general";

/**
 * Match result from pattern matching
 */
export interface Match {
  term: string;
  startIndex: number;
  endIndex: number;
  priority: number;
  category?: string;
}

/**
 * Pattern for term matching
 */
export interface Pattern {
  regex: RegExp;
  priority: number;
  category?: string;
  term: string;
}

/**
 * Analytics dashboard data
 */
export interface AnalyticsDashboard {
  totalLinks: number;
  totalClicks: number;
  uniqueClicks: number;
  averageCTR: number;
  topPerformingLinks: Array<{
    source: string;
    target: string;
    clicks: number;
    ctr: number;
  }>;
  dailyTrends: Array<{
    date: string;
    clicks: number;
    uniqueClicks: number;
  }>;
  contentAnalytics: ContentAnalytics[];
}

/**
 * Per-post analytics
 */
export interface ContentAnalytics {
  postId: string;
  postTitle: string;
  outboundLinks: number;
  inboundLinks: number;
  totalClicks: number;
  clickThroughRate: number;
  topLinks: Array<{
    target: string;
    clicks: number;
  }>;
}

/**
 * SEO impact analysis
 */
export interface SEOImpact {
  pageAuthority: number;
  linkJuiceDistribution: Record<string, number>;
  internalLinkCount: number;
  externalLinkCount: number;
  orphanedPages: string[];
  brokenLinks: Array<{
    source: string;
    target: string;
    error: string;
  }>;
}

/**
 * Linking recommendation
 */
export interface LinkingRecommendation {
  type: "add" | "remove" | "update";
  source: string;
  target?: string;
  reason: string;
  priority: "high" | "medium" | "low";
  suggestedAnchorText?: string[];
}

/**
 * Match type for scoring
 */
export type MatchType =
  | "exact-keyword"
  | "partial-keyword"
  | "category"
  | "tag"
  | "cluster"
  | "author";

/**
 * Storage options
 */
export interface StorageOptions {
  maxRecords?: number;
  maxAge?: number; // in days
  compress?: boolean;
}

/**
 * Daily grouped data
 */
export interface DailyGroup<T = LinkClickEvent> {
  date: string;
  events: T[];
  count: number;
}

/**
 * Export format
 */
export type ExportFormat = "json" | "csv";

/**
 * Export options
 */
export interface ExportOptions {
  format: ExportFormat;
  includeHeaders?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
}
