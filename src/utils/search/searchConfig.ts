/**
 * Search Configuration
 *
 * Centralized configuration for search functionality including
 * translations, strings, and PagefindUI options.
 */

export const SEARCH_STRINGS = {
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
  },
  accessibility: {
    loading: "Suchfunktion wird geladen...",
    ready: "Suche bereit",
    focused: "Suchfeld fokussiert",
    cleared: "Suche gelöscht",
    searchStarted: "Suche nach {query} gestartet",
    error: "Fehler beim Laden der Suchfunktion",
  },
} as const;

export const PAGEFIND_CONFIG = {
  showSubResults: true,
  showImages: false,
  excerptLength: 30,
  openFilters: [
    "Inhaltstyp",
    "Kategorie",
    "Autor",
    "Gesundheitsbereich",
    "Lesedauer",
  ],
} as const;

export const KEYBOARD_SHORTCUTS = {
  focusSearch: ["Control", "k"], // Ctrl+K or Cmd+K
  clearSearch: "Escape",
} as const;
