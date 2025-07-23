/**
 * @file seo-audit.ts
 * @description Comprehensive SEO audit utility for German health content
 *
 * Features:
 * - Complete SEO health check
 * - German language optimization audit
 * - Health content compliance audit
 * - Performance SEO audit
 * - Schema markup validation
 * - Core Web Vitals assessment
 */
import { germanSEOOptimizer } from "./german-seo-optimization";
import { seoPerformanceOptimizer } from "./performance-optimization";
import type { CollectionEntry } from "astro:content";

export interface SEOAuditResult {
  /** Overall SEO score (0-100) */
  overallScore: number;
  /** Individual audit scores */
  scores: {
    technical: number;
    content: number;
    performance: number;
    german: number;
    health: number;
    schema: number;
  };
  /** Critical issues that must be fixed */
  criticalIssues: string[];
  /** Warnings that should be addressed */
  warnings: string[];
  /** Recommendations for improvement */
  recommendations: string[];
  /** SEO strengths identified */
  strengths: string[];
}

export interface AuditConfig {
  /** Enable German language-specific audits */
  germanOptimization: boolean;
  /** Enable health content compliance audits */
  healthCompliance: boolean;
  /** Enable performance audits */
  performanceAudit: boolean;
  /** Enable schema markup validation */
  schemaValidation: boolean;
  /** Strictness level */
  strictness: "standard" | "strict" | "enterprise";
}

const DEFAULT_AUDIT_CONFIG: AuditConfig = {
  germanOptimization: true,
  healthCompliance: true,
  performanceAudit: true,
  schemaValidation: true,
  strictness: "standard",
};

/**
 * Comprehensive SEO audit engine
 */
export class SEOAuditor {
  private config: AuditConfig;

  constructor(config: Partial<AuditConfig> = {}) {
    this.config = { ...DEFAULT_AUDIT_CONFIG, ...config };
  }

  /**
   * Perform comprehensive SEO audit
   */
  async auditContent(
    post: CollectionEntry<"blog">,
    content?: string,
    performanceMetrics?: {
      lcp?: number;
      fid?: number;
      cls?: number;
      ttfb?: number;
    }
  ): Promise<SEOAuditResult> {
    const scores = {
      technical: 0,
      content: 0,
      performance: 0,
      german: 0,
      health: 0,
      schema: 0,
    };

    const criticalIssues: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];
    const strengths: string[] = [];

    // Technical SEO Audit
    const technicalAudit = this.auditTechnicalSEO(post);
    scores.technical = technicalAudit.score;
    criticalIssues.push(...technicalAudit.criticalIssues);
    warnings.push(...technicalAudit.warnings);
    recommendations.push(...technicalAudit.recommendations);
    strengths.push(...technicalAudit.strengths);

    // Content SEO Audit
    const contentAudit = this.auditContentSEO(post, content);
    scores.content = contentAudit.score;
    criticalIssues.push(...contentAudit.criticalIssues);
    warnings.push(...contentAudit.warnings);
    recommendations.push(...contentAudit.recommendations);
    strengths.push(...contentAudit.strengths);

    // German SEO Audit
    if (this.config.germanOptimization) {
      const germanAudit = germanSEOOptimizer.analyzeGermanContentSEO(
        post,
        content
      );
      scores.german = germanAudit.score;
      criticalIssues.push(
        ...germanAudit.issues.filter(issue => issue.includes("missing"))
      );
      warnings.push(
        ...germanAudit.issues.filter(issue => !issue.includes("missing"))
      );
      recommendations.push(...germanAudit.recommendations);

      if (germanAudit.score > 90) {
        strengths.push("Excellent German language optimization");
      }
    }

    // Health Content Audit
    if (this.config.healthCompliance) {
      const healthAudit = this.auditHealthContent(post, content);
      scores.health = healthAudit.score;
      criticalIssues.push(...healthAudit.criticalIssues);
      warnings.push(...healthAudit.warnings);
      recommendations.push(...healthAudit.recommendations);
      strengths.push(...healthAudit.strengths);
    }

    // Performance SEO Audit
    if (this.config.performanceAudit && performanceMetrics) {
      const perfAudit =
        seoPerformanceOptimizer.analyzeHealthContentPerformance(
          performanceMetrics
        );
      scores.performance = perfAudit.score;

      if (perfAudit.score < 70) {
        criticalIssues.push("Poor Core Web Vitals performance affecting SEO");
      } else if (perfAudit.score < 85) {
        warnings.push("Core Web Vitals could be improved for better SEO");
      }

      recommendations.push(...perfAudit.recommendations);

      if (perfAudit.score > 90) {
        strengths.push("Excellent Core Web Vitals performance");
      }
    } else {
      scores.performance = 85; // Default if no metrics provided
    }

    // Schema Markup Audit
    if (this.config.schemaValidation) {
      const schemaAudit = this.auditSchemaMarkup(post);
      scores.schema = schemaAudit.score;
      criticalIssues.push(...schemaAudit.criticalIssues);
      warnings.push(...schemaAudit.warnings);
      recommendations.push(...schemaAudit.recommendations);
      strengths.push(...schemaAudit.strengths);
    }

    // Calculate overall score
    const overallScore = this.calculateOverallScore(scores);

    return {
      overallScore,
      scores,
      criticalIssues: [...new Set(criticalIssues)],
      warnings: [...new Set(warnings)],
      recommendations: [...new Set(recommendations)],
      strengths: [...new Set(strengths)],
    };
  }

  /**
   * Audit technical SEO elements
   */
  private auditTechnicalSEO(post: CollectionEntry<"blog">): {
    score: number;
    criticalIssues: string[];
    warnings: string[];
    recommendations: string[];
    strengths: string[];
  } {
    const { data } = post;
    const criticalIssues: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];
    const strengths: string[] = [];
    let score = 100;

    // Title optimization
    if (!data.title || data.title.trim().length === 0) {
      score -= 30;
      criticalIssues.push("Missing page title");
    } else if (data.title.length > 60) {
      score -= 15;
      warnings.push(`Title too long (${data.title.length} chars)`);
    } else if (data.title.length < 30) {
      score -= 10;
      warnings.push("Title could be longer for better SEO");
    } else {
      strengths.push("Well-optimized title length");
    }

    // Meta description
    if (!data.description || data.description.trim().length === 0) {
      score -= 25;
      criticalIssues.push("Missing meta description");
    } else if (data.description.length > 160) {
      score -= 10;
      warnings.push(`Description too long (${data.description.length} chars)`);
    } else if (data.description.length < 120) {
      score -= 5;
      warnings.push("Description could be longer (120-160 chars recommended)");
    } else {
      strengths.push("Well-optimized meta description");
    }

    // Keywords
    if (!data.keywords || data.keywords.length === 0) {
      score -= 5;
      recommendations.push(
        "Add relevant keywords for better content categorization"
      );
    } else if (data.keywords.length > 10) {
      score -= 5;
      warnings.push("Too many keywords - focus on 5-10 most relevant");
    } else {
      strengths.push("Good keyword targeting");
    }

    // Hero image
    if (!data.heroImage) {
      score -= 15;
      warnings.push("Missing hero image affects social sharing and engagement");
    } else {
      if (!data.heroImage.alt || data.heroImage.alt.trim().length === 0) {
        score -= 10;
        criticalIssues.push("Missing alt text for hero image");
      } else {
        strengths.push("Hero image with proper alt text");
      }
    }

    // Categories and tags
    if (!data.categories || data.categories.length === 0) {
      score -= 10;
      warnings.push("Missing categories for content organization");
    } else {
      strengths.push("Good content categorization");
    }

    // Canonical URL
    if (data.canonicalURL) {
      strengths.push("Custom canonical URL specified");
    }

    // Publication dates
    if (data.modDatetime) {
      strengths.push("Content freshness indicated with modification date");
    }

    return {
      score: Math.max(0, score),
      criticalIssues,
      warnings,
      recommendations,
      strengths,
    };
  }

  /**
   * Audit content SEO elements
   */
  private auditContentSEO(
    post: CollectionEntry<"blog">,
    _content?: string
  ): {
    score: number;
    criticalIssues: string[];
    warnings: string[];
    recommendations: string[];
    strengths: string[];
  } {
    const { data } = post;
    const criticalIssues: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];
    const strengths: string[] = [];
    let score = 100;

    // Content length estimation
    const estimatedWordCount = data.description.length * 5; // Rough estimate
    if (estimatedWordCount < 300) {
      score -= 15;
      warnings.push(
        "Content appears short - consider expanding for better SEO"
      );
    } else if (estimatedWordCount > 2000) {
      strengths.push("Comprehensive long-form content");
    }

    // Keyword density in title and description
    const titleWords = data.title.toLowerCase().split(/\s+/);
    const descWords = data.description.toLowerCase().split(/\s+/);
    const totalWords = titleWords.length + descWords.length;

    if (data.keywords && data.keywords.length > 0) {
      const keywordDensity = data.keywords.reduce((density, keyword) => {
        const keywordCount = [...titleWords, ...descWords].filter(word =>
          word.includes(keyword.toLowerCase())
        ).length;
        return density + keywordCount / totalWords;
      }, 0);

      if (keywordDensity < 0.02) {
        score -= 10;
        recommendations.push("Increase keyword usage in title and description");
      } else if (keywordDensity > 0.1) {
        score -= 10;
        warnings.push("Potential keyword stuffing detected");
      } else {
        strengths.push("Good keyword density balance");
      }
    }

    // Internal linking potential (based on categories and tags)
    if (data.categories && data.categories.length > 1) {
      strengths.push("Multiple categories enable good internal linking");
    }

    if (data.tags && data.tags.length > 3) {
      strengths.push("Rich tagging supports content discovery");
    }

    // Featured content optimization
    if (data.featured) {
      strengths.push("Featured content receives priority visibility");
    }

    return {
      score: Math.max(0, score),
      criticalIssues,
      warnings,
      recommendations,
      strengths,
    };
  }

  /**
   * Audit health content compliance
   */
  private auditHealthContent(
    post: CollectionEntry<"blog">,
    content?: string
  ): {
    score: number;
    criticalIssues: string[];
    warnings: string[];
    recommendations: string[];
    strengths: string[];
  } {
    const { data } = post;
    const criticalIssues: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];
    const strengths: string[] = [];
    let score = 100;

    // Check if this is health content
    const healthKeywords = [
      "gesundheit",
      "medizin",
      "therapie",
      "heilung",
      "krankheit",
    ];
    const isHealthContent = healthKeywords.some(
      keyword =>
        data.title.toLowerCase().includes(keyword) ||
        data.description.toLowerCase().includes(keyword) ||
        data.categories.some(cat => cat.toLowerCase().includes(keyword))
    );

    if (!isHealthContent) {
      return { score, criticalIssues, warnings, recommendations, strengths };
    }

    // Medical disclaimer audit
    const hasDisclaimer =
      data.description.includes("medizinische beratung") ||
      data.description.includes("arzt") ||
      (content && content.includes("medizinische beratung"));

    if (!hasDisclaimer) {
      score -= 20;
      criticalIssues.push("Health content missing medical disclaimer");
      recommendations.push(
        "Add German medical disclaimer for health content compliance"
      );
    } else {
      strengths.push("Proper medical disclaimer present");
    }

    // Evidence-based content indicators
    if (
      data.keywords &&
      data.keywords.some(
        k =>
          k.includes("studie") ||
          k.includes("forschung") ||
          k.includes("wissenschaft")
      )
    ) {
      strengths.push("Content appears evidence-based");
    } else {
      recommendations.push(
        "Consider referencing scientific studies for health claims"
      );
    }

    // Authority indicators
    if (data.author && data.author !== "anonymous") {
      strengths.push("Content has identified author for health authority");
    }

    // German health authority compliance
    const germanHealthTerms = ["bfarm", "rki", "deutsche", "präventiv"];
    if (
      germanHealthTerms.some(term =>
        data.description.toLowerCase().includes(term)
      )
    ) {
      strengths.push("References German health authorities");
    }

    return {
      score: Math.max(0, score),
      criticalIssues,
      warnings,
      recommendations,
      strengths,
    };
  }

  /**
   * Audit schema markup implementation
   */
  private auditSchemaMarkup(post: CollectionEntry<"blog">): {
    score: number;
    criticalIssues: string[];
    warnings: string[];
    recommendations: string[];
    strengths: string[];
  } {
    const { data } = post;
    const criticalIssues: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];
    const strengths: string[] = [];
    let score = 100;

    // Basic structured data requirements
    if (!data.title) {
      score -= 20;
      criticalIssues.push("Missing title for schema markup");
    }

    if (!data.description) {
      score -= 15;
      criticalIssues.push("Missing description for schema markup");
    }

    if (!data.pubDatetime) {
      score -= 10;
      criticalIssues.push("Missing publication date for article schema");
    }

    if (!data.author) {
      score -= 10;
      warnings.push("Missing author information for schema markup");
    }

    // Enhanced schema opportunities
    if (data.heroImage) {
      strengths.push("Hero image available for rich schema markup");
    }

    if (data.categories && data.categories.length > 0) {
      strengths.push("Categories available for detailed schema classification");
    }

    if (data.modDatetime) {
      strengths.push(
        "Modification date available for schema freshness signals"
      );
    }

    // Health content schema opportunities
    const isHealthContent = data.categories.some(cat =>
      ["Gesundheit", "Ernährung", "Fitness", "Wellness"].includes(cat)
    );

    if (isHealthContent) {
      strengths.push(
        "Health content enables specialized medical schema markup"
      );
      recommendations.push(
        "Implement HealthTopicContent schema for better health SEO"
      );
    }

    return {
      score: Math.max(0, score),
      criticalIssues,
      warnings,
      recommendations,
      strengths,
    };
  }

  /**
   * Calculate overall SEO score with weights
   */
  private calculateOverallScore(scores: {
    technical: number;
    content: number;
    performance: number;
    german: number;
    health: number;
    schema: number;
  }): number {
    // Weights based on importance
    const weights = {
      technical: 0.25, // 25% - Critical foundation
      content: 0.2, // 20% - Content optimization
      performance: 0.2, // 20% - Core Web Vitals
      german: 0.15, // 15% - German optimization
      health: 0.1, // 10% - Health compliance
      schema: 0.1, // 10% - Structured data
    };

    return Math.round(
      scores.technical * weights.technical +
        scores.content * weights.content +
        scores.performance * weights.performance +
        scores.german * weights.german +
        scores.health * weights.health +
        scores.schema * weights.schema
    );
  }

  /**
   * Generate SEO audit report summary
   */
  generateAuditSummary(result: SEOAuditResult): string {
    const grade =
      result.overallScore >= 90
        ? "A"
        : result.overallScore >= 80
          ? "B"
          : result.overallScore >= 70
            ? "C"
            : result.overallScore >= 60
              ? "D"
              : "F";

    return `
SEO Audit Summary
=================

Overall Score: ${result.overallScore}/100 (Grade: ${grade})

Individual Scores:
- Technical SEO: ${result.scores.technical}/100
- Content SEO: ${result.scores.content}/100
- Performance: ${result.scores.performance}/100
- German Optimization: ${result.scores.german}/100
- Health Compliance: ${result.scores.health}/100
- Schema Markup: ${result.scores.schema}/100

Critical Issues (${result.criticalIssues.length}):
${result.criticalIssues.map(issue => `- ${issue}`).join("\n")}

Warnings (${result.warnings.length}):
${result.warnings.map(warning => `- ${warning}`).join("\n")}

Strengths (${result.strengths.length}):
${result.strengths.map(strength => `- ${strength}`).join("\n")}

Top Recommendations:
${result.recommendations
  .slice(0, 5)
  .map(rec => `- ${rec}`)
  .join("\n")}
    `.trim();
  }
}

/**
 * Create singleton instance for global use
 */
export const seoAuditor = new SEOAuditor();
