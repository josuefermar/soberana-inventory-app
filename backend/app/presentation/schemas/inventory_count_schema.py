from datetime import datetime
from uuid import UUID
from pydantic import BaseModel


class ProductSummary(BaseModel):
    id: UUID
    code: str
    description: str


class CreateInventoryCountRequest(BaseModel):
    product_id: UUID
    packaging_quantity: int


class InventoryCountResponse(BaseModel):
    product: ProductSummary
    packaging_quantity: int
    total_units: int
    created_at: datetime
