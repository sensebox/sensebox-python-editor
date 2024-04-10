/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { theme } from "@chakra-ui/theme";

const gray = {
  10: "#fcfcfc",
  25: "#f5f6f8",
  ...theme.colors.gray,
};

const colors = {
  brand: {
    "50": "#f2f9f2",
    "100": "#cce8c9",
    "200": "#9ed39a",
    "300": "#63b95d",
    "400": "#4ba744",
    "500": "#4eaf47",
    "600": "#357730",
    "700": "#2b6027",
    "800": "#245121",
    "900": "#1a3a18",
  },
  gray,
  code: {
    blockBorder: theme.colors.gray[400],
    blockBackground: "rgba(185, 185, 185, 0.1)",
    blockBackgroundActive: "rgba(255, 255, 237, 0.5)",
    blockBorderActive: theme.colors.blue[400],

    comment: "gray",
    default: "black",
    keyword: "darkblue",
    literal: "darkgreen",
    string: "green",
    activeLine: theme.colors.gray[100],

    error: theme.colors.red[500], // Match default error toast
  },
};

export default colors;
