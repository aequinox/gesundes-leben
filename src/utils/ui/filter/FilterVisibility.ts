/**
 * FilterVisibility.ts
 *
 * Handles article visibility, animations, and display updates.
 * Manages showing/hiding articles with smooth transitions.
 */

import type { Elements } from "./FilterState";
import { getState, shouldPostBeVisible, updateState } from "./FilterState";

/**
 * Shows an article element by canceling any existing hide animation, removing the 'hide'
 * class, and adding the 'show' class. If the article is currently being animated to hide,
 * the animation is canceled and the article is shown immediately.
 *
 * @param article - The article element to show
 */
export function showArticle(article: HTMLElement): void {
  if (article.dataset.hideTimeoutId) {
    clearTimeout(parseInt(article.dataset.hideTimeoutId));
    delete article.dataset.hideTimeoutId;
  }

  article.style.display = "";
  article.classList.remove("hide");
  article.classList.add("show");
}

/**
 * Hides an article element by canceling any existing show animation, removing the 'show'
 * class, and adding the 'hide' class. If the article is currently being animated to show,
 * the animation is canceled and the article is hidden immediately.
 *
 * @param article - The article element to hide
 */
export function hideArticle(article: HTMLElement): void {
  if (article.dataset.hideTimeoutId) {
    clearTimeout(parseInt(article.dataset.hideTimeoutId));
    delete article.dataset.hideTimeoutId;
  }

  article.style.display = "none";
  article.classList.remove("show");
  article.classList.add("hide");
}

/**
 * Updates the text content of the filter count element to the given number.
 *
 * @param elements - DOM elements
 * @param count - Number of posts that are currently visible
 */
export function updateFilterCount(elements: Elements, count: number): void {
  if (elements.filterCount) {
    elements.filterCount.textContent = count.toString();
  }
}

/**
 * Shows or hides the "no results" message depending on the given boolean value.
 * When the message is shown, the article grid is hidden and vice versa.
 *
 * @param elements - DOM elements
 * @param show - Whether to show the "no results" message
 */
export function toggleNoResultsMessage(
  elements: Elements,
  show: boolean
): void {
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
}

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
 *
 * @param elements - DOM elements containing articles
 */
export function applyFilters(elements: Elements): void {
  if (!elements.articles) {
    return;
  }

  const state = getState();
  let visibleCount = 0;
  const visibleArticles: HTMLElement[] = [];

  // Determine which articles should be visible
  elements.articles.forEach(article => {
    if (shouldPostBeVisible(article)) {
      visibleArticles.push(article);
      visibleCount++;
    }
  });

  // Update visibility of all articles
  elements.articles.forEach(article => {
    if (visibleArticles.includes(article)) {
      showArticle(article);
    } else {
      hideArticle(article);
    }
  });

  // Update state
  const isFiltering = Boolean(
    state.selectedGroup ||
      (state.selectedCategory && state.selectedCategory !== "Alle")
  );

  updateState({
    visiblePostsCount: visibleCount,
    isFiltering,
  });

  // Update UI
  updateFilterCount(elements, visibleCount);
  toggleNoResultsMessage(elements, visibleCount === 0);
}

/**
 * Prepares articles for filtering by adding missing data attributes.
 *
 * Iterates over all articles and checks if they have a "data-group" and
 * "data-categories" attribute. If not, it tries to find the missing attributes
 * in the article's child elements.
 *
 * @param elements - DOM elements containing articles
 */
export function prepareArticlesForFiltering(elements: Elements): void {
  if (!elements.articles) {
    return;
  }

  elements.articles.forEach(article => {
    // Try to get attributes from nested article element
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

    // Try to collect categories from child elements
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

    // Try to get group from child elements
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
}
