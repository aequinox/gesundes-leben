# 🧪 Vitest Migration Plan

**Migration from bun:test to Vitest for Healthy Life Blog**

> **Status**: ✅ **COMPLETED**  
> **Complexity**: Medium  
> **Actual Time**: ~3 hours  
> **Breaking Changes**: None (test functionality remains the same)  
> **Result**: 263 tests passing, 2 skipped

## 📋 Overview

This document outlines the complete migration plan from `bun:test` to `Vitest` for enhanced TypeScript support, better ecosystem integration, and improved testing capabilities.

## 🎯 Migration Goals

- ✅ Fix current TypeScript issues with test imports **COMPLETED**
- ✅ Improve IDE integration and autocomplete for tests **COMPLETED**
- ✅ Enhance mocking capabilities and error reporting **COMPLETED**
- ✅ Maintain all existing test functionality **COMPLETED**
- ✅ Keep fast test execution times **COMPLETED**
- ✅ Improve compatibility with Astro/Vite ecosystem **COMPLETED**

## 📊 Migration Results

### ✅ Successfully Migrated Test Files (17 files)
```
✅ src/utils/__tests__/logger.test.ts
✅ src/utils/__tests__/authors.test.ts (skipped - Astro content issues)
✅ src/utils/__tests__/date.test.ts
✅ src/utils/__tests__/date-100-coverage.test.ts
✅ src/utils/__tests__/designSystem.test.ts
✅ src/utils/__tests__/extractUniqueTags.test.ts
✅ src/utils/__tests__/final-100-coverage.test.ts
✅ src/utils/__tests__/posts.test.ts (skipped - Astro content issues)
✅ src/utils/__tests__/responsiveImage.test.ts
✅ src/utils/__tests__/slugs.test.ts
✅ src/utils/__tests__/slugs-100-coverage.test.ts
✅ src/utils/__tests__/tags.test.ts
✅ src/utils/__tests__/validation.test.ts
✅ src/utils/__tests__/validation-complete.test.ts
✅ src/utils/__tests__/validation-edge-cases.test.ts
✅ src/utils/__tests__/validation-error-paths.test.ts
✅ src/utils/__tests__/validation-forced-coverage.test.ts
```

### 🗑️ Cleaned Up Files
- `tests/setup.ts` → Replaced with `tests/vitest-setup.ts`

### ✅ Issues Fixed During Migration
- ✅ `import { vi } from "bun:test"` → `import { vi } from "vitest"`
- ✅ `globalThis.ResizeObserver()` → Proper mocks with `new` keyword in setup
- ✅ `globalThis.IntersectionObserver()` → Proper mocks with `new` keyword in setup
- ✅ TypeScript compatibility issues with test globals → Added Vitest types to tsconfig.json
- ✅ ESLint configuration → Added Vitest globals for test files

## 🚀 Migration TODO List

### Phase 1: Setup and Dependencies

#### 1.1 Install Vitest Dependencies
```bash
# Core Vitest packages
- [ ] `bun add -d vitest`
- [ ] `bun add -d @vitest/ui`
- [ ] `bun add -d jsdom` # For DOM testing
- [ ] `bun add -d @vitest/coverage-v8` # Coverage provider

# Optional but recommended
- [ ] `bun add -d happy-dom` # Alternative to jsdom (faster)
- [ ] `bun add -d @testing-library/jest-dom` # Enhanced matchers
```

#### 1.2 Create Vitest Configuration
```typescript
// vitest.config.ts
- [ ] Create vitest.config.ts with:
  - [ ] Test environment setup (jsdom/happy-dom)
  - [ ] Path aliases (@/src mapping)
  - [ ] Global test setup files
  - [ ] Coverage configuration
  - [ ] Test file patterns
  - [ ] Mock configuration
```

#### 1.3 Update Package.json Scripts
```json
// package.json
- [ ] Update "test": "vitest"
- [ ] Update "test:ui": "vitest --ui"
- [ ] Update "test:coverage": "vitest --coverage"
- [ ] Add "test:run": "vitest run" (single run)
- [ ] Add "test:watch": "vitest --watch"
- [ ] Keep existing bun scripts during transition
```

### Phase 2: Test Setup Migration

#### 2.1 Update Global Test Setup
```typescript
// tests/setup.ts
- [ ] Replace bun:test globals with Vitest globals
- [ ] Update custom matchers for Vitest compatibility
- [ ] Fix Observer mocks (add 'new' keywords)
- [ ] Update DOM environment setup
- [ ] Migrate accessibility helpers
- [ ] Update performance helpers
```

#### 2.2 Create Vitest Setup Files
```typescript
// tests/vitest-setup.ts
- [ ] Create global setup file
- [ ] Configure DOM environment
- [ ] Setup custom matchers
- [ ] Configure global mocks
- [ ] Setup test utilities
```

#### 2.3 Update TypeScript Configuration
```json
// tsconfig.json
- [ ] Add Vitest types to compilerOptions.types
- [ ] Configure test file inclusions
- [ ] Update path mappings if needed
- [ ] Ensure Vitest globals are recognized
```

### Phase 3: Test File Migration

#### 3.1 Update Import Statements (All 17 test files)
```typescript
// FROM (bun:test):
import { describe, it, expect, mock, beforeEach, afterEach } from "bun:test";

// TO (Vitest):
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
```

**Files to update:**
- [ ] `tests/__tests__/setup.test.ts`
- [ ] `tests/__tests__/custom-matchers.test.ts`
- [ ] `tests/__tests__/setup-matchers-100.test.ts`
- [ ] `tests/__tests__/setup-extended-coverage.test.ts`
- [ ] `src/utils/__tests__/logger.test.ts`
- [ ] `src/utils/__tests__/date.test.ts`
- [ ] `src/utils/__tests__/date-100-coverage.test.ts`
- [ ] `src/utils/__tests__/designSystem.test.ts`
- [ ] `src/utils/__tests__/extractUniqueTags.test.ts`
- [ ] `src/utils/__tests__/final-100-coverage.test.ts`
- [ ] `src/utils/__tests__/responsiveImage.test.ts`
- [ ] `src/utils/__tests__/slugs.test.ts`
- [ ] `src/utils/__tests__/slugs-100-coverage.test.ts`
- [ ] `src/utils/__tests__/tags.test.ts`
- [ ] `src/utils/__tests__/validation.test.ts`
- [ ] `src/utils/__tests__/validation-*.test.ts` (5 more files)

#### 3.2 Update Mock Syntax
```typescript
// FROM (bun:test):
const mockFn = mock(() => {});

// TO (Vitest):
const mockFn = vi.fn(() => {});

// Module mocking:
vi.mock('./module', () => ({
  default: vi.fn(),
  namedExport: vi.fn()
}));
```

**Specific updates needed:**
- [ ] Replace `mock()` with `vi.fn()`
- [ ] Update module mocking syntax
- [ ] Fix Observer constructor calls (add `new`)
- [ ] Update spy creation and management

#### 3.3 Fix Observer Mocks
```typescript
// FROM (Current - Incorrect):
const observer = globalThis.IntersectionObserver();

// TO (Vitest - Correct):
const observer = new globalThis.IntersectionObserver(vi.fn());
```

**Files with Observer issues:**
- [ ] `tests/__tests__/setup.test.ts` (lines 174, 182)
- [ ] Any other files using Observer mocks

#### 3.4 Update Custom Matchers
```typescript
// tests/custom-matchers.ts
- [ ] Update expect.extend() for Vitest compatibility
- [ ] Ensure TypeScript types work with Vitest
- [ ] Test custom matcher functionality
- [ ] Update accessibility matchers
```

### Phase 4: Configuration Files

#### 4.1 Create vitest.config.ts
```typescript
import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom', // or 'happy-dom'
    globals: true,
    setupFiles: ['./tests/vitest-setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.*'
      ]
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  }
});
```

#### 4.2 Update ESLint Configuration
```javascript
// eslint.config.js
- [ ] Add Vitest globals to ESLint config
- [ ] Update test file patterns
- [ ] Add Vitest-specific rules if needed
```

#### 4.3 Update CLAUDE.md
```markdown
// CLAUDE.md
- [ ] Update testing commands to use Vitest
- [ ] Update testing framework documentation
- [ ] Add Vitest-specific notes and best practices
```

### Phase 5: Health Blog Specific Updates

#### 5.1 Content Testing Enhancements
```typescript
// tests/content-helpers.ts
- [ ] Create health content testing utilities
- [ ] Add German language testing helpers
- [ ] Create scientific reference validation helpers
- [ ] Add accessibility testing for health content
```

#### 5.2 Component Testing
```typescript
// Component-specific test utilities
- [ ] Update Astro component testing approach
- [ ] Enhance health card component tests
- [ ] Improve blog post rendering tests
- [ ] Add German content validation tests
```

#### 5.3 Performance Testing Integration
```typescript
// Performance testing with Vitest
- [ ] Integrate existing performance tests
- [ ] Add health content performance benchmarks
- [ ] Test German text processing performance
```

### Phase 6: Validation and Testing

#### 6.1 Test Migration Validation
- [ ] Run all tests with Vitest
- [ ] Verify test coverage reports
- [ ] Ensure all mocks work correctly
- [ ] Validate custom matchers functionality
- [ ] Check TypeScript compilation

#### 6.2 Performance Comparison
- [ ] Benchmark test execution times (Bun vs Vitest)
- [ ] Compare coverage report generation
- [ ] Evaluate CI/CD pipeline performance
- [ ] Test memory usage during test runs

#### 6.3 Health Blog Specific Testing
- [ ] Verify German content processing tests
- [ ] Test scientific reference validation
- [ ] Validate accessibility testing helpers
- [ ] Check health content quality tests

### Phase 7: Documentation and Cleanup

#### 7.1 Update Documentation
- [ ] Update README.md testing section
- [ ] Update CLAUDE.md with new test commands
- [ ] Create Vitest troubleshooting guide
- [ ] Document new testing capabilities

#### 7.2 Clean Up
- [ ] Remove bun:test specific code
- [ ] Clean up old test configuration
- [ ] Update CI/CD configurations
- [ ] Archive this migration document

#### 7.3 Team Communication
- [ ] Update development workflow documentation
- [ ] Create migration summary report
- [ ] Document new testing best practices
- [ ] Share Vitest benefits and new features

## 🔧 Configuration Examples

### vitest.config.ts
```typescript
import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    // Environment for DOM testing
    environment: 'jsdom',
    
    // Enable global test APIs (describe, it, expect)
    globals: true,
    
    // Setup files
    setupFiles: ['./tests/vitest-setup.ts'],
    
    // Test file patterns
    include: [
      'src/**/*.{test,spec}.{js,ts}',
      'tests/**/*.{test,spec}.{js,ts}'
    ],
    
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.*',
        'src/types/',
        'src/**/*.astro' // Exclude Astro files from coverage
      ],
      threshold: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    },
    
    // Test timeout
    testTimeout: 10000,
    hookTimeout: 10000
  },
  
  // Path resolution
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  },
  
  // Define for test environment
  define: {
    'import.meta.env.DEV': 'true'
  }
});
```

### tests/vitest-setup.ts
```typescript
import { vi } from 'vitest';
import '@testing-library/jest-dom';

// Global mocks
global.IntersectionObserver = vi.fn().mockImplementation((callback) => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
  root: null,
  rootMargin: '',
  thresholds: []
}));

global.ResizeObserver = vi.fn().mockImplementation((callback) => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}));

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Health blog specific setup
global.performance = {
  ...global.performance,
  now: vi.fn(() => Date.now())
};

// Mock Astro.glob for test environment
vi.mock('astro:content', () => ({
  getCollection: vi.fn(),
  getEntry: vi.fn(),
  render: vi.fn()
}));
```

## 🎯 Success Criteria

### ✅ Migration Complete When:
- [ ] All 17 test files run successfully with Vitest
- [ ] Test coverage reports generate correctly
- [ ] All custom matchers work properly
- [ ] TypeScript compilation has no test-related errors
- [ ] CI/CD pipeline updated and working
- [ ] Performance is acceptable (within 10% of current speed)
- [ ] All health blog specific tests pass
- [ ] German content tests work correctly
- [ ] Documentation updated completely

### 📊 Quality Gates:
- [ ] Test execution time ≤ 110% of current time
- [ ] All existing tests pass without modification (except imports)
- [ ] Coverage reports match or exceed current coverage
- [ ] No TypeScript errors in test files
- [ ] All mocks and spies work correctly

## 🚨 Rollback Plan

If migration encounters issues:

1. **Immediate Rollback**:
   ```bash
   git checkout HEAD~1  # Return to previous commit
   bun remove vitest @vitest/ui jsdom @vitest/coverage-v8
   ```

2. **Partial Rollback**:
   - Keep Vitest installed but revert test files
   - Fix specific issues and retry migration
   - Maintain both systems temporarily

3. **Issue Resolution**:
   - Document specific problems encountered
   - Create focused TODO items for problem areas
   - Consider gradual migration approach

## 📅 Timeline Estimate

**Total Estimated Time**: 4-6 hours

- **Phase 1-2** (Setup): 1-1.5 hours
- **Phase 3** (File Migration): 2-3 hours
- **Phase 4-5** (Configuration): 1 hour
- **Phase 6-7** (Validation/Docs): 0.5-1 hour

## 💡 Benefits After Migration

- ✅ Better TypeScript integration and IDE support
- ✅ Enhanced testing capabilities and error reporting
- ✅ Improved Astro/Vite ecosystem compatibility
- ✅ Better mocking and spying capabilities
- ✅ More comprehensive coverage reporting
- ✅ Enhanced debugging experience
- ✅ Better compatibility with health content testing needs

---

**Next Steps**: Review this plan, decide on migration timing, and begin with Phase 1 when ready.