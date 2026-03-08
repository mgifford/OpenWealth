export function buildNextQuestionsSection(scenarioSection, caveatsSection) {
  const questions = [
    "Should retirement age assumptions be stress-tested by +/- 2 years?",
    "Are CPP and OAS start ages aligned with liquidity preferences?",
    "Do account contribution assumptions reflect expected cashflow?"
  ];

  if ((caveatsSection.warnings ?? []).length > 0) {
    questions.push("Which warnings should be resolved before relying on this scenario?");
  }

  if (scenarioSection.summary?.totalUnfunded > 0) {
    questions.push("What spending reduction or contribution increase closes unfunded years?");
  }

  return {
    section_id: "next_questions",
    title: "Recommended next questions",
    questions
  };
}
