/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Toolkit, ToolkitTopic, ToolkitTopicEntry } from "./model";

export const getTopicAndEntry = (
  toolkit: Toolkit,
  topicOrEntryId: string | undefined
): [ToolkitTopic | undefined, ToolkitTopicEntry | undefined] => {
  const topic = toolkit.contents?.find(
    (t) => t.slug.current === topicOrEntryId
  );
  if (topic) {
    return [topic, undefined];
  }
  const entry = toolkit.contents
    ?.flatMap((topic) => topic.contents ?? [])
    .find((entry) => entry.slug.current === topicOrEntryId);
  if (!entry) {
    return [undefined, undefined];
  }
  return [entry.parent, entry];
};
