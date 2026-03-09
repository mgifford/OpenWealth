import test from "node:test";
import assert from "node:assert/strict";

import {
  listRetirementPersonas,
  pickRandomRetirementPersona,
  applyPersonaToFormValues
} from "../../src/ui/personas/index.js";

test("persona catalog exposes frugal/comfortable retirement options", () => {
  const personas = listRetirementPersonas();
  assert.ok(personas.length >= 3);
  assert.ok(personas.some((persona) => persona.lifestyle === "frugal"));
  assert.ok(personas.some((persona) => persona.lifestyle === "comfortable"));
});

test("random persona picker is deterministic when random function is injected", () => {
  const persona = pickRandomRetirementPersona(() => 0);
  assert.equal(persona.persona_id, "steady-saver");
});

test("applyPersonaToFormValues maps retirement goal and life expectancy ranges", () => {
  const persona = pickRandomRetirementPersona(() => 0);
  const values = applyPersonaToFormValues(persona);

  assert.equal(values.strategy, "blended");
  assert.match(values.retirementGoalRange, /900k/i);
  assert.equal(values.lifeExpectancyRange, "86-92");
});
