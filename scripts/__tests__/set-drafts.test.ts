import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { promises as fs } from 'fs';
import path from 'path';
import matter from 'gray-matter';

// Mock fs and path
vi.mock('fs', () => ({
  promises: {
    readdir: vi.fn(),
    readFile: vi.fn(),
    writeFile: vi.fn(),
  },
}));

vi.mock('path', async () => {
  const actual = await vi.importActual('path') as typeof import('path');
  return {
    ...actual,
    join: vi.fn((...args) => args.join('/')),
    relative: vi.fn((from, to) => to),
  };
});

// Import after mocks
const { getMarkdownFiles, updateFrontmatter } = await import('../set-drafts');

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

  describe('getMarkdownFiles', () => {
    it('should recursively find markdown files', async () => {
      const mockFiles = [
        { name: 'file1.md', isDirectory: () => false, isFile: () => true },
        { name: 'file2.mdx', isDirectory: () => false, isFile: () => true },
        { name: 'subdir', isDirectory: () => true, isFile: () => false },
      ];

      const mockSubdirFiles = [
        { name: 'file3.md', isDirectory: () => false, isFile: () => true },
      ];

      // Mock readdir to return different values based on path
      vi.mocked(fs.readdir).mockImplementation((dirPath: any) => {
        if (dirPath.includes('subdir')) {
          return Promise.resolve(mockSubdirFiles as any);
        }
        return Promise.resolve(mockFiles as any);
      });

      const result = await getMarkdownFiles('test/dir');

      expect(result).toEqual([
        'test/dir/file1.md',
        'test/dir/file2.mdx',
        'test/dir/subdir/file3.md',
      ]);
      expect(fs.readdir).toHaveBeenCalledTimes(2);
    });

    it('should ignore non-markdown files', async () => {
      const mockFiles = [
        { name: 'file1.md', isDirectory: () => false, isFile: () => true },
        { name: 'file2.txt', isDirectory: () => false, isFile: () => true },
        { name: 'file3.js', isDirectory: () => false, isFile: () => true },
      ];

      vi.mocked(fs.readdir).mockResolvedValue(mockFiles as any);

      const result = await getMarkdownFiles('test/dir');

      expect(result).toEqual(['test/dir/file1.md']);
      expect(fs.readdir).toHaveBeenCalledTimes(1);
    });
  });

  describe('updateFrontmatter', () => {
    it('should update draft to true if not already set', async () => {
      const mockContent = matter.stringify('# Test Content', {
        title: 'Test',
        draft: false,
      });

      vi.mocked(fs.readFile).mockResolvedValue(mockContent);

      await updateFrontmatter('test/file.md');

      const expectedContent = matter.stringify('# Test Content', {
        title: 'Test',
        draft: true,
      });

      expect(fs.writeFile).toHaveBeenCalledWith(
        'test/file.md',
        expectedContent
      );
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('✓ Updated')
      );
    });

    it('should skip files that already have draft: true', async () => {
      const mockContent = matter.stringify('# Test Content', {
        title: 'Test',
        draft: true,
      });

      vi.mocked(fs.readFile).mockResolvedValue(mockContent);

      await updateFrontmatter('test/file.md');

      expect(fs.writeFile).not.toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('⚡ Skipped')
      );
    });

    it('should handle errors gracefully', async () => {
      vi.mocked(fs.readFile).mockRejectedValue(new Error('Test error'));

      await updateFrontmatter('test/file.md');

      expect(fs.writeFile).not.toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('✗ Error processing'),
        expect.any(Error)
      );
    });
  });
});
