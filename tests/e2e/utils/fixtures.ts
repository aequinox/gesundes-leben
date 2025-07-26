/**
 * Test fixtures and test data for German health blog E2E tests
 */

export const GERMAN_HEALTH_TERMS = [
  'Gesundheit',
  'Ernährung', 
  'Wellness',
  'Therapie',
  'Therapeuten',
  'Mikrobiom',
  'Antioxidantien',
  'Vitamine',
  'Mineralstoffe',
  'Immunsystem'
];

export const COMMON_GERMAN_WORDS = [
  'und',
  'für', 
  'der',
  'die',
  'das',
  'mit',
  'auf',
  'über',
  'von',
  'zu'
];

export const SEARCH_QUERIES = {
  valid: [
    'Vitamin D',
    'Omega 3',
    'Ernährung',
    'Stress',
    'Darmgesundheit',
    'Immunsystem',
    'Mikrobiom'
  ],
  invalid: [
    'xyz123',
    'notfound',
    '####',
    ''
  ],
  german: [
    'Gesundheit',
    'Müdigkeit',
    'Nahrungsergänzung',
    'Stärkung'
  ]
};

export const AUTHOR_SLUGS = [
  'kai-renner',
  'sandra-pfeiffer'
];

export const SAMPLE_AUTHORS = [
  'sandra-pfeiffer',
  'kai-renner'
];

export const SAMPLE_GLOSSARY_TERMS = [
  'vitamin-d',
  'omega-3',
  'antioxidantien',
  'immunsystem',
  'mikrobiom'
];

export const SAMPLE_BLOG_POSTS = [
  '2024-09-20-die-geheime-sprache-der-darmbakterien',
  '2024-10-29-die-wissenschaft-der-darm-hirn-achse',
  '2024-11-04-hoffnungstraeger-spermidin',
  '2022-08-23-kurkuma-der-gesundheits-booster'
];

export const CATEGORIES = [
  'Ernährung',
  'Mentale Gesundheit', 
  'Immunsystem',
  'Mikrobiom',
  'Vitamine & Mineralstoffe'
];

export const EXPECTED_PAGES = {
  homepage: {
    title: /Gesundes Leben/,
    description: /Dein vertrauenswürdiger Ratgeber für Gesundheit/,
    url: '/'
  },
  about: {
    title: /Über uns|About/,
    description: /Über unser Team|Team/,
    url: '/about'
  },
  search: {
    title: /Suche|Search/,
    description: /Suche|Search/,
    url: '/search'
  },
  categories: {
    title: /Kategorien|Categories/,
    description: /Kategorien|Categories/,
    url: '/categories'
  },
  glossary: {
    title: /Glossar|Glossary/,
    description: /Glossar|Medical terms/,
    url: '/glossary'
  },
  imprint: {
    title: /Impressum|Imprint/,
    description: /Impressum|Legal/,
    url: '/imprint'
  },
  ourVision: {
    title: /Vision|Unsere Vision/,
    description: /Vision|Mission/,
    url: '/our-vision'
  }
};

export const PERFORMANCE_THRESHOLDS = {
  loadTime: 5000, // 5 seconds max
  coreWebVitals: {
    lcp: 2500, // Largest Contentful Paint < 2.5s
    fid: 100,  // First Input Delay < 100ms
    cls: 0.1   // Cumulative Layout Shift < 0.1
  },
  bundleSize: {
    initial: 500 * 1024, // 500KB initial bundle
    total: 2 * 1024 * 1024 // 2MB total
  }
};

export const ACCESSIBILITY_REQUIREMENTS = {
  colorContrast: {
    normal: 4.5,    // WCAG AA normal text
    large: 3.0      // WCAG AA large text
  },
  landmarks: [
    'banner',
    'main', 
    'navigation',
    'contentinfo'
  ],
  headings: {
    h1Count: 1,     // Exactly one h1 per page
    hierarchical: true // Proper heading order
  }
};

export const VIEWPORT_SIZES = {
  mobile: { width: 375, height: 667 },      // iPhone SE
  tablet: { width: 768, height: 1024 },     // iPad
  desktop: { width: 1200, height: 800 },    // Desktop
  largeDesktop: { width: 1440, height: 900 } // Large desktop
};

export const BROWSER_PROJECTS = [
  'chromium',
  'firefox', 
  'webkit',
  'Mobile Chrome',
  'Mobile Safari'
];

export const SOCIAL_META_TAGS = [
  'og:title',
  'og:description', 
  'og:type',
  'og:url',
  'og:image',
  'twitter:card',
  'twitter:title',
  'twitter:description'
];

export const EXPECTED_STRUCTURAL_ELEMENTS = [
  'header[role="banner"]',
  'main',
  'nav',
  'footer',
  'h1'
];

export const HEALTH_BLOG_SPECIFIC_ELEMENTS = [
  'a[href="/rss.xml"]',      // RSS feed
  'a[href="/search"]',       // Search functionality  
  'a[href="/glossary/"]',    // Medical glossary
  '.hashtag',                // Health hashtags
  '.reading-time'            // Reading time estimation
];

export const ERROR_SCENARIOS = {
  networkFailure: {
    status: 500,
    message: 'Network error'
  },
  notFound: {
    status: 404,
    urls: [
      '/non-existent-page',
      '/posts/non-existent-post',
      '/author/non-existent-author'
    ]
  },
  serverError: {
    status: 500,
    message: 'Internal server error'
  }
};

export const GERMAN_DATE_FORMATS = [
  /\d{1,2}\.\s?(Januar|Februar|März|April|Mai|Juni|Juli|August|September|Oktober|November|Dezember)\s?\d{4}/,
  /\d{1,2}\.\d{1,2}\.\d{4}/
];

export const RSS_FEED_REQUIREMENTS = {
  contentType: 'application/xml',
  elements: [
    'rss',
    'channel', 
    'title',
    'description',
    'item'
  ]
};

export const SITEMAP_REQUIREMENTS = {
  contentType: 'application/xml',
  elements: [
    'urlset',
    'url',
    'loc',
    'lastmod'
  ]
};