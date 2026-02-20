from datetime import datetime
from uuid import UUID
from pydantic import BaseModel


class CreateInventorySessionRequest(BaseModel):
    warehouse_id: UUID
    month: datetime
    created_by: UUID

class InventorySessionResponse(BaseModel):
    id: UUID
    warehouse_id: UUID
    month: datetime
    count_number: int
    created_by: UUID
    created_at: datetime
    closed_at: datetime | None


class InventorySessionListResponse(BaseModel):
    id: UUID
    warehouse_id: UUID
    warehouse_description: str
    month: datetime
    count_number: int
    created_at: datetime
    closed_at: datetime | None
    products_count: int


class AddSessionProductsRequest(BaseModel):
    product_ids: list[UUID]