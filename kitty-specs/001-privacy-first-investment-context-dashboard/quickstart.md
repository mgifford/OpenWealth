# Quickstart: Privacy-First Investment Context Dashboard

## 1. Install and Run
```bash
npm install
npm run dev
```

## 2. Create Baseline Household
1. Open app and create a household profile.
2. Add at least one person and province/territory.
3. Add accounts for TFSA/RRSP/FHSA/RESP/non-registered as applicable.
4. Save baseline state (auto-persist local-first).

## 3. Add Planning Scenario
1. Create scenario `retire-65-cpp-70-oas-65`.
2. Set withdrawal strategy (`tfsa_first`, `rrsp_first`, `blended`) for comparison.
3. Run model and verify deterministic output generated.

## 4. Import Update Flow (YAML/JSON/CSV)
1. Upload a sample file from `examples/households/`.
2. Confirm parse + schema validation result.
3. Review human-readable diff preview.
4. Approve merge and verify pre-merge snapshot created.

## 5. Sustainability and Climate Overlay
1. Set sustainability preferences.
2. Re-run scenario.
3. Confirm output includes component metrics and availability states.

## 6. Export Report Bundle
1. Generate report.
2. Download bundle.
3. Confirm bundle includes:
   - HTML report
   - household.yaml
   - scenario-results.yaml
   - assumptions.yaml
   - manifest.yaml

## 7. Test Commands
```bash
npm test
npm run test:schema
npm run test:regression
npm run build
```
