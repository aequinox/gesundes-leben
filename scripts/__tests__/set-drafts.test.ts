import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import path from 'path';

// Import modules first so we can spy on them
import * as setDrafts from '../set-drafts';
import { contentFileService } from '@/services/content/ContentFileService';

// Mock dependencies
vi.mock('@/services/content/ContentFileService', () => ({
  contentFileService: {
    getContentDir: vi.fn(() => 'test/content'),
    findMarkdownFiles: vi.fn(),
    updateFrontmatter: vi.fn(),
  },
}));

vi.mock('@/core/errors/handleAsync', () => ({
  handleAsync: vi.fn((fn) => fn()),
}));

vi.mock('path', () => ({
  relative: vi.fn((from, to) => 'relative/path/file.md'),
  join: vi.fn((...args) => args.join('/')),
}));

describe('set-drafts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Restore console methods if they were mocked
    console.log = vi.fn();
    console.error = vi.fn();
  });

  afterEach(() => {
    vi.resetModules();
  });

  describe('updateFrontmatter', () => {
    it('should update draft to true if not already set', async () => {
      vi.mocked(contentFileService.updateFrontmatter).mockResolvedValue(true);
      vi.mocked(contentFileService.getContentDir).mockReturnValue('test/content');

      const result = await setDrafts.updateFrontmatter('test/content/relative/path/file.md');

      expect(result).toBe(true);
      expect(contentFileService.updateFrontmatter).toHaveBeenCalledWith(
        'test/content/relative/path/file.md',
        expect.any(Function)
      );
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('✓ Updated')
      );
    });

    it('should skip files that already have draft: true', async () => {
      vi.mocked(contentFileService.updateFrontmatter).mockResolvedValue(false);
      vi.mocked(contentFileService.getContentDir).mockReturnValue('test/content');

      const result = await setDrafts.updateFrontmatter('test/content/relative/path/file.md');

      expect(result).toBe(false);
      expect(contentFileService.updateFrontmatter).toHaveBeenCalledWith(
        'test/content/relative/path/file.md',
        expect.any(Function)
      );
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('⚡ Skipped')
      );
    });

    it('should handle errors gracefully', async () => {
      vi.mocked(contentFileService.updateFrontmatter).mockRejectedValue(new Error('Test error'));
      vi.mocked(contentFileService.getContentDir).mockReturnValue('test/content');

      const result = await setDrafts.updateFrontmatter('test/content/file.md');

      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('✗ Error processing'),
        expect.any(Error)
      );
    });
  });

  describe('main', () => {
    it('should process all markdown files', async () => {
      // Create mock files
      const mockFiles = [
        'test/content/file1.md',
        'test/content/file2.mdx',
      ];

      // Mock the findMarkdownFiles function to return our mock files
      vi.mocked(contentFileService.findMarkdownFiles).mockResolvedValue(mockFiles);
      
      // Mock updateFrontmatter to return true (indicating files were updated)
      vi.mocked(contentFileService.updateFrontmatter).mockResolvedValue(true);

      // Create a spy on the updateFrontmatter function
      const updateFrontmatterSpy = vi.spyOn(setDrafts, 'updateFrontmatter');
      updateFrontmatterSpy.mockResolvedValue(true);

      // Run the main function
      await setDrafts.main();

      // Verify findMarkdownFiles was called with the content directory
      expect(contentFileService.findMarkdownFiles).toHaveBeenCalledWith('test/content');
      
      // Verify updateFrontmatter was called for each file
      expect(updateFrontmatterSpy).toHaveBeenCalledTimes(2);
      expect(updateFrontmatterSpy).toHaveBeenCalledWith('test/content/file1.md', contentFileService);
      expect(updateFrontmatterSpy).toHaveBeenCalledWith('test/content/file2.mdx', contentFileService);
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Found 2 markdown files'));
    });

    it('should handle errors gracefully', async () => {
      vi.mocked(contentFileService.findMarkdownFiles).mockRejectedValue(new Error('Test error'));

      // Mock process.exit to prevent test from exiting
      const mockExit = vi.spyOn(process, 'exit').mockImplementation((() => {}) as any);

      await setDrafts.main();

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Fatal error:'),
        expect.any(Error)
      );
      expect(mockExit).toHaveBeenCalledWith(1);

      mockExit.mockRestore();
    });
  });
});
