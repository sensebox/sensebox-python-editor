/**
 * Loads the documentation sections from the Markdown files in content/.
 *
 * Content is bundled at build time. Each language is a separate chunk.
 *
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Idea } from "../ideas/model";
import { Toolkit } from "../reference/model";
import {
  docsSections,
  DocsSectionConfig,
  localize,
  sidebarConfig,
} from "./config";
import { MarkdownContext } from "./markdown";
import { parseCard, parseTopic } from "./parse";

export type SectionContent =
  | { layout: "reference"; toolkit: Toolkit }
  | { layout: "cards"; cards: Idea[] };

/**
 * Content by section id.
 */
export type DocsSections = Record<string, SectionContent>;

const markdownFiles = import.meta.glob<string>("/content/**/*.md", {
  query: "?raw",
  import: "default",
});

const imageFiles = import.meta.glob<string>(
  "/content/**/*.{png,jpg,jpeg,gif,svg,webp}",
  { query: "?url", import: "default", eager: true }
);

interface ContentFile {
  // e.g. /content/de/text/text.md
  path: string;
  language: string;
  section: string;
  name: string;
}

const contentFiles: ContentFile[] = Object.keys(markdownFiles).flatMap(
  (path) => {
    const match = /^\/content\/([^/]+)\/([^/]+)\/([^/]+)\.md$/.exec(path);
    if (!match) {
      return [];
    }
    const [, language, section, name] = match;
    return [{ path, language: language.toLowerCase(), section, name }];
  }
);

/**
 * Languages to try in order of preference.
 */
export const candidateLanguages = (languageId: string): string[] => {
  const lower = languageId.toLowerCase();
  return Array.from(
    new Set([
      lower,
      lower.split("-")[0],
      sidebarConfig.fallbackLanguage.toLowerCase(),
    ])
  ).filter(Boolean);
};

/**
 * Picks one file per name, preferring the user's language.
 */
const filesForSection = (
  section: DocsSectionConfig,
  languageId: string
): ContentFile[] => {
  const languages = candidateLanguages(languageId);
  const byName = new Map<string, ContentFile>();
  for (const language of [...languages].reverse()) {
    contentFiles
      .filter((f) => f.section === section.id && f.language === language)
      .forEach((f) => byName.set(f.name, f));
  }
  const order = section.order ?? [];
  const position = (name: string) => {
    const i = order.indexOf(name);
    return i === -1 ? Number.MAX_SAFE_INTEGER : i;
  };
  return Array.from(byName.values()).sort(
    (a, b) =>
      position(a.name) - position(b.name) || a.name.localeCompare(b.name)
  );
};

export const resolveContentImage = (
  markdownPath: string,
  imagePath: string
): string => {
  if (/^(https?:|data:)/.test(imagePath)) {
    return imagePath;
  }
  const resolved = imagePath.startsWith("/")
    ? "/content" + imagePath
    : new URL(imagePath, "file://" + markdownPath).pathname;
  const url = imageFiles[decodeURI(resolved)];
  if (!url) {
    console.warn(`Missing documentation image ${resolved} (${markdownPath})`);
    return imagePath;
  }
  return url;
};

const contextFor = (file: ContentFile): MarkdownContext => ({
  resolveImage: (imagePath) => resolveContentImage(file.path, imagePath),
});

const loadSection = async (
  section: DocsSectionConfig,
  languageId: string
): Promise<SectionContent> => {
  const files = filesForSection(section, languageId);
  const sources = await Promise.all(files.map((f) => markdownFiles[f.path]()));
  if (section.layout === "cards") {
    return {
      layout: "cards",
      cards: files.map((f, i) =>
        parseCard(sources[i], f.name, f.language, contextFor(f))
      ),
    };
  }
  const usedSlugs = new Set<string>();
  return {
    layout: "reference",
    toolkit: {
      id: section.id,
      name: localize(section.title, languageId),
      description: localize(section.description, languageId),
      language: languageId,
      contents: files.map((f, i) =>
        parseTopic(sources[i], f.name, contextFor(f), usedSlugs)
      ),
    },
  };
};

export const fetchSections = async (
  languageId: string
): Promise<DocsSections> => {
  const loaded = await Promise.all(
    docsSections.map((s) => loadSection(s, languageId))
  );
  return Object.fromEntries(docsSections.map((s, i) => [s.id, loaded[i]]));
};

/**
 * Finds the section containing a topic, entry or card slug.
 */
export const findSectionForSlug = (
  sections: DocsSections,
  slug: string
): string | undefined => {
  const id = slug.split("/")[0];
  return Object.entries(sections).find(([, content]) =>
    content.layout === "reference"
      ? content.toolkit.contents?.some(
          (t) =>
            t.slug.current === id ||
            t.contents?.some((e) => e.slug.current === id)
        )
      : content.cards.some((c) => c.slug.current === id)
  )?.[0];
};
