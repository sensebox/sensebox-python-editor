/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 *
 * @vitest-environment jsdom
 */
import { render } from "@testing-library/react";
import { PortableText } from "../../common/portable-text";
import DocumentationContent from "./DocumentationContent";

describe("DocumentationContent", () => {
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
