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

  const currentYear = outcomes.combined.latestRetirementYear - outcomes.combined.yearsUntilBothRetired;
  const years = outcomes.perPerson.map((person) => person.retirementYear);
  const minYear = Math.min(currentYear, ...years);
  const maxYear = Math.max(...years);
  const span = Math.max(1, maxYear - minYear);
  const width = 640;
  const leftPad = 48;
  const rightPad = 24;
  const y = 50;

  const nowX = leftPad + ((currentYear - minYear) / span) * (width - leftPad - rightPad);

  const points = outcomes.perPerson
    .map((person, index) => {
      const x = leftPad + ((person.retirementYear - minYear) / span) * (width - leftPad - rightPad);
      const color = index % 2 === 0 ? "#0d7a63" : "#2f6ccf";
      return `
        <circle cx="${x}" cy="${y}" r="7" fill="${color}"></circle>
        <text x="${x}" y="30" text-anchor="middle" font-size="11">${person.name}</text>
        <text x="${x}" y="74" text-anchor="middle" font-size="10">${person.retirementYear}</text>
      `;
    })
    .join("");

  const cards = outcomes.perPerson
    .map(
      (person) => `
        <article class="metric-primary">
          <p class="label">${person.name}</p>
          <p>Current age: <strong>${person.currentAge}</strong></p>
          <p>Target age: <strong>${person.targetAge}</strong></p>
          <p>Scenario retirement age: <strong>${person.retirementAge}</strong></p>
          <p>Timing gap: <strong>${person.timingGapYears}</strong> year(s)</p>
        </article>
      `
    )
    .join("");

  return `
    <section>
      <h3>Couple retirement timing outcomes</h3>
      <p>Average retirement age: <strong>${outcomes.combined.averageRetirementAge.toFixed(1)}</strong></p>
      <p>Earliest retirement year: <strong>${outcomes.combined.earliestRetirementYear}</strong></p>
      <p>Latest retirement year: <strong>${outcomes.combined.latestRetirementYear}</strong></p>
      <p>Years until both retired: <strong>${outcomes.combined.yearsUntilBothRetired}</strong></p>
      <figure>
        <figcaption>Life timeline</figcaption>
        <svg viewBox="0 0 ${width} 100" role="img" aria-label="Couple retirement life timeline">
          <line x1="${leftPad}" y1="${y}" x2="${width - rightPad}" y2="${y}" stroke="currentColor" stroke-opacity="0.4"></line>
          <circle cx="${nowX}" cy="${y}" r="5" fill="#444"></circle>
          <text x="${nowX}" y="86" text-anchor="middle" font-size="10">Now (${currentYear})</text>
          ${points}
        </svg>
      </figure>
      <div class="metric-primary-grid">${cards}</div>
    </section>
  `;
}
