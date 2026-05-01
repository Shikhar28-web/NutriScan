import asyncio
import json
import re
from typing import Dict, Optional

import google.generativeai as genai

from ..config import get_settings


_resolved_model_name: Optional[str] = None


def _build_rule_based_ingredient_analysis(
    ingredients_text: str,
    nutriments: Dict[str, float],
    health_score: float,
    disease_risks: Dict[str, float],
    age_group_impacts: Dict[str, Dict[str, str]],
    processing_level: Dict[str, str],
) -> str:
    sugar = float(nutriments.get("sugar_100g", 0.0) or 0.0)
    fat = float(nutriments.get("fat_100g", 0.0) or 0.0)
    sat_fat = float(nutriments.get("saturated_fat_100g", 0.0) or 0.0)
    salt = float(nutriments.get("salt_100g", 0.0) or 0.0)
    fiber = float(nutriments.get("fiber_100g", 0.0) or 0.0)
    protein = float(nutriments.get("proteins_100g", 0.0) or 0.0)
    kcal = float(nutriments.get("energy_kcal", 0.0) or 0.0)
    additives = float(nutriments.get("additives_count", 0.0) or 0.0)

    def _f(v: float) -> str:
        return f"{v:.1f}"

    pros: list[str] = []
    cons: list[str] = []
    careful: list[str] = []

    if fiber >= 6:
        pros.append(f"Good fiber density ({_f(fiber)} g/100 g), which can support satiety and glycemic control.")
    elif fiber >= 3:
        pros.append(f"Moderate fiber content ({_f(fiber)} g/100 g) offers some protective benefit.")
    else:
        cons.append(f"Low fiber ({_f(fiber)} g/100 g), so this food may be less filling and less metabolically protective.")

    if protein >= 10:
        pros.append(f"Useful protein contribution ({_f(protein)} g/100 g) for satiety and balanced meals.")

    if sugar > 22.5:
        cons.append(f"High sugar by traffic-light standards ({_f(sugar)} g/100 g; high > 22.5 g).")
        careful.append("People with diabetes, insulin resistance, or weight-management goals should limit portion size.")
    elif sugar > 5:
        cons.append(f"Moderate sugar density ({_f(sugar)} g/100 g); frequent intake can increase total free sugar load.")

    if salt > 1.5:
        cons.append(f"High salt by traffic-light standards ({_f(salt)} g/100 g; high > 1.5 g).")
        careful.append("People with hypertension or cardiovascular risk should keep this occasional.")
    elif salt > 0.3:
        cons.append(f"Moderate salt ({_f(salt)} g/100 g); check total daily sodium from other foods.")

    if sat_fat > 5:
        cons.append(f"High saturated fat ({_f(sat_fat)} g/100 g; high > 5 g), which can raise cardiometabolic risk if frequent.")
    elif sat_fat > 1.5:
        cons.append(f"Moderate saturated fat ({_f(sat_fat)} g/100 g); pair with lower-saturated-fat foods.")

    if fat > 17.5:
        cons.append(f"High total fat ({_f(fat)} g/100 g; high > 17.5 g), increasing energy density.")

    if kcal > 450:
        cons.append(f"High energy density ({_f(kcal)} kcal/100 g), making overconsumption easier.")

    if additives >= 5:
        cons.append(f"Higher additive load detected ({_f(additives)} additives), consistent with a more processed profile.")
    elif additives <= 1:
        pros.append("Low additive count, suggesting a cleaner ingredient profile.")

    if not pros:
        pros.append("No strong protective nutrition markers were detected beyond baseline macronutrients.")
    if not cons:
        cons.append("No major red-flag nutrient threshold was exceeded in the available data.")

    disease_bits = []
    for key, value in disease_risks.items():
        disease_bits.append(f"{key.replace('_', ' ')}: {round(float(value) * 100)}%")
    disease_line = ", ".join(disease_bits) if disease_bits else "not available"

    age_lines = []
    for item in age_group_impacts.values():
        label = item.get("label", "Unknown")
        risk = item.get("risk_level", "unknown")
        notes = item.get("notes", "")
        age_lines.append(f"- **{label}**: {risk.capitalize()}. {notes}")
    if not age_lines:
        age_lines.append("- Age-specific impact could not be derived from available metadata.")

    nova_group = processing_level.get("nova_group", "unknown")
    nova_label = processing_level.get("label", "Unknown")
    nova_desc = processing_level.get("description", "")

    return (
        "### Ingredient Pros\n"
        + "\n".join(f"- {line}" for line in pros)
        + "\n\n### Ingredient Cons\n"
        + "\n".join(f"- {line}" for line in cons)
        + "\n\n### Processing Level\n"
        + f"- {nova_label} (Group {nova_group}).\n"
        + (f"- {nova_desc}\n" if nova_desc else "")
        + "\n### Overall Summary\n"
        + f"- Health score: **{round(float(health_score), 2)}/100** based on the combined nutrient and processing profile.\n"
        + f"- Disease-risk indicators: {disease_line}.\n"
        + "- Interpretation is based on ingredient list context plus nutritional values per 100 g.\n"
        + "\n### Age Group Impacts\n"
        + "\n".join(age_lines)
        + "\n\n### Who Should Be Careful\n"
        + "\n".join(f"- {line}" for line in (careful or ["General population should use portion control for frequent intake."]))
        + "\n"
    )


def _build_ingredient_prompt(
    ingredients_text: str,
    nutriments: Dict[str, float],
    health_score: float,
    disease_risks: Dict[str, float],
    age_group_impacts: Dict[str, Dict[str, str]],
    processing_level: Dict[str, str],
) -> str:
    """
    Build a prompt for Gemini that explains pros/cons of ingredients,
    including age-group-specific impacts.

    The LLM is ONLY allowed to explain and summarize; it must not
    override the numeric scores from the ML models.
    """
    # Format age group impacts into a readable block for the prompt.
    age_group_lines = "\n".join(
        f"  - {v['label']}: risk={v['risk_level']} | {v['notes']}"
        for v in age_group_impacts.values()
    ) if age_group_impacts else "  - Not available."

    nova_summary = (
        f"NOVA {processing_level.get('nova_group', '?')} — "
        f"{processing_level.get('label', 'unknown')} "
        f"(source: {processing_level.get('source', 'unknown')})"
    ) if processing_level else "Not available."

    return f"""
You are a nutrition expert explaining packaged food ingredients.

RULES:
- DO NOT change or guess any numeric scores.
- Use the provided health_score, disease_risks, age_group_impacts, and processing_level as ground truth from ML models.
- Your job is ONLY to explain pros and cons of ingredients and give a brief summary.
- Focus on evidence-based, general guidance (no medical diagnosis).
- If ingredients are listed as "[Ingredient list not available in database]", base your analysis on ONLY the nutritional data provided (nutriments, health_score, disease_risks, processing_level, age_group_impacts). Still provide a full and useful analysis.
- ALWAYS answer in clear Markdown with the exact sections requested below.

Given:
- ingredients_text: {ingredients_text!r}
- nutriments (per 100g): {nutriments}
- ML health_score (0-100): {health_score}
- ML disease_risks (0-1): {disease_risks}
- ML processing_level: {nova_summary}
- ML age_group_impacts:
{age_group_lines}

Explain in this EXACT structure (Markdown, no extra sections, no introduction before the headings):

### Ingredient Pros
- One bullet per beneficial ingredient or positive aspect.
- Be specific (e.g., "Rice noodles provide complex carbohydrates for energy.")

### Ingredient Cons
- One bullet per risky ingredient or negative aspect.
- Mention if something is high in sugar, fat, salt, additives, or refined carbs.

### Processing Level
- State the NOVA group and what it means for this product.
- Mention any specific ultra-processed ingredients or additives found that contributed to the classification.

### Overall Summary
- 2-3 short sentences connecting the ingredients to:
  - health_score (0-100)
  - each disease_risk (diabetes, heart_disease, obesity, hypertension)
  - processing_level NOVA group

### Age Group Impacts
- One bullet per age group (Infant, Child, Young Adult, Adult, Elderly).
- Briefly explain why this product is more or less suitable for each group based on the ML age_group_impacts data above.

### Who Should Be Careful
- Short bullets calling out which specific groups (e.g., diabetics, hypertensive individuals, infants) should limit or avoid this product and why.
"""


async def explain_ingredients(
    ingredients_text: Optional[str],
    nutriments: Dict[str, float],
    health_score: float,
    disease_risks: Dict[str, float],
    age_group_impacts: Optional[Dict[str, Dict[str, str]]] = None,
    processing_level: Optional[Dict[str, str]] = None,
) -> str:
    """
    Use Gemini to generate a human-readable explanation of ingredient pros/cons.

    If the Gemini API key is not configured, returns a fallback explanation.
    """
    if not ingredients_text:
        # No ingredient list — still generate analysis from nutritional data only
        ingredients_text = "[Ingredient list not available in database]"

    settings = get_settings()
    if not settings.GEMINI_API_KEY:
        return _build_rule_based_ingredient_analysis(
            ingredients_text,
            nutriments,
            health_score,
            disease_risks,
            age_group_impacts or {},
            processing_level or {},
        )

    genai.configure(api_key=settings.GEMINI_API_KEY)

    global _resolved_model_name
    last_error: Optional[Exception] = None

    # Resolve a working model name once using list_models, then reuse it.
    if _resolved_model_name is None:
        try:
            available = genai.list_models()
            for m in available:
                # Prefer models that support generateContent.
                methods = getattr(m, "supported_generation_methods", []) or []
                if "generateContent" in methods:
                    _resolved_model_name = getattr(m, "name", None)
                    if _resolved_model_name:
                        break
        except Exception as e:  # noqa: BLE001
            last_error = e

    # Fallback candidates if list_models did not give us anything useful.
    candidate_models = [
        _resolved_model_name,
        settings.GEMINI_MODEL,
        "models/gemini-2.0-flash",
        "models/gemini-flash-latest",
        "models/gemini-2.0-flash-lite",
    ]

    prompt = _build_ingredient_prompt(
        ingredients_text, nutriments, health_score, disease_risks,
        age_group_impacts or {},
        processing_level or {},
    )
    # get_running_loop() is the correct API in Python 3.10+;
    # get_event_loop() is deprecated when a loop is already running.
    loop = asyncio.get_running_loop()

    for model_name in candidate_models:
        if not model_name:
            continue
        try:
            model = genai.GenerativeModel(model_name)
            response = await loop.run_in_executor(None, model.generate_content, prompt)
            text = getattr(response, "text", None) or str(response)
            # Cache the working model name for future calls.
            _resolved_model_name = model_name
            return text.strip()
        except Exception as e:  # noqa: BLE001
            last_error = e
            continue

    # If all attempts fail, return a clear message but never break the API.
    reason = f"{type(last_error).__name__}: {last_error}" if last_error else "UnknownError"
    fallback = _build_rule_based_ingredient_analysis(
        ingredients_text,
        nutriments,
        health_score,
        disease_risks,
        age_group_impacts or {},
        processing_level or {},
    )
    return f"{fallback}\n\n> Note: AI narrative model unavailable ({reason}). Showing deterministic nutrition analysis."


async def analyze_food_image(image_bytes: bytes, mime_type: str = "image/jpeg") -> dict:
    """
    Use Gemini Vision to analyze a food product image.

    The image can contain:
      - A barcode → returns {"type": "barcode", "value": "..."}
      - A nutrition/ingredients label → returns {"type": "nutrition", ...}
      - Neither → returns {"type": "unknown", "message": "..."}
      - On error → returns {"type": "error", "message": "..."}
    """
    settings = get_settings()
    if not settings.GEMINI_API_KEY:
        return {"type": "error", "message": "GEMINI_API_KEY is not configured. Cannot analyse images."}

    genai.configure(api_key=settings.GEMINI_API_KEY)

    prompt = (
        "Analyze this food product image carefully.\n"
        "Return ONLY valid JSON — no markdown, no code fences, no explanation.\n\n"
        "CASE 1 — If you can clearly read a barcode number (EAN/UPC digits):\n"
        '{"type":"barcode","value":"THE_BARCODE_DIGITS"}\n\n'
        "CASE 2 — If you see a nutrition facts panel or an ingredients list (no readable barcode):\n"
        '{"type":"nutrition","product_name":"name or null","brand":"brand or null",'
        '"ingredients_text":"full ingredient list as plain text or null",'
        '"nutriments":{"energy_kcal":0,"fat_100g":0,"saturated_fat_100g":0,'
        '"sugar_100g":0,"salt_100g":0,"fiber_100g":0}}\n\n'
        "CASE 3 — If the image is unclear or neither a barcode nor a food label:\n"
        '{"type":"unknown","message":"brief reason"}\n\n'
        "Respond with ONLY the JSON object."
    )

    loop = asyncio.get_running_loop()

    # Prefer 1.5-flash (fast + multimodal); fall back to other vision-capable models.
    candidate_models = [
        "models/gemini-2.0-flash",
        "models/gemini-flash-latest",
        "models/gemini-2.0-flash-lite",
    ]

    last_error: Optional[Exception] = None
    for model_name in candidate_models:
        try:
            model = genai.GenerativeModel(model_name)
            # Pass raw bytes — the SDK handles base64 encoding internally.
            image_part = {"mime_type": mime_type, "data": image_bytes}

            def _call(_model=model, _prompt=prompt, _part=image_part):
                return _model.generate_content([_prompt, _part])

            response = await loop.run_in_executor(None, _call)
            text = (getattr(response, "text", None) or str(response)).strip()

            # Strip any accidental markdown code fences.
            text = re.sub(r"^```(?:json)?[\s]*", "", text, flags=re.MULTILINE)
            text = re.sub(r"[\s]*```$", "", text, flags=re.MULTILINE)
            text = text.strip()

            try:
                return json.loads(text)
            except json.JSONDecodeError:
                # Try to extract a JSON object embedded in extra text.
                match = re.search(r"\{.*\}", text, re.DOTALL)
                if match:
                    return json.loads(match.group())
                last_error = json.JSONDecodeError("no JSON object found", text, 0)
                continue

        except Exception as exc:  # noqa: BLE001
            last_error = exc
            continue

    reason = f"{type(last_error).__name__}: {last_error}" if last_error else "Unknown"
    return {"type": "error", "message": f"Image analysis failed: {reason}"}

