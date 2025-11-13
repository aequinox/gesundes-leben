/**
 * Lazy loads view transition CSS on first navigation
 * This reduces the initial bundle size by ~8KB
 */

let loaded = false;

export async function loadViewTransitions(): Promise<void> {
  if (loaded) return;

  await import('../styles/view-transitions.css');
  loaded = true;
}
