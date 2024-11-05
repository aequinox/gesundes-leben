import { contentManager } from "./content";

export const getAuthorEntry = async (author: string | { slug: string }) => {
  return contentManager.authors.getAuthorEntry(author);
};
