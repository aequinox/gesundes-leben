/**
 * @file posts.test.ts
 * @description Comprehensive tests for post utility functions
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock dependencies
vi.mock('../logger', () => ({
  logger: {
    log: vi.fn(),
    error: vi.fn(),
    info: vi.fn()
  }
}));

vi.mock('@/config', () => ({
  SITE: {
    scheduledPostMargin: 15 * 60 * 1000 // 15 minutes
  }
}));

import type { Post } from '../types';

import {
  getAllPosts,
  getSortedPosts,
  getFeaturedPosts,
  getRecentPosts,
  getRelatedPosts,
  getPostsWithReadingTime,
  processAllPosts,
  getPostsByTag,
  getPostsByCategory,
  getPostsByGroup,
  groupByCondition,
  type GroupFunction
} from '../posts';

// Mock data
const createMockPost = (overrides: Partial<Post['data']> = {}): Post => ({
  id: 'mock-post',
  body: 'Mock post content',
  collection: 'blog',
  data: {
    title: 'Mock Post',
    author: 'mock-author',
    pubDatetime: new Date('2024-01-01'),
    modDatetime: undefined,
    featured: false,
    draft: false,
    tags: ['test', 'mock'],
    categories: ['Wissenswertes'],
    description: 'Mock post description',
    heroImage: { 
      src: '/mock.jpg', 
      alt: 'Mock image',
      format: 'jpg' as const,
      width: 800,
      height: 600
    } as any,
    keywords: ['test'],
    readingTime: undefined,
    group: 'pro',
    ...overrides
  },
  rendered: undefined
});

const mockPosts: Post[] = [
  createMockPost({
    title: 'First Post',
    pubDatetime: new Date('2024-01-01'),
    featured: true,
    tags: ['javascript', 'react'],
    categories: ['Wissenschaftliches', 'Ernährung']
  }),
  createMockPost({
    title: 'Second Post',
    pubDatetime: new Date('2024-01-02'),
    featured: false,
    tags: ['typescript', 'react'],
    categories: ['Wissenschaftliches']
  }),
  createMockPost({
    title: 'Third Post',
    pubDatetime: new Date('2024-01-03'),
    featured: false,
    draft: true,
    tags: ['css', 'design'],
    categories: ['Lifestyle & Psyche']
  }),
  createMockPost({
    title: 'Future Post',
    pubDatetime: new Date('2025-01-01'),
    featured: false,
    tags: ['future'],
    categories: ['Wissenswertes']
  })
];


describe('Post Utility Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock the current time to be in 2024
    vi.setSystemTime(new Date('2024-06-01'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('getAllPosts', () => {
    it('should return all posts when includeDrafts is true', async () => {
      const { getCollection } = await import('astro:content');
      vi.mocked(getCollection).mockResolvedValue(mockPosts);

      const result = await getAllPosts(true);
      expect(result).toHaveLength(4);
      expect(getCollection).toHaveBeenCalledWith('blog');
    });

    it('should filter out drafts and future posts by default', async () => {
      const { getCollection } = await import('astro:content');
      vi.mocked(getCollection).mockResolvedValue(mockPosts);

      const result = await getAllPosts(false);
      // Should exclude draft (post-3) and future post (post-4)
      expect(result).toHaveLength(2);
      expect(result.map(p => p.data.title)).toEqual(['First Post', 'Second Post']);
    });

    it('should handle posts with invalid pubDatetime', async () => {
      const invalidPosts = [
        createMockPost({ title: 'Invalid 1', pubDatetime: null as any }),
        createMockPost({ title: 'Invalid 2', pubDatetime: 'invalid-date' as any }),
        createMockPost({ title: 'Valid Post', pubDatetime: new Date('2024-01-01') })
      ];

      const { getCollection } = await import('astro:content');
      vi.mocked(getCollection).mockResolvedValue(invalidPosts);

      const result = await getAllPosts(false);
      expect(result).toHaveLength(1);
      expect(result[0].data.title).toBe('Valid Post');
    });

    it('should return empty array on error', async () => {
      const { getCollection } = await import('astro:content');
      vi.mocked(getCollection).mockRejectedValue(new Error('Collection error'));

      const result = await getAllPosts(false);
      expect(result).toEqual([]);
    });
  });

  describe('getSortedPosts', () => {
    it('should sort posts by date descending by default', () => {
      const result = getSortedPosts(mockPosts.slice(0, 3)); // Exclude future post
      expect(result.map(p => p.data.title)).toEqual(['Third Post', 'Second Post', 'First Post']);
    });

    it('should sort posts by date ascending when specified', () => {
      const result = getSortedPosts(mockPosts.slice(0, 3), 'asc');
      expect(result.map(p => p.data.title)).toEqual(['First Post', 'Second Post', 'Third Post']);
    });

    it('should handle posts with modDatetime', () => {
      const postsWithMod = [
        createMockPost({
          title: 'Old Post Modified',
          pubDatetime: new Date('2024-01-01'),
          modDatetime: new Date('2024-01-05')
        }),
        createMockPost({
          title: 'New Post',
          pubDatetime: new Date('2024-01-02')
        })
      ];

      const result = getSortedPosts(postsWithMod);
      // Old post should come first because it has a later modDatetime
      expect(result.map(p => p.data.title)).toEqual(['Old Post Modified', 'New Post']);
    });

    it('should return original array on error', () => {
      const invalidPosts = [null as any, undefined as any];
      const result = getSortedPosts(invalidPosts);
      expect(result).toEqual(invalidPosts);
    });
  });

  describe('getFeaturedPosts', () => {
    it('should return only featured posts', async () => {
      const result = await getFeaturedPosts(mockPosts);
      expect(result).toHaveLength(1);
      expect(result[0].data.title).toBe('First Post');
      expect(result[0].data.featured).toBe(true);
    });

    it('should fetch all posts if none provided', async () => {
      const { getCollection } = await import('astro:content');
      vi.mocked(getCollection).mockResolvedValue(mockPosts);

      const result = await getFeaturedPosts();
      expect(result).toHaveLength(1);
      expect(getCollection).toHaveBeenCalledWith('blog');
    });

    it('should return empty array on error', async () => {
      const result = await getFeaturedPosts([null as any]);
      expect(result).toEqual([]);
    });
  });

  describe('getRecentPosts', () => {
    it('should return only non-featured posts', async () => {
      const result = await getRecentPosts(mockPosts);
      expect(result).toHaveLength(3);
      expect(result.every(post => !post.data.featured)).toBe(true);
    });

    it('should fetch all posts if none provided', async () => {
      const { getCollection } = await import('astro:content');
      vi.mocked(getCollection).mockResolvedValue(mockPosts);

      const result = await getRecentPosts();
      expect(result).toHaveLength(3);
      expect(getCollection).toHaveBeenCalledWith('blog');
    });
  });

  describe('getRelatedPosts', () => {
    it('should return posts with shared tags', () => {
      const currentPost = createMockPost({
        tags: ['react', 'javascript'],
        categories: ['Wissenswertes']
      });

      const result = getRelatedPosts(currentPost, mockPosts, 5);
      
      // Should find posts with shared tags/categories
      expect(result.length).toBeGreaterThan(0);
      expect(result.map(p => p.data.title)).not.toContain('Current Post');
    });

    it('should limit results to maxPosts', () => {
      const currentPost = createMockPost({
        tags: ['react'],
        categories: ['Wissenswertes']
      });

      const result = getRelatedPosts(currentPost, mockPosts, 1);
      expect(result).toHaveLength(1);
    });

    it('should prioritize tag matches over category matches', () => {
      const testPosts = [
        createMockPost({
          title: 'Tag Match Post',
          tags: ['react'],
          categories: ['Lifestyle & Psyche']
        }),
        createMockPost({
          title: 'Category Match Post',
          tags: ['different'],
          categories: ['Wissenschaftliches']
        })
      ];

      const currentPost = createMockPost({
        title: 'Current Post',
        tags: ['react'],
        categories: ['Wissenschaftliches']
      });

      const result = getRelatedPosts(currentPost, testPosts, 5);
      
      // Tag match should score higher (3 points) than category match (2 points)
      if (result.length > 1) {
        expect(result[0].data.title).toBe('Tag Match Post');
      }
    });

    it('should return empty array if no related posts found', () => {
      const currentPost = createMockPost({
        title: 'Current Post',
        tags: ['unique-tag'],
        categories: ['Wissenswertes']
      });

      const unrelatedPosts = [
        createMockPost({
          title: 'Unrelated Post',
          tags: ['different'],
          categories: ['Ernährung']
        })
      ];

      const result = getRelatedPosts(currentPost, unrelatedPosts, 5);
      expect(result).toEqual([]);
    });
  });

  describe('getPostsWithReadingTime', () => {
    it('should skip posts that already have reading time', async () => {
      const postsWithTime = [
        createMockPost({ readingTime: 5 }),
        createMockPost({})
      ];

      const astroContent = await import('astro:content');
      vi.mocked(astroContent.render).mockResolvedValue({
        remarkPluginFrontmatter: { readingTime: 3 }
      } as any);

      const result = await getPostsWithReadingTime(postsWithTime);
      
      expect(result[0].data.readingTime).toBe(5); // Unchanged
      expect(result[1].data.readingTime).toBe(3); // Added from render
      expect(render).toHaveBeenCalledTimes(1); // Only called for post without time
    });

    it('should handle render errors gracefully', async () => {
      const postsWithoutTime = [createMockPost({})];

      const astroContent = await import('astro:content');
      vi.mocked(astroContent.render).mockRejectedValue(new Error('Render error'));

      const result = await getPostsWithReadingTime(postsWithoutTime);
      
      expect(result).toHaveLength(1);
      expect(result[0].data.readingTime).toBeUndefined();
    });
  });

  describe('getPostsByTag', () => {
    it('should filter posts by tag', async () => {
      const result = await getPostsByTag(mockPosts, 'react');
      expect(result).toHaveLength(2);
      expect(result.every(post => 
        post.data.tags?.some(tag => tag.toLowerCase().includes('react'))
      )).toBe(true);
    });

    it('should return empty array for non-existent tag', async () => {
      const result = await getPostsByTag(mockPosts, 'nonexistent');
      expect(result).toEqual([]);
    });
  });

  describe('getPostsByCategory', () => {
    it('should filter posts by category', async () => {
      const result = await getPostsByCategory(mockPosts, 'wissenschaftliches');
      expect(result).toHaveLength(2);
      expect(result.every(post => 
        post.data.categories?.some(cat => cat.toLowerCase().includes('wissenschaftliches'))
      )).toBe(true);
    });
  });

  describe('getPostsByGroup', () => {
    it('should filter posts by group', async () => {
      const testPosts = [
        createMockPost({ group: 'pro' }),
        createMockPost({ group: 'kontra' }),
        createMockPost({ group: 'pro' })
      ];

      const result = await getPostsByGroup(testPosts, 'pro');
      expect(result).toHaveLength(2);
      expect(result.every(post => post.data.group === 'pro')).toBe(true);
    });
  });

  describe('groupByCondition', () => {
    it('should group items by function result', () => {
      const items = ['apple', 'banana', 'cherry', 'apricot'];
      const groupFn: GroupFunction<string> = (item) => item[0]; // Group by first letter

      const result = groupByCondition(items, groupFn);
      
      expect(result['a']).toEqual(['apple', 'apricot']);
      expect(result['b']).toEqual(['banana']);
      expect(result['c']).toEqual(['cherry']);
    });

    it('should handle errors with error handler', () => {
      const items = [1, 2, 3];
      const errorGroupFn: GroupFunction<number> = (item) => {
        if (item === 2) throw new Error('Test error');
        return item.toString();
      };

      const result = groupByCondition(items, errorGroupFn, {
        onError: () => 'error-group'
      });

      expect(result['1']).toEqual([1]);
      expect(result['3']).toEqual([3]);
      expect(result['error-group']).toEqual([2]);
    });

    it('should use initial groups if provided', () => {
      const items = ['new'];
      const groupFn: GroupFunction<string> = (item) => item;
      const initialGroups = { existing: ['old'] };

      const result = groupByCondition(items, groupFn, { initialGroups });
      
      expect(result['existing']).toEqual(['old']);
      expect(result['new']).toEqual(['new']);
    });

    it('should throw error when no error handler provided', () => {
      const items = [1, 2];
      const errorGroupFn: GroupFunction<number> = () => {
        throw new Error('Test error');
      };

      expect(() => groupByCondition(items, errorGroupFn)).toThrow('Test error');
    });

    it('should handle empty arrays', () => {
      const result = groupByCondition([], () => 'group');
      expect(result).toEqual({});
    });
  });

  describe('processAllPosts', () => {
    it('should process posts with default options', async () => {
      const { getCollection } = await import('astro:content');
      const { render } = await import('astro:content');
      
      vi.mocked(getCollection).mockResolvedValue(mockPosts);
      vi.mocked(render).mockResolvedValue({
        remarkPluginFrontmatter: { readingTime: 3 }
      } as any);

      const result = await processAllPosts();
      
      expect(result.length).toBeGreaterThan(0);
      expect(getCollection).toHaveBeenCalledWith('blog');
    });

    it('should limit posts when maxPosts is specified', async () => {
      const { getCollection } = await import('astro:content');
      vi.mocked(getCollection).mockResolvedValue(mockPosts);

      const result = await processAllPosts({ maxPosts: 1 });
      expect(result).toHaveLength(1);
    });

    it('should include drafts when specified', async () => {
      const { getCollection } = await import('astro:content');
      vi.mocked(getCollection).mockResolvedValue(mockPosts);

      const result = await processAllPosts({ includeDrafts: true });
      expect(result).toHaveLength(4);
    });

    it('should cache results', async () => {
      const { getCollection } = await import('astro:content');
      vi.mocked(getCollection).mockResolvedValue(mockPosts);

      const options = { maxPosts: 2 };
      
      // First call
      const result1 = await processAllPosts(options);
      
      // Second call with same options should use cache
      const result2 = await processAllPosts(options);
      
      // Results should be identical
      expect(result1).toEqual(result2);
      expect(result1).toHaveLength(2);
    });
  });
});

describe('Edge Cases and Error Handling', () => {
  it('should handle posts without required fields', async () => {
    const malformedPosts = [
      { id: 'malformed', data: {} }, // Missing required fields
      createMockPost({ title: '', pubDatetime: null as any })
    ] as Post[];

    const { getCollection } = await import('astro:content');
    vi.mocked(getCollection).mockResolvedValue(malformedPosts);

    const result = await getAllPosts(false);
    expect(result).toEqual([]);
  });

  it('should handle empty arrays gracefully', () => {
    const result = getSortedPosts([]);
    expect(result).toEqual([]);
  });

  it('should handle undefined/null inputs', async () => {
    const result = await getFeaturedPosts(undefined as any);
    expect(Array.isArray(result)).toBe(true);
  });
});