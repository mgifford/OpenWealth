export function buildChangeLogSection(context) {
  return {
    section_id: "change_log",
    title: "Change log",
    generated_at: context.generatedAt,
    schema_version: context.schemaVersion,
    entries: [
      {
        timestamp: context.generatedAt,
        action: "report_generated",
        detail: "Generated portable HTML + YAML bundle"
      }
    ]
  };
}
