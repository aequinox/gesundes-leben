# ADR-0004: Logging Abstraction Layer

## Status

Accepted

## Date

2025-11-09

## Context

During initial development, logging was handled inconsistently:
- Direct `console.log()`, `console.warn()`, `console.error()` calls throughout codebase
- No log level control
- Inconsistent formatting
- No timestamp or context information
- Production logs cluttering user console
- Difficult to filter or search logs
- No color coding for severity

**Problems with direct console usage**:
1. **No control**: Can't disable debug logs in production
2. **No context**: Hard to identify log source
3. **Poor UX**: Logs visible in browser console (unprofessional)
4. **Hard to debug**: All logs look the same
5. **No standards**: CLAUDE.md requires logger utility, but console.log used anyway

## Decision

Created a **centralized logging abstraction** (`src/utils/logger.ts`) that:

### 1. Provides Multiple Log Levels
```typescript
enum LogLevelName {
  SILLY = "SILLY",   // Lowest priority
  TRACE = "TRACE",
  DEBUG = "DEBUG",
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
  FATAL = "FATAL"    // Highest priority
}
```

### 2. Features Rich Configuration
```typescript
interface LoggerConfig {
  minLevel?: LogLevelName;         // Filter by severity
  useColors?: boolean;             // Colored output
  timestampFormat?: TimestampFormat; // ISO, locale, time, none
  component?: string;              // Tag logs by component
  logHandler?: (msg: string) => void; // Custom output
}
```

### 3. Automatic Production Silencing
```typescript
private logMessage(level: LogLevelName, ...args: unknown[]): void {
  // Skip all logging in production environment
  if (import.meta.env.PROD) {
    return;
  }
  // ... rest of logging logic
}
```

### 4. Colored Output
Uses chalk library for terminal colors:
- **SILLY/TRACE**: White/bright white
- **DEBUG**: Green
- **INFO**: Blue
- **WARN**: Yellow
- **ERROR**: Red
- **FATAL**: Bright red

### 5. Smart Message Formatting
- Handles strings, errors, objects
- Pretty-prints JSON
- Stack traces for errors
- Multi-argument support like console.log

## Consequences

### Positive

- **Professional output**: Color-coded, timestamped logs
- **Production safe**: Zero logs in production builds
- **Filterable**: Set minimum log level to reduce noise
- **Consistent formatting**: All logs follow same structure
- **Better debugging**: Easy to identify log source and severity
- **Standards compliance**: Enforces CLAUDE.md requirement
- **Configurable**: Adjust behavior per environment/component
- **Type-safe**: Full TypeScript support
- **Error handling**: Graceful degradation if logging fails

### Negative

- **Additional dependency**: Requires chalk library
- **Learning curve**: Developers must learn logger API
- **Migration effort**: Replace all console.log calls
- **Overhead**: Slight performance cost (negligible)
- **File size**: Logger utility adds ~410 lines

### Neutral

- Need to document logger usage in team onboarding
- ESLint rule needed to prevent console.log (implemented)

## Implementation Details

### Basic Usage
```typescript
import { logger } from "@/utils/logger";

// Different severity levels
logger.debug("Processing reference:", referenceId);
logger.info("Cache hit for:", cacheKey);
logger.warn("Missing alt text:", imageSrc);
logger.error("Failed to load component:", error);
logger.fatal("Critical system failure:", error);
```

### Configuration
```typescript
// Configure for specific component
logger.configure({
  minLevel: LogLevelName.DEBUG,
  component: "ReferenceCache",
  timestampFormat: "time"
});
```

### Example Output
```
13:44:25 [ReferenceCache] [INFO] Loading references from cache
13:44:25 [ReferenceCache] [WARN] Cache miss for reference: 2023-smith
13:44:26 [ReferenceCache] [ERROR] Failed to parse YAML: Invalid syntax
```

## Migration Strategy

### Phase 1: Create Logger (✅ Completed)
- Implemented LoggerService class
- Exported singleton instance
- Added comprehensive documentation

### Phase 2: Enforce Standards (✅ Completed)
- Added ESLint rule: `"no-console": "error"`
- Allowed console in scripts/ directory only
- Documented in CLAUDE.md

### Phase 3: Replace Console Calls (✅ Completed)
Fixed all violations:
- InternalLink.astro (2 instances)
- ContextualLinks.astro (4 instances)
- MeiroEmbed.astro (1 instance)
- viewTransitionEnhancements.ts (1 instance)
- Layout.astro (1 instance)

### Phase 4: Prevent Regression (✅ Completed)
- ESLint catches new console.log in CI
- Code review checklist includes logger check

## Error Handling

Logger includes robust error handling:

```typescript
try {
  this.settings.logHandler(output);
} catch (error) {
  // Fallback if logging fails
  console.error(`[LOGGER_ERROR] Failed to log message: ${error}`);
  console.error(`Original content: ${args.map(String).join(" ")}`);
}
```

This ensures logging never crashes the application.

## Performance Considerations

- **Production**: Zero-cost abstraction (returns immediately)
- **Development**: Minimal overhead (~0.1ms per log)
- **Chalk initialization**: Lazy-loaded, cached
- **Message formatting**: Only when needed (log level check first)

## Backward Compatibility

```typescript
// Legacy method for backward compatibility
log(...args: unknown[]): void {
  this.info(...args);
}
```

Existing `logger.log()` calls map to `logger.info()`.

## Testing

Logger includes comprehensive test coverage:
- All log levels tested
- Configuration changes verified
- Error handling validated
- Message formatting checked
- Production silencing confirmed

## Alternatives Considered

### 1. Third-party Logging Libraries
- **winston**: Too heavy for frontend/SSG use case
- **pino**: Excellent but overkill for our needs
- **debug**: Too minimal, lacks features we need

**Decision**: Custom solution provides exactly what we need, no more

### 2. Keep console.log with Wrapper
```typescript
export const log = (...args) => console.log(...args);
```
**Rejected**: Doesn't solve core problems (production logs, filtering, formatting)

### 3. Build-time Log Stripping
Remove all logs during production build
**Rejected**: We want runtime control, some errors might need logging even in prod

## Related Decisions

- ESLint configuration - no-console rule enforcement
- Component best practices - all components must use logger
- Error handling strategy - logger used for error reporting

## Future Enhancements

Potential improvements:

1. **Remote logging**: Send errors to error tracking service (Sentry, etc.)
2. **Log aggregation**: Collect logs in development for analysis
3. **Performance metrics**: Track operation timing
4. **Structured logging**: JSON output for machine parsing
5. **Log rotation**: File-based logging with rotation
6. **Browser DevTools integration**: Custom console formatter

## Notes

The logging abstraction demonstrates **separation of concerns**:
- Business logic doesn't care about log formatting
- Logger handles all presentation details
- Configuration centralized and testable

This is a textbook example of the **Dependency Inversion Principle**: high-level modules (components) depend on abstraction (logger interface), not concretions (console).

## References

- `src/utils/logger.ts`
- CLAUDE.md: Logging Standards
- ESLint configuration: `eslint.config.js`
- Chalk documentation: https://github.com/chalk/chalk
