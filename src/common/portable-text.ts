/**
 * Portable Text types used for documentation content.
 *
 * Content is authored as Markdown in the content/ folder and converted to
 * this structure at load time so the existing renderer, collapse handling
 * and search indexing can be shared.
 *
 * (c) 2021-2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */

export interface PortableTextBlock {
  _type: "block";
  _key: string;
  // Partial/lax modelling. We pass this straight to the rendering API.
  children: any;
  markDefs: any;
  style: string;
  listItem?: "bullet" | "number";
  level?: number;
}

export type PortableText = Array<
  PortableTextBlock | { _type: string; children?: any; [other: string]: any }
>;

/**
 * Common image type.
 */
export interface SimpleImage {
  _type: "simpleImage";
  alt?: string;
  /**
   * The resolved image URL.
   */
  src: string;
}

export interface Slug {
  _type: "slug";
  current: string;
}
