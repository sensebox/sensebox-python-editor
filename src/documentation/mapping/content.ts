/**
 * Mapping from API entries to documentation, read from content/mapping.json.
 *
 * (c) 2021-2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
const mappingFiles = import.meta.glob<RawMapping>("/content/mapping.json", {
  import: "default",
  eager: true,
});

/**
 * Module name to API entry to link target. The target is either
 * "section/slug" or an object with an alternative to preselect.
 */
type RawMapping = Record<
  string,
  Record<string, string | { reference: string; alternative?: string }>
>;

export type ApiReferenceMap = Record<
  string,
  Record<string, ReferenceLinkDetail>
>;

export interface ReferenceLinkDetail {
  /**
   * The sidebar section id. If absent the section containing the slug is used.
   */
  section?: string;
  referenceLink: string;
  alternative?: string;
}

export const adaptMapping = (raw: RawMapping): ApiReferenceMap => {
  const map: ApiReferenceMap = {};
  for (const [moduleName, items] of Object.entries(raw)) {
    for (const [apiEntry, target] of Object.entries(items)) {
      const { reference, alternative } =
        typeof target === "string" ? { reference: target } : target;
      const parts = reference.split("/").filter(Boolean);
      const [section, referenceLink] =
        parts.length > 1 ? parts : [undefined, parts[0]];
      if (referenceLink) {
        map[moduleName] = {
          ...map[moduleName],
          [apiEntry]: { section, referenceLink, alternative },
        };
      }
    }
  }
  return map;
};

export const fetchMappingData = async (): Promise<ApiReferenceMap> =>
  adaptMapping(Object.values(mappingFiles)[0] ?? {});
