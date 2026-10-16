/**
 * Icons that can be used for sidebar sections in content/sidebar.json.
 *
 * Listed explicitly so only these icons are bundled. Add more as needed.
 *
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { IconType } from "react-icons";
import {
  RiBookOpenLine,
  RiCompass3Line,
  RiCpuLine,
  RiDashboard3Line,
  RiFlaskLine,
  RiLightbulbFlashLine,
  RiPlantLine,
  RiRocketLine,
  RiSensorLine,
  RiTempHotLine,
  RiWifiLine,
} from "react-icons/ri";
import { VscLibrary } from "react-icons/vsc";

const sectionIcons: Record<string, IconType> = {
  RiBookOpenLine,
  RiCompass3Line,
  RiCpuLine,
  RiDashboard3Line,
  RiFlaskLine,
  RiLightbulbFlashLine,
  RiPlantLine,
  RiRocketLine,
  RiSensorLine,
  RiTempHotLine,
  RiWifiLine,
  VscLibrary,
};

export const sectionIcon = (name: string | undefined): IconType => {
  const icon = name ? sectionIcons[name] : undefined;
  if (name && !icon) {
    console.warn(
      `Unknown sidebar icon ${name}, see src/documentation/sections/icons.ts`
    );
  }
  return icon ?? VscLibrary;
};
