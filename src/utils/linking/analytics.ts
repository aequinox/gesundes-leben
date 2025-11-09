/**
 * Unified Link Analytics Service
 *
 * Consolidates functionality from:
 * - src/utils/link-analytics.ts
 * - src/utils/internal-linking-analytics.ts
 *
 * Provides centralized analytics tracking and reporting for internal links.
 * Uses shared utilities from linking/core.ts and linking/helpers.ts
 *
 * Single Responsibility: Link analytics tracking and analysis
 */

import { logger } from "../logger";
import type { Post } from "../types";

import { StorageManager, SessionManager, DataValidator } from "./core";
import { groupBy, countBy, topN, formatDate, groupByDay } from "./helpers";
import type { LinkClickEvent, LinkPerformanceMetrics } from "./types";

/**
 * Extended link click event with additional tracking fields
 */
export interface ExtendedLinkClickEvent extends LinkClickEvent {
  linkType?: "internal" | "contextual" | "glossary" | "cross-cluster";
  variant?: string;
  context?: string;
  userId?: string;
}

/**
 * Content analytics for individual posts
 */
export interface ContentAnalytics {
  postSlug: string;
  internalLinksCount: number;
  outboundClicks: number;
  inboundClicks: number;
  engagementScore: number;
  topLinkedPosts: Array<{
    slug: string;
    title: string;
    clicks: number;
  }>;
}

/**
 * Internal link audit results
 */
export interface InternalLinkAudit {
  totalInternalLinks: number;
  orphanedPages: string[];
  pagesWithFewLinks: Array<{ page: string; linkCount: number }>;
  brokenInternalLinks: string[];
  anchorTextAnalysis: {
    duplicateAnchors: Array<{ anchor: string; count: number; pages: string[] }>;
    overOptimizedAnchors: string[];
    genericAnchors: string[];
  };
  linkDistribution: {
    averageLinksPerPage: number;
    pagesWithMostLinks: Array<{ page: string; linkCount: number }>;
    linkDepthAnalysis: Record<number, number>;
  };
}

/**
 * SEO-focused link analysis
 */
export interface SEOLinkAnalysis {
  pageAuthority: Record<string, number>;
  linkJuiceDistribution: Record<string, number>;
  topicalClusters: Array<{
    topic: string;
    pages: string[];
    internalLinkStrength: number;
  }>;
  recommendedLinks: Array<{
    sourcePage: string;
    targetPage: string;
    suggestedAnchor: string;
    priority: "high" | "medium" | "low";
    reason: string;
  }>;
}

/**
 * Unified Link Analytics Service
 *
 * Manages all internal link tracking, analysis, and reporting
 */
export class LinkAnalyticsService {
  private storage: StorageManager;
  private sessionManager: SessionManager;
  private validator: DataValidator;
  private readonly STORAGE_KEY = "link_analytics_events";
  private readonly MAX_EVENTS = 1000;

  constructor() {
    this.storage = new StorageManager();
    this.sessionManager = new SessionManager();
    this.validator = new DataValidator();
  }

  /**
   * Track a link click event
   */
  trackClick(
    event: Omit<ExtendedLinkClickEvent, "timestamp" | "sessionId">
  ): void {
    // Validate event data
    if (!this.validator.isValidEvent(event)) {
      logger.warn("Invalid link click event", event);
      return;
    }

    // Create full event with timestamp and session
    const fullEvent: ExtendedLinkClickEvent = {
      ...event,
      timestamp: Date.now(),
      sessionId: this.sessionManager.getSessionId(),
    };

    // Store event
    const events =
      this.storage.load<ExtendedLinkClickEvent>(this.STORAGE_KEY) || [];
    events.push(fullEvent);

    // Limit array size
    if (events.length > this.MAX_EVENTS) {
      events.splice(0, events.length - this.MAX_EVENTS);
    }

    this.storage.save(this.STORAGE_KEY, events);

    // Send to external analytics if available
    this.sendToExternalAnalytics(fullEvent);

    if (import.meta.env.DEV) {
      logger.debug("Link click tracked:", fullEvent);
    }
  }

  /**
   * Send event to external analytics (Google Analytics, etc.)
   */
  private sendToExternalAnalytics(event: ExtendedLinkClickEvent): void {
    if (typeof window === "undefined") {
      return;
    }

    // Google Analytics 4
    if ("gtag" in window && typeof window.gtag === "function") {
      window.gtag("event", "internal_link_click", {
        link_type: event.linkType || "internal",
        source_post: event.sourcePost,
        target_post: event.targetPost,
        link_text: event.linkText,
        variant: event.variant,
        context: event.context,
      });
    }

    // Matomo/Piwik
    if ("_paq" in window && Array.isArray(window._paq)) {
      window._paq.push([
        "trackEvent",
        "Internal Link",
        "Click",
        `${event.sourcePost} → ${event.targetPost}`,
      ]);
    }
  }

  /**
   * Get link performance metrics for a time period
   */
  getPerformanceMetrics(days: number = 30): LinkPerformanceMetrics {
    const cutoffTime = Date.now() - days * 24 * 60 * 60 * 1000;
    const allEvents =
      this.storage.load<ExtendedLinkClickEvent>(this.STORAGE_KEY) || [];
    const recentEvents = allEvents.filter(
      event => event.timestamp > cutoffTime
    );

    if (recentEvents.length === 0) {
      return this.getEmptyMetrics();
    }

    const totalClicks = recentEvents.length;

    // Count unique clicks (same source-target-session combination)
    const uniqueClicks = new Set(
      recentEvents.map(e => `${e.sourcePost}-${e.targetPost}-${e.sessionId}`)
    ).size;

    // Calculate click-through rate (simplified - would need impression data)
    const estimatedImpressions = totalClicks * 10;
    const clickThroughRate = (totalClicks / estimatedImpressions) * 100;

    // Group clicks by source and target using helper functions
    const sourceClicks = countBy(recentEvents, e => e.sourcePost);
    const targetClicks = countBy(recentEvents, e => e.targetPost);

    // Get top pages using helper function
    const topSourcePages = topN(
      Object.entries(sourceClicks).map(([page, clicks]) => ({ page, clicks })),
      10,
      item => item.clicks
    );

    const topTargetPages = topN(
      Object.entries(targetClicks).map(([page, clicks]) => ({ page, clicks })),
      10,
      item => item.clicks
    );

    return {
      totalClicks,
      uniqueClicks,
      clickThroughRate,
      averageTimeOnTarget: 0, // Requires additional session tracking
      bounceRate: 0, // Requires additional session tracking
      topSourcePages,
      topTargetPages,
      conversionRate: 0, // Requires conversion goal tracking
    };
  }

  /**
   * Get analytics for a specific post
   */
  getContentAnalytics(postSlug: string): ContentAnalytics {
    const allEvents =
      this.storage.load<ExtendedLinkClickEvent>(this.STORAGE_KEY) || [];

    // Count outbound clicks (clicks FROM this post)
    const outboundEvents = allEvents.filter(e => e.sourcePost === postSlug);
    const outboundClicks = outboundEvents.length;

    // Count inbound clicks (clicks TO this post)
    const inboundClicks = allEvents.filter(
      e => e.targetPost === postSlug
    ).length;

    // Count internal links in the post content (would need content analysis)
    const internalLinksCount = 0; // TODO: Implement content parsing

    // Get top linked posts from this post
    const targetCounts = countBy(outboundEvents, e => e.targetPost);
    const topLinkedPosts = topN(
      Object.entries(targetCounts).map(([slug, clicks]) => ({
        slug,
        title: slug, // TODO: Look up actual title
        clicks,
      })),
      5,
      item => item.clicks
    );

    // Calculate engagement score (simple formula)
    const engagementScore = outboundClicks * 2 + inboundClicks;

    return {
      postSlug,
      internalLinksCount,
      outboundClicks,
      inboundClicks,
      engagementScore,
      topLinkedPosts,
    };
  }

  /**
   * Get click events grouped by day
   */
  getClicksByDay(days: number = 30): Array<{ date: string; clicks: number }> {
    const cutoffTime = Date.now() - days * 24 * 60 * 60 * 1000;
    const allEvents =
      this.storage.load<ExtendedLinkClickEvent>(this.STORAGE_KEY) || [];
    const recentEvents = allEvents.filter(e => e.timestamp > cutoffTime);

    // Group by day using helper function
    const grouped = groupByDay(recentEvents, e => e.timestamp);

    // Convert to array format
    return Object.entries(grouped).map(([date, events]) => ({
      date,
      clicks: events.length,
    }));
  }

  /**
   * Get top performing link types
   */
  getTopLinkTypes(limit: number = 5): Array<{ type: string; clicks: number }> {
    const allEvents =
      this.storage.load<ExtendedLinkClickEvent>(this.STORAGE_KEY) || [];
    const typeCounts = countBy(allEvents, e => e.linkType || "internal");

    return topN(
      Object.entries(typeCounts).map(([type, clicks]) => ({ type, clicks })),
      limit,
      item => item.clicks
    );
  }

  /**
   * Export analytics data to CSV
   */
  exportToCSV(): string {
    const events =
      this.storage.load<ExtendedLinkClickEvent>(this.STORAGE_KEY) || [];

    const headers = [
      "Timestamp",
      "Date",
      "Source Post",
      "Target Post",
      "Link Text",
      "Link Type",
      "Variant",
      "Context",
      "Session ID",
    ];

    const rows = events.map(e => [
      e.timestamp.toString(),
      formatDate(e.timestamp),
      e.sourcePost,
      e.targetPost,
      e.linkText,
      e.linkType || "internal",
      e.variant || "",
      e.context || "",
      e.sessionId,
    ]);

    // Convert to CSV format
    const csvContent = [
      headers.join(","),
      ...rows.map(row =>
        row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    return csvContent;
  }

  /**
   * Clear all analytics data
   */
  clearData(): void {
    this.storage.clear(this.STORAGE_KEY);
    logger.log("Analytics data cleared");
  }

  /**
   * Get empty metrics object
   */
  private getEmptyMetrics(): LinkPerformanceMetrics {
    return {
      totalClicks: 0,
      uniqueClicks: 0,
      clickThroughRate: 0,
      averageTimeOnTarget: 0,
      bounceRate: 0,
      topSourcePages: [],
      topTargetPages: [],
      conversionRate: 0,
    };
  }

  /**
   * Perform internal link audit
   * Analyzes link structure and identifies issues
   */
  async auditInternalLinks(_posts: Post[]): Promise<InternalLinkAudit> {
    // This is a complex analysis that would require:
    // - Parsing all post content for links
    // - Building a link graph
    // - Detecting orphaned pages
    // - Analyzing anchor text distribution
    //
    // For now, return empty audit
    // TODO: Implement full audit logic
    logger.warn("Internal link audit not fully implemented yet");

    return {
      totalInternalLinks: 0,
      orphanedPages: [],
      pagesWithFewLinks: [],
      brokenInternalLinks: [],
      anchorTextAnalysis: {
        duplicateAnchors: [],
        overOptimizedAnchors: [],
        genericAnchors: [],
      },
      linkDistribution: {
        averageLinksPerPage: 0,
        pagesWithMostLinks: [],
        linkDepthAnalysis: {},
      },
    };
  }

  /**
   * Perform SEO link analysis
   * Analyzes link structure for SEO optimization
   */
  async analyzeSEO(_posts: Post[]): Promise<SEOLinkAnalysis> {
    // This is a complex analysis that would require:
    // - PageRank-like algorithm for page authority
    // - Topic clustering analysis
    // - Link juice calculation
    // - Recommendation engine
    //
    // For now, return empty analysis
    // TODO: Implement full SEO analysis
    logger.warn("SEO link analysis not fully implemented yet");

    return {
      pageAuthority: {},
      linkJuiceDistribution: {},
      topicalClusters: [],
      recommendedLinks: [],
    };
  }
}

// Export singleton instance
export const linkAnalytics = new LinkAnalyticsService();

// Export for backward compatibility
export { LinkAnalyticsService as LinkAnalytics };

/**
 * Convenience function to track a link click
 */
export function trackLinkClick(
  event: Omit<ExtendedLinkClickEvent, "timestamp" | "sessionId">
): void {
  linkAnalytics.trackClick(event);
}

/**
 * Generate a session ID (backward compatibility)
 * @deprecated Use SessionManager.getSessionId() instead
 */
export function generateSessionId(): string {
  const sessionManager = new SessionManager();
  return sessionManager.getSessionId();
}
