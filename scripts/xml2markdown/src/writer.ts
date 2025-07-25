import type { Buffer } from "buffer";
import fs from "fs";
import path from "path";

import chalk from "chalk";
import * as luxon from "luxon";

import { XmlConversionError } from "./errors.js";
import { ImageProcessor } from "./image-processor.js";
import logger, { xmlLogger } from "./logger.js";
import * as settings from "./settings.js";
import * as shared from "./shared.js";
import type { Post, XmlConverterConfig } from "./types.js";

/**
 * Generate variable name for image imports (matches translator.js logic)
 */
function generateImageVariableName(filename: string): string {
  // Remove extension and clean up the filename
  const baseName = filename.replace(/\.[^/.]+$/, "");

  // Convert to camelCase and ensure it starts with a letter
  let varName = baseName
    .replace(/[^a-zA-Z0-9]/g, " ") // Replace non-alphanumeric with spaces
    .split(" ")
    .filter(word => word.length > 0)
    .map((word, index) => {
      if (index === 0) {
        return word.toLowerCase();
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join("");

  // Ensure it starts with a letter (prepend 'img' if it starts with a number)
  if (/^[0-9]/.test(varName)) {
    varName = `img${varName.charAt(0).toUpperCase()}${varName.slice(1)}`;
  }

  // Fallback if empty
  if (!varName) {
    varName = "blogImage";
  }

  return varName;
}

/**
 * Payload for processing posts or images
 */
interface Payload<T = unknown> {
  item: T;
  name: string;
  destinationPath: string;
  delay: number;
}

/**
 * Write markdown files and download images for posts
 * @throws {XmlConversionError} When file writing fails
 */
async function writeFilesPromise(
  posts: Post[],
  config: XmlConverterConfig
): Promise<void> {
  // Process images FIRST if AI enhancement is enabled
  if (config.generateAltTexts) {
    await writeImageFilesPromise(posts, config);
  }

  // Now write markdown files with updated metadata
  await writeMarkdownFilesPromise(posts, config);

  // Process remaining images if AI was not enabled
  if (!config.generateAltTexts) {
    await writeImageFilesPromise(posts, config);
  }
}

/**
 * Process an array of payloads with a given load function
 */
async function processPayloadsPromise<T>(
  payloads: Payload<T>[],
  loadFunc: (item: T) => Promise<string | Buffer>
): Promise<void> {
  const promises = payloads.map(
    payload =>
      new Promise((resolve, reject) => {
        setTimeout(async () => {
          try {
            const data = await loadFunc(payload.item);
            await writeFile(payload.destinationPath, data);
            logger.success(`${chalk.green("[OK]")} ${payload.name}`);
            resolve(undefined);
          } catch (error) {
            logger.error(
              `${chalk.red("[FAILED]")} ${payload.name} ${chalk.red(
                `(${(error as Error).toString()})`
              )}`
            );
            reject(error);
          }
        }, payload.delay);
      })
  );

  const results = await Promise.allSettled(promises);
  const failedCount = results.filter(
    result => result.status === "rejected"
  ).length;

  if (failedCount === 0) {
    logger.success("Done, got them all!");
  } else {
    logger.warn(`Done, but with ${chalk.red(`${failedCount} failed`)}.`);
  }
}

/**
 * Write data to a file, creating directories as needed
 * @throws {XmlConversionError} When file writing fails
 */
async function writeFile(
  destinationPath: string,
  data: string | Buffer
): Promise<void> {
  try {
    await fs.promises.mkdir(path.dirname(destinationPath), { recursive: true });
    await fs.promises.writeFile(destinationPath, data);
  } catch (error) {
    throw new XmlConversionError(`Failed to write file: ${destinationPath}`, {
      destinationPath,
      originalError: error,
    });
  }
}

/**
 * Write markdown files for posts
 */
async function writeMarkdownFilesPromise(
  posts: Post[],
  config: XmlConverterConfig
): Promise<void> {
  // package up posts into payloads
  let skipCount = 0;
  let delay = 0;
  const payloads = posts.flatMap(post => {
    const destinationPath = getPostPath(post, config);
    if (checkFile(destinationPath)) {
      // already exists, don't need to save again
      skipCount++;
      return [];
    } else {
      const payload: Payload<Post> = {
        item: post,
        name:
          (config.includeOtherTypes ? `${post.meta.type} - ` : "") +
          post.meta.slug,
        destinationPath,
        delay,
      };
      delay += settings.markdown_file_write_delay;
      return [payload];
    }
  });

  const remainingCount = payloads.length;
  if (remainingCount + skipCount === 0) {
    logger.info("\nNo posts to save...");
  } else {
    logger.info(
      `\nSaving ${remainingCount} posts (${skipCount} already exist)...`
    );
    await processPayloadsPromise(payloads, loadMarkdownFilePromise);
  }
}

/**
 * Load markdown content for a post with proper YAML formatting for Healthy Life blog
 */
async function loadMarkdownFilePromise(post: Post): Promise<string> {
  let output = "---\n";

  Object.entries(post.frontmatter).forEach(([key, value]) => {
    let outputValue;

    if (value === undefined || value === null) {
      return; // Skip undefined/null values
    }

    if (Array.isArray(value)) {
      if (value.length > 0) {
        // array of one or more strings - format as YAML array
        outputValue = value.reduce((list, item) => {
          const cleanItem = (item || "").toString().replace(/"/g, '\\"');
          return `${list}\n  - ${cleanItem}`;
        }, "");
      }
    } else if (typeof value === "object" && value !== null) {
      // Handle objects like heroImage: { src: "...", alt: "..." }
      if (key === "heroImage") {
        const heroImage = value as { src?: string; alt?: string };
        outputValue = `\n  src: ${heroImage.src || ""}\n  alt: ${(heroImage.alt || "").replace(/"/g, '\\"')}`;
      } else {
        // Generic object handling
        outputValue = `\n${Object.entries(value)
          .map(([objKey, objValue]) => {
            const cleanValue = (objValue || "").toString().replace(/"/g, '\\"');
            return `  ${objKey}: ${cleanValue}`;
          })
          .join("\n")}`;
      }
    } else if (typeof value === "boolean") {
      // Handle boolean values
      outputValue = value.toString();
    } else {
      // single string/number value
      const escapedValue = (value || "").toString().replace(/"/g, '\\"');
      if (escapedValue.length > 0) {
        // Don't quote boolean-like strings, numbers, or certain special values
        if (
          value === true ||
          value === false ||
          !isNaN(Number(value)) ||
          ["true", "false"].includes(escapedValue.toLowerCase())
        ) {
          outputValue = escapedValue;
        } else {
          outputValue = `"${escapedValue}"`;
        }
      }
    }

    if (outputValue !== undefined) {
      output += `${key}: ${outputValue}\n`;
    }
  });

  output += "---\n";

  // Add Image component import if we have images (after YAML frontmatter)
  if (post.imageImports && post.imageImports.length > 0) {
    output += "\n";
    output += 'import Image from "@/components/elements/Image.astro";\n';

    // Add individual image imports
    post.imageImports.forEach(imageImport => {
      output += `import ${imageImport.variable} from "${imageImport.path}";\n`;
    });
    output += "\n";
  }

  output += `\n${post.content}\n`;
  return output;
}

/**
 * Write image files for posts with AI enhancement
 */
async function writeImageFilesPromise(
  posts: Post[],
  config: XmlConverterConfig
): Promise<void> {
  // Initialize enhanced image processor
  const imageProcessor = new ImageProcessor(config);

  // Collect all unique image URLs from posts
  const imageUrlsMap = new Map<
    string,
    { postPath: string; imagesDir: string; originalFilename: string }
  >();
  let skipCount = 0;

  posts.forEach(post => {
    const postPath = getPostPath(post, config);
    const imagesDir = path.join(path.dirname(postPath), "images");

    post.meta.imageUrls.forEach(imageUrl => {
      if (!imageUrlsMap.has(imageUrl)) {
        const filename = shared.getFilenameFromUrl(imageUrl);
        const destinationPath = path.join(imagesDir, filename);

        if (checkFile(destinationPath)) {
          skipCount++;
        } else {
          imageUrlsMap.set(imageUrl, {
            postPath,
            imagesDir,
            originalFilename: filename,
          });
        }
      }
    });
  });

  const imageUrls = Array.from(imageUrlsMap.keys());
  const remainingCount = imageUrls.length;

  if (remainingCount + skipCount === 0) {
    xmlLogger.info("📷 No images to download and save...");
    return;
  }

  xmlLogger.info(
    `📥 Processing ${remainingCount} images (${skipCount} already exist)...`
  );

  // Process images by post to maintain directory organization
  const processedByPost = new Map<string, string[]>();

  // Group URLs by post directory
  imageUrls.forEach(url => {
    const info = imageUrlsMap.get(url);
    if (!info) {
      return;
    } // Skip if no info found

    if (!processedByPost.has(info.imagesDir)) {
      processedByPost.set(info.imagesDir, []);
    }
    processedByPost.get(info.imagesDir)?.push(url);
  });

  // Process each post's images
  for (const [imagesDir, urls] of processedByPost) {
    try {
      const processedImages = await imageProcessor.processImages(
        urls,
        imagesDir
      );

      // Save processed images to disk
      await Promise.all(
        processedImages.map(async processedImage => {
          if (processedImage.data && processedImage.data.length > 0) {
            try {
              await fs.promises.writeFile(
                processedImage.destinationPath,
                processedImage.data
              );
              xmlLogger.debug(`💾 Saved: ${processedImage.finalFilename}`);
            } catch (error) {
              xmlLogger.error(
                `❌ Failed to save ${processedImage.finalFilename}:`,
                error
              );
            }
          }
        })
      );

      // Update post metadata with AI-enhanced information
      await updatePostsWithImageMetadata(posts, processedImages, imagesDir);
    } catch (error) {
      xmlLogger.error(
        `❌ Failed to process images for directory ${imagesDir}:`,
        error
      );
    }
  }

  // Log final statistics
  const stats = imageProcessor.getStats();
  xmlLogger.info(
    `✅ Image processing complete - ${stats.processedCount} processed, ${stats.aiEnhancedCount} AI-enhanced`
  );
  if (stats.totalCreditsUsed > 0) {
    xmlLogger.info(`💳 Visionati credits used: ${stats.totalCreditsUsed}`);
  }
}

/**
 * Update posts with AI-enhanced image metadata
 */
async function updatePostsWithImageMetadata(
  posts: Post[],
  processedImages: {
    originalUrl: string;
    originalFilename: string;
    finalFilename: string;
    altText: string;
    destinationPath: string;
    data: Buffer;
    aiEnhanced: boolean;
    creditsUsed: number;
    error?: string;
  }[],
  imagesDir: string
): Promise<void> {
  // Import heroImage generator to re-generate after AI processing
  const { default: heroImageGenerator } = await import(
    "./frontmatter/heroImage.js"
  );

  // Create lookup map for processed images
  const imageMap = new Map<string, typeof processedImages[0]>();
  processedImages.forEach(img => {
    imageMap.set(img.originalUrl, img);
  });

  // Update posts that contain these images
  posts.forEach(post => {
    // Find posts that have images in this directory by checking if any image paths match
    const postHasImagesInDir = post.meta.imageUrls.some(url => {
      const processedImage = imageMap.get(url);
      return (
        processedImage &&
        path.dirname(processedImage.destinationPath) === imagesDir
      );
    });

    // Only update posts that match this images directory
    if (postHasImagesInDir) {
      let heroImageUpdated = false;

      post.meta.imageUrls.forEach((imageUrl, _index) => {
        const processedImage = imageMap.get(imageUrl);
        if (processedImage) {
          // Store AI-enhanced metadata for use in content generation
          if (!post.meta.aiImageMetadata) {
            post.meta.aiImageMetadata = new Map();
          }

          post.meta.aiImageMetadata.set(imageUrl, {
            altText: processedImage.altText,
            filename: processedImage.finalFilename,
            aiEnhanced: processedImage.aiEnhanced,
            creditsUsed: processedImage.creditsUsed,
          });

          // Update imageImports array with AI-enhanced filenames
          if (post.imageImports && processedImage.aiEnhanced) {
            // Log for debugging
            xmlLogger.debug(
              `🔍 Looking for imports matching: ${processedImage.originalFilename}`
            );

            post.imageImports.forEach(imageImport => {
              // Check if this import matches the original filename
              const originalFilename =
                processedImage.originalFilename ||
                processedImage.originalUrl.split("/").pop();

              // More flexible matching to handle different path formats
              const importFilename =
                imageImport.filename || imageImport.path.split("/").pop();
              const matches =
                importFilename === originalFilename ||
                imageImport.path.includes(originalFilename || "") ||
                (importFilename &&
                  originalFilename &&
                  importFilename.toLowerCase() ===
                    originalFilename.toLowerCase());

              if (matches) {
                // Save old variable name for content replacement
                const oldVariable = imageImport.variable;
                // Update to use AI-enhanced filename
                const oldPath = imageImport.path;
                imageImport.path = `./images/${processedImage.finalFilename}`;
                imageImport.filename = processedImage.finalFilename;
                // Regenerate variable name for new filename
                const newVariable = generateImageVariableName(
                  processedImage.finalFilename
                );
                imageImport.variable = newVariable;

                // Update variable references in post content
                if (post.content && oldVariable !== newVariable) {
                  // Replace variable references in content (e.g., src={oldVariable} -> src={newVariable})
                  const variableRegex = new RegExp(`\\b${oldVariable}\\b`, "g");
                  const replacementCount = (
                    post.content.match(variableRegex) || []
                  ).length;
                  post.content = post.content.replace(
                    variableRegex,
                    newVariable
                  );
                  xmlLogger.info(
                    `📝 Updated content variables (${replacementCount} occurrences):`,
                    {
                      oldVariable,
                      newVariable,
                      originalFile: originalFilename,
                      aiFile: processedImage.finalFilename,
                    }
                  );
                }

                xmlLogger.debug(
                  `Updated image import: ${oldPath} → ${imageImport.path}`
                );
              }
            });
          }

          // Check if this is the hero image and update cover image filename
          if (
            post.meta.coverImage &&
            (imageUrl.endsWith(post.meta.coverImage) ||
              imageUrl.includes(post.meta.coverImage))
          ) {
            post.meta.coverImage = processedImage.finalFilename;
            heroImageUpdated = true;
          }
        }
      });

      // Re-generate heroImage frontmatter after AI processing if hero image was updated
      if (heroImageUpdated && post.frontmatter) {
        const newHeroImage = heroImageGenerator(post);
        post.frontmatter.heroImage = newHeroImage;
        xmlLogger.info(`✨ Updated heroImage for ${post.meta.slug}:`, {
          oldFilename: "Depositphotos_97583692.jpg",
          newFilename: post.meta.coverImage,
          heroImage: newHeroImage,
        });
      }
    }
  });
}

/**
 * Get destination path for a post
 */
function getPostPath(post: Post, config: XmlConverterConfig): string {
  // Use pubDatetime field instead of date (matches FRONTMATTER_FIELDS config)
  const dateValue = (post.frontmatter.pubDatetime ||
    post.frontmatter.date) as string;

  let dt;
  if (settings.custom_date_formatting) {
    dt = luxon.DateTime.fromFormat(dateValue, settings.custom_date_formatting);
  } else {
    dt = luxon.DateTime.fromISO(dateValue);
  }

  // If date is invalid, use current date as fallback
  if (!dt.isValid) {
    logger.warn(
      `Invalid date for post ${post.meta.slug}: ${dateValue}. Using current date as fallback.`
    );
    dt = luxon.DateTime.now();
  }

  // start with base output dir
  const pathSegments = [config.output];

  // create segment for post type if we're dealing with more than just "post"
  if (config.includeOtherTypes) {
    pathSegments.push(post.meta.type);
  }

  if (config.yearFolders) {
    pathSegments.push(dt.toFormat("yyyy"));
  }

  if (config.monthFolders) {
    pathSegments.push(dt.toFormat("LL"));
  }

  // create slug fragment, possibly date prefixed
  let slugFragment = post.meta.slug;
  if (config.prefixDate) {
    slugFragment = `${dt.toFormat("yyyy-LL-dd")}-${slugFragment}`;
  }

  // use slug fragment as folder or filename as specified
  if (config.postFolders) {
    pathSegments.push(slugFragment, "index.mdx");
  } else {
    pathSegments.push(`${slugFragment}.mdx`);
  }

  return path.join(...pathSegments);
}

/**
 * Check if a file exists
 */
function checkFile(path: string): boolean {
  return fs.existsSync(path);
}

export { writeFilesPromise };
