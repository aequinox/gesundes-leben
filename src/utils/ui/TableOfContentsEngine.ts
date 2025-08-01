import { logger } from "../logger";

/**
 * Creates a table of contents (TOC) from headings in an article.
 */
export class TableOfContents {
  /**
   * The article element.
   */
  private article: HTMLElement | null;

  /**
   * The TOC list element.
   */
  private tocList: HTMLUListElement | null;

  /**
   * The headings in the article.
   */
  private headings: HTMLElement[];

  /**
   * The intersection observer.
   */
  private observer: IntersectionObserver;

  /**
   * Initializes the TOC.
   */
  constructor() {
    this.article = document.querySelector<HTMLElement>("#article");
    this.tocList = document.querySelector<HTMLUListElement>("#toc ul");

    // Try to find all headings in the document if article is not found
    if (!this.article) {
      this.headings = Array.from(
        document.body.querySelectorAll("h1, h2, h3, h4") || []
      );
    } else {
      this.headings = Array.from(
        this.article.querySelectorAll("h1, h2, h3, h4") || []
      );
    }

    // Remove the first element of the TOC which is the title of the TOC itself
    if (this.headings.length > 0) {
      const firstHeading = this.headings[0];

      // Check if the first heading is an H1 with the text "Inhaltsverzeichnis"
      const isTocHeading =
        (firstHeading.tagName === "H1" || firstHeading.tagName === "H2") &&
        /inhaltsverzeichnis/i.test(
          (firstHeading.textContent || "").trim().toLowerCase()
        );

      if (isTocHeading) {
        // Remove the first heading from the list
        this.headings = this.headings.slice(1);
      }
    }

    this.observer = new IntersectionObserver(
      (entries: IntersectionObserverEntry[]) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.setSelectedLinkById(entry.target.id);
          }
        });
      },
      {
        root: null,
        rootMargin: "-120px 0px -60% 0px", // Detection zone starts at 120px (sidebar position)
        threshold: [0.5],
      }
    );

    this.initialize();
  }

  /**
   * Selects the table of contents link with the given ID and scrolls it
   * into view if necessary.
   * @param selectedId - The ID of the heading element to select
   */
  private setSelectedLinkById(selectedId: string): void {
    const listItems = document.querySelectorAll<HTMLLIElement>("#toc li");
    listItems.forEach(item => item.classList.remove("selected"));

    const selectedLink = document.querySelector<HTMLAnchorElement>(
      `#toc a[href="#${selectedId}"]`
    );
    const listItem = selectedLink?.parentElement;
    if (listItem) {
      listItem.classList.add("selected");
      this.scrollIntoViewIfNeeded(listItem);
    }
  }

  /**
   * Smoothly scrolls the element into view if it is not already visible.
   * If the element is already fully visible within its container, does nothing.
   * @param element The element to scroll into view if necessary.
   */
  private scrollIntoViewIfNeeded(element: HTMLElement): void {
    const container = document.querySelector<HTMLElement>("#toc");
    if (!container) {
      return;
    }

    const { top: containerTop, bottom: containerBottom } =
      container.getBoundingClientRect();
    const { top: elementTop, bottom: elementBottom } =
      element.getBoundingClientRect();

    if (elementBottom > containerBottom || elementTop < containerTop) {
      element.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }

  /**
   * Creates an SVG element used as a section indicator in the table of contents.
   * The SVG is styled with predefined classes and attributes for consistent appearance.
   *
   * @returns The created SVG element
   */

  private createSvgElement(): SVGElement {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.classList.add("w-0", "h-0", "flex-none", "text-accent");
    svg.setAttribute("fill", "none");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("stroke-width", "2");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("aria-hidden", "true");
    svg.innerHTML =
      '<title>Section indicator</title><path stroke-linecap="round" stroke-linejoin="round" d="m12.75 15 3-3m0 0-3-3m3 3h-7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />';
    return svg;
  }

  /**
   * Creates a link element to a heading element, with proper accessibility attributes,
   * smooth scrolling behavior, and error handling.
   *
   * @param heading The heading element to link to
   * @returns The created link element
   */
  private createLink(heading: HTMLElement): HTMLAnchorElement {
    const link = document.createElement("a");

    // Ensure the heading has a valid ID and accessible name
    if (!heading.id) {
      // Get accessible name from heading
      const headingText = this.getAccessibleName(heading);
      heading.id = this.generateSafeId(headingText);
    }

    link.href = `#${heading.id}`;

    // Get only the direct text content, not including nested elements
    // This prevents duplication of text in headings with nested elements
    const textNodes = Array.from(heading.childNodes)
      .filter(node => node.nodeType === Node.TEXT_NODE)
      .map(node => node.textContent?.trim())
      .filter(text => text) // Filter out empty strings
      .join(" ");

    // If there's direct text content, use it; otherwise fall back to textContent
    const linkText = textNodes || heading.textContent?.trim() || "";

    // Ensure the link has an accessible name (inner text)
    link.textContent = linkText;

    // Add comprehensive accessibility attributes
    // Note: aria-label is not needed if the link has proper inner text
    // but we add it for additional context
    link.setAttribute("aria-label", `Jump to section: ${linkText}`);
    link.setAttribute("aria-describedby", `toc-heading`);

    // Add ARIA current for the active item
    if (window.location.hash === `#${heading.id}`) {
      link.setAttribute("aria-current", "location");
    }

    // Add smooth scrolling behavior with error handling
    link.addEventListener("click", e => {
      e.preventDefault();
      const targetId = link.getAttribute("href")?.substring(1);
      if (targetId) {
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          try {
            // Position heading just below the sidebar (top-24 = 96px + some margin)
            // This aligns the heading with the sidebar content area
            const elementTop =
              targetElement.getBoundingClientRect().top + window.scrollY;
            const sidebarOffset = 120; // 96px (top-24) + 24px margin
            const targetScrollPosition = elementTop - sidebarOffset;

            window.scrollTo({
              top: Math.max(0, targetScrollPosition),
              behavior: "smooth",
            });

            // Update URL without causing a page jump
            history.pushState(null, "", link.href);

            // Set focus to the target for accessibility
            // Only add tabindex temporarily and remove it after focus
            const hadTabIndex = targetElement.hasAttribute("tabindex");
            const oldTabIndex = targetElement.getAttribute("tabindex");

            targetElement.setAttribute("tabindex", "-1");
            targetElement.focus({ preventScroll: true });

            // Remove the tabindex after a short delay to prevent leaving
            // non-interactive elements permanently in the tab order
            setTimeout(() => {
              if (hadTabIndex && oldTabIndex) {
                targetElement.setAttribute("tabindex", oldTabIndex);
              } else {
                targetElement.removeAttribute("tabindex");
              }
            }, 100);

            // Announce to screen readers
            const announcement = document.createElement("div");
            announcement.setAttribute("aria-live", "polite");
            announcement.setAttribute("class", "sr-only");
            announcement.textContent = `Navigated to section: ${linkText}`;
            document.body.appendChild(announcement);
            setTimeout(() => document.body.removeChild(announcement), 1000);

            // Update selected state in TOC
            this.setSelectedLinkById(targetId);
          } catch (error) {
            logger.error("Error navigating to section", targetId, ":", error);
            // Fallback to standard navigation if smooth scroll fails
            window.location.hash = targetId;
          }
        } else {
          logger.warn("Target element with ID", targetId, "not found");
        }
      }
    });

    return link;
  }

  /**
   * Creates a list item for a heading in the table of contents.
   * The list item contains a link to the heading with a smooth scrolling
   * behavior and an SVG icon indicating the section depth.
   * @param heading - The heading element to create a list item for.
   * @returns The created list item.
   */
  private createListItem(heading: HTMLElement): HTMLLIElement {
    const listItem = document.createElement("li");
    const headingLevel = heading.tagName.toLowerCase();
    listItem.className = `toc-level-${headingLevel}`;

    // Apply indentation directly via inline styles
    const indentationMap: Record<string, string> = {
      h1: "0px",
      h2: "8px",
      h3: "16px",
      h4: "24px",
    };

    if (indentationMap[headingLevel]) {
      listItem.style.marginLeft = indentationMap[headingLevel];
      listItem.style.paddingLeft = "0px";
    }

    const svg = this.createSvgElement();
    const link = this.createLink(heading);

    listItem.appendChild(svg);
    listItem.appendChild(link);

    return listItem;
  }

  /**
   * Initializes the table of contents.
   * This method iterates over the headings, ensures they have IDs for proper linking,
   * and creates list items for each heading. The observer is then set up to watch for
   * the intersection of the headings with the viewport. Finally, keyboard navigation is
   * added for accessibility and a beforeunload event listener is set up to disconnect
   * the observer when the page is unloaded.
   */
  private initialize(): void {
    // Check if the TOC list element and headings exist
    if (!this.tocList || !this.headings.length) {
      logger.warn("TOC list or headings not found, returning early");
      return;
    }

    // Clear existing TOC items if any
    while (this.tocList.firstChild) {
      this.tocList.removeChild(this.tocList.firstChild);
    }

    // Ensure headings have IDs for proper linking
    this.headings.forEach((heading, index) => {
      // Generate an ID if the heading doesn't have one
      if (!heading.id) {
        const headingText = heading.textContent?.trim() || `heading-${index}`;
        heading.id = this.generateSafeId(headingText);
      }

      const listItem = this.createListItem(heading);
      this.tocList?.appendChild(listItem);

      // Only observe elements that exist in the DOM
      try {
        this.observer.observe(heading);
      } catch (error) {
        logger.error(
          "Failed to observe heading:",
          heading.id,
          ". Error:",
          error
        );
      }
    });

    // Add keyboard navigation for accessibility
    this.addKeyboardNavigation();

    window.addEventListener("beforeunload", () => {
      this.observer.disconnect();
    });
  }

  /**
   * Returns the accessible name of an element.
   * The accessible name is the text that would be announced by a screen reader
   * when the element is focused. This method checks for aria-label, aria-labelledby,
   * img with alt text, and title in an SVG. If none of those are present,
   * it falls back to the element's inner text.
   * @param element The element to get the accessible name for.
   * @returns The accessible name of the element.
   */
  private getAccessibleName(element: HTMLElement): string {
    // Check for aria-label
    const ariaLabel = element.getAttribute("aria-label");
    if (ariaLabel) {
      return ariaLabel;
    }

    // Check for aria-labelledby
    const ariaLabelledBy = element.getAttribute("aria-labelledby");
    if (ariaLabelledBy) {
      const labelElement = document.getElementById(ariaLabelledBy);
      if (labelElement && labelElement.textContent) {
        return labelElement.textContent.trim();
      }
    }

    // Check for img with alt text
    const img = element.querySelector("img");
    if (img) {
      const altText = img.getAttribute("alt");
      if (altText) {
        return altText;
      }
    }

    // Check for SVG with title
    const svg = element.querySelector("svg");
    if (svg) {
      const titleElement = svg.querySelector("title");
      if (titleElement && titleElement.textContent) {
        return titleElement.textContent.trim();
      }
    }

    // Fall back to inner text
    return element.textContent?.trim() || "section";
  }

  /**
   * Generates a safe ID string based on the given text.
   * The generated ID string is:
   * - lowercased
   * - has spaces replaced with hyphens
   * - has all special characters removed
   * - has multiple hyphens replaced with a single hyphen
   * - has leading and trailing hyphens removed
   * If the generated ID string is empty, it defaults to "section".
   * @param text The text to generate a safe ID from
   * @returns The generated safe ID string
   */
  private generateSafeId(text: string): string {
    // Convert to lowercase, replace spaces with hyphens, remove special chars
    return (
      text
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]/g, "")
        .replace(/--+/g, "-")
        .replace(/^-+|-+$/g, "") || "section"
    );
  }

  /**
   * Adds keyboard navigation to the table of contents.
   * This method iterates over each link in the table of contents and adds an event
   * listener for the "keydown" event. When an arrow key is pressed, it focuses the
   * corresponding link. When the Home or End key is pressed, it focuses the first
   * or last link, respectively. Finally, it adds an ARIA role to the list for better
   * screen reader support.
   */
  private addKeyboardNavigation(): void {
    if (!this.tocList) {
      return;
    }

    // Add keyboard event listeners to each link instead of the list
    const links = Array.from(this.tocList.querySelectorAll("a"));

    links.forEach((link, index) => {
      // Ensure links are properly focusable (they are by default)
      link.addEventListener("keydown", event => {
        const items = links;
        if (!items.length) {
          return;
        }

        switch (event.key) {
          case "ArrowDown": {
            event.preventDefault();
            const nextIndex = index < items.length - 1 ? index + 1 : 0;
            (items[nextIndex] as HTMLElement).focus();
            break;
          }
          case "ArrowUp": {
            event.preventDefault();
            const prevIndex = index > 0 ? index - 1 : items.length - 1;
            (items[prevIndex] as HTMLElement).focus();
            break;
          }
          case "Home":
            event.preventDefault();
            (items[0] as HTMLElement).focus();
            break;
          case "End":
            event.preventDefault();
            (items[items.length - 1] as HTMLElement).focus();
            break;
        }
      });
    });

    // Add ARIA role to the list for better screen reader support
    this.tocList.setAttribute("role", "navigation");
  }
}

export class ScrollProgress {
  /**
   * Represents a scroll progress bar.
   */
  private progressBars: HTMLElement[];
  /**
   * The article element that we scroll through.
   */
  private article: HTMLElement | null;
  /**
   * Whether we are currently ticking.
   */
  private ticking: boolean;

  /**
   * Creates a new instance of the ScrollProgress class.
   */
  constructor() {
    this.progressBars = Array.from(
      document.querySelectorAll<HTMLElement>(
        "#progress-top, #progress-aside, #progress-mobile"
      )
    );
    this.article = document.querySelector("article");
    this.ticking = false;
  }

  /**
   * Updates the scroll progress bar.
   *
   * This function is debounced and should be called on window scroll events.
   *
   * @remarks
   * The function updates the width of the progress bar elements and sets the
   * aria-valuenow attribute to the current progress percentage.
   */
  public update(): void {
    if (this.ticking) {
      return;
    }

    this.ticking = true;
    requestAnimationFrame(() => {
      if (!this.article) {
        this.ticking = false;
        return;
      }

      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight =
        document.documentElement.scrollHeight - windowHeight;

      const progress = Math.max(
        0,
        Math.min(100, (scrollPosition / documentHeight) * 100)
      );

      this.progressBars.forEach(bar => {
        bar.style.width = `${progress}%`;
        bar.setAttribute("aria-valuenow", progress.toString());
      });

      this.ticking = false;
    });
  }
}

export class BackToTopButton {
  /**
   * The back-to-top button element.
   */
  private button: HTMLElement | null;

  /**
   * Constructs a new BackToTopButton instance and initializes it.
   */
  constructor() {
    this.button = document.getElementById("back-to-top");
    this.initialize();
  }

  /**
   * Initializes the back-to-top button by adding a click event listener
   * that smoothly scrolls the window to the top.
   */
  private initialize(): void {
    this.button?.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
}
