import AOS from "aos";

interface AOSConfig {
  readonly duration: number;
  readonly easing:
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
  readonly once: boolean;
  readonly offset: number;
  readonly delay?: number;
  readonly mirror?: boolean;
  readonly anchorPlacement?:
    | "top-bottom"
    | "top-center"
    | "top-top"
    | "center-bottom"
    | "center-center"
    | "center-top"
    | "bottom-bottom"
    | "bottom-center"
    | "bottom-top";
}

const DEFAULT_CONFIG: AOSConfig = {
  duration: 800,
  easing: "ease-out-cubic",
  once: true,
  offset: 50,
};
/**
 * Initializes Animate On Scroll library with default configuration
 * @param config - Optional custom configuration to override defaults
 */
export function aosInit(config: Partial<AOSConfig> = {}): void {
  AOS.init({
    ...DEFAULT_CONFIG,
    ...config,
  });
}
