from fastapi import APIRouter, HTTPException

# Use a relative import because this module lives inside `backend.routes`
# and the Pydantic models live in `backend.models.schemas`.
from ..models.schemas import ProductDetails, ScanRequest
from ..services.openfoodfacts_service import fetch_product_by_barcode


router = APIRouter()


@router.post("/scan-product", response_model=ProductDetails)
async def scan_product(payload: ScanRequest):
    """
    Scan a product by barcode and return product details from OpenFoodFacts.

    If the product is not found in OpenFoodFacts, returns HTTP 404.
    """
    product = await fetch_product_by_barcode(payload.barcode)
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found for given barcode.")

    return product

