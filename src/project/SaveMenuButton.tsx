/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import SaveButton from "./SaveButton";

interface SaveMenuButtonProps {
  size?: "lg" | "md" | "sm" | "xs";
}

/**
 * Save the main Python file.
 */
const SaveMenuButton = ({ size }: SaveMenuButtonProps) => (
  <SaveButton mode="button" size={size} />
);

export default SaveMenuButton;
