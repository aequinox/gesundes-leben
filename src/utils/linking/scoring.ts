/**
 * Link Scoring and Matching Engine
 *
 * Provides algorithms for:
 * - Content relationship scoring
 * - Pattern matching with overlap prevention
 * - Context-aware filtering
 *
 * Single Responsibility: Matching and scoring algorithms
 */

import type { Match, MatchType, Pattern } from "./types";

/**
 * Link scoring weights
 * Used for calculating content relationship strength
 */
export const SCORING_WEIGHTS: Record<MatchType, number> = {
  "exact-keyword": 10,
  "partial-keyword": 6,
  category: 5,
  tag: 4,
  cluster: 3,
  author: 1,
} as const;

/**
 * Link Scorer
 *
 * Calculates relationship scores between content pieces
 */
export class LinkScorer {
  private weights: Record<MatchType, number>;

  constructor(customWeights?: Partial<Record<MatchType, number>>) {
    this.weights = { ...SCORING_WEIGHTS, ...customWeights };
  }

  /**
   * Score a single match
   */
  scoreMatch(matchType: MatchType, multiplier: number = 1): number {
    return (this.weights[matchType] || 0) * multiplier;
  }

  /**
   * Calculate total score from multiple matches
   */
  calculateTotalScore(matches: Array<{ type: MatchType; count?: number }>): number {
    return matches.reduce((total, match) => {
      const count = match.count || 1;
      return total + this.scoreMatch(match.type, count);
    }, 0);
  }

  /**
   * Prioritize items by score
   */
  prioritize<T>(
    items: T[],
    scoreFn: (item: T) => number,
    limit?: number
  ): T[] {
    const sorted = [...items].sort((a, b) => scoreFn(b) - scoreFn(a));
    return limit ? sorted.slice(0, limit) : sorted;
  }

  /**
   * Determine link context strength based on score
   */
  getLinkingContext(score: number): "strong" | "moderate" | "weak" {
    if (score >= 15) return "strong";
    if (score >= 8) return "moderate";
    return "weak";
  }
}

/**
 * Matching Engine
 *
 * Finds and processes pattern matches in content
 */
export class MatchingEngine {
  /**
   * Find all pattern matches in content
   */
  findMatches(content: string, patterns: Pattern[]): Match[] {
    const matches: Match[] = [];

    // Sort patterns by priority (higher priority first)
    const sortedPatterns = [...patterns].sort(
      (a, b) => b.priority - a.priority
    );

    for (const pattern of sortedPatterns) {
      const regex = new RegExp(pattern.regex, "gi");
      let match: RegExpExecArray | null;

      while ((match = regex.exec(content)) !== null) {
        matches.push({
          term: pattern.term,
          startIndex: match.index,
          endIndex: match.index + match[0].length,
          priority: pattern.priority,
          category: pattern.category,
        });
      }
    }

    return matches;
  }

  /**
   * Prevent overlapping matches (keep higher priority)
   */
  preventOverlaps(matches: Match[]): Match[] {
    if (matches.length === 0) return [];

    // Sort by priority (descending) then by position (ascending)
    const sorted = [...matches].sort((a, b) => {
      if (a.priority !== b.priority) {
        return b.priority - a.priority;
      }
      return a.startIndex - b.startIndex;
    });

    const nonOverlapping: Match[] = [];
    const processedRanges: Array<[number, number]> = [];

    for (const match of sorted) {
      // Check if this match overlaps with any processed range
      const overlaps = processedRanges.some(
        ([start, end]) =>
          (match.startIndex >= start && match.startIndex < end) ||
          (match.endIndex > start && match.endIndex <= end) ||
          (match.startIndex <= start && match.endIndex >= end)
      );

      if (!overlaps) {
        nonOverlapping.push(match);
        processedRanges.push([match.startIndex, match.endIndex]);
      }
    }

    // Sort by position for final output
    return nonOverlapping.sort((a, b) => a.startIndex - b.startIndex);
  }

  /**
   * Filter matches by context (avoid headers, code blocks, existing links)
   */
  filterByContext(matches: Match[], content: string): Match[] {
    return matches.filter((match) =>
      !this.isInRestrictedContext(match, content)
    );
  }

  /**
   * Check if match is in a restricted context
   */
  private isInRestrictedContext(match: Match, content: string): boolean {
    const beforeMatch = content.substring(0, match.startIndex);
    const afterMatch = content.substring(match.endIndex);

    // Check for markdown headers
    const lastNewline = beforeMatch.lastIndexOf("\n");
    const lineStart = lastNewline === -1 ? 0 : lastNewline + 1;
    const lineBeforeMatch = content.substring(lineStart, match.startIndex);

    if (/^#{1,6}\s/.test(lineBeforeMatch.trim())) {
      return true; // Inside header
    }

    // Check for code blocks
    const codeBlockBefore = (beforeMatch.match(/```/g) || []).length;
    if (codeBlockBefore % 2 === 1) {
      return true; // Inside code block
    }

    // Check for inline code
    const inlineCodeBefore = (beforeMatch.match(/`/g) || []).length;
    if (inlineCodeBefore % 2 === 1) {
      return true; // Inside inline code
    }

    // Check for existing links
    const linkBefore = beforeMatch.lastIndexOf("[");
    const linkCloseBefore = beforeMatch.lastIndexOf("]");
    const linkAfter = afterMatch.indexOf("]");

    if (
      linkBefore > linkCloseBefore &&
      linkAfter !== -1 &&
      linkAfter < 100
    ) {
      return true; // Inside existing link
    }

    // Check if already inside an HTML link
    if (/<a\s[^>]*>/.test(beforeMatch) && !/<\/a>/.test(beforeMatch.split(/<a\s[^>]*>/).pop() || "")) {
      return true; // Inside HTML link
    }

    return false;
  }

  /**
   * Extract context around a match (for anchor text suggestions)
   */
  extractContext(match: Match, content: string, contextLength: number = 50): {
    before: string;
    matched: string;
    after: string;
  } {
    const before = content.substring(
      Math.max(0, match.startIndex - contextLength),
      match.startIndex
    );
    const matched = content.substring(match.startIndex, match.endIndex);
    const after = content.substring(
      match.endIndex,
      Math.min(content.length, match.endIndex + contextLength)
    );

    return {
      before: before.trim(),
      matched,
      after: after.trim(),
    };
  }
}

/**
 * Text normalization utilities
 */
export class TextNormalizer {
  /**
   * Normalize text for matching (lowercase, trim)
   */
  static normalize(text: string): string {
    return text.toLowerCase().trim();
  }

  /**
   * Escape regex special characters
   */
  static escapeRegex(text: string): string {
    return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  /**
   * Create regex pattern for term with word boundaries
   */
  static createWordPattern(term: string, caseSensitive: boolean = false): RegExp {
    const escaped = this.escapeRegex(term);
    const flags = caseSensitive ? "g" : "gi";
    return new RegExp(`\\b${escaped}\\b`, flags);
  }

  /**
   * Create regex pattern for term variations
   */
  static createVariationsPattern(
    terms: string[],
    caseSensitive: boolean = false
  ): RegExp {
    const patterns = terms.map((term) => this.escapeRegex(term));
    const joined = patterns.join("|");
    const flags = caseSensitive ? "g" : "gi";
    return new RegExp(`\\b(${joined})\\b`, flags);
  }
}

/**
 * Default scorer instance
 */
export const defaultScorer = new LinkScorer();

/**
 * Default matching engine instance
 */
export const defaultMatcher = new MatchingEngine();
