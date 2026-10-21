/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  Button,
  ButtonGroup,
  MenuItem,
  MenuList,
  MenuTrigger,
  MoreMenuButton,
  Tooltip,
} from "@microbit/ui";
import React, {
  ForwardedRef,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { RiUsbLine } from "react-icons/ri";
import { FormattedMessage, useIntl } from "react-intl";
import { HStack } from "styled-system/jsx";
import { ConnectionStatus } from "@microbit/microbit-connection";
import { WebFileSystemConnection } from "../device/web-file-system-device";
import { useDevice, useConnectionStatus } from "../device/device-hooks";
import { useProjectActions } from "./project-hooks";
import { useHotkeys } from "react-hotkeys-hook";
import {
  globalShortcutConfig,
  keyboardShortcuts,
} from "../common/keyboard-shortcuts";
import { ConnectionAction, FinalFocusRef } from "./project-actions";

interface SendButtonProps {
  size?: "lg" | "md" | "sm" | "xs";
  sendButtonRef: React.RefObject<HTMLButtonElement>;
}

const SendButton = React.forwardRef(
  (
    { size, sendButtonRef }: SendButtonProps,
    ref: ForwardedRef<HTMLButtonElement>
  ) => {
    const device = useDevice();
    const [busy, setBusy] = useState(false);
    const status = useConnectionStatus();
    const connected = status === ConnectionStatus.Connected;
    const isCircuitPython = device instanceof WebFileSystemConnection;
    const [directorySelected, setDirectorySelected] = useState(
      isCircuitPython && device.hasDirectory
    );
    useEffect(() => {
      setDirectorySelected(isCircuitPython && device.hasDirectory);
    }, [device, isCircuitPython, status]);
    const actions = useProjectActions();
    const handleToggleConnected = useCallback(async () => {
      if (connected) {
        await actions.disconnect(menuButtonRef);
      } else {
        await actions.connect(false, ConnectionAction.CONNECT, menuButtonRef);
      }
    }, [connected, actions]);
    const intl = useIntl();
    const flashing = useRef<{ flashing: boolean; lastCompleteFlash: number }>({
      flashing: false,
      lastCompleteFlash: 0,
    });
    const handleSendToMicrobit = useCallback(
      async (finalFocusRef: FinalFocusRef) => {
        if (flashing.current.flashing) {
          // Ignore repeated clicks.
          return;
        }
        setBusy(true);
        flashing.current = {
          flashing: true,
          lastCompleteFlash: flashing.current.lastCompleteFlash,
        };
        try {
          await actions.flash(finalFocusRef);
        } finally {
          setDirectorySelected(isCircuitPython && device.hasDirectory);
          setBusy(false);
          flashing.current = {
            flashing: false,
            lastCompleteFlash: new Date().getTime(),
          };
        }
      },
      [flashing, actions, device, isCircuitPython]
    );
    const menuButtonRef = useRef<HTMLButtonElement>(null);
    const handleSelectDirectory = useCallback(async () => {
      if (!isCircuitPython || busy) return;
      setBusy(true);
      try {
        await actions.selectCircuitPythonDirectory(sendButtonRef);
      } finally {
        setDirectorySelected(device.hasDirectory);
        setBusy(false);
      }
    }, [actions, busy, device, isCircuitPython, sendButtonRef]);
    const activeElementRef = useRef<HTMLElement | null>(null);
    const handleSendToMicrobitShortcut = useCallback(() => {
      activeElementRef.current = document.activeElement as HTMLElement;
      handleSendToMicrobit(activeElementRef);
    }, [handleSendToMicrobit]);
    useHotkeys(
      keyboardShortcuts.sendToMicrobit,
      handleSendToMicrobitShortcut,
      globalShortcutConfig
    );
    return (
      <HStack>
        {isCircuitPython && (
          <Button isDisabled={busy} size={size} onPress={handleSelectDirectory}>
            <FormattedMessage id="circuitpython-directory-select" />
          </Button>
        )}
        <ButtonGroup isAttached>
          <Tooltip
            hasArrow
            placement="top start"
            label={intl.formatMessage({
              id: "send-hover",
            })}
          >
            <Button
              ref={ref}
              isDisabled={busy || (isCircuitPython && !directorySelected)}
              size={size}
              variant="primary"
              startIcon={<RiUsbLine />}
              onPress={() => handleSendToMicrobit(sendButtonRef)}
            >
              <FormattedMessage id="send-action" />
            </Button>
          </Tooltip>
          {!isCircuitPython && (
            <MenuTrigger>
              <MoreMenuButton
                ref={menuButtonRef}
                variant="primary"
                aria-label={intl.formatMessage({ id: "more-connect-options" })}
                data-testid="more-connect-options"
                size={size}
              />
              <MenuList>
                <MenuItem icon={<RiUsbLine />} onAction={handleToggleConnected}>
                  <FormattedMessage
                    id={connected ? "disconnect-action" : "connect-action"}
                  />
                </MenuItem>
              </MenuList>
            </MenuTrigger>
          )}
        </ButtonGroup>
      </HStack>
    );
  }
);

export default SendButton;
