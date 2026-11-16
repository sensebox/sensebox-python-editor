/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { expect } from "@playwright/test";
import { test } from "./app-test-fixtures";

test.use({ viewport: { width: 1600, height: 1000 } });

test("aligns nested indentation guides with proportional-font spaces after zoom", async ({
  app,
}) => {
  await app.editorTextArea.fill(
    'import time\nwhile True:\n    if time.monotonic() > 1:\n        print("Hello World")\n    time.sleep(1)\n'
  );
  await app.page.evaluate(() => document.fonts.ready);

  const checkAlignment = async () => {
    await expect
      .poll(async () => {
        return app.editorTextArea.evaluate((content) => {
          const editor = content.closest(".cm-editor")!;
          const guides = [...editor.querySelectorAll(".cm-cs--indent")];
          const lines = [...content.querySelectorAll(".cm-line")];
          return ["    if", "        print"].map((prefix) => {
            const line = lines.find((line) =>
              line.textContent?.startsWith(prefix)
            );
            if (!line || guides.length !== 2) return false;
            const walker = document.createTreeWalker(
              line,
              NodeFilter.SHOW_TEXT
            );
            const whitespace = walker.nextNode();
            if (!whitespace) return false;
            const range = document.createRange();
            const spaces = prefix.length - prefix.trimStart().length;
            range.setStart(whitespace, spaces);
            range.collapse(true);
            const textLeft = range.getBoundingClientRect().left;
            const top = line.getBoundingClientRect().top;
            const guide = guides.find(
              (guide) => Math.abs(guide.getBoundingClientRect().top - top) < 2
            );
            if (!guide) return false;
            const gap = textLeft - guide.getBoundingClientRect().right;
            // Leave room beside the code instead of drawing through its text.
            return gap >= 2 && gap <= 9;
          });
        });
      })
      .toEqual([true, true]);
  };

  await checkAlignment();
  await app.page.getByRole("button", { name: "Zoom in", exact: true }).click();
  await checkAlignment();
});
