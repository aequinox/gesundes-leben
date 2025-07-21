/**
 * @file health-matchers.ts
 * @description Custom Vitest matchers for health blog testing
 * 
 * Provides domain-specific matchers for testing health content,
 * nutrition data, German terminology, and scientific references.
 */

import { expect } from 'vitest';

import {
  HealthContentValidator,
  NutritionValidator,
  ReferenceValidator
} from '../utils/health-test-helpers.js';

// Initialize validators
const healthValidator = new HealthContentValidator();
const nutritionValidator = new NutritionValidator();
const referenceValidator = new ReferenceValidator();

// =============================================================================
// Health Content Matchers
// =============================================================================

interface HealthContentMatchers<R = unknown> {
  /**
   * Assert that content contains valid German health terminology
   */
  toContainValidGermanHealthTerms(): R;
  
  /**
   * Assert that content has appropriate medical disclaimer
   */
  toHaveMedicalDisclaimer(severity?: 'required' | 'recommended' | 'optional'): R;
  
  /**
   * Assert that content has good readability for health information
   */
  toHaveGoodReadability(minScore?: number): R;
  
  /**
   * Assert that content follows health blog content guidelines
   */
  toFollowHealthBlogGuidelines(): R;
}

// =============================================================================
// Nutrition Data Matchers
// =============================================================================

interface NutritionMatchers<R = unknown> {
  /**
   * Assert that nutrition data complies with DGE standards
   */
  toComplyWithDGEStandards(context?: any): R;
  
  /**
   * Assert that macronutrient ratios are balanced
   */
  toHaveBalancedMacronutrients(): R;
  
  /**
   * Assert that calorie calculation is accurate
   */
  toHaveAccurateCalorieCalculation(tolerance?: number): R;
  
  /**
   * Assert that nutrition data is realistic
   */
  toBeRealisticNutritionData(): R;
}

// =============================================================================
// Reference Quality Matchers
// =============================================================================

interface ReferenceMatchers<R = unknown> {
  /**
   * Assert that reference is credible and high-quality
   */
  toBeCredibleReference(): R;
  
  /**
   * Assert that reference is recent and relevant
   */
  toBeRecentAndRelevant(maxYearsOld?: number): R;
  
  /**
   * Assert that reference has proper scientific formatting
   */
  toHaveProperScientificFormat(): R;
  
  /**
   * Assert that reference supports health claims
   */
  toSupportHealthClaims(claims: string[]): R;
}

// =============================================================================
// German Health Blog Specific Matchers
// =============================================================================

interface GermanHealthMatchers<R = unknown> {
  /**
   * Assert that content uses appropriate German medical terminology
   */
  toUseCorrectGermanMedicalTerms(): R;
  
  /**
   * Assert that content references German health institutions (DGE, RKI, etc.)
   */
  toReferenceGermanHealthInstitutions(): R;
  
  /**
   * Assert that measurements use German/European standards
   */
  toUseGermanHealthStandards(): R;
  
  /**
   * Assert that content is culturally appropriate for German audience
   */
  toBeCulturallyAppropriateForGermany(): R;
}

// =============================================================================
// Accessibility & User Experience Matchers
// =============================================================================

interface HealthAccessibilityMatchers<R = unknown> {
  /**
   * Assert that health content is accessible to all users
   */
  toBeAccessibleHealthContent(): R;
  
  /**
   * Assert that health warnings are properly highlighted
   */
  toHighlightHealthWarnings(): R;
  
  /**
   * Assert that complex health information is well-structured
   */
  toHaveWellStructuredHealthInfo(): R;
  
  /**
   * Assert that health data is presented clearly
   */
  toPresentHealthDataClearly(): R;
}

// =============================================================================
// Matcher Implementations
// =============================================================================

const healthContentMatchers = {
  toContainValidGermanHealthTerms(received: string) {
    const content = received;
    const result = healthValidator.validateGermanTerminology(content);
    
    return {
      pass: result.isValid && result.foundTerms.length >= 2,
      message: () => result.isValid 
        ? `Content contains valid German health terms: ${result.foundTerms.join(', ')}`
        : `Content lacks sufficient German health terminology. Found: ${result.foundTerms.join(', ')}. Suggestions: ${result.suggestions.join(', ')}`
    };
  },

  toHaveMedicalDisclaimer(received: string, severity = 'recommended') {
    const content = received;
    const result = healthValidator.validateMedicalDisclaimer(content);
    
    const shouldHaveDisclaimer = severity === 'required' || 
      (severity === 'recommended' && result.severity !== 'optional');
    
    return {
      pass: !shouldHaveDisclaimer || result.hasDisclaimer,
      message: () => result.hasDisclaimer
        ? `Content has appropriate medical disclaimer: ${result.matchedPatterns.join(', ')}`
        : `Content missing required medical disclaimer (severity: ${result.severity})`
    };
  },

  toHaveGoodReadability(received: string, minScore = 6) {
    const content = received;
    const result = healthValidator.validateReadability(content);
    
    return {
      pass: result.score >= minScore,
      message: () => result.score >= minScore
        ? `Content has good readability (score: ${result.score}/10, level: ${result.level})`
        : `Content readability below threshold (score: ${result.score}/10, level: ${result.level}). Suggestions: ${result.suggestions.join(', ')}`
    };
  },

  toFollowHealthBlogGuidelines(received: string) {
    const content = received;
    
    const terminologyResult = healthValidator.validateGermanTerminology(content);
    const disclaimerResult = healthValidator.validateMedicalDisclaimer(content);
    const readabilityResult = healthValidator.validateReadability(content);
    
    const issues: string[] = [];
    
    if (!terminologyResult.isValid) {
      issues.push('Insufficient German health terminology');
    }
    
    if (disclaimerResult.severity === 'required' && !disclaimerResult.hasDisclaimer) {
      issues.push('Missing required medical disclaimer');
    }
    
    if (readabilityResult.score < 6) {
      issues.push('Poor readability for health content');
    }
    
    return {
      pass: issues.length === 0,
      message: () => issues.length === 0
        ? 'Content follows all health blog guidelines'
        : `Content guideline violations: ${issues.join(', ')}`
    };
  }
};

const nutritionMatchers: NutritionMatchers = {
  toComplyWithDGEStandards(context = {}) {
    const nutritionData = this.actual;
    const result = nutritionValidator.validateNutritionData(nutritionData, context);
    
    return {
      pass: result.isValid,
      message: () => result.isValid
        ? `Nutrition data complies with DGE standards (compliance: ${(result.dgeCompliance * 100).toFixed(1)}%)`
        : `DGE standard violations: ${result.violations.join(', ')}`
    };
  },

  toHaveBalancedMacronutrients() {
    const data = this.actual;
    
    // Calculate macronutrient percentages
    const proteinCals = data.protein * 4;
    const carbCals = data.carbs * 4;
    const fatCals = data.fat * 9;
    const totalCals = proteinCals + carbCals + fatCals;
    
    const carbPercentage = (carbCals / totalCals) * 100;
    const fatPercentage = (fatCals / totalCals) * 100;
    const proteinPercentage = (proteinCals / totalCals) * 100;
    
    const isBalanced = 
      carbPercentage >= 45 && carbPercentage <= 65 &&
      fatPercentage >= 20 && fatPercentage <= 35 &&
      proteinPercentage >= 10 && proteinPercentage <= 35;
    
    return {
      pass: isBalanced,
      message: () => isBalanced
        ? `Macronutrients are well balanced (P: ${proteinPercentage.toFixed(1)}%, C: ${carbPercentage.toFixed(1)}%, F: ${fatPercentage.toFixed(1)}%)`
        : `Macronutrients are imbalanced (P: ${proteinPercentage.toFixed(1)}%, C: ${carbPercentage.toFixed(1)}%, F: ${fatPercentage.toFixed(1)}%)`
    };
  },

  toHaveAccurateCalorieCalculation(tolerance = 0.05) {
    const data = this.actual;
    
    const proteinCals = data.protein * 4;
    const carbCals = data.carbs * 4;
    const fatCals = data.fat * 9;
    const calculatedCals = proteinCals + carbCals + fatCals;
    
    const difference = Math.abs(calculatedCals - data.calories);
    const percentDiff = difference / data.calories;
    
    return {
      pass: percentDiff <= tolerance,
      message: () => percentDiff <= tolerance
        ? `Calorie calculation is accurate (difference: ${difference.toFixed(1)} kcal, ${(percentDiff * 100).toFixed(1)}%)`
        : `Calorie calculation is inaccurate (difference: ${difference.toFixed(1)} kcal, ${(percentDiff * 100).toFixed(1)}%)`
    };
  },

  toBeRealisticNutritionData() {
    const data = this.actual;
    const issues: string[] = [];
    
    // Check for realistic ranges
    if (data.calories < 800 || data.calories > 5000) {
      issues.push(`Unrealistic calorie count: ${data.calories}`);
    }
    
    if (data.protein < 10 || data.protein > 300) {
      issues.push(`Unrealistic protein amount: ${data.protein}g`);
    }
    
    if (data.carbs < 20 || data.carbs > 500) {
      issues.push(`Unrealistic carbohydrate amount: ${data.carbs}g`);
    }
    
    if (data.fat < 10 || data.fat > 200) {
      issues.push(`Unrealistic fat amount: ${data.fat}g`);
    }
    
    return {
      pass: issues.length === 0,
      message: () => issues.length === 0
        ? 'Nutrition data appears realistic'
        : `Unrealistic nutrition values: ${issues.join(', ')}`
    };
  }
};

const referenceMatchers: ReferenceMatchers = {
  toBeCredibleReference() {
    const reference = this.actual;
    const result = referenceValidator.validateReference(reference);
    
    return {
      pass: result.isCredible,
      message: () => result.isCredible
        ? `Reference is credible (score: ${(result.credibilityScore * 100).toFixed(1)}%). Strengths: ${result.strengths.join(', ')}`
        : `Reference lacks credibility (score: ${(result.credibilityScore * 100).toFixed(1)}%). Issues: ${result.issues.join(', ')}`
    };
  },

  toBeRecentAndRelevant(maxYearsOld = 10) {
    const reference = this.actual;
    const currentYear = new Date().getFullYear();
    const age = currentYear - reference.year;
    
    return {
      pass: age <= maxYearsOld,
      message: () => age <= maxYearsOld
        ? `Reference is recent (${age} years old)`
        : `Reference is outdated (${age} years old, max allowed: ${maxYearsOld})`
    };
  },

  toHaveProperScientificFormat() {
    const reference = this.actual;
    const issues: string[] = [];
    
    if (!reference.title || reference.title.length < 10) {
      issues.push('Missing or too short title');
    }
    
    if (!reference.authors || reference.authors.length === 0) {
      issues.push('No authors specified');
    }
    
    if (!reference.year || reference.year < 1900 || reference.year > new Date().getFullYear()) {
      issues.push('Invalid publication year');
    }
    
    if (reference.type === 'journal' && !reference.journal) {
      issues.push('Journal article missing journal name');
    }
    
    return {
      pass: issues.length === 0,
      message: () => issues.length === 0
        ? 'Reference has proper scientific formatting'
        : `Reference formatting issues: ${issues.join(', ')}`
    };
  },

  toSupportHealthClaims(claims: string[]) {
    const reference = this.actual;
    const title = reference.title.toLowerCase();
    const abstract = reference.abstract?.toLowerCase() || '';
    
    const supportedClaims = claims.filter(claim => 
      title.includes(claim.toLowerCase()) || 
      abstract.includes(claim.toLowerCase())
    );
    
    return {
      pass: supportedClaims.length >= claims.length * 0.5, // At least 50% of claims should be supported
      message: () => supportedClaims.length >= claims.length * 0.5
        ? `Reference supports health claims: ${supportedClaims.join(', ')}`
        : `Reference doesn't adequately support claims. Supported: ${supportedClaims.join(', ')}, Missing: ${claims.filter(c => !supportedClaims.includes(c)).join(', ')}`
    };
  }
};

const germanHealthMatchers: GermanHealthMatchers = {
  toUseCorrectGermanMedicalTerms() {
    const content = this.actual as string;
    
    // Check for common English terms that should be in German
    const englishTerms = ['nutrition', 'vitamin', 'mineral', 'protein', 'carbohydrate'];
    const foundEnglishTerms = englishTerms.filter(term => 
      content.toLowerCase().includes(term)
    );
    
    // Check for proper German terms
    const germanTerms = ['Ernährung', 'Vitamin', 'Mineralstoffe', 'Eiweiß', 'Kohlenhydrate'];
    const foundGermanTerms = germanTerms.filter(term => 
      content.includes(term)
    );
    
    return {
      pass: foundEnglishTerms.length === 0 && foundGermanTerms.length > 0,
      message: () => foundEnglishTerms.length === 0 && foundGermanTerms.length > 0
        ? `Content uses correct German medical terms: ${foundGermanTerms.join(', ')}`
        : `Content should use German medical terms. English terms found: ${foundEnglishTerms.join(', ')}`
    };
  },

  toReferenceGermanHealthInstitutions() {
    const content = this.actual as string;
    
    const germanInstitutions = [
      'DGE', 'Deutsche Gesellschaft für Ernährung',
      'Robert Koch-Institut', 'RKI',
      'Bundesinstitut für Risikobewertung', 'BfR',
      'Bundeszentrale für gesundheitliche Aufklärung', 'BZgA'
    ];
    
    const foundInstitutions = germanInstitutions.filter(institution => 
      content.includes(institution)
    );
    
    return {
      pass: foundInstitutions.length > 0,
      message: () => foundInstitutions.length > 0
        ? `Content references German health institutions: ${foundInstitutions.join(', ')}`
        : 'Content should reference German health institutions (DGE, RKI, etc.)'
    };
  },

  toUseGermanHealthStandards() {
    const content = this.actual as string;
    
    // Check for German/European measurement standards
    const hasGermanStandards = 
      content.includes('DGE') ||
      content.includes('D-A-CH') ||
      content.includes('Referenzwerte') ||
      content.includes('mg/Tag') ||
      content.includes('µg/Tag');
    
    // Check for non-German standards that should be avoided
    const hasNonGermanStandards = 
      content.includes('USDA') ||
      content.includes('FDA') ||
      content.includes('oz') ||
      content.includes('lbs');
    
    return {
      pass: hasGermanStandards && !hasNonGermanStandards,
      message: () => hasGermanStandards && !hasNonGermanStandards
        ? 'Content uses appropriate German health standards'
        : 'Content should use German/European health standards (DGE, D-A-CH) instead of US standards'
    };
  },

  toBeCulturallyAppropriateForGermany() {
    const content = this.actual as string;
    
    const culturalMarkers = {
      positive: ['Deutschland', 'Europa', 'Krankenversicherung', 'Hausarzt', 'Apotheke'],
      negative: ['copay', 'insurance', 'doctor visit fee', 'prescription cost']
    };
    
    const positiveFound = culturalMarkers.positive.some(marker => 
      content.toLowerCase().includes(marker.toLowerCase())
    );
    
    const negativeFound = culturalMarkers.negative.some(marker => 
      content.toLowerCase().includes(marker.toLowerCase())
    );
    
    return {
      pass: positiveFound || !negativeFound,
      message: () => positiveFound || !negativeFound
        ? 'Content is culturally appropriate for German audience'
        : 'Content contains elements not relevant to German healthcare system'
    };
  }
};

const accessibilityMatchers: HealthAccessibilityMatchers = {
  toBeAccessibleHealthContent() {
    const element = this.actual as Element;
    const issues: string[] = [];
    
    // Check for proper heading structure
    const headings = element.querySelectorAll('h1, h2, h3, h4, h5, h6');
    if (headings.length === 0) {
      issues.push('No headings found - content lacks structure');
    }
    
    // Check for alt text on images
    const images = element.querySelectorAll('img');
    images.forEach((img, index) => {
      if (!img.getAttribute('alt')) {
        issues.push(`Image ${index + 1} missing alt text`);
      }
    });
    
    // Check for proper labeling of health data
    const healthData = element.querySelectorAll('[data-health-info]');
    healthData.forEach((data, index) => {
      if (!data.getAttribute('aria-label') && !data.getAttribute('aria-labelledby')) {
        issues.push(`Health data ${index + 1} missing accessibility label`);
      }
    });
    
    return {
      pass: issues.length === 0,
      message: () => issues.length === 0
        ? 'Health content is accessible'
        : `Accessibility issues: ${issues.join(', ')}`
    };
  },

  toHighlightHealthWarnings() {
    const element = this.actual as Element;
    
    const warnings = element.querySelectorAll('.warning, .alert, .caution, [data-warning]');
    const hasProperHighlighting = Array.from(warnings).every(warning => {
      const styles = window.getComputedStyle(warning);
      const hasVisualIndicator = 
        styles.backgroundColor !== 'rgba(0, 0, 0, 0)' ||
        styles.border !== 'none' ||
        styles.color !== 'rgba(0, 0, 0, 0)';
      
      const hasAriaRole = 
        warning.getAttribute('role') === 'alert' ||
        warning.getAttribute('aria-live') === 'polite';
      
      return hasVisualIndicator || hasAriaRole;
    });
    
    return {
      pass: warnings.length === 0 || hasProperHighlighting,
      message: () => warnings.length === 0
        ? 'No health warnings to highlight'
        : hasProperHighlighting
        ? `Health warnings are properly highlighted (${warnings.length} warnings)`
        : `Health warnings lack proper visual/accessibility indicators (${warnings.length} warnings)`
    };
  },

  toHaveWellStructuredHealthInfo() {
    const element = this.actual as Element;
    const issues: string[] = [];
    
    // Check for logical heading hierarchy
    const headings = element.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let previousLevel = 0;
    
    headings.forEach((heading, index) => {
      const level = parseInt(heading.tagName[1]);
      if (level > previousLevel + 1) {
        issues.push(`Heading hierarchy skip at heading ${index + 1}: ${heading.tagName} after h${previousLevel}`);
      }
      previousLevel = level;
    });
    
    // Check for lists in health information
    const lists = element.querySelectorAll('ul, ol');
    const hasLists = lists.length > 0;
    
    // Check for health data organization
    const healthSections = element.querySelectorAll('[data-health-section], .health-info, .nutrition-facts');
    const hasOrganizedHealthData = healthSections.length > 0;
    
    if (!hasLists && !hasOrganizedHealthData) {
      issues.push('Health information lacks structured organization (no lists or organized sections)');
    }
    
    return {
      pass: issues.length === 0,
      message: () => issues.length === 0
        ? 'Health information is well structured'
        : `Structure issues: ${issues.join(', ')}`
    };
  },

  toPresentHealthDataClearly() {
    const element = this.actual as Element;
    const issues: string[] = [];
    
    // Check for clear data presentation
    const tables = element.querySelectorAll('table');
    tables.forEach((table, index) => {
      if (!table.querySelector('thead, th')) {
        issues.push(`Table ${index + 1} missing headers`);
      }
      
      if (!table.getAttribute('summary') && !table.querySelector('caption')) {
        issues.push(`Table ${index + 1} missing description`);
      }
    });
    
    // Check for units in numerical data
    const numberPattern = /\d+(?:\.\d+)?/g;
    const textContent = element.textContent || '';
    const numbers = textContent.match(numberPattern);
    
    if (numbers && numbers.length > 3) {
      // Check if units are present near numbers
      const hasUnits = /\d+(?:\.\d+)?\s*(?:g|mg|µg|kcal|kJ|ml|l|%)/g.test(textContent);
      if (!hasUnits) {
        issues.push('Numerical health data missing units');
      }
    }
    
    return {
      pass: issues.length === 0,
      message: () => issues.length === 0
        ? 'Health data is presented clearly'
        : `Clarity issues: ${issues.join(', ')}`
    };
  }
};

// =============================================================================
// Extend Vitest Matchers
// =============================================================================

declare module 'vitest' {
  interface Assertion<T = any> extends 
    HealthContentMatchers<T>,
    NutritionMatchers<T>, 
    ReferenceMatchers<T>,
    GermanHealthMatchers<T>,
    HealthAccessibilityMatchers<T> {}
  
  interface AsymmetricMatchersContaining extends 
    HealthContentMatchers,
    NutritionMatchers,
    ReferenceMatchers, 
    GermanHealthMatchers,
    HealthAccessibilityMatchers {}
}

// Register all matchers with Vitest
expect.extend({
  ...healthContentMatchers,
  ...nutritionMatchers,
  ...referenceMatchers,
  ...germanHealthMatchers,
  ...accessibilityMatchers
});

// Export for manual usage if needed
export {
  healthContentMatchers,
  nutritionMatchers,
  referenceMatchers,
  germanHealthMatchers,
  accessibilityMatchers
};