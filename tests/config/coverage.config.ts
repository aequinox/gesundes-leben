/**
 * @file coverage.config.ts
 * @description Shared coverage configuration for all Vitest environments
 * 
 * This file provides standardized coverage settings that can be imported
 * and customized for different test environments (unit, integration, component, health).
 */

import type { CoverageConfigDefaults } from 'vitest/config';

/**
 * Base coverage configuration shared across all environments
 */
export const baseCoverageConfig: Partial<CoverageConfigDefaults> = {
  provider: 'v8',
  reportOnFailure: true,
  all: true,
  skipFull: false,
  clean: true,
  cleanOnRerun: true,
  sourcemap: true,
  
  // Standard exclusions for all environments
  exclude: [
    'node_modules/**',
    'dist/**',
    'coverage/**',
    '.astro/**',
    'html/**',
    'public/**',
    '**/*.d.ts',
    '**/*.config.*',
    '**/*.test.{js,ts}',
    '**/*.spec.{js,ts}',
    '**/__tests__/**',
    'scripts/**'
  ]
};

/**
 * Environment-specific coverage configurations
 */
export const coverageConfigs = {
  /**
   * Unit test coverage - High standards for isolated utility functions
   */
  unit: {
    ...baseCoverageConfig,
    reporter: ['text', 'json', 'html', 'lcov'] as const,
    reportsDirectory: './coverage/unit',
    include: ['src/utils/**/*.{js,ts}'],
    exclude: [
      ...baseCoverageConfig.exclude!,
      'src/utils/**/*.integration.test.{js,ts}',
      'src/utils/**/*.component.test.{js,ts}',
      'src/utils/**/*.health.test.{js,ts}'
    ],
    thresholds: {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95
    },
    perFile: true,
    watermarks: {
      statements: [85, 95],
      functions: [85, 95],
      branches: [80, 95],
      lines: [85, 95]
    }
  },

  /**
   * Integration test coverage - Medium standards for module interactions
   */
  integration: {
    ...baseCoverageConfig,
    reporter: ['text', 'json', 'html'] as const,
    reportsDirectory: './coverage/integration',
    include: [
      'src/**/*.{js,ts}',
      '!src/**/*.d.ts',
      '!src/types/**'
    ],
    exclude: [
      ...baseCoverageConfig.exclude!,
      'src/config.ts',
      'src/**/*.unit.test.{js,ts}',
      'src/**/*.component.test.{js,ts}',
      'src/**/*.health.test.{js,ts}'
    ],
    thresholds: {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85
    },
    perFile: false,
    watermarks: {
      statements: [70, 90],
      functions: [70, 90],
      branches: [65, 85],
      lines: [70, 90]
    }
  },

  /**
   * Component test coverage - Focus on UI components and interactions
   */
  component: {
    ...baseCoverageConfig,
    reporter: ['text', 'html', 'json'] as const,
    reportsDirectory: './coverage/component',
    include: ['src/components/**/*.{js,ts,astro}'],
    exclude: [
      ...baseCoverageConfig.exclude!,
      'src/**/*.unit.test.{js,ts}',
      'src/**/*.integration.test.{js,ts}',
      'src/**/*.health.test.{js,ts}'
    ],
    thresholds: {
      branches: 75,
      functions: 80,
      lines: 80,
      statements: 80
    },
    perFile: true,
    watermarks: {
      statements: [65, 85],
      functions: [65, 85],
      branches: [60, 80],
      lines: [65, 85]
    }
  },

  /**
   * Health domain test coverage - High standards for health-related functionality
   */
  health: {
    ...baseCoverageConfig,
    reporter: ['text', 'json', 'html', 'lcov'] as const,
    reportsDirectory: './coverage/health',
    include: [
      'src/utils/**/*.{js,ts}',
      'src/data/**/*.{js,ts}',
      'src/content/**/*.{js,ts}'
    ],
    exclude: [
      ...baseCoverageConfig.exclude!,
      'src/data/references/*.json',
      'src/**/*.unit.test.{js,ts}',
      'src/**/*.integration.test.{js,ts}',
      'src/**/*.component.test.{js,ts}'
    ],
    thresholds: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    },
    perFile: true,
    watermarks: {
      statements: [80, 95],
      functions: [80, 95],
      branches: [75, 90],
      lines: [80, 95]
    }
  },

  /**
   * Default/comprehensive coverage - Balanced standards for overall project
   */
  default: {
    ...baseCoverageConfig,
    reporter: ['text', 'json', 'html', 'lcov', 'clover'] as const,
    reportsDirectory: './coverage',
    include: [
      'src/**/*.{js,ts}',
      '!src/**/*.d.ts',
      '!src/**/*.astro'
    ],
    exclude: [
      ...baseCoverageConfig.exclude!,
      'src/types/**'
    ],
    thresholds: {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85
    },
    perFile: true,
    watermarks: {
      statements: [70, 90],
      functions: [70, 90],
      branches: [65, 85],
      lines: [70, 90]
    },
    includeSource: ['src/**/*.{js,ts}']
  }
};

/**
 * Health blog specific coverage requirements
 * These are applied on top of base configurations for health-critical code
 */
export const healthCoverageRequirements = {
  // Files that handle nutrition calculations require 98%+ coverage
  nutritionFiles: {
    include: ['src/utils/nutrition*.{js,ts}'],
    thresholds: {
      branches: 98,
      functions: 98,
      lines: 98,
      statements: 98
    }
  },
  
  // Files that handle scientific references require 95%+ coverage
  referenceFiles: {
    include: ['src/utils/*reference*.{js,ts}', 'src/data/references/**/*.{js,ts}'],
    thresholds: {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95
    }
  },
  
  // German health terminology validation requires 92%+ coverage
  terminologyFiles: {
    include: ['src/utils/*german*.{js,ts}', 'src/utils/*health*.{js,ts}'],
    thresholds: {
      branches: 92,
      functions: 92,
      lines: 92,
      statements: 92
    }
  }
};

/**
 * Get coverage configuration for a specific environment
 * @param environment - The test environment (unit, integration, component, health, default)
 * @returns Coverage configuration object
 */
export function getCoverageConfig(environment: keyof typeof coverageConfigs) {
  const config = coverageConfigs[environment];
  
  if (!config) {
    throw new Error(`Unknown coverage environment: ${environment}`);
  }
  
  return config;
}

/**
 * Validate coverage thresholds for health-critical functionality
 * @param coverageData - Coverage data object
 * @param filePath - Path to the file being validated
 * @returns Validation result with any issues found
 */
export function validateHealthCriticalCoverage(
  coverageData: any, 
  filePath: string
): { isValid: boolean; issues: string[]; requirements?: any } {
  const issues: string[] = [];
  let requirements: any = null;
  
  // Check if file matches nutrition calculation patterns
  if (/nutrition|nährstoff|ernährung/i.test(filePath)) {
    requirements = healthCoverageRequirements.nutritionFiles;
    
    const { branches = 0, functions = 0, lines = 0, statements = 0 } = coverageData;
    
    if (statements < requirements.thresholds.statements) {
      issues.push(`Nutrition file ${filePath} has ${statements}% statement coverage, requires ${requirements.thresholds.statements}%`);
    }
    if (branches < requirements.thresholds.branches) {
      issues.push(`Nutrition file ${filePath} has ${branches}% branch coverage, requires ${requirements.thresholds.branches}%`);
    }
    if (functions < requirements.thresholds.functions) {
      issues.push(`Nutrition file ${filePath} has ${functions}% function coverage, requires ${requirements.thresholds.functions}%`);
    }
    if (lines < requirements.thresholds.lines) {
      issues.push(`Nutrition file ${filePath} has ${lines}% line coverage, requires ${requirements.thresholds.lines}%`);
    }
  }
  
  // Check if file matches reference validation patterns
  if (/reference|referenz|studie|wissenschaft/i.test(filePath)) {
    requirements = healthCoverageRequirements.referenceFiles;
    // Similar validation logic for references...
  }
  
  // Check if file matches German health terminology patterns
  if (/german|deutsch|terminolog|gesundheit/i.test(filePath)) {
    requirements = healthCoverageRequirements.terminologyFiles;
    // Similar validation logic for terminology...
  }
  
  return {
    isValid: issues.length === 0,
    issues,
    requirements
  };
}

export default coverageConfigs;