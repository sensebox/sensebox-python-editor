/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
export const moduleAndApiFromId = (id: string) => {
  const idSegments = id.split(".");
  const pythonModuleName = idSegments[0];
  const apiId = idSegments.slice(1).join(".");
  return {
    pythonModuleName,
    apiId,
  };
};
