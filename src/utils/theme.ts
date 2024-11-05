export type Theme = "light" | "dark";

export interface ThemeConfig {
  storageKey: string;
  defaultTheme: Theme;
  systemPreferenceQuery: string;
}

const DEFAULT_CONFIG: ThemeConfig = {
  storageKey: "theme",
  defaultTheme: "light",
  systemPreferenceQuery: "(prefers-color-scheme: dark)",
};

/**
 * Theme Manager Class
 * Handles theme switching and persistence
 */
export class ThemeManager {
  private static instance: ThemeManager;
  private config: ThemeConfig;
  private mediaQuery: MediaQueryList | null = null;
  private currentTheme: Theme;

  private constructor(config: Partial<ThemeConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.currentTheme = this.getPreferredTheme();
    this.initThemeFeature = this.initThemeFeature.bind(this);
    this.handleSystemThemeChange = this.handleSystemThemeChange.bind(this);
  }

  /**
   * Gets the singleton instance of ThemeManager
   */
  public static getInstance(config: Partial<ThemeConfig> = {}): ThemeManager {
    if (!ThemeManager.instance) {
      ThemeManager.instance = new ThemeManager(config);
    }
    return ThemeManager.instance;
  }

  /**
   * Gets the user's preferred theme
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
   * Sets the theme
   */
  public setTheme(theme: Theme): void {
    this.currentTheme = theme;
    localStorage.setItem(this.config.storageKey, theme);
    this.reflectPreference();
  }

  /**
   * Toggles between light and dark themes
   */
  public toggleTheme(): void {
    const newTheme: Theme = this.currentTheme === "light" ? "dark" : "light";
    this.setTheme(newTheme);
  }

  /**
   * Handles system theme preference changes
   */
  private handleSystemThemeChange(event: MediaQueryListEvent): void {
    if (!localStorage.getItem(this.config.storageKey)) {
      const newTheme: Theme = event.matches ? "dark" : "light";
      this.setTheme(newTheme);
    }
  }

  /**
   * Cleans up event listeners
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
   * Initializes theme functionality
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
