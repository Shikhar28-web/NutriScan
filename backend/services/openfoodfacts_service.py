from typing import Optional

import httpx

from ..config import get_settings
from ..models.schemas import ProductDetails


async def fetch_product_by_barcode(barcode: str) -> Optional[ProductDetails]:
    """
    Fetch product information from the OpenFoodFacts API using a barcode.

    Returns:
        ProductDetails if the product is found, otherwise None.

    Any HTTP or network error from OpenFoodFacts is caught and returns None
    so callers always get a clean 404 rather than an unhandled 500.
    """
    settings = get_settings()
    url = f"{settings.OPENFOODFACTS_BASE_URL}/product/{barcode}.json"

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(url)
            response.raise_for_status()
            data = response.json()
    except httpx.HTTPError:
        # Covers HTTPStatusError (4xx/5xx) and network-level errors
        # (ConnectError, ReadTimeout, etc.).
        return None

    # OpenFoodFacts uses "status": 1 for found, 0 for not found.
    if data.get("status") != 1:
        return None

    product = data.get("product", {}) or {}
    nutriments = product.get("nutriments", {}) or {}

    # Fiber: OFF uses 'fiber_100g'; some older entries use 'fibers_100g'.
    fiber_val = (
        nutriments.get("fiber_100g")
        or nutriments.get("fibers_100g")
        or 0.0
    )

    # Normalize the key nutriments we care about.
    normalized_nutriments = {
        "sugar_100g":         float(nutriments.get("sugars_100g") or 0.0),
        "fat_100g":           float(nutriments.get("fat_100g") or 0.0),
        "saturated_fat_100g": float(nutriments.get("saturated-fat_100g") or 0.0),
        "salt_100g":          float(nutriments.get("salt_100g") or 0.0),
        "fiber_100g":         float(fiber_val),
        "additives_count":    float(product.get("additives_n") or 0.0),
        "energy_kcal":        float(
            nutriments.get("energy-kcal_100g")
            or nutriments.get("energy_kcal")
            or 0.0
        ),
        # NOVA group (1–4) from OpenFoodFacts; 0 means not available.
        "nova_group":         float(product.get("nova_group") or 0.0),
    }

    return ProductDetails(
        barcode=barcode,
        product_name=product.get("product_name"),
        brand=(product.get("brands") or "").split(",")[0].strip() or None,
        ingredients_text=product.get("ingredients_text"),
        nutriments=normalized_nutriments,
    )
