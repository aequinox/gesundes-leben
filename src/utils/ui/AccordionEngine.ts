/**
 * AccordionEngine.ts
 *
 * A robust TypeScript module for managing accordion components with modern 2025 design patterns.
 * Implements SOLID principles and follows best practices for maintainable, accessible UI interactions.
 */
import { logger } from "../logger";

// ======================================================================
// Type Definitions
// ======================================================================

/**
 * Configuration options for the accordion engine
 */
export interface AccordionOptions {
  /** Selector for accordion containers */
  accordionSelector?: string;
  /** Selector for accordion items */
  itemSelector?: string;
  /** Selector for accordion triggers */
  triggerSelector?: string;
  /** Selector for accordion panels */
  panelSelector?: string;
  /** Selector for accordion chevron icons */
  chevronSelector?: string;
  /** Selector for accordion item icons */
  iconSelector?: string;
  /** Animation duration in milliseconds */
  animationDuration?: number;
  /** Maximum height for expanded panels */
  maxHeight?: string;
  /** Whether to enable debug logging */
  debug?: boolean;
}

/**
 * State of an individual accordion item
 */
interface AccordionItemState {
  /** Whether the item is currently open */
  isOpen: boolean;
  /** The item element */
  element: HTMLElement;
  /** The trigger button element */
  trigger: HTMLElement | null;
  /** The panel element */
  panel: HTMLElement | null;
  /** The chevron icon element */
  chevron: SVGElement | null;
  /** The item icon element */
  icon: HTMLElement | null;
}

/**
 * State of an accordion container
 */
interface AccordionState {
  /** The accordion container element */
  element: HTMLElement;
  /** Whether multiple items can be open simultaneously */
  allowMultiple: boolean;
  /** Map of item states by index */
  items: Map<number, AccordionItemState>;
}

// ======================================================================
// Constants
// ======================================================================

/**
 * Default configuration options
 */
const DEFAULT_OPTIONS: Required<AccordionOptions> = {
  accordionSelector: ".accordion",
  itemSelector: ".accordion-item",
  triggerSelector: ".accordion-trigger",
  panelSelector: ".accordion-panel",
  chevronSelector: ".accordion-chevron svg",
  iconSelector: ".accordion-item-icon",
  animationDuration: 300,
  maxHeight: "1000px",
  debug: false,
};

/**
 * CSS classes for accordion states
 */
const CSS_CLASSES = {
  OPEN: "is-open",
  FONT_SEMIBOLD: "font-semibold",
  TEXT_ACCENT: "text-accent",
  ROTATE_180: "rotate-180",
  SCALE_110: "scale-110",
} as const;

/**
 * ARIA attributes for accessibility
 */
const ARIA_ATTRIBUTES = {
  EXPANDED: "aria-expanded",
  HIDDEN: "aria-hidden",
} as const;

// ======================================================================
// State Management
// ======================================================================

/**
 * Global state for all accordion instances
 */
const accordionStates = new Map<HTMLElement, AccordionState>();

/**
 * Configuration options
 */
let options: Required<AccordionOptions>;

// ======================================================================
// Core Accordion Logic
// ======================================================================

/**
 * Creates the state object for an accordion item
 *
 * @param element - The accordion item element
 * @param index - The item index
 * @returns The accordion item state
 */
function createItemState(
  element: HTMLElement,
  index: number
): AccordionItemState {
  const trigger = element.querySelector(
    options.triggerSelector
  ) as HTMLElement | null;
  const panel = element.querySelector(
    options.panelSelector
  ) as HTMLElement | null;
  const chevron = element.querySelector(
    options.chevronSelector
  ) as SVGElement | null;
  const icon = element.querySelector(
    options.iconSelector
  ) as HTMLElement | null;

  const isOpen = element.classList.contains(CSS_CLASSES.OPEN);

  if (options.debug) {
    logger.log(`Creating item state for index ${index}: open=${isOpen}`);
  }

  return {
    isOpen,
    element,
    trigger,
    panel,
    chevron,
    icon,
  };
}

/**
 * Opens an accordion item with smooth animation
 *
 * @param itemState - The accordion item state
 */
function openItem(itemState: AccordionItemState): void {
  const { element, trigger, panel, chevron, icon } = itemState;

  if (options.debug) {
    logger.log("Opening accordion item");
  }

  // Update element state
  element.classList.add(CSS_CLASSES.OPEN);
  itemState.isOpen = true;

  // Update trigger
  if (trigger) {
    trigger.setAttribute(ARIA_ATTRIBUTES.EXPANDED, "true");
    trigger.classList.add(CSS_CLASSES.FONT_SEMIBOLD, CSS_CLASSES.TEXT_ACCENT);
  }

  // Update panel
  if (panel) {
    panel.setAttribute(ARIA_ATTRIBUTES.HIDDEN, "false");
    panel.style.maxHeight = options.maxHeight;
    panel.style.opacity = "1";
  }

  // Update chevron
  if (chevron) {
    chevron.classList.add(CSS_CLASSES.ROTATE_180);
  }

  // Update icon
  if (icon) {
    icon.classList.add(CSS_CLASSES.SCALE_110, CSS_CLASSES.TEXT_ACCENT);
  }
}

/**
 * Closes an accordion item with smooth animation
 *
 * @param itemState - The accordion item state
 */
function closeItem(itemState: AccordionItemState): void {
  const { element, trigger, panel, chevron, icon } = itemState;

  if (options.debug) {
    logger.log("Closing accordion item");
  }

  // Update element state
  element.classList.remove(CSS_CLASSES.OPEN);
  itemState.isOpen = false;

  // Update trigger
  if (trigger) {
    trigger.setAttribute(ARIA_ATTRIBUTES.EXPANDED, "false");
    trigger.classList.remove(
      CSS_CLASSES.FONT_SEMIBOLD,
      CSS_CLASSES.TEXT_ACCENT
    );
  }

  // Update panel
  if (panel) {
    panel.setAttribute(ARIA_ATTRIBUTES.HIDDEN, "true");
    panel.style.maxHeight = "0";
    panel.style.opacity = "0";
  }

  // Update chevron
  if (chevron) {
    chevron.classList.remove(CSS_CLASSES.ROTATE_180);
  }

  // Update icon
  if (icon) {
    icon.classList.remove(CSS_CLASSES.SCALE_110, CSS_CLASSES.TEXT_ACCENT);
  }
}

/**
 * Toggles an accordion item's open/closed state
 *
 * @param accordionState - The accordion state
 * @param itemIndex - The index of the item to toggle
 */
function toggleItem(accordionState: AccordionState, itemIndex: number): void {
  const itemState = accordionState.items.get(itemIndex);
  if (!itemState) {
    logger.warn(`Item with index ${itemIndex} not found`);
    return;
  }

  const wasOpen = itemState.isOpen;

  if (options.debug) {
    logger.log(
      `Toggling item ${itemIndex}: currently ${wasOpen ? "open" : "closed"}`
    );
  }

  // Close other items if not allowing multiple
  if (!accordionState.allowMultiple && !wasOpen) {
    accordionState.items.forEach((otherItemState, otherIndex) => {
      if (otherIndex !== itemIndex && otherItemState.isOpen) {
        closeItem(otherItemState);
      }
    });
  }

  // Toggle current item
  if (wasOpen) {
    closeItem(itemState);
  } else {
    openItem(itemState);
  }
}

// ======================================================================
// Event Handlers
// ======================================================================

/**
 * Handles clicks on accordion triggers
 *
 * @param event - The click event
 */
function handleTriggerClick(event: Event): void {
  if (!event.target) return;

  const trigger = (event.target as Element).closest(options.triggerSelector);
  if (!trigger) return;

  event.preventDefault();

  const item = trigger.closest(options.itemSelector);
  if (!item) return;

  // Find the accordion container
  const accordion = item.closest(options.accordionSelector);
  if (!accordion) return;

  const accordionState = accordionStates.get(accordion as HTMLElement);
  if (!accordionState) return;

  // Find the item index
  const itemIndex = parseInt((item as HTMLElement).dataset.index || "0", 10);

  if (options.debug) {
    logger.log(`Trigger clicked for item ${itemIndex}`);
  }

  toggleItem(accordionState, itemIndex);
}

// ======================================================================
// Initialization
// ======================================================================

/**
 * Initializes a single accordion container
 *
 * @param accordion - The accordion container element
 */
function initializeAccordion(accordion: HTMLElement): void {
  const allowMultiple =
    accordion.getAttribute("data-allow-multiple") === "true";
  const items = accordion.querySelectorAll(options.itemSelector);

  if (options.debug) {
    logger.log(
      `Initializing accordion with ${items.length} items, allowMultiple: ${allowMultiple}`
    );
  }

  const accordionState: AccordionState = {
    element: accordion,
    allowMultiple,
    items: new Map(),
  };

  // Initialize each item
  items.forEach((item, index) => {
    const itemElement = item as HTMLElement;
    itemElement.dataset.index = index.toString();

    const itemState = createItemState(itemElement, index);
    accordionState.items.set(index, itemState);

    // Set initial ARIA attributes
    if (itemState.trigger && itemState.panel) {
      itemState.trigger.setAttribute(
        ARIA_ATTRIBUTES.EXPANDED,
        itemState.isOpen.toString()
      );
      itemState.panel.setAttribute(
        ARIA_ATTRIBUTES.HIDDEN,
        (!itemState.isOpen).toString()
      );

      // Set initial panel styles
      if (itemState.isOpen) {
        itemState.panel.style.maxHeight = options.maxHeight;
        itemState.panel.style.opacity = "1";
      } else {
        itemState.panel.style.maxHeight = "0";
        itemState.panel.style.opacity = "0";
      }
    }
  });

  // Store accordion state
  accordionStates.set(accordion, accordionState);

  // Add event listener to the accordion container (event delegation)
  accordion.addEventListener("click", handleTriggerClick);

  if (options.debug) {
    logger.log("Accordion initialized successfully");
  }
}

/**
 * Initializes all accordion containers on the page
 */
function initializeAllAccordions(): void {
  const accordions = document.querySelectorAll(options.accordionSelector);

  if (options.debug) {
    logger.log(`Found ${accordions.length} accordion containers`);
  }

  accordions.forEach(accordion => {
    initializeAccordion(accordion as HTMLElement);
  });
}

/**
 * Cleans up event listeners and state for all accordions
 */
function cleanup(): void {
  accordionStates.forEach(accordionState => {
    accordionState.element.removeEventListener("click", handleTriggerClick);
  });

  accordionStates.clear();

  if (options.debug) {
    logger.log("Accordion cleanup completed");
  }
}

// ======================================================================
// Public API
// ======================================================================

/**
 * Initializes the accordion engine with the given options
 *
 * @param userOptions - Configuration options
 */
export function initAccordionEngine(userOptions: AccordionOptions = {}): void {
  // Merge default options with user options
  options = { ...DEFAULT_OPTIONS, ...userOptions };

  if (options.debug) {
    logger.log(
      `Initializing AccordionEngine with options: ${JSON.stringify(options)}`
    );
  }

  // Function to initialize accordions
  const initialize = () => {
    try {
      // Clean up any existing instances
      cleanup();

      // Initialize new instances
      initializeAllAccordions();

      if (options.debug) {
        logger.log("AccordionEngine initialized successfully");
      }
    } catch (error) {
      logger.error(`Error initializing AccordionEngine: ${error}`);
    }
  };

  // Check if document is already loaded
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize);
  } else {
    initialize();
  }
}

/**
 * Reinitializes all accordions (useful for dynamic content)
 */
export function reinitializeAccordions(): void {
  if (options.debug) {
    logger.log("Reinitializing accordions");
  }

  cleanup();
  initializeAllAccordions();
}

/**
 * Opens a specific accordion item
 *
 * @param accordionElement - The accordion container element
 * @param itemIndex - The index of the item to open
 */
export function openAccordionItem(
  accordionElement: HTMLElement,
  itemIndex: number
): void {
  const accordionState = accordionStates.get(accordionElement);
  if (!accordionState) {
    logger.warn("Accordion not found in state map");
    return;
  }

  const itemState = accordionState.items.get(itemIndex);
  if (!itemState) {
    logger.warn(`Item with index ${itemIndex} not found`);
    return;
  }

  if (!itemState.isOpen) {
    toggleItem(accordionState, itemIndex);
  }
}

/**
 * Closes a specific accordion item
 *
 * @param accordionElement - The accordion container element
 * @param itemIndex - The index of the item to close
 */
export function closeAccordionItem(
  accordionElement: HTMLElement,
  itemIndex: number
): void {
  const accordionState = accordionStates.get(accordionElement);
  if (!accordionState) {
    logger.warn("Accordion not found in state map");
    return;
  }

  const itemState = accordionState.items.get(itemIndex);
  if (!itemState) {
    logger.warn(`Item with index ${itemIndex} not found`);
    return;
  }

  if (itemState.isOpen) {
    toggleItem(accordionState, itemIndex);
  }
}

/**
 * Gets the current state of an accordion item
 *
 * @param accordionElement - The accordion container element
 * @param itemIndex - The index of the item
 * @returns Whether the item is open, or null if not found
 */
export function getAccordionItemState(
  accordionElement: HTMLElement,
  itemIndex: number
): boolean | null {
  const accordionState = accordionStates.get(accordionElement);
  if (!accordionState) {
    return null;
  }

  const itemState = accordionState.items.get(itemIndex);
  return itemState ? itemState.isOpen : null;
}

/**
 * Destroys the accordion engine and cleans up all resources
 */
export function destroyAccordionEngine(): void {
  cleanup();

  if (options.debug) {
    logger.log("AccordionEngine destroyed");
  }
}

// ======================================================================
// Auto-initialization for backward compatibility
// ======================================================================

/**
 * Auto-initializes accordions when the module is loaded
 * This maintains backward compatibility with the inline script approach
 */
export function autoInitAccordions(): void {
  // Initialize with default options
  initAccordionEngine();

  // Re-initialize on Astro page navigation
  document.addEventListener("astro:page-load", () => {
    reinitializeAccordions();
  });
}

// Auto-initialize when module is loaded (for direct script inclusion)
if (typeof window !== "undefined") {
  autoInitAccordions();
}
