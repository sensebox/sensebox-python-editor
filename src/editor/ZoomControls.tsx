/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { ButtonGroup, IconButton, Tooltip } from "@microbit/ui";
import { useCallback } from "react";
import { RiZoomInLine, RiZoomOutLine } from "react-icons/ri";
import { useIntl } from "react-intl";
import { SystemStyleObject } from "styled-system/types";
import { useLogging } from "../logging/logging-hooks";
import {
  fontSizeStep,
  maximumFontSize,
  minimumFontSize,
  useSettings,
} from "../settings/settings";

interface ZoomControlsProps {
  size?: "lg" | "md" | "sm" | "xs";
  css?: SystemStyleObject;
}

/**
 * Zoom in/out icon button pair.
 */
const ZoomControls = ({ size, css: cssProp }: ZoomControlsProps) => {
  const logging = useLogging();
  const [settings, setSettings] = useSettings();
  const handleZoomIn = useCallback(() => {
    setSettings({
      ...settings,
      fontSize: Math.min(maximumFontSize, settings.fontSize + fontSizeStep),
    });
    logging.event({ type: "editor_zoom", detail: { direction: "in" } });
  }, [setSettings, settings, logging]);
  const handleZoomOut = useCallback(() => {
    setSettings({
      ...settings,
      fontSize: Math.max(minimumFontSize, settings.fontSize - fontSizeStep),
    });
    logging.event({ type: "editor_zoom", detail: { direction: "out" } });
  }, [setSettings, settings, logging]);
  const intl = useIntl();
  return (
    <ButtonGroup css={cssProp}>
      <Tooltip
        label={intl.formatMessage({ id: "zoom-out-action" })}
        delay={300}
        hasArrow
      >
        <IconButton
          size={size}
          variant="neutral"
          aria-label={intl.formatMessage({ id: "zoom-out-action" })}
          onPress={handleZoomOut}
        >
          <RiZoomOutLine />
        </IconButton>
      </Tooltip>
      <Tooltip
        label={intl.formatMessage({ id: "zoom-in-action" })}
        delay={300}
        hasArrow
      >
        <IconButton
          size={size}
          variant="neutral"
          aria-label={intl.formatMessage({ id: "zoom-in-action" })}
          onPress={handleZoomIn}
        >
          <RiZoomInLine />
        </IconButton>
      </Tooltip>
    </ButtonGroup>
  );
};

export default ZoomControls;
