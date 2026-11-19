/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { BrandConfigFactory } from "..";

const defaultBrandFactory: BrandConfigFactory = () => ({
  product: "python-editor",
  squareLogo: (
    <img
      src={`${import.meta.env.BASE_URL}sensebox-logo.svg`}
      alt=""
      style={{ display: "block", width: "100%", height: "auto" }}
    />
  ),
});

export default defaultBrandFactory;
