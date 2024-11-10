import type { RemarkPlugins } from "astro";
import remarkCollapse from "remark-collapse";
import remarkToc from "remark-toc";
import remarkSectionize from "./sectionize";
// import { replaceRelativeLinks } from "./remark-img-links";
// import { remarkReadingTime } from "./remark-reading-time";

export const remarkPlugins: RemarkPlugins = [
  // remarkReadingTime,
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
      summary: (str: string) => `${str} anzeigen`,
    },
  ],
  remarkSectionize,
  // replaceRelativeLinks({ prefixUrl: "/assets/images" }),
];
