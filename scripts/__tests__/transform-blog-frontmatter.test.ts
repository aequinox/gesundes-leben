import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { readFileSync, writeFileSync, readdirSync, unlinkSync } from 'fs';
import type { Category } from '@/data/taxonomies';

// Mock external dependencies
vi.mock('fs', () => ({
  promises: {
    readFile: vi.fn(),
    writeFile: vi.fn(),
    readdir: vi.fn(),
    unlink: vi.fn(),
  },
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
  readdirSync: vi.fn(),
  unlinkSync: vi.fn(),
}));

vi.mock('path', async () => {
  const actual = await vi.importActual('path') as typeof import('path');
  return {
    ...actual,
    join: vi.fn((...args) => args.join('/')),
  };
});

vi.mock('uuid', () => ({
  v4: vi.fn(() => 'mock-uuid'),
}));

// Mock taxonomies
vi.mock('@/data/taxonomies', () => ({
  GROUPS: ['fragezeiten', 'pro', 'kontra'],
  CATEGORIES: [
    'Ernährung',
    'Immunsystem',
    'Lesenswertes',
    'Lifestyle & Psyche',
    'Mikronährstoffe',
    'Organsysteme',
    'Wissenschaftliches',
    'Wissenswertes'
  ],
}));

// Mock slugify utility
vi.mock('@/utils/slugify', () => ({
  slugifyStr: vi.fn((str: string) => str.toLowerCase().replace(/\s+/g, '-')),
}));

describe('transform-blog-frontmatter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    console.log = vi.fn();
    console.error = vi.fn();
  });

  afterEach(() => {
    vi.resetModules();
  });

  describe('transformFrontmatter', () => {
    it('should transform frontmatter with all fields', async () => {
      const { transformFrontmatter } = await import('../transform-blog-frontmatter');
      const input = {
        title: 'Test Post',
        coverImage: 'test.jpg',
        date: '2024-01-01',
        categories: ['Ernährung', 'Immunsystem'] as Category[],
        tags: ['test', 'example'],
      };

      const result = transformFrontmatter(input, '');

      expect(result).toEqual({
        id: 'mock-uuid',
        title: 'Test Post',
        author: 'sandra-pfeiffer',
        slug: 'test-post',
        description: '',
        heroImage: {
          src: './images/test.jpg',
          alt: 'Test Post',
        },
        pubDatetime: '2024-01-01T00:00:00.000Z',
        modDatetime: '2024-01-01T00:00:00.000Z',
        draft: true,
        featured: false,
        group: 'fragezeiten',
        categories: ['Ernährung', 'Immunsystem'],
        tags: ['test', 'example'],
        favorites: {},
      });
    });

    it('should handle missing optional fields', async () => {
      const { transformFrontmatter } = await import('../transform-blog-frontmatter');
      const input = {
        title: 'Test Post',
      };

      const result = transformFrontmatter(input, '');

      expect(result.id).toBe('mock-uuid');
      expect(result.heroImage).toBeUndefined();
      expect(result.tags).toEqual([]);
      expect(result.categories).toEqual([]);
    });

    it('should validate and normalize categories', async () => {
      const { transformFrontmatter } = await import('../transform-blog-frontmatter');
      const input = {
        title: 'Test Post',
        categories: ['ernährung', 'invalid', 'Immunsystem'] as unknown as Category[],
      };

      const result = transformFrontmatter(input, '');

      expect(result.categories).toEqual(['Ernährung', 'Immunsystem']);
    });
  });

  describe('generateDescription', () => {
    it('should generate description from content', async () => {
      const { generateDescription } = await import('../transform-blog-frontmatter');
      const content = `---
title: Test
---
# Heading
This is a test content with more than 150 characters to ensure that the description is properly truncated at the specified length limit while maintaining readability and context.`;

      const description = await generateDescription(content);

      expect(description).toBe('Heading This is a test content with more than 150 characters to ensure that the description is properly truncated at the specified length limit while ...');
    });

    it('should handle content with markdown syntax', async () => {
      const { generateDescription } = await import('../transform-blog-frontmatter');
      const content = `---
title: Test
---
# Main Title
**Bold text** and *italic text* with \`code\` blocks.`;

      const description = await generateDescription(content);

      expect(description).toBe('Main Title Bold text and italic text with code blocks....');
    });
  });

  describe('findMarkdownFiles', () => {
    it('should find markdown files recursively', async () => {
      const { findMarkdownFiles } = await import('../transform-blog-frontmatter');
      const mockFiles = [
        { name: 'index.md', isDirectory: () => false },
        { name: 'subdir', isDirectory: () => true },
      ];
      const mockSubdirFiles = [
        { name: 'index.md', isDirectory: () => false },
      ];

      vi.mocked(readdirSync)
        .mockImplementationOnce(() => mockFiles as any)
        .mockImplementationOnce(() => mockSubdirFiles as any);

      const files = findMarkdownFiles('content');

      expect(files).toEqual([
        'content/index.md',
        'content/subdir/index.md',
      ]);
      expect(readdirSync).toHaveBeenCalledTimes(3);
    });
  });

  describe('processMarkdownFile', () => {
    it('should process and transform markdown content', async () => {
      const { processMarkdownFile } = await import('../transform-blog-frontmatter');
      const mockContent = `---
title: Test Post
date: 2024-01-01
categories: Ernährung
---
Test content`;

      vi.mocked(readFileSync).mockReturnValue(mockContent);

      await processMarkdownFile('test.md');

      expect(writeFileSync).toHaveBeenCalledWith(
        'test.md',
        expect.stringContaining('title: Test Post')
      );
      expect(writeFileSync).toHaveBeenCalledWith(
        'test.md',
        expect.stringContaining('author: sandra-pfeiffer')
      );
    });

    it('should handle files without frontmatter', async () => {
      const { processMarkdownFile } = await import('../transform-blog-frontmatter');
      const mockContent = 'Test content without frontmatter';

      vi.mocked(readFileSync).mockReturnValue(mockContent);

      await processMarkdownFile('test.md');

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('No frontmatter found')
      );
      expect(writeFileSync).not.toHaveBeenCalled();
    });
  });

  describe('processAndRenameFile', () => {
    it('should process and rename .md to .mdx', async () => {
      const { processAndRenameFile } = await import('../transform-blog-frontmatter');
      const mockContent = `---
title: Test Post
---
Content`;

      vi.mocked(readFileSync).mockReturnValue(mockContent);

      await processAndRenameFile('test.md');

      expect(writeFileSync).toHaveBeenCalledWith(
        'test.mdx',
        expect.any(String)
      );
      expect(unlinkSync).toHaveBeenCalledWith('test.md');
    });

    it('should handle errors during renaming', async () => {
      const { processAndRenameFile } = await import('../transform-blog-frontmatter');
      vi.mocked(unlinkSync).mockImplementation(() => {
        throw new Error('Rename error');
      });

      await processAndRenameFile('test.md');

      expect(console.error).toHaveBeenCalledWith(
        'Error renaming file:',
        expect.any(Error)
      );
    });
  });
});
