/**
 * @file astro-mocks.ts
 * @description Astro-specific mocks for component and integration testing
 * 
 * Provides comprehensive mocks for Astro framework features including
 * content collections, image optimization, and component rendering.
 */

import type { CollectionEntry } from 'astro:content';
import { vi } from 'vitest';

/**
 * Mock Astro content collections for health blog testing
 */
export const createAstroContentMocks = () => {
  // Mock blog posts for testing
  const mockBlogPosts: CollectionEntry<'blog'>[] = [
    {
      id: 'test-nutrition-article.mdx',
      body: 'This is a test nutrition article content...',
      collection: 'blog',
      data: {
        title: 'Gesunde Ernährung im Alltag',
        description: 'Ein umfassender Leitfaden für gesunde Ernährung',
        author: 'dr-health',
        pubDatetime: new Date('2024-01-15'),
        categories: ['Ernährung', 'Lifestyle & Psyche'] as const,
        group: 'pro' as const,
        featured: true,
        draft: false,
        heroImage: {
          src: {
            format: 'jpg' as const,
            src: './images/nutrition-hero.jpg',
            width: 800,
            height: 600
          },
          alt: 'Gesunde Lebensmittel auf einem Tisch'
        },
        tags: ['Ernährung', 'Gesundheit', 'Vitamine'],
        keywords: ['gesunde ernährung', 'vitamine', 'nährstoffe'],
        references: ['nutrition-study-2024', 'vitamin-research-2023']
      },
      rendered: {
        // Content: () => '<p>Mock content</p>', // Not part of RenderedContent interface
        remarkPluginFrontmatter: {}
      } as any
    },
    {
      id: 'test-wellness-article.mdx',
      body: 'This is a test wellness article content...',
      collection: 'blog',
      data: {
        title: 'Achtsamkeit und Wohlbefinden',
        description: 'Tipps für mentale Gesundheit und Wohlbefinden',
        author: 'wellness-expert',
        pubDatetime: new Date('2024-01-20'),
        categories: ['Lifestyle & Psyche'] as const,
        group: 'kontra' as const,
        featured: false,
        draft: false,
        heroImage: {
          src: {
            format: 'jpg' as const,
            src: './images/wellness-hero.jpg',
            width: 800,
            height: 600
          },
          alt: 'Person bei Meditation'
        },
        tags: ['Achtsamkeit', 'Meditation', 'Stress'],
        keywords: ['achtsamkeit', 'meditation', 'stressabbau'],
        references: ['mindfulness-study-2024']
      },
      rendered: {
        // Content: () => '<p>Mock wellness content</p>', // Not part of RenderedContent interface
        remarkPluginFrontmatter: {}
      } as any
    }
  ];

  // Mock authors for testing
  const mockAuthors: CollectionEntry<'authors'>[] = [
    {
      id: 'dr-health.md',
      body: 'Dr. Health is a nutrition expert...',
      collection: 'authors',
      data: {
        name: 'Dr. Health Expert',
        avatar: './images/dr-health.jpg',
        bio: 'Ernährungswissenschaftler mit 15 Jahren Erfahrung',
      },
      rendered: {
        // Content: () => '<p>Mock author bio</p>', // Not part of RenderedContent interface
        remarkPluginFrontmatter: {}
      } as any
    }
  ];

  // Mock glossary entries for testing
  const mockGlossary: CollectionEntry<'glossary'>[] = [
    {
      id: 'antioxidantien.md',
      body: 'Antioxidantien sind Verbindungen...',
      collection: 'glossary',
      data: {
        title: 'Antioxidantien',
        author: 'dr-health',
        pubDatetime: new Date('2024-01-01'),
        modDatetime: new Date('2024-01-02')
      },
      rendered: {
        // Content: () => '<p>Mock glossary definition</p>', // Not part of RenderedContent interface
        remarkPluginFrontmatter: {}
      } as any
    }
  ];

  return {
    mockBlogPosts,
    mockAuthors,
    mockGlossary,
    
    // Mock getCollection function
    getCollection: vi.fn().mockImplementation((collection: string, filter?: any) => {
      switch (collection) {
        case 'blog':
          return Promise.resolve(filter ? mockBlogPosts.filter(filter) : mockBlogPosts);
        case 'authors':
          return Promise.resolve(filter ? mockAuthors.filter(filter) : mockAuthors);
        case 'glossary':
          return Promise.resolve(filter ? mockGlossary.filter(filter) : mockGlossary);
        default:
          return Promise.resolve([]);
      }
    }),

    // Mock getEntry function
    getEntry: vi.fn().mockImplementation((collection: string, slug: string) => {
      switch (collection) {
        case 'blog':
          return Promise.resolve(mockBlogPosts.find(post => post.id.includes(slug)));
        case 'authors':
          return Promise.resolve(mockAuthors.find(author => author.id.includes(slug)));
        case 'glossary':
          return Promise.resolve(mockGlossary.find(term => term.id.includes(slug)));
        default:
          return Promise.resolve(undefined);
      }
    }),

    // Mock getEntries function
    getEntries: vi.fn().mockImplementation((references: any[]) => {
      return Promise.resolve(references.map(ref => {
        if (typeof ref === 'object' && ref.collection && ref.slug) {
          switch (ref.collection) {
            case 'blog':
              return mockBlogPosts.find(post => post.id.includes(ref.slug ?? ref.id || ''));
            case 'authors':
              return mockAuthors.find(author => author.id.includes(ref.slug ?? ref.id || ''));
            case 'glossary':
              return mockGlossary.find(term => term.id.includes(ref.slug ?? ref.id || ''));
          }
        }
        return undefined;
      }).filter(Boolean));
    })
  };
};

/**
 * Mock Astro Image component for testing
 */
export const createAstroImageMock = () => {
  const MockImage = vi.fn(({ src, alt, width, height, ...props }) => {
    // Create a mock image element
    const img = {
      src: typeof src === 'string' ? src : src.src,
      alt: alt || '',
      width: width ?? 800,
      height: height ?? 600,
      loading: props.loading || 'lazy',
      ...props
    };
    
    return `<img src="${img.src}" alt="${img.alt}" width="${img.width}" height="${img.height}" loading="${img.loading}" />`;
  });

  const MockPicture = vi.fn(({ src, alt, widths, formats, ...props }) => {
    // Mock responsive picture element
    const picture = {
      src: typeof src === 'string' ? src : src.src,
      alt: alt || '',
      widths: widths || [800, 1200],
      formats: formats || ['avif', 'webp', 'jpeg'],
      ...props
    };

    const sources = picture.formats.map((format: string) => 
      `<source srcset="${picture.src}" type="image/${format}" />`
    ).join('');

    return `<picture>${sources}<img src="${picture.src}" alt="${picture.alt}" /></picture>`;
  });

  return {
    Image: MockImage,
    Picture: MockPicture,
    getImage: vi.fn().mockImplementation((options) => {
      return Promise.resolve({
        src: options.src,
        width: options.width ?? 800,
        height: options.height ?? 600,
        format: options.format || 'jpeg'
      });
    })
  };
};

/**
 * Mock Astro global objects and utilities
 */
export const createAstroGlobalMocks = () => {
  const mockAstro = {
    request: {
      url: 'https://localhost:4321/test',
      method: 'GET',
      headers: new Headers(),
      body: null
    },
    params: {},
    props: {},
    redirect: vi.fn(),
    response: {
      status: 200,
      headers: new Headers()
    },
    site: new URL('https://localhost:4321'),
    generator: 'Astro v5.12.0'
  };

  const mockUrl = {
    pathname: '/test',
    searchParams: new URLSearchParams(),
    origin: 'https://localhost:4321',
    href: 'https://localhost:4321/test'
  };

  return {
    Astro: mockAstro,
    url: mockUrl,
    
    // Mock import.meta.env for Astro
    importMetaEnv: {
      DEV: true,
      PROD: false,
      MODE: 'development',
      SITE: 'https://localhost:4321'
    }
  };
};

/**
 * Mock health blog specific integrations
 */
export const createHealthBlogMocks = () => {
  // Mock pagefind search integration
  const mockPagefind = {
    init: vi.fn(),
    search: vi.fn().mockImplementation((_query: string) => {
      return Promise.resolve({
        results: [
          {
            id: 'test-result',
            score: 0.95,
            data: {
              url: '/blog/test-nutrition-article',
              title: 'Gesunde Ernährung im Alltag',
              excerpt: 'Ein umfassender Leitfaden für gesunde Ernährung...'
            }
          }
        ],
        unfilteredResultCount: 1
      });
    }),
    debouncedSearch: vi.fn()
  };

  // Mock reading time calculation
  const mockReadingTime = vi.fn().mockImplementation((content: string) => {
    const wordCount = content.split(' ').length;
    const readingTimeMinutes = Math.ceil(wordCount / 200); // 200 words per minute
    return {
      text: `${readingTimeMinutes} min read`,
      minutes: readingTimeMinutes,
      words: wordCount
    };
  });

  // Mock German health terminology validator
  const mockHealthValidator = {
    validateTerminology: vi.fn().mockImplementation((content: string) => {
      const germanHealthTerms = [
        'Ernährung', 'Gesundheit', 'Vitamine', 'Mineralstoffe', 
        'Antioxidantien', 'Ballaststoffe', 'Probiotika'
      ];
      
      const foundTerms = germanHealthTerms.filter(term => 
        content.toLowerCase().includes(term.toLowerCase())
      );
      
      return {
        isValid: foundTerms.length > 0,
        foundTerms,
        suggestions: []
      };
    }),

    validateReferences: vi.fn().mockImplementation((references: string[]) => {
      return {
        valid: references.length > 0,
        invalidRefs: [],
        score: references.length > 0 ? 1.0 : 0.0
      };
    })
  };

  return {
    pagefind: mockPagefind,
    readingTime: mockReadingTime,
    healthValidator: mockHealthValidator
  };
};

/**
 * Setup comprehensive Astro mocks for testing
 */
export const setupAstroMocks = () => {
  const contentMocks = createAstroContentMocks();
  const imageMocks = createAstroImageMock();
  const globalMocks = createAstroGlobalMocks();
  const healthBlogMocks = createHealthBlogMocks();

  // Setup Astro content collections mock
  vi.mock('astro:content', () => contentMocks);

  // Setup Astro assets mock
  vi.mock('astro:assets', () => imageMocks);

  // Setup global Astro object
  if (typeof globalThis !== 'undefined') {
    Object.defineProperty(globalThis, 'Astro', { 
      value: globalMocks.Astro,
      configurable: true 
    });
  }

  return {
    content: contentMocks,
    images: imageMocks,
    globals: globalMocks,
    healthBlog: healthBlogMocks,
    
    cleanup: () => {
      vi.clearAllMocks();
    }
  };
};

export default setupAstroMocks;