declare module "turndown-plugin-gfm" {
  import type { TurndownService } from "turndown";

  interface GfmOptions {
    [key: string]: unknown;
  }

  export function gfm(options?: GfmOptions): TurndownService.Plugin;
  export function strikethrough(options?: GfmOptions): TurndownService.Plugin;
  export function tables(options?: GfmOptions): TurndownService.Plugin;
  export function taskListItems(options?: GfmOptions): TurndownService.Plugin;
  export function highlightedCodeBlock(
    options?: GfmOptions
  ): TurndownService.Plugin;
}
