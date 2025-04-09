// declarations.d.ts
declare module 'turndown-plugin-gfm' {
  export function gfm(): (turndownService: TurndownService) => void;
}