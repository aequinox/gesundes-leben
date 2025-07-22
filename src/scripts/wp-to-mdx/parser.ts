import { ErrorFactory, ConversionErrorCollector } from "./errors";
import { logger } from "./logger";
import { SecuritySanitizer } from "./security";
import type {
  WordPressPost,
  WordPressAttachment,
  WordPressAuthor,
  WordPressCategory,
  WordPressExport,
  WordPressXMLRoot,
  WordPressXMLItem,
  WordPressXMLChannel,
  WordPressXMLCategory,
  WordPressXMLPostMeta,
} from "./types";
import { readFileSync } from "fs";
import { parseString } from "xml2js";

export class WordPressParser {
  private xmlData: WordPressXMLRoot;
  private errorCollector = new ConversionErrorCollector();

  async parseFromFile(filePath: string): Promise<WordPressExport> {
    logger.info(`Parsing WordPress XML file: ${filePath}`);

    try {
      const xmlContent = readFileSync(filePath, "utf8");
      return await this.parseFromString(xmlContent);
    } catch (error) {
      logger.error(`Failed to read XML file: ${error}`);
      throw new Error(`Failed to read WordPress XML file: ${filePath}`);
    }
  }

  async parseFromString(xmlContent: string): Promise<WordPressExport> {
    return new Promise((resolve, reject) => {
      // Sanitize XML content first
      const sanitizedContent = SecuritySanitizer.sanitizeHTML(xmlContent);

      parseString(sanitizedContent, { explicitArray: false }, (err, result) => {
        if (err) {
          const error = ErrorFactory.createParseError(
            `XML parsing error: ${err.message}`
          );
          this.errorCollector.addError(error);
          reject(new Error(`Failed to parse XML: ${err.message}`));
          return;
        }

        try {
          this.xmlData = result as WordPressXMLRoot;
          const wpExport = this.extractWordPressData();
          logger.info(
            `Successfully parsed ${wpExport.posts.length} posts, ${wpExport.attachments.length} attachments`
          );
          resolve(wpExport);
        } catch (parseError) {
          const error = ErrorFactory.createParseError(
            `Data extraction failed: ${parseError}`
          );
          this.errorCollector.addError(error);
          reject(new Error(`Failed to extract WordPress data: ${parseError}`));
        }
      });
    });
  }

  private extractWordPressData(): WordPressExport {
    const rss = this.xmlData.rss;
    const channel = rss.channel;
    const items = Array.isArray(channel.item)
      ? channel.item
      : [channel.item].filter(Boolean);

    const posts: WordPressPost[] = [];
    const attachments: WordPressAttachment[] = [];
    const authors = this.extractAuthors(channel);
    const categories = this.extractCategories(channel);

    for (const item of items) {
      const postType = this.getMetaValue(item, "wp:post_type");

      if (postType === "post" || postType === "page") {
        const post = this.parsePost(item);
        if (post) {
          posts.push(post);
        }
      } else if (postType === "attachment") {
        const attachment = this.parseAttachment(item);
        if (attachment) {
          attachments.push(attachment);
        }
      }
    }

    return {
      posts,
      attachments,
      authors,
      categories,
    };
  }

  private parsePost(item: WordPressXMLItem): WordPressPost | null {
    try {
      const status = this.getMetaValue(item, "wp:status");

      // Skip auto-drafts and revisions
      if (status === "auto-draft" || status === "revision") {
        return null;
      }

      // Sanitize content before creating post
      const sanitizedContent = SecuritySanitizer.sanitizeWordPressContent(
        this.getMetaValue(item, "content:encoded") || ""
      );
      const sanitizedExcerpt = SecuritySanitizer.sanitizeWordPressContent(
        this.getMetaValue(item, "excerpt:encoded") || ""
      );

      const post: WordPressPost = {
        id: this.getMetaValue(item, "wp:post_id") || "",
        title: SecuritySanitizer.sanitizeYAMLValue(item.title || ""),
        content: sanitizedContent,
        excerpt: sanitizedExcerpt,
        pubDate:
          SecuritySanitizer.sanitizeDate(
            item.pubDate || item["wp:post_date"]
          ) || new Date(),
        modifiedDate: this.parseModifiedDate(item),
        author: SecuritySanitizer.sanitizeAuthorName(item["dc:creator"] || ""),
        categories: this.extractPostCategories(item),
        tags: this.extractPostTags(item),
        status: (status as "publish" | "draft" | "private") || "publish",
        slug: this.getMetaValue(item, "wp:post_name") || "",
        featuredImageId: this.getMetaValue(item, "_thumbnail_id"),
        customFields: this.extractCustomFields(item),
        attachments: [],
      };

      // Try to find featured image URL from attachments or custom fields
      if (post.featuredImageId) {
        // This will be resolved later when we match with attachments
      }

      return post;
    } catch (error) {
      logger.warn(`Failed to parse post: ${item.title}, error: ${error}`);
      return null;
    }
  }

  private parseAttachment(item: WordPressXMLItem): WordPressAttachment | null {
    try {
      const attachment: WordPressAttachment = {
        id: this.getMetaValue(item, "wp:post_id") || "",
        title: item.title || "",
        url: this.getMetaValue(item, "wp:attachment_url") || "",
        filename: this.extractFilename(
          this.getMetaValue(item, "wp:attachment_url") || ""
        ),
        alt: this.getMetaValue(item, "_wp_attachment_image_alt") || "",
        caption: this.getMetaValue(item, "excerpt:encoded") || "",
        description: this.getMetaValue(item, "content:encoded") || "",
        mimeType: this.getMetaValue(item, "wp:post_mime_type") || "",
      };

      return attachment;
    } catch (error) {
      logger.warn(`Failed to parse attachment: ${item.title}, error: ${error}`);
      return null;
    }
  }

  private extractAuthors(channel: any): WordPressAuthor[] {
    const authors: WordPressAuthor[] = [];
    const wpAuthors = channel["wp:author"];

    if (!wpAuthors) {
      return authors;
    }

    const authorList = Array.isArray(wpAuthors) ? wpAuthors : [wpAuthors];

    for (const author of authorList) {
      authors.push({
        id: author["wp:author_id"],
        login: author["wp:author_login"],
        email: author["wp:author_email"],
        displayName: author["wp:author_display_name"],
        firstName: author["wp:author_first_name"],
        lastName: author["wp:author_last_name"],
      });
    }

    return authors;
  }

  private extractCategories(channel: any): WordPressCategory[] {
    const categories: WordPressCategory[] = [];
    const wpCategories = channel["wp:category"];

    if (!wpCategories) {
      return categories;
    }

    const categoryList = Array.isArray(wpCategories)
      ? wpCategories
      : [wpCategories];

    for (const category of categoryList) {
      if (category["wp:category_nicename"]) {
        categories.push({
          id: category["wp:term_id"],
          name: category["wp:cat_name"],
          slug: category["wp:category_nicename"],
          description: category["wp:category_description"],
        });
      }
    }

    return categories;
  }

  private extractPostCategories(item: any): string[] {
    if (!item.category) {
      return [];
    }

    const categories = Array.isArray(item.category)
      ? item.category
      : [item.category];
    return categories
      .filter((cat: any) => cat.$ && cat.$.domain === "category")
      .map((cat: any) => cat._ || cat)
      .filter(Boolean);
  }

  private extractPostTags(item: any): string[] {
    if (!item.category) {
      return [];
    }

    const categories = Array.isArray(item.category)
      ? item.category
      : [item.category];
    return categories
      .filter((cat: any) => cat.$ && cat.$.domain === "post_tag")
      .map((cat: any) => cat._ || cat)
      .filter(Boolean);
  }

  private extractCustomFields(item: any): Record<string, any> {
    const customFields: Record<string, any> = {};

    if (!item["wp:postmeta"]) {
      return customFields;
    }

    const postMeta = Array.isArray(item["wp:postmeta"])
      ? item["wp:postmeta"]
      : [item["wp:postmeta"]];

    for (const meta of postMeta) {
      const key = meta["wp:meta_key"];
      const value = meta["wp:meta_value"];

      if (key && value) {
        customFields[key] = value;
      }
    }

    return customFields;
  }

  private getMetaValue(item: any, metaKey: string): string | undefined {
    // Handle direct access for wp: prefixed fields
    if (item[metaKey]) {
      return item[metaKey];
    }

    // Handle postmeta fields
    if (metaKey.startsWith("_") && item["wp:postmeta"]) {
      const postMeta = Array.isArray(item["wp:postmeta"])
        ? item["wp:postmeta"]
        : [item["wp:postmeta"]];

      for (const meta of postMeta) {
        if (meta["wp:meta_key"] === metaKey) {
          return meta["wp:meta_value"];
        }
      }
    }

    return undefined;
  }

  private extractFilename(url: string): string {
    try {
      return url.split("/").pop() || "";
    } catch {
      return "";
    }
  }

  private parseModifiedDate(item: any): Date | undefined {
    const pubDate = new Date(item.pubDate || item["wp:post_date"]);

    // Try different modified date fields
    const modifiedFields = [
      item["wp:post_date_gmt"],
      item["wp:post_modified"],
      item["wp:post_modified_gmt"],
    ];

    for (const field of modifiedFields) {
      if (field) {
        const modDate = new Date(field);
        // Only use modified date if it's valid and after pub date
        if (!isNaN(modDate.getTime()) && modDate >= pubDate) {
          return modDate;
        }
      }
    }

    return undefined;
  }

  // Helper method to resolve featured images after parsing
  resolveFeaturedImages(
    posts: WordPressPost[],
    attachments: WordPressAttachment[]
  ): void {
    const attachmentMap = new Map(attachments.map(att => [att.id, att]));

    for (const post of posts) {
      if (post.featuredImageId) {
        const attachment = attachmentMap.get(post.featuredImageId);
        if (attachment) {
          post.featuredImageUrl = attachment.url;
        }
      }
    }
  }

  /**
   * Get parsing errors
   */
  getErrors(): ConversionErrorCollector {
    return this.errorCollector;
  }

  /**
   * Clear parsing errors
   */
  clearErrors(): void {
    this.errorCollector.clear();
  }
}
