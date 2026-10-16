/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { adaptMapping } from "../mapping/content";
import {
  markdownToPortableText,
  parseDirectives,
  parseFrontMatter,
  slugify,
} from "./markdown";
import { parseCard, parseTopic } from "./parse";

const context = {
  resolveImage: (path: string) => `resolved:${path}`,
};

describe("parseFrontMatter", () => {
  it("parses values and lists", () => {
    const { data, body } = parseFrontMatter(
      '---\nname: LEDs\nsubtitle: "Light: up"\ncompatibility: [a, b]\n---\nBody'
    );
    expect(data).toEqual({
      name: "LEDs",
      subtitle: "Light: up",
      compatibility: ["a", "b"],
    });
    expect(body).toEqual("Body");
  });

  it("handles no front matter", () => {
    expect(parseFrontMatter("Body")).toEqual({ data: {}, body: "Body" });
  });
});

describe("slugify", () => {
  it("handles umlauts and punctuation", () => {
    expect(slugify("Größe & Länge!")).toEqual("groesse-laenge");
  });
});

describe("parseDirectives", () => {
  it("parses one or more directives", () => {
    expect(parseDirectives("<!-- @slug foo @compatibility a, b -->")).toEqual([
      { name: "slug", value: "foo" },
      { name: "compatibility", value: "a, b" },
    ]);
    expect(parseDirectives("<!-- @details -->")).toEqual([
      { name: "details", value: "" },
    ]);
  });

  it("ignores plain comments", () => {
    expect(parseDirectives("<!-- just a comment -->")).toBeUndefined();
  });
});

describe("markdownToPortableText", () => {
  it("converts paragraphs with marks and links", () => {
    const blocks = markdownToPortableText(
      "Some **bold** and `code` with [a link](https://example.com), [doc](doc:sensors/temp), [short](doc:temp) and [api](api:time.sleep).",
      context
    );
    expect(blocks).toHaveLength(1);
    const block = blocks[0];
    expect(block._type).toEqual("block");
    expect(block.style).toEqual("normal");
    expect(block.markDefs).toEqual([
      { _type: "link", _key: expect.any(String), href: "https://example.com" },
      {
        _type: "toolkitInternalLink",
        _key: expect.any(String),
        section: "sensors",
        slug: { _type: "slug", current: "temp" },
      },
      {
        _type: "toolkitInternalLink",
        _key: expect.any(String),
        section: undefined,
        slug: { _type: "slug", current: "temp" },
      },
      { _type: "toolkitApiLink", _key: expect.any(String), name: "time.sleep" },
    ]);
    const spans = block.children as { text: string; marks: string[] }[];
    expect(spans.map((s) => s.text).join("")).toEqual(
      "Some bold and code with a link, doc, short and api."
    );
    expect(spans.find((s) => s.text === "bold")!.marks).toEqual(["strong"]);
    expect(spans.find((s) => s.text === "code")!.marks).toEqual(["code"]);
  });

  it("converts python code to code embeds", () => {
    expect(markdownToPortableText("```python\nprint(1)\n```", context)).toEqual(
      [{ _type: "python", _key: expect.any(String), main: "print(1)" }]
    );
  });

  it("converts images", () => {
    expect(markdownToPortableText("![Alt text](img.png)", context)).toEqual([
      {
        _type: "simpleImage",
        _key: expect.any(String),
        alt: "Alt text",
        src: "resolved:img.png",
      },
    ]);
  });

  it("converts lists and headings", () => {
    const blocks = markdownToPortableText(
      "### Title\n\n1. One\n2. Two",
      context
    );
    expect(blocks.map((b) => [b.style, b.listItem])).toEqual([
      ["h3", undefined],
      ["normal", "number"],
      ["normal", "number"],
    ]);
  });

  it("decodes entities", () => {
    const blocks = markdownToPortableText("a < b & c", context);
    expect(blocks[0].children[0].text).toEqual("a < b & c");
  });
});

describe("parseTopic", () => {
  const source = `---
name: Loops
subtitle: Repeat things
image: loops.png
---
Intro text.

## While loop
<!-- @slug while @compatibility microbitV2 -->
Runs forever.

\`\`\`python
while True:
    pass
\`\`\`

<!-- @details -->
More detail.

## Counting
<!-- @alternatives Count -->

### Three
\`\`\`python
for i in range(3): pass
\`\`\`

### Ten
<!-- @slug ten -->
\`\`\`python
for i in range(10): pass
\`\`\`
`;

  it("parses topic, entries, alternatives and details", () => {
    const topic = parseTopic(source, "loops", context);
    expect(topic.name).toEqual("Loops");
    expect(topic.slug.current).toEqual("loops");
    expect(topic.subtitle).toEqual("Repeat things");
    expect(topic.image).toEqual({
      _type: "simpleImage",
      src: "resolved:loops.png",
      alt: undefined,
    });
    expect(topic.introduction).toHaveLength(1);

    const [whileLoop, counting] = topic.contents!;
    expect(whileLoop.name).toEqual("While loop");
    expect(whileLoop.slug.current).toEqual("while");
    expect(whileLoop.compatibility).toEqual(["microbitV2"]);
    expect(whileLoop.parent).toBe(topic);
    expect(whileLoop.content!.map((b) => b._type)).toEqual(["block", "python"]);
    expect(whileLoop.detailContent).toHaveLength(1);

    expect(counting.slug.current).toEqual("counting");
    expect(counting.content).toBeUndefined();
    expect(counting.alternativesLabel).toEqual("Count");
    expect(counting.alternatives!.map((a) => [a.name, a.slug.current])).toEqual(
      [
        ["Three", "three"],
        ["Ten", "ten"],
      ]
    );
    expect(counting.alternatives![1].content[0]._type).toEqual("python");
  });

  it("makes entry slugs unique within a section", () => {
    const used = new Set<string>();
    parseTopic("## Example", "a", context, used);
    const b = parseTopic("## Example", "b", context, used);
    expect(b.contents![0].slug.current).toEqual("b-example");
  });
});

describe("parseCard", () => {
  it("parses front matter and content", () => {
    const card = parseCard(
      "---\nname: Weather\nimage: w.png\n---\nBuild it.",
      "weather",
      "de",
      context
    );
    expect(card.name).toEqual("Weather");
    expect(card.slug.current).toEqual("weather");
    expect(card.image?.src).toEqual("resolved:w.png");
    expect(card.content).toHaveLength(1);
  });
});

describe("adaptMapping", () => {
  it("supports section/slug strings and objects", () => {
    expect(
      adaptMapping({
        time: {
          sleep: "basics/waiting",
          monotonic: { reference: "timing", alternative: "ms" },
        },
      })
    ).toEqual({
      time: {
        sleep: { section: "basics", referenceLink: "waiting" },
        monotonic: {
          section: undefined,
          referenceLink: "timing",
          alternative: "ms",
        },
      },
    });
  });
});
