import type { RemarkPlugins } from "astro";
import remarkCollapse from "remark-collapse";
import remarkToc from "remark-toc";
import { remarkReadingTime } from "./remark-reading-time";
import remarkSectionize from "./sectionize";
import { replaceRelativeLinks } from "./remark-img-links";

export const remarkPlugins: RemarkPlugins = [
  remarkReadingTime,
  [
    remarkToc,
    {
      heading: "Inhaltsverzeichnis",
      maxDepth: 4,
      ordered: false,
      tight: true,
    },
  ],
  [
    remarkCollapse,
    {
      test: "Inhaltsverzeichnis",
      summary: () => "Anzeigen",
    },
  ],
  remarkSectionize,
  replaceRelativeLinks({ prefixUrl: "/assets/images" }),
];
