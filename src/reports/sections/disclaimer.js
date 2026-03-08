export const REPORT_DISCLAIMER =
  "OpenWealth outputs are informational planning projections only and are not financial advice.";

export function buildDisclaimerSection() {
  return {
    section_id: "disclaimer",
    title: "Important disclaimer",
    content: REPORT_DISCLAIMER
  };
}
