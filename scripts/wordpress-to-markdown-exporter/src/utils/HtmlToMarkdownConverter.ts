import TurndownService from "turndown";
import { gfm } from "turndown-plugin-gfm";

/**
 * Utility class for converting HTML to Markdown
 */
export class HtmlToMarkdownConverter {
  private static instance: TurndownService;

  /**
   * Get a configured Turndown service instance
   * @returns Turndown service instance
   */
  public static getInstance(): TurndownService {
    if (!HtmlToMarkdownConverter.instance) {
      HtmlToMarkdownConverter.instance = HtmlToMarkdownConverter.createInstance();
    }
    return HtmlToMarkdownConverter.instance;
  }

  /**
   * Create a new Turndown service instance with custom rules
   * @returns Turndown service instance
   */
  private static createInstance(): TurndownService {
    const turndownService = new TurndownService({
      headingStyle: "atx",
      bulletListMarker: "-",
      codeBlockStyle: "fenced",
    });

    // Use GitHub Flavored Markdown plugin
    turndownService.use(gfm);

    // Add custom rules
    HtmlToMarkdownConverter.addCustomRules(turndownService);

    return turndownService;
  }

  /**
   * Add custom rules to Turndown service
   * @param turndownService Turndown service instance
   */
  private static addCustomRules(turndownService: TurndownService): void {
    // Preserve embedded tweets
    turndownService.addRule("tweet", {
      filter: (node) =>
        node.nodeName === "BLOCKQUOTE" &&
        node.getAttribute("class") === "twitter-tweet",
      replacement: (content, node) => "\n\n" + (node as HTMLElement).outerHTML,
    });

    // Preserve embedded codepens
    turndownService.addRule("codepen", {
      filter: (node) => {
        // Codepen embed snippets have changed over the years
        // but this series of checks should find the commonalities
        return (
          ["P", "DIV"].includes(node.nodeName) &&
          node.hasAttribute("data-slug-hash") &&
          node.getAttribute("class") === "codepen"
        );
      },
      replacement: (content, node) => "\n\n" + (node as HTMLElement).outerHTML,
    });

    // Preserve embedded scripts (for tweets, codepens, gists, etc.)
    turndownService.addRule("script", {
      filter: "script",
      replacement: (content, node) => {
        let before = "\n\n";
        if (
          node.previousSibling &&
          node.previousSibling.nodeName !== "#text"
        ) {
          // Keep twitter and codepen <script> tags snug with the element above them
          before = "\n";
        }
        const html = (node as HTMLElement).outerHTML.replace(
          'async=""',
          "async"
        );
        return before + html + "\n\n";
      },
    });

    // iframe boolean attributes do not need to be set to empty string
    turndownService.addRule("iframe", {
      filter: "iframe",
      replacement: (content, node) => {
        const html = (node as HTMLElement).outerHTML
          .replace('allowfullscreen=""', "allowfullscreen")
          .replace('allowpaymentrequest=""', "allowpaymentrequest");
        return "\n\n" + html + "\n\n";
      },
    });

    // Preserve <figure> when it contains a <figcaption>
    turndownService.addRule("figure", {
      filter: "figure",
      replacement: (content, node) => {
        if (node.querySelector("figcaption")) {
          // Extra newlines are necessary for markdown and HTML to render correctly together
          const result =
            "\n\n<figure>\n\n" + content + "\n\n</figure>\n\n";
          return result.replace("\n\n\n\n", "\n\n"); // Collapse quadruple newlines
        } else {
          // Does not contain <figcaption>, do not preserve
          return content;
        }
      },
    });

    // Preserve <figcaption>
    turndownService.addRule("figcaption", {
      filter: "figcaption",
      replacement: (content) => {
        // Extra newlines are necessary for markdown and HTML to render correctly together
        return "\n\n<figcaption>\n\n" + content + "\n\n</figcaption>\n\n";
      },
    });

    // Convert <pre> into a code block with language when appropriate
    turndownService.addRule("pre", {
      filter: (node) => {
        // A <pre> with <code> inside will already render nicely, so don't interfere
        return node.nodeName === "PRE" && !node.querySelector("code");
      },
      replacement: (content, node) => {
        const language = node.getAttribute("data-wetm-language") || "";
        return (
          "\n\n```" + language + "\n" + node.textContent + "\n```\n\n"
        );
      },
    });
  }

  /**
   * Convert HTML to Markdown
   * @param html HTML content
   * @returns Markdown content
   */
  public static convert(html: string): string {
    if (!html) {
      return "";
    }

    // Insert an empty div element between double line breaks
    // This nifty trick causes turndown to keep adjacent paragraphs separated
    // without mucking up content inside of other elements (like <code> blocks)
    html = html.replace(/(\r?\n){2}/g, "\n<div></div>\n");

    // Preserve "more" separator, max one per post, optionally with custom label
    // by escaping angle brackets (will be unescaped during turndown conversion)
    html = html.replace(/<(!--more( .*)?--)>/, "&lt;$1&gt;");

    // Some WordPress plugins specify a code language in an HTML comment above a
    // <pre> block, save it to a data attribute so the "pre" rule can use it
    html = html.replace(
      /(<!-- wp:.+? \{"language":"(.+?)"\} -->\r?\n<pre )/g,
      '$1data-wetm-language="$2" '
    );

    // Use turndown to convert HTML to Markdown
    const markdown = HtmlToMarkdownConverter.getInstance().turndown(html);

    // Clean up extra spaces in list items
    return markdown.replace(/(-|\d+\.) +/g, "$1 ");
  }
}
