/**
 * Internal Linking Analytics and Tracking System
 * Provides performance metrics and user engagement data for internal links
 */

/**
 * Generate a unique session ID for tracking user sessions
 */
export function generateSessionId(): string {
  // Use a combination of timestamp and random string for session ID
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 15);
  return `${timestamp}-${randomStr}`;
}

export interface LinkClickEvent {
  linkType: 'internal' | 'contextual' | 'glossary' | 'cross-cluster';
  sourcePost: string;
  targetPost: string;
  linkText: string;
  variant: string;
  context: string;
  timestamp: number;
  userId?: string | undefined;
  sessionId?: string | undefined;
}

export interface LinkPerformanceMetrics {
  totalClicks: number;
  uniqueClicks: number;
  clickThroughRate: number;
  averageTimeOnTarget: number;
  bounceRate: number;
  conversionRate: number;
}

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
 * Track internal link clicks with comprehensive metadata
 */
export function trackLinkClick(event: LinkClickEvent): void {
  // Send to analytics service (Google Analytics, Matomo, etc.)
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'internal_link_click', {
      link_type: event.linkType,
      source_post: event.sourcePost,
      target_post: event.targetPost,
      link_text: event.linkText,
      variant: event.variant,
      context: event.context,
      custom_map: {
        dimension1: event.linkType,
        dimension2: event.sourcePost,
        dimension3: event.targetPost,
      }
    });
  }

  // Store in local analytics database
  const analyticsData = getLocalAnalytics();
  analyticsData.linkClicks.push(event);
  
  // Maintain data size (keep last 1000 events)
  if (analyticsData.linkClicks.length > 1000) {
    analyticsData.linkClicks = analyticsData.linkClicks.slice(-1000);
  }
  
  localStorage.setItem('internal_linking_analytics', JSON.stringify(analyticsData));
}

/**
 * Get local analytics data from localStorage
 */
function getLocalAnalytics(): { linkClicks: LinkClickEvent[] } {
  if (typeof window === 'undefined') {
    return { linkClicks: [] };
  }
  
  try {
    const data = localStorage.getItem('internal_linking_analytics');
    return data ? JSON.parse(data) : { linkClicks: [] };
  } catch {
    return { linkClicks: [] };
  }
}

/**
 * Calculate performance metrics for a specific link or post
 */
export function calculateLinkMetrics(
  sourcePost?: string,
  targetPost?: string,
  timeframe?: { start: number; end: number }
): LinkPerformanceMetrics {
  const analyticsData = getLocalAnalytics();
  let relevantClicks = analyticsData.linkClicks;

  // Filter by source post
  if (sourcePost) {
    relevantClicks = relevantClicks.filter(click => click.sourcePost === sourcePost);
  }

  // Filter by target post
  if (targetPost) {
    relevantClicks = relevantClicks.filter(click => click.targetPost === targetPost);
  }

  // Filter by timeframe
  if (timeframe) {
    relevantClicks = relevantClicks.filter(
      click => click.timestamp >= timeframe.start && click.timestamp <= timeframe.end
    );
  }

  const totalClicks = relevantClicks.length;
  const uniqueClicks = new Set(relevantClicks.map(click => 
    `${click.userId || click.sessionId}-${click.sourcePost}-${click.targetPost}`
  )).size;

  // Calculate basic metrics (would need server-side data for full accuracy)
  return {
    totalClicks,
    uniqueClicks,
    clickThroughRate: totalClicks > 0 ? (uniqueClicks / totalClicks) * 100 : 0,
    averageTimeOnTarget: 0, // Would need server-side tracking
    bounceRate: 0, // Would need server-side tracking  
    conversionRate: 0, // Would need conversion goals defined
  };
}

/**
 * Generate content analytics report for a specific post
 */
export function generateContentAnalytics(postSlug: string): ContentAnalytics {
  const analyticsData = getLocalAnalytics();
  
  // Count outbound clicks (links from this post)
  const outboundClicks = analyticsData.linkClicks.filter(
    click => click.sourcePost === postSlug
  ).length;

  // Count inbound clicks (links to this post)
  const inboundClicks = analyticsData.linkClicks.filter(
    click => click.targetPost === postSlug
  ).length;

  // Get top linked posts from this post
  const outboundTargets = analyticsData.linkClicks
    .filter(click => click.sourcePost === postSlug)
    .reduce((acc, click) => {
      acc[click.targetPost] = (acc[click.targetPost] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const topLinkedPosts = Object.entries(outboundTargets)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([slug, clicks]) => ({
      slug,
      title: slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      clicks,
    }));

  // Calculate engagement score (basic algorithm)
  const engagementScore = Math.min(100, (outboundClicks * 2 + inboundClicks) / 10);

  return {
    postSlug,
    internalLinksCount: 0, // Would need to be calculated from post content
    outboundClicks,
    inboundClicks,
    engagementScore,
    topLinkedPosts,
  };
}

/**
 * Get analytics dashboard data
 */
export function getAnalyticsDashboard(timeframe?: { start: number; end: number }) {
  const analyticsData = getLocalAnalytics();
  let clicks = analyticsData.linkClicks;

  if (timeframe) {
    clicks = clicks.filter(
      click => click.timestamp >= timeframe.start && click.timestamp <= timeframe.end
    );
  }

  // Group by link type
  const clicksByType = clicks.reduce((acc, click) => {
    acc[click.linkType] = (acc[click.linkType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Group by variant
  const clicksByVariant = clicks.reduce((acc, click) => {
    acc[click.variant] = (acc[click.variant] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Most popular source posts
  const topSources = Object.entries(
    clicks.reduce((acc, click) => {
      acc[click.sourcePost] = (acc[click.sourcePost] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  )
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([post, clicks]) => ({ post, clicks }));

  // Most popular target posts
  const topTargets = Object.entries(
    clicks.reduce((acc, click) => {
      acc[click.targetPost] = (acc[click.targetPost] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  )
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([post, clicks]) => ({ post, clicks }));

  return {
    totalClicks: clicks.length,
    uniqueSessions: new Set(clicks.map(click => click.sessionId)).size,
    clicksByType,
    clicksByVariant,
    topSources,
    topTargets,
    dailyClicks: groupClicksByDay(clicks),
  };
}

/**
 * Group clicks by day for trend analysis
 */
function groupClicksByDay(clicks: LinkClickEvent[]): Array<{ date: string; clicks: number }> {
  const dailyGroups = clicks.reduce((acc, click) => {
    const date = new Date(click.timestamp).toISOString().split('T')[0];
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(dailyGroups)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, clicks]) => ({ date, clicks }));
}

/**
 * Export analytics data for external analysis
 */
export function exportAnalyticsData(format: 'json' | 'csv' = 'json'): string {
  const data = getLocalAnalytics();
  
  if (format === 'csv') {
    const headers = [
      'timestamp',
      'linkType', 
      'sourcePost',
      'targetPost',
      'linkText',
      'variant',
      'context',
      'userId',
      'sessionId'
    ];
    
    const csvData = [
      headers.join(','),
      ...data.linkClicks.map(click => [
        click.timestamp,
        click.linkType,
        click.sourcePost,
        click.targetPost,
        `"${click.linkText.replace(/"/g, '""')}"`,
        click.variant,
        click.context,
        click.userId || '',
        click.sessionId || ''
      ].join(','))
    ].join('\n');
    
    return csvData;
  }
  
  return JSON.stringify(data, null, 2);
}

/**
 * Clear analytics data (for privacy compliance)
 */
export function clearAnalyticsData(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('internal_linking_analytics');
  }
}