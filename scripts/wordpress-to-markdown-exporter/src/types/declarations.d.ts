/**
 * Type declarations for modules without type definitions
 */

// Declare turndown module
declare module 'turndown' {
  export default class TurndownService {
    constructor(options?: any);
    turndown(html: string): string;
    use(plugin: any): TurndownService;
    addRule(name: string, rule: any): TurndownService;
  }
}

// Declare turndown-plugin-gfm module
declare module 'turndown-plugin-gfm' {
  export function gfm(turndownService: any): any;
  export function tables(turndownService: any): any;
  export function strikethrough(turndownService: any): any;
}

// Declare any other modules that might be missing type definitions
