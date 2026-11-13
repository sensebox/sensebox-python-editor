/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { expect } from "@playwright/test";
import fs from "fs";
import { test } from "./app-test-fixtures.js";
import { LoadDialogType } from "./app.js";

test.describe("save", () => {
  test("Download - save the default Python script", async ({ app }) => {
    await app.setProjectName("idiosyncratic ruminant");
    const download = await app.save();
    if (!download) {
      throw new Error("Invalid download");
    }
    const filename = download.suggestedFilename();
    expect(filename).toEqual("idiosyncratic ruminant-code.py");

    const path = await download.path();
    if (!path) {
      throw new Error("Invalid path");
    }
    const contents = await fs.promises.readFile(path, { encoding: "utf8" });
    expect(contents).not.toMatch(/^:020000040000FA/);
  });

  test("Shows the name your project dialog if the project name is the default", async ({
    app,
  }) => {
    await app.save({ waitForDownload: false });
    await app.expectDialog("Name your project");
  });

  test("Shows the multiple files dialog after save if there are multiple files in the project", async ({
    app,
  }) => {
    await app.setProjectName("not default name");
    await app.loadFiles("testData/module.py", {
      acceptDialog: LoadDialogType.CONFIRM,
    });
    await app.save();
    await app.expectDialog("Warning: Only code.py downloaded");
  });
});
