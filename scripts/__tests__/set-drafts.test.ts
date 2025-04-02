import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import path from 'path';

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

// Import after mocks
import * as setDrafts from '../set-drafts';
import { contentFileService } from '@/services/content/ContentFileService';

describe('set-drafts', () => {
  const { updateFrontmatter, main } = setDrafts;
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

      await updateFrontmatter('test/content/relative/path/file.md');

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

      await updateFrontmatter('test/content/relative/path/file.md');

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

      await updateFrontmatter('test/content/file.md');

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('✗ Error processing'),
        expect.any(Error)
      );
    });
  });

  describe('main', () => {
    it('should process all markdown files', async () => {
      const mockFiles = [
        'test/content/file1.md',
        'test/content/file2.mdx',
      ];

      vi.mocked(contentFileService.findMarkdownFiles).mockResolvedValue(mockFiles);
      vi.mocked(contentFileService.updateFrontmatter).mockResolvedValue(true);

      await main();

      expect(contentFileService.findMarkdownFiles).toHaveBeenCalledWith('test/content');
      expect(contentFileService.updateFrontmatter).toHaveBeenCalledTimes(2);
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Found 2 markdown files'));
    });

    it('should handle errors gracefully', async () => {
      vi.mocked(contentFileService.findMarkdownFiles).mockRejectedValue(new Error('Test error'));

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
