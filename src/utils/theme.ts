type Theme = 'light' | 'dark';

interface ThemeManager {
  getPreferredTheme: () => Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  initThemeFeature: () => void;
}

class ThemeManagerImpl implements ThemeManager {
  private primaryColorScheme: Theme | '' = '';
  private themeValue: Theme;
  
  constructor() {
    this.themeValue = this.getPreferredTheme();
    this.initThemeFeature = this.initThemeFeature.bind(this);
    this.handleSystemThemeChange = this.handleSystemThemeChange.bind(this);
  }

  public getPreferredTheme(): Theme {
    const currentTheme = localStorage.getItem('theme') as Theme | null;
    
    if (currentTheme) return currentTheme;
    if (this.primaryColorScheme) return this.primaryColorScheme;
    
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  private updateMetaThemeColor(): void {
    const body = document.body;
    if (!body) return;

    const computedStyles = window.getComputedStyle(body);
    const bgColor = computedStyles.backgroundColor;
    
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', bgColor);
  }

  private reflectPreference(): void {
    if (!this.themeValue) return;

    document.firstElementChild?.setAttribute('data-theme', this.themeValue);
    document.querySelector('#theme-btn')?.setAttribute('aria-label', this.themeValue);
    
    this.updateMetaThemeColor();
  }

  public setTheme(theme: Theme): void {
    this.themeValue = theme;
    localStorage.setItem('theme', theme);
    this.reflectPreference();
  }

  public toggleTheme(): void {
    const newTheme: Theme = this.themeValue === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  private handleSystemThemeChange(event: MediaQueryListEvent): void {
    const newTheme: Theme = event.matches ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  public initThemeFeature(): void {
    // Set initial preference
    this.reflectPreference();

    // Add click handler to theme toggle button
    const themeBtn = document.querySelector('#theme-btn');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => this.toggleTheme());
    }

    // Watch for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', this.handleSystemThemeChange);
  }
}

// Create and export singleton instance
export const themeManager = new ThemeManagerImpl();

// Initialize theme on load
window.onload = () => {
  themeManager.initThemeFeature();
  
  // Handle Astro view transitions
  document.addEventListener('astro:after-swap', () => {
    themeManager.initThemeFeature();
  });
};

// Set initial preference to avoid flash
themeManager.initThemeFeature();
