/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { NativeSelect, Text } from "@microbit/ui";
import { ChangeEvent, useCallback, useEffect, useState } from "react";
import { Box, styled } from "styled-system/jsx";
import { docStylesClass } from "../../common/documentation-styles";
import { Anchor } from "../../router-hooks";
import DocumentationContent, {
  DocumentationCollapseMode,
  DocumentationContextProvider,
} from "../common/DocumentationContent";
import DocumentationHeading from "../common/DocumentationHeading";
import { isV2Only } from "../common/model";
import Highlight from "./Highlight";
import {
  ToolkitTopic,
  ToolkitTopicEntry as ToolkitTopicEntryModel,
} from "./model";

interface ToolkitTopicEntryProps {
  topic: ToolkitTopic;
  entry: ToolkitTopicEntryModel;
  alternative?: string;
  active?: boolean;
  anchor?: Anchor;
  sectionId: string;
  accentColor?: string;
}

/**
 * A toolkit topic entry with its full description and details.
 *
 * Code remains in place on hover; long lines scroll within the snippet.
 */
const ReferenceTopicEntry = ({
  anchor,
  topic,
  entry,
  active,
  sectionId,
  accentColor,
}: ToolkitTopicEntryProps) => {
  const { content, detailContent, alternatives, alternativesLabel } = entry;
  const activeAlterative = anchor?.id.split("/")[1];
  const [alternativeSlug, setAlternativeSlug] = useState<string | undefined>(
    alternatives && alternatives.length > 0
      ? activeAlterative && active
        ? activeAlterative
        : alternatives[0].slug.current
      : undefined
  );
  const activeAlterativeContent = alternatives?.find(
    (a) => a.slug.current === alternativeSlug
  )?.content;

  useEffect(() => {
    if (activeAlterative && active) {
      setAlternativeSlug(activeAlterative);
    }
  }, [active, activeAlterative]);

  const handleSelectChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      setAlternativeSlug(e.currentTarget.value);
    },
    [setAlternativeSlug]
  );
  const toolkitType = "reference";
  return (
    <DocumentationContextProvider
      parentSlug={entry.slug.current}
      toolkitType={toolkitType}
      sectionId={sectionId}
      isExpanded
      accentColor={accentColor}
      title={topic.name}
    >
      <Highlight
        anchor={anchor}
        id={topic.name}
        active={active}
        accentColor={accentColor}
      >
        <Box fontSize="sm" p="5" className={"docs-code " + docStylesClass}>
          <DocumentationHeading name={entry.name} isV2Only={isV2Only(entry)} />
          <DocumentationContent blocks={content} />
          {alternatives && typeof alternativeSlug === "string" && (
            <>
              <styled.label display="flex" flexWrap="wrap" mt="3">
                <Text alignSelf="center" mr="2" as="span">
                  {alternativesLabel}
                </Text>
                <NativeSelect
                  wrapperCss={{ width: "fit-content" }}
                  onChange={handleSelectChange}
                  value={alternativeSlug}
                  size="sm"
                >
                  {alternatives.map((alterative) => (
                    <option
                      key={alterative.slug.current}
                      value={alterative.slug.current}
                    >
                      {alterative.name}
                    </option>
                  ))}
                </NativeSelect>
              </styled.label>

              <DocumentationContent
                details={DocumentationCollapseMode.ShowAll}
                blocks={activeAlterativeContent}
              />
            </>
          )}
          <DocumentationContent
            details={DocumentationCollapseMode.ShowAll}
            blocks={detailContent}
          />
        </Box>
      </Highlight>
    </DocumentationContextProvider>
  );
};

export default ReferenceTopicEntry;
