import test from "node:test";
import assert from "node:assert/strict";

import {
  buildLiquidityBalance,
  renderLiquidityBalancePanel
} from "../../src/ui/results/liquidity-balance.js";

test("liquidity balance classifies fast and slow buckets", () => {
  const balance = buildLiquidityBalance({
    household: {
      accounts: [
        { account_type: "tfsa", current_balance: 10000 },
        { account_type: "non_registered", current_balance: 5000 },
        { account_type: "rrsp", current_balance: 85000 }
      ]
    }
  });

  assert.equal(balance.buckets.fast, 15000);
  assert.equal(balance.buckets.slow, 85000);
  assert.ok(balance.slowShare > 0.8);
  assert.match(balance.message, /slow money|cash poor/i);
});

test("liquidity panel renders donut and balance insight", () => {
  const html = renderLiquidityBalancePanel({
    buckets: { fast: 20000, slow: 80000 },
    total: 100000,
    fastShare: 0.2,
    slowShare: 0.8,
    mortgageLikeDebt: 150000,
    pensionIncome: 0,
    message: "Most wealth is slow money."
  });

  assert.match(html, /Portfolio Balance \(Levers Model\)/);
  assert.match(html, /Donut chart showing fast versus slow money/);
  assert.match(html, /Balance insight/);
});

test("liquidity balance handles all-fast households", () => {
  const balance = buildLiquidityBalance({
    household: {
      accounts: [
        { account_type: "cash", current_balance: 10000 },
        { account_type: "tfsa", current_balance: 20000 }
      ]
    }
  });

  assert.equal(balance.buckets.fast, 30000);
  assert.equal(balance.buckets.slow, 0);
  assert.equal(balance.fastShare, 1);
  assert.equal(balance.slowShare, 0);
});

test("liquidity balance handles all-slow households", () => {
  const balance = buildLiquidityBalance({
    household: {
      accounts: [
        { account_type: "rrsp", current_balance: 90000 },
        { account_type: "home_equity", current_balance: 300000 }
      ]
    }
  });

  assert.equal(balance.buckets.fast, 0);
  assert.equal(balance.buckets.slow, 390000);
  assert.equal(balance.fastShare, 0);
  assert.equal(balance.slowShare, 1);
  assert.match(balance.message, /slow money|cash poor/i);
});
