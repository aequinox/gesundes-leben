import { logger } from "./logger";
import axios from "axios";
import TurndownService from "turndown";
import { gfm } from "turndown-plugin-gfm";

interface ImageDimensions {
  width: number;
  height: number;
  aspectRatio: number;
}

interface ImagePositioningConfig {
  enableSmartPositioning: boolean;
  squareThreshold: number; // aspect ratio difference to consider square
  portraitThreshold: number; // aspect ratio threshold for portrait
  landscapeThreshold: number; // aspect ratio threshold for landscape
  smallImageThreshold: number; // pixel width threshold for small images
}

export class ContentTranslator {
  private turndownService: TurndownService;
  private positioningConfig: ImagePositioningConfig;
  private imageImports: Map<string, string> = new Map(); // Track image imports
  private imageCounter: number = 1; // Counter for BlogImage_X naming

  constructor(positioningConfig?: Partial<ImagePositioningConfig>) {
    this.positioningConfig = {
      enableSmartPositioning: true,
      squareThreshold: 0.1, // within 10% of 1:1 ratio considered square
      portraitThreshold: 0.75, // height > width * 1.33 considered portrait
      landscapeThreshold: 1.5, // width > height * 1.5 considered landscape
      smallImageThreshold: 400, // images < 400px wide considered small
      ...positioningConfig,
    };
    this.turndownService = new TurndownService({
      headingStyle: "atx",
      codeBlockStyle: "fenced",
      bulletListMarker: "-",
      emDelimiter: "*",
      strongDelimiter: "**",
      linkStyle: "inlined",
      linkReferenceStyle: "full",
    });

    // Add GitHub Flavored Markdown support
    this.turndownService.use(gfm);

    // Add custom rules for WordPress specific elements
    this.addCustomRules();
  }

  /**
   * Convert WordPress HTML content to MDX
   */
  async convertToMDX(
    htmlContent: string,
    options: {
      generateTOC?: boolean;
      preserveWordPressShortcodes?: boolean;
      rewriteImagePaths?: boolean;
    } = {}
  ): Promise<string> {
    try {
      logger.debug("Converting HTML content to MDX");

      // Reset image tracking for new conversion
      this.imageImports.clear();
      this.imageCounter = 1;

      // Preprocess HTML content
      let processedContent = this.preprocessHTML(htmlContent, options);

      // Convert to Markdown
      let markdown = this.turndownService.turndown(processedContent);

      // Post-process Markdown (now async for smart image positioning)
      markdown = await this.postprocessMarkdown(markdown, options);

      // Add image imports at the top
      markdown = this.addImageImports(markdown);

      // Add TOC if requested
      if (options.generateTOC) {
        markdown = this.addTableOfContents(markdown);
      }

      return markdown;
    } catch (error) {
      logger.error(`Content conversion failed: ${error}`);
      throw new Error(`Failed to convert content to MDX: ${error}`);
    }
  }

  /**
   * Preprocess HTML before conversion
   */
  private preprocessHTML(html: string, options: any): string {
    let processed = html;

    // Clean up WordPress-specific HTML
    processed = processed.replace(/<!--.*?-->/gs, ""); // Remove HTML comments
    processed = processed.replace(/<p>\s*<\/p>/g, ""); // Remove empty paragraphs

    // Handle WordPress shortcodes if preserving them
    if (options.preserveWordPressShortcodes) {
      processed = this.handleWordPressShortcodes(processed);
    } else {
      processed = this.removeWordPressShortcodes(processed);
    }

    // Handle WordPress gallery shortcode
    processed = this.handleGalleryShortcode(processed);

    // Handle WordPress caption shortcode
    processed = this.handleCaptionShortcode(processed);

    // Fix common WordPress HTML issues
    processed = this.fixWordPressHTML(processed);

    return processed;
  }

  /**
   * Post-process Markdown after conversion
   */
  private async postprocessMarkdown(
    markdown: string,
    options: any
  ): Promise<string> {
    let processed = markdown;

    // Process smart image placeholders
    processed = await this.processSmartImagePlaceholders(processed);

    // Clean up excessive line breaks
    processed = processed.replace(/\n{3,}/g, "\n\n");

    // Fix list spacing issues
    processed = processed.replace(/(\n-[^\n]*)\n{2,}(-)/g, "$1\n$2");
    processed = processed.replace(/(\n\d+\.[^\n]*)\n{2,}(\d+\.)/g, "$1\n$2");

    // Handle German-specific content improvements
    processed = this.improveGermanContent(processed);

    // Rewrite image paths if requested
    if (options.rewriteImagePaths) {
      processed = this.rewriteImagePaths(processed);
    }

    return processed.trim();
  }

  /**
   * Process smart image placeholders with positioning
   */
  private async processSmartImagePlaceholders(
    markdown: string
  ): Promise<string> {
    const placeholderRegex =
      /\{\{SMART_IMAGE\|\|\|(.*?)\|\|\|(.*?)\|\|\|(.*?)\}\}/g;
    let processed = markdown;
    const matches = Array.from(markdown.matchAll(placeholderRegex));

    logger.debug(`Found ${matches.length} smart image placeholders to process`);

    // Process all image placeholders
    for (const match of matches) {
      const [fullMatch, originalSrc, alt, caption] = match;

      logger.debug(`Processing smart image placeholder: ${originalSrc}`);

      try {
        // Create a mock element for processing
        const mockImg = {
          getAttribute: (attr: string) => {
            if (attr === "src") return originalSrc;
            if (attr === "alt") return alt;
            if (attr === "title") return caption;
            return null;
          },
        } as Element;

        const imageMarkdown = await this.processImageWithPositioning(
          mockImg,
          originalSrc
        );
        processed = processed.replace(fullMatch, imageMarkdown);
        logger.debug(`Successfully processed smart image: ${originalSrc}`);
      } catch (error) {
        logger.error(`Failed to process smart image placeholder: ${error}`);
        // Fallback to simple markdown
        const imagePath = `./images/${originalSrc.split("/").pop()}`;
        const fallbackMarkdown = caption
          ? `![${alt}](${imagePath} "${caption}")`
          : `![${alt}](${imagePath})`;
        processed = processed.replace(fullMatch, fallbackMarkdown);
      }
    }

    return processed;
  }

  /**
   * Add custom Turndown rules for WordPress elements
   */
  private addCustomRules(): void {
    // Handle WordPress figure elements with smart positioning
    this.turndownService.addRule("wpFigure", {
      filter: "figure",
      replacement: (content, node) => {
        const figcaption = (node as Element).querySelector("figcaption");
        const img = (node as Element).querySelector("img");

        if (img) {
          const originalSrc = img.getAttribute("src") || "";
          const alt = img.getAttribute("alt") || "";
          const caption = figcaption?.textContent?.trim() || "";

          logger.debug(
            `Creating smart image placeholder for figure: ${originalSrc}`
          );

          // We can't use async in replacement function, so we'll handle this in post-processing
          // For now, create a placeholder that we'll replace later (use ||| as delimiter to avoid URL conflicts)
          const placeholder = `{{SMART_IMAGE|||${originalSrc}|||${alt}|||${caption}}}`;
          return `\n${placeholder}\n\n`;
        }
        return content;
      },
    });

    // Handle regular img elements with smart positioning
    this.turndownService.addRule("smartImg", {
      filter: "img",
      replacement: (content, node) => {
        const img = node as Element;
        const originalSrc = img.getAttribute("src") || "";
        const alt = img.getAttribute("alt") || "";
        const title = img.getAttribute("title") || "";

        // Create placeholder for post-processing (use ||| as delimiter to avoid URL conflicts)
        const placeholder = `{{SMART_IMAGE|||${originalSrc}|||${alt}|||${title}}}`;
        return placeholder;
      },
    });

    // Handle WordPress blockquotes with citations
    this.turndownService.addRule("wpBlockquote", {
      filter: node => {
        return (
          node.nodeName === "BLOCKQUOTE" &&
          (node as Element).querySelector("cite")
        );
      },
      replacement: (content, node) => {
        const cite = (node as Element).querySelector("cite");
        const citation = cite?.textContent?.trim() || "";
        return `> ${content.replace(/\n/g, "\n> ")}\n>\n> — ${citation}\n\n`;
      },
    });

    // Handle WordPress code blocks with language hints
    this.turndownService.addRule("wpCodeBlock", {
      filter: node => {
        return (
          node.nodeName === "PRE" &&
          (node as Element).classList.contains("wp-block-code")
        );
      },
      replacement: (content, node) => {
        const language = this.extractLanguageFromElement(node as Element);
        return `\`\`\`${language}\n${content}\n\`\`\`\n\n`;
      },
    });

    // Handle WordPress more tag
    this.turndownService.addRule("wpMore", {
      filter: node => {
        return (
          (node as Element).classList?.contains("wp-block-more") ||
          (node as Comment)?.nodeValue?.includes("more")
        );
      },
      replacement: () => {
        return "\n<!--more-->\n\n";
      },
    });
  }

  /**
   * Handle WordPress shortcodes
   */
  private handleWordPressShortcodes(content: string): string {
    // Convert common shortcodes to MDX components or remove them

    // [caption] shortcode - already handled in preprocessHTML

    // [gallery] shortcode - already handled in preprocessHTML

    // [embed] or [youtube] shortcodes
    content = content.replace(/\[embed\](.*?)\[\/embed\]/g, "$1");
    content = content.replace(/\[youtube\s+([^\]]+)\]/g, (match, params) => {
      const videoId = this.extractYouTubeId(params);
      return videoId
        ? `\n<iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>\n`
        : "";
    });

    return content;
  }

  private removeWordPressShortcodes(content: string): string {
    // Remove all shortcodes
    return content.replace(/\[[^\]]+\]/g, "");
  }

  private handleGalleryShortcode(content: string): string {
    // Convert [gallery] shortcode to a simple image list
    return content.replace(
      /\[gallery[^\]]*\]/g,
      "\n<!-- Gallery images will be processed separately -->\n"
    );
  }

  private handleCaptionShortcode(content: string): string {
    // Convert [caption] shortcode to figure/figcaption
    return content.replace(
      /\[caption[^\]]*\](.*?)\[\/caption\]/gs,
      "<figure>$1</figure>"
    );
  }

  /**
   * Fix common WordPress HTML issues
   */
  private fixWordPressHTML(html: string): string {
    // Fix self-closing img tags
    html = html.replace(/<img([^>]*?)>/g, "<img$1 />");

    // Fix WordPress auto-paragraphs around images
    html = html.replace(/<p>(\s*<img[^>]*>\s*)<\/p>/g, "$1");

    // Fix WordPress wpautop issues
    html = html.replace(
      /<p>(\s*<\/?(?:div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math|ins|del)\b[^>]*>)/gi,
      "$1"
    );

    return html;
  }

  /**
   * Improve German-specific content
   */
  private improveGermanContent(markdown: string): string {
    // Fix German quotation marks, but SKIP JSX components to preserve attribute syntax
    // First, temporarily replace JSX components with placeholders
    const jsxComponents: string[] = [];
    let jsxCounter = 0;

    // Find and replace JSX components with placeholders
    markdown = markdown.replace(/<\s*[A-Z][a-zA-Z0-9]*\s[^>]*\/>/g, match => {
      const placeholder = `__JSX_COMPONENT_${jsxCounter}__`;
      jsxComponents[jsxCounter] = match;
      jsxCounter++;
      return placeholder;
    });

    // Now apply German quote improvements to the remaining text
    markdown = markdown.replace(/„([^"]*?)"/g, '„$1"');
    markdown = markdown.replace(/"([^"]*?)"/g, '„$1"');

    // Restore JSX components
    for (let i = 0; i < jsxComponents.length; i++) {
      markdown = markdown.replace(`__JSX_COMPONENT_${i}__`, jsxComponents[i]);
    }

    // Ensure proper spacing around German punctuation
    markdown = markdown.replace(/(\w)–(\w)/g, "$1 – $2");
    markdown = markdown.replace(/(\w)—(\w)/g, "$1 — $2");

    return markdown;
  }

  /**
   * Add German table of contents after imports
   */
  private addTableOfContents(markdown: string): string {
    const tocHeader = "## Inhaltsverzeichnis\n\n";

    // If content already has a TOC, don't add another
    if (
      markdown.includes("Inhaltsverzeichnis") ||
      markdown.includes("## Inhalt")
    ) {
      return markdown;
    }

    // Find where imports end and content begins
    const lines = markdown.split("\n");
    let importEndIndex = -1;

    // Find the last import line
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith("import ")) {
        importEndIndex = i;
      }
    }

    // If we found imports, insert TOC after them
    if (importEndIndex >= 0) {
      const beforeImports = lines.slice(0, importEndIndex + 1);
      const afterImports = lines.slice(importEndIndex + 1);

      // Remove any empty lines at the start of content
      while (afterImports.length > 0 && afterImports[0].trim() === "") {
        afterImports.shift();
      }

      return [...beforeImports, "", tocHeader, ...afterImports].join("\n");
    }

    // No imports found, add TOC at the beginning
    return tocHeader + markdown;
  }

  /**
   * Rewrite image paths to local references
   */
  private rewriteImagePaths(markdown: string): string {
    // Replace WordPress upload URLs with local image references
    return markdown.replace(
      /!\[([^\]]*)\]\(https?:\/\/[^\/]+\/wp-content\/uploads\/[^)]+\/([^)]+)\)/g,
      "![$1](./images/$2)"
    );
  }

  /**
   * Extract language from code block element
   */
  private extractLanguageFromElement(element: Element): string {
    const className = element.className || "";
    const match = className.match(/language-(\w+)/);
    return match ? match[1] : "";
  }

  /**
   * Extract YouTube video ID from parameters
   */
  private extractYouTubeId(params: string): string | null {
    const match = params.match(
      /(?:v=|\/embed\/|\/watch\?v=|\/v\/|\.be\/|watch\?.*&v=)([^&\n?#]+)/
    );
    return match ? match[1] : null;
  }

  /**
   * Generate description from content (first 160 characters)
   */
  generateDescription(markdown: string): string {
    // Remove markdown formatting
    let text = markdown.replace(/[#*_`\[\]]/g, "");

    // Remove links
    text = text.replace(/\[([^\]]*)\]\([^)]*\)/g, "$1");

    // Remove line breaks and extra spaces
    text = text.replace(/\s+/g, " ").trim();

    // Truncate to 160 characters
    if (text.length > 160) {
      text = text.substring(0, 157) + "...";
    }

    return text;
  }

  /**
   * Extract keywords from content
   */
  extractKeywords(markdown: string, tags: string[] = []): string[] {
    const keywords = new Set(tags);

    // Add health-related German keywords if found in content
    const healthKeywords = [
      "Gesundheit",
      "Ernährung",
      "Vitamine",
      "Mineralien",
      "Mikronährstoffe",
      "Immunsystem",
      "Darm",
      "Mikrobiom",
      "Probiotika",
      "Antioxidantien",
      "Omega-3",
      "Vitamin D",
      "Magnesium",
      "Zink",
      "Eisen",
      "B-Vitamine",
    ];

    for (const keyword of healthKeywords) {
      if (markdown.toLowerCase().includes(keyword.toLowerCase())) {
        keywords.add(keyword);
      }
    }

    return Array.from(keywords);
  }

  /**
   * Get image dimensions from URL
   */
  private async getImageDimensions(
    imageUrl: string
  ): Promise<ImageDimensions | null> {
    try {
      // Try to extract dimensions from filename first (common WordPress pattern)
      const dimensionsFromFilename =
        this.extractDimensionsFromFilename(imageUrl);
      if (dimensionsFromFilename) {
        return dimensionsFromFilename;
      }

      // If not available in filename, make a HEAD request to get image info
      const response = await axios.head(imageUrl, { timeout: 5000 });
      const contentType = response.headers["content-type"];

      if (!contentType?.startsWith("image/")) {
        return null;
      }

      // For a more accurate approach, we'd need to partially download and analyze
      // the image headers, but for now we'll use reasonable defaults based on
      // common image patterns or return null
      logger.debug(`Could not determine dimensions for ${imageUrl}`);
      return null;
    } catch (error) {
      logger.debug(`Failed to get dimensions for ${imageUrl}: ${error}`);
      return null;
    }
  }

  /**
   * Extract dimensions from WordPress filename pattern (e.g., image-300x200.jpg)
   */
  private extractDimensionsFromFilename(
    imageUrl: string
  ): ImageDimensions | null {
    const dimensionMatch = imageUrl.match(
      /-(\d+)x(\d+)\.(jpg|jpeg|png|gif|webp)$/i
    );
    if (dimensionMatch) {
      const width = parseInt(dimensionMatch[1]);
      const height = parseInt(dimensionMatch[2]);
      return {
        width,
        height,
        aspectRatio: width / height,
      };
    }
    return null;
  }

  /**
   * Determine optimal image position based on dimensions
   */
  private determineImagePosition(dimensions: ImageDimensions): string {
    if (!this.positioningConfig.enableSmartPositioning) {
      return ""; // No positioning, use default (center)
    }

    const { aspectRatio, width } = dimensions;

    // Small images should be positioned left or right to allow text flow
    if (width < this.positioningConfig.smallImageThreshold) {
      // Alternate left/right for visual variety (could be made more sophisticated)
      return Math.random() > 0.5 ? "!<" : "!>";
    }

    // Square or near-square images work well centered
    if (Math.abs(aspectRatio - 1) < this.positioningConfig.squareThreshold) {
      return ""; // Center (default)
    }

    // Portrait images (tall) work well centered
    if (aspectRatio < this.positioningConfig.portraitThreshold) {
      return ""; // Center (default)
    }

    // Wide landscape images work well centered to show full content
    if (aspectRatio > this.positioningConfig.landscapeThreshold) {
      return ""; // Center (default)
    }

    // Medium landscape images can be positioned left/right
    if (
      aspectRatio > 1 &&
      aspectRatio <= this.positioningConfig.landscapeThreshold
    ) {
      return Math.random() > 0.5 ? "!<" : "!>";
    }

    // Default to center for any other cases
    return "";
  }

  /**
   * Enhanced image processing with smart positioning - now generates JSX Image components
   */
  async processImageWithPositioning(
    imgElement: Element,
    originalSrc: string
  ): Promise<string> {
    const alt = imgElement.getAttribute("alt") || "";
    const title = imgElement.getAttribute("title") || "";

    let caption = title;
    let position = "center"; // Default position

    // Check if the title already contains positioning syntax
    const existingPositionMatch = title.match(/^(!<?[<>|_]?)(.*)/);
    if (existingPositionMatch) {
      const positionPrefix = existingPositionMatch[1];
      caption = existingPositionMatch[2];

      // Convert positioning syntax to position prop
      switch (positionPrefix) {
        case "!<":
          position = "left";
          break;
        case "!>":
          position = "right";
          break;
        default:
          position = "center";
      }
    } else if (this.positioningConfig.enableSmartPositioning) {
      // Analyze image dimensions and determine smart positioning
      try {
        const dimensions = await this.getImageDimensions(originalSrc);
        if (dimensions) {
          const smartPositionPrefix = this.determineImagePosition(dimensions);

          // Convert positioning prefix to position prop
          switch (smartPositionPrefix) {
            case "!<":
              position = "left";
              break;
            case "!>":
              position = "right";
              break;
            default:
              position = "center";
          }

          logger.debug(
            `Smart positioning for ${originalSrc}: ${position} (${dimensions.width}x${dimensions.height}, AR: ${dimensions.aspectRatio.toFixed(2)})`
          );
        }
      } catch (error) {
        logger.debug(`Failed to analyze image for smart positioning: ${error}`);
      }
    }

    // Extract the actual filename from WordPress URL and remove dimension suffix
    let filename = originalSrc.split("/").pop() || "";

    // Handle WordPress URLs with dimension suffixes (e.g., image-300x200.jpg -> image.jpg)
    if (originalSrc.includes("wp-content/uploads")) {
      filename = this.stripWordPressDimensionSuffix(filename);
    }

    // Create import variable name
    const importName = `BlogImage_${this.imageCounter++}`;

    // Store the import mapping
    this.imageImports.set(importName, filename);

    // Generate JSX Image component
    // Ensure we use ASCII quotes in JSX, not German quotes
    // Clean both the content AND any stray quotes that might be around attribute values
    let cleanAlt = alt.replace(/[„""''‚'"`«»‹›]/g, '"');
    let cleanCaption = caption.replace(/[„""''‚'"`«»‹›]/g, '"');

    // Remove any quotes at the beginning or end that would interfere with JSX
    cleanAlt = cleanAlt.replace(/^["„"]+|["„"]+$/g, "");
    cleanCaption = cleanCaption.replace(/^["„"]+|["„"]+$/g, "");

    const jsx = `<Image src={${importName}} alt="${cleanAlt}" />`;

    return jsx;
  }

  /**
   * Strip WordPress dimension suffixes from filenames
   */
  private stripWordPressDimensionSuffix(filename: string): string {
    // Remove WordPress dimension suffixes like -300x200, -1024x768, etc.
    // but keep the file extension
    return filename.replace(/-\d+x\d+(\.[^.]+)$/, "$1");
  }

  /**
   * Add image imports to the beginning of the MDX content (right after frontmatter)
   */
  private addImageImports(markdown: string): string {
    logger.debug(
      `Adding image imports. Found ${this.imageImports.size} images to import`
    );

    if (this.imageImports.size === 0) {
      return markdown;
    }

    const imports = Array.from(this.imageImports.entries())
      .map(
        ([importName, filename]) =>
          `import ${importName} from "./images/${filename}";`
      )
      .join("\n");

    const imageImport = `import { Image } from "astro:assets";`;
    const allImports = `${imports}\n${imageImport}`;

    logger.debug(`Generated imports: ${allImports}`);

    // Insert imports at the very beginning (assuming no frontmatter in the markdown content)
    return `${allImports}\n\n${markdown}`;
  }
}
