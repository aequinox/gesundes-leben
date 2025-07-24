/**
 * @file german-seo-optimization.ts
 * @description German language-specific SEO optimizations
 *
 * Features:
 * - German keyword optimization
 * - Local German market targeting
 * - German health content compliance
 * - DACH region optimization
 * - German typography and readability
 * - Local business schema for German market
 */
import type { CollectionEntry } from "astro:content";

export interface GermanSEOConfig {
  /** Target German regions */
  regions: ("DE" | "AT" | "CH")[];
  /** German health authority compliance */
  healthCompliance: boolean;
  /** Local German business targeting */
  localBusiness: boolean;
  /** German typography optimization */
  typography: boolean;
}

const DEFAULT_CONFIG: GermanSEOConfig = {
  regions: ["DE", "AT", "CH"],
  healthCompliance: true,
  localBusiness: true,
  typography: true,
};

/**
 * German SEO optimization utilities
 */
export class GermanSEOOptimizer {
  private config: GermanSEOConfig;

  constructor(config: Partial<GermanSEOConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * German health keywords mapping for SEO
   */
  private healthKeywordMap: Record<string, string[]> = {
    gesundheit: [
      "gesund leben",
      "gesunde lebensweise",
      "gesundheitstipps",
      "wohlbefinden",
      "gesundheitsratgeber",
      "präventivmedizin",
    ],
    ernährung: [
      "gesunde ernährung",
      "ernährungstipps",
      "diät",
      "abnehmen",
      "nährstoffe",
      "vitamine",
      "mineralstoffe",
      "ernährungsberatung",
    ],
    fitness: [
      "sportübungen",
      "training",
      "bewegung",
      "körperliche fitness",
      "workouts",
      "krafttraining",
      "ausdauertraining",
      "yoga",
    ],
    wellness: [
      "entspannung",
      "stressabbau",
      "meditation",
      "achtsamkeit",
      "wellnesstrends",
      "selbstfürsorge",
      "mentale gesundheit",
    ],
    medizin: [
      "heilung",
      "therapie",
      "behandlung",
      "diagnose",
      "symptome",
      "krankheitsprävention",
      "medizinische beratung",
      "naturheilkunde",
    ],
  };

  /**
   * German region-specific search terms
   */
  private regionKeywords: Record<string, string[]> = {
    DE: [
      "deutschland",
      "deutsch",
      "bundesrepublik",
      "deutsche gesundheit",
      "bfarm",
      "rki",
      "deutsche ernährung",
      "krankenkasse",
    ],
    AT: [
      "österreich",
      "österreichisch",
      "austrian health",
      "österreichische ernährung",
      "sozialversicherung",
      "gesundheit austria",
    ],
    CH: [
      "schweiz",
      "schweizerisch",
      "swiss health",
      "schweizer ernährung",
      "bag",
      "swissmedic",
      "gesundheit schweiz",
    ],
  };

  /**
   * Optimize German health content titles
   */
  optimizeGermanTitle(
    title: string,
    category: string,
    targetRegions: ("DE" | "AT" | "CH")[] = ["DE"]
  ): {
    optimizedTitle: string;
    suggestions: string[];
  } {
    const suggestions: string[] = [];
    let optimizedTitle = title;

    // Add regional context if missing
    const hasRegionalContext = targetRegions.some(region =>
      this.regionKeywords[region].some(keyword =>
        title.toLowerCase().includes(keyword)
      )
    );

    if (!hasRegionalContext && title.length < 55) {
      optimizedTitle = `${title} – Ihr deutscher Gesundheitsratgeber`;
      suggestions.push("Added German regional context to title");
    }

    // Ensure health keyword presence
    const categoryKeywords =
      this.healthKeywordMap[category.toLowerCase()] || [];
    const hasHealthKeyword = categoryKeywords.some(keyword =>
      title.toLowerCase().includes(keyword)
    );

    if (!hasHealthKeyword && categoryKeywords.length > 0) {
      suggestions.push(
        `Consider adding health keywords: ${categoryKeywords.slice(0, 3).join(", ")}`
      );
    }

    // German typography optimization
    optimizedTitle = this.optimizeGermanTypography(optimizedTitle);

    return {
      optimizedTitle,
      suggestions,
    };
  }

  /**
   * Optimize German health content descriptions
   */
  optimizeGermanDescription(
    description: string,
    category: string,
    _keywords: string[] = []
  ): {
    optimizedDescription: string;
    suggestions: string[];
  } {
    const suggestions: string[] = [];
    let optimizedDescription = description;

    // Ensure German health compliance disclaimer
    if (
      this.config.healthCompliance &&
      category.toLowerCase() === "gesundheit"
    ) {
      if (
        !description.includes("medizinische beratung") &&
        !description.includes("arzt")
      ) {
        optimizedDescription +=
          " Diese Informationen ersetzen keine professionelle medizinische Beratung.";
        suggestions.push("Added German health compliance disclaimer");
      }
    }

    // Add German action words for better CTR
    const germanActionWords = [
      "entdecken sie",
      "erfahren sie",
      "lernen sie",
      "finden sie heraus",
      "tipps für",
      "ratgeber für",
      "alles über",
      "so geht's",
    ];

    const hasActionWord = germanActionWords.some(word =>
      description.toLowerCase().includes(word)
    );

    if (!hasActionWord && description.length < 140) {
      suggestions.push(
        `Consider adding German action words: ${germanActionWords.slice(0, 3).join(", ")}`
      );
    }

    // Optimize German typography
    optimizedDescription = this.optimizeGermanTypography(optimizedDescription);

    return {
      optimizedDescription,
      suggestions,
    };
  }

  /**
   * Generate German-specific keywords
   */
  generateGermanKeywords(
    title: string,
    description: string,
    category: string,
    existingKeywords: string[] = []
  ): string[] {
    const germanKeywords: Set<string> = new Set(existingKeywords);

    // Add category-specific German keywords
    const categoryKeywords =
      this.healthKeywordMap[category.toLowerCase()] || [];
    categoryKeywords.forEach(keyword => germanKeywords.add(keyword));

    // Extract German compound words
    const compoundWords = this.extractGermanCompoundWords(
      `${title} ${description}`
    );
    compoundWords.forEach(word => germanKeywords.add(word));

    // Add regional keywords
    this.config.regions.forEach(region => {
      const regionKeywords = this.regionKeywords[region] || [];
      regionKeywords
        .slice(0, 2)
        .forEach(keyword => germanKeywords.add(keyword));
    });

    // German health-specific terms
    if (category.toLowerCase() === "gesundheit") {
      [
        "gesunde lebensweise",
        "präventivmedizin",
        "wohlbefinden",
        "gesundheitsprävention",
        "natürliche heilung",
      ].forEach(keyword => germanKeywords.add(keyword));
    }

    return Array.from(germanKeywords).slice(0, 15); // Limit for SEO
  }

  /**
   * Extract German compound words for keywords
   */
  private extractGermanCompoundWords(text: string): string[] {
    const germanCompounds: string[] = [];
    const words = text.toLowerCase().split(/\s+/);

    // Common German health compound patterns
    const healthPrefixes = ["gesund", "ernähr", "fitness", "wellness"];
    const healthSuffixes = ["heit", "ung", "tipps", "ratgeber", "beratung"];

    words.forEach(word => {
      // Find compound words with health prefixes/suffixes
      healthPrefixes.forEach(prefix => {
        if (word.startsWith(prefix) && word.length > prefix.length + 3) {
          germanCompounds.push(word);
        }
      });

      healthSuffixes.forEach(suffix => {
        if (word.endsWith(suffix) && word.length > suffix.length + 3) {
          germanCompounds.push(word);
        }
      });
    });

    return [...new Set(germanCompounds)];
  }

  /**
   * Optimize German typography for better readability
   */
  private optimizeGermanTypography(text: string): string {
    return (
      text
        // Fix common German typography issues
        .replace(/ß/g, "ß") // Ensure proper ß
        .replace(/ae/g, "ä") // Convert ae to ä where appropriate
        .replace(/oe/g, "ö") // Convert oe to ö where appropriate
        .replace(/ue/g, "ü") // Convert ue to ü where appropriate
        .replace(/Ae/g, "Ä") // Convert Ae to Ä where appropriate
        .replace(/Oe/g, "Ö") // Convert Oe to Ö where appropriate
        .replace(/Ue/g, "Ü") // Convert Ue to Ü where appropriate
        // Improve German quotation marks
        .replace(/"/g, "„")
        .replace(/"/g, '"')
        .trim()
    );
  }

  /**
   * Generate German local business schema
   */
  generateGermanLocalBusinessSchema(businessInfo: {
    name: string;
    description: string;
    website: string;
  }) {
    return {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "@id": `${businessInfo.website}#localbusiness`,
      name: businessInfo.name,
      description: businessInfo.description,
      url: businessInfo.website,
      areaServed: this.config.regions.map(region => ({
        "@type": "Country",
        name:
          region === "DE"
            ? "Deutschland"
            : region === "AT"
              ? "Österreich"
              : "Schweiz",
      })),
      inLanguage: ["de-DE", "de-AT", "de-CH"],
      knowsLanguage: [
        {
          "@type": "Language",
          name: "Deutsch",
          alternateName: "German",
        },
      ],
      serviceArea: {
        "@type": "GeoCircle",
        geoMidpoint: {
          "@type": "GeoCoordinates",
          latitude: 51.1657, // Germany center
          longitude: 10.4515,
        },
        geoRadius: "1000", // km
      },
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Deutsche Gesundheits- und Wellness-Informationen",
        itemListElement: [
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Kostenlose Gesundheitsinformationen auf Deutsch",
              description:
                "Vertrauenswürdige Gesundheits- und Wellness-Informationen für den deutschsprachigen Raum",
            },
          },
        ],
      },
    };
  }

  /**
   * Analyze German content SEO score
   */
  analyzeGermanContentSEO(
    post: CollectionEntry<"blog">,
    content?: string
  ): {
    score: number;
    issues: string[];
    recommendations: string[];
  } {
    const { data } = post;
    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 100;

    // Title analysis
    if (data.title.length > 60) {
      score -= 10;
      issues.push(
        `Title too long (${data.title.length} chars). German titles should be under 60 characters.`
      );
    }

    if (data.title.length < 30) {
      score -= 5;
      issues.push(
        "Title too short. Consider adding more descriptive German keywords."
      );
    }

    // Description analysis
    if (data.description.length > 160) {
      score -= 10;
      issues.push(
        `Description too long (${data.description.length} chars). Keep under 160 characters.`
      );
    }

    if (data.description.length < 120) {
      score -= 5;
      issues.push(
        "Description could be longer for better German SEO (120-160 chars recommended)."
      );
    }

    // German keyword analysis
    const hasGermanHealthKeywords = Object.keys(this.healthKeywordMap).some(
      category =>
        data.title.toLowerCase().includes(category) ||
        data.description.toLowerCase().includes(category)
    );

    if (!hasGermanHealthKeywords) {
      score -= 15;
      issues.push("Missing German health keywords in title or description.");
      recommendations.push(
        'Add German health keywords like "gesundheit", "ernährung", "wellness"'
      );
    }

    // Regional targeting
    const hasRegionalContext = this.config.regions.some(region =>
      this.regionKeywords[region].some(
        keyword =>
          data.title.toLowerCase().includes(keyword) ||
          data.description.toLowerCase().includes(keyword)
      )
    );

    if (!hasRegionalContext) {
      score -= 5;
      recommendations.push(
        "Consider adding German regional context (Deutschland, DACH region)"
      );
    }

    // Health compliance for German market
    if (this.config.healthCompliance && data.categories.includes("Ernährung")) {
      const hasDisclaimer =
        data.description.includes("medizinische beratung") ||
        (content && content.includes("medizinische beratung"));

      if (!hasDisclaimer) {
        score -= 10;
        issues.push("Missing German health compliance disclaimer");
        recommendations.push(
          'Add disclaimer: "Diese Informationen ersetzen keine professionelle medizinische Beratung"'
        );
      }
    }

    return {
      score: Math.max(0, score),
      issues,
      recommendations,
    };
  }
}

/**
 * Create singleton instance for global use
 */
export const germanSEOOptimizer = new GermanSEOOptimizer();
