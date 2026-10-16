/**
 * Converts Markdown documentation content to Portable Text.
 *
 * See docs/content.md for the supported syntax.
 *
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { marked, Token, Tokens } from "marked";
import {
  PortableText,
  PortableTextBlock,
  SimpleImage,
} from "../../common/portable-text";

export interface MarkdownContext {
  /**
   * Resolves an image path as written in Markdown to a URL.
   */
  resolveImage: (path: string) => string;
}

export interface FrontMatter {
  [key: string]: string | string[] | undefined;
}

/**
 * Splits YAML-style front matter from the document.
 *
 * Only the subset we need is supported: `key: value` and
 * `key: [a, b]` lines.
 */
export const parseFrontMatter = (
  source: string
): { data: FrontMatter; body: string } => {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(source);
  if (!match) {
    return { data: {}, body: source };
  }
  const data: FrontMatter = {};
  for (const line of match[1].split(/\r?\n/)) {
    const kv = /^\s*([A-Za-z0-9_-]+)\s*:\s*(.*?)\s*$/.exec(line);
    if (!kv) {
      continue;
    }
    const [, key, value] = kv;
    const list = /^\[(.*)\]$/.exec(value);
    data[key] = list
      ? list[1]
          .split(",")
          .map((v) => unquote(v.trim()))
          .filter(Boolean)
      : unquote(value);
  }
  return { data, body: source.slice(match[0].length) };
};

const unquote = (value: string): string =>
  /^(["']).*\1$/.test(value) ? value.slice(1, -1) : value;

const umlauts: Record<string, string> = {
  ä: "ae",
  ö: "oe",
  ü: "ue",
  ß: "ss",
};

export const slugify = (text: string): string =>
  text
    .toLowerCase()
    .replace(/[äöüß]/g, (c) => umlauts[c])
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

/**
 * A directive in an HTML comment, e.g. `<!-- @slug led-on -->`.
 */
export interface Directive {
  name: string;
  value: string;
}

export const parseDirectives = (html: string): Directive[] | undefined => {
  const comment = /^\s*<!--([\s\S]*?)-->\s*$/.exec(html);
  if (!comment || !comment[1].includes("@")) {
    return undefined;
  }
  const directives: Directive[] = [];
  const re = /@([A-Za-z]+)(?:\s*:?\s*([^@]*))?/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(comment[1])) !== null) {
    directives.push({ name: m[1], value: (m[2] ?? "").trim() });
  }
  return directives;
};

export const lex = (markdown: string): Token[] => marked.lexer(markdown);

class KeyGenerator {
  private next = 0;
  key(): string {
    return `k${(this.next++).toString(36)}`;
  }
}

interface Span {
  _type: "span";
  _key: string;
  text: string;
  marks: string[];
}

interface InlineResult {
  spans: Span[];
  markDefs: any[];
  images: SimpleImage[];
}

/**
 * Converts block-level Markdown tokens to Portable Text.
 */
export const tokensToPortableText = (
  tokens: Token[],
  context: MarkdownContext
): PortableText => {
  const keys = new KeyGenerator();
  const result: PortableText = [];

  const inline = (tokens: Token[] | undefined, marks: string[]) => {
    const out: InlineResult = { spans: [], markDefs: [], images: [] };
    const walk = (tokens: Token[] | undefined, marks: string[]) => {
      for (const token of tokens ?? []) {
        switch (token.type) {
          case "strong":
            walk((token as Tokens.Strong).tokens, [...marks, "strong"]);
            break;
          case "em":
            walk((token as Tokens.Em).tokens, [...marks, "em"]);
            break;
          case "del":
            walk((token as Tokens.Del).tokens, [...marks, "strike-through"]);
            break;
          case "codespan":
            out.spans.push(
              span((token as Tokens.Codespan).text, [...marks, "code"])
            );
            break;
          case "br":
            out.spans.push(span("\n", marks));
            break;
          case "link": {
            const link = token as Tokens.Link;
            const markDef = linkMarkDef(link.href, keys.key());
            out.markDefs.push(markDef);
            walk(link.tokens, [...marks, markDef._key]);
            break;
          }
          case "image": {
            const image = token as Tokens.Image;
            out.images.push({
              _type: "simpleImage",
              alt: image.text,
              src: context.resolveImage(image.href),
            });
            break;
          }
          case "text": {
            const text = token as Tokens.Text;
            if (text.tokens && text.tokens.length > 0) {
              walk(text.tokens, marks);
            } else {
              out.spans.push(span(decodeEntities(text.text), marks));
            }
            break;
          }
          case "escape":
            out.spans.push(span((token as Tokens.Escape).text, marks));
            break;
          case "html":
            // Inline HTML is not supported.
            break;
          default:
            if ("text" in token && typeof token.text === "string") {
              out.spans.push(span(token.text, marks));
            }
        }
      }
    };
    walk(tokens, marks);
    return out;
  };

  const span = (text: string, marks: string[]): Span => ({
    _type: "span",
    _key: keys.key(),
    text,
    marks,
  });

  const pushTextBlock = (
    tokens: Token[] | undefined,
    style: string,
    list?: { listItem: "bullet" | "number"; level: number }
  ) => {
    const { spans, markDefs, images } = inline(tokens, []);
    if (spans.some((s) => s.text.trim().length > 0)) {
      const block: PortableTextBlock = {
        _type: "block",
        _key: keys.key(),
        style,
        markDefs,
        children: spans,
        ...list,
      };
      result.push(block);
    }
    for (const image of images) {
      result.push({ ...image, _key: keys.key() });
    }
  };

  const pushList = (list: Tokens.List, level: number) => {
    const listItem = list.ordered ? "number" : "bullet";
    for (const item of list.items) {
      const inlineTokens: Token[] = [];
      const nested: Tokens.List[] = [];
      for (const child of item.tokens) {
        if (child.type === "list") {
          nested.push(child as Tokens.List);
        } else if (child.type === "paragraph" || child.type === "text") {
          const t = child as Tokens.Paragraph | Tokens.Text;
          inlineTokens.push(
            ...(t.tokens && t.tokens.length > 0 ? t.tokens : [child])
          );
        }
      }
      pushTextBlock(inlineTokens, "normal", { listItem, level });
      nested.forEach((n) => pushList(n, level + 1));
    }
  };

  for (const token of tokens) {
    switch (token.type) {
      case "heading": {
        const heading = token as Tokens.Heading;
        pushTextBlock(heading.tokens, `h${Math.max(3, heading.depth)}`);
        break;
      }
      case "paragraph":
        pushTextBlock((token as Tokens.Paragraph).tokens, "normal");
        break;
      case "text":
        pushTextBlock((token as Tokens.Text).tokens ?? [token], "normal");
        break;
      case "blockquote":
        for (const child of (token as Tokens.Blockquote).tokens) {
          if (child.type === "paragraph") {
            pushTextBlock((child as Tokens.Paragraph).tokens, "blockquote");
          }
        }
        break;
      case "list":
        pushList(token as Tokens.List, 1);
        break;
      case "code": {
        const code = token as Tokens.Code;
        const lang = (code.lang ?? "").trim().toLowerCase();
        if (lang === "" || lang === "python" || lang === "py") {
          result.push({ _type: "python", _key: keys.key(), main: code.text });
        } else {
          result.push({
            _type: "block",
            _key: keys.key(),
            style: "normal",
            markDefs: [],
            children: [span(code.text, ["code"])],
          });
        }
        break;
      }
      // Directives, comments, spacing and unsupported blocks.
      default:
        break;
    }
  }
  return result;
};

export const markdownToPortableText = (
  markdown: string,
  context: MarkdownContext
): PortableText => tokensToPortableText(lex(markdown), context);

const linkMarkDef = (href: string, key: string) => {
  // Internal documentation links: doc:section/slug or doc:slug
  const doc = /^doc:(.+)$/.exec(href);
  if (doc) {
    const parts = doc[1].split("/").filter(Boolean);
    const [section, slug] = parts.length > 1 ? parts : [undefined, parts[0]];
    return {
      _type: "toolkitInternalLink",
      _key: key,
      section,
      slug: { _type: "slug", current: slug },
    };
  }
  const api = /^api:(.+)$/.exec(href);
  if (api) {
    return { _type: "toolkitApiLink", _key: key, name: api[1] };
  }
  return { _type: "link", _key: key, href };
};

const entities: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
};

const decodeEntities = (text: string): string =>
  text.replace(/&(amp|lt|gt|quot|#39);/g, (e) => entities[e]);
