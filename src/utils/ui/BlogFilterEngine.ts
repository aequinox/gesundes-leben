/**
 * BlogFilterEngineFast.ts
 *
 * Minimal, high-performance blog filter with no error checking or logging.
 * Optimized for speed and size.
 */
import { logger } from "../logger";

export type GroupType = "pro" | "question-time" | "contra";

interface FilterOptions {
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
interface FilterState {
  selectedGroup: GroupType | null;
  selectedCategory: string | null;
  visiblePostsCount: number;
  isFiltering: boolean;
}

interface Element {
  articleGrid: HTMLElement | null;
  groupSelectors: NodeListOf<HTMLElement> | null;
  categoryButtons: NodeListOf<HTMLElement> | null;
  noResults: HTMLElement | null;
  resetFilters: HTMLElement | null;
  clearFilters: HTMLElement | null;
  filterCount: HTMLElement | null;
  articles: NodeListOf<HTMLElement> | null;
}

const DEFAULT_OPTIONS = {
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

const state: FilterState = {
  selectedGroup: null as GroupType | null,
  selectedCategory: null as string | null,
  visiblePostsCount: 0,
  isFiltering: false,
};

const elements: Element = {
  articleGrid: null as HTMLElement | null,
  groupSelectors: null as NodeListOf<HTMLElement> | null,
  categoryButtons: null as NodeListOf<HTMLElement> | null,
  noResults: null as HTMLElement | null,
  resetFilters: null as HTMLElement | null,
  clearFilters: null as HTMLElement | null,
  filterCount: null as HTMLElement | null,
  articles: null as NodeListOf<HTMLElement> | null,
};

let options: Required<FilterOptions>;

/**
 * Determines if a blog post should be visible based on the current filter state.
 *
 * This function evaluates whether a post should be displayed by checking its group
 * and categories against the selected filters stored in the application's state.
 *
 * The visibility is determined by the following rules:
 * - If no filters are active, all posts are visible.
 * - If only a group filter is active, the post must belong to the selected group.
 * - If only a category filter is active:
 *   - The "Alle" category makes all posts visible.
 *   - Otherwise, the post must belong to the selected category (case-insensitive).
 * - If both group and category filters are active:
 *   - The "Alle" category with a group filter makes the post visible if it belongs to the selected group.
 *   - Otherwise, the post must belong to both the selected group and category.
 *
 * @param article - The HTML element representing the blog post.
 * @returns A boolean indicating if the post should be visible.
 */
const shouldPostBeVisible = (article: HTMLElement): boolean => {
  if (!state.selectedGroup && !state.selectedCategory) {
    return true;
  }

  const postGroup = article.dataset.group;
  let postCategories: string[] = [];

  if (article.dataset.categories) {
    postCategories = article.dataset.categories.includes("|")
      ? article.dataset.categories.split("|")
      : article.dataset.categories.includes(",")
        ? article.dataset.categories.split(",")
        : [article.dataset.categories];
    postCategories = postCategories.map(category => category.trim());
  }

  if (state.selectedGroup && !state.selectedCategory) {
    return postGroup === state.selectedGroup;
  }

  if (!state.selectedGroup && state.selectedCategory) {
    if (state.selectedCategory === "Alle") {
      return true;
    }
    return postCategories.some(
      category =>
        category.toLowerCase() === state.selectedCategory?.toLowerCase()
    );
  }

  if (state.selectedGroup && state.selectedCategory) {
    if (state.selectedCategory === "Alle") {
      return postGroup === state.selectedGroup;
    }
    const hasCategory = postCategories.some(
      category =>
        category.toLowerCase() === state.selectedCategory?.toLowerCase()
    );
    return postGroup === state.selectedGroup && hasCategory;
  }

  return false;
};

/**
 * Applies the current filter state to the blog posts by hiding or showing them.
 *
 * This function iterates over all blog posts and checks if the post should be visible
 * based on the current filter state. If the post should be visible, it is added to the
 * `visibleArticles` array and the `visibleCount` variable is incremented. After checking
 * all posts, the function iterates over the articles again and either shows or hides each
 * article depending on whether it is in the `visibleArticles` array. Finally, the
 * `visiblePostsCount` state is updated and the no results message is toggled if no posts
 * are visible.
 */
const applyFilters = (): void => {
  if (!elements.articles) {
    return;
  }

  let visibleCount = 0;
  const visibleArticles: HTMLElement[] = [];

  elements.articles.forEach(article => {
    if (shouldPostBeVisible(article)) {
      visibleArticles.push(article);
      visibleCount++;
    }
  });

  elements.articles.forEach(article => {
    if (visibleArticles.includes(article)) {
      showArticle(article);
    } else {
      hideArticle(article);
    }
  });

  state.visiblePostsCount = visibleCount;
  state.isFiltering = !!(
    state.selectedGroup ||
    (state.selectedCategory && state.selectedCategory !== "Alle")
  );

  updateFilterCount(visibleCount);
  toggleNoResultsMessage(visibleCount === 0);
};

/**
 * Shows an article element by canceling any existing hide animation, removing the 'hide'
 * class, and adding the 'show' class. If the article is currently being animated to hide,
 * the animation is canceled and the article is shown immediately.
 * @param article - The article element to show.
 */
const showArticle = (article: HTMLElement): void => {
  if (article.dataset.hideTimeoutId) {
    clearTimeout(parseInt(article.dataset.hideTimeoutId));
    delete article.dataset.hideTimeoutId;
  }

  article.style.display = "";
  article.classList.remove("hide");
  article.classList.add("show");
};

/**
 * Hides an article element by canceling any existing show animation, removing the 'show'
 * class, and adding the 'hide' class. If the article is currently being animated to show,
 * the animation is canceled and the article is hidden immediately.
 * @param article - The article element to hide.
 */

const hideArticle = (article: HTMLElement): void => {
  if (article.dataset.hideTimeoutId) {
    clearTimeout(parseInt(article.dataset.hideTimeoutId));
    delete article.dataset.hideTimeoutId;
  }

  article.style.display = "none";
  article.classList.remove("show");
  article.classList.add("hide");
};

/**
 * Updates the text content of the filter count element to the given number.
 * @param count - Number of posts that are currently visible.
 */
const updateFilterCount = (count: number): void => {
  if (elements.filterCount) {
    elements.filterCount.textContent = count.toString();
  }
};

/**
 * Shows or hides the "no results" message depending on the given boolean value.
 * When the message is shown, the article grid is hidden and vice versa.
 * @param show - Whether to show the "no results" message.
 */
const toggleNoResultsMessage = (show: boolean): void => {
  if (!elements.noResults || !elements.articleGrid) {
    return;
  }

  if (show) {
    elements.noResults.style.display = "flex";
    elements.articleGrid.classList.add("hidden");
  } else {
    elements.noResults.style.display = "none";
    elements.articleGrid.classList.remove("hidden");
  }
};

/**
 * Updates group selection UI
 *
 * Iterates over all group selectors and updates their aria-pressed and classList
 * attributes based on whether the group is selected or not.
 *
 * If the group is selected, the selector is marked as pressed and the
 * "active-group" class is added. Additionally, if an icon wrapper with the
 * class `icon-wrapper-${group}` is found, it is given the class
 * `selected-${group}`.
 *
 * If the group is not selected, the selector is marked as not pressed and the
 * "active-group" class is removed. Additionally, if an icon wrapper with the
 * class `icon-wrapper-${group}` is found, the class `selected-${group}` is
 * removed.
 */
const updateGroupSelectionUI = (): void => {
  if (!elements.groupSelectors) {
    return;
  }

  elements.groupSelectors.forEach(selector => {
    const group = selector.dataset.group as GroupType;
    const iconWrapper = selector.querySelector(
      `.icon-wrapper-${group}`
    ) as HTMLElement | null;

    if (group === state.selectedGroup) {
      selector.setAttribute("aria-pressed", "true");
      selector.classList.add("active-group");
      if (iconWrapper) {
        iconWrapper.classList.add(`selected-${group}`);
      }
    } else {
      selector.setAttribute("aria-pressed", "false");
      selector.classList.remove("active-group");
      if (iconWrapper) {
        iconWrapper.classList.remove(`selected-${group}`);
      }
    }
  });
};

/**
 * Gets all available categories from articles that are currently visible or would be visible
 * based on the current group filter (if any).
 *
 * @returns A Set of category names that have at least one article
 */
const getAvailableCategories = (): Set<string> => {
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
      let postCategories: string[] = [];

      if (article.dataset.categories.includes("|")) {
        postCategories = article.dataset.categories.split("|");
      } else if (article.dataset.categories.includes(",")) {
        postCategories = article.dataset.categories.split(",");
      } else {
        postCategories = [article.dataset.categories];
      }

      postCategories.forEach(category => {
        const trimmedCategory = category.trim();
        if (trimmedCategory) {
          availableCategories.add(trimmedCategory);
        }
      });
    }
  });

  return availableCategories;
};

/**
 * Gets category counts for articles that would be visible based on the current group filter.
 *
 * @returns A Map where keys are category names and values are article counts
 */
const getCategoryCounts = (): Map<string, number> => {
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
        let postCategories: string[] = [];

        if (article.dataset.categories.includes("|")) {
          postCategories = article.dataset.categories.split("|");
        } else if (article.dataset.categories.includes(",")) {
          postCategories = article.dataset.categories.split(",");
        } else {
          postCategories = [article.dataset.categories];
        }

        postCategories.forEach(category => {
          const trimmedCategory = category.trim();
          if (trimmedCategory) {
            categoryCounts.set(
              trimmedCategory,
              (categoryCounts.get(trimmedCategory) || 0) + 1
            );
          }
        });
      }
    }
  });

  // Set count for "Alle" category
  categoryCounts.set(options.defaultCategory, totalCount);

  return categoryCounts;
};

/**
 * Updates the visibility of category buttons based on whether they have articles.
 * Only shows category buttons that have at least one article in their category.
 * The "Alle" (All) category button is always visible.
 */
const updateCategoryButtonVisibility = (): void => {
  if (!elements.categoryButtons) {
    return;
  }

  const availableCategories = getAvailableCategories();

  elements.categoryButtons.forEach(button => {
    const category = button.dataset.category;
    if (!category) {
      return;
    }

    // Always show the "Alle" (All) button
    if (category === options.defaultCategory) {
      button.style.display = "";
      return;
    }

    // Show button only if category has articles
    if (availableCategories.has(category)) {
      button.style.display = "";
    } else {
      button.style.display = "none";
    }
  });
};

/**
 * Updates category button counts by adding or updating count badges.
 * Shows the number of articles available for each category based on current filters.
 * Removes any existing count elements to prevent duplicates and uses existing badge styling.
 */
const updateCategoryButtonCounts = (): void => {
  if (!elements.categoryButtons) {
    return;
  }

  const categoryCounts = getCategoryCounts();

  elements.categoryButtons.forEach(button => {
    const category = button.dataset.category;
    if (!category) {
      return;
    }

    const count = categoryCounts.get(category) || 0;

    // Remove any existing dynamically created count elements to prevent duplicates
    const existingDynamicCounts = button.querySelectorAll(".category-count");
    existingDynamicCounts.forEach(el => el.remove());

    // Find existing count badge in the button's span
    const buttonSpan = button.querySelector("span");
    const existingBadge = buttonSpan?.querySelector(
      ".count-badge"
    ) as HTMLElement | null;

    if (count > 0) {
      if (existingBadge) {
        // Update existing badge
        existingBadge.textContent = count.toString();
        existingBadge.style.display = "";
      } else {
        // Create new badge using the same classes as in the Astro component
        const countBadge = document.createElement("span");
        countBadge.className =
          "count-badge ease-cubic-bezier-[0.22,1,0.36,1] ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent/20 px-1.5 text-xs font-medium transition-all duration-300 group-hover:bg-accent/30 group-data-[active=true]:bg-accent/40";
        countBadge.textContent = count.toString();

        if (buttonSpan) {
          buttonSpan.appendChild(countBadge);
        }
      }
    } else {
      // Hide existing badge if count is 0
      if (existingBadge) {
        existingBadge.style.display = "none";
      }
    }
  });
};

/**
 * Updates category selection UI
 *
 * Iterates over all category buttons and updates their aria-pressed and data-active
 * attributes based on whether the category is selected or not.
 *
 * If the category is selected, the button is marked as pressed and the data-active
 * attribute is set to true. If the category is not selected, the button is marked as not
 * pressed and the data-active attribute is set to false.
 */
const updateCategorySelectionUI = (): void => {
  if (!elements.categoryButtons) {
    return;
  }

  elements.categoryButtons.forEach(button => {
    const category = button.dataset.category;
    if (category === state.selectedCategory) {
      button.setAttribute("data-active", "true");
      button.setAttribute("aria-pressed", "true");
    } else {
      button.setAttribute("data-active", "false");
      button.setAttribute("aria-pressed", "false");
    }
  });
};

/**
 * Handles group selector click events
 *
 * Sets the selected group state based on the event target's data-group attribute.
 * If the target's data-group attribute matches the current selected group, sets the
 * selected group state to null. Otherwise, sets the selected group state to the
 * target's data-group attribute.
 *
 * Calls updateGroupSelectionUI to update the group selector UI, updateCategoryButtonVisibility
 * to show/hide category buttons based on available articles, updateCategoryButtonCounts to update
 * article counts, and applyFilters to apply the filters.
 *
 * @param event - The click event
 */
const handleGroupSelectorClick = (event: Event): void => {
  const target = event.currentTarget as HTMLElement;
  const group = target.dataset.group as GroupType;
  state.selectedGroup = state.selectedGroup === group ? null : group;
  updateGroupSelectionUI();
  updateCategoryButtonVisibility();
  updateCategoryButtonCounts();
  applyFilters();
};

/**
 * Handles category button click events
 *
 * Toggles the selected category state based on the event target's data-category
 * attribute. If the target's data-category attribute matches the current selected
 * category, sets the selected category state to the default category. Otherwise,
 * sets the selected category state to the target's data-category attribute.
 *
 * Calls updateCategorySelectionUI to update the category button UI and applyFilters
 * to apply the filters.
 *
 * @param event - The click event
 */
const handleCategoryButtonClick = (event: Event): void => {
  const target = event.currentTarget as HTMLElement;
  const category = target.dataset.category;

  if (!category) {
    return;
  }

  if (state.selectedCategory === category) {
    if (category !== options.defaultCategory) {
      state.selectedCategory = options.defaultCategory;
    }
  } else {
    state.selectedCategory = category;
  }
  updateCategorySelectionUI();
  applyFilters();
};

/**
 * Handles reset filters button click events
 *
 * Resets the selected group and category states to their default values.
 * Calls updateGroupSelectionUI, updateCategoryButtonVisibility, updateCategoryButtonCounts,
 * updateCategorySelectionUI to update the UI and applyFilters to apply the filters.
 */
const handleResetFiltersClick = (): void => {
  state.selectedGroup = null;
  state.selectedCategory = options.defaultCategory;
  updateGroupSelectionUI();
  updateCategoryButtonVisibility();
  updateCategoryButtonCounts();
  updateCategorySelectionUI();
  applyFilters();
};

/**
 * Initializes DOM elements based on selectors
 *
 * Finds and validates all DOM elements needed for the blog filter to function.
 * Sets the elements property of the module to the found elements.
 *
 * @returns {void}
 */
const initializeElements = (): void => {
  elements.articleGrid = document.querySelector(options.articleGridSelector);
  elements.groupSelectors = document.querySelectorAll(
    options.groupSelectorSelector
  );
  elements.categoryButtons = document.querySelectorAll(
    options.categoryButtonSelector
  );
  elements.noResults = document.querySelector(options.noResultsSelector);
  elements.resetFilters = document.querySelector(options.resetFiltersSelector);
  elements.clearFilters = document.querySelector(options.clearFiltersSelector);
  elements.filterCount = document.querySelector(options.filterCountSelector);

  if (elements.articleGrid) {
    elements.articles =
      elements.articleGrid.querySelectorAll(".grid-layout > *");
  }
};

const attachEventListeners = (): void => {
  if (elements.groupSelectors) {
    elements.groupSelectors.forEach(selector => {
      selector.addEventListener("click", handleGroupSelectorClick);
    });
  }

  if (elements.categoryButtons) {
    elements.categoryButtons.forEach(button => {
      button.addEventListener("click", handleCategoryButtonClick);
    });
  }

  if (elements.resetFilters) {
    elements.resetFilters.addEventListener("click", handleResetFiltersClick);
  }

  if (elements.clearFilters) {
    elements.clearFilters.addEventListener("click", handleResetFiltersClick);
  }
};

/**
 * Prepares articles for filtering by adding missing data attributes.
 *
 * Iterates over all articles and checks if they have a "data-group" and
 * "data-categories" attribute. If not, it tries to find the missing attributes
 * in the article's child elements.
 *
 * If an article has a child element with a "data-group" attribute, it will be
 * used as the article's group. If not, the first child element with a
 * "data-group" attribute will be used.
 *
 * If an article has child elements with a "data-category" attribute, the
 * categories will be concatenated and used as the article's categories. If not,
 * an empty string will be used.
 *
 * @returns {void}
 */
const prepareArticlesForFiltering = (): void => {
  if (!elements.articles) {
    return;
  }

  elements.articles.forEach(article => {
    if (!article.dataset.group || !article.dataset.categories) {
      const articleCard = article.querySelector(
        "article"
      ) as HTMLElement | null;
      if (articleCard) {
        if (articleCard.dataset.group) {
          article.dataset.group = articleCard.dataset.group;
        }
        if (articleCard.dataset.categories) {
          article.dataset.categories = articleCard.dataset.categories;
        }
      }
    }

    if (!article.dataset.categories) {
      const categoryElements = article.querySelectorAll("[data-category]");

      if (categoryElements.length > 0) {
        const categories: string[] = [];
        categoryElements.forEach(el => {
          const category = (el as HTMLElement).dataset.category;
          if (category) {
            categories.push(category);
          }
        });
        if (categories.length > 0) {
          article.dataset.categories = categories.join("|");
        }
      }
    }

    if (!article.dataset.group) {
      const groupElements = article.querySelectorAll("[data-group]");

      if (groupElements.length > 0) {
        const el = groupElements[0] as HTMLElement;
        if (el.dataset.group) {
          article.dataset.group = el.dataset.group;
        }
      }
    }
  });
};

/**
 * Initializes the blog filter system with user-specified options or default options.
 *
 * Merges the provided user options with the default configuration options.
 * Sets up the necessary DOM elements, prepares articles for filtering,
 * attaches event listeners, and applies the initial filter state.
 *
 * The initialization occurs after the DOM content is fully loaded, ensuring
 * all necessary elements are available.
 *
 * @param userOptions - Configuration options to customize the filter behavior.
 */

export const initBlogFilter = (userOptions: FilterOptions = {}): void => {
  options = { ...DEFAULT_OPTIONS, ...userOptions };
  logger.log("Initializing blog filter.");
  const initialize = async () => {
    initializeElements();
    prepareArticlesForFiltering();
    attachEventListeners();
    state.selectedCategory = options.defaultCategory;
    updateGroupSelectionUI();
    updateCategoryButtonVisibility();
    updateCategoryButtonCounts();
    updateCategorySelectionUI();
    applyFilters();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize);
  } else {
    initialize()
      .then(() => {
        logger.log("Blog filter initialized successfully.");
      })
      .catch(error => {
        logger.error("Blog filter initialization failed:", error.message);
      });
  }
};
