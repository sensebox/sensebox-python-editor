/**
 * Sidebar configuration read from content/sidebar.json.
 *
 * The documentation tabs in the sidebar are driven entirely by this file.
 * See docs/content.md for the format.
 *
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import rawConfig from "../../../content/sidebar.json";

/**
 * "reference": topics with expandable entries and draggable code.
 * "cards": a grid of cards that each open a page (like the original Ideas).
 */
export type SectionLayout = "reference" | "cards";

/**
 * Either a plain string or a map from language id to string.
 */
export type LocalizedString = string | Record<string, string>;

export interface DocsSectionConfig {
  kind: "section";
  id: string;
  layout: SectionLayout;
  icon?: string;
  /** Optional category accent colour. */
  accentColor?: string;
  /** Show the entries immediately when this section contains one topic. */
  direct?: boolean;
  title: LocalizedString;
  description?: LocalizedString;
  /**
   * File names (without .md) in display order. Files not listed are appended
   * in alphabetical order.
   */
  order?: string[];
}

export interface BuiltinTabConfig {
  kind: "builtin";
  id: "api";
}

export type SidebarEntry = DocsSectionConfig | BuiltinTabConfig;

export interface SidebarConfig {
  fallbackLanguage: string;
  entries: SidebarEntry[];
}

const reservedIds = new Set(["api", "project"]);
const validId = /^[a-z0-9][a-z0-9-]*$/;

export const parseSidebarConfig = (raw: any): SidebarConfig => {
  if (!raw || !Array.isArray(raw.sections)) {
    throw new Error("content/sidebar.json must have a sections array");
  }
  const seen = new Set<string>();
  const entries = raw.sections.map((s: any): SidebarEntry => {
    if (s.builtin) {
      if (s.builtin !== "api") {
        throw new Error(`Unknown builtin sidebar tab: ${s.builtin}`);
      }
      return { kind: "builtin", id: "api" };
    }
    if (typeof s.id !== "string" || !validId.test(s.id)) {
      throw new Error(`Invalid sidebar section id: ${s.id}`);
    }
    if (reservedIds.has(s.id) || seen.has(s.id)) {
      throw new Error(`Duplicate or reserved sidebar section id: ${s.id}`);
    }
    seen.add(s.id);
    if (s.layout !== "reference" && s.layout !== "cards") {
      throw new Error(`Invalid layout for sidebar section ${s.id}`);
    }
    if (!s.title) {
      throw new Error(`Missing title for sidebar section ${s.id}`);
    }
    return {
      kind: "section",
      id: s.id,
      layout: s.layout,
      icon: s.icon,
      accentColor:
        typeof s.accentColor === "string" &&
        /^#[0-9a-f]{6}$/i.test(s.accentColor)
          ? s.accentColor
          : undefined,
      direct: s.direct === true,
      title: s.title,
      description: s.description,
      order: s.order,
    };
  });
  return {
    fallbackLanguage: raw.fallbackLanguage ?? "en",
    entries,
  };
};

export const sidebarConfig = parseSidebarConfig(rawConfig);

export const docsSections: DocsSectionConfig[] = sidebarConfig.entries.filter(
  (e): e is DocsSectionConfig => e.kind === "section"
);

export const getSectionConfig = (
  id: string | undefined
): DocsSectionConfig | undefined => docsSections.find((s) => s.id === id);

/**
 * Picks the best string for the language, falling back to the configured
 * fallback language and then any available value.
 */
export const localize = (
  value: LocalizedString | undefined,
  languageId: string
): string => {
  if (value === undefined) {
    return "";
  }
  if (typeof value === "string") {
    return value;
  }
  const lower = languageId.toLowerCase();
  return (
    value[languageId] ??
    value[lower] ??
    value[lower.split("-")[0]] ??
    value[sidebarConfig.fallbackLanguage] ??
    Object.values(value)[0] ??
    ""
  );
};
