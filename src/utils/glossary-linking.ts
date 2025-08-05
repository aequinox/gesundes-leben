/**
 * Glossary Auto-linking Utility
 * Automatically detects and links health and medical terms to glossary definitions
 */

// import type { CollectionEntry } from "astro:content";

// Health and medical terms with their glossary IDs and variations
export const GLOSSARY_TERMS: Record<
  string,
  {
    id: string;
    term: string;
    variations: string[];
    category: "medical" | "nutrition" | "wellness" | "psychology" | "anatomy";
    priority: number; // Higher priority = link first if multiple matches
  }
> = {
  // Nutrition Terms
  mikrobiom: {
    id: "mikrobiom",
    term: "Mikrobiom",
    variations: ["mikrobiom", "darmflora", "darmbakterien", "darm-mikrobiom"],
    category: "nutrition",
    priority: 9,
  },
  probiotika: {
    id: "probiotika",
    term: "Probiotika",
    variations: ["probiotika", "probiotisch", "probiotische bakterien"],
    category: "nutrition",
    priority: 8,
  },
  praebiotika: {
    id: "praebiotika",
    term: "Präbiotika",
    variations: [
      "präbiotika",
      "präbiotisch",
      "ballaststoffe",
      "unverdauliche fasern",
    ],
    category: "nutrition",
    priority: 8,
  },
  antioxidantien: {
    id: "antioxidantien",
    term: "Antioxidantien",
    variations: [
      "antioxidantien",
      "antioxidativ",
      "radikalfänger",
      "freie radikale",
    ],
    category: "nutrition",
    priority: 7,
  },
  "omega-3": {
    id: "omega-3",
    term: "Omega-3-Fettsäuren",
    variations: ["omega-3", "omega 3", "omega-3-fettsäuren", "epa", "dha"],
    category: "nutrition",
    priority: 7,
  },

  // Medical Terms
  inflammation: {
    id: "entzuendung",
    term: "Entzündung",
    variations: [
      "entzündung",
      "entzündungen",
      "entzündlich",
      "inflammatorisch",
      "inflammation",
    ],
    category: "medical",
    priority: 9,
  },
  immunsystem: {
    id: "immunsystem",
    term: "Immunsystem",
    variations: ["immunsystem", "immunabwehr", "abwehrkräfte", "körperabwehr"],
    category: "medical",
    priority: 8,
  },
  "oxidativer-stress": {
    id: "oxidativer-stress",
    term: "Oxidativer Stress",
    variations: [
      "oxidativer stress",
      "oxidation",
      "zellschäden",
      "zellalterung",
    ],
    category: "medical",
    priority: 7,
  },
  "leaky-gut": {
    id: "leaky-gut",
    term: "Leaky-Gut-Syndrom",
    variations: [
      "leaky gut",
      "leaky-gut",
      "durchlässiger darm",
      "darmpermeabilität",
    ],
    category: "medical",
    priority: 6,
  },

  // Anatomy Terms
  "darm-hirn-achse": {
    id: "darm-hirn-achse",
    term: "Darm-Hirn-Achse",
    variations: [
      "darm-hirn-achse",
      "darmhirnachse",
      "gut-brain-axis",
      "enterisches nervensystem",
    ],
    category: "anatomy",
    priority: 8,
  },
  vagusnerv: {
    id: "vagusnerv",
    term: "Vagusnerv",
    variations: ["vagusnerv", "vagus", "parasympathikus", "entspannungsnerv"],
    category: "anatomy",
    priority: 6,
  },
  "blut-hirn-schranke": {
    id: "blut-hirn-schranke",
    term: "Blut-Hirn-Schranke",
    variations: [
      "blut-hirn-schranke",
      "bluthirnschranke",
      "bhs",
      "blood-brain-barrier",
    ],
    category: "anatomy",
    priority: 6,
  },

  // Wellness Terms
  stress: {
    id: "stress",
    term: "Stress",
    variations: ["stress", "stresshormone", "cortisol", "chronischer stress"],
    category: "wellness",
    priority: 7,
  },
  meditation: {
    id: "meditation",
    term: "Meditation",
    variations: [
      "meditation",
      "achtsamkeit",
      "mindfulness",
      "entspannungstechnik",
    ],
    category: "wellness",
    priority: 6,
  },

  // Psychology Terms
  serotonin: {
    id: "serotonin",
    term: "Serotonin",
    variations: ["serotonin", "glückshormon", "neurotransmitter"],
    category: "psychology",
    priority: 7,
  },
  dopamin: {
    id: "dopamin",
    term: "Dopamin",
    variations: ["dopamin", "belohnungshormon", "motivationshormon"],
    category: "psychology",
    priority: 6,
  },
};

export interface GlossaryMatch {
  term: string;
  glossaryId: string;
  startIndex: number;
  endIndex: number;
  priority: number;
  category: string;
}

/**
 * Find glossary terms in content text
 */
export function findGlossaryTerms(content: string): GlossaryMatch[] {
  const matches: GlossaryMatch[] = [];
  const processedContent = content.toLowerCase();

  // Track processed positions to avoid overlapping matches
  const processedPositions = new Set<number>();

  // Sort terms by priority (highest first) to prefer important terms
  const sortedTerms = Object.entries(GLOSSARY_TERMS).sort(
    ([, a], [, b]) => b.priority - a.priority
  );

  for (const [_key, termData] of sortedTerms) {
    for (const variation of termData.variations) {
      const regex = new RegExp(
        `\\b${variation.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
        "gi"
      );
      let match;

      while ((match = regex.exec(processedContent)) !== null) {
        const startIndex = match.index;
        const endIndex = startIndex + match[0].length;

        // Check for overlaps with existing matches
        let hasOverlap = false;
        for (let i = startIndex; i < endIndex; i++) {
          if (processedPositions.has(i)) {
            hasOverlap = true;
            break;
          }
        }

        if (!hasOverlap) {
          matches.push({
            term: match[0],
            glossaryId: termData.id,
            startIndex,
            endIndex,
            priority: termData.priority,
            category: termData.category,
          });

          // Mark positions as processed
          for (let i = startIndex; i < endIndex; i++) {
            processedPositions.add(i);
          }
        }
      }
    }
  }

  // Sort matches by position
  return matches.sort((a, b) => a.startIndex - b.startIndex);
}

/**
 * Check if a position is within certain HTML contexts where we shouldn't add links
 */
function isInRestrictedContext(content: string, position: number): boolean {
  const beforeContent = content.substring(0, position);
  // const afterContent = content.substring(position);

  // Don't link inside existing links
  const lastLinkOpen = beforeContent.lastIndexOf("<a ");
  const lastLinkClose = beforeContent.lastIndexOf("</a>");
  if (lastLinkOpen > lastLinkClose) {
    return true;
  }

  // Don't link inside headers (h1-h6)
  const headerPattern = /<h[1-6][^>]*>/;
  const headerClosePattern = /<\/h[1-6]>/;
  const lastHeaderOpen = beforeContent.search(headerPattern);
  const lastHeaderClose = beforeContent.search(headerClosePattern);
  if (
    lastHeaderOpen > -1 &&
    (lastHeaderClose === -1 || lastHeaderOpen > lastHeaderClose)
  ) {
    return true;
  }

  // Don't link inside code blocks
  const codePattern = /```|`/;
  const codeMatches = beforeContent.match(codePattern);
  if (codeMatches && codeMatches.length % 2 === 1) {
    return true;
  }

  return false;
}

/**
 * Convert glossary matches to InternalLink components
 */
export function processGlossaryLinks(
  content: string,
  maxLinksPerPost: number = 5,
  minTermLength: number = 4
): string {
  let processedContent = content;
  const matches = findGlossaryTerms(content);

  // Filter matches by length and context
  const validMatches = matches.filter(
    match =>
      match.term.length >= minTermLength &&
      !isInRestrictedContext(content, match.startIndex)
  );

  // Limit number of links per post
  const limitedMatches = validMatches.slice(0, maxLinksPerPost);

  // Process matches in reverse order to maintain positions
  for (let i = limitedMatches.length - 1; i >= 0; i--) {
    const match = limitedMatches[i];
    const originalTerm = content.substring(match.startIndex, match.endIndex);

    const linkComponent = `<InternalLink 
      href="/glossary/${match.glossaryId}/"
      variant="inline"
      context="weak"
      class="glossary-link"
      title="Definition: ${GLOSSARY_TERMS[match.glossaryId]?.term || originalTerm}"
    >
      ${originalTerm}
    </InternalLink>`;

    processedContent =
      processedContent.substring(0, match.startIndex) +
      linkComponent +
      processedContent.substring(match.endIndex);
  }

  return processedContent;
}

/**
 * Get glossary term statistics for analytics
 */
export function getGlossaryStats(content: string): {
  totalTerms: number;
  termsByCategory: Record<string, number>;
  topTerms: Array<{ term: string; count: number; category: string }>;
} {
  const matches = findGlossaryTerms(content);
  const termsByCategory: Record<string, number> = {};
  const termCounts: Record<string, number> = {};

  for (const match of matches) {
    const category = GLOSSARY_TERMS[match.glossaryId]?.category || "unknown";
    termsByCategory[category] = (termsByCategory[category] || 0) + 1;
    termCounts[match.term] = (termCounts[match.term] || 0) + 1;
  }

  const topTerms = Object.entries(termCounts)
    .map(([term, count]) => {
      const matchData = Object.values(GLOSSARY_TERMS).find(t =>
        t.variations.some(v => v.toLowerCase() === term.toLowerCase())
      );
      return {
        term,
        count,
        category: matchData?.category || "unknown",
      };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    totalTerms: matches.length,
    termsByCategory,
    topTerms,
  };
}

/**
 * Get related glossary terms based on categories
 */
export function getRelatedGlossaryTerms(
  termId: string,
  limit: number = 5
): Array<{ id: string; term: string; category: string }> {
  const currentTerm = GLOSSARY_TERMS[termId];
  if (!currentTerm) {
    return [];
  }

  const related = Object.entries(GLOSSARY_TERMS)
    .filter(
      ([id, term]) => id !== termId && term.category === currentTerm.category
    )
    .sort(([, a], [, b]) => b.priority - a.priority)
    .slice(0, limit)
    .map(([id, term]) => ({
      id,
      term: term.term,
      category: term.category,
    }));

  return related;
}

/**
 * Validate glossary links in content
 */
export function validateGlossaryLinks(content: string): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check for malformed InternalLink components
  const linkPattern = /<InternalLink[^>]*href="\/glossary\/([^"]+)\/"[^>]*>/g;
  let match;

  while ((match = linkPattern.exec(content)) !== null) {
    const glossaryId = match[1];

    if (!GLOSSARY_TERMS[glossaryId]) {
      errors.push(`Invalid glossary ID: ${glossaryId}`);
    }
  }

  // Check for excessive linking
  const matches = findGlossaryTerms(content);
  if (matches.length > 10) {
    warnings.push(
      `High number of potential glossary links (${matches.length}). Consider limiting to improve readability.`
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

export default {
  GLOSSARY_TERMS,
  findGlossaryTerms,
  processGlossaryLinks,
  getGlossaryStats,
  getRelatedGlossaryTerms,
  validateGlossaryLinks,
};
