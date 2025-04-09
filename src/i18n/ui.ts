/**
 * UI Translation Configuration
 *
 * Defines all text strings used in the UI for different languages.
 * Enables easy maintenance and localization of the application.
 */

export const languages = {
  en: "English",
  de: "Deutsch",
};

export const defaultLang = "de";

interface UITranslations {
  // Navigation
  "nav.skipToContent": string;
  "nav.about": string;
  "nav.authors": string;
  "nav.posts": string;
  "nav.tags": string;
  "nav.categories": string;
  "nav.references": string;
  "nav.search": string;
  "nav.archives": string;
  "nav.glossary": string;
  "nav.ourVision": string;
  "nav.prev": string;
  "nav.next": string;
  "nav.mainNavigation": string;
  "nav.home": string;
  "nav.toggleMenu": string;
  "nav.openMenu": string;
  "nav.closeMenu": string;
  "nav.backHome": string;
  "nav.backToTop": string;
  "nav.page": string;
  "nav.themeToggle": string;
  "nav.searchDescription": string;

  // Categories and Tags
  "category.name": string;
  "tag.name": string;

  // Table of Contents
  "toc.title": string;

  // Pagination
  "pagination.navigation": string;
  "pagination.previous": string;
  "pagination.next": string;
  "pagination.prev": string;
  "pagination.currentPage": string;

  // References
  "references.title": string;
  "references.viewSource": string;
  "references.noReferences": string;

  // Socials
  "socials.navigation": string;
  "socials.visitProfile": string;

  // Posts
  "post.allAuthors": string;
  "post.allTags": string;
  "post.allCategories": string;
  "post.minuteRead": string;
  "post.minutesRead": string;
  "post.publishDate": string;
  "post.lastUpdated": string;
  "post.author": string;
  "post.relatedPosts": string;
  "post.noRelatedPosts": string;
  "post.readMore": string;
  "post.backToTop": string;
  "post.share": string;
  "post.withTag": string;
  "post.withCategory": string;

  // Search
  "search.label": string;
  "search.placeholder": string;
  "search.found": string;
  "search.results": string;
  "search.noResults": string;

  // Theme
  "theme.light": string;
  "theme.dark": string;
  "theme.system": string;

  // Books
  "book.affiliate": string;
  "book.coverAlt": string;
  "book.recommendation": string;
  "book.isbn": string;
  "book.learnMore": string;
  "book.rating": string;

  // Favorites
  "favorites.multipleTitle": string;
  "favorites.singleTitle": string;
  "favorites.description": string;
  "favorites.viewProduct": string;

  // Footer
  "footer.copyright": string;
  "footer.rights": string;

  // Glossary
  "glossary.all": string;
  "glossary.excerpt": string;
  "glossary.readMore": string;
  "glossary.readMoreLabel": string;
  "glossary.description": string;

  // Groups
  "group.select": string;
  "group.pro.title": string;
  "group.pro.slogan": string;
  "group.contra.title": string;
  "group.contra.slogan": string;
  "group.questionTime.title": string;
  "group.questionTime.slogan": string;

  // Date and Time
  "datetime.at": string;
  "readingTime.minutes": string;

  // Author
  "author.from": string;
  "author.name": string;

  // Errors and Warnings
  "errors.404.title": string;
  "errors.404.description": string;
}

export const ui: Record<
  (typeof languages)[keyof typeof languages],
  UITranslations
> = {
  en: {
    // Navigation
    "nav.skipToContent": "Skip to content",
    "nav.about": "About",
    "nav.authors": "Authors",
    "nav.posts": "Posts",
    "nav.tags": "Tags",
    "nav.search": "Search",
    "nav.archives": "Archives",
    "nav.categories": "Categories",
    "nav.references": "References",
    "nav.glossary": "Glossary",
    "nav.ourVision": "Our Vision",
    "nav.prev": "Previous",
    "nav.next": "Next",
    "nav.mainNavigation": "Main navigation",
    "nav.home": "Go to homepage",
    "nav.toggleMenu": "Toggle menu",
    "nav.openMenu": "Open menu",
    "nav.closeMenu": "Close menu",
    "nav.backHome": "Back to homepage",
    "nav.backToTop": "Back to top",
    "nav.page": "Page {page}",
    "nav.themeToggle": "Toggle theme",
    "nav.searchDescription": "Search through posts, categories and tags.",

    // Categories and Tags
    "category.name": "Category",
    "tag.name": "Tag",

    // Table of Contents
    "toc.title": "Table of Contents",

    // Pagination
    "pagination.navigation": "Page navigation",
    "pagination.previous": "Go to previous page",
    "pagination.next": "Go to next page",
    "pagination.prev": "Previous",
    "pagination.currentPage": "Page {current} of {total}",

    // References
    "references.title": "Sources",
    "references.viewSource": "View source for {title}",
    "references.noReferences": "No references available",

    // Socials
    "socials.navigation": "Social media links",
    "socials.visitProfile": "Visit {platform} profile",

    // Posts
    "post.allAuthors": "All Authors",
    "post.allTags": "All Tags",
    "post.allCategories": "All Categories",
    "post.minuteRead": "minute read",
    "post.minutesRead": "minutes read",
    "post.publishDate": "Published:",
    "post.lastUpdated": "Last updated:",
    "post.author": "Author:",
    "post.relatedPosts": "Related Posts",
    "post.noRelatedPosts": "No related posts found",
    "post.readMore": "Read more",
    "post.backToTop": "Back to top",
    "post.share": "Share this post",
    "post.withTag": "with tags",
    "post.withCategory": "in category",

    // Search
    "search.label": "Search",
    "search.placeholder": "Search posts...",
    "search.found": "Found",
    "search.results": "results",
    "search.noResults": "No results found",

    // Theme
    "theme.light": "Light",
    "theme.dark": "Dark",
    "theme.system": "System",

    // Books
    "book.affiliate": "Affiliate",
    "book.coverAlt": 'Cover of the book "{title}" by {author}',
    "book.recommendation": "Book Recommendation",
    "book.isbn": "ISBN:",
    "book.learnMore": "Learn More",
    "book.rating": "{rating} out of 5 stars",

    // Favorites
    "favorites.multipleTitle": "Our Favorites for {topic}",
    "favorites.singleTitle": "Our Favorite for {topic}",
    "favorites.description":
      "We promote partners and products that we believe in and have had excellent experience with in practice. This means they meet high standards in terms of quality, value for money, therapeutic effective dosage, purity, and sustainability. The income we generate through some of the recommendations benefits the blog.",
    "favorites.viewProduct": "View {category} Product",

    // Footer
    "footer.copyright": "Copyright",
    "footer.rights": "All rights reserved.",

    // Glossary
    "glossary.all": "All glossary entries",
    "glossary.excerpt": "Entry excerpt",
    "glossary.readMore": "Read more about {title}",
    "glossary.readMoreLabel": "Read more",
    "glossary.description": "Description",

    // Groups
    "group.select": "Select {type} content",
    "group.pro.title": "Pro",
    "group.pro.slogan":
      "About everything that strengthens, maintains, and promotes your health",
    "group.contra.title": "Contra",
    "group.contra.slogan":
      "About everything that weakens your health and you should avoid",
    "group.questionTime.title": "Question Time",
    "group.questionTime.slogan":
      "About knowledge, science, and reading recommendations",

    // Date and Time
    "datetime.at": "at",
    "readingTime.minutes": "minutes read",

    // Author
    "author.from": "from",
    "author.name": "Author",

    // Errors and Warnings
    "errors.404.title": "Page not found",
    "errors.404.description": "The page you are looking for was not found.",
  },

  de: {
    // Navigation
    "nav.skipToContent": "Zum Inhalt springen",
    "nav.about": "Über uns",
    "nav.authors": "Autoren",
    "nav.posts": "Beiträge",
    "nav.tags": "Tags",
    "nav.search": "Suche",
    "nav.archives": "Archiv",
    "nav.categories": "Kategorien",
    "nav.references": "Quellen",
    "nav.glossary": "Glossar",
    "nav.ourVision": "Unsere Vision",
    "nav.prev": "Zurück",
    "nav.next": "Weiter",
    "nav.mainNavigation": "Hauptnavigation",
    "nav.home": "Zur Startseite",
    "nav.toggleMenu": "Menü umschalten",
    "nav.openMenu": "Menü öffnen",
    "nav.closeMenu": "Menü schließen",
    "nav.backHome": "Zur Startseite",
    "nav.backToTop": "Nach oben",
    "nav.page": "Seite {page}",
    "nav.themeToggle": "Theme umschalten",
    "nav.searchDescription": "Durchsucht Beiträge, Kategorien und Tags.",

    // Categories and Tags
    "category.name": "Kategorie",
    "tag.name": "Tag",

    // Table of Contents
    "toc.title": "Inhaltsverzeichnis",

    // Pagination
    "pagination.navigation": "Seitennavigation",
    "pagination.previous": "Zur vorherigen Seite",
    "pagination.next": "Zur nächsten Seite",
    "pagination.prev": "Zurück",
    "pagination.currentPage": "Seite {current} von {total}",

    // References
    "references.title": "Quellen",
    "references.viewSource": "Quelle für {title} anzeigen",
    "references.noReferences": "Keine Quellen verfügbar",

    // Socials
    "socials.navigation": "Social Media Links",
    "socials.visitProfile": "{platform} Profil besuchen",

    // Posts
    "post.allAuthors": "Alle Autoren",
    "post.allTags": "Alle Tags",
    "post.allCategories": "Alle Kategorien",
    "post.minuteRead": "Minute Lesezeit",
    "post.minutesRead": "Minuten Lesezeit",
    "post.publishDate": "Veröffentlicht:",
    "post.lastUpdated": "Zuletzt aktualisiert:",
    "post.author": "Autor:",
    "post.relatedPosts": "Ähnliche Beiträge",
    "post.noRelatedPosts": "Keine ähnlichen Beiträge gefunden",
    "post.readMore": "Weiterlesen",
    "post.backToTop": "Nach oben",
    "post.share": "Beitrag teilen",
    "post.withTag": "mit Tags",
    "post.withCategory": "in Kategorie",

    // Search
    "search.label": "Suche",
    "search.placeholder": "Beiträge durchsuchen...",
    "search.found": "Gefunden",
    "search.results": "Ergebnisse",
    "search.noResults": "Keine Ergebnisse gefunden",

    // Theme
    "theme.light": "Hell",
    "theme.dark": "Dunkel",
    "theme.system": "System",

    // Books
    "book.affiliate": "Affiliate",
    "book.coverAlt": 'Cover des Buches "{title}" von {author}',
    "book.recommendation": "Buchempfehlung",
    "book.isbn": "ISBN:",
    "book.learnMore": "Mehr erfahren",
    "book.rating": "{rating} von 5 Sternen",

    // Favorites
    "favorites.multipleTitle": "Unsere Favoriten zum Thema {topic}",
    "favorites.singleTitle": "Unser Favorit zum Thema {topic}",
    "favorites.description":
      "Wir werben für Partner und Produkte, von denen wir überzeugt sind und mit denen wir in der Praxis ausgezeichnete Erfahrungen gemacht haben. Das bedeutet, diese entsprechen hohen Standards bezüglich Qualität, Preis-Leistungs-Verhältnis, therapeutisch wirksamer Dosierung, Reinheit und Nachhaltigkeit. Die Einnahmen, die wir durch manche der Empfehlungen erzielen, kommen dem Blog zugute.",
    "favorites.viewProduct": "Zum {category} Produkt",

    // Footer
    "footer.copyright": "Copyright",
    "footer.rights": "Alle Rechte vorbehalten.",

    // Glossary
    "glossary.all": "Alle Glossareinträge",
    "glossary.excerpt": "Eintrag Auszug",
    "glossary.readMore": "Mehr über {title} lesen",
    "glossary.readMoreLabel": "Weiterlesen",
    "glossary.description": "Beschreibung",

    // Groups
    "group.select": "{type} Inhalte auswählen",
    "group.pro.title": "Pro",
    "group.pro.slogan":
      "Über alles, was deine Gesundheit stärkt, sie erhält und fördert",
    "group.contra.title": "Kontra",
    "group.contra.slogan":
      "Über alles, was deine Gesundheit schwächt und du meiden solltest",
    "group.questionTime.title": "Frage-Zeiten",
    "group.questionTime.slogan":
      "Über Wissenswertes, Wissenschaftliches und Lesenswertes",

    // Date and Time
    "datetime.at": "um",
    "readingTime.minutes": "Minuten Lesezeit",

    // Author
    "author.from": "von",
    "author.name": "Autor",

    // Errors and Warnings
    "errors.404.title": "Seite nicht gefunden",
    "errors.404.description":
      "Die Seite, die Sie suchen, wurde nicht gefunden.",
  },
};

export type Languages = keyof typeof ui;
export type TranslationKey = keyof UITranslations;
