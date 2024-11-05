import { getCollection } from "astro:content";
import { AuthorUtils } from "./authors";
import type { Blog } from "./types";
import type { Category } from "@/data/taxonomies";

/**
 * Post-related utility functions
 */
export class PostUtils {
  /**
   * Sorts posts by date (newest first), considering modification date if available
   */
  public static sortByDate(posts: Blog[]): Blog[] {
    return [...posts].sort((a, b) => {
      const dateA = a.data.modDatetime ?? a.data.pubDatetime;
      const dateB = b.data.modDatetime ?? b.data.pubDatetime;
      return dateB.getTime() - dateA.getTime();
    });
  }

  /**
   * Filters out draft posts and scheduled posts
   */
  private static filterPosts(
    posts: Blog[],
    options: {
      includeDrafts?: boolean;
      includeScheduled?: boolean;
    } = {}
  ): Blog[] {
    const { includeDrafts = false, includeScheduled = false } = options;
    const now = new Date();

    return posts.filter(post => {
      if (!includeDrafts && post.data.draft) return false;
      if (!includeScheduled && post.data.pubDatetime > now) return false;
      return true;
    });
  }

  /**
   * Retrieves all blog posts with optional filtering and sorting
   */
  public static async getAllPosts(
    options: {
      includeDrafts?: boolean;
      includeScheduled?: boolean;
      sort?: boolean;
    } = {}
  ): Promise<Blog[]> {
    const { sort = true, ...filterOptions } = options;
    try {
      const posts = await getCollection("blog");
      const filteredPosts = PostUtils.filterPosts(posts, filterOptions);
      return sort ? PostUtils.sortByDate(filteredPosts) : filteredPosts;
    } catch (error) {
      console.error("Error fetching posts:", error);
      return [];
    }
  }

  /**
   * Retrieves featured posts
   */
  public static async getFeaturedPosts(): Promise<Blog[]> {
    const posts = await PostUtils.getAllPosts();
    return posts.filter(post => post.data.featured);
  }

  /**
   * Retrieves posts by tag
   */
  public static async getPostsByTag(tag: string): Promise<Blog[]> {
    const posts = await PostUtils.getAllPosts();
    return posts.filter(post => post.data.tags.includes(tag));
  }

  /**
   * Retrieves posts by category
   */
  public static async getPostsByCategory(category: Category): Promise<Blog[]> {
    const posts = await PostUtils.getAllPosts();
    return posts.filter(post => post.data.categories.includes(category));
  }

  /**
   * Retrieves posts by group
   */
  public static async getPostsByGroup(group: string): Promise<Blog[]> {
    const posts = await PostUtils.getAllPosts();
    return posts.filter(post => post.data.group === group);
  }

  /**
   * Retrieves posts by author
   */
  public static async getPostsByAuthor(authorSlug: string): Promise<Blog[]> {
    const posts = await PostUtils.getAllPosts();
    return posts.filter(async post => {
      const postAuthor = await AuthorUtils.getAuthorEntry(post.data.author);
      return postAuthor?.slug === authorSlug;
    });
  }

  /**
   * Calculates reading time for a post
   * @param content Post content
   * @param wordsPerMinute Average reading speed (default: 200)
   */
  public static calculateReadingTime(
    content: string,
    wordsPerMinute = 200
  ): number {
    const words = content.trim().split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
  }

  /**
   * Updates reading time for posts
   */
  public static async updateReadingTimes(posts: Blog[]): Promise<Blog[]> {
    return Promise.all(
      posts.map(async post => {
        if (!post.data.readingTime) {
          const rendered = await post.render();
          const content = rendered.toString();
          post.data.readingTime = PostUtils.calculateReadingTime(content);
        }
        return post;
      })
    );
  }
}
