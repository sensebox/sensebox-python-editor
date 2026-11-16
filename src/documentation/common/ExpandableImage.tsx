/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  Button,
  Image,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalHeader,
  Tooltip,
} from "@microbit/ui";
import { useRef, useState } from "react";
import { useIntl } from "react-intl";
import { SimpleImage } from "../../common/portable-text";
import OfflineImageFallback from "../OfflineImageFallback";
import ImageWithFallback from "./ImageWithFallback";

interface ExpandableImageProps {
  image: SimpleImage;
  title: string;
}

const ExpandableImage = ({ image, title }: ExpandableImageProps) => {
  const [isOpen, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const intl = useIntl();
  const label = intl.formatMessage(
    { id: "enlarge-image-action" },
    { name: title }
  );

  return (
    <>
      <Tooltip label={label} hasArrow delay={300}>
        <Button
          ref={buttonRef}
          variant="plain"
          aria-label={label}
          onPress={() => setOpen(true)}
          css={{
            display: "block",
            width: "100%",
            height: "auto",
            padding: "0",
            borderRadius: "lg",
            cursor: "zoom-in",
          }}
        >
          <ImageWithFallback
            src={image.src}
            ignoreFallback={navigator.onLine}
            fallback={<OfflineImageFallback width={600} />}
            alt={image.alt ?? title}
            borderRadius="lg"
            width="100%"
          />
        </Button>
      </Tooltip>
      <Modal
        isOpen={isOpen}
        onClose={() => setOpen(false)}
        finalFocusRef={buttonRef}
        isCentered
        isDismissable
        contentCss={{
          width: "calc(100vw - 32px)",
          maxWidth: "1600px",
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
        <ModalHeader css={{ pr: "12" }}>{title}</ModalHeader>
        <ModalCloseButton />
        <ModalBody
          css={{ minHeight: "0", flex: "1 1 auto", overflowY: "auto", pb: "6" }}
        >
          <Image
            src={image.src}
            alt={image.alt ?? title}
            width="100%"
            maxHeight="calc(90vh - 8rem)"
            objectFit="contain"
          />
        </ModalBody>
      </Modal>
    </>
  );
};

export default ExpandableImage;
