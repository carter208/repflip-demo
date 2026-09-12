#!/usr/bin/env python3
"""
Stage A — deterministic persona scaffold generator for the Repflip
persona-testing sprint. See ../distributions.md for the weight tables and
rationale this implements.

Produces:
  persona-sprint/personas/scaffold.jsonl         one scaffold object per line
  persona-sprint/personas/batches/scaffold-NN.json   chunked for Stage B (LLM) calls

Deterministic: same SEED always produces the same 1000 personas.
"""

import json
import random
from pathlib import Path

SEED = 42
N_PERSONAS = 1000
BATCH_SIZE = 50

HERE = Path(__file__).parent
BATCHES_DIR = HERE / "batches"

# ── Base distributions ──────────────────────────────────────────────────

AGE_BRACKETS = [
    ("18-24", 0.10), ("25-34", 0.18), ("35-44", 0.17), ("45-54", 0.15),
    ("55-64", 0.15), ("65-74", 0.14), ("75+", 0.11),
]

INCOME_BRACKETS = [
    ("<30k", 0.20), ("30-60k", 0.27), ("60-100k", 0.24),
    ("100-250k", 0.22), ("250k-1M", 0.06), ("1M+", 0.01),
]

PATIENCE_BASE = [("low", 0.30), ("medium", 0.45), ("high", 0.25)]

OCCUPATION_BY_INCOME = {
    "<30k": [
        "gig worker / rideshare or delivery", "hourly retail or food-service worker",
        "part-time caregiver", "student with part-time job", "seasonal/temp worker",
    ],
    "30-60k": [
        "hourly retail or warehouse worker", "administrative assistant",
        "tradesperson (apprentice/journeyman)", "gig worker (multiple platforms)",
        "home health aide",
    ],
    "60-100k": [
        "salaried office professional", "public school teacher",
        "small business owner (solo)", "licensed tradesperson (electrician/plumber)",
        "registered nurse",
    ],
    "100-250k": [
        "mid-level corporate professional", "established small business owner (with employees)",
        "healthcare professional (specialist/PA)", "tech industry professional",
        "dual-income household, both professional",
    ],
    "250k-1M": [
        "senior corporate executive", "established business owner (multi-location)",
        "specialized professional (attorney, physician)",
        "real estate investor / landlord (multiple properties)",
    ],
    "1M+": [
        "high-net-worth entrepreneur / founder", "private investor",
        "senior executive with significant equity",
        "multi-property real estate investor",
    ],
}

TECH_COMFORT_BASE = {"low": 0.30, "medium": 0.40, "high": 0.30}
TECH_COMFORT_AGE_MULT = {
    "18-24": (0.4, 0.9, 1.8), "25-34": (0.5, 1.0, 1.6), "35-44": (0.7, 1.1, 1.3),
    "45-54": (1.0, 1.1, 1.0), "55-64": (1.4, 1.0, 0.7), "65-74": (1.8, 0.9, 0.5),
    "75+": (2.2, 0.8, 0.3),
}

FIN_LIT_BASE = {"low": 0.34, "medium": 0.42, "high": 0.24}
FIN_LIT_INCOME_MULT = {
    "<30k": (1.5, 1.0, 0.5), "30-60k": (1.2, 1.1, 0.7), "60-100k": (0.9, 1.1, 1.0),
    "100-250k": (0.6, 1.0, 1.5), "250k-1M": (0.4, 0.9, 2.0), "1M+": (0.3, 0.8, 2.3),
}
FIN_LIT_AGE_MULT = {
    "18-24": (1.3, 1.0, 0.7), "25-34": (1.1, 1.0, 0.9), "35-44": (1.0, 1.0, 1.0),
    "45-54": (0.9, 1.0, 1.1), "55-64": (0.9, 1.0, 1.1), "65-74": (1.0, 1.0, 1.0),
    "75+": (1.2, 1.0, 0.8),
}

TRUST_BASE = {"skeptical": 0.35, "neutral": 0.40, "trusting": 0.25}
TRUST_AGE_MULT = {
    "18-24": (0.7, 1.0, 1.4), "25-34": (0.8, 1.0, 1.3), "35-44": (1.0, 1.0, 1.0),
    "45-54": (1.1, 1.0, 0.9), "55-64": (1.3, 1.0, 0.7), "65-74": (1.5, 0.9, 0.6),
    "75+": (1.7, 0.8, 0.5),
}
TRUST_INCOME_MULT = {
    "<30k": (1.3, 1.0, 0.8), "30-60k": (1.1, 1.0, 0.9), "60-100k": (1.0, 1.0, 1.0),
    "100-250k": (0.9, 1.0, 1.1), "250k-1M": (1.1, 0.9, 1.0), "1M+": (1.2, 0.8, 1.0),
}

DEVICE_BASE = {
    "mobile-focused": 0.25, "mobile-distracted": 0.20, "desktop-focused": 0.25,
    "desktop-multitasking": 0.20, "tablet-casual": 0.10,
}
DEVICE_AGE_MULT = {
    "18-24": (1.6, 1.6, 0.5, 0.6, 0.9), "25-34": (1.4, 1.3, 0.7, 0.8, 0.9),
    "35-44": (1.1, 1.1, 0.9, 1.0, 1.0), "45-54": (0.9, 0.9, 1.1, 1.1, 1.0),
    "55-64": (0.8, 0.7, 1.3, 1.1, 1.1), "65-74": (0.6, 0.5, 1.4, 1.0, 1.3),
    "75+": (0.5, 0.4, 1.3, 0.8, 1.5),
}

PLATFORM_ROLE_BASE = [
    ("consumer", 0.68), ("business owner / service provider", 0.22),
    ("both / curious visitor", 0.10),
]

INCOME_TIER = {
    "<30k": "low", "30-60k": "low", "60-100k": "mid", "100-250k": "mid",
    "250k-1M": "high", "1M+": "high",
}


def weighted_choice(rng, items):
    labels = [i[0] for i in items]
    weights = [i[1] for i in items]
    return rng.choices(labels, weights=weights, k=1)[0]


def weighted_choice_dict(rng, base: dict, *mults):
    labels = list(base.keys())
    weights = list(base.values())
    for mult in mults:
        weights = [w * m for w, m in zip(weights, mult)]
    return rng.choices(labels, weights=weights, k=1)[0]


def derive_archetype_cluster(p):
    tech, trust, patience = p["tech_comfort"], p["trust_in_platforms"], p["patience"]
    fin_lit, role, age, occ = p["financial_literacy"], p["platform_role"], p["age_bracket"], p["occupation_archetype"]
    tier = INCOME_TIER[p["income_bracket"]]
    is_business = role.startswith("business")
    is_curious = role.startswith("both")

    if trust == "skeptical" and tech == "low" and tier == "low":
        return "Skeptical Low-Tech Consumer"
    if is_business and patience == "low":
        return "Busy Small-Business Owner"
    if tier == "high" and trust == "trusting" and tech == "high":
        return "Affluent Early Adopter"
    if tech == "low" and age in ("65-74", "75+"):
        return "Low-Tech Older Adult"
    if "gig worker" in occ and not is_business and not is_curious:
        return "Gig Worker Optimizing Score"
    if trust == "skeptical" and tier == "high":
        return "Skeptical High-Net-Worth Individual"
    if patience == "low" and tech == "high" and not is_business and not is_curious:
        return "Impatient Power User"
    if trust == "trusting" and fin_lit == "low":
        return "Trusting Financially-Inexperienced Consumer"
    if is_curious:
        return "Curious Undecided Visitor"
    if tier == "mid" and tech == "medium" and trust == "neutral":
        return "Mainstream Middle-Class Consumer"

    role_word = "Business" if is_business else "Consumer"
    return f"{trust.title()} {tech.title()}-Tech {tier.title()}-Income {role_word}"


def make_persona(rng, idx):
    age = weighted_choice(rng, AGE_BRACKETS)
    income = weighted_choice(rng, INCOME_BRACKETS)
    occupation = rng.choice(OCCUPATION_BY_INCOME[income])
    patience = weighted_choice(rng, PATIENCE_BASE)

    tech_comfort = weighted_choice_dict(rng, TECH_COMFORT_BASE, TECH_COMFORT_AGE_MULT[age])
    financial_literacy = weighted_choice_dict(
        rng, FIN_LIT_BASE, FIN_LIT_INCOME_MULT[income], FIN_LIT_AGE_MULT[age]
    )
    trust_in_platforms = weighted_choice_dict(
        rng, TRUST_BASE, TRUST_AGE_MULT[age], TRUST_INCOME_MULT[income]
    )
    device_context = weighted_choice_dict(rng, DEVICE_BASE, DEVICE_AGE_MULT[age])

    role_items = list(PLATFORM_ROLE_BASE)
    if "business owner" in occupation or "landlord" in occupation or "investor" in occupation:
        role_items = [
            ("consumer", 0.68 * 0.6),
            ("business owner / service provider", 0.22 * 2.5),
            ("both / curious visitor", 0.10 * 1.3),
        ]
    platform_role = weighted_choice(rng, role_items)

    persona = {
        "id": f"p{idx:04d}",
        "age_bracket": age,
        "income_bracket": income,
        "occupation_archetype": occupation,
        "financial_literacy": financial_literacy,
        "tech_comfort": tech_comfort,
        "patience": patience,
        "trust_in_platforms": trust_in_platforms,
        "device_context": device_context,
        "platform_role": platform_role,
    }
    persona["archetype_cluster"] = derive_archetype_cluster(persona)
    return persona


def main():
    rng = random.Random(SEED)
    personas = [make_persona(rng, i) for i in range(1, N_PERSONAS + 1)]

    scaffold_path = HERE / "scaffold.jsonl"
    with scaffold_path.open("w") as f:
        for p in personas:
            f.write(json.dumps(p) + "\n")

    BATCHES_DIR.mkdir(exist_ok=True)
    for start in range(0, len(personas), BATCH_SIZE):
        batch = personas[start:start + BATCH_SIZE]
        batch_num = start // BATCH_SIZE + 1
        out_path = BATCHES_DIR / f"scaffold-{batch_num:02d}.json"
        with out_path.open("w") as f:
            json.dump(batch, f, indent=2)

    # Summary for sanity-checking distributions
    from collections import Counter
    print(f"Generated {len(personas)} personas -> {scaffold_path}")
    print(f"Chunked into {(len(personas) + BATCH_SIZE - 1) // BATCH_SIZE} batches of {BATCH_SIZE} -> {BATCHES_DIR}/")
    for field in ["age_bracket", "income_bracket", "tech_comfort", "financial_literacy",
                  "trust_in_platforms", "platform_role", "archetype_cluster"]:
        counts = Counter(p[field] for p in personas)
        print(f"\n{field}:")
        for label, count in counts.most_common():
            print(f"  {label:45s} {count:4d}  ({count/len(personas)*100:.1f}%)")


if __name__ == "__main__":
    main()
