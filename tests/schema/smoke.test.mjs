import test from "node:test";
import assert from "node:assert/strict";
import { getSchemaCatalog } from "../../src/schemas/index.js";

test("schema smoke: module is reachable", () => {
  const catalog = getSchemaCatalog();
  assert.ok(catalog.household);
});
