/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { createIntl, createIntlCache } from "react-intl";
import { it, expect, vi } from "vitest";
import { ActionFeedback } from "./use-action-feedback";
import { MockLogging } from "../logging/mock";
import en from "../messages/ui.en.json";
import de from "../messages/ui.de.json";

it.each(["en", "de"])(
  "formats the unexpected error heading without a missing rich-text value (%s)",
  (locale) => {
    const onError = vi.fn();
    const intl = createIntl(
      { locale, messages: locale === "en" ? en : de, onError },
      createIntlCache()
    );
    const toast = Object.assign(vi.fn(), {
      isActive: vi.fn(() => false),
      update: vi.fn(),
      closeAll: vi.fn(),
    });
    const feedback = new ActionFeedback(toast, new MockLogging(), intl);
    feedback.unexpectedError(new Error("Test failure"));
    expect(onError).not.toHaveBeenCalled();
    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: expect.any(String),
        status: "error",
      })
    );
    expect(toast.mock.calls[0][0].title).not.toContain("unexpected-error-");
  }
);
