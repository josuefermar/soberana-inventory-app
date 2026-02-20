from dataclasses import dataclass
from datetime import datetime
from uuid import UUID

@dataclass
class InventorySession:
    id: UUID
    warehouse_id: UUID
    month: datetime
    count_number: int
    created_by: UUID
    created_at: datetime
    closed_at: datetime | None
