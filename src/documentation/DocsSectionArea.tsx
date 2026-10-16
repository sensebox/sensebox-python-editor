/**
 * (c) 2021-2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Text } from "@microbit/ui";
import { FormattedMessage } from "react-intl";
import Spinner from "../common/Spinner";
import { useDocumentation } from "./documentation-hooks";
import IdeasDocumentation from "./ideas/IdeasDocumentation";
import ReferenceToolkit from "./reference/ReferenceDocumentation";
import { DocsSectionConfig } from "./sections/config";

interface DocsSectionAreaProps {
  section: DocsSectionConfig;
}

/**
 * A sidebar tab for a documentation section from content/sidebar.json.
 */
const DocsSectionArea = ({ section }: DocsSectionAreaProps) => {
  const { sections } = useDocumentation();
  switch (sections.status) {
    case "loading":
      return <Spinner />;
    case "error":
      return (
        <Text p="5" height="100%">
          <FormattedMessage id="toolkit-error-loading" />
        </Text>
      );
    case "ok": {
      const content = sections.content[section.id];
      if (content?.layout === "cards") {
        return <IdeasDocumentation section={section} ideas={content.cards} />;
      }
      if (content?.layout === "reference") {
        return <ReferenceToolkit section={section} toolkit={content.toolkit} />;
      }
      return null;
    }
    default:
      throw new Error();
  }
};

export default DocsSectionArea;
