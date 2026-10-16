/**
 * Checks the bundled content in content/ loads.
 *
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { docsSections } from "./config";
import {
  candidateLanguages,
  fetchSections,
  findSectionForSlug,
  resolveContentImage,
} from "./content";

describe("bundled content", () => {
  it("loads every configured section", async () => {
    const sections = await fetchSections("en");
    for (const config of docsSections) {
      const content = sections[config.id];
      expect(content.layout).toEqual(config.layout);
      const items =
        content.layout === "reference"
          ? content.toolkit.contents
          : content.cards;
      expect(items?.length).toBeGreaterThan(0);
    }
  });

  it("finds sections by slug", async () => {
    const sections = await fetchSections("de");
    const [first] = docsSections;
    const content = sections[first.id];
    const slug =
      content.layout === "reference"
        ? content.toolkit.contents![0].slug.current
        : content.cards[0].slug.current;
    expect(findSectionForSlug(sections, slug)).toEqual(first.id);
    expect(findSectionForSlug(sections, "does-not-exist")).toBeUndefined();
  });
});

describe("candidateLanguages", () => {
  it("prefers the user's language then the fallback", () => {
    expect(candidateLanguages("pt-BR")).toEqual(["pt-br", "pt", "de"]);
  });
});

describe("resolveContentImage", () => {
  it("passes through absolute URLs", () => {
    expect(
      resolveContentImage("/content/de/a/b.md", "https://example.com/x.png")
    ).toEqual("https://example.com/x.png");
  });
});
