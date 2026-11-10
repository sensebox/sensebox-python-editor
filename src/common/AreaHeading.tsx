/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Text } from "@microbit/ui";
import { ReactNode } from "react";
import { Box, HStack } from "styled-system/jsx";

interface AreaHeadingProps {
  name: string;
  description: ReactNode;
  action?: ReactNode;
}

const AreaHeading = ({ name, description, action }: AreaHeadingProps) => (
  <Box p="5" pt="3">
    <HStack gap="2">
      <Text as="h2" fontSize="3xl" fontWeight="semibold">
        {name}
      </Text>
      {action}
    </HStack>
    <Text fontSize="md">{description}</Text>
  </Box>
);

export default AreaHeading;
