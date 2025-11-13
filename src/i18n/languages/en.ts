/**
 * English UI Translations
 */

import type { UITranslations } from "../ui";

export const en: UITranslations = {
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
};
