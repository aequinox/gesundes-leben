# Healthy Life Blog - Advanced Testing Suite

## Overview

This testing suite implements a comprehensive, world-class testing environment for the Healthy Life German health blog using Vitest with advanced multi-environment architecture, specialized health domain testing, and German health standards compliance.

## Architecture

### Multi-Environment Testing

The testing suite is organized into 5 distinct environments:

1. **Unit Tests** (`tests/unit/`) - Fast, isolated tests for utilities and pure functions
2. **Integration Tests** (`tests/integration/`) - Module interaction and data flow testing  
3. **Component Tests** (`tests/components/`) - UI component testing with DOM simulation
4. **Health Domain Tests** (`tests/health/`) - Health blog specific functionality with German standards
5. **Default/Legacy** - Backward compatibility for existing tests

### Directory Structure

```
tests/
├── README.md                    # This file
├── config/
│   └── coverage.config.ts      # Shared coverage configurations
├── mocks/
│   ├── browser-apis.ts         # Browser API mocks (localStorage, fetch, etc.)
│   └── astro-mocks.ts          # Astro framework mocks
├── setup/
│   └── unit-setup.ts           # Unit test environment setup
├── integration/
│   └── integration-setup.ts    # Integration test environment setup
├── components/
│   └── component-setup.ts      # Component test environment setup
├── health/
│   ├── health-setup.ts         # Health domain test environment setup
│   └── sample-health-domain.test.ts  # Example health domain tests
├── utils/
│   └── health-test-helpers.ts  # Health blog testing utilities
├── matchers/
│   └── health-matchers.ts      # Custom Vitest matchers for health testing
└── vitest-setup.ts            # Global test setup (legacy)
```

## Testing Environments

### 1. Unit Tests (Node.js Environment)

**Purpose**: Test pure functions, utilities, and isolated modules  
**Environment**: Node.js (no DOM)  
**Setup File**: `tests/setup/unit-setup.ts`  
**Coverage Target**: 95% (statements, functions, lines, branches)

```bash
# Run unit tests
bun run test:unit

# Run unit tests with coverage
bun run test:unit:coverage

# Watch mode
bun run test:unit:watch
```

**What to test here**:
- Utility functions (`src/utils/`)
- Data processing logic
- Pure calculation functions
- String/date/slug manipulations
- Validation functions

### 2. Integration Tests (Node.js Environment)

**Purpose**: Test module interactions and data flow  
**Environment**: Node.js with module mocks  
**Setup File**: `tests/integration/integration-setup.ts`  
**Coverage Target**: 85% (statements, functions, lines, branches)

```bash
# Run integration tests  
bun run test:integration

# Run with coverage
bun run test:integration:coverage
```

**What to test here**:
- API integrations
- File system operations
- Database interactions
- Content collection processing
- Multi-module workflows

### 3. Component Tests (Happy-DOM Environment)

**Purpose**: Test UI components and user interactions  
**Environment**: Happy-DOM (lightweight DOM simulation)  
**Setup File**: `tests/components/component-setup.ts`  
**Coverage Target**: 80% (statements, functions, lines), 75% (branches)

```bash
# Run component tests
bun run test:component

# Run with coverage  
bun run test:component:coverage
```

**What to test here**:
- Astro components
- UI interactions
- Accessibility features
- Responsive behavior
- Component props and slots

### 4. Health Domain Tests (Happy-DOM Environment)

**Purpose**: Test health blog specific functionality with German standards  
**Environment**: Happy-DOM with health domain mocks  
**Setup File**: `tests/health/health-setup.ts`  
**Coverage Target**: 90% (statements, functions, lines, branches)

```bash
# Run health domain tests
bun run test:health

# Run with coverage
bun run test:health:coverage
```

**What to test here**:
- German health terminology validation
- DGE nutrition standard compliance
- Scientific reference credibility
- Medical disclaimer presence
- Health content accessibility
- Cultural appropriateness for German audience

## Custom Health Matchers

The testing suite includes custom Vitest matchers specifically designed for health blog testing:

### Health Content Matchers
```typescript
expect(content).toContainValidGermanHealthTerms();
expect(content).toHaveMedicalDisclaimer('required');
expect(content).toHaveGoodReadability(6);
expect(content).toFollowHealthBlogGuidelines();
```

### Nutrition Data Matchers  
```typescript
expect(nutritionData).toComplyWithDGEStandards(context);
expect(nutritionData).toHaveBalancedMacronutrients();
expect(nutritionData).toHaveAccurateCalorieCalculation();
expect(nutritionData).toBeRealisticNutritionData();
```

### Scientific Reference Matchers
```typescript
expect(reference).toBeCredibleReference();
expect(reference).toBeRecentAndRelevant(10);
expect(reference).toHaveProperScientificFormat();
expect(reference).toSupportHealthClaims(claims);
```

### German Health Standards Matchers
```typescript
expect(content).toUseCorrectGermanMedicalTerms();
expect(content).toReferenceGermanHealthInstitutions();
expect(content).toUseGermanHealthStandards();
expect(content).toBeCulturallyAppropriateForGermany();
```

### Accessibility Matchers
```typescript
expect(element).toBeAccessibleHealthContent();
expect(element).toHighlightHealthWarnings();
expect(element).toHaveWellStructuredHealthInfo();
expect(element).toPresentHealthDataClearly();
```

## Health Domain Testing Features

### German Health Standards Validation

The testing suite validates compliance with German health standards:

- **DGE (Deutsche Gesellschaft für Ernährung)** nutrition guidelines
- **German medical terminology** usage
- **Cultural appropriateness** for German healthcare system
- **Reference to German institutions** (RKI, BfR, BZgA)

### Nutrition Data Validation

Advanced nutrition validation with DGE compliance:

```typescript
import { NutritionValidator } from '@tests/utils/health-test-helpers';

const validator = new NutritionValidator();
const testData = validator.generateTestNutritionData({
  age: 30,
  gender: 'female',
  activityLevel: 'moderate',
  bodyWeight: 65
}, 'balanced');

expect(testData).toComplyWithDGEStandards({
  age: 30,
  gender: 'female', 
  bodyWeight: 65
});
```

### Scientific Reference Quality Assessment

Automated credibility scoring for health references:

```typescript
import { ReferenceValidator } from '@tests/utils/health-test-helpers';

const validator = new ReferenceValidator();
const reference = validator.generateMockReference('high-quality', 'nutrition');

expect(reference).toBeCredibleReference();
expect(reference).toSupportHealthClaims(['nutrition', 'health', 'vitamins']);
```

## Running Tests

### Individual Environment Tests

```bash
# Unit tests only
bun run test:unit

# Integration tests only  
bun run test:integration

# Component tests only
bun run test:component

# Health domain tests only
bun run test:health
```

### Combined Test Execution

```bash
# Run all environments
bun run test:all

# Run all with coverage
bun run test:coverage:all

# Run default/legacy tests
bun run test
```

### Coverage Reporting

```bash
# Generate coverage for all environments
bun run test:coverage:all

# Merge coverage reports
bun run test:coverage:merge

# Open coverage report
bun run test:coverage:report

# CI-friendly coverage
bun run test:coverage:ci
```

## Test Writing Guidelines

### 1. Choose the Right Environment

- **Unit tests**: Pure functions, no external dependencies
- **Integration tests**: Module interactions, file operations
- **Component tests**: UI components, DOM interactions  
- **Health tests**: Health domain logic, German standards

### 2. Use Appropriate Helpers

```typescript
// For health content testing
import { 
  HealthContentValidator,
  NutritionValidator, 
  ReferenceValidator,
  createTestHealthPost
} from '@tests/utils/health-test-helpers';

// For component testing
import { 
  mockAstroRuntime,
  componentTestHelpers 
} from '@tests/components/component-setup';

// For browser API mocking
import { setupBrowserMocks } from '@tests/mocks/browser-apis';
```

### 3. Follow Naming Conventions

- **Unit tests**: `*.unit.test.ts` or in `src/utils/__tests__/`
- **Integration tests**: `*.integration.test.ts` 
- **Component tests**: `*.component.test.ts`
- **Health tests**: `*.health.test.ts`

### 4. Health Content Testing Example

```typescript
describe('Health Content Validation', () => {
  it('should validate German health article', () => {
    const article = createTestHealthPost({
      title: 'Vitamin D und Immunsystem',
      categories: ['Ernährung', 'Gesundheit']
    });

    // Content validation
    expect(article.body).toContainValidGermanHealthTerms();
    expect(article.body).toHaveMedicalDisclaimer('required');
    expect(article.body).toFollowHealthBlogGuidelines();

    // Metadata validation  
    expect(article.data.title).toUseCorrectGermanMedicalTerms();
    expect(article.data).toReferenceGermanHealthInstitutions();
  });
});
```

## Performance Optimization

The testing suite is optimized for performance:

- **Thread-based parallelization** with environment-specific thread limits
- **Separate coverage reporting** per environment to avoid interference
- **Selective test execution** to run only relevant test suites
- **Advanced mocking** to reduce external dependencies
- **Memory management** with proper cleanup between tests

### Thread Configuration

- **Unit tests**: 80% of available threads (CPU intensive)
- **Integration tests**: Single threaded (I/O intensive) 
- **Component tests**: Maximum 4 threads (DOM operations)
- **Health tests**: Maximum 2 threads (complex validations)

## Continuous Integration

The testing suite supports CI environments:

```bash
# CI-optimized test execution
NODE_ENV=test bun run test:coverage:ci

# Parallel execution in CI
bun run test:all --reporter=github-actions --reporter=json
```

Environment variables:
- `CI=true`: Enables CI-specific optimizations
- `NODE_ENV=test`: Test environment configuration  
- `COVERAGE_THRESHOLD=85`: Minimum coverage threshold

## Migration from Existing Tests

Existing tests are automatically supported through the default environment. To migrate:

1. **Identify test type** (unit, integration, component, health)
2. **Move to appropriate directory** 
3. **Add environment-specific filename suffix**
4. **Update imports** to use new helpers
5. **Add health-specific assertions** where applicable

## Troubleshooting

### Common Issues

1. **Path resolution errors**: Ensure `@` alias is configured correctly
2. **Mock conflicts**: Check setup file order and cleanup
3. **Coverage discrepancies**: Verify include/exclude patterns
4. **Health matcher errors**: Import custom matchers in setup files

### Debug Commands

```bash
# Verbose test output
bun run test --reporter=verbose

# Test specific file
bun run test tests/health/sample-health-domain.test.ts

# Debug with UI
bun run test:ui
```

## Contributing

When adding new tests:

1. **Choose appropriate environment** based on test scope
2. **Use existing helpers** and matchers when possible
3. **Add health domain validation** for health-related tests
4. **Ensure German standards compliance** for content tests
5. **Update coverage thresholds** if needed
6. **Document new testing patterns** in this README

## Health Blog Specific Testing Standards

This testing suite enforces specific standards for German health blog content:

- **Medical accuracy**: All health claims must be backed by credible references
- **German compliance**: Content must use German medical terminology and reference German institutions
- **Accessibility**: Health information must be accessible to all users
- **Readability**: Health content must maintain good readability scores
- **Legal compliance**: Medical disclaimers required for health claims

The advanced testing environment ensures that the Healthy Life blog maintains the highest standards of quality, accuracy, and user experience while serving German-speaking audiences with reliable health information.