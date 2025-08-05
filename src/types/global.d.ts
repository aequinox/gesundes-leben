/**
 * Global type declarations for the project
 */

declare global {
  interface Window {
    gtag?: (
      command: 'config' | 'event' | 'get' | 'set',
      targetId: string,
      config?: Record<string, any>
    ) => void;
  }
}

export {};