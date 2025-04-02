import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock dependencies
vi.mock('@/services/content/ContentFileService', () => ({
  contentFileService: {
    getContentDir: vi.fn(() => 'test/content'),
    findIndexMarkdownFiles: vi.fn(),
    readMarkdownFile: vi.fn(),
    writeMarkdownFile: vi.fn(),
    convertToMdx: vi.fn(),
  },
}));

vi.mock('@/services/content/FrontmatterService', () => ({
  frontmatterService: {
    transformBlogFrontmatter: vi.fn(),
    generateDescription: vi.fn(),
    validateCategory: vi.fn(),
    capitalizeFirstLetter: vi.fn(),
  },
  BlogFrontmatter: {},
}));

vi.mock('@/core/errors/handleAsync', () => ({
  handleAsync: vi.fn((fn) => fn()),
}));

// Import after mocks
import * as transformBlogFrontmatter from '../transform-blog-frontmatter';
import { contentFileService } from '@/services/content/ContentFileService';
import { frontmatterService } from '@/services/content/FrontmatterService';
import type { BlogFrontmatter } from '@/services/content/FrontmatterService';

describe('transform-blog-frontmatter', () => {
  const { processMarkdownFile, processAndRenameFile, main } = transformBlogFrontmatter;
  beforeEach(() => {
    vi.clearAllMocks();
    console.log = vi.fn();
    console.error = vi.fn();
  });

  afterEach(() => {
    vi.resetModules();
  });

  describe('processMarkdownFile', () => {
    it('should process and transform markdown content', async () => {
      const mockData: BlogFrontmatter = {
        title: 'Test Post',
        date: '2024-01-01',
        categories: ['Ernährung'],
      };
      
      const mockTransformed: BlogFrontmatter = {
        id: 'mock-uuid',
        title: 'Test Post',
        author: 'sandra-pfeiffer',
        slug: 'test-post',
        description: 'Test description',
        pubDatetime: '2024-01-01T00:00:00.000Z',
        modDatetime: '2024-01-01T00:00:00.000Z',
        draft: true,
        featured: false,
        group: 'fragezeiten',
        categories: ['Ernährung'],
        tags: [],
        favorites: {},
      };

      vi.mocked(contentFileService.readMarkdownFile).mockResolvedValue({
        data: mockData,
        content: 'Test content',
        isEmpty: false,
      });

      vi.mocked(frontmatterService.transformBlogFrontmatter).mockResolvedValue(mockTransformed);

      await processMarkdownFile('test.md');

      expect(contentFileService.readMarkdownFile).toHaveBeenCalledWith('test.md');
      expect(frontmatterService.transformBlogFrontmatter).toHaveBeenCalledWith(
        mockData,
        'Test content'
      );
      expect(contentFileService.writeMarkdownFile).toHaveBeenCalledWith(
        'test.md',
        mockTransformed,
        'Test content'
      );
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('Successfully processed')
      );
    });

    it('should handle files without title in frontmatter', async () => {
      vi.mocked(contentFileService.readMarkdownFile).mockResolvedValue({
        data: {} as BlogFrontmatter,
        content: 'Test content',
        isEmpty: false,
      });

      await processMarkdownFile('test.md');

      expect(frontmatterService.transformBlogFrontmatter).not.toHaveBeenCalled();
      expect(contentFileService.writeMarkdownFile).not.toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('No title found')
      );
    });

    it('should handle errors gracefully', async () => {
      vi.mocked(contentFileService.readMarkdownFile).mockRejectedValue(new Error('Test error'));

      await processMarkdownFile('test.md');

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Error processing'),
        expect.any(Error)
      );
    });
  });

  describe('processAndRenameFile', () => {
    it('should process and convert .md to .mdx', async () => {
      vi.mocked(contentFileService.readMarkdownFile).mockResolvedValue({
        data: { title: 'Test Post' } as BlogFrontmatter,
        content: 'Test content',
        isEmpty: false,
      });

      await processAndRenameFile('test.md');

      expect(contentFileService.convertToMdx).toHaveBeenCalledWith('test.md');
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('Successfully converted')
      );
    });

    it('should handle errors gracefully', async () => {
      vi.mocked(contentFileService.readMarkdownFile).mockRejectedValue(new Error('Test error'));

      await processAndRenameFile('test.md');

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Error processing'),
        expect.any(Error)
      );
    });
  });

  describe('main', () => {
    it('should process all markdown files', async () => {
      const mockFiles = [
        'test/content/file1/index.md',
        'test/content/file2/index.md',
      ];

      vi.mocked(contentFileService.findIndexMarkdownFiles).mockResolvedValue(mockFiles);
      vi.mocked(contentFileService.readMarkdownFile).mockResolvedValue({
        data: { title: 'Test Post' } as BlogFrontmatter,
        content: 'Test content',
        isEmpty: false,
      });

      await main();

      expect(contentFileService.findIndexMarkdownFiles).toHaveBeenCalledWith('test/content');
      expect(contentFileService.convertToMdx).toHaveBeenCalledTimes(2);
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Found 2 markdown files'));
    });

    it('should handle errors gracefully', async () => {
      vi.mocked(contentFileService.findIndexMarkdownFiles).mockRejectedValue(new Error('Test error'));

      // Mock process.exit to prevent test from exiting
      const mockExit = vi.spyOn(process, 'exit').mockImplementation((() => {}) as any);

      await main();

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Fatal error:'),
        expect.any(Error)
      );
      expect(mockExit).toHaveBeenCalledWith(1);

      mockExit.mockRestore();
    });
  });
});
