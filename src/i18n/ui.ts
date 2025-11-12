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

export interface UITranslations {
  // Navigation
  "nav.skipToContent": string;
  "nav.about": string;
  "nav.authors": string;
  "nav.posts": string;
  "nav.tags": string;
  "nav.allTags": string;
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

  // Months
  "month.january": string;
  "month.february": string;
  "month.march": string;
  "month.april": string;
  "month.may": string;
  "month.june": string;
  "month.july": string;
  "month.august": string;
  "month.september": string;
  "month.october": string;
  "month.november": string;
  "month.december": string;

  // Categories and Tags
  "category.name": string;
  "tag.name": string;
  "tag.popularTags": string;
  "tag.popularTagsDescription": string;
  "tag.allTags": string;
  "tag.allTagsDescription": string;
  "tag.searchPlaceholder": string;
  "tag.post": string;
  "tag.posts": string;

  // Table of Contents
  "toc.title": string;

  // Pagination
  "pagination.navigation": string;
  "pagination.previous": string;
  "pagination.next": string;
  "pagination.prev": string;
  "pagination.currentPage": string;
  "pagination.separator": string;

  // References
  "references.title": string;
  "references.viewSource": string;
  "references.noReferences": string;

  // Socials
  "socials.navigation": string;
  "socials.visitProfile": string;

  // Posts
  "post.post": string;
  "post.posts": string;
  "post.allPosts": string;
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
  "post.noPostsFound": string;

  // Sharing
  "share.title": string;
  "share.whatsapp": string;
  "share.facebook": string;
  "share.twitter": string;
  "share.telegram": string;
  "share.linkedin": string;
  "share.reddit": string;
  "share.pinterest": string;
  "share.email": string;

  // Search
  "search.clear": string;
  "search.label": string;
  "search.placeholder": string;
  "search.found": string;
  "search.results": string;
  "search.noResults": string;
  "search.loadMore": string;
  "search.searchLabel": string;
  "search.filtersLabel": string;
  "search.zeroResults": string;
  "search.manyResults": string;
  "search.oneResult": string;
  "search.altSearch": string;
  "search.suggestion": string;
  "search.searching": string;

  // Theme
  "theme.light": string;
  "theme.dark": string;
  "theme.system": string;

  // Books
  "book.affiliate": string;
  "book.coverAlt": string;
  "book.recommendation": string;
  "book.recommendations": string;
  "book.noRecommendations": string;
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
  "footer.imprint": string;
  "footer.siteFooter": string;

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

  // Filter
  "filter.content": string;
  "filter.postAvailable": string;
  "filter.postsAvailable": string;
  "filter.posts": string;
  "filter.categories": string;
  "filter.reset": string;
  "filter.noResults": string;
  "filter.noResultsHelp": string;
  "filter.clearFilters": string;

  // Date and Time
  "datetime.at": string;
  "readingTime.minutes": string;

  // Author
  "author.from": string;
  "author.name": string;

  // Errors and Warnings
  "errors.404.title": string;
  "errors.404.description": string;
  "errors.loading": string;
  "errors.retry": string;

  // Archives
  "archive.description": string;

  // Tags
  "tags.description": string;

  // Categories
  "categories.description": string;
  "categories.ernaehrung.description": string;
  "categories.immunsystem.description": string;
  "categories.lesenswertes.description": string;
  "categories.lifestyle-und-psyche.description": string;
  "categories.mikronaehrstoffe.description": string;
  "categories.organsysteme.description": string;
  "categories.wissenschaftliches.description": string;
  "categories.wissenswertes.description": string;

  // Internal Linking & Topic Clusters
  "cluster.articles": string;
  "cluster.categories": string;
  "cluster.minutesReadTime": string;
  "cluster.comprehensiveGuide": string;
  "cluster.tip": string;
  "cluster.startWithGuide": string;
  "cluster.toCompleteGuide": string;
  "cluster.discoverDescription": string;
  "cluster.allArticlesScientific": string;
  "cluster.partOfSeries": string;
  "cluster.belongsToSeries": string;
  "cluster.stronglyRelated": string;
  "cluster.discoverMore": string;
  "cluster.allArticlesFor": string;
  "cluster.comprehensiveUnderstanding": string;
  "cluster.relatedArticles": string;
  "cluster.furtherInformation": string;
  "cluster.mightAlsoInterest": string;
  "cluster.general": string;

  // Content Series
  "series.part": string;
  "series.of": string;
  "series.previousArticle": string;
  "series.nextArticle": string;
  "series.firstArticle": string;
  "series.lastArticle": string;
  "series.allArticlesInSeries": string;
  "series.youAreHere": string;
  "series.tipReadAll": string;
  "series.completeUnderstanding": string;
  "series.before": string;
  "series.next": string;

  // Pillar Navigation
  "pillar.completeGuide": string;
  "pillar.comprehensiveGuide": string;
  "pillar.article": string;
  "pillar.tipBestLearning": string;
  "pillar.readAllArticles": string;
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
    "nav.allTags": "All tags",
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

    // Months
    "month.january": "January",
    "month.february": "February",
    "month.march": "March",
    "month.april": "April",
    "month.may": "May",
    "month.june": "June",
    "month.july": "July",
    "month.august": "August",
    "month.september": "September",
    "month.october": "October",
    "month.november": "November",
    "month.december": "December",

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
    "pagination.separator": "/",

    // References
    "references.title": "Sources",
    "references.viewSource": "View source for {title}",
    "references.noReferences": "No references available",

    // Socials
    "socials.navigation": "Social media links",
    "socials.visitProfile": "Visit {platform} profile",

    // Sharing
    "share.title": "Share this post",
    "share.whatsapp": "Share via WhatsApp",
    "share.facebook": "Share this post on Facebook",
    "share.twitter": "Tweet this post",
    "share.telegram": "Share via Telegram",
    "share.linkedin": "Share via LinkedIn",
    "share.reddit": "Share via Reddit",
    "share.pinterest": "Share via Pinterest",
    "share.email": "Share via Email",

    // Posts
    "post.post": "Post",
    "post.posts": "Posts",
    "post.allPosts": "Alle Posts",
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
    "post.withTag": "with tag",
    "post.withCategory": "in category",
    "post.noPostsFound": "No post found",

    // Search
    "search.label": "Search",
    "search.placeholder": "Search posts...",
    "search.found": "Found",
    "search.results": "results",
    "search.noResults": "No results found",
    "search.clear": "Clear",
    "search.loadMore": "Load more results",
    "search.searchLabel": "Search this site",
    "search.filtersLabel": "Filters",
    "search.zeroResults": "No results for {searchTerm}",
    "search.manyResults": "{count} results for {searchTerm}",
    "search.oneResult": "{count} result for {searchTerm}",
    "search.altSearch":
      "No results for {searchTerm}. Showing results for {differentTerm} instead",
    "search.suggestion":
      "No results for {searchTerm}. Try one of the following searches:",
    "search.searching": "Searching for {searchTerm}...",

    // Theme
    "theme.light": "Light",
    "theme.dark": "Dark",
    "theme.system": "System",

    // Books
    "book.affiliate": "Affiliate",
    "book.coverAlt": 'Cover of the book "{title}" by {author}',
    "book.recommendation": "Book Recommendation",
    "book.recommendations": "Book Recommendations",
    "book.noRecommendations":
      "No book recommendations available at the moment. Check back soon!",
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
    "footer.imprint": "Imprint",
    "footer.siteFooter": "Site footer",

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

    // Filter
    "filter.content": "Filter Content",
    "filter.postAvailable": "post available",
    "filter.postsAvailable": "posts available",
    "filter.posts": "posts",
    "filter.categories": "Categories",
    "filter.reset": "Reset",
    "filter.noResults": "No matching posts found",
    "filter.noResultsHelp":
      "Try adjusting your filter criteria or selecting different categories",
    "filter.clearFilters": "Clear All Filters",

    // Date and Time
    "datetime.at": "at",
    "readingTime.minutes": "minutes read",

    // Author
    "author.from": "from",
    "author.name": "Author",

    // Errors and Warnings
    "errors.404.title": "Page not found",
    "errors.404.description": "The page you are looking for was not found.",
    "errors.loading": "Error loading content",
    "errors.retry": "Retry",

    // Archives
    "archive.description":
      "A comprehensive collection of all our published articles, organized by year.",

    // Tags
    "tags.description":
      "Explore articles grouped by specific topics and themes.",
    "tag.popularTags": "Popular Tags",

    // Categories
    "categories.description": "Explore articles in this category.",
    "categories.ernaehrung.description":
      "Evidence-based nutrition and healthy eating for optimal health.",
    "categories.immunsystem.description":
      "Science-backed strategies to strengthen your immune system naturally.",
    "categories.lesenswertes.description":
      "Curated books, studies, and health resources.",
    "categories.lifestyle-und-psyche.description":
      "Mental health and well-being with practical lifestyle tips.",
    "categories.mikronaehrstoffe.description":
      "Vitamins, minerals, and optimal micronutrient supplementation.",
    "categories.organsysteme.description":
      "How your organ systems work and how to support them.",
    "categories.wissenschaftliches.description":
      "Current research and evidence-based health information.",
    "categories.wissenswertes.description":
      "Interesting facts and educational health content.",
    "tag.popularTagsDescription":
      "Our most frequently used topics to help you find relevant content",
    "tag.allTags": "All Tags",
    "tag.allTagsDescription": "Explore our complete collection of topics",
    "tag.searchPlaceholder": "Search tags...",
    "tag.post": "post",
    "tag.posts": "posts",

    // Internal Linking & Topic Clusters
    "cluster.articles": "Articles",
    "cluster.categories": "Categories",
    "cluster.minutesReadTime": "Min Reading Time",
    "cluster.comprehensiveGuide": "Comprehensive Guide",
    "cluster.tip": "Tip:",
    "cluster.startWithGuide":
      "Start with the guide and work your way through the related articles.",
    "cluster.toCompleteGuide": "To Complete Guide",
    "cluster.discoverDescription": "Discover comprehensive information about",
    "cluster.allArticlesScientific":
      "All articles are scientifically based and practice-oriented.",
    "cluster.partOfSeries": "Part of the {name} series",
    "cluster.belongsToSeries":
      "These articles belong to our comprehensive series about {name}.",
    "cluster.stronglyRelated": "Strongly Related",
    "cluster.discoverMore": "💡 Discover more:",
    "cluster.allArticlesFor":
      "All articles about {name} for comprehensive understanding",
    "cluster.comprehensiveUnderstanding": "comprehensive understanding",
    "cluster.relatedArticles": "Related Articles",
    "cluster.furtherInformation": "Further Information",
    "cluster.mightAlsoInterest": "This might also interest you",
    "cluster.general": "General",

    // Content Series
    "series.part": "Part",
    "series.of": "of",
    "series.previousArticle": "← Previous Article",
    "series.nextArticle": "Next Article →",
    "series.firstArticle": "← First Article",
    "series.lastArticle": "Last Article →",
    "series.allArticlesInSeries": "All Articles in This Series",
    "series.youAreHere": "You are here",
    "series.tipReadAll":
      "💡 Tip: Read all articles in this series for complete understanding of the topic.",
    "series.completeUnderstanding": "complete understanding",
    "series.before": "Before:",
    "series.next": "Next:",

    // Pillar Navigation
    "pillar.completeGuide": "Complete Guide",
    "pillar.comprehensiveGuide": "Comprehensive Guide:",
    "pillar.article": "Article {current} of {total}",
    "pillar.tipBestLearning":
      "💡 Tip: For the best learning outcome, we recommend reading all articles",
    "pillar.readAllArticles": "read all articles",
  },

  de: {
    // Navigation
    "nav.skipToContent": "Zum Inhalt springen",
    "nav.about": "Über uns",
    "nav.authors": "Autoren",
    "nav.posts": "Artikel",
    "nav.tags": "Tags",
    "nav.allTags": "Alle Tags",
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
    "nav.searchDescription": "Durchsucht Artikel, Kategorien und Tags.",

    // Months
    "month.january": "Januar",
    "month.february": "Februar",
    "month.march": "März",
    "month.april": "April",
    "month.may": "Mai",
    "month.june": "Juni",
    "month.july": "Juli",
    "month.august": "August",
    "month.september": "September",
    "month.october": "Oktober",
    "month.november": "November",
    "month.december": "Dezember",

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
    "pagination.separator": "/",

    // References
    "references.title": "Quellen",
    "references.viewSource": "Quelle für {title} anzeigen",
    "references.noReferences": "Keine Quellen verfügbar",

    // Socials
    "socials.navigation": "Social Media Links",
    "socials.visitProfile": "{platform} Profil besuchen",

    // Sharing
    "share.title": "Artikel teilen",
    "share.whatsapp": "Via WhatsApp teilen",
    "share.facebook": "Artikel auf Facebook teilen",
    "share.twitter": "Via Twitter teilen",
    "share.telegram": "Via Telegram teilen",
    "share.linkedin": "Via LinkedIn teilen",
    "share.reddit": "Via Reddit teilen",
    "share.pinterest": "Via Pinterest teilen",
    "share.email": "Via Email teilen",

    // Posts
    "post.post": "Artikel",
    "post.posts": "Artikel",
    "post.allPosts": "Alle Artikel",
    "post.allAuthors": "Alle Autoren",
    "post.allTags": "Alle Tags",
    "post.allCategories": "Alle Kategorien",
    "post.minuteRead": "Minute Lesezeit",
    "post.minutesRead": "Minuten Lesezeit",
    "post.publishDate": "Veröffentlicht:",
    "post.lastUpdated": "Zuletzt aktualisiert:",
    "post.author": "Autor:",
    "post.relatedPosts": "Ähnliche Artikel",
    "post.noRelatedPosts": "Keine ähnlichen Artikel gefunden",
    "post.readMore": "Weiterlesen",
    "post.backToTop": "Nach oben",
    "post.share": "Artikel teilen",
    "post.withTag": "mit dem Tag",
    "post.withCategory": "in Kategorie",
    "post.noPostsFound": "Keine Artikel gefunden",

    // Search
    "search.label": "Suche",
    "search.placeholder": "Artikel durchsuchen...",
    "search.found": "Gefunden",
    "search.results": "Ergebnisse",
    "search.noResults": "Keine Ergebnisse gefunden",
    "search.clear": "Löschen",
    "search.loadMore": "Mehr Ergebnisse laden",
    "search.searchLabel": "Diese Website durchsuchen",
    "search.filtersLabel": "Filter",
    "search.zeroResults": "Keine Ergebnisse für {searchTerm}",
    "search.manyResults": "{count} Ergebnisse für {searchTerm}",
    "search.oneResult": "{count} Ergebnis für {searchTerm}",
    "search.altSearch":
      "Keine Ergebnisse für {searchTerm}. Zeige stattdessen Ergebnisse für {differentTerm}",
    "search.suggestion":
      "Keine Ergebnisse für {searchTerm}. Versuchen Sie eine der folgenden Suchen:",
    "search.searching": "Suche nach {searchTerm}...",

    // Theme
    "theme.light": "Hell",
    "theme.dark": "Dunkel",
    "theme.system": "System",

    // Books
    "book.affiliate": "Affiliate",
    "book.coverAlt": 'Cover des Buches "{title}" von {author}',
    "book.recommendation": "Buchempfehlung",
    "book.recommendations": "Buchempfehlungen",
    "book.noRecommendations":
      "Aktuell sind keine Buchtipps verfügbar. Schau bald wieder vorbei!",
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
    "footer.imprint": "Impressum",
    "footer.siteFooter": "Seitenfußzeile",

    // Glossary
    "glossary.all": "Alle Glossareinträge",
    "glossary.excerpt": "Eintrag Auszug",
    "glossary.readMore": "Mehr über {title} lesen",
    "glossary.readMoreLabel": "Weiterlesen",
    "glossary.description": "Medizinische Fachbegriffe verständlich erklärt.",

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

    // Filter
    "filter.content": "Inhalte filtern",
    "filter.postAvailable": "Artikel verfügbar",
    "filter.postsAvailable": "Artikel verfügbar",
    "filter.posts": "Artikel",
    "filter.categories": "Kategorien",
    "filter.reset": "Zurücksetzen",
    "filter.noResults": "Keine passenden Artikel gefunden",
    "filter.noResultsHelp":
      "Versuche, deine Filterkriterien anzupassen oder andere Kategorien auszuwählen",
    "filter.clearFilters": "Alle Filter zurücksetzen",

    // Date and Time
    "datetime.at": "um",
    "readingTime.minutes": "Minuten Lesezeit",

    // Author
    "author.from": "von",
    "author.name": "Autor",

    // Errors and Warnings
    "errors.404.title": "Seite nicht gefunden",
    "errors.404.description": "Die Seite, die du suchst, wurde nicht gefunden.",
    "errors.loading": "Fehler beim Laden des Inhalts",
    "errors.retry": "Erneut versuchen",

    // Archives
    "archive.description":
      "Eine umfassende Sammlung aller unserer veröffentlichten Artikel, nach Jahren organisiert.",

    // Tags
    "tags.description":
      "Entdecke Artikel, die nach spezifischen Themen und Motiven gruppiert sind.",
    "tag.popularTags": "Beliebte Tags",

    // Categories
    "categories.description": "Entdecke Artikel in dieser Kategorie.",
    "categories.ernaehrung.description":
      "Wissenschaftlich fundierte Ernährung und gesunde Essgewohnheiten.",
    "categories.immunsystem.description":
      "Natürliche Strategien zur Stärkung deines Immunsystems.",
    "categories.lesenswertes.description":
      "Kuratierte Bücher, Studien und Gesundheitsressourcen.",
    "categories.lifestyle-und-psyche.description":
      "Mentale Gesundheit und Wohlbefinden mit praktischen Tipps.",
    "categories.mikronaehrstoffe.description":
      "Vitamine, Mineralstoffe und optimale Supplementierung.",
    "categories.organsysteme.description":
      "Wie deine Organsysteme funktionieren und wie du sie unterstützt.",
    "categories.wissenschaftliches.description":
      "Aktuelle Forschung und evidenzbasierte Gesundheitsinformationen.",
    "categories.wissenswertes.description":
      "Interessante Fakten und lehrreiche Gesundheitsinhalte.",
    "tag.popularTagsDescription":
      "Unsere am häufigsten verwendeten Themen, um relevante Inhalte zu finden",
    "tag.allTags": "Alle Tags",
    "tag.allTagsDescription":
      "Entdecke unsere vollständige Sammlung von Themen",
    "tag.searchPlaceholder": "Tags durchsuchen...",
    "tag.post": "Artikel",
    "tag.posts": "Artikel",

    // Internal Linking & Topic Clusters
    "cluster.articles": "Artikel",
    "cluster.categories": "Kategorien",
    "cluster.minutesReadTime": "Min Lesezeit",
    "cluster.comprehensiveGuide": "Umfassender Leitfaden",
    "cluster.tip": "Tipp:",
    "cluster.startWithGuide":
      "Beginne mit dem Leitfaden und arbeite dich durch die verwandten Artikel.",
    "cluster.toCompleteGuide": "Zum kompletten Leitfaden",
    "cluster.discoverDescription": "Entdecke umfassende Informationen zu",
    "cluster.allArticlesScientific":
      "Alle Artikel sind wissenschaftlich fundiert und praxisorientiert.",
    "cluster.partOfSeries": "Teil der {name} Serie",
    "cluster.belongsToSeries":
      "Diese Artikel gehören zu unserer umfassenden Serie über {name}.",
    "cluster.stronglyRelated": "Stark verwandt",
    "cluster.discoverMore": "💡 Entdecke mehr:",
    "cluster.allArticlesFor":
      "Alle Artikel zu {name} für ein umfassendes Verständnis",
    "cluster.comprehensiveUnderstanding": "umfassendes Verständnis",
    "cluster.relatedArticles": "Verwandte Artikel",
    "cluster.furtherInformation": "Weiterführende Informationen",
    "cluster.mightAlsoInterest": "Das könnte dich auch interessieren",
    "cluster.general": "Allgemein",

    // Content Series
    "series.part": "Teil",
    "series.of": "von",
    "series.previousArticle": "← Vorheriger Artikel",
    "series.nextArticle": "Nächster Artikel →",
    "series.firstArticle": "← Erster Artikel",
    "series.lastArticle": "Letzter Artikel →",
    "series.allArticlesInSeries": "Alle Artikel dieser Serie",
    "series.youAreHere": "Du bist hier",
    "series.tipReadAll":
      "💡 Tipp: Lies alle Artikel dieser Serie für ein vollständiges Verständnis des Themas.",
    "series.completeUnderstanding": "vollständiges Verständnis",
    "series.before": "Vorher:",
    "series.next": "Als nächstes:",

    // Pillar Navigation
    "pillar.completeGuide": "Kompletter Leitfaden",
    "pillar.comprehensiveGuide": "Umfassender Leitfaden:",
    "pillar.article": "Artikel {current} von {total}",
    "pillar.tipBestLearning":
      "💡 Tipp: Für das beste Lernergebnis empfehlen wir, alle Artikel",
    "pillar.readAllArticles": "alle Artikel zu lesen",
  },
};

export type Languages = keyof typeof ui;
export type TranslationKey = keyof UITranslations;
