from datetime import datetime
from typing import Literal
from uuid import UUID
from pydantic import BaseModel


class CreateInventorySessionRequest(BaseModel):
    warehouse_id: UUID
    month: datetime
    created_by: UUID


SessionStatus = Literal["OPEN", "CLOSED"]


class InventorySessionResponse(BaseModel):
    id: UUID
    warehouse_id: UUID
    month: datetime
    count_number: int
    created_by_id: UUID
    created_by_name: str | None = None
    created_at: datetime
    closed_at: datetime | None
    status: SessionStatus


class InventorySessionListResponse(BaseModel):
    id: UUID
    warehouse_id: UUID
    warehouse_description: str
    month: datetime
    count_number: int
    created_by_id: UUID
    created_by_name: str
    created_at: datetime
    closed_at: datetime | None
    status: SessionStatus
    products_count: int


class AddSessionProductsRequest(BaseModel):
    product_ids: list[UUID]