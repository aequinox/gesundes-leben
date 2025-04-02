/**
 * @module ContentFileService
 * @description
 * Service for managing content files with operations for reading, writing,
 * and transforming markdown/MDX files. Follows SOLID principles and provides
 * a consistent API for file operations throughout the application.
 */

import { promises as fs } from "fs";
import path from "path";
import matter from "gray-matter";
import { handleAsync } from "@/core/errors/handleAsync";
import { ApplicationError, ErrorCode } from "@/core/errors/ApplicationError";
import type { IConfigService } from "@/core/config/ConfigService";
import { configService } from "@/core/config/ConfigService";

/**
 * Interface for content file service operations
 */
export interface IContentFileService {
  /**
   * Get the content directory path
   */
  getContentDir(): string;

  /**
   * Recursively find all markdown files in a directory
   */
  findMarkdownFiles(dir: string): Promise<string[]>;

  /**
   * Read a markdown file and parse its frontmatter
   */
  readMarkdownFile<T extends Record<string, unknown> = Record<string, unknown>>(
    filePath: string
  ): Promise<{ data: T; content: string; isEmpty: boolean }>;

  /**
   * Update frontmatter in a markdown file
   */
  updateFrontmatter<
    T extends Record<string, unknown> = Record<string, unknown>,
  >(
    filePath: string,
    transformer: (data: T) => T
  ): Promise<boolean>;

  /**
   * Write frontmatter and content to a markdown file
   */
  writeMarkdownFile<
    T extends Record<string, unknown> = Record<string, unknown>,
  >(
    filePath: string,
    data: T,
    content: string
  ): Promise<void>;

  /**
   * Convert a markdown file to MDX format
   */
  convertToMdx(mdPath: string): Promise<void>;
}

/**
 * Implementation of the content file service
 */
export class ContentFileService implements IContentFileService {
  constructor(private config: IConfigService = configService) {}

  /**
   * Get the content directory path
   */
  getContentDir(): string {
    return path.join(process.cwd(), "src/content");
  }

  /**
   * Recursively find all markdown files in a directory
   */
  async findMarkdownFiles(dir: string): Promise<string[]> {
    return handleAsync(async () => {
      try {
        const files: string[] = [];
        const entries = await fs.readdir(dir, { withFileTypes: true });

        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);

          if (entry.isDirectory()) {
            files.push(...(await this.findMarkdownFiles(fullPath)));
          } else if (entry.isFile() && /\.(md|mdx)$/.test(entry.name)) {
            files.push(fullPath);
          }
        }

        return files;
      } catch (error) {
        throw new ApplicationError(
          `Failed to find markdown files in ${dir}`,
          ErrorCode.SYSTEM_ERROR,
          { originalError: error }
        );
      }
    });
  }

  /**
   * Find all index.md files in a directory (for blog posts)
   */
  async findIndexMarkdownFiles(dir: string): Promise<string[]> {
    return handleAsync(async () => {
      try {
        const files: string[] = [];
        const entries = await fs.readdir(dir, { withFileTypes: true });

        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);

          if (entry.isDirectory()) {
            files.push(...(await this.findIndexMarkdownFiles(fullPath)));
          } else if (entry.isFile() && entry.name === "index.md") {
            files.push(fullPath);
          }
        }

        return files;
      } catch (error) {
        throw new ApplicationError(
          `Failed to find index markdown files in ${dir}`,
          ErrorCode.SYSTEM_ERROR,
          { originalError: error }
        );
      }
    });
  }

  /**
   * Read a markdown file and parse its frontmatter
   */
  async readMarkdownFile<
    T extends Record<string, unknown> = Record<string, unknown>,
  >(filePath: string): Promise<{ data: T; content: string; isEmpty: boolean }> {
    return handleAsync(async () => {
      try {
        const content = await fs.readFile(filePath, "utf-8");
        const { data, content: markdown } = matter(content);
        return {
          data: data as T,
          content: markdown,
          isEmpty: markdown.trim() === "",
        };
      } catch (error) {
        throw new ApplicationError(
          `Failed to read markdown file ${filePath}`,
          ErrorCode.SYSTEM_ERROR,
          { originalError: error }
        );
      }
    });
  }

  /**
   * Update frontmatter in a markdown file
   */
  async updateFrontmatter<
    T extends Record<string, unknown> = Record<string, unknown>,
  >(filePath: string, transformer: (data: T) => T): Promise<boolean> {
    return handleAsync(async () => {
      try {
        const { data, content } = await this.readMarkdownFile<T>(filePath);
        const updatedData = transformer(data);

        // Check if data was actually changed
        if (JSON.stringify(data) === JSON.stringify(updatedData)) {
          return false; // No changes made
        }

        const updatedContent = matter.stringify(content, updatedData);
        await fs.writeFile(filePath, updatedContent);
        return true; // Changes were made
      } catch (error) {
        throw new ApplicationError(
          `Failed to update frontmatter in ${filePath}`,
          ErrorCode.SYSTEM_ERROR,
          { originalError: error }
        );
      }
    });
  }

  /**
   * Write frontmatter and content to a markdown file
   */
  async writeMarkdownFile<
    T extends Record<string, unknown> = Record<string, unknown>,
  >(filePath: string, data: T, content: string): Promise<void> {
    return handleAsync(async () => {
      try {
        const fileContent = matter.stringify(content, data);
        await fs.writeFile(filePath, fileContent);
      } catch (error) {
        throw new ApplicationError(
          `Failed to write markdown file ${filePath}`,
          ErrorCode.SYSTEM_ERROR,
          { originalError: error }
        );
      }
    });
  }

  /**
   * Convert a markdown file to MDX format
   */
  async convertToMdx(mdPath: string): Promise<void> {
    return handleAsync(async () => {
      try {
        const mdxPath = mdPath.replace(/\.md$/, ".mdx");
        const content = await fs.readFile(mdPath, "utf-8");

        await fs.writeFile(mdxPath, content);
        await fs.unlink(mdPath);
      } catch (error) {
        throw new ApplicationError(
          `Failed to convert ${mdPath} to MDX`,
          ErrorCode.SYSTEM_ERROR,
          { originalError: error }
        );
      }
    });
  }
}

// Export singleton instance for convenience
export const contentFileService = new ContentFileService();
