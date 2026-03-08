import test from "node:test";
import assert from "node:assert/strict";

import { createIndexedDbStore } from "../../../src/storage/indexeddb-store.js";
import { createHouseholdRepository, createScenarioRepository } from "../../../src/state/index.js";
import { createPlanningExperience } from "../../../src/ui/index.js";
import { renderAssumptionsPanel } from "../../../src/components/assumptions-panel.js";

function createDeps(name) {
  const store = createIndexedDbStore(name);
  return {
    householdRepository: createHouseholdRepository({ store }),
    scenarioRepository: createScenarioRepository({ store })
  };
}

test("journey: onboard -> add account -> create scenarios -> run -> compare", async () => {
  const experience = createPlanningExperience(createDeps("wp06-ui-journey"));
  const init = await experience.initialize();
  assert.equal(init.household, null);
  assert.equal(init.state.kind, "empty");

  let draft = experience.createOnboardingDraft();
  draft = experience.applyOnboardingStep(draft, "household", {
    name: "WP06 Household",
    province_or_territory: "ON"
  });
  draft = experience.applyOnboardingStep(draft, "people", {
    people: [
      {
        person_id: "person_1",
        display_name: "Taylor",
        birth_year: 1988,
        retirement_target_age: 64
      }
    ]
  });
  draft = experience.applyOnboardingStep(draft, "accounts", {
    accounts: [
      {
        account_id: "acc_tfsa",
        account_type: "tfsa",
        current_balance: 90000,
        annual_contribution: 7000,
        confidence: "high",
        user_verified: true
      },
      {
        account_id: "acc_rrsp",
        account_type: "rrsp",
        current_balance: 210000,
        annual_contribution: 12000,
        confidence: "medium",
        user_verified: true
      }
    ]
  });

  const onboarded = await experience.completeOnboarding(draft, {
    householdId: "hh_wp06_1",
    clock: () => new Date("2026-03-08T22:20:00Z")
  });
  assert.equal(onboarded.household.household_id, "hh_wp06_1");

  const withAccount = await experience.saveAccount({
    account_id: "acc_nonreg",
    account_type: "non_registered",
    current_balance: 50000,
    annual_contribution: 5000,
    institution: "Maple Bank",
    confidence: "high",
    user_verified: true
  });
  assert.equal(withAccount.accounts.length, 3);

  const scenarioBase = await experience.createScenario({
    scenario_id: "s_base",
    name: "Base",
    retirement_age: 64,
    cpp_start_age: 65,
    oas_start_age: 65,
    withdrawal_strategy: "blended",
    inflation_rate: 0.02,
    annual_spending: 60000,
    projection_years: 30
  });
  const scenarioDelay = await experience.createScenario({
    scenario_id: "s_delay",
    name: "Delay Benefits",
    retirement_age: 64,
    cpp_start_age: 70,
    oas_start_age: 70,
    withdrawal_strategy: "rrsp_first",
    inflation_rate: 0.02,
    annual_spending: 60000,
    projection_years: 30
  });

  const runResult = await experience.runScenario(scenarioBase.scenario_id, { currentAge: 38 });
  assert.equal(runResult.scenario.name, "Base");
  assert.equal(runResult.state.kind, "loading");
  assert.ok(runResult.engineResult.projection.annualProjection.length > 0);

  const assumptionsHtml = renderAssumptionsPanel(runResult.assumptionsPanel);
  assert.match(assumptionsHtml, /not financial advice/i);

  const compared = await experience.compareScenarios(
    [scenarioBase.scenario_id, scenarioDelay.scenario_id],
    { currentAge: 38 }
  );
  assert.equal(compared.comparison.rows.length, 2);
  assert.ok(compared.comparison.leader);
});

test("edge states: invalid scenario and missing household are surfaced", async () => {
  const deps = createDeps("wp06-ui-errors");
  const experience = createPlanningExperience(deps);

  const missingRun = await experience.runScenario("nope");
  assert.equal(missingRun.state.kind, "error");
  assert.match(missingRun.state.message, /missing household/i);

  const draft = experience.applyOnboardingStep(
    experience.applyOnboardingStep(
      experience.createOnboardingDraft(),
      "household",
      { name: "Edge Household", province_or_territory: "BC" }
    ),
    "people",
    {
      people: [
        {
          person_id: "edge_person",
          display_name: "Morgan",
          birth_year: 1990,
          retirement_target_age: 65
        }
      ]
    }
  );

  await experience.completeOnboarding(draft, {
    householdId: "hh_wp06_edge",
    clock: () => new Date("2026-03-08T22:25:00Z")
  });

  const invalidScenario = await experience.createScenario({
    scenario_id: "s_invalid",
    name: "Invalid Age",
    retirement_age: 39,
    cpp_start_age: 65,
    oas_start_age: 65,
    withdrawal_strategy: "blended",
    annual_spending: 55000,
    projection_years: 30
  }).catch((error) => ({ error }));
  assert.ok(invalidScenario.error);

  const compareNone = await experience.compareScenarios(["missing_scenario"]);
  assert.equal(compareNone.state.kind, "error");
  assert.match(compareNone.state.message, /no valid scenarios/i);
});
