/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { useMediaQuery, usePrevious } from "@microbit/ui";
import { ReactNode, useEffect, useRef, useState, useCallback } from "react";
import { Box } from "styled-system/jsx";
import { Anchor } from "../../router-hooks";
import { useLogging } from "../../logging/logging-hooks";
import { useScrollablePanelAncestor } from "../../common/ScrollablePanel";

interface HighlightProps {
  children: ReactNode;
  anchor?: Anchor;
  id: string;
  active: boolean | undefined;
  accentColor?: string;
}

const Highlight = ({
  children,
  active,
  anchor,
  id,
  accentColor,
}: HighlightProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const previousAnchor = usePrevious(anchor);
  const scrollable = useScrollablePanelAncestor();
  const prefersReducedMotion = useMediaQuery(
    "(prefers-reduced-motion: reduce)"
  );
  const logging = useLogging();
  const [highlighting, setHighlighting] = useState(false);
  useEffect(() => {
    if (previousAnchor !== anchor && active) {
      logging.log("Activating " + id);
      // Wait for the content to render before scrolling to the anchor.
      // eslint-disable-next-line @eslint-react/web-api-no-leaked-timeout -- one-shot scroll and highlight sequence
      window.setTimeout(() => {
        if (ref.current && scrollable.current) {
          const stickyHeaderHeight = scrollable.current
            .querySelector("header")!
            .getBoundingClientRect().height;
          const gap = 25;
          scrollable.current.scrollTo({
            top: ref.current.offsetTop - stickyHeaderHeight - gap,
            behavior: prefersReducedMotion ? "auto" : "smooth",
          });
        }
        // eslint-disable-next-line @eslint-react/web-api-no-leaked-timeout -- one-shot scroll and highlight sequence
        setTimeout(() => {
          setHighlighting(true);
          // eslint-disable-next-line @eslint-react/web-api-no-leaked-timeout -- one-shot scroll and highlight sequence
          setTimeout(() => {
            setHighlighting(false);
          }, 3000);
        }, 300);
      }, 150);
    }
  }, [
    active,
    anchor,
    id,
    logging,
    prefersReducedMotion,
    previousAnchor,
    scrollable,
  ]);

  const handleHighlightClick = useCallback(() => {
    setHighlighting(false);
  }, [setHighlighting]);

  return (
    <Box
      onClick={handleHighlightClick}
      borderRadius="lg"
      borderWidth="1px"
      borderColor={highlighting ? "brand.500" : "gray.300"}
      borderInlineStartWidth="4px"
      style={{ borderInlineStartColor: accentColor }}
      boxShadow="0 2px 4px rgba(0, 0, 0, 0.06)"
      _hover={{ borderColor: "brand.500" }}
      _focusWithin={{ borderColor: "brand.500" }}
      ref={ref}
      backgroundColor={highlighting ? "brand.100" : "white"}
      transition={
        highlighting
          ? "background-color ease-out 0.2s"
          : "background-color ease-in 0.6s"
      }
    >
      {children}
    </Box>
  );
};

export default Highlight;
