import * as path from "path";
import * as fs from "fs";

/**
 * Utility functions for file path operations
 */
export class PathUtils {
  /**
   * Normalize a file or folder path
   * @param value Path to normalize
   * @returns Normalized path
   */
  public static normalizePath(value: string): string {
    return path.normalize(value);
  }

  /**
   * Check if a file exists
   * @param filePath Path to check
   * @returns Whether file exists
   */
  public static fileExists(filePath: string): boolean {
    try {
      return fs.existsSync(filePath) && fs.statSync(filePath).isFile();
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if a directory exists
   * @param dirPath Path to check
   * @returns Whether directory exists
   */
  public static directoryExists(dirPath: string): boolean {
    try {
      return fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory();
    } catch (error) {
      return false;
    }
  }

  /**
   * Create a directory if it doesn't exist
   * @param dirPath Path to create
   * @returns Whether directory exists or was created
   */
  public static ensureDirectoryExists(dirPath: string): boolean {
    try {
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get the directory name from a path
   * @param filePath Path to get directory from
   * @returns Directory name
   */
  public static getDirname(filePath: string): string {
    return path.dirname(filePath);
  }

  /**
   * Get the filename from a path
   * @param filePath Path to get filename from
   * @returns Filename
   */
  public static getFilename(filePath: string): string {
    return path.basename(filePath);
  }

  /**
   * Get the extension from a path
   * @param filePath Path to get extension from
   * @returns Extension
   */
  public static getExtension(filePath: string): string {
    return path.extname(filePath);
  }

  /**
   * Join path segments
   * @param paths Path segments to join
   * @returns Joined path
   */
  public static joinPaths(...paths: string[]): string {
    return path.join(...paths);
  }

  /**
   * Resolve path to absolute path
   * @param paths Path segments to resolve
   * @returns Resolved path
   */
  public static resolvePath(...paths: string[]): string {
    return path.resolve(...paths);
  }
}
