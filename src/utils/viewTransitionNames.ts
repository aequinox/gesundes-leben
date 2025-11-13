/**
 * View Transition Names Utility
 *
 * Centralized utility for generating consistent and unique view transition names.
 * This prevents duplicate transition names and ensures smooth animations across pages.
 *
 * @module viewTransitionNames
 *
 * Naming Convention:
 * - All transition names follow the pattern: `{resource}-{id}-{element}`
 * - Resource: post, tag, category, author, glossary, etc.
 * - ID: Unique identifier (slug, tag name, etc.)
 * - Element: The specific element being transitioned (heroImage, title, etc.)
 *
 * Examples:
 * - Post hero image: `post-healthy-eating-tips-heroImage`
 * - Post title: `post-healthy-eating-tips-title`
 * - Tag link: `tag-nutrition-link`
 * - Category: `post-healthy-eating-tips-category-nutrition`
 */

import { getPostSlug } from "./slugs";
import type { Post } from "./types";

/**
 * Element types that can have view transitions
 */
export type TransitionElement =
  | "heroImage"
  | "title"
  | "category"
  | "link"
  | "card"
  | "icon"
  | "badge";

/**
 * Resource types that can have view transitions
 */
export type TransitionResource =
  | "post"
  | "tag"
  | "category"
  | "author"
  | "glossary"
  | "page";

/**
 * Configuration for generating a view transition name
 */
export interface TransitionNameConfig {
  resource: TransitionResource;
  id: string;
  element: TransitionElement;
  modifier?: string; // Optional modifier for additional uniqueness (e.g., index, variant)
}

/**
 * Generate a consistent view transition name
 *
 * @param config - Configuration for the transition name
 * @returns A unique view transition name
 *
 * @example
 * ```ts
 * // Generate a post hero image transition name
 * const name = createTransitionName({
 *   resource: 'post',
 *   id: 'healthy-eating-tips',
 *   element: 'heroImage'
 * });
 * // Returns: 'post-healthy-eating-tips-heroImage'
 * ```
 */
export function createTransitionName(config: TransitionNameConfig): string {
  const { resource, id, element, modifier } = config;

  // Build the transition name parts
  const parts = [resource, id, element];

  // Add modifier if provided
  if (modifier) {
    parts.push(modifier);
  }

  // Join parts with hyphens
  return parts.join("-");
}

/**
 * Generate a post hero image transition name
 *
 * @param post - The blog post
 * @returns View transition name for the post's hero image
 *
 * @example
 * ```astro
 * <Picture transition:name={getPostHeroImageTransition(post)} />
 * ```
 */
export function getPostHeroImageTransition(post: Post): string {
  return createTransitionName({
    resource: "post",
    id: getPostSlug(post),
    element: "heroImage",
  });
}

/**
 * Generate a post title transition name
 *
 * @param post - The blog post
 * @returns View transition name for the post's title
 *
 * @example
 * ```astro
 * <h1 transition:name={getPostTitleTransition(post)}>{title}</h1>
 * ```
 */
export function getPostTitleTransition(post: Post): string {
  return createTransitionName({
    resource: "post",
    id: getPostSlug(post),
    element: "title",
  });
}

/**
 * Generate a post category transition name
 *
 * @param post - The blog post
 * @param category - The category name
 * @returns View transition name for the post's category
 *
 * @example
 * ```astro
 * <span transition:name={getPostCategoryTransition(post, category)}>
 *   {category}
 * </span>
 * ```
 */
export function getPostCategoryTransition(
  post: Post,
  category: string
): string {
  return createTransitionName({
    resource: "post",
    id: getPostSlug(post),
    element: "category",
    modifier: category.toLowerCase().replace(/\s+/g, "-"),
  });
}

/**
 * Generate a tag link transition name
 *
 * @param tag - The tag identifier
 * @returns View transition name for the tag link
 *
 * @example
 * ```astro
 * <a transition:name={getTagLinkTransition(tag)} href={`/tags/${tag}/`}>
 *   {tagName}
 * </a>
 * ```
 */
export function getTagLinkTransition(tag: string): string {
  return createTransitionName({
    resource: "tag",
    id: tag,
    element: "link",
  });
}

/**
 * Generate a featured tag transition name
 *
 * @param tag - The tag identifier
 * @returns View transition name for the featured tag
 *
 * @example
 * ```astro
 * <h3 transition:name={getFeaturedTagTransition(tag)}>{tagName}</h3>
 * ```
 */
export function getFeaturedTagTransition(tag: string): string {
  return createTransitionName({
    resource: "tag",
    id: tag,
    element: "title",
    modifier: "featured",
  });
}

/**
 * Generate a glossary card transition name
 *
 * @param slug - The glossary entry slug
 * @returns View transition name for the glossary card
 *
 * @example
 * ```astro
 * <h2 transition:name={getGlossaryTransition(slug)}>{title}</h2>
 * ```
 */
export function getGlossaryTransition(slug: string): string {
  return createTransitionName({
    resource: "glossary",
    id: slug,
    element: "title",
  });
}

/**
 * Generate an author transition name
 *
 * @param authorSlug - The author identifier
 * @returns View transition name for the author
 *
 * @example
 * ```astro
 * <h1 transition:name={getAuthorTransition(authorSlug)}>{author}</h1>
 * ```
 */
export function getAuthorTransition(authorSlug: string): string {
  return createTransitionName({
    resource: "author",
    id: authorSlug,
    element: "title",
  });
}

/**
 * Validate a transition name to ensure it follows the naming convention
 *
 * @param name - The transition name to validate
 * @returns True if the name is valid, false otherwise
 *
 * @internal
 */
export function isValidTransitionName(name: string): boolean {
  // Check if the name follows the pattern: resource-id-element[-modifier]
  const pattern = /^[a-z]+-[a-z0-9-]+-[a-z]+(-[a-z0-9-]+)?$/i;
  return pattern.test(name);
}

/**
 * Check if view transitions are supported in the current browser
 *
 * @returns True if view transitions are supported
 */
export function isViewTransitionsSupported(): boolean {
  if (typeof document === "undefined") {
    return false;
  }
  return "startViewTransition" in document;
}

/**
 * Check if the user prefers reduced motion
 *
 * @returns True if the user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Conditionally return a transition name based on browser support and user preferences
 *
 * @param name - The transition name
 * @returns The transition name if supported and allowed, undefined otherwise
 *
 * @example
 * ```astro
 * <div transition:name={conditionalTransition(getPostTitleTransition(post))}>
 *   {title}
 * </div>
 * ```
 */
export function conditionalTransition(name: string): string | undefined {
  if (!isViewTransitionsSupported() || prefersReducedMotion()) {
    return undefined;
  }
  return name;
}
