/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  Button,
  Image,
  Link,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  Text,
} from "@microbit/ui";
import { ReactNode, useCallback, useState } from "react";
import { RiFileCopy2Line } from "react-icons/ri";
import { FormattedMessage, useIntl } from "react-intl";
import { Flex, HStack, styled, VStack } from "styled-system/jsx";
import { useDeployment } from "../../deployment";
import pythonPoweredLogo from "./python-powered.png";

const versionInfo = [
  {
    name: "Editor",
    value: import.meta.env.VITE_VERSION,
  },
];

const clipboardVersion = versionInfo
  .map((x) => `${x.name} ${x.value}`)
  .join("\n");

// Minimal clipboard hook (the component library has no equivalent).
const useClipboard = (text: string) => {
  const [hasCopied, setHasCopied] = useState(false);
  const onCopy = useCallback(() => {
    void navigator.clipboard?.writeText(text);
    setHasCopied(true);
    window.setTimeout(() => setHasCopied(false), 1500);
  }, [text]);
  return { hasCopied, onCopy };
};

interface AboutDialogProps {
  isOpen: boolean;
  onClose: () => void;
  finalFocusRef: React.RefObject<HTMLButtonElement>;
}

/**
 * An about dialog with credits and version information.
 *
 * Shown via the help menu.
 */
const AboutDialog = ({ isOpen, onClose, finalFocusRef }: AboutDialogProps) => {
  const { hasCopied, onCopy } = useClipboard(clipboardVersion);
  const deployment = useDeployment();
  const intl = useIntl();
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="4xl"
      finalFocusRef={finalFocusRef}
      aria-label={intl.formatMessage({ id: "about" })}
    >
      <ModalCloseButton />
      <ModalBody>
        <VStack gap="8" pl="5" pr="5" pt="5">
          <HStack gap="4">
            {deployment.horizontalLogo ? (
              <Flex
                alignItems="center"
                justifyContent="flex-end"
                width="200px"
                mr="4"
              >
                {deployment.horizontalLogo}
              </Flex>
            ) : null}
            <Flex alignItems="center" justifyContent="flex-end">
              <Image
                src={pythonPoweredLogo}
                alt={intl.formatMessage({ id: "python-powered" })}
              />
            </Flex>
          </HStack>

          <Text fontSize="lg" textAlign="center">
            senseBox Python Editor
          </Text>
          <VStack alignItems="center" justifyContent="center" gap="4">
            <styled.table css={{ fontSize: "sm" }}>
              <styled.caption
                color="gray.800"
                css={{ captionSide: "top", py: "1" }}
              >
                <FormattedMessage id="software-versions" />
              </styled.caption>
              <styled.tbody>
                {versionInfo.map((v) => (
                  <styled.tr key={v.name}>
                    <styled.td
                      px="3"
                      py="1"
                      css={{
                        borderBottomWidth: "1px",
                        borderColor: "gray.100",
                      }}
                    >
                      {v.name}
                    </styled.td>
                    <styled.td
                      px="3"
                      py="1"
                      css={{
                        borderBottomWidth: "1px",
                        borderColor: "gray.100",
                      }}
                    >
                      {v.value}
                    </styled.td>
                  </styled.tr>
                ))}
              </styled.tbody>
            </styled.table>
            <Button startIcon={<RiFileCopy2Line />} onPress={onCopy} size="md">
              <FormattedMessage id={hasCopied ? "copied" : "copy-action"} />
            </Button>
          </VStack>
          <Text fontSize="lg">
            <FormattedMessage
              id="about-micropython"
              values={{
                link: (chunks: ReactNode) => (
                  <Link
                    color="brand.500"
                    href="https://circuitpython.org"
                    target="_blank"
                    rel="noopener"
                  >
                    {chunks}
                  </Link>
                ),
              }}
            />
          </Text>
        </VStack>
      </ModalBody>
      <ModalFooter>
        <Button onPress={onClose} variant="primary" size="lg">
          <FormattedMessage id="close-action" />
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default AboutDialog;
