/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { fireEvent, render, screen } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { vi } from "vitest";
import { pythonSnippetMediaType } from "../../common/mediaTypes";
import ScrollablePanel from "../../common/ScrollablePanel";
import CodeEmbed from "./CodeEmbed";

vi.mock("../../editor/codemirror/CodeMirrorView", () => ({
  default: ({ value }: { value: string }) => (
    <pre data-testid="snippet-code">{value}</pre>
  ),
}));
vi.mock("../../editor/active-editor-hooks", () => ({
  useActiveEditorActions: () => undefined,
}));
vi.mock("../../project/project-hooks", () => ({
  useProjectActions: () => ({}),
}));
vi.mock("../../logging/logging-hooks", () => ({
  useLogging: () => ({ event: vi.fn() }),
}));
vi.mock("../../settings/session-settings", () => ({
  useSessionSettings: () => [{ dragDropSuccess: true }],
}));
vi.mock("../documentation-hooks", () => ({
  useCodeDragImage: () => ({ current: undefined }),
}));
vi.mock("./CodeActionButton", () => ({
  default: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <button>Copy code</button> : null,
}));

const renderSnippet = () => {
  const result = render(
    <IntlProvider locale="en" messages={{ "code-example": "Code example" }}>
      <ScrollablePanel>
        <CodeEmbed code={'print("hello")'} toolkitType="reference" />
      </ScrollablePanel>
    </IntlProvider>
  );
  return {
    ...result,
    source: result.container.querySelector<HTMLElement>('[draggable="true"]')!,
  };
};

describe("snippet hover", () => {
  it("keeps the same single code view through rapid hover changes", () => {
    const { source } = renderSnippet();
    const code = screen.getByTestId("snippet-code");
    for (let i = 0; i < 20; i++) {
      fireEvent.mouseEnter(source);
      expect(screen.getAllByTestId("snippet-code")).toHaveLength(1);
      expect(screen.getByTestId("snippet-code")).toBe(code);
      fireEvent.mouseLeave(source);
      expect(screen.getByTestId("snippet-code")).toBe(code);
    }
    expect(source.style.opacity).not.toBe("0");
    expect(source.parentElement?.contains(code)).toBe(true);
  });

  it("retains the code view while scrolling instead of opening a portal", () => {
    const { source } = renderSnippet();
    const code = screen.getByTestId("snippet-code");
    fireEvent.mouseEnter(source);
    fireEvent.scroll(screen.getByTestId("scrollable-panel"));
    fireEvent.scroll(source.parentElement!);
    expect(screen.getAllByTestId("snippet-code")).toHaveLength(1);
    expect(screen.getByTestId("snippet-code")).toBe(code);
    expect(source.parentElement?.contains(code)).toBe(true);
  });

  it("can still reveal the copy action without replacing the code view", () => {
    const { source } = renderSnippet();
    const code = screen.getByTestId("snippet-code");
    expect(screen.queryByRole("button", { name: "Copy code" })).toBeNull();
    fireEvent.mouseEnter(source);
    fireEvent.click(source);
    expect(screen.getByRole("button", { name: "Copy code" })).not.toBeNull();
    expect(screen.getByTestId("snippet-code")).toBe(code);
  });

  it("retains the complete Python payload when dragging a hovered block", () => {
    const { source } = renderSnippet();
    const dataTransfer = { dropEffect: "none", setData: vi.fn() };
    fireEvent.mouseEnter(source);
    fireEvent.dragStart(source, { dataTransfer });
    expect(dataTransfer.setData).toHaveBeenCalledWith(
      pythonSnippetMediaType,
      'print("hello")'
    );
    fireEvent.dragEnd(source);
    expect(screen.getAllByTestId("snippet-code")).toHaveLength(1);
  });

  it("leaves no code preview behind when a hovered category closes", () => {
    const { source, unmount } = renderSnippet();
    fireEvent.mouseEnter(source);
    unmount();
    expect(screen.queryByTestId("snippet-code")).toBeNull();
  });
});
