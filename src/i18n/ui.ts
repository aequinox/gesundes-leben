/**
 * Type definitions for supported languages and their display names
 */
export const languages = {
  de: "Deutsch",
  en: "English",
} as const;

export type Language = keyof typeof languages;

export const defaultLang = "de" satisfies Language;
export const showDefaultLang = false;

/**
 * Type for translation categories to maintain organization
 */
type TranslationCategories = {
  nav: {
    home: string;
    posts: string;
    page: string;
    next: string;
    prev: string;
    back: string;
    backToTop: string;
    search: string;
    searchDescription: string;
    themeToggle: string;
    skipToContent: string;
    categories: string;
    groups: string;
    glossary: string;
    tags: string;
    about: string;
    twitter: string;
    back_home: string;
    mainNavigation: string;
    toggleMenu: string;
    additionalActions: string;
  };
  articles: {
    featured: string;
    recent: string;
    categories: string;
    all: string;
    more: string;
    allTags: string;
    withTag: string;
  };
  errors: {
    404: string;
  };
  glossary: {
    all: string;
    title: string;
    description: string;
  };
  readingTime: {
    minutes: string;
  };
  datetime: {
    at: string;
  };
  author: {
    from: string;
  };
  headings: {
    allArticles: string;
  };
  toc: {
    title: string;
  };
};

/**
 * Type-safe translations object with nested structure for better organization
 */
export const ui: Record<Language, TranslationCategories> = {
  de: {
    nav: {
      home: "Startseite",
      posts: "Artikel",
      page: "Seite",
      next: "Weiter",
      prev: "Zurück",
      back: "Zurück",
      backToTop: "Zurück zum Anfang",
      search: "Suche",
      searchDescription: "Suche nach einem Artikel ...",
      themeToggle: "Modus umschalten",
      skipToContent: "Zum Inhalt springen",
      categories: "Kategorien",
      groups: "Gruppen",
      glossary: "Glossar",
      tags: "Tags",
      about: "Über uns",
      twitter: "Twitter",
      back_home: "Zurück zur Startseite",
      mainNavigation: "Hauptnavigation",
      toggleMenu: "Menü umschalten",
      additionalActions: "Zusätzliche Aktionen",
    },
    articles: {
      featured: "Ausgewählte Artikel",
      recent: "Neueste Artikel",
      categories: "Artikel nach Kategorien",
      all: "Alle Artikel",
      more: "Mehr",
      allTags: "Alle Tags, die in den Artikeln verwendet werden.",
      withTag: "Alle Artikel mit dem Tag",
    },
    errors: {
      404: "Seite nicht gefunden",
    },
    glossary: {
      all: "Alle Glossareinträge",
      title: "Glossar",
      description: "Hier sind alle Glossareinträge des Glossars.",
    },
    readingTime: {
      minutes: "Minuten",
    },
    datetime: {
      at: "um",
    },
    author: {
      from: "von",
    },
    headings: {
      allArticles: "Alle Artikel",
    },
    toc: {
      title: "Inhaltsverzeichnis",
    },
  },
  en: {
    nav: {
      home: "Home",
      posts: "Posts",
      page: "page",
      next: "Next",
      prev: "Prev",
      back: "Go back",
      backToTop: "Back to top",
      search: "Search",
      searchDescription: "Search any article ...",
      themeToggle: "Toggles light & dark mode",
      skipToContent: "Skip to content",
      categories: "Categories",
      groups: "Groups",
      glossary: "Glossary",
      tags: "Tags",
      about: "About",
      twitter: "Twitter",
      back_home: "Go back home",
      mainNavigation: "Main Navigation",
      toggleMenu: "Toggle Menu",
      additionalActions: "Additional Actions",
    },
    articles: {
      featured: "Featured Articles",
      recent: "Recent Articles",
      categories: "Articles by Categories",
      all: "All Articles",
      more: "More",
      allTags: "All the tags used in posts.",
      withTag: "All articles with the tag",
    },
    errors: {
      404: "Page not found",
    },
    glossary: {
      all: "All Glossary Entries",
      title: "Glossary",
      description: "Here are all glossary entries.",
    },
    readingTime: {
      minutes: "minutes",
    },
    datetime: {
      at: "at",
    },
    author: {
      from: "from",
    },
    headings: {
      allArticles: "All articles",
    },
    toc: {
      title: "Table of Contents",
    },
  },
} as const;
