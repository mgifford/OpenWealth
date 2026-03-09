export const REPORT_TEMPLATE = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{{reportTitle}}</title>
  </head>
  <body>
    <header>
      <h1>{{reportTitle}}</h1>
      <p>{{reportSubtitle}}</p>
    </header>

    <section>
      <h2>Disclaimer</h2>
      <p>{{disclaimer}}</p>
    </section>

    <section>
      <h2>Profile</h2>
      <p>{{profileLine}}</p>
    </section>

    <section>
      <h2>Accounts</h2>
      <p>Total balance: {{totalBalance}}</p>
    </section>

    <section>
      <h2>Scenario Summary</h2>
      <p>Final net worth: {{finalNetWorth}}</p>
      <p>Total unfunded: {{totalUnfunded}}</p>
    </section>

    <section>
      <h2>Assumptions</h2>
      <pre>{{assumptionsJson}}</pre>
    </section>

    <section>
      <h2>Caveats</h2>
      <pre>{{warningsJson}}</pre>
    </section>

    <section>
      <h2>Sustainability and climate context</h2>
      <pre>{{sustainabilityJson}}</pre>
    </section>

    <section>
      <h2>Recommended next questions</h2>
      <pre>{{nextQuestionsJson}}</pre>
    </section>

    <section>
      <h2>Change log</h2>
      <pre>{{changeLogJson}}</pre>
    </section>

    <script type="application/json" id="openwealth-report-metadata">{{metadataJson}}</script>
  </body>
</html>
`;
