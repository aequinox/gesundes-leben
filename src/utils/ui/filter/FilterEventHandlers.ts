/**
 * FilterEventHandlers.ts
 *
 * Manages all event handlers for filter interactions.
 * Handles clicks on group selectors, category buttons, and reset buttons.
 */

import type { Elements, FilterOptions, GroupType } from "./FilterState";
import { getOptions, getState, updateState } from "./FilterState";
import { applyFilters } from "./FilterVisibility";
import {
  updateCategoryButtonCounts,
  updateCategoryButtonVisibility,
  updateCategorySelectionUI,
  updateGroupSelectionUI,
} from "./FilterDOMUpdates";

/**
 * Handles group selector click events
 *
 * Sets the selected group state based on the event target's data-group attribute.
 * If the target's data-group attribute matches the current selected group, sets the
 * selected group state to null. Otherwise, sets the selected group state to the
 * target's data-group attribute.
 *
 * @param event - The click event
 * @param elements - DOM elements
 */
export function handleGroupSelectorClick(
  event: Event,
  elements: Elements
): void {
  const target = event.currentTarget as HTMLElement;
  const group = target.dataset.group as GroupType;
  const state = getState();

  updateState({
    selectedGroup: state.selectedGroup === group ? null : group,
  });

  updateGroupSelectionUI(elements);
  updateCategoryButtonVisibility(elements);
  updateCategoryButtonCounts(elements);
  applyFilters(elements);
}

/**
 * Handles category button click events
 *
 * Toggles the selected category state based on the event target's data-category
 * attribute.
 *
 * @param event - The click event
 * @param elements - DOM elements
 */
export function handleCategoryButtonClick(
  event: Event,
  elements: Elements
): void {
  const target = event.currentTarget as HTMLElement;
  const category = target.dataset.category;

  if (!category) {
    return;
  }

  const state = getState();
  const options = getOptions();

  if (state.selectedCategory === category) {
    if (category !== options.defaultCategory) {
      updateState({ selectedCategory: options.defaultCategory });
    }
  } else {
    updateState({ selectedCategory: category });
  }

  updateCategorySelectionUI(elements);
  applyFilters(elements);
}

/**
 * Handles reset filters button click events
 *
 * Resets the selected group and category states to their default values.
 *
 * @param elements - DOM elements
 */
export function handleResetFiltersClick(elements: Elements): void {
  const options = getOptions();

  updateState({
    selectedGroup: null,
    selectedCategory: options.defaultCategory,
  });

  updateGroupSelectionUI(elements);
  updateCategoryButtonVisibility(elements);
  updateCategoryButtonCounts(elements);
  updateCategorySelectionUI(elements);
  applyFilters(elements);
}

/**
 * Attaches event listeners to interactive elements
 *
 * @param elements - DOM elements
 */
export function attachEventListeners(elements: Elements): void {
  if (elements.groupSelectors) {
    elements.groupSelectors.forEach(selector => {
      selector.addEventListener("click", (event) =>
        handleGroupSelectorClick(event, elements)
      );
    });
  }

  if (elements.categoryButtons) {
    elements.categoryButtons.forEach(button => {
      button.addEventListener("click", (event) =>
        handleCategoryButtonClick(event, elements)
      );
    });
  }

  if (elements.resetFilters) {
    elements.resetFilters.addEventListener("click", () =>
      handleResetFiltersClick(elements)
    );
  }

  if (elements.clearFilters) {
    elements.clearFilters.addEventListener("click", () =>
      handleResetFiltersClick(elements)
    );
  }
}
