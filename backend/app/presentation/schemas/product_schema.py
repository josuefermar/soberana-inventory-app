from uuid import UUID
from pydantic import BaseModel


class ProductResponse(BaseModel):
    id: UUID
    code: str
    description: str
    inventory_unit_id: UUID | None = None
    packaging_unit_id: UUID | None = None
    conversion_factor: float | None = None
