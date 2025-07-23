// import { replaceRelativeLinks } from "./remark-img-links";
import { remarkHashtag } from "./remark-hashtag";
import { remarkReadingTime } from "./remark-reading-time";
import remarkSectionize from "./sectionize";
import type { RemarkPlugins } from "astro";
import remarkCollapse from "remark-collapse";
import remarkToc from "remark-toc";

export const remarkPlugins: RemarkPlugins = [
  remarkReadingTime,
  [
    remarkToc,
    {
      heading: "Inhaltsverzeichnis",
      maxDepth: 4,
      tight: true,
      ordered: false,
    },
  ],
  [
    remarkCollapse,
    {
      test: "Inhaltsverzeichnis",
      summary: "",
      // summary: (str: string) => `${str} anzeigen`,
      // text is handled in typography.css
    },
  ],
  remarkSectionize,
  remarkHashtag,
  // replaceRelativeLinks({ prefixUrl: "/assets/images" }),
];
