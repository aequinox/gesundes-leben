import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { loggerService } from '../logger/LoggerService';
import { TransformationError } from '../error/ErrorService';

/**
 * Interface for frontmatter data.
 */
export interface Frontmatter {
  [key: string]: any;
}

/**
 * Service for handling frontmatter operations.
 */
export class FrontmatterService {
  /**
   * Extracts frontmatter from a markdown file.
   * @param content - The content of the markdown file.
   * @returns The extracted frontmatter.
   */
  public extractFrontmatter(content: string): Frontmatter {
    try {
      const frontmatterRegex = /^---\n([\s\S]*?)\n---/;
      const match = content.match(frontmatterRegex);
      
      if (!match) {
        return {};
      }
      
      const frontmatterYaml = match[1];
      return yaml.load(frontmatterYaml) as Frontmatter;
    } catch (error) {
      loggerService.error('Error extracting frontmatter', error);
      throw new TransformationError('Failed to extract frontmatter', error);
    }
  }

  /**
   * Updates frontmatter in a markdown file.
   * @param content - The content of the markdown file.
   * @param frontmatter - The updated frontmatter.
   * @returns The content with updated frontmatter.
   */
  public updateFrontmatter(content: string, frontmatter: Frontmatter): string {
    try {
      const frontmatterYaml = yaml.dump(frontmatter, {
        indent: 2,
        lineWidth: -1,
        sortKeys: false,
        noRefs: true,
        quotingType: '"',
      });
      
      const updatedContent = content.replace(
        /^---\n[\s\S]*?\n---/,
        `---\n${frontmatterYaml}---`
      );
      
      return updatedContent;
    } catch (error) {
      loggerService.error('Error updating frontmatter', error);
      throw new TransformationError('Failed to update frontmatter', error);
    }
  }

  /**
   * Ensures that a blog post has a heroImage field.
   * @param filePath - The path to the blog post file.
   * @returns True if the file was modified, false otherwise.
   */
  public ensureHeroImage(filePath: string): boolean {
    try {
      // Read the file
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Extract frontmatter
      const frontmatter = this.extractFrontmatter(content);
      
      // Check if heroImage is missing
      if (!frontmatter.heroImage) {
        // Get the directory of the file
        const dir = path.dirname(filePath);
        
        // Check if there's an images directory
        const imagesDir = path.join(dir, 'images');
        
        if (fs.existsSync(imagesDir)) {
          // Get all image files in the directory
          const imageFiles = fs.readdirSync(imagesDir)
            .filter(file => {
              const ext = path.extname(file).toLowerCase();
              return ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'].includes(ext);
            });
          
          if (imageFiles.length > 0) {
            // Use the first image as heroImage
            const imageFile = imageFiles[0];
            
            // Add heroImage to frontmatter
            frontmatter.heroImage = {
              src: `./images/${imageFile}`,
              alt: frontmatter.title || '',
            };
            
            // Update the file with new frontmatter
            const updatedContent = this.updateFrontmatter(content, frontmatter);
            fs.writeFileSync(filePath, updatedContent, 'utf8');
            
            loggerService.success(`Added heroImage to ${filePath}`);
            return true;
          } else {
            loggerService.warn(`No image files found in ${imagesDir}`);
          }
        } else {
          loggerService.warn(`Images directory not found: ${imagesDir}`);
        }
      }
      
      return false;
    } catch (error) {
      loggerService.error(`Error ensuring heroImage for ${filePath}`, error);
      return false;
    }
  }

  /**
   * Validates frontmatter against a schema.
   * @param frontmatter - The frontmatter to validate.
   * @param requiredFields - Array of required field names.
   * @returns Array of validation errors, empty if valid.
   */
  public validateFrontmatter(frontmatter: Frontmatter, requiredFields: string[]): string[] {
    const errors: string[] = [];
    
    for (const field of requiredFields) {
      if (!frontmatter[field]) {
        errors.push(`Missing required field: ${field}`);
      }
    }
    
    return errors;
  }
}

// Export a singleton instance of the FrontmatterService
export const frontmatterService = new FrontmatterService();
