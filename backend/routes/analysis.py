from fastapi import APIRouter, HTTPException

from ..models.schemas import (
    AnalyzeFoodRequest,
    AnalyzeFoodResponse,
)
from ..services.llm_service import explain_ingredients
from ..services.ml_service import (
    compute_health_score,
    predict_disease_risks,
    compute_processing_level,
    compute_age_group_impacts,
    compute_consumption_disclaimer,
)
from ..services.openfoodfacts_service import fetch_product_by_barcode


router = APIRouter()


@router.post("/analyze-food", response_model=AnalyzeFoodResponse)
async def analyze_food(payload: AnalyzeFoodRequest):
    """
    Run ML-style analysis of a food product:
    - Fetch product + nutriments from OpenFoodFacts.
    - Compute health score and disease risk scores via ML logic.
    - Compute per-age-group impact assessment.
    - Generate consumption frequency disclaimer.
    - Use an LLM (Gemini) only to explain pros/cons of ingredients and summarize.
    """
    product = await fetch_product_by_barcode(payload.barcode)
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found for given barcode.")

    health_score           = compute_health_score(product.nutriments)
    disease_risks          = predict_disease_risks(product.nutriments)
    processing_level       = compute_processing_level(product.nutriments, product.ingredients_text or "")
    age_group_impacts      = compute_age_group_impacts(product.nutriments)
    consumption_disclaimer = compute_consumption_disclaimer(product.nutriments, health_score)

    ingredient_analysis = await explain_ingredients(
        product.ingredients_text,
        product.nutriments,
        health_score,
        disease_risks,
        age_group_impacts,
        processing_level,
    )

    return AnalyzeFoodResponse(
        product=product,
        health_score=health_score,
        disease_risks=disease_risks,
        processing_level=processing_level,
        age_group_impacts=age_group_impacts,
        consumption_disclaimer=consumption_disclaimer,
        ingredient_analysis=ingredient_analysis,
    )
