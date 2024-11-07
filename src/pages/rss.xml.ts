import rss from "@astrojs/rss";
import { getCollection, type CollectionEntry } from "astro:content";
import getSortedPosts from "@utils/getSortedPosts";
import { SITE } from "data/config";

export async function GET() {
  const posts = await getCollection("blog");
  const sortedPosts: CollectionEntry<"blog">[] = await getSortedPosts(posts);
  return rss({
    title: SITE.title,
    description: SITE.desc,
    site: SITE.website,
    items: sortedPosts.map(({ data, slug }) => ({
      link: `posts/${slug}/`,
      title: data.title,
      description: data.description,
      pubDate: new Date(data.modDatetime ?? data.pubDatetime),
    })),
  });
}
