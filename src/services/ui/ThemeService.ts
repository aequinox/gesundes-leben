/**
 * @module ThemeService
 * @description
 * Service for managing theme switching and persistence.
 * Provides a consistent API for theme operations throughout the application.
 * Handles theme persistence during view transitions to prevent flickering.
 */

import type { IConfigService } from "@/core/config/ConfigService";
import { configService } from "@/core/config/ConfigService";

/**
 * Valid theme values for the application
 */
export type Theme = "light" | "dark";

/**
 * Configuration interface for theme management
 */
export interface ThemeConfig {
  /** Key used for storing theme preference in localStorage */
  storageKey: string;
  /** Default theme to use when no preference is set */
  defaultTheme: Theme;
  /** Media query for detecting system theme preference */
  systemPreferenceQuery: string;
  /** CSS variable for theme transition duration */
  transitionDurationVar: string;
  /** Default transition duration in ms */
  defaultTransitionDuration: number;
  /** Key for session storage during transitions */
  sessionStorageKey: string;
}

/**
 * Interface for theme service operations
 */
export interface IThemeService {
  /**
   * Get the user's preferred theme
   */
  getPreferredTheme(): Theme;

  /**
   * Set the theme and persist the choice
   */
  setTheme(theme: Theme): void;

  /**
   * Toggle between light and dark themes
   */
  toggleTheme(): void;

  /**
   * Initialize theme functionality
   */
  initThemeFeature(): void;

  /**
   * Clean up event listeners
   */
  cleanup(): void;

  /**
   * Reflect the current theme preference in the DOM
   */
  reflectPreference(): void;

  /**
   * Apply theme immediately during page transitions
   */
  applyThemeImmediately(): void;
}

/**
 * Implementation of the theme service
 */
export class ThemeService implements IThemeService {
  private mediaQuery: MediaQueryList | null = null;
  private currentTheme: Theme;
  private transitionDisabled = false;
  private observer: MutationObserver | null = null;

  private readonly CONFIG: ThemeConfig = {
    storageKey: "theme",
    defaultTheme: "light",
    systemPreferenceQuery: "(prefers-color-scheme: dark)",
    transitionDurationVar: "--theme-transition-duration",
    defaultTransitionDuration: 200,
    sessionStorageKey: "theme-transition",
  };

  constructor(private config: IConfigService = configService) {
    this.currentTheme = this.getPreferredTheme();
    this.handleSystemThemeChange = this.handleSystemThemeChange.bind(this);
    this.handleViewTransitionStart = this.handleViewTransitionStart.bind(this);
    this.handleViewTransitionComplete =
      this.handleViewTransitionComplete.bind(this);
    this.handleDocumentMutation = this.handleDocumentMutation.bind(this);

    // Apply theme immediately on script load
    if (typeof document !== "undefined") {
      this.injectThemeScript();
    }
  }

  /**
   * Inject a script tag to set the theme before any rendering occurs
   * This is crucial to prevent flickering during page loads and transitions
   */
  private injectThemeScript(): void {
    // Create a script element
    const script = document.createElement("script");
    script.textContent = `
      (function() {
        // Get theme from localStorage or sessionStorage (for transitions)
        var storedTheme = localStorage.getItem("${this.CONFIG.storageKey}");
        var transitionTheme = sessionStorage.getItem("${this.CONFIG.sessionStorageKey}");
        var theme = transitionTheme || storedTheme;
        
        // If no stored theme, check system preference
        if (!theme) {
          theme = window.matchMedia("${this.CONFIG.systemPreferenceQuery}").matches ? "dark" : "light";
        }
        
        // Apply theme immediately to prevent flash
        document.documentElement.setAttribute("data-theme", theme);
        
        // Clear transition theme from session storage
        if (transitionTheme) {
          sessionStorage.removeItem("${this.CONFIG.sessionStorageKey}");
        }
      })();
    `;

    // Insert at the beginning of head for earliest possible execution
    document.head.insertBefore(script, document.head.firstChild);
  }

  /**
   * Get the user's preferred theme
   */
  getPreferredTheme(): Theme {
    if (typeof window === "undefined") {
      return this.CONFIG.defaultTheme;
    }

    // Check for theme in session storage first (for transitions)
    const transitionTheme = sessionStorage.getItem(
      this.CONFIG.sessionStorageKey
    ) as Theme | null;

    if (transitionTheme) {
      return transitionTheme;
    }

    // Then check localStorage
    const storedTheme = localStorage.getItem(
      this.CONFIG.storageKey
    ) as Theme | null;

    if (storedTheme) {
      return storedTheme;
    }

    // Fall back to system preference
    return window.matchMedia(this.CONFIG.systemPreferenceQuery).matches
      ? "dark"
      : this.CONFIG.defaultTheme;
  }

  /**
   * Updates the meta theme color based on current theme
   */
  private updateMetaThemeColor(): void {
    if (typeof window === "undefined") return;

    const body = document.body;
    if (!body) return;

    const computedStyles = window.getComputedStyle(body);
    const bgColor = computedStyles.backgroundColor;

    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute("content", bgColor);
    }
  }

  /**
   * Temporarily disable theme transitions
   */
  private disableTransitions(): void {
    if (typeof window === "undefined" || this.transitionDisabled) return;

    this.transitionDisabled = true;
    document.documentElement.style.setProperty(
      this.CONFIG.transitionDurationVar,
      "0s"
    );
  }

  /**
   * Re-enable theme transitions
   */
  private enableTransitions(): void {
    if (typeof window === "undefined" || !this.transitionDisabled) return;

    // Use requestAnimationFrame to ensure the browser has time to apply the initial state
    // before re-enabling transitions
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.documentElement.style.removeProperty(
          this.CONFIG.transitionDurationVar
        );
        this.transitionDisabled = false;
      });
    });
  }

  /**
   * Apply theme immediately during page transitions
   * This method is called before view transitions to prevent flickering
   */
  applyThemeImmediately(): void {
    if (typeof window === "undefined") return;

    // Store current theme in session storage for persistence during navigation
    sessionStorage.setItem(this.CONFIG.sessionStorageKey, this.currentTheme);

    // Disable transitions temporarily to prevent flickering
    this.disableTransitions();

    // Apply theme immediately to document
    document.documentElement.setAttribute("data-theme", this.currentTheme);

    // Update theme button if it exists
    const themeButton = document.querySelector("#theme-btn");
    if (themeButton) {
      themeButton.setAttribute("aria-label", this.currentTheme);
    }
  }

  /**
   * Handle document mutations to ensure theme is always applied
   * This catches any DOM changes that might reset the theme
   */
  private handleDocumentMutation(mutations: MutationRecord[]): void {
    for (const mutation of mutations) {
      if (
        mutation.type === "attributes" &&
        mutation.attributeName === "data-theme" &&
        mutation.target === document.documentElement
      ) {
        const currentAttr = document.documentElement.getAttribute("data-theme");
        if (currentAttr !== this.currentTheme) {
          // Re-apply our theme if it was changed
          document.documentElement.setAttribute(
            "data-theme",
            this.currentTheme
          );
        }
      }
    }
  }

  /**
   * Reflect the current theme preference in the DOM
   */
  reflectPreference(): void {
    if (typeof window === "undefined") return;

    document.documentElement.setAttribute("data-theme", this.currentTheme);

    const themeButton = document.querySelector("#theme-btn");
    if (themeButton) {
      themeButton.setAttribute("aria-label", this.currentTheme);
    }

    this.updateMetaThemeColor();

    // Re-enable transitions if they were disabled
    if (this.transitionDisabled) {
      this.enableTransitions();
    }
  }

  /**
   * Set the theme and persist the choice
   */
  setTheme(theme: Theme): void {
    this.currentTheme = theme;
    localStorage.setItem(this.CONFIG.storageKey, theme);
    // Also update session storage for transitions
    sessionStorage.setItem(this.CONFIG.sessionStorageKey, theme);
    this.reflectPreference();
  }

  /**
   * Toggle between light and dark themes
   */
  toggleTheme(): void {
    const newTheme: Theme = this.currentTheme === "light" ? "dark" : "light";
    this.setTheme(newTheme);
  }

  /**
   * Handles system theme preference changes
   */
  private handleSystemThemeChange(event: MediaQueryListEvent): void {
    if (!localStorage.getItem(this.CONFIG.storageKey)) {
      const newTheme: Theme = event.matches ? "dark" : "light";
      this.setTheme(newTheme);
    }
  }

  /**
   * Handle the start of a view transition
   * Apply theme immediately to prevent flickering
   */
  private handleViewTransitionStart(): void {
    this.applyThemeImmediately();
  }

  /**
   * Handle the completion of a view transition
   * Re-apply theme with transitions enabled
   */
  private handleViewTransitionComplete(): void {
    // Clear transition theme from session storage
    sessionStorage.removeItem(this.CONFIG.sessionStorageKey);
    this.reflectPreference();
  }

  /**
   * Clean up event listeners and observers
   */
  cleanup(): void {
    if (this.mediaQuery) {
      this.mediaQuery.removeEventListener(
        "change",
        this.handleSystemThemeChange
      );
    }

    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }

    document.removeEventListener(
      "astro:before-preparation",
      this.handleViewTransitionStart
    );
    document.removeEventListener(
      "astro:after-swap",
      this.handleViewTransitionComplete
    );
  }

  /**
   * Initialize theme functionality
   */
  initThemeFeature(): void {
    if (typeof window === "undefined") return;

    // Set initial preference
    this.reflectPreference();

    // Add click handler to theme toggle button
    const themeBtn = document.querySelector("#theme-btn");
    if (themeBtn) {
      themeBtn.addEventListener("click", () => this.toggleTheme());
    }

    // Watch for system theme changes
    this.mediaQuery = window.matchMedia(this.CONFIG.systemPreferenceQuery);
    this.mediaQuery.addEventListener("change", this.handleSystemThemeChange);

    // Handle Astro view transitions
    document.addEventListener(
      "astro:before-preparation",
      this.handleViewTransitionStart
    );
    document.addEventListener(
      "astro:after-swap",
      this.handleViewTransitionComplete
    );

    // Set up mutation observer to ensure theme is always applied
    this.observer = new MutationObserver(this.handleDocumentMutation);
    this.observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    // Handle link clicks to ensure theme is applied before navigation
    document.addEventListener("click", e => {
      const target = e.target as HTMLElement;
      const link = target.closest("a");
      if (link && link.href && !link.target && !link.hasAttribute("download")) {
        this.applyThemeImmediately();
      }
    });
  }
}

// Export singleton instance for convenience
export const themeService = new ThemeService();
