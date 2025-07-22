import { SITE } from "@/config";
import { logger } from "@/utils/logger";
import { processAllPosts } from "@/utils/posts";
import rss from "@astrojs/rss";

export async function GET() {
  // Temporary fix: Simplify RSS generation to avoid schema issues
  try {
    const sortedPosts = await processAllPosts();
    return rss({
      title: SITE.title,
      description: SITE.desc,
      site: SITE.website,
      items: sortedPosts.slice(0, 10).map(({ data, id }) => ({
        link: `${SITE.website}/posts/${id}/`,
        title: data.title,
        description: data.description || data.title,
        pubDate: new Date(data.pubDatetime),
      })),
    });
  } catch (error) {
    logger.error("RSS generation failed:", error);
    // Return minimal RSS feed as fallback
    return rss({
      title: SITE.title,
      description: SITE.desc,
      site: SITE.website,
      items: [],
    });
  }
}
