/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { ButtonGroup, IconButton, Tooltip } from "@microbit/ui";
import { RiArrowGoBackLine, RiArrowGoForwardLine } from "react-icons/ri";
import { useIntl } from "react-intl";
import { SystemStyleObject } from "styled-system/types";
import {
  useActiveEditorActions,
  useActiveEditorInfo,
} from "../editor/active-editor-hooks";

interface UndoRedoControlsProps {
  css?: SystemStyleObject;
  size?: "lg" | "md" | "sm" | "xs";
}

const UndoRedoControls = ({ css: cssProp, size }: UndoRedoControlsProps) => {
  const intl = useIntl();
  const actions = useActiveEditorActions();
  const editorInfo = useActiveEditorInfo();

  return (
    <ButtonGroup css={cssProp}>
      <Tooltip label={intl.formatMessage({ id: "undo" })} delay={300} hasArrow>
        <IconButton
          size={size}
          variant="neutral"
          aria-label={intl.formatMessage({ id: "undo" })}
          onPress={actions?.undo}
          isDisabled={editorInfo.undo ? false : true}
        >
          <RiArrowGoBackLine />
        </IconButton>
      </Tooltip>
      <Tooltip label={intl.formatMessage({ id: "redo" })} delay={300} hasArrow>
        <IconButton
          size={size}
          variant="neutral"
          aria-label={intl.formatMessage({ id: "redo" })}
          onPress={actions?.redo}
          isDisabled={editorInfo.redo ? false : true}
        >
          <RiArrowGoForwardLine />
        </IconButton>
      </Tooltip>
    </ButtonGroup>
  );
};

export default UndoRedoControls;
