/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Tooltip, VisuallyHidden } from "@microbit/ui";
import React, {
  CSSProperties,
  Ref,
  useCallback,
  useMemo,
  useState,
} from "react";
import { Focusable } from "react-aria-components";
import { FormattedMessage, useIntl } from "react-intl";
import { Box, HStack } from "styled-system/jsx";
import { pythonSnippetMediaType } from "../../common/mediaTypes";
import { useActiveEditorActions } from "../../editor/active-editor-hooks";
import CodeMirrorView from "../../editor/codemirror/CodeMirrorView";
import { debug as dndDebug, setDragContext } from "../../editor/codemirror/dnd";
import { useLogging } from "../../logging/logging-hooks";
import { useProjectActions } from "../../project/project-hooks";
import { useSessionSettings } from "../../settings/session-settings";
import { useClipboard } from "@microbit/ui";
import DragHandle from "../common/DragHandle";
import { useCodeDragImage } from "../documentation-hooks";
import CodeActionButton from "./CodeActionButton";
import { useHotkeys } from "react-hotkeys-hook";
import { keyboardShortcuts } from "../../common/keyboard-shortcuts";

interface CodeEmbedProps {
  code: string;
  accentColor?: string;
  parentSlug?: string;
  toolkitType?: string;
  sectionId?: string;
  title?: string;
}

type CodeEmbedState =
  /**
   * Default state.
   */
  | "default"
  /**
   * Highlighted state when hovering "Copy code".
   */
  | "highlighted"
  /**
   * Highlighted block background on mouse over; geometry stays unchanged.
   */
  | "raised";

const CodeEmbed = ({
  code: codeWithImports,
  accentColor,
  toolkitType,
  sectionId,
  parentSlug,
  title,
}: CodeEmbedProps) => {
  const [copyCodeOpen, setCopyCodeOpen] = useState(false);
  const [state, setState] = useState<CodeEmbedState>("default");
  const toRaised = useCallback(() => setState("raised"), []);
  const toDefault = useCallback(() => setState("default"), []);
  const toHighlighted = useCallback(() => setState("highlighted"), []);

  const actions = useActiveEditorActions();
  const code = useMemo(
    () =>
      codeWithImports
        .split("\n")
        .filter((line) => line !== "from microbit import *")
        // Collapse repeated blank lines to save space. Two blank lines after imports
        // is conventional but a big waste of space here.
        .filter(
          (line, index, array) =>
            index === 0 || !(line.length === 0 && array[index - 1].length === 0)
        )
        .join("\n")
        .trim(),
    [codeWithImports]
  );
  const { onCopy } = useClipboard(code);
  const handleCopyCode = useCallback(async () => {
    onCopy();
    await actions?.copyCode(
      code,
      codeWithImports,
      "example",
      parentSlug,
      toolkitType,
      sectionId
    );
  }, [
    actions,
    code,
    codeWithImports,
    onCopy,
    parentSlug,
    toolkitType,
    sectionId,
  ]);
  const projectActions = useProjectActions();
  const handleOpenIdea = useCallback(async () => {
    projectActions.openIdea(parentSlug, codeWithImports, title!);
  }, [codeWithImports, parentSlug, projectActions, title]);
  const hotKeysRef = useHotkeys(keyboardShortcuts.copyCode, handleCopyCode, {
    preventDefault: true,
  }) as Ref<HTMLDivElement>;
  const raisedLook =
    toolkitType === "ideas" ? state === "highlighted" : state !== "default";
  return (
    <Box position="relative" pb="2">
      <Box
        fontSize="md"
        ref={hotKeysRef}
        tabIndex={-1}
        width="100%"
        overflowX="auto"
      >
        <Code
          onMouseEnter={toRaised}
          onMouseLeave={toDefault}
          onCodeDragEnd={toDefault}
          isOpen={copyCodeOpen}
          onToggle={setCopyCodeOpen}
          concise={code}
          full={codeWithImports}
          raisedLook={raisedLook}
          highlightDragHandle={state === "raised"}
          parentSlug={parentSlug}
          toolkitType={toolkitType}
          sectionId={sectionId}
          accentColor={accentColor}
        />
      </Box>
      <CodeActionButton
        isOpen={toolkitType === "ideas" ? true : copyCodeOpen}
        toHighlighted={toHighlighted}
        toDefault={toDefault}
        codeAction={toolkitType === "ideas" ? handleOpenIdea : handleCopyCode}
        borderAdjustment={true}
        toolkitType={toolkitType}
      />
    </Box>
  );
};

interface CodeProps {
  accentColor?: string;
  concise: string;
  full: string;
  highlightDragHandle: boolean;
  toolkitType?: string;
  sectionId?: string;
  parentSlug?: string;
  onCodeDragEnd: () => void;
  onMouseEnter?: React.MouseEventHandler<HTMLElement>;
  onMouseLeave?: React.MouseEventHandler<HTMLElement>;
  isOpen: boolean;
  onToggle: React.Dispatch<React.SetStateAction<boolean>>;
  raisedLook: boolean;
}

const Code = React.forwardRef<HTMLDivElement, CodeProps>(
  (
    {
      concise,
      full,
      accentColor,
      highlightDragHandle,
      toolkitType,
      sectionId,
      parentSlug,
      onCodeDragEnd,
      isOpen,
      onToggle,
      raisedLook,
      ...props
    }: CodeProps,
    ref
  ) => {
    const logging = useLogging();
    const dragImage = useCodeDragImage();
    const handleDragStart = useCallback(
      (event: React.DragEvent) => {
        logging.event({
          type: "code_drag",
          detail: { surface: toolkitType, id: parentSlug },
        });
        dndDebug("dragstart");
        event.dataTransfer.dropEffect = "copy";
        setDragContext({
          code: full,
          type: "example",
          tab: toolkitType,
          sectionId,
          id: parentSlug,
        });
        event.dataTransfer.setData(pythonSnippetMediaType, full);
        if (dragImage.current) {
          event.dataTransfer.setDragImage(dragImage.current, 0, 0);
        }
      },
      [full, dragImage, parentSlug, toolkitType, sectionId, logging]
    );
    const handleDragEnd = useCallback(
      (_event: React.DragEvent) => {
        onCodeDragEnd();
        dndDebug("dragend");
        setDragContext(undefined);
      },
      [onCodeDragEnd]
    );
    const intl = useIntl();
    const [{ dragDropSuccess }] = useSessionSettings();
    const tooltipDisabled =
      toolkitType === "ideas" ? true : Boolean(dragDropSuccess);
    const content = (
      <HStack
        // Interactive: click toggles the action button, drag inserts code
        // (also required by react-aria's Focusable tooltip trigger).
        role="button"
        draggable={toolkitType === "ideas" ? false : true}
        transition="background-color 120ms ease-out, box-shadow 120ms ease-out"
        borderWidth="2px"
        borderColor="var(--snippet-block-color)"
        borderRadius="md"
        fontFamily="code"
        fontWeight="normal"
        overflow="visible"
        ref={ref}
        gap="0"
        onClick={() => onToggle(!isOpen)}
        onDragStart={toolkitType === "ideas" ? () => {} : handleDragStart}
        onDragEnd={handleDragEnd}
        cursor={toolkitType === "ideas" ? "default" : "grab"}
        position="relative"
        width="max-content"
        minWidth="100%"
        zIndex="code"
        bgColor={raisedLook ? "brand.50" : "white"}
        boxShadow={
          raisedLook
            ? "inset 0 0 0 1px var(--snippet-block-color), inset 0 2px 10px rgba(78, 175, 71, 0.12)"
            : "none"
        }
        tabIndex={0}
        _focusVisible={{ focusRing: "outline" }}
        style={
          {
            "--snippet-block-color": accentColor ?? "var(--colors-brand-500)",
          } as CSSProperties
        }
        {...props}
      >
        <VisuallyHidden>
          <FormattedMessage id="code-example" />
        </VisuallyHidden>
        {toolkitType !== "ideas" && (
          <DragHandle
            css={{
              borderStartRadius: "sm",
              p: "1",
              alignSelf: "stretch",
              backgroundColor: "var(--snippet-block-color)",
              "& svg": {
                color: "black",
                opacity: highlightDragHandle ? 1 : 0.6,
                transition: "opacity 120ms ease-out",
              },
            }}
            highlight={highlightDragHandle}
          />
        )}

        <CodeMirrorView
          css={{
            // If we fix copy and deal with selection sync then we should
            // probably remove this, though it'll make it harder to drag.
            pointerEvents: "none",
            flex: "1 0 auto",
            p: "5",
            pl: "1",
            pt: "2",
            pb: "2",
            minW: "40",
          }}
          value={concise}
        />
      </HStack>
    );
    return tooltipDisabled ? (
      content
    ) : (
      <Tooltip
        hasArrow
        placement="top start"
        label={intl.formatMessage({ id: "drag-hover" })}
      >
        <Focusable>{content}</Focusable>
      </Tooltip>
    );
  }
);

export default CodeEmbed;
