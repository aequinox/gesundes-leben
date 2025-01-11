import { contentManager } from "./content";

export const getAuthorEntry = async (
  author: string | { collection: "authors"; id: string }
) => {
  try {
    return await contentManager.authors.getAuthorEntry(author);
  } catch (error) {
    console.error("Error fetching author entry:", error);
    return null;
  }
};
