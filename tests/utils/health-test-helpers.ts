/**
 * Health test helper classes for German health blog validation
 */

export class HealthContentValidator {
  validateGermanHealthTerms(content: string): { isValid: boolean; foundTerms: string[]; suggestions: string[] } {
    // Basic validation for German health terminology
    const healthTerms = [
      'Gesundheit',
      'Ernährung',
      'Vitamin',
      'Mineral',
      'Nährstoff',
      'Immunsystem',
      'Wellness'
    ];
    
    const foundTerms = healthTerms.filter(term => 
      content.toLowerCase().includes(term.toLowerCase())
    );
    
    return {
      isValid: foundTerms.length > 0,
      foundTerms,
      suggestions: foundTerms.length === 0 ? ['Gesundheit', 'Ernährung'] : []
    };
  }

  validateGermanTerminology(content: string): { isValid: boolean; foundTerms: string[]; suggestions: string[] } {
    return this.validateGermanHealthTerms(content);
  }

  validateMedicalDisclaimer(content: string): { hasDisclaimer: boolean; severity: string; matchedPatterns: string[] } {
    const disclaimerPatterns = [
      'hinweis',
      'disclaimer', 
      'arzt',
      'medizinisch',
      'beratung',
      'therapeut'
    ];
    
    const matchedPatterns = disclaimerPatterns.filter(pattern =>
      content.toLowerCase().includes(pattern)
    );
    
    return {
      hasDisclaimer: matchedPatterns.length > 0,
      severity: matchedPatterns.length > 2 ? 'required' : 'recommended',
      matchedPatterns
    };
  }

  validateReadability(content: string): { score: number; level: string; suggestions: string[] } {
    // Simple readability assessment
    const words = content.split(/\s+/).length;
    const sentences = content.split(/[.!?]+/).length;
    const avgWordsPerSentence = sentences > 0 ? words / sentences : 0;
    
    let score = 10;
    if (avgWordsPerSentence > 20) {score -= 2;}
    if (avgWordsPerSentence > 30) {score -= 3;}
    
    const suggestions = [];
    if (avgWordsPerSentence > 25) {suggestions.push('Kürzere Sätze verwenden');}
    if (words < 100) {suggestions.push('Mehr Details hinzufügen');}
    
    return {
      score: Math.max(0, score),
      level: score > 8 ? 'easy' : score > 6 ? 'medium' : 'difficult',
      suggestions
    };
  }

  hasValidMedicalDisclaimer(content: string): boolean {
    const disclaimerPatterns = [
      'hinweis',
      'disclaimer',
      'arzt',
      'medizinisch',
      'beratung',
      'therapeut'
    ];
    
    return disclaimerPatterns.some(pattern =>
      content.toLowerCase().includes(pattern)
    );
  }

  checkReadability(content: string): { score: number; level: string } {
    // Simple readability assessment
    const words = content.split(/\s+/).length;
    const sentences = content.split(/[.!?]+/).length;
    const avgWordsPerSentence = words / sentences;
    
    let score = 100;
    if (avgWordsPerSentence > 20) {score -= 20;}
    if (avgWordsPerSentence > 30) {score -= 30;}
    
    return {
      score,
      level: score > 80 ? 'easy' : score > 60 ? 'medium' : 'difficult'
    };
  }
}

export class NutritionValidator {
  validateNutritionData(data: any, _context: any = {}): { isValid: boolean; dgeCompliance: number; violations: string[] } {
    // Basic nutrition data validation
    if (!data || typeof data !== 'object') {
      return { isValid: false, dgeCompliance: 0, violations: ['Invalid data format'] };
    }
    
    const requiredFields = ['name', 'amount', 'unit'];
    const violations = [];
    const missingFields = requiredFields.filter(field => !(field in data));
    
    if (missingFields.length > 0) {
      violations.push(`Missing fields: ${missingFields.join(', ')}`);
    }
    
    const dgeCompliance = missingFields.length === 0 ? 1.0 : 0.5;
    
    return {
      isValid: violations.length === 0,
      dgeCompliance,
      violations
    };
  }

  validateNutritionRecommendations(data: any): boolean {
    // Validate nutrition recommendations
    if (!data || !Array.isArray(data)) {return false;}
    
    return data.every(item => 
      item.nutrient && 
      typeof item.amount === 'number' && 
      item.unit
    );
  }

  validateDietaryGuidelines(content: string): boolean {
    // Validate dietary guidelines content
    const guidelines = [
      'dge',
      'empfehlung',
      'richtlinie',
      'ernährung',
      'lebensmittel'
    ];
    
    return guidelines.some(guideline =>
      content.toLowerCase().includes(guideline)
    );
  }

  validateSupplementInfo(data: any): boolean {
    // Validate supplement information
    return Boolean(data?.name && data?.dosage && data?.frequency);
  }
}

export class ReferenceValidator {
  validateReference(reference: any): { isCredible: boolean; credibilityScore: number; strengths: string[]; issues: string[] } {
    // Basic reference validation
    if (!reference || typeof reference !== 'object') {
      return { isCredible: false, credibilityScore: 0, strengths: [], issues: ['Invalid reference format'] };
    }
    
    const strengths: string[] = [];
    const issues: string[] = [];
    let score = 0;
    
    if (reference.title && reference.title.length > 10) {
      strengths.push('Has descriptive title');
      score += 0.2;
    } else {
      issues.push('Missing or inadequate title');
    }
    
    if (reference.url || reference.doi) {
      strengths.push('Has accessible link');
      score += 0.3;
    } else {
      issues.push('Missing URL or DOI');
    }
    
    if (reference.authors && Array.isArray(reference.authors) && reference.authors.length > 0) {
      strengths.push('Has author information');
      score += 0.2;
    } else {
      issues.push('Missing author information');
    }
    
    if (reference.year && reference.year > 2010) {
      strengths.push('Recent publication');
      score += 0.3;
    } else if (reference.year && reference.year > 2000) {
      score += 0.1;
    } else {
      issues.push('Missing or outdated publication year');
    }
    
    return {
      isCredible: score >= 0.6,
      credibilityScore: score,
      strengths,
      issues
    };
  }

  validateGermanHealthInstitution(reference: any): boolean {
    // Validate German health institution references
    const germanInstitutions = [
      'rki',
      'bfr',
      'dge',
      'bvl',
      'pei',
      'bfarm'
    ];
    
    if (!reference?.url) {return false;}
    
    return germanInstitutions.some(institution =>
      reference.url.toLowerCase().includes(institution)
    );
  }

  validateAcademicReference(reference: any): boolean {
    // Validate academic reference format
    return Boolean(reference?.authors &&
      reference?.title &&
      reference?.year &&
      (reference?.journal || reference?.doi));
  }

  validateReferenceAccessibility(reference: any): boolean {
    // Check if reference is accessible
    return Boolean(reference?.url && !reference?.paywall);
  }
}