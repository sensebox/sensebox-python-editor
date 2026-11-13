/**
 * (c) 2021 - 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { List, ListItem, Text } from "@microbit/ui";
import { FormattedMessage } from "react-intl";
import { VStack } from "styled-system/jsx";
import DialogHeading from "../../common/DialogHeading";

const ConnectHelpDialogBody = () => (
  <VStack
    width="auto"
    ml="auto"
    mr="auto"
    p="5"
    pb="0"
    gap="5"
    alignItems="flex-start"
  >
    <DialogHeading>
      <FormattedMessage id="connect-help-title" />
    </DialogHeading>
    <Text fontSize="xl">
      <FormattedMessage id="connect-help-message" />
    </Text>
    <List>
      <ListItem>
        <Text fontSize="xl">
          1. <FormattedMessage id="connect-help-one" />
        </Text>
      </ListItem>
      <ListItem>
        <Text fontSize="xl">
          2. <FormattedMessage id="connect-help-two" />
        </Text>
      </ListItem>
    </List>
  </VStack>
);

export default ConnectHelpDialogBody;
