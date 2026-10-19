/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Button } from "@microbit/ui";
import { useRef, useState } from "react";
import { GoTrash } from "react-icons/go";
import { RiTerminalLine } from "react-icons/ri";
import { FormattedMessage, useIntl } from "react-intl";
import { ConnectionStatus } from "@microbit/microbit-connection";
import { Flex, VStack } from "styled-system/jsx";
import HideSplitViewButton from "../common/SplitView/HideSplitViewButton";
import { topBarHeight } from "../deployment/misc";
import { useConnectionStatus } from "../device/device-hooks";
import { ConnectionAction } from "../project/project-actions";
import { useProjectActions } from "../project/project-hooks";
import { TerminalContext, useCurrentTerminalRef } from "../serial/serial-hooks";
import XTerm from "../serial/XTerm";
import { useSettings } from "../settings/settings";

interface ReplProps {
  shown: boolean;
  onReplHide: () => void;
  minWidth: number;
}

/** Uses the same device connection as the transfer button. */
const ReplWindow = (props: ReplProps) => (
  <TerminalContext>
    <ReplConsole {...props} />
  </TerminalContext>
);

const ReplConsole = ({ shown, onReplHide, minWidth }: ReplProps) => {
  const actions = useProjectActions();
  const connected = useConnectionStatus() === ConnectionStatus.Connected;
  const [busy, setBusy] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const terminal = useCurrentTerminalRef();
  const [{ fontSize }] = useSettings();
  const intl = useIntl();
  const toggle = async () => {
    if (busy) return;
    setBusy(true);
    try {
      if (connected) await actions.disconnect(buttonRef);
      else await actions.connect(false, ConnectionAction.CONNECT, buttonRef);
    } finally {
      setBusy(false);
    }
  };
  return (
    <Flex
      flex="1 1 100%"
      flexDirection="column"
      height="100%"
      position="relative"
    >
      <Flex
        position="absolute"
        top="0"
        left="0"
        alignItems="center"
        zIndex="1"
        style={{ height: topBarHeight }}
      >
        <HideSplitViewButton
          aria-label="Hide REPL"
          onClick={onReplHide}
          splitViewShown={shown}
          direction="expandLeft"
          css={{ boxShadow: "md" }}
        />
      </Flex>
      <VStack bg="gray.25" height="100%" gap="0">
        <Flex
          width="100%"
          bg="white"
          boxShadow="0px 4px 16px #00000033"
          alignItems="center"
          justifyContent="center"
          pl="8"
          gap="4"
          style={{ height: topBarHeight }}
        >
          <Button
            ref={buttonRef}
            isDisabled={busy}
            onPress={toggle}
            startIcon={<RiTerminalLine />}
          >
            <FormattedMessage
              id={
                connected ? "disconnect-action" : "circuitpython-connect-action"
              }
            />
          </Button>
        </Flex>
        <Flex
          width="100%"
          flex="1"
          minHeight="0"
          flexDirection="column"
          style={{ minWidth }}
          data-testid="sensebox-repl"
          aria-label={intl.formatMessage({ id: "serial-terminal" })}
        >
          <XTerm
            fontSizePt={fontSize}
            tabOutRef={buttonRef.current ?? document.body}
            style={{ height: "100%" }}
          />
        </Flex>
        <Flex
          px="5"
          py="6"
          width="100%"
          alignItems="center"
          justifyContent="end"
          bg="white"
        >
          <Button
            startIcon={<GoTrash />}
            onPress={() => terminal.current?.clear()}
          >
            <FormattedMessage id="circuitpython-console-clear" />
          </Button>
        </Flex>
      </VStack>
    </Flex>
  );
};

export default ReplWindow;
