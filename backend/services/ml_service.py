from typing import Dict


def compute_health_score(nutriments: Dict[str, float]) -> float:
    """
    Compute a simple health score (0–100) based on key nutriments.

    This is a rule-based baseline that we will later replace/augment
    with proper ML models trained on labeled data.
    """
    sugar = float(nutriments.get("sugar_100g", 0.0))
    fat = float(nutriments.get("fat_100g", 0.0))
    salt = float(nutriments.get("salt_100g", 0.0))
    fiber = float(nutriments.get("fiber_100g", 0.0))
    additives = float(nutriments.get("additives_count", 0.0))
    energy = float(nutriments.get("energy_kcal", 0.0))

    # Start from a perfect score and subtract penalties.
    score = 100.0

    # Penalize high sugar, fat, salt, energy and many additives.
    score -= min(sugar * 1.2, 40.0)
    score -= min(fat * 0.8, 25.0)
    score -= min(salt * 10.0, 20.0)
    score -= min(energy / 20.0, 15.0)
    score -= min(additives * 2.0, 10.0)

    # Reward dietary fiber.
    score += min(fiber * 1.5, 15.0)

    # Clamp to [0, 100].
    score = max(0.0, min(100.0, score))
    return round(score, 2)


def predict_disease_risks(nutriments: Dict[str, float]) -> Dict[str, Dict[str, float]]:
    """
    Predict simple disease risk scores (0–1) from nutriments and add a
    confidence score per disease.

    Returns a mapping like:
    {
        "diabetes": {"risk": 0.7, "confidence": 0.8},
        ...
    }

    This is a hand-crafted baseline proxy for ML behaviour: later we will
    swap this for a trained multi-label classifier with calibrated
    probabilities and confidences.
    """
    sugar = float(nutriments.get("sugar_100g", 0.0))
    fat = float(nutriments.get("fat_100g", 0.0))
    salt = float(nutriments.get("salt_100g", 0.0))
    energy = float(nutriments.get("energy_kcal", 0.0))
    additives = float(nutriments.get("additives_count", 0.0))

    def sigmoid_like(x: float, scale: float = 10.0) -> float:
        # Simple squashing function into [0, 1] without importing extra libs.
        return max(0.0, min(1.0, x / scale))

    raw_risks = {
        "diabetes": sigmoid_like(sugar / 5.0 + energy / 200.0),
        "heart_disease": sigmoid_like(fat / 5.0 + salt * 2.0 + additives / 2.0),
        "obesity": sigmoid_like(energy / 150.0 + sugar / 5.0 + fat / 5.0),
        "hypertension": sigmoid_like(salt * 3.0 + energy / 250.0),
    }

    # Normalize risks so that the maximum disease risk is 1.0. This preserves
    # relative ordering while making the scale easier to interpret.
    max_risk = max(raw_risks.values()) or 1.0
    normalized_risks = {k: round(v / max_risk, 3) for k, v in raw_risks.items()}

    def confidence_from_risk(r: float) -> float:
        """
        Heuristic confidence: higher when the risk is very low or very high,
        lower in the middle range where the model is more uncertain.
        """
        return round(0.6 + abs(r - 0.5) * 0.8, 3)

    return {
        disease: {
            "risk": risk,
            "confidence": confidence_from_risk(risk),
        }
        for disease, risk in normalized_risks.items()
    }

