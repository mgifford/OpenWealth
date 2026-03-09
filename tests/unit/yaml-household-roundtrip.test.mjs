import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { stringifyYaml } from "../../src/reports/yaml-stringify.js";
import { parseImportContent } from "../../src/imports/index.js";

function fixtureJson(name) {
  const content = readFileSync(join(process.cwd(), "tests", "fixtures", "import", name), "utf8");
  return JSON.parse(content);
}

test("yaml parser supports household round-trip export/import shape", () => {
  const household = fixtureJson("canonical-household.json");
  const yaml = stringifyYaml({
    schema_version: "1.0.0",
    household
  });

  const parsed = parseImportContent("yaml", yaml);

  assert.equal(parsed.schema_version, "1.0.0");
  assert.equal(parsed.household.household_id, household.household_id);
  assert.equal(parsed.household.name, household.name);
  assert.equal(parsed.household.people.length, household.people.length);
  assert.equal(parsed.household.accounts.length, household.accounts.length);
  assert.equal(
    parsed.household.accounts[0].current_balance,
    household.accounts[0].current_balance
  );
});
