import { SITE } from "@/config";
import { getPath } from "@/utils/getPath";
import { processAllPosts } from "@/utils/posts";
import rss from "@astrojs/rss";

export async function GET() {
  // Use the unified post processing function
  const sortedPosts = await processAllPosts();
  return rss({
    title: SITE.title,
    description: SITE.desc,
    site: SITE.website,
    items: sortedPosts.map(({ data, id, filePath }) => ({
      link: getPath(id, filePath),
      title: data.title,
      description: data.description,
      pubDate: new Date(data.modDatetime ?? data.pubDatetime),
    })),
  });
}
