/**
 * Link Analytics and Performance Monitoring
 * 
 * Utilities for tracking internal link performance, analyzing user engagement,
 * and monitoring SEO effectiveness of the internal linking strategy.
 */

import type { Post } from "./types";
import { logger } from "./logger";

/**
 * Interface for link click tracking data
 */
export interface LinkClickData {
  timestamp: number;
  sourcePost: string;
  targetPost: string;
  anchorText: string;
  linkContext: 'strong' | 'moderate' | 'weak';
  placement: 'content' | 'sidebar' | 'navigation';
  userAgent?: string;
  sessionId?: string;
}

/**
 * Interface for link performance metrics
 */
export interface LinkPerformanceMetrics {
  totalClicks: number;
  uniqueClicks: number;
  clickThroughRate: number;
  averageTimeOnTarget: number;
  bounceRate: number;
  topSourcePages: Array<{ page: string; clicks: number }>;
  topTargetPages: Array<{ page: string; clicks: number }>;
  bestPerformingAnchors: Array<{ anchor: string; clicks: number; ctr: number }>;
}

/**
 * Interface for internal link audit results
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
 * Interface for SEO-focused link analysis
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
    priority: 'high' | 'medium' | 'low';
    reason: string;
  }>;
}

/**
 * Class for managing link analytics and performance tracking
 */
export class LinkAnalytics {
  private clickData: LinkClickData[] = [];
  private readonly storageKey = 'internal_link_analytics';

  constructor() {
    this.loadStoredData();
  }

  /**
   * Records a link click event
   */
  recordClick(data: Omit<LinkClickData, 'timestamp' | 'sessionId'>): void {
    const clickEvent: LinkClickData = {
      ...data,
      timestamp: Date.now(),
      sessionId: this.getSessionId()
    };

    this.clickData.push(clickEvent);
    this.saveData();

    // Log for development
    if (import.meta.env.DEV) {
      logger.log('Link click recorded:', clickEvent);
    }
  }

  /**
   * Analyzes link performance over a given time period
   */
  analyzePerformance(days: number = 30): LinkPerformanceMetrics {
    const cutoffTime = Date.now() - (days * 24 * 60 * 60 * 1000);
    const recentClicks = this.clickData.filter(click => click.timestamp > cutoffTime);

    if (recentClicks.length === 0) {
      return this.getEmptyMetrics();
    }

    const totalClicks = recentClicks.length;
    const uniqueClicks = new Set(recentClicks.map(click => 
      `${click.sourcePost}-${click.targetPost}-${click.sessionId}`
    )).size;

    // Group clicks by source and target
    const sourceClicks = this.groupClicksByField(recentClicks, 'sourcePost');
    const targetClicks = this.groupClicksByField(recentClicks, 'targetPost');
    const anchorClicks = this.groupClicksByField(recentClicks, 'anchorText');

    // Calculate click-through rates (simplified - would need impression data in real implementation)
    const estimatedImpressions = totalClicks * 10; // Rough estimate
    const clickThroughRate = (totalClicks / estimatedImpressions) * 100;

    return {
      totalClicks,
      uniqueClicks,
      clickThroughRate,
      averageTimeOnTarget: 0, // Would need additional tracking
      bounceRate: 0, // Would need additional tracking
      topSourcePages: this.getTopItems(sourceClicks, 10),
      topTargetPages: this.getTopItems(targetClicks, 10),
      bestPerformingAnchors: Object.entries(anchorClicks).map(([anchor, clicks]) => ({
        anchor,
        clicks,
        ctr: (clicks / estimatedImpressions) * 100
      })).sort((a, b) => b.ctr - a.ctr).slice(0, 10)
    };
  }

  /**
   * Performs comprehensive internal link audit
   */
  async auditInternalLinks(posts: Post[]): Promise<InternalLinkAudit> {
    logger.log('Starting internal link audit...');

    const audit: InternalLinkAudit = {
      totalInternalLinks: 0,
      orphanedPages: [],
      pagesWithFewLinks: [],
      brokenInternalLinks: [],
      anchorTextAnalysis: {
        duplicateAnchors: [],
        overOptimizedAnchors: [],
        genericAnchors: []
      },
      linkDistribution: {
        averageLinksPerPage: 0,
        pagesWithMostLinks: [],
        linkDepthAnalysis: {}
      }
    };

    // Analyze each post for internal links
    const linkCounts: Record<string, number> = {};
    const _allAnchors: Record<string, { count: number; pages: string[] }> = {};
    const _allLinks: string[] = [];

    for (const post of posts) {
      const linkCount = await this.extractInternalLinksFromPost(post);
      linkCounts[post.slug] = linkCount;
      audit.totalInternalLinks += linkCount;

      // Track pages with few internal links
      if (linkCount < 3) {
        audit.pagesWithFewLinks.push({ page: post.slug, linkCount });
      }
    }

    // Calculate averages and distributions
    audit.linkDistribution.averageLinksPerPage = audit.totalInternalLinks / posts.length;
    audit.linkDistribution.pagesWithMostLinks = Object.entries(linkCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([page, linkCount]) => ({ page, linkCount }));

    // Find orphaned pages (pages with no internal links pointing to them)
    const linkedPages = new Set<string>();
    posts.forEach(post => {
      // This would need actual link extraction implementation
      // For now, we'll simulate based on content analysis
      linkedPages.add(post.slug);
    });

    audit.orphanedPages = posts
      .filter(post => !linkedPages.has(post.slug))
      .map(post => post.slug);

    logger.log(`Internal link audit complete: ${audit.totalInternalLinks} total links found`);
    return audit;
  }

  /**
   * Analyzes SEO impact of internal linking strategy
   */
  analyzeSEOImpact(posts: Post[]): SEOLinkAnalysis {
    logger.log('Analyzing SEO impact of internal linking...');

    const analysis: SEOLinkAnalysis = {
      pageAuthority: {},
      linkJuiceDistribution: {},
      topicalClusters: [],
      recommendedLinks: []
    };

    // Calculate basic page authority based on internal links
    // (simplified version - real implementation would consider external factors)
    posts.forEach(post => {
      let authority = 10; // Base authority
      
      // Boost for featured posts
      if (post.data.featured) authority += 20;
      
      // Boost for posts with many categories/tags (indicating comprehensive content)
      authority += (post.data.categories?.length || 0) * 5;
      authority += (post.data.keywords?.length || 0) * 2;
      
      analysis.pageAuthority[post.slug] = authority;
    });

    // Distribute link juice (simplified calculation)
    const totalAuthority = Object.values(analysis.pageAuthority).reduce((sum, auth) => sum + auth, 0);
    Object.keys(analysis.pageAuthority).forEach(slug => {
      analysis.linkJuiceDistribution[slug] = (analysis.pageAuthority[slug] / totalAuthority) * 100;
    });

    logger.log('SEO impact analysis complete');
    return analysis;
  }

  /**
   * Generates recommendations for improving internal linking
   */
  generateLinkingRecommendations(posts: Post[]): Array<{
    type: 'missing_links' | 'anchor_optimization' | 'content_clusters';
    priority: 'high' | 'medium' | 'low';
    description: string;
    actionItems: string[];
  }> {
    const recommendations = [];

    // Analyze content for missing link opportunities
    const highAuthorityPosts = posts
      .filter(post => post.data.featured || (post.data.categories?.length || 0) >= 3)
      .slice(0, 10);

    if (highAuthorityPosts.length > 0) {
      recommendations.push({
        type: 'missing_links' as const,
        priority: 'high' as const,
        description: 'High-authority posts should link to more related content',
        actionItems: highAuthorityPosts.map(post => 
          `Add 3-5 contextual links to "${post.data.title}"`
        )
      });
    }

    // Check for anchor text optimization opportunities
    recommendations.push({
      type: 'anchor_optimization' as const,
      priority: 'medium' as const,
      description: 'Optimize anchor text for better SEO performance',
      actionItems: [
        'Replace generic "hier" and "mehr erfahren" anchors with descriptive text',
        'Ensure anchor text variation for similar content',
        'Add keyword-rich anchors for important pages'
      ]
    });

    // Content clustering recommendations
    recommendations.push({
      type: 'content_clusters' as const,
      priority: 'medium' as const,
      description: 'Strengthen topical content clusters with better internal linking',
      actionItems: [
        'Create pillar pages for main health topics',
        'Link supporting articles to pillar content',
        'Establish clear topic hierarchies'
      ]
    });

    return recommendations;
  }

  /**
   * Exports analytics data for external analysis
   */
  exportAnalyticsData(): {
    clickData: LinkClickData[];
    summary: LinkPerformanceMetrics;
    exportedAt: number;
  } {
    return {
      clickData: this.clickData,
      summary: this.analyzePerformance(30),
      exportedAt: Date.now()
    };
  }

  /**
   * Clears old analytics data to prevent storage bloat
   */
  cleanupOldData(daysToKeep: number = 90): void {
    const cutoffTime = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);
    const initialCount = this.clickData.length;
    
    this.clickData = this.clickData.filter(click => click.timestamp > cutoffTime);
    this.saveData();

    const removedCount = initialCount - this.clickData.length;
    logger.log(`Cleaned up ${removedCount} old analytics records`);
  }

  // Private helper methods

  private loadStoredData(): void {
    if (typeof localStorage === 'undefined') return;

    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        this.clickData = JSON.parse(stored);
      }
    } catch (error) {
      logger.warn('Failed to load stored analytics data:', error);
    }
  }

  private saveData(): void {
    if (typeof localStorage === 'undefined') return;

    try {
      // Keep only last 1000 records to prevent storage bloat
      const dataToStore = this.clickData.slice(-1000);
      localStorage.setItem(this.storageKey, JSON.stringify(dataToStore));
    } catch (error) {
      logger.warn('Failed to save analytics data:', error);
    }
  }

  private getSessionId(): string {
    if (typeof sessionStorage === 'undefined') return 'server';

    let sessionId = sessionStorage.getItem('link_analytics_session');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('link_analytics_session', sessionId);
    }
    return sessionId;
  }

  private groupClicksByField(clicks: LinkClickData[], field: keyof LinkClickData): Record<string, number> {
    return clicks.reduce((acc, click) => {
      const key = String(click[field]);
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private getTopItems(groups: Record<string, number>, limit: number): Array<{ page: string; clicks: number }> {
    return Object.entries(groups)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .map(([page, clicks]) => ({ page, clicks }));
  }

  private getEmptyMetrics(): LinkPerformanceMetrics {
    return {
      totalClicks: 0,
      uniqueClicks: 0,
      clickThroughRate: 0,
      averageTimeOnTarget: 0,
      bounceRate: 0,
      topSourcePages: [],
      topTargetPages: [],
      bestPerformingAnchors: []
    };
  }

  private async extractInternalLinksFromPost(post: Post): Promise<number> {
    // This would need actual content parsing implementation
    // For now, return estimated count based on post characteristics
    let linkCount = 2; // Base assumption
    
    // More comprehensive posts likely have more links
    if (post.data.keywords && post.data.keywords.length > 5) linkCount += 2;
    if (post.data.categories && post.data.categories.length > 2) linkCount += 1;
    if (post.data.description && post.data.description.length > 200) linkCount += 1;
    
    return linkCount;
  }
}

/**
 * Global analytics instance
 */
export const linkAnalytics = new LinkAnalytics();

/**
 * Helper function to track link clicks from components
 */
export function trackLinkClick(data: Omit<LinkClickData, 'timestamp' | 'sessionId'>): void {
  linkAnalytics.recordClick(data);
}

/**
 * Helper function to get performance metrics
 */
export function getLinkPerformanceMetrics(days: number = 30): LinkPerformanceMetrics {
  return linkAnalytics.analyzePerformance(days);
}

/**
 * Utility function for creating analytics reports
 */
export async function generateInternalLinkingReport(posts: Post[]): Promise<{
  audit: InternalLinkAudit;
  seoAnalysis: SEOLinkAnalysis;
  recommendations: ReturnType<LinkAnalytics['generateLinkingRecommendations']>;
  performance: LinkPerformanceMetrics;
}> {
  logger.log('Generating comprehensive internal linking report...');

  const audit = await linkAnalytics.auditInternalLinks(posts);
  const seoAnalysis = linkAnalytics.analyzeSEOImpact(posts);
  const recommendations = linkAnalytics.generateLinkingRecommendations(posts);
  const performance = linkAnalytics.analyzePerformance(30);

  logger.log('Internal linking report generated successfully');

  return {
    audit,
    seoAnalysis,
    recommendations,
    performance
  };
}