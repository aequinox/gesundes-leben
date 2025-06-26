import { vi, describe, beforeEach, it, expect, beforeAll } from 'vitest';
import { 
  getAuthorEntry,
  getAllAuthors,
  getAuthorData,
  resolveAuthors,
  getAuthorDisplayName
} from '../authors';
import type { Author } from '../types';

describe('authors utilities', () => {
  const mockGetEntry = vi.fn();
  const mockGetCollection = vi.fn();
  const mockLoggerError = vi.fn();

  beforeAll(() => {
    vi.mock('astro:content', () => ({
      getEntry: mockGetEntry,
      getCollection: mockGetCollection
    }));

    vi.mock('../logger', () => ({
      logger: {
        error: mockLoggerError
      }
    }));
  });

  const mockAuthor: Author = {
    id: 'test-author',
    collection: 'authors',
    data: {
      name: 'Test Author',
      bio: 'Test bio',
      avatar: '/test-avatar.jpg',
    },
    body: ''
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAuthorEntry', () => {
    it('should return author entry by string slug', async () => {
      mockGetEntry.mockResolvedValue(mockAuthor);

      const result = await getAuthorEntry('test-author');
      expect(result).toEqual(mockAuthor);
      expect(mockGetEntry).toHaveBeenCalledWith('authors', 'test-author');
    });

    it('should return author entry by reference object', async () => {
      mockGetEntry.mockResolvedValue(mockAuthor);

      const result = await getAuthorEntry({ collection: 'authors', id: 'test-author' });
      expect(result).toEqual(mockAuthor);
      expect(mockGetEntry).toHaveBeenCalledWith('authors', 'test-author');
    });

    it('should return null and log error when getEntry fails', async () => {
      const testError = new Error('Test error');
      mockGetEntry.mockRejectedValue(testError);

      const result = await getAuthorEntry('test-author');
      expect(result).toBeNull();
      expect(mockLoggerError).toHaveBeenCalledWith(
        expect.stringContaining('Failed to fetch author with identifier: test-author')
      );
    });
  });

  describe('getAllAuthors', () => {
    it('should return all authors', async () => {
      mockGetCollection.mockResolvedValue([mockAuthor]);

      const result = await getAllAuthors();
      expect(result).toEqual([mockAuthor]);
      expect(mockGetCollection).toHaveBeenCalledWith('authors');
    });

    it('should return empty array when getCollection fails', async () => {
      const testError = new Error('Test error');
      mockGetCollection.mockRejectedValue(testError);

      const result = await getAllAuthors();
      expect(result).toEqual([]);
      // expect(mockLoggerError).toHaveBeenCalledWith(
      //   expect.stringContaining('Failed to fetch authors collection')
      // );
    });

    it('should return empty array for invalid collection format', async () => {
      mockGetCollection.mockResolvedValue({ invalid: 'format' });

      const result = await getAllAuthors();
      expect(result).toEqual([]);
      expect(mockLoggerError).toHaveBeenCalledWith('Invalid authors collection format');
    });
  });

  describe('getAuthorData', () => {
    it('should return author data by slug', async () => {
      mockGetEntry.mockResolvedValue(mockAuthor);

      const result = await getAuthorData('test-author');
      expect(result).toEqual(mockAuthor.data);
    });

    it('should return null when author not found', async () => {
      mockGetEntry.mockResolvedValue(null);

      const result = await getAuthorData('test-author');
      expect(result).toBeNull();
    });
  });

  describe('resolveAuthors', () => {
    it('should resolve multiple authors in parallel', async () => {
      mockGetEntry.mockImplementation((collection: string, id: string) => 
        Promise.resolve({ ...mockAuthor, id, collection })
      );

      const authors = [
        'author1', 
        'author2', 
        { collection: 'authors', id: 'author3' } as const
      ];
      const result = await resolveAuthors(authors);
      
      expect(result).toHaveLength(3);
      expect(result[0]?.id).toBe('author1');
      expect(result[1]?.id).toBe('author2');
      expect(result[2]?.id).toBe('author3');
    });
  });

  describe('getAuthorDisplayName', () => {
    it('should return name from author data when available', async () => {
      mockGetEntry.mockResolvedValue(mockAuthor);

      const result = await getAuthorDisplayName('test-author');
      expect(result).toBe('Test Author');
    });

    it('should format slug as fallback name', async () => {
      mockGetEntry.mockResolvedValue({ 
        ...mockAuthor, 
        data: { ...mockAuthor.data, name: undefined } 
      });

      const result = await getAuthorDisplayName('test-author-name');
      expect(result).toBe('Test Author Name');
    });
  });
});
