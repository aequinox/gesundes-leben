/**
 * FilterState.ts
 *
 * Manages filter state, filtering logic, and category/group data operations.
 * Handles state initialization, updates, and filtering rules.
 */

export type GroupType = "pro" | "question-time" | "contra";

export interface FilterState {
  selectedGroup: GroupType | null;
  selectedCategory: string | null;
  visiblePostsCount: number;
  isFiltering: boolean;
}

export interface FilterOptions {
  defaultCategory?: string;
  animationDuration?: number;
  articleGridSelector?: string;
  groupSelectorSelector?: string;
  categoryButtonSelector?: string;
  noResultsSelector?: string;
  resetFiltersSelector?: string;
  clearFiltersSelector?: string;
  filterCountSelector?: string;
}

export interface Elements {
  articleGrid: HTMLElement | null;
  groupSelectors: NodeListOf<HTMLElement> | null;
  categoryButtons: NodeListOf<HTMLElement> | null;
  noResults: HTMLElement | null;
  resetFilters: HTMLElement | null;
  clearFilters: HTMLElement | null;
  filterCount: HTMLElement | null;
  articles: NodeListOf<HTMLElement> | null;
}

export const DEFAULT_OPTIONS: Required<FilterOptions> = {
  defaultCategory: "Alle",
  animationDuration: 300,
  articleGridSelector: "#article-grid",
  groupSelectorSelector: ".group-selector",
  categoryButtonSelector: ".category-button",
  noResultsSelector: "#no-results",
  resetFiltersSelector: "#reset-filters",
  clearFiltersSelector: "#clear-filters",
  filterCountSelector: "#filter-count",
};

// Module-level state
let state: FilterState = {
  selectedGroup: null,
  selectedCategory: null,
  visiblePostsCount: 0,
  isFiltering: false,
};

let options: Required<FilterOptions> = DEFAULT_OPTIONS;

/**
 * Initialize filter options
 */
export function initializeOptions(userOptions: FilterOptions = {}): void {
  options = { ...DEFAULT_OPTIONS, ...userOptions };
}

/**
 * Get current filter options
 */
export function getOptions(): Required<FilterOptions> {
  return options;
}

/**
 * Get current filter state
 */
export function getState(): FilterState {
  return { ...state };
}

/**
 * Update filter state
 */
export function updateState(updates: Partial<FilterState>): void {
  state = { ...state, ...updates };
}

/**
 * Reset filter state to defaults
 */
export function resetState(): void {
  state = {
    selectedGroup: null,
    selectedCategory: options.defaultCategory,
    visiblePostsCount: 0,
    isFiltering: false,
  };
}

/**
 * Parses categories from an article's dataset
 */
function parseCategories(categoriesString: string): string[] {
  if (categoriesString.includes("|")) {
    return categoriesString.split("|").map(c => c.trim());
  } else if (categoriesString.includes(",")) {
    return categoriesString.split(",").map(c => c.trim());
  } else {
    return [categoriesString.trim()];
  }
}

/**
 * Determines if a blog post should be visible based on the current filter state.
 *
 * Visibility rules:
 * - If no filters are active, all posts are visible
 * - If only a group filter is active, the post must belong to the selected group
 * - If only a category filter is active:
 *   - The "Alle" category makes all posts visible
 *   - Otherwise, the post must belong to the selected category (case-insensitive)
 * - If both group and category filters are active:
 *   - The "Alle" category with a group filter makes the post visible if it belongs to the selected group
 *   - Otherwise, the post must belong to both the selected group and category
 *
 * @param article - The HTML element representing the blog post
 * @returns A boolean indicating if the post should be visible
 */
export function shouldPostBeVisible(article: HTMLElement): boolean {
  if (!state.selectedGroup && !state.selectedCategory) {
    return true;
  }

  const postGroup = article.dataset.group;
  const postCategories = article.dataset.categories
    ? parseCategories(article.dataset.categories)
    : [];

  // Only group filter active
  if (state.selectedGroup && !state.selectedCategory) {
    return postGroup === state.selectedGroup;
  }

  // Only category filter active
  if (!state.selectedGroup && state.selectedCategory) {
    if (state.selectedCategory === options.defaultCategory) {
      return true;
    }
    return postCategories.some(
      category =>
        category.toLowerCase() === state.selectedCategory?.toLowerCase()
    );
  }

  // Both group and category filters active
  if (state.selectedGroup && state.selectedCategory) {
    if (state.selectedCategory === options.defaultCategory) {
      return postGroup === state.selectedGroup;
    }
    const hasCategory = postCategories.some(
      category =>
        category.toLowerCase() === state.selectedCategory?.toLowerCase()
    );
    return postGroup === state.selectedGroup && hasCategory;
  }

  return false;
}

/**
 * Gets all available categories from articles that are currently visible or would be visible
 * based on the current group filter (if any).
 *
 * @param elements - DOM elements containing articles
 * @returns A Set of category names that have at least one article
 */
export function getAvailableCategories(elements: Elements): Set<string> {
  const availableCategories = new Set<string>();

  if (!elements.articles) {
    return availableCategories;
  }

  elements.articles.forEach(article => {
    // Check if article would be visible with current group filter (ignoring category filter)
    const postGroup = article.dataset.group;
    const shouldInclude =
      !state.selectedGroup || postGroup === state.selectedGroup;

    if (shouldInclude && article.dataset.categories) {
      const postCategories = parseCategories(article.dataset.categories);
      postCategories.forEach(category => {
        if (category) {
          availableCategories.add(category);
        }
      });
    }
  });

  return availableCategories;
}

/**
 * Gets category counts for articles that would be visible based on the current group filter.
 *
 * @param elements - DOM elements containing articles
 * @returns A Map where keys are category names and values are article counts
 */
export function getCategoryCounts(elements: Elements): Map<string, number> {
  const categoryCounts = new Map<string, number>();

  if (!elements.articles) {
    return categoryCounts;
  }

  // Count total articles for "Alle" category
  let totalCount = 0;

  elements.articles.forEach(article => {
    // Check if article would be visible with current group filter (ignoring category filter)
    const postGroup = article.dataset.group;
    const shouldInclude =
      !state.selectedGroup || postGroup === state.selectedGroup;

    if (shouldInclude) {
      totalCount++;

      if (article.dataset.categories) {
        const postCategories = parseCategories(article.dataset.categories);
        postCategories.forEach(category => {
          if (category) {
            categoryCounts.set(
              category,
              (categoryCounts.get(category) || 0) + 1
            );
          }
        });
      }
    }
  });

  // Set count for "Alle" category
  categoryCounts.set(options.defaultCategory, totalCount);

  return categoryCounts;
}
