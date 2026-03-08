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
from ..services.openfoodfacts_service import fetch_product_by_barcode, search_product_by_name


router = APIRouter()


@router.post("/analyze-food", response_model=AnalyzeFoodResponse)
async def analyze_food(payload: AnalyzeFoodRequest):
    """
    Run ML-style analysis of a food product.
    Accepts either a barcode or a product name (or both).
    """
    if not payload.has_query():
        raise HTTPException(status_code=422, detail="Provide either 'barcode' or 'product_name'.")

    product = None

    # Try barcode first
    if payload.barcode:
        cleaned = payload.barcode.strip()
        product = await fetch_product_by_barcode(cleaned)

    # Fall back to name search if barcode failed or no barcode given
    if product is None and payload.product_name:
        product = await search_product_by_name(payload.product_name.strip())

    # If barcode given but no name, try name-search using the barcode as a keyword too
    if product is None and payload.barcode and not payload.barcode.strip().isdigit():
        product = await search_product_by_name(payload.barcode.strip())

    if product is None:
        detail = (
            f"Product not found for barcode '{payload.barcode}'." if payload.barcode
            else f"No product found matching '{payload.product_name}'."
        )
        raise HTTPException(status_code=404, detail=detail)

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

