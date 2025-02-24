/**
 * @module theme
 * @description
 * Utility module for managing theme switching and persistence.
 * Implements a singleton pattern for consistent theme management
 * across the application. Handles system preferences, user choices,
 * and theme transitions.
 *
 * @example
 * ```typescript
 * import { themeManager } from './utils/theme';
 *
 * themeManager.initThemeFeature();
 * themeManager.toggleTheme();
 * ```
 */

/**
 * Valid theme values for the application.
 * Restricts theme options to maintain consistency.
 */
export type Theme = "light" | "dark";

/**
 * Configuration interface for theme management.
 * Controls theme behavior and persistence.
 *
 * @property storageKey - Key used for theme storage in localStorage
 * @property defaultTheme - Default theme when no preference is set
 * @property systemPreferenceQuery - Media query for system theme detection
 */
export interface ThemeConfig {
  storageKey: string;
  defaultTheme: Theme;
  systemPreferenceQuery: string;
}

/**
 * Default configuration for theme management.
 * Provides sensible defaults for most use cases.
 *
 * @internal
 */
const DEFAULT_CONFIG: ThemeConfig = {
  storageKey: "theme",
  defaultTheme: "light",
  systemPreferenceQuery: "(prefers-color-scheme: dark)",
};

/**
 * Theme Manager Class
 * Handles theme switching and persistence using the Singleton pattern.
 * Provides a centralized way to manage theme state across the application.
 *
 * Features:
 * - Theme persistence in localStorage
 * - System theme preference detection
 * - Automatic theme color updates
 * - Event-driven theme switching
 */
export class ThemeManager {
  private static instance: ThemeManager;
  private config: ThemeConfig;
  private mediaQuery: MediaQueryList | null = null;
  private currentTheme: Theme;

  /**
   * Private constructor to enforce singleton pattern.
   * Initializes theme manager with configuration.
   *
   * @param config - Optional custom configuration
   */
  private constructor(config: Partial<ThemeConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.currentTheme = this.getPreferredTheme();
    this.initThemeFeature = this.initThemeFeature.bind(this);
    this.handleSystemThemeChange = this.handleSystemThemeChange.bind(this);
  }

  /**
   * Gets the singleton instance of ThemeManager.
   * Creates instance if it doesn't exist.
   *
   * @param config - Optional custom configuration
   * @returns ThemeManager instance
   */
  public static getInstance(config: Partial<ThemeConfig> = {}): ThemeManager {
    if (!ThemeManager.instance) {
      ThemeManager.instance = new ThemeManager(config);
    }
    return ThemeManager.instance;
  }

  /**
   * Gets the user's preferred theme.
   * Checks localStorage first, then system preference.
   *
   * @returns Current theme preference
   */
  public getPreferredTheme(): Theme {
    if (typeof window === "undefined") return this.config.defaultTheme;

    const storedTheme = localStorage.getItem(
      this.config.storageKey
    ) as Theme | null;
    if (storedTheme) return storedTheme;

    return window.matchMedia(this.config.systemPreferenceQuery).matches
      ? "dark"
      : this.config.defaultTheme;
  }

  /**
   * Updates the meta theme color based on current theme.
   * Ensures proper theme color in browser UI.
   *
   * @internal
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
   * Reflects the current theme preference in the DOM.
   * Updates data-theme attribute and button labels.
   *
   * @internal
   */
  private reflectPreference(): void {
    if (typeof window === "undefined") return;

    document.firstElementChild?.setAttribute("data-theme", this.currentTheme);

    const themeButton = document.querySelector("#theme-btn");
    if (themeButton) {
      themeButton.setAttribute("aria-label", this.currentTheme);
    }

    this.updateMetaThemeColor();
  }

  /**
   * Sets the theme and persists the choice.
   * Updates DOM and localStorage.
   *
   * @param theme - Theme to set
   */
  public setTheme(theme: Theme): void {
    this.currentTheme = theme;
    localStorage.setItem(this.config.storageKey, theme);
    this.reflectPreference();
  }

  /**
   * Toggles between light and dark themes.
   * Convenient method for theme switching.
   */
  public toggleTheme(): void {
    const newTheme: Theme = this.currentTheme === "light" ? "dark" : "light";
    this.setTheme(newTheme);
  }

  /**
   * Handles system theme preference changes.
   * Updates theme if no manual preference is set.
   *
   * @param event - Media query change event
   * @internal
   */
  private handleSystemThemeChange(event: MediaQueryListEvent): void {
    if (!localStorage.getItem(this.config.storageKey)) {
      const newTheme: Theme = event.matches ? "dark" : "light";
      this.setTheme(newTheme);
    }
  }

  /**
   * Cleans up event listeners.
   * Should be called when theme manager is no longer needed.
   */
  public cleanup(): void {
    if (this.mediaQuery) {
      this.mediaQuery.removeEventListener(
        "change",
        this.handleSystemThemeChange
      );
    }
  }

  /**
   * Initializes theme functionality.
   * Sets up event listeners and initial theme.
   *
   * @example
   * ```typescript
   * themeManager.initThemeFeature();
   * ```
   */
  public initThemeFeature(): void {
    if (typeof window === "undefined") return;

    // Set initial preference
    this.reflectPreference();

    // Add click handler to theme toggle button
    const themeBtn = document.querySelector("#theme-btn");
    if (themeBtn) {
      themeBtn.addEventListener("click", () => this.toggleTheme());
    }

    // Watch for system theme changes
    this.mediaQuery = window.matchMedia(this.config.systemPreferenceQuery);
    this.mediaQuery.addEventListener("change", this.handleSystemThemeChange);

    // Handle Astro view transitions
    document.addEventListener("astro:after-swap", () => {
      this.reflectPreference();
    });
  }
}

// Create and export singleton instance
export const themeManager = ThemeManager.getInstance();

// Initialize theme on load
if (typeof window !== "undefined") {
  window.onload = () => {
    themeManager.initThemeFeature();
  };

  // Set initial preference to avoid flash
  themeManager.initThemeFeature();
}
