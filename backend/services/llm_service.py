import asyncio
from typing import Dict, Optional

import google.generativeai as genai

from ..config import get_settings


_resolved_model_name: Optional[str] = None


def _build_ingredient_prompt(
    ingredients_text: str,
    nutriments: Dict[str, float],
    health_score: float,
    disease_risks: Dict[str, float],
) -> str:
    """
    Build a prompt for Gemini that explains pros/cons of ingredients.

    The LLM is ONLY allowed to explain and summarize; it must not
    override the numeric scores from the ML models.
    """
    return f"""
You are a nutrition expert explaining packaged food ingredients.

RULES:
- DO NOT change or guess any numeric scores.
- Use the provided health_score and disease_risks as ground truth from ML models.
- Your job is ONLY to explain pros and cons of ingredients and give a brief summary.
- Focus on evidence-based, general guidance (no medical diagnosis).
- ALWAYS answer in clear Markdown with the exact sections requested below.

Given:
- ingredients_text: {ingredients_text!r}
- nutriments (per 100g): {nutriments}
- ML health_score (0-100): {health_score}
- ML disease_risks (0-1): {disease_risks}

Explain in this EXACT structure (Markdown, no extra sections, no introduction before the headings):

### Ingredient Pros
- One bullet per beneficial ingredient or positive aspect.
- Be specific (e.g., "Rice noodles provide complex carbohydrates for energy.")

### Ingredient Cons
- One bullet per risky ingredient or negative aspect.
- Mention if something is high in sugar, fat, salt, additives, or refined carbs.

### Overall Summary
- 2-3 short sentences connecting the ingredients to:
  - health_score (0-100)
  - each disease_risk (diabetes, heart_disease, obesity, hypertension)

### Who Should Be Careful
- Short bullets calling out which groups should be more careful (e.g., people with diabetes, heart disease, obesity, hypertension) and why.
"""


async def explain_ingredients(
    ingredients_text: Optional[str],
    nutriments: Dict[str, float],
    health_score: float,
    disease_risks: Dict[str, float],
) -> str:
    """
    Use Gemini to generate a human-readable explanation of ingredient pros/cons.

    If the Gemini API key is not configured, returns a fallback explanation.
    """
    if not ingredients_text:
        return "No ingredient list available to analyze."

    settings = get_settings()
    if not settings.GEMINI_API_KEY:
        return (
            "LLM ingredient analysis is unavailable because GEMINI_API_KEY is not configured. "
            "Numeric scores are still computed by ML logic."
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
        "gemini-1.5-flash",
        "gemini-pro",
        "models/gemini-1.5-flash",
    ]

    prompt = _build_ingredient_prompt(ingredients_text, nutriments, health_score, disease_risks)
    loop = asyncio.get_event_loop()

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
    return (
        "LLM ingredient explanation is temporarily unavailable "
        f"(reason: {reason}). Numeric scores are still valid."
    )

