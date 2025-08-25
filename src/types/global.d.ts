/**
 * Global type declarations for the project
 */

declare global {
  interface Window {
    gtag?: (
      command: "config" | "event" | "get" | "set",
      targetId: string,
      config?: Record<string, any>
    ) => void;
  }
}

// Astro component declarations for TypeScript
declare module "*.astro" {
  const Component: (_props: Record<string, any>) => any;
  export default Component;
}

export {};
