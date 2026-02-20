from datetime import datetime
from uuid import UUID
from pydantic import BaseModel

class CreateInventorySessionRequest(BaseModel):
    warehouse_id: UUID
    month: datetime
    count_number: int
    created_by: UUID

class InventorySessionResponse(BaseModel):
    id: UUID
    warehouse_id: UUID
    month: datetime
    count_number: int
    created_by: UUID
    created_at: datetime
    closed_at: datetime | None