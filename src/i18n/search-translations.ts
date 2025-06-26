import { getLangFromUrl, useTranslations } from "@/i18n/utils";

/**
 * Generates localized translations for Pagefind UI search component
 * @param url - The current URL to determine the language
 * @returns An object with localized search translations
 */
export function getSearchTranslations(url: URL) {
  const lang = getLangFromUrl(url);
  const t = useTranslations(lang);

  return {
    placeholder: t("search.placeholder"),
    clear_search: t("search.clear"),
    load_more: t("search.loadMore"),
    search_label: t("search.searchLabel"),
    filters_label: t("search.filtersLabel"),
    zero_results: t("search.zeroResults").replace(
      "[SEARCH_TERM]",
      "{searchTerm}"
    ),
    many_results: t("search.manyResults")
      .replace("[COUNT]", "{count}")
      .replace("[SEARCH_TERM]", "{searchTerm}"),
    one_result: t("search.oneResult")
      .replace("[COUNT]", "{count}")
      .replace("[SEARCH_TERM]", "{searchTerm}"),
    alt_search: t("search.altSearch")
      .replace("[SEARCH_TERM]", "{searchTerm}")
      .replace("[DIFFERENT_TERM]", "{differentTerm}"),
    search_suggestion: t("search.suggestion").replace(
      "[SEARCH_TERM]",
      "{searchTerm}"
    ),
    searching: t("search.searching").replace("[SEARCH_TERM]", "{searchTerm}"),
  };
}
