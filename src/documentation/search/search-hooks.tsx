/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { debounce } from "../../common/debounce-util";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import useIsUnmounted from "../../common/use-is-unmounted";
import { useLogging } from "../../logging/logging-hooks";
import { useSettings } from "../../settings/settings";
import { useDocumentation } from "../documentation-hooks";
import { docsSections, localize } from "../sections/config";
import { DocsSections } from "../sections/content";
import { SearchableSection, SearchResults } from "./common";
import { WorkerSearch } from "./search-client";

type UseSearch = {
  results: SearchResults | undefined;
  query: string;
  setQuery: (newQuery: string) => void;
};

const SearchContext = createContext<UseSearch | undefined>(undefined);

export const useSearch = (): UseSearch => {
  const value = useContext(SearchContext);
  if (!value) {
    throw new Error("Missing provider!");
  }
  return value;
};

const SearchProvider = ({ children }: { children: ReactNode }) => {
  const { sections } = useDocumentation();
  const [query, setQuery] = useState<string>("");
  const [results, setResults] = useState<SearchResults | undefined>();
  const isUnmounted = useIsUnmounted();
  const logging = useLogging();
  const [{ languageId }] = useSettings();
  const search = useRef<WorkerSearch>();
  const searchLogged = useRef(false);

  useEffect(() => {
    if (languageId !== search.current?.language) {
      search.current?.dispose();
      search.current = new WorkerSearch(languageId);
      setQuery("");
      setResults(undefined);
      searchLogged.current = false;
    }
    if (sections.status === "ok" && sections.languageId === languageId) {
      search.current.index(
        searchableSections(sections.content, languageId),
        {}
      );
    }
  }, [languageId, sections]);

  const debouncedSearch = useMemo(
    () =>
      debounce(async (newQuery: string) => {
        if (!search.current) {
          return;
        }
        const trimmedQuery = newQuery.trim();
        if (trimmedQuery) {
          const results = await search.current.search(trimmedQuery);
          if (!isUnmounted()) {
            if (!searchLogged.current) {
              logging.event({ type: "docs_search" });
              searchLogged.current = true;
            }
            setResults(results);
          }
        } else {
          setResults(undefined);
          searchLogged.current = false;
        }
      }, 300),
    [setResults, isUnmounted, logging]
  );

  useEffect(() => {
    debouncedSearch(query);
  }, [debouncedSearch, query]);

  const value: UseSearch = useMemo(
    () => ({ results, query, setQuery }),
    [results, query, setQuery]
  );
  return (
    <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
  );
};

/**
 * Cards are indexed as topics without entries.
 */
const searchableSections = (
  sections: DocsSections,
  languageId: string
): SearchableSection[] =>
  docsSections.flatMap((config) => {
    const content = sections[config.id];
    if (!content) {
      return [];
    }
    const title = localize(config.title, languageId);
    const toolkit =
      content.layout === "reference"
        ? content.toolkit
        : {
            id: config.id,
            name: title,
            description: "",
            language: languageId,
            contents: content.cards.map((card) => ({
              name: card.name,
              subtitle: "",
              slug: card.slug,
              compatibility: card.compatibility,
              introduction: card.content,
            })),
          };
    return [{ id: config.id, title, toolkit }];
  });

export default SearchProvider;
