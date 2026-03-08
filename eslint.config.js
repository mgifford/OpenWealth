export default [
  {
    files: ["**/*.js", "**/*.mjs"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        console: "readonly",
        process: "readonly",
        document: "readonly",
        window: "readonly",
        Blob: "readonly",
        URL: "readonly"
      }
    },
    rules: {
      "no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
      "no-undef": "error"
    }
  },
  {
    ignores: ["dist/**", "node_modules/**", "OpenWealth-from-codespaces.zip"]
  }
];
