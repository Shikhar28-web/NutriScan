from fastapi import APIRouter, HTTPException

from ..models.schemas import (
    AnalyzeFoodRequest,
    AnalyzeFoodResponse,
)
from ..services.llm_service import explain_ingredients
from ..services.ml_service import compute_health_score, predict_disease_risks
from ..services.openfoodfacts_service import fetch_product_by_barcode


router = APIRouter()


@router.post("/analyze-food", response_model=AnalyzeFoodResponse)
async def analyze_food(payload: AnalyzeFoodRequest):
    """
    Run ML-style analysis of a food product:
    - Fetch product + nutriments from OpenFoodFacts.
    - Compute health score and disease risk scores via ML logic.
    - Use an LLM (Gemini) only to explain pros/cons of ingredients and summarize.
    """
    product = await fetch_product_by_barcode(payload.barcode)
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found for given barcode.")

    health_score = compute_health_score(product.nutriments)
    disease_risks = predict_disease_risks(product.nutriments)

    ingredient_analysis = await explain_ingredients(
        product.ingredients_text,
        product.nutriments,
        health_score,
        disease_risks,
    )

    return AnalyzeFoodResponse(
        product=product,
        health_score=health_score,
        disease_risks=disease_risks,
        ingredient_analysis=ingredient_analysis,
    )

