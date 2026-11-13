/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { BrandConfigFactory } from "..";

const defaultBrandFactory: BrandConfigFactory = () => ({
  product: "python-editor",
  horizontalLogo: (
    <img src="https://sensebox.de/images/logos/sensebox_wort_logo.svg" alt="" />
  ),
  squareLogo: (
    <img
      src="https://sensebox.de/images/pressekit/sensebox_logo.svg"
      alt=""
      style={{ padding: ".7rem" }}
    />
  ),
});

export default defaultBrandFactory;
