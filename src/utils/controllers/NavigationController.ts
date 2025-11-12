/**
 * NavigationController
 *
 * A high-performance, optimized navigation controller with smart scroll detection
 * and smooth animations. Extracted from Navigation.astro to follow separation of concerns.
 *
 * Features:
 * - Mobile menu toggle with accessibility support
 * - Mega menu (categories) toggle
 * - Smart scroll-based navbar hide/show
 * - Click outside detection
 * - Keyboard navigation (Escape key)
 * - Responsive behavior
 * - Memory leak prevention with cleanup
 *
 * @version 3.0.0
 */

import { logger } from "@/utils/logger";

export class NavigationController {
  // DOM Elements
  private nav: HTMLElement | null = null;
  private mobileToggle: HTMLElement | null = null;
  private mobileMenu: HTMLElement | null = null;
  private menuIcon: HTMLElement | null = null;
  private xIcon: HTMLElement | null = null;
  private categoriesToggle: HTMLElement | null = null;
  private megaMenu: HTMLElement | null = null;

  // State
  private lastScrollY = 0;
  private scrollDirection: "up" | "down" = "up";
  private hideThreshold: number;
  private scrollTolerance = 10;
  private isScrolling = false;
  private scrollTimer: number | null = null;

  /**
   * Initialize the navigation controller
   */
  constructor() {
    // Set hide threshold to 50% of viewport height
    this.hideThreshold = window.innerHeight * 0.5;

    // Initialize after DOM is fully loaded
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => this.init());
    } else {
      this.init();
    }
  }

  /**
   * Initialize the controller
   */
  private init(): void {
    // Get DOM elements
    this.nav = document.querySelector(".nav");
    this.mobileToggle = document.getElementById("mobile-toggle");
    this.mobileMenu = document.getElementById("mobile-menu");
    this.menuIcon = document.querySelector(".menu-icon");
    this.xIcon = document.querySelector(".x-icon");
    this.categoriesToggle = document.getElementById("categories-toggle");
    this.megaMenu = document.getElementById("mega-menu");

    // Exit if required elements are not found
    if (!this.nav || !this.mobileToggle || !this.mobileMenu) {
      logger.warn("Navigation elements not found");
      return;
    }

    // Set up event listeners
    this.setupEventListeners();

    // Initial scroll check
    this.handleScroll();
  }

  /**
   * Set up all event listeners
   */
  private setupEventListeners(): void {
    // Mobile menu toggle
    this.mobileToggle?.addEventListener("click", this.toggleMobileMenu);

    // Categories mega menu toggle
    this.categoriesToggle?.addEventListener("click", this.toggleMegaMenu);

    // Optimized scroll handling with throttling
    window.addEventListener("scroll", this.handleScrollEvent, {
      passive: true,
    });

    // Close mobile menu and mega menu on click outside
    document.addEventListener("click", this.handleOutsideClick);

    // Close mobile menu and mega menu on escape key
    document.addEventListener("keydown", this.handleKeyDown);

    // Handle mobile menu links
    const mobileLinks = this.mobileMenu?.querySelectorAll("a");
    mobileLinks?.forEach((link) => {
      link.addEventListener("click", this.closeMobileMenu);
    });

    // Handle mega menu links
    const megaMenuLinks = this.megaMenu?.querySelectorAll("a");
    megaMenuLinks?.forEach((link) => {
      link.addEventListener("click", this.closeMegaMenu);
    });

    // Handle resize events
    window.addEventListener("resize", this.handleResize);
  }

  /**
   * Toggle the mobile menu
   */
  private toggleMobileMenu = (): void => {
    if (
      !this.mobileToggle ||
      !this.mobileMenu ||
      !this.menuIcon ||
      !this.xIcon
    ) {
      return;
    }

    const isExpanded =
      this.mobileToggle.getAttribute("aria-expanded") === "true";
    const willExpand = !isExpanded;

    // Update ARIA attributes
    this.mobileToggle.setAttribute("aria-expanded", willExpand.toString());
    this.mobileMenu.setAttribute("aria-hidden", (!willExpand).toString());

    // Toggle menu visibility
    this.mobileMenu.classList.toggle("hidden", !willExpand);

    // Toggle icons
    this.menuIcon.classList.toggle("hidden", willExpand);
    this.xIcon.classList.toggle("hidden", !willExpand);

    // Prevent body scroll when menu is open
    document.body.style.overflow = willExpand ? "hidden" : "";
  };

  /**
   * Close the mobile menu
   */
  private closeMobileMenu = (): void => {
    if (
      !this.mobileToggle ||
      !this.mobileMenu ||
      !this.menuIcon ||
      !this.xIcon
    ) {
      return;
    }

    this.mobileToggle.setAttribute("aria-expanded", "false");
    this.mobileMenu.setAttribute("aria-hidden", "true");
    this.mobileMenu.classList.add("hidden");

    // Toggle icons
    this.menuIcon.classList.remove("hidden");
    this.xIcon.classList.add("hidden");

    // Reset body overflow
    document.body.style.overflow = "";
  };

  /**
   * Toggle the mega menu
   */
  private toggleMegaMenu = (): void => {
    if (!this.categoriesToggle || !this.megaMenu) {
      return;
    }

    const isExpanded =
      this.categoriesToggle.getAttribute("aria-expanded") === "true";
    const willExpand = !isExpanded;

    // Update ARIA attributes
    this.categoriesToggle.setAttribute("aria-expanded", willExpand.toString());

    // Toggle mega menu visibility
    if (willExpand) {
      this.megaMenu.classList.remove("invisible", "opacity-0");
      this.megaMenu.classList.add("visible", "opacity-100");
      // Rotate the chevron icon
      const svg = this.categoriesToggle.querySelector("svg");
      if (svg) {
        svg.style.transform = "rotate(180deg)";
      }
    } else {
      this.megaMenu.classList.add("invisible", "opacity-0");
      this.megaMenu.classList.remove("visible", "opacity-100");
      // Reset the chevron icon
      const svg = this.categoriesToggle.querySelector("svg");
      if (svg) {
        svg.style.transform = "rotate(0deg)";
      }
    }
  };

  /**
   * Close the mega menu
   */
  private closeMegaMenu = (): void => {
    if (!this.categoriesToggle || !this.megaMenu) {
      return;
    }

    this.categoriesToggle.setAttribute("aria-expanded", "false");
    this.megaMenu.classList.add("invisible", "opacity-0");
    this.megaMenu.classList.remove("visible", "opacity-100");

    // Reset the chevron icon
    const svg = this.categoriesToggle.querySelector("svg");
    if (svg) {
      svg.style.transform = "rotate(0deg)";
    }
  };

  /**
   * Handle scroll events with improved performance
   * Uses passive event listener and optimized throttling
   */
  private handleScrollEvent = (): void => {
    // Skip if already processing a scroll event
    if (this.isScrolling) {
      return;
    }

    // Use requestAnimationFrame for better performance
    this.isScrolling = true;
    requestAnimationFrame(() => {
      this.handleScroll();
      // Allow next scroll event after frame is rendered
      this.isScrolling = false;
    });
  };

  /**
   * Handle scroll position and update navigation state
   * Optimized for performance with minimal DOM operations
   */
  private handleScroll = (): void => {
    if (!this.nav) {
      return;
    }

    // Don't hide nav when mobile menu is open
    if (this.mobileToggle?.getAttribute("aria-expanded") === "true") {
      return;
    }

    const currentScrollY = window.scrollY;
    const scrollDelta = currentScrollY - this.lastScrollY;
    const absDelta = Math.abs(scrollDelta);

    // Only process significant scroll events to reduce workload
    if (absDelta <= this.scrollTolerance) {
      return;
    }

    // Determine scroll direction
    this.scrollDirection = scrollDelta > 0 ? "down" : "up";

    // Always show navbar when at the top of the page
    if (currentScrollY <= 0) {
      this.nav.style.transform = "translateY(0)";
    }
    // Hide navbar when scrolling down past threshold
    else if (
      this.scrollDirection === "down" &&
      currentScrollY > this.hideThreshold
    ) {
      this.nav.style.transform = "translateY(-100%)";
    }
    // Show navbar when scrolling up
    else if (this.scrollDirection === "up") {
      this.nav.style.transform = "translateY(0)";
    }

    // Update last scroll position
    this.lastScrollY = currentScrollY;
  };

  /**
   * Handle resize events
   */
  private handleResize = (): void => {
    // Update hide threshold on resize
    this.hideThreshold = window.innerHeight * 0.5;

    // Close mobile menu on larger screens
    if (
      window.innerWidth >= 768 &&
      this.mobileToggle?.getAttribute("aria-expanded") === "true"
    ) {
      this.closeMobileMenu();
    }
  };

  /**
   * Handle clicks outside the mobile menu and mega menu
   */
  private handleOutsideClick = (e: MouseEvent): void => {
    // Close mobile menu if clicked outside
    if (
      this.mobileToggle?.getAttribute("aria-expanded") === "true" &&
      !this.mobileMenu?.contains(e.target as Node) &&
      !this.mobileToggle.contains(e.target as Node)
    ) {
      this.closeMobileMenu();
    }

    // Close mega menu if clicked outside
    if (
      this.categoriesToggle?.getAttribute("aria-expanded") === "true" &&
      !this.megaMenu?.contains(e.target as Node) &&
      !this.categoriesToggle.contains(e.target as Node)
    ) {
      this.closeMegaMenu();
    }
  };

  /**
   * Handle keyboard events
   */
  private handleKeyDown = (e: KeyboardEvent): void => {
    // Close mobile menu on Escape
    if (
      e.key === "Escape" &&
      this.mobileToggle?.getAttribute("aria-expanded") === "true"
    ) {
      this.closeMobileMenu();
    }

    // Close mega menu on Escape
    if (
      e.key === "Escape" &&
      this.categoriesToggle?.getAttribute("aria-expanded") === "true"
    ) {
      this.closeMegaMenu();
    }
  };

  /**
   * Clean up all event listeners
   */
  public cleanup(): void {
    // Remove event listeners
    this.mobileToggle?.removeEventListener("click", this.toggleMobileMenu);
    this.categoriesToggle?.removeEventListener("click", this.toggleMegaMenu);
    window.removeEventListener("scroll", this.handleScrollEvent);
    window.removeEventListener("resize", this.handleResize);
    document.removeEventListener("click", this.handleOutsideClick);
    document.removeEventListener("keydown", this.handleKeyDown);

    // Clear timers
    if (this.scrollTimer) {
      clearTimeout(this.scrollTimer);
      this.scrollTimer = null;
    }

    // Reset body overflow
    document.body.style.overflow = "";
  }
}
