# Healthy Life Blog - Testing Suite

## Overview

Testing infrastructure for the Healthy Life German health blog using Vitest with custom health domain matchers and German health standards compliance.

## Architecture

### Directory Structure

```
tests/
├── README.md                    # This file
├── config/
│   └── coverage.config.ts      # Coverage configurations
├── mocks/
│   ├── browser-apis.ts         # Browser API mocks (localStorage, fetch, etc.)
│   └── astro-mocks.ts          # Astro framework mocks
├── setup/
│   └── unit-setup.ts           # Unit test environment setup
├── utils/
│   └── health-test-helpers.ts  # Health blog testing utilities
├── matchers/
│   └── health-matchers.ts      # Custom Vitest matchers for health testing
├── accessibility/
│   └── a11y-test.js            # Accessibility testing
├── performance/
│   ├── lighthouse-test.js      # Performance testing
│   └── run-tests.js            # Performance test runner
└── vitest-setup.ts            # Global test setup
```

## Test Locations

- **Unit Tests**: `src/utils/__tests__/` - Utility function tests
- **Component Tests**: `src/components/**/__tests__/` - Component tests
- **Shared Test Infrastructure**: `tests/` - Mocks, helpers, and configurations

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

### Test Utilities

```typescript
import { 
  HealthContentValidator,
  NutritionValidator, 
  ReferenceValidator
} from '@tests/utils/health-test-helpers';

const healthValidator = new HealthContentValidator();
const nutritionValidator = new NutritionValidator();
const referenceValidator = new ReferenceValidator();
```

## Running Tests

```bash
# Run all tests
bun run test

# Run tests with coverage
bun run test:coverage

# Run tests with UI
bun run test:ui

# Run performance tests
cd tests/performance && node run-tests.js

# Run accessibility tests
cd tests/accessibility && node a11y-test.js
```

## Test Writing Guidelines

### Health Content Testing Example

```typescript
describe('Health Content Validation', () => {
  it('should validate German health article', () => {
    const article = {
      title: 'Vitamin D und Immunsystem',
      body: 'Vitamin D ist wichtig für das Immunsystem...',
      categories: ['Ernährung', 'Gesundheit']
    };

    // Content validation
    expect(article.body).toContainValidGermanHealthTerms();
    expect(article.body).toHaveMedicalDisclaimer('required');
    expect(article.body).toFollowHealthBlogGuidelines();

    // Metadata validation  
    expect(article.title).toUseCorrectGermanMedicalTerms();
  });
});
```

## Health Blog Specific Testing Standards

This testing suite enforces specific standards for German health blog content:

- **Medical accuracy**: All health claims must be backed by credible references
- **German compliance**: Content must use German medical terminology and reference German institutions
- **Accessibility**: Health information must be accessible to all users
- **Readability**: Health content must maintain good readability scores
- **Legal compliance**: Medical disclaimers required for health claims

The testing environment ensures that the Healthy Life blog maintains the highest standards of quality, accuracy, and user experience while serving German-speaking audiences with reliable health information.