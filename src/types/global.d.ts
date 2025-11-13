/**
 * Global type declarations for the project
 */

declare global {
  interface Window {
    gtag?: (
      command: "config" | "event" | "get" | "set",
      targetId: string,
      config?: Record<string, unknown>
    ) => void;
  }
}

// Astro component declarations for TypeScript
declare module "*.astro" {
  const Component: (_props: Record<string, unknown>) => unknown;
  export default Component;
}

export {};
