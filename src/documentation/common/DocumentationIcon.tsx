/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { SystemStyleObject } from "styled-system/types";
import { SimpleImage } from "../../common/portable-text";
import OfflineImageFallback from "../OfflineImageFallback";
import ImageWithFallback from "./ImageWithFallback";

interface DocumentationIconProps {
  icon: SimpleImage;
  reduced: boolean;
  css?: SystemStyleObject;
}

const DocumentationIcon = ({ icon, reduced, css }: DocumentationIconProps) => {
  return (
    <ImageWithFallback
      css={css}
      transition="all .2s"
      width={reduced ? "50px" : "80px"}
      height={reduced ? "50px" : "80px"}
      src={icon.src}
      ignoreFallback={navigator.onLine}
      fallback={
        <OfflineImageFallback
          useIcon
          css={css}
          width={reduced ? "50px" : "80px"}
          height={reduced ? "50px" : "80px"}
        />
      }
      alt=""
    />
  );
};

export default DocumentationIcon;
