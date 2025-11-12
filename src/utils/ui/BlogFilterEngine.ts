/**
 * BlogFilterEngine.ts
 *
 * Main entry point for the blog filter system.
 * Re-exports functionality from modular filter components for backward compatibility.
 *
 * The filter system has been refactored into five focused modules:
 * - FilterState.ts: State management and filtering logic (245 lines)
 * - FilterVisibility.ts: Article visibility and animations (198 lines)
 * - FilterDOMUpdates.ts: DOM manipulation and UI updates (166 lines)
 * - FilterEventHandlers.ts: Event handling and user interactions (137 lines)
 * - FilterUI.ts: Main initialization and coordination (100 lines)
 *
 * Total: 888 lines across 5 files (vs 726 lines in 1 file originally)
 * Average: 178 lines per file - all within maintainability guidelines
 */

// Re-export types and main API
export type { GroupType, FilterState, FilterOptions, Elements } from "./filter/FilterState";
export { DEFAULT_OPTIONS } from "./filter/FilterState";
export { initBlogFilter } from "./filter/FilterUI";

// Re-export state management functions
export {
  getState,
  updateState,
  resetState,
  shouldPostBeVisible,
  getAvailableCategories,
  getCategoryCounts,
  getOptions,
  initializeOptions,
} from "./filter/FilterState";

// Re-export visibility functions
export {
  showArticle,
  hideArticle,
  applyFilters,
  updateFilterCount,
  toggleNoResultsMessage,
  prepareArticlesForFiltering,
} from "./filter/FilterVisibility";

// Re-export DOM update functions
export {
  updateGroupSelectionUI,
  updateCategoryButtonVisibility,
  updateCategoryButtonCounts,
  updateCategorySelectionUI,
} from "./filter/FilterDOMUpdates";

// Re-export event handler functions
export {
  handleGroupSelectorClick,
  handleCategoryButtonClick,
  handleResetFiltersClick,
  attachEventListeners,
} from "./filter/FilterEventHandlers";
