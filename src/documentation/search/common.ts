/**
 * Shared between the search worker and client code.
 *
 * We only need type definitions of the content.
 *
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT */
import type { ApiDocsResponse } from "../../language-server/apidocs";
import type { RouterState } from "../../router-hooks";
import type { Toolkit } from "../reference/model";

/**
 * A sidebar section's content for indexing.
 */
export interface SearchableSection {
  id: string;
  title: string;
  toolkit: Toolkit;
}

export interface Search {
  search(text: string): Promise<SearchResults>;
  index(sections: SearchableSection[], api: ApiDocsResponse): void;
}

export interface SectionResults {
  id: string;
  title: string;
  results: Result[];
}

export interface SearchResults {
  sections: SectionResults[];
  api: Result[];
}

export interface Result {
  id: string;
  navigation: RouterState;
  containerTitle: string;
  title: string;
  extract: Extracts;
}

export interface Extract {
  type: "text" | "match";
  extract: string;
}

export interface Extracts {
  title: Extract[];
  content: Extract[];
}

export interface IndexMessage {
  kind: "index";
  sections: SearchableSection[];
  api: ApiDocsResponse;
}

export interface QueryMessage {
  kind: "query";
  query: string;
}

export interface QueryResponseMessage extends SearchResults {
  kind: "queryResponse";
}

export type Message = IndexMessage | QueryMessage | QueryResponseMessage;
