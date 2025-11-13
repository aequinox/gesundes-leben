/**
 * UI Translation Configuration
 *
 * Defines all text strings used in the UI for different languages.
 * Enables easy maintenance and localization of the application.
 */

import { de } from "./languages/de";
import { en } from "./languages/en";

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

  // Search
  "search.label": string;
  "search.placeholder": string;
  "search.found": string;
  "search.results": string;
  "search.noResults": string;
  "search.clear": string;
  "search.loadMore": string;
  "search.searchLabel": string;
  "search.filtersLabel": string;
  "search.zeroResults": string;
  "search.manyResults": string;
  "search.oneResult": string;
  "search.altSearch": string;
  "search.suggestion": string;
  "search.searching": string;

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
  en,
  de,
};

export type Languages = keyof typeof ui;
