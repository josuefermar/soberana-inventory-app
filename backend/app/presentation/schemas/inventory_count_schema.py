from datetime import datetime
from uuid import UUID
from pydantic import BaseModel


class ProductSummary(BaseModel):
    id: UUID
    code: str
    description: str
    conversion_factor: float


class MeasureUnitSummary(BaseModel):
    id: UUID
    name: str
    abbreviation: str


class CreateInventoryCountRequest(BaseModel):
    product_id: UUID
    packaging_quantity: int
    measure_unit_id: UUID | None = None  # Optional: default from product.packaging_unit_id


class InventoryCountResponse(BaseModel):
    product: ProductSummary
    measure_unit: MeasureUnitSummary | None = None
    packaging_quantity: int
    total_units: int
    created_at: datetime
