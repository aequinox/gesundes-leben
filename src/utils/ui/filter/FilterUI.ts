/**
 * FilterUI.ts
 *
 * Main initialization and coordination for the blog filter UI.
 * Brings together state, visibility, DOM updates, and event handling.
 */

import { logger } from "../../logger";
import type { Elements, FilterOptions } from "./FilterState";
import { getOptions, initializeOptions, updateState } from "./FilterState";
import {
  updateCategoryButtonCounts,
  updateCategoryButtonVisibility,
  updateCategorySelectionUI,
  updateGroupSelectionUI,
} from "./FilterDOMUpdates";
import { attachEventListeners } from "./FilterEventHandlers";
import { applyFilters, prepareArticlesForFiltering } from "./FilterVisibility";

// Module-level elements storage
const elements: Elements = {
  articleGrid: null,
  groupSelectors: null,
  categoryButtons: null,
  noResults: null,
  resetFilters: null,
  clearFilters: null,
  filterCount: null,
  articles: null,
};

/**
 * Initializes DOM elements based on selectors
 *
 * Finds and validates all DOM elements needed for the blog filter to function.
 */
function initializeElements(): void {
  const options = getOptions();

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
}

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
 * @param userOptions - Configuration options to customize the filter behavior
 */
export function initBlogFilter(userOptions: FilterOptions = {}): void {
  initializeOptions(userOptions);
  const options = getOptions();

  logger.log("Initializing blog filter.");

  const initialize = async () => {
    initializeElements();
    prepareArticlesForFiltering(elements);
    attachEventListeners(elements);

    updateState({ selectedCategory: options.defaultCategory });
    updateGroupSelectionUI(elements);
    updateCategoryButtonVisibility(elements);
    updateCategoryButtonCounts(elements);
    updateCategorySelectionUI(elements);
    applyFilters(elements);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      initialize()
        .then(() => {
          logger.log("Blog filter initialized successfully.");
        })
        .catch(error => {
          logger.error("Blog filter initialization failed:", error.message);
        });
    });
  } else {
    initialize()
      .then(() => {
        logger.log("Blog filter initialized successfully.");
      })
      .catch(error => {
        logger.error("Blog filter initialization failed:", error.message);
      });
  }
}
