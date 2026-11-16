/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { test } from "./app-test-fixtures.js";
import { LoadDialogType } from "./app.js";

test.describe("open", () => {
  test("only accepts Python files", async ({ app }) => {
    await app.loadFiles("testData/makecode.hex", {
      acceptDialog: LoadDialogType.NONE,
    });

    await app.expectAlertText(
      "Cannot load file",
      "Only Python (.py) files can be opened."
    );
  });

  test("Loads a Python file", async ({ app }) => {
    await app.loadFiles("testData/samplefile.py", {
      acceptDialog: LoadDialogType.CONFIRM,
    });

    await app.expectAlertText("Updated file code.py");
    await app.expectProjectName("Untitled project");
  });

  test("loads Python files dropped into the editor", async ({ app }) => {
    await app.dropFile("testData/samplefile.py");

    await app.expectEditorContainText(/Hello/);
  });

  test("Correctly imports modules with the 'magic comment' in the filesystem.", async ({
    app,
  }) => {
    await app.loadFiles("testData/module.py", {
      acceptDialog: LoadDialogType.CONFIRM,
    });

    await app.expectAlertText("Added file module.py");

    await app.loadFiles("testData/module.py", {
      acceptDialog: LoadDialogType.CONFIRM,
    });
    await app.expectAlertText("Updated file module.py");
  });

  test("Warns before load if you have changes", async ({ app }) => {
    await app.typeInEditor("# Different text");
    await app.loadFiles("testData/samplefile.py", {
      acceptDialog: LoadDialogType.CONFIRM,
    });
    await app.expectEditorContainText(/Hello/);
  });
});
