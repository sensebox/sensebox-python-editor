/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { StyleFunctionProps, theme } from "@chakra-ui/react";
import colors from "../colors";

const Tabs = {
  variants: {
    sidebar: (props: StyleFunctionProps) => {
      const base = theme.components.Tabs.variants!["solid-rounded"](props);
      return {
        ...base,
        tablist: {
          background: colors.brand[500],
        },
        tab: {
          ...base.tab,
          transition: "none",
          ml: "6px",
          borderRadius: "8px 0 0 8px",
          _selected: {
            color: "black",
            bg: "gray.50",
            outline: "none",
          },
          _focus: {
            boxShadow: "initial",
          },
          _active: {},
        },
      };
    },
  },
};

export default Tabs;
