/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  Button,
  Collapse,
  Icon,
  IconButton,
  Link,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalHeader,
  Text,
  Tooltip,
} from "@microbit/ui";
import BlockContent from "@sanity/block-content-to-react";
import React, { ReactNode, useContext, useMemo, useRef, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { RiExternalLinkLine, RiQuestionLine } from "react-icons/ri";
import { Box, Stack } from "styled-system/jsx";
import { PortableText, SimpleImage } from "../../common/portable-text";
import { useRouterState } from "../../router-hooks";
import { useDocumentation } from "../documentation-hooks";
import { findSectionForSlug } from "../sections/content";
import {
  ToolkitApiLink,
  ToolkitCode,
  ToolkitExternalLink,
  ToolkitInternalLink,
} from "../reference/model";
import CodeEmbed from "./CodeEmbed";
import { decorateWithCollapseNodes } from "./collapse-util";
import ImageWithFallback from "./ImageWithFallback";
import OfflineImageFallback from "../OfflineImageFallback";
import { docStylesClass } from "../../common/documentation-styles";
import Spinner from "../../common/Spinner";
import ExpandableImage from "./ExpandableImage";

export const enum DocumentationCollapseMode {
  ShowAll,
  ExpandCollapseAll,
  ExpandCollapseExceptCode,
  ExpandCollapseExceptCodeAndFirstLine,
}

interface DocumentationContentProps {
  blocks?: PortableText;
  details?: DocumentationCollapseMode;
}

interface DocumentationContextValue {
  accentColor?: string;
  isExpanded?: boolean;
  parentSlug?: string;
  toolkitType?: string;
  title?: string;
  /**
   * The sidebar section the content belongs to.
   */
  sectionId?: string;
}

const DocumentationContext = React.createContext<DocumentationContextValue>({});

export const DocumentationContextProvider = ({
  children,
  ...other
}: DocumentationContextValue & { children: ReactNode }) => {
  return (
    <DocumentationContext.Provider value={other}>
      {children}
    </DocumentationContext.Provider>
  );
};

const useIsExpanded = () => {
  return useContext(DocumentationContext).isExpanded;
};

const useCodeEmbedContext = () => {
  const { parentSlug, toolkitType, title, sectionId, accentColor } =
    useContext(DocumentationContext);
  return { parentSlug, toolkitType, title, sectionId, accentColor };
};

const DocumentationApiLinkMark = (
  props: SerializerMarkProps<ToolkitApiLink>
) => {
  const [, setState] = useRouterState();
  return (
    <Link
      color="brand.600"
      onClick={(e) => {
        e.preventDefault();
        setState({
          tab: "api",
          slug: { id: props.mark.name },
        });
      }}
    >
      {props.children}
    </Link>
  );
};

const DocumentationInternalLinkMark = (
  props: SerializerMarkProps<ToolkitInternalLink>
) => {
  const [state, setState] = useRouterState();
  const { sections } = useDocumentation();
  const { sectionId } = useContext(DocumentationContext);
  if (props.mark.section === "hilfe") {
    return (
      <ConnectionHelpLink guideId={props.mark.slug.current}>
        {props.children}
      </ConnectionHelpLink>
    );
  }
  return (
    <Link
      color="brand.600"
      onClick={(e) => {
        e.preventDefault();
        const slug = props.mark.slug.current;
        const tab =
          props.mark.section ??
          (sections.status === "ok"
            ? findSectionForSlug(sections.content, slug)
            : undefined) ??
          sectionId;
        setState(
          {
            ...state,
            tab,
            slug: {
              id: slug,
            },
          },
          "user"
        );
      }}
    >
      {props.children}
    </Link>
  );
};

export const ConnectionHelpLink = ({
  guideId,
  children,
  iconOnly = false,
}: {
  guideId: string;
  children: ReactNode;
  iconOnly?: boolean;
}) => {
  const { connectionGuides } = useDocumentation();
  const [isOpen, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const intl = useIntl();
  const label = intl.formatMessage(
    { id: "connection-help-action" },
    { name: typeof children === "string" ? children : guideId }
  );
  const guide =
    connectionGuides.status === "ok"
      ? connectionGuides.content.find((item) => item.slug.current === guideId)
      : undefined;
  return (
    <Box as="span" display="inline-flex" onClick={(e) => e.stopPropagation()}>
      {iconOnly ? (
        <Tooltip label={label} hasArrow delay={300}>
          <IconButton
            ref={buttonRef}
            variant="ghost"
            size="sm"
            aria-label={label}
            aria-haspopup="dialog"
            onPress={() => setOpen(true)}
            css={{ color: "brand.500", fontSize: "20px", flexShrink: 0 }}
          >
            <RiQuestionLine />
          </IconButton>
        </Tooltip>
      ) : (
        <Button
          ref={buttonRef}
          variant="link"
          css={{ fontSize: "inherit", whiteSpace: "normal" }}
          onPress={() => setOpen(true)}
          aria-haspopup="dialog"
        >
          {children}
        </Button>
      )}
      <Modal
        isOpen={isOpen}
        onClose={() => setOpen(false)}
        finalFocusRef={buttonRef}
        isCentered
        isDismissable
        contentCss={{
          width: "calc(100vw - 32px)",
          maxWidth: "1000px",
          height: "auto",
          minHeight: "0",
          maxHeight: "calc(100vh - 32px)",
          margin: "16px 0",
          overflow: "hidden",
          "@supports (height: 100dvh)": {
            maxHeight: "calc(100dvh - 32px)",
          },
          "& > [role='dialog']": {
            minHeight: "0",
            overflow: "hidden",
          },
        }}
      >
        <ModalHeader css={{ pr: "12" }}>{guide?.name ?? children}</ModalHeader>
        <ModalCloseButton />
        <ModalBody
          css={{
            minHeight: "0",
            flex: "1 1 auto",
            overflowY: "auto",
            overscrollBehavior: "contain",
            overflowWrap: "anywhere",
            pb: "6",
          }}
        >
          {connectionGuides.status === "loading" ? (
            <Spinner />
          ) : guide ? (
            <Stack gap="3" className={docStylesClass}>
              {guide.image && (
                <Box
                  css={{
                    "& img": { maxHeight: "40vh", objectFit: "contain" },
                  }}
                >
                  <ExpandableImage image={guide.image} title={guide.name} />
                </Box>
              )}
              <DocumentationContent blocks={guide.content} />
            </Stack>
          ) : (
            <Text>
              <FormattedMessage id="toolkit-error-loading" />
            </Text>
          )}
        </ModalBody>
      </Modal>
    </Box>
  );
};

const DocumentationExternalLinkMark = (
  props: SerializerMarkProps<ToolkitExternalLink>
) => {
  return (
    <Link
      color="brand.600"
      href={props.mark.href}
      target="_blank"
      rel="nofollow noopener"
    >
      {props.children}
      <Icon
        css={{ mb: "0.333em", ml: "1", verticalAlign: "middle" }}
        as={RiExternalLinkLine}
      />
    </Link>
  );
};

interface SerializerNodeProps<T> {
  node: T;
}

interface HasChildren {
  children: ReactNode;
}

interface SerializerMarkProps<T> extends HasChildren {
  mark: T;
}

const ContextualCollapse = ({
  children,
  collapseToFirstLine,
}: {
  children: PortableText;
  collapseToFirstLine: boolean;
}) => {
  const isExpanded = useIsExpanded();
  const justFirstLine = collapseToFirstLine && !isExpanded;
  return (
    <Collapse
      isOpen={Boolean(isExpanded)}
      startingHeight={collapseToFirstLine ? "1.9725rem" : undefined}
    >
      <Stack gap="3" pt="3" lineClamp={justFirstLine ? "1" : undefined}>
        <BlockContent blocks={children} serializers={serializers} />
      </Stack>
    </Collapse>
  );
};

const ContextualCodeEmbed = ({ code }: { code: string }) => {
  const context = useCodeEmbedContext();
  return (
    <Box mt="3">
      <CodeEmbed {...context} code={code} />
    </Box>
  );
};

// We use context for information that would otherwise
// require us to recreate serializers to avoid elements
// being recreated that would break animations.
const serializers = {
  // This is a serializer for the wrapper element.
  // We use a fragment so we can use spacing from the context into which we render.
  container: ({ children }: HasChildren) => <>{children}</>,
  types: {
    block: (props: { node: { style: string }; children: any }) => {
      const style = props.node.style;
      if (/^h\d/.test(style)) {
        return (
          // For the moment we only support a h3 in ideas.
          <Text as={style as any} fontSize="lg" fontWeight="semibold">
            {props.children}
          </Text>
        );
      }
      return BlockContent.defaultSerializers.types.block(props);
    },
    collapse: ({
      node,
    }: SerializerNodeProps<{
      children: PortableText;
      collapseToFirstLine: boolean;
    }>) => <ContextualCollapse {...node} />,
    python: ({ node: { main } }: SerializerNodeProps<ToolkitCode>) => (
      <ContextualCodeEmbed code={main} />
    ),
    simpleImage: (props: SerializerNodeProps<SimpleImage>) => {
      return (
        <Box width="300px" maxWidth="100%">
          <ImageWithFallback
            src={props.node.src}
            ignoreFallback={navigator.onLine}
            fallback={<OfflineImageFallback width={300} />}
            alt={props.node.alt}
            borderRadius="lg"
            border="solid 1px"
            borderColor="gray.300"
          />
        </Box>
      );
    },
  },
  marks: {
    toolkitInternalLink: DocumentationInternalLinkMark,
    toolkitApiLink: DocumentationApiLinkMark,
    link: DocumentationExternalLinkMark,
  },
};

/**
 * Wrap with DocumentationContextProvider for linking and other contextual behaviours.
 */
const DocumentationContent = ({
  blocks,
  details = DocumentationCollapseMode.ShowAll,
}: DocumentationContentProps) => {
  // If we're expanding or collapsing then we pre-process the content to wrap every run of non-code in Collapse.
  blocks = useMemo(() => {
    if (details === DocumentationCollapseMode.ShowAll) {
      return blocks || [];
    }
    return decorateWithCollapseNodes(blocks, details);
  }, [details, blocks]);

  const rendered = <BlockContent blocks={blocks} serializers={serializers} />;
  return details === DocumentationCollapseMode.ShowAll ? (
    <Stack gap="3" mt="3">
      {rendered}
    </Stack>
  ) : (
    rendered
  );
};

export default React.memo(DocumentationContent);
