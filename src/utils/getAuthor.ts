import { getEntry } from "astro:content";

export const getAuthorEntry = async (author: string | { slug: string }) => {
  let authorEntry: any = null; // Initialize authorEntry outside the if block
  if (typeof author === 'string') {
    authorEntry = await getEntry('authors', author);
  } else {
    authorEntry = await getEntry('authors', author.slug);
  }
  return authorEntry;
};