/**
 * Type definitions for @pagefind/default-ui
 *
 * This file provides TypeScript support for the Pagefind search UI library.
 * Since the official types are not available, we declare the necessary interfaces here.
 */

declare module "@pagefind/default-ui" {
  export interface PagefindUIConfig {
    element: string;
    showSubResults?: boolean;
    showImages?: boolean;
    excerptLength?: number;
    openFilters?: string[];
    translations?: Record<string, string>;
    processTerm?: (term: string) => string;
  }

  export interface PagefindUIInstance {
    triggerSearch: (query: string) => void;
  }

  export class PagefindUI {
    constructor(config: PagefindUIConfig);
    triggerSearch: (query: string) => void;
  }
}
