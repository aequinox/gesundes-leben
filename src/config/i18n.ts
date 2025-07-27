/**
 * @file i18n.ts
 * @description Internationalization configuration for translatable strings
 *
 * Centralized location for all user-facing text that may need translation.
 * Currently supports German (de) with structure for future language expansion.
 */

export type SupportedLanguage = "de" | "en";

export interface I18nStrings {
  seo: {
    medical: {
      disclaimer: string;
      disclaimerShort: string;
      complianceNote: string;
      authorityCompliance: string;
      targetAudience: string;
      contentType: string;
      expertiseLevel: string;
      qualityIndicator: string;
    };
    content: {
      healthCategory: string;
      wellnessCategory: string;
      nutritionCategory: string;
      fitnessCategory: string;
      lifestyleCategory: string;
      generalCategory: string;
    };
    navigation: {
      home: string;
      blog: string;
      about: string;
      contact: string;
      search: string;
      glossary: string;
      favorites: string;
      archives: string;
    };
    organization: {
      description: string;
      serviceOffering: string;
      serviceDescription: string;
      expertiseArea: string;
      audienceType: string;
    };
    meta: {
      defaultImageAlt: string;
      logoCaption: string;
      contentQuality: string;
      freshness: {
        original: string;
        updated: string;
      };
    };
  };
  regions: {
    germany: string;
    austria: string;
    switzerland: string;
    dach: string;
  };
  general: {
    readMore: string;
    backToTop: string;
    loading: string;
    error: string;
    notFound: string;
  };
  search: {
    pageTitle: string;
    pageDescription: string;
    ariaLabel: string;
    placeholder: string;
    devWarning: string;
    buildCommand: string;
    noResults: string;
    oneResult: string;
    manyResults: string;
    searching: string;
    clearSearch: string;
    loadMore: string;
    filters: {
      label: string;
      tags: string;
      type: string;
      contentType: string;
      category: string;
      author: string;
      readingTime: string;
      publishDate: string;
      healthDomain: string;
    };
  };
}

/**
 * German language strings (primary language)
 */
export const deStrings: I18nStrings = {
  seo: {
    medical: {
      disclaimer:
        "Diese Informationen dienen nur zu Informationszwecken und ersetzen keine professionelle medizinische Beratung, Diagnose oder Behandlung. Konsultiere immer einen qualifizierten Arzt oder Gesundheitsdienstleister.",
      disclaimerShort:
        "Diese Informationen ersetzen keine professionelle medizinische Beratung.",
      complianceNote: "Nur zu Informationszwecken",
      authorityCompliance: "BfArM-konform",
      targetAudience: "Allgemeine Öffentlichkeit",
      contentType: "Gesundheitsinformationen",
      expertiseLevel: "Gesundheits- und Wellness-Expertise",
      qualityIndicator: "Redaktionell überprüft",
    },
    content: {
      healthCategory: "Gesundheit",
      wellnessCategory: "Wellness",
      nutritionCategory: "Ernährung",
      fitnessCategory: "Fitness",
      lifestyleCategory: "Lifestyle",
      generalCategory: "Allgemein",
    },
    navigation: {
      home: "Startseite",
      blog: "Blog",
      about: "Über uns",
      contact: "Kontakt",
      search: "Suche",
      glossary: "Glossar",
      favorites: "Favoriten",
      archives: "Archiv",
    },
    organization: {
      description:
        "Dein vertrauenswürdiger Ratgeber für Gesundheit, Ernährung und Wellness im deutschsprachigen Raum.",
      serviceOffering: "Kostenlose Gesundheitsinformationen",
      serviceDescription:
        "Hochwertige Artikel über Gesundheit, Ernährung und Wellness für dich",
      expertiseArea: "Gesundheits- und Wellness-Informationen",
      audienceType: "Gesundheitsinteressierte im deutschsprachigen Raum",
    },
    meta: {
      defaultImageAlt: "Gesundheits- und Wellness-Bild für deine Inspiration",
      logoCaption: "Logo",
      contentQuality: "hochwertig",
      freshness: {
        original: "neu",
        updated: "aktualisiert",
      },
    },
  },
  regions: {
    germany: "Deutschland",
    austria: "Österreich",
    switzerland: "Schweiz",
    dach: "DACH-Region",
  },
  general: {
    readMore: "Weiterlesen",
    backToTop: "Nach oben",
    loading: "Lädt...",
    error: "Ein Fehler ist aufgetreten",
    notFound: "Nicht gefunden",
  },
  search: {
    pageTitle: "Suche",
    pageDescription:
      "Durchsuche alle Artikel nach relevanten Gesundheits- und Wellness-Inhalten...",
    ariaLabel: "Artikel-Suche",
    placeholder: "Artikel durchsuchen...",
    devWarning:
      "DEV-Modus Warnung! Du musst das Projekt mindestens einmal erstellen, um die Suchergebnisse während der Entwicklung zu sehen.",
    buildCommand: "bun run build",
    noResults: "Keine Ergebnisse für [SEARCH_TERM] gefunden",
    oneResult: "Ein Ergebnis für [SEARCH_TERM]",
    manyResults: "[COUNT] Ergebnisse für [SEARCH_TERM]",
    searching: "Suche nach [SEARCH_TERM]...",
    clearSearch: "Suche löschen",
    loadMore: "Mehr laden",
    filters: {
      label: "Filter",
      tags: "Kategorien",
      type: "Typ",
      contentType: "Inhaltstyp",
      category: "Kategorie",
      author: "Autor",
      readingTime: "Lesedauer",
      publishDate: "Veröffentlichungsdatum",
      healthDomain: "Gesundheitsbereich",
    },
  },
};

/**
 * English language strings (future expansion)
 */
export const enStrings: I18nStrings = {
  seo: {
    medical: {
      disclaimer:
        "This information is for informational purposes only and does not replace professional medical advice, diagnosis, or treatment. Always consult a qualified doctor or healthcare provider.",
      disclaimerShort:
        "This information does not replace professional medical advice.",
      complianceNote: "Informational purposes only",
      authorityCompliance: "Health authority compliant",
      targetAudience: "General Public",
      contentType: "Health Information",
      expertiseLevel: "Health and Wellness Writing",
      qualityIndicator: "Editorial reviewed",
    },
    content: {
      healthCategory: "Health",
      wellnessCategory: "Wellness",
      nutritionCategory: "Nutrition",
      fitnessCategory: "Fitness",
      lifestyleCategory: "Lifestyle",
      generalCategory: "General",
    },
    navigation: {
      home: "Home",
      blog: "Blog",
      about: "About",
      contact: "Contact",
      search: "Search",
      glossary: "Glossary",
      favorites: "Favorites",
      archives: "Archives",
    },
    organization: {
      description:
        "Your trusted guide for health, nutrition and wellness information.",
      serviceOffering: "Free Health Information",
      serviceDescription:
        "High-quality articles about health, nutrition and wellness",
      expertiseArea: "Health and Wellness Information",
      audienceType: "Health enthusiasts",
    },
    meta: {
      defaultImageAlt: "Health and wellness image",
      logoCaption: "Logo",
      contentQuality: "high",
      freshness: {
        original: "original",
        updated: "updated",
      },
    },
  },
  regions: {
    germany: "Germany",
    austria: "Austria",
    switzerland: "Switzerland",
    dach: "DACH region",
  },
  general: {
    readMore: "Read more",
    backToTop: "Back to top",
    loading: "Loading...",
    error: "An error occurred",
    notFound: "Not found",
  },
  search: {
    pageTitle: "Search",
    pageDescription:
      "Search all articles for relevant health and wellness content...",
    ariaLabel: "Article search",
    placeholder: "Search articles...",
    devWarning:
      "DEV mode Warning! You need to build the project at least once to see the search results during development.",
    buildCommand: "bun run build",
    noResults: "No results found for [SEARCH_TERM]",
    oneResult: "One result for [SEARCH_TERM]",
    manyResults: "[COUNT] results for [SEARCH_TERM]",
    searching: "Searching for [SEARCH_TERM]...",
    clearSearch: "Clear search",
    loadMore: "Load more",
    filters: {
      label: "Filters",
      tags: "Tags",
      type: "Type",
      contentType: "Content Type",
      category: "Category",
      author: "Author",
      readingTime: "Reading Time",
      publishDate: "Publication Date",
      healthDomain: "Health Domain",
    },
  },
};

/**
 * Get localized strings for the specified language
 */
export function getI18nStrings(
  language: SupportedLanguage = "de"
): I18nStrings {
  switch (language) {
    case "en":
      return enStrings;
    case "de":
    default:
      return deStrings;
  }
}

/**
 * Get specific translation key with fallback
 */
export function t(
  key: string,
  language: SupportedLanguage = "de",
  fallback?: string
): string {
  const strings = getI18nStrings(language);

  // Support nested key access like 'seo.medical.disclaimer'
  const keys = key.split(".");
  let value: unknown = strings;

  for (const k of keys) {
    if (value && typeof value === "object" && k in value) {
      value = (value as Record<string, unknown>)[k];
    } else {
      return fallback || key;
    }
  }

  return typeof value === "string" ? value : fallback || key;
}

/**
 * Category translation helper
 */
export function getCategoryTranslation(
  category: string,
  language: SupportedLanguage = "de"
): string {
  const strings = getI18nStrings(language);
  const categoryKey = category.toLowerCase();

  switch (categoryKey) {
    case "gesundheit":
    case "health":
      return strings.seo.content.healthCategory;
    case "wellness":
      return strings.seo.content.wellnessCategory;
    case "ernährung":
    case "nutrition":
      return strings.seo.content.nutritionCategory;
    case "fitness":
      return strings.seo.content.fitnessCategory;
    case "lifestyle":
      return strings.seo.content.lifestyleCategory;
    default:
      return strings.seo.content.generalCategory;
  }
}

/**
 * Navigation translation helper
 */
export function getNavigationTranslation(
  segment: string,
  language: SupportedLanguage = "de"
): string {
  const strings = getI18nStrings(language);

  switch (segment.toLowerCase()) {
    case "blog":
    case "posts":
      return strings.seo.navigation.blog;
    case "about":
      return strings.seo.navigation.about;
    case "contact":
      return strings.seo.navigation.contact;
    case "search":
      return strings.seo.navigation.search;
    case "glossary":
      return strings.seo.navigation.glossary;
    case "favorites":
      return strings.seo.navigation.favorites;
    case "archives":
      return strings.seo.navigation.archives;
    default:
      return (
        segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ")
      );
  }
}
