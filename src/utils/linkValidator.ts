/**
 * Link validation utility for references
 * Validates URLs, DOIs, and other identifiers
 */

// import { logger } from "@/utils/logger"; // Unused in current implementation

export interface ValidationResult {
  url: string;
  valid: boolean;
  status?: number;
  error?: string;
  redirectUrl?: string;
  contentType?: string;
  responseTime?: number;
}

export interface ValidationOptions {
  timeout?: number;
  followRedirects?: boolean;
  maxRedirects?: number;
  userAgent?: string;
  validateContent?: boolean;
}

const DEFAULT_OPTIONS: Required<ValidationOptions> = {
  timeout: 10000, // 10 seconds
  followRedirects: true,
  maxRedirects: 5,
  userAgent: "HealthyLife-LinkValidator/1.0 (Scientific Reference Validator)",
  validateContent: false,
};

/**
 * Validate a single URL
 */
export async function validateUrl(
  url: string,
  options: ValidationOptions = {}
): Promise<ValidationResult> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const startTime = Date.now();

  try {
    // Basic URL format validation
    let urlObj: URL;
    try {
      urlObj = new URL(url);
    } catch {
      return {
        url,
        valid: false,
        error: "Invalid URL format",
      };
    }

    // Skip validation for local/development URLs
    if (urlObj.hostname === "localhost" || urlObj.hostname === "127.0.0.1") {
      return {
        url,
        valid: true,
        status: 200,
        responseTime: Date.now() - startTime,
      };
    }

    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), opts.timeout);

    try {
      const response = await fetch(url, {
        method: "HEAD", // Use HEAD to avoid downloading content
        signal: controller.signal,
        redirect: opts.followRedirects ? "follow" : "manual",
        headers: {
          "User-Agent": opts.userAgent,
          Accept: "*/*",
        },
      });

      clearTimeout(timeoutId);

      const responseTime = Date.now() - startTime;
      const status = response.status;
      const contentType = response.headers.get("content-type") || undefined;

      // Check if URL was redirected
      let redirectUrl: string | undefined;
      if (response.url !== url && response.url) {
        redirectUrl = response.url;
      }

      // Consider 2xx and 3xx status codes as valid
      const valid = status >= 200 && status < 400;

      return {
        url,
        valid,
        status,
        contentType,
        redirectUrl,
        responseTime,
        error: valid ? undefined : `HTTP ${status}`,
      };
    } catch (fetchError) {
      clearTimeout(timeoutId);

      let errorMessage = "Network error";
      if (fetchError instanceof Error) {
        if (fetchError.name === "AbortError") {
          errorMessage = `Timeout after ${opts.timeout}ms`;
        } else {
          errorMessage = fetchError.message;
        }
      }

      return {
        url,
        valid: false,
        error: errorMessage,
        responseTime: Date.now() - startTime,
      };
    }
  } catch (error) {
    return {
      url,
      valid: false,
      error: error instanceof Error ? error.message : "Unknown error",
      responseTime: Date.now() - startTime,
    };
  }
}

/**
 * Validate multiple URLs concurrently
 */
export async function validateUrls(
  urls: string[],
  options: ValidationOptions & { concurrency?: number } = {}
): Promise<ValidationResult[]> {
  const { concurrency = 5, ...validationOptions } = options;
  const results: ValidationResult[] = [];

  // Process URLs in batches to control concurrency
  for (let i = 0; i < urls.length; i += concurrency) {
    const batch = urls.slice(i, i + concurrency);
    const batchPromises = batch.map(url => validateUrl(url, validationOptions));
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
  }

  return results;
}

/**
 * Validate DOI (Digital Object Identifier)
 */
export async function validateDoi(doi: string): Promise<ValidationResult> {
  // Basic DOI format validation
  const doiRegex = /^10\.\d{4,}\/.+/;
  if (!doiRegex.test(doi)) {
    return {
      url: doi,
      valid: false,
      error:
        "Invalid DOI format (must start with '10.' followed by publisher and suffix)",
    };
  }

  // Validate via DOI.org resolver
  const doiUrl = `https://doi.org/${doi}`;
  const result = await validateUrl(doiUrl, {
    followRedirects: true,
    timeout: 15000, // DOI resolvers can be slower
  });

  return {
    ...result,
    url: doi, // Return original DOI, not the resolved URL
  };
}

/**
 * Validate PubMed ID (PMID)
 */
export async function validatePmid(pmid: string): Promise<ValidationResult> {
  // Basic PMID format validation (numeric)
  if (!/^\d+$/.test(pmid)) {
    return {
      url: pmid,
      valid: false,
      error: "Invalid PMID format (must be numeric)",
    };
  }

  // Validate via PubMed API
  const pubmedUrl = `https://pubmed.ncbi.nlm.nih.gov/${pmid}`;
  const result = await validateUrl(pubmedUrl);

  return {
    ...result,
    url: pmid, // Return original PMID
  };
}

/**
 * Extract and validate all links from a reference
 */
export interface ReferenceLinks {
  url?: string;
  doi?: string;
  pmid?: string;
}

export async function validateReferenceLinks(
  links: ReferenceLinks,
  options: ValidationOptions = {}
): Promise<Record<keyof ReferenceLinks, ValidationResult | null>> {
  const results: Record<keyof ReferenceLinks, ValidationResult | null> = {
    url: null,
    doi: null,
    pmid: null,
  };

  const validationPromises: Promise<void>[] = [];

  if (links.url) {
    validationPromises.push(
      validateUrl(links.url, options).then(result => {
        results.url = result;
      })
    );
  }

  if (links.doi) {
    validationPromises.push(
      validateDoi(links.doi).then(result => {
        results.doi = result;
      })
    );
  }

  if (links.pmid) {
    validationPromises.push(
      validatePmid(links.pmid).then(result => {
        results.pmid = result;
      })
    );
  }

  await Promise.all(validationPromises);
  return results;
}

/**
 * Check if URL is accessible and return basic info
 */
export async function checkUrlAccessibility(url: string): Promise<{
  accessible: boolean;
  status?: number;
  error?: string;
  contentType?: string;
  lastModified?: string;
  contentLength?: number;
}> {
  try {
    const result = await validateUrl(url, { validateContent: true });

    if (!result.valid) {
      return {
        accessible: false,
        status: result.status,
        error: result.error,
      };
    }

    // Get additional metadata with a GET request
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "User-Agent":
            "HealthyLife-LinkValidator/1.0 (Scientific Reference Validator)",
        },
      });

      const contentLength = response.headers.get("content-length");
      const lastModified = response.headers.get("last-modified");

      return {
        accessible: true,
        status: response.status,
        contentType: result.contentType,
        lastModified: lastModified || undefined,
        contentLength: contentLength ? parseInt(contentLength, 10) : undefined,
      };
    } catch {
      // If GET fails but HEAD succeeded, still consider it accessible
      return {
        accessible: true,
        status: result.status,
        contentType: result.contentType,
      };
    }
  } catch (error) {
    return {
      accessible: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Batch validate URLs with progress reporting
 */
export async function validateUrlsBatch(
  urls: string[],
  options: ValidationOptions & {
    concurrency?: number;
    onProgress?: (progress: {
      completed: number;
      total: number;
      current?: string;
    }) => void;
  } = {}
): Promise<ValidationResult[]> {
  const { concurrency = 5, onProgress, ...validationOptions } = options;
  const results: ValidationResult[] = [];
  const total = urls.length;

  for (let i = 0; i < urls.length; i += concurrency) {
    const batch = urls.slice(i, i + concurrency);

    const batchPromises = batch.map(async (url, index) => {
      const globalIndex = i + index;
      onProgress?.({ completed: globalIndex, total, current: url });

      const result = await validateUrl(url, validationOptions);

      onProgress?.({ completed: globalIndex + 1, total });
      return result;
    });

    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
  }

  return results;
}

/**
 * Generate validation report
 */
export interface ValidationReport {
  totalUrls: number;
  validUrls: number;
  invalidUrls: number;
  successRate: number;
  averageResponseTime: number;
  errors: Record<string, number>;
  details: ValidationResult[];
}

export function generateValidationReport(
  results: ValidationResult[]
): ValidationReport {
  const totalUrls = results.length;
  const validUrls = results.filter(r => r.valid).length;
  const invalidUrls = totalUrls - validUrls;
  const successRate = totalUrls > 0 ? (validUrls / totalUrls) * 100 : 0;

  const responseTimes = results
    .filter(r => r.responseTime !== undefined)
    .map(r => r.responseTime!);
  const averageResponseTime =
    responseTimes.length > 0
      ? responseTimes.reduce((sum, time) => sum + time, 0) /
        responseTimes.length
      : 0;

  const errors: Record<string, number> = {};
  results
    .filter(r => !r.valid && r.error)
    .forEach(r => {
      const error = r.error!;
      errors[error] = (errors[error] || 0) + 1;
    });

  return {
    totalUrls,
    validUrls,
    invalidUrls,
    successRate,
    averageResponseTime,
    errors,
    details: results,
  };
}
