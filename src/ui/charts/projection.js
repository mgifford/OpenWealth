function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function scaleX(index, totalPoints, width, padding) {
  if (totalPoints <= 1) {
    return padding;
  }
  const usable = width - padding * 2;
  return padding + (usable * index) / (totalPoints - 1);
}

function scaleY(value, maxValue, height, padding) {
  if (maxValue <= 0) {
    return height - padding;
  }
  const usable = height - padding * 2;
  const normalized = value / maxValue;
  return height - padding - usable * normalized;
}

function pointsForSeries(values, width, height, padding, maxValue) {
  return values
    .map((value, index) => {
      const x = scaleX(index, values.length, width, padding);
      const y = scaleY(value, maxValue, height, padding);
      return `${x},${y}`;
    })
    .join(" ");
}

export function buildProjectionSeries(annualProjection = []) {
  return {
    labels: annualProjection.map((row) => row.year),
    benefitsIncome: annualProjection.map((row) => Number(row.benefitsIncome ?? 0)),
    withdrawalsPlanned: annualProjection.map((row) => Number(row.withdrawalsPlanned ?? 0)),
    spendingNeed: annualProjection.map((row) => Number(row.spendingNeed ?? 0))
  };
}

export function renderProjectionChartSvg(series, options = {}) {
  const width = options.width ?? 860;
  const height = options.height ?? 260;
  const padding = options.padding ?? 28;
  const title = options.title ?? "Income projection over time";
  const description =
    options.description ??
    "Line chart showing annual benefits income, planned withdrawals, and spending need over projection years.";

  const maxValue = Math.max(
    1,
    ...series.benefitsIncome,
    ...series.withdrawalsPlanned,
    ...series.spendingNeed
  );

  const clippedMax = clamp(maxValue, 1, Number.MAX_SAFE_INTEGER);

  const benefitsPoints = pointsForSeries(series.benefitsIncome, width, height, padding, clippedMax);
  const withdrawalsPoints = pointsForSeries(series.withdrawalsPlanned, width, height, padding, clippedMax);
  const spendingPoints = pointsForSeries(series.spendingNeed, width, height, padding, clippedMax);

  return `
<figure>
  <figcaption>${title}</figcaption>
  <svg viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="projection-chart-title projection-chart-desc">
    <title id="projection-chart-title">${title}</title>
    <desc id="projection-chart-desc">${description}</desc>
    <line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" stroke="currentColor" stroke-opacity="0.4" />
    <line x1="${padding}" y1="${padding}" x2="${padding}" y2="${height - padding}" stroke="currentColor" stroke-opacity="0.4" />
    <polyline fill="none" stroke="#11a579" stroke-width="2" points="${benefitsPoints}" />
    <polyline fill="none" stroke="#3969ac" stroke-width="2" points="${withdrawalsPoints}" />
    <polyline fill="none" stroke="#f2b701" stroke-width="2" points="${spendingPoints}" />
  </svg>
  <p>Green: benefits income, Blue: planned withdrawals, Gold: spending need.</p>
</figure>
`.trim();
}
