/**
 * @module AnimationService
 * @description
 * Service for managing Animate On Scroll (AOS) animations.
 * Provides a consistent API for animation operations throughout the application.
 */

import AOS from "aos";
import type { IConfigService } from "@/core/config/ConfigService";
import { configService } from "@/core/config/ConfigService";

/**
 * Valid easing functions for AOS animations
 */
export type AOSEasing =
  | "linear"
  | "ease"
  | "ease-in"
  | "ease-out"
  | "ease-in-out"
  | "ease-in-back"
  | "ease-out-back"
  | "ease-in-out-back"
  | "ease-in-sine"
  | "ease-out-sine"
  | "ease-in-out-sine"
  | "ease-in-quad"
  | "ease-out-quad"
  | "ease-in-out-quad"
  | "ease-in-cubic"
  | "ease-out-cubic"
  | "ease-in-out-cubic"
  | "ease-in-quart"
  | "ease-out-quart"
  | "ease-in-out-quart";

/**
 * Valid placement options for AOS animations
 */
export type AOSPlacement =
  | "top-bottom"
  | "top-center"
  | "top-top"
  | "center-bottom"
  | "center-center"
  | "center-top"
  | "bottom-bottom"
  | "bottom-center"
  | "bottom-top";

/**
 * Configuration interface for AOS initialization
 */
export interface AOSConfig {
  readonly duration: number;
  readonly easing: AOSEasing;
  readonly once: boolean;
  readonly offset: number;
  readonly delay?: number;
  readonly mirror?: boolean;
  readonly anchorPlacement?: AOSPlacement;
  readonly disable?: boolean | "phone" | "tablet" | "mobile" | (() => boolean);
  readonly startEvent?: string;
  readonly disableMutationObserver?: boolean;
}

/**
 * Interface for animation service operations
 */
export interface IAnimationService {
  /**
   * Initialize AOS with configuration
   */
  init(config?: Partial<AOSConfig>): void;

  /**
   * Refresh all AOS instances
   */
  refresh(): void;

  /**
   * Refresh AOS instances with debounce
   */
  debouncedRefresh(delay?: number): void;
}

/**
 * Implementation of the animation service
 */
export class AnimationService implements IAnimationService {
  private refreshTimeoutId: NodeJS.Timeout | undefined;

  private readonly DEFAULT_CONFIG: AOSConfig = {
    duration: 800,
    easing: "ease-out-cubic",
    once: true,
    offset: 50,
  };

  constructor(private config: IConfigService = configService) {}

  /**
   * Validates AOS configuration values
   */
  private validateConfig(config: Partial<AOSConfig>): void {
    if (config.duration !== undefined && config.duration < 0) {
      throw new Error("Duration must be a positive number");
    }

    if (config.offset !== undefined && config.offset < 0) {
      throw new Error("Offset must be a positive number");
    }

    if (config.delay !== undefined && config.delay < 0) {
      throw new Error("Delay must be a positive number");
    }
  }

  /**
   * Initialize AOS with configuration
   */
  init(config: Partial<AOSConfig> = {}): void {
    this.validateConfig(config);
    AOS.init({
      ...this.DEFAULT_CONFIG,
      ...config,
    });
  }

  /**
   * Refresh all AOS instances
   */
  refresh(): void {
    AOS.refresh();
  }

  /**
   * Refresh AOS instances with debounce
   */
  debouncedRefresh(delay = 100): void {
    if (this.refreshTimeoutId) {
      clearTimeout(this.refreshTimeoutId);
    }

    this.refreshTimeoutId = setTimeout(() => {
      AOS.refresh();
      this.refreshTimeoutId = undefined;
    }, delay);
  }
}

// Export singleton instance for convenience
export const animationService = new AnimationService();
