import { logger, LogLevelName, type TimestampFormat } from "../logger";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("Logger", () => {
  // Spy on console methods
  const consoleSpy = {
    log: vi.spyOn(console, "log").mockImplementation(() => {}),
    error: vi.spyOn(console, "error").mockImplementation(() => {}),
  };

  // Mock process.stdout.write
  const stdoutWriteSpy = vi
    .spyOn(process.stdout, "write")
    .mockImplementation(() => true);

  // Store original settings to restore after tests
  interface LoggerSettings {
    minLevel: number;
    useColors: boolean;
    timestampFormat: TimestampFormat;
    component: string;
    logHandler: (message: string) => void;
  }

  let originalSettings: LoggerSettings;

  beforeEach(() => {
    // Save original logger settings
    originalSettings = { ...logger["settings"] };

    // Reset all mocks before each test
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Restore original logger settings after each test
    logger.configure({
      minLevel: originalSettings.minLevel ? LogLevelName.INFO : undefined,
      useColors: originalSettings.useColors,
      timestampFormat: originalSettings.timestampFormat,
      component: originalSettings.component,
    });
  });

  describe("Configuration", () => {
    it("should configure the logger with custom settings", () => {
      // Configure the logger
      logger.configure({
        minLevel: LogLevelName.DEBUG,
        useColors: false,
        timestampFormat: "none",
      });

      // Get private settings (using type assertion to access private property)
      const settings = (logger as unknown as { settings: LoggerSettings })[
        "settings"
      ];

      // Verify settings were applied
      expect(settings.minLevel).toBe(
        (logger as unknown as { levels: Record<LogLevelName, { id: number }> })[
          "levels"
        ][LogLevelName.DEBUG].id
      );
      expect(settings.useColors).toBe(false);
      expect(settings.timestampFormat).toBe("none");
    });

    it("should return the logger instance for chaining", () => {
      const result = logger.configure({ useColors: false });
      expect(result).toBe(logger);
    });

    it("should get the current log level", () => {
      logger.configure({ minLevel: LogLevelName.WARN });
      expect(logger.getLogLevel()).toBe(LogLevelName.WARN);
    });
  });

  describe("Log Levels", () => {
    beforeEach(() => {
      // Configure logger to show all levels and use a consistent format for testing
      logger.configure({
        minLevel: LogLevelName.SILLY,
        useColors: false,
        timestampFormat: "none",
      });
    });

    it("should log messages at different levels", () => {
      // Test each log level
      logger.silly("Silly message");
      expect(consoleSpy.log).toHaveBeenCalledWith(
        expect.stringContaining("[SILLY]")
      );

      logger.trace("Trace message");
      expect(consoleSpy.log).toHaveBeenCalledWith(
        expect.stringContaining("[TRACE]")
      );

      logger.debug("Debug message");
      expect(consoleSpy.log).toHaveBeenCalledWith(
        expect.stringContaining("[DEBUG]")
      );

      logger.info("Info message");
      expect(consoleSpy.log).toHaveBeenCalledWith(
        expect.stringContaining("[INFO]")
      );

      logger.warn("Warning message");
      expect(consoleSpy.log).toHaveBeenCalledWith(
        expect.stringContaining("[WARN]")
      );

      logger.error("Error message");
      expect(consoleSpy.log).toHaveBeenCalledWith(
        expect.stringContaining("[ERROR]")
      );

      logger.fatal("Fatal message");
      expect(consoleSpy.log).toHaveBeenCalledWith(
        expect.stringContaining("[FATAL]")
      );

      // Test legacy log method
      logger.log("Legacy log message");
      expect(consoleSpy.log).toHaveBeenCalledWith(
        expect.stringContaining("[INFO]")
      );
    });

    it("should respect minimum log level", () => {
      // Set minimum level to WARN
      logger.configure({ minLevel: LogLevelName.WARN });

      // These should not be logged
      logger.silly("Silly message");
      logger.trace("Trace message");
      logger.debug("Debug message");
      logger.info("Info message");

      // These should be logged
      logger.warn("Warning message");
      logger.error("Error message");
      logger.fatal("Fatal message");

      // Check call count (only 3 messages should be logged)
      expect(consoleSpy.log).toHaveBeenCalledTimes(3);
    });
  });

  describe("Message Formatting", () => {
    beforeEach(() => {
      // Configure logger for consistent testing
      logger.configure({
        minLevel: LogLevelName.SILLY,
        useColors: false,
        timestampFormat: "none",
      });
    });

    it("should format string messages", () => {
      const message = "Test message";
      logger.info(message);
      expect(consoleSpy.log).toHaveBeenCalledWith(
        expect.stringContaining(message)
      );
    });

    it("should format Error objects with stack traces", () => {
      const error = new Error("Test error");
      logger.error(error);

      // Should include error message
      expect(consoleSpy.log).toHaveBeenCalledWith(
        expect.stringContaining("Test error")
      );

      // Should include stack trace
      expect(consoleSpy.log).toHaveBeenCalledWith(
        expect.stringContaining("Error: Test error")
      );
    });

    it("should format objects as JSON", () => {
      const obj = { name: "Test", value: 123 };
      logger.info(obj);

      // Should include stringified object
      expect(consoleSpy.log).toHaveBeenCalledWith(
        expect.stringContaining('"name": "Test"')
      );
      expect(consoleSpy.log).toHaveBeenCalledWith(
        expect.stringContaining('"value": 123')
      );
    });
  });

  describe("Timestamp Formats", () => {
    it("should format timestamps as ISO strings", () => {
      logger.configure({ timestampFormat: "iso", useColors: false });
      logger.info("Test message");

      // ISO format regex: YYYY-MM-DDTHH:mm:ss.sssZ
      const isoRegex = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/;
      expect(consoleSpy.log).toHaveBeenCalledWith(
        expect.stringMatching(isoRegex)
      );
    });

    it("should format timestamps as locale strings", () => {
      logger.configure({ timestampFormat: "locale", useColors: false });
      logger.info("Test message");

      // Just verify that console.log was called (locale format varies by system)
      expect(consoleSpy.log).toHaveBeenCalled();
    });

    it("should format timestamps as time-only (Astro.js style)", () => {
      logger.configure({ timestampFormat: "time", useColors: false });
      logger.info("Test message");

      // Time format regex: HH:MM:SS
      const timeRegex = /\d{2}:\d{2}:\d{2}/;
      expect(consoleSpy.log).toHaveBeenCalledWith(
        expect.stringMatching(timeRegex)
      );
    });

    it('should not include timestamp when format is "none"', () => {
      logger.configure({ timestampFormat: "none", useColors: false });
      logger.info("Test message");

      // Should not include timestamp
      const callArg = consoleSpy.log.mock.calls[0][0];
      expect(callArg).not.toMatch(/\d{2}:\d{2}:\d{2}/);
      expect(callArg).not.toMatch(/\d{4}-\d{2}-\d{2}/);
    });
  });

  describe("Component Name", () => {
    it("should include component name in log messages", () => {
      logger.configure({
        timestampFormat: "time",
        component: "vite",
        useColors: false,
      });

      logger.info("Test message");

      // Should include component name in brackets
      expect(consoleSpy.log).toHaveBeenCalledWith(
        expect.stringContaining("[vite]")
      );
    });
  });

  describe("Error Handling", () => {
    it("should handle console.log failures", () => {
      // Make console.log throw an error
      consoleSpy.log.mockImplementationOnce(() => {
        throw new Error("Console log error");
      });

      // Should not throw and should fall back to process.stdout.write
      expect(() => logger.info("Test message")).not.toThrow();
      expect(stdoutWriteSpy).toHaveBeenCalled();
    });

    it("should handle JSON.stringify failures", () => {
      // Create an object with circular reference
      const circularObj: Record<string, unknown> = { name: "Circular" };
      circularObj.self = circularObj;

      // Should not throw
      expect(() => logger.info(circularObj)).not.toThrow();

      // Should include fallback message
      expect(consoleSpy.log).toHaveBeenCalledWith(
        expect.stringContaining("[Object] (Failed to stringify")
      );
    });
  });

  describe("Custom Log Handler", () => {
    it("should use custom log handler when provided", () => {
      const customHandler = vi.fn();

      logger.configure({
        logHandler: customHandler,
        useColors: false,
        timestampFormat: "none",
      });

      logger.info("Test message");

      // Custom handler should be called instead of console.log
      expect(customHandler).toHaveBeenCalled();
      expect(consoleSpy.log).not.toHaveBeenCalled();
    });
  });
});
