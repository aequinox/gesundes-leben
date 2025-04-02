/**
 * Theme initialization script
 *
 * This script runs immediately when included in the page head
 * to prevent any flash of incorrect theme during page load.
 * It applies the theme before any content is rendered.
 */
(function () {
  // Configuration
  const STORAGE_KEY = "theme";
  const SESSION_STORAGE_KEY = "theme-transition";
  const DEFAULT_THEME = "light";
  const SYSTEM_PREFERENCE_QUERY = "(prefers-color-scheme: dark)";

  // Get theme from localStorage or sessionStorage (for transitions)
  const storedTheme = localStorage.getItem(STORAGE_KEY);
  const transitionTheme = sessionStorage.getItem(SESSION_STORAGE_KEY);
  let theme = transitionTheme || storedTheme;

  // If no stored theme, check system preference
  if (!theme) {
    theme = window.matchMedia(SYSTEM_PREFERENCE_QUERY).matches
      ? "dark"
      : DEFAULT_THEME;
  }

  // Apply theme immediately to prevent flash
  document.documentElement.setAttribute("data-theme", theme);

  // Clear transition theme from session storage after it's been used
  if (transitionTheme) {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
  }
})();
