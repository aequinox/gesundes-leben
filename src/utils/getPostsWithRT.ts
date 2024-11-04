import type { CollectionEntry } from "astro:content";
import { slugifyStr } from "@/utils/slugify";
import type { BlogFrontmatter } from "@/types/blog";

/**
 * Retrieves reading time data from blog post frontmatter.
 * @returns A map of post slugs to reading times.
 */
const fetchReadingTimeData = async (): Promise<
  Map<string, number | undefined>
> => {
  const globPosts = import.meta.glob(
    "../content/blog/**/*.md*"
  ) as unknown as Promise<BlogFrontmatter[]>;

  const readingTimeData = new Map<string, number | undefined>();
  const globPostsValues = Object.values(globPosts);

  await Promise.all(
    globPostsValues.map(async globPost => {
      const { frontmatter } = await globPost();
      if (frontmatter.title) {
        readingTimeData.set(
          slugifyStr(frontmatter.title),
          frontmatter.readingTime
        );
      }
    })
  );

  return readingTimeData;
};

/**
 * Adds reading time data to an array of blog posts.
 * @param posts - An array of blog posts.
 * @returns An array of blog posts with reading time data added.
 */
const addReadingTimeToPosts = async (
  posts: CollectionEntry<"blog">[]
): Promise<CollectionEntry<"blog">[]> => {
  const readingTimeData = await fetchReadingTimeData();

  return posts.map(post => {
    post.data.readingTime = readingTimeData.get(slugifyStr(post.data.title));
    return post;
  });
};

export default addReadingTimeToPosts;
