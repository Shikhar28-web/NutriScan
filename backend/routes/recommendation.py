from typing import List

from fastapi import APIRouter, HTTPException, Query

from ..models.schemas import RecommendationItem
from ..services.ml_service import compute_health_score, predict_disease_risks
from ..services.openfoodfacts_service import fetch_product_by_barcode


router = APIRouter()


@router.get("/recommendations", response_model=List[RecommendationItem])
async def get_recommendations(
    barcode: str = Query(..., description="Barcode of the reference product."),
):
    """
    Return healthier alternative recommendations for a given product.

    For now this is a stub that:
    - Fetches the reference product.
    - Computes its health score and risks.
    - Returns that as a single 'self-recommendation' item.

    Later, this will:
    - Use a product database + FAISS to find similar but healthier products.
    """
    product = await fetch_product_by_barcode(barcode)
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found for given barcode.")

    health_score = compute_health_score(product.nutriments)
    disease_risks = predict_disease_risks(product.nutriments)

    # Stub: return the same product as a placeholder recommendation.
    return [
        RecommendationItem(
            product=product,
            health_score=health_score,
            disease_risks=disease_risks,
        )
    ]
