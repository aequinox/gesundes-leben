import { describe, expect, test, vi, beforeEach } from "vitest";
import {
  aosInit,
  refreshAOS,
  debouncedRefreshAOS,
  type AOSConfig,
} from "../aos";

// Mock AOS library
vi.mock("aos", () => ({
  default: {
    init: vi.fn(),
    refresh: vi.fn(),
  },
}));

// Import mocked AOS
import AOS from "aos";

describe("AOS utilities", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  describe("aosInit", () => {
    test("initializes with default config", () => {
      aosInit();

      expect(AOS.init).toHaveBeenCalledWith({
        duration: 800,
        easing: "ease-out-cubic",
        once: true,
        offset: 50,
      });
    });

    test("merges custom config with defaults", () => {
      const customConfig: Partial<AOSConfig> = {
        duration: 1000,
        easing: "ease-in-out",
      };

      aosInit(customConfig);

      expect(AOS.init).toHaveBeenCalledWith({
        duration: 1000,
        easing: "ease-in-out",
        once: true,
        offset: 50,
      });
    });

    test("throws error for negative duration", () => {
      expect(() => aosInit({ duration: -100 })).toThrow(
        "Duration must be a positive number"
      );
    });

    test("throws error for negative offset", () => {
      expect(() => aosInit({ offset: -50 })).toThrow(
        "Offset must be a positive number"
      );
    });

    test("throws error for negative delay", () => {
      expect(() => aosInit({ delay: -200 })).toThrow(
        "Delay must be a positive number"
      );
    });

    test("accepts valid easing value", () => {
      aosInit({ easing: "ease-in-out-cubic" });
      expect(AOS.init).toHaveBeenCalled();
    });

    test("accepts valid placement value", () => {
      aosInit({ anchorPlacement: "center-bottom" });
      expect(AOS.init).toHaveBeenCalled();
    });

    test("accepts boolean disable value", () => {
      aosInit({ disable: true });
      expect(AOS.init).toHaveBeenCalled();
    });

    test("accepts function disable value", () => {
      const disableFunc = () => window.innerWidth < 768;
      aosInit({ disable: disableFunc });
      expect(AOS.init).toHaveBeenCalled();
    });
  });

  describe("refreshAOS", () => {
    test("calls AOS.refresh", () => {
      refreshAOS();
      expect(AOS.refresh).toHaveBeenCalled();
    });
  });

  describe("debouncedRefreshAOS", () => {
    test("debounces refresh calls", () => {
      debouncedRefreshAOS();
      debouncedRefreshAOS();
      debouncedRefreshAOS();

      expect(AOS.refresh).not.toHaveBeenCalled();

      vi.advanceTimersByTime(100);

      expect(AOS.refresh).toHaveBeenCalledTimes(1);
    });

    test("respects custom delay", () => {
      debouncedRefreshAOS(200);

      vi.advanceTimersByTime(100);
      expect(AOS.refresh).not.toHaveBeenCalled();

      vi.advanceTimersByTime(100);
      expect(AOS.refresh).toHaveBeenCalledTimes(1);
    });

    test("cancels previous timeout", () => {
      debouncedRefreshAOS(200);

      vi.advanceTimersByTime(100);
      debouncedRefreshAOS(200);

      vi.advanceTimersByTime(100);
      expect(AOS.refresh).not.toHaveBeenCalled();

      vi.advanceTimersByTime(100);
      expect(AOS.refresh).toHaveBeenCalledTimes(1);
    });
  });
});
