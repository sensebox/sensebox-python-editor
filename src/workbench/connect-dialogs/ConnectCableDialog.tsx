/**
 * (c) 2021 - 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { FormattedMessage } from "react-intl";
import { VStack } from "styled-system/jsx";
import DialogHeading from "../../common/DialogHeading";

const ConnectCableDialogBody = () => (
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
      <FormattedMessage id="connect-cable-title" />
    </DialogHeading>
  </VStack>
);

export default ConnectCableDialogBody;
