/**
 * @module ThemeService
 * @description
 * Service for managing theme switching and persistence.
 * Provides a consistent API for theme operations throughout the application.
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
  storageKey: string;
  defaultTheme: Theme;
  systemPreferenceQuery: string;
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
}

/**
 * Implementation of the theme service
 */
export class ThemeService implements IThemeService {
  private mediaQuery: MediaQueryList | null = null;
  private currentTheme: Theme;

  private readonly DEFAULT_CONFIG: ThemeConfig = {
    storageKey: "theme",
    defaultTheme: "light",
    systemPreferenceQuery: "(prefers-color-scheme: dark)",
  };

  constructor(private config: IConfigService = configService) {
    this.currentTheme = this.getPreferredTheme();
    this.handleSystemThemeChange = this.handleSystemThemeChange.bind(this);
  }

  /**
   * Get the user's preferred theme
   */
  getPreferredTheme(): Theme {
    if (typeof window === "undefined") {
      return this.DEFAULT_CONFIG.defaultTheme;
    }

    const storedTheme = localStorage.getItem(
      this.DEFAULT_CONFIG.storageKey
    ) as Theme | null;

    if (storedTheme) {
      return storedTheme;
    }

    return window.matchMedia(this.DEFAULT_CONFIG.systemPreferenceQuery).matches
      ? "dark"
      : this.DEFAULT_CONFIG.defaultTheme;
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
   * Reflects the current theme preference in the DOM
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
   * Set the theme and persist the choice
   */
  setTheme(theme: Theme): void {
    this.currentTheme = theme;
    localStorage.setItem(this.DEFAULT_CONFIG.storageKey, theme);
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
    if (!localStorage.getItem(this.DEFAULT_CONFIG.storageKey)) {
      const newTheme: Theme = event.matches ? "dark" : "light";
      this.setTheme(newTheme);
    }
  }

  /**
   * Clean up event listeners
   */
  cleanup(): void {
    if (this.mediaQuery) {
      this.mediaQuery.removeEventListener(
        "change",
        this.handleSystemThemeChange
      );
    }
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
    this.mediaQuery = window.matchMedia(
      this.DEFAULT_CONFIG.systemPreferenceQuery
    );
    this.mediaQuery.addEventListener("change", this.handleSystemThemeChange);

    // Handle Astro view transitions
    document.addEventListener("astro:after-swap", () => {
      this.reflectPreference();
    });
  }
}

// Export singleton instance for convenience
export const themeService = new ThemeService();
