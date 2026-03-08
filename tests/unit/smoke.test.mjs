import test from "node:test";
import assert from "node:assert/strict";
import { appName } from "../../src/index.js";

test("unit smoke: app name is stable", () => {
  assert.equal(appName(), "OpenWealth");
});
