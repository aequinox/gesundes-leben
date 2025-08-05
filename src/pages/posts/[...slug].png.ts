import type { APIRoute } from "astro";

import { SITE } from "@/config";
import { generateOgImageForPost } from "@/utils/generateOgImages";
import { processAllPosts } from "@/utils/posts";
import { getPostSlug } from "@/utils/slugs";
import type { Post } from "@/utils/types";

export async function getStaticPaths() {
  if (!SITE.dynamicOgImage) {
    return [];
  }

  // Use the unified post processing function and filter for posts without OG images
  const posts = await processAllPosts({ includeDrafts: false }).then(p =>
    p.filter(({ data }) => !data.ogImage)
  );

  return posts.map((post: Post) => ({
    params: { slug: getPostSlug(post) },
    props: post,
  }));
}

export const GET: APIRoute = async ({ props }) => {
  if (!SITE.dynamicOgImage) {
    return new Response(null, {
      status: 404,
      statusText: "Not found",
    });
  }

  const buffer = await generateOgImageForPost(props as Post);
  return new Response(new Uint8Array(buffer), {
    headers: { "Content-Type": "image/png" },
  });
};
