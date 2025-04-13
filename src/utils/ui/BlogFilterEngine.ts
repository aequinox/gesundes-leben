/**
 * BlogFilterEngine - A TypeScript module for filtering blog posts by group and category
 *
 * This implementation follows SOLID principles:
 * - Single Responsibility: Each class/function has one job
 * - Open/Closed: Extensible without modification
 * - Liskov Substitution: Subtypes are substitutable for base types
 * - Interface Segregation: Specific interfaces for specific needs
 * - Dependency Inversion: Depends on abstractions, not concretions
 */

// ===== TYPE DEFINITIONS =====

const DEBUG = true; // Set to true to enable debugging

/**
 * Represents a post's group type
 */
export type GroupType = "pro" | "question-time" | "contra";

/**
 * Represents a post's metadata
 */
export interface PostData {
  group?: string;
  categories?: string[];
  // Add raw post data for debugging
  rawPost?: any;
}

/**
 * Represents the filter state
 */
export interface FilterState {
  selectedGroup: GroupType | null;
  selectedCategory: string;
}

/**
 * Represents DOM elements needed for filtering
 */
export interface FilterElements {
  articleGrid: HTMLElement;
  articleWrappers: HTMLElement[];
  postElements: PostElement[];
  categoryButtons: HTMLElement[];
  groupSelectors: HTMLElement[];
  filterCount: HTMLElement | null;
  noResults: HTMLElement | null;
  clearFilters: HTMLElement | null;
  resetFilters: HTMLElement | null;
}

/**
 * Represents a post element with its wrapper and data
 */
export interface PostElement {
  element: HTMLElement;
  wrapper: HTMLElement;
  data: PostData;
}

// ===== CONSTANTS =====

export const GROUP_TYPES = {
  PRO: "pro",
  QUESTION_TIME: "question-time",
  CONTRA: "contra",
} as const;

export const DEFAULT_CATEGORY = "Alle";

// ===== CLASSES =====

/**
 * Manages the filter state and provides methods to update it
 */
export class FilterStateManager {
  private state: FilterState = {
    selectedGroup: null,
    selectedCategory: DEFAULT_CATEGORY,
  };

  private listeners: ((state: FilterState) => void)[] = [];

  /**
   * Get the current filter state
   */
  getState(): FilterState {
    return { ...this.state };
  }

  /**
   * Update the filter state
   */
  setState(newState: Partial<FilterState>): void {
    this.state = { ...this.state, ...newState };
    this.notifyListeners();
  }

  /**
   * Reset the filter state to default values
   */
  resetState(): void {
    DEBUG && console.log("Resetting filter state to defaults");
    this.state = {
      selectedGroup: null,
      selectedCategory: DEFAULT_CATEGORY,
    };
    this.notifyListeners();
  }

  /**
   * Toggle a group selection
   */
  toggleGroup(group: GroupType): void {
    DEBUG && console.log("Before toggle:", this.state);

    // If the currently selected group is the same as the one being toggled,
    // set it to null (deselect it), otherwise select the new group
    if (this.state.selectedGroup === group) {
      DEBUG && console.log(`Deselecting group: ${group}`);
      this.state.selectedGroup = null;
    } else {
      DEBUG && console.log(`Selecting group: ${group}`);
      this.state.selectedGroup = group;
    }

    DEBUG && console.log("After toggle:", this.state);
    this.notifyListeners();
  }

  /**
   * Set the selected category
   */
  setCategory(category: string): void {
    DEBUG && console.log(`Setting category to: ${category}`);
    this.state.selectedCategory = category;

    // If "Alle" category is selected, reset group filter
    if (category === DEFAULT_CATEGORY) {
      this.state.selectedGroup = null;
    }

    this.notifyListeners();
  }

  /**
   * Add a listener for state changes
   */
  addListener(listener: (state: FilterState) => void): void {
    this.listeners.push(listener);
  }

  /**
   * Notify all listeners of state changes
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.getState()));
  }
}

/**
 * Handles DOM operations for the filter UI
 */
export class FilterDOMHandler {
  private elements: FilterElements;

  constructor(elements: FilterElements) {
    this.elements = elements;
  }

  /**
   * Update the UI based on the current filter state
   */
  updateUI(state: FilterState): void {
    this.updateCategoryButtons(state.selectedCategory);
    this.updateGroupSelectors(state.selectedGroup);
  }

  /**
   * Update the category buttons based on the selected category
   */
  private updateCategoryButtons(selectedCategory: string): void {
    this.elements.categoryButtons.forEach(button => {
      const category = button.getAttribute("data-category");
      const isActive = category === selectedCategory;

      button.setAttribute("data-active", isActive.toString());
      button.setAttribute("aria-pressed", isActive.toString());
    });
  }

  /**
   * Update the group selectors based on the selected group
   */
  private updateGroupSelectors(selectedGroup: GroupType | null): void {
    this.elements.groupSelectors.forEach(selector => {
      const selectorGroup = selector.id?.replace("-group", "") as
        | GroupType
        | undefined;
      const isActive = selectorGroup === selectedGroup;

      selector.setAttribute("data-active", isActive ? "true" : "false");
      DEBUG &&
        console.log(`Setting selector ${selectorGroup} active: ${isActive}`);
    });

    // Reset visual state if no group is selected
    if (selectedGroup === null) {
      this.elements.groupSelectors.forEach(selector => {
        selector.classList.remove("left", "middle", "right");
      });
    }
  }

  /**
   * Update the visual order of group selectors
   */
  updateGroupSelectorOrder(clickedSelector: HTMLElement): void {
    if (!this.elements.groupSelectors.includes(clickedSelector)) return;

    const clickedIndex = this.elements.groupSelectors.indexOf(clickedSelector);

    this.elements.groupSelectors.forEach((selector, i) => {
      selector.classList.toggle(
        "left",
        (i + 1) % this.elements.groupSelectors.length === clickedIndex
      );
      selector.classList.toggle("middle", i === clickedIndex);
      selector.classList.toggle(
        "right",
        i !== clickedIndex &&
          (i + 1) % this.elements.groupSelectors.length !== clickedIndex
      );
    });
  }

  /**
   * Update the filter count display
   */
  updateFilterCount(count: number): void {
    if (this.elements.filterCount) {
      this.elements.filterCount.textContent = count.toString();
    }

    // Show/hide no results message
    if (this.elements.noResults) {
      if (count === 0) {
        this.elements.noResults.classList.remove("hidden");
        this.elements.noResults.classList.add("flex");
      } else {
        this.elements.noResults.classList.add("hidden");
        this.elements.noResults.classList.remove("flex");
      }
    }
  }
}

/**
 * Handles filtering of posts based on the filter state
 */
export class PostFilterEngine {
  private elements: FilterElements;

  constructor(elements: FilterElements) {
    this.elements = elements;

    // Add a class to the grid container to enable our custom grid layout
    if (this.elements.articleGrid) {
      this.elements.articleGrid.classList.add("filtered-grid");
    }
  }

  /**
   * Apply filters based on the current filter state
   */
  applyFilters(state: FilterState): number {
    DEBUG && console.log("Applying filters:", state);

    const { selectedGroup, selectedCategory } = state;
    const isResetState =
      selectedGroup === null && selectedCategory === DEFAULT_CATEGORY;

    // Get all article wrappers
    const allWrappers = this.elements.articleWrappers;
    DEBUG && console.log(`Total wrappers found: ${allWrappers.length}`);

    // If we're resetting, show all posts immediately
    if (isResetState) {
      DEBUG && console.log("Reset state detected - showing all posts");
      this.showAllPosts(allWrappers);
      return allWrappers.length;
    }

    // Otherwise, apply filtering logic
    return this.filterPosts(state);
  }

  /**
   * Show all posts with staggered animation
   */
  private showAllPosts(wrappers: HTMLElement[]): void {
    DEBUG && console.log(`Showing all ${wrappers.length} posts`);

    // Show all wrappers
    wrappers.forEach((wrapper, index) => {
      this.showPostWrapper(wrapper, index);
    });

    // Update the grid layout
    this.updateGridLayout();
  }

  /**
   * Filter posts based on criteria and show matching ones
   */
  private filterPosts(state: FilterState): number {
    const { selectedGroup, selectedCategory } = state;

    // First, hide all wrappers
    this.elements.articleWrappers.forEach(wrapper => {
      this.hidePostWrapper(wrapper);
    });

    // Debug: Log all post data before filtering
    DEBUG &&
      console.log(
        "All post data before filtering:",
        this.elements.postElements.map(post => ({
          group: post.data.group,
          normalizedGroup: this.normalizeGroupName(post.data.group),
          categories: post.data.categories,
        }))
      );

    // Find matching posts
    const matchingPosts = this.elements.postElements.filter(post => {
      const matches = this.postMatchesFilters(
        post.data,
        selectedGroup,
        selectedCategory
      );
      // Debug: Log each post's match result
      DEBUG &&
        console.log(`Post match result:`, {
          group: post.data.group,
          normalizedGroup: this.normalizeGroupName(post.data.group),
          selectedGroup,
          categories: post.data.categories,
          selectedCategory,
          matches,
        });
      return matches;
    });

    DEBUG && console.log(`Found ${matchingPosts.length} matching posts`);

    // Show matching posts with staggered animation
    matchingPosts.forEach((post, index) => {
      this.showPostWrapper(post.wrapper, index);
    });

    // Update the grid layout
    this.updateGridLayout();

    return matchingPosts.length;
  }

  /**
   * Check if a post matches the current filters
   */
  private postMatchesFilters(
    postData: PostData,
    selectedGroup: GroupType | null,
    selectedCategory: string
  ): boolean {
    // Check if post matches group filter
    const normalizedGroup = this.normalizeGroupName(postData.group);
    const isMatchingGroup =
      selectedGroup === null || normalizedGroup === selectedGroup;

    // Check if post matches category filter
    const hasCategories =
      Array.isArray(postData.categories) && postData.categories.length > 0;
    const isMatchingCategory =
      selectedCategory === DEFAULT_CATEGORY ||
      (hasCategories &&
        postData.categories &&
        postData.categories.includes(selectedCategory));

    // Post should be shown if it matches both filters
    return isMatchingGroup && isMatchingCategory ? true : false;
  }

  /**
   * Normalize group name to match our constants
   */
  private normalizeGroupName(group?: string): GroupType | null {
    if (!group) return null;

    const lowerGroup = group.toLowerCase();

    // Handle all possible variations of group names
    if (
      lowerGroup === "fragezeiten" ||
      lowerGroup === "question-time" ||
      lowerGroup === "question time"
    ) {
      return GROUP_TYPES.QUESTION_TIME;
    } else if (lowerGroup === "kontra" || lowerGroup === "contra") {
      return GROUP_TYPES.CONTRA;
    } else if (lowerGroup === "pro") {
      return GROUP_TYPES.PRO;
    }

    DEBUG && console.log(`Unknown group name: ${lowerGroup}`);
    return null;
  }

  /**
   * Show a post wrapper with animation
   */
  private showPostWrapper(wrapper: HTMLElement, index: number): void {
    // Set delay for staggered animation
    wrapper.style.setProperty("--delay", `${index * 0.05}s`);

    // Make wrapper visible and add show animation
    wrapper.classList.remove("hide");
    wrapper.classList.add("show");

    // Add a class to indicate this wrapper is visible
    wrapper.classList.add("visible-post");

    // Reset all styles that might have been set by hidePostWrapper
    wrapper.style.display = "";
    wrapper.style.visibility = "";
    wrapper.style.opacity = "";
    wrapper.style.height = "";
    wrapper.style.width = "";
    wrapper.style.margin = "";
    wrapper.style.padding = "";
    wrapper.style.overflow = "";
    wrapper.style.position = "";
    wrapper.style.gridColumn = "";
    wrapper.style.gridRow = "";

    // Force browser to recognize the change
    void wrapper.offsetWidth;
  }

  /**
   * Hide a post wrapper efficiently
   */
  private hidePostWrapper(wrapper: HTMLElement): void {
    wrapper.classList.add("hide");
    wrapper.classList.remove("show", "visible-post");

    // Use a single transformation to hide and remove the element from the grid flow
    Object.assign(wrapper.style, {
      display: "none",
      visibility: "hidden",
      opacity: "0",
      height: "0",
      width: "0",
      margin: "0",
      padding: "0",
      overflow: "hidden",
      position: "absolute",
      gridColumn: "1",
      gridRow: "1",
    });
  }

  /**
   * Update the grid layout to ensure proper positioning of visible elements
   */
  private updateGridLayout(): void {
    // Get the grid container
    const grid = this.elements.articleGrid;
    if (!grid) return;

    // Get the grid layout element (the direct child of articleGrid that contains the grid)
    const gridLayout = grid.querySelector(".grid-layout") as HTMLElement;
    if (!gridLayout) return;

    // Force a reflow of the grid
    void gridLayout.offsetHeight;

    // Add a class to indicate the grid has been filtered
    gridLayout.classList.toggle(
      "filtered",
      this.elements.postElements.some(
        post => !post.wrapper.classList.contains("visible-post")
      )
    );
  }
}

/**
 * Main controller class that orchestrates the filtering system
 */
export class BlogFilterController {
  private stateManager: FilterStateManager;
  private domHandler: FilterDOMHandler;
  private filterEngine: PostFilterEngine;
  private elements: FilterElements;

  constructor(elements: FilterElements) {
    this.elements = elements;
    this.stateManager = new FilterStateManager();
    this.domHandler = new FilterDOMHandler(elements);
    this.filterEngine = new PostFilterEngine(elements);

    // Set up state change listener
    this.stateManager.addListener(state => {
      this.domHandler.updateUI(state);
      const visibleCount = this.filterEngine.applyFilters(state);
      this.domHandler.updateFilterCount(visibleCount);
    });

    // Initialize event listeners
    this.initEventListeners();
  }

  /**
   * Initialize event listeners for filter controls
   */
  private initEventListeners(): void {
    this.initGroupSelectors();
    this.initCategoryButtons();
    this.initResetButtons();
    this.initKeyboardNavigation();
  }

  /**
   * Initialize group selector event listeners
   */
  private initGroupSelectors(): void {
    const allGroups: GroupType[] = [
      GROUP_TYPES.PRO,
      GROUP_TYPES.QUESTION_TIME,
      GROUP_TYPES.CONTRA,
    ];

    allGroups.forEach(group => {
      const button = document.getElementById(`${group}-group`);
      if (!button) {
        DEBUG && console.log(`Button for group ${group} not found`);
        return;
      }

      button.addEventListener("click", () => {
        DEBUG && console.log(`Group button clicked: ${group}`);

        // If the same group is clicked again, deselect it
        if (this.stateManager.getState().selectedGroup === group) {
          DEBUG && console.log(`Deselecting group: ${group}`);
          this.stateManager.toggleGroup(group); // This will set it to null
        } else {
          // Select the new group
          DEBUG && console.log(`Selecting group: ${group}`);
          this.domHandler.updateGroupSelectorOrder(button as HTMLElement);
          this.stateManager.toggleGroup(group);
        }
      });
    });
  }

  /**
   * Initialize category button event listeners
   */
  private initCategoryButtons(): void {
    this.elements.categoryButtons.forEach(button => {
      button.addEventListener("click", () => {
        const category = button.getAttribute("data-category");
        if (category) {
          DEBUG && console.log(`Category button clicked: ${category}`);
          this.stateManager.setCategory(category);
        }
      });
    });
  }

  /**
   * Initialize reset button event listeners
   */
  private initResetButtons(): void {
    // Clear filters button event listener
    if (this.elements.clearFilters) {
      this.elements.clearFilters.addEventListener("click", () => {
        DEBUG && console.log("Clear filters button clicked");
        this.stateManager.resetState();
      });
    }

    // Reset filters button event listener
    if (this.elements.resetFilters) {
      this.elements.resetFilters.addEventListener("click", () => {
        DEBUG && console.log("Reset filters button clicked");
        this.stateManager.resetState();
      });
    }
  }

  /**
   * Initialize keyboard navigation for category buttons
   */
  private initKeyboardNavigation(): void {
    this.elements.categoryButtons.forEach((button, index) => {
      button.addEventListener("keydown", e => {
        const key = e.key;

        if (key === "ArrowRight" || key === "ArrowDown") {
          e.preventDefault();
          const nextIndex = (index + 1) % this.elements.categoryButtons.length;
          this.elements.categoryButtons[nextIndex].focus();
        } else if (key === "ArrowLeft" || key === "ArrowUp") {
          e.preventDefault();
          const prevIndex =
            (index - 1 + this.elements.categoryButtons.length) %
            this.elements.categoryButtons.length;
          this.elements.categoryButtons[prevIndex].focus();
        }
      });
    });
  }

  /**
   * Initialize the filter system
   */
  initialize(): void {
    // Apply initial filtering to show all articles
    const visibleCount = this.filterEngine.applyFilters(
      this.stateManager.getState()
    );
    this.domHandler.updateFilterCount(visibleCount);
  }
}

/**
 * Initialize the DOM elements needed for filtering
 */
export function initializeDOMElements(): FilterElements {
  const articleGrid = document.getElementById("article-grid") as HTMLElement;
  if (!articleGrid) throw new Error("Article grid element not found");

  // Get all article wrappers
  const articleWrappers = Array.from(
    articleGrid.querySelectorAll(".article-wrapper")
  ) as HTMLElement[];

  DEBUG && console.log("Article wrappers:", articleWrappers.length);

  // Get all cards inside the wrappers
  const postElements = articleWrappers
    .map(wrapper => {
      // Try to find the post data in different ways

      // 1. Look for data attributes on the wrapper itself
      const wrapperGroup = wrapper.getAttribute("data-group");
      const wrapperCategories = wrapper.getAttribute("data-categories");

      // 2. Look for a Card component inside the wrapper
      const card =
        wrapper.querySelector("[data-group]") ||
        wrapper.querySelector(".card") ||
        wrapper.firstElementChild;

      // 3. Look for a hidden data element that might contain post data
      const dataElement =
        wrapper.querySelector(".post-data") ||
        wrapper.querySelector("[data-post]");

      // Extract data from the card
      const element = card as HTMLElement;
      const data: PostData = {};

      // Try to get data from the wrapper first
      if (wrapperGroup) {
        data.group = wrapperGroup;
      }

      if (wrapperCategories) {
        data.categories = wrapperCategories.split("|");
      }

      // If no data on wrapper, try the card
      if (element && element.dataset && !data.group) {
        data.group = element.dataset.group;
        data.categories = element.dataset.categories?.split("|");
      }

      // If still no data, try to find it in the HTML content
      if (!data.group) {
        // Look for group information in the HTML content
        const html = wrapper.innerHTML.toLowerCase();

        if (html.includes("pro")) {
          data.group = "pro";
        } else if (html.includes("kontra") || html.includes("contra")) {
          data.group = "kontra";
        } else if (
          html.includes("fragezeiten") ||
          html.includes("question-time")
        ) {
          data.group = "fragezeiten";
        }
      }

      // Store the raw HTML for debugging
      if (DEBUG) {
        data.rawPost = {
          wrapperHTML: wrapper.outerHTML.substring(0, 200) + "...", // First 200 chars
          cardHTML: element
            ? element.outerHTML.substring(0, 200) + "..."
            : null,
          wrapperAttrs: {
            group: wrapperGroup,
            categories: wrapperCategories,
          },
          cardAttrs: element ? element.dataset : null,
        };
      }

      DEBUG &&
        console.log("Extracted post data:", {
          group: data.group,
          categories: data.categories,
        });

      return {
        element,
        wrapper,
        data,
      } as PostElement;
    })
    .filter(post => post.element); // Filter out any null values

  return {
    articleGrid,
    articleWrappers,
    postElements,
    categoryButtons: Array.from(
      document.querySelectorAll(".category-button")
    ) as HTMLElement[],
    groupSelectors: Array.from(
      document.querySelectorAll(".group-selector")
    ) as HTMLElement[],
    filterCount: document.getElementById("filter-count"),
    noResults: document.getElementById("no-results"),
    clearFilters: document.getElementById("clear-filters"),
    resetFilters: document.getElementById("reset-filters"),
  };
}

/**
 * Initialize the blog filter system
 */
export function initBlogFilter(): void {
  try {
    console.log("Initializing blog filter system");
    const elements = initializeDOMElements();

    // Log the found elements for debugging
    DEBUG && console.log("Found post elements:", elements.postElements.length);
    DEBUG &&
      console.log("Found category buttons:", elements.categoryButtons.length);
    DEBUG &&
      console.log("Found group selectors:", elements.groupSelectors.length);

    // Count all article wrappers to verify
    DEBUG &&
      console.log("Total article wrappers:", elements.articleWrappers.length);

    // Initialize the controller
    const controller = new BlogFilterController(elements);
    controller.initialize();
  } catch (error) {
    console.error("Failed to initialize blog filter:", error);
  }
}
