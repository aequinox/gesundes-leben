import type { APIRoute } from "astro";
import { getCollection, type CollectionEntry } from "astro:content";
import { generateOgImageForPost } from "@/utils/generateOgImages";
import { slugService } from "@/services/format/SlugService";

export async function getStaticPaths() {
  const posts = await getCollection("blog").then(
    (p: CollectionEntry<"blog">[]) =>
      p.filter(({ data }) => !data.draft && !data.ogImage)
  );

  return posts.map((post: CollectionEntry<"blog">) => ({
    params: { slug: slugService.slugifyStr(post.data.title) },
    props: post,
  }));
}

export const GET: APIRoute = async ({ props }) =>
  new Response(await generateOgImageForPost(props as CollectionEntry<"blog">), {
    headers: { "Content-Type": "image/png" },
  });
