# Persona distributions — Stage A scaffold

This documents the weighted distributions used to sample the 1,000 persona
scaffolds in `personas/generate_scaffold.py`. These are **illustrative
approximations grounded in the general shape of real public data**
(Census-style age/income spread, FINRA-style financial-literacy spread,
Pew-style tech-adoption-by-age spread) — not sourced from a specific dataset
or citation, and not modeled on any real individual. Treat the exact
percentages as reasonable-shaped inputs for a testing corpus, not as a
claim of statistical accuracy.

Generation is deterministic and reproducible: `random.Random(SEED)` with
`SEED = 42`. Re-running the script produces the identical 1,000 personas.

## Independent base fields

**age_bracket**
| bucket | weight |
|---|---|
| 18-24 | 0.10 |
| 25-34 | 0.18 |
| 35-44 | 0.17 |
| 45-54 | 0.15 |
| 55-64 | 0.15 |
| 65-74 | 0.14 |
| 75+ | 0.11 |

**income_bracket**
| bucket | weight |
|---|---|
| <30k | 0.20 |
| 30-60k | 0.27 |
| 60-100k | 0.24 |
| 100-250k | 0.22 |
| 250k-1M | 0.06 |
| 1M+ | 0.01 |

**patience** (independent personality trait — not correlated with anything else)
| level | weight |
|---|---|
| low | 0.30 |
| medium | 0.45 |
| high | 0.25 |

## Correlated fields

Each of these has a base distribution that gets nudged by one or two other
already-sampled fields (multiply weights by the relevant multiplier, then
renormalize). This is a light heuristic model, not a rigorous joint
distribution — the goal is "realistic tendencies with real variance," not
strict correlation.

**occupation_archetype** — sampled directly from a fixed pool *per income
bracket* (5ish plausible occupations per bracket, roughly equal weight
within the bracket). See `OCCUPATION_BY_INCOME` in the script for the exact
pool per bracket (gig work / hourly retail at the low end, up through
multi-property investors and founders at the top end).

**tech_comfort** (low/medium/high) — base weights 0.30/0.40/0.30, nudged
younger-skews-high / older-skews-low via an age_bracket multiplier table.

**financial_literacy** (low/medium/high) — base weights 0.34/0.42/0.24
(loosely FINRA-study-shaped: roughly a third struggle with basic financial
literacy questions), nudged upward by income_bracket (more so) and mildly
by age_bracket.

**trust_in_platforms** (skeptical/neutral/trusting) — base weights
0.35/0.40/0.25, nudged more skeptical with age, and mildly more skeptical
at both income extremes (low income: wary of being surveilled/judged by
businesses; very high income: wary of a consumer "reputation score" as a
gimmick).

**device_context** (mobile-focused / mobile-distracted / desktop-focused /
desktop-multitasking / tablet-casual) — base weights
0.25/0.20/0.25/0.20/0.10, nudged toward mobile for younger age brackets and
toward desktop/tablet for older ones.

**platform_role** (consumer / business owner or service provider / both –
curious visitor) — base weights 0.68/0.22/0.10. Bumped toward "business"
when the sampled occupation is a business-owner or landlord/investor type.

## archetype_cluster — how the label is derived

Computed programmatically (no LLM), purely from the fields above, so
stratified sampling and theme reporting ("23/85 Skeptical Low-Tech
Consumers hit this") are reproducible. Rules are checked in order, first
match wins; anything that matches none falls back to a generic composed
label (`"{trust} {tech}-Tech {income-tier}-Income {Consumer|Business}"`).

1. skeptical + low tech + low income → **Skeptical Low-Tech Consumer**
2. business role + low patience → **Busy Small-Business Owner**
3. high income + trusting + high tech → **Affluent Early Adopter**
4. low tech + age 65+ → **Low-Tech Older Adult**
5. gig-work occupation + consumer role → **Gig Worker Optimizing Score**
6. skeptical + high income → **Skeptical High-Net-Worth Individual**
7. low patience + high tech + consumer role → **Impatient Power User**
8. trusting + low financial literacy → **Trusting Financially-Inexperienced Consumer**
9. "both/curious" role → **Curious Undecided Visitor**
10. mid income + medium tech + neutral trust → **Mainstream Middle-Class Consumer**

`income_tier` used above: low = {<30k, 30-60k}, mid = {60-100k, 100-250k},
high = {250k-1M, 1M+}.

## What Stage A does NOT decide

Stage A only produces the quantitative/categorical scaffold. It does not
generate a name, a goal, pain points, or a "voice" — those are qualitative
and are filled in by Stage B (batched LLM calls conditioned on the
scaffold), so they're grounded in the sampled demographics rather than
free-associated.
