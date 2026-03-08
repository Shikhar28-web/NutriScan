from typing import Dict, List

# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _graded_risk(value: float, low: float, high: float) -> float:
    """
    Linear ramp: 0.0 at (or below) `low`, 1.0 at (or above) `high`.

    Unlike the old min(x/scale, 1) approach this function will only reach 1.0
    when the nutriment value actually hits the `high` threshold, so genuinely
    safe products return genuinely low scores instead of being normalized up.
    """
    if value <= low:
        return 0.0
    if value >= high:
        return 1.0
    return (value - low) / (high - low)


def _weighted_avg(pairs: List[tuple]) -> float:
    """Weighted average of (value, weight) pairs, clamped to [0, 1]."""
    total_w = sum(w for _, w in pairs)
    if total_w == 0:
        return 0.0
    return max(0.0, min(1.0, sum(v * w for v, w in pairs) / total_w))


# ---------------------------------------------------------------------------
# Health score
# ---------------------------------------------------------------------------

def compute_health_score(nutriments: Dict[str, float]) -> float:
    """
    Compute a health score (0–100) based on seven key nutriments.

    HOW IT IS CALCULATED
    --------------------
    Starting from 100 the algorithm subtracts evidence-based penalties and
    adds a fibre bonus.  Every penalty uses a *graded* (linear ramp) function
    that only reaches its maximum deduction when the nutriment hits a clearly
    unsafe level — so a plain rice cracker with low sugar, fat and salt will
    score in the 80-90s, not an artificially inflated 100.

    Penalty caps are calibrated to UK FSA traffic-light labelling, WHO and
    NHS dietary guidelines (per 100 g of product):

    | Nutriment  | "low" threshold  | "high" threshold         | Max deduction |
    |------------|-----------------|--------------------------|---------------|
    | Sugar      |  5 g  (FSA low) |  22.5 g  (FSA high)      | −35 pts       |
    | Fat        |  3 g  (FSA low) |  17.5 g  (FSA high)      | −20 pts       |
    | Salt       |  0.3 g (FSA low)|   1.5 g  (FSA high)      | −20 pts       |
    | Energy     | 100 kcal(FSA low)| 450 kcal (FSA high)     | −15 pts       |
    | Additives  |  0              |   8 additives            | −10 pts       |
    | NOVA group | 1 (whole food)  |  4 (ultra-processed)     | −30 pts       |
    | Fibre      |  0 g            |   6 g  (FSA high-fibre)  | +15 pts       |

    NOVA penalty: UN IARC/PAHO NOVA classification — ultra-processed foods
    (NOVA 4) are independently associated with obesity, T2DM, CVD, and
    all-cause mortality regardless of individual nutrient values.
    NOVA 4 = −30 pts, NOVA 3 = −10 pts, NOVA 2 = −3 pts, NOVA 1 = 0 pts.

    Sources: UK FSA 2016 colour-coded nutrient thresholds; WHO salt/sugar
    guidelines 2023; NHS Eatwell Guide 2024; Monteiro et al. NOVA 2019.
    Final score is clamped to [0, 100].
    """
    sugar    = float(nutriments.get("sugar_100g",     0.0))
    fat      = float(nutriments.get("fat_100g",       0.0))
    salt     = float(nutriments.get("salt_100g",      0.0))
    fiber    = float(nutriments.get("fiber_100g",     0.0))
    additives = float(nutriments.get("additives_count", 0.0))
    energy   = float(nutriments.get("energy_kcal",    0.0))
    nova_raw = float(nutriments.get("nova_group",     0.0))

    score = 100.0
    # Thresholds: (low=green/safe, high=red/max-risk)
    score -= _graded_risk(sugar,      5.0,   22.5) * 35.0   # FSA: low≤5g, high>22.5g
    score -= _graded_risk(fat,        3.0,   17.5) * 20.0   # FSA: low≤3g, high>17.5g
    score -= _graded_risk(salt,       0.3,    1.5) * 20.0   # FSA: low≤0.3g, high>1.5g
    score -= _graded_risk(energy,   100.0,  450.0) * 15.0   # FSA: low≤100kcal, high>450kcal
    score -= _graded_risk(additives,  0.0,    8.0) * 10.0
    score += _graded_risk(fiber,      0.0,    6.0) * 15.0   # FSA: high-fibre≥6g

    # NOVA ultra-processing penalty (independent of nutrient content)
    _nova_penalty = {4: 30.0, 3: 10.0, 2: 3.0, 1: 0.0}
    score -= _nova_penalty.get(int(nova_raw) if nova_raw in (1.0, 2.0, 3.0, 4.0) else 0, 0.0)

    return round(max(0.0, min(100.0, score)), 2)


# ---------------------------------------------------------------------------
# Disease risk prediction
# ---------------------------------------------------------------------------

def predict_disease_risks(nutriments: Dict[str, float]) -> Dict[str, Dict[str, float]]:
    """
    Predict disease risk scores (0–1) from nutriments.

    KEY FIX vs previous version
    ---------------------------
    The old code divided every risk by the maximum risk, which forced at least
    one disease to always score 1.0 — even for healthy products.  This version
    uses absolute, evidence-based thresholds so a genuinely healthy product
    returns genuinely low risk values across the board.

    Risk drivers (per 100 g):
      diabetes      — sugar (primary), energy, ultra-processing (additives)
      heart_disease — saturated fat, salt, additives
      obesity       — energy density, sugar, total fat
      hypertension  — salt (primary), energy, additives

    Dietary fibre is protective and dampens risk slightly for all conditions.
    Confidence reflects how far the score sits from the uncertain mid-range
    (0.5): scores near 0 or near 1 are more confidently assessed.
    """
    sugar    = float(nutriments.get("sugar_100g",         0.0))
    fat      = float(nutriments.get("fat_100g",           0.0))
    # Use provided sat-fat; fall back to 40 % of total fat if absent.
    sat_fat  = float(nutriments.get("saturated_fat_100g", fat * 0.4))
    salt     = float(nutriments.get("salt_100g",          0.0))
    energy   = float(nutriments.get("energy_kcal",        0.0))
    additives = float(nutriments.get("additives_count",   0.0))
    fiber    = float(nutriments.get("fiber_100g",         0.0))

    # Fibre protection: up to 15 % absolute dampening for fiber-rich foods.
    fiber_protect = _graded_risk(fiber, 0.0, 10.0) * 0.15

    # Thresholds grounded in FSA traffic-light / WHO / AHA / EFSA guidelines.
    # Sugar: FSA low=5g, high=22.5g (per 100g)
    # Sat-fat: FSA low=1.5g, FSA high=5g (per 100g)
    # Salt: FSA low=0.3g, FSA high=1.5g (per 100g)
    # Energy: FSA low=100kcal, FSA high=450kcal (per 100g)
    diabetes = _weighted_avg([
        (_graded_risk(sugar,     5.0,  22.5), 0.55),  # FSA sugar thresholds
        (_graded_risk(energy,  100.0, 450.0), 0.30),  # FSA energy thresholds
        (_graded_risk(additives, 2.0,   8.0), 0.15),
    ])
    diabetes = max(0.0, diabetes - fiber_protect)

    heart_disease = _weighted_avg([
        (_graded_risk(sat_fat,   1.5,   5.0), 0.40),  # FSA: low≤1.5g, high>5g
        (_graded_risk(salt,      0.3,   1.5), 0.35),  # FSA: low≤0.3g, high>1.5g
        (_graded_risk(additives, 2.0,   8.0), 0.25),
    ])
    heart_disease = max(0.0, heart_disease - fiber_protect * 0.5)

    obesity = _weighted_avg([
        (_graded_risk(energy,  100.0, 450.0), 0.45),  # FSA energy thresholds
        (_graded_risk(sugar,    5.0,  22.5), 0.30),   # FSA sugar thresholds
        (_graded_risk(fat,      3.0,  17.5), 0.25),   # FSA fat thresholds
    ])
    obesity = max(0.0, obesity - fiber_protect * 0.7)

    hypertension = _weighted_avg([
        (_graded_risk(salt,      0.3,   1.5), 0.65),  # FSA: low≤0.3g, high>1.5g
        (_graded_risk(energy,  100.0, 450.0), 0.20),
        (_graded_risk(additives, 2.0,   8.0), 0.15),
    ])

    risks = {
        "diabetes":     round(diabetes,     3),
        "heart_disease": round(heart_disease, 3),
        "obesity":      round(obesity,       3),
        "hypertension": round(hypertension,  3),
    }

    def confidence(r: float) -> float:
        # Min 0.55 (most uncertain, r≈0.5), max 0.95 (very certain, r≈0 or 1).
        return round(min(0.95, 0.55 + abs(r - 0.5) * 0.80), 3)

    return {
        disease: {"risk": risk, "confidence": confidence(risk)}
        for disease, risk in risks.items()
    }


# ---------------------------------------------------------------------------
# Processing level (NOVA classification)
# ---------------------------------------------------------------------------

# NOVA labels and health implications
_NOVA_META = {
    1: {
        "label":       "NOVA 1 — Unprocessed / Minimally Processed",
        "description": "Whole or minimally processed foods (e.g., fresh fruit, plain meat, eggs, milk). "
                       "No added substances; closest to their natural state.",
        "health_note": "Strongly recommended as the dietary foundation.",
    },
    2: {
        "label":       "NOVA 2 — Processed Culinary Ingredients",
        "description": "Substances extracted from whole foods or nature (e.g., oils, butter, sugar, salt). "
                       "Used in cooking, not typically eaten alone.",
        "health_note": "Fine in moderation when used to prepare NOVA 1 foods.",
    },
    3: {
        "label":       "NOVA 3 — Processed Foods",
        "description": "Products made by adding salt, sugar, oil or vinegar to NOVA 1/2 foods "
                       "(e.g., canned vegetables, cheese, cured meats, simple breads).",
        "health_note": "Acceptable in moderation; watch sodium and added-sugar content.",
    },
    4: {
        "label":       "NOVA 4 — Ultra-Processed Foods",
        "description": "Industrial formulations containing little or no whole food and many additives "
                       "(e.g., soft drinks, packaged snacks, instant noodles, reconstituted meat products).",
        "health_note": "Limit consumption. Strong evidence links high NOVA-4 intake to obesity, "
                       "type-2 diabetes, cardiovascular disease, and all-cause mortality.",
    },
}


def compute_processing_level(
    nutriments: Dict[str, float],
    ingredients_text: str = "",
) -> Dict[str, str]:
    """
    Determine the NOVA food processing group (1–4) for a product.

    Priority:
      1. Use the ``nova_group`` value fetched directly from OpenFoodFacts if
         it is present (most accurate — manually verified by the OFF community).
      2. Otherwise infer the group heuristically from additive count and
         common ultra-processed ingredient markers in the ingredients text.

    Returns a dict with:
      - ``nova_group``   : int-as-string, "1"–"4" (or "unknown")
      - ``label``        : human-readable NOVA tier name
      - ``description``  : what the tier means
      - ``health_note``  : brief evidence-based guidance
      - ``source``       : "openfoodfacts" | "inferred" | "unknown"
    """
    # --- 1. Trust the OFF-sourced value when available ---
    nova_raw = nutriments.get("nova_group", 0.0)
    if nova_raw in (1.0, 2.0, 3.0, 4.0):
        group = int(nova_raw)
        meta = _NOVA_META[group]
        return {
            "nova_group":  str(group),
            "label":       meta["label"],
            "description": meta["description"],
            "health_note": meta["health_note"],
            "source":      "openfoodfacts",
        }

    # --- 2. Heuristic inference ---
    additives = float(nutriments.get("additives_count", 0.0))
    text = (ingredients_text or "").lower()

    # Markers strongly associated with NOVA 4 ultra-processing
    nova4_markers = [
        "high fructose corn syrup", "hydrogenated", "partially hydrogenated",
        "modified starch", "modified corn starch", "maltodextrin", "dextrose",
        "artificial flavour", "artificial flavor", "artificial colour", "artificial color",
        "sodium nitrite", "sodium benzoate", "potassium sorbate", "acesulfame",
        "aspartame", "sucralose", "saccharin", "carrageenan", "xanthan gum",
        "monosodium glutamate", "msg", "disodium",
    ]
    nova4_hits = sum(1 for m in nova4_markers if m in text)

    if additives >= 5 or nova4_hits >= 2:
        group = 4
    elif additives >= 2 or nova4_hits == 1:
        group = 3
    elif additives >= 1:
        group = 3
    else:
        # No additives and no ultra-processed markers → minimally processed
        group = 1

    meta = _NOVA_META[group]
    return {
        "nova_group":  str(group),
        "label":       meta["label"],
        "description": meta["description"],
        "health_note": meta["health_note"],
        "source":      "inferred",
    }


# ---------------------------------------------------------------------------
# Age-group impact analysis
# ---------------------------------------------------------------------------

# Per-age-group thresholds for sugar, salt, additives, energy (per 100 g).
# Derived from WHO / NHS / EFSA guidelines for each life-stage.
_AGE_GROUP_THRESHOLDS = {
    # Thresholds represent the per-100g concentration at which a product
    # starts to raise concern for that life-stage, derived from:
    #   WHO 2023 sugar/salt guidelines, NHS Eatwell Guide 2024,
    #   EFSA 2019 dietary reference values, FSA traffic-light labelling.
    "infant": {
        "label":          "Infant (0–2 years)",
        # WHO/NHS: NO added sugar recommended for <2 yr
        "sugar_high":     1.0,
        # NHS: max 1 g salt/day for <1 yr, 2 g for 1–3 yr
        "salt_high":      0.10,
        # Any E-number additive is a concern for infants
        "additives_high": 1.0,
        # Lower energy density appropriate for small portion sizes
        "energy_high":    150.0,
    },
    "child": {
        "label":          "Child (3–12 years)",
        # NHS: max 19 g free sugar/day (4–6 yr), 24 g (7–10 yr).
        # 10 g/100g means a 100g serving = ~40–50 % of daily limit.
        "sugar_high":     10.0,
        # NHS: 3–5 g salt/day for children. 0.5 g/100g = ~10–17 % of daily limit.
        "salt_high":      0.50,
        "additives_high": 3.0,
        "energy_high":    300.0,
    },
    "young_adult": {
        "label":          "Young Adult (13–35 years)",
        # WHO: free sugars <10 % energy (~50 g/day). 18 g/100g is a reasonable flag.
        "sugar_high":     18.0,
        # FSA "high" salt threshold: >1.5 g/100g
        "salt_high":      1.50,
        "additives_high": 5.0,
        "energy_high":    450.0,  # FSA "high" energy threshold
    },
    "adult": {
        "label":          "Adult (36–60 years)",
        # Stricter than young adult — metabolic risk rises with age.
        # WHO strict target: free sugars <5 % energy (~25 g/day).
        "sugar_high":     12.0,
        # WHO: 5 g salt/day total. 1.2 g/100g = 24 % of daily limit per 100g.
        "salt_high":      1.20,
        "additives_high": 4.0,
        "energy_high":    400.0,
    },
    "elderly": {
        "label":          "Elderly (60+ years)",
        # Reduced glucose tolerance; stricter sugar threshold.
        "sugar_high":     8.0,
        # Declining kidney function + higher hypertension prevalence.
        # Many geriatric guidelines target <5 g salt/day (lower than adults).
        # 0.8 g/100g = 16 % of a 5 g/day limit per 100g serving.
        "salt_high":      0.80,
        "additives_high": 3.0,
        "energy_high":    300.0,  # Lower energy needs with reduced BMR
    },
}


def compute_age_group_impacts(
    nutriments: Dict[str, float],
) -> Dict[str, Dict[str, str]]:
    """
    Assess how risky a food product is for each age group.

    Returns a dict keyed by age-group slug with:
      - "label"      : human-readable group name
      - "risk_level" : "low" | "moderate" | "high" | "very_high"
      - "notes"      : pipe-separated concern strings
    """
    sugar     = float(nutriments.get("sugar_100g",       0.0))
    salt      = float(nutriments.get("salt_100g",        0.0))
    energy    = float(nutriments.get("energy_kcal",      0.0))
    additives = float(nutriments.get("additives_count",  0.0))

    result: Dict[str, Dict[str, str]] = {}

    for group_key, t in _AGE_GROUP_THRESHOLDS.items():
        concerns: List[str] = []
        risk_score = 0

        if sugar > t["sugar_high"] * 1.5:
            concerns.append(
                f"Very high sugar ({sugar:.1f} g/100g) — risk of tooth decay and blood-sugar spikes."
            )
            risk_score += 2
        elif sugar > t["sugar_high"]:
            concerns.append(f"Elevated sugar ({sugar:.1f} g/100g) — limit total daily intake.")
            risk_score += 1

        if salt > t["salt_high"] * 1.5:
            concerns.append(
                f"Very high salt ({salt:.2f} g/100g) — significant concern for {t['label']}."
            )
            risk_score += 2
        elif salt > t["salt_high"]:
            concerns.append(f"Elevated salt ({salt:.2f} g/100g) — monitor total daily intake.")
            risk_score += 1

        if additives > t["additives_high"] * 1.5:
            concerns.append(
                f"High additive count ({int(additives)}) — ultra-processed; avoid for {t['label']}."
            )
            risk_score += 2
        elif additives > t["additives_high"]:
            concerns.append(f"Moderate additives ({int(additives)}) — occasional consumption only.")
            risk_score += 1

        if energy > t["energy_high"]:
            concerns.append(f"Energy-dense ({energy:.0f} kcal/100g) — watch portion size.")
            risk_score += 1

        if not concerns:
            concerns.append("No major concerns for this age group at moderate consumption.")

        if risk_score <= 0:
            level = "low"
        elif risk_score <= 2:
            level = "moderate"
        elif risk_score <= 3:
            level = "high"
        else:
            level = "very_high"

        result[group_key] = {
            "label":      t["label"],
            "risk_level": level,
            "notes":      " | ".join(concerns),
        }

    return result


# ---------------------------------------------------------------------------
# Consumption disclaimer
# ---------------------------------------------------------------------------

def compute_consumption_disclaimer(
    nutriments: Dict[str, float],
    health_score: float,
) -> Dict[str, str]:
    """
    Generate evidence-based consumption frequency guidance and specific
    nutriment warnings.

    Frequency tiers are calibrated against WHO / NOVA dietary guidelines:
      ≥75  → daily (nutrient-dense, whole foods)
      55–74 → 3–4 × / week (moderately processed)
      35–54 → 1–2 × / week (high sugar / fat / salt)
      <35  → 1–2 × / month (ultra-processed or very energy-dense)
    """
    sugar   = float(nutriments.get("sugar_100g",         0.0))
    salt    = float(nutriments.get("salt_100g",          0.0))
    energy  = float(nutriments.get("energy_kcal",        0.0))
    fat     = float(nutriments.get("fat_100g",           0.0))
    sat_fat = float(nutriments.get("saturated_fat_100g", fat * 0.4))
    additives = float(nutriments.get("additives_count",  0.0))

    nova_raw = float(nutriments.get("nova_group", 0.0))
    nova_group = int(nova_raw) if nova_raw in (1.0, 2.0, 3.0, 4.0) else 0

    if health_score >= 75:
        frequency = "Daily"
        general   = (
            "Good nutritional profile — can be consumed daily as part of a balanced diet."
        )
    elif health_score >= 55:
        frequency = "3–4 times per week"
        general   = (
            "Moderate nutritional profile — suitable 3–4 times per week; "
            "pair with whole foods, fruits, and vegetables."
        )
    elif health_score >= 35:
        frequency = "1–2 times per week"
        general   = (
            "Below-average nutritional profile — limit to 1–2 times per week "
            "and keep other meals nutrient-dense."
        )
    else:
        frequency = "1–2 times per month"
        general   = (
            "Poor nutritional profile — treat as an occasional indulgence. "
            "Limit to 1–2 times per month and keep portions small."
        )

    # NOVA 4 hard cap: ultra-processed foods should never be recommended "Daily"
    # regardless of other nutrient metrics (e.g. beverages with low fat/salt).
    if nova_group == 4 and frequency == "Daily":
        frequency = "1–2 times per week"
        general   = (
            "Ultra-processed (NOVA 4) — limit to 1–2 times per week. "
            "Strong evidence links high NOVA-4 intake to obesity, type-2 diabetes, "
            "and cardiovascular disease, independent of individual nutrient values."
        )
    elif nova_group == 4 and "3–4" in frequency:
        frequency = "1–2 times per week"
        general   = (
            "Ultra-processed (NOVA 4) — limit to 1–2 times per week despite "
            "moderate individual nutrient values."
        )

    warnings: List[str] = []
    # Warning thresholds aligned with FSA traffic-light "red" category:
    #   sugar >22.5 g/100g, fat >17.5 g/100g, sat-fat >5 g/100g,
    #   salt >1.5 g/100g, energy >450 kcal/100g.
    # We warn slightly earlier (at FSA "amber/medium" boundary) to be proactive.
    if sugar > 22.5:
        warnings.append(
            f"Sugar {sugar:.1f} g/100g is FSA HIGH (>22.5 g). "
            f"WHO recommends free sugars below 50 g/day — "
            f"a 100g serving provides {sugar/50*100:.0f}% of that."
        )
    elif sugar > 5.0:
        warnings.append(
            f"Sugar {sugar:.1f} g/100g is FSA MEDIUM (5–22.5 g). "
            "Moderate your total daily intake from all sources."
        )
    if salt > 1.5:
        warnings.append(
            f"Salt {salt:.2f} g/100g is FSA HIGH (>1.5 g). "
            f"WHO limit is 5 g salt/day — a 100g serving provides {salt/5*100:.0f}% of that."
        )
    elif salt > 0.3:
        warnings.append(
            f"Salt {salt:.2f} g/100g is FSA MEDIUM (0.3–1.5 g). "
            "Monitor total daily salt across all meals."
        )
    if energy > 450:
        warnings.append(
            f"Energy-dense at {energy:.0f} kcal/100g (FSA HIGH >450 kcal) — "
            "control portion size carefully."
        )
    elif energy > 150:
        warnings.append(
            f"Energy {energy:.0f} kcal/100g (FSA MEDIUM 100–450 kcal) — "
            "be mindful of portion size."
        )
    if sat_fat > 5.0:
        warnings.append(
            f"Saturated fat {sat_fat:.1f} g/100g is FSA HIGH (>5 g) — "
            "high saturated fat is a primary driver of cardiovascular disease risk."
        )
    elif sat_fat > 1.5:
        warnings.append(
            f"Saturated fat {sat_fat:.1f} g/100g is FSA MEDIUM (1.5–5 g) — "
            "limit total saturated fat across all meals."
        )
    if fat > 17.5:
        warnings.append(
            f"Total fat {fat:.1f} g/100g is FSA HIGH (>17.5 g) — "
            "watch cumulative fat intake across all meals."
        )
    if additives >= 5:
        warnings.append(
            f"{int(additives)} additives detected — frequent consumption of ultra-processed "
            "foods is associated with adverse long-term health outcomes."
        )

    return {
        "recommended_frequency": frequency,
        "general_guidance":      general,
        "specific_warnings":     " | ".join(warnings) if warnings else "No specific warnings.",
        "disclaimer": (
            "⚠️ This guidance is derived from nutritional data per 100 g and is for "
            "informational purposes only. It is NOT a substitute for professional medical "
            "or dietary advice. Individual needs vary based on age, health status, activity "
            "level, and overall diet. Consult a registered dietitian for personalised "
            "recommendations."
        ),
    }

