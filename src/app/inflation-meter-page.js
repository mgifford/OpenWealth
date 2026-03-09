import {
  buildInflationRealityCheck,
  renderInflationRealityPanel
} from "../ui/results/inflation-reality.js";

function el(id) {
  return document.getElementById(id);
}

function toNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function formatPercent(value) {
  return `${(Number(value) * 100).toFixed(2)}%`;
}

function syncRateOutputs() {
  el("inflation-checking-rate-output").textContent = formatPercent(el("inflation-checking-rate").value);
  el("inflation-high-yield-rate-output").textContent = formatPercent(el("inflation-high-yield-rate").value);
  el("inflation-bond-rate-output").textContent = formatPercent(el("inflation-bond-rate").value);
  el("inflation-rate-output").textContent = formatPercent(el("inflation-rate").value);
}

function renderMeter() {
  syncRateOutputs();

  const check = buildInflationRealityCheck({
    principal: toNumber(el("inflation-cash-principal").value, 50000),
    checkingRate: toNumber(el("inflation-checking-rate").value, 0.0001),
    highYieldRate: toNumber(el("inflation-high-yield-rate").value, 0.045),
    bondRate: toNumber(el("inflation-bond-rate").value, 0.035),
    inflationRate: toNumber(el("inflation-rate").value, 0.025)
  });

  el("inflation-reality-container").innerHTML = renderInflationRealityPanel(check);
}

function initialize() {
  [
    "inflation-cash-principal",
    "inflation-checking-rate",
    "inflation-high-yield-rate",
    "inflation-bond-rate",
    "inflation-rate"
  ].forEach((id) => {
    el(id).addEventListener("input", renderMeter);
  });

  el("conservative-preset").addEventListener("click", () => {
    el("inflation-checking-rate").value = "0.0001";
    el("inflation-high-yield-rate").value = "0.04";
    el("inflation-bond-rate").value = "0.03";
    el("inflation-rate").value = "0.025";
    renderMeter();
  });

  el("current-market-preset").addEventListener("click", () => {
    el("inflation-checking-rate").value = "0.001";
    el("inflation-high-yield-rate").value = "0.045";
    el("inflation-bond-rate").value = "0.035";
    el("inflation-rate").value = "0.03";
    renderMeter();
  });

  renderMeter();
}

initialize();
