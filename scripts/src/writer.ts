import axios, { type AxiosRequestConfig } from 'axios';
import chalk from 'chalk'; // Using chalk v4 types
import fs from 'fs';
import http from 'http';
import https from 'https';
import { DateTime } from 'luxon';
import path from 'path';
import sharp from 'sharp';
import yaml from 'js-yaml'; // For reliable frontmatter generation

// Assuming types exist or are defined elsewhere for these:
import * as shared from './shared.ts';
import * as settings from './settings.ts'; // Assuming settings exports constants
import { ConversionError } from './errors.ts';
import * as postProcessor from './post-processor.ts'; // Import from TS file

// --- Interfaces and Types ---

// Basic Post structure assumption based on usage
interface PostMeta {
  type: string;
  slug: string;
  imageUrls: string[];
}

interface PostFrontmatter {
  date: string; // Assuming date is always present and a string
  [key: string]: any; // Allow other frontmatter properties
}

interface Post {
  meta: PostMeta;
  frontmatter: PostFrontmatter;
  content: string;
}

// Configuration structure assumption based on usage
interface Config {
  output: string;
  includeOtherTypes?: boolean;
  yearFolders?: boolean;
  monthFolders?: boolean;
  prefixDate?: boolean;
  postFolders?: boolean;
  // Add other config properties if known
}

// Payload for processing items (markdown or images)
interface Payload<T> {
  item: T;
  name: string;
  destinationPath: string;
  delay: number;
}

type MarkdownPayload = Payload<Post>;
type ImagePayload = Payload<string>; // Image URL is the item

interface ImageDimensions {
  width?: number;
  height?: number;
}

// --- Global Augmentation for imageDimensions ---

// Extend the NodeJS Global interface
declare global {
  // eslint-disable-next-line no-var
  var imageDimensions: Map<string, ImageDimensions>;
}

// Initialize the global map if it doesn't exist
if (!global.imageDimensions) {
  global.imageDimensions = new Map<string, ImageDimensions>();
}


// --- Utility Functions ---

/**
 * Checks if a file exists synchronously.
 * @param filePath - Path to check.
 * @returns True if the file exists, false otherwise.
 */
function checkFile(filePath: string): boolean {
  return fs.existsSync(filePath);
}

/**
 * Writes data to a file, creating parent directories if they don't exist.
 * @param destinationPath - Full path where the file should be written.
 * @param data - Data to write (string or Buffer).
 * @throws {ConversionError} If writing fails.
 */
async function writeFile(destinationPath: string, data: string | Buffer): Promise<void> {
  try {
    await fs.promises.mkdir(path.dirname(destinationPath), { recursive: true });
    await fs.promises.writeFile(destinationPath, data);
  } catch (error: any) {
    throw new ConversionError(`Failed to write file: ${destinationPath}`, error);
  }
}

/**
 * Calculates the destination path for a post based on configuration.
 * @param post - The post object.
 * @param config - Configuration options.
 * @returns The calculated destination file path.
 */
function getPostPath(post: Post, config: Config): string {
  let dt: DateTime;
  try {
    // Use custom format if provided, otherwise default to ISO
    if (settings.custom_date_formatting && typeof settings.custom_date_formatting === 'string') {
      dt = DateTime.fromFormat(post.frontmatter.date, settings.custom_date_formatting);
    } else {
      dt = DateTime.fromISO(post.frontmatter.date);
    }
    if (!dt.isValid) {
        throw new Error(`Invalid date format for post ${post.meta.slug}: ${post.frontmatter.date}`);
    }
  } catch (e: any) {
      console.warn(chalk.yellow(`[WARN] Could not parse date "${post.frontmatter.date}" for post "${post.meta.slug}". Using current date for path generation. Error: ${e.message}`));
      dt = DateTime.now(); // Fallback to current date
  }


  const pathSegments: string[] = [config.output];

  if (config.includeOtherTypes) {
    pathSegments.push(post.meta.type);
  }

  if (config.yearFolders) {
    pathSegments.push(dt.toFormat('yyyy'));
  }

  if (config.monthFolders) {
    pathSegments.push(dt.toFormat('LL')); // Locale-dependent month format (e.g., '04')
  }

  let slugFragment = post.meta.slug;
  if (config.prefixDate) {
    slugFragment = `${dt.toFormat('yyyy-LL-dd')}-${slugFragment}`;
  }

  if (config.postFolders) {
    pathSegments.push(slugFragment, 'index.mdx'); // Assuming .mdx extension
  } else {
    pathSegments.push(`${slugFragment}.mdx`); // Assuming .mdx extension
  }

  return path.join(...pathSegments);
}

// --- Payload Processing ---

/**
 * Processes an array of payloads concurrently with delays.
 * @param payloads - Array of payloads to process.
 * @param loadFunc - Async function to load data for a single payload item.
 * @param itemType - String description of the item type for logging (e.g., "post", "image").
 */
async function processPayloads<T>(
  payloads: Payload<T>[],
  loadFunc: (item: T) => Promise<string | Buffer>,
  itemType: string
): Promise<void> {
  const promises = payloads.map(
    payload =>
      new Promise<void>((resolve, reject) => {
        setTimeout(async () => {
          try {
            const data = await loadFunc(payload.item);
            await writeFile(payload.destinationPath, data);
            console.log(chalk.green('[OK]') + ` ${itemType}: ${payload.name}`);
            resolve();
          } catch (error: any) {
            const errorMessage = error instanceof ConversionError ? error.message : error.toString();
            console.log(
              chalk.red('[FAILED]') +
                ` ${itemType}: ${payload.name} ` +
                chalk.red(`(${errorMessage})`)
            );
            // Optionally log the original error for more details
            if (error instanceof ConversionError && error.details) {
                 console.error(chalk.red('Original error/details:'), error.details);
            } else if (!(error instanceof ConversionError)) {
                 console.error(chalk.red('Error details:'), error);
            }
            reject(error); // Reject with the error object
          }
        }, payload.delay);
      })
  );

  const results = await Promise.allSettled(promises);
  const failedCount = results.filter(result => result.status === 'rejected').length;

  if (failedCount === 0) {
    console.log(`Done processing ${itemType}s, got them all!`);
  } else {
    console.log(`Done processing ${itemType}s, but with ${chalk.red(failedCount + ' failed')}.`);
  }
}

// --- Markdown File Processing ---

/**
 * Generates markdown content string for a post, including frontmatter.
 * Uses js-yaml for reliable frontmatter serialization.
 * @param post - The post object.
 * @returns The complete markdown string.
 */
function generateMarkdownContent(post: Post): string {
  try {
    // Ensure consistent key order and proper quoting
    const frontmatterYaml = yaml.dump(post.frontmatter, {
      indent: 2,
      lineWidth: -1,
      sortKeys: false,
      noRefs: true,
      quotingType: '"'
    });
    return `---\n${frontmatterYaml}---\n\n${post.content}\n`;
  } catch (error: any) {
      // Provide context if YAML dumping fails
      throw new ConversionError(`Failed to serialize frontmatter for post: ${post.meta.slug}`, error);
  }
}


/**
 * Creates payloads for writing markdown files, skipping existing ones.
 * @param posts - Array of post objects.
 * @param config - Configuration options.
 * @returns Array of MarkdownPayload objects.
 */
function createMarkdownPayloads(posts: Post[], config: Config): MarkdownPayload[] {
  let skipCount = 0;
  let delay = 0;
  const payloads: MarkdownPayload[] = [];

  posts.forEach(post => {
    const destinationPath = getPostPath(post, config);
    if (checkFile(destinationPath)) {
      skipCount++;
    } else {
      payloads.push({
        item: post,
        name: (config.includeOtherTypes ? `${post.meta.type} - ` : '') + post.meta.slug,
        destinationPath,
        delay,
      });
      delay += settings.markdown_file_write_delay || 10; // Default delay if not set
    }
  });

  const remainingCount = payloads.length;
  if (remainingCount + skipCount === 0) {
    console.log('\nNo new posts to save.');
  } else {
    console.log(`\nSaving ${remainingCount} posts (${skipCount} already exist)...`);
  }

  return payloads;
}

/**
 * Writes markdown files for the given posts.
 * @param posts - Array of post objects.
 * @param config - Configuration options.
 */
async function writeMarkdownFiles(posts: Post[], config: Config): Promise<void> {
  const payloads = createMarkdownPayloads(posts, config);
  if (payloads.length > 0) {
    await processPayloads(payloads, (post) => Promise.resolve(generateMarkdownContent(post)), 'post');
  }
}

// --- Image File Processing ---

/**
 * Loads image data from a URL.
 * @param imageUrl - The URL of the image to download.
 * @returns A Buffer containing the image data.
 * @throws {ConversionError} If downloading or processing fails.
 */
async function loadImageFile(imageUrl: string): Promise<Buffer> {
  // Encode URL only if necessary
  const url = /%[\da-f]{2}/i.test(imageUrl) ? imageUrl : encodeURI(imageUrl);
  const filename = shared.getFilenameFromUrl(imageUrl); // Use shared function

  const axiosConfig: AxiosRequestConfig = {
    method: 'get',
    url,
    headers: {
      'User-Agent': 'wordpress-export-to-markdown', // Identify the client
    },
    responseType: 'arraybuffer',
    timeout: settings.image_download_timeout, // Use setting from settings.ts
  };

  // Disable SSL verification if configured
  if (settings.strict_ssl === false) { // Explicit check for false
    // Only set httpsAgent for rejectUnauthorized
    axiosConfig.httpsAgent = new https.Agent({ rejectUnauthorized: false });
  }

  try {
    const response = await axios(axiosConfig);
    if (response.status !== 200) {
        throw new ConversionError(`HTTP ${response.status} error downloading image: ${filename}`);
    }
    const imageBuffer = Buffer.from(response.data, 'binary');

    // Extract dimensions using Sharp
    try {
      const metadata = await sharp(imageBuffer).metadata();
      const { width, height } = metadata;
      if (width && height) {
          global.imageDimensions.set(filename, { width, height });
          // Optional: Log dimensions (can be verbose)
          // console.log(chalk.blue('[INFO]') + ` Dimensions for ${filename}: ${width}x${height}`);
      } else {
          console.warn(chalk.yellow('[WARN]') + ` Could not extract valid dimensions for ${filename}.`);
          global.imageDimensions.set(filename, {}); // Store empty object if dimensions fail
      }
    } catch (dimensionError: any) {
      console.warn(chalk.yellow('[WARN]') + ` Failed to extract dimensions for ${filename}: ${dimensionError.message}`);
      global.imageDimensions.set(filename, {}); // Store empty object on error
    }

    return imageBuffer;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status ? `HTTP ${error.response.status} ` : '';
      throw new ConversionError(`${status}Error downloading image ${filename}: ${error.message}`, error);
    }
    // Handle non-Axios errors (e.g., Sharp errors if processing added here)
    throw new ConversionError(`Failed to download or process image ${filename}`, error);
  }
}


/**
 * Creates payloads for downloading and saving images, handling duplicates and resized versions.
 * @param posts - Array of post objects.
 * @param config - Configuration options.
 * @returns Array of ImagePayload objects.
 */
function createImagePayloads(posts: Post[], config: Config): ImagePayload[] {
    let skipCount = 0;
    let delay = 0;
    const payloads: ImagePayload[] = [];
    const processedBaseImages = new Set<string>(); // Track base filenames already added to payloads
    const uniqueImageUrls = new Map<string, Post[]>(); // Track unique URLs and which posts use them

    // Collect all unique image URLs and associate them with posts
    posts.forEach(post => {
        post.meta.imageUrls.forEach(url => {
            if (!uniqueImageUrls.has(url)) {
                uniqueImageUrls.set(url, []);
            }
            uniqueImageUrls.get(url)?.push(post);
        });
    });

    uniqueImageUrls.forEach((postsUsingImage, imageUrl) => {
        const filename = shared.getFilenameFromUrl(imageUrl);
        
        // For each image, we need to create a copy in each post's directory
        for (const post of postsUsingImage) {
            // Get the post's directory path
            const postPath = getPostPath(post, config);
            const postDir = path.dirname(postPath);
            
            // Create images directory inside the post directory
            const imagesBaseDir = path.join(postDir, 'images');
            const destinationPath = path.join(imagesBaseDir, filename);

            // Check if the file already exists
            if (checkFile(destinationPath)) {
                skipCount++;
                continue; // Skip if file exists
            }

            const baseFilename = shared.getBaseFilenameIfResized(filename);

            // If it's a resized version, check if the base is already queued/processed
            if (baseFilename) {
                if (processedBaseImages.has(baseFilename)) {
                    // console.log(chalk.blue('[INFO]') + ` Skipping download for resized: ${filename} (base: ${baseFilename} already processed)`);
                    skipCount++;
                    continue; // Skip if base image is already handled
                }
                // If the base image *itself* exists on disk, we might still skip this resized one,
                // depending on whether we *only* want base images. Assuming we download what's linked for now.
            } else {
                // This is potentially a base image. Mark it for tracking.
                processedBaseImages.add(filename);
            }

            // Add payload if not skipped
            payloads.push({
                item: imageUrl,
                name: filename,
                destinationPath,
                delay,
            });
            delay += settings.image_file_request_delay || 50; // Default delay if not set
        }
    });


    const remainingCount = payloads.length;
    if (remainingCount + skipCount === 0) {
        console.log('\nNo new images to download.');
    } else {
        // Log count based on unique URLs processed
        console.log(`\nDownloading ${remainingCount} new images (${skipCount} already exist or skipped)...`);
    }

    return payloads;
}


/**
 * Downloads and saves all unique image files referenced in the posts.
 * @param posts - Array of post objects.
 * @param config - Configuration options.
 */
async function writeImageFiles(posts: Post[], config: Config): Promise<void> {
  const payloads = createImagePayloads(posts, config);
  if (payloads.length > 0) {
    await processPayloads(payloads, loadImageFile, 'image');
  }
}

// --- Main Exported Function ---

/**
 * Writes markdown files and downloads associated images for posts, then runs post-processing.
 * @param posts - Array of post objects to write.
 * @param config - Configuration options.
 */
export async function writeFiles(posts: Post[], config: Config): Promise<void> {
  await writeMarkdownFiles(posts, config);
  await writeImageFiles(posts, config);

  // Run post-processor after files are written
  try {
    console.log(chalk.cyan('\nRunning post-processing for Astro compatibility...'));
    const postProcessOptions = {
      extension: '.mdx', // Assuming .mdx, make configurable if needed
      recursive: true,
    };
    // Ensure the directory exists before processing
    if (fs.existsSync(config.output)) {
        const processedCount = await postProcessor.processDirectory(config.output, postProcessOptions);
        console.log(chalk.cyan(`Post-processing complete. ${processedCount} files checked/updated.`));
    } else {
        console.warn(chalk.yellow(`[WARN] Output directory "${config.output}" not found. Skipping post-processing.`));
    }
  } catch (error: any) {
    console.error(chalk.red('[ERROR]') + ' Post-processing failed: ' + error.message);
    // Optionally suggest manual fix script
    // console.log('Consider running the fix-markdown script manually if issues persist.');
    // Decide if this should halt the process or just warn
  }
}
