import TurndownService from "turndown";
import { gfm } from "turndown-plugin-gfm";

import { XmlConversionError } from "./errors.js";
import type { XmlConverterConfig, ImageImport, RawXmlItem } from "./types.js";

// DOM Node interface for Turndown rules - simple type casting interface
interface DOMNode {
  nodeName: string;
  outerHTML: string;
  textContent?: string | null;
  previousSibling?: DOMNode | null;
  attributes?: Record<string, string>;
  getAttribute(name: string): string | null;
  querySelector?(selector: string): DOMNode | null;
  
  // Additional HTMLElement properties that may be used by Turndown
  tagName?: string;
  className?: string;
  id?: string;
}

// Extend TurndownService type to include our custom property
interface ExtendedTurndownService extends TurndownService {
  _imageImports?: ImageImport[];
}

/**
 * Generate a valid JavaScript variable name from an image filename
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

// TurndownService type is imported from the turndown package

/**
 * Initialize TurndownService with custom rules for WordPress content
 */
function initTurndownService(): ExtendedTurndownService {
  const turndownService = new TurndownService({
    headingStyle: "atx",
    bulletListMarker: "-",
    codeBlockStyle: "fenced",
  });

  turndownService.use(gfm());

  // preserve embedded tweets
  turndownService.addRule("tweet", {
    filter: (node) =>
      (node as DOMNode).nodeName === "BLOCKQUOTE" &&
      (node as DOMNode).getAttribute("class") === "twitter-tweet",
    replacement: (_content: string, node) => `\n\n${(node as DOMNode).outerHTML}`,
  });

  // preserve embedded codepens
  turndownService.addRule("codepen", {
    filter: (node) => {
      // codepen embed snippets have changed over the years
      // but this series of checks should find the commonalities
      const domNode = node as DOMNode;
      return (
        ["P", "DIV"].includes(domNode.nodeName) &&
        Boolean(domNode.attributes?.["data-slug-hash"]) &&
        domNode.getAttribute("class") === "codepen"
      );
    },
    replacement: (_content: string, node) => `\n\n${(node as DOMNode).outerHTML}`,
  });

  // preserve embedded scripts (for tweets, codepens, gists, etc.)
  turndownService.addRule("script", {
    filter: "script",
    replacement: (_content: string, node) => {
      const domNode = node as DOMNode;
      let before = "\n\n";
      if (domNode.previousSibling && domNode.previousSibling.nodeName !== "#text") {
        // keep twitter and codepen <script> tags snug with the element above them
        before = "\n";
      }
      const html = domNode.outerHTML.replace('async=""', "async");
      return `${before + html}\n\n`;
    },
  });

  // iframe boolean attributes do not need to be set to empty string
  turndownService.addRule("iframe", {
    filter: "iframe",
    replacement: (_content: string, node) => {
      const domNode = node as DOMNode;
      const html = domNode.outerHTML
        .replace('allowfullscreen=""', "allowfullscreen")
        .replace('allowpaymentrequest=""', "allowpaymentrequest");
      return `\n\n${html}\n\n`;
    },
  });

  // convert <figure> with images to Astro <Image> components
  turndownService.addRule("figure", {
    filter: "figure",
    replacement: (_content: string, node) => {
      const domNode = node as DOMNode;
      const img = domNode.querySelector?.("img") || null;
      const figcaption = domNode.querySelector?.("figcaption") || null;

      if (img) {
        // Extract image details
        const src = img.getAttribute("src") || "";
        const alt = img.getAttribute("alt") || "";

        // Generate image variable name from filename
        const filename = src.split("/").pop() || "image";
        const imageVar = generateImageVariableName(filename);

        // Store image import for later use (will be added to frontmatter or imports)
        const extendedService = turndownService as ExtendedTurndownService;
        if (!extendedService._imageImports) {
          extendedService._imageImports = [];
        }
        extendedService._imageImports.push({
          variable: imageVar,
          path: src.includes("images/")
            ? `./${src}`
            : `./images/${src.split("/").pop()}`,
          filename,
        });

        // Generate Astro Image component
        let imageComponent = `<Image\n  src={${imageVar}}\n  alt="${alt.replace(/"/g, "&quot;")}"`;

        // Determine position from figure classes or default to center
        let position = "center";
        const figureClass = domNode.getAttribute("class") || "";

        if (
          figureClass.includes("align-right") ||
          figureClass.includes("float-right")
        ) {
          position = "right";
        } else if (
          figureClass.includes("align-left") ||
          figureClass.includes("float-left")
        ) {
          position = "left";
        } else if (
          figureClass.includes("align-center") ||
          figureClass.includes("center")
        ) {
          position = "center";
        }

        // Check for WordPress alignment classes as well
        if (figureClass.includes("alignright")) {
          position = "right";
        } else if (figureClass.includes("alignleft")) {
          position = "left";
        } else if (figureClass.includes("aligncenter")) {
          position = "center";
        }

        imageComponent += `\n  position="${position}"`;

        imageComponent += "\n/>";

        return `\n\n${imageComponent}\n\n`;
      } else if (figcaption) {
        // Preserve figures without images but with captions
        const result = `\n\n<figure>\n\n${_content}\n\n</figure>\n\n`;
        return result.replace("\n\n\n\n", "\n\n"); // collapse quadruple newlines
      } else {
        // does not contain image or figcaption, do not preserve
        return _content;
      }
    },
  });

  // preserve <figcaption>
  turndownService.addRule("figcaption", {
    filter: "figcaption",
    replacement: content => {
      // extra newlines are necessary for markdown and HTML to render correctly together
      return `\n\n<figcaption>\n\n${content}\n\n</figcaption>\n\n`;
    },
  });

  // convert <pre> into a code block with language when appropriate
  turndownService.addRule("pre", {
    filter: (node) => {
      // a <pre> with <code> inside will already render nicely, so don't interfere
      const domNode = node as DOMNode;
      return domNode.nodeName === "PRE" && !(domNode.querySelector?.("code"));
    },
    replacement: (_content: string, node) => {
      const domNode = node as DOMNode;
      const language = domNode.getAttribute("data-wetm-language") || "";
      return `\n\n\`\`\`${language}\n${domNode.textContent || ""}\n\`\`\`\n\n`;
    },
  });

  return turndownService as ExtendedTurndownService;
}

/**
 * Convert post HTML content to Markdown
 * @throws {XmlConversionError} When content conversion fails
 */
function getPostContent(
  postData: RawXmlItem,
  turndownService: ExtendedTurndownService,
  config: XmlConverterConfig
): { content: string; imageImports: ImageImport[] } {
  try {
    if (!postData.encoded || !postData.encoded[0]) {
      throw new XmlConversionError("Post content is missing");
    }

    let content = postData.encoded[0];

    // insert an empty div element between double line breaks
    // this nifty trick causes turndown to keep adjacent paragraphs separated
    // without mucking up content inside of other elements (like <code> blocks)
    content = content.replace(/(\r?\n){2}/g, "\n<div></div>\n");

    if (config.saveScrapedImages) {
      // writeImageFile() will save all content images to a relative /images
      // folder so update references in post content to match
      content = content.replace(
        /(<img[^>]*src=").*?([^/"]+\.(?:gif|jpe?g|png|webp))("[^>]*>)/gi,
        "$1images/$2$3"
      );
    }

    // preserve "more" separator, max one per post, optionally with custom label
    // by escaping angle brackets (will be unescaped during turndown conversion)
    content = content.replace(/<(!--more( .*)?--)>/, "&lt;$1&gt;");

    // some WordPress plugins specify a code language in an HTML comment above a
    // <pre> block, save it to a data attribute so the "pre" rule can use it
    content = content.replace(
      /(<!-- wp:.+? \{"language":"(.+?)"\} -->\r?\n<pre )/g,
      '$1data-wetm-language="$2" '
    );

    // Clear any previous image imports
    turndownService._imageImports = [];

    // use turndown to convert HTML to Markdown
    content = turndownService.turndown(content);

    // clean up extra spaces in list items
    content = content.replace(/(-|\d+\.) +/g, "$1 ");

    // Return both content and image imports
    const extendedService = turndownService as ExtendedTurndownService;
    return {
      content,
      imageImports: extendedService._imageImports || [],
    };
  } catch (error) {
    if (error instanceof XmlConversionError) {
      throw error;
    }
    throw new XmlConversionError("Failed to convert post content to Markdown", {
      originalError: error,
    });
  }
}

export { initTurndownService, getPostContent };
