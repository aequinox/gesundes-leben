import { contentManager } from "./content";

export const getAuthorEntry = async (
  author: string | { collection: "authors"; id: string }
) => {
  return contentManager.authors.getAuthorEntry(author);
};
