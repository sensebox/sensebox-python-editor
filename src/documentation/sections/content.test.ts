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

  it("provides the loop category and Python blocks", async () => {
    const config = docsSections.find((section) => section.id === "schleifen");
    expect(config).toMatchObject({
      icon: "RiLoopRightLine",
      accentColor: "#a6685b",
    });

    const sections = await fetchSections("de");
    const content = sections.schleifen;
    expect(content.layout).toBe("reference");
    if (content.layout !== "reference") {
      throw new Error("Expected the loops section to use the reference layout");
    }

    const topic = content.toolkit.contents?.[0];
    expect(topic?.contents?.map((entry) => entry.name)).toEqual([
      "Wiederhole X mal",
      "Wiederhole solange oder bis",
      "Zähle von bis mit Schrittweite",
      "Schleifendurchlauf steuern",
    ]);
    expect(topic?.contents?.[1].alternatives?.map((item) => item.name)).toEqual(
      ["Solange", "Bis"]
    );
    expect(topic?.contents?.[3].alternatives?.map((item) => item.name)).toEqual(
      ["Schleife abbrechen", "Nächster Durchlauf"]
    );

    const serialized = JSON.stringify(topic?.contents, (key, value) =>
      key === "parent" ? undefined : value
    );
    expect(serialized).toContain("for _ in range(10):");
    expect(serialized).toContain("while messwert < 10:");
    expect(serialized).toContain("while not (messwert >= 10):");
    expect(serialized).toContain("for i in range(1, 10 + 1, 1):");
    expect(serialized).toContain("break");
    expect(serialized).toContain("continue");
  });

  it("provides the other Python categories with their configured colours", async () => {
    const expected = {
      text: { accentColor: "#5ba68d", topics: 1, direct: true },
      logik: { accentColor: "#5b80a6", topics: 1, direct: true },
      zeit: { accentColor: "#5ba674", topics: 3 },
      mathematik: { accentColor: "#5b68a6", topics: 1, direct: true },
      variablen: { accentColor: "#a65b80", topics: 1, direct: true },
    };
    const sections = await fetchSections("de");

    for (const [id, expectation] of Object.entries(expected)) {
      expect(
        docsSections.find((section) => section.id === id)?.accentColor
      ).toBe(expectation.accentColor);
      expect(docsSections.find((section) => section.id === id)?.direct).toBe(
        "direct" in expectation ? expectation.direct : false
      );
      const content = sections[id];
      expect(content.layout).toBe("reference");
      if (content.layout !== "reference") {
        throw new Error(`Expected ${id} to use the reference layout`);
      }
      expect(content.toolkit.contents).toHaveLength(expectation.topics);
    }

    const serialized = JSON.stringify(sections, (key, value) =>
      key === "parent" ? undefined : value
    );
    expect(serialized).toContain("text +=");
    expect(serialized).toContain("if temperatur < 0:");
    expect(serialized).toContain("match modus:");
    expect(serialized).toContain('case \\"messen\\":');
    expect(serialized).toContain("case _:");
    expect(serialized).toContain("time.monotonic() * 1000");
    expect(serialized).toContain("adafruit_ds3231.DS3231(i2c)");
    expect(serialized).toContain("adafruit_ntp.NTP(pool, tz_offset=0)");
    expect(serialized).toContain("random.randint(1, 100)");
    expect(serialized).toContain("messwert = 23.5");
  });

  it("shows loop blocks directly and gives every sensor and module an icon", async () => {
    expect(
      docsSections.find((section) => section.id === "schleifen")?.direct
    ).toBe(true);

    const sections = await fetchSections("de");
    for (const sectionId of ["sensoren", "module"]) {
      const content = sections[sectionId];
      expect(content.layout).toBe("reference");
      if (content.layout !== "reference") {
        throw new Error(`Expected ${sectionId} to use the reference layout`);
      }
      for (const topic of content.toolkit.contents ?? []) {
        expect(topic.image?.src).toMatch(
          /(?:\.svg(?:\?|$)|^data:image\/svg\+xml)/
        );
        expect(topic.image?.alt).toBeTruthy();
      }
    }
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
