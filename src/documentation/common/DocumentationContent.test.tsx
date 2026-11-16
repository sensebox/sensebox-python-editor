/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 *
 * @vitest-environment jsdom
 */
import { act, render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { IntlProvider } from "react-intl";
import { vi } from "vitest";
import { PortableText } from "../../common/portable-text";
import { useDocumentation } from "../documentation-hooks";
import { fetchConnectionGuides, fetchSections } from "../sections/content";
import DocumentationContent, {
  ConnectionHelpLink,
} from "./DocumentationContent";

vi.mock("../../router-hooks", () => ({
  useRouterState: () => [{}, vi.fn()],
}));
vi.mock("../documentation-hooks", () => ({
  useDocumentation: vi.fn(),
}));

describe("DocumentationContent", () => {
  it("opens connection help and an enlarged image without leaving the sensor", async () => {
    const user = userEvent.setup();
    const sections = await fetchSections("en");
    const guides = await fetchConnectionGuides("en");
    vi.mocked(useDocumentation).mockReturnValue({
      sections: { status: "ok", content: sections, languageId: "en" },
      connectionGuides: { status: "ok", content: guides, languageId: "en" },
      apiReferenceMap: { status: "loading" },
    });
    const sensors = sections.sensoren;
    if (sensors.layout !== "reference") throw new Error("Expected sensors");
    const topic = sensors.toolkit.contents?.find(
      (item) => item.slug.current === "temperatur"
    );
    render(
      <IntlProvider
        locale="en"
        messages={{
          "enlarge-image-action": "Enlarge image: {name}",
          "connection-help-action": "Connection guide: {name}",
        }}
      >
        <DocumentationContent blocks={topic?.introduction} />
        <ConnectionHelpLink guideId={topic!.connectionGuide!} iconOnly>
          {topic!.name}
        </ConnectionHelpLink>
      </IntlProvider>
    );
    const trigger = screen.getByRole("button", {
      name: "Connection guide: Temperature",
    });
    expect(trigger.textContent).toBe("");
    await act(async () => user.click(trigger));
    let help = await screen.findByRole("dialog", {
      name: "HDC1080 temperature sensor",
    });
    expect(within(help).getByText("Connect the sensor")).not.toBeNull();
    await act(async () => user.keyboard("{Escape}"));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await act(async () => user.click(trigger));
    help = await screen.findByRole("dialog", {
      name: "HDC1080 temperature sensor",
    });
    await act(async () =>
      user.click(within(help).getByRole("button", { name: /Enlarge image:/ }))
    );
    expect(screen.getAllByRole("dialog", { hidden: true })).toHaveLength(2);
    expect(screen.getByRole("dialog")).not.toBe(help);
    await act(async () => user.keyboard("{Escape}"));
    await waitFor(() =>
      expect(screen.getAllByRole("dialog", { hidden: true })).toHaveLength(1)
    );
    expect(screen.getByRole("dialog")).toBe(help);
    await waitFor(() =>
      expect(document.activeElement).toBe(
        within(help).getByRole("button", { name: /Enlarge image:/ })
      )
    );
    await act(async () =>
      user.click(within(help).getByRole("button", { name: "Close" }))
    );
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await waitFor(() => expect(document.activeElement).toBe(trigger));
  });

  it("renders external links", () => {
    const content: PortableText = [
      {
        _key: "aa98d45c4830",
        _type: "block",
        children: [
          {
            _key: "5a0241bfeeae",
            _type: "span",
            marks: ["077a4155134d"],
            text: "Read more about ASCII",
          },
          {
            _key: "9288bd174f02",
            _type: "span",
            marks: [],
            text: ".",
          },
        ],
        markDefs: [
          {
            _type: "link",
            _key: "077a4155134d",
            href: "https://www.bbc.co.uk/bitesize/guides/zscvxfr/revision/4",
          },
        ],
        style: "normal",
      },
    ];
    const view = render(<DocumentationContent blocks={content} />);
    expect(view.container.innerHTML).toMatchInlineSnapshot(
      `"<div class="d_flex flex-d_column gap_3 mt_3"><p><a href="https://www.bbc.co.uk/bitesize/guides/zscvxfr/revision/4" target="_blank" rel="nofollow noopener" class="link c_brand.600">Read more about ASCII<svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" class="w_1em h_1em d_inline-block lh_1em flex-sh_0 fill_currentColor va_middle mb_0.333em ml_1" focusable="false" aria-hidden="true" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M10 6V8H5V19H16V14H18V20C18 20.5523 17.5523 21 17 21H4C3.44772 21 3 20.5523 3 20V7C3 6.44772 3.44772 6 4 6H10ZM21 3V11H19L18.9999 6.413L11.2071 14.2071L9.79289 12.7929L17.5849 5H13V3H21Z"></path></svg></a>.</p></div>"`
    );
  });

  it("renders images", () => {
    const content: PortableText = [
      {
        _type: "simpleImage",
        alt: "micro:bit showing X axis going across the front, Y axis going down and up, Z axis going back to front",
        src: "/content/images/axes.png",
      },
    ];
    const view = render(<DocumentationContent blocks={content} />);
    expect(view.container.innerHTML).toMatchInlineSnapshot(
      `"<div class="d_flex flex-d_column gap_3 mt_3"><div class="w_300px max-w_100%"><img src="/content/images/axes.png" alt="micro:bit showing X axis going across the front, Y axis going down and up, Z axis going back to front" class="max-w_100% bdr_lg bd_solid_1px bd-c_gray.300"></div></div>"`
    );
  });
});
