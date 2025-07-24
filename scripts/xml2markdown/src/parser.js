import fs from 'fs';
import * as xml2js from 'xml2js';

import * as shared from './shared.js';
import * as settings from './settings.js';
import * as translator from './translator.js';
import logger from './logger.js';
import { XmlConversionError, XmlValidationError } from './errors.js';

// Import all frontmatter getters manually since require-directory doesn't work with ES modules
import author from './frontmatter/author.js';
import categories from './frontmatter/categories.js';
import coverImage from './frontmatter/coverImage.js';
import date from './frontmatter/date.js';
import draft from './frontmatter/draft.js';
import excerpt from './frontmatter/excerpt.js';
import featured from './frontmatter/featured.js';
import group from './frontmatter/group.js';
import heroImage from './frontmatter/heroImage.js';
import id from './frontmatter/id.js';
import keywords from './frontmatter/keywords.js';
import modDatetime from './frontmatter/modDatetime.js';
import pubDatetime from './frontmatter/pubDatetime.js';
import slug from './frontmatter/slug.js';
import tags from './frontmatter/tags.js';
import taxonomy from './frontmatter/taxonomy.js';
import title from './frontmatter/title.js';
import type from './frontmatter/type.js';

// Create frontmatter getters object manually
const frontmatterGetters = {
  author,
  categories,
  coverImage,
  date,
  draft,
  excerpt,
  featured,
  group,
  heroImage,
  id,
  keywords,
  modDatetime,
  pubDatetime,
  slug,
  tags,
  taxonomy,
  title,
  type,
};

/**
 * @typedef {Object} PostMeta
 * @property {string} id - Post ID
 * @property {string} slug - Post slug
 * @property {string} [coverImageId] - Cover image ID if exists
 * @property {string} [coverImage] - Cover image filename if exists
 * @property {string} type - Post type
 * @property {string[]} imageUrls - Array of image URLs
 */

/**
 * @typedef {import('./types.js').Post} Post
 */

/**
 * @typedef {Object} Image
 * @property {string} id - Image ID
 * @property {string} postId - Parent post ID
 * @property {string} url - Image URL
 */

/**
 * Reads the WordPress export file and parses it into an array of post objects.
 *
 * @param {Object} config - Configuration options.
 * @param {string} config.input - Path to the WordPress export XML file.
 * @param {boolean} [config.includeOtherTypes] - Whether to include post types other than 'post' and 'page'.
 * @param {boolean} [config.saveAttachedImages] - Whether to download and save images attached to posts.
 * @param {boolean} [config.saveScrapedImages] - Whether to download and save images found in post content.
 *
 * @returns {Promise<Post[]>} A promise that resolves to an array of post objects.
 * @throws {ConversionError} When parsing or processing fails
 */
async function parseFilePromise(config) {
  try {
    logger.info('Parsing...');
    const content = await fs.promises.readFile(config.input, 'utf8');
    const allData = await xml2js.parseStringPromise(content, {
      trim: true,
      tagNameProcessors: [xml2js.processors.stripPrefix],
    });
    const channelData = allData.rss.channel[0].item;

    const postTypes = getPostTypes(channelData, config);
    const posts = collectPosts(channelData, postTypes, config);

    let images = [];
    if (config.saveAttachedImages || config.saveScrapedImages) {
      const attachedImages = config.saveAttachedImages ? collectAttachedImages(channelData) : [];
      const scrapedImages = config.saveScrapedImages
        ? collectScrapedImages(channelData, postTypes)
        : [];
      images = [...attachedImages, ...scrapedImages];
    }

    mergeImagesIntoPosts(images, posts);
    populateFrontmatter(posts);

    return posts;
  } catch (error) {
    throw new XmlConversionError('Failed to parse WordPress export file', { originalError: error });
  }
}

/**
 * Get post types to process based on configuration
 * @param {Object[]} channelData - Channel data from WordPress export
 * @param {Object} config - Configuration options
 * @returns {string[]} Array of post types to process
 */
function getPostTypes(channelData, config) {
  if (config.includeOtherTypes) {
    // search export file for all post types minus some default types we don't want
    // effectively this will be 'post', 'page', and custom post types
    const types = channelData
      .map(item => item.post_type[0])
      .filter(
        type =>
          ![
            'attachment',
            'revision',
            'nav_menu_item',
            'custom_css',
            'customize_changeset',
          ].includes(type)
      );
    return [...new Set(types)]; // remove duplicates
  } else {
    // just plain old vanilla "post" posts
    return ['post'];
  }
}

/**
 * Filter channel data by post type
 * @param {Object[]} channelData - Channel data from WordPress export
 * @param {string} type - Post type to filter by
 * @returns {Object[]} Filtered channel data
 */
function getItemsOfType(channelData, type) {
  return channelData.filter(item => item.post_type[0] === type);
}

/**
 * Collect posts from channel data
 * @param {Object[]} channelData - Channel data from WordPress export
 * @param {string[]} postTypes - Post types to collect
 * @param {Object} config - Configuration options
 * @returns {Omit<Post, 'frontmatter'>[]} Array of posts without frontmatter (added later)
 */
function collectPosts(channelData, postTypes, config) {
  // this is passed into getPostContent() for the markdown conversion
  const turndownService = translator.initTurndownService();

  const allPosts = [];
  postTypes.forEach(postType => {
    const postsForType = getItemsOfType(channelData, postType)
      .filter(postData => postData.status[0] !== 'trash' && postData.status[0] !== 'draft')
      .map(postData => {
        const contentResult = translator.getPostContent(postData, turndownService, config);
        return {
          data: postData,
          meta: {
            id: getPostId(postData),
            slug: getPostSlug(postData),
            coverImageId: getPostCoverImageId(postData),
            coverImage: undefined,
            type: postType,
            imageUrls: [],
          },
          content: contentResult.content,
          imageImports: contentResult.imageImports,
        };
      });

    if (postTypes.length > 1) {
      logger.info(`${postsForType.length} "${postType}" posts found.`);
    }

    allPosts.push(...postsForType);
  });

  if (postTypes.length === 1) {
    logger.info(`${allPosts.length} posts found.`);
  }
  return allPosts;
}

/**
 * Get post ID from post data
 * @param {Object} postData - Post data
 * @returns {string} Post ID
 */
function getPostId(postData) {
  return postData.post_id[0];
}

/**
 * Get post slug from post data
 * @param {Object} postData - Post data
 * @returns {string} Post slug
 */
function getPostSlug(postData) {
  return decodeURIComponent(postData.post_name[0]);
}

/**
 * Get cover image ID from post data
 * @param {Object} postData - Post data
 * @returns {string|undefined} Cover image ID if exists
 */
function getPostCoverImageId(postData) {
  if (postData.postmeta === undefined) {
    return undefined;
  }

  const postmeta = postData.postmeta.find(postmeta => postmeta.meta_key[0] === '_thumbnail_id');
  const id = postmeta ? postmeta.meta_value[0] : undefined;
  return id;
}

/**
 * Collect attached images from channel data
 * @param {Object[]} channelData - Channel data from WordPress export
 * @returns {Image[]} Array of attached images
 */
function collectAttachedImages(channelData) {
  const images = getItemsOfType(channelData, 'attachment')
    // filter to certain image file types
    .filter(
      attachment =>
        attachment.attachment_url && /\.(gif|jpe?g|png|webp)$/i.test(attachment.attachment_url[0])
    )
    .map(attachment => ({
      id: attachment.post_id[0],
      postId: attachment.post_parent[0],
      url: attachment.attachment_url[0],
    }));

  logger.info(`${images.length} attached images found.`);
  return images;
}

/**
 * Collect images from post content
 * @param {Object[]} channelData - Channel data from WordPress export
 * @param {string[]} postTypes - Post types to collect from
 * @returns {Image[]} Array of scraped images
 */
function collectScrapedImages(channelData, postTypes) {
  const images = [];
  postTypes.forEach(postType => {
    getItemsOfType(channelData, postType).forEach(postData => {
      const postId = postData.post_id[0];
      const postContent = postData.encoded[0];
      const postLink = postData.link[0];

      const matches = [
        ...postContent.matchAll(/<img[^>]*src="(.+?\.(?:gif|jpe?g|png|webp|avif|svg))"[^>]*>/gi),
      ];
      matches.forEach(match => {
        // base the matched image URL relative to the post URL
        const url = new URL(match[1], postLink).href;
        images.push({
          id: -1,
          postId: postId,
          url,
        });
      });
    });
  });

  logger.info(`${images.length} images scraped from post body content.`);
  return images;
}

/**
 * Merge images into posts
 * @param {Image[]} images - Array of images
 * @param {Post[]} posts - Array of posts
 */
function mergeImagesIntoPosts(images, posts) {
  images.forEach(image => {
    posts.forEach(post => {
      let shouldAttach = false;

      // this image was uploaded as an attachment to this post
      if (image.postId === post.meta.id) {
        shouldAttach = true;
      }

      // this image was set as the featured image for this post
      if (image.id === post.meta.coverImageId) {
        shouldAttach = true;
        post.meta.coverImage = shared.getFilenameFromUrl(image.url);
      }

      if (shouldAttach && !post.meta.imageUrls.includes(image.url)) {
        post.meta.imageUrls.push(image.url);
      }
    });
  });
}

/**
 * Populate post frontmatter with data from each post
 * @param {Omit<Post, 'frontmatter'>[]} posts - Array of posts to populate frontmatter for
 * @throws {ConversionError} When frontmatter getter is not found
 */
function populateFrontmatter(posts) {
  posts.forEach(post => {
    const frontmatter = {};
    settings.frontmatter_fields.forEach(field => {
      const [key, alias] = field.split(':');

      const frontmatterGetter = frontmatterGetters[key];
      if (!frontmatterGetter) {
        throw new XmlValidationError(`Could not find a frontmatter getter named "${key}"`, { field: key });
      }

      frontmatter[alias || key] = frontmatterGetter(post);
    });
    post.frontmatter = frontmatter;
  });
}

export { parseFilePromise };
