/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { moduleAndApiFromId } from "./apidocs-util";

describe("moduleAndApiFromId", () => {
  it("correctly splits module and apiId from id with three segments", () => {
    const id = "board.display.scroll";
    const { pythonModuleName, apiId } = moduleAndApiFromId(id);
    expect(pythonModuleName).toEqual("board");
    expect(apiId).toEqual("display.scroll");
  });
  it("correctly splits module and apiId from id with two segments", () => {
    const id = "log.add";
    const { pythonModuleName, apiId } = moduleAndApiFromId(id);
    expect(pythonModuleName).toEqual("log");
    expect(apiId).toEqual("add");
  });
  it("correctly splits module and apiId from id with one segment", () => {
    const id = "gc";
    const { pythonModuleName, apiId } = moduleAndApiFromId(id);
    expect(pythonModuleName).toEqual("gc");
    expect(apiId).toEqual("");
  });
});
