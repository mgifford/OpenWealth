# Investment Reading List

This document curates a selection of books relevant to the principles behind OpenWealth:
evidence-based long-term planning, transparent assumptions, behavioural awareness, and
values-aligned investing.

The list is drawn from well-known titles in the investing literature and is intended to:

- Help users build financial literacy alongside the planning tool.
- Provide background context for LLMs assisting with scenario generation and explanation.
- Ground the tool's design decisions in established investment thinking.

This is **not** a trading reading list. OpenWealth is a planning tool, not a brokerage or
short-term trading platform. Books focused on day trading, forex speculation, or technical
analysis have been intentionally excluded.

---

## Foundational Texts

### A Random Walk Down Wall Street
*Burton G. Malkiel (latest edition 2023)*

The canonical argument for passive, index-based investing. Explains efficient-market theory
accessibly and demonstrates why market timing consistently underperforms low-cost index funds
over the long run. Directly supports OpenWealth's default assumption of diversified index
returns rather than active stock-picking.

**Relevance:** Core justification for using broad market return assumptions in scenario modelling.

---

### Common Stocks and Uncommon Profits and Other Writings
*Philip A. Fisher (1958, revised)*

A foundational text on qualitative, long-term equity analysis. Fisher's "scuttlebutt"
approach emphasises understanding a business deeply before investing, rather than reacting
to price movements.

**Relevance:** Useful background for users considering individual equity holdings within
non-registered accounts.

---

### Irrational Exuberance
*Robert J. Shiller (3rd edition 2015)*

A data-driven examination of asset price bubbles and long-run mean reversion in equity and
housing markets. Shiller's CAPE ratio and narrative economics ideas are directly applicable
to setting realistic long-run return assumptions.

**Relevance:** Informs conservative return assumptions and the importance of scenario
stress-testing. Referenced in OpenWealth's sensitivity and simulation layers.

---

### Fooled by Randomness: The Hidden Role of Chance in Life and in the Markets
*Nassim Nicholas Taleb (2005)*

Argues that investment outcomes are far more driven by luck and randomness than skill or
strategy, and that humans systematically underestimate this. Pairs well with OpenWealth's
commitment to transparent assumptions and explicit uncertainty ranges.

**Relevance:** Motivation for showing scenario bands (best/likely/worst) rather than single
point projections, and for labelling inferred values clearly.

---

### Extraordinary Popular Delusions and the Madness of Crowds
*Charles Mackay (1841)*

A historical account of speculative manias (tulip mania, the South Sea Bubble, John Law's
Mississippi scheme). Despite its age, it remains the clearest account of how collective
irrationality distorts prices.

**Relevance:** Historical grounding for why OpenWealth avoids momentum-based or
sentiment-driven assumptions.

---

## Behavioural Finance and Investor Psychology

### Market Wizards: Interviews with Top Traders
*Jack D. Schwager (updated edition 2012)*

A series of interviews with consistently profitable traders. The recurring themes are
discipline, risk management, and knowing one's own decision-making biases — not finding
secret patterns.

**Relevance:** Useful for understanding that consistency and process matter more than any
single strategy.

---

### One Up On Wall Street
*Peter Lynch (2000)*

Lynch's accessible argument that individual investors can outperform institutions by
investing in what they know and understand. Emphasises patience, fundamental analysis,
and ignoring short-term noise.

**Relevance:** Reinforces the long-horizon, fundamentals-first planning philosophy of
OpenWealth.

---

## Evidence-Based and Systematic Approaches

### Dual Momentum Investing: An Innovative Strategy for Higher Returns with Lower Risk
*Gary Antonacci (2015)*

A systematic, rules-based momentum strategy designed to capture equity risk premium while
reducing drawdowns. Unlike discretionary trading strategies, it can be defined and
backtested deterministically.

**Relevance:** Example of a transparent, rule-based strategy that can be expressed as
deterministic parameters within OpenWealth's planning engine.

---

## Market Transparency and Integrity

### Flash Boys: A Wall Street Revolt
*Michael Lewis (2015)*

An account of high-frequency trading and its impact on market fairness. Raises important
questions about whose interests financial markets serve and why low-cost, transparent
vehicles (index funds, ETFs) tend to serve ordinary investors better than complex products.

**Relevance:** Background for OpenWealth's preference for transparent, low-cost investment
vehicles over complex or opaque products.

---

## For LLM Context

When an LLM assistant is used within OpenWealth for scenario drafting, explanation, or
intake guidance, the following principles from this reading list should be reflected:

1. **Assume markets are broadly efficient over long horizons** (Malkiel, Shiller). Do not
   generate outputs implying the user can reliably beat the market.

2. **Make uncertainty explicit** (Taleb, Shiller). Scenario outputs should express ranges,
   not single confident projections.

3. **Favour low-cost, broadly diversified vehicles** (Malkiel, Lewis). Do not suggest
   complex or opaque financial products.

4. **Separate process from outcome** (Schwager, Taleb). A good plan executed consistently
   matters more than finding the "optimal" allocation.

5. **Long-term fundamentals over short-term signals** (Fisher, Lynch). OpenWealth's engine
   uses rolling assumptions, not current market prices or sentiment.

6. **Never represent LLM output as financial advice.** Use deterministic engine outputs as
   the source of truth and LLM narration only to explain those outputs.

---

## Canadian-Specific Resources

The books above are primarily American in focus. For Canadian planning specifics relevant
to TFSA, RRSP, FHSA, RESP, CPP, and OAS, refer to:

- **Canada Revenue Agency (CRA)** — [canada.ca/taxes](https://www.canada.ca/en/services/taxes.html)
- **Financial Consumer Agency of Canada (FCAC)** — [canada.ca/fcac](https://www.canada.ca/en/financial-consumer-agency.html)
- **Office of the Superintendent of Financial Institutions (OSFI)** — [osfi-bsif.gc.ca](https://www.osfi-bsif.gc.ca)
- **Canadian Couch Potato** — evidence-based passive investing for Canadian investors
  ([canadiancouchpotato.com](https://canadiancouchpotato.com))
- **The MoneySense ETF All-Stars** — annual list of recommended low-cost ETFs for Canadians

These resources are freely available and directly applicable to the account types and
tax rules that OpenWealth models.

---

## Note on Sources

The book titles in this list are drawn in part from the inventory at
[github.com/saz33m1/some-investment-books](https://github.com/saz33m1/some-investment-books),
which provided a useful catalogue of widely cited investment texts. This reading list links
to published titles only — obtain books through your local library, a legitimate retailer,
or an authorised digital platform.
