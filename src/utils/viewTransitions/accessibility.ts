/**
 * View Transitions Accessibility Module
 * Handles accessibility features including screen reader support, focus management, and reduced motion
 */

import { logger } from "@/utils/logger";

import type { AccessibilityConfig } from "./config";

export class AccessibilityManager {
  private config: AccessibilityConfig;
  private debug: boolean;

  constructor(config: AccessibilityConfig, debug = false) {
    this.config = config;
    this.debug = debug;
  }

  /**
   * Initialize accessibility features
   */
  public init(): void {
    this.setupRouteAnnouncements();
    this.setupReducedMotionSupport();
    this.setupFocusManagement();
  }

  /**
   * Setup route change announcements for screen readers
   */
  private setupRouteAnnouncements(): void {
    if (!this.config.announceRouteChanges) {
      return;
    }

    document.addEventListener("astro:after-swap", () => {
      this.announceRouteChange();
    });
  }

  /**
   * Announce route changes with multilingual support
   */
  private announceRouteChange(): void {
    const title = document.title;
    const { routeAnnouncementLanguage } = this.config;

    const announcements = {
      de: `Navigiert zu: ${title}`,
      en: `Navigated to: ${title}`,
    };

    const announcement = announcements[routeAnnouncementLanguage];

    if (!announcement) {
      if (this.debug) {
        logger.warn(
          `Unsupported announcement language: ${routeAnnouncementLanguage}`
        );
      }
      return;
    }

    // Create temporary announcement element
    const announcer = document.createElement("div");
    announcer.setAttribute("aria-live", "polite");
    announcer.setAttribute("aria-atomic", "true");
    announcer.className = "sr-only";
    announcer.style.cssText = this.getScreenReaderOnlyStyles();
    announcer.textContent = announcement;

    document.body.appendChild(announcer);

    // Remove after announcement
    setTimeout(() => {
      if (document.body.contains(announcer)) {
        document.body.removeChild(announcer);
      }
    }, 1000);
  }

  /**
   * Get screen reader only CSS styles
   */
  private getScreenReaderOnlyStyles(): string {
    return `
      position: absolute !important;
      width: 1px !important;
      height: 1px !important;
      padding: 0 !important;
      margin: -1px !important;
      overflow: hidden !important;
      clip: rect(0, 0, 0, 0) !important;
      white-space: nowrap !important;
      border: 0 !important;
    `;
  }

  /**
   * Setup enhanced reduced motion support
   */
  private setupReducedMotionSupport(): void {
    if (!this.config.respectReducedMotion) {
      return;
    }

    const reducedMotionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    const handleReducedMotion = (e: MediaQueryListEvent | MediaQueryList) => {
      if (e.matches) {
        this.enableReducedMotion();
      } else {
        this.disableReducedMotion();
      }
    };

    // Initial check
    handleReducedMotion(reducedMotionQuery);

    // Listen for changes
    reducedMotionQuery.addEventListener("change", handleReducedMotion);
  }

  /**
   * Enable reduced motion mode
   */
  private enableReducedMotion(): void {
    document.documentElement.style.setProperty("--vt-duration-fast", "1ms");
    document.documentElement.style.setProperty("--vt-duration-normal", "1ms");
    document.documentElement.style.setProperty("--vt-duration-slow", "1ms");
    document.documentElement.classList.add("vt-reduced-motion");

    if (this.debug) {
      logger.debug("AccessibilityManager: Reduced motion enabled");
    }
  }

  /**
   * Disable reduced motion mode and restore durations
   */
  private disableReducedMotion(): void {
    // Durations will be restored by the main enhancer's applyDynamicDurations method
    document.documentElement.classList.remove("vt-reduced-motion");

    if (this.debug) {
      logger.debug("AccessibilityManager: Reduced motion disabled");
    }
  }

  /**
   * Setup focus management during transitions
   */
  private setupFocusManagement(): void {
    document.addEventListener("astro:before-swap", () => {
      this.preserveFocus();
    });

    document.addEventListener("astro:after-swap", () => {
      this.restoreFocus();
    });
  }

  /**
   * Preserve focus state before transition
   */
  private preserveFocus(): void {
    const activeElement = document.activeElement as HTMLElement;

    if (activeElement && activeElement.id) {
      sessionStorage.setItem("vt-focus-id", activeElement.id);
    } else if (activeElement && activeElement.tagName) {
      const elementIndex = Array.from(
        document.querySelectorAll(activeElement.tagName)
      ).indexOf(activeElement);
      sessionStorage.setItem("vt-focus-tag", activeElement.tagName);
      sessionStorage.setItem("vt-focus-index", elementIndex.toString());
    }

    if (this.debug) {
      logger.debug("AccessibilityManager: Focus preserved", {
        element: activeElement?.tagName,
        id: activeElement?.id,
      });
    }
  }

  /**
   * Restore focus state after transition
   */
  private restoreFocus(): void {
    // Delay to ensure DOM is ready
    setTimeout(() => {
      const focusId = sessionStorage.getItem("vt-focus-id");
      const focusTag = sessionStorage.getItem("vt-focus-tag");
      const focusIndex = sessionStorage.getItem("vt-focus-index");

      let focusRestored = false;

      if (focusId) {
        const element = document.getElementById(focusId);
        if (element) {
          element.focus();
          sessionStorage.removeItem("vt-focus-id");
          focusRestored = true;
        }
      }

      if (!focusRestored && focusTag && focusIndex) {
        const elements = document.querySelectorAll(focusTag);
        const element = elements[parseInt(focusIndex)] as HTMLElement;
        if (element) {
          element.focus();
          sessionStorage.removeItem("vt-focus-tag");
          sessionStorage.removeItem("vt-focus-index");
          focusRestored = true;
        }
      }

      if (this.debug) {
        logger.debug("AccessibilityManager: Focus restoration", {
          restored: focusRestored,
          method: focusId ? "by-id" : focusTag ? "by-tag" : "none",
        });
      }
    }, 50);
  }

  /**
   * Update accessibility configuration
   */
  public updateConfig(newConfig: Partial<AccessibilityConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current accessibility status
   */
  public getStatus(): {
    reducedMotionEnabled: boolean;
    announceRouteChanges: boolean;
    language: string;
  } {
    return {
      reducedMotionEnabled:
        document.documentElement.classList.contains("vt-reduced-motion"),
      announceRouteChanges: this.config.announceRouteChanges,
      language: this.config.routeAnnouncementLanguage,
    };
  }
}
