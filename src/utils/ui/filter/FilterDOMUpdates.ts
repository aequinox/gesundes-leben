/**
 * FilterDOMUpdates.ts
 *
 * Manages all DOM updates for the filter UI.
 * Handles button states, visibility, counts, and accessibility attributes.
 */

import type { Elements, GroupType } from "./FilterState";
import {
  getAvailableCategories,
  getCategoryCounts,
  getOptions,
  getState,
} from "./FilterState";

/**
 * Updates group selection UI
 *
 * Iterates over all group selectors and updates their aria-pressed and classList
 * attributes based on whether the group is selected or not.
 *
 * @param elements - DOM elements
 */
export function updateGroupSelectionUI(elements: Elements): void {
  if (!elements.groupSelectors) {
    return;
  }

  const state = getState();

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
}

/**
 * Updates the visibility of category buttons based on whether they have articles.
 * Only shows category buttons that have at least one article in their category.
 * The "Alle" (All) category button is always visible.
 *
 * @param elements - DOM elements
 */
export function updateCategoryButtonVisibility(elements: Elements): void {
  if (!elements.categoryButtons) {
    return;
  }

  const options = getOptions();
  const availableCategories = getAvailableCategories(elements);

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
}

/**
 * Updates category button counts by adding or updating count badges.
 * Shows the number of articles available for each category based on current filters.
 * Removes any existing count elements to prevent duplicates and uses existing badge styling.
 *
 * @param elements - DOM elements
 */
export function updateCategoryButtonCounts(elements: Elements): void {
  if (!elements.categoryButtons) {
    return;
  }

  const categoryCounts = getCategoryCounts(elements);

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
}

/**
 * Updates category selection UI
 *
 * Iterates over all category buttons and updates their aria-pressed and data-active
 * attributes based on whether the category is selected or not.
 *
 * @param elements - DOM elements
 */
export function updateCategorySelectionUI(elements: Elements): void {
  if (!elements.categoryButtons) {
    return;
  }

  const state = getState();

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
}
