/**
 * (c) 2021-2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { useCallback, useRef } from "react";
import { Box, Grid, Stack } from "styled-system/jsx";
import AreaHeading from "../../common/AreaHeading";
import { docStylesClass } from "../../common/documentation-styles";
import HeadedScrollablePanel from "../../common/HeadedScrollablePanel";
import { useResizeObserverContentRect } from "../../common/use-resize-observer";
import { Anchor, useRouterTabSlug } from "../../router-hooks";
import { useAnimationDirection } from "../common/documentation-animation-hooks";
import DocumentationBreadcrumbHeading from "../common/DocumentationBreadcrumbHeading";
import DocumentationContent, {
  DocumentationContextProvider,
} from "../common/DocumentationContent";
import ImageWithFallback from "../common/ImageWithFallback";
import { isV2Only } from "../common/model";
import IdeaCard from "./IdeaCard";
import { Idea } from "./model";
import OfflineImageFallback from "../OfflineImageFallback";
import { useSettings } from "../../settings/settings";
import { DocsSectionConfig, localize } from "../sections/config";

interface IdeasDocumentationProps {
  section: DocsSectionConfig;
  ideas: Idea[];
}

const IdeasDocumentation = ({ section, ideas }: IdeasDocumentationProps) => {
  const [anchor, setAnchor] = useRouterTabSlug(section.id);
  const direction = useAnimationDirection(anchor);
  const ideaId = anchor?.id;
  const handleNavigate = useCallback(
    (ideaId: string | undefined) => {
      setAnchor(ideaId ? { id: ideaId } : undefined, "user");
    },
    [setAnchor]
  );
  return (
    <ActiveLevel
      key={anchor ? 0 : 1}
      anchor={anchor}
      ideaId={ideaId}
      onNavigate={handleNavigate}
      section={section}
      ideas={ideas}
      direction={direction}
    />
  );
};

interface ActiveLevelProps extends IdeasDocumentationProps {
  anchor: Anchor | undefined;
  ideaId: string | undefined;
  onNavigate: (ideaId: string | undefined) => void;
  direction: "forward" | "back" | "none";
}

const ActiveLevel = ({
  ideaId,
  onNavigate,
  section,
  ideas,
  direction,
}: ActiveLevelProps) => {
  const activeIdea = ideas.find((idea) => idea.slug.current === ideaId);
  const [{ languageId }] = useSettings();
  const headingString = localize(section.title, languageId);
  const ref = useRef<HTMLDivElement>(null);
  const contentRect = useResizeObserverContentRect(ref);
  const contentWidth = contentRect?.width ?? 0;
  const numCols =
    !contentWidth || contentWidth > 1100 ? 3 : contentWidth > 550 ? 2 : 1;
  if (activeIdea) {
    return (
      <HeadedScrollablePanel
        key={activeIdea.slug.current}
        direction={direction}
        heading={
          <DocumentationBreadcrumbHeading
            parent={headingString}
            title={activeIdea.name}
            onBack={() => onNavigate(undefined)}
            isV2Only={isV2Only(activeIdea)}
          />
        }
      >
        {activeIdea.content && (
          <Stack
            gap="3"
            fontSize="sm"
            p="5"
            pr="3"
            mt="1"
            mb="1"
            className={docStylesClass}
          >
            {activeIdea.image && (
              <Box width="600px" maxWidth="100%">
                <ImageWithFallback
                  src={activeIdea.image.src}
                  ignoreFallback={navigator.onLine}
                  fallback={<OfflineImageFallback width={600} />}
                  alt={activeIdea.image.alt ?? ""}
                  borderTopRadius="lg"
                />
              </Box>
            )}

            <DocumentationContextProvider
              parentSlug={activeIdea.slug.current}
              toolkitType="ideas"
              sectionId={section.id}
              title={activeIdea.name}
            >
              <DocumentationContent blocks={activeIdea.content} />
            </DocumentationContextProvider>
          </Stack>
        )}
      </HeadedScrollablePanel>
    );
  }
  return (
    <HeadedScrollablePanel
      direction={direction}
      heading={
        <AreaHeading
          name={headingString}
          description={localize(section.description, languageId)}
        />
      }
    >
      <Grid
        columns={numCols === 3 ? 3 : numCols === 2 ? 2 : 1}
        gap="5"
        p="5"
        ref={ref}
      >
        {ideas.map((idea) => (
          <IdeaCard
            key={idea.name}
            name={idea.name}
            isV2Only={isV2Only(idea)}
            image={idea.image}
            onClick={() => onNavigate(idea.slug.current)}
          />
        ))}
      </Grid>
    </HeadedScrollablePanel>
  );
};

export default IdeasDocumentation;
