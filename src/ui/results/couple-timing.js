function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function personTiming(person, scenarioRetirementAge, currentYear) {
  const currentAge = Math.max(0, currentYear - toNumber(person.birth_year, currentYear));
  const targetAge = toNumber(person.retirement_target_age, scenarioRetirementAge);
  const retirementAge = scenarioRetirementAge;

  const yearsUntilRetirement = Math.max(0, retirementAge - currentAge);
  const retirementYear = currentYear + yearsUntilRetirement;
  const targetYearsUntil = Math.max(0, targetAge - currentAge);
  const targetYear = currentYear + targetYearsUntil;

  return {
    personId: person.person_id,
    name: person.display_name ?? "Person",
    currentAge,
    targetAge,
    retirementAge,
    retirementYear,
    targetYear,
    yearsUntilRetirement,
    timingGapYears: retirementAge - targetAge
  };
}

export function buildCoupleTimingOutcomes(input) {
  const household = input.household ?? {};
  const scenario = input.scenario ?? {};
  const people = household.people ?? [];

  if (household.household_composition !== "couple" || people.length < 2) {
    return null;
  }

  const currentYear = input.currentYear ?? new Date().getUTCFullYear();
  const scenarioRetirementAge = toNumber(scenario.retirement_age, 65);

  const perPerson = people.map((person) => personTiming(person, scenarioRetirementAge, currentYear));

  const retirementYears = perPerson.map((person) => person.retirementYear);
  const retirementAges = perPerson.map((person) => person.retirementAge);

  const earliestRetirementYear = Math.min(...retirementYears);
  const latestRetirementYear = Math.max(...retirementYears);

  return {
    combined: {
      peopleCount: perPerson.length,
      averageRetirementAge: retirementAges.reduce((sum, age) => sum + age, 0) / retirementAges.length,
      earliestRetirementYear,
      latestRetirementYear,
      yearsUntilBothRetired: Math.max(0, latestRetirementYear - currentYear)
    },
    perPerson
  };
}

export function renderCoupleTimingOutcomes(outcomes) {
  if (!outcomes) {
    return "";
  }

  const rows = outcomes.perPerson
    .map(
      (person) =>
        `<tr><th scope="row">${person.name}</th><td>${person.currentAge}</td><td>${person.targetAge}</td><td>${person.retirementAge}</td><td>${person.retirementYear}</td><td>${person.timingGapYears}</td></tr>`
    )
    .join("");

  return `
    <section>
      <h3>Couple retirement timing outcomes</h3>
      <p>Average retirement age: <strong>${outcomes.combined.averageRetirementAge.toFixed(1)}</strong></p>
      <p>Earliest retirement year: <strong>${outcomes.combined.earliestRetirementYear}</strong></p>
      <p>Latest retirement year: <strong>${outcomes.combined.latestRetirementYear}</strong></p>
      <p>Years until both retired: <strong>${outcomes.combined.yearsUntilBothRetired}</strong></p>
      <table>
        <caption>Per-person retirement timing</caption>
        <thead>
          <tr>
            <th scope="col">Person</th>
            <th scope="col">Current age</th>
            <th scope="col">Target age</th>
            <th scope="col">Scenario age</th>
            <th scope="col">Retirement year</th>
            <th scope="col">Timing gap (years)</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </section>
  `;
}
