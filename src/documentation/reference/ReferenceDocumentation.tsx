/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Divider, List, ListItem } from "@microbit/ui";
import { useCallback } from "react";
import { Box } from "styled-system/jsx";
import { docStylesClass } from "../../common/documentation-styles";
import HeadedScrollablePanel from "../../common/HeadedScrollablePanel";
import { Anchor, useRouterTabSlug } from "../../router-hooks";
import { useSettings } from "../../settings/settings";
import AreaHeading from "../../common/AreaHeading";
import { useAnimationDirection } from "../common/documentation-animation-hooks";
import DocumentationBreadcrumbHeading from "../common/DocumentationBreadcrumbHeading";
import DocumentationContent from "../common/DocumentationContent";
import DocumentationTopLevelItem from "../common/DocumentationTopLevelItem";
import { isV2Only } from "../common/model";
import { DocsSectionConfig, localize } from "../sections/config";
import { getTopicAndEntry } from "./content";
import { Toolkit } from "./model";
import ReferenceTopicEntry from "./ReferenceTopicEntry";

interface ReferenceDocumentationProps {
  section: DocsSectionConfig;
  toolkit: Toolkit;
}

/**
 * A data-driven toolkit component.
 *
 * The components used here are also used with the API data to
 * generate the API documentation.
 */
const ReferenceToolkit = ({
  section,
  toolkit,
}: ReferenceDocumentationProps) => {
  const [anchor, setAnchor] = useRouterTabSlug(section.id);
  const direction = useAnimationDirection(anchor);
  const topicOrEntryId = anchor?.id.split("/")[0];
  const handleNavigate = useCallback(
    (topicOrEntryId: string | undefined) => {
      setAnchor(topicOrEntryId ? { id: topicOrEntryId } : undefined, "user");
    },
    [setAnchor]
  );
  return (
    <ActiveLevel
      key={anchor ? 0 : 1}
      anchor={anchor}
      topicOrEntryId={topicOrEntryId}
      onNavigate={handleNavigate}
      section={section}
      toolkit={toolkit}
      direction={direction}
    />
  );
};

interface ActiveLevelProps extends ReferenceDocumentationProps {
  anchor: Anchor | undefined;
  topicOrEntryId: string | undefined;
  onNavigate: (topicOrEntryId: string | undefined) => void;
  direction: "forward" | "back" | "none";
}

const ActiveLevel = ({
  anchor,
  topicOrEntryId,
  onNavigate,
  section,
  toolkit,
  direction,
}: ActiveLevelProps) => {
  const [topic, activeItem] = getTopicAndEntry(toolkit, topicOrEntryId);
  const [{ languageId }] = useSettings();
  const referenceString = localize(section.title, languageId);
  const description = localize(section.description, languageId);
  if (topic) {
    return (
      <HeadedScrollablePanel
        // Key prop used to ensure scroll position top
        // after using internal link to toolkit topic.
        key={topic.name}
        direction={direction}
        heading={
          <DocumentationBreadcrumbHeading
            parent={referenceString}
            title={topic.name}
            onBack={() => onNavigate(undefined)}
            subtitle={topic.subtitle}
            icon={topic.image}
          />
        }
      >
        {topic.introduction && (
          <Box p="5" pb="1" fontSize="sm" className={docStylesClass}>
            <DocumentationContent blocks={topic.introduction} />
          </Box>
        )}
        <List flex="1 1 auto">
          {topic.contents?.map((item) => (
            <ListItem key={item.name}>
              <ReferenceTopicEntry
                topic={topic}
                entry={item}
                sectionId={section.id}
                anchor={anchor}
                active={activeItem === item}
              />
              <Divider />
            </ListItem>
          ))}
        </List>
      </HeadedScrollablePanel>
    );
  }
  return (
    <HeadedScrollablePanel
      direction={direction}
      heading={
        description ? (
          <AreaHeading name={referenceString} description={description} />
        ) : undefined
      }
    >
      <List flex="1 1 auto">
        {toolkit.contents?.map((topic) => (
          <DocumentationTopLevelItem
            key={topic.name}
            name={topic.name}
            isV2Only={isV2Only(topic)}
            description={topic.subtitle}
            icon={topic.image}
            onForward={() => onNavigate(topic.slug.current)}
            type="reference"
          />
        ))}
      </List>
    </HeadedScrollablePanel>
  );
};

export default ReferenceToolkit;
