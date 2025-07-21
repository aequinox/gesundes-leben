import TurndownService from "turndown";
import { gfm } from "turndown-plugin-gfm";
import { logger } from "./logger";

export class ContentTranslator {
  private turndownService: TurndownService;

  constructor() {
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
  convertToMDX(htmlContent: string, options: {
    generateTOC?: boolean;
    preserveWordPressShortcodes?: boolean;
    rewriteImagePaths?: boolean;
  } = {}): string {
    try {
      logger.debug("Converting HTML content to MDX");

      // Preprocess HTML content
      let processedContent = this.preprocessHTML(htmlContent, options);

      // Convert to Markdown
      let markdown = this.turndownService.turndown(processedContent);

      // Post-process Markdown
      markdown = this.postprocessMarkdown(markdown, options);

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
  private postprocessMarkdown(markdown: string, options: any): string {
    let processed = markdown;

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
   * Add custom Turndown rules for WordPress elements
   */
  private addCustomRules(): void {
    // Handle WordPress figure elements
    this.turndownService.addRule("wpFigure", {
      filter: "figure",
      replacement: (content, node) => {
        const figcaption = (node as Element).querySelector("figcaption");
        const img = (node as Element).querySelector("img");
        
        if (img && figcaption) {
          const imgMarkdown = this.turndownService.turndown(img.outerHTML);
          const caption = figcaption.textContent?.trim() || "";
          return `${imgMarkdown}\n\n*${caption}*\n\n`;
        }
        return content;
      },
    });

    // Handle WordPress blockquotes with citations
    this.turndownService.addRule("wpBlockquote", {
      filter: (node) => {
        return node.nodeName === "BLOCKQUOTE" && 
               (node as Element).querySelector("cite");
      },
      replacement: (content, node) => {
        const cite = (node as Element).querySelector("cite");
        const citation = cite?.textContent?.trim() || "";
        return `> ${content.replace(/\n/g, "\n> ")}\n>\n> — ${citation}\n\n`;
      },
    });

    // Handle WordPress code blocks with language hints
    this.turndownService.addRule("wpCodeBlock", {
      filter: (node) => {
        return node.nodeName === "PRE" && 
               (node as Element).classList.contains("wp-block-code");
      },
      replacement: (content, node) => {
        const language = this.extractLanguageFromElement(node as Element);
        return `\`\`\`${language}\n${content}\n\`\`\`\n\n`;
      },
    });

    // Handle WordPress more tag
    this.turndownService.addRule("wpMore", {
      filter: (node) => {
        return (node as Element).classList?.contains("wp-block-more") || 
               (node as Comment)?.nodeValue?.includes("more");
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
      return videoId ? `\n<iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>\n` : "";
    });

    return content;
  }

  private removeWordPressShortcodes(content: string): string {
    // Remove all shortcodes
    return content.replace(/\[[^\]]+\]/g, "");
  }

  private handleGalleryShortcode(content: string): string {
    // Convert [gallery] shortcode to a simple image list
    return content.replace(/\[gallery[^\]]*\]/g, "\n<!-- Gallery images will be processed separately -->\n");
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
    html = html.replace(/<p>(\s*<\/?(?:div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math|ins|del)\b[^>]*>)/gi, "$1");

    return html;
  }

  /**
   * Improve German-specific content
   */
  private improveGermanContent(markdown: string): string {
    // Fix German quotation marks
    markdown = markdown.replace(/„([^"]*?)"/g, '„$1"');
    markdown = markdown.replace(/"([^"]*?)"/g, '„$1"');

    // Ensure proper spacing around German punctuation
    markdown = markdown.replace(/(\w)–(\w)/g, "$1 – $2");
    markdown = markdown.replace(/(\w)—(\w)/g, "$1 — $2");

    return markdown;
  }

  /**
   * Add German table of contents
   */
  private addTableOfContents(markdown: string): string {
    const tocHeader = "## Inhaltsverzeichnis\n\n";
    
    // If content already has a TOC, don't add another
    if (markdown.includes("Inhaltsverzeichnis") || markdown.includes("## Inhalt")) {
      return markdown;
    }

    // Add TOC placeholder at the beginning
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
    const match = params.match(/(?:v=|\/embed\/|\/watch\?v=|\/v\/|\.be\/|watch\?.*&v=)([^&\n?#]+)/);
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
      "Gesundheit", "Ernährung", "Vitamine", "Mineralien", "Mikronährstoffe",
      "Immunsystem", "Darm", "Mikrobiom", "Probiotika", "Antioxidantien",
      "Omega-3", "Vitamin D", "Magnesium", "Zink", "Eisen", "B-Vitamine"
    ];

    for (const keyword of healthKeywords) {
      if (markdown.toLowerCase().includes(keyword.toLowerCase())) {
        keywords.add(keyword);
      }
    }

    return Array.from(keywords);
  }
}