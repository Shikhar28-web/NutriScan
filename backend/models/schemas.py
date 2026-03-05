from typing import Dict, Optional

from pydantic import BaseModel, Field


class ScanRequest(BaseModel):
    """Request body for scanning a product by barcode."""

    barcode: str = Field(..., description="EAN/UPC barcode of the packaged food item.")


class ProductDetails(BaseModel):
    """Basic product information returned from a scan or analysis."""

    barcode: str
    product_name: Optional[str] = None
    brand: Optional[str] = None
    ingredients_text: Optional[str] = None
    nutriments: Dict[str, float] = Field(
        default_factory=dict,
        description="Key nutrition fields (e.g., sugar_100g, fat_100g, energy_kcal, etc.).",
    )


class AnalyzeFoodRequest(BaseModel):
    """Request body for running ML analysis on a scanned food item."""

    barcode: str = Field(..., description="Barcode of the product to analyze.")


class AnalyzeFoodResponse(BaseModel):
    """Combined output from ML analysis of a food item."""

    product: ProductDetails
    health_score: float = Field(..., ge=0, le=100, description="Overall health score (0–100).")
    disease_risks: Dict[str, Dict[str, float]] = Field(
        ...,
        description=(
            "Per-disease risk output, e.g. "
            "{'diabetes': {'risk': 0.7, 'confidence': 0.8}}. "
            "Risk is a normalized score in [0, 1]."
        ),
    )
    ingredient_analysis: Optional[str] = Field(
        default=None,
        description="LLM-generated explanation of ingredient pros/cons and overall summary.",
    )


class RecommendationItem(BaseModel):
    """Single recommendation with its scores."""

    product: ProductDetails
    health_score: float = Field(..., ge=0, le=100)
    disease_risks: Dict[str, Dict[str, float]]

