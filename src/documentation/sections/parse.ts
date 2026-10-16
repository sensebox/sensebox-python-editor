/**
 * Parses Markdown topic and card files into the documentation models.
 *
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Token, Tokens } from "marked";
import { SimpleImage } from "../../common/portable-text";
import { HasCompatibility } from "../common/model";
import { Idea } from "../ideas/model";
import { ToolkitTopic, ToolkitTopicEntry } from "../reference/model";
import {
  FrontMatter,
  lex,
  MarkdownContext,
  parseDirectives,
  parseFrontMatter,
  slugify,
  tokensToPortableText,
} from "./markdown";

const slug = (current: string) => ({ _type: "slug" as const, current });

const asString = (value: string | string[] | undefined): string | undefined =>
  Array.isArray(value) ? value.join(", ") : value;

const compatibility = (
  value: string | string[] | undefined
): HasCompatibility["compatibility"] => {
  const list = Array.isArray(value)
    ? value
    : (value ?? "").split(/[\s,]+/).filter(Boolean);
  return list as HasCompatibility["compatibility"];
};

const image = (
  data: FrontMatter,
  context: MarkdownContext
): SimpleImage | undefined => {
  const src = asString(data.image);
  return src
    ? {
        _type: "simpleImage",
        src: context.resolveImage(src),
        alt: asString(data.imageAlt),
      }
    : undefined;
};

interface EntryDraft {
  name: string;
  slug?: string;
  compatibility?: string;
  content: Token[];
  alternativesLabel?: string;
  alternatives: { name: string; slug?: string; tokens: Token[] }[];
  details: Token[];
}

/**
 * Parses a topic file for a "reference" layout section.
 *
 * - Front matter: name, slug, subtitle, image, compatibility.
 * - Text before the first `##` heading is the introduction.
 * - Each `##` heading starts an entry.
 * - `<!-- @slug x -->` and `<!-- @compatibility microbitV2 -->` configure the
 *   current entry (or alternative).
 * - `<!-- @alternatives Label -->` makes following `###` headings
 *   alternatives selectable from a dropdown.
 * - `<!-- @details -->` starts content shown only when expanded.
 *
 * @param source The Markdown source.
 * @param fileName The file name without extension, the default slug.
 * @param context For resolving images.
 * @param usedSlugs Slugs already in use in the section, updated.
 */
export const parseTopic = (
  source: string,
  fileName: string,
  context: MarkdownContext,
  usedSlugs: Set<string> = new Set()
): ToolkitTopic => {
  const { data, body } = parseFrontMatter(source);
  const topicSlug = asString(data.slug) || fileName;
  usedSlugs.add(topicSlug);

  const intro: Token[] = [];
  const drafts: EntryDraft[] = [];
  let mode: "content" | "alternatives" | "details" = "content";

  const current = () => drafts[drafts.length - 1];
  const bucket = (): Token[] => {
    const entry = current();
    if (!entry) {
      return intro;
    }
    if (mode === "details") {
      return entry.details;
    }
    if (mode === "alternatives" && entry.alternatives.length > 0) {
      return entry.alternatives[entry.alternatives.length - 1].tokens;
    }
    return entry.content;
  };

  for (const token of lex(body)) {
    if (token.type === "space") {
      continue;
    }
    if (token.type === "heading") {
      const heading = token as Tokens.Heading;
      if (heading.depth <= 2) {
        drafts.push({
          name: heading.text,
          content: [],
          alternatives: [],
          details: [],
        });
        mode = "content";
        continue;
      }
      if (heading.depth === 3 && mode === "alternatives" && current()) {
        current().alternatives.push({ name: heading.text, tokens: [] });
        continue;
      }
    }
    if (token.type === "html") {
      const directives = parseDirectives((token as Tokens.HTML).text);
      if (directives) {
        for (const { name, value } of directives) {
          const entry = current();
          if (!entry) {
            continue;
          }
          switch (name) {
            case "slug": {
              const alternative =
                mode === "alternatives"
                  ? entry.alternatives[entry.alternatives.length - 1]
                  : undefined;
              if (alternative) {
                alternative.slug = value;
              } else {
                entry.slug = value;
              }
              break;
            }
            case "compatibility":
              entry.compatibility = value;
              break;
            case "alternatives":
              mode = "alternatives";
              entry.alternativesLabel = value;
              break;
            case "details":
              mode = "details";
              break;
            default:
              console.warn(`Unknown documentation directive @${name}`);
          }
        }
        continue;
      }
    }
    bucket().push(token);
  }

  const topic: ToolkitTopic = {
    name: asString(data.name) || fileName,
    subtitle: asString(data.subtitle) ?? "",
    slug: slug(topicSlug),
    image: image(data, context),
    compatibility: compatibility(data.compatibility),
    introduction: intro.length
      ? tokensToPortableText(intro, context)
      : undefined,
    contents: [],
  };
  topic.contents = drafts.map(
    (draft): ToolkitTopicEntry => ({
      name: draft.name,
      slug: slug(
        uniqueSlug(draft.slug || slugify(draft.name), topicSlug, usedSlugs)
      ),
      compatibility: compatibility(draft.compatibility),
      content: draft.content.length
        ? tokensToPortableText(draft.content, context)
        : undefined,
      alternativesLabel: draft.alternativesLabel,
      alternatives:
        draft.alternatives.length > 0
          ? draft.alternatives.map((a) => ({
              name: a.name,
              slug: slug(a.slug || slugify(a.name)),
              content: tokensToPortableText(a.tokens, context),
            }))
          : undefined,
      detailContent: draft.details.length
        ? tokensToPortableText(draft.details, context)
        : undefined,
      parent: topic,
    })
  );
  return topic;
};

const uniqueSlug = (
  candidate: string,
  topicSlug: string,
  usedSlugs: Set<string>
): string => {
  let result = candidate;
  if (usedSlugs.has(result)) {
    result = `${topicSlug}-${candidate}`;
    let n = 2;
    while (usedSlugs.has(result)) {
      result = `${topicSlug}-${candidate}-${n++}`;
    }
  }
  usedSlugs.add(result);
  return result;
};

/**
 * Parses a card file for a "cards" layout section.
 *
 * Front matter: name, slug, image, compatibility. The body is the content.
 */
export const parseCard = (
  source: string,
  fileName: string,
  languageId: string,
  context: MarkdownContext
): Idea => {
  const { data, body } = parseFrontMatter(source);
  const cardSlug = asString(data.slug) || fileName;
  return {
    _id: cardSlug,
    name: asString(data.name) || fileName,
    slug: slug(cardSlug),
    language: languageId,
    image: image(data, context),
    compatibility: compatibility(data.compatibility),
    content: tokensToPortableText(lex(body), context),
  };
};
